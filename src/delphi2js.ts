///<reference path="../typings/tsd.d.ts" />
import * as beautify from 'js-beautify';
import colors from 'colors/safe';
import minimist from 'minimist';

import * as os from 'os';
import * as compiler from './compiler';
import Parser from './parser';

let argv = minimist(process.argv.slice(2), {
	boolean: ['ast', 'pretty']
});



if (argv._.length === 0) {
	console.error("usage: node delphi.pegjs [--ast | --pretty] source_file");
	process.exit(0);
}

new Parser().parseFile(argv._[0]).then(data => {
	if (argv['ast']) {
		console.log(JSON.stringify(data, null, 2));
	} else {
		let js = compiler.compile(data);
		if (argv['pretty']) {
			js = beautify.js_beautify(js, {});
		}
		console.log(js);
	}
}, err => {
	if (err.name === 'SyntaxError') {
		console.error(colors.red(err.message) + os.EOL +
			'  at line ' + err.location.start.line + ', column ' + err.location.start.column + '.');
	} else {
		console.error(colors.red('Error:') + ' ' + err + os.EOL + JSON.stringify(err, null, 2));
	}
}).done();