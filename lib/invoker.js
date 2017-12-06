'use strict';

const Action = require('./action');

/** Specialization of an Action invoking a provided callback 
 * argument. This implementation assumes that callback is 
 * provided as last argument on the list.
 */
class Invoker extends Action {
  /** @constructor
   *  
   * @param {Array} args 
   * Array of arguments to be passed to callback on execution time.
   * @param {Number} counter 
   * Action cardinality
   *  
   */
  constructor(args, counter) {
    const action = function() {
      if(arguments.length > 0) {
        const cb = arguments[arguments.length - 1];
        if(typeof cb === 'function') {
          return cb.apply(null, args);
        }
      }
      throw new Error('Invoker couldn\'t find a proper callback argument');
    }
    super(action, counter);
  }
}

module.exports = Invoker;