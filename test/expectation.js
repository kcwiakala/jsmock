'use strict';

const expect = require('chai').expect;
const Expectation = require('../lib/expectation');
const Action = require('../lib/action');

describe('Expectation', () => {
  
  describe('constructor', () => {
    it('Should use true matcher by default', () => {
      let exp = new Expectation();
      expect(exp.isMatching([1,2,3])).to.be.true;
      expect(exp.isMatching(['hello'])).to.be.true;
    });

    it('Should initialize actions as empty array', () => {
      let exp = new Expectation();
      expect(exp.actions).to.be.an('array').that.is.empty;
    });

    it('Should initialize cardinality to expect single execution', () => {
      let exp = new Expectation();
      expect(exp.execute.bind(exp)).not.to.throw(Error);
      expect(exp.execute.bind(exp)).to.throw(Error, 'oversaturated');
    });
  });

  describe('isMatching', () => {
    it('Should execute matcher function if one provided', () => {
      let counter = 0;
      let mfun = (a,b) => {
        counter += 1;
        return (a + b) > 5;
      };
      let exp = new Expectation([mfun]);
      expect(exp.isMatching([1,3])).to.be.false;
      expect(exp.isMatching([7,3])).to.be.true;
      expect(exp.isMatching([3,2])).to.be.false;
      expect(counter).to.be.equal(3);
    });

    it('Should match arguments exactly if list given', () => {
      let exp = new Expectation([1, 'hello', true]);
      expect(exp.isMatching([1.0, 'hello', 1])).to.be.false;
      expect(exp.isMatching([2, 'hello', true])).to.be.false;
      expect(exp.isMatching([1, 'bello', true])).to.be.false;
      expect(exp.isMatching([1, 'hello', false])).to.be.false;
      expect(exp.isMatching([1, 'hello', true])).to.be.true;
    });
  });

  describe('isSaturated', () => {
    it('Should return true if cardinality is not available', () => {
      let exp = new Expectation();
      exp.times(3);
      expect(exp.isSaturated()).to.be.false;
      exp.execute();
      exp.execute();
      expect(exp.isSaturated()).to.be.false;
      exp.execute();
      expect(exp.isSaturated()).to.be.true;
    });

    it('Should always return false for unbound cardinalities', () => {
      let exp = new Expectation();
      exp.atLeast(2);
      for(let i=0; i<1000; ++i) {
        exp.execute();
        expect(exp.isSaturated()).to.be.false;
      }
    });
  });

  describe('validate', () => {
    it('Should return false by default', () => {
      let exp = new Expectation();
      expect(exp.validate()).to.be.false;
    });

    it('Should return false if forced cardinallity is not fullfilled', () => {
      let exp = new Expectation();
      exp.times(3);
      expect(exp.validate()).to.be.false;
      exp.execute();
      exp.execute();
      expect(exp.validate()).to.be.false;
      exp.execute();
      expect(exp.validate()).to.be.true;
    });

    it('Should return false if automatic cardinality is not fullfilled', () => {
      let exp = new Expectation();
      exp.willOnce(1).willTwice(2);
      expect(exp.validate()).to.be.false;
      expect(exp.execute()).to.be.equal(1);
      expect(exp.execute()).to.be.equal(2);
      expect(exp.validate()).to.be.false;
      expect(exp.execute()).to.be.equal(2);
      expect(exp.validate()).to.be.true;
    });
  });

  describe('execute', () => {
    it('Should return no value if no actions provided', () => {
      let exp = new Expectation();
      exp.atLeast(1);
      expect(exp.execute([1,2,3])).to.be.undefined;
      expect(exp.execute([])).to.be.undefined;
      expect(exp.execute()).to.be.undefined;
    });

    it('Should execute first available action from the list', () => {
      let exp = new Expectation();
      exp.willOnce('A1').willTwice('A2').willOnce('A3');
      expect(exp.execute()).to.be.equal('A1');
      expect(exp.execute()).to.be.equal('A2');
      expect(exp.execute()).to.be.equal('A2');
      expect(exp.execute()).to.be.equal('A3');
    });

    it('Should throw expection if no available action in the list', () => {
      let exp = new Expectation();
      exp.times(3).willOnce('A1').willOnce('A2');
      expect(exp.execute()).to.be.equal('A1');
      expect(exp.execute()).to.be.equal('A2');
      expect(exp.execute.bind(exp)).to.throw(Error, 'valid action');
    });

    it('Should pass argument array to executed action', () => {
      let exp = new Expectation();
      exp.willOnce((a,b,c) => {
        expect([a,b,c]).to.deep.equal([1,2,3]);
        return 'A1';
      });
      exp.willOnce((a,b,c) => {
        expect([a,b,c]).to.deep.equal([3,2,1]);
        return 'A2';
      });
      expect(exp.execute([1,2,3])).to.be.equal('A1');
      exp.actions[0].available = () => false;
      expect(exp.execute([3,2,1])).to.be.equal('A2');
    });

    it('Should throw expection if expectation is already saturated', () => {
      let exp = new Expectation();
      exp.atMost(2);
      exp.execute();
      exp.execute();
      expect(exp.execute.bind(exp)).to.throw(Error);
    });

    it('Should respect forced cardinality even if there are still available actions', () => {
      let exp = new Expectation();
      exp.times(2).willOnce(153).willOnce(543).willOnce(123);
      expect(exp.execute()).to.be.equal(153);
      expect(exp.execute()).to.be.equal(543);
      expect(exp.execute.bind(exp)).to.throw(Error);
    });
  });

  describe('matching', () => {
    it('Should replace current matcher with one provided', () => {
      let exp = new Expectation();
      expect(exp.isMatching()).to.be.true;
      exp.matching(() => false);
      expect(exp.isMatching()).to.be.false;
      exp.matching((a) => a > 3);
      expect(exp.isMatching([1])).to.be.false;
      expect(exp.isMatching([4])).to.be.true;
      exp.matching(1,2,3);
      expect(exp.isMatching([1,2])).to.be.false;
      expect(exp.isMatching([1,2,3,4])).to.be.false;
      expect(exp.isMatching([1,2,3])).to.be.true;
    });

    it('Should return current expectation instance', () => {
      let exp1 = new Expectation();
      let exp2 = new Expectation();
      expect(exp1.matching()).to.be.equal(exp1);
      expect(exp2.matching()).to.be.equal(exp2);
    });
  });

  describe('actions', () =>{
    describe('willOnce', () => {
      it('Should create action with counter set to 1', () => {
        let exp = new Expectation();
        exp.willOnce(() => true);
        expect(exp.actions).to.have.length(1);
        expect(exp.actions[0].counter).to.be.equal(1);
      });

      it('Should return instance of current expectation', () => {
        let exp1 = new Expectation();
        let exp2 = new Expectation();
        expect(exp1.willOnce(() => true)).to.be.equal(exp1);
        expect(exp2.willOnce(() => false)).to.be.equal(exp2);
      })
      
      it('Should create action with provided function', () => {
        let exp = new Expectation();
        exp.willOnce(() => 4531);
        exp.willOnce(() => 'Hello World');
        expect(exp.actions[0].execute()).to.be.equal(4531);
        expect(exp.actions[1].execute()).to.be.equal('Hello World'); 
      });
    });

    describe('willTwice', () => {
      it('Should create action with counter set to 2', () => {
        let exp = new Expectation();
        exp.willTwice(() => true);
        expect(exp.actions).to.have.length(1);
        expect(exp.actions[0].counter).to.be.equal(2);
      });

      it('Should return instance of current expectation', () => {
        let exp1 = new Expectation();
        let exp2 = new Expectation();
        expect(exp1.willTwice(() => true)).to.be.equal(exp1);
        expect(exp2.willTwice(() => false)).to.be.equal(exp2);
      })
      
      it('Should create action with provided function', () => {
        let exp = new Expectation();
        exp.willTwice(() => 4531);
        exp.willTwice(() => 'Hello World');
        expect(exp.actions[0].execute()).to.be.equal(4531);
        expect(exp.actions[1].execute()).to.be.equal('Hello World'); 
      });
    });

    describe('willRepeatedly', () => {
      it('Should create action with counter set to negative value', () => {
        let exp = new Expectation();
        exp.willRepeatedly(() => true);
        expect(exp.actions).to.have.length(1);
        expect(exp.actions[0].counter).to.be.lessThan(0);
      });

      it('Should return instance of current expectation', () => {
        let exp1 = new Expectation();
        let exp2 = new Expectation();
        expect(exp1.willRepeatedly(() => true)).to.be.equal(exp1);
        expect(exp2.willRepeatedly(() => false)).to.be.equal(exp2);
      })
      
      it('Should create action with provided function', () => {
        let exp = new Expectation();
        exp.willRepeatedly(() => 4531);
        exp.willRepeatedly(() => 'Hello World');
        expect(exp.actions[0].execute()).to.be.equal(4531);
        expect(exp.actions[1].execute()).to.be.equal('Hello World'); 
      });
    });
  });

  describe('cardinality', () => {
    it('Should throw exception on attempt to override existing cardinality', () => {
      let exp = new Expectation();
      exp.times(2);
      expect(exp.times.bind(exp,1)).to.throw(Error);
      expect(exp.atLeast.bind(exp,3)).to.throw(Error);
      expect(exp.atMost.bind(exp,5)).to.throw(Error);
      expect(exp.between.bind(exp,1,4)).to.throw(Error);
    });

    it('Should throw expeption if called after at least one action definition', () => {
      let exp = new Expectation();
      exp.willOnce(() => 2);
      expect(exp.times.bind(exp,1)).to.throw(Error);
      expect(exp.atLeast.bind(exp,3)).to.throw(Error);
      expect(exp.atMost.bind(exp,5)).to.throw(Error);
      expect(exp.between.bind(exp,1,4)).to.throw(Error);
    });

    it('Should return expectation instance', () => {
      let exp = new Expectation();
      expect(exp.times(3)).to.be.equal(exp);
      exp = new Expectation();
      expect(exp.atLeast(2)).to.be.equal(exp);
      exp = new Expectation();
      expect(exp.atMost(7)).to.be.equal(exp);
      exp = new Expectation();
      expect(exp.between(1,7)).to.be.equal(exp);
    });

    describe('times', () => {
      it('Should force cardinality on expectation to exact number of calls', () => {
        let exp = new Expectation();
        exp.times(2);
        expect(exp.validate()).to.be.false;
        exp.execute();
        exp.execute();
        expect(exp.validate()).to.be.true;
        expect(exp.execute.bind(exp)).to.throw(Error);
      });
    });
    
    describe('atLeast', () => {
      it('Should force cardinality on expectation to number of calls equal or higher then specified', () => {
        let exp = new Expectation();
        exp.atLeast(2);
        expect(exp.validate()).to.be.false;
        exp.execute();
        expect(exp.validate()).to.be.false;
        exp.execute();
        expect(exp.validate()).to.be.true;
        for(let i=0; i < 1000; ++i) {
          exp.execute();
          expect(exp.validate()).to.be.true;
        }
      });
    });

    describe('atMost', () => {
      it('Should put expectation on at least one call', () => {
        let exp = new Expectation();
        exp.atMost(6);
        expect(exp.validate()).to.be.false;
        exp.execute();
        expect(exp.validate()).to.be.true;
      });

      it('Should force cardinality on expectation to number of calls lower or equal then specified', () => {
        let exp = new Expectation();
        exp.atMost(2);
        expect(exp.validate()).to.be.false;
        exp.execute();
        expect(exp.validate()).to.be.true;
        exp.execute();
        expect(exp.validate()).to.be.true;
        expect(exp.execute.bind(exp)).to.throw(Error);
      });
    });

    describe('betweeen', () => {
      it('Should thwrow exception if only one parameter given', () => {
        let exp = new Expectation();
        expect(exp.between.bind(exp, 1)).to.throw(Error);
      });

      it('Should force cardinality on expectation to number of calls in given range', () => {
        let exp = new Expectation();
        exp.between(2,4);
        expect(exp.validate()).to.be.false;
        exp.execute();
        expect(exp.validate()).to.be.false;
        exp.execute();
        expect(exp.validate()).to.be.true;
        exp.execute();
        expect(exp.validate()).to.be.true;
        exp.execute();
        expect(exp.execute.bind(exp)).to.throw(Error);
      });
    });
  });
});