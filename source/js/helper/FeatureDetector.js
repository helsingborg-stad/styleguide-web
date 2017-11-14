HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.FeatureDetector = (function ($) {

    function FeatureDetector() {
        console.log("testing");
        this.detectFlexbox();
        this.detectWebp();
    }

    FeatureDetector.prototype.detectFlexbox = function () {
        if (typeof document.createElement("p").style.flexWrap !== 'undefined' && document.createElement("p").style.flexWrap == '') {
            return true;
        }

        $('html').addClass('no-flexbox');
        return false;
    };

    FeatureDetector.prototype.detectWebp = function () {

        var webPsupport = (function() {
          var webP = new Image();
          webP.onload = WebP.onerror = function () {
            callback(webP.height == 2);
          };
          webP.src = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/veff/0PP8bA//LwYAAA';
        });

        if(webPsupport) {
            $('html').addClass('webp');
        } else {
            $('html').addClass('no-webp');
        }
    };

    return new FeatureDetector();

})(jQuery);
