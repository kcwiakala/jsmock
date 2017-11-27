'use strict';

const _ = require('lodash');

// Default action - dummy function
const NO_ACTION = () => {};

/** @class Action
 * 
 */
class Action {

  /** @constructor
   * 
   * @param {Expectation} owner 
   * @param {Any} action 
   * @param {Number} counter 
   * 
   * @throws {TypeErrpr}
   * TypeError is thrown if specified number is defined and its type is not a Number.
   * @throws {Error}
   * Error is thrown if provided counter value is 0. This value is reserved 
   * and can't be used for initializing actions.
   */
  constructor(owner, action, counter) {
    this.owner = owner;
    if(typeof action !== 'function') {
      this.action = () => action;
    } else {
      this.action = action || NO_ACTION;
    }
    this.setCounter((typeof counter === 'undefined') ? 1 : counter);
  }

  /**
   * 
   * @param {Number} counter 
   * @throws {TypeError}
   */
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

  /** Executes current action with provided arguments array.
   * 
   * @param {Array} args 
   * Array of arguments to be passed to the action function.
   * @throws {Error}
   * Throws error if current action was already executed specified
   * number of times.
   */
  execute(args) {
    if(this.counter == 0) {
      throw new Error('Calling execute on already saturated action');
    }
    this.counter -= 1;
    return this.action.apply(null, args);
  }

  /**
   * 
   * @param {Number} count 
   * @returns {Expectation}
   * Returns expectation owning current action for chaining.
   */
  times(count) {
    this.setCounter(count);
    return this.owner;
  }
}

module.exports = Action;