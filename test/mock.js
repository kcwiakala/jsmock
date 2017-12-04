'use strict';

const expect = require('chai').expect;
const Mock = require('../lib/mock').Mock;
const UnexpectedCall = require('../lib/mock').UnexpectedCall;
const Expectation = require('../lib/expectation');

describe('Mock', () => {

  function A() {
    this.foo = (a,b) => a + b;
  }
  A.prototype.bar = function(a,b) {
    return a * b;
  }

  describe('constructor', () => {
    it('Should replace all function of given object', () => {   
      let a = new A();
      expect(a.foo(1,2)).to.be.equal(3);
      expect(a.bar(1,2)).to.be.equal(2);
  
      let aMock = new Mock(a);  
      expect(a.foo.bind(a,1,2)).to.be.throw(UnexpectedCall, 'Unexpected call');
      expect(a.bar.bind(a,1,2)).to.be.throw(UnexpectedCall, 'Unexpected call');
    });
  });
  
  describe('expectCall', () => {
    it('Should return instance of new expectation object', () => {
      let a = new A();
      let aMock = new Mock(a);
      let exp = aMock.expectCall('foo').willOnce(() => 4);
      expect(exp).to.be.instanceof(Expectation);
    })

    it('Should throw exception on unknown function name provided', () => {
      let a = new A();
      let aMock = new Mock(a);
      expect(aMock.expectCall.bind(aMock, 'goo')).to
        .throw(Error, 'Unknown function');
    });

    it('Should put expectation only for given function', () => {
      let a = new A();
      let aMock = new Mock(a);
      aMock.expectCall('foo').willOnce(() => 4);
      expect(a.foo(1,2)).to.be.equal(4);
      expect(a.bar.bind(a,1,2)).to.be.throw(UnexpectedCall, 'Unexpected call');
    });
  });

  describe('mockedCall', () => {
    it('Should throw exception on no matching expectation found', () => {
      let a = new A();
      let aMock = new Mock(a);
      aMock.expectCall('foo').matching(1,2).willRepeatedly(() => 4);
      expect(a.foo(1,2)).to.be.equal(4);
      expect(a.foo.bind(a, 2, 1)).to.throw(UnexpectedCall, 'No matching expectation');
    });

    it('Should throw exception with proper formatting of failed call', () => {
      let a = new A();
      let aMock = new Mock(a);
      expect(() => a.foo('Hello', {x:1, y:2}, [1,2,3], false)).to.throw(UnexpectedCall, 'foo("Hello",{...},[...],false)');
      expect(() => a.bar(1.23, null, undefined, a.bar)).to.throw(UnexpectedCall, 'bar(1.23,null,undefined,function)');
    });
  });

  describe('verify', () => {
    it('Should not throw if no expectations were put', () => {
      let a = new A();
      let aMock = new Mock(a);
      expect(aMock.verify.bind(aMock)).not.to.throw;
    });

    it('Should cleanup all previously setup expectations', () => {
      let a = new A();
      let aMock = new Mock(a);
      aMock.expectCall('foo').willTwice(() => 4);
      aMock.expectCall('bar').willTwice(() => 4);
      a.foo();
      a.bar();
      expect(aMock.verify.bind(aMock)).to.throw(Error, 'Unresolved');
      expect(a.foo.bind(a)).to.throw(UnexpectedCall);
      expect(a.bar.bind(a)).to.throw(UnexpectedCall);
    });

    it('Should throw if there is at least one not saturated expectation', () => {
      let a = new A();
      let aMock = new Mock(a);
      aMock.expectCall('foo').willOnce(() => 4);
      aMock.expectCall('bar').willOnce(() => 4);
      expect(aMock.verify.bind(aMock)).to.throw(Error, 'Unresolved');

      aMock.expectCall('foo').willTwice(() => 4);
      a.foo(1,2);
      expect(aMock.verify.bind(aMock)).to.throw(Error, 'Unresolved');

      aMock.expectCall('bar').willOnce(() => 4);
      a.bar(3,4);
      expect(aMock.verify.bind(aMock)).not.to.throw;
    });

    it('Should work with callback api', () => {
      let a = new A();
      let aMock = new Mock(a);
      aMock.expectCall('foo').willOnce(() => 4);
      aMock.expectCall('bar').willOnce(() => 4);
      aMock.verify(err => {
        expect(err).to.be.instanceof(Error);
        expect(err.message).to.contain('Unresolved expectations');
      });
      aMock.expectCall('foo').willTwice(() => 4);
      a.foo(1,2);
      aMock.verify(err => {
        expect(err).to.be.instanceof(Error);
        expect(err.message).to.contain('Unresolved expectations');
      });
      aMock.expectCall('bar').willOnce(() => 4);
      a.bar(3,4);
      aMock.verify(err => {
        expect(err).to.be.null;
      });
    });
  });

  describe('cleanup', () => {
    it('Should restore original object functions', () => {
      let a = new A();
      let aMock = new Mock(a);
      aMock.expectCall('foo').willRepeatedly(() => 88);
      aMock.expectCall('bar').willRepeatedly(() => 99);

      expect(a.foo(1,1)).to.be.equal(88);
      expect(a.bar(8,5)).to.be.equal(99);
      expect(a.foo(3,2)).to.be.equal(88);
      aMock.verify();
      aMock.cleanup();

      expect(a.foo(1,1)).to.be.equal(2);
      expect(a.bar(8,5)).to.be.equal(40);
      expect(a.foo(3,2)).to.be.equal(5);
    });
  });
});