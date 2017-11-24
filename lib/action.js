'use strict';

const _ = require('lodash');

const NO_ACTION = () => {};

class Action {
  constructor(owner, action, counter) {
    this.owner = owner;
    this.action = action || NO_ACTION;
    if(typeof this.action !== 'function') {
      throw new TypeError('Provided action should be a valid function');
    }
    this.setCounter((typeof counter === 'undefined') ? 1 : counter);
  }

  setCounter(counter) {
    if(typeof counter !== 'number') {
      throw new TypeError('Action counter should be a valid number');
    }
    this.counter = parseInt(counter);
    if(this.counter === 0) {
      throw new Error('Can\'t create action with 0 expected execution times');
    }
  }

  validate() {
    return this.counter <= 0;
  }

  ready() {
    return this.counter != 0;
  }

  execute(args) {
    if(this.counter == 0) {
      throw new Error('Calling execute on already saturated action');
    }
    this.counter -= 1;
    return this.action.apply(null, args);
  }

  times(count) {
    this.setCounter(count);
    return this.owner;
  }
}

module.exports = Action;