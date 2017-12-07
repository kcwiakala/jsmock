const expect = require('chai').expect;
const matcher = require('../lib/matcher');
const create = require('./helper').create;

const Matcher = matcher.Matcher;
const WeakMatcher = matcher.WeakMatcher;

describe('Matcher', () => {
  
  it('Should create true matcher by default', () => {
    let m = new Matcher();
    expect(m.check([1,2,3,4])).to.be.true;
    expect(m.check(['a', 'b', 'c'])).to.be.true;
    expect(m.check([])).to.be.true;
  });

  it('Should create predicate matcher if function given', () => {
    let m = new Matcher([(a) => a > 3]);
    expect(m.check([1,5])).to.be.false;
    expect(m.check([3,true])).to.be.false;
    expect(m.check([4,null,'hello'])).to.be.true;
  });

  it('Should create argument matcher if non function argument given', () => {
    let m = new Matcher([1, true, 'hello']);
    expect(m.check([1, false, 'hello'])).to.be.false;
    expect(m.check([1, true, 'hello', undefined])).to.be.false;
    expect(m.check([1, true])).to.be.false;
    expect(m.check([1, true, 'hello'])).to.be.true;
  });

  it('Should perform deep comparison for arguments', () => {
    let m = new Matcher([[1,2], {a: true, b: 'hello'}]);
    expect(m.check([[1,2], {a: false, b: 'hello'}])).to.be.false;
    expect(m.check([[1], {a: true, b: 'hello'}])).to.be.false;
    expect(m.check([[1,2], {a: true, b: 'hello'}])).to.be.true;
  });

  describe('WeakMatcher', () => {
    it('Should ignore any extra arguments provided to check', () => {
      let m = new WeakMatcher([1, true, 'hello']);
      expect(m.check([1, true, 'hello', 2, 3])).to.be.true;
      expect(m.check([1, true])).to.be.false;
    });
  });

  describe('Argument Matchers', () => {
    it('Should accept matching argument with any value', () => {
      let m1 = new Matcher([matcher.NUMBER, matcher.STRING, matcher.FUNCTION]);
      expect(m1.check([1, 'hello', () => false])).to.be.true;
      expect(m1.check([982, 'world', (a) => a + 234])).to.be.true;
      expect(m1.check([8, true, () => 'lol'])).to.be.false;

      let m2 = new Matcher([matcher.OBJECT, matcher.ARRAY]);
      expect(m2.check([{a:3}, [1,2]])).to.be.true;
      expect(m2.check([[5,6], [1,2]])).to.be.true;
      expect(m2.check([[5,6], {x: true}])).to.be.false;

      let m3 = new Matcher([matcher.BOOLEAN, matcher.STRING]);
      expect(m3.check([true, 'wow'])).to.be.true;
      expect(m3.check([1, 'matcher'])).to.be.false;
      expect(m3.check([null, 'matcher'])).to.be.false;
    });

    it('Should accept any type with special ANY matcher', () => {
      let m = new Matcher([matcher.ANY, matcher.ANY, matcher.STRING]);
      expect(m.check([1, true, 'hello'])).to.be.true;
      expect(m.check([[2,3,4], {a:1}, 'world'])).to.be.true;
      expect(m.check([null, undefined, 'foo'])).to.be.true;
      expect(m.check([5, 'bar', 1])).to.be.false;
    });
  })
});