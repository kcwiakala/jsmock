'use strict';

const Action = require('./action');

class Invoker extends Action {
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