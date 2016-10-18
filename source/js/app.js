var hyperformWrapper = hyperform(window, {
    classes: {
        valid: 'valid',
        invalid: 'invalid',
        validated: 'validated',
        warning: 'text-danger text-sm',
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

var HelsingborgPrime = {};

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
