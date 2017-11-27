[![Build Status](https://travis-ci.org/kcwiakala/jsmock.svg?branch=master)](https://travis-ci.org/kcwiakala/jsmock)

# jsmock
Mocking framework for javascript

# Installation
*jsmock* is published on npm 

    > npm install --save-dev jsmock

# User Guide

    const Mock = require('jsmock').Mock

    let foo = {
      bar: (a, b) => {
        return a + b
      }
    }

    let fooMock = new Mock(foo);
    fooMock.expectCall('bar', 1, 3).willOnce((a,b) => a * b);

    expect(foo.bar(1,3)).to.be.equal(3);
    expect(foo.bar(1,3)).to.throw;