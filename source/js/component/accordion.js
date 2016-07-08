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
        $('label.accordion-toggle').on('click', function(e) {
            var input = $('#' + $(this).attr('for'));

            if (input.prop('checked') === false) {
                window.location.hash = '#' + $(this).attr('for');
            } else {
                window.location.hash = '';
                history.pushState('', document.title, window.location.pathname);
            }
		});


    };

    return new Accordion();

})(jQuery);
