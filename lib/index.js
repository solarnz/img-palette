import quantize from 'quantize';

const DEFAULT_CALCULATE_NUMBER_COLORS = 16;

const TARGET_DARK_LUMA = 0.26;
const MAX_DARK_LUMA = 0.45;

const MIN_LIGHT_LUMA = 0.55;
const TARGET_LIGHT_LUMA = 0.74;

const MIN_NORMAL_LUMA = 0.3;
const TARGET_NORMAL_LUMA = 0.5;
const MAX_NORMAL_LUMA = 0.7;

const TARGET_MUTED_SATURATION = 0.3;
const MAX_MUTED_SATURATION = 0.4;

const TARGET_VIBRANT_SATURATION = 1;
const MIN_VIBRANT_SATURATION = 0.35;

function weightedMean(...values) {
  let sum = 0.0;
  let sumWeight = 0.0;

  for (let i = 0; i < values.length; i += 2) {
    let value = values[i];
    let weight = values[i + 1];
    sum += value * weight;
    sumWeight += weight;
  }

  return sum / sumWeight;
}

function invertDiff(value, targetValue) {
  return 1.0 - Math.abs(value - targetValue);
}

class Swatch {
  constructor(rgb, population) {
    this.rgb = rgb;
    this.red = rgb[0];
    this.green = rgb[1];
    this.blue = rgb[2];
    this.population = population;
  }

  getHsl() {
    let rf = this.rgb[0] / 255.0;
    let gf = this.rgb[1] / 255.0;
    let bf = this.rgb[2] / 255.0;

    let max = Math.max(rf, gf, bf);
    let min = Math.min(rf, gf, bf);
    let deltaMaxMin = max - min;

    let h;
    let s;
    let l = (max + min) / 2.0;

    if (deltaMaxMin === 0) {
      // Monochromatic
      h = s = 0.0;
    } else {
      if (max === rf) {
        h = ((gf - bf) / deltaMaxMin) % 6.0;
      } else if (max === gf) {
        h = ((bf - rf) / deltaMaxMin) + 2.0;
      } else {
        h = ((rf - gf) / deltaMaxMin) + 4.0;
      }

      s = deltaMaxMin / (1.0 - Math.abs(2.0 * l - 1.0));
    }

    return [(h * 60.0) % 360.0, s, l];
  }
}

Swatch.fromHsl = function fromHsl(hsl, population) {
  let h = hsl[0];
  let s = hsl[1];
  let l = hsl[2];

  let c = (1.0 - Math.abs(2 * l - 1.0)) * s;
  let m = l - 0.5 * c;
  let x = c * (1.0 - Math.abs((h / 60.0 % 2.0) - 1.0));

  let hueSegment = ~~h / 60;

  let r = 0;
  let g = 0;
  let b = 0;

  switch (hueSegment) {
    case 0:
      r = Math.round(255 * (c + m));
      g = Math.round(255 * (x + m));
      b = Math.round(255 * m);
      break;
    case 1:
      r = Math.round(255 * (x + m));
      g = Math.round(255 * (c + m));
      b = Math.round(255 * m);
      break;
    case 2:
      r = Math.round(255 * m);
      g = Math.round(255 * (c + m));
      b = Math.round(255 * (x + m));
      break;
    case 3:
      r = Math.round(255 * m);
      g = Math.round(255 * (x + m));
      b = Math.round(255 * (c + m));
      break;
    case 4:
      r = Math.round(255 * (x + m));
      g = Math.round(255 * m);
      b = Math.round(255 * (c + m));
      break;
    case 5:
    case 6:
      r = Math.round(255 * (c + m));
      g = Math.round(255 * m);
      b = Math.round(255 * (x + m));
      break;
    default:
      break;
  }

  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));

  return new Swatch([r, g, b], population);
};

class CanvasImage {
  constructor(image) {
    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.canvas.width = image.width;
    this.canvas.height = image.height;
    this.context.drawImage(image, 0, 0, image.width, image.height);

    this.pixelCount = image.width * image.height;
  }

  getImageData() {
    return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }
}

export default class Palette {
  constructor(image, quality=5, colorCount=DEFAULT_CALCULATE_NUMBER_COLORS) {
    this.image = image;
    this.quality = quality;
    this.colorCount = colorCount;

    this.swatches = this.generateSwatches();
    this.highestPopulation = this.findMaxPopulation();
    this.vibrantSwatch = this.findColor(
      TARGET_NORMAL_LUMA, MIN_NORMAL_LUMA, MAX_NORMAL_LUMA, TARGET_VIBRANT_SATURATION,
      MIN_VIBRANT_SATURATION, 1.0
    );

    this.lightVibrantSwatch = this.findColor(
      TARGET_LIGHT_LUMA, MIN_LIGHT_LUMA, 1.0, TARGET_VIBRANT_SATURATION, MIN_VIBRANT_SATURATION, 1.0
    );

    this.darkVibrantSwatch = this.findColor(
      TARGET_DARK_LUMA, 0.0, MAX_DARK_LUMA, TARGET_VIBRANT_SATURATION, MIN_VIBRANT_SATURATION, 1.0
    );

    this.mutedSwatch = this.findColor(
      TARGET_NORMAL_LUMA, MIN_NORMAL_LUMA, MAX_NORMAL_LUMA, TARGET_MUTED_SATURATION, 0.0,
      MAX_MUTED_SATURATION
    );

    this.lightMutedSwatch = this.findColor(
      TARGET_LIGHT_LUMA, MIN_LIGHT_LUMA, 1.0, TARGET_MUTED_SATURATION, 0.0, MAX_MUTED_SATURATION
    );

    this.darkMutedSwatch = this.findColor(
      TARGET_DARK_LUMA, 0.0, MAX_DARK_LUMA, TARGET_MUTED_SATURATION, 0.0, MAX_MUTED_SATURATION
    );

    this.generateEmptySwatches();
  }

  generateSwatches() {
    let canvas = new CanvasImage(this.image);
    let imagePixels = canvas.getImageData().data;

    let pixelData = [];
    for (let i = 0; i < canvas.pixelCount; i += this.quality) {
      let offset = i * 4;
      let rgb = [imagePixels[offset], imagePixels[offset + 1], imagePixels[offset + 2]];
      let alpha = imagePixels[offset + 3];

      if (alpha >= 125 && rgb[0] <= 250 && rgb[1] <= 250 && rgb[2] <= 250) {
        pixelData.push(rgb);
      }
    }

    let cmap = quantize(pixelData, this.colorCount);
    return cmap.vboxes.map((vbox) => {
      return new Swatch(vbox.color, vbox.vbox.count());
    });
  }

  findMaxPopulation() {
    let population = 0;
    for (let swatch of this.swatches) {
      population = Math.max(population, swatch.population);
    }

    return population;
  }

  isAlreadySelected(swatch) {
    return this.vibrantSwatch === swatch ||
      this.darkVibrantSwatch === swatch ||
      this.lightVibrantSwatch === swatch ||
      this.mutedSwatch === swatch ||
      this.darkMutedSwatch === swatch ||
      this.lightMutedSwatch === swatch;
  }

  findColor(targetLuma, minLuma, maxLuma, targetSaturation, minSaturation,
            maxSaturation) {
    let max = null;
    let maxValue = 0.0;

    for (let swatch of this.swatches) {
      let hsl = swatch.getHsl();
      let saturation = hsl[1];
      let luma = hsl[2];

      if (saturation >= minSaturation &&
          saturation <= maxSaturation &&
          luma >= minLuma &&
          luma <= maxLuma &&
          !this.isAlreadySelected(swatch)) {
        let thisValue = this.createComparisonValue(
          saturation, targetSaturation, luma, targetLuma, swatch.population, this.highestPopulation
        );

        if (max === null || thisValue > maxValue) {
          max = swatch;
          maxValue = thisValue;
        }
      }
    }

    return max;
  }

  createComparisonValue(saturation, targetSaturation, luma, targetLuma, population,
                        highestPopulation) {
    return weightedMean(
      invertDiff(saturation, targetSaturation), 3.0,
      invertDiff(luma, targetLuma), 6.5,
      population / highestPopulation, 0.5
    );
  }

  generateEmptySwatches() {
    if (!this.vibrantSwatch && this.darkVibrantSwatch) {
      let hsl = this.darkVibrantSwatch.getHsl().slice();
      hsl[2] = TARGET_NORMAL_LUMA;
      this.vibrantSwatch = Swatch.fromHsl(hsl, 0);
    }

    if (!this.darkVibrantSwatch && this.vibrantSwatch) {
      let hsl = this.vibrantSwatch.getHsl().slice();
      hsl[2] = TARGET_DARK_LUMA;
      this.darkVibrantSwatch = Swatch.fromHsl(hsl, 0);
    }
  }

  getSwatches() {
    return {
      vibrant: this.vibrantSwatch,
      darkVibrant: this.darkVibrantSwatch,
      lightVibrant: this.lightVibrantSwatch,
      muted: this.mutedSwatch,
      darkMutedSwatch: this.darkMutedSwatch,
      lightMutedSwatch: this.lightMutedSwatch
    };
  }
}
