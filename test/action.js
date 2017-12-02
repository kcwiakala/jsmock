'use strict';

const expect = require('chai').expect;
const Action = require('../lib/action');
const create = require('./helper').create;

describe('Action', () => {
  
  describe('constructor', () =>{
    it('Should validate that provided counter is non zero number', () => {
      const action = () => {};
  
      // Not a number should throw an error
      expect(create.bind(null, Action, action, 'bla')).to.throw(TypeError, 'number');
      expect(create.bind(null, Action, action, true)).to.throw(TypeError, 'number');
      expect(create.bind(null, Action, action, {})).to.throw(TypeError, 'number');
  
      // Zero value should cause an error
      expect(create.bind(null, Action, action, 0)).to.throw(Error, 'execution times');
      expect(create.bind(null, Action, action, 0.1)).to.throw(Error, 'execution times');
  
      // Valid non zero numbers should be fine
      expect(create.bind(null, Action, action, 10)).not.to.throw;
      expect(create.bind(null, Action, action, 0.9)).not.to.throw;
    });
  });

  describe('execute', () => {
    it('Should execute provided function with given parameters', () => {
      let executed = false;
      let action = new Action((a, b, c) => {
        executed = true;
        return a + b + c;
      });
      expect(action.execute([1,2,3])).to.be.equal(6);
      expect(executed).to.be.true;
    });

    it('Should decrement counter on each execute', () => {
      let action = new Action(() => {}, 5);
      expect(action.counter).to.be.equal(5);
      action.execute();
      action.execute();
      expect(action.counter).to.be.equal(3);
      action.execute();
      action.execute();
      action.execute();
      expect(action.counter).to.be.equal(0);
    });

    it('Should throw exception when executing saturated action', () => {
      let action = new Action(() => {}, 1);
      action.execute();
      expect(action.counter).to.be.equal(0);
      expect(action.execute.bind(action)).to.throw(Error, 'saturated');
    });

    it('Should return given value for non-function actions', () => {
      let action1 = new Action(5, 1);
      expect(action1.execute()).to.be.equal(5);

      let foo = {a: 1, b: false};
      let action2 = new Action(foo, 1);
      expect(action2.execute()).to.be.equal(foo);
    });
  });

  describe('validate', () => {
    it('Should return true only if action was executed expected number of times', () => {
      let action = new Action(() => {}, 3);
      expect(action.validate()).to.be.false;
      action.execute();
      action.execute();
      expect(action.validate()).to.be.false;
      action.execute();
      expect(action.validate()).to.be.true;
    });

    it('Should always return true for unbounded actions', () => {
      let action = new Action(() => {}, -1);
      expect(action.validate()).to.be.true;
      action.execute();
      expect(action.validate()).to.be.true;
    });
  })
});