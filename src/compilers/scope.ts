export interface Identifiers {
	[name: string]: IdentifierType;
}

export enum IdentifierType {
	Constant = 1,
	Variable = 2,
	Procedure = 3,
	Function = 4
}

export class Scope {
	identifiers: Identifiers;
	parent: Scope;
	
	constructor(parent?: Scope) {
		this.identifiers = {};
		this.parent = parent ? parent : null;
	}
	
	addIdentifier(name: string, type: IdentifierType) {
		this.identifiers[name] = type;
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
	
	canInvoke(name: string): boolean {
		const type = this.identifierType(name);
		if (type) {
			return Scope.canInvokeIdentifierType(type);
		} else {
			return true;
		}
	}
	
	static canInvokeIdentifierType(type: IdentifierType): boolean {
		return type === IdentifierType.Procedure || type === IdentifierType.Function;
	}
}