[![npm Package](https://img.shields.io/npm/v/jsmock.svg?style=flat-square)](https://www.npmjs.org/package/jsmock)
[![Build Status](https://travis-ci.org/kcwiakala/jsmock.svg?branch=master)](https://travis-ci.org/kcwiakala/jsmock)
[![Coverage Status](https://coveralls.io/repos/github/kcwiakala/jsmock/badge.svg?branch=master)](https://coveralls.io/github/kcwiakala/jsmock?branch=master)

# jsmock
Mocking framework for javascript, inspired by googlemock C++ framework.
This project is still under construction ...

  * [Installation](#installation)
  * [User Guide](#user-guide)
    * [Creating Mocks](#creating-mocks)
    * [Defining Expectations](#defining-expectations)
      * [General Syntax](#general-syntax)
      * [Specifying Matcher](#specifying-matcher)
      * [Specifying Cardinality](#specifying-cardinality)
      * [Adding Actions](#adding-actions)
    * [Verifying Mocks](#verifying-mocks)
    * [Cleaning Mocks](#cleaning-mocks)
  * [Examples](#examples)

# Installation
*jsmock* is published on npm 
```shell
npm install --save-dev jsmock
```

# User Guide
All examples provided below assume using *mocha/chai* test framework, although
*jsmock* can be used with any framework of your choice.

Mock provides an API to define and verify expectations on all function calls 
performed on reference to original object. A standard unit test involving mocks
will consist of following steps:
1. Mock external dependencies of the test subject
2. Define expectations on created mocks
3. Execute actual tests on the subject
4. Verify mock objects
5. Cleanup

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
have been replaced and any call to *foo.bar* will cause an UnexpectedCall error
 to be thrown.

```javascript
expect(foo.bar.bind(foo)).to.throw(Error);
```

## Defining Expectations
`Expectation` is a main component of a mock oriented test. It describes what kind
of interactions with mocked object are expected during test execution. In addition
`Expectation` also defines the actions that should be taken to _mock_ the original
object behavior.

`Expectation` for given function is defined by 3 objects:
* Matcher
* Cardinality
* Action List

__Matcher__ decides if current function call is valid for the expectation. Usually
it means that function was called with expected argument list. __Cardinality__ 
describes how many times the expected call should occur. Consequently __Action List__
provides actions to be performed by mocked object for each call.

### General Syntax
Expectation is created by calling `expectCall` on mock object. Then it can be set up
with dedicated methods:
```javascript
fooMock.expectCall('bar')
  .matching(1, 4)
  .times(4)
  .willOnce((a, b) => a + b)
  .willRepeatedly((a, b) => a - b);
```
Above code will create expectation on call to `foo.bar(1,4)` that should happen
exactly 4 times. On the first call sum of the arguments will be returned, following
3 call with return their difference. 

### Specifying Matcher
Matcher is an object checking that call of mocked function is valid for given 
expectation. If no explicit matcher is specified expectation will be executed for 
any call to mocked function. Matcher can be specified as a predicate or simply as 
an arguments list to be verified against actual call. 

In *jsmock* matchers come in 3 flavours:
* Predicate Matcher - applies call arguments to provided predicate
* Strict Argument Matcher - call argument list must match exactly matcher argument list 
* Weak Argument Matcher - first `N` call arguments must match matcher argument list 

Matcher can be specified during `Expectation` creation with  `expectCall` function, 
or later with one of available `Expectation` methods. 

| Method | Description |
|--------|-------------|
| `Mock.expectCall(fn, ...args)`         | Creates an expectation with Strict Argument Matcher from `...args`|
| `Expectation.matching(...args)`        | Creates a Strict Argument Matcher from `...args` |
| `Expectation.with(...args)`            | Alias of  `Expectation.matching` |
| `Expectation.matchingAtLeast(...args)` | Creates a Weak Argument Matcher from `...args` |
| `Expectation.withAtLest(...args)`      | Alias of  `Expectation.matchingAtLeast` |

Predicate Matcher is created automatically if one of above methods is called with 
only one argument that happens to be a function.

```javascript
fooMock.expectCall('bar', (a,b) => a > b); // Predicate Matcher
foo.bar(3,2); // OK - 3 > 2
foo.bar(1,4); // KO

fooMock.expectCall('bar', 1, 8); // Strict Argument Matcher
foo.bar(1,8); // OK
foo.bar(1,0); // KO 

fooMock.expectCall('bar').with(5,6); // Strict Argument Matcher
foo.bar(5,6); // OK
foo.bar(5,1); // KO 

fooMock.expectCall('bar').matchingAtLeast(3); // Weak Argument Matcher
foo.bar(3,6); // OK
foo.bar(3,9); // OK 
foo.bar(1,3); // KO 
```

#### Argument Type Matchers
*jsmock* comes with a family of predefined argument type matchers, that can be helpful
if we care more about the type of argument provided to the call than its actual value.
| Matcher | Description |
|---------|-------------|
| `Matcher.ANY`      | Checks only presence of an argument in a call, doesn't care about actual type |
| `Matcher.OBJECT`   | Checks if given argument is an object |
| `Matcher.NUMBER`   | Checks if given argument is a number |
| `Matcher.STRING`   | Checks if given argument is a string |
| `Matcher.BOOLEAN`  | Checks if given argument is a boolean |
| `Matcher.FUNCTION` | Checks if given argument is a function |
| `Matcher.ARRAY`    | Checks if given argument is an array |

```javascript
const Matcher = require('jsmock').Matcher;

fooMock.expectCall('bar').with(Matcher.ANY, Matcher.NUMBER);
foo.bar(1,2); // OK
foo.bar('a',2); // OK
foo.bar([1,2,3], true); // KO
```

### Specifying Cardinality
Cardinality specifies number of expected calls to given function. *jsmock* provides
two ways of specifying expectation cardinality. It can be provided explicitly
through one of expectation methods, or it can be calculated automatically from
list of specified actions. If cardinality is specified explicitly it takes precedence
over one calculated from action list.

| Method | Description |
|--------|-------------|
| `Expectation.times(N)`     | Matching call should occur exactly `N` times |
| `Expectation.atLeast(N)`   | Matching call should occur at least `N` times |
| `Expectation.atMost(N)`    | Matching call should occur at least once and at most `N` times |
| `Expectation.between(M,N)` | Matching call should occur at least `M` times and at most `N` times |

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

### Adding Actions
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

In `nodejs` (and `js` in general) it's very common to provide callback as the last argument 
in the function call. Often the only purpose of the mock is to execute that callback with some
predefined arguments. This kind of action can be created easily using *will...Invoke* versions
of action create methods
```javascript
fsMock.expectCall('readdir')
  .willOnceInvoke(null, ['a.js', 'b.js']);

// Which is equivalent of
fsMock.expectCall('readdir')
  .willOnce((path, cb) => cb(null, ['a.js', 'b.js']));
```

| Method | Description |
|--------|-------------|
| `Expectation.willOnce(k)`                   | Adds an action to be executed once |
| `Expectation.willTwice(k)`                  | Adds an action to be executed twice |
| `Expectation.willRepeatedly(k)`             | Adds an action to be executed until expectation cardinality is fulfilled |
| `Expectation.willOnceInvoke(...args)`       | Adds an invoker action to be executed once |
| `Expectation.willTwiceInvoke(...args)`      | Adds an invoker action to be executed twice |
| `Expectation.willRepeatedlyInvoke(...args)` | Adds an invoker action to be executed until expectation cardinality is fulfilled |

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
Some examples of potential "real life" usage can be found in 
[example.js](/test/example.js) test file.
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
