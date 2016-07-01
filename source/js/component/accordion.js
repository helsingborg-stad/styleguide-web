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
        $('label.accordion-toggle').on('click', function(event) {
			window.location.hash = '#' + $(this).attr('for');
		});


    };

    return new Accordion();

})(jQuery);
