'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

var _quantize = require('quantize');

var _quantize2 = _interopRequireDefault(_quantize);

var DEFAULT_CALCULATE_NUMBER_COLORS = 16;

var TARGET_DARK_LUMA = 0.26;
var MAX_DARK_LUMA = 0.45;

var MIN_LIGHT_LUMA = 0.55;
var TARGET_LIGHT_LUMA = 0.74;

var MIN_NORMAL_LUMA = 0.3;
var TARGET_NORMAL_LUMA = 0.5;
var MAX_NORMAL_LUMA = 0.7;

var TARGET_MUTED_SATURATION = 0.3;
var MAX_MUTED_SATURATION = 0.4;

var TARGET_VIBRANT_SATURATION = 1;
var MIN_VIBRANT_SATURATION = 0.35;

function weightedMean() {
  for (var _len = arguments.length, values = Array(_len), _key = 0; _key < _len; _key++) {
    values[_key] = arguments[_key];
  }

  var sum = 0;
  var sumWeight = 0;

  for (var i = 0; i < values.length; i += 2) {
    var value = values[i];
    var weight = values[i + 1];
    sum += value * weight;
    sumWeight += weight;
  }

  return sum / sumWeight;
}

function invertDiff(value, targetValue) {
  return 1 - Math.abs(value - targetValue);
}

var Swatch = (function () {
  function Swatch(rgb, population) {
    _classCallCheck(this, Swatch);

    this.rgb = rgb;
    this.red = rgb[0];
    this.green = rgb[1];
    this.blue = rgb[2];
    this.population = population;
  }

  _createClass(Swatch, [{
    key: 'getHsl',
    value: function getHsl() {
      var rf = this.rgb[0] / 255;
      var gf = this.rgb[1] / 255;
      var bf = this.rgb[2] / 255;

      var max = Math.max(rf, gf, bf);
      var min = Math.min(rf, gf, bf);
      var deltaMaxMin = max - min;

      var h = undefined;
      var s = undefined;
      var l = (max + min) / 2;

      if (deltaMaxMin === 0) {
        // Monochromatic
        h = s = 0;
      } else {
        if (max === rf) {
          h = (gf - bf) / deltaMaxMin % 6;
        } else if (max === gf) {
          h = (bf - rf) / deltaMaxMin + 2;
        } else {
          h = (rf - gf) / deltaMaxMin + 4;
        }

        s = deltaMaxMin / (1 - Math.abs(2 * l - 1));
      }

      return [h * 60 % 360, s, l];
    }
  }]);

  return Swatch;
})();

Swatch.fromHsl = function fromHsl(hsl, population) {
  var h = hsl[0];
  var s = hsl[1];
  var l = hsl[2];

  var c = (1 - Math.abs(2 * l - 1)) * s;
  var m = l - 0.5 * c;
  var x = c * (1 - Math.abs(h / 60 % 2 - 1));

  var hueSegment = ~ ~h / 60;

  var r = 0;
  var g = 0;
  var b = 0;

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

var CanvasImage = (function () {
  function CanvasImage(image) {
    _classCallCheck(this, CanvasImage);

    this.canvas = document.createElement('canvas');
    this.context = this.canvas.getContext('2d');
    this.canvas.width = image.width;
    this.canvas.height = image.height;
    this.context.drawImage(image, 0, 0, image.width, image.height);

    this.pixelCount = image.width * image.height;
  }

  _createClass(CanvasImage, [{
    key: 'getImageData',
    value: function getImageData() {
      return this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
    }
  }]);

  return CanvasImage;
})();

var Palette = (function () {
  function Palette(image) {
    var quality = arguments[1] === undefined ? 5 : arguments[1];
    var colorCount = arguments[2] === undefined ? DEFAULT_CALCULATE_NUMBER_COLORS : arguments[2];

    _classCallCheck(this, Palette);

    this.image = image;
    this.quality = Math.max(1, quality);
    this.colorCount = Math.max(1, colorCount);

    this.swatches = this.generateSwatches();
    this.highestPopulation = this.findMaxPopulation();
    this.vibrantSwatch = this.findColor(TARGET_NORMAL_LUMA, MIN_NORMAL_LUMA, MAX_NORMAL_LUMA, TARGET_VIBRANT_SATURATION, MIN_VIBRANT_SATURATION, 1);

    this.lightVibrantSwatch = this.findColor(TARGET_LIGHT_LUMA, MIN_LIGHT_LUMA, 1, TARGET_VIBRANT_SATURATION, MIN_VIBRANT_SATURATION, 1);

    this.darkVibrantSwatch = this.findColor(TARGET_DARK_LUMA, 0, MAX_DARK_LUMA, TARGET_VIBRANT_SATURATION, MIN_VIBRANT_SATURATION, 1);

    this.mutedSwatch = this.findColor(TARGET_NORMAL_LUMA, MIN_NORMAL_LUMA, MAX_NORMAL_LUMA, TARGET_MUTED_SATURATION, 0, MAX_MUTED_SATURATION);

    this.lightMutedSwatch = this.findColor(TARGET_LIGHT_LUMA, MIN_LIGHT_LUMA, 1, TARGET_MUTED_SATURATION, 0, MAX_MUTED_SATURATION);

    this.darkMutedSwatch = this.findColor(TARGET_DARK_LUMA, 0, MAX_DARK_LUMA, TARGET_MUTED_SATURATION, 0, MAX_MUTED_SATURATION);

    this.generateEmptySwatches();
  }

  _createClass(Palette, [{
    key: 'generateSwatches',
    value: function generateSwatches() {
      var canvas = new CanvasImage(this.image);
      var imagePixels = canvas.getImageData().data;

      var pixelData = [];
      for (var i = 0; i < canvas.pixelCount; i += this.quality) {
        var offset = i * 4;
        var rgb = [imagePixels[offset], imagePixels[offset + 1], imagePixels[offset + 2]];
        pixelData.push(rgb);
      }

      var cmap = (0, _quantize2['default'])(pixelData, this.colorCount);
      return cmap.vboxes.map(function (vbox) {
        return new Swatch(vbox.color, vbox.vbox.count());
      });
    }
  }, {
    key: 'findMaxPopulation',
    value: function findMaxPopulation() {
      var population = 0;
      var _iteratorNormalCompletion = true;
      var _didIteratorError = false;
      var _iteratorError = undefined;

      try {
        for (var _iterator = this.swatches[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
          var swatch = _step.value;

          population = Math.max(population, swatch.population);
        }
      } catch (err) {
        _didIteratorError = true;
        _iteratorError = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }
        } finally {
          if (_didIteratorError) {
            throw _iteratorError;
          }
        }
      }

      return population;
    }
  }, {
    key: 'isAlreadySelected',
    value: function isAlreadySelected(swatch) {
      return this.vibrantSwatch === swatch || this.darkVibrantSwatch === swatch || this.lightVibrantSwatch === swatch || this.mutedSwatch === swatch || this.darkMutedSwatch === swatch || this.lightMutedSwatch === swatch;
    }
  }, {
    key: 'findColor',
    value: function findColor(targetLuma, minLuma, maxLuma, targetSaturation, minSaturation, maxSaturation) {
      var max = null;
      var maxValue = 0;

      var _iteratorNormalCompletion2 = true;
      var _didIteratorError2 = false;
      var _iteratorError2 = undefined;

      try {
        for (var _iterator2 = this.swatches[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
          var swatch = _step2.value;

          var hsl = swatch.getHsl();
          var saturation = hsl[1];
          var luma = hsl[2];

          if (saturation >= minSaturation && saturation <= maxSaturation && luma >= minLuma && luma <= maxLuma && !this.isAlreadySelected(swatch)) {
            var thisValue = this.createComparisonValue(saturation, targetSaturation, luma, targetLuma, swatch.population, this.highestPopulation);

            if (max === null || thisValue > maxValue) {
              max = swatch;
              maxValue = thisValue;
            }
          }
        }
      } catch (err) {
        _didIteratorError2 = true;
        _iteratorError2 = err;
      } finally {
        try {
          if (!_iteratorNormalCompletion2 && _iterator2['return']) {
            _iterator2['return']();
          }
        } finally {
          if (_didIteratorError2) {
            throw _iteratorError2;
          }
        }
      }

      return max;
    }
  }, {
    key: 'createComparisonValue',
    value: function createComparisonValue(saturation, targetSaturation, luma, targetLuma, population, highestPopulation) {
      return weightedMean(invertDiff(saturation, targetSaturation), 3, invertDiff(luma, targetLuma), 6.5, population / highestPopulation, 0.5);
    }
  }, {
    key: 'generateEmptySwatches',
    value: function generateEmptySwatches() {
      if (!this.vibrantSwatch && this.darkVibrantSwatch) {
        var hsl = this.darkVibrantSwatch.getHsl().slice();
        hsl[2] = TARGET_NORMAL_LUMA;
        this.vibrantSwatch = Swatch.fromHsl(hsl, 0);
      }

      if (!this.darkVibrantSwatch && this.vibrantSwatch) {
        var hsl = this.vibrantSwatch.getHsl().slice();
        hsl[2] = TARGET_DARK_LUMA;
        this.darkVibrantSwatch = Swatch.fromHsl(hsl, 0);
      }
    }
  }, {
    key: 'getSwatches',
    value: function getSwatches() {
      return {
        vibrant: this.vibrantSwatch,
        darkVibrant: this.darkVibrantSwatch,
        lightVibrant: this.lightVibrantSwatch,
        muted: this.mutedSwatch,
        darkMutedSwatch: this.darkMutedSwatch,
        lightMutedSwatch: this.lightMutedSwatch
      };
    }
  }]);

  return Palette;
})();

exports['default'] = Palette;
module.exports = exports['default'];

