[![npm Package](https://img.shields.io/npm/v/jsmock.svg?style=flat-square)](https://www.npmjs.org/package/jsmock)
[![Build Status](https://travis-ci.org/kcwiakala/jsmock.svg?branch=master)](https://travis-ci.org/kcwiakala/jsmock)
[![Coverage Status](https://coveralls.io/repos/github/kcwiakala/jsmock/badge.svg?branch=master)](https://coveralls.io/github/kcwiakala/jsmock?branch=master)

# jsmock
Mocking framework for javascript, inspired by googlemock C++ framework.
This project is still under construction ...

# Installation
*jsmock* is published on npm 
```shell
npm install --save-dev jsmock
```

# User Guide
All examples provided below assume using *mocha/chai* test framework, although
*jsmock* can be used with any framework of your choice.

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
have been replaced and any call to *foo.bar* will cause an expectation to be thrown.

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
foo.bar(1,4); // KO

fooMock.expectCall('bar', 1, 8);
foo.bar(1, 8); // OK
foo.bar(1, 0); // KO 
```

Matcher can be specified directly in arguments of the *expectCall* method or by 
calling *matching* function on mock object. Note that *expectCall* returns mock 
object making call chain possible:
```javascript
fooMock.expectCall('bar').matching((a,b) => a < b);
fooMock.expectCall('bar').matching(1,4);
```

## Specifying Cardinality
Cardinality specifies number of expected calls to given function. *jsmock* provides
two ways of specifying expectation cardinality. It can be provided explicitly
through one of expectation methods, or it can be calculated automatically from
list of specified actions. If cardinality is specified explicitly it takes precedence
over one calculated from action list.
```javascript
fooMock.expectCall('bar').times(2); // Expect bar to be called twice
fooMock.expectCall('bar').atLeast(1); // Expect bar to be called at least one time
fooMock.expectCall('bar').atMost(4); // Expect bar to be called 1 - 4 times
fooMock.expectCall('bar').between(3,5); // Expect bar to be called 3 - 5 times

// Note that 
fooMock.expectCall('bar').atMost(MaxCallCount);
// is equivalent of 
fooMock.expectCall('bar').between(1, MaxCallCount);
```
Cardinality can be specified only once for given expectation.

## Specifying Actions
Action is an object encapsulating function to be executed instead of the original
code on mocked object. Each expectation can have multiple actions defined with 
specific cardinality. Actions are executed in the order of creation.
```javascript
fooMock.expectCall('bar')
  .willOnce((a,b) => a * b) // First call will return multiplication of arguments
  .willTwice((a,b) => a + b) // Second and third will return sum of arguments
  .willRepeatedly((a,b) => b); // All following calls will return second argument
```
If action specifying method is feed with function it will use it as a callback for
actual mocked function execution. If parameter of any other type is provided it will
be returned to the caller at execution time.
```javascript
fooMock.expectCall('bar')
  .willOnce(4) // Return 4 on first call
  .willTwice(7) // return 7 on next 2 calls
  .willRepeatedly(0); // All following calls will return 0
```

The *willRepeatedly* method specifies action with unlimited number of potential calls,
thus any other attempt to add more actions to the expectation will cause error. Also
note that *willRepeatedly* doesn't return expectation object so it isn't suitable for
chaining.

### Actions and Cardinality
Combination of cardinality and action specifiers can build virtually any expectation.
```javascript
fooMock.expectCall('bar')
  .times(5) // Total number of calls expected to be 5
  .willOnce(3) // First call returns 3
  .willRepeatedly(0); // Next 4 calls returns 0

fooMock.expectCall('bar')
  .atLeast(8)
  .willRepeatedly(1); // Will always return 1
```

## Verifying Mocks
Mock object will yield errors directly in case of unexpected calls or violation of
cardinality upper bound (more calls than expected). Verification of cardinality
lower bound has to be done explicitly by the user, at the end of the test. 
```javascript
let foo = new Foo();
let fooMock = new Mock(foo);
fooMock.expectCall('bar')
  .times(2) // Lower bound of the cardinality is 2
  .willRepeatedly(6);

expect(foo.bar()).to.be.equal(6); // We make only one call to bar 

fooMock.verify(); // Will throw Error 
```
Call to *verify* methods cleans up all previously setup expectations.

## Cleaning Mocks
Creation of the mock over an existing object modifies its functions. To restore 
object to its original state you need to explicitly call *cleanup* method. 
```javascript
const fs = require('fs');
const Mock = require('jsmock').Mock;

let fsMock = new Mock(fs);

// Setup some expectations
fsMock.expectCall('readdir')
  .willOnce((path, cb) => cb(null, ['index.html']));

testedObject.doSomeStuff();

fsMock.verify();

// Once you don't need to use fs in your tests
fsMock.cleanup();
```

# Examples

```javascript
it('Should perform some fs action', (done) => {
  let fsMock = new Mock(fs);
  fsMock.expectCall('readdir')
    .matching(path => path === '/tmp')
    .willOnce((path, cb) => cb(null, ['a.js', 'b.js']));

  foo.readTemp((err, files) => {
    expect(err).to.be.null;
    expect(files).to.deep.equal(['a.js', 'b.js']);
    fooMock.verify(done);
  });
});
```
