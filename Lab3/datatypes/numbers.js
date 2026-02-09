//task1
let a = +prompt("The first number?", "");
let b = +prompt("The second number?", "");
alert(a + b);

//task2
alert((6.35 * 10).toFixed(20));

//task3
function readNumber() {
  let num;
  do {
    num = prompt("Enter a number please?", 0);
  } while (!isFinite(num));
  if (num === null || num === "") return null;
  return +num;
}
alert(`Read: ${readNumber()}`);

//task4

//task5
function random(min, max) {
  return min + Math.random() * (max - min);
}
alert(random(1, 5));
alert(random(1, 5));
alert(random(1, 5));

//task6
function randomInteger(min, max) {
  let rand = min - 0.5 + Math.random() * (max - min + 1);
  return Math.round(rand);
}
alert(randomInteger(1, 3));
