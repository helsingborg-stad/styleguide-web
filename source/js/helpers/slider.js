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

    /**
     * Initializes slider(s)
     * @return {[type]} [description]
     */
    Slider.prototype.init = function () {
        $('.slider').each(function (index, element) {
            $(element).find('li:first').addClass('current');
            this.addNavigationButtons(element);
        }.bind(this));

        this.bindEvents();
    };

    /**
     * Adds navigation buttons if needed
     * @param {[type]} slider [description]
     */
    Slider.prototype.addNavigationButtons = function (slider) {
        if ($(slider).find('li').length > 1) {
            $(slider).append('<button class="slider-nav-previous"><i class="fa fa-arrow-circle-left"></i> Previous</button><button class="slider-nav-next">Next <i class="fa fa-arrow-circle-right"></i></button>');
        }
    };

    /**
     * Go to the next slide in a specific slider
     * @param  {object} slider The slider
     * @return {void}
     */
    Slider.prototype.goNext = function (slider) {
        var current = this.currentSlide(slider);
        var next = current.next('li').length ? current.next('li') : $(slider).find('li:first');

        $(slider).find('li').removeClass('slider-out');
        $(slider).removeClass('slider-previous slider-next').addClass('slider-next');

        current.removeClass('current slider-in').addClass('slider-out');
        next.addClass('current slider-in');
    };

    /**
     * Go to the previous slide in a specific slider
     * @param  {object} slider The slider
     * @return {void}
     */
    Slider.prototype.goPrev = function (slider) {
        var current = this.currentSlide(slider);
        var prev = current.prev('li').length ? current.prev('li') : $(slider).find('li:last');

        $(slider).find('li').removeClass('slider-out');
        $(slider).removeClass('slider-previous slider-next').addClass('slider-previous');

        current.removeClass('current slider-in').addClass('slider-out');
        prev.addClass('current slider-in');
    };

    /**
     * Gets the current slide element in a slider
     * @param  {object} slider The slider object to check current slide in
     * @return {object}        The current slide object
     */
    Slider.prototype.currentSlide = function (slider) {
        return $(slider).find('li.current').length ? $(slider).find('li.current') : $(slider).find('li:first');
    };

    Slider.prototype.bindEvents = function () {
        // Next button
        $('.slider-nav-next').on('click', function (e) {
            this.goNext($(e.target).parents('.slider'));
        }.bind(this));

        // Prev button
        $('.slider-nav-previous').on('click', function (e) {
            this.goPrev($(e.target).parents('.slider'));
        }.bind(this));
    };

    return new Slider();

})(jQuery);
