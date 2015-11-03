import * as ast from './ast';
import * as scope from './scope';

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
	
	getScope(): scope.Scope {
		for (let i = this.stack.length - 1; i >= 0; i--) {
			if (this.stack[i].node.scope) {
				return this.stack[i].node.scope;
			}
		}
		
		throw Error('Context has no root scope.');
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