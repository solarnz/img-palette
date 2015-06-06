window.onload = function() {
    function toRGB(swatch) {
        return "rgb(" + swatch.rgb[0] + ", " + swatch.rgb[1] + ", " + swatch.rgb[2] + ")";
    }

    function calculateImage(tag) {
        var image = document.getElementById(tag);
        var palette = new ImgPalette(image);

        var swatches = ['vibrant', 'lightVibrant', 'darkVibrant', 'muted', 'lightMuted', 'darkMuted'];

        for (var i = 0; i < swatches.length; i++) {
            var swatchName = swatches[i];
            var swatch = palette[swatchName + 'Swatch'];
            var element = document.getElementById(tag + '-' + swatchName);

            if (!swatch) {
                element.parentElement.style.display = 'none';
            } else {
                var vibrant = toRGB(swatch);
                element.style.backgroundColor = vibrant;
            }
        }

        document.getElementById(tag + '-container').style.backgroundColor = toRGB(palette.vibrantSwatch);
    }

    calculateImage('rainbow');
    calculateImage('operahouse');
    calculateImage('rose');
};
