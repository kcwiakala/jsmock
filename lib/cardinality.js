'use strict';

const check = require('./check'); 

/** Describes number of expected function calls. */
class Cardinality {
  /** @constructor
   * 
   * @param {Number} min
   * Minimum number of expected calls.
   * @param {Number} max 
   * Maximum number of expected calls.
   */
  constructor(min, max) {
    max = max || min;
    this.set(min, max);
    this.counter = 0;
  }

  /** Sets new values of minimum and maximum expected calls.
   * 
   * @param {Number} min
   * Minimum number of expected calls.
   * @param {Number} max 
   * Maximum number of expected calls.
   * @throws {TypeError}
   * Throws TypeError if min or max parameter is not a valid number.
   * @throws {Error}
   * Error is thrown if given minimum expected calls value is negative,
   * or if given maximum expected calls value is positive lower than min.
   */
  set(min, max) {
    check.type(min, 'number', 'Expected number for min parameter');
    check.type(max, 'number', 'Expected number for max parameter');
    check.assert(min >= 0, 'min parameter can\'t be a negative number');
    if(max >= 0) {
      check.assert(min <= max, 'min should be smaller or equal to max');
    }
    this.min = min;
    this.max = max;
  }

  /** Removes upper bound from cardinality. */
  unbound() {
    this.max = -1;
  }

  /** Shifts the cardinality by a given number of expected calls.
   * 
   * @param {Number} count 
   * Number of additional expected calls. 
   * 
   * @throws {TypeError}
   * Throws TypeError if count parameter is not a valid number.
   * @throws {Error}
   * Error is thrown if given count is lower or equal to 0.
   */
  bump(count) {
    check.type(count, 'number', 'Expected count parameter to be of number type');
    check.assert(count > 0, 'Invalid count value ' + count);
    this.min += parseInt(count);
    if(this.max >= 0) {
      this.max += count;
    }
  }

  /** Checks if cardinality allows for more calls.
   * 
   * @returns {Boolean}
   * True if cardinality allows at least one more call, 
   * false otherwise.
   */
  available() {
    return ((this.counter < this.max) || (this.max < 0))
  }

  /** Uses one call from cardinality.
   * 
   * @returns {Boolean}
   * True if call didn't cause exceeding cardinality upper
   * bound, false otherwise.
   */
  use() {
    this.counter += 1;
    return ((this.counter <= this.max) || (this.max < 0));
  }

  /** Validates that cardinality was used expected number of times.
   * 
   * @returns {Boolean}
   * True if number of calls lies in defined range, false otherwise.
   */
  validate() {
    return (this.counter >= this.min) && 
      ((this.counter <= this.max) || (this.max < 0));
  }
};

module.exports = Cardinality;