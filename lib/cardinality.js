'use strict';

const check = require('./check'); 

class Cardinality {
  constructor(min, max) {
    max = max || min;
    this.set(min, max);
    this.counter = 0;
  }

  set(min, max) {
    check.type(min, 'number', 'Expected number for min parameter');
    check.type(max, 'number', 'Expected number for max parameter');
    check.assert(min >= 0, 'min parameter can\'t be a negative number');
    if(max >= 0) {
      check.assert(min <= max, 'min should be smaller or equal to max');
    }
    this.min = min;
    this.max = max;
  }

  unbound() {
    this.max = -1;
  }

  bump(count) {
    check.type(count, 'number', 'Expected count parameter to be of number type');
    check.assert(count > 0, 'Invalid count value ' + count);
    this.min += count;
    if(this.max >= 0) {
      this.max += count;
    }
  }

  available() {
    return ((this.counter < this.max) || (this.max < 0))
  }

  use() {
    this.counter += 1;
    return ((this.counter <= this.max) || (this.max < 0));
  }

  validate() {
    return (this.counter >= this.min) && 
      ((this.counter <= this.max) || (this.max < 0));
  }
};

module.exports = Cardinality;