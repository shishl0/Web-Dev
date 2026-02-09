//task What is the last value alerted by this code? Why?
let i1 = 3;
while (i1) {
  alert(i1--);
}

//task Which values does the while loop show?
let i2 = 0;
while (++i < 5) alert(i2); //5

let i3 = 0;
while (i++ < 5) alert(i3); //5

//task Which values get shown by the "for" loop?
for (let i = 0; i < 5; i++) alert(i); //from 0 to 4

for (let i = 0; i < 5; ++i) alert(i); //from 0 to 4

//task Output even numbers in the loop
for (let i = 2; i <= 10; i++) {
  if (i % 2 == 0) {
    alert(i);
  }
}

//task Replace "for" with "while"
let i = 0;
while (i < 3) {
  alert(`number ${i}!`);
  i++;
}

//task Repeat until the input is correct
let num;
do {
  num = prompt("Enter a number greater than 100?", 0);
} while (num <= 100 && num);

//task Output prime numbers
let n = 10;
nextPrime: for (let i = 2; i <= n; i++) {
  for (let j = 2; j < i; j++) {
    if (i % j == 0) continue nextPrime;
  }
  alert(i);
}
