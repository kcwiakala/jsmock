'use strict';

const Action = require('./action');
const matcher = require('./matcher');
const _ = require('lodash');

/** @class Expectation
 *  
 * Class specifying function call expectation. Each expectation contains
 * matcher and list of actions. 
 * 
 * Matcher specifies if function call argument list is valid.
 * Action list determines what actions should be executed and how many times 
 * on consequetive calls.
 */
class Expectation {

  /**
   * 
   * @param {Array} args 
   */
  constructor(args) {
    this.matcher = matcher.create.apply(null, args);
    this.actions = [];
  }

  /** @method isMatching
   * Checks if given argument list fits the expectation matcher.
   * 
   * @param {Array} args 
   * Array of arguments to be validated
   * @returns {Boolean}
   * Returns result of applying provided arguments to matcher function.
   */
  isMatching(args) {
    return this.matcher.apply(null, args);
  }

  /** @method isSaturated 
   * Determines if there is any more action to be executed
   * for the expectation.
   * @returns {Boolean}
   */
  isSaturated() {
    return _.findIndex(this.actions, a => a.ready()) < 0;
  }

  /** Validates the expectation.
   * @returns {Boolean} 
   * Returns true if none action was specified for the expectation or 
   * if all actions specified are validated, false otherwise.
   */
  validate() {
    if(this.actions.length === 0) {
      return true;
    }
    return (_.findIndex(this.actions, a => !a.validate()) < 0);
  }

  /**
   * @param {Array} args 
   * @returns {*} 
   * Returns true if no action was specified for expectation. If there is 
   * an action to be executed returns result of that execution. 
   * @throws {Error} 
   * Throws error if none of specified actions are valid for execution
   */
  execute(args) {
    if(this.actions.length === 0) {
      return true;
    }
    const idx = _.findIndex(this.actions, a => a.ready());
    if(idx < 0) {
      throw new Error('Unable to find valid action for execution');
    }
    return this.actions[idx].execute(args);
  }

  /** Creates expectation matcher from provided arguments.
   * 
   * @returns {Expectation} 
   * Returns current instance of the expectation for chaining.
   */
  matching(/* ... */) {
    this.matcher = matcher.create.apply(null, arguments);
    return this;
  } 

  /** Adds a new action from provided arguments and adds it to
   * expectation actions list.
   * 
   * @param {*} action 
   * Parameter passed for Action constructor
   * @returns {Action} 
   * Returns newly created Action object for chaining.
   */
  will(action) {
    const act = new Action(this, action);
    this.actions.push(act);
    return act;
  }

  /** Adds a new action from provided arguments and adds it to
   * expectation action list. Newly created Action has expected
   * execution count set to 1.
   * 
   * @param {*} action 
   * Parameter passed for Action constructor
   * @returns {Expectation}
   * Returns current instance of the expectation for chaining.
   */
  willOnce(action) {
    this.actions.push(new Action(this, action, 1));
    return this;
  }

  /** Adds a new action from provided arguments and adds it to
   * expectation action list. Newly created Action has unbounded
   * execution count.
   * 
   * @param {*} action 
   * Parameter passed for Action constructor
   * @returns {Expectation}
   * Returns current instance of the expectation for chaining.
   */
  willRepeatedly(action) {
    this.actions.push(new Action(this, action, -1));
    return this;
  }
}

module.exports = Expectation;