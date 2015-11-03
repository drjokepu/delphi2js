import * as scope from './scope';

export const types = {
	assignment: 'assignment',
	binaryOp: 'binary_op',
	block: 'block',
	compoundStatement: 'compound_statement',
	constantDeclaration: 'const_declaration',
	constantDeclarationPart: 'const_declaration_part',
	controlString: 'control_string',
	exceptionHandlerClause: 'exception_handler_clause',
	functionCall: 'function_call',
	functionDeclaration: 'function_declaration',
	functionHeader: 'function_header',
	identifier: 'identifier',
	ifStatement: 'if',
	integerConstant: 'integer_constant',
	parens: 'parens',
	procedureDeclaration: 'procedure_declaration',
	procedureHeader: 'procedure_header',
	procedureStatement: 'procedure_statement',
	program: 'program',
	range: 'range',
	setConstructor: 'set_constructor',
	stringConstant: 'string_constant',
	tryExcept: 'try_except',
	tryFinally: 'try_finally',
	unit: 'unit',
	valueParameter: 'value_parameter',
	variableDeclaration: 'variable_declaration',
	variableDeclarationPart: 'variable_declaration_part'
};

export type PasFile = Program | Unit;

export interface Node {
	type: string;
	scope?: scope.Scope;
}

export interface Comment extends Node {
	content: string;
}

export interface Program extends Node {
	header: ProgramHeader,
	uses: UsesClause,
	body: Block,
	comments: ProgramComments
}

export interface Unit extends Node {
	header: UnitHeader;
	interfacePart: InterfacePart;
	implementationPart: ImplementationPart;
}

export interface ProgramComments {
	pre: Comment;
	uses: Comment;
	end: Comment;
	post: Comment;
}

export interface ProgramHeader extends Node {
	identifier: Identifier
}

export interface UnitComments {
	pre: Comment;
	interface: Comment;
	implementation: Comment;
	end: Comment;
	post: Comment;
}

export interface UnitHeader extends Node {
	
}

export interface InterfacePart extends Node {
	uses: UsesClause;
	declarations: Declaration[];
}

export interface ImplementationPart extends Node {
	uses: UsesClause;
	declarations: Declaration[];
}

export interface UsesClause extends Node {
	
}

export type Declaration = 
	VariableDeclaration |
	VariableDeclarationPart |
	ConstantDeclaration |
	ConstantDeclarationPart |
	ProcedureFunctionDeclaration;

export interface VariableDeclarationPart extends Node {
	list: VariableDeclaration[];
}

export interface VariableDeclaration extends Node {
	identifiers: Identifier[];
	variableType: Type;
	expression: Expression;
}

export interface ConstantDeclarationPart extends Node {
	list: ConstantDeclaration[];
}

export interface ConstantDeclaration extends Node {
	identifier: Identifier;
	value: Expression;
}

export interface ProcedureFunctionDeclaration extends Node {
	identifier: Identifier;
	params: ParameterDeclaration[];
	block: Block;
}

export interface ProcedureDeclaration extends ProcedureFunctionDeclaration {
}

export interface FunctionDeclaration extends ProcedureFunctionDeclaration {
	returnType: Type;
}

export type ParameterDeclaration = ValueParameter;

export interface ValueParameter extends Node {
	identifiers: Identifier[];
	paramType: Type;
}

export type Type = InbuiltType | TypeIdentifier;

export interface InbuiltType extends Node {
	typeName: string;
}

export interface TypeIdentifier extends Node {
	typeName: Identifier;
}

export interface Identifier extends Node {
	value: string;
}

export interface Block extends Node {
	declarations: Declaration[],
	statements: CompoundStatement
}

export type Statement = SimpleStatement | StructuredStatement;
export type SimpleStatement = Assignment | ProcedureStatement;
export type StructuredStatement = CompoundStatement | ConditionalStatement | TryStatement;

export interface Assignment extends Node {
	identifier: Identifier;
	target: AssignmentTarget;
	operator: string;
	expression: Expression;
}

export type AssignmentTarget = VariableReference;
export type VariableReference = Identifier;

export interface ProcedureStatement extends Node {
	target: ProcedureStatementTarget;
	params: Expression[];
}

export type ProcedureStatementTarget = Identifier;

export interface CompoundStatement extends Node {
	list: Statement[];
}

export type ConditionalStatement = IfStatement;

export interface IfStatement extends Node {
	condition: Expression;
	trueBranch: Statement;
	falseBranch: Statement;
}

export type TryStatement = TryExceptStatement | TryFinallyStatement;

export interface TryExceptStatement extends Node {
	body: Statement[];
	handlers: ExceptionHandlers;
}

export type ExceptionHandlers = Statement[] | ExceptionHandlerClause;

export interface ExceptionHandlerClause extends Node {
	
}

export interface TryFinallyStatement extends Node {
	body: Statement[];
	fin: Statement[];
}

export type Expression = Constant | Parens | BinaryOp | FunctionCall | SetConstructor;
export type Constant = StringConstant | ControlString | IntegerConstant;

export interface StringConstant extends Node {
	value: string;
}

export interface ControlString extends Node {
	value: Number;
}

export interface IntegerConstant extends Node {
	value: Number;
}

export interface Parens extends Node {
	expression: Expression;
}

export interface BinaryOp extends Node {
	op: string;
	left: Expression;
	right: Expression;
}

export interface FunctionCall extends Node {
	target: FunctionCallTarget;
	params: Expression[];
}

export type FunctionCallTarget = Identifier;

export interface SetConstructor extends Node {
	list: SetGroup[];
}

export type SetGroup = Expression | Range;

export interface Range extends Node {
	start: Expression;
	end: Expression;
}
