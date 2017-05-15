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

        $('.accordion-search input').on('input', function (e) {
            var where = $(e.target).parents('.accordion');
            var what = $(e.target).val();

            this.filter(what, where);
        }.bind(this));
    };

    Accordion.prototype.filter = function(what, where) {
        where.find('.accordion-section').hide();
        where.find('.accordion-section:icontains(' + what + ')').show();
    };

    return new Accordion();

})(jQuery);
