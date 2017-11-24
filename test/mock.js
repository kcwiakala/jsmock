'use strict';

const expect = require('chai').expect;
const Mock = require('../lib/mock');

describe('mock', () => {
  it('Should replace function of given object', () => {
    let foo = {
      bar: function(a, b) {
        return a + b;
      }
    }

    expect(foo.bar(1,3)).to.be.equal(4);

    let fooMock = new Mock(foo);

    expect(foo.bar.bind(foo)).to.throw(Error, 'Unexpected');

    fooMock.expectCall('bar')
      .matching((a,b) => a > b)
      .will((a, b) => a * b)
      .times(2);

    expect(foo.bar(6,3)).to.be.equal(18);
    expect(foo.bar(4,2)).to.be.equal(8);

    fooMock.expectCall('bar').will((a,b) => a - b).times(1);
    expect(foo.bar(4,2)).to.be.equal(2);

    fooMock.expectCall('bar').will((a,b) => 2*a + b);
    expect(foo.bar(4,2)).to.be.equal(10);

    fooMock.expectCall('bar', 1, 3).willOnce(() => 88);
    expect(foo.bar(1,3)).to.be.equal(88);

    fooMock.expectCall('bar')
      .matching(1, 3)
      .willOnce(() => 32);
    expect(foo.bar(1,3)).to.be.equal(32);

    fooMock.cleanup();

    expect(foo.bar(1,3)).to.be.equal(4);
  });
});