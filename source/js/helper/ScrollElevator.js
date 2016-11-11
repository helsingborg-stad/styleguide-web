HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.ScrollElevator = (function ($) {

    var elevatorSelector = '.scroll-elevator-toggle';
    var scrollPosAdjuster = -50;
    var scrolSpeed = 500;

    function ScrollElevator() {
        if ($(elevatorSelector).length === 0) {
            return;
        }

        var $elevatorSelector = $(elevatorSelector);

        $(document).on('click', '[href="#elevator-top"]', function (e) {
            e.preventDefault();
            $(this).blur();

            $('html, body').animate({
                scrollTop: 0
            }, scrolSpeed);
        });

        this.appendElevator($elevatorSelector);
        this.scrollSpy($elevatorSelector);
    }

    ScrollElevator.prototype.appendElevator = function($elevatorTarget) {
        var scrollText = 'Scroll up';
        if (HelsingborgPrime.Args.get('scrollElevator.cta')) {
            scrollText = HelsingborgPrime.Args.get('scrollElevator.cta');
        }

        $elevatorTarget.append('<div class="scroll-elevator"><a href="#elevator-top" data-tooltip="' + scrollText + '" data-tooltip-left><i></i><span class="sr-only">' + scrollText + '</span></a></div>');
    };

    ScrollElevator.prototype.scrollSpy = function($elevatorTarget) {
        var $document = $(document);
        var $window = $(window);

        var scrollTarget = $elevatorTarget.position().top + $elevatorTarget.height();

        $document.on('scroll load', function () {
            var scrollPos = $document.scrollTop() + $window.height() + scrollPosAdjuster;

            if (scrollPos < scrollTarget) {
                this.hideElevator();
                return;
            }

            this.showElevator();
            return;
        }.bind(this));
    };

    ScrollElevator.prototype.showElevator = function() {
        $('body').addClass('show-scroll-elevator');
    };

    ScrollElevator.prototype.hideElevator = function() {
        $('body').removeClass('show-scroll-elevator');
    };

    return new ScrollElevator();

})(jQuery);
