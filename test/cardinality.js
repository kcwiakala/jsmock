'use strict';

const expect = require('chai').expect;
const Cardinality = require('../lib/cardinality');
const create = require('./helper').create;

describe('Cardinality', () => {
  describe('constructor', () => {
    it('Should validate provided input', () => {
      expect(create.bind(null, Cardinality, 'abc', 'def')).to.throw(TypeError);
      expect(create.bind(null, Cardinality, [])).to.throw(TypeError);
      expect(create.bind(null, Cardinality, 8, 2)).to.throw(Error);
      expect(create.bind(null, Cardinality, -1, 2)).to.throw(Error);
    });
    it('Should initialize min and max boundary to same value if only one provided', () => {
      let c = new Cardinality(5);
      expect(c.min).to.be.equal(5);
      expect(c.max).to.be.equal(5);
    });
    it('Should set min and max boundaries with given values', () => {
      let c = new Cardinality(3,8);
      expect(c.min).to.be.equal(3);
      expect(c.max).to.be.equal(8);
    });
    it('Should setup internal counter to value 0', () => {
      let c = new Cardinality(10,23);
      expect(c.counter).to.be.equal(0);
    });
  });
  describe('set', () => {
    it('Should validate provided input', () => {
      let c = new Cardinality(1);
      expect(c.set.bind(c, 'abc', 'def')).to.throw(TypeError);
      expect(c.set.bind(c, [], {})).to.throw(TypeError);
      expect(c.set.bind(c, 8, 2)).to.throw(Error);
      expect(c.set.bind(c, -1, 2)).to.throw(Error);
      expect(c.set.bind(c, 1)).to.throw(Error);
    });
    it('Should replace old boundaries with new ones', () => {
      let c = new Cardinality(5, 9);
      expect(c.min).to.be.equal(5);
      expect(c.max).to.be.equal(9);
      c.set(1,4);
      expect(c.min).to.be.equal(1);
      expect(c.max).to.be.equal(4);
      c.set(5,6);
      expect(c.min).to.be.equal(5);
      expect(c.max).to.be.equal(6);
    });
  });
  describe('unbound', () => {
    it('Should release upper bound on cardinality by assigning negative value to max member', () => {
      let c = new Cardinality(5, 29);
      expect(c.min).to.be.equal(5);
      expect(c.max).to.be.equal(29);
      c.unbound();
      expect(c.max).to.be.lessThan(0);
    });
  });
  describe('bump', () => {
    it('Should validate input parameter', () => {
      let c = new Cardinality(4,6);
      expect(c.bump.bind(c, 'abc')).to.throw(TypeError);
      expect(c.bump.bind(c, [])).to.throw(TypeError);
      expect(c.bump.bind(c, 0)).to.throw(Error);
      expect(c.bump.bind(c, -3)).to.throw(Error);
    });
    it('Should update cardinality with given number of expected calls', () => {
      let c = new Cardinality(1,3);
      expect(c.min).to.be.equal(1);
      expect(c.max).to.be.equal(3);
      c.bump(5);
      expect(c.min).to.be.equal(6);
      expect(c.max).to.be.equal(8);
    });
    it('Should update only min boundary if cardinality is has no upper limit', () => {
      let c = new Cardinality(1);
      c.unbound();
      expect(c.min).to.be.equal(1);
      expect(c.max).to.be.lessThan(0);
      c.bump(8);
      expect(c.min).to.be.equal(9);
      expect(c.max).to.be.lessThan(0);
    });
  });
  describe('use', () => {
    it('Should update internal counter on every call', () => {
      let c = new Cardinality(5);
      expect(c.counter).to.be.equal(0);
      c.use();
      expect(c.counter).to.be.equal(1);
      c.use();
      c.use();
      c.use();
      expect(c.counter).to.be.equal(4);
    });
    it('Should return true until upper bound is not reached', () => {
      let c = new Cardinality(4);
      expect(c.use()).to.be.true;
      expect(c.use()).to.be.true;
      expect(c.use()).to.be.true;
      expect(c.use()).to.be.true;
      expect(c.use()).to.be.false;
    });
    it('Should always return true for cardinality without upper limit', () => {
      let c = new Cardinality(2);
      expect(c.use()).to.be.true;
      expect(c.use()).to.be.true;
      expect(c.use()).to.be.false;
      c.unbound();
      for(let i=0; i < 1000; ++i) {
        expect(c.use()).to.be.true;
      }
    });
  });
  describe('validate', () => {
    it('Should return true if internal counter lies in cardinality boundaries', () => {
      let c = new Cardinality(2);
      expect(c.validate()).to.be.false;
      c.counter = 2;
      expect(c.validate()).to.be.true;
      c.set(3,6);
      expect(c.validate()).to.be.false;
      c.counter = 6;
      expect(c.validate()).to.be.true;
      c.counter = 7;
      expect(c.validate()).to.be.false;
    });
    it('Should return true if internal counter is bigger or equal min value for unbounded cardinality', () => {
      let c = new Cardinality(1);
      c.unbound();
      expect(c.validate()).to.be.false;
      c.counter = 1;
      expect(c.validate()).to.be.true;
      c.counter = 1000;
      expect(c.validate()).to.be.true;
      c.counter = 1000000;
      expect(c.validate()).to.be.true;
    });
  });
});