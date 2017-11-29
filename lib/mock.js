'use strict';

const _ = require('lodash');
const Expectation = require('./expectation');

class Mock {
  /**
   * 
   * @param {Object} object 
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

  /** Bind for a function of a mocked object having at 
   * least one expectation properly set
   * @param {String} functionName 
   * Name of the function being called
   */
  mockedCall(functionName) {
    const args = Array.from(arguments).slice(1);
    const expectations = this.expectations[functionName];
    if(!expectations || expectations.length === 0) {
      throw new Error('Unexpected call of ' + functionName);
    }
    const idx = _.findIndex(expectations, exp => exp.isMatching(args) && !exp.isSaturated());
    if(idx < 0) {
      throw new Error('No matching expectation for call ' + functionName + '(' + args.join(',') + ')' );
    } else {
      return expectations[idx].execute(args);
    }
  }

  /** 
   * 
   * @param {String} functionName 
   */
  expectCall(functionName) {
    if(!_.has(this.originals, functionName)) {
      throw new Error('Unknown function ' + functionName);
    }
    this.expectations[functionName] = this.expectations[functionName] || [];
    let expectation = new Expectation(Array.from(arguments).slice(1));
    this.expectations[functionName].push(expectation);
    return expectation;
  }

  /**
   * 
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
    const err = (unresolved.length > 0) ? new Error('Unresolved expectations on functions: ' + unresolved.join(',')) : null;
    if(typeof done === 'function') {
      return done(err)
    } else if (err){
      throw err;
    }
  }

  /**
   * 
   * @param {Boolean} verify 
   */
  cleanup() {
    for(const functionNamme in this.originals) {
      this.mocked[functionNamme] = this.originals[functionNamme];
    }
  }
}

module.exports = Mock;