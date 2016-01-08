//
// @name Modal
// @description  Prevent scrolling when modal is open. 
//
// @markup
// <div class="grid">
//     <div class="grid-md-6">
//         Hej<br>på<br>dig
//     </div>
//     <div class="grid-md-6">
//         Hej<br>på<br>dig
//     </div>
// </div>
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helpers = HelsingborgPrime.Helpers || {};

HelsingborgPrime.Helpers.ModalLimit = (function ($) {

    function ModalLimit() {
    	this.init(); 
    }

    ModalLimit.prototype.init = function (el) {
        jQuery(window).bind('hashchange', function() {
			if(window.location.hash.indexOf("modal")) {
				jQuery("body").addClass("overflow-hidden"); 
			} else {
				jQuery("body").removeClass("overflow-hidden"); 
			}
		});
    };

    return new ModalLimit();

})(jQuery);
