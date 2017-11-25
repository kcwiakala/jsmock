'use strict';

const _ = require('lodash');

function spyCall(functionName) {
  const args = Array.from(arguments).slice(1);
  const result = this.originals[functionName].apply(this.spyed, args);
  this.calls[functionName].push({args, result});
  return result;
}

class Spy {
  /**
   * 
   * @param {Object} object 
   */
  constructor(object) {
    this.spyed = object;
    this.originals = {};
    this.calls = {};

    const functionNames = _.functionsIn(object);
    for(const idx in functionNames) {
      const functionName = functionNames[idx];
      this.originals[functionName] = object[functionName];
      this.calls[functionName] = [];
      object[functionName] = spyCall.bind(this, functionName);
    } 
  }

  /**
   *
   */
  cleanup() {
    for(const functionNamme in this.originals) {
      this.spyed[functionNamme] = this.originals[functionNamme];
    }
  }
}

module.exports = Spy;