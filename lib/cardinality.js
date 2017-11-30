'use strict';

class Cardinality {
  constructor(min, max) {
    this.set(min, max);
    this.counter = 0;
  }

  set(min, max) {
    this.min = min;
    this.max = max;
  }

  unbound() {
    this.max = -1;
  }

  bump(count) {
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