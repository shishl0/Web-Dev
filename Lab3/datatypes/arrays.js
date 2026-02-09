//TASK1
let fruits = ["Apples", "Pear", "Orange"];

//TASK2
let shoppingCart = fruits;
shoppingCart.push("Banana");

//TASK3
alert(fruits.length);

//TASK4
let styles = ["Jazz", "Blues"];
styles.push("Rock-n-Roll");
styles[Math.floor((styles.length - 1) / 2)] = "Classics";
alert(styles.shift());
styles.unshift("Rap", "Reggae");

//TASK5
let arr = ["a", "b"];
arr.push(function () {
  alert(this);
});
arr[2]();

//TASK6
function sumInput() {
  let numbers = [];
  while (true) {
    let value = prompt("A number please?", 0);
    if (value === "" || value === null || !isFinite(value)) break;
    numbers.push(+value);
  }
  let sum = 0;
  for (let number of numbers) {
    sum += number;
  }
  return sum;
}
alert(sumInput());

//TASK6
function getMaxSubSum(arr) {
  let maxSum = 0;
  let partialSum = 0;
  for (let item of arr) {
    partialSum += item;
    maxSum = Math.max(maxSum, partialSum);
    if (partialSum < 0) partialSum = 0;
  }
  return maxSum;
}
alert(getMaxSubSum([-1, 2, 3, -9]));
alert(getMaxSubSum([-1, 2, 3, -9, 11]));
alert(getMaxSubSum([-2, -1, 1, 2]));
alert(getMaxSubSum([100, -9, 2, -3, 5]));
alert(getMaxSubSum([1, 2, 3]));
alert(getMaxSubSum([-1, -2, -3]));
