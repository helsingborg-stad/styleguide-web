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
	    $(function() {
		    if ($('#menu-open').is(':target')){
			   $('html,body').addClass('menu-open');
		    }
	    }.bind(this));

	    $('.menu-trigger').click(function(event){
		    $('html,body').toggleClass('menu-open');
		    if ($(this).is(':target')) {
			    event.preventDefault();
				window.location.hash = '#menu-closed';
		    }
	    });
    };

    return new Menu();

})(jQuery);
