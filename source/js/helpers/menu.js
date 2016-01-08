//
// @name Menu
// @description  Function for closing the menu (cannot be done with just :target selector)
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helpers = HelsingborgPrime.Helpers || {};

HelsingborgPrime.Helpers.Menu = (function ($) {

    function Menu() {
    	this.init(); 
    }

    Menu.prototype.init = function () {
	    jQuery(function() {
		    if( jQuery(".menu-trigger").is(":target") ){
			   jQuery("html").addClass("menu-open");  
		    }
	    }.bind(this)); 
	    
	    jQuery(".menu-trigger").click(function(event){
		    jQuery("html").toggleClass("menu-open"); 
		    if(jQuery(this).is(":target")) {
			    event.preventDefault(); 
				window.location.hash = "#menu-closed"; 
		    }
	    }); 
    };
    
    return new Menu();

})(jQuery);