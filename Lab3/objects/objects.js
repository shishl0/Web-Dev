//task Hello, object
let user = {};
user.name = "John";
user.surname = "Smith";
user.name = "Pete";
delete user.name;

//task Check for emptiness
function isEmpty(obj) {
  for (let key in obj) {
    return false;
  }
  return true;
}

//task Sum object properties
let salaries = {
  John: 100,
  Ann: 160,
  Pete: 130,
};
let sum = 0;
for (let key in salaries) {
  sum += salaries[key];
}
alert(sum);

//task Multiply numeric property values by 2
function multiplyNumeric(obj) {
  for (let key in obj) {
    if (typeof obj[key] == "number") {
      obj[key] *= 2;
    }
  }
}
