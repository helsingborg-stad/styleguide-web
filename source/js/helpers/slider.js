//
// @name Slider
// @description  Sliding content
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helpers = HelsingborgPrime.Helpers || {};

HelsingborgPrime.Helpers.Slider = (function ($) {

    function Slider() {
        this.init();
    }

    Slider.prototype.init = function () {
        $('.slider').each(function (index, element) {
            $(element).find('li:first').addClass('current');
        });

        $('[data-slider="next"]').on('click', function (e) {
            this.goNext($(e.target).parents('.slider'));
        }.bind(this));

        $('[data-slider="prev"]').on('click', function (e) {
            this.goPrev($(e.target).parents('.slider'));
        }.bind(this));
    };

    Slider.prototype.goNext = function (slider) {
        var current = this.currentSlide(slider);
        var next = current.next('li').length ? current.next('li') : $(slider).find('li:first');

        current.removeClass('current');
        next.addClass('current');
    };

    Slider.prototype.goPrev = function (slider) {
        var current = this.currentSlide(slider);
        var prev = current.prev('li').length ? current.prev('li') : $(slider).find('li:last');

        current.removeClass('current');
        prev.addClass('current');
    };

    Slider.prototype.currentSlide = function (slider) {
        return $(slider).find('li.current').length ? $(slider).find('li.current') : $(slider).find('li:first');
    };

    return new Slider();

})(jQuery);
