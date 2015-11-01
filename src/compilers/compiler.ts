import * as os from 'os';
import * as ast from './ast';

export class Context {
	private stack: ContextState[];
	
	constructor(rootNode: ast.Node) {
		this.stack = [new ContextState(rootNode)];
	}
	
	state(parent?: number) {
		if (parent) {
			return this.stack[this.stack.length - 1 - parent];
		} else {
			return this.stack[this.stack.length - 1];
		}
	}
	
	getStack(): ContextState[] {
		return this.stack;
	}
	
	push(node: ast.Node) {
		this.stack.push(new ContextState(node));
	}
	
	pop() {
		this.stack.pop();
	}
}

export class ContextState {
	node: ast.Node;
	
	constructor(node: ast.Node) {
		this.node = node;
	}
}

export abstract class Compiler {
	protected ctx: Context;
	protected output: string;
	
	constructor() {
		this.ctx = null;
		this.output = null;
	}
	
	protected append(str: string) {
		this.output += str;
	}
	
	protected isTopLevel(): boolean {
		return this.ctx.state(1).node.type === 'program';
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