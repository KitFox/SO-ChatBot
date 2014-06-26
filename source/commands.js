(function () {
"use strict";

var commands = {
	help : function ( args ) {
		if ( args && args.length ) {

			var cmd = bot.getCommand( args.toLowerCase() );
			if ( cmd.error ) {
				return cmd.error;
			}

			var desc = cmd.description || 'No info is available';

			return args + ': ' + desc;
		}

		return '[General help](https://github.com/KitFox/SO-ChatBot/wiki/' +
			'Interacting-with-the-bot)';
	},

	listen : function ( msg ) {
		var ret = bot.callListeners( msg );
		if ( !ret ) {
			return bot.giveUpMessage();
		}
	},

	eval : function ( msg, cb ) {
		cb = cb || msg.directreply.bind( msg );

		return bot.eval( msg, cb );
	},
	coffee : function ( args ) {
		if ( !args.length ) {
			return 'How do you like it?';
		}
		else if (/^(grande|large)/.test(args)) {
			args.directreply( 'http://www.precisionnutrition.com/wordpress/'+
		'wp-content/uploads/2010/01/w-Giant-Coffee-Cup75917.jpg' );
		}
		 else if (/^(with cream|sugar and milk|black|regular)/.test(args)) {
                			args.directreply('Here go you, sugar.');
          		 }
		else {
			return 'I\'m not that skilled a barista.';
		}
	},

	refresh : function() {
		window.location.reload();
		return '*yawns*';
		    },

	forget : function ( args ) {
		var name = args.toLowerCase(),
			cmd = bot.getCommand( name );

		if ( cmd.error ) {
			return cmd.error;
		}

		if ( !cmd.canDel(args.get('user_id')) ) {
			return 'You are not authorized to delete the command ' + args;
		}

		cmd.del();
		return 'Command ' + name + ' forgotten.';
	},

	//a lesson on semi-bad practices and laziness
	//chapter III
	info : function ( args ) {
		if ( args.content ) {
			return commandFormat( args.content );
		}

		var info = bot.info;
		return timeFormat() + ', ' + statsFormat();

		function commandFormat ( commandName ) {
			var cmd = bot.getCommand( commandName );

			if ( cmd.error ) {
				return cmd.error;
			}
			var ret =  'Command {name}, created by {creator}'.supplant( cmd );

			if ( cmd.date ) {
				ret += ' on ' + cmd.date.toUTCString();
			}

			if ( cmd.invoked ) {
				ret += ', invoked ' + cmd.invoked + ' times';
			}
			else {
				ret += ' but hasn\'t been used yet';
			}

			return ret;
		}

		function timeFormat () {
			var format = 'I awoke on {0} (that\'s about {1} ago)',

				awoke = info.start.toUTCString(),
				ago = Date.timeSince( info.start );

			return format.supplant( awoke, ago );
		}

		function statsFormat () {
			var ret = [],
				but = ''; //you'll see in a few lines

			if ( info.invoked ) {
				ret.push( 'got invoked ' + info.invoked + ' times' );
			}
			if ( info.learned ) {
				but = 'but ';
				ret.push( 'learned ' + info.learned + ' commands' );
			}
			if ( info.forgotten ) {
				ret.push( but + 'forgotten ' + info.forgotten + ' commands' );
			}
			if ( Math.random() < 0.15 ) {
				ret.push( 'teleported ' + Math.rand(100) + ' goats' );
			}

			return ret.join( ', ' ) || 'haven\'t done anything yet!';
		}
	},
	
	lego: function ( args ) {
		if ( !args.length ) {
			return 'I need a set number to look up.';
		}
		var setNumber =args.parse();
		var link = 'http://www.1000steine.com/brickset/images/'+setNumber+'-1.jpg';
       		args.directreply( link );
		args.send( 'http://brickset.com/detail/?Set='+setNumber+'-1' );
	},

	legopart: function ( args ) {
		if ( !args.length ) {
			return 'I need a part number to look up.';
		}
		var spec =args.parse();
		var partNumber = spec[0];
		var partColour = spec[1];
		var linkBase = 'http://img.lugnet.com/ld/';
		if ( (/^\d+$/.test(partColour)) ) {
			linkBase = linkBase + partColour + '/';
		};
		var linkPart = linkBase + partNumber+'.gif';
       		args.directreply( linkPart );
	},

	nuke: function ( args ) {
		args.send( 'http://celebrationtowncenter.com/wordpress/'+
'wp-content/uploads/2010/11/hello_kitty_033.gif');
	},

	nsa: function ( args ) {
		args.send('DEADHS FAATSA FAMS gas ICE. It\'s Danish for \'fat dead families on ice.\' Denmark\'s rough.');
	},

	nano: function ( args ){
		if ( !args.length ) {
			return 'I need a handle to look up.';
		}
		var author =args.parse();
		var linkBase = 'http://www.nanowrimo.org/widget/LiveSupporter/';
		var url = linkBase + author + '.png';
		args.send( url );
	},

	wordwar: function ( args ){
		if ( !args.length ) {
			return 'I need two handles to look up.';
		}
		var authors =args.parse();
		var author1 = authors[0];
		var author2 = authors[1];

		var linkBase = 'http://nanowrimo.org/widget/WordWar/';
		var url = linkBase + author1 + ',' + author2 +'.png';
		args.send( url );
	}
};

commands.listcommands = (function () {
var partition = function ( list, maxSize ) {
	var size = 0, last = [];

	var ret = list.reduce(function partition ( ret, item ) {
		var len = item.length + 2; //+1 for comma, +1 for space

		if ( size + len > maxSize ) {
			ret.push( last );
			last = [];
			size = 0;
		}
		last.push( item );
		size += len;

		return ret;
	}, []);

	if ( last.length ) {
		ret.push( last );
	}

	return ret;
};

return function ( args ) {
	var commands = Object.keys( bot.commands ),
		pagination = ' (page {0}/{1})',
		user_name = args.get( 'user_name' ),
		// 500 is the max, -2 for @ and space.
		maxSize = 498 - pagination.length - user_name.length,
		//TODO: only call this when commands were learned/forgotten since last
		partitioned = partition( commands, maxSize ),

		valid = /^(\d+|$)/.test( args.content ),
		page = Number( args.content ) || 0;

	if ( page >= partitioned.length || !valid ) {
		return args.codify( [
			'StackOverflow: Could not access page.',
			'IndexError: index out of range',
			'java.lang.IndexOutOfBoundsException',
			'IndexOutOfRangeException'
		].random() );
	}

	var ret = partitioned[ page ].join( ', ' );

	return ret + pagination.supplant( page, partitioned.length-1 );
};
})();

commands.eval.async = commands.coffee.async = true;

commands.tell = (function () {
var invalidCommands = { tell : true, forget : true };

return function ( args ) {
	var parts = args.split( ' ');
	bot.log( args.valueOf(), parts, '/tell input' );

	var replyTo = parts[ 0 ],
		cmdName = parts[ 1 ],
		cmd;

	if ( !replyTo || !cmdName ) {
		return 'Invalid /tell arguments. Use /help for usage info';
	}

	cmdName = cmdName.toLowerCase();
	cmd = bot.getCommand( cmdName );
	if ( cmd.error ) {
		return cmd.error;
	}

	if ( invalidCommands.hasOwnProperty(cmdName) ) {
		return 'Command ' + cmdName + ' cannot be used in /tell.';
	}

	if ( !cmd.canUse(args.get('user_id')) ) {
		return 'You do not have permission to use command ' + cmdName;
	}

	//check if the user's being a fag
	if ( /^@/.test(replyTo) ) {
		return 'Don\'t be annoying, drop the @, nobody likes a double-ping.';
	}

	//check if the user wants to reply to a message
	var direct = false,
		extended = {};
	if ( /^:?\d+$/.test(replyTo) ) {
		extended.message_id = replyTo.replace( /^:/, '' );
		direct = true;
	}
	else {
		extended.user_name = replyTo;
	}

	var msgObj = Object.merge( args.get(), extended );
	var cmdArgs = bot.Message(
		parts.slice( 2 ).join( ' ' ),
		msgObj );

	//this is an ugly, but functional thing, much like your high-school prom date
	//to make sure a command's output goes through us, we simply override the
	// standard ways to do output
	var reply = cmdArgs.reply.bind( cmdArgs ),
		directreply = cmdArgs.directreply.bind( cmdArgs );

	cmdArgs.reply = cmdArgs.directreply = cmdArgs.send = callFinished;

	bot.log( cmdArgs, '/tell calling ' + cmdName );

	//if the command is async, it'll accept a callback
	if ( cmd.async ) {
		cmd.exec( cmdArgs, callFinished );
	}
	else {
		callFinished( cmd.exec(cmdArgs) );
	}

	function callFinished ( res ) {
		if ( !res ) {
			return;
		}

		if ( direct ) {
			directreply( res );
		}
		else {
			reply( res );
		}
	}
};
}());

var descriptions = {
  eval: 'Forwards message to javascript code-eval',
        coffee: 'Forwards message to barista',
        forget: 'Forgets a given command. `/forget cmdName`',
        help: 'Fetches documentation for given command, or general help article.' +' `/help [cmdName]`',
        info: 'Grabs some stats on my current instance or a command.' +' `/info [cmdName]`',
        lego: 'Returns an image of a LEGO set and link to Brickset page. Takes set number as argument.',
        legopart: 'Returns image of LEGO part. Takes part number as argument.',
        listcommands: 'Lists commands. `/listcommands [page=0]`',
        listen: 'Forwards the message to my ears (as if called without the /)',
        nano: 'Returns a NaNoWriMo user widget. Takes NaNo handle as argument.',
        refresh: 'Reloads the browser window I live in',
        tell: 'Redirect command result to user/message.' +' /tell `msg_id|usr_name cmdName [cmdArgs]`',
        wordwar: 'Returns a NaNoWriMo wordwar widget. Takes two NaNo handles as arguments (no delimiter).'
};

//only allow owners to use certain commands
var privilegedCommands = {
	die : true, live  : true,
	ban : true, unban : true
};
//voting-based commands for unpriviledged users
var communal = {
	die : true, ban : true
};

Object.iterate( commands, function ( cmdName, fun ) {
	var cmd = {
		name : cmdName,
		fun  : fun,
		permissions : {
			del : 'NONE',
			use : privilegedCommands[ cmdName ] ? 'OWNER' : 'ALL'
		},
		description : descriptions[ cmdName ],
		async : commands[ cmdName ].async
	};

	if ( communal[cmdName] ) {
		cmd = bot.CommunityCommand( cmd );
	}
	bot.addCommand( cmd );
});

}());
