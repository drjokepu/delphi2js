start
	= pas
	
pas
	= unit
	
_
	= __?

__
	= whitespace _?
	/ comment _?

whitespace
	= [ \t\n\r]+

comment
	= "(*" ( [^*] / ("*" [^)]) )* "*)"
	/ "{" [^}]* "}"
	
identifier
	= !keyword [a-zA-Z_][0-0a-zA-Z]*
	
identifier_list
	= identifier _ "," _ identifier_list
	/ identifier
	
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
	
unit
	= _ unit_header _ interface_part _ implementation_part _ "end" _ "." _
	
unit_header
	= "unit" _ identifier _ ";"
	
interface_part
	= "interface" _ (uses_clause _)? (interface_declaration_part_list _)?
	
interface_declaration_part_list
	= interface_declaration_part _ interface_declaration_part_list
	/ interface_declaration_part

interface_declaration_part
	= constant_declaration_part
	/ procedure_headers_part
	/ variable_declaration_part
	
constant_declaration_part
	= "const" _ constant_declaration_list
	/ "const" _

constant_declaration_list
	= constant_declaration _ constant_declaration_list
	/ constant_declaration _
	
constant_declaration
	= identifier _ "=" _ expression ";"

procedure_headers_part
	= prodecure_header
	/ function_header
	
prodecure_header
	= "procedure" _ identifier _ (formal_parameter_list _)? ";" _
	
function_header
	= "function" _ identifier _ (formal_parameter_list _)? ":" _ type _ ";" _
	
formal_parameter_list
	= "(" _ parameter_declaration_list _ ")"
	
parameter_declaration_list
	= parameter_declaration _ ";" _ parameter_declaration_list
	/ parameter_declaration
	
parameter_declaration
	= value_parameter
	
value_parameter
	= identifier_list _ ":" _ type
	
variable_declaration_part
	= "var" _ variable_declaration_list
	
variable_declaration_list
	= variable_declaration _ variable_declaration_list
	/ variable_declaration
	
variable_declaration
	= identifier_list _ ":" _ type (_ "=" _ expression)? _ ";"

implementation_part
	= "implementation" _ (uses_clause _)? declaration_part

uses_clause
	= "uses" _ uses_clause_list _ ";"
	
uses_clause_list
	= identifier _ "," _ uses_clause_list
	/ identifier
	
declaration_part
	= declaration_list?
	
declaration_list
	= declaration _ declaration_list
	/ declaration
	
declaration
	= variable_declaration_part
	/ procedure_function_declaration_part
	
procedure_function_declaration_part
	= procedure_declaration
	/ function_declaration
	
procedure_declaration
	= "procedure" _ identifier _ (formal_parameter_list _)? ";" _ subroutine_block _ ";"
	
function_declaration
	= "function" _ identifier _ (formal_parameter_list _)? ":" _ type _ ";" _ subroutine_block _ ";"

subroutine_block
	= block
	
block
	= declaration_part _ statement_part
	
statement_part
	= compound_statement
	
statement_list
	= statement _ ";" _ statement_list
	/ statement _ ";"
	
statement
	= simple_statement
	/ structured_statement
	
simple_statement
	= assignment
	/ procedure_statement

assignment
	= identifier _ assignment_operator _ expression
	
procedure_statement
	= procedure_statement_target (_ actual_parameter_list)?

procedure_statement_target
	= identifier	

structured_statement
	= compound_statement
	/ conditional_statement
	/ try_statement
	
compound_statement
	= "begin" _ (statement_list _)? "end"
	
conditional_statement
	= if_statement

if_statement
	= "if" _ expression _ "then" _ statement _ "else" _ statement
	/ "if" _ expression _ "then" _ statement
	
try_statement
	= try_except_statement
	/ try_finally_statement
	
try_except_statement
	= "try" _ statement_list _ "except" _ (exception_handlers _)? "end"
	
exception_handlers
	= exception_handler_clause
	/ statement_list

exception_handler_clause
	= exception_handler_list (_ "else" _ statement_list)?

exception_handler_list
	= exception_handler _ ";" _ exception_handler_list
	/ exception_handler
	
exception_handler
	= "on" (_ identifier _ ":" )? _ type _ "do" _ statement
	
try_finally_statement
	= "try" _ statement_list _ "finally" _ statement_list _ "end"

type
	= simple_type
	/ string_type
	/ type_identifier
	
simple_type
	= ordinal_type
	/ real_type

ordinal_type
	= "Integer"
	
real_type
	= "Real"
	
string_type
	= "string"
	
type_identifier
	= "type" _ identifier
	/ identifier
	
expression
	= simple_expression _ exp_binary_operator _ simple_expression
	/ simple_expression

simple_expression
	= term_list
	
term_list
	= term _ term_binary_operator _ term_list
	/ term
	
term
	= factor_list
	
factor_list
	= factor _ factor_binary_operator _ factor_list
	/ factor
	
factor
	= "(" _ expression _ ")"
	/ function_call
	/ constant
	/ set_constructor
	
constant
	= string_constant
	/ numeric_constant
	
string_constant
	= "'" ([^'] / "''")* "'"
	/ '#' [0-9]+

numeric_constant
	= integer_constant
	
integer_constant
	= [0-9]+
	
function_call
	= function_call_target (_ actual_parameter_list)?
	
function_call_target
	= identifier
	
actual_parameter_list
	= "(" _ actual_parameter_list_expression_list _ ")"
	
actual_parameter_list_expression_list
	= expression _ "," _ actual_parameter_list_expression_list
	/ expression

set_constructor
	= "[" _ (set_group_list _)? "]"
	
set_group_list
	= set_group _ "," _ set_group_list
	/ set_group
	
set_group
	= expression _ '..' _ expression
	/ expression