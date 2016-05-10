//
// @name Slider
// @description  Sliding content
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Component = HelsingborgPrime.Component || {};

HelsingborgPrime.Component.Slider = (function ($) {

    var autoslideIntervals = [];

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
            this.autoslide(element);
        }.bind(this));

        this.bindEvents();
    };

    /**
     * Adds navigation buttons if needed
     */
    Slider.prototype.addNavigationButtons = function (slider) {
        if ($(slider).find('li').length === 0) {
            return;
        }

        $(slider).append('<button class="slider-nav-previous"><span class="sr-only">Previous</span><i class="fa fa-arrow-circle-left"></i></button><button class="slider-nav-next"><span class="sr-only">Next</span><i class="fa fa-arrow-circle-right"></i></button>');
    };

    /**
     * Start autoslide if setup
     * @param  {object} slider The slider
     * @return {void}
     */
    Slider.prototype.autoslide = function (slider) {
        if ($(slider).attr('data-autoslide') != 'true') {
            return;
        }

        this.startInterval(slider);
    };

    /**
     * Starts the autoslider interval timer
     * @param  {object} slider The slider to slide
     * @return {void}
     */
    Slider.prototype.startInterval = function (slider) {
        var index = $(slider).index();
        var intervalTimeout = $(slider).attr('data-autoslide-interval');

        if (typeof intervalTimeout == 'undefined') {
            intervalTimeout = 10000;
        }

        autoslideIntervals[index] = setInterval(function () {
            this.goNext(slider);
        }.bind(this, slider), intervalTimeout);
    };

    /**
     * Stops the autoslider interval timer
     * @param  {object} slider The slider to stop slide
     * @return {void}
     */
    Slider.prototype.stopInterval = function (slider) {
        var index = $(slider).index();

        clearInterval(autoslideIntervals[index]);
        autoslideIntervals.splice(index, 1);
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

        // Stop on hover
        $('.slider').on('mouseenter', function (element) {
            var slider = $(element.target).closest('.slider');
            this.stopInterval(slider);
        }.bind(this)).on('mouseleave', function (element) {
            var slider = $(element.target).closest('.slider');
            this.startInterval(slider);
        }.bind(this));
    };

    return new Slider();

})(jQuery);
