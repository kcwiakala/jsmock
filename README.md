[![npm Package](https://img.shields.io/npm/v/jsmock.svg?style=flat-square)](https://www.npmjs.org/package/jsmock)
[![Build Status](https://travis-ci.org/kcwiakala/jsmock.svg?branch=master)](https://travis-ci.org/kcwiakala/jsmock)

# jsmock
Mocking framework for javascript, inspired by googlemock C++ framework.
This project is still under construction ...

# Installation
*jsmock* is published on npm 

    > npm install --save-dev jsmock

# User Guide

## Creating Mocks
```javascript
const Mock = require('jsmock').Mock;

let foo = {
  bar: (a, b) => {
    return a + b
  }
};

let fooMock = new Mock(foo);
```
Now *fooMock* is a mock object wrapping *foo*. All functions of original object
have been replaced and any call to *foo.bar* will cause an expection to be thrown.

```javascript
expect(foo.bar.bind(foo)).to.throw(Error);
```

## Defining Expectation
Expectation of function call is defined by calling *expectCall* on mock object.
```javascript
fooMock.expectCall('bar');
```
By default this will setup an expectation of single call to foo.bar function with
any arguments. As there is no action specified yet, nothing will be returned and
no side effects will be observed. 

## Specifying Matcher
Matcher validates that call of mocked function is valid for given expectation. If
no explicit matcher is specified expectation will be executed for any call to
mocked function. Matcher can be specified as a predicate or simply as an arguments
list to be verified against actual call.

```javascript
fooMock.expectCall('bar', (a,b) => a > b);
foo.bar(3,2); // OK - 3 > 2
foo.bar(1,4); // KO - excpetion thrown

fooMock.expectCall('bar', 1, 8);
foo.bar(1, 8); // OK
foo.bar(1, 0); // KO 
```

Mathcher can be specified directly in arguments of the *expectCall* method or by 
calling *matching* function on mock object. Note that *expectCall* returns mock 
object making call chain possible:
```javascript
fooMock.expectCall('bar').matching((a,b) => a < b);
fooMock.expectCall('bar').matching(1,4);
```

## Specifying Actions
Action is an object encapsulating function to be executed instead of original
code on mocked object. Besides a function each action specifies also number of
times it's expected to be called. Each expectation can have multiple actions 
defined, which will be executed in order of creation.
```javascript
fooMock.expectCall('bar')
  .willOnce((a,b) => a * b) // First call will return multiplication of arguments
  .willRepeteadly((a,b) => b) // All following calls will return second argument
```
You need to pay attention to order of specifying actions. If an action with 
unlimited number of expected calls preceeds other actions, it will prevent their
execution and cause mock to be invalid.

# Examples