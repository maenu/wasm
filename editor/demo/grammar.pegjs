{
class Node {
		constructor() {
        	this.name = "Abstract Node";
            this.data = [];
			this.children = [];
		}
	}
    
class Module extends Node {
    	constructor(main,func) {
        	super();
            this.name = "Module";
            this.children = [main,func];
		}
    visit() {
    	return visit.visitModule(this);
    }
    }

class DefineMain extends Node {
    	constructor(exp) {
        	super();
            this.name = "Define Main";
            this.children = [exp];
		}
    visit() {
    	return visit.visitDefineMain(this);
    }
	}

class DefineFunction extends Node {
    	constructor(name,para,exp) {
        	super();
            this.name = "Define Function";
            this.children = [para,exp];
            this.data = [name];
		}
    visit() {
    	return visit.visitDefineFunction(this);
    }
	}
    
class Expression extends Node {
    	constructor(exp) {
        	super();
            this.name = "Expression";
            this.children = [exp];
        }
       visit() {
    	return visit.visitExpression(this);
    }
	}
    
class If extends Node {
    	constructor(bool,exp,elseexp) {
        	super();
            this.name = "If";
            this.children = [bool,exp,elseexp];
        }
        visit() {
    	return visit.visitIf(this);
    }
	}
    
    	class While extends Node {
    		constructor(bool,exp) {
        		super();
            		this.name = "While";
            		this.children = [bool,exp];
        	}
          visit() {
    	return visit.visitWhile(this);
    }
	}
    
    	class Bool extends Node {
    		constructor(head,op,tail) {
        		super();
           		this.name = "Bool";
            		this.children = [head,tail];
            		this.data = [op];
        	}
          visit() {
    	return visit.visitBool(this);
    }
	}


	class CallFunction extends Node {
    		constructor(name,para) {
        		super();
            		this.name = "Call Function";
			this.children = [para];
            		this.data = [name];
        	}
          visit() {
    	return visit.visitCallFunction(this);
    }
	}

    	class CallParameter extends Node {
    		constructor(para) {
        		super();
            		this.name = "Call Parameter";
            		this.children = [para];
        	}
          visit() {
    	return visit.visitCallParameter(this);
    }
	}

	class Define extends Node {
    		constructor(char) {
        		super();
            		this.name = "Define";
            		this.data = [char];
        	}
          visit() {
    	return visit.visitDefine(this);
    }
	}

	class Assign extends Node {
    		constructor(char, exp) {
        		super();
            		this.name = "Assign";
            		this.children = [exp];
            		this.data = [char];
        	}
          visit() {
    	return visit.visitAssign(this);
    }
	}

	class Math extends Node {
    		constructor(head,op,tail) {
        		super();
            		this.name = "Math";
            		this.children = [head,tail];
            		this.data = [op];
        	}
          visit() {
    	return visit.visitMath(this);
    }
	}

	class Term extends Node {
    		constructor(head,op,tail) {
        		super();
            		this.name = "Term";
            		this.children = [head,tail];
            		this.data = [op];
        	}
          visit() {
    	return visit.visitTerm(this);
    }
	}

	class Parameter extends Node {
    		constructor(char) {
        		super();
            		this.name = "Parameter";
            		this.data = [char];
        	}
          visit() {
    	return visit.visitParameter(this);
    }
	}

	class Factor extends Node {
    		constructor(exp) {
        		super();
            		this.name = "Factor";
            		this.children = [exp];
        	}
          visit() {
    	return visit.visitFactor(this);
    }
	}

    	class Integer extends Node {
    		constructor(int) {
        		super();
            		this.name = "Integer";
            		this.data = [int];
        	}
          visit() {
    	return visit.visitInteger(this);
    }
	}
    
    	class GetVariable extends Node {
    		constructor(char) {
        		super();
            		this.name = "Get Variable";
            		this.data = [char];
        	}
          visit() {
    	return visit.visitGetVariable(this);
    }
	}

	class Character extends Node {
    		constructor(char) {
        		super();
            		this.name = "Character";
            		this.data = [char];
        	}
          visit() {
    	return visit.visitCharacter(this);
    }
	}

}

Module
  = main:DefineMain func:DefineFunction* 
  {return new Module(main,func);} 
  
DefineMain
  = "def main" _ "{" _ exp:Expression _ "}" Break _ 
  {return new DefineMain(exp);}

DefineFunction
  = "def" name:Character para:( _ "(" Parameter ")" _ )* _ "{" exp:Expression "}" Break 
  {return new DefineFunction(name,para,exp);}

Expression
  = _ exp:((If/While/Define/Assign/Math) Break)+ _ 
  {return new Expression(exp);}

If
  = "if (" bool:Bool ") {" exp:Expression "}" _ "else {" elseexp:Expression "}" 
  {return new If(bool,exp,elseexp);}

While
  = "do {" exp:Expression "}" _ "while" _ "("bool:Bool")" 
  {return new While(bool,exp);}

Bool 
  = head:Math _ op:("=="/"!="/"<="/"<"/">="/">") _ tail:Math
  {return new Bool(head,op,tail);}
  
CallFunction
  = "call" char:Character para:( _ "(" CallParameter ")" _ )* 
  {return new CallFunction(char,para);}

CallParameter
  = para:Math {return new CallParameter(para);}

Define
  = "var" char:Character {return new Define(char);}

Assign
  = char:Character _ "=" _ exp:Math {return new Assign(char,exp);}

Math
  = head:Term tail:(_ ("+" / "-") _ Term)*{
      return tail.reduce(function(result, element) {
        return new Math(result,element[1],element[3]);
	}, head);}

Term
  = head:Factor tail:(_ ("*" / "/") _ Factor)* {
      return tail.reduce(function(result, element) {
        return new Term(result,element[1],element[3]);
      }, head);}
    
Parameter
  = char:Character {return new Parameter(char);}

Factor
  = "(" _ expr:Math _ ")" {return new Factor(expr);}
  / CallFunction / Integer / GetVariable

Integer "integer"
  = _ [0-9]+ {return new Integer(text());}
  
GetVariable
  = char:Character {return new GetVariable(char);}
  
Character "character"
  = _[a-zA-Z]+ {return text().replace(" ","");}

Break "break"
  = [;]_ {return;}

_ "whitespace"
  = [ \t\r\n]*