'use strict';

const _ = require('lodash');

class Anything {};

const ANYTHING = new Anything();

function compareArguments(expected, actual) {
  if(expected.length !== actual.length) {
    return false;
  }
  for(let idx = 0; idx < expected.length; ++idx) {
    const expectedArg = expected[idx];
    const actualArg = actual[idx];
    if((expectedArg !== actualArg) && (expectedArg !== ANYTHING)){
      return false;
    }
  }
  return true;
}

/** 
 * Creates appropriate matcher function for given arguments.
 */
function create(/* ... */) {
  if(arguments.length === 0) {
    return () => true;
  } else if((arguments.length === 1) && (typeof arguments[0] === 'function' )) {
    return arguments[0];
  } else {
    const expected = Array.from(arguments);
    return function() {
      return compareArguments(expected, Array.from(arguments));
    }
  }
}

exports.any = ANYTHING;
exports.create = create;