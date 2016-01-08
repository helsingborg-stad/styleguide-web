//
// @name Modal
// @description  Prevent scrolling when modal is open (or #modal-* exists in url)
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helpers = HelsingborgPrime.Helpers || {};

HelsingborgPrime.Helpers.ModalLimit = (function ($) {

    function ModalLimit() {
    	this.init(); 
    }

    ModalLimit.prototype.init = function () {
	    this.toggleModalClass(); 
        jQuery(window).bind('hashchange', function() {
			this.toggleModalClass(); 
		}.bind(this));
    };
    
    ModalLimit.prototype.toggleModalClass = function(){
	    if(window.location.hash.indexOf("modal-") > 0 ) {
			jQuery("html").addClass("overflow-hidden"); 
		} else {
			jQuery("html").removeClass("overflow-hidden"); 
		}
    };

    return new ModalLimit();

})(jQuery);