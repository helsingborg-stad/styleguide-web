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
            var $input = $('#' + $(this).attr('for'));

            if ($input.prop('checked') === false) {
                window.location.hash = '#' + $(this).attr('for');
            } else {
                if ($input.is('[type="radio"]')) {
                    var name = $input.attr('name');
                    var value = $input.val();
                    var id = $input.attr('id');

                    var $parent = $input.parent('section');
                    $input.remove();

                    setTimeout(function () {
                        $parent.prepend('<input type="radio" name="' + name + '" value="' + value + '" id="' + id + '">');
                    }, 1);

                }

                window.location.hash = '_';
            }
		});


    };

    return new Accordion();

})(jQuery);
