//
// @name Slider
// @description  Sliding content
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Component = HelsingborgPrime.Component || {};

HelsingborgPrime.Component.Slider = (function ($) {

    var autoslideIntervals = [];

    function Slider() {
        $('.slider').each(function () {
            if ($(this).find('[data-flickity]')) {
                return;
            }

            $(this).flickity({
                cellSelector: '.slide',
                cellAlign: 'center',
                setGallerySize: false,
                wrapAround: true,
            });
        });
    }

    return new Slider();

})(jQuery);
