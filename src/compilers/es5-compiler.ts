import * as ast from './ast';
import * as compiler from './compiler';

class ES5Compiler extends compiler.Compiler {
	constructor() {
		super();
	}
	
	compile(fileAst: ast.PasFile): string {
		this.ctx = new compiler.Context(fileAst);
		this.output = '';
		
		switch (fileAst.type) {
			case 'program':
				this.compileProgram(<ast.Program>fileAst);
				break;
			case 'unit':
				this.compileUnit(<ast.Unit>fileAst);
				break;
			default:
				throw this.nodeError(fileAst);
		}
		
		return this.output;
	}
	
	private compileProgram(node: ast.Program): void {
		this.compileBlock(node.body);
	}
	
	private compileUnit(node: ast.Unit): void {
		this.compileImplementationPart(node.implementation);
	}
	
	private compileImplementationPart(node: ast.ImplementationPart): void {
		this.compileDeclarations(node.declarations);
	}
	
	private compileDeclarations(declarations: ast.Declaration[]): void {
		if (!declarations) {
			return;
		}
		
		for (let decl of declarations) {
			this.compileDeclaration(decl);
		}
	}
	
	private compileDeclaration(node: ast.Declaration): void {
		switch (node.type) {
			case 'procedure_declaration':
				this.compileProcedureDeclaration(<ast.ProcedureDeclaration>node);
				break;
			case 'function_declaration':
				this.compileFunctionDeclaration(<ast.FunctionDeclaration>node);
				break;
			default:
				throw this.nodeError(node);
		}
	}
	
	private compileProcedureDeclaration(node: ast.ProcedureDeclaration): void {
		this.ctx.push(node);
		try {
			this.append('function ');
			this.compileIdentifier(node.identifier);
			this.compileParameterDeclarations(node.params);
			this.compileBlock(node.block);
		} finally {
			this.ctx.pop();
		}
	}
	
	private compileFunctionDeclaration(node: ast.FunctionDeclaration): void {
		this.ctx.push(node);
		try {
			this.append('function ');
			this.compileIdentifier(node.identifier);
			this.compileParameterDeclarations(node.params);
			this.compileBlock(node.block);
		} finally {
			this.ctx.pop();
		}
	}
	
	private compileParameterDeclarations(declarations: ast.ParameterDeclaration[]): void {
		if (!declarations) {
			this.append('()');
			return;
		}
		
		this.append('(');
		for (let i = 0; i < declarations.length; i++) {
			if (i > 0) {
				this.append(',');
			}
			this.compileParameterDeclaration(declarations[i]);
		}
		this.append(')');
	}
	
	private compileParameterDeclaration(node: ast.ParameterDeclaration): void {
		switch (node.type) {
			case 'value_parameter':
				this.compileValueParameter(<ast.ValueParameter>node);
				break;
			default:
				throw this.nodeError(node);
		}
	}
	
	private compileValueParameter(node: ast.ValueParameter): void {
		this.ctx.push(node);
		try {
			for (let i = 0; i < node.identifiers.length; i++) {
				if (i > 0) {
					this.append(',');
				}
				this.compileIdentifier(node.identifiers[i]);
			}
		} finally {
			this.ctx.pop();
		}
	}
	
	private compileBlock(node: ast.Block): void {
		this.ctx.push(node);
		try {
			const isTopLevel = this.isTopLevel();
			if (!isTopLevel) {
				this.append('{');
			}
			this.compileCompoundStatement(node.statements);
			if (!isTopLevel) {
				this.append('}');
			}
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
			case 'assignment':
				this.compileAssignment(<ast.Assignment>node);
				break;
			case 'procedure_statement':
				this.compileProcedureStatement(<ast.ProcedureStatement>node);
				break;
			case 'compound_statement':
				this.compileCompoundStatement(<ast.CompoundStatement>node);
				break;
			case 'if':
				this.compileIfStatement(<ast.IfStatement>node);
				break;
			case 'try_except':
				this.compileTryExceptStatement(<ast.TryExceptStatement>node);
				break;
			case 'try_finally':
				this.compileTryFinallyStatement(<ast.TryFinallyStatement>node);
				break;
			default:
				throw this.nodeError(node);
		}
	}
	
	private compileAssignment(node: ast.Assignment): void {
		this.ctx.push(node);
		try {
			this.compileAssignmentTarget(node.target);
			this.append(this.translateAssignmentOperator(node.operator));
			this.compileExpression(node.expression);
			this.append(';');
		} finally {
			this.ctx.pop();
		}
	}
	
	private translateAssignmentOperator(op: string) {
		switch (op) {
			case ':=': return '=';
			default: throw new Error('Unsupported assignment operator: ' + op);
		}
	}
	
	private compileAssignmentTarget(node: ast.AssignmentTarget) {
		switch (node.type) {
			case 'identifier':
				this.compileIdentifier(<ast.Identifier>node);
				break;
			default:
				throw this.nodeError(node);
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
					throw this.nodeError(node);
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
	
	private compileIfStatement(node: ast.IfStatement): void {
		this.ctx.push(node);
		try {
			this.append('if (');
			this.compileExpression(node.condition);
			this.append(')');
			this.compileStatement(node.trueBranch);
			
			if (node.falseBranch) {
				this.append(' else ');
				this.compileStatement(node.falseBranch);
			}
		} finally {
			this.ctx.pop();
		}
	}
	
	private compileTryExceptStatement(node: ast.TryExceptStatement): void {
		this.ctx.push(node);
		try {
			if (node.handlers && (<ast.ExceptionHandlerClause>node.handlers).type === 'exception_handler_clause') {
				throw new Error('Exception handlers are not implement yet.');
			}
			
			this.append('try {')
			for (let statement of node.body) {
				this.compileStatement(statement);
			}
			this.append('} catch {')
			if (node.handlers) {
				for (let statement of <ast.Statement[]>(node.handlers)) {
					this.compileStatement(statement);
				}
			}
			this.append('}');
		} finally {
			this.ctx.pop();
		}
	}
	
	private compileTryFinallyStatement(node: ast.TryFinallyStatement): void {
		this.ctx.push(node);
		try {
			this.append('try {')
			for (let statement of node.body) {
				this.compileStatement(statement);
			}
			this.append('} finally {')
			if (node.fin) {
				for (let statement of node.fin) {
					this.compileStatement(statement);
				}
			}
			this.append('}');
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
			case 'control_string':
				this.compileControlString(<ast.ControlString>node);
				break;
			case 'parens':
				this.compileParens(<ast.Parens>node);
				break;
			case 'binary_op':
				this.compileBinaryOp(<ast.BinaryOp>node);
				break;
			case 'function_call':
				this.compileFunctionCall(<ast.FunctionCall>node);
				break;
			case 'set_constructor':
				this.compileSetConstructor(<ast.SetConstructor>node);
				break;
			default:
				throw this.nodeError(node);
		}
	}
	
	private compileStringConstant(node: ast.StringConstant): void {
		this.append('"');
		this.append(node.value.replace('\\', '\\\\').replace('"', '\\"'));
		this.append('"');
	}
	
	private compileControlString(node: ast.ControlString): void {
		if (node.value < 0) {
			throw new Error('Control string value cannot be less than 0, but it is ' + node.value + '.');
		}
		
		if (node.value < 256) {
			this.append('"\\x' + compiler.Compiler.padStringWithZeroes(node.value.toString(16), 2) + '"');
		} else {
			this.append('"\\u' + compiler.Compiler.padStringWithZeroes(node.value.toString(16), 4) + '"');
		}
	}
	
	private compileParens(node: ast.Parens): void {
		this.ctx.push(node);
		try {
			this.append('(');
			this.compileExpression(node.expression);
			this.append(')');
		} finally {
			this.ctx.pop();
		}
	}
	
	private compileBinaryOp(node: ast.BinaryOp): void {
		this.ctx.push(node);
		try {
			this.compileExpression(node.left);
			this.append(this.translateBinaryOperator(node.op));
			this.compileExpression(node.right);
		} finally {
			this.ctx.pop();
		}
	}
	
	private translateBinaryOperator(op: string) {
		switch (op) {
			case '+': return '+';
			case '=': return '===';
			case '<>': return '!==';
			case 'and': return '&&';
			default: throw new Error('Unsupported binary operator: ' + op);
		}
	} 
	
	private compileFunctionCall(node: ast.FunctionCall): void {
		this.ctx.push(node);
		try {
			this.compileFunctionCallTarget(node.target);
			this.compileParameterList(node.params);
		} finally {
			this.ctx.pop();
		}
	}
	
	private compileFunctionCallTarget(node: ast.FunctionCallTarget): void {
		this.ctx.push(node);
		try {
			switch (node.type) {
				case 'identifier':
					this.compileIdentifier(<ast.Identifier>node);
					break;
				default:
					throw this.nodeError(node);
			}
		} finally {
			this.ctx.pop();
		}
	}
	
	private compileSetConstructor(node: ast.SetConstructor): void {
		this.ctx.push(node);
		try {
			if (!node.list) {
				this.append('[]');
				return;
			} 
			
			this.append('[');
			for (let i = 0; i < node.list.length; i++) {
				if (i > 0) {
					this.append(',');
				}
				
				// TODO: range support
				if (node.list[i].type === 'range') {
					throw new Error('Ranges in set constructors are not implemented yet.');
				} else {
					this.compileExpression(<ast.Expression>node.list[i]);
				}
			}
			this.append(']');
		} finally {
			this.ctx.pop();
		}
	}
}

export default ES5Compiler;