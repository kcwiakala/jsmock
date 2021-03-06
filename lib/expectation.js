'use strict';

const Action = require('./action');
const Invoker = require('./invoker');
const Cardinality = require('./cardinality');
const { Matcher, WeakMatcher } = require('./matcher');
const check = require('./check'); 
const _ = require('lodash');

function forceCardinality(min, max) {
  check.assert(this.actions.length === 0, 'Cardinality should be specified before actions');
  check.assert(!this.cardinalityForced, 'Cardinality already set for the expectation');
  this.cardinalityForced = true;
  this.cardinality.set(min, max);
  return this;
}

function tryUpdateCardinality(count) {
  if(!this.cardinalityForced) {
    if(this.actions.length === 0) {
      if(count >= 0) {
        this.cardinality.set(count, count);
      } else {
        this.cardinality.set(1,-1);
        this.cardinality.unbound();
      }
    } else if (count >= 0) {
      this.cardinality.bump(count);
    } else {
      this.cardinality.bump(1);
      this.cardinality.unbound();
    }
  }
}

function setMatcher(matcher) {
  check.assert(!this.matcherForced, 'Matcher already specified for the expectation');
  check.assert(!this.cardinalityForced, 'Matcher must be specified before cardinality');
  check.assert(this.actions.length === 0, 'Matcher must be specified before actions');
  this.matcherForced = true;
  this.matcher = matcher;
  return this;
}

function addAction(action) {
  check.assert(!this.actionsFinalized, 'Action list already finalized for expectation');
  this.actions.push(action);
}

/** Class specifying function call expectation. 
 * Each expectation contains a [matcher]{@link Matcher}, 
 * [cardinality]{@link Cardinality} and a list of 
 * [actions]{@link Action} to be executed.
 */
class Expectation {
  /** @constructor
   * 
   * @param {Array} args
   * Array of arguments to be used for creation of matcher object
   */
  constructor(args) {
    this.matcher = new Matcher(args);
    this.actions = [];
    this.cardinality = new Cardinality(1);
    this.cardinalityForced = false;
    this.matcherForced = args && (args.length > 0);
    this.actionsFinalized = false;
  }

  /** Checks if given argument list fits the expectation matcher.
   * 
   * @param {Array} args 
   * Array of arguments to be validated
   * @returns {Boolean}
   * Returns result of applying provided arguments to matcher function.
   */
  isMatching(args) {
    return this.matcher.check(args);
  }

  /** Determines if expectation has been already executed maximum 
   * expected number of times.
   * @returns {Boolean}
   */
  isSaturated() {
    return !this.cardinality.available();
  }

  /** Validates the expectation.
   * @returns {Boolean} 
   * Returns true if expectation cardinality is fulfilled, false otherwise.
   */
  validate() {
    return this.cardinality.validate();
  }

  /** Specifies expectation cardinality to given number of expected calls.
   *  
   * @param {Number} count
   * Expected number of calls 
   * @returns {Expectation} 
   * Returns current instance of the expectation for chaining.
   */
  times(count) {
    return forceCardinality.call(this, count, count);
  }

  /** Specifies number of expectation matching calls to be equal or greater
   * of given number.
   * 
   * @param {Number} count 
   * Minimal number of expected matching calls.
   * @returns {Expectation} 
   * Returns current instance of the expectation for chaining.
   */
  atLeast(count) {
    return forceCardinality.call(this, count, -1);
  }

  /** Specifies number of expectation matching calls to be at least 1, 
   * but not greater than given number.
   * 
   * @param {Number} count 
   * Maximal number of expected matching calls.
   * @returns {Expectation} 
   * Returns current instance of the expectation for chaining.
   */
  atMost(count) {
    return forceCardinality.call(this, 1, count);
  }

  /** Specifies number of expectation matching calls to lie in given range.
   * 
   * @param {Number} min 
   * Minimal number of expected matching calls.
   * @param {Number} max 
   * Maximal number of expected matching calls.
   * @returns {Expectation} 
   * Returns current instance of the expectation for chaining.
   */
  between(min, max) {
    return forceCardinality.call(this, min, max);
  }

  /** Creates expectation matcher from provided arguments.
   * 
   * @returns {Expectation} 
   * Returns current instance of the expectation for chaining.
   */
  matching(/* ... */) {
    return setMatcher.call(this, new Matcher(Array.from(arguments)));
  }

  /** Alias of matching method 
   * 
   * @returns {Expectation} 
   * Returns current instance of the expectation for chaining.
   */
  with(/* ... */) {
    return setMatcher.call(this, new Matcher(Array.from(arguments)));
  }

  /** Creates weak expectation matcher from given arguments. Weak matcher
   * will yield match if at least n first specified arguments match. Actual
   * call can contain more arguments.
   * 
   * @returns {Expectation} 
   * Returns current instance of the expectation for chaining.
   */
  matchingAtLeast(/* ... */) {
    return setMatcher.call(this, new WeakMatcher(Array.from(arguments)));
  }

  /** Alias of matchingAtLeast 
   * 
   * @returns {Expectation} 
   * Returns current instance of the expectation for chaining.
   */
  withAtLeast(/* ... */) {
    return setMatcher.call(this, new WeakMatcher(Array.from(arguments)));
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
    addAction.call(this, new Action(action, 1));
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
    addAction.call(this, new Action(action, 2));
    return this;
  }

  /** Adds a new action from provided arguments and adds it to
   * expectation action list. Newly created Action has unbounded
   * execution count.
   * 
   * @param {*} action 
   * Parameter passed for Action constructor
   */
  willRepeatedly(action) {
    tryUpdateCardinality.call(this, -1);
    addAction.call(this, new Action(action, -1));
    this.actionsFinalized = true;
  }

  /** Adds a new invoker action, that will call callback passed
   * on execution time with given arguments. Newly created Invoker
   * has expected execution count set to 1.
   * 
   * @returns {Expectation}
   * Returns current instance of the expectation for chaining.
   */
  willOnceInvoke(/* ... */) {
    tryUpdateCardinality.call(this, 1);
    addAction.call(this, new Invoker(Array.from(arguments), 1));
    return this;
  }

  /** Adds a new invoker action, that will call callback passed
   * on execution time with given arguments. Newly created Invoker
   * has expected execution count set to 2.
   * 
   * @returns {Expectation}
   * Returns current instance of the expectation for chaining.
   */
  willTwiceInvoke(action) {
    tryUpdateCardinality.call(this, 2);
    addAction.call(this, new Invoker(Array.from(arguments), 2));
    return this;
  }

  /** Adds a new invoker action, that will call callback passed
   * on execution time with given arguments. Newly created Invoker
   * has unbounded execution time.
   */
  willRepeatedlyInvoke(action) {
    tryUpdateCardinality.call(this, -1);
    addAction.call(this, new Invoker(Array.from(arguments), -1));
    this.actionsFinalized = true;
  }

  /** Executes first pending action with given arguments. 
   * 
   * @param {Array} args 
   * @returns {*} 
   * If no action was specified for the expectation, will return no value.
   * If there is an action to be executed returns result of that execution. 
   * @throws {Error} 
   * Throws error if none of specified actions are valid for execution
   */
  execute(args) {
    check.assert(this.cardinality.use(), 'Expectation oversaturated');
    if(this.actions.length === 0) {
      return;
    }
    const idx = _.findIndex(this.actions, a => a.available());
    check.assert(idx >= 0, 'Unable to find valid action for execution');
    return this.actions[idx].execute(args);
  }
}

module.exports = Expectation;