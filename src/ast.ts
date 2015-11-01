export type PasFile = Program | Unit;

export interface Node {
	type: string;
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

export interface UsesClause extends Node {
	
}

export interface Identifier extends Node {
	value: string;
}

export interface Block extends Node {
	declarations: Node[],
	statements: CompoundStatement
}

export type Statement = SimpleStatement | StructuredStatement;
export type SimpleStatement = ProcedureStatement;
export type StructuredStatement = CompoundStatement;

export interface ProcedureStatement extends Node {
	target: ProcedureStatementTarget;
	params: Expression[];
}

export type ProcedureStatementTarget = Identifier;

export interface CompoundStatement extends Node {
	list: Statement[];
}

export type Expression = Constant;
export type Constant = StringConstant;

export interface StringConstant extends Node {
	value: string;
}
