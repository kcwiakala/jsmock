'use strict';

const _ = require('lodash');

function spyCall(functionName) {
  const args = Array.from(arguments).slice(1);
  const result = this.originals[functionName].apply(this.spyed, args);
  this.calls[functionName].push({args, result});
  return result;
}

/** Spy is a simplified version of a Mock. It wraps all functions of provided
 * object with some additional code that enables storage of passed arguments
 * and returned values. Spy objects allow to perform post execution validation
 * of used interfaces with test assertions.
 */
class Spy {
  /** Creates a new spy over given object.
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

  /** Removes all the tooling code from spyed object.
   */
  cleanup() {
    for(const functionNamme in this.originals) {
      this.spyed[functionNamme] = this.originals[functionNamme];
    }
  }
}

module.exports = Spy;