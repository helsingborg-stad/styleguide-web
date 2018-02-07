//
// @name Modal
// @description  Show accodrion dropdown, make linkable by updating adress bar
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Component = HelsingborgPrime.Component || {};

HelsingborgPrime.Component.Accordion = (function ($) {

    function Accordion() {
    	this.init();
    }

    Accordion.prototype.init = function () {

        var click = false;

        $(document).on('focus', '.accordion-toggle', function(e) {
            if(!click) {
                $(this).parent().find('.accordion-content').show();
                $(this).addClass("minus");
            }
            click = false;
        });

        $(document).on('mousedown', '.accordion-toggle', function(e) {
            click = true;
            $(this).parent().find('.accordion-content').toggle();
            $(this).toggleClass("minus");
            $(this).blur();
        });
    };

    return new Accordion();

})(jQuery);
