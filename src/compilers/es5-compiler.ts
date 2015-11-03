import * as ast from './ast';
import * as compiler from './compiler';
import * as context from './context';
import * as scopeAnalyzer from './scope-analyzer';

class ES5Compiler extends compiler.Compiler {
	constructor() {
		super();
	}
	
	compile(fileAst: ast.PasFile): string {
		scopeAnalyzer.attachScope(fileAst);
		
		this.ctx = new context.Context(fileAst);
		this.output = '';
		
		switch (fileAst.type) {
			case ast.types.program:
				this.compileProgram(<ast.Program>fileAst);
				break;
			case ast.types.unit:
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
		this.compileInterfacePart(node.interfacePart);
		this.compileImplementationPart(node.implementationPart);
	}
	
	private compileInterfacePart(node: ast.InterfacePart): void {
		this.ctx.push(node);
		try {
			this.compileDeclarations(node.declarations);
		} finally {
			this.ctx.pop();
		}
	}
	
	private compileImplementationPart(node: ast.ImplementationPart): void {
		this.ctx.push(node);
		try {
			this.compileDeclarations(node.declarations);
		} finally {
			this.ctx.pop();
		}
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
			case ast.types.variableDeclaration:
				this.compileVariableDeclaration(<ast.VariableDeclaration>node);
				break;
			case ast.types.variableDeclarationPart:
				this.compileVariableDeclarationPart(<ast.VariableDeclarationPart>node);
				break;
			case ast.types.constantDeclaration:
				this.compileConstantDeclaration(<ast.ConstantDeclaration>node);
				break;
			case ast.types.constantDeclarationPart:
				this.compileConstantDeclarationPart(<ast.ConstantDeclarationPart>node);
				break;
			case ast.types.procedureHeader:
				break;
			case ast.types.functionHeader:
				break;
			case ast.types.procedureDeclaration:
				this.compileProcedureDeclaration(<ast.ProcedureDeclaration>node);
				break;
			case ast.types.functionDeclaration:
				this.compileFunctionDeclaration(<ast.FunctionDeclaration>node);
				break;
			default:
				throw this.nodeError(node);
		}
	}
	
	private compileVariableDeclaration(node: ast.VariableDeclaration): void {
		this.ctx.push(node);
		try {
			if (!node.identifiers || node.identifiers.length === 0) {
				return;
			}
			
			if (!node.expression) {
				this.append('var ');
				for (let i = 0; i < node.identifiers.length; i++) {
					if (i > 0) {
						this.append(',');
					}
					this.compileIdentifier(node.identifiers[i]);
				}
				this.append(';');
			} else {
				this.append('var ');
				this.compileIdentifier(node.identifiers[0]);
				this.append('=');
				this.compileExpression(node.expression);
				this.append(';');
				
				for (let i = 1; i = node.identifiers.length; i++) {
					this.append('var ');
					this.compileIdentifier(node.identifiers[i]);
					this.append('=');
					this.compileIdentifier(node.identifiers[0]);
					this.append(';');
				}
			}
		} finally {
			this.ctx.pop();
		}
	}
	
	private compileVariableDeclarationPart(node: ast.VariableDeclarationPart): void {
		for (let decl of node.list) {
			this.compileVariableDeclaration(decl);
		}
	}
	
	private compileConstantDeclaration(node: ast.ConstantDeclaration): void {
		this.ctx.push(node);
		try {
			this.append('var ');
			this.compileIdentifier(node.identifier);
			this.append('=');
			this.compileExpression(node.value);
			this.append(';');
		} finally {
			this.ctx.pop();
		}
	}
	
	private compileConstantDeclarationPart(node: ast.ConstantDeclarationPart): void {
		for (let decl of node.list) {
			this.compileConstantDeclaration(decl);
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
			case ast.types.valueParameter:
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
			
			this.compileDeclarations(node.declarations);
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
			case ast.types.assignment:
				this.compileAssignment(<ast.Assignment>node);
				break;
			case ast.types.procedureStatement:
				this.compileProcedureStatement(<ast.ProcedureStatement>node);
				break;
			case ast.types.compoundStatement:
				this.compileCompoundStatement(<ast.CompoundStatement>node);
				break;
			case ast.types.ifStatement:
				this.compileIfStatement(<ast.IfStatement>node);
				break;
			case ast.types.tryExcept:
				this.compileTryExceptStatement(<ast.TryExceptStatement>node);
				break;
			case ast.types.tryFinally:
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
			case ast.types.identifier:
				this.compileIdentifier(<ast.Identifier>node);
				break;
			default:
				throw this.nodeError(node);
		}
	}
	
	private compileProcedureStatement(node: ast.ProcedureStatement): void {
		this.ctx.push(node);
		try {
			this.compileCallTarget(node.target);
			this.compileParameterList(node.params);
			this.append(';');
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
			const isInBlock = this.isInBlock();
			if (!isInBlock) {
				this.append('{');
			}
			this.compileStatementList(node.list);
			if (!isInBlock) {
				this.append('}');
			}
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
			if (node.handlers && (<ast.ExceptionHandlerClause>node.handlers).type === ast.types.exceptionHandlerClause) {
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
			case ast.types.stringConstant:
				this.compileStringConstant(<ast.StringConstant>node);
				break;
			case ast.types.controlString:
				this.compileControlString(<ast.ControlString>node);
				break;
			case ast.types.integerConstant:
				this.compileIntegerConstant(<ast.IntegerConstant>node);
				break;
			case ast.types.parens:
				this.compileParens(<ast.Parens>node);
				break;
			case ast.types.binaryOp:
				this.compileBinaryOp(<ast.BinaryOp>node);
				break;
			case ast.types.functionCall:
				this.compileFunctionCall(<ast.FunctionCall>node);
				break;
			case ast.types.setConstructor:
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
	
	private compileIntegerConstant(node: ast.IntegerConstant): void {
		this.append(node.value.toString());
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
			if ((node.params && node.params.length > 0) || scopeAnalyzer.canInvoke(node.target, this.ctx)) {
				this.compileCallTarget(node.target);
				this.compileParameterList(node.params);
			} else {
				// this is not a function call, but reading the value of a variable or constant
				this.compileCallTarget(node.target);
			}
		} finally {
			this.ctx.pop();
		}
	}
	
	private compileCallTarget(node: ast.CallTarget): void {
		this.ctx.push(node);
		try {
			switch (node.type) {
				case ast.types.identifier:
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
				if (node.list[i].type === ast.types.range) {
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