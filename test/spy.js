'use strict';

const Spy = require('../lib/spy');
const expect = require('chai').expect;

describe('Spy', () => {
  describe('constructor', () => {
    it('Should ...', () => {
      let sut = {
        foo: (a,b) => a + b, 
        bar: (a,b) => a - b
      }
      let spy = new Spy(sut);
      
      sut.foo(1,2);
      sut.bar(5,1);
      sut.foo(3,5);
      //console.log(JSON.stringify(spy.calls));
    });
  });
});