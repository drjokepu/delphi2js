import * as ast from './ast';

class Context {
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
	
	push(node: ast.Node) {
		this.stack.push(new ContextState(node));
	}
	
	pop() {
		this.stack.pop();
	}
}

class ContextState {
	node: ast.Node;
	
	constructor(node: ast.Node) {
		this.node = node;
	}
}

export function compile(fileAst: ast.PasFile): string {
	return new Compiler().compile(fileAst);
}

function nodeError(node: ast.Node): Error {
	return new Error('Unsupported node type: ' + node.type);
}

class Compiler {
	private ctx: Context;
	private output: string;
	
	constructor() {
		this.ctx = null;
		this.output = null;
	}
	
	private append(str: string) {
		this.output += str;
	}
	
	compile(fileAst: ast.PasFile): string {
		this.ctx = new Context(fileAst);
		this.output = '';
		
		switch (fileAst.type) {
			case 'program':
				this.compileProgram(<ast.Program>fileAst);
				break;
			default:
				throw nodeError(fileAst);
		}
		
		return this.output;
	}
	
	private compileProgram(node: ast.Program): void {
		this.compileBlock(node.body);
	}
	
	private compileBlock(node: ast.Block): void {
		this.ctx.push(node);
		try {
			this.compileCompoundStatement(node.statements);
		} finally {
			this.ctx.pop();
		}
	}
	
	private compileStatementList(statements: ast.Statement[]): void {
		if (!statements) {
			return;
		}
		
		for (let node of statements) {
			this.compileStatement(node);
		}
	}
	
	private compileStatement(node: ast.Statement): void {
		switch (node.type) {
			case 'procedure_statement':
				this.compileProcedureStatement(<ast.ProcedureStatement>node);
				break;
			case 'compound_statement':
				this.compileCompoundStatement(<ast.CompoundStatement>node);
			default:
				throw nodeError(node);
		}
	}
	
	private compileProcedureStatement(node: ast.ProcedureStatement): void {
		this.ctx.push(node);
		try {
			this.compileProcedureStatementTarget(node.target);
			this.compileParameterList(node.params);
			this.append(';');
		} finally {
			this.ctx.pop();
		}
	}
	
	private compileProcedureStatementTarget(node: ast.ProcedureStatementTarget): void {
		this.ctx.push(node);
		try {
			switch (node.type) {
				case 'identifier':
					this.compileIdentifier(<ast.Identifier>node);
					break;
				default:
					throw nodeError(node);
			}
		} finally {
			this.ctx.pop();
		}
	}
	
	private compileParameterList(params: ast.Expression[]): void {
		if (!params) {
			this.append('()');
			return;
		}
		
		this.append('(');
		for (let i = 0; i < params.length; i++) {
			if (i > 0) {
				this.append(',');
			}
			this.compileExpression(params[i]);
		}
		this.append(')');
	}
	
	private compileCompoundStatement(node: ast.CompoundStatement): void {
		this.ctx.push(node);
		try {
			this.compileStatementList(node.list);
		} finally {
			this.ctx.pop();
		}
	}
	
	private compileIdentifier(node: ast.Identifier): void {
		// todo: JS keywords
		this.append(node.value);
	}
	
	private compileExpression(node: ast.Expression): void {
		switch (node.type) {
			case 'string_constant':
				this.compileStringConstant(<ast.StringConstant>node);
				break;
			default:
				throw nodeError(node);
		}
	}
	
	private compileStringConstant(node: ast.StringConstant): void {
		this.append('"');
		this.append(node.value.replace('\\', '\\\\').replace('"', '\\"'));
		this.append('"');
	}
}

