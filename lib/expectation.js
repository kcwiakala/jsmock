'use strict';

const Action = require('./action');
const _ = require('lodash');

function matcher(args) {
  if(arguments.length === 0) {
    return () => true;
  } else if((arguments.length === 1) && (typeof arguments[0] === 'function' )) {
    return arguments[0];
  } else {
    const expected = Array.from(arguments);
    return function () {
      return _.isEqual(Array.from(arguments), expected);
    }
  }
}

class Expectation {
  constructor(args) {
    this.matcher = matcher.apply(null, args);
    this.actions = [];
  }

  isMatching(args) {
    return this.matcher.apply(null, args);
  }

  isSaturated() {
    return _.findIndex(this.actions, a => a.ready()) < 0;
  }

  validate() {
    if(this.actions.length === 0) {
      return true;
    }
    return (_.findIndex(this.actions, a => !a.validate()) < 0);
  }

  execute(args) {
    if(this.actions.length === 0) {
      return true;
    }
    const idx = _.findIndex(this.actions, a => a.ready());
    if(idx < 0) {
      throw new Error('Unable to find valid action for execution');
    }
    return this.actions[idx].execute(args);
  }

  matching() {
    this.matcher = matcher.apply(null, arguments);
    return this;
  } 

  will(action) {
    const act = new Action(this, action);
    this.actions.push(act);
    return act;
  }

  willOnce(action) {
    this.actions.push(new Action(this, action, 1));
    return this;
  }

  willRepeatedly(action) {
    this.actions.push(new Action(this, action, -1));
    return this;
  }
}

module.exports = Expectation;