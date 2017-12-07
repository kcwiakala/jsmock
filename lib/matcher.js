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

class Matcher {
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

  check(args) {
    if(this.predicate) {
      return this.predicate.apply(null, args);  
    } else {
      return this.checkArguments(this.expected, args);
    }
    
  }

  static compareArgument(expected, actual) {
    if(expected instanceof ArgChecker) {
      return expected.check(actual);
    }
    return _.isEqual(expected, actual);
  }

  checkLength(expected, actual) {
    return expected.length === actual.length;
  }

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

class WeakMatcher extends Matcher {
  constructor(/* ... */) {
    super(...arguments);
  }
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
