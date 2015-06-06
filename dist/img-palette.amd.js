define("ImgPalette", [], function() { return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, '__esModule', {
	  value: true
	});

	var _createClass = (function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ('value' in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

	var _quantize = __webpack_require__(1);

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
	    this.quality = quality;
	    this.colorCount = colorCount;

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
	        var alpha = imagePixels[offset + 3];

	        if (alpha >= 125 && rgb[0] <= 250 && rgb[1] <= 250 && rgb[2] <= 250) {
	          pixelData.push(rgb);
	        }
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

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	/*
	 * quantize.js Copyright 2008 Nick Rabinowitz
	 * Ported to node.js by Olivier Lesnicki
	 * Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php
	 */

	// fill out a couple protovis dependencies
	/*
	 * Block below copied from Protovis: http://mbostock.github.com/protovis/
	 * Copyright 2010 Stanford Visualization Group
	 * Licensed under the BSD License: http://www.opensource.org/licenses/bsd-license.php
	 */
	if (!pv) {
	    var pv = {
	        map: function(array, f) {
	            var o = {};
	            return f ? array.map(function(d, i) {
	                o.index = i;
	                return f.call(o, d);
	            }) : array.slice();
	        },
	        naturalOrder: function(a, b) {
	            return (a < b) ? -1 : ((a > b) ? 1 : 0);
	        },
	        sum: function(array, f) {
	            var o = {};
	            return array.reduce(f ? function(p, d, i) {
	                o.index = i;
	                return p + f.call(o, d);
	            } : function(p, d) {
	                return p + d;
	            }, 0);
	        },
	        max: function(array, f) {
	            return Math.max.apply(null, f ? pv.map(array, f) : array);
	        }
	    }
	}

	/**
	 * Basic Javascript port of the MMCQ (modified median cut quantization)
	 * algorithm from the Leptonica library (http://www.leptonica.com/).
	 * Returns a color map you can use to map original pixels to the reduced
	 * palette. Still a work in progress.
	 * 
	 * @author Nick Rabinowitz
	 * @example
	 
	// array of pixels as [R,G,B] arrays
	var myPixels = [[190,197,190], [202,204,200], [207,214,210], [211,214,211], [205,207,207]
	                // etc
	                ];
	var maxColors = 4;
	 
	var cmap = MMCQ.quantize(myPixels, maxColors);
	var newPalette = cmap.palette();
	var newPixels = myPixels.map(function(p) { 
	    return cmap.map(p); 
	});
	 
	 */
	var MMCQ = (function() {
	    // private constants
	    var sigbits = 5,
	        rshift = 8 - sigbits,
	        maxIterations = 1000,
	        fractByPopulations = 0.75;

	    // get reduced-space color index for a pixel

	    function getColorIndex(r, g, b) {
	        return (r << (2 * sigbits)) + (g << sigbits) + b;
	    }

	    // Simple priority queue

	    function PQueue(comparator) {
	        var contents = [],
	            sorted = false;

	        function sort() {
	            contents.sort(comparator);
	            sorted = true;
	        }

	        return {
	            push: function(o) {
	                contents.push(o);
	                sorted = false;
	            },
	            peek: function(index) {
	                if (!sorted) sort();
	                if (index === undefined) index = contents.length - 1;
	                return contents[index];
	            },
	            pop: function() {
	                if (!sorted) sort();
	                return contents.pop();
	            },
	            size: function() {
	                return contents.length;
	            },
	            map: function(f) {
	                return contents.map(f);
	            },
	            debug: function() {
	                if (!sorted) sort();
	                return contents;
	            }
	        };
	    }

	    // 3d color space box

	    function VBox(r1, r2, g1, g2, b1, b2, histo) {
	        var vbox = this;
	        vbox.r1 = r1;
	        vbox.r2 = r2;
	        vbox.g1 = g1;
	        vbox.g2 = g2;
	        vbox.b1 = b1;
	        vbox.b2 = b2;
	        vbox.histo = histo;
	    }
	    VBox.prototype = {
	        volume: function(force) {
	            var vbox = this;
	            if (!vbox._volume || force) {
	                vbox._volume = ((vbox.r2 - vbox.r1 + 1) * (vbox.g2 - vbox.g1 + 1) * (vbox.b2 - vbox.b1 + 1));
	            }
	            return vbox._volume;
	        },
	        count: function(force) {
	            var vbox = this,
	                histo = vbox.histo;
	            if (!vbox._count_set || force) {
	                var npix = 0,
	                    i, j, k;
	                for (i = vbox.r1; i <= vbox.r2; i++) {
	                    for (j = vbox.g1; j <= vbox.g2; j++) {
	                        for (k = vbox.b1; k <= vbox.b2; k++) {
	                            index = getColorIndex(i, j, k);
	                            npix += (histo[index] || 0);
	                        }
	                    }
	                }
	                vbox._count = npix;
	                vbox._count_set = true;
	            }
	            return vbox._count;
	        },
	        copy: function() {
	            var vbox = this;
	            return new VBox(vbox.r1, vbox.r2, vbox.g1, vbox.g2, vbox.b1, vbox.b2, vbox.histo);
	        },
	        avg: function(force) {
	            var vbox = this,
	                histo = vbox.histo;
	            if (!vbox._avg || force) {
	                var ntot = 0,
	                    mult = 1 << (8 - sigbits),
	                    rsum = 0,
	                    gsum = 0,
	                    bsum = 0,
	                    hval,
	                    i, j, k, histoindex;
	                for (i = vbox.r1; i <= vbox.r2; i++) {
	                    for (j = vbox.g1; j <= vbox.g2; j++) {
	                        for (k = vbox.b1; k <= vbox.b2; k++) {
	                            histoindex = getColorIndex(i, j, k);
	                            hval = histo[histoindex] || 0;
	                            ntot += hval;
	                            rsum += (hval * (i + 0.5) * mult);
	                            gsum += (hval * (j + 0.5) * mult);
	                            bsum += (hval * (k + 0.5) * mult);
	                        }
	                    }
	                }
	                if (ntot) {
	                    vbox._avg = [~~(rsum / ntot), ~~ (gsum / ntot), ~~ (bsum / ntot)];
	                } else {
	                    //console.log('empty box');
	                    vbox._avg = [~~(mult * (vbox.r1 + vbox.r2 + 1) / 2), ~~ (mult * (vbox.g1 + vbox.g2 + 1) / 2), ~~ (mult * (vbox.b1 + vbox.b2 + 1) / 2)];
	                }
	            }
	            return vbox._avg;
	        },
	        contains: function(pixel) {
	            var vbox = this,
	                rval = pixel[0] >> rshift;
	            gval = pixel[1] >> rshift;
	            bval = pixel[2] >> rshift;
	            return (rval >= vbox.r1 && rval <= vbox.r2 &&
	                gval >= vbox.g1 && gval <= vbox.g2 &&
	                bval >= vbox.b1 && bval <= vbox.b2);
	        }
	    };

	    // Color map

	    function CMap() {
	        this.vboxes = new PQueue(function(a, b) {
	            return pv.naturalOrder(
	                a.vbox.count() * a.vbox.volume(),
	                b.vbox.count() * b.vbox.volume()
	            )
	        });;
	    }
	    CMap.prototype = {
	        push: function(vbox) {
	            this.vboxes.push({
	                vbox: vbox,
	                color: vbox.avg()
	            });
	        },
	        palette: function() {
	            return this.vboxes.map(function(vb) {
	                return vb.color
	            });
	        },
	        size: function() {
	            return this.vboxes.size();
	        },
	        map: function(color) {
	            var vboxes = this.vboxes;
	            for (var i = 0; i < vboxes.size(); i++) {
	                if (vboxes.peek(i).vbox.contains(color)) {
	                    return vboxes.peek(i).color;
	                }
	            }
	            return this.nearest(color);
	        },
	        nearest: function(color) {
	            var vboxes = this.vboxes,
	                d1, d2, pColor;
	            for (var i = 0; i < vboxes.size(); i++) {
	                d2 = Math.sqrt(
	                    Math.pow(color[0] - vboxes.peek(i).color[0], 2) +
	                    Math.pow(color[1] - vboxes.peek(i).color[1], 2) +
	                    Math.pow(color[2] - vboxes.peek(i).color[2], 2)
	                );
	                if (d2 < d1 || d1 === undefined) {
	                    d1 = d2;
	                    pColor = vboxes.peek(i).color;
	                }
	            }
	            return pColor;
	        },
	        forcebw: function() {
	            // XXX: won't  work yet
	            var vboxes = this.vboxes;
	            vboxes.sort(function(a, b) {
	                return pv.naturalOrder(pv.sum(a.color), pv.sum(b.color))
	            });

	            // force darkest color to black if everything < 5
	            var lowest = vboxes[0].color;
	            if (lowest[0] < 5 && lowest[1] < 5 && lowest[2] < 5)
	                vboxes[0].color = [0, 0, 0];

	            // force lightest color to white if everything > 251
	            var idx = vboxes.length - 1,
	                highest = vboxes[idx].color;
	            if (highest[0] > 251 && highest[1] > 251 && highest[2] > 251)
	                vboxes[idx].color = [255, 255, 255];
	        }
	    };

	    // histo (1-d array, giving the number of pixels in
	    // each quantized region of color space), or null on error

	    function getHisto(pixels) {
	        var histosize = 1 << (3 * sigbits),
	            histo = new Array(histosize),
	            index, rval, gval, bval;
	        pixels.forEach(function(pixel) {
	            rval = pixel[0] >> rshift;
	            gval = pixel[1] >> rshift;
	            bval = pixel[2] >> rshift;
	            index = getColorIndex(rval, gval, bval);
	            histo[index] = (histo[index] || 0) + 1;
	        });
	        return histo;
	    }

	    function vboxFromPixels(pixels, histo) {
	        var rmin = 1000000,
	            rmax = 0,
	            gmin = 1000000,
	            gmax = 0,
	            bmin = 1000000,
	            bmax = 0,
	            rval, gval, bval;
	        // find min/max
	        pixels.forEach(function(pixel) {
	            rval = pixel[0] >> rshift;
	            gval = pixel[1] >> rshift;
	            bval = pixel[2] >> rshift;
	            if (rval < rmin) rmin = rval;
	            else if (rval > rmax) rmax = rval;
	            if (gval < gmin) gmin = gval;
	            else if (gval > gmax) gmax = gval;
	            if (bval < bmin) bmin = bval;
	            else if (bval > bmax) bmax = bval;
	        });
	        return new VBox(rmin, rmax, gmin, gmax, bmin, bmax, histo);
	    }

	    function medianCutApply(histo, vbox) {
	        if (!vbox.count()) return;

	        var rw = vbox.r2 - vbox.r1 + 1,
	            gw = vbox.g2 - vbox.g1 + 1,
	            bw = vbox.b2 - vbox.b1 + 1,
	            maxw = pv.max([rw, gw, bw]);
	        // only one pixel, no split
	        if (vbox.count() == 1) {
	            return [vbox.copy()]
	        }
	        /* Find the partial sum arrays along the selected axis. */
	        var total = 0,
	            partialsum = [],
	            lookaheadsum = [],
	            i, j, k, sum, index;
	        if (maxw == rw) {
	            for (i = vbox.r1; i <= vbox.r2; i++) {
	                sum = 0;
	                for (j = vbox.g1; j <= vbox.g2; j++) {
	                    for (k = vbox.b1; k <= vbox.b2; k++) {
	                        index = getColorIndex(i, j, k);
	                        sum += (histo[index] || 0);
	                    }
	                }
	                total += sum;
	                partialsum[i] = total;
	            }
	        } else if (maxw == gw) {
	            for (i = vbox.g1; i <= vbox.g2; i++) {
	                sum = 0;
	                for (j = vbox.r1; j <= vbox.r2; j++) {
	                    for (k = vbox.b1; k <= vbox.b2; k++) {
	                        index = getColorIndex(j, i, k);
	                        sum += (histo[index] || 0);
	                    }
	                }
	                total += sum;
	                partialsum[i] = total;
	            }
	        } else { /* maxw == bw */
	            for (i = vbox.b1; i <= vbox.b2; i++) {
	                sum = 0;
	                for (j = vbox.r1; j <= vbox.r2; j++) {
	                    for (k = vbox.g1; k <= vbox.g2; k++) {
	                        index = getColorIndex(j, k, i);
	                        sum += (histo[index] || 0);
	                    }
	                }
	                total += sum;
	                partialsum[i] = total;
	            }
	        }
	        partialsum.forEach(function(d, i) {
	            lookaheadsum[i] = total - d
	        });

	        function doCut(color) {
	            var dim1 = color + '1',
	                dim2 = color + '2',
	                left, right, vbox1, vbox2, d2, count2 = 0;
	            for (i = vbox[dim1]; i <= vbox[dim2]; i++) {
	                if (partialsum[i] > total / 2) {
	                    vbox1 = vbox.copy();
	                    vbox2 = vbox.copy();
	                    left = i - vbox[dim1];
	                    right = vbox[dim2] - i;
	                    if (left <= right)
	                        d2 = Math.min(vbox[dim2] - 1, ~~ (i + right / 2));
	                    else d2 = Math.max(vbox[dim1], ~~ (i - 1 - left / 2));
	                    // avoid 0-count boxes
	                    while (!partialsum[d2]) d2++;
	                    count2 = lookaheadsum[d2];
	                    while (!count2 && partialsum[d2 - 1]) count2 = lookaheadsum[--d2];
	                    // set dimensions
	                    vbox1[dim2] = d2;
	                    vbox2[dim1] = vbox1[dim2] + 1;
	                    // console.log('vbox counts:', vbox.count(), vbox1.count(), vbox2.count());
	                    return [vbox1, vbox2];
	                }
	            }

	        }
	        // determine the cut planes
	        return maxw == rw ? doCut('r') :
	            maxw == gw ? doCut('g') :
	            doCut('b');
	    }

	    function quantize(pixels, maxcolors) {
	        // short-circuit
	        if (!pixels.length || maxcolors < 2 || maxcolors > 256) {
	            // console.log('wrong number of maxcolors');
	            return false;
	        }

	        // XXX: check color content and convert to grayscale if insufficient

	        var histo = getHisto(pixels),
	            histosize = 1 << (3 * sigbits);

	        // check that we aren't below maxcolors already
	        var nColors = 0;
	        histo.forEach(function() {
	            nColors++
	        });
	        if (nColors <= maxcolors) {
	            // XXX: generate the new colors from the histo and return
	        }

	        // get the beginning vbox from the colors
	        var vbox = vboxFromPixels(pixels, histo),
	            pq = new PQueue(function(a, b) {
	                return pv.naturalOrder(a.count(), b.count())
	            });
	        pq.push(vbox);

	        // inner function to do the iteration

	        function iter(lh, target) {
	            var ncolors = 1,
	                niters = 0,
	                vbox;
	            while (niters < maxIterations) {
	                vbox = lh.pop();
	                if (!vbox.count()) { /* just put it back */
	                    lh.push(vbox);
	                    niters++;
	                    continue;
	                }
	                // do the cut
	                var vboxes = medianCutApply(histo, vbox),
	                    vbox1 = vboxes[0],
	                    vbox2 = vboxes[1];

	                if (!vbox1) {
	                    // console.log("vbox1 not defined; shouldn't happen!");
	                    return;
	                }
	                lh.push(vbox1);
	                if (vbox2) { /* vbox2 can be null */
	                    lh.push(vbox2);
	                    ncolors++;
	                }
	                if (ncolors >= target) return;
	                if (niters++ > maxIterations) {
	                    // console.log("infinite loop; perhaps too few pixels!");
	                    return;
	                }
	            }
	        }

	        // first set of colors, sorted by population
	        iter(pq, fractByPopulations * maxcolors);
	        // console.log(pq.size(), pq.debug().length, pq.debug().slice());

	        // Re-sort by the product of pixel occupancy times the size in color space.
	        var pq2 = new PQueue(function(a, b) {
	            return pv.naturalOrder(a.count() * a.volume(), b.count() * b.volume())
	        });
	        while (pq.size()) {
	            pq2.push(pq.pop());
	        }

	        // next set - generate the median cuts using the (npix * vol) sorting.
	        iter(pq2, maxcolors - pq2.size());

	        // calculate the actual colors
	        var cmap = new CMap();
	        while (pq2.size()) {
	            cmap.push(pq2.pop());
	        }

	        return cmap;
	    }

	    return {
	        quantize: quantize
	    }
	})();

	module.exports = MMCQ.quantize


/***/ }
/******/ ])});;