//
// @name Slider
// @description  Sliding content
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Component = HelsingborgPrime.Component || {};

HelsingborgPrime.Component.Slider = (function ($) {

    var autoslideIntervals = [];

    function Slider() {
        this.preloadImage();
        this.triggerAutoplay();

        $('.slider').each(function (index, element) {
            var $slider = $(element);

            this.detectIfIsCollapsed(element);

            if ($slider.find('[data-flickity]')) {
                return;
            }

            $slider.flickity({
                cellSelector: '.slide',
                cellAlign: 'center',
                setGallerySize: false,
                wrapAround: true,
            });

        }.bind(this));

        $(window).resize(function() {
            $('.slider').each(function (index, element) {
                this.detectIfIsCollapsed(element);
            }.bind(this));
        }.bind(this));
    }

    /**
     * Add collapsed class
     */
    Slider.prototype.detectIfIsCollapsed = function (slider) {
        if ($(slider).width() <= 500) {
            $(slider).addClass("is-collapsed");
        } else {
            $(slider).removeClass("is-collapsed");
        }

        $(slider).find('.slide').each(function (index, slide) {
            if ($(slide).width() <= 500) {
                $(slide).addClass("is-collapsed");
            } else {
                $(slide).removeClass("is-collapsed");
            }
        });
    };

    Slider.prototype.preloadImage = function () {
        setTimeout(function(){

            var normal_img = [];
            var mobile_img = [];

            $(".slider .slide").each(function(index, slide) {

                if ($(".slider-image-mobile", slide).length) {
                    normal_img.index = new Image();
                    normal_img.index.src = $(".slider-image-desktop", slide).css('background-image').replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
                }

                if ($(".slider-image-mobile", slide).length) {
                    mobile_img.index = new Image();
                    mobile_img.index.src = $(".slider-image-mobile", slide).css('background-image').replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
                }

            });

        },5000);
    };

    Slider.prototype.triggerAutoplay = function () {
        setTimeout(function(){
            $(".slider .slide .slider-video video").each(function(index, video) {
                if (typeof $(video).attr('autoplay') !== 'undefined' && $(video).attr('autoplay') !== 'false') {
                    video.play();
                }
            });
        },300);
    };

    return new Slider();

})(jQuery);
