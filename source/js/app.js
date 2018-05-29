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

var ios = (function () {
    var undef;

    if (/iP(hone|od|ad)/.test(navigator.platform)) {
        var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/);
        return parseInt(v[1], 10);
    }

    return undef;

}());

if ((ie > 9 || typeof ie == 'undefined') && (typeof ios == 'undefined' || ios >= 8)) {
    var hyperformWrapper = hyperform(window, {
        classes: {
            valid: 'valid',
            invalid: 'invalid',
            validated: 'validated',
            warning: 'form-notice text-danger text-sm'
        }
    });

    hyperform.addTranslation('sv', {
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

    hyperform.setLanguage("sv");
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

jQuery.expr[':'].icontains = function(a, i, m) {
  return jQuery(a).text().toUpperCase()
      .indexOf(m[3].toUpperCase()) >= 0;
};


document.querySelector('.toogle').addEventListener('click', function(e) {
    this.classList.toggle('hidden');
    var toogleElement = this.getAttribute('data-toogle');
    [].map.call(document.querySelectorAll(toogleElement), function(el) {
        el.classList.toggle('hidden');
    });
});

document.querySelector('#filter-keyword').addEventListener('click', function(e) {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth;

    if (x >= 768) {
        if (document.getElementById('show-date-filter').classList.contains('hidden')) {
            document.getElementById('show-date-filter').classList.remove('hidden');
        }
        if (!document.getElementById('date-filter').classList.contains('hidden')) {
            document.getElementById('date-filter').classList.add('hidden');
        }
    }

});