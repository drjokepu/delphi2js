import * as os from 'os';

import * as ast from './ast';
import * as context from './context';
import * as scope from './scope';

export abstract class Compiler {
	protected ctx: context.Context;
	protected output: string;
	
	constructor() {
		this.ctx = null;
		this.output = null;
	}
	
	protected append(str: string) {
		this.output += str;
	}
	
	protected isTopLevel(): boolean {
		return this.ctx.state(1).node.type === ast.types.program;
	}
	
	protected isInBlock(): boolean {
		return this.ctx.state(1).node.type === ast.types.block;
	}
	
	protected nodeError(node: ast.Node): Error {
		let str = JSON.stringify(node, null, 2);
		if (this.ctx) {
			str += os.EOL + 'at:' + os.EOL;
			
			const stack = this.ctx.getStack();
			for (let i = 0; i < stack.length; i++) {
				for (let j = 0; j < i; j++) {
					str += '  ';
				}
				
				str += stack[i].node.type;
				str += os.EOL;
			}
		}
		console.error(str);
		return new Error('Unsupported node type: ' + node.type);
	}
	
	protected static padStringWithZeroes(str: string, minLength: number) {
		if (str.length < minLength) {
			let str2 = str;
			while (str2.length < minLength) {
				str2 = '0' + str2;
			}
			return str2;
		} else {
			return str;
		}
	}
	
	public abstract compile(fileAst: ast.PasFile): string;
}