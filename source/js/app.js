var HelsingborgPrime = {};
var ie = (function(){

    var undef,
        v = 3,
        div = document.createElement('div'),
        all = div.getElementsByTagName('i');

    while (
        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
        all[0]
    );

    return v > 4 ? v : undef;

}());

if (ie > 9 || typeof ie == 'undefined') {
    var hyperformWrapper = hyperform(window, {
        classes: {
            valid: 'valid',
            invalid: 'invalid',
            validated: 'validated',
            warning: 'form-notice text-danger text-sm'
        }
    });

    hyperform.add_translation('sv', {
        TextTooLong: 'Använd %l eller färre tecken (du använder just nu %l tecken).',
        ValueMissing: 'Du måste fylla i detta fältet.',
        CheckboxMissing: 'Du måste kryssa för minst ett alternativ.',
        RadioMissing: 'Vänligen välj ett av alternativen.',
        FileMissing: 'Vänligen välj en fil.',
        SelectMissing: 'Du måste välja ett objekt i listan.',
        InvalidEmail: 'Fyll i en giltig e-postadress',
        InvalidURL: 'Fyll i en giltig webbadress.',
        PatternMismatch: 'Värdet är felformatterat.',
        PatternMismatchWithTitle: 'Ditt värde måste matcha formatet: %l.',
        NumberRangeOverflow: 'Välj ett värde som inte är högre än %l.',
        DateRangeOverflow: 'Välj ett datum som inte är senare än %l.',
        TimeRangeOverflow: 'Välj ett klockslag som inte är senare än %l.',
        NumberRangeUnderflow: 'Välj ett värde som inte är lägre än %l.',
        DateRangeUnderflow: 'Välj ett datum som inte är tidigare än %l.',
        TimeRangeUnderflow: 'Välj ett klockslag som inte är tidigare än %l.',
        StepMismatch: 'Värdet är felaktigt. De två närmsta godkända värdena är %l och %l.',
        StepMismatchOneValue: 'Välj ett godkänt värde. Det närmsta godkända värdet är %l.',
        BadInputNumber: 'Du måste ange en siffra.'
    });

    hyperform.set_language("sv");
}

$('html, body').removeClass('no-js');
document.documentElement.setAttribute('data-useragent', navigator.userAgent);

jQuery.expr.filters.offscreen = function(el) {
    var rect = el.getBoundingClientRect();
    return (
        (rect.x + rect.width) < 0
        || (rect.y + rect.height) < 0
        || (rect.x > window.innerWidth || rect.y > window.innerHeight)
    );
};

jQuery.expr[':'].Contains = function(a, i, m) {
  return jQuery(a).text().toUpperCase()
      .indexOf(m[3].toUpperCase()) >= 0;
};
