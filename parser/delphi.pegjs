{
	function flattenComment(content) {
		if (!content) {
			return '';
		}
	
		return content.map(function (token) {
			if (token.constructor.name === 'Array') {
				return token.join('');
			} else {
				return token;
			}
		}).join('');
	}
	
	function flattenWhitespace(content) {
		if (!content) {
			return null;
		}
		
		if (content.constructor.name === 'Array') {
			 var filtered = content.map(function(element) {
			 	return flattenWhitespace(element);
			 }).filter(function (element) {
			 	return !!element;
			 });
			 
			 if (filtered.length === 0) {
			 	return null;
			 } else {
			 	return filtered;
			 }
		} else {
			return content;
		}
	}
}

start
	= pas
	
pas
	= program
	/ unit
	
_
	= content:__? { return flattenWhitespace(content); }

__
	= whitespace tail:_? { return flattenWhitespace(tail); }
	/ comment _?

whitespace
	= [ \t\n\r]+ { return null; }

comment
	= "(*" content:( [^*] / ("*" [^)]) )* "*)" { return { type: "comment", content: flattenComment(content) }; }
	/ "{" content:[^}]* "}" { return { type: "comment", content: content ? content.join("") : "" }; }
	
identifier
	= !keyword head:[a-zA-Z_] tail:[0-0a-zA-Z_]* { return { type: "identifier", value: tail ? head + tail.join("") : head }; }
	
identifier_list
	= head:identifier _ "," _ tail:identifier_list { return [head].concat(tail); }
	/ identifier:identifier { return [identifier]; }
	
keyword
	= turbo_pascal_keyword
	/ object_pascal_keyword

turbo_pascal_keyword
	= "and"
	/ "array"
	/ "begin"
	/ "const"
	/ "end"
	/ "else"
	/ "function"
	/ "if"
	/ "implementation"
	/ "interface"
	/ "label"
	/ "of"
	/ "or"
	/ "procedure"
	/ "program"
	/ "shl"
	/ "shr"
	/ "string"
	/ "then"
	/ "type"
	/ "unit"
	/ "uses"
	/ "var"
	
object_pascal_keyword	
	= "as"
	/ "class"
	/ "except"
	/ "finally"
	/ "raise"
	/ "try"

exp_binary_operator
	= "*"
	/ "<="
	/ ">"
	/ ">="
	/ "="
	/ "<>"
	/ "in"
	/ "is"
	
term_binary_operator
	= "+"
	/ "-"
	/ "or"
	/ "xor"
	
factor_binary_operator
	= "*"
	/ "/"
	/ "div"
	/ "mod"
	/ "and"
	/ "shl"
	/ "shr"
	/ "as"
	
assignment_operator
	= ":="
	/ "+="
	/ "-="
	/ "*="
	/ "/="

program
	= c_pre:_ h:program_header uses:(_ uses_clause )? c_body:_ body:block c_end:_ "." c_post:_ {
			return {
				type: "program",
				header: h,
				uses: uses && uses.length > 1 ? uses[1] : null,
				body: body,
				comments: {
					pre: c_pre,
					uses: uses && uses.length > 0 ? uses[0]: null,
					end: c_end,
					post: c_post
				}
			}
	}

unit
	= c_pre:_ h:unit_header c_int:_ int:interface_part c_imp:_ imp:implementation_part c_end0:_ "end" c_end1:_ "." c_post:_ {
			return {
				type: "unit",
				header: h,
				interfacePart: int,
				implementationPart: imp,
				comments: {
					pre: c_pre,
					interface: c_int,
					implementation: c_imp,
					end: [c_end0, c_end1],
					post: c_post
				}
			};
	  }
	  
program_header
	= "program" _ identifier:identifier _ ";" { return { type: "program_header", identifier: identifier }; }
	
unit_header
	= "unit" _ identifier:identifier _ ";" { return { type: "unit_header", identifier: identifier }; }
	
interface_part
	= "interface" _ uses_clause:(uses_clause _)? declarations:(interface_declaration_part_list _)? {
	  		return {
			  type: "interface",
			  uses: uses_clause && uses_clause.length > 0 ? uses_clause[0] : null,
			  declarations: declarations && declarations.length > 0 ? declarations[0] : null,
			};
	  }
	
interface_declaration_part_list
	= head:interface_declaration_part _ tail:interface_declaration_part_list { return [head].concat(tail); }
	/ decl:interface_declaration_part { return [decl]; }

interface_declaration_part
	= constant_declaration_part
	/ procedure_headers_part
	/ variable_declaration_part
	
constant_declaration_part
	= "const" _ list:constant_declaration_list { return { type: "const_declaration_part", list: list }; }
	/ "const" _ { return { type: "const_declaration_part", list: [] }; }

constant_declaration_list
	= head:constant_declaration _ tail:constant_declaration_list { return [head].concat(tail); }
	/ decl:constant_declaration _ { return [decl]; }
	
constant_declaration
	= identifier:identifier _ "=" _ value:expression ";" { return { type: "const_declaration", identifier: identifier, value: value }; }

procedure_headers_part
	= prodecure_header
	/ function_header
	
prodecure_header
	= "procedure" _ identifier:identifier _ params:(formal_parameter_list _)? ";" _ {
			return {
				type: "procedure_header",
				identifier: identifier,
				params: params && params.length > 0 ? params[0] : []
			};
	  }
	
function_header
	= "function" _ identifier:identifier _ params:(formal_parameter_list _)? ":" _ type:type _ ";" _ {
			return {
				type: "function_header",
				identifier: identifier,
				params: params && params.length > 0 ? params[0] : [],
				returnType: type
			};
	  }
	
formal_parameter_list
	= "(" _ list:parameter_declaration_list _ ")" { return list; }
	
parameter_declaration_list
	= head:parameter_declaration _ ";" _ tail:parameter_declaration_list { return [head].concat(tail); }
	/ decl:parameter_declaration { return [decl]; }
	
parameter_declaration
	= value_parameter
	
value_parameter
	= id_list:identifier_list _ ":" _ type:type {
			return {
				type: "value_parameter",
				identifiers: id_list,
				paramType: type
			};
	  }
	
variable_declaration_part
	= "var" _ list:variable_declaration_list { return { type: "variable_declaration_part", list: list }; }
	
variable_declaration_list
	= head:variable_declaration _ tail:variable_declaration_list { return [head].concat(tail); }
	/ decl:variable_declaration { return [decl]; }
	
variable_declaration
	= identifier_list:identifier_list _ ":" _ type:type exp:(_ "=" _ expression)? _ ";" {
			return {
				type: "variable_declaration",
				identifiers: identifier_list,
				variableType: type,
				expression: exp && exp.length > 3 ? exp[3] : null
			};
	}

implementation_part
	= "implementation" _ uses:(uses_clause _)? decl:declaration_part {
			return {
				type: "implementation",
				uses: uses && uses.length > 0 ? uses[0] : null,
				declarations: decl
			};
	  }

uses_clause
	= "uses" _ list:uses_clause_list _ ";" { return { type: "uses_clause", list: list }; }
	
uses_clause_list
	= head:identifier _ "," _ tail:uses_clause_list { return [head].concat(tail); }
	/ identifier:identifier { return [identifier]; }
	
declaration_part
	= declaration_list?
	
declaration_list
	= head:declaration _ tail:declaration_list { return [head].concat(tail); }
	/ decl:declaration { return [decl]; }
	
declaration
	= variable_declaration_part
	/ procedure_function_declaration_part
	
procedure_function_declaration_part
	= procedure_declaration
	/ function_declaration
	
procedure_declaration
	= "procedure" _ id:identifier _ params:(formal_parameter_list _)? ";" _ block:subroutine_block _ ";" {
			return {
				type: "procedure_declaration",
				identifier: id,
				params: params && params.length > 0 ? params[0] : null,
				block: block
			}
	  }
	
function_declaration
	= "function" _ id:identifier _ params:(formal_parameter_list _)? ":" _ type:type _ ";" _ block:subroutine_block _ ";" {
			return {
				type: "function_declaration",
				identifier: id,
				params: params && params.length > 0 ? params[0] : null,
				return_type: type,
				block: block
			}
	  }

subroutine_block
	= block
	
block
	= decl:declaration_part _ st:statement_part { return { type: "block", declarations: decl, statements: st }; }
	
statement_part
	= compound_statement
	
statement_list
	= head:statement _ ";" _ tail:statement_list { return [head].concat(tail); }
	/ st:statement _ ";"? { return [st]; }
	
statement
	= simple_statement
	/ structured_statement
	
simple_statement
	= assignment
	/ procedure_statement

assignment
	= target:assignment_target _ op:assignment_operator _ exp:expression {
			return {
				type: "assignment",
				target: target,
				operator: op,
				expression: exp
			};
		}

assignment_target
	= variable_reference
	
variable_reference
	= identifier
	
procedure_statement
	= target:procedure_statement_target params:(_ actual_parameter_list)? {
			return {
				type: "procedure_statement",
				target: target,
				params: params && params.length > 1 ? params[1] : null
			};
		}

procedure_statement_target
	= identifier	

structured_statement
	= compound_statement
	/ conditional_statement
	/ try_statement
	
compound_statement
	= "begin" _ list:(statement_list _)? "end" {
			return {
				type: "compound_statement",
				list: list && list.length > 0 ? list[0] : null
			};
		}
	
conditional_statement
	= if_statement

if_statement
	= "if" _ exp:expression _ "then" _ true_branch:statement _ "else" _ false_branch:statement {
				return {
					type: "if",
					condition: exp,
					trueBranch: true_branch,
					falseBranch: false_branch
				};
			}
	/ "if" _ exp:expression _ "then" _ true_branch:statement {
				return {
					type: "if",
					condition: exp,
					trueBranch: true_branch
				};
			}
	
try_statement
	= try_except_statement
	/ try_finally_statement
	
try_except_statement
	= "try" _ body:statement_list _ "except" _ hand:(exception_handlers _)? "end" {
			return {
				type: "try_except",
				body: body,
				handlers: hand && hand.length > 0 ? hand[0]: null
			};
		}
	
exception_handlers
	= exception_handler_clause 
	/ statement_list

exception_handler_clause
	= handlers:exception_handler_list els:(_ "else" _ statement_list)? {
			return {
				type: 'exception_handler_clause',
				handlers: handlers,
				otherwise: els && els.length > 3 ? els[3] : null
			};
		}

exception_handler_list
	= head:exception_handler _ ";" _ tail:exception_handler_list { return [head].concat(tail); }
	/ h:exception_handler { return [h]; }
	
exception_handler
	= "on" (_ identifier _ ":" )? _ type _ "do" _ statement
	
try_finally_statement
	= "try" _ body:statement_list _ "finally" _ fin:statement_list _ "end" {
		return {
			type: "try_finally",
			body: body,
			fin: fin
		};
	}

type
	= simple_type
	/ string_type
	/ type_identifier
	
simple_type
	= ordinal_type
	/ real_type

ordinal_type
	= "Integer" { return { type: "inbuilt_type", typeName: "Integer" }; }
	
real_type
	= "Real" { return { type: "inbuilt_type", typeName: "Real" }; }
	
string_type
	= "string" { return { type: "inbuilt_type", typeName: "string" }; }
	
type_identifier
	= "type" _ id:identifier { return { type: "type_identifier", typeName: id }; }
	/ id:identifier { return { type: "type_identifier", typeName: id }; }
	
expression
	= left:simple_expression _ op:exp_binary_operator _ right:simple_expression { return { type: "binary_op", op: op, left: left, right: right }; }
	/ simple_expression

simple_expression
	= term_list
	
term_list
	= left:term _ op:term_binary_operator _ right:term_list { return { type: "binary_op", op: op, left: left, right: right }; }
	/ term
	
term
	= factor_list
	
factor_list
	= left:factor _ op:factor_binary_operator _ right:factor_list { return { type: "binary_op", op: op, left: left, right: right }; }
	/ factor
	
factor
	= "(" _ exp:expression _ ")" { return { type: "parens", expression: exp }; }
	/ function_call
	/ constant
	/ set_constructor
	
constant
	= string_constant
	/ numeric_constant
	
string_constant
	= "'" value:([^'] / "''")* "'" { return { type: "string_constant", value: value ? value.join("") : "" }; }
	/ '#' value:[0-9]+ { return { type: "control_string", value: parseInt(value.join(""), 10) }; }

numeric_constant
	= integer_constant
	
integer_constant
	= value:[0-9]+ { return { type: "integer_constant", value: parseInt(value.join(""), 10) }; }
	
function_call
	= target:function_call_target params:(_ actual_parameter_list)? {
			return {
				type: "function_call",
				target: target,
				params: params && params.length > 1 ? params[1] : null
			};
		}
	
function_call_target
	= identifier
	
actual_parameter_list
	= "(" _ list:actual_parameter_list_expression_list _ ")" { return list; }
	
actual_parameter_list_expression_list
	= head:expression _ "," _ tail:actual_parameter_list_expression_list { return [head].concat(tail); }
	/ exp:expression { return [exp]; }

set_constructor
	= "[" _ list:(set_group_list _)? "]" {
			return {
				type: "set_constructor",
				list: list && list.length > 0 ? list[0] : null
			};
		}
	
set_group_list
	= head:set_group _ "," _ tail:set_group_list { return [head].concat(tail); }
	/ grp:set_group { return [grp]; }
	
set_group
	= start:expression _ '..' _ end:expression { return { type: 'range', start: start, end: end }; }
	/ exp:expression { return exp; };