/*!
 * Packery PACKAGED v2.1.2
 * Gapless, draggable grid layouts
 *
 * Licensed GPLv3 for open source use
 * or Packery Commercial License for commercial use
 *
 * http://packery.metafizzy.co
 * Copyright 2013-2018 Metafizzy
 */

/**
 * Bridget makes jQuery widgets
 * v2.0.1
 * MIT license
 */

/* jshint browser: true, strict: true, undef: true, unused: true */

( function( window, factory ) {
  // universal module definition
  /*jshint strict: false */ /* globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( 'jquery-bridget/jquery-bridget',[ 'jquery' ], function( jQuery ) {
      return factory( window, jQuery );
    });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      window,
      require('jquery')
    );
  } else {
    // browser global
    window.jQueryBridget = factory(
      window,
      window.jQuery
    );
  }

}( window, function factory( window, jQuery ) {
'use strict';

// ----- utils ----- //

var arraySlice = Array.prototype.slice;

// helper function for logging errors
// $.error breaks jQuery chaining
var console = window.console;
var logError = typeof console == 'undefined' ? function() {} :
  function( message ) {
    console.error( message );
  };

// ----- jQueryBridget ----- //

function jQueryBridget( namespace, PluginClass, $ ) {
  $ = $ || jQuery || window.jQuery;
  if ( !$ ) {
    return;
  }

  // add option method -> $().plugin('option', {...})
  if ( !PluginClass.prototype.option ) {
    // option setter
    PluginClass.prototype.option = function( opts ) {
      // bail out if not an object
      if ( !$.isPlainObject( opts ) ){
        return;
      }
      this.options = $.extend( true, this.options, opts );
    };
  }

  // make jQuery plugin
  $.fn[ namespace ] = function( arg0 /*, arg1 */ ) {
    if ( typeof arg0 == 'string' ) {
      // method call $().plugin( 'methodName', { options } )
      // shift arguments by 1
      var args = arraySlice.call( arguments, 1 );
      return methodCall( this, arg0, args );
    }
    // just $().plugin({ options })
    plainCall( this, arg0 );
    return this;
  };

  // $().plugin('methodName')
  function methodCall( $elems, methodName, args ) {
    var returnValue;
    var pluginMethodStr = '$().' + namespace + '("' + methodName + '")';

    $elems.each( function( i, elem ) {
      // get instance
      var instance = $.data( elem, namespace );
      if ( !instance ) {
        logError( namespace + ' not initialized. Cannot call methods, i.e. ' +
          pluginMethodStr );
        return;
      }

      var method = instance[ methodName ];
      if ( !method || methodName.charAt(0) == '_' ) {
        logError( pluginMethodStr + ' is not a valid method' );
        return;
      }

      // apply method, get return value
      var value = method.apply( instance, args );
      // set return value if value is returned, use only first value
      returnValue = returnValue === undefined ? value : returnValue;
    });

    return returnValue !== undefined ? returnValue : $elems;
  }

  function plainCall( $elems, options ) {
    $elems.each( function( i, elem ) {
      var instance = $.data( elem, namespace );
      if ( instance ) {
        // set options & init
        instance.option( options );
        instance._init();
      } else {
        // initialize new instance
        instance = new PluginClass( elem, options );
        $.data( elem, namespace, instance );
      }
    });
  }

  updateJQuery( $ );

}

// ----- updateJQuery ----- //

// set $.bridget for v1 backwards compatibility
function updateJQuery( $ ) {
  if ( !$ || ( $ && $.bridget ) ) {
    return;
  }
  $.bridget = jQueryBridget;
}

updateJQuery( jQuery || window.jQuery );

// -----  ----- //

return jQueryBridget;

}));

/*!
 * getSize v2.0.3
 * measure size of elements
 * MIT license
 */

/* jshint browser: true, strict: true, undef: true, unused: true */
/* globals console: false */

( function( window, factory ) {
  /* jshint strict: false */ /* globals define, module */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( 'get-size/get-size',factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory();
  } else {
    // browser global
    window.getSize = factory();
  }

})( window, function factory() {
'use strict';

// -------------------------- helpers -------------------------- //

// get a number from a string, not a percentage
function getStyleSize( value ) {
  var num = parseFloat( value );
  // not a percent like '100%', and a number
  var isValid = value.indexOf('%') == -1 && !isNaN( num );
  return isValid && num;
}

function noop() {}

var logError = typeof console == 'undefined' ? noop :
  function( message ) {
    console.error( message );
  };

// -------------------------- measurements -------------------------- //

var measurements = [
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingBottom',
  'marginLeft',
  'marginRight',
  'marginTop',
  'marginBottom',
  'borderLeftWidth',
  'borderRightWidth',
  'borderTopWidth',
  'borderBottomWidth'
];

var measurementsLength = measurements.length;

function getZeroSize() {
  var size = {
    width: 0,
    height: 0,
    innerWidth: 0,
    innerHeight: 0,
    outerWidth: 0,
    outerHeight: 0
  };
  for ( var i=0; i < measurementsLength; i++ ) {
    var measurement = measurements[i];
    size[ measurement ] = 0;
  }
  return size;
}

// -------------------------- getStyle -------------------------- //

/**
 * getStyle, get style of element, check for Firefox bug
 * https://bugzilla.mozilla.org/show_bug.cgi?id=548397
 */
function getStyle( elem ) {
  var style = getComputedStyle( elem );
  if ( !style ) {
    logError( 'Style returned ' + style +
      '. Are you running this code in a hidden iframe on Firefox? ' +
      'See https://bit.ly/getsizebug1' );
  }
  return style;
}

// -------------------------- setup -------------------------- //

var isSetup = false;

var isBoxSizeOuter;

/**
 * setup
 * check isBoxSizerOuter
 * do on first getSize() rather than on page load for Firefox bug
 */
function setup() {
  // setup once
  if ( isSetup ) {
    return;
  }
  isSetup = true;

  // -------------------------- box sizing -------------------------- //

  /**
   * Chrome & Safari measure the outer-width on style.width on border-box elems
   * IE11 & Firefox<29 measures the inner-width
   */
  var div = document.createElement('div');
  div.style.width = '200px';
  div.style.padding = '1px 2px 3px 4px';
  div.style.borderStyle = 'solid';
  div.style.borderWidth = '1px 2px 3px 4px';
  div.style.boxSizing = 'border-box';

  var body = document.body || document.documentElement;
  body.appendChild( div );
  var style = getStyle( div );
  // round value for browser zoom. desandro/masonry#928
  isBoxSizeOuter = Math.round( getStyleSize( style.width ) ) == 200;
  getSize.isBoxSizeOuter = isBoxSizeOuter;

  body.removeChild( div );
}

// -------------------------- getSize -------------------------- //

function getSize( elem ) {
  setup();

  // use querySeletor if elem is string
  if ( typeof elem == 'string' ) {
    elem = document.querySelector( elem );
  }

  // do not proceed on non-objects
  if ( !elem || typeof elem != 'object' || !elem.nodeType ) {
    return;
  }

  var style = getStyle( elem );

  // if hidden, everything is 0
  if ( style.display == 'none' ) {
    return getZeroSize();
  }

  var size = {};
  size.width = elem.offsetWidth;
  size.height = elem.offsetHeight;

  var isBorderBox = size.isBorderBox = style.boxSizing == 'border-box';

  // get all measurements
  for ( var i=0; i < measurementsLength; i++ ) {
    var measurement = measurements[i];
    var value = style[ measurement ];
    var num = parseFloat( value );
    // any 'auto', 'medium' value will be 0
    size[ measurement ] = !isNaN( num ) ? num : 0;
  }

  var paddingWidth = size.paddingLeft + size.paddingRight;
  var paddingHeight = size.paddingTop + size.paddingBottom;
  var marginWidth = size.marginLeft + size.marginRight;
  var marginHeight = size.marginTop + size.marginBottom;
  var borderWidth = size.borderLeftWidth + size.borderRightWidth;
  var borderHeight = size.borderTopWidth + size.borderBottomWidth;

  var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;

  // overwrite width and height if we can get it from style
  var styleWidth = getStyleSize( style.width );
  if ( styleWidth !== false ) {
    size.width = styleWidth +
      // add padding and border unless it's already including it
      ( isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth );
  }

  var styleHeight = getStyleSize( style.height );
  if ( styleHeight !== false ) {
    size.height = styleHeight +
      // add padding and border unless it's already including it
      ( isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight );
  }

  size.innerWidth = size.width - ( paddingWidth + borderWidth );
  size.innerHeight = size.height - ( paddingHeight + borderHeight );

  size.outerWidth = size.width + marginWidth;
  size.outerHeight = size.height + marginHeight;

  return size;
}

return getSize;

});

/**
 * EvEmitter v1.1.0
 * Lil' event emitter
 * MIT License
 */

/* jshint unused: true, undef: true, strict: true */

( function( global, factory ) {
  // universal module definition
  /* jshint strict: false */ /* globals define, module, window */
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS
    define( 'ev-emitter/ev-emitter',factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Browserify, Webpack
    module.exports = factory();
  } else {
    // Browser globals
    global.EvEmitter = factory();
  }

}( typeof window != 'undefined' ? window : this, function() {



function EvEmitter() {}

var proto = EvEmitter.prototype;

proto.on = function( eventName, listener ) {
  if ( !eventName || !listener ) {
    return;
  }
  // set events hash
  var events = this._events = this._events || {};
  // set listeners array
  var listeners = events[ eventName ] = events[ eventName ] || [];
  // only add once
  if ( listeners.indexOf( listener ) == -1 ) {
    listeners.push( listener );
  }

  return this;
};

proto.once = function( eventName, listener ) {
  if ( !eventName || !listener ) {
    return;
  }
  // add event
  this.on( eventName, listener );
  // set once flag
  // set onceEvents hash
  var onceEvents = this._onceEvents = this._onceEvents || {};
  // set onceListeners object
  var onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};
  // set flag
  onceListeners[ listener ] = true;

  return this;
};

proto.off = function( eventName, listener ) {
  var listeners = this._events && this._events[ eventName ];
  if ( !listeners || !listeners.length ) {
    return;
  }
  var index = listeners.indexOf( listener );
  if ( index != -1 ) {
    listeners.splice( index, 1 );
  }

  return this;
};

proto.emitEvent = function( eventName, args ) {
  var listeners = this._events && this._events[ eventName ];
  if ( !listeners || !listeners.length ) {
    return;
  }
  // copy over to avoid interference if .off() in listener
  listeners = listeners.slice(0);
  args = args || [];
  // once stuff
  var onceListeners = this._onceEvents && this._onceEvents[ eventName ];

  for ( var i=0; i < listeners.length; i++ ) {
    var listener = listeners[i]
    var isOnce = onceListeners && onceListeners[ listener ];
    if ( isOnce ) {
      // remove listener
      // remove before trigger to prevent recursion
      this.off( eventName, listener );
      // unset once flag
      delete onceListeners[ listener ];
    }
    // trigger listener
    listener.apply( this, args );
  }

  return this;
};

proto.allOff = function() {
  delete this._events;
  delete this._onceEvents;
};

return EvEmitter;

}));

/**
 * matchesSelector v2.0.2
 * matchesSelector( element, '.selector' )
 * MIT license
 */

/*jshint browser: true, strict: true, undef: true, unused: true */

( function( window, factory ) {
  /*global define: false, module: false */
  'use strict';
  // universal module definition
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( 'desandro-matches-selector/matches-selector',factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory();
  } else {
    // browser global
    window.matchesSelector = factory();
  }

}( window, function factory() {
  'use strict';

  var matchesMethod = ( function() {
    var ElemProto = window.Element.prototype;
    // check for the standard method name first
    if ( ElemProto.matches ) {
      return 'matches';
    }
    // check un-prefixed
    if ( ElemProto.matchesSelector ) {
      return 'matchesSelector';
    }
    // check vendor prefixes
    var prefixes = [ 'webkit', 'moz', 'ms', 'o' ];

    for ( var i=0; i < prefixes.length; i++ ) {
      var prefix = prefixes[i];
      var method = prefix + 'MatchesSelector';
      if ( ElemProto[ method ] ) {
        return method;
      }
    }
  })();

  return function matchesSelector( elem, selector ) {
    return elem[ matchesMethod ]( selector );
  };

}));

/**
 * Fizzy UI utils v2.0.7
 * MIT license
 */

/*jshint browser: true, undef: true, unused: true, strict: true */

( function( window, factory ) {
  // universal module definition
  /*jshint strict: false */ /*globals define, module, require */

  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( 'fizzy-ui-utils/utils',[
      'desandro-matches-selector/matches-selector'
    ], function( matchesSelector ) {
      return factory( window, matchesSelector );
    });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      window,
      require('desandro-matches-selector')
    );
  } else {
    // browser global
    window.fizzyUIUtils = factory(
      window,
      window.matchesSelector
    );
  }

}( window, function factory( window, matchesSelector ) {



var utils = {};

// ----- extend ----- //

// extends objects
utils.extend = function( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ];
  }
  return a;
};

// ----- modulo ----- //

utils.modulo = function( num, div ) {
  return ( ( num % div ) + div ) % div;
};

// ----- makeArray ----- //

var arraySlice = Array.prototype.slice;

// turn element or nodeList into an array
utils.makeArray = function( obj ) {
  if ( Array.isArray( obj ) ) {
    // use object if already an array
    return obj;
  }
  // return empty array if undefined or null. #6
  if ( obj === null || obj === undefined ) {
    return [];
  }

  var isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
  if ( isArrayLike ) {
    // convert nodeList to array
    return arraySlice.call( obj );
  }

  // array of single index
  return [ obj ];
};

// ----- removeFrom ----- //

utils.removeFrom = function( ary, obj ) {
  var index = ary.indexOf( obj );
  if ( index != -1 ) {
    ary.splice( index, 1 );
  }
};

// ----- getParent ----- //

utils.getParent = function( elem, selector ) {
  while ( elem.parentNode && elem != document.body ) {
    elem = elem.parentNode;
    if ( matchesSelector( elem, selector ) ) {
      return elem;
    }
  }
};

// ----- getQueryElement ----- //

// use element as selector string
utils.getQueryElement = function( elem ) {
  if ( typeof elem == 'string' ) {
    return document.querySelector( elem );
  }
  return elem;
};

// ----- handleEvent ----- //

// enable .ontype to trigger from .addEventListener( elem, 'type' )
utils.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

// ----- filterFindElements ----- //

utils.filterFindElements = function( elems, selector ) {
  // make array of elems
  elems = utils.makeArray( elems );
  var ffElems = [];

  elems.forEach( function( elem ) {
    // check that elem is an actual element
    if ( !( elem instanceof HTMLElement ) ) {
      return;
    }
    // add elem if no selector
    if ( !selector ) {
      ffElems.push( elem );
      return;
    }
    // filter & find items if we have a selector
    // filter
    if ( matchesSelector( elem, selector ) ) {
      ffElems.push( elem );
    }
    // find children
    var childElems = elem.querySelectorAll( selector );
    // concat childElems to filterFound array
    for ( var i=0; i < childElems.length; i++ ) {
      ffElems.push( childElems[i] );
    }
  });

  return ffElems;
};

// ----- debounceMethod ----- //

utils.debounceMethod = function( _class, methodName, threshold ) {
  threshold = threshold || 100;
  // original method
  var method = _class.prototype[ methodName ];
  var timeoutName = methodName + 'Timeout';

  _class.prototype[ methodName ] = function() {
    var timeout = this[ timeoutName ];
    clearTimeout( timeout );

    var args = arguments;
    var _this = this;
    this[ timeoutName ] = setTimeout( function() {
      method.apply( _this, args );
      delete _this[ timeoutName ];
    }, threshold );
  };
};

// ----- docReady ----- //

utils.docReady = function( callback ) {
  var readyState = document.readyState;
  if ( readyState == 'complete' || readyState == 'interactive' ) {
    // do async to allow for other scripts to run. metafizzy/flickity#441
    setTimeout( callback );
  } else {
    document.addEventListener( 'DOMContentLoaded', callback );
  }
};

// ----- htmlInit ----- //

// http://jamesroberts.name/blog/2010/02/22/string-functions-for-javascript-trim-to-camel-case-to-dashed-and-to-underscore/
utils.toDashed = function( str ) {
  return str.replace( /(.)([A-Z])/g, function( match, $1, $2 ) {
    return $1 + '-' + $2;
  }).toLowerCase();
};

var console = window.console;
/**
 * allow user to initialize classes via [data-namespace] or .js-namespace class
 * htmlInit( Widget, 'widgetName' )
 * options are parsed from data-namespace-options
 */
utils.htmlInit = function( WidgetClass, namespace ) {
  utils.docReady( function() {
    var dashedNamespace = utils.toDashed( namespace );
    var dataAttr = 'data-' + dashedNamespace;
    var dataAttrElems = document.querySelectorAll( '[' + dataAttr + ']' );
    var jsDashElems = document.querySelectorAll( '.js-' + dashedNamespace );
    var elems = utils.makeArray( dataAttrElems )
      .concat( utils.makeArray( jsDashElems ) );
    var dataOptionsAttr = dataAttr + '-options';
    var jQuery = window.jQuery;

    elems.forEach( function( elem ) {
      var attr = elem.getAttribute( dataAttr ) ||
        elem.getAttribute( dataOptionsAttr );
      var options;
      try {
        options = attr && JSON.parse( attr );
      } catch ( error ) {
        // log error, do not initialize
        if ( console ) {
          console.error( 'Error parsing ' + dataAttr + ' on ' + elem.className +
          ': ' + error );
        }
        return;
      }
      // initialize
      var instance = new WidgetClass( elem, options );
      // make available via $().data('namespace')
      if ( jQuery ) {
        jQuery.data( elem, namespace, instance );
      }
    });

  });
};

// -----  ----- //

return utils;

}));

/**
 * Outlayer Item
 */

( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */ /* globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS
    define( 'outlayer/item',[
        'ev-emitter/ev-emitter',
        'get-size/get-size'
      ],
      factory
    );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Browserify, Webpack
    module.exports = factory(
      require('ev-emitter'),
      require('get-size')
    );
  } else {
    // browser global
    window.Outlayer = {};
    window.Outlayer.Item = factory(
      window.EvEmitter,
      window.getSize
    );
  }

}( window, function factory( EvEmitter, getSize ) {
'use strict';

// ----- helpers ----- //

function isEmptyObj( obj ) {
  for ( var prop in obj ) {
    return false;
  }
  prop = null;
  return true;
}

// -------------------------- CSS3 support -------------------------- //


var docElemStyle = document.documentElement.style;

var transitionProperty = typeof docElemStyle.transition == 'string' ?
  'transition' : 'WebkitTransition';
var transformProperty = typeof docElemStyle.transform == 'string' ?
  'transform' : 'WebkitTransform';

var transitionEndEvent = {
  WebkitTransition: 'webkitTransitionEnd',
  transition: 'transitionend'
}[ transitionProperty ];

// cache all vendor properties that could have vendor prefix
var vendorProperties = {
  transform: transformProperty,
  transition: transitionProperty,
  transitionDuration: transitionProperty + 'Duration',
  transitionProperty: transitionProperty + 'Property',
  transitionDelay: transitionProperty + 'Delay'
};

// -------------------------- Item -------------------------- //

function Item( element, layout ) {
  if ( !element ) {
    return;
  }

  this.element = element;
  // parent layout class, i.e. Masonry, Isotope, or Packery
  this.layout = layout;
  this.position = {
    x: 0,
    y: 0
  };

  this._create();
}

// inherit EvEmitter
var proto = Item.prototype = Object.create( EvEmitter.prototype );
proto.constructor = Item;

proto._create = function() {
  // transition objects
  this._transn = {
    ingProperties: {},
    clean: {},
    onEnd: {}
  };

  this.css({
    position: 'absolute'
  });
};

// trigger specified handler for event type
proto.handleEvent = function( event ) {
  var method = 'on' + event.type;
  if ( this[ method ] ) {
    this[ method ]( event );
  }
};

proto.getSize = function() {
  this.size = getSize( this.element );
};

/**
 * apply CSS styles to element
 * @param {Object} style
 */
proto.css = function( style ) {
  var elemStyle = this.element.style;

  for ( var prop in style ) {
    // use vendor property if available
    var supportedProp = vendorProperties[ prop ] || prop;
    elemStyle[ supportedProp ] = style[ prop ];
  }
};

 // measure position, and sets it
proto.getPosition = function() {
  var style = getComputedStyle( this.element );
  var isOriginLeft = this.layout._getOption('originLeft');
  var isOriginTop = this.layout._getOption('originTop');
  var xValue = style[ isOriginLeft ? 'left' : 'right' ];
  var yValue = style[ isOriginTop ? 'top' : 'bottom' ];
  var x = parseFloat( xValue );
  var y = parseFloat( yValue );
  // convert percent to pixels
  var layoutSize = this.layout.size;
  if ( xValue.indexOf('%') != -1 ) {
    x = ( x / 100 ) * layoutSize.width;
  }
  if ( yValue.indexOf('%') != -1 ) {
    y = ( y / 100 ) * layoutSize.height;
  }
  // clean up 'auto' or other non-integer values
  x = isNaN( x ) ? 0 : x;
  y = isNaN( y ) ? 0 : y;
  // remove padding from measurement
  x -= isOriginLeft ? layoutSize.paddingLeft : layoutSize.paddingRight;
  y -= isOriginTop ? layoutSize.paddingTop : layoutSize.paddingBottom;

  this.position.x = x;
  this.position.y = y;
};

// set settled position, apply padding
proto.layoutPosition = function() {
  var layoutSize = this.layout.size;
  var style = {};
  var isOriginLeft = this.layout._getOption('originLeft');
  var isOriginTop = this.layout._getOption('originTop');

  // x
  var xPadding = isOriginLeft ? 'paddingLeft' : 'paddingRight';
  var xProperty = isOriginLeft ? 'left' : 'right';
  var xResetProperty = isOriginLeft ? 'right' : 'left';

  var x = this.position.x + layoutSize[ xPadding ];
  // set in percentage or pixels
  style[ xProperty ] = this.getXValue( x );
  // reset other property
  style[ xResetProperty ] = '';

  // y
  var yPadding = isOriginTop ? 'paddingTop' : 'paddingBottom';
  var yProperty = isOriginTop ? 'top' : 'bottom';
  var yResetProperty = isOriginTop ? 'bottom' : 'top';

  var y = this.position.y + layoutSize[ yPadding ];
  // set in percentage or pixels
  style[ yProperty ] = this.getYValue( y );
  // reset other property
  style[ yResetProperty ] = '';

  this.css( style );
  this.emitEvent( 'layout', [ this ] );
};

proto.getXValue = function( x ) {
  var isHorizontal = this.layout._getOption('horizontal');
  return this.layout.options.percentPosition && !isHorizontal ?
    ( ( x / this.layout.size.width ) * 100 ) + '%' : x + 'px';
};

proto.getYValue = function( y ) {
  var isHorizontal = this.layout._getOption('horizontal');
  return this.layout.options.percentPosition && isHorizontal ?
    ( ( y / this.layout.size.height ) * 100 ) + '%' : y + 'px';
};

proto._transitionTo = function( x, y ) {
  this.getPosition();
  // get current x & y from top/left
  var curX = this.position.x;
  var curY = this.position.y;

  var didNotMove = x == this.position.x && y == this.position.y;

  // save end position
  this.setPosition( x, y );

  // if did not move and not transitioning, just go to layout
  if ( didNotMove && !this.isTransitioning ) {
    this.layoutPosition();
    return;
  }

  var transX = x - curX;
  var transY = y - curY;
  var transitionStyle = {};
  transitionStyle.transform = this.getTranslate( transX, transY );

  this.transition({
    to: transitionStyle,
    onTransitionEnd: {
      transform: this.layoutPosition
    },
    isCleaning: true
  });
};

proto.getTranslate = function( x, y ) {
  // flip cooridinates if origin on right or bottom
  var isOriginLeft = this.layout._getOption('originLeft');
  var isOriginTop = this.layout._getOption('originTop');
  x = isOriginLeft ? x : -x;
  y = isOriginTop ? y : -y;
  return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
};

// non transition + transform support
proto.goTo = function( x, y ) {
  this.setPosition( x, y );
  this.layoutPosition();
};

proto.moveTo = proto._transitionTo;

proto.setPosition = function( x, y ) {
  this.position.x = parseFloat( x );
  this.position.y = parseFloat( y );
};

// ----- transition ----- //

/**
 * @param {Object} style - CSS
 * @param {Function} onTransitionEnd
 */

// non transition, just trigger callback
proto._nonTransition = function( args ) {
  this.css( args.to );
  if ( args.isCleaning ) {
    this._removeStyles( args.to );
  }
  for ( var prop in args.onTransitionEnd ) {
    args.onTransitionEnd[ prop ].call( this );
  }
};

/**
 * proper transition
 * @param {Object} args - arguments
 *   @param {Object} to - style to transition to
 *   @param {Object} from - style to start transition from
 *   @param {Boolean} isCleaning - removes transition styles after transition
 *   @param {Function} onTransitionEnd - callback
 */
proto.transition = function( args ) {
  // redirect to nonTransition if no transition duration
  if ( !parseFloat( this.layout.options.transitionDuration ) ) {
    this._nonTransition( args );
    return;
  }

  var _transition = this._transn;
  // keep track of onTransitionEnd callback by css property
  for ( var prop in args.onTransitionEnd ) {
    _transition.onEnd[ prop ] = args.onTransitionEnd[ prop ];
  }
  // keep track of properties that are transitioning
  for ( prop in args.to ) {
    _transition.ingProperties[ prop ] = true;
    // keep track of properties to clean up when transition is done
    if ( args.isCleaning ) {
      _transition.clean[ prop ] = true;
    }
  }

  // set from styles
  if ( args.from ) {
    this.css( args.from );
    // force redraw. http://blog.alexmaccaw.com/css-transitions
    var h = this.element.offsetHeight;
    // hack for JSHint to hush about unused var
    h = null;
  }
  // enable transition
  this.enableTransition( args.to );
  // set styles that are transitioning
  this.css( args.to );

  this.isTransitioning = true;

};

// dash before all cap letters, including first for
// WebkitTransform => -webkit-transform
function toDashedAll( str ) {
  return str.replace( /([A-Z])/g, function( $1 ) {
    return '-' + $1.toLowerCase();
  });
}

var transitionProps = 'opacity,' + toDashedAll( transformProperty );

proto.enableTransition = function(/* style */) {
  // HACK changing transitionProperty during a transition
  // will cause transition to jump
  if ( this.isTransitioning ) {
    return;
  }

  // make `transition: foo, bar, baz` from style object
  // HACK un-comment this when enableTransition can work
  // while a transition is happening
  // var transitionValues = [];
  // for ( var prop in style ) {
  //   // dash-ify camelCased properties like WebkitTransition
  //   prop = vendorProperties[ prop ] || prop;
  //   transitionValues.push( toDashedAll( prop ) );
  // }
  // munge number to millisecond, to match stagger
  var duration = this.layout.options.transitionDuration;
  duration = typeof duration == 'number' ? duration + 'ms' : duration;
  // enable transition styles
  this.css({
    transitionProperty: transitionProps,
    transitionDuration: duration,
    transitionDelay: this.staggerDelay || 0
  });
  // listen for transition end event
  this.element.addEventListener( transitionEndEvent, this, false );
};

// ----- events ----- //

proto.onwebkitTransitionEnd = function( event ) {
  this.ontransitionend( event );
};

proto.onotransitionend = function( event ) {
  this.ontransitionend( event );
};

// properties that I munge to make my life easier
var dashedVendorProperties = {
  '-webkit-transform': 'transform'
};

proto.ontransitionend = function( event ) {
  // disregard bubbled events from children
  if ( event.target !== this.element ) {
    return;
  }
  var _transition = this._transn;
  // get property name of transitioned property, convert to prefix-free
  var propertyName = dashedVendorProperties[ event.propertyName ] || event.propertyName;

  // remove property that has completed transitioning
  delete _transition.ingProperties[ propertyName ];
  // check if any properties are still transitioning
  if ( isEmptyObj( _transition.ingProperties ) ) {
    // all properties have completed transitioning
    this.disableTransition();
  }
  // clean style
  if ( propertyName in _transition.clean ) {
    // clean up style
    this.element.style[ event.propertyName ] = '';
    delete _transition.clean[ propertyName ];
  }
  // trigger onTransitionEnd callback
  if ( propertyName in _transition.onEnd ) {
    var onTransitionEnd = _transition.onEnd[ propertyName ];
    onTransitionEnd.call( this );
    delete _transition.onEnd[ propertyName ];
  }

  this.emitEvent( 'transitionEnd', [ this ] );
};

proto.disableTransition = function() {
  this.removeTransitionStyles();
  this.element.removeEventListener( transitionEndEvent, this, false );
  this.isTransitioning = false;
};

/**
 * removes style property from element
 * @param {Object} style
**/
proto._removeStyles = function( style ) {
  // clean up transition styles
  var cleanStyle = {};
  for ( var prop in style ) {
    cleanStyle[ prop ] = '';
  }
  this.css( cleanStyle );
};

var cleanTransitionStyle = {
  transitionProperty: '',
  transitionDuration: '',
  transitionDelay: ''
};

proto.removeTransitionStyles = function() {
  // remove transition
  this.css( cleanTransitionStyle );
};

// ----- stagger ----- //

proto.stagger = function( delay ) {
  delay = isNaN( delay ) ? 0 : delay;
  this.staggerDelay = delay + 'ms';
};

// ----- show/hide/remove ----- //

// remove element from DOM
proto.removeElem = function() {
  this.element.parentNode.removeChild( this.element );
  // remove display: none
  this.css({ display: '' });
  this.emitEvent( 'remove', [ this ] );
};

proto.remove = function() {
  // just remove element if no transition support or no transition
  if ( !transitionProperty || !parseFloat( this.layout.options.transitionDuration ) ) {
    this.removeElem();
    return;
  }

  // start transition
  this.once( 'transitionEnd', function() {
    this.removeElem();
  });
  this.hide();
};

proto.reveal = function() {
  delete this.isHidden;
  // remove display: none
  this.css({ display: '' });

  var options = this.layout.options;

  var onTransitionEnd = {};
  var transitionEndProperty = this.getHideRevealTransitionEndProperty('visibleStyle');
  onTransitionEnd[ transitionEndProperty ] = this.onRevealTransitionEnd;

  this.transition({
    from: options.hiddenStyle,
    to: options.visibleStyle,
    isCleaning: true,
    onTransitionEnd: onTransitionEnd
  });
};

proto.onRevealTransitionEnd = function() {
  // check if still visible
  // during transition, item may have been hidden
  if ( !this.isHidden ) {
    this.emitEvent('reveal');
  }
};

/**
 * get style property use for hide/reveal transition end
 * @param {String} styleProperty - hiddenStyle/visibleStyle
 * @returns {String}
 */
proto.getHideRevealTransitionEndProperty = function( styleProperty ) {
  var optionStyle = this.layout.options[ styleProperty ];
  // use opacity
  if ( optionStyle.opacity ) {
    return 'opacity';
  }
  // get first property
  for ( var prop in optionStyle ) {
    return prop;
  }
};

proto.hide = function() {
  // set flag
  this.isHidden = true;
  // remove display: none
  this.css({ display: '' });

  var options = this.layout.options;

  var onTransitionEnd = {};
  var transitionEndProperty = this.getHideRevealTransitionEndProperty('hiddenStyle');
  onTransitionEnd[ transitionEndProperty ] = this.onHideTransitionEnd;

  this.transition({
    from: options.visibleStyle,
    to: options.hiddenStyle,
    // keep hidden stuff hidden
    isCleaning: true,
    onTransitionEnd: onTransitionEnd
  });
};

proto.onHideTransitionEnd = function() {
  // check if still hidden
  // during transition, item may have been un-hidden
  if ( this.isHidden ) {
    this.css({ display: 'none' });
    this.emitEvent('hide');
  }
};

proto.destroy = function() {
  this.css({
    position: '',
    left: '',
    right: '',
    top: '',
    bottom: '',
    transition: '',
    transform: ''
  });
};

return Item;

}));

/*!
 * Outlayer v2.1.1
 * the brains and guts of a layout library
 * MIT license
 */

( function( window, factory ) {
  'use strict';
  // universal module definition
  /* jshint strict: false */ /* globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS
    define( 'outlayer/outlayer',[
        'ev-emitter/ev-emitter',
        'get-size/get-size',
        'fizzy-ui-utils/utils',
        './item'
      ],
      function( EvEmitter, getSize, utils, Item ) {
        return factory( window, EvEmitter, getSize, utils, Item);
      }
    );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Browserify, Webpack
    module.exports = factory(
      window,
      require('ev-emitter'),
      require('get-size'),
      require('fizzy-ui-utils'),
      require('./item')
    );
  } else {
    // browser global
    window.Outlayer = factory(
      window,
      window.EvEmitter,
      window.getSize,
      window.fizzyUIUtils,
      window.Outlayer.Item
    );
  }

}( window, function factory( window, EvEmitter, getSize, utils, Item ) {
'use strict';

// ----- vars ----- //

var console = window.console;
var jQuery = window.jQuery;
var noop = function() {};

// -------------------------- Outlayer -------------------------- //

// globally unique identifiers
var GUID = 0;
// internal store of all Outlayer intances
var instances = {};


/**
 * @param {Element, String} element
 * @param {Object} options
 * @constructor
 */
function Outlayer( element, options ) {
  var queryElement = utils.getQueryElement( element );
  if ( !queryElement ) {
    if ( console ) {
      console.error( 'Bad element for ' + this.constructor.namespace +
        ': ' + ( queryElement || element ) );
    }
    return;
  }
  this.element = queryElement;
  // add jQuery
  if ( jQuery ) {
    this.$element = jQuery( this.element );
  }

  // options
  this.options = utils.extend( {}, this.constructor.defaults );
  this.option( options );

  // add id for Outlayer.getFromElement
  var id = ++GUID;
  this.element.outlayerGUID = id; // expando
  instances[ id ] = this; // associate via id

  // kick it off
  this._create();

  var isInitLayout = this._getOption('initLayout');
  if ( isInitLayout ) {
    this.layout();
  }
}

// settings are for internal use only
Outlayer.namespace = 'outlayer';
Outlayer.Item = Item;

// default options
Outlayer.defaults = {
  containerStyle: {
    position: 'relative'
  },
  initLayout: true,
  originLeft: true,
  originTop: true,
  resize: true,
  resizeContainer: true,
  // item options
  transitionDuration: '0.4s',
  hiddenStyle: {
    opacity: 0,
    transform: 'scale(0.001)'
  },
  visibleStyle: {
    opacity: 1,
    transform: 'scale(1)'
  }
};

var proto = Outlayer.prototype;
// inherit EvEmitter
utils.extend( proto, EvEmitter.prototype );

/**
 * set options
 * @param {Object} opts
 */
proto.option = function( opts ) {
  utils.extend( this.options, opts );
};

/**
 * get backwards compatible option value, check old name
 */
proto._getOption = function( option ) {
  var oldOption = this.constructor.compatOptions[ option ];
  return oldOption && this.options[ oldOption ] !== undefined ?
    this.options[ oldOption ] : this.options[ option ];
};

Outlayer.compatOptions = {
  // currentName: oldName
  initLayout: 'isInitLayout',
  horizontal: 'isHorizontal',
  layoutInstant: 'isLayoutInstant',
  originLeft: 'isOriginLeft',
  originTop: 'isOriginTop',
  resize: 'isResizeBound',
  resizeContainer: 'isResizingContainer'
};

proto._create = function() {
  // get items from children
  this.reloadItems();
  // elements that affect layout, but are not laid out
  this.stamps = [];
  this.stamp( this.options.stamp );
  // set container style
  utils.extend( this.element.style, this.options.containerStyle );

  // bind resize method
  var canBindResize = this._getOption('resize');
  if ( canBindResize ) {
    this.bindResize();
  }
};

// goes through all children again and gets bricks in proper order
proto.reloadItems = function() {
  // collection of item elements
  this.items = this._itemize( this.element.children );
};


/**
 * turn elements into Outlayer.Items to be used in layout
 * @param {Array or NodeList or HTMLElement} elems
 * @returns {Array} items - collection of new Outlayer Items
 */
proto._itemize = function( elems ) {

  var itemElems = this._filterFindItemElements( elems );
  var Item = this.constructor.Item;

  // create new Outlayer Items for collection
  var items = [];
  for ( var i=0; i < itemElems.length; i++ ) {
    var elem = itemElems[i];
    var item = new Item( elem, this );
    items.push( item );
  }

  return items;
};

/**
 * get item elements to be used in layout
 * @param {Array or NodeList or HTMLElement} elems
 * @returns {Array} items - item elements
 */
proto._filterFindItemElements = function( elems ) {
  return utils.filterFindElements( elems, this.options.itemSelector );
};

/**
 * getter method for getting item elements
 * @returns {Array} elems - collection of item elements
 */
proto.getItemElements = function() {
  return this.items.map( function( item ) {
    return item.element;
  });
};

// ----- init & layout ----- //

/**
 * lays out all items
 */
proto.layout = function() {
  this._resetLayout();
  this._manageStamps();

  // don't animate first layout
  var layoutInstant = this._getOption('layoutInstant');
  var isInstant = layoutInstant !== undefined ?
    layoutInstant : !this._isLayoutInited;
  this.layoutItems( this.items, isInstant );

  // flag for initalized
  this._isLayoutInited = true;
};

// _init is alias for layout
proto._init = proto.layout;

/**
 * logic before any new layout
 */
proto._resetLayout = function() {
  this.getSize();
};


proto.getSize = function() {
  this.size = getSize( this.element );
};

/**
 * get measurement from option, for columnWidth, rowHeight, gutter
 * if option is String -> get element from selector string, & get size of element
 * if option is Element -> get size of element
 * else use option as a number
 *
 * @param {String} measurement
 * @param {String} size - width or height
 * @private
 */
proto._getMeasurement = function( measurement, size ) {
  var option = this.options[ measurement ];
  var elem;
  if ( !option ) {
    // default to 0
    this[ measurement ] = 0;
  } else {
    // use option as an element
    if ( typeof option == 'string' ) {
      elem = this.element.querySelector( option );
    } else if ( option instanceof HTMLElement ) {
      elem = option;
    }
    // use size of element, if element
    this[ measurement ] = elem ? getSize( elem )[ size ] : option;
  }
};

/**
 * layout a collection of item elements
 * @api public
 */
proto.layoutItems = function( items, isInstant ) {
  items = this._getItemsForLayout( items );

  this._layoutItems( items, isInstant );

  this._postLayout();
};

/**
 * get the items to be laid out
 * you may want to skip over some items
 * @param {Array} items
 * @returns {Array} items
 */
proto._getItemsForLayout = function( items ) {
  return items.filter( function( item ) {
    return !item.isIgnored;
  });
};

/**
 * layout items
 * @param {Array} items
 * @param {Boolean} isInstant
 */
proto._layoutItems = function( items, isInstant ) {
  this._emitCompleteOnItems( 'layout', items );

  if ( !items || !items.length ) {
    // no items, emit event with empty array
    return;
  }

  var queue = [];

  items.forEach( function( item ) {
    // get x/y object from method
    var position = this._getItemLayoutPosition( item );
    // enqueue
    position.item = item;
    position.isInstant = isInstant || item.isLayoutInstant;
    queue.push( position );
  }, this );

  this._processLayoutQueue( queue );
};

/**
 * get item layout position
 * @param {Outlayer.Item} item
 * @returns {Object} x and y position
 */
proto._getItemLayoutPosition = function( /* item */ ) {
  return {
    x: 0,
    y: 0
  };
};

/**
 * iterate over array and position each item
 * Reason being - separating this logic prevents 'layout invalidation'
 * thx @paul_irish
 * @param {Array} queue
 */
proto._processLayoutQueue = function( queue ) {
  this.updateStagger();
  queue.forEach( function( obj, i ) {
    this._positionItem( obj.item, obj.x, obj.y, obj.isInstant, i );
  }, this );
};

// set stagger from option in milliseconds number
proto.updateStagger = function() {
  var stagger = this.options.stagger;
  if ( stagger === null || stagger === undefined ) {
    this.stagger = 0;
    return;
  }
  this.stagger = getMilliseconds( stagger );
  return this.stagger;
};

/**
 * Sets position of item in DOM
 * @param {Outlayer.Item} item
 * @param {Number} x - horizontal position
 * @param {Number} y - vertical position
 * @param {Boolean} isInstant - disables transitions
 */
proto._positionItem = function( item, x, y, isInstant, i ) {
  if ( isInstant ) {
    // if not transition, just set CSS
    item.goTo( x, y );
  } else {
    item.stagger( i * this.stagger );
    item.moveTo( x, y );
  }
};

/**
 * Any logic you want to do after each layout,
 * i.e. size the container
 */
proto._postLayout = function() {
  this.resizeContainer();
};

proto.resizeContainer = function() {
  var isResizingContainer = this._getOption('resizeContainer');
  if ( !isResizingContainer ) {
    return;
  }
  var size = this._getContainerSize();
  if ( size ) {
    this._setContainerMeasure( size.width, true );
    this._setContainerMeasure( size.height, false );
  }
};

/**
 * Sets width or height of container if returned
 * @returns {Object} size
 *   @param {Number} width
 *   @param {Number} height
 */
proto._getContainerSize = noop;

/**
 * @param {Number} measure - size of width or height
 * @param {Boolean} isWidth
 */
proto._setContainerMeasure = function( measure, isWidth ) {
  if ( measure === undefined ) {
    return;
  }

  var elemSize = this.size;
  // add padding and border width if border box
  if ( elemSize.isBorderBox ) {
    measure += isWidth ? elemSize.paddingLeft + elemSize.paddingRight +
      elemSize.borderLeftWidth + elemSize.borderRightWidth :
      elemSize.paddingBottom + elemSize.paddingTop +
      elemSize.borderTopWidth + elemSize.borderBottomWidth;
  }

  measure = Math.max( measure, 0 );
  this.element.style[ isWidth ? 'width' : 'height' ] = measure + 'px';
};

/**
 * emit eventComplete on a collection of items events
 * @param {String} eventName
 * @param {Array} items - Outlayer.Items
 */
proto._emitCompleteOnItems = function( eventName, items ) {
  var _this = this;
  function onComplete() {
    _this.dispatchEvent( eventName + 'Complete', null, [ items ] );
  }

  var count = items.length;
  if ( !items || !count ) {
    onComplete();
    return;
  }

  var doneCount = 0;
  function tick() {
    doneCount++;
    if ( doneCount == count ) {
      onComplete();
    }
  }

  // bind callback
  items.forEach( function( item ) {
    item.once( eventName, tick );
  });
};

/**
 * emits events via EvEmitter and jQuery events
 * @param {String} type - name of event
 * @param {Event} event - original event
 * @param {Array} args - extra arguments
 */
proto.dispatchEvent = function( type, event, args ) {
  // add original event to arguments
  var emitArgs = event ? [ event ].concat( args ) : args;
  this.emitEvent( type, emitArgs );

  if ( jQuery ) {
    // set this.$element
    this.$element = this.$element || jQuery( this.element );
    if ( event ) {
      // create jQuery event
      var $event = jQuery.Event( event );
      $event.type = type;
      this.$element.trigger( $event, args );
    } else {
      // just trigger with type if no event available
      this.$element.trigger( type, args );
    }
  }
};

// -------------------------- ignore & stamps -------------------------- //


/**
 * keep item in collection, but do not lay it out
 * ignored items do not get skipped in layout
 * @param {Element} elem
 */
proto.ignore = function( elem ) {
  var item = this.getItem( elem );
  if ( item ) {
    item.isIgnored = true;
  }
};

/**
 * return item to layout collection
 * @param {Element} elem
 */
proto.unignore = function( elem ) {
  var item = this.getItem( elem );
  if ( item ) {
    delete item.isIgnored;
  }
};

/**
 * adds elements to stamps
 * @param {NodeList, Array, Element, or String} elems
 */
proto.stamp = function( elems ) {
  elems = this._find( elems );
  if ( !elems ) {
    return;
  }

  this.stamps = this.stamps.concat( elems );
  // ignore
  elems.forEach( this.ignore, this );
};

/**
 * removes elements to stamps
 * @param {NodeList, Array, or Element} elems
 */
proto.unstamp = function( elems ) {
  elems = this._find( elems );
  if ( !elems ){
    return;
  }

  elems.forEach( function( elem ) {
    // filter out removed stamp elements
    utils.removeFrom( this.stamps, elem );
    this.unignore( elem );
  }, this );
};

/**
 * finds child elements
 * @param {NodeList, Array, Element, or String} elems
 * @returns {Array} elems
 */
proto._find = function( elems ) {
  if ( !elems ) {
    return;
  }
  // if string, use argument as selector string
  if ( typeof elems == 'string' ) {
    elems = this.element.querySelectorAll( elems );
  }
  elems = utils.makeArray( elems );
  return elems;
};

proto._manageStamps = function() {
  if ( !this.stamps || !this.stamps.length ) {
    return;
  }

  this._getBoundingRect();

  this.stamps.forEach( this._manageStamp, this );
};

// update boundingLeft / Top
proto._getBoundingRect = function() {
  // get bounding rect for container element
  var boundingRect = this.element.getBoundingClientRect();
  var size = this.size;
  this._boundingRect = {
    left: boundingRect.left + size.paddingLeft + size.borderLeftWidth,
    top: boundingRect.top + size.paddingTop + size.borderTopWidth,
    right: boundingRect.right - ( size.paddingRight + size.borderRightWidth ),
    bottom: boundingRect.bottom - ( size.paddingBottom + size.borderBottomWidth )
  };
};

/**
 * @param {Element} stamp
**/
proto._manageStamp = noop;

/**
 * get x/y position of element relative to container element
 * @param {Element} elem
 * @returns {Object} offset - has left, top, right, bottom
 */
proto._getElementOffset = function( elem ) {
  var boundingRect = elem.getBoundingClientRect();
  var thisRect = this._boundingRect;
  var size = getSize( elem );
  var offset = {
    left: boundingRect.left - thisRect.left - size.marginLeft,
    top: boundingRect.top - thisRect.top - size.marginTop,
    right: thisRect.right - boundingRect.right - size.marginRight,
    bottom: thisRect.bottom - boundingRect.bottom - size.marginBottom
  };
  return offset;
};

// -------------------------- resize -------------------------- //

// enable event handlers for listeners
// i.e. resize -> onresize
proto.handleEvent = utils.handleEvent;

/**
 * Bind layout to window resizing
 */
proto.bindResize = function() {
  window.addEventListener( 'resize', this );
  this.isResizeBound = true;
};

/**
 * Unbind layout to window resizing
 */
proto.unbindResize = function() {
  window.removeEventListener( 'resize', this );
  this.isResizeBound = false;
};

proto.onresize = function() {
  this.resize();
};

utils.debounceMethod( Outlayer, 'onresize', 100 );

proto.resize = function() {
  // don't trigger if size did not change
  // or if resize was unbound. See #9
  if ( !this.isResizeBound || !this.needsResizeLayout() ) {
    return;
  }

  this.layout();
};

/**
 * check if layout is needed post layout
 * @returns Boolean
 */
proto.needsResizeLayout = function() {
  var size = getSize( this.element );
  // check that this.size and size are there
  // IE8 triggers resize on body size change, so they might not be
  var hasSizes = this.size && size;
  return hasSizes && size.innerWidth !== this.size.innerWidth;
};

// -------------------------- methods -------------------------- //

/**
 * add items to Outlayer instance
 * @param {Array or NodeList or Element} elems
 * @returns {Array} items - Outlayer.Items
**/
proto.addItems = function( elems ) {
  var items = this._itemize( elems );
  // add items to collection
  if ( items.length ) {
    this.items = this.items.concat( items );
  }
  return items;
};

/**
 * Layout newly-appended item elements
 * @param {Array or NodeList or Element} elems
 */
proto.appended = function( elems ) {
  var items = this.addItems( elems );
  if ( !items.length ) {
    return;
  }
  // layout and reveal just the new items
  this.layoutItems( items, true );
  this.reveal( items );
};

/**
 * Layout prepended elements
 * @param {Array or NodeList or Element} elems
 */
proto.prepended = function( elems ) {
  var items = this._itemize( elems );
  if ( !items.length ) {
    return;
  }
  // add items to beginning of collection
  var previousItems = this.items.slice(0);
  this.items = items.concat( previousItems );
  // start new layout
  this._resetLayout();
  this._manageStamps();
  // layout new stuff without transition
  this.layoutItems( items, true );
  this.reveal( items );
  // layout previous items
  this.layoutItems( previousItems );
};

/**
 * reveal a collection of items
 * @param {Array of Outlayer.Items} items
 */
proto.reveal = function( items ) {
  this._emitCompleteOnItems( 'reveal', items );
  if ( !items || !items.length ) {
    return;
  }
  var stagger = this.updateStagger();
  items.forEach( function( item, i ) {
    item.stagger( i * stagger );
    item.reveal();
  });
};

/**
 * hide a collection of items
 * @param {Array of Outlayer.Items} items
 */
proto.hide = function( items ) {
  this._emitCompleteOnItems( 'hide', items );
  if ( !items || !items.length ) {
    return;
  }
  var stagger = this.updateStagger();
  items.forEach( function( item, i ) {
    item.stagger( i * stagger );
    item.hide();
  });
};

/**
 * reveal item elements
 * @param {Array}, {Element}, {NodeList} items
 */
proto.revealItemElements = function( elems ) {
  var items = this.getItems( elems );
  this.reveal( items );
};

/**
 * hide item elements
 * @param {Array}, {Element}, {NodeList} items
 */
proto.hideItemElements = function( elems ) {
  var items = this.getItems( elems );
  this.hide( items );
};

/**
 * get Outlayer.Item, given an Element
 * @param {Element} elem
 * @param {Function} callback
 * @returns {Outlayer.Item} item
 */
proto.getItem = function( elem ) {
  // loop through items to get the one that matches
  for ( var i=0; i < this.items.length; i++ ) {
    var item = this.items[i];
    if ( item.element == elem ) {
      // return item
      return item;
    }
  }
};

/**
 * get collection of Outlayer.Items, given Elements
 * @param {Array} elems
 * @returns {Array} items - Outlayer.Items
 */
proto.getItems = function( elems ) {
  elems = utils.makeArray( elems );
  var items = [];
  elems.forEach( function( elem ) {
    var item = this.getItem( elem );
    if ( item ) {
      items.push( item );
    }
  }, this );

  return items;
};

/**
 * remove element(s) from instance and DOM
 * @param {Array or NodeList or Element} elems
 */
proto.remove = function( elems ) {
  var removeItems = this.getItems( elems );

  this._emitCompleteOnItems( 'remove', removeItems );

  // bail if no items to remove
  if ( !removeItems || !removeItems.length ) {
    return;
  }

  removeItems.forEach( function( item ) {
    item.remove();
    // remove item from collection
    utils.removeFrom( this.items, item );
  }, this );
};

// ----- destroy ----- //

// remove and disable Outlayer instance
proto.destroy = function() {
  // clean up dynamic styles
  var style = this.element.style;
  style.height = '';
  style.position = '';
  style.width = '';
  // destroy items
  this.items.forEach( function( item ) {
    item.destroy();
  });

  this.unbindResize();

  var id = this.element.outlayerGUID;
  delete instances[ id ]; // remove reference to instance by id
  delete this.element.outlayerGUID;
  // remove data for jQuery
  if ( jQuery ) {
    jQuery.removeData( this.element, this.constructor.namespace );
  }

};

// -------------------------- data -------------------------- //

/**
 * get Outlayer instance from element
 * @param {Element} elem
 * @returns {Outlayer}
 */
Outlayer.data = function( elem ) {
  elem = utils.getQueryElement( elem );
  var id = elem && elem.outlayerGUID;
  return id && instances[ id ];
};


// -------------------------- create Outlayer class -------------------------- //

/**
 * create a layout class
 * @param {String} namespace
 */
Outlayer.create = function( namespace, options ) {
  // sub-class Outlayer
  var Layout = subclass( Outlayer );
  // apply new options and compatOptions
  Layout.defaults = utils.extend( {}, Outlayer.defaults );
  utils.extend( Layout.defaults, options );
  Layout.compatOptions = utils.extend( {}, Outlayer.compatOptions  );

  Layout.namespace = namespace;

  Layout.data = Outlayer.data;

  // sub-class Item
  Layout.Item = subclass( Item );

  // -------------------------- declarative -------------------------- //

  utils.htmlInit( Layout, namespace );

  // -------------------------- jQuery bridge -------------------------- //

  // make into jQuery plugin
  if ( jQuery && jQuery.bridget ) {
    jQuery.bridget( namespace, Layout );
  }

  return Layout;
};

function subclass( Parent ) {
  function SubClass() {
    Parent.apply( this, arguments );
  }

  SubClass.prototype = Object.create( Parent.prototype );
  SubClass.prototype.constructor = SubClass;

  return SubClass;
}

// ----- helpers ----- //

// how many milliseconds are in each unit
var msUnits = {
  ms: 1,
  s: 1000
};

// munge time-like parameter into millisecond number
// '0.4s' -> 40
function getMilliseconds( time ) {
  if ( typeof time == 'number' ) {
    return time;
  }
  var matches = time.match( /(^\d*\.?\d*)(\w*)/ );
  var num = matches && matches[1];
  var unit = matches && matches[2];
  if ( !num.length ) {
    return 0;
  }
  num = parseFloat( num );
  var mult = msUnits[ unit ] || 1;
  return num * mult;
}

// ----- fin ----- //

// back in global
Outlayer.Item = Item;

return Outlayer;

}));

/**
 * Rect
 * low-level utility class for basic geometry
 */

( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */ /* globals define, module */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( 'packery/js/rect',factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory();
  } else {
    // browser global
    window.Packery = window.Packery || {};
    window.Packery.Rect = factory();
  }

}( window, function factory() {
'use strict';

// -------------------------- Rect -------------------------- //

function Rect( props ) {
  // extend properties from defaults
  for ( var prop in Rect.defaults ) {
    this[ prop ] = Rect.defaults[ prop ];
  }

  for ( prop in props ) {
    this[ prop ] = props[ prop ];
  }

}

Rect.defaults = {
  x: 0,
  y: 0,
  width: 0,
  height: 0
};

var proto = Rect.prototype;

/**
 * Determines whether or not this rectangle wholly encloses another rectangle or point.
 * @param {Rect} rect
 * @returns {Boolean}
**/
proto.contains = function( rect ) {
  // points don't have width or height
  var otherWidth = rect.width || 0;
  var otherHeight = rect.height || 0;
  return this.x <= rect.x &&
    this.y <= rect.y &&
    this.x + this.width >= rect.x + otherWidth &&
    this.y + this.height >= rect.y + otherHeight;
};

/**
 * Determines whether or not the rectangle intersects with another.
 * @param {Rect} rect
 * @returns {Boolean}
**/
proto.overlaps = function( rect ) {
  var thisRight = this.x + this.width;
  var thisBottom = this.y + this.height;
  var rectRight = rect.x + rect.width;
  var rectBottom = rect.y + rect.height;

  // http://stackoverflow.com/a/306332
  return this.x < rectRight &&
    thisRight > rect.x &&
    this.y < rectBottom &&
    thisBottom > rect.y;
};

/**
 * @param {Rect} rect - the overlapping rect
 * @returns {Array} freeRects - rects representing the area around the rect
**/
proto.getMaximalFreeRects = function( rect ) {

  // if no intersection, return false
  if ( !this.overlaps( rect ) ) {
    return false;
  }

  var freeRects = [];
  var freeRect;

  var thisRight = this.x + this.width;
  var thisBottom = this.y + this.height;
  var rectRight = rect.x + rect.width;
  var rectBottom = rect.y + rect.height;

  // top
  if ( this.y < rect.y ) {
    freeRect = new Rect({
      x: this.x,
      y: this.y,
      width: this.width,
      height: rect.y - this.y
    });
    freeRects.push( freeRect );
  }

  // right
  if ( thisRight > rectRight ) {
    freeRect = new Rect({
      x: rectRight,
      y: this.y,
      width: thisRight - rectRight,
      height: this.height
    });
    freeRects.push( freeRect );
  }

  // bottom
  if ( thisBottom > rectBottom ) {
    freeRect = new Rect({
      x: this.x,
      y: rectBottom,
      width: this.width,
      height: thisBottom - rectBottom
    });
    freeRects.push( freeRect );
  }

  // left
  if ( this.x < rect.x ) {
    freeRect = new Rect({
      x: this.x,
      y: this.y,
      width: rect.x - this.x,
      height: this.height
    });
    freeRects.push( freeRect );
  }

  return freeRects;
};

proto.canFit = function( rect ) {
  return this.width >= rect.width && this.height >= rect.height;
};

return Rect;

}));

/**
 * Packer
 * bin-packing algorithm
 */

( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */ /* globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( 'packery/js/packer',[ './rect' ], factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      require('./rect')
    );
  } else {
    // browser global
    var Packery = window.Packery = window.Packery || {};
    Packery.Packer = factory( Packery.Rect );
  }

}( window, function factory( Rect ) {
'use strict';

// -------------------------- Packer -------------------------- //

/**
 * @param {Number} width
 * @param {Number} height
 * @param {String} sortDirection
 *   topLeft for vertical, leftTop for horizontal
 */
function Packer( width, height, sortDirection ) {
  this.width = width || 0;
  this.height = height || 0;
  this.sortDirection = sortDirection || 'downwardLeftToRight';

  this.reset();
}

var proto = Packer.prototype;

proto.reset = function() {
  this.spaces = [];

  var initialSpace = new Rect({
    x: 0,
    y: 0,
    width: this.width,
    height: this.height
  });

  this.spaces.push( initialSpace );
  // set sorter
  this.sorter = sorters[ this.sortDirection ] || sorters.downwardLeftToRight;
};

// change x and y of rect to fit with in Packer's available spaces
proto.pack = function( rect ) {
  for ( var i=0; i < this.spaces.length; i++ ) {
    var space = this.spaces[i];
    if ( space.canFit( rect ) ) {
      this.placeInSpace( rect, space );
      break;
    }
  }
};

proto.columnPack = function( rect ) {
  for ( var i=0; i < this.spaces.length; i++ ) {
    var space = this.spaces[i];
    var canFitInSpaceColumn = space.x <= rect.x &&
      space.x + space.width >= rect.x + rect.width &&
      space.height >= rect.height - 0.01; // fudge number for rounding error
    if ( canFitInSpaceColumn ) {
      rect.y = space.y;
      this.placed( rect );
      break;
    }
  }
};

proto.rowPack = function( rect ) {
  for ( var i=0; i < this.spaces.length; i++ ) {
    var space = this.spaces[i];
    var canFitInSpaceRow = space.y <= rect.y &&
      space.y + space.height >= rect.y + rect.height &&
      space.width >= rect.width - 0.01; // fudge number for rounding error
    if ( canFitInSpaceRow ) {
      rect.x = space.x;
      this.placed( rect );
      break;
    }
  }
};

proto.placeInSpace = function( rect, space ) {
  // place rect in space
  rect.x = space.x;
  rect.y = space.y;

  this.placed( rect );
};

// update spaces with placed rect
proto.placed = function( rect ) {
  // update spaces
  var revisedSpaces = [];
  for ( var i=0; i < this.spaces.length; i++ ) {
    var space = this.spaces[i];
    var newSpaces = space.getMaximalFreeRects( rect );
    // add either the original space or the new spaces to the revised spaces
    if ( newSpaces ) {
      revisedSpaces.push.apply( revisedSpaces, newSpaces );
    } else {
      revisedSpaces.push( space );
    }
  }

  this.spaces = revisedSpaces;

  this.mergeSortSpaces();
};

proto.mergeSortSpaces = function() {
  // remove redundant spaces
  Packer.mergeRects( this.spaces );
  this.spaces.sort( this.sorter );
};

// add a space back
proto.addSpace = function( rect ) {
  this.spaces.push( rect );
  this.mergeSortSpaces();
};

// -------------------------- utility functions -------------------------- //

/**
 * Remove redundant rectangle from array of rectangles
 * @param {Array} rects: an array of Rects
 * @returns {Array} rects: an array of Rects
**/
Packer.mergeRects = function( rects ) {
  var i = 0;
  var rect = rects[i];

  rectLoop:
  while ( rect ) {
    var j = 0;
    var compareRect = rects[ i + j ];

    while ( compareRect ) {
      if  ( compareRect == rect ) {
        j++; // next
      } else if ( compareRect.contains( rect ) ) {
        // remove rect
        rects.splice( i, 1 );
        rect = rects[i]; // set next rect
        continue rectLoop; // bail on compareLoop
      } else if ( rect.contains( compareRect ) ) {
        // remove compareRect
        rects.splice( i + j, 1 );
      } else {
        j++;
      }
      compareRect = rects[ i + j ]; // set next compareRect
    }
    i++;
    rect = rects[i];
  }

  return rects;
};


// -------------------------- sorters -------------------------- //

// functions for sorting rects in order
var sorters = {
  // top down, then left to right
  downwardLeftToRight: function( a, b ) {
    return a.y - b.y || a.x - b.x;
  },
  // left to right, then top down
  rightwardTopToBottom: function( a, b ) {
    return a.x - b.x || a.y - b.y;
  }
};


// --------------------------  -------------------------- //

return Packer;

}));

/**
 * Packery Item Element
**/

( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */ /* globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( 'packery/js/item',[
        'outlayer/outlayer',
        './rect'
      ],
      factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      require('outlayer'),
      require('./rect')
    );
  } else {
    // browser global
    window.Packery.Item = factory(
      window.Outlayer,
      window.Packery.Rect
    );
  }

}( window, function factory( Outlayer, Rect ) {
'use strict';

// -------------------------- Item -------------------------- //

var docElemStyle = document.documentElement.style;

var transformProperty = typeof docElemStyle.transform == 'string' ?
  'transform' : 'WebkitTransform';

// sub-class Item
var Item = function PackeryItem() {
  Outlayer.Item.apply( this, arguments );
};

var proto = Item.prototype = Object.create( Outlayer.Item.prototype );

var __create = proto._create;
proto._create = function() {
  // call default _create logic
  __create.call( this );
  this.rect = new Rect();
};

var _moveTo = proto.moveTo;
proto.moveTo = function( x, y ) {
  // don't shift 1px while dragging
  var dx = Math.abs( this.position.x - x );
  var dy = Math.abs( this.position.y - y );

  var canHackGoTo = this.layout.dragItemCount && !this.isPlacing &&
    !this.isTransitioning && dx < 1 && dy < 1;
  if ( canHackGoTo ) {
    this.goTo( x, y );
    return;
  }
  _moveTo.apply( this, arguments );
};

// -------------------------- placing -------------------------- //

proto.enablePlacing = function() {
  this.removeTransitionStyles();
  // remove transform property from transition
  if ( this.isTransitioning && transformProperty ) {
    this.element.style[ transformProperty ] = 'none';
  }
  this.isTransitioning = false;
  this.getSize();
  this.layout._setRectSize( this.element, this.rect );
  this.isPlacing = true;
};

proto.disablePlacing = function() {
  this.isPlacing = false;
};

// -----  ----- //

// remove element from DOM
proto.removeElem = function() {
  var parent = this.element.parentNode;
  if ( parent ) {
    parent.removeChild( this.element );
  }
  // add space back to packer
  this.layout.packer.addSpace( this.rect );
  this.emitEvent( 'remove', [ this ] );
};

// ----- dropPlaceholder ----- //

proto.showDropPlaceholder = function() {
  var dropPlaceholder = this.dropPlaceholder;
  if ( !dropPlaceholder ) {
    // create dropPlaceholder
    dropPlaceholder = this.dropPlaceholder = document.createElement('div');
    dropPlaceholder.className = 'packery-drop-placeholder';
    dropPlaceholder.style.position = 'absolute';
  }

  dropPlaceholder.style.width = this.size.width + 'px';
  dropPlaceholder.style.height = this.size.height + 'px';
  this.positionDropPlaceholder();
  this.layout.element.appendChild( dropPlaceholder );
};

proto.positionDropPlaceholder = function() {
  this.dropPlaceholder.style[ transformProperty ] = 'translate(' +
    this.rect.x + 'px, ' + this.rect.y + 'px)';
};

proto.hideDropPlaceholder = function() {
  // only remove once, #333
  var parent = this.dropPlaceholder.parentNode;
  if ( parent ) {
    parent.removeChild( this.dropPlaceholder );
  }
};

// -----  ----- //

return Item;

}));

/*!
 * Packery v2.1.2
 * Gapless, draggable grid layouts
 *
 * Licensed GPLv3 for open source use
 * or Packery Commercial License for commercial use
 *
 * http://packery.metafizzy.co
 * Copyright 2013-2018 Metafizzy
 */

( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */ /* globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
        'get-size/get-size',
        'outlayer/outlayer',
        'packery/js/rect',
        'packery/js/packer',
        'packery/js/item'
      ],
      factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      require('get-size'),
      require('outlayer'),
      require('./rect'),
      require('./packer'),
      require('./item')
    );
  } else {
    // browser global
    window.Packery = factory(
      window.getSize,
      window.Outlayer,
      window.Packery.Rect,
      window.Packery.Packer,
      window.Packery.Item
    );
  }

}( window, function factory( getSize, Outlayer, Rect, Packer, Item ) {
'use strict';

// ----- Rect ----- //

// allow for pixel rounding errors IE8-IE11 & Firefox; #227
Rect.prototype.canFit = function( rect ) {
  return this.width >= rect.width - 1 && this.height >= rect.height - 1;
};

// -------------------------- Packery -------------------------- //

// create an Outlayer layout class
var Packery = Outlayer.create('packery');
Packery.Item = Item;

var proto = Packery.prototype;

proto._create = function() {
  // call super
  Outlayer.prototype._create.call( this );

  // initial properties
  this.packer = new Packer();
  // packer for drop targets
  this.shiftPacker = new Packer();
  this.isEnabled = true;

  this.dragItemCount = 0;

  // create drag handlers
  var _this = this;
  this.handleDraggabilly = {
    dragStart: function() {
      _this.itemDragStart( this.element );
    },
    dragMove: function() {
      _this.itemDragMove( this.element, this.position.x, this.position.y );
    },
    dragEnd: function() {
      _this.itemDragEnd( this.element );
    }
  };

  this.handleUIDraggable = {
    start: function handleUIDraggableStart( event, ui ) {
      // HTML5 may trigger dragstart, dismiss HTML5 dragging
      if ( !ui ) {
        return;
      }
      _this.itemDragStart( event.currentTarget );
    },
    drag: function handleUIDraggableDrag( event, ui ) {
      if ( !ui ) {
        return;
      }
      _this.itemDragMove( event.currentTarget, ui.position.left, ui.position.top );
    },
    stop: function handleUIDraggableStop( event, ui ) {
      if ( !ui ) {
        return;
      }
      _this.itemDragEnd( event.currentTarget );
    }
  };

};


// ----- init & layout ----- //

/**
 * logic before any new layout
 */
proto._resetLayout = function() {
  this.getSize();

  this._getMeasurements();

  // reset packer
  var width, height, sortDirection;
  // packer settings, if horizontal or vertical
  if ( this._getOption('horizontal') ) {
    width = Infinity;
    height = this.size.innerHeight + this.gutter;
    sortDirection = 'rightwardTopToBottom';
  } else {
    width = this.size.innerWidth + this.gutter;
    height = Infinity;
    sortDirection = 'downwardLeftToRight';
  }

  this.packer.width = this.shiftPacker.width = width;
  this.packer.height = this.shiftPacker.height = height;
  this.packer.sortDirection = this.shiftPacker.sortDirection = sortDirection;

  this.packer.reset();

  // layout
  this.maxY = 0;
  this.maxX = 0;
};

/**
 * update columnWidth, rowHeight, & gutter
 * @private
 */
proto._getMeasurements = function() {
  this._getMeasurement( 'columnWidth', 'width' );
  this._getMeasurement( 'rowHeight', 'height' );
  this._getMeasurement( 'gutter', 'width' );
};

proto._getItemLayoutPosition = function( item ) {
  this._setRectSize( item.element, item.rect );
  if ( this.isShifting || this.dragItemCount > 0 ) {
    var packMethod = this._getPackMethod();
    this.packer[ packMethod ]( item.rect );
  } else {
    this.packer.pack( item.rect );
  }

  this._setMaxXY( item.rect );
  return item.rect;
};

proto.shiftLayout = function() {
  this.isShifting = true;
  this.layout();
  delete this.isShifting;
};

proto._getPackMethod = function() {
  return this._getOption('horizontal') ? 'rowPack' : 'columnPack';
};


/**
 * set max X and Y value, for size of container
 * @param {Packery.Rect} rect
 * @private
 */
proto._setMaxXY = function( rect ) {
  this.maxX = Math.max( rect.x + rect.width, this.maxX );
  this.maxY = Math.max( rect.y + rect.height, this.maxY );
};

/**
 * set the width and height of a rect, applying columnWidth and rowHeight
 * @param {Element} elem
 * @param {Packery.Rect} rect
 */
proto._setRectSize = function( elem, rect ) {
  var size = getSize( elem );
  var w = size.outerWidth;
  var h = size.outerHeight;
  // size for columnWidth and rowHeight, if available
  // only check if size is non-zero, #177
  if ( w || h ) {
    w = this._applyGridGutter( w, this.columnWidth );
    h = this._applyGridGutter( h, this.rowHeight );
  }
  // rect must fit in packer
  rect.width = Math.min( w, this.packer.width );
  rect.height = Math.min( h, this.packer.height );
};

/**
 * fits item to columnWidth/rowHeight and adds gutter
 * @param {Number} measurement - item width or height
 * @param {Number} gridSize - columnWidth or rowHeight
 * @returns measurement
 */
proto._applyGridGutter = function( measurement, gridSize ) {
  // just add gutter if no gridSize
  if ( !gridSize ) {
    return measurement + this.gutter;
  }
  gridSize += this.gutter;
  // fit item to columnWidth/rowHeight
  var remainder = measurement % gridSize;
  var mathMethod = remainder && remainder < 1 ? 'round' : 'ceil';
  measurement = Math[ mathMethod ]( measurement / gridSize ) * gridSize;
  return measurement;
};

proto._getContainerSize = function() {
  if ( this._getOption('horizontal') ) {
    return {
      width: this.maxX - this.gutter
    };
  } else {
    return {
      height: this.maxY - this.gutter
    };
  }
};


// -------------------------- stamp -------------------------- //

/**
 * makes space for element
 * @param {Element} elem
 */
proto._manageStamp = function( elem ) {

  var item = this.getItem( elem );
  var rect;
  if ( item && item.isPlacing ) {
    rect = item.rect;
  } else {
    var offset = this._getElementOffset( elem );
    rect = new Rect({
      x: this._getOption('originLeft') ? offset.left : offset.right,
      y: this._getOption('originTop') ? offset.top : offset.bottom
    });
  }

  this._setRectSize( elem, rect );
  // save its space in the packer
  this.packer.placed( rect );
  this._setMaxXY( rect );
};

// -------------------------- methods -------------------------- //

function verticalSorter( a, b ) {
  return a.position.y - b.position.y || a.position.x - b.position.x;
}

function horizontalSorter( a, b ) {
  return a.position.x - b.position.x || a.position.y - b.position.y;
}

proto.sortItemsByPosition = function() {
  var sorter = this._getOption('horizontal') ? horizontalSorter : verticalSorter;
  this.items.sort( sorter );
};

/**
 * Fit item element in its current position
 * Packery will position elements around it
 * useful for expanding elements
 *
 * @param {Element} elem
 * @param {Number} x - horizontal destination position, optional
 * @param {Number} y - vertical destination position, optional
 */
proto.fit = function( elem, x, y ) {
  var item = this.getItem( elem );
  if ( !item ) {
    return;
  }

  // stamp item to get it out of layout
  this.stamp( item.element );
  // set placing flag
  item.enablePlacing();
  this.updateShiftTargets( item );
  // fall back to current position for fitting
  x = x === undefined ? item.rect.x: x;
  y = y === undefined ? item.rect.y: y;
  // position it best at its destination
  this.shift( item, x, y );
  this._bindFitEvents( item );
  item.moveTo( item.rect.x, item.rect.y );
  // layout everything else
  this.shiftLayout();
  // return back to regularly scheduled programming
  this.unstamp( item.element );
  this.sortItemsByPosition();
  item.disablePlacing();
};

/**
 * emit event when item is fit and other items are laid out
 * @param {Packery.Item} item
 * @private
 */
proto._bindFitEvents = function( item ) {
  var _this = this;
  var ticks = 0;
  function onLayout() {
    ticks++;
    if ( ticks != 2 ) {
      return;
    }
    _this.dispatchEvent( 'fitComplete', null, [ item ] );
  }
  // when item is laid out
  item.once( 'layout', onLayout );
  // when all items are laid out
  this.once( 'layoutComplete', onLayout );
};

// -------------------------- resize -------------------------- //

// debounced, layout on resize
proto.resize = function() {
  // don't trigger if size did not change
  // or if resize was unbound. See #285, outlayer#9
  if ( !this.isResizeBound || !this.needsResizeLayout() ) {
    return;
  }

  if ( this.options.shiftPercentResize ) {
    this.resizeShiftPercentLayout();
  } else {
    this.layout();
  }
};

/**
 * check if layout is needed post layout
 * @returns Boolean
 */
proto.needsResizeLayout = function() {
  var size = getSize( this.element );
  var innerSize = this._getOption('horizontal') ? 'innerHeight' : 'innerWidth';
  return size[ innerSize ] != this.size[ innerSize ];
};

proto.resizeShiftPercentLayout = function() {
  var items = this._getItemsForLayout( this.items );

  var isHorizontal = this._getOption('horizontal');
  var coord = isHorizontal ? 'y' : 'x';
  var measure = isHorizontal ? 'height' : 'width';
  var segmentName = isHorizontal ? 'rowHeight' : 'columnWidth';
  var innerSize = isHorizontal ? 'innerHeight' : 'innerWidth';

  // proportional re-align items
  var previousSegment = this[ segmentName ];
  previousSegment = previousSegment && previousSegment + this.gutter;

  if ( previousSegment ) {
    this._getMeasurements();
    var currentSegment = this[ segmentName ] + this.gutter;
    items.forEach( function( item ) {
      var seg = Math.round( item.rect[ coord ] / previousSegment );
      item.rect[ coord ] = seg * currentSegment;
    });
  } else {
    var currentSize = getSize( this.element )[ innerSize ] + this.gutter;
    var previousSize = this.packer[ measure ];
    items.forEach( function( item ) {
      item.rect[ coord ] = ( item.rect[ coord ] / previousSize ) * currentSize;
    });
  }

  this.shiftLayout();
};

// -------------------------- drag -------------------------- //

/**
 * handle an item drag start event
 * @param {Element} elem
 */
proto.itemDragStart = function( elem ) {
  if ( !this.isEnabled ) {
    return;
  }
  this.stamp( elem );
  // this.ignore( elem );
  var item = this.getItem( elem );
  if ( !item ) {
    return;
  }

  item.enablePlacing();
  item.showDropPlaceholder();
  this.dragItemCount++;
  this.updateShiftTargets( item );
};

proto.updateShiftTargets = function( dropItem ) {
  this.shiftPacker.reset();

  // pack stamps
  this._getBoundingRect();
  var isOriginLeft = this._getOption('originLeft');
  var isOriginTop = this._getOption('originTop');
  this.stamps.forEach( function( stamp ) {
    // ignore dragged item
    var item = this.getItem( stamp );
    if ( item && item.isPlacing ) {
      return;
    }
    var offset = this._getElementOffset( stamp );
    var rect = new Rect({
      x: isOriginLeft ? offset.left : offset.right,
      y: isOriginTop ? offset.top : offset.bottom
    });
    this._setRectSize( stamp, rect );
    // save its space in the packer
    this.shiftPacker.placed( rect );
  }, this );

  // reset shiftTargets
  var isHorizontal = this._getOption('horizontal');
  var segmentName = isHorizontal ? 'rowHeight' : 'columnWidth';
  var measure = isHorizontal ? 'height' : 'width';

  this.shiftTargetKeys = [];
  this.shiftTargets = [];
  var boundsSize;
  var segment = this[ segmentName ];
  segment = segment && segment + this.gutter;

  if ( segment ) {
    var segmentSpan = Math.ceil( dropItem.rect[ measure ] / segment );
    var segs = Math.floor( ( this.shiftPacker[ measure ] + this.gutter ) / segment );
    boundsSize = ( segs - segmentSpan ) * segment;
    // add targets on top
    for ( var i=0; i < segs; i++ ) {
      var initialX = isHorizontal ? 0 : i * segment;
      var initialY = isHorizontal ? i * segment : 0;
      this._addShiftTarget( initialX, initialY, boundsSize );
    }
  } else {
    boundsSize = ( this.shiftPacker[ measure ] + this.gutter ) - dropItem.rect[ measure ];
    this._addShiftTarget( 0, 0, boundsSize );
  }

  // pack each item to measure where shiftTargets are
  var items = this._getItemsForLayout( this.items );
  var packMethod = this._getPackMethod();
  items.forEach( function( item ) {
    var rect = item.rect;
    this._setRectSize( item.element, rect );
    this.shiftPacker[ packMethod ]( rect );

    // add top left corner
    this._addShiftTarget( rect.x, rect.y, boundsSize );
    // add bottom left / top right corner
    var cornerX = isHorizontal ? rect.x + rect.width : rect.x;
    var cornerY = isHorizontal ? rect.y : rect.y + rect.height;
    this._addShiftTarget( cornerX, cornerY, boundsSize );

    if ( segment ) {
      // add targets for each column on bottom / row on right
      var segSpan = Math.round( rect[ measure ] / segment );
      for ( var i=1; i < segSpan; i++ ) {
        var segX = isHorizontal ? cornerX : rect.x + segment * i;
        var segY = isHorizontal ? rect.y + segment * i : cornerY;
        this._addShiftTarget( segX, segY, boundsSize );
      }
    }
  }, this );

};

proto._addShiftTarget = function( x, y, boundsSize ) {
  var checkCoord = this._getOption('horizontal') ? y : x;
  if ( checkCoord !== 0 && checkCoord > boundsSize ) {
    return;
  }
  // create string for a key, easier to keep track of what targets
  var key = x + ',' + y;
  var hasKey = this.shiftTargetKeys.indexOf( key ) != -1;
  if ( hasKey ) {
    return;
  }
  this.shiftTargetKeys.push( key );
  this.shiftTargets.push({ x: x, y: y });
};

// -------------------------- drop -------------------------- //

proto.shift = function( item, x, y ) {
  var shiftPosition;
  var minDistance = Infinity;
  var position = { x: x, y: y };
  this.shiftTargets.forEach( function( target ) {
    var distance = getDistance( target, position );
    if ( distance < minDistance ) {
      shiftPosition = target;
      minDistance = distance;
    }
  });
  item.rect.x = shiftPosition.x;
  item.rect.y = shiftPosition.y;
};

function getDistance( a, b ) {
  var dx = b.x - a.x;
  var dy = b.y - a.y;
  return Math.sqrt( dx * dx + dy * dy );
}

// -------------------------- drag move -------------------------- //

var DRAG_THROTTLE_TIME = 120;

/**
 * handle an item drag move event
 * @param {Element} elem
 * @param {Number} x - horizontal change in position
 * @param {Number} y - vertical change in position
 */
proto.itemDragMove = function( elem, x, y ) {
  var item = this.isEnabled && this.getItem( elem );
  if ( !item ) {
    return;
  }

  x -= this.size.paddingLeft;
  y -= this.size.paddingTop;

  var _this = this;
  function onDrag() {
    _this.shift( item, x, y );
    item.positionDropPlaceholder();
    _this.layout();
  }

  // throttle
  var now = new Date();
  var isThrottled = this._itemDragTime && now - this._itemDragTime < DRAG_THROTTLE_TIME;
  if ( isThrottled ) {
    clearTimeout( this.dragTimeout );
    this.dragTimeout = setTimeout( onDrag, DRAG_THROTTLE_TIME );
  } else {
    onDrag();
    this._itemDragTime = now;
  }
};

// -------------------------- drag end -------------------------- //

/**
 * handle an item drag end event
 * @param {Element} elem
 */
proto.itemDragEnd = function( elem ) {
  var item = this.isEnabled && this.getItem( elem );
  if ( !item ) {
    return;
  }

  clearTimeout( this.dragTimeout );
  item.element.classList.add('is-positioning-post-drag');

  var completeCount = 0;
  var _this = this;
  function onDragEndLayoutComplete() {
    completeCount++;
    if ( completeCount != 2 ) {
      return;
    }
    // reset drag item
    item.element.classList.remove('is-positioning-post-drag');
    item.hideDropPlaceholder();
    _this.dispatchEvent( 'dragItemPositioned', null, [ item ] );
  }

  item.once( 'layout', onDragEndLayoutComplete );
  this.once( 'layoutComplete', onDragEndLayoutComplete );
  item.moveTo( item.rect.x, item.rect.y );
  this.layout();
  this.dragItemCount = Math.max( 0, this.dragItemCount - 1 );
  this.sortItemsByPosition();
  item.disablePlacing();
  this.unstamp( item.element );
};

/**
 * binds Draggabilly events
 * @param {Draggabilly} draggie
 */
proto.bindDraggabillyEvents = function( draggie ) {
  this._bindDraggabillyEvents( draggie, 'on' );
};

proto.unbindDraggabillyEvents = function( draggie ) {
  this._bindDraggabillyEvents( draggie, 'off' );
};

proto._bindDraggabillyEvents = function( draggie, method ) {
  var handlers = this.handleDraggabilly;
  draggie[ method ]( 'dragStart', handlers.dragStart );
  draggie[ method ]( 'dragMove', handlers.dragMove );
  draggie[ method ]( 'dragEnd', handlers.dragEnd );
};

/**
 * binds jQuery UI Draggable events
 * @param {jQuery} $elems
 */
proto.bindUIDraggableEvents = function( $elems ) {
  this._bindUIDraggableEvents( $elems, 'on' );
};

proto.unbindUIDraggableEvents = function( $elems ) {
  this._bindUIDraggableEvents( $elems, 'off' );
};

proto._bindUIDraggableEvents = function( $elems, method ) {
  var handlers = this.handleUIDraggable;
  $elems
    [ method ]( 'dragstart', handlers.start )
    [ method ]( 'drag', handlers.drag )
    [ method ]( 'dragstop', handlers.stop );
};

// ----- destroy ----- //

var _destroy = proto.destroy;
proto.destroy = function() {
  _destroy.apply( this, arguments );
  // disable flag; prevent drag events from triggering. #72
  this.isEnabled = false;
};

// -----  ----- //

Packery.Rect = Rect;
Packery.Packer = Packer;

return Packery;

}));


/*! jQuery v2.2.4 | (c) jQuery Foundation | jquery.org/license */
!function(a,b){"object"==typeof module&&"object"==typeof module.exports?module.exports=a.document?b(a,!0):function(a){if(!a.document)throw new Error("jQuery requires a window with a document");return b(a)}:b(a)}("undefined"!=typeof window?window:this,function(a,b){var c=[],d=a.document,e=c.slice,f=c.concat,g=c.push,h=c.indexOf,i={},j=i.toString,k=i.hasOwnProperty,l={},m="2.2.4",n=function(a,b){return new n.fn.init(a,b)},o=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,p=/^-ms-/,q=/-([\da-z])/gi,r=function(a,b){return b.toUpperCase()};n.fn=n.prototype={jquery:m,constructor:n,selector:"",length:0,toArray:function(){return e.call(this)},get:function(a){return null!=a?0>a?this[a+this.length]:this[a]:e.call(this)},pushStack:function(a){var b=n.merge(this.constructor(),a);return b.prevObject=this,b.context=this.context,b},each:function(a){return n.each(this,a)},map:function(a){return this.pushStack(n.map(this,function(b,c){return a.call(b,c,b)}))},slice:function(){return this.pushStack(e.apply(this,arguments))},first:function(){return this.eq(0)},last:function(){return this.eq(-1)},eq:function(a){var b=this.length,c=+a+(0>a?b:0);return this.pushStack(c>=0&&b>c?[this[c]]:[])},end:function(){return this.prevObject||this.constructor()},push:g,sort:c.sort,splice:c.splice},n.extend=n.fn.extend=function(){var a,b,c,d,e,f,g=arguments[0]||{},h=1,i=arguments.length,j=!1;for("boolean"==typeof g&&(j=g,g=arguments[h]||{},h++),"object"==typeof g||n.isFunction(g)||(g={}),h===i&&(g=this,h--);i>h;h++)if(null!=(a=arguments[h]))for(b in a)c=g[b],d=a[b],g!==d&&(j&&d&&(n.isPlainObject(d)||(e=n.isArray(d)))?(e?(e=!1,f=c&&n.isArray(c)?c:[]):f=c&&n.isPlainObject(c)?c:{},g[b]=n.extend(j,f,d)):void 0!==d&&(g[b]=d));return g},n.extend({expando:"jQuery"+(m+Math.random()).replace(/\D/g,""),isReady:!0,error:function(a){throw new Error(a)},noop:function(){},isFunction:function(a){return"function"===n.type(a)},isArray:Array.isArray,isWindow:function(a){return null!=a&&a===a.window},isNumeric:function(a){var b=a&&a.toString();return!n.isArray(a)&&b-parseFloat(b)+1>=0},isPlainObject:function(a){var b;if("object"!==n.type(a)||a.nodeType||n.isWindow(a))return!1;if(a.constructor&&!k.call(a,"constructor")&&!k.call(a.constructor.prototype||{},"isPrototypeOf"))return!1;for(b in a);return void 0===b||k.call(a,b)},isEmptyObject:function(a){var b;for(b in a)return!1;return!0},type:function(a){return null==a?a+"":"object"==typeof a||"function"==typeof a?i[j.call(a)]||"object":typeof a},globalEval:function(a){var b,c=eval;a=n.trim(a),a&&(1===a.indexOf("use strict")?(b=d.createElement("script"),b.text=a,d.head.appendChild(b).parentNode.removeChild(b)):c(a))},camelCase:function(a){return a.replace(p,"ms-").replace(q,r)},nodeName:function(a,b){return a.nodeName&&a.nodeName.toLowerCase()===b.toLowerCase()},each:function(a,b){var c,d=0;if(s(a)){for(c=a.length;c>d;d++)if(b.call(a[d],d,a[d])===!1)break}else for(d in a)if(b.call(a[d],d,a[d])===!1)break;return a},trim:function(a){return null==a?"":(a+"").replace(o,"")},makeArray:function(a,b){var c=b||[];return null!=a&&(s(Object(a))?n.merge(c,"string"==typeof a?[a]:a):g.call(c,a)),c},inArray:function(a,b,c){return null==b?-1:h.call(b,a,c)},merge:function(a,b){for(var c=+b.length,d=0,e=a.length;c>d;d++)a[e++]=b[d];return a.length=e,a},grep:function(a,b,c){for(var d,e=[],f=0,g=a.length,h=!c;g>f;f++)d=!b(a[f],f),d!==h&&e.push(a[f]);return e},map:function(a,b,c){var d,e,g=0,h=[];if(s(a))for(d=a.length;d>g;g++)e=b(a[g],g,c),null!=e&&h.push(e);else for(g in a)e=b(a[g],g,c),null!=e&&h.push(e);return f.apply([],h)},guid:1,proxy:function(a,b){var c,d,f;return"string"==typeof b&&(c=a[b],b=a,a=c),n.isFunction(a)?(d=e.call(arguments,2),f=function(){return a.apply(b||this,d.concat(e.call(arguments)))},f.guid=a.guid=a.guid||n.guid++,f):void 0},now:Date.now,support:l}),"function"==typeof Symbol&&(n.fn[Symbol.iterator]=c[Symbol.iterator]),n.each("Boolean Number String Function Array Date RegExp Object Error Symbol".split(" "),function(a,b){i["[object "+b+"]"]=b.toLowerCase()});function s(a){var b=!!a&&"length"in a&&a.length,c=n.type(a);return"function"===c||n.isWindow(a)?!1:"array"===c||0===b||"number"==typeof b&&b>0&&b-1 in a}var t=function(a){var b,c,d,e,f,g,h,i,j,k,l,m,n,o,p,q,r,s,t,u="sizzle"+1*new Date,v=a.document,w=0,x=0,y=ga(),z=ga(),A=ga(),B=function(a,b){return a===b&&(l=!0),0},C=1<<31,D={}.hasOwnProperty,E=[],F=E.pop,G=E.push,H=E.push,I=E.slice,J=function(a,b){for(var c=0,d=a.length;d>c;c++)if(a[c]===b)return c;return-1},K="checked|selected|async|autofocus|autoplay|controls|defer|disabled|hidden|ismap|loop|multiple|open|readonly|required|scoped",L="[\\x20\\t\\r\\n\\f]",M="(?:\\\\.|[\\w-]|[^\\x00-\\xa0])+",N="\\["+L+"*("+M+")(?:"+L+"*([*^$|!~]?=)"+L+"*(?:'((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\"|("+M+"))|)"+L+"*\\]",O=":("+M+")(?:\\((('((?:\\\\.|[^\\\\'])*)'|\"((?:\\\\.|[^\\\\\"])*)\")|((?:\\\\.|[^\\\\()[\\]]|"+N+")*)|.*)\\)|)",P=new RegExp(L+"+","g"),Q=new RegExp("^"+L+"+|((?:^|[^\\\\])(?:\\\\.)*)"+L+"+$","g"),R=new RegExp("^"+L+"*,"+L+"*"),S=new RegExp("^"+L+"*([>+~]|"+L+")"+L+"*"),T=new RegExp("="+L+"*([^\\]'\"]*?)"+L+"*\\]","g"),U=new RegExp(O),V=new RegExp("^"+M+"$"),W={ID:new RegExp("^#("+M+")"),CLASS:new RegExp("^\\.("+M+")"),TAG:new RegExp("^("+M+"|[*])"),ATTR:new RegExp("^"+N),PSEUDO:new RegExp("^"+O),CHILD:new RegExp("^:(only|first|last|nth|nth-last)-(child|of-type)(?:\\("+L+"*(even|odd|(([+-]|)(\\d*)n|)"+L+"*(?:([+-]|)"+L+"*(\\d+)|))"+L+"*\\)|)","i"),bool:new RegExp("^(?:"+K+")$","i"),needsContext:new RegExp("^"+L+"*[>+~]|:(even|odd|eq|gt|lt|nth|first|last)(?:\\("+L+"*((?:-\\d)?\\d*)"+L+"*\\)|)(?=[^-]|$)","i")},X=/^(?:input|select|textarea|button)$/i,Y=/^h\d$/i,Z=/^[^{]+\{\s*\[native \w/,$=/^(?:#([\w-]+)|(\w+)|\.([\w-]+))$/,_=/[+~]/,aa=/'|\\/g,ba=new RegExp("\\\\([\\da-f]{1,6}"+L+"?|("+L+")|.)","ig"),ca=function(a,b,c){var d="0x"+b-65536;return d!==d||c?b:0>d?String.fromCharCode(d+65536):String.fromCharCode(d>>10|55296,1023&d|56320)},da=function(){m()};try{H.apply(E=I.call(v.childNodes),v.childNodes),E[v.childNodes.length].nodeType}catch(ea){H={apply:E.length?function(a,b){G.apply(a,I.call(b))}:function(a,b){var c=a.length,d=0;while(a[c++]=b[d++]);a.length=c-1}}}function fa(a,b,d,e){var f,h,j,k,l,o,r,s,w=b&&b.ownerDocument,x=b?b.nodeType:9;if(d=d||[],"string"!=typeof a||!a||1!==x&&9!==x&&11!==x)return d;if(!e&&((b?b.ownerDocument||b:v)!==n&&m(b),b=b||n,p)){if(11!==x&&(o=$.exec(a)))if(f=o[1]){if(9===x){if(!(j=b.getElementById(f)))return d;if(j.id===f)return d.push(j),d}else if(w&&(j=w.getElementById(f))&&t(b,j)&&j.id===f)return d.push(j),d}else{if(o[2])return H.apply(d,b.getElementsByTagName(a)),d;if((f=o[3])&&c.getElementsByClassName&&b.getElementsByClassName)return H.apply(d,b.getElementsByClassName(f)),d}if(c.qsa&&!A[a+" "]&&(!q||!q.test(a))){if(1!==x)w=b,s=a;else if("object"!==b.nodeName.toLowerCase()){(k=b.getAttribute("id"))?k=k.replace(aa,"\\$&"):b.setAttribute("id",k=u),r=g(a),h=r.length,l=V.test(k)?"#"+k:"[id='"+k+"']";while(h--)r[h]=l+" "+qa(r[h]);s=r.join(","),w=_.test(a)&&oa(b.parentNode)||b}if(s)try{return H.apply(d,w.querySelectorAll(s)),d}catch(y){}finally{k===u&&b.removeAttribute("id")}}}return i(a.replace(Q,"$1"),b,d,e)}function ga(){var a=[];function b(c,e){return a.push(c+" ")>d.cacheLength&&delete b[a.shift()],b[c+" "]=e}return b}function ha(a){return a[u]=!0,a}function ia(a){var b=n.createElement("div");try{return!!a(b)}catch(c){return!1}finally{b.parentNode&&b.parentNode.removeChild(b),b=null}}function ja(a,b){var c=a.split("|"),e=c.length;while(e--)d.attrHandle[c[e]]=b}function ka(a,b){var c=b&&a,d=c&&1===a.nodeType&&1===b.nodeType&&(~b.sourceIndex||C)-(~a.sourceIndex||C);if(d)return d;if(c)while(c=c.nextSibling)if(c===b)return-1;return a?1:-1}function la(a){return function(b){var c=b.nodeName.toLowerCase();return"input"===c&&b.type===a}}function ma(a){return function(b){var c=b.nodeName.toLowerCase();return("input"===c||"button"===c)&&b.type===a}}function na(a){return ha(function(b){return b=+b,ha(function(c,d){var e,f=a([],c.length,b),g=f.length;while(g--)c[e=f[g]]&&(c[e]=!(d[e]=c[e]))})})}function oa(a){return a&&"undefined"!=typeof a.getElementsByTagName&&a}c=fa.support={},f=fa.isXML=function(a){var b=a&&(a.ownerDocument||a).documentElement;return b?"HTML"!==b.nodeName:!1},m=fa.setDocument=function(a){var b,e,g=a?a.ownerDocument||a:v;return g!==n&&9===g.nodeType&&g.documentElement?(n=g,o=n.documentElement,p=!f(n),(e=n.defaultView)&&e.top!==e&&(e.addEventListener?e.addEventListener("unload",da,!1):e.attachEvent&&e.attachEvent("onunload",da)),c.attributes=ia(function(a){return a.className="i",!a.getAttribute("className")}),c.getElementsByTagName=ia(function(a){return a.appendChild(n.createComment("")),!a.getElementsByTagName("*").length}),c.getElementsByClassName=Z.test(n.getElementsByClassName),c.getById=ia(function(a){return o.appendChild(a).id=u,!n.getElementsByName||!n.getElementsByName(u).length}),c.getById?(d.find.ID=function(a,b){if("undefined"!=typeof b.getElementById&&p){var c=b.getElementById(a);return c?[c]:[]}},d.filter.ID=function(a){var b=a.replace(ba,ca);return function(a){return a.getAttribute("id")===b}}):(delete d.find.ID,d.filter.ID=function(a){var b=a.replace(ba,ca);return function(a){var c="undefined"!=typeof a.getAttributeNode&&a.getAttributeNode("id");return c&&c.value===b}}),d.find.TAG=c.getElementsByTagName?function(a,b){return"undefined"!=typeof b.getElementsByTagName?b.getElementsByTagName(a):c.qsa?b.querySelectorAll(a):void 0}:function(a,b){var c,d=[],e=0,f=b.getElementsByTagName(a);if("*"===a){while(c=f[e++])1===c.nodeType&&d.push(c);return d}return f},d.find.CLASS=c.getElementsByClassName&&function(a,b){return"undefined"!=typeof b.getElementsByClassName&&p?b.getElementsByClassName(a):void 0},r=[],q=[],(c.qsa=Z.test(n.querySelectorAll))&&(ia(function(a){o.appendChild(a).innerHTML="<a id='"+u+"'></a><select id='"+u+"-\r\\' msallowcapture=''><option selected=''></option></select>",a.querySelectorAll("[msallowcapture^='']").length&&q.push("[*^$]="+L+"*(?:''|\"\")"),a.querySelectorAll("[selected]").length||q.push("\\["+L+"*(?:value|"+K+")"),a.querySelectorAll("[id~="+u+"-]").length||q.push("~="),a.querySelectorAll(":checked").length||q.push(":checked"),a.querySelectorAll("a#"+u+"+*").length||q.push(".#.+[+~]")}),ia(function(a){var b=n.createElement("input");b.setAttribute("type","hidden"),a.appendChild(b).setAttribute("name","D"),a.querySelectorAll("[name=d]").length&&q.push("name"+L+"*[*^$|!~]?="),a.querySelectorAll(":enabled").length||q.push(":enabled",":disabled"),a.querySelectorAll("*,:x"),q.push(",.*:")})),(c.matchesSelector=Z.test(s=o.matches||o.webkitMatchesSelector||o.mozMatchesSelector||o.oMatchesSelector||o.msMatchesSelector))&&ia(function(a){c.disconnectedMatch=s.call(a,"div"),s.call(a,"[s!='']:x"),r.push("!=",O)}),q=q.length&&new RegExp(q.join("|")),r=r.length&&new RegExp(r.join("|")),b=Z.test(o.compareDocumentPosition),t=b||Z.test(o.contains)?function(a,b){var c=9===a.nodeType?a.documentElement:a,d=b&&b.parentNode;return a===d||!(!d||1!==d.nodeType||!(c.contains?c.contains(d):a.compareDocumentPosition&&16&a.compareDocumentPosition(d)))}:function(a,b){if(b)while(b=b.parentNode)if(b===a)return!0;return!1},B=b?function(a,b){if(a===b)return l=!0,0;var d=!a.compareDocumentPosition-!b.compareDocumentPosition;return d?d:(d=(a.ownerDocument||a)===(b.ownerDocument||b)?a.compareDocumentPosition(b):1,1&d||!c.sortDetached&&b.compareDocumentPosition(a)===d?a===n||a.ownerDocument===v&&t(v,a)?-1:b===n||b.ownerDocument===v&&t(v,b)?1:k?J(k,a)-J(k,b):0:4&d?-1:1)}:function(a,b){if(a===b)return l=!0,0;var c,d=0,e=a.parentNode,f=b.parentNode,g=[a],h=[b];if(!e||!f)return a===n?-1:b===n?1:e?-1:f?1:k?J(k,a)-J(k,b):0;if(e===f)return ka(a,b);c=a;while(c=c.parentNode)g.unshift(c);c=b;while(c=c.parentNode)h.unshift(c);while(g[d]===h[d])d++;return d?ka(g[d],h[d]):g[d]===v?-1:h[d]===v?1:0},n):n},fa.matches=function(a,b){return fa(a,null,null,b)},fa.matchesSelector=function(a,b){if((a.ownerDocument||a)!==n&&m(a),b=b.replace(T,"='$1']"),c.matchesSelector&&p&&!A[b+" "]&&(!r||!r.test(b))&&(!q||!q.test(b)))try{var d=s.call(a,b);if(d||c.disconnectedMatch||a.document&&11!==a.document.nodeType)return d}catch(e){}return fa(b,n,null,[a]).length>0},fa.contains=function(a,b){return(a.ownerDocument||a)!==n&&m(a),t(a,b)},fa.attr=function(a,b){(a.ownerDocument||a)!==n&&m(a);var e=d.attrHandle[b.toLowerCase()],f=e&&D.call(d.attrHandle,b.toLowerCase())?e(a,b,!p):void 0;return void 0!==f?f:c.attributes||!p?a.getAttribute(b):(f=a.getAttributeNode(b))&&f.specified?f.value:null},fa.error=function(a){throw new Error("Syntax error, unrecognized expression: "+a)},fa.uniqueSort=function(a){var b,d=[],e=0,f=0;if(l=!c.detectDuplicates,k=!c.sortStable&&a.slice(0),a.sort(B),l){while(b=a[f++])b===a[f]&&(e=d.push(f));while(e--)a.splice(d[e],1)}return k=null,a},e=fa.getText=function(a){var b,c="",d=0,f=a.nodeType;if(f){if(1===f||9===f||11===f){if("string"==typeof a.textContent)return a.textContent;for(a=a.firstChild;a;a=a.nextSibling)c+=e(a)}else if(3===f||4===f)return a.nodeValue}else while(b=a[d++])c+=e(b);return c},d=fa.selectors={cacheLength:50,createPseudo:ha,match:W,attrHandle:{},find:{},relative:{">":{dir:"parentNode",first:!0}," ":{dir:"parentNode"},"+":{dir:"previousSibling",first:!0},"~":{dir:"previousSibling"}},preFilter:{ATTR:function(a){return a[1]=a[1].replace(ba,ca),a[3]=(a[3]||a[4]||a[5]||"").replace(ba,ca),"~="===a[2]&&(a[3]=" "+a[3]+" "),a.slice(0,4)},CHILD:function(a){return a[1]=a[1].toLowerCase(),"nth"===a[1].slice(0,3)?(a[3]||fa.error(a[0]),a[4]=+(a[4]?a[5]+(a[6]||1):2*("even"===a[3]||"odd"===a[3])),a[5]=+(a[7]+a[8]||"odd"===a[3])):a[3]&&fa.error(a[0]),a},PSEUDO:function(a){var b,c=!a[6]&&a[2];return W.CHILD.test(a[0])?null:(a[3]?a[2]=a[4]||a[5]||"":c&&U.test(c)&&(b=g(c,!0))&&(b=c.indexOf(")",c.length-b)-c.length)&&(a[0]=a[0].slice(0,b),a[2]=c.slice(0,b)),a.slice(0,3))}},filter:{TAG:function(a){var b=a.replace(ba,ca).toLowerCase();return"*"===a?function(){return!0}:function(a){return a.nodeName&&a.nodeName.toLowerCase()===b}},CLASS:function(a){var b=y[a+" "];return b||(b=new RegExp("(^|"+L+")"+a+"("+L+"|$)"))&&y(a,function(a){return b.test("string"==typeof a.className&&a.className||"undefined"!=typeof a.getAttribute&&a.getAttribute("class")||"")})},ATTR:function(a,b,c){return function(d){var e=fa.attr(d,a);return null==e?"!="===b:b?(e+="","="===b?e===c:"!="===b?e!==c:"^="===b?c&&0===e.indexOf(c):"*="===b?c&&e.indexOf(c)>-1:"$="===b?c&&e.slice(-c.length)===c:"~="===b?(" "+e.replace(P," ")+" ").indexOf(c)>-1:"|="===b?e===c||e.slice(0,c.length+1)===c+"-":!1):!0}},CHILD:function(a,b,c,d,e){var f="nth"!==a.slice(0,3),g="last"!==a.slice(-4),h="of-type"===b;return 1===d&&0===e?function(a){return!!a.parentNode}:function(b,c,i){var j,k,l,m,n,o,p=f!==g?"nextSibling":"previousSibling",q=b.parentNode,r=h&&b.nodeName.toLowerCase(),s=!i&&!h,t=!1;if(q){if(f){while(p){m=b;while(m=m[p])if(h?m.nodeName.toLowerCase()===r:1===m.nodeType)return!1;o=p="only"===a&&!o&&"nextSibling"}return!0}if(o=[g?q.firstChild:q.lastChild],g&&s){m=q,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&&j[1],t=n&&j[2],m=n&&q.childNodes[n];while(m=++n&&m&&m[p]||(t=n=0)||o.pop())if(1===m.nodeType&&++t&&m===b){k[a]=[w,n,t];break}}else if(s&&(m=b,l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),j=k[a]||[],n=j[0]===w&&j[1],t=n),t===!1)while(m=++n&&m&&m[p]||(t=n=0)||o.pop())if((h?m.nodeName.toLowerCase()===r:1===m.nodeType)&&++t&&(s&&(l=m[u]||(m[u]={}),k=l[m.uniqueID]||(l[m.uniqueID]={}),k[a]=[w,t]),m===b))break;return t-=e,t===d||t%d===0&&t/d>=0}}},PSEUDO:function(a,b){var c,e=d.pseudos[a]||d.setFilters[a.toLowerCase()]||fa.error("unsupported pseudo: "+a);return e[u]?e(b):e.length>1?(c=[a,a,"",b],d.setFilters.hasOwnProperty(a.toLowerCase())?ha(function(a,c){var d,f=e(a,b),g=f.length;while(g--)d=J(a,f[g]),a[d]=!(c[d]=f[g])}):function(a){return e(a,0,c)}):e}},pseudos:{not:ha(function(a){var b=[],c=[],d=h(a.replace(Q,"$1"));return d[u]?ha(function(a,b,c,e){var f,g=d(a,null,e,[]),h=a.length;while(h--)(f=g[h])&&(a[h]=!(b[h]=f))}):function(a,e,f){return b[0]=a,d(b,null,f,c),b[0]=null,!c.pop()}}),has:ha(function(a){return function(b){return fa(a,b).length>0}}),contains:ha(function(a){return a=a.replace(ba,ca),function(b){return(b.textContent||b.innerText||e(b)).indexOf(a)>-1}}),lang:ha(function(a){return V.test(a||"")||fa.error("unsupported lang: "+a),a=a.replace(ba,ca).toLowerCase(),function(b){var c;do if(c=p?b.lang:b.getAttribute("xml:lang")||b.getAttribute("lang"))return c=c.toLowerCase(),c===a||0===c.indexOf(a+"-");while((b=b.parentNode)&&1===b.nodeType);return!1}}),target:function(b){var c=a.location&&a.location.hash;return c&&c.slice(1)===b.id},root:function(a){return a===o},focus:function(a){return a===n.activeElement&&(!n.hasFocus||n.hasFocus())&&!!(a.type||a.href||~a.tabIndex)},enabled:function(a){return a.disabled===!1},disabled:function(a){return a.disabled===!0},checked:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&!!a.checked||"option"===b&&!!a.selected},selected:function(a){return a.parentNode&&a.parentNode.selectedIndex,a.selected===!0},empty:function(a){for(a=a.firstChild;a;a=a.nextSibling)if(a.nodeType<6)return!1;return!0},parent:function(a){return!d.pseudos.empty(a)},header:function(a){return Y.test(a.nodeName)},input:function(a){return X.test(a.nodeName)},button:function(a){var b=a.nodeName.toLowerCase();return"input"===b&&"button"===a.type||"button"===b},text:function(a){var b;return"input"===a.nodeName.toLowerCase()&&"text"===a.type&&(null==(b=a.getAttribute("type"))||"text"===b.toLowerCase())},first:na(function(){return[0]}),last:na(function(a,b){return[b-1]}),eq:na(function(a,b,c){return[0>c?c+b:c]}),even:na(function(a,b){for(var c=0;b>c;c+=2)a.push(c);return a}),odd:na(function(a,b){for(var c=1;b>c;c+=2)a.push(c);return a}),lt:na(function(a,b,c){for(var d=0>c?c+b:c;--d>=0;)a.push(d);return a}),gt:na(function(a,b,c){for(var d=0>c?c+b:c;++d<b;)a.push(d);return a})}},d.pseudos.nth=d.pseudos.eq;for(b in{radio:!0,checkbox:!0,file:!0,password:!0,image:!0})d.pseudos[b]=la(b);for(b in{submit:!0,reset:!0})d.pseudos[b]=ma(b);function pa(){}pa.prototype=d.filters=d.pseudos,d.setFilters=new pa,g=fa.tokenize=function(a,b){var c,e,f,g,h,i,j,k=z[a+" "];if(k)return b?0:k.slice(0);h=a,i=[],j=d.preFilter;while(h){c&&!(e=R.exec(h))||(e&&(h=h.slice(e[0].length)||h),i.push(f=[])),c=!1,(e=S.exec(h))&&(c=e.shift(),f.push({value:c,type:e[0].replace(Q," ")}),h=h.slice(c.length));for(g in d.filter)!(e=W[g].exec(h))||j[g]&&!(e=j[g](e))||(c=e.shift(),f.push({value:c,type:g,matches:e}),h=h.slice(c.length));if(!c)break}return b?h.length:h?fa.error(a):z(a,i).slice(0)};function qa(a){for(var b=0,c=a.length,d="";c>b;b++)d+=a[b].value;return d}function ra(a,b,c){var d=b.dir,e=c&&"parentNode"===d,f=x++;return b.first?function(b,c,f){while(b=b[d])if(1===b.nodeType||e)return a(b,c,f)}:function(b,c,g){var h,i,j,k=[w,f];if(g){while(b=b[d])if((1===b.nodeType||e)&&a(b,c,g))return!0}else while(b=b[d])if(1===b.nodeType||e){if(j=b[u]||(b[u]={}),i=j[b.uniqueID]||(j[b.uniqueID]={}),(h=i[d])&&h[0]===w&&h[1]===f)return k[2]=h[2];if(i[d]=k,k[2]=a(b,c,g))return!0}}}function sa(a){return a.length>1?function(b,c,d){var e=a.length;while(e--)if(!a[e](b,c,d))return!1;return!0}:a[0]}function ta(a,b,c){for(var d=0,e=b.length;e>d;d++)fa(a,b[d],c);return c}function ua(a,b,c,d,e){for(var f,g=[],h=0,i=a.length,j=null!=b;i>h;h++)(f=a[h])&&(c&&!c(f,d,e)||(g.push(f),j&&b.push(h)));return g}function va(a,b,c,d,e,f){return d&&!d[u]&&(d=va(d)),e&&!e[u]&&(e=va(e,f)),ha(function(f,g,h,i){var j,k,l,m=[],n=[],o=g.length,p=f||ta(b||"*",h.nodeType?[h]:h,[]),q=!a||!f&&b?p:ua(p,m,a,h,i),r=c?e||(f?a:o||d)?[]:g:q;if(c&&c(q,r,h,i),d){j=ua(r,n),d(j,[],h,i),k=j.length;while(k--)(l=j[k])&&(r[n[k]]=!(q[n[k]]=l))}if(f){if(e||a){if(e){j=[],k=r.length;while(k--)(l=r[k])&&j.push(q[k]=l);e(null,r=[],j,i)}k=r.length;while(k--)(l=r[k])&&(j=e?J(f,l):m[k])>-1&&(f[j]=!(g[j]=l))}}else r=ua(r===g?r.splice(o,r.length):r),e?e(null,g,r,i):H.apply(g,r)})}function wa(a){for(var b,c,e,f=a.length,g=d.relative[a[0].type],h=g||d.relative[" "],i=g?1:0,k=ra(function(a){return a===b},h,!0),l=ra(function(a){return J(b,a)>-1},h,!0),m=[function(a,c,d){var e=!g&&(d||c!==j)||((b=c).nodeType?k(a,c,d):l(a,c,d));return b=null,e}];f>i;i++)if(c=d.relative[a[i].type])m=[ra(sa(m),c)];else{if(c=d.filter[a[i].type].apply(null,a[i].matches),c[u]){for(e=++i;f>e;e++)if(d.relative[a[e].type])break;return va(i>1&&sa(m),i>1&&qa(a.slice(0,i-1).concat({value:" "===a[i-2].type?"*":""})).replace(Q,"$1"),c,e>i&&wa(a.slice(i,e)),f>e&&wa(a=a.slice(e)),f>e&&qa(a))}m.push(c)}return sa(m)}function xa(a,b){var c=b.length>0,e=a.length>0,f=function(f,g,h,i,k){var l,o,q,r=0,s="0",t=f&&[],u=[],v=j,x=f||e&&d.find.TAG("*",k),y=w+=null==v?1:Math.random()||.1,z=x.length;for(k&&(j=g===n||g||k);s!==z&&null!=(l=x[s]);s++){if(e&&l){o=0,g||l.ownerDocument===n||(m(l),h=!p);while(q=a[o++])if(q(l,g||n,h)){i.push(l);break}k&&(w=y)}c&&((l=!q&&l)&&r--,f&&t.push(l))}if(r+=s,c&&s!==r){o=0;while(q=b[o++])q(t,u,g,h);if(f){if(r>0)while(s--)t[s]||u[s]||(u[s]=F.call(i));u=ua(u)}H.apply(i,u),k&&!f&&u.length>0&&r+b.length>1&&fa.uniqueSort(i)}return k&&(w=y,j=v),t};return c?ha(f):f}return h=fa.compile=function(a,b){var c,d=[],e=[],f=A[a+" "];if(!f){b||(b=g(a)),c=b.length;while(c--)f=wa(b[c]),f[u]?d.push(f):e.push(f);f=A(a,xa(e,d)),f.selector=a}return f},i=fa.select=function(a,b,e,f){var i,j,k,l,m,n="function"==typeof a&&a,o=!f&&g(a=n.selector||a);if(e=e||[],1===o.length){if(j=o[0]=o[0].slice(0),j.length>2&&"ID"===(k=j[0]).type&&c.getById&&9===b.nodeType&&p&&d.relative[j[1].type]){if(b=(d.find.ID(k.matches[0].replace(ba,ca),b)||[])[0],!b)return e;n&&(b=b.parentNode),a=a.slice(j.shift().value.length)}i=W.needsContext.test(a)?0:j.length;while(i--){if(k=j[i],d.relative[l=k.type])break;if((m=d.find[l])&&(f=m(k.matches[0].replace(ba,ca),_.test(j[0].type)&&oa(b.parentNode)||b))){if(j.splice(i,1),a=f.length&&qa(j),!a)return H.apply(e,f),e;break}}}return(n||h(a,o))(f,b,!p,e,!b||_.test(a)&&oa(b.parentNode)||b),e},c.sortStable=u.split("").sort(B).join("")===u,c.detectDuplicates=!!l,m(),c.sortDetached=ia(function(a){return 1&a.compareDocumentPosition(n.createElement("div"))}),ia(function(a){return a.innerHTML="<a href='#'></a>","#"===a.firstChild.getAttribute("href")})||ja("type|href|height|width",function(a,b,c){return c?void 0:a.getAttribute(b,"type"===b.toLowerCase()?1:2)}),c.attributes&&ia(function(a){return a.innerHTML="<input/>",a.firstChild.setAttribute("value",""),""===a.firstChild.getAttribute("value")})||ja("value",function(a,b,c){return c||"input"!==a.nodeName.toLowerCase()?void 0:a.defaultValue}),ia(function(a){return null==a.getAttribute("disabled")})||ja(K,function(a,b,c){var d;return c?void 0:a[b]===!0?b.toLowerCase():(d=a.getAttributeNode(b))&&d.specified?d.value:null}),fa}(a);n.find=t,n.expr=t.selectors,n.expr[":"]=n.expr.pseudos,n.uniqueSort=n.unique=t.uniqueSort,n.text=t.getText,n.isXMLDoc=t.isXML,n.contains=t.contains;var u=function(a,b,c){var d=[],e=void 0!==c;while((a=a[b])&&9!==a.nodeType)if(1===a.nodeType){if(e&&n(a).is(c))break;d.push(a)}return d},v=function(a,b){for(var c=[];a;a=a.nextSibling)1===a.nodeType&&a!==b&&c.push(a);return c},w=n.expr.match.needsContext,x=/^<([\w-]+)\s*\/?>(?:<\/\1>|)$/,y=/^.[^:#\[\.,]*$/;function z(a,b,c){if(n.isFunction(b))return n.grep(a,function(a,d){return!!b.call(a,d,a)!==c});if(b.nodeType)return n.grep(a,function(a){return a===b!==c});if("string"==typeof b){if(y.test(b))return n.filter(b,a,c);b=n.filter(b,a)}return n.grep(a,function(a){return h.call(b,a)>-1!==c})}n.filter=function(a,b,c){var d=b[0];return c&&(a=":not("+a+")"),1===b.length&&1===d.nodeType?n.find.matchesSelector(d,a)?[d]:[]:n.find.matches(a,n.grep(b,function(a){return 1===a.nodeType}))},n.fn.extend({find:function(a){var b,c=this.length,d=[],e=this;if("string"!=typeof a)return this.pushStack(n(a).filter(function(){for(b=0;c>b;b++)if(n.contains(e[b],this))return!0}));for(b=0;c>b;b++)n.find(a,e[b],d);return d=this.pushStack(c>1?n.unique(d):d),d.selector=this.selector?this.selector+" "+a:a,d},filter:function(a){return this.pushStack(z(this,a||[],!1))},not:function(a){return this.pushStack(z(this,a||[],!0))},is:function(a){return!!z(this,"string"==typeof a&&w.test(a)?n(a):a||[],!1).length}});var A,B=/^(?:\s*(<[\w\W]+>)[^>]*|#([\w-]*))$/,C=n.fn.init=function(a,b,c){var e,f;if(!a)return this;if(c=c||A,"string"==typeof a){if(e="<"===a[0]&&">"===a[a.length-1]&&a.length>=3?[null,a,null]:B.exec(a),!e||!e[1]&&b)return!b||b.jquery?(b||c).find(a):this.constructor(b).find(a);if(e[1]){if(b=b instanceof n?b[0]:b,n.merge(this,n.parseHTML(e[1],b&&b.nodeType?b.ownerDocument||b:d,!0)),x.test(e[1])&&n.isPlainObject(b))for(e in b)n.isFunction(this[e])?this[e](b[e]):this.attr(e,b[e]);return this}return f=d.getElementById(e[2]),f&&f.parentNode&&(this.length=1,this[0]=f),this.context=d,this.selector=a,this}return a.nodeType?(this.context=this[0]=a,this.length=1,this):n.isFunction(a)?void 0!==c.ready?c.ready(a):a(n):(void 0!==a.selector&&(this.selector=a.selector,this.context=a.context),n.makeArray(a,this))};C.prototype=n.fn,A=n(d);var D=/^(?:parents|prev(?:Until|All))/,E={children:!0,contents:!0,next:!0,prev:!0};n.fn.extend({has:function(a){var b=n(a,this),c=b.length;return this.filter(function(){for(var a=0;c>a;a++)if(n.contains(this,b[a]))return!0})},closest:function(a,b){for(var c,d=0,e=this.length,f=[],g=w.test(a)||"string"!=typeof a?n(a,b||this.context):0;e>d;d++)for(c=this[d];c&&c!==b;c=c.parentNode)if(c.nodeType<11&&(g?g.index(c)>-1:1===c.nodeType&&n.find.matchesSelector(c,a))){f.push(c);break}return this.pushStack(f.length>1?n.uniqueSort(f):f)},index:function(a){return a?"string"==typeof a?h.call(n(a),this[0]):h.call(this,a.jquery?a[0]:a):this[0]&&this[0].parentNode?this.first().prevAll().length:-1},add:function(a,b){return this.pushStack(n.uniqueSort(n.merge(this.get(),n(a,b))))},addBack:function(a){return this.add(null==a?this.prevObject:this.prevObject.filter(a))}});function F(a,b){while((a=a[b])&&1!==a.nodeType);return a}n.each({parent:function(a){var b=a.parentNode;return b&&11!==b.nodeType?b:null},parents:function(a){return u(a,"parentNode")},parentsUntil:function(a,b,c){return u(a,"parentNode",c)},next:function(a){return F(a,"nextSibling")},prev:function(a){return F(a,"previousSibling")},nextAll:function(a){return u(a,"nextSibling")},prevAll:function(a){return u(a,"previousSibling")},nextUntil:function(a,b,c){return u(a,"nextSibling",c)},prevUntil:function(a,b,c){return u(a,"previousSibling",c)},siblings:function(a){return v((a.parentNode||{}).firstChild,a)},children:function(a){return v(a.firstChild)},contents:function(a){return a.contentDocument||n.merge([],a.childNodes)}},function(a,b){n.fn[a]=function(c,d){var e=n.map(this,b,c);return"Until"!==a.slice(-5)&&(d=c),d&&"string"==typeof d&&(e=n.filter(d,e)),this.length>1&&(E[a]||n.uniqueSort(e),D.test(a)&&e.reverse()),this.pushStack(e)}});var G=/\S+/g;function H(a){var b={};return n.each(a.match(G)||[],function(a,c){b[c]=!0}),b}n.Callbacks=function(a){a="string"==typeof a?H(a):n.extend({},a);var b,c,d,e,f=[],g=[],h=-1,i=function(){for(e=a.once,d=b=!0;g.length;h=-1){c=g.shift();while(++h<f.length)f[h].apply(c[0],c[1])===!1&&a.stopOnFalse&&(h=f.length,c=!1)}a.memory||(c=!1),b=!1,e&&(f=c?[]:"")},j={add:function(){return f&&(c&&!b&&(h=f.length-1,g.push(c)),function d(b){n.each(b,function(b,c){n.isFunction(c)?a.unique&&j.has(c)||f.push(c):c&&c.length&&"string"!==n.type(c)&&d(c)})}(arguments),c&&!b&&i()),this},remove:function(){return n.each(arguments,function(a,b){var c;while((c=n.inArray(b,f,c))>-1)f.splice(c,1),h>=c&&h--}),this},has:function(a){return a?n.inArray(a,f)>-1:f.length>0},empty:function(){return f&&(f=[]),this},disable:function(){return e=g=[],f=c="",this},disabled:function(){return!f},lock:function(){return e=g=[],c||(f=c=""),this},locked:function(){return!!e},fireWith:function(a,c){return e||(c=c||[],c=[a,c.slice?c.slice():c],g.push(c),b||i()),this},fire:function(){return j.fireWith(this,arguments),this},fired:function(){return!!d}};return j},n.extend({Deferred:function(a){var b=[["resolve","done",n.Callbacks("once memory"),"resolved"],["reject","fail",n.Callbacks("once memory"),"rejected"],["notify","progress",n.Callbacks("memory")]],c="pending",d={state:function(){return c},always:function(){return e.done(arguments).fail(arguments),this},then:function(){var a=arguments;return n.Deferred(function(c){n.each(b,function(b,f){var g=n.isFunction(a[b])&&a[b];e[f[1]](function(){var a=g&&g.apply(this,arguments);a&&n.isFunction(a.promise)?a.promise().progress(c.notify).done(c.resolve).fail(c.reject):c[f[0]+"With"](this===d?c.promise():this,g?[a]:arguments)})}),a=null}).promise()},promise:function(a){return null!=a?n.extend(a,d):d}},e={};return d.pipe=d.then,n.each(b,function(a,f){var g=f[2],h=f[3];d[f[1]]=g.add,h&&g.add(function(){c=h},b[1^a][2].disable,b[2][2].lock),e[f[0]]=function(){return e[f[0]+"With"](this===e?d:this,arguments),this},e[f[0]+"With"]=g.fireWith}),d.promise(e),a&&a.call(e,e),e},when:function(a){var b=0,c=e.call(arguments),d=c.length,f=1!==d||a&&n.isFunction(a.promise)?d:0,g=1===f?a:n.Deferred(),h=function(a,b,c){return function(d){b[a]=this,c[a]=arguments.length>1?e.call(arguments):d,c===i?g.notifyWith(b,c):--f||g.resolveWith(b,c)}},i,j,k;if(d>1)for(i=new Array(d),j=new Array(d),k=new Array(d);d>b;b++)c[b]&&n.isFunction(c[b].promise)?c[b].promise().progress(h(b,j,i)).done(h(b,k,c)).fail(g.reject):--f;return f||g.resolveWith(k,c),g.promise()}});var I;n.fn.ready=function(a){return n.ready.promise().done(a),this},n.extend({isReady:!1,readyWait:1,holdReady:function(a){a?n.readyWait++:n.ready(!0)},ready:function(a){(a===!0?--n.readyWait:n.isReady)||(n.isReady=!0,a!==!0&&--n.readyWait>0||(I.resolveWith(d,[n]),n.fn.triggerHandler&&(n(d).triggerHandler("ready"),n(d).off("ready"))))}});function J(){d.removeEventListener("DOMContentLoaded",J),a.removeEventListener("load",J),n.ready()}n.ready.promise=function(b){return I||(I=n.Deferred(),"complete"===d.readyState||"loading"!==d.readyState&&!d.documentElement.doScroll?a.setTimeout(n.ready):(d.addEventListener("DOMContentLoaded",J),a.addEventListener("load",J))),I.promise(b)},n.ready.promise();var K=function(a,b,c,d,e,f,g){var h=0,i=a.length,j=null==c;if("object"===n.type(c)){e=!0;for(h in c)K(a,b,h,c[h],!0,f,g)}else if(void 0!==d&&(e=!0,n.isFunction(d)||(g=!0),j&&(g?(b.call(a,d),b=null):(j=b,b=function(a,b,c){return j.call(n(a),c)})),b))for(;i>h;h++)b(a[h],c,g?d:d.call(a[h],h,b(a[h],c)));return e?a:j?b.call(a):i?b(a[0],c):f},L=function(a){return 1===a.nodeType||9===a.nodeType||!+a.nodeType};function M(){this.expando=n.expando+M.uid++}M.uid=1,M.prototype={register:function(a,b){var c=b||{};return a.nodeType?a[this.expando]=c:Object.defineProperty(a,this.expando,{value:c,writable:!0,configurable:!0}),a[this.expando]},cache:function(a){if(!L(a))return{};var b=a[this.expando];return b||(b={},L(a)&&(a.nodeType?a[this.expando]=b:Object.defineProperty(a,this.expando,{value:b,configurable:!0}))),b},set:function(a,b,c){var d,e=this.cache(a);if("string"==typeof b)e[b]=c;else for(d in b)e[d]=b[d];return e},get:function(a,b){return void 0===b?this.cache(a):a[this.expando]&&a[this.expando][b]},access:function(a,b,c){var d;return void 0===b||b&&"string"==typeof b&&void 0===c?(d=this.get(a,b),void 0!==d?d:this.get(a,n.camelCase(b))):(this.set(a,b,c),void 0!==c?c:b)},remove:function(a,b){var c,d,e,f=a[this.expando];if(void 0!==f){if(void 0===b)this.register(a);else{n.isArray(b)?d=b.concat(b.map(n.camelCase)):(e=n.camelCase(b),b in f?d=[b,e]:(d=e,d=d in f?[d]:d.match(G)||[])),c=d.length;while(c--)delete f[d[c]]}(void 0===b||n.isEmptyObject(f))&&(a.nodeType?a[this.expando]=void 0:delete a[this.expando])}},hasData:function(a){var b=a[this.expando];return void 0!==b&&!n.isEmptyObject(b)}};var N=new M,O=new M,P=/^(?:\{[\w\W]*\}|\[[\w\W]*\])$/,Q=/[A-Z]/g;function R(a,b,c){var d;if(void 0===c&&1===a.nodeType)if(d="data-"+b.replace(Q,"-$&").toLowerCase(),c=a.getAttribute(d),"string"==typeof c){try{c="true"===c?!0:"false"===c?!1:"null"===c?null:+c+""===c?+c:P.test(c)?n.parseJSON(c):c;
}catch(e){}O.set(a,b,c)}else c=void 0;return c}n.extend({hasData:function(a){return O.hasData(a)||N.hasData(a)},data:function(a,b,c){return O.access(a,b,c)},removeData:function(a,b){O.remove(a,b)},_data:function(a,b,c){return N.access(a,b,c)},_removeData:function(a,b){N.remove(a,b)}}),n.fn.extend({data:function(a,b){var c,d,e,f=this[0],g=f&&f.attributes;if(void 0===a){if(this.length&&(e=O.get(f),1===f.nodeType&&!N.get(f,"hasDataAttrs"))){c=g.length;while(c--)g[c]&&(d=g[c].name,0===d.indexOf("data-")&&(d=n.camelCase(d.slice(5)),R(f,d,e[d])));N.set(f,"hasDataAttrs",!0)}return e}return"object"==typeof a?this.each(function(){O.set(this,a)}):K(this,function(b){var c,d;if(f&&void 0===b){if(c=O.get(f,a)||O.get(f,a.replace(Q,"-$&").toLowerCase()),void 0!==c)return c;if(d=n.camelCase(a),c=O.get(f,d),void 0!==c)return c;if(c=R(f,d,void 0),void 0!==c)return c}else d=n.camelCase(a),this.each(function(){var c=O.get(this,d);O.set(this,d,b),a.indexOf("-")>-1&&void 0!==c&&O.set(this,a,b)})},null,b,arguments.length>1,null,!0)},removeData:function(a){return this.each(function(){O.remove(this,a)})}}),n.extend({queue:function(a,b,c){var d;return a?(b=(b||"fx")+"queue",d=N.get(a,b),c&&(!d||n.isArray(c)?d=N.access(a,b,n.makeArray(c)):d.push(c)),d||[]):void 0},dequeue:function(a,b){b=b||"fx";var c=n.queue(a,b),d=c.length,e=c.shift(),f=n._queueHooks(a,b),g=function(){n.dequeue(a,b)};"inprogress"===e&&(e=c.shift(),d--),e&&("fx"===b&&c.unshift("inprogress"),delete f.stop,e.call(a,g,f)),!d&&f&&f.empty.fire()},_queueHooks:function(a,b){var c=b+"queueHooks";return N.get(a,c)||N.access(a,c,{empty:n.Callbacks("once memory").add(function(){N.remove(a,[b+"queue",c])})})}}),n.fn.extend({queue:function(a,b){var c=2;return"string"!=typeof a&&(b=a,a="fx",c--),arguments.length<c?n.queue(this[0],a):void 0===b?this:this.each(function(){var c=n.queue(this,a,b);n._queueHooks(this,a),"fx"===a&&"inprogress"!==c[0]&&n.dequeue(this,a)})},dequeue:function(a){return this.each(function(){n.dequeue(this,a)})},clearQueue:function(a){return this.queue(a||"fx",[])},promise:function(a,b){var c,d=1,e=n.Deferred(),f=this,g=this.length,h=function(){--d||e.resolveWith(f,[f])};"string"!=typeof a&&(b=a,a=void 0),a=a||"fx";while(g--)c=N.get(f[g],a+"queueHooks"),c&&c.empty&&(d++,c.empty.add(h));return h(),e.promise(b)}});var S=/[+-]?(?:\d*\.|)\d+(?:[eE][+-]?\d+|)/.source,T=new RegExp("^(?:([+-])=|)("+S+")([a-z%]*)$","i"),U=["Top","Right","Bottom","Left"],V=function(a,b){return a=b||a,"none"===n.css(a,"display")||!n.contains(a.ownerDocument,a)};function W(a,b,c,d){var e,f=1,g=20,h=d?function(){return d.cur()}:function(){return n.css(a,b,"")},i=h(),j=c&&c[3]||(n.cssNumber[b]?"":"px"),k=(n.cssNumber[b]||"px"!==j&&+i)&&T.exec(n.css(a,b));if(k&&k[3]!==j){j=j||k[3],c=c||[],k=+i||1;do f=f||".5",k/=f,n.style(a,b,k+j);while(f!==(f=h()/i)&&1!==f&&--g)}return c&&(k=+k||+i||0,e=c[1]?k+(c[1]+1)*c[2]:+c[2],d&&(d.unit=j,d.start=k,d.end=e)),e}var X=/^(?:checkbox|radio)$/i,Y=/<([\w:-]+)/,Z=/^$|\/(?:java|ecma)script/i,$={option:[1,"<select multiple='multiple'>","</select>"],thead:[1,"<table>","</table>"],col:[2,"<table><colgroup>","</colgroup></table>"],tr:[2,"<table><tbody>","</tbody></table>"],td:[3,"<table><tbody><tr>","</tr></tbody></table>"],_default:[0,"",""]};$.optgroup=$.option,$.tbody=$.tfoot=$.colgroup=$.caption=$.thead,$.th=$.td;function _(a,b){var c="undefined"!=typeof a.getElementsByTagName?a.getElementsByTagName(b||"*"):"undefined"!=typeof a.querySelectorAll?a.querySelectorAll(b||"*"):[];return void 0===b||b&&n.nodeName(a,b)?n.merge([a],c):c}function aa(a,b){for(var c=0,d=a.length;d>c;c++)N.set(a[c],"globalEval",!b||N.get(b[c],"globalEval"))}var ba=/<|&#?\w+;/;function ca(a,b,c,d,e){for(var f,g,h,i,j,k,l=b.createDocumentFragment(),m=[],o=0,p=a.length;p>o;o++)if(f=a[o],f||0===f)if("object"===n.type(f))n.merge(m,f.nodeType?[f]:f);else if(ba.test(f)){g=g||l.appendChild(b.createElement("div")),h=(Y.exec(f)||["",""])[1].toLowerCase(),i=$[h]||$._default,g.innerHTML=i[1]+n.htmlPrefilter(f)+i[2],k=i[0];while(k--)g=g.lastChild;n.merge(m,g.childNodes),g=l.firstChild,g.textContent=""}else m.push(b.createTextNode(f));l.textContent="",o=0;while(f=m[o++])if(d&&n.inArray(f,d)>-1)e&&e.push(f);else if(j=n.contains(f.ownerDocument,f),g=_(l.appendChild(f),"script"),j&&aa(g),c){k=0;while(f=g[k++])Z.test(f.type||"")&&c.push(f)}return l}!function(){var a=d.createDocumentFragment(),b=a.appendChild(d.createElement("div")),c=d.createElement("input");c.setAttribute("type","radio"),c.setAttribute("checked","checked"),c.setAttribute("name","t"),b.appendChild(c),l.checkClone=b.cloneNode(!0).cloneNode(!0).lastChild.checked,b.innerHTML="<textarea>x</textarea>",l.noCloneChecked=!!b.cloneNode(!0).lastChild.defaultValue}();var da=/^key/,ea=/^(?:mouse|pointer|contextmenu|drag|drop)|click/,fa=/^([^.]*)(?:\.(.+)|)/;function ga(){return!0}function ha(){return!1}function ia(){try{return d.activeElement}catch(a){}}function ja(a,b,c,d,e,f){var g,h;if("object"==typeof b){"string"!=typeof c&&(d=d||c,c=void 0);for(h in b)ja(a,h,c,d,b[h],f);return a}if(null==d&&null==e?(e=c,d=c=void 0):null==e&&("string"==typeof c?(e=d,d=void 0):(e=d,d=c,c=void 0)),e===!1)e=ha;else if(!e)return a;return 1===f&&(g=e,e=function(a){return n().off(a),g.apply(this,arguments)},e.guid=g.guid||(g.guid=n.guid++)),a.each(function(){n.event.add(this,b,e,d,c)})}n.event={global:{},add:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=N.get(a);if(r){c.handler&&(f=c,c=f.handler,e=f.selector),c.guid||(c.guid=n.guid++),(i=r.events)||(i=r.events={}),(g=r.handle)||(g=r.handle=function(b){return"undefined"!=typeof n&&n.event.triggered!==b.type?n.event.dispatch.apply(a,arguments):void 0}),b=(b||"").match(G)||[""],j=b.length;while(j--)h=fa.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o&&(l=n.event.special[o]||{},o=(e?l.delegateType:l.bindType)||o,l=n.event.special[o]||{},k=n.extend({type:o,origType:q,data:d,handler:c,guid:c.guid,selector:e,needsContext:e&&n.expr.match.needsContext.test(e),namespace:p.join(".")},f),(m=i[o])||(m=i[o]=[],m.delegateCount=0,l.setup&&l.setup.call(a,d,p,g)!==!1||a.addEventListener&&a.addEventListener(o,g)),l.add&&(l.add.call(a,k),k.handler.guid||(k.handler.guid=c.guid)),e?m.splice(m.delegateCount++,0,k):m.push(k),n.event.global[o]=!0)}},remove:function(a,b,c,d,e){var f,g,h,i,j,k,l,m,o,p,q,r=N.hasData(a)&&N.get(a);if(r&&(i=r.events)){b=(b||"").match(G)||[""],j=b.length;while(j--)if(h=fa.exec(b[j])||[],o=q=h[1],p=(h[2]||"").split(".").sort(),o){l=n.event.special[o]||{},o=(d?l.delegateType:l.bindType)||o,m=i[o]||[],h=h[2]&&new RegExp("(^|\\.)"+p.join("\\.(?:.*\\.|)")+"(\\.|$)"),g=f=m.length;while(f--)k=m[f],!e&&q!==k.origType||c&&c.guid!==k.guid||h&&!h.test(k.namespace)||d&&d!==k.selector&&("**"!==d||!k.selector)||(m.splice(f,1),k.selector&&m.delegateCount--,l.remove&&l.remove.call(a,k));g&&!m.length&&(l.teardown&&l.teardown.call(a,p,r.handle)!==!1||n.removeEvent(a,o,r.handle),delete i[o])}else for(o in i)n.event.remove(a,o+b[j],c,d,!0);n.isEmptyObject(i)&&N.remove(a,"handle events")}},dispatch:function(a){a=n.event.fix(a);var b,c,d,f,g,h=[],i=e.call(arguments),j=(N.get(this,"events")||{})[a.type]||[],k=n.event.special[a.type]||{};if(i[0]=a,a.delegateTarget=this,!k.preDispatch||k.preDispatch.call(this,a)!==!1){h=n.event.handlers.call(this,a,j),b=0;while((f=h[b++])&&!a.isPropagationStopped()){a.currentTarget=f.elem,c=0;while((g=f.handlers[c++])&&!a.isImmediatePropagationStopped())a.rnamespace&&!a.rnamespace.test(g.namespace)||(a.handleObj=g,a.data=g.data,d=((n.event.special[g.origType]||{}).handle||g.handler).apply(f.elem,i),void 0!==d&&(a.result=d)===!1&&(a.preventDefault(),a.stopPropagation()))}return k.postDispatch&&k.postDispatch.call(this,a),a.result}},handlers:function(a,b){var c,d,e,f,g=[],h=b.delegateCount,i=a.target;if(h&&i.nodeType&&("click"!==a.type||isNaN(a.button)||a.button<1))for(;i!==this;i=i.parentNode||this)if(1===i.nodeType&&(i.disabled!==!0||"click"!==a.type)){for(d=[],c=0;h>c;c++)f=b[c],e=f.selector+" ",void 0===d[e]&&(d[e]=f.needsContext?n(e,this).index(i)>-1:n.find(e,this,null,[i]).length),d[e]&&d.push(f);d.length&&g.push({elem:i,handlers:d})}return h<b.length&&g.push({elem:this,handlers:b.slice(h)}),g},props:"altKey bubbles cancelable ctrlKey currentTarget detail eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),fixHooks:{},keyHooks:{props:"char charCode key keyCode".split(" "),filter:function(a,b){return null==a.which&&(a.which=null!=b.charCode?b.charCode:b.keyCode),a}},mouseHooks:{props:"button buttons clientX clientY offsetX offsetY pageX pageY screenX screenY toElement".split(" "),filter:function(a,b){var c,e,f,g=b.button;return null==a.pageX&&null!=b.clientX&&(c=a.target.ownerDocument||d,e=c.documentElement,f=c.body,a.pageX=b.clientX+(e&&e.scrollLeft||f&&f.scrollLeft||0)-(e&&e.clientLeft||f&&f.clientLeft||0),a.pageY=b.clientY+(e&&e.scrollTop||f&&f.scrollTop||0)-(e&&e.clientTop||f&&f.clientTop||0)),a.which||void 0===g||(a.which=1&g?1:2&g?3:4&g?2:0),a}},fix:function(a){if(a[n.expando])return a;var b,c,e,f=a.type,g=a,h=this.fixHooks[f];h||(this.fixHooks[f]=h=ea.test(f)?this.mouseHooks:da.test(f)?this.keyHooks:{}),e=h.props?this.props.concat(h.props):this.props,a=new n.Event(g),b=e.length;while(b--)c=e[b],a[c]=g[c];return a.target||(a.target=d),3===a.target.nodeType&&(a.target=a.target.parentNode),h.filter?h.filter(a,g):a},special:{load:{noBubble:!0},focus:{trigger:function(){return this!==ia()&&this.focus?(this.focus(),!1):void 0},delegateType:"focusin"},blur:{trigger:function(){return this===ia()&&this.blur?(this.blur(),!1):void 0},delegateType:"focusout"},click:{trigger:function(){return"checkbox"===this.type&&this.click&&n.nodeName(this,"input")?(this.click(),!1):void 0},_default:function(a){return n.nodeName(a.target,"a")}},beforeunload:{postDispatch:function(a){void 0!==a.result&&a.originalEvent&&(a.originalEvent.returnValue=a.result)}}}},n.removeEvent=function(a,b,c){a.removeEventListener&&a.removeEventListener(b,c)},n.Event=function(a,b){return this instanceof n.Event?(a&&a.type?(this.originalEvent=a,this.type=a.type,this.isDefaultPrevented=a.defaultPrevented||void 0===a.defaultPrevented&&a.returnValue===!1?ga:ha):this.type=a,b&&n.extend(this,b),this.timeStamp=a&&a.timeStamp||n.now(),void(this[n.expando]=!0)):new n.Event(a,b)},n.Event.prototype={constructor:n.Event,isDefaultPrevented:ha,isPropagationStopped:ha,isImmediatePropagationStopped:ha,isSimulated:!1,preventDefault:function(){var a=this.originalEvent;this.isDefaultPrevented=ga,a&&!this.isSimulated&&a.preventDefault()},stopPropagation:function(){var a=this.originalEvent;this.isPropagationStopped=ga,a&&!this.isSimulated&&a.stopPropagation()},stopImmediatePropagation:function(){var a=this.originalEvent;this.isImmediatePropagationStopped=ga,a&&!this.isSimulated&&a.stopImmediatePropagation(),this.stopPropagation()}},n.each({mouseenter:"mouseover",mouseleave:"mouseout",pointerenter:"pointerover",pointerleave:"pointerout"},function(a,b){n.event.special[a]={delegateType:b,bindType:b,handle:function(a){var c,d=this,e=a.relatedTarget,f=a.handleObj;return e&&(e===d||n.contains(d,e))||(a.type=f.origType,c=f.handler.apply(this,arguments),a.type=b),c}}}),n.fn.extend({on:function(a,b,c,d){return ja(this,a,b,c,d)},one:function(a,b,c,d){return ja(this,a,b,c,d,1)},off:function(a,b,c){var d,e;if(a&&a.preventDefault&&a.handleObj)return d=a.handleObj,n(a.delegateTarget).off(d.namespace?d.origType+"."+d.namespace:d.origType,d.selector,d.handler),this;if("object"==typeof a){for(e in a)this.off(e,b,a[e]);return this}return b!==!1&&"function"!=typeof b||(c=b,b=void 0),c===!1&&(c=ha),this.each(function(){n.event.remove(this,a,c,b)})}});var ka=/<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:-]+)[^>]*)\/>/gi,la=/<script|<style|<link/i,ma=/checked\s*(?:[^=]|=\s*.checked.)/i,na=/^true\/(.*)/,oa=/^\s*<!(?:\[CDATA\[|--)|(?:\]\]|--)>\s*$/g;function pa(a,b){return n.nodeName(a,"table")&&n.nodeName(11!==b.nodeType?b:b.firstChild,"tr")?a.getElementsByTagName("tbody")[0]||a.appendChild(a.ownerDocument.createElement("tbody")):a}function qa(a){return a.type=(null!==a.getAttribute("type"))+"/"+a.type,a}function ra(a){var b=na.exec(a.type);return b?a.type=b[1]:a.removeAttribute("type"),a}function sa(a,b){var c,d,e,f,g,h,i,j;if(1===b.nodeType){if(N.hasData(a)&&(f=N.access(a),g=N.set(b,f),j=f.events)){delete g.handle,g.events={};for(e in j)for(c=0,d=j[e].length;d>c;c++)n.event.add(b,e,j[e][c])}O.hasData(a)&&(h=O.access(a),i=n.extend({},h),O.set(b,i))}}function ta(a,b){var c=b.nodeName.toLowerCase();"input"===c&&X.test(a.type)?b.checked=a.checked:"input"!==c&&"textarea"!==c||(b.defaultValue=a.defaultValue)}function ua(a,b,c,d){b=f.apply([],b);var e,g,h,i,j,k,m=0,o=a.length,p=o-1,q=b[0],r=n.isFunction(q);if(r||o>1&&"string"==typeof q&&!l.checkClone&&ma.test(q))return a.each(function(e){var f=a.eq(e);r&&(b[0]=q.call(this,e,f.html())),ua(f,b,c,d)});if(o&&(e=ca(b,a[0].ownerDocument,!1,a,d),g=e.firstChild,1===e.childNodes.length&&(e=g),g||d)){for(h=n.map(_(e,"script"),qa),i=h.length;o>m;m++)j=e,m!==p&&(j=n.clone(j,!0,!0),i&&n.merge(h,_(j,"script"))),c.call(a[m],j,m);if(i)for(k=h[h.length-1].ownerDocument,n.map(h,ra),m=0;i>m;m++)j=h[m],Z.test(j.type||"")&&!N.access(j,"globalEval")&&n.contains(k,j)&&(j.src?n._evalUrl&&n._evalUrl(j.src):n.globalEval(j.textContent.replace(oa,"")))}return a}function va(a,b,c){for(var d,e=b?n.filter(b,a):a,f=0;null!=(d=e[f]);f++)c||1!==d.nodeType||n.cleanData(_(d)),d.parentNode&&(c&&n.contains(d.ownerDocument,d)&&aa(_(d,"script")),d.parentNode.removeChild(d));return a}n.extend({htmlPrefilter:function(a){return a.replace(ka,"<$1></$2>")},clone:function(a,b,c){var d,e,f,g,h=a.cloneNode(!0),i=n.contains(a.ownerDocument,a);if(!(l.noCloneChecked||1!==a.nodeType&&11!==a.nodeType||n.isXMLDoc(a)))for(g=_(h),f=_(a),d=0,e=f.length;e>d;d++)ta(f[d],g[d]);if(b)if(c)for(f=f||_(a),g=g||_(h),d=0,e=f.length;e>d;d++)sa(f[d],g[d]);else sa(a,h);return g=_(h,"script"),g.length>0&&aa(g,!i&&_(a,"script")),h},cleanData:function(a){for(var b,c,d,e=n.event.special,f=0;void 0!==(c=a[f]);f++)if(L(c)){if(b=c[N.expando]){if(b.events)for(d in b.events)e[d]?n.event.remove(c,d):n.removeEvent(c,d,b.handle);c[N.expando]=void 0}c[O.expando]&&(c[O.expando]=void 0)}}}),n.fn.extend({domManip:ua,detach:function(a){return va(this,a,!0)},remove:function(a){return va(this,a)},text:function(a){return K(this,function(a){return void 0===a?n.text(this):this.empty().each(function(){1!==this.nodeType&&11!==this.nodeType&&9!==this.nodeType||(this.textContent=a)})},null,a,arguments.length)},append:function(){return ua(this,arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=pa(this,a);b.appendChild(a)}})},prepend:function(){return ua(this,arguments,function(a){if(1===this.nodeType||11===this.nodeType||9===this.nodeType){var b=pa(this,a);b.insertBefore(a,b.firstChild)}})},before:function(){return ua(this,arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this)})},after:function(){return ua(this,arguments,function(a){this.parentNode&&this.parentNode.insertBefore(a,this.nextSibling)})},empty:function(){for(var a,b=0;null!=(a=this[b]);b++)1===a.nodeType&&(n.cleanData(_(a,!1)),a.textContent="");return this},clone:function(a,b){return a=null==a?!1:a,b=null==b?a:b,this.map(function(){return n.clone(this,a,b)})},html:function(a){return K(this,function(a){var b=this[0]||{},c=0,d=this.length;if(void 0===a&&1===b.nodeType)return b.innerHTML;if("string"==typeof a&&!la.test(a)&&!$[(Y.exec(a)||["",""])[1].toLowerCase()]){a=n.htmlPrefilter(a);try{for(;d>c;c++)b=this[c]||{},1===b.nodeType&&(n.cleanData(_(b,!1)),b.innerHTML=a);b=0}catch(e){}}b&&this.empty().append(a)},null,a,arguments.length)},replaceWith:function(){var a=[];return ua(this,arguments,function(b){var c=this.parentNode;n.inArray(this,a)<0&&(n.cleanData(_(this)),c&&c.replaceChild(b,this))},a)}}),n.each({appendTo:"append",prependTo:"prepend",insertBefore:"before",insertAfter:"after",replaceAll:"replaceWith"},function(a,b){n.fn[a]=function(a){for(var c,d=[],e=n(a),f=e.length-1,h=0;f>=h;h++)c=h===f?this:this.clone(!0),n(e[h])[b](c),g.apply(d,c.get());return this.pushStack(d)}});var wa,xa={HTML:"block",BODY:"block"};function ya(a,b){var c=n(b.createElement(a)).appendTo(b.body),d=n.css(c[0],"display");return c.detach(),d}function za(a){var b=d,c=xa[a];return c||(c=ya(a,b),"none"!==c&&c||(wa=(wa||n("<iframe frameborder='0' width='0' height='0'/>")).appendTo(b.documentElement),b=wa[0].contentDocument,b.write(),b.close(),c=ya(a,b),wa.detach()),xa[a]=c),c}var Aa=/^margin/,Ba=new RegExp("^("+S+")(?!px)[a-z%]+$","i"),Ca=function(b){var c=b.ownerDocument.defaultView;return c&&c.opener||(c=a),c.getComputedStyle(b)},Da=function(a,b,c,d){var e,f,g={};for(f in b)g[f]=a.style[f],a.style[f]=b[f];e=c.apply(a,d||[]);for(f in b)a.style[f]=g[f];return e},Ea=d.documentElement;!function(){var b,c,e,f,g=d.createElement("div"),h=d.createElement("div");if(h.style){h.style.backgroundClip="content-box",h.cloneNode(!0).style.backgroundClip="",l.clearCloneStyle="content-box"===h.style.backgroundClip,g.style.cssText="border:0;width:8px;height:0;top:0;left:-9999px;padding:0;margin-top:1px;position:absolute",g.appendChild(h);function i(){h.style.cssText="-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:relative;display:block;margin:auto;border:1px;padding:1px;top:1%;width:50%",h.innerHTML="",Ea.appendChild(g);var d=a.getComputedStyle(h);b="1%"!==d.top,f="2px"===d.marginLeft,c="4px"===d.width,h.style.marginRight="50%",e="4px"===d.marginRight,Ea.removeChild(g)}n.extend(l,{pixelPosition:function(){return i(),b},boxSizingReliable:function(){return null==c&&i(),c},pixelMarginRight:function(){return null==c&&i(),e},reliableMarginLeft:function(){return null==c&&i(),f},reliableMarginRight:function(){var b,c=h.appendChild(d.createElement("div"));return c.style.cssText=h.style.cssText="-webkit-box-sizing:content-box;box-sizing:content-box;display:block;margin:0;border:0;padding:0",c.style.marginRight=c.style.width="0",h.style.width="1px",Ea.appendChild(g),b=!parseFloat(a.getComputedStyle(c).marginRight),Ea.removeChild(g),h.removeChild(c),b}})}}();function Fa(a,b,c){var d,e,f,g,h=a.style;return c=c||Ca(a),g=c?c.getPropertyValue(b)||c[b]:void 0,""!==g&&void 0!==g||n.contains(a.ownerDocument,a)||(g=n.style(a,b)),c&&!l.pixelMarginRight()&&Ba.test(g)&&Aa.test(b)&&(d=h.width,e=h.minWidth,f=h.maxWidth,h.minWidth=h.maxWidth=h.width=g,g=c.width,h.width=d,h.minWidth=e,h.maxWidth=f),void 0!==g?g+"":g}function Ga(a,b){return{get:function(){return a()?void delete this.get:(this.get=b).apply(this,arguments)}}}var Ha=/^(none|table(?!-c[ea]).+)/,Ia={position:"absolute",visibility:"hidden",display:"block"},Ja={letterSpacing:"0",fontWeight:"400"},Ka=["Webkit","O","Moz","ms"],La=d.createElement("div").style;function Ma(a){if(a in La)return a;var b=a[0].toUpperCase()+a.slice(1),c=Ka.length;while(c--)if(a=Ka[c]+b,a in La)return a}function Na(a,b,c){var d=T.exec(b);return d?Math.max(0,d[2]-(c||0))+(d[3]||"px"):b}function Oa(a,b,c,d,e){for(var f=c===(d?"border":"content")?4:"width"===b?1:0,g=0;4>f;f+=2)"margin"===c&&(g+=n.css(a,c+U[f],!0,e)),d?("content"===c&&(g-=n.css(a,"padding"+U[f],!0,e)),"margin"!==c&&(g-=n.css(a,"border"+U[f]+"Width",!0,e))):(g+=n.css(a,"padding"+U[f],!0,e),"padding"!==c&&(g+=n.css(a,"border"+U[f]+"Width",!0,e)));return g}function Pa(a,b,c){var d=!0,e="width"===b?a.offsetWidth:a.offsetHeight,f=Ca(a),g="border-box"===n.css(a,"boxSizing",!1,f);if(0>=e||null==e){if(e=Fa(a,b,f),(0>e||null==e)&&(e=a.style[b]),Ba.test(e))return e;d=g&&(l.boxSizingReliable()||e===a.style[b]),e=parseFloat(e)||0}return e+Oa(a,b,c||(g?"border":"content"),d,f)+"px"}function Qa(a,b){for(var c,d,e,f=[],g=0,h=a.length;h>g;g++)d=a[g],d.style&&(f[g]=N.get(d,"olddisplay"),c=d.style.display,b?(f[g]||"none"!==c||(d.style.display=""),""===d.style.display&&V(d)&&(f[g]=N.access(d,"olddisplay",za(d.nodeName)))):(e=V(d),"none"===c&&e||N.set(d,"olddisplay",e?c:n.css(d,"display"))));for(g=0;h>g;g++)d=a[g],d.style&&(b&&"none"!==d.style.display&&""!==d.style.display||(d.style.display=b?f[g]||"":"none"));return a}n.extend({cssHooks:{opacity:{get:function(a,b){if(b){var c=Fa(a,"opacity");return""===c?"1":c}}}},cssNumber:{animationIterationCount:!0,columnCount:!0,fillOpacity:!0,flexGrow:!0,flexShrink:!0,fontWeight:!0,lineHeight:!0,opacity:!0,order:!0,orphans:!0,widows:!0,zIndex:!0,zoom:!0},cssProps:{"float":"cssFloat"},style:function(a,b,c,d){if(a&&3!==a.nodeType&&8!==a.nodeType&&a.style){var e,f,g,h=n.camelCase(b),i=a.style;return b=n.cssProps[h]||(n.cssProps[h]=Ma(h)||h),g=n.cssHooks[b]||n.cssHooks[h],void 0===c?g&&"get"in g&&void 0!==(e=g.get(a,!1,d))?e:i[b]:(f=typeof c,"string"===f&&(e=T.exec(c))&&e[1]&&(c=W(a,b,e),f="number"),null!=c&&c===c&&("number"===f&&(c+=e&&e[3]||(n.cssNumber[h]?"":"px")),l.clearCloneStyle||""!==c||0!==b.indexOf("background")||(i[b]="inherit"),g&&"set"in g&&void 0===(c=g.set(a,c,d))||(i[b]=c)),void 0)}},css:function(a,b,c,d){var e,f,g,h=n.camelCase(b);return b=n.cssProps[h]||(n.cssProps[h]=Ma(h)||h),g=n.cssHooks[b]||n.cssHooks[h],g&&"get"in g&&(e=g.get(a,!0,c)),void 0===e&&(e=Fa(a,b,d)),"normal"===e&&b in Ja&&(e=Ja[b]),""===c||c?(f=parseFloat(e),c===!0||isFinite(f)?f||0:e):e}}),n.each(["height","width"],function(a,b){n.cssHooks[b]={get:function(a,c,d){return c?Ha.test(n.css(a,"display"))&&0===a.offsetWidth?Da(a,Ia,function(){return Pa(a,b,d)}):Pa(a,b,d):void 0},set:function(a,c,d){var e,f=d&&Ca(a),g=d&&Oa(a,b,d,"border-box"===n.css(a,"boxSizing",!1,f),f);return g&&(e=T.exec(c))&&"px"!==(e[3]||"px")&&(a.style[b]=c,c=n.css(a,b)),Na(a,c,g)}}}),n.cssHooks.marginLeft=Ga(l.reliableMarginLeft,function(a,b){return b?(parseFloat(Fa(a,"marginLeft"))||a.getBoundingClientRect().left-Da(a,{marginLeft:0},function(){return a.getBoundingClientRect().left}))+"px":void 0}),n.cssHooks.marginRight=Ga(l.reliableMarginRight,function(a,b){return b?Da(a,{display:"inline-block"},Fa,[a,"marginRight"]):void 0}),n.each({margin:"",padding:"",border:"Width"},function(a,b){n.cssHooks[a+b]={expand:function(c){for(var d=0,e={},f="string"==typeof c?c.split(" "):[c];4>d;d++)e[a+U[d]+b]=f[d]||f[d-2]||f[0];return e}},Aa.test(a)||(n.cssHooks[a+b].set=Na)}),n.fn.extend({css:function(a,b){return K(this,function(a,b,c){var d,e,f={},g=0;if(n.isArray(b)){for(d=Ca(a),e=b.length;e>g;g++)f[b[g]]=n.css(a,b[g],!1,d);return f}return void 0!==c?n.style(a,b,c):n.css(a,b)},a,b,arguments.length>1)},show:function(){return Qa(this,!0)},hide:function(){return Qa(this)},toggle:function(a){return"boolean"==typeof a?a?this.show():this.hide():this.each(function(){V(this)?n(this).show():n(this).hide()})}});function Ra(a,b,c,d,e){return new Ra.prototype.init(a,b,c,d,e)}n.Tween=Ra,Ra.prototype={constructor:Ra,init:function(a,b,c,d,e,f){this.elem=a,this.prop=c,this.easing=e||n.easing._default,this.options=b,this.start=this.now=this.cur(),this.end=d,this.unit=f||(n.cssNumber[c]?"":"px")},cur:function(){var a=Ra.propHooks[this.prop];return a&&a.get?a.get(this):Ra.propHooks._default.get(this)},run:function(a){var b,c=Ra.propHooks[this.prop];return this.options.duration?this.pos=b=n.easing[this.easing](a,this.options.duration*a,0,1,this.options.duration):this.pos=b=a,this.now=(this.end-this.start)*b+this.start,this.options.step&&this.options.step.call(this.elem,this.now,this),c&&c.set?c.set(this):Ra.propHooks._default.set(this),this}},Ra.prototype.init.prototype=Ra.prototype,Ra.propHooks={_default:{get:function(a){var b;return 1!==a.elem.nodeType||null!=a.elem[a.prop]&&null==a.elem.style[a.prop]?a.elem[a.prop]:(b=n.css(a.elem,a.prop,""),b&&"auto"!==b?b:0)},set:function(a){n.fx.step[a.prop]?n.fx.step[a.prop](a):1!==a.elem.nodeType||null==a.elem.style[n.cssProps[a.prop]]&&!n.cssHooks[a.prop]?a.elem[a.prop]=a.now:n.style(a.elem,a.prop,a.now+a.unit)}}},Ra.propHooks.scrollTop=Ra.propHooks.scrollLeft={set:function(a){a.elem.nodeType&&a.elem.parentNode&&(a.elem[a.prop]=a.now)}},n.easing={linear:function(a){return a},swing:function(a){return.5-Math.cos(a*Math.PI)/2},_default:"swing"},n.fx=Ra.prototype.init,n.fx.step={};var Sa,Ta,Ua=/^(?:toggle|show|hide)$/,Va=/queueHooks$/;function Wa(){return a.setTimeout(function(){Sa=void 0}),Sa=n.now()}function Xa(a,b){var c,d=0,e={height:a};for(b=b?1:0;4>d;d+=2-b)c=U[d],e["margin"+c]=e["padding"+c]=a;return b&&(e.opacity=e.width=a),e}function Ya(a,b,c){for(var d,e=(_a.tweeners[b]||[]).concat(_a.tweeners["*"]),f=0,g=e.length;g>f;f++)if(d=e[f].call(c,b,a))return d}function Za(a,b,c){var d,e,f,g,h,i,j,k,l=this,m={},o=a.style,p=a.nodeType&&V(a),q=N.get(a,"fxshow");c.queue||(h=n._queueHooks(a,"fx"),null==h.unqueued&&(h.unqueued=0,i=h.empty.fire,h.empty.fire=function(){h.unqueued||i()}),h.unqueued++,l.always(function(){l.always(function(){h.unqueued--,n.queue(a,"fx").length||h.empty.fire()})})),1===a.nodeType&&("height"in b||"width"in b)&&(c.overflow=[o.overflow,o.overflowX,o.overflowY],j=n.css(a,"display"),k="none"===j?N.get(a,"olddisplay")||za(a.nodeName):j,"inline"===k&&"none"===n.css(a,"float")&&(o.display="inline-block")),c.overflow&&(o.overflow="hidden",l.always(function(){o.overflow=c.overflow[0],o.overflowX=c.overflow[1],o.overflowY=c.overflow[2]}));for(d in b)if(e=b[d],Ua.exec(e)){if(delete b[d],f=f||"toggle"===e,e===(p?"hide":"show")){if("show"!==e||!q||void 0===q[d])continue;p=!0}m[d]=q&&q[d]||n.style(a,d)}else j=void 0;if(n.isEmptyObject(m))"inline"===("none"===j?za(a.nodeName):j)&&(o.display=j);else{q?"hidden"in q&&(p=q.hidden):q=N.access(a,"fxshow",{}),f&&(q.hidden=!p),p?n(a).show():l.done(function(){n(a).hide()}),l.done(function(){var b;N.remove(a,"fxshow");for(b in m)n.style(a,b,m[b])});for(d in m)g=Ya(p?q[d]:0,d,l),d in q||(q[d]=g.start,p&&(g.end=g.start,g.start="width"===d||"height"===d?1:0))}}function $a(a,b){var c,d,e,f,g;for(c in a)if(d=n.camelCase(c),e=b[d],f=a[c],n.isArray(f)&&(e=f[1],f=a[c]=f[0]),c!==d&&(a[d]=f,delete a[c]),g=n.cssHooks[d],g&&"expand"in g){f=g.expand(f),delete a[d];for(c in f)c in a||(a[c]=f[c],b[c]=e)}else b[d]=e}function _a(a,b,c){var d,e,f=0,g=_a.prefilters.length,h=n.Deferred().always(function(){delete i.elem}),i=function(){if(e)return!1;for(var b=Sa||Wa(),c=Math.max(0,j.startTime+j.duration-b),d=c/j.duration||0,f=1-d,g=0,i=j.tweens.length;i>g;g++)j.tweens[g].run(f);return h.notifyWith(a,[j,f,c]),1>f&&i?c:(h.resolveWith(a,[j]),!1)},j=h.promise({elem:a,props:n.extend({},b),opts:n.extend(!0,{specialEasing:{},easing:n.easing._default},c),originalProperties:b,originalOptions:c,startTime:Sa||Wa(),duration:c.duration,tweens:[],createTween:function(b,c){var d=n.Tween(a,j.opts,b,c,j.opts.specialEasing[b]||j.opts.easing);return j.tweens.push(d),d},stop:function(b){var c=0,d=b?j.tweens.length:0;if(e)return this;for(e=!0;d>c;c++)j.tweens[c].run(1);return b?(h.notifyWith(a,[j,1,0]),h.resolveWith(a,[j,b])):h.rejectWith(a,[j,b]),this}}),k=j.props;for($a(k,j.opts.specialEasing);g>f;f++)if(d=_a.prefilters[f].call(j,a,k,j.opts))return n.isFunction(d.stop)&&(n._queueHooks(j.elem,j.opts.queue).stop=n.proxy(d.stop,d)),d;return n.map(k,Ya,j),n.isFunction(j.opts.start)&&j.opts.start.call(a,j),n.fx.timer(n.extend(i,{elem:a,anim:j,queue:j.opts.queue})),j.progress(j.opts.progress).done(j.opts.done,j.opts.complete).fail(j.opts.fail).always(j.opts.always)}n.Animation=n.extend(_a,{tweeners:{"*":[function(a,b){var c=this.createTween(a,b);return W(c.elem,a,T.exec(b),c),c}]},tweener:function(a,b){n.isFunction(a)?(b=a,a=["*"]):a=a.match(G);for(var c,d=0,e=a.length;e>d;d++)c=a[d],_a.tweeners[c]=_a.tweeners[c]||[],_a.tweeners[c].unshift(b)},prefilters:[Za],prefilter:function(a,b){b?_a.prefilters.unshift(a):_a.prefilters.push(a)}}),n.speed=function(a,b,c){var d=a&&"object"==typeof a?n.extend({},a):{complete:c||!c&&b||n.isFunction(a)&&a,duration:a,easing:c&&b||b&&!n.isFunction(b)&&b};return d.duration=n.fx.off?0:"number"==typeof d.duration?d.duration:d.duration in n.fx.speeds?n.fx.speeds[d.duration]:n.fx.speeds._default,null!=d.queue&&d.queue!==!0||(d.queue="fx"),d.old=d.complete,d.complete=function(){n.isFunction(d.old)&&d.old.call(this),d.queue&&n.dequeue(this,d.queue)},d},n.fn.extend({fadeTo:function(a,b,c,d){return this.filter(V).css("opacity",0).show().end().animate({opacity:b},a,c,d)},animate:function(a,b,c,d){var e=n.isEmptyObject(a),f=n.speed(b,c,d),g=function(){var b=_a(this,n.extend({},a),f);(e||N.get(this,"finish"))&&b.stop(!0)};return g.finish=g,e||f.queue===!1?this.each(g):this.queue(f.queue,g)},stop:function(a,b,c){var d=function(a){var b=a.stop;delete a.stop,b(c)};return"string"!=typeof a&&(c=b,b=a,a=void 0),b&&a!==!1&&this.queue(a||"fx",[]),this.each(function(){var b=!0,e=null!=a&&a+"queueHooks",f=n.timers,g=N.get(this);if(e)g[e]&&g[e].stop&&d(g[e]);else for(e in g)g[e]&&g[e].stop&&Va.test(e)&&d(g[e]);for(e=f.length;e--;)f[e].elem!==this||null!=a&&f[e].queue!==a||(f[e].anim.stop(c),b=!1,f.splice(e,1));!b&&c||n.dequeue(this,a)})},finish:function(a){return a!==!1&&(a=a||"fx"),this.each(function(){var b,c=N.get(this),d=c[a+"queue"],e=c[a+"queueHooks"],f=n.timers,g=d?d.length:0;for(c.finish=!0,n.queue(this,a,[]),e&&e.stop&&e.stop.call(this,!0),b=f.length;b--;)f[b].elem===this&&f[b].queue===a&&(f[b].anim.stop(!0),f.splice(b,1));for(b=0;g>b;b++)d[b]&&d[b].finish&&d[b].finish.call(this);delete c.finish})}}),n.each(["toggle","show","hide"],function(a,b){var c=n.fn[b];n.fn[b]=function(a,d,e){return null==a||"boolean"==typeof a?c.apply(this,arguments):this.animate(Xa(b,!0),a,d,e)}}),n.each({slideDown:Xa("show"),slideUp:Xa("hide"),slideToggle:Xa("toggle"),fadeIn:{opacity:"show"},fadeOut:{opacity:"hide"},fadeToggle:{opacity:"toggle"}},function(a,b){n.fn[a]=function(a,c,d){return this.animate(b,a,c,d)}}),n.timers=[],n.fx.tick=function(){var a,b=0,c=n.timers;for(Sa=n.now();b<c.length;b++)a=c[b],a()||c[b]!==a||c.splice(b--,1);c.length||n.fx.stop(),Sa=void 0},n.fx.timer=function(a){n.timers.push(a),a()?n.fx.start():n.timers.pop()},n.fx.interval=13,n.fx.start=function(){Ta||(Ta=a.setInterval(n.fx.tick,n.fx.interval))},n.fx.stop=function(){a.clearInterval(Ta),Ta=null},n.fx.speeds={slow:600,fast:200,_default:400},n.fn.delay=function(b,c){return b=n.fx?n.fx.speeds[b]||b:b,c=c||"fx",this.queue(c,function(c,d){var e=a.setTimeout(c,b);d.stop=function(){a.clearTimeout(e)}})},function(){var a=d.createElement("input"),b=d.createElement("select"),c=b.appendChild(d.createElement("option"));a.type="checkbox",l.checkOn=""!==a.value,l.optSelected=c.selected,b.disabled=!0,l.optDisabled=!c.disabled,a=d.createElement("input"),a.value="t",a.type="radio",l.radioValue="t"===a.value}();var ab,bb=n.expr.attrHandle;n.fn.extend({attr:function(a,b){return K(this,n.attr,a,b,arguments.length>1)},removeAttr:function(a){return this.each(function(){n.removeAttr(this,a)})}}),n.extend({attr:function(a,b,c){var d,e,f=a.nodeType;if(3!==f&&8!==f&&2!==f)return"undefined"==typeof a.getAttribute?n.prop(a,b,c):(1===f&&n.isXMLDoc(a)||(b=b.toLowerCase(),e=n.attrHooks[b]||(n.expr.match.bool.test(b)?ab:void 0)),void 0!==c?null===c?void n.removeAttr(a,b):e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:(a.setAttribute(b,c+""),c):e&&"get"in e&&null!==(d=e.get(a,b))?d:(d=n.find.attr(a,b),null==d?void 0:d))},attrHooks:{type:{set:function(a,b){if(!l.radioValue&&"radio"===b&&n.nodeName(a,"input")){var c=a.value;return a.setAttribute("type",b),c&&(a.value=c),b}}}},removeAttr:function(a,b){var c,d,e=0,f=b&&b.match(G);if(f&&1===a.nodeType)while(c=f[e++])d=n.propFix[c]||c,n.expr.match.bool.test(c)&&(a[d]=!1),a.removeAttribute(c)}}),ab={set:function(a,b,c){return b===!1?n.removeAttr(a,c):a.setAttribute(c,c),c}},n.each(n.expr.match.bool.source.match(/\w+/g),function(a,b){var c=bb[b]||n.find.attr;bb[b]=function(a,b,d){var e,f;return d||(f=bb[b],bb[b]=e,e=null!=c(a,b,d)?b.toLowerCase():null,bb[b]=f),e}});var cb=/^(?:input|select|textarea|button)$/i,db=/^(?:a|area)$/i;n.fn.extend({prop:function(a,b){return K(this,n.prop,a,b,arguments.length>1)},removeProp:function(a){return this.each(function(){delete this[n.propFix[a]||a]})}}),n.extend({prop:function(a,b,c){var d,e,f=a.nodeType;if(3!==f&&8!==f&&2!==f)return 1===f&&n.isXMLDoc(a)||(b=n.propFix[b]||b,e=n.propHooks[b]),
void 0!==c?e&&"set"in e&&void 0!==(d=e.set(a,c,b))?d:a[b]=c:e&&"get"in e&&null!==(d=e.get(a,b))?d:a[b]},propHooks:{tabIndex:{get:function(a){var b=n.find.attr(a,"tabindex");return b?parseInt(b,10):cb.test(a.nodeName)||db.test(a.nodeName)&&a.href?0:-1}}},propFix:{"for":"htmlFor","class":"className"}}),l.optSelected||(n.propHooks.selected={get:function(a){var b=a.parentNode;return b&&b.parentNode&&b.parentNode.selectedIndex,null},set:function(a){var b=a.parentNode;b&&(b.selectedIndex,b.parentNode&&b.parentNode.selectedIndex)}}),n.each(["tabIndex","readOnly","maxLength","cellSpacing","cellPadding","rowSpan","colSpan","useMap","frameBorder","contentEditable"],function(){n.propFix[this.toLowerCase()]=this});var eb=/[\t\r\n\f]/g;function fb(a){return a.getAttribute&&a.getAttribute("class")||""}n.fn.extend({addClass:function(a){var b,c,d,e,f,g,h,i=0;if(n.isFunction(a))return this.each(function(b){n(this).addClass(a.call(this,b,fb(this)))});if("string"==typeof a&&a){b=a.match(G)||[];while(c=this[i++])if(e=fb(c),d=1===c.nodeType&&(" "+e+" ").replace(eb," ")){g=0;while(f=b[g++])d.indexOf(" "+f+" ")<0&&(d+=f+" ");h=n.trim(d),e!==h&&c.setAttribute("class",h)}}return this},removeClass:function(a){var b,c,d,e,f,g,h,i=0;if(n.isFunction(a))return this.each(function(b){n(this).removeClass(a.call(this,b,fb(this)))});if(!arguments.length)return this.attr("class","");if("string"==typeof a&&a){b=a.match(G)||[];while(c=this[i++])if(e=fb(c),d=1===c.nodeType&&(" "+e+" ").replace(eb," ")){g=0;while(f=b[g++])while(d.indexOf(" "+f+" ")>-1)d=d.replace(" "+f+" "," ");h=n.trim(d),e!==h&&c.setAttribute("class",h)}}return this},toggleClass:function(a,b){var c=typeof a;return"boolean"==typeof b&&"string"===c?b?this.addClass(a):this.removeClass(a):n.isFunction(a)?this.each(function(c){n(this).toggleClass(a.call(this,c,fb(this),b),b)}):this.each(function(){var b,d,e,f;if("string"===c){d=0,e=n(this),f=a.match(G)||[];while(b=f[d++])e.hasClass(b)?e.removeClass(b):e.addClass(b)}else void 0!==a&&"boolean"!==c||(b=fb(this),b&&N.set(this,"__className__",b),this.setAttribute&&this.setAttribute("class",b||a===!1?"":N.get(this,"__className__")||""))})},hasClass:function(a){var b,c,d=0;b=" "+a+" ";while(c=this[d++])if(1===c.nodeType&&(" "+fb(c)+" ").replace(eb," ").indexOf(b)>-1)return!0;return!1}});var gb=/\r/g,hb=/[\x20\t\r\n\f]+/g;n.fn.extend({val:function(a){var b,c,d,e=this[0];{if(arguments.length)return d=n.isFunction(a),this.each(function(c){var e;1===this.nodeType&&(e=d?a.call(this,c,n(this).val()):a,null==e?e="":"number"==typeof e?e+="":n.isArray(e)&&(e=n.map(e,function(a){return null==a?"":a+""})),b=n.valHooks[this.type]||n.valHooks[this.nodeName.toLowerCase()],b&&"set"in b&&void 0!==b.set(this,e,"value")||(this.value=e))});if(e)return b=n.valHooks[e.type]||n.valHooks[e.nodeName.toLowerCase()],b&&"get"in b&&void 0!==(c=b.get(e,"value"))?c:(c=e.value,"string"==typeof c?c.replace(gb,""):null==c?"":c)}}}),n.extend({valHooks:{option:{get:function(a){var b=n.find.attr(a,"value");return null!=b?b:n.trim(n.text(a)).replace(hb," ")}},select:{get:function(a){for(var b,c,d=a.options,e=a.selectedIndex,f="select-one"===a.type||0>e,g=f?null:[],h=f?e+1:d.length,i=0>e?h:f?e:0;h>i;i++)if(c=d[i],(c.selected||i===e)&&(l.optDisabled?!c.disabled:null===c.getAttribute("disabled"))&&(!c.parentNode.disabled||!n.nodeName(c.parentNode,"optgroup"))){if(b=n(c).val(),f)return b;g.push(b)}return g},set:function(a,b){var c,d,e=a.options,f=n.makeArray(b),g=e.length;while(g--)d=e[g],(d.selected=n.inArray(n.valHooks.option.get(d),f)>-1)&&(c=!0);return c||(a.selectedIndex=-1),f}}}}),n.each(["radio","checkbox"],function(){n.valHooks[this]={set:function(a,b){return n.isArray(b)?a.checked=n.inArray(n(a).val(),b)>-1:void 0}},l.checkOn||(n.valHooks[this].get=function(a){return null===a.getAttribute("value")?"on":a.value})});var ib=/^(?:focusinfocus|focusoutblur)$/;n.extend(n.event,{trigger:function(b,c,e,f){var g,h,i,j,l,m,o,p=[e||d],q=k.call(b,"type")?b.type:b,r=k.call(b,"namespace")?b.namespace.split("."):[];if(h=i=e=e||d,3!==e.nodeType&&8!==e.nodeType&&!ib.test(q+n.event.triggered)&&(q.indexOf(".")>-1&&(r=q.split("."),q=r.shift(),r.sort()),l=q.indexOf(":")<0&&"on"+q,b=b[n.expando]?b:new n.Event(q,"object"==typeof b&&b),b.isTrigger=f?2:3,b.namespace=r.join("."),b.rnamespace=b.namespace?new RegExp("(^|\\.)"+r.join("\\.(?:.*\\.|)")+"(\\.|$)"):null,b.result=void 0,b.target||(b.target=e),c=null==c?[b]:n.makeArray(c,[b]),o=n.event.special[q]||{},f||!o.trigger||o.trigger.apply(e,c)!==!1)){if(!f&&!o.noBubble&&!n.isWindow(e)){for(j=o.delegateType||q,ib.test(j+q)||(h=h.parentNode);h;h=h.parentNode)p.push(h),i=h;i===(e.ownerDocument||d)&&p.push(i.defaultView||i.parentWindow||a)}g=0;while((h=p[g++])&&!b.isPropagationStopped())b.type=g>1?j:o.bindType||q,m=(N.get(h,"events")||{})[b.type]&&N.get(h,"handle"),m&&m.apply(h,c),m=l&&h[l],m&&m.apply&&L(h)&&(b.result=m.apply(h,c),b.result===!1&&b.preventDefault());return b.type=q,f||b.isDefaultPrevented()||o._default&&o._default.apply(p.pop(),c)!==!1||!L(e)||l&&n.isFunction(e[q])&&!n.isWindow(e)&&(i=e[l],i&&(e[l]=null),n.event.triggered=q,e[q](),n.event.triggered=void 0,i&&(e[l]=i)),b.result}},simulate:function(a,b,c){var d=n.extend(new n.Event,c,{type:a,isSimulated:!0});n.event.trigger(d,null,b)}}),n.fn.extend({trigger:function(a,b){return this.each(function(){n.event.trigger(a,b,this)})},triggerHandler:function(a,b){var c=this[0];return c?n.event.trigger(a,b,c,!0):void 0}}),n.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "),function(a,b){n.fn[b]=function(a,c){return arguments.length>0?this.on(b,null,a,c):this.trigger(b)}}),n.fn.extend({hover:function(a,b){return this.mouseenter(a).mouseleave(b||a)}}),l.focusin="onfocusin"in a,l.focusin||n.each({focus:"focusin",blur:"focusout"},function(a,b){var c=function(a){n.event.simulate(b,a.target,n.event.fix(a))};n.event.special[b]={setup:function(){var d=this.ownerDocument||this,e=N.access(d,b);e||d.addEventListener(a,c,!0),N.access(d,b,(e||0)+1)},teardown:function(){var d=this.ownerDocument||this,e=N.access(d,b)-1;e?N.access(d,b,e):(d.removeEventListener(a,c,!0),N.remove(d,b))}}});var jb=a.location,kb=n.now(),lb=/\?/;n.parseJSON=function(a){return JSON.parse(a+"")},n.parseXML=function(b){var c;if(!b||"string"!=typeof b)return null;try{c=(new a.DOMParser).parseFromString(b,"text/xml")}catch(d){c=void 0}return c&&!c.getElementsByTagName("parsererror").length||n.error("Invalid XML: "+b),c};var mb=/#.*$/,nb=/([?&])_=[^&]*/,ob=/^(.*?):[ \t]*([^\r\n]*)$/gm,pb=/^(?:about|app|app-storage|.+-extension|file|res|widget):$/,qb=/^(?:GET|HEAD)$/,rb=/^\/\//,sb={},tb={},ub="*/".concat("*"),vb=d.createElement("a");vb.href=jb.href;function wb(a){return function(b,c){"string"!=typeof b&&(c=b,b="*");var d,e=0,f=b.toLowerCase().match(G)||[];if(n.isFunction(c))while(d=f[e++])"+"===d[0]?(d=d.slice(1)||"*",(a[d]=a[d]||[]).unshift(c)):(a[d]=a[d]||[]).push(c)}}function xb(a,b,c,d){var e={},f=a===tb;function g(h){var i;return e[h]=!0,n.each(a[h]||[],function(a,h){var j=h(b,c,d);return"string"!=typeof j||f||e[j]?f?!(i=j):void 0:(b.dataTypes.unshift(j),g(j),!1)}),i}return g(b.dataTypes[0])||!e["*"]&&g("*")}function yb(a,b){var c,d,e=n.ajaxSettings.flatOptions||{};for(c in b)void 0!==b[c]&&((e[c]?a:d||(d={}))[c]=b[c]);return d&&n.extend(!0,a,d),a}function zb(a,b,c){var d,e,f,g,h=a.contents,i=a.dataTypes;while("*"===i[0])i.shift(),void 0===d&&(d=a.mimeType||b.getResponseHeader("Content-Type"));if(d)for(e in h)if(h[e]&&h[e].test(d)){i.unshift(e);break}if(i[0]in c)f=i[0];else{for(e in c){if(!i[0]||a.converters[e+" "+i[0]]){f=e;break}g||(g=e)}f=f||g}return f?(f!==i[0]&&i.unshift(f),c[f]):void 0}function Ab(a,b,c,d){var e,f,g,h,i,j={},k=a.dataTypes.slice();if(k[1])for(g in a.converters)j[g.toLowerCase()]=a.converters[g];f=k.shift();while(f)if(a.responseFields[f]&&(c[a.responseFields[f]]=b),!i&&d&&a.dataFilter&&(b=a.dataFilter(b,a.dataType)),i=f,f=k.shift())if("*"===f)f=i;else if("*"!==i&&i!==f){if(g=j[i+" "+f]||j["* "+f],!g)for(e in j)if(h=e.split(" "),h[1]===f&&(g=j[i+" "+h[0]]||j["* "+h[0]])){g===!0?g=j[e]:j[e]!==!0&&(f=h[0],k.unshift(h[1]));break}if(g!==!0)if(g&&a["throws"])b=g(b);else try{b=g(b)}catch(l){return{state:"parsererror",error:g?l:"No conversion from "+i+" to "+f}}}return{state:"success",data:b}}n.extend({active:0,lastModified:{},etag:{},ajaxSettings:{url:jb.href,type:"GET",isLocal:pb.test(jb.protocol),global:!0,processData:!0,async:!0,contentType:"application/x-www-form-urlencoded; charset=UTF-8",accepts:{"*":ub,text:"text/plain",html:"text/html",xml:"application/xml, text/xml",json:"application/json, text/javascript"},contents:{xml:/\bxml\b/,html:/\bhtml/,json:/\bjson\b/},responseFields:{xml:"responseXML",text:"responseText",json:"responseJSON"},converters:{"* text":String,"text html":!0,"text json":n.parseJSON,"text xml":n.parseXML},flatOptions:{url:!0,context:!0}},ajaxSetup:function(a,b){return b?yb(yb(a,n.ajaxSettings),b):yb(n.ajaxSettings,a)},ajaxPrefilter:wb(sb),ajaxTransport:wb(tb),ajax:function(b,c){"object"==typeof b&&(c=b,b=void 0),c=c||{};var e,f,g,h,i,j,k,l,m=n.ajaxSetup({},c),o=m.context||m,p=m.context&&(o.nodeType||o.jquery)?n(o):n.event,q=n.Deferred(),r=n.Callbacks("once memory"),s=m.statusCode||{},t={},u={},v=0,w="canceled",x={readyState:0,getResponseHeader:function(a){var b;if(2===v){if(!h){h={};while(b=ob.exec(g))h[b[1].toLowerCase()]=b[2]}b=h[a.toLowerCase()]}return null==b?null:b},getAllResponseHeaders:function(){return 2===v?g:null},setRequestHeader:function(a,b){var c=a.toLowerCase();return v||(a=u[c]=u[c]||a,t[a]=b),this},overrideMimeType:function(a){return v||(m.mimeType=a),this},statusCode:function(a){var b;if(a)if(2>v)for(b in a)s[b]=[s[b],a[b]];else x.always(a[x.status]);return this},abort:function(a){var b=a||w;return e&&e.abort(b),z(0,b),this}};if(q.promise(x).complete=r.add,x.success=x.done,x.error=x.fail,m.url=((b||m.url||jb.href)+"").replace(mb,"").replace(rb,jb.protocol+"//"),m.type=c.method||c.type||m.method||m.type,m.dataTypes=n.trim(m.dataType||"*").toLowerCase().match(G)||[""],null==m.crossDomain){j=d.createElement("a");try{j.href=m.url,j.href=j.href,m.crossDomain=vb.protocol+"//"+vb.host!=j.protocol+"//"+j.host}catch(y){m.crossDomain=!0}}if(m.data&&m.processData&&"string"!=typeof m.data&&(m.data=n.param(m.data,m.traditional)),xb(sb,m,c,x),2===v)return x;k=n.event&&m.global,k&&0===n.active++&&n.event.trigger("ajaxStart"),m.type=m.type.toUpperCase(),m.hasContent=!qb.test(m.type),f=m.url,m.hasContent||(m.data&&(f=m.url+=(lb.test(f)?"&":"?")+m.data,delete m.data),m.cache===!1&&(m.url=nb.test(f)?f.replace(nb,"$1_="+kb++):f+(lb.test(f)?"&":"?")+"_="+kb++)),m.ifModified&&(n.lastModified[f]&&x.setRequestHeader("If-Modified-Since",n.lastModified[f]),n.etag[f]&&x.setRequestHeader("If-None-Match",n.etag[f])),(m.data&&m.hasContent&&m.contentType!==!1||c.contentType)&&x.setRequestHeader("Content-Type",m.contentType),x.setRequestHeader("Accept",m.dataTypes[0]&&m.accepts[m.dataTypes[0]]?m.accepts[m.dataTypes[0]]+("*"!==m.dataTypes[0]?", "+ub+"; q=0.01":""):m.accepts["*"]);for(l in m.headers)x.setRequestHeader(l,m.headers[l]);if(m.beforeSend&&(m.beforeSend.call(o,x,m)===!1||2===v))return x.abort();w="abort";for(l in{success:1,error:1,complete:1})x[l](m[l]);if(e=xb(tb,m,c,x)){if(x.readyState=1,k&&p.trigger("ajaxSend",[x,m]),2===v)return x;m.async&&m.timeout>0&&(i=a.setTimeout(function(){x.abort("timeout")},m.timeout));try{v=1,e.send(t,z)}catch(y){if(!(2>v))throw y;z(-1,y)}}else z(-1,"No Transport");function z(b,c,d,h){var j,l,t,u,w,y=c;2!==v&&(v=2,i&&a.clearTimeout(i),e=void 0,g=h||"",x.readyState=b>0?4:0,j=b>=200&&300>b||304===b,d&&(u=zb(m,x,d)),u=Ab(m,u,x,j),j?(m.ifModified&&(w=x.getResponseHeader("Last-Modified"),w&&(n.lastModified[f]=w),w=x.getResponseHeader("etag"),w&&(n.etag[f]=w)),204===b||"HEAD"===m.type?y="nocontent":304===b?y="notmodified":(y=u.state,l=u.data,t=u.error,j=!t)):(t=y,!b&&y||(y="error",0>b&&(b=0))),x.status=b,x.statusText=(c||y)+"",j?q.resolveWith(o,[l,y,x]):q.rejectWith(o,[x,y,t]),x.statusCode(s),s=void 0,k&&p.trigger(j?"ajaxSuccess":"ajaxError",[x,m,j?l:t]),r.fireWith(o,[x,y]),k&&(p.trigger("ajaxComplete",[x,m]),--n.active||n.event.trigger("ajaxStop")))}return x},getJSON:function(a,b,c){return n.get(a,b,c,"json")},getScript:function(a,b){return n.get(a,void 0,b,"script")}}),n.each(["get","post"],function(a,b){n[b]=function(a,c,d,e){return n.isFunction(c)&&(e=e||d,d=c,c=void 0),n.ajax(n.extend({url:a,type:b,dataType:e,data:c,success:d},n.isPlainObject(a)&&a))}}),n._evalUrl=function(a){return n.ajax({url:a,type:"GET",dataType:"script",async:!1,global:!1,"throws":!0})},n.fn.extend({wrapAll:function(a){var b;return n.isFunction(a)?this.each(function(b){n(this).wrapAll(a.call(this,b))}):(this[0]&&(b=n(a,this[0].ownerDocument).eq(0).clone(!0),this[0].parentNode&&b.insertBefore(this[0]),b.map(function(){var a=this;while(a.firstElementChild)a=a.firstElementChild;return a}).append(this)),this)},wrapInner:function(a){return n.isFunction(a)?this.each(function(b){n(this).wrapInner(a.call(this,b))}):this.each(function(){var b=n(this),c=b.contents();c.length?c.wrapAll(a):b.append(a)})},wrap:function(a){var b=n.isFunction(a);return this.each(function(c){n(this).wrapAll(b?a.call(this,c):a)})},unwrap:function(){return this.parent().each(function(){n.nodeName(this,"body")||n(this).replaceWith(this.childNodes)}).end()}}),n.expr.filters.hidden=function(a){return!n.expr.filters.visible(a)},n.expr.filters.visible=function(a){return a.offsetWidth>0||a.offsetHeight>0||a.getClientRects().length>0};var Bb=/%20/g,Cb=/\[\]$/,Db=/\r?\n/g,Eb=/^(?:submit|button|image|reset|file)$/i,Fb=/^(?:input|select|textarea|keygen)/i;function Gb(a,b,c,d){var e;if(n.isArray(b))n.each(b,function(b,e){c||Cb.test(a)?d(a,e):Gb(a+"["+("object"==typeof e&&null!=e?b:"")+"]",e,c,d)});else if(c||"object"!==n.type(b))d(a,b);else for(e in b)Gb(a+"["+e+"]",b[e],c,d)}n.param=function(a,b){var c,d=[],e=function(a,b){b=n.isFunction(b)?b():null==b?"":b,d[d.length]=encodeURIComponent(a)+"="+encodeURIComponent(b)};if(void 0===b&&(b=n.ajaxSettings&&n.ajaxSettings.traditional),n.isArray(a)||a.jquery&&!n.isPlainObject(a))n.each(a,function(){e(this.name,this.value)});else for(c in a)Gb(c,a[c],b,e);return d.join("&").replace(Bb,"+")},n.fn.extend({serialize:function(){return n.param(this.serializeArray())},serializeArray:function(){return this.map(function(){var a=n.prop(this,"elements");return a?n.makeArray(a):this}).filter(function(){var a=this.type;return this.name&&!n(this).is(":disabled")&&Fb.test(this.nodeName)&&!Eb.test(a)&&(this.checked||!X.test(a))}).map(function(a,b){var c=n(this).val();return null==c?null:n.isArray(c)?n.map(c,function(a){return{name:b.name,value:a.replace(Db,"\r\n")}}):{name:b.name,value:c.replace(Db,"\r\n")}}).get()}}),n.ajaxSettings.xhr=function(){try{return new a.XMLHttpRequest}catch(b){}};var Hb={0:200,1223:204},Ib=n.ajaxSettings.xhr();l.cors=!!Ib&&"withCredentials"in Ib,l.ajax=Ib=!!Ib,n.ajaxTransport(function(b){var c,d;return l.cors||Ib&&!b.crossDomain?{send:function(e,f){var g,h=b.xhr();if(h.open(b.type,b.url,b.async,b.username,b.password),b.xhrFields)for(g in b.xhrFields)h[g]=b.xhrFields[g];b.mimeType&&h.overrideMimeType&&h.overrideMimeType(b.mimeType),b.crossDomain||e["X-Requested-With"]||(e["X-Requested-With"]="XMLHttpRequest");for(g in e)h.setRequestHeader(g,e[g]);c=function(a){return function(){c&&(c=d=h.onload=h.onerror=h.onabort=h.onreadystatechange=null,"abort"===a?h.abort():"error"===a?"number"!=typeof h.status?f(0,"error"):f(h.status,h.statusText):f(Hb[h.status]||h.status,h.statusText,"text"!==(h.responseType||"text")||"string"!=typeof h.responseText?{binary:h.response}:{text:h.responseText},h.getAllResponseHeaders()))}},h.onload=c(),d=h.onerror=c("error"),void 0!==h.onabort?h.onabort=d:h.onreadystatechange=function(){4===h.readyState&&a.setTimeout(function(){c&&d()})},c=c("abort");try{h.send(b.hasContent&&b.data||null)}catch(i){if(c)throw i}},abort:function(){c&&c()}}:void 0}),n.ajaxSetup({accepts:{script:"text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"},contents:{script:/\b(?:java|ecma)script\b/},converters:{"text script":function(a){return n.globalEval(a),a}}}),n.ajaxPrefilter("script",function(a){void 0===a.cache&&(a.cache=!1),a.crossDomain&&(a.type="GET")}),n.ajaxTransport("script",function(a){if(a.crossDomain){var b,c;return{send:function(e,f){b=n("<script>").prop({charset:a.scriptCharset,src:a.url}).on("load error",c=function(a){b.remove(),c=null,a&&f("error"===a.type?404:200,a.type)}),d.head.appendChild(b[0])},abort:function(){c&&c()}}}});var Jb=[],Kb=/(=)\?(?=&|$)|\?\?/;n.ajaxSetup({jsonp:"callback",jsonpCallback:function(){var a=Jb.pop()||n.expando+"_"+kb++;return this[a]=!0,a}}),n.ajaxPrefilter("json jsonp",function(b,c,d){var e,f,g,h=b.jsonp!==!1&&(Kb.test(b.url)?"url":"string"==typeof b.data&&0===(b.contentType||"").indexOf("application/x-www-form-urlencoded")&&Kb.test(b.data)&&"data");return h||"jsonp"===b.dataTypes[0]?(e=b.jsonpCallback=n.isFunction(b.jsonpCallback)?b.jsonpCallback():b.jsonpCallback,h?b[h]=b[h].replace(Kb,"$1"+e):b.jsonp!==!1&&(b.url+=(lb.test(b.url)?"&":"?")+b.jsonp+"="+e),b.converters["script json"]=function(){return g||n.error(e+" was not called"),g[0]},b.dataTypes[0]="json",f=a[e],a[e]=function(){g=arguments},d.always(function(){void 0===f?n(a).removeProp(e):a[e]=f,b[e]&&(b.jsonpCallback=c.jsonpCallback,Jb.push(e)),g&&n.isFunction(f)&&f(g[0]),g=f=void 0}),"script"):void 0}),n.parseHTML=function(a,b,c){if(!a||"string"!=typeof a)return null;"boolean"==typeof b&&(c=b,b=!1),b=b||d;var e=x.exec(a),f=!c&&[];return e?[b.createElement(e[1])]:(e=ca([a],b,f),f&&f.length&&n(f).remove(),n.merge([],e.childNodes))};var Lb=n.fn.load;n.fn.load=function(a,b,c){if("string"!=typeof a&&Lb)return Lb.apply(this,arguments);var d,e,f,g=this,h=a.indexOf(" ");return h>-1&&(d=n.trim(a.slice(h)),a=a.slice(0,h)),n.isFunction(b)?(c=b,b=void 0):b&&"object"==typeof b&&(e="POST"),g.length>0&&n.ajax({url:a,type:e||"GET",dataType:"html",data:b}).done(function(a){f=arguments,g.html(d?n("<div>").append(n.parseHTML(a)).find(d):a)}).always(c&&function(a,b){g.each(function(){c.apply(this,f||[a.responseText,b,a])})}),this},n.each(["ajaxStart","ajaxStop","ajaxComplete","ajaxError","ajaxSuccess","ajaxSend"],function(a,b){n.fn[b]=function(a){return this.on(b,a)}}),n.expr.filters.animated=function(a){return n.grep(n.timers,function(b){return a===b.elem}).length};function Mb(a){return n.isWindow(a)?a:9===a.nodeType&&a.defaultView}n.offset={setOffset:function(a,b,c){var d,e,f,g,h,i,j,k=n.css(a,"position"),l=n(a),m={};"static"===k&&(a.style.position="relative"),h=l.offset(),f=n.css(a,"top"),i=n.css(a,"left"),j=("absolute"===k||"fixed"===k)&&(f+i).indexOf("auto")>-1,j?(d=l.position(),g=d.top,e=d.left):(g=parseFloat(f)||0,e=parseFloat(i)||0),n.isFunction(b)&&(b=b.call(a,c,n.extend({},h))),null!=b.top&&(m.top=b.top-h.top+g),null!=b.left&&(m.left=b.left-h.left+e),"using"in b?b.using.call(a,m):l.css(m)}},n.fn.extend({offset:function(a){if(arguments.length)return void 0===a?this:this.each(function(b){n.offset.setOffset(this,a,b)});var b,c,d=this[0],e={top:0,left:0},f=d&&d.ownerDocument;if(f)return b=f.documentElement,n.contains(b,d)?(e=d.getBoundingClientRect(),c=Mb(f),{top:e.top+c.pageYOffset-b.clientTop,left:e.left+c.pageXOffset-b.clientLeft}):e},position:function(){if(this[0]){var a,b,c=this[0],d={top:0,left:0};return"fixed"===n.css(c,"position")?b=c.getBoundingClientRect():(a=this.offsetParent(),b=this.offset(),n.nodeName(a[0],"html")||(d=a.offset()),d.top+=n.css(a[0],"borderTopWidth",!0),d.left+=n.css(a[0],"borderLeftWidth",!0)),{top:b.top-d.top-n.css(c,"marginTop",!0),left:b.left-d.left-n.css(c,"marginLeft",!0)}}},offsetParent:function(){return this.map(function(){var a=this.offsetParent;while(a&&"static"===n.css(a,"position"))a=a.offsetParent;return a||Ea})}}),n.each({scrollLeft:"pageXOffset",scrollTop:"pageYOffset"},function(a,b){var c="pageYOffset"===b;n.fn[a]=function(d){return K(this,function(a,d,e){var f=Mb(a);return void 0===e?f?f[b]:a[d]:void(f?f.scrollTo(c?f.pageXOffset:e,c?e:f.pageYOffset):a[d]=e)},a,d,arguments.length)}}),n.each(["top","left"],function(a,b){n.cssHooks[b]=Ga(l.pixelPosition,function(a,c){return c?(c=Fa(a,b),Ba.test(c)?n(a).position()[b]+"px":c):void 0})}),n.each({Height:"height",Width:"width"},function(a,b){n.each({padding:"inner"+a,content:b,"":"outer"+a},function(c,d){n.fn[d]=function(d,e){var f=arguments.length&&(c||"boolean"!=typeof d),g=c||(d===!0||e===!0?"margin":"border");return K(this,function(b,c,d){var e;return n.isWindow(b)?b.document.documentElement["client"+a]:9===b.nodeType?(e=b.documentElement,Math.max(b.body["scroll"+a],e["scroll"+a],b.body["offset"+a],e["offset"+a],e["client"+a])):void 0===d?n.css(b,c,g):n.style(b,c,d,g)},b,f?d:void 0,f,null)}})}),n.fn.extend({bind:function(a,b,c){return this.on(a,null,b,c)},unbind:function(a,b){return this.off(a,null,b)},delegate:function(a,b,c,d){return this.on(b,a,c,d)},undelegate:function(a,b,c){return 1===arguments.length?this.off(a,"**"):this.off(b,a||"**",c)},size:function(){return this.length}}),n.fn.andSelf=n.fn.addBack,"function"==typeof define&&define.amd&&define("jquery",[],function(){return n});var Nb=a.jQuery,Ob=a.$;return n.noConflict=function(b){return a.$===n&&(a.$=Ob),b&&a.jQuery===n&&(a.jQuery=Nb),n},b||(a.jQuery=a.$=n),n});

module.exports = function( Release ) {

var crypto = require( "crypto" );
var shell = require( "shelljs" ),
	path = require( "path" ),
	fs = require( "fs" );

function replaceAtVersion() {
	console.log( "Replacing @VERSION..." );
	var matches = [];

	function recurse( folder ) {
		fs.readdirSync( folder ).forEach( function( fileName ) {
			var content,
				fullPath = folder + "/" + fileName;
			if ( fs.statSync( fullPath ).isDirectory() ) {
				recurse( fullPath );
				return;
			}
			content = fs.readFileSync( fullPath, {
				encoding: "utf-8"
			} );
			if ( !/@VERSION/.test( content ) ) {
				return;
			}
			matches.push( fullPath );
			fs.writeFileSync( fullPath, content.replace( /@VERSION/g, Release.newVersion ) );
		} );
	}

	[ "ui", "themes" ].forEach( recurse );

	console.log( "Replaced @VERSION in " + matches.length + " files." );

	return matches;
}

function removeExternals ( packager ) {
	Object.keys( packager.builtFiles ).forEach( function( filepath ) {
		if ( /^external\//.test( filepath ) ) {
			delete packager.builtFiles[ filepath ];
		}
	} );
}

function addManifest( packager ) {
	var output = packager.builtFiles;
	output.MANIFEST = Object.keys( output ).sort( function( a, b ) {
		return a.localeCompare( b );
	} ).map( function( filepath ) {
		var md5 = crypto.createHash( "md5" );
		md5.update( output[ filepath ] );
		return filepath + " " + md5.digest( "hex" );
	} ).join( "\n" );
}

function buildCDNPackage( callback ) {
	console.log( "Building CDN package" );
	var JqueryUi = require( "download.jqueryui.com/lib/jquery-ui" );
	var Package = require( "download.jqueryui.com/lib/package-1-12-themes" );
	var Packager = require( "node-packager" );
	var jqueryUi = new JqueryUi( path.resolve( "." ) );
	var target = fs.createWriteStream( "../" + jqueryUi.pkg.name + "-" + jqueryUi.pkg.version +
		"-cdn.zip" );
	var packager = new Packager( jqueryUi.files().cache, Package, {
		components: jqueryUi.components().map( function( component ) {
			return component.name;
		} ),
		jqueryUi: jqueryUi,
		themeVars: null
	} );
	packager.ready.then( function() {
		removeExternals( packager );
		addManifest( packager );
		packager.toZip( target, {
			basedir: ""
		}, function( error ) {
			if ( error ) {
				Release.abort( "Failed to zip CDN package", error );
			}
			callback();
		} );
	} );
}

Release.define( {
	npmPublish: true,
	issueTracker: "trac",
	contributorReportId: 22,
	changelogShell: function() {
		var monthNames = [ "January", "February", "March", "April", "May", "June", "July",
				"August", "September", "October", "November", "December" ],
			now = new Date();
		return "<script>{\n\t\"title\": \"jQuery UI " + Release.newVersion + " Changelog\"\n" +
			"}</script>\n\nReleased on " + monthNames[ now.getMonth() ] + " " + now.getDate() +
			", " + now.getFullYear() + "\n\n";
	},
	generateArtifacts: function( fn ) {
		var files = replaceAtVersion();

		buildCDNPackage( function copyCdnFiles() {
			var zipFile = shell.ls( "../jquery*-cdn.zip" )[ 0 ],
				tmpFolder = "../tmp-zip-output",
				unzipCommand = "unzip -o " + zipFile + " -d " + tmpFolder;

			console.log( "Unzipping for dist/cdn copies" );
			shell.mkdir( "-p", tmpFolder );
			Release.exec( {
				command: unzipCommand,
				silent: true
			}, "Failed to unzip cdn files" );

			shell.mkdir( "-p", "dist/cdn" );
			shell.cp( tmpFolder + "/jquery-ui*.js", "dist/cdn" );
			shell.cp( "-r", tmpFolder + "/themes", "dist/cdn" );
			fn( files );
		} );
	}
} );

};

module.exports.dependencies = [
	"download.jqueryui.com@2.1.2",
	"node-packager@0.0.6",
	"shelljs@0.2.6"
];

/**
 * es6-weakmap - A WeakMap polyfill written in TypeScript, unit tested using Jasmine and Karma.
 *
 * @author Brenden Palmer
 * @version v0.0.1
 * @license MIT
 */
!function(){"use strict";var e;!function(e){var t=function(){function e(){}return Object.defineProperty(e,"WEAKMAP_KEY_IDENTIFIER",{get:function(){return"WEAKMAP_KEY_IDENTIFIER_spF91dwX14_OZAbzyeCu3"},enumerable:!0,configurable:!0}),Object.defineProperty(e,"WEAKMAP_SET_THROWABLE_MESSAGE",{get:function(){return"Invalid value used as weak map key"},enumerable:!0,configurable:!0}),e}();e.WeakMapConstants=t}(e||(e={}));var e;!function(e){var t=function(){function e(){if(null!==e.instance)throw"Get the instance of the WeakMapSequencer using the getInstance method.";this.identifier=0}return e.getInstance=function(){return null===e.instance&&(e.instance=new e),e.instance},e.prototype.next=function(){return this.identifier++},e.instance=null,e}();e.WeakMapSequencer=t}(e||(e={}));var e;!function(e){var t=function(){function t(){}return t.defineProperty=function(n){var r;if(t.isValidObject(n)===!1)throw new TypeError(e.WeakMapConstants.WEAKMAP_SET_THROWABLE_MESSAGE);if("undefined"==typeof n[e.WeakMapConstants.WEAKMAP_KEY_IDENTIFIER]){r=e.WeakMapSequencer.getInstance().next();try{Object.defineProperty(n,e.WeakMapConstants.WEAKMAP_KEY_IDENTIFIER,{enumerable:!1,configurable:!1,get:function(){return r}})}catch(a){throw new TypeError(e.WeakMapConstants.WEAKMAP_SET_THROWABLE_MESSAGE)}}else r=n[e.WeakMapConstants.WEAKMAP_KEY_IDENTIFIER];return r},t.getProperty=function(n){return t.isValidObject(n)===!0?n[e.WeakMapConstants.WEAKMAP_KEY_IDENTIFIER]:void 0},t.isValidObject=function(e){return e===Object(e)},t}();e.WeakMapUtils=t}(e||(e={}));var e;!function(e){var t=function(){function t(e){void 0===e&&(e=[]),this.map={};for(var t=0;t<e.length;t++){var n=e[t];n&&n.length>=2&&this.set(n[0],n[1])}}return t.prototype.get=function(t){if(this.has(t)===!0){var n=String(e.WeakMapUtils.getProperty(t));return this.map[n]}},t.prototype.has=function(t){var n=String(e.WeakMapUtils.getProperty(t));return void 0!==n&&"undefined"!=typeof this.map[n]},t.prototype["delete"]=function(t){if(this.has(t)===!0){var n=String(e.WeakMapUtils.getProperty(t));return delete this.map[n],!0}return!1},t.prototype.set=function(t,n){var r=String(e.WeakMapUtils.defineProperty(t));this.map[r]=n},t}();e.WeakMap=t}(e||(e={}));var e;!function(e){window.WeakMap||(window.WeakMap=e.WeakMap)}(e||(e={}))}();
/*! hyperform.js.org */
var hyperform=function(){"use strict";function e(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=t.bubbles,r=void 0===n||n,i=t.cancelable,a=void 0!==i&&i,o=document.createEvent("Event");return o.initEvent(e,r,a),o}function t(t,n){var r=arguments.length>2&&void 0!==arguments[2]?arguments[2]:{},i=r.bubbles,a=void 0===i||i,o=r.cancelable,l=void 0!==o&&o,s=arguments.length>3&&void 0!==arguments[3]?arguments[3]:{};n instanceof window.Event||(n=e(n,{bubbles:a,cancelable:l}));for(var u in s)s.hasOwnProperty(u)&&(n[u]=s[u]);return t.dispatchEvent(n),n}function n(e,t){return ye.call(e,t)}function r(e){return["object","function"].indexOf(typeof e)>-1&&(delete e.__hyperform,Object.defineProperty(e,"__hyperform",{configurable:!0,enumerable:!1,value:!0})),e}function i(){return(arguments.length>0&&void 0!==arguments[0]?arguments[0]:"hf_")+Me+++Math.random().toString(36).substr(2)}function a(e){return e.form?Array.prototype.filter.call(e.form.elements,function(t){return"radio"===t.type&&t.name===e.name}):[e]}function o(e){var t,n=Array.prototype.slice.call(arguments,1);return e in _e&&(t=_e[e].reduce(function(t){return function(n,r){var i=r.apply({state:n,hook:e},t);return void 0!==i?i:n}}(n),t)),t}function l(e,t){var n=t,r=Array.prototype.slice.call(arguments,1);return e in _e&&(n=_e[e].reduce(function(t,n){r[0]=t;var i=n.apply({state:t,hook:e},r);return void 0!==i?i:t},n)),n}function s(e,t){if(e in _e)for(var n=0;n<_e[e].length;n++)if(_e[e][n]===t){_e[e].splice(n,1);break}}function u(e,t,n){e in _e||(_e[e]=[]),void 0===n&&(n=_e[e].length),_e[e].splice(n,0,t)}function c(e){if(e instanceof window.HTMLTextAreaElement)return"textarea";if(e instanceof window.HTMLSelectElement)return e.hasAttribute("multiple")?"select-multiple":"select-one";if(e instanceof window.HTMLButtonElement)return(e.getAttribute("type")||"submit").toLowerCase();if(e instanceof window.HTMLInputElement){var t=(e.getAttribute("type")||"").toLowerCase();return t&&He.indexOf(t)>-1?t:e.type||"text"}return""}function d(e){for(var t=e.parentNode;t&&1===t.nodeType;){if(t instanceof window.HTMLFieldSetElement&&t.hasAttribute("disabled"))return!0;if("DATALIST"===t.nodeName.toUpperCase())return!0;if(t===e.form)break;t=t.parentNode}return!1}function f(e){var t=l("is_validation_candidate",null,e);if(null!==t)return!!t;if(e instanceof window.HTMLSelectElement||e instanceof window.HTMLTextAreaElement||e instanceof window.HTMLButtonElement||e instanceof window.HTMLInputElement){var n=c(e);if((Ue.indexOf(n)>-1||Fe.indexOf(n)>-1)&&!e.hasAttribute("disabled")&&!e.hasAttribute("readonly")){var r=me(e);if((r&&!r.settings.novalidateOnElements||!e.hasAttribute("novalidate")&&!e.noValidate)&&!d(e))return!0}}return!1}function v(e){switch(arguments.length>1&&void 0!==arguments[1]?arguments[1]:void 0){case"date":return(e.toLocaleDateString||e.toDateString).call(e);case"time":return(e.toLocaleTimeString||e.toTimeString).call(e);case"month":return"toLocaleDateString"in e?e.toLocaleDateString(void 0,{year:"numeric",month:"2-digit"}):e.toDateString();default:return(e.toLocaleString||e.toString).call(e)}}function m(e){for(var t=arguments.length,n=Array(t>1?t-1:0),r=1;r<t;r++)n[r-1]=arguments[r];var i=n.length,a=0;return e.replace(/%([0-9]+\$)?([sl])/g,function(e,t,r){var o=a;t&&(o=Number(t.replace(/\$$/,""))-1),a+=1;var l="";return i>o&&(l=n[o]),(l instanceof Date||"number"==typeof l||l instanceof Number)&&(l="l"===r?(l.toLocaleString||l.toString).call(l):l.toString()),l})}function g(e){e=new Date(+e),e.setUTCHours(0,0,0),e.setUTCDate(e.getUTCDate()+4-(e.getUTCDay()||7));var t=new Date(e.getUTCFullYear(),0,1),n=Math.ceil(((e-t)/864e5+1)/7);return[e.getUTCFullYear(),n]}function h(e){for(var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:2,n=e+"";n.length<t;)n="0"+n;return n}function p(e,t){if(!(e instanceof Date))return null;switch(t){case"datetime":return p(e,"date")+"T"+p(e,"time");case"datetime-local":return m("%s-%s-%sT%s:%s:%s.%s",e.getFullYear(),h(e.getMonth()+1),h(e.getDate()),h(e.getHours()),h(e.getMinutes()),h(e.getSeconds()),h(e.getMilliseconds(),3)).replace(/(:00)?\.000$/,"");case"date":return m("%s-%s-%s",e.getUTCFullYear(),h(e.getUTCMonth()+1),h(e.getUTCDate()));case"month":return m("%s-%s",e.getUTCFullYear(),h(e.getUTCMonth()+1));case"week":var n=g(e);return m.call(null,"%s-W%s",n[0],h(n[1]));case"time":return m("%s:%s:%s.%s",h(e.getUTCHours()),h(e.getUTCMinutes()),h(e.getUTCSeconds()),h(e.getUTCMilliseconds(),3)).replace(/(:00)?\.000$/,"")}return null}function w(e,t){var n=new Date(Date.UTC(t,0,1+7*(e-1)));return n.getUTCDay()<=4?n.setUTCDate(n.getUTCDate()-n.getUTCDay()+1):n.setUTCDate(n.getUTCDate()+8-n.getUTCDay()),n}function b(e,t){var n,r=new Date(0);switch(t){case"datetime":if(!/^([0-9]{4,})-([0-9]{2})-([0-9]{2})T([01][0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9])(?:\.([0-9]{1,3}))?)?$/.test(e))return null;for(n=RegExp.$7||"000";n.length<3;)n+="0";return r.setUTCFullYear(Number(RegExp.$1)),r.setUTCMonth(Number(RegExp.$2)-1,Number(RegExp.$3)),r.setUTCHours(Number(RegExp.$4),Number(RegExp.$5),Number(RegExp.$6||0),Number(n)),r;case"date":return/^([0-9]{4,})-([0-9]{2})-([0-9]{2})$/.test(e)?(r.setUTCFullYear(Number(RegExp.$1)),r.setUTCMonth(Number(RegExp.$2)-1,Number(RegExp.$3)),r):null;case"month":return/^([0-9]{4,})-([0-9]{2})$/.test(e)?(r.setUTCFullYear(Number(RegExp.$1)),r.setUTCMonth(Number(RegExp.$2)-1,1),r):null;case"week":return/^([0-9]{4,})-W(0[1-9]|[1234][0-9]|5[0-3])$/.test(e)?w(Number(RegExp.$2),Number(RegExp.$1)):null;case"time":if(!/^([01][0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9])(?:\.([0-9]{1,3}))?)?$/.test(e))return null;for(n=RegExp.$4||"000";n.length<3;)n+="0";return r.setUTCHours(Number(RegExp.$1),Number(RegExp.$2),Number(RegExp.$3||0),Number(n)),r}return null}function y(e,t){var n=b(e,t);return null!==n?+n:Number(e)}function E(e){Re=e,$e=e.replace(/[-_].*/,"")}function T(e,t){e in Pe||(Pe[e]={});for(var n in t)t.hasOwnProperty(n)&&(Pe[e][n]=t[n])}function M(e){return Re in Pe&&e in Pe[Re]?Pe[Re][e]:$e in Pe&&e in Pe[$e]?Pe[$e][e]:e in Pe.en?Pe.en[e]:e}function L(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1,n=c(e),r=e.getAttribute("min"),i=je[n]||NaN;if(r){var a=y(r,n);isNaN(a)||(i=a)}var o=e.getAttribute("max"),l=Be[n]||NaN;if(o){var s=y(o,n);isNaN(s)||(l=s)}var u=e.getAttribute("step"),d=Ve[n]||1;if(u&&"any"===u.toLowerCase())return[M("any value"),M("any value")];if(u){var f=y(u,n);isNaN(f)||(d=f)}var v=y(e.getAttribute("value"),n),m=y(e.value||e.getAttribute("value"),n);if(isNaN(m))return[M("any valid value"),M("any valid value")];var g=isNaN(i)?isNaN(v)?We[n]||0:v:i,h=Ie[n]||1,w=g+Math.floor((m-g)/(d*h))*(d*h)*t,b=g+(Math.floor((m-g)/(d*h))+1)*(d*h)*t;return w<i?w=null:w>l&&(w=l),b>l?b=null:b<i&&(b=i),xe.indexOf(n)>-1&&(w=p(new Date(w),n),b=p(new Date(b),n)),[w,b]}function A(e){return e.match(/[\0-\uD7FF\uE000-\uFFFF]|[\uD800-\uDBFF][\uDC00-\uDFFF]|[\uD800-\uDBFF](?![\uDC00-\uDFFF])|(?:[^\uD800-\uDBFF]|^)[\uDC00-\uDFFF]/g).length}function N(e){var t=c(e);if(-1===Oe.indexOf(t))return!0;if(!e.value)return!("_original_validity"in e&&!e._original_validity.__hyperform)||!e._original_validity.badInput;var n=!0;switch(t){case"color":n=/^#[a-f0-9]{6}$/.test(e.value);break;case"number":case"range":n=!isNaN(Number(e.value));break;case"datetime":case"date":case"month":case"week":case"time":n=null!==b(e.value,t);break;case"datetime-local":n=/^([0-9]{4,})-(0[1-9]|1[012])-(0[1-9]|[12][0-9]|3[01])T([01][0-9]|2[0-3]):([0-5][0-9])(?::([0-5][0-9])(?:\.([0-9]{1,3}))?)?$/.test(e.value)}return n}function _(e){var t=c(e);if(!e.value||!e.hasAttribute("max"))return!0;var n=void 0,r=void 0;return xe.indexOf(t)>-1?(n=1*b(e.value,t),r=1*(b(e.getAttribute("max"),t)||NaN)):(n=Number(e.value),r=Number(e.getAttribute("max"))),isNaN(r)||n<=r}function x(e){if(!e.value||-1===Se.indexOf(c(e))||!e.hasAttribute("maxlength")||!e.getAttribute("maxlength"))return!0;var t=parseInt(e.getAttribute("maxlength"),10);return!!(isNaN(t)||t<0)||A(e.value)<=t}function D(e){var t=c(e);if(!e.value||!e.hasAttribute("min"))return!0;var n=void 0,r=void 0;return xe.indexOf(t)>-1?(n=1*b(e.value,t),r=1*(b(e.getAttribute("min"),t)||NaN)):(n=Number(e.value),r=Number(e.getAttribute("min"))),isNaN(r)||n>=r}function C(e){if(!e.value||-1===Se.indexOf(c(e))||!e.hasAttribute("minlength")||!e.getAttribute("minlength"))return!0;var t=parseInt(e.getAttribute("minlength"),10);return!!(isNaN(t)||t<0)||A(e.value)>=t}function k(e){return!e.value||!e.hasAttribute("pattern")||new RegExp("^(?:"+e.getAttribute("pattern")+")$").test(e.value)}function O(e){if("radio"===e.type){if(e.hasAttribute("required")&&e.checked)return!0;var t=a(e);return!t.some(function(e){return e.hasAttribute("required")})||t.some(function(e){return e.checked})}return!e.hasAttribute("required")||("checkbox"===e.type?e.checked:!!e.value)}function S(e){var t=c(e);if(!e.value||-1===Ce.indexOf(t)||"any"===(e.getAttribute("step")||"").toLowerCase())return!0;var n=e.getAttribute("step");if((n=n?y(n,t):Ve[t]||1)<=0||isNaN(n))return!0;var r=Ie[t]||1,i=y(e.value,t),a=y(e.getAttribute("min")||e.getAttribute("value")||"",t);isNaN(a)&&(a=We[t]||0),"month"===t&&(a=12*new Date(a).getUTCFullYear()+new Date(a).getUTCMonth(),i=12*new Date(i).getUTCFullYear()+new Date(i).getUTCMonth());var o=Math.abs(a-i)%(n*r);return o<1e-8||o>n*r-1e-8}function F(e){return e.replace(Ge,"")}function H(e){return e.split(",").map(function(e){return F(e)}).filter(function(e){return e})}function U(e){var t=c(e);if("file"!==t&&!e.value||"file"!==t&&-1===ke.indexOf(t))return!0;var n=!0;switch(t){case"url":we||(we=document.createElement("a"));var r=F(e.value);we.href=r,n=we.href===r||we.href===r+"/";break;case"email":n=e.hasAttribute("multiple")?H(e.value).every(function(e){return Je.test(e)}):Je.test(F(e.value));break;case"file":if("files"in e&&e.files.length&&e.hasAttribute("accept")){var i=H(e.getAttribute("accept")).map(function(e){return/^(audio|video|image)\/\*$/.test(e)&&(e=new RegExp("^"+RegExp.$1+"/.+$")),e});if(!i.length)break;e:for(var a=0;a<e.files.length;a++){var o=!1;t:for(var l=0;l<i.length;l++){var s=e.files[a],u=i[l],d=s.type;if("string"==typeof u&&"."===u.substr(0,1)){if(-1===s.name.search("."))continue t;d=s.name.substr(s.name.lastIndexOf("."))}if(0===d.search(u)){o=!0;break t}}if(!o){n=!1;break e}}}}return n}function P(e,t){return function(n){var r=!e(n);return r&&t(n),r}}function R(e,t,n){Te.set(e,qe.get(e,t,n))}function $(e){var t=Ze.get(e),n=t.length,r=!0;if(n)for(var i=0;i<n;i++){var a=t[i](e);if(void 0!==a&&!a){r=!1;break}}if(r){var o=Te.get(e);r=!(o.toString()&&"is_custom"in o)}return!r}function V(e){if(e instanceof window.HTMLFormElement){e.__hf_form_validation=!0;var n=ge(e).map(V).every(function(e){return e});return delete e.__hf_form_validation,n}var r,i=lt(e).valid;if(i){var a=me(e);a&&a.settings.validEvent&&(r=t(e,"valid",{cancelable:!0}))}else r=t(e,"invalid",{cancelable:!0});return r&&r.defaultPrevented||Ne.showWarning(e,!!e.form.__hf_form_validation),i}function I(n){var r,i=e("submit",{cancelable:!0});i.preventDefault(),Object.defineProperty(i,"defaultPrevented",{value:!1,writable:!0}),Object.defineProperty(i,"preventDefault",{value:function(){return i.defaultPrevented=r=!0},writable:!0}),t(n.form,i,{},{submittedVia:n}),r||(W(n),window.HTMLFormElement.prototype.submit.call(n.form),window.setTimeout(function(){return j(n)}))}function W(e){if(["image","submit"].indexOf(e.type)>-1&&e.name){var t=me(e.form)||{},n=t.submit_helper;n?n.parentNode&&n.parentNode.removeChild(n):(n=document.createElement("input"),n.type="hidden",t.submit_helper=n),n.name=e.name,n.value=e.value,e.form.appendChild(n)}}function j(e){if(["image","submit"].indexOf(e.type)>-1&&e.name){var t=me(e.form)||{},n=t.submit_helper;n&&n.parentNode&&n.parentNode.removeChild(n)}}function B(e){if(!t(e.form,"validate",{cancelable:!0}).defaultPrevented){var n,r=!0;e.form.__hf_form_validation=!0,ge(e.form).map(function(e){V(e)||(r=!1,!n&&"focus"in e&&(n=e))}),delete e.form.__hf_form_validation,r?I(e):n&&(n.focus(),t(e.form,"forminvalid"))}}function Y(e){return!("INPUT"!==e.nodeName&&"BUTTON"!==e.nodeName||"image"!==e.type&&"submit"!==e.type)}function q(e,t){return!e.defaultPrevented&&(!("button"in e)||e.button<2)&&Y(t)&&t.form&&!t.form.hasAttribute("novalidate")}function z(e){return!e.defaultPrevented&&(13===e.keyCode&&"INPUT"===e.target.nodeName&&Se.indexOf(e.target.type)>-1||(13===e.keyCode||32===e.keyCode)&&Y(e.target))&&e.target.form&&!e.target.form.hasAttribute("novalidate")}function Z(e){return Y(e)?e:n(e,'button:not([type]) *, button[type="submit"] *')?Z(e.parentNode):null}function G(){var e=arguments.length>0&&void 0!==arguments[0]&&arguments[0];return function(t){var n=Z(t.target);n&&q(t,n)&&(t.preventDefault(),e||n.hasAttribute("formnovalidate")?I(n):B(n))}}function J(e){return function(t){if(z(t)){t.preventDefault();if((me(t.target.form)||{settings:{}}).settings.preventImplicitSubmit)return;for(var n,r=t.target.form.elements.length,i=0;i<r;i++)if(["image","submit"].indexOf(t.target.form.elements[i].type)>-1){n=t.target.form.elements[i];break}n?n.click():e?I(t.target):B(t.target)}}}function K(e){arguments.length>1&&void 0!==arguments[1]&&arguments[1]?(e.addEventListener("click",dt),e.addEventListener("keypress",vt)):(e.addEventListener("click",ct),e.addEventListener("keypress",ft))}function Q(e){e.removeEventListener("click",dt),e.removeEventListener("keypress",vt),e.removeEventListener("click",ct),e.removeEventListener("keypress",ft)}function X(e,t){try{delete e[t]}catch(r){var n=me(e);return n&&n.settings.debug&&console.log("[hyperform] cannot uninstall custom property "+t),!1}var r=Object.getOwnPropertyDescriptor(e,"_original_"+t);r&&Object.defineProperty(e,t,r)}function ee(e,t,n){n.configurable=!0,n.enumerable=!0,"value"in n&&(n.writable=!0);var r=Object.getOwnPropertyDescriptor(e,t);if(r){if(!1===r.configurable){var i=me(e);return i&&i.settings.debug&&console.log("[hyperform] cannot install custom property "+t),!1}if(r.get&&r.get.__hyperform||r.value&&r.value.__hyperform)return;Object.defineProperty(e,"_original_"+t,r)}return delete e[t],Object.defineProperty(e,t,n),!0}function te(e){return e instanceof window.HTMLButtonElement||e instanceof window.HTMLInputElement||e instanceof window.HTMLSelectElement||e instanceof window.HTMLTextAreaElement||e instanceof window.HTMLFieldSetElement||e===window.HTMLButtonElement.prototype||e===window.HTMLInputElement.prototype||e===window.HTMLSelectElement.prototype||e===window.HTMLTextAreaElement.prototype||e===window.HTMLFieldSetElement.prototype}function ne(e,t){Te.set(e,t,!0)}function re(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:void 0,n=c(e);if(xe.indexOf(n)>-1){if(void 0!==t){if(null===t)e.value="";else{if(!(t instanceof Date))throw new window.DOMException("valueAsDate setter encountered invalid value","TypeError");isNaN(t.getTime())?e.value="":e.value=p(t,n)}return}var r=b(e.value,n);return r instanceof Date?r:null}if(void 0!==t)throw new window.DOMException("valueAsDate setter cannot set date on this element","InvalidStateError");return null}function ie(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:void 0,n=c(e);if(Ce.indexOf(n)>-1){if("range"===n&&e.hasAttribute("multiple"))return NaN;if(void 0!==t){if(isNaN(t))e.value="";else{if("number"!=typeof t||!window.isFinite(t))throw new window.DOMException("valueAsNumber setter encountered invalid value","TypeError");try{re(e,new Date(t))}catch(n){if(!(n instanceof window.DOMException))throw n;e.value=t.toString()}}return}return y(e.value,n)}if(void 0!==t)throw new window.DOMException("valueAsNumber setter cannot set number on this element","InvalidStateError");return NaN}function ae(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1;if(-1===Ce.indexOf(c(e)))throw new window.DOMException("stepDown encountered invalid type","InvalidStateError");if("any"===(e.getAttribute("step")||"").toLowerCase())throw new window.DOMException('stepDown encountered step "any"',"InvalidStateError");var n=L(e,t)[0];null!==n&&ie(e,n)}function oe(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:1;if(-1===Ce.indexOf(c(e)))throw new window.DOMException("stepUp encountered invalid type","InvalidStateError");if("any"===(e.getAttribute("step")||"").toLowerCase())throw new window.DOMException('stepUp encountered step "any"',"InvalidStateError");var n=L(e,t)[1];null!==n&&ie(e,n)}function le(e){var t=Te.get(e);return t?t.toString():""}function se(e){return f(e)}function ue(e){for(var t=["accept","max","min","pattern","placeholder","step"],n=0;n<t.length;n++){var r=t[n];ee(e,r,{get:mt(r),set:gt(r)})}for(var i=["multiple","required","readOnly"],a=0;a<i.length;a++){var o=i[a];ee(e,o,{get:ht(o.toLowerCase()),set:pt(o.toLowerCase())})}for(var l=["minLength","maxLength"],s=0;s<l.length;s++){var u=l[s];ee(e,u,{get:wt(u.toLowerCase()),set:bt(u.toLowerCase())})}}function ce(e){for(var t=["accept","max","min","pattern","placeholder","step","multiple","required","readOnly","minLength","maxLength"],n=0;n<t.length;n++){X(e,t[n])}}function de(e){if(te(e)){for(var t in yt)ee(e,t,yt[t]);ue(e)}else(e instanceof window.HTMLFormElement||e===window.HTMLFormElement.prototype)&&(ee(e,"checkValidity",yt.checkValidity),ee(e,"reportValidity",yt.reportValidity))}function fe(e){te(e)?(X(e,"checkValidity"),X(e,"reportValidity"),X(e,"setCustomValidity"),X(e,"stepDown"),X(e,"stepUp"),X(e,"validationMessage"),X(e,"validity"),X(e,"valueAsDate"),X(e,"valueAsNumber"),X(e,"willValidate"),ce(e)):e instanceof window.HTMLFormElement&&(X(e,"checkValidity"),X(e,"reportValidity"))}function ve(e,t){var n=Et.get(e);if(n)return n.settings=t,n;this.form=e,this.settings=t,this.revalidator=this.revalidate.bind(this),Et.set(e,this),K(e,"never"===t.revalidate),e===window||9===e.nodeType?(this.install([window.HTMLButtonElement.prototype,window.HTMLInputElement.prototype,window.HTMLSelectElement.prototype,window.HTMLTextAreaElement.prototype,window.HTMLFieldSetElement.prototype]),de(window.HTMLFormElement)):(e instanceof window.HTMLFormElement||e instanceof window.HTMLFieldSetElement)&&(this.install(e.elements),e instanceof window.HTMLFormElement&&de(e)),"oninput"!==t.revalidate&&"hybrid"!==t.revalidate||(e.addEventListener("keyup",this.revalidator),e.addEventListener("change",this.revalidator)),"onblur"!==t.revalidate&&"hybrid"!==t.revalidate||e.addEventListener("blur",this.revalidator,!0)}function me(e){var t;for(e.form&&(t=Et.get(e.form));!t&&e;)t=Et.get(e),e=e.parentNode;return t||(t=Et.get(window)),t}function ge(e){var t=me(e);return Array.prototype.filter.call(e.elements,function(e){return!!(e.getAttribute("name")||t&&t.settings.validateNameless)})}function he(e){console.log(m('Please use camelCase method names! The name "%s" is deprecated and will be removed in the next non-patch release.',e))}function pe(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:{},n=t.classes,r=t.debug,i=void 0!==r&&r,a=t.extend_fieldset,o=t.extendFieldset,l=t.novalidate_on_elements,s=t.novalidateOnElements,u=t.prevent_implicit_submit,c=t.preventImplicitSubmit,d=t.revalidate,f=t.strict,v=void 0!==f&&f,m=t.valid_event,g=t.validEvent,h=t.validateNameless,p=void 0!==h&&h;n||(n={}),void 0===o&&(void 0===a?o=!v:(he("extend_fieldset"),o=a)),void 0===s&&(void 0===l?s=!v:(he("novalidate_on_elements"),s=l)),void 0===c&&(void 0===u?c=!1:(he("prevent_implicit_submit"),c=u)),void 0===d&&(d=v?"onsubmit":"hybrid"),void 0===g&&(void 0===m?g=!v:(he("valid_event"),g=m));var w={debug:i,strict:v,preventImplicitSubmit:c,revalidate:d,validEvent:g,extendFieldset:o,classes:n,novalidateOnElements:s,validateNameless:p};return e instanceof window.NodeList||e instanceof window.HTMLCollection||e instanceof Array?Array.prototype.map.call(e,function(e){return pe(e,w)}):new ve(e,w)}(function(){var e=document.createEvent("Event");return e.initEvent("foo",!0,!0),e.preventDefault(),e.defaultPrevented})()||function(){var e=window.Event.prototype.preventDefault;window.Event.prototype.preventDefault=function(){this.cancelable&&(e.call(this),Object.defineProperty(this,"defaultPrevented",{get:function(){return!0},configurable:!0}))}}();var we,be=window.Element.prototype,ye=be.matches||be.matchesSelector||be.msMatchesSelector||be.webkitMatchesSelector,Ee=new WeakMap,Te={set:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]&&arguments[2];if(e instanceof window.HTMLFieldSetElement){var i=me(e);if(i&&!i.settings.extendFieldset)return Te}return"string"==typeof t&&(t=new String(t)),n&&(t.is_custom=!0),r(t),Ee.set(e,t),"_original_setCustomValidity"in e&&e._original_setCustomValidity(t.toString()),Te},get:function(e){var t=Ee.get(e);return void 0===t&&"_original_validationMessage"in e&&(t=new String(e._original_validationMessage)),t||new String("")},delete:function(e){return"_original_setCustomValidity"in e&&e._original_setCustomValidity(""),Ee.delete(e)}},Me=0,Le=new WeakMap,Ae={attachWarning:function(e,t){t.parentNode.insertBefore(e,t.nextSibling)},detachWarning:function(e,t){e.parentNode&&e.parentNode.removeChild(e)},showWarning:function(e){if(!(arguments.length>1&&void 0!==arguments[1]&&arguments[1])||"radio"!==e.type||a(e)[0]===e){var t=Te.get(e).toString(),n=Le.get(e);if(t){if(!n){var r=me(e);n=document.createElement("div"),n.className=r&&r.settings.classes.warning||"hf-warning",n.id=i(),n.setAttribute("aria-live","polite"),Le.set(e,n)}e.setAttribute("aria-errormessage",n.id),e.hasAttribute("aria-describedby")||e.setAttribute("aria-describedby",n.id),n.textContent=t,Ne.attachWarning(n,e)}else n&&n.parentNode&&(e.getAttribute("aria-describedby")===n.id&&e.removeAttribute("aria-describedby"),e.removeAttribute("aria-errormessage"),Ne.detachWarning(n,e))}}},Ne={attachWarning:Ae.attachWarning,detachWarning:Ae.detachWarning,showWarning:Ae.showWarning,set:function(e,t){e.indexOf("_")>-1&&(console.log("Renderer.set: please use camelCase names. "+e+" will be removed in the next non-patch release."),e=e.replace(/_([a-z])/g,function(e){return e[1].toUpperCase()})),t||(t=Ae[e]),Ne[e]=t}},_e=Object.create(null),xe=["datetime","date","month","week","time"],De=["number","range"],Ce=xe.concat(De,"datetime-local"),ke=["email","url"],Oe=["email","date","month","week","time","datetime","datetime-local","number","range","color"],Se=["text","search","tel","password"].concat(ke),Fe=["checkbox","color","file","image","radio","submit"].concat(Ce,Se),He=["button","hidden","reset"].concat(Fe),Ue=["select-one","select-multiple","textarea"],Pe={en:{TextTooLong:"Please shorten this text to %l characters or less (you are currently using %l characters).",ValueMissing:"Please fill out this field.",CheckboxMissing:"Please check this box if you want to proceed.",RadioMissing:"Please select one of these options.",FileMissing:"Please select a file.",SelectMissing:"Please select an item in the list.",InvalidEmail:"Please enter an email address.",InvalidURL:"Please enter a URL.",PatternMismatch:"Please match the requested format.",PatternMismatchWithTitle:"Please match the requested format: %l.",NumberRangeOverflow:"Please select a value that is no more than %l.",DateRangeOverflow:"Please select a value that is no later than %l.",TimeRangeOverflow:"Please select a value that is no later than %l.",NumberRangeUnderflow:"Please select a value that is no less than %l.",DateRangeUnderflow:"Please select a value that is no earlier than %l.",TimeRangeUnderflow:"Please select a value that is no earlier than %l.",StepMismatch:"Please select a valid value. The two nearest valid values are %l and %l.",StepMismatchOneValue:"Please select a valid value. The nearest valid value is %l.",BadInputNumber:"Please enter a number."}},Re="en",$e="en",Ve={"datetime-local":60,datetime:60,time:60},Ie={"datetime-local":1e3,datetime:1e3,date:864e5,week:6048e5,time:1e3},We={week:-2592e5},je={range:0},Be={range:100},Ye=new WeakMap,qe={set:function(e,t,n){var r=Ye.get(e)||{};return r[t]=n,Ye.set(e,r),qe},get:function(e,t){var n=arguments.length>2&&void 0!==arguments[2]?arguments[2]:void 0,r=Ye.get(e);if(void 0===r||!(t in r)){var i="data-"+t.replace(/[A-Z]/g,"-$&").toLowerCase();return e.hasAttribute(i)?e.getAttribute(i):n}return r[t]},delete:function(e){var t=arguments.length>1&&void 0!==arguments[1]?arguments[1]:null;if(!t)return Ye.delete(e);var n=Ye.get(e)||{};return t in n&&(delete n[t],Ye.set(e,n),!0)}},ze=new WeakMap,Ze={set:function(e,t){var n=ze.get(e)||[];return n.push(t),ze.set(e,n),Ze},get:function(e){return ze.get(e)||[]},delete:function(e){return ze.delete(e)}},Ge=/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g,Je=/^[a-zA-Z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/,Ke=P(N,function(e){return R(e,"badInput",M("Please match the requested type."))}),Qe=P(k,function(e){R(e,"patternMismatch",e.title?m(M("PatternMismatchWithTitle"),e.title):M("PatternMismatch"))}),Xe=P(_,function(e){var t=c(e),n=me(e),r=n&&n.settings.classes.outOfRange||"hf-out-of-range",i=n&&n.settings.classes.inRange||"hf-in-range",a=void 0;switch(t){case"date":case"datetime":case"datetime-local":a=m(M("DateRangeOverflow"),v(b(e.getAttribute("max"),t),t));break;case"time":a=m(M("TimeRangeOverflow"),v(b(e.getAttribute("max"),t),t));break;default:a=m(M("NumberRangeOverflow"),y(e.getAttribute("max"),t))}R(e,"rangeOverflow",a),e.classList.add(r),e.classList.remove(i)}),et=P(D,function(e){var t=c(e),n=me(e),r=n&&n.settings.classes.outOfRange||"hf-out-of-range",i=n&&n.settings.classes.inRange||"hf-in-range",a=void 0;switch(t){case"date":case"datetime":case"datetime-local":a=m(M("DateRangeUnderflow"),v(b(e.getAttribute("min"),t),t));break;case"time":a=m(M("TimeRangeUnderflow"),v(b(e.getAttribute("min"),t),t));break;default:a=m(M("NumberRangeUnderflow"),y(e.getAttribute("min"),t))}R(e,"rangeUnderflow",a),e.classList.add(r),e.classList.remove(i)}),tt=P(S,function(e){var t=L(e),n=t[0],r=t[1],i=!1,a=void 0;null===n?i=r:null===r&&(i=n),a=!1!==i?m(M("StepMismatchOneValue"),i):m(M("StepMismatch"),n,r),R(e,"stepMismatch",a)}),nt=P(x,function(e){R(e,"tooLong",m(M("TextTooLong"),e.getAttribute("maxlength"),A(e.value)))}),rt=P(C,function(e){R(e,"tooShort",m(M("Please lengthen this text to %l characters or more (you are currently using %l characters)."),e.getAttribute("minlength"),A(e.value)))}),it=P(U,function(e){var t=M("Please use the appropriate format."),n=c(e);"email"===n?t=M(e.hasAttribute("multiple")?"Please enter a comma separated list of email addresses.":"InvalidEmail"):"url"===n?t=M("InvalidURL"):"file"===n&&(t=M("Please select a file of the correct type.")),R(e,"typeMismatch",t)}),at=P(O,function(e){var t=M("ValueMissing"),n=c(e);"checkbox"===n?t=M("CheckboxMissing"):"radio"===n?t=M("RadioMissing"):"file"===n?t=M(e.hasAttribute("multiple")?"Please select one or more files.":"FileMissing"):e instanceof window.HTMLSelectElement&&(t=M("SelectMissing")),R(e,"valueMissing",t)}),ot={badInput:Ke,customError:$,patternMismatch:Qe,rangeOverflow:Xe,rangeUnderflow:et,stepMismatch:tt,tooLong:nt,tooShort:rt,typeMismatch:it,valueMissing:at},lt=function e(t){if(!(t instanceof window.HTMLElement))throw new Error("cannot create a ValidityState for a non-element");var n=e.cache.get(t);return n||(this instanceof e?(this.element=t,void e.cache.set(t,this)):new e(t))},st={};lt.prototype=st,lt.cache=new WeakMap;for(var ut in ot)Object.defineProperty(st,ut,{configurable:!0,enumerable:!0,get:function(e){return function(){return!f(this.element)||e(this.element)}}(ot[ut]),set:void 0});Object.defineProperty(st,"valid",{configurable:!0,enumerable:!0,get:function(){if(!f(this.element))return!0;var e=me(this.element),t=e&&e.settings.classes.valid||"hf-valid",n=e&&e.settings.classes.invalid||"hf-invalid",r=e&&e.settings.classes.userInvalid||"hf-user-invalid",i=e&&e.settings.classes.userValid||"hf-user-valid",a=e&&e.settings.classes.inRange||"hf-in-range",o=e&&e.settings.classes.outOfRange||"hf-out-of-range",l=e&&e.settings.classes.validated||"hf-validated";this.element.classList.add(l);for(var s in ot)if(ot[s](this.element))return this.element.classList.add(n),this.element.classList.remove(t),this.element.classList.remove(i),this.element.value!==this.element.defaultValue?this.element.classList.add(r):this.element.classList.remove(r),this.element.setAttribute("aria-invalid","true"),!1;return Te.delete(this.element),this.element.classList.remove(n),this.element.classList.remove(r),this.element.classList.remove(o),this.element.classList.add(t),this.element.classList.add(a),this.element.value!==this.element.defaultValue?this.element.classList.add(i):this.element.classList.remove(i),this.element.setAttribute("aria-invalid","false"),!0},set:void 0}),r(st);var ct=G(),dt=G(!0),ft=J(),vt=J(!0),mt=function(e){return function(){return l("attr_get_"+e,this.getAttribute(e),this)}},gt=function(e){return function(t){this.setAttribute(e,l("attr_set_"+e,t,this))}},ht=function(e){return function(){return l("attr_get_"+e,this.hasAttribute(e),this)}},pt=function(e){return function(t){l("attr_set_"+e,t,this)?this.setAttribute(e,e):this.removeAttribute(e)}},wt=function(e){return function(){return l("attr_get_"+e,Math.max(0,Number(this.getAttribute(e))),this)}},bt=function(e){return function(t){t=l("attr_set_"+e,t,this),/^[0-9]+$/.test(t)&&this.setAttribute(e,t)}},yt={checkValidity:{value:r(function(){return Tt(this)})},reportValidity:{value:r(function(){return V(this)})},setCustomValidity:{value:r(function(e){return ne(this,e)})},stepDown:{value:r(function(){return ae(this,arguments.length>0&&void 0!==arguments[0]?arguments[0]:1)})},stepUp:{value:r(function(){return oe(this,arguments.length>0&&void 0!==arguments[0]?arguments[0]:1)})},validationMessage:{get:r(function(){return le(this)})},validity:{get:r(function(){return lt(this)})},valueAsDate:{get:r(function(){return re(this)}),set:r(function(e){re(this,e)})},valueAsNumber:{get:r(function(){return ie(this)}),set:r(function(e){ie(this,e)})},willValidate:{get:r(function(){return se(this)})}},Et=new WeakMap;ve.prototype={destroy:function(){Q(this.form),Et.delete(this.form),this.form.removeEventListener("keyup",this.revalidator),this.form.removeEventListener("change",this.revalidator),this.form.removeEventListener("blur",this.revalidator,!0),this.form===window||9===this.form.nodeType?(this.uninstall([window.HTMLButtonElement.prototype,window.HTMLInputElement.prototype,window.HTMLSelectElement.prototype,window.HTMLTextAreaElement.prototype,window.HTMLFieldSetElement.prototype]),fe(window.HTMLFormElement)):(this.form instanceof window.HTMLFormElement||this.form instanceof window.HTMLFieldSetElement)&&(this.uninstall(this.form.elements),this.form instanceof window.HTMLFormElement&&fe(this.form))},revalidate:function(e){(e.target instanceof window.HTMLButtonElement||e.target instanceof window.HTMLTextAreaElement||e.target instanceof window.HTMLSelectElement||e.target instanceof window.HTMLInputElement)&&("hybrid"===this.settings.revalidate?"blur"===e.type&&e.target.value!==e.target.defaultValue||lt(e.target).valid?V(e.target):("keyup"===e.type&&9!==e.keyCode||"change"===e.type)&&lt(e.target).valid&&V(e.target):"keyup"===e.type&&9===e.keyCode||V(e.target))},install:function(e){e instanceof window.Element&&(e=[e]);for(var t=e.length,n=0;n<t;n++)de(e[n])},uninstall:function(e){e instanceof window.Element&&(e=[e]);for(var t=e.length,n=0;n<t;n++)fe(e[n])}};var Tt=function(e,t){return function(){var n=o(e,Array.prototype.slice.call(arguments));return void 0!==n?n:t.apply(this,arguments)}}("checkValidity",function(e){if(e instanceof window.HTMLFormElement)return ge(e).map(Tt).every(function(e){return e});var n=lt(e).valid;if(n){var r=me(e);r&&r.settings.validEvent&&t(e,"valid")}else t(e,"invalid",{cancelable:!0});return n});return pe.version="0.9.16",pe.checkValidity=Tt,pe.reportValidity=V,pe.setCustomValidity=ne,pe.stepDown=ae,pe.stepUp=oe,pe.validationMessage=le,pe.ValidityState=lt,pe.valueAsDate=re,pe.valueAsNumber=ie,pe.willValidate=se,pe.setLanguage=function(e){return E(e),pe},
pe.addTranslation=function(e,t){return T(e,t),pe},pe.setRenderer=function(e,t){return Ne.set(e,t),pe},pe.addValidator=function(e,t){return Ze.set(e,t),pe},pe.setMessage=function(e,t,n){return qe.set(e,t,n),pe},pe.addHook=function(e,t,n){return u(e,t,n),pe},pe.removeHook=function(e,t){return s(e,t),pe},pe.set_language=function(e){return he("set_language"),E(e),pe},pe.add_translation=function(e,t){return he("add_translation"),T(e,t),pe},pe.set_renderer=function(e,t){return he("set_renderer"),Ne.set(e,t),pe},pe.add_validator=function(e,t){return he("add_validator"),Ze.set(e,t),pe},pe.set_message=function(e,t,n){return he("set_message"),qe.set(e,t,n),pe},pe.add_hook=function(e,t,n){return he("add_hook"),u(e,t,n),pe},pe.remove_hook=function(e,t){return he("remove_hook"),s(e,t),pe},document.currentScript&&document.currentScript.hasAttribute("data-hf-autoload")&&pe(window),pe}();

/*!
 * Flickity PACKAGED v2.1.2
 * Touch, responsive, flickable carousels
 *
 * Licensed GPLv3 for open source use
 * or Flickity Commercial License for commercial use
 *
 * https://flickity.metafizzy.co
 * Copyright 2015-2018 Metafizzy
 */

!function(t,e){"function"==typeof define&&define.amd?define("jquery-bridget/jquery-bridget",["jquery"],function(i){return e(t,i)}):"object"==typeof module&&module.exports?module.exports=e(t,require("jquery")):t.jQueryBridget=e(t,t.jQuery)}(window,function(t,e){"use strict";function i(i,o,a){function l(t,e,n){var s,o="$()."+i+'("'+e+'")';return t.each(function(t,l){var h=a.data(l,i);if(!h)return void r(i+" not initialized. Cannot call methods, i.e. "+o);var c=h[e];if(!c||"_"==e.charAt(0))return void r(o+" is not a valid method");var d=c.apply(h,n);s=void 0===s?d:s}),void 0!==s?s:t}function h(t,e){t.each(function(t,n){var s=a.data(n,i);s?(s.option(e),s._init()):(s=new o(n,e),a.data(n,i,s))})}a=a||e||t.jQuery,a&&(o.prototype.option||(o.prototype.option=function(t){a.isPlainObject(t)&&(this.options=a.extend(!0,this.options,t))}),a.fn[i]=function(t){if("string"==typeof t){var e=s.call(arguments,1);return l(this,t,e)}return h(this,t),this},n(a))}function n(t){!t||t&&t.bridget||(t.bridget=i)}var s=Array.prototype.slice,o=t.console,r="undefined"==typeof o?function(){}:function(t){o.error(t)};return n(e||t.jQuery),i}),function(t,e){"function"==typeof define&&define.amd?define("ev-emitter/ev-emitter",e):"object"==typeof module&&module.exports?module.exports=e():t.EvEmitter=e()}("undefined"!=typeof window?window:this,function(){function t(){}var e=t.prototype;return e.on=function(t,e){if(t&&e){var i=this._events=this._events||{},n=i[t]=i[t]||[];return n.indexOf(e)==-1&&n.push(e),this}},e.once=function(t,e){if(t&&e){this.on(t,e);var i=this._onceEvents=this._onceEvents||{},n=i[t]=i[t]||{};return n[e]=!0,this}},e.off=function(t,e){var i=this._events&&this._events[t];if(i&&i.length){var n=i.indexOf(e);return n!=-1&&i.splice(n,1),this}},e.emitEvent=function(t,e){var i=this._events&&this._events[t];if(i&&i.length){i=i.slice(0),e=e||[];for(var n=this._onceEvents&&this._onceEvents[t],s=0;s<i.length;s++){var o=i[s],r=n&&n[o];r&&(this.off(t,o),delete n[o]),o.apply(this,e)}return this}},e.allOff=function(){delete this._events,delete this._onceEvents},t}),function(t,e){"function"==typeof define&&define.amd?define("get-size/get-size",e):"object"==typeof module&&module.exports?module.exports=e():t.getSize=e()}(window,function(){"use strict";function t(t){var e=parseFloat(t),i=t.indexOf("%")==-1&&!isNaN(e);return i&&e}function e(){}function i(){for(var t={width:0,height:0,innerWidth:0,innerHeight:0,outerWidth:0,outerHeight:0},e=0;e<h;e++){var i=l[e];t[i]=0}return t}function n(t){var e=getComputedStyle(t);return e||a("Style returned "+e+". Are you running this code in a hidden iframe on Firefox? See https://bit.ly/getsizebug1"),e}function s(){if(!c){c=!0;var e=document.createElement("div");e.style.width="200px",e.style.padding="1px 2px 3px 4px",e.style.borderStyle="solid",e.style.borderWidth="1px 2px 3px 4px",e.style.boxSizing="border-box";var i=document.body||document.documentElement;i.appendChild(e);var s=n(e);r=200==Math.round(t(s.width)),o.isBoxSizeOuter=r,i.removeChild(e)}}function o(e){if(s(),"string"==typeof e&&(e=document.querySelector(e)),e&&"object"==typeof e&&e.nodeType){var o=n(e);if("none"==o.display)return i();var a={};a.width=e.offsetWidth,a.height=e.offsetHeight;for(var c=a.isBorderBox="border-box"==o.boxSizing,d=0;d<h;d++){var u=l[d],f=o[u],p=parseFloat(f);a[u]=isNaN(p)?0:p}var g=a.paddingLeft+a.paddingRight,v=a.paddingTop+a.paddingBottom,m=a.marginLeft+a.marginRight,y=a.marginTop+a.marginBottom,b=a.borderLeftWidth+a.borderRightWidth,E=a.borderTopWidth+a.borderBottomWidth,S=c&&r,C=t(o.width);C!==!1&&(a.width=C+(S?0:g+b));var x=t(o.height);return x!==!1&&(a.height=x+(S?0:v+E)),a.innerWidth=a.width-(g+b),a.innerHeight=a.height-(v+E),a.outerWidth=a.width+m,a.outerHeight=a.height+y,a}}var r,a="undefined"==typeof console?e:function(t){console.error(t)},l=["paddingLeft","paddingRight","paddingTop","paddingBottom","marginLeft","marginRight","marginTop","marginBottom","borderLeftWidth","borderRightWidth","borderTopWidth","borderBottomWidth"],h=l.length,c=!1;return o}),function(t,e){"use strict";"function"==typeof define&&define.amd?define("desandro-matches-selector/matches-selector",e):"object"==typeof module&&module.exports?module.exports=e():t.matchesSelector=e()}(window,function(){"use strict";var t=function(){var t=window.Element.prototype;if(t.matches)return"matches";if(t.matchesSelector)return"matchesSelector";for(var e=["webkit","moz","ms","o"],i=0;i<e.length;i++){var n=e[i],s=n+"MatchesSelector";if(t[s])return s}}();return function(e,i){return e[t](i)}}),function(t,e){"function"==typeof define&&define.amd?define("fizzy-ui-utils/utils",["desandro-matches-selector/matches-selector"],function(i){return e(t,i)}):"object"==typeof module&&module.exports?module.exports=e(t,require("desandro-matches-selector")):t.fizzyUIUtils=e(t,t.matchesSelector)}(window,function(t,e){var i={};i.extend=function(t,e){for(var i in e)t[i]=e[i];return t},i.modulo=function(t,e){return(t%e+e)%e};var n=Array.prototype.slice;i.makeArray=function(t){if(Array.isArray(t))return t;if(null===t||void 0===t)return[];var e="object"==typeof t&&"number"==typeof t.length;return e?n.call(t):[t]},i.removeFrom=function(t,e){var i=t.indexOf(e);i!=-1&&t.splice(i,1)},i.getParent=function(t,i){for(;t.parentNode&&t!=document.body;)if(t=t.parentNode,e(t,i))return t},i.getQueryElement=function(t){return"string"==typeof t?document.querySelector(t):t},i.handleEvent=function(t){var e="on"+t.type;this[e]&&this[e](t)},i.filterFindElements=function(t,n){t=i.makeArray(t);var s=[];return t.forEach(function(t){if(t instanceof HTMLElement){if(!n)return void s.push(t);e(t,n)&&s.push(t);for(var i=t.querySelectorAll(n),o=0;o<i.length;o++)s.push(i[o])}}),s},i.debounceMethod=function(t,e,i){i=i||100;var n=t.prototype[e],s=e+"Timeout";t.prototype[e]=function(){var t=this[s];clearTimeout(t);var e=arguments,o=this;this[s]=setTimeout(function(){n.apply(o,e),delete o[s]},i)}},i.docReady=function(t){var e=document.readyState;"complete"==e||"interactive"==e?setTimeout(t):document.addEventListener("DOMContentLoaded",t)},i.toDashed=function(t){return t.replace(/(.)([A-Z])/g,function(t,e,i){return e+"-"+i}).toLowerCase()};var s=t.console;return i.htmlInit=function(e,n){i.docReady(function(){var o=i.toDashed(n),r="data-"+o,a=document.querySelectorAll("["+r+"]"),l=document.querySelectorAll(".js-"+o),h=i.makeArray(a).concat(i.makeArray(l)),c=r+"-options",d=t.jQuery;h.forEach(function(t){var i,o=t.getAttribute(r)||t.getAttribute(c);try{i=o&&JSON.parse(o)}catch(a){return void(s&&s.error("Error parsing "+r+" on "+t.className+": "+a))}var l=new e(t,i);d&&d.data(t,n,l)})})},i}),function(t,e){"function"==typeof define&&define.amd?define("flickity/js/cell",["get-size/get-size"],function(i){return e(t,i)}):"object"==typeof module&&module.exports?module.exports=e(t,require("get-size")):(t.Flickity=t.Flickity||{},t.Flickity.Cell=e(t,t.getSize))}(window,function(t,e){function i(t,e){this.element=t,this.parent=e,this.create()}var n=i.prototype;return n.create=function(){this.element.style.position="absolute",this.element.setAttribute("aria-selected","false"),this.x=0,this.shift=0},n.destroy=function(){this.element.style.position="";var t=this.parent.originSide;this.element.removeAttribute("aria-selected"),this.element.style[t]=""},n.getSize=function(){this.size=e(this.element)},n.setPosition=function(t){this.x=t,this.updateTarget(),this.renderPosition(t)},n.updateTarget=n.setDefaultTarget=function(){var t="left"==this.parent.originSide?"marginLeft":"marginRight";this.target=this.x+this.size[t]+this.size.width*this.parent.cellAlign},n.renderPosition=function(t){var e=this.parent.originSide;this.element.style[e]=this.parent.getPositionValue(t)},n.wrapShift=function(t){this.shift=t,this.renderPosition(this.x+this.parent.slideableWidth*t)},n.remove=function(){this.element.parentNode.removeChild(this.element)},i}),function(t,e){"function"==typeof define&&define.amd?define("flickity/js/slide",e):"object"==typeof module&&module.exports?module.exports=e():(t.Flickity=t.Flickity||{},t.Flickity.Slide=e())}(window,function(){"use strict";function t(t){this.parent=t,this.isOriginLeft="left"==t.originSide,this.cells=[],this.outerWidth=0,this.height=0}var e=t.prototype;return e.addCell=function(t){if(this.cells.push(t),this.outerWidth+=t.size.outerWidth,this.height=Math.max(t.size.outerHeight,this.height),1==this.cells.length){this.x=t.x;var e=this.isOriginLeft?"marginLeft":"marginRight";this.firstMargin=t.size[e]}},e.updateTarget=function(){var t=this.isOriginLeft?"marginRight":"marginLeft",e=this.getLastCell(),i=e?e.size[t]:0,n=this.outerWidth-(this.firstMargin+i);this.target=this.x+this.firstMargin+n*this.parent.cellAlign},e.getLastCell=function(){return this.cells[this.cells.length-1]},e.select=function(){this.changeSelected(!0)},e.unselect=function(){this.changeSelected(!1)},e.changeSelected=function(t){var e=t?"add":"remove";this.cells.forEach(function(i){i.element.classList[e]("is-selected"),i.element.setAttribute("aria-selected",t.toString())})},e.getCellElements=function(){return this.cells.map(function(t){return t.element})},t}),function(t,e){"function"==typeof define&&define.amd?define("flickity/js/animate",["fizzy-ui-utils/utils"],function(i){return e(t,i)}):"object"==typeof module&&module.exports?module.exports=e(t,require("fizzy-ui-utils")):(t.Flickity=t.Flickity||{},t.Flickity.animatePrototype=e(t,t.fizzyUIUtils))}(window,function(t,e){var i={};return i.startAnimation=function(){this.isAnimating||(this.isAnimating=!0,this.restingFrames=0,this.animate())},i.animate=function(){this.applyDragForce(),this.applySelectedAttraction();var t=this.x;if(this.integratePhysics(),this.positionSlider(),this.settle(t),this.isAnimating){var e=this;requestAnimationFrame(function(){e.animate()})}},i.positionSlider=function(){var t=this.x;this.options.wrapAround&&this.cells.length>1&&(t=e.modulo(t,this.slideableWidth),t-=this.slideableWidth,this.shiftWrapCells(t)),t+=this.cursorPosition,t=this.options.rightToLeft?-t:t;var i=this.getPositionValue(t);this.slider.style.transform=this.isAnimating?"translate3d("+i+",0,0)":"translateX("+i+")";var n=this.slides[0];if(n){var s=-this.x-n.target,o=s/this.slidesWidth;this.dispatchEvent("scroll",null,[o,s])}},i.positionSliderAtSelected=function(){this.cells.length&&(this.x=-this.selectedSlide.target,this.velocity=0,this.positionSlider())},i.getPositionValue=function(t){return this.options.percentPosition?.01*Math.round(t/this.size.innerWidth*1e4)+"%":Math.round(t)+"px"},i.settle=function(t){this.isPointerDown||Math.round(100*this.x)!=Math.round(100*t)||this.restingFrames++,this.restingFrames>2&&(this.isAnimating=!1,delete this.isFreeScrolling,this.positionSlider(),this.dispatchEvent("settle",null,[this.selectedIndex]))},i.shiftWrapCells=function(t){var e=this.cursorPosition+t;this._shiftCells(this.beforeShiftCells,e,-1);var i=this.size.innerWidth-(t+this.slideableWidth+this.cursorPosition);this._shiftCells(this.afterShiftCells,i,1)},i._shiftCells=function(t,e,i){for(var n=0;n<t.length;n++){var s=t[n],o=e>0?i:0;s.wrapShift(o),e-=s.size.outerWidth}},i._unshiftCells=function(t){if(t&&t.length)for(var e=0;e<t.length;e++)t[e].wrapShift(0)},i.integratePhysics=function(){this.x+=this.velocity,this.velocity*=this.getFrictionFactor()},i.applyForce=function(t){this.velocity+=t},i.getFrictionFactor=function(){return 1-this.options[this.isFreeScrolling?"freeScrollFriction":"friction"]},i.getRestingPosition=function(){return this.x+this.velocity/(1-this.getFrictionFactor())},i.applyDragForce=function(){if(this.isDraggable&&this.isPointerDown){var t=this.dragX-this.x,e=t-this.velocity;this.applyForce(e)}},i.applySelectedAttraction=function(){var t=this.isDraggable&&this.isPointerDown;if(!t&&!this.isFreeScrolling&&this.slides.length){var e=this.selectedSlide.target*-1-this.x,i=e*this.options.selectedAttraction;this.applyForce(i)}},i}),function(t,e){if("function"==typeof define&&define.amd)define("flickity/js/flickity",["ev-emitter/ev-emitter","get-size/get-size","fizzy-ui-utils/utils","./cell","./slide","./animate"],function(i,n,s,o,r,a){return e(t,i,n,s,o,r,a)});else if("object"==typeof module&&module.exports)module.exports=e(t,require("ev-emitter"),require("get-size"),require("fizzy-ui-utils"),require("./cell"),require("./slide"),require("./animate"));else{var i=t.Flickity;t.Flickity=e(t,t.EvEmitter,t.getSize,t.fizzyUIUtils,i.Cell,i.Slide,i.animatePrototype)}}(window,function(t,e,i,n,s,o,r){function a(t,e){for(t=n.makeArray(t);t.length;)e.appendChild(t.shift())}function l(t,e){var i=n.getQueryElement(t);if(!i)return void(d&&d.error("Bad element for Flickity: "+(i||t)));if(this.element=i,this.element.flickityGUID){var s=f[this.element.flickityGUID];return s.option(e),s}h&&(this.$element=h(this.element)),this.options=n.extend({},this.constructor.defaults),this.option(e),this._create()}var h=t.jQuery,c=t.getComputedStyle,d=t.console,u=0,f={};l.defaults={accessibility:!0,cellAlign:"center",freeScrollFriction:.075,friction:.28,namespaceJQueryEvents:!0,percentPosition:!0,resize:!0,selectedAttraction:.025,setGallerySize:!0},l.createMethods=[];var p=l.prototype;n.extend(p,e.prototype),p._create=function(){var e=this.guid=++u;this.element.flickityGUID=e,f[e]=this,this.selectedIndex=0,this.restingFrames=0,this.x=0,this.velocity=0,this.originSide=this.options.rightToLeft?"right":"left",this.viewport=document.createElement("div"),this.viewport.className="flickity-viewport",this._createSlider(),(this.options.resize||this.options.watchCSS)&&t.addEventListener("resize",this);for(var i in this.options.on){var n=this.options.on[i];this.on(i,n)}l.createMethods.forEach(function(t){this[t]()},this),this.options.watchCSS?this.watchCSS():this.activate()},p.option=function(t){n.extend(this.options,t)},p.activate=function(){if(!this.isActive){this.isActive=!0,this.element.classList.add("flickity-enabled"),this.options.rightToLeft&&this.element.classList.add("flickity-rtl"),this.getSize();var t=this._filterFindCellElements(this.element.children);a(t,this.slider),this.viewport.appendChild(this.slider),this.element.appendChild(this.viewport),this.reloadCells(),this.options.accessibility&&(this.element.tabIndex=0,this.element.addEventListener("keydown",this)),this.emitEvent("activate");var e,i=this.options.initialIndex;e=this.isInitActivated?this.selectedIndex:void 0!==i&&this.cells[i]?i:0,this.select(e,!1,!0),this.isInitActivated=!0,this.dispatchEvent("ready")}},p._createSlider=function(){var t=document.createElement("div");t.className="flickity-slider",t.style[this.originSide]=0,this.slider=t},p._filterFindCellElements=function(t){return n.filterFindElements(t,this.options.cellSelector)},p.reloadCells=function(){this.cells=this._makeCells(this.slider.children),this.positionCells(),this._getWrapShiftCells(),this.setGallerySize()},p._makeCells=function(t){var e=this._filterFindCellElements(t),i=e.map(function(t){return new s(t,this)},this);return i},p.getLastCell=function(){return this.cells[this.cells.length-1]},p.getLastSlide=function(){return this.slides[this.slides.length-1]},p.positionCells=function(){this._sizeCells(this.cells),this._positionCells(0)},p._positionCells=function(t){t=t||0,this.maxCellHeight=t?this.maxCellHeight||0:0;var e=0;if(t>0){var i=this.cells[t-1];e=i.x+i.size.outerWidth}for(var n=this.cells.length,s=t;s<n;s++){var o=this.cells[s];o.setPosition(e),e+=o.size.outerWidth,this.maxCellHeight=Math.max(o.size.outerHeight,this.maxCellHeight)}this.slideableWidth=e,this.updateSlides(),this._containSlides(),this.slidesWidth=n?this.getLastSlide().target-this.slides[0].target:0},p._sizeCells=function(t){t.forEach(function(t){t.getSize()})},p.updateSlides=function(){if(this.slides=[],this.cells.length){var t=new o(this);this.slides.push(t);var e="left"==this.originSide,i=e?"marginRight":"marginLeft",n=this._getCanCellFit();this.cells.forEach(function(e,s){if(!t.cells.length)return void t.addCell(e);var r=t.outerWidth-t.firstMargin+(e.size.outerWidth-e.size[i]);n.call(this,s,r)?t.addCell(e):(t.updateTarget(),t=new o(this),this.slides.push(t),t.addCell(e))},this),t.updateTarget(),this.updateSelectedSlide()}},p._getCanCellFit=function(){var t=this.options.groupCells;if(!t)return function(){return!1};if("number"==typeof t){var e=parseInt(t,10);return function(t){return t%e!==0}}var i="string"==typeof t&&t.match(/^(\d+)%$/),n=i?parseInt(i[1],10)/100:1;return function(t,e){return e<=(this.size.innerWidth+1)*n}},p._init=p.reposition=function(){this.positionCells(),this.positionSliderAtSelected()},p.getSize=function(){this.size=i(this.element),this.setCellAlign(),this.cursorPosition=this.size.innerWidth*this.cellAlign};var g={center:{left:.5,right:.5},left:{left:0,right:1},right:{right:0,left:1}};return p.setCellAlign=function(){var t=g[this.options.cellAlign];this.cellAlign=t?t[this.originSide]:this.options.cellAlign},p.setGallerySize=function(){if(this.options.setGallerySize){var t=this.options.adaptiveHeight&&this.selectedSlide?this.selectedSlide.height:this.maxCellHeight;this.viewport.style.height=t+"px"}},p._getWrapShiftCells=function(){if(this.options.wrapAround){this._unshiftCells(this.beforeShiftCells),this._unshiftCells(this.afterShiftCells);var t=this.cursorPosition,e=this.cells.length-1;this.beforeShiftCells=this._getGapCells(t,e,-1),t=this.size.innerWidth-this.cursorPosition,this.afterShiftCells=this._getGapCells(t,0,1)}},p._getGapCells=function(t,e,i){for(var n=[];t>0;){var s=this.cells[e];if(!s)break;n.push(s),e+=i,t-=s.size.outerWidth}return n},p._containSlides=function(){if(this.options.contain&&!this.options.wrapAround&&this.cells.length){var t=this.options.rightToLeft,e=t?"marginRight":"marginLeft",i=t?"marginLeft":"marginRight",n=this.slideableWidth-this.getLastCell().size[i],s=n<this.size.innerWidth,o=this.cursorPosition+this.cells[0].size[e],r=n-this.size.innerWidth*(1-this.cellAlign);this.slides.forEach(function(t){s?t.target=n*this.cellAlign:(t.target=Math.max(t.target,o),t.target=Math.min(t.target,r))},this)}},p.dispatchEvent=function(t,e,i){var n=e?[e].concat(i):i;if(this.emitEvent(t,n),h&&this.$element){t+=this.options.namespaceJQueryEvents?".flickity":"";var s=t;if(e){var o=h.Event(e);o.type=t,s=o}this.$element.trigger(s,i)}},p.select=function(t,e,i){if(this.isActive&&(t=parseInt(t,10),this._wrapSelect(t),(this.options.wrapAround||e)&&(t=n.modulo(t,this.slides.length)),this.slides[t])){var s=this.selectedIndex;this.selectedIndex=t,this.updateSelectedSlide(),i?this.positionSliderAtSelected():this.startAnimation(),this.options.adaptiveHeight&&this.setGallerySize(),this.dispatchEvent("select",null,[t]),t!=s&&this.dispatchEvent("change",null,[t]),this.dispatchEvent("cellSelect")}},p._wrapSelect=function(t){var e=this.slides.length,i=this.options.wrapAround&&e>1;if(!i)return t;var s=n.modulo(t,e),o=Math.abs(s-this.selectedIndex),r=Math.abs(s+e-this.selectedIndex),a=Math.abs(s-e-this.selectedIndex);!this.isDragSelect&&r<o?t+=e:!this.isDragSelect&&a<o&&(t-=e),t<0?this.x-=this.slideableWidth:t>=e&&(this.x+=this.slideableWidth)},p.previous=function(t,e){this.select(this.selectedIndex-1,t,e)},p.next=function(t,e){this.select(this.selectedIndex+1,t,e)},p.updateSelectedSlide=function(){var t=this.slides[this.selectedIndex];t&&(this.unselectSelectedSlide(),this.selectedSlide=t,t.select(),this.selectedCells=t.cells,this.selectedElements=t.getCellElements(),this.selectedCell=t.cells[0],this.selectedElement=this.selectedElements[0])},p.unselectSelectedSlide=function(){this.selectedSlide&&this.selectedSlide.unselect()},p.selectCell=function(t,e,i){var n=this.queryCell(t);if(n){var s=this.getCellSlideIndex(n);this.select(s,e,i)}},p.getCellSlideIndex=function(t){for(var e=0;e<this.slides.length;e++){var i=this.slides[e],n=i.cells.indexOf(t);if(n!=-1)return e}},p.getCell=function(t){for(var e=0;e<this.cells.length;e++){var i=this.cells[e];if(i.element==t)return i}},p.getCells=function(t){t=n.makeArray(t);var e=[];return t.forEach(function(t){var i=this.getCell(t);i&&e.push(i)},this),e},p.getCellElements=function(){return this.cells.map(function(t){return t.element})},p.getParentCell=function(t){var e=this.getCell(t);return e?e:(t=n.getParent(t,".flickity-slider > *"),this.getCell(t))},p.getAdjacentCellElements=function(t,e){if(!t)return this.selectedSlide.getCellElements();e=void 0===e?this.selectedIndex:e;var i=this.slides.length;if(1+2*t>=i)return this.getCellElements();for(var s=[],o=e-t;o<=e+t;o++){var r=this.options.wrapAround?n.modulo(o,i):o,a=this.slides[r];a&&(s=s.concat(a.getCellElements()))}return s},p.queryCell=function(t){return"number"==typeof t?this.cells[t]:("string"==typeof t&&(t=this.element.querySelector(t)),this.getCell(t))},p.uiChange=function(){this.emitEvent("uiChange")},p.childUIPointerDown=function(t){this.emitEvent("childUIPointerDown",[t])},p.onresize=function(){this.watchCSS(),this.resize()},n.debounceMethod(l,"onresize",150),p.resize=function(){if(this.isActive){this.getSize(),this.options.wrapAround&&(this.x=n.modulo(this.x,this.slideableWidth)),this.positionCells(),this._getWrapShiftCells(),this.setGallerySize(),this.emitEvent("resize");var t=this.selectedElements&&this.selectedElements[0];this.selectCell(t,!1,!0)}},p.watchCSS=function(){var t=this.options.watchCSS;if(t){var e=c(this.element,":after").content;e.indexOf("flickity")!=-1?this.activate():this.deactivate()}},p.onkeydown=function(t){var e=document.activeElement&&document.activeElement!=this.element;if(this.options.accessibility&&!e){var i=l.keyboardHandlers[t.keyCode];i&&i.call(this)}},l.keyboardHandlers={37:function(){var t=this.options.rightToLeft?"next":"previous";this.uiChange(),this[t]()},39:function(){var t=this.options.rightToLeft?"previous":"next";this.uiChange(),this[t]()}},p.focus=function(){var e=t.pageYOffset;this.element.focus({preventScroll:!0}),t.pageYOffset!=e&&t.scrollTo(t.pageXOffset,e)},p.deactivate=function(){this.isActive&&(this.element.classList.remove("flickity-enabled"),this.element.classList.remove("flickity-rtl"),this.unselectSelectedSlide(),this.cells.forEach(function(t){t.destroy()}),this.element.removeChild(this.viewport),a(this.slider.children,this.element),this.options.accessibility&&(this.element.removeAttribute("tabIndex"),this.element.removeEventListener("keydown",this)),this.isActive=!1,this.emitEvent("deactivate"))},p.destroy=function(){this.deactivate(),t.removeEventListener("resize",this),this.emitEvent("destroy"),h&&this.$element&&h.removeData(this.element,"flickity"),delete this.element.flickityGUID,delete f[this.guid]},n.extend(p,r),l.data=function(t){t=n.getQueryElement(t);var e=t&&t.flickityGUID;return e&&f[e]},n.htmlInit(l,"flickity"),h&&h.bridget&&h.bridget("flickity",l),l.setJQuery=function(t){h=t},l.Cell=s,l}),function(t,e){"function"==typeof define&&define.amd?define("unipointer/unipointer",["ev-emitter/ev-emitter"],function(i){return e(t,i)}):"object"==typeof module&&module.exports?module.exports=e(t,require("ev-emitter")):t.Unipointer=e(t,t.EvEmitter)}(window,function(t,e){function i(){}function n(){}var s=n.prototype=Object.create(e.prototype);s.bindStartEvent=function(t){this._bindStartEvent(t,!0)},s.unbindStartEvent=function(t){this._bindStartEvent(t,!1)},s._bindStartEvent=function(e,i){i=void 0===i||i;var n=i?"addEventListener":"removeEventListener",s="mousedown";t.PointerEvent?s="pointerdown":"ontouchstart"in t&&(s="touchstart"),e[n](s,this)},s.handleEvent=function(t){var e="on"+t.type;this[e]&&this[e](t)},s.getTouch=function(t){for(var e=0;e<t.length;e++){var i=t[e];if(i.identifier==this.pointerIdentifier)return i}},s.onmousedown=function(t){var e=t.button;e&&0!==e&&1!==e||this._pointerDown(t,t)},s.ontouchstart=function(t){this._pointerDown(t,t.changedTouches[0])},s.onpointerdown=function(t){this._pointerDown(t,t)},s._pointerDown=function(t,e){t.button||this.isPointerDown||(this.isPointerDown=!0,this.pointerIdentifier=void 0!==e.pointerId?e.pointerId:e.identifier,this.pointerDown(t,e))},s.pointerDown=function(t,e){this._bindPostStartEvents(t),this.emitEvent("pointerDown",[t,e])};var o={mousedown:["mousemove","mouseup"],touchstart:["touchmove","touchend","touchcancel"],pointerdown:["pointermove","pointerup","pointercancel"]};return s._bindPostStartEvents=function(e){if(e){var i=o[e.type];i.forEach(function(e){t.addEventListener(e,this)},this),this._boundPointerEvents=i}},s._unbindPostStartEvents=function(){this._boundPointerEvents&&(this._boundPointerEvents.forEach(function(e){t.removeEventListener(e,this)},this),delete this._boundPointerEvents)},s.onmousemove=function(t){this._pointerMove(t,t)},s.onpointermove=function(t){t.pointerId==this.pointerIdentifier&&this._pointerMove(t,t)},s.ontouchmove=function(t){var e=this.getTouch(t.changedTouches);e&&this._pointerMove(t,e)},s._pointerMove=function(t,e){this.pointerMove(t,e)},s.pointerMove=function(t,e){this.emitEvent("pointerMove",[t,e])},s.onmouseup=function(t){this._pointerUp(t,t)},s.onpointerup=function(t){t.pointerId==this.pointerIdentifier&&this._pointerUp(t,t)},s.ontouchend=function(t){var e=this.getTouch(t.changedTouches);e&&this._pointerUp(t,e)},s._pointerUp=function(t,e){this._pointerDone(),this.pointerUp(t,e)},s.pointerUp=function(t,e){this.emitEvent("pointerUp",[t,e])},s._pointerDone=function(){this._pointerReset(),this._unbindPostStartEvents(),this.pointerDone()},s._pointerReset=function(){this.isPointerDown=!1,delete this.pointerIdentifier},s.pointerDone=i,s.onpointercancel=function(t){t.pointerId==this.pointerIdentifier&&this._pointerCancel(t,t)},s.ontouchcancel=function(t){var e=this.getTouch(t.changedTouches);e&&this._pointerCancel(t,e)},s._pointerCancel=function(t,e){this._pointerDone(),this.pointerCancel(t,e)},s.pointerCancel=function(t,e){this.emitEvent("pointerCancel",[t,e])},n.getPointerPoint=function(t){return{x:t.pageX,y:t.pageY}},n}),function(t,e){"function"==typeof define&&define.amd?define("unidragger/unidragger",["unipointer/unipointer"],function(i){return e(t,i)}):"object"==typeof module&&module.exports?module.exports=e(t,require("unipointer")):t.Unidragger=e(t,t.Unipointer)}(window,function(t,e){function i(){}var n=i.prototype=Object.create(e.prototype);n.bindHandles=function(){this._bindHandles(!0)},n.unbindHandles=function(){this._bindHandles(!1)},n._bindHandles=function(e){e=void 0===e||e;for(var i=e?"addEventListener":"removeEventListener",n=e?this._touchActionValue:"",s=0;s<this.handles.length;s++){var o=this.handles[s];this._bindStartEvent(o,e),o[i]("click",this),t.PointerEvent&&(o.style.touchAction=n)}},n._touchActionValue="none",n.pointerDown=function(t,e){var i=this.okayPointerDown(t);i&&(this.pointerDownPointer=e,t.preventDefault(),this.pointerDownBlur(),this._bindPostStartEvents(t),this.emitEvent("pointerDown",[t,e]))};var s={TEXTAREA:!0,INPUT:!0,SELECT:!0,OPTION:!0},o={radio:!0,checkbox:!0,button:!0,submit:!0,image:!0,file:!0};return n.okayPointerDown=function(t){var e=s[t.target.nodeName],i=o[t.target.type],n=!e||i;return n||this._pointerReset(),n},n.pointerDownBlur=function(){var t=document.activeElement,e=t&&t.blur&&t!=document.body;e&&t.blur()},n.pointerMove=function(t,e){var i=this._dragPointerMove(t,e);this.emitEvent("pointerMove",[t,e,i]),this._dragMove(t,e,i)},n._dragPointerMove=function(t,e){var i={x:e.pageX-this.pointerDownPointer.pageX,y:e.pageY-this.pointerDownPointer.pageY};return!this.isDragging&&this.hasDragStarted(i)&&this._dragStart(t,e),i},n.hasDragStarted=function(t){return Math.abs(t.x)>3||Math.abs(t.y)>3},n.pointerUp=function(t,e){this.emitEvent("pointerUp",[t,e]),this._dragPointerUp(t,e)},n._dragPointerUp=function(t,e){this.isDragging?this._dragEnd(t,e):this._staticClick(t,e)},n._dragStart=function(t,e){this.isDragging=!0,this.isPreventingClicks=!0,this.dragStart(t,e)},n.dragStart=function(t,e){this.emitEvent("dragStart",[t,e])},n._dragMove=function(t,e,i){this.isDragging&&this.dragMove(t,e,i)},n.dragMove=function(t,e,i){t.preventDefault(),this.emitEvent("dragMove",[t,e,i])},n._dragEnd=function(t,e){this.isDragging=!1,setTimeout(function(){delete this.isPreventingClicks}.bind(this)),this.dragEnd(t,e)},n.dragEnd=function(t,e){this.emitEvent("dragEnd",[t,e])},n.onclick=function(t){this.isPreventingClicks&&t.preventDefault()},n._staticClick=function(t,e){this.isIgnoringMouseUp&&"mouseup"==t.type||(this.staticClick(t,e),"mouseup"!=t.type&&(this.isIgnoringMouseUp=!0,setTimeout(function(){delete this.isIgnoringMouseUp}.bind(this),400)))},n.staticClick=function(t,e){this.emitEvent("staticClick",[t,e])},i.getPointerPoint=e.getPointerPoint,i}),function(t,e){"function"==typeof define&&define.amd?define("flickity/js/drag",["./flickity","unidragger/unidragger","fizzy-ui-utils/utils"],function(i,n,s){return e(t,i,n,s)}):"object"==typeof module&&module.exports?module.exports=e(t,require("./flickity"),require("unidragger"),require("fizzy-ui-utils")):t.Flickity=e(t,t.Flickity,t.Unidragger,t.fizzyUIUtils)}(window,function(t,e,i,n){function s(){return{x:t.pageXOffset,y:t.pageYOffset}}n.extend(e.defaults,{draggable:">1",dragThreshold:3}),e.createMethods.push("_createDrag");var o=e.prototype;n.extend(o,i.prototype),o._touchActionValue="pan-y";var r="createTouch"in document,a=!1;o._createDrag=function(){this.on("activate",this.onActivateDrag),this.on("uiChange",this._uiChangeDrag),this.on("childUIPointerDown",this._childUIPointerDownDrag),this.on("deactivate",this.onDeactivateDrag),this.on("cellChange",this.updateDraggable),r&&!a&&(t.addEventListener("touchmove",function(){}),a=!0)},o.onActivateDrag=function(){this.handles=[this.viewport],this.bindHandles(),this.updateDraggable()},o.onDeactivateDrag=function(){this.unbindHandles(),this.element.classList.remove("is-draggable")},o.updateDraggable=function(){">1"==this.options.draggable?this.isDraggable=this.slides.length>1:this.isDraggable=this.options.draggable,this.isDraggable?this.element.classList.add("is-draggable"):this.element.classList.remove("is-draggable")},o.bindDrag=function(){this.options.draggable=!0,this.updateDraggable()},o.unbindDrag=function(){this.options.draggable=!1,this.updateDraggable()},o._uiChangeDrag=function(){delete this.isFreeScrolling},o._childUIPointerDownDrag=function(t){t.preventDefault(),this.pointerDownFocus(t)},o.pointerDown=function(e,i){if(!this.isDraggable)return void this._pointerDownDefault(e,i);var n=this.okayPointerDown(e);n&&(this._pointerDownPreventDefault(e),this.pointerDownFocus(e),document.activeElement!=this.element&&this.pointerDownBlur(),this.dragX=this.x,this.viewport.classList.add("is-pointer-down"),this.pointerDownScroll=s(),t.addEventListener("scroll",this),this._pointerDownDefault(e,i))},o._pointerDownDefault=function(t,e){this.pointerDownPointer=e,this._bindPostStartEvents(t),this.dispatchEvent("pointerDown",t,[e])};var l={INPUT:!0,TEXTAREA:!0,SELECT:!0};return o.pointerDownFocus=function(t){var e=l[t.target.nodeName];e||this.focus()},o._pointerDownPreventDefault=function(t){var e="touchstart"==t.type,i="touch"==t.pointerType,n=l[t.target.nodeName];e||i||n||t.preventDefault()},o.hasDragStarted=function(t){return Math.abs(t.x)>this.options.dragThreshold},o.pointerUp=function(t,e){delete this.isTouchScrolling,this.viewport.classList.remove("is-pointer-down"),this.dispatchEvent("pointerUp",t,[e]),this._dragPointerUp(t,e)},o.pointerDone=function(){t.removeEventListener("scroll",this),delete this.pointerDownScroll},o.dragStart=function(e,i){this.isDraggable&&(this.dragStartPosition=this.x,this.startAnimation(),t.removeEventListener("scroll",this),this.dispatchEvent("dragStart",e,[i]))},o.pointerMove=function(t,e){var i=this._dragPointerMove(t,e);this.dispatchEvent("pointerMove",t,[e,i]),this._dragMove(t,e,i)},o.dragMove=function(t,e,i){if(this.isDraggable){t.preventDefault(),this.previousDragX=this.dragX;var n=this.options.rightToLeft?-1:1;this.options.wrapAround&&(i.x=i.x%this.slideableWidth);var s=this.dragStartPosition+i.x*n;if(!this.options.wrapAround&&this.slides.length){var o=Math.max(-this.slides[0].target,this.dragStartPosition);s=s>o?.5*(s+o):s;var r=Math.min(-this.getLastSlide().target,this.dragStartPosition);s=s<r?.5*(s+r):s}this.dragX=s,this.dragMoveTime=new Date,
this.dispatchEvent("dragMove",t,[e,i])}},o.dragEnd=function(t,e){if(this.isDraggable){this.options.freeScroll&&(this.isFreeScrolling=!0);var i=this.dragEndRestingSelect();if(this.options.freeScroll&&!this.options.wrapAround){var n=this.getRestingPosition();this.isFreeScrolling=-n>this.slides[0].target&&-n<this.getLastSlide().target}else this.options.freeScroll||i!=this.selectedIndex||(i+=this.dragEndBoostSelect());delete this.previousDragX,this.isDragSelect=this.options.wrapAround,this.select(i),delete this.isDragSelect,this.dispatchEvent("dragEnd",t,[e])}},o.dragEndRestingSelect=function(){var t=this.getRestingPosition(),e=Math.abs(this.getSlideDistance(-t,this.selectedIndex)),i=this._getClosestResting(t,e,1),n=this._getClosestResting(t,e,-1),s=i.distance<n.distance?i.index:n.index;return s},o._getClosestResting=function(t,e,i){for(var n=this.selectedIndex,s=1/0,o=this.options.contain&&!this.options.wrapAround?function(t,e){return t<=e}:function(t,e){return t<e};o(e,s)&&(n+=i,s=e,e=this.getSlideDistance(-t,n),null!==e);)e=Math.abs(e);return{distance:s,index:n-i}},o.getSlideDistance=function(t,e){var i=this.slides.length,s=this.options.wrapAround&&i>1,o=s?n.modulo(e,i):e,r=this.slides[o];if(!r)return null;var a=s?this.slideableWidth*Math.floor(e/i):0;return t-(r.target+a)},o.dragEndBoostSelect=function(){if(void 0===this.previousDragX||!this.dragMoveTime||new Date-this.dragMoveTime>100)return 0;var t=this.getSlideDistance(-this.dragX,this.selectedIndex),e=this.previousDragX-this.dragX;return t>0&&e>0?1:t<0&&e<0?-1:0},o.staticClick=function(t,e){var i=this.getParentCell(t.target),n=i&&i.element,s=i&&this.cells.indexOf(i);this.dispatchEvent("staticClick",t,[e,n,s])},o.onscroll=function(){var t=s(),e=this.pointerDownScroll.x-t.x,i=this.pointerDownScroll.y-t.y;(Math.abs(e)>3||Math.abs(i)>3)&&this._pointerDone()},e}),function(t,e){"function"==typeof define&&define.amd?define("tap-listener/tap-listener",["unipointer/unipointer"],function(i){return e(t,i)}):"object"==typeof module&&module.exports?module.exports=e(t,require("unipointer")):t.TapListener=e(t,t.Unipointer)}(window,function(t,e){function i(t){this.bindTap(t)}var n=i.prototype=Object.create(e.prototype);return n.bindTap=function(t){t&&(this.unbindTap(),this.tapElement=t,this._bindStartEvent(t,!0))},n.unbindTap=function(){this.tapElement&&(this._bindStartEvent(this.tapElement,!0),delete this.tapElement)},n.pointerUp=function(i,n){if(!this.isIgnoringMouseUp||"mouseup"!=i.type){var s=e.getPointerPoint(n),o=this.tapElement.getBoundingClientRect(),r=t.pageXOffset,a=t.pageYOffset,l=s.x>=o.left+r&&s.x<=o.right+r&&s.y>=o.top+a&&s.y<=o.bottom+a;if(l&&this.emitEvent("tap",[i,n]),"mouseup"!=i.type){this.isIgnoringMouseUp=!0;var h=this;setTimeout(function(){delete h.isIgnoringMouseUp},400)}}},n.destroy=function(){this.pointerDone(),this.unbindTap()},i}),function(t,e){"function"==typeof define&&define.amd?define("flickity/js/prev-next-button",["./flickity","tap-listener/tap-listener","fizzy-ui-utils/utils"],function(i,n,s){return e(t,i,n,s)}):"object"==typeof module&&module.exports?module.exports=e(t,require("./flickity"),require("tap-listener"),require("fizzy-ui-utils")):e(t,t.Flickity,t.TapListener,t.fizzyUIUtils)}(window,function(t,e,i,n){"use strict";function s(t,e){this.direction=t,this.parent=e,this._create()}function o(t){return"string"==typeof t?t:"M "+t.x0+",50 L "+t.x1+","+(t.y1+50)+" L "+t.x2+","+(t.y2+50)+" L "+t.x3+",50  L "+t.x2+","+(50-t.y2)+" L "+t.x1+","+(50-t.y1)+" Z"}var r="http://www.w3.org/2000/svg";s.prototype=Object.create(i.prototype),s.prototype._create=function(){this.isEnabled=!0,this.isPrevious=this.direction==-1;var t=this.parent.options.rightToLeft?1:-1;this.isLeft=this.direction==t;var e=this.element=document.createElement("button");e.className="flickity-button flickity-prev-next-button",e.className+=this.isPrevious?" previous":" next",e.setAttribute("type","button"),this.disable(),e.setAttribute("aria-label",this.isPrevious?"Previous":"Next");var i=this.createSVG();e.appendChild(i),this.on("tap",this.onTap),this.parent.on("select",this.update.bind(this)),this.on("pointerDown",this.parent.childUIPointerDown.bind(this.parent))},s.prototype.activate=function(){this.bindTap(this.element),this.element.addEventListener("click",this),this.parent.element.appendChild(this.element)},s.prototype.deactivate=function(){this.parent.element.removeChild(this.element),i.prototype.destroy.call(this),this.element.removeEventListener("click",this)},s.prototype.createSVG=function(){var t=document.createElementNS(r,"svg");t.setAttribute("class","flickity-button-icon"),t.setAttribute("viewBox","0 0 100 100");var e=document.createElementNS(r,"path"),i=o(this.parent.options.arrowShape);return e.setAttribute("d",i),e.setAttribute("class","arrow"),this.isLeft||e.setAttribute("transform","translate(100, 100) rotate(180) "),t.appendChild(e),t},s.prototype.onTap=function(){if(this.isEnabled){this.parent.uiChange();var t=this.isPrevious?"previous":"next";this.parent[t]()}},s.prototype.handleEvent=n.handleEvent,s.prototype.onclick=function(t){var e=document.activeElement;e&&e==this.element&&this.onTap(t,t)},s.prototype.enable=function(){this.isEnabled||(this.element.disabled=!1,this.isEnabled=!0)},s.prototype.disable=function(){this.isEnabled&&(this.element.disabled=!0,this.isEnabled=!1)},s.prototype.update=function(){var t=this.parent.slides;if(this.parent.options.wrapAround&&t.length>1)return void this.enable();var e=t.length?t.length-1:0,i=this.isPrevious?0:e,n=this.parent.selectedIndex==i?"disable":"enable";this[n]()},s.prototype.destroy=function(){this.deactivate()},n.extend(e.defaults,{prevNextButtons:!0,arrowShape:{x0:10,x1:60,y1:50,x2:70,y2:40,x3:30}}),e.createMethods.push("_createPrevNextButtons");var a=e.prototype;return a._createPrevNextButtons=function(){this.options.prevNextButtons&&(this.prevButton=new s((-1),this),this.nextButton=new s(1,this),this.on("activate",this.activatePrevNextButtons))},a.activatePrevNextButtons=function(){this.prevButton.activate(),this.nextButton.activate(),this.on("deactivate",this.deactivatePrevNextButtons)},a.deactivatePrevNextButtons=function(){this.prevButton.deactivate(),this.nextButton.deactivate(),this.off("deactivate",this.deactivatePrevNextButtons)},e.PrevNextButton=s,e}),function(t,e){"function"==typeof define&&define.amd?define("flickity/js/page-dots",["./flickity","tap-listener/tap-listener","fizzy-ui-utils/utils"],function(i,n,s){return e(t,i,n,s)}):"object"==typeof module&&module.exports?module.exports=e(t,require("./flickity"),require("tap-listener"),require("fizzy-ui-utils")):e(t,t.Flickity,t.TapListener,t.fizzyUIUtils)}(window,function(t,e,i,n){function s(t){this.parent=t,this._create()}s.prototype=new i,s.prototype._create=function(){this.holder=document.createElement("ol"),this.holder.className="flickity-page-dots",this.dots=[],this.on("tap",this.onTap),this.on("pointerDown",this.parent.childUIPointerDown.bind(this.parent))},s.prototype.activate=function(){this.setDots(),this.bindTap(this.holder),this.parent.element.appendChild(this.holder)},s.prototype.deactivate=function(){this.parent.element.removeChild(this.holder),i.prototype.destroy.call(this)},s.prototype.setDots=function(){var t=this.parent.slides.length-this.dots.length;t>0?this.addDots(t):t<0&&this.removeDots(-t)},s.prototype.addDots=function(t){for(var e=document.createDocumentFragment(),i=[],n=this.dots.length,s=n+t,o=n;o<s;o++){var r=document.createElement("li");r.className="dot",r.setAttribute("aria-label","Page dot "+(o+1)),e.appendChild(r),i.push(r)}this.holder.appendChild(e),this.dots=this.dots.concat(i)},s.prototype.removeDots=function(t){var e=this.dots.splice(this.dots.length-t,t);e.forEach(function(t){this.holder.removeChild(t)},this)},s.prototype.updateSelected=function(){this.selectedDot&&(this.selectedDot.className="dot",this.selectedDot.removeAttribute("aria-current")),this.dots.length&&(this.selectedDot=this.dots[this.parent.selectedIndex],this.selectedDot.className="dot is-selected",this.selectedDot.setAttribute("aria-current","step"))},s.prototype.onTap=function(t){var e=t.target;if("LI"==e.nodeName){this.parent.uiChange();var i=this.dots.indexOf(e);this.parent.select(i)}},s.prototype.destroy=function(){this.deactivate()},e.PageDots=s,n.extend(e.defaults,{pageDots:!0}),e.createMethods.push("_createPageDots");var o=e.prototype;return o._createPageDots=function(){this.options.pageDots&&(this.pageDots=new s(this),this.on("activate",this.activatePageDots),this.on("select",this.updateSelectedPageDots),this.on("cellChange",this.updatePageDots),this.on("resize",this.updatePageDots),this.on("deactivate",this.deactivatePageDots))},o.activatePageDots=function(){this.pageDots.activate()},o.updateSelectedPageDots=function(){this.pageDots.updateSelected()},o.updatePageDots=function(){this.pageDots.setDots()},o.deactivatePageDots=function(){this.pageDots.deactivate()},e.PageDots=s,e}),function(t,e){"function"==typeof define&&define.amd?define("flickity/js/player",["ev-emitter/ev-emitter","fizzy-ui-utils/utils","./flickity"],function(t,i,n){return e(t,i,n)}):"object"==typeof module&&module.exports?module.exports=e(require("ev-emitter"),require("fizzy-ui-utils"),require("./flickity")):e(t.EvEmitter,t.fizzyUIUtils,t.Flickity)}(window,function(t,e,i){function n(t){this.parent=t,this.state="stopped",this.onVisibilityChange=this.visibilityChange.bind(this),this.onVisibilityPlay=this.visibilityPlay.bind(this)}n.prototype=Object.create(t.prototype),n.prototype.play=function(){if("playing"!=this.state){var t=document.hidden;if(t)return void document.addEventListener("visibilitychange",this.onVisibilityPlay);this.state="playing",document.addEventListener("visibilitychange",this.onVisibilityChange),this.tick()}},n.prototype.tick=function(){if("playing"==this.state){var t=this.parent.options.autoPlay;t="number"==typeof t?t:3e3;var e=this;this.clear(),this.timeout=setTimeout(function(){e.parent.next(!0),e.tick()},t)}},n.prototype.stop=function(){this.state="stopped",this.clear(),document.removeEventListener("visibilitychange",this.onVisibilityChange)},n.prototype.clear=function(){clearTimeout(this.timeout)},n.prototype.pause=function(){"playing"==this.state&&(this.state="paused",this.clear())},n.prototype.unpause=function(){"paused"==this.state&&this.play()},n.prototype.visibilityChange=function(){var t=document.hidden;this[t?"pause":"unpause"]()},n.prototype.visibilityPlay=function(){this.play(),document.removeEventListener("visibilitychange",this.onVisibilityPlay)},e.extend(i.defaults,{pauseAutoPlayOnHover:!0}),i.createMethods.push("_createPlayer");var s=i.prototype;return s._createPlayer=function(){this.player=new n(this),this.on("activate",this.activatePlayer),this.on("uiChange",this.stopPlayer),this.on("pointerDown",this.stopPlayer),this.on("deactivate",this.deactivatePlayer)},s.activatePlayer=function(){this.options.autoPlay&&(this.player.play(),this.element.addEventListener("mouseenter",this))},s.playPlayer=function(){this.player.play()},s.stopPlayer=function(){this.player.stop()},s.pausePlayer=function(){this.player.pause()},s.unpausePlayer=function(){this.player.unpause()},s.deactivatePlayer=function(){this.player.stop(),this.element.removeEventListener("mouseenter",this)},s.onmouseenter=function(){this.options.pauseAutoPlayOnHover&&(this.player.pause(),this.element.addEventListener("mouseleave",this))},s.onmouseleave=function(){this.player.unpause(),this.element.removeEventListener("mouseleave",this)},i.Player=n,i}),function(t,e){"function"==typeof define&&define.amd?define("flickity/js/add-remove-cell",["./flickity","fizzy-ui-utils/utils"],function(i,n){return e(t,i,n)}):"object"==typeof module&&module.exports?module.exports=e(t,require("./flickity"),require("fizzy-ui-utils")):e(t,t.Flickity,t.fizzyUIUtils)}(window,function(t,e,i){function n(t){var e=document.createDocumentFragment();return t.forEach(function(t){e.appendChild(t.element)}),e}var s=e.prototype;return s.insert=function(t,e){var i=this._makeCells(t);if(i&&i.length){var s=this.cells.length;e=void 0===e?s:e;var o=n(i),r=e==s;if(r)this.slider.appendChild(o);else{var a=this.cells[e].element;this.slider.insertBefore(o,a)}if(0===e)this.cells=i.concat(this.cells);else if(r)this.cells=this.cells.concat(i);else{var l=this.cells.splice(e,s-e);this.cells=this.cells.concat(i).concat(l)}this._sizeCells(i),this.cellChange(e,!0)}},s.append=function(t){this.insert(t,this.cells.length)},s.prepend=function(t){this.insert(t,0)},s.remove=function(t){var e=this.getCells(t);if(e&&e.length){var n=this.cells.length-1;e.forEach(function(t){t.remove();var e=this.cells.indexOf(t);n=Math.min(e,n),i.removeFrom(this.cells,t)},this),this.cellChange(n,!0)}},s.cellSizeChange=function(t){var e=this.getCell(t);if(e){e.getSize();var i=this.cells.indexOf(e);this.cellChange(i)}},s.cellChange=function(t,e){var i=this.selectedElement;this._positionCells(t),this._getWrapShiftCells(),this.setGallerySize();var n=this.getCell(i);n&&(this.selectedIndex=this.getCellSlideIndex(n)),this.selectedIndex=Math.min(this.slides.length-1,this.selectedIndex),this.emitEvent("cellChange",[t]),this.select(this.selectedIndex),e&&this.positionSliderAtSelected()},e}),function(t,e){"function"==typeof define&&define.amd?define("flickity/js/lazyload",["./flickity","fizzy-ui-utils/utils"],function(i,n){return e(t,i,n)}):"object"==typeof module&&module.exports?module.exports=e(t,require("./flickity"),require("fizzy-ui-utils")):e(t,t.Flickity,t.fizzyUIUtils)}(window,function(t,e,i){"use strict";function n(t){if("IMG"==t.nodeName){var e=t.getAttribute("data-flickity-lazyload"),n=t.getAttribute("data-flickity-lazyload-src"),s=t.getAttribute("data-flickity-lazyload-srcset");if(e||n||s)return[t]}var o="img[data-flickity-lazyload], img[data-flickity-lazyload-src], img[data-flickity-lazyload-srcset]",r=t.querySelectorAll(o);return i.makeArray(r)}function s(t,e){this.img=t,this.flickity=e,this.load()}e.createMethods.push("_createLazyload");var o=e.prototype;return o._createLazyload=function(){this.on("select",this.lazyLoad)},o.lazyLoad=function(){var t=this.options.lazyLoad;if(t){var e="number"==typeof t?t:0,i=this.getAdjacentCellElements(e),o=[];i.forEach(function(t){var e=n(t);o=o.concat(e)}),o.forEach(function(t){new s(t,this)},this)}},s.prototype.handleEvent=i.handleEvent,s.prototype.load=function(){this.img.addEventListener("load",this),this.img.addEventListener("error",this);var t=this.img.getAttribute("data-flickity-lazyload")||this.img.getAttribute("data-flickity-lazyload-src"),e=this.img.getAttribute("data-flickity-lazyload-srcset");this.img.src=t,e&&this.img.setAttribute("srcset",e),this.img.removeAttribute("data-flickity-lazyload"),this.img.removeAttribute("data-flickity-lazyload-src"),this.img.removeAttribute("data-flickity-lazyload-srcset")},s.prototype.onload=function(t){this.complete(t,"flickity-lazyloaded")},s.prototype.onerror=function(t){this.complete(t,"flickity-lazyerror")},s.prototype.complete=function(t,e){this.img.removeEventListener("load",this),this.img.removeEventListener("error",this);var i=this.flickity.getParentCell(this.img),n=i&&i.element;this.flickity.cellSizeChange(n),this.img.classList.add(e),this.flickity.dispatchEvent("lazyLoad",t,n)},e.LazyLoader=s,e}),function(t,e){"function"==typeof define&&define.amd?define("flickity/js/index",["./flickity","./drag","./prev-next-button","./page-dots","./player","./add-remove-cell","./lazyload"],e):"object"==typeof module&&module.exports&&(module.exports=e(require("./flickity"),require("./drag"),require("./prev-next-button"),require("./page-dots"),require("./player"),require("./add-remove-cell"),require("./lazyload")))}(window,function(t){return t}),function(t,e){"function"==typeof define&&define.amd?define("flickity-as-nav-for/as-nav-for",["flickity/js/index","fizzy-ui-utils/utils"],e):"object"==typeof module&&module.exports?module.exports=e(require("flickity"),require("fizzy-ui-utils")):t.Flickity=e(t.Flickity,t.fizzyUIUtils)}(window,function(t,e){function i(t,e,i){return(e-t)*i+t}t.createMethods.push("_createAsNavFor");var n=t.prototype;return n._createAsNavFor=function(){this.on("activate",this.activateAsNavFor),this.on("deactivate",this.deactivateAsNavFor),this.on("destroy",this.destroyAsNavFor);var t=this.options.asNavFor;if(t){var e=this;setTimeout(function(){e.setNavCompanion(t)})}},n.setNavCompanion=function(i){i=e.getQueryElement(i);var n=t.data(i);if(n&&n!=this){this.navCompanion=n;var s=this;this.onNavCompanionSelect=function(){s.navCompanionSelect()},n.on("select",this.onNavCompanionSelect),this.on("staticClick",this.onNavStaticClick),this.navCompanionSelect(!0)}},n.navCompanionSelect=function(t){if(this.navCompanion){var e=this.navCompanion.selectedCells[0],n=this.navCompanion.cells.indexOf(e),s=n+this.navCompanion.selectedCells.length-1,o=Math.floor(i(n,s,this.navCompanion.cellAlign));if(this.selectCell(o,!1,t),this.removeNavSelectedElements(),!(o>=this.cells.length)){var r=this.cells.slice(n,s+1);this.navSelectedElements=r.map(function(t){return t.element}),this.changeNavSelectedClass("add")}}},n.changeNavSelectedClass=function(t){this.navSelectedElements.forEach(function(e){e.classList[t]("is-nav-selected")})},n.activateAsNavFor=function(){this.navCompanionSelect(!0)},n.removeNavSelectedElements=function(){this.navSelectedElements&&(this.changeNavSelectedClass("remove"),delete this.navSelectedElements)},n.onNavStaticClick=function(t,e,i,n){"number"==typeof n&&this.navCompanion.selectCell(n)},n.deactivateAsNavFor=function(){this.removeNavSelectedElements()},n.destroyAsNavFor=function(){this.navCompanion&&(this.navCompanion.off("select",this.onNavCompanionSelect),this.off("staticClick",this.onNavStaticClick),delete this.navCompanion)},t}),function(t,e){"use strict";"function"==typeof define&&define.amd?define("imagesloaded/imagesloaded",["ev-emitter/ev-emitter"],function(i){return e(t,i)}):"object"==typeof module&&module.exports?module.exports=e(t,require("ev-emitter")):t.imagesLoaded=e(t,t.EvEmitter)}("undefined"!=typeof window?window:this,function(t,e){function i(t,e){for(var i in e)t[i]=e[i];return t}function n(t){if(Array.isArray(t))return t;var e="object"==typeof t&&"number"==typeof t.length;return e?h.call(t):[t]}function s(t,e,o){if(!(this instanceof s))return new s(t,e,o);var r=t;return"string"==typeof t&&(r=document.querySelectorAll(t)),r?(this.elements=n(r),this.options=i({},this.options),"function"==typeof e?o=e:i(this.options,e),o&&this.on("always",o),this.getImages(),a&&(this.jqDeferred=new a.Deferred),void setTimeout(this.check.bind(this))):void l.error("Bad element for imagesLoaded "+(r||t))}function o(t){this.img=t}function r(t,e){this.url=t,this.element=e,this.img=new Image}var a=t.jQuery,l=t.console,h=Array.prototype.slice;s.prototype=Object.create(e.prototype),s.prototype.options={},s.prototype.getImages=function(){this.images=[],this.elements.forEach(this.addElementImages,this)},s.prototype.addElementImages=function(t){"IMG"==t.nodeName&&this.addImage(t),this.options.background===!0&&this.addElementBackgroundImages(t);var e=t.nodeType;if(e&&c[e]){for(var i=t.querySelectorAll("img"),n=0;n<i.length;n++){var s=i[n];this.addImage(s)}if("string"==typeof this.options.background){var o=t.querySelectorAll(this.options.background);for(n=0;n<o.length;n++){var r=o[n];this.addElementBackgroundImages(r)}}}};var c={1:!0,9:!0,11:!0};return s.prototype.addElementBackgroundImages=function(t){var e=getComputedStyle(t);if(e)for(var i=/url\((['"])?(.*?)\1\)/gi,n=i.exec(e.backgroundImage);null!==n;){var s=n&&n[2];s&&this.addBackground(s,t),n=i.exec(e.backgroundImage)}},s.prototype.addImage=function(t){var e=new o(t);this.images.push(e)},s.prototype.addBackground=function(t,e){var i=new r(t,e);this.images.push(i)},s.prototype.check=function(){function t(t,i,n){setTimeout(function(){e.progress(t,i,n)})}var e=this;return this.progressedCount=0,this.hasAnyBroken=!1,this.images.length?void this.images.forEach(function(e){e.once("progress",t),e.check()}):void this.complete()},s.prototype.progress=function(t,e,i){this.progressedCount++,this.hasAnyBroken=this.hasAnyBroken||!t.isLoaded,this.emitEvent("progress",[this,t,e]),this.jqDeferred&&this.jqDeferred.notify&&this.jqDeferred.notify(this,t),this.progressedCount==this.images.length&&this.complete(),this.options.debug&&l&&l.log("progress: "+i,t,e)},s.prototype.complete=function(){var t=this.hasAnyBroken?"fail":"done";if(this.isComplete=!0,this.emitEvent(t,[this]),this.emitEvent("always",[this]),this.jqDeferred){var e=this.hasAnyBroken?"reject":"resolve";this.jqDeferred[e](this)}},o.prototype=Object.create(e.prototype),o.prototype.check=function(){var t=this.getIsImageComplete();return t?void this.confirm(0!==this.img.naturalWidth,"naturalWidth"):(this.proxyImage=new Image,this.proxyImage.addEventListener("load",this),this.proxyImage.addEventListener("error",this),this.img.addEventListener("load",this),this.img.addEventListener("error",this),void(this.proxyImage.src=this.img.src))},o.prototype.getIsImageComplete=function(){return this.img.complete&&this.img.naturalWidth},o.prototype.confirm=function(t,e){this.isLoaded=t,this.emitEvent("progress",[this,this.img,e])},o.prototype.handleEvent=function(t){var e="on"+t.type;this[e]&&this[e](t)},o.prototype.onload=function(){this.confirm(!0,"onload"),this.unbindEvents()},o.prototype.onerror=function(){this.confirm(!1,"onerror"),this.unbindEvents()},o.prototype.unbindEvents=function(){this.proxyImage.removeEventListener("load",this),this.proxyImage.removeEventListener("error",this),this.img.removeEventListener("load",this),this.img.removeEventListener("error",this)},r.prototype=Object.create(o.prototype),r.prototype.check=function(){this.img.addEventListener("load",this),this.img.addEventListener("error",this),this.img.src=this.url;var t=this.getIsImageComplete();t&&(this.confirm(0!==this.img.naturalWidth,"naturalWidth"),this.unbindEvents())},r.prototype.unbindEvents=function(){this.img.removeEventListener("load",this),this.img.removeEventListener("error",this)},r.prototype.confirm=function(t,e){this.isLoaded=t,this.emitEvent("progress",[this,this.element,e])},s.makeJQueryPlugin=function(e){e=e||t.jQuery,e&&(a=e,a.fn.imagesLoaded=function(t,e){var i=new s(this,t,e);return i.jqDeferred.promise(a(this))})},s.makeJQueryPlugin(),s}),function(t,e){"function"==typeof define&&define.amd?define(["flickity/js/index","imagesloaded/imagesloaded"],function(i,n){return e(t,i,n)}):"object"==typeof module&&module.exports?module.exports=e(t,require("flickity"),require("imagesloaded")):t.Flickity=e(t,t.Flickity,t.imagesLoaded)}(window,function(t,e,i){"use strict";e.createMethods.push("_createImagesLoaded");var n=e.prototype;return n._createImagesLoaded=function(){this.on("activate",this.imagesLoaded)},n.imagesLoaded=function(){function t(t,i){var n=e.getParentCell(i.img);e.cellSizeChange(n&&n.element),e.options.freeScroll||e.positionSliderAtSelected()}if(this.options.imagesLoaded){var e=this;i(this.slider).on("progress",t)}},e});
var HelsingborgPrime = {};
var ie = (function () {

    var undef,
        v = 3,
        div = document.createElement('div'),
        all = div.getElementsByTagName('i');

    while (
        div.innerHTML = '<!--[if gt IE ' + (++v) + ']><i></i><![endif]-->',
            all[0]
        ) ;

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

jQuery.expr.filters.offscreen = function (el) {
    var rect = el.getBoundingClientRect();
    return (
        (rect.x + rect.width) < 0
        || (rect.y + rect.height) < 0
        || (rect.x > window.innerWidth || rect.y > window.innerHeight)
    );
};

jQuery.expr[':'].icontains = function (a, i, m) {
    return jQuery(a).text().toUpperCase()
        .indexOf(m[3].toUpperCase()) >= 0;
};
/**
 *  Modularity - Post filters  - Toogle
 * */
var screenSize = function () {
    var w = window,
        d = document,
        e = d.documentElement,
        g = d.getElementsByTagName('body')[0],
        x = w.innerWidth || e.clientWidth || g.clientWidth;
    return x;
};

var postFilters = document.getElementById("post-filter"),
    disablePostFilterJs = document.querySelector('disable-post-filter-js');

if (postFilters && !disablePostFilterJs) {
    document.querySelector('.toogle').addEventListener('click', function (e) {
        this.classList.toggle('hidden');
        var toogleElement = this.getAttribute('data-toogle');
        [].map.call(document.querySelectorAll(toogleElement), function (element) {
            element.classList.toggle('hidden');
        });
    });
    document.querySelector('#filter-keyword').addEventListener('click', function (e) {
        var x = screenSize();
        if (x >= 895) {
            if (document.getElementById('show-date-filter').classList.contains('hidden')) {
                document.getElementById('show-date-filter').classList.remove('hidden');
            }
            if (!document.getElementById('date-filter').classList.contains('hidden')) {
                document.getElementById('date-filter').classList.add('hidden');
            }
        }
    });
    window.addEventListener('resize', function (event) {
        var x = screenSize();
        if (x >= 895) {
            document.getElementById('show-date-filter').classList.remove('hidden');
            document.getElementById('date-filter').classList.add('hidden');
        }
        else {
            document.getElementById('show-date-filter').classList.add('hidden');
            document.getElementById('date-filter').classList.remove('hidden');
        }
    });

}

/* Flickity patch - Reload window doesn't set correct height */
jQuery(window).load( function() {
    window.dispatchEvent(new Event('resize'));
});

//
// @name Language
//
HelsingborgPrime = HelsingborgPrime || {};

HelsingborgPrime.Args = (function ($) {

    function Args() {

    }

    Args.prototype.get = function (s) {
        if (typeof HbgPrimeArgs == 'undefined') {
            return false;
        }

        var o = HbgPrimeArgs;

        s = s.replace(/\[(\w+)\]/g, '.$1');
        s = s.replace(/^\./, '');

        var a = s.split('.');
        for (var i = 0, n = a.length; i < n; ++i) {
            var k = a[i];

            if (k in o) {
                o = o[k];
            } else {
                return false;
            }
        }

        return o;
    };

    return new Args();

})(jQuery);

//
// @name Gallery
// @description  Popup boxes for gallery items.
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Component = HelsingborgPrime.Component || {};

HelsingborgPrime.Component.GalleryPopup = (function ($) {

    function GalleryPopup() {
    	//Click event
    	this.clickWatcher();
        this.arrowNav();

    	//Popup hash changes
    	$(window).bind('hashchange', function() {
			this.togglePopupClass();
		}.bind(this)).trigger('hashchange');

        //Preload on hover
        this.preloadImageAsset();
    }

    GalleryPopup.prototype.clickWatcher = function () {
	    $('.lightbox-trigger').click(function(event) {
			event.preventDefault();

			//Get data
			var image_href = $(this).attr('href');
            var image_caption = '';

            //Get caption
            if (typeof $(this).attr('data-caption') !== 'undefined') {
                var image_caption = $(this).attr("data-caption");
            }

			//Update hash
			window.location.hash = "lightbox-open";

			//Add markup, or update.
			if ($('#lightbox').length > 0) {
                $('#lightbox-image').attr('src',image_href);
                $('#lightbox .lightbox-image-wrapper').attr('data-caption',image_caption);
                $('#lightbox').fadeIn();
			} else {
				var lightbox =
				'<div id="lightbox">' +
					'<div class="lightbox-image-wrapper" data-caption="' + image_caption + '">' +
						'<a class="btn-close" href="#lightbox-close"></a>' +
						'<img id="lightbox-image" src="' + image_href +'" />' +
					'</div>' +
				'</div>';

				$('body').append(lightbox);
                $('#lightbox').hide().fadeIn();
			}

            $(this).addClass('gallery-active');
            $(this).trigger('openLightBox');
		});

		$(document).on('click', '#lightbox', function () {
			$(this).fadeOut(300).hide(0)
            $('.gallery-active').removeClass('gallery-active');
			window.location.hash = 'lightbox-closed';
            $(this).trigger('closeLightBox');
		});

    };

    GalleryPopup.prototype.togglePopupClass = function (){
	    if (window.location.hash.replace('-', '') == '#lightbox-open'.replace('-', '')) {
			$('html').addClass('gallery-hidden');
		} else {
			$('html').removeClass('gallery-hidden');
		}
    };

    GalleryPopup.prototype.preloadImageAsset = function () {
        $('.image-gallery a.lightbox-trigger').on('mouseenter', function(){
            var img = new Image();
            img.src = jQuery(this).attr('href');
        });
    };

    GalleryPopup.prototype.arrowNav = function () {
        // Keycodes
        var leftArrow = 37;
        var rightArrow = 39;

        $(window).on('keyup', function (e) {
            if (window.location.hash.replace('-', '') != '#lightbox-open'.replace('-', '')) {
                return false;
            }

            if (e.which == leftArrow) {
                this.prevImg();
            } else if (e.which == rightArrow) {
                this.nextImg();
            }
        }.bind(this));
    };

    GalleryPopup.prototype.nextImg = function () {
        var nextImg = $('.gallery-active').parent('li').next().children('a');
        if (nextImg.length == 0) {
            nextImg = $('.gallery-active').parents('ul').children('li:first-child').children('a');
        }

        $('#lightbox').trigger('click');
        setTimeout(function () {
            nextImg.trigger('click');
        }, 100);
    };

    GalleryPopup.prototype.prevImg = function () {
        var prevImg = $('.gallery-active').parent('li').prev().children('a');
        if (prevImg.length == 0) {
            prevImg = $('.gallery-active').parents('ul').children('li:last-child').children('a');
        }

        $('#lightbox').trigger('click');
        setTimeout(function () {
            prevImg.trigger('click');
        }, 100);
    };

    new GalleryPopup();

})(jQuery);

//
// @name Image upload
// @description
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Component = HelsingborgPrime.Component || {};

HelsingborgPrime.Component.ImageUpload = (function ($) {

    var elementClass = '.image-upload';
    var drags = 0;
    var selectedFiles = new Array();
    var allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif'];

    function ImageUpload() {
        this.initDragAndDrop();
        this.initFileInput();
    }

    /**
     * Select file by browse
     * @return {void}
     */
    ImageUpload.prototype.initFileInput = function () {
        $imageUploadInput = $(elementClass).find('input[type="file"]');

        $imageUploadInput.on('change', function (e) {
            var file = $(e.target).closest('input[type="file"]').get(0).files[0];
            this.addFile($(e.target).closest(elementClass), file);
        }.bind(this));
    };

    /**
     * Drag and drop a file
     * @return {void}
     */
    ImageUpload.prototype.initDragAndDrop = function () {
        $imageUpload = $(elementClass);

        $imageUpload.on('drag dragstart dragend dragover dragenter dragleave drop', function (e) {
            e.preventDefault();
            e.stopPropagation();

            $imageUpload.removeClass('is-error is-error-filetype')
        })
        .on('dragenter', function (e) {
            drags++;

            if (drags === 1) {
                $(e.target).closest(elementClass).addClass('is-dragover');
            }
        })
        .on('dragleave', function (e) {
            drags--;

            if (drags === 0) {
                $(e.target).closest(elementClass).removeClass('is-dragover');
            }
        })
        .on('drop', function (e) {
            drags--;
            if (drags === 0) {
                $(e.target).closest(elementClass).removeClass('is-selected is-dragover');
            }

            this.addFile($(e.target).closest(elementClass), e.originalEvent.dataTransfer.files[0]);
        }.bind(this));
    };

    /**
     * Adds a file
     * @param {object} element The image uploader element
     * @param {object} file    The file object
     */
    ImageUpload.prototype.addFile = function (element, file) {
        if (allowedFileTypes.indexOf(file.type) == -1) {
            element.addClass('is-error is-error-filetype');
            element.find('.selected-file').html('');

            return false;
        }

        var maxFilesize = element.attr('data-max-size') ? element.attr('data-max-size') : 1000;
        maxFilesize = parseInt(maxFilesize);
        maxFilesize = maxFilesize.toFixed(0);
        var fileSize = parseInt(file.size/1000).toFixed(0);

        if (parseInt(fileSize) > parseInt(maxFilesize)) {
            element.addClass('is-error is-error-filesize');
            element.find('.selected-file').html('');

            return false;
        }

        selectedFiles.push(file);

        if (!element.attr('data-preview-image')) {
            element.find('.selected-file').html(file.name);
        }

        var reader = new FileReader();
        reader.readAsDataURL(file);

        reader.addEventListener('load', function (e) {
            var image = e.target;
            var max_images = element.attr('data-max-files');


            if (max_images && selectedFiles.length > max_images) {
                selectedFiles = selectedFiles.slice(1);
                element.find('input[name="image_uploader_file[]"]:first').remove();
            }

            element.append('<input type="hidden" name="image_uploader_file[]" read-only>');
            element.find('input[name="image_uploader_file[]"]:last').val(image.result);

            if (element.attr('data-preview-image')) {
                element.find('.selected-file').css('backgroundImage', 'url(\'' + image.result + '\')');
            }
        });

        element.addClass('is-selected');

        return true;
    };

    return new ImageUpload();

})(jQuery);

//
// @name Modal
// @description  Show accodrion dropdown, make linkable by updating adress bar
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Component = HelsingborgPrime.Component || {};
HelsingborgPrime.Component.TagManager = (function ($) {

    var typingTimer;

    function TagManager() {
        $('.tag-manager').each(function (index, element) {
            this.init(element);
        }.bind(this));

        $(document).on('click', '.tag-manager .tag-manager-selected button[data-action="remove"]', function (e) {
            e.preventDefault();

            var tagElement = $(e.target).closest('li');
            this.removeTag(tagElement);
        }.bind(this));
    }

    /**
     * Initialize tag manager
     * @param  {element} element The tag manager element
     * @return {void}
     */
    TagManager.prototype.init = function(element) {
        var $element = $(element);
        var $button = $element.find('.tag-manager-input [name="add-tag"]');
        var $input = $element.find('.tag-manager-input input[type="text"]');

        $button.on('click', function (e) {
            e.preventDefault();
            var tag = $input.val();
            var tags = tag.split(',');

            $.each(tags, function (index, tag) {
                this.addTag(element, tag.trim());
            }.bind(this));

        }.bind(this));

        $input.on('keypress', function (e) {
            if (e.keyCode !== 13) {
                return;
            }

            e.preventDefault();
            var element = $(e.target).parents('.tag-manager')[0]
            var tag = $input.val();
            var tags = tag.split(',');

            $.each(tags, function (index, tag) {
                this.addTag(element, tag.trim());
            }.bind(this));
        }.bind(this));

        if ($element.attr('data-wp-ajax-action') && typeof ajaxurl !== 'undefined') {
            $input.on('keyup', function (e) {
                clearTimeout(typingTimer);

                typingTimer = setTimeout(function () {
                    this.autocompleteQuery(element);
                }.bind(this), 300);
            }.bind(this));

            $('.tag-manager').on('click', '.autocomplete button', function (e) {
                e.preventDefault();
                var element = $(e.target).closest('button').parents('.tag-manager');
                var tag = $(e.target).closest('button').val();
                var tags = tag.split(',');

                $.each(tags, function (index, tag) {
                    this.addTag(element, tag.trim());
                }.bind(this));
            }.bind(this));
        }
    };

    /**
     * Do ajax autocomplete request
     * @param  {element} element The tag manager element
     * @return {void}
     */
    TagManager.prototype.autocompleteQuery = function(element) {
        var $element = $(element);
        var $input = $element.find('.tag-manager-input input[type="text"]');

        // Return if no search value
        if ($input.val().length === 0) {
            clearTimeout(typingTimer);
            $element.find('.autocomplete').remove();
            return false;
        }

        var ajaxAction = $element.attr('data-wp-ajax-action');
        var data = {
            action: ajaxAction,
            q: $input.val()
        };

        $.post(ajaxurl, data, function (res) {
            if (res.length === 0) {
                return;
            }

            this.showAutocomplete(element, res);
        }.bind(this), 'JSON');
    };

    /**
     * Show the autocomplete element
     * @param  {element} element The tag manager eleement
     * @param  {array} items     The autocomplete items
     * @return {void}
     */
    TagManager.prototype.showAutocomplete = function(element, items) {
        var $element = $(element);
        $element.find('.autocomplete').remove();

        var $autocomplete = $('<div class="autocomplete gutter gutter-sm"><ul></ul></div>');

        $.each(items, function (index, item) {
            $autocomplete.find('ul').append('<li><span class="tag no-padding"><button value="' + item + '">' + item + '</button></span></li>');
        });

        $element.find('.tag-manager-input').append($autocomplete);
    };

    /**
     * Adds a tag to the tag manager selected tags
     * @param {element} element The tag manager element
     * @param {string} tag      The tag name
     */
    TagManager.prototype.addTag = function(element, tag) {
        if (tag.length === 0) {
            return;
        }

        var $element = $(element);
        var inputname = $(element).attr('data-input-name');
        $element.find('.tag-manager-selected ul').append('<li>\
            <span class="tag">\
                <button class="btn btn-plain" data-action="remove">&times;</button>\
                ' + tag + '\
            </span>\
            <input type="hidden" name="' + inputname + '[]" value="' + tag + '">\
        </li>');

        $element.find('.tag-manager-input input[type="text"]').val('');
        $element.find('.autocomplete').remove();
    };

    /**
     * Removes a selected tag
     * @param  {element} tagElement The tag to remove
     * @return {void}
     */
    TagManager.prototype.removeTag = function(tagElement) {
        $(tagElement).remove();
    };

    return new TagManager();

})(jQuery);

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
        
        var click = false;

        $(document).on('focus', '.accordion-toggle', function(e) { 
                        
            if(!click)
            {
                $(this).parent().find('.accordion-content').show();
                $(this).addClass("minus");
            }

            click = false;
                
        });
                
                
        $(document).on('mousedown', '.accordion-toggle', function(e) { 

            click = true;

            $(this).parent().find('.accordion-content').toggle();
            
            $(this).toggleClass("minus");
            
            $(this).blur();

        });

        $('.accordion-search input').on('input', function (e) {

            var where = $(e.target).parents('.accordion');
            var what = $(e.target).val();

            this.filter(what, where);
        }.bind(this));
    };

    Accordion.prototype.filter = function(what, where) {
        where.find('.accordion-section').find('.accordion-content').hide();
        where.find('.accordion-section').find('.accordion-toggle').removeClass('minus');

        if(what != '')
        {
            where.find('.accordion-section:icontains(' + what + ')').find('.accordion-content').show();

            if(!where.find('.accordion-section:icontains(' + what + ')').find('.accordion-toggle').hasClass('minus')){
                where.find('.accordion-section:icontains(' + what + ')').find('.accordion-toggle').addClass('minus');
            }
        }
        
    };

    return new Accordion();

})(jQuery);

//
// @name File selector
// @description
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Component = HelsingborgPrime.Component || {};

HelsingborgPrime.Component.AudioPlayer = (function ($) {

    var numberTotalOfTicks = 1000;

    function AudioPlayer() {
        this.handlePlayPause();

        $(".audio-player").each(function(index, player){

            //Setup seekbar
            $("audio", player).get(0).addEventListener('loadedmetadata', function() {
                this.initPlayer($(player).closest(".audio-player"));
            }.bind(this));

            //Lock seeker
            $(".action-seek", player).get(0).addEventListener('mousedown', function() {
                this.lockSeeker(player);
            }.bind(this));

            //Handle reseek
            $(".action-seek", player).get(0).addEventListener('mouseup', function() {
                this.handleReSeek(player);
                this.unlockSeeker(player);
            }.bind(this));

            //Move seeker
            $("audio", player).get(0).addEventListener('timeupdate', function() {
                this.updateSeekerStatus(player);
            }.bind(this));

        }.bind(this));

    }

    AudioPlayer.prototype.updateSeekerStatus = function (player) {
        if(!$(player).hasClass("locked")) {
            $(".action-seek", player).val(($("audio", player).get(0).currentTime/$("audio", player).get(0).duration) * 100);
        }
    };

    AudioPlayer.prototype.initPlayer = function (player) {
        $(player).addClass("ready");
    };

    AudioPlayer.prototype.lockSeeker = function (player) {
        $(player).addClass("locked");
    };

    AudioPlayer.prototype.unlockSeeker = function (player) {
        $(player).removeClass("locked");
    };

    AudioPlayer.prototype.handleReSeek = function (player) {

        $("audio", player).get(0).currentTime = $("audio", player).get(0).duration * ($(".action-seek", player).val()/100);

        if($("audio", player).get(0).currentTime != $("audio", player).get(0).duration) {
            this.play(player);
        } else {
            this.pause(player);
        }
    };

    AudioPlayer.prototype.play = function (player) {

        //Stop all players
        this.pauseAll();

        //Play and visaully indicate playback
        $("audio", $(player).closest(".audio-player")).get(0).play();
        $(player).closest(".audio-player").addClass("playing");
    };

    AudioPlayer.prototype.pause = function (player) {

        //Stop and remove playback class
        $("audio", $(player).closest(".audio-player")).get(0).pause();
        $(player).closest(".audio-player").removeClass("playing");
    };

    AudioPlayer.prototype.pauseAll = function () {
        $(".audio-player").each(function(index, player){
            this.pause(player);
        }.bind(this));
    };

    AudioPlayer.prototype.handlePlayPause = function() {
        $(".audio-player .toggle-action-play").click(function(event){
            this.play($(event.target));
        }.bind(this));

        $(".audio-player .toggle-action-pause").click(function(event){
            this.pause($(event.target));
        }.bind(this));
    };

    return new AudioPlayer();

})(jQuery);


//
// @name Modal
// @description  Show accodrion dropdown, make linkable by updating adress bar
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Component = HelsingborgPrime.Component || {};

HelsingborgPrime.Component.Dropdown = (function ($) {

    function Dropdown() {
        this.handleEvents();
        this.jsDropDown();
    }

    Dropdown.prototype.jsDropDown = function () {
        $(document).on('click', $('.js-dropdown__toggle'), function(e) {
            $(e.target).closest('.js-dropdown').toggleClass('is-open');
        });
    };

    Dropdown.prototype.handleEvents = function () {
        $('[data-dropdown]').on('click', function (e) {
            e.preventDefault();

            var targetElement = $(this).attr('data-dropdown');
            $(targetElement).toggleClass('dropdown-target-open');
            $(this).toggleClass('dropdown-open');
            $(this).parent().find(targetElement).toggle();
            $(this).parent().find(targetElement).find('input[data-dropdown-focus]').focus();
        });

        $('body').on('click', function (e) {
            var $target = $(e.target);

            if ($target.closest('.dropdown-target-open').length || $target.closest('[data-dropdown]').length || $target.closest('.backdrop').length) {
                return;
            }

            $('[data-dropdown].dropdown-open').removeClass('dropdown-open');
            $('.dropdown-target-open').toggle();
            $('.dropdown-target-open').removeClass('dropdown-target-open is-highlighted');
        });
    };

    return new Dropdown();

})(jQuery);

//
// @name File selector
// @description
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Component = HelsingborgPrime.Component || {};

HelsingborgPrime.Component.File = (function ($) {

    function File() {
        this.handleEvents();
    }

    File.prototype.handleEvents = function () {
        if($('.input-file input[type="file"]').length) {
            $(document).on('change', '.input-file input[type="file"]', function (e) {
                this.setSelected(e.target);
            }.bind(this));

            $('.input-file input[type="file"]').trigger('change');
        }
    };

    File.prototype.setSelected = function(fileinput) {

        if($(fileinput).length) {
            var $fileinput = $(fileinput);
            var $label = $fileinput.parents('label.input-file');
            var $duplicate = $label.parent('li').clone().find('input').val('').end();

            if ($fileinput.val()) {
                $label.find('.input-file-selected').text($fileinput.val());
            }

            if ($fileinput.val() && $label.parent('li').length) {
                var max = $label.parent('li').parent('ul').attr('data-max');

                if ($label.parent('li').parent('ul').find('li').length < max || max < 0) {
                    $label.parents('ul').append($duplicate);
                }
            }
        }
    };

    return new File();

})(jQuery);

//
// @name Slider
// @description  Sliding content
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Component = HelsingborgPrime.Component || {};

HelsingborgPrime.Component.Slider = (function ($) {

    var autoslideIntervals = [];

    function Slider() {
        this.preloadImage();
        this.triggerAutoplay();
        this.pauseAndPlay();
        
        $('.slider').each(function (index, element) {
            var $slider = $(element);

            this.detectIfIsCollapsed(element);

            if ($slider.find('[data-flickity]')) {
                return;
            }

            $slider.flickity({
                cellSelector: '.slide',
                cellAlign: 'center',
                setGallerySize: false,
                wrapAround: true,
            });

        }.bind(this));

        $(window).resize(function() {
            $('.slider').each(function (index, element) {
                this.detectIfIsCollapsed(element);
            }.bind(this));

            this.pauseAndPlayVisibleIcon();

        }.bind(this));
    }

    /**
     * Add collapsed class
     */
    Slider.prototype.detectIfIsCollapsed = function (slider) {
        if ($(slider).width() <= 500) {
            $(slider).addClass("is-collapsed");
        } else {
            $(slider).removeClass("is-collapsed");
        }

        $(slider).find('.slide').each(function (index, slide) {
            if ($(slide).width() <= 500) {
                $(slide).addClass("is-collapsed");
            } else {
                $(slide).removeClass("is-collapsed");
            }
        });
    };

    Slider.prototype.preloadImage = function () {
        setTimeout(function(){

            var normal_img = [];
            var mobile_img = [];

            $(".slider .slide").each(function(index, slide) {

                if ($(".slider-image-mobile", slide).length) {
                    normal_img.index = new Image();
                    normal_img.index.src = $(".slider-image-desktop", slide).css('background-image').replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
                }

                if ($(".slider-image-mobile", slide).length) {
                    mobile_img.index = new Image();
                    mobile_img.index.src = $(".slider-image-mobile", slide).css('background-image').replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
                }

            });

        },5000);
    };

    Slider.prototype.triggerAutoplay = function () {
        setTimeout(function(){
            $(".slider .slide .slider-video video").each(function(index, video) {
                if (typeof $(video).attr('autoplay') !== 'undefined' && $(video).attr('autoplay') !== 'false') {
                    video.play();
                }
            });
        },300);
    };

    /**
     * Pause & play Visibility
     */
    Slider.prototype.pauseAndPlayVisibleIcon = function () {
        if ($(window).width() > 1024) {
            if ( $('.embeded-mini-toolbar').hasClass('slider-show-on-hover') ) {
                $('.slider').hover(
                    function () {
                        $('.embeded-mini-toolbar').fadeIn(300);
                    },
                    function () {
                        $('.embeded-mini-toolbar').fadeOut(300);
                    }
                );
            }
        }
    };

    /**
     * Pause & play icon on video
     */
    Slider.prototype.pauseAndPlay = function () {

        this.pauseAndPlayVisibleIcon();

        $('.embed-control').on('click', function () {
            event.stopPropagation();
            event.preventDefault();

            var sliderVideoId = $(this).closest('.slide').find('.slider-video').find('video').prop('id');
            var videoPlayer = document.getElementById(sliderVideoId);

            if ($(this).hasClass('embeded-pause')) {
                videoPlayer.pause();
            }

            if ($(this).hasClass('embeded-play')) {
                videoPlayer.play();
            }

            $('.embed-control').each(function() {
                if ($(this).hasClass('hidden')) {
                    $(this).removeClass('hidden');
                }
                else {
                    $(this).addClass('hidden');
                }
            });
        }).bind(this);
    };


    return new Slider();

})(jQuery);

//
// @name Cookies
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.Cookie = (function ($) {

    function Cookie() {

    }

    /**
     * Sets a cookie
     * @param {string} name      Cookie name
     * @param {string} value     Cookie value
     * @param {void}   daysValid
     */
    Cookie.prototype.set = function (name, value, daysValid) {
        var d = new Date();
        d.setTime(d.getTime() + (daysValid * 24 * 60 * 60 * 1000));

        var expires = "expires=" + d.toUTCString();
        document.cookie = name + "=" + value.toString() + "; " + expires + "; path=/";

        return true;
    };

    /**
     * Gets a cookie
     * @param  {string} name Cookie name
     * @return {mixed}       Cookie value or empty string
     */
    Cookie.prototype.get = function(name) {
        name = name + '=';
        var ca = document.cookie.split(';');

        for (var i=0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }

            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }

        return '';
    };

    /**
     * Destroys/removes a cookie
     * @param  {string} name Cookie name
     * @return {void}
     */
    Cookie.prototype.destory = function(name) {
         this.set(name, '', -1);
         return true;
    };

    /**
     * Check if cookie value is the same as compare value
     * @param  {string} name    Cookie name
     * @param  {string} compare Compare value
     * @return {boolean}
     */
    Cookie.prototype.check = function(name, compare) {
         var value = this.get(name);
         compare = compare.toString();

         return value == compare;
    };

    return new Cookie();

})(jQuery);

HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.FeatureDetector = (function ($) {

    function FeatureDetector() {
        this.detectFlexbox();
        this.detectWebp();
    }

    FeatureDetector.prototype.detectFlexbox = function () {
        !function(e,n,t){function r(e,n){return typeof e===n}function o(){var e,n,t,o,s,i,l;for(var a in S)if(S.hasOwnProperty(a)){if(e=[],n=S[a],n.name&&(e.push(n.name.toLowerCase()),n.options&&n.options.aliases&&n.options.aliases.length))for(t=0;t<n.options.aliases.length;t++)e.push(n.options.aliases[t].toLowerCase());for(o=r(n.fn,"function")?n.fn():n.fn,s=0;s<e.length;s++)i=e[s],l=i.split("."),1===l.length?Modernizr[l[0]]=o:(!Modernizr[l[0]]||Modernizr[l[0]]instanceof Boolean||(Modernizr[l[0]]=new Boolean(Modernizr[l[0]])),Modernizr[l[0]][l[1]]=o),C.push((o?"":"no-")+l.join("-"))}}function s(e){var n=x.className,t=Modernizr._config.classPrefix||"";if(_&&(n=n.baseVal),Modernizr._config.enableJSClass){var r=new RegExp("(^|\\s)"+t+"no-js(\\s|$)");n=n.replace(r,"$1"+t+"js$2")}Modernizr._config.enableClasses&&(n+=" "+t+e.join(" "+t),_?x.className.baseVal=n:x.className=n)}function i(e,n){return!!~(""+e).indexOf(n)}function l(){return"function"!=typeof n.createElement?n.createElement(arguments[0]):_?n.createElementNS.call(n,"http://www.w3.org/2000/svg",arguments[0]):n.createElement.apply(n,arguments)}function a(e){return e.replace(/([a-z])-([a-z])/g,function(e,n,t){return n+t.toUpperCase()}).replace(/^-/,"")}function f(e,n){return function(){return e.apply(n,arguments)}}function u(e,n,t){var o;for(var s in e)if(e[s]in n)return t===!1?e[s]:(o=n[e[s]],r(o,"function")?f(o,t||n):o);return!1}function c(e){return e.replace(/([A-Z])/g,function(e,n){return"-"+n.toLowerCase()}).replace(/^ms-/,"-ms-")}function p(n,t,r){var o;if("getComputedStyle"in e){o=getComputedStyle.call(e,n,t);var s=e.console;if(null!==o)r&&(o=o.getPropertyValue(r));else if(s){var i=s.error?"error":"log";s[i].call(s,"getComputedStyle returning null, its possible modernizr test results are inaccurate")}}else o=!t&&n.currentStyle&&n.currentStyle[r];return o}function d(){var e=n.body;return e||(e=l(_?"svg":"body"),e.fake=!0),e}function m(e,t,r,o){var s,i,a,f,u="modernizr",c=l("div"),p=d();if(parseInt(r,10))for(;r--;)a=l("div"),a.id=o?o[r]:u+(r+1),c.appendChild(a);return s=l("style"),s.type="text/css",s.id="s"+u,(p.fake?p:c).appendChild(s),p.appendChild(c),s.styleSheet?s.styleSheet.cssText=e:s.appendChild(n.createTextNode(e)),c.id=u,p.fake&&(p.style.background="",p.style.overflow="hidden",f=x.style.overflow,x.style.overflow="hidden",x.appendChild(p)),i=t(c,e),p.fake?(p.parentNode.removeChild(p),x.style.overflow=f,x.offsetHeight):c.parentNode.removeChild(c),!!i}function y(n,r){var o=n.length;if("CSS"in e&&"supports"in e.CSS){for(;o--;)if(e.CSS.supports(c(n[o]),r))return!0;return!1}if("CSSSupportsRule"in e){for(var s=[];o--;)s.push("("+c(n[o])+":"+r+")");return s=s.join(" or "),m("@supports ("+s+") { #modernizr { position: absolute; } }",function(e){return"absolute"==p(e,null,"position")})}return t}function v(e,n,o,s){function f(){c&&(delete N.style,delete N.modElem)}if(s=r(s,"undefined")?!1:s,!r(o,"undefined")){var u=y(e,o);if(!r(u,"undefined"))return u}for(var c,p,d,m,v,g=["modernizr","tspan","samp"];!N.style&&g.length;)c=!0,N.modElem=l(g.shift()),N.style=N.modElem.style;for(d=e.length,p=0;d>p;p++)if(m=e[p],v=N.style[m],i(m,"-")&&(m=a(m)),N.style[m]!==t){if(s||r(o,"undefined"))return f(),"pfx"==n?m:!0;try{N.style[m]=o}catch(h){}if(N.style[m]!=v)return f(),"pfx"==n?m:!0}return f(),!1}function g(e,n,t,o,s){var i=e.charAt(0).toUpperCase()+e.slice(1),l=(e+" "+P.join(i+" ")+i).split(" ");return r(n,"string")||r(n,"undefined")?v(l,n,o,s):(l=(e+" "+z.join(i+" ")+i).split(" "),u(l,n,t))}function h(e,n,r){return g(e,t,t,n,r)}var C=[],S=[],w={_version:"3.5.0",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,n){var t=this;setTimeout(function(){n(t[e])},0)},addTest:function(e,n,t){S.push({name:e,fn:n,options:t})},addAsyncTest:function(e){S.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=w,Modernizr=new Modernizr;var x=n.documentElement,_="svg"===x.nodeName.toLowerCase(),b="Moz O ms Webkit",P=w._config.usePrefixes?b.split(" "):[];w._cssomPrefixes=P;var z=w._config.usePrefixes?b.toLowerCase().split(" "):[];w._domPrefixes=z;var E={elem:l("modernizr")};Modernizr._q.push(function(){delete E.elem});var N={style:E.elem.style};Modernizr._q.unshift(function(){delete N.style}),w.testAllProps=g,w.testAllProps=h,Modernizr.addTest("flexbox",h("flexBasis","1px",!0)),o(),s(C),delete w.addTest,delete w.addAsyncTest;for(var T=0;T<Modernizr._q.length;T++)Modernizr._q[T]();e.Modernizr=Modernizr}(window,document);
    };

    FeatureDetector.prototype.detectWebp = function () {
        !function(e,n,A){function o(e,n){return typeof e===n}function t(){var e,n,A,t,a,i,l;for(var f in r)if(r.hasOwnProperty(f)){if(e=[],n=r[f],n.name&&(e.push(n.name.toLowerCase()),n.options&&n.options.aliases&&n.options.aliases.length))for(A=0;A<n.options.aliases.length;A++)e.push(n.options.aliases[A].toLowerCase());for(t=o(n.fn,"function")?n.fn():n.fn,a=0;a<e.length;a++)i=e[a],l=i.split("."),1===l.length?Modernizr[l[0]]=t:(!Modernizr[l[0]]||Modernizr[l[0]]instanceof Boolean||(Modernizr[l[0]]=new Boolean(Modernizr[l[0]])),Modernizr[l[0]][l[1]]=t),s.push((t?"":"no-")+l.join("-"))}}function a(e){var n=u.className,A=Modernizr._config.classPrefix||"";if(c&&(n=n.baseVal),Modernizr._config.enableJSClass){var o=new RegExp("(^|\\s)"+A+"no-js(\\s|$)");n=n.replace(o,"$1"+A+"js$2")}Modernizr._config.enableClasses&&(n+=" "+A+e.join(" "+A),c?u.className.baseVal=n:u.className=n)}function i(e,n){if("object"==typeof e)for(var A in e)f(e,A)&&i(A,e[A]);else{e=e.toLowerCase();var o=e.split("."),t=Modernizr[o[0]];if(2==o.length&&(t=t[o[1]]),"undefined"!=typeof t)return Modernizr;n="function"==typeof n?n():n,1==o.length?Modernizr[o[0]]=n:(!Modernizr[o[0]]||Modernizr[o[0]]instanceof Boolean||(Modernizr[o[0]]=new Boolean(Modernizr[o[0]])),Modernizr[o[0]][o[1]]=n),a([(n&&0!=n?"":"no-")+o.join("-")]),Modernizr._trigger(e,n)}return Modernizr}var s=[],r=[],l={_version:"3.5.0",_config:{classPrefix:"",enableClasses:!0,enableJSClass:!0,usePrefixes:!0},_q:[],on:function(e,n){var A=this;setTimeout(function(){n(A[e])},0)},addTest:function(e,n,A){r.push({name:e,fn:n,options:A})},addAsyncTest:function(e){r.push({name:null,fn:e})}},Modernizr=function(){};Modernizr.prototype=l,Modernizr=new Modernizr;var f,u=n.documentElement,c="svg"===u.nodeName.toLowerCase();!function(){var e={}.hasOwnProperty;f=o(e,"undefined")||o(e.call,"undefined")?function(e,n){return n in e&&o(e.constructor.prototype[n],"undefined")}:function(n,A){return e.call(n,A)}}(),l._l={},l.on=function(e,n){this._l[e]||(this._l[e]=[]),this._l[e].push(n),Modernizr.hasOwnProperty(e)&&setTimeout(function(){Modernizr._trigger(e,Modernizr[e])},0)},l._trigger=function(e,n){if(this._l[e]){var A=this._l[e];setTimeout(function(){var e,o;for(e=0;e<A.length;e++)(o=A[e])(n)},0),delete this._l[e]}},Modernizr._q.push(function(){l.addTest=i}),Modernizr.addAsyncTest(function(){function e(e,n,A){function o(n){var o=n&&"load"===n.type?1==t.width:!1,a="webp"===e;i(e,a&&o?new Boolean(o):o),A&&A(n)}var t=new Image;t.onerror=o,t.onload=o,t.src=n}var n=[{uri:"data:image/webp;base64,UklGRiQAAABXRUJQVlA4IBgAAAAwAQCdASoBAAEAAwA0JaQAA3AA/vuUAAA=",name:"webp"},{uri:"data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAABBxAR/Q9ERP8DAABWUDggGAAAADABAJ0BKgEAAQADADQlpAADcAD++/1QAA==",name:"webp.alpha"},{uri:"data:image/webp;base64,UklGRlIAAABXRUJQVlA4WAoAAAASAAAAAAAAAAAAQU5JTQYAAAD/////AABBTk1GJgAAAAAAAAAAAAAAAAAAAGQAAABWUDhMDQAAAC8AAAAQBxAREYiI/gcA",name:"webp.animation"},{uri:"data:image/webp;base64,UklGRh4AAABXRUJQVlA4TBEAAAAvAAAAAAfQ//73v/+BiOh/AAA=",name:"webp.lossless"}],A=n.shift();e(A.name,A.uri,function(A){if(A&&"load"===A.type)for(var o=0;o<n.length;o++)e(n[o].name,n[o].uri)})}),t(),a(s),delete l.addTest,delete l.addAsyncTest;for(var p=0;p<Modernizr._q.length;p++)Modernizr._q[p]();e.Modernizr=Modernizr}(window,document);
    };

    return new FeatureDetector();

})(jQuery);


HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.Input = (function ($) {

    function Input() {
        $('form input, form select').on('invalid', function (e) {
            this.invalidMessage(e.target);
        }.bind(this));

        $('form').on('submit', function (e) {
            var isValid = this.validateDataRequire(e.target);

            if (!isValid) {
                e.preventDefault();
                return false;
            }

            return true;
        }.bind(this));
    }

    Input.prototype.invalidMessage = function (element) {
        var $target = $(element);
        var message = $target.attr('data-invalid-message');

        if (message) {
            element.setCustomValidity(message);
        }

        return false;
    };

    Input.prototype.validateDataRequire = function(form) {
        var $form = $(form);
        var $checkboxes = $form.find('input[type="checkbox"][data-require]');
        var checkboxNames = [];
        var isValid = true;

        $('input[type="checkbox"][data-require]').on('change', function (e) {
            e.stopPropagation();
            $form.find('.checkbox-invalid-msg').remove();
        });

        $checkboxes.each(function (index, element) {
            if (checkboxNames.indexOf($(this).attr('name')) > -1) {
                return;
            }

            checkboxNames.push($(this).attr('name'));
        });

        $.each(checkboxNames, function (index, name) {
            if ($form.find('input[type="checkbox"][name="' + name + '"][data-require]:checked').length > 0) {
                return;
            }

            $parent = $form.find('input[type="checkbox"][name="' + name + '"][data-require]').first().parents('.form-group');
            $parent.append('<div class="checkbox-invalid-msg text-danger text-sm" aria-live="polite">Select at least one option</div>');
            isValid = false;
        });

        return isValid;
    };

    return new Input();

})(jQuery);

//
// @name Local link
// @description  Finds link items with outbound links and gives them outbound class
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.LocalLink = (function ($) {

    function LocalLink() {
        $(document).ready(function () {
            var hostname = new RegExp(location.host);

            $('a[href].link-item:not(.link-item-outbound):not(.link-unavailable):not([href^="javascript:"]):not([href="#"])').each(function () {
                var url = $(this).attr('href');
                if (hostname.test(url)) {
                    return;
                }

                $(this).addClass('link-item-outbound');
            });
        });
    }

    return new LocalLink();

})(jQuery);


HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.LocalStorageReferer = (function ($) {
    
    var refUrlStorageHistory;
    
    /**
     * Create Local Storage.
     * @author Johan Silvergrund
     * @constructor
     * @this {LocalStorageReferer}
     */
    function LocalStorageReferer() {
        if (typeof(Storage) !== 'undefined') {
            this.setStorage(); 
        }    
    };


    /**
     * Fetches url parameter
     * @author Johan Silvergrund
     * @this {getUrlParameter}
     * @param string sParam
     */
    LocalStorageReferer.prototype.getUrlParameter = function getUrlParameter(sParam) {
        var sPageURL = decodeURIComponent(window.location.search.substring(1)),
            sURLVariables = sPageURL.split('&'),
            sParameterName,
            i;
    
        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split('=');
    
            if (sParameterName[0] === sParam) {
                return sParameterName[1] === undefined ? true : sParameterName[1];
            }
        }
    };
    
    /**
     * Check local storage
     * @author Johan Silvergrund
     * @this {checkStorage}
     * @param {string} storageType
     * @return {string} url
     */
    LocalStorageReferer.prototype.checkStorage = function(storageType) {
        return localStorage.getItem(storageType);
    };    
    

    /**
     * Creates a Local storage
     * @author Johan Silvergrund
     * @this {setStorage}
     */
    LocalStorageReferer.prototype.setStorage = function() {
        var storeHistory = this.checkStorage('refUrlStorage');
        if (storeHistory != window.location.href) {
            if (this.getUrlParameter('modularityForm')) {
                refUrlStorageHistory = localStorage.setItem('refUrlStorageHistory', decodeURIComponent(this.getUrlParameter('modularityForm')));
                refUrlStorage = localStorage.setItem('refUrlStorageHistory', decodeURIComponent(this.getUrlParameter('modularityReferrer')));
            }
            else {
                refUrlStorageHistory = localStorage.setItem('refUrlStorageHistory', storeHistory );
                refUrlStorage = localStorage.setItem('refUrlStorage', window.location.href );
            }     
        }    
        
        this.addStorageRefererToDoom();      
    };
    

    /**
     * Adding referer URL to doom
     * @author Johan Silvergrund
     * @this {addStorageRefererToDoom}
     */
    LocalStorageReferer.prototype.addStorageRefererToDoom = function() {
        if ($('#modularity-form-history').length !== 0) {
            $('#modularity-form-history').val(this.checkStorage('refUrlStorageHistory'));
            $('#modularity-form-url').val(this.checkStorage('refUrlStorage'));
        } 
    };    

    return new LocalStorageReferer();

})(jQuery);
//
// @name Modal
// @description  Prevent scrolling when modal is open (or #modal-* exists in url)
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Prompt = HelsingborgPrime.Prompt || {};

HelsingborgPrime.Prompt.RevealAnimation = (function ($) {
      var $window         = $(window),
      win_height_padded   = $window.outerHeight(),
      targetWrapper       = '.js-reveal-animation',
      target,
      scrolled        = $window.scrollTop(),
      animationTarget;

    function RevealAnimation() {
      this.init();
    }

    RevealAnimation.prototype.init = function () {
      $( document ).ready(function() {
          this.revealOnScroll();
      }.bind(this));

      $window.on('scroll', this.revealOnScroll);
    };

    RevealAnimation.prototype.revealOnScroll = function () {
        scrolled        = $window.scrollTop();

        $(targetWrapper + ":not(.animated)").each(function() {

        if(!$(this).attr("data-animation")) {
          return;
        }

        animationTarget   = $(this).offset().top,
        animationOffset       = 0.4;

        if (scrolled >= animationTarget - win_height_padded + (win_height_padded * animationOffset)) {
          //console.log(this);
          $(this).addClass($(this).attr("data-animation"));
        }
      });
    };

    return new RevealAnimation();

})(jQuery);

HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.ScrollElevator = (function ($) {

    var elevatorSelector = '.scroll-elevator-toggle';
    var scrollPosAdjuster = -50;
    var scrolSpeed = 500;

    function ScrollElevator() {
        if ($(elevatorSelector).length === 0) {
            return;
        }

        var $elevatorSelector = $(elevatorSelector);

        $(document).on('click', '[href="#elevator-top"]', function (e) {
            e.preventDefault();
            $(this).blur();

            $('html, body').animate({
                scrollTop: 0
            }, scrolSpeed);
        });

        this.appendElevator($elevatorSelector);
        this.scrollSpy($elevatorSelector);
    }

    ScrollElevator.prototype.appendElevator = function($elevatorTarget) {
        var scrollText = 'Scroll up';
        var tooltipText = '';
        var tooltipPosition = '';

        var $html = $('<div class="scroll-elevator"><a href="#elevator-top"><i></i><span></span></a></div>');

        if (HelsingborgPrime.Args.get('scrollElevator.cta')) {
            scrollText = HelsingborgPrime.Args.get('scrollElevator.cta');
            $html.find('a span').html(scrollText);
        }

        if (HelsingborgPrime.Args.get('scrollElevator.tooltip')) {
            tooltipText = HelsingborgPrime.Args.get('scrollElevator.tooltip');
            $html.find('a').attr('data-tooltip', tooltipText);
        }

        if (HelsingborgPrime.Args.get('scrollElevator.tooltipPosition')) {
            tooltipPosition = HelsingborgPrime.Args.get('scrollElevator.tooltipPosition');
            $html.find('a').attr(tooltipPosition, '');
        }

        $html.appendTo($elevatorTarget);
    };

    ScrollElevator.prototype.scrollSpy = function($elevatorTarget) {
        var $document = $(document);
        var $window = $(window);

        $document.on('scroll load', function () {
            var scrollTarget = $elevatorTarget.position().top + $elevatorTarget.height();
            var scrollPos = $document.scrollTop() + $window.height() + scrollPosAdjuster;

            if (scrollPos < scrollTarget) {
                this.hideElevator();
                return;
            }

            this.showElevator();
            return;
        }.bind(this));
    };

    ScrollElevator.prototype.showElevator = function() {
        $('body').addClass('show-scroll-elevator');
    };

    ScrollElevator.prototype.hideElevator = function() {
        $('body').removeClass('show-scroll-elevator');
    };

    return new ScrollElevator();

})(jQuery);

//
// @name Local link
// @description  Finds link items with outbound links and gives them outbound class
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.StickyScroll = (function ($) {

    var _stickyElements = [];
    var _isFloatingClass = 'is-sticky-scroll';

    function StickyScroll() {
        $(document).ready(function () {
            this.init();
        }.bind(this));
    }

    StickyScroll.prototype.init = function() {
        var $elements = $('.sticky-scroll');

        $elements.each(function (index, element) {
            var $element = $(element);

            _stickyElements.push({
                element: $element,
                offsetTop: $element.offset().top
            })
        });

        $(window).on('scroll', function () {
            this.scrolling();
        }.bind(this));

        this.scrolling();
    };

    /**
     * Runs when scrolling
     * @return {void}
     */
    StickyScroll.prototype.scrolling = function() {
        var scrollOffset = $(window).scrollTop();

        if ($('body').hasClass('admin-bar')) {
            scrollOffset += 32;

            if ($(window).width() < 783) {
                scrollOffset += 14;
            }
        }

        $.each(_stickyElements, function (index, item) {
            if (scrollOffset > item.offsetTop) {
                return this.stick(item.element);
            }

            return this.unstick(item.element);
        }.bind(this));
    };

    /**
     * Makes a element sticky
     * @param  {object} $element jQuery element
     * @return {bool}
     */
    StickyScroll.prototype.stick = function($element) {
        if ($element.hasClass(_isFloatingClass)) {
            return;
        }

        if (!$element.hasClass('navbar-transparent')) {
            this.addAnchor($element);
        }

        $element.addClass(_isFloatingClass);
        return true;
    };

    /**
     * Makes a element non-sticky
     * @param  {object} $element jQuery element
     * @return {bool}
     */
    StickyScroll.prototype.unstick = function($element) {
        if (!$element.hasClass(_isFloatingClass)) {
            return;
        }

        if (!$element.hasClass('navbar-transparent')) {
            this.removeAnchor($element);
        }

        $element.removeClass(_isFloatingClass);
        return true;
    };

    StickyScroll.prototype.addAnchor = function($element) {
        $('<div class="sticky-scroll-anchor"></div>').height($element.outerHeight()).insertBefore($element);
        return true;
    };

    StickyScroll.prototype.removeAnchor = function($element) {
        $element.prev('.sticky-scroll-anchor').remove();
        return true;
    };

    return new StickyScroll();

})(jQuery);

HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.TableFilter = (function ($) {

    function TableFilter() {
        $('[data-table-filter]').each(function (index, element) {
            this.init(element);
        }.bind(this));
    }

    TableFilter.prototype.init = function(element) {
        var $list = $(element);
        var listId = $list.attr('data-table-filter');
        var $input = $('[data-table-filter-input="' + listId + '"]');

        $input.on('input', function (e) {
            $list.find('[data-table-filter-empty]').remove();

            $list.find('tbody tr:not([data-table-filter-exclude]):icontains(' + $input.val() + ')').show();
            $list.find('tbody tr:not([data-table-filter-exclude]):not(:icontains(' + $input.val() + '))').hide();

            if ($list.find('tbody tr:not([data-table-filter-exclude]):visible').length === 0 && $list.find('[data-table-filter-empty]').length === 0) {
                $list.find('tbody tr:not([data-table-filter-exclude]):first').before('<tr data-table-filter-empty><td colspan="50">' + HelsingborgPrime.Args.get('tableFilter.empty') + '</td></tr>')
            }
        });
    };

    return new TableFilter();

})(jQuery);

HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.Toggle = (function ($) {

    function Toggle() {
        $('[data-toggle]').on('click', function (e) {
            var toggleTarget = $(this).attr('data-toggle');
            var toggleText = $(this).attr('data-toggle-text');
            var toggleClass = $(this).attr('data-toggle-class');

            // Toggle the target
            var $toggleTarget = $(toggleTarget);
            $toggleTarget.slideToggle(200);

            // Switch text
            $(this).attr('data-toggle-text', $(this).text());
            $(this).text(toggleText);

            // Switch class
            $(this).attr('data-toggle-class', $(this).attr('class'));
            $(this).attr('class', toggleClass);
        });
    }

    return new Toggle();

})(jQuery);

HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.ToggleSubmenuItems = (function ($) {

    function ToggleSubmenuItems() {
        this.init();
    }

    ToggleSubmenuItems.prototype.init = function () {
        var self = this;
        $(document).on('click', 'button[data-load-submenu]', function(e) {
            e.preventDefault();

            if (!self.useAjax(this)) {
                self.toggleSibling(this);
            } else {
                self.ajaxLoadItems(this);
                self.toggleSibling(this);
            }
        });
    };

    ToggleSubmenuItems.prototype.useAjax = function (target) {
        if ($(target).closest('li').first().children("ul").length) {
            return false;
        }

        return true;
    };

    ToggleSubmenuItems.prototype.ajaxLoadItems = function (target) {
        var markup = '';
        var parentId = this.getItemId(target);

        if(typeof parentId == 'undefined') {
            window.location.href = $(target).siblings("a").attr('href');
            return false;
        }

        $(target).closest('li').first().addClass('is-loading');

        $.ajax({
            url: HbgPrimeArgs.api.root + 'municipio/v1/navigation/' + parentId,
            method: 'GET',
            beforeSend: function (xhr) {
                xhr.setRequestHeader('X-WP-Nonce', HbgPrimeArgs.api.nonce);
            }
        }).done(function (response) {
            if (response.length !== "") {
                $(target).closest('li').first().append(response);
                $(target).siblings('.sub-menu');
            } else {
                window.location.href = $(target).attr('href');
            }

            $(target).closest('li').first().removeClass('is-loading');
        }.bind(target)).fail(function () {
            window.location.href = $(target).attr('href');
        }.bind(target));
    };

    ToggleSubmenuItems.prototype.getItemId = function (target) {
        return $(target).data('load-submenu');
    };

    ToggleSubmenuItems.prototype.toggleSibling = function (target) {
        $(target).closest('li').first().toggleClass('is-expanded');
    };

    return new ToggleSubmenuItems();

})(jQuery);

//
// @name Menu
// @description  Function for closing the menu (cannot be done with just :target selector)
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.Datepicker = (function ($) {

    function Datepicker() {
        this.init();
    }

    Datepicker.prototype.init = function () {
        // Single date
        $('.datepicker').datepicker({
            dateFormat: 'yy-mm-dd',
            firstDay: 1,
            showOtherMonths: true,
            selectOtherMonths: true
        });

        // Date range
        $('.datepicker-range.datepicker-range-from').datepicker({
            dateFormat: 'yy-mm-dd',
            firstDay: 1,
            showOtherMonths: true,
            selectOtherMonths: true,
            onClose: function(selectedDate) {
                $('.datepicker-range.datepicker-range-to').datepicker('option', 'minDate', selectedDate);
            }
        });

        $('.datepicker-range.datepicker-range-to').datepicker({
            dateFormat: 'yy-mm-dd',
            firstDay: 1,
            showOtherMonths: true,
            selectOtherMonths: true,
            onClose: function(selectedDate) {
                $('.datepicker-range.datepicker-range-from').datepicker('option', 'maxDate', selectedDate);
            }
        });
    };

    return new Datepicker();

})(jQuery);

/* Datepicker language */
(function(factory) {
    if (typeof define === "function" && define.amd) {
        define(["../widgets/datepicker"], factory);
    } else {
        factory( jQuery.datepicker );
    }
}(function(datepicker) {
    datepicker.regional.sv = {
        closeText: "Stäng",
        prevText: "&#xAB;Förra",
        nextText: "Nästa&#xBB;",
        currentText: "Idag",
        monthNames: [ "Januari","Februari","Mars","April","Maj","Juni",
        "Juli","Augusti","September","Oktober","November","December" ],
        monthNamesShort: [ "Jan","Feb","Mar","Apr","Maj","Jun",
        "Jul","Aug","Sep","Okt","Nov","Dec" ],
        dayNamesShort: [ "Sön","Mån","Tis","Ons","Tor","Fre","Lör" ],
        dayNames: [ "Söndag","Måndag","Tisdag","Onsdag","Torsdag","Fredag","Lördag" ],
        dayNamesMin: [ "Sö","Må","Ti","On","To","Fr","Lö" ],
        weekHeader: "Ve",
        dateFormat: "yy-mm-dd",
        firstDay: 1,
        isRTL: false,
        showMonthAfterYear: false,
        yearSuffix: "" };
    datepicker.setDefaults(datepicker.regional.sv);

    return datepicker.regional.sv;
}));

//
// @name EqualHeight
// @description  Sets element heights equally to the heighest item
//
// @markup
// <div class="grid" data-equal-container>
//     <div class="grid-md-6" data-equal-item>
//
//     </div>
//     <div class="grid-md-6" data-equal-item>
//
//     </div>
// </div>
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.EqualHeight = (function ($) {

    function EqualHeight() {
        // Initialize if flexbox not supported
        if (!this.supportsFlexbox()) {
            
            $(window).on('load', function () {
                this.init();

            }.bind(this));

            $(window).on('resize', function () {
                this.destroy();
                this.init();
            }.bind(this));
        }
    }

    /**
     * Check if browser supports flexbox
     * @return {boolean}
     */
    EqualHeight.prototype.supportsFlexbox = function () {
        if ($('html').hasClass('no-flexbox')) {
            return false;
        }

        return true;
    };

    /**
     * Resets heights to auto
     * @return {void}
     */
    EqualHeight.prototype.destroy = function () {
        $('[data-equal-container] [data-equal-item]').each(function (index, element) {
            $(element).css('height', 'auto');
        }.bind(this));
    };

    /**
     * Intializes equal height
     * @return {void}
     */
    EqualHeight.prototype.init = function () {
        $('[data-equal-container]').each(function (index, element) {
            var maxHeight = this.getMaxHeight(element);
            this.equalize(element, maxHeight);
        }.bind(this));
    };

    /**
     * Get the max height of the items
     * @param  {string} el The parent element
     * @return {integer}   The max height in pixels
     */
    EqualHeight.prototype.getMaxHeight = function (el) {
        var heights = [];

        $(el).find('[data-equal-item]').each(function (index, element) {
            heights.push($(element).outerHeight());
        }.bind(this));

        var maxHeight = Math.max.apply(null, heights);

        return maxHeight;
    };

    /**
     * Set the heights of all items to the max height
     * @param  {string}  parent    The parent element
     * @param  {integer} maxHeight The max height
     * @return {void}
     */
    EqualHeight.prototype.equalize = function(parent, maxHeight) {
        $(parent).find('[data-equal-item]').each(function (index, element) {
            $(element).css('height', maxHeight + 'px');
        }.bind(this));
    };

    return new EqualHeight();

})(jQuery);

//
// @name Menu
// @description  Function for closing the menu (cannot be done with just :target selector)
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.Menu = (function ($) {

    function Menu() {
    	this.init();
    }

    Menu.prototype.init = function () {
	    this.bindEvents();
    };

    Menu.prototype.toggleMenu = function(triggerBtn) {
        triggerBtn.toggleClass('open');

        var target = $(triggerBtn.data('target'));

        if (target.hasClass('nav-toggle-expand')) {
            target.slideToggle();
        } else {
            target.toggleClass('open');
        }

        $('body').toggleClass('mobile-menu-open');
    };

    Menu.prototype.bindEvents = function () {
        $('.menu-trigger').on('click', function (e) {
            e.preventDefault();
            this.toggleMenu($(e.target).closest('.menu-trigger'));
        }.bind(this));
    };

    return new Menu();

})(jQuery);

//
// @name Menu priority
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.MenuPriority = (function ($) {

    var $nav = null;
    var $btn = null;
    var $vlinks = null;
    var $hlinks = null;

    var availableSpace = 0;
    var breaks = [];
    var breakWasTwoOrMore = false;

    function MenuPriority() {
        if ($('.header-jumbo').length > 0 && !$('#main-menu').hasClass('nav-justify') && !$('.header-jumbo').hasClass('nav-no-overflow')) {
            this.init();
        }
    }

    MenuPriority.prototype.init = function () {
        $nav = $('#main-menu').parent('.nav-group-overflow');
        $vlinks = $('#main-menu');
        $hlinks = $nav.find('.nav-grouped-overflow');
        $btn = $nav.find('.dropdown-toggle');

        this.updateNavigation();

        $(window).on('resize', function (e) {
            this.updateNavigation();
        }.bind(this));
    };

    MenuPriority.prototype.updateNavigation = function () {
        availableSpace = $btn.is(':visible') ? $nav.parent().first().width() - ($btn.width() + parseFloat($nav.attr('data-btn-width'))) : $nav.parent().first().width();

        if (breaks.length == 1 && breakWasTwoOrMore === true) {
            availableSpace = $nav.parent().first().width();
            breakWasTwoOrMore= false;
        }

        // The visible list is overflowing the available space
        if ($vlinks.width() > 0 && $vlinks.width() > availableSpace) {

            // Record vlinks width
            breaks.push($vlinks.width());

            // Move last element to the grouped items
            $vlinks.children().last().prependTo($hlinks);
            $hlinks.removeClass('hidden');
            $btn.removeClass('hidden').attr('data-item-count', breaks.length);
        } else {

            // Check if there's space to move an item back to the nav
            if (availableSpace > breaks[breaks.length-1]) {
                $hlinks.children().first().appendTo($vlinks);
                breaks.pop();
                $btn.attr('data-item-count', breaks.length);
            }

            if (breaks.length < 1) {
                $hlinks.addClass('hidden');
                $btn.addClass('hidden').attr('data-item-count', breaks.length);
            }
        }

        if (breaks.length > 1) {
            breakWasTwoOrMore = true;
        }

        // Rerun if nav is still overflowing
        if ($nav.is(':visible') && $vlinks.width() > availableSpace && breaks.length > 0 && breaks.length < $vlinks.children('li').length) {
            this.updateNavigation();
        }
    };

    return new MenuPriority();

})(jQuery);

//
// @name Video Player
// @description  Video functionalty for vimeo and youtube.
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.Player = (function ($) {

    //Declarations
    var playerFirstInitYoutube = true; //Indicates wheter to load Youtube api or not.
    var playerFirstInitVimeo = true; //Indicates wheter to load Vimeo api or not.
    var playerFirstInitBambuser = true; //Indicates wheter to load Bambuser api or not.

    //Check for players, if exists; Run player script.
    function Player() {
        if ($(".player").length) {
            this.init();
        }
    }

    //Listen for play argument
    Player.prototype.init = function () {
        $(".player a").on('click', function (e) {
            this.initVideoPlayer($(e.target).closest('a'));
        }.bind(this));

        $(".player-playlist a").on('click', function (e) {
            e.preventDefault();
            this.switchVideo($(e.target).closest('a'));
        }.bind(this));
    };

    //Init player on start
    Player.prototype.initVideoPlayer = function(e) {
        var videoid = e.attr('data-video-id');
        var listid = e.attr('data-list-id');

        if (this.isNumeric(videoid)) {
            this.initVimeo(videoid, e);
        } else {
            if (listid) {
                this.initYoutube(videoid, e, listid);
            } else {
                this.initYoutube(videoid, e);
            }
        }
    };

    Player.prototype.initVimeo = function(videoid, target) {

        //Remove controls
        this.toggleControls(target);

        //Append player
        $(target).parent().append('<iframe src="//player.vimeo.com/video/' + videoid + '?portrait=0&color=333&autoplay=1" width="100%" height="100%" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');

        //Not first run anymore
        this.playerFirstInitVimeo = false;
    };

    Player.prototype.initYoutube = function(videoid, target, listid) {

        if (typeof listid === 'undefined') {
            listid = null;
        }

        //Remove controls
        this.toggleControls(target);

        //Append player
        if (listid) {
            $(target).parent().append('<iframe type="text/html" width="100%" height="100%"src="//www.youtube.com/embed/' + videoid + '?autoplay=1&autohide=1&cc_load_policy=0&enablejsapi=1&modestbranding=1&origin=styleguide.dev&showinfo=0&autohide=1&iv_load_policy=3&list=' + listid + '&rel=0" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
        } else {
            $(target).parent().append('<iframe type="text/html" width="100%" height="100%"src="//www.youtube.com/embed/' + videoid + '?autoplay=1&autohide=1&cc_load_policy=0&enablejsapi=1&modestbranding=1&origin=styleguide.dev&showinfo=0&autohide=1&iv_load_policy=3&rel=0" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');
        }

        //Not first run anymore
        this.playerFirstInitYoutube = false;
    };

    Player.prototype.initBambuser = function(videoid, target) {

        //Remove controls
        this.toggleControls(target);

        //Append player
        $(target).parent().append('<iframe type="text/html" width="100%" height="100%"src="//embed.bambuser.com/broadcast/' +videoid+ '?autoplay=1" frameborder="0" webkitallowfullscreen mozallowfullscreen allowfullscreen></iframe>');

        //Not first run anymore
        this.playerFirstInitBambuser = false;
    };

    Player.prototype.switchVideo = function(element) {
        var videoid = element.attr('data-video-id');
        var listid = element.attr('data-list-id');

        var $player = element.parents('.player-playlist').siblings('.player');
        var $iframe = $player.children('iframe');

        $player.find('a').hide();

        if (!$player.find('.loading').length) {
            $player.append('<div class="loading pos-absolute-center" style="width:300px;"><div></div><div></div><div></div><div></div></div>');
        }

        if (this.isNumeric(videoid)) {
            this.initVimeo(videoid, $player.children('a'));
        } else {
            if (listid) {
                this.initYoutube(videoid, $player.children('a'), listid);
            } else {
                this.initYoutube(videoid, $player.children('a'));
            }
        }

        $iframe.remove();
    };

    Player.prototype.toggleControls = function(target) {
        if (typeof target === 'undefined') {
            console.error('Could not start player. Wrapper not found.');
            return false;
        }

        target = target.parent();

        if (target.hasClass('is-playing')) {
            target.removeClass('is-playing');
            $("html").removeClass('video-is-playing');
            return true;
        }

        target.addClass('is-playing');
        $("html").addClass('video-is-playing');
        return true;
    };

    /**
     * Reset all players, or with target id.
     * @param  {object} target
     * @return {bool}
     */
    Player.prototype.resetPlayer = function(target) {
       if (typeof target !== 'undefined') {
            $('.player iframe').remove();
            $('.player').removeClass('is-playing');
            $('html').removeClass('video-is-playing');
            return false;
        }

        $('iframe', target).remove();
        target.removeClass('is-playing');
        $('html').removeClass('video-is-playing');
        return true;
    };

    Player.prototype.isNumeric = function(n) {
        return !isNaN(parseFloat(n)) && isFinite(n);
    };

    return new Player();

})($);

//
// @name EqualHeight
// @description  Sets element heights equally to the heighest item
//
// @markup
// <div class="grid" data-equal-container>
//     <div class="grid-md-6" data-equal-item>
//
//     </div>
//     <div class="grid-md-6" data-equal-item>
//
//     </div>
// </div>
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Helper = HelsingborgPrime.Helper || {};

HelsingborgPrime.Helper.Post = (function ($) {

    function Post() {
        this.bindEvents();
    }

    Post.prototype.bindEvents = function() {
        $(document).on('click', '.post-collapsed article', function (e) {
            $(e.target).closest('article').parents('.post-collapsed').addClass('post-expanded');
        }.bind(this));
    };

    return new Post();

})(jQuery);

HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.ScrollDot = HelsingborgPrime.ScrollDot || {};

HelsingborgPrime.ScrollDot.ClickJack = (function ($) {

    var ScrollDotTriggers = [
        '.scroll-dots li a'
    ];

    var ScrollDotTargets = [
        'section',
    ];

    var ScrollDotSettings = {
        scrollSpeed: 450,
        scrollOffset: 0
    };

    function ClickJack() {
        ScrollDotTriggers.forEach(function(element) {
            if($(element).length) {
                $(element).each(function(index,item) {
                    if(this.isAnchorLink($(item).attr('href')) && this.anchorLinkExists($(item).attr('href'))) {
                        this.bindScrollDot(item,$(item).attr('href'));
                    }
                }.bind(this));
            }
        }.bind(this));
    }

    ClickJack.prototype.isAnchorLink = function (href) {
        if(/^#/.test(href) === true && href.length > 1) {
            return true;
        } else {
            return false;
        }
    };

    ClickJack.prototype.anchorLinkExists = function (id) {
        var linkExist = false;
        ScrollDotTargets.forEach(function(element) {
            if($(element + id).length) {
               linkExist = true;
               return true;
            }
        }.bind(this));
        return linkExist;
    };

    ClickJack.prototype.bindScrollDot = function (trigger,target) {
        $(trigger).on('click',function(event){
            event.preventDefault();
            this.updateHash(target);
            var targetOffset = $(target).offset();
            $('html, body').animate({scrollTop: Math.abs(targetOffset.top -Math.abs(ScrollDotSettings.scrollOffset))}, ScrollDotSettings.scrollSpeed);
        }.bind(this));
    };

    ClickJack.prototype.updateHash = function(hash) {
        if(history.pushState) {
            if(hash === "" ) {
                history.pushState(null, null, "#");
            } else {
                history.pushState(null, null, hash);
            }
        } else {
            window.location.hash = hash;
        }
    }

    new ClickJack();

})(jQuery);

HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.ScrollDot = HelsingborgPrime.ScrollDot || {};

HelsingborgPrime.ScrollDot.Highlight = (function ($) {

    var ScrollTopValue = 0;

    var ScrollTopOffset = 0;

    var ScrollMenuWrapperActiveClass = 'current';

    var HighlightTrigger = "section.section-split, section.section-full, section.section-featured";

    var ScrollMenuWrapper = [
        '.scroll-dots'
    ];

    function Highlight() {
        ScrollTopValue = $(window).scrollTop();
        $(window).on('scroll', function (e) {
            var scrolledToItem = null;
            ScrollTopValue = $(window).scrollTop() + ScrollTopOffset + $("#site-header").outerHeight();
            $(HighlightTrigger).each(function (index,item) {
                if(ScrollTopValue >= $(item).offset().top) {
                    scrolledToItem = item;
                    return;
                }
            });
            this.cleanHighlight();
            this.highlightMenuItem("#" + $(scrolledToItem).attr('id'));
        }.bind(this));
    }

    Highlight.prototype.highlightMenuItem = function (id) {
        if(this.isAnchorLink(id) && this.anchorLinkExists(id)){
            this.addWrapperClass('is-active');
            ScrollMenuWrapper.forEach(function(element) {
                $("a[href='" + id + "']", element).addClass(ScrollMenuWrapperActiveClass);
            });
        }
    };

    Highlight.prototype.isAnchorLink = function (href) {
        if(/^#/.test(href) === true && href.length > 1) {
            return true;
        } else {
            return false;
        }
    };

    Highlight.prototype.anchorLinkExists = function (id) {
        var linkExist = false;
        ScrollMenuWrapper.forEach(function(element) {
            if($("a[href='" + id + "']",element).length) {
                linkExist = true;
                return true;
            }
        }.bind(this));
        return linkExist;
    };

    Highlight.prototype.cleanHighlight = function () {
        this.removeWrapperClass('is-active');
        ScrollMenuWrapper.forEach(function(element) {
            $("a",element).removeClass(ScrollMenuWrapperActiveClass);
        }.bind(this));
    };

    Highlight.prototype.addWrapperClass = function (c) {
        ScrollMenuWrapper.forEach(function(element) {
            if(!$(element).hasClass(c)) {
                $(element).addClass(c);
            }
        }.bind(this));
    };

    Highlight.prototype.removeWrapperClass = function (c) {
        ScrollMenuWrapper.forEach(function(element) {
            if($(element).hasClass(c)) {
                $(element).removeClass(c);
            }
        }.bind(this));
    };

    new Highlight();

})(jQuery);

/*!
 * Bez @VERSION
 * http://github.com/rdallasgray/bez
 *
 * A plugin to convert CSS3 cubic-bezier co-ordinates to jQuery-compatible easing functions
 *
 * With thanks to Nikolay Nemshilov for clarification on the cubic-bezier maths
 * See http://st-on-it.blogspot.com/2011/05/calculating-cubic-bezier-function.html
 *
 * Copyright @YEAR Robert Dallas Gray. All rights reserved.
 * Provided under the FreeBSD license: https://github.com/rdallasgray/bez/blob/master/LICENSE.txt
 */
(function(factory) {
  if (typeof exports === "object") {
    factory(require("jquery"));
  } else if (typeof define === "function" && define.amd) {
    define(["jquery"], factory);
  } else {
    factory(jQuery);
  }
}(function($) {
  $.extend({ bez: function(encodedFuncName, coOrdArray) {
    if ($.isArray(encodedFuncName)) {
      coOrdArray = encodedFuncName;
      encodedFuncName = 'bez_' + coOrdArray.join('_').replace(/\./g, 'p');
    }
    if (typeof $.easing[encodedFuncName] !== "function") {
      var polyBez = function(p1, p2) {
        var A = [null, null], B = [null, null], C = [null, null],
            bezCoOrd = function(t, ax) {
              C[ax] = 3 * p1[ax], B[ax] = 3 * (p2[ax] - p1[ax]) - C[ax], A[ax] = 1 - C[ax] - B[ax];
              return t * (C[ax] + t * (B[ax] + t * A[ax]));
            },
            xDeriv = function(t) {
              return C[0] + t * (2 * B[0] + 3 * A[0] * t);
            },
            xForT = function(t) {
              var x = t, i = 0, z;
              while (++i < 14) {
                z = bezCoOrd(x, 0) - t;
                if (Math.abs(z) < 1e-3) break;
                x -= z / xDeriv(x);
              }
              return x;
            };
        return function(t) {
          return bezCoOrd(xForT(t), 1);
        }
      };
      $.easing[encodedFuncName] = function(x, t, b, c, d) {
        return c * polyBez([coOrdArray[0], coOrdArray[1]], [coOrdArray[2], coOrdArray[3]])(t/d) + b;
      }
    }
    return encodedFuncName;
  }});
}));

//
// @name Cookie consent
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Prompt = HelsingborgPrime.Prompt || {};

HelsingborgPrime.Prompt.CookieConsent = (function ($) {

    var _cookieConsentVisible = false;
    var _useLocalStorage = true;
    var _animationSpeed = 1000;

    function CookieConsent() {
        this.init();
    }

    CookieConsent.prototype.init = function () {
        var showCookieConsent = (HelsingborgPrime.Args.get('cookieConsent.show')) ? HelsingborgPrime.Args.get('cookieConsent.show') : true;

        if (showCookieConsent && !this.hasAccepted()) {
            this.displayConsent();

            $(document).on('click', '[data-action="cookie-consent"]', function (e) {
                e.preventDefault();
                var btn = $(e.target).closest('button');
                this.accept();
            }.bind(this));
        }
    };

    CookieConsent.prototype.displayConsent = function() {
        var wrapper = $('body');

        if ($('#wrapper:first-child').length > 0) {
            wrapper = $('#wrapper:first-child');
        }

        var consentText = 'This website uses cookies to ensure you get the best experience browsing the website.';
        if (HelsingborgPrime.Args.get('cookieConsent.message')) {
            consentText = HelsingborgPrime.Args.get('cookieConsent.message') ? HelsingborgPrime.Args.get('cookieConsent.message') : 'This website is using cookies to give you the best experience possible.';
        }

        var buttonText = 'Got it';
        if (HelsingborgPrime.Args.get('cookieConsent.button')) {
            buttonText = HelsingborgPrime.Args.get('cookieConsent.button') ? HelsingborgPrime.Args.get('cookieConsent.button') : 'Okey';
        }

        var placement = HelsingborgPrime.Args.get('cookieConsent.placement') ? HelsingborgPrime.Args.get('cookieConsent.placement') : null;

        wrapper.prepend('\
            <div id="cookie-consent" class="notice info gutter gutter-vertical ' + placement + '" style="display:none;">\
                <div class="container"><div class="grid grid-table-md grid-va-middle">\
                    <div class="grid-fit-content"><i class="pricon pricon-info-o"></i></div>\
                    <div class="grid-auto">' + consentText + '</div>\
                    <div class="grid-fit-content text-right-md text-right-lg"><button class="btn btn-primary" data-action="cookie-consent">' + buttonText + '</button></div>\
                </div></div>\
            </div>\
        ');

        $('#cookie-consent').show();
        _cookieConsentVisible = true;
    };

    CookieConsent.prototype.hasAccepted = function() {
        if (_useLocalStorage) {
            return window.localStorage.getItem('cookie-consent');
        } else {
            return HelsingborgPrime.Helper.Cookie.check('cookie-consent', true);
        }
    };

    CookieConsent.prototype.accept = function() {
        $('#cookie-consent').remove();
        _cookieConsentVisible = false;

        if (_useLocalStorage) {
            try {
                window.localStorage.setItem('cookie-consent', true);
                return true;
            } catch(e) {
                return false;
            }
        } else {
            HelsingborgPrime.Helper.Cookie.set('cookie-consent', true, 60);
        }
    };

    return new CookieConsent();

})(jQuery);

//
// @name Modal
// @description  Prevent scrolling when modal is open (or #modal-* exists in url)
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Prompt = HelsingborgPrime.Prompt || {};

HelsingborgPrime.Prompt.ModalLimit = (function ($) {

    function ModalLimit() {
    	this.init();

        $('[data-action="modal-close"]').on('click', function (e) {
            $(e.target).parents('.modal').removeClass('modal-open').hide();
            $('html').removeClass('overflow-hidden');
            $('body').removeClass('overflow-hidden');
        });
    }

    ModalLimit.prototype.init = function () {
	    this.toggleModalClass();

        $(window).bind('hashchange', function() {
			this.toggleModalClass();
		}.bind(this));

        $('.modal a[href="#close"]').on('click', function (e) {
            $('html').removeClass('overflow-hidden');
            $('body').removeClass('overflow-hidden');
        });
    };

    ModalLimit.prototype.toggleModalClass = function(){
	    if (window.location.hash.indexOf('modal-') > 0 && $(window.location.hash).length > 0) {
			$('html').addClass('overflow-hidden').trigger('openModal');
		} else {
			$('html').removeClass('overflow-hidden').trigger('closeModal');
            $('body').removeClass('overflow-hidden');
		}
    };

    return new ModalLimit();

})(jQuery);

//
// @name Search top
// @description  Open the top search
//
HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Prompt = HelsingborgPrime.Prompt || {};

HelsingborgPrime.Prompt.SearchTop = (function ($) {

    function SearchTop() {
        this.bindEvents();
    }

    SearchTop.prototype.bindEvents = function () {
        $('.toggle-search-top').on('click', function (e) {
            this.toggle(e);
        }.bind(this));
    };

    SearchTop.prototype.toggle = function (e) {
        e.preventDefault();
        $('.search-top').slideToggle(300);
        $('.search-top').find('input[type=search]').focus();
    };

    return new SearchTop();

})(jQuery);

HelsingborgPrime = HelsingborgPrime || {};
HelsingborgPrime.Prompt = HelsingborgPrime.Prompt || {};

HelsingborgPrime.Prompt.Share = (function ($) {

    function Share() {
        $(function(){

            this.handleEvents();

        }.bind(this));
    }

    Share.prototype.openPopup = function(element) {
        // Width and height of the popup
        var width = 626;
        var height = 305;

        // Gets the href from the button/link
        var url = $(element).closest('a').attr('href');

        // Calculate popup position
        var leftPosition = (window.screen.width / 2) - ((width / 2) + 10);
        var topPosition = (window.screen.height / 2) - ((height / 2) + 50);

        // Popup window features
        var windowFeatures = "status=no,height=" + height + ",width=" + width + ",resizable=no,left=" + leftPosition + ",top=" + topPosition + ",screenX=" + leftPosition + ",screenY=" + topPosition + ",toolbar=no,menubar=no,scrollbars=no,location=no,directories=no";

        // Open popup
        window.open(url, 'Share', windowFeatures);
    }

    /**
     * Keeps track of events
     * @return {void}
     */
    Share.prototype.handleEvents = function() {

        $(document).on('click', '[data-action="share-popup"]', function (e) {
            e.preventDefault();
            this.openPopup(e.target);
        }.bind(this));

    }

    return new Share();

})(jQuery);

//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInBhY2tlcnkucGtnZC5qcyIsImpxdWVyeS5taW4uanMiLCJyZWxlYXNlLmpzIiwid2Vha21hcC5taW4uanMiLCJoeXBlcmZvcm0ubWluLmpzIiwiZmxpY2tpdHkucGtnZC5taW4uanMiLCJhcHAuanMiLCJhcmdzLmpzIiwiY29tcG9uZW50L0dhbGxlcnlQb3B1cC5qcyIsImNvbXBvbmVudC9JbWFnZVVwbG9hZC5qcyIsImNvbXBvbmVudC9UYWdNYW5hZ2VyLmpzIiwiY29tcG9uZW50L2FjY29yZGlvbi5qcyIsImNvbXBvbmVudC9hdWRpb1BsYXllci5qcyIsImNvbXBvbmVudC9idXJnZXIuanMiLCJjb21wb25lbnQvZHJvcGRvd24uanMiLCJjb21wb25lbnQvZmlsZS5qcyIsImNvbXBvbmVudC9zbGlkZXIuanMiLCJoZWxwZXIvQ29va2llLmpzIiwiaGVscGVyL0ZlYXR1cmVEZXRlY3Rvci5qcyIsImhlbHBlci9JbnB1dC5qcyIsImhlbHBlci9Mb2NhbExpbmsuanMiLCJoZWxwZXIvTG9jYWxTdG9yYWdlUmVmZXJlci5qcyIsImhlbHBlci9SZXZlYWxBbmltYXRpb24uanMiLCJoZWxwZXIvU2Nyb2xsRWxldmF0b3IuanMiLCJoZWxwZXIvU3RpY2t5U2Nyb2xsLmpzIiwiaGVscGVyL1RhYmxlRmlsdGVyLmpzIiwiaGVscGVyL1RvZ2dsZS5qcyIsImhlbHBlci9Ub2dnbGVTdWJtZW51SXRlbXMuanMiLCJoZWxwZXIvZGF0ZXBpY2tlci5qcyIsImhlbHBlci9lcXVhbEhlaWdodC5qcyIsImhlbHBlci9tZW51LmpzIiwiaGVscGVyL21lbnVQcmlvcml0eS5qcyIsImhlbHBlci9wbGF5ZXIuanMiLCJoZWxwZXIvcG9zdC5qcyIsImhlbHBlci9zY3JvbGxEb3RDbGljay5qcyIsImhlbHBlci9zY3JvbGxEb3RIaWdobGlnaHQuanMiLCJ2ZW5kb3IvcXViaWNCZWl6ZXIuanF1ZXJ5LmpzIiwicHJvbXB0L0Nvb2tpZUNvbnNlbnQuanMiLCJwcm9tcHQvTW9kYWxMaW1pdC5qcyIsInByb21wdC9TZWFyY2hUb3AuanMiLCJwcm9tcHQvc2hhcmUuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzcxR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ0pBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ1BBO0FBQ0E7QUFDQTtBQUNBO0FDSEE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNaQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3BJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN0Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2xJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pJQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUN2S0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNyRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFHQTtBQ0FBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQy9DQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3ZKQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM3RUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3RCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwRUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMzQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMxRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2pEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNuRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUdBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUMvQkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDOUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNwR0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUNsRkE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDcEtBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ2hDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDekVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FDdkZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQ3hEQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzFGQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUM1Q0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQzVCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJoYmctcHJpbWUuZGV2LmpzIiwic291cmNlc0NvbnRlbnQiOlsiLyohXG4gKiBQYWNrZXJ5IFBBQ0tBR0VEIHYyLjEuMlxuICogR2FwbGVzcywgZHJhZ2dhYmxlIGdyaWQgbGF5b3V0c1xuICpcbiAqIExpY2Vuc2VkIEdQTHYzIGZvciBvcGVuIHNvdXJjZSB1c2VcbiAqIG9yIFBhY2tlcnkgQ29tbWVyY2lhbCBMaWNlbnNlIGZvciBjb21tZXJjaWFsIHVzZVxuICpcbiAqIGh0dHA6Ly9wYWNrZXJ5Lm1ldGFmaXp6eS5jb1xuICogQ29weXJpZ2h0IDIwMTMtMjAxOCBNZXRhZml6enlcbiAqL1xuXG4vKipcbiAqIEJyaWRnZXQgbWFrZXMgalF1ZXJ5IHdpZGdldHNcbiAqIHYyLjAuMVxuICogTUlUIGxpY2Vuc2VcbiAqL1xuXG4vKiBqc2hpbnQgYnJvd3NlcjogdHJ1ZSwgc3RyaWN0OiB0cnVlLCB1bmRlZjogdHJ1ZSwgdW51c2VkOiB0cnVlICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qanNoaW50IHN0cmljdDogZmFsc2UgKi8gLyogZ2xvYmFscyBkZWZpbmUsIG1vZHVsZSwgcmVxdWlyZSAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggJ2pxdWVyeS1icmlkZ2V0L2pxdWVyeS1icmlkZ2V0JyxbICdqcXVlcnknIF0sIGZ1bmN0aW9uKCBqUXVlcnkgKSB7XG4gICAgICByZXR1cm4gZmFjdG9yeSggd2luZG93LCBqUXVlcnkgKTtcbiAgICB9KTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHJlcXVpcmUoJ2pxdWVyeScpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5qUXVlcnlCcmlkZ2V0ID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHdpbmRvdy5qUXVlcnlcbiAgICApO1xuICB9XG5cbn0oIHdpbmRvdywgZnVuY3Rpb24gZmFjdG9yeSggd2luZG93LCBqUXVlcnkgKSB7XG4ndXNlIHN0cmljdCc7XG5cbi8vIC0tLS0tIHV0aWxzIC0tLS0tIC8vXG5cbnZhciBhcnJheVNsaWNlID0gQXJyYXkucHJvdG90eXBlLnNsaWNlO1xuXG4vLyBoZWxwZXIgZnVuY3Rpb24gZm9yIGxvZ2dpbmcgZXJyb3JzXG4vLyAkLmVycm9yIGJyZWFrcyBqUXVlcnkgY2hhaW5pbmdcbnZhciBjb25zb2xlID0gd2luZG93LmNvbnNvbGU7XG52YXIgbG9nRXJyb3IgPSB0eXBlb2YgY29uc29sZSA9PSAndW5kZWZpbmVkJyA/IGZ1bmN0aW9uKCkge30gOlxuICBmdW5jdGlvbiggbWVzc2FnZSApIHtcbiAgICBjb25zb2xlLmVycm9yKCBtZXNzYWdlICk7XG4gIH07XG5cbi8vIC0tLS0tIGpRdWVyeUJyaWRnZXQgLS0tLS0gLy9cblxuZnVuY3Rpb24galF1ZXJ5QnJpZGdldCggbmFtZXNwYWNlLCBQbHVnaW5DbGFzcywgJCApIHtcbiAgJCA9ICQgfHwgalF1ZXJ5IHx8IHdpbmRvdy5qUXVlcnk7XG4gIGlmICggISQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gYWRkIG9wdGlvbiBtZXRob2QgLT4gJCgpLnBsdWdpbignb3B0aW9uJywgey4uLn0pXG4gIGlmICggIVBsdWdpbkNsYXNzLnByb3RvdHlwZS5vcHRpb24gKSB7XG4gICAgLy8gb3B0aW9uIHNldHRlclxuICAgIFBsdWdpbkNsYXNzLnByb3RvdHlwZS5vcHRpb24gPSBmdW5jdGlvbiggb3B0cyApIHtcbiAgICAgIC8vIGJhaWwgb3V0IGlmIG5vdCBhbiBvYmplY3RcbiAgICAgIGlmICggISQuaXNQbGFpbk9iamVjdCggb3B0cyApICl7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHRoaXMub3B0aW9ucyA9ICQuZXh0ZW5kKCB0cnVlLCB0aGlzLm9wdGlvbnMsIG9wdHMgKTtcbiAgICB9O1xuICB9XG5cbiAgLy8gbWFrZSBqUXVlcnkgcGx1Z2luXG4gICQuZm5bIG5hbWVzcGFjZSBdID0gZnVuY3Rpb24oIGFyZzAgLyosIGFyZzEgKi8gKSB7XG4gICAgaWYgKCB0eXBlb2YgYXJnMCA9PSAnc3RyaW5nJyApIHtcbiAgICAgIC8vIG1ldGhvZCBjYWxsICQoKS5wbHVnaW4oICdtZXRob2ROYW1lJywgeyBvcHRpb25zIH0gKVxuICAgICAgLy8gc2hpZnQgYXJndW1lbnRzIGJ5IDFcbiAgICAgIHZhciBhcmdzID0gYXJyYXlTbGljZS5jYWxsKCBhcmd1bWVudHMsIDEgKTtcbiAgICAgIHJldHVybiBtZXRob2RDYWxsKCB0aGlzLCBhcmcwLCBhcmdzICk7XG4gICAgfVxuICAgIC8vIGp1c3QgJCgpLnBsdWdpbih7IG9wdGlvbnMgfSlcbiAgICBwbGFpbkNhbGwoIHRoaXMsIGFyZzAgKTtcbiAgICByZXR1cm4gdGhpcztcbiAgfTtcblxuICAvLyAkKCkucGx1Z2luKCdtZXRob2ROYW1lJylcbiAgZnVuY3Rpb24gbWV0aG9kQ2FsbCggJGVsZW1zLCBtZXRob2ROYW1lLCBhcmdzICkge1xuICAgIHZhciByZXR1cm5WYWx1ZTtcbiAgICB2YXIgcGx1Z2luTWV0aG9kU3RyID0gJyQoKS4nICsgbmFtZXNwYWNlICsgJyhcIicgKyBtZXRob2ROYW1lICsgJ1wiKSc7XG5cbiAgICAkZWxlbXMuZWFjaCggZnVuY3Rpb24oIGksIGVsZW0gKSB7XG4gICAgICAvLyBnZXQgaW5zdGFuY2VcbiAgICAgIHZhciBpbnN0YW5jZSA9ICQuZGF0YSggZWxlbSwgbmFtZXNwYWNlICk7XG4gICAgICBpZiAoICFpbnN0YW5jZSApIHtcbiAgICAgICAgbG9nRXJyb3IoIG5hbWVzcGFjZSArICcgbm90IGluaXRpYWxpemVkLiBDYW5ub3QgY2FsbCBtZXRob2RzLCBpLmUuICcgK1xuICAgICAgICAgIHBsdWdpbk1ldGhvZFN0ciApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHZhciBtZXRob2QgPSBpbnN0YW5jZVsgbWV0aG9kTmFtZSBdO1xuICAgICAgaWYgKCAhbWV0aG9kIHx8IG1ldGhvZE5hbWUuY2hhckF0KDApID09ICdfJyApIHtcbiAgICAgICAgbG9nRXJyb3IoIHBsdWdpbk1ldGhvZFN0ciArICcgaXMgbm90IGEgdmFsaWQgbWV0aG9kJyApO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIGFwcGx5IG1ldGhvZCwgZ2V0IHJldHVybiB2YWx1ZVxuICAgICAgdmFyIHZhbHVlID0gbWV0aG9kLmFwcGx5KCBpbnN0YW5jZSwgYXJncyApO1xuICAgICAgLy8gc2V0IHJldHVybiB2YWx1ZSBpZiB2YWx1ZSBpcyByZXR1cm5lZCwgdXNlIG9ubHkgZmlyc3QgdmFsdWVcbiAgICAgIHJldHVyblZhbHVlID0gcmV0dXJuVmFsdWUgPT09IHVuZGVmaW5lZCA/IHZhbHVlIDogcmV0dXJuVmFsdWU7XG4gICAgfSk7XG5cbiAgICByZXR1cm4gcmV0dXJuVmFsdWUgIT09IHVuZGVmaW5lZCA/IHJldHVyblZhbHVlIDogJGVsZW1zO1xuICB9XG5cbiAgZnVuY3Rpb24gcGxhaW5DYWxsKCAkZWxlbXMsIG9wdGlvbnMgKSB7XG4gICAgJGVsZW1zLmVhY2goIGZ1bmN0aW9uKCBpLCBlbGVtICkge1xuICAgICAgdmFyIGluc3RhbmNlID0gJC5kYXRhKCBlbGVtLCBuYW1lc3BhY2UgKTtcbiAgICAgIGlmICggaW5zdGFuY2UgKSB7XG4gICAgICAgIC8vIHNldCBvcHRpb25zICYgaW5pdFxuICAgICAgICBpbnN0YW5jZS5vcHRpb24oIG9wdGlvbnMgKTtcbiAgICAgICAgaW5zdGFuY2UuX2luaXQoKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIC8vIGluaXRpYWxpemUgbmV3IGluc3RhbmNlXG4gICAgICAgIGluc3RhbmNlID0gbmV3IFBsdWdpbkNsYXNzKCBlbGVtLCBvcHRpb25zICk7XG4gICAgICAgICQuZGF0YSggZWxlbSwgbmFtZXNwYWNlLCBpbnN0YW5jZSApO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG5cbiAgdXBkYXRlSlF1ZXJ5KCAkICk7XG5cbn1cblxuLy8gLS0tLS0gdXBkYXRlSlF1ZXJ5IC0tLS0tIC8vXG5cbi8vIHNldCAkLmJyaWRnZXQgZm9yIHYxIGJhY2t3YXJkcyBjb21wYXRpYmlsaXR5XG5mdW5jdGlvbiB1cGRhdGVKUXVlcnkoICQgKSB7XG4gIGlmICggISQgfHwgKCAkICYmICQuYnJpZGdldCApICkge1xuICAgIHJldHVybjtcbiAgfVxuICAkLmJyaWRnZXQgPSBqUXVlcnlCcmlkZ2V0O1xufVxuXG51cGRhdGVKUXVlcnkoIGpRdWVyeSB8fCB3aW5kb3cualF1ZXJ5ICk7XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5yZXR1cm4galF1ZXJ5QnJpZGdldDtcblxufSkpO1xuXG4vKiFcbiAqIGdldFNpemUgdjIuMC4zXG4gKiBtZWFzdXJlIHNpemUgb2YgZWxlbWVudHNcbiAqIE1JVCBsaWNlbnNlXG4gKi9cblxuLyoganNoaW50IGJyb3dzZXI6IHRydWUsIHN0cmljdDogdHJ1ZSwgdW5kZWY6IHRydWUsIHVudXNlZDogdHJ1ZSAqL1xuLyogZ2xvYmFscyBjb25zb2xlOiBmYWxzZSAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8qIGpzaGludCBzdHJpY3Q6IGZhbHNlICovIC8qIGdsb2JhbHMgZGVmaW5lLCBtb2R1bGUgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoICdnZXQtc2l6ZS9nZXQtc2l6ZScsZmFjdG9yeSApO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuZ2V0U2l6ZSA9IGZhY3RvcnkoKTtcbiAgfVxuXG59KSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCkge1xuJ3VzZSBzdHJpY3QnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBoZWxwZXJzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8vIGdldCBhIG51bWJlciBmcm9tIGEgc3RyaW5nLCBub3QgYSBwZXJjZW50YWdlXG5mdW5jdGlvbiBnZXRTdHlsZVNpemUoIHZhbHVlICkge1xuICB2YXIgbnVtID0gcGFyc2VGbG9hdCggdmFsdWUgKTtcbiAgLy8gbm90IGEgcGVyY2VudCBsaWtlICcxMDAlJywgYW5kIGEgbnVtYmVyXG4gIHZhciBpc1ZhbGlkID0gdmFsdWUuaW5kZXhPZignJScpID09IC0xICYmICFpc05hTiggbnVtICk7XG4gIHJldHVybiBpc1ZhbGlkICYmIG51bTtcbn1cblxuZnVuY3Rpb24gbm9vcCgpIHt9XG5cbnZhciBsb2dFcnJvciA9IHR5cGVvZiBjb25zb2xlID09ICd1bmRlZmluZWQnID8gbm9vcCA6XG4gIGZ1bmN0aW9uKCBtZXNzYWdlICkge1xuICAgIGNvbnNvbGUuZXJyb3IoIG1lc3NhZ2UgKTtcbiAgfTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gbWVhc3VyZW1lbnRzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnZhciBtZWFzdXJlbWVudHMgPSBbXG4gICdwYWRkaW5nTGVmdCcsXG4gICdwYWRkaW5nUmlnaHQnLFxuICAncGFkZGluZ1RvcCcsXG4gICdwYWRkaW5nQm90dG9tJyxcbiAgJ21hcmdpbkxlZnQnLFxuICAnbWFyZ2luUmlnaHQnLFxuICAnbWFyZ2luVG9wJyxcbiAgJ21hcmdpbkJvdHRvbScsXG4gICdib3JkZXJMZWZ0V2lkdGgnLFxuICAnYm9yZGVyUmlnaHRXaWR0aCcsXG4gICdib3JkZXJUb3BXaWR0aCcsXG4gICdib3JkZXJCb3R0b21XaWR0aCdcbl07XG5cbnZhciBtZWFzdXJlbWVudHNMZW5ndGggPSBtZWFzdXJlbWVudHMubGVuZ3RoO1xuXG5mdW5jdGlvbiBnZXRaZXJvU2l6ZSgpIHtcbiAgdmFyIHNpemUgPSB7XG4gICAgd2lkdGg6IDAsXG4gICAgaGVpZ2h0OiAwLFxuICAgIGlubmVyV2lkdGg6IDAsXG4gICAgaW5uZXJIZWlnaHQ6IDAsXG4gICAgb3V0ZXJXaWR0aDogMCxcbiAgICBvdXRlckhlaWdodDogMFxuICB9O1xuICBmb3IgKCB2YXIgaT0wOyBpIDwgbWVhc3VyZW1lbnRzTGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIG1lYXN1cmVtZW50ID0gbWVhc3VyZW1lbnRzW2ldO1xuICAgIHNpemVbIG1lYXN1cmVtZW50IF0gPSAwO1xuICB9XG4gIHJldHVybiBzaXplO1xufVxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBnZXRTdHlsZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIGdldFN0eWxlLCBnZXQgc3R5bGUgb2YgZWxlbWVudCwgY2hlY2sgZm9yIEZpcmVmb3ggYnVnXG4gKiBodHRwczovL2J1Z3ppbGxhLm1vemlsbGEub3JnL3Nob3dfYnVnLmNnaT9pZD01NDgzOTdcbiAqL1xuZnVuY3Rpb24gZ2V0U3R5bGUoIGVsZW0gKSB7XG4gIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoIGVsZW0gKTtcbiAgaWYgKCAhc3R5bGUgKSB7XG4gICAgbG9nRXJyb3IoICdTdHlsZSByZXR1cm5lZCAnICsgc3R5bGUgK1xuICAgICAgJy4gQXJlIHlvdSBydW5uaW5nIHRoaXMgY29kZSBpbiBhIGhpZGRlbiBpZnJhbWUgb24gRmlyZWZveD8gJyArXG4gICAgICAnU2VlIGh0dHBzOi8vYml0Lmx5L2dldHNpemVidWcxJyApO1xuICB9XG4gIHJldHVybiBzdHlsZTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gc2V0dXAgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxudmFyIGlzU2V0dXAgPSBmYWxzZTtcblxudmFyIGlzQm94U2l6ZU91dGVyO1xuXG4vKipcbiAqIHNldHVwXG4gKiBjaGVjayBpc0JveFNpemVyT3V0ZXJcbiAqIGRvIG9uIGZpcnN0IGdldFNpemUoKSByYXRoZXIgdGhhbiBvbiBwYWdlIGxvYWQgZm9yIEZpcmVmb3ggYnVnXG4gKi9cbmZ1bmN0aW9uIHNldHVwKCkge1xuICAvLyBzZXR1cCBvbmNlXG4gIGlmICggaXNTZXR1cCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgaXNTZXR1cCA9IHRydWU7XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gYm94IHNpemluZyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4gIC8qKlxuICAgKiBDaHJvbWUgJiBTYWZhcmkgbWVhc3VyZSB0aGUgb3V0ZXItd2lkdGggb24gc3R5bGUud2lkdGggb24gYm9yZGVyLWJveCBlbGVtc1xuICAgKiBJRTExICYgRmlyZWZveDwyOSBtZWFzdXJlcyB0aGUgaW5uZXItd2lkdGhcbiAgICovXG4gIHZhciBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKTtcbiAgZGl2LnN0eWxlLndpZHRoID0gJzIwMHB4JztcbiAgZGl2LnN0eWxlLnBhZGRpbmcgPSAnMXB4IDJweCAzcHggNHB4JztcbiAgZGl2LnN0eWxlLmJvcmRlclN0eWxlID0gJ3NvbGlkJztcbiAgZGl2LnN0eWxlLmJvcmRlcldpZHRoID0gJzFweCAycHggM3B4IDRweCc7XG4gIGRpdi5zdHlsZS5ib3hTaXppbmcgPSAnYm9yZGVyLWJveCc7XG5cbiAgdmFyIGJvZHkgPSBkb2N1bWVudC5ib2R5IHx8IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudDtcbiAgYm9keS5hcHBlbmRDaGlsZCggZGl2ICk7XG4gIHZhciBzdHlsZSA9IGdldFN0eWxlKCBkaXYgKTtcbiAgLy8gcm91bmQgdmFsdWUgZm9yIGJyb3dzZXIgem9vbS4gZGVzYW5kcm8vbWFzb25yeSM5MjhcbiAgaXNCb3hTaXplT3V0ZXIgPSBNYXRoLnJvdW5kKCBnZXRTdHlsZVNpemUoIHN0eWxlLndpZHRoICkgKSA9PSAyMDA7XG4gIGdldFNpemUuaXNCb3hTaXplT3V0ZXIgPSBpc0JveFNpemVPdXRlcjtcblxuICBib2R5LnJlbW92ZUNoaWxkKCBkaXYgKTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZ2V0U2l6ZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5mdW5jdGlvbiBnZXRTaXplKCBlbGVtICkge1xuICBzZXR1cCgpO1xuXG4gIC8vIHVzZSBxdWVyeVNlbGV0b3IgaWYgZWxlbSBpcyBzdHJpbmdcbiAgaWYgKCB0eXBlb2YgZWxlbSA9PSAnc3RyaW5nJyApIHtcbiAgICBlbGVtID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvciggZWxlbSApO1xuICB9XG5cbiAgLy8gZG8gbm90IHByb2NlZWQgb24gbm9uLW9iamVjdHNcbiAgaWYgKCAhZWxlbSB8fCB0eXBlb2YgZWxlbSAhPSAnb2JqZWN0JyB8fCAhZWxlbS5ub2RlVHlwZSApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgc3R5bGUgPSBnZXRTdHlsZSggZWxlbSApO1xuXG4gIC8vIGlmIGhpZGRlbiwgZXZlcnl0aGluZyBpcyAwXG4gIGlmICggc3R5bGUuZGlzcGxheSA9PSAnbm9uZScgKSB7XG4gICAgcmV0dXJuIGdldFplcm9TaXplKCk7XG4gIH1cblxuICB2YXIgc2l6ZSA9IHt9O1xuICBzaXplLndpZHRoID0gZWxlbS5vZmZzZXRXaWR0aDtcbiAgc2l6ZS5oZWlnaHQgPSBlbGVtLm9mZnNldEhlaWdodDtcblxuICB2YXIgaXNCb3JkZXJCb3ggPSBzaXplLmlzQm9yZGVyQm94ID0gc3R5bGUuYm94U2l6aW5nID09ICdib3JkZXItYm94JztcblxuICAvLyBnZXQgYWxsIG1lYXN1cmVtZW50c1xuICBmb3IgKCB2YXIgaT0wOyBpIDwgbWVhc3VyZW1lbnRzTGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIG1lYXN1cmVtZW50ID0gbWVhc3VyZW1lbnRzW2ldO1xuICAgIHZhciB2YWx1ZSA9IHN0eWxlWyBtZWFzdXJlbWVudCBdO1xuICAgIHZhciBudW0gPSBwYXJzZUZsb2F0KCB2YWx1ZSApO1xuICAgIC8vIGFueSAnYXV0bycsICdtZWRpdW0nIHZhbHVlIHdpbGwgYmUgMFxuICAgIHNpemVbIG1lYXN1cmVtZW50IF0gPSAhaXNOYU4oIG51bSApID8gbnVtIDogMDtcbiAgfVxuXG4gIHZhciBwYWRkaW5nV2lkdGggPSBzaXplLnBhZGRpbmdMZWZ0ICsgc2l6ZS5wYWRkaW5nUmlnaHQ7XG4gIHZhciBwYWRkaW5nSGVpZ2h0ID0gc2l6ZS5wYWRkaW5nVG9wICsgc2l6ZS5wYWRkaW5nQm90dG9tO1xuICB2YXIgbWFyZ2luV2lkdGggPSBzaXplLm1hcmdpbkxlZnQgKyBzaXplLm1hcmdpblJpZ2h0O1xuICB2YXIgbWFyZ2luSGVpZ2h0ID0gc2l6ZS5tYXJnaW5Ub3AgKyBzaXplLm1hcmdpbkJvdHRvbTtcbiAgdmFyIGJvcmRlcldpZHRoID0gc2l6ZS5ib3JkZXJMZWZ0V2lkdGggKyBzaXplLmJvcmRlclJpZ2h0V2lkdGg7XG4gIHZhciBib3JkZXJIZWlnaHQgPSBzaXplLmJvcmRlclRvcFdpZHRoICsgc2l6ZS5ib3JkZXJCb3R0b21XaWR0aDtcblxuICB2YXIgaXNCb3JkZXJCb3hTaXplT3V0ZXIgPSBpc0JvcmRlckJveCAmJiBpc0JveFNpemVPdXRlcjtcblxuICAvLyBvdmVyd3JpdGUgd2lkdGggYW5kIGhlaWdodCBpZiB3ZSBjYW4gZ2V0IGl0IGZyb20gc3R5bGVcbiAgdmFyIHN0eWxlV2lkdGggPSBnZXRTdHlsZVNpemUoIHN0eWxlLndpZHRoICk7XG4gIGlmICggc3R5bGVXaWR0aCAhPT0gZmFsc2UgKSB7XG4gICAgc2l6ZS53aWR0aCA9IHN0eWxlV2lkdGggK1xuICAgICAgLy8gYWRkIHBhZGRpbmcgYW5kIGJvcmRlciB1bmxlc3MgaXQncyBhbHJlYWR5IGluY2x1ZGluZyBpdFxuICAgICAgKCBpc0JvcmRlckJveFNpemVPdXRlciA/IDAgOiBwYWRkaW5nV2lkdGggKyBib3JkZXJXaWR0aCApO1xuICB9XG5cbiAgdmFyIHN0eWxlSGVpZ2h0ID0gZ2V0U3R5bGVTaXplKCBzdHlsZS5oZWlnaHQgKTtcbiAgaWYgKCBzdHlsZUhlaWdodCAhPT0gZmFsc2UgKSB7XG4gICAgc2l6ZS5oZWlnaHQgPSBzdHlsZUhlaWdodCArXG4gICAgICAvLyBhZGQgcGFkZGluZyBhbmQgYm9yZGVyIHVubGVzcyBpdCdzIGFscmVhZHkgaW5jbHVkaW5nIGl0XG4gICAgICAoIGlzQm9yZGVyQm94U2l6ZU91dGVyID8gMCA6IHBhZGRpbmdIZWlnaHQgKyBib3JkZXJIZWlnaHQgKTtcbiAgfVxuXG4gIHNpemUuaW5uZXJXaWR0aCA9IHNpemUud2lkdGggLSAoIHBhZGRpbmdXaWR0aCArIGJvcmRlcldpZHRoICk7XG4gIHNpemUuaW5uZXJIZWlnaHQgPSBzaXplLmhlaWdodCAtICggcGFkZGluZ0hlaWdodCArIGJvcmRlckhlaWdodCApO1xuXG4gIHNpemUub3V0ZXJXaWR0aCA9IHNpemUud2lkdGggKyBtYXJnaW5XaWR0aDtcbiAgc2l6ZS5vdXRlckhlaWdodCA9IHNpemUuaGVpZ2h0ICsgbWFyZ2luSGVpZ2h0O1xuXG4gIHJldHVybiBzaXplO1xufVxuXG5yZXR1cm4gZ2V0U2l6ZTtcblxufSk7XG5cbi8qKlxuICogRXZFbWl0dGVyIHYxLjEuMFxuICogTGlsJyBldmVudCBlbWl0dGVyXG4gKiBNSVQgTGljZW5zZVxuICovXG5cbi8qIGpzaGludCB1bnVzZWQ6IHRydWUsIHVuZGVmOiB0cnVlLCBzdHJpY3Q6IHRydWUgKi9cblxuKCBmdW5jdGlvbiggZ2xvYmFsLCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi8gLyogZ2xvYmFscyBkZWZpbmUsIG1vZHVsZSwgd2luZG93ICovXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EIC0gUmVxdWlyZUpTXG4gICAgZGVmaW5lKCAnZXYtZW1pdHRlci9ldi1lbWl0dGVyJyxmYWN0b3J5ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlMgLSBCcm93c2VyaWZ5LCBXZWJwYWNrXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gQnJvd3NlciBnbG9iYWxzXG4gICAgZ2xvYmFsLkV2RW1pdHRlciA9IGZhY3RvcnkoKTtcbiAgfVxuXG59KCB0eXBlb2Ygd2luZG93ICE9ICd1bmRlZmluZWQnID8gd2luZG93IDogdGhpcywgZnVuY3Rpb24oKSB7XG5cblxuXG5mdW5jdGlvbiBFdkVtaXR0ZXIoKSB7fVxuXG52YXIgcHJvdG8gPSBFdkVtaXR0ZXIucHJvdG90eXBlO1xuXG5wcm90by5vbiA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGxpc3RlbmVyICkge1xuICBpZiAoICFldmVudE5hbWUgfHwgIWxpc3RlbmVyICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBzZXQgZXZlbnRzIGhhc2hcbiAgdmFyIGV2ZW50cyA9IHRoaXMuX2V2ZW50cyA9IHRoaXMuX2V2ZW50cyB8fCB7fTtcbiAgLy8gc2V0IGxpc3RlbmVycyBhcnJheVxuICB2YXIgbGlzdGVuZXJzID0gZXZlbnRzWyBldmVudE5hbWUgXSA9IGV2ZW50c1sgZXZlbnROYW1lIF0gfHwgW107XG4gIC8vIG9ubHkgYWRkIG9uY2VcbiAgaWYgKCBsaXN0ZW5lcnMuaW5kZXhPZiggbGlzdGVuZXIgKSA9PSAtMSApIHtcbiAgICBsaXN0ZW5lcnMucHVzaCggbGlzdGVuZXIgKTtcbiAgfVxuXG4gIHJldHVybiB0aGlzO1xufTtcblxucHJvdG8ub25jZSA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGxpc3RlbmVyICkge1xuICBpZiAoICFldmVudE5hbWUgfHwgIWxpc3RlbmVyICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBhZGQgZXZlbnRcbiAgdGhpcy5vbiggZXZlbnROYW1lLCBsaXN0ZW5lciApO1xuICAvLyBzZXQgb25jZSBmbGFnXG4gIC8vIHNldCBvbmNlRXZlbnRzIGhhc2hcbiAgdmFyIG9uY2VFdmVudHMgPSB0aGlzLl9vbmNlRXZlbnRzID0gdGhpcy5fb25jZUV2ZW50cyB8fCB7fTtcbiAgLy8gc2V0IG9uY2VMaXN0ZW5lcnMgb2JqZWN0XG4gIHZhciBvbmNlTGlzdGVuZXJzID0gb25jZUV2ZW50c1sgZXZlbnROYW1lIF0gPSBvbmNlRXZlbnRzWyBldmVudE5hbWUgXSB8fCB7fTtcbiAgLy8gc2V0IGZsYWdcbiAgb25jZUxpc3RlbmVyc1sgbGlzdGVuZXIgXSA9IHRydWU7XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5vZmYgPSBmdW5jdGlvbiggZXZlbnROYW1lLCBsaXN0ZW5lciApIHtcbiAgdmFyIGxpc3RlbmVycyA9IHRoaXMuX2V2ZW50cyAmJiB0aGlzLl9ldmVudHNbIGV2ZW50TmFtZSBdO1xuICBpZiAoICFsaXN0ZW5lcnMgfHwgIWxpc3RlbmVycy5sZW5ndGggKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBpbmRleCA9IGxpc3RlbmVycy5pbmRleE9mKCBsaXN0ZW5lciApO1xuICBpZiAoIGluZGV4ICE9IC0xICkge1xuICAgIGxpc3RlbmVycy5zcGxpY2UoIGluZGV4LCAxICk7XG4gIH1cblxuICByZXR1cm4gdGhpcztcbn07XG5cbnByb3RvLmVtaXRFdmVudCA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGFyZ3MgKSB7XG4gIHZhciBsaXN0ZW5lcnMgPSB0aGlzLl9ldmVudHMgJiYgdGhpcy5fZXZlbnRzWyBldmVudE5hbWUgXTtcbiAgaWYgKCAhbGlzdGVuZXJzIHx8ICFsaXN0ZW5lcnMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBjb3B5IG92ZXIgdG8gYXZvaWQgaW50ZXJmZXJlbmNlIGlmIC5vZmYoKSBpbiBsaXN0ZW5lclxuICBsaXN0ZW5lcnMgPSBsaXN0ZW5lcnMuc2xpY2UoMCk7XG4gIGFyZ3MgPSBhcmdzIHx8IFtdO1xuICAvLyBvbmNlIHN0dWZmXG4gIHZhciBvbmNlTGlzdGVuZXJzID0gdGhpcy5fb25jZUV2ZW50cyAmJiB0aGlzLl9vbmNlRXZlbnRzWyBldmVudE5hbWUgXTtcblxuICBmb3IgKCB2YXIgaT0wOyBpIDwgbGlzdGVuZXJzLmxlbmd0aDsgaSsrICkge1xuICAgIHZhciBsaXN0ZW5lciA9IGxpc3RlbmVyc1tpXVxuICAgIHZhciBpc09uY2UgPSBvbmNlTGlzdGVuZXJzICYmIG9uY2VMaXN0ZW5lcnNbIGxpc3RlbmVyIF07XG4gICAgaWYgKCBpc09uY2UgKSB7XG4gICAgICAvLyByZW1vdmUgbGlzdGVuZXJcbiAgICAgIC8vIHJlbW92ZSBiZWZvcmUgdHJpZ2dlciB0byBwcmV2ZW50IHJlY3Vyc2lvblxuICAgICAgdGhpcy5vZmYoIGV2ZW50TmFtZSwgbGlzdGVuZXIgKTtcbiAgICAgIC8vIHVuc2V0IG9uY2UgZmxhZ1xuICAgICAgZGVsZXRlIG9uY2VMaXN0ZW5lcnNbIGxpc3RlbmVyIF07XG4gICAgfVxuICAgIC8vIHRyaWdnZXIgbGlzdGVuZXJcbiAgICBsaXN0ZW5lci5hcHBseSggdGhpcywgYXJncyApO1xuICB9XG5cbiAgcmV0dXJuIHRoaXM7XG59O1xuXG5wcm90by5hbGxPZmYgPSBmdW5jdGlvbigpIHtcbiAgZGVsZXRlIHRoaXMuX2V2ZW50cztcbiAgZGVsZXRlIHRoaXMuX29uY2VFdmVudHM7XG59O1xuXG5yZXR1cm4gRXZFbWl0dGVyO1xuXG59KSk7XG5cbi8qKlxuICogbWF0Y2hlc1NlbGVjdG9yIHYyLjAuMlxuICogbWF0Y2hlc1NlbGVjdG9yKCBlbGVtZW50LCAnLnNlbGVjdG9yJyApXG4gKiBNSVQgbGljZW5zZVxuICovXG5cbi8qanNoaW50IGJyb3dzZXI6IHRydWUsIHN0cmljdDogdHJ1ZSwgdW5kZWY6IHRydWUsIHVudXNlZDogdHJ1ZSAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8qZ2xvYmFsIGRlZmluZTogZmFsc2UsIG1vZHVsZTogZmFsc2UgKi9cbiAgJ3VzZSBzdHJpY3QnO1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoICdkZXNhbmRyby1tYXRjaGVzLXNlbGVjdG9yL21hdGNoZXMtc2VsZWN0b3InLGZhY3RvcnkgKTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeSgpO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93Lm1hdGNoZXNTZWxlY3RvciA9IGZhY3RvcnkoKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoKSB7XG4gICd1c2Ugc3RyaWN0JztcblxuICB2YXIgbWF0Y2hlc01ldGhvZCA9ICggZnVuY3Rpb24oKSB7XG4gICAgdmFyIEVsZW1Qcm90byA9IHdpbmRvdy5FbGVtZW50LnByb3RvdHlwZTtcbiAgICAvLyBjaGVjayBmb3IgdGhlIHN0YW5kYXJkIG1ldGhvZCBuYW1lIGZpcnN0XG4gICAgaWYgKCBFbGVtUHJvdG8ubWF0Y2hlcyApIHtcbiAgICAgIHJldHVybiAnbWF0Y2hlcyc7XG4gICAgfVxuICAgIC8vIGNoZWNrIHVuLXByZWZpeGVkXG4gICAgaWYgKCBFbGVtUHJvdG8ubWF0Y2hlc1NlbGVjdG9yICkge1xuICAgICAgcmV0dXJuICdtYXRjaGVzU2VsZWN0b3InO1xuICAgIH1cbiAgICAvLyBjaGVjayB2ZW5kb3IgcHJlZml4ZXNcbiAgICB2YXIgcHJlZml4ZXMgPSBbICd3ZWJraXQnLCAnbW96JywgJ21zJywgJ28nIF07XG5cbiAgICBmb3IgKCB2YXIgaT0wOyBpIDwgcHJlZml4ZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICB2YXIgcHJlZml4ID0gcHJlZml4ZXNbaV07XG4gICAgICB2YXIgbWV0aG9kID0gcHJlZml4ICsgJ01hdGNoZXNTZWxlY3Rvcic7XG4gICAgICBpZiAoIEVsZW1Qcm90b1sgbWV0aG9kIF0gKSB7XG4gICAgICAgIHJldHVybiBtZXRob2Q7XG4gICAgICB9XG4gICAgfVxuICB9KSgpO1xuXG4gIHJldHVybiBmdW5jdGlvbiBtYXRjaGVzU2VsZWN0b3IoIGVsZW0sIHNlbGVjdG9yICkge1xuICAgIHJldHVybiBlbGVtWyBtYXRjaGVzTWV0aG9kIF0oIHNlbGVjdG9yICk7XG4gIH07XG5cbn0pKTtcblxuLyoqXG4gKiBGaXp6eSBVSSB1dGlscyB2Mi4wLjdcbiAqIE1JVCBsaWNlbnNlXG4gKi9cblxuLypqc2hpbnQgYnJvd3NlcjogdHJ1ZSwgdW5kZWY6IHRydWUsIHVudXNlZDogdHJ1ZSwgc3RyaWN0OiB0cnVlICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qanNoaW50IHN0cmljdDogZmFsc2UgKi8gLypnbG9iYWxzIGRlZmluZSwgbW9kdWxlLCByZXF1aXJlICovXG5cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoICdmaXp6eS11aS11dGlscy91dGlscycsW1xuICAgICAgJ2Rlc2FuZHJvLW1hdGNoZXMtc2VsZWN0b3IvbWF0Y2hlcy1zZWxlY3RvcidcbiAgICBdLCBmdW5jdGlvbiggbWF0Y2hlc1NlbGVjdG9yICkge1xuICAgICAgcmV0dXJuIGZhY3RvcnkoIHdpbmRvdywgbWF0Y2hlc1NlbGVjdG9yICk7XG4gICAgfSk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICByZXF1aXJlKCdkZXNhbmRyby1tYXRjaGVzLXNlbGVjdG9yJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93LmZpenp5VUlVdGlscyA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3csXG4gICAgICB3aW5kb3cubWF0Y2hlc1NlbGVjdG9yXG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIHdpbmRvdywgbWF0Y2hlc1NlbGVjdG9yICkge1xuXG5cblxudmFyIHV0aWxzID0ge307XG5cbi8vIC0tLS0tIGV4dGVuZCAtLS0tLSAvL1xuXG4vLyBleHRlbmRzIG9iamVjdHNcbnV0aWxzLmV4dGVuZCA9IGZ1bmN0aW9uKCBhLCBiICkge1xuICBmb3IgKCB2YXIgcHJvcCBpbiBiICkge1xuICAgIGFbIHByb3AgXSA9IGJbIHByb3AgXTtcbiAgfVxuICByZXR1cm4gYTtcbn07XG5cbi8vIC0tLS0tIG1vZHVsbyAtLS0tLSAvL1xuXG51dGlscy5tb2R1bG8gPSBmdW5jdGlvbiggbnVtLCBkaXYgKSB7XG4gIHJldHVybiAoICggbnVtICUgZGl2ICkgKyBkaXYgKSAlIGRpdjtcbn07XG5cbi8vIC0tLS0tIG1ha2VBcnJheSAtLS0tLSAvL1xuXG52YXIgYXJyYXlTbGljZSA9IEFycmF5LnByb3RvdHlwZS5zbGljZTtcblxuLy8gdHVybiBlbGVtZW50IG9yIG5vZGVMaXN0IGludG8gYW4gYXJyYXlcbnV0aWxzLm1ha2VBcnJheSA9IGZ1bmN0aW9uKCBvYmogKSB7XG4gIGlmICggQXJyYXkuaXNBcnJheSggb2JqICkgKSB7XG4gICAgLy8gdXNlIG9iamVjdCBpZiBhbHJlYWR5IGFuIGFycmF5XG4gICAgcmV0dXJuIG9iajtcbiAgfVxuICAvLyByZXR1cm4gZW1wdHkgYXJyYXkgaWYgdW5kZWZpbmVkIG9yIG51bGwuICM2XG4gIGlmICggb2JqID09PSBudWxsIHx8IG9iaiA9PT0gdW5kZWZpbmVkICkge1xuICAgIHJldHVybiBbXTtcbiAgfVxuXG4gIHZhciBpc0FycmF5TGlrZSA9IHR5cGVvZiBvYmogPT0gJ29iamVjdCcgJiYgdHlwZW9mIG9iai5sZW5ndGggPT0gJ251bWJlcic7XG4gIGlmICggaXNBcnJheUxpa2UgKSB7XG4gICAgLy8gY29udmVydCBub2RlTGlzdCB0byBhcnJheVxuICAgIHJldHVybiBhcnJheVNsaWNlLmNhbGwoIG9iaiApO1xuICB9XG5cbiAgLy8gYXJyYXkgb2Ygc2luZ2xlIGluZGV4XG4gIHJldHVybiBbIG9iaiBdO1xufTtcblxuLy8gLS0tLS0gcmVtb3ZlRnJvbSAtLS0tLSAvL1xuXG51dGlscy5yZW1vdmVGcm9tID0gZnVuY3Rpb24oIGFyeSwgb2JqICkge1xuICB2YXIgaW5kZXggPSBhcnkuaW5kZXhPZiggb2JqICk7XG4gIGlmICggaW5kZXggIT0gLTEgKSB7XG4gICAgYXJ5LnNwbGljZSggaW5kZXgsIDEgKTtcbiAgfVxufTtcblxuLy8gLS0tLS0gZ2V0UGFyZW50IC0tLS0tIC8vXG5cbnV0aWxzLmdldFBhcmVudCA9IGZ1bmN0aW9uKCBlbGVtLCBzZWxlY3RvciApIHtcbiAgd2hpbGUgKCBlbGVtLnBhcmVudE5vZGUgJiYgZWxlbSAhPSBkb2N1bWVudC5ib2R5ICkge1xuICAgIGVsZW0gPSBlbGVtLnBhcmVudE5vZGU7XG4gICAgaWYgKCBtYXRjaGVzU2VsZWN0b3IoIGVsZW0sIHNlbGVjdG9yICkgKSB7XG4gICAgICByZXR1cm4gZWxlbTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIC0tLS0tIGdldFF1ZXJ5RWxlbWVudCAtLS0tLSAvL1xuXG4vLyB1c2UgZWxlbWVudCBhcyBzZWxlY3RvciBzdHJpbmdcbnV0aWxzLmdldFF1ZXJ5RWxlbWVudCA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICBpZiAoIHR5cGVvZiBlbGVtID09ICdzdHJpbmcnICkge1xuICAgIHJldHVybiBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCBlbGVtICk7XG4gIH1cbiAgcmV0dXJuIGVsZW07XG59O1xuXG4vLyAtLS0tLSBoYW5kbGVFdmVudCAtLS0tLSAvL1xuXG4vLyBlbmFibGUgLm9udHlwZSB0byB0cmlnZ2VyIGZyb20gLmFkZEV2ZW50TGlzdGVuZXIoIGVsZW0sICd0eXBlJyApXG51dGlscy5oYW5kbGVFdmVudCA9IGZ1bmN0aW9uKCBldmVudCApIHtcbiAgdmFyIG1ldGhvZCA9ICdvbicgKyBldmVudC50eXBlO1xuICBpZiAoIHRoaXNbIG1ldGhvZCBdICkge1xuICAgIHRoaXNbIG1ldGhvZCBdKCBldmVudCApO1xuICB9XG59O1xuXG4vLyAtLS0tLSBmaWx0ZXJGaW5kRWxlbWVudHMgLS0tLS0gLy9cblxudXRpbHMuZmlsdGVyRmluZEVsZW1lbnRzID0gZnVuY3Rpb24oIGVsZW1zLCBzZWxlY3RvciApIHtcbiAgLy8gbWFrZSBhcnJheSBvZiBlbGVtc1xuICBlbGVtcyA9IHV0aWxzLm1ha2VBcnJheSggZWxlbXMgKTtcbiAgdmFyIGZmRWxlbXMgPSBbXTtcblxuICBlbGVtcy5mb3JFYWNoKCBmdW5jdGlvbiggZWxlbSApIHtcbiAgICAvLyBjaGVjayB0aGF0IGVsZW0gaXMgYW4gYWN0dWFsIGVsZW1lbnRcbiAgICBpZiAoICEoIGVsZW0gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCApICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICAvLyBhZGQgZWxlbSBpZiBubyBzZWxlY3RvclxuICAgIGlmICggIXNlbGVjdG9yICkge1xuICAgICAgZmZFbGVtcy5wdXNoKCBlbGVtICk7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIGZpbHRlciAmIGZpbmQgaXRlbXMgaWYgd2UgaGF2ZSBhIHNlbGVjdG9yXG4gICAgLy8gZmlsdGVyXG4gICAgaWYgKCBtYXRjaGVzU2VsZWN0b3IoIGVsZW0sIHNlbGVjdG9yICkgKSB7XG4gICAgICBmZkVsZW1zLnB1c2goIGVsZW0gKTtcbiAgICB9XG4gICAgLy8gZmluZCBjaGlsZHJlblxuICAgIHZhciBjaGlsZEVsZW1zID0gZWxlbS5xdWVyeVNlbGVjdG9yQWxsKCBzZWxlY3RvciApO1xuICAgIC8vIGNvbmNhdCBjaGlsZEVsZW1zIHRvIGZpbHRlckZvdW5kIGFycmF5XG4gICAgZm9yICggdmFyIGk9MDsgaSA8IGNoaWxkRWxlbXMubGVuZ3RoOyBpKysgKSB7XG4gICAgICBmZkVsZW1zLnB1c2goIGNoaWxkRWxlbXNbaV0gKTtcbiAgICB9XG4gIH0pO1xuXG4gIHJldHVybiBmZkVsZW1zO1xufTtcblxuLy8gLS0tLS0gZGVib3VuY2VNZXRob2QgLS0tLS0gLy9cblxudXRpbHMuZGVib3VuY2VNZXRob2QgPSBmdW5jdGlvbiggX2NsYXNzLCBtZXRob2ROYW1lLCB0aHJlc2hvbGQgKSB7XG4gIHRocmVzaG9sZCA9IHRocmVzaG9sZCB8fCAxMDA7XG4gIC8vIG9yaWdpbmFsIG1ldGhvZFxuICB2YXIgbWV0aG9kID0gX2NsYXNzLnByb3RvdHlwZVsgbWV0aG9kTmFtZSBdO1xuICB2YXIgdGltZW91dE5hbWUgPSBtZXRob2ROYW1lICsgJ1RpbWVvdXQnO1xuXG4gIF9jbGFzcy5wcm90b3R5cGVbIG1ldGhvZE5hbWUgXSA9IGZ1bmN0aW9uKCkge1xuICAgIHZhciB0aW1lb3V0ID0gdGhpc1sgdGltZW91dE5hbWUgXTtcbiAgICBjbGVhclRpbWVvdXQoIHRpbWVvdXQgKTtcblxuICAgIHZhciBhcmdzID0gYXJndW1lbnRzO1xuICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgdGhpc1sgdGltZW91dE5hbWUgXSA9IHNldFRpbWVvdXQoIGZ1bmN0aW9uKCkge1xuICAgICAgbWV0aG9kLmFwcGx5KCBfdGhpcywgYXJncyApO1xuICAgICAgZGVsZXRlIF90aGlzWyB0aW1lb3V0TmFtZSBdO1xuICAgIH0sIHRocmVzaG9sZCApO1xuICB9O1xufTtcblxuLy8gLS0tLS0gZG9jUmVhZHkgLS0tLS0gLy9cblxudXRpbHMuZG9jUmVhZHkgPSBmdW5jdGlvbiggY2FsbGJhY2sgKSB7XG4gIHZhciByZWFkeVN0YXRlID0gZG9jdW1lbnQucmVhZHlTdGF0ZTtcbiAgaWYgKCByZWFkeVN0YXRlID09ICdjb21wbGV0ZScgfHwgcmVhZHlTdGF0ZSA9PSAnaW50ZXJhY3RpdmUnICkge1xuICAgIC8vIGRvIGFzeW5jIHRvIGFsbG93IGZvciBvdGhlciBzY3JpcHRzIHRvIHJ1bi4gbWV0YWZpenp5L2ZsaWNraXR5IzQ0MVxuICAgIHNldFRpbWVvdXQoIGNhbGxiYWNrICk7XG4gIH0gZWxzZSB7XG4gICAgZG9jdW1lbnQuYWRkRXZlbnRMaXN0ZW5lciggJ0RPTUNvbnRlbnRMb2FkZWQnLCBjYWxsYmFjayApO1xuICB9XG59O1xuXG4vLyAtLS0tLSBodG1sSW5pdCAtLS0tLSAvL1xuXG4vLyBodHRwOi8vamFtZXNyb2JlcnRzLm5hbWUvYmxvZy8yMDEwLzAyLzIyL3N0cmluZy1mdW5jdGlvbnMtZm9yLWphdmFzY3JpcHQtdHJpbS10by1jYW1lbC1jYXNlLXRvLWRhc2hlZC1hbmQtdG8tdW5kZXJzY29yZS9cbnV0aWxzLnRvRGFzaGVkID0gZnVuY3Rpb24oIHN0ciApIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKCAvKC4pKFtBLVpdKS9nLCBmdW5jdGlvbiggbWF0Y2gsICQxLCAkMiApIHtcbiAgICByZXR1cm4gJDEgKyAnLScgKyAkMjtcbiAgfSkudG9Mb3dlckNhc2UoKTtcbn07XG5cbnZhciBjb25zb2xlID0gd2luZG93LmNvbnNvbGU7XG4vKipcbiAqIGFsbG93IHVzZXIgdG8gaW5pdGlhbGl6ZSBjbGFzc2VzIHZpYSBbZGF0YS1uYW1lc3BhY2VdIG9yIC5qcy1uYW1lc3BhY2UgY2xhc3NcbiAqIGh0bWxJbml0KCBXaWRnZXQsICd3aWRnZXROYW1lJyApXG4gKiBvcHRpb25zIGFyZSBwYXJzZWQgZnJvbSBkYXRhLW5hbWVzcGFjZS1vcHRpb25zXG4gKi9cbnV0aWxzLmh0bWxJbml0ID0gZnVuY3Rpb24oIFdpZGdldENsYXNzLCBuYW1lc3BhY2UgKSB7XG4gIHV0aWxzLmRvY1JlYWR5KCBmdW5jdGlvbigpIHtcbiAgICB2YXIgZGFzaGVkTmFtZXNwYWNlID0gdXRpbHMudG9EYXNoZWQoIG5hbWVzcGFjZSApO1xuICAgIHZhciBkYXRhQXR0ciA9ICdkYXRhLScgKyBkYXNoZWROYW1lc3BhY2U7XG4gICAgdmFyIGRhdGFBdHRyRWxlbXMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKCAnWycgKyBkYXRhQXR0ciArICddJyApO1xuICAgIHZhciBqc0Rhc2hFbGVtcyA9IGRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwoICcuanMtJyArIGRhc2hlZE5hbWVzcGFjZSApO1xuICAgIHZhciBlbGVtcyA9IHV0aWxzLm1ha2VBcnJheSggZGF0YUF0dHJFbGVtcyApXG4gICAgICAuY29uY2F0KCB1dGlscy5tYWtlQXJyYXkoIGpzRGFzaEVsZW1zICkgKTtcbiAgICB2YXIgZGF0YU9wdGlvbnNBdHRyID0gZGF0YUF0dHIgKyAnLW9wdGlvbnMnO1xuICAgIHZhciBqUXVlcnkgPSB3aW5kb3cualF1ZXJ5O1xuXG4gICAgZWxlbXMuZm9yRWFjaCggZnVuY3Rpb24oIGVsZW0gKSB7XG4gICAgICB2YXIgYXR0ciA9IGVsZW0uZ2V0QXR0cmlidXRlKCBkYXRhQXR0ciApIHx8XG4gICAgICAgIGVsZW0uZ2V0QXR0cmlidXRlKCBkYXRhT3B0aW9uc0F0dHIgKTtcbiAgICAgIHZhciBvcHRpb25zO1xuICAgICAgdHJ5IHtcbiAgICAgICAgb3B0aW9ucyA9IGF0dHIgJiYgSlNPTi5wYXJzZSggYXR0ciApO1xuICAgICAgfSBjYXRjaCAoIGVycm9yICkge1xuICAgICAgICAvLyBsb2cgZXJyb3IsIGRvIG5vdCBpbml0aWFsaXplXG4gICAgICAgIGlmICggY29uc29sZSApIHtcbiAgICAgICAgICBjb25zb2xlLmVycm9yKCAnRXJyb3IgcGFyc2luZyAnICsgZGF0YUF0dHIgKyAnIG9uICcgKyBlbGVtLmNsYXNzTmFtZSArXG4gICAgICAgICAgJzogJyArIGVycm9yICk7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgLy8gaW5pdGlhbGl6ZVxuICAgICAgdmFyIGluc3RhbmNlID0gbmV3IFdpZGdldENsYXNzKCBlbGVtLCBvcHRpb25zICk7XG4gICAgICAvLyBtYWtlIGF2YWlsYWJsZSB2aWEgJCgpLmRhdGEoJ25hbWVzcGFjZScpXG4gICAgICBpZiAoIGpRdWVyeSApIHtcbiAgICAgICAgalF1ZXJ5LmRhdGEoIGVsZW0sIG5hbWVzcGFjZSwgaW5zdGFuY2UgKTtcbiAgICAgIH1cbiAgICB9KTtcblxuICB9KTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5yZXR1cm4gdXRpbHM7XG5cbn0pKTtcblxuLyoqXG4gKiBPdXRsYXllciBJdGVtXG4gKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi8gLyogZ2xvYmFscyBkZWZpbmUsIG1vZHVsZSwgcmVxdWlyZSAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRCAtIFJlcXVpcmVKU1xuICAgIGRlZmluZSggJ291dGxheWVyL2l0ZW0nLFtcbiAgICAgICAgJ2V2LWVtaXR0ZXIvZXYtZW1pdHRlcicsXG4gICAgICAgICdnZXQtc2l6ZS9nZXQtc2l6ZSdcbiAgICAgIF0sXG4gICAgICBmYWN0b3J5XG4gICAgKTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KUyAtIEJyb3dzZXJpZnksIFdlYnBhY2tcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICByZXF1aXJlKCdldi1lbWl0dGVyJyksXG4gICAgICByZXF1aXJlKCdnZXQtc2l6ZScpXG4gICAgKTtcbiAgfSBlbHNlIHtcbiAgICAvLyBicm93c2VyIGdsb2JhbFxuICAgIHdpbmRvdy5PdXRsYXllciA9IHt9O1xuICAgIHdpbmRvdy5PdXRsYXllci5JdGVtID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdy5FdkVtaXR0ZXIsXG4gICAgICB3aW5kb3cuZ2V0U2l6ZVxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCBFdkVtaXR0ZXIsIGdldFNpemUgKSB7XG4ndXNlIHN0cmljdCc7XG5cbi8vIC0tLS0tIGhlbHBlcnMgLS0tLS0gLy9cblxuZnVuY3Rpb24gaXNFbXB0eU9iaiggb2JqICkge1xuICBmb3IgKCB2YXIgcHJvcCBpbiBvYmogKSB7XG4gICAgcmV0dXJuIGZhbHNlO1xuICB9XG4gIHByb3AgPSBudWxsO1xuICByZXR1cm4gdHJ1ZTtcbn1cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gQ1NTMyBzdXBwb3J0IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cblxudmFyIGRvY0VsZW1TdHlsZSA9IGRvY3VtZW50LmRvY3VtZW50RWxlbWVudC5zdHlsZTtcblxudmFyIHRyYW5zaXRpb25Qcm9wZXJ0eSA9IHR5cGVvZiBkb2NFbGVtU3R5bGUudHJhbnNpdGlvbiA9PSAnc3RyaW5nJyA/XG4gICd0cmFuc2l0aW9uJyA6ICdXZWJraXRUcmFuc2l0aW9uJztcbnZhciB0cmFuc2Zvcm1Qcm9wZXJ0eSA9IHR5cGVvZiBkb2NFbGVtU3R5bGUudHJhbnNmb3JtID09ICdzdHJpbmcnID9cbiAgJ3RyYW5zZm9ybScgOiAnV2Via2l0VHJhbnNmb3JtJztcblxudmFyIHRyYW5zaXRpb25FbmRFdmVudCA9IHtcbiAgV2Via2l0VHJhbnNpdGlvbjogJ3dlYmtpdFRyYW5zaXRpb25FbmQnLFxuICB0cmFuc2l0aW9uOiAndHJhbnNpdGlvbmVuZCdcbn1bIHRyYW5zaXRpb25Qcm9wZXJ0eSBdO1xuXG4vLyBjYWNoZSBhbGwgdmVuZG9yIHByb3BlcnRpZXMgdGhhdCBjb3VsZCBoYXZlIHZlbmRvciBwcmVmaXhcbnZhciB2ZW5kb3JQcm9wZXJ0aWVzID0ge1xuICB0cmFuc2Zvcm06IHRyYW5zZm9ybVByb3BlcnR5LFxuICB0cmFuc2l0aW9uOiB0cmFuc2l0aW9uUHJvcGVydHksXG4gIHRyYW5zaXRpb25EdXJhdGlvbjogdHJhbnNpdGlvblByb3BlcnR5ICsgJ0R1cmF0aW9uJyxcbiAgdHJhbnNpdGlvblByb3BlcnR5OiB0cmFuc2l0aW9uUHJvcGVydHkgKyAnUHJvcGVydHknLFxuICB0cmFuc2l0aW9uRGVsYXk6IHRyYW5zaXRpb25Qcm9wZXJ0eSArICdEZWxheSdcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIEl0ZW0gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuZnVuY3Rpb24gSXRlbSggZWxlbWVudCwgbGF5b3V0ICkge1xuICBpZiAoICFlbGVtZW50ICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMuZWxlbWVudCA9IGVsZW1lbnQ7XG4gIC8vIHBhcmVudCBsYXlvdXQgY2xhc3MsIGkuZS4gTWFzb25yeSwgSXNvdG9wZSwgb3IgUGFja2VyeVxuICB0aGlzLmxheW91dCA9IGxheW91dDtcbiAgdGhpcy5wb3NpdGlvbiA9IHtcbiAgICB4OiAwLFxuICAgIHk6IDBcbiAgfTtcblxuICB0aGlzLl9jcmVhdGUoKTtcbn1cblxuLy8gaW5oZXJpdCBFdkVtaXR0ZXJcbnZhciBwcm90byA9IEl0ZW0ucHJvdG90eXBlID0gT2JqZWN0LmNyZWF0ZSggRXZFbWl0dGVyLnByb3RvdHlwZSApO1xucHJvdG8uY29uc3RydWN0b3IgPSBJdGVtO1xuXG5wcm90by5fY3JlYXRlID0gZnVuY3Rpb24oKSB7XG4gIC8vIHRyYW5zaXRpb24gb2JqZWN0c1xuICB0aGlzLl90cmFuc24gPSB7XG4gICAgaW5nUHJvcGVydGllczoge30sXG4gICAgY2xlYW46IHt9LFxuICAgIG9uRW5kOiB7fVxuICB9O1xuXG4gIHRoaXMuY3NzKHtcbiAgICBwb3NpdGlvbjogJ2Fic29sdXRlJ1xuICB9KTtcbn07XG5cbi8vIHRyaWdnZXIgc3BlY2lmaWVkIGhhbmRsZXIgZm9yIGV2ZW50IHR5cGVcbnByb3RvLmhhbmRsZUV2ZW50ID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB2YXIgbWV0aG9kID0gJ29uJyArIGV2ZW50LnR5cGU7XG4gIGlmICggdGhpc1sgbWV0aG9kIF0gKSB7XG4gICAgdGhpc1sgbWV0aG9kIF0oIGV2ZW50ICk7XG4gIH1cbn07XG5cbnByb3RvLmdldFNpemUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zaXplID0gZ2V0U2l6ZSggdGhpcy5lbGVtZW50ICk7XG59O1xuXG4vKipcbiAqIGFwcGx5IENTUyBzdHlsZXMgdG8gZWxlbWVudFxuICogQHBhcmFtIHtPYmplY3R9IHN0eWxlXG4gKi9cbnByb3RvLmNzcyA9IGZ1bmN0aW9uKCBzdHlsZSApIHtcbiAgdmFyIGVsZW1TdHlsZSA9IHRoaXMuZWxlbWVudC5zdHlsZTtcblxuICBmb3IgKCB2YXIgcHJvcCBpbiBzdHlsZSApIHtcbiAgICAvLyB1c2UgdmVuZG9yIHByb3BlcnR5IGlmIGF2YWlsYWJsZVxuICAgIHZhciBzdXBwb3J0ZWRQcm9wID0gdmVuZG9yUHJvcGVydGllc1sgcHJvcCBdIHx8IHByb3A7XG4gICAgZWxlbVN0eWxlWyBzdXBwb3J0ZWRQcm9wIF0gPSBzdHlsZVsgcHJvcCBdO1xuICB9XG59O1xuXG4gLy8gbWVhc3VyZSBwb3NpdGlvbiwgYW5kIHNldHMgaXRcbnByb3RvLmdldFBvc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzdHlsZSA9IGdldENvbXB1dGVkU3R5bGUoIHRoaXMuZWxlbWVudCApO1xuICB2YXIgaXNPcmlnaW5MZWZ0ID0gdGhpcy5sYXlvdXQuX2dldE9wdGlvbignb3JpZ2luTGVmdCcpO1xuICB2YXIgaXNPcmlnaW5Ub3AgPSB0aGlzLmxheW91dC5fZ2V0T3B0aW9uKCdvcmlnaW5Ub3AnKTtcbiAgdmFyIHhWYWx1ZSA9IHN0eWxlWyBpc09yaWdpbkxlZnQgPyAnbGVmdCcgOiAncmlnaHQnIF07XG4gIHZhciB5VmFsdWUgPSBzdHlsZVsgaXNPcmlnaW5Ub3AgPyAndG9wJyA6ICdib3R0b20nIF07XG4gIHZhciB4ID0gcGFyc2VGbG9hdCggeFZhbHVlICk7XG4gIHZhciB5ID0gcGFyc2VGbG9hdCggeVZhbHVlICk7XG4gIC8vIGNvbnZlcnQgcGVyY2VudCB0byBwaXhlbHNcbiAgdmFyIGxheW91dFNpemUgPSB0aGlzLmxheW91dC5zaXplO1xuICBpZiAoIHhWYWx1ZS5pbmRleE9mKCclJykgIT0gLTEgKSB7XG4gICAgeCA9ICggeCAvIDEwMCApICogbGF5b3V0U2l6ZS53aWR0aDtcbiAgfVxuICBpZiAoIHlWYWx1ZS5pbmRleE9mKCclJykgIT0gLTEgKSB7XG4gICAgeSA9ICggeSAvIDEwMCApICogbGF5b3V0U2l6ZS5oZWlnaHQ7XG4gIH1cbiAgLy8gY2xlYW4gdXAgJ2F1dG8nIG9yIG90aGVyIG5vbi1pbnRlZ2VyIHZhbHVlc1xuICB4ID0gaXNOYU4oIHggKSA/IDAgOiB4O1xuICB5ID0gaXNOYU4oIHkgKSA/IDAgOiB5O1xuICAvLyByZW1vdmUgcGFkZGluZyBmcm9tIG1lYXN1cmVtZW50XG4gIHggLT0gaXNPcmlnaW5MZWZ0ID8gbGF5b3V0U2l6ZS5wYWRkaW5nTGVmdCA6IGxheW91dFNpemUucGFkZGluZ1JpZ2h0O1xuICB5IC09IGlzT3JpZ2luVG9wID8gbGF5b3V0U2l6ZS5wYWRkaW5nVG9wIDogbGF5b3V0U2l6ZS5wYWRkaW5nQm90dG9tO1xuXG4gIHRoaXMucG9zaXRpb24ueCA9IHg7XG4gIHRoaXMucG9zaXRpb24ueSA9IHk7XG59O1xuXG4vLyBzZXQgc2V0dGxlZCBwb3NpdGlvbiwgYXBwbHkgcGFkZGluZ1xucHJvdG8ubGF5b3V0UG9zaXRpb24gPSBmdW5jdGlvbigpIHtcbiAgdmFyIGxheW91dFNpemUgPSB0aGlzLmxheW91dC5zaXplO1xuICB2YXIgc3R5bGUgPSB7fTtcbiAgdmFyIGlzT3JpZ2luTGVmdCA9IHRoaXMubGF5b3V0Ll9nZXRPcHRpb24oJ29yaWdpbkxlZnQnKTtcbiAgdmFyIGlzT3JpZ2luVG9wID0gdGhpcy5sYXlvdXQuX2dldE9wdGlvbignb3JpZ2luVG9wJyk7XG5cbiAgLy8geFxuICB2YXIgeFBhZGRpbmcgPSBpc09yaWdpbkxlZnQgPyAncGFkZGluZ0xlZnQnIDogJ3BhZGRpbmdSaWdodCc7XG4gIHZhciB4UHJvcGVydHkgPSBpc09yaWdpbkxlZnQgPyAnbGVmdCcgOiAncmlnaHQnO1xuICB2YXIgeFJlc2V0UHJvcGVydHkgPSBpc09yaWdpbkxlZnQgPyAncmlnaHQnIDogJ2xlZnQnO1xuXG4gIHZhciB4ID0gdGhpcy5wb3NpdGlvbi54ICsgbGF5b3V0U2l6ZVsgeFBhZGRpbmcgXTtcbiAgLy8gc2V0IGluIHBlcmNlbnRhZ2Ugb3IgcGl4ZWxzXG4gIHN0eWxlWyB4UHJvcGVydHkgXSA9IHRoaXMuZ2V0WFZhbHVlKCB4ICk7XG4gIC8vIHJlc2V0IG90aGVyIHByb3BlcnR5XG4gIHN0eWxlWyB4UmVzZXRQcm9wZXJ0eSBdID0gJyc7XG5cbiAgLy8geVxuICB2YXIgeVBhZGRpbmcgPSBpc09yaWdpblRvcCA/ICdwYWRkaW5nVG9wJyA6ICdwYWRkaW5nQm90dG9tJztcbiAgdmFyIHlQcm9wZXJ0eSA9IGlzT3JpZ2luVG9wID8gJ3RvcCcgOiAnYm90dG9tJztcbiAgdmFyIHlSZXNldFByb3BlcnR5ID0gaXNPcmlnaW5Ub3AgPyAnYm90dG9tJyA6ICd0b3AnO1xuXG4gIHZhciB5ID0gdGhpcy5wb3NpdGlvbi55ICsgbGF5b3V0U2l6ZVsgeVBhZGRpbmcgXTtcbiAgLy8gc2V0IGluIHBlcmNlbnRhZ2Ugb3IgcGl4ZWxzXG4gIHN0eWxlWyB5UHJvcGVydHkgXSA9IHRoaXMuZ2V0WVZhbHVlKCB5ICk7XG4gIC8vIHJlc2V0IG90aGVyIHByb3BlcnR5XG4gIHN0eWxlWyB5UmVzZXRQcm9wZXJ0eSBdID0gJyc7XG5cbiAgdGhpcy5jc3MoIHN0eWxlICk7XG4gIHRoaXMuZW1pdEV2ZW50KCAnbGF5b3V0JywgWyB0aGlzIF0gKTtcbn07XG5cbnByb3RvLmdldFhWYWx1ZSA9IGZ1bmN0aW9uKCB4ICkge1xuICB2YXIgaXNIb3Jpem9udGFsID0gdGhpcy5sYXlvdXQuX2dldE9wdGlvbignaG9yaXpvbnRhbCcpO1xuICByZXR1cm4gdGhpcy5sYXlvdXQub3B0aW9ucy5wZXJjZW50UG9zaXRpb24gJiYgIWlzSG9yaXpvbnRhbCA/XG4gICAgKCAoIHggLyB0aGlzLmxheW91dC5zaXplLndpZHRoICkgKiAxMDAgKSArICclJyA6IHggKyAncHgnO1xufTtcblxucHJvdG8uZ2V0WVZhbHVlID0gZnVuY3Rpb24oIHkgKSB7XG4gIHZhciBpc0hvcml6b250YWwgPSB0aGlzLmxheW91dC5fZ2V0T3B0aW9uKCdob3Jpem9udGFsJyk7XG4gIHJldHVybiB0aGlzLmxheW91dC5vcHRpb25zLnBlcmNlbnRQb3NpdGlvbiAmJiBpc0hvcml6b250YWwgP1xuICAgICggKCB5IC8gdGhpcy5sYXlvdXQuc2l6ZS5oZWlnaHQgKSAqIDEwMCApICsgJyUnIDogeSArICdweCc7XG59O1xuXG5wcm90by5fdHJhbnNpdGlvblRvID0gZnVuY3Rpb24oIHgsIHkgKSB7XG4gIHRoaXMuZ2V0UG9zaXRpb24oKTtcbiAgLy8gZ2V0IGN1cnJlbnQgeCAmIHkgZnJvbSB0b3AvbGVmdFxuICB2YXIgY3VyWCA9IHRoaXMucG9zaXRpb24ueDtcbiAgdmFyIGN1clkgPSB0aGlzLnBvc2l0aW9uLnk7XG5cbiAgdmFyIGRpZE5vdE1vdmUgPSB4ID09IHRoaXMucG9zaXRpb24ueCAmJiB5ID09IHRoaXMucG9zaXRpb24ueTtcblxuICAvLyBzYXZlIGVuZCBwb3NpdGlvblxuICB0aGlzLnNldFBvc2l0aW9uKCB4LCB5ICk7XG5cbiAgLy8gaWYgZGlkIG5vdCBtb3ZlIGFuZCBub3QgdHJhbnNpdGlvbmluZywganVzdCBnbyB0byBsYXlvdXRcbiAgaWYgKCBkaWROb3RNb3ZlICYmICF0aGlzLmlzVHJhbnNpdGlvbmluZyApIHtcbiAgICB0aGlzLmxheW91dFBvc2l0aW9uKCk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHRyYW5zWCA9IHggLSBjdXJYO1xuICB2YXIgdHJhbnNZID0geSAtIGN1clk7XG4gIHZhciB0cmFuc2l0aW9uU3R5bGUgPSB7fTtcbiAgdHJhbnNpdGlvblN0eWxlLnRyYW5zZm9ybSA9IHRoaXMuZ2V0VHJhbnNsYXRlKCB0cmFuc1gsIHRyYW5zWSApO1xuXG4gIHRoaXMudHJhbnNpdGlvbih7XG4gICAgdG86IHRyYW5zaXRpb25TdHlsZSxcbiAgICBvblRyYW5zaXRpb25FbmQ6IHtcbiAgICAgIHRyYW5zZm9ybTogdGhpcy5sYXlvdXRQb3NpdGlvblxuICAgIH0sXG4gICAgaXNDbGVhbmluZzogdHJ1ZVxuICB9KTtcbn07XG5cbnByb3RvLmdldFRyYW5zbGF0ZSA9IGZ1bmN0aW9uKCB4LCB5ICkge1xuICAvLyBmbGlwIGNvb3JpZGluYXRlcyBpZiBvcmlnaW4gb24gcmlnaHQgb3IgYm90dG9tXG4gIHZhciBpc09yaWdpbkxlZnQgPSB0aGlzLmxheW91dC5fZ2V0T3B0aW9uKCdvcmlnaW5MZWZ0Jyk7XG4gIHZhciBpc09yaWdpblRvcCA9IHRoaXMubGF5b3V0Ll9nZXRPcHRpb24oJ29yaWdpblRvcCcpO1xuICB4ID0gaXNPcmlnaW5MZWZ0ID8geCA6IC14O1xuICB5ID0gaXNPcmlnaW5Ub3AgPyB5IDogLXk7XG4gIHJldHVybiAndHJhbnNsYXRlM2QoJyArIHggKyAncHgsICcgKyB5ICsgJ3B4LCAwKSc7XG59O1xuXG4vLyBub24gdHJhbnNpdGlvbiArIHRyYW5zZm9ybSBzdXBwb3J0XG5wcm90by5nb1RvID0gZnVuY3Rpb24oIHgsIHkgKSB7XG4gIHRoaXMuc2V0UG9zaXRpb24oIHgsIHkgKTtcbiAgdGhpcy5sYXlvdXRQb3NpdGlvbigpO1xufTtcblxucHJvdG8ubW92ZVRvID0gcHJvdG8uX3RyYW5zaXRpb25UbztcblxucHJvdG8uc2V0UG9zaXRpb24gPSBmdW5jdGlvbiggeCwgeSApIHtcbiAgdGhpcy5wb3NpdGlvbi54ID0gcGFyc2VGbG9hdCggeCApO1xuICB0aGlzLnBvc2l0aW9uLnkgPSBwYXJzZUZsb2F0KCB5ICk7XG59O1xuXG4vLyAtLS0tLSB0cmFuc2l0aW9uIC0tLS0tIC8vXG5cbi8qKlxuICogQHBhcmFtIHtPYmplY3R9IHN0eWxlIC0gQ1NTXG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBvblRyYW5zaXRpb25FbmRcbiAqL1xuXG4vLyBub24gdHJhbnNpdGlvbiwganVzdCB0cmlnZ2VyIGNhbGxiYWNrXG5wcm90by5fbm9uVHJhbnNpdGlvbiA9IGZ1bmN0aW9uKCBhcmdzICkge1xuICB0aGlzLmNzcyggYXJncy50byApO1xuICBpZiAoIGFyZ3MuaXNDbGVhbmluZyApIHtcbiAgICB0aGlzLl9yZW1vdmVTdHlsZXMoIGFyZ3MudG8gKTtcbiAgfVxuICBmb3IgKCB2YXIgcHJvcCBpbiBhcmdzLm9uVHJhbnNpdGlvbkVuZCApIHtcbiAgICBhcmdzLm9uVHJhbnNpdGlvbkVuZFsgcHJvcCBdLmNhbGwoIHRoaXMgKTtcbiAgfVxufTtcblxuLyoqXG4gKiBwcm9wZXIgdHJhbnNpdGlvblxuICogQHBhcmFtIHtPYmplY3R9IGFyZ3MgLSBhcmd1bWVudHNcbiAqICAgQHBhcmFtIHtPYmplY3R9IHRvIC0gc3R5bGUgdG8gdHJhbnNpdGlvbiB0b1xuICogICBAcGFyYW0ge09iamVjdH0gZnJvbSAtIHN0eWxlIHRvIHN0YXJ0IHRyYW5zaXRpb24gZnJvbVxuICogICBAcGFyYW0ge0Jvb2xlYW59IGlzQ2xlYW5pbmcgLSByZW1vdmVzIHRyYW5zaXRpb24gc3R5bGVzIGFmdGVyIHRyYW5zaXRpb25cbiAqICAgQHBhcmFtIHtGdW5jdGlvbn0gb25UcmFuc2l0aW9uRW5kIC0gY2FsbGJhY2tcbiAqL1xucHJvdG8udHJhbnNpdGlvbiA9IGZ1bmN0aW9uKCBhcmdzICkge1xuICAvLyByZWRpcmVjdCB0byBub25UcmFuc2l0aW9uIGlmIG5vIHRyYW5zaXRpb24gZHVyYXRpb25cbiAgaWYgKCAhcGFyc2VGbG9hdCggdGhpcy5sYXlvdXQub3B0aW9ucy50cmFuc2l0aW9uRHVyYXRpb24gKSApIHtcbiAgICB0aGlzLl9ub25UcmFuc2l0aW9uKCBhcmdzICk7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIF90cmFuc2l0aW9uID0gdGhpcy5fdHJhbnNuO1xuICAvLyBrZWVwIHRyYWNrIG9mIG9uVHJhbnNpdGlvbkVuZCBjYWxsYmFjayBieSBjc3MgcHJvcGVydHlcbiAgZm9yICggdmFyIHByb3AgaW4gYXJncy5vblRyYW5zaXRpb25FbmQgKSB7XG4gICAgX3RyYW5zaXRpb24ub25FbmRbIHByb3AgXSA9IGFyZ3Mub25UcmFuc2l0aW9uRW5kWyBwcm9wIF07XG4gIH1cbiAgLy8ga2VlcCB0cmFjayBvZiBwcm9wZXJ0aWVzIHRoYXQgYXJlIHRyYW5zaXRpb25pbmdcbiAgZm9yICggcHJvcCBpbiBhcmdzLnRvICkge1xuICAgIF90cmFuc2l0aW9uLmluZ1Byb3BlcnRpZXNbIHByb3AgXSA9IHRydWU7XG4gICAgLy8ga2VlcCB0cmFjayBvZiBwcm9wZXJ0aWVzIHRvIGNsZWFuIHVwIHdoZW4gdHJhbnNpdGlvbiBpcyBkb25lXG4gICAgaWYgKCBhcmdzLmlzQ2xlYW5pbmcgKSB7XG4gICAgICBfdHJhbnNpdGlvbi5jbGVhblsgcHJvcCBdID0gdHJ1ZTtcbiAgICB9XG4gIH1cblxuICAvLyBzZXQgZnJvbSBzdHlsZXNcbiAgaWYgKCBhcmdzLmZyb20gKSB7XG4gICAgdGhpcy5jc3MoIGFyZ3MuZnJvbSApO1xuICAgIC8vIGZvcmNlIHJlZHJhdy4gaHR0cDovL2Jsb2cuYWxleG1hY2Nhdy5jb20vY3NzLXRyYW5zaXRpb25zXG4gICAgdmFyIGggPSB0aGlzLmVsZW1lbnQub2Zmc2V0SGVpZ2h0O1xuICAgIC8vIGhhY2sgZm9yIEpTSGludCB0byBodXNoIGFib3V0IHVudXNlZCB2YXJcbiAgICBoID0gbnVsbDtcbiAgfVxuICAvLyBlbmFibGUgdHJhbnNpdGlvblxuICB0aGlzLmVuYWJsZVRyYW5zaXRpb24oIGFyZ3MudG8gKTtcbiAgLy8gc2V0IHN0eWxlcyB0aGF0IGFyZSB0cmFuc2l0aW9uaW5nXG4gIHRoaXMuY3NzKCBhcmdzLnRvICk7XG5cbiAgdGhpcy5pc1RyYW5zaXRpb25pbmcgPSB0cnVlO1xuXG59O1xuXG4vLyBkYXNoIGJlZm9yZSBhbGwgY2FwIGxldHRlcnMsIGluY2x1ZGluZyBmaXJzdCBmb3Jcbi8vIFdlYmtpdFRyYW5zZm9ybSA9PiAtd2Via2l0LXRyYW5zZm9ybVxuZnVuY3Rpb24gdG9EYXNoZWRBbGwoIHN0ciApIHtcbiAgcmV0dXJuIHN0ci5yZXBsYWNlKCAvKFtBLVpdKS9nLCBmdW5jdGlvbiggJDEgKSB7XG4gICAgcmV0dXJuICctJyArICQxLnRvTG93ZXJDYXNlKCk7XG4gIH0pO1xufVxuXG52YXIgdHJhbnNpdGlvblByb3BzID0gJ29wYWNpdHksJyArIHRvRGFzaGVkQWxsKCB0cmFuc2Zvcm1Qcm9wZXJ0eSApO1xuXG5wcm90by5lbmFibGVUcmFuc2l0aW9uID0gZnVuY3Rpb24oLyogc3R5bGUgKi8pIHtcbiAgLy8gSEFDSyBjaGFuZ2luZyB0cmFuc2l0aW9uUHJvcGVydHkgZHVyaW5nIGEgdHJhbnNpdGlvblxuICAvLyB3aWxsIGNhdXNlIHRyYW5zaXRpb24gdG8ganVtcFxuICBpZiAoIHRoaXMuaXNUcmFuc2l0aW9uaW5nICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIG1ha2UgYHRyYW5zaXRpb246IGZvbywgYmFyLCBiYXpgIGZyb20gc3R5bGUgb2JqZWN0XG4gIC8vIEhBQ0sgdW4tY29tbWVudCB0aGlzIHdoZW4gZW5hYmxlVHJhbnNpdGlvbiBjYW4gd29ya1xuICAvLyB3aGlsZSBhIHRyYW5zaXRpb24gaXMgaGFwcGVuaW5nXG4gIC8vIHZhciB0cmFuc2l0aW9uVmFsdWVzID0gW107XG4gIC8vIGZvciAoIHZhciBwcm9wIGluIHN0eWxlICkge1xuICAvLyAgIC8vIGRhc2gtaWZ5IGNhbWVsQ2FzZWQgcHJvcGVydGllcyBsaWtlIFdlYmtpdFRyYW5zaXRpb25cbiAgLy8gICBwcm9wID0gdmVuZG9yUHJvcGVydGllc1sgcHJvcCBdIHx8IHByb3A7XG4gIC8vICAgdHJhbnNpdGlvblZhbHVlcy5wdXNoKCB0b0Rhc2hlZEFsbCggcHJvcCApICk7XG4gIC8vIH1cbiAgLy8gbXVuZ2UgbnVtYmVyIHRvIG1pbGxpc2Vjb25kLCB0byBtYXRjaCBzdGFnZ2VyXG4gIHZhciBkdXJhdGlvbiA9IHRoaXMubGF5b3V0Lm9wdGlvbnMudHJhbnNpdGlvbkR1cmF0aW9uO1xuICBkdXJhdGlvbiA9IHR5cGVvZiBkdXJhdGlvbiA9PSAnbnVtYmVyJyA/IGR1cmF0aW9uICsgJ21zJyA6IGR1cmF0aW9uO1xuICAvLyBlbmFibGUgdHJhbnNpdGlvbiBzdHlsZXNcbiAgdGhpcy5jc3Moe1xuICAgIHRyYW5zaXRpb25Qcm9wZXJ0eTogdHJhbnNpdGlvblByb3BzLFxuICAgIHRyYW5zaXRpb25EdXJhdGlvbjogZHVyYXRpb24sXG4gICAgdHJhbnNpdGlvbkRlbGF5OiB0aGlzLnN0YWdnZXJEZWxheSB8fCAwXG4gIH0pO1xuICAvLyBsaXN0ZW4gZm9yIHRyYW5zaXRpb24gZW5kIGV2ZW50XG4gIHRoaXMuZWxlbWVudC5hZGRFdmVudExpc3RlbmVyKCB0cmFuc2l0aW9uRW5kRXZlbnQsIHRoaXMsIGZhbHNlICk7XG59O1xuXG4vLyAtLS0tLSBldmVudHMgLS0tLS0gLy9cblxucHJvdG8ub253ZWJraXRUcmFuc2l0aW9uRW5kID0gZnVuY3Rpb24oIGV2ZW50ICkge1xuICB0aGlzLm9udHJhbnNpdGlvbmVuZCggZXZlbnQgKTtcbn07XG5cbnByb3RvLm9ub3RyYW5zaXRpb25lbmQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIHRoaXMub250cmFuc2l0aW9uZW5kKCBldmVudCApO1xufTtcblxuLy8gcHJvcGVydGllcyB0aGF0IEkgbXVuZ2UgdG8gbWFrZSBteSBsaWZlIGVhc2llclxudmFyIGRhc2hlZFZlbmRvclByb3BlcnRpZXMgPSB7XG4gICctd2Via2l0LXRyYW5zZm9ybSc6ICd0cmFuc2Zvcm0nXG59O1xuXG5wcm90by5vbnRyYW5zaXRpb25lbmQgPSBmdW5jdGlvbiggZXZlbnQgKSB7XG4gIC8vIGRpc3JlZ2FyZCBidWJibGVkIGV2ZW50cyBmcm9tIGNoaWxkcmVuXG4gIGlmICggZXZlbnQudGFyZ2V0ICE9PSB0aGlzLmVsZW1lbnQgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBfdHJhbnNpdGlvbiA9IHRoaXMuX3RyYW5zbjtcbiAgLy8gZ2V0IHByb3BlcnR5IG5hbWUgb2YgdHJhbnNpdGlvbmVkIHByb3BlcnR5LCBjb252ZXJ0IHRvIHByZWZpeC1mcmVlXG4gIHZhciBwcm9wZXJ0eU5hbWUgPSBkYXNoZWRWZW5kb3JQcm9wZXJ0aWVzWyBldmVudC5wcm9wZXJ0eU5hbWUgXSB8fCBldmVudC5wcm9wZXJ0eU5hbWU7XG5cbiAgLy8gcmVtb3ZlIHByb3BlcnR5IHRoYXQgaGFzIGNvbXBsZXRlZCB0cmFuc2l0aW9uaW5nXG4gIGRlbGV0ZSBfdHJhbnNpdGlvbi5pbmdQcm9wZXJ0aWVzWyBwcm9wZXJ0eU5hbWUgXTtcbiAgLy8gY2hlY2sgaWYgYW55IHByb3BlcnRpZXMgYXJlIHN0aWxsIHRyYW5zaXRpb25pbmdcbiAgaWYgKCBpc0VtcHR5T2JqKCBfdHJhbnNpdGlvbi5pbmdQcm9wZXJ0aWVzICkgKSB7XG4gICAgLy8gYWxsIHByb3BlcnRpZXMgaGF2ZSBjb21wbGV0ZWQgdHJhbnNpdGlvbmluZ1xuICAgIHRoaXMuZGlzYWJsZVRyYW5zaXRpb24oKTtcbiAgfVxuICAvLyBjbGVhbiBzdHlsZVxuICBpZiAoIHByb3BlcnR5TmFtZSBpbiBfdHJhbnNpdGlvbi5jbGVhbiApIHtcbiAgICAvLyBjbGVhbiB1cCBzdHlsZVxuICAgIHRoaXMuZWxlbWVudC5zdHlsZVsgZXZlbnQucHJvcGVydHlOYW1lIF0gPSAnJztcbiAgICBkZWxldGUgX3RyYW5zaXRpb24uY2xlYW5bIHByb3BlcnR5TmFtZSBdO1xuICB9XG4gIC8vIHRyaWdnZXIgb25UcmFuc2l0aW9uRW5kIGNhbGxiYWNrXG4gIGlmICggcHJvcGVydHlOYW1lIGluIF90cmFuc2l0aW9uLm9uRW5kICkge1xuICAgIHZhciBvblRyYW5zaXRpb25FbmQgPSBfdHJhbnNpdGlvbi5vbkVuZFsgcHJvcGVydHlOYW1lIF07XG4gICAgb25UcmFuc2l0aW9uRW5kLmNhbGwoIHRoaXMgKTtcbiAgICBkZWxldGUgX3RyYW5zaXRpb24ub25FbmRbIHByb3BlcnR5TmFtZSBdO1xuICB9XG5cbiAgdGhpcy5lbWl0RXZlbnQoICd0cmFuc2l0aW9uRW5kJywgWyB0aGlzIF0gKTtcbn07XG5cbnByb3RvLmRpc2FibGVUcmFuc2l0aW9uID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucmVtb3ZlVHJhbnNpdGlvblN0eWxlcygpO1xuICB0aGlzLmVsZW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lciggdHJhbnNpdGlvbkVuZEV2ZW50LCB0aGlzLCBmYWxzZSApO1xuICB0aGlzLmlzVHJhbnNpdGlvbmluZyA9IGZhbHNlO1xufTtcblxuLyoqXG4gKiByZW1vdmVzIHN0eWxlIHByb3BlcnR5IGZyb20gZWxlbWVudFxuICogQHBhcmFtIHtPYmplY3R9IHN0eWxlXG4qKi9cbnByb3RvLl9yZW1vdmVTdHlsZXMgPSBmdW5jdGlvbiggc3R5bGUgKSB7XG4gIC8vIGNsZWFuIHVwIHRyYW5zaXRpb24gc3R5bGVzXG4gIHZhciBjbGVhblN0eWxlID0ge307XG4gIGZvciAoIHZhciBwcm9wIGluIHN0eWxlICkge1xuICAgIGNsZWFuU3R5bGVbIHByb3AgXSA9ICcnO1xuICB9XG4gIHRoaXMuY3NzKCBjbGVhblN0eWxlICk7XG59O1xuXG52YXIgY2xlYW5UcmFuc2l0aW9uU3R5bGUgPSB7XG4gIHRyYW5zaXRpb25Qcm9wZXJ0eTogJycsXG4gIHRyYW5zaXRpb25EdXJhdGlvbjogJycsXG4gIHRyYW5zaXRpb25EZWxheTogJydcbn07XG5cbnByb3RvLnJlbW92ZVRyYW5zaXRpb25TdHlsZXMgPSBmdW5jdGlvbigpIHtcbiAgLy8gcmVtb3ZlIHRyYW5zaXRpb25cbiAgdGhpcy5jc3MoIGNsZWFuVHJhbnNpdGlvblN0eWxlICk7XG59O1xuXG4vLyAtLS0tLSBzdGFnZ2VyIC0tLS0tIC8vXG5cbnByb3RvLnN0YWdnZXIgPSBmdW5jdGlvbiggZGVsYXkgKSB7XG4gIGRlbGF5ID0gaXNOYU4oIGRlbGF5ICkgPyAwIDogZGVsYXk7XG4gIHRoaXMuc3RhZ2dlckRlbGF5ID0gZGVsYXkgKyAnbXMnO1xufTtcblxuLy8gLS0tLS0gc2hvdy9oaWRlL3JlbW92ZSAtLS0tLSAvL1xuXG4vLyByZW1vdmUgZWxlbWVudCBmcm9tIERPTVxucHJvdG8ucmVtb3ZlRWxlbSA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmVsZW1lbnQucGFyZW50Tm9kZS5yZW1vdmVDaGlsZCggdGhpcy5lbGVtZW50ICk7XG4gIC8vIHJlbW92ZSBkaXNwbGF5OiBub25lXG4gIHRoaXMuY3NzKHsgZGlzcGxheTogJycgfSk7XG4gIHRoaXMuZW1pdEV2ZW50KCAncmVtb3ZlJywgWyB0aGlzIF0gKTtcbn07XG5cbnByb3RvLnJlbW92ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyBqdXN0IHJlbW92ZSBlbGVtZW50IGlmIG5vIHRyYW5zaXRpb24gc3VwcG9ydCBvciBubyB0cmFuc2l0aW9uXG4gIGlmICggIXRyYW5zaXRpb25Qcm9wZXJ0eSB8fCAhcGFyc2VGbG9hdCggdGhpcy5sYXlvdXQub3B0aW9ucy50cmFuc2l0aW9uRHVyYXRpb24gKSApIHtcbiAgICB0aGlzLnJlbW92ZUVsZW0oKTtcbiAgICByZXR1cm47XG4gIH1cblxuICAvLyBzdGFydCB0cmFuc2l0aW9uXG4gIHRoaXMub25jZSggJ3RyYW5zaXRpb25FbmQnLCBmdW5jdGlvbigpIHtcbiAgICB0aGlzLnJlbW92ZUVsZW0oKTtcbiAgfSk7XG4gIHRoaXMuaGlkZSgpO1xufTtcblxucHJvdG8ucmV2ZWFsID0gZnVuY3Rpb24oKSB7XG4gIGRlbGV0ZSB0aGlzLmlzSGlkZGVuO1xuICAvLyByZW1vdmUgZGlzcGxheTogbm9uZVxuICB0aGlzLmNzcyh7IGRpc3BsYXk6ICcnIH0pO1xuXG4gIHZhciBvcHRpb25zID0gdGhpcy5sYXlvdXQub3B0aW9ucztcblxuICB2YXIgb25UcmFuc2l0aW9uRW5kID0ge307XG4gIHZhciB0cmFuc2l0aW9uRW5kUHJvcGVydHkgPSB0aGlzLmdldEhpZGVSZXZlYWxUcmFuc2l0aW9uRW5kUHJvcGVydHkoJ3Zpc2libGVTdHlsZScpO1xuICBvblRyYW5zaXRpb25FbmRbIHRyYW5zaXRpb25FbmRQcm9wZXJ0eSBdID0gdGhpcy5vblJldmVhbFRyYW5zaXRpb25FbmQ7XG5cbiAgdGhpcy50cmFuc2l0aW9uKHtcbiAgICBmcm9tOiBvcHRpb25zLmhpZGRlblN0eWxlLFxuICAgIHRvOiBvcHRpb25zLnZpc2libGVTdHlsZSxcbiAgICBpc0NsZWFuaW5nOiB0cnVlLFxuICAgIG9uVHJhbnNpdGlvbkVuZDogb25UcmFuc2l0aW9uRW5kXG4gIH0pO1xufTtcblxucHJvdG8ub25SZXZlYWxUcmFuc2l0aW9uRW5kID0gZnVuY3Rpb24oKSB7XG4gIC8vIGNoZWNrIGlmIHN0aWxsIHZpc2libGVcbiAgLy8gZHVyaW5nIHRyYW5zaXRpb24sIGl0ZW0gbWF5IGhhdmUgYmVlbiBoaWRkZW5cbiAgaWYgKCAhdGhpcy5pc0hpZGRlbiApIHtcbiAgICB0aGlzLmVtaXRFdmVudCgncmV2ZWFsJyk7XG4gIH1cbn07XG5cbi8qKlxuICogZ2V0IHN0eWxlIHByb3BlcnR5IHVzZSBmb3IgaGlkZS9yZXZlYWwgdHJhbnNpdGlvbiBlbmRcbiAqIEBwYXJhbSB7U3RyaW5nfSBzdHlsZVByb3BlcnR5IC0gaGlkZGVuU3R5bGUvdmlzaWJsZVN0eWxlXG4gKiBAcmV0dXJucyB7U3RyaW5nfVxuICovXG5wcm90by5nZXRIaWRlUmV2ZWFsVHJhbnNpdGlvbkVuZFByb3BlcnR5ID0gZnVuY3Rpb24oIHN0eWxlUHJvcGVydHkgKSB7XG4gIHZhciBvcHRpb25TdHlsZSA9IHRoaXMubGF5b3V0Lm9wdGlvbnNbIHN0eWxlUHJvcGVydHkgXTtcbiAgLy8gdXNlIG9wYWNpdHlcbiAgaWYgKCBvcHRpb25TdHlsZS5vcGFjaXR5ICkge1xuICAgIHJldHVybiAnb3BhY2l0eSc7XG4gIH1cbiAgLy8gZ2V0IGZpcnN0IHByb3BlcnR5XG4gIGZvciAoIHZhciBwcm9wIGluIG9wdGlvblN0eWxlICkge1xuICAgIHJldHVybiBwcm9wO1xuICB9XG59O1xuXG5wcm90by5oaWRlID0gZnVuY3Rpb24oKSB7XG4gIC8vIHNldCBmbGFnXG4gIHRoaXMuaXNIaWRkZW4gPSB0cnVlO1xuICAvLyByZW1vdmUgZGlzcGxheTogbm9uZVxuICB0aGlzLmNzcyh7IGRpc3BsYXk6ICcnIH0pO1xuXG4gIHZhciBvcHRpb25zID0gdGhpcy5sYXlvdXQub3B0aW9ucztcblxuICB2YXIgb25UcmFuc2l0aW9uRW5kID0ge307XG4gIHZhciB0cmFuc2l0aW9uRW5kUHJvcGVydHkgPSB0aGlzLmdldEhpZGVSZXZlYWxUcmFuc2l0aW9uRW5kUHJvcGVydHkoJ2hpZGRlblN0eWxlJyk7XG4gIG9uVHJhbnNpdGlvbkVuZFsgdHJhbnNpdGlvbkVuZFByb3BlcnR5IF0gPSB0aGlzLm9uSGlkZVRyYW5zaXRpb25FbmQ7XG5cbiAgdGhpcy50cmFuc2l0aW9uKHtcbiAgICBmcm9tOiBvcHRpb25zLnZpc2libGVTdHlsZSxcbiAgICB0bzogb3B0aW9ucy5oaWRkZW5TdHlsZSxcbiAgICAvLyBrZWVwIGhpZGRlbiBzdHVmZiBoaWRkZW5cbiAgICBpc0NsZWFuaW5nOiB0cnVlLFxuICAgIG9uVHJhbnNpdGlvbkVuZDogb25UcmFuc2l0aW9uRW5kXG4gIH0pO1xufTtcblxucHJvdG8ub25IaWRlVHJhbnNpdGlvbkVuZCA9IGZ1bmN0aW9uKCkge1xuICAvLyBjaGVjayBpZiBzdGlsbCBoaWRkZW5cbiAgLy8gZHVyaW5nIHRyYW5zaXRpb24sIGl0ZW0gbWF5IGhhdmUgYmVlbiB1bi1oaWRkZW5cbiAgaWYgKCB0aGlzLmlzSGlkZGVuICkge1xuICAgIHRoaXMuY3NzKHsgZGlzcGxheTogJ25vbmUnIH0pO1xuICAgIHRoaXMuZW1pdEV2ZW50KCdoaWRlJyk7XG4gIH1cbn07XG5cbnByb3RvLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5jc3Moe1xuICAgIHBvc2l0aW9uOiAnJyxcbiAgICBsZWZ0OiAnJyxcbiAgICByaWdodDogJycsXG4gICAgdG9wOiAnJyxcbiAgICBib3R0b206ICcnLFxuICAgIHRyYW5zaXRpb246ICcnLFxuICAgIHRyYW5zZm9ybTogJydcbiAgfSk7XG59O1xuXG5yZXR1cm4gSXRlbTtcblxufSkpO1xuXG4vKiFcbiAqIE91dGxheWVyIHYyLjEuMVxuICogdGhlIGJyYWlucyBhbmQgZ3V0cyBvZiBhIGxheW91dCBsaWJyYXJ5XG4gKiBNSVQgbGljZW5zZVxuICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgJ3VzZSBzdHJpY3QnO1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi8gLyogZ2xvYmFscyBkZWZpbmUsIG1vZHVsZSwgcmVxdWlyZSAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRCAtIFJlcXVpcmVKU1xuICAgIGRlZmluZSggJ291dGxheWVyL291dGxheWVyJyxbXG4gICAgICAgICdldi1lbWl0dGVyL2V2LWVtaXR0ZXInLFxuICAgICAgICAnZ2V0LXNpemUvZ2V0LXNpemUnLFxuICAgICAgICAnZml6enktdWktdXRpbHMvdXRpbHMnLFxuICAgICAgICAnLi9pdGVtJ1xuICAgICAgXSxcbiAgICAgIGZ1bmN0aW9uKCBFdkVtaXR0ZXIsIGdldFNpemUsIHV0aWxzLCBJdGVtICkge1xuICAgICAgICByZXR1cm4gZmFjdG9yeSggd2luZG93LCBFdkVtaXR0ZXIsIGdldFNpemUsIHV0aWxzLCBJdGVtKTtcbiAgICAgIH1cbiAgICApO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTIC0gQnJvd3NlcmlmeSwgV2VicGFja1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHJlcXVpcmUoJ2V2LWVtaXR0ZXInKSxcbiAgICAgIHJlcXVpcmUoJ2dldC1zaXplJyksXG4gICAgICByZXF1aXJlKCdmaXp6eS11aS11dGlscycpLFxuICAgICAgcmVxdWlyZSgnLi9pdGVtJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93Lk91dGxheWVyID0gZmFjdG9yeShcbiAgICAgIHdpbmRvdyxcbiAgICAgIHdpbmRvdy5FdkVtaXR0ZXIsXG4gICAgICB3aW5kb3cuZ2V0U2l6ZSxcbiAgICAgIHdpbmRvdy5maXp6eVVJVXRpbHMsXG4gICAgICB3aW5kb3cuT3V0bGF5ZXIuSXRlbVxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCB3aW5kb3csIEV2RW1pdHRlciwgZ2V0U2l6ZSwgdXRpbHMsIEl0ZW0gKSB7XG4ndXNlIHN0cmljdCc7XG5cbi8vIC0tLS0tIHZhcnMgLS0tLS0gLy9cblxudmFyIGNvbnNvbGUgPSB3aW5kb3cuY29uc29sZTtcbnZhciBqUXVlcnkgPSB3aW5kb3cualF1ZXJ5O1xudmFyIG5vb3AgPSBmdW5jdGlvbigpIHt9O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBPdXRsYXllciAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBnbG9iYWxseSB1bmlxdWUgaWRlbnRpZmllcnNcbnZhciBHVUlEID0gMDtcbi8vIGludGVybmFsIHN0b3JlIG9mIGFsbCBPdXRsYXllciBpbnRhbmNlc1xudmFyIGluc3RhbmNlcyA9IHt9O1xuXG5cbi8qKlxuICogQHBhcmFtIHtFbGVtZW50LCBTdHJpbmd9IGVsZW1lbnRcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRpb25zXG4gKiBAY29uc3RydWN0b3JcbiAqL1xuZnVuY3Rpb24gT3V0bGF5ZXIoIGVsZW1lbnQsIG9wdGlvbnMgKSB7XG4gIHZhciBxdWVyeUVsZW1lbnQgPSB1dGlscy5nZXRRdWVyeUVsZW1lbnQoIGVsZW1lbnQgKTtcbiAgaWYgKCAhcXVlcnlFbGVtZW50ICkge1xuICAgIGlmICggY29uc29sZSApIHtcbiAgICAgIGNvbnNvbGUuZXJyb3IoICdCYWQgZWxlbWVudCBmb3IgJyArIHRoaXMuY29uc3RydWN0b3IubmFtZXNwYWNlICtcbiAgICAgICAgJzogJyArICggcXVlcnlFbGVtZW50IHx8IGVsZW1lbnQgKSApO1xuICAgIH1cbiAgICByZXR1cm47XG4gIH1cbiAgdGhpcy5lbGVtZW50ID0gcXVlcnlFbGVtZW50O1xuICAvLyBhZGQgalF1ZXJ5XG4gIGlmICggalF1ZXJ5ICkge1xuICAgIHRoaXMuJGVsZW1lbnQgPSBqUXVlcnkoIHRoaXMuZWxlbWVudCApO1xuICB9XG5cbiAgLy8gb3B0aW9uc1xuICB0aGlzLm9wdGlvbnMgPSB1dGlscy5leHRlbmQoIHt9LCB0aGlzLmNvbnN0cnVjdG9yLmRlZmF1bHRzICk7XG4gIHRoaXMub3B0aW9uKCBvcHRpb25zICk7XG5cbiAgLy8gYWRkIGlkIGZvciBPdXRsYXllci5nZXRGcm9tRWxlbWVudFxuICB2YXIgaWQgPSArK0dVSUQ7XG4gIHRoaXMuZWxlbWVudC5vdXRsYXllckdVSUQgPSBpZDsgLy8gZXhwYW5kb1xuICBpbnN0YW5jZXNbIGlkIF0gPSB0aGlzOyAvLyBhc3NvY2lhdGUgdmlhIGlkXG5cbiAgLy8ga2ljayBpdCBvZmZcbiAgdGhpcy5fY3JlYXRlKCk7XG5cbiAgdmFyIGlzSW5pdExheW91dCA9IHRoaXMuX2dldE9wdGlvbignaW5pdExheW91dCcpO1xuICBpZiAoIGlzSW5pdExheW91dCApIHtcbiAgICB0aGlzLmxheW91dCgpO1xuICB9XG59XG5cbi8vIHNldHRpbmdzIGFyZSBmb3IgaW50ZXJuYWwgdXNlIG9ubHlcbk91dGxheWVyLm5hbWVzcGFjZSA9ICdvdXRsYXllcic7XG5PdXRsYXllci5JdGVtID0gSXRlbTtcblxuLy8gZGVmYXVsdCBvcHRpb25zXG5PdXRsYXllci5kZWZhdWx0cyA9IHtcbiAgY29udGFpbmVyU3R5bGU6IHtcbiAgICBwb3NpdGlvbjogJ3JlbGF0aXZlJ1xuICB9LFxuICBpbml0TGF5b3V0OiB0cnVlLFxuICBvcmlnaW5MZWZ0OiB0cnVlLFxuICBvcmlnaW5Ub3A6IHRydWUsXG4gIHJlc2l6ZTogdHJ1ZSxcbiAgcmVzaXplQ29udGFpbmVyOiB0cnVlLFxuICAvLyBpdGVtIG9wdGlvbnNcbiAgdHJhbnNpdGlvbkR1cmF0aW9uOiAnMC40cycsXG4gIGhpZGRlblN0eWxlOiB7XG4gICAgb3BhY2l0eTogMCxcbiAgICB0cmFuc2Zvcm06ICdzY2FsZSgwLjAwMSknXG4gIH0sXG4gIHZpc2libGVTdHlsZToge1xuICAgIG9wYWNpdHk6IDEsXG4gICAgdHJhbnNmb3JtOiAnc2NhbGUoMSknXG4gIH1cbn07XG5cbnZhciBwcm90byA9IE91dGxheWVyLnByb3RvdHlwZTtcbi8vIGluaGVyaXQgRXZFbWl0dGVyXG51dGlscy5leHRlbmQoIHByb3RvLCBFdkVtaXR0ZXIucHJvdG90eXBlICk7XG5cbi8qKlxuICogc2V0IG9wdGlvbnNcbiAqIEBwYXJhbSB7T2JqZWN0fSBvcHRzXG4gKi9cbnByb3RvLm9wdGlvbiA9IGZ1bmN0aW9uKCBvcHRzICkge1xuICB1dGlscy5leHRlbmQoIHRoaXMub3B0aW9ucywgb3B0cyApO1xufTtcblxuLyoqXG4gKiBnZXQgYmFja3dhcmRzIGNvbXBhdGlibGUgb3B0aW9uIHZhbHVlLCBjaGVjayBvbGQgbmFtZVxuICovXG5wcm90by5fZ2V0T3B0aW9uID0gZnVuY3Rpb24oIG9wdGlvbiApIHtcbiAgdmFyIG9sZE9wdGlvbiA9IHRoaXMuY29uc3RydWN0b3IuY29tcGF0T3B0aW9uc1sgb3B0aW9uIF07XG4gIHJldHVybiBvbGRPcHRpb24gJiYgdGhpcy5vcHRpb25zWyBvbGRPcHRpb24gXSAhPT0gdW5kZWZpbmVkID9cbiAgICB0aGlzLm9wdGlvbnNbIG9sZE9wdGlvbiBdIDogdGhpcy5vcHRpb25zWyBvcHRpb24gXTtcbn07XG5cbk91dGxheWVyLmNvbXBhdE9wdGlvbnMgPSB7XG4gIC8vIGN1cnJlbnROYW1lOiBvbGROYW1lXG4gIGluaXRMYXlvdXQ6ICdpc0luaXRMYXlvdXQnLFxuICBob3Jpem9udGFsOiAnaXNIb3Jpem9udGFsJyxcbiAgbGF5b3V0SW5zdGFudDogJ2lzTGF5b3V0SW5zdGFudCcsXG4gIG9yaWdpbkxlZnQ6ICdpc09yaWdpbkxlZnQnLFxuICBvcmlnaW5Ub3A6ICdpc09yaWdpblRvcCcsXG4gIHJlc2l6ZTogJ2lzUmVzaXplQm91bmQnLFxuICByZXNpemVDb250YWluZXI6ICdpc1Jlc2l6aW5nQ29udGFpbmVyJ1xufTtcblxucHJvdG8uX2NyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyBnZXQgaXRlbXMgZnJvbSBjaGlsZHJlblxuICB0aGlzLnJlbG9hZEl0ZW1zKCk7XG4gIC8vIGVsZW1lbnRzIHRoYXQgYWZmZWN0IGxheW91dCwgYnV0IGFyZSBub3QgbGFpZCBvdXRcbiAgdGhpcy5zdGFtcHMgPSBbXTtcbiAgdGhpcy5zdGFtcCggdGhpcy5vcHRpb25zLnN0YW1wICk7XG4gIC8vIHNldCBjb250YWluZXIgc3R5bGVcbiAgdXRpbHMuZXh0ZW5kKCB0aGlzLmVsZW1lbnQuc3R5bGUsIHRoaXMub3B0aW9ucy5jb250YWluZXJTdHlsZSApO1xuXG4gIC8vIGJpbmQgcmVzaXplIG1ldGhvZFxuICB2YXIgY2FuQmluZFJlc2l6ZSA9IHRoaXMuX2dldE9wdGlvbigncmVzaXplJyk7XG4gIGlmICggY2FuQmluZFJlc2l6ZSApIHtcbiAgICB0aGlzLmJpbmRSZXNpemUoKTtcbiAgfVxufTtcblxuLy8gZ29lcyB0aHJvdWdoIGFsbCBjaGlsZHJlbiBhZ2FpbiBhbmQgZ2V0cyBicmlja3MgaW4gcHJvcGVyIG9yZGVyXG5wcm90by5yZWxvYWRJdGVtcyA9IGZ1bmN0aW9uKCkge1xuICAvLyBjb2xsZWN0aW9uIG9mIGl0ZW0gZWxlbWVudHNcbiAgdGhpcy5pdGVtcyA9IHRoaXMuX2l0ZW1pemUoIHRoaXMuZWxlbWVudC5jaGlsZHJlbiApO1xufTtcblxuXG4vKipcbiAqIHR1cm4gZWxlbWVudHMgaW50byBPdXRsYXllci5JdGVtcyB0byBiZSB1c2VkIGluIGxheW91dFxuICogQHBhcmFtIHtBcnJheSBvciBOb2RlTGlzdCBvciBIVE1MRWxlbWVudH0gZWxlbXNcbiAqIEByZXR1cm5zIHtBcnJheX0gaXRlbXMgLSBjb2xsZWN0aW9uIG9mIG5ldyBPdXRsYXllciBJdGVtc1xuICovXG5wcm90by5faXRlbWl6ZSA9IGZ1bmN0aW9uKCBlbGVtcyApIHtcblxuICB2YXIgaXRlbUVsZW1zID0gdGhpcy5fZmlsdGVyRmluZEl0ZW1FbGVtZW50cyggZWxlbXMgKTtcbiAgdmFyIEl0ZW0gPSB0aGlzLmNvbnN0cnVjdG9yLkl0ZW07XG5cbiAgLy8gY3JlYXRlIG5ldyBPdXRsYXllciBJdGVtcyBmb3IgY29sbGVjdGlvblxuICB2YXIgaXRlbXMgPSBbXTtcbiAgZm9yICggdmFyIGk9MDsgaSA8IGl0ZW1FbGVtcy5sZW5ndGg7IGkrKyApIHtcbiAgICB2YXIgZWxlbSA9IGl0ZW1FbGVtc1tpXTtcbiAgICB2YXIgaXRlbSA9IG5ldyBJdGVtKCBlbGVtLCB0aGlzICk7XG4gICAgaXRlbXMucHVzaCggaXRlbSApO1xuICB9XG5cbiAgcmV0dXJuIGl0ZW1zO1xufTtcblxuLyoqXG4gKiBnZXQgaXRlbSBlbGVtZW50cyB0byBiZSB1c2VkIGluIGxheW91dFxuICogQHBhcmFtIHtBcnJheSBvciBOb2RlTGlzdCBvciBIVE1MRWxlbWVudH0gZWxlbXNcbiAqIEByZXR1cm5zIHtBcnJheX0gaXRlbXMgLSBpdGVtIGVsZW1lbnRzXG4gKi9cbnByb3RvLl9maWx0ZXJGaW5kSXRlbUVsZW1lbnRzID0gZnVuY3Rpb24oIGVsZW1zICkge1xuICByZXR1cm4gdXRpbHMuZmlsdGVyRmluZEVsZW1lbnRzKCBlbGVtcywgdGhpcy5vcHRpb25zLml0ZW1TZWxlY3RvciApO1xufTtcblxuLyoqXG4gKiBnZXR0ZXIgbWV0aG9kIGZvciBnZXR0aW5nIGl0ZW0gZWxlbWVudHNcbiAqIEByZXR1cm5zIHtBcnJheX0gZWxlbXMgLSBjb2xsZWN0aW9uIG9mIGl0ZW0gZWxlbWVudHNcbiAqL1xucHJvdG8uZ2V0SXRlbUVsZW1lbnRzID0gZnVuY3Rpb24oKSB7XG4gIHJldHVybiB0aGlzLml0ZW1zLm1hcCggZnVuY3Rpb24oIGl0ZW0gKSB7XG4gICAgcmV0dXJuIGl0ZW0uZWxlbWVudDtcbiAgfSk7XG59O1xuXG4vLyAtLS0tLSBpbml0ICYgbGF5b3V0IC0tLS0tIC8vXG5cbi8qKlxuICogbGF5cyBvdXQgYWxsIGl0ZW1zXG4gKi9cbnByb3RvLmxheW91dCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9yZXNldExheW91dCgpO1xuICB0aGlzLl9tYW5hZ2VTdGFtcHMoKTtcblxuICAvLyBkb24ndCBhbmltYXRlIGZpcnN0IGxheW91dFxuICB2YXIgbGF5b3V0SW5zdGFudCA9IHRoaXMuX2dldE9wdGlvbignbGF5b3V0SW5zdGFudCcpO1xuICB2YXIgaXNJbnN0YW50ID0gbGF5b3V0SW5zdGFudCAhPT0gdW5kZWZpbmVkID9cbiAgICBsYXlvdXRJbnN0YW50IDogIXRoaXMuX2lzTGF5b3V0SW5pdGVkO1xuICB0aGlzLmxheW91dEl0ZW1zKCB0aGlzLml0ZW1zLCBpc0luc3RhbnQgKTtcblxuICAvLyBmbGFnIGZvciBpbml0YWxpemVkXG4gIHRoaXMuX2lzTGF5b3V0SW5pdGVkID0gdHJ1ZTtcbn07XG5cbi8vIF9pbml0IGlzIGFsaWFzIGZvciBsYXlvdXRcbnByb3RvLl9pbml0ID0gcHJvdG8ubGF5b3V0O1xuXG4vKipcbiAqIGxvZ2ljIGJlZm9yZSBhbnkgbmV3IGxheW91dFxuICovXG5wcm90by5fcmVzZXRMYXlvdXQgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5nZXRTaXplKCk7XG59O1xuXG5cbnByb3RvLmdldFNpemUgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5zaXplID0gZ2V0U2l6ZSggdGhpcy5lbGVtZW50ICk7XG59O1xuXG4vKipcbiAqIGdldCBtZWFzdXJlbWVudCBmcm9tIG9wdGlvbiwgZm9yIGNvbHVtbldpZHRoLCByb3dIZWlnaHQsIGd1dHRlclxuICogaWYgb3B0aW9uIGlzIFN0cmluZyAtPiBnZXQgZWxlbWVudCBmcm9tIHNlbGVjdG9yIHN0cmluZywgJiBnZXQgc2l6ZSBvZiBlbGVtZW50XG4gKiBpZiBvcHRpb24gaXMgRWxlbWVudCAtPiBnZXQgc2l6ZSBvZiBlbGVtZW50XG4gKiBlbHNlIHVzZSBvcHRpb24gYXMgYSBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge1N0cmluZ30gbWVhc3VyZW1lbnRcbiAqIEBwYXJhbSB7U3RyaW5nfSBzaXplIC0gd2lkdGggb3IgaGVpZ2h0XG4gKiBAcHJpdmF0ZVxuICovXG5wcm90by5fZ2V0TWVhc3VyZW1lbnQgPSBmdW5jdGlvbiggbWVhc3VyZW1lbnQsIHNpemUgKSB7XG4gIHZhciBvcHRpb24gPSB0aGlzLm9wdGlvbnNbIG1lYXN1cmVtZW50IF07XG4gIHZhciBlbGVtO1xuICBpZiAoICFvcHRpb24gKSB7XG4gICAgLy8gZGVmYXVsdCB0byAwXG4gICAgdGhpc1sgbWVhc3VyZW1lbnQgXSA9IDA7XG4gIH0gZWxzZSB7XG4gICAgLy8gdXNlIG9wdGlvbiBhcyBhbiBlbGVtZW50XG4gICAgaWYgKCB0eXBlb2Ygb3B0aW9uID09ICdzdHJpbmcnICkge1xuICAgICAgZWxlbSA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKCBvcHRpb24gKTtcbiAgICB9IGVsc2UgaWYgKCBvcHRpb24gaW5zdGFuY2VvZiBIVE1MRWxlbWVudCApIHtcbiAgICAgIGVsZW0gPSBvcHRpb247XG4gICAgfVxuICAgIC8vIHVzZSBzaXplIG9mIGVsZW1lbnQsIGlmIGVsZW1lbnRcbiAgICB0aGlzWyBtZWFzdXJlbWVudCBdID0gZWxlbSA/IGdldFNpemUoIGVsZW0gKVsgc2l6ZSBdIDogb3B0aW9uO1xuICB9XG59O1xuXG4vKipcbiAqIGxheW91dCBhIGNvbGxlY3Rpb24gb2YgaXRlbSBlbGVtZW50c1xuICogQGFwaSBwdWJsaWNcbiAqL1xucHJvdG8ubGF5b3V0SXRlbXMgPSBmdW5jdGlvbiggaXRlbXMsIGlzSW5zdGFudCApIHtcbiAgaXRlbXMgPSB0aGlzLl9nZXRJdGVtc0ZvckxheW91dCggaXRlbXMgKTtcblxuICB0aGlzLl9sYXlvdXRJdGVtcyggaXRlbXMsIGlzSW5zdGFudCApO1xuXG4gIHRoaXMuX3Bvc3RMYXlvdXQoKTtcbn07XG5cbi8qKlxuICogZ2V0IHRoZSBpdGVtcyB0byBiZSBsYWlkIG91dFxuICogeW91IG1heSB3YW50IHRvIHNraXAgb3ZlciBzb21lIGl0ZW1zXG4gKiBAcGFyYW0ge0FycmF5fSBpdGVtc1xuICogQHJldHVybnMge0FycmF5fSBpdGVtc1xuICovXG5wcm90by5fZ2V0SXRlbXNGb3JMYXlvdXQgPSBmdW5jdGlvbiggaXRlbXMgKSB7XG4gIHJldHVybiBpdGVtcy5maWx0ZXIoIGZ1bmN0aW9uKCBpdGVtICkge1xuICAgIHJldHVybiAhaXRlbS5pc0lnbm9yZWQ7XG4gIH0pO1xufTtcblxuLyoqXG4gKiBsYXlvdXQgaXRlbXNcbiAqIEBwYXJhbSB7QXJyYXl9IGl0ZW1zXG4gKiBAcGFyYW0ge0Jvb2xlYW59IGlzSW5zdGFudFxuICovXG5wcm90by5fbGF5b3V0SXRlbXMgPSBmdW5jdGlvbiggaXRlbXMsIGlzSW5zdGFudCApIHtcbiAgdGhpcy5fZW1pdENvbXBsZXRlT25JdGVtcyggJ2xheW91dCcsIGl0ZW1zICk7XG5cbiAgaWYgKCAhaXRlbXMgfHwgIWl0ZW1zLmxlbmd0aCApIHtcbiAgICAvLyBubyBpdGVtcywgZW1pdCBldmVudCB3aXRoIGVtcHR5IGFycmF5XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdmFyIHF1ZXVlID0gW107XG5cbiAgaXRlbXMuZm9yRWFjaCggZnVuY3Rpb24oIGl0ZW0gKSB7XG4gICAgLy8gZ2V0IHgveSBvYmplY3QgZnJvbSBtZXRob2RcbiAgICB2YXIgcG9zaXRpb24gPSB0aGlzLl9nZXRJdGVtTGF5b3V0UG9zaXRpb24oIGl0ZW0gKTtcbiAgICAvLyBlbnF1ZXVlXG4gICAgcG9zaXRpb24uaXRlbSA9IGl0ZW07XG4gICAgcG9zaXRpb24uaXNJbnN0YW50ID0gaXNJbnN0YW50IHx8IGl0ZW0uaXNMYXlvdXRJbnN0YW50O1xuICAgIHF1ZXVlLnB1c2goIHBvc2l0aW9uICk7XG4gIH0sIHRoaXMgKTtcblxuICB0aGlzLl9wcm9jZXNzTGF5b3V0UXVldWUoIHF1ZXVlICk7XG59O1xuXG4vKipcbiAqIGdldCBpdGVtIGxheW91dCBwb3NpdGlvblxuICogQHBhcmFtIHtPdXRsYXllci5JdGVtfSBpdGVtXG4gKiBAcmV0dXJucyB7T2JqZWN0fSB4IGFuZCB5IHBvc2l0aW9uXG4gKi9cbnByb3RvLl9nZXRJdGVtTGF5b3V0UG9zaXRpb24gPSBmdW5jdGlvbiggLyogaXRlbSAqLyApIHtcbiAgcmV0dXJuIHtcbiAgICB4OiAwLFxuICAgIHk6IDBcbiAgfTtcbn07XG5cbi8qKlxuICogaXRlcmF0ZSBvdmVyIGFycmF5IGFuZCBwb3NpdGlvbiBlYWNoIGl0ZW1cbiAqIFJlYXNvbiBiZWluZyAtIHNlcGFyYXRpbmcgdGhpcyBsb2dpYyBwcmV2ZW50cyAnbGF5b3V0IGludmFsaWRhdGlvbidcbiAqIHRoeCBAcGF1bF9pcmlzaFxuICogQHBhcmFtIHtBcnJheX0gcXVldWVcbiAqL1xucHJvdG8uX3Byb2Nlc3NMYXlvdXRRdWV1ZSA9IGZ1bmN0aW9uKCBxdWV1ZSApIHtcbiAgdGhpcy51cGRhdGVTdGFnZ2VyKCk7XG4gIHF1ZXVlLmZvckVhY2goIGZ1bmN0aW9uKCBvYmosIGkgKSB7XG4gICAgdGhpcy5fcG9zaXRpb25JdGVtKCBvYmouaXRlbSwgb2JqLngsIG9iai55LCBvYmouaXNJbnN0YW50LCBpICk7XG4gIH0sIHRoaXMgKTtcbn07XG5cbi8vIHNldCBzdGFnZ2VyIGZyb20gb3B0aW9uIGluIG1pbGxpc2Vjb25kcyBudW1iZXJcbnByb3RvLnVwZGF0ZVN0YWdnZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHN0YWdnZXIgPSB0aGlzLm9wdGlvbnMuc3RhZ2dlcjtcbiAgaWYgKCBzdGFnZ2VyID09PSBudWxsIHx8IHN0YWdnZXIgPT09IHVuZGVmaW5lZCApIHtcbiAgICB0aGlzLnN0YWdnZXIgPSAwO1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnN0YWdnZXIgPSBnZXRNaWxsaXNlY29uZHMoIHN0YWdnZXIgKTtcbiAgcmV0dXJuIHRoaXMuc3RhZ2dlcjtcbn07XG5cbi8qKlxuICogU2V0cyBwb3NpdGlvbiBvZiBpdGVtIGluIERPTVxuICogQHBhcmFtIHtPdXRsYXllci5JdGVtfSBpdGVtXG4gKiBAcGFyYW0ge051bWJlcn0geCAtIGhvcml6b250YWwgcG9zaXRpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSB5IC0gdmVydGljYWwgcG9zaXRpb25cbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNJbnN0YW50IC0gZGlzYWJsZXMgdHJhbnNpdGlvbnNcbiAqL1xucHJvdG8uX3Bvc2l0aW9uSXRlbSA9IGZ1bmN0aW9uKCBpdGVtLCB4LCB5LCBpc0luc3RhbnQsIGkgKSB7XG4gIGlmICggaXNJbnN0YW50ICkge1xuICAgIC8vIGlmIG5vdCB0cmFuc2l0aW9uLCBqdXN0IHNldCBDU1NcbiAgICBpdGVtLmdvVG8oIHgsIHkgKTtcbiAgfSBlbHNlIHtcbiAgICBpdGVtLnN0YWdnZXIoIGkgKiB0aGlzLnN0YWdnZXIgKTtcbiAgICBpdGVtLm1vdmVUbyggeCwgeSApO1xuICB9XG59O1xuXG4vKipcbiAqIEFueSBsb2dpYyB5b3Ugd2FudCB0byBkbyBhZnRlciBlYWNoIGxheW91dCxcbiAqIGkuZS4gc2l6ZSB0aGUgY29udGFpbmVyXG4gKi9cbnByb3RvLl9wb3N0TGF5b3V0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucmVzaXplQ29udGFpbmVyKCk7XG59O1xuXG5wcm90by5yZXNpemVDb250YWluZXIgPSBmdW5jdGlvbigpIHtcbiAgdmFyIGlzUmVzaXppbmdDb250YWluZXIgPSB0aGlzLl9nZXRPcHRpb24oJ3Jlc2l6ZUNvbnRhaW5lcicpO1xuICBpZiAoICFpc1Jlc2l6aW5nQ29udGFpbmVyICkge1xuICAgIHJldHVybjtcbiAgfVxuICB2YXIgc2l6ZSA9IHRoaXMuX2dldENvbnRhaW5lclNpemUoKTtcbiAgaWYgKCBzaXplICkge1xuICAgIHRoaXMuX3NldENvbnRhaW5lck1lYXN1cmUoIHNpemUud2lkdGgsIHRydWUgKTtcbiAgICB0aGlzLl9zZXRDb250YWluZXJNZWFzdXJlKCBzaXplLmhlaWdodCwgZmFsc2UgKTtcbiAgfVxufTtcblxuLyoqXG4gKiBTZXRzIHdpZHRoIG9yIGhlaWdodCBvZiBjb250YWluZXIgaWYgcmV0dXJuZWRcbiAqIEByZXR1cm5zIHtPYmplY3R9IHNpemVcbiAqICAgQHBhcmFtIHtOdW1iZXJ9IHdpZHRoXG4gKiAgIEBwYXJhbSB7TnVtYmVyfSBoZWlnaHRcbiAqL1xucHJvdG8uX2dldENvbnRhaW5lclNpemUgPSBub29wO1xuXG4vKipcbiAqIEBwYXJhbSB7TnVtYmVyfSBtZWFzdXJlIC0gc2l6ZSBvZiB3aWR0aCBvciBoZWlnaHRcbiAqIEBwYXJhbSB7Qm9vbGVhbn0gaXNXaWR0aFxuICovXG5wcm90by5fc2V0Q29udGFpbmVyTWVhc3VyZSA9IGZ1bmN0aW9uKCBtZWFzdXJlLCBpc1dpZHRoICkge1xuICBpZiAoIG1lYXN1cmUgPT09IHVuZGVmaW5lZCApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB2YXIgZWxlbVNpemUgPSB0aGlzLnNpemU7XG4gIC8vIGFkZCBwYWRkaW5nIGFuZCBib3JkZXIgd2lkdGggaWYgYm9yZGVyIGJveFxuICBpZiAoIGVsZW1TaXplLmlzQm9yZGVyQm94ICkge1xuICAgIG1lYXN1cmUgKz0gaXNXaWR0aCA/IGVsZW1TaXplLnBhZGRpbmdMZWZ0ICsgZWxlbVNpemUucGFkZGluZ1JpZ2h0ICtcbiAgICAgIGVsZW1TaXplLmJvcmRlckxlZnRXaWR0aCArIGVsZW1TaXplLmJvcmRlclJpZ2h0V2lkdGggOlxuICAgICAgZWxlbVNpemUucGFkZGluZ0JvdHRvbSArIGVsZW1TaXplLnBhZGRpbmdUb3AgK1xuICAgICAgZWxlbVNpemUuYm9yZGVyVG9wV2lkdGggKyBlbGVtU2l6ZS5ib3JkZXJCb3R0b21XaWR0aDtcbiAgfVxuXG4gIG1lYXN1cmUgPSBNYXRoLm1heCggbWVhc3VyZSwgMCApO1xuICB0aGlzLmVsZW1lbnQuc3R5bGVbIGlzV2lkdGggPyAnd2lkdGgnIDogJ2hlaWdodCcgXSA9IG1lYXN1cmUgKyAncHgnO1xufTtcblxuLyoqXG4gKiBlbWl0IGV2ZW50Q29tcGxldGUgb24gYSBjb2xsZWN0aW9uIG9mIGl0ZW1zIGV2ZW50c1xuICogQHBhcmFtIHtTdHJpbmd9IGV2ZW50TmFtZVxuICogQHBhcmFtIHtBcnJheX0gaXRlbXMgLSBPdXRsYXllci5JdGVtc1xuICovXG5wcm90by5fZW1pdENvbXBsZXRlT25JdGVtcyA9IGZ1bmN0aW9uKCBldmVudE5hbWUsIGl0ZW1zICkge1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuICBmdW5jdGlvbiBvbkNvbXBsZXRlKCkge1xuICAgIF90aGlzLmRpc3BhdGNoRXZlbnQoIGV2ZW50TmFtZSArICdDb21wbGV0ZScsIG51bGwsIFsgaXRlbXMgXSApO1xuICB9XG5cbiAgdmFyIGNvdW50ID0gaXRlbXMubGVuZ3RoO1xuICBpZiAoICFpdGVtcyB8fCAhY291bnQgKSB7XG4gICAgb25Db21wbGV0ZSgpO1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHZhciBkb25lQ291bnQgPSAwO1xuICBmdW5jdGlvbiB0aWNrKCkge1xuICAgIGRvbmVDb3VudCsrO1xuICAgIGlmICggZG9uZUNvdW50ID09IGNvdW50ICkge1xuICAgICAgb25Db21wbGV0ZSgpO1xuICAgIH1cbiAgfVxuXG4gIC8vIGJpbmQgY2FsbGJhY2tcbiAgaXRlbXMuZm9yRWFjaCggZnVuY3Rpb24oIGl0ZW0gKSB7XG4gICAgaXRlbS5vbmNlKCBldmVudE5hbWUsIHRpY2sgKTtcbiAgfSk7XG59O1xuXG4vKipcbiAqIGVtaXRzIGV2ZW50cyB2aWEgRXZFbWl0dGVyIGFuZCBqUXVlcnkgZXZlbnRzXG4gKiBAcGFyYW0ge1N0cmluZ30gdHlwZSAtIG5hbWUgb2YgZXZlbnRcbiAqIEBwYXJhbSB7RXZlbnR9IGV2ZW50IC0gb3JpZ2luYWwgZXZlbnRcbiAqIEBwYXJhbSB7QXJyYXl9IGFyZ3MgLSBleHRyYSBhcmd1bWVudHNcbiAqL1xucHJvdG8uZGlzcGF0Y2hFdmVudCA9IGZ1bmN0aW9uKCB0eXBlLCBldmVudCwgYXJncyApIHtcbiAgLy8gYWRkIG9yaWdpbmFsIGV2ZW50IHRvIGFyZ3VtZW50c1xuICB2YXIgZW1pdEFyZ3MgPSBldmVudCA/IFsgZXZlbnQgXS5jb25jYXQoIGFyZ3MgKSA6IGFyZ3M7XG4gIHRoaXMuZW1pdEV2ZW50KCB0eXBlLCBlbWl0QXJncyApO1xuXG4gIGlmICggalF1ZXJ5ICkge1xuICAgIC8vIHNldCB0aGlzLiRlbGVtZW50XG4gICAgdGhpcy4kZWxlbWVudCA9IHRoaXMuJGVsZW1lbnQgfHwgalF1ZXJ5KCB0aGlzLmVsZW1lbnQgKTtcbiAgICBpZiAoIGV2ZW50ICkge1xuICAgICAgLy8gY3JlYXRlIGpRdWVyeSBldmVudFxuICAgICAgdmFyICRldmVudCA9IGpRdWVyeS5FdmVudCggZXZlbnQgKTtcbiAgICAgICRldmVudC50eXBlID0gdHlwZTtcbiAgICAgIHRoaXMuJGVsZW1lbnQudHJpZ2dlciggJGV2ZW50LCBhcmdzICk7XG4gICAgfSBlbHNlIHtcbiAgICAgIC8vIGp1c3QgdHJpZ2dlciB3aXRoIHR5cGUgaWYgbm8gZXZlbnQgYXZhaWxhYmxlXG4gICAgICB0aGlzLiRlbGVtZW50LnRyaWdnZXIoIHR5cGUsIGFyZ3MgKTtcbiAgICB9XG4gIH1cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGlnbm9yZSAmIHN0YW1wcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG5cbi8qKlxuICoga2VlcCBpdGVtIGluIGNvbGxlY3Rpb24sIGJ1dCBkbyBub3QgbGF5IGl0IG91dFxuICogaWdub3JlZCBpdGVtcyBkbyBub3QgZ2V0IHNraXBwZWQgaW4gbGF5b3V0XG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1cbiAqL1xucHJvdG8uaWdub3JlID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIHZhciBpdGVtID0gdGhpcy5nZXRJdGVtKCBlbGVtICk7XG4gIGlmICggaXRlbSApIHtcbiAgICBpdGVtLmlzSWdub3JlZCA9IHRydWU7XG4gIH1cbn07XG5cbi8qKlxuICogcmV0dXJuIGl0ZW0gdG8gbGF5b3V0IGNvbGxlY3Rpb25cbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbVxuICovXG5wcm90by51bmlnbm9yZSA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICB2YXIgaXRlbSA9IHRoaXMuZ2V0SXRlbSggZWxlbSApO1xuICBpZiAoIGl0ZW0gKSB7XG4gICAgZGVsZXRlIGl0ZW0uaXNJZ25vcmVkO1xuICB9XG59O1xuXG4vKipcbiAqIGFkZHMgZWxlbWVudHMgdG8gc3RhbXBzXG4gKiBAcGFyYW0ge05vZGVMaXN0LCBBcnJheSwgRWxlbWVudCwgb3IgU3RyaW5nfSBlbGVtc1xuICovXG5wcm90by5zdGFtcCA9IGZ1bmN0aW9uKCBlbGVtcyApIHtcbiAgZWxlbXMgPSB0aGlzLl9maW5kKCBlbGVtcyApO1xuICBpZiAoICFlbGVtcyApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB0aGlzLnN0YW1wcyA9IHRoaXMuc3RhbXBzLmNvbmNhdCggZWxlbXMgKTtcbiAgLy8gaWdub3JlXG4gIGVsZW1zLmZvckVhY2goIHRoaXMuaWdub3JlLCB0aGlzICk7XG59O1xuXG4vKipcbiAqIHJlbW92ZXMgZWxlbWVudHMgdG8gc3RhbXBzXG4gKiBAcGFyYW0ge05vZGVMaXN0LCBBcnJheSwgb3IgRWxlbWVudH0gZWxlbXNcbiAqL1xucHJvdG8udW5zdGFtcCA9IGZ1bmN0aW9uKCBlbGVtcyApIHtcbiAgZWxlbXMgPSB0aGlzLl9maW5kKCBlbGVtcyApO1xuICBpZiAoICFlbGVtcyApe1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGVsZW1zLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtICkge1xuICAgIC8vIGZpbHRlciBvdXQgcmVtb3ZlZCBzdGFtcCBlbGVtZW50c1xuICAgIHV0aWxzLnJlbW92ZUZyb20oIHRoaXMuc3RhbXBzLCBlbGVtICk7XG4gICAgdGhpcy51bmlnbm9yZSggZWxlbSApO1xuICB9LCB0aGlzICk7XG59O1xuXG4vKipcbiAqIGZpbmRzIGNoaWxkIGVsZW1lbnRzXG4gKiBAcGFyYW0ge05vZGVMaXN0LCBBcnJheSwgRWxlbWVudCwgb3IgU3RyaW5nfSBlbGVtc1xuICogQHJldHVybnMge0FycmF5fSBlbGVtc1xuICovXG5wcm90by5fZmluZCA9IGZ1bmN0aW9uKCBlbGVtcyApIHtcbiAgaWYgKCAhZWxlbXMgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGlmIHN0cmluZywgdXNlIGFyZ3VtZW50IGFzIHNlbGVjdG9yIHN0cmluZ1xuICBpZiAoIHR5cGVvZiBlbGVtcyA9PSAnc3RyaW5nJyApIHtcbiAgICBlbGVtcyA9IHRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yQWxsKCBlbGVtcyApO1xuICB9XG4gIGVsZW1zID0gdXRpbHMubWFrZUFycmF5KCBlbGVtcyApO1xuICByZXR1cm4gZWxlbXM7XG59O1xuXG5wcm90by5fbWFuYWdlU3RhbXBzID0gZnVuY3Rpb24oKSB7XG4gIGlmICggIXRoaXMuc3RhbXBzIHx8ICF0aGlzLnN0YW1wcy5sZW5ndGggKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgdGhpcy5fZ2V0Qm91bmRpbmdSZWN0KCk7XG5cbiAgdGhpcy5zdGFtcHMuZm9yRWFjaCggdGhpcy5fbWFuYWdlU3RhbXAsIHRoaXMgKTtcbn07XG5cbi8vIHVwZGF0ZSBib3VuZGluZ0xlZnQgLyBUb3BcbnByb3RvLl9nZXRCb3VuZGluZ1JlY3QgPSBmdW5jdGlvbigpIHtcbiAgLy8gZ2V0IGJvdW5kaW5nIHJlY3QgZm9yIGNvbnRhaW5lciBlbGVtZW50XG4gIHZhciBib3VuZGluZ1JlY3QgPSB0aGlzLmVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gIHZhciBzaXplID0gdGhpcy5zaXplO1xuICB0aGlzLl9ib3VuZGluZ1JlY3QgPSB7XG4gICAgbGVmdDogYm91bmRpbmdSZWN0LmxlZnQgKyBzaXplLnBhZGRpbmdMZWZ0ICsgc2l6ZS5ib3JkZXJMZWZ0V2lkdGgsXG4gICAgdG9wOiBib3VuZGluZ1JlY3QudG9wICsgc2l6ZS5wYWRkaW5nVG9wICsgc2l6ZS5ib3JkZXJUb3BXaWR0aCxcbiAgICByaWdodDogYm91bmRpbmdSZWN0LnJpZ2h0IC0gKCBzaXplLnBhZGRpbmdSaWdodCArIHNpemUuYm9yZGVyUmlnaHRXaWR0aCApLFxuICAgIGJvdHRvbTogYm91bmRpbmdSZWN0LmJvdHRvbSAtICggc2l6ZS5wYWRkaW5nQm90dG9tICsgc2l6ZS5ib3JkZXJCb3R0b21XaWR0aCApXG4gIH07XG59O1xuXG4vKipcbiAqIEBwYXJhbSB7RWxlbWVudH0gc3RhbXBcbioqL1xucHJvdG8uX21hbmFnZVN0YW1wID0gbm9vcDtcblxuLyoqXG4gKiBnZXQgeC95IHBvc2l0aW9uIG9mIGVsZW1lbnQgcmVsYXRpdmUgdG8gY29udGFpbmVyIGVsZW1lbnRcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbVxuICogQHJldHVybnMge09iamVjdH0gb2Zmc2V0IC0gaGFzIGxlZnQsIHRvcCwgcmlnaHQsIGJvdHRvbVxuICovXG5wcm90by5fZ2V0RWxlbWVudE9mZnNldCA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICB2YXIgYm91bmRpbmdSZWN0ID0gZWxlbS5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKTtcbiAgdmFyIHRoaXNSZWN0ID0gdGhpcy5fYm91bmRpbmdSZWN0O1xuICB2YXIgc2l6ZSA9IGdldFNpemUoIGVsZW0gKTtcbiAgdmFyIG9mZnNldCA9IHtcbiAgICBsZWZ0OiBib3VuZGluZ1JlY3QubGVmdCAtIHRoaXNSZWN0LmxlZnQgLSBzaXplLm1hcmdpbkxlZnQsXG4gICAgdG9wOiBib3VuZGluZ1JlY3QudG9wIC0gdGhpc1JlY3QudG9wIC0gc2l6ZS5tYXJnaW5Ub3AsXG4gICAgcmlnaHQ6IHRoaXNSZWN0LnJpZ2h0IC0gYm91bmRpbmdSZWN0LnJpZ2h0IC0gc2l6ZS5tYXJnaW5SaWdodCxcbiAgICBib3R0b206IHRoaXNSZWN0LmJvdHRvbSAtIGJvdW5kaW5nUmVjdC5ib3R0b20gLSBzaXplLm1hcmdpbkJvdHRvbVxuICB9O1xuICByZXR1cm4gb2Zmc2V0O1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gcmVzaXplIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8vIGVuYWJsZSBldmVudCBoYW5kbGVycyBmb3IgbGlzdGVuZXJzXG4vLyBpLmUuIHJlc2l6ZSAtPiBvbnJlc2l6ZVxucHJvdG8uaGFuZGxlRXZlbnQgPSB1dGlscy5oYW5kbGVFdmVudDtcblxuLyoqXG4gKiBCaW5kIGxheW91dCB0byB3aW5kb3cgcmVzaXppbmdcbiAqL1xucHJvdG8uYmluZFJlc2l6ZSA9IGZ1bmN0aW9uKCkge1xuICB3aW5kb3cuYWRkRXZlbnRMaXN0ZW5lciggJ3Jlc2l6ZScsIHRoaXMgKTtcbiAgdGhpcy5pc1Jlc2l6ZUJvdW5kID0gdHJ1ZTtcbn07XG5cbi8qKlxuICogVW5iaW5kIGxheW91dCB0byB3aW5kb3cgcmVzaXppbmdcbiAqL1xucHJvdG8udW5iaW5kUmVzaXplID0gZnVuY3Rpb24oKSB7XG4gIHdpbmRvdy5yZW1vdmVFdmVudExpc3RlbmVyKCAncmVzaXplJywgdGhpcyApO1xuICB0aGlzLmlzUmVzaXplQm91bmQgPSBmYWxzZTtcbn07XG5cbnByb3RvLm9ucmVzaXplID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMucmVzaXplKCk7XG59O1xuXG51dGlscy5kZWJvdW5jZU1ldGhvZCggT3V0bGF5ZXIsICdvbnJlc2l6ZScsIDEwMCApO1xuXG5wcm90by5yZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgLy8gZG9uJ3QgdHJpZ2dlciBpZiBzaXplIGRpZCBub3QgY2hhbmdlXG4gIC8vIG9yIGlmIHJlc2l6ZSB3YXMgdW5ib3VuZC4gU2VlICM5XG4gIGlmICggIXRoaXMuaXNSZXNpemVCb3VuZCB8fCAhdGhpcy5uZWVkc1Jlc2l6ZUxheW91dCgpICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHRoaXMubGF5b3V0KCk7XG59O1xuXG4vKipcbiAqIGNoZWNrIGlmIGxheW91dCBpcyBuZWVkZWQgcG9zdCBsYXlvdXRcbiAqIEByZXR1cm5zIEJvb2xlYW5cbiAqL1xucHJvdG8ubmVlZHNSZXNpemVMYXlvdXQgPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNpemUgPSBnZXRTaXplKCB0aGlzLmVsZW1lbnQgKTtcbiAgLy8gY2hlY2sgdGhhdCB0aGlzLnNpemUgYW5kIHNpemUgYXJlIHRoZXJlXG4gIC8vIElFOCB0cmlnZ2VycyByZXNpemUgb24gYm9keSBzaXplIGNoYW5nZSwgc28gdGhleSBtaWdodCBub3QgYmVcbiAgdmFyIGhhc1NpemVzID0gdGhpcy5zaXplICYmIHNpemU7XG4gIHJldHVybiBoYXNTaXplcyAmJiBzaXplLmlubmVyV2lkdGggIT09IHRoaXMuc2l6ZS5pbm5lcldpZHRoO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gbWV0aG9kcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIGFkZCBpdGVtcyB0byBPdXRsYXllciBpbnN0YW5jZVxuICogQHBhcmFtIHtBcnJheSBvciBOb2RlTGlzdCBvciBFbGVtZW50fSBlbGVtc1xuICogQHJldHVybnMge0FycmF5fSBpdGVtcyAtIE91dGxheWVyLkl0ZW1zXG4qKi9cbnByb3RvLmFkZEl0ZW1zID0gZnVuY3Rpb24oIGVsZW1zICkge1xuICB2YXIgaXRlbXMgPSB0aGlzLl9pdGVtaXplKCBlbGVtcyApO1xuICAvLyBhZGQgaXRlbXMgdG8gY29sbGVjdGlvblxuICBpZiAoIGl0ZW1zLmxlbmd0aCApIHtcbiAgICB0aGlzLml0ZW1zID0gdGhpcy5pdGVtcy5jb25jYXQoIGl0ZW1zICk7XG4gIH1cbiAgcmV0dXJuIGl0ZW1zO1xufTtcblxuLyoqXG4gKiBMYXlvdXQgbmV3bHktYXBwZW5kZWQgaXRlbSBlbGVtZW50c1xuICogQHBhcmFtIHtBcnJheSBvciBOb2RlTGlzdCBvciBFbGVtZW50fSBlbGVtc1xuICovXG5wcm90by5hcHBlbmRlZCA9IGZ1bmN0aW9uKCBlbGVtcyApIHtcbiAgdmFyIGl0ZW1zID0gdGhpcy5hZGRJdGVtcyggZWxlbXMgKTtcbiAgaWYgKCAhaXRlbXMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuICAvLyBsYXlvdXQgYW5kIHJldmVhbCBqdXN0IHRoZSBuZXcgaXRlbXNcbiAgdGhpcy5sYXlvdXRJdGVtcyggaXRlbXMsIHRydWUgKTtcbiAgdGhpcy5yZXZlYWwoIGl0ZW1zICk7XG59O1xuXG4vKipcbiAqIExheW91dCBwcmVwZW5kZWQgZWxlbWVudHNcbiAqIEBwYXJhbSB7QXJyYXkgb3IgTm9kZUxpc3Qgb3IgRWxlbWVudH0gZWxlbXNcbiAqL1xucHJvdG8ucHJlcGVuZGVkID0gZnVuY3Rpb24oIGVsZW1zICkge1xuICB2YXIgaXRlbXMgPSB0aGlzLl9pdGVtaXplKCBlbGVtcyApO1xuICBpZiAoICFpdGVtcy5sZW5ndGggKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGFkZCBpdGVtcyB0byBiZWdpbm5pbmcgb2YgY29sbGVjdGlvblxuICB2YXIgcHJldmlvdXNJdGVtcyA9IHRoaXMuaXRlbXMuc2xpY2UoMCk7XG4gIHRoaXMuaXRlbXMgPSBpdGVtcy5jb25jYXQoIHByZXZpb3VzSXRlbXMgKTtcbiAgLy8gc3RhcnQgbmV3IGxheW91dFxuICB0aGlzLl9yZXNldExheW91dCgpO1xuICB0aGlzLl9tYW5hZ2VTdGFtcHMoKTtcbiAgLy8gbGF5b3V0IG5ldyBzdHVmZiB3aXRob3V0IHRyYW5zaXRpb25cbiAgdGhpcy5sYXlvdXRJdGVtcyggaXRlbXMsIHRydWUgKTtcbiAgdGhpcy5yZXZlYWwoIGl0ZW1zICk7XG4gIC8vIGxheW91dCBwcmV2aW91cyBpdGVtc1xuICB0aGlzLmxheW91dEl0ZW1zKCBwcmV2aW91c0l0ZW1zICk7XG59O1xuXG4vKipcbiAqIHJldmVhbCBhIGNvbGxlY3Rpb24gb2YgaXRlbXNcbiAqIEBwYXJhbSB7QXJyYXkgb2YgT3V0bGF5ZXIuSXRlbXN9IGl0ZW1zXG4gKi9cbnByb3RvLnJldmVhbCA9IGZ1bmN0aW9uKCBpdGVtcyApIHtcbiAgdGhpcy5fZW1pdENvbXBsZXRlT25JdGVtcyggJ3JldmVhbCcsIGl0ZW1zICk7XG4gIGlmICggIWl0ZW1zIHx8ICFpdGVtcy5sZW5ndGggKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZhciBzdGFnZ2VyID0gdGhpcy51cGRhdGVTdGFnZ2VyKCk7XG4gIGl0ZW1zLmZvckVhY2goIGZ1bmN0aW9uKCBpdGVtLCBpICkge1xuICAgIGl0ZW0uc3RhZ2dlciggaSAqIHN0YWdnZXIgKTtcbiAgICBpdGVtLnJldmVhbCgpO1xuICB9KTtcbn07XG5cbi8qKlxuICogaGlkZSBhIGNvbGxlY3Rpb24gb2YgaXRlbXNcbiAqIEBwYXJhbSB7QXJyYXkgb2YgT3V0bGF5ZXIuSXRlbXN9IGl0ZW1zXG4gKi9cbnByb3RvLmhpZGUgPSBmdW5jdGlvbiggaXRlbXMgKSB7XG4gIHRoaXMuX2VtaXRDb21wbGV0ZU9uSXRlbXMoICdoaWRlJywgaXRlbXMgKTtcbiAgaWYgKCAhaXRlbXMgfHwgIWl0ZW1zLmxlbmd0aCApIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIHN0YWdnZXIgPSB0aGlzLnVwZGF0ZVN0YWdnZXIoKTtcbiAgaXRlbXMuZm9yRWFjaCggZnVuY3Rpb24oIGl0ZW0sIGkgKSB7XG4gICAgaXRlbS5zdGFnZ2VyKCBpICogc3RhZ2dlciApO1xuICAgIGl0ZW0uaGlkZSgpO1xuICB9KTtcbn07XG5cbi8qKlxuICogcmV2ZWFsIGl0ZW0gZWxlbWVudHNcbiAqIEBwYXJhbSB7QXJyYXl9LCB7RWxlbWVudH0sIHtOb2RlTGlzdH0gaXRlbXNcbiAqL1xucHJvdG8ucmV2ZWFsSXRlbUVsZW1lbnRzID0gZnVuY3Rpb24oIGVsZW1zICkge1xuICB2YXIgaXRlbXMgPSB0aGlzLmdldEl0ZW1zKCBlbGVtcyApO1xuICB0aGlzLnJldmVhbCggaXRlbXMgKTtcbn07XG5cbi8qKlxuICogaGlkZSBpdGVtIGVsZW1lbnRzXG4gKiBAcGFyYW0ge0FycmF5fSwge0VsZW1lbnR9LCB7Tm9kZUxpc3R9IGl0ZW1zXG4gKi9cbnByb3RvLmhpZGVJdGVtRWxlbWVudHMgPSBmdW5jdGlvbiggZWxlbXMgKSB7XG4gIHZhciBpdGVtcyA9IHRoaXMuZ2V0SXRlbXMoIGVsZW1zICk7XG4gIHRoaXMuaGlkZSggaXRlbXMgKTtcbn07XG5cbi8qKlxuICogZ2V0IE91dGxheWVyLkl0ZW0sIGdpdmVuIGFuIEVsZW1lbnRcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbVxuICogQHBhcmFtIHtGdW5jdGlvbn0gY2FsbGJhY2tcbiAqIEByZXR1cm5zIHtPdXRsYXllci5JdGVtfSBpdGVtXG4gKi9cbnByb3RvLmdldEl0ZW0gPSBmdW5jdGlvbiggZWxlbSApIHtcbiAgLy8gbG9vcCB0aHJvdWdoIGl0ZW1zIHRvIGdldCB0aGUgb25lIHRoYXQgbWF0Y2hlc1xuICBmb3IgKCB2YXIgaT0wOyBpIDwgdGhpcy5pdGVtcy5sZW5ndGg7IGkrKyApIHtcbiAgICB2YXIgaXRlbSA9IHRoaXMuaXRlbXNbaV07XG4gICAgaWYgKCBpdGVtLmVsZW1lbnQgPT0gZWxlbSApIHtcbiAgICAgIC8vIHJldHVybiBpdGVtXG4gICAgICByZXR1cm4gaXRlbTtcbiAgICB9XG4gIH1cbn07XG5cbi8qKlxuICogZ2V0IGNvbGxlY3Rpb24gb2YgT3V0bGF5ZXIuSXRlbXMsIGdpdmVuIEVsZW1lbnRzXG4gKiBAcGFyYW0ge0FycmF5fSBlbGVtc1xuICogQHJldHVybnMge0FycmF5fSBpdGVtcyAtIE91dGxheWVyLkl0ZW1zXG4gKi9cbnByb3RvLmdldEl0ZW1zID0gZnVuY3Rpb24oIGVsZW1zICkge1xuICBlbGVtcyA9IHV0aWxzLm1ha2VBcnJheSggZWxlbXMgKTtcbiAgdmFyIGl0ZW1zID0gW107XG4gIGVsZW1zLmZvckVhY2goIGZ1bmN0aW9uKCBlbGVtICkge1xuICAgIHZhciBpdGVtID0gdGhpcy5nZXRJdGVtKCBlbGVtICk7XG4gICAgaWYgKCBpdGVtICkge1xuICAgICAgaXRlbXMucHVzaCggaXRlbSApO1xuICAgIH1cbiAgfSwgdGhpcyApO1xuXG4gIHJldHVybiBpdGVtcztcbn07XG5cbi8qKlxuICogcmVtb3ZlIGVsZW1lbnQocykgZnJvbSBpbnN0YW5jZSBhbmQgRE9NXG4gKiBAcGFyYW0ge0FycmF5IG9yIE5vZGVMaXN0IG9yIEVsZW1lbnR9IGVsZW1zXG4gKi9cbnByb3RvLnJlbW92ZSA9IGZ1bmN0aW9uKCBlbGVtcyApIHtcbiAgdmFyIHJlbW92ZUl0ZW1zID0gdGhpcy5nZXRJdGVtcyggZWxlbXMgKTtcblxuICB0aGlzLl9lbWl0Q29tcGxldGVPbkl0ZW1zKCAncmVtb3ZlJywgcmVtb3ZlSXRlbXMgKTtcblxuICAvLyBiYWlsIGlmIG5vIGl0ZW1zIHRvIHJlbW92ZVxuICBpZiAoICFyZW1vdmVJdGVtcyB8fCAhcmVtb3ZlSXRlbXMubGVuZ3RoICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIHJlbW92ZUl0ZW1zLmZvckVhY2goIGZ1bmN0aW9uKCBpdGVtICkge1xuICAgIGl0ZW0ucmVtb3ZlKCk7XG4gICAgLy8gcmVtb3ZlIGl0ZW0gZnJvbSBjb2xsZWN0aW9uXG4gICAgdXRpbHMucmVtb3ZlRnJvbSggdGhpcy5pdGVtcywgaXRlbSApO1xuICB9LCB0aGlzICk7XG59O1xuXG4vLyAtLS0tLSBkZXN0cm95IC0tLS0tIC8vXG5cbi8vIHJlbW92ZSBhbmQgZGlzYWJsZSBPdXRsYXllciBpbnN0YW5jZVxucHJvdG8uZGVzdHJveSA9IGZ1bmN0aW9uKCkge1xuICAvLyBjbGVhbiB1cCBkeW5hbWljIHN0eWxlc1xuICB2YXIgc3R5bGUgPSB0aGlzLmVsZW1lbnQuc3R5bGU7XG4gIHN0eWxlLmhlaWdodCA9ICcnO1xuICBzdHlsZS5wb3NpdGlvbiA9ICcnO1xuICBzdHlsZS53aWR0aCA9ICcnO1xuICAvLyBkZXN0cm95IGl0ZW1zXG4gIHRoaXMuaXRlbXMuZm9yRWFjaCggZnVuY3Rpb24oIGl0ZW0gKSB7XG4gICAgaXRlbS5kZXN0cm95KCk7XG4gIH0pO1xuXG4gIHRoaXMudW5iaW5kUmVzaXplKCk7XG5cbiAgdmFyIGlkID0gdGhpcy5lbGVtZW50Lm91dGxheWVyR1VJRDtcbiAgZGVsZXRlIGluc3RhbmNlc1sgaWQgXTsgLy8gcmVtb3ZlIHJlZmVyZW5jZSB0byBpbnN0YW5jZSBieSBpZFxuICBkZWxldGUgdGhpcy5lbGVtZW50Lm91dGxheWVyR1VJRDtcbiAgLy8gcmVtb3ZlIGRhdGEgZm9yIGpRdWVyeVxuICBpZiAoIGpRdWVyeSApIHtcbiAgICBqUXVlcnkucmVtb3ZlRGF0YSggdGhpcy5lbGVtZW50LCB0aGlzLmNvbnN0cnVjdG9yLm5hbWVzcGFjZSApO1xuICB9XG5cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGRhdGEgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLyoqXG4gKiBnZXQgT3V0bGF5ZXIgaW5zdGFuY2UgZnJvbSBlbGVtZW50XG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1cbiAqIEByZXR1cm5zIHtPdXRsYXllcn1cbiAqL1xuT3V0bGF5ZXIuZGF0YSA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICBlbGVtID0gdXRpbHMuZ2V0UXVlcnlFbGVtZW50KCBlbGVtICk7XG4gIHZhciBpZCA9IGVsZW0gJiYgZWxlbS5vdXRsYXllckdVSUQ7XG4gIHJldHVybiBpZCAmJiBpbnN0YW5jZXNbIGlkIF07XG59O1xuXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGNyZWF0ZSBPdXRsYXllciBjbGFzcyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIGNyZWF0ZSBhIGxheW91dCBjbGFzc1xuICogQHBhcmFtIHtTdHJpbmd9IG5hbWVzcGFjZVxuICovXG5PdXRsYXllci5jcmVhdGUgPSBmdW5jdGlvbiggbmFtZXNwYWNlLCBvcHRpb25zICkge1xuICAvLyBzdWItY2xhc3MgT3V0bGF5ZXJcbiAgdmFyIExheW91dCA9IHN1YmNsYXNzKCBPdXRsYXllciApO1xuICAvLyBhcHBseSBuZXcgb3B0aW9ucyBhbmQgY29tcGF0T3B0aW9uc1xuICBMYXlvdXQuZGVmYXVsdHMgPSB1dGlscy5leHRlbmQoIHt9LCBPdXRsYXllci5kZWZhdWx0cyApO1xuICB1dGlscy5leHRlbmQoIExheW91dC5kZWZhdWx0cywgb3B0aW9ucyApO1xuICBMYXlvdXQuY29tcGF0T3B0aW9ucyA9IHV0aWxzLmV4dGVuZCgge30sIE91dGxheWVyLmNvbXBhdE9wdGlvbnMgICk7XG5cbiAgTGF5b3V0Lm5hbWVzcGFjZSA9IG5hbWVzcGFjZTtcblxuICBMYXlvdXQuZGF0YSA9IE91dGxheWVyLmRhdGE7XG5cbiAgLy8gc3ViLWNsYXNzIEl0ZW1cbiAgTGF5b3V0Lkl0ZW0gPSBzdWJjbGFzcyggSXRlbSApO1xuXG4gIC8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGRlY2xhcmF0aXZlIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbiAgdXRpbHMuaHRtbEluaXQoIExheW91dCwgbmFtZXNwYWNlICk7XG5cbiAgLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0galF1ZXJ5IGJyaWRnZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4gIC8vIG1ha2UgaW50byBqUXVlcnkgcGx1Z2luXG4gIGlmICggalF1ZXJ5ICYmIGpRdWVyeS5icmlkZ2V0ICkge1xuICAgIGpRdWVyeS5icmlkZ2V0KCBuYW1lc3BhY2UsIExheW91dCApO1xuICB9XG5cbiAgcmV0dXJuIExheW91dDtcbn07XG5cbmZ1bmN0aW9uIHN1YmNsYXNzKCBQYXJlbnQgKSB7XG4gIGZ1bmN0aW9uIFN1YkNsYXNzKCkge1xuICAgIFBhcmVudC5hcHBseSggdGhpcywgYXJndW1lbnRzICk7XG4gIH1cblxuICBTdWJDbGFzcy5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBQYXJlbnQucHJvdG90eXBlICk7XG4gIFN1YkNsYXNzLnByb3RvdHlwZS5jb25zdHJ1Y3RvciA9IFN1YkNsYXNzO1xuXG4gIHJldHVybiBTdWJDbGFzcztcbn1cblxuLy8gLS0tLS0gaGVscGVycyAtLS0tLSAvL1xuXG4vLyBob3cgbWFueSBtaWxsaXNlY29uZHMgYXJlIGluIGVhY2ggdW5pdFxudmFyIG1zVW5pdHMgPSB7XG4gIG1zOiAxLFxuICBzOiAxMDAwXG59O1xuXG4vLyBtdW5nZSB0aW1lLWxpa2UgcGFyYW1ldGVyIGludG8gbWlsbGlzZWNvbmQgbnVtYmVyXG4vLyAnMC40cycgLT4gNDBcbmZ1bmN0aW9uIGdldE1pbGxpc2Vjb25kcyggdGltZSApIHtcbiAgaWYgKCB0eXBlb2YgdGltZSA9PSAnbnVtYmVyJyApIHtcbiAgICByZXR1cm4gdGltZTtcbiAgfVxuICB2YXIgbWF0Y2hlcyA9IHRpbWUubWF0Y2goIC8oXlxcZCpcXC4/XFxkKikoXFx3KikvICk7XG4gIHZhciBudW0gPSBtYXRjaGVzICYmIG1hdGNoZXNbMV07XG4gIHZhciB1bml0ID0gbWF0Y2hlcyAmJiBtYXRjaGVzWzJdO1xuICBpZiAoICFudW0ubGVuZ3RoICkge1xuICAgIHJldHVybiAwO1xuICB9XG4gIG51bSA9IHBhcnNlRmxvYXQoIG51bSApO1xuICB2YXIgbXVsdCA9IG1zVW5pdHNbIHVuaXQgXSB8fCAxO1xuICByZXR1cm4gbnVtICogbXVsdDtcbn1cblxuLy8gLS0tLS0gZmluIC0tLS0tIC8vXG5cbi8vIGJhY2sgaW4gZ2xvYmFsXG5PdXRsYXllci5JdGVtID0gSXRlbTtcblxucmV0dXJuIE91dGxheWVyO1xuXG59KSk7XG5cbi8qKlxuICogUmVjdFxuICogbG93LWxldmVsIHV0aWxpdHkgY2xhc3MgZm9yIGJhc2ljIGdlb21ldHJ5XG4gKi9cblxuKCBmdW5jdGlvbiggd2luZG93LCBmYWN0b3J5ICkge1xuICAvLyB1bml2ZXJzYWwgbW9kdWxlIGRlZmluaXRpb25cbiAgLyoganNoaW50IHN0cmljdDogZmFsc2UgKi8gLyogZ2xvYmFscyBkZWZpbmUsIG1vZHVsZSAqL1xuICBpZiAoIHR5cGVvZiBkZWZpbmUgPT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kICkge1xuICAgIC8vIEFNRFxuICAgIGRlZmluZSggJ3BhY2tlcnkvanMvcmVjdCcsZmFjdG9yeSApO1xuICB9IGVsc2UgaWYgKCB0eXBlb2YgbW9kdWxlID09ICdvYmplY3QnICYmIG1vZHVsZS5leHBvcnRzICkge1xuICAgIC8vIENvbW1vbkpTXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KCk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB3aW5kb3cuUGFja2VyeSA9IHdpbmRvdy5QYWNrZXJ5IHx8IHt9O1xuICAgIHdpbmRvdy5QYWNrZXJ5LlJlY3QgPSBmYWN0b3J5KCk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCkge1xuJ3VzZSBzdHJpY3QnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBSZWN0IC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmZ1bmN0aW9uIFJlY3QoIHByb3BzICkge1xuICAvLyBleHRlbmQgcHJvcGVydGllcyBmcm9tIGRlZmF1bHRzXG4gIGZvciAoIHZhciBwcm9wIGluIFJlY3QuZGVmYXVsdHMgKSB7XG4gICAgdGhpc1sgcHJvcCBdID0gUmVjdC5kZWZhdWx0c1sgcHJvcCBdO1xuICB9XG5cbiAgZm9yICggcHJvcCBpbiBwcm9wcyApIHtcbiAgICB0aGlzWyBwcm9wIF0gPSBwcm9wc1sgcHJvcCBdO1xuICB9XG5cbn1cblxuUmVjdC5kZWZhdWx0cyA9IHtcbiAgeDogMCxcbiAgeTogMCxcbiAgd2lkdGg6IDAsXG4gIGhlaWdodDogMFxufTtcblxudmFyIHByb3RvID0gUmVjdC5wcm90b3R5cGU7XG5cbi8qKlxuICogRGV0ZXJtaW5lcyB3aGV0aGVyIG9yIG5vdCB0aGlzIHJlY3RhbmdsZSB3aG9sbHkgZW5jbG9zZXMgYW5vdGhlciByZWN0YW5nbGUgb3IgcG9pbnQuXG4gKiBAcGFyYW0ge1JlY3R9IHJlY3RcbiAqIEByZXR1cm5zIHtCb29sZWFufVxuKiovXG5wcm90by5jb250YWlucyA9IGZ1bmN0aW9uKCByZWN0ICkge1xuICAvLyBwb2ludHMgZG9uJ3QgaGF2ZSB3aWR0aCBvciBoZWlnaHRcbiAgdmFyIG90aGVyV2lkdGggPSByZWN0LndpZHRoIHx8IDA7XG4gIHZhciBvdGhlckhlaWdodCA9IHJlY3QuaGVpZ2h0IHx8IDA7XG4gIHJldHVybiB0aGlzLnggPD0gcmVjdC54ICYmXG4gICAgdGhpcy55IDw9IHJlY3QueSAmJlxuICAgIHRoaXMueCArIHRoaXMud2lkdGggPj0gcmVjdC54ICsgb3RoZXJXaWR0aCAmJlxuICAgIHRoaXMueSArIHRoaXMuaGVpZ2h0ID49IHJlY3QueSArIG90aGVySGVpZ2h0O1xufTtcblxuLyoqXG4gKiBEZXRlcm1pbmVzIHdoZXRoZXIgb3Igbm90IHRoZSByZWN0YW5nbGUgaW50ZXJzZWN0cyB3aXRoIGFub3RoZXIuXG4gKiBAcGFyYW0ge1JlY3R9IHJlY3RcbiAqIEByZXR1cm5zIHtCb29sZWFufVxuKiovXG5wcm90by5vdmVybGFwcyA9IGZ1bmN0aW9uKCByZWN0ICkge1xuICB2YXIgdGhpc1JpZ2h0ID0gdGhpcy54ICsgdGhpcy53aWR0aDtcbiAgdmFyIHRoaXNCb3R0b20gPSB0aGlzLnkgKyB0aGlzLmhlaWdodDtcbiAgdmFyIHJlY3RSaWdodCA9IHJlY3QueCArIHJlY3Qud2lkdGg7XG4gIHZhciByZWN0Qm90dG9tID0gcmVjdC55ICsgcmVjdC5oZWlnaHQ7XG5cbiAgLy8gaHR0cDovL3N0YWNrb3ZlcmZsb3cuY29tL2EvMzA2MzMyXG4gIHJldHVybiB0aGlzLnggPCByZWN0UmlnaHQgJiZcbiAgICB0aGlzUmlnaHQgPiByZWN0LnggJiZcbiAgICB0aGlzLnkgPCByZWN0Qm90dG9tICYmXG4gICAgdGhpc0JvdHRvbSA+IHJlY3QueTtcbn07XG5cbi8qKlxuICogQHBhcmFtIHtSZWN0fSByZWN0IC0gdGhlIG92ZXJsYXBwaW5nIHJlY3RcbiAqIEByZXR1cm5zIHtBcnJheX0gZnJlZVJlY3RzIC0gcmVjdHMgcmVwcmVzZW50aW5nIHRoZSBhcmVhIGFyb3VuZCB0aGUgcmVjdFxuKiovXG5wcm90by5nZXRNYXhpbWFsRnJlZVJlY3RzID0gZnVuY3Rpb24oIHJlY3QgKSB7XG5cbiAgLy8gaWYgbm8gaW50ZXJzZWN0aW9uLCByZXR1cm4gZmFsc2VcbiAgaWYgKCAhdGhpcy5vdmVybGFwcyggcmVjdCApICkge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxuXG4gIHZhciBmcmVlUmVjdHMgPSBbXTtcbiAgdmFyIGZyZWVSZWN0O1xuXG4gIHZhciB0aGlzUmlnaHQgPSB0aGlzLnggKyB0aGlzLndpZHRoO1xuICB2YXIgdGhpc0JvdHRvbSA9IHRoaXMueSArIHRoaXMuaGVpZ2h0O1xuICB2YXIgcmVjdFJpZ2h0ID0gcmVjdC54ICsgcmVjdC53aWR0aDtcbiAgdmFyIHJlY3RCb3R0b20gPSByZWN0LnkgKyByZWN0LmhlaWdodDtcblxuICAvLyB0b3BcbiAgaWYgKCB0aGlzLnkgPCByZWN0LnkgKSB7XG4gICAgZnJlZVJlY3QgPSBuZXcgUmVjdCh7XG4gICAgICB4OiB0aGlzLngsXG4gICAgICB5OiB0aGlzLnksXG4gICAgICB3aWR0aDogdGhpcy53aWR0aCxcbiAgICAgIGhlaWdodDogcmVjdC55IC0gdGhpcy55XG4gICAgfSk7XG4gICAgZnJlZVJlY3RzLnB1c2goIGZyZWVSZWN0ICk7XG4gIH1cblxuICAvLyByaWdodFxuICBpZiAoIHRoaXNSaWdodCA+IHJlY3RSaWdodCApIHtcbiAgICBmcmVlUmVjdCA9IG5ldyBSZWN0KHtcbiAgICAgIHg6IHJlY3RSaWdodCxcbiAgICAgIHk6IHRoaXMueSxcbiAgICAgIHdpZHRoOiB0aGlzUmlnaHQgLSByZWN0UmlnaHQsXG4gICAgICBoZWlnaHQ6IHRoaXMuaGVpZ2h0XG4gICAgfSk7XG4gICAgZnJlZVJlY3RzLnB1c2goIGZyZWVSZWN0ICk7XG4gIH1cblxuICAvLyBib3R0b21cbiAgaWYgKCB0aGlzQm90dG9tID4gcmVjdEJvdHRvbSApIHtcbiAgICBmcmVlUmVjdCA9IG5ldyBSZWN0KHtcbiAgICAgIHg6IHRoaXMueCxcbiAgICAgIHk6IHJlY3RCb3R0b20sXG4gICAgICB3aWR0aDogdGhpcy53aWR0aCxcbiAgICAgIGhlaWdodDogdGhpc0JvdHRvbSAtIHJlY3RCb3R0b21cbiAgICB9KTtcbiAgICBmcmVlUmVjdHMucHVzaCggZnJlZVJlY3QgKTtcbiAgfVxuXG4gIC8vIGxlZnRcbiAgaWYgKCB0aGlzLnggPCByZWN0LnggKSB7XG4gICAgZnJlZVJlY3QgPSBuZXcgUmVjdCh7XG4gICAgICB4OiB0aGlzLngsXG4gICAgICB5OiB0aGlzLnksXG4gICAgICB3aWR0aDogcmVjdC54IC0gdGhpcy54LFxuICAgICAgaGVpZ2h0OiB0aGlzLmhlaWdodFxuICAgIH0pO1xuICAgIGZyZWVSZWN0cy5wdXNoKCBmcmVlUmVjdCApO1xuICB9XG5cbiAgcmV0dXJuIGZyZWVSZWN0cztcbn07XG5cbnByb3RvLmNhbkZpdCA9IGZ1bmN0aW9uKCByZWN0ICkge1xuICByZXR1cm4gdGhpcy53aWR0aCA+PSByZWN0LndpZHRoICYmIHRoaXMuaGVpZ2h0ID49IHJlY3QuaGVpZ2h0O1xufTtcblxucmV0dXJuIFJlY3Q7XG5cbn0pKTtcblxuLyoqXG4gKiBQYWNrZXJcbiAqIGJpbi1wYWNraW5nIGFsZ29yaXRobVxuICovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qIGpzaGludCBzdHJpY3Q6IGZhbHNlICovIC8qIGdsb2JhbHMgZGVmaW5lLCBtb2R1bGUsIHJlcXVpcmUgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoICdwYWNrZXJ5L2pzL3BhY2tlcicsWyAnLi9yZWN0JyBdLCBmYWN0b3J5ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICByZXF1aXJlKCcuL3JlY3QnKVxuICAgICk7XG4gIH0gZWxzZSB7XG4gICAgLy8gYnJvd3NlciBnbG9iYWxcbiAgICB2YXIgUGFja2VyeSA9IHdpbmRvdy5QYWNrZXJ5ID0gd2luZG93LlBhY2tlcnkgfHwge307XG4gICAgUGFja2VyeS5QYWNrZXIgPSBmYWN0b3J5KCBQYWNrZXJ5LlJlY3QgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIFJlY3QgKSB7XG4ndXNlIHN0cmljdCc7XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIFBhY2tlciAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIEBwYXJhbSB7TnVtYmVyfSB3aWR0aFxuICogQHBhcmFtIHtOdW1iZXJ9IGhlaWdodFxuICogQHBhcmFtIHtTdHJpbmd9IHNvcnREaXJlY3Rpb25cbiAqICAgdG9wTGVmdCBmb3IgdmVydGljYWwsIGxlZnRUb3AgZm9yIGhvcml6b250YWxcbiAqL1xuZnVuY3Rpb24gUGFja2VyKCB3aWR0aCwgaGVpZ2h0LCBzb3J0RGlyZWN0aW9uICkge1xuICB0aGlzLndpZHRoID0gd2lkdGggfHwgMDtcbiAgdGhpcy5oZWlnaHQgPSBoZWlnaHQgfHwgMDtcbiAgdGhpcy5zb3J0RGlyZWN0aW9uID0gc29ydERpcmVjdGlvbiB8fCAnZG93bndhcmRMZWZ0VG9SaWdodCc7XG5cbiAgdGhpcy5yZXNldCgpO1xufVxuXG52YXIgcHJvdG8gPSBQYWNrZXIucHJvdG90eXBlO1xuXG5wcm90by5yZXNldCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnNwYWNlcyA9IFtdO1xuXG4gIHZhciBpbml0aWFsU3BhY2UgPSBuZXcgUmVjdCh7XG4gICAgeDogMCxcbiAgICB5OiAwLFxuICAgIHdpZHRoOiB0aGlzLndpZHRoLFxuICAgIGhlaWdodDogdGhpcy5oZWlnaHRcbiAgfSk7XG5cbiAgdGhpcy5zcGFjZXMucHVzaCggaW5pdGlhbFNwYWNlICk7XG4gIC8vIHNldCBzb3J0ZXJcbiAgdGhpcy5zb3J0ZXIgPSBzb3J0ZXJzWyB0aGlzLnNvcnREaXJlY3Rpb24gXSB8fCBzb3J0ZXJzLmRvd253YXJkTGVmdFRvUmlnaHQ7XG59O1xuXG4vLyBjaGFuZ2UgeCBhbmQgeSBvZiByZWN0IHRvIGZpdCB3aXRoIGluIFBhY2tlcidzIGF2YWlsYWJsZSBzcGFjZXNcbnByb3RvLnBhY2sgPSBmdW5jdGlvbiggcmVjdCApIHtcbiAgZm9yICggdmFyIGk9MDsgaSA8IHRoaXMuc3BhY2VzLmxlbmd0aDsgaSsrICkge1xuICAgIHZhciBzcGFjZSA9IHRoaXMuc3BhY2VzW2ldO1xuICAgIGlmICggc3BhY2UuY2FuRml0KCByZWN0ICkgKSB7XG4gICAgICB0aGlzLnBsYWNlSW5TcGFjZSggcmVjdCwgc3BhY2UgKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufTtcblxucHJvdG8uY29sdW1uUGFjayA9IGZ1bmN0aW9uKCByZWN0ICkge1xuICBmb3IgKCB2YXIgaT0wOyBpIDwgdGhpcy5zcGFjZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIHNwYWNlID0gdGhpcy5zcGFjZXNbaV07XG4gICAgdmFyIGNhbkZpdEluU3BhY2VDb2x1bW4gPSBzcGFjZS54IDw9IHJlY3QueCAmJlxuICAgICAgc3BhY2UueCArIHNwYWNlLndpZHRoID49IHJlY3QueCArIHJlY3Qud2lkdGggJiZcbiAgICAgIHNwYWNlLmhlaWdodCA+PSByZWN0LmhlaWdodCAtIDAuMDE7IC8vIGZ1ZGdlIG51bWJlciBmb3Igcm91bmRpbmcgZXJyb3JcbiAgICBpZiAoIGNhbkZpdEluU3BhY2VDb2x1bW4gKSB7XG4gICAgICByZWN0LnkgPSBzcGFjZS55O1xuICAgICAgdGhpcy5wbGFjZWQoIHJlY3QgKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufTtcblxucHJvdG8ucm93UGFjayA9IGZ1bmN0aW9uKCByZWN0ICkge1xuICBmb3IgKCB2YXIgaT0wOyBpIDwgdGhpcy5zcGFjZXMubGVuZ3RoOyBpKysgKSB7XG4gICAgdmFyIHNwYWNlID0gdGhpcy5zcGFjZXNbaV07XG4gICAgdmFyIGNhbkZpdEluU3BhY2VSb3cgPSBzcGFjZS55IDw9IHJlY3QueSAmJlxuICAgICAgc3BhY2UueSArIHNwYWNlLmhlaWdodCA+PSByZWN0LnkgKyByZWN0LmhlaWdodCAmJlxuICAgICAgc3BhY2Uud2lkdGggPj0gcmVjdC53aWR0aCAtIDAuMDE7IC8vIGZ1ZGdlIG51bWJlciBmb3Igcm91bmRpbmcgZXJyb3JcbiAgICBpZiAoIGNhbkZpdEluU3BhY2VSb3cgKSB7XG4gICAgICByZWN0LnggPSBzcGFjZS54O1xuICAgICAgdGhpcy5wbGFjZWQoIHJlY3QgKTtcbiAgICAgIGJyZWFrO1xuICAgIH1cbiAgfVxufTtcblxucHJvdG8ucGxhY2VJblNwYWNlID0gZnVuY3Rpb24oIHJlY3QsIHNwYWNlICkge1xuICAvLyBwbGFjZSByZWN0IGluIHNwYWNlXG4gIHJlY3QueCA9IHNwYWNlLng7XG4gIHJlY3QueSA9IHNwYWNlLnk7XG5cbiAgdGhpcy5wbGFjZWQoIHJlY3QgKTtcbn07XG5cbi8vIHVwZGF0ZSBzcGFjZXMgd2l0aCBwbGFjZWQgcmVjdFxucHJvdG8ucGxhY2VkID0gZnVuY3Rpb24oIHJlY3QgKSB7XG4gIC8vIHVwZGF0ZSBzcGFjZXNcbiAgdmFyIHJldmlzZWRTcGFjZXMgPSBbXTtcbiAgZm9yICggdmFyIGk9MDsgaSA8IHRoaXMuc3BhY2VzLmxlbmd0aDsgaSsrICkge1xuICAgIHZhciBzcGFjZSA9IHRoaXMuc3BhY2VzW2ldO1xuICAgIHZhciBuZXdTcGFjZXMgPSBzcGFjZS5nZXRNYXhpbWFsRnJlZVJlY3RzKCByZWN0ICk7XG4gICAgLy8gYWRkIGVpdGhlciB0aGUgb3JpZ2luYWwgc3BhY2Ugb3IgdGhlIG5ldyBzcGFjZXMgdG8gdGhlIHJldmlzZWQgc3BhY2VzXG4gICAgaWYgKCBuZXdTcGFjZXMgKSB7XG4gICAgICByZXZpc2VkU3BhY2VzLnB1c2guYXBwbHkoIHJldmlzZWRTcGFjZXMsIG5ld1NwYWNlcyApO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXZpc2VkU3BhY2VzLnB1c2goIHNwYWNlICk7XG4gICAgfVxuICB9XG5cbiAgdGhpcy5zcGFjZXMgPSByZXZpc2VkU3BhY2VzO1xuXG4gIHRoaXMubWVyZ2VTb3J0U3BhY2VzKCk7XG59O1xuXG5wcm90by5tZXJnZVNvcnRTcGFjZXMgPSBmdW5jdGlvbigpIHtcbiAgLy8gcmVtb3ZlIHJlZHVuZGFudCBzcGFjZXNcbiAgUGFja2VyLm1lcmdlUmVjdHMoIHRoaXMuc3BhY2VzICk7XG4gIHRoaXMuc3BhY2VzLnNvcnQoIHRoaXMuc29ydGVyICk7XG59O1xuXG4vLyBhZGQgYSBzcGFjZSBiYWNrXG5wcm90by5hZGRTcGFjZSA9IGZ1bmN0aW9uKCByZWN0ICkge1xuICB0aGlzLnNwYWNlcy5wdXNoKCByZWN0ICk7XG4gIHRoaXMubWVyZ2VTb3J0U3BhY2VzKCk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSB1dGlsaXR5IGZ1bmN0aW9ucyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIFJlbW92ZSByZWR1bmRhbnQgcmVjdGFuZ2xlIGZyb20gYXJyYXkgb2YgcmVjdGFuZ2xlc1xuICogQHBhcmFtIHtBcnJheX0gcmVjdHM6IGFuIGFycmF5IG9mIFJlY3RzXG4gKiBAcmV0dXJucyB7QXJyYXl9IHJlY3RzOiBhbiBhcnJheSBvZiBSZWN0c1xuKiovXG5QYWNrZXIubWVyZ2VSZWN0cyA9IGZ1bmN0aW9uKCByZWN0cyApIHtcbiAgdmFyIGkgPSAwO1xuICB2YXIgcmVjdCA9IHJlY3RzW2ldO1xuXG4gIHJlY3RMb29wOlxuICB3aGlsZSAoIHJlY3QgKSB7XG4gICAgdmFyIGogPSAwO1xuICAgIHZhciBjb21wYXJlUmVjdCA9IHJlY3RzWyBpICsgaiBdO1xuXG4gICAgd2hpbGUgKCBjb21wYXJlUmVjdCApIHtcbiAgICAgIGlmICAoIGNvbXBhcmVSZWN0ID09IHJlY3QgKSB7XG4gICAgICAgIGorKzsgLy8gbmV4dFxuICAgICAgfSBlbHNlIGlmICggY29tcGFyZVJlY3QuY29udGFpbnMoIHJlY3QgKSApIHtcbiAgICAgICAgLy8gcmVtb3ZlIHJlY3RcbiAgICAgICAgcmVjdHMuc3BsaWNlKCBpLCAxICk7XG4gICAgICAgIHJlY3QgPSByZWN0c1tpXTsgLy8gc2V0IG5leHQgcmVjdFxuICAgICAgICBjb250aW51ZSByZWN0TG9vcDsgLy8gYmFpbCBvbiBjb21wYXJlTG9vcFxuICAgICAgfSBlbHNlIGlmICggcmVjdC5jb250YWlucyggY29tcGFyZVJlY3QgKSApIHtcbiAgICAgICAgLy8gcmVtb3ZlIGNvbXBhcmVSZWN0XG4gICAgICAgIHJlY3RzLnNwbGljZSggaSArIGosIDEgKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGorKztcbiAgICAgIH1cbiAgICAgIGNvbXBhcmVSZWN0ID0gcmVjdHNbIGkgKyBqIF07IC8vIHNldCBuZXh0IGNvbXBhcmVSZWN0XG4gICAgfVxuICAgIGkrKztcbiAgICByZWN0ID0gcmVjdHNbaV07XG4gIH1cblxuICByZXR1cm4gcmVjdHM7XG59O1xuXG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHNvcnRlcnMgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gZnVuY3Rpb25zIGZvciBzb3J0aW5nIHJlY3RzIGluIG9yZGVyXG52YXIgc29ydGVycyA9IHtcbiAgLy8gdG9wIGRvd24sIHRoZW4gbGVmdCB0byByaWdodFxuICBkb3dud2FyZExlZnRUb1JpZ2h0OiBmdW5jdGlvbiggYSwgYiApIHtcbiAgICByZXR1cm4gYS55IC0gYi55IHx8IGEueCAtIGIueDtcbiAgfSxcbiAgLy8gbGVmdCB0byByaWdodCwgdGhlbiB0b3AgZG93blxuICByaWdodHdhcmRUb3BUb0JvdHRvbTogZnVuY3Rpb24oIGEsIGIgKSB7XG4gICAgcmV0dXJuIGEueCAtIGIueCB8fCBhLnkgLSBiLnk7XG4gIH1cbn07XG5cblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnJldHVybiBQYWNrZXI7XG5cbn0pKTtcblxuLyoqXG4gKiBQYWNrZXJ5IEl0ZW0gRWxlbWVudFxuKiovXG5cbiggZnVuY3Rpb24oIHdpbmRvdywgZmFjdG9yeSApIHtcbiAgLy8gdW5pdmVyc2FsIG1vZHVsZSBkZWZpbml0aW9uXG4gIC8qIGpzaGludCBzdHJpY3Q6IGZhbHNlICovIC8qIGdsb2JhbHMgZGVmaW5lLCBtb2R1bGUsIHJlcXVpcmUgKi9cbiAgaWYgKCB0eXBlb2YgZGVmaW5lID09ICdmdW5jdGlvbicgJiYgZGVmaW5lLmFtZCApIHtcbiAgICAvLyBBTURcbiAgICBkZWZpbmUoICdwYWNrZXJ5L2pzL2l0ZW0nLFtcbiAgICAgICAgJ291dGxheWVyL291dGxheWVyJyxcbiAgICAgICAgJy4vcmVjdCdcbiAgICAgIF0sXG4gICAgICBmYWN0b3J5ICk7XG4gIH0gZWxzZSBpZiAoIHR5cGVvZiBtb2R1bGUgPT0gJ29iamVjdCcgJiYgbW9kdWxlLmV4cG9ydHMgKSB7XG4gICAgLy8gQ29tbW9uSlNcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZhY3RvcnkoXG4gICAgICByZXF1aXJlKCdvdXRsYXllcicpLFxuICAgICAgcmVxdWlyZSgnLi9yZWN0JylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93LlBhY2tlcnkuSXRlbSA9IGZhY3RvcnkoXG4gICAgICB3aW5kb3cuT3V0bGF5ZXIsXG4gICAgICB3aW5kb3cuUGFja2VyeS5SZWN0XG4gICAgKTtcbiAgfVxuXG59KCB3aW5kb3csIGZ1bmN0aW9uIGZhY3RvcnkoIE91dGxheWVyLCBSZWN0ICkge1xuJ3VzZSBzdHJpY3QnO1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBJdGVtIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnZhciBkb2NFbGVtU3R5bGUgPSBkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc3R5bGU7XG5cbnZhciB0cmFuc2Zvcm1Qcm9wZXJ0eSA9IHR5cGVvZiBkb2NFbGVtU3R5bGUudHJhbnNmb3JtID09ICdzdHJpbmcnID9cbiAgJ3RyYW5zZm9ybScgOiAnV2Via2l0VHJhbnNmb3JtJztcblxuLy8gc3ViLWNsYXNzIEl0ZW1cbnZhciBJdGVtID0gZnVuY3Rpb24gUGFja2VyeUl0ZW0oKSB7XG4gIE91dGxheWVyLkl0ZW0uYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xufTtcblxudmFyIHByb3RvID0gSXRlbS5wcm90b3R5cGUgPSBPYmplY3QuY3JlYXRlKCBPdXRsYXllci5JdGVtLnByb3RvdHlwZSApO1xuXG52YXIgX19jcmVhdGUgPSBwcm90by5fY3JlYXRlO1xucHJvdG8uX2NyZWF0ZSA9IGZ1bmN0aW9uKCkge1xuICAvLyBjYWxsIGRlZmF1bHQgX2NyZWF0ZSBsb2dpY1xuICBfX2NyZWF0ZS5jYWxsKCB0aGlzICk7XG4gIHRoaXMucmVjdCA9IG5ldyBSZWN0KCk7XG59O1xuXG52YXIgX21vdmVUbyA9IHByb3RvLm1vdmVUbztcbnByb3RvLm1vdmVUbyA9IGZ1bmN0aW9uKCB4LCB5ICkge1xuICAvLyBkb24ndCBzaGlmdCAxcHggd2hpbGUgZHJhZ2dpbmdcbiAgdmFyIGR4ID0gTWF0aC5hYnMoIHRoaXMucG9zaXRpb24ueCAtIHggKTtcbiAgdmFyIGR5ID0gTWF0aC5hYnMoIHRoaXMucG9zaXRpb24ueSAtIHkgKTtcblxuICB2YXIgY2FuSGFja0dvVG8gPSB0aGlzLmxheW91dC5kcmFnSXRlbUNvdW50ICYmICF0aGlzLmlzUGxhY2luZyAmJlxuICAgICF0aGlzLmlzVHJhbnNpdGlvbmluZyAmJiBkeCA8IDEgJiYgZHkgPCAxO1xuICBpZiAoIGNhbkhhY2tHb1RvICkge1xuICAgIHRoaXMuZ29UbyggeCwgeSApO1xuICAgIHJldHVybjtcbiAgfVxuICBfbW92ZVRvLmFwcGx5KCB0aGlzLCBhcmd1bWVudHMgKTtcbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIHBsYWNpbmcgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxucHJvdG8uZW5hYmxlUGxhY2luZyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLnJlbW92ZVRyYW5zaXRpb25TdHlsZXMoKTtcbiAgLy8gcmVtb3ZlIHRyYW5zZm9ybSBwcm9wZXJ0eSBmcm9tIHRyYW5zaXRpb25cbiAgaWYgKCB0aGlzLmlzVHJhbnNpdGlvbmluZyAmJiB0cmFuc2Zvcm1Qcm9wZXJ0eSApIHtcbiAgICB0aGlzLmVsZW1lbnQuc3R5bGVbIHRyYW5zZm9ybVByb3BlcnR5IF0gPSAnbm9uZSc7XG4gIH1cbiAgdGhpcy5pc1RyYW5zaXRpb25pbmcgPSBmYWxzZTtcbiAgdGhpcy5nZXRTaXplKCk7XG4gIHRoaXMubGF5b3V0Ll9zZXRSZWN0U2l6ZSggdGhpcy5lbGVtZW50LCB0aGlzLnJlY3QgKTtcbiAgdGhpcy5pc1BsYWNpbmcgPSB0cnVlO1xufTtcblxucHJvdG8uZGlzYWJsZVBsYWNpbmcgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5pc1BsYWNpbmcgPSBmYWxzZTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG4vLyByZW1vdmUgZWxlbWVudCBmcm9tIERPTVxucHJvdG8ucmVtb3ZlRWxlbSA9IGZ1bmN0aW9uKCkge1xuICB2YXIgcGFyZW50ID0gdGhpcy5lbGVtZW50LnBhcmVudE5vZGU7XG4gIGlmICggcGFyZW50ICkge1xuICAgIHBhcmVudC5yZW1vdmVDaGlsZCggdGhpcy5lbGVtZW50ICk7XG4gIH1cbiAgLy8gYWRkIHNwYWNlIGJhY2sgdG8gcGFja2VyXG4gIHRoaXMubGF5b3V0LnBhY2tlci5hZGRTcGFjZSggdGhpcy5yZWN0ICk7XG4gIHRoaXMuZW1pdEV2ZW50KCAncmVtb3ZlJywgWyB0aGlzIF0gKTtcbn07XG5cbi8vIC0tLS0tIGRyb3BQbGFjZWhvbGRlciAtLS0tLSAvL1xuXG5wcm90by5zaG93RHJvcFBsYWNlaG9sZGVyID0gZnVuY3Rpb24oKSB7XG4gIHZhciBkcm9wUGxhY2Vob2xkZXIgPSB0aGlzLmRyb3BQbGFjZWhvbGRlcjtcbiAgaWYgKCAhZHJvcFBsYWNlaG9sZGVyICkge1xuICAgIC8vIGNyZWF0ZSBkcm9wUGxhY2Vob2xkZXJcbiAgICBkcm9wUGxhY2Vob2xkZXIgPSB0aGlzLmRyb3BQbGFjZWhvbGRlciA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2RpdicpO1xuICAgIGRyb3BQbGFjZWhvbGRlci5jbGFzc05hbWUgPSAncGFja2VyeS1kcm9wLXBsYWNlaG9sZGVyJztcbiAgICBkcm9wUGxhY2Vob2xkZXIuc3R5bGUucG9zaXRpb24gPSAnYWJzb2x1dGUnO1xuICB9XG5cbiAgZHJvcFBsYWNlaG9sZGVyLnN0eWxlLndpZHRoID0gdGhpcy5zaXplLndpZHRoICsgJ3B4JztcbiAgZHJvcFBsYWNlaG9sZGVyLnN0eWxlLmhlaWdodCA9IHRoaXMuc2l6ZS5oZWlnaHQgKyAncHgnO1xuICB0aGlzLnBvc2l0aW9uRHJvcFBsYWNlaG9sZGVyKCk7XG4gIHRoaXMubGF5b3V0LmVsZW1lbnQuYXBwZW5kQ2hpbGQoIGRyb3BQbGFjZWhvbGRlciApO1xufTtcblxucHJvdG8ucG9zaXRpb25Ecm9wUGxhY2Vob2xkZXIgPSBmdW5jdGlvbigpIHtcbiAgdGhpcy5kcm9wUGxhY2Vob2xkZXIuc3R5bGVbIHRyYW5zZm9ybVByb3BlcnR5IF0gPSAndHJhbnNsYXRlKCcgK1xuICAgIHRoaXMucmVjdC54ICsgJ3B4LCAnICsgdGhpcy5yZWN0LnkgKyAncHgpJztcbn07XG5cbnByb3RvLmhpZGVEcm9wUGxhY2Vob2xkZXIgPSBmdW5jdGlvbigpIHtcbiAgLy8gb25seSByZW1vdmUgb25jZSwgIzMzM1xuICB2YXIgcGFyZW50ID0gdGhpcy5kcm9wUGxhY2Vob2xkZXIucGFyZW50Tm9kZTtcbiAgaWYgKCBwYXJlbnQgKSB7XG4gICAgcGFyZW50LnJlbW92ZUNoaWxkKCB0aGlzLmRyb3BQbGFjZWhvbGRlciApO1xuICB9XG59O1xuXG4vLyAtLS0tLSAgLS0tLS0gLy9cblxucmV0dXJuIEl0ZW07XG5cbn0pKTtcblxuLyohXG4gKiBQYWNrZXJ5IHYyLjEuMlxuICogR2FwbGVzcywgZHJhZ2dhYmxlIGdyaWQgbGF5b3V0c1xuICpcbiAqIExpY2Vuc2VkIEdQTHYzIGZvciBvcGVuIHNvdXJjZSB1c2VcbiAqIG9yIFBhY2tlcnkgQ29tbWVyY2lhbCBMaWNlbnNlIGZvciBjb21tZXJjaWFsIHVzZVxuICpcbiAqIGh0dHA6Ly9wYWNrZXJ5Lm1ldGFmaXp6eS5jb1xuICogQ29weXJpZ2h0IDIwMTMtMjAxOCBNZXRhZml6enlcbiAqL1xuXG4oIGZ1bmN0aW9uKCB3aW5kb3csIGZhY3RvcnkgKSB7XG4gIC8vIHVuaXZlcnNhbCBtb2R1bGUgZGVmaW5pdGlvblxuICAvKiBqc2hpbnQgc3RyaWN0OiBmYWxzZSAqLyAvKiBnbG9iYWxzIGRlZmluZSwgbW9kdWxlLCByZXF1aXJlICovXG4gIGlmICggdHlwZW9mIGRlZmluZSA9PSAnZnVuY3Rpb24nICYmIGRlZmluZS5hbWQgKSB7XG4gICAgLy8gQU1EXG4gICAgZGVmaW5lKCBbXG4gICAgICAgICdnZXQtc2l6ZS9nZXQtc2l6ZScsXG4gICAgICAgICdvdXRsYXllci9vdXRsYXllcicsXG4gICAgICAgICdwYWNrZXJ5L2pzL3JlY3QnLFxuICAgICAgICAncGFja2VyeS9qcy9wYWNrZXInLFxuICAgICAgICAncGFja2VyeS9qcy9pdGVtJ1xuICAgICAgXSxcbiAgICAgIGZhY3RvcnkgKTtcbiAgfSBlbHNlIGlmICggdHlwZW9mIG1vZHVsZSA9PSAnb2JqZWN0JyAmJiBtb2R1bGUuZXhwb3J0cyApIHtcbiAgICAvLyBDb21tb25KU1xuICAgIG1vZHVsZS5leHBvcnRzID0gZmFjdG9yeShcbiAgICAgIHJlcXVpcmUoJ2dldC1zaXplJyksXG4gICAgICByZXF1aXJlKCdvdXRsYXllcicpLFxuICAgICAgcmVxdWlyZSgnLi9yZWN0JyksXG4gICAgICByZXF1aXJlKCcuL3BhY2tlcicpLFxuICAgICAgcmVxdWlyZSgnLi9pdGVtJylcbiAgICApO1xuICB9IGVsc2Uge1xuICAgIC8vIGJyb3dzZXIgZ2xvYmFsXG4gICAgd2luZG93LlBhY2tlcnkgPSBmYWN0b3J5KFxuICAgICAgd2luZG93LmdldFNpemUsXG4gICAgICB3aW5kb3cuT3V0bGF5ZXIsXG4gICAgICB3aW5kb3cuUGFja2VyeS5SZWN0LFxuICAgICAgd2luZG93LlBhY2tlcnkuUGFja2VyLFxuICAgICAgd2luZG93LlBhY2tlcnkuSXRlbVxuICAgICk7XG4gIH1cblxufSggd2luZG93LCBmdW5jdGlvbiBmYWN0b3J5KCBnZXRTaXplLCBPdXRsYXllciwgUmVjdCwgUGFja2VyLCBJdGVtICkge1xuJ3VzZSBzdHJpY3QnO1xuXG4vLyAtLS0tLSBSZWN0IC0tLS0tIC8vXG5cbi8vIGFsbG93IGZvciBwaXhlbCByb3VuZGluZyBlcnJvcnMgSUU4LUlFMTEgJiBGaXJlZm94OyAjMjI3XG5SZWN0LnByb3RvdHlwZS5jYW5GaXQgPSBmdW5jdGlvbiggcmVjdCApIHtcbiAgcmV0dXJuIHRoaXMud2lkdGggPj0gcmVjdC53aWR0aCAtIDEgJiYgdGhpcy5oZWlnaHQgPj0gcmVjdC5oZWlnaHQgLSAxO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gUGFja2VyeSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vLyBjcmVhdGUgYW4gT3V0bGF5ZXIgbGF5b3V0IGNsYXNzXG52YXIgUGFja2VyeSA9IE91dGxheWVyLmNyZWF0ZSgncGFja2VyeScpO1xuUGFja2VyeS5JdGVtID0gSXRlbTtcblxudmFyIHByb3RvID0gUGFja2VyeS5wcm90b3R5cGU7XG5cbnByb3RvLl9jcmVhdGUgPSBmdW5jdGlvbigpIHtcbiAgLy8gY2FsbCBzdXBlclxuICBPdXRsYXllci5wcm90b3R5cGUuX2NyZWF0ZS5jYWxsKCB0aGlzICk7XG5cbiAgLy8gaW5pdGlhbCBwcm9wZXJ0aWVzXG4gIHRoaXMucGFja2VyID0gbmV3IFBhY2tlcigpO1xuICAvLyBwYWNrZXIgZm9yIGRyb3AgdGFyZ2V0c1xuICB0aGlzLnNoaWZ0UGFja2VyID0gbmV3IFBhY2tlcigpO1xuICB0aGlzLmlzRW5hYmxlZCA9IHRydWU7XG5cbiAgdGhpcy5kcmFnSXRlbUNvdW50ID0gMDtcblxuICAvLyBjcmVhdGUgZHJhZyBoYW5kbGVyc1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuICB0aGlzLmhhbmRsZURyYWdnYWJpbGx5ID0ge1xuICAgIGRyYWdTdGFydDogZnVuY3Rpb24oKSB7XG4gICAgICBfdGhpcy5pdGVtRHJhZ1N0YXJ0KCB0aGlzLmVsZW1lbnQgKTtcbiAgICB9LFxuICAgIGRyYWdNb3ZlOiBmdW5jdGlvbigpIHtcbiAgICAgIF90aGlzLml0ZW1EcmFnTW92ZSggdGhpcy5lbGVtZW50LCB0aGlzLnBvc2l0aW9uLngsIHRoaXMucG9zaXRpb24ueSApO1xuICAgIH0sXG4gICAgZHJhZ0VuZDogZnVuY3Rpb24oKSB7XG4gICAgICBfdGhpcy5pdGVtRHJhZ0VuZCggdGhpcy5lbGVtZW50ICk7XG4gICAgfVxuICB9O1xuXG4gIHRoaXMuaGFuZGxlVUlEcmFnZ2FibGUgPSB7XG4gICAgc3RhcnQ6IGZ1bmN0aW9uIGhhbmRsZVVJRHJhZ2dhYmxlU3RhcnQoIGV2ZW50LCB1aSApIHtcbiAgICAgIC8vIEhUTUw1IG1heSB0cmlnZ2VyIGRyYWdzdGFydCwgZGlzbWlzcyBIVE1MNSBkcmFnZ2luZ1xuICAgICAgaWYgKCAhdWkgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIF90aGlzLml0ZW1EcmFnU3RhcnQoIGV2ZW50LmN1cnJlbnRUYXJnZXQgKTtcbiAgICB9LFxuICAgIGRyYWc6IGZ1bmN0aW9uIGhhbmRsZVVJRHJhZ2dhYmxlRHJhZyggZXZlbnQsIHVpICkge1xuICAgICAgaWYgKCAhdWkgKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIF90aGlzLml0ZW1EcmFnTW92ZSggZXZlbnQuY3VycmVudFRhcmdldCwgdWkucG9zaXRpb24ubGVmdCwgdWkucG9zaXRpb24udG9wICk7XG4gICAgfSxcbiAgICBzdG9wOiBmdW5jdGlvbiBoYW5kbGVVSURyYWdnYWJsZVN0b3AoIGV2ZW50LCB1aSApIHtcbiAgICAgIGlmICggIXVpICkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBfdGhpcy5pdGVtRHJhZ0VuZCggZXZlbnQuY3VycmVudFRhcmdldCApO1xuICAgIH1cbiAgfTtcblxufTtcblxuXG4vLyAtLS0tLSBpbml0ICYgbGF5b3V0IC0tLS0tIC8vXG5cbi8qKlxuICogbG9naWMgYmVmb3JlIGFueSBuZXcgbGF5b3V0XG4gKi9cbnByb3RvLl9yZXNldExheW91dCA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLmdldFNpemUoKTtcblxuICB0aGlzLl9nZXRNZWFzdXJlbWVudHMoKTtcblxuICAvLyByZXNldCBwYWNrZXJcbiAgdmFyIHdpZHRoLCBoZWlnaHQsIHNvcnREaXJlY3Rpb247XG4gIC8vIHBhY2tlciBzZXR0aW5ncywgaWYgaG9yaXpvbnRhbCBvciB2ZXJ0aWNhbFxuICBpZiAoIHRoaXMuX2dldE9wdGlvbignaG9yaXpvbnRhbCcpICkge1xuICAgIHdpZHRoID0gSW5maW5pdHk7XG4gICAgaGVpZ2h0ID0gdGhpcy5zaXplLmlubmVySGVpZ2h0ICsgdGhpcy5ndXR0ZXI7XG4gICAgc29ydERpcmVjdGlvbiA9ICdyaWdodHdhcmRUb3BUb0JvdHRvbSc7XG4gIH0gZWxzZSB7XG4gICAgd2lkdGggPSB0aGlzLnNpemUuaW5uZXJXaWR0aCArIHRoaXMuZ3V0dGVyO1xuICAgIGhlaWdodCA9IEluZmluaXR5O1xuICAgIHNvcnREaXJlY3Rpb24gPSAnZG93bndhcmRMZWZ0VG9SaWdodCc7XG4gIH1cblxuICB0aGlzLnBhY2tlci53aWR0aCA9IHRoaXMuc2hpZnRQYWNrZXIud2lkdGggPSB3aWR0aDtcbiAgdGhpcy5wYWNrZXIuaGVpZ2h0ID0gdGhpcy5zaGlmdFBhY2tlci5oZWlnaHQgPSBoZWlnaHQ7XG4gIHRoaXMucGFja2VyLnNvcnREaXJlY3Rpb24gPSB0aGlzLnNoaWZ0UGFja2VyLnNvcnREaXJlY3Rpb24gPSBzb3J0RGlyZWN0aW9uO1xuXG4gIHRoaXMucGFja2VyLnJlc2V0KCk7XG5cbiAgLy8gbGF5b3V0XG4gIHRoaXMubWF4WSA9IDA7XG4gIHRoaXMubWF4WCA9IDA7XG59O1xuXG4vKipcbiAqIHVwZGF0ZSBjb2x1bW5XaWR0aCwgcm93SGVpZ2h0LCAmIGd1dHRlclxuICogQHByaXZhdGVcbiAqL1xucHJvdG8uX2dldE1lYXN1cmVtZW50cyA9IGZ1bmN0aW9uKCkge1xuICB0aGlzLl9nZXRNZWFzdXJlbWVudCggJ2NvbHVtbldpZHRoJywgJ3dpZHRoJyApO1xuICB0aGlzLl9nZXRNZWFzdXJlbWVudCggJ3Jvd0hlaWdodCcsICdoZWlnaHQnICk7XG4gIHRoaXMuX2dldE1lYXN1cmVtZW50KCAnZ3V0dGVyJywgJ3dpZHRoJyApO1xufTtcblxucHJvdG8uX2dldEl0ZW1MYXlvdXRQb3NpdGlvbiA9IGZ1bmN0aW9uKCBpdGVtICkge1xuICB0aGlzLl9zZXRSZWN0U2l6ZSggaXRlbS5lbGVtZW50LCBpdGVtLnJlY3QgKTtcbiAgaWYgKCB0aGlzLmlzU2hpZnRpbmcgfHwgdGhpcy5kcmFnSXRlbUNvdW50ID4gMCApIHtcbiAgICB2YXIgcGFja01ldGhvZCA9IHRoaXMuX2dldFBhY2tNZXRob2QoKTtcbiAgICB0aGlzLnBhY2tlclsgcGFja01ldGhvZCBdKCBpdGVtLnJlY3QgKTtcbiAgfSBlbHNlIHtcbiAgICB0aGlzLnBhY2tlci5wYWNrKCBpdGVtLnJlY3QgKTtcbiAgfVxuXG4gIHRoaXMuX3NldE1heFhZKCBpdGVtLnJlY3QgKTtcbiAgcmV0dXJuIGl0ZW0ucmVjdDtcbn07XG5cbnByb3RvLnNoaWZ0TGF5b3V0ID0gZnVuY3Rpb24oKSB7XG4gIHRoaXMuaXNTaGlmdGluZyA9IHRydWU7XG4gIHRoaXMubGF5b3V0KCk7XG4gIGRlbGV0ZSB0aGlzLmlzU2hpZnRpbmc7XG59O1xuXG5wcm90by5fZ2V0UGFja01ldGhvZCA9IGZ1bmN0aW9uKCkge1xuICByZXR1cm4gdGhpcy5fZ2V0T3B0aW9uKCdob3Jpem9udGFsJykgPyAncm93UGFjaycgOiAnY29sdW1uUGFjayc7XG59O1xuXG5cbi8qKlxuICogc2V0IG1heCBYIGFuZCBZIHZhbHVlLCBmb3Igc2l6ZSBvZiBjb250YWluZXJcbiAqIEBwYXJhbSB7UGFja2VyeS5SZWN0fSByZWN0XG4gKiBAcHJpdmF0ZVxuICovXG5wcm90by5fc2V0TWF4WFkgPSBmdW5jdGlvbiggcmVjdCApIHtcbiAgdGhpcy5tYXhYID0gTWF0aC5tYXgoIHJlY3QueCArIHJlY3Qud2lkdGgsIHRoaXMubWF4WCApO1xuICB0aGlzLm1heFkgPSBNYXRoLm1heCggcmVjdC55ICsgcmVjdC5oZWlnaHQsIHRoaXMubWF4WSApO1xufTtcblxuLyoqXG4gKiBzZXQgdGhlIHdpZHRoIGFuZCBoZWlnaHQgb2YgYSByZWN0LCBhcHBseWluZyBjb2x1bW5XaWR0aCBhbmQgcm93SGVpZ2h0XG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1cbiAqIEBwYXJhbSB7UGFja2VyeS5SZWN0fSByZWN0XG4gKi9cbnByb3RvLl9zZXRSZWN0U2l6ZSA9IGZ1bmN0aW9uKCBlbGVtLCByZWN0ICkge1xuICB2YXIgc2l6ZSA9IGdldFNpemUoIGVsZW0gKTtcbiAgdmFyIHcgPSBzaXplLm91dGVyV2lkdGg7XG4gIHZhciBoID0gc2l6ZS5vdXRlckhlaWdodDtcbiAgLy8gc2l6ZSBmb3IgY29sdW1uV2lkdGggYW5kIHJvd0hlaWdodCwgaWYgYXZhaWxhYmxlXG4gIC8vIG9ubHkgY2hlY2sgaWYgc2l6ZSBpcyBub24temVybywgIzE3N1xuICBpZiAoIHcgfHwgaCApIHtcbiAgICB3ID0gdGhpcy5fYXBwbHlHcmlkR3V0dGVyKCB3LCB0aGlzLmNvbHVtbldpZHRoICk7XG4gICAgaCA9IHRoaXMuX2FwcGx5R3JpZEd1dHRlciggaCwgdGhpcy5yb3dIZWlnaHQgKTtcbiAgfVxuICAvLyByZWN0IG11c3QgZml0IGluIHBhY2tlclxuICByZWN0LndpZHRoID0gTWF0aC5taW4oIHcsIHRoaXMucGFja2VyLndpZHRoICk7XG4gIHJlY3QuaGVpZ2h0ID0gTWF0aC5taW4oIGgsIHRoaXMucGFja2VyLmhlaWdodCApO1xufTtcblxuLyoqXG4gKiBmaXRzIGl0ZW0gdG8gY29sdW1uV2lkdGgvcm93SGVpZ2h0IGFuZCBhZGRzIGd1dHRlclxuICogQHBhcmFtIHtOdW1iZXJ9IG1lYXN1cmVtZW50IC0gaXRlbSB3aWR0aCBvciBoZWlnaHRcbiAqIEBwYXJhbSB7TnVtYmVyfSBncmlkU2l6ZSAtIGNvbHVtbldpZHRoIG9yIHJvd0hlaWdodFxuICogQHJldHVybnMgbWVhc3VyZW1lbnRcbiAqL1xucHJvdG8uX2FwcGx5R3JpZEd1dHRlciA9IGZ1bmN0aW9uKCBtZWFzdXJlbWVudCwgZ3JpZFNpemUgKSB7XG4gIC8vIGp1c3QgYWRkIGd1dHRlciBpZiBubyBncmlkU2l6ZVxuICBpZiAoICFncmlkU2l6ZSApIHtcbiAgICByZXR1cm4gbWVhc3VyZW1lbnQgKyB0aGlzLmd1dHRlcjtcbiAgfVxuICBncmlkU2l6ZSArPSB0aGlzLmd1dHRlcjtcbiAgLy8gZml0IGl0ZW0gdG8gY29sdW1uV2lkdGgvcm93SGVpZ2h0XG4gIHZhciByZW1haW5kZXIgPSBtZWFzdXJlbWVudCAlIGdyaWRTaXplO1xuICB2YXIgbWF0aE1ldGhvZCA9IHJlbWFpbmRlciAmJiByZW1haW5kZXIgPCAxID8gJ3JvdW5kJyA6ICdjZWlsJztcbiAgbWVhc3VyZW1lbnQgPSBNYXRoWyBtYXRoTWV0aG9kIF0oIG1lYXN1cmVtZW50IC8gZ3JpZFNpemUgKSAqIGdyaWRTaXplO1xuICByZXR1cm4gbWVhc3VyZW1lbnQ7XG59O1xuXG5wcm90by5fZ2V0Q29udGFpbmVyU2l6ZSA9IGZ1bmN0aW9uKCkge1xuICBpZiAoIHRoaXMuX2dldE9wdGlvbignaG9yaXpvbnRhbCcpICkge1xuICAgIHJldHVybiB7XG4gICAgICB3aWR0aDogdGhpcy5tYXhYIC0gdGhpcy5ndXR0ZXJcbiAgICB9O1xuICB9IGVsc2Uge1xuICAgIHJldHVybiB7XG4gICAgICBoZWlnaHQ6IHRoaXMubWF4WSAtIHRoaXMuZ3V0dGVyXG4gICAgfTtcbiAgfVxufTtcblxuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBzdGFtcCAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIG1ha2VzIHNwYWNlIGZvciBlbGVtZW50XG4gKiBAcGFyYW0ge0VsZW1lbnR9IGVsZW1cbiAqL1xucHJvdG8uX21hbmFnZVN0YW1wID0gZnVuY3Rpb24oIGVsZW0gKSB7XG5cbiAgdmFyIGl0ZW0gPSB0aGlzLmdldEl0ZW0oIGVsZW0gKTtcbiAgdmFyIHJlY3Q7XG4gIGlmICggaXRlbSAmJiBpdGVtLmlzUGxhY2luZyApIHtcbiAgICByZWN0ID0gaXRlbS5yZWN0O1xuICB9IGVsc2Uge1xuICAgIHZhciBvZmZzZXQgPSB0aGlzLl9nZXRFbGVtZW50T2Zmc2V0KCBlbGVtICk7XG4gICAgcmVjdCA9IG5ldyBSZWN0KHtcbiAgICAgIHg6IHRoaXMuX2dldE9wdGlvbignb3JpZ2luTGVmdCcpID8gb2Zmc2V0LmxlZnQgOiBvZmZzZXQucmlnaHQsXG4gICAgICB5OiB0aGlzLl9nZXRPcHRpb24oJ29yaWdpblRvcCcpID8gb2Zmc2V0LnRvcCA6IG9mZnNldC5ib3R0b21cbiAgICB9KTtcbiAgfVxuXG4gIHRoaXMuX3NldFJlY3RTaXplKCBlbGVtLCByZWN0ICk7XG4gIC8vIHNhdmUgaXRzIHNwYWNlIGluIHRoZSBwYWNrZXJcbiAgdGhpcy5wYWNrZXIucGxhY2VkKCByZWN0ICk7XG4gIHRoaXMuX3NldE1heFhZKCByZWN0ICk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBtZXRob2RzIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbmZ1bmN0aW9uIHZlcnRpY2FsU29ydGVyKCBhLCBiICkge1xuICByZXR1cm4gYS5wb3NpdGlvbi55IC0gYi5wb3NpdGlvbi55IHx8IGEucG9zaXRpb24ueCAtIGIucG9zaXRpb24ueDtcbn1cblxuZnVuY3Rpb24gaG9yaXpvbnRhbFNvcnRlciggYSwgYiApIHtcbiAgcmV0dXJuIGEucG9zaXRpb24ueCAtIGIucG9zaXRpb24ueCB8fCBhLnBvc2l0aW9uLnkgLSBiLnBvc2l0aW9uLnk7XG59XG5cbnByb3RvLnNvcnRJdGVtc0J5UG9zaXRpb24gPSBmdW5jdGlvbigpIHtcbiAgdmFyIHNvcnRlciA9IHRoaXMuX2dldE9wdGlvbignaG9yaXpvbnRhbCcpID8gaG9yaXpvbnRhbFNvcnRlciA6IHZlcnRpY2FsU29ydGVyO1xuICB0aGlzLml0ZW1zLnNvcnQoIHNvcnRlciApO1xufTtcblxuLyoqXG4gKiBGaXQgaXRlbSBlbGVtZW50IGluIGl0cyBjdXJyZW50IHBvc2l0aW9uXG4gKiBQYWNrZXJ5IHdpbGwgcG9zaXRpb24gZWxlbWVudHMgYXJvdW5kIGl0XG4gKiB1c2VmdWwgZm9yIGV4cGFuZGluZyBlbGVtZW50c1xuICpcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbVxuICogQHBhcmFtIHtOdW1iZXJ9IHggLSBob3Jpem9udGFsIGRlc3RpbmF0aW9uIHBvc2l0aW9uLCBvcHRpb25hbFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgLSB2ZXJ0aWNhbCBkZXN0aW5hdGlvbiBwb3NpdGlvbiwgb3B0aW9uYWxcbiAqL1xucHJvdG8uZml0ID0gZnVuY3Rpb24oIGVsZW0sIHgsIHkgKSB7XG4gIHZhciBpdGVtID0gdGhpcy5nZXRJdGVtKCBlbGVtICk7XG4gIGlmICggIWl0ZW0gKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgLy8gc3RhbXAgaXRlbSB0byBnZXQgaXQgb3V0IG9mIGxheW91dFxuICB0aGlzLnN0YW1wKCBpdGVtLmVsZW1lbnQgKTtcbiAgLy8gc2V0IHBsYWNpbmcgZmxhZ1xuICBpdGVtLmVuYWJsZVBsYWNpbmcoKTtcbiAgdGhpcy51cGRhdGVTaGlmdFRhcmdldHMoIGl0ZW0gKTtcbiAgLy8gZmFsbCBiYWNrIHRvIGN1cnJlbnQgcG9zaXRpb24gZm9yIGZpdHRpbmdcbiAgeCA9IHggPT09IHVuZGVmaW5lZCA/IGl0ZW0ucmVjdC54OiB4O1xuICB5ID0geSA9PT0gdW5kZWZpbmVkID8gaXRlbS5yZWN0Lnk6IHk7XG4gIC8vIHBvc2l0aW9uIGl0IGJlc3QgYXQgaXRzIGRlc3RpbmF0aW9uXG4gIHRoaXMuc2hpZnQoIGl0ZW0sIHgsIHkgKTtcbiAgdGhpcy5fYmluZEZpdEV2ZW50cyggaXRlbSApO1xuICBpdGVtLm1vdmVUbyggaXRlbS5yZWN0LngsIGl0ZW0ucmVjdC55ICk7XG4gIC8vIGxheW91dCBldmVyeXRoaW5nIGVsc2VcbiAgdGhpcy5zaGlmdExheW91dCgpO1xuICAvLyByZXR1cm4gYmFjayB0byByZWd1bGFybHkgc2NoZWR1bGVkIHByb2dyYW1taW5nXG4gIHRoaXMudW5zdGFtcCggaXRlbS5lbGVtZW50ICk7XG4gIHRoaXMuc29ydEl0ZW1zQnlQb3NpdGlvbigpO1xuICBpdGVtLmRpc2FibGVQbGFjaW5nKCk7XG59O1xuXG4vKipcbiAqIGVtaXQgZXZlbnQgd2hlbiBpdGVtIGlzIGZpdCBhbmQgb3RoZXIgaXRlbXMgYXJlIGxhaWQgb3V0XG4gKiBAcGFyYW0ge1BhY2tlcnkuSXRlbX0gaXRlbVxuICogQHByaXZhdGVcbiAqL1xucHJvdG8uX2JpbmRGaXRFdmVudHMgPSBmdW5jdGlvbiggaXRlbSApIHtcbiAgdmFyIF90aGlzID0gdGhpcztcbiAgdmFyIHRpY2tzID0gMDtcbiAgZnVuY3Rpb24gb25MYXlvdXQoKSB7XG4gICAgdGlja3MrKztcbiAgICBpZiAoIHRpY2tzICE9IDIgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIF90aGlzLmRpc3BhdGNoRXZlbnQoICdmaXRDb21wbGV0ZScsIG51bGwsIFsgaXRlbSBdICk7XG4gIH1cbiAgLy8gd2hlbiBpdGVtIGlzIGxhaWQgb3V0XG4gIGl0ZW0ub25jZSggJ2xheW91dCcsIG9uTGF5b3V0ICk7XG4gIC8vIHdoZW4gYWxsIGl0ZW1zIGFyZSBsYWlkIG91dFxuICB0aGlzLm9uY2UoICdsYXlvdXRDb21wbGV0ZScsIG9uTGF5b3V0ICk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSByZXNpemUgLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gLy9cblxuLy8gZGVib3VuY2VkLCBsYXlvdXQgb24gcmVzaXplXG5wcm90by5yZXNpemUgPSBmdW5jdGlvbigpIHtcbiAgLy8gZG9uJ3QgdHJpZ2dlciBpZiBzaXplIGRpZCBub3QgY2hhbmdlXG4gIC8vIG9yIGlmIHJlc2l6ZSB3YXMgdW5ib3VuZC4gU2VlICMyODUsIG91dGxheWVyIzlcbiAgaWYgKCAhdGhpcy5pc1Jlc2l6ZUJvdW5kIHx8ICF0aGlzLm5lZWRzUmVzaXplTGF5b3V0KCkgKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaWYgKCB0aGlzLm9wdGlvbnMuc2hpZnRQZXJjZW50UmVzaXplICkge1xuICAgIHRoaXMucmVzaXplU2hpZnRQZXJjZW50TGF5b3V0KCk7XG4gIH0gZWxzZSB7XG4gICAgdGhpcy5sYXlvdXQoKTtcbiAgfVxufTtcblxuLyoqXG4gKiBjaGVjayBpZiBsYXlvdXQgaXMgbmVlZGVkIHBvc3QgbGF5b3V0XG4gKiBAcmV0dXJucyBCb29sZWFuXG4gKi9cbnByb3RvLm5lZWRzUmVzaXplTGF5b3V0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBzaXplID0gZ2V0U2l6ZSggdGhpcy5lbGVtZW50ICk7XG4gIHZhciBpbm5lclNpemUgPSB0aGlzLl9nZXRPcHRpb24oJ2hvcml6b250YWwnKSA/ICdpbm5lckhlaWdodCcgOiAnaW5uZXJXaWR0aCc7XG4gIHJldHVybiBzaXplWyBpbm5lclNpemUgXSAhPSB0aGlzLnNpemVbIGlubmVyU2l6ZSBdO1xufTtcblxucHJvdG8ucmVzaXplU2hpZnRQZXJjZW50TGF5b3V0ID0gZnVuY3Rpb24oKSB7XG4gIHZhciBpdGVtcyA9IHRoaXMuX2dldEl0ZW1zRm9yTGF5b3V0KCB0aGlzLml0ZW1zICk7XG5cbiAgdmFyIGlzSG9yaXpvbnRhbCA9IHRoaXMuX2dldE9wdGlvbignaG9yaXpvbnRhbCcpO1xuICB2YXIgY29vcmQgPSBpc0hvcml6b250YWwgPyAneScgOiAneCc7XG4gIHZhciBtZWFzdXJlID0gaXNIb3Jpem9udGFsID8gJ2hlaWdodCcgOiAnd2lkdGgnO1xuICB2YXIgc2VnbWVudE5hbWUgPSBpc0hvcml6b250YWwgPyAncm93SGVpZ2h0JyA6ICdjb2x1bW5XaWR0aCc7XG4gIHZhciBpbm5lclNpemUgPSBpc0hvcml6b250YWwgPyAnaW5uZXJIZWlnaHQnIDogJ2lubmVyV2lkdGgnO1xuXG4gIC8vIHByb3BvcnRpb25hbCByZS1hbGlnbiBpdGVtc1xuICB2YXIgcHJldmlvdXNTZWdtZW50ID0gdGhpc1sgc2VnbWVudE5hbWUgXTtcbiAgcHJldmlvdXNTZWdtZW50ID0gcHJldmlvdXNTZWdtZW50ICYmIHByZXZpb3VzU2VnbWVudCArIHRoaXMuZ3V0dGVyO1xuXG4gIGlmICggcHJldmlvdXNTZWdtZW50ICkge1xuICAgIHRoaXMuX2dldE1lYXN1cmVtZW50cygpO1xuICAgIHZhciBjdXJyZW50U2VnbWVudCA9IHRoaXNbIHNlZ21lbnROYW1lIF0gKyB0aGlzLmd1dHRlcjtcbiAgICBpdGVtcy5mb3JFYWNoKCBmdW5jdGlvbiggaXRlbSApIHtcbiAgICAgIHZhciBzZWcgPSBNYXRoLnJvdW5kKCBpdGVtLnJlY3RbIGNvb3JkIF0gLyBwcmV2aW91c1NlZ21lbnQgKTtcbiAgICAgIGl0ZW0ucmVjdFsgY29vcmQgXSA9IHNlZyAqIGN1cnJlbnRTZWdtZW50O1xuICAgIH0pO1xuICB9IGVsc2Uge1xuICAgIHZhciBjdXJyZW50U2l6ZSA9IGdldFNpemUoIHRoaXMuZWxlbWVudCApWyBpbm5lclNpemUgXSArIHRoaXMuZ3V0dGVyO1xuICAgIHZhciBwcmV2aW91c1NpemUgPSB0aGlzLnBhY2tlclsgbWVhc3VyZSBdO1xuICAgIGl0ZW1zLmZvckVhY2goIGZ1bmN0aW9uKCBpdGVtICkge1xuICAgICAgaXRlbS5yZWN0WyBjb29yZCBdID0gKCBpdGVtLnJlY3RbIGNvb3JkIF0gLyBwcmV2aW91c1NpemUgKSAqIGN1cnJlbnRTaXplO1xuICAgIH0pO1xuICB9XG5cbiAgdGhpcy5zaGlmdExheW91dCgpO1xufTtcblxuLy8gLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0gZHJhZyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG4vKipcbiAqIGhhbmRsZSBhbiBpdGVtIGRyYWcgc3RhcnQgZXZlbnRcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbVxuICovXG5wcm90by5pdGVtRHJhZ1N0YXJ0ID0gZnVuY3Rpb24oIGVsZW0gKSB7XG4gIGlmICggIXRoaXMuaXNFbmFibGVkICkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnN0YW1wKCBlbGVtICk7XG4gIC8vIHRoaXMuaWdub3JlKCBlbGVtICk7XG4gIHZhciBpdGVtID0gdGhpcy5nZXRJdGVtKCBlbGVtICk7XG4gIGlmICggIWl0ZW0gKSB7XG4gICAgcmV0dXJuO1xuICB9XG5cbiAgaXRlbS5lbmFibGVQbGFjaW5nKCk7XG4gIGl0ZW0uc2hvd0Ryb3BQbGFjZWhvbGRlcigpO1xuICB0aGlzLmRyYWdJdGVtQ291bnQrKztcbiAgdGhpcy51cGRhdGVTaGlmdFRhcmdldHMoIGl0ZW0gKTtcbn07XG5cbnByb3RvLnVwZGF0ZVNoaWZ0VGFyZ2V0cyA9IGZ1bmN0aW9uKCBkcm9wSXRlbSApIHtcbiAgdGhpcy5zaGlmdFBhY2tlci5yZXNldCgpO1xuXG4gIC8vIHBhY2sgc3RhbXBzXG4gIHRoaXMuX2dldEJvdW5kaW5nUmVjdCgpO1xuICB2YXIgaXNPcmlnaW5MZWZ0ID0gdGhpcy5fZ2V0T3B0aW9uKCdvcmlnaW5MZWZ0Jyk7XG4gIHZhciBpc09yaWdpblRvcCA9IHRoaXMuX2dldE9wdGlvbignb3JpZ2luVG9wJyk7XG4gIHRoaXMuc3RhbXBzLmZvckVhY2goIGZ1bmN0aW9uKCBzdGFtcCApIHtcbiAgICAvLyBpZ25vcmUgZHJhZ2dlZCBpdGVtXG4gICAgdmFyIGl0ZW0gPSB0aGlzLmdldEl0ZW0oIHN0YW1wICk7XG4gICAgaWYgKCBpdGVtICYmIGl0ZW0uaXNQbGFjaW5nICkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICB2YXIgb2Zmc2V0ID0gdGhpcy5fZ2V0RWxlbWVudE9mZnNldCggc3RhbXAgKTtcbiAgICB2YXIgcmVjdCA9IG5ldyBSZWN0KHtcbiAgICAgIHg6IGlzT3JpZ2luTGVmdCA/IG9mZnNldC5sZWZ0IDogb2Zmc2V0LnJpZ2h0LFxuICAgICAgeTogaXNPcmlnaW5Ub3AgPyBvZmZzZXQudG9wIDogb2Zmc2V0LmJvdHRvbVxuICAgIH0pO1xuICAgIHRoaXMuX3NldFJlY3RTaXplKCBzdGFtcCwgcmVjdCApO1xuICAgIC8vIHNhdmUgaXRzIHNwYWNlIGluIHRoZSBwYWNrZXJcbiAgICB0aGlzLnNoaWZ0UGFja2VyLnBsYWNlZCggcmVjdCApO1xuICB9LCB0aGlzICk7XG5cbiAgLy8gcmVzZXQgc2hpZnRUYXJnZXRzXG4gIHZhciBpc0hvcml6b250YWwgPSB0aGlzLl9nZXRPcHRpb24oJ2hvcml6b250YWwnKTtcbiAgdmFyIHNlZ21lbnROYW1lID0gaXNIb3Jpem9udGFsID8gJ3Jvd0hlaWdodCcgOiAnY29sdW1uV2lkdGgnO1xuICB2YXIgbWVhc3VyZSA9IGlzSG9yaXpvbnRhbCA/ICdoZWlnaHQnIDogJ3dpZHRoJztcblxuICB0aGlzLnNoaWZ0VGFyZ2V0S2V5cyA9IFtdO1xuICB0aGlzLnNoaWZ0VGFyZ2V0cyA9IFtdO1xuICB2YXIgYm91bmRzU2l6ZTtcbiAgdmFyIHNlZ21lbnQgPSB0aGlzWyBzZWdtZW50TmFtZSBdO1xuICBzZWdtZW50ID0gc2VnbWVudCAmJiBzZWdtZW50ICsgdGhpcy5ndXR0ZXI7XG5cbiAgaWYgKCBzZWdtZW50ICkge1xuICAgIHZhciBzZWdtZW50U3BhbiA9IE1hdGguY2VpbCggZHJvcEl0ZW0ucmVjdFsgbWVhc3VyZSBdIC8gc2VnbWVudCApO1xuICAgIHZhciBzZWdzID0gTWF0aC5mbG9vciggKCB0aGlzLnNoaWZ0UGFja2VyWyBtZWFzdXJlIF0gKyB0aGlzLmd1dHRlciApIC8gc2VnbWVudCApO1xuICAgIGJvdW5kc1NpemUgPSAoIHNlZ3MgLSBzZWdtZW50U3BhbiApICogc2VnbWVudDtcbiAgICAvLyBhZGQgdGFyZ2V0cyBvbiB0b3BcbiAgICBmb3IgKCB2YXIgaT0wOyBpIDwgc2VnczsgaSsrICkge1xuICAgICAgdmFyIGluaXRpYWxYID0gaXNIb3Jpem9udGFsID8gMCA6IGkgKiBzZWdtZW50O1xuICAgICAgdmFyIGluaXRpYWxZID0gaXNIb3Jpem9udGFsID8gaSAqIHNlZ21lbnQgOiAwO1xuICAgICAgdGhpcy5fYWRkU2hpZnRUYXJnZXQoIGluaXRpYWxYLCBpbml0aWFsWSwgYm91bmRzU2l6ZSApO1xuICAgIH1cbiAgfSBlbHNlIHtcbiAgICBib3VuZHNTaXplID0gKCB0aGlzLnNoaWZ0UGFja2VyWyBtZWFzdXJlIF0gKyB0aGlzLmd1dHRlciApIC0gZHJvcEl0ZW0ucmVjdFsgbWVhc3VyZSBdO1xuICAgIHRoaXMuX2FkZFNoaWZ0VGFyZ2V0KCAwLCAwLCBib3VuZHNTaXplICk7XG4gIH1cblxuICAvLyBwYWNrIGVhY2ggaXRlbSB0byBtZWFzdXJlIHdoZXJlIHNoaWZ0VGFyZ2V0cyBhcmVcbiAgdmFyIGl0ZW1zID0gdGhpcy5fZ2V0SXRlbXNGb3JMYXlvdXQoIHRoaXMuaXRlbXMgKTtcbiAgdmFyIHBhY2tNZXRob2QgPSB0aGlzLl9nZXRQYWNrTWV0aG9kKCk7XG4gIGl0ZW1zLmZvckVhY2goIGZ1bmN0aW9uKCBpdGVtICkge1xuICAgIHZhciByZWN0ID0gaXRlbS5yZWN0O1xuICAgIHRoaXMuX3NldFJlY3RTaXplKCBpdGVtLmVsZW1lbnQsIHJlY3QgKTtcbiAgICB0aGlzLnNoaWZ0UGFja2VyWyBwYWNrTWV0aG9kIF0oIHJlY3QgKTtcblxuICAgIC8vIGFkZCB0b3AgbGVmdCBjb3JuZXJcbiAgICB0aGlzLl9hZGRTaGlmdFRhcmdldCggcmVjdC54LCByZWN0LnksIGJvdW5kc1NpemUgKTtcbiAgICAvLyBhZGQgYm90dG9tIGxlZnQgLyB0b3AgcmlnaHQgY29ybmVyXG4gICAgdmFyIGNvcm5lclggPSBpc0hvcml6b250YWwgPyByZWN0LnggKyByZWN0LndpZHRoIDogcmVjdC54O1xuICAgIHZhciBjb3JuZXJZID0gaXNIb3Jpem9udGFsID8gcmVjdC55IDogcmVjdC55ICsgcmVjdC5oZWlnaHQ7XG4gICAgdGhpcy5fYWRkU2hpZnRUYXJnZXQoIGNvcm5lclgsIGNvcm5lclksIGJvdW5kc1NpemUgKTtcblxuICAgIGlmICggc2VnbWVudCApIHtcbiAgICAgIC8vIGFkZCB0YXJnZXRzIGZvciBlYWNoIGNvbHVtbiBvbiBib3R0b20gLyByb3cgb24gcmlnaHRcbiAgICAgIHZhciBzZWdTcGFuID0gTWF0aC5yb3VuZCggcmVjdFsgbWVhc3VyZSBdIC8gc2VnbWVudCApO1xuICAgICAgZm9yICggdmFyIGk9MTsgaSA8IHNlZ1NwYW47IGkrKyApIHtcbiAgICAgICAgdmFyIHNlZ1ggPSBpc0hvcml6b250YWwgPyBjb3JuZXJYIDogcmVjdC54ICsgc2VnbWVudCAqIGk7XG4gICAgICAgIHZhciBzZWdZID0gaXNIb3Jpem9udGFsID8gcmVjdC55ICsgc2VnbWVudCAqIGkgOiBjb3JuZXJZO1xuICAgICAgICB0aGlzLl9hZGRTaGlmdFRhcmdldCggc2VnWCwgc2VnWSwgYm91bmRzU2l6ZSApO1xuICAgICAgfVxuICAgIH1cbiAgfSwgdGhpcyApO1xuXG59O1xuXG5wcm90by5fYWRkU2hpZnRUYXJnZXQgPSBmdW5jdGlvbiggeCwgeSwgYm91bmRzU2l6ZSApIHtcbiAgdmFyIGNoZWNrQ29vcmQgPSB0aGlzLl9nZXRPcHRpb24oJ2hvcml6b250YWwnKSA/IHkgOiB4O1xuICBpZiAoIGNoZWNrQ29vcmQgIT09IDAgJiYgY2hlY2tDb29yZCA+IGJvdW5kc1NpemUgKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIC8vIGNyZWF0ZSBzdHJpbmcgZm9yIGEga2V5LCBlYXNpZXIgdG8ga2VlcCB0cmFjayBvZiB3aGF0IHRhcmdldHNcbiAgdmFyIGtleSA9IHggKyAnLCcgKyB5O1xuICB2YXIgaGFzS2V5ID0gdGhpcy5zaGlmdFRhcmdldEtleXMuaW5kZXhPZigga2V5ICkgIT0gLTE7XG4gIGlmICggaGFzS2V5ICkge1xuICAgIHJldHVybjtcbiAgfVxuICB0aGlzLnNoaWZ0VGFyZ2V0S2V5cy5wdXNoKCBrZXkgKTtcbiAgdGhpcy5zaGlmdFRhcmdldHMucHVzaCh7IHg6IHgsIHk6IHkgfSk7XG59O1xuXG4vLyAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSBkcm9wIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbnByb3RvLnNoaWZ0ID0gZnVuY3Rpb24oIGl0ZW0sIHgsIHkgKSB7XG4gIHZhciBzaGlmdFBvc2l0aW9uO1xuICB2YXIgbWluRGlzdGFuY2UgPSBJbmZpbml0eTtcbiAgdmFyIHBvc2l0aW9uID0geyB4OiB4LCB5OiB5IH07XG4gIHRoaXMuc2hpZnRUYXJnZXRzLmZvckVhY2goIGZ1bmN0aW9uKCB0YXJnZXQgKSB7XG4gICAgdmFyIGRpc3RhbmNlID0gZ2V0RGlzdGFuY2UoIHRhcmdldCwgcG9zaXRpb24gKTtcbiAgICBpZiAoIGRpc3RhbmNlIDwgbWluRGlzdGFuY2UgKSB7XG4gICAgICBzaGlmdFBvc2l0aW9uID0gdGFyZ2V0O1xuICAgICAgbWluRGlzdGFuY2UgPSBkaXN0YW5jZTtcbiAgICB9XG4gIH0pO1xuICBpdGVtLnJlY3QueCA9IHNoaWZ0UG9zaXRpb24ueDtcbiAgaXRlbS5yZWN0LnkgPSBzaGlmdFBvc2l0aW9uLnk7XG59O1xuXG5mdW5jdGlvbiBnZXREaXN0YW5jZSggYSwgYiApIHtcbiAgdmFyIGR4ID0gYi54IC0gYS54O1xuICB2YXIgZHkgPSBiLnkgLSBhLnk7XG4gIHJldHVybiBNYXRoLnNxcnQoIGR4ICogZHggKyBkeSAqIGR5ICk7XG59XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGRyYWcgbW92ZSAtLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLSAvL1xuXG52YXIgRFJBR19USFJPVFRMRV9USU1FID0gMTIwO1xuXG4vKipcbiAqIGhhbmRsZSBhbiBpdGVtIGRyYWcgbW92ZSBldmVudFxuICogQHBhcmFtIHtFbGVtZW50fSBlbGVtXG4gKiBAcGFyYW0ge051bWJlcn0geCAtIGhvcml6b250YWwgY2hhbmdlIGluIHBvc2l0aW9uXG4gKiBAcGFyYW0ge051bWJlcn0geSAtIHZlcnRpY2FsIGNoYW5nZSBpbiBwb3NpdGlvblxuICovXG5wcm90by5pdGVtRHJhZ01vdmUgPSBmdW5jdGlvbiggZWxlbSwgeCwgeSApIHtcbiAgdmFyIGl0ZW0gPSB0aGlzLmlzRW5hYmxlZCAmJiB0aGlzLmdldEl0ZW0oIGVsZW0gKTtcbiAgaWYgKCAhaXRlbSApIHtcbiAgICByZXR1cm47XG4gIH1cblxuICB4IC09IHRoaXMuc2l6ZS5wYWRkaW5nTGVmdDtcbiAgeSAtPSB0aGlzLnNpemUucGFkZGluZ1RvcDtcblxuICB2YXIgX3RoaXMgPSB0aGlzO1xuICBmdW5jdGlvbiBvbkRyYWcoKSB7XG4gICAgX3RoaXMuc2hpZnQoIGl0ZW0sIHgsIHkgKTtcbiAgICBpdGVtLnBvc2l0aW9uRHJvcFBsYWNlaG9sZGVyKCk7XG4gICAgX3RoaXMubGF5b3V0KCk7XG4gIH1cblxuICAvLyB0aHJvdHRsZVxuICB2YXIgbm93ID0gbmV3IERhdGUoKTtcbiAgdmFyIGlzVGhyb3R0bGVkID0gdGhpcy5faXRlbURyYWdUaW1lICYmIG5vdyAtIHRoaXMuX2l0ZW1EcmFnVGltZSA8IERSQUdfVEhST1RUTEVfVElNRTtcbiAgaWYgKCBpc1Rocm90dGxlZCApIHtcbiAgICBjbGVhclRpbWVvdXQoIHRoaXMuZHJhZ1RpbWVvdXQgKTtcbiAgICB0aGlzLmRyYWdUaW1lb3V0ID0gc2V0VGltZW91dCggb25EcmFnLCBEUkFHX1RIUk9UVExFX1RJTUUgKTtcbiAgfSBlbHNlIHtcbiAgICBvbkRyYWcoKTtcbiAgICB0aGlzLl9pdGVtRHJhZ1RpbWUgPSBub3c7XG4gIH1cbn07XG5cbi8vIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIGRyYWcgZW5kIC0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tIC8vXG5cbi8qKlxuICogaGFuZGxlIGFuIGl0ZW0gZHJhZyBlbmQgZXZlbnRcbiAqIEBwYXJhbSB7RWxlbWVudH0gZWxlbVxuICovXG5wcm90by5pdGVtRHJhZ0VuZCA9IGZ1bmN0aW9uKCBlbGVtICkge1xuICB2YXIgaXRlbSA9IHRoaXMuaXNFbmFibGVkICYmIHRoaXMuZ2V0SXRlbSggZWxlbSApO1xuICBpZiAoICFpdGVtICkge1xuICAgIHJldHVybjtcbiAgfVxuXG4gIGNsZWFyVGltZW91dCggdGhpcy5kcmFnVGltZW91dCApO1xuICBpdGVtLmVsZW1lbnQuY2xhc3NMaXN0LmFkZCgnaXMtcG9zaXRpb25pbmctcG9zdC1kcmFnJyk7XG5cbiAgdmFyIGNvbXBsZXRlQ291bnQgPSAwO1xuICB2YXIgX3RoaXMgPSB0aGlzO1xuICBmdW5jdGlvbiBvbkRyYWdFbmRMYXlvdXRDb21wbGV0ZSgpIHtcbiAgICBjb21wbGV0ZUNvdW50Kys7XG4gICAgaWYgKCBjb21wbGV0ZUNvdW50ICE9IDIgKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuICAgIC8vIHJlc2V0IGRyYWcgaXRlbVxuICAgIGl0ZW0uZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKCdpcy1wb3NpdGlvbmluZy1wb3N0LWRyYWcnKTtcbiAgICBpdGVtLmhpZGVEcm9wUGxhY2Vob2xkZXIoKTtcbiAgICBfdGhpcy5kaXNwYXRjaEV2ZW50KCAnZHJhZ0l0ZW1Qb3NpdGlvbmVkJywgbnVsbCwgWyBpdGVtIF0gKTtcbiAgfVxuXG4gIGl0ZW0ub25jZSggJ2xheW91dCcsIG9uRHJhZ0VuZExheW91dENvbXBsZXRlICk7XG4gIHRoaXMub25jZSggJ2xheW91dENvbXBsZXRlJywgb25EcmFnRW5kTGF5b3V0Q29tcGxldGUgKTtcbiAgaXRlbS5tb3ZlVG8oIGl0ZW0ucmVjdC54LCBpdGVtLnJlY3QueSApO1xuICB0aGlzLmxheW91dCgpO1xuICB0aGlzLmRyYWdJdGVtQ291bnQgPSBNYXRoLm1heCggMCwgdGhpcy5kcmFnSXRlbUNvdW50IC0gMSApO1xuICB0aGlzLnNvcnRJdGVtc0J5UG9zaXRpb24oKTtcbiAgaXRlbS5kaXNhYmxlUGxhY2luZygpO1xuICB0aGlzLnVuc3RhbXAoIGl0ZW0uZWxlbWVudCApO1xufTtcblxuLyoqXG4gKiBiaW5kcyBEcmFnZ2FiaWxseSBldmVudHNcbiAqIEBwYXJhbSB7RHJhZ2dhYmlsbHl9IGRyYWdnaWVcbiAqL1xucHJvdG8uYmluZERyYWdnYWJpbGx5RXZlbnRzID0gZnVuY3Rpb24oIGRyYWdnaWUgKSB7XG4gIHRoaXMuX2JpbmREcmFnZ2FiaWxseUV2ZW50cyggZHJhZ2dpZSwgJ29uJyApO1xufTtcblxucHJvdG8udW5iaW5kRHJhZ2dhYmlsbHlFdmVudHMgPSBmdW5jdGlvbiggZHJhZ2dpZSApIHtcbiAgdGhpcy5fYmluZERyYWdnYWJpbGx5RXZlbnRzKCBkcmFnZ2llLCAnb2ZmJyApO1xufTtcblxucHJvdG8uX2JpbmREcmFnZ2FiaWxseUV2ZW50cyA9IGZ1bmN0aW9uKCBkcmFnZ2llLCBtZXRob2QgKSB7XG4gIHZhciBoYW5kbGVycyA9IHRoaXMuaGFuZGxlRHJhZ2dhYmlsbHk7XG4gIGRyYWdnaWVbIG1ldGhvZCBdKCAnZHJhZ1N0YXJ0JywgaGFuZGxlcnMuZHJhZ1N0YXJ0ICk7XG4gIGRyYWdnaWVbIG1ldGhvZCBdKCAnZHJhZ01vdmUnLCBoYW5kbGVycy5kcmFnTW92ZSApO1xuICBkcmFnZ2llWyBtZXRob2QgXSggJ2RyYWdFbmQnLCBoYW5kbGVycy5kcmFnRW5kICk7XG59O1xuXG4vKipcbiAqIGJpbmRzIGpRdWVyeSBVSSBEcmFnZ2FibGUgZXZlbnRzXG4gKiBAcGFyYW0ge2pRdWVyeX0gJGVsZW1zXG4gKi9cbnByb3RvLmJpbmRVSURyYWdnYWJsZUV2ZW50cyA9IGZ1bmN0aW9uKCAkZWxlbXMgKSB7XG4gIHRoaXMuX2JpbmRVSURyYWdnYWJsZUV2ZW50cyggJGVsZW1zLCAnb24nICk7XG59O1xuXG5wcm90by51bmJpbmRVSURyYWdnYWJsZUV2ZW50cyA9IGZ1bmN0aW9uKCAkZWxlbXMgKSB7XG4gIHRoaXMuX2JpbmRVSURyYWdnYWJsZUV2ZW50cyggJGVsZW1zLCAnb2ZmJyApO1xufTtcblxucHJvdG8uX2JpbmRVSURyYWdnYWJsZUV2ZW50cyA9IGZ1bmN0aW9uKCAkZWxlbXMsIG1ldGhvZCApIHtcbiAgdmFyIGhhbmRsZXJzID0gdGhpcy5oYW5kbGVVSURyYWdnYWJsZTtcbiAgJGVsZW1zXG4gICAgWyBtZXRob2QgXSggJ2RyYWdzdGFydCcsIGhhbmRsZXJzLnN0YXJ0IClcbiAgICBbIG1ldGhvZCBdKCAnZHJhZycsIGhhbmRsZXJzLmRyYWcgKVxuICAgIFsgbWV0aG9kIF0oICdkcmFnc3RvcCcsIGhhbmRsZXJzLnN0b3AgKTtcbn07XG5cbi8vIC0tLS0tIGRlc3Ryb3kgLS0tLS0gLy9cblxudmFyIF9kZXN0cm95ID0gcHJvdG8uZGVzdHJveTtcbnByb3RvLmRlc3Ryb3kgPSBmdW5jdGlvbigpIHtcbiAgX2Rlc3Ryb3kuYXBwbHkoIHRoaXMsIGFyZ3VtZW50cyApO1xuICAvLyBkaXNhYmxlIGZsYWc7IHByZXZlbnQgZHJhZyBldmVudHMgZnJvbSB0cmlnZ2VyaW5nLiAjNzJcbiAgdGhpcy5pc0VuYWJsZWQgPSBmYWxzZTtcbn07XG5cbi8vIC0tLS0tICAtLS0tLSAvL1xuXG5QYWNrZXJ5LlJlY3QgPSBSZWN0O1xuUGFja2VyeS5QYWNrZXIgPSBQYWNrZXI7XG5cbnJldHVybiBQYWNrZXJ5O1xuXG59KSk7XG5cbiIsIi8qISBqUXVlcnkgdjIuMi40IHwgKGMpIGpRdWVyeSBGb3VuZGF0aW9uIHwganF1ZXJ5Lm9yZy9saWNlbnNlICovXG4hZnVuY3Rpb24oYSxiKXtcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9YS5kb2N1bWVudD9iKGEsITApOmZ1bmN0aW9uKGEpe2lmKCFhLmRvY3VtZW50KXRocm93IG5ldyBFcnJvcihcImpRdWVyeSByZXF1aXJlcyBhIHdpbmRvdyB3aXRoIGEgZG9jdW1lbnRcIik7cmV0dXJuIGIoYSl9OmIoYSl9KFwidW5kZWZpbmVkXCIhPXR5cGVvZiB3aW5kb3c/d2luZG93OnRoaXMsZnVuY3Rpb24oYSxiKXt2YXIgYz1bXSxkPWEuZG9jdW1lbnQsZT1jLnNsaWNlLGY9Yy5jb25jYXQsZz1jLnB1c2gsaD1jLmluZGV4T2YsaT17fSxqPWkudG9TdHJpbmcsaz1pLmhhc093blByb3BlcnR5LGw9e30sbT1cIjIuMi40XCIsbj1mdW5jdGlvbihhLGIpe3JldHVybiBuZXcgbi5mbi5pbml0KGEsYil9LG89L15bXFxzXFx1RkVGRlxceEEwXSt8W1xcc1xcdUZFRkZcXHhBMF0rJC9nLHA9L14tbXMtLyxxPS8tKFtcXGRhLXpdKS9naSxyPWZ1bmN0aW9uKGEsYil7cmV0dXJuIGIudG9VcHBlckNhc2UoKX07bi5mbj1uLnByb3RvdHlwZT17anF1ZXJ5Om0sY29uc3RydWN0b3I6bixzZWxlY3RvcjpcIlwiLGxlbmd0aDowLHRvQXJyYXk6ZnVuY3Rpb24oKXtyZXR1cm4gZS5jYWxsKHRoaXMpfSxnZXQ6ZnVuY3Rpb24oYSl7cmV0dXJuIG51bGwhPWE/MD5hP3RoaXNbYSt0aGlzLmxlbmd0aF06dGhpc1thXTplLmNhbGwodGhpcyl9LHB1c2hTdGFjazpmdW5jdGlvbihhKXt2YXIgYj1uLm1lcmdlKHRoaXMuY29uc3RydWN0b3IoKSxhKTtyZXR1cm4gYi5wcmV2T2JqZWN0PXRoaXMsYi5jb250ZXh0PXRoaXMuY29udGV4dCxifSxlYWNoOmZ1bmN0aW9uKGEpe3JldHVybiBuLmVhY2godGhpcyxhKX0sbWFwOmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLnB1c2hTdGFjayhuLm1hcCh0aGlzLGZ1bmN0aW9uKGIsYyl7cmV0dXJuIGEuY2FsbChiLGMsYil9KSl9LHNsaWNlOmZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMucHVzaFN0YWNrKGUuYXBwbHkodGhpcyxhcmd1bWVudHMpKX0sZmlyc3Q6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5lcSgwKX0sbGFzdDpmdW5jdGlvbigpe3JldHVybiB0aGlzLmVxKC0xKX0sZXE6ZnVuY3Rpb24oYSl7dmFyIGI9dGhpcy5sZW5ndGgsYz0rYSsoMD5hP2I6MCk7cmV0dXJuIHRoaXMucHVzaFN0YWNrKGM+PTAmJmI+Yz9bdGhpc1tjXV06W10pfSxlbmQ6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5wcmV2T2JqZWN0fHx0aGlzLmNvbnN0cnVjdG9yKCl9LHB1c2g6Zyxzb3J0OmMuc29ydCxzcGxpY2U6Yy5zcGxpY2V9LG4uZXh0ZW5kPW4uZm4uZXh0ZW5kPWZ1bmN0aW9uKCl7dmFyIGEsYixjLGQsZSxmLGc9YXJndW1lbnRzWzBdfHx7fSxoPTEsaT1hcmd1bWVudHMubGVuZ3RoLGo9ITE7Zm9yKFwiYm9vbGVhblwiPT10eXBlb2YgZyYmKGo9ZyxnPWFyZ3VtZW50c1toXXx8e30saCsrKSxcIm9iamVjdFwiPT10eXBlb2YgZ3x8bi5pc0Z1bmN0aW9uKGcpfHwoZz17fSksaD09PWkmJihnPXRoaXMsaC0tKTtpPmg7aCsrKWlmKG51bGwhPShhPWFyZ3VtZW50c1toXSkpZm9yKGIgaW4gYSljPWdbYl0sZD1hW2JdLGchPT1kJiYoaiYmZCYmKG4uaXNQbGFpbk9iamVjdChkKXx8KGU9bi5pc0FycmF5KGQpKSk/KGU/KGU9ITEsZj1jJiZuLmlzQXJyYXkoYyk/YzpbXSk6Zj1jJiZuLmlzUGxhaW5PYmplY3QoYyk/Yzp7fSxnW2JdPW4uZXh0ZW5kKGosZixkKSk6dm9pZCAwIT09ZCYmKGdbYl09ZCkpO3JldHVybiBnfSxuLmV4dGVuZCh7ZXhwYW5kbzpcImpRdWVyeVwiKyhtK01hdGgucmFuZG9tKCkpLnJlcGxhY2UoL1xcRC9nLFwiXCIpLGlzUmVhZHk6ITAsZXJyb3I6ZnVuY3Rpb24oYSl7dGhyb3cgbmV3IEVycm9yKGEpfSxub29wOmZ1bmN0aW9uKCl7fSxpc0Z1bmN0aW9uOmZ1bmN0aW9uKGEpe3JldHVyblwiZnVuY3Rpb25cIj09PW4udHlwZShhKX0saXNBcnJheTpBcnJheS5pc0FycmF5LGlzV2luZG93OmZ1bmN0aW9uKGEpe3JldHVybiBudWxsIT1hJiZhPT09YS53aW5kb3d9LGlzTnVtZXJpYzpmdW5jdGlvbihhKXt2YXIgYj1hJiZhLnRvU3RyaW5nKCk7cmV0dXJuIW4uaXNBcnJheShhKSYmYi1wYXJzZUZsb2F0KGIpKzE+PTB9LGlzUGxhaW5PYmplY3Q6ZnVuY3Rpb24oYSl7dmFyIGI7aWYoXCJvYmplY3RcIiE9PW4udHlwZShhKXx8YS5ub2RlVHlwZXx8bi5pc1dpbmRvdyhhKSlyZXR1cm4hMTtpZihhLmNvbnN0cnVjdG9yJiYhay5jYWxsKGEsXCJjb25zdHJ1Y3RvclwiKSYmIWsuY2FsbChhLmNvbnN0cnVjdG9yLnByb3RvdHlwZXx8e30sXCJpc1Byb3RvdHlwZU9mXCIpKXJldHVybiExO2ZvcihiIGluIGEpO3JldHVybiB2b2lkIDA9PT1ifHxrLmNhbGwoYSxiKX0saXNFbXB0eU9iamVjdDpmdW5jdGlvbihhKXt2YXIgYjtmb3IoYiBpbiBhKXJldHVybiExO3JldHVybiEwfSx0eXBlOmZ1bmN0aW9uKGEpe3JldHVybiBudWxsPT1hP2ErXCJcIjpcIm9iamVjdFwiPT10eXBlb2YgYXx8XCJmdW5jdGlvblwiPT10eXBlb2YgYT9pW2ouY2FsbChhKV18fFwib2JqZWN0XCI6dHlwZW9mIGF9LGdsb2JhbEV2YWw6ZnVuY3Rpb24oYSl7dmFyIGIsYz1ldmFsO2E9bi50cmltKGEpLGEmJigxPT09YS5pbmRleE9mKFwidXNlIHN0cmljdFwiKT8oYj1kLmNyZWF0ZUVsZW1lbnQoXCJzY3JpcHRcIiksYi50ZXh0PWEsZC5oZWFkLmFwcGVuZENoaWxkKGIpLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoYikpOmMoYSkpfSxjYW1lbENhc2U6ZnVuY3Rpb24oYSl7cmV0dXJuIGEucmVwbGFjZShwLFwibXMtXCIpLnJlcGxhY2UocSxyKX0sbm9kZU5hbWU6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYS5ub2RlTmFtZSYmYS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpPT09Yi50b0xvd2VyQ2FzZSgpfSxlYWNoOmZ1bmN0aW9uKGEsYil7dmFyIGMsZD0wO2lmKHMoYSkpe2ZvcihjPWEubGVuZ3RoO2M+ZDtkKyspaWYoYi5jYWxsKGFbZF0sZCxhW2RdKT09PSExKWJyZWFrfWVsc2UgZm9yKGQgaW4gYSlpZihiLmNhbGwoYVtkXSxkLGFbZF0pPT09ITEpYnJlYWs7cmV0dXJuIGF9LHRyaW06ZnVuY3Rpb24oYSl7cmV0dXJuIG51bGw9PWE/XCJcIjooYStcIlwiKS5yZXBsYWNlKG8sXCJcIil9LG1ha2VBcnJheTpmdW5jdGlvbihhLGIpe3ZhciBjPWJ8fFtdO3JldHVybiBudWxsIT1hJiYocyhPYmplY3QoYSkpP24ubWVyZ2UoYyxcInN0cmluZ1wiPT10eXBlb2YgYT9bYV06YSk6Zy5jYWxsKGMsYSkpLGN9LGluQXJyYXk6ZnVuY3Rpb24oYSxiLGMpe3JldHVybiBudWxsPT1iPy0xOmguY2FsbChiLGEsYyl9LG1lcmdlOmZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjPStiLmxlbmd0aCxkPTAsZT1hLmxlbmd0aDtjPmQ7ZCsrKWFbZSsrXT1iW2RdO3JldHVybiBhLmxlbmd0aD1lLGF9LGdyZXA6ZnVuY3Rpb24oYSxiLGMpe2Zvcih2YXIgZCxlPVtdLGY9MCxnPWEubGVuZ3RoLGg9IWM7Zz5mO2YrKylkPSFiKGFbZl0sZiksZCE9PWgmJmUucHVzaChhW2ZdKTtyZXR1cm4gZX0sbWFwOmZ1bmN0aW9uKGEsYixjKXt2YXIgZCxlLGc9MCxoPVtdO2lmKHMoYSkpZm9yKGQ9YS5sZW5ndGg7ZD5nO2crKyllPWIoYVtnXSxnLGMpLG51bGwhPWUmJmgucHVzaChlKTtlbHNlIGZvcihnIGluIGEpZT1iKGFbZ10sZyxjKSxudWxsIT1lJiZoLnB1c2goZSk7cmV0dXJuIGYuYXBwbHkoW10saCl9LGd1aWQ6MSxwcm94eTpmdW5jdGlvbihhLGIpe3ZhciBjLGQsZjtyZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgYiYmKGM9YVtiXSxiPWEsYT1jKSxuLmlzRnVuY3Rpb24oYSk/KGQ9ZS5jYWxsKGFyZ3VtZW50cywyKSxmPWZ1bmN0aW9uKCl7cmV0dXJuIGEuYXBwbHkoYnx8dGhpcyxkLmNvbmNhdChlLmNhbGwoYXJndW1lbnRzKSkpfSxmLmd1aWQ9YS5ndWlkPWEuZ3VpZHx8bi5ndWlkKyssZik6dm9pZCAwfSxub3c6RGF0ZS5ub3csc3VwcG9ydDpsfSksXCJmdW5jdGlvblwiPT10eXBlb2YgU3ltYm9sJiYobi5mbltTeW1ib2wuaXRlcmF0b3JdPWNbU3ltYm9sLml0ZXJhdG9yXSksbi5lYWNoKFwiQm9vbGVhbiBOdW1iZXIgU3RyaW5nIEZ1bmN0aW9uIEFycmF5IERhdGUgUmVnRXhwIE9iamVjdCBFcnJvciBTeW1ib2xcIi5zcGxpdChcIiBcIiksZnVuY3Rpb24oYSxiKXtpW1wiW29iamVjdCBcIitiK1wiXVwiXT1iLnRvTG93ZXJDYXNlKCl9KTtmdW5jdGlvbiBzKGEpe3ZhciBiPSEhYSYmXCJsZW5ndGhcImluIGEmJmEubGVuZ3RoLGM9bi50eXBlKGEpO3JldHVyblwiZnVuY3Rpb25cIj09PWN8fG4uaXNXaW5kb3coYSk/ITE6XCJhcnJheVwiPT09Y3x8MD09PWJ8fFwibnVtYmVyXCI9PXR5cGVvZiBiJiZiPjAmJmItMSBpbiBhfXZhciB0PWZ1bmN0aW9uKGEpe3ZhciBiLGMsZCxlLGYsZyxoLGksaixrLGwsbSxuLG8scCxxLHIscyx0LHU9XCJzaXp6bGVcIisxKm5ldyBEYXRlLHY9YS5kb2N1bWVudCx3PTAseD0wLHk9Z2EoKSx6PWdhKCksQT1nYSgpLEI9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYT09PWImJihsPSEwKSwwfSxDPTE8PDMxLEQ9e30uaGFzT3duUHJvcGVydHksRT1bXSxGPUUucG9wLEc9RS5wdXNoLEg9RS5wdXNoLEk9RS5zbGljZSxKPWZ1bmN0aW9uKGEsYil7Zm9yKHZhciBjPTAsZD1hLmxlbmd0aDtkPmM7YysrKWlmKGFbY109PT1iKXJldHVybiBjO3JldHVybi0xfSxLPVwiY2hlY2tlZHxzZWxlY3RlZHxhc3luY3xhdXRvZm9jdXN8YXV0b3BsYXl8Y29udHJvbHN8ZGVmZXJ8ZGlzYWJsZWR8aGlkZGVufGlzbWFwfGxvb3B8bXVsdGlwbGV8b3BlbnxyZWFkb25seXxyZXF1aXJlZHxzY29wZWRcIixMPVwiW1xcXFx4MjBcXFxcdFxcXFxyXFxcXG5cXFxcZl1cIixNPVwiKD86XFxcXFxcXFwufFtcXFxcdy1dfFteXFxcXHgwMC1cXFxceGEwXSkrXCIsTj1cIlxcXFxbXCIrTCtcIiooXCIrTStcIikoPzpcIitMK1wiKihbKl4kfCF+XT89KVwiK0wrXCIqKD86JygoPzpcXFxcXFxcXC58W15cXFxcXFxcXCddKSopJ3xcXFwiKCg/OlxcXFxcXFxcLnxbXlxcXFxcXFxcXFxcIl0pKilcXFwifChcIitNK1wiKSl8KVwiK0wrXCIqXFxcXF1cIixPPVwiOihcIitNK1wiKSg/OlxcXFwoKCgnKCg/OlxcXFxcXFxcLnxbXlxcXFxcXFxcJ10pKiknfFxcXCIoKD86XFxcXFxcXFwufFteXFxcXFxcXFxcXFwiXSkqKVxcXCIpfCgoPzpcXFxcXFxcXC58W15cXFxcXFxcXCgpW1xcXFxdXXxcIitOK1wiKSopfC4qKVxcXFwpfClcIixQPW5ldyBSZWdFeHAoTCtcIitcIixcImdcIiksUT1uZXcgUmVnRXhwKFwiXlwiK0wrXCIrfCgoPzpefFteXFxcXFxcXFxdKSg/OlxcXFxcXFxcLikqKVwiK0wrXCIrJFwiLFwiZ1wiKSxSPW5ldyBSZWdFeHAoXCJeXCIrTCtcIiosXCIrTCtcIipcIiksUz1uZXcgUmVnRXhwKFwiXlwiK0wrXCIqKFs+K35dfFwiK0wrXCIpXCIrTCtcIipcIiksVD1uZXcgUmVnRXhwKFwiPVwiK0wrXCIqKFteXFxcXF0nXFxcIl0qPylcIitMK1wiKlxcXFxdXCIsXCJnXCIpLFU9bmV3IFJlZ0V4cChPKSxWPW5ldyBSZWdFeHAoXCJeXCIrTStcIiRcIiksVz17SUQ6bmV3IFJlZ0V4cChcIl4jKFwiK00rXCIpXCIpLENMQVNTOm5ldyBSZWdFeHAoXCJeXFxcXC4oXCIrTStcIilcIiksVEFHOm5ldyBSZWdFeHAoXCJeKFwiK00rXCJ8WypdKVwiKSxBVFRSOm5ldyBSZWdFeHAoXCJeXCIrTiksUFNFVURPOm5ldyBSZWdFeHAoXCJeXCIrTyksQ0hJTEQ6bmV3IFJlZ0V4cChcIl46KG9ubHl8Zmlyc3R8bGFzdHxudGh8bnRoLWxhc3QpLShjaGlsZHxvZi10eXBlKSg/OlxcXFwoXCIrTCtcIiooZXZlbnxvZGR8KChbKy1dfCkoXFxcXGQqKW58KVwiK0wrXCIqKD86KFsrLV18KVwiK0wrXCIqKFxcXFxkKyl8KSlcIitMK1wiKlxcXFwpfClcIixcImlcIiksYm9vbDpuZXcgUmVnRXhwKFwiXig/OlwiK0srXCIpJFwiLFwiaVwiKSxuZWVkc0NvbnRleHQ6bmV3IFJlZ0V4cChcIl5cIitMK1wiKls+K35dfDooZXZlbnxvZGR8ZXF8Z3R8bHR8bnRofGZpcnN0fGxhc3QpKD86XFxcXChcIitMK1wiKigoPzotXFxcXGQpP1xcXFxkKilcIitMK1wiKlxcXFwpfCkoPz1bXi1dfCQpXCIsXCJpXCIpfSxYPS9eKD86aW5wdXR8c2VsZWN0fHRleHRhcmVhfGJ1dHRvbikkL2ksWT0vXmhcXGQkL2ksWj0vXltee10rXFx7XFxzKlxcW25hdGl2ZSBcXHcvLCQ9L14oPzojKFtcXHctXSspfChcXHcrKXxcXC4oW1xcdy1dKykpJC8sXz0vWyt+XS8sYWE9Lyd8XFxcXC9nLGJhPW5ldyBSZWdFeHAoXCJcXFxcXFxcXChbXFxcXGRhLWZdezEsNn1cIitMK1wiP3woXCIrTCtcIil8LilcIixcImlnXCIpLGNhPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD1cIjB4XCIrYi02NTUzNjtyZXR1cm4gZCE9PWR8fGM/YjowPmQ/U3RyaW5nLmZyb21DaGFyQ29kZShkKzY1NTM2KTpTdHJpbmcuZnJvbUNoYXJDb2RlKGQ+PjEwfDU1Mjk2LDEwMjMmZHw1NjMyMCl9LGRhPWZ1bmN0aW9uKCl7bSgpfTt0cnl7SC5hcHBseShFPUkuY2FsbCh2LmNoaWxkTm9kZXMpLHYuY2hpbGROb2RlcyksRVt2LmNoaWxkTm9kZXMubGVuZ3RoXS5ub2RlVHlwZX1jYXRjaChlYSl7SD17YXBwbHk6RS5sZW5ndGg/ZnVuY3Rpb24oYSxiKXtHLmFwcGx5KGEsSS5jYWxsKGIpKX06ZnVuY3Rpb24oYSxiKXt2YXIgYz1hLmxlbmd0aCxkPTA7d2hpbGUoYVtjKytdPWJbZCsrXSk7YS5sZW5ndGg9Yy0xfX19ZnVuY3Rpb24gZmEoYSxiLGQsZSl7dmFyIGYsaCxqLGssbCxvLHIscyx3PWImJmIub3duZXJEb2N1bWVudCx4PWI/Yi5ub2RlVHlwZTo5O2lmKGQ9ZHx8W10sXCJzdHJpbmdcIiE9dHlwZW9mIGF8fCFhfHwxIT09eCYmOSE9PXgmJjExIT09eClyZXR1cm4gZDtpZighZSYmKChiP2Iub3duZXJEb2N1bWVudHx8Yjp2KSE9PW4mJm0oYiksYj1ifHxuLHApKXtpZigxMSE9PXgmJihvPSQuZXhlYyhhKSkpaWYoZj1vWzFdKXtpZig5PT09eCl7aWYoIShqPWIuZ2V0RWxlbWVudEJ5SWQoZikpKXJldHVybiBkO2lmKGouaWQ9PT1mKXJldHVybiBkLnB1c2goaiksZH1lbHNlIGlmKHcmJihqPXcuZ2V0RWxlbWVudEJ5SWQoZikpJiZ0KGIsaikmJmouaWQ9PT1mKXJldHVybiBkLnB1c2goaiksZH1lbHNle2lmKG9bMl0pcmV0dXJuIEguYXBwbHkoZCxiLmdldEVsZW1lbnRzQnlUYWdOYW1lKGEpKSxkO2lmKChmPW9bM10pJiZjLmdldEVsZW1lbnRzQnlDbGFzc05hbWUmJmIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZSlyZXR1cm4gSC5hcHBseShkLGIuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZShmKSksZH1pZihjLnFzYSYmIUFbYStcIiBcIl0mJighcXx8IXEudGVzdChhKSkpe2lmKDEhPT14KXc9YixzPWE7ZWxzZSBpZihcIm9iamVjdFwiIT09Yi5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpKXsoaz1iLmdldEF0dHJpYnV0ZShcImlkXCIpKT9rPWsucmVwbGFjZShhYSxcIlxcXFwkJlwiKTpiLnNldEF0dHJpYnV0ZShcImlkXCIsaz11KSxyPWcoYSksaD1yLmxlbmd0aCxsPVYudGVzdChrKT9cIiNcIitrOlwiW2lkPSdcIitrK1wiJ11cIjt3aGlsZShoLS0pcltoXT1sK1wiIFwiK3FhKHJbaF0pO3M9ci5qb2luKFwiLFwiKSx3PV8udGVzdChhKSYmb2EoYi5wYXJlbnROb2RlKXx8Yn1pZihzKXRyeXtyZXR1cm4gSC5hcHBseShkLHcucXVlcnlTZWxlY3RvckFsbChzKSksZH1jYXRjaCh5KXt9ZmluYWxseXtrPT09dSYmYi5yZW1vdmVBdHRyaWJ1dGUoXCJpZFwiKX19fXJldHVybiBpKGEucmVwbGFjZShRLFwiJDFcIiksYixkLGUpfWZ1bmN0aW9uIGdhKCl7dmFyIGE9W107ZnVuY3Rpb24gYihjLGUpe3JldHVybiBhLnB1c2goYytcIiBcIik+ZC5jYWNoZUxlbmd0aCYmZGVsZXRlIGJbYS5zaGlmdCgpXSxiW2MrXCIgXCJdPWV9cmV0dXJuIGJ9ZnVuY3Rpb24gaGEoYSl7cmV0dXJuIGFbdV09ITAsYX1mdW5jdGlvbiBpYShhKXt2YXIgYj1uLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7dHJ5e3JldHVybiEhYShiKX1jYXRjaChjKXtyZXR1cm4hMX1maW5hbGx5e2IucGFyZW50Tm9kZSYmYi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGIpLGI9bnVsbH19ZnVuY3Rpb24gamEoYSxiKXt2YXIgYz1hLnNwbGl0KFwifFwiKSxlPWMubGVuZ3RoO3doaWxlKGUtLSlkLmF0dHJIYW5kbGVbY1tlXV09Yn1mdW5jdGlvbiBrYShhLGIpe3ZhciBjPWImJmEsZD1jJiYxPT09YS5ub2RlVHlwZSYmMT09PWIubm9kZVR5cGUmJih+Yi5zb3VyY2VJbmRleHx8QyktKH5hLnNvdXJjZUluZGV4fHxDKTtpZihkKXJldHVybiBkO2lmKGMpd2hpbGUoYz1jLm5leHRTaWJsaW5nKWlmKGM9PT1iKXJldHVybi0xO3JldHVybiBhPzE6LTF9ZnVuY3Rpb24gbGEoYSl7cmV0dXJuIGZ1bmN0aW9uKGIpe3ZhciBjPWIubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtyZXR1cm5cImlucHV0XCI9PT1jJiZiLnR5cGU9PT1hfX1mdW5jdGlvbiBtYShhKXtyZXR1cm4gZnVuY3Rpb24oYil7dmFyIGM9Yi5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO3JldHVybihcImlucHV0XCI9PT1jfHxcImJ1dHRvblwiPT09YykmJmIudHlwZT09PWF9fWZ1bmN0aW9uIG5hKGEpe3JldHVybiBoYShmdW5jdGlvbihiKXtyZXR1cm4gYj0rYixoYShmdW5jdGlvbihjLGQpe3ZhciBlLGY9YShbXSxjLmxlbmd0aCxiKSxnPWYubGVuZ3RoO3doaWxlKGctLSljW2U9ZltnXV0mJihjW2VdPSEoZFtlXT1jW2VdKSl9KX0pfWZ1bmN0aW9uIG9hKGEpe3JldHVybiBhJiZcInVuZGVmaW5lZFwiIT10eXBlb2YgYS5nZXRFbGVtZW50c0J5VGFnTmFtZSYmYX1jPWZhLnN1cHBvcnQ9e30sZj1mYS5pc1hNTD1mdW5jdGlvbihhKXt2YXIgYj1hJiYoYS5vd25lckRvY3VtZW50fHxhKS5kb2N1bWVudEVsZW1lbnQ7cmV0dXJuIGI/XCJIVE1MXCIhPT1iLm5vZGVOYW1lOiExfSxtPWZhLnNldERvY3VtZW50PWZ1bmN0aW9uKGEpe3ZhciBiLGUsZz1hP2Eub3duZXJEb2N1bWVudHx8YTp2O3JldHVybiBnIT09biYmOT09PWcubm9kZVR5cGUmJmcuZG9jdW1lbnRFbGVtZW50PyhuPWcsbz1uLmRvY3VtZW50RWxlbWVudCxwPSFmKG4pLChlPW4uZGVmYXVsdFZpZXcpJiZlLnRvcCE9PWUmJihlLmFkZEV2ZW50TGlzdGVuZXI/ZS5hZGRFdmVudExpc3RlbmVyKFwidW5sb2FkXCIsZGEsITEpOmUuYXR0YWNoRXZlbnQmJmUuYXR0YWNoRXZlbnQoXCJvbnVubG9hZFwiLGRhKSksYy5hdHRyaWJ1dGVzPWlhKGZ1bmN0aW9uKGEpe3JldHVybiBhLmNsYXNzTmFtZT1cImlcIiwhYS5nZXRBdHRyaWJ1dGUoXCJjbGFzc05hbWVcIil9KSxjLmdldEVsZW1lbnRzQnlUYWdOYW1lPWlhKGZ1bmN0aW9uKGEpe3JldHVybiBhLmFwcGVuZENoaWxkKG4uY3JlYXRlQ29tbWVudChcIlwiKSksIWEuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCIqXCIpLmxlbmd0aH0pLGMuZ2V0RWxlbWVudHNCeUNsYXNzTmFtZT1aLnRlc3Qobi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKSxjLmdldEJ5SWQ9aWEoZnVuY3Rpb24oYSl7cmV0dXJuIG8uYXBwZW5kQ2hpbGQoYSkuaWQ9dSwhbi5nZXRFbGVtZW50c0J5TmFtZXx8IW4uZ2V0RWxlbWVudHNCeU5hbWUodSkubGVuZ3RofSksYy5nZXRCeUlkPyhkLmZpbmQuSUQ9ZnVuY3Rpb24oYSxiKXtpZihcInVuZGVmaW5lZFwiIT10eXBlb2YgYi5nZXRFbGVtZW50QnlJZCYmcCl7dmFyIGM9Yi5nZXRFbGVtZW50QnlJZChhKTtyZXR1cm4gYz9bY106W119fSxkLmZpbHRlci5JRD1mdW5jdGlvbihhKXt2YXIgYj1hLnJlcGxhY2UoYmEsY2EpO3JldHVybiBmdW5jdGlvbihhKXtyZXR1cm4gYS5nZXRBdHRyaWJ1dGUoXCJpZFwiKT09PWJ9fSk6KGRlbGV0ZSBkLmZpbmQuSUQsZC5maWx0ZXIuSUQ9ZnVuY3Rpb24oYSl7dmFyIGI9YS5yZXBsYWNlKGJhLGNhKTtyZXR1cm4gZnVuY3Rpb24oYSl7dmFyIGM9XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGEuZ2V0QXR0cmlidXRlTm9kZSYmYS5nZXRBdHRyaWJ1dGVOb2RlKFwiaWRcIik7cmV0dXJuIGMmJmMudmFsdWU9PT1ifX0pLGQuZmluZC5UQUc9Yy5nZXRFbGVtZW50c0J5VGFnTmFtZT9mdW5jdGlvbihhLGIpe3JldHVyblwidW5kZWZpbmVkXCIhPXR5cGVvZiBiLmdldEVsZW1lbnRzQnlUYWdOYW1lP2IuZ2V0RWxlbWVudHNCeVRhZ05hbWUoYSk6Yy5xc2E/Yi5xdWVyeVNlbGVjdG9yQWxsKGEpOnZvaWQgMH06ZnVuY3Rpb24oYSxiKXt2YXIgYyxkPVtdLGU9MCxmPWIuZ2V0RWxlbWVudHNCeVRhZ05hbWUoYSk7aWYoXCIqXCI9PT1hKXt3aGlsZShjPWZbZSsrXSkxPT09Yy5ub2RlVHlwZSYmZC5wdXNoKGMpO3JldHVybiBkfXJldHVybiBmfSxkLmZpbmQuQ0xBU1M9Yy5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lJiZmdW5jdGlvbihhLGIpe3JldHVyblwidW5kZWZpbmVkXCIhPXR5cGVvZiBiLmdldEVsZW1lbnRzQnlDbGFzc05hbWUmJnA/Yi5nZXRFbGVtZW50c0J5Q2xhc3NOYW1lKGEpOnZvaWQgMH0scj1bXSxxPVtdLChjLnFzYT1aLnRlc3Qobi5xdWVyeVNlbGVjdG9yQWxsKSkmJihpYShmdW5jdGlvbihhKXtvLmFwcGVuZENoaWxkKGEpLmlubmVySFRNTD1cIjxhIGlkPSdcIit1K1wiJz48L2E+PHNlbGVjdCBpZD0nXCIrdStcIi1cXHJcXFxcJyBtc2FsbG93Y2FwdHVyZT0nJz48b3B0aW9uIHNlbGVjdGVkPScnPjwvb3B0aW9uPjwvc2VsZWN0PlwiLGEucXVlcnlTZWxlY3RvckFsbChcIlttc2FsbG93Y2FwdHVyZV49JyddXCIpLmxlbmd0aCYmcS5wdXNoKFwiWypeJF09XCIrTCtcIiooPzonJ3xcXFwiXFxcIilcIiksYS5xdWVyeVNlbGVjdG9yQWxsKFwiW3NlbGVjdGVkXVwiKS5sZW5ndGh8fHEucHVzaChcIlxcXFxbXCIrTCtcIiooPzp2YWx1ZXxcIitLK1wiKVwiKSxhLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbaWR+PVwiK3UrXCItXVwiKS5sZW5ndGh8fHEucHVzaChcIn49XCIpLGEucXVlcnlTZWxlY3RvckFsbChcIjpjaGVja2VkXCIpLmxlbmd0aHx8cS5wdXNoKFwiOmNoZWNrZWRcIiksYS5xdWVyeVNlbGVjdG9yQWxsKFwiYSNcIit1K1wiKypcIikubGVuZ3RofHxxLnB1c2goXCIuIy4rWyt+XVwiKX0pLGlhKGZ1bmN0aW9uKGEpe3ZhciBiPW4uY3JlYXRlRWxlbWVudChcImlucHV0XCIpO2Iuc2V0QXR0cmlidXRlKFwidHlwZVwiLFwiaGlkZGVuXCIpLGEuYXBwZW5kQ2hpbGQoYikuc2V0QXR0cmlidXRlKFwibmFtZVwiLFwiRFwiKSxhLnF1ZXJ5U2VsZWN0b3JBbGwoXCJbbmFtZT1kXVwiKS5sZW5ndGgmJnEucHVzaChcIm5hbWVcIitMK1wiKlsqXiR8IX5dPz1cIiksYS5xdWVyeVNlbGVjdG9yQWxsKFwiOmVuYWJsZWRcIikubGVuZ3RofHxxLnB1c2goXCI6ZW5hYmxlZFwiLFwiOmRpc2FibGVkXCIpLGEucXVlcnlTZWxlY3RvckFsbChcIiosOnhcIikscS5wdXNoKFwiLC4qOlwiKX0pKSwoYy5tYXRjaGVzU2VsZWN0b3I9Wi50ZXN0KHM9by5tYXRjaGVzfHxvLndlYmtpdE1hdGNoZXNTZWxlY3Rvcnx8by5tb3pNYXRjaGVzU2VsZWN0b3J8fG8ub01hdGNoZXNTZWxlY3Rvcnx8by5tc01hdGNoZXNTZWxlY3RvcikpJiZpYShmdW5jdGlvbihhKXtjLmRpc2Nvbm5lY3RlZE1hdGNoPXMuY2FsbChhLFwiZGl2XCIpLHMuY2FsbChhLFwiW3MhPScnXTp4XCIpLHIucHVzaChcIiE9XCIsTyl9KSxxPXEubGVuZ3RoJiZuZXcgUmVnRXhwKHEuam9pbihcInxcIikpLHI9ci5sZW5ndGgmJm5ldyBSZWdFeHAoci5qb2luKFwifFwiKSksYj1aLnRlc3Qoby5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbiksdD1ifHxaLnRlc3Qoby5jb250YWlucyk/ZnVuY3Rpb24oYSxiKXt2YXIgYz05PT09YS5ub2RlVHlwZT9hLmRvY3VtZW50RWxlbWVudDphLGQ9YiYmYi5wYXJlbnROb2RlO3JldHVybiBhPT09ZHx8ISghZHx8MSE9PWQubm9kZVR5cGV8fCEoYy5jb250YWlucz9jLmNvbnRhaW5zKGQpOmEuY29tcGFyZURvY3VtZW50UG9zaXRpb24mJjE2JmEuY29tcGFyZURvY3VtZW50UG9zaXRpb24oZCkpKX06ZnVuY3Rpb24oYSxiKXtpZihiKXdoaWxlKGI9Yi5wYXJlbnROb2RlKWlmKGI9PT1hKXJldHVybiEwO3JldHVybiExfSxCPWI/ZnVuY3Rpb24oYSxiKXtpZihhPT09YilyZXR1cm4gbD0hMCwwO3ZhciBkPSFhLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uLSFiLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uO3JldHVybiBkP2Q6KGQ9KGEub3duZXJEb2N1bWVudHx8YSk9PT0oYi5vd25lckRvY3VtZW50fHxiKT9hLmNvbXBhcmVEb2N1bWVudFBvc2l0aW9uKGIpOjEsMSZkfHwhYy5zb3J0RGV0YWNoZWQmJmIuY29tcGFyZURvY3VtZW50UG9zaXRpb24oYSk9PT1kP2E9PT1ufHxhLm93bmVyRG9jdW1lbnQ9PT12JiZ0KHYsYSk/LTE6Yj09PW58fGIub3duZXJEb2N1bWVudD09PXYmJnQodixiKT8xOms/SihrLGEpLUooayxiKTowOjQmZD8tMToxKX06ZnVuY3Rpb24oYSxiKXtpZihhPT09YilyZXR1cm4gbD0hMCwwO3ZhciBjLGQ9MCxlPWEucGFyZW50Tm9kZSxmPWIucGFyZW50Tm9kZSxnPVthXSxoPVtiXTtpZighZXx8IWYpcmV0dXJuIGE9PT1uPy0xOmI9PT1uPzE6ZT8tMTpmPzE6az9KKGssYSktSihrLGIpOjA7aWYoZT09PWYpcmV0dXJuIGthKGEsYik7Yz1hO3doaWxlKGM9Yy5wYXJlbnROb2RlKWcudW5zaGlmdChjKTtjPWI7d2hpbGUoYz1jLnBhcmVudE5vZGUpaC51bnNoaWZ0KGMpO3doaWxlKGdbZF09PT1oW2RdKWQrKztyZXR1cm4gZD9rYShnW2RdLGhbZF0pOmdbZF09PT12Py0xOmhbZF09PT12PzE6MH0sbik6bn0sZmEubWF0Y2hlcz1mdW5jdGlvbihhLGIpe3JldHVybiBmYShhLG51bGwsbnVsbCxiKX0sZmEubWF0Y2hlc1NlbGVjdG9yPWZ1bmN0aW9uKGEsYil7aWYoKGEub3duZXJEb2N1bWVudHx8YSkhPT1uJiZtKGEpLGI9Yi5yZXBsYWNlKFQsXCI9JyQxJ11cIiksYy5tYXRjaGVzU2VsZWN0b3ImJnAmJiFBW2IrXCIgXCJdJiYoIXJ8fCFyLnRlc3QoYikpJiYoIXF8fCFxLnRlc3QoYikpKXRyeXt2YXIgZD1zLmNhbGwoYSxiKTtpZihkfHxjLmRpc2Nvbm5lY3RlZE1hdGNofHxhLmRvY3VtZW50JiYxMSE9PWEuZG9jdW1lbnQubm9kZVR5cGUpcmV0dXJuIGR9Y2F0Y2goZSl7fXJldHVybiBmYShiLG4sbnVsbCxbYV0pLmxlbmd0aD4wfSxmYS5jb250YWlucz1mdW5jdGlvbihhLGIpe3JldHVybihhLm93bmVyRG9jdW1lbnR8fGEpIT09biYmbShhKSx0KGEsYil9LGZhLmF0dHI9ZnVuY3Rpb24oYSxiKXsoYS5vd25lckRvY3VtZW50fHxhKSE9PW4mJm0oYSk7dmFyIGU9ZC5hdHRySGFuZGxlW2IudG9Mb3dlckNhc2UoKV0sZj1lJiZELmNhbGwoZC5hdHRySGFuZGxlLGIudG9Mb3dlckNhc2UoKSk/ZShhLGIsIXApOnZvaWQgMDtyZXR1cm4gdm9pZCAwIT09Zj9mOmMuYXR0cmlidXRlc3x8IXA/YS5nZXRBdHRyaWJ1dGUoYik6KGY9YS5nZXRBdHRyaWJ1dGVOb2RlKGIpKSYmZi5zcGVjaWZpZWQ/Zi52YWx1ZTpudWxsfSxmYS5lcnJvcj1mdW5jdGlvbihhKXt0aHJvdyBuZXcgRXJyb3IoXCJTeW50YXggZXJyb3IsIHVucmVjb2duaXplZCBleHByZXNzaW9uOiBcIithKX0sZmEudW5pcXVlU29ydD1mdW5jdGlvbihhKXt2YXIgYixkPVtdLGU9MCxmPTA7aWYobD0hYy5kZXRlY3REdXBsaWNhdGVzLGs9IWMuc29ydFN0YWJsZSYmYS5zbGljZSgwKSxhLnNvcnQoQiksbCl7d2hpbGUoYj1hW2YrK10pYj09PWFbZl0mJihlPWQucHVzaChmKSk7d2hpbGUoZS0tKWEuc3BsaWNlKGRbZV0sMSl9cmV0dXJuIGs9bnVsbCxhfSxlPWZhLmdldFRleHQ9ZnVuY3Rpb24oYSl7dmFyIGIsYz1cIlwiLGQ9MCxmPWEubm9kZVR5cGU7aWYoZil7aWYoMT09PWZ8fDk9PT1mfHwxMT09PWYpe2lmKFwic3RyaW5nXCI9PXR5cGVvZiBhLnRleHRDb250ZW50KXJldHVybiBhLnRleHRDb250ZW50O2ZvcihhPWEuZmlyc3RDaGlsZDthO2E9YS5uZXh0U2libGluZyljKz1lKGEpfWVsc2UgaWYoMz09PWZ8fDQ9PT1mKXJldHVybiBhLm5vZGVWYWx1ZX1lbHNlIHdoaWxlKGI9YVtkKytdKWMrPWUoYik7cmV0dXJuIGN9LGQ9ZmEuc2VsZWN0b3JzPXtjYWNoZUxlbmd0aDo1MCxjcmVhdGVQc2V1ZG86aGEsbWF0Y2g6VyxhdHRySGFuZGxlOnt9LGZpbmQ6e30scmVsYXRpdmU6e1wiPlwiOntkaXI6XCJwYXJlbnROb2RlXCIsZmlyc3Q6ITB9LFwiIFwiOntkaXI6XCJwYXJlbnROb2RlXCJ9LFwiK1wiOntkaXI6XCJwcmV2aW91c1NpYmxpbmdcIixmaXJzdDohMH0sXCJ+XCI6e2RpcjpcInByZXZpb3VzU2libGluZ1wifX0scHJlRmlsdGVyOntBVFRSOmZ1bmN0aW9uKGEpe3JldHVybiBhWzFdPWFbMV0ucmVwbGFjZShiYSxjYSksYVszXT0oYVszXXx8YVs0XXx8YVs1XXx8XCJcIikucmVwbGFjZShiYSxjYSksXCJ+PVwiPT09YVsyXSYmKGFbM109XCIgXCIrYVszXStcIiBcIiksYS5zbGljZSgwLDQpfSxDSElMRDpmdW5jdGlvbihhKXtyZXR1cm4gYVsxXT1hWzFdLnRvTG93ZXJDYXNlKCksXCJudGhcIj09PWFbMV0uc2xpY2UoMCwzKT8oYVszXXx8ZmEuZXJyb3IoYVswXSksYVs0XT0rKGFbNF0/YVs1XSsoYVs2XXx8MSk6MiooXCJldmVuXCI9PT1hWzNdfHxcIm9kZFwiPT09YVszXSkpLGFbNV09KyhhWzddK2FbOF18fFwib2RkXCI9PT1hWzNdKSk6YVszXSYmZmEuZXJyb3IoYVswXSksYX0sUFNFVURPOmZ1bmN0aW9uKGEpe3ZhciBiLGM9IWFbNl0mJmFbMl07cmV0dXJuIFcuQ0hJTEQudGVzdChhWzBdKT9udWxsOihhWzNdP2FbMl09YVs0XXx8YVs1XXx8XCJcIjpjJiZVLnRlc3QoYykmJihiPWcoYywhMCkpJiYoYj1jLmluZGV4T2YoXCIpXCIsYy5sZW5ndGgtYiktYy5sZW5ndGgpJiYoYVswXT1hWzBdLnNsaWNlKDAsYiksYVsyXT1jLnNsaWNlKDAsYikpLGEuc2xpY2UoMCwzKSl9fSxmaWx0ZXI6e1RBRzpmdW5jdGlvbihhKXt2YXIgYj1hLnJlcGxhY2UoYmEsY2EpLnRvTG93ZXJDYXNlKCk7cmV0dXJuXCIqXCI9PT1hP2Z1bmN0aW9uKCl7cmV0dXJuITB9OmZ1bmN0aW9uKGEpe3JldHVybiBhLm5vZGVOYW1lJiZhLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk9PT1ifX0sQ0xBU1M6ZnVuY3Rpb24oYSl7dmFyIGI9eVthK1wiIFwiXTtyZXR1cm4gYnx8KGI9bmV3IFJlZ0V4cChcIihefFwiK0wrXCIpXCIrYStcIihcIitMK1wifCQpXCIpKSYmeShhLGZ1bmN0aW9uKGEpe3JldHVybiBiLnRlc3QoXCJzdHJpbmdcIj09dHlwZW9mIGEuY2xhc3NOYW1lJiZhLmNsYXNzTmFtZXx8XCJ1bmRlZmluZWRcIiE9dHlwZW9mIGEuZ2V0QXR0cmlidXRlJiZhLmdldEF0dHJpYnV0ZShcImNsYXNzXCIpfHxcIlwiKX0pfSxBVFRSOmZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gZnVuY3Rpb24oZCl7dmFyIGU9ZmEuYXR0cihkLGEpO3JldHVybiBudWxsPT1lP1wiIT1cIj09PWI6Yj8oZSs9XCJcIixcIj1cIj09PWI/ZT09PWM6XCIhPVwiPT09Yj9lIT09YzpcIl49XCI9PT1iP2MmJjA9PT1lLmluZGV4T2YoYyk6XCIqPVwiPT09Yj9jJiZlLmluZGV4T2YoYyk+LTE6XCIkPVwiPT09Yj9jJiZlLnNsaWNlKC1jLmxlbmd0aCk9PT1jOlwifj1cIj09PWI/KFwiIFwiK2UucmVwbGFjZShQLFwiIFwiKStcIiBcIikuaW5kZXhPZihjKT4tMTpcInw9XCI9PT1iP2U9PT1jfHxlLnNsaWNlKDAsYy5sZW5ndGgrMSk9PT1jK1wiLVwiOiExKTohMH19LENISUxEOmZ1bmN0aW9uKGEsYixjLGQsZSl7dmFyIGY9XCJudGhcIiE9PWEuc2xpY2UoMCwzKSxnPVwibGFzdFwiIT09YS5zbGljZSgtNCksaD1cIm9mLXR5cGVcIj09PWI7cmV0dXJuIDE9PT1kJiYwPT09ZT9mdW5jdGlvbihhKXtyZXR1cm4hIWEucGFyZW50Tm9kZX06ZnVuY3Rpb24oYixjLGkpe3ZhciBqLGssbCxtLG4sbyxwPWYhPT1nP1wibmV4dFNpYmxpbmdcIjpcInByZXZpb3VzU2libGluZ1wiLHE9Yi5wYXJlbnROb2RlLHI9aCYmYi5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpLHM9IWkmJiFoLHQ9ITE7aWYocSl7aWYoZil7d2hpbGUocCl7bT1iO3doaWxlKG09bVtwXSlpZihoP20ubm9kZU5hbWUudG9Mb3dlckNhc2UoKT09PXI6MT09PW0ubm9kZVR5cGUpcmV0dXJuITE7bz1wPVwib25seVwiPT09YSYmIW8mJlwibmV4dFNpYmxpbmdcIn1yZXR1cm4hMH1pZihvPVtnP3EuZmlyc3RDaGlsZDpxLmxhc3RDaGlsZF0sZyYmcyl7bT1xLGw9bVt1XXx8KG1bdV09e30pLGs9bFttLnVuaXF1ZUlEXXx8KGxbbS51bmlxdWVJRF09e30pLGo9a1thXXx8W10sbj1qWzBdPT09dyYmalsxXSx0PW4mJmpbMl0sbT1uJiZxLmNoaWxkTm9kZXNbbl07d2hpbGUobT0rK24mJm0mJm1bcF18fCh0PW49MCl8fG8ucG9wKCkpaWYoMT09PW0ubm9kZVR5cGUmJisrdCYmbT09PWIpe2tbYV09W3csbix0XTticmVha319ZWxzZSBpZihzJiYobT1iLGw9bVt1XXx8KG1bdV09e30pLGs9bFttLnVuaXF1ZUlEXXx8KGxbbS51bmlxdWVJRF09e30pLGo9a1thXXx8W10sbj1qWzBdPT09dyYmalsxXSx0PW4pLHQ9PT0hMSl3aGlsZShtPSsrbiYmbSYmbVtwXXx8KHQ9bj0wKXx8by5wb3AoKSlpZigoaD9tLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk9PT1yOjE9PT1tLm5vZGVUeXBlKSYmKyt0JiYocyYmKGw9bVt1XXx8KG1bdV09e30pLGs9bFttLnVuaXF1ZUlEXXx8KGxbbS51bmlxdWVJRF09e30pLGtbYV09W3csdF0pLG09PT1iKSlicmVhaztyZXR1cm4gdC09ZSx0PT09ZHx8dCVkPT09MCYmdC9kPj0wfX19LFBTRVVETzpmdW5jdGlvbihhLGIpe3ZhciBjLGU9ZC5wc2V1ZG9zW2FdfHxkLnNldEZpbHRlcnNbYS50b0xvd2VyQ2FzZSgpXXx8ZmEuZXJyb3IoXCJ1bnN1cHBvcnRlZCBwc2V1ZG86IFwiK2EpO3JldHVybiBlW3VdP2UoYik6ZS5sZW5ndGg+MT8oYz1bYSxhLFwiXCIsYl0sZC5zZXRGaWx0ZXJzLmhhc093blByb3BlcnR5KGEudG9Mb3dlckNhc2UoKSk/aGEoZnVuY3Rpb24oYSxjKXt2YXIgZCxmPWUoYSxiKSxnPWYubGVuZ3RoO3doaWxlKGctLSlkPUooYSxmW2ddKSxhW2RdPSEoY1tkXT1mW2ddKX0pOmZ1bmN0aW9uKGEpe3JldHVybiBlKGEsMCxjKX0pOmV9fSxwc2V1ZG9zOntub3Q6aGEoZnVuY3Rpb24oYSl7dmFyIGI9W10sYz1bXSxkPWgoYS5yZXBsYWNlKFEsXCIkMVwiKSk7cmV0dXJuIGRbdV0/aGEoZnVuY3Rpb24oYSxiLGMsZSl7dmFyIGYsZz1kKGEsbnVsbCxlLFtdKSxoPWEubGVuZ3RoO3doaWxlKGgtLSkoZj1nW2hdKSYmKGFbaF09IShiW2hdPWYpKX0pOmZ1bmN0aW9uKGEsZSxmKXtyZXR1cm4gYlswXT1hLGQoYixudWxsLGYsYyksYlswXT1udWxsLCFjLnBvcCgpfX0pLGhhczpoYShmdW5jdGlvbihhKXtyZXR1cm4gZnVuY3Rpb24oYil7cmV0dXJuIGZhKGEsYikubGVuZ3RoPjB9fSksY29udGFpbnM6aGEoZnVuY3Rpb24oYSl7cmV0dXJuIGE9YS5yZXBsYWNlKGJhLGNhKSxmdW5jdGlvbihiKXtyZXR1cm4oYi50ZXh0Q29udGVudHx8Yi5pbm5lclRleHR8fGUoYikpLmluZGV4T2YoYSk+LTF9fSksbGFuZzpoYShmdW5jdGlvbihhKXtyZXR1cm4gVi50ZXN0KGF8fFwiXCIpfHxmYS5lcnJvcihcInVuc3VwcG9ydGVkIGxhbmc6IFwiK2EpLGE9YS5yZXBsYWNlKGJhLGNhKS50b0xvd2VyQ2FzZSgpLGZ1bmN0aW9uKGIpe3ZhciBjO2RvIGlmKGM9cD9iLmxhbmc6Yi5nZXRBdHRyaWJ1dGUoXCJ4bWw6bGFuZ1wiKXx8Yi5nZXRBdHRyaWJ1dGUoXCJsYW5nXCIpKXJldHVybiBjPWMudG9Mb3dlckNhc2UoKSxjPT09YXx8MD09PWMuaW5kZXhPZihhK1wiLVwiKTt3aGlsZSgoYj1iLnBhcmVudE5vZGUpJiYxPT09Yi5ub2RlVHlwZSk7cmV0dXJuITF9fSksdGFyZ2V0OmZ1bmN0aW9uKGIpe3ZhciBjPWEubG9jYXRpb24mJmEubG9jYXRpb24uaGFzaDtyZXR1cm4gYyYmYy5zbGljZSgxKT09PWIuaWR9LHJvb3Q6ZnVuY3Rpb24oYSl7cmV0dXJuIGE9PT1vfSxmb2N1czpmdW5jdGlvbihhKXtyZXR1cm4gYT09PW4uYWN0aXZlRWxlbWVudCYmKCFuLmhhc0ZvY3VzfHxuLmhhc0ZvY3VzKCkpJiYhIShhLnR5cGV8fGEuaHJlZnx8fmEudGFiSW5kZXgpfSxlbmFibGVkOmZ1bmN0aW9uKGEpe3JldHVybiBhLmRpc2FibGVkPT09ITF9LGRpc2FibGVkOmZ1bmN0aW9uKGEpe3JldHVybiBhLmRpc2FibGVkPT09ITB9LGNoZWNrZWQ6ZnVuY3Rpb24oYSl7dmFyIGI9YS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpO3JldHVyblwiaW5wdXRcIj09PWImJiEhYS5jaGVja2VkfHxcIm9wdGlvblwiPT09YiYmISFhLnNlbGVjdGVkfSxzZWxlY3RlZDpmdW5jdGlvbihhKXtyZXR1cm4gYS5wYXJlbnROb2RlJiZhLnBhcmVudE5vZGUuc2VsZWN0ZWRJbmRleCxhLnNlbGVjdGVkPT09ITB9LGVtcHR5OmZ1bmN0aW9uKGEpe2ZvcihhPWEuZmlyc3RDaGlsZDthO2E9YS5uZXh0U2libGluZylpZihhLm5vZGVUeXBlPDYpcmV0dXJuITE7cmV0dXJuITB9LHBhcmVudDpmdW5jdGlvbihhKXtyZXR1cm4hZC5wc2V1ZG9zLmVtcHR5KGEpfSxoZWFkZXI6ZnVuY3Rpb24oYSl7cmV0dXJuIFkudGVzdChhLm5vZGVOYW1lKX0saW5wdXQ6ZnVuY3Rpb24oYSl7cmV0dXJuIFgudGVzdChhLm5vZGVOYW1lKX0sYnV0dG9uOmZ1bmN0aW9uKGEpe3ZhciBiPWEubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtyZXR1cm5cImlucHV0XCI9PT1iJiZcImJ1dHRvblwiPT09YS50eXBlfHxcImJ1dHRvblwiPT09Yn0sdGV4dDpmdW5jdGlvbihhKXt2YXIgYjtyZXR1cm5cImlucHV0XCI9PT1hLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCkmJlwidGV4dFwiPT09YS50eXBlJiYobnVsbD09KGI9YS5nZXRBdHRyaWJ1dGUoXCJ0eXBlXCIpKXx8XCJ0ZXh0XCI9PT1iLnRvTG93ZXJDYXNlKCkpfSxmaXJzdDpuYShmdW5jdGlvbigpe3JldHVyblswXX0pLGxhc3Q6bmEoZnVuY3Rpb24oYSxiKXtyZXR1cm5bYi0xXX0pLGVxOm5hKGZ1bmN0aW9uKGEsYixjKXtyZXR1cm5bMD5jP2MrYjpjXX0pLGV2ZW46bmEoZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9MDtiPmM7Yys9MilhLnB1c2goYyk7cmV0dXJuIGF9KSxvZGQ6bmEoZnVuY3Rpb24oYSxiKXtmb3IodmFyIGM9MTtiPmM7Yys9MilhLnB1c2goYyk7cmV0dXJuIGF9KSxsdDpuYShmdW5jdGlvbihhLGIsYyl7Zm9yKHZhciBkPTA+Yz9jK2I6YzstLWQ+PTA7KWEucHVzaChkKTtyZXR1cm4gYX0pLGd0Om5hKGZ1bmN0aW9uKGEsYixjKXtmb3IodmFyIGQ9MD5jP2MrYjpjOysrZDxiOylhLnB1c2goZCk7cmV0dXJuIGF9KX19LGQucHNldWRvcy5udGg9ZC5wc2V1ZG9zLmVxO2ZvcihiIGlue3JhZGlvOiEwLGNoZWNrYm94OiEwLGZpbGU6ITAscGFzc3dvcmQ6ITAsaW1hZ2U6ITB9KWQucHNldWRvc1tiXT1sYShiKTtmb3IoYiBpbntzdWJtaXQ6ITAscmVzZXQ6ITB9KWQucHNldWRvc1tiXT1tYShiKTtmdW5jdGlvbiBwYSgpe31wYS5wcm90b3R5cGU9ZC5maWx0ZXJzPWQucHNldWRvcyxkLnNldEZpbHRlcnM9bmV3IHBhLGc9ZmEudG9rZW5pemU9ZnVuY3Rpb24oYSxiKXt2YXIgYyxlLGYsZyxoLGksaixrPXpbYStcIiBcIl07aWYoaylyZXR1cm4gYj8wOmsuc2xpY2UoMCk7aD1hLGk9W10saj1kLnByZUZpbHRlcjt3aGlsZShoKXtjJiYhKGU9Ui5leGVjKGgpKXx8KGUmJihoPWguc2xpY2UoZVswXS5sZW5ndGgpfHxoKSxpLnB1c2goZj1bXSkpLGM9ITEsKGU9Uy5leGVjKGgpKSYmKGM9ZS5zaGlmdCgpLGYucHVzaCh7dmFsdWU6Yyx0eXBlOmVbMF0ucmVwbGFjZShRLFwiIFwiKX0pLGg9aC5zbGljZShjLmxlbmd0aCkpO2ZvcihnIGluIGQuZmlsdGVyKSEoZT1XW2ddLmV4ZWMoaCkpfHxqW2ddJiYhKGU9altnXShlKSl8fChjPWUuc2hpZnQoKSxmLnB1c2goe3ZhbHVlOmMsdHlwZTpnLG1hdGNoZXM6ZX0pLGg9aC5zbGljZShjLmxlbmd0aCkpO2lmKCFjKWJyZWFrfXJldHVybiBiP2gubGVuZ3RoOmg/ZmEuZXJyb3IoYSk6eihhLGkpLnNsaWNlKDApfTtmdW5jdGlvbiBxYShhKXtmb3IodmFyIGI9MCxjPWEubGVuZ3RoLGQ9XCJcIjtjPmI7YisrKWQrPWFbYl0udmFsdWU7cmV0dXJuIGR9ZnVuY3Rpb24gcmEoYSxiLGMpe3ZhciBkPWIuZGlyLGU9YyYmXCJwYXJlbnROb2RlXCI9PT1kLGY9eCsrO3JldHVybiBiLmZpcnN0P2Z1bmN0aW9uKGIsYyxmKXt3aGlsZShiPWJbZF0paWYoMT09PWIubm9kZVR5cGV8fGUpcmV0dXJuIGEoYixjLGYpfTpmdW5jdGlvbihiLGMsZyl7dmFyIGgsaSxqLGs9W3csZl07aWYoZyl7d2hpbGUoYj1iW2RdKWlmKCgxPT09Yi5ub2RlVHlwZXx8ZSkmJmEoYixjLGcpKXJldHVybiEwfWVsc2Ugd2hpbGUoYj1iW2RdKWlmKDE9PT1iLm5vZGVUeXBlfHxlKXtpZihqPWJbdV18fChiW3VdPXt9KSxpPWpbYi51bmlxdWVJRF18fChqW2IudW5pcXVlSURdPXt9KSwoaD1pW2RdKSYmaFswXT09PXcmJmhbMV09PT1mKXJldHVybiBrWzJdPWhbMl07aWYoaVtkXT1rLGtbMl09YShiLGMsZykpcmV0dXJuITB9fX1mdW5jdGlvbiBzYShhKXtyZXR1cm4gYS5sZW5ndGg+MT9mdW5jdGlvbihiLGMsZCl7dmFyIGU9YS5sZW5ndGg7d2hpbGUoZS0tKWlmKCFhW2VdKGIsYyxkKSlyZXR1cm4hMTtyZXR1cm4hMH06YVswXX1mdW5jdGlvbiB0YShhLGIsYyl7Zm9yKHZhciBkPTAsZT1iLmxlbmd0aDtlPmQ7ZCsrKWZhKGEsYltkXSxjKTtyZXR1cm4gY31mdW5jdGlvbiB1YShhLGIsYyxkLGUpe2Zvcih2YXIgZixnPVtdLGg9MCxpPWEubGVuZ3RoLGo9bnVsbCE9YjtpPmg7aCsrKShmPWFbaF0pJiYoYyYmIWMoZixkLGUpfHwoZy5wdXNoKGYpLGomJmIucHVzaChoKSkpO3JldHVybiBnfWZ1bmN0aW9uIHZhKGEsYixjLGQsZSxmKXtyZXR1cm4gZCYmIWRbdV0mJihkPXZhKGQpKSxlJiYhZVt1XSYmKGU9dmEoZSxmKSksaGEoZnVuY3Rpb24oZixnLGgsaSl7dmFyIGosayxsLG09W10sbj1bXSxvPWcubGVuZ3RoLHA9Znx8dGEoYnx8XCIqXCIsaC5ub2RlVHlwZT9baF06aCxbXSkscT0hYXx8IWYmJmI/cDp1YShwLG0sYSxoLGkpLHI9Yz9lfHwoZj9hOm98fGQpP1tdOmc6cTtpZihjJiZjKHEscixoLGkpLGQpe2o9dWEocixuKSxkKGosW10saCxpKSxrPWoubGVuZ3RoO3doaWxlKGstLSkobD1qW2tdKSYmKHJbbltrXV09IShxW25ba11dPWwpKX1pZihmKXtpZihlfHxhKXtpZihlKXtqPVtdLGs9ci5sZW5ndGg7d2hpbGUoay0tKShsPXJba10pJiZqLnB1c2gocVtrXT1sKTtlKG51bGwscj1bXSxqLGkpfWs9ci5sZW5ndGg7d2hpbGUoay0tKShsPXJba10pJiYoaj1lP0ooZixsKTptW2tdKT4tMSYmKGZbal09IShnW2pdPWwpKX19ZWxzZSByPXVhKHI9PT1nP3Iuc3BsaWNlKG8sci5sZW5ndGgpOnIpLGU/ZShudWxsLGcscixpKTpILmFwcGx5KGcscil9KX1mdW5jdGlvbiB3YShhKXtmb3IodmFyIGIsYyxlLGY9YS5sZW5ndGgsZz1kLnJlbGF0aXZlW2FbMF0udHlwZV0saD1nfHxkLnJlbGF0aXZlW1wiIFwiXSxpPWc/MTowLGs9cmEoZnVuY3Rpb24oYSl7cmV0dXJuIGE9PT1ifSxoLCEwKSxsPXJhKGZ1bmN0aW9uKGEpe3JldHVybiBKKGIsYSk+LTF9LGgsITApLG09W2Z1bmN0aW9uKGEsYyxkKXt2YXIgZT0hZyYmKGR8fGMhPT1qKXx8KChiPWMpLm5vZGVUeXBlP2soYSxjLGQpOmwoYSxjLGQpKTtyZXR1cm4gYj1udWxsLGV9XTtmPmk7aSsrKWlmKGM9ZC5yZWxhdGl2ZVthW2ldLnR5cGVdKW09W3JhKHNhKG0pLGMpXTtlbHNle2lmKGM9ZC5maWx0ZXJbYVtpXS50eXBlXS5hcHBseShudWxsLGFbaV0ubWF0Y2hlcyksY1t1XSl7Zm9yKGU9KytpO2Y+ZTtlKyspaWYoZC5yZWxhdGl2ZVthW2VdLnR5cGVdKWJyZWFrO3JldHVybiB2YShpPjEmJnNhKG0pLGk+MSYmcWEoYS5zbGljZSgwLGktMSkuY29uY2F0KHt2YWx1ZTpcIiBcIj09PWFbaS0yXS50eXBlP1wiKlwiOlwiXCJ9KSkucmVwbGFjZShRLFwiJDFcIiksYyxlPmkmJndhKGEuc2xpY2UoaSxlKSksZj5lJiZ3YShhPWEuc2xpY2UoZSkpLGY+ZSYmcWEoYSkpfW0ucHVzaChjKX1yZXR1cm4gc2EobSl9ZnVuY3Rpb24geGEoYSxiKXt2YXIgYz1iLmxlbmd0aD4wLGU9YS5sZW5ndGg+MCxmPWZ1bmN0aW9uKGYsZyxoLGksayl7dmFyIGwsbyxxLHI9MCxzPVwiMFwiLHQ9ZiYmW10sdT1bXSx2PWoseD1mfHxlJiZkLmZpbmQuVEFHKFwiKlwiLGspLHk9dys9bnVsbD09dj8xOk1hdGgucmFuZG9tKCl8fC4xLHo9eC5sZW5ndGg7Zm9yKGsmJihqPWc9PT1ufHxnfHxrKTtzIT09eiYmbnVsbCE9KGw9eFtzXSk7cysrKXtpZihlJiZsKXtvPTAsZ3x8bC5vd25lckRvY3VtZW50PT09bnx8KG0obCksaD0hcCk7d2hpbGUocT1hW28rK10paWYocShsLGd8fG4saCkpe2kucHVzaChsKTticmVha31rJiYodz15KX1jJiYoKGw9IXEmJmwpJiZyLS0sZiYmdC5wdXNoKGwpKX1pZihyKz1zLGMmJnMhPT1yKXtvPTA7d2hpbGUocT1iW28rK10pcSh0LHUsZyxoKTtpZihmKXtpZihyPjApd2hpbGUocy0tKXRbc118fHVbc118fCh1W3NdPUYuY2FsbChpKSk7dT11YSh1KX1ILmFwcGx5KGksdSksayYmIWYmJnUubGVuZ3RoPjAmJnIrYi5sZW5ndGg+MSYmZmEudW5pcXVlU29ydChpKX1yZXR1cm4gayYmKHc9eSxqPXYpLHR9O3JldHVybiBjP2hhKGYpOmZ9cmV0dXJuIGg9ZmEuY29tcGlsZT1mdW5jdGlvbihhLGIpe3ZhciBjLGQ9W10sZT1bXSxmPUFbYStcIiBcIl07aWYoIWYpe2J8fChiPWcoYSkpLGM9Yi5sZW5ndGg7d2hpbGUoYy0tKWY9d2EoYltjXSksZlt1XT9kLnB1c2goZik6ZS5wdXNoKGYpO2Y9QShhLHhhKGUsZCkpLGYuc2VsZWN0b3I9YX1yZXR1cm4gZn0saT1mYS5zZWxlY3Q9ZnVuY3Rpb24oYSxiLGUsZil7dmFyIGksaixrLGwsbSxuPVwiZnVuY3Rpb25cIj09dHlwZW9mIGEmJmEsbz0hZiYmZyhhPW4uc2VsZWN0b3J8fGEpO2lmKGU9ZXx8W10sMT09PW8ubGVuZ3RoKXtpZihqPW9bMF09b1swXS5zbGljZSgwKSxqLmxlbmd0aD4yJiZcIklEXCI9PT0oaz1qWzBdKS50eXBlJiZjLmdldEJ5SWQmJjk9PT1iLm5vZGVUeXBlJiZwJiZkLnJlbGF0aXZlW2pbMV0udHlwZV0pe2lmKGI9KGQuZmluZC5JRChrLm1hdGNoZXNbMF0ucmVwbGFjZShiYSxjYSksYil8fFtdKVswXSwhYilyZXR1cm4gZTtuJiYoYj1iLnBhcmVudE5vZGUpLGE9YS5zbGljZShqLnNoaWZ0KCkudmFsdWUubGVuZ3RoKX1pPVcubmVlZHNDb250ZXh0LnRlc3QoYSk/MDpqLmxlbmd0aDt3aGlsZShpLS0pe2lmKGs9altpXSxkLnJlbGF0aXZlW2w9ay50eXBlXSlicmVhaztpZigobT1kLmZpbmRbbF0pJiYoZj1tKGsubWF0Y2hlc1swXS5yZXBsYWNlKGJhLGNhKSxfLnRlc3QoalswXS50eXBlKSYmb2EoYi5wYXJlbnROb2RlKXx8YikpKXtpZihqLnNwbGljZShpLDEpLGE9Zi5sZW5ndGgmJnFhKGopLCFhKXJldHVybiBILmFwcGx5KGUsZiksZTticmVha319fXJldHVybihufHxoKGEsbykpKGYsYiwhcCxlLCFifHxfLnRlc3QoYSkmJm9hKGIucGFyZW50Tm9kZSl8fGIpLGV9LGMuc29ydFN0YWJsZT11LnNwbGl0KFwiXCIpLnNvcnQoQikuam9pbihcIlwiKT09PXUsYy5kZXRlY3REdXBsaWNhdGVzPSEhbCxtKCksYy5zb3J0RGV0YWNoZWQ9aWEoZnVuY3Rpb24oYSl7cmV0dXJuIDEmYS5jb21wYXJlRG9jdW1lbnRQb3NpdGlvbihuLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikpfSksaWEoZnVuY3Rpb24oYSl7cmV0dXJuIGEuaW5uZXJIVE1MPVwiPGEgaHJlZj0nIyc+PC9hPlwiLFwiI1wiPT09YS5maXJzdENoaWxkLmdldEF0dHJpYnV0ZShcImhyZWZcIil9KXx8amEoXCJ0eXBlfGhyZWZ8aGVpZ2h0fHdpZHRoXCIsZnVuY3Rpb24oYSxiLGMpe3JldHVybiBjP3ZvaWQgMDphLmdldEF0dHJpYnV0ZShiLFwidHlwZVwiPT09Yi50b0xvd2VyQ2FzZSgpPzE6Mil9KSxjLmF0dHJpYnV0ZXMmJmlhKGZ1bmN0aW9uKGEpe3JldHVybiBhLmlubmVySFRNTD1cIjxpbnB1dC8+XCIsYS5maXJzdENoaWxkLnNldEF0dHJpYnV0ZShcInZhbHVlXCIsXCJcIiksXCJcIj09PWEuZmlyc3RDaGlsZC5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKX0pfHxqYShcInZhbHVlXCIsZnVuY3Rpb24oYSxiLGMpe3JldHVybiBjfHxcImlucHV0XCIhPT1hLm5vZGVOYW1lLnRvTG93ZXJDYXNlKCk/dm9pZCAwOmEuZGVmYXVsdFZhbHVlfSksaWEoZnVuY3Rpb24oYSl7cmV0dXJuIG51bGw9PWEuZ2V0QXR0cmlidXRlKFwiZGlzYWJsZWRcIil9KXx8amEoSyxmdW5jdGlvbihhLGIsYyl7dmFyIGQ7cmV0dXJuIGM/dm9pZCAwOmFbYl09PT0hMD9iLnRvTG93ZXJDYXNlKCk6KGQ9YS5nZXRBdHRyaWJ1dGVOb2RlKGIpKSYmZC5zcGVjaWZpZWQ/ZC52YWx1ZTpudWxsfSksZmF9KGEpO24uZmluZD10LG4uZXhwcj10LnNlbGVjdG9ycyxuLmV4cHJbXCI6XCJdPW4uZXhwci5wc2V1ZG9zLG4udW5pcXVlU29ydD1uLnVuaXF1ZT10LnVuaXF1ZVNvcnQsbi50ZXh0PXQuZ2V0VGV4dCxuLmlzWE1MRG9jPXQuaXNYTUwsbi5jb250YWlucz10LmNvbnRhaW5zO3ZhciB1PWZ1bmN0aW9uKGEsYixjKXt2YXIgZD1bXSxlPXZvaWQgMCE9PWM7d2hpbGUoKGE9YVtiXSkmJjkhPT1hLm5vZGVUeXBlKWlmKDE9PT1hLm5vZGVUeXBlKXtpZihlJiZuKGEpLmlzKGMpKWJyZWFrO2QucHVzaChhKX1yZXR1cm4gZH0sdj1mdW5jdGlvbihhLGIpe2Zvcih2YXIgYz1bXTthO2E9YS5uZXh0U2libGluZykxPT09YS5ub2RlVHlwZSYmYSE9PWImJmMucHVzaChhKTtyZXR1cm4gY30sdz1uLmV4cHIubWF0Y2gubmVlZHNDb250ZXh0LHg9L148KFtcXHctXSspXFxzKlxcLz8+KD86PFxcL1xcMT58KSQvLHk9L14uW146I1xcW1xcLixdKiQvO2Z1bmN0aW9uIHooYSxiLGMpe2lmKG4uaXNGdW5jdGlvbihiKSlyZXR1cm4gbi5ncmVwKGEsZnVuY3Rpb24oYSxkKXtyZXR1cm4hIWIuY2FsbChhLGQsYSkhPT1jfSk7aWYoYi5ub2RlVHlwZSlyZXR1cm4gbi5ncmVwKGEsZnVuY3Rpb24oYSl7cmV0dXJuIGE9PT1iIT09Y30pO2lmKFwic3RyaW5nXCI9PXR5cGVvZiBiKXtpZih5LnRlc3QoYikpcmV0dXJuIG4uZmlsdGVyKGIsYSxjKTtiPW4uZmlsdGVyKGIsYSl9cmV0dXJuIG4uZ3JlcChhLGZ1bmN0aW9uKGEpe3JldHVybiBoLmNhbGwoYixhKT4tMSE9PWN9KX1uLmZpbHRlcj1mdW5jdGlvbihhLGIsYyl7dmFyIGQ9YlswXTtyZXR1cm4gYyYmKGE9XCI6bm90KFwiK2ErXCIpXCIpLDE9PT1iLmxlbmd0aCYmMT09PWQubm9kZVR5cGU/bi5maW5kLm1hdGNoZXNTZWxlY3RvcihkLGEpP1tkXTpbXTpuLmZpbmQubWF0Y2hlcyhhLG4uZ3JlcChiLGZ1bmN0aW9uKGEpe3JldHVybiAxPT09YS5ub2RlVHlwZX0pKX0sbi5mbi5leHRlbmQoe2ZpbmQ6ZnVuY3Rpb24oYSl7dmFyIGIsYz10aGlzLmxlbmd0aCxkPVtdLGU9dGhpcztpZihcInN0cmluZ1wiIT10eXBlb2YgYSlyZXR1cm4gdGhpcy5wdXNoU3RhY2sobihhKS5maWx0ZXIoZnVuY3Rpb24oKXtmb3IoYj0wO2M+YjtiKyspaWYobi5jb250YWlucyhlW2JdLHRoaXMpKXJldHVybiEwfSkpO2ZvcihiPTA7Yz5iO2IrKyluLmZpbmQoYSxlW2JdLGQpO3JldHVybiBkPXRoaXMucHVzaFN0YWNrKGM+MT9uLnVuaXF1ZShkKTpkKSxkLnNlbGVjdG9yPXRoaXMuc2VsZWN0b3I/dGhpcy5zZWxlY3RvcitcIiBcIithOmEsZH0sZmlsdGVyOmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLnB1c2hTdGFjayh6KHRoaXMsYXx8W10sITEpKX0sbm90OmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLnB1c2hTdGFjayh6KHRoaXMsYXx8W10sITApKX0saXM6ZnVuY3Rpb24oYSl7cmV0dXJuISF6KHRoaXMsXCJzdHJpbmdcIj09dHlwZW9mIGEmJncudGVzdChhKT9uKGEpOmF8fFtdLCExKS5sZW5ndGh9fSk7dmFyIEEsQj0vXig/OlxccyooPFtcXHdcXFddKz4pW14+XSp8IyhbXFx3LV0qKSkkLyxDPW4uZm4uaW5pdD1mdW5jdGlvbihhLGIsYyl7dmFyIGUsZjtpZighYSlyZXR1cm4gdGhpcztpZihjPWN8fEEsXCJzdHJpbmdcIj09dHlwZW9mIGEpe2lmKGU9XCI8XCI9PT1hWzBdJiZcIj5cIj09PWFbYS5sZW5ndGgtMV0mJmEubGVuZ3RoPj0zP1tudWxsLGEsbnVsbF06Qi5leGVjKGEpLCFlfHwhZVsxXSYmYilyZXR1cm4hYnx8Yi5qcXVlcnk/KGJ8fGMpLmZpbmQoYSk6dGhpcy5jb25zdHJ1Y3RvcihiKS5maW5kKGEpO2lmKGVbMV0pe2lmKGI9YiBpbnN0YW5jZW9mIG4/YlswXTpiLG4ubWVyZ2UodGhpcyxuLnBhcnNlSFRNTChlWzFdLGImJmIubm9kZVR5cGU/Yi5vd25lckRvY3VtZW50fHxiOmQsITApKSx4LnRlc3QoZVsxXSkmJm4uaXNQbGFpbk9iamVjdChiKSlmb3IoZSBpbiBiKW4uaXNGdW5jdGlvbih0aGlzW2VdKT90aGlzW2VdKGJbZV0pOnRoaXMuYXR0cihlLGJbZV0pO3JldHVybiB0aGlzfXJldHVybiBmPWQuZ2V0RWxlbWVudEJ5SWQoZVsyXSksZiYmZi5wYXJlbnROb2RlJiYodGhpcy5sZW5ndGg9MSx0aGlzWzBdPWYpLHRoaXMuY29udGV4dD1kLHRoaXMuc2VsZWN0b3I9YSx0aGlzfXJldHVybiBhLm5vZGVUeXBlPyh0aGlzLmNvbnRleHQ9dGhpc1swXT1hLHRoaXMubGVuZ3RoPTEsdGhpcyk6bi5pc0Z1bmN0aW9uKGEpP3ZvaWQgMCE9PWMucmVhZHk/Yy5yZWFkeShhKTphKG4pOih2b2lkIDAhPT1hLnNlbGVjdG9yJiYodGhpcy5zZWxlY3Rvcj1hLnNlbGVjdG9yLHRoaXMuY29udGV4dD1hLmNvbnRleHQpLG4ubWFrZUFycmF5KGEsdGhpcykpfTtDLnByb3RvdHlwZT1uLmZuLEE9bihkKTt2YXIgRD0vXig/OnBhcmVudHN8cHJldig/OlVudGlsfEFsbCkpLyxFPXtjaGlsZHJlbjohMCxjb250ZW50czohMCxuZXh0OiEwLHByZXY6ITB9O24uZm4uZXh0ZW5kKHtoYXM6ZnVuY3Rpb24oYSl7dmFyIGI9bihhLHRoaXMpLGM9Yi5sZW5ndGg7cmV0dXJuIHRoaXMuZmlsdGVyKGZ1bmN0aW9uKCl7Zm9yKHZhciBhPTA7Yz5hO2ErKylpZihuLmNvbnRhaW5zKHRoaXMsYlthXSkpcmV0dXJuITB9KX0sY2xvc2VzdDpmdW5jdGlvbihhLGIpe2Zvcih2YXIgYyxkPTAsZT10aGlzLmxlbmd0aCxmPVtdLGc9dy50ZXN0KGEpfHxcInN0cmluZ1wiIT10eXBlb2YgYT9uKGEsYnx8dGhpcy5jb250ZXh0KTowO2U+ZDtkKyspZm9yKGM9dGhpc1tkXTtjJiZjIT09YjtjPWMucGFyZW50Tm9kZSlpZihjLm5vZGVUeXBlPDExJiYoZz9nLmluZGV4KGMpPi0xOjE9PT1jLm5vZGVUeXBlJiZuLmZpbmQubWF0Y2hlc1NlbGVjdG9yKGMsYSkpKXtmLnB1c2goYyk7YnJlYWt9cmV0dXJuIHRoaXMucHVzaFN0YWNrKGYubGVuZ3RoPjE/bi51bmlxdWVTb3J0KGYpOmYpfSxpbmRleDpmdW5jdGlvbihhKXtyZXR1cm4gYT9cInN0cmluZ1wiPT10eXBlb2YgYT9oLmNhbGwobihhKSx0aGlzWzBdKTpoLmNhbGwodGhpcyxhLmpxdWVyeT9hWzBdOmEpOnRoaXNbMF0mJnRoaXNbMF0ucGFyZW50Tm9kZT90aGlzLmZpcnN0KCkucHJldkFsbCgpLmxlbmd0aDotMX0sYWRkOmZ1bmN0aW9uKGEsYil7cmV0dXJuIHRoaXMucHVzaFN0YWNrKG4udW5pcXVlU29ydChuLm1lcmdlKHRoaXMuZ2V0KCksbihhLGIpKSkpfSxhZGRCYWNrOmZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLmFkZChudWxsPT1hP3RoaXMucHJldk9iamVjdDp0aGlzLnByZXZPYmplY3QuZmlsdGVyKGEpKX19KTtmdW5jdGlvbiBGKGEsYil7d2hpbGUoKGE9YVtiXSkmJjEhPT1hLm5vZGVUeXBlKTtyZXR1cm4gYX1uLmVhY2goe3BhcmVudDpmdW5jdGlvbihhKXt2YXIgYj1hLnBhcmVudE5vZGU7cmV0dXJuIGImJjExIT09Yi5ub2RlVHlwZT9iOm51bGx9LHBhcmVudHM6ZnVuY3Rpb24oYSl7cmV0dXJuIHUoYSxcInBhcmVudE5vZGVcIil9LHBhcmVudHNVbnRpbDpmdW5jdGlvbihhLGIsYyl7cmV0dXJuIHUoYSxcInBhcmVudE5vZGVcIixjKX0sbmV4dDpmdW5jdGlvbihhKXtyZXR1cm4gRihhLFwibmV4dFNpYmxpbmdcIil9LHByZXY6ZnVuY3Rpb24oYSl7cmV0dXJuIEYoYSxcInByZXZpb3VzU2libGluZ1wiKX0sbmV4dEFsbDpmdW5jdGlvbihhKXtyZXR1cm4gdShhLFwibmV4dFNpYmxpbmdcIil9LHByZXZBbGw6ZnVuY3Rpb24oYSl7cmV0dXJuIHUoYSxcInByZXZpb3VzU2libGluZ1wiKX0sbmV4dFVudGlsOmZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gdShhLFwibmV4dFNpYmxpbmdcIixjKX0scHJldlVudGlsOmZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gdShhLFwicHJldmlvdXNTaWJsaW5nXCIsYyl9LHNpYmxpbmdzOmZ1bmN0aW9uKGEpe3JldHVybiB2KChhLnBhcmVudE5vZGV8fHt9KS5maXJzdENoaWxkLGEpfSxjaGlsZHJlbjpmdW5jdGlvbihhKXtyZXR1cm4gdihhLmZpcnN0Q2hpbGQpfSxjb250ZW50czpmdW5jdGlvbihhKXtyZXR1cm4gYS5jb250ZW50RG9jdW1lbnR8fG4ubWVyZ2UoW10sYS5jaGlsZE5vZGVzKX19LGZ1bmN0aW9uKGEsYil7bi5mblthXT1mdW5jdGlvbihjLGQpe3ZhciBlPW4ubWFwKHRoaXMsYixjKTtyZXR1cm5cIlVudGlsXCIhPT1hLnNsaWNlKC01KSYmKGQ9YyksZCYmXCJzdHJpbmdcIj09dHlwZW9mIGQmJihlPW4uZmlsdGVyKGQsZSkpLHRoaXMubGVuZ3RoPjEmJihFW2FdfHxuLnVuaXF1ZVNvcnQoZSksRC50ZXN0KGEpJiZlLnJldmVyc2UoKSksdGhpcy5wdXNoU3RhY2soZSl9fSk7dmFyIEc9L1xcUysvZztmdW5jdGlvbiBIKGEpe3ZhciBiPXt9O3JldHVybiBuLmVhY2goYS5tYXRjaChHKXx8W10sZnVuY3Rpb24oYSxjKXtiW2NdPSEwfSksYn1uLkNhbGxiYWNrcz1mdW5jdGlvbihhKXthPVwic3RyaW5nXCI9PXR5cGVvZiBhP0goYSk6bi5leHRlbmQoe30sYSk7dmFyIGIsYyxkLGUsZj1bXSxnPVtdLGg9LTEsaT1mdW5jdGlvbigpe2ZvcihlPWEub25jZSxkPWI9ITA7Zy5sZW5ndGg7aD0tMSl7Yz1nLnNoaWZ0KCk7d2hpbGUoKytoPGYubGVuZ3RoKWZbaF0uYXBwbHkoY1swXSxjWzFdKT09PSExJiZhLnN0b3BPbkZhbHNlJiYoaD1mLmxlbmd0aCxjPSExKX1hLm1lbW9yeXx8KGM9ITEpLGI9ITEsZSYmKGY9Yz9bXTpcIlwiKX0saj17YWRkOmZ1bmN0aW9uKCl7cmV0dXJuIGYmJihjJiYhYiYmKGg9Zi5sZW5ndGgtMSxnLnB1c2goYykpLGZ1bmN0aW9uIGQoYil7bi5lYWNoKGIsZnVuY3Rpb24oYixjKXtuLmlzRnVuY3Rpb24oYyk/YS51bmlxdWUmJmouaGFzKGMpfHxmLnB1c2goYyk6YyYmYy5sZW5ndGgmJlwic3RyaW5nXCIhPT1uLnR5cGUoYykmJmQoYyl9KX0oYXJndW1lbnRzKSxjJiYhYiYmaSgpKSx0aGlzfSxyZW1vdmU6ZnVuY3Rpb24oKXtyZXR1cm4gbi5lYWNoKGFyZ3VtZW50cyxmdW5jdGlvbihhLGIpe3ZhciBjO3doaWxlKChjPW4uaW5BcnJheShiLGYsYykpPi0xKWYuc3BsaWNlKGMsMSksaD49YyYmaC0tfSksdGhpc30saGFzOmZ1bmN0aW9uKGEpe3JldHVybiBhP24uaW5BcnJheShhLGYpPi0xOmYubGVuZ3RoPjB9LGVtcHR5OmZ1bmN0aW9uKCl7cmV0dXJuIGYmJihmPVtdKSx0aGlzfSxkaXNhYmxlOmZ1bmN0aW9uKCl7cmV0dXJuIGU9Zz1bXSxmPWM9XCJcIix0aGlzfSxkaXNhYmxlZDpmdW5jdGlvbigpe3JldHVybiFmfSxsb2NrOmZ1bmN0aW9uKCl7cmV0dXJuIGU9Zz1bXSxjfHwoZj1jPVwiXCIpLHRoaXN9LGxvY2tlZDpmdW5jdGlvbigpe3JldHVybiEhZX0sZmlyZVdpdGg6ZnVuY3Rpb24oYSxjKXtyZXR1cm4gZXx8KGM9Y3x8W10sYz1bYSxjLnNsaWNlP2Muc2xpY2UoKTpjXSxnLnB1c2goYyksYnx8aSgpKSx0aGlzfSxmaXJlOmZ1bmN0aW9uKCl7cmV0dXJuIGouZmlyZVdpdGgodGhpcyxhcmd1bWVudHMpLHRoaXN9LGZpcmVkOmZ1bmN0aW9uKCl7cmV0dXJuISFkfX07cmV0dXJuIGp9LG4uZXh0ZW5kKHtEZWZlcnJlZDpmdW5jdGlvbihhKXt2YXIgYj1bW1wicmVzb2x2ZVwiLFwiZG9uZVwiLG4uQ2FsbGJhY2tzKFwib25jZSBtZW1vcnlcIiksXCJyZXNvbHZlZFwiXSxbXCJyZWplY3RcIixcImZhaWxcIixuLkNhbGxiYWNrcyhcIm9uY2UgbWVtb3J5XCIpLFwicmVqZWN0ZWRcIl0sW1wibm90aWZ5XCIsXCJwcm9ncmVzc1wiLG4uQ2FsbGJhY2tzKFwibWVtb3J5XCIpXV0sYz1cInBlbmRpbmdcIixkPXtzdGF0ZTpmdW5jdGlvbigpe3JldHVybiBjfSxhbHdheXM6ZnVuY3Rpb24oKXtyZXR1cm4gZS5kb25lKGFyZ3VtZW50cykuZmFpbChhcmd1bWVudHMpLHRoaXN9LHRoZW46ZnVuY3Rpb24oKXt2YXIgYT1hcmd1bWVudHM7cmV0dXJuIG4uRGVmZXJyZWQoZnVuY3Rpb24oYyl7bi5lYWNoKGIsZnVuY3Rpb24oYixmKXt2YXIgZz1uLmlzRnVuY3Rpb24oYVtiXSkmJmFbYl07ZVtmWzFdXShmdW5jdGlvbigpe3ZhciBhPWcmJmcuYXBwbHkodGhpcyxhcmd1bWVudHMpO2EmJm4uaXNGdW5jdGlvbihhLnByb21pc2UpP2EucHJvbWlzZSgpLnByb2dyZXNzKGMubm90aWZ5KS5kb25lKGMucmVzb2x2ZSkuZmFpbChjLnJlamVjdCk6Y1tmWzBdK1wiV2l0aFwiXSh0aGlzPT09ZD9jLnByb21pc2UoKTp0aGlzLGc/W2FdOmFyZ3VtZW50cyl9KX0pLGE9bnVsbH0pLnByb21pc2UoKX0scHJvbWlzZTpmdW5jdGlvbihhKXtyZXR1cm4gbnVsbCE9YT9uLmV4dGVuZChhLGQpOmR9fSxlPXt9O3JldHVybiBkLnBpcGU9ZC50aGVuLG4uZWFjaChiLGZ1bmN0aW9uKGEsZil7dmFyIGc9ZlsyXSxoPWZbM107ZFtmWzFdXT1nLmFkZCxoJiZnLmFkZChmdW5jdGlvbigpe2M9aH0sYlsxXmFdWzJdLmRpc2FibGUsYlsyXVsyXS5sb2NrKSxlW2ZbMF1dPWZ1bmN0aW9uKCl7cmV0dXJuIGVbZlswXStcIldpdGhcIl0odGhpcz09PWU/ZDp0aGlzLGFyZ3VtZW50cyksdGhpc30sZVtmWzBdK1wiV2l0aFwiXT1nLmZpcmVXaXRofSksZC5wcm9taXNlKGUpLGEmJmEuY2FsbChlLGUpLGV9LHdoZW46ZnVuY3Rpb24oYSl7dmFyIGI9MCxjPWUuY2FsbChhcmd1bWVudHMpLGQ9Yy5sZW5ndGgsZj0xIT09ZHx8YSYmbi5pc0Z1bmN0aW9uKGEucHJvbWlzZSk/ZDowLGc9MT09PWY/YTpuLkRlZmVycmVkKCksaD1mdW5jdGlvbihhLGIsYyl7cmV0dXJuIGZ1bmN0aW9uKGQpe2JbYV09dGhpcyxjW2FdPWFyZ3VtZW50cy5sZW5ndGg+MT9lLmNhbGwoYXJndW1lbnRzKTpkLGM9PT1pP2cubm90aWZ5V2l0aChiLGMpOi0tZnx8Zy5yZXNvbHZlV2l0aChiLGMpfX0saSxqLGs7aWYoZD4xKWZvcihpPW5ldyBBcnJheShkKSxqPW5ldyBBcnJheShkKSxrPW5ldyBBcnJheShkKTtkPmI7YisrKWNbYl0mJm4uaXNGdW5jdGlvbihjW2JdLnByb21pc2UpP2NbYl0ucHJvbWlzZSgpLnByb2dyZXNzKGgoYixqLGkpKS5kb25lKGgoYixrLGMpKS5mYWlsKGcucmVqZWN0KTotLWY7cmV0dXJuIGZ8fGcucmVzb2x2ZVdpdGgoayxjKSxnLnByb21pc2UoKX19KTt2YXIgSTtuLmZuLnJlYWR5PWZ1bmN0aW9uKGEpe3JldHVybiBuLnJlYWR5LnByb21pc2UoKS5kb25lKGEpLHRoaXN9LG4uZXh0ZW5kKHtpc1JlYWR5OiExLHJlYWR5V2FpdDoxLGhvbGRSZWFkeTpmdW5jdGlvbihhKXthP24ucmVhZHlXYWl0Kys6bi5yZWFkeSghMCl9LHJlYWR5OmZ1bmN0aW9uKGEpeyhhPT09ITA/LS1uLnJlYWR5V2FpdDpuLmlzUmVhZHkpfHwobi5pc1JlYWR5PSEwLGEhPT0hMCYmLS1uLnJlYWR5V2FpdD4wfHwoSS5yZXNvbHZlV2l0aChkLFtuXSksbi5mbi50cmlnZ2VySGFuZGxlciYmKG4oZCkudHJpZ2dlckhhbmRsZXIoXCJyZWFkeVwiKSxuKGQpLm9mZihcInJlYWR5XCIpKSkpfX0pO2Z1bmN0aW9uIEooKXtkLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsSiksYS5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLEopLG4ucmVhZHkoKX1uLnJlYWR5LnByb21pc2U9ZnVuY3Rpb24oYil7cmV0dXJuIEl8fChJPW4uRGVmZXJyZWQoKSxcImNvbXBsZXRlXCI9PT1kLnJlYWR5U3RhdGV8fFwibG9hZGluZ1wiIT09ZC5yZWFkeVN0YXRlJiYhZC5kb2N1bWVudEVsZW1lbnQuZG9TY3JvbGw/YS5zZXRUaW1lb3V0KG4ucmVhZHkpOihkLmFkZEV2ZW50TGlzdGVuZXIoXCJET01Db250ZW50TG9hZGVkXCIsSiksYS5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLEopKSksSS5wcm9taXNlKGIpfSxuLnJlYWR5LnByb21pc2UoKTt2YXIgSz1mdW5jdGlvbihhLGIsYyxkLGUsZixnKXt2YXIgaD0wLGk9YS5sZW5ndGgsaj1udWxsPT1jO2lmKFwib2JqZWN0XCI9PT1uLnR5cGUoYykpe2U9ITA7Zm9yKGggaW4gYylLKGEsYixoLGNbaF0sITAsZixnKX1lbHNlIGlmKHZvaWQgMCE9PWQmJihlPSEwLG4uaXNGdW5jdGlvbihkKXx8KGc9ITApLGomJihnPyhiLmNhbGwoYSxkKSxiPW51bGwpOihqPWIsYj1mdW5jdGlvbihhLGIsYyl7cmV0dXJuIGouY2FsbChuKGEpLGMpfSkpLGIpKWZvcig7aT5oO2grKyliKGFbaF0sYyxnP2Q6ZC5jYWxsKGFbaF0saCxiKGFbaF0sYykpKTtyZXR1cm4gZT9hOmo/Yi5jYWxsKGEpOmk/YihhWzBdLGMpOmZ9LEw9ZnVuY3Rpb24oYSl7cmV0dXJuIDE9PT1hLm5vZGVUeXBlfHw5PT09YS5ub2RlVHlwZXx8ISthLm5vZGVUeXBlfTtmdW5jdGlvbiBNKCl7dGhpcy5leHBhbmRvPW4uZXhwYW5kbytNLnVpZCsrfU0udWlkPTEsTS5wcm90b3R5cGU9e3JlZ2lzdGVyOmZ1bmN0aW9uKGEsYil7dmFyIGM9Ynx8e307cmV0dXJuIGEubm9kZVR5cGU/YVt0aGlzLmV4cGFuZG9dPWM6T2JqZWN0LmRlZmluZVByb3BlcnR5KGEsdGhpcy5leHBhbmRvLHt2YWx1ZTpjLHdyaXRhYmxlOiEwLGNvbmZpZ3VyYWJsZTohMH0pLGFbdGhpcy5leHBhbmRvXX0sY2FjaGU6ZnVuY3Rpb24oYSl7aWYoIUwoYSkpcmV0dXJue307dmFyIGI9YVt0aGlzLmV4cGFuZG9dO3JldHVybiBifHwoYj17fSxMKGEpJiYoYS5ub2RlVHlwZT9hW3RoaXMuZXhwYW5kb109YjpPYmplY3QuZGVmaW5lUHJvcGVydHkoYSx0aGlzLmV4cGFuZG8se3ZhbHVlOmIsY29uZmlndXJhYmxlOiEwfSkpKSxifSxzZXQ6ZnVuY3Rpb24oYSxiLGMpe3ZhciBkLGU9dGhpcy5jYWNoZShhKTtpZihcInN0cmluZ1wiPT10eXBlb2YgYillW2JdPWM7ZWxzZSBmb3IoZCBpbiBiKWVbZF09YltkXTtyZXR1cm4gZX0sZ2V0OmZ1bmN0aW9uKGEsYil7cmV0dXJuIHZvaWQgMD09PWI/dGhpcy5jYWNoZShhKTphW3RoaXMuZXhwYW5kb10mJmFbdGhpcy5leHBhbmRvXVtiXX0sYWNjZXNzOmZ1bmN0aW9uKGEsYixjKXt2YXIgZDtyZXR1cm4gdm9pZCAwPT09Ynx8YiYmXCJzdHJpbmdcIj09dHlwZW9mIGImJnZvaWQgMD09PWM/KGQ9dGhpcy5nZXQoYSxiKSx2b2lkIDAhPT1kP2Q6dGhpcy5nZXQoYSxuLmNhbWVsQ2FzZShiKSkpOih0aGlzLnNldChhLGIsYyksdm9pZCAwIT09Yz9jOmIpfSxyZW1vdmU6ZnVuY3Rpb24oYSxiKXt2YXIgYyxkLGUsZj1hW3RoaXMuZXhwYW5kb107aWYodm9pZCAwIT09Zil7aWYodm9pZCAwPT09Yil0aGlzLnJlZ2lzdGVyKGEpO2Vsc2V7bi5pc0FycmF5KGIpP2Q9Yi5jb25jYXQoYi5tYXAobi5jYW1lbENhc2UpKTooZT1uLmNhbWVsQ2FzZShiKSxiIGluIGY/ZD1bYixlXTooZD1lLGQ9ZCBpbiBmP1tkXTpkLm1hdGNoKEcpfHxbXSkpLGM9ZC5sZW5ndGg7d2hpbGUoYy0tKWRlbGV0ZSBmW2RbY11dfSh2b2lkIDA9PT1ifHxuLmlzRW1wdHlPYmplY3QoZikpJiYoYS5ub2RlVHlwZT9hW3RoaXMuZXhwYW5kb109dm9pZCAwOmRlbGV0ZSBhW3RoaXMuZXhwYW5kb10pfX0saGFzRGF0YTpmdW5jdGlvbihhKXt2YXIgYj1hW3RoaXMuZXhwYW5kb107cmV0dXJuIHZvaWQgMCE9PWImJiFuLmlzRW1wdHlPYmplY3QoYil9fTt2YXIgTj1uZXcgTSxPPW5ldyBNLFA9L14oPzpcXHtbXFx3XFxXXSpcXH18XFxbW1xcd1xcV10qXFxdKSQvLFE9L1tBLVpdL2c7ZnVuY3Rpb24gUihhLGIsYyl7dmFyIGQ7aWYodm9pZCAwPT09YyYmMT09PWEubm9kZVR5cGUpaWYoZD1cImRhdGEtXCIrYi5yZXBsYWNlKFEsXCItJCZcIikudG9Mb3dlckNhc2UoKSxjPWEuZ2V0QXR0cmlidXRlKGQpLFwic3RyaW5nXCI9PXR5cGVvZiBjKXt0cnl7Yz1cInRydWVcIj09PWM/ITA6XCJmYWxzZVwiPT09Yz8hMTpcIm51bGxcIj09PWM/bnVsbDorYytcIlwiPT09Yz8rYzpQLnRlc3QoYyk/bi5wYXJzZUpTT04oYyk6Yztcbn1jYXRjaChlKXt9Ty5zZXQoYSxiLGMpfWVsc2UgYz12b2lkIDA7cmV0dXJuIGN9bi5leHRlbmQoe2hhc0RhdGE6ZnVuY3Rpb24oYSl7cmV0dXJuIE8uaGFzRGF0YShhKXx8Ti5oYXNEYXRhKGEpfSxkYXRhOmZ1bmN0aW9uKGEsYixjKXtyZXR1cm4gTy5hY2Nlc3MoYSxiLGMpfSxyZW1vdmVEYXRhOmZ1bmN0aW9uKGEsYil7Ty5yZW1vdmUoYSxiKX0sX2RhdGE6ZnVuY3Rpb24oYSxiLGMpe3JldHVybiBOLmFjY2VzcyhhLGIsYyl9LF9yZW1vdmVEYXRhOmZ1bmN0aW9uKGEsYil7Ti5yZW1vdmUoYSxiKX19KSxuLmZuLmV4dGVuZCh7ZGF0YTpmdW5jdGlvbihhLGIpe3ZhciBjLGQsZSxmPXRoaXNbMF0sZz1mJiZmLmF0dHJpYnV0ZXM7aWYodm9pZCAwPT09YSl7aWYodGhpcy5sZW5ndGgmJihlPU8uZ2V0KGYpLDE9PT1mLm5vZGVUeXBlJiYhTi5nZXQoZixcImhhc0RhdGFBdHRyc1wiKSkpe2M9Zy5sZW5ndGg7d2hpbGUoYy0tKWdbY10mJihkPWdbY10ubmFtZSwwPT09ZC5pbmRleE9mKFwiZGF0YS1cIikmJihkPW4uY2FtZWxDYXNlKGQuc2xpY2UoNSkpLFIoZixkLGVbZF0pKSk7Ti5zZXQoZixcImhhc0RhdGFBdHRyc1wiLCEwKX1yZXR1cm4gZX1yZXR1cm5cIm9iamVjdFwiPT10eXBlb2YgYT90aGlzLmVhY2goZnVuY3Rpb24oKXtPLnNldCh0aGlzLGEpfSk6Syh0aGlzLGZ1bmN0aW9uKGIpe3ZhciBjLGQ7aWYoZiYmdm9pZCAwPT09Yil7aWYoYz1PLmdldChmLGEpfHxPLmdldChmLGEucmVwbGFjZShRLFwiLSQmXCIpLnRvTG93ZXJDYXNlKCkpLHZvaWQgMCE9PWMpcmV0dXJuIGM7aWYoZD1uLmNhbWVsQ2FzZShhKSxjPU8uZ2V0KGYsZCksdm9pZCAwIT09YylyZXR1cm4gYztpZihjPVIoZixkLHZvaWQgMCksdm9pZCAwIT09YylyZXR1cm4gY31lbHNlIGQ9bi5jYW1lbENhc2UoYSksdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIGM9Ty5nZXQodGhpcyxkKTtPLnNldCh0aGlzLGQsYiksYS5pbmRleE9mKFwiLVwiKT4tMSYmdm9pZCAwIT09YyYmTy5zZXQodGhpcyxhLGIpfSl9LG51bGwsYixhcmd1bWVudHMubGVuZ3RoPjEsbnVsbCwhMCl9LHJlbW92ZURhdGE6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe08ucmVtb3ZlKHRoaXMsYSl9KX19KSxuLmV4dGVuZCh7cXVldWU6ZnVuY3Rpb24oYSxiLGMpe3ZhciBkO3JldHVybiBhPyhiPShifHxcImZ4XCIpK1wicXVldWVcIixkPU4uZ2V0KGEsYiksYyYmKCFkfHxuLmlzQXJyYXkoYyk/ZD1OLmFjY2VzcyhhLGIsbi5tYWtlQXJyYXkoYykpOmQucHVzaChjKSksZHx8W10pOnZvaWQgMH0sZGVxdWV1ZTpmdW5jdGlvbihhLGIpe2I9Ynx8XCJmeFwiO3ZhciBjPW4ucXVldWUoYSxiKSxkPWMubGVuZ3RoLGU9Yy5zaGlmdCgpLGY9bi5fcXVldWVIb29rcyhhLGIpLGc9ZnVuY3Rpb24oKXtuLmRlcXVldWUoYSxiKX07XCJpbnByb2dyZXNzXCI9PT1lJiYoZT1jLnNoaWZ0KCksZC0tKSxlJiYoXCJmeFwiPT09YiYmYy51bnNoaWZ0KFwiaW5wcm9ncmVzc1wiKSxkZWxldGUgZi5zdG9wLGUuY2FsbChhLGcsZikpLCFkJiZmJiZmLmVtcHR5LmZpcmUoKX0sX3F1ZXVlSG9va3M6ZnVuY3Rpb24oYSxiKXt2YXIgYz1iK1wicXVldWVIb29rc1wiO3JldHVybiBOLmdldChhLGMpfHxOLmFjY2VzcyhhLGMse2VtcHR5Om4uQ2FsbGJhY2tzKFwib25jZSBtZW1vcnlcIikuYWRkKGZ1bmN0aW9uKCl7Ti5yZW1vdmUoYSxbYitcInF1ZXVlXCIsY10pfSl9KX19KSxuLmZuLmV4dGVuZCh7cXVldWU6ZnVuY3Rpb24oYSxiKXt2YXIgYz0yO3JldHVyblwic3RyaW5nXCIhPXR5cGVvZiBhJiYoYj1hLGE9XCJmeFwiLGMtLSksYXJndW1lbnRzLmxlbmd0aDxjP24ucXVldWUodGhpc1swXSxhKTp2b2lkIDA9PT1iP3RoaXM6dGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIGM9bi5xdWV1ZSh0aGlzLGEsYik7bi5fcXVldWVIb29rcyh0aGlzLGEpLFwiZnhcIj09PWEmJlwiaW5wcm9ncmVzc1wiIT09Y1swXSYmbi5kZXF1ZXVlKHRoaXMsYSl9KX0sZGVxdWV1ZTpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7bi5kZXF1ZXVlKHRoaXMsYSl9KX0sY2xlYXJRdWV1ZTpmdW5jdGlvbihhKXtyZXR1cm4gdGhpcy5xdWV1ZShhfHxcImZ4XCIsW10pfSxwcm9taXNlOmZ1bmN0aW9uKGEsYil7dmFyIGMsZD0xLGU9bi5EZWZlcnJlZCgpLGY9dGhpcyxnPXRoaXMubGVuZ3RoLGg9ZnVuY3Rpb24oKXstLWR8fGUucmVzb2x2ZVdpdGgoZixbZl0pfTtcInN0cmluZ1wiIT10eXBlb2YgYSYmKGI9YSxhPXZvaWQgMCksYT1hfHxcImZ4XCI7d2hpbGUoZy0tKWM9Ti5nZXQoZltnXSxhK1wicXVldWVIb29rc1wiKSxjJiZjLmVtcHR5JiYoZCsrLGMuZW1wdHkuYWRkKGgpKTtyZXR1cm4gaCgpLGUucHJvbWlzZShiKX19KTt2YXIgUz0vWystXT8oPzpcXGQqXFwufClcXGQrKD86W2VFXVsrLV0/XFxkK3wpLy5zb3VyY2UsVD1uZXcgUmVnRXhwKFwiXig/OihbKy1dKT18KShcIitTK1wiKShbYS16JV0qKSRcIixcImlcIiksVT1bXCJUb3BcIixcIlJpZ2h0XCIsXCJCb3R0b21cIixcIkxlZnRcIl0sVj1mdW5jdGlvbihhLGIpe3JldHVybiBhPWJ8fGEsXCJub25lXCI9PT1uLmNzcyhhLFwiZGlzcGxheVwiKXx8IW4uY29udGFpbnMoYS5vd25lckRvY3VtZW50LGEpfTtmdW5jdGlvbiBXKGEsYixjLGQpe3ZhciBlLGY9MSxnPTIwLGg9ZD9mdW5jdGlvbigpe3JldHVybiBkLmN1cigpfTpmdW5jdGlvbigpe3JldHVybiBuLmNzcyhhLGIsXCJcIil9LGk9aCgpLGo9YyYmY1szXXx8KG4uY3NzTnVtYmVyW2JdP1wiXCI6XCJweFwiKSxrPShuLmNzc051bWJlcltiXXx8XCJweFwiIT09aiYmK2kpJiZULmV4ZWMobi5jc3MoYSxiKSk7aWYoayYma1szXSE9PWope2o9anx8a1szXSxjPWN8fFtdLGs9K2l8fDE7ZG8gZj1mfHxcIi41XCIsay89ZixuLnN0eWxlKGEsYixrK2opO3doaWxlKGYhPT0oZj1oKCkvaSkmJjEhPT1mJiYtLWcpfXJldHVybiBjJiYoaz0ra3x8K2l8fDAsZT1jWzFdP2srKGNbMV0rMSkqY1syXTorY1syXSxkJiYoZC51bml0PWosZC5zdGFydD1rLGQuZW5kPWUpKSxlfXZhciBYPS9eKD86Y2hlY2tib3h8cmFkaW8pJC9pLFk9LzwoW1xcdzotXSspLyxaPS9eJHxcXC8oPzpqYXZhfGVjbWEpc2NyaXB0L2ksJD17b3B0aW9uOlsxLFwiPHNlbGVjdCBtdWx0aXBsZT0nbXVsdGlwbGUnPlwiLFwiPC9zZWxlY3Q+XCJdLHRoZWFkOlsxLFwiPHRhYmxlPlwiLFwiPC90YWJsZT5cIl0sY29sOlsyLFwiPHRhYmxlPjxjb2xncm91cD5cIixcIjwvY29sZ3JvdXA+PC90YWJsZT5cIl0sdHI6WzIsXCI8dGFibGU+PHRib2R5PlwiLFwiPC90Ym9keT48L3RhYmxlPlwiXSx0ZDpbMyxcIjx0YWJsZT48dGJvZHk+PHRyPlwiLFwiPC90cj48L3Rib2R5PjwvdGFibGU+XCJdLF9kZWZhdWx0OlswLFwiXCIsXCJcIl19OyQub3B0Z3JvdXA9JC5vcHRpb24sJC50Ym9keT0kLnRmb290PSQuY29sZ3JvdXA9JC5jYXB0aW9uPSQudGhlYWQsJC50aD0kLnRkO2Z1bmN0aW9uIF8oYSxiKXt2YXIgYz1cInVuZGVmaW5lZFwiIT10eXBlb2YgYS5nZXRFbGVtZW50c0J5VGFnTmFtZT9hLmdldEVsZW1lbnRzQnlUYWdOYW1lKGJ8fFwiKlwiKTpcInVuZGVmaW5lZFwiIT10eXBlb2YgYS5xdWVyeVNlbGVjdG9yQWxsP2EucXVlcnlTZWxlY3RvckFsbChifHxcIipcIik6W107cmV0dXJuIHZvaWQgMD09PWJ8fGImJm4ubm9kZU5hbWUoYSxiKT9uLm1lcmdlKFthXSxjKTpjfWZ1bmN0aW9uIGFhKGEsYil7Zm9yKHZhciBjPTAsZD1hLmxlbmd0aDtkPmM7YysrKU4uc2V0KGFbY10sXCJnbG9iYWxFdmFsXCIsIWJ8fE4uZ2V0KGJbY10sXCJnbG9iYWxFdmFsXCIpKX12YXIgYmE9Lzx8JiM/XFx3KzsvO2Z1bmN0aW9uIGNhKGEsYixjLGQsZSl7Zm9yKHZhciBmLGcsaCxpLGosayxsPWIuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLG09W10sbz0wLHA9YS5sZW5ndGg7cD5vO28rKylpZihmPWFbb10sZnx8MD09PWYpaWYoXCJvYmplY3RcIj09PW4udHlwZShmKSluLm1lcmdlKG0sZi5ub2RlVHlwZT9bZl06Zik7ZWxzZSBpZihiYS50ZXN0KGYpKXtnPWd8fGwuYXBwZW5kQ2hpbGQoYi5jcmVhdGVFbGVtZW50KFwiZGl2XCIpKSxoPShZLmV4ZWMoZil8fFtcIlwiLFwiXCJdKVsxXS50b0xvd2VyQ2FzZSgpLGk9JFtoXXx8JC5fZGVmYXVsdCxnLmlubmVySFRNTD1pWzFdK24uaHRtbFByZWZpbHRlcihmKStpWzJdLGs9aVswXTt3aGlsZShrLS0pZz1nLmxhc3RDaGlsZDtuLm1lcmdlKG0sZy5jaGlsZE5vZGVzKSxnPWwuZmlyc3RDaGlsZCxnLnRleHRDb250ZW50PVwiXCJ9ZWxzZSBtLnB1c2goYi5jcmVhdGVUZXh0Tm9kZShmKSk7bC50ZXh0Q29udGVudD1cIlwiLG89MDt3aGlsZShmPW1bbysrXSlpZihkJiZuLmluQXJyYXkoZixkKT4tMSllJiZlLnB1c2goZik7ZWxzZSBpZihqPW4uY29udGFpbnMoZi5vd25lckRvY3VtZW50LGYpLGc9XyhsLmFwcGVuZENoaWxkKGYpLFwic2NyaXB0XCIpLGomJmFhKGcpLGMpe2s9MDt3aGlsZShmPWdbaysrXSlaLnRlc3QoZi50eXBlfHxcIlwiKSYmYy5wdXNoKGYpfXJldHVybiBsfSFmdW5jdGlvbigpe3ZhciBhPWQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLGI9YS5hcHBlbmRDaGlsZChkLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikpLGM9ZC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIik7Yy5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsXCJyYWRpb1wiKSxjLnNldEF0dHJpYnV0ZShcImNoZWNrZWRcIixcImNoZWNrZWRcIiksYy5zZXRBdHRyaWJ1dGUoXCJuYW1lXCIsXCJ0XCIpLGIuYXBwZW5kQ2hpbGQoYyksbC5jaGVja0Nsb25lPWIuY2xvbmVOb2RlKCEwKS5jbG9uZU5vZGUoITApLmxhc3RDaGlsZC5jaGVja2VkLGIuaW5uZXJIVE1MPVwiPHRleHRhcmVhPng8L3RleHRhcmVhPlwiLGwubm9DbG9uZUNoZWNrZWQ9ISFiLmNsb25lTm9kZSghMCkubGFzdENoaWxkLmRlZmF1bHRWYWx1ZX0oKTt2YXIgZGE9L15rZXkvLGVhPS9eKD86bW91c2V8cG9pbnRlcnxjb250ZXh0bWVudXxkcmFnfGRyb3ApfGNsaWNrLyxmYT0vXihbXi5dKikoPzpcXC4oLispfCkvO2Z1bmN0aW9uIGdhKCl7cmV0dXJuITB9ZnVuY3Rpb24gaGEoKXtyZXR1cm4hMX1mdW5jdGlvbiBpYSgpe3RyeXtyZXR1cm4gZC5hY3RpdmVFbGVtZW50fWNhdGNoKGEpe319ZnVuY3Rpb24gamEoYSxiLGMsZCxlLGYpe3ZhciBnLGg7aWYoXCJvYmplY3RcIj09dHlwZW9mIGIpe1wic3RyaW5nXCIhPXR5cGVvZiBjJiYoZD1kfHxjLGM9dm9pZCAwKTtmb3IoaCBpbiBiKWphKGEsaCxjLGQsYltoXSxmKTtyZXR1cm4gYX1pZihudWxsPT1kJiZudWxsPT1lPyhlPWMsZD1jPXZvaWQgMCk6bnVsbD09ZSYmKFwic3RyaW5nXCI9PXR5cGVvZiBjPyhlPWQsZD12b2lkIDApOihlPWQsZD1jLGM9dm9pZCAwKSksZT09PSExKWU9aGE7ZWxzZSBpZighZSlyZXR1cm4gYTtyZXR1cm4gMT09PWYmJihnPWUsZT1mdW5jdGlvbihhKXtyZXR1cm4gbigpLm9mZihhKSxnLmFwcGx5KHRoaXMsYXJndW1lbnRzKX0sZS5ndWlkPWcuZ3VpZHx8KGcuZ3VpZD1uLmd1aWQrKykpLGEuZWFjaChmdW5jdGlvbigpe24uZXZlbnQuYWRkKHRoaXMsYixlLGQsYyl9KX1uLmV2ZW50PXtnbG9iYWw6e30sYWRkOmZ1bmN0aW9uKGEsYixjLGQsZSl7dmFyIGYsZyxoLGksaixrLGwsbSxvLHAscSxyPU4uZ2V0KGEpO2lmKHIpe2MuaGFuZGxlciYmKGY9YyxjPWYuaGFuZGxlcixlPWYuc2VsZWN0b3IpLGMuZ3VpZHx8KGMuZ3VpZD1uLmd1aWQrKyksKGk9ci5ldmVudHMpfHwoaT1yLmV2ZW50cz17fSksKGc9ci5oYW5kbGUpfHwoZz1yLmhhbmRsZT1mdW5jdGlvbihiKXtyZXR1cm5cInVuZGVmaW5lZFwiIT10eXBlb2YgbiYmbi5ldmVudC50cmlnZ2VyZWQhPT1iLnR5cGU/bi5ldmVudC5kaXNwYXRjaC5hcHBseShhLGFyZ3VtZW50cyk6dm9pZCAwfSksYj0oYnx8XCJcIikubWF0Y2goRyl8fFtcIlwiXSxqPWIubGVuZ3RoO3doaWxlKGotLSloPWZhLmV4ZWMoYltqXSl8fFtdLG89cT1oWzFdLHA9KGhbMl18fFwiXCIpLnNwbGl0KFwiLlwiKS5zb3J0KCksbyYmKGw9bi5ldmVudC5zcGVjaWFsW29dfHx7fSxvPShlP2wuZGVsZWdhdGVUeXBlOmwuYmluZFR5cGUpfHxvLGw9bi5ldmVudC5zcGVjaWFsW29dfHx7fSxrPW4uZXh0ZW5kKHt0eXBlOm8sb3JpZ1R5cGU6cSxkYXRhOmQsaGFuZGxlcjpjLGd1aWQ6Yy5ndWlkLHNlbGVjdG9yOmUsbmVlZHNDb250ZXh0OmUmJm4uZXhwci5tYXRjaC5uZWVkc0NvbnRleHQudGVzdChlKSxuYW1lc3BhY2U6cC5qb2luKFwiLlwiKX0sZiksKG09aVtvXSl8fChtPWlbb109W10sbS5kZWxlZ2F0ZUNvdW50PTAsbC5zZXR1cCYmbC5zZXR1cC5jYWxsKGEsZCxwLGcpIT09ITF8fGEuYWRkRXZlbnRMaXN0ZW5lciYmYS5hZGRFdmVudExpc3RlbmVyKG8sZykpLGwuYWRkJiYobC5hZGQuY2FsbChhLGspLGsuaGFuZGxlci5ndWlkfHwoay5oYW5kbGVyLmd1aWQ9Yy5ndWlkKSksZT9tLnNwbGljZShtLmRlbGVnYXRlQ291bnQrKywwLGspOm0ucHVzaChrKSxuLmV2ZW50Lmdsb2JhbFtvXT0hMCl9fSxyZW1vdmU6ZnVuY3Rpb24oYSxiLGMsZCxlKXt2YXIgZixnLGgsaSxqLGssbCxtLG8scCxxLHI9Ti5oYXNEYXRhKGEpJiZOLmdldChhKTtpZihyJiYoaT1yLmV2ZW50cykpe2I9KGJ8fFwiXCIpLm1hdGNoKEcpfHxbXCJcIl0saj1iLmxlbmd0aDt3aGlsZShqLS0paWYoaD1mYS5leGVjKGJbal0pfHxbXSxvPXE9aFsxXSxwPShoWzJdfHxcIlwiKS5zcGxpdChcIi5cIikuc29ydCgpLG8pe2w9bi5ldmVudC5zcGVjaWFsW29dfHx7fSxvPShkP2wuZGVsZWdhdGVUeXBlOmwuYmluZFR5cGUpfHxvLG09aVtvXXx8W10saD1oWzJdJiZuZXcgUmVnRXhwKFwiKF58XFxcXC4pXCIrcC5qb2luKFwiXFxcXC4oPzouKlxcXFwufClcIikrXCIoXFxcXC58JClcIiksZz1mPW0ubGVuZ3RoO3doaWxlKGYtLSlrPW1bZl0sIWUmJnEhPT1rLm9yaWdUeXBlfHxjJiZjLmd1aWQhPT1rLmd1aWR8fGgmJiFoLnRlc3Qoay5uYW1lc3BhY2UpfHxkJiZkIT09ay5zZWxlY3RvciYmKFwiKipcIiE9PWR8fCFrLnNlbGVjdG9yKXx8KG0uc3BsaWNlKGYsMSksay5zZWxlY3RvciYmbS5kZWxlZ2F0ZUNvdW50LS0sbC5yZW1vdmUmJmwucmVtb3ZlLmNhbGwoYSxrKSk7ZyYmIW0ubGVuZ3RoJiYobC50ZWFyZG93biYmbC50ZWFyZG93bi5jYWxsKGEscCxyLmhhbmRsZSkhPT0hMXx8bi5yZW1vdmVFdmVudChhLG8sci5oYW5kbGUpLGRlbGV0ZSBpW29dKX1lbHNlIGZvcihvIGluIGkpbi5ldmVudC5yZW1vdmUoYSxvK2Jbal0sYyxkLCEwKTtuLmlzRW1wdHlPYmplY3QoaSkmJk4ucmVtb3ZlKGEsXCJoYW5kbGUgZXZlbnRzXCIpfX0sZGlzcGF0Y2g6ZnVuY3Rpb24oYSl7YT1uLmV2ZW50LmZpeChhKTt2YXIgYixjLGQsZixnLGg9W10saT1lLmNhbGwoYXJndW1lbnRzKSxqPShOLmdldCh0aGlzLFwiZXZlbnRzXCIpfHx7fSlbYS50eXBlXXx8W10saz1uLmV2ZW50LnNwZWNpYWxbYS50eXBlXXx8e307aWYoaVswXT1hLGEuZGVsZWdhdGVUYXJnZXQ9dGhpcywhay5wcmVEaXNwYXRjaHx8ay5wcmVEaXNwYXRjaC5jYWxsKHRoaXMsYSkhPT0hMSl7aD1uLmV2ZW50LmhhbmRsZXJzLmNhbGwodGhpcyxhLGopLGI9MDt3aGlsZSgoZj1oW2IrK10pJiYhYS5pc1Byb3BhZ2F0aW9uU3RvcHBlZCgpKXthLmN1cnJlbnRUYXJnZXQ9Zi5lbGVtLGM9MDt3aGlsZSgoZz1mLmhhbmRsZXJzW2MrK10pJiYhYS5pc0ltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZCgpKWEucm5hbWVzcGFjZSYmIWEucm5hbWVzcGFjZS50ZXN0KGcubmFtZXNwYWNlKXx8KGEuaGFuZGxlT2JqPWcsYS5kYXRhPWcuZGF0YSxkPSgobi5ldmVudC5zcGVjaWFsW2cub3JpZ1R5cGVdfHx7fSkuaGFuZGxlfHxnLmhhbmRsZXIpLmFwcGx5KGYuZWxlbSxpKSx2b2lkIDAhPT1kJiYoYS5yZXN1bHQ9ZCk9PT0hMSYmKGEucHJldmVudERlZmF1bHQoKSxhLnN0b3BQcm9wYWdhdGlvbigpKSl9cmV0dXJuIGsucG9zdERpc3BhdGNoJiZrLnBvc3REaXNwYXRjaC5jYWxsKHRoaXMsYSksYS5yZXN1bHR9fSxoYW5kbGVyczpmdW5jdGlvbihhLGIpe3ZhciBjLGQsZSxmLGc9W10saD1iLmRlbGVnYXRlQ291bnQsaT1hLnRhcmdldDtpZihoJiZpLm5vZGVUeXBlJiYoXCJjbGlja1wiIT09YS50eXBlfHxpc05hTihhLmJ1dHRvbil8fGEuYnV0dG9uPDEpKWZvcig7aSE9PXRoaXM7aT1pLnBhcmVudE5vZGV8fHRoaXMpaWYoMT09PWkubm9kZVR5cGUmJihpLmRpc2FibGVkIT09ITB8fFwiY2xpY2tcIiE9PWEudHlwZSkpe2ZvcihkPVtdLGM9MDtoPmM7YysrKWY9YltjXSxlPWYuc2VsZWN0b3IrXCIgXCIsdm9pZCAwPT09ZFtlXSYmKGRbZV09Zi5uZWVkc0NvbnRleHQ/bihlLHRoaXMpLmluZGV4KGkpPi0xOm4uZmluZChlLHRoaXMsbnVsbCxbaV0pLmxlbmd0aCksZFtlXSYmZC5wdXNoKGYpO2QubGVuZ3RoJiZnLnB1c2goe2VsZW06aSxoYW5kbGVyczpkfSl9cmV0dXJuIGg8Yi5sZW5ndGgmJmcucHVzaCh7ZWxlbTp0aGlzLGhhbmRsZXJzOmIuc2xpY2UoaCl9KSxnfSxwcm9wczpcImFsdEtleSBidWJibGVzIGNhbmNlbGFibGUgY3RybEtleSBjdXJyZW50VGFyZ2V0IGRldGFpbCBldmVudFBoYXNlIG1ldGFLZXkgcmVsYXRlZFRhcmdldCBzaGlmdEtleSB0YXJnZXQgdGltZVN0YW1wIHZpZXcgd2hpY2hcIi5zcGxpdChcIiBcIiksZml4SG9va3M6e30sa2V5SG9va3M6e3Byb3BzOlwiY2hhciBjaGFyQ29kZSBrZXkga2V5Q29kZVwiLnNwbGl0KFwiIFwiKSxmaWx0ZXI6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gbnVsbD09YS53aGljaCYmKGEud2hpY2g9bnVsbCE9Yi5jaGFyQ29kZT9iLmNoYXJDb2RlOmIua2V5Q29kZSksYX19LG1vdXNlSG9va3M6e3Byb3BzOlwiYnV0dG9uIGJ1dHRvbnMgY2xpZW50WCBjbGllbnRZIG9mZnNldFggb2Zmc2V0WSBwYWdlWCBwYWdlWSBzY3JlZW5YIHNjcmVlblkgdG9FbGVtZW50XCIuc3BsaXQoXCIgXCIpLGZpbHRlcjpmdW5jdGlvbihhLGIpe3ZhciBjLGUsZixnPWIuYnV0dG9uO3JldHVybiBudWxsPT1hLnBhZ2VYJiZudWxsIT1iLmNsaWVudFgmJihjPWEudGFyZ2V0Lm93bmVyRG9jdW1lbnR8fGQsZT1jLmRvY3VtZW50RWxlbWVudCxmPWMuYm9keSxhLnBhZ2VYPWIuY2xpZW50WCsoZSYmZS5zY3JvbGxMZWZ0fHxmJiZmLnNjcm9sbExlZnR8fDApLShlJiZlLmNsaWVudExlZnR8fGYmJmYuY2xpZW50TGVmdHx8MCksYS5wYWdlWT1iLmNsaWVudFkrKGUmJmUuc2Nyb2xsVG9wfHxmJiZmLnNjcm9sbFRvcHx8MCktKGUmJmUuY2xpZW50VG9wfHxmJiZmLmNsaWVudFRvcHx8MCkpLGEud2hpY2h8fHZvaWQgMD09PWd8fChhLndoaWNoPTEmZz8xOjImZz8zOjQmZz8yOjApLGF9fSxmaXg6ZnVuY3Rpb24oYSl7aWYoYVtuLmV4cGFuZG9dKXJldHVybiBhO3ZhciBiLGMsZSxmPWEudHlwZSxnPWEsaD10aGlzLmZpeEhvb2tzW2ZdO2h8fCh0aGlzLmZpeEhvb2tzW2ZdPWg9ZWEudGVzdChmKT90aGlzLm1vdXNlSG9va3M6ZGEudGVzdChmKT90aGlzLmtleUhvb2tzOnt9KSxlPWgucHJvcHM/dGhpcy5wcm9wcy5jb25jYXQoaC5wcm9wcyk6dGhpcy5wcm9wcyxhPW5ldyBuLkV2ZW50KGcpLGI9ZS5sZW5ndGg7d2hpbGUoYi0tKWM9ZVtiXSxhW2NdPWdbY107cmV0dXJuIGEudGFyZ2V0fHwoYS50YXJnZXQ9ZCksMz09PWEudGFyZ2V0Lm5vZGVUeXBlJiYoYS50YXJnZXQ9YS50YXJnZXQucGFyZW50Tm9kZSksaC5maWx0ZXI/aC5maWx0ZXIoYSxnKTphfSxzcGVjaWFsOntsb2FkOntub0J1YmJsZTohMH0sZm9jdXM6e3RyaWdnZXI6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcyE9PWlhKCkmJnRoaXMuZm9jdXM/KHRoaXMuZm9jdXMoKSwhMSk6dm9pZCAwfSxkZWxlZ2F0ZVR5cGU6XCJmb2N1c2luXCJ9LGJsdXI6e3RyaWdnZXI6ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcz09PWlhKCkmJnRoaXMuYmx1cj8odGhpcy5ibHVyKCksITEpOnZvaWQgMH0sZGVsZWdhdGVUeXBlOlwiZm9jdXNvdXRcIn0sY2xpY2s6e3RyaWdnZXI6ZnVuY3Rpb24oKXtyZXR1cm5cImNoZWNrYm94XCI9PT10aGlzLnR5cGUmJnRoaXMuY2xpY2smJm4ubm9kZU5hbWUodGhpcyxcImlucHV0XCIpPyh0aGlzLmNsaWNrKCksITEpOnZvaWQgMH0sX2RlZmF1bHQ6ZnVuY3Rpb24oYSl7cmV0dXJuIG4ubm9kZU5hbWUoYS50YXJnZXQsXCJhXCIpfX0sYmVmb3JldW5sb2FkOntwb3N0RGlzcGF0Y2g6ZnVuY3Rpb24oYSl7dm9pZCAwIT09YS5yZXN1bHQmJmEub3JpZ2luYWxFdmVudCYmKGEub3JpZ2luYWxFdmVudC5yZXR1cm5WYWx1ZT1hLnJlc3VsdCl9fX19LG4ucmVtb3ZlRXZlbnQ9ZnVuY3Rpb24oYSxiLGMpe2EucmVtb3ZlRXZlbnRMaXN0ZW5lciYmYS5yZW1vdmVFdmVudExpc3RlbmVyKGIsYyl9LG4uRXZlbnQ9ZnVuY3Rpb24oYSxiKXtyZXR1cm4gdGhpcyBpbnN0YW5jZW9mIG4uRXZlbnQ/KGEmJmEudHlwZT8odGhpcy5vcmlnaW5hbEV2ZW50PWEsdGhpcy50eXBlPWEudHlwZSx0aGlzLmlzRGVmYXVsdFByZXZlbnRlZD1hLmRlZmF1bHRQcmV2ZW50ZWR8fHZvaWQgMD09PWEuZGVmYXVsdFByZXZlbnRlZCYmYS5yZXR1cm5WYWx1ZT09PSExP2dhOmhhKTp0aGlzLnR5cGU9YSxiJiZuLmV4dGVuZCh0aGlzLGIpLHRoaXMudGltZVN0YW1wPWEmJmEudGltZVN0YW1wfHxuLm5vdygpLHZvaWQodGhpc1tuLmV4cGFuZG9dPSEwKSk6bmV3IG4uRXZlbnQoYSxiKX0sbi5FdmVudC5wcm90b3R5cGU9e2NvbnN0cnVjdG9yOm4uRXZlbnQsaXNEZWZhdWx0UHJldmVudGVkOmhhLGlzUHJvcGFnYXRpb25TdG9wcGVkOmhhLGlzSW1tZWRpYXRlUHJvcGFnYXRpb25TdG9wcGVkOmhhLGlzU2ltdWxhdGVkOiExLHByZXZlbnREZWZhdWx0OmZ1bmN0aW9uKCl7dmFyIGE9dGhpcy5vcmlnaW5hbEV2ZW50O3RoaXMuaXNEZWZhdWx0UHJldmVudGVkPWdhLGEmJiF0aGlzLmlzU2ltdWxhdGVkJiZhLnByZXZlbnREZWZhdWx0KCl9LHN0b3BQcm9wYWdhdGlvbjpmdW5jdGlvbigpe3ZhciBhPXRoaXMub3JpZ2luYWxFdmVudDt0aGlzLmlzUHJvcGFnYXRpb25TdG9wcGVkPWdhLGEmJiF0aGlzLmlzU2ltdWxhdGVkJiZhLnN0b3BQcm9wYWdhdGlvbigpfSxzdG9wSW1tZWRpYXRlUHJvcGFnYXRpb246ZnVuY3Rpb24oKXt2YXIgYT10aGlzLm9yaWdpbmFsRXZlbnQ7dGhpcy5pc0ltbWVkaWF0ZVByb3BhZ2F0aW9uU3RvcHBlZD1nYSxhJiYhdGhpcy5pc1NpbXVsYXRlZCYmYS5zdG9wSW1tZWRpYXRlUHJvcGFnYXRpb24oKSx0aGlzLnN0b3BQcm9wYWdhdGlvbigpfX0sbi5lYWNoKHttb3VzZWVudGVyOlwibW91c2VvdmVyXCIsbW91c2VsZWF2ZTpcIm1vdXNlb3V0XCIscG9pbnRlcmVudGVyOlwicG9pbnRlcm92ZXJcIixwb2ludGVybGVhdmU6XCJwb2ludGVyb3V0XCJ9LGZ1bmN0aW9uKGEsYil7bi5ldmVudC5zcGVjaWFsW2FdPXtkZWxlZ2F0ZVR5cGU6YixiaW5kVHlwZTpiLGhhbmRsZTpmdW5jdGlvbihhKXt2YXIgYyxkPXRoaXMsZT1hLnJlbGF0ZWRUYXJnZXQsZj1hLmhhbmRsZU9iajtyZXR1cm4gZSYmKGU9PT1kfHxuLmNvbnRhaW5zKGQsZSkpfHwoYS50eXBlPWYub3JpZ1R5cGUsYz1mLmhhbmRsZXIuYXBwbHkodGhpcyxhcmd1bWVudHMpLGEudHlwZT1iKSxjfX19KSxuLmZuLmV4dGVuZCh7b246ZnVuY3Rpb24oYSxiLGMsZCl7cmV0dXJuIGphKHRoaXMsYSxiLGMsZCl9LG9uZTpmdW5jdGlvbihhLGIsYyxkKXtyZXR1cm4gamEodGhpcyxhLGIsYyxkLDEpfSxvZmY6ZnVuY3Rpb24oYSxiLGMpe3ZhciBkLGU7aWYoYSYmYS5wcmV2ZW50RGVmYXVsdCYmYS5oYW5kbGVPYmopcmV0dXJuIGQ9YS5oYW5kbGVPYmosbihhLmRlbGVnYXRlVGFyZ2V0KS5vZmYoZC5uYW1lc3BhY2U/ZC5vcmlnVHlwZStcIi5cIitkLm5hbWVzcGFjZTpkLm9yaWdUeXBlLGQuc2VsZWN0b3IsZC5oYW5kbGVyKSx0aGlzO2lmKFwib2JqZWN0XCI9PXR5cGVvZiBhKXtmb3IoZSBpbiBhKXRoaXMub2ZmKGUsYixhW2VdKTtyZXR1cm4gdGhpc31yZXR1cm4gYiE9PSExJiZcImZ1bmN0aW9uXCIhPXR5cGVvZiBifHwoYz1iLGI9dm9pZCAwKSxjPT09ITEmJihjPWhhKSx0aGlzLmVhY2goZnVuY3Rpb24oKXtuLmV2ZW50LnJlbW92ZSh0aGlzLGEsYyxiKX0pfX0pO3ZhciBrYT0vPCg/IWFyZWF8YnJ8Y29sfGVtYmVkfGhyfGltZ3xpbnB1dHxsaW5rfG1ldGF8cGFyYW0pKChbXFx3Oi1dKylbXj5dKilcXC8+L2dpLGxhPS88c2NyaXB0fDxzdHlsZXw8bGluay9pLG1hPS9jaGVja2VkXFxzKig/OltePV18PVxccyouY2hlY2tlZC4pL2ksbmE9L150cnVlXFwvKC4qKS8sb2E9L15cXHMqPCEoPzpcXFtDREFUQVxcW3wtLSl8KD86XFxdXFxdfC0tKT5cXHMqJC9nO2Z1bmN0aW9uIHBhKGEsYil7cmV0dXJuIG4ubm9kZU5hbWUoYSxcInRhYmxlXCIpJiZuLm5vZGVOYW1lKDExIT09Yi5ub2RlVHlwZT9iOmIuZmlyc3RDaGlsZCxcInRyXCIpP2EuZ2V0RWxlbWVudHNCeVRhZ05hbWUoXCJ0Ym9keVwiKVswXXx8YS5hcHBlbmRDaGlsZChhLm93bmVyRG9jdW1lbnQuY3JlYXRlRWxlbWVudChcInRib2R5XCIpKTphfWZ1bmN0aW9uIHFhKGEpe3JldHVybiBhLnR5cGU9KG51bGwhPT1hLmdldEF0dHJpYnV0ZShcInR5cGVcIikpK1wiL1wiK2EudHlwZSxhfWZ1bmN0aW9uIHJhKGEpe3ZhciBiPW5hLmV4ZWMoYS50eXBlKTtyZXR1cm4gYj9hLnR5cGU9YlsxXTphLnJlbW92ZUF0dHJpYnV0ZShcInR5cGVcIiksYX1mdW5jdGlvbiBzYShhLGIpe3ZhciBjLGQsZSxmLGcsaCxpLGo7aWYoMT09PWIubm9kZVR5cGUpe2lmKE4uaGFzRGF0YShhKSYmKGY9Ti5hY2Nlc3MoYSksZz1OLnNldChiLGYpLGo9Zi5ldmVudHMpKXtkZWxldGUgZy5oYW5kbGUsZy5ldmVudHM9e307Zm9yKGUgaW4gailmb3IoYz0wLGQ9altlXS5sZW5ndGg7ZD5jO2MrKyluLmV2ZW50LmFkZChiLGUsaltlXVtjXSl9Ty5oYXNEYXRhKGEpJiYoaD1PLmFjY2VzcyhhKSxpPW4uZXh0ZW5kKHt9LGgpLE8uc2V0KGIsaSkpfX1mdW5jdGlvbiB0YShhLGIpe3ZhciBjPWIubm9kZU5hbWUudG9Mb3dlckNhc2UoKTtcImlucHV0XCI9PT1jJiZYLnRlc3QoYS50eXBlKT9iLmNoZWNrZWQ9YS5jaGVja2VkOlwiaW5wdXRcIiE9PWMmJlwidGV4dGFyZWFcIiE9PWN8fChiLmRlZmF1bHRWYWx1ZT1hLmRlZmF1bHRWYWx1ZSl9ZnVuY3Rpb24gdWEoYSxiLGMsZCl7Yj1mLmFwcGx5KFtdLGIpO3ZhciBlLGcsaCxpLGosayxtPTAsbz1hLmxlbmd0aCxwPW8tMSxxPWJbMF0scj1uLmlzRnVuY3Rpb24ocSk7aWYocnx8bz4xJiZcInN0cmluZ1wiPT10eXBlb2YgcSYmIWwuY2hlY2tDbG9uZSYmbWEudGVzdChxKSlyZXR1cm4gYS5lYWNoKGZ1bmN0aW9uKGUpe3ZhciBmPWEuZXEoZSk7ciYmKGJbMF09cS5jYWxsKHRoaXMsZSxmLmh0bWwoKSkpLHVhKGYsYixjLGQpfSk7aWYobyYmKGU9Y2EoYixhWzBdLm93bmVyRG9jdW1lbnQsITEsYSxkKSxnPWUuZmlyc3RDaGlsZCwxPT09ZS5jaGlsZE5vZGVzLmxlbmd0aCYmKGU9ZyksZ3x8ZCkpe2ZvcihoPW4ubWFwKF8oZSxcInNjcmlwdFwiKSxxYSksaT1oLmxlbmd0aDtvPm07bSsrKWo9ZSxtIT09cCYmKGo9bi5jbG9uZShqLCEwLCEwKSxpJiZuLm1lcmdlKGgsXyhqLFwic2NyaXB0XCIpKSksYy5jYWxsKGFbbV0saixtKTtpZihpKWZvcihrPWhbaC5sZW5ndGgtMV0ub3duZXJEb2N1bWVudCxuLm1hcChoLHJhKSxtPTA7aT5tO20rKylqPWhbbV0sWi50ZXN0KGoudHlwZXx8XCJcIikmJiFOLmFjY2VzcyhqLFwiZ2xvYmFsRXZhbFwiKSYmbi5jb250YWlucyhrLGopJiYoai5zcmM/bi5fZXZhbFVybCYmbi5fZXZhbFVybChqLnNyYyk6bi5nbG9iYWxFdmFsKGoudGV4dENvbnRlbnQucmVwbGFjZShvYSxcIlwiKSkpfXJldHVybiBhfWZ1bmN0aW9uIHZhKGEsYixjKXtmb3IodmFyIGQsZT1iP24uZmlsdGVyKGIsYSk6YSxmPTA7bnVsbCE9KGQ9ZVtmXSk7ZisrKWN8fDEhPT1kLm5vZGVUeXBlfHxuLmNsZWFuRGF0YShfKGQpKSxkLnBhcmVudE5vZGUmJihjJiZuLmNvbnRhaW5zKGQub3duZXJEb2N1bWVudCxkKSYmYWEoXyhkLFwic2NyaXB0XCIpKSxkLnBhcmVudE5vZGUucmVtb3ZlQ2hpbGQoZCkpO3JldHVybiBhfW4uZXh0ZW5kKHtodG1sUHJlZmlsdGVyOmZ1bmN0aW9uKGEpe3JldHVybiBhLnJlcGxhY2Uoa2EsXCI8JDE+PC8kMj5cIil9LGNsb25lOmZ1bmN0aW9uKGEsYixjKXt2YXIgZCxlLGYsZyxoPWEuY2xvbmVOb2RlKCEwKSxpPW4uY29udGFpbnMoYS5vd25lckRvY3VtZW50LGEpO2lmKCEobC5ub0Nsb25lQ2hlY2tlZHx8MSE9PWEubm9kZVR5cGUmJjExIT09YS5ub2RlVHlwZXx8bi5pc1hNTERvYyhhKSkpZm9yKGc9XyhoKSxmPV8oYSksZD0wLGU9Zi5sZW5ndGg7ZT5kO2QrKyl0YShmW2RdLGdbZF0pO2lmKGIpaWYoYylmb3IoZj1mfHxfKGEpLGc9Z3x8XyhoKSxkPTAsZT1mLmxlbmd0aDtlPmQ7ZCsrKXNhKGZbZF0sZ1tkXSk7ZWxzZSBzYShhLGgpO3JldHVybiBnPV8oaCxcInNjcmlwdFwiKSxnLmxlbmd0aD4wJiZhYShnLCFpJiZfKGEsXCJzY3JpcHRcIikpLGh9LGNsZWFuRGF0YTpmdW5jdGlvbihhKXtmb3IodmFyIGIsYyxkLGU9bi5ldmVudC5zcGVjaWFsLGY9MDt2b2lkIDAhPT0oYz1hW2ZdKTtmKyspaWYoTChjKSl7aWYoYj1jW04uZXhwYW5kb10pe2lmKGIuZXZlbnRzKWZvcihkIGluIGIuZXZlbnRzKWVbZF0/bi5ldmVudC5yZW1vdmUoYyxkKTpuLnJlbW92ZUV2ZW50KGMsZCxiLmhhbmRsZSk7Y1tOLmV4cGFuZG9dPXZvaWQgMH1jW08uZXhwYW5kb10mJihjW08uZXhwYW5kb109dm9pZCAwKX19fSksbi5mbi5leHRlbmQoe2RvbU1hbmlwOnVhLGRldGFjaDpmdW5jdGlvbihhKXtyZXR1cm4gdmEodGhpcyxhLCEwKX0scmVtb3ZlOmZ1bmN0aW9uKGEpe3JldHVybiB2YSh0aGlzLGEpfSx0ZXh0OmZ1bmN0aW9uKGEpe3JldHVybiBLKHRoaXMsZnVuY3Rpb24oYSl7cmV0dXJuIHZvaWQgMD09PWE/bi50ZXh0KHRoaXMpOnRoaXMuZW1wdHkoKS5lYWNoKGZ1bmN0aW9uKCl7MSE9PXRoaXMubm9kZVR5cGUmJjExIT09dGhpcy5ub2RlVHlwZSYmOSE9PXRoaXMubm9kZVR5cGV8fCh0aGlzLnRleHRDb250ZW50PWEpfSl9LG51bGwsYSxhcmd1bWVudHMubGVuZ3RoKX0sYXBwZW5kOmZ1bmN0aW9uKCl7cmV0dXJuIHVhKHRoaXMsYXJndW1lbnRzLGZ1bmN0aW9uKGEpe2lmKDE9PT10aGlzLm5vZGVUeXBlfHwxMT09PXRoaXMubm9kZVR5cGV8fDk9PT10aGlzLm5vZGVUeXBlKXt2YXIgYj1wYSh0aGlzLGEpO2IuYXBwZW5kQ2hpbGQoYSl9fSl9LHByZXBlbmQ6ZnVuY3Rpb24oKXtyZXR1cm4gdWEodGhpcyxhcmd1bWVudHMsZnVuY3Rpb24oYSl7aWYoMT09PXRoaXMubm9kZVR5cGV8fDExPT09dGhpcy5ub2RlVHlwZXx8OT09PXRoaXMubm9kZVR5cGUpe3ZhciBiPXBhKHRoaXMsYSk7Yi5pbnNlcnRCZWZvcmUoYSxiLmZpcnN0Q2hpbGQpfX0pfSxiZWZvcmU6ZnVuY3Rpb24oKXtyZXR1cm4gdWEodGhpcyxhcmd1bWVudHMsZnVuY3Rpb24oYSl7dGhpcy5wYXJlbnROb2RlJiZ0aGlzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGEsdGhpcyl9KX0sYWZ0ZXI6ZnVuY3Rpb24oKXtyZXR1cm4gdWEodGhpcyxhcmd1bWVudHMsZnVuY3Rpb24oYSl7dGhpcy5wYXJlbnROb2RlJiZ0aGlzLnBhcmVudE5vZGUuaW5zZXJ0QmVmb3JlKGEsdGhpcy5uZXh0U2libGluZyl9KX0sZW1wdHk6ZnVuY3Rpb24oKXtmb3IodmFyIGEsYj0wO251bGwhPShhPXRoaXNbYl0pO2IrKykxPT09YS5ub2RlVHlwZSYmKG4uY2xlYW5EYXRhKF8oYSwhMSkpLGEudGV4dENvbnRlbnQ9XCJcIik7cmV0dXJuIHRoaXN9LGNsb25lOmZ1bmN0aW9uKGEsYil7cmV0dXJuIGE9bnVsbD09YT8hMTphLGI9bnVsbD09Yj9hOmIsdGhpcy5tYXAoZnVuY3Rpb24oKXtyZXR1cm4gbi5jbG9uZSh0aGlzLGEsYil9KX0saHRtbDpmdW5jdGlvbihhKXtyZXR1cm4gSyh0aGlzLGZ1bmN0aW9uKGEpe3ZhciBiPXRoaXNbMF18fHt9LGM9MCxkPXRoaXMubGVuZ3RoO2lmKHZvaWQgMD09PWEmJjE9PT1iLm5vZGVUeXBlKXJldHVybiBiLmlubmVySFRNTDtpZihcInN0cmluZ1wiPT10eXBlb2YgYSYmIWxhLnRlc3QoYSkmJiEkWyhZLmV4ZWMoYSl8fFtcIlwiLFwiXCJdKVsxXS50b0xvd2VyQ2FzZSgpXSl7YT1uLmh0bWxQcmVmaWx0ZXIoYSk7dHJ5e2Zvcig7ZD5jO2MrKyliPXRoaXNbY118fHt9LDE9PT1iLm5vZGVUeXBlJiYobi5jbGVhbkRhdGEoXyhiLCExKSksYi5pbm5lckhUTUw9YSk7Yj0wfWNhdGNoKGUpe319YiYmdGhpcy5lbXB0eSgpLmFwcGVuZChhKX0sbnVsbCxhLGFyZ3VtZW50cy5sZW5ndGgpfSxyZXBsYWNlV2l0aDpmdW5jdGlvbigpe3ZhciBhPVtdO3JldHVybiB1YSh0aGlzLGFyZ3VtZW50cyxmdW5jdGlvbihiKXt2YXIgYz10aGlzLnBhcmVudE5vZGU7bi5pbkFycmF5KHRoaXMsYSk8MCYmKG4uY2xlYW5EYXRhKF8odGhpcykpLGMmJmMucmVwbGFjZUNoaWxkKGIsdGhpcykpfSxhKX19KSxuLmVhY2goe2FwcGVuZFRvOlwiYXBwZW5kXCIscHJlcGVuZFRvOlwicHJlcGVuZFwiLGluc2VydEJlZm9yZTpcImJlZm9yZVwiLGluc2VydEFmdGVyOlwiYWZ0ZXJcIixyZXBsYWNlQWxsOlwicmVwbGFjZVdpdGhcIn0sZnVuY3Rpb24oYSxiKXtuLmZuW2FdPWZ1bmN0aW9uKGEpe2Zvcih2YXIgYyxkPVtdLGU9bihhKSxmPWUubGVuZ3RoLTEsaD0wO2Y+PWg7aCsrKWM9aD09PWY/dGhpczp0aGlzLmNsb25lKCEwKSxuKGVbaF0pW2JdKGMpLGcuYXBwbHkoZCxjLmdldCgpKTtyZXR1cm4gdGhpcy5wdXNoU3RhY2soZCl9fSk7dmFyIHdhLHhhPXtIVE1MOlwiYmxvY2tcIixCT0RZOlwiYmxvY2tcIn07ZnVuY3Rpb24geWEoYSxiKXt2YXIgYz1uKGIuY3JlYXRlRWxlbWVudChhKSkuYXBwZW5kVG8oYi5ib2R5KSxkPW4uY3NzKGNbMF0sXCJkaXNwbGF5XCIpO3JldHVybiBjLmRldGFjaCgpLGR9ZnVuY3Rpb24gemEoYSl7dmFyIGI9ZCxjPXhhW2FdO3JldHVybiBjfHwoYz15YShhLGIpLFwibm9uZVwiIT09YyYmY3x8KHdhPSh3YXx8bihcIjxpZnJhbWUgZnJhbWVib3JkZXI9JzAnIHdpZHRoPScwJyBoZWlnaHQ9JzAnLz5cIikpLmFwcGVuZFRvKGIuZG9jdW1lbnRFbGVtZW50KSxiPXdhWzBdLmNvbnRlbnREb2N1bWVudCxiLndyaXRlKCksYi5jbG9zZSgpLGM9eWEoYSxiKSx3YS5kZXRhY2goKSkseGFbYV09YyksY312YXIgQWE9L15tYXJnaW4vLEJhPW5ldyBSZWdFeHAoXCJeKFwiK1MrXCIpKD8hcHgpW2EteiVdKyRcIixcImlcIiksQ2E9ZnVuY3Rpb24oYil7dmFyIGM9Yi5vd25lckRvY3VtZW50LmRlZmF1bHRWaWV3O3JldHVybiBjJiZjLm9wZW5lcnx8KGM9YSksYy5nZXRDb21wdXRlZFN0eWxlKGIpfSxEYT1mdW5jdGlvbihhLGIsYyxkKXt2YXIgZSxmLGc9e307Zm9yKGYgaW4gYilnW2ZdPWEuc3R5bGVbZl0sYS5zdHlsZVtmXT1iW2ZdO2U9Yy5hcHBseShhLGR8fFtdKTtmb3IoZiBpbiBiKWEuc3R5bGVbZl09Z1tmXTtyZXR1cm4gZX0sRWE9ZC5kb2N1bWVudEVsZW1lbnQ7IWZ1bmN0aW9uKCl7dmFyIGIsYyxlLGYsZz1kLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksaD1kLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIik7aWYoaC5zdHlsZSl7aC5zdHlsZS5iYWNrZ3JvdW5kQ2xpcD1cImNvbnRlbnQtYm94XCIsaC5jbG9uZU5vZGUoITApLnN0eWxlLmJhY2tncm91bmRDbGlwPVwiXCIsbC5jbGVhckNsb25lU3R5bGU9XCJjb250ZW50LWJveFwiPT09aC5zdHlsZS5iYWNrZ3JvdW5kQ2xpcCxnLnN0eWxlLmNzc1RleHQ9XCJib3JkZXI6MDt3aWR0aDo4cHg7aGVpZ2h0OjA7dG9wOjA7bGVmdDotOTk5OXB4O3BhZGRpbmc6MDttYXJnaW4tdG9wOjFweDtwb3NpdGlvbjphYnNvbHV0ZVwiLGcuYXBwZW5kQ2hpbGQoaCk7ZnVuY3Rpb24gaSgpe2guc3R5bGUuY3NzVGV4dD1cIi13ZWJraXQtYm94LXNpemluZzpib3JkZXItYm94Oy1tb3otYm94LXNpemluZzpib3JkZXItYm94O2JveC1zaXppbmc6Ym9yZGVyLWJveDtwb3NpdGlvbjpyZWxhdGl2ZTtkaXNwbGF5OmJsb2NrO21hcmdpbjphdXRvO2JvcmRlcjoxcHg7cGFkZGluZzoxcHg7dG9wOjElO3dpZHRoOjUwJVwiLGguaW5uZXJIVE1MPVwiXCIsRWEuYXBwZW5kQ2hpbGQoZyk7dmFyIGQ9YS5nZXRDb21wdXRlZFN0eWxlKGgpO2I9XCIxJVwiIT09ZC50b3AsZj1cIjJweFwiPT09ZC5tYXJnaW5MZWZ0LGM9XCI0cHhcIj09PWQud2lkdGgsaC5zdHlsZS5tYXJnaW5SaWdodD1cIjUwJVwiLGU9XCI0cHhcIj09PWQubWFyZ2luUmlnaHQsRWEucmVtb3ZlQ2hpbGQoZyl9bi5leHRlbmQobCx7cGl4ZWxQb3NpdGlvbjpmdW5jdGlvbigpe3JldHVybiBpKCksYn0sYm94U2l6aW5nUmVsaWFibGU6ZnVuY3Rpb24oKXtyZXR1cm4gbnVsbD09YyYmaSgpLGN9LHBpeGVsTWFyZ2luUmlnaHQ6ZnVuY3Rpb24oKXtyZXR1cm4gbnVsbD09YyYmaSgpLGV9LHJlbGlhYmxlTWFyZ2luTGVmdDpmdW5jdGlvbigpe3JldHVybiBudWxsPT1jJiZpKCksZn0scmVsaWFibGVNYXJnaW5SaWdodDpmdW5jdGlvbigpe3ZhciBiLGM9aC5hcHBlbmRDaGlsZChkLmNyZWF0ZUVsZW1lbnQoXCJkaXZcIikpO3JldHVybiBjLnN0eWxlLmNzc1RleHQ9aC5zdHlsZS5jc3NUZXh0PVwiLXdlYmtpdC1ib3gtc2l6aW5nOmNvbnRlbnQtYm94O2JveC1zaXppbmc6Y29udGVudC1ib3g7ZGlzcGxheTpibG9jazttYXJnaW46MDtib3JkZXI6MDtwYWRkaW5nOjBcIixjLnN0eWxlLm1hcmdpblJpZ2h0PWMuc3R5bGUud2lkdGg9XCIwXCIsaC5zdHlsZS53aWR0aD1cIjFweFwiLEVhLmFwcGVuZENoaWxkKGcpLGI9IXBhcnNlRmxvYXQoYS5nZXRDb21wdXRlZFN0eWxlKGMpLm1hcmdpblJpZ2h0KSxFYS5yZW1vdmVDaGlsZChnKSxoLnJlbW92ZUNoaWxkKGMpLGJ9fSl9fSgpO2Z1bmN0aW9uIEZhKGEsYixjKXt2YXIgZCxlLGYsZyxoPWEuc3R5bGU7cmV0dXJuIGM9Y3x8Q2EoYSksZz1jP2MuZ2V0UHJvcGVydHlWYWx1ZShiKXx8Y1tiXTp2b2lkIDAsXCJcIiE9PWcmJnZvaWQgMCE9PWd8fG4uY29udGFpbnMoYS5vd25lckRvY3VtZW50LGEpfHwoZz1uLnN0eWxlKGEsYikpLGMmJiFsLnBpeGVsTWFyZ2luUmlnaHQoKSYmQmEudGVzdChnKSYmQWEudGVzdChiKSYmKGQ9aC53aWR0aCxlPWgubWluV2lkdGgsZj1oLm1heFdpZHRoLGgubWluV2lkdGg9aC5tYXhXaWR0aD1oLndpZHRoPWcsZz1jLndpZHRoLGgud2lkdGg9ZCxoLm1pbldpZHRoPWUsaC5tYXhXaWR0aD1mKSx2b2lkIDAhPT1nP2crXCJcIjpnfWZ1bmN0aW9uIEdhKGEsYil7cmV0dXJue2dldDpmdW5jdGlvbigpe3JldHVybiBhKCk/dm9pZCBkZWxldGUgdGhpcy5nZXQ6KHRoaXMuZ2V0PWIpLmFwcGx5KHRoaXMsYXJndW1lbnRzKX19fXZhciBIYT0vXihub25lfHRhYmxlKD8hLWNbZWFdKS4rKS8sSWE9e3Bvc2l0aW9uOlwiYWJzb2x1dGVcIix2aXNpYmlsaXR5OlwiaGlkZGVuXCIsZGlzcGxheTpcImJsb2NrXCJ9LEphPXtsZXR0ZXJTcGFjaW5nOlwiMFwiLGZvbnRXZWlnaHQ6XCI0MDBcIn0sS2E9W1wiV2Via2l0XCIsXCJPXCIsXCJNb3pcIixcIm1zXCJdLExhPWQuY3JlYXRlRWxlbWVudChcImRpdlwiKS5zdHlsZTtmdW5jdGlvbiBNYShhKXtpZihhIGluIExhKXJldHVybiBhO3ZhciBiPWFbMF0udG9VcHBlckNhc2UoKSthLnNsaWNlKDEpLGM9S2EubGVuZ3RoO3doaWxlKGMtLSlpZihhPUthW2NdK2IsYSBpbiBMYSlyZXR1cm4gYX1mdW5jdGlvbiBOYShhLGIsYyl7dmFyIGQ9VC5leGVjKGIpO3JldHVybiBkP01hdGgubWF4KDAsZFsyXS0oY3x8MCkpKyhkWzNdfHxcInB4XCIpOmJ9ZnVuY3Rpb24gT2EoYSxiLGMsZCxlKXtmb3IodmFyIGY9Yz09PShkP1wiYm9yZGVyXCI6XCJjb250ZW50XCIpPzQ6XCJ3aWR0aFwiPT09Yj8xOjAsZz0wOzQ+ZjtmKz0yKVwibWFyZ2luXCI9PT1jJiYoZys9bi5jc3MoYSxjK1VbZl0sITAsZSkpLGQ/KFwiY29udGVudFwiPT09YyYmKGctPW4uY3NzKGEsXCJwYWRkaW5nXCIrVVtmXSwhMCxlKSksXCJtYXJnaW5cIiE9PWMmJihnLT1uLmNzcyhhLFwiYm9yZGVyXCIrVVtmXStcIldpZHRoXCIsITAsZSkpKTooZys9bi5jc3MoYSxcInBhZGRpbmdcIitVW2ZdLCEwLGUpLFwicGFkZGluZ1wiIT09YyYmKGcrPW4uY3NzKGEsXCJib3JkZXJcIitVW2ZdK1wiV2lkdGhcIiwhMCxlKSkpO3JldHVybiBnfWZ1bmN0aW9uIFBhKGEsYixjKXt2YXIgZD0hMCxlPVwid2lkdGhcIj09PWI/YS5vZmZzZXRXaWR0aDphLm9mZnNldEhlaWdodCxmPUNhKGEpLGc9XCJib3JkZXItYm94XCI9PT1uLmNzcyhhLFwiYm94U2l6aW5nXCIsITEsZik7aWYoMD49ZXx8bnVsbD09ZSl7aWYoZT1GYShhLGIsZiksKDA+ZXx8bnVsbD09ZSkmJihlPWEuc3R5bGVbYl0pLEJhLnRlc3QoZSkpcmV0dXJuIGU7ZD1nJiYobC5ib3hTaXppbmdSZWxpYWJsZSgpfHxlPT09YS5zdHlsZVtiXSksZT1wYXJzZUZsb2F0KGUpfHwwfXJldHVybiBlK09hKGEsYixjfHwoZz9cImJvcmRlclwiOlwiY29udGVudFwiKSxkLGYpK1wicHhcIn1mdW5jdGlvbiBRYShhLGIpe2Zvcih2YXIgYyxkLGUsZj1bXSxnPTAsaD1hLmxlbmd0aDtoPmc7ZysrKWQ9YVtnXSxkLnN0eWxlJiYoZltnXT1OLmdldChkLFwib2xkZGlzcGxheVwiKSxjPWQuc3R5bGUuZGlzcGxheSxiPyhmW2ddfHxcIm5vbmVcIiE9PWN8fChkLnN0eWxlLmRpc3BsYXk9XCJcIiksXCJcIj09PWQuc3R5bGUuZGlzcGxheSYmVihkKSYmKGZbZ109Ti5hY2Nlc3MoZCxcIm9sZGRpc3BsYXlcIix6YShkLm5vZGVOYW1lKSkpKTooZT1WKGQpLFwibm9uZVwiPT09YyYmZXx8Ti5zZXQoZCxcIm9sZGRpc3BsYXlcIixlP2M6bi5jc3MoZCxcImRpc3BsYXlcIikpKSk7Zm9yKGc9MDtoPmc7ZysrKWQ9YVtnXSxkLnN0eWxlJiYoYiYmXCJub25lXCIhPT1kLnN0eWxlLmRpc3BsYXkmJlwiXCIhPT1kLnN0eWxlLmRpc3BsYXl8fChkLnN0eWxlLmRpc3BsYXk9Yj9mW2ddfHxcIlwiOlwibm9uZVwiKSk7cmV0dXJuIGF9bi5leHRlbmQoe2Nzc0hvb2tzOntvcGFjaXR5OntnZXQ6ZnVuY3Rpb24oYSxiKXtpZihiKXt2YXIgYz1GYShhLFwib3BhY2l0eVwiKTtyZXR1cm5cIlwiPT09Yz9cIjFcIjpjfX19fSxjc3NOdW1iZXI6e2FuaW1hdGlvbkl0ZXJhdGlvbkNvdW50OiEwLGNvbHVtbkNvdW50OiEwLGZpbGxPcGFjaXR5OiEwLGZsZXhHcm93OiEwLGZsZXhTaHJpbms6ITAsZm9udFdlaWdodDohMCxsaW5lSGVpZ2h0OiEwLG9wYWNpdHk6ITAsb3JkZXI6ITAsb3JwaGFuczohMCx3aWRvd3M6ITAsekluZGV4OiEwLHpvb206ITB9LGNzc1Byb3BzOntcImZsb2F0XCI6XCJjc3NGbG9hdFwifSxzdHlsZTpmdW5jdGlvbihhLGIsYyxkKXtpZihhJiYzIT09YS5ub2RlVHlwZSYmOCE9PWEubm9kZVR5cGUmJmEuc3R5bGUpe3ZhciBlLGYsZyxoPW4uY2FtZWxDYXNlKGIpLGk9YS5zdHlsZTtyZXR1cm4gYj1uLmNzc1Byb3BzW2hdfHwobi5jc3NQcm9wc1toXT1NYShoKXx8aCksZz1uLmNzc0hvb2tzW2JdfHxuLmNzc0hvb2tzW2hdLHZvaWQgMD09PWM/ZyYmXCJnZXRcImluIGcmJnZvaWQgMCE9PShlPWcuZ2V0KGEsITEsZCkpP2U6aVtiXTooZj10eXBlb2YgYyxcInN0cmluZ1wiPT09ZiYmKGU9VC5leGVjKGMpKSYmZVsxXSYmKGM9VyhhLGIsZSksZj1cIm51bWJlclwiKSxudWxsIT1jJiZjPT09YyYmKFwibnVtYmVyXCI9PT1mJiYoYys9ZSYmZVszXXx8KG4uY3NzTnVtYmVyW2hdP1wiXCI6XCJweFwiKSksbC5jbGVhckNsb25lU3R5bGV8fFwiXCIhPT1jfHwwIT09Yi5pbmRleE9mKFwiYmFja2dyb3VuZFwiKXx8KGlbYl09XCJpbmhlcml0XCIpLGcmJlwic2V0XCJpbiBnJiZ2b2lkIDA9PT0oYz1nLnNldChhLGMsZCkpfHwoaVtiXT1jKSksdm9pZCAwKX19LGNzczpmdW5jdGlvbihhLGIsYyxkKXt2YXIgZSxmLGcsaD1uLmNhbWVsQ2FzZShiKTtyZXR1cm4gYj1uLmNzc1Byb3BzW2hdfHwobi5jc3NQcm9wc1toXT1NYShoKXx8aCksZz1uLmNzc0hvb2tzW2JdfHxuLmNzc0hvb2tzW2hdLGcmJlwiZ2V0XCJpbiBnJiYoZT1nLmdldChhLCEwLGMpKSx2b2lkIDA9PT1lJiYoZT1GYShhLGIsZCkpLFwibm9ybWFsXCI9PT1lJiZiIGluIEphJiYoZT1KYVtiXSksXCJcIj09PWN8fGM/KGY9cGFyc2VGbG9hdChlKSxjPT09ITB8fGlzRmluaXRlKGYpP2Z8fDA6ZSk6ZX19KSxuLmVhY2goW1wiaGVpZ2h0XCIsXCJ3aWR0aFwiXSxmdW5jdGlvbihhLGIpe24uY3NzSG9va3NbYl09e2dldDpmdW5jdGlvbihhLGMsZCl7cmV0dXJuIGM/SGEudGVzdChuLmNzcyhhLFwiZGlzcGxheVwiKSkmJjA9PT1hLm9mZnNldFdpZHRoP0RhKGEsSWEsZnVuY3Rpb24oKXtyZXR1cm4gUGEoYSxiLGQpfSk6UGEoYSxiLGQpOnZvaWQgMH0sc2V0OmZ1bmN0aW9uKGEsYyxkKXt2YXIgZSxmPWQmJkNhKGEpLGc9ZCYmT2EoYSxiLGQsXCJib3JkZXItYm94XCI9PT1uLmNzcyhhLFwiYm94U2l6aW5nXCIsITEsZiksZik7cmV0dXJuIGcmJihlPVQuZXhlYyhjKSkmJlwicHhcIiE9PShlWzNdfHxcInB4XCIpJiYoYS5zdHlsZVtiXT1jLGM9bi5jc3MoYSxiKSksTmEoYSxjLGcpfX19KSxuLmNzc0hvb2tzLm1hcmdpbkxlZnQ9R2EobC5yZWxpYWJsZU1hcmdpbkxlZnQsZnVuY3Rpb24oYSxiKXtyZXR1cm4gYj8ocGFyc2VGbG9hdChGYShhLFwibWFyZ2luTGVmdFwiKSl8fGEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdC1EYShhLHttYXJnaW5MZWZ0OjB9LGZ1bmN0aW9uKCl7cmV0dXJuIGEuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkubGVmdH0pKStcInB4XCI6dm9pZCAwfSksbi5jc3NIb29rcy5tYXJnaW5SaWdodD1HYShsLnJlbGlhYmxlTWFyZ2luUmlnaHQsZnVuY3Rpb24oYSxiKXtyZXR1cm4gYj9EYShhLHtkaXNwbGF5OlwiaW5saW5lLWJsb2NrXCJ9LEZhLFthLFwibWFyZ2luUmlnaHRcIl0pOnZvaWQgMH0pLG4uZWFjaCh7bWFyZ2luOlwiXCIscGFkZGluZzpcIlwiLGJvcmRlcjpcIldpZHRoXCJ9LGZ1bmN0aW9uKGEsYil7bi5jc3NIb29rc1thK2JdPXtleHBhbmQ6ZnVuY3Rpb24oYyl7Zm9yKHZhciBkPTAsZT17fSxmPVwic3RyaW5nXCI9PXR5cGVvZiBjP2Muc3BsaXQoXCIgXCIpOltjXTs0PmQ7ZCsrKWVbYStVW2RdK2JdPWZbZF18fGZbZC0yXXx8ZlswXTtyZXR1cm4gZX19LEFhLnRlc3QoYSl8fChuLmNzc0hvb2tzW2ErYl0uc2V0PU5hKX0pLG4uZm4uZXh0ZW5kKHtjc3M6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gSyh0aGlzLGZ1bmN0aW9uKGEsYixjKXt2YXIgZCxlLGY9e30sZz0wO2lmKG4uaXNBcnJheShiKSl7Zm9yKGQ9Q2EoYSksZT1iLmxlbmd0aDtlPmc7ZysrKWZbYltnXV09bi5jc3MoYSxiW2ddLCExLGQpO3JldHVybiBmfXJldHVybiB2b2lkIDAhPT1jP24uc3R5bGUoYSxiLGMpOm4uY3NzKGEsYil9LGEsYixhcmd1bWVudHMubGVuZ3RoPjEpfSxzaG93OmZ1bmN0aW9uKCl7cmV0dXJuIFFhKHRoaXMsITApfSxoaWRlOmZ1bmN0aW9uKCl7cmV0dXJuIFFhKHRoaXMpfSx0b2dnbGU6ZnVuY3Rpb24oYSl7cmV0dXJuXCJib29sZWFuXCI9PXR5cGVvZiBhP2E/dGhpcy5zaG93KCk6dGhpcy5oaWRlKCk6dGhpcy5lYWNoKGZ1bmN0aW9uKCl7Vih0aGlzKT9uKHRoaXMpLnNob3coKTpuKHRoaXMpLmhpZGUoKX0pfX0pO2Z1bmN0aW9uIFJhKGEsYixjLGQsZSl7cmV0dXJuIG5ldyBSYS5wcm90b3R5cGUuaW5pdChhLGIsYyxkLGUpfW4uVHdlZW49UmEsUmEucHJvdG90eXBlPXtjb25zdHJ1Y3RvcjpSYSxpbml0OmZ1bmN0aW9uKGEsYixjLGQsZSxmKXt0aGlzLmVsZW09YSx0aGlzLnByb3A9Yyx0aGlzLmVhc2luZz1lfHxuLmVhc2luZy5fZGVmYXVsdCx0aGlzLm9wdGlvbnM9Yix0aGlzLnN0YXJ0PXRoaXMubm93PXRoaXMuY3VyKCksdGhpcy5lbmQ9ZCx0aGlzLnVuaXQ9Znx8KG4uY3NzTnVtYmVyW2NdP1wiXCI6XCJweFwiKX0sY3VyOmZ1bmN0aW9uKCl7dmFyIGE9UmEucHJvcEhvb2tzW3RoaXMucHJvcF07cmV0dXJuIGEmJmEuZ2V0P2EuZ2V0KHRoaXMpOlJhLnByb3BIb29rcy5fZGVmYXVsdC5nZXQodGhpcyl9LHJ1bjpmdW5jdGlvbihhKXt2YXIgYixjPVJhLnByb3BIb29rc1t0aGlzLnByb3BdO3JldHVybiB0aGlzLm9wdGlvbnMuZHVyYXRpb24/dGhpcy5wb3M9Yj1uLmVhc2luZ1t0aGlzLmVhc2luZ10oYSx0aGlzLm9wdGlvbnMuZHVyYXRpb24qYSwwLDEsdGhpcy5vcHRpb25zLmR1cmF0aW9uKTp0aGlzLnBvcz1iPWEsdGhpcy5ub3c9KHRoaXMuZW5kLXRoaXMuc3RhcnQpKmIrdGhpcy5zdGFydCx0aGlzLm9wdGlvbnMuc3RlcCYmdGhpcy5vcHRpb25zLnN0ZXAuY2FsbCh0aGlzLmVsZW0sdGhpcy5ub3csdGhpcyksYyYmYy5zZXQ/Yy5zZXQodGhpcyk6UmEucHJvcEhvb2tzLl9kZWZhdWx0LnNldCh0aGlzKSx0aGlzfX0sUmEucHJvdG90eXBlLmluaXQucHJvdG90eXBlPVJhLnByb3RvdHlwZSxSYS5wcm9wSG9va3M9e19kZWZhdWx0OntnZXQ6ZnVuY3Rpb24oYSl7dmFyIGI7cmV0dXJuIDEhPT1hLmVsZW0ubm9kZVR5cGV8fG51bGwhPWEuZWxlbVthLnByb3BdJiZudWxsPT1hLmVsZW0uc3R5bGVbYS5wcm9wXT9hLmVsZW1bYS5wcm9wXTooYj1uLmNzcyhhLmVsZW0sYS5wcm9wLFwiXCIpLGImJlwiYXV0b1wiIT09Yj9iOjApfSxzZXQ6ZnVuY3Rpb24oYSl7bi5meC5zdGVwW2EucHJvcF0/bi5meC5zdGVwW2EucHJvcF0oYSk6MSE9PWEuZWxlbS5ub2RlVHlwZXx8bnVsbD09YS5lbGVtLnN0eWxlW24uY3NzUHJvcHNbYS5wcm9wXV0mJiFuLmNzc0hvb2tzW2EucHJvcF0/YS5lbGVtW2EucHJvcF09YS5ub3c6bi5zdHlsZShhLmVsZW0sYS5wcm9wLGEubm93K2EudW5pdCl9fX0sUmEucHJvcEhvb2tzLnNjcm9sbFRvcD1SYS5wcm9wSG9va3Muc2Nyb2xsTGVmdD17c2V0OmZ1bmN0aW9uKGEpe2EuZWxlbS5ub2RlVHlwZSYmYS5lbGVtLnBhcmVudE5vZGUmJihhLmVsZW1bYS5wcm9wXT1hLm5vdyl9fSxuLmVhc2luZz17bGluZWFyOmZ1bmN0aW9uKGEpe3JldHVybiBhfSxzd2luZzpmdW5jdGlvbihhKXtyZXR1cm4uNS1NYXRoLmNvcyhhKk1hdGguUEkpLzJ9LF9kZWZhdWx0Olwic3dpbmdcIn0sbi5meD1SYS5wcm90b3R5cGUuaW5pdCxuLmZ4LnN0ZXA9e307dmFyIFNhLFRhLFVhPS9eKD86dG9nZ2xlfHNob3d8aGlkZSkkLyxWYT0vcXVldWVIb29rcyQvO2Z1bmN0aW9uIFdhKCl7cmV0dXJuIGEuc2V0VGltZW91dChmdW5jdGlvbigpe1NhPXZvaWQgMH0pLFNhPW4ubm93KCl9ZnVuY3Rpb24gWGEoYSxiKXt2YXIgYyxkPTAsZT17aGVpZ2h0OmF9O2ZvcihiPWI/MTowOzQ+ZDtkKz0yLWIpYz1VW2RdLGVbXCJtYXJnaW5cIitjXT1lW1wicGFkZGluZ1wiK2NdPWE7cmV0dXJuIGImJihlLm9wYWNpdHk9ZS53aWR0aD1hKSxlfWZ1bmN0aW9uIFlhKGEsYixjKXtmb3IodmFyIGQsZT0oX2EudHdlZW5lcnNbYl18fFtdKS5jb25jYXQoX2EudHdlZW5lcnNbXCIqXCJdKSxmPTAsZz1lLmxlbmd0aDtnPmY7ZisrKWlmKGQ9ZVtmXS5jYWxsKGMsYixhKSlyZXR1cm4gZH1mdW5jdGlvbiBaYShhLGIsYyl7dmFyIGQsZSxmLGcsaCxpLGosayxsPXRoaXMsbT17fSxvPWEuc3R5bGUscD1hLm5vZGVUeXBlJiZWKGEpLHE9Ti5nZXQoYSxcImZ4c2hvd1wiKTtjLnF1ZXVlfHwoaD1uLl9xdWV1ZUhvb2tzKGEsXCJmeFwiKSxudWxsPT1oLnVucXVldWVkJiYoaC51bnF1ZXVlZD0wLGk9aC5lbXB0eS5maXJlLGguZW1wdHkuZmlyZT1mdW5jdGlvbigpe2gudW5xdWV1ZWR8fGkoKX0pLGgudW5xdWV1ZWQrKyxsLmFsd2F5cyhmdW5jdGlvbigpe2wuYWx3YXlzKGZ1bmN0aW9uKCl7aC51bnF1ZXVlZC0tLG4ucXVldWUoYSxcImZ4XCIpLmxlbmd0aHx8aC5lbXB0eS5maXJlKCl9KX0pKSwxPT09YS5ub2RlVHlwZSYmKFwiaGVpZ2h0XCJpbiBifHxcIndpZHRoXCJpbiBiKSYmKGMub3ZlcmZsb3c9W28ub3ZlcmZsb3csby5vdmVyZmxvd1gsby5vdmVyZmxvd1ldLGo9bi5jc3MoYSxcImRpc3BsYXlcIiksaz1cIm5vbmVcIj09PWo/Ti5nZXQoYSxcIm9sZGRpc3BsYXlcIil8fHphKGEubm9kZU5hbWUpOmosXCJpbmxpbmVcIj09PWsmJlwibm9uZVwiPT09bi5jc3MoYSxcImZsb2F0XCIpJiYoby5kaXNwbGF5PVwiaW5saW5lLWJsb2NrXCIpKSxjLm92ZXJmbG93JiYoby5vdmVyZmxvdz1cImhpZGRlblwiLGwuYWx3YXlzKGZ1bmN0aW9uKCl7by5vdmVyZmxvdz1jLm92ZXJmbG93WzBdLG8ub3ZlcmZsb3dYPWMub3ZlcmZsb3dbMV0sby5vdmVyZmxvd1k9Yy5vdmVyZmxvd1syXX0pKTtmb3IoZCBpbiBiKWlmKGU9YltkXSxVYS5leGVjKGUpKXtpZihkZWxldGUgYltkXSxmPWZ8fFwidG9nZ2xlXCI9PT1lLGU9PT0ocD9cImhpZGVcIjpcInNob3dcIikpe2lmKFwic2hvd1wiIT09ZXx8IXF8fHZvaWQgMD09PXFbZF0pY29udGludWU7cD0hMH1tW2RdPXEmJnFbZF18fG4uc3R5bGUoYSxkKX1lbHNlIGo9dm9pZCAwO2lmKG4uaXNFbXB0eU9iamVjdChtKSlcImlubGluZVwiPT09KFwibm9uZVwiPT09aj96YShhLm5vZGVOYW1lKTpqKSYmKG8uZGlzcGxheT1qKTtlbHNle3E/XCJoaWRkZW5cImluIHEmJihwPXEuaGlkZGVuKTpxPU4uYWNjZXNzKGEsXCJmeHNob3dcIix7fSksZiYmKHEuaGlkZGVuPSFwKSxwP24oYSkuc2hvdygpOmwuZG9uZShmdW5jdGlvbigpe24oYSkuaGlkZSgpfSksbC5kb25lKGZ1bmN0aW9uKCl7dmFyIGI7Ti5yZW1vdmUoYSxcImZ4c2hvd1wiKTtmb3IoYiBpbiBtKW4uc3R5bGUoYSxiLG1bYl0pfSk7Zm9yKGQgaW4gbSlnPVlhKHA/cVtkXTowLGQsbCksZCBpbiBxfHwocVtkXT1nLnN0YXJ0LHAmJihnLmVuZD1nLnN0YXJ0LGcuc3RhcnQ9XCJ3aWR0aFwiPT09ZHx8XCJoZWlnaHRcIj09PWQ/MTowKSl9fWZ1bmN0aW9uICRhKGEsYil7dmFyIGMsZCxlLGYsZztmb3IoYyBpbiBhKWlmKGQ9bi5jYW1lbENhc2UoYyksZT1iW2RdLGY9YVtjXSxuLmlzQXJyYXkoZikmJihlPWZbMV0sZj1hW2NdPWZbMF0pLGMhPT1kJiYoYVtkXT1mLGRlbGV0ZSBhW2NdKSxnPW4uY3NzSG9va3NbZF0sZyYmXCJleHBhbmRcImluIGcpe2Y9Zy5leHBhbmQoZiksZGVsZXRlIGFbZF07Zm9yKGMgaW4gZiljIGluIGF8fChhW2NdPWZbY10sYltjXT1lKX1lbHNlIGJbZF09ZX1mdW5jdGlvbiBfYShhLGIsYyl7dmFyIGQsZSxmPTAsZz1fYS5wcmVmaWx0ZXJzLmxlbmd0aCxoPW4uRGVmZXJyZWQoKS5hbHdheXMoZnVuY3Rpb24oKXtkZWxldGUgaS5lbGVtfSksaT1mdW5jdGlvbigpe2lmKGUpcmV0dXJuITE7Zm9yKHZhciBiPVNhfHxXYSgpLGM9TWF0aC5tYXgoMCxqLnN0YXJ0VGltZStqLmR1cmF0aW9uLWIpLGQ9Yy9qLmR1cmF0aW9ufHwwLGY9MS1kLGc9MCxpPWoudHdlZW5zLmxlbmd0aDtpPmc7ZysrKWoudHdlZW5zW2ddLnJ1bihmKTtyZXR1cm4gaC5ub3RpZnlXaXRoKGEsW2osZixjXSksMT5mJiZpP2M6KGgucmVzb2x2ZVdpdGgoYSxbal0pLCExKX0saj1oLnByb21pc2Uoe2VsZW06YSxwcm9wczpuLmV4dGVuZCh7fSxiKSxvcHRzOm4uZXh0ZW5kKCEwLHtzcGVjaWFsRWFzaW5nOnt9LGVhc2luZzpuLmVhc2luZy5fZGVmYXVsdH0sYyksb3JpZ2luYWxQcm9wZXJ0aWVzOmIsb3JpZ2luYWxPcHRpb25zOmMsc3RhcnRUaW1lOlNhfHxXYSgpLGR1cmF0aW9uOmMuZHVyYXRpb24sdHdlZW5zOltdLGNyZWF0ZVR3ZWVuOmZ1bmN0aW9uKGIsYyl7dmFyIGQ9bi5Ud2VlbihhLGoub3B0cyxiLGMsai5vcHRzLnNwZWNpYWxFYXNpbmdbYl18fGoub3B0cy5lYXNpbmcpO3JldHVybiBqLnR3ZWVucy5wdXNoKGQpLGR9LHN0b3A6ZnVuY3Rpb24oYil7dmFyIGM9MCxkPWI/ai50d2VlbnMubGVuZ3RoOjA7aWYoZSlyZXR1cm4gdGhpcztmb3IoZT0hMDtkPmM7YysrKWoudHdlZW5zW2NdLnJ1bigxKTtyZXR1cm4gYj8oaC5ub3RpZnlXaXRoKGEsW2osMSwwXSksaC5yZXNvbHZlV2l0aChhLFtqLGJdKSk6aC5yZWplY3RXaXRoKGEsW2osYl0pLHRoaXN9fSksaz1qLnByb3BzO2ZvcigkYShrLGoub3B0cy5zcGVjaWFsRWFzaW5nKTtnPmY7ZisrKWlmKGQ9X2EucHJlZmlsdGVyc1tmXS5jYWxsKGosYSxrLGoub3B0cykpcmV0dXJuIG4uaXNGdW5jdGlvbihkLnN0b3ApJiYobi5fcXVldWVIb29rcyhqLmVsZW0sai5vcHRzLnF1ZXVlKS5zdG9wPW4ucHJveHkoZC5zdG9wLGQpKSxkO3JldHVybiBuLm1hcChrLFlhLGopLG4uaXNGdW5jdGlvbihqLm9wdHMuc3RhcnQpJiZqLm9wdHMuc3RhcnQuY2FsbChhLGopLG4uZngudGltZXIobi5leHRlbmQoaSx7ZWxlbTphLGFuaW06aixxdWV1ZTpqLm9wdHMucXVldWV9KSksai5wcm9ncmVzcyhqLm9wdHMucHJvZ3Jlc3MpLmRvbmUoai5vcHRzLmRvbmUsai5vcHRzLmNvbXBsZXRlKS5mYWlsKGoub3B0cy5mYWlsKS5hbHdheXMoai5vcHRzLmFsd2F5cyl9bi5BbmltYXRpb249bi5leHRlbmQoX2Ese3R3ZWVuZXJzOntcIipcIjpbZnVuY3Rpb24oYSxiKXt2YXIgYz10aGlzLmNyZWF0ZVR3ZWVuKGEsYik7cmV0dXJuIFcoYy5lbGVtLGEsVC5leGVjKGIpLGMpLGN9XX0sdHdlZW5lcjpmdW5jdGlvbihhLGIpe24uaXNGdW5jdGlvbihhKT8oYj1hLGE9W1wiKlwiXSk6YT1hLm1hdGNoKEcpO2Zvcih2YXIgYyxkPTAsZT1hLmxlbmd0aDtlPmQ7ZCsrKWM9YVtkXSxfYS50d2VlbmVyc1tjXT1fYS50d2VlbmVyc1tjXXx8W10sX2EudHdlZW5lcnNbY10udW5zaGlmdChiKX0scHJlZmlsdGVyczpbWmFdLHByZWZpbHRlcjpmdW5jdGlvbihhLGIpe2I/X2EucHJlZmlsdGVycy51bnNoaWZ0KGEpOl9hLnByZWZpbHRlcnMucHVzaChhKX19KSxuLnNwZWVkPWZ1bmN0aW9uKGEsYixjKXt2YXIgZD1hJiZcIm9iamVjdFwiPT10eXBlb2YgYT9uLmV4dGVuZCh7fSxhKTp7Y29tcGxldGU6Y3x8IWMmJmJ8fG4uaXNGdW5jdGlvbihhKSYmYSxkdXJhdGlvbjphLGVhc2luZzpjJiZifHxiJiYhbi5pc0Z1bmN0aW9uKGIpJiZifTtyZXR1cm4gZC5kdXJhdGlvbj1uLmZ4Lm9mZj8wOlwibnVtYmVyXCI9PXR5cGVvZiBkLmR1cmF0aW9uP2QuZHVyYXRpb246ZC5kdXJhdGlvbiBpbiBuLmZ4LnNwZWVkcz9uLmZ4LnNwZWVkc1tkLmR1cmF0aW9uXTpuLmZ4LnNwZWVkcy5fZGVmYXVsdCxudWxsIT1kLnF1ZXVlJiZkLnF1ZXVlIT09ITB8fChkLnF1ZXVlPVwiZnhcIiksZC5vbGQ9ZC5jb21wbGV0ZSxkLmNvbXBsZXRlPWZ1bmN0aW9uKCl7bi5pc0Z1bmN0aW9uKGQub2xkKSYmZC5vbGQuY2FsbCh0aGlzKSxkLnF1ZXVlJiZuLmRlcXVldWUodGhpcyxkLnF1ZXVlKX0sZH0sbi5mbi5leHRlbmQoe2ZhZGVUbzpmdW5jdGlvbihhLGIsYyxkKXtyZXR1cm4gdGhpcy5maWx0ZXIoVikuY3NzKFwib3BhY2l0eVwiLDApLnNob3coKS5lbmQoKS5hbmltYXRlKHtvcGFjaXR5OmJ9LGEsYyxkKX0sYW5pbWF0ZTpmdW5jdGlvbihhLGIsYyxkKXt2YXIgZT1uLmlzRW1wdHlPYmplY3QoYSksZj1uLnNwZWVkKGIsYyxkKSxnPWZ1bmN0aW9uKCl7dmFyIGI9X2EodGhpcyxuLmV4dGVuZCh7fSxhKSxmKTsoZXx8Ti5nZXQodGhpcyxcImZpbmlzaFwiKSkmJmIuc3RvcCghMCl9O3JldHVybiBnLmZpbmlzaD1nLGV8fGYucXVldWU9PT0hMT90aGlzLmVhY2goZyk6dGhpcy5xdWV1ZShmLnF1ZXVlLGcpfSxzdG9wOmZ1bmN0aW9uKGEsYixjKXt2YXIgZD1mdW5jdGlvbihhKXt2YXIgYj1hLnN0b3A7ZGVsZXRlIGEuc3RvcCxiKGMpfTtyZXR1cm5cInN0cmluZ1wiIT10eXBlb2YgYSYmKGM9YixiPWEsYT12b2lkIDApLGImJmEhPT0hMSYmdGhpcy5xdWV1ZShhfHxcImZ4XCIsW10pLHRoaXMuZWFjaChmdW5jdGlvbigpe3ZhciBiPSEwLGU9bnVsbCE9YSYmYStcInF1ZXVlSG9va3NcIixmPW4udGltZXJzLGc9Ti5nZXQodGhpcyk7aWYoZSlnW2VdJiZnW2VdLnN0b3AmJmQoZ1tlXSk7ZWxzZSBmb3IoZSBpbiBnKWdbZV0mJmdbZV0uc3RvcCYmVmEudGVzdChlKSYmZChnW2VdKTtmb3IoZT1mLmxlbmd0aDtlLS07KWZbZV0uZWxlbSE9PXRoaXN8fG51bGwhPWEmJmZbZV0ucXVldWUhPT1hfHwoZltlXS5hbmltLnN0b3AoYyksYj0hMSxmLnNwbGljZShlLDEpKTshYiYmY3x8bi5kZXF1ZXVlKHRoaXMsYSl9KX0sZmluaXNoOmZ1bmN0aW9uKGEpe3JldHVybiBhIT09ITEmJihhPWF8fFwiZnhcIiksdGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIGIsYz1OLmdldCh0aGlzKSxkPWNbYStcInF1ZXVlXCJdLGU9Y1thK1wicXVldWVIb29rc1wiXSxmPW4udGltZXJzLGc9ZD9kLmxlbmd0aDowO2ZvcihjLmZpbmlzaD0hMCxuLnF1ZXVlKHRoaXMsYSxbXSksZSYmZS5zdG9wJiZlLnN0b3AuY2FsbCh0aGlzLCEwKSxiPWYubGVuZ3RoO2ItLTspZltiXS5lbGVtPT09dGhpcyYmZltiXS5xdWV1ZT09PWEmJihmW2JdLmFuaW0uc3RvcCghMCksZi5zcGxpY2UoYiwxKSk7Zm9yKGI9MDtnPmI7YisrKWRbYl0mJmRbYl0uZmluaXNoJiZkW2JdLmZpbmlzaC5jYWxsKHRoaXMpO2RlbGV0ZSBjLmZpbmlzaH0pfX0pLG4uZWFjaChbXCJ0b2dnbGVcIixcInNob3dcIixcImhpZGVcIl0sZnVuY3Rpb24oYSxiKXt2YXIgYz1uLmZuW2JdO24uZm5bYl09ZnVuY3Rpb24oYSxkLGUpe3JldHVybiBudWxsPT1hfHxcImJvb2xlYW5cIj09dHlwZW9mIGE/Yy5hcHBseSh0aGlzLGFyZ3VtZW50cyk6dGhpcy5hbmltYXRlKFhhKGIsITApLGEsZCxlKX19KSxuLmVhY2goe3NsaWRlRG93bjpYYShcInNob3dcIiksc2xpZGVVcDpYYShcImhpZGVcIiksc2xpZGVUb2dnbGU6WGEoXCJ0b2dnbGVcIiksZmFkZUluOntvcGFjaXR5Olwic2hvd1wifSxmYWRlT3V0OntvcGFjaXR5OlwiaGlkZVwifSxmYWRlVG9nZ2xlOntvcGFjaXR5OlwidG9nZ2xlXCJ9fSxmdW5jdGlvbihhLGIpe24uZm5bYV09ZnVuY3Rpb24oYSxjLGQpe3JldHVybiB0aGlzLmFuaW1hdGUoYixhLGMsZCl9fSksbi50aW1lcnM9W10sbi5meC50aWNrPWZ1bmN0aW9uKCl7dmFyIGEsYj0wLGM9bi50aW1lcnM7Zm9yKFNhPW4ubm93KCk7YjxjLmxlbmd0aDtiKyspYT1jW2JdLGEoKXx8Y1tiXSE9PWF8fGMuc3BsaWNlKGItLSwxKTtjLmxlbmd0aHx8bi5meC5zdG9wKCksU2E9dm9pZCAwfSxuLmZ4LnRpbWVyPWZ1bmN0aW9uKGEpe24udGltZXJzLnB1c2goYSksYSgpP24uZnguc3RhcnQoKTpuLnRpbWVycy5wb3AoKX0sbi5meC5pbnRlcnZhbD0xMyxuLmZ4LnN0YXJ0PWZ1bmN0aW9uKCl7VGF8fChUYT1hLnNldEludGVydmFsKG4uZngudGljayxuLmZ4LmludGVydmFsKSl9LG4uZnguc3RvcD1mdW5jdGlvbigpe2EuY2xlYXJJbnRlcnZhbChUYSksVGE9bnVsbH0sbi5meC5zcGVlZHM9e3Nsb3c6NjAwLGZhc3Q6MjAwLF9kZWZhdWx0OjQwMH0sbi5mbi5kZWxheT1mdW5jdGlvbihiLGMpe3JldHVybiBiPW4uZng/bi5meC5zcGVlZHNbYl18fGI6YixjPWN8fFwiZnhcIix0aGlzLnF1ZXVlKGMsZnVuY3Rpb24oYyxkKXt2YXIgZT1hLnNldFRpbWVvdXQoYyxiKTtkLnN0b3A9ZnVuY3Rpb24oKXthLmNsZWFyVGltZW91dChlKX19KX0sZnVuY3Rpb24oKXt2YXIgYT1kLmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKSxiPWQuY3JlYXRlRWxlbWVudChcInNlbGVjdFwiKSxjPWIuYXBwZW5kQ2hpbGQoZC5jcmVhdGVFbGVtZW50KFwib3B0aW9uXCIpKTthLnR5cGU9XCJjaGVja2JveFwiLGwuY2hlY2tPbj1cIlwiIT09YS52YWx1ZSxsLm9wdFNlbGVjdGVkPWMuc2VsZWN0ZWQsYi5kaXNhYmxlZD0hMCxsLm9wdERpc2FibGVkPSFjLmRpc2FibGVkLGE9ZC5jcmVhdGVFbGVtZW50KFwiaW5wdXRcIiksYS52YWx1ZT1cInRcIixhLnR5cGU9XCJyYWRpb1wiLGwucmFkaW9WYWx1ZT1cInRcIj09PWEudmFsdWV9KCk7dmFyIGFiLGJiPW4uZXhwci5hdHRySGFuZGxlO24uZm4uZXh0ZW5kKHthdHRyOmZ1bmN0aW9uKGEsYil7cmV0dXJuIEsodGhpcyxuLmF0dHIsYSxiLGFyZ3VtZW50cy5sZW5ndGg+MSl9LHJlbW92ZUF0dHI6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe24ucmVtb3ZlQXR0cih0aGlzLGEpfSl9fSksbi5leHRlbmQoe2F0dHI6ZnVuY3Rpb24oYSxiLGMpe3ZhciBkLGUsZj1hLm5vZGVUeXBlO2lmKDMhPT1mJiY4IT09ZiYmMiE9PWYpcmV0dXJuXCJ1bmRlZmluZWRcIj09dHlwZW9mIGEuZ2V0QXR0cmlidXRlP24ucHJvcChhLGIsYyk6KDE9PT1mJiZuLmlzWE1MRG9jKGEpfHwoYj1iLnRvTG93ZXJDYXNlKCksZT1uLmF0dHJIb29rc1tiXXx8KG4uZXhwci5tYXRjaC5ib29sLnRlc3QoYik/YWI6dm9pZCAwKSksdm9pZCAwIT09Yz9udWxsPT09Yz92b2lkIG4ucmVtb3ZlQXR0cihhLGIpOmUmJlwic2V0XCJpbiBlJiZ2b2lkIDAhPT0oZD1lLnNldChhLGMsYikpP2Q6KGEuc2V0QXR0cmlidXRlKGIsYytcIlwiKSxjKTplJiZcImdldFwiaW4gZSYmbnVsbCE9PShkPWUuZ2V0KGEsYikpP2Q6KGQ9bi5maW5kLmF0dHIoYSxiKSxudWxsPT1kP3ZvaWQgMDpkKSl9LGF0dHJIb29rczp7dHlwZTp7c2V0OmZ1bmN0aW9uKGEsYil7aWYoIWwucmFkaW9WYWx1ZSYmXCJyYWRpb1wiPT09YiYmbi5ub2RlTmFtZShhLFwiaW5wdXRcIikpe3ZhciBjPWEudmFsdWU7cmV0dXJuIGEuc2V0QXR0cmlidXRlKFwidHlwZVwiLGIpLGMmJihhLnZhbHVlPWMpLGJ9fX19LHJlbW92ZUF0dHI6ZnVuY3Rpb24oYSxiKXt2YXIgYyxkLGU9MCxmPWImJmIubWF0Y2goRyk7aWYoZiYmMT09PWEubm9kZVR5cGUpd2hpbGUoYz1mW2UrK10pZD1uLnByb3BGaXhbY118fGMsbi5leHByLm1hdGNoLmJvb2wudGVzdChjKSYmKGFbZF09ITEpLGEucmVtb3ZlQXR0cmlidXRlKGMpfX0pLGFiPXtzZXQ6ZnVuY3Rpb24oYSxiLGMpe3JldHVybiBiPT09ITE/bi5yZW1vdmVBdHRyKGEsYyk6YS5zZXRBdHRyaWJ1dGUoYyxjKSxjfX0sbi5lYWNoKG4uZXhwci5tYXRjaC5ib29sLnNvdXJjZS5tYXRjaCgvXFx3Ky9nKSxmdW5jdGlvbihhLGIpe3ZhciBjPWJiW2JdfHxuLmZpbmQuYXR0cjtiYltiXT1mdW5jdGlvbihhLGIsZCl7dmFyIGUsZjtyZXR1cm4gZHx8KGY9YmJbYl0sYmJbYl09ZSxlPW51bGwhPWMoYSxiLGQpP2IudG9Mb3dlckNhc2UoKTpudWxsLGJiW2JdPWYpLGV9fSk7dmFyIGNiPS9eKD86aW5wdXR8c2VsZWN0fHRleHRhcmVhfGJ1dHRvbikkL2ksZGI9L14oPzphfGFyZWEpJC9pO24uZm4uZXh0ZW5kKHtwcm9wOmZ1bmN0aW9uKGEsYil7cmV0dXJuIEsodGhpcyxuLnByb3AsYSxiLGFyZ3VtZW50cy5sZW5ndGg+MSl9LHJlbW92ZVByb3A6ZnVuY3Rpb24oYSl7cmV0dXJuIHRoaXMuZWFjaChmdW5jdGlvbigpe2RlbGV0ZSB0aGlzW24ucHJvcEZpeFthXXx8YV19KX19KSxuLmV4dGVuZCh7cHJvcDpmdW5jdGlvbihhLGIsYyl7dmFyIGQsZSxmPWEubm9kZVR5cGU7aWYoMyE9PWYmJjghPT1mJiYyIT09ZilyZXR1cm4gMT09PWYmJm4uaXNYTUxEb2MoYSl8fChiPW4ucHJvcEZpeFtiXXx8YixlPW4ucHJvcEhvb2tzW2JdKSxcbnZvaWQgMCE9PWM/ZSYmXCJzZXRcImluIGUmJnZvaWQgMCE9PShkPWUuc2V0KGEsYyxiKSk/ZDphW2JdPWM6ZSYmXCJnZXRcImluIGUmJm51bGwhPT0oZD1lLmdldChhLGIpKT9kOmFbYl19LHByb3BIb29rczp7dGFiSW5kZXg6e2dldDpmdW5jdGlvbihhKXt2YXIgYj1uLmZpbmQuYXR0cihhLFwidGFiaW5kZXhcIik7cmV0dXJuIGI/cGFyc2VJbnQoYiwxMCk6Y2IudGVzdChhLm5vZGVOYW1lKXx8ZGIudGVzdChhLm5vZGVOYW1lKSYmYS5ocmVmPzA6LTF9fX0scHJvcEZpeDp7XCJmb3JcIjpcImh0bWxGb3JcIixcImNsYXNzXCI6XCJjbGFzc05hbWVcIn19KSxsLm9wdFNlbGVjdGVkfHwobi5wcm9wSG9va3Muc2VsZWN0ZWQ9e2dldDpmdW5jdGlvbihhKXt2YXIgYj1hLnBhcmVudE5vZGU7cmV0dXJuIGImJmIucGFyZW50Tm9kZSYmYi5wYXJlbnROb2RlLnNlbGVjdGVkSW5kZXgsbnVsbH0sc2V0OmZ1bmN0aW9uKGEpe3ZhciBiPWEucGFyZW50Tm9kZTtiJiYoYi5zZWxlY3RlZEluZGV4LGIucGFyZW50Tm9kZSYmYi5wYXJlbnROb2RlLnNlbGVjdGVkSW5kZXgpfX0pLG4uZWFjaChbXCJ0YWJJbmRleFwiLFwicmVhZE9ubHlcIixcIm1heExlbmd0aFwiLFwiY2VsbFNwYWNpbmdcIixcImNlbGxQYWRkaW5nXCIsXCJyb3dTcGFuXCIsXCJjb2xTcGFuXCIsXCJ1c2VNYXBcIixcImZyYW1lQm9yZGVyXCIsXCJjb250ZW50RWRpdGFibGVcIl0sZnVuY3Rpb24oKXtuLnByb3BGaXhbdGhpcy50b0xvd2VyQ2FzZSgpXT10aGlzfSk7dmFyIGViPS9bXFx0XFxyXFxuXFxmXS9nO2Z1bmN0aW9uIGZiKGEpe3JldHVybiBhLmdldEF0dHJpYnV0ZSYmYS5nZXRBdHRyaWJ1dGUoXCJjbGFzc1wiKXx8XCJcIn1uLmZuLmV4dGVuZCh7YWRkQ2xhc3M6ZnVuY3Rpb24oYSl7dmFyIGIsYyxkLGUsZixnLGgsaT0wO2lmKG4uaXNGdW5jdGlvbihhKSlyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKGIpe24odGhpcykuYWRkQ2xhc3MoYS5jYWxsKHRoaXMsYixmYih0aGlzKSkpfSk7aWYoXCJzdHJpbmdcIj09dHlwZW9mIGEmJmEpe2I9YS5tYXRjaChHKXx8W107d2hpbGUoYz10aGlzW2krK10paWYoZT1mYihjKSxkPTE9PT1jLm5vZGVUeXBlJiYoXCIgXCIrZStcIiBcIikucmVwbGFjZShlYixcIiBcIikpe2c9MDt3aGlsZShmPWJbZysrXSlkLmluZGV4T2YoXCIgXCIrZitcIiBcIik8MCYmKGQrPWYrXCIgXCIpO2g9bi50cmltKGQpLGUhPT1oJiZjLnNldEF0dHJpYnV0ZShcImNsYXNzXCIsaCl9fXJldHVybiB0aGlzfSxyZW1vdmVDbGFzczpmdW5jdGlvbihhKXt2YXIgYixjLGQsZSxmLGcsaCxpPTA7aWYobi5pc0Z1bmN0aW9uKGEpKXJldHVybiB0aGlzLmVhY2goZnVuY3Rpb24oYil7bih0aGlzKS5yZW1vdmVDbGFzcyhhLmNhbGwodGhpcyxiLGZiKHRoaXMpKSl9KTtpZighYXJndW1lbnRzLmxlbmd0aClyZXR1cm4gdGhpcy5hdHRyKFwiY2xhc3NcIixcIlwiKTtpZihcInN0cmluZ1wiPT10eXBlb2YgYSYmYSl7Yj1hLm1hdGNoKEcpfHxbXTt3aGlsZShjPXRoaXNbaSsrXSlpZihlPWZiKGMpLGQ9MT09PWMubm9kZVR5cGUmJihcIiBcIitlK1wiIFwiKS5yZXBsYWNlKGViLFwiIFwiKSl7Zz0wO3doaWxlKGY9YltnKytdKXdoaWxlKGQuaW5kZXhPZihcIiBcIitmK1wiIFwiKT4tMSlkPWQucmVwbGFjZShcIiBcIitmK1wiIFwiLFwiIFwiKTtoPW4udHJpbShkKSxlIT09aCYmYy5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLGgpfX1yZXR1cm4gdGhpc30sdG9nZ2xlQ2xhc3M6ZnVuY3Rpb24oYSxiKXt2YXIgYz10eXBlb2YgYTtyZXR1cm5cImJvb2xlYW5cIj09dHlwZW9mIGImJlwic3RyaW5nXCI9PT1jP2I/dGhpcy5hZGRDbGFzcyhhKTp0aGlzLnJlbW92ZUNsYXNzKGEpOm4uaXNGdW5jdGlvbihhKT90aGlzLmVhY2goZnVuY3Rpb24oYyl7bih0aGlzKS50b2dnbGVDbGFzcyhhLmNhbGwodGhpcyxjLGZiKHRoaXMpLGIpLGIpfSk6dGhpcy5lYWNoKGZ1bmN0aW9uKCl7dmFyIGIsZCxlLGY7aWYoXCJzdHJpbmdcIj09PWMpe2Q9MCxlPW4odGhpcyksZj1hLm1hdGNoKEcpfHxbXTt3aGlsZShiPWZbZCsrXSllLmhhc0NsYXNzKGIpP2UucmVtb3ZlQ2xhc3MoYik6ZS5hZGRDbGFzcyhiKX1lbHNlIHZvaWQgMCE9PWEmJlwiYm9vbGVhblwiIT09Y3x8KGI9ZmIodGhpcyksYiYmTi5zZXQodGhpcyxcIl9fY2xhc3NOYW1lX19cIixiKSx0aGlzLnNldEF0dHJpYnV0ZSYmdGhpcy5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLGJ8fGE9PT0hMT9cIlwiOk4uZ2V0KHRoaXMsXCJfX2NsYXNzTmFtZV9fXCIpfHxcIlwiKSl9KX0saGFzQ2xhc3M6ZnVuY3Rpb24oYSl7dmFyIGIsYyxkPTA7Yj1cIiBcIithK1wiIFwiO3doaWxlKGM9dGhpc1tkKytdKWlmKDE9PT1jLm5vZGVUeXBlJiYoXCIgXCIrZmIoYykrXCIgXCIpLnJlcGxhY2UoZWIsXCIgXCIpLmluZGV4T2YoYik+LTEpcmV0dXJuITA7cmV0dXJuITF9fSk7dmFyIGdiPS9cXHIvZyxoYj0vW1xceDIwXFx0XFxyXFxuXFxmXSsvZztuLmZuLmV4dGVuZCh7dmFsOmZ1bmN0aW9uKGEpe3ZhciBiLGMsZCxlPXRoaXNbMF07e2lmKGFyZ3VtZW50cy5sZW5ndGgpcmV0dXJuIGQ9bi5pc0Z1bmN0aW9uKGEpLHRoaXMuZWFjaChmdW5jdGlvbihjKXt2YXIgZTsxPT09dGhpcy5ub2RlVHlwZSYmKGU9ZD9hLmNhbGwodGhpcyxjLG4odGhpcykudmFsKCkpOmEsbnVsbD09ZT9lPVwiXCI6XCJudW1iZXJcIj09dHlwZW9mIGU/ZSs9XCJcIjpuLmlzQXJyYXkoZSkmJihlPW4ubWFwKGUsZnVuY3Rpb24oYSl7cmV0dXJuIG51bGw9PWE/XCJcIjphK1wiXCJ9KSksYj1uLnZhbEhvb2tzW3RoaXMudHlwZV18fG4udmFsSG9va3NbdGhpcy5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpXSxiJiZcInNldFwiaW4gYiYmdm9pZCAwIT09Yi5zZXQodGhpcyxlLFwidmFsdWVcIil8fCh0aGlzLnZhbHVlPWUpKX0pO2lmKGUpcmV0dXJuIGI9bi52YWxIb29rc1tlLnR5cGVdfHxuLnZhbEhvb2tzW2Uubm9kZU5hbWUudG9Mb3dlckNhc2UoKV0sYiYmXCJnZXRcImluIGImJnZvaWQgMCE9PShjPWIuZ2V0KGUsXCJ2YWx1ZVwiKSk/YzooYz1lLnZhbHVlLFwic3RyaW5nXCI9PXR5cGVvZiBjP2MucmVwbGFjZShnYixcIlwiKTpudWxsPT1jP1wiXCI6Yyl9fX0pLG4uZXh0ZW5kKHt2YWxIb29rczp7b3B0aW9uOntnZXQ6ZnVuY3Rpb24oYSl7dmFyIGI9bi5maW5kLmF0dHIoYSxcInZhbHVlXCIpO3JldHVybiBudWxsIT1iP2I6bi50cmltKG4udGV4dChhKSkucmVwbGFjZShoYixcIiBcIil9fSxzZWxlY3Q6e2dldDpmdW5jdGlvbihhKXtmb3IodmFyIGIsYyxkPWEub3B0aW9ucyxlPWEuc2VsZWN0ZWRJbmRleCxmPVwic2VsZWN0LW9uZVwiPT09YS50eXBlfHwwPmUsZz1mP251bGw6W10saD1mP2UrMTpkLmxlbmd0aCxpPTA+ZT9oOmY/ZTowO2g+aTtpKyspaWYoYz1kW2ldLChjLnNlbGVjdGVkfHxpPT09ZSkmJihsLm9wdERpc2FibGVkPyFjLmRpc2FibGVkOm51bGw9PT1jLmdldEF0dHJpYnV0ZShcImRpc2FibGVkXCIpKSYmKCFjLnBhcmVudE5vZGUuZGlzYWJsZWR8fCFuLm5vZGVOYW1lKGMucGFyZW50Tm9kZSxcIm9wdGdyb3VwXCIpKSl7aWYoYj1uKGMpLnZhbCgpLGYpcmV0dXJuIGI7Zy5wdXNoKGIpfXJldHVybiBnfSxzZXQ6ZnVuY3Rpb24oYSxiKXt2YXIgYyxkLGU9YS5vcHRpb25zLGY9bi5tYWtlQXJyYXkoYiksZz1lLmxlbmd0aDt3aGlsZShnLS0pZD1lW2ddLChkLnNlbGVjdGVkPW4uaW5BcnJheShuLnZhbEhvb2tzLm9wdGlvbi5nZXQoZCksZik+LTEpJiYoYz0hMCk7cmV0dXJuIGN8fChhLnNlbGVjdGVkSW5kZXg9LTEpLGZ9fX19KSxuLmVhY2goW1wicmFkaW9cIixcImNoZWNrYm94XCJdLGZ1bmN0aW9uKCl7bi52YWxIb29rc1t0aGlzXT17c2V0OmZ1bmN0aW9uKGEsYil7cmV0dXJuIG4uaXNBcnJheShiKT9hLmNoZWNrZWQ9bi5pbkFycmF5KG4oYSkudmFsKCksYik+LTE6dm9pZCAwfX0sbC5jaGVja09ufHwobi52YWxIb29rc1t0aGlzXS5nZXQ9ZnVuY3Rpb24oYSl7cmV0dXJuIG51bGw9PT1hLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpP1wib25cIjphLnZhbHVlfSl9KTt2YXIgaWI9L14oPzpmb2N1c2luZm9jdXN8Zm9jdXNvdXRibHVyKSQvO24uZXh0ZW5kKG4uZXZlbnQse3RyaWdnZXI6ZnVuY3Rpb24oYixjLGUsZil7dmFyIGcsaCxpLGosbCxtLG8scD1bZXx8ZF0scT1rLmNhbGwoYixcInR5cGVcIik/Yi50eXBlOmIscj1rLmNhbGwoYixcIm5hbWVzcGFjZVwiKT9iLm5hbWVzcGFjZS5zcGxpdChcIi5cIik6W107aWYoaD1pPWU9ZXx8ZCwzIT09ZS5ub2RlVHlwZSYmOCE9PWUubm9kZVR5cGUmJiFpYi50ZXN0KHErbi5ldmVudC50cmlnZ2VyZWQpJiYocS5pbmRleE9mKFwiLlwiKT4tMSYmKHI9cS5zcGxpdChcIi5cIikscT1yLnNoaWZ0KCksci5zb3J0KCkpLGw9cS5pbmRleE9mKFwiOlwiKTwwJiZcIm9uXCIrcSxiPWJbbi5leHBhbmRvXT9iOm5ldyBuLkV2ZW50KHEsXCJvYmplY3RcIj09dHlwZW9mIGImJmIpLGIuaXNUcmlnZ2VyPWY/MjozLGIubmFtZXNwYWNlPXIuam9pbihcIi5cIiksYi5ybmFtZXNwYWNlPWIubmFtZXNwYWNlP25ldyBSZWdFeHAoXCIoXnxcXFxcLilcIityLmpvaW4oXCJcXFxcLig/Oi4qXFxcXC58KVwiKStcIihcXFxcLnwkKVwiKTpudWxsLGIucmVzdWx0PXZvaWQgMCxiLnRhcmdldHx8KGIudGFyZ2V0PWUpLGM9bnVsbD09Yz9bYl06bi5tYWtlQXJyYXkoYyxbYl0pLG89bi5ldmVudC5zcGVjaWFsW3FdfHx7fSxmfHwhby50cmlnZ2VyfHxvLnRyaWdnZXIuYXBwbHkoZSxjKSE9PSExKSl7aWYoIWYmJiFvLm5vQnViYmxlJiYhbi5pc1dpbmRvdyhlKSl7Zm9yKGo9by5kZWxlZ2F0ZVR5cGV8fHEsaWIudGVzdChqK3EpfHwoaD1oLnBhcmVudE5vZGUpO2g7aD1oLnBhcmVudE5vZGUpcC5wdXNoKGgpLGk9aDtpPT09KGUub3duZXJEb2N1bWVudHx8ZCkmJnAucHVzaChpLmRlZmF1bHRWaWV3fHxpLnBhcmVudFdpbmRvd3x8YSl9Zz0wO3doaWxlKChoPXBbZysrXSkmJiFiLmlzUHJvcGFnYXRpb25TdG9wcGVkKCkpYi50eXBlPWc+MT9qOm8uYmluZFR5cGV8fHEsbT0oTi5nZXQoaCxcImV2ZW50c1wiKXx8e30pW2IudHlwZV0mJk4uZ2V0KGgsXCJoYW5kbGVcIiksbSYmbS5hcHBseShoLGMpLG09bCYmaFtsXSxtJiZtLmFwcGx5JiZMKGgpJiYoYi5yZXN1bHQ9bS5hcHBseShoLGMpLGIucmVzdWx0PT09ITEmJmIucHJldmVudERlZmF1bHQoKSk7cmV0dXJuIGIudHlwZT1xLGZ8fGIuaXNEZWZhdWx0UHJldmVudGVkKCl8fG8uX2RlZmF1bHQmJm8uX2RlZmF1bHQuYXBwbHkocC5wb3AoKSxjKSE9PSExfHwhTChlKXx8bCYmbi5pc0Z1bmN0aW9uKGVbcV0pJiYhbi5pc1dpbmRvdyhlKSYmKGk9ZVtsXSxpJiYoZVtsXT1udWxsKSxuLmV2ZW50LnRyaWdnZXJlZD1xLGVbcV0oKSxuLmV2ZW50LnRyaWdnZXJlZD12b2lkIDAsaSYmKGVbbF09aSkpLGIucmVzdWx0fX0sc2ltdWxhdGU6ZnVuY3Rpb24oYSxiLGMpe3ZhciBkPW4uZXh0ZW5kKG5ldyBuLkV2ZW50LGMse3R5cGU6YSxpc1NpbXVsYXRlZDohMH0pO24uZXZlbnQudHJpZ2dlcihkLG51bGwsYil9fSksbi5mbi5leHRlbmQoe3RyaWdnZXI6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKCl7bi5ldmVudC50cmlnZ2VyKGEsYix0aGlzKX0pfSx0cmlnZ2VySGFuZGxlcjpmdW5jdGlvbihhLGIpe3ZhciBjPXRoaXNbMF07cmV0dXJuIGM/bi5ldmVudC50cmlnZ2VyKGEsYixjLCEwKTp2b2lkIDB9fSksbi5lYWNoKFwiYmx1ciBmb2N1cyBmb2N1c2luIGZvY3Vzb3V0IGxvYWQgcmVzaXplIHNjcm9sbCB1bmxvYWQgY2xpY2sgZGJsY2xpY2sgbW91c2Vkb3duIG1vdXNldXAgbW91c2Vtb3ZlIG1vdXNlb3ZlciBtb3VzZW91dCBtb3VzZWVudGVyIG1vdXNlbGVhdmUgY2hhbmdlIHNlbGVjdCBzdWJtaXQga2V5ZG93biBrZXlwcmVzcyBrZXl1cCBlcnJvciBjb250ZXh0bWVudVwiLnNwbGl0KFwiIFwiKSxmdW5jdGlvbihhLGIpe24uZm5bYl09ZnVuY3Rpb24oYSxjKXtyZXR1cm4gYXJndW1lbnRzLmxlbmd0aD4wP3RoaXMub24oYixudWxsLGEsYyk6dGhpcy50cmlnZ2VyKGIpfX0pLG4uZm4uZXh0ZW5kKHtob3ZlcjpmdW5jdGlvbihhLGIpe3JldHVybiB0aGlzLm1vdXNlZW50ZXIoYSkubW91c2VsZWF2ZShifHxhKX19KSxsLmZvY3VzaW49XCJvbmZvY3VzaW5cImluIGEsbC5mb2N1c2lufHxuLmVhY2goe2ZvY3VzOlwiZm9jdXNpblwiLGJsdXI6XCJmb2N1c291dFwifSxmdW5jdGlvbihhLGIpe3ZhciBjPWZ1bmN0aW9uKGEpe24uZXZlbnQuc2ltdWxhdGUoYixhLnRhcmdldCxuLmV2ZW50LmZpeChhKSl9O24uZXZlbnQuc3BlY2lhbFtiXT17c2V0dXA6ZnVuY3Rpb24oKXt2YXIgZD10aGlzLm93bmVyRG9jdW1lbnR8fHRoaXMsZT1OLmFjY2VzcyhkLGIpO2V8fGQuYWRkRXZlbnRMaXN0ZW5lcihhLGMsITApLE4uYWNjZXNzKGQsYiwoZXx8MCkrMSl9LHRlYXJkb3duOmZ1bmN0aW9uKCl7dmFyIGQ9dGhpcy5vd25lckRvY3VtZW50fHx0aGlzLGU9Ti5hY2Nlc3MoZCxiKS0xO2U/Ti5hY2Nlc3MoZCxiLGUpOihkLnJlbW92ZUV2ZW50TGlzdGVuZXIoYSxjLCEwKSxOLnJlbW92ZShkLGIpKX19fSk7dmFyIGpiPWEubG9jYXRpb24sa2I9bi5ub3coKSxsYj0vXFw/LztuLnBhcnNlSlNPTj1mdW5jdGlvbihhKXtyZXR1cm4gSlNPTi5wYXJzZShhK1wiXCIpfSxuLnBhcnNlWE1MPWZ1bmN0aW9uKGIpe3ZhciBjO2lmKCFifHxcInN0cmluZ1wiIT10eXBlb2YgYilyZXR1cm4gbnVsbDt0cnl7Yz0obmV3IGEuRE9NUGFyc2VyKS5wYXJzZUZyb21TdHJpbmcoYixcInRleHQveG1sXCIpfWNhdGNoKGQpe2M9dm9pZCAwfXJldHVybiBjJiYhYy5nZXRFbGVtZW50c0J5VGFnTmFtZShcInBhcnNlcmVycm9yXCIpLmxlbmd0aHx8bi5lcnJvcihcIkludmFsaWQgWE1MOiBcIitiKSxjfTt2YXIgbWI9LyMuKiQvLG5iPS8oWz8mXSlfPVteJl0qLyxvYj0vXiguKj8pOlsgXFx0XSooW15cXHJcXG5dKikkL2dtLHBiPS9eKD86YWJvdXR8YXBwfGFwcC1zdG9yYWdlfC4rLWV4dGVuc2lvbnxmaWxlfHJlc3x3aWRnZXQpOiQvLHFiPS9eKD86R0VUfEhFQUQpJC8scmI9L15cXC9cXC8vLHNiPXt9LHRiPXt9LHViPVwiKi9cIi5jb25jYXQoXCIqXCIpLHZiPWQuY3JlYXRlRWxlbWVudChcImFcIik7dmIuaHJlZj1qYi5ocmVmO2Z1bmN0aW9uIHdiKGEpe3JldHVybiBmdW5jdGlvbihiLGMpe1wic3RyaW5nXCIhPXR5cGVvZiBiJiYoYz1iLGI9XCIqXCIpO3ZhciBkLGU9MCxmPWIudG9Mb3dlckNhc2UoKS5tYXRjaChHKXx8W107aWYobi5pc0Z1bmN0aW9uKGMpKXdoaWxlKGQ9ZltlKytdKVwiK1wiPT09ZFswXT8oZD1kLnNsaWNlKDEpfHxcIipcIiwoYVtkXT1hW2RdfHxbXSkudW5zaGlmdChjKSk6KGFbZF09YVtkXXx8W10pLnB1c2goYyl9fWZ1bmN0aW9uIHhiKGEsYixjLGQpe3ZhciBlPXt9LGY9YT09PXRiO2Z1bmN0aW9uIGcoaCl7dmFyIGk7cmV0dXJuIGVbaF09ITAsbi5lYWNoKGFbaF18fFtdLGZ1bmN0aW9uKGEsaCl7dmFyIGo9aChiLGMsZCk7cmV0dXJuXCJzdHJpbmdcIiE9dHlwZW9mIGp8fGZ8fGVbal0/Zj8hKGk9aik6dm9pZCAwOihiLmRhdGFUeXBlcy51bnNoaWZ0KGopLGcoaiksITEpfSksaX1yZXR1cm4gZyhiLmRhdGFUeXBlc1swXSl8fCFlW1wiKlwiXSYmZyhcIipcIil9ZnVuY3Rpb24geWIoYSxiKXt2YXIgYyxkLGU9bi5hamF4U2V0dGluZ3MuZmxhdE9wdGlvbnN8fHt9O2ZvcihjIGluIGIpdm9pZCAwIT09YltjXSYmKChlW2NdP2E6ZHx8KGQ9e30pKVtjXT1iW2NdKTtyZXR1cm4gZCYmbi5leHRlbmQoITAsYSxkKSxhfWZ1bmN0aW9uIHpiKGEsYixjKXt2YXIgZCxlLGYsZyxoPWEuY29udGVudHMsaT1hLmRhdGFUeXBlczt3aGlsZShcIipcIj09PWlbMF0paS5zaGlmdCgpLHZvaWQgMD09PWQmJihkPWEubWltZVR5cGV8fGIuZ2V0UmVzcG9uc2VIZWFkZXIoXCJDb250ZW50LVR5cGVcIikpO2lmKGQpZm9yKGUgaW4gaClpZihoW2VdJiZoW2VdLnRlc3QoZCkpe2kudW5zaGlmdChlKTticmVha31pZihpWzBdaW4gYylmPWlbMF07ZWxzZXtmb3IoZSBpbiBjKXtpZighaVswXXx8YS5jb252ZXJ0ZXJzW2UrXCIgXCIraVswXV0pe2Y9ZTticmVha31nfHwoZz1lKX1mPWZ8fGd9cmV0dXJuIGY/KGYhPT1pWzBdJiZpLnVuc2hpZnQoZiksY1tmXSk6dm9pZCAwfWZ1bmN0aW9uIEFiKGEsYixjLGQpe3ZhciBlLGYsZyxoLGksaj17fSxrPWEuZGF0YVR5cGVzLnNsaWNlKCk7aWYoa1sxXSlmb3IoZyBpbiBhLmNvbnZlcnRlcnMpaltnLnRvTG93ZXJDYXNlKCldPWEuY29udmVydGVyc1tnXTtmPWsuc2hpZnQoKTt3aGlsZShmKWlmKGEucmVzcG9uc2VGaWVsZHNbZl0mJihjW2EucmVzcG9uc2VGaWVsZHNbZl1dPWIpLCFpJiZkJiZhLmRhdGFGaWx0ZXImJihiPWEuZGF0YUZpbHRlcihiLGEuZGF0YVR5cGUpKSxpPWYsZj1rLnNoaWZ0KCkpaWYoXCIqXCI9PT1mKWY9aTtlbHNlIGlmKFwiKlwiIT09aSYmaSE9PWYpe2lmKGc9altpK1wiIFwiK2ZdfHxqW1wiKiBcIitmXSwhZylmb3IoZSBpbiBqKWlmKGg9ZS5zcGxpdChcIiBcIiksaFsxXT09PWYmJihnPWpbaStcIiBcIitoWzBdXXx8altcIiogXCIraFswXV0pKXtnPT09ITA/Zz1qW2VdOmpbZV0hPT0hMCYmKGY9aFswXSxrLnVuc2hpZnQoaFsxXSkpO2JyZWFrfWlmKGchPT0hMClpZihnJiZhW1widGhyb3dzXCJdKWI9ZyhiKTtlbHNlIHRyeXtiPWcoYil9Y2F0Y2gobCl7cmV0dXJue3N0YXRlOlwicGFyc2VyZXJyb3JcIixlcnJvcjpnP2w6XCJObyBjb252ZXJzaW9uIGZyb20gXCIraStcIiB0byBcIitmfX19cmV0dXJue3N0YXRlOlwic3VjY2Vzc1wiLGRhdGE6Yn19bi5leHRlbmQoe2FjdGl2ZTowLGxhc3RNb2RpZmllZDp7fSxldGFnOnt9LGFqYXhTZXR0aW5nczp7dXJsOmpiLmhyZWYsdHlwZTpcIkdFVFwiLGlzTG9jYWw6cGIudGVzdChqYi5wcm90b2NvbCksZ2xvYmFsOiEwLHByb2Nlc3NEYXRhOiEwLGFzeW5jOiEwLGNvbnRlbnRUeXBlOlwiYXBwbGljYXRpb24veC13d3ctZm9ybS11cmxlbmNvZGVkOyBjaGFyc2V0PVVURi04XCIsYWNjZXB0czp7XCIqXCI6dWIsdGV4dDpcInRleHQvcGxhaW5cIixodG1sOlwidGV4dC9odG1sXCIseG1sOlwiYXBwbGljYXRpb24veG1sLCB0ZXh0L3htbFwiLGpzb246XCJhcHBsaWNhdGlvbi9qc29uLCB0ZXh0L2phdmFzY3JpcHRcIn0sY29udGVudHM6e3htbDovXFxieG1sXFxiLyxodG1sOi9cXGJodG1sLyxqc29uOi9cXGJqc29uXFxiL30scmVzcG9uc2VGaWVsZHM6e3htbDpcInJlc3BvbnNlWE1MXCIsdGV4dDpcInJlc3BvbnNlVGV4dFwiLGpzb246XCJyZXNwb25zZUpTT05cIn0sY29udmVydGVyczp7XCIqIHRleHRcIjpTdHJpbmcsXCJ0ZXh0IGh0bWxcIjohMCxcInRleHQganNvblwiOm4ucGFyc2VKU09OLFwidGV4dCB4bWxcIjpuLnBhcnNlWE1MfSxmbGF0T3B0aW9uczp7dXJsOiEwLGNvbnRleHQ6ITB9fSxhamF4U2V0dXA6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gYj95Yih5YihhLG4uYWpheFNldHRpbmdzKSxiKTp5YihuLmFqYXhTZXR0aW5ncyxhKX0sYWpheFByZWZpbHRlcjp3YihzYiksYWpheFRyYW5zcG9ydDp3Yih0YiksYWpheDpmdW5jdGlvbihiLGMpe1wib2JqZWN0XCI9PXR5cGVvZiBiJiYoYz1iLGI9dm9pZCAwKSxjPWN8fHt9O3ZhciBlLGYsZyxoLGksaixrLGwsbT1uLmFqYXhTZXR1cCh7fSxjKSxvPW0uY29udGV4dHx8bSxwPW0uY29udGV4dCYmKG8ubm9kZVR5cGV8fG8uanF1ZXJ5KT9uKG8pOm4uZXZlbnQscT1uLkRlZmVycmVkKCkscj1uLkNhbGxiYWNrcyhcIm9uY2UgbWVtb3J5XCIpLHM9bS5zdGF0dXNDb2RlfHx7fSx0PXt9LHU9e30sdj0wLHc9XCJjYW5jZWxlZFwiLHg9e3JlYWR5U3RhdGU6MCxnZXRSZXNwb25zZUhlYWRlcjpmdW5jdGlvbihhKXt2YXIgYjtpZigyPT09dil7aWYoIWgpe2g9e307d2hpbGUoYj1vYi5leGVjKGcpKWhbYlsxXS50b0xvd2VyQ2FzZSgpXT1iWzJdfWI9aFthLnRvTG93ZXJDYXNlKCldfXJldHVybiBudWxsPT1iP251bGw6Yn0sZ2V0QWxsUmVzcG9uc2VIZWFkZXJzOmZ1bmN0aW9uKCl7cmV0dXJuIDI9PT12P2c6bnVsbH0sc2V0UmVxdWVzdEhlYWRlcjpmdW5jdGlvbihhLGIpe3ZhciBjPWEudG9Mb3dlckNhc2UoKTtyZXR1cm4gdnx8KGE9dVtjXT11W2NdfHxhLHRbYV09YiksdGhpc30sb3ZlcnJpZGVNaW1lVHlwZTpmdW5jdGlvbihhKXtyZXR1cm4gdnx8KG0ubWltZVR5cGU9YSksdGhpc30sc3RhdHVzQ29kZTpmdW5jdGlvbihhKXt2YXIgYjtpZihhKWlmKDI+dilmb3IoYiBpbiBhKXNbYl09W3NbYl0sYVtiXV07ZWxzZSB4LmFsd2F5cyhhW3guc3RhdHVzXSk7cmV0dXJuIHRoaXN9LGFib3J0OmZ1bmN0aW9uKGEpe3ZhciBiPWF8fHc7cmV0dXJuIGUmJmUuYWJvcnQoYikseigwLGIpLHRoaXN9fTtpZihxLnByb21pc2UoeCkuY29tcGxldGU9ci5hZGQseC5zdWNjZXNzPXguZG9uZSx4LmVycm9yPXguZmFpbCxtLnVybD0oKGJ8fG0udXJsfHxqYi5ocmVmKStcIlwiKS5yZXBsYWNlKG1iLFwiXCIpLnJlcGxhY2UocmIsamIucHJvdG9jb2wrXCIvL1wiKSxtLnR5cGU9Yy5tZXRob2R8fGMudHlwZXx8bS5tZXRob2R8fG0udHlwZSxtLmRhdGFUeXBlcz1uLnRyaW0obS5kYXRhVHlwZXx8XCIqXCIpLnRvTG93ZXJDYXNlKCkubWF0Y2goRyl8fFtcIlwiXSxudWxsPT1tLmNyb3NzRG9tYWluKXtqPWQuY3JlYXRlRWxlbWVudChcImFcIik7dHJ5e2ouaHJlZj1tLnVybCxqLmhyZWY9ai5ocmVmLG0uY3Jvc3NEb21haW49dmIucHJvdG9jb2wrXCIvL1wiK3ZiLmhvc3QhPWoucHJvdG9jb2wrXCIvL1wiK2ouaG9zdH1jYXRjaCh5KXttLmNyb3NzRG9tYWluPSEwfX1pZihtLmRhdGEmJm0ucHJvY2Vzc0RhdGEmJlwic3RyaW5nXCIhPXR5cGVvZiBtLmRhdGEmJihtLmRhdGE9bi5wYXJhbShtLmRhdGEsbS50cmFkaXRpb25hbCkpLHhiKHNiLG0sYyx4KSwyPT09dilyZXR1cm4geDtrPW4uZXZlbnQmJm0uZ2xvYmFsLGsmJjA9PT1uLmFjdGl2ZSsrJiZuLmV2ZW50LnRyaWdnZXIoXCJhamF4U3RhcnRcIiksbS50eXBlPW0udHlwZS50b1VwcGVyQ2FzZSgpLG0uaGFzQ29udGVudD0hcWIudGVzdChtLnR5cGUpLGY9bS51cmwsbS5oYXNDb250ZW50fHwobS5kYXRhJiYoZj1tLnVybCs9KGxiLnRlc3QoZik/XCImXCI6XCI/XCIpK20uZGF0YSxkZWxldGUgbS5kYXRhKSxtLmNhY2hlPT09ITEmJihtLnVybD1uYi50ZXN0KGYpP2YucmVwbGFjZShuYixcIiQxXz1cIitrYisrKTpmKyhsYi50ZXN0KGYpP1wiJlwiOlwiP1wiKStcIl89XCIra2IrKykpLG0uaWZNb2RpZmllZCYmKG4ubGFzdE1vZGlmaWVkW2ZdJiZ4LnNldFJlcXVlc3RIZWFkZXIoXCJJZi1Nb2RpZmllZC1TaW5jZVwiLG4ubGFzdE1vZGlmaWVkW2ZdKSxuLmV0YWdbZl0mJnguc2V0UmVxdWVzdEhlYWRlcihcIklmLU5vbmUtTWF0Y2hcIixuLmV0YWdbZl0pKSwobS5kYXRhJiZtLmhhc0NvbnRlbnQmJm0uY29udGVudFR5cGUhPT0hMXx8Yy5jb250ZW50VHlwZSkmJnguc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLG0uY29udGVudFR5cGUpLHguc2V0UmVxdWVzdEhlYWRlcihcIkFjY2VwdFwiLG0uZGF0YVR5cGVzWzBdJiZtLmFjY2VwdHNbbS5kYXRhVHlwZXNbMF1dP20uYWNjZXB0c1ttLmRhdGFUeXBlc1swXV0rKFwiKlwiIT09bS5kYXRhVHlwZXNbMF0/XCIsIFwiK3ViK1wiOyBxPTAuMDFcIjpcIlwiKTptLmFjY2VwdHNbXCIqXCJdKTtmb3IobCBpbiBtLmhlYWRlcnMpeC5zZXRSZXF1ZXN0SGVhZGVyKGwsbS5oZWFkZXJzW2xdKTtpZihtLmJlZm9yZVNlbmQmJihtLmJlZm9yZVNlbmQuY2FsbChvLHgsbSk9PT0hMXx8Mj09PXYpKXJldHVybiB4LmFib3J0KCk7dz1cImFib3J0XCI7Zm9yKGwgaW57c3VjY2VzczoxLGVycm9yOjEsY29tcGxldGU6MX0peFtsXShtW2xdKTtpZihlPXhiKHRiLG0sYyx4KSl7aWYoeC5yZWFkeVN0YXRlPTEsayYmcC50cmlnZ2VyKFwiYWpheFNlbmRcIixbeCxtXSksMj09PXYpcmV0dXJuIHg7bS5hc3luYyYmbS50aW1lb3V0PjAmJihpPWEuc2V0VGltZW91dChmdW5jdGlvbigpe3guYWJvcnQoXCJ0aW1lb3V0XCIpfSxtLnRpbWVvdXQpKTt0cnl7dj0xLGUuc2VuZCh0LHopfWNhdGNoKHkpe2lmKCEoMj52KSl0aHJvdyB5O3ooLTEseSl9fWVsc2UgeigtMSxcIk5vIFRyYW5zcG9ydFwiKTtmdW5jdGlvbiB6KGIsYyxkLGgpe3ZhciBqLGwsdCx1LHcseT1jOzIhPT12JiYodj0yLGkmJmEuY2xlYXJUaW1lb3V0KGkpLGU9dm9pZCAwLGc9aHx8XCJcIix4LnJlYWR5U3RhdGU9Yj4wPzQ6MCxqPWI+PTIwMCYmMzAwPmJ8fDMwND09PWIsZCYmKHU9emIobSx4LGQpKSx1PUFiKG0sdSx4LGopLGo/KG0uaWZNb2RpZmllZCYmKHc9eC5nZXRSZXNwb25zZUhlYWRlcihcIkxhc3QtTW9kaWZpZWRcIiksdyYmKG4ubGFzdE1vZGlmaWVkW2ZdPXcpLHc9eC5nZXRSZXNwb25zZUhlYWRlcihcImV0YWdcIiksdyYmKG4uZXRhZ1tmXT13KSksMjA0PT09Ynx8XCJIRUFEXCI9PT1tLnR5cGU/eT1cIm5vY29udGVudFwiOjMwND09PWI/eT1cIm5vdG1vZGlmaWVkXCI6KHk9dS5zdGF0ZSxsPXUuZGF0YSx0PXUuZXJyb3Isaj0hdCkpOih0PXksIWImJnl8fCh5PVwiZXJyb3JcIiwwPmImJihiPTApKSkseC5zdGF0dXM9Yix4LnN0YXR1c1RleHQ9KGN8fHkpK1wiXCIsaj9xLnJlc29sdmVXaXRoKG8sW2wseSx4XSk6cS5yZWplY3RXaXRoKG8sW3gseSx0XSkseC5zdGF0dXNDb2RlKHMpLHM9dm9pZCAwLGsmJnAudHJpZ2dlcihqP1wiYWpheFN1Y2Nlc3NcIjpcImFqYXhFcnJvclwiLFt4LG0saj9sOnRdKSxyLmZpcmVXaXRoKG8sW3gseV0pLGsmJihwLnRyaWdnZXIoXCJhamF4Q29tcGxldGVcIixbeCxtXSksLS1uLmFjdGl2ZXx8bi5ldmVudC50cmlnZ2VyKFwiYWpheFN0b3BcIikpKX1yZXR1cm4geH0sZ2V0SlNPTjpmdW5jdGlvbihhLGIsYyl7cmV0dXJuIG4uZ2V0KGEsYixjLFwianNvblwiKX0sZ2V0U2NyaXB0OmZ1bmN0aW9uKGEsYil7cmV0dXJuIG4uZ2V0KGEsdm9pZCAwLGIsXCJzY3JpcHRcIil9fSksbi5lYWNoKFtcImdldFwiLFwicG9zdFwiXSxmdW5jdGlvbihhLGIpe25bYl09ZnVuY3Rpb24oYSxjLGQsZSl7cmV0dXJuIG4uaXNGdW5jdGlvbihjKSYmKGU9ZXx8ZCxkPWMsYz12b2lkIDApLG4uYWpheChuLmV4dGVuZCh7dXJsOmEsdHlwZTpiLGRhdGFUeXBlOmUsZGF0YTpjLHN1Y2Nlc3M6ZH0sbi5pc1BsYWluT2JqZWN0KGEpJiZhKSl9fSksbi5fZXZhbFVybD1mdW5jdGlvbihhKXtyZXR1cm4gbi5hamF4KHt1cmw6YSx0eXBlOlwiR0VUXCIsZGF0YVR5cGU6XCJzY3JpcHRcIixhc3luYzohMSxnbG9iYWw6ITEsXCJ0aHJvd3NcIjohMH0pfSxuLmZuLmV4dGVuZCh7d3JhcEFsbDpmdW5jdGlvbihhKXt2YXIgYjtyZXR1cm4gbi5pc0Z1bmN0aW9uKGEpP3RoaXMuZWFjaChmdW5jdGlvbihiKXtuKHRoaXMpLndyYXBBbGwoYS5jYWxsKHRoaXMsYikpfSk6KHRoaXNbMF0mJihiPW4oYSx0aGlzWzBdLm93bmVyRG9jdW1lbnQpLmVxKDApLmNsb25lKCEwKSx0aGlzWzBdLnBhcmVudE5vZGUmJmIuaW5zZXJ0QmVmb3JlKHRoaXNbMF0pLGIubWFwKGZ1bmN0aW9uKCl7dmFyIGE9dGhpczt3aGlsZShhLmZpcnN0RWxlbWVudENoaWxkKWE9YS5maXJzdEVsZW1lbnRDaGlsZDtyZXR1cm4gYX0pLmFwcGVuZCh0aGlzKSksdGhpcyl9LHdyYXBJbm5lcjpmdW5jdGlvbihhKXtyZXR1cm4gbi5pc0Z1bmN0aW9uKGEpP3RoaXMuZWFjaChmdW5jdGlvbihiKXtuKHRoaXMpLndyYXBJbm5lcihhLmNhbGwodGhpcyxiKSl9KTp0aGlzLmVhY2goZnVuY3Rpb24oKXt2YXIgYj1uKHRoaXMpLGM9Yi5jb250ZW50cygpO2MubGVuZ3RoP2Mud3JhcEFsbChhKTpiLmFwcGVuZChhKX0pfSx3cmFwOmZ1bmN0aW9uKGEpe3ZhciBiPW4uaXNGdW5jdGlvbihhKTtyZXR1cm4gdGhpcy5lYWNoKGZ1bmN0aW9uKGMpe24odGhpcykud3JhcEFsbChiP2EuY2FsbCh0aGlzLGMpOmEpfSl9LHVud3JhcDpmdW5jdGlvbigpe3JldHVybiB0aGlzLnBhcmVudCgpLmVhY2goZnVuY3Rpb24oKXtuLm5vZGVOYW1lKHRoaXMsXCJib2R5XCIpfHxuKHRoaXMpLnJlcGxhY2VXaXRoKHRoaXMuY2hpbGROb2Rlcyl9KS5lbmQoKX19KSxuLmV4cHIuZmlsdGVycy5oaWRkZW49ZnVuY3Rpb24oYSl7cmV0dXJuIW4uZXhwci5maWx0ZXJzLnZpc2libGUoYSl9LG4uZXhwci5maWx0ZXJzLnZpc2libGU9ZnVuY3Rpb24oYSl7cmV0dXJuIGEub2Zmc2V0V2lkdGg+MHx8YS5vZmZzZXRIZWlnaHQ+MHx8YS5nZXRDbGllbnRSZWN0cygpLmxlbmd0aD4wfTt2YXIgQmI9LyUyMC9nLENiPS9cXFtcXF0kLyxEYj0vXFxyP1xcbi9nLEViPS9eKD86c3VibWl0fGJ1dHRvbnxpbWFnZXxyZXNldHxmaWxlKSQvaSxGYj0vXig/OmlucHV0fHNlbGVjdHx0ZXh0YXJlYXxrZXlnZW4pL2k7ZnVuY3Rpb24gR2IoYSxiLGMsZCl7dmFyIGU7aWYobi5pc0FycmF5KGIpKW4uZWFjaChiLGZ1bmN0aW9uKGIsZSl7Y3x8Q2IudGVzdChhKT9kKGEsZSk6R2IoYStcIltcIisoXCJvYmplY3RcIj09dHlwZW9mIGUmJm51bGwhPWU/YjpcIlwiKStcIl1cIixlLGMsZCl9KTtlbHNlIGlmKGN8fFwib2JqZWN0XCIhPT1uLnR5cGUoYikpZChhLGIpO2Vsc2UgZm9yKGUgaW4gYilHYihhK1wiW1wiK2UrXCJdXCIsYltlXSxjLGQpfW4ucGFyYW09ZnVuY3Rpb24oYSxiKXt2YXIgYyxkPVtdLGU9ZnVuY3Rpb24oYSxiKXtiPW4uaXNGdW5jdGlvbihiKT9iKCk6bnVsbD09Yj9cIlwiOmIsZFtkLmxlbmd0aF09ZW5jb2RlVVJJQ29tcG9uZW50KGEpK1wiPVwiK2VuY29kZVVSSUNvbXBvbmVudChiKX07aWYodm9pZCAwPT09YiYmKGI9bi5hamF4U2V0dGluZ3MmJm4uYWpheFNldHRpbmdzLnRyYWRpdGlvbmFsKSxuLmlzQXJyYXkoYSl8fGEuanF1ZXJ5JiYhbi5pc1BsYWluT2JqZWN0KGEpKW4uZWFjaChhLGZ1bmN0aW9uKCl7ZSh0aGlzLm5hbWUsdGhpcy52YWx1ZSl9KTtlbHNlIGZvcihjIGluIGEpR2IoYyxhW2NdLGIsZSk7cmV0dXJuIGQuam9pbihcIiZcIikucmVwbGFjZShCYixcIitcIil9LG4uZm4uZXh0ZW5kKHtzZXJpYWxpemU6ZnVuY3Rpb24oKXtyZXR1cm4gbi5wYXJhbSh0aGlzLnNlcmlhbGl6ZUFycmF5KCkpfSxzZXJpYWxpemVBcnJheTpmdW5jdGlvbigpe3JldHVybiB0aGlzLm1hcChmdW5jdGlvbigpe3ZhciBhPW4ucHJvcCh0aGlzLFwiZWxlbWVudHNcIik7cmV0dXJuIGE/bi5tYWtlQXJyYXkoYSk6dGhpc30pLmZpbHRlcihmdW5jdGlvbigpe3ZhciBhPXRoaXMudHlwZTtyZXR1cm4gdGhpcy5uYW1lJiYhbih0aGlzKS5pcyhcIjpkaXNhYmxlZFwiKSYmRmIudGVzdCh0aGlzLm5vZGVOYW1lKSYmIUViLnRlc3QoYSkmJih0aGlzLmNoZWNrZWR8fCFYLnRlc3QoYSkpfSkubWFwKGZ1bmN0aW9uKGEsYil7dmFyIGM9bih0aGlzKS52YWwoKTtyZXR1cm4gbnVsbD09Yz9udWxsOm4uaXNBcnJheShjKT9uLm1hcChjLGZ1bmN0aW9uKGEpe3JldHVybntuYW1lOmIubmFtZSx2YWx1ZTphLnJlcGxhY2UoRGIsXCJcXHJcXG5cIil9fSk6e25hbWU6Yi5uYW1lLHZhbHVlOmMucmVwbGFjZShEYixcIlxcclxcblwiKX19KS5nZXQoKX19KSxuLmFqYXhTZXR0aW5ncy54aHI9ZnVuY3Rpb24oKXt0cnl7cmV0dXJuIG5ldyBhLlhNTEh0dHBSZXF1ZXN0fWNhdGNoKGIpe319O3ZhciBIYj17MDoyMDAsMTIyMzoyMDR9LEliPW4uYWpheFNldHRpbmdzLnhocigpO2wuY29ycz0hIUliJiZcIndpdGhDcmVkZW50aWFsc1wiaW4gSWIsbC5hamF4PUliPSEhSWIsbi5hamF4VHJhbnNwb3J0KGZ1bmN0aW9uKGIpe3ZhciBjLGQ7cmV0dXJuIGwuY29yc3x8SWImJiFiLmNyb3NzRG9tYWluP3tzZW5kOmZ1bmN0aW9uKGUsZil7dmFyIGcsaD1iLnhocigpO2lmKGgub3BlbihiLnR5cGUsYi51cmwsYi5hc3luYyxiLnVzZXJuYW1lLGIucGFzc3dvcmQpLGIueGhyRmllbGRzKWZvcihnIGluIGIueGhyRmllbGRzKWhbZ109Yi54aHJGaWVsZHNbZ107Yi5taW1lVHlwZSYmaC5vdmVycmlkZU1pbWVUeXBlJiZoLm92ZXJyaWRlTWltZVR5cGUoYi5taW1lVHlwZSksYi5jcm9zc0RvbWFpbnx8ZVtcIlgtUmVxdWVzdGVkLVdpdGhcIl18fChlW1wiWC1SZXF1ZXN0ZWQtV2l0aFwiXT1cIlhNTEh0dHBSZXF1ZXN0XCIpO2ZvcihnIGluIGUpaC5zZXRSZXF1ZXN0SGVhZGVyKGcsZVtnXSk7Yz1mdW5jdGlvbihhKXtyZXR1cm4gZnVuY3Rpb24oKXtjJiYoYz1kPWgub25sb2FkPWgub25lcnJvcj1oLm9uYWJvcnQ9aC5vbnJlYWR5c3RhdGVjaGFuZ2U9bnVsbCxcImFib3J0XCI9PT1hP2guYWJvcnQoKTpcImVycm9yXCI9PT1hP1wibnVtYmVyXCIhPXR5cGVvZiBoLnN0YXR1cz9mKDAsXCJlcnJvclwiKTpmKGguc3RhdHVzLGguc3RhdHVzVGV4dCk6ZihIYltoLnN0YXR1c118fGguc3RhdHVzLGguc3RhdHVzVGV4dCxcInRleHRcIiE9PShoLnJlc3BvbnNlVHlwZXx8XCJ0ZXh0XCIpfHxcInN0cmluZ1wiIT10eXBlb2YgaC5yZXNwb25zZVRleHQ/e2JpbmFyeTpoLnJlc3BvbnNlfTp7dGV4dDpoLnJlc3BvbnNlVGV4dH0saC5nZXRBbGxSZXNwb25zZUhlYWRlcnMoKSkpfX0saC5vbmxvYWQ9YygpLGQ9aC5vbmVycm9yPWMoXCJlcnJvclwiKSx2b2lkIDAhPT1oLm9uYWJvcnQ/aC5vbmFib3J0PWQ6aC5vbnJlYWR5c3RhdGVjaGFuZ2U9ZnVuY3Rpb24oKXs0PT09aC5yZWFkeVN0YXRlJiZhLnNldFRpbWVvdXQoZnVuY3Rpb24oKXtjJiZkKCl9KX0sYz1jKFwiYWJvcnRcIik7dHJ5e2guc2VuZChiLmhhc0NvbnRlbnQmJmIuZGF0YXx8bnVsbCl9Y2F0Y2goaSl7aWYoYyl0aHJvdyBpfX0sYWJvcnQ6ZnVuY3Rpb24oKXtjJiZjKCl9fTp2b2lkIDB9KSxuLmFqYXhTZXR1cCh7YWNjZXB0czp7c2NyaXB0OlwidGV4dC9qYXZhc2NyaXB0LCBhcHBsaWNhdGlvbi9qYXZhc2NyaXB0LCBhcHBsaWNhdGlvbi9lY21hc2NyaXB0LCBhcHBsaWNhdGlvbi94LWVjbWFzY3JpcHRcIn0sY29udGVudHM6e3NjcmlwdDovXFxiKD86amF2YXxlY21hKXNjcmlwdFxcYi99LGNvbnZlcnRlcnM6e1widGV4dCBzY3JpcHRcIjpmdW5jdGlvbihhKXtyZXR1cm4gbi5nbG9iYWxFdmFsKGEpLGF9fX0pLG4uYWpheFByZWZpbHRlcihcInNjcmlwdFwiLGZ1bmN0aW9uKGEpe3ZvaWQgMD09PWEuY2FjaGUmJihhLmNhY2hlPSExKSxhLmNyb3NzRG9tYWluJiYoYS50eXBlPVwiR0VUXCIpfSksbi5hamF4VHJhbnNwb3J0KFwic2NyaXB0XCIsZnVuY3Rpb24oYSl7aWYoYS5jcm9zc0RvbWFpbil7dmFyIGIsYztyZXR1cm57c2VuZDpmdW5jdGlvbihlLGYpe2I9bihcIjxzY3JpcHQ+XCIpLnByb3Aoe2NoYXJzZXQ6YS5zY3JpcHRDaGFyc2V0LHNyYzphLnVybH0pLm9uKFwibG9hZCBlcnJvclwiLGM9ZnVuY3Rpb24oYSl7Yi5yZW1vdmUoKSxjPW51bGwsYSYmZihcImVycm9yXCI9PT1hLnR5cGU/NDA0OjIwMCxhLnR5cGUpfSksZC5oZWFkLmFwcGVuZENoaWxkKGJbMF0pfSxhYm9ydDpmdW5jdGlvbigpe2MmJmMoKX19fX0pO3ZhciBKYj1bXSxLYj0vKD0pXFw/KD89JnwkKXxcXD9cXD8vO24uYWpheFNldHVwKHtqc29ucDpcImNhbGxiYWNrXCIsanNvbnBDYWxsYmFjazpmdW5jdGlvbigpe3ZhciBhPUpiLnBvcCgpfHxuLmV4cGFuZG8rXCJfXCIra2IrKztyZXR1cm4gdGhpc1thXT0hMCxhfX0pLG4uYWpheFByZWZpbHRlcihcImpzb24ganNvbnBcIixmdW5jdGlvbihiLGMsZCl7dmFyIGUsZixnLGg9Yi5qc29ucCE9PSExJiYoS2IudGVzdChiLnVybCk/XCJ1cmxcIjpcInN0cmluZ1wiPT10eXBlb2YgYi5kYXRhJiYwPT09KGIuY29udGVudFR5cGV8fFwiXCIpLmluZGV4T2YoXCJhcHBsaWNhdGlvbi94LXd3dy1mb3JtLXVybGVuY29kZWRcIikmJktiLnRlc3QoYi5kYXRhKSYmXCJkYXRhXCIpO3JldHVybiBofHxcImpzb25wXCI9PT1iLmRhdGFUeXBlc1swXT8oZT1iLmpzb25wQ2FsbGJhY2s9bi5pc0Z1bmN0aW9uKGIuanNvbnBDYWxsYmFjayk/Yi5qc29ucENhbGxiYWNrKCk6Yi5qc29ucENhbGxiYWNrLGg/YltoXT1iW2hdLnJlcGxhY2UoS2IsXCIkMVwiK2UpOmIuanNvbnAhPT0hMSYmKGIudXJsKz0obGIudGVzdChiLnVybCk/XCImXCI6XCI/XCIpK2IuanNvbnArXCI9XCIrZSksYi5jb252ZXJ0ZXJzW1wic2NyaXB0IGpzb25cIl09ZnVuY3Rpb24oKXtyZXR1cm4gZ3x8bi5lcnJvcihlK1wiIHdhcyBub3QgY2FsbGVkXCIpLGdbMF19LGIuZGF0YVR5cGVzWzBdPVwianNvblwiLGY9YVtlXSxhW2VdPWZ1bmN0aW9uKCl7Zz1hcmd1bWVudHN9LGQuYWx3YXlzKGZ1bmN0aW9uKCl7dm9pZCAwPT09Zj9uKGEpLnJlbW92ZVByb3AoZSk6YVtlXT1mLGJbZV0mJihiLmpzb25wQ2FsbGJhY2s9Yy5qc29ucENhbGxiYWNrLEpiLnB1c2goZSkpLGcmJm4uaXNGdW5jdGlvbihmKSYmZihnWzBdKSxnPWY9dm9pZCAwfSksXCJzY3JpcHRcIik6dm9pZCAwfSksbi5wYXJzZUhUTUw9ZnVuY3Rpb24oYSxiLGMpe2lmKCFhfHxcInN0cmluZ1wiIT10eXBlb2YgYSlyZXR1cm4gbnVsbDtcImJvb2xlYW5cIj09dHlwZW9mIGImJihjPWIsYj0hMSksYj1ifHxkO3ZhciBlPXguZXhlYyhhKSxmPSFjJiZbXTtyZXR1cm4gZT9bYi5jcmVhdGVFbGVtZW50KGVbMV0pXTooZT1jYShbYV0sYixmKSxmJiZmLmxlbmd0aCYmbihmKS5yZW1vdmUoKSxuLm1lcmdlKFtdLGUuY2hpbGROb2RlcykpfTt2YXIgTGI9bi5mbi5sb2FkO24uZm4ubG9hZD1mdW5jdGlvbihhLGIsYyl7aWYoXCJzdHJpbmdcIiE9dHlwZW9mIGEmJkxiKXJldHVybiBMYi5hcHBseSh0aGlzLGFyZ3VtZW50cyk7dmFyIGQsZSxmLGc9dGhpcyxoPWEuaW5kZXhPZihcIiBcIik7cmV0dXJuIGg+LTEmJihkPW4udHJpbShhLnNsaWNlKGgpKSxhPWEuc2xpY2UoMCxoKSksbi5pc0Z1bmN0aW9uKGIpPyhjPWIsYj12b2lkIDApOmImJlwib2JqZWN0XCI9PXR5cGVvZiBiJiYoZT1cIlBPU1RcIiksZy5sZW5ndGg+MCYmbi5hamF4KHt1cmw6YSx0eXBlOmV8fFwiR0VUXCIsZGF0YVR5cGU6XCJodG1sXCIsZGF0YTpifSkuZG9uZShmdW5jdGlvbihhKXtmPWFyZ3VtZW50cyxnLmh0bWwoZD9uKFwiPGRpdj5cIikuYXBwZW5kKG4ucGFyc2VIVE1MKGEpKS5maW5kKGQpOmEpfSkuYWx3YXlzKGMmJmZ1bmN0aW9uKGEsYil7Zy5lYWNoKGZ1bmN0aW9uKCl7Yy5hcHBseSh0aGlzLGZ8fFthLnJlc3BvbnNlVGV4dCxiLGFdKX0pfSksdGhpc30sbi5lYWNoKFtcImFqYXhTdGFydFwiLFwiYWpheFN0b3BcIixcImFqYXhDb21wbGV0ZVwiLFwiYWpheEVycm9yXCIsXCJhamF4U3VjY2Vzc1wiLFwiYWpheFNlbmRcIl0sZnVuY3Rpb24oYSxiKXtuLmZuW2JdPWZ1bmN0aW9uKGEpe3JldHVybiB0aGlzLm9uKGIsYSl9fSksbi5leHByLmZpbHRlcnMuYW5pbWF0ZWQ9ZnVuY3Rpb24oYSl7cmV0dXJuIG4uZ3JlcChuLnRpbWVycyxmdW5jdGlvbihiKXtyZXR1cm4gYT09PWIuZWxlbX0pLmxlbmd0aH07ZnVuY3Rpb24gTWIoYSl7cmV0dXJuIG4uaXNXaW5kb3coYSk/YTo5PT09YS5ub2RlVHlwZSYmYS5kZWZhdWx0Vmlld31uLm9mZnNldD17c2V0T2Zmc2V0OmZ1bmN0aW9uKGEsYixjKXt2YXIgZCxlLGYsZyxoLGksaixrPW4uY3NzKGEsXCJwb3NpdGlvblwiKSxsPW4oYSksbT17fTtcInN0YXRpY1wiPT09ayYmKGEuc3R5bGUucG9zaXRpb249XCJyZWxhdGl2ZVwiKSxoPWwub2Zmc2V0KCksZj1uLmNzcyhhLFwidG9wXCIpLGk9bi5jc3MoYSxcImxlZnRcIiksaj0oXCJhYnNvbHV0ZVwiPT09a3x8XCJmaXhlZFwiPT09aykmJihmK2kpLmluZGV4T2YoXCJhdXRvXCIpPi0xLGo/KGQ9bC5wb3NpdGlvbigpLGc9ZC50b3AsZT1kLmxlZnQpOihnPXBhcnNlRmxvYXQoZil8fDAsZT1wYXJzZUZsb2F0KGkpfHwwKSxuLmlzRnVuY3Rpb24oYikmJihiPWIuY2FsbChhLGMsbi5leHRlbmQoe30saCkpKSxudWxsIT1iLnRvcCYmKG0udG9wPWIudG9wLWgudG9wK2cpLG51bGwhPWIubGVmdCYmKG0ubGVmdD1iLmxlZnQtaC5sZWZ0K2UpLFwidXNpbmdcImluIGI/Yi51c2luZy5jYWxsKGEsbSk6bC5jc3MobSl9fSxuLmZuLmV4dGVuZCh7b2Zmc2V0OmZ1bmN0aW9uKGEpe2lmKGFyZ3VtZW50cy5sZW5ndGgpcmV0dXJuIHZvaWQgMD09PWE/dGhpczp0aGlzLmVhY2goZnVuY3Rpb24oYil7bi5vZmZzZXQuc2V0T2Zmc2V0KHRoaXMsYSxiKX0pO3ZhciBiLGMsZD10aGlzWzBdLGU9e3RvcDowLGxlZnQ6MH0sZj1kJiZkLm93bmVyRG9jdW1lbnQ7aWYoZilyZXR1cm4gYj1mLmRvY3VtZW50RWxlbWVudCxuLmNvbnRhaW5zKGIsZCk/KGU9ZC5nZXRCb3VuZGluZ0NsaWVudFJlY3QoKSxjPU1iKGYpLHt0b3A6ZS50b3ArYy5wYWdlWU9mZnNldC1iLmNsaWVudFRvcCxsZWZ0OmUubGVmdCtjLnBhZ2VYT2Zmc2V0LWIuY2xpZW50TGVmdH0pOmV9LHBvc2l0aW9uOmZ1bmN0aW9uKCl7aWYodGhpc1swXSl7dmFyIGEsYixjPXRoaXNbMF0sZD17dG9wOjAsbGVmdDowfTtyZXR1cm5cImZpeGVkXCI9PT1uLmNzcyhjLFwicG9zaXRpb25cIik/Yj1jLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpOihhPXRoaXMub2Zmc2V0UGFyZW50KCksYj10aGlzLm9mZnNldCgpLG4ubm9kZU5hbWUoYVswXSxcImh0bWxcIil8fChkPWEub2Zmc2V0KCkpLGQudG9wKz1uLmNzcyhhWzBdLFwiYm9yZGVyVG9wV2lkdGhcIiwhMCksZC5sZWZ0Kz1uLmNzcyhhWzBdLFwiYm9yZGVyTGVmdFdpZHRoXCIsITApKSx7dG9wOmIudG9wLWQudG9wLW4uY3NzKGMsXCJtYXJnaW5Ub3BcIiwhMCksbGVmdDpiLmxlZnQtZC5sZWZ0LW4uY3NzKGMsXCJtYXJnaW5MZWZ0XCIsITApfX19LG9mZnNldFBhcmVudDpmdW5jdGlvbigpe3JldHVybiB0aGlzLm1hcChmdW5jdGlvbigpe3ZhciBhPXRoaXMub2Zmc2V0UGFyZW50O3doaWxlKGEmJlwic3RhdGljXCI9PT1uLmNzcyhhLFwicG9zaXRpb25cIikpYT1hLm9mZnNldFBhcmVudDtyZXR1cm4gYXx8RWF9KX19KSxuLmVhY2goe3Njcm9sbExlZnQ6XCJwYWdlWE9mZnNldFwiLHNjcm9sbFRvcDpcInBhZ2VZT2Zmc2V0XCJ9LGZ1bmN0aW9uKGEsYil7dmFyIGM9XCJwYWdlWU9mZnNldFwiPT09YjtuLmZuW2FdPWZ1bmN0aW9uKGQpe3JldHVybiBLKHRoaXMsZnVuY3Rpb24oYSxkLGUpe3ZhciBmPU1iKGEpO3JldHVybiB2b2lkIDA9PT1lP2Y/ZltiXTphW2RdOnZvaWQoZj9mLnNjcm9sbFRvKGM/Zi5wYWdlWE9mZnNldDplLGM/ZTpmLnBhZ2VZT2Zmc2V0KTphW2RdPWUpfSxhLGQsYXJndW1lbnRzLmxlbmd0aCl9fSksbi5lYWNoKFtcInRvcFwiLFwibGVmdFwiXSxmdW5jdGlvbihhLGIpe24uY3NzSG9va3NbYl09R2EobC5waXhlbFBvc2l0aW9uLGZ1bmN0aW9uKGEsYyl7cmV0dXJuIGM/KGM9RmEoYSxiKSxCYS50ZXN0KGMpP24oYSkucG9zaXRpb24oKVtiXStcInB4XCI6Yyk6dm9pZCAwfSl9KSxuLmVhY2goe0hlaWdodDpcImhlaWdodFwiLFdpZHRoOlwid2lkdGhcIn0sZnVuY3Rpb24oYSxiKXtuLmVhY2goe3BhZGRpbmc6XCJpbm5lclwiK2EsY29udGVudDpiLFwiXCI6XCJvdXRlclwiK2F9LGZ1bmN0aW9uKGMsZCl7bi5mbltkXT1mdW5jdGlvbihkLGUpe3ZhciBmPWFyZ3VtZW50cy5sZW5ndGgmJihjfHxcImJvb2xlYW5cIiE9dHlwZW9mIGQpLGc9Y3x8KGQ9PT0hMHx8ZT09PSEwP1wibWFyZ2luXCI6XCJib3JkZXJcIik7cmV0dXJuIEsodGhpcyxmdW5jdGlvbihiLGMsZCl7dmFyIGU7cmV0dXJuIG4uaXNXaW5kb3coYik/Yi5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnRbXCJjbGllbnRcIithXTo5PT09Yi5ub2RlVHlwZT8oZT1iLmRvY3VtZW50RWxlbWVudCxNYXRoLm1heChiLmJvZHlbXCJzY3JvbGxcIithXSxlW1wic2Nyb2xsXCIrYV0sYi5ib2R5W1wib2Zmc2V0XCIrYV0sZVtcIm9mZnNldFwiK2FdLGVbXCJjbGllbnRcIithXSkpOnZvaWQgMD09PWQ/bi5jc3MoYixjLGcpOm4uc3R5bGUoYixjLGQsZyl9LGIsZj9kOnZvaWQgMCxmLG51bGwpfX0pfSksbi5mbi5leHRlbmQoe2JpbmQ6ZnVuY3Rpb24oYSxiLGMpe3JldHVybiB0aGlzLm9uKGEsbnVsbCxiLGMpfSx1bmJpbmQ6ZnVuY3Rpb24oYSxiKXtyZXR1cm4gdGhpcy5vZmYoYSxudWxsLGIpfSxkZWxlZ2F0ZTpmdW5jdGlvbihhLGIsYyxkKXtyZXR1cm4gdGhpcy5vbihiLGEsYyxkKX0sdW5kZWxlZ2F0ZTpmdW5jdGlvbihhLGIsYyl7cmV0dXJuIDE9PT1hcmd1bWVudHMubGVuZ3RoP3RoaXMub2ZmKGEsXCIqKlwiKTp0aGlzLm9mZihiLGF8fFwiKipcIixjKX0sc2l6ZTpmdW5jdGlvbigpe3JldHVybiB0aGlzLmxlbmd0aH19KSxuLmZuLmFuZFNlbGY9bi5mbi5hZGRCYWNrLFwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZCYmZGVmaW5lKFwianF1ZXJ5XCIsW10sZnVuY3Rpb24oKXtyZXR1cm4gbn0pO3ZhciBOYj1hLmpRdWVyeSxPYj1hLiQ7cmV0dXJuIG4ubm9Db25mbGljdD1mdW5jdGlvbihiKXtyZXR1cm4gYS4kPT09biYmKGEuJD1PYiksYiYmYS5qUXVlcnk9PT1uJiYoYS5qUXVlcnk9TmIpLG59LGJ8fChhLmpRdWVyeT1hLiQ9biksbn0pO1xuIiwibW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiggUmVsZWFzZSApIHtcblxudmFyIGNyeXB0byA9IHJlcXVpcmUoIFwiY3J5cHRvXCIgKTtcbnZhciBzaGVsbCA9IHJlcXVpcmUoIFwic2hlbGxqc1wiICksXG5cdHBhdGggPSByZXF1aXJlKCBcInBhdGhcIiApLFxuXHRmcyA9IHJlcXVpcmUoIFwiZnNcIiApO1xuXG5mdW5jdGlvbiByZXBsYWNlQXRWZXJzaW9uKCkge1xuXHRjb25zb2xlLmxvZyggXCJSZXBsYWNpbmcgQFZFUlNJT04uLi5cIiApO1xuXHR2YXIgbWF0Y2hlcyA9IFtdO1xuXG5cdGZ1bmN0aW9uIHJlY3Vyc2UoIGZvbGRlciApIHtcblx0XHRmcy5yZWFkZGlyU3luYyggZm9sZGVyICkuZm9yRWFjaCggZnVuY3Rpb24oIGZpbGVOYW1lICkge1xuXHRcdFx0dmFyIGNvbnRlbnQsXG5cdFx0XHRcdGZ1bGxQYXRoID0gZm9sZGVyICsgXCIvXCIgKyBmaWxlTmFtZTtcblx0XHRcdGlmICggZnMuc3RhdFN5bmMoIGZ1bGxQYXRoICkuaXNEaXJlY3RvcnkoKSApIHtcblx0XHRcdFx0cmVjdXJzZSggZnVsbFBhdGggKTtcblx0XHRcdFx0cmV0dXJuO1xuXHRcdFx0fVxuXHRcdFx0Y29udGVudCA9IGZzLnJlYWRGaWxlU3luYyggZnVsbFBhdGgsIHtcblx0XHRcdFx0ZW5jb2Rpbmc6IFwidXRmLThcIlxuXHRcdFx0fSApO1xuXHRcdFx0aWYgKCAhL0BWRVJTSU9OLy50ZXN0KCBjb250ZW50ICkgKSB7XG5cdFx0XHRcdHJldHVybjtcblx0XHRcdH1cblx0XHRcdG1hdGNoZXMucHVzaCggZnVsbFBhdGggKTtcblx0XHRcdGZzLndyaXRlRmlsZVN5bmMoIGZ1bGxQYXRoLCBjb250ZW50LnJlcGxhY2UoIC9AVkVSU0lPTi9nLCBSZWxlYXNlLm5ld1ZlcnNpb24gKSApO1xuXHRcdH0gKTtcblx0fVxuXG5cdFsgXCJ1aVwiLCBcInRoZW1lc1wiIF0uZm9yRWFjaCggcmVjdXJzZSApO1xuXG5cdGNvbnNvbGUubG9nKCBcIlJlcGxhY2VkIEBWRVJTSU9OIGluIFwiICsgbWF0Y2hlcy5sZW5ndGggKyBcIiBmaWxlcy5cIiApO1xuXG5cdHJldHVybiBtYXRjaGVzO1xufVxuXG5mdW5jdGlvbiByZW1vdmVFeHRlcm5hbHMgKCBwYWNrYWdlciApIHtcblx0T2JqZWN0LmtleXMoIHBhY2thZ2VyLmJ1aWx0RmlsZXMgKS5mb3JFYWNoKCBmdW5jdGlvbiggZmlsZXBhdGggKSB7XG5cdFx0aWYgKCAvXmV4dGVybmFsXFwvLy50ZXN0KCBmaWxlcGF0aCApICkge1xuXHRcdFx0ZGVsZXRlIHBhY2thZ2VyLmJ1aWx0RmlsZXNbIGZpbGVwYXRoIF07XG5cdFx0fVxuXHR9ICk7XG59XG5cbmZ1bmN0aW9uIGFkZE1hbmlmZXN0KCBwYWNrYWdlciApIHtcblx0dmFyIG91dHB1dCA9IHBhY2thZ2VyLmJ1aWx0RmlsZXM7XG5cdG91dHB1dC5NQU5JRkVTVCA9IE9iamVjdC5rZXlzKCBvdXRwdXQgKS5zb3J0KCBmdW5jdGlvbiggYSwgYiApIHtcblx0XHRyZXR1cm4gYS5sb2NhbGVDb21wYXJlKCBiICk7XG5cdH0gKS5tYXAoIGZ1bmN0aW9uKCBmaWxlcGF0aCApIHtcblx0XHR2YXIgbWQ1ID0gY3J5cHRvLmNyZWF0ZUhhc2goIFwibWQ1XCIgKTtcblx0XHRtZDUudXBkYXRlKCBvdXRwdXRbIGZpbGVwYXRoIF0gKTtcblx0XHRyZXR1cm4gZmlsZXBhdGggKyBcIiBcIiArIG1kNS5kaWdlc3QoIFwiaGV4XCIgKTtcblx0fSApLmpvaW4oIFwiXFxuXCIgKTtcbn1cblxuZnVuY3Rpb24gYnVpbGRDRE5QYWNrYWdlKCBjYWxsYmFjayApIHtcblx0Y29uc29sZS5sb2coIFwiQnVpbGRpbmcgQ0ROIHBhY2thZ2VcIiApO1xuXHR2YXIgSnF1ZXJ5VWkgPSByZXF1aXJlKCBcImRvd25sb2FkLmpxdWVyeXVpLmNvbS9saWIvanF1ZXJ5LXVpXCIgKTtcblx0dmFyIFBhY2thZ2UgPSByZXF1aXJlKCBcImRvd25sb2FkLmpxdWVyeXVpLmNvbS9saWIvcGFja2FnZS0xLTEyLXRoZW1lc1wiICk7XG5cdHZhciBQYWNrYWdlciA9IHJlcXVpcmUoIFwibm9kZS1wYWNrYWdlclwiICk7XG5cdHZhciBqcXVlcnlVaSA9IG5ldyBKcXVlcnlVaSggcGF0aC5yZXNvbHZlKCBcIi5cIiApICk7XG5cdHZhciB0YXJnZXQgPSBmcy5jcmVhdGVXcml0ZVN0cmVhbSggXCIuLi9cIiArIGpxdWVyeVVpLnBrZy5uYW1lICsgXCItXCIgKyBqcXVlcnlVaS5wa2cudmVyc2lvbiArXG5cdFx0XCItY2RuLnppcFwiICk7XG5cdHZhciBwYWNrYWdlciA9IG5ldyBQYWNrYWdlcigganF1ZXJ5VWkuZmlsZXMoKS5jYWNoZSwgUGFja2FnZSwge1xuXHRcdGNvbXBvbmVudHM6IGpxdWVyeVVpLmNvbXBvbmVudHMoKS5tYXAoIGZ1bmN0aW9uKCBjb21wb25lbnQgKSB7XG5cdFx0XHRyZXR1cm4gY29tcG9uZW50Lm5hbWU7XG5cdFx0fSApLFxuXHRcdGpxdWVyeVVpOiBqcXVlcnlVaSxcblx0XHR0aGVtZVZhcnM6IG51bGxcblx0fSApO1xuXHRwYWNrYWdlci5yZWFkeS50aGVuKCBmdW5jdGlvbigpIHtcblx0XHRyZW1vdmVFeHRlcm5hbHMoIHBhY2thZ2VyICk7XG5cdFx0YWRkTWFuaWZlc3QoIHBhY2thZ2VyICk7XG5cdFx0cGFja2FnZXIudG9aaXAoIHRhcmdldCwge1xuXHRcdFx0YmFzZWRpcjogXCJcIlxuXHRcdH0sIGZ1bmN0aW9uKCBlcnJvciApIHtcblx0XHRcdGlmICggZXJyb3IgKSB7XG5cdFx0XHRcdFJlbGVhc2UuYWJvcnQoIFwiRmFpbGVkIHRvIHppcCBDRE4gcGFja2FnZVwiLCBlcnJvciApO1xuXHRcdFx0fVxuXHRcdFx0Y2FsbGJhY2soKTtcblx0XHR9ICk7XG5cdH0gKTtcbn1cblxuUmVsZWFzZS5kZWZpbmUoIHtcblx0bnBtUHVibGlzaDogdHJ1ZSxcblx0aXNzdWVUcmFja2VyOiBcInRyYWNcIixcblx0Y29udHJpYnV0b3JSZXBvcnRJZDogMjIsXG5cdGNoYW5nZWxvZ1NoZWxsOiBmdW5jdGlvbigpIHtcblx0XHR2YXIgbW9udGhOYW1lcyA9IFsgXCJKYW51YXJ5XCIsIFwiRmVicnVhcnlcIiwgXCJNYXJjaFwiLCBcIkFwcmlsXCIsIFwiTWF5XCIsIFwiSnVuZVwiLCBcIkp1bHlcIixcblx0XHRcdFx0XCJBdWd1c3RcIiwgXCJTZXB0ZW1iZXJcIiwgXCJPY3RvYmVyXCIsIFwiTm92ZW1iZXJcIiwgXCJEZWNlbWJlclwiIF0sXG5cdFx0XHRub3cgPSBuZXcgRGF0ZSgpO1xuXHRcdHJldHVybiBcIjxzY3JpcHQ+e1xcblxcdFxcXCJ0aXRsZVxcXCI6IFxcXCJqUXVlcnkgVUkgXCIgKyBSZWxlYXNlLm5ld1ZlcnNpb24gKyBcIiBDaGFuZ2Vsb2dcXFwiXFxuXCIgK1xuXHRcdFx0XCJ9PC9zY3JpcHQ+XFxuXFxuUmVsZWFzZWQgb24gXCIgKyBtb250aE5hbWVzWyBub3cuZ2V0TW9udGgoKSBdICsgXCIgXCIgKyBub3cuZ2V0RGF0ZSgpICtcblx0XHRcdFwiLCBcIiArIG5vdy5nZXRGdWxsWWVhcigpICsgXCJcXG5cXG5cIjtcblx0fSxcblx0Z2VuZXJhdGVBcnRpZmFjdHM6IGZ1bmN0aW9uKCBmbiApIHtcblx0XHR2YXIgZmlsZXMgPSByZXBsYWNlQXRWZXJzaW9uKCk7XG5cblx0XHRidWlsZENETlBhY2thZ2UoIGZ1bmN0aW9uIGNvcHlDZG5GaWxlcygpIHtcblx0XHRcdHZhciB6aXBGaWxlID0gc2hlbGwubHMoIFwiLi4vanF1ZXJ5Ki1jZG4uemlwXCIgKVsgMCBdLFxuXHRcdFx0XHR0bXBGb2xkZXIgPSBcIi4uL3RtcC16aXAtb3V0cHV0XCIsXG5cdFx0XHRcdHVuemlwQ29tbWFuZCA9IFwidW56aXAgLW8gXCIgKyB6aXBGaWxlICsgXCIgLWQgXCIgKyB0bXBGb2xkZXI7XG5cblx0XHRcdGNvbnNvbGUubG9nKCBcIlVuemlwcGluZyBmb3IgZGlzdC9jZG4gY29waWVzXCIgKTtcblx0XHRcdHNoZWxsLm1rZGlyKCBcIi1wXCIsIHRtcEZvbGRlciApO1xuXHRcdFx0UmVsZWFzZS5leGVjKCB7XG5cdFx0XHRcdGNvbW1hbmQ6IHVuemlwQ29tbWFuZCxcblx0XHRcdFx0c2lsZW50OiB0cnVlXG5cdFx0XHR9LCBcIkZhaWxlZCB0byB1bnppcCBjZG4gZmlsZXNcIiApO1xuXG5cdFx0XHRzaGVsbC5ta2RpciggXCItcFwiLCBcImRpc3QvY2RuXCIgKTtcblx0XHRcdHNoZWxsLmNwKCB0bXBGb2xkZXIgKyBcIi9qcXVlcnktdWkqLmpzXCIsIFwiZGlzdC9jZG5cIiApO1xuXHRcdFx0c2hlbGwuY3AoIFwiLXJcIiwgdG1wRm9sZGVyICsgXCIvdGhlbWVzXCIsIFwiZGlzdC9jZG5cIiApO1xuXHRcdFx0Zm4oIGZpbGVzICk7XG5cdFx0fSApO1xuXHR9XG59ICk7XG5cbn07XG5cbm1vZHVsZS5leHBvcnRzLmRlcGVuZGVuY2llcyA9IFtcblx0XCJkb3dubG9hZC5qcXVlcnl1aS5jb21AMi4xLjJcIixcblx0XCJub2RlLXBhY2thZ2VyQDAuMC42XCIsXG5cdFwic2hlbGxqc0AwLjIuNlwiXG5dO1xuIiwiLyoqXG4gKiBlczYtd2Vha21hcCAtIEEgV2Vha01hcCBwb2x5ZmlsbCB3cml0dGVuIGluIFR5cGVTY3JpcHQsIHVuaXQgdGVzdGVkIHVzaW5nIEphc21pbmUgYW5kIEthcm1hLlxuICpcbiAqIEBhdXRob3IgQnJlbmRlbiBQYWxtZXJcbiAqIEB2ZXJzaW9uIHYwLjAuMVxuICogQGxpY2Vuc2UgTUlUXG4gKi9cbiFmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO3ZhciBlOyFmdW5jdGlvbihlKXt2YXIgdD1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoKXt9cmV0dXJuIE9iamVjdC5kZWZpbmVQcm9wZXJ0eShlLFwiV0VBS01BUF9LRVlfSURFTlRJRklFUlwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm5cIldFQUtNQVBfS0VZX0lERU5USUZJRVJfc3BGOTFkd1gxNF9PWkFienllQ3UzXCJ9LGVudW1lcmFibGU6ITAsY29uZmlndXJhYmxlOiEwfSksT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJXRUFLTUFQX1NFVF9USFJPV0FCTEVfTUVTU0FHRVwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm5cIkludmFsaWQgdmFsdWUgdXNlZCBhcyB3ZWFrIG1hcCBrZXlcIn0sZW51bWVyYWJsZTohMCxjb25maWd1cmFibGU6ITB9KSxlfSgpO2UuV2Vha01hcENvbnN0YW50cz10fShlfHwoZT17fSkpO3ZhciBlOyFmdW5jdGlvbihlKXt2YXIgdD1mdW5jdGlvbigpe2Z1bmN0aW9uIGUoKXtpZihudWxsIT09ZS5pbnN0YW5jZSl0aHJvd1wiR2V0IHRoZSBpbnN0YW5jZSBvZiB0aGUgV2Vha01hcFNlcXVlbmNlciB1c2luZyB0aGUgZ2V0SW5zdGFuY2UgbWV0aG9kLlwiO3RoaXMuaWRlbnRpZmllcj0wfXJldHVybiBlLmdldEluc3RhbmNlPWZ1bmN0aW9uKCl7cmV0dXJuIG51bGw9PT1lLmluc3RhbmNlJiYoZS5pbnN0YW5jZT1uZXcgZSksZS5pbnN0YW5jZX0sZS5wcm90b3R5cGUubmV4dD1mdW5jdGlvbigpe3JldHVybiB0aGlzLmlkZW50aWZpZXIrK30sZS5pbnN0YW5jZT1udWxsLGV9KCk7ZS5XZWFrTWFwU2VxdWVuY2VyPXR9KGV8fChlPXt9KSk7dmFyIGU7IWZ1bmN0aW9uKGUpe3ZhciB0PWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCgpe31yZXR1cm4gdC5kZWZpbmVQcm9wZXJ0eT1mdW5jdGlvbihuKXt2YXIgcjtpZih0LmlzVmFsaWRPYmplY3Qobik9PT0hMSl0aHJvdyBuZXcgVHlwZUVycm9yKGUuV2Vha01hcENvbnN0YW50cy5XRUFLTUFQX1NFVF9USFJPV0FCTEVfTUVTU0FHRSk7aWYoXCJ1bmRlZmluZWRcIj09dHlwZW9mIG5bZS5XZWFrTWFwQ29uc3RhbnRzLldFQUtNQVBfS0VZX0lERU5USUZJRVJdKXtyPWUuV2Vha01hcFNlcXVlbmNlci5nZXRJbnN0YW5jZSgpLm5leHQoKTt0cnl7T2JqZWN0LmRlZmluZVByb3BlcnR5KG4sZS5XZWFrTWFwQ29uc3RhbnRzLldFQUtNQVBfS0VZX0lERU5USUZJRVIse2VudW1lcmFibGU6ITEsY29uZmlndXJhYmxlOiExLGdldDpmdW5jdGlvbigpe3JldHVybiByfX0pfWNhdGNoKGEpe3Rocm93IG5ldyBUeXBlRXJyb3IoZS5XZWFrTWFwQ29uc3RhbnRzLldFQUtNQVBfU0VUX1RIUk9XQUJMRV9NRVNTQUdFKX19ZWxzZSByPW5bZS5XZWFrTWFwQ29uc3RhbnRzLldFQUtNQVBfS0VZX0lERU5USUZJRVJdO3JldHVybiByfSx0LmdldFByb3BlcnR5PWZ1bmN0aW9uKG4pe3JldHVybiB0LmlzVmFsaWRPYmplY3Qobik9PT0hMD9uW2UuV2Vha01hcENvbnN0YW50cy5XRUFLTUFQX0tFWV9JREVOVElGSUVSXTp2b2lkIDB9LHQuaXNWYWxpZE9iamVjdD1mdW5jdGlvbihlKXtyZXR1cm4gZT09PU9iamVjdChlKX0sdH0oKTtlLldlYWtNYXBVdGlscz10fShlfHwoZT17fSkpO3ZhciBlOyFmdW5jdGlvbihlKXt2YXIgdD1mdW5jdGlvbigpe2Z1bmN0aW9uIHQoZSl7dm9pZCAwPT09ZSYmKGU9W10pLHRoaXMubWFwPXt9O2Zvcih2YXIgdD0wO3Q8ZS5sZW5ndGg7dCsrKXt2YXIgbj1lW3RdO24mJm4ubGVuZ3RoPj0yJiZ0aGlzLnNldChuWzBdLG5bMV0pfX1yZXR1cm4gdC5wcm90b3R5cGUuZ2V0PWZ1bmN0aW9uKHQpe2lmKHRoaXMuaGFzKHQpPT09ITApe3ZhciBuPVN0cmluZyhlLldlYWtNYXBVdGlscy5nZXRQcm9wZXJ0eSh0KSk7cmV0dXJuIHRoaXMubWFwW25dfX0sdC5wcm90b3R5cGUuaGFzPWZ1bmN0aW9uKHQpe3ZhciBuPVN0cmluZyhlLldlYWtNYXBVdGlscy5nZXRQcm9wZXJ0eSh0KSk7cmV0dXJuIHZvaWQgMCE9PW4mJlwidW5kZWZpbmVkXCIhPXR5cGVvZiB0aGlzLm1hcFtuXX0sdC5wcm90b3R5cGVbXCJkZWxldGVcIl09ZnVuY3Rpb24odCl7aWYodGhpcy5oYXModCk9PT0hMCl7dmFyIG49U3RyaW5nKGUuV2Vha01hcFV0aWxzLmdldFByb3BlcnR5KHQpKTtyZXR1cm4gZGVsZXRlIHRoaXMubWFwW25dLCEwfXJldHVybiExfSx0LnByb3RvdHlwZS5zZXQ9ZnVuY3Rpb24odCxuKXt2YXIgcj1TdHJpbmcoZS5XZWFrTWFwVXRpbHMuZGVmaW5lUHJvcGVydHkodCkpO3RoaXMubWFwW3JdPW59LHR9KCk7ZS5XZWFrTWFwPXR9KGV8fChlPXt9KSk7dmFyIGU7IWZ1bmN0aW9uKGUpe3dpbmRvdy5XZWFrTWFwfHwod2luZG93LldlYWtNYXA9ZS5XZWFrTWFwKX0oZXx8KGU9e30pKX0oKTsiLCIvKiEgaHlwZXJmb3JtLmpzLm9yZyAqL1xudmFyIGh5cGVyZm9ybT1mdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIGUoZSl7dmFyIHQ9YXJndW1lbnRzLmxlbmd0aD4xJiZ2b2lkIDAhPT1hcmd1bWVudHNbMV0/YXJndW1lbnRzWzFdOnt9LG49dC5idWJibGVzLHI9dm9pZCAwPT09bnx8bixpPXQuY2FuY2VsYWJsZSxhPXZvaWQgMCE9PWkmJmksbz1kb2N1bWVudC5jcmVhdGVFdmVudChcIkV2ZW50XCIpO3JldHVybiBvLmluaXRFdmVudChlLHIsYSksb31mdW5jdGlvbiB0KHQsbil7dmFyIHI9YXJndW1lbnRzLmxlbmd0aD4yJiZ2b2lkIDAhPT1hcmd1bWVudHNbMl0/YXJndW1lbnRzWzJdOnt9LGk9ci5idWJibGVzLGE9dm9pZCAwPT09aXx8aSxvPXIuY2FuY2VsYWJsZSxsPXZvaWQgMCE9PW8mJm8scz1hcmd1bWVudHMubGVuZ3RoPjMmJnZvaWQgMCE9PWFyZ3VtZW50c1szXT9hcmd1bWVudHNbM106e307biBpbnN0YW5jZW9mIHdpbmRvdy5FdmVudHx8KG49ZShuLHtidWJibGVzOmEsY2FuY2VsYWJsZTpsfSkpO2Zvcih2YXIgdSBpbiBzKXMuaGFzT3duUHJvcGVydHkodSkmJihuW3VdPXNbdV0pO3JldHVybiB0LmRpc3BhdGNoRXZlbnQobiksbn1mdW5jdGlvbiBuKGUsdCl7cmV0dXJuIHllLmNhbGwoZSx0KX1mdW5jdGlvbiByKGUpe3JldHVybltcIm9iamVjdFwiLFwiZnVuY3Rpb25cIl0uaW5kZXhPZih0eXBlb2YgZSk+LTEmJihkZWxldGUgZS5fX2h5cGVyZm9ybSxPYmplY3QuZGVmaW5lUHJvcGVydHkoZSxcIl9faHlwZXJmb3JtXCIse2NvbmZpZ3VyYWJsZTohMCxlbnVtZXJhYmxlOiExLHZhbHVlOiEwfSkpLGV9ZnVuY3Rpb24gaSgpe3JldHVybihhcmd1bWVudHMubGVuZ3RoPjAmJnZvaWQgMCE9PWFyZ3VtZW50c1swXT9hcmd1bWVudHNbMF06XCJoZl9cIikrTWUrKytNYXRoLnJhbmRvbSgpLnRvU3RyaW5nKDM2KS5zdWJzdHIoMil9ZnVuY3Rpb24gYShlKXtyZXR1cm4gZS5mb3JtP0FycmF5LnByb3RvdHlwZS5maWx0ZXIuY2FsbChlLmZvcm0uZWxlbWVudHMsZnVuY3Rpb24odCl7cmV0dXJuXCJyYWRpb1wiPT09dC50eXBlJiZ0Lm5hbWU9PT1lLm5hbWV9KTpbZV19ZnVuY3Rpb24gbyhlKXt2YXIgdCxuPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywxKTtyZXR1cm4gZSBpbiBfZSYmKHQ9X2VbZV0ucmVkdWNlKGZ1bmN0aW9uKHQpe3JldHVybiBmdW5jdGlvbihuLHIpe3ZhciBpPXIuYXBwbHkoe3N0YXRlOm4saG9vazplfSx0KTtyZXR1cm4gdm9pZCAwIT09aT9pOm59fShuKSx0KSksdH1mdW5jdGlvbiBsKGUsdCl7dmFyIG49dCxyPUFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cywxKTtyZXR1cm4gZSBpbiBfZSYmKG49X2VbZV0ucmVkdWNlKGZ1bmN0aW9uKHQsbil7clswXT10O3ZhciBpPW4uYXBwbHkoe3N0YXRlOnQsaG9vazplfSxyKTtyZXR1cm4gdm9pZCAwIT09aT9pOnR9LG4pKSxufWZ1bmN0aW9uIHMoZSx0KXtpZihlIGluIF9lKWZvcih2YXIgbj0wO248X2VbZV0ubGVuZ3RoO24rKylpZihfZVtlXVtuXT09PXQpe19lW2VdLnNwbGljZShuLDEpO2JyZWFrfX1mdW5jdGlvbiB1KGUsdCxuKXtlIGluIF9lfHwoX2VbZV09W10pLHZvaWQgMD09PW4mJihuPV9lW2VdLmxlbmd0aCksX2VbZV0uc3BsaWNlKG4sMCx0KX1mdW5jdGlvbiBjKGUpe2lmKGUgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTFRleHRBcmVhRWxlbWVudClyZXR1cm5cInRleHRhcmVhXCI7aWYoZSBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MU2VsZWN0RWxlbWVudClyZXR1cm4gZS5oYXNBdHRyaWJ1dGUoXCJtdWx0aXBsZVwiKT9cInNlbGVjdC1tdWx0aXBsZVwiOlwic2VsZWN0LW9uZVwiO2lmKGUgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTEJ1dHRvbkVsZW1lbnQpcmV0dXJuKGUuZ2V0QXR0cmlidXRlKFwidHlwZVwiKXx8XCJzdWJtaXRcIikudG9Mb3dlckNhc2UoKTtpZihlIGluc3RhbmNlb2Ygd2luZG93LkhUTUxJbnB1dEVsZW1lbnQpe3ZhciB0PShlLmdldEF0dHJpYnV0ZShcInR5cGVcIil8fFwiXCIpLnRvTG93ZXJDYXNlKCk7cmV0dXJuIHQmJkhlLmluZGV4T2YodCk+LTE/dDplLnR5cGV8fFwidGV4dFwifXJldHVyblwiXCJ9ZnVuY3Rpb24gZChlKXtmb3IodmFyIHQ9ZS5wYXJlbnROb2RlO3QmJjE9PT10Lm5vZGVUeXBlOyl7aWYodCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MRmllbGRTZXRFbGVtZW50JiZ0Lmhhc0F0dHJpYnV0ZShcImRpc2FibGVkXCIpKXJldHVybiEwO2lmKFwiREFUQUxJU1RcIj09PXQubm9kZU5hbWUudG9VcHBlckNhc2UoKSlyZXR1cm4hMDtpZih0PT09ZS5mb3JtKWJyZWFrO3Q9dC5wYXJlbnROb2RlfXJldHVybiExfWZ1bmN0aW9uIGYoZSl7dmFyIHQ9bChcImlzX3ZhbGlkYXRpb25fY2FuZGlkYXRlXCIsbnVsbCxlKTtpZihudWxsIT09dClyZXR1cm4hIXQ7aWYoZSBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MU2VsZWN0RWxlbWVudHx8ZSBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MVGV4dEFyZWFFbGVtZW50fHxlIGluc3RhbmNlb2Ygd2luZG93LkhUTUxCdXR0b25FbGVtZW50fHxlIGluc3RhbmNlb2Ygd2luZG93LkhUTUxJbnB1dEVsZW1lbnQpe3ZhciBuPWMoZSk7aWYoKFVlLmluZGV4T2Yobik+LTF8fEZlLmluZGV4T2Yobik+LTEpJiYhZS5oYXNBdHRyaWJ1dGUoXCJkaXNhYmxlZFwiKSYmIWUuaGFzQXR0cmlidXRlKFwicmVhZG9ubHlcIikpe3ZhciByPW1lKGUpO2lmKChyJiYhci5zZXR0aW5ncy5ub3ZhbGlkYXRlT25FbGVtZW50c3x8IWUuaGFzQXR0cmlidXRlKFwibm92YWxpZGF0ZVwiKSYmIWUubm9WYWxpZGF0ZSkmJiFkKGUpKXJldHVybiEwfX1yZXR1cm4hMX1mdW5jdGlvbiB2KGUpe3N3aXRjaChhcmd1bWVudHMubGVuZ3RoPjEmJnZvaWQgMCE9PWFyZ3VtZW50c1sxXT9hcmd1bWVudHNbMV06dm9pZCAwKXtjYXNlXCJkYXRlXCI6cmV0dXJuKGUudG9Mb2NhbGVEYXRlU3RyaW5nfHxlLnRvRGF0ZVN0cmluZykuY2FsbChlKTtjYXNlXCJ0aW1lXCI6cmV0dXJuKGUudG9Mb2NhbGVUaW1lU3RyaW5nfHxlLnRvVGltZVN0cmluZykuY2FsbChlKTtjYXNlXCJtb250aFwiOnJldHVyblwidG9Mb2NhbGVEYXRlU3RyaW5nXCJpbiBlP2UudG9Mb2NhbGVEYXRlU3RyaW5nKHZvaWQgMCx7eWVhcjpcIm51bWVyaWNcIixtb250aDpcIjItZGlnaXRcIn0pOmUudG9EYXRlU3RyaW5nKCk7ZGVmYXVsdDpyZXR1cm4oZS50b0xvY2FsZVN0cmluZ3x8ZS50b1N0cmluZykuY2FsbChlKX19ZnVuY3Rpb24gbShlKXtmb3IodmFyIHQ9YXJndW1lbnRzLmxlbmd0aCxuPUFycmF5KHQ+MT90LTE6MCkscj0xO3I8dDtyKyspbltyLTFdPWFyZ3VtZW50c1tyXTt2YXIgaT1uLmxlbmd0aCxhPTA7cmV0dXJuIGUucmVwbGFjZSgvJShbMC05XStcXCQpPyhbc2xdKS9nLGZ1bmN0aW9uKGUsdCxyKXt2YXIgbz1hO3QmJihvPU51bWJlcih0LnJlcGxhY2UoL1xcJCQvLFwiXCIpKS0xKSxhKz0xO3ZhciBsPVwiXCI7cmV0dXJuIGk+byYmKGw9bltvXSksKGwgaW5zdGFuY2VvZiBEYXRlfHxcIm51bWJlclwiPT10eXBlb2YgbHx8bCBpbnN0YW5jZW9mIE51bWJlcikmJihsPVwibFwiPT09cj8obC50b0xvY2FsZVN0cmluZ3x8bC50b1N0cmluZykuY2FsbChsKTpsLnRvU3RyaW5nKCkpLGx9KX1mdW5jdGlvbiBnKGUpe2U9bmV3IERhdGUoK2UpLGUuc2V0VVRDSG91cnMoMCwwLDApLGUuc2V0VVRDRGF0ZShlLmdldFVUQ0RhdGUoKSs0LShlLmdldFVUQ0RheSgpfHw3KSk7dmFyIHQ9bmV3IERhdGUoZS5nZXRVVENGdWxsWWVhcigpLDAsMSksbj1NYXRoLmNlaWwoKChlLXQpLzg2NGU1KzEpLzcpO3JldHVybltlLmdldFVUQ0Z1bGxZZWFyKCksbl19ZnVuY3Rpb24gaChlKXtmb3IodmFyIHQ9YXJndW1lbnRzLmxlbmd0aD4xJiZ2b2lkIDAhPT1hcmd1bWVudHNbMV0/YXJndW1lbnRzWzFdOjIsbj1lK1wiXCI7bi5sZW5ndGg8dDspbj1cIjBcIituO3JldHVybiBufWZ1bmN0aW9uIHAoZSx0KXtpZighKGUgaW5zdGFuY2VvZiBEYXRlKSlyZXR1cm4gbnVsbDtzd2l0Y2godCl7Y2FzZVwiZGF0ZXRpbWVcIjpyZXR1cm4gcChlLFwiZGF0ZVwiKStcIlRcIitwKGUsXCJ0aW1lXCIpO2Nhc2VcImRhdGV0aW1lLWxvY2FsXCI6cmV0dXJuIG0oXCIlcy0lcy0lc1Qlczolczolcy4lc1wiLGUuZ2V0RnVsbFllYXIoKSxoKGUuZ2V0TW9udGgoKSsxKSxoKGUuZ2V0RGF0ZSgpKSxoKGUuZ2V0SG91cnMoKSksaChlLmdldE1pbnV0ZXMoKSksaChlLmdldFNlY29uZHMoKSksaChlLmdldE1pbGxpc2Vjb25kcygpLDMpKS5yZXBsYWNlKC8oOjAwKT9cXC4wMDAkLyxcIlwiKTtjYXNlXCJkYXRlXCI6cmV0dXJuIG0oXCIlcy0lcy0lc1wiLGUuZ2V0VVRDRnVsbFllYXIoKSxoKGUuZ2V0VVRDTW9udGgoKSsxKSxoKGUuZ2V0VVRDRGF0ZSgpKSk7Y2FzZVwibW9udGhcIjpyZXR1cm4gbShcIiVzLSVzXCIsZS5nZXRVVENGdWxsWWVhcigpLGgoZS5nZXRVVENNb250aCgpKzEpKTtjYXNlXCJ3ZWVrXCI6dmFyIG49ZyhlKTtyZXR1cm4gbS5jYWxsKG51bGwsXCIlcy1XJXNcIixuWzBdLGgoblsxXSkpO2Nhc2VcInRpbWVcIjpyZXR1cm4gbShcIiVzOiVzOiVzLiVzXCIsaChlLmdldFVUQ0hvdXJzKCkpLGgoZS5nZXRVVENNaW51dGVzKCkpLGgoZS5nZXRVVENTZWNvbmRzKCkpLGgoZS5nZXRVVENNaWxsaXNlY29uZHMoKSwzKSkucmVwbGFjZSgvKDowMCk/XFwuMDAwJC8sXCJcIil9cmV0dXJuIG51bGx9ZnVuY3Rpb24gdyhlLHQpe3ZhciBuPW5ldyBEYXRlKERhdGUuVVRDKHQsMCwxKzcqKGUtMSkpKTtyZXR1cm4gbi5nZXRVVENEYXkoKTw9ND9uLnNldFVUQ0RhdGUobi5nZXRVVENEYXRlKCktbi5nZXRVVENEYXkoKSsxKTpuLnNldFVUQ0RhdGUobi5nZXRVVENEYXRlKCkrOC1uLmdldFVUQ0RheSgpKSxufWZ1bmN0aW9uIGIoZSx0KXt2YXIgbixyPW5ldyBEYXRlKDApO3N3aXRjaCh0KXtjYXNlXCJkYXRldGltZVwiOmlmKCEvXihbMC05XXs0LH0pLShbMC05XXsyfSktKFswLTldezJ9KVQoWzAxXVswLTldfDJbMC0zXSk6KFswLTVdWzAtOV0pKD86OihbMC01XVswLTldKSg/OlxcLihbMC05XXsxLDN9KSk/KT8kLy50ZXN0KGUpKXJldHVybiBudWxsO2ZvcihuPVJlZ0V4cC4kN3x8XCIwMDBcIjtuLmxlbmd0aDwzOyluKz1cIjBcIjtyZXR1cm4gci5zZXRVVENGdWxsWWVhcihOdW1iZXIoUmVnRXhwLiQxKSksci5zZXRVVENNb250aChOdW1iZXIoUmVnRXhwLiQyKS0xLE51bWJlcihSZWdFeHAuJDMpKSxyLnNldFVUQ0hvdXJzKE51bWJlcihSZWdFeHAuJDQpLE51bWJlcihSZWdFeHAuJDUpLE51bWJlcihSZWdFeHAuJDZ8fDApLE51bWJlcihuKSkscjtjYXNlXCJkYXRlXCI6cmV0dXJuL14oWzAtOV17NCx9KS0oWzAtOV17Mn0pLShbMC05XXsyfSkkLy50ZXN0KGUpPyhyLnNldFVUQ0Z1bGxZZWFyKE51bWJlcihSZWdFeHAuJDEpKSxyLnNldFVUQ01vbnRoKE51bWJlcihSZWdFeHAuJDIpLTEsTnVtYmVyKFJlZ0V4cC4kMykpLHIpOm51bGw7Y2FzZVwibW9udGhcIjpyZXR1cm4vXihbMC05XXs0LH0pLShbMC05XXsyfSkkLy50ZXN0KGUpPyhyLnNldFVUQ0Z1bGxZZWFyKE51bWJlcihSZWdFeHAuJDEpKSxyLnNldFVUQ01vbnRoKE51bWJlcihSZWdFeHAuJDIpLTEsMSkscik6bnVsbDtjYXNlXCJ3ZWVrXCI6cmV0dXJuL14oWzAtOV17NCx9KS1XKDBbMS05XXxbMTIzNF1bMC05XXw1WzAtM10pJC8udGVzdChlKT93KE51bWJlcihSZWdFeHAuJDIpLE51bWJlcihSZWdFeHAuJDEpKTpudWxsO2Nhc2VcInRpbWVcIjppZighL14oWzAxXVswLTldfDJbMC0zXSk6KFswLTVdWzAtOV0pKD86OihbMC01XVswLTldKSg/OlxcLihbMC05XXsxLDN9KSk/KT8kLy50ZXN0KGUpKXJldHVybiBudWxsO2ZvcihuPVJlZ0V4cC4kNHx8XCIwMDBcIjtuLmxlbmd0aDwzOyluKz1cIjBcIjtyZXR1cm4gci5zZXRVVENIb3VycyhOdW1iZXIoUmVnRXhwLiQxKSxOdW1iZXIoUmVnRXhwLiQyKSxOdW1iZXIoUmVnRXhwLiQzfHwwKSxOdW1iZXIobikpLHJ9cmV0dXJuIG51bGx9ZnVuY3Rpb24geShlLHQpe3ZhciBuPWIoZSx0KTtyZXR1cm4gbnVsbCE9PW4/K246TnVtYmVyKGUpfWZ1bmN0aW9uIEUoZSl7UmU9ZSwkZT1lLnJlcGxhY2UoL1stX10uKi8sXCJcIil9ZnVuY3Rpb24gVChlLHQpe2UgaW4gUGV8fChQZVtlXT17fSk7Zm9yKHZhciBuIGluIHQpdC5oYXNPd25Qcm9wZXJ0eShuKSYmKFBlW2VdW25dPXRbbl0pfWZ1bmN0aW9uIE0oZSl7cmV0dXJuIFJlIGluIFBlJiZlIGluIFBlW1JlXT9QZVtSZV1bZV06JGUgaW4gUGUmJmUgaW4gUGVbJGVdP1BlWyRlXVtlXTplIGluIFBlLmVuP1BlLmVuW2VdOmV9ZnVuY3Rpb24gTChlKXt2YXIgdD1hcmd1bWVudHMubGVuZ3RoPjEmJnZvaWQgMCE9PWFyZ3VtZW50c1sxXT9hcmd1bWVudHNbMV06MSxuPWMoZSkscj1lLmdldEF0dHJpYnV0ZShcIm1pblwiKSxpPWplW25dfHxOYU47aWYocil7dmFyIGE9eShyLG4pO2lzTmFOKGEpfHwoaT1hKX12YXIgbz1lLmdldEF0dHJpYnV0ZShcIm1heFwiKSxsPUJlW25dfHxOYU47aWYobyl7dmFyIHM9eShvLG4pO2lzTmFOKHMpfHwobD1zKX12YXIgdT1lLmdldEF0dHJpYnV0ZShcInN0ZXBcIiksZD1WZVtuXXx8MTtpZih1JiZcImFueVwiPT09dS50b0xvd2VyQ2FzZSgpKXJldHVybltNKFwiYW55IHZhbHVlXCIpLE0oXCJhbnkgdmFsdWVcIildO2lmKHUpe3ZhciBmPXkodSxuKTtpc05hTihmKXx8KGQ9Zil9dmFyIHY9eShlLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpLG4pLG09eShlLnZhbHVlfHxlLmdldEF0dHJpYnV0ZShcInZhbHVlXCIpLG4pO2lmKGlzTmFOKG0pKXJldHVybltNKFwiYW55IHZhbGlkIHZhbHVlXCIpLE0oXCJhbnkgdmFsaWQgdmFsdWVcIildO3ZhciBnPWlzTmFOKGkpP2lzTmFOKHYpP1dlW25dfHwwOnY6aSxoPUllW25dfHwxLHc9ZytNYXRoLmZsb29yKChtLWcpLyhkKmgpKSooZCpoKSp0LGI9ZysoTWF0aC5mbG9vcigobS1nKS8oZCpoKSkrMSkqKGQqaCkqdDtyZXR1cm4gdzxpP3c9bnVsbDp3PmwmJih3PWwpLGI+bD9iPW51bGw6YjxpJiYoYj1pKSx4ZS5pbmRleE9mKG4pPi0xJiYodz1wKG5ldyBEYXRlKHcpLG4pLGI9cChuZXcgRGF0ZShiKSxuKSksW3csYl19ZnVuY3Rpb24gQShlKXtyZXR1cm4gZS5tYXRjaCgvW1xcMC1cXHVEN0ZGXFx1RTAwMC1cXHVGRkZGXXxbXFx1RDgwMC1cXHVEQkZGXVtcXHVEQzAwLVxcdURGRkZdfFtcXHVEODAwLVxcdURCRkZdKD8hW1xcdURDMDAtXFx1REZGRl0pfCg/OlteXFx1RDgwMC1cXHVEQkZGXXxeKVtcXHVEQzAwLVxcdURGRkZdL2cpLmxlbmd0aH1mdW5jdGlvbiBOKGUpe3ZhciB0PWMoZSk7aWYoLTE9PT1PZS5pbmRleE9mKHQpKXJldHVybiEwO2lmKCFlLnZhbHVlKXJldHVybiEoXCJfb3JpZ2luYWxfdmFsaWRpdHlcImluIGUmJiFlLl9vcmlnaW5hbF92YWxpZGl0eS5fX2h5cGVyZm9ybSl8fCFlLl9vcmlnaW5hbF92YWxpZGl0eS5iYWRJbnB1dDt2YXIgbj0hMDtzd2l0Y2godCl7Y2FzZVwiY29sb3JcIjpuPS9eI1thLWYwLTldezZ9JC8udGVzdChlLnZhbHVlKTticmVhaztjYXNlXCJudW1iZXJcIjpjYXNlXCJyYW5nZVwiOm49IWlzTmFOKE51bWJlcihlLnZhbHVlKSk7YnJlYWs7Y2FzZVwiZGF0ZXRpbWVcIjpjYXNlXCJkYXRlXCI6Y2FzZVwibW9udGhcIjpjYXNlXCJ3ZWVrXCI6Y2FzZVwidGltZVwiOm49bnVsbCE9PWIoZS52YWx1ZSx0KTticmVhaztjYXNlXCJkYXRldGltZS1sb2NhbFwiOm49L14oWzAtOV17NCx9KS0oMFsxLTldfDFbMDEyXSktKDBbMS05XXxbMTJdWzAtOV18M1swMV0pVChbMDFdWzAtOV18MlswLTNdKTooWzAtNV1bMC05XSkoPzo6KFswLTVdWzAtOV0pKD86XFwuKFswLTldezEsM30pKT8pPyQvLnRlc3QoZS52YWx1ZSl9cmV0dXJuIG59ZnVuY3Rpb24gXyhlKXt2YXIgdD1jKGUpO2lmKCFlLnZhbHVlfHwhZS5oYXNBdHRyaWJ1dGUoXCJtYXhcIikpcmV0dXJuITA7dmFyIG49dm9pZCAwLHI9dm9pZCAwO3JldHVybiB4ZS5pbmRleE9mKHQpPi0xPyhuPTEqYihlLnZhbHVlLHQpLHI9MSooYihlLmdldEF0dHJpYnV0ZShcIm1heFwiKSx0KXx8TmFOKSk6KG49TnVtYmVyKGUudmFsdWUpLHI9TnVtYmVyKGUuZ2V0QXR0cmlidXRlKFwibWF4XCIpKSksaXNOYU4ocil8fG48PXJ9ZnVuY3Rpb24geChlKXtpZighZS52YWx1ZXx8LTE9PT1TZS5pbmRleE9mKGMoZSkpfHwhZS5oYXNBdHRyaWJ1dGUoXCJtYXhsZW5ndGhcIil8fCFlLmdldEF0dHJpYnV0ZShcIm1heGxlbmd0aFwiKSlyZXR1cm4hMDt2YXIgdD1wYXJzZUludChlLmdldEF0dHJpYnV0ZShcIm1heGxlbmd0aFwiKSwxMCk7cmV0dXJuISEoaXNOYU4odCl8fHQ8MCl8fEEoZS52YWx1ZSk8PXR9ZnVuY3Rpb24gRChlKXt2YXIgdD1jKGUpO2lmKCFlLnZhbHVlfHwhZS5oYXNBdHRyaWJ1dGUoXCJtaW5cIikpcmV0dXJuITA7dmFyIG49dm9pZCAwLHI9dm9pZCAwO3JldHVybiB4ZS5pbmRleE9mKHQpPi0xPyhuPTEqYihlLnZhbHVlLHQpLHI9MSooYihlLmdldEF0dHJpYnV0ZShcIm1pblwiKSx0KXx8TmFOKSk6KG49TnVtYmVyKGUudmFsdWUpLHI9TnVtYmVyKGUuZ2V0QXR0cmlidXRlKFwibWluXCIpKSksaXNOYU4ocil8fG4+PXJ9ZnVuY3Rpb24gQyhlKXtpZighZS52YWx1ZXx8LTE9PT1TZS5pbmRleE9mKGMoZSkpfHwhZS5oYXNBdHRyaWJ1dGUoXCJtaW5sZW5ndGhcIil8fCFlLmdldEF0dHJpYnV0ZShcIm1pbmxlbmd0aFwiKSlyZXR1cm4hMDt2YXIgdD1wYXJzZUludChlLmdldEF0dHJpYnV0ZShcIm1pbmxlbmd0aFwiKSwxMCk7cmV0dXJuISEoaXNOYU4odCl8fHQ8MCl8fEEoZS52YWx1ZSk+PXR9ZnVuY3Rpb24gayhlKXtyZXR1cm4hZS52YWx1ZXx8IWUuaGFzQXR0cmlidXRlKFwicGF0dGVyblwiKXx8bmV3IFJlZ0V4cChcIl4oPzpcIitlLmdldEF0dHJpYnV0ZShcInBhdHRlcm5cIikrXCIpJFwiKS50ZXN0KGUudmFsdWUpfWZ1bmN0aW9uIE8oZSl7aWYoXCJyYWRpb1wiPT09ZS50eXBlKXtpZihlLmhhc0F0dHJpYnV0ZShcInJlcXVpcmVkXCIpJiZlLmNoZWNrZWQpcmV0dXJuITA7dmFyIHQ9YShlKTtyZXR1cm4hdC5zb21lKGZ1bmN0aW9uKGUpe3JldHVybiBlLmhhc0F0dHJpYnV0ZShcInJlcXVpcmVkXCIpfSl8fHQuc29tZShmdW5jdGlvbihlKXtyZXR1cm4gZS5jaGVja2VkfSl9cmV0dXJuIWUuaGFzQXR0cmlidXRlKFwicmVxdWlyZWRcIil8fChcImNoZWNrYm94XCI9PT1lLnR5cGU/ZS5jaGVja2VkOiEhZS52YWx1ZSl9ZnVuY3Rpb24gUyhlKXt2YXIgdD1jKGUpO2lmKCFlLnZhbHVlfHwtMT09PUNlLmluZGV4T2YodCl8fFwiYW55XCI9PT0oZS5nZXRBdHRyaWJ1dGUoXCJzdGVwXCIpfHxcIlwiKS50b0xvd2VyQ2FzZSgpKXJldHVybiEwO3ZhciBuPWUuZ2V0QXR0cmlidXRlKFwic3RlcFwiKTtpZigobj1uP3kobix0KTpWZVt0XXx8MSk8PTB8fGlzTmFOKG4pKXJldHVybiEwO3ZhciByPUllW3RdfHwxLGk9eShlLnZhbHVlLHQpLGE9eShlLmdldEF0dHJpYnV0ZShcIm1pblwiKXx8ZS5nZXRBdHRyaWJ1dGUoXCJ2YWx1ZVwiKXx8XCJcIix0KTtpc05hTihhKSYmKGE9V2VbdF18fDApLFwibW9udGhcIj09PXQmJihhPTEyKm5ldyBEYXRlKGEpLmdldFVUQ0Z1bGxZZWFyKCkrbmV3IERhdGUoYSkuZ2V0VVRDTW9udGgoKSxpPTEyKm5ldyBEYXRlKGkpLmdldFVUQ0Z1bGxZZWFyKCkrbmV3IERhdGUoaSkuZ2V0VVRDTW9udGgoKSk7dmFyIG89TWF0aC5hYnMoYS1pKSUobipyKTtyZXR1cm4gbzwxZS04fHxvPm4qci0xZS04fWZ1bmN0aW9uIEYoZSl7cmV0dXJuIGUucmVwbGFjZShHZSxcIlwiKX1mdW5jdGlvbiBIKGUpe3JldHVybiBlLnNwbGl0KFwiLFwiKS5tYXAoZnVuY3Rpb24oZSl7cmV0dXJuIEYoZSl9KS5maWx0ZXIoZnVuY3Rpb24oZSl7cmV0dXJuIGV9KX1mdW5jdGlvbiBVKGUpe3ZhciB0PWMoZSk7aWYoXCJmaWxlXCIhPT10JiYhZS52YWx1ZXx8XCJmaWxlXCIhPT10JiYtMT09PWtlLmluZGV4T2YodCkpcmV0dXJuITA7dmFyIG49ITA7c3dpdGNoKHQpe2Nhc2VcInVybFwiOndlfHwod2U9ZG9jdW1lbnQuY3JlYXRlRWxlbWVudChcImFcIikpO3ZhciByPUYoZS52YWx1ZSk7d2UuaHJlZj1yLG49d2UuaHJlZj09PXJ8fHdlLmhyZWY9PT1yK1wiL1wiO2JyZWFrO2Nhc2VcImVtYWlsXCI6bj1lLmhhc0F0dHJpYnV0ZShcIm11bHRpcGxlXCIpP0goZS52YWx1ZSkuZXZlcnkoZnVuY3Rpb24oZSl7cmV0dXJuIEplLnRlc3QoZSl9KTpKZS50ZXN0KEYoZS52YWx1ZSkpO2JyZWFrO2Nhc2VcImZpbGVcIjppZihcImZpbGVzXCJpbiBlJiZlLmZpbGVzLmxlbmd0aCYmZS5oYXNBdHRyaWJ1dGUoXCJhY2NlcHRcIikpe3ZhciBpPUgoZS5nZXRBdHRyaWJ1dGUoXCJhY2NlcHRcIikpLm1hcChmdW5jdGlvbihlKXtyZXR1cm4vXihhdWRpb3x2aWRlb3xpbWFnZSlcXC9cXCokLy50ZXN0KGUpJiYoZT1uZXcgUmVnRXhwKFwiXlwiK1JlZ0V4cC4kMStcIi8uKyRcIikpLGV9KTtpZighaS5sZW5ndGgpYnJlYWs7ZTpmb3IodmFyIGE9MDthPGUuZmlsZXMubGVuZ3RoO2ErKyl7dmFyIG89ITE7dDpmb3IodmFyIGw9MDtsPGkubGVuZ3RoO2wrKyl7dmFyIHM9ZS5maWxlc1thXSx1PWlbbF0sZD1zLnR5cGU7aWYoXCJzdHJpbmdcIj09dHlwZW9mIHUmJlwiLlwiPT09dS5zdWJzdHIoMCwxKSl7aWYoLTE9PT1zLm5hbWUuc2VhcmNoKFwiLlwiKSljb250aW51ZSB0O2Q9cy5uYW1lLnN1YnN0cihzLm5hbWUubGFzdEluZGV4T2YoXCIuXCIpKX1pZigwPT09ZC5zZWFyY2godSkpe289ITA7YnJlYWsgdH19aWYoIW8pe249ITE7YnJlYWsgZX19fX1yZXR1cm4gbn1mdW5jdGlvbiBQKGUsdCl7cmV0dXJuIGZ1bmN0aW9uKG4pe3ZhciByPSFlKG4pO3JldHVybiByJiZ0KG4pLHJ9fWZ1bmN0aW9uIFIoZSx0LG4pe1RlLnNldChlLHFlLmdldChlLHQsbikpfWZ1bmN0aW9uICQoZSl7dmFyIHQ9WmUuZ2V0KGUpLG49dC5sZW5ndGgscj0hMDtpZihuKWZvcih2YXIgaT0wO2k8bjtpKyspe3ZhciBhPXRbaV0oZSk7aWYodm9pZCAwIT09YSYmIWEpe3I9ITE7YnJlYWt9fWlmKHIpe3ZhciBvPVRlLmdldChlKTtyPSEoby50b1N0cmluZygpJiZcImlzX2N1c3RvbVwiaW4gbyl9cmV0dXJuIXJ9ZnVuY3Rpb24gVihlKXtpZihlIGluc3RhbmNlb2Ygd2luZG93LkhUTUxGb3JtRWxlbWVudCl7ZS5fX2hmX2Zvcm1fdmFsaWRhdGlvbj0hMDt2YXIgbj1nZShlKS5tYXAoVikuZXZlcnkoZnVuY3Rpb24oZSl7cmV0dXJuIGV9KTtyZXR1cm4gZGVsZXRlIGUuX19oZl9mb3JtX3ZhbGlkYXRpb24sbn12YXIgcixpPWx0KGUpLnZhbGlkO2lmKGkpe3ZhciBhPW1lKGUpO2EmJmEuc2V0dGluZ3MudmFsaWRFdmVudCYmKHI9dChlLFwidmFsaWRcIix7Y2FuY2VsYWJsZTohMH0pKX1lbHNlIHI9dChlLFwiaW52YWxpZFwiLHtjYW5jZWxhYmxlOiEwfSk7cmV0dXJuIHImJnIuZGVmYXVsdFByZXZlbnRlZHx8TmUuc2hvd1dhcm5pbmcoZSwhIWUuZm9ybS5fX2hmX2Zvcm1fdmFsaWRhdGlvbiksaX1mdW5jdGlvbiBJKG4pe3ZhciByLGk9ZShcInN1Ym1pdFwiLHtjYW5jZWxhYmxlOiEwfSk7aS5wcmV2ZW50RGVmYXVsdCgpLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpLFwiZGVmYXVsdFByZXZlbnRlZFwiLHt2YWx1ZTohMSx3cml0YWJsZTohMH0pLE9iamVjdC5kZWZpbmVQcm9wZXJ0eShpLFwicHJldmVudERlZmF1bHRcIix7dmFsdWU6ZnVuY3Rpb24oKXtyZXR1cm4gaS5kZWZhdWx0UHJldmVudGVkPXI9ITB9LHdyaXRhYmxlOiEwfSksdChuLmZvcm0saSx7fSx7c3VibWl0dGVkVmlhOm59KSxyfHwoVyhuKSx3aW5kb3cuSFRNTEZvcm1FbGVtZW50LnByb3RvdHlwZS5zdWJtaXQuY2FsbChuLmZvcm0pLHdpbmRvdy5zZXRUaW1lb3V0KGZ1bmN0aW9uKCl7cmV0dXJuIGoobil9KSl9ZnVuY3Rpb24gVyhlKXtpZihbXCJpbWFnZVwiLFwic3VibWl0XCJdLmluZGV4T2YoZS50eXBlKT4tMSYmZS5uYW1lKXt2YXIgdD1tZShlLmZvcm0pfHx7fSxuPXQuc3VibWl0X2hlbHBlcjtuP24ucGFyZW50Tm9kZSYmbi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG4pOihuPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJpbnB1dFwiKSxuLnR5cGU9XCJoaWRkZW5cIix0LnN1Ym1pdF9oZWxwZXI9biksbi5uYW1lPWUubmFtZSxuLnZhbHVlPWUudmFsdWUsZS5mb3JtLmFwcGVuZENoaWxkKG4pfX1mdW5jdGlvbiBqKGUpe2lmKFtcImltYWdlXCIsXCJzdWJtaXRcIl0uaW5kZXhPZihlLnR5cGUpPi0xJiZlLm5hbWUpe3ZhciB0PW1lKGUuZm9ybSl8fHt9LG49dC5zdWJtaXRfaGVscGVyO24mJm4ucGFyZW50Tm9kZSYmbi5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKG4pfX1mdW5jdGlvbiBCKGUpe2lmKCF0KGUuZm9ybSxcInZhbGlkYXRlXCIse2NhbmNlbGFibGU6ITB9KS5kZWZhdWx0UHJldmVudGVkKXt2YXIgbixyPSEwO2UuZm9ybS5fX2hmX2Zvcm1fdmFsaWRhdGlvbj0hMCxnZShlLmZvcm0pLm1hcChmdW5jdGlvbihlKXtWKGUpfHwocj0hMSwhbiYmXCJmb2N1c1wiaW4gZSYmKG49ZSkpfSksZGVsZXRlIGUuZm9ybS5fX2hmX2Zvcm1fdmFsaWRhdGlvbixyP0koZSk6biYmKG4uZm9jdXMoKSx0KGUuZm9ybSxcImZvcm1pbnZhbGlkXCIpKX19ZnVuY3Rpb24gWShlKXtyZXR1cm4hKFwiSU5QVVRcIiE9PWUubm9kZU5hbWUmJlwiQlVUVE9OXCIhPT1lLm5vZGVOYW1lfHxcImltYWdlXCIhPT1lLnR5cGUmJlwic3VibWl0XCIhPT1lLnR5cGUpfWZ1bmN0aW9uIHEoZSx0KXtyZXR1cm4hZS5kZWZhdWx0UHJldmVudGVkJiYoIShcImJ1dHRvblwiaW4gZSl8fGUuYnV0dG9uPDIpJiZZKHQpJiZ0LmZvcm0mJiF0LmZvcm0uaGFzQXR0cmlidXRlKFwibm92YWxpZGF0ZVwiKX1mdW5jdGlvbiB6KGUpe3JldHVybiFlLmRlZmF1bHRQcmV2ZW50ZWQmJigxMz09PWUua2V5Q29kZSYmXCJJTlBVVFwiPT09ZS50YXJnZXQubm9kZU5hbWUmJlNlLmluZGV4T2YoZS50YXJnZXQudHlwZSk+LTF8fCgxMz09PWUua2V5Q29kZXx8MzI9PT1lLmtleUNvZGUpJiZZKGUudGFyZ2V0KSkmJmUudGFyZ2V0LmZvcm0mJiFlLnRhcmdldC5mb3JtLmhhc0F0dHJpYnV0ZShcIm5vdmFsaWRhdGVcIil9ZnVuY3Rpb24gWihlKXtyZXR1cm4gWShlKT9lOm4oZSwnYnV0dG9uOm5vdChbdHlwZV0pICosIGJ1dHRvblt0eXBlPVwic3VibWl0XCJdIConKT9aKGUucGFyZW50Tm9kZSk6bnVsbH1mdW5jdGlvbiBHKCl7dmFyIGU9YXJndW1lbnRzLmxlbmd0aD4wJiZ2b2lkIDAhPT1hcmd1bWVudHNbMF0mJmFyZ3VtZW50c1swXTtyZXR1cm4gZnVuY3Rpb24odCl7dmFyIG49Wih0LnRhcmdldCk7biYmcSh0LG4pJiYodC5wcmV2ZW50RGVmYXVsdCgpLGV8fG4uaGFzQXR0cmlidXRlKFwiZm9ybW5vdmFsaWRhdGVcIik/SShuKTpCKG4pKX19ZnVuY3Rpb24gSihlKXtyZXR1cm4gZnVuY3Rpb24odCl7aWYoeih0KSl7dC5wcmV2ZW50RGVmYXVsdCgpO2lmKChtZSh0LnRhcmdldC5mb3JtKXx8e3NldHRpbmdzOnt9fSkuc2V0dGluZ3MucHJldmVudEltcGxpY2l0U3VibWl0KXJldHVybjtmb3IodmFyIG4scj10LnRhcmdldC5mb3JtLmVsZW1lbnRzLmxlbmd0aCxpPTA7aTxyO2krKylpZihbXCJpbWFnZVwiLFwic3VibWl0XCJdLmluZGV4T2YodC50YXJnZXQuZm9ybS5lbGVtZW50c1tpXS50eXBlKT4tMSl7bj10LnRhcmdldC5mb3JtLmVsZW1lbnRzW2ldO2JyZWFrfW4/bi5jbGljaygpOmU/SSh0LnRhcmdldCk6Qih0LnRhcmdldCl9fX1mdW5jdGlvbiBLKGUpe2FyZ3VtZW50cy5sZW5ndGg+MSYmdm9pZCAwIT09YXJndW1lbnRzWzFdJiZhcmd1bWVudHNbMV0/KGUuYWRkRXZlbnRMaXN0ZW5lcihcImNsaWNrXCIsZHQpLGUuYWRkRXZlbnRMaXN0ZW5lcihcImtleXByZXNzXCIsdnQpKTooZS5hZGRFdmVudExpc3RlbmVyKFwiY2xpY2tcIixjdCksZS5hZGRFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIixmdCkpfWZ1bmN0aW9uIFEoZSl7ZS5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIixkdCksZS5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIix2dCksZS5yZW1vdmVFdmVudExpc3RlbmVyKFwiY2xpY2tcIixjdCksZS5yZW1vdmVFdmVudExpc3RlbmVyKFwia2V5cHJlc3NcIixmdCl9ZnVuY3Rpb24gWChlLHQpe3RyeXtkZWxldGUgZVt0XX1jYXRjaChyKXt2YXIgbj1tZShlKTtyZXR1cm4gbiYmbi5zZXR0aW5ncy5kZWJ1ZyYmY29uc29sZS5sb2coXCJbaHlwZXJmb3JtXSBjYW5ub3QgdW5pbnN0YWxsIGN1c3RvbSBwcm9wZXJ0eSBcIit0KSwhMX12YXIgcj1PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGUsXCJfb3JpZ2luYWxfXCIrdCk7ciYmT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsdCxyKX1mdW5jdGlvbiBlZShlLHQsbil7bi5jb25maWd1cmFibGU9ITAsbi5lbnVtZXJhYmxlPSEwLFwidmFsdWVcImluIG4mJihuLndyaXRhYmxlPSEwKTt2YXIgcj1PYmplY3QuZ2V0T3duUHJvcGVydHlEZXNjcmlwdG9yKGUsdCk7aWYocil7aWYoITE9PT1yLmNvbmZpZ3VyYWJsZSl7dmFyIGk9bWUoZSk7cmV0dXJuIGkmJmkuc2V0dGluZ3MuZGVidWcmJmNvbnNvbGUubG9nKFwiW2h5cGVyZm9ybV0gY2Fubm90IGluc3RhbGwgY3VzdG9tIHByb3BlcnR5IFwiK3QpLCExfWlmKHIuZ2V0JiZyLmdldC5fX2h5cGVyZm9ybXx8ci52YWx1ZSYmci52YWx1ZS5fX2h5cGVyZm9ybSlyZXR1cm47T2JqZWN0LmRlZmluZVByb3BlcnR5KGUsXCJfb3JpZ2luYWxfXCIrdCxyKX1yZXR1cm4gZGVsZXRlIGVbdF0sT2JqZWN0LmRlZmluZVByb3BlcnR5KGUsdCxuKSwhMH1mdW5jdGlvbiB0ZShlKXtyZXR1cm4gZSBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MQnV0dG9uRWxlbWVudHx8ZSBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MSW5wdXRFbGVtZW50fHxlIGluc3RhbmNlb2Ygd2luZG93LkhUTUxTZWxlY3RFbGVtZW50fHxlIGluc3RhbmNlb2Ygd2luZG93LkhUTUxUZXh0QXJlYUVsZW1lbnR8fGUgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTEZpZWxkU2V0RWxlbWVudHx8ZT09PXdpbmRvdy5IVE1MQnV0dG9uRWxlbWVudC5wcm90b3R5cGV8fGU9PT13aW5kb3cuSFRNTElucHV0RWxlbWVudC5wcm90b3R5cGV8fGU9PT13aW5kb3cuSFRNTFNlbGVjdEVsZW1lbnQucHJvdG90eXBlfHxlPT09d2luZG93LkhUTUxUZXh0QXJlYUVsZW1lbnQucHJvdG90eXBlfHxlPT09d2luZG93LkhUTUxGaWVsZFNldEVsZW1lbnQucHJvdG90eXBlfWZ1bmN0aW9uIG5lKGUsdCl7VGUuc2V0KGUsdCwhMCl9ZnVuY3Rpb24gcmUoZSl7dmFyIHQ9YXJndW1lbnRzLmxlbmd0aD4xJiZ2b2lkIDAhPT1hcmd1bWVudHNbMV0/YXJndW1lbnRzWzFdOnZvaWQgMCxuPWMoZSk7aWYoeGUuaW5kZXhPZihuKT4tMSl7aWYodm9pZCAwIT09dCl7aWYobnVsbD09PXQpZS52YWx1ZT1cIlwiO2Vsc2V7aWYoISh0IGluc3RhbmNlb2YgRGF0ZSkpdGhyb3cgbmV3IHdpbmRvdy5ET01FeGNlcHRpb24oXCJ2YWx1ZUFzRGF0ZSBzZXR0ZXIgZW5jb3VudGVyZWQgaW52YWxpZCB2YWx1ZVwiLFwiVHlwZUVycm9yXCIpO2lzTmFOKHQuZ2V0VGltZSgpKT9lLnZhbHVlPVwiXCI6ZS52YWx1ZT1wKHQsbil9cmV0dXJufXZhciByPWIoZS52YWx1ZSxuKTtyZXR1cm4gciBpbnN0YW5jZW9mIERhdGU/cjpudWxsfWlmKHZvaWQgMCE9PXQpdGhyb3cgbmV3IHdpbmRvdy5ET01FeGNlcHRpb24oXCJ2YWx1ZUFzRGF0ZSBzZXR0ZXIgY2Fubm90IHNldCBkYXRlIG9uIHRoaXMgZWxlbWVudFwiLFwiSW52YWxpZFN0YXRlRXJyb3JcIik7cmV0dXJuIG51bGx9ZnVuY3Rpb24gaWUoZSl7dmFyIHQ9YXJndW1lbnRzLmxlbmd0aD4xJiZ2b2lkIDAhPT1hcmd1bWVudHNbMV0/YXJndW1lbnRzWzFdOnZvaWQgMCxuPWMoZSk7aWYoQ2UuaW5kZXhPZihuKT4tMSl7aWYoXCJyYW5nZVwiPT09biYmZS5oYXNBdHRyaWJ1dGUoXCJtdWx0aXBsZVwiKSlyZXR1cm4gTmFOO2lmKHZvaWQgMCE9PXQpe2lmKGlzTmFOKHQpKWUudmFsdWU9XCJcIjtlbHNle2lmKFwibnVtYmVyXCIhPXR5cGVvZiB0fHwhd2luZG93LmlzRmluaXRlKHQpKXRocm93IG5ldyB3aW5kb3cuRE9NRXhjZXB0aW9uKFwidmFsdWVBc051bWJlciBzZXR0ZXIgZW5jb3VudGVyZWQgaW52YWxpZCB2YWx1ZVwiLFwiVHlwZUVycm9yXCIpO3RyeXtyZShlLG5ldyBEYXRlKHQpKX1jYXRjaChuKXtpZighKG4gaW5zdGFuY2VvZiB3aW5kb3cuRE9NRXhjZXB0aW9uKSl0aHJvdyBuO2UudmFsdWU9dC50b1N0cmluZygpfX1yZXR1cm59cmV0dXJuIHkoZS52YWx1ZSxuKX1pZih2b2lkIDAhPT10KXRocm93IG5ldyB3aW5kb3cuRE9NRXhjZXB0aW9uKFwidmFsdWVBc051bWJlciBzZXR0ZXIgY2Fubm90IHNldCBudW1iZXIgb24gdGhpcyBlbGVtZW50XCIsXCJJbnZhbGlkU3RhdGVFcnJvclwiKTtyZXR1cm4gTmFOfWZ1bmN0aW9uIGFlKGUpe3ZhciB0PWFyZ3VtZW50cy5sZW5ndGg+MSYmdm9pZCAwIT09YXJndW1lbnRzWzFdP2FyZ3VtZW50c1sxXToxO2lmKC0xPT09Q2UuaW5kZXhPZihjKGUpKSl0aHJvdyBuZXcgd2luZG93LkRPTUV4Y2VwdGlvbihcInN0ZXBEb3duIGVuY291bnRlcmVkIGludmFsaWQgdHlwZVwiLFwiSW52YWxpZFN0YXRlRXJyb3JcIik7aWYoXCJhbnlcIj09PShlLmdldEF0dHJpYnV0ZShcInN0ZXBcIil8fFwiXCIpLnRvTG93ZXJDYXNlKCkpdGhyb3cgbmV3IHdpbmRvdy5ET01FeGNlcHRpb24oJ3N0ZXBEb3duIGVuY291bnRlcmVkIHN0ZXAgXCJhbnlcIicsXCJJbnZhbGlkU3RhdGVFcnJvclwiKTt2YXIgbj1MKGUsdClbMF07bnVsbCE9PW4mJmllKGUsbil9ZnVuY3Rpb24gb2UoZSl7dmFyIHQ9YXJndW1lbnRzLmxlbmd0aD4xJiZ2b2lkIDAhPT1hcmd1bWVudHNbMV0/YXJndW1lbnRzWzFdOjE7aWYoLTE9PT1DZS5pbmRleE9mKGMoZSkpKXRocm93IG5ldyB3aW5kb3cuRE9NRXhjZXB0aW9uKFwic3RlcFVwIGVuY291bnRlcmVkIGludmFsaWQgdHlwZVwiLFwiSW52YWxpZFN0YXRlRXJyb3JcIik7aWYoXCJhbnlcIj09PShlLmdldEF0dHJpYnV0ZShcInN0ZXBcIil8fFwiXCIpLnRvTG93ZXJDYXNlKCkpdGhyb3cgbmV3IHdpbmRvdy5ET01FeGNlcHRpb24oJ3N0ZXBVcCBlbmNvdW50ZXJlZCBzdGVwIFwiYW55XCInLFwiSW52YWxpZFN0YXRlRXJyb3JcIik7dmFyIG49TChlLHQpWzFdO251bGwhPT1uJiZpZShlLG4pfWZ1bmN0aW9uIGxlKGUpe3ZhciB0PVRlLmdldChlKTtyZXR1cm4gdD90LnRvU3RyaW5nKCk6XCJcIn1mdW5jdGlvbiBzZShlKXtyZXR1cm4gZihlKX1mdW5jdGlvbiB1ZShlKXtmb3IodmFyIHQ9W1wiYWNjZXB0XCIsXCJtYXhcIixcIm1pblwiLFwicGF0dGVyblwiLFwicGxhY2Vob2xkZXJcIixcInN0ZXBcIl0sbj0wO248dC5sZW5ndGg7bisrKXt2YXIgcj10W25dO2VlKGUscix7Z2V0Om10KHIpLHNldDpndChyKX0pfWZvcih2YXIgaT1bXCJtdWx0aXBsZVwiLFwicmVxdWlyZWRcIixcInJlYWRPbmx5XCJdLGE9MDthPGkubGVuZ3RoO2ErKyl7dmFyIG89aVthXTtlZShlLG8se2dldDpodChvLnRvTG93ZXJDYXNlKCkpLHNldDpwdChvLnRvTG93ZXJDYXNlKCkpfSl9Zm9yKHZhciBsPVtcIm1pbkxlbmd0aFwiLFwibWF4TGVuZ3RoXCJdLHM9MDtzPGwubGVuZ3RoO3MrKyl7dmFyIHU9bFtzXTtlZShlLHUse2dldDp3dCh1LnRvTG93ZXJDYXNlKCkpLHNldDpidCh1LnRvTG93ZXJDYXNlKCkpfSl9fWZ1bmN0aW9uIGNlKGUpe2Zvcih2YXIgdD1bXCJhY2NlcHRcIixcIm1heFwiLFwibWluXCIsXCJwYXR0ZXJuXCIsXCJwbGFjZWhvbGRlclwiLFwic3RlcFwiLFwibXVsdGlwbGVcIixcInJlcXVpcmVkXCIsXCJyZWFkT25seVwiLFwibWluTGVuZ3RoXCIsXCJtYXhMZW5ndGhcIl0sbj0wO248dC5sZW5ndGg7bisrKXtYKGUsdFtuXSl9fWZ1bmN0aW9uIGRlKGUpe2lmKHRlKGUpKXtmb3IodmFyIHQgaW4geXQpZWUoZSx0LHl0W3RdKTt1ZShlKX1lbHNlKGUgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTEZvcm1FbGVtZW50fHxlPT09d2luZG93LkhUTUxGb3JtRWxlbWVudC5wcm90b3R5cGUpJiYoZWUoZSxcImNoZWNrVmFsaWRpdHlcIix5dC5jaGVja1ZhbGlkaXR5KSxlZShlLFwicmVwb3J0VmFsaWRpdHlcIix5dC5yZXBvcnRWYWxpZGl0eSkpfWZ1bmN0aW9uIGZlKGUpe3RlKGUpPyhYKGUsXCJjaGVja1ZhbGlkaXR5XCIpLFgoZSxcInJlcG9ydFZhbGlkaXR5XCIpLFgoZSxcInNldEN1c3RvbVZhbGlkaXR5XCIpLFgoZSxcInN0ZXBEb3duXCIpLFgoZSxcInN0ZXBVcFwiKSxYKGUsXCJ2YWxpZGF0aW9uTWVzc2FnZVwiKSxYKGUsXCJ2YWxpZGl0eVwiKSxYKGUsXCJ2YWx1ZUFzRGF0ZVwiKSxYKGUsXCJ2YWx1ZUFzTnVtYmVyXCIpLFgoZSxcIndpbGxWYWxpZGF0ZVwiKSxjZShlKSk6ZSBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MRm9ybUVsZW1lbnQmJihYKGUsXCJjaGVja1ZhbGlkaXR5XCIpLFgoZSxcInJlcG9ydFZhbGlkaXR5XCIpKX1mdW5jdGlvbiB2ZShlLHQpe3ZhciBuPUV0LmdldChlKTtpZihuKXJldHVybiBuLnNldHRpbmdzPXQsbjt0aGlzLmZvcm09ZSx0aGlzLnNldHRpbmdzPXQsdGhpcy5yZXZhbGlkYXRvcj10aGlzLnJldmFsaWRhdGUuYmluZCh0aGlzKSxFdC5zZXQoZSx0aGlzKSxLKGUsXCJuZXZlclwiPT09dC5yZXZhbGlkYXRlKSxlPT09d2luZG93fHw5PT09ZS5ub2RlVHlwZT8odGhpcy5pbnN0YWxsKFt3aW5kb3cuSFRNTEJ1dHRvbkVsZW1lbnQucHJvdG90eXBlLHdpbmRvdy5IVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZSx3aW5kb3cuSFRNTFNlbGVjdEVsZW1lbnQucHJvdG90eXBlLHdpbmRvdy5IVE1MVGV4dEFyZWFFbGVtZW50LnByb3RvdHlwZSx3aW5kb3cuSFRNTEZpZWxkU2V0RWxlbWVudC5wcm90b3R5cGVdKSxkZSh3aW5kb3cuSFRNTEZvcm1FbGVtZW50KSk6KGUgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTEZvcm1FbGVtZW50fHxlIGluc3RhbmNlb2Ygd2luZG93LkhUTUxGaWVsZFNldEVsZW1lbnQpJiYodGhpcy5pbnN0YWxsKGUuZWxlbWVudHMpLGUgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTEZvcm1FbGVtZW50JiZkZShlKSksXCJvbmlucHV0XCIhPT10LnJldmFsaWRhdGUmJlwiaHlicmlkXCIhPT10LnJldmFsaWRhdGV8fChlLmFkZEV2ZW50TGlzdGVuZXIoXCJrZXl1cFwiLHRoaXMucmV2YWxpZGF0b3IpLGUuYWRkRXZlbnRMaXN0ZW5lcihcImNoYW5nZVwiLHRoaXMucmV2YWxpZGF0b3IpKSxcIm9uYmx1clwiIT09dC5yZXZhbGlkYXRlJiZcImh5YnJpZFwiIT09dC5yZXZhbGlkYXRlfHxlLmFkZEV2ZW50TGlzdGVuZXIoXCJibHVyXCIsdGhpcy5yZXZhbGlkYXRvciwhMCl9ZnVuY3Rpb24gbWUoZSl7dmFyIHQ7Zm9yKGUuZm9ybSYmKHQ9RXQuZ2V0KGUuZm9ybSkpOyF0JiZlOyl0PUV0LmdldChlKSxlPWUucGFyZW50Tm9kZTtyZXR1cm4gdHx8KHQ9RXQuZ2V0KHdpbmRvdykpLHR9ZnVuY3Rpb24gZ2UoZSl7dmFyIHQ9bWUoZSk7cmV0dXJuIEFycmF5LnByb3RvdHlwZS5maWx0ZXIuY2FsbChlLmVsZW1lbnRzLGZ1bmN0aW9uKGUpe3JldHVybiEhKGUuZ2V0QXR0cmlidXRlKFwibmFtZVwiKXx8dCYmdC5zZXR0aW5ncy52YWxpZGF0ZU5hbWVsZXNzKX0pfWZ1bmN0aW9uIGhlKGUpe2NvbnNvbGUubG9nKG0oJ1BsZWFzZSB1c2UgY2FtZWxDYXNlIG1ldGhvZCBuYW1lcyEgVGhlIG5hbWUgXCIlc1wiIGlzIGRlcHJlY2F0ZWQgYW5kIHdpbGwgYmUgcmVtb3ZlZCBpbiB0aGUgbmV4dCBub24tcGF0Y2ggcmVsZWFzZS4nLGUpKX1mdW5jdGlvbiBwZShlKXt2YXIgdD1hcmd1bWVudHMubGVuZ3RoPjEmJnZvaWQgMCE9PWFyZ3VtZW50c1sxXT9hcmd1bWVudHNbMV06e30sbj10LmNsYXNzZXMscj10LmRlYnVnLGk9dm9pZCAwIT09ciYmcixhPXQuZXh0ZW5kX2ZpZWxkc2V0LG89dC5leHRlbmRGaWVsZHNldCxsPXQubm92YWxpZGF0ZV9vbl9lbGVtZW50cyxzPXQubm92YWxpZGF0ZU9uRWxlbWVudHMsdT10LnByZXZlbnRfaW1wbGljaXRfc3VibWl0LGM9dC5wcmV2ZW50SW1wbGljaXRTdWJtaXQsZD10LnJldmFsaWRhdGUsZj10LnN0cmljdCx2PXZvaWQgMCE9PWYmJmYsbT10LnZhbGlkX2V2ZW50LGc9dC52YWxpZEV2ZW50LGg9dC52YWxpZGF0ZU5hbWVsZXNzLHA9dm9pZCAwIT09aCYmaDtufHwobj17fSksdm9pZCAwPT09byYmKHZvaWQgMD09PWE/bz0hdjooaGUoXCJleHRlbmRfZmllbGRzZXRcIiksbz1hKSksdm9pZCAwPT09cyYmKHZvaWQgMD09PWw/cz0hdjooaGUoXCJub3ZhbGlkYXRlX29uX2VsZW1lbnRzXCIpLHM9bCkpLHZvaWQgMD09PWMmJih2b2lkIDA9PT11P2M9ITE6KGhlKFwicHJldmVudF9pbXBsaWNpdF9zdWJtaXRcIiksYz11KSksdm9pZCAwPT09ZCYmKGQ9dj9cIm9uc3VibWl0XCI6XCJoeWJyaWRcIiksdm9pZCAwPT09ZyYmKHZvaWQgMD09PW0/Zz0hdjooaGUoXCJ2YWxpZF9ldmVudFwiKSxnPW0pKTt2YXIgdz17ZGVidWc6aSxzdHJpY3Q6dixwcmV2ZW50SW1wbGljaXRTdWJtaXQ6YyxyZXZhbGlkYXRlOmQsdmFsaWRFdmVudDpnLGV4dGVuZEZpZWxkc2V0Om8sY2xhc3NlczpuLG5vdmFsaWRhdGVPbkVsZW1lbnRzOnMsdmFsaWRhdGVOYW1lbGVzczpwfTtyZXR1cm4gZSBpbnN0YW5jZW9mIHdpbmRvdy5Ob2RlTGlzdHx8ZSBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MQ29sbGVjdGlvbnx8ZSBpbnN0YW5jZW9mIEFycmF5P0FycmF5LnByb3RvdHlwZS5tYXAuY2FsbChlLGZ1bmN0aW9uKGUpe3JldHVybiBwZShlLHcpfSk6bmV3IHZlKGUsdyl9KGZ1bmN0aW9uKCl7dmFyIGU9ZG9jdW1lbnQuY3JlYXRlRXZlbnQoXCJFdmVudFwiKTtyZXR1cm4gZS5pbml0RXZlbnQoXCJmb29cIiwhMCwhMCksZS5wcmV2ZW50RGVmYXVsdCgpLGUuZGVmYXVsdFByZXZlbnRlZH0pKCl8fGZ1bmN0aW9uKCl7dmFyIGU9d2luZG93LkV2ZW50LnByb3RvdHlwZS5wcmV2ZW50RGVmYXVsdDt3aW5kb3cuRXZlbnQucHJvdG90eXBlLnByZXZlbnREZWZhdWx0PWZ1bmN0aW9uKCl7dGhpcy5jYW5jZWxhYmxlJiYoZS5jYWxsKHRoaXMpLE9iamVjdC5kZWZpbmVQcm9wZXJ0eSh0aGlzLFwiZGVmYXVsdFByZXZlbnRlZFwiLHtnZXQ6ZnVuY3Rpb24oKXtyZXR1cm4hMH0sY29uZmlndXJhYmxlOiEwfSkpfX0oKTt2YXIgd2UsYmU9d2luZG93LkVsZW1lbnQucHJvdG90eXBlLHllPWJlLm1hdGNoZXN8fGJlLm1hdGNoZXNTZWxlY3Rvcnx8YmUubXNNYXRjaGVzU2VsZWN0b3J8fGJlLndlYmtpdE1hdGNoZXNTZWxlY3RvcixFZT1uZXcgV2Vha01hcCxUZT17c2V0OmZ1bmN0aW9uKGUsdCl7dmFyIG49YXJndW1lbnRzLmxlbmd0aD4yJiZ2b2lkIDAhPT1hcmd1bWVudHNbMl0mJmFyZ3VtZW50c1syXTtpZihlIGluc3RhbmNlb2Ygd2luZG93LkhUTUxGaWVsZFNldEVsZW1lbnQpe3ZhciBpPW1lKGUpO2lmKGkmJiFpLnNldHRpbmdzLmV4dGVuZEZpZWxkc2V0KXJldHVybiBUZX1yZXR1cm5cInN0cmluZ1wiPT10eXBlb2YgdCYmKHQ9bmV3IFN0cmluZyh0KSksbiYmKHQuaXNfY3VzdG9tPSEwKSxyKHQpLEVlLnNldChlLHQpLFwiX29yaWdpbmFsX3NldEN1c3RvbVZhbGlkaXR5XCJpbiBlJiZlLl9vcmlnaW5hbF9zZXRDdXN0b21WYWxpZGl0eSh0LnRvU3RyaW5nKCkpLFRlfSxnZXQ6ZnVuY3Rpb24oZSl7dmFyIHQ9RWUuZ2V0KGUpO3JldHVybiB2b2lkIDA9PT10JiZcIl9vcmlnaW5hbF92YWxpZGF0aW9uTWVzc2FnZVwiaW4gZSYmKHQ9bmV3IFN0cmluZyhlLl9vcmlnaW5hbF92YWxpZGF0aW9uTWVzc2FnZSkpLHR8fG5ldyBTdHJpbmcoXCJcIil9LGRlbGV0ZTpmdW5jdGlvbihlKXtyZXR1cm5cIl9vcmlnaW5hbF9zZXRDdXN0b21WYWxpZGl0eVwiaW4gZSYmZS5fb3JpZ2luYWxfc2V0Q3VzdG9tVmFsaWRpdHkoXCJcIiksRWUuZGVsZXRlKGUpfX0sTWU9MCxMZT1uZXcgV2Vha01hcCxBZT17YXR0YWNoV2FybmluZzpmdW5jdGlvbihlLHQpe3QucGFyZW50Tm9kZS5pbnNlcnRCZWZvcmUoZSx0Lm5leHRTaWJsaW5nKX0sZGV0YWNoV2FybmluZzpmdW5jdGlvbihlLHQpe2UucGFyZW50Tm9kZSYmZS5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKGUpfSxzaG93V2FybmluZzpmdW5jdGlvbihlKXtpZighKGFyZ3VtZW50cy5sZW5ndGg+MSYmdm9pZCAwIT09YXJndW1lbnRzWzFdJiZhcmd1bWVudHNbMV0pfHxcInJhZGlvXCIhPT1lLnR5cGV8fGEoZSlbMF09PT1lKXt2YXIgdD1UZS5nZXQoZSkudG9TdHJpbmcoKSxuPUxlLmdldChlKTtpZih0KXtpZighbil7dmFyIHI9bWUoZSk7bj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpLG4uY2xhc3NOYW1lPXImJnIuc2V0dGluZ3MuY2xhc3Nlcy53YXJuaW5nfHxcImhmLXdhcm5pbmdcIixuLmlkPWkoKSxuLnNldEF0dHJpYnV0ZShcImFyaWEtbGl2ZVwiLFwicG9saXRlXCIpLExlLnNldChlLG4pfWUuc2V0QXR0cmlidXRlKFwiYXJpYS1lcnJvcm1lc3NhZ2VcIixuLmlkKSxlLmhhc0F0dHJpYnV0ZShcImFyaWEtZGVzY3JpYmVkYnlcIil8fGUuc2V0QXR0cmlidXRlKFwiYXJpYS1kZXNjcmliZWRieVwiLG4uaWQpLG4udGV4dENvbnRlbnQ9dCxOZS5hdHRhY2hXYXJuaW5nKG4sZSl9ZWxzZSBuJiZuLnBhcmVudE5vZGUmJihlLmdldEF0dHJpYnV0ZShcImFyaWEtZGVzY3JpYmVkYnlcIik9PT1uLmlkJiZlLnJlbW92ZUF0dHJpYnV0ZShcImFyaWEtZGVzY3JpYmVkYnlcIiksZS5yZW1vdmVBdHRyaWJ1dGUoXCJhcmlhLWVycm9ybWVzc2FnZVwiKSxOZS5kZXRhY2hXYXJuaW5nKG4sZSkpfX19LE5lPXthdHRhY2hXYXJuaW5nOkFlLmF0dGFjaFdhcm5pbmcsZGV0YWNoV2FybmluZzpBZS5kZXRhY2hXYXJuaW5nLHNob3dXYXJuaW5nOkFlLnNob3dXYXJuaW5nLHNldDpmdW5jdGlvbihlLHQpe2UuaW5kZXhPZihcIl9cIik+LTEmJihjb25zb2xlLmxvZyhcIlJlbmRlcmVyLnNldDogcGxlYXNlIHVzZSBjYW1lbENhc2UgbmFtZXMuIFwiK2UrXCIgd2lsbCBiZSByZW1vdmVkIGluIHRoZSBuZXh0IG5vbi1wYXRjaCByZWxlYXNlLlwiKSxlPWUucmVwbGFjZSgvXyhbYS16XSkvZyxmdW5jdGlvbihlKXtyZXR1cm4gZVsxXS50b1VwcGVyQ2FzZSgpfSkpLHR8fCh0PUFlW2VdKSxOZVtlXT10fX0sX2U9T2JqZWN0LmNyZWF0ZShudWxsKSx4ZT1bXCJkYXRldGltZVwiLFwiZGF0ZVwiLFwibW9udGhcIixcIndlZWtcIixcInRpbWVcIl0sRGU9W1wibnVtYmVyXCIsXCJyYW5nZVwiXSxDZT14ZS5jb25jYXQoRGUsXCJkYXRldGltZS1sb2NhbFwiKSxrZT1bXCJlbWFpbFwiLFwidXJsXCJdLE9lPVtcImVtYWlsXCIsXCJkYXRlXCIsXCJtb250aFwiLFwid2Vla1wiLFwidGltZVwiLFwiZGF0ZXRpbWVcIixcImRhdGV0aW1lLWxvY2FsXCIsXCJudW1iZXJcIixcInJhbmdlXCIsXCJjb2xvclwiXSxTZT1bXCJ0ZXh0XCIsXCJzZWFyY2hcIixcInRlbFwiLFwicGFzc3dvcmRcIl0uY29uY2F0KGtlKSxGZT1bXCJjaGVja2JveFwiLFwiY29sb3JcIixcImZpbGVcIixcImltYWdlXCIsXCJyYWRpb1wiLFwic3VibWl0XCJdLmNvbmNhdChDZSxTZSksSGU9W1wiYnV0dG9uXCIsXCJoaWRkZW5cIixcInJlc2V0XCJdLmNvbmNhdChGZSksVWU9W1wic2VsZWN0LW9uZVwiLFwic2VsZWN0LW11bHRpcGxlXCIsXCJ0ZXh0YXJlYVwiXSxQZT17ZW46e1RleHRUb29Mb25nOlwiUGxlYXNlIHNob3J0ZW4gdGhpcyB0ZXh0IHRvICVsIGNoYXJhY3RlcnMgb3IgbGVzcyAoeW91IGFyZSBjdXJyZW50bHkgdXNpbmcgJWwgY2hhcmFjdGVycykuXCIsVmFsdWVNaXNzaW5nOlwiUGxlYXNlIGZpbGwgb3V0IHRoaXMgZmllbGQuXCIsQ2hlY2tib3hNaXNzaW5nOlwiUGxlYXNlIGNoZWNrIHRoaXMgYm94IGlmIHlvdSB3YW50IHRvIHByb2NlZWQuXCIsUmFkaW9NaXNzaW5nOlwiUGxlYXNlIHNlbGVjdCBvbmUgb2YgdGhlc2Ugb3B0aW9ucy5cIixGaWxlTWlzc2luZzpcIlBsZWFzZSBzZWxlY3QgYSBmaWxlLlwiLFNlbGVjdE1pc3Npbmc6XCJQbGVhc2Ugc2VsZWN0IGFuIGl0ZW0gaW4gdGhlIGxpc3QuXCIsSW52YWxpZEVtYWlsOlwiUGxlYXNlIGVudGVyIGFuIGVtYWlsIGFkZHJlc3MuXCIsSW52YWxpZFVSTDpcIlBsZWFzZSBlbnRlciBhIFVSTC5cIixQYXR0ZXJuTWlzbWF0Y2g6XCJQbGVhc2UgbWF0Y2ggdGhlIHJlcXVlc3RlZCBmb3JtYXQuXCIsUGF0dGVybk1pc21hdGNoV2l0aFRpdGxlOlwiUGxlYXNlIG1hdGNoIHRoZSByZXF1ZXN0ZWQgZm9ybWF0OiAlbC5cIixOdW1iZXJSYW5nZU92ZXJmbG93OlwiUGxlYXNlIHNlbGVjdCBhIHZhbHVlIHRoYXQgaXMgbm8gbW9yZSB0aGFuICVsLlwiLERhdGVSYW5nZU92ZXJmbG93OlwiUGxlYXNlIHNlbGVjdCBhIHZhbHVlIHRoYXQgaXMgbm8gbGF0ZXIgdGhhbiAlbC5cIixUaW1lUmFuZ2VPdmVyZmxvdzpcIlBsZWFzZSBzZWxlY3QgYSB2YWx1ZSB0aGF0IGlzIG5vIGxhdGVyIHRoYW4gJWwuXCIsTnVtYmVyUmFuZ2VVbmRlcmZsb3c6XCJQbGVhc2Ugc2VsZWN0IGEgdmFsdWUgdGhhdCBpcyBubyBsZXNzIHRoYW4gJWwuXCIsRGF0ZVJhbmdlVW5kZXJmbG93OlwiUGxlYXNlIHNlbGVjdCBhIHZhbHVlIHRoYXQgaXMgbm8gZWFybGllciB0aGFuICVsLlwiLFRpbWVSYW5nZVVuZGVyZmxvdzpcIlBsZWFzZSBzZWxlY3QgYSB2YWx1ZSB0aGF0IGlzIG5vIGVhcmxpZXIgdGhhbiAlbC5cIixTdGVwTWlzbWF0Y2g6XCJQbGVhc2Ugc2VsZWN0IGEgdmFsaWQgdmFsdWUuIFRoZSB0d28gbmVhcmVzdCB2YWxpZCB2YWx1ZXMgYXJlICVsIGFuZCAlbC5cIixTdGVwTWlzbWF0Y2hPbmVWYWx1ZTpcIlBsZWFzZSBzZWxlY3QgYSB2YWxpZCB2YWx1ZS4gVGhlIG5lYXJlc3QgdmFsaWQgdmFsdWUgaXMgJWwuXCIsQmFkSW5wdXROdW1iZXI6XCJQbGVhc2UgZW50ZXIgYSBudW1iZXIuXCJ9fSxSZT1cImVuXCIsJGU9XCJlblwiLFZlPXtcImRhdGV0aW1lLWxvY2FsXCI6NjAsZGF0ZXRpbWU6NjAsdGltZTo2MH0sSWU9e1wiZGF0ZXRpbWUtbG9jYWxcIjoxZTMsZGF0ZXRpbWU6MWUzLGRhdGU6ODY0ZTUsd2Vlazo2MDQ4ZTUsdGltZToxZTN9LFdlPXt3ZWVrOi0yNTkyZTV9LGplPXtyYW5nZTowfSxCZT17cmFuZ2U6MTAwfSxZZT1uZXcgV2Vha01hcCxxZT17c2V0OmZ1bmN0aW9uKGUsdCxuKXt2YXIgcj1ZZS5nZXQoZSl8fHt9O3JldHVybiByW3RdPW4sWWUuc2V0KGUscikscWV9LGdldDpmdW5jdGlvbihlLHQpe3ZhciBuPWFyZ3VtZW50cy5sZW5ndGg+MiYmdm9pZCAwIT09YXJndW1lbnRzWzJdP2FyZ3VtZW50c1syXTp2b2lkIDAscj1ZZS5nZXQoZSk7aWYodm9pZCAwPT09cnx8ISh0IGluIHIpKXt2YXIgaT1cImRhdGEtXCIrdC5yZXBsYWNlKC9bQS1aXS9nLFwiLSQmXCIpLnRvTG93ZXJDYXNlKCk7cmV0dXJuIGUuaGFzQXR0cmlidXRlKGkpP2UuZ2V0QXR0cmlidXRlKGkpOm59cmV0dXJuIHJbdF19LGRlbGV0ZTpmdW5jdGlvbihlKXt2YXIgdD1hcmd1bWVudHMubGVuZ3RoPjEmJnZvaWQgMCE9PWFyZ3VtZW50c1sxXT9hcmd1bWVudHNbMV06bnVsbDtpZighdClyZXR1cm4gWWUuZGVsZXRlKGUpO3ZhciBuPVllLmdldChlKXx8e307cmV0dXJuIHQgaW4gbiYmKGRlbGV0ZSBuW3RdLFllLnNldChlLG4pLCEwKX19LHplPW5ldyBXZWFrTWFwLFplPXtzZXQ6ZnVuY3Rpb24oZSx0KXt2YXIgbj16ZS5nZXQoZSl8fFtdO3JldHVybiBuLnB1c2godCksemUuc2V0KGUsbiksWmV9LGdldDpmdW5jdGlvbihlKXtyZXR1cm4gemUuZ2V0KGUpfHxbXX0sZGVsZXRlOmZ1bmN0aW9uKGUpe3JldHVybiB6ZS5kZWxldGUoZSl9fSxHZT0vXltcXHNcXHVGRUZGXFx4QTBdK3xbXFxzXFx1RkVGRlxceEEwXSskL2csSmU9L15bYS16QS1aMC05LiEjJCUmJyorXFwvPT9eX2B7fH1+LV0rQFthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPyg/OlxcLlthLXpBLVowLTldKD86W2EtekEtWjAtOS1dezAsNjF9W2EtekEtWjAtOV0pPykqJC8sS2U9UChOLGZ1bmN0aW9uKGUpe3JldHVybiBSKGUsXCJiYWRJbnB1dFwiLE0oXCJQbGVhc2UgbWF0Y2ggdGhlIHJlcXVlc3RlZCB0eXBlLlwiKSl9KSxRZT1QKGssZnVuY3Rpb24oZSl7UihlLFwicGF0dGVybk1pc21hdGNoXCIsZS50aXRsZT9tKE0oXCJQYXR0ZXJuTWlzbWF0Y2hXaXRoVGl0bGVcIiksZS50aXRsZSk6TShcIlBhdHRlcm5NaXNtYXRjaFwiKSl9KSxYZT1QKF8sZnVuY3Rpb24oZSl7dmFyIHQ9YyhlKSxuPW1lKGUpLHI9biYmbi5zZXR0aW5ncy5jbGFzc2VzLm91dE9mUmFuZ2V8fFwiaGYtb3V0LW9mLXJhbmdlXCIsaT1uJiZuLnNldHRpbmdzLmNsYXNzZXMuaW5SYW5nZXx8XCJoZi1pbi1yYW5nZVwiLGE9dm9pZCAwO3N3aXRjaCh0KXtjYXNlXCJkYXRlXCI6Y2FzZVwiZGF0ZXRpbWVcIjpjYXNlXCJkYXRldGltZS1sb2NhbFwiOmE9bShNKFwiRGF0ZVJhbmdlT3ZlcmZsb3dcIiksdihiKGUuZ2V0QXR0cmlidXRlKFwibWF4XCIpLHQpLHQpKTticmVhaztjYXNlXCJ0aW1lXCI6YT1tKE0oXCJUaW1lUmFuZ2VPdmVyZmxvd1wiKSx2KGIoZS5nZXRBdHRyaWJ1dGUoXCJtYXhcIiksdCksdCkpO2JyZWFrO2RlZmF1bHQ6YT1tKE0oXCJOdW1iZXJSYW5nZU92ZXJmbG93XCIpLHkoZS5nZXRBdHRyaWJ1dGUoXCJtYXhcIiksdCkpfVIoZSxcInJhbmdlT3ZlcmZsb3dcIixhKSxlLmNsYXNzTGlzdC5hZGQociksZS5jbGFzc0xpc3QucmVtb3ZlKGkpfSksZXQ9UChELGZ1bmN0aW9uKGUpe3ZhciB0PWMoZSksbj1tZShlKSxyPW4mJm4uc2V0dGluZ3MuY2xhc3Nlcy5vdXRPZlJhbmdlfHxcImhmLW91dC1vZi1yYW5nZVwiLGk9biYmbi5zZXR0aW5ncy5jbGFzc2VzLmluUmFuZ2V8fFwiaGYtaW4tcmFuZ2VcIixhPXZvaWQgMDtzd2l0Y2godCl7Y2FzZVwiZGF0ZVwiOmNhc2VcImRhdGV0aW1lXCI6Y2FzZVwiZGF0ZXRpbWUtbG9jYWxcIjphPW0oTShcIkRhdGVSYW5nZVVuZGVyZmxvd1wiKSx2KGIoZS5nZXRBdHRyaWJ1dGUoXCJtaW5cIiksdCksdCkpO2JyZWFrO2Nhc2VcInRpbWVcIjphPW0oTShcIlRpbWVSYW5nZVVuZGVyZmxvd1wiKSx2KGIoZS5nZXRBdHRyaWJ1dGUoXCJtaW5cIiksdCksdCkpO2JyZWFrO2RlZmF1bHQ6YT1tKE0oXCJOdW1iZXJSYW5nZVVuZGVyZmxvd1wiKSx5KGUuZ2V0QXR0cmlidXRlKFwibWluXCIpLHQpKX1SKGUsXCJyYW5nZVVuZGVyZmxvd1wiLGEpLGUuY2xhc3NMaXN0LmFkZChyKSxlLmNsYXNzTGlzdC5yZW1vdmUoaSl9KSx0dD1QKFMsZnVuY3Rpb24oZSl7dmFyIHQ9TChlKSxuPXRbMF0scj10WzFdLGk9ITEsYT12b2lkIDA7bnVsbD09PW4/aT1yOm51bGw9PT1yJiYoaT1uKSxhPSExIT09aT9tKE0oXCJTdGVwTWlzbWF0Y2hPbmVWYWx1ZVwiKSxpKTptKE0oXCJTdGVwTWlzbWF0Y2hcIiksbixyKSxSKGUsXCJzdGVwTWlzbWF0Y2hcIixhKX0pLG50PVAoeCxmdW5jdGlvbihlKXtSKGUsXCJ0b29Mb25nXCIsbShNKFwiVGV4dFRvb0xvbmdcIiksZS5nZXRBdHRyaWJ1dGUoXCJtYXhsZW5ndGhcIiksQShlLnZhbHVlKSkpfSkscnQ9UChDLGZ1bmN0aW9uKGUpe1IoZSxcInRvb1Nob3J0XCIsbShNKFwiUGxlYXNlIGxlbmd0aGVuIHRoaXMgdGV4dCB0byAlbCBjaGFyYWN0ZXJzIG9yIG1vcmUgKHlvdSBhcmUgY3VycmVudGx5IHVzaW5nICVsIGNoYXJhY3RlcnMpLlwiKSxlLmdldEF0dHJpYnV0ZShcIm1pbmxlbmd0aFwiKSxBKGUudmFsdWUpKSl9KSxpdD1QKFUsZnVuY3Rpb24oZSl7dmFyIHQ9TShcIlBsZWFzZSB1c2UgdGhlIGFwcHJvcHJpYXRlIGZvcm1hdC5cIiksbj1jKGUpO1wiZW1haWxcIj09PW4/dD1NKGUuaGFzQXR0cmlidXRlKFwibXVsdGlwbGVcIik/XCJQbGVhc2UgZW50ZXIgYSBjb21tYSBzZXBhcmF0ZWQgbGlzdCBvZiBlbWFpbCBhZGRyZXNzZXMuXCI6XCJJbnZhbGlkRW1haWxcIik6XCJ1cmxcIj09PW4/dD1NKFwiSW52YWxpZFVSTFwiKTpcImZpbGVcIj09PW4mJih0PU0oXCJQbGVhc2Ugc2VsZWN0IGEgZmlsZSBvZiB0aGUgY29ycmVjdCB0eXBlLlwiKSksUihlLFwidHlwZU1pc21hdGNoXCIsdCl9KSxhdD1QKE8sZnVuY3Rpb24oZSl7dmFyIHQ9TShcIlZhbHVlTWlzc2luZ1wiKSxuPWMoZSk7XCJjaGVja2JveFwiPT09bj90PU0oXCJDaGVja2JveE1pc3NpbmdcIik6XCJyYWRpb1wiPT09bj90PU0oXCJSYWRpb01pc3NpbmdcIik6XCJmaWxlXCI9PT1uP3Q9TShlLmhhc0F0dHJpYnV0ZShcIm11bHRpcGxlXCIpP1wiUGxlYXNlIHNlbGVjdCBvbmUgb3IgbW9yZSBmaWxlcy5cIjpcIkZpbGVNaXNzaW5nXCIpOmUgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTFNlbGVjdEVsZW1lbnQmJih0PU0oXCJTZWxlY3RNaXNzaW5nXCIpKSxSKGUsXCJ2YWx1ZU1pc3NpbmdcIix0KX0pLG90PXtiYWRJbnB1dDpLZSxjdXN0b21FcnJvcjokLHBhdHRlcm5NaXNtYXRjaDpRZSxyYW5nZU92ZXJmbG93OlhlLHJhbmdlVW5kZXJmbG93OmV0LHN0ZXBNaXNtYXRjaDp0dCx0b29Mb25nOm50LHRvb1Nob3J0OnJ0LHR5cGVNaXNtYXRjaDppdCx2YWx1ZU1pc3Npbmc6YXR9LGx0PWZ1bmN0aW9uIGUodCl7aWYoISh0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxFbGVtZW50KSl0aHJvdyBuZXcgRXJyb3IoXCJjYW5ub3QgY3JlYXRlIGEgVmFsaWRpdHlTdGF0ZSBmb3IgYSBub24tZWxlbWVudFwiKTt2YXIgbj1lLmNhY2hlLmdldCh0KTtyZXR1cm4gbnx8KHRoaXMgaW5zdGFuY2VvZiBlPyh0aGlzLmVsZW1lbnQ9dCx2b2lkIGUuY2FjaGUuc2V0KHQsdGhpcykpOm5ldyBlKHQpKX0sc3Q9e307bHQucHJvdG90eXBlPXN0LGx0LmNhY2hlPW5ldyBXZWFrTWFwO2Zvcih2YXIgdXQgaW4gb3QpT2JqZWN0LmRlZmluZVByb3BlcnR5KHN0LHV0LHtjb25maWd1cmFibGU6ITAsZW51bWVyYWJsZTohMCxnZXQ6ZnVuY3Rpb24oZSl7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIWYodGhpcy5lbGVtZW50KXx8ZSh0aGlzLmVsZW1lbnQpfX0ob3RbdXRdKSxzZXQ6dm9pZCAwfSk7T2JqZWN0LmRlZmluZVByb3BlcnR5KHN0LFwidmFsaWRcIix7Y29uZmlndXJhYmxlOiEwLGVudW1lcmFibGU6ITAsZ2V0OmZ1bmN0aW9uKCl7aWYoIWYodGhpcy5lbGVtZW50KSlyZXR1cm4hMDt2YXIgZT1tZSh0aGlzLmVsZW1lbnQpLHQ9ZSYmZS5zZXR0aW5ncy5jbGFzc2VzLnZhbGlkfHxcImhmLXZhbGlkXCIsbj1lJiZlLnNldHRpbmdzLmNsYXNzZXMuaW52YWxpZHx8XCJoZi1pbnZhbGlkXCIscj1lJiZlLnNldHRpbmdzLmNsYXNzZXMudXNlckludmFsaWR8fFwiaGYtdXNlci1pbnZhbGlkXCIsaT1lJiZlLnNldHRpbmdzLmNsYXNzZXMudXNlclZhbGlkfHxcImhmLXVzZXItdmFsaWRcIixhPWUmJmUuc2V0dGluZ3MuY2xhc3Nlcy5pblJhbmdlfHxcImhmLWluLXJhbmdlXCIsbz1lJiZlLnNldHRpbmdzLmNsYXNzZXMub3V0T2ZSYW5nZXx8XCJoZi1vdXQtb2YtcmFuZ2VcIixsPWUmJmUuc2V0dGluZ3MuY2xhc3Nlcy52YWxpZGF0ZWR8fFwiaGYtdmFsaWRhdGVkXCI7dGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQobCk7Zm9yKHZhciBzIGluIG90KWlmKG90W3NdKHRoaXMuZWxlbWVudCkpcmV0dXJuIHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKG4pLHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKHQpLHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKGkpLHRoaXMuZWxlbWVudC52YWx1ZSE9PXRoaXMuZWxlbWVudC5kZWZhdWx0VmFsdWU/dGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQocik6dGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUociksdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImFyaWEtaW52YWxpZFwiLFwidHJ1ZVwiKSwhMTtyZXR1cm4gVGUuZGVsZXRlKHRoaXMuZWxlbWVudCksdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUobiksdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUociksdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5yZW1vdmUobyksdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQodCksdGhpcy5lbGVtZW50LmNsYXNzTGlzdC5hZGQoYSksdGhpcy5lbGVtZW50LnZhbHVlIT09dGhpcy5lbGVtZW50LmRlZmF1bHRWYWx1ZT90aGlzLmVsZW1lbnQuY2xhc3NMaXN0LmFkZChpKTp0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShpKSx0aGlzLmVsZW1lbnQuc2V0QXR0cmlidXRlKFwiYXJpYS1pbnZhbGlkXCIsXCJmYWxzZVwiKSwhMH0sc2V0OnZvaWQgMH0pLHIoc3QpO3ZhciBjdD1HKCksZHQ9RyghMCksZnQ9SigpLHZ0PUooITApLG10PWZ1bmN0aW9uKGUpe3JldHVybiBmdW5jdGlvbigpe3JldHVybiBsKFwiYXR0cl9nZXRfXCIrZSx0aGlzLmdldEF0dHJpYnV0ZShlKSx0aGlzKX19LGd0PWZ1bmN0aW9uKGUpe3JldHVybiBmdW5jdGlvbih0KXt0aGlzLnNldEF0dHJpYnV0ZShlLGwoXCJhdHRyX3NldF9cIitlLHQsdGhpcykpfX0saHQ9ZnVuY3Rpb24oZSl7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIGwoXCJhdHRyX2dldF9cIitlLHRoaXMuaGFzQXR0cmlidXRlKGUpLHRoaXMpfX0scHQ9ZnVuY3Rpb24oZSl7cmV0dXJuIGZ1bmN0aW9uKHQpe2woXCJhdHRyX3NldF9cIitlLHQsdGhpcyk/dGhpcy5zZXRBdHRyaWJ1dGUoZSxlKTp0aGlzLnJlbW92ZUF0dHJpYnV0ZShlKX19LHd0PWZ1bmN0aW9uKGUpe3JldHVybiBmdW5jdGlvbigpe3JldHVybiBsKFwiYXR0cl9nZXRfXCIrZSxNYXRoLm1heCgwLE51bWJlcih0aGlzLmdldEF0dHJpYnV0ZShlKSkpLHRoaXMpfX0sYnQ9ZnVuY3Rpb24oZSl7cmV0dXJuIGZ1bmN0aW9uKHQpe3Q9bChcImF0dHJfc2V0X1wiK2UsdCx0aGlzKSwvXlswLTldKyQvLnRlc3QodCkmJnRoaXMuc2V0QXR0cmlidXRlKGUsdCl9fSx5dD17Y2hlY2tWYWxpZGl0eTp7dmFsdWU6cihmdW5jdGlvbigpe3JldHVybiBUdCh0aGlzKX0pfSxyZXBvcnRWYWxpZGl0eTp7dmFsdWU6cihmdW5jdGlvbigpe3JldHVybiBWKHRoaXMpfSl9LHNldEN1c3RvbVZhbGlkaXR5Ont2YWx1ZTpyKGZ1bmN0aW9uKGUpe3JldHVybiBuZSh0aGlzLGUpfSl9LHN0ZXBEb3duOnt2YWx1ZTpyKGZ1bmN0aW9uKCl7cmV0dXJuIGFlKHRoaXMsYXJndW1lbnRzLmxlbmd0aD4wJiZ2b2lkIDAhPT1hcmd1bWVudHNbMF0/YXJndW1lbnRzWzBdOjEpfSl9LHN0ZXBVcDp7dmFsdWU6cihmdW5jdGlvbigpe3JldHVybiBvZSh0aGlzLGFyZ3VtZW50cy5sZW5ndGg+MCYmdm9pZCAwIT09YXJndW1lbnRzWzBdP2FyZ3VtZW50c1swXToxKX0pfSx2YWxpZGF0aW9uTWVzc2FnZTp7Z2V0OnIoZnVuY3Rpb24oKXtyZXR1cm4gbGUodGhpcyl9KX0sdmFsaWRpdHk6e2dldDpyKGZ1bmN0aW9uKCl7cmV0dXJuIGx0KHRoaXMpfSl9LHZhbHVlQXNEYXRlOntnZXQ6cihmdW5jdGlvbigpe3JldHVybiByZSh0aGlzKX0pLHNldDpyKGZ1bmN0aW9uKGUpe3JlKHRoaXMsZSl9KX0sdmFsdWVBc051bWJlcjp7Z2V0OnIoZnVuY3Rpb24oKXtyZXR1cm4gaWUodGhpcyl9KSxzZXQ6cihmdW5jdGlvbihlKXtpZSh0aGlzLGUpfSl9LHdpbGxWYWxpZGF0ZTp7Z2V0OnIoZnVuY3Rpb24oKXtyZXR1cm4gc2UodGhpcyl9KX19LEV0PW5ldyBXZWFrTWFwO3ZlLnByb3RvdHlwZT17ZGVzdHJveTpmdW5jdGlvbigpe1EodGhpcy5mb3JtKSxFdC5kZWxldGUodGhpcy5mb3JtKSx0aGlzLmZvcm0ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImtleXVwXCIsdGhpcy5yZXZhbGlkYXRvciksdGhpcy5mb3JtLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjaGFuZ2VcIix0aGlzLnJldmFsaWRhdG9yKSx0aGlzLmZvcm0ucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImJsdXJcIix0aGlzLnJldmFsaWRhdG9yLCEwKSx0aGlzLmZvcm09PT13aW5kb3d8fDk9PT10aGlzLmZvcm0ubm9kZVR5cGU/KHRoaXMudW5pbnN0YWxsKFt3aW5kb3cuSFRNTEJ1dHRvbkVsZW1lbnQucHJvdG90eXBlLHdpbmRvdy5IVE1MSW5wdXRFbGVtZW50LnByb3RvdHlwZSx3aW5kb3cuSFRNTFNlbGVjdEVsZW1lbnQucHJvdG90eXBlLHdpbmRvdy5IVE1MVGV4dEFyZWFFbGVtZW50LnByb3RvdHlwZSx3aW5kb3cuSFRNTEZpZWxkU2V0RWxlbWVudC5wcm90b3R5cGVdKSxmZSh3aW5kb3cuSFRNTEZvcm1FbGVtZW50KSk6KHRoaXMuZm9ybSBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MRm9ybUVsZW1lbnR8fHRoaXMuZm9ybSBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MRmllbGRTZXRFbGVtZW50KSYmKHRoaXMudW5pbnN0YWxsKHRoaXMuZm9ybS5lbGVtZW50cyksdGhpcy5mb3JtIGluc3RhbmNlb2Ygd2luZG93LkhUTUxGb3JtRWxlbWVudCYmZmUodGhpcy5mb3JtKSl9LHJldmFsaWRhdGU6ZnVuY3Rpb24oZSl7KGUudGFyZ2V0IGluc3RhbmNlb2Ygd2luZG93LkhUTUxCdXR0b25FbGVtZW50fHxlLnRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MVGV4dEFyZWFFbGVtZW50fHxlLnRhcmdldCBpbnN0YW5jZW9mIHdpbmRvdy5IVE1MU2VsZWN0RWxlbWVudHx8ZS50YXJnZXQgaW5zdGFuY2VvZiB3aW5kb3cuSFRNTElucHV0RWxlbWVudCkmJihcImh5YnJpZFwiPT09dGhpcy5zZXR0aW5ncy5yZXZhbGlkYXRlP1wiYmx1clwiPT09ZS50eXBlJiZlLnRhcmdldC52YWx1ZSE9PWUudGFyZ2V0LmRlZmF1bHRWYWx1ZXx8bHQoZS50YXJnZXQpLnZhbGlkP1YoZS50YXJnZXQpOihcImtleXVwXCI9PT1lLnR5cGUmJjkhPT1lLmtleUNvZGV8fFwiY2hhbmdlXCI9PT1lLnR5cGUpJiZsdChlLnRhcmdldCkudmFsaWQmJlYoZS50YXJnZXQpOlwia2V5dXBcIj09PWUudHlwZSYmOT09PWUua2V5Q29kZXx8VihlLnRhcmdldCkpfSxpbnN0YWxsOmZ1bmN0aW9uKGUpe2UgaW5zdGFuY2VvZiB3aW5kb3cuRWxlbWVudCYmKGU9W2VdKTtmb3IodmFyIHQ9ZS5sZW5ndGgsbj0wO248dDtuKyspZGUoZVtuXSl9LHVuaW5zdGFsbDpmdW5jdGlvbihlKXtlIGluc3RhbmNlb2Ygd2luZG93LkVsZW1lbnQmJihlPVtlXSk7Zm9yKHZhciB0PWUubGVuZ3RoLG49MDtuPHQ7bisrKWZlKGVbbl0pfX07dmFyIFR0PWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGZ1bmN0aW9uKCl7dmFyIG49byhlLEFycmF5LnByb3RvdHlwZS5zbGljZS5jYWxsKGFyZ3VtZW50cykpO3JldHVybiB2b2lkIDAhPT1uP246dC5hcHBseSh0aGlzLGFyZ3VtZW50cyl9fShcImNoZWNrVmFsaWRpdHlcIixmdW5jdGlvbihlKXtpZihlIGluc3RhbmNlb2Ygd2luZG93LkhUTUxGb3JtRWxlbWVudClyZXR1cm4gZ2UoZSkubWFwKFR0KS5ldmVyeShmdW5jdGlvbihlKXtyZXR1cm4gZX0pO3ZhciBuPWx0KGUpLnZhbGlkO2lmKG4pe3ZhciByPW1lKGUpO3ImJnIuc2V0dGluZ3MudmFsaWRFdmVudCYmdChlLFwidmFsaWRcIil9ZWxzZSB0KGUsXCJpbnZhbGlkXCIse2NhbmNlbGFibGU6ITB9KTtyZXR1cm4gbn0pO3JldHVybiBwZS52ZXJzaW9uPVwiMC45LjE2XCIscGUuY2hlY2tWYWxpZGl0eT1UdCxwZS5yZXBvcnRWYWxpZGl0eT1WLHBlLnNldEN1c3RvbVZhbGlkaXR5PW5lLHBlLnN0ZXBEb3duPWFlLHBlLnN0ZXBVcD1vZSxwZS52YWxpZGF0aW9uTWVzc2FnZT1sZSxwZS5WYWxpZGl0eVN0YXRlPWx0LHBlLnZhbHVlQXNEYXRlPXJlLHBlLnZhbHVlQXNOdW1iZXI9aWUscGUud2lsbFZhbGlkYXRlPXNlLHBlLnNldExhbmd1YWdlPWZ1bmN0aW9uKGUpe3JldHVybiBFKGUpLHBlfSxcbnBlLmFkZFRyYW5zbGF0aW9uPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIFQoZSx0KSxwZX0scGUuc2V0UmVuZGVyZXI9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gTmUuc2V0KGUsdCkscGV9LHBlLmFkZFZhbGlkYXRvcj1mdW5jdGlvbihlLHQpe3JldHVybiBaZS5zZXQoZSx0KSxwZX0scGUuc2V0TWVzc2FnZT1mdW5jdGlvbihlLHQsbil7cmV0dXJuIHFlLnNldChlLHQsbikscGV9LHBlLmFkZEhvb2s9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiB1KGUsdCxuKSxwZX0scGUucmVtb3ZlSG9vaz1mdW5jdGlvbihlLHQpe3JldHVybiBzKGUsdCkscGV9LHBlLnNldF9sYW5ndWFnZT1mdW5jdGlvbihlKXtyZXR1cm4gaGUoXCJzZXRfbGFuZ3VhZ2VcIiksRShlKSxwZX0scGUuYWRkX3RyYW5zbGF0aW9uPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGhlKFwiYWRkX3RyYW5zbGF0aW9uXCIpLFQoZSx0KSxwZX0scGUuc2V0X3JlbmRlcmVyPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGhlKFwic2V0X3JlbmRlcmVyXCIpLE5lLnNldChlLHQpLHBlfSxwZS5hZGRfdmFsaWRhdG9yPWZ1bmN0aW9uKGUsdCl7cmV0dXJuIGhlKFwiYWRkX3ZhbGlkYXRvclwiKSxaZS5zZXQoZSx0KSxwZX0scGUuc2V0X21lc3NhZ2U9ZnVuY3Rpb24oZSx0LG4pe3JldHVybiBoZShcInNldF9tZXNzYWdlXCIpLHFlLnNldChlLHQsbikscGV9LHBlLmFkZF9ob29rPWZ1bmN0aW9uKGUsdCxuKXtyZXR1cm4gaGUoXCJhZGRfaG9va1wiKSx1KGUsdCxuKSxwZX0scGUucmVtb3ZlX2hvb2s9ZnVuY3Rpb24oZSx0KXtyZXR1cm4gaGUoXCJyZW1vdmVfaG9va1wiKSxzKGUsdCkscGV9LGRvY3VtZW50LmN1cnJlbnRTY3JpcHQmJmRvY3VtZW50LmN1cnJlbnRTY3JpcHQuaGFzQXR0cmlidXRlKFwiZGF0YS1oZi1hdXRvbG9hZFwiKSYmcGUod2luZG93KSxwZX0oKTtcbiIsIi8qIVxuICogRmxpY2tpdHkgUEFDS0FHRUQgdjIuMS4yXG4gKiBUb3VjaCwgcmVzcG9uc2l2ZSwgZmxpY2thYmxlIGNhcm91c2Vsc1xuICpcbiAqIExpY2Vuc2VkIEdQTHYzIGZvciBvcGVuIHNvdXJjZSB1c2VcbiAqIG9yIEZsaWNraXR5IENvbW1lcmNpYWwgTGljZW5zZSBmb3IgY29tbWVyY2lhbCB1c2VcbiAqXG4gKiBodHRwczovL2ZsaWNraXR5Lm1ldGFmaXp6eS5jb1xuICogQ29weXJpZ2h0IDIwMTUtMjAxOCBNZXRhZml6enlcbiAqL1xuXG4hZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwianF1ZXJ5LWJyaWRnZXQvanF1ZXJ5LWJyaWRnZXRcIixbXCJqcXVlcnlcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwianF1ZXJ5XCIpKTp0LmpRdWVyeUJyaWRnZXQ9ZSh0LHQualF1ZXJ5KX0od2luZG93LGZ1bmN0aW9uKHQsZSl7XCJ1c2Ugc3RyaWN0XCI7ZnVuY3Rpb24gaShpLG8sYSl7ZnVuY3Rpb24gbCh0LGUsbil7dmFyIHMsbz1cIiQoKS5cIitpKycoXCInK2UrJ1wiKSc7cmV0dXJuIHQuZWFjaChmdW5jdGlvbih0LGwpe3ZhciBoPWEuZGF0YShsLGkpO2lmKCFoKXJldHVybiB2b2lkIHIoaStcIiBub3QgaW5pdGlhbGl6ZWQuIENhbm5vdCBjYWxsIG1ldGhvZHMsIGkuZS4gXCIrbyk7dmFyIGM9aFtlXTtpZighY3x8XCJfXCI9PWUuY2hhckF0KDApKXJldHVybiB2b2lkIHIobytcIiBpcyBub3QgYSB2YWxpZCBtZXRob2RcIik7dmFyIGQ9Yy5hcHBseShoLG4pO3M9dm9pZCAwPT09cz9kOnN9KSx2b2lkIDAhPT1zP3M6dH1mdW5jdGlvbiBoKHQsZSl7dC5lYWNoKGZ1bmN0aW9uKHQsbil7dmFyIHM9YS5kYXRhKG4saSk7cz8ocy5vcHRpb24oZSkscy5faW5pdCgpKToocz1uZXcgbyhuLGUpLGEuZGF0YShuLGkscykpfSl9YT1hfHxlfHx0LmpRdWVyeSxhJiYoby5wcm90b3R5cGUub3B0aW9ufHwoby5wcm90b3R5cGUub3B0aW9uPWZ1bmN0aW9uKHQpe2EuaXNQbGFpbk9iamVjdCh0KSYmKHRoaXMub3B0aW9ucz1hLmV4dGVuZCghMCx0aGlzLm9wdGlvbnMsdCkpfSksYS5mbltpXT1mdW5jdGlvbih0KXtpZihcInN0cmluZ1wiPT10eXBlb2YgdCl7dmFyIGU9cy5jYWxsKGFyZ3VtZW50cywxKTtyZXR1cm4gbCh0aGlzLHQsZSl9cmV0dXJuIGgodGhpcyx0KSx0aGlzfSxuKGEpKX1mdW5jdGlvbiBuKHQpeyF0fHx0JiZ0LmJyaWRnZXR8fCh0LmJyaWRnZXQ9aSl9dmFyIHM9QXJyYXkucHJvdG90eXBlLnNsaWNlLG89dC5jb25zb2xlLHI9XCJ1bmRlZmluZWRcIj09dHlwZW9mIG8/ZnVuY3Rpb24oKXt9OmZ1bmN0aW9uKHQpe28uZXJyb3IodCl9O3JldHVybiBuKGV8fHQualF1ZXJ5KSxpfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZXYtZW1pdHRlci9ldi1lbWl0dGVyXCIsZSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSgpOnQuRXZFbWl0dGVyPWUoKX0oXCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz93aW5kb3c6dGhpcyxmdW5jdGlvbigpe2Z1bmN0aW9uIHQoKXt9dmFyIGU9dC5wcm90b3R5cGU7cmV0dXJuIGUub249ZnVuY3Rpb24odCxlKXtpZih0JiZlKXt2YXIgaT10aGlzLl9ldmVudHM9dGhpcy5fZXZlbnRzfHx7fSxuPWlbdF09aVt0XXx8W107cmV0dXJuIG4uaW5kZXhPZihlKT09LTEmJm4ucHVzaChlKSx0aGlzfX0sZS5vbmNlPWZ1bmN0aW9uKHQsZSl7aWYodCYmZSl7dGhpcy5vbih0LGUpO3ZhciBpPXRoaXMuX29uY2VFdmVudHM9dGhpcy5fb25jZUV2ZW50c3x8e30sbj1pW3RdPWlbdF18fHt9O3JldHVybiBuW2VdPSEwLHRoaXN9fSxlLm9mZj1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX2V2ZW50cyYmdGhpcy5fZXZlbnRzW3RdO2lmKGkmJmkubGVuZ3RoKXt2YXIgbj1pLmluZGV4T2YoZSk7cmV0dXJuIG4hPS0xJiZpLnNwbGljZShuLDEpLHRoaXN9fSxlLmVtaXRFdmVudD1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX2V2ZW50cyYmdGhpcy5fZXZlbnRzW3RdO2lmKGkmJmkubGVuZ3RoKXtpPWkuc2xpY2UoMCksZT1lfHxbXTtmb3IodmFyIG49dGhpcy5fb25jZUV2ZW50cyYmdGhpcy5fb25jZUV2ZW50c1t0XSxzPTA7czxpLmxlbmd0aDtzKyspe3ZhciBvPWlbc10scj1uJiZuW29dO3ImJih0aGlzLm9mZih0LG8pLGRlbGV0ZSBuW29dKSxvLmFwcGx5KHRoaXMsZSl9cmV0dXJuIHRoaXN9fSxlLmFsbE9mZj1mdW5jdGlvbigpe2RlbGV0ZSB0aGlzLl9ldmVudHMsZGVsZXRlIHRoaXMuX29uY2VFdmVudHN9LHR9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJnZXQtc2l6ZS9nZXQtc2l6ZVwiLGUpOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUoKTp0LmdldFNpemU9ZSgpfSh3aW5kb3csZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiB0KHQpe3ZhciBlPXBhcnNlRmxvYXQodCksaT10LmluZGV4T2YoXCIlXCIpPT0tMSYmIWlzTmFOKGUpO3JldHVybiBpJiZlfWZ1bmN0aW9uIGUoKXt9ZnVuY3Rpb24gaSgpe2Zvcih2YXIgdD17d2lkdGg6MCxoZWlnaHQ6MCxpbm5lcldpZHRoOjAsaW5uZXJIZWlnaHQ6MCxvdXRlcldpZHRoOjAsb3V0ZXJIZWlnaHQ6MH0sZT0wO2U8aDtlKyspe3ZhciBpPWxbZV07dFtpXT0wfXJldHVybiB0fWZ1bmN0aW9uIG4odCl7dmFyIGU9Z2V0Q29tcHV0ZWRTdHlsZSh0KTtyZXR1cm4gZXx8YShcIlN0eWxlIHJldHVybmVkIFwiK2UrXCIuIEFyZSB5b3UgcnVubmluZyB0aGlzIGNvZGUgaW4gYSBoaWRkZW4gaWZyYW1lIG9uIEZpcmVmb3g/IFNlZSBodHRwczovL2JpdC5seS9nZXRzaXplYnVnMVwiKSxlfWZ1bmN0aW9uIHMoKXtpZighYyl7Yz0hMDt2YXIgZT1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO2Uuc3R5bGUud2lkdGg9XCIyMDBweFwiLGUuc3R5bGUucGFkZGluZz1cIjFweCAycHggM3B4IDRweFwiLGUuc3R5bGUuYm9yZGVyU3R5bGU9XCJzb2xpZFwiLGUuc3R5bGUuYm9yZGVyV2lkdGg9XCIxcHggMnB4IDNweCA0cHhcIixlLnN0eWxlLmJveFNpemluZz1cImJvcmRlci1ib3hcIjt2YXIgaT1kb2N1bWVudC5ib2R5fHxkb2N1bWVudC5kb2N1bWVudEVsZW1lbnQ7aS5hcHBlbmRDaGlsZChlKTt2YXIgcz1uKGUpO3I9MjAwPT1NYXRoLnJvdW5kKHQocy53aWR0aCkpLG8uaXNCb3hTaXplT3V0ZXI9cixpLnJlbW92ZUNoaWxkKGUpfX1mdW5jdGlvbiBvKGUpe2lmKHMoKSxcInN0cmluZ1wiPT10eXBlb2YgZSYmKGU9ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihlKSksZSYmXCJvYmplY3RcIj09dHlwZW9mIGUmJmUubm9kZVR5cGUpe3ZhciBvPW4oZSk7aWYoXCJub25lXCI9PW8uZGlzcGxheSlyZXR1cm4gaSgpO3ZhciBhPXt9O2Eud2lkdGg9ZS5vZmZzZXRXaWR0aCxhLmhlaWdodD1lLm9mZnNldEhlaWdodDtmb3IodmFyIGM9YS5pc0JvcmRlckJveD1cImJvcmRlci1ib3hcIj09by5ib3hTaXppbmcsZD0wO2Q8aDtkKyspe3ZhciB1PWxbZF0sZj1vW3VdLHA9cGFyc2VGbG9hdChmKTthW3VdPWlzTmFOKHApPzA6cH12YXIgZz1hLnBhZGRpbmdMZWZ0K2EucGFkZGluZ1JpZ2h0LHY9YS5wYWRkaW5nVG9wK2EucGFkZGluZ0JvdHRvbSxtPWEubWFyZ2luTGVmdCthLm1hcmdpblJpZ2h0LHk9YS5tYXJnaW5Ub3ArYS5tYXJnaW5Cb3R0b20sYj1hLmJvcmRlckxlZnRXaWR0aCthLmJvcmRlclJpZ2h0V2lkdGgsRT1hLmJvcmRlclRvcFdpZHRoK2EuYm9yZGVyQm90dG9tV2lkdGgsUz1jJiZyLEM9dChvLndpZHRoKTtDIT09ITEmJihhLndpZHRoPUMrKFM/MDpnK2IpKTt2YXIgeD10KG8uaGVpZ2h0KTtyZXR1cm4geCE9PSExJiYoYS5oZWlnaHQ9eCsoUz8wOnYrRSkpLGEuaW5uZXJXaWR0aD1hLndpZHRoLShnK2IpLGEuaW5uZXJIZWlnaHQ9YS5oZWlnaHQtKHYrRSksYS5vdXRlcldpZHRoPWEud2lkdGgrbSxhLm91dGVySGVpZ2h0PWEuaGVpZ2h0K3ksYX19dmFyIHIsYT1cInVuZGVmaW5lZFwiPT10eXBlb2YgY29uc29sZT9lOmZ1bmN0aW9uKHQpe2NvbnNvbGUuZXJyb3IodCl9LGw9W1wicGFkZGluZ0xlZnRcIixcInBhZGRpbmdSaWdodFwiLFwicGFkZGluZ1RvcFwiLFwicGFkZGluZ0JvdHRvbVwiLFwibWFyZ2luTGVmdFwiLFwibWFyZ2luUmlnaHRcIixcIm1hcmdpblRvcFwiLFwibWFyZ2luQm90dG9tXCIsXCJib3JkZXJMZWZ0V2lkdGhcIixcImJvcmRlclJpZ2h0V2lkdGhcIixcImJvcmRlclRvcFdpZHRoXCIsXCJib3JkZXJCb3R0b21XaWR0aFwiXSxoPWwubGVuZ3RoLGM9ITE7cmV0dXJuIG99KSxmdW5jdGlvbih0LGUpe1widXNlIHN0cmljdFwiO1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJkZXNhbmRyby1tYXRjaGVzLXNlbGVjdG9yL21hdGNoZXMtc2VsZWN0b3JcIixlKTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKCk6dC5tYXRjaGVzU2VsZWN0b3I9ZSgpfSh3aW5kb3csZnVuY3Rpb24oKXtcInVzZSBzdHJpY3RcIjt2YXIgdD1mdW5jdGlvbigpe3ZhciB0PXdpbmRvdy5FbGVtZW50LnByb3RvdHlwZTtpZih0Lm1hdGNoZXMpcmV0dXJuXCJtYXRjaGVzXCI7aWYodC5tYXRjaGVzU2VsZWN0b3IpcmV0dXJuXCJtYXRjaGVzU2VsZWN0b3JcIjtmb3IodmFyIGU9W1wid2Via2l0XCIsXCJtb3pcIixcIm1zXCIsXCJvXCJdLGk9MDtpPGUubGVuZ3RoO2krKyl7dmFyIG49ZVtpXSxzPW4rXCJNYXRjaGVzU2VsZWN0b3JcIjtpZih0W3NdKXJldHVybiBzfX0oKTtyZXR1cm4gZnVuY3Rpb24oZSxpKXtyZXR1cm4gZVt0XShpKX19KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmaXp6eS11aS11dGlscy91dGlsc1wiLFtcImRlc2FuZHJvLW1hdGNoZXMtc2VsZWN0b3IvbWF0Y2hlcy1zZWxlY3RvclwiXSxmdW5jdGlvbihpKXtyZXR1cm4gZSh0LGkpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJkZXNhbmRyby1tYXRjaGVzLXNlbGVjdG9yXCIpKTp0LmZpenp5VUlVdGlscz1lKHQsdC5tYXRjaGVzU2VsZWN0b3IpfSh3aW5kb3csZnVuY3Rpb24odCxlKXt2YXIgaT17fTtpLmV4dGVuZD1mdW5jdGlvbih0LGUpe2Zvcih2YXIgaSBpbiBlKXRbaV09ZVtpXTtyZXR1cm4gdH0saS5tb2R1bG89ZnVuY3Rpb24odCxlKXtyZXR1cm4odCVlK2UpJWV9O3ZhciBuPUFycmF5LnByb3RvdHlwZS5zbGljZTtpLm1ha2VBcnJheT1mdW5jdGlvbih0KXtpZihBcnJheS5pc0FycmF5KHQpKXJldHVybiB0O2lmKG51bGw9PT10fHx2b2lkIDA9PT10KXJldHVybltdO3ZhciBlPVwib2JqZWN0XCI9PXR5cGVvZiB0JiZcIm51bWJlclwiPT10eXBlb2YgdC5sZW5ndGg7cmV0dXJuIGU/bi5jYWxsKHQpOlt0XX0saS5yZW1vdmVGcm9tPWZ1bmN0aW9uKHQsZSl7dmFyIGk9dC5pbmRleE9mKGUpO2khPS0xJiZ0LnNwbGljZShpLDEpfSxpLmdldFBhcmVudD1mdW5jdGlvbih0LGkpe2Zvcig7dC5wYXJlbnROb2RlJiZ0IT1kb2N1bWVudC5ib2R5OylpZih0PXQucGFyZW50Tm9kZSxlKHQsaSkpcmV0dXJuIHR9LGkuZ2V0UXVlcnlFbGVtZW50PWZ1bmN0aW9uKHQpe3JldHVyblwic3RyaW5nXCI9PXR5cGVvZiB0P2RvY3VtZW50LnF1ZXJ5U2VsZWN0b3IodCk6dH0saS5oYW5kbGVFdmVudD1mdW5jdGlvbih0KXt2YXIgZT1cIm9uXCIrdC50eXBlO3RoaXNbZV0mJnRoaXNbZV0odCl9LGkuZmlsdGVyRmluZEVsZW1lbnRzPWZ1bmN0aW9uKHQsbil7dD1pLm1ha2VBcnJheSh0KTt2YXIgcz1bXTtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKHQpe2lmKHQgaW5zdGFuY2VvZiBIVE1MRWxlbWVudCl7aWYoIW4pcmV0dXJuIHZvaWQgcy5wdXNoKHQpO2UodCxuKSYmcy5wdXNoKHQpO2Zvcih2YXIgaT10LnF1ZXJ5U2VsZWN0b3JBbGwobiksbz0wO288aS5sZW5ndGg7bysrKXMucHVzaChpW29dKX19KSxzfSxpLmRlYm91bmNlTWV0aG9kPWZ1bmN0aW9uKHQsZSxpKXtpPWl8fDEwMDt2YXIgbj10LnByb3RvdHlwZVtlXSxzPWUrXCJUaW1lb3V0XCI7dC5wcm90b3R5cGVbZV09ZnVuY3Rpb24oKXt2YXIgdD10aGlzW3NdO2NsZWFyVGltZW91dCh0KTt2YXIgZT1hcmd1bWVudHMsbz10aGlzO3RoaXNbc109c2V0VGltZW91dChmdW5jdGlvbigpe24uYXBwbHkobyxlKSxkZWxldGUgb1tzXX0saSl9fSxpLmRvY1JlYWR5PWZ1bmN0aW9uKHQpe3ZhciBlPWRvY3VtZW50LnJlYWR5U3RhdGU7XCJjb21wbGV0ZVwiPT1lfHxcImludGVyYWN0aXZlXCI9PWU/c2V0VGltZW91dCh0KTpkb2N1bWVudC5hZGRFdmVudExpc3RlbmVyKFwiRE9NQ29udGVudExvYWRlZFwiLHQpfSxpLnRvRGFzaGVkPWZ1bmN0aW9uKHQpe3JldHVybiB0LnJlcGxhY2UoLyguKShbQS1aXSkvZyxmdW5jdGlvbih0LGUsaSl7cmV0dXJuIGUrXCItXCIraX0pLnRvTG93ZXJDYXNlKCl9O3ZhciBzPXQuY29uc29sZTtyZXR1cm4gaS5odG1sSW5pdD1mdW5jdGlvbihlLG4pe2kuZG9jUmVhZHkoZnVuY3Rpb24oKXt2YXIgbz1pLnRvRGFzaGVkKG4pLHI9XCJkYXRhLVwiK28sYT1kb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW1wiK3IrXCJdXCIpLGw9ZG9jdW1lbnQucXVlcnlTZWxlY3RvckFsbChcIi5qcy1cIitvKSxoPWkubWFrZUFycmF5KGEpLmNvbmNhdChpLm1ha2VBcnJheShsKSksYz1yK1wiLW9wdGlvbnNcIixkPXQualF1ZXJ5O2guZm9yRWFjaChmdW5jdGlvbih0KXt2YXIgaSxvPXQuZ2V0QXR0cmlidXRlKHIpfHx0LmdldEF0dHJpYnV0ZShjKTt0cnl7aT1vJiZKU09OLnBhcnNlKG8pfWNhdGNoKGEpe3JldHVybiB2b2lkKHMmJnMuZXJyb3IoXCJFcnJvciBwYXJzaW5nIFwiK3IrXCIgb24gXCIrdC5jbGFzc05hbWUrXCI6IFwiK2EpKX12YXIgbD1uZXcgZSh0LGkpO2QmJmQuZGF0YSh0LG4sbCl9KX0pfSxpfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvY2VsbFwiLFtcImdldC1zaXplL2dldC1zaXplXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImdldC1zaXplXCIpKToodC5GbGlja2l0eT10LkZsaWNraXR5fHx7fSx0LkZsaWNraXR5LkNlbGw9ZSh0LHQuZ2V0U2l6ZSkpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKHQsZSl7dGhpcy5lbGVtZW50PXQsdGhpcy5wYXJlbnQ9ZSx0aGlzLmNyZWF0ZSgpfXZhciBuPWkucHJvdG90eXBlO3JldHVybiBuLmNyZWF0ZT1mdW5jdGlvbigpe3RoaXMuZWxlbWVudC5zdHlsZS5wb3NpdGlvbj1cImFic29sdXRlXCIsdGhpcy5lbGVtZW50LnNldEF0dHJpYnV0ZShcImFyaWEtc2VsZWN0ZWRcIixcImZhbHNlXCIpLHRoaXMueD0wLHRoaXMuc2hpZnQ9MH0sbi5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5lbGVtZW50LnN0eWxlLnBvc2l0aW9uPVwiXCI7dmFyIHQ9dGhpcy5wYXJlbnQub3JpZ2luU2lkZTt0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKFwiYXJpYS1zZWxlY3RlZFwiKSx0aGlzLmVsZW1lbnQuc3R5bGVbdF09XCJcIn0sbi5nZXRTaXplPWZ1bmN0aW9uKCl7dGhpcy5zaXplPWUodGhpcy5lbGVtZW50KX0sbi5zZXRQb3NpdGlvbj1mdW5jdGlvbih0KXt0aGlzLng9dCx0aGlzLnVwZGF0ZVRhcmdldCgpLHRoaXMucmVuZGVyUG9zaXRpb24odCl9LG4udXBkYXRlVGFyZ2V0PW4uc2V0RGVmYXVsdFRhcmdldD1mdW5jdGlvbigpe3ZhciB0PVwibGVmdFwiPT10aGlzLnBhcmVudC5vcmlnaW5TaWRlP1wibWFyZ2luTGVmdFwiOlwibWFyZ2luUmlnaHRcIjt0aGlzLnRhcmdldD10aGlzLngrdGhpcy5zaXplW3RdK3RoaXMuc2l6ZS53aWR0aCp0aGlzLnBhcmVudC5jZWxsQWxpZ259LG4ucmVuZGVyUG9zaXRpb249ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5wYXJlbnQub3JpZ2luU2lkZTt0aGlzLmVsZW1lbnQuc3R5bGVbZV09dGhpcy5wYXJlbnQuZ2V0UG9zaXRpb25WYWx1ZSh0KX0sbi53cmFwU2hpZnQ9ZnVuY3Rpb24odCl7dGhpcy5zaGlmdD10LHRoaXMucmVuZGVyUG9zaXRpb24odGhpcy54K3RoaXMucGFyZW50LnNsaWRlYWJsZVdpZHRoKnQpfSxuLnJlbW92ZT1mdW5jdGlvbigpe3RoaXMuZWxlbWVudC5wYXJlbnROb2RlLnJlbW92ZUNoaWxkKHRoaXMuZWxlbWVudCl9LGl9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9zbGlkZVwiLGUpOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUoKToodC5GbGlja2l0eT10LkZsaWNraXR5fHx7fSx0LkZsaWNraXR5LlNsaWRlPWUoKSl9KHdpbmRvdyxmdW5jdGlvbigpe1widXNlIHN0cmljdFwiO2Z1bmN0aW9uIHQodCl7dGhpcy5wYXJlbnQ9dCx0aGlzLmlzT3JpZ2luTGVmdD1cImxlZnRcIj09dC5vcmlnaW5TaWRlLHRoaXMuY2VsbHM9W10sdGhpcy5vdXRlcldpZHRoPTAsdGhpcy5oZWlnaHQ9MH12YXIgZT10LnByb3RvdHlwZTtyZXR1cm4gZS5hZGRDZWxsPWZ1bmN0aW9uKHQpe2lmKHRoaXMuY2VsbHMucHVzaCh0KSx0aGlzLm91dGVyV2lkdGgrPXQuc2l6ZS5vdXRlcldpZHRoLHRoaXMuaGVpZ2h0PU1hdGgubWF4KHQuc2l6ZS5vdXRlckhlaWdodCx0aGlzLmhlaWdodCksMT09dGhpcy5jZWxscy5sZW5ndGgpe3RoaXMueD10Lng7dmFyIGU9dGhpcy5pc09yaWdpbkxlZnQ/XCJtYXJnaW5MZWZ0XCI6XCJtYXJnaW5SaWdodFwiO3RoaXMuZmlyc3RNYXJnaW49dC5zaXplW2VdfX0sZS51cGRhdGVUYXJnZXQ9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLmlzT3JpZ2luTGVmdD9cIm1hcmdpblJpZ2h0XCI6XCJtYXJnaW5MZWZ0XCIsZT10aGlzLmdldExhc3RDZWxsKCksaT1lP2Uuc2l6ZVt0XTowLG49dGhpcy5vdXRlcldpZHRoLSh0aGlzLmZpcnN0TWFyZ2luK2kpO3RoaXMudGFyZ2V0PXRoaXMueCt0aGlzLmZpcnN0TWFyZ2luK24qdGhpcy5wYXJlbnQuY2VsbEFsaWdufSxlLmdldExhc3RDZWxsPWZ1bmN0aW9uKCl7cmV0dXJuIHRoaXMuY2VsbHNbdGhpcy5jZWxscy5sZW5ndGgtMV19LGUuc2VsZWN0PWZ1bmN0aW9uKCl7dGhpcy5jaGFuZ2VTZWxlY3RlZCghMCl9LGUudW5zZWxlY3Q9ZnVuY3Rpb24oKXt0aGlzLmNoYW5nZVNlbGVjdGVkKCExKX0sZS5jaGFuZ2VTZWxlY3RlZD1mdW5jdGlvbih0KXt2YXIgZT10P1wiYWRkXCI6XCJyZW1vdmVcIjt0aGlzLmNlbGxzLmZvckVhY2goZnVuY3Rpb24oaSl7aS5lbGVtZW50LmNsYXNzTGlzdFtlXShcImlzLXNlbGVjdGVkXCIpLGkuZWxlbWVudC5zZXRBdHRyaWJ1dGUoXCJhcmlhLXNlbGVjdGVkXCIsdC50b1N0cmluZygpKX0pfSxlLmdldENlbGxFbGVtZW50cz1mdW5jdGlvbigpe3JldHVybiB0aGlzLmNlbGxzLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gdC5lbGVtZW50fSl9LHR9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9hbmltYXRlXCIsW1wiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOih0LkZsaWNraXR5PXQuRmxpY2tpdHl8fHt9LHQuRmxpY2tpdHkuYW5pbWF0ZVByb3RvdHlwZT1lKHQsdC5maXp6eVVJVXRpbHMpKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7dmFyIGk9e307cmV0dXJuIGkuc3RhcnRBbmltYXRpb249ZnVuY3Rpb24oKXt0aGlzLmlzQW5pbWF0aW5nfHwodGhpcy5pc0FuaW1hdGluZz0hMCx0aGlzLnJlc3RpbmdGcmFtZXM9MCx0aGlzLmFuaW1hdGUoKSl9LGkuYW5pbWF0ZT1mdW5jdGlvbigpe3RoaXMuYXBwbHlEcmFnRm9yY2UoKSx0aGlzLmFwcGx5U2VsZWN0ZWRBdHRyYWN0aW9uKCk7dmFyIHQ9dGhpcy54O2lmKHRoaXMuaW50ZWdyYXRlUGh5c2ljcygpLHRoaXMucG9zaXRpb25TbGlkZXIoKSx0aGlzLnNldHRsZSh0KSx0aGlzLmlzQW5pbWF0aW5nKXt2YXIgZT10aGlzO3JlcXVlc3RBbmltYXRpb25GcmFtZShmdW5jdGlvbigpe2UuYW5pbWF0ZSgpfSl9fSxpLnBvc2l0aW9uU2xpZGVyPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy54O3RoaXMub3B0aW9ucy53cmFwQXJvdW5kJiZ0aGlzLmNlbGxzLmxlbmd0aD4xJiYodD1lLm1vZHVsbyh0LHRoaXMuc2xpZGVhYmxlV2lkdGgpLHQtPXRoaXMuc2xpZGVhYmxlV2lkdGgsdGhpcy5zaGlmdFdyYXBDZWxscyh0KSksdCs9dGhpcy5jdXJzb3JQb3NpdGlvbix0PXRoaXMub3B0aW9ucy5yaWdodFRvTGVmdD8tdDp0O3ZhciBpPXRoaXMuZ2V0UG9zaXRpb25WYWx1ZSh0KTt0aGlzLnNsaWRlci5zdHlsZS50cmFuc2Zvcm09dGhpcy5pc0FuaW1hdGluZz9cInRyYW5zbGF0ZTNkKFwiK2krXCIsMCwwKVwiOlwidHJhbnNsYXRlWChcIitpK1wiKVwiO3ZhciBuPXRoaXMuc2xpZGVzWzBdO2lmKG4pe3ZhciBzPS10aGlzLngtbi50YXJnZXQsbz1zL3RoaXMuc2xpZGVzV2lkdGg7dGhpcy5kaXNwYXRjaEV2ZW50KFwic2Nyb2xsXCIsbnVsbCxbbyxzXSl9fSxpLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZD1mdW5jdGlvbigpe3RoaXMuY2VsbHMubGVuZ3RoJiYodGhpcy54PS10aGlzLnNlbGVjdGVkU2xpZGUudGFyZ2V0LHRoaXMudmVsb2NpdHk9MCx0aGlzLnBvc2l0aW9uU2xpZGVyKCkpfSxpLmdldFBvc2l0aW9uVmFsdWU9ZnVuY3Rpb24odCl7cmV0dXJuIHRoaXMub3B0aW9ucy5wZXJjZW50UG9zaXRpb24/LjAxKk1hdGgucm91bmQodC90aGlzLnNpemUuaW5uZXJXaWR0aCoxZTQpK1wiJVwiOk1hdGgucm91bmQodCkrXCJweFwifSxpLnNldHRsZT1mdW5jdGlvbih0KXt0aGlzLmlzUG9pbnRlckRvd258fE1hdGgucm91bmQoMTAwKnRoaXMueCkhPU1hdGgucm91bmQoMTAwKnQpfHx0aGlzLnJlc3RpbmdGcmFtZXMrKyx0aGlzLnJlc3RpbmdGcmFtZXM+MiYmKHRoaXMuaXNBbmltYXRpbmc9ITEsZGVsZXRlIHRoaXMuaXNGcmVlU2Nyb2xsaW5nLHRoaXMucG9zaXRpb25TbGlkZXIoKSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJzZXR0bGVcIixudWxsLFt0aGlzLnNlbGVjdGVkSW5kZXhdKSl9LGkuc2hpZnRXcmFwQ2VsbHM9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5jdXJzb3JQb3NpdGlvbit0O3RoaXMuX3NoaWZ0Q2VsbHModGhpcy5iZWZvcmVTaGlmdENlbGxzLGUsLTEpO3ZhciBpPXRoaXMuc2l6ZS5pbm5lcldpZHRoLSh0K3RoaXMuc2xpZGVhYmxlV2lkdGgrdGhpcy5jdXJzb3JQb3NpdGlvbik7dGhpcy5fc2hpZnRDZWxscyh0aGlzLmFmdGVyU2hpZnRDZWxscyxpLDEpfSxpLl9zaGlmdENlbGxzPWZ1bmN0aW9uKHQsZSxpKXtmb3IodmFyIG49MDtuPHQubGVuZ3RoO24rKyl7dmFyIHM9dFtuXSxvPWU+MD9pOjA7cy53cmFwU2hpZnQobyksZS09cy5zaXplLm91dGVyV2lkdGh9fSxpLl91bnNoaWZ0Q2VsbHM9ZnVuY3Rpb24odCl7aWYodCYmdC5sZW5ndGgpZm9yKHZhciBlPTA7ZTx0Lmxlbmd0aDtlKyspdFtlXS53cmFwU2hpZnQoMCl9LGkuaW50ZWdyYXRlUGh5c2ljcz1mdW5jdGlvbigpe3RoaXMueCs9dGhpcy52ZWxvY2l0eSx0aGlzLnZlbG9jaXR5Kj10aGlzLmdldEZyaWN0aW9uRmFjdG9yKCl9LGkuYXBwbHlGb3JjZT1mdW5jdGlvbih0KXt0aGlzLnZlbG9jaXR5Kz10fSxpLmdldEZyaWN0aW9uRmFjdG9yPWZ1bmN0aW9uKCl7cmV0dXJuIDEtdGhpcy5vcHRpb25zW3RoaXMuaXNGcmVlU2Nyb2xsaW5nP1wiZnJlZVNjcm9sbEZyaWN0aW9uXCI6XCJmcmljdGlvblwiXX0saS5nZXRSZXN0aW5nUG9zaXRpb249ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy54K3RoaXMudmVsb2NpdHkvKDEtdGhpcy5nZXRGcmljdGlvbkZhY3RvcigpKX0saS5hcHBseURyYWdGb3JjZT1mdW5jdGlvbigpe2lmKHRoaXMuaXNEcmFnZ2FibGUmJnRoaXMuaXNQb2ludGVyRG93bil7dmFyIHQ9dGhpcy5kcmFnWC10aGlzLngsZT10LXRoaXMudmVsb2NpdHk7dGhpcy5hcHBseUZvcmNlKGUpfX0saS5hcHBseVNlbGVjdGVkQXR0cmFjdGlvbj1mdW5jdGlvbigpe3ZhciB0PXRoaXMuaXNEcmFnZ2FibGUmJnRoaXMuaXNQb2ludGVyRG93bjtpZighdCYmIXRoaXMuaXNGcmVlU2Nyb2xsaW5nJiZ0aGlzLnNsaWRlcy5sZW5ndGgpe3ZhciBlPXRoaXMuc2VsZWN0ZWRTbGlkZS50YXJnZXQqLTEtdGhpcy54LGk9ZSp0aGlzLm9wdGlvbnMuc2VsZWN0ZWRBdHRyYWN0aW9uO3RoaXMuYXBwbHlGb3JjZShpKX19LGl9KSxmdW5jdGlvbih0LGUpe2lmKFwiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZClkZWZpbmUoXCJmbGlja2l0eS9qcy9mbGlja2l0eVwiLFtcImV2LWVtaXR0ZXIvZXYtZW1pdHRlclwiLFwiZ2V0LXNpemUvZ2V0LXNpemVcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCIsXCIuL2NlbGxcIixcIi4vc2xpZGVcIixcIi4vYW5pbWF0ZVwiXSxmdW5jdGlvbihpLG4scyxvLHIsYSl7cmV0dXJuIGUodCxpLG4scyxvLHIsYSl9KTtlbHNlIGlmKFwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzKW1vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZXYtZW1pdHRlclwiKSxyZXF1aXJlKFwiZ2V0LXNpemVcIikscmVxdWlyZShcImZpenp5LXVpLXV0aWxzXCIpLHJlcXVpcmUoXCIuL2NlbGxcIikscmVxdWlyZShcIi4vc2xpZGVcIikscmVxdWlyZShcIi4vYW5pbWF0ZVwiKSk7ZWxzZXt2YXIgaT10LkZsaWNraXR5O3QuRmxpY2tpdHk9ZSh0LHQuRXZFbWl0dGVyLHQuZ2V0U2l6ZSx0LmZpenp5VUlVdGlscyxpLkNlbGwsaS5TbGlkZSxpLmFuaW1hdGVQcm90b3R5cGUpfX0od2luZG93LGZ1bmN0aW9uKHQsZSxpLG4scyxvLHIpe2Z1bmN0aW9uIGEodCxlKXtmb3IodD1uLm1ha2VBcnJheSh0KTt0Lmxlbmd0aDspZS5hcHBlbmRDaGlsZCh0LnNoaWZ0KCkpfWZ1bmN0aW9uIGwodCxlKXt2YXIgaT1uLmdldFF1ZXJ5RWxlbWVudCh0KTtpZighaSlyZXR1cm4gdm9pZChkJiZkLmVycm9yKFwiQmFkIGVsZW1lbnQgZm9yIEZsaWNraXR5OiBcIisoaXx8dCkpKTtpZih0aGlzLmVsZW1lbnQ9aSx0aGlzLmVsZW1lbnQuZmxpY2tpdHlHVUlEKXt2YXIgcz1mW3RoaXMuZWxlbWVudC5mbGlja2l0eUdVSURdO3JldHVybiBzLm9wdGlvbihlKSxzfWgmJih0aGlzLiRlbGVtZW50PWgodGhpcy5lbGVtZW50KSksdGhpcy5vcHRpb25zPW4uZXh0ZW5kKHt9LHRoaXMuY29uc3RydWN0b3IuZGVmYXVsdHMpLHRoaXMub3B0aW9uKGUpLHRoaXMuX2NyZWF0ZSgpfXZhciBoPXQualF1ZXJ5LGM9dC5nZXRDb21wdXRlZFN0eWxlLGQ9dC5jb25zb2xlLHU9MCxmPXt9O2wuZGVmYXVsdHM9e2FjY2Vzc2liaWxpdHk6ITAsY2VsbEFsaWduOlwiY2VudGVyXCIsZnJlZVNjcm9sbEZyaWN0aW9uOi4wNzUsZnJpY3Rpb246LjI4LG5hbWVzcGFjZUpRdWVyeUV2ZW50czohMCxwZXJjZW50UG9zaXRpb246ITAscmVzaXplOiEwLHNlbGVjdGVkQXR0cmFjdGlvbjouMDI1LHNldEdhbGxlcnlTaXplOiEwfSxsLmNyZWF0ZU1ldGhvZHM9W107dmFyIHA9bC5wcm90b3R5cGU7bi5leHRlbmQocCxlLnByb3RvdHlwZSkscC5fY3JlYXRlPWZ1bmN0aW9uKCl7dmFyIGU9dGhpcy5ndWlkPSsrdTt0aGlzLmVsZW1lbnQuZmxpY2tpdHlHVUlEPWUsZltlXT10aGlzLHRoaXMuc2VsZWN0ZWRJbmRleD0wLHRoaXMucmVzdGluZ0ZyYW1lcz0wLHRoaXMueD0wLHRoaXMudmVsb2NpdHk9MCx0aGlzLm9yaWdpblNpZGU9dGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0P1wicmlnaHRcIjpcImxlZnRcIix0aGlzLnZpZXdwb3J0PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJkaXZcIiksdGhpcy52aWV3cG9ydC5jbGFzc05hbWU9XCJmbGlja2l0eS12aWV3cG9ydFwiLHRoaXMuX2NyZWF0ZVNsaWRlcigpLCh0aGlzLm9wdGlvbnMucmVzaXplfHx0aGlzLm9wdGlvbnMud2F0Y2hDU1MpJiZ0LmFkZEV2ZW50TGlzdGVuZXIoXCJyZXNpemVcIix0aGlzKTtmb3IodmFyIGkgaW4gdGhpcy5vcHRpb25zLm9uKXt2YXIgbj10aGlzLm9wdGlvbnMub25baV07dGhpcy5vbihpLG4pfWwuY3JlYXRlTWV0aG9kcy5mb3JFYWNoKGZ1bmN0aW9uKHQpe3RoaXNbdF0oKX0sdGhpcyksdGhpcy5vcHRpb25zLndhdGNoQ1NTP3RoaXMud2F0Y2hDU1MoKTp0aGlzLmFjdGl2YXRlKCl9LHAub3B0aW9uPWZ1bmN0aW9uKHQpe24uZXh0ZW5kKHRoaXMub3B0aW9ucyx0KX0scC5hY3RpdmF0ZT1mdW5jdGlvbigpe2lmKCF0aGlzLmlzQWN0aXZlKXt0aGlzLmlzQWN0aXZlPSEwLHRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZmxpY2tpdHktZW5hYmxlZFwiKSx0aGlzLm9wdGlvbnMucmlnaHRUb0xlZnQmJnRoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiZmxpY2tpdHktcnRsXCIpLHRoaXMuZ2V0U2l6ZSgpO3ZhciB0PXRoaXMuX2ZpbHRlckZpbmRDZWxsRWxlbWVudHModGhpcy5lbGVtZW50LmNoaWxkcmVuKTthKHQsdGhpcy5zbGlkZXIpLHRoaXMudmlld3BvcnQuYXBwZW5kQ2hpbGQodGhpcy5zbGlkZXIpLHRoaXMuZWxlbWVudC5hcHBlbmRDaGlsZCh0aGlzLnZpZXdwb3J0KSx0aGlzLnJlbG9hZENlbGxzKCksdGhpcy5vcHRpb25zLmFjY2Vzc2liaWxpdHkmJih0aGlzLmVsZW1lbnQudGFiSW5kZXg9MCx0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcImtleWRvd25cIix0aGlzKSksdGhpcy5lbWl0RXZlbnQoXCJhY3RpdmF0ZVwiKTt2YXIgZSxpPXRoaXMub3B0aW9ucy5pbml0aWFsSW5kZXg7ZT10aGlzLmlzSW5pdEFjdGl2YXRlZD90aGlzLnNlbGVjdGVkSW5kZXg6dm9pZCAwIT09aSYmdGhpcy5jZWxsc1tpXT9pOjAsdGhpcy5zZWxlY3QoZSwhMSwhMCksdGhpcy5pc0luaXRBY3RpdmF0ZWQ9ITAsdGhpcy5kaXNwYXRjaEV2ZW50KFwicmVhZHlcIil9fSxwLl9jcmVhdGVTbGlkZXI9ZnVuY3Rpb24oKXt2YXIgdD1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwiZGl2XCIpO3QuY2xhc3NOYW1lPVwiZmxpY2tpdHktc2xpZGVyXCIsdC5zdHlsZVt0aGlzLm9yaWdpblNpZGVdPTAsdGhpcy5zbGlkZXI9dH0scC5fZmlsdGVyRmluZENlbGxFbGVtZW50cz1mdW5jdGlvbih0KXtyZXR1cm4gbi5maWx0ZXJGaW5kRWxlbWVudHModCx0aGlzLm9wdGlvbnMuY2VsbFNlbGVjdG9yKX0scC5yZWxvYWRDZWxscz1mdW5jdGlvbigpe3RoaXMuY2VsbHM9dGhpcy5fbWFrZUNlbGxzKHRoaXMuc2xpZGVyLmNoaWxkcmVuKSx0aGlzLnBvc2l0aW9uQ2VsbHMoKSx0aGlzLl9nZXRXcmFwU2hpZnRDZWxscygpLHRoaXMuc2V0R2FsbGVyeVNpemUoKX0scC5fbWFrZUNlbGxzPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuX2ZpbHRlckZpbmRDZWxsRWxlbWVudHModCksaT1lLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gbmV3IHModCx0aGlzKX0sdGhpcyk7cmV0dXJuIGl9LHAuZ2V0TGFzdENlbGw9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jZWxsc1t0aGlzLmNlbGxzLmxlbmd0aC0xXX0scC5nZXRMYXN0U2xpZGU9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5zbGlkZXNbdGhpcy5zbGlkZXMubGVuZ3RoLTFdfSxwLnBvc2l0aW9uQ2VsbHM9ZnVuY3Rpb24oKXt0aGlzLl9zaXplQ2VsbHModGhpcy5jZWxscyksdGhpcy5fcG9zaXRpb25DZWxscygwKX0scC5fcG9zaXRpb25DZWxscz1mdW5jdGlvbih0KXt0PXR8fDAsdGhpcy5tYXhDZWxsSGVpZ2h0PXQ/dGhpcy5tYXhDZWxsSGVpZ2h0fHwwOjA7dmFyIGU9MDtpZih0PjApe3ZhciBpPXRoaXMuY2VsbHNbdC0xXTtlPWkueCtpLnNpemUub3V0ZXJXaWR0aH1mb3IodmFyIG49dGhpcy5jZWxscy5sZW5ndGgscz10O3M8bjtzKyspe3ZhciBvPXRoaXMuY2VsbHNbc107by5zZXRQb3NpdGlvbihlKSxlKz1vLnNpemUub3V0ZXJXaWR0aCx0aGlzLm1heENlbGxIZWlnaHQ9TWF0aC5tYXgoby5zaXplLm91dGVySGVpZ2h0LHRoaXMubWF4Q2VsbEhlaWdodCl9dGhpcy5zbGlkZWFibGVXaWR0aD1lLHRoaXMudXBkYXRlU2xpZGVzKCksdGhpcy5fY29udGFpblNsaWRlcygpLHRoaXMuc2xpZGVzV2lkdGg9bj90aGlzLmdldExhc3RTbGlkZSgpLnRhcmdldC10aGlzLnNsaWRlc1swXS50YXJnZXQ6MH0scC5fc2l6ZUNlbGxzPWZ1bmN0aW9uKHQpe3QuZm9yRWFjaChmdW5jdGlvbih0KXt0LmdldFNpemUoKX0pfSxwLnVwZGF0ZVNsaWRlcz1mdW5jdGlvbigpe2lmKHRoaXMuc2xpZGVzPVtdLHRoaXMuY2VsbHMubGVuZ3RoKXt2YXIgdD1uZXcgbyh0aGlzKTt0aGlzLnNsaWRlcy5wdXNoKHQpO3ZhciBlPVwibGVmdFwiPT10aGlzLm9yaWdpblNpZGUsaT1lP1wibWFyZ2luUmlnaHRcIjpcIm1hcmdpbkxlZnRcIixuPXRoaXMuX2dldENhbkNlbGxGaXQoKTt0aGlzLmNlbGxzLmZvckVhY2goZnVuY3Rpb24oZSxzKXtpZighdC5jZWxscy5sZW5ndGgpcmV0dXJuIHZvaWQgdC5hZGRDZWxsKGUpO3ZhciByPXQub3V0ZXJXaWR0aC10LmZpcnN0TWFyZ2luKyhlLnNpemUub3V0ZXJXaWR0aC1lLnNpemVbaV0pO24uY2FsbCh0aGlzLHMscik/dC5hZGRDZWxsKGUpOih0LnVwZGF0ZVRhcmdldCgpLHQ9bmV3IG8odGhpcyksdGhpcy5zbGlkZXMucHVzaCh0KSx0LmFkZENlbGwoZSkpfSx0aGlzKSx0LnVwZGF0ZVRhcmdldCgpLHRoaXMudXBkYXRlU2VsZWN0ZWRTbGlkZSgpfX0scC5fZ2V0Q2FuQ2VsbEZpdD1mdW5jdGlvbigpe3ZhciB0PXRoaXMub3B0aW9ucy5ncm91cENlbGxzO2lmKCF0KXJldHVybiBmdW5jdGlvbigpe3JldHVybiExfTtpZihcIm51bWJlclwiPT10eXBlb2YgdCl7dmFyIGU9cGFyc2VJbnQodCwxMCk7cmV0dXJuIGZ1bmN0aW9uKHQpe3JldHVybiB0JWUhPT0wfX12YXIgaT1cInN0cmluZ1wiPT10eXBlb2YgdCYmdC5tYXRjaCgvXihcXGQrKSUkLyksbj1pP3BhcnNlSW50KGlbMV0sMTApLzEwMDoxO3JldHVybiBmdW5jdGlvbih0LGUpe3JldHVybiBlPD0odGhpcy5zaXplLmlubmVyV2lkdGgrMSkqbn19LHAuX2luaXQ9cC5yZXBvc2l0aW9uPWZ1bmN0aW9uKCl7dGhpcy5wb3NpdGlvbkNlbGxzKCksdGhpcy5wb3NpdGlvblNsaWRlckF0U2VsZWN0ZWQoKX0scC5nZXRTaXplPWZ1bmN0aW9uKCl7dGhpcy5zaXplPWkodGhpcy5lbGVtZW50KSx0aGlzLnNldENlbGxBbGlnbigpLHRoaXMuY3Vyc29yUG9zaXRpb249dGhpcy5zaXplLmlubmVyV2lkdGgqdGhpcy5jZWxsQWxpZ259O3ZhciBnPXtjZW50ZXI6e2xlZnQ6LjUscmlnaHQ6LjV9LGxlZnQ6e2xlZnQ6MCxyaWdodDoxfSxyaWdodDp7cmlnaHQ6MCxsZWZ0OjF9fTtyZXR1cm4gcC5zZXRDZWxsQWxpZ249ZnVuY3Rpb24oKXt2YXIgdD1nW3RoaXMub3B0aW9ucy5jZWxsQWxpZ25dO3RoaXMuY2VsbEFsaWduPXQ/dFt0aGlzLm9yaWdpblNpZGVdOnRoaXMub3B0aW9ucy5jZWxsQWxpZ259LHAuc2V0R2FsbGVyeVNpemU9ZnVuY3Rpb24oKXtpZih0aGlzLm9wdGlvbnMuc2V0R2FsbGVyeVNpemUpe3ZhciB0PXRoaXMub3B0aW9ucy5hZGFwdGl2ZUhlaWdodCYmdGhpcy5zZWxlY3RlZFNsaWRlP3RoaXMuc2VsZWN0ZWRTbGlkZS5oZWlnaHQ6dGhpcy5tYXhDZWxsSGVpZ2h0O3RoaXMudmlld3BvcnQuc3R5bGUuaGVpZ2h0PXQrXCJweFwifX0scC5fZ2V0V3JhcFNoaWZ0Q2VsbHM9ZnVuY3Rpb24oKXtpZih0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCl7dGhpcy5fdW5zaGlmdENlbGxzKHRoaXMuYmVmb3JlU2hpZnRDZWxscyksdGhpcy5fdW5zaGlmdENlbGxzKHRoaXMuYWZ0ZXJTaGlmdENlbGxzKTt2YXIgdD10aGlzLmN1cnNvclBvc2l0aW9uLGU9dGhpcy5jZWxscy5sZW5ndGgtMTt0aGlzLmJlZm9yZVNoaWZ0Q2VsbHM9dGhpcy5fZ2V0R2FwQ2VsbHModCxlLC0xKSx0PXRoaXMuc2l6ZS5pbm5lcldpZHRoLXRoaXMuY3Vyc29yUG9zaXRpb24sdGhpcy5hZnRlclNoaWZ0Q2VsbHM9dGhpcy5fZ2V0R2FwQ2VsbHModCwwLDEpfX0scC5fZ2V0R2FwQ2VsbHM9ZnVuY3Rpb24odCxlLGkpe2Zvcih2YXIgbj1bXTt0PjA7KXt2YXIgcz10aGlzLmNlbGxzW2VdO2lmKCFzKWJyZWFrO24ucHVzaChzKSxlKz1pLHQtPXMuc2l6ZS5vdXRlcldpZHRofXJldHVybiBufSxwLl9jb250YWluU2xpZGVzPWZ1bmN0aW9uKCl7aWYodGhpcy5vcHRpb25zLmNvbnRhaW4mJiF0aGlzLm9wdGlvbnMud3JhcEFyb3VuZCYmdGhpcy5jZWxscy5sZW5ndGgpe3ZhciB0PXRoaXMub3B0aW9ucy5yaWdodFRvTGVmdCxlPXQ/XCJtYXJnaW5SaWdodFwiOlwibWFyZ2luTGVmdFwiLGk9dD9cIm1hcmdpbkxlZnRcIjpcIm1hcmdpblJpZ2h0XCIsbj10aGlzLnNsaWRlYWJsZVdpZHRoLXRoaXMuZ2V0TGFzdENlbGwoKS5zaXplW2ldLHM9bjx0aGlzLnNpemUuaW5uZXJXaWR0aCxvPXRoaXMuY3Vyc29yUG9zaXRpb24rdGhpcy5jZWxsc1swXS5zaXplW2VdLHI9bi10aGlzLnNpemUuaW5uZXJXaWR0aCooMS10aGlzLmNlbGxBbGlnbik7dGhpcy5zbGlkZXMuZm9yRWFjaChmdW5jdGlvbih0KXtzP3QudGFyZ2V0PW4qdGhpcy5jZWxsQWxpZ246KHQudGFyZ2V0PU1hdGgubWF4KHQudGFyZ2V0LG8pLHQudGFyZ2V0PU1hdGgubWluKHQudGFyZ2V0LHIpKX0sdGhpcyl9fSxwLmRpc3BhdGNoRXZlbnQ9ZnVuY3Rpb24odCxlLGkpe3ZhciBuPWU/W2VdLmNvbmNhdChpKTppO2lmKHRoaXMuZW1pdEV2ZW50KHQsbiksaCYmdGhpcy4kZWxlbWVudCl7dCs9dGhpcy5vcHRpb25zLm5hbWVzcGFjZUpRdWVyeUV2ZW50cz9cIi5mbGlja2l0eVwiOlwiXCI7dmFyIHM9dDtpZihlKXt2YXIgbz1oLkV2ZW50KGUpO28udHlwZT10LHM9b310aGlzLiRlbGVtZW50LnRyaWdnZXIocyxpKX19LHAuc2VsZWN0PWZ1bmN0aW9uKHQsZSxpKXtpZih0aGlzLmlzQWN0aXZlJiYodD1wYXJzZUludCh0LDEwKSx0aGlzLl93cmFwU2VsZWN0KHQpLCh0aGlzLm9wdGlvbnMud3JhcEFyb3VuZHx8ZSkmJih0PW4ubW9kdWxvKHQsdGhpcy5zbGlkZXMubGVuZ3RoKSksdGhpcy5zbGlkZXNbdF0pKXt2YXIgcz10aGlzLnNlbGVjdGVkSW5kZXg7dGhpcy5zZWxlY3RlZEluZGV4PXQsdGhpcy51cGRhdGVTZWxlY3RlZFNsaWRlKCksaT90aGlzLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCgpOnRoaXMuc3RhcnRBbmltYXRpb24oKSx0aGlzLm9wdGlvbnMuYWRhcHRpdmVIZWlnaHQmJnRoaXMuc2V0R2FsbGVyeVNpemUoKSx0aGlzLmRpc3BhdGNoRXZlbnQoXCJzZWxlY3RcIixudWxsLFt0XSksdCE9cyYmdGhpcy5kaXNwYXRjaEV2ZW50KFwiY2hhbmdlXCIsbnVsbCxbdF0pLHRoaXMuZGlzcGF0Y2hFdmVudChcImNlbGxTZWxlY3RcIil9fSxwLl93cmFwU2VsZWN0PWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuc2xpZGVzLmxlbmd0aCxpPXRoaXMub3B0aW9ucy53cmFwQXJvdW5kJiZlPjE7aWYoIWkpcmV0dXJuIHQ7dmFyIHM9bi5tb2R1bG8odCxlKSxvPU1hdGguYWJzKHMtdGhpcy5zZWxlY3RlZEluZGV4KSxyPU1hdGguYWJzKHMrZS10aGlzLnNlbGVjdGVkSW5kZXgpLGE9TWF0aC5hYnMocy1lLXRoaXMuc2VsZWN0ZWRJbmRleCk7IXRoaXMuaXNEcmFnU2VsZWN0JiZyPG8/dCs9ZTohdGhpcy5pc0RyYWdTZWxlY3QmJmE8byYmKHQtPWUpLHQ8MD90aGlzLngtPXRoaXMuc2xpZGVhYmxlV2lkdGg6dD49ZSYmKHRoaXMueCs9dGhpcy5zbGlkZWFibGVXaWR0aCl9LHAucHJldmlvdXM9ZnVuY3Rpb24odCxlKXt0aGlzLnNlbGVjdCh0aGlzLnNlbGVjdGVkSW5kZXgtMSx0LGUpfSxwLm5leHQ9ZnVuY3Rpb24odCxlKXt0aGlzLnNlbGVjdCh0aGlzLnNlbGVjdGVkSW5kZXgrMSx0LGUpfSxwLnVwZGF0ZVNlbGVjdGVkU2xpZGU9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLnNsaWRlc1t0aGlzLnNlbGVjdGVkSW5kZXhdO3QmJih0aGlzLnVuc2VsZWN0U2VsZWN0ZWRTbGlkZSgpLHRoaXMuc2VsZWN0ZWRTbGlkZT10LHQuc2VsZWN0KCksdGhpcy5zZWxlY3RlZENlbGxzPXQuY2VsbHMsdGhpcy5zZWxlY3RlZEVsZW1lbnRzPXQuZ2V0Q2VsbEVsZW1lbnRzKCksdGhpcy5zZWxlY3RlZENlbGw9dC5jZWxsc1swXSx0aGlzLnNlbGVjdGVkRWxlbWVudD10aGlzLnNlbGVjdGVkRWxlbWVudHNbMF0pfSxwLnVuc2VsZWN0U2VsZWN0ZWRTbGlkZT1mdW5jdGlvbigpe3RoaXMuc2VsZWN0ZWRTbGlkZSYmdGhpcy5zZWxlY3RlZFNsaWRlLnVuc2VsZWN0KCl9LHAuc2VsZWN0Q2VsbD1mdW5jdGlvbih0LGUsaSl7dmFyIG49dGhpcy5xdWVyeUNlbGwodCk7aWYobil7dmFyIHM9dGhpcy5nZXRDZWxsU2xpZGVJbmRleChuKTt0aGlzLnNlbGVjdChzLGUsaSl9fSxwLmdldENlbGxTbGlkZUluZGV4PWZ1bmN0aW9uKHQpe2Zvcih2YXIgZT0wO2U8dGhpcy5zbGlkZXMubGVuZ3RoO2UrKyl7dmFyIGk9dGhpcy5zbGlkZXNbZV0sbj1pLmNlbGxzLmluZGV4T2YodCk7aWYobiE9LTEpcmV0dXJuIGV9fSxwLmdldENlbGw9ZnVuY3Rpb24odCl7Zm9yKHZhciBlPTA7ZTx0aGlzLmNlbGxzLmxlbmd0aDtlKyspe3ZhciBpPXRoaXMuY2VsbHNbZV07aWYoaS5lbGVtZW50PT10KXJldHVybiBpfX0scC5nZXRDZWxscz1mdW5jdGlvbih0KXt0PW4ubWFrZUFycmF5KHQpO3ZhciBlPVtdO3JldHVybiB0LmZvckVhY2goZnVuY3Rpb24odCl7dmFyIGk9dGhpcy5nZXRDZWxsKHQpO2kmJmUucHVzaChpKX0sdGhpcyksZX0scC5nZXRDZWxsRWxlbWVudHM9ZnVuY3Rpb24oKXtyZXR1cm4gdGhpcy5jZWxscy5tYXAoZnVuY3Rpb24odCl7cmV0dXJuIHQuZWxlbWVudH0pfSxwLmdldFBhcmVudENlbGw9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5nZXRDZWxsKHQpO3JldHVybiBlP2U6KHQ9bi5nZXRQYXJlbnQodCxcIi5mbGlja2l0eS1zbGlkZXIgPiAqXCIpLHRoaXMuZ2V0Q2VsbCh0KSl9LHAuZ2V0QWRqYWNlbnRDZWxsRWxlbWVudHM9ZnVuY3Rpb24odCxlKXtpZighdClyZXR1cm4gdGhpcy5zZWxlY3RlZFNsaWRlLmdldENlbGxFbGVtZW50cygpO2U9dm9pZCAwPT09ZT90aGlzLnNlbGVjdGVkSW5kZXg6ZTt2YXIgaT10aGlzLnNsaWRlcy5sZW5ndGg7aWYoMSsyKnQ+PWkpcmV0dXJuIHRoaXMuZ2V0Q2VsbEVsZW1lbnRzKCk7Zm9yKHZhciBzPVtdLG89ZS10O288PWUrdDtvKyspe3ZhciByPXRoaXMub3B0aW9ucy53cmFwQXJvdW5kP24ubW9kdWxvKG8saSk6byxhPXRoaXMuc2xpZGVzW3JdO2EmJihzPXMuY29uY2F0KGEuZ2V0Q2VsbEVsZW1lbnRzKCkpKX1yZXR1cm4gc30scC5xdWVyeUNlbGw9ZnVuY3Rpb24odCl7cmV0dXJuXCJudW1iZXJcIj09dHlwZW9mIHQ/dGhpcy5jZWxsc1t0XTooXCJzdHJpbmdcIj09dHlwZW9mIHQmJih0PXRoaXMuZWxlbWVudC5xdWVyeVNlbGVjdG9yKHQpKSx0aGlzLmdldENlbGwodCkpfSxwLnVpQ2hhbmdlPWZ1bmN0aW9uKCl7dGhpcy5lbWl0RXZlbnQoXCJ1aUNoYW5nZVwiKX0scC5jaGlsZFVJUG9pbnRlckRvd249ZnVuY3Rpb24odCl7dGhpcy5lbWl0RXZlbnQoXCJjaGlsZFVJUG9pbnRlckRvd25cIixbdF0pfSxwLm9ucmVzaXplPWZ1bmN0aW9uKCl7dGhpcy53YXRjaENTUygpLHRoaXMucmVzaXplKCl9LG4uZGVib3VuY2VNZXRob2QobCxcIm9ucmVzaXplXCIsMTUwKSxwLnJlc2l6ZT1mdW5jdGlvbigpe2lmKHRoaXMuaXNBY3RpdmUpe3RoaXMuZ2V0U2l6ZSgpLHRoaXMub3B0aW9ucy53cmFwQXJvdW5kJiYodGhpcy54PW4ubW9kdWxvKHRoaXMueCx0aGlzLnNsaWRlYWJsZVdpZHRoKSksdGhpcy5wb3NpdGlvbkNlbGxzKCksdGhpcy5fZ2V0V3JhcFNoaWZ0Q2VsbHMoKSx0aGlzLnNldEdhbGxlcnlTaXplKCksdGhpcy5lbWl0RXZlbnQoXCJyZXNpemVcIik7dmFyIHQ9dGhpcy5zZWxlY3RlZEVsZW1lbnRzJiZ0aGlzLnNlbGVjdGVkRWxlbWVudHNbMF07dGhpcy5zZWxlY3RDZWxsKHQsITEsITApfX0scC53YXRjaENTUz1mdW5jdGlvbigpe3ZhciB0PXRoaXMub3B0aW9ucy53YXRjaENTUztpZih0KXt2YXIgZT1jKHRoaXMuZWxlbWVudCxcIjphZnRlclwiKS5jb250ZW50O2UuaW5kZXhPZihcImZsaWNraXR5XCIpIT0tMT90aGlzLmFjdGl2YXRlKCk6dGhpcy5kZWFjdGl2YXRlKCl9fSxwLm9ua2V5ZG93bj1mdW5jdGlvbih0KXt2YXIgZT1kb2N1bWVudC5hY3RpdmVFbGVtZW50JiZkb2N1bWVudC5hY3RpdmVFbGVtZW50IT10aGlzLmVsZW1lbnQ7aWYodGhpcy5vcHRpb25zLmFjY2Vzc2liaWxpdHkmJiFlKXt2YXIgaT1sLmtleWJvYXJkSGFuZGxlcnNbdC5rZXlDb2RlXTtpJiZpLmNhbGwodGhpcyl9fSxsLmtleWJvYXJkSGFuZGxlcnM9ezM3OmZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0P1wibmV4dFwiOlwicHJldmlvdXNcIjt0aGlzLnVpQ2hhbmdlKCksdGhpc1t0XSgpfSwzOTpmdW5jdGlvbigpe3ZhciB0PXRoaXMub3B0aW9ucy5yaWdodFRvTGVmdD9cInByZXZpb3VzXCI6XCJuZXh0XCI7dGhpcy51aUNoYW5nZSgpLHRoaXNbdF0oKX19LHAuZm9jdXM9ZnVuY3Rpb24oKXt2YXIgZT10LnBhZ2VZT2Zmc2V0O3RoaXMuZWxlbWVudC5mb2N1cyh7cHJldmVudFNjcm9sbDohMH0pLHQucGFnZVlPZmZzZXQhPWUmJnQuc2Nyb2xsVG8odC5wYWdlWE9mZnNldCxlKX0scC5kZWFjdGl2YXRlPWZ1bmN0aW9uKCl7dGhpcy5pc0FjdGl2ZSYmKHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiZmxpY2tpdHktZW5hYmxlZFwiKSx0aGlzLmVsZW1lbnQuY2xhc3NMaXN0LnJlbW92ZShcImZsaWNraXR5LXJ0bFwiKSx0aGlzLnVuc2VsZWN0U2VsZWN0ZWRTbGlkZSgpLHRoaXMuY2VsbHMuZm9yRWFjaChmdW5jdGlvbih0KXt0LmRlc3Ryb3koKX0pLHRoaXMuZWxlbWVudC5yZW1vdmVDaGlsZCh0aGlzLnZpZXdwb3J0KSxhKHRoaXMuc2xpZGVyLmNoaWxkcmVuLHRoaXMuZWxlbWVudCksdGhpcy5vcHRpb25zLmFjY2Vzc2liaWxpdHkmJih0aGlzLmVsZW1lbnQucmVtb3ZlQXR0cmlidXRlKFwidGFiSW5kZXhcIiksdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJrZXlkb3duXCIsdGhpcykpLHRoaXMuaXNBY3RpdmU9ITEsdGhpcy5lbWl0RXZlbnQoXCJkZWFjdGl2YXRlXCIpKX0scC5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5kZWFjdGl2YXRlKCksdC5yZW1vdmVFdmVudExpc3RlbmVyKFwicmVzaXplXCIsdGhpcyksdGhpcy5lbWl0RXZlbnQoXCJkZXN0cm95XCIpLGgmJnRoaXMuJGVsZW1lbnQmJmgucmVtb3ZlRGF0YSh0aGlzLmVsZW1lbnQsXCJmbGlja2l0eVwiKSxkZWxldGUgdGhpcy5lbGVtZW50LmZsaWNraXR5R1VJRCxkZWxldGUgZlt0aGlzLmd1aWRdfSxuLmV4dGVuZChwLHIpLGwuZGF0YT1mdW5jdGlvbih0KXt0PW4uZ2V0UXVlcnlFbGVtZW50KHQpO3ZhciBlPXQmJnQuZmxpY2tpdHlHVUlEO3JldHVybiBlJiZmW2VdfSxuLmh0bWxJbml0KGwsXCJmbGlja2l0eVwiKSxoJiZoLmJyaWRnZXQmJmguYnJpZGdldChcImZsaWNraXR5XCIsbCksbC5zZXRKUXVlcnk9ZnVuY3Rpb24odCl7aD10fSxsLkNlbGw9cyxsfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwidW5pcG9pbnRlci91bmlwb2ludGVyXCIsW1wiZXYtZW1pdHRlci9ldi1lbWl0dGVyXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcImV2LWVtaXR0ZXJcIikpOnQuVW5pcG9pbnRlcj1lKHQsdC5FdkVtaXR0ZXIpfSh3aW5kb3csZnVuY3Rpb24odCxlKXtmdW5jdGlvbiBpKCl7fWZ1bmN0aW9uIG4oKXt9dmFyIHM9bi5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlLnByb3RvdHlwZSk7cy5iaW5kU3RhcnRFdmVudD1mdW5jdGlvbih0KXt0aGlzLl9iaW5kU3RhcnRFdmVudCh0LCEwKX0scy51bmJpbmRTdGFydEV2ZW50PWZ1bmN0aW9uKHQpe3RoaXMuX2JpbmRTdGFydEV2ZW50KHQsITEpfSxzLl9iaW5kU3RhcnRFdmVudD1mdW5jdGlvbihlLGkpe2k9dm9pZCAwPT09aXx8aTt2YXIgbj1pP1wiYWRkRXZlbnRMaXN0ZW5lclwiOlwicmVtb3ZlRXZlbnRMaXN0ZW5lclwiLHM9XCJtb3VzZWRvd25cIjt0LlBvaW50ZXJFdmVudD9zPVwicG9pbnRlcmRvd25cIjpcIm9udG91Y2hzdGFydFwiaW4gdCYmKHM9XCJ0b3VjaHN0YXJ0XCIpLGVbbl0ocyx0aGlzKX0scy5oYW5kbGVFdmVudD1mdW5jdGlvbih0KXt2YXIgZT1cIm9uXCIrdC50eXBlO3RoaXNbZV0mJnRoaXNbZV0odCl9LHMuZ2V0VG91Y2g9ZnVuY3Rpb24odCl7Zm9yKHZhciBlPTA7ZTx0Lmxlbmd0aDtlKyspe3ZhciBpPXRbZV07aWYoaS5pZGVudGlmaWVyPT10aGlzLnBvaW50ZXJJZGVudGlmaWVyKXJldHVybiBpfX0scy5vbm1vdXNlZG93bj1mdW5jdGlvbih0KXt2YXIgZT10LmJ1dHRvbjtlJiYwIT09ZSYmMSE9PWV8fHRoaXMuX3BvaW50ZXJEb3duKHQsdCl9LHMub250b3VjaHN0YXJ0PWZ1bmN0aW9uKHQpe3RoaXMuX3BvaW50ZXJEb3duKHQsdC5jaGFuZ2VkVG91Y2hlc1swXSl9LHMub25wb2ludGVyZG93bj1mdW5jdGlvbih0KXt0aGlzLl9wb2ludGVyRG93bih0LHQpfSxzLl9wb2ludGVyRG93bj1mdW5jdGlvbih0LGUpe3QuYnV0dG9ufHx0aGlzLmlzUG9pbnRlckRvd258fCh0aGlzLmlzUG9pbnRlckRvd249ITAsdGhpcy5wb2ludGVySWRlbnRpZmllcj12b2lkIDAhPT1lLnBvaW50ZXJJZD9lLnBvaW50ZXJJZDplLmlkZW50aWZpZXIsdGhpcy5wb2ludGVyRG93bih0LGUpKX0scy5wb2ludGVyRG93bj1mdW5jdGlvbih0LGUpe3RoaXMuX2JpbmRQb3N0U3RhcnRFdmVudHModCksdGhpcy5lbWl0RXZlbnQoXCJwb2ludGVyRG93blwiLFt0LGVdKX07dmFyIG89e21vdXNlZG93bjpbXCJtb3VzZW1vdmVcIixcIm1vdXNldXBcIl0sdG91Y2hzdGFydDpbXCJ0b3VjaG1vdmVcIixcInRvdWNoZW5kXCIsXCJ0b3VjaGNhbmNlbFwiXSxwb2ludGVyZG93bjpbXCJwb2ludGVybW92ZVwiLFwicG9pbnRlcnVwXCIsXCJwb2ludGVyY2FuY2VsXCJdfTtyZXR1cm4gcy5fYmluZFBvc3RTdGFydEV2ZW50cz1mdW5jdGlvbihlKXtpZihlKXt2YXIgaT1vW2UudHlwZV07aS5mb3JFYWNoKGZ1bmN0aW9uKGUpe3QuYWRkRXZlbnRMaXN0ZW5lcihlLHRoaXMpfSx0aGlzKSx0aGlzLl9ib3VuZFBvaW50ZXJFdmVudHM9aX19LHMuX3VuYmluZFBvc3RTdGFydEV2ZW50cz1mdW5jdGlvbigpe3RoaXMuX2JvdW5kUG9pbnRlckV2ZW50cyYmKHRoaXMuX2JvdW5kUG9pbnRlckV2ZW50cy5mb3JFYWNoKGZ1bmN0aW9uKGUpe3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihlLHRoaXMpfSx0aGlzKSxkZWxldGUgdGhpcy5fYm91bmRQb2ludGVyRXZlbnRzKX0scy5vbm1vdXNlbW92ZT1mdW5jdGlvbih0KXt0aGlzLl9wb2ludGVyTW92ZSh0LHQpfSxzLm9ucG9pbnRlcm1vdmU9ZnVuY3Rpb24odCl7dC5wb2ludGVySWQ9PXRoaXMucG9pbnRlcklkZW50aWZpZXImJnRoaXMuX3BvaW50ZXJNb3ZlKHQsdCl9LHMub250b3VjaG1vdmU9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5nZXRUb3VjaCh0LmNoYW5nZWRUb3VjaGVzKTtlJiZ0aGlzLl9wb2ludGVyTW92ZSh0LGUpfSxzLl9wb2ludGVyTW92ZT1mdW5jdGlvbih0LGUpe3RoaXMucG9pbnRlck1vdmUodCxlKX0scy5wb2ludGVyTW92ZT1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwicG9pbnRlck1vdmVcIixbdCxlXSl9LHMub25tb3VzZXVwPWZ1bmN0aW9uKHQpe3RoaXMuX3BvaW50ZXJVcCh0LHQpfSxzLm9ucG9pbnRlcnVwPWZ1bmN0aW9uKHQpe3QucG9pbnRlcklkPT10aGlzLnBvaW50ZXJJZGVudGlmaWVyJiZ0aGlzLl9wb2ludGVyVXAodCx0KX0scy5vbnRvdWNoZW5kPWZ1bmN0aW9uKHQpe3ZhciBlPXRoaXMuZ2V0VG91Y2godC5jaGFuZ2VkVG91Y2hlcyk7ZSYmdGhpcy5fcG9pbnRlclVwKHQsZSl9LHMuX3BvaW50ZXJVcD1mdW5jdGlvbih0LGUpe3RoaXMuX3BvaW50ZXJEb25lKCksdGhpcy5wb2ludGVyVXAodCxlKX0scy5wb2ludGVyVXA9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcInBvaW50ZXJVcFwiLFt0LGVdKX0scy5fcG9pbnRlckRvbmU9ZnVuY3Rpb24oKXt0aGlzLl9wb2ludGVyUmVzZXQoKSx0aGlzLl91bmJpbmRQb3N0U3RhcnRFdmVudHMoKSx0aGlzLnBvaW50ZXJEb25lKCl9LHMuX3BvaW50ZXJSZXNldD1mdW5jdGlvbigpe3RoaXMuaXNQb2ludGVyRG93bj0hMSxkZWxldGUgdGhpcy5wb2ludGVySWRlbnRpZmllcn0scy5wb2ludGVyRG9uZT1pLHMub25wb2ludGVyY2FuY2VsPWZ1bmN0aW9uKHQpe3QucG9pbnRlcklkPT10aGlzLnBvaW50ZXJJZGVudGlmaWVyJiZ0aGlzLl9wb2ludGVyQ2FuY2VsKHQsdCl9LHMub250b3VjaGNhbmNlbD1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmdldFRvdWNoKHQuY2hhbmdlZFRvdWNoZXMpO2UmJnRoaXMuX3BvaW50ZXJDYW5jZWwodCxlKX0scy5fcG9pbnRlckNhbmNlbD1mdW5jdGlvbih0LGUpe3RoaXMuX3BvaW50ZXJEb25lKCksdGhpcy5wb2ludGVyQ2FuY2VsKHQsZSl9LHMucG9pbnRlckNhbmNlbD1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwicG9pbnRlckNhbmNlbFwiLFt0LGVdKX0sbi5nZXRQb2ludGVyUG9pbnQ9ZnVuY3Rpb24odCl7cmV0dXJue3g6dC5wYWdlWCx5OnQucGFnZVl9fSxufSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwidW5pZHJhZ2dlci91bmlkcmFnZ2VyXCIsW1widW5pcG9pbnRlci91bmlwb2ludGVyXCJdLGZ1bmN0aW9uKGkpe3JldHVybiBlKHQsaSl9KTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHQscmVxdWlyZShcInVuaXBvaW50ZXJcIikpOnQuVW5pZHJhZ2dlcj1lKHQsdC5Vbmlwb2ludGVyKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gaSgpe312YXIgbj1pLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUucHJvdG90eXBlKTtuLmJpbmRIYW5kbGVzPWZ1bmN0aW9uKCl7dGhpcy5fYmluZEhhbmRsZXMoITApfSxuLnVuYmluZEhhbmRsZXM9ZnVuY3Rpb24oKXt0aGlzLl9iaW5kSGFuZGxlcyghMSl9LG4uX2JpbmRIYW5kbGVzPWZ1bmN0aW9uKGUpe2U9dm9pZCAwPT09ZXx8ZTtmb3IodmFyIGk9ZT9cImFkZEV2ZW50TGlzdGVuZXJcIjpcInJlbW92ZUV2ZW50TGlzdGVuZXJcIixuPWU/dGhpcy5fdG91Y2hBY3Rpb25WYWx1ZTpcIlwiLHM9MDtzPHRoaXMuaGFuZGxlcy5sZW5ndGg7cysrKXt2YXIgbz10aGlzLmhhbmRsZXNbc107dGhpcy5fYmluZFN0YXJ0RXZlbnQobyxlKSxvW2ldKFwiY2xpY2tcIix0aGlzKSx0LlBvaW50ZXJFdmVudCYmKG8uc3R5bGUudG91Y2hBY3Rpb249bil9fSxuLl90b3VjaEFjdGlvblZhbHVlPVwibm9uZVwiLG4ucG9pbnRlckRvd249ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLm9rYXlQb2ludGVyRG93bih0KTtpJiYodGhpcy5wb2ludGVyRG93blBvaW50ZXI9ZSx0LnByZXZlbnREZWZhdWx0KCksdGhpcy5wb2ludGVyRG93bkJsdXIoKSx0aGlzLl9iaW5kUG9zdFN0YXJ0RXZlbnRzKHQpLHRoaXMuZW1pdEV2ZW50KFwicG9pbnRlckRvd25cIixbdCxlXSkpfTt2YXIgcz17VEVYVEFSRUE6ITAsSU5QVVQ6ITAsU0VMRUNUOiEwLE9QVElPTjohMH0sbz17cmFkaW86ITAsY2hlY2tib3g6ITAsYnV0dG9uOiEwLHN1Ym1pdDohMCxpbWFnZTohMCxmaWxlOiEwfTtyZXR1cm4gbi5va2F5UG9pbnRlckRvd249ZnVuY3Rpb24odCl7dmFyIGU9c1t0LnRhcmdldC5ub2RlTmFtZV0saT1vW3QudGFyZ2V0LnR5cGVdLG49IWV8fGk7cmV0dXJuIG58fHRoaXMuX3BvaW50ZXJSZXNldCgpLG59LG4ucG9pbnRlckRvd25CbHVyPWZ1bmN0aW9uKCl7dmFyIHQ9ZG9jdW1lbnQuYWN0aXZlRWxlbWVudCxlPXQmJnQuYmx1ciYmdCE9ZG9jdW1lbnQuYm9keTtlJiZ0LmJsdXIoKX0sbi5wb2ludGVyTW92ZT1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX2RyYWdQb2ludGVyTW92ZSh0LGUpO3RoaXMuZW1pdEV2ZW50KFwicG9pbnRlck1vdmVcIixbdCxlLGldKSx0aGlzLl9kcmFnTW92ZSh0LGUsaSl9LG4uX2RyYWdQb2ludGVyTW92ZT1mdW5jdGlvbih0LGUpe3ZhciBpPXt4OmUucGFnZVgtdGhpcy5wb2ludGVyRG93blBvaW50ZXIucGFnZVgseTplLnBhZ2VZLXRoaXMucG9pbnRlckRvd25Qb2ludGVyLnBhZ2VZfTtyZXR1cm4hdGhpcy5pc0RyYWdnaW5nJiZ0aGlzLmhhc0RyYWdTdGFydGVkKGkpJiZ0aGlzLl9kcmFnU3RhcnQodCxlKSxpfSxuLmhhc0RyYWdTdGFydGVkPWZ1bmN0aW9uKHQpe3JldHVybiBNYXRoLmFicyh0LngpPjN8fE1hdGguYWJzKHQueSk+M30sbi5wb2ludGVyVXA9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcInBvaW50ZXJVcFwiLFt0LGVdKSx0aGlzLl9kcmFnUG9pbnRlclVwKHQsZSl9LG4uX2RyYWdQb2ludGVyVXA9ZnVuY3Rpb24odCxlKXt0aGlzLmlzRHJhZ2dpbmc/dGhpcy5fZHJhZ0VuZCh0LGUpOnRoaXMuX3N0YXRpY0NsaWNrKHQsZSl9LG4uX2RyYWdTdGFydD1mdW5jdGlvbih0LGUpe3RoaXMuaXNEcmFnZ2luZz0hMCx0aGlzLmlzUHJldmVudGluZ0NsaWNrcz0hMCx0aGlzLmRyYWdTdGFydCh0LGUpfSxuLmRyYWdTdGFydD1mdW5jdGlvbih0LGUpe3RoaXMuZW1pdEV2ZW50KFwiZHJhZ1N0YXJ0XCIsW3QsZV0pfSxuLl9kcmFnTW92ZT1mdW5jdGlvbih0LGUsaSl7dGhpcy5pc0RyYWdnaW5nJiZ0aGlzLmRyYWdNb3ZlKHQsZSxpKX0sbi5kcmFnTW92ZT1mdW5jdGlvbih0LGUsaSl7dC5wcmV2ZW50RGVmYXVsdCgpLHRoaXMuZW1pdEV2ZW50KFwiZHJhZ01vdmVcIixbdCxlLGldKX0sbi5fZHJhZ0VuZD1mdW5jdGlvbih0LGUpe3RoaXMuaXNEcmFnZ2luZz0hMSxzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7ZGVsZXRlIHRoaXMuaXNQcmV2ZW50aW5nQ2xpY2tzfS5iaW5kKHRoaXMpKSx0aGlzLmRyYWdFbmQodCxlKX0sbi5kcmFnRW5kPWZ1bmN0aW9uKHQsZSl7dGhpcy5lbWl0RXZlbnQoXCJkcmFnRW5kXCIsW3QsZV0pfSxuLm9uY2xpY2s9ZnVuY3Rpb24odCl7dGhpcy5pc1ByZXZlbnRpbmdDbGlja3MmJnQucHJldmVudERlZmF1bHQoKX0sbi5fc3RhdGljQ2xpY2s9ZnVuY3Rpb24odCxlKXt0aGlzLmlzSWdub3JpbmdNb3VzZVVwJiZcIm1vdXNldXBcIj09dC50eXBlfHwodGhpcy5zdGF0aWNDbGljayh0LGUpLFwibW91c2V1cFwiIT10LnR5cGUmJih0aGlzLmlzSWdub3JpbmdNb3VzZVVwPSEwLHNldFRpbWVvdXQoZnVuY3Rpb24oKXtkZWxldGUgdGhpcy5pc0lnbm9yaW5nTW91c2VVcH0uYmluZCh0aGlzKSw0MDApKSl9LG4uc3RhdGljQ2xpY2s9ZnVuY3Rpb24odCxlKXt0aGlzLmVtaXRFdmVudChcInN0YXRpY0NsaWNrXCIsW3QsZV0pfSxpLmdldFBvaW50ZXJQb2ludD1lLmdldFBvaW50ZXJQb2ludCxpfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvZHJhZ1wiLFtcIi4vZmxpY2tpdHlcIixcInVuaWRyYWdnZXIvdW5pZHJhZ2dlclwiLFwiZml6enktdWktdXRpbHMvdXRpbHNcIl0sZnVuY3Rpb24oaSxuLHMpe3JldHVybiBlKHQsaSxuLHMpfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCIuL2ZsaWNraXR5XCIpLHJlcXVpcmUoXCJ1bmlkcmFnZ2VyXCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6dC5GbGlja2l0eT1lKHQsdC5GbGlja2l0eSx0LlVuaWRyYWdnZXIsdC5maXp6eVVJVXRpbHMpfSh3aW5kb3csZnVuY3Rpb24odCxlLGksbil7ZnVuY3Rpb24gcygpe3JldHVybnt4OnQucGFnZVhPZmZzZXQseTp0LnBhZ2VZT2Zmc2V0fX1uLmV4dGVuZChlLmRlZmF1bHRzLHtkcmFnZ2FibGU6XCI+MVwiLGRyYWdUaHJlc2hvbGQ6M30pLGUuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZURyYWdcIik7dmFyIG89ZS5wcm90b3R5cGU7bi5leHRlbmQobyxpLnByb3RvdHlwZSksby5fdG91Y2hBY3Rpb25WYWx1ZT1cInBhbi15XCI7dmFyIHI9XCJjcmVhdGVUb3VjaFwiaW4gZG9jdW1lbnQsYT0hMTtvLl9jcmVhdGVEcmFnPWZ1bmN0aW9uKCl7dGhpcy5vbihcImFjdGl2YXRlXCIsdGhpcy5vbkFjdGl2YXRlRHJhZyksdGhpcy5vbihcInVpQ2hhbmdlXCIsdGhpcy5fdWlDaGFuZ2VEcmFnKSx0aGlzLm9uKFwiY2hpbGRVSVBvaW50ZXJEb3duXCIsdGhpcy5fY2hpbGRVSVBvaW50ZXJEb3duRHJhZyksdGhpcy5vbihcImRlYWN0aXZhdGVcIix0aGlzLm9uRGVhY3RpdmF0ZURyYWcpLHRoaXMub24oXCJjZWxsQ2hhbmdlXCIsdGhpcy51cGRhdGVEcmFnZ2FibGUpLHImJiFhJiYodC5hZGRFdmVudExpc3RlbmVyKFwidG91Y2htb3ZlXCIsZnVuY3Rpb24oKXt9KSxhPSEwKX0sby5vbkFjdGl2YXRlRHJhZz1mdW5jdGlvbigpe3RoaXMuaGFuZGxlcz1bdGhpcy52aWV3cG9ydF0sdGhpcy5iaW5kSGFuZGxlcygpLHRoaXMudXBkYXRlRHJhZ2dhYmxlKCl9LG8ub25EZWFjdGl2YXRlRHJhZz1mdW5jdGlvbigpe3RoaXMudW5iaW5kSGFuZGxlcygpLHRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtZHJhZ2dhYmxlXCIpfSxvLnVwZGF0ZURyYWdnYWJsZT1mdW5jdGlvbigpe1wiPjFcIj09dGhpcy5vcHRpb25zLmRyYWdnYWJsZT90aGlzLmlzRHJhZ2dhYmxlPXRoaXMuc2xpZGVzLmxlbmd0aD4xOnRoaXMuaXNEcmFnZ2FibGU9dGhpcy5vcHRpb25zLmRyYWdnYWJsZSx0aGlzLmlzRHJhZ2dhYmxlP3RoaXMuZWxlbWVudC5jbGFzc0xpc3QuYWRkKFwiaXMtZHJhZ2dhYmxlXCIpOnRoaXMuZWxlbWVudC5jbGFzc0xpc3QucmVtb3ZlKFwiaXMtZHJhZ2dhYmxlXCIpfSxvLmJpbmREcmFnPWZ1bmN0aW9uKCl7dGhpcy5vcHRpb25zLmRyYWdnYWJsZT0hMCx0aGlzLnVwZGF0ZURyYWdnYWJsZSgpfSxvLnVuYmluZERyYWc9ZnVuY3Rpb24oKXt0aGlzLm9wdGlvbnMuZHJhZ2dhYmxlPSExLHRoaXMudXBkYXRlRHJhZ2dhYmxlKCl9LG8uX3VpQ2hhbmdlRHJhZz1mdW5jdGlvbigpe2RlbGV0ZSB0aGlzLmlzRnJlZVNjcm9sbGluZ30sby5fY2hpbGRVSVBvaW50ZXJEb3duRHJhZz1mdW5jdGlvbih0KXt0LnByZXZlbnREZWZhdWx0KCksdGhpcy5wb2ludGVyRG93bkZvY3VzKHQpfSxvLnBvaW50ZXJEb3duPWZ1bmN0aW9uKGUsaSl7aWYoIXRoaXMuaXNEcmFnZ2FibGUpcmV0dXJuIHZvaWQgdGhpcy5fcG9pbnRlckRvd25EZWZhdWx0KGUsaSk7dmFyIG49dGhpcy5va2F5UG9pbnRlckRvd24oZSk7biYmKHRoaXMuX3BvaW50ZXJEb3duUHJldmVudERlZmF1bHQoZSksdGhpcy5wb2ludGVyRG93bkZvY3VzKGUpLGRvY3VtZW50LmFjdGl2ZUVsZW1lbnQhPXRoaXMuZWxlbWVudCYmdGhpcy5wb2ludGVyRG93bkJsdXIoKSx0aGlzLmRyYWdYPXRoaXMueCx0aGlzLnZpZXdwb3J0LmNsYXNzTGlzdC5hZGQoXCJpcy1wb2ludGVyLWRvd25cIiksdGhpcy5wb2ludGVyRG93blNjcm9sbD1zKCksdC5hZGRFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsdGhpcyksdGhpcy5fcG9pbnRlckRvd25EZWZhdWx0KGUsaSkpfSxvLl9wb2ludGVyRG93bkRlZmF1bHQ9ZnVuY3Rpb24odCxlKXt0aGlzLnBvaW50ZXJEb3duUG9pbnRlcj1lLHRoaXMuX2JpbmRQb3N0U3RhcnRFdmVudHModCksdGhpcy5kaXNwYXRjaEV2ZW50KFwicG9pbnRlckRvd25cIix0LFtlXSl9O3ZhciBsPXtJTlBVVDohMCxURVhUQVJFQTohMCxTRUxFQ1Q6ITB9O3JldHVybiBvLnBvaW50ZXJEb3duRm9jdXM9ZnVuY3Rpb24odCl7dmFyIGU9bFt0LnRhcmdldC5ub2RlTmFtZV07ZXx8dGhpcy5mb2N1cygpfSxvLl9wb2ludGVyRG93blByZXZlbnREZWZhdWx0PWZ1bmN0aW9uKHQpe3ZhciBlPVwidG91Y2hzdGFydFwiPT10LnR5cGUsaT1cInRvdWNoXCI9PXQucG9pbnRlclR5cGUsbj1sW3QudGFyZ2V0Lm5vZGVOYW1lXTtlfHxpfHxufHx0LnByZXZlbnREZWZhdWx0KCl9LG8uaGFzRHJhZ1N0YXJ0ZWQ9ZnVuY3Rpb24odCl7cmV0dXJuIE1hdGguYWJzKHQueCk+dGhpcy5vcHRpb25zLmRyYWdUaHJlc2hvbGR9LG8ucG9pbnRlclVwPWZ1bmN0aW9uKHQsZSl7ZGVsZXRlIHRoaXMuaXNUb3VjaFNjcm9sbGluZyx0aGlzLnZpZXdwb3J0LmNsYXNzTGlzdC5yZW1vdmUoXCJpcy1wb2ludGVyLWRvd25cIiksdGhpcy5kaXNwYXRjaEV2ZW50KFwicG9pbnRlclVwXCIsdCxbZV0pLHRoaXMuX2RyYWdQb2ludGVyVXAodCxlKX0sby5wb2ludGVyRG9uZT1mdW5jdGlvbigpe3QucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInNjcm9sbFwiLHRoaXMpLGRlbGV0ZSB0aGlzLnBvaW50ZXJEb3duU2Nyb2xsfSxvLmRyYWdTdGFydD1mdW5jdGlvbihlLGkpe3RoaXMuaXNEcmFnZ2FibGUmJih0aGlzLmRyYWdTdGFydFBvc2l0aW9uPXRoaXMueCx0aGlzLnN0YXJ0QW5pbWF0aW9uKCksdC5yZW1vdmVFdmVudExpc3RlbmVyKFwic2Nyb2xsXCIsdGhpcyksdGhpcy5kaXNwYXRjaEV2ZW50KFwiZHJhZ1N0YXJ0XCIsZSxbaV0pKX0sby5wb2ludGVyTW92ZT1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuX2RyYWdQb2ludGVyTW92ZSh0LGUpO3RoaXMuZGlzcGF0Y2hFdmVudChcInBvaW50ZXJNb3ZlXCIsdCxbZSxpXSksdGhpcy5fZHJhZ01vdmUodCxlLGkpfSxvLmRyYWdNb3ZlPWZ1bmN0aW9uKHQsZSxpKXtpZih0aGlzLmlzRHJhZ2dhYmxlKXt0LnByZXZlbnREZWZhdWx0KCksdGhpcy5wcmV2aW91c0RyYWdYPXRoaXMuZHJhZ1g7dmFyIG49dGhpcy5vcHRpb25zLnJpZ2h0VG9MZWZ0Py0xOjE7dGhpcy5vcHRpb25zLndyYXBBcm91bmQmJihpLng9aS54JXRoaXMuc2xpZGVhYmxlV2lkdGgpO3ZhciBzPXRoaXMuZHJhZ1N0YXJ0UG9zaXRpb24raS54Km47aWYoIXRoaXMub3B0aW9ucy53cmFwQXJvdW5kJiZ0aGlzLnNsaWRlcy5sZW5ndGgpe3ZhciBvPU1hdGgubWF4KC10aGlzLnNsaWRlc1swXS50YXJnZXQsdGhpcy5kcmFnU3RhcnRQb3NpdGlvbik7cz1zPm8/LjUqKHMrbyk6czt2YXIgcj1NYXRoLm1pbigtdGhpcy5nZXRMYXN0U2xpZGUoKS50YXJnZXQsdGhpcy5kcmFnU3RhcnRQb3NpdGlvbik7cz1zPHI/LjUqKHMrcik6c310aGlzLmRyYWdYPXMsdGhpcy5kcmFnTW92ZVRpbWU9bmV3IERhdGUsXG50aGlzLmRpc3BhdGNoRXZlbnQoXCJkcmFnTW92ZVwiLHQsW2UsaV0pfX0sby5kcmFnRW5kPWZ1bmN0aW9uKHQsZSl7aWYodGhpcy5pc0RyYWdnYWJsZSl7dGhpcy5vcHRpb25zLmZyZWVTY3JvbGwmJih0aGlzLmlzRnJlZVNjcm9sbGluZz0hMCk7dmFyIGk9dGhpcy5kcmFnRW5kUmVzdGluZ1NlbGVjdCgpO2lmKHRoaXMub3B0aW9ucy5mcmVlU2Nyb2xsJiYhdGhpcy5vcHRpb25zLndyYXBBcm91bmQpe3ZhciBuPXRoaXMuZ2V0UmVzdGluZ1Bvc2l0aW9uKCk7dGhpcy5pc0ZyZWVTY3JvbGxpbmc9LW4+dGhpcy5zbGlkZXNbMF0udGFyZ2V0JiYtbjx0aGlzLmdldExhc3RTbGlkZSgpLnRhcmdldH1lbHNlIHRoaXMub3B0aW9ucy5mcmVlU2Nyb2xsfHxpIT10aGlzLnNlbGVjdGVkSW5kZXh8fChpKz10aGlzLmRyYWdFbmRCb29zdFNlbGVjdCgpKTtkZWxldGUgdGhpcy5wcmV2aW91c0RyYWdYLHRoaXMuaXNEcmFnU2VsZWN0PXRoaXMub3B0aW9ucy53cmFwQXJvdW5kLHRoaXMuc2VsZWN0KGkpLGRlbGV0ZSB0aGlzLmlzRHJhZ1NlbGVjdCx0aGlzLmRpc3BhdGNoRXZlbnQoXCJkcmFnRW5kXCIsdCxbZV0pfX0sby5kcmFnRW5kUmVzdGluZ1NlbGVjdD1mdW5jdGlvbigpe3ZhciB0PXRoaXMuZ2V0UmVzdGluZ1Bvc2l0aW9uKCksZT1NYXRoLmFicyh0aGlzLmdldFNsaWRlRGlzdGFuY2UoLXQsdGhpcy5zZWxlY3RlZEluZGV4KSksaT10aGlzLl9nZXRDbG9zZXN0UmVzdGluZyh0LGUsMSksbj10aGlzLl9nZXRDbG9zZXN0UmVzdGluZyh0LGUsLTEpLHM9aS5kaXN0YW5jZTxuLmRpc3RhbmNlP2kuaW5kZXg6bi5pbmRleDtyZXR1cm4gc30sby5fZ2V0Q2xvc2VzdFJlc3Rpbmc9ZnVuY3Rpb24odCxlLGkpe2Zvcih2YXIgbj10aGlzLnNlbGVjdGVkSW5kZXgscz0xLzAsbz10aGlzLm9wdGlvbnMuY29udGFpbiYmIXRoaXMub3B0aW9ucy53cmFwQXJvdW5kP2Z1bmN0aW9uKHQsZSl7cmV0dXJuIHQ8PWV9OmZ1bmN0aW9uKHQsZSl7cmV0dXJuIHQ8ZX07byhlLHMpJiYobis9aSxzPWUsZT10aGlzLmdldFNsaWRlRGlzdGFuY2UoLXQsbiksbnVsbCE9PWUpOyllPU1hdGguYWJzKGUpO3JldHVybntkaXN0YW5jZTpzLGluZGV4Om4taX19LG8uZ2V0U2xpZGVEaXN0YW5jZT1mdW5jdGlvbih0LGUpe3ZhciBpPXRoaXMuc2xpZGVzLmxlbmd0aCxzPXRoaXMub3B0aW9ucy53cmFwQXJvdW5kJiZpPjEsbz1zP24ubW9kdWxvKGUsaSk6ZSxyPXRoaXMuc2xpZGVzW29dO2lmKCFyKXJldHVybiBudWxsO3ZhciBhPXM/dGhpcy5zbGlkZWFibGVXaWR0aCpNYXRoLmZsb29yKGUvaSk6MDtyZXR1cm4gdC0oci50YXJnZXQrYSl9LG8uZHJhZ0VuZEJvb3N0U2VsZWN0PWZ1bmN0aW9uKCl7aWYodm9pZCAwPT09dGhpcy5wcmV2aW91c0RyYWdYfHwhdGhpcy5kcmFnTW92ZVRpbWV8fG5ldyBEYXRlLXRoaXMuZHJhZ01vdmVUaW1lPjEwMClyZXR1cm4gMDt2YXIgdD10aGlzLmdldFNsaWRlRGlzdGFuY2UoLXRoaXMuZHJhZ1gsdGhpcy5zZWxlY3RlZEluZGV4KSxlPXRoaXMucHJldmlvdXNEcmFnWC10aGlzLmRyYWdYO3JldHVybiB0PjAmJmU+MD8xOnQ8MCYmZTwwPy0xOjB9LG8uc3RhdGljQ2xpY2s9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLmdldFBhcmVudENlbGwodC50YXJnZXQpLG49aSYmaS5lbGVtZW50LHM9aSYmdGhpcy5jZWxscy5pbmRleE9mKGkpO3RoaXMuZGlzcGF0Y2hFdmVudChcInN0YXRpY0NsaWNrXCIsdCxbZSxuLHNdKX0sby5vbnNjcm9sbD1mdW5jdGlvbigpe3ZhciB0PXMoKSxlPXRoaXMucG9pbnRlckRvd25TY3JvbGwueC10LngsaT10aGlzLnBvaW50ZXJEb3duU2Nyb2xsLnktdC55OyhNYXRoLmFicyhlKT4zfHxNYXRoLmFicyhpKT4zKSYmdGhpcy5fcG9pbnRlckRvbmUoKX0sZX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcInRhcC1saXN0ZW5lci90YXAtbGlzdGVuZXJcIixbXCJ1bmlwb2ludGVyL3VuaXBvaW50ZXJcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwidW5pcG9pbnRlclwiKSk6dC5UYXBMaXN0ZW5lcj1lKHQsdC5Vbmlwb2ludGVyKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gaSh0KXt0aGlzLmJpbmRUYXAodCl9dmFyIG49aS5wcm90b3R5cGU9T2JqZWN0LmNyZWF0ZShlLnByb3RvdHlwZSk7cmV0dXJuIG4uYmluZFRhcD1mdW5jdGlvbih0KXt0JiYodGhpcy51bmJpbmRUYXAoKSx0aGlzLnRhcEVsZW1lbnQ9dCx0aGlzLl9iaW5kU3RhcnRFdmVudCh0LCEwKSl9LG4udW5iaW5kVGFwPWZ1bmN0aW9uKCl7dGhpcy50YXBFbGVtZW50JiYodGhpcy5fYmluZFN0YXJ0RXZlbnQodGhpcy50YXBFbGVtZW50LCEwKSxkZWxldGUgdGhpcy50YXBFbGVtZW50KX0sbi5wb2ludGVyVXA9ZnVuY3Rpb24oaSxuKXtpZighdGhpcy5pc0lnbm9yaW5nTW91c2VVcHx8XCJtb3VzZXVwXCIhPWkudHlwZSl7dmFyIHM9ZS5nZXRQb2ludGVyUG9pbnQobiksbz10aGlzLnRhcEVsZW1lbnQuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCkscj10LnBhZ2VYT2Zmc2V0LGE9dC5wYWdlWU9mZnNldCxsPXMueD49by5sZWZ0K3ImJnMueDw9by5yaWdodCtyJiZzLnk+PW8udG9wK2EmJnMueTw9by5ib3R0b20rYTtpZihsJiZ0aGlzLmVtaXRFdmVudChcInRhcFwiLFtpLG5dKSxcIm1vdXNldXBcIiE9aS50eXBlKXt0aGlzLmlzSWdub3JpbmdNb3VzZVVwPSEwO3ZhciBoPXRoaXM7c2V0VGltZW91dChmdW5jdGlvbigpe2RlbGV0ZSBoLmlzSWdub3JpbmdNb3VzZVVwfSw0MDApfX19LG4uZGVzdHJveT1mdW5jdGlvbigpe3RoaXMucG9pbnRlckRvbmUoKSx0aGlzLnVuYmluZFRhcCgpfSxpfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvcHJldi1uZXh0LWJ1dHRvblwiLFtcIi4vZmxpY2tpdHlcIixcInRhcC1saXN0ZW5lci90YXAtbGlzdGVuZXJcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGZ1bmN0aW9uKGksbixzKXtyZXR1cm4gZSh0LGksbixzKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSxyZXF1aXJlKFwidGFwLWxpc3RlbmVyXCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6ZSh0LHQuRmxpY2tpdHksdC5UYXBMaXN0ZW5lcix0LmZpenp5VUlVdGlscyl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSxuKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBzKHQsZSl7dGhpcy5kaXJlY3Rpb249dCx0aGlzLnBhcmVudD1lLHRoaXMuX2NyZWF0ZSgpfWZ1bmN0aW9uIG8odCl7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIHQ/dDpcIk0gXCIrdC54MCtcIiw1MCBMIFwiK3QueDErXCIsXCIrKHQueTErNTApK1wiIEwgXCIrdC54MitcIixcIisodC55Mis1MCkrXCIgTCBcIit0LngzK1wiLDUwICBMIFwiK3QueDIrXCIsXCIrKDUwLXQueTIpK1wiIEwgXCIrdC54MStcIixcIisoNTAtdC55MSkrXCIgWlwifXZhciByPVwiaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmdcIjtzLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGkucHJvdG90eXBlKSxzLnByb3RvdHlwZS5fY3JlYXRlPWZ1bmN0aW9uKCl7dGhpcy5pc0VuYWJsZWQ9ITAsdGhpcy5pc1ByZXZpb3VzPXRoaXMuZGlyZWN0aW9uPT0tMTt2YXIgdD10aGlzLnBhcmVudC5vcHRpb25zLnJpZ2h0VG9MZWZ0PzE6LTE7dGhpcy5pc0xlZnQ9dGhpcy5kaXJlY3Rpb249PXQ7dmFyIGU9dGhpcy5lbGVtZW50PWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJidXR0b25cIik7ZS5jbGFzc05hbWU9XCJmbGlja2l0eS1idXR0b24gZmxpY2tpdHktcHJldi1uZXh0LWJ1dHRvblwiLGUuY2xhc3NOYW1lKz10aGlzLmlzUHJldmlvdXM/XCIgcHJldmlvdXNcIjpcIiBuZXh0XCIsZS5zZXRBdHRyaWJ1dGUoXCJ0eXBlXCIsXCJidXR0b25cIiksdGhpcy5kaXNhYmxlKCksZS5zZXRBdHRyaWJ1dGUoXCJhcmlhLWxhYmVsXCIsdGhpcy5pc1ByZXZpb3VzP1wiUHJldmlvdXNcIjpcIk5leHRcIik7dmFyIGk9dGhpcy5jcmVhdGVTVkcoKTtlLmFwcGVuZENoaWxkKGkpLHRoaXMub24oXCJ0YXBcIix0aGlzLm9uVGFwKSx0aGlzLnBhcmVudC5vbihcInNlbGVjdFwiLHRoaXMudXBkYXRlLmJpbmQodGhpcykpLHRoaXMub24oXCJwb2ludGVyRG93blwiLHRoaXMucGFyZW50LmNoaWxkVUlQb2ludGVyRG93bi5iaW5kKHRoaXMucGFyZW50KSl9LHMucHJvdG90eXBlLmFjdGl2YXRlPWZ1bmN0aW9uKCl7dGhpcy5iaW5kVGFwKHRoaXMuZWxlbWVudCksdGhpcy5lbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLHRoaXMpLHRoaXMucGFyZW50LmVsZW1lbnQuYXBwZW5kQ2hpbGQodGhpcy5lbGVtZW50KX0scy5wcm90b3R5cGUuZGVhY3RpdmF0ZT1mdW5jdGlvbigpe3RoaXMucGFyZW50LmVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5lbGVtZW50KSxpLnByb3RvdHlwZS5kZXN0cm95LmNhbGwodGhpcyksdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJjbGlja1wiLHRoaXMpfSxzLnByb3RvdHlwZS5jcmVhdGVTVkc9ZnVuY3Rpb24oKXt2YXIgdD1kb2N1bWVudC5jcmVhdGVFbGVtZW50TlMocixcInN2Z1wiKTt0LnNldEF0dHJpYnV0ZShcImNsYXNzXCIsXCJmbGlja2l0eS1idXR0b24taWNvblwiKSx0LnNldEF0dHJpYnV0ZShcInZpZXdCb3hcIixcIjAgMCAxMDAgMTAwXCIpO3ZhciBlPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnROUyhyLFwicGF0aFwiKSxpPW8odGhpcy5wYXJlbnQub3B0aW9ucy5hcnJvd1NoYXBlKTtyZXR1cm4gZS5zZXRBdHRyaWJ1dGUoXCJkXCIsaSksZS5zZXRBdHRyaWJ1dGUoXCJjbGFzc1wiLFwiYXJyb3dcIiksdGhpcy5pc0xlZnR8fGUuc2V0QXR0cmlidXRlKFwidHJhbnNmb3JtXCIsXCJ0cmFuc2xhdGUoMTAwLCAxMDApIHJvdGF0ZSgxODApIFwiKSx0LmFwcGVuZENoaWxkKGUpLHR9LHMucHJvdG90eXBlLm9uVGFwPWZ1bmN0aW9uKCl7aWYodGhpcy5pc0VuYWJsZWQpe3RoaXMucGFyZW50LnVpQ2hhbmdlKCk7dmFyIHQ9dGhpcy5pc1ByZXZpb3VzP1wicHJldmlvdXNcIjpcIm5leHRcIjt0aGlzLnBhcmVudFt0XSgpfX0scy5wcm90b3R5cGUuaGFuZGxlRXZlbnQ9bi5oYW5kbGVFdmVudCxzLnByb3RvdHlwZS5vbmNsaWNrPWZ1bmN0aW9uKHQpe3ZhciBlPWRvY3VtZW50LmFjdGl2ZUVsZW1lbnQ7ZSYmZT09dGhpcy5lbGVtZW50JiZ0aGlzLm9uVGFwKHQsdCl9LHMucHJvdG90eXBlLmVuYWJsZT1mdW5jdGlvbigpe3RoaXMuaXNFbmFibGVkfHwodGhpcy5lbGVtZW50LmRpc2FibGVkPSExLHRoaXMuaXNFbmFibGVkPSEwKX0scy5wcm90b3R5cGUuZGlzYWJsZT1mdW5jdGlvbigpe3RoaXMuaXNFbmFibGVkJiYodGhpcy5lbGVtZW50LmRpc2FibGVkPSEwLHRoaXMuaXNFbmFibGVkPSExKX0scy5wcm90b3R5cGUudXBkYXRlPWZ1bmN0aW9uKCl7dmFyIHQ9dGhpcy5wYXJlbnQuc2xpZGVzO2lmKHRoaXMucGFyZW50Lm9wdGlvbnMud3JhcEFyb3VuZCYmdC5sZW5ndGg+MSlyZXR1cm4gdm9pZCB0aGlzLmVuYWJsZSgpO3ZhciBlPXQubGVuZ3RoP3QubGVuZ3RoLTE6MCxpPXRoaXMuaXNQcmV2aW91cz8wOmUsbj10aGlzLnBhcmVudC5zZWxlY3RlZEluZGV4PT1pP1wiZGlzYWJsZVwiOlwiZW5hYmxlXCI7dGhpc1tuXSgpfSxzLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5kZWFjdGl2YXRlKCl9LG4uZXh0ZW5kKGUuZGVmYXVsdHMse3ByZXZOZXh0QnV0dG9uczohMCxhcnJvd1NoYXBlOnt4MDoxMCx4MTo2MCx5MTo1MCx4Mjo3MCx5Mjo0MCx4MzozMH19KSxlLmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVQcmV2TmV4dEJ1dHRvbnNcIik7dmFyIGE9ZS5wcm90b3R5cGU7cmV0dXJuIGEuX2NyZWF0ZVByZXZOZXh0QnV0dG9ucz1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5wcmV2TmV4dEJ1dHRvbnMmJih0aGlzLnByZXZCdXR0b249bmV3IHMoKC0xKSx0aGlzKSx0aGlzLm5leHRCdXR0b249bmV3IHMoMSx0aGlzKSx0aGlzLm9uKFwiYWN0aXZhdGVcIix0aGlzLmFjdGl2YXRlUHJldk5leHRCdXR0b25zKSl9LGEuYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnM9ZnVuY3Rpb24oKXt0aGlzLnByZXZCdXR0b24uYWN0aXZhdGUoKSx0aGlzLm5leHRCdXR0b24uYWN0aXZhdGUoKSx0aGlzLm9uKFwiZGVhY3RpdmF0ZVwiLHRoaXMuZGVhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucyl9LGEuZGVhY3RpdmF0ZVByZXZOZXh0QnV0dG9ucz1mdW5jdGlvbigpe3RoaXMucHJldkJ1dHRvbi5kZWFjdGl2YXRlKCksdGhpcy5uZXh0QnV0dG9uLmRlYWN0aXZhdGUoKSx0aGlzLm9mZihcImRlYWN0aXZhdGVcIix0aGlzLmRlYWN0aXZhdGVQcmV2TmV4dEJ1dHRvbnMpfSxlLlByZXZOZXh0QnV0dG9uPXMsZX0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5L2pzL3BhZ2UtZG90c1wiLFtcIi4vZmxpY2tpdHlcIixcInRhcC1saXN0ZW5lci90YXAtbGlzdGVuZXJcIixcImZpenp5LXVpLXV0aWxzL3V0aWxzXCJdLGZ1bmN0aW9uKGksbixzKXtyZXR1cm4gZSh0LGksbixzKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSxyZXF1aXJlKFwidGFwLWxpc3RlbmVyXCIpLHJlcXVpcmUoXCJmaXp6eS11aS11dGlsc1wiKSk6ZSh0LHQuRmxpY2tpdHksdC5UYXBMaXN0ZW5lcix0LmZpenp5VUlVdGlscyl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSxuKXtmdW5jdGlvbiBzKHQpe3RoaXMucGFyZW50PXQsdGhpcy5fY3JlYXRlKCl9cy5wcm90b3R5cGU9bmV3IGkscy5wcm90b3R5cGUuX2NyZWF0ZT1mdW5jdGlvbigpe3RoaXMuaG9sZGVyPWRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJvbFwiKSx0aGlzLmhvbGRlci5jbGFzc05hbWU9XCJmbGlja2l0eS1wYWdlLWRvdHNcIix0aGlzLmRvdHM9W10sdGhpcy5vbihcInRhcFwiLHRoaXMub25UYXApLHRoaXMub24oXCJwb2ludGVyRG93blwiLHRoaXMucGFyZW50LmNoaWxkVUlQb2ludGVyRG93bi5iaW5kKHRoaXMucGFyZW50KSl9LHMucHJvdG90eXBlLmFjdGl2YXRlPWZ1bmN0aW9uKCl7dGhpcy5zZXREb3RzKCksdGhpcy5iaW5kVGFwKHRoaXMuaG9sZGVyKSx0aGlzLnBhcmVudC5lbGVtZW50LmFwcGVuZENoaWxkKHRoaXMuaG9sZGVyKX0scy5wcm90b3R5cGUuZGVhY3RpdmF0ZT1mdW5jdGlvbigpe3RoaXMucGFyZW50LmVsZW1lbnQucmVtb3ZlQ2hpbGQodGhpcy5ob2xkZXIpLGkucHJvdG90eXBlLmRlc3Ryb3kuY2FsbCh0aGlzKX0scy5wcm90b3R5cGUuc2V0RG90cz1mdW5jdGlvbigpe3ZhciB0PXRoaXMucGFyZW50LnNsaWRlcy5sZW5ndGgtdGhpcy5kb3RzLmxlbmd0aDt0PjA/dGhpcy5hZGREb3RzKHQpOnQ8MCYmdGhpcy5yZW1vdmVEb3RzKC10KX0scy5wcm90b3R5cGUuYWRkRG90cz1mdW5jdGlvbih0KXtmb3IodmFyIGU9ZG9jdW1lbnQuY3JlYXRlRG9jdW1lbnRGcmFnbWVudCgpLGk9W10sbj10aGlzLmRvdHMubGVuZ3RoLHM9bit0LG89bjtvPHM7bysrKXt2YXIgcj1kb2N1bWVudC5jcmVhdGVFbGVtZW50KFwibGlcIik7ci5jbGFzc05hbWU9XCJkb3RcIixyLnNldEF0dHJpYnV0ZShcImFyaWEtbGFiZWxcIixcIlBhZ2UgZG90IFwiKyhvKzEpKSxlLmFwcGVuZENoaWxkKHIpLGkucHVzaChyKX10aGlzLmhvbGRlci5hcHBlbmRDaGlsZChlKSx0aGlzLmRvdHM9dGhpcy5kb3RzLmNvbmNhdChpKX0scy5wcm90b3R5cGUucmVtb3ZlRG90cz1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmRvdHMuc3BsaWNlKHRoaXMuZG90cy5sZW5ndGgtdCx0KTtlLmZvckVhY2goZnVuY3Rpb24odCl7dGhpcy5ob2xkZXIucmVtb3ZlQ2hpbGQodCl9LHRoaXMpfSxzLnByb3RvdHlwZS51cGRhdGVTZWxlY3RlZD1mdW5jdGlvbigpe3RoaXMuc2VsZWN0ZWREb3QmJih0aGlzLnNlbGVjdGVkRG90LmNsYXNzTmFtZT1cImRvdFwiLHRoaXMuc2VsZWN0ZWREb3QucmVtb3ZlQXR0cmlidXRlKFwiYXJpYS1jdXJyZW50XCIpKSx0aGlzLmRvdHMubGVuZ3RoJiYodGhpcy5zZWxlY3RlZERvdD10aGlzLmRvdHNbdGhpcy5wYXJlbnQuc2VsZWN0ZWRJbmRleF0sdGhpcy5zZWxlY3RlZERvdC5jbGFzc05hbWU9XCJkb3QgaXMtc2VsZWN0ZWRcIix0aGlzLnNlbGVjdGVkRG90LnNldEF0dHJpYnV0ZShcImFyaWEtY3VycmVudFwiLFwic3RlcFwiKSl9LHMucHJvdG90eXBlLm9uVGFwPWZ1bmN0aW9uKHQpe3ZhciBlPXQudGFyZ2V0O2lmKFwiTElcIj09ZS5ub2RlTmFtZSl7dGhpcy5wYXJlbnQudWlDaGFuZ2UoKTt2YXIgaT10aGlzLmRvdHMuaW5kZXhPZihlKTt0aGlzLnBhcmVudC5zZWxlY3QoaSl9fSxzLnByb3RvdHlwZS5kZXN0cm95PWZ1bmN0aW9uKCl7dGhpcy5kZWFjdGl2YXRlKCl9LGUuUGFnZURvdHM9cyxuLmV4dGVuZChlLmRlZmF1bHRzLHtwYWdlRG90czohMH0pLGUuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZVBhZ2VEb3RzXCIpO3ZhciBvPWUucHJvdG90eXBlO3JldHVybiBvLl9jcmVhdGVQYWdlRG90cz1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5wYWdlRG90cyYmKHRoaXMucGFnZURvdHM9bmV3IHModGhpcyksdGhpcy5vbihcImFjdGl2YXRlXCIsdGhpcy5hY3RpdmF0ZVBhZ2VEb3RzKSx0aGlzLm9uKFwic2VsZWN0XCIsdGhpcy51cGRhdGVTZWxlY3RlZFBhZ2VEb3RzKSx0aGlzLm9uKFwiY2VsbENoYW5nZVwiLHRoaXMudXBkYXRlUGFnZURvdHMpLHRoaXMub24oXCJyZXNpemVcIix0aGlzLnVwZGF0ZVBhZ2VEb3RzKSx0aGlzLm9uKFwiZGVhY3RpdmF0ZVwiLHRoaXMuZGVhY3RpdmF0ZVBhZ2VEb3RzKSl9LG8uYWN0aXZhdGVQYWdlRG90cz1mdW5jdGlvbigpe3RoaXMucGFnZURvdHMuYWN0aXZhdGUoKX0sby51cGRhdGVTZWxlY3RlZFBhZ2VEb3RzPWZ1bmN0aW9uKCl7dGhpcy5wYWdlRG90cy51cGRhdGVTZWxlY3RlZCgpfSxvLnVwZGF0ZVBhZ2VEb3RzPWZ1bmN0aW9uKCl7dGhpcy5wYWdlRG90cy5zZXREb3RzKCl9LG8uZGVhY3RpdmF0ZVBhZ2VEb3RzPWZ1bmN0aW9uKCl7dGhpcy5wYWdlRG90cy5kZWFjdGl2YXRlKCl9LGUuUGFnZURvdHM9cyxlfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvcGxheWVyXCIsW1wiZXYtZW1pdHRlci9ldi1lbWl0dGVyXCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiLFwiLi9mbGlja2l0eVwiXSxmdW5jdGlvbih0LGksbil7cmV0dXJuIGUodCxpLG4pfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZShyZXF1aXJlKFwiZXYtZW1pdHRlclwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikscmVxdWlyZShcIi4vZmxpY2tpdHlcIikpOmUodC5FdkVtaXR0ZXIsdC5maXp6eVVJVXRpbHMsdC5GbGlja2l0eSl9KHdpbmRvdyxmdW5jdGlvbih0LGUsaSl7ZnVuY3Rpb24gbih0KXt0aGlzLnBhcmVudD10LHRoaXMuc3RhdGU9XCJzdG9wcGVkXCIsdGhpcy5vblZpc2liaWxpdHlDaGFuZ2U9dGhpcy52aXNpYmlsaXR5Q2hhbmdlLmJpbmQodGhpcyksdGhpcy5vblZpc2liaWxpdHlQbGF5PXRoaXMudmlzaWJpbGl0eVBsYXkuYmluZCh0aGlzKX1uLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKHQucHJvdG90eXBlKSxuLnByb3RvdHlwZS5wbGF5PWZ1bmN0aW9uKCl7aWYoXCJwbGF5aW5nXCIhPXRoaXMuc3RhdGUpe3ZhciB0PWRvY3VtZW50LmhpZGRlbjtpZih0KXJldHVybiB2b2lkIGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ2aXNpYmlsaXR5Y2hhbmdlXCIsdGhpcy5vblZpc2liaWxpdHlQbGF5KTt0aGlzLnN0YXRlPVwicGxheWluZ1wiLGRvY3VtZW50LmFkZEV2ZW50TGlzdGVuZXIoXCJ2aXNpYmlsaXR5Y2hhbmdlXCIsdGhpcy5vblZpc2liaWxpdHlDaGFuZ2UpLHRoaXMudGljaygpfX0sbi5wcm90b3R5cGUudGljaz1mdW5jdGlvbigpe2lmKFwicGxheWluZ1wiPT10aGlzLnN0YXRlKXt2YXIgdD10aGlzLnBhcmVudC5vcHRpb25zLmF1dG9QbGF5O3Q9XCJudW1iZXJcIj09dHlwZW9mIHQ/dDozZTM7dmFyIGU9dGhpczt0aGlzLmNsZWFyKCksdGhpcy50aW1lb3V0PXNldFRpbWVvdXQoZnVuY3Rpb24oKXtlLnBhcmVudC5uZXh0KCEwKSxlLnRpY2soKX0sdCl9fSxuLnByb3RvdHlwZS5zdG9wPWZ1bmN0aW9uKCl7dGhpcy5zdGF0ZT1cInN0b3BwZWRcIix0aGlzLmNsZWFyKCksZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInZpc2liaWxpdHljaGFuZ2VcIix0aGlzLm9uVmlzaWJpbGl0eUNoYW5nZSl9LG4ucHJvdG90eXBlLmNsZWFyPWZ1bmN0aW9uKCl7Y2xlYXJUaW1lb3V0KHRoaXMudGltZW91dCl9LG4ucHJvdG90eXBlLnBhdXNlPWZ1bmN0aW9uKCl7XCJwbGF5aW5nXCI9PXRoaXMuc3RhdGUmJih0aGlzLnN0YXRlPVwicGF1c2VkXCIsdGhpcy5jbGVhcigpKX0sbi5wcm90b3R5cGUudW5wYXVzZT1mdW5jdGlvbigpe1wicGF1c2VkXCI9PXRoaXMuc3RhdGUmJnRoaXMucGxheSgpfSxuLnByb3RvdHlwZS52aXNpYmlsaXR5Q2hhbmdlPWZ1bmN0aW9uKCl7dmFyIHQ9ZG9jdW1lbnQuaGlkZGVuO3RoaXNbdD9cInBhdXNlXCI6XCJ1bnBhdXNlXCJdKCl9LG4ucHJvdG90eXBlLnZpc2liaWxpdHlQbGF5PWZ1bmN0aW9uKCl7dGhpcy5wbGF5KCksZG9jdW1lbnQucmVtb3ZlRXZlbnRMaXN0ZW5lcihcInZpc2liaWxpdHljaGFuZ2VcIix0aGlzLm9uVmlzaWJpbGl0eVBsYXkpfSxlLmV4dGVuZChpLmRlZmF1bHRzLHtwYXVzZUF1dG9QbGF5T25Ib3ZlcjohMH0pLGkuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZVBsYXllclwiKTt2YXIgcz1pLnByb3RvdHlwZTtyZXR1cm4gcy5fY3JlYXRlUGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXI9bmV3IG4odGhpcyksdGhpcy5vbihcImFjdGl2YXRlXCIsdGhpcy5hY3RpdmF0ZVBsYXllciksdGhpcy5vbihcInVpQ2hhbmdlXCIsdGhpcy5zdG9wUGxheWVyKSx0aGlzLm9uKFwicG9pbnRlckRvd25cIix0aGlzLnN0b3BQbGF5ZXIpLHRoaXMub24oXCJkZWFjdGl2YXRlXCIsdGhpcy5kZWFjdGl2YXRlUGxheWVyKX0scy5hY3RpdmF0ZVBsYXllcj1mdW5jdGlvbigpe3RoaXMub3B0aW9ucy5hdXRvUGxheSYmKHRoaXMucGxheWVyLnBsYXkoKSx0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlZW50ZXJcIix0aGlzKSl9LHMucGxheVBsYXllcj1mdW5jdGlvbigpe3RoaXMucGxheWVyLnBsYXkoKX0scy5zdG9wUGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXIuc3RvcCgpfSxzLnBhdXNlUGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXIucGF1c2UoKX0scy51bnBhdXNlUGxheWVyPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXIudW5wYXVzZSgpfSxzLmRlYWN0aXZhdGVQbGF5ZXI9ZnVuY3Rpb24oKXt0aGlzLnBsYXllci5zdG9wKCksdGhpcy5lbGVtZW50LnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJtb3VzZWVudGVyXCIsdGhpcyl9LHMub25tb3VzZWVudGVyPWZ1bmN0aW9uKCl7dGhpcy5vcHRpb25zLnBhdXNlQXV0b1BsYXlPbkhvdmVyJiYodGhpcy5wbGF5ZXIucGF1c2UoKSx0aGlzLmVsZW1lbnQuYWRkRXZlbnRMaXN0ZW5lcihcIm1vdXNlbGVhdmVcIix0aGlzKSl9LHMub25tb3VzZWxlYXZlPWZ1bmN0aW9uKCl7dGhpcy5wbGF5ZXIudW5wYXVzZSgpLHRoaXMuZWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKFwibW91c2VsZWF2ZVwiLHRoaXMpfSxpLlBsYXllcj1uLGl9KSxmdW5jdGlvbih0LGUpe1wiZnVuY3Rpb25cIj09dHlwZW9mIGRlZmluZSYmZGVmaW5lLmFtZD9kZWZpbmUoXCJmbGlja2l0eS9qcy9hZGQtcmVtb3ZlLWNlbGxcIixbXCIuL2ZsaWNraXR5XCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxmdW5jdGlvbihpLG4pe3JldHVybiBlKHQsaSxuKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOmUodCx0LkZsaWNraXR5LHQuZml6enlVSVV0aWxzKX0od2luZG93LGZ1bmN0aW9uKHQsZSxpKXtmdW5jdGlvbiBuKHQpe3ZhciBlPWRvY3VtZW50LmNyZWF0ZURvY3VtZW50RnJhZ21lbnQoKTtyZXR1cm4gdC5mb3JFYWNoKGZ1bmN0aW9uKHQpe2UuYXBwZW5kQ2hpbGQodC5lbGVtZW50KX0pLGV9dmFyIHM9ZS5wcm90b3R5cGU7cmV0dXJuIHMuaW5zZXJ0PWZ1bmN0aW9uKHQsZSl7dmFyIGk9dGhpcy5fbWFrZUNlbGxzKHQpO2lmKGkmJmkubGVuZ3RoKXt2YXIgcz10aGlzLmNlbGxzLmxlbmd0aDtlPXZvaWQgMD09PWU/czplO3ZhciBvPW4oaSkscj1lPT1zO2lmKHIpdGhpcy5zbGlkZXIuYXBwZW5kQ2hpbGQobyk7ZWxzZXt2YXIgYT10aGlzLmNlbGxzW2VdLmVsZW1lbnQ7dGhpcy5zbGlkZXIuaW5zZXJ0QmVmb3JlKG8sYSl9aWYoMD09PWUpdGhpcy5jZWxscz1pLmNvbmNhdCh0aGlzLmNlbGxzKTtlbHNlIGlmKHIpdGhpcy5jZWxscz10aGlzLmNlbGxzLmNvbmNhdChpKTtlbHNle3ZhciBsPXRoaXMuY2VsbHMuc3BsaWNlKGUscy1lKTt0aGlzLmNlbGxzPXRoaXMuY2VsbHMuY29uY2F0KGkpLmNvbmNhdChsKX10aGlzLl9zaXplQ2VsbHMoaSksdGhpcy5jZWxsQ2hhbmdlKGUsITApfX0scy5hcHBlbmQ9ZnVuY3Rpb24odCl7dGhpcy5pbnNlcnQodCx0aGlzLmNlbGxzLmxlbmd0aCl9LHMucHJlcGVuZD1mdW5jdGlvbih0KXt0aGlzLmluc2VydCh0LDApfSxzLnJlbW92ZT1mdW5jdGlvbih0KXt2YXIgZT10aGlzLmdldENlbGxzKHQpO2lmKGUmJmUubGVuZ3RoKXt2YXIgbj10aGlzLmNlbGxzLmxlbmd0aC0xO2UuZm9yRWFjaChmdW5jdGlvbih0KXt0LnJlbW92ZSgpO3ZhciBlPXRoaXMuY2VsbHMuaW5kZXhPZih0KTtuPU1hdGgubWluKGUsbiksaS5yZW1vdmVGcm9tKHRoaXMuY2VsbHMsdCl9LHRoaXMpLHRoaXMuY2VsbENoYW5nZShuLCEwKX19LHMuY2VsbFNpemVDaGFuZ2U9ZnVuY3Rpb24odCl7dmFyIGU9dGhpcy5nZXRDZWxsKHQpO2lmKGUpe2UuZ2V0U2l6ZSgpO3ZhciBpPXRoaXMuY2VsbHMuaW5kZXhPZihlKTt0aGlzLmNlbGxDaGFuZ2UoaSl9fSxzLmNlbGxDaGFuZ2U9ZnVuY3Rpb24odCxlKXt2YXIgaT10aGlzLnNlbGVjdGVkRWxlbWVudDt0aGlzLl9wb3NpdGlvbkNlbGxzKHQpLHRoaXMuX2dldFdyYXBTaGlmdENlbGxzKCksdGhpcy5zZXRHYWxsZXJ5U2l6ZSgpO3ZhciBuPXRoaXMuZ2V0Q2VsbChpKTtuJiYodGhpcy5zZWxlY3RlZEluZGV4PXRoaXMuZ2V0Q2VsbFNsaWRlSW5kZXgobikpLHRoaXMuc2VsZWN0ZWRJbmRleD1NYXRoLm1pbih0aGlzLnNsaWRlcy5sZW5ndGgtMSx0aGlzLnNlbGVjdGVkSW5kZXgpLHRoaXMuZW1pdEV2ZW50KFwiY2VsbENoYW5nZVwiLFt0XSksdGhpcy5zZWxlY3QodGhpcy5zZWxlY3RlZEluZGV4KSxlJiZ0aGlzLnBvc2l0aW9uU2xpZGVyQXRTZWxlY3RlZCgpfSxlfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvbGF6eWxvYWRcIixbXCIuL2ZsaWNraXR5XCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxmdW5jdGlvbihpLG4pe3JldHVybiBlKHQsaSxuKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiLi9mbGlja2l0eVwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOmUodCx0LkZsaWNraXR5LHQuZml6enlVSVV0aWxzKX0od2luZG93LGZ1bmN0aW9uKHQsZSxpKXtcInVzZSBzdHJpY3RcIjtmdW5jdGlvbiBuKHQpe2lmKFwiSU1HXCI9PXQubm9kZU5hbWUpe3ZhciBlPXQuZ2V0QXR0cmlidXRlKFwiZGF0YS1mbGlja2l0eS1sYXp5bG9hZFwiKSxuPXQuZ2V0QXR0cmlidXRlKFwiZGF0YS1mbGlja2l0eS1sYXp5bG9hZC1zcmNcIikscz10LmdldEF0dHJpYnV0ZShcImRhdGEtZmxpY2tpdHktbGF6eWxvYWQtc3Jjc2V0XCIpO2lmKGV8fG58fHMpcmV0dXJuW3RdfXZhciBvPVwiaW1nW2RhdGEtZmxpY2tpdHktbGF6eWxvYWRdLCBpbWdbZGF0YS1mbGlja2l0eS1sYXp5bG9hZC1zcmNdLCBpbWdbZGF0YS1mbGlja2l0eS1sYXp5bG9hZC1zcmNzZXRdXCIscj10LnF1ZXJ5U2VsZWN0b3JBbGwobyk7cmV0dXJuIGkubWFrZUFycmF5KHIpfWZ1bmN0aW9uIHModCxlKXt0aGlzLmltZz10LHRoaXMuZmxpY2tpdHk9ZSx0aGlzLmxvYWQoKX1lLmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVMYXp5bG9hZFwiKTt2YXIgbz1lLnByb3RvdHlwZTtyZXR1cm4gby5fY3JlYXRlTGF6eWxvYWQ9ZnVuY3Rpb24oKXt0aGlzLm9uKFwic2VsZWN0XCIsdGhpcy5sYXp5TG9hZCl9LG8ubGF6eUxvYWQ9ZnVuY3Rpb24oKXt2YXIgdD10aGlzLm9wdGlvbnMubGF6eUxvYWQ7aWYodCl7dmFyIGU9XCJudW1iZXJcIj09dHlwZW9mIHQ/dDowLGk9dGhpcy5nZXRBZGphY2VudENlbGxFbGVtZW50cyhlKSxvPVtdO2kuZm9yRWFjaChmdW5jdGlvbih0KXt2YXIgZT1uKHQpO289by5jb25jYXQoZSl9KSxvLmZvckVhY2goZnVuY3Rpb24odCl7bmV3IHModCx0aGlzKX0sdGhpcyl9fSxzLnByb3RvdHlwZS5oYW5kbGVFdmVudD1pLmhhbmRsZUV2ZW50LHMucHJvdG90eXBlLmxvYWQ9ZnVuY3Rpb24oKXt0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpO3ZhciB0PXRoaXMuaW1nLmdldEF0dHJpYnV0ZShcImRhdGEtZmxpY2tpdHktbGF6eWxvYWRcIil8fHRoaXMuaW1nLmdldEF0dHJpYnV0ZShcImRhdGEtZmxpY2tpdHktbGF6eWxvYWQtc3JjXCIpLGU9dGhpcy5pbWcuZ2V0QXR0cmlidXRlKFwiZGF0YS1mbGlja2l0eS1sYXp5bG9hZC1zcmNzZXRcIik7dGhpcy5pbWcuc3JjPXQsZSYmdGhpcy5pbWcuc2V0QXR0cmlidXRlKFwic3Jjc2V0XCIsZSksdGhpcy5pbWcucmVtb3ZlQXR0cmlidXRlKFwiZGF0YS1mbGlja2l0eS1sYXp5bG9hZFwiKSx0aGlzLmltZy5yZW1vdmVBdHRyaWJ1dGUoXCJkYXRhLWZsaWNraXR5LWxhenlsb2FkLXNyY1wiKSx0aGlzLmltZy5yZW1vdmVBdHRyaWJ1dGUoXCJkYXRhLWZsaWNraXR5LWxhenlsb2FkLXNyY3NldFwiKX0scy5wcm90b3R5cGUub25sb2FkPWZ1bmN0aW9uKHQpe3RoaXMuY29tcGxldGUodCxcImZsaWNraXR5LWxhenlsb2FkZWRcIil9LHMucHJvdG90eXBlLm9uZXJyb3I9ZnVuY3Rpb24odCl7dGhpcy5jb21wbGV0ZSh0LFwiZmxpY2tpdHktbGF6eWVycm9yXCIpfSxzLnByb3RvdHlwZS5jb21wbGV0ZT1mdW5jdGlvbih0LGUpe3RoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5pbWcucmVtb3ZlRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyk7dmFyIGk9dGhpcy5mbGlja2l0eS5nZXRQYXJlbnRDZWxsKHRoaXMuaW1nKSxuPWkmJmkuZWxlbWVudDt0aGlzLmZsaWNraXR5LmNlbGxTaXplQ2hhbmdlKG4pLHRoaXMuaW1nLmNsYXNzTGlzdC5hZGQoZSksdGhpcy5mbGlja2l0eS5kaXNwYXRjaEV2ZW50KFwibGF6eUxvYWRcIix0LG4pfSxlLkxhenlMb2FkZXI9cyxlfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFwiZmxpY2tpdHkvanMvaW5kZXhcIixbXCIuL2ZsaWNraXR5XCIsXCIuL2RyYWdcIixcIi4vcHJldi1uZXh0LWJ1dHRvblwiLFwiLi9wYWdlLWRvdHNcIixcIi4vcGxheWVyXCIsXCIuL2FkZC1yZW1vdmUtY2VsbFwiLFwiLi9sYXp5bG9hZFwiXSxlKTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cyYmKG1vZHVsZS5leHBvcnRzPWUocmVxdWlyZShcIi4vZmxpY2tpdHlcIikscmVxdWlyZShcIi4vZHJhZ1wiKSxyZXF1aXJlKFwiLi9wcmV2LW5leHQtYnV0dG9uXCIpLHJlcXVpcmUoXCIuL3BhZ2UtZG90c1wiKSxyZXF1aXJlKFwiLi9wbGF5ZXJcIikscmVxdWlyZShcIi4vYWRkLXJlbW92ZS1jZWxsXCIpLHJlcXVpcmUoXCIuL2xhenlsb2FkXCIpKSl9KHdpbmRvdyxmdW5jdGlvbih0KXtyZXR1cm4gdH0pLGZ1bmN0aW9uKHQsZSl7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImZsaWNraXR5LWFzLW5hdi1mb3IvYXMtbmF2LWZvclwiLFtcImZsaWNraXR5L2pzL2luZGV4XCIsXCJmaXp6eS11aS11dGlscy91dGlsc1wiXSxlKTpcIm9iamVjdFwiPT10eXBlb2YgbW9kdWxlJiZtb2R1bGUuZXhwb3J0cz9tb2R1bGUuZXhwb3J0cz1lKHJlcXVpcmUoXCJmbGlja2l0eVwiKSxyZXF1aXJlKFwiZml6enktdWktdXRpbHNcIikpOnQuRmxpY2tpdHk9ZSh0LkZsaWNraXR5LHQuZml6enlVSVV0aWxzKX0od2luZG93LGZ1bmN0aW9uKHQsZSl7ZnVuY3Rpb24gaSh0LGUsaSl7cmV0dXJuKGUtdCkqaSt0fXQuY3JlYXRlTWV0aG9kcy5wdXNoKFwiX2NyZWF0ZUFzTmF2Rm9yXCIpO3ZhciBuPXQucHJvdG90eXBlO3JldHVybiBuLl9jcmVhdGVBc05hdkZvcj1mdW5jdGlvbigpe3RoaXMub24oXCJhY3RpdmF0ZVwiLHRoaXMuYWN0aXZhdGVBc05hdkZvciksdGhpcy5vbihcImRlYWN0aXZhdGVcIix0aGlzLmRlYWN0aXZhdGVBc05hdkZvciksdGhpcy5vbihcImRlc3Ryb3lcIix0aGlzLmRlc3Ryb3lBc05hdkZvcik7dmFyIHQ9dGhpcy5vcHRpb25zLmFzTmF2Rm9yO2lmKHQpe3ZhciBlPXRoaXM7c2V0VGltZW91dChmdW5jdGlvbigpe2Uuc2V0TmF2Q29tcGFuaW9uKHQpfSl9fSxuLnNldE5hdkNvbXBhbmlvbj1mdW5jdGlvbihpKXtpPWUuZ2V0UXVlcnlFbGVtZW50KGkpO3ZhciBuPXQuZGF0YShpKTtpZihuJiZuIT10aGlzKXt0aGlzLm5hdkNvbXBhbmlvbj1uO3ZhciBzPXRoaXM7dGhpcy5vbk5hdkNvbXBhbmlvblNlbGVjdD1mdW5jdGlvbigpe3MubmF2Q29tcGFuaW9uU2VsZWN0KCl9LG4ub24oXCJzZWxlY3RcIix0aGlzLm9uTmF2Q29tcGFuaW9uU2VsZWN0KSx0aGlzLm9uKFwic3RhdGljQ2xpY2tcIix0aGlzLm9uTmF2U3RhdGljQ2xpY2spLHRoaXMubmF2Q29tcGFuaW9uU2VsZWN0KCEwKX19LG4ubmF2Q29tcGFuaW9uU2VsZWN0PWZ1bmN0aW9uKHQpe2lmKHRoaXMubmF2Q29tcGFuaW9uKXt2YXIgZT10aGlzLm5hdkNvbXBhbmlvbi5zZWxlY3RlZENlbGxzWzBdLG49dGhpcy5uYXZDb21wYW5pb24uY2VsbHMuaW5kZXhPZihlKSxzPW4rdGhpcy5uYXZDb21wYW5pb24uc2VsZWN0ZWRDZWxscy5sZW5ndGgtMSxvPU1hdGguZmxvb3IoaShuLHMsdGhpcy5uYXZDb21wYW5pb24uY2VsbEFsaWduKSk7aWYodGhpcy5zZWxlY3RDZWxsKG8sITEsdCksdGhpcy5yZW1vdmVOYXZTZWxlY3RlZEVsZW1lbnRzKCksIShvPj10aGlzLmNlbGxzLmxlbmd0aCkpe3ZhciByPXRoaXMuY2VsbHMuc2xpY2UobixzKzEpO3RoaXMubmF2U2VsZWN0ZWRFbGVtZW50cz1yLm1hcChmdW5jdGlvbih0KXtyZXR1cm4gdC5lbGVtZW50fSksdGhpcy5jaGFuZ2VOYXZTZWxlY3RlZENsYXNzKFwiYWRkXCIpfX19LG4uY2hhbmdlTmF2U2VsZWN0ZWRDbGFzcz1mdW5jdGlvbih0KXt0aGlzLm5hdlNlbGVjdGVkRWxlbWVudHMuZm9yRWFjaChmdW5jdGlvbihlKXtlLmNsYXNzTGlzdFt0XShcImlzLW5hdi1zZWxlY3RlZFwiKX0pfSxuLmFjdGl2YXRlQXNOYXZGb3I9ZnVuY3Rpb24oKXt0aGlzLm5hdkNvbXBhbmlvblNlbGVjdCghMCl9LG4ucmVtb3ZlTmF2U2VsZWN0ZWRFbGVtZW50cz1mdW5jdGlvbigpe3RoaXMubmF2U2VsZWN0ZWRFbGVtZW50cyYmKHRoaXMuY2hhbmdlTmF2U2VsZWN0ZWRDbGFzcyhcInJlbW92ZVwiKSxkZWxldGUgdGhpcy5uYXZTZWxlY3RlZEVsZW1lbnRzKX0sbi5vbk5hdlN0YXRpY0NsaWNrPWZ1bmN0aW9uKHQsZSxpLG4pe1wibnVtYmVyXCI9PXR5cGVvZiBuJiZ0aGlzLm5hdkNvbXBhbmlvbi5zZWxlY3RDZWxsKG4pfSxuLmRlYWN0aXZhdGVBc05hdkZvcj1mdW5jdGlvbigpe3RoaXMucmVtb3ZlTmF2U2VsZWN0ZWRFbGVtZW50cygpfSxuLmRlc3Ryb3lBc05hdkZvcj1mdW5jdGlvbigpe3RoaXMubmF2Q29tcGFuaW9uJiYodGhpcy5uYXZDb21wYW5pb24ub2ZmKFwic2VsZWN0XCIsdGhpcy5vbk5hdkNvbXBhbmlvblNlbGVjdCksdGhpcy5vZmYoXCJzdGF0aWNDbGlja1wiLHRoaXMub25OYXZTdGF0aWNDbGljayksZGVsZXRlIHRoaXMubmF2Q29tcGFuaW9uKX0sdH0pLGZ1bmN0aW9uKHQsZSl7XCJ1c2Ugc3RyaWN0XCI7XCJmdW5jdGlvblwiPT10eXBlb2YgZGVmaW5lJiZkZWZpbmUuYW1kP2RlZmluZShcImltYWdlc2xvYWRlZC9pbWFnZXNsb2FkZWRcIixbXCJldi1lbWl0dGVyL2V2LWVtaXR0ZXJcIl0sZnVuY3Rpb24oaSl7cmV0dXJuIGUodCxpKX0pOlwib2JqZWN0XCI9PXR5cGVvZiBtb2R1bGUmJm1vZHVsZS5leHBvcnRzP21vZHVsZS5leHBvcnRzPWUodCxyZXF1aXJlKFwiZXYtZW1pdHRlclwiKSk6dC5pbWFnZXNMb2FkZWQ9ZSh0LHQuRXZFbWl0dGVyKX0oXCJ1bmRlZmluZWRcIiE9dHlwZW9mIHdpbmRvdz93aW5kb3c6dGhpcyxmdW5jdGlvbih0LGUpe2Z1bmN0aW9uIGkodCxlKXtmb3IodmFyIGkgaW4gZSl0W2ldPWVbaV07cmV0dXJuIHR9ZnVuY3Rpb24gbih0KXtpZihBcnJheS5pc0FycmF5KHQpKXJldHVybiB0O3ZhciBlPVwib2JqZWN0XCI9PXR5cGVvZiB0JiZcIm51bWJlclwiPT10eXBlb2YgdC5sZW5ndGg7cmV0dXJuIGU/aC5jYWxsKHQpOlt0XX1mdW5jdGlvbiBzKHQsZSxvKXtpZighKHRoaXMgaW5zdGFuY2VvZiBzKSlyZXR1cm4gbmV3IHModCxlLG8pO3ZhciByPXQ7cmV0dXJuXCJzdHJpbmdcIj09dHlwZW9mIHQmJihyPWRvY3VtZW50LnF1ZXJ5U2VsZWN0b3JBbGwodCkpLHI/KHRoaXMuZWxlbWVudHM9bihyKSx0aGlzLm9wdGlvbnM9aSh7fSx0aGlzLm9wdGlvbnMpLFwiZnVuY3Rpb25cIj09dHlwZW9mIGU/bz1lOmkodGhpcy5vcHRpb25zLGUpLG8mJnRoaXMub24oXCJhbHdheXNcIixvKSx0aGlzLmdldEltYWdlcygpLGEmJih0aGlzLmpxRGVmZXJyZWQ9bmV3IGEuRGVmZXJyZWQpLHZvaWQgc2V0VGltZW91dCh0aGlzLmNoZWNrLmJpbmQodGhpcykpKTp2b2lkIGwuZXJyb3IoXCJCYWQgZWxlbWVudCBmb3IgaW1hZ2VzTG9hZGVkIFwiKyhyfHx0KSl9ZnVuY3Rpb24gbyh0KXt0aGlzLmltZz10fWZ1bmN0aW9uIHIodCxlKXt0aGlzLnVybD10LHRoaXMuZWxlbWVudD1lLHRoaXMuaW1nPW5ldyBJbWFnZX12YXIgYT10LmpRdWVyeSxsPXQuY29uc29sZSxoPUFycmF5LnByb3RvdHlwZS5zbGljZTtzLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUucHJvdG90eXBlKSxzLnByb3RvdHlwZS5vcHRpb25zPXt9LHMucHJvdG90eXBlLmdldEltYWdlcz1mdW5jdGlvbigpe3RoaXMuaW1hZ2VzPVtdLHRoaXMuZWxlbWVudHMuZm9yRWFjaCh0aGlzLmFkZEVsZW1lbnRJbWFnZXMsdGhpcyl9LHMucHJvdG90eXBlLmFkZEVsZW1lbnRJbWFnZXM9ZnVuY3Rpb24odCl7XCJJTUdcIj09dC5ub2RlTmFtZSYmdGhpcy5hZGRJbWFnZSh0KSx0aGlzLm9wdGlvbnMuYmFja2dyb3VuZD09PSEwJiZ0aGlzLmFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzKHQpO3ZhciBlPXQubm9kZVR5cGU7aWYoZSYmY1tlXSl7Zm9yKHZhciBpPXQucXVlcnlTZWxlY3RvckFsbChcImltZ1wiKSxuPTA7bjxpLmxlbmd0aDtuKyspe3ZhciBzPWlbbl07dGhpcy5hZGRJbWFnZShzKX1pZihcInN0cmluZ1wiPT10eXBlb2YgdGhpcy5vcHRpb25zLmJhY2tncm91bmQpe3ZhciBvPXQucXVlcnlTZWxlY3RvckFsbCh0aGlzLm9wdGlvbnMuYmFja2dyb3VuZCk7Zm9yKG49MDtuPG8ubGVuZ3RoO24rKyl7dmFyIHI9b1tuXTt0aGlzLmFkZEVsZW1lbnRCYWNrZ3JvdW5kSW1hZ2VzKHIpfX19fTt2YXIgYz17MTohMCw5OiEwLDExOiEwfTtyZXR1cm4gcy5wcm90b3R5cGUuYWRkRWxlbWVudEJhY2tncm91bmRJbWFnZXM9ZnVuY3Rpb24odCl7dmFyIGU9Z2V0Q29tcHV0ZWRTdHlsZSh0KTtpZihlKWZvcih2YXIgaT0vdXJsXFwoKFsnXCJdKT8oLio/KVxcMVxcKS9naSxuPWkuZXhlYyhlLmJhY2tncm91bmRJbWFnZSk7bnVsbCE9PW47KXt2YXIgcz1uJiZuWzJdO3MmJnRoaXMuYWRkQmFja2dyb3VuZChzLHQpLG49aS5leGVjKGUuYmFja2dyb3VuZEltYWdlKX19LHMucHJvdG90eXBlLmFkZEltYWdlPWZ1bmN0aW9uKHQpe3ZhciBlPW5ldyBvKHQpO3RoaXMuaW1hZ2VzLnB1c2goZSl9LHMucHJvdG90eXBlLmFkZEJhY2tncm91bmQ9ZnVuY3Rpb24odCxlKXt2YXIgaT1uZXcgcih0LGUpO3RoaXMuaW1hZ2VzLnB1c2goaSl9LHMucHJvdG90eXBlLmNoZWNrPWZ1bmN0aW9uKCl7ZnVuY3Rpb24gdCh0LGksbil7c2V0VGltZW91dChmdW5jdGlvbigpe2UucHJvZ3Jlc3ModCxpLG4pfSl9dmFyIGU9dGhpcztyZXR1cm4gdGhpcy5wcm9ncmVzc2VkQ291bnQ9MCx0aGlzLmhhc0FueUJyb2tlbj0hMSx0aGlzLmltYWdlcy5sZW5ndGg/dm9pZCB0aGlzLmltYWdlcy5mb3JFYWNoKGZ1bmN0aW9uKGUpe2Uub25jZShcInByb2dyZXNzXCIsdCksZS5jaGVjaygpfSk6dm9pZCB0aGlzLmNvbXBsZXRlKCl9LHMucHJvdG90eXBlLnByb2dyZXNzPWZ1bmN0aW9uKHQsZSxpKXt0aGlzLnByb2dyZXNzZWRDb3VudCsrLHRoaXMuaGFzQW55QnJva2VuPXRoaXMuaGFzQW55QnJva2VufHwhdC5pc0xvYWRlZCx0aGlzLmVtaXRFdmVudChcInByb2dyZXNzXCIsW3RoaXMsdCxlXSksdGhpcy5qcURlZmVycmVkJiZ0aGlzLmpxRGVmZXJyZWQubm90aWZ5JiZ0aGlzLmpxRGVmZXJyZWQubm90aWZ5KHRoaXMsdCksdGhpcy5wcm9ncmVzc2VkQ291bnQ9PXRoaXMuaW1hZ2VzLmxlbmd0aCYmdGhpcy5jb21wbGV0ZSgpLHRoaXMub3B0aW9ucy5kZWJ1ZyYmbCYmbC5sb2coXCJwcm9ncmVzczogXCIraSx0LGUpfSxzLnByb3RvdHlwZS5jb21wbGV0ZT1mdW5jdGlvbigpe3ZhciB0PXRoaXMuaGFzQW55QnJva2VuP1wiZmFpbFwiOlwiZG9uZVwiO2lmKHRoaXMuaXNDb21wbGV0ZT0hMCx0aGlzLmVtaXRFdmVudCh0LFt0aGlzXSksdGhpcy5lbWl0RXZlbnQoXCJhbHdheXNcIixbdGhpc10pLHRoaXMuanFEZWZlcnJlZCl7dmFyIGU9dGhpcy5oYXNBbnlCcm9rZW4/XCJyZWplY3RcIjpcInJlc29sdmVcIjt0aGlzLmpxRGVmZXJyZWRbZV0odGhpcyl9fSxvLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKGUucHJvdG90eXBlKSxvLnByb3RvdHlwZS5jaGVjaz1mdW5jdGlvbigpe3ZhciB0PXRoaXMuZ2V0SXNJbWFnZUNvbXBsZXRlKCk7cmV0dXJuIHQ/dm9pZCB0aGlzLmNvbmZpcm0oMCE9PXRoaXMuaW1nLm5hdHVyYWxXaWR0aCxcIm5hdHVyYWxXaWR0aFwiKToodGhpcy5wcm94eUltYWdlPW5ldyBJbWFnZSx0aGlzLnByb3h5SW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLnByb3h5SW1hZ2UuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyksdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lcihcImxvYWRcIix0aGlzKSx0aGlzLmltZy5hZGRFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKSx2b2lkKHRoaXMucHJveHlJbWFnZS5zcmM9dGhpcy5pbWcuc3JjKSl9LG8ucHJvdG90eXBlLmdldElzSW1hZ2VDb21wbGV0ZT1mdW5jdGlvbigpe3JldHVybiB0aGlzLmltZy5jb21wbGV0ZSYmdGhpcy5pbWcubmF0dXJhbFdpZHRofSxvLnByb3RvdHlwZS5jb25maXJtPWZ1bmN0aW9uKHQsZSl7dGhpcy5pc0xvYWRlZD10LHRoaXMuZW1pdEV2ZW50KFwicHJvZ3Jlc3NcIixbdGhpcyx0aGlzLmltZyxlXSl9LG8ucHJvdG90eXBlLmhhbmRsZUV2ZW50PWZ1bmN0aW9uKHQpe3ZhciBlPVwib25cIit0LnR5cGU7dGhpc1tlXSYmdGhpc1tlXSh0KX0sby5wcm90b3R5cGUub25sb2FkPWZ1bmN0aW9uKCl7dGhpcy5jb25maXJtKCEwLFwib25sb2FkXCIpLHRoaXMudW5iaW5kRXZlbnRzKCl9LG8ucHJvdG90eXBlLm9uZXJyb3I9ZnVuY3Rpb24oKXt0aGlzLmNvbmZpcm0oITEsXCJvbmVycm9yXCIpLHRoaXMudW5iaW5kRXZlbnRzKCl9LG8ucHJvdG90eXBlLnVuYmluZEV2ZW50cz1mdW5jdGlvbigpe3RoaXMucHJveHlJbWFnZS5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMucHJveHlJbWFnZS5yZW1vdmVFdmVudExpc3RlbmVyKFwiZXJyb3JcIix0aGlzKSx0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpfSxyLnByb3RvdHlwZT1PYmplY3QuY3JlYXRlKG8ucHJvdG90eXBlKSxyLnByb3RvdHlwZS5jaGVjaz1mdW5jdGlvbigpe3RoaXMuaW1nLmFkZEV2ZW50TGlzdGVuZXIoXCJsb2FkXCIsdGhpcyksdGhpcy5pbWcuYWRkRXZlbnRMaXN0ZW5lcihcImVycm9yXCIsdGhpcyksdGhpcy5pbWcuc3JjPXRoaXMudXJsO3ZhciB0PXRoaXMuZ2V0SXNJbWFnZUNvbXBsZXRlKCk7dCYmKHRoaXMuY29uZmlybSgwIT09dGhpcy5pbWcubmF0dXJhbFdpZHRoLFwibmF0dXJhbFdpZHRoXCIpLHRoaXMudW5iaW5kRXZlbnRzKCkpfSxyLnByb3RvdHlwZS51bmJpbmRFdmVudHM9ZnVuY3Rpb24oKXt0aGlzLmltZy5yZW1vdmVFdmVudExpc3RlbmVyKFwibG9hZFwiLHRoaXMpLHRoaXMuaW1nLnJlbW92ZUV2ZW50TGlzdGVuZXIoXCJlcnJvclwiLHRoaXMpfSxyLnByb3RvdHlwZS5jb25maXJtPWZ1bmN0aW9uKHQsZSl7dGhpcy5pc0xvYWRlZD10LHRoaXMuZW1pdEV2ZW50KFwicHJvZ3Jlc3NcIixbdGhpcyx0aGlzLmVsZW1lbnQsZV0pfSxzLm1ha2VKUXVlcnlQbHVnaW49ZnVuY3Rpb24oZSl7ZT1lfHx0LmpRdWVyeSxlJiYoYT1lLGEuZm4uaW1hZ2VzTG9hZGVkPWZ1bmN0aW9uKHQsZSl7dmFyIGk9bmV3IHModGhpcyx0LGUpO3JldHVybiBpLmpxRGVmZXJyZWQucHJvbWlzZShhKHRoaXMpKX0pfSxzLm1ha2VKUXVlcnlQbHVnaW4oKSxzfSksZnVuY3Rpb24odCxlKXtcImZ1bmN0aW9uXCI9PXR5cGVvZiBkZWZpbmUmJmRlZmluZS5hbWQ/ZGVmaW5lKFtcImZsaWNraXR5L2pzL2luZGV4XCIsXCJpbWFnZXNsb2FkZWQvaW1hZ2VzbG9hZGVkXCJdLGZ1bmN0aW9uKGksbil7cmV0dXJuIGUodCxpLG4pfSk6XCJvYmplY3RcIj09dHlwZW9mIG1vZHVsZSYmbW9kdWxlLmV4cG9ydHM/bW9kdWxlLmV4cG9ydHM9ZSh0LHJlcXVpcmUoXCJmbGlja2l0eVwiKSxyZXF1aXJlKFwiaW1hZ2VzbG9hZGVkXCIpKTp0LkZsaWNraXR5PWUodCx0LkZsaWNraXR5LHQuaW1hZ2VzTG9hZGVkKX0od2luZG93LGZ1bmN0aW9uKHQsZSxpKXtcInVzZSBzdHJpY3RcIjtlLmNyZWF0ZU1ldGhvZHMucHVzaChcIl9jcmVhdGVJbWFnZXNMb2FkZWRcIik7dmFyIG49ZS5wcm90b3R5cGU7cmV0dXJuIG4uX2NyZWF0ZUltYWdlc0xvYWRlZD1mdW5jdGlvbigpe3RoaXMub24oXCJhY3RpdmF0ZVwiLHRoaXMuaW1hZ2VzTG9hZGVkKX0sbi5pbWFnZXNMb2FkZWQ9ZnVuY3Rpb24oKXtmdW5jdGlvbiB0KHQsaSl7dmFyIG49ZS5nZXRQYXJlbnRDZWxsKGkuaW1nKTtlLmNlbGxTaXplQ2hhbmdlKG4mJm4uZWxlbWVudCksZS5vcHRpb25zLmZyZWVTY3JvbGx8fGUucG9zaXRpb25TbGlkZXJBdFNlbGVjdGVkKCl9aWYodGhpcy5vcHRpb25zLmltYWdlc0xvYWRlZCl7dmFyIGU9dGhpcztpKHRoaXMuc2xpZGVyKS5vbihcInByb2dyZXNzXCIsdCl9fSxlfSk7IiwidmFyIEhlbHNpbmdib3JnUHJpbWUgPSB7fTtcbnZhciBpZSA9IChmdW5jdGlvbiAoKSB7XG5cbiAgICB2YXIgdW5kZWYsXG4gICAgICAgIHYgPSAzLFxuICAgICAgICBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSxcbiAgICAgICAgYWxsID0gZGl2LmdldEVsZW1lbnRzQnlUYWdOYW1lKCdpJyk7XG5cbiAgICB3aGlsZSAoXG4gICAgICAgIGRpdi5pbm5lckhUTUwgPSAnPCEtLVtpZiBndCBJRSAnICsgKCsrdikgKyAnXT48aT48L2k+PCFbZW5kaWZdLS0+JyxcbiAgICAgICAgICAgIGFsbFswXVxuICAgICAgICApIDtcblxuICAgIHJldHVybiB2ID4gNCA/IHYgOiB1bmRlZjtcblxufSgpKTtcblxudmFyIGlvcyA9IChmdW5jdGlvbiAoKSB7XG4gICAgdmFyIHVuZGVmO1xuXG4gICAgaWYgKC9pUChob25lfG9kfGFkKS8udGVzdChuYXZpZ2F0b3IucGxhdGZvcm0pKSB7XG4gICAgICAgIHZhciB2ID0gKG5hdmlnYXRvci5hcHBWZXJzaW9uKS5tYXRjaCgvT1MgKFxcZCspXyhcXGQrKV8/KFxcZCspPy8pO1xuICAgICAgICByZXR1cm4gcGFyc2VJbnQodlsxXSwgMTApO1xuICAgIH1cblxuICAgIHJldHVybiB1bmRlZjtcblxufSgpKTtcblxuaWYgKChpZSA+IDkgfHwgdHlwZW9mIGllID09ICd1bmRlZmluZWQnKSAmJiAodHlwZW9mIGlvcyA9PSAndW5kZWZpbmVkJyB8fCBpb3MgPj0gOCkpIHtcbiAgICB2YXIgaHlwZXJmb3JtV3JhcHBlciA9IGh5cGVyZm9ybSh3aW5kb3csIHtcbiAgICAgICAgY2xhc3Nlczoge1xuICAgICAgICAgICAgdmFsaWQ6ICd2YWxpZCcsXG4gICAgICAgICAgICBpbnZhbGlkOiAnaW52YWxpZCcsXG4gICAgICAgICAgICB2YWxpZGF0ZWQ6ICd2YWxpZGF0ZWQnLFxuICAgICAgICAgICAgd2FybmluZzogJ2Zvcm0tbm90aWNlIHRleHQtZGFuZ2VyIHRleHQtc20nXG4gICAgICAgIH1cbiAgICB9KTtcblxuICAgIGh5cGVyZm9ybS5hZGRUcmFuc2xhdGlvbignc3YnLCB7XG4gICAgICAgIFRleHRUb29Mb25nOiAnQW52w6RuZCAlbCBlbGxlciBmw6RycmUgdGVja2VuIChkdSBhbnbDpG5kZXIganVzdCBudSAlbCB0ZWNrZW4pLicsXG4gICAgICAgIFZhbHVlTWlzc2luZzogJ0R1IG3DpXN0ZSBmeWxsYSBpIGRldHRhIGbDpGx0ZXQuJyxcbiAgICAgICAgQ2hlY2tib3hNaXNzaW5nOiAnRHUgbcOlc3RlIGtyeXNzYSBmw7ZyIG1pbnN0IGV0dCBhbHRlcm5hdGl2LicsXG4gICAgICAgIFJhZGlvTWlzc2luZzogJ1bDpG5saWdlbiB2w6RsaiBldHQgYXYgYWx0ZXJuYXRpdmVuLicsXG4gICAgICAgIEZpbGVNaXNzaW5nOiAnVsOkbmxpZ2VuIHbDpGxqIGVuIGZpbC4nLFxuICAgICAgICBTZWxlY3RNaXNzaW5nOiAnRHUgbcOlc3RlIHbDpGxqYSBldHQgb2JqZWt0IGkgbGlzdGFuLicsXG4gICAgICAgIEludmFsaWRFbWFpbDogJ0Z5bGwgaSBlbiBnaWx0aWcgZS1wb3N0YWRyZXNzJyxcbiAgICAgICAgSW52YWxpZFVSTDogJ0Z5bGwgaSBlbiBnaWx0aWcgd2ViYmFkcmVzcy4nLFxuICAgICAgICBQYXR0ZXJuTWlzbWF0Y2g6ICdWw6RyZGV0IMOkciBmZWxmb3JtYXR0ZXJhdC4nLFxuICAgICAgICBQYXR0ZXJuTWlzbWF0Y2hXaXRoVGl0bGU6ICdEaXR0IHbDpHJkZSBtw6VzdGUgbWF0Y2hhIGZvcm1hdGV0OiAlbC4nLFxuICAgICAgICBOdW1iZXJSYW5nZU92ZXJmbG93OiAnVsOkbGogZXR0IHbDpHJkZSBzb20gaW50ZSDDpHIgaMO2Z3JlIMOkbiAlbC4nLFxuICAgICAgICBEYXRlUmFuZ2VPdmVyZmxvdzogJ1bDpGxqIGV0dCBkYXR1bSBzb20gaW50ZSDDpHIgc2VuYXJlIMOkbiAlbC4nLFxuICAgICAgICBUaW1lUmFuZ2VPdmVyZmxvdzogJ1bDpGxqIGV0dCBrbG9ja3NsYWcgc29tIGludGUgw6RyIHNlbmFyZSDDpG4gJWwuJyxcbiAgICAgICAgTnVtYmVyUmFuZ2VVbmRlcmZsb3c6ICdWw6RsaiBldHQgdsOkcmRlIHNvbSBpbnRlIMOkciBsw6RncmUgw6RuICVsLicsXG4gICAgICAgIERhdGVSYW5nZVVuZGVyZmxvdzogJ1bDpGxqIGV0dCBkYXR1bSBzb20gaW50ZSDDpHIgdGlkaWdhcmUgw6RuICVsLicsXG4gICAgICAgIFRpbWVSYW5nZVVuZGVyZmxvdzogJ1bDpGxqIGV0dCBrbG9ja3NsYWcgc29tIGludGUgw6RyIHRpZGlnYXJlIMOkbiAlbC4nLFxuICAgICAgICBTdGVwTWlzbWF0Y2g6ICdWw6RyZGV0IMOkciBmZWxha3RpZ3QuIERlIHR2w6UgbsOkcm1zdGEgZ29ka8OkbmRhIHbDpHJkZW5hIMOkciAlbCBvY2ggJWwuJyxcbiAgICAgICAgU3RlcE1pc21hdGNoT25lVmFsdWU6ICdWw6RsaiBldHQgZ29ka8OkbnQgdsOkcmRlLiBEZXQgbsOkcm1zdGEgZ29ka8OkbmRhIHbDpHJkZXQgw6RyICVsLicsXG4gICAgICAgIEJhZElucHV0TnVtYmVyOiAnRHUgbcOlc3RlIGFuZ2UgZW4gc2lmZnJhLidcbiAgICB9KTtcblxuICAgIGh5cGVyZm9ybS5zZXRMYW5ndWFnZShcInN2XCIpO1xufVxuXG4kKCdodG1sLCBib2R5JykucmVtb3ZlQ2xhc3MoJ25vLWpzJyk7XG5kb2N1bWVudC5kb2N1bWVudEVsZW1lbnQuc2V0QXR0cmlidXRlKCdkYXRhLXVzZXJhZ2VudCcsIG5hdmlnYXRvci51c2VyQWdlbnQpO1xuXG5qUXVlcnkuZXhwci5maWx0ZXJzLm9mZnNjcmVlbiA9IGZ1bmN0aW9uIChlbCkge1xuICAgIHZhciByZWN0ID0gZWwuZ2V0Qm91bmRpbmdDbGllbnRSZWN0KCk7XG4gICAgcmV0dXJuIChcbiAgICAgICAgKHJlY3QueCArIHJlY3Qud2lkdGgpIDwgMFxuICAgICAgICB8fCAocmVjdC55ICsgcmVjdC5oZWlnaHQpIDwgMFxuICAgICAgICB8fCAocmVjdC54ID4gd2luZG93LmlubmVyV2lkdGggfHwgcmVjdC55ID4gd2luZG93LmlubmVySGVpZ2h0KVxuICAgICk7XG59O1xuXG5qUXVlcnkuZXhwclsnOiddLmljb250YWlucyA9IGZ1bmN0aW9uIChhLCBpLCBtKSB7XG4gICAgcmV0dXJuIGpRdWVyeShhKS50ZXh0KCkudG9VcHBlckNhc2UoKVxuICAgICAgICAuaW5kZXhPZihtWzNdLnRvVXBwZXJDYXNlKCkpID49IDA7XG59O1xuLyoqXG4gKiAgTW9kdWxhcml0eSAtIFBvc3QgZmlsdGVycyAgLSBUb29nbGVcbiAqICovXG52YXIgc2NyZWVuU2l6ZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB2YXIgdyA9IHdpbmRvdyxcbiAgICAgICAgZCA9IGRvY3VtZW50LFxuICAgICAgICBlID0gZC5kb2N1bWVudEVsZW1lbnQsXG4gICAgICAgIGcgPSBkLmdldEVsZW1lbnRzQnlUYWdOYW1lKCdib2R5JylbMF0sXG4gICAgICAgIHggPSB3LmlubmVyV2lkdGggfHwgZS5jbGllbnRXaWR0aCB8fCBnLmNsaWVudFdpZHRoO1xuICAgIHJldHVybiB4O1xufTtcblxudmFyIHBvc3RGaWx0ZXJzID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJwb3N0LWZpbHRlclwiKSxcbiAgICBkaXNhYmxlUG9zdEZpbHRlckpzID0gZG9jdW1lbnQucXVlcnlTZWxlY3RvcignZGlzYWJsZS1wb3N0LWZpbHRlci1qcycpO1xuXG5pZiAocG9zdEZpbHRlcnMgJiYgIWRpc2FibGVQb3N0RmlsdGVySnMpIHtcbiAgICBkb2N1bWVudC5xdWVyeVNlbGVjdG9yKCcudG9vZ2xlJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICB0aGlzLmNsYXNzTGlzdC50b2dnbGUoJ2hpZGRlbicpO1xuICAgICAgICB2YXIgdG9vZ2xlRWxlbWVudCA9IHRoaXMuZ2V0QXR0cmlidXRlKCdkYXRhLXRvb2dsZScpO1xuICAgICAgICBbXS5tYXAuY2FsbChkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKHRvb2dsZUVsZW1lbnQpLCBmdW5jdGlvbiAoZWxlbWVudCkge1xuICAgICAgICAgICAgZWxlbWVudC5jbGFzc0xpc3QudG9nZ2xlKCdoaWRkZW4nKTtcbiAgICAgICAgfSk7XG4gICAgfSk7XG4gICAgZG9jdW1lbnQucXVlcnlTZWxlY3RvcignI2ZpbHRlci1rZXl3b3JkJykuYWRkRXZlbnRMaXN0ZW5lcignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICB2YXIgeCA9IHNjcmVlblNpemUoKTtcbiAgICAgICAgaWYgKHggPj0gODk1KSB7XG4gICAgICAgICAgICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nob3ctZGF0ZS1maWx0ZXInKS5jbGFzc0xpc3QuY29udGFpbnMoJ2hpZGRlbicpKSB7XG4gICAgICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ3Nob3ctZGF0ZS1maWx0ZXInKS5jbGFzc0xpc3QucmVtb3ZlKCdoaWRkZW4nKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICghZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RhdGUtZmlsdGVyJykuY2xhc3NMaXN0LmNvbnRhaW5zKCdoaWRkZW4nKSkge1xuICAgICAgICAgICAgICAgIGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKCdkYXRlLWZpbHRlcicpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfSk7XG4gICAgd2luZG93LmFkZEV2ZW50TGlzdGVuZXIoJ3Jlc2l6ZScsIGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB2YXIgeCA9IHNjcmVlblNpemUoKTtcbiAgICAgICAgaWYgKHggPj0gODk1KSB7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvdy1kYXRlLWZpbHRlcicpLmNsYXNzTGlzdC5yZW1vdmUoJ2hpZGRlbicpO1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RhdGUtZmlsdGVyJykuY2xhc3NMaXN0LmFkZCgnaGlkZGVuJyk7XG4gICAgICAgIH1cbiAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICBkb2N1bWVudC5nZXRFbGVtZW50QnlJZCgnc2hvdy1kYXRlLWZpbHRlcicpLmNsYXNzTGlzdC5hZGQoJ2hpZGRlbicpO1xuICAgICAgICAgICAgZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoJ2RhdGUtZmlsdGVyJykuY2xhc3NMaXN0LnJlbW92ZSgnaGlkZGVuJyk7XG4gICAgICAgIH1cbiAgICB9KTtcblxufVxuXG4vKiBGbGlja2l0eSBwYXRjaCAtIFJlbG9hZCB3aW5kb3cgZG9lc24ndCBzZXQgY29ycmVjdCBoZWlnaHQgKi9cbmpRdWVyeSh3aW5kb3cpLmxvYWQoIGZ1bmN0aW9uKCkge1xuICAgIHdpbmRvdy5kaXNwYXRjaEV2ZW50KG5ldyBFdmVudCgncmVzaXplJykpO1xufSk7XG4iLCIvL1xuLy8gQG5hbWUgTGFuZ3VhZ2Vcbi8vXG5IZWxzaW5nYm9yZ1ByaW1lID0gSGVsc2luZ2JvcmdQcmltZSB8fCB7fTtcblxuSGVsc2luZ2JvcmdQcmltZS5BcmdzID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICBmdW5jdGlvbiBBcmdzKCkge1xuXG4gICAgfVxuXG4gICAgQXJncy5wcm90b3R5cGUuZ2V0ID0gZnVuY3Rpb24gKHMpIHtcbiAgICAgICAgaWYgKHR5cGVvZiBIYmdQcmltZUFyZ3MgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBvID0gSGJnUHJpbWVBcmdzO1xuXG4gICAgICAgIHMgPSBzLnJlcGxhY2UoL1xcWyhcXHcrKVxcXS9nLCAnLiQxJyk7XG4gICAgICAgIHMgPSBzLnJlcGxhY2UoL15cXC4vLCAnJyk7XG5cbiAgICAgICAgdmFyIGEgPSBzLnNwbGl0KCcuJyk7XG4gICAgICAgIGZvciAodmFyIGkgPSAwLCBuID0gYS5sZW5ndGg7IGkgPCBuOyArK2kpIHtcbiAgICAgICAgICAgIHZhciBrID0gYVtpXTtcblxuICAgICAgICAgICAgaWYgKGsgaW4gbykge1xuICAgICAgICAgICAgICAgIG8gPSBvW2tdO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gbztcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBBcmdzKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCIvL1xuLy8gQG5hbWUgR2FsbGVyeVxuLy8gQGRlc2NyaXB0aW9uICBQb3B1cCBib3hlcyBmb3IgZ2FsbGVyeSBpdGVtcy5cbi8vXG5IZWxzaW5nYm9yZ1ByaW1lID0gSGVsc2luZ2JvcmdQcmltZSB8fCB7fTtcbkhlbHNpbmdib3JnUHJpbWUuQ29tcG9uZW50ID0gSGVsc2luZ2JvcmdQcmltZS5Db21wb25lbnQgfHwge307XG5cbkhlbHNpbmdib3JnUHJpbWUuQ29tcG9uZW50LkdhbGxlcnlQb3B1cCA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgZnVuY3Rpb24gR2FsbGVyeVBvcHVwKCkge1xuICAgIFx0Ly9DbGljayBldmVudFxuICAgIFx0dGhpcy5jbGlja1dhdGNoZXIoKTtcbiAgICAgICAgdGhpcy5hcnJvd05hdigpO1xuXG4gICAgXHQvL1BvcHVwIGhhc2ggY2hhbmdlc1xuICAgIFx0JCh3aW5kb3cpLmJpbmQoJ2hhc2hjaGFuZ2UnLCBmdW5jdGlvbigpIHtcblx0XHRcdHRoaXMudG9nZ2xlUG9wdXBDbGFzcygpO1xuXHRcdH0uYmluZCh0aGlzKSkudHJpZ2dlcignaGFzaGNoYW5nZScpO1xuXG4gICAgICAgIC8vUHJlbG9hZCBvbiBob3ZlclxuICAgICAgICB0aGlzLnByZWxvYWRJbWFnZUFzc2V0KCk7XG4gICAgfVxuXG4gICAgR2FsbGVyeVBvcHVwLnByb3RvdHlwZS5jbGlja1dhdGNoZXIgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICAkKCcubGlnaHRib3gtdHJpZ2dlcicpLmNsaWNrKGZ1bmN0aW9uKGV2ZW50KSB7XG5cdFx0XHRldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuXG5cdFx0XHQvL0dldCBkYXRhXG5cdFx0XHR2YXIgaW1hZ2VfaHJlZiA9ICQodGhpcykuYXR0cignaHJlZicpO1xuICAgICAgICAgICAgdmFyIGltYWdlX2NhcHRpb24gPSAnJztcblxuICAgICAgICAgICAgLy9HZXQgY2FwdGlvblxuICAgICAgICAgICAgaWYgKHR5cGVvZiAkKHRoaXMpLmF0dHIoJ2RhdGEtY2FwdGlvbicpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgICAgIHZhciBpbWFnZV9jYXB0aW9uID0gJCh0aGlzKS5hdHRyKFwiZGF0YS1jYXB0aW9uXCIpO1xuICAgICAgICAgICAgfVxuXG5cdFx0XHQvL1VwZGF0ZSBoYXNoXG5cdFx0XHR3aW5kb3cubG9jYXRpb24uaGFzaCA9IFwibGlnaHRib3gtb3BlblwiO1xuXG5cdFx0XHQvL0FkZCBtYXJrdXAsIG9yIHVwZGF0ZS5cblx0XHRcdGlmICgkKCcjbGlnaHRib3gnKS5sZW5ndGggPiAwKSB7XG4gICAgICAgICAgICAgICAgJCgnI2xpZ2h0Ym94LWltYWdlJykuYXR0cignc3JjJyxpbWFnZV9ocmVmKTtcbiAgICAgICAgICAgICAgICAkKCcjbGlnaHRib3ggLmxpZ2h0Ym94LWltYWdlLXdyYXBwZXInKS5hdHRyKCdkYXRhLWNhcHRpb24nLGltYWdlX2NhcHRpb24pO1xuICAgICAgICAgICAgICAgICQoJyNsaWdodGJveCcpLmZhZGVJbigpO1xuXHRcdFx0fSBlbHNlIHtcblx0XHRcdFx0dmFyIGxpZ2h0Ym94ID1cblx0XHRcdFx0JzxkaXYgaWQ9XCJsaWdodGJveFwiPicgK1xuXHRcdFx0XHRcdCc8ZGl2IGNsYXNzPVwibGlnaHRib3gtaW1hZ2Utd3JhcHBlclwiIGRhdGEtY2FwdGlvbj1cIicgKyBpbWFnZV9jYXB0aW9uICsgJ1wiPicgK1xuXHRcdFx0XHRcdFx0JzxhIGNsYXNzPVwiYnRuLWNsb3NlXCIgaHJlZj1cIiNsaWdodGJveC1jbG9zZVwiPjwvYT4nICtcblx0XHRcdFx0XHRcdCc8aW1nIGlkPVwibGlnaHRib3gtaW1hZ2VcIiBzcmM9XCInICsgaW1hZ2VfaHJlZiArJ1wiIC8+JyArXG5cdFx0XHRcdFx0JzwvZGl2PicgK1xuXHRcdFx0XHQnPC9kaXY+JztcblxuXHRcdFx0XHQkKCdib2R5JykuYXBwZW5kKGxpZ2h0Ym94KTtcbiAgICAgICAgICAgICAgICAkKCcjbGlnaHRib3gnKS5oaWRlKCkuZmFkZUluKCk7XG5cdFx0XHR9XG5cbiAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2dhbGxlcnktYWN0aXZlJyk7XG4gICAgICAgICAgICAkKHRoaXMpLnRyaWdnZXIoJ29wZW5MaWdodEJveCcpO1xuXHRcdH0pO1xuXG5cdFx0JChkb2N1bWVudCkub24oJ2NsaWNrJywgJyNsaWdodGJveCcsIGZ1bmN0aW9uICgpIHtcblx0XHRcdCQodGhpcykuZmFkZU91dCgzMDApLmhpZGUoMClcbiAgICAgICAgICAgICQoJy5nYWxsZXJ5LWFjdGl2ZScpLnJlbW92ZUNsYXNzKCdnYWxsZXJ5LWFjdGl2ZScpO1xuXHRcdFx0d2luZG93LmxvY2F0aW9uLmhhc2ggPSAnbGlnaHRib3gtY2xvc2VkJztcbiAgICAgICAgICAgICQodGhpcykudHJpZ2dlcignY2xvc2VMaWdodEJveCcpO1xuXHRcdH0pO1xuXG4gICAgfTtcblxuICAgIEdhbGxlcnlQb3B1cC5wcm90b3R5cGUudG9nZ2xlUG9wdXBDbGFzcyA9IGZ1bmN0aW9uICgpe1xuXHQgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoJy0nLCAnJykgPT0gJyNsaWdodGJveC1vcGVuJy5yZXBsYWNlKCctJywgJycpKSB7XG5cdFx0XHQkKCdodG1sJykuYWRkQ2xhc3MoJ2dhbGxlcnktaGlkZGVuJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnZ2FsbGVyeS1oaWRkZW4nKTtcblx0XHR9XG4gICAgfTtcblxuICAgIEdhbGxlcnlQb3B1cC5wcm90b3R5cGUucHJlbG9hZEltYWdlQXNzZXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQoJy5pbWFnZS1nYWxsZXJ5IGEubGlnaHRib3gtdHJpZ2dlcicpLm9uKCdtb3VzZWVudGVyJywgZnVuY3Rpb24oKXtcbiAgICAgICAgICAgIHZhciBpbWcgPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgIGltZy5zcmMgPSBqUXVlcnkodGhpcykuYXR0cignaHJlZicpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgR2FsbGVyeVBvcHVwLnByb3RvdHlwZS5hcnJvd05hdiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gS2V5Y29kZXNcbiAgICAgICAgdmFyIGxlZnRBcnJvdyA9IDM3O1xuICAgICAgICB2YXIgcmlnaHRBcnJvdyA9IDM5O1xuXG4gICAgICAgICQod2luZG93KS5vbigna2V5dXAnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKHdpbmRvdy5sb2NhdGlvbi5oYXNoLnJlcGxhY2UoJy0nLCAnJykgIT0gJyNsaWdodGJveC1vcGVuJy5yZXBsYWNlKCctJywgJycpKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoZS53aGljaCA9PSBsZWZ0QXJyb3cpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnByZXZJbWcoKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoZS53aGljaCA9PSByaWdodEFycm93KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5uZXh0SW1nKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfTtcblxuICAgIEdhbGxlcnlQb3B1cC5wcm90b3R5cGUubmV4dEltZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIG5leHRJbWcgPSAkKCcuZ2FsbGVyeS1hY3RpdmUnKS5wYXJlbnQoJ2xpJykubmV4dCgpLmNoaWxkcmVuKCdhJyk7XG4gICAgICAgIGlmIChuZXh0SW1nLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICBuZXh0SW1nID0gJCgnLmdhbGxlcnktYWN0aXZlJykucGFyZW50cygndWwnKS5jaGlsZHJlbignbGk6Zmlyc3QtY2hpbGQnKS5jaGlsZHJlbignYScpO1xuICAgICAgICB9XG5cbiAgICAgICAgJCgnI2xpZ2h0Ym94JykudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgc2V0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICBuZXh0SW1nLnRyaWdnZXIoJ2NsaWNrJyk7XG4gICAgICAgIH0sIDEwMCk7XG4gICAgfTtcblxuICAgIEdhbGxlcnlQb3B1cC5wcm90b3R5cGUucHJldkltZyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHByZXZJbWcgPSAkKCcuZ2FsbGVyeS1hY3RpdmUnKS5wYXJlbnQoJ2xpJykucHJldigpLmNoaWxkcmVuKCdhJyk7XG4gICAgICAgIGlmIChwcmV2SW1nLmxlbmd0aCA9PSAwKSB7XG4gICAgICAgICAgICBwcmV2SW1nID0gJCgnLmdhbGxlcnktYWN0aXZlJykucGFyZW50cygndWwnKS5jaGlsZHJlbignbGk6bGFzdC1jaGlsZCcpLmNoaWxkcmVuKCdhJyk7XG4gICAgICAgIH1cblxuICAgICAgICAkKCcjbGlnaHRib3gnKS50cmlnZ2VyKCdjbGljaycpO1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHByZXZJbWcudHJpZ2dlcignY2xpY2snKTtcbiAgICAgICAgfSwgMTAwKTtcbiAgICB9O1xuXG4gICAgbmV3IEdhbGxlcnlQb3B1cCgpO1xuXG59KShqUXVlcnkpO1xuIiwiLy9cbi8vIEBuYW1lIEltYWdlIHVwbG9hZFxuLy8gQGRlc2NyaXB0aW9uXG4vL1xuSGVsc2luZ2JvcmdQcmltZSA9IEhlbHNpbmdib3JnUHJpbWUgfHwge307XG5IZWxzaW5nYm9yZ1ByaW1lLkNvbXBvbmVudCA9IEhlbHNpbmdib3JnUHJpbWUuQ29tcG9uZW50IHx8IHt9O1xuXG5IZWxzaW5nYm9yZ1ByaW1lLkNvbXBvbmVudC5JbWFnZVVwbG9hZCA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgdmFyIGVsZW1lbnRDbGFzcyA9ICcuaW1hZ2UtdXBsb2FkJztcbiAgICB2YXIgZHJhZ3MgPSAwO1xuICAgIHZhciBzZWxlY3RlZEZpbGVzID0gbmV3IEFycmF5KCk7XG4gICAgdmFyIGFsbG93ZWRGaWxlVHlwZXMgPSBbJ2ltYWdlL2pwZWcnLCAnaW1hZ2UvcG5nJywgJ2ltYWdlL2dpZiddO1xuXG4gICAgZnVuY3Rpb24gSW1hZ2VVcGxvYWQoKSB7XG4gICAgICAgIHRoaXMuaW5pdERyYWdBbmREcm9wKCk7XG4gICAgICAgIHRoaXMuaW5pdEZpbGVJbnB1dCgpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIFNlbGVjdCBmaWxlIGJ5IGJyb3dzZVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgSW1hZ2VVcGxvYWQucHJvdG90eXBlLmluaXRGaWxlSW5wdXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRpbWFnZVVwbG9hZElucHV0ID0gJChlbGVtZW50Q2xhc3MpLmZpbmQoJ2lucHV0W3R5cGU9XCJmaWxlXCJdJyk7XG5cbiAgICAgICAgJGltYWdlVXBsb2FkSW5wdXQub24oJ2NoYW5nZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgZmlsZSA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ2lucHV0W3R5cGU9XCJmaWxlXCJdJykuZ2V0KDApLmZpbGVzWzBdO1xuICAgICAgICAgICAgdGhpcy5hZGRGaWxlKCQoZS50YXJnZXQpLmNsb3Nlc3QoZWxlbWVudENsYXNzKSwgZmlsZSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIERyYWcgYW5kIGRyb3AgYSBmaWxlXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBJbWFnZVVwbG9hZC5wcm90b3R5cGUuaW5pdERyYWdBbmREcm9wID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkaW1hZ2VVcGxvYWQgPSAkKGVsZW1lbnRDbGFzcyk7XG5cbiAgICAgICAgJGltYWdlVXBsb2FkLm9uKCdkcmFnIGRyYWdzdGFydCBkcmFnZW5kIGRyYWdvdmVyIGRyYWdlbnRlciBkcmFnbGVhdmUgZHJvcCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICBlLnN0b3BQcm9wYWdhdGlvbigpO1xuXG4gICAgICAgICAgICAkaW1hZ2VVcGxvYWQucmVtb3ZlQ2xhc3MoJ2lzLWVycm9yIGlzLWVycm9yLWZpbGV0eXBlJylcbiAgICAgICAgfSlcbiAgICAgICAgLm9uKCdkcmFnZW50ZXInLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZHJhZ3MrKztcblxuICAgICAgICAgICAgaWYgKGRyYWdzID09PSAxKSB7XG4gICAgICAgICAgICAgICAgJChlLnRhcmdldCkuY2xvc2VzdChlbGVtZW50Q2xhc3MpLmFkZENsYXNzKCdpcy1kcmFnb3ZlcicpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KVxuICAgICAgICAub24oJ2RyYWdsZWF2ZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBkcmFncy0tO1xuXG4gICAgICAgICAgICBpZiAoZHJhZ3MgPT09IDApIHtcbiAgICAgICAgICAgICAgICAkKGUudGFyZ2V0KS5jbG9zZXN0KGVsZW1lbnRDbGFzcykucmVtb3ZlQ2xhc3MoJ2lzLWRyYWdvdmVyJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pXG4gICAgICAgIC5vbignZHJvcCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBkcmFncy0tO1xuICAgICAgICAgICAgaWYgKGRyYWdzID09PSAwKSB7XG4gICAgICAgICAgICAgICAgJChlLnRhcmdldCkuY2xvc2VzdChlbGVtZW50Q2xhc3MpLnJlbW92ZUNsYXNzKCdpcy1zZWxlY3RlZCBpcy1kcmFnb3ZlcicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICB0aGlzLmFkZEZpbGUoJChlLnRhcmdldCkuY2xvc2VzdChlbGVtZW50Q2xhc3MpLCBlLm9yaWdpbmFsRXZlbnQuZGF0YVRyYW5zZmVyLmZpbGVzWzBdKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogQWRkcyBhIGZpbGVcbiAgICAgKiBAcGFyYW0ge29iamVjdH0gZWxlbWVudCBUaGUgaW1hZ2UgdXBsb2FkZXIgZWxlbWVudFxuICAgICAqIEBwYXJhbSB7b2JqZWN0fSBmaWxlICAgIFRoZSBmaWxlIG9iamVjdFxuICAgICAqL1xuICAgIEltYWdlVXBsb2FkLnByb3RvdHlwZS5hZGRGaWxlID0gZnVuY3Rpb24gKGVsZW1lbnQsIGZpbGUpIHtcbiAgICAgICAgaWYgKGFsbG93ZWRGaWxlVHlwZXMuaW5kZXhPZihmaWxlLnR5cGUpID09IC0xKSB7XG4gICAgICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdpcy1lcnJvciBpcy1lcnJvci1maWxldHlwZScpO1xuICAgICAgICAgICAgZWxlbWVudC5maW5kKCcuc2VsZWN0ZWQtZmlsZScpLmh0bWwoJycpO1xuXG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgbWF4RmlsZXNpemUgPSBlbGVtZW50LmF0dHIoJ2RhdGEtbWF4LXNpemUnKSA/IGVsZW1lbnQuYXR0cignZGF0YS1tYXgtc2l6ZScpIDogMTAwMDtcbiAgICAgICAgbWF4RmlsZXNpemUgPSBwYXJzZUludChtYXhGaWxlc2l6ZSk7XG4gICAgICAgIG1heEZpbGVzaXplID0gbWF4RmlsZXNpemUudG9GaXhlZCgwKTtcbiAgICAgICAgdmFyIGZpbGVTaXplID0gcGFyc2VJbnQoZmlsZS5zaXplLzEwMDApLnRvRml4ZWQoMCk7XG5cbiAgICAgICAgaWYgKHBhcnNlSW50KGZpbGVTaXplKSA+IHBhcnNlSW50KG1heEZpbGVzaXplKSkge1xuICAgICAgICAgICAgZWxlbWVudC5hZGRDbGFzcygnaXMtZXJyb3IgaXMtZXJyb3ItZmlsZXNpemUnKTtcbiAgICAgICAgICAgIGVsZW1lbnQuZmluZCgnLnNlbGVjdGVkLWZpbGUnKS5odG1sKCcnKTtcblxuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgc2VsZWN0ZWRGaWxlcy5wdXNoKGZpbGUpO1xuXG4gICAgICAgIGlmICghZWxlbWVudC5hdHRyKCdkYXRhLXByZXZpZXctaW1hZ2UnKSkge1xuICAgICAgICAgICAgZWxlbWVudC5maW5kKCcuc2VsZWN0ZWQtZmlsZScpLmh0bWwoZmlsZS5uYW1lKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciByZWFkZXIgPSBuZXcgRmlsZVJlYWRlcigpO1xuICAgICAgICByZWFkZXIucmVhZEFzRGF0YVVSTChmaWxlKTtcblxuICAgICAgICByZWFkZXIuYWRkRXZlbnRMaXN0ZW5lcignbG9hZCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgaW1hZ2UgPSBlLnRhcmdldDtcbiAgICAgICAgICAgIHZhciBtYXhfaW1hZ2VzID0gZWxlbWVudC5hdHRyKCdkYXRhLW1heC1maWxlcycpO1xuXG5cbiAgICAgICAgICAgIGlmIChtYXhfaW1hZ2VzICYmIHNlbGVjdGVkRmlsZXMubGVuZ3RoID4gbWF4X2ltYWdlcykge1xuICAgICAgICAgICAgICAgIHNlbGVjdGVkRmlsZXMgPSBzZWxlY3RlZEZpbGVzLnNsaWNlKDEpO1xuICAgICAgICAgICAgICAgIGVsZW1lbnQuZmluZCgnaW5wdXRbbmFtZT1cImltYWdlX3VwbG9hZGVyX2ZpbGVbXVwiXTpmaXJzdCcpLnJlbW92ZSgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBlbGVtZW50LmFwcGVuZCgnPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiaW1hZ2VfdXBsb2FkZXJfZmlsZVtdXCIgcmVhZC1vbmx5PicpO1xuICAgICAgICAgICAgZWxlbWVudC5maW5kKCdpbnB1dFtuYW1lPVwiaW1hZ2VfdXBsb2FkZXJfZmlsZVtdXCJdOmxhc3QnKS52YWwoaW1hZ2UucmVzdWx0KTtcblxuICAgICAgICAgICAgaWYgKGVsZW1lbnQuYXR0cignZGF0YS1wcmV2aWV3LWltYWdlJykpIHtcbiAgICAgICAgICAgICAgICBlbGVtZW50LmZpbmQoJy5zZWxlY3RlZC1maWxlJykuY3NzKCdiYWNrZ3JvdW5kSW1hZ2UnLCAndXJsKFxcJycgKyBpbWFnZS5yZXN1bHQgKyAnXFwnKScpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcblxuICAgICAgICBlbGVtZW50LmFkZENsYXNzKCdpcy1zZWxlY3RlZCcpO1xuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IEltYWdlVXBsb2FkKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCIvL1xuLy8gQG5hbWUgTW9kYWxcbi8vIEBkZXNjcmlwdGlvbiAgU2hvdyBhY2NvZHJpb24gZHJvcGRvd24sIG1ha2UgbGlua2FibGUgYnkgdXBkYXRpbmcgYWRyZXNzIGJhclxuLy9cbkhlbHNpbmdib3JnUHJpbWUgPSBIZWxzaW5nYm9yZ1ByaW1lIHx8IHt9O1xuSGVsc2luZ2JvcmdQcmltZS5Db21wb25lbnQgPSBIZWxzaW5nYm9yZ1ByaW1lLkNvbXBvbmVudCB8fCB7fTtcbkhlbHNpbmdib3JnUHJpbWUuQ29tcG9uZW50LlRhZ01hbmFnZXIgPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIHZhciB0eXBpbmdUaW1lcjtcblxuICAgIGZ1bmN0aW9uIFRhZ01hbmFnZXIoKSB7XG4gICAgICAgICQoJy50YWctbWFuYWdlcicpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgICAgICB0aGlzLmluaXQoZWxlbWVudCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJy50YWctbWFuYWdlciAudGFnLW1hbmFnZXItc2VsZWN0ZWQgYnV0dG9uW2RhdGEtYWN0aW9uPVwicmVtb3ZlXCJdJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgdmFyIHRhZ0VsZW1lbnQgPSAkKGUudGFyZ2V0KS5jbG9zZXN0KCdsaScpO1xuICAgICAgICAgICAgdGhpcy5yZW1vdmVUYWcodGFnRWxlbWVudCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogSW5pdGlhbGl6ZSB0YWcgbWFuYWdlclxuICAgICAqIEBwYXJhbSAge2VsZW1lbnR9IGVsZW1lbnQgVGhlIHRhZyBtYW5hZ2VyIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIFRhZ01hbmFnZXIucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgIHZhciAkZWxlbWVudCA9ICQoZWxlbWVudCk7XG4gICAgICAgIHZhciAkYnV0dG9uID0gJGVsZW1lbnQuZmluZCgnLnRhZy1tYW5hZ2VyLWlucHV0IFtuYW1lPVwiYWRkLXRhZ1wiXScpO1xuICAgICAgICB2YXIgJGlucHV0ID0gJGVsZW1lbnQuZmluZCgnLnRhZy1tYW5hZ2VyLWlucHV0IGlucHV0W3R5cGU9XCJ0ZXh0XCJdJyk7XG5cbiAgICAgICAgJGJ1dHRvbi5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdmFyIHRhZyA9ICRpbnB1dC52YWwoKTtcbiAgICAgICAgICAgIHZhciB0YWdzID0gdGFnLnNwbGl0KCcsJyk7XG5cbiAgICAgICAgICAgICQuZWFjaCh0YWdzLCBmdW5jdGlvbiAoaW5kZXgsIHRhZykge1xuICAgICAgICAgICAgICAgIHRoaXMuYWRkVGFnKGVsZW1lbnQsIHRhZy50cmltKCkpO1xuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICRpbnB1dC5vbigna2V5cHJlc3MnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgaWYgKGUua2V5Q29kZSAhPT0gMTMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHZhciBlbGVtZW50ID0gJChlLnRhcmdldCkucGFyZW50cygnLnRhZy1tYW5hZ2VyJylbMF1cbiAgICAgICAgICAgIHZhciB0YWcgPSAkaW5wdXQudmFsKCk7XG4gICAgICAgICAgICB2YXIgdGFncyA9IHRhZy5zcGxpdCgnLCcpO1xuXG4gICAgICAgICAgICAkLmVhY2godGFncywgZnVuY3Rpb24gKGluZGV4LCB0YWcpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmFkZFRhZyhlbGVtZW50LCB0YWcudHJpbSgpKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgaWYgKCRlbGVtZW50LmF0dHIoJ2RhdGEtd3AtYWpheC1hY3Rpb24nKSAmJiB0eXBlb2YgYWpheHVybCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICRpbnB1dC5vbigna2V5dXAnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGNsZWFyVGltZW91dCh0eXBpbmdUaW1lcik7XG5cbiAgICAgICAgICAgICAgICB0eXBpbmdUaW1lciA9IHNldFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICB0aGlzLmF1dG9jb21wbGV0ZVF1ZXJ5KGVsZW1lbnQpO1xuICAgICAgICAgICAgICAgIH0uYmluZCh0aGlzKSwgMzAwKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgICQoJy50YWctbWFuYWdlcicpLm9uKCdjbGljaycsICcuYXV0b2NvbXBsZXRlIGJ1dHRvbicsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHZhciBlbGVtZW50ID0gJChlLnRhcmdldCkuY2xvc2VzdCgnYnV0dG9uJykucGFyZW50cygnLnRhZy1tYW5hZ2VyJyk7XG4gICAgICAgICAgICAgICAgdmFyIHRhZyA9ICQoZS50YXJnZXQpLmNsb3Nlc3QoJ2J1dHRvbicpLnZhbCgpO1xuICAgICAgICAgICAgICAgIHZhciB0YWdzID0gdGFnLnNwbGl0KCcsJyk7XG5cbiAgICAgICAgICAgICAgICAkLmVhY2godGFncywgZnVuY3Rpb24gKGluZGV4LCB0YWcpIHtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5hZGRUYWcoZWxlbWVudCwgdGFnLnRyaW0oKSk7XG4gICAgICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRG8gYWpheCBhdXRvY29tcGxldGUgcmVxdWVzdFxuICAgICAqIEBwYXJhbSAge2VsZW1lbnR9IGVsZW1lbnQgVGhlIHRhZyBtYW5hZ2VyIGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIFRhZ01hbmFnZXIucHJvdG90eXBlLmF1dG9jb21wbGV0ZVF1ZXJ5ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICB2YXIgJGVsZW1lbnQgPSAkKGVsZW1lbnQpO1xuICAgICAgICB2YXIgJGlucHV0ID0gJGVsZW1lbnQuZmluZCgnLnRhZy1tYW5hZ2VyLWlucHV0IGlucHV0W3R5cGU9XCJ0ZXh0XCJdJyk7XG5cbiAgICAgICAgLy8gUmV0dXJuIGlmIG5vIHNlYXJjaCB2YWx1ZVxuICAgICAgICBpZiAoJGlucHV0LnZhbCgpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgY2xlYXJUaW1lb3V0KHR5cGluZ1RpbWVyKTtcbiAgICAgICAgICAgICRlbGVtZW50LmZpbmQoJy5hdXRvY29tcGxldGUnKS5yZW1vdmUoKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBhamF4QWN0aW9uID0gJGVsZW1lbnQuYXR0cignZGF0YS13cC1hamF4LWFjdGlvbicpO1xuICAgICAgICB2YXIgZGF0YSA9IHtcbiAgICAgICAgICAgIGFjdGlvbjogYWpheEFjdGlvbixcbiAgICAgICAgICAgIHE6ICRpbnB1dC52YWwoKVxuICAgICAgICB9O1xuXG4gICAgICAgICQucG9zdChhamF4dXJsLCBkYXRhLCBmdW5jdGlvbiAocmVzKSB7XG4gICAgICAgICAgICBpZiAocmVzLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgdGhpcy5zaG93QXV0b2NvbXBsZXRlKGVsZW1lbnQsIHJlcyk7XG4gICAgICAgIH0uYmluZCh0aGlzKSwgJ0pTT04nKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogU2hvdyB0aGUgYXV0b2NvbXBsZXRlIGVsZW1lbnRcbiAgICAgKiBAcGFyYW0gIHtlbGVtZW50fSBlbGVtZW50IFRoZSB0YWcgbWFuYWdlciBlbGVlbWVudFxuICAgICAqIEBwYXJhbSAge2FycmF5fSBpdGVtcyAgICAgVGhlIGF1dG9jb21wbGV0ZSBpdGVtc1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgVGFnTWFuYWdlci5wcm90b3R5cGUuc2hvd0F1dG9jb21wbGV0ZSA9IGZ1bmN0aW9uKGVsZW1lbnQsIGl0ZW1zKSB7XG4gICAgICAgIHZhciAkZWxlbWVudCA9ICQoZWxlbWVudCk7XG4gICAgICAgICRlbGVtZW50LmZpbmQoJy5hdXRvY29tcGxldGUnKS5yZW1vdmUoKTtcblxuICAgICAgICB2YXIgJGF1dG9jb21wbGV0ZSA9ICQoJzxkaXYgY2xhc3M9XCJhdXRvY29tcGxldGUgZ3V0dGVyIGd1dHRlci1zbVwiPjx1bD48L3VsPjwvZGl2PicpO1xuXG4gICAgICAgICQuZWFjaChpdGVtcywgZnVuY3Rpb24gKGluZGV4LCBpdGVtKSB7XG4gICAgICAgICAgICAkYXV0b2NvbXBsZXRlLmZpbmQoJ3VsJykuYXBwZW5kKCc8bGk+PHNwYW4gY2xhc3M9XCJ0YWcgbm8tcGFkZGluZ1wiPjxidXR0b24gdmFsdWU9XCInICsgaXRlbSArICdcIj4nICsgaXRlbSArICc8L2J1dHRvbj48L3NwYW4+PC9saT4nKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJGVsZW1lbnQuZmluZCgnLnRhZy1tYW5hZ2VyLWlucHV0JykuYXBwZW5kKCRhdXRvY29tcGxldGUpO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBBZGRzIGEgdGFnIHRvIHRoZSB0YWcgbWFuYWdlciBzZWxlY3RlZCB0YWdzXG4gICAgICogQHBhcmFtIHtlbGVtZW50fSBlbGVtZW50IFRoZSB0YWcgbWFuYWdlciBlbGVtZW50XG4gICAgICogQHBhcmFtIHtzdHJpbmd9IHRhZyAgICAgIFRoZSB0YWcgbmFtZVxuICAgICAqL1xuICAgIFRhZ01hbmFnZXIucHJvdG90eXBlLmFkZFRhZyA9IGZ1bmN0aW9uKGVsZW1lbnQsIHRhZykge1xuICAgICAgICBpZiAodGFnLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KTtcbiAgICAgICAgdmFyIGlucHV0bmFtZSA9ICQoZWxlbWVudCkuYXR0cignZGF0YS1pbnB1dC1uYW1lJyk7XG4gICAgICAgICRlbGVtZW50LmZpbmQoJy50YWctbWFuYWdlci1zZWxlY3RlZCB1bCcpLmFwcGVuZCgnPGxpPlxcXG4gICAgICAgICAgICA8c3BhbiBjbGFzcz1cInRhZ1wiPlxcXG4gICAgICAgICAgICAgICAgPGJ1dHRvbiBjbGFzcz1cImJ0biBidG4tcGxhaW5cIiBkYXRhLWFjdGlvbj1cInJlbW92ZVwiPiZ0aW1lczs8L2J1dHRvbj5cXFxuICAgICAgICAgICAgICAgICcgKyB0YWcgKyAnXFxcbiAgICAgICAgICAgIDwvc3Bhbj5cXFxuICAgICAgICAgICAgPGlucHV0IHR5cGU9XCJoaWRkZW5cIiBuYW1lPVwiJyArIGlucHV0bmFtZSArICdbXVwiIHZhbHVlPVwiJyArIHRhZyArICdcIj5cXFxuICAgICAgICA8L2xpPicpO1xuXG4gICAgICAgICRlbGVtZW50LmZpbmQoJy50YWctbWFuYWdlci1pbnB1dCBpbnB1dFt0eXBlPVwidGV4dFwiXScpLnZhbCgnJyk7XG4gICAgICAgICRlbGVtZW50LmZpbmQoJy5hdXRvY29tcGxldGUnKS5yZW1vdmUoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUmVtb3ZlcyBhIHNlbGVjdGVkIHRhZ1xuICAgICAqIEBwYXJhbSAge2VsZW1lbnR9IHRhZ0VsZW1lbnQgVGhlIHRhZyB0byByZW1vdmVcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIFRhZ01hbmFnZXIucHJvdG90eXBlLnJlbW92ZVRhZyA9IGZ1bmN0aW9uKHRhZ0VsZW1lbnQpIHtcbiAgICAgICAgJCh0YWdFbGVtZW50KS5yZW1vdmUoKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBUYWdNYW5hZ2VyKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCIvL1xuLy8gQG5hbWUgTW9kYWxcbi8vIEBkZXNjcmlwdGlvbiAgU2hvdyBhY2NvZHJpb24gZHJvcGRvd24sIG1ha2UgbGlua2FibGUgYnkgdXBkYXRpbmcgYWRyZXNzIGJhclxuLy9cbkhlbHNpbmdib3JnUHJpbWUgPSBIZWxzaW5nYm9yZ1ByaW1lIHx8IHt9O1xuSGVsc2luZ2JvcmdQcmltZS5Db21wb25lbnQgPSBIZWxzaW5nYm9yZ1ByaW1lLkNvbXBvbmVudCB8fCB7fTtcblxuSGVsc2luZ2JvcmdQcmltZS5Db21wb25lbnQuQWNjb3JkaW9uID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICBmdW5jdGlvbiBBY2NvcmRpb24oKSB7XG4gICAgICAgIHRoaXMuaW5pdCgpO1xuICAgIH1cblxuICAgIEFjY29yZGlvbi5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgXG4gICAgICAgIHZhciBjbGljayA9IGZhbHNlO1xuXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdmb2N1cycsICcuYWNjb3JkaW9uLXRvZ2dsZScsIGZ1bmN0aW9uKGUpIHsgXG4gICAgICAgICAgICAgICAgICAgICAgICBcbiAgICAgICAgICAgIGlmKCFjbGljaylcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnNob3coKTtcbiAgICAgICAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKFwibWludXNcIik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGNsaWNrID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgXG4gICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIFxuICAgICAgICAgICAgICAgIFxuICAgICAgICAkKGRvY3VtZW50KS5vbignbW91c2Vkb3duJywgJy5hY2NvcmRpb24tdG9nZ2xlJywgZnVuY3Rpb24oZSkgeyBcblxuICAgICAgICAgICAgY2xpY2sgPSB0cnVlO1xuXG4gICAgICAgICAgICAkKHRoaXMpLnBhcmVudCgpLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLnRvZ2dsZSgpO1xuICAgICAgICAgICAgXG4gICAgICAgICAgICAkKHRoaXMpLnRvZ2dsZUNsYXNzKFwibWludXNcIik7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQodGhpcykuYmx1cigpO1xuXG4gICAgICAgIH0pO1xuXG4gICAgICAgICQoJy5hY2NvcmRpb24tc2VhcmNoIGlucHV0Jykub24oJ2lucHV0JywgZnVuY3Rpb24gKGUpIHtcblxuICAgICAgICAgICAgdmFyIHdoZXJlID0gJChlLnRhcmdldCkucGFyZW50cygnLmFjY29yZGlvbicpO1xuICAgICAgICAgICAgdmFyIHdoYXQgPSAkKGUudGFyZ2V0KS52YWwoKTtcblxuICAgICAgICAgICAgdGhpcy5maWx0ZXIod2hhdCwgd2hlcmUpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH07XG5cbiAgICBBY2NvcmRpb24ucHJvdG90eXBlLmZpbHRlciA9IGZ1bmN0aW9uKHdoYXQsIHdoZXJlKSB7XG4gICAgICAgIHdoZXJlLmZpbmQoJy5hY2NvcmRpb24tc2VjdGlvbicpLmZpbmQoJy5hY2NvcmRpb24tY29udGVudCcpLmhpZGUoKTtcbiAgICAgICAgd2hlcmUuZmluZCgnLmFjY29yZGlvbi1zZWN0aW9uJykuZmluZCgnLmFjY29yZGlvbi10b2dnbGUnKS5yZW1vdmVDbGFzcygnbWludXMnKTtcblxuICAgICAgICBpZih3aGF0ICE9ICcnKVxuICAgICAgICB7XG4gICAgICAgICAgICB3aGVyZS5maW5kKCcuYWNjb3JkaW9uLXNlY3Rpb246aWNvbnRhaW5zKCcgKyB3aGF0ICsgJyknKS5maW5kKCcuYWNjb3JkaW9uLWNvbnRlbnQnKS5zaG93KCk7XG5cbiAgICAgICAgICAgIGlmKCF3aGVyZS5maW5kKCcuYWNjb3JkaW9uLXNlY3Rpb246aWNvbnRhaW5zKCcgKyB3aGF0ICsgJyknKS5maW5kKCcuYWNjb3JkaW9uLXRvZ2dsZScpLmhhc0NsYXNzKCdtaW51cycpKXtcbiAgICAgICAgICAgICAgICB3aGVyZS5maW5kKCcuYWNjb3JkaW9uLXNlY3Rpb246aWNvbnRhaW5zKCcgKyB3aGF0ICsgJyknKS5maW5kKCcuYWNjb3JkaW9uLXRvZ2dsZScpLmFkZENsYXNzKCdtaW51cycpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIFxuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IEFjY29yZGlvbigpO1xuXG59KShqUXVlcnkpO1xuIiwiLy9cbi8vIEBuYW1lIEZpbGUgc2VsZWN0b3Jcbi8vIEBkZXNjcmlwdGlvblxuLy9cbkhlbHNpbmdib3JnUHJpbWUgPSBIZWxzaW5nYm9yZ1ByaW1lIHx8IHt9O1xuSGVsc2luZ2JvcmdQcmltZS5Db21wb25lbnQgPSBIZWxzaW5nYm9yZ1ByaW1lLkNvbXBvbmVudCB8fCB7fTtcblxuSGVsc2luZ2JvcmdQcmltZS5Db21wb25lbnQuQXVkaW9QbGF5ZXIgPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIHZhciBudW1iZXJUb3RhbE9mVGlja3MgPSAxMDAwO1xuXG4gICAgZnVuY3Rpb24gQXVkaW9QbGF5ZXIoKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlUGxheVBhdXNlKCk7XG5cbiAgICAgICAgJChcIi5hdWRpby1wbGF5ZXJcIikuZWFjaChmdW5jdGlvbihpbmRleCwgcGxheWVyKXtcblxuICAgICAgICAgICAgLy9TZXR1cCBzZWVrYmFyXG4gICAgICAgICAgICAkKFwiYXVkaW9cIiwgcGxheWVyKS5nZXQoMCkuYWRkRXZlbnRMaXN0ZW5lcignbG9hZGVkbWV0YWRhdGEnLCBmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRQbGF5ZXIoJChwbGF5ZXIpLmNsb3Nlc3QoXCIuYXVkaW8tcGxheWVyXCIpKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgIC8vTG9jayBzZWVrZXJcbiAgICAgICAgICAgICQoXCIuYWN0aW9uLXNlZWtcIiwgcGxheWVyKS5nZXQoMCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2Vkb3duJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5sb2NrU2Vla2VyKHBsYXllcik7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICAvL0hhbmRsZSByZXNlZWtcbiAgICAgICAgICAgICQoXCIuYWN0aW9uLXNlZWtcIiwgcGxheWVyKS5nZXQoMCkuYWRkRXZlbnRMaXN0ZW5lcignbW91c2V1cCcsIGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlUmVTZWVrKHBsYXllcik7XG4gICAgICAgICAgICAgICAgdGhpcy51bmxvY2tTZWVrZXIocGxheWVyKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgIC8vTW92ZSBzZWVrZXJcbiAgICAgICAgICAgICQoXCJhdWRpb1wiLCBwbGF5ZXIpLmdldCgwKS5hZGRFdmVudExpc3RlbmVyKCd0aW1ldXBkYXRlJywgZnVuY3Rpb24oKSB7XG4gICAgICAgICAgICAgICAgdGhpcy51cGRhdGVTZWVrZXJTdGF0dXMocGxheWVyKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgIH1cblxuICAgIEF1ZGlvUGxheWVyLnByb3RvdHlwZS51cGRhdGVTZWVrZXJTdGF0dXMgPSBmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgIGlmKCEkKHBsYXllcikuaGFzQ2xhc3MoXCJsb2NrZWRcIikpIHtcbiAgICAgICAgICAgICQoXCIuYWN0aW9uLXNlZWtcIiwgcGxheWVyKS52YWwoKCQoXCJhdWRpb1wiLCBwbGF5ZXIpLmdldCgwKS5jdXJyZW50VGltZS8kKFwiYXVkaW9cIiwgcGxheWVyKS5nZXQoMCkuZHVyYXRpb24pICogMTAwKTtcbiAgICAgICAgfVxuICAgIH07XG5cbiAgICBBdWRpb1BsYXllci5wcm90b3R5cGUuaW5pdFBsYXllciA9IGZ1bmN0aW9uIChwbGF5ZXIpIHtcbiAgICAgICAgJChwbGF5ZXIpLmFkZENsYXNzKFwicmVhZHlcIik7XG4gICAgfTtcblxuICAgIEF1ZGlvUGxheWVyLnByb3RvdHlwZS5sb2NrU2Vla2VyID0gZnVuY3Rpb24gKHBsYXllcikge1xuICAgICAgICAkKHBsYXllcikuYWRkQ2xhc3MoXCJsb2NrZWRcIik7XG4gICAgfTtcblxuICAgIEF1ZGlvUGxheWVyLnByb3RvdHlwZS51bmxvY2tTZWVrZXIgPSBmdW5jdGlvbiAocGxheWVyKSB7XG4gICAgICAgICQocGxheWVyKS5yZW1vdmVDbGFzcyhcImxvY2tlZFwiKTtcbiAgICB9O1xuXG4gICAgQXVkaW9QbGF5ZXIucHJvdG90eXBlLmhhbmRsZVJlU2VlayA9IGZ1bmN0aW9uIChwbGF5ZXIpIHtcblxuICAgICAgICAkKFwiYXVkaW9cIiwgcGxheWVyKS5nZXQoMCkuY3VycmVudFRpbWUgPSAkKFwiYXVkaW9cIiwgcGxheWVyKS5nZXQoMCkuZHVyYXRpb24gKiAoJChcIi5hY3Rpb24tc2Vla1wiLCBwbGF5ZXIpLnZhbCgpLzEwMCk7XG5cbiAgICAgICAgaWYoJChcImF1ZGlvXCIsIHBsYXllcikuZ2V0KDApLmN1cnJlbnRUaW1lICE9ICQoXCJhdWRpb1wiLCBwbGF5ZXIpLmdldCgwKS5kdXJhdGlvbikge1xuICAgICAgICAgICAgdGhpcy5wbGF5KHBsYXllcik7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0aGlzLnBhdXNlKHBsYXllcik7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQXVkaW9QbGF5ZXIucHJvdG90eXBlLnBsYXkgPSBmdW5jdGlvbiAocGxheWVyKSB7XG5cbiAgICAgICAgLy9TdG9wIGFsbCBwbGF5ZXJzXG4gICAgICAgIHRoaXMucGF1c2VBbGwoKTtcblxuICAgICAgICAvL1BsYXkgYW5kIHZpc2F1bGx5IGluZGljYXRlIHBsYXliYWNrXG4gICAgICAgICQoXCJhdWRpb1wiLCAkKHBsYXllcikuY2xvc2VzdChcIi5hdWRpby1wbGF5ZXJcIikpLmdldCgwKS5wbGF5KCk7XG4gICAgICAgICQocGxheWVyKS5jbG9zZXN0KFwiLmF1ZGlvLXBsYXllclwiKS5hZGRDbGFzcyhcInBsYXlpbmdcIik7XG4gICAgfTtcblxuICAgIEF1ZGlvUGxheWVyLnByb3RvdHlwZS5wYXVzZSA9IGZ1bmN0aW9uIChwbGF5ZXIpIHtcblxuICAgICAgICAvL1N0b3AgYW5kIHJlbW92ZSBwbGF5YmFjayBjbGFzc1xuICAgICAgICAkKFwiYXVkaW9cIiwgJChwbGF5ZXIpLmNsb3Nlc3QoXCIuYXVkaW8tcGxheWVyXCIpKS5nZXQoMCkucGF1c2UoKTtcbiAgICAgICAgJChwbGF5ZXIpLmNsb3Nlc3QoXCIuYXVkaW8tcGxheWVyXCIpLnJlbW92ZUNsYXNzKFwicGxheWluZ1wiKTtcbiAgICB9O1xuXG4gICAgQXVkaW9QbGF5ZXIucHJvdG90eXBlLnBhdXNlQWxsID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkKFwiLmF1ZGlvLXBsYXllclwiKS5lYWNoKGZ1bmN0aW9uKGluZGV4LCBwbGF5ZXIpe1xuICAgICAgICAgICAgdGhpcy5wYXVzZShwbGF5ZXIpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH07XG5cbiAgICBBdWRpb1BsYXllci5wcm90b3R5cGUuaGFuZGxlUGxheVBhdXNlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICQoXCIuYXVkaW8tcGxheWVyIC50b2dnbGUtYWN0aW9uLXBsYXlcIikuY2xpY2soZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgdGhpcy5wbGF5KCQoZXZlbnQudGFyZ2V0KSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgJChcIi5hdWRpby1wbGF5ZXIgLnRvZ2dsZS1hY3Rpb24tcGF1c2VcIikuY2xpY2soZnVuY3Rpb24oZXZlbnQpe1xuICAgICAgICAgICAgdGhpcy5wYXVzZSgkKGV2ZW50LnRhcmdldCkpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IEF1ZGlvUGxheWVyKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCIiLCIvL1xuLy8gQG5hbWUgTW9kYWxcbi8vIEBkZXNjcmlwdGlvbiAgU2hvdyBhY2NvZHJpb24gZHJvcGRvd24sIG1ha2UgbGlua2FibGUgYnkgdXBkYXRpbmcgYWRyZXNzIGJhclxuLy9cbkhlbHNpbmdib3JnUHJpbWUgPSBIZWxzaW5nYm9yZ1ByaW1lIHx8IHt9O1xuSGVsc2luZ2JvcmdQcmltZS5Db21wb25lbnQgPSBIZWxzaW5nYm9yZ1ByaW1lLkNvbXBvbmVudCB8fCB7fTtcblxuSGVsc2luZ2JvcmdQcmltZS5Db21wb25lbnQuRHJvcGRvd24gPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIGZ1bmN0aW9uIERyb3Bkb3duKCkge1xuICAgICAgICB0aGlzLmhhbmRsZUV2ZW50cygpO1xuICAgICAgICB0aGlzLmpzRHJvcERvd24oKTtcbiAgICB9XG5cbiAgICBEcm9wZG93bi5wcm90b3R5cGUuanNEcm9wRG93biA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJChkb2N1bWVudCkub24oJ2NsaWNrJywgJCgnLmpzLWRyb3Bkb3duX190b2dnbGUnKSwgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgJChlLnRhcmdldCkuY2xvc2VzdCgnLmpzLWRyb3Bkb3duJykudG9nZ2xlQ2xhc3MoJ2lzLW9wZW4nKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIERyb3Bkb3duLnByb3RvdHlwZS5oYW5kbGVFdmVudHMgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICQoJ1tkYXRhLWRyb3Bkb3duXScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG5cbiAgICAgICAgICAgIHZhciB0YXJnZXRFbGVtZW50ID0gJCh0aGlzKS5hdHRyKCdkYXRhLWRyb3Bkb3duJyk7XG4gICAgICAgICAgICAkKHRhcmdldEVsZW1lbnQpLnRvZ2dsZUNsYXNzKCdkcm9wZG93bi10YXJnZXQtb3BlbicpO1xuICAgICAgICAgICAgJCh0aGlzKS50b2dnbGVDbGFzcygnZHJvcGRvd24tb3BlbicpO1xuICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5maW5kKHRhcmdldEVsZW1lbnQpLnRvZ2dsZSgpO1xuICAgICAgICAgICAgJCh0aGlzKS5wYXJlbnQoKS5maW5kKHRhcmdldEVsZW1lbnQpLmZpbmQoJ2lucHV0W2RhdGEtZHJvcGRvd24tZm9jdXNdJykuZm9jdXMoKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJCgnYm9keScpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICB2YXIgJHRhcmdldCA9ICQoZS50YXJnZXQpO1xuXG4gICAgICAgICAgICBpZiAoJHRhcmdldC5jbG9zZXN0KCcuZHJvcGRvd24tdGFyZ2V0LW9wZW4nKS5sZW5ndGggfHzCoCR0YXJnZXQuY2xvc2VzdCgnW2RhdGEtZHJvcGRvd25dJykubGVuZ3RoIHx8wqAkdGFyZ2V0LmNsb3Nlc3QoJy5iYWNrZHJvcCcpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJCgnW2RhdGEtZHJvcGRvd25dLmRyb3Bkb3duLW9wZW4nKS5yZW1vdmVDbGFzcygnZHJvcGRvd24tb3BlbicpO1xuICAgICAgICAgICAgJCgnLmRyb3Bkb3duLXRhcmdldC1vcGVuJykudG9nZ2xlKCk7XG4gICAgICAgICAgICAkKCcuZHJvcGRvd24tdGFyZ2V0LW9wZW4nKS5yZW1vdmVDbGFzcygnZHJvcGRvd24tdGFyZ2V0LW9wZW4gaXMtaGlnaGxpZ2h0ZWQnKTtcbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgRHJvcGRvd24oKTtcblxufSkoalF1ZXJ5KTtcbiIsIi8vXG4vLyBAbmFtZSBGaWxlIHNlbGVjdG9yXG4vLyBAZGVzY3JpcHRpb25cbi8vXG5IZWxzaW5nYm9yZ1ByaW1lID0gSGVsc2luZ2JvcmdQcmltZSB8fCB7fTtcbkhlbHNpbmdib3JnUHJpbWUuQ29tcG9uZW50ID0gSGVsc2luZ2JvcmdQcmltZS5Db21wb25lbnQgfHwge307XG5cbkhlbHNpbmdib3JnUHJpbWUuQ29tcG9uZW50LkZpbGUgPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIGZ1bmN0aW9uIEZpbGUoKSB7XG4gICAgICAgIHRoaXMuaGFuZGxlRXZlbnRzKCk7XG4gICAgfVxuXG4gICAgRmlsZS5wcm90b3R5cGUuaGFuZGxlRXZlbnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZigkKCcuaW5wdXQtZmlsZSBpbnB1dFt0eXBlPVwiZmlsZVwiXScpLmxlbmd0aCkge1xuICAgICAgICAgICAgJChkb2N1bWVudCkub24oJ2NoYW5nZScsICcuaW5wdXQtZmlsZSBpbnB1dFt0eXBlPVwiZmlsZVwiXScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5zZXRTZWxlY3RlZChlLnRhcmdldCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICAgICAkKCcuaW5wdXQtZmlsZSBpbnB1dFt0eXBlPVwiZmlsZVwiXScpLnRyaWdnZXIoJ2NoYW5nZScpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEZpbGUucHJvdG90eXBlLnNldFNlbGVjdGVkID0gZnVuY3Rpb24oZmlsZWlucHV0KSB7XG5cbiAgICAgICAgaWYoJChmaWxlaW5wdXQpLmxlbmd0aCkge1xuICAgICAgICAgICAgdmFyICRmaWxlaW5wdXQgPSAkKGZpbGVpbnB1dCk7XG4gICAgICAgICAgICB2YXIgJGxhYmVsID0gJGZpbGVpbnB1dC5wYXJlbnRzKCdsYWJlbC5pbnB1dC1maWxlJyk7XG4gICAgICAgICAgICB2YXIgJGR1cGxpY2F0ZSA9ICRsYWJlbC5wYXJlbnQoJ2xpJykuY2xvbmUoKS5maW5kKCdpbnB1dCcpLnZhbCgnJykuZW5kKCk7XG5cbiAgICAgICAgICAgIGlmICgkZmlsZWlucHV0LnZhbCgpKSB7XG4gICAgICAgICAgICAgICAgJGxhYmVsLmZpbmQoJy5pbnB1dC1maWxlLXNlbGVjdGVkJykudGV4dCgkZmlsZWlucHV0LnZhbCgpKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgaWYgKCRmaWxlaW5wdXQudmFsKCkgJiYgJGxhYmVsLnBhcmVudCgnbGknKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgICB2YXIgbWF4ID0gJGxhYmVsLnBhcmVudCgnbGknKS5wYXJlbnQoJ3VsJykuYXR0cignZGF0YS1tYXgnKTtcblxuICAgICAgICAgICAgICAgIGlmICgkbGFiZWwucGFyZW50KCdsaScpLnBhcmVudCgndWwnKS5maW5kKCdsaScpLmxlbmd0aCA8IG1heCB8fMKgbWF4IDwgMCkge1xuICAgICAgICAgICAgICAgICAgICAkbGFiZWwucGFyZW50cygndWwnKS5hcHBlbmQoJGR1cGxpY2F0ZSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgRmlsZSgpO1xuXG59KShqUXVlcnkpO1xuIiwiLy9cbi8vIEBuYW1lIFNsaWRlclxuLy8gQGRlc2NyaXB0aW9uICBTbGlkaW5nIGNvbnRlbnRcbi8vXG5IZWxzaW5nYm9yZ1ByaW1lID0gSGVsc2luZ2JvcmdQcmltZSB8fCB7fTtcbkhlbHNpbmdib3JnUHJpbWUuQ29tcG9uZW50ID0gSGVsc2luZ2JvcmdQcmltZS5Db21wb25lbnQgfHwge307XG5cbkhlbHNpbmdib3JnUHJpbWUuQ29tcG9uZW50LlNsaWRlciA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgdmFyIGF1dG9zbGlkZUludGVydmFscyA9IFtdO1xuXG4gICAgZnVuY3Rpb24gU2xpZGVyKCkge1xuICAgICAgICB0aGlzLnByZWxvYWRJbWFnZSgpO1xuICAgICAgICB0aGlzLnRyaWdnZXJBdXRvcGxheSgpO1xuICAgICAgICB0aGlzLnBhdXNlQW5kUGxheSgpO1xuICAgICAgICBcbiAgICAgICAgJCgnLnNsaWRlcicpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgICAgICB2YXIgJHNsaWRlciA9ICQoZWxlbWVudCk7XG5cbiAgICAgICAgICAgIHRoaXMuZGV0ZWN0SWZJc0NvbGxhcHNlZChlbGVtZW50KTtcblxuICAgICAgICAgICAgaWYgKCRzbGlkZXIuZmluZCgnW2RhdGEtZmxpY2tpdHldJykpIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICRzbGlkZXIuZmxpY2tpdHkoe1xuICAgICAgICAgICAgICAgIGNlbGxTZWxlY3RvcjogJy5zbGlkZScsXG4gICAgICAgICAgICAgICAgY2VsbEFsaWduOiAnY2VudGVyJyxcbiAgICAgICAgICAgICAgICBzZXRHYWxsZXJ5U2l6ZTogZmFsc2UsXG4gICAgICAgICAgICAgICAgd3JhcEFyb3VuZDogdHJ1ZSxcbiAgICAgICAgICAgIH0pO1xuXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgJCh3aW5kb3cpLnJlc2l6ZShmdW5jdGlvbigpIHtcbiAgICAgICAgICAgICQoJy5zbGlkZXInKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgICAgICAgIHRoaXMuZGV0ZWN0SWZJc0NvbGxhcHNlZChlbGVtZW50KTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgICAgIHRoaXMucGF1c2VBbmRQbGF5VmlzaWJsZUljb24oKTtcblxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEFkZCBjb2xsYXBzZWQgY2xhc3NcbiAgICAgKi9cbiAgICBTbGlkZXIucHJvdG90eXBlLmRldGVjdElmSXNDb2xsYXBzZWQgPSBmdW5jdGlvbiAoc2xpZGVyKSB7XG4gICAgICAgIGlmICgkKHNsaWRlcikud2lkdGgoKSA8PSA1MDApIHtcbiAgICAgICAgICAgICQoc2xpZGVyKS5hZGRDbGFzcyhcImlzLWNvbGxhcHNlZFwiKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICQoc2xpZGVyKS5yZW1vdmVDbGFzcyhcImlzLWNvbGxhcHNlZFwiKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQoc2xpZGVyKS5maW5kKCcuc2xpZGUnKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgc2xpZGUpIHtcbiAgICAgICAgICAgIGlmICgkKHNsaWRlKS53aWR0aCgpIDw9IDUwMCkge1xuICAgICAgICAgICAgICAgICQoc2xpZGUpLmFkZENsYXNzKFwiaXMtY29sbGFwc2VkXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICAkKHNsaWRlKS5yZW1vdmVDbGFzcyhcImlzLWNvbGxhcHNlZFwiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIFNsaWRlci5wcm90b3R5cGUucHJlbG9hZEltYWdlID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7XG5cbiAgICAgICAgICAgIHZhciBub3JtYWxfaW1nID0gW107XG4gICAgICAgICAgICB2YXIgbW9iaWxlX2ltZyA9IFtdO1xuXG4gICAgICAgICAgICAkKFwiLnNsaWRlciAuc2xpZGVcIikuZWFjaChmdW5jdGlvbihpbmRleCwgc2xpZGUpIHtcblxuICAgICAgICAgICAgICAgIGlmICgkKFwiLnNsaWRlci1pbWFnZS1tb2JpbGVcIiwgc2xpZGUpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICBub3JtYWxfaW1nLmluZGV4ID0gbmV3IEltYWdlKCk7XG4gICAgICAgICAgICAgICAgICAgIG5vcm1hbF9pbWcuaW5kZXguc3JjID0gJChcIi5zbGlkZXItaW1hZ2UtZGVza3RvcFwiLCBzbGlkZSkuY3NzKCdiYWNrZ3JvdW5kLWltYWdlJykucmVwbGFjZSgvLipcXHM/dXJsXFwoW1xcJ1xcXCJdPy8sICcnKS5yZXBsYWNlKC9bXFwnXFxcIl0/XFwpLiovLCAnJyk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaWYgKCQoXCIuc2xpZGVyLWltYWdlLW1vYmlsZVwiLCBzbGlkZSkubGVuZ3RoKSB7XG4gICAgICAgICAgICAgICAgICAgIG1vYmlsZV9pbWcuaW5kZXggPSBuZXcgSW1hZ2UoKTtcbiAgICAgICAgICAgICAgICAgICAgbW9iaWxlX2ltZy5pbmRleC5zcmMgPSAkKFwiLnNsaWRlci1pbWFnZS1tb2JpbGVcIiwgc2xpZGUpLmNzcygnYmFja2dyb3VuZC1pbWFnZScpLnJlcGxhY2UoLy4qXFxzP3VybFxcKFtcXCdcXFwiXT8vLCAnJykucmVwbGFjZSgvW1xcJ1xcXCJdP1xcKS4qLywgJycpO1xuICAgICAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgfSk7XG5cbiAgICAgICAgfSw1MDAwKTtcbiAgICB9O1xuXG4gICAgU2xpZGVyLnByb3RvdHlwZS50cmlnZ2VyQXV0b3BsYXkgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKXtcbiAgICAgICAgICAgICQoXCIuc2xpZGVyIC5zbGlkZSAuc2xpZGVyLXZpZGVvIHZpZGVvXCIpLmVhY2goZnVuY3Rpb24oaW5kZXgsIHZpZGVvKSB7XG4gICAgICAgICAgICAgICAgaWYgKHR5cGVvZiAkKHZpZGVvKS5hdHRyKCdhdXRvcGxheScpICE9PSAndW5kZWZpbmVkJyAmJiAkKHZpZGVvKS5hdHRyKCdhdXRvcGxheScpICE9PSAnZmFsc2UnKSB7XG4gICAgICAgICAgICAgICAgICAgIHZpZGVvLnBsYXkoKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSwzMDApO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBQYXVzZSAmIHBsYXkgVmlzaWJpbGl0eVxuICAgICAqL1xuICAgIFNsaWRlci5wcm90b3R5cGUucGF1c2VBbmRQbGF5VmlzaWJsZUljb24gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICgkKHdpbmRvdykud2lkdGgoKSA+IDEwMjQpIHtcbiAgICAgICAgICAgIGlmICggJCgnLmVtYmVkZWQtbWluaS10b29sYmFyJykuaGFzQ2xhc3MoJ3NsaWRlci1zaG93LW9uLWhvdmVyJykgKSB7XG4gICAgICAgICAgICAgICAgJCgnLnNsaWRlcicpLmhvdmVyKFxuICAgICAgICAgICAgICAgICAgICBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAkKCcuZW1iZWRlZC1taW5pLXRvb2xiYXInKS5mYWRlSW4oMzAwKTtcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICAgICAgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgJCgnLmVtYmVkZWQtbWluaS10b29sYmFyJykuZmFkZU91dCgzMDApO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBQYXVzZSAmIHBsYXkgaWNvbiBvbiB2aWRlb1xuICAgICAqL1xuICAgIFNsaWRlci5wcm90b3R5cGUucGF1c2VBbmRQbGF5ID0gZnVuY3Rpb24gKCkge1xuXG4gICAgICAgIHRoaXMucGF1c2VBbmRQbGF5VmlzaWJsZUljb24oKTtcblxuICAgICAgICAkKCcuZW1iZWQtY29udHJvbCcpLm9uKCdjbGljaycsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIGV2ZW50LnN0b3BQcm9wYWdhdGlvbigpO1xuICAgICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcblxuICAgICAgICAgICAgdmFyIHNsaWRlclZpZGVvSWQgPSAkKHRoaXMpLmNsb3Nlc3QoJy5zbGlkZScpLmZpbmQoJy5zbGlkZXItdmlkZW8nKS5maW5kKCd2aWRlbycpLnByb3AoJ2lkJyk7XG4gICAgICAgICAgICB2YXIgdmlkZW9QbGF5ZXIgPSBkb2N1bWVudC5nZXRFbGVtZW50QnlJZChzbGlkZXJWaWRlb0lkKTtcblxuICAgICAgICAgICAgaWYgKCQodGhpcykuaGFzQ2xhc3MoJ2VtYmVkZWQtcGF1c2UnKSkge1xuICAgICAgICAgICAgICAgIHZpZGVvUGxheWVyLnBhdXNlKCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmICgkKHRoaXMpLmhhc0NsYXNzKCdlbWJlZGVkLXBsYXknKSkge1xuICAgICAgICAgICAgICAgIHZpZGVvUGxheWVyLnBsYXkoKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgJCgnLmVtYmVkLWNvbnRyb2wnKS5lYWNoKGZ1bmN0aW9uKCkge1xuICAgICAgICAgICAgICAgIGlmICgkKHRoaXMpLmhhc0NsYXNzKCdoaWRkZW4nKSkge1xuICAgICAgICAgICAgICAgICAgICAkKHRoaXMpLnJlbW92ZUNsYXNzKCdoaWRkZW4nKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICQodGhpcykuYWRkQ2xhc3MoJ2hpZGRlbicpO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9KS5iaW5kKHRoaXMpO1xuICAgIH07XG5cblxuICAgIHJldHVybiBuZXcgU2xpZGVyKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCIvL1xuLy8gQG5hbWUgQ29va2llc1xuLy9cbkhlbHNpbmdib3JnUHJpbWUgPSBIZWxzaW5nYm9yZ1ByaW1lIHx8IHt9O1xuSGVsc2luZ2JvcmdQcmltZS5IZWxwZXIgPSBIZWxzaW5nYm9yZ1ByaW1lLkhlbHBlciB8fCB7fTtcblxuSGVsc2luZ2JvcmdQcmltZS5IZWxwZXIuQ29va2llID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICBmdW5jdGlvbiBDb29raWUoKSB7XG5cbiAgICB9XG5cbiAgICAvKipcbiAgICAgKiBTZXRzIGEgY29va2llXG4gICAgICogQHBhcmFtIHtzdHJpbmd9IG5hbWUgICAgICBDb29raWUgbmFtZVxuICAgICAqIEBwYXJhbSB7c3RyaW5nfSB2YWx1ZSAgICAgQ29va2llIHZhbHVlXG4gICAgICogQHBhcmFtIHt2b2lkfSAgIGRheXNWYWxpZFxuICAgICAqL1xuICAgIENvb2tpZS5wcm90b3R5cGUuc2V0ID0gZnVuY3Rpb24gKG5hbWUsIHZhbHVlLCBkYXlzVmFsaWQpIHtcbiAgICAgICAgdmFyIGQgPSBuZXcgRGF0ZSgpO1xuICAgICAgICBkLnNldFRpbWUoZC5nZXRUaW1lKCkgKyAoZGF5c1ZhbGlkICogMjQgKiA2MCAqIDYwICogMTAwMCkpO1xuXG4gICAgICAgIHZhciBleHBpcmVzID0gXCJleHBpcmVzPVwiICsgZC50b1VUQ1N0cmluZygpO1xuICAgICAgICBkb2N1bWVudC5jb29raWUgPSBuYW1lICsgXCI9XCIgKyB2YWx1ZS50b1N0cmluZygpICsgXCI7IFwiICsgZXhwaXJlcyArIFwiOyBwYXRoPS9cIjtcblxuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2V0cyBhIGNvb2tpZVxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gbmFtZSBDb29raWUgbmFtZVxuICAgICAqIEByZXR1cm4ge21peGVkfSAgICAgICBDb29raWUgdmFsdWUgb3IgZW1wdHkgc3RyaW5nXG4gICAgICovXG4gICAgQ29va2llLnByb3RvdHlwZS5nZXQgPSBmdW5jdGlvbihuYW1lKSB7XG4gICAgICAgIG5hbWUgPSBuYW1lICsgJz0nO1xuICAgICAgICB2YXIgY2EgPSBkb2N1bWVudC5jb29raWUuc3BsaXQoJzsnKTtcblxuICAgICAgICBmb3IgKHZhciBpPTA7IGkgPCBjYS5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdmFyIGMgPSBjYVtpXTtcbiAgICAgICAgICAgIHdoaWxlIChjLmNoYXJBdCgwKSA9PSAnICcpIHtcbiAgICAgICAgICAgICAgICBjID0gYy5zdWJzdHJpbmcoMSk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGlmIChjLmluZGV4T2YobmFtZSkgPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gYy5zdWJzdHJpbmcobmFtZS5sZW5ndGgsIGMubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiAnJztcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogRGVzdHJveXMvcmVtb3ZlcyBhIGNvb2tpZVxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gbmFtZSBDb29raWUgbmFtZVxuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgQ29va2llLnByb3RvdHlwZS5kZXN0b3J5ID0gZnVuY3Rpb24obmFtZSkge1xuICAgICAgICAgdGhpcy5zZXQobmFtZSwgJycsIC0xKTtcbiAgICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBDaGVjayBpZiBjb29raWUgdmFsdWUgaXMgdGhlIHNhbWUgYXMgY29tcGFyZSB2YWx1ZVxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gbmFtZSAgICBDb29raWUgbmFtZVxuICAgICAqIEBwYXJhbSAge3N0cmluZ30gY29tcGFyZSBDb21wYXJlIHZhbHVlXG4gICAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBDb29raWUucHJvdG90eXBlLmNoZWNrID0gZnVuY3Rpb24obmFtZSwgY29tcGFyZSkge1xuICAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5nZXQobmFtZSk7XG4gICAgICAgICBjb21wYXJlID0gY29tcGFyZS50b1N0cmluZygpO1xuXG4gICAgICAgICByZXR1cm4gdmFsdWUgPT0gY29tcGFyZTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBDb29raWUoKTtcblxufSkoalF1ZXJ5KTtcbiIsIkhlbHNpbmdib3JnUHJpbWUgPSBIZWxzaW5nYm9yZ1ByaW1lIHx8IHt9O1xuSGVsc2luZ2JvcmdQcmltZS5IZWxwZXIgPSBIZWxzaW5nYm9yZ1ByaW1lLkhlbHBlciB8fCB7fTtcblxuSGVsc2luZ2JvcmdQcmltZS5IZWxwZXIuRmVhdHVyZURldGVjdG9yID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICBmdW5jdGlvbiBGZWF0dXJlRGV0ZWN0b3IoKSB7XG4gICAgICAgIHRoaXMuZGV0ZWN0RmxleGJveCgpO1xuICAgICAgICB0aGlzLmRldGVjdFdlYnAoKTtcbiAgICB9XG5cbiAgICBGZWF0dXJlRGV0ZWN0b3IucHJvdG90eXBlLmRldGVjdEZsZXhib3ggPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICFmdW5jdGlvbihlLG4sdCl7ZnVuY3Rpb24gcihlLG4pe3JldHVybiB0eXBlb2YgZT09PW59ZnVuY3Rpb24gbygpe3ZhciBlLG4sdCxvLHMsaSxsO2Zvcih2YXIgYSBpbiBTKWlmKFMuaGFzT3duUHJvcGVydHkoYSkpe2lmKGU9W10sbj1TW2FdLG4ubmFtZSYmKGUucHVzaChuLm5hbWUudG9Mb3dlckNhc2UoKSksbi5vcHRpb25zJiZuLm9wdGlvbnMuYWxpYXNlcyYmbi5vcHRpb25zLmFsaWFzZXMubGVuZ3RoKSlmb3IodD0wO3Q8bi5vcHRpb25zLmFsaWFzZXMubGVuZ3RoO3QrKyllLnB1c2gobi5vcHRpb25zLmFsaWFzZXNbdF0udG9Mb3dlckNhc2UoKSk7Zm9yKG89cihuLmZuLFwiZnVuY3Rpb25cIik/bi5mbigpOm4uZm4scz0wO3M8ZS5sZW5ndGg7cysrKWk9ZVtzXSxsPWkuc3BsaXQoXCIuXCIpLDE9PT1sLmxlbmd0aD9Nb2Rlcm5penJbbFswXV09bzooIU1vZGVybml6cltsWzBdXXx8TW9kZXJuaXpyW2xbMF1daW5zdGFuY2VvZiBCb29sZWFufHwoTW9kZXJuaXpyW2xbMF1dPW5ldyBCb29sZWFuKE1vZGVybml6cltsWzBdXSkpLE1vZGVybml6cltsWzBdXVtsWzFdXT1vKSxDLnB1c2goKG8/XCJcIjpcIm5vLVwiKStsLmpvaW4oXCItXCIpKX19ZnVuY3Rpb24gcyhlKXt2YXIgbj14LmNsYXNzTmFtZSx0PU1vZGVybml6ci5fY29uZmlnLmNsYXNzUHJlZml4fHxcIlwiO2lmKF8mJihuPW4uYmFzZVZhbCksTW9kZXJuaXpyLl9jb25maWcuZW5hYmxlSlNDbGFzcyl7dmFyIHI9bmV3IFJlZ0V4cChcIihefFxcXFxzKVwiK3QrXCJuby1qcyhcXFxcc3wkKVwiKTtuPW4ucmVwbGFjZShyLFwiJDFcIit0K1wianMkMlwiKX1Nb2Rlcm5penIuX2NvbmZpZy5lbmFibGVDbGFzc2VzJiYobis9XCIgXCIrdCtlLmpvaW4oXCIgXCIrdCksXz94LmNsYXNzTmFtZS5iYXNlVmFsPW46eC5jbGFzc05hbWU9bil9ZnVuY3Rpb24gaShlLG4pe3JldHVybiEhfihcIlwiK2UpLmluZGV4T2Yobil9ZnVuY3Rpb24gbCgpe3JldHVyblwiZnVuY3Rpb25cIiE9dHlwZW9mIG4uY3JlYXRlRWxlbWVudD9uLmNyZWF0ZUVsZW1lbnQoYXJndW1lbnRzWzBdKTpfP24uY3JlYXRlRWxlbWVudE5TLmNhbGwobixcImh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnXCIsYXJndW1lbnRzWzBdKTpuLmNyZWF0ZUVsZW1lbnQuYXBwbHkobixhcmd1bWVudHMpfWZ1bmN0aW9uIGEoZSl7cmV0dXJuIGUucmVwbGFjZSgvKFthLXpdKS0oW2Etel0pL2csZnVuY3Rpb24oZSxuLHQpe3JldHVybiBuK3QudG9VcHBlckNhc2UoKX0pLnJlcGxhY2UoL14tLyxcIlwiKX1mdW5jdGlvbiBmKGUsbil7cmV0dXJuIGZ1bmN0aW9uKCl7cmV0dXJuIGUuYXBwbHkobixhcmd1bWVudHMpfX1mdW5jdGlvbiB1KGUsbix0KXt2YXIgbztmb3IodmFyIHMgaW4gZSlpZihlW3NdaW4gbilyZXR1cm4gdD09PSExP2Vbc106KG89bltlW3NdXSxyKG8sXCJmdW5jdGlvblwiKT9mKG8sdHx8bik6byk7cmV0dXJuITF9ZnVuY3Rpb24gYyhlKXtyZXR1cm4gZS5yZXBsYWNlKC8oW0EtWl0pL2csZnVuY3Rpb24oZSxuKXtyZXR1cm5cIi1cIituLnRvTG93ZXJDYXNlKCl9KS5yZXBsYWNlKC9ebXMtLyxcIi1tcy1cIil9ZnVuY3Rpb24gcChuLHQscil7dmFyIG87aWYoXCJnZXRDb21wdXRlZFN0eWxlXCJpbiBlKXtvPWdldENvbXB1dGVkU3R5bGUuY2FsbChlLG4sdCk7dmFyIHM9ZS5jb25zb2xlO2lmKG51bGwhPT1vKXImJihvPW8uZ2V0UHJvcGVydHlWYWx1ZShyKSk7ZWxzZSBpZihzKXt2YXIgaT1zLmVycm9yP1wiZXJyb3JcIjpcImxvZ1wiO3NbaV0uY2FsbChzLFwiZ2V0Q29tcHV0ZWRTdHlsZSByZXR1cm5pbmcgbnVsbCwgaXRzIHBvc3NpYmxlIG1vZGVybml6ciB0ZXN0IHJlc3VsdHMgYXJlIGluYWNjdXJhdGVcIil9fWVsc2Ugbz0hdCYmbi5jdXJyZW50U3R5bGUmJm4uY3VycmVudFN0eWxlW3JdO3JldHVybiBvfWZ1bmN0aW9uIGQoKXt2YXIgZT1uLmJvZHk7cmV0dXJuIGV8fChlPWwoXz9cInN2Z1wiOlwiYm9keVwiKSxlLmZha2U9ITApLGV9ZnVuY3Rpb24gbShlLHQscixvKXt2YXIgcyxpLGEsZix1PVwibW9kZXJuaXpyXCIsYz1sKFwiZGl2XCIpLHA9ZCgpO2lmKHBhcnNlSW50KHIsMTApKWZvcig7ci0tOylhPWwoXCJkaXZcIiksYS5pZD1vP29bcl06dSsocisxKSxjLmFwcGVuZENoaWxkKGEpO3JldHVybiBzPWwoXCJzdHlsZVwiKSxzLnR5cGU9XCJ0ZXh0L2Nzc1wiLHMuaWQ9XCJzXCIrdSwocC5mYWtlP3A6YykuYXBwZW5kQ2hpbGQocykscC5hcHBlbmRDaGlsZChjKSxzLnN0eWxlU2hlZXQ/cy5zdHlsZVNoZWV0LmNzc1RleHQ9ZTpzLmFwcGVuZENoaWxkKG4uY3JlYXRlVGV4dE5vZGUoZSkpLGMuaWQ9dSxwLmZha2UmJihwLnN0eWxlLmJhY2tncm91bmQ9XCJcIixwLnN0eWxlLm92ZXJmbG93PVwiaGlkZGVuXCIsZj14LnN0eWxlLm92ZXJmbG93LHguc3R5bGUub3ZlcmZsb3c9XCJoaWRkZW5cIix4LmFwcGVuZENoaWxkKHApKSxpPXQoYyxlKSxwLmZha2U/KHAucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChwKSx4LnN0eWxlLm92ZXJmbG93PWYseC5vZmZzZXRIZWlnaHQpOmMucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChjKSwhIWl9ZnVuY3Rpb24geShuLHIpe3ZhciBvPW4ubGVuZ3RoO2lmKFwiQ1NTXCJpbiBlJiZcInN1cHBvcnRzXCJpbiBlLkNTUyl7Zm9yKDtvLS07KWlmKGUuQ1NTLnN1cHBvcnRzKGMobltvXSkscikpcmV0dXJuITA7cmV0dXJuITF9aWYoXCJDU1NTdXBwb3J0c1J1bGVcImluIGUpe2Zvcih2YXIgcz1bXTtvLS07KXMucHVzaChcIihcIitjKG5bb10pK1wiOlwiK3IrXCIpXCIpO3JldHVybiBzPXMuam9pbihcIiBvciBcIiksbShcIkBzdXBwb3J0cyAoXCIrcytcIikgeyAjbW9kZXJuaXpyIHsgcG9zaXRpb246IGFic29sdXRlOyB9IH1cIixmdW5jdGlvbihlKXtyZXR1cm5cImFic29sdXRlXCI9PXAoZSxudWxsLFwicG9zaXRpb25cIil9KX1yZXR1cm4gdH1mdW5jdGlvbiB2KGUsbixvLHMpe2Z1bmN0aW9uIGYoKXtjJiYoZGVsZXRlIE4uc3R5bGUsZGVsZXRlIE4ubW9kRWxlbSl9aWYocz1yKHMsXCJ1bmRlZmluZWRcIik/ITE6cywhcihvLFwidW5kZWZpbmVkXCIpKXt2YXIgdT15KGUsbyk7aWYoIXIodSxcInVuZGVmaW5lZFwiKSlyZXR1cm4gdX1mb3IodmFyIGMscCxkLG0sdixnPVtcIm1vZGVybml6clwiLFwidHNwYW5cIixcInNhbXBcIl07IU4uc3R5bGUmJmcubGVuZ3RoOyljPSEwLE4ubW9kRWxlbT1sKGcuc2hpZnQoKSksTi5zdHlsZT1OLm1vZEVsZW0uc3R5bGU7Zm9yKGQ9ZS5sZW5ndGgscD0wO2Q+cDtwKyspaWYobT1lW3BdLHY9Ti5zdHlsZVttXSxpKG0sXCItXCIpJiYobT1hKG0pKSxOLnN0eWxlW21dIT09dCl7aWYoc3x8cihvLFwidW5kZWZpbmVkXCIpKXJldHVybiBmKCksXCJwZnhcIj09bj9tOiEwO3RyeXtOLnN0eWxlW21dPW99Y2F0Y2goaCl7fWlmKE4uc3R5bGVbbV0hPXYpcmV0dXJuIGYoKSxcInBmeFwiPT1uP206ITB9cmV0dXJuIGYoKSwhMX1mdW5jdGlvbiBnKGUsbix0LG8scyl7dmFyIGk9ZS5jaGFyQXQoMCkudG9VcHBlckNhc2UoKStlLnNsaWNlKDEpLGw9KGUrXCIgXCIrUC5qb2luKGkrXCIgXCIpK2kpLnNwbGl0KFwiIFwiKTtyZXR1cm4gcihuLFwic3RyaW5nXCIpfHxyKG4sXCJ1bmRlZmluZWRcIik/dihsLG4sbyxzKToobD0oZStcIiBcIit6LmpvaW4oaStcIiBcIikraSkuc3BsaXQoXCIgXCIpLHUobCxuLHQpKX1mdW5jdGlvbiBoKGUsbixyKXtyZXR1cm4gZyhlLHQsdCxuLHIpfXZhciBDPVtdLFM9W10sdz17X3ZlcnNpb246XCIzLjUuMFwiLF9jb25maWc6e2NsYXNzUHJlZml4OlwiXCIsZW5hYmxlQ2xhc3NlczohMCxlbmFibGVKU0NsYXNzOiEwLHVzZVByZWZpeGVzOiEwfSxfcTpbXSxvbjpmdW5jdGlvbihlLG4pe3ZhciB0PXRoaXM7c2V0VGltZW91dChmdW5jdGlvbigpe24odFtlXSl9LDApfSxhZGRUZXN0OmZ1bmN0aW9uKGUsbix0KXtTLnB1c2goe25hbWU6ZSxmbjpuLG9wdGlvbnM6dH0pfSxhZGRBc3luY1Rlc3Q6ZnVuY3Rpb24oZSl7Uy5wdXNoKHtuYW1lOm51bGwsZm46ZX0pfX0sTW9kZXJuaXpyPWZ1bmN0aW9uKCl7fTtNb2Rlcm5penIucHJvdG90eXBlPXcsTW9kZXJuaXpyPW5ldyBNb2Rlcm5penI7dmFyIHg9bi5kb2N1bWVudEVsZW1lbnQsXz1cInN2Z1wiPT09eC5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpLGI9XCJNb3ogTyBtcyBXZWJraXRcIixQPXcuX2NvbmZpZy51c2VQcmVmaXhlcz9iLnNwbGl0KFwiIFwiKTpbXTt3Ll9jc3NvbVByZWZpeGVzPVA7dmFyIHo9dy5fY29uZmlnLnVzZVByZWZpeGVzP2IudG9Mb3dlckNhc2UoKS5zcGxpdChcIiBcIik6W107dy5fZG9tUHJlZml4ZXM9ejt2YXIgRT17ZWxlbTpsKFwibW9kZXJuaXpyXCIpfTtNb2Rlcm5penIuX3EucHVzaChmdW5jdGlvbigpe2RlbGV0ZSBFLmVsZW19KTt2YXIgTj17c3R5bGU6RS5lbGVtLnN0eWxlfTtNb2Rlcm5penIuX3EudW5zaGlmdChmdW5jdGlvbigpe2RlbGV0ZSBOLnN0eWxlfSksdy50ZXN0QWxsUHJvcHM9Zyx3LnRlc3RBbGxQcm9wcz1oLE1vZGVybml6ci5hZGRUZXN0KFwiZmxleGJveFwiLGgoXCJmbGV4QmFzaXNcIixcIjFweFwiLCEwKSksbygpLHMoQyksZGVsZXRlIHcuYWRkVGVzdCxkZWxldGUgdy5hZGRBc3luY1Rlc3Q7Zm9yKHZhciBUPTA7VDxNb2Rlcm5penIuX3EubGVuZ3RoO1QrKylNb2Rlcm5penIuX3FbVF0oKTtlLk1vZGVybml6cj1Nb2Rlcm5penJ9KHdpbmRvdyxkb2N1bWVudCk7XG4gICAgfTtcblxuICAgIEZlYXR1cmVEZXRlY3Rvci5wcm90b3R5cGUuZGV0ZWN0V2VicCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgIWZ1bmN0aW9uKGUsbixBKXtmdW5jdGlvbiBvKGUsbil7cmV0dXJuIHR5cGVvZiBlPT09bn1mdW5jdGlvbiB0KCl7dmFyIGUsbixBLHQsYSxpLGw7Zm9yKHZhciBmIGluIHIpaWYoci5oYXNPd25Qcm9wZXJ0eShmKSl7aWYoZT1bXSxuPXJbZl0sbi5uYW1lJiYoZS5wdXNoKG4ubmFtZS50b0xvd2VyQ2FzZSgpKSxuLm9wdGlvbnMmJm4ub3B0aW9ucy5hbGlhc2VzJiZuLm9wdGlvbnMuYWxpYXNlcy5sZW5ndGgpKWZvcihBPTA7QTxuLm9wdGlvbnMuYWxpYXNlcy5sZW5ndGg7QSsrKWUucHVzaChuLm9wdGlvbnMuYWxpYXNlc1tBXS50b0xvd2VyQ2FzZSgpKTtmb3IodD1vKG4uZm4sXCJmdW5jdGlvblwiKT9uLmZuKCk6bi5mbixhPTA7YTxlLmxlbmd0aDthKyspaT1lW2FdLGw9aS5zcGxpdChcIi5cIiksMT09PWwubGVuZ3RoP01vZGVybml6cltsWzBdXT10OighTW9kZXJuaXpyW2xbMF1dfHxNb2Rlcm5penJbbFswXV1pbnN0YW5jZW9mIEJvb2xlYW58fChNb2Rlcm5penJbbFswXV09bmV3IEJvb2xlYW4oTW9kZXJuaXpyW2xbMF1dKSksTW9kZXJuaXpyW2xbMF1dW2xbMV1dPXQpLHMucHVzaCgodD9cIlwiOlwibm8tXCIpK2wuam9pbihcIi1cIikpfX1mdW5jdGlvbiBhKGUpe3ZhciBuPXUuY2xhc3NOYW1lLEE9TW9kZXJuaXpyLl9jb25maWcuY2xhc3NQcmVmaXh8fFwiXCI7aWYoYyYmKG49bi5iYXNlVmFsKSxNb2Rlcm5penIuX2NvbmZpZy5lbmFibGVKU0NsYXNzKXt2YXIgbz1uZXcgUmVnRXhwKFwiKF58XFxcXHMpXCIrQStcIm5vLWpzKFxcXFxzfCQpXCIpO249bi5yZXBsYWNlKG8sXCIkMVwiK0ErXCJqcyQyXCIpfU1vZGVybml6ci5fY29uZmlnLmVuYWJsZUNsYXNzZXMmJihuKz1cIiBcIitBK2Uuam9pbihcIiBcIitBKSxjP3UuY2xhc3NOYW1lLmJhc2VWYWw9bjp1LmNsYXNzTmFtZT1uKX1mdW5jdGlvbiBpKGUsbil7aWYoXCJvYmplY3RcIj09dHlwZW9mIGUpZm9yKHZhciBBIGluIGUpZihlLEEpJiZpKEEsZVtBXSk7ZWxzZXtlPWUudG9Mb3dlckNhc2UoKTt2YXIgbz1lLnNwbGl0KFwiLlwiKSx0PU1vZGVybml6cltvWzBdXTtpZigyPT1vLmxlbmd0aCYmKHQ9dFtvWzFdXSksXCJ1bmRlZmluZWRcIiE9dHlwZW9mIHQpcmV0dXJuIE1vZGVybml6cjtuPVwiZnVuY3Rpb25cIj09dHlwZW9mIG4/bigpOm4sMT09by5sZW5ndGg/TW9kZXJuaXpyW29bMF1dPW46KCFNb2Rlcm5penJbb1swXV18fE1vZGVybml6cltvWzBdXWluc3RhbmNlb2YgQm9vbGVhbnx8KE1vZGVybml6cltvWzBdXT1uZXcgQm9vbGVhbihNb2Rlcm5penJbb1swXV0pKSxNb2Rlcm5penJbb1swXV1bb1sxXV09biksYShbKG4mJjAhPW4/XCJcIjpcIm5vLVwiKStvLmpvaW4oXCItXCIpXSksTW9kZXJuaXpyLl90cmlnZ2VyKGUsbil9cmV0dXJuIE1vZGVybml6cn12YXIgcz1bXSxyPVtdLGw9e192ZXJzaW9uOlwiMy41LjBcIixfY29uZmlnOntjbGFzc1ByZWZpeDpcIlwiLGVuYWJsZUNsYXNzZXM6ITAsZW5hYmxlSlNDbGFzczohMCx1c2VQcmVmaXhlczohMH0sX3E6W10sb246ZnVuY3Rpb24oZSxuKXt2YXIgQT10aGlzO3NldFRpbWVvdXQoZnVuY3Rpb24oKXtuKEFbZV0pfSwwKX0sYWRkVGVzdDpmdW5jdGlvbihlLG4sQSl7ci5wdXNoKHtuYW1lOmUsZm46bixvcHRpb25zOkF9KX0sYWRkQXN5bmNUZXN0OmZ1bmN0aW9uKGUpe3IucHVzaCh7bmFtZTpudWxsLGZuOmV9KX19LE1vZGVybml6cj1mdW5jdGlvbigpe307TW9kZXJuaXpyLnByb3RvdHlwZT1sLE1vZGVybml6cj1uZXcgTW9kZXJuaXpyO3ZhciBmLHU9bi5kb2N1bWVudEVsZW1lbnQsYz1cInN2Z1wiPT09dS5ub2RlTmFtZS50b0xvd2VyQ2FzZSgpOyFmdW5jdGlvbigpe3ZhciBlPXt9Lmhhc093blByb3BlcnR5O2Y9byhlLFwidW5kZWZpbmVkXCIpfHxvKGUuY2FsbCxcInVuZGVmaW5lZFwiKT9mdW5jdGlvbihlLG4pe3JldHVybiBuIGluIGUmJm8oZS5jb25zdHJ1Y3Rvci5wcm90b3R5cGVbbl0sXCJ1bmRlZmluZWRcIil9OmZ1bmN0aW9uKG4sQSl7cmV0dXJuIGUuY2FsbChuLEEpfX0oKSxsLl9sPXt9LGwub249ZnVuY3Rpb24oZSxuKXt0aGlzLl9sW2VdfHwodGhpcy5fbFtlXT1bXSksdGhpcy5fbFtlXS5wdXNoKG4pLE1vZGVybml6ci5oYXNPd25Qcm9wZXJ0eShlKSYmc2V0VGltZW91dChmdW5jdGlvbigpe01vZGVybml6ci5fdHJpZ2dlcihlLE1vZGVybml6cltlXSl9LDApfSxsLl90cmlnZ2VyPWZ1bmN0aW9uKGUsbil7aWYodGhpcy5fbFtlXSl7dmFyIEE9dGhpcy5fbFtlXTtzZXRUaW1lb3V0KGZ1bmN0aW9uKCl7dmFyIGUsbztmb3IoZT0wO2U8QS5sZW5ndGg7ZSsrKShvPUFbZV0pKG4pfSwwKSxkZWxldGUgdGhpcy5fbFtlXX19LE1vZGVybml6ci5fcS5wdXNoKGZ1bmN0aW9uKCl7bC5hZGRUZXN0PWl9KSxNb2Rlcm5penIuYWRkQXN5bmNUZXN0KGZ1bmN0aW9uKCl7ZnVuY3Rpb24gZShlLG4sQSl7ZnVuY3Rpb24gbyhuKXt2YXIgbz1uJiZcImxvYWRcIj09PW4udHlwZT8xPT10LndpZHRoOiExLGE9XCJ3ZWJwXCI9PT1lO2koZSxhJiZvP25ldyBCb29sZWFuKG8pOm8pLEEmJkEobil9dmFyIHQ9bmV3IEltYWdlO3Qub25lcnJvcj1vLHQub25sb2FkPW8sdC5zcmM9bn12YXIgbj1be3VyaTpcImRhdGE6aW1hZ2Uvd2VicDtiYXNlNjQsVWtsR1JpUUFBQUJYUlVKUVZsQTRJQmdBQUFBd0FRQ2RBU29CQUFFQUF3QTBKYVFBQTNBQS92dVVBQUE9XCIsbmFtZTpcIndlYnBcIn0se3VyaTpcImRhdGE6aW1hZ2Uvd2VicDtiYXNlNjQsVWtsR1Jrb0FBQUJYUlVKUVZsQTRXQW9BQUFBUUFBQUFBQUFBQUFBQVFVeFFTQXdBQUFBQkJ4QVIvUTlFUlA4REFBQldVRGdnR0FBQUFEQUJBSjBCS2dFQUFRQURBRFFscEFBRGNBRCsrLzFRQUE9PVwiLG5hbWU6XCJ3ZWJwLmFscGhhXCJ9LHt1cmk6XCJkYXRhOmltYWdlL3dlYnA7YmFzZTY0LFVrbEdSbElBQUFCWFJVSlFWbEE0V0FvQUFBQVNBQUFBQUFBQUFBQUFRVTVKVFFZQUFBRC8vLy8vQUFCQlRrMUdKZ0FBQUFBQUFBQUFBQUFBQUFBQUFHUUFBQUJXVURoTURRQUFBQzhBQUFBUUJ4QVJFWWlJL2djQVwiLG5hbWU6XCJ3ZWJwLmFuaW1hdGlvblwifSx7dXJpOlwiZGF0YTppbWFnZS93ZWJwO2Jhc2U2NCxVa2xHUmg0QUFBQlhSVUpRVmxBNFRCRUFBQUF2QUFBQUFBZlEvLzczdi8rQmlPaC9BQUE9XCIsbmFtZTpcIndlYnAubG9zc2xlc3NcIn1dLEE9bi5zaGlmdCgpO2UoQS5uYW1lLEEudXJpLGZ1bmN0aW9uKEEpe2lmKEEmJlwibG9hZFwiPT09QS50eXBlKWZvcih2YXIgbz0wO288bi5sZW5ndGg7bysrKWUobltvXS5uYW1lLG5bb10udXJpKX0pfSksdCgpLGEocyksZGVsZXRlIGwuYWRkVGVzdCxkZWxldGUgbC5hZGRBc3luY1Rlc3Q7Zm9yKHZhciBwPTA7cDxNb2Rlcm5penIuX3EubGVuZ3RoO3ArKylNb2Rlcm5penIuX3FbcF0oKTtlLk1vZGVybml6cj1Nb2Rlcm5penJ9KHdpbmRvdyxkb2N1bWVudCk7XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgRmVhdHVyZURldGVjdG9yKCk7XG5cbn0pKGpRdWVyeSk7XG5cbiIsIkhlbHNpbmdib3JnUHJpbWUgPSBIZWxzaW5nYm9yZ1ByaW1lIHx8IHt9O1xuSGVsc2luZ2JvcmdQcmltZS5IZWxwZXIgPSBIZWxzaW5nYm9yZ1ByaW1lLkhlbHBlciB8fCB7fTtcblxuSGVsc2luZ2JvcmdQcmltZS5IZWxwZXIuSW5wdXQgPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIGZ1bmN0aW9uIElucHV0KCkge1xuICAgICAgICAkKCdmb3JtIGlucHV0LCBmb3JtIHNlbGVjdCcpLm9uKCdpbnZhbGlkJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHRoaXMuaW52YWxpZE1lc3NhZ2UoZS50YXJnZXQpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAgICQoJ2Zvcm0nKS5vbignc3VibWl0JywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciBpc1ZhbGlkID0gdGhpcy52YWxpZGF0ZURhdGFSZXF1aXJlKGUudGFyZ2V0KTtcblxuICAgICAgICAgICAgaWYgKCFpc1ZhbGlkKSB7XG4gICAgICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgSW5wdXQucHJvdG90eXBlLmludmFsaWRNZXNzYWdlID0gZnVuY3Rpb24gKGVsZW1lbnQpIHtcbiAgICAgICAgdmFyICR0YXJnZXQgPSAkKGVsZW1lbnQpO1xuICAgICAgICB2YXIgbWVzc2FnZSA9ICR0YXJnZXQuYXR0cignZGF0YS1pbnZhbGlkLW1lc3NhZ2UnKTtcblxuICAgICAgICBpZiAobWVzc2FnZSkge1xuICAgICAgICAgICAgZWxlbWVudC5zZXRDdXN0b21WYWxpZGl0eShtZXNzYWdlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9O1xuXG4gICAgSW5wdXQucHJvdG90eXBlLnZhbGlkYXRlRGF0YVJlcXVpcmUgPSBmdW5jdGlvbihmb3JtKSB7XG4gICAgICAgIHZhciAkZm9ybSA9ICQoZm9ybSk7XG4gICAgICAgIHZhciAkY2hlY2tib3hlcyA9ICRmb3JtLmZpbmQoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXVtkYXRhLXJlcXVpcmVdJyk7XG4gICAgICAgIHZhciBjaGVja2JveE5hbWVzID0gW107XG4gICAgICAgIHZhciBpc1ZhbGlkID0gdHJ1ZTtcblxuICAgICAgICAkKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl1bZGF0YS1yZXF1aXJlXScpLm9uKCdjaGFuZ2UnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgZS5zdG9wUHJvcGFnYXRpb24oKTtcbiAgICAgICAgICAgICRmb3JtLmZpbmQoJy5jaGVja2JveC1pbnZhbGlkLW1zZycpLnJlbW92ZSgpO1xuICAgICAgICB9KTtcblxuICAgICAgICAkY2hlY2tib3hlcy5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgICAgaWYgKGNoZWNrYm94TmFtZXMuaW5kZXhPZigkKHRoaXMpLmF0dHIoJ25hbWUnKSkgPiAtMSkge1xuICAgICAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgY2hlY2tib3hOYW1lcy5wdXNoKCQodGhpcykuYXR0cignbmFtZScpKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgJC5lYWNoKGNoZWNrYm94TmFtZXMsIGZ1bmN0aW9uIChpbmRleCwgbmFtZSkge1xuICAgICAgICAgICAgaWYgKCRmb3JtLmZpbmQoJ2lucHV0W3R5cGU9XCJjaGVja2JveFwiXVtuYW1lPVwiJyArIG5hbWUgKyAnXCJdW2RhdGEtcmVxdWlyZV06Y2hlY2tlZCcpLmxlbmd0aCA+IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgICRwYXJlbnQgPSAkZm9ybS5maW5kKCdpbnB1dFt0eXBlPVwiY2hlY2tib3hcIl1bbmFtZT1cIicgKyBuYW1lICsgJ1wiXVtkYXRhLXJlcXVpcmVdJykuZmlyc3QoKS5wYXJlbnRzKCcuZm9ybS1ncm91cCcpO1xuICAgICAgICAgICAgJHBhcmVudC5hcHBlbmQoJzxkaXYgY2xhc3M9XCJjaGVja2JveC1pbnZhbGlkLW1zZyB0ZXh0LWRhbmdlciB0ZXh0LXNtXCIgYXJpYS1saXZlPVwicG9saXRlXCI+U2VsZWN0IGF0IGxlYXN0IG9uZSBvcHRpb248L2Rpdj4nKTtcbiAgICAgICAgICAgIGlzVmFsaWQgPSBmYWxzZTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgcmV0dXJuIGlzVmFsaWQ7XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgSW5wdXQoKTtcblxufSkoalF1ZXJ5KTtcbiIsIi8vXG4vLyBAbmFtZSBMb2NhbCBsaW5rXG4vLyBAZGVzY3JpcHRpb24gIEZpbmRzIGxpbmsgaXRlbXMgd2l0aCBvdXRib3VuZCBsaW5rcyBhbmQgZ2l2ZXMgdGhlbSBvdXRib3VuZCBjbGFzc1xuLy9cbkhlbHNpbmdib3JnUHJpbWUgPSBIZWxzaW5nYm9yZ1ByaW1lIHx8IHt9O1xuSGVsc2luZ2JvcmdQcmltZS5IZWxwZXIgPSBIZWxzaW5nYm9yZ1ByaW1lLkhlbHBlciB8fCB7fTtcblxuSGVsc2luZ2JvcmdQcmltZS5IZWxwZXIuTG9jYWxMaW5rID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICBmdW5jdGlvbiBMb2NhbExpbmsoKSB7XG4gICAgICAgICQoZG9jdW1lbnQpLnJlYWR5KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBob3N0bmFtZSA9IG5ldyBSZWdFeHAobG9jYXRpb24uaG9zdCk7XG5cbiAgICAgICAgICAgICQoJ2FbaHJlZl0ubGluay1pdGVtOm5vdCgubGluay1pdGVtLW91dGJvdW5kKTpub3QoLmxpbmstdW5hdmFpbGFibGUpOm5vdChbaHJlZl49XCJqYXZhc2NyaXB0OlwiXSk6bm90KFtocmVmPVwiI1wiXSknKS5lYWNoKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgdXJsID0gJCh0aGlzKS5hdHRyKCdocmVmJyk7XG4gICAgICAgICAgICAgICAgaWYgKGhvc3RuYW1lLnRlc3QodXJsKSkge1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgJCh0aGlzKS5hZGRDbGFzcygnbGluay1pdGVtLW91dGJvdW5kJyk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgfSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIG5ldyBMb2NhbExpbmsoKTtcblxufSkoalF1ZXJ5KTtcbiIsIlxuSGVsc2luZ2JvcmdQcmltZSA9IEhlbHNpbmdib3JnUHJpbWUgfHwge307XG5IZWxzaW5nYm9yZ1ByaW1lLkhlbHBlciA9IEhlbHNpbmdib3JnUHJpbWUuSGVscGVyIHx8IHt9O1xuXG5IZWxzaW5nYm9yZ1ByaW1lLkhlbHBlci5Mb2NhbFN0b3JhZ2VSZWZlcmVyID0gKGZ1bmN0aW9uICgkKSB7XG4gICAgXG4gICAgdmFyIHJlZlVybFN0b3JhZ2VIaXN0b3J5O1xuICAgIFxuICAgIC8qKlxuICAgICAqIENyZWF0ZSBMb2NhbCBTdG9yYWdlLlxuICAgICAqIEBhdXRob3IgSm9oYW4gU2lsdmVyZ3J1bmRcbiAgICAgKiBAY29uc3RydWN0b3JcbiAgICAgKiBAdGhpcyB7TG9jYWxTdG9yYWdlUmVmZXJlcn1cbiAgICAgKi9cbiAgICBmdW5jdGlvbiBMb2NhbFN0b3JhZ2VSZWZlcmVyKCkge1xuICAgICAgICBpZiAodHlwZW9mKFN0b3JhZ2UpICE9PSAndW5kZWZpbmVkJykge1xuICAgICAgICAgICAgdGhpcy5zZXRTdG9yYWdlKCk7IFxuICAgICAgICB9ICAgIFxuICAgIH07XG5cblxuICAgIC8qKlxuICAgICAqIEZldGNoZXMgdXJsIHBhcmFtZXRlclxuICAgICAqIEBhdXRob3IgSm9oYW4gU2lsdmVyZ3J1bmRcbiAgICAgKiBAdGhpcyB7Z2V0VXJsUGFyYW1ldGVyfVxuICAgICAqIEBwYXJhbSBzdHJpbmcgc1BhcmFtXG4gICAgICovXG4gICAgTG9jYWxTdG9yYWdlUmVmZXJlci5wcm90b3R5cGUuZ2V0VXJsUGFyYW1ldGVyID0gZnVuY3Rpb24gZ2V0VXJsUGFyYW1ldGVyKHNQYXJhbSkge1xuICAgICAgICB2YXIgc1BhZ2VVUkwgPSBkZWNvZGVVUklDb21wb25lbnQod2luZG93LmxvY2F0aW9uLnNlYXJjaC5zdWJzdHJpbmcoMSkpLFxuICAgICAgICAgICAgc1VSTFZhcmlhYmxlcyA9IHNQYWdlVVJMLnNwbGl0KCcmJyksXG4gICAgICAgICAgICBzUGFyYW1ldGVyTmFtZSxcbiAgICAgICAgICAgIGk7XG4gICAgXG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBzVVJMVmFyaWFibGVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBzUGFyYW1ldGVyTmFtZSA9IHNVUkxWYXJpYWJsZXNbaV0uc3BsaXQoJz0nKTtcbiAgICBcbiAgICAgICAgICAgIGlmIChzUGFyYW1ldGVyTmFtZVswXSA9PT0gc1BhcmFtKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHNQYXJhbWV0ZXJOYW1lWzFdID09PSB1bmRlZmluZWQgPyB0cnVlIDogc1BhcmFtZXRlck5hbWVbMV07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuICAgIFxuICAgIC8qKlxuICAgICAqIENoZWNrIGxvY2FsIHN0b3JhZ2VcbiAgICAgKiBAYXV0aG9yIEpvaGFuIFNpbHZlcmdydW5kXG4gICAgICogQHRoaXMge2NoZWNrU3RvcmFnZX1cbiAgICAgKiBAcGFyYW0ge3N0cmluZ30gc3RvcmFnZVR5cGVcbiAgICAgKiBAcmV0dXJuIHtzdHJpbmd9IHVybFxuICAgICAqL1xuICAgIExvY2FsU3RvcmFnZVJlZmVyZXIucHJvdG90eXBlLmNoZWNrU3RvcmFnZSA9IGZ1bmN0aW9uKHN0b3JhZ2VUeXBlKSB7XG4gICAgICAgIHJldHVybiBsb2NhbFN0b3JhZ2UuZ2V0SXRlbShzdG9yYWdlVHlwZSk7XG4gICAgfTsgICAgXG4gICAgXG5cbiAgICAvKipcbiAgICAgKiBDcmVhdGVzIGEgTG9jYWwgc3RvcmFnZVxuICAgICAqIEBhdXRob3IgSm9oYW4gU2lsdmVyZ3J1bmRcbiAgICAgKiBAdGhpcyB7c2V0U3RvcmFnZX1cbiAgICAgKi9cbiAgICBMb2NhbFN0b3JhZ2VSZWZlcmVyLnByb3RvdHlwZS5zZXRTdG9yYWdlID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciBzdG9yZUhpc3RvcnkgPSB0aGlzLmNoZWNrU3RvcmFnZSgncmVmVXJsU3RvcmFnZScpO1xuICAgICAgICBpZiAoc3RvcmVIaXN0b3J5ICE9IHdpbmRvdy5sb2NhdGlvbi5ocmVmKSB7XG4gICAgICAgICAgICBpZiAodGhpcy5nZXRVcmxQYXJhbWV0ZXIoJ21vZHVsYXJpdHlGb3JtJykpIHtcbiAgICAgICAgICAgICAgICByZWZVcmxTdG9yYWdlSGlzdG9yeSA9IGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdyZWZVcmxTdG9yYWdlSGlzdG9yeScsIGRlY29kZVVSSUNvbXBvbmVudCh0aGlzLmdldFVybFBhcmFtZXRlcignbW9kdWxhcml0eUZvcm0nKSkpO1xuICAgICAgICAgICAgICAgIHJlZlVybFN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncmVmVXJsU3RvcmFnZUhpc3RvcnknLCBkZWNvZGVVUklDb21wb25lbnQodGhpcy5nZXRVcmxQYXJhbWV0ZXIoJ21vZHVsYXJpdHlSZWZlcnJlcicpKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICByZWZVcmxTdG9yYWdlSGlzdG9yeSA9IGxvY2FsU3RvcmFnZS5zZXRJdGVtKCdyZWZVcmxTdG9yYWdlSGlzdG9yeScsIHN0b3JlSGlzdG9yeSApO1xuICAgICAgICAgICAgICAgIHJlZlVybFN0b3JhZ2UgPSBsb2NhbFN0b3JhZ2Uuc2V0SXRlbSgncmVmVXJsU3RvcmFnZScsIHdpbmRvdy5sb2NhdGlvbi5ocmVmICk7XG4gICAgICAgICAgICB9ICAgICBcbiAgICAgICAgfSAgICBcbiAgICAgICAgXG4gICAgICAgIHRoaXMuYWRkU3RvcmFnZVJlZmVyZXJUb0Rvb20oKTsgICAgICBcbiAgICB9O1xuICAgIFxuXG4gICAgLyoqXG4gICAgICogQWRkaW5nIHJlZmVyZXIgVVJMIHRvIGRvb21cbiAgICAgKiBAYXV0aG9yIEpvaGFuIFNpbHZlcmdydW5kXG4gICAgICogQHRoaXMge2FkZFN0b3JhZ2VSZWZlcmVyVG9Eb29tfVxuICAgICAqL1xuICAgIExvY2FsU3RvcmFnZVJlZmVyZXIucHJvdG90eXBlLmFkZFN0b3JhZ2VSZWZlcmVyVG9Eb29tID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIGlmICgkKCcjbW9kdWxhcml0eS1mb3JtLWhpc3RvcnknKS5sZW5ndGggIT09IDApIHtcbiAgICAgICAgICAgICQoJyNtb2R1bGFyaXR5LWZvcm0taGlzdG9yeScpLnZhbCh0aGlzLmNoZWNrU3RvcmFnZSgncmVmVXJsU3RvcmFnZUhpc3RvcnknKSk7XG4gICAgICAgICAgICAkKCcjbW9kdWxhcml0eS1mb3JtLXVybCcpLnZhbCh0aGlzLmNoZWNrU3RvcmFnZSgncmVmVXJsU3RvcmFnZScpKTtcbiAgICAgICAgfSBcbiAgICB9OyAgICBcblxuICAgIHJldHVybiBuZXcgTG9jYWxTdG9yYWdlUmVmZXJlcigpO1xuXG59KShqUXVlcnkpOyIsIi8vXG4vLyBAbmFtZSBNb2RhbFxuLy8gQGRlc2NyaXB0aW9uICBQcmV2ZW50IHNjcm9sbGluZyB3aGVuIG1vZGFsIGlzIG9wZW4gKG9yICNtb2RhbC0qIGV4aXN0cyBpbiB1cmwpXG4vL1xuSGVsc2luZ2JvcmdQcmltZSA9IEhlbHNpbmdib3JnUHJpbWUgfHwge307XG5IZWxzaW5nYm9yZ1ByaW1lLlByb21wdCA9IEhlbHNpbmdib3JnUHJpbWUuUHJvbXB0IHx8IHt9O1xuXG5IZWxzaW5nYm9yZ1ByaW1lLlByb21wdC5SZXZlYWxBbmltYXRpb24gPSAoZnVuY3Rpb24gKCQpIHtcbiAgICAgIHZhciAkd2luZG93ICAgICAgICAgPSAkKHdpbmRvdyksXG4gICAgICB3aW5faGVpZ2h0X3BhZGRlZCAgID0gJHdpbmRvdy5vdXRlckhlaWdodCgpLFxuICAgICAgdGFyZ2V0V3JhcHBlciAgICAgICA9ICcuanMtcmV2ZWFsLWFuaW1hdGlvbicsXG4gICAgICB0YXJnZXQsXG4gICAgICBzY3JvbGxlZCAgICAgICAgPSAkd2luZG93LnNjcm9sbFRvcCgpLFxuICAgICAgYW5pbWF0aW9uVGFyZ2V0O1xuXG4gICAgZnVuY3Rpb24gUmV2ZWFsQW5pbWF0aW9uKCkge1xuICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgUmV2ZWFsQW5pbWF0aW9uLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgJCggZG9jdW1lbnQgKS5yZWFkeShmdW5jdGlvbigpIHtcbiAgICAgICAgICB0aGlzLnJldmVhbE9uU2Nyb2xsKCk7XG4gICAgICB9LmJpbmQodGhpcykpO1xuXG4gICAgICAkd2luZG93Lm9uKCdzY3JvbGwnLCB0aGlzLnJldmVhbE9uU2Nyb2xsKTtcbiAgICB9O1xuXG4gICAgUmV2ZWFsQW5pbWF0aW9uLnByb3RvdHlwZS5yZXZlYWxPblNjcm9sbCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgc2Nyb2xsZWQgICAgICAgID0gJHdpbmRvdy5zY3JvbGxUb3AoKTtcblxuICAgICAgICAkKHRhcmdldFdyYXBwZXIgKyBcIjpub3QoLmFuaW1hdGVkKVwiKS5lYWNoKGZ1bmN0aW9uKCkge1xuXG4gICAgICAgIGlmKCEkKHRoaXMpLmF0dHIoXCJkYXRhLWFuaW1hdGlvblwiKSkge1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGFuaW1hdGlvblRhcmdldCAgID0gJCh0aGlzKS5vZmZzZXQoKS50b3AsXG4gICAgICAgIGFuaW1hdGlvbk9mZnNldCAgICAgICA9IDAuNDtcblxuICAgICAgICBpZiAoc2Nyb2xsZWQgPj0gYW5pbWF0aW9uVGFyZ2V0IC0gd2luX2hlaWdodF9wYWRkZWQgKyAod2luX2hlaWdodF9wYWRkZWQgKiBhbmltYXRpb25PZmZzZXQpKSB7XG4gICAgICAgICAgLy9jb25zb2xlLmxvZyh0aGlzKTtcbiAgICAgICAgICAkKHRoaXMpLmFkZENsYXNzKCQodGhpcykuYXR0cihcImRhdGEtYW5pbWF0aW9uXCIpKTtcbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgUmV2ZWFsQW5pbWF0aW9uKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCJIZWxzaW5nYm9yZ1ByaW1lID0gSGVsc2luZ2JvcmdQcmltZSB8fCB7fTtcbkhlbHNpbmdib3JnUHJpbWUuSGVscGVyID0gSGVsc2luZ2JvcmdQcmltZS5IZWxwZXIgfHwge307XG5cbkhlbHNpbmdib3JnUHJpbWUuSGVscGVyLlNjcm9sbEVsZXZhdG9yID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICB2YXIgZWxldmF0b3JTZWxlY3RvciA9ICcuc2Nyb2xsLWVsZXZhdG9yLXRvZ2dsZSc7XG4gICAgdmFyIHNjcm9sbFBvc0FkanVzdGVyID0gLTUwO1xuICAgIHZhciBzY3JvbFNwZWVkID0gNTAwO1xuXG4gICAgZnVuY3Rpb24gU2Nyb2xsRWxldmF0b3IoKSB7XG4gICAgICAgIGlmICgkKGVsZXZhdG9yU2VsZWN0b3IpLmxlbmd0aCA9PT0gMCkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyICRlbGV2YXRvclNlbGVjdG9yID0gJChlbGV2YXRvclNlbGVjdG9yKTtcblxuICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnW2hyZWY9XCIjZWxldmF0b3ItdG9wXCJdJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICQodGhpcykuYmx1cigpO1xuXG4gICAgICAgICAgICAkKCdodG1sLCBib2R5JykuYW5pbWF0ZSh7XG4gICAgICAgICAgICAgICAgc2Nyb2xsVG9wOiAwXG4gICAgICAgICAgICB9LCBzY3JvbFNwZWVkKTtcbiAgICAgICAgfSk7XG5cbiAgICAgICAgdGhpcy5hcHBlbmRFbGV2YXRvcigkZWxldmF0b3JTZWxlY3Rvcik7XG4gICAgICAgIHRoaXMuc2Nyb2xsU3B5KCRlbGV2YXRvclNlbGVjdG9yKTtcbiAgICB9XG5cbiAgICBTY3JvbGxFbGV2YXRvci5wcm90b3R5cGUuYXBwZW5kRWxldmF0b3IgPSBmdW5jdGlvbigkZWxldmF0b3JUYXJnZXQpIHtcbiAgICAgICAgdmFyIHNjcm9sbFRleHQgPSAnU2Nyb2xsIHVwJztcbiAgICAgICAgdmFyIHRvb2x0aXBUZXh0ID0gJyc7XG4gICAgICAgIHZhciB0b29sdGlwUG9zaXRpb24gPSAnJztcblxuICAgICAgICB2YXIgJGh0bWwgPSAkKCc8ZGl2IGNsYXNzPVwic2Nyb2xsLWVsZXZhdG9yXCI+PGEgaHJlZj1cIiNlbGV2YXRvci10b3BcIj48aT48L2k+PHNwYW4+PC9zcGFuPjwvYT48L2Rpdj4nKTtcblxuICAgICAgICBpZiAoSGVsc2luZ2JvcmdQcmltZS5BcmdzLmdldCgnc2Nyb2xsRWxldmF0b3IuY3RhJykpIHtcbiAgICAgICAgICAgIHNjcm9sbFRleHQgPSBIZWxzaW5nYm9yZ1ByaW1lLkFyZ3MuZ2V0KCdzY3JvbGxFbGV2YXRvci5jdGEnKTtcbiAgICAgICAgICAgICRodG1sLmZpbmQoJ2Egc3BhbicpLmh0bWwoc2Nyb2xsVGV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoSGVsc2luZ2JvcmdQcmltZS5BcmdzLmdldCgnc2Nyb2xsRWxldmF0b3IudG9vbHRpcCcpKSB7XG4gICAgICAgICAgICB0b29sdGlwVGV4dCA9IEhlbHNpbmdib3JnUHJpbWUuQXJncy5nZXQoJ3Njcm9sbEVsZXZhdG9yLnRvb2x0aXAnKTtcbiAgICAgICAgICAgICRodG1sLmZpbmQoJ2EnKS5hdHRyKCdkYXRhLXRvb2x0aXAnLCB0b29sdGlwVGV4dCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAoSGVsc2luZ2JvcmdQcmltZS5BcmdzLmdldCgnc2Nyb2xsRWxldmF0b3IudG9vbHRpcFBvc2l0aW9uJykpIHtcbiAgICAgICAgICAgIHRvb2x0aXBQb3NpdGlvbiA9IEhlbHNpbmdib3JnUHJpbWUuQXJncy5nZXQoJ3Njcm9sbEVsZXZhdG9yLnRvb2x0aXBQb3NpdGlvbicpO1xuICAgICAgICAgICAgJGh0bWwuZmluZCgnYScpLmF0dHIodG9vbHRpcFBvc2l0aW9uLCAnJyk7XG4gICAgICAgIH1cblxuICAgICAgICAkaHRtbC5hcHBlbmRUbygkZWxldmF0b3JUYXJnZXQpO1xuICAgIH07XG5cbiAgICBTY3JvbGxFbGV2YXRvci5wcm90b3R5cGUuc2Nyb2xsU3B5ID0gZnVuY3Rpb24oJGVsZXZhdG9yVGFyZ2V0KSB7XG4gICAgICAgIHZhciAkZG9jdW1lbnQgPSAkKGRvY3VtZW50KTtcbiAgICAgICAgdmFyICR3aW5kb3cgPSAkKHdpbmRvdyk7XG5cbiAgICAgICAgJGRvY3VtZW50Lm9uKCdzY3JvbGwgbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHZhciBzY3JvbGxUYXJnZXQgPSAkZWxldmF0b3JUYXJnZXQucG9zaXRpb24oKS50b3AgKyAkZWxldmF0b3JUYXJnZXQuaGVpZ2h0KCk7XG4gICAgICAgICAgICB2YXIgc2Nyb2xsUG9zID0gJGRvY3VtZW50LnNjcm9sbFRvcCgpICsgJHdpbmRvdy5oZWlnaHQoKSArIHNjcm9sbFBvc0FkanVzdGVyO1xuXG4gICAgICAgICAgICBpZiAoc2Nyb2xsUG9zIDwgc2Nyb2xsVGFyZ2V0KSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oaWRlRWxldmF0b3IoKTtcbiAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHRoaXMuc2hvd0VsZXZhdG9yKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfTtcblxuICAgIFNjcm9sbEVsZXZhdG9yLnByb3RvdHlwZS5zaG93RWxldmF0b3IgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgJCgnYm9keScpLmFkZENsYXNzKCdzaG93LXNjcm9sbC1lbGV2YXRvcicpO1xuICAgIH07XG5cbiAgICBTY3JvbGxFbGV2YXRvci5wcm90b3R5cGUuaGlkZUVsZXZhdG9yID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnc2hvdy1zY3JvbGwtZWxldmF0b3InKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBTY3JvbGxFbGV2YXRvcigpO1xuXG59KShqUXVlcnkpO1xuIiwiLy9cbi8vIEBuYW1lIExvY2FsIGxpbmtcbi8vIEBkZXNjcmlwdGlvbiAgRmluZHMgbGluayBpdGVtcyB3aXRoIG91dGJvdW5kIGxpbmtzIGFuZCBnaXZlcyB0aGVtIG91dGJvdW5kIGNsYXNzXG4vL1xuSGVsc2luZ2JvcmdQcmltZSA9IEhlbHNpbmdib3JnUHJpbWUgfHwge307XG5IZWxzaW5nYm9yZ1ByaW1lLkhlbHBlciA9IEhlbHNpbmdib3JnUHJpbWUuSGVscGVyIHx8IHt9O1xuXG5IZWxzaW5nYm9yZ1ByaW1lLkhlbHBlci5TdGlja3lTY3JvbGwgPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIHZhciBfc3RpY2t5RWxlbWVudHMgPSBbXTtcbiAgICB2YXIgX2lzRmxvYXRpbmdDbGFzcyA9ICdpcy1zdGlja3ktc2Nyb2xsJztcblxuICAgIGZ1bmN0aW9uIFN0aWNreVNjcm9sbCgpIHtcbiAgICAgICAgJChkb2N1bWVudCkucmVhZHkoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgU3RpY2t5U2Nyb2xsLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oKSB7XG4gICAgICAgIHZhciAkZWxlbWVudHMgPSAkKCcuc3RpY2t5LXNjcm9sbCcpO1xuXG4gICAgICAgICRlbGVtZW50cy5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgICAgdmFyICRlbGVtZW50ID0gJChlbGVtZW50KTtcblxuICAgICAgICAgICAgX3N0aWNreUVsZW1lbnRzLnB1c2goe1xuICAgICAgICAgICAgICAgIGVsZW1lbnQ6ICRlbGVtZW50LFxuICAgICAgICAgICAgICAgIG9mZnNldFRvcDogJGVsZW1lbnQub2Zmc2V0KCkudG9wXG4gICAgICAgICAgICB9KVxuICAgICAgICB9KTtcblxuICAgICAgICAkKHdpbmRvdykub24oJ3Njcm9sbCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHRoaXMuc2Nyb2xsaW5nKCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdGhpcy5zY3JvbGxpbmcoKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogUnVucyB3aGVuIHNjcm9sbGluZ1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgU3RpY2t5U2Nyb2xsLnByb3RvdHlwZS5zY3JvbGxpbmcgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHNjcm9sbE9mZnNldCA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcblxuICAgICAgICBpZiAoJCgnYm9keScpLmhhc0NsYXNzKCdhZG1pbi1iYXInKSkge1xuICAgICAgICAgICAgc2Nyb2xsT2Zmc2V0ICs9IDMyO1xuXG4gICAgICAgICAgICBpZiAoJCh3aW5kb3cpLndpZHRoKCkgPCA3ODMpIHtcbiAgICAgICAgICAgICAgICBzY3JvbGxPZmZzZXQgKz0gMTQ7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICAkLmVhY2goX3N0aWNreUVsZW1lbnRzLCBmdW5jdGlvbiAoaW5kZXgsIGl0ZW0pIHtcbiAgICAgICAgICAgIGlmIChzY3JvbGxPZmZzZXQgPiBpdGVtLm9mZnNldFRvcCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnN0aWNrKGl0ZW0uZWxlbWVudCk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIHJldHVybiB0aGlzLnVuc3RpY2soaXRlbS5lbGVtZW50KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogTWFrZXMgYSBlbGVtZW50IHN0aWNreVxuICAgICAqIEBwYXJhbSAge29iamVjdH0gJGVsZW1lbnQgalF1ZXJ5IGVsZW1lbnRcbiAgICAgKiBAcmV0dXJuIHtib29sfVxuICAgICAqL1xuICAgIFN0aWNreVNjcm9sbC5wcm90b3R5cGUuc3RpY2sgPSBmdW5jdGlvbigkZWxlbWVudCkge1xuICAgICAgICBpZiAoJGVsZW1lbnQuaGFzQ2xhc3MoX2lzRmxvYXRpbmdDbGFzcykpIHtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghJGVsZW1lbnQuaGFzQ2xhc3MoJ25hdmJhci10cmFuc3BhcmVudCcpKSB7XG4gICAgICAgICAgICB0aGlzLmFkZEFuY2hvcigkZWxlbWVudCk7XG4gICAgICAgIH1cblxuICAgICAgICAkZWxlbWVudC5hZGRDbGFzcyhfaXNGbG9hdGluZ0NsYXNzKTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIE1ha2VzIGEgZWxlbWVudCBub24tc3RpY2t5XG4gICAgICogQHBhcmFtICB7b2JqZWN0fSAkZWxlbWVudCBqUXVlcnkgZWxlbWVudFxuICAgICAqIEByZXR1cm4ge2Jvb2x9XG4gICAgICovXG4gICAgU3RpY2t5U2Nyb2xsLnByb3RvdHlwZS51bnN0aWNrID0gZnVuY3Rpb24oJGVsZW1lbnQpIHtcbiAgICAgICAgaWYgKCEkZWxlbWVudC5oYXNDbGFzcyhfaXNGbG9hdGluZ0NsYXNzKSkge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKCEkZWxlbWVudC5oYXNDbGFzcygnbmF2YmFyLXRyYW5zcGFyZW50JykpIHtcbiAgICAgICAgICAgIHRoaXMucmVtb3ZlQW5jaG9yKCRlbGVtZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgICRlbGVtZW50LnJlbW92ZUNsYXNzKF9pc0Zsb2F0aW5nQ2xhc3MpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgU3RpY2t5U2Nyb2xsLnByb3RvdHlwZS5hZGRBbmNob3IgPSBmdW5jdGlvbigkZWxlbWVudCkge1xuICAgICAgICAkKCc8ZGl2IGNsYXNzPVwic3RpY2t5LXNjcm9sbC1hbmNob3JcIj48L2Rpdj4nKS5oZWlnaHQoJGVsZW1lbnQub3V0ZXJIZWlnaHQoKSkuaW5zZXJ0QmVmb3JlKCRlbGVtZW50KTtcbiAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgfTtcblxuICAgIFN0aWNreVNjcm9sbC5wcm90b3R5cGUucmVtb3ZlQW5jaG9yID0gZnVuY3Rpb24oJGVsZW1lbnQpIHtcbiAgICAgICAgJGVsZW1lbnQucHJldignLnN0aWNreS1zY3JvbGwtYW5jaG9yJykucmVtb3ZlKCk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IFN0aWNreVNjcm9sbCgpO1xuXG59KShqUXVlcnkpO1xuIiwiSGVsc2luZ2JvcmdQcmltZSA9IEhlbHNpbmdib3JnUHJpbWUgfHwge307XG5IZWxzaW5nYm9yZ1ByaW1lLkhlbHBlciA9IEhlbHNpbmdib3JnUHJpbWUuSGVscGVyIHx8IHt9O1xuXG5IZWxzaW5nYm9yZ1ByaW1lLkhlbHBlci5UYWJsZUZpbHRlciA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgZnVuY3Rpb24gVGFibGVGaWx0ZXIoKSB7XG4gICAgICAgICQoJ1tkYXRhLXRhYmxlLWZpbHRlcl0nKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgICAgdGhpcy5pbml0KGVsZW1lbnQpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIFRhYmxlRmlsdGVyLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICB2YXIgJGxpc3QgPSAkKGVsZW1lbnQpO1xuICAgICAgICB2YXIgbGlzdElkID0gJGxpc3QuYXR0cignZGF0YS10YWJsZS1maWx0ZXInKTtcbiAgICAgICAgdmFyICRpbnB1dCA9ICQoJ1tkYXRhLXRhYmxlLWZpbHRlci1pbnB1dD1cIicgKyBsaXN0SWQgKyAnXCJdJyk7XG5cbiAgICAgICAgJGlucHV0Lm9uKCdpbnB1dCcsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAkbGlzdC5maW5kKCdbZGF0YS10YWJsZS1maWx0ZXItZW1wdHldJykucmVtb3ZlKCk7XG5cbiAgICAgICAgICAgICRsaXN0LmZpbmQoJ3Rib2R5IHRyOm5vdChbZGF0YS10YWJsZS1maWx0ZXItZXhjbHVkZV0pOmljb250YWlucygnICsgJGlucHV0LnZhbCgpICsgJyknKS5zaG93KCk7XG4gICAgICAgICAgICAkbGlzdC5maW5kKCd0Ym9keSB0cjpub3QoW2RhdGEtdGFibGUtZmlsdGVyLWV4Y2x1ZGVdKTpub3QoOmljb250YWlucygnICsgJGlucHV0LnZhbCgpICsgJykpJykuaGlkZSgpO1xuXG4gICAgICAgICAgICBpZiAoJGxpc3QuZmluZCgndGJvZHkgdHI6bm90KFtkYXRhLXRhYmxlLWZpbHRlci1leGNsdWRlXSk6dmlzaWJsZScpLmxlbmd0aCA9PT0gMCAmJiAkbGlzdC5maW5kKCdbZGF0YS10YWJsZS1maWx0ZXItZW1wdHldJykubGVuZ3RoID09PSAwKSB7XG4gICAgICAgICAgICAgICAgJGxpc3QuZmluZCgndGJvZHkgdHI6bm90KFtkYXRhLXRhYmxlLWZpbHRlci1leGNsdWRlXSk6Zmlyc3QnKS5iZWZvcmUoJzx0ciBkYXRhLXRhYmxlLWZpbHRlci1lbXB0eT48dGQgY29sc3Bhbj1cIjUwXCI+JyArIEhlbHNpbmdib3JnUHJpbWUuQXJncy5nZXQoJ3RhYmxlRmlsdGVyLmVtcHR5JykgKyAnPC90ZD48L3RyPicpXG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IFRhYmxlRmlsdGVyKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCJIZWxzaW5nYm9yZ1ByaW1lID0gSGVsc2luZ2JvcmdQcmltZSB8fCB7fTtcbkhlbHNpbmdib3JnUHJpbWUuSGVscGVyID0gSGVsc2luZ2JvcmdQcmltZS5IZWxwZXIgfHwge307XG5cbkhlbHNpbmdib3JnUHJpbWUuSGVscGVyLlRvZ2dsZSA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgZnVuY3Rpb24gVG9nZ2xlKCkge1xuICAgICAgICAkKCdbZGF0YS10b2dnbGVdJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHZhciB0b2dnbGVUYXJnZXQgPSAkKHRoaXMpLmF0dHIoJ2RhdGEtdG9nZ2xlJyk7XG4gICAgICAgICAgICB2YXIgdG9nZ2xlVGV4dCA9ICQodGhpcykuYXR0cignZGF0YS10b2dnbGUtdGV4dCcpO1xuICAgICAgICAgICAgdmFyIHRvZ2dsZUNsYXNzID0gJCh0aGlzKS5hdHRyKCdkYXRhLXRvZ2dsZS1jbGFzcycpO1xuXG4gICAgICAgICAgICAvLyBUb2dnbGUgdGhlIHRhcmdldFxuICAgICAgICAgICAgdmFyICR0b2dnbGVUYXJnZXQgPSAkKHRvZ2dsZVRhcmdldCk7XG4gICAgICAgICAgICAkdG9nZ2xlVGFyZ2V0LnNsaWRlVG9nZ2xlKDIwMCk7XG5cbiAgICAgICAgICAgIC8vIFN3aXRjaCB0ZXh0XG4gICAgICAgICAgICAkKHRoaXMpLmF0dHIoJ2RhdGEtdG9nZ2xlLXRleHQnLCAkKHRoaXMpLnRleHQoKSk7XG4gICAgICAgICAgICAkKHRoaXMpLnRleHQodG9nZ2xlVGV4dCk7XG5cbiAgICAgICAgICAgIC8vIFN3aXRjaCBjbGFzc1xuICAgICAgICAgICAgJCh0aGlzKS5hdHRyKCdkYXRhLXRvZ2dsZS1jbGFzcycsICQodGhpcykuYXR0cignY2xhc3MnKSk7XG4gICAgICAgICAgICAkKHRoaXMpLmF0dHIoJ2NsYXNzJywgdG9nZ2xlQ2xhc3MpO1xuICAgICAgICB9KTtcbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFRvZ2dsZSgpO1xuXG59KShqUXVlcnkpO1xuIiwiSGVsc2luZ2JvcmdQcmltZSA9IEhlbHNpbmdib3JnUHJpbWUgfHwge307XG5IZWxzaW5nYm9yZ1ByaW1lLkhlbHBlciA9IEhlbHNpbmdib3JnUHJpbWUuSGVscGVyIHx8IHt9O1xuXG5IZWxzaW5nYm9yZ1ByaW1lLkhlbHBlci5Ub2dnbGVTdWJtZW51SXRlbXMgPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIGZ1bmN0aW9uIFRvZ2dsZVN1Ym1lbnVJdGVtcygpIHtcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgVG9nZ2xlU3VibWVudUl0ZW1zLnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VsZiA9IHRoaXM7XG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdidXR0b25bZGF0YS1sb2FkLXN1Ym1lbnVdJywgZnVuY3Rpb24oZSkge1xuICAgICAgICAgICAgZS5wcmV2ZW50RGVmYXVsdCgpO1xuXG4gICAgICAgICAgICBpZiAoIXNlbGYudXNlQWpheCh0aGlzKSkge1xuICAgICAgICAgICAgICAgIHNlbGYudG9nZ2xlU2libGluZyh0aGlzKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgc2VsZi5hamF4TG9hZEl0ZW1zKHRoaXMpO1xuICAgICAgICAgICAgICAgIHNlbGYudG9nZ2xlU2libGluZyh0aGlzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSk7XG4gICAgfTtcblxuICAgIFRvZ2dsZVN1Ym1lbnVJdGVtcy5wcm90b3R5cGUudXNlQWpheCA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgaWYgKCQodGFyZ2V0KS5jbG9zZXN0KCdsaScpLmZpcnN0KCkuY2hpbGRyZW4oXCJ1bFwiKS5sZW5ndGgpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICBUb2dnbGVTdWJtZW51SXRlbXMucHJvdG90eXBlLmFqYXhMb2FkSXRlbXMgPSBmdW5jdGlvbiAodGFyZ2V0KSB7XG4gICAgICAgIHZhciBtYXJrdXAgPSAnJztcbiAgICAgICAgdmFyIHBhcmVudElkID0gdGhpcy5nZXRJdGVtSWQodGFyZ2V0KTtcblxuICAgICAgICBpZih0eXBlb2YgcGFyZW50SWQgPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJCh0YXJnZXQpLnNpYmxpbmdzKFwiYVwiKS5hdHRyKCdocmVmJyk7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAkKHRhcmdldCkuY2xvc2VzdCgnbGknKS5maXJzdCgpLmFkZENsYXNzKCdpcy1sb2FkaW5nJyk7XG5cbiAgICAgICAgJC5hamF4KHtcbiAgICAgICAgICAgIHVybDogSGJnUHJpbWVBcmdzLmFwaS5yb290ICsgJ211bmljaXBpby92MS9uYXZpZ2F0aW9uLycgKyBwYXJlbnRJZCxcbiAgICAgICAgICAgIG1ldGhvZDogJ0dFVCcsXG4gICAgICAgICAgICBiZWZvcmVTZW5kOiBmdW5jdGlvbiAoeGhyKSB7XG4gICAgICAgICAgICAgICAgeGhyLnNldFJlcXVlc3RIZWFkZXIoJ1gtV1AtTm9uY2UnLCBIYmdQcmltZUFyZ3MuYXBpLm5vbmNlKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSkuZG9uZShmdW5jdGlvbiAocmVzcG9uc2UpIHtcbiAgICAgICAgICAgIGlmIChyZXNwb25zZS5sZW5ndGggIT09IFwiXCIpIHtcbiAgICAgICAgICAgICAgICAkKHRhcmdldCkuY2xvc2VzdCgnbGknKS5maXJzdCgpLmFwcGVuZChyZXNwb25zZSk7XG4gICAgICAgICAgICAgICAgJCh0YXJnZXQpLnNpYmxpbmdzKCcuc3ViLW1lbnUnKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2F0aW9uLmhyZWYgPSAkKHRhcmdldCkuYXR0cignaHJlZicpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAkKHRhcmdldCkuY2xvc2VzdCgnbGknKS5maXJzdCgpLnJlbW92ZUNsYXNzKCdpcy1sb2FkaW5nJyk7XG4gICAgICAgIH0uYmluZCh0YXJnZXQpKS5mYWlsKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5ocmVmID0gJCh0YXJnZXQpLmF0dHIoJ2hyZWYnKTtcbiAgICAgICAgfS5iaW5kKHRhcmdldCkpO1xuICAgIH07XG5cbiAgICBUb2dnbGVTdWJtZW51SXRlbXMucHJvdG90eXBlLmdldEl0ZW1JZCA9IGZ1bmN0aW9uICh0YXJnZXQpIHtcbiAgICAgICAgcmV0dXJuICQodGFyZ2V0KS5kYXRhKCdsb2FkLXN1Ym1lbnUnKTtcbiAgICB9O1xuXG4gICAgVG9nZ2xlU3VibWVudUl0ZW1zLnByb3RvdHlwZS50b2dnbGVTaWJsaW5nID0gZnVuY3Rpb24gKHRhcmdldCkge1xuICAgICAgICAkKHRhcmdldCkuY2xvc2VzdCgnbGknKS5maXJzdCgpLnRvZ2dsZUNsYXNzKCdpcy1leHBhbmRlZCcpO1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IFRvZ2dsZVN1Ym1lbnVJdGVtcygpO1xuXG59KShqUXVlcnkpO1xuIiwiLy9cbi8vIEBuYW1lIE1lbnVcbi8vIEBkZXNjcmlwdGlvbiAgRnVuY3Rpb24gZm9yIGNsb3NpbmcgdGhlIG1lbnUgKGNhbm5vdCBiZSBkb25lIHdpdGgganVzdCA6dGFyZ2V0IHNlbGVjdG9yKVxuLy9cbkhlbHNpbmdib3JnUHJpbWUgPSBIZWxzaW5nYm9yZ1ByaW1lIHx8IHt9O1xuSGVsc2luZ2JvcmdQcmltZS5IZWxwZXIgPSBIZWxzaW5nYm9yZ1ByaW1lLkhlbHBlciB8fCB7fTtcblxuSGVsc2luZ2JvcmdQcmltZS5IZWxwZXIuRGF0ZXBpY2tlciA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgZnVuY3Rpb24gRGF0ZXBpY2tlcigpIHtcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgRGF0ZXBpY2tlci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgLy8gU2luZ2xlIGRhdGVcbiAgICAgICAgJCgnLmRhdGVwaWNrZXInKS5kYXRlcGlja2VyKHtcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6ICd5eS1tbS1kZCcsXG4gICAgICAgICAgICBmaXJzdERheTogMSxcbiAgICAgICAgICAgIHNob3dPdGhlck1vbnRoczogdHJ1ZSxcbiAgICAgICAgICAgIHNlbGVjdE90aGVyTW9udGhzOiB0cnVlXG4gICAgICAgIH0pO1xuXG4gICAgICAgIC8vIERhdGUgcmFuZ2VcbiAgICAgICAgJCgnLmRhdGVwaWNrZXItcmFuZ2UuZGF0ZXBpY2tlci1yYW5nZS1mcm9tJykuZGF0ZXBpY2tlcih7XG4gICAgICAgICAgICBkYXRlRm9ybWF0OiAneXktbW0tZGQnLFxuICAgICAgICAgICAgZmlyc3REYXk6IDEsXG4gICAgICAgICAgICBzaG93T3RoZXJNb250aHM6IHRydWUsXG4gICAgICAgICAgICBzZWxlY3RPdGhlck1vbnRoczogdHJ1ZSxcbiAgICAgICAgICAgIG9uQ2xvc2U6IGZ1bmN0aW9uKHNlbGVjdGVkRGF0ZSkge1xuICAgICAgICAgICAgICAgICQoJy5kYXRlcGlja2VyLXJhbmdlLmRhdGVwaWNrZXItcmFuZ2UtdG8nKS5kYXRlcGlja2VyKCdvcHRpb24nLCAnbWluRGF0ZScsIHNlbGVjdGVkRGF0ZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0pO1xuXG4gICAgICAgICQoJy5kYXRlcGlja2VyLXJhbmdlLmRhdGVwaWNrZXItcmFuZ2UtdG8nKS5kYXRlcGlja2VyKHtcbiAgICAgICAgICAgIGRhdGVGb3JtYXQ6ICd5eS1tbS1kZCcsXG4gICAgICAgICAgICBmaXJzdERheTogMSxcbiAgICAgICAgICAgIHNob3dPdGhlck1vbnRoczogdHJ1ZSxcbiAgICAgICAgICAgIHNlbGVjdE90aGVyTW9udGhzOiB0cnVlLFxuICAgICAgICAgICAgb25DbG9zZTogZnVuY3Rpb24oc2VsZWN0ZWREYXRlKSB7XG4gICAgICAgICAgICAgICAgJCgnLmRhdGVwaWNrZXItcmFuZ2UuZGF0ZXBpY2tlci1yYW5nZS1mcm9tJykuZGF0ZXBpY2tlcignb3B0aW9uJywgJ21heERhdGUnLCBzZWxlY3RlZERhdGUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBEYXRlcGlja2VyKCk7XG5cbn0pKGpRdWVyeSk7XG5cbi8qIERhdGVwaWNrZXIgbGFuZ3VhZ2UgKi9cbihmdW5jdGlvbihmYWN0b3J5KSB7XG4gICAgaWYgKHR5cGVvZiBkZWZpbmUgPT09IFwiZnVuY3Rpb25cIiAmJiBkZWZpbmUuYW1kKSB7XG4gICAgICAgIGRlZmluZShbXCIuLi93aWRnZXRzL2RhdGVwaWNrZXJcIl0sIGZhY3RvcnkpO1xuICAgIH0gZWxzZSB7XG4gICAgICAgIGZhY3RvcnkoIGpRdWVyeS5kYXRlcGlja2VyICk7XG4gICAgfVxufShmdW5jdGlvbihkYXRlcGlja2VyKSB7XG4gICAgZGF0ZXBpY2tlci5yZWdpb25hbC5zdiA9IHtcbiAgICAgICAgY2xvc2VUZXh0OiBcIlN0w6RuZ1wiLFxuICAgICAgICBwcmV2VGV4dDogXCImI3hBQjtGw7ZycmFcIixcbiAgICAgICAgbmV4dFRleHQ6IFwiTsOkc3RhJiN4QkI7XCIsXG4gICAgICAgIGN1cnJlbnRUZXh0OiBcIklkYWdcIixcbiAgICAgICAgbW9udGhOYW1lczogWyBcIkphbnVhcmlcIixcIkZlYnJ1YXJpXCIsXCJNYXJzXCIsXCJBcHJpbFwiLFwiTWFqXCIsXCJKdW5pXCIsXG4gICAgICAgIFwiSnVsaVwiLFwiQXVndXN0aVwiLFwiU2VwdGVtYmVyXCIsXCJPa3RvYmVyXCIsXCJOb3ZlbWJlclwiLFwiRGVjZW1iZXJcIiBdLFxuICAgICAgICBtb250aE5hbWVzU2hvcnQ6IFsgXCJKYW5cIixcIkZlYlwiLFwiTWFyXCIsXCJBcHJcIixcIk1halwiLFwiSnVuXCIsXG4gICAgICAgIFwiSnVsXCIsXCJBdWdcIixcIlNlcFwiLFwiT2t0XCIsXCJOb3ZcIixcIkRlY1wiIF0sXG4gICAgICAgIGRheU5hbWVzU2hvcnQ6IFsgXCJTw7ZuXCIsXCJNw6VuXCIsXCJUaXNcIixcIk9uc1wiLFwiVG9yXCIsXCJGcmVcIixcIkzDtnJcIiBdLFxuICAgICAgICBkYXlOYW1lczogWyBcIlPDtm5kYWdcIixcIk3DpW5kYWdcIixcIlRpc2RhZ1wiLFwiT25zZGFnXCIsXCJUb3JzZGFnXCIsXCJGcmVkYWdcIixcIkzDtnJkYWdcIiBdLFxuICAgICAgICBkYXlOYW1lc01pbjogWyBcIlPDtlwiLFwiTcOlXCIsXCJUaVwiLFwiT25cIixcIlRvXCIsXCJGclwiLFwiTMO2XCIgXSxcbiAgICAgICAgd2Vla0hlYWRlcjogXCJWZVwiLFxuICAgICAgICBkYXRlRm9ybWF0OiBcInl5LW1tLWRkXCIsXG4gICAgICAgIGZpcnN0RGF5OiAxLFxuICAgICAgICBpc1JUTDogZmFsc2UsXG4gICAgICAgIHNob3dNb250aEFmdGVyWWVhcjogZmFsc2UsXG4gICAgICAgIHllYXJTdWZmaXg6IFwiXCIgfTtcbiAgICBkYXRlcGlja2VyLnNldERlZmF1bHRzKGRhdGVwaWNrZXIucmVnaW9uYWwuc3YpO1xuXG4gICAgcmV0dXJuIGRhdGVwaWNrZXIucmVnaW9uYWwuc3Y7XG59KSk7XG4iLCIvL1xuLy8gQG5hbWUgRXF1YWxIZWlnaHRcbi8vIEBkZXNjcmlwdGlvbiAgU2V0cyBlbGVtZW50IGhlaWdodHMgZXF1YWxseSB0byB0aGUgaGVpZ2hlc3QgaXRlbVxuLy9cbi8vIEBtYXJrdXBcbi8vIDxkaXYgY2xhc3M9XCJncmlkXCIgZGF0YS1lcXVhbC1jb250YWluZXI+XG4vLyAgICAgPGRpdiBjbGFzcz1cImdyaWQtbWQtNlwiIGRhdGEtZXF1YWwtaXRlbT5cbi8vXG4vLyAgICAgPC9kaXY+XG4vLyAgICAgPGRpdiBjbGFzcz1cImdyaWQtbWQtNlwiIGRhdGEtZXF1YWwtaXRlbT5cbi8vXG4vLyAgICAgPC9kaXY+XG4vLyA8L2Rpdj5cbi8vXG5IZWxzaW5nYm9yZ1ByaW1lID0gSGVsc2luZ2JvcmdQcmltZSB8fCB7fTtcbkhlbHNpbmdib3JnUHJpbWUuSGVscGVyID0gSGVsc2luZ2JvcmdQcmltZS5IZWxwZXIgfHwge307XG5cbkhlbHNpbmdib3JnUHJpbWUuSGVscGVyLkVxdWFsSGVpZ2h0ID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICBmdW5jdGlvbiBFcXVhbEhlaWdodCgpIHtcbiAgICAgICAgLy8gSW5pdGlhbGl6ZSBpZiBmbGV4Ym94IG5vdCBzdXBwb3J0ZWRcbiAgICAgICAgaWYgKCF0aGlzLnN1cHBvcnRzRmxleGJveCgpKSB7XG4gICAgICAgICAgICBcbiAgICAgICAgICAgICQod2luZG93KS5vbignbG9hZCcsIGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXQoKTtcblxuICAgICAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5kZXN0cm95KCk7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLyoqXG4gICAgICogQ2hlY2sgaWYgYnJvd3NlciBzdXBwb3J0cyBmbGV4Ym94XG4gICAgICogQHJldHVybiB7Ym9vbGVhbn1cbiAgICAgKi9cbiAgICBFcXVhbEhlaWdodC5wcm90b3R5cGUuc3VwcG9ydHNGbGV4Ym94ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoJCgnaHRtbCcpLmhhc0NsYXNzKCduby1mbGV4Ym94JykpIHtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXNldHMgaGVpZ2h0cyB0byBhdXRvXG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBFcXVhbEhlaWdodC5wcm90b3R5cGUuZGVzdHJveSA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCgnW2RhdGEtZXF1YWwtY29udGFpbmVyXSBbZGF0YS1lcXVhbC1pdGVtXScpLmVhY2goZnVuY3Rpb24gKGluZGV4LCBlbGVtZW50KSB7XG4gICAgICAgICAgICAkKGVsZW1lbnQpLmNzcygnaGVpZ2h0JywgJ2F1dG8nKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogSW50aWFsaXplcyBlcXVhbCBoZWlnaHRcbiAgICAgKiBAcmV0dXJuIHt2b2lkfVxuICAgICAqL1xuICAgIEVxdWFsSGVpZ2h0LnByb3RvdHlwZS5pbml0ID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkKCdbZGF0YS1lcXVhbC1jb250YWluZXJdJykuZWFjaChmdW5jdGlvbiAoaW5kZXgsIGVsZW1lbnQpIHtcbiAgICAgICAgICAgIHZhciBtYXhIZWlnaHQgPSB0aGlzLmdldE1heEhlaWdodChlbGVtZW50KTtcbiAgICAgICAgICAgIHRoaXMuZXF1YWxpemUoZWxlbWVudCwgbWF4SGVpZ2h0KTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9O1xuXG4gICAgLyoqXG4gICAgICogR2V0IHRoZSBtYXggaGVpZ2h0IG9mIHRoZSBpdGVtc1xuICAgICAqIEBwYXJhbSAge3N0cmluZ30gZWwgVGhlIHBhcmVudCBlbGVtZW50XG4gICAgICogQHJldHVybiB7aW50ZWdlcn0gICBUaGUgbWF4IGhlaWdodCBpbiBwaXhlbHNcbiAgICAgKi9cbiAgICBFcXVhbEhlaWdodC5wcm90b3R5cGUuZ2V0TWF4SGVpZ2h0ID0gZnVuY3Rpb24gKGVsKSB7XG4gICAgICAgIHZhciBoZWlnaHRzID0gW107XG5cbiAgICAgICAgJChlbCkuZmluZCgnW2RhdGEtZXF1YWwtaXRlbV0nKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgICAgaGVpZ2h0cy5wdXNoKCQoZWxlbWVudCkub3V0ZXJIZWlnaHQoKSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICAgICAgdmFyIG1heEhlaWdodCA9IE1hdGgubWF4LmFwcGx5KG51bGwsIGhlaWdodHMpO1xuXG4gICAgICAgIHJldHVybiBtYXhIZWlnaHQ7XG4gICAgfTtcblxuICAgIC8qKlxuICAgICAqIFNldCB0aGUgaGVpZ2h0cyBvZiBhbGwgaXRlbXMgdG8gdGhlIG1heCBoZWlnaHRcbiAgICAgKiBAcGFyYW0gIHtzdHJpbmd9ICBwYXJlbnQgICAgVGhlIHBhcmVudCBlbGVtZW50XG4gICAgICogQHBhcmFtICB7aW50ZWdlcn0gbWF4SGVpZ2h0IFRoZSBtYXggaGVpZ2h0XG4gICAgICogQHJldHVybiB7dm9pZH1cbiAgICAgKi9cbiAgICBFcXVhbEhlaWdodC5wcm90b3R5cGUuZXF1YWxpemUgPSBmdW5jdGlvbihwYXJlbnQsIG1heEhlaWdodCkge1xuICAgICAgICAkKHBhcmVudCkuZmluZCgnW2RhdGEtZXF1YWwtaXRlbV0nKS5lYWNoKGZ1bmN0aW9uIChpbmRleCwgZWxlbWVudCkge1xuICAgICAgICAgICAgJChlbGVtZW50KS5jc3MoJ2hlaWdodCcsIG1heEhlaWdodCArICdweCcpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IEVxdWFsSGVpZ2h0KCk7XG5cbn0pKGpRdWVyeSk7XG4iLCIvL1xuLy8gQG5hbWUgTWVudVxuLy8gQGRlc2NyaXB0aW9uICBGdW5jdGlvbiBmb3IgY2xvc2luZyB0aGUgbWVudSAoY2Fubm90IGJlIGRvbmUgd2l0aCBqdXN0IDp0YXJnZXQgc2VsZWN0b3IpXG4vL1xuSGVsc2luZ2JvcmdQcmltZSA9IEhlbHNpbmdib3JnUHJpbWUgfHwge307XG5IZWxzaW5nYm9yZ1ByaW1lLkhlbHBlciA9IEhlbHNpbmdib3JnUHJpbWUuSGVscGVyIHx8IHt9O1xuXG5IZWxzaW5nYm9yZ1ByaW1lLkhlbHBlci5NZW51ID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICBmdW5jdGlvbiBNZW51KCkge1xuICAgIFx0dGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgTWVudS5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcblx0ICAgIHRoaXMuYmluZEV2ZW50cygpO1xuICAgIH07XG5cbiAgICBNZW51LnByb3RvdHlwZS50b2dnbGVNZW51ID0gZnVuY3Rpb24odHJpZ2dlckJ0bikge1xuICAgICAgICB0cmlnZ2VyQnRuLnRvZ2dsZUNsYXNzKCdvcGVuJyk7XG5cbiAgICAgICAgdmFyIHRhcmdldCA9ICQodHJpZ2dlckJ0bi5kYXRhKCd0YXJnZXQnKSk7XG5cbiAgICAgICAgaWYgKHRhcmdldC5oYXNDbGFzcygnbmF2LXRvZ2dsZS1leHBhbmQnKSkge1xuICAgICAgICAgICAgdGFyZ2V0LnNsaWRlVG9nZ2xlKCk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICB0YXJnZXQudG9nZ2xlQ2xhc3MoJ29wZW4nKTtcbiAgICAgICAgfVxuXG4gICAgICAgICQoJ2JvZHknKS50b2dnbGVDbGFzcygnbW9iaWxlLW1lbnUtb3BlbicpO1xuICAgIH07XG5cbiAgICBNZW51LnByb3RvdHlwZS5iaW5kRXZlbnRzID0gZnVuY3Rpb24gKCkge1xuICAgICAgICAkKCcubWVudS10cmlnZ2VyJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlTWVudSgkKGUudGFyZ2V0KS5jbG9zZXN0KCcubWVudS10cmlnZ2VyJykpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH07XG5cbiAgICByZXR1cm4gbmV3IE1lbnUoKTtcblxufSkoalF1ZXJ5KTtcbiIsIi8vXG4vLyBAbmFtZSBNZW51IHByaW9yaXR5XG4vL1xuSGVsc2luZ2JvcmdQcmltZSA9IEhlbHNpbmdib3JnUHJpbWUgfHwge307XG5IZWxzaW5nYm9yZ1ByaW1lLkhlbHBlciA9IEhlbHNpbmdib3JnUHJpbWUuSGVscGVyIHx8IHt9O1xuXG5IZWxzaW5nYm9yZ1ByaW1lLkhlbHBlci5NZW51UHJpb3JpdHkgPSAoZnVuY3Rpb24gKCQpIHtcblxuICAgIHZhciAkbmF2ID0gbnVsbDtcbiAgICB2YXIgJGJ0biA9IG51bGw7XG4gICAgdmFyICR2bGlua3MgPSBudWxsO1xuICAgIHZhciAkaGxpbmtzID0gbnVsbDtcblxuICAgIHZhciBhdmFpbGFibGVTcGFjZSA9IDA7XG4gICAgdmFyIGJyZWFrcyA9IFtdO1xuICAgIHZhciBicmVha1dhc1R3b09yTW9yZSA9IGZhbHNlO1xuXG4gICAgZnVuY3Rpb24gTWVudVByaW9yaXR5KCkge1xuICAgICAgICBpZiAoJCgnLmhlYWRlci1qdW1ibycpLmxlbmd0aCA+IDAgJiYgISQoJyNtYWluLW1lbnUnKS5oYXNDbGFzcygnbmF2LWp1c3RpZnknKSAmJiAhJCgnLmhlYWRlci1qdW1ibycpLmhhc0NsYXNzKCduYXYtbm8tb3ZlcmZsb3cnKSkge1xuICAgICAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBNZW51UHJpb3JpdHkucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICRuYXYgPSAkKCcjbWFpbi1tZW51JykucGFyZW50KCcubmF2LWdyb3VwLW92ZXJmbG93Jyk7XG4gICAgICAgICR2bGlua3MgPSAkKCcjbWFpbi1tZW51Jyk7XG4gICAgICAgICRobGlua3MgPSAkbmF2LmZpbmQoJy5uYXYtZ3JvdXBlZC1vdmVyZmxvdycpO1xuICAgICAgICAkYnRuID0gJG5hdi5maW5kKCcuZHJvcGRvd24tdG9nZ2xlJyk7XG5cbiAgICAgICAgdGhpcy51cGRhdGVOYXZpZ2F0aW9uKCk7XG5cbiAgICAgICAgJCh3aW5kb3cpLm9uKCdyZXNpemUnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVOYXZpZ2F0aW9uKCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfTtcblxuICAgIE1lbnVQcmlvcml0eS5wcm90b3R5cGUudXBkYXRlTmF2aWdhdGlvbiA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgYXZhaWxhYmxlU3BhY2UgPSAkYnRuLmlzKCc6dmlzaWJsZScpID8gJG5hdi5wYXJlbnQoKS5maXJzdCgpLndpZHRoKCkgLSAoJGJ0bi53aWR0aCgpICsgcGFyc2VGbG9hdCgkbmF2LmF0dHIoJ2RhdGEtYnRuLXdpZHRoJykpKSA6ICRuYXYucGFyZW50KCkuZmlyc3QoKS53aWR0aCgpO1xuXG4gICAgICAgIGlmIChicmVha3MubGVuZ3RoID09IDEgJiYgYnJlYWtXYXNUd29Pck1vcmUgPT09IHRydWUpIHtcbiAgICAgICAgICAgIGF2YWlsYWJsZVNwYWNlID0gJG5hdi5wYXJlbnQoKS5maXJzdCgpLndpZHRoKCk7XG4gICAgICAgICAgICBicmVha1dhc1R3b09yTW9yZT0gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUaGUgdmlzaWJsZSBsaXN0IGlzIG92ZXJmbG93aW5nIHRoZSBhdmFpbGFibGUgc3BhY2VcbiAgICAgICAgaWYgKCR2bGlua3Mud2lkdGgoKSA+IDAgJiYgJHZsaW5rcy53aWR0aCgpID4gYXZhaWxhYmxlU3BhY2UpIHtcblxuICAgICAgICAgICAgLy8gUmVjb3JkIHZsaW5rcyB3aWR0aFxuICAgICAgICAgICAgYnJlYWtzLnB1c2goJHZsaW5rcy53aWR0aCgpKTtcblxuICAgICAgICAgICAgLy8gTW92ZSBsYXN0IGVsZW1lbnQgdG8gdGhlIGdyb3VwZWQgaXRlbXNcbiAgICAgICAgICAgICR2bGlua3MuY2hpbGRyZW4oKS5sYXN0KCkucHJlcGVuZFRvKCRobGlua3MpO1xuICAgICAgICAgICAgJGhsaW5rcy5yZW1vdmVDbGFzcygnaGlkZGVuJyk7XG4gICAgICAgICAgICAkYnRuLnJlbW92ZUNsYXNzKCdoaWRkZW4nKS5hdHRyKCdkYXRhLWl0ZW0tY291bnQnLCBicmVha3MubGVuZ3RoKTtcbiAgICAgICAgfSBlbHNlIHtcblxuICAgICAgICAgICAgLy8gQ2hlY2sgaWYgdGhlcmUncyBzcGFjZSB0byBtb3ZlIGFuIGl0ZW0gYmFjayB0byB0aGUgbmF2XG4gICAgICAgICAgICBpZiAoYXZhaWxhYmxlU3BhY2UgPiBicmVha3NbYnJlYWtzLmxlbmd0aC0xXSkge1xuICAgICAgICAgICAgICAgICRobGlua3MuY2hpbGRyZW4oKS5maXJzdCgpLmFwcGVuZFRvKCR2bGlua3MpO1xuICAgICAgICAgICAgICAgIGJyZWFrcy5wb3AoKTtcbiAgICAgICAgICAgICAgICAkYnRuLmF0dHIoJ2RhdGEtaXRlbS1jb3VudCcsIGJyZWFrcy5sZW5ndGgpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoYnJlYWtzLmxlbmd0aCA8IDEpIHtcbiAgICAgICAgICAgICAgICAkaGxpbmtzLmFkZENsYXNzKCdoaWRkZW4nKTtcbiAgICAgICAgICAgICAgICAkYnRuLmFkZENsYXNzKCdoaWRkZW4nKS5hdHRyKCdkYXRhLWl0ZW0tY291bnQnLCBicmVha3MubGVuZ3RoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChicmVha3MubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgYnJlYWtXYXNUd29Pck1vcmUgPSB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gUmVydW4gaWYgbmF2IGlzIHN0aWxsIG92ZXJmbG93aW5nXG4gICAgICAgIGlmICgkbmF2LmlzKCc6dmlzaWJsZScpICYmICR2bGlua3Mud2lkdGgoKSA+IGF2YWlsYWJsZVNwYWNlICYmIGJyZWFrcy5sZW5ndGggPiAwICYmIGJyZWFrcy5sZW5ndGggPCAkdmxpbmtzLmNoaWxkcmVuKCdsaScpLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy51cGRhdGVOYXZpZ2F0aW9uKCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBNZW51UHJpb3JpdHkoKTtcblxufSkoalF1ZXJ5KTtcbiIsIi8vXG4vLyBAbmFtZSBWaWRlbyBQbGF5ZXJcbi8vIEBkZXNjcmlwdGlvbiAgVmlkZW8gZnVuY3Rpb25hbHR5IGZvciB2aW1lbyBhbmQgeW91dHViZS5cbi8vXG5IZWxzaW5nYm9yZ1ByaW1lID0gSGVsc2luZ2JvcmdQcmltZSB8fCB7fTtcbkhlbHNpbmdib3JnUHJpbWUuSGVscGVyID0gSGVsc2luZ2JvcmdQcmltZS5IZWxwZXIgfHwge307XG5cbkhlbHNpbmdib3JnUHJpbWUuSGVscGVyLlBsYXllciA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgLy9EZWNsYXJhdGlvbnNcbiAgICB2YXIgcGxheWVyRmlyc3RJbml0WW91dHViZSA9IHRydWU7IC8vSW5kaWNhdGVzIHdoZXRlciB0byBsb2FkIFlvdXR1YmUgYXBpIG9yIG5vdC5cbiAgICB2YXIgcGxheWVyRmlyc3RJbml0VmltZW8gPSB0cnVlOyAvL0luZGljYXRlcyB3aGV0ZXIgdG8gbG9hZCBWaW1lbyBhcGkgb3Igbm90LlxuICAgIHZhciBwbGF5ZXJGaXJzdEluaXRCYW1idXNlciA9IHRydWU7IC8vSW5kaWNhdGVzIHdoZXRlciB0byBsb2FkIEJhbWJ1c2VyIGFwaSBvciBub3QuXG5cbiAgICAvL0NoZWNrIGZvciBwbGF5ZXJzLCBpZiBleGlzdHM7IFJ1biBwbGF5ZXIgc2NyaXB0LlxuICAgIGZ1bmN0aW9uIFBsYXllcigpIHtcbiAgICAgICAgaWYgKCQoXCIucGxheWVyXCIpLmxlbmd0aCkge1xuICAgICAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvL0xpc3RlbiBmb3IgcGxheSBhcmd1bWVudFxuICAgIFBsYXllci5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJChcIi5wbGF5ZXIgYVwiKS5vbignY2xpY2snLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdGhpcy5pbml0VmlkZW9QbGF5ZXIoJChlLnRhcmdldCkuY2xvc2VzdCgnYScpKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAkKFwiLnBsYXllci1wbGF5bGlzdCBhXCIpLm9uKCdjbGljaycsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLnN3aXRjaFZpZGVvKCQoZS50YXJnZXQpLmNsb3Nlc3QoJ2EnKSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfTtcblxuICAgIC8vSW5pdCBwbGF5ZXIgb24gc3RhcnRcbiAgICBQbGF5ZXIucHJvdG90eXBlLmluaXRWaWRlb1BsYXllciA9IGZ1bmN0aW9uKGUpIHtcbiAgICAgICAgdmFyIHZpZGVvaWQgPSBlLmF0dHIoJ2RhdGEtdmlkZW8taWQnKTtcbiAgICAgICAgdmFyIGxpc3RpZCA9IGUuYXR0cignZGF0YS1saXN0LWlkJyk7XG5cbiAgICAgICAgaWYgKHRoaXMuaXNOdW1lcmljKHZpZGVvaWQpKSB7XG4gICAgICAgICAgICB0aGlzLmluaXRWaW1lbyh2aWRlb2lkLCBlKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIGlmIChsaXN0aWQpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmluaXRZb3V0dWJlKHZpZGVvaWQsIGUsIGxpc3RpZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdFlvdXR1YmUodmlkZW9pZCwgZSk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgUGxheWVyLnByb3RvdHlwZS5pbml0VmltZW8gPSBmdW5jdGlvbih2aWRlb2lkLCB0YXJnZXQpIHtcblxuICAgICAgICAvL1JlbW92ZSBjb250cm9sc1xuICAgICAgICB0aGlzLnRvZ2dsZUNvbnRyb2xzKHRhcmdldCk7XG5cbiAgICAgICAgLy9BcHBlbmQgcGxheWVyXG4gICAgICAgICQodGFyZ2V0KS5wYXJlbnQoKS5hcHBlbmQoJzxpZnJhbWUgc3JjPVwiLy9wbGF5ZXIudmltZW8uY29tL3ZpZGVvLycgKyB2aWRlb2lkICsgJz9wb3J0cmFpdD0wJmNvbG9yPTMzMyZhdXRvcGxheT0xXCIgd2lkdGg9XCIxMDAlXCIgaGVpZ2h0PVwiMTAwJVwiIGZyYW1lYm9yZGVyPVwiMFwiIHdlYmtpdGFsbG93ZnVsbHNjcmVlbiBtb3phbGxvd2Z1bGxzY3JlZW4gYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPicpO1xuXG4gICAgICAgIC8vTm90IGZpcnN0IHJ1biBhbnltb3JlXG4gICAgICAgIHRoaXMucGxheWVyRmlyc3RJbml0VmltZW8gPSBmYWxzZTtcbiAgICB9O1xuXG4gICAgUGxheWVyLnByb3RvdHlwZS5pbml0WW91dHViZSA9IGZ1bmN0aW9uKHZpZGVvaWQsIHRhcmdldCwgbGlzdGlkKSB7XG5cbiAgICAgICAgaWYgKHR5cGVvZiBsaXN0aWQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBsaXN0aWQgPSBudWxsO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9SZW1vdmUgY29udHJvbHNcbiAgICAgICAgdGhpcy50b2dnbGVDb250cm9scyh0YXJnZXQpO1xuXG4gICAgICAgIC8vQXBwZW5kIHBsYXllclxuICAgICAgICBpZiAobGlzdGlkKSB7XG4gICAgICAgICAgICAkKHRhcmdldCkucGFyZW50KCkuYXBwZW5kKCc8aWZyYW1lIHR5cGU9XCJ0ZXh0L2h0bWxcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCJzcmM9XCIvL3d3dy55b3V0dWJlLmNvbS9lbWJlZC8nICsgdmlkZW9pZCArICc/YXV0b3BsYXk9MSZhdXRvaGlkZT0xJmNjX2xvYWRfcG9saWN5PTAmZW5hYmxlanNhcGk9MSZtb2Rlc3RicmFuZGluZz0xJm9yaWdpbj1zdHlsZWd1aWRlLmRldiZzaG93aW5mbz0wJmF1dG9oaWRlPTEmaXZfbG9hZF9wb2xpY3k9MyZsaXN0PScgKyBsaXN0aWQgKyAnJnJlbD0wXCIgZnJhbWVib3JkZXI9XCIwXCIgd2Via2l0YWxsb3dmdWxsc2NyZWVuIG1vemFsbG93ZnVsbHNjcmVlbiBhbGxvd2Z1bGxzY3JlZW4+PC9pZnJhbWU+Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAkKHRhcmdldCkucGFyZW50KCkuYXBwZW5kKCc8aWZyYW1lIHR5cGU9XCJ0ZXh0L2h0bWxcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCJzcmM9XCIvL3d3dy55b3V0dWJlLmNvbS9lbWJlZC8nICsgdmlkZW9pZCArICc/YXV0b3BsYXk9MSZhdXRvaGlkZT0xJmNjX2xvYWRfcG9saWN5PTAmZW5hYmxlanNhcGk9MSZtb2Rlc3RicmFuZGluZz0xJm9yaWdpbj1zdHlsZWd1aWRlLmRldiZzaG93aW5mbz0wJmF1dG9oaWRlPTEmaXZfbG9hZF9wb2xpY3k9MyZyZWw9MFwiIGZyYW1lYm9yZGVyPVwiMFwiIHdlYmtpdGFsbG93ZnVsbHNjcmVlbiBtb3phbGxvd2Z1bGxzY3JlZW4gYWxsb3dmdWxsc2NyZWVuPjwvaWZyYW1lPicpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy9Ob3QgZmlyc3QgcnVuIGFueW1vcmVcbiAgICAgICAgdGhpcy5wbGF5ZXJGaXJzdEluaXRZb3V0dWJlID0gZmFsc2U7XG4gICAgfTtcblxuICAgIFBsYXllci5wcm90b3R5cGUuaW5pdEJhbWJ1c2VyID0gZnVuY3Rpb24odmlkZW9pZCwgdGFyZ2V0KSB7XG5cbiAgICAgICAgLy9SZW1vdmUgY29udHJvbHNcbiAgICAgICAgdGhpcy50b2dnbGVDb250cm9scyh0YXJnZXQpO1xuXG4gICAgICAgIC8vQXBwZW5kIHBsYXllclxuICAgICAgICAkKHRhcmdldCkucGFyZW50KCkuYXBwZW5kKCc8aWZyYW1lIHR5cGU9XCJ0ZXh0L2h0bWxcIiB3aWR0aD1cIjEwMCVcIiBoZWlnaHQ9XCIxMDAlXCJzcmM9XCIvL2VtYmVkLmJhbWJ1c2VyLmNvbS9icm9hZGNhc3QvJyArdmlkZW9pZCsgJz9hdXRvcGxheT0xXCIgZnJhbWVib3JkZXI9XCIwXCIgd2Via2l0YWxsb3dmdWxsc2NyZWVuIG1vemFsbG93ZnVsbHNjcmVlbiBhbGxvd2Z1bGxzY3JlZW4+PC9pZnJhbWU+Jyk7XG5cbiAgICAgICAgLy9Ob3QgZmlyc3QgcnVuIGFueW1vcmVcbiAgICAgICAgdGhpcy5wbGF5ZXJGaXJzdEluaXRCYW1idXNlciA9IGZhbHNlO1xuICAgIH07XG5cbiAgICBQbGF5ZXIucHJvdG90eXBlLnN3aXRjaFZpZGVvID0gZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICB2YXIgdmlkZW9pZCA9IGVsZW1lbnQuYXR0cignZGF0YS12aWRlby1pZCcpO1xuICAgICAgICB2YXIgbGlzdGlkID0gZWxlbWVudC5hdHRyKCdkYXRhLWxpc3QtaWQnKTtcblxuICAgICAgICB2YXIgJHBsYXllciA9IGVsZW1lbnQucGFyZW50cygnLnBsYXllci1wbGF5bGlzdCcpLnNpYmxpbmdzKCcucGxheWVyJyk7XG4gICAgICAgIHZhciAkaWZyYW1lID0gJHBsYXllci5jaGlsZHJlbignaWZyYW1lJyk7XG5cbiAgICAgICAgJHBsYXllci5maW5kKCdhJykuaGlkZSgpO1xuXG4gICAgICAgIGlmICghJHBsYXllci5maW5kKCcubG9hZGluZycpLmxlbmd0aCkge1xuICAgICAgICAgICAgJHBsYXllci5hcHBlbmQoJzxkaXYgY2xhc3M9XCJsb2FkaW5nIHBvcy1hYnNvbHV0ZS1jZW50ZXJcIiBzdHlsZT1cIndpZHRoOjMwMHB4O1wiPjxkaXY+PC9kaXY+PGRpdj48L2Rpdj48ZGl2PjwvZGl2PjxkaXY+PC9kaXY+PC9kaXY+Jyk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGhpcy5pc051bWVyaWModmlkZW9pZCkpIHtcbiAgICAgICAgICAgIHRoaXMuaW5pdFZpbWVvKHZpZGVvaWQsICRwbGF5ZXIuY2hpbGRyZW4oJ2EnKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpZiAobGlzdGlkKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5pbml0WW91dHViZSh2aWRlb2lkLCAkcGxheWVyLmNoaWxkcmVuKCdhJyksIGxpc3RpZCk7XG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgIHRoaXMuaW5pdFlvdXR1YmUodmlkZW9pZCwgJHBsYXllci5jaGlsZHJlbignYScpKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgICRpZnJhbWUucmVtb3ZlKCk7XG4gICAgfTtcblxuICAgIFBsYXllci5wcm90b3R5cGUudG9nZ2xlQ29udHJvbHMgPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICAgaWYgKHR5cGVvZiB0YXJnZXQgPT09ICd1bmRlZmluZWQnKSB7XG4gICAgICAgICAgICBjb25zb2xlLmVycm9yKCdDb3VsZCBub3Qgc3RhcnQgcGxheWVyLiBXcmFwcGVyIG5vdCBmb3VuZC4nKTtcbiAgICAgICAgICAgIHJldHVybiBmYWxzZTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRhcmdldCA9IHRhcmdldC5wYXJlbnQoKTtcblxuICAgICAgICBpZiAodGFyZ2V0Lmhhc0NsYXNzKCdpcy1wbGF5aW5nJykpIHtcbiAgICAgICAgICAgIHRhcmdldC5yZW1vdmVDbGFzcygnaXMtcGxheWluZycpO1xuICAgICAgICAgICAgJChcImh0bWxcIikucmVtb3ZlQ2xhc3MoJ3ZpZGVvLWlzLXBsYXlpbmcnKTtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG5cbiAgICAgICAgdGFyZ2V0LmFkZENsYXNzKCdpcy1wbGF5aW5nJyk7XG4gICAgICAgICQoXCJodG1sXCIpLmFkZENsYXNzKCd2aWRlby1pcy1wbGF5aW5nJyk7XG4gICAgICAgIHJldHVybiB0cnVlO1xuICAgIH07XG5cbiAgICAvKipcbiAgICAgKiBSZXNldCBhbGwgcGxheWVycywgb3Igd2l0aCB0YXJnZXQgaWQuXG4gICAgICogQHBhcmFtICB7b2JqZWN0fSB0YXJnZXRcbiAgICAgKiBAcmV0dXJuIHtib29sfVxuICAgICAqL1xuICAgIFBsYXllci5wcm90b3R5cGUucmVzZXRQbGF5ZXIgPSBmdW5jdGlvbih0YXJnZXQpIHtcbiAgICAgICBpZiAodHlwZW9mIHRhcmdldCAhPT0gJ3VuZGVmaW5lZCcpIHtcbiAgICAgICAgICAgICQoJy5wbGF5ZXIgaWZyYW1lJykucmVtb3ZlKCk7XG4gICAgICAgICAgICAkKCcucGxheWVyJykucmVtb3ZlQ2xhc3MoJ2lzLXBsYXlpbmcnKTtcbiAgICAgICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygndmlkZW8taXMtcGxheWluZycpO1xuICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICB9XG5cbiAgICAgICAgJCgnaWZyYW1lJywgdGFyZ2V0KS5yZW1vdmUoKTtcbiAgICAgICAgdGFyZ2V0LnJlbW92ZUNsYXNzKCdpcy1wbGF5aW5nJyk7XG4gICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygndmlkZW8taXMtcGxheWluZycpO1xuICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICB9O1xuXG4gICAgUGxheWVyLnByb3RvdHlwZS5pc051bWVyaWMgPSBmdW5jdGlvbihuKSB7XG4gICAgICAgIHJldHVybiAhaXNOYU4ocGFyc2VGbG9hdChuKSkgJiYgaXNGaW5pdGUobik7XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgUGxheWVyKCk7XG5cbn0pKCQpO1xuIiwiLy9cbi8vIEBuYW1lIEVxdWFsSGVpZ2h0XG4vLyBAZGVzY3JpcHRpb24gIFNldHMgZWxlbWVudCBoZWlnaHRzIGVxdWFsbHkgdG8gdGhlIGhlaWdoZXN0IGl0ZW1cbi8vXG4vLyBAbWFya3VwXG4vLyA8ZGl2IGNsYXNzPVwiZ3JpZFwiIGRhdGEtZXF1YWwtY29udGFpbmVyPlxuLy8gICAgIDxkaXYgY2xhc3M9XCJncmlkLW1kLTZcIiBkYXRhLWVxdWFsLWl0ZW0+XG4vL1xuLy8gICAgIDwvZGl2PlxuLy8gICAgIDxkaXYgY2xhc3M9XCJncmlkLW1kLTZcIiBkYXRhLWVxdWFsLWl0ZW0+XG4vL1xuLy8gICAgIDwvZGl2PlxuLy8gPC9kaXY+XG4vL1xuSGVsc2luZ2JvcmdQcmltZSA9IEhlbHNpbmdib3JnUHJpbWUgfHwge307XG5IZWxzaW5nYm9yZ1ByaW1lLkhlbHBlciA9IEhlbHNpbmdib3JnUHJpbWUuSGVscGVyIHx8IHt9O1xuXG5IZWxzaW5nYm9yZ1ByaW1lLkhlbHBlci5Qb3N0ID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICBmdW5jdGlvbiBQb3N0KCkge1xuICAgICAgICB0aGlzLmJpbmRFdmVudHMoKTtcbiAgICB9XG5cbiAgICBQb3N0LnByb3RvdHlwZS5iaW5kRXZlbnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICcucG9zdC1jb2xsYXBzZWQgYXJ0aWNsZScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICAkKGUudGFyZ2V0KS5jbG9zZXN0KCdhcnRpY2xlJykucGFyZW50cygnLnBvc3QtY29sbGFwc2VkJykuYWRkQ2xhc3MoJ3Bvc3QtZXhwYW5kZWQnKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBQb3N0KCk7XG5cbn0pKGpRdWVyeSk7XG4iLCJIZWxzaW5nYm9yZ1ByaW1lID0gSGVsc2luZ2JvcmdQcmltZSB8fCB7fTtcbkhlbHNpbmdib3JnUHJpbWUuU2Nyb2xsRG90ID0gSGVsc2luZ2JvcmdQcmltZS5TY3JvbGxEb3QgfHwge307XG5cbkhlbHNpbmdib3JnUHJpbWUuU2Nyb2xsRG90LkNsaWNrSmFjayA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgdmFyIFNjcm9sbERvdFRyaWdnZXJzID0gW1xuICAgICAgICAnLnNjcm9sbC1kb3RzIGxpIGEnXG4gICAgXTtcblxuICAgIHZhciBTY3JvbGxEb3RUYXJnZXRzID0gW1xuICAgICAgICAnc2VjdGlvbicsXG4gICAgXTtcblxuICAgIHZhciBTY3JvbGxEb3RTZXR0aW5ncyA9IHtcbiAgICAgICAgc2Nyb2xsU3BlZWQ6IDQ1MCxcbiAgICAgICAgc2Nyb2xsT2Zmc2V0OiAwXG4gICAgfTtcblxuICAgIGZ1bmN0aW9uIENsaWNrSmFjaygpIHtcbiAgICAgICAgU2Nyb2xsRG90VHJpZ2dlcnMuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgICBpZigkKGVsZW1lbnQpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICQoZWxlbWVudCkuZWFjaChmdW5jdGlvbihpbmRleCxpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmKHRoaXMuaXNBbmNob3JMaW5rKCQoaXRlbSkuYXR0cignaHJlZicpKSAmJiB0aGlzLmFuY2hvckxpbmtFeGlzdHMoJChpdGVtKS5hdHRyKCdocmVmJykpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmJpbmRTY3JvbGxEb3QoaXRlbSwkKGl0ZW0pLmF0dHIoJ2hyZWYnKSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH1cblxuICAgIENsaWNrSmFjay5wcm90b3R5cGUuaXNBbmNob3JMaW5rID0gZnVuY3Rpb24gKGhyZWYpIHtcbiAgICAgICAgaWYoL14jLy50ZXN0KGhyZWYpID09PSB0cnVlICYmIGhyZWYubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQ2xpY2tKYWNrLnByb3RvdHlwZS5hbmNob3JMaW5rRXhpc3RzID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIHZhciBsaW5rRXhpc3QgPSBmYWxzZTtcbiAgICAgICAgU2Nyb2xsRG90VGFyZ2V0cy5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICAgIGlmKCQoZWxlbWVudCArIGlkKS5sZW5ndGgpIHtcbiAgICAgICAgICAgICAgIGxpbmtFeGlzdCA9IHRydWU7XG4gICAgICAgICAgICAgICByZXR1cm4gdHJ1ZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgcmV0dXJuIGxpbmtFeGlzdDtcbiAgICB9O1xuXG4gICAgQ2xpY2tKYWNrLnByb3RvdHlwZS5iaW5kU2Nyb2xsRG90ID0gZnVuY3Rpb24gKHRyaWdnZXIsdGFyZ2V0KSB7XG4gICAgICAgICQodHJpZ2dlcikub24oJ2NsaWNrJyxmdW5jdGlvbihldmVudCl7XG4gICAgICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgICAgICAgICAgdGhpcy51cGRhdGVIYXNoKHRhcmdldCk7XG4gICAgICAgICAgICB2YXIgdGFyZ2V0T2Zmc2V0ID0gJCh0YXJnZXQpLm9mZnNldCgpO1xuICAgICAgICAgICAgJCgnaHRtbCwgYm9keScpLmFuaW1hdGUoe3Njcm9sbFRvcDogTWF0aC5hYnModGFyZ2V0T2Zmc2V0LnRvcCAtTWF0aC5hYnMoU2Nyb2xsRG90U2V0dGluZ3Muc2Nyb2xsT2Zmc2V0KSl9LCBTY3JvbGxEb3RTZXR0aW5ncy5zY3JvbGxTcGVlZCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfTtcblxuICAgIENsaWNrSmFjay5wcm90b3R5cGUudXBkYXRlSGFzaCA9IGZ1bmN0aW9uKGhhc2gpIHtcbiAgICAgICAgaWYoaGlzdG9yeS5wdXNoU3RhdGUpIHtcbiAgICAgICAgICAgIGlmKGhhc2ggPT09IFwiXCIgKSB7XG4gICAgICAgICAgICAgICAgaGlzdG9yeS5wdXNoU3RhdGUobnVsbCwgbnVsbCwgXCIjXCIpO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBoaXN0b3J5LnB1c2hTdGF0ZShudWxsLCBudWxsLCBoYXNoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHdpbmRvdy5sb2NhdGlvbi5oYXNoID0gaGFzaDtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIG5ldyBDbGlja0phY2soKTtcblxufSkoalF1ZXJ5KTtcbiIsIkhlbHNpbmdib3JnUHJpbWUgPSBIZWxzaW5nYm9yZ1ByaW1lIHx8IHt9O1xuSGVsc2luZ2JvcmdQcmltZS5TY3JvbGxEb3QgPSBIZWxzaW5nYm9yZ1ByaW1lLlNjcm9sbERvdCB8fCB7fTtcblxuSGVsc2luZ2JvcmdQcmltZS5TY3JvbGxEb3QuSGlnaGxpZ2h0ID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICB2YXIgU2Nyb2xsVG9wVmFsdWUgPSAwO1xuXG4gICAgdmFyIFNjcm9sbFRvcE9mZnNldCA9IDA7XG5cbiAgICB2YXIgU2Nyb2xsTWVudVdyYXBwZXJBY3RpdmVDbGFzcyA9ICdjdXJyZW50JztcblxuICAgIHZhciBIaWdobGlnaHRUcmlnZ2VyID0gXCJzZWN0aW9uLnNlY3Rpb24tc3BsaXQsIHNlY3Rpb24uc2VjdGlvbi1mdWxsLCBzZWN0aW9uLnNlY3Rpb24tZmVhdHVyZWRcIjtcblxuICAgIHZhciBTY3JvbGxNZW51V3JhcHBlciA9IFtcbiAgICAgICAgJy5zY3JvbGwtZG90cydcbiAgICBdO1xuXG4gICAgZnVuY3Rpb24gSGlnaGxpZ2h0KCkge1xuICAgICAgICBTY3JvbGxUb3BWYWx1ZSA9ICQod2luZG93KS5zY3JvbGxUb3AoKTtcbiAgICAgICAgJCh3aW5kb3cpLm9uKCdzY3JvbGwnLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgdmFyIHNjcm9sbGVkVG9JdGVtID0gbnVsbDtcbiAgICAgICAgICAgIFNjcm9sbFRvcFZhbHVlID0gJCh3aW5kb3cpLnNjcm9sbFRvcCgpICsgU2Nyb2xsVG9wT2Zmc2V0ICsgJChcIiNzaXRlLWhlYWRlclwiKS5vdXRlckhlaWdodCgpO1xuICAgICAgICAgICAgJChIaWdobGlnaHRUcmlnZ2VyKS5lYWNoKGZ1bmN0aW9uIChpbmRleCxpdGVtKSB7XG4gICAgICAgICAgICAgICAgaWYoU2Nyb2xsVG9wVmFsdWUgPj0gJChpdGVtKS5vZmZzZXQoKS50b3ApIHtcbiAgICAgICAgICAgICAgICAgICAgc2Nyb2xsZWRUb0l0ZW0gPSBpdGVtO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm47XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB0aGlzLmNsZWFuSGlnaGxpZ2h0KCk7XG4gICAgICAgICAgICB0aGlzLmhpZ2hsaWdodE1lbnVJdGVtKFwiI1wiICsgJChzY3JvbGxlZFRvSXRlbSkuYXR0cignaWQnKSk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgSGlnaGxpZ2h0LnByb3RvdHlwZS5oaWdobGlnaHRNZW51SXRlbSA9IGZ1bmN0aW9uIChpZCkge1xuICAgICAgICBpZih0aGlzLmlzQW5jaG9yTGluayhpZCkgJiYgdGhpcy5hbmNob3JMaW5rRXhpc3RzKGlkKSl7XG4gICAgICAgICAgICB0aGlzLmFkZFdyYXBwZXJDbGFzcygnaXMtYWN0aXZlJyk7XG4gICAgICAgICAgICBTY3JvbGxNZW51V3JhcHBlci5mb3JFYWNoKGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgICAgICAgICAkKFwiYVtocmVmPSdcIiArIGlkICsgXCInXVwiLCBlbGVtZW50KS5hZGRDbGFzcyhTY3JvbGxNZW51V3JhcHBlckFjdGl2ZUNsYXNzKTtcbiAgICAgICAgICAgIH0pO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIEhpZ2hsaWdodC5wcm90b3R5cGUuaXNBbmNob3JMaW5rID0gZnVuY3Rpb24gKGhyZWYpIHtcbiAgICAgICAgaWYoL14jLy50ZXN0KGhyZWYpID09PSB0cnVlICYmIGhyZWYubGVuZ3RoID4gMSkge1xuICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgSGlnaGxpZ2h0LnByb3RvdHlwZS5hbmNob3JMaW5rRXhpc3RzID0gZnVuY3Rpb24gKGlkKSB7XG4gICAgICAgIHZhciBsaW5rRXhpc3QgPSBmYWxzZTtcbiAgICAgICAgU2Nyb2xsTWVudVdyYXBwZXIuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgICBpZigkKFwiYVtocmVmPSdcIiArIGlkICsgXCInXVwiLGVsZW1lbnQpLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgIGxpbmtFeGlzdCA9IHRydWU7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRydWU7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIHJldHVybiBsaW5rRXhpc3Q7XG4gICAgfTtcblxuICAgIEhpZ2hsaWdodC5wcm90b3R5cGUuY2xlYW5IaWdobGlnaHQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmVtb3ZlV3JhcHBlckNsYXNzKCdpcy1hY3RpdmUnKTtcbiAgICAgICAgU2Nyb2xsTWVudVdyYXBwZXIuZm9yRWFjaChmdW5jdGlvbihlbGVtZW50KSB7XG4gICAgICAgICAgICAkKFwiYVwiLGVsZW1lbnQpLnJlbW92ZUNsYXNzKFNjcm9sbE1lbnVXcmFwcGVyQWN0aXZlQ2xhc3MpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH07XG5cbiAgICBIaWdobGlnaHQucHJvdG90eXBlLmFkZFdyYXBwZXJDbGFzcyA9IGZ1bmN0aW9uIChjKSB7XG4gICAgICAgIFNjcm9sbE1lbnVXcmFwcGVyLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgaWYoISQoZWxlbWVudCkuaGFzQ2xhc3MoYykpIHtcbiAgICAgICAgICAgICAgICAkKGVsZW1lbnQpLmFkZENsYXNzKGMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH07XG5cbiAgICBIaWdobGlnaHQucHJvdG90eXBlLnJlbW92ZVdyYXBwZXJDbGFzcyA9IGZ1bmN0aW9uIChjKSB7XG4gICAgICAgIFNjcm9sbE1lbnVXcmFwcGVyLmZvckVhY2goZnVuY3Rpb24oZWxlbWVudCkge1xuICAgICAgICAgICAgaWYoJChlbGVtZW50KS5oYXNDbGFzcyhjKSkge1xuICAgICAgICAgICAgICAgICQoZWxlbWVudCkucmVtb3ZlQ2xhc3MoYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfTtcblxuICAgIG5ldyBIaWdobGlnaHQoKTtcblxufSkoalF1ZXJ5KTtcbiIsIi8qIVxuICogQmV6IEBWRVJTSU9OXG4gKiBodHRwOi8vZ2l0aHViLmNvbS9yZGFsbGFzZ3JheS9iZXpcbiAqXG4gKiBBIHBsdWdpbiB0byBjb252ZXJ0IENTUzMgY3ViaWMtYmV6aWVyIGNvLW9yZGluYXRlcyB0byBqUXVlcnktY29tcGF0aWJsZSBlYXNpbmcgZnVuY3Rpb25zXG4gKlxuICogV2l0aCB0aGFua3MgdG8gTmlrb2xheSBOZW1zaGlsb3YgZm9yIGNsYXJpZmljYXRpb24gb24gdGhlIGN1YmljLWJlemllciBtYXRoc1xuICogU2VlIGh0dHA6Ly9zdC1vbi1pdC5ibG9nc3BvdC5jb20vMjAxMS8wNS9jYWxjdWxhdGluZy1jdWJpYy1iZXppZXItZnVuY3Rpb24uaHRtbFxuICpcbiAqIENvcHlyaWdodCBAWUVBUiBSb2JlcnQgRGFsbGFzIEdyYXkuIEFsbCByaWdodHMgcmVzZXJ2ZWQuXG4gKiBQcm92aWRlZCB1bmRlciB0aGUgRnJlZUJTRCBsaWNlbnNlOiBodHRwczovL2dpdGh1Yi5jb20vcmRhbGxhc2dyYXkvYmV6L2Jsb2IvbWFzdGVyL0xJQ0VOU0UudHh0XG4gKi9cbihmdW5jdGlvbihmYWN0b3J5KSB7XG4gIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xuICAgIGZhY3RvcnkocmVxdWlyZShcImpxdWVyeVwiKSk7XG4gIH0gZWxzZSBpZiAodHlwZW9mIGRlZmluZSA9PT0gXCJmdW5jdGlvblwiICYmIGRlZmluZS5hbWQpIHtcbiAgICBkZWZpbmUoW1wianF1ZXJ5XCJdLCBmYWN0b3J5KTtcbiAgfSBlbHNlIHtcbiAgICBmYWN0b3J5KGpRdWVyeSk7XG4gIH1cbn0oZnVuY3Rpb24oJCkge1xuICAkLmV4dGVuZCh7IGJlejogZnVuY3Rpb24oZW5jb2RlZEZ1bmNOYW1lLCBjb09yZEFycmF5KSB7XG4gICAgaWYgKCQuaXNBcnJheShlbmNvZGVkRnVuY05hbWUpKSB7XG4gICAgICBjb09yZEFycmF5ID0gZW5jb2RlZEZ1bmNOYW1lO1xuICAgICAgZW5jb2RlZEZ1bmNOYW1lID0gJ2Jlel8nICsgY29PcmRBcnJheS5qb2luKCdfJykucmVwbGFjZSgvXFwuL2csICdwJyk7XG4gICAgfVxuICAgIGlmICh0eXBlb2YgJC5lYXNpbmdbZW5jb2RlZEZ1bmNOYW1lXSAhPT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB2YXIgcG9seUJleiA9IGZ1bmN0aW9uKHAxLCBwMikge1xuICAgICAgICB2YXIgQSA9IFtudWxsLCBudWxsXSwgQiA9IFtudWxsLCBudWxsXSwgQyA9IFtudWxsLCBudWxsXSxcbiAgICAgICAgICAgIGJlekNvT3JkID0gZnVuY3Rpb24odCwgYXgpIHtcbiAgICAgICAgICAgICAgQ1theF0gPSAzICogcDFbYXhdLCBCW2F4XSA9IDMgKiAocDJbYXhdIC0gcDFbYXhdKSAtIENbYXhdLCBBW2F4XSA9IDEgLSBDW2F4XSAtIEJbYXhdO1xuICAgICAgICAgICAgICByZXR1cm4gdCAqIChDW2F4XSArIHQgKiAoQltheF0gKyB0ICogQVtheF0pKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB4RGVyaXYgPSBmdW5jdGlvbih0KSB7XG4gICAgICAgICAgICAgIHJldHVybiBDWzBdICsgdCAqICgyICogQlswXSArIDMgKiBBWzBdICogdCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgeEZvclQgPSBmdW5jdGlvbih0KSB7XG4gICAgICAgICAgICAgIHZhciB4ID0gdCwgaSA9IDAsIHo7XG4gICAgICAgICAgICAgIHdoaWxlICgrK2kgPCAxNCkge1xuICAgICAgICAgICAgICAgIHogPSBiZXpDb09yZCh4LCAwKSAtIHQ7XG4gICAgICAgICAgICAgICAgaWYgKE1hdGguYWJzKHopIDwgMWUtMykgYnJlYWs7XG4gICAgICAgICAgICAgICAgeCAtPSB6IC8geERlcml2KHgpO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIHJldHVybiB4O1xuICAgICAgICAgICAgfTtcbiAgICAgICAgcmV0dXJuIGZ1bmN0aW9uKHQpIHtcbiAgICAgICAgICByZXR1cm4gYmV6Q29PcmQoeEZvclQodCksIDEpO1xuICAgICAgICB9XG4gICAgICB9O1xuICAgICAgJC5lYXNpbmdbZW5jb2RlZEZ1bmNOYW1lXSA9IGZ1bmN0aW9uKHgsIHQsIGIsIGMsIGQpIHtcbiAgICAgICAgcmV0dXJuIGMgKiBwb2x5QmV6KFtjb09yZEFycmF5WzBdLCBjb09yZEFycmF5WzFdXSwgW2NvT3JkQXJyYXlbMl0sIGNvT3JkQXJyYXlbM11dKSh0L2QpICsgYjtcbiAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIGVuY29kZWRGdW5jTmFtZTtcbiAgfX0pO1xufSkpO1xuIiwiLy9cbi8vIEBuYW1lIENvb2tpZSBjb25zZW50XG4vL1xuSGVsc2luZ2JvcmdQcmltZSA9IEhlbHNpbmdib3JnUHJpbWUgfHwge307XG5IZWxzaW5nYm9yZ1ByaW1lLlByb21wdCA9IEhlbHNpbmdib3JnUHJpbWUuUHJvbXB0IHx8IHt9O1xuXG5IZWxzaW5nYm9yZ1ByaW1lLlByb21wdC5Db29raWVDb25zZW50ID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICB2YXIgX2Nvb2tpZUNvbnNlbnRWaXNpYmxlID0gZmFsc2U7XG4gICAgdmFyIF91c2VMb2NhbFN0b3JhZ2UgPSB0cnVlO1xuICAgIHZhciBfYW5pbWF0aW9uU3BlZWQgPSAxMDAwO1xuXG4gICAgZnVuY3Rpb24gQ29va2llQ29uc2VudCgpIHtcbiAgICAgICAgdGhpcy5pbml0KCk7XG4gICAgfVxuXG4gICAgQ29va2llQ29uc2VudC5wcm90b3R5cGUuaW5pdCA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHNob3dDb29raWVDb25zZW50ID0gKEhlbHNpbmdib3JnUHJpbWUuQXJncy5nZXQoJ2Nvb2tpZUNvbnNlbnQuc2hvdycpKSA/IEhlbHNpbmdib3JnUHJpbWUuQXJncy5nZXQoJ2Nvb2tpZUNvbnNlbnQuc2hvdycpIDogdHJ1ZTtcblxuICAgICAgICBpZiAoc2hvd0Nvb2tpZUNvbnNlbnQgJiYgIXRoaXMuaGFzQWNjZXB0ZWQoKSkge1xuICAgICAgICAgICAgdGhpcy5kaXNwbGF5Q29uc2VudCgpO1xuXG4gICAgICAgICAgICAkKGRvY3VtZW50KS5vbignY2xpY2snLCAnW2RhdGEtYWN0aW9uPVwiY29va2llLWNvbnNlbnRcIl0nLCBmdW5jdGlvbiAoZSkge1xuICAgICAgICAgICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgICAgICAgICB2YXIgYnRuID0gJChlLnRhcmdldCkuY2xvc2VzdCgnYnV0dG9uJyk7XG4gICAgICAgICAgICAgICAgdGhpcy5hY2NlcHQoKTtcbiAgICAgICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgQ29va2llQ29uc2VudC5wcm90b3R5cGUuZGlzcGxheUNvbnNlbnQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgdmFyIHdyYXBwZXIgPSAkKCdib2R5Jyk7XG5cbiAgICAgICAgaWYgKCQoJyN3cmFwcGVyOmZpcnN0LWNoaWxkJykubGVuZ3RoID4gMCkge1xuICAgICAgICAgICAgd3JhcHBlciA9ICQoJyN3cmFwcGVyOmZpcnN0LWNoaWxkJyk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY29uc2VudFRleHQgPSAnVGhpcyB3ZWJzaXRlIHVzZXMgY29va2llcyB0byBlbnN1cmUgeW91IGdldCB0aGUgYmVzdCBleHBlcmllbmNlIGJyb3dzaW5nIHRoZSB3ZWJzaXRlLic7XG4gICAgICAgIGlmIChIZWxzaW5nYm9yZ1ByaW1lLkFyZ3MuZ2V0KCdjb29raWVDb25zZW50Lm1lc3NhZ2UnKSkge1xuICAgICAgICAgICAgY29uc2VudFRleHQgPSBIZWxzaW5nYm9yZ1ByaW1lLkFyZ3MuZ2V0KCdjb29raWVDb25zZW50Lm1lc3NhZ2UnKSA/IEhlbHNpbmdib3JnUHJpbWUuQXJncy5nZXQoJ2Nvb2tpZUNvbnNlbnQubWVzc2FnZScpIDogJ1RoaXMgd2Vic2l0ZSBpcyB1c2luZyBjb29raWVzIHRvIGdpdmUgeW91IHRoZSBiZXN0IGV4cGVyaWVuY2UgcG9zc2libGUuJztcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBidXR0b25UZXh0ID0gJ0dvdCBpdCc7XG4gICAgICAgIGlmIChIZWxzaW5nYm9yZ1ByaW1lLkFyZ3MuZ2V0KCdjb29raWVDb25zZW50LmJ1dHRvbicpKSB7XG4gICAgICAgICAgICBidXR0b25UZXh0ID0gSGVsc2luZ2JvcmdQcmltZS5BcmdzLmdldCgnY29va2llQ29uc2VudC5idXR0b24nKSA/IEhlbHNpbmdib3JnUHJpbWUuQXJncy5nZXQoJ2Nvb2tpZUNvbnNlbnQuYnV0dG9uJykgOiAnT2tleSc7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcGxhY2VtZW50ID0gSGVsc2luZ2JvcmdQcmltZS5BcmdzLmdldCgnY29va2llQ29uc2VudC5wbGFjZW1lbnQnKSA/IEhlbHNpbmdib3JnUHJpbWUuQXJncy5nZXQoJ2Nvb2tpZUNvbnNlbnQucGxhY2VtZW50JykgOiBudWxsO1xuXG4gICAgICAgIHdyYXBwZXIucHJlcGVuZCgnXFxcbiAgICAgICAgICAgIDxkaXYgaWQ9XCJjb29raWUtY29uc2VudFwiIGNsYXNzPVwibm90aWNlIGluZm8gZ3V0dGVyIGd1dHRlci12ZXJ0aWNhbCAnICsgcGxhY2VtZW50ICsgJ1wiIHN0eWxlPVwiZGlzcGxheTpub25lO1wiPlxcXG4gICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImNvbnRhaW5lclwiPjxkaXYgY2xhc3M9XCJncmlkIGdyaWQtdGFibGUtbWQgZ3JpZC12YS1taWRkbGVcIj5cXFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JpZC1maXQtY29udGVudFwiPjxpIGNsYXNzPVwicHJpY29uIHByaWNvbi1pbmZvLW9cIj48L2k+PC9kaXY+XFxcbiAgICAgICAgICAgICAgICAgICAgPGRpdiBjbGFzcz1cImdyaWQtYXV0b1wiPicgKyBjb25zZW50VGV4dCArICc8L2Rpdj5cXFxuICAgICAgICAgICAgICAgICAgICA8ZGl2IGNsYXNzPVwiZ3JpZC1maXQtY29udGVudCB0ZXh0LXJpZ2h0LW1kIHRleHQtcmlnaHQtbGdcIj48YnV0dG9uIGNsYXNzPVwiYnRuIGJ0bi1wcmltYXJ5XCIgZGF0YS1hY3Rpb249XCJjb29raWUtY29uc2VudFwiPicgKyBidXR0b25UZXh0ICsgJzwvYnV0dG9uPjwvZGl2PlxcXG4gICAgICAgICAgICAgICAgPC9kaXY+PC9kaXY+XFxcbiAgICAgICAgICAgIDwvZGl2PlxcXG4gICAgICAgICcpO1xuXG4gICAgICAgICQoJyNjb29raWUtY29uc2VudCcpLnNob3coKTtcbiAgICAgICAgX2Nvb2tpZUNvbnNlbnRWaXNpYmxlID0gdHJ1ZTtcbiAgICB9O1xuXG4gICAgQ29va2llQ29uc2VudC5wcm90b3R5cGUuaGFzQWNjZXB0ZWQgPSBmdW5jdGlvbigpIHtcbiAgICAgICAgaWYgKF91c2VMb2NhbFN0b3JhZ2UpIHtcbiAgICAgICAgICAgIHJldHVybiB3aW5kb3cubG9jYWxTdG9yYWdlLmdldEl0ZW0oJ2Nvb2tpZS1jb25zZW50Jyk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICByZXR1cm4gSGVsc2luZ2JvcmdQcmltZS5IZWxwZXIuQ29va2llLmNoZWNrKCdjb29raWUtY29uc2VudCcsIHRydWUpO1xuICAgICAgICB9XG4gICAgfTtcblxuICAgIENvb2tpZUNvbnNlbnQucHJvdG90eXBlLmFjY2VwdCA9IGZ1bmN0aW9uKCkge1xuICAgICAgICAkKCcjY29va2llLWNvbnNlbnQnKS5yZW1vdmUoKTtcbiAgICAgICAgX2Nvb2tpZUNvbnNlbnRWaXNpYmxlID0gZmFsc2U7XG5cbiAgICAgICAgaWYgKF91c2VMb2NhbFN0b3JhZ2UpIHtcbiAgICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICAgICAgd2luZG93LmxvY2FsU3RvcmFnZS5zZXRJdGVtKCdjb29raWUtY29uc2VudCcsIHRydWUpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgSGVsc2luZ2JvcmdQcmltZS5IZWxwZXIuQ29va2llLnNldCgnY29va2llLWNvbnNlbnQnLCB0cnVlLCA2MCk7XG4gICAgICAgIH1cbiAgICB9O1xuXG4gICAgcmV0dXJuIG5ldyBDb29raWVDb25zZW50KCk7XG5cbn0pKGpRdWVyeSk7XG4iLCIvL1xuLy8gQG5hbWUgTW9kYWxcbi8vIEBkZXNjcmlwdGlvbiAgUHJldmVudCBzY3JvbGxpbmcgd2hlbiBtb2RhbCBpcyBvcGVuIChvciAjbW9kYWwtKiBleGlzdHMgaW4gdXJsKVxuLy9cbkhlbHNpbmdib3JnUHJpbWUgPSBIZWxzaW5nYm9yZ1ByaW1lIHx8IHt9O1xuSGVsc2luZ2JvcmdQcmltZS5Qcm9tcHQgPSBIZWxzaW5nYm9yZ1ByaW1lLlByb21wdCB8fCB7fTtcblxuSGVsc2luZ2JvcmdQcmltZS5Qcm9tcHQuTW9kYWxMaW1pdCA9IChmdW5jdGlvbiAoJCkge1xuXG4gICAgZnVuY3Rpb24gTW9kYWxMaW1pdCgpIHtcbiAgICBcdHRoaXMuaW5pdCgpO1xuXG4gICAgICAgICQoJ1tkYXRhLWFjdGlvbj1cIm1vZGFsLWNsb3NlXCJdJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICQoZS50YXJnZXQpLnBhcmVudHMoJy5tb2RhbCcpLnJlbW92ZUNsYXNzKCdtb2RhbC1vcGVuJykuaGlkZSgpO1xuICAgICAgICAgICAgJCgnaHRtbCcpLnJlbW92ZUNsYXNzKCdvdmVyZmxvdy1oaWRkZW4nKTtcbiAgICAgICAgICAgICQoJ2JvZHknKS5yZW1vdmVDbGFzcygnb3ZlcmZsb3ctaGlkZGVuJyk7XG4gICAgICAgIH0pO1xuICAgIH1cblxuICAgIE1vZGFsTGltaXQucHJvdG90eXBlLmluaXQgPSBmdW5jdGlvbiAoKSB7XG5cdCAgICB0aGlzLnRvZ2dsZU1vZGFsQ2xhc3MoKTtcblxuICAgICAgICAkKHdpbmRvdykuYmluZCgnaGFzaGNoYW5nZScsIGZ1bmN0aW9uKCkge1xuXHRcdFx0dGhpcy50b2dnbGVNb2RhbENsYXNzKCk7XG5cdFx0fS5iaW5kKHRoaXMpKTtcblxuICAgICAgICAkKCcubW9kYWwgYVtocmVmPVwiI2Nsb3NlXCJdJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgICQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnb3ZlcmZsb3ctaGlkZGVuJyk7XG4gICAgICAgICAgICAkKCdib2R5JykucmVtb3ZlQ2xhc3MoJ292ZXJmbG93LWhpZGRlbicpO1xuICAgICAgICB9KTtcbiAgICB9O1xuXG4gICAgTW9kYWxMaW1pdC5wcm90b3R5cGUudG9nZ2xlTW9kYWxDbGFzcyA9IGZ1bmN0aW9uKCl7XG5cdCAgICBpZiAod2luZG93LmxvY2F0aW9uLmhhc2guaW5kZXhPZignbW9kYWwtJykgPiAwICYmICQod2luZG93LmxvY2F0aW9uLmhhc2gpLmxlbmd0aCA+IDApIHtcblx0XHRcdCQoJ2h0bWwnKS5hZGRDbGFzcygnb3ZlcmZsb3ctaGlkZGVuJykudHJpZ2dlcignb3Blbk1vZGFsJyk7XG5cdFx0fSBlbHNlIHtcblx0XHRcdCQoJ2h0bWwnKS5yZW1vdmVDbGFzcygnb3ZlcmZsb3ctaGlkZGVuJykudHJpZ2dlcignY2xvc2VNb2RhbCcpO1xuICAgICAgICAgICAgJCgnYm9keScpLnJlbW92ZUNsYXNzKCdvdmVyZmxvdy1oaWRkZW4nKTtcblx0XHR9XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgTW9kYWxMaW1pdCgpO1xuXG59KShqUXVlcnkpO1xuIiwiLy9cbi8vIEBuYW1lIFNlYXJjaCB0b3Bcbi8vIEBkZXNjcmlwdGlvbiAgT3BlbiB0aGUgdG9wIHNlYXJjaFxuLy9cbkhlbHNpbmdib3JnUHJpbWUgPSBIZWxzaW5nYm9yZ1ByaW1lIHx8IHt9O1xuSGVsc2luZ2JvcmdQcmltZS5Qcm9tcHQgPSBIZWxzaW5nYm9yZ1ByaW1lLlByb21wdCB8fCB7fTtcblxuSGVsc2luZ2JvcmdQcmltZS5Qcm9tcHQuU2VhcmNoVG9wID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICBmdW5jdGlvbiBTZWFyY2hUb3AoKSB7XG4gICAgICAgIHRoaXMuYmluZEV2ZW50cygpO1xuICAgIH1cblxuICAgIFNlYXJjaFRvcC5wcm90b3R5cGUuYmluZEV2ZW50cyA9IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgJCgnLnRvZ2dsZS1zZWFyY2gtdG9wJykub24oJ2NsaWNrJywgZnVuY3Rpb24gKGUpIHtcbiAgICAgICAgICAgIHRoaXMudG9nZ2xlKGUpO1xuICAgICAgICB9LmJpbmQodGhpcykpO1xuICAgIH07XG5cbiAgICBTZWFyY2hUb3AucHJvdG90eXBlLnRvZ2dsZSA9IGZ1bmN0aW9uIChlKSB7XG4gICAgICAgIGUucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgJCgnLnNlYXJjaC10b3AnKS5zbGlkZVRvZ2dsZSgzMDApO1xuICAgICAgICAkKCcuc2VhcmNoLXRvcCcpLmZpbmQoJ2lucHV0W3R5cGU9c2VhcmNoXScpLmZvY3VzKCk7XG4gICAgfTtcblxuICAgIHJldHVybiBuZXcgU2VhcmNoVG9wKCk7XG5cbn0pKGpRdWVyeSk7XG4iLCJIZWxzaW5nYm9yZ1ByaW1lID0gSGVsc2luZ2JvcmdQcmltZSB8fCB7fTtcbkhlbHNpbmdib3JnUHJpbWUuUHJvbXB0ID0gSGVsc2luZ2JvcmdQcmltZS5Qcm9tcHQgfHwge307XG5cbkhlbHNpbmdib3JnUHJpbWUuUHJvbXB0LlNoYXJlID0gKGZ1bmN0aW9uICgkKSB7XG5cbiAgICBmdW5jdGlvbiBTaGFyZSgpIHtcbiAgICAgICAgJChmdW5jdGlvbigpe1xuXG4gICAgICAgICAgICB0aGlzLmhhbmRsZUV2ZW50cygpO1xuXG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgfVxuXG4gICAgU2hhcmUucHJvdG90eXBlLm9wZW5Qb3B1cCA9IGZ1bmN0aW9uKGVsZW1lbnQpIHtcbiAgICAgICAgLy8gV2lkdGggYW5kIGhlaWdodCBvZiB0aGUgcG9wdXBcbiAgICAgICAgdmFyIHdpZHRoID0gNjI2O1xuICAgICAgICB2YXIgaGVpZ2h0ID0gMzA1O1xuXG4gICAgICAgIC8vIEdldHMgdGhlIGhyZWYgZnJvbSB0aGUgYnV0dG9uL2xpbmtcbiAgICAgICAgdmFyIHVybCA9ICQoZWxlbWVudCkuY2xvc2VzdCgnYScpLmF0dHIoJ2hyZWYnKTtcblxuICAgICAgICAvLyBDYWxjdWxhdGUgcG9wdXAgcG9zaXRpb25cbiAgICAgICAgdmFyIGxlZnRQb3NpdGlvbiA9ICh3aW5kb3cuc2NyZWVuLndpZHRoIC8gMikgLSAoKHdpZHRoIC8gMikgKyAxMCk7XG4gICAgICAgIHZhciB0b3BQb3NpdGlvbiA9ICh3aW5kb3cuc2NyZWVuLmhlaWdodCAvIDIpIC0gKChoZWlnaHQgLyAyKSArIDUwKTtcblxuICAgICAgICAvLyBQb3B1cCB3aW5kb3cgZmVhdHVyZXNcbiAgICAgICAgdmFyIHdpbmRvd0ZlYXR1cmVzID0gXCJzdGF0dXM9bm8saGVpZ2h0PVwiICsgaGVpZ2h0ICsgXCIsd2lkdGg9XCIgKyB3aWR0aCArIFwiLHJlc2l6YWJsZT1ubyxsZWZ0PVwiICsgbGVmdFBvc2l0aW9uICsgXCIsdG9wPVwiICsgdG9wUG9zaXRpb24gKyBcIixzY3JlZW5YPVwiICsgbGVmdFBvc2l0aW9uICsgXCIsc2NyZWVuWT1cIiArIHRvcFBvc2l0aW9uICsgXCIsdG9vbGJhcj1ubyxtZW51YmFyPW5vLHNjcm9sbGJhcnM9bm8sbG9jYXRpb249bm8sZGlyZWN0b3JpZXM9bm9cIjtcblxuICAgICAgICAvLyBPcGVuIHBvcHVwXG4gICAgICAgIHdpbmRvdy5vcGVuKHVybCwgJ1NoYXJlJywgd2luZG93RmVhdHVyZXMpO1xuICAgIH1cblxuICAgIC8qKlxuICAgICAqIEtlZXBzIHRyYWNrIG9mIGV2ZW50c1xuICAgICAqIEByZXR1cm4ge3ZvaWR9XG4gICAgICovXG4gICAgU2hhcmUucHJvdG90eXBlLmhhbmRsZUV2ZW50cyA9IGZ1bmN0aW9uKCkge1xuXG4gICAgICAgICQoZG9jdW1lbnQpLm9uKCdjbGljaycsICdbZGF0YS1hY3Rpb249XCJzaGFyZS1wb3B1cFwiXScsIGZ1bmN0aW9uIChlKSB7XG4gICAgICAgICAgICBlLnByZXZlbnREZWZhdWx0KCk7XG4gICAgICAgICAgICB0aGlzLm9wZW5Qb3B1cChlLnRhcmdldCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG5cbiAgICB9XG5cbiAgICByZXR1cm4gbmV3IFNoYXJlKCk7XG5cbn0pKGpRdWVyeSk7XG4iXX0=
