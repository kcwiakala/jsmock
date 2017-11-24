'use strict';

const _ = require('lodash');
const Expectation = require('./expectation');

class Mock {
  constructor(object) {
    this.mocked = object;
    this.originals = {};
    this.expectations = {};

    const functionNames = _.functionsIn(object);
    for(const idx in functionNames) {
      const functionName = functionNames[idx];
      this.originals[functionName] = object[functionName];
      object[functionName] = this.unexpectedCall.bind(this, functionName);
    } 
  }

  unexpectedCall(functionName) {
    throw new Error('Unexpected call of ' + name);
  }

  expectedCall(functionName) {
    const args = Array.from(arguments).slice(1);
    const expectations = this.expectations[functionName];
    const idx = _.findIndex(expectations, exp => exp.isMatching(args) && !exp.isSaturated());
    if(idx < 0) {
      throw new Error('No matching expectation for call ' + functionName + '(' + args.join(',') + ')' );
    } else {
      return expectations[idx].execute(args);
    }
  }

  expectCall(functionName) {
    this.expectations[functionName] = this.expectations[functionName] || [];
    let expectations = this.expectations[functionName];
  
    if(expectations.length === 0) {
      this.mocked[functionName] = this.expectedCall.bind(this, functionName);
    }
    let expectation = new Expectation(Array.from(arguments).slice(1));
    this.expectations[functionName].push(expectation);
    return expectation;
  }

  verify() {
    let unresolved = [];
    for(let functionName in this.expectations) {
      for(let idx = 0; idx < this.expectations[functionName].length; idx += 1) {
        if(!this.expectations[functionName][idx].validate()) {
          unresolved.push(functionName); 
          break;
        }
      }
    }
    if(unresolved.length > 0) {
      throw new Error('Unresolved expectations on functions: ' + unresolved.join(','));
    }
  }

  cleanup(verify) {
    if(verify !== false) {
      this.verify();
    }
    for(const functionNamme in this.originals) {
      this.mocked[functionNamme] = this.originals[functionNamme];
    }
  }
}

module.exports = Mock;