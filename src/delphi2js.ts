///<reference path="../typings/tsd.d.ts" />
import colors from 'colors/safe';
import * as os from 'os';
import Parser from './parser';

new Parser().parseFile('test-files/EventLog.pas').then(data => {
	console.log(JSON.stringify(data, null, 2));
}, err => {
	if (err.name === 'SyntaxError') {
		console.error(colors.red(err.message) + os.EOL +
			'  at line ' + err.location.start.line + ', column ' + err.location.start.column + '.');
	} else {
		console.error(JSON.stringify(err, null, 2));
	}
}).done();