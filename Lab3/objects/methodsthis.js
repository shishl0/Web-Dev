//task What is the result of accessing its ref? Why? Answer: error

//task Create an object calculator with three methods
let calculator = {
  sum() {
    return this.a + this.b;
  },

  mul() {
    return this.a * this.b;
  },

  read() {
    this.a = +prompt("a?", 0);
    this.b = +prompt("b?", 0);
  },
};

calculator.read();
alert(calculator.sum());
alert(calculator.mul());

//task Modify the code of up, down, and showStep to make the calls chainable
let ladder = {
  step: 0,
  up() {
    this.step++;
    return this;
  },
  down() {
    this.step--;
    return this;
  },
  showStep() {
    alert(this.step);
    return this;
  },
};
ladder.up().up().down().showStep().down().showStep();
