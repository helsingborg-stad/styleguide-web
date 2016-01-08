//
// @name Modal
// @description  Show accodrion dropdown, make linkable by updating adress bar
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helpers = HelsingborgPrime.Helpers || {};

HelsingborgPrime.Helpers.Accordion = (function ($) {

    function Accordion() {
    	this.init(); 
    }

    Accordion.prototype.init = function () {
        jQuery('div.accordion label').on('click', function(event) {
			if ( history.pushState ) {
				history.pushState(null, null, "#" +jQuery(this).attr('for'));
			} else {
				window.location.hash = "#" + jQuery(this).attr('for'); 
			}
		});
    };
    
    return new Accordion();

})(jQuery);