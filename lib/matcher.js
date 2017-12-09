const _ = require('lodash');

class ArgChecker {
  constructor(predicate) {
    this.predicate = predicate;
  }
  check(arg) {
    return this.predicate(arg);
  }
}

class TypeChecker extends ArgChecker {
  constructor(type) {
    super((a) => typeof a === type);
  }
}

/** Validates provided list of arguments. */
class Matcher {
  /** Creates Matcher from given arguments
   * 
   * @param {?Array} args
   * If no argument is provided creates default matcher which
   * validates any arguments.If array contains single element of 
   * function type, creates a predicate matcher from provided 
   * function. Otherwise creates matcher that will validate arguments
   * against given array.
   */
  constructor(args) {
    args = args || [];
    if(args.length === 0) {
      this.predicate = () => true;
    } else if((args.length === 1) && (typeof args[0] === 'function' )) {
      this.predicate = args[0];
    } else {
      this.expected = args;
    }
  }

  /** Checks given argument list against matcher.
   * 
   * @param {Array} args
   * Array of arguments used for validation
   * @returns {Boolean}
   * Returns true if given argument list passes the matcher test. 
   */
  check(args) {
    if(this.predicate) {
      return this.predicate.apply(null, args);  
    } else {
      return this.checkArguments(this.expected, args);
    }
    
  }

  /** @private
   * @static
   * Compares pair of arguments
   * 
   * @param {*} expected 
   * Expected argument as provided in matcher.
   * @param {*} actual
   * Actual argument passed in function call.
   */
  static compareArgument(expected, actual) {
    if(expected instanceof ArgChecker) {
      return expected.check(actual);
    }
    return _.isEqual(expected, actual);
  }

  /** @private
   * Validates length of argument list.
   * 
   * @param {Array} expected 
   * Expected argument list as provided in matcher.
   * @param {Array} actual 
   * Actual argument list passed in function call.
   * @returns {Boolean}
   * True if both lists have the same length, false otherwise.
   */
  checkLength(expected, actual) {
    return expected.length === actual.length;
  }

  /** @private
   * Check call argument list.
   * 
   * @param {Array} expected 
   * Expected argument list as provided in matcher.
   * @param {Array} actual 
   * Actual argument list passed in function call.
   * @returns {Boolean}
   * True if call argument list passes the matcher, false otherwise.
   */
  checkArguments(expected, actual) {
    if(!this.checkLength(expected, actual)) {
      return false;
    }
    for(let idx = 0; idx < expected.length; ++idx) {
      if(!Matcher.compareArgument(expected[idx], actual[idx])) { 
        return false;
      }
    }
    return true;
  }
}

/** Specialization of Matcher for weak argument list comparison.
 * @extends Matcher
 */
class WeakMatcher extends Matcher {
  /** Passes all arguments to parent constructor. */
  constructor(/* ... */) {
    super(...arguments);
  }

  /** @private
   * Validates length of argument list.
   * 
   * @param {Array} expected 
   * Expected argument list as provided in matcher.
   * @param {Array} actual 
   * Actual argument list passed in function call.
   * @returns {Boolean}
   * True if actual argument call list is at least the size
   * of expected call list.
   */
  checkLength(expected, actual) {
    return expected.length <= actual.length;
  }
}

exports.Matcher = Matcher;
exports.WeakMatcher = WeakMatcher;

exports.ANY = new ArgChecker(() => true);
exports.OBJECT = new TypeChecker('object');
exports.NUMBER = new TypeChecker('number');
exports.STRING = new TypeChecker('string');
exports.BOOLEAN = new TypeChecker('boolean');
exports.FUNCTION = new TypeChecker('function');
exports.ARRAY = new ArgChecker(a => _.isArray(a));
