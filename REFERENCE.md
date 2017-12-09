## Classes

<dl>
<dt><a href="#Action">Action</a></dt>
<dd><p>Class specifying action to be executed on mocked function calls.</p>
</dd>
<dt><a href="#Cardinality">Cardinality</a></dt>
<dd><p>Describes number of expected function calls.</p>
</dd>
<dt><a href="#Expectation">Expectation</a></dt>
<dd><p>Class specifying function call expectation. 
Each expectation contains a <a href="#Matcher">matcher</a>, 
<a href="#Cardinality">cardinality</a> and a list of 
<a href="#Action">actions</a> to be executed.</p>
</dd>
<dt><a href="#Invoker">Invoker</a> ⇐ <code><a href="#Action">Action</a></code></dt>
<dd><p>Specialization of an Action invoking a provided callback 
argument. This implementation assumes that callback is 
provided as the last argument on the list.</p>
</dd>
<dt><a href="#Matcher">Matcher</a></dt>
<dd><p>Validates provided list of arguments.</p>
</dd>
<dt><a href="#WeakMatcher">WeakMatcher</a> ⇐ <code><a href="#Matcher">Matcher</a></code></dt>
<dd><p>Specialization of Matcher for weak argument list comparison.</p>
</dd>
<dt><a href="#Mock">Mock</a></dt>
<dd><p>Mock class for wrapping test subject dependencies.</p>
</dd>
</dl>

<a name="Action"></a>

## Action
Class specifying action to be executed on mocked function calls.

**Kind**: global class  

* [Action](#Action)
    * [new Action(action, counter)](#new_Action_new)
    * [.validate()](#Action+validate) ⇒ <code>Boolean</code>
    * [.available()](#Action+available) ⇒ <code>Boolean</code>
    * [.execute(args)](#Action+execute) ⇒ <code>\*</code>

<a name="new_Action_new"></a>

### new Action(action, counter)
**Throws**:

- <code>TypeErrpr</code> TypeError is thrown if specified number is defined and its type is not a Number.
- <code>Error</code> Error is thrown if provided counter value is 0. This value is reserved 
and can't be used for initializing actions.


| Param | Type | Description |
| --- | --- | --- |
| action | <code>Any</code> | If provided action is a function it will be executed with arguments provided to execute method. Parameter of any other type will produce action returning it upon execution. |
| counter | <code>Number</code> | Expected number of action execution times. Negative value will create action that can be executed any number of times. |

<a name="Action+validate"></a>

### action.validate() ⇒ <code>Boolean</code>
Determines if action has been executed expected number of times.

**Kind**: instance method of [<code>Action</code>](#Action)  
<a name="Action+available"></a>

### action.available() ⇒ <code>Boolean</code>
Determines if action can be executed.

**Kind**: instance method of [<code>Action</code>](#Action)  
**Returns**: <code>Boolean</code> - Returns true if action can be executed, false otherwise.  
<a name="Action+execute"></a>

### action.execute(args) ⇒ <code>\*</code>
Executes current action with provided arguments array.

**Kind**: instance method of [<code>Action</code>](#Action)  
**Returns**: <code>\*</code> - Propagates return value of internal action.  
**Throws**:

- <code>Error</code> Throws error if current action was already executed specified
number of times.


| Param | Type | Description |
| --- | --- | --- |
| args | <code>Array</code> | Array of arguments to be passed to the action function. |

<a name="Cardinality"></a>

## Cardinality
Describes number of expected function calls.

**Kind**: global class  

* [Cardinality](#Cardinality)
    * [new Cardinality(min, max)](#new_Cardinality_new)
    * [.set(min, max)](#Cardinality+set)
    * [.unbound()](#Cardinality+unbound)
    * [.bump(count)](#Cardinality+bump)
    * [.available()](#Cardinality+available) ⇒ <code>Boolean</code>
    * [.use()](#Cardinality+use) ⇒ <code>Boolean</code>
    * [.validate()](#Cardinality+validate) ⇒ <code>Boolean</code>

<a name="new_Cardinality_new"></a>

### new Cardinality(min, max)

| Param | Type | Description |
| --- | --- | --- |
| min | <code>Number</code> | Minimum number of expected calls. |
| max | <code>Number</code> | Maximum number of expected calls. |

<a name="Cardinality+set"></a>

### cardinality.set(min, max)
Sets new values of minimum and maximum expected calls.

**Kind**: instance method of [<code>Cardinality</code>](#Cardinality)  
**Throws**:

- <code>TypeError</code> Throws TypeError if min or max parameter is not a valid number.
- <code>Error</code> Error is thrown if given minimum expected calls value is negative,
or if given maximum expected calls value is positive lower than min.


| Param | Type | Description |
| --- | --- | --- |
| min | <code>Number</code> | Minimum number of expected calls. |
| max | <code>Number</code> | Maximum number of expected calls. |

<a name="Cardinality+unbound"></a>

### cardinality.unbound()
Removes upper bound from cardinality.

**Kind**: instance method of [<code>Cardinality</code>](#Cardinality)  
<a name="Cardinality+bump"></a>

### cardinality.bump(count)
Shifts the cardinality by a given number of expected calls.

**Kind**: instance method of [<code>Cardinality</code>](#Cardinality)  
**Throws**:

- <code>TypeError</code> Throws TypeError if count parameter is not a valid number.
- <code>Error</code> Error is thrown if given count is lower or equal to 0.


| Param | Type | Description |
| --- | --- | --- |
| count | <code>Number</code> | Number of additional expected calls. |

<a name="Cardinality+available"></a>

### cardinality.available() ⇒ <code>Boolean</code>
Checks if cardinality allows for more calls.

**Kind**: instance method of [<code>Cardinality</code>](#Cardinality)  
**Returns**: <code>Boolean</code> - True if cardinality allows at least one more call, 
false otherwise.  
<a name="Cardinality+use"></a>

### cardinality.use() ⇒ <code>Boolean</code>
Uses one call from cardinality.

**Kind**: instance method of [<code>Cardinality</code>](#Cardinality)  
**Returns**: <code>Boolean</code> - True if call didn't cause exceeding cardinality upper
bound, false otherwise.  
<a name="Cardinality+validate"></a>

### cardinality.validate() ⇒ <code>Boolean</code>
Validates that cardinality was used expected number of times.

**Kind**: instance method of [<code>Cardinality</code>](#Cardinality)  
**Returns**: <code>Boolean</code> - True if number of calls lies in defined range, false otherwise.  
<a name="Expectation"></a>

## Expectation
Class specifying function call expectation. 
Each expectation contains a [matcher](#Matcher), 
[cardinality](#Cardinality) and a list of 
[actions](#Action) to be executed.

**Kind**: global class  

* [Expectation](#Expectation)
    * [new Expectation(args)](#new_Expectation_new)
    * [.isMatching(args)](#Expectation+isMatching) ⇒ <code>Boolean</code>
    * [.isSaturated()](#Expectation+isSaturated) ⇒ <code>Boolean</code>
    * [.validate()](#Expectation+validate) ⇒ <code>Boolean</code>
    * [.times(count)](#Expectation+times)
    * [.atLeast(count)](#Expectation+atLeast)
    * [.atMost(count)](#Expectation+atMost)
    * [.between(min, max)](#Expectation+between)
    * [.matching()](#Expectation+matching) ⇒ [<code>Expectation</code>](#Expectation)
    * [.with()](#Expectation+with)
    * [.matchingAtLeast()](#Expectation+matchingAtLeast) ⇒ [<code>Expectation</code>](#Expectation)
    * [.withAtLeast()](#Expectation+withAtLeast)
    * [.willOnce(action)](#Expectation+willOnce) ⇒ [<code>Expectation</code>](#Expectation)
    * [.willTwice(action)](#Expectation+willTwice) ⇒ [<code>Expectation</code>](#Expectation)
    * [.willRepeatedly(action)](#Expectation+willRepeatedly)
    * [.willOnceInvoke()](#Expectation+willOnceInvoke) ⇒ [<code>Expectation</code>](#Expectation)
    * [.willTwiceInvoke()](#Expectation+willTwiceInvoke) ⇒ [<code>Expectation</code>](#Expectation)
    * [.willRepeatedlyInvoke()](#Expectation+willRepeatedlyInvoke)
    * [.execute(args)](#Expectation+execute) ⇒ <code>\*</code>

<a name="new_Expectation_new"></a>

### new Expectation(args)

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Array</code> | Array of arguments to be used for creation of matcher object |

<a name="Expectation+isMatching"></a>

### expectation.isMatching(args) ⇒ <code>Boolean</code>
Checks if given argument list fits the expectation matcher.

**Kind**: instance method of [<code>Expectation</code>](#Expectation)  
**Returns**: <code>Boolean</code> - Returns result of applying provided arguments to matcher function.  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Array</code> | Array of arguments to be validated |

<a name="Expectation+isSaturated"></a>

### expectation.isSaturated() ⇒ <code>Boolean</code>
Determines if expectation has been already executed maximum 
expected number of times.

**Kind**: instance method of [<code>Expectation</code>](#Expectation)  
<a name="Expectation+validate"></a>

### expectation.validate() ⇒ <code>Boolean</code>
Validates the expectation.

**Kind**: instance method of [<code>Expectation</code>](#Expectation)  
**Returns**: <code>Boolean</code> - Returns true if expectation cardinality is fulfilled, false otherwise.  
<a name="Expectation+times"></a>

### expectation.times(count)
Specifies expectation cardinality to given number of expected calls.

**Kind**: instance method of [<code>Expectation</code>](#Expectation)  

| Param | Type | Description |
| --- | --- | --- |
| count | <code>Number</code> | Expected number of calls |

<a name="Expectation+atLeast"></a>

### expectation.atLeast(count)
Specifies number of expectation matching calls to be equal or greater
of given number.

**Kind**: instance method of [<code>Expectation</code>](#Expectation)  

| Param | Type | Description |
| --- | --- | --- |
| count | <code>Number</code> | Minimal number of expected matching calls. |

<a name="Expectation+atMost"></a>

### expectation.atMost(count)
Specifies number of expectation matching calls to be at least 1, 
but not greater than given number.

**Kind**: instance method of [<code>Expectation</code>](#Expectation)  

| Param | Type | Description |
| --- | --- | --- |
| count | <code>Number</code> | Maximal number of expected matching calls. |

<a name="Expectation+between"></a>

### expectation.between(min, max)
Specifies number of expectation matching calls to lie in given range.

**Kind**: instance method of [<code>Expectation</code>](#Expectation)  

| Param | Type | Description |
| --- | --- | --- |
| min | <code>Number</code> | Minimal number of expected matching calls. |
| max | <code>Number</code> | Maximal number of expected matching calls. |

<a name="Expectation+matching"></a>

### expectation.matching() ⇒ [<code>Expectation</code>](#Expectation)
Creates expectation matcher from provided arguments.

**Kind**: instance method of [<code>Expectation</code>](#Expectation)  
**Returns**: [<code>Expectation</code>](#Expectation) - Returns current instance of the expectation for chaining.  
<a name="Expectation+with"></a>

### expectation.with()
Alias of matching method

**Kind**: instance method of [<code>Expectation</code>](#Expectation)  
<a name="Expectation+matchingAtLeast"></a>

### expectation.matchingAtLeast() ⇒ [<code>Expectation</code>](#Expectation)
Creates weak expectation matcher from given arguments. Weak matcher
will yield match if at least n first specified arguments match. Actual
call can contain more arguments.

**Kind**: instance method of [<code>Expectation</code>](#Expectation)  
**Returns**: [<code>Expectation</code>](#Expectation) - Returns current instance of the expectation for chaining.  
<a name="Expectation+withAtLeast"></a>

### expectation.withAtLeast()
Alias of matchingAtLeast

**Kind**: instance method of [<code>Expectation</code>](#Expectation)  
<a name="Expectation+willOnce"></a>

### expectation.willOnce(action) ⇒ [<code>Expectation</code>](#Expectation)
Adds a new action from provided arguments and adds it to
expectation action list. Newly created Action has expected
execution count set to 1.

**Kind**: instance method of [<code>Expectation</code>](#Expectation)  
**Returns**: [<code>Expectation</code>](#Expectation) - Returns current instance of the expectation for chaining.  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>\*</code> | Parameter passed for Action constructor |

<a name="Expectation+willTwice"></a>

### expectation.willTwice(action) ⇒ [<code>Expectation</code>](#Expectation)
Adds a new action from provided arguments and adds it to
expectation action list. Newly created Action has expected
execution count set to 2.

**Kind**: instance method of [<code>Expectation</code>](#Expectation)  
**Returns**: [<code>Expectation</code>](#Expectation) - Returns current instance of the expectation for chaining.  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>\*</code> | Parameter passed for Action constructor |

<a name="Expectation+willRepeatedly"></a>

### expectation.willRepeatedly(action)
Adds a new action from provided arguments and adds it to
expectation action list. Newly created Action has unbounded
execution count.

**Kind**: instance method of [<code>Expectation</code>](#Expectation)  

| Param | Type | Description |
| --- | --- | --- |
| action | <code>\*</code> | Parameter passed for Action constructor |

<a name="Expectation+willOnceInvoke"></a>

### expectation.willOnceInvoke() ⇒ [<code>Expectation</code>](#Expectation)
Adds a new invoker action, that will call callback passed
on execution time with given arguments. Newly created Invoker
has expected execution count set to 1.

**Kind**: instance method of [<code>Expectation</code>](#Expectation)  
**Returns**: [<code>Expectation</code>](#Expectation) - Returns current instance of the expectation for chaining.  
<a name="Expectation+willTwiceInvoke"></a>

### expectation.willTwiceInvoke() ⇒ [<code>Expectation</code>](#Expectation)
Adds a new invoker action, that will call callback passed
on execution time with given arguments. Newly created Invoker
has expected execution count set to 2.

**Kind**: instance method of [<code>Expectation</code>](#Expectation)  
**Returns**: [<code>Expectation</code>](#Expectation) - Returns current instance of the expectation for chaining.  
<a name="Expectation+willRepeatedlyInvoke"></a>

### expectation.willRepeatedlyInvoke()
Adds a new invoker action, that will call callback passed
on execution time with given arguments. Newly created Invoker
has unbounded execution time.

**Kind**: instance method of [<code>Expectation</code>](#Expectation)  
<a name="Expectation+execute"></a>

### expectation.execute(args) ⇒ <code>\*</code>
**Kind**: instance method of [<code>Expectation</code>](#Expectation)  
**Returns**: <code>\*</code> - If no action was specified for the expectation, will return no value.
If there is an action to be executed returns result of that execution.  
**Throws**:

- <code>Error</code> Throws error if none of specified actions are valid for execution


| Param | Type |
| --- | --- |
| args | <code>Array</code> | 

<a name="Invoker"></a>

## Invoker ⇐ [<code>Action</code>](#Action)
Specialization of an Action invoking a provided callback 
argument. This implementation assumes that callback is 
provided as the last argument on the list.

**Kind**: global class  
**Extends**: [<code>Action</code>](#Action)  

* [Invoker](#Invoker) ⇐ [<code>Action</code>](#Action)
    * [new Invoker(args, counter)](#new_Invoker_new)
    * [.validate()](#Action+validate) ⇒ <code>Boolean</code>
    * [.available()](#Action+available) ⇒ <code>Boolean</code>
    * [.execute(args)](#Action+execute) ⇒ <code>\*</code>

<a name="new_Invoker_new"></a>

### new Invoker(args, counter)

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Array</code> | Array of arguments to be passed to callback on execution time. |
| counter | <code>Number</code> | Action cardinality |

<a name="Action+validate"></a>

### invoker.validate() ⇒ <code>Boolean</code>
Determines if action has been executed expected number of times.

**Kind**: instance method of [<code>Invoker</code>](#Invoker)  
<a name="Action+available"></a>

### invoker.available() ⇒ <code>Boolean</code>
Determines if action can be executed.

**Kind**: instance method of [<code>Invoker</code>](#Invoker)  
**Returns**: <code>Boolean</code> - Returns true if action can be executed, false otherwise.  
<a name="Action+execute"></a>

### invoker.execute(args) ⇒ <code>\*</code>
Executes current action with provided arguments array.

**Kind**: instance method of [<code>Invoker</code>](#Invoker)  
**Returns**: <code>\*</code> - Propagates return value of internal action.  
**Throws**:

- <code>Error</code> Throws error if current action was already executed specified
number of times.


| Param | Type | Description |
| --- | --- | --- |
| args | <code>Array</code> | Array of arguments to be passed to the action function. |

<a name="Matcher"></a>

## Matcher
Validates provided list of arguments.

**Kind**: global class  

* [Matcher](#Matcher)
    * [new Matcher(args)](#new_Matcher_new)
    * [.check(args)](#Matcher+check) ⇒ <code>Boolean</code>

<a name="new_Matcher_new"></a>

### new Matcher(args)
Creates Matcher from given arguments


| Param | Type | Description |
| --- | --- | --- |
| args | <code>Array</code> | If no argument is provided creates default matcher which validates any arguments.If array contains single element of  function type, creates a predicate matcher from provided  function. Otherwise creates matcher that will validate arguments against given array. |

<a name="Matcher+check"></a>

### matcher.check(args) ⇒ <code>Boolean</code>
Checks given argument list against matcher.

**Kind**: instance method of [<code>Matcher</code>](#Matcher)  
**Returns**: <code>Boolean</code> - Returns true if given argument list passes the matcher test.  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Array</code> | Array of arguments used for validation |

<a name="WeakMatcher"></a>

## WeakMatcher ⇐ [<code>Matcher</code>](#Matcher)
Specialization of Matcher for weak argument list comparison.

**Kind**: global class  
**Extends**: [<code>Matcher</code>](#Matcher)  

* [WeakMatcher](#WeakMatcher) ⇐ [<code>Matcher</code>](#Matcher)
    * [new WeakMatcher()](#new_WeakMatcher_new)
    * [.check(args)](#Matcher+check) ⇒ <code>Boolean</code>

<a name="new_WeakMatcher_new"></a>

### new WeakMatcher()
Passes all arguments to parent constructor.

<a name="Matcher+check"></a>

### weakMatcher.check(args) ⇒ <code>Boolean</code>
Checks given argument list against matcher.

**Kind**: instance method of [<code>WeakMatcher</code>](#WeakMatcher)  
**Returns**: <code>Boolean</code> - Returns true if given argument list passes the matcher test.  

| Param | Type | Description |
| --- | --- | --- |
| args | <code>Array</code> | Array of arguments used for validation |

<a name="Mock"></a>

## Mock
Mock class for wrapping test subject dependencies.

**Kind**: global class  

* [Mock](#Mock)
    * [new Mock(object)](#new_Mock_new)
    * [.expectCall(functionName)](#Mock+expectCall) ⇒ [<code>Expectation</code>](#Expectation)
    * [.verify(done)](#Mock+verify)
    * [.cleanup()](#Mock+cleanup)

<a name="new_Mock_new"></a>

### new Mock(object)

| Param | Type | Description |
| --- | --- | --- |
| object | <code>Object</code> | Object to be mocked. |

<a name="Mock+expectCall"></a>

### mock.expectCall(functionName) ⇒ [<code>Expectation</code>](#Expectation)
Creates Expectation for function with given name.

**Kind**: instance method of [<code>Mock</code>](#Mock)  
**Returns**: [<code>Expectation</code>](#Expectation) - Returns newly created Expectation object  
**Throws**:

- <code>Error</code> Error is thrown if given function name doesn't match any of 
functions from mocked object.


| Param | Type | Description |
| --- | --- | --- |
| functionName | <code>String</code> | Name of the function for which the call is expected. |

<a name="Mock+verify"></a>

### mock.verify(done)
Verifies if all expectations on mock object were fulfilled.

**Kind**: instance method of [<code>Mock</code>](#Mock)  
**Throws**:

- <code>Error</code> If no callback provided, method throws Error containing list of mocked 
object functions with unresolved expectations.


| Param | Type | Description |
| --- | --- | --- |
| done | <code>function</code> | Optional callback parameter. If provided, function want throw expectation but will pass error to callback. If verification succeeds callback is called with null. |

<a name="Mock+cleanup"></a>

### mock.cleanup()
Restores original functions in mocked object.

**Kind**: instance method of [<code>Mock</code>](#Mock)  
