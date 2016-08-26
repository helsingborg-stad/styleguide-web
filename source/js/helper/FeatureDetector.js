HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.FeatureDetector = (function ($) {

    function FeatureDetector() {
        this.detectFlexbox();
    }

    FeatureDetector.prototype.detectFlexbox = function () {
        if (typeof document.createElement("p").style.flexWrap !== 'undefined' && document.createElement("p").style.flexWrap == '') {
            return true;
        }

        $('html').addClass('no-flexbox');
        return false;
    };

    return new FeatureDetector();

})(jQuery);
