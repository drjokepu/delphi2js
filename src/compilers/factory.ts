import * as compiler from './compiler';
import ES5Compiler from './es5-compiler';

export enum CompilerTarget {
	ES5 = 0
}

export function makeCompiler(target: CompilerTarget): compiler.Compiler {
	switch (target) {
		case CompilerTarget.ES5:
			return new ES5Compiler();
		default:
			throw new Error('Unsupported compiler target: ' + target);
	}
}