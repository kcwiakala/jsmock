'use strict';

const expect = require('chai').expect;
const Expectation = require('../lib/expectation');

describe('expectation', () => {
  
  describe('constructor', () => {

    it('Should use true matcher by default', () => {
      let exp = new Expectation();
      expect(exp.isMatching([1,2,3])).to.be.true;

      exp = new Expectation([1,2,true]);
      expect(exp.isMatching([1,2,3])).to.be.false;
      //expect(exp.isMatching([1,2,true])).to.be.true;

      exp = new Expectation([(a, b) => (a > 5) && (b < 3)]);
      expect(exp.isMatching([1,3])).to.be.false;
      expect(exp.isMatching([6,2])).to.be.true;
    });
  });
});