var global = this;

/*most extra functions could be possibly unsafe*/
var whitey = {
	'self'               : 1,
	'onmessage'          : 1,
	'postMessage'        : 1,
	'global'             : 1,
	'whitey'             : 1, /*look mom, I'm a whitelist, containing itself!*/
	'eval'               : 1,
	'Array'              : 1,
	'Boolean'            : 1,
	'Date'               : 1,
	'Function'           : 1,
	'Number'             : 1,
	'Object'             : 1,
	'RegExp'             : 1,
	'String'             : 1,
	'Error'              : 1,
	'EvalError'          : 1,
	'RangeError'         : 1,
	'ReferenceError'     : 1,
	'SyntaxError'        : 1,
	'TypeError'          : 1,
	'URIError'           : 1,
	'decodeURI'          : 1,
	'decodeURIComponent' : 1,
	'encodeURI'          : 1,
	'encodeURIComponent' : 1,
	'isFinite'           : 1,
	'isNaN'              : 1,
	'parseFloat'         : 1,
	'parseInt'           : 1,
	'Infinity'           : 1,
	'JSON'               : 1,
	'Math'               : 1,
	'NaN'                : 1,
	'undefined'          : 1
};

[ global, global.__proto__ ].forEach(function ( obj ) {
	Object.getOwnPropertyNames( obj ).forEach(function( prop ) {

		if( !whitey.hasOwnProperty( prop ) ) {
			Object.defineProperty( obj, prop, {
				get : function() {
					throw 'Security Exception: Cannot access ' + prop;
					return 1;
				},

				configurable : false
			});
		}
	}); /*end while*/
});

Object.defineProperty( Array.prototype, 'join', {
	writable: false,
	configurable: false,
	enumrable: false,

	value: (function ( old ) {
		return function ( arg ) {
			if ( this.length > 500 || (arg && arg.length > 500) ) {
				throw 'Exception: too many items';
			}

			return old.apply( this, arguments );
		};
	}( Array.prototype.join ))
});

(function(){
	"use strict";

	var console = {
		_items : [],
		log : function() {
			console._items.push.apply( console._items, arguments );
		}
	};
	var p = console.log.bind( console );

	function exec ( code ) {
		var result;
		try {
			result = eval( '"use strict";undefined;\n' + code );
		}
		catch ( e ) {
			result = e.toString();
		}

		return result;
	}

	self.onmessage = function ( event ) {
		var jsonStringify = JSON.stringify, /*backup*/
			result = exec( event.data.code );

		var natives = {
			Number  : true, String : true,
			Boolean : true, Null   : true };

		/*JSON.stringify does not like functions, errors or undefined*/
		var stringify = function ( input ) {
			var type = ( {} ).toString.call( input ).slice( 8, -1 ),
				output;

			if ( Array.isArray(input) ) {
				output = input.map(function ( item ) {
					return stringify( item );
				});
			}
			else if ( type === 'Object' ) {
				output = Object.keys( input ).reduce(function ( ret, key ) {
					ret[ key ] = stringify( input[key] );
					return ret;
				}, {} );
			}
			else if ( input === undefined ) {
				output = 'undefined';
			}
			else if ( type in natives ) {
				output = input;
			}
			else {
				output = input.toString();
			}

			return output;
		};

		postMessage({
			answer : jsonStringify( stringify(result) ),
			log    : jsonStringify( stringify(console._items) ).slice(1, -1)
		});
	};

})();
