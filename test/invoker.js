'use strict';

const expect = require('chai').expect;
const Invoker = require('../lib/invoker');
const create = require('./helper').create;

describe('Invoker', () => {

  // Redefines only construction of an action
  describe('constructor', () => {
    it('Should create action that will apply given arguments to callback', (done) => {
      let inv = new Invoker([1, 'Hello', null], 1);
      function cb(a,b,c) {
        expect(a).to.be.equal(1);
        expect(b).to.be.equal('Hello');
        expect(c).to.be.null;
        done();
      }
      inv.execute(['x', 1, cb]);
    });

    it('Should throw exception if there are no arguments provided to execute', () => {
      let inv = new Invoker([1, 2, 3], 2);
      expect(inv.execute.bind(inv)).to.throw(Error);
    });

    it('Should throw exception if last argument of execute is not a function', () => {
      let inv = new Invoker([1, 2, 3], 3);
      expect(inv.execute.bind(inv, [1, 'Bla Bla'])).to.throw(Error);
      expect(inv.execute.bind(inv, [1, () => {}, null])).to.throw(Error);
      expect(inv.execute.bind(inv, [1, () => {}])).not.to.throw(Error);
    });
  });
});