# Some thoughts on syntax of project language

## List of operators

#### Arithmetics

* +,-,*,/ : binary operators, can be nested with brackets. Return the value of the operation.

#### Functions

* def $ (@) {*exp*}; : defines a function with name $ and parameters @, returns the value of the expressions *exp*. The first function declared has to be called main and doesn't accept parameters. Other functions can have 0 or multiple parameters.
* call $ (*exp*) : calls function with name $ and parameters (can be expressions). Returns the value of called function.

#### Variables 

* var $ : declare variable with name *$*. No return value.
* $ = *exp* : assign a value from an expression *exp* to variable with name $. No return value.

#### Booleans

Can only be used in control instructions.

* *a == b* : returns 1 if a = b, 0 otherwise.
* *a >= b* : returns 1 if a >= b, 0 otherwise.
* *a <= b* : returns 1 if a <= b, 0 otherwise.
* *a > b* : returns 1 if a > b, 0 otherwise.
* *a < b* : returns 1 if a < b, 0 otherwise.

#### Control Structures

* if (*bool*) {*exp1*} else {*exp2*}; : Calls expressions *exp1* if *bool* is 1, *exp2* otherwise. No return value.
* do {*exp*} while (*bool*); : Calls expressions *exp*, then if *bool* is 1, restarts *exp*. No return value. 

### Iteration 1

Simple arithmetics can now be compiled to Webassembly, e.g.

```
Input:
2*3+(1+2)/3

Output:
7
```

You will automatically get this evaluated.

### Iteration 2

We will need to assign some values to variables. All variables will be defined as float64 variables to ensure compatibility, e.g.

```
Input:
var x;
x = 3;
x + 2;

Output:
5
```

### Iteration 3

The next step will be functions that need to be declared. The main function is the one which will be exported and called from outside. It has to be declared first, e.g.

```
Input:
def main{
call add(3)(2);
};
def add(x)(y){
x+y;
};

Output:
5
```

### Iteration 4

Control Instructions like *if* or *while* are added. For ifs and whiles to work, there also need to be compare instructions.

Furthermore, every *if* needs an *else*. *Elseif* can be created by nesting an *if* in an *else*. *do {...} while* go through the loop at least once and then checks for validity. The boolean can be checked in the beginning by nesting the *while* loop in an *if*. *if* and *while* don't return values, they only allow assigns (and other *if*s and *while*s). It is imperative, that after a *if/while* the assigned value is called. 

```
Input:
def main {
var x;
x = call foo(4)(1);
call bar(x);
};
def foo(x)(y) {
if (x < y) {x = x+y;} 
else {x = x-y;};
x;
};
def bar(x){
do {
x = x*10;
} while (x < 100);
x-1;
};

Output:
299
``` 
