'use strict';

const _ = require('lodash');
const Expectation = require('./expectation');
const check = require('./check');

class UnexpectedCall extends Error {};

function formatArgument(arg) {
  switch(typeof arg) {
    case 'string':
      return '"' + arg + '"';
    case 'function':
      return 'function';
    case 'number':
    case 'boolean':
    case 'undefined':
      return '' + arg;
    case 'object':
      if(arg === null) {
        return 'null';
      } else if(_.isArray(arg)) {
        return '[...]';
      } 
      return '{...}';
  }
}

function formatCall(functionName, args) {
  let output = functionName + '(';
  let formattedArgs = [];
  for(let i in args) {
    formattedArgs.push(formatArgument(args[i]));
  }
  output += formattedArgs.join(',') + ')';
  return output;
}

/** @class Mock
 * 
 */
class Mock {
  /**
   * @param {Object} object 
   * Object to be mocked.
   */
  constructor(object) {
    this.mocked = object;
    this.originals = {};
    this.expectations = {};

    const functionNames = _.functionsIn(object);
    for(const idx in functionNames) {
      const functionName = functionNames[idx];
      this.originals[functionName] = object[functionName];
      object[functionName] = this.mockedCall.bind(this, functionName);
    } 
  }

  /** Bind for all functions of mocked object
   * @param {String} functionName 
   * Name of the function being called
   * @throws {UnexpectedCall}
   * This function will throw an exception in case if there is no 
   * matching expectation defined.
   */
  mockedCall(functionName) {
    const args = Array.from(arguments).slice(1);
    const expectations = this.expectations[functionName];
    if(!expectations || expectations.length === 0) {
      throw new UnexpectedCall('Unexpected call of ' + formatCall(functionName, args));
    }
    const idx = _.findIndex(expectations, exp => exp.isMatching(args) && !exp.isSaturated());
    if(idx < 0) {
      throw new UnexpectedCall('No matching expectation for call ' + formatCall(functionName, args));
    } else {
      return expectations[idx].execute(args);
    }
  }

  /** Creates Expectation for function with given name.
   * 
   * @param {String} functionName 
   * Name of the function for which the call is expected.
   * @throws {Error} 
   * Error is thrown if given function name doesn't match any of 
   * functions from mocked object.
   * @returns {Expectation}
   * Returns newly created Expectation object
   */
  expectCall(functionName) {
    check.assert(_.has(this.originals, functionName), 'Unknown function ' + functionName);
    this.expectations[functionName] = this.expectations[functionName] || [];
    let expectation = new Expectation(Array.from(arguments).slice(1));
    this.expectations[functionName].push(expectation);
    return expectation;
  }

  /** Verifies if all expectations on mock object were fulfilled.
   * 
   * @throws {Error}
   * If no callback provided, method throws Error containing list of mocked 
   * object functions with unresolved expectations.
   * 
   * @param {Function} done 
   * Optional callback parameter. If provided, function want throw expectation but will
   * pass error to callback. If verification succeeds callback is called with null. 
   */
  verify(done) {
    let unresolved = [];
    for(let functionName in this.expectations) {
      for(let idx = 0; idx < this.expectations[functionName].length; idx += 1) {
        if(!this.expectations[functionName][idx].validate()) {
          unresolved.push(functionName); 
          break;
        }
      }
    }
    this.expectations = {};
    const err = (unresolved.length > 0) ? new Error('Unresolved expectations on functions: ' + unresolved.join(',')) : null;
    if(typeof done === 'function') {
      return done(err)
    } else if (err){
      throw err;
    }
  }

  /** Restores original functions in mocked object. 
   */
  cleanup() {
    for(const functionName in this.originals) {
      this.mocked[functionName] = this.originals[functionName];
    }
  }
}

exports.Mock = Mock;
exports.UnexpectedCall = UnexpectedCall;