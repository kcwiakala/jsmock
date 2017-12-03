'use strict';

const _ = require('lodash');
const check = require('./check'); 

/** Class specifying action to be executed on mocked function calls.
 */
class Action {

  /** @constructor
   *  
   * @param {Any} action 
   * If provided action is a function it will be executed with arguments provided to
   * execute method. Parameter of any other type will produce action returning it
   * upon execution.
   * @param {Number} counter 
   * Expected number of action execution times. Negative value will create action
   * that can be executed any number of times.
   * 
   * @throws {TypeErrpr}
   * TypeError is thrown if specified number is defined and its type is not a Number.
   * @throws {Error}
   * Error is thrown if provided counter value is 0. This value is reserved 
   * and can't be used for initializing actions.
   */
  constructor(action, counter) {
    if(typeof action !== 'function') {
      this.action = () => action;
    } else {
      this.action = action;
    }
    this.setCounter((typeof counter === 'undefined') ? 1 : counter);
  }

  /**
   * 
   * @param {Number} counter 
   * @throws {TypeError}
   */
  setCounter(counter) {
    check.type(counter, 'number', 'Action counter should be a valid number');
    this.counter = parseInt(counter);
    check.assert(this.counter !== 0, 'Can\'t create action with 0 expected execution times');
  }

  /** Determines if action has been executed expected number of times.
   * 
   * @returns {Boolean}
   */
  validate() {
    return this.counter <= 0;
  }

  /** Determines if action can be executed.
   *  
   * @returns {Boolean}
   * Returns true if action can be executed, false otherwise.
   */
  available() {
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
    check.assert(this.counter !== 0, 'Calling execute on already saturated action');
    this.counter -= 1;
    return this.action.apply(null, args);
  }
}

module.exports = Action;