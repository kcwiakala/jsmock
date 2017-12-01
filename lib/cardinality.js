'use strict';

class Cardinality {
  constructor(min, max) {
    max = max || min;
    this.set(min, max);
    this.counter = 0;
  }

  set(min, max) {
    if((typeof min !== 'number') || (typeof max !== 'number')) {
      throw new TypeError('Expected number for both min and max parameters');
    }
    if((max >= 0) && (max < min)) {
      throw new Error('min should be smaller or equal to max');
    }
    if(min < 0) {
      throw new Error('min parameter can\'t be a negative number');
    }
    this.min = min;
    this.max = max;
  }

  unbound() {
    this.max = -1;
  }

  bump(count) {
    if(typeof count !== 'number') {
      throw new TypeError('Expected count parameter to be of number type');
    }
    if(count <= 0) {
      throw new Error('Invalid count value ' + count);
    }
    this.min += count;
    if(this.max >= 0) {
      this.max += count;
    }
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