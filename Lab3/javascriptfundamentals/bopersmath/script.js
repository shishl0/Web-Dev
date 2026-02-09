// task What are the final values of all variables a, b, c and d after the code below?
let a1 = 1,
  b1 = 1;
let c = ++a1;
let d = b1++;

// task What are the values of a and x after the code below?
let a2 = 2;
let x = 1 + (a2 *= 2);

// task What are results of these expressions?
"" + 1 + 0;
"" - 1 + 0;
true + false;
6 / "3";
"2" * "3";
4 + 5 + "px";
"$" + 4 + 5;
"4" - 2;
"4px" - 2;
"  -9  " + 5;
"  -9  " - 5;
null + 1;
undefined + 1;
" \t \n" - 2;

// task Why? Fix it. The result should be 3.
let a4 = +prompt("First number?", 1);
let b4 = +prompt("Second number?", 2);
alert(a4 + b4);
