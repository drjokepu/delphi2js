export interface Identifiers {
	[name: string]: IdentifierType;
}

export enum IdentifierType {
	Constant,
	Variable,
	Procedure,
	Function
}

export class Scope {
	identifiers: Identifiers;
	parent: Scope;
	
	constructor(parent?: Scope) {
		this.identifiers = {};
		this.parent = parent ? parent : null;
	}
	
	identifierType(name: string): IdentifierType {
		const type = this.identifiers[name];
		if (type) {
			return type;
		} else {
			if (this.parent) {
				return this.parent.identifierType(name);
			} else {
				return null;
			}
		}
	}
}