///<reference path="../typings/tsd.d.ts" />
import colors from 'colors/safe';
import * as os from 'os';
import Parser from './parser';

if (process.argv.length < 3) {
	console.error("usage: node delphi.pegjs source_file");
	process.exit(0);
}

new Parser().parseFile(process.argv[2]).then(data => {
	console.log(JSON.stringify(data, null, 2));
}, err => {
	if (err.name === 'SyntaxError') {
		console.error(colors.red(err.message) + os.EOL +
			'  at line ' + err.location.start.line + ', column ' + err.location.start.column + '.');
	} else {
		console.error(colors.red('Error:') + ' ' + err + os.EOL + JSON.stringify(err, null, 2));
	}
}).done();