///<reference path="../typings/tsd.d.ts" />
import * as fs from 'fs';
import * as Q from 'q';

declare function require(path: string): any;
var delphiParser = <DelphiParser>require('../parser/delphi.js');

interface DelphiParser {
	parse(src: string): any;
}

class Parser {
	parse(src: string): any {
		return delphiParser.parse(src);
	}
	
	parseFile(path: string): Q.Promise<any> {
		let deferred = Q.defer<any>();
		fs.readFile(path, 'utf8', (err, data) => {
			if (err) {
				deferred.reject(err);
			} else {
				try {
					deferred.resolve(this.parse(data));
				} catch (_err) {
					deferred.reject(_err);
				}
			}
		});
		
		return deferred.promise;
	}
}

export default Parser;