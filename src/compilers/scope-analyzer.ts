import * as ast from './ast';
import * as context from './context';
import * as scope from './scope';

export function canInvoke(node: ast.CallTarget, ctx: context.Context): boolean {
    switch (node.type) {
        case ast.types.identifier:
            return canInvokeIdentifier(<ast.Identifier>node, ctx);
        default:
            throw new Error('Unknown call target node type: ' + node.type);
    }
}

function canInvokeIdentifier(node: ast.Identifier, ctx: context.Context): boolean {
    return ctx.getScope().canInvoke(node.value);
}

export function attachScope(node: ast.PasFile): void {
    switch (node.type) {
        case ast.types.program:
            throw new Error('Not implemented: ' + node.type);
        case ast.types.unit:
            attachScopeToUnit(<ast.Unit>node);
            break;
        default:
            throw new Error('Unexpected file AST node: ' + node.type);
    }
}
	
function attachScopeToUnit(node: ast.Unit): void {
    let s = new scope.Scope(); 
    
    if (node.interfacePart && node.interfacePart.declarations) {
        addDeclarationListToScope(node.interfacePart.declarations, s);
    }
    
    if (node.implementationPart && node.implementationPart.declarations) {
        addDeclarationListToScope(node.implementationPart.declarations, s);
    } 
}

function addDeclarationListToScope(declarations: ast.Declaration[], s: scope.Scope): void {
    if (!declarations) {
        return;
    }
    
    for (let decl of declarations) {
        addDeclarationToScope(decl, s);
    }
}

function addDeclarationToScope(node: ast.Declaration, s: scope.Scope): void {
    switch (node.type) {
        case ast.types.variableDeclaration:
            addVariableDeclarationToScope(<ast.VariableDeclaration>node, s);
            break;
        case ast.types.variableDeclarationPart:
            addVariableDeclarationPartToScope(<ast.VariableDeclarationPart>node, s);
            break;
        case ast.types.constantDeclaration:
            addConstantDeclarationToScope(<ast.ConstantDeclaration>node, s);
            break;
        case ast.types.constantDeclarationPart:
            addConstantDeclarationPartToScope(<ast.ConstantDeclarationPart>node, s);
            break;
        case ast.types.functionHeader:
            addFunctionHeaderToScope(<ast.FunctionHeader>node, s);
            break;
        case ast.types.procedureHeader:
            addProcedureHeaderToScope(<ast.ProcedureHeader>node, s);
            break;
        case ast.types.functionDeclaration:
            addFunctionDeclarationToScope(<ast.FunctionDeclaration>node, s);
            break;
        case ast.types.procedureDeclaration:
            addProcedureDeclarationToScope(<ast.ProcedureDeclaration>node, s);
            break;
        default:
            throw new Error('Unknown declaration node type: ' + node.type);
    }
}

function addFunctionHeaderToScope(node: ast.FunctionHeader, s: scope.Scope): void {
    s.addIdentifier(node.identifier.value, scope.IdentifierType.Function);
}

function addProcedureHeaderToScope(node: ast.ProcedureHeader, s: scope.Scope): void {
    s.addIdentifier(node.identifier.value, scope.IdentifierType.Procedure);
}

function addFunctionDeclarationToScope(node: ast.FunctionDeclaration, s: scope.Scope): void {
    s.addIdentifier(node.identifier.value, scope.IdentifierType.Function);
    attachScopeToBlock(node, s);
}

function addProcedureDeclarationToScope(node: ast.ProcedureDeclaration, s: scope.Scope): void {
    s.addIdentifier(node.identifier.value, scope.IdentifierType.Procedure);
    attachScopeToBlock(node, s);
}

function attachScopeToBlock(node: ast.ProcedureFunctionDeclaration, parentScope: scope.Scope): void {
    let blockScope = new scope.Scope(parentScope);
    if (node.block && node.block.declarations) {
        addDeclarationListToScope(node.block.declarations, blockScope);
    }
    node.scope = blockScope;
}

function addConstantDeclarationToScope(node: ast.ConstantDeclaration, s: scope.Scope): void {
    s.addIdentifier(node.identifier.value, scope.IdentifierType.Constant);
}

function addConstantDeclarationPartToScope(node: ast.ConstantDeclarationPart, s: scope.Scope): void {
    for (let decl of node.list) {
        addConstantDeclarationToScope(decl, s);
    }
}

function addVariableDeclarationToScope(node: ast.VariableDeclaration, s: scope.Scope): void {
    for (let identifier of node.identifiers) {
        s.addIdentifier(identifier.value, scope.IdentifierType.Variable);
    }
}

function addVariableDeclarationPartToScope(node: ast.VariableDeclarationPart, s: scope.Scope): void {
    for (let decl of node.list) {
        addVariableDeclarationToScope(decl, s);
    }
}