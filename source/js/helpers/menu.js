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
	    $('.menu-trigger').on('click', function (e) {
            e.preventDefault();

            var triggerBtn = $(e.target).closest('.menu-trigger');
            triggerBtn.toggleClass('open');

            var menu = triggerBtn.data('target');
            $(menu).toggleClass('open');
        });
    };

    return new Menu();

})(jQuery);
