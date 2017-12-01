'use strict';

const Action = require('./action');
const Cardinality = require('./cardinality');
const matcher = require('./matcher');
const _ = require('lodash');

function forceCardinality(min, max) {
  if(this.cardinalityForced) {
    throw new Error('Cardinality already set for the expectation');
  } else {
    this.cardinalityForced = true;
    this.cardinality.set(min, max);
  }
}

function tryUpdateCardinality(count) {
  if(!this.cardinalityForced) {
    if(this.actions.length === 0) {
      if(this.count >= 0) {
        this.cardinality.set(count, count);
      } else {
        this.cardinality.set(1, -1);
      }
    } else if (count >= 0) {
      this.cardinality.bump(count);
    } else {
      this.cardinality.bump(1);
      this.cardinality.unbound();
    }
  }
}

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
    this.cardinality = new Cardinality(1);
    this.cardinalityForced = false;
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
    return this.cardinality.validate();
    // if(this.actions.length === 0) {
    //   return this.cardinality.validate();
    // }
    // return (_.findIndex(this.actions, a => !a.validate()) < 0);
  }

  times(count) {
    return forceCardinality.call(this, count, count);
  }

  atLeast(count) {
    return forceCardinality.call(this, count, -1);
  }

  atMost(count) {
    return forceCardinality.call(this, 1, count);
  }

  between(min, max) {
    return forceCardinality.call(this, min, max);
  }

  /**
   * @param {Array} args 
   * @returns {*} 
   * If no action was specified for the expectation, will return no value.
   * If there is an action to be executed returns result of that execution. 
   * @throws {Error} 
   * Throws error if none of specified actions are valid for execution
   */
  execute(args) {
    if(!this.cardinality.use()) {
      throw new Error('Expectation oversaturated');
    }
    if(this.actions.length === 0) {
      return;
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
   * expectation action list. Newly created Action has expected
   * execution count set to 1.
   * 
   * @param {*} action 
   * Parameter passed for Action constructor
   * @returns {Expectation}
   * Returns current instance of the expectation for chaining.
   */
  willOnce(action) {
    tryUpdateCardinality.call(this, 1);
    this.actions.push(new Action(this, action, 1));
    return this;
  }

  /** Adds a new action from provided arguments and adds it to
   * expectation action list. Newly created Action has expected
   * execution count set to 2.
   * 
   * @param {*} action 
   * Parameter passed for Action constructor
   * @returns {Expectation}
   * Returns current instance of the expectation for chaining.
   */
  willTwice(action) {
    tryUpdateCardinality.call(this, 2);
    this.actions.push(new Action(this, action, 2));
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
    tryUpdateCardinality.call(this, -1);
    this.actions.push(new Action(this, action, -1));
    return this;
  }
}

module.exports = Expectation;