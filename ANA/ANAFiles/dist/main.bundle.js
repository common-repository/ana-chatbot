webpackJsonp(["main"],{

/***/ "../../../../../../node_modules/underscore/underscore.js":
/***/ (function(module, exports, __webpack_require__) {

var __WEBPACK_AMD_DEFINE_ARRAY__, __WEBPACK_AMD_DEFINE_RESULT__;//     Underscore.js 1.8.3
//     http://underscorejs.org
//     (c) 2009-2015 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
//     Underscore may be freely distributed under the MIT license.

(function() {

  // Baseline setup
  // --------------

  // Establish the root object, `window` in the browser, or `exports` on the server.
  var root = this;

  // Save the previous value of the `_` variable.
  var previousUnderscore = root._;

  // Save bytes in the minified (but not gzipped) version:
  var ArrayProto = Array.prototype, ObjProto = Object.prototype, FuncProto = Function.prototype;

  // Create quick reference variables for speed access to core prototypes.
  var
    push             = ArrayProto.push,
    slice            = ArrayProto.slice,
    toString         = ObjProto.toString,
    hasOwnProperty   = ObjProto.hasOwnProperty;

  // All **ECMAScript 5** native function implementations that we hope to use
  // are declared here.
  var
    nativeIsArray      = Array.isArray,
    nativeKeys         = Object.keys,
    nativeBind         = FuncProto.bind,
    nativeCreate       = Object.create;

  // Naked function reference for surrogate-prototype-swapping.
  var Ctor = function(){};

  // Create a safe reference to the Underscore object for use below.
  var _ = function(obj) {
    if (obj instanceof _) return obj;
    if (!(this instanceof _)) return new _(obj);
    this._wrapped = obj;
  };

  // Export the Underscore object for **Node.js**, with
  // backwards-compatibility for the old `require()` API. If we're in
  // the browser, add `_` as a global object.
  if (true) {
    if (typeof module !== 'undefined' && module.exports) {
      exports = module.exports = _;
    }
    exports._ = _;
  } else {
    root._ = _;
  }

  // Current version.
  _.VERSION = '1.8.3';

  // Internal function that returns an efficient (for current engines) version
  // of the passed-in callback, to be repeatedly applied in other Underscore
  // functions.
  var optimizeCb = function(func, context, argCount) {
    if (context === void 0) return func;
    switch (argCount == null ? 3 : argCount) {
      case 1: return function(value) {
        return func.call(context, value);
      };
      case 2: return function(value, other) {
        return func.call(context, value, other);
      };
      case 3: return function(value, index, collection) {
        return func.call(context, value, index, collection);
      };
      case 4: return function(accumulator, value, index, collection) {
        return func.call(context, accumulator, value, index, collection);
      };
    }
    return function() {
      return func.apply(context, arguments);
    };
  };

  // A mostly-internal function to generate callbacks that can be applied
  // to each element in a collection, returning the desired result — either
  // identity, an arbitrary callback, a property matcher, or a property accessor.
  var cb = function(value, context, argCount) {
    if (value == null) return _.identity;
    if (_.isFunction(value)) return optimizeCb(value, context, argCount);
    if (_.isObject(value)) return _.matcher(value);
    return _.property(value);
  };
  _.iteratee = function(value, context) {
    return cb(value, context, Infinity);
  };

  // An internal function for creating assigner functions.
  var createAssigner = function(keysFunc, undefinedOnly) {
    return function(obj) {
      var length = arguments.length;
      if (length < 2 || obj == null) return obj;
      for (var index = 1; index < length; index++) {
        var source = arguments[index],
            keys = keysFunc(source),
            l = keys.length;
        for (var i = 0; i < l; i++) {
          var key = keys[i];
          if (!undefinedOnly || obj[key] === void 0) obj[key] = source[key];
        }
      }
      return obj;
    };
  };

  // An internal function for creating a new object that inherits from another.
  var baseCreate = function(prototype) {
    if (!_.isObject(prototype)) return {};
    if (nativeCreate) return nativeCreate(prototype);
    Ctor.prototype = prototype;
    var result = new Ctor;
    Ctor.prototype = null;
    return result;
  };

  var property = function(key) {
    return function(obj) {
      return obj == null ? void 0 : obj[key];
    };
  };

  // Helper for collection methods to determine whether a collection
  // should be iterated as an array or as an object
  // Related: http://people.mozilla.org/~jorendorff/es6-draft.html#sec-tolength
  // Avoids a very nasty iOS 8 JIT bug on ARM-64. #2094
  var MAX_ARRAY_INDEX = Math.pow(2, 53) - 1;
  var getLength = property('length');
  var isArrayLike = function(collection) {
    var length = getLength(collection);
    return typeof length == 'number' && length >= 0 && length <= MAX_ARRAY_INDEX;
  };

  // Collection Functions
  // --------------------

  // The cornerstone, an `each` implementation, aka `forEach`.
  // Handles raw objects in addition to array-likes. Treats all
  // sparse array-likes as if they were dense.
  _.each = _.forEach = function(obj, iteratee, context) {
    iteratee = optimizeCb(iteratee, context);
    var i, length;
    if (isArrayLike(obj)) {
      for (i = 0, length = obj.length; i < length; i++) {
        iteratee(obj[i], i, obj);
      }
    } else {
      var keys = _.keys(obj);
      for (i = 0, length = keys.length; i < length; i++) {
        iteratee(obj[keys[i]], keys[i], obj);
      }
    }
    return obj;
  };

  // Return the results of applying the iteratee to each element.
  _.map = _.collect = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length,
        results = Array(length);
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      results[index] = iteratee(obj[currentKey], currentKey, obj);
    }
    return results;
  };

  // Create a reducing function iterating left or right.
  function createReduce(dir) {
    // Optimized iterator function as using arguments.length
    // in the main function will deoptimize the, see #1991.
    function iterator(obj, iteratee, memo, keys, index, length) {
      for (; index >= 0 && index < length; index += dir) {
        var currentKey = keys ? keys[index] : index;
        memo = iteratee(memo, obj[currentKey], currentKey, obj);
      }
      return memo;
    }

    return function(obj, iteratee, memo, context) {
      iteratee = optimizeCb(iteratee, context, 4);
      var keys = !isArrayLike(obj) && _.keys(obj),
          length = (keys || obj).length,
          index = dir > 0 ? 0 : length - 1;
      // Determine the initial value if none is provided.
      if (arguments.length < 3) {
        memo = obj[keys ? keys[index] : index];
        index += dir;
      }
      return iterator(obj, iteratee, memo, keys, index, length);
    };
  }

  // **Reduce** builds up a single result from a list of values, aka `inject`,
  // or `foldl`.
  _.reduce = _.foldl = _.inject = createReduce(1);

  // The right-associative version of reduce, also known as `foldr`.
  _.reduceRight = _.foldr = createReduce(-1);

  // Return the first value which passes a truth test. Aliased as `detect`.
  _.find = _.detect = function(obj, predicate, context) {
    var key;
    if (isArrayLike(obj)) {
      key = _.findIndex(obj, predicate, context);
    } else {
      key = _.findKey(obj, predicate, context);
    }
    if (key !== void 0 && key !== -1) return obj[key];
  };

  // Return all the elements that pass a truth test.
  // Aliased as `select`.
  _.filter = _.select = function(obj, predicate, context) {
    var results = [];
    predicate = cb(predicate, context);
    _.each(obj, function(value, index, list) {
      if (predicate(value, index, list)) results.push(value);
    });
    return results;
  };

  // Return all the elements for which a truth test fails.
  _.reject = function(obj, predicate, context) {
    return _.filter(obj, _.negate(cb(predicate)), context);
  };

  // Determine whether all of the elements match a truth test.
  // Aliased as `all`.
  _.every = _.all = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (!predicate(obj[currentKey], currentKey, obj)) return false;
    }
    return true;
  };

  // Determine if at least one element in the object matches a truth test.
  // Aliased as `any`.
  _.some = _.any = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = !isArrayLike(obj) && _.keys(obj),
        length = (keys || obj).length;
    for (var index = 0; index < length; index++) {
      var currentKey = keys ? keys[index] : index;
      if (predicate(obj[currentKey], currentKey, obj)) return true;
    }
    return false;
  };

  // Determine if the array or object contains a given item (using `===`).
  // Aliased as `includes` and `include`.
  _.contains = _.includes = _.include = function(obj, item, fromIndex, guard) {
    if (!isArrayLike(obj)) obj = _.values(obj);
    if (typeof fromIndex != 'number' || guard) fromIndex = 0;
    return _.indexOf(obj, item, fromIndex) >= 0;
  };

  // Invoke a method (with arguments) on every item in a collection.
  _.invoke = function(obj, method) {
    var args = slice.call(arguments, 2);
    var isFunc = _.isFunction(method);
    return _.map(obj, function(value) {
      var func = isFunc ? method : value[method];
      return func == null ? func : func.apply(value, args);
    });
  };

  // Convenience version of a common use case of `map`: fetching a property.
  _.pluck = function(obj, key) {
    return _.map(obj, _.property(key));
  };

  // Convenience version of a common use case of `filter`: selecting only objects
  // containing specific `key:value` pairs.
  _.where = function(obj, attrs) {
    return _.filter(obj, _.matcher(attrs));
  };

  // Convenience version of a common use case of `find`: getting the first object
  // containing specific `key:value` pairs.
  _.findWhere = function(obj, attrs) {
    return _.find(obj, _.matcher(attrs));
  };

  // Return the maximum element (or element-based computation).
  _.max = function(obj, iteratee, context) {
    var result = -Infinity, lastComputed = -Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value > result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed > lastComputed || computed === -Infinity && result === -Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Return the minimum element (or element-based computation).
  _.min = function(obj, iteratee, context) {
    var result = Infinity, lastComputed = Infinity,
        value, computed;
    if (iteratee == null && obj != null) {
      obj = isArrayLike(obj) ? obj : _.values(obj);
      for (var i = 0, length = obj.length; i < length; i++) {
        value = obj[i];
        if (value < result) {
          result = value;
        }
      }
    } else {
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index, list) {
        computed = iteratee(value, index, list);
        if (computed < lastComputed || computed === Infinity && result === Infinity) {
          result = value;
          lastComputed = computed;
        }
      });
    }
    return result;
  };

  // Shuffle a collection, using the modern version of the
  // [Fisher-Yates shuffle](http://en.wikipedia.org/wiki/Fisher–Yates_shuffle).
  _.shuffle = function(obj) {
    var set = isArrayLike(obj) ? obj : _.values(obj);
    var length = set.length;
    var shuffled = Array(length);
    for (var index = 0, rand; index < length; index++) {
      rand = _.random(0, index);
      if (rand !== index) shuffled[index] = shuffled[rand];
      shuffled[rand] = set[index];
    }
    return shuffled;
  };

  // Sample **n** random values from a collection.
  // If **n** is not specified, returns a single random element.
  // The internal `guard` argument allows it to work with `map`.
  _.sample = function(obj, n, guard) {
    if (n == null || guard) {
      if (!isArrayLike(obj)) obj = _.values(obj);
      return obj[_.random(obj.length - 1)];
    }
    return _.shuffle(obj).slice(0, Math.max(0, n));
  };

  // Sort the object's values by a criterion produced by an iteratee.
  _.sortBy = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    return _.pluck(_.map(obj, function(value, index, list) {
      return {
        value: value,
        index: index,
        criteria: iteratee(value, index, list)
      };
    }).sort(function(left, right) {
      var a = left.criteria;
      var b = right.criteria;
      if (a !== b) {
        if (a > b || a === void 0) return 1;
        if (a < b || b === void 0) return -1;
      }
      return left.index - right.index;
    }), 'value');
  };

  // An internal function used for aggregate "group by" operations.
  var group = function(behavior) {
    return function(obj, iteratee, context) {
      var result = {};
      iteratee = cb(iteratee, context);
      _.each(obj, function(value, index) {
        var key = iteratee(value, index, obj);
        behavior(result, value, key);
      });
      return result;
    };
  };

  // Groups the object's values by a criterion. Pass either a string attribute
  // to group by, or a function that returns the criterion.
  _.groupBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key].push(value); else result[key] = [value];
  });

  // Indexes the object's values by a criterion, similar to `groupBy`, but for
  // when you know that your index values will be unique.
  _.indexBy = group(function(result, value, key) {
    result[key] = value;
  });

  // Counts instances of an object that group by a certain criterion. Pass
  // either a string attribute to count by, or a function that returns the
  // criterion.
  _.countBy = group(function(result, value, key) {
    if (_.has(result, key)) result[key]++; else result[key] = 1;
  });

  // Safely create a real, live array from anything iterable.
  _.toArray = function(obj) {
    if (!obj) return [];
    if (_.isArray(obj)) return slice.call(obj);
    if (isArrayLike(obj)) return _.map(obj, _.identity);
    return _.values(obj);
  };

  // Return the number of elements in an object.
  _.size = function(obj) {
    if (obj == null) return 0;
    return isArrayLike(obj) ? obj.length : _.keys(obj).length;
  };

  // Split a collection into two arrays: one whose elements all satisfy the given
  // predicate, and one whose elements all do not satisfy the predicate.
  _.partition = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var pass = [], fail = [];
    _.each(obj, function(value, key, obj) {
      (predicate(value, key, obj) ? pass : fail).push(value);
    });
    return [pass, fail];
  };

  // Array Functions
  // ---------------

  // Get the first element of an array. Passing **n** will return the first N
  // values in the array. Aliased as `head` and `take`. The **guard** check
  // allows it to work with `_.map`.
  _.first = _.head = _.take = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[0];
    return _.initial(array, array.length - n);
  };

  // Returns everything but the last entry of the array. Especially useful on
  // the arguments object. Passing **n** will return all the values in
  // the array, excluding the last N.
  _.initial = function(array, n, guard) {
    return slice.call(array, 0, Math.max(0, array.length - (n == null || guard ? 1 : n)));
  };

  // Get the last element of an array. Passing **n** will return the last N
  // values in the array.
  _.last = function(array, n, guard) {
    if (array == null) return void 0;
    if (n == null || guard) return array[array.length - 1];
    return _.rest(array, Math.max(0, array.length - n));
  };

  // Returns everything but the first entry of the array. Aliased as `tail` and `drop`.
  // Especially useful on the arguments object. Passing an **n** will return
  // the rest N values in the array.
  _.rest = _.tail = _.drop = function(array, n, guard) {
    return slice.call(array, n == null || guard ? 1 : n);
  };

  // Trim out all falsy values from an array.
  _.compact = function(array) {
    return _.filter(array, _.identity);
  };

  // Internal implementation of a recursive `flatten` function.
  var flatten = function(input, shallow, strict, startIndex) {
    var output = [], idx = 0;
    for (var i = startIndex || 0, length = getLength(input); i < length; i++) {
      var value = input[i];
      if (isArrayLike(value) && (_.isArray(value) || _.isArguments(value))) {
        //flatten current level of array or arguments object
        if (!shallow) value = flatten(value, shallow, strict);
        var j = 0, len = value.length;
        output.length += len;
        while (j < len) {
          output[idx++] = value[j++];
        }
      } else if (!strict) {
        output[idx++] = value;
      }
    }
    return output;
  };

  // Flatten out an array, either recursively (by default), or just one level.
  _.flatten = function(array, shallow) {
    return flatten(array, shallow, false);
  };

  // Return a version of the array that does not contain the specified value(s).
  _.without = function(array) {
    return _.difference(array, slice.call(arguments, 1));
  };

  // Produce a duplicate-free version of the array. If the array has already
  // been sorted, you have the option of using a faster algorithm.
  // Aliased as `unique`.
  _.uniq = _.unique = function(array, isSorted, iteratee, context) {
    if (!_.isBoolean(isSorted)) {
      context = iteratee;
      iteratee = isSorted;
      isSorted = false;
    }
    if (iteratee != null) iteratee = cb(iteratee, context);
    var result = [];
    var seen = [];
    for (var i = 0, length = getLength(array); i < length; i++) {
      var value = array[i],
          computed = iteratee ? iteratee(value, i, array) : value;
      if (isSorted) {
        if (!i || seen !== computed) result.push(value);
        seen = computed;
      } else if (iteratee) {
        if (!_.contains(seen, computed)) {
          seen.push(computed);
          result.push(value);
        }
      } else if (!_.contains(result, value)) {
        result.push(value);
      }
    }
    return result;
  };

  // Produce an array that contains the union: each distinct element from all of
  // the passed-in arrays.
  _.union = function() {
    return _.uniq(flatten(arguments, true, true));
  };

  // Produce an array that contains every item shared between all the
  // passed-in arrays.
  _.intersection = function(array) {
    var result = [];
    var argsLength = arguments.length;
    for (var i = 0, length = getLength(array); i < length; i++) {
      var item = array[i];
      if (_.contains(result, item)) continue;
      for (var j = 1; j < argsLength; j++) {
        if (!_.contains(arguments[j], item)) break;
      }
      if (j === argsLength) result.push(item);
    }
    return result;
  };

  // Take the difference between one array and a number of other arrays.
  // Only the elements present in just the first array will remain.
  _.difference = function(array) {
    var rest = flatten(arguments, true, true, 1);
    return _.filter(array, function(value){
      return !_.contains(rest, value);
    });
  };

  // Zip together multiple lists into a single array -- elements that share
  // an index go together.
  _.zip = function() {
    return _.unzip(arguments);
  };

  // Complement of _.zip. Unzip accepts an array of arrays and groups
  // each array's elements on shared indices
  _.unzip = function(array) {
    var length = array && _.max(array, getLength).length || 0;
    var result = Array(length);

    for (var index = 0; index < length; index++) {
      result[index] = _.pluck(array, index);
    }
    return result;
  };

  // Converts lists into objects. Pass either a single array of `[key, value]`
  // pairs, or two parallel arrays of the same length -- one of keys, and one of
  // the corresponding values.
  _.object = function(list, values) {
    var result = {};
    for (var i = 0, length = getLength(list); i < length; i++) {
      if (values) {
        result[list[i]] = values[i];
      } else {
        result[list[i][0]] = list[i][1];
      }
    }
    return result;
  };

  // Generator function to create the findIndex and findLastIndex functions
  function createPredicateIndexFinder(dir) {
    return function(array, predicate, context) {
      predicate = cb(predicate, context);
      var length = getLength(array);
      var index = dir > 0 ? 0 : length - 1;
      for (; index >= 0 && index < length; index += dir) {
        if (predicate(array[index], index, array)) return index;
      }
      return -1;
    };
  }

  // Returns the first index on an array-like that passes a predicate test
  _.findIndex = createPredicateIndexFinder(1);
  _.findLastIndex = createPredicateIndexFinder(-1);

  // Use a comparator function to figure out the smallest index at which
  // an object should be inserted so as to maintain order. Uses binary search.
  _.sortedIndex = function(array, obj, iteratee, context) {
    iteratee = cb(iteratee, context, 1);
    var value = iteratee(obj);
    var low = 0, high = getLength(array);
    while (low < high) {
      var mid = Math.floor((low + high) / 2);
      if (iteratee(array[mid]) < value) low = mid + 1; else high = mid;
    }
    return low;
  };

  // Generator function to create the indexOf and lastIndexOf functions
  function createIndexFinder(dir, predicateFind, sortedIndex) {
    return function(array, item, idx) {
      var i = 0, length = getLength(array);
      if (typeof idx == 'number') {
        if (dir > 0) {
            i = idx >= 0 ? idx : Math.max(idx + length, i);
        } else {
            length = idx >= 0 ? Math.min(idx + 1, length) : idx + length + 1;
        }
      } else if (sortedIndex && idx && length) {
        idx = sortedIndex(array, item);
        return array[idx] === item ? idx : -1;
      }
      if (item !== item) {
        idx = predicateFind(slice.call(array, i, length), _.isNaN);
        return idx >= 0 ? idx + i : -1;
      }
      for (idx = dir > 0 ? i : length - 1; idx >= 0 && idx < length; idx += dir) {
        if (array[idx] === item) return idx;
      }
      return -1;
    };
  }

  // Return the position of the first occurrence of an item in an array,
  // or -1 if the item is not included in the array.
  // If the array is large and already in sort order, pass `true`
  // for **isSorted** to use binary search.
  _.indexOf = createIndexFinder(1, _.findIndex, _.sortedIndex);
  _.lastIndexOf = createIndexFinder(-1, _.findLastIndex);

  // Generate an integer Array containing an arithmetic progression. A port of
  // the native Python `range()` function. See
  // [the Python documentation](http://docs.python.org/library/functions.html#range).
  _.range = function(start, stop, step) {
    if (stop == null) {
      stop = start || 0;
      start = 0;
    }
    step = step || 1;

    var length = Math.max(Math.ceil((stop - start) / step), 0);
    var range = Array(length);

    for (var idx = 0; idx < length; idx++, start += step) {
      range[idx] = start;
    }

    return range;
  };

  // Function (ahem) Functions
  // ------------------

  // Determines whether to execute a function as a constructor
  // or a normal function with the provided arguments
  var executeBound = function(sourceFunc, boundFunc, context, callingContext, args) {
    if (!(callingContext instanceof boundFunc)) return sourceFunc.apply(context, args);
    var self = baseCreate(sourceFunc.prototype);
    var result = sourceFunc.apply(self, args);
    if (_.isObject(result)) return result;
    return self;
  };

  // Create a function bound to a given object (assigning `this`, and arguments,
  // optionally). Delegates to **ECMAScript 5**'s native `Function.bind` if
  // available.
  _.bind = function(func, context) {
    if (nativeBind && func.bind === nativeBind) return nativeBind.apply(func, slice.call(arguments, 1));
    if (!_.isFunction(func)) throw new TypeError('Bind must be called on a function');
    var args = slice.call(arguments, 2);
    var bound = function() {
      return executeBound(func, bound, context, this, args.concat(slice.call(arguments)));
    };
    return bound;
  };

  // Partially apply a function by creating a version that has had some of its
  // arguments pre-filled, without changing its dynamic `this` context. _ acts
  // as a placeholder, allowing any combination of arguments to be pre-filled.
  _.partial = function(func) {
    var boundArgs = slice.call(arguments, 1);
    var bound = function() {
      var position = 0, length = boundArgs.length;
      var args = Array(length);
      for (var i = 0; i < length; i++) {
        args[i] = boundArgs[i] === _ ? arguments[position++] : boundArgs[i];
      }
      while (position < arguments.length) args.push(arguments[position++]);
      return executeBound(func, bound, this, this, args);
    };
    return bound;
  };

  // Bind a number of an object's methods to that object. Remaining arguments
  // are the method names to be bound. Useful for ensuring that all callbacks
  // defined on an object belong to it.
  _.bindAll = function(obj) {
    var i, length = arguments.length, key;
    if (length <= 1) throw new Error('bindAll must be passed function names');
    for (i = 1; i < length; i++) {
      key = arguments[i];
      obj[key] = _.bind(obj[key], obj);
    }
    return obj;
  };

  // Memoize an expensive function by storing its results.
  _.memoize = function(func, hasher) {
    var memoize = function(key) {
      var cache = memoize.cache;
      var address = '' + (hasher ? hasher.apply(this, arguments) : key);
      if (!_.has(cache, address)) cache[address] = func.apply(this, arguments);
      return cache[address];
    };
    memoize.cache = {};
    return memoize;
  };

  // Delays a function for the given number of milliseconds, and then calls
  // it with the arguments supplied.
  _.delay = function(func, wait) {
    var args = slice.call(arguments, 2);
    return setTimeout(function(){
      return func.apply(null, args);
    }, wait);
  };

  // Defers a function, scheduling it to run after the current call stack has
  // cleared.
  _.defer = _.partial(_.delay, _, 1);

  // Returns a function, that, when invoked, will only be triggered at most once
  // during a given window of time. Normally, the throttled function will run
  // as much as it can, without ever going more than once per `wait` duration;
  // but if you'd like to disable the execution on the leading edge, pass
  // `{leading: false}`. To disable execution on the trailing edge, ditto.
  _.throttle = function(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    if (!options) options = {};
    var later = function() {
      previous = options.leading === false ? 0 : _.now();
      timeout = null;
      result = func.apply(context, args);
      if (!timeout) context = args = null;
    };
    return function() {
      var now = _.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0 || remaining > wait) {
        if (timeout) {
          clearTimeout(timeout);
          timeout = null;
        }
        previous = now;
        result = func.apply(context, args);
        if (!timeout) context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  // Returns a function, that, as long as it continues to be invoked, will not
  // be triggered. The function will be called after it stops being called for
  // N milliseconds. If `immediate` is passed, trigger the function on the
  // leading edge, instead of the trailing.
  _.debounce = function(func, wait, immediate) {
    var timeout, args, context, timestamp, result;

    var later = function() {
      var last = _.now() - timestamp;

      if (last < wait && last >= 0) {
        timeout = setTimeout(later, wait - last);
      } else {
        timeout = null;
        if (!immediate) {
          result = func.apply(context, args);
          if (!timeout) context = args = null;
        }
      }
    };

    return function() {
      context = this;
      args = arguments;
      timestamp = _.now();
      var callNow = immediate && !timeout;
      if (!timeout) timeout = setTimeout(later, wait);
      if (callNow) {
        result = func.apply(context, args);
        context = args = null;
      }

      return result;
    };
  };

  // Returns the first function passed as an argument to the second,
  // allowing you to adjust arguments, run code before and after, and
  // conditionally execute the original function.
  _.wrap = function(func, wrapper) {
    return _.partial(wrapper, func);
  };

  // Returns a negated version of the passed-in predicate.
  _.negate = function(predicate) {
    return function() {
      return !predicate.apply(this, arguments);
    };
  };

  // Returns a function that is the composition of a list of functions, each
  // consuming the return value of the function that follows.
  _.compose = function() {
    var args = arguments;
    var start = args.length - 1;
    return function() {
      var i = start;
      var result = args[start].apply(this, arguments);
      while (i--) result = args[i].call(this, result);
      return result;
    };
  };

  // Returns a function that will only be executed on and after the Nth call.
  _.after = function(times, func) {
    return function() {
      if (--times < 1) {
        return func.apply(this, arguments);
      }
    };
  };

  // Returns a function that will only be executed up to (but not including) the Nth call.
  _.before = function(times, func) {
    var memo;
    return function() {
      if (--times > 0) {
        memo = func.apply(this, arguments);
      }
      if (times <= 1) func = null;
      return memo;
    };
  };

  // Returns a function that will be executed at most one time, no matter how
  // often you call it. Useful for lazy initialization.
  _.once = _.partial(_.before, 2);

  // Object Functions
  // ----------------

  // Keys in IE < 9 that won't be iterated by `for key in ...` and thus missed.
  var hasEnumBug = !{toString: null}.propertyIsEnumerable('toString');
  var nonEnumerableProps = ['valueOf', 'isPrototypeOf', 'toString',
                      'propertyIsEnumerable', 'hasOwnProperty', 'toLocaleString'];

  function collectNonEnumProps(obj, keys) {
    var nonEnumIdx = nonEnumerableProps.length;
    var constructor = obj.constructor;
    var proto = (_.isFunction(constructor) && constructor.prototype) || ObjProto;

    // Constructor is a special case.
    var prop = 'constructor';
    if (_.has(obj, prop) && !_.contains(keys, prop)) keys.push(prop);

    while (nonEnumIdx--) {
      prop = nonEnumerableProps[nonEnumIdx];
      if (prop in obj && obj[prop] !== proto[prop] && !_.contains(keys, prop)) {
        keys.push(prop);
      }
    }
  }

  // Retrieve the names of an object's own properties.
  // Delegates to **ECMAScript 5**'s native `Object.keys`
  _.keys = function(obj) {
    if (!_.isObject(obj)) return [];
    if (nativeKeys) return nativeKeys(obj);
    var keys = [];
    for (var key in obj) if (_.has(obj, key)) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve all the property names of an object.
  _.allKeys = function(obj) {
    if (!_.isObject(obj)) return [];
    var keys = [];
    for (var key in obj) keys.push(key);
    // Ahem, IE < 9.
    if (hasEnumBug) collectNonEnumProps(obj, keys);
    return keys;
  };

  // Retrieve the values of an object's properties.
  _.values = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var values = Array(length);
    for (var i = 0; i < length; i++) {
      values[i] = obj[keys[i]];
    }
    return values;
  };

  // Returns the results of applying the iteratee to each element of the object
  // In contrast to _.map it returns an object
  _.mapObject = function(obj, iteratee, context) {
    iteratee = cb(iteratee, context);
    var keys =  _.keys(obj),
          length = keys.length,
          results = {},
          currentKey;
      for (var index = 0; index < length; index++) {
        currentKey = keys[index];
        results[currentKey] = iteratee(obj[currentKey], currentKey, obj);
      }
      return results;
  };

  // Convert an object into a list of `[key, value]` pairs.
  _.pairs = function(obj) {
    var keys = _.keys(obj);
    var length = keys.length;
    var pairs = Array(length);
    for (var i = 0; i < length; i++) {
      pairs[i] = [keys[i], obj[keys[i]]];
    }
    return pairs;
  };

  // Invert the keys and values of an object. The values must be serializable.
  _.invert = function(obj) {
    var result = {};
    var keys = _.keys(obj);
    for (var i = 0, length = keys.length; i < length; i++) {
      result[obj[keys[i]]] = keys[i];
    }
    return result;
  };

  // Return a sorted list of the function names available on the object.
  // Aliased as `methods`
  _.functions = _.methods = function(obj) {
    var names = [];
    for (var key in obj) {
      if (_.isFunction(obj[key])) names.push(key);
    }
    return names.sort();
  };

  // Extend a given object with all the properties in passed-in object(s).
  _.extend = createAssigner(_.allKeys);

  // Assigns a given object with all the own properties in the passed-in object(s)
  // (https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Object/assign)
  _.extendOwn = _.assign = createAssigner(_.keys);

  // Returns the first key on an object that passes a predicate test
  _.findKey = function(obj, predicate, context) {
    predicate = cb(predicate, context);
    var keys = _.keys(obj), key;
    for (var i = 0, length = keys.length; i < length; i++) {
      key = keys[i];
      if (predicate(obj[key], key, obj)) return key;
    }
  };

  // Return a copy of the object only containing the whitelisted properties.
  _.pick = function(object, oiteratee, context) {
    var result = {}, obj = object, iteratee, keys;
    if (obj == null) return result;
    if (_.isFunction(oiteratee)) {
      keys = _.allKeys(obj);
      iteratee = optimizeCb(oiteratee, context);
    } else {
      keys = flatten(arguments, false, false, 1);
      iteratee = function(value, key, obj) { return key in obj; };
      obj = Object(obj);
    }
    for (var i = 0, length = keys.length; i < length; i++) {
      var key = keys[i];
      var value = obj[key];
      if (iteratee(value, key, obj)) result[key] = value;
    }
    return result;
  };

   // Return a copy of the object without the blacklisted properties.
  _.omit = function(obj, iteratee, context) {
    if (_.isFunction(iteratee)) {
      iteratee = _.negate(iteratee);
    } else {
      var keys = _.map(flatten(arguments, false, false, 1), String);
      iteratee = function(value, key) {
        return !_.contains(keys, key);
      };
    }
    return _.pick(obj, iteratee, context);
  };

  // Fill in a given object with default properties.
  _.defaults = createAssigner(_.allKeys, true);

  // Creates an object that inherits from the given prototype object.
  // If additional properties are provided then they will be added to the
  // created object.
  _.create = function(prototype, props) {
    var result = baseCreate(prototype);
    if (props) _.extendOwn(result, props);
    return result;
  };

  // Create a (shallow-cloned) duplicate of an object.
  _.clone = function(obj) {
    if (!_.isObject(obj)) return obj;
    return _.isArray(obj) ? obj.slice() : _.extend({}, obj);
  };

  // Invokes interceptor with the obj, and then returns obj.
  // The primary purpose of this method is to "tap into" a method chain, in
  // order to perform operations on intermediate results within the chain.
  _.tap = function(obj, interceptor) {
    interceptor(obj);
    return obj;
  };

  // Returns whether an object has a given set of `key:value` pairs.
  _.isMatch = function(object, attrs) {
    var keys = _.keys(attrs), length = keys.length;
    if (object == null) return !length;
    var obj = Object(object);
    for (var i = 0; i < length; i++) {
      var key = keys[i];
      if (attrs[key] !== obj[key] || !(key in obj)) return false;
    }
    return true;
  };


  // Internal recursive comparison function for `isEqual`.
  var eq = function(a, b, aStack, bStack) {
    // Identical objects are equal. `0 === -0`, but they aren't identical.
    // See the [Harmony `egal` proposal](http://wiki.ecmascript.org/doku.php?id=harmony:egal).
    if (a === b) return a !== 0 || 1 / a === 1 / b;
    // A strict comparison is necessary because `null == undefined`.
    if (a == null || b == null) return a === b;
    // Unwrap any wrapped objects.
    if (a instanceof _) a = a._wrapped;
    if (b instanceof _) b = b._wrapped;
    // Compare `[[Class]]` names.
    var className = toString.call(a);
    if (className !== toString.call(b)) return false;
    switch (className) {
      // Strings, numbers, regular expressions, dates, and booleans are compared by value.
      case '[object RegExp]':
      // RegExps are coerced to strings for comparison (Note: '' + /a/i === '/a/i')
      case '[object String]':
        // Primitives and their corresponding object wrappers are equivalent; thus, `"5"` is
        // equivalent to `new String("5")`.
        return '' + a === '' + b;
      case '[object Number]':
        // `NaN`s are equivalent, but non-reflexive.
        // Object(NaN) is equivalent to NaN
        if (+a !== +a) return +b !== +b;
        // An `egal` comparison is performed for other numeric values.
        return +a === 0 ? 1 / +a === 1 / b : +a === +b;
      case '[object Date]':
      case '[object Boolean]':
        // Coerce dates and booleans to numeric primitive values. Dates are compared by their
        // millisecond representations. Note that invalid dates with millisecond representations
        // of `NaN` are not equivalent.
        return +a === +b;
    }

    var areArrays = className === '[object Array]';
    if (!areArrays) {
      if (typeof a != 'object' || typeof b != 'object') return false;

      // Objects with different constructors are not equivalent, but `Object`s or `Array`s
      // from different frames are.
      var aCtor = a.constructor, bCtor = b.constructor;
      if (aCtor !== bCtor && !(_.isFunction(aCtor) && aCtor instanceof aCtor &&
                               _.isFunction(bCtor) && bCtor instanceof bCtor)
                          && ('constructor' in a && 'constructor' in b)) {
        return false;
      }
    }
    // Assume equality for cyclic structures. The algorithm for detecting cyclic
    // structures is adapted from ES 5.1 section 15.12.3, abstract operation `JO`.

    // Initializing stack of traversed objects.
    // It's done here since we only need them for objects and arrays comparison.
    aStack = aStack || [];
    bStack = bStack || [];
    var length = aStack.length;
    while (length--) {
      // Linear search. Performance is inversely proportional to the number of
      // unique nested structures.
      if (aStack[length] === a) return bStack[length] === b;
    }

    // Add the first object to the stack of traversed objects.
    aStack.push(a);
    bStack.push(b);

    // Recursively compare objects and arrays.
    if (areArrays) {
      // Compare array lengths to determine if a deep comparison is necessary.
      length = a.length;
      if (length !== b.length) return false;
      // Deep compare the contents, ignoring non-numeric properties.
      while (length--) {
        if (!eq(a[length], b[length], aStack, bStack)) return false;
      }
    } else {
      // Deep compare objects.
      var keys = _.keys(a), key;
      length = keys.length;
      // Ensure that both objects contain the same number of properties before comparing deep equality.
      if (_.keys(b).length !== length) return false;
      while (length--) {
        // Deep compare each member
        key = keys[length];
        if (!(_.has(b, key) && eq(a[key], b[key], aStack, bStack))) return false;
      }
    }
    // Remove the first object from the stack of traversed objects.
    aStack.pop();
    bStack.pop();
    return true;
  };

  // Perform a deep comparison to check if two objects are equal.
  _.isEqual = function(a, b) {
    return eq(a, b);
  };

  // Is a given array, string, or object empty?
  // An "empty" object has no enumerable own-properties.
  _.isEmpty = function(obj) {
    if (obj == null) return true;
    if (isArrayLike(obj) && (_.isArray(obj) || _.isString(obj) || _.isArguments(obj))) return obj.length === 0;
    return _.keys(obj).length === 0;
  };

  // Is a given value a DOM element?
  _.isElement = function(obj) {
    return !!(obj && obj.nodeType === 1);
  };

  // Is a given value an array?
  // Delegates to ECMA5's native Array.isArray
  _.isArray = nativeIsArray || function(obj) {
    return toString.call(obj) === '[object Array]';
  };

  // Is a given variable an object?
  _.isObject = function(obj) {
    var type = typeof obj;
    return type === 'function' || type === 'object' && !!obj;
  };

  // Add some isType methods: isArguments, isFunction, isString, isNumber, isDate, isRegExp, isError.
  _.each(['Arguments', 'Function', 'String', 'Number', 'Date', 'RegExp', 'Error'], function(name) {
    _['is' + name] = function(obj) {
      return toString.call(obj) === '[object ' + name + ']';
    };
  });

  // Define a fallback version of the method in browsers (ahem, IE < 9), where
  // there isn't any inspectable "Arguments" type.
  if (!_.isArguments(arguments)) {
    _.isArguments = function(obj) {
      return _.has(obj, 'callee');
    };
  }

  // Optimize `isFunction` if appropriate. Work around some typeof bugs in old v8,
  // IE 11 (#1621), and in Safari 8 (#1929).
  if (typeof /./ != 'function' && typeof Int8Array != 'object') {
    _.isFunction = function(obj) {
      return typeof obj == 'function' || false;
    };
  }

  // Is a given object a finite number?
  _.isFinite = function(obj) {
    return isFinite(obj) && !isNaN(parseFloat(obj));
  };

  // Is the given value `NaN`? (NaN is the only number which does not equal itself).
  _.isNaN = function(obj) {
    return _.isNumber(obj) && obj !== +obj;
  };

  // Is a given value a boolean?
  _.isBoolean = function(obj) {
    return obj === true || obj === false || toString.call(obj) === '[object Boolean]';
  };

  // Is a given value equal to null?
  _.isNull = function(obj) {
    return obj === null;
  };

  // Is a given variable undefined?
  _.isUndefined = function(obj) {
    return obj === void 0;
  };

  // Shortcut function for checking if an object has a given property directly
  // on itself (in other words, not on a prototype).
  _.has = function(obj, key) {
    return obj != null && hasOwnProperty.call(obj, key);
  };

  // Utility Functions
  // -----------------

  // Run Underscore.js in *noConflict* mode, returning the `_` variable to its
  // previous owner. Returns a reference to the Underscore object.
  _.noConflict = function() {
    root._ = previousUnderscore;
    return this;
  };

  // Keep the identity function around for default iteratees.
  _.identity = function(value) {
    return value;
  };

  // Predicate-generating functions. Often useful outside of Underscore.
  _.constant = function(value) {
    return function() {
      return value;
    };
  };

  _.noop = function(){};

  _.property = property;

  // Generates a function for a given object that returns a given property.
  _.propertyOf = function(obj) {
    return obj == null ? function(){} : function(key) {
      return obj[key];
    };
  };

  // Returns a predicate for checking whether an object has a given set of
  // `key:value` pairs.
  _.matcher = _.matches = function(attrs) {
    attrs = _.extendOwn({}, attrs);
    return function(obj) {
      return _.isMatch(obj, attrs);
    };
  };

  // Run a function **n** times.
  _.times = function(n, iteratee, context) {
    var accum = Array(Math.max(0, n));
    iteratee = optimizeCb(iteratee, context, 1);
    for (var i = 0; i < n; i++) accum[i] = iteratee(i);
    return accum;
  };

  // Return a random integer between min and max (inclusive).
  _.random = function(min, max) {
    if (max == null) {
      max = min;
      min = 0;
    }
    return min + Math.floor(Math.random() * (max - min + 1));
  };

  // A (possibly faster) way to get the current timestamp as an integer.
  _.now = Date.now || function() {
    return new Date().getTime();
  };

   // List of HTML entities for escaping.
  var escapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '`': '&#x60;'
  };
  var unescapeMap = _.invert(escapeMap);

  // Functions for escaping and unescaping strings to/from HTML interpolation.
  var createEscaper = function(map) {
    var escaper = function(match) {
      return map[match];
    };
    // Regexes for identifying a key that needs to be escaped
    var source = '(?:' + _.keys(map).join('|') + ')';
    var testRegexp = RegExp(source);
    var replaceRegexp = RegExp(source, 'g');
    return function(string) {
      string = string == null ? '' : '' + string;
      return testRegexp.test(string) ? string.replace(replaceRegexp, escaper) : string;
    };
  };
  _.escape = createEscaper(escapeMap);
  _.unescape = createEscaper(unescapeMap);

  // If the value of the named `property` is a function then invoke it with the
  // `object` as context; otherwise, return it.
  _.result = function(object, property, fallback) {
    var value = object == null ? void 0 : object[property];
    if (value === void 0) {
      value = fallback;
    }
    return _.isFunction(value) ? value.call(object) : value;
  };

  // Generate a unique integer id (unique within the entire client session).
  // Useful for temporary DOM ids.
  var idCounter = 0;
  _.uniqueId = function(prefix) {
    var id = ++idCounter + '';
    return prefix ? prefix + id : id;
  };

  // By default, Underscore uses ERB-style template delimiters, change the
  // following template settings to use alternative delimiters.
  _.templateSettings = {
    evaluate    : /<%([\s\S]+?)%>/g,
    interpolate : /<%=([\s\S]+?)%>/g,
    escape      : /<%-([\s\S]+?)%>/g
  };

  // When customizing `templateSettings`, if you don't want to define an
  // interpolation, evaluation or escaping regex, we need one that is
  // guaranteed not to match.
  var noMatch = /(.)^/;

  // Certain characters need to be escaped so that they can be put into a
  // string literal.
  var escapes = {
    "'":      "'",
    '\\':     '\\',
    '\r':     'r',
    '\n':     'n',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  var escaper = /\\|'|\r|\n|\u2028|\u2029/g;

  var escapeChar = function(match) {
    return '\\' + escapes[match];
  };

  // JavaScript micro-templating, similar to John Resig's implementation.
  // Underscore templating handles arbitrary delimiters, preserves whitespace,
  // and correctly escapes quotes within interpolated code.
  // NB: `oldSettings` only exists for backwards compatibility.
  _.template = function(text, settings, oldSettings) {
    if (!settings && oldSettings) settings = oldSettings;
    settings = _.defaults({}, settings, _.templateSettings);

    // Combine delimiters into one regular expression via alternation.
    var matcher = RegExp([
      (settings.escape || noMatch).source,
      (settings.interpolate || noMatch).source,
      (settings.evaluate || noMatch).source
    ].join('|') + '|$', 'g');

    // Compile the template source, escaping string literals appropriately.
    var index = 0;
    var source = "__p+='";
    text.replace(matcher, function(match, escape, interpolate, evaluate, offset) {
      source += text.slice(index, offset).replace(escaper, escapeChar);
      index = offset + match.length;

      if (escape) {
        source += "'+\n((__t=(" + escape + "))==null?'':_.escape(__t))+\n'";
      } else if (interpolate) {
        source += "'+\n((__t=(" + interpolate + "))==null?'':__t)+\n'";
      } else if (evaluate) {
        source += "';\n" + evaluate + "\n__p+='";
      }

      // Adobe VMs need the match returned to produce the correct offest.
      return match;
    });
    source += "';\n";

    // If a variable is not specified, place data values in local scope.
    if (!settings.variable) source = 'with(obj||{}){\n' + source + '}\n';

    source = "var __t,__p='',__j=Array.prototype.join," +
      "print=function(){__p+=__j.call(arguments,'');};\n" +
      source + 'return __p;\n';

    try {
      var render = new Function(settings.variable || 'obj', '_', source);
    } catch (e) {
      e.source = source;
      throw e;
    }

    var template = function(data) {
      return render.call(this, data, _);
    };

    // Provide the compiled source as a convenience for precompilation.
    var argument = settings.variable || 'obj';
    template.source = 'function(' + argument + '){\n' + source + '}';

    return template;
  };

  // Add a "chain" function. Start chaining a wrapped Underscore object.
  _.chain = function(obj) {
    var instance = _(obj);
    instance._chain = true;
    return instance;
  };

  // OOP
  // ---------------
  // If Underscore is called as a function, it returns a wrapped object that
  // can be used OO-style. This wrapper holds altered versions of all the
  // underscore functions. Wrapped objects may be chained.

  // Helper function to continue chaining intermediate results.
  var result = function(instance, obj) {
    return instance._chain ? _(obj).chain() : obj;
  };

  // Add your own custom functions to the Underscore object.
  _.mixin = function(obj) {
    _.each(_.functions(obj), function(name) {
      var func = _[name] = obj[name];
      _.prototype[name] = function() {
        var args = [this._wrapped];
        push.apply(args, arguments);
        return result(this, func.apply(_, args));
      };
    });
  };

  // Add all of the Underscore functions to the wrapper object.
  _.mixin(_);

  // Add all mutator Array functions to the wrapper.
  _.each(['pop', 'push', 'reverse', 'shift', 'sort', 'splice', 'unshift'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      var obj = this._wrapped;
      method.apply(obj, arguments);
      if ((name === 'shift' || name === 'splice') && obj.length === 0) delete obj[0];
      return result(this, obj);
    };
  });

  // Add all accessor Array functions to the wrapper.
  _.each(['concat', 'join', 'slice'], function(name) {
    var method = ArrayProto[name];
    _.prototype[name] = function() {
      return result(this, method.apply(this._wrapped, arguments));
    };
  });

  // Extracts the result from a wrapped and chained object.
  _.prototype.value = function() {
    return this._wrapped;
  };

  // Provide unwrapping proxy for some methods used in engine operations
  // such as arithmetic and JSON stringification.
  _.prototype.valueOf = _.prototype.toJSON = _.prototype.value;

  _.prototype.toString = function() {
    return '' + this._wrapped;
  };

  // AMD registration happens at the end for compatibility with AMD loaders
  // that may not enforce next-turn semantics on modules. Even though general
  // practice for AMD registration is to be anonymous, underscore registers
  // as a named module because, like jQuery, it is a base library that is
  // popular enough to be bundled in a third party lib, but not be part of
  // an AMD load request. Those cases could generate an error when an
  // anonymous define() is called outside of a loader request.
  if (true) {
    !(__WEBPACK_AMD_DEFINE_ARRAY__ = [], __WEBPACK_AMD_DEFINE_RESULT__ = function() {
      return _;
    }.apply(exports, __WEBPACK_AMD_DEFINE_ARRAY__),
				__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
  }
}.call(this));


/***/ }),

/***/ "../../../../../src/$$_gendir lazy recursive":
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncatched exception popping up in devtools
	return Promise.resolve().then(function() {
		throw new Error("Cannot find module '" + req + "'.");
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "../../../../../src/$$_gendir lazy recursive";

/***/ }),

/***/ "../../../../../src/app/app.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/app.component.html":
/***/ (function(module, exports) {

module.exports = "<router-outlet></router-outlet>\n"

/***/ }),

/***/ "../../../../../src/app/app.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppComponent; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_router__ = __webpack_require__("../../../router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_stomp_service__ = __webpack_require__("../../../../../src/app/services/stomp.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__services_simulator_service__ = __webpack_require__("../../../../../src/app/services/simulator.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__services_api_service__ = __webpack_require__("../../../../../src/app/services/api.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__services_utilities_service__ = __webpack_require__("../../../../../src/app/services/utilities.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__services_mat_css_service__ = __webpack_require__("../../../../../src/app/services/mat-css.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__services_plugin_service__ = __webpack_require__("../../../../../src/app/services/plugin.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};








var AppComponent = (function () {
    function AppComponent(route, apiService, stomp, simulator, utils, sim, matCSS) {
        var _this = this;
        this.route = route;
        this.apiService = apiService;
        this.stomp = stomp;
        this.simulator = simulator;
        this.utils = utils;
        this.sim = sim;
        this.matCSS = matCSS;
        this.route.queryParams.subscribe(function (params) {
            if (params['s']) {
                //debugger
                var settings = JSON.parse(atob(params['s']));
                if (settings.stompConfig && settings.stompConfig.debug)
                    console.log(settings);
                _this.setAppSettings(settings);
                _this.sim.init(settings.appConfig.chatJson);
            }
        });
    }
    AppComponent.prototype.setAppSettings = function (settings) {
        __WEBPACK_IMPORTED_MODULE_5__services_utilities_service__["b" /* UtilitiesService */].settings = settings;
        if (settings.brandingConfig) {
            this.getCustomStyle(settings.brandingConfig.primaryBackgroundColor, settings.brandingConfig.secondaryBackgroundColor, settings.brandingConfig.primaryForegroundColor, settings.brandingConfig.frameContentWidth);
        }
        if (settings.thirdPartyConfig && __WEBPACK_IMPORTED_MODULE_5__services_utilities_service__["b" /* UtilitiesService */].googleMapsConfigRef)
            __WEBPACK_IMPORTED_MODULE_5__services_utilities_service__["b" /* UtilitiesService */].googleMapsConfigRef.apiKey = settings.thirdPartyConfig.googleMapsKey;
        if (settings.appConfig) {
            this.apiService.fileUploadEndpoint = settings.appConfig.fileUploadEndpoint;
            this.apiService.setAPIEndpoint(settings.appConfig.apiEndpoint);
        }
        if (settings.stompConfig)
            this.stomp.configure(settings.stompConfig);
    };
    AppComponent.prototype.getCustomStyle = function (accent, secondary, accentFG, contentWidth) {
        if (accent === void 0) { accent = undefined; }
        if (secondary === void 0) { secondary = undefined; }
        if (accentFG === void 0) { accentFG = undefined; }
        if (contentWidth === void 0) { contentWidth = undefined; }
        var ANA_CUSTOM_STYLE = 'ana-custom-style';
        var customStyle = document.getElementById(ANA_CUSTOM_STYLE);
        if (!customStyle) {
            customStyle = document.createElement('style');
            customStyle.id = ANA_CUSTOM_STYLE;
            document.head.appendChild(customStyle);
        }
        var appCSS = "/*Dynamic styles*/\n.chat-message-item.incoming {\n  border-left-color: " + (accent || '#8cc83c') + ";\n}\n\n.incoming > .chat-stub {\n  border-top-color: " + (accent || '#8cc83c') + ";\n}\n\n.carousel-item-button:first-child,\n.chat-input button.btn-icon {\n  color: " + (accent || '#8cc83c') + ";\n}\n\n.chat-input button.btn-click {\n  background-color: " + (accent || '#8cc83c') + ";\n  color: " + (accentFG || 'white') + ";\n}\n\n.ana-sent-tick path{\n\tfill: " + (accent || '#8cc83c') + ";\n}\n.ana-sent-tick{\n  color: " + (accent || '#8cc83c') + ";\n}\n\n.ana-delivered-tick path{\n\tfill: " + (accent || '#8cc83c') + ";\n}\n.ana-delivered-tick{\n  color: " + (accent || '#8cc83c') + ";\n}\n\n.chat-message-item.outgoing {\n  border-right-color: " + (secondary || 'black') + ";\n}\n\n.outgoing > .chat-stub {\n  border-top-color: " + (secondary || 'black') + ";\n}\n\n.complex-input-btn-done {\n  color: " + (accentFG || 'white') + " !important;\n}\n\n.content {\n  width: 100vw;\n}\n\n.ana-title {\n  background-color: " + (accent || '#8cc83c') + ";\n  color: " + (accentFG || 'white') + ";\n}\n.chat-text-input{\n\tcaret-color: " + (accent || '#8cc83c') + ";\n}\npath.send-button{\n  fill: " + (accent || '#8cc83c') + ";\n}\n.ana-logo > img {\n  background-color: " + (accentFG || 'white') + ";\n  border: 2px solid " + (accentFG || 'white') + ";\n}\n\n.ana-min .ana-minmax-btn {\n  border: 2px solid " + (accentFG || 'white') + ";\n}\n\n.ana-minmax-btn {\n  background-color: " + (accentFG || 'white') + ";\n}\n\n.typing-indicator span{\n  background-color: " + (accent || '#8cc83c') + ";\n}\n\n.ana-actions {\n  margin-right: " + (__WEBPACK_IMPORTED_MODULE_5__services_utilities_service__["b" /* UtilitiesService */].settings.appConfig.fullpage ? "-5px" : "20px") + ";\n}\n";
        this.matCSS.loadCustomMatTheme(accent, customStyle, appCSS);
    };
    AppComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["o" /* Component */])({
            selector: 'app-root',
            template: __webpack_require__("../../../../../src/app/app.component.html"),
            styles: [__webpack_require__("../../../../../src/app/app.component.css")]
        }),
        __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_router__["a" /* ActivatedRoute */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_router__["a" /* ActivatedRoute */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_4__services_api_service__["a" /* APIService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_4__services_api_service__["a" /* APIService */]) === "function" && _b || Object, typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_2__services_stomp_service__["b" /* StompService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__services_stomp_service__["b" /* StompService */]) === "function" && _c || Object, typeof (_d = typeof __WEBPACK_IMPORTED_MODULE_3__services_simulator_service__["a" /* SimulatorService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_3__services_simulator_service__["a" /* SimulatorService */]) === "function" && _d || Object, typeof (_e = typeof __WEBPACK_IMPORTED_MODULE_5__services_utilities_service__["b" /* UtilitiesService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_5__services_utilities_service__["b" /* UtilitiesService */]) === "function" && _e || Object, typeof (_f = typeof __WEBPACK_IMPORTED_MODULE_7__services_plugin_service__["a" /* SimulatorFromStudio */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_7__services_plugin_service__["a" /* SimulatorFromStudio */]) === "function" && _f || Object, typeof (_g = typeof __WEBPACK_IMPORTED_MODULE_6__services_mat_css_service__["a" /* MatCSSService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_6__services_mat_css_service__["a" /* MatCSSService */]) === "function" && _g || Object])
    ], AppComponent);
    return AppComponent;
    var _a, _b, _c, _d, _e, _f, _g;
}());

//# sourceMappingURL=app.component.js.map

/***/ }),

/***/ "../../../../../src/app/app.module.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return AppModule; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__ = __webpack_require__("../../../platform-browser/@angular/platform-browser.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_forms__ = __webpack_require__("../../../forms/@angular/forms.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_router__ = __webpack_require__("../../../router/@angular/router.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_http__ = __webpack_require__("../../../http/@angular/http.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__angular_platform_browser_animations__ = __webpack_require__("../../../platform-browser/@angular/platform-browser/animations.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__angular_material__ = __webpack_require__("../../../material/@angular/material.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__agm_core__ = __webpack_require__("../../../../@agm/core/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__app_component__ = __webpack_require__("../../../../../src/app/app.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__components_chat_thread_chat_thread_component__ = __webpack_require__("../../../../../src/app/components/chat-thread/chat-thread.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__services_stomp_service__ = __webpack_require__("../../../../../src/app/services/stomp.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__services_plugin_service__ = __webpack_require__("../../../../../src/app/services/plugin.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_12__services_resolver_service__ = __webpack_require__("../../../../../src/app/services/resolver.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_13__services_api_service__ = __webpack_require__("../../../../../src/app/services/api.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_14__services_utilities_service__ = __webpack_require__("../../../../../src/app/services/utilities.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_15__services_simulator_service__ = __webpack_require__("../../../../../src/app/services/simulator.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_16__components_complex_input_complex_input_component__ = __webpack_require__("../../../../../src/app/components/complex-input/complex-input.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_17__models_google_maps_config_model__ = __webpack_require__("../../../../../src/app/models/google-maps-config.model.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_18__services_mat_css_service__ = __webpack_require__("../../../../../src/app/services/mat-css.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_19__services_chain_delay_service__ = __webpack_require__("../../../../../src/app/services/chain-delay.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_20__components_info_dialog_info_dialog_component__ = __webpack_require__("../../../../../src/app/components/info-dialog/info-dialog.component.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_21__services_info_dialog_service__ = __webpack_require__("../../../../../src/app/services/info-dialog.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};






















var AppModule = (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_1__angular_core__["M" /* NgModule */])({
            declarations: [
                __WEBPACK_IMPORTED_MODULE_8__app_component__["a" /* AppComponent */],
                __WEBPACK_IMPORTED_MODULE_9__components_chat_thread_chat_thread_component__["a" /* ChatThreadComponent */],
                __WEBPACK_IMPORTED_MODULE_16__components_complex_input_complex_input_component__["a" /* ComplexInputComponent */],
                __WEBPACK_IMPORTED_MODULE_20__components_info_dialog_info_dialog_component__["a" /* InfoDialogComponent */]
            ],
            imports: [
                __WEBPACK_IMPORTED_MODULE_0__angular_platform_browser__["a" /* BrowserModule */],
                __WEBPACK_IMPORTED_MODULE_2__angular_forms__["c" /* FormsModule */],
                __WEBPACK_IMPORTED_MODULE_5__angular_platform_browser_animations__["a" /* BrowserAnimationsModule */],
                __WEBPACK_IMPORTED_MODULE_6__angular_material__["h" /* MdDialogModule */],
                __WEBPACK_IMPORTED_MODULE_6__angular_material__["f" /* MdDatepickerModule */],
                __WEBPACK_IMPORTED_MODULE_6__angular_material__["j" /* MdFormFieldModule */],
                __WEBPACK_IMPORTED_MODULE_6__angular_material__["m" /* MdNativeDateModule */],
                __WEBPACK_IMPORTED_MODULE_6__angular_material__["k" /* MdInputModule */],
                __WEBPACK_IMPORTED_MODULE_6__angular_material__["b" /* MdButtonModule */],
                __WEBPACK_IMPORTED_MODULE_6__angular_material__["l" /* MdListModule */],
                __WEBPACK_IMPORTED_MODULE_6__angular_material__["d" /* MdCheckboxModule */],
                __WEBPACK_IMPORTED_MODULE_6__angular_material__["c" /* MdCardModule */],
                __WEBPACK_IMPORTED_MODULE_6__angular_material__["o" /* MdRadioModule */],
                __WEBPACK_IMPORTED_MODULE_6__angular_material__["n" /* MdProgressBarModule */],
                __WEBPACK_IMPORTED_MODULE_3__angular_router__["b" /* RouterModule */].forRoot([
                    { path: '', component: __WEBPACK_IMPORTED_MODULE_9__components_chat_thread_chat_thread_component__["a" /* ChatThreadComponent */] },
                    { path: '**', redirectTo: '' }
                ]),
                __WEBPACK_IMPORTED_MODULE_4__angular_http__["c" /* HttpModule */],
                __WEBPACK_IMPORTED_MODULE_7__agm_core__["a" /* AgmCoreModule */].forRoot()
            ],
            providers: [
                __WEBPACK_IMPORTED_MODULE_10__services_stomp_service__["b" /* StompService */],
                __WEBPACK_IMPORTED_MODULE_14__services_utilities_service__["b" /* UtilitiesService */],
                __WEBPACK_IMPORTED_MODULE_13__services_api_service__["a" /* APIService */],
                __WEBPACK_IMPORTED_MODULE_18__services_mat_css_service__["a" /* MatCSSService */],
                __WEBPACK_IMPORTED_MODULE_12__services_resolver_service__["a" /* SampleService */],
                __WEBPACK_IMPORTED_MODULE_19__services_chain_delay_service__["a" /* ChainDelayService */],
                __WEBPACK_IMPORTED_MODULE_15__services_simulator_service__["a" /* SimulatorService */],
                __WEBPACK_IMPORTED_MODULE_11__services_plugin_service__["a" /* SimulatorFromStudio */],
                __WEBPACK_IMPORTED_MODULE_21__services_info_dialog_service__["a" /* InfoDialogService */],
                { provide: __WEBPACK_IMPORTED_MODULE_7__agm_core__["b" /* LAZY_MAPS_API_CONFIG */], useClass: __WEBPACK_IMPORTED_MODULE_17__models_google_maps_config_model__["a" /* GoogleMapsConfig */] }
            ],
            bootstrap: [__WEBPACK_IMPORTED_MODULE_8__app_component__["a" /* AppComponent */]],
            entryComponents: [
                __WEBPACK_IMPORTED_MODULE_16__components_complex_input_complex_input_component__["a" /* ComplexInputComponent */],
                __WEBPACK_IMPORTED_MODULE_20__components_info_dialog_info_dialog_component__["a" /* InfoDialogComponent */]
            ],
            schemas: [__WEBPACK_IMPORTED_MODULE_1__angular_core__["L" /* NO_ERRORS_SCHEMA */]]
        })
    ], AppModule);
    return AppModule;
}());

//# sourceMappingURL=app.module.js.map

/***/ }),

/***/ "../../../../../src/app/components/chat-thread/chat-thread.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, ".root {\n    display: table;\n    margin: 0 auto;\n    height: 100vh;\n    border-radius: 10px;\n    overflow: hidden;\n}\n\n.media {\n    overflow: visible;\n}\n\n.clickable {\n    cursor: pointer;\n}\n\n.content {\n    margin: 0 auto;\n    display: inline-block;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: column;\n            flex-direction: column;\n    height: inherit;\n}\n\n.ana-min.root {\n    height: 57px !important;\n}\n\n.ana-min .chat-thread,\n.ana-min .chat-input-container {\n    height: 0 !important;\n    display: none;\n}\n\n.ana-min .root {\n    height: 57px !important;\n}\n\n.chat-thread {\n    padding: 20px;\n    height: 100%;\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n    overflow-y: scroll;\n    background-color: #F5F5F5;\n}\n\n.chat-message-group {\n    margin: 10px 0;\n}\n\n.chat-message-item {\n    max-width: 80%;\n    position: relative;\n    min-width: 40%;\n    box-shadow: 0px 2px 3px -1px rgba(110, 110, 110, 0.15);\n}\n\n    .chat-message-item.media * .chat-media {\n        width: 100%;\n        height: 100%;\n        background-color: white;\n    }\n\n    .chat-message-item.media.incoming * .chat-media {\n        border-radius: 0 10px 10px 0;\n    }\n\n        .chat-message-item.media.incoming * video.chat-media,\n        .chat-message-item.media.incoming * .chat-media > audio {\n            border-radius: 0 10px 0 0 !important;\n        }\n\n    .chat-message-item.media.outgoing * .chat-media {\n        border-radius: 10px 0 0 10px;\n    }\n\n        .chat-message-item.media.outgoing * video.chat-media,\n        .chat-message-item.media.outgoing * .chat-media > audio {\n            border-radius: 10px 0 0 0 !important;\n        }\n\n    .chat-message-item.text {\n        background-color: white;\n        padding: 15px;\n    }\n\n    .chat-message-item.typing {\n        background-color: white;\n        padding: 10px 15px;\n        min-width: auto;\n    }\n\n    .chat-message-item.incoming {\n        float: left;\n        border-radius: 0 10px 10px 0;\n        border-left-width: 3px;\n        border-left-style: solid;\n    }\n\n    .chat-message-item.outgoing {\n        float: right;\n        border-radius: 10px 0 0 10px;\n        border-right-width: 3px;\n        border-right-style: solid;\n    }\n\n.chat-message-item-container {\n    width: 100%;\n    display: inline-block;\n}\n\napp-chat-thread {\n    max-width: 500px;\n}\n\n.dots {\n    width: 100%;\n    height: 100%;\n    background-image: linear-gradient(transparent 0px, transparent 2px, rgb(255, 255, 255) 2px, rgb(255, 255, 255) 20px), linear-gradient(to right, rgb(200, 195, 199) 0px, rgb(200, 195, 199) 2px, rgb(255, 255, 255) 2px, rgb(255, 255, 255) 20px);\n    background-position: 437px -2px;\n    background-size: 20px 20px;\n}\n\n.chat-text {\n}\n\n.chat-time {\n    font-size: 8px;\n    position: absolute;\n    bottom: 2px;\n    right: 8px;\n}\n\n    .chat-time > span {\n        opacity: 0.4;\n    }\n\n.chat-stub {\n    width: 0;\n    height: 0;\n    bottom: -13px;\n    display: none;\n}\n\n.incoming > .chat-stub {\n    border-top-width: 13px;\n    border-top-style: solid;\n    border-left: 15px solid transparent;\n    position: absolute;\n    left: -3px;\n}\n\n.outgoing > .chat-stub {\n    border-top-width: 13px;\n    border-top-style: solid;\n    border-right: 15px solid transparent;\n    position: absolute;\n    right: -3px;\n}\n\n.chat-message-last {\n    margin-bottom: 15px;\n}\n\n    .chat-message-last > .chat-stub {\n        display: block;\n    }\n\n.chat-bottom-overlay {\n    background-color: rgba(0, 0, 0, 0.5);\n    width: 100%;\n    position: absolute;\n    bottom: 0;\n    right: 0;\n    color: white;\n    font-size: 9.6px;\n    font-style: italic;\n    padding: 5px 10px;\n}\n\n.outgoing * .chat-bottom-overlay {\n    border-radius: 0 0 0 10px;\n}\n\n.incoming * .chat-bottom-overlay {\n    border-radius: 0 0 10px 0;\n}\n\n.media > .chat-time {\n    color: white;\n    opacity: 1;\n    bottom: 5px;\n}\n\n.chat-media > audio {\n    width: 230px;\n    margin-bottom: 19px;\n}\n\nvideo.chat-media {\n    margin-bottom: 19px;\n}\n\n\n/*\nGreen dot up\nCarousel left right button background\nCarousel left right vertical center\nbg white\n*/\n\n.chat-input-container {\n    background-color: #F5F5F5;\n    border-radius: 0 0 10px 10px;\n}\n\n.chat-input {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    width: 100%;\n}\n\n    .chat-input.click {\n        display: inline;\n        float: left;\n        width: auto;\n    }\n\n    .chat-input.text {\n        background-color: white;\n        border-radius: 0 0 10px 10px;\n        box-shadow: 0px -3px 11px 0px rgba(0, 0, 0, 0.05);\n    }\n\n    .chat-input button.btn-click {\n        border-radius: 4px;\n        padding: 7px 23px;\n        border: transparent;\n        margin: 0 10px 10px 10px;\n        white-space: nowrap;\n    }\n\n    .chat-input button.btn-icon {\n        font-size: 20px;\n        border: none;\n        background: none;\n        padding: 0 14px;\n        opacity: 0.8;\n    }\n\n        .chat-input button.btn-icon:disabled {\n            opacity: 0.10;\n        }\n\n    .chat-input i {\n        font-size: 20px;\n    }\n\n.chat-text-input {\n    border: none;\n    vertical-align: middle;\n    padding: 12px 16px;\n    width: 100%;\n    outline: none;\n    color: black;\n}\n\n.chat-input-click-container {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: row;\n            flex-direction: row;\n    -webkit-box-align: center;\n        -ms-flex-align: center;\n            align-items: center;\n    overflow-x: auto;\n    background-color: transparent;\n    /*Remove below for click buttons to scroll horizontally*/\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n    -ms-flex-wrap: wrap;\n        flex-wrap: wrap;\n    border-radius: 10px;\n}\n\n.chat-file-attachment {\n    height: 60px !important;\n    background-color: white !important;\n}\n\n.ana-sent-tick {\n    -webkit-transform: translateY(1px);\n            transform: translateY(1px);\n}\n\n.ana-delivered-tick {\n    -webkit-transform: translateY(1px);\n            transform: translateY(1px);\n}\n\n.carousel-wrapper {\n    position: relative;\n    margin: 0 -20px;\n}\n\n    .carousel-wrapper > .carousel-arrow {\n        position: absolute;\n        top: 50%;\n        padding: 5px 0 0;\n        cursor: pointer;\n        -webkit-transform: translateY(-50%);\n                transform: translateY(-50%);\n        background-color: white;\n        opacity: 0.85;\n    }\n\n        .carousel-wrapper > .carousel-arrow:hover {\n            opacity: 1;\n        }\n\n        .carousel-wrapper > .carousel-arrow.right {\n            right: 0;\n            box-shadow: -1px 0px 1px 1px rgba(0,0,0,0.1);\n            border-radius: 5px 0 0 5px;\n        }\n\n        .carousel-wrapper > .carousel-arrow.left {\n            left: 0;\n            box-shadow: 1px 0px 1px 1px rgba(0,0,0,0.1);\n            border-radius: 0 5px 5px 0;\n        }\n\n.carousel-arrow.right svg {\n    width: 24px;\n    height: 24px;\n    -webkit-transform: rotate(-90deg);\n    transform: rotate(-90deg);\n    fill: #333;\n}\n\n.carousel-arrow.left svg {\n    width: 24px;\n    height: 24px;\n    fill: #333;\n    -webkit-transform: rotate(90deg);\n    transform: rotate(90deg);\n}\n\n.carousel-container {\n    width: 100%;\n    overflow-x: auto;\n    white-space: nowrap;\n    margin-bottom: 5px;\n    margin-top: 5px;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -ms-flex-direction: row;\n    -webkit-box-orient: horizontal;\n    -webkit-box-direction: normal;\n            flex-direction: row;\n}\n\n.carousel-item-media > img,\n.carousel-item-media > video,\n.carousel-item-media > audio {\n    width: 100%;\n    border-radius: inherit;\n}\n\n\n\n.carousel-item-media {\n    padding: 20px 0;\n    overflow: hidden;\n    border-radius: 5px;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: column;\n            flex-direction: column;\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n    min-height: 170px;\n}\n\n.carousel-item {\n    width: 240px;\n    margin: 0 10px;\n    border-radius: 10px;\n    background-color: white;\n    height: 100%;\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: column;\n            flex-direction: column;\n    box-shadow: 0px 1px 6px 1px rgba(110, 110, 110, 0.15);\n}\n\n.carousel-item-content {\n    padding: 0 20px;\n    -webkit-box-flex: 1;\n        -ms-flex-positive: 1;\n            flex-grow: 1;\n}\n\n    .carousel-item-content.no-media {\n        padding: 10px 20px;\n    }\n\n.carousel-item-container {\n    margin-bottom: 5px;\n    padding: 3px; /*For carousel item shadow to be visible*/\n}\n\n.carousel-item-title {\n    font-weight: bold;\n    margin: �0 0 2px 0;\n    overflow: hidden;\n}\n\n.carousel-item-desc {\n    color: gray;\n    font-size: 11px;\n    margin: 2px 0 10px 0;\n}\n\n.carousel-item-button > button {\n    width: 100%;\n    border-top: 1px solid #ccc;\n    border-radius: 0;\n    text-align: left;\n    font-weight: bold;\n    text-transform: uppercase;\n    font-size: x-small;\n    text-align: center;\n    font-family: 'Open Sans';\n}\n\n.text-wrap {\n    white-space: normal;\n}\n\n.carousel-container > table {\n    margin-bottom: 10px;\n}\n\n.ana-title {\n    padding: 10px 15px;\n    z-index: 100;\n    position: relative;\n    border-radius: 10px 10px 0 0;\n}\n\n.ana-min .ana-title {\n    margin-top: 20px;\n    box-shadow: 0px 1px 6px 1px rgba(0,0,0,0.36);\n    margin-left: 6px;\n    margin-right: 6px;\n}\n\n.ana-logo {\n    display: inline;\n    float: left;\n    margin: 0 15px -4px 0;\n}\n\n    .ana-logo > img {\n        width: 35px;\n        height: 35px;\n        border-radius: 0 7px 7px 7px;\n        box-shadow: 0px 0px 25px 3px rgba(0,0,0,0.19);\n        margin-top: 4px;\n    }\n\n.ana-content {\n    display: -webkit-box;\n    display: -ms-flexbox;\n    display: flex;\n    -webkit-box-orient: vertical;\n    -webkit-box-direction: normal;\n        -ms-flex-direction: column;\n            flex-direction: column;\n    float: left;\n    width: 70%;\n}\n\n    .ana-content > .title {\n        font-weight: bold;\n        font-size: 18px;\n        position: relative;\n    }\n\n    .ana-content > .subtitle {\n        font-size: 11px;\n        opacity: 0.9;\n    }\n\n.ana-actions {\n    display: inline;\n    float: right;\n    margin-top: 5px;\n}\n\n    .ana-actions .ana-action {\n        opacity: 0.6;\n        height: 24px;\n        width: 24px;\n        padding: 4px;\n        border-radius: 3px;\n        cursor: pointer;\n    }\n\n        .ana-actions .ana-action:hover {\n            opacity: 1;\n            background-color: rgba(0,0,0,0.1);\n        }\n\n        .ana-actions .ana-action svg {\n            height: 16px;\n            width: 16px;\n        }\n\n            .ana-actions .ana-action svg path {\n                fill: #fff;\n            }\n\n.ana-minmax-btn {\n    border-radius: 3px;\n    height: 3px;\n    width: 15px;\n    opacity: 0.6;\n    position: absolute;\n    top: 10px;\n    right: 10px;\n}\n\n.ana-min .ana-minmax-btn {\n    border-radius: 2px;\n    height: 11px;\n    background-color: transparent;\n    width: 11px;\n}\n\n.ana-min .ana-logo {\n    -webkit-transform: translateY(-22px);\n            transform: translateY(-22px);\n}\n\n    .ana-min .ana-logo > img {\n        box-shadow: 0px 1px 6px 1px rgba(0,0,0,0.36);\n    }\n\n.input-msg {\n    background-color: white;\n    padding: 5px 16px;\n    font-size: 10px;\n    color: crimson;\n}\n\n.typing-indicator-container {\n    display: table-cell;\n}\n\n.typing-indicator {\n    width: auto;\n    display: table;\n    position: relative;\n}\n\n    .typing-indicator span {\n        height: 6px;\n        width: 6px;\n        float: left;\n        margin: 0 1px;\n        display: block;\n        border-radius: 50%;\n        opacity: 0.4;\n    }\n\n        .typing-indicator span:nth-of-type(1) {\n            -webkit-animation: 1s blink infinite 0.3333s;\n            animation: 1s blink infinite 0.3333s;\n        }\n\n        .typing-indicator span:nth-of-type(2) {\n            -webkit-animation: 1s blink infinite 0.6666s;\n            animation: 1s blink infinite 0.6666s;\n        }\n\n        .typing-indicator span:nth-of-type(3) {\n            -webkit-animation: 1s blink infinite 0.9999s;\n            animation: 1s blink infinite 0.9999s;\n        }\n\n@-webkit-keyframes blink {\n    50% {\n        opacity: 1;\n    }\n}\n\n@keyframes blink {\n    50% {\n        opacity: 1;\n    }\n}\n\n@-webkit-keyframes bulge {\n    50% {\n        -webkit-transform: scale(1.05);\n        transform: scale(1.05);\n    }\n}\n\n@keyframes bulge {\n    50% {\n        -webkit-transform: scale(1.05);\n        transform: scale(1.05);\n    }\n}\n\n.scrollbar::-webkit-scrollbar-track {\n    background-color: transparent;\n}\n\n.scrollbar::-webkit-scrollbar {\n    width: 5px;\n    height: 5px;\n    background-color: transparent;\n}\n\n.scrollable::-webkit-scrollbar * {\n    background: transparent;\n}\n\n.scrollbar::-webkit-scrollbar-thumb {\n    border-radius: 10px !important;\n    -webkit-box-shadow: inset 0 0 6px rgba(0,0,0,.3) !important;\n    background-color: rgba(0,0,0,.3) !important;\n}\n\n.carousel-item-container:first-child > .carousel-item {\n    margin-left: 16px;\n}\n\n.carousel-item-container:last-child > .carousel-item {\n    margin-right: 16px;\n}\n\n.carousel-arrow > i {\n    color: rgba(0,0,0,.6);\n}\n\n.ana-link {\n    color: inherit;\n    text-decoration: underline;\n}\n\n.chat-bottom-overlay > img {\n    height: 12px;\n    width: 12px;\n}\n\n.ana-online-dot {\n    border-radius: 5px;\n    height: 6px;\n    width: 6px;\n    background-color: #00DF50;\n    border: 1px solid white;\n    margin-top: 7px;\n    margin-right: 5px;\n    display: inline-block;\n}\n\n.chat-history-loading {\n    position: absolute;\n    bottom: -2px;\n    z-index: 100;\n    text-align: center;\n    width: 100%;\n    margin: 0 -20px 0 -15px;\n}\n\n    .chat-history-loading > mat-progress-spinner {\n        display: inline-block;\n        height: 50px;\n        width: 50px;\n    }\n\n@media only screen and (min-device-width : 320px) and (max-device-width : 480px) {\n    .root {\n        border-radius: 0;\n    }\n\n    .ana-title {\n        border-radius: 0;\n    }\n}\n", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/components/chat-thread/chat-thread.component.html":
/***/ (function(module, exports) {

module.exports = "<div class=\"root\" [ngClass]=\"{'ana-min': isMin}\">\n    <div class=\"content\">\n        <div class=\"ana-title\">\n            <div class=\"ana-logo\">\n                <img [src]=\"settings.brandingConfig.logoUrl\" class=\"ana-full\" />\n            </div>\n            <div class=\"ana-content\">\n                <div class=\"title\">{{settings.brandingConfig.agentName}}</div>\n                <!-- <div class=\"subtitle\">\n                    <span *ngIf=\"settings.brandingConfig.agentDesc\">\n                        <span *ngIf=\"connectionStatusMessage()!='Available'\">\n                            {{settings.brandingConfig.agentDesc}} - <i *ngIf=\"connectionStatusMessage()=='Available'\" [title]=\"connectionStatusMessage()\" class=\"ana-online-dot\"></i> {{ connectionStatusMessage()}}\n                        </span>\n                        <span *ngIf=\"connectionStatusMessage()=='Available'\">\n                            {{settings.brandingConfig.agentDesc}} <i [title]=\"connectionStatusMessage()\" class=\"ana-online-dot\"></i>\n                        </span>\n                    </span>\n                    <span *ngIf=\"!settings.brandingConfig.agentDesc\">\n                        <i *ngIf=\"connectionStatusMessage()=='Available'\" [title]=\"connectionStatusMessage()\" class=\"ana-online-dot\"></i>{{connectionStatusMessage()}}\n                    </span>\n                </div> -->\n            </div>\n            <div class=\"ana-actions\">\n                <div class=\"ana-action\" title=\"Start a fresh chat\" (click)=\"getStarted(true, true)\" [hidden]=\"!settings.appConfig.allowFlowReset\">\n                    <svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"0 0 15.279 15.279\">\n                        <path d=\"M7.599 1.918v-1.8c0-.1.125-.154.209-.091l3.7 2.719a.114.114 0 0 1 0 .184l-3.7 2.719c-.084.062-.21.006-.21-.09V3.76A4.843 4.843 0 0 0 2.847 8.93c.159 2.4 2.115 4.347 4.515 4.5a4.849 4.849 0 0 0 5.094-4.06.92.92 0 0 1 .912-.771c.56 0 .994.497.907 1.047-.544 3.428-3.703 6-7.366 5.59-3.062-.343-5.522-2.793-5.869-5.856C.58 5.374 3.692 1.961 7.6 1.918z\" />\n                    </svg>\n                </div>\n            </div>\n            <div class=\"chat-history-loading\" [hidden]=\"!fetchingHistory\">\n                <md-progress-bar mode=\"indeterminate\" color=\"primary\"></md-progress-bar>\n            </div>\n        </div>\n        <div class=\"chat-thread scrollbar\" #chatThreadView (scroll)=\"chatThreadOnScroll($event)\">\n            <div class=\"chat-message\" *ngFor=\"let msg of chatThread.messages\">\n                <div [ngSwitch]=\"msg.messageData.type\">\n                    <ng-container *ngSwitchCase=\"MH.MessageType.SIMPLE\">\n                        <div class=\"chat-message-item-container\">\n                            <div class=\"chat-message-item\" [ngClass]=\"{'media': msg.getMessageContentType()==MH.MessageContentType.Media, 'text':msg.getMessageContentType()==MH.MessageContentType.Text, 'typing':msg.getMessageContentType()==MH.MessageContentType.Typing, 'incoming':msg.direction==MH.Direction.Incoming, 'outgoing':msg.direction==MH.Direction.Outgoing, 'chat-message-last': isLastInMessageGroup(msg)}\">\n                                <div [ngSwitch]=\"msg.getMessageContentType()\">\n                                    <ng-container *ngSwitchCase=\"MH.MessageContentType.Text\">\n                                        <span class=\"chat-text\" *ngIf=\"!settings.appConfig.htmlMessages\">{{msg.messageData.content.text}}</span>\n                                        <span class=\"chat-text\" *ngIf=\"settings.appConfig.htmlMessages\" [innerHTML]=\"msg.messageData.content.text\"></span>\n                                    </ng-container>\n                                    <ng-container *ngSwitchCase=\"MH.MessageContentType.Typing\">\n                                        <div class=\"typing-indicator-container\">\n                                            <div class=\"typing-indicator\">\n                                                <span></span>\n                                                <span></span>\n                                                <span></span>\n                                            </div>\n                                        </div>\n                                    </ng-container>\n                                    <ng-container *ngSwitchCase=\"MH.MessageContentType.Media\">\n                                        <div [ngSwitch]=\"msg.messageData.content.media.type\">\n                                            <ng-container *ngSwitchCase=\"MH.MediaType.IMAGE\">\n                                                <img [src]=\"msg.messageData.content.media.url\" class=\"chat-media\" (click)=\"openWindow(msg.messageData.content.media.url)\" [class.clickable]=\"msg.messageData.content.media.url\" />\n                                                <span class=\"chat-bottom-overlay\">\n                                                    <img src=\"assets/svg/picture.svg\" />&nbsp; {{msg.messageData.content.text||'Photo'}}\n                                                </span>\n                                            </ng-container>\n                                            <ng-container *ngSwitchCase=\"MH.MediaType.VIDEO\">\n                                                <video controls=\"controls\" class=\"chat-media\" (click)=\"openWindow(msg.messageData.content.media.url)\" [class.clickable]=\"msg.messageData.content.media.url\">\n                                                    <source [src]=\"msg.messageData.content.media.url\" />\n                                                </video>\n                                                <span class=\"chat-bottom-overlay\">\n                                                    <img src=\"assets/svg/video-from-gallery.svg\" />&nbsp; {{msg.messageData.content.text||'Video'}}\n                                                </span>\n                                            </ng-container>\n                                            <ng-container *ngSwitchCase=\"MH.MediaType.AUDIO\">\n                                                <div class=\"chat-media\">\n                                                    <audio controls=\"controls\">\n                                                        <source [src]=\"msg.messageData.content.media.url\" />\n                                                    </audio>\n                                                </div>\n                                                <span class=\"chat-bottom-overlay\">\n                                                    <img src=\"assets/svg/record-voice.svg\" />&nbsp; {{msg.messageData.content.text||'Audio'}}\n                                                </span>\n                                            </ng-container>\n                                            <ng-container *ngSwitchCase=\"MH.MediaType.FILE\">\n                                                <img src=\"assets/svg/attachment.svg\" class=\"chat-media chat-file-attachment\" />\n                                                <span class=\"chat-bottom-overlay\">\n                                                    <img src=\"assets/svg/attachment-white.svg\" />&nbsp; {{msg.messageData.content.text||'File'}}\n                                                </span>\n                                            </ng-container>\n                                        </div>\n                                    </ng-container>\n                                </div>\n                                <span class=\"chat-time\" [hidden]=\"msg.getMessageContentType()==MH.MessageContentType.Typing\">\n                                    <span *ngIf=\"msg.direction==MH.Direction.Outgoing && msg.status==MH.MessageStatus.SentTimeout\"><a href=\"javascript:;\" (click)=\"msg.executeRetry()\" class=\"ana-link ana-btn-retry\">Retry</a></span>\n                                    <span *ngIf=\"!msg.isToday()\">\n                                        {{msg.time | date:'MMM d, h:mm a'}}\n                                    </span>\n                                    <span *ngIf=\"msg.isToday()\">\n                                        {{msg.time | date:'shortTime'}}\n                                    </span>\n                                    <svg class=\"ana-sent-tick\" *ngIf=\"msg.direction==MH.Direction.Outgoing && msg.status==MH.MessageStatus.ReceivedAtServer\" xmlns=\"http://www.w3.org/2000/svg\" width=\"10\" height=\"10\">\n                                        <path d=\"M9.887 1.475a.385.385 0 0 0-.544 0L3.11 7.709.657 5.257a.385.385 0 1 0-.544.544l2.724 2.724c.15.15.394.15.544 0L9.887 2.02a.385.385 0 0 0 0-.544z\" />\n                                    </svg>\n                                    <svg class=\"ana-delivered-tick\" *ngIf=\"msg.direction==MH.Direction.Outgoing && msg.status==MH.MessageStatus.DelieveredToTarget\" xmlns=\"http://www.w3.org/2000/svg\" width=\"10\" height=\"10\">\n                                        <path d=\"M7.554 2.725l-.601-.6-2.704 2.703.6.601 2.705-2.704zm1.802-.6L4.85 6.673 3.047 4.87l-.6.601L4.85 7.876 10 2.726l-.644-.602zM0 5.471l2.403 2.404.601-.601L.601 4.87 0 5.472z\" />\n                                    </svg>\n                                </span>\n                                <span class=\"chat-stub\"></span>\n                            </div>\n                        </div>\n                    </ng-container>\n                    <ng-container *ngSwitchCase=\"MH.MessageType.CAROUSEL\">\n                        <div class=\"carousel-wrapper\">\n                            <div #carouselContainer class=\"carousel-container scrollbar\" [ngClass]=\"msg.meta.id\">\n                                <div *ngFor=\"let carItem of msg.messageData.content.items\" class=\"carousel-item-container\">\n                                    <div class=\"carousel-item\">\n                                        <div class=\"carousel-item-content\" [class.no-media]=\"!carouselItemHasMedia(carItem)\">\n                                            <div *ngIf=\"carouselItemHasMedia(carItem)\">\n                                                <div [ngSwitch]=\"carItem.media.type\" class=\"carousel-item-media\">\n                                                    <ng-container *ngSwitchCase=\"MH.MediaType.IMAGE\">\n                                                        <img [src]=\"carItem.media.url\" />\n                                                    </ng-container>\n                                                    <ng-container *ngSwitchCase=\"MH.MediaType.VIDEO\">\n                                                        <video controls [src]=\"carItem.media.url\"></video>\n                                                    </ng-container>\n                                                    <ng-container *ngSwitchCase=\"MH.MediaType.AUDIO\">\n                                                        <audio controls [src]=\"carItem.media.url\"></audio>\n                                                    </ng-container>\n                                                </div>\n                                            </div>\n                                            <div class=\"carousel-item-title text-wrap\">\n                                                {{carItem.title}}\n                                            </div>\n                                            <div class=\"carousel-item-desc text-wrap\">\n                                                {{carItem.desc}}\n                                            </div>\n                                        </div>\n                                        <div class=\"carousel-item-button-container\">\n                                            <div class=\"carousel-item-button\" *ngFor=\"let carBtn of carItem.options\">\n                                                <button md-button (click)=\"handleCarouselClick(msg, carBtn)\" [disabled]=\"!isLastMessage(msg)\">{{carBtn.title}}</button>\n                                            </div>\n                                        </div>\n                                    </div>\n                                </div>\n                            </div>\n                            <div class=\"carousel-arrow right\" (click)=\"scrollCarousel(msg.meta.id, 'right')\" [hidden]=\"!canScrollCarousel(msg.meta.id,'right')\">\n                                <svg>\n                                    <path d=\"M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z\"></path>\n                                </svg>\n                            </div>\n                            <div class=\"carousel-arrow left\" (click)=\"scrollCarousel(msg.meta.id, 'left')\" [hidden]=\"!canScrollCarousel(msg.meta.id,'left')\">\n                                <svg>\n                                    <path d=\"M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z\"></path>\n                                </svg>\n                            </div>\n                        </div>\n                    </ng-container>\n                </div>\n            </div>\n        </div>\n\n        <div class=\"chat-input-container\" #inputContainer>\n            <div *ngIf=\"chatInput.clickInput\">\n                <div [ngSwitch]=\"chatInput.clickInput.content.inputType\">\n                    <ng-container *ngSwitchCase=\"MH.InputType.OPTIONS\">\n                        <div class=\"chat-input-click-container\">\n                            <div *ngFor=\"let option of chatInput.clickInput.content.options\" class=\"chat-input click\">\n                                <button type=\"button\" class=\"btn-click\" (click)=\"chatInput.handleBtnOptionClick(chatInput.clickInput, option.value)\">{{option.title}}</button>\n                            </div>\n                        </div>\n                    </ng-container>\n                    <ng-container *ngSwitchDefault>\n                        <div class=\"chat-input-click-container\">\n                            <div class=\"chat-input click\">\n                                <button type=\"button\" class=\"btn-click\" (click)=\"chatInput.handleClick(chatInput.clickInput)\">{{chatInput.clickInputTitle()}}</button>\n                            </div>\n                        </div>\n                    </ng-container>\n                </div>\n            </div>\n\n            <div class=\"chat-input text\" *ngIf=\"chatInput.textInput\">\n                <input [type]=\"chatInput.htmlInputType(chatInput.textInput)\" [readonly]=\"chatInput.textInput.disabled\" (keypress)=\"chatInput.handleKeyPress(chatInput.textInput, $event)\" name=\"chat-text\" id=\"chat-text\" class=\"chat-text-input\" [(ngModel)]=\"chatInput.textInput.content.input.val\" [placeholder]=\"((chatInput.textInput.disabled? 'Waiting for response':(chatInput.textInput.content.textInputAttr?(chatInput.textInput.content.textInputAttr.placeHolder?chatInput.textInput.content.textInputAttr.placeHolder:''):'')))\" [maxlength]=\"(chatInput.textInput.content.textInputAttr?chatInput.textInput.content.textInputAttr.maxLength:'')\" (focus)=\"chatTextInputOnFocus()\" />\n                <button type=\"button\" class=\"btn-icon\" [disabled]=\"!chatInput.textInput.content.input.val\" (click)=\"chatInput.handleClick(chatInput.textInput)\">\n                    <svg xmlns=\"http://www.w3.org/2000/svg\" width=\"24\" height=\"24\"><path class=\"send-button\" d=\"M23.878.983a.359.359 0 0 0-.388-.056L.208 11.745a.359.359 0 0 0-.007.647l6.589 3.234c.12.06.265.046.372-.035l6.407-4.788-5.03 5.173a.359.359 0 0 0-.1.278l.5 6.52a.359.359 0 0 0 .63.208l3.497-4.053 4.323 2.066a.358.358 0 0 0 .497-.217L23.983 1.36a.359.359 0 0 0-.105-.377z\" /></svg>\n                </button>\n            </div>\n        </div>\n    </div>\n</div>\n"

/***/ }),

/***/ "../../../../../src/app/components/chat-thread/chat-thread.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ChatThreadComponent; });
/* unused harmony export ModelHelpers */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_material__ = __webpack_require__("../../../material/@angular/material.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__ = __webpack_require__("../../../../../src/app/models/ana-chat.models.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__ = __webpack_require__("../../../../../src/app/models/ana-chat-vm.models.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__services_stomp_service__ = __webpack_require__("../../../../../src/app/services/stomp.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__services_simulator_service__ = __webpack_require__("../../../../../src/app/services/simulator.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__services_api_service__ = __webpack_require__("../../../../../src/app/services/api.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_7__services_utilities_service__ = __webpack_require__("../../../../../src/app/services/utilities.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_8__services_chain_delay_service__ = __webpack_require__("../../../../../src/app/services/chain-delay.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_9__angular_platform_browser__ = __webpack_require__("../../../platform-browser/@angular/platform-browser.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_10__services_info_dialog_service__ = __webpack_require__("../../../../../src/app/services/info-dialog.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_11__services_resolver_service__ = __webpack_require__("../../../../../src/app/services/resolver.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};












//import { SimulatorService } from '../../services/simulator.service';
var ChatThreadComponent = (function () {
    function ChatThreadComponent(stompService, apiService, dialog, sample, simulator, sanitizer, infoDialog, chainDelayService) {
        var _this = this;
        this.stompService = stompService;
        this.apiService = apiService;
        this.dialog = dialog;
        this.sample = sample;
        this.simulator = simulator;
        this.sanitizer = sanitizer;
        this.infoDialog = infoDialog;
        this.chainDelayService = chainDelayService;
        this.isMin = false;
        this.carItemWidth = 245;
        this.fetchingHistory = false;
        this.lastScrollTop = 0;
        this._handleMessageReceivedDelegate = function (message) {
            if (_this.settings && _this.settings.stompConfig && _this.settings.stompConfig.debug) {
                console.log("Socket Message Received: ");
                console.log(message);
            }
            switch (message.data.type) {
                case __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["i" /* MessageType */].INPUT:
                    {
                        _this.chainDelayService.delay(function (queueLength) {
                            _this.chatInput.resetInputs(); //Currently only one input item is supported
                            _this.chatInput.setInput(new __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["a" /* ChatInputItemVM */](message));
                            _this.chatThread.removeTyping();
                            _this.textInputFocus();
                        }, 0);
                        break;
                    }
                case __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["i" /* MessageType */].SIMPLE:
                case __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["i" /* MessageType */].CAROUSEL:
                    {
                        _this.chatThread.setTyping();
                        _this.chainDelayService.delay(function (queueLength) {
                            var msg = new __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["c" /* ChatMessageVM */](message, __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["e" /* Direction */].Incoming, "");
                            _this.chatThread.addMessage(msg);
                            if (message.data.type == __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["i" /* MessageType */].CAROUSEL) {
                                var carItemsWithOptions = msg.carouselMessageData().content.items.filter(function (x) { return x.options && x.options.length > 0; }).length;
                                if (carItemsWithOptions > 0)
                                    _this.chatInput.resetInputs();
                            }
                            if (queueLength > 0)
                                _this.chatThread.setTyping();
                        }, 2000);
                        break;
                    }
                default:
                    console.log("Unsupported message type: " + __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["i" /* MessageType */][message.data.type]);
            }
        };
        this.MH = new ModelHelpers();
        this.chatThread = new __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["d" /* ChatThreadVM */](this.sanitizer);
        this.chatInput = new __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["b" /* ChatInputVM */](this.dialog, this.chatThread, this.apiService, this.stompService, this, this.sanitizer);
    }
    ChatThreadComponent.prototype.ngAfterViewInit = function () {
        if (this.chatThreadView)
            this.chatThread.chatThreadView = this.chatThreadView.nativeElement;
    };
    ChatThreadComponent.prototype.connectionStatusMessage = function () {
        if (!this.stompService)
            return '';
        switch (this.stompService.connectionStatus) {
            case __WEBPACK_IMPORTED_MODULE_4__services_stomp_service__["a" /* StompConnectionStatus */].Connected:
                return 'Available';
            case __WEBPACK_IMPORTED_MODULE_4__services_stomp_service__["a" /* StompConnectionStatus */].Connecting:
                return 'Trying to connect...';
            case __WEBPACK_IMPORTED_MODULE_4__services_stomp_service__["a" /* StompConnectionStatus */].Disconnected:
                return 'Not available';
            default:
                return '';
        }
    };
    ChatThreadComponent.prototype.setMin = function (min) {
        this.isMin = min;
    };
    ChatThreadComponent.prototype.scrollCarousel = function (carId, direction) {
        if (this.carouselContainers && this.carouselContainers.length > 0) {
            var carousels = this.carouselContainers.map(function (x) { return x.nativeElement; }).filter(function (x) { return x.classList.contains(carId); });
            if (carousels) {
                var car = carousels[0];
                if (direction == 'right') {
                    if (car.scrollBy) {
                        car.scrollBy({ behavior: 'smooth', left: this.carItemWidth }); //The 'left' value should be the width + margin of a single carousel item set in the CSS
                    }
                    else {
                        car.scrollLeft += this.carItemWidth;
                    }
                }
                else if (direction == 'left') {
                    if (car.scrollBy) {
                        car.scrollBy({ behavior: 'smooth', left: -this.carItemWidth });
                    }
                    else {
                        car.scrollLeft -= this.carItemWidth;
                    }
                }
            }
        }
    };
    ChatThreadComponent.prototype.canScrollCarousel = function (carId, direction) {
        return true;
        //Below implementation is not accurate.
        //if (this.carouselContainers && this.carouselContainers.length > 0) {
        //    let carousels = this.carouselContainers.map(x => x.nativeElement as HTMLDivElement).filter(x => x.classList.contains(carId));
        //    if (carousels) {
        //        let car = carousels[0];
        //        if (direction == 'right')
        //            return car.scrollLeft < car.scrollWidth;
        //        else if (direction == 'left')
        //            return car.scrollLeft > 0;
        //    }
        //}
    };
    ChatThreadComponent.prototype.isLastInMessageGroup = function (msg) {
        var msgsOnly = this.chatThread.messages.filter(function (x) { return x.getMessageContentType() != __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["h" /* MessageContentType */].Typing; });
        var index = msgsOnly.indexOf(msg);
        if (index != -1) {
            if (index >= (msgsOnly.length - 1))
                return true;
            if (msgsOnly[index].direction != msgsOnly[index + 1].direction)
                return true;
        }
        return false;
    };
    ChatThreadComponent.prototype.isLastMessage = function (msg) {
        var msgsOnly = this.chatThread.messages.filter(function (x) { return x.getMessageContentType() != __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["h" /* MessageContentType */].Typing; });
        var index = msgsOnly.indexOf(msg);
        return index == msgsOnly.length - 1;
    };
    ChatThreadComponent.prototype.handleCarouselClick = function (chatMessage, carOption) {
        var carMsg = chatMessage.carouselMessageData();
        if (!carMsg.content.input)
            carMsg.content.input = {
                val: ""
            };
        if (carOption.type == __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["c" /* ButtonType */].URL) {
            var v = JSON.parse(carOption.value);
            carMsg.content.input.val = v.value;
            window.open(v.url, '_blank');
        }
        else
            carMsg.content.input.val = carOption.value;
        var msg = this.chatThread.addTextReply(carOption.title, __WEBPACK_IMPORTED_MODULE_7__services_utilities_service__["b" /* UtilitiesService */].uuidv4());
        this._sendMessageDelegate(new __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["a" /* ANAChatMessage */]({
            meta: __WEBPACK_IMPORTED_MODULE_7__services_utilities_service__["b" /* UtilitiesService */].getReplyMeta(chatMessage.meta),
            data: carMsg
        }), msg);
        this.chatInput.resetInputs();
    };
    ChatThreadComponent.prototype.insertThreadMessageForCarouselInput = function (chatMessage) {
        var _this = this;
        try {
            var carMsg_1 = chatMessage.carouselMessageData();
            var msg_1 = null;
            carMsg_1.content.items.forEach(function (x) {
                try {
                    x.options.forEach(function (y) {
                        try {
                            var value = "";
                            if (y.type == __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["c" /* ButtonType */].URL) {
                                var v = JSON.parse(y.value);
                                value = v.value;
                            }
                            else
                                value = y.value;
                            if (value == carMsg_1.content.input.val)
                                msg_1 = _this.chatThread.addTextReply(y.title, "", chatMessage.meta.timestamp, true);
                        }
                        catch (e) {
                            console.log(e);
                        }
                    });
                }
                catch (e) {
                    console.log(e);
                }
            });
            return msg_1;
        }
        catch (e) {
            console.log(e);
            return null;
        }
    };
    ChatThreadComponent.prototype.chatThreadOnScroll = function (event) {
        var _this = this;
        if (!this.chatThread.chatThreadView)
            return;
        if (!this.settings || this.settings.simulatorMode)
            return;
        var currentScrollTop = this.chatThread.chatThreadView.scrollTop;
        if (currentScrollTop < this.lastScrollTop) {
            if (this.fetchingHistory)
                return;
            if (this.chatThread.chatThreadView) {
                if (this.chatThread.chatThreadView.scrollTop <= 2) {
                    this.fetchingHistory = true;
                    this.loadHistory(function () { return _this.fetchingHistory = false; });
                }
            }
        }
        this.lastScrollTop = currentScrollTop;
    };
    ChatThreadComponent.prototype.chatTextInputOnFocus = function () {
        this.chatThread.scrollLastIntoView(1000);
    };
    ChatThreadComponent.prototype.textInputFocus = function () {
        var ele = this.inputContainerRef.nativeElement;
        if (ele) {
            setTimeout(function () {
                var inputEle = ele.querySelector('#chat-text');
                if (inputEle)
                    inputEle.focus();
            }, 100);
        }
    };
    ChatThreadComponent.prototype.loadHistory = function (next) {
        var _this = this;
        if (!this.settings || this.settings.simulatorMode)
            return;
        var oldMsgTimestamp = ((this.chatThread.messages && this.chatThread.messages.length > 0) ? this.chatThread.messages[0].meta.timestamp : null);
        var oldScrollHeight = null;
        if (this.chatThread.chatThreadView)
            oldScrollHeight = this.chatThread.chatThreadView.scrollHeight;
        this.apiService.fetchHistory(oldMsgTimestamp).subscribe(function (resp) {
            try {
                var chatMsgs = resp.content.map(function (x) { return new __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["a" /* ANAChatMessage */](x); });
                for (var i = 0; i < chatMsgs.length; i++) {
                    var chatMsg = chatMsgs[i];
                    var direction = chatMsg.meta.recipient.id == _this.stompService.config.businessId ? __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["e" /* Direction */].Outgoing : __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["e" /* Direction */].Incoming;
                    switch (chatMsg.data.type) {
                        case __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["i" /* MessageType */].CAROUSEL:
                            if (direction == __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["e" /* Direction */].Incoming)
                                _this.chatThread.addMessage(new __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["c" /* ChatMessageVM */](chatMsg, direction, ""), true);
                            else if (direction == __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["e" /* Direction */].Outgoing)
                                _this.insertThreadMessageForCarouselInput(new __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["c" /* ChatMessageVM */](chatMsg, direction, ""));
                            break;
                        case __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["i" /* MessageType */].SIMPLE:
                            if (direction == __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["e" /* Direction */].Incoming)
                                _this.chatThread.addMessage(new __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["c" /* ChatMessageVM */](chatMsg, direction, ""), true);
                            break;
                        case __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["i" /* MessageType */].INPUT:
                            if (direction == __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["e" /* Direction */].Outgoing) {
                                _this.chatInput.insertThreadMessageForInput(new __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["a" /* ChatInputItemVM */](chatMsg));
                            }
                            break;
                        default:
                            break;
                    }
                }
                if (!oldMsgTimestamp) {
                    if (chatMsgs[0] && chatMsgs[0].data.type == __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["i" /* MessageType */].INPUT) {
                        var inputContent = chatMsgs[0].data.content;
                        if (!inputContent.input || Object.keys(inputContent.input).length <= 0)
                            _this.chatInput.setInput(new __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["a" /* ChatInputItemVM */](chatMsgs[0]));
                    }
                    _this.chatThread.scrollToLast();
                }
                else {
                    if (oldScrollHeight && _this.chatThread.chatThreadView) {
                        window.requestAnimationFrame(function () {
                            _this.chatThread.chatThreadView.scrollTop = (_this.chatThread.chatThreadView.scrollHeight - oldScrollHeight);
                        });
                    }
                }
            }
            catch (e) {
                console.log(e);
            }
            if (next)
                next();
        }, function (err) {
            if (next)
                next();
        });
    };
    ChatThreadComponent.prototype.removeConsecutiveErrorsMessage = function () {
        var oldMsgIdx = this.chatThread.messages.findIndex(function (x) { return x.messageAckId == __WEBPACK_IMPORTED_MODULE_7__services_utilities_service__["a" /* Config */].consecutiveErrorsMessageAckId; });
        if (oldMsgIdx != -1)
            this.chatThread.messages.splice(oldMsgIdx, 1);
    };
    ChatThreadComponent.prototype.openWindow = function (url) {
        if (typeof url == 'string')
            window.open(url);
        else if (typeof url == 'object') {
            window.open(url.changingThisBreaksApplicationSecurity);
        }
    };
    ChatThreadComponent.prototype.getStarted = function (clearThread, askConfirmation) {
        var _this = this;
        if (askConfirmation) {
            this.infoDialog.confirm("Start a fresh chat?", "Restarting the chat will clear current chat messages. Are you sure?", function (ok) {
                if (ok) {
                    _this.getStarted(true, false);
                }
            }, "Yes", "No");
            return;
        }
        if (clearThread) {
            this.fetchingHistory = true;
            setTimeout(function () { return _this.fetchingHistory = false; }, 1000);
            this.chatThread.messages = [];
            this.chatInput.resetInputs();
        }
        var firstMsg = new __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["a" /* ANAChatMessage */]({
            "meta": {
                "sender": {
                    "id": this.stompService.config.businessId,
                    "medium": 3
                },
                "recipient": {
                    "id": this.stompService.config.customerId,
                    "medium": 3
                },
                "senderType": __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["j" /* SenderType */].USER,
                "flowId": this.stompService.config.flowId,
                "previousFlowId": this.stompService.config.flowId,
                "currentFlowId": this.stompService.config.flowId,
                "timestamp": new Date().getTime(),
            },
            "data": {
                "type": 2,
                "content": {
                    "inputType": __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["f" /* InputType */].OPTIONS,
                    "mandatory": 1,
                    "options": [
                        {
                            "title": "Get Started",
                            "value": "GetStarted"
                        }
                    ],
                    "input": {
                        "val": "GET_STARTED"
                    }
                }
            },
            "events": [
                {
                    "type": __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["d" /* EventType */].SET_SESSION_DATA,
                    "data": JSON.stringify(__WEBPACK_IMPORTED_MODULE_7__services_utilities_service__["b" /* UtilitiesService */].settings.appConfig.initVerbs)
                }
            ]
        });
        var msg = new __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["c" /* ChatMessageVM */](firstMsg, __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["e" /* Direction */].Outgoing, __WEBPACK_IMPORTED_MODULE_7__services_utilities_service__["b" /* UtilitiesService */].uuidv4()); //Pseudo, not actually added to thread. 
        this._sendMessageDelegate(new __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["a" /* ANAChatMessage */]({
            meta: __WEBPACK_IMPORTED_MODULE_7__services_utilities_service__["b" /* UtilitiesService */].getReplyMeta(firstMsg.meta),
            data: firstMsg.data,
            events: firstMsg.events
        }), msg);
    };
    ChatThreadComponent.prototype.ngOnInit = function () {
        var _this = this;
        this.settings = __WEBPACK_IMPORTED_MODULE_7__services_utilities_service__["b" /* UtilitiesService */].settings;
        if (this.settings && this.settings.stompConfig) {
            this._sendMessageDelegate = function (a, b) { return _this.stompService.sendMessage(a, b); };
            this.stompService.handleMessageReceived = this._handleMessageReceivedDelegate;
            this.stompService.handleConnect = function () {
                if (_this.chatThread.messages.length <= 0) {
                    _this.getStarted(false, false);
                }
                else {
                    //Retrying all pending messages in the chat thread.
                    _this.removeConsecutiveErrorsMessage();
                    var pendingMsgs = _this.chatThread.messages.filter(function (x) { return x.status == __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["f" /* MessageStatus */].SentTimeout || x.status == __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["f" /* MessageStatus */].SentToServer && x.retrySending; });
                    pendingMsgs.forEach(function (x) { return x.retrySending(); });
                }
            };
            this.stompService.handleAck = function (messageAckId, deliveredAck) {
                if (deliveredAck) {
                    //For deliveredAck, msgAckId is the msg.meta.id
                    var msg = _this.chatThread.messages.find(function (x) { return x.meta.id == messageAckId; });
                    if (msg) {
                        msg.status = __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["f" /* MessageStatus */].DelieveredToTarget;
                        msg.clearTimeoutTimer();
                    }
                }
                else {
                    var msg = _this.chatThread.messages.find(function (x) { return x.messageAckId == messageAckId; });
                    if (msg) {
                        msg.status = __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["f" /* MessageStatus */].ReceivedAtServer;
                        msg.clearTimeoutTimer();
                    }
                }
            };
            this.stompService.handleTyping = function () {
                _this.chatThread.setTyping();
            };
            this.stompService.handleConsecutiveErrorsState = function () {
                _this.removeConsecutiveErrorsMessage();
                _this.chatThread.addTextIncoming(__WEBPACK_IMPORTED_MODULE_7__services_utilities_service__["a" /* Config */].consecutiveErrorsMessageText, __WEBPACK_IMPORTED_MODULE_7__services_utilities_service__["a" /* Config */].consecutiveErrorsMessageAckId);
            };
            this.loadHistory(function () {
                try {
                    if (window.parent && window.parent.postMessage) {
                        window.parent.postMessage({
                            type: "LOADED"
                        }, "*");
                    }
                }
                catch (e) { }
                _this.stompService.connect();
            });
        }
        //debugger
        //console.log("settings"+JSON.stringify(this.settings))
        if (this.settings.simulatorMode) {
            this.fetchingHistory = false;
            __WEBPACK_IMPORTED_MODULE_11__services_resolver_service__["a" /* SampleService */].handleMessageReceived = this._handleMessageReceivedDelegate;
            this.simulator.handleMessageReceived = this._handleMessageReceivedDelegate;
            //console.log("simulatorr"+this.simulator.handleMessageReceived)
            //console.log("sample service"+SampleService.handleMessageReceived)
            this.simulator.handleResetSignal = function () {
                _this.chatThread.messages = [];
                _this.chatInput.resetInputs();
            };
            this._sendMessageDelegate = function (a, b) { return _this.simulator.sendMessage(a, b); };
        }
    };
    ChatThreadComponent.prototype.carouselItemHasMedia = function (carItem) {
        return carItem.media && (carItem.media.type != null || carItem.media.type != undefined) && carItem.media.url;
    };
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_17" /* ViewChild */])("inputContainer"),
        __metadata("design:type", typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["v" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["v" /* ElementRef */]) === "function" && _a || Object)
    ], ChatThreadComponent.prototype, "inputContainerRef", void 0);
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_17" /* ViewChild */])("chatThreadView"),
        __metadata("design:type", typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_0__angular_core__["v" /* ElementRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_0__angular_core__["v" /* ElementRef */]) === "function" && _b || Object)
    ], ChatThreadComponent.prototype, "chatThreadView", void 0);
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_18" /* ViewChildren */])("carouselContainer"),
        __metadata("design:type", Array)
    ], ChatThreadComponent.prototype, "carouselContainers", void 0);
    ChatThreadComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["o" /* Component */])({
            selector: 'app-chat-thread',
            template: __webpack_require__("../../../../../src/app/components/chat-thread/chat-thread.component.html"),
            styles: [__webpack_require__("../../../../../src/app/components/chat-thread/chat-thread.component.css")]
        }),
        __metadata("design:paramtypes", [typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_4__services_stomp_service__["b" /* StompService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_4__services_stomp_service__["b" /* StompService */]) === "function" && _c || Object, typeof (_d = typeof __WEBPACK_IMPORTED_MODULE_6__services_api_service__["a" /* APIService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_6__services_api_service__["a" /* APIService */]) === "function" && _d || Object, typeof (_e = typeof __WEBPACK_IMPORTED_MODULE_1__angular_material__["g" /* MdDialog */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_material__["g" /* MdDialog */]) === "function" && _e || Object, typeof (_f = typeof __WEBPACK_IMPORTED_MODULE_11__services_resolver_service__["a" /* SampleService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_11__services_resolver_service__["a" /* SampleService */]) === "function" && _f || Object, typeof (_g = typeof __WEBPACK_IMPORTED_MODULE_5__services_simulator_service__["a" /* SimulatorService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_5__services_simulator_service__["a" /* SimulatorService */]) === "function" && _g || Object, typeof (_h = typeof __WEBPACK_IMPORTED_MODULE_9__angular_platform_browser__["c" /* DomSanitizer */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_9__angular_platform_browser__["c" /* DomSanitizer */]) === "function" && _h || Object, typeof (_j = typeof __WEBPACK_IMPORTED_MODULE_10__services_info_dialog_service__["a" /* InfoDialogService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_10__services_info_dialog_service__["a" /* InfoDialogService */]) === "function" && _j || Object, typeof (_k = typeof __WEBPACK_IMPORTED_MODULE_8__services_chain_delay_service__["a" /* ChainDelayService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_8__services_chain_delay_service__["a" /* ChainDelayService */]) === "function" && _k || Object])
    ], ChatThreadComponent);
    return ChatThreadComponent;
    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k;
}());

var ModelHelpers = (function () {
    function ModelHelpers() {
        this.Direction = __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["e" /* Direction */];
        this.MessageStatus = __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["f" /* MessageStatus */];
        this.MessageType = __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["i" /* MessageType */];
        this.MessageContentType = __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["h" /* MessageContentType */];
        this.MediaType = __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["g" /* MediaType */];
        this.InputType = __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_models__["f" /* InputType */];
        this.StompConnectionStatus = __WEBPACK_IMPORTED_MODULE_4__services_stomp_service__["a" /* StompConnectionStatus */];
    }
    return ModelHelpers;
}());

//# sourceMappingURL=chat-thread.component.js.map

/***/ }),

/***/ "../../../../../src/app/components/complex-input/complex-input.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "md-form-field {\n  width: 100%;\n}\n\nagm-map {\n  height: 286px;\n  width: 237px;\n}\n\nmd-list {\n  max-height: 80vh;\n  max-width: 90vh;\n  min-width: 200px;\n}\n\nmd-list-item {\n  margin: 10px -16px;\n}\n", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/components/complex-input/complex-input.component.html":
/***/ (function(module, exports) {

module.exports = "<md-dialog-content>\n  <div [ngSwitch]=\"params.Type\">\n    <ng-container *ngSwitchCase=\"ComplexType.Date\">\n      <md-form-field>\n        <input mdInput [mdDatepicker]=\"datePicker\" placeholder=\"Choose a date\" [(ngModel)]=\"choosenDate\">\n        <md-datepicker-toggle mdSuffix [for]=\"datePicker\" class=\"ana-color-accent\"></md-datepicker-toggle>\n        <md-datepicker touchUi=\"true\" #datePicker></md-datepicker>\n      </md-form-field>\n    </ng-container>\n\n    <ng-container *ngSwitchCase=\"ComplexType.Time\">\n      <md-form-field>\n        <input mdInput type=\"time\" placeholder=\"Choose a time\" [(ngModel)]=\"choosenTime\">\n      </md-form-field>\n    </ng-container>\n    <ng-container *ngSwitchCase=\"ComplexType.Address\">\n\n      <md-form-field>\n        <input mdInput type=\"text\" placeholder=\"Street Address\" [(ngModel)]=\"givenAddress.line1\" name=\"addressLine1\">\n      </md-form-field>\n\n      <md-form-field>\n        <input mdInput type=\"text\" placeholder=\"Area\" [(ngModel)]=\"givenAddress.area\" name=\"addressArea\">\n      </md-form-field>\n\n      <md-form-field>\n        <input mdInput type=\"text\" placeholder=\"City\" [(ngModel)]=\"givenAddress.city\" name=\"addressCity\">\n      </md-form-field>\n\n      <md-form-field>\n        <input mdInput type=\"text\" placeholder=\"State\" [(ngModel)]=\"givenAddress.state\" name=\"addressState\">\n      </md-form-field>\n\n      <md-form-field>\n        <input mdInput type=\"text\" placeholder=\"Country\" [(ngModel)]=\"givenAddress.country\" name=\"addressCountry\">\n      </md-form-field>\n\n      <md-form-field>\n        <input mdInput type=\"text\" placeholder=\"Pin\" [(ngModel)]=\"givenAddress.pin\" name=\"addressPin\">\n      </md-form-field>\n    </ng-container>\n    <ng-container *ngSwitchCase=\"ComplexType.Location\">\n      <agm-map [latitude]=\"geoLoc.lat\" [longitude]=\"geoLoc.lng\">\n        <agm-marker [latitude]=\"geoLoc.lat\" [longitude]=\"geoLoc.lng\" [markerDraggable]=\"true\" (dragEnd)=\"mapLocationUpdated($event)\"></agm-marker>\n      </agm-map>\n    </ng-container>\n    <ng-container *ngSwitchCase=\"ComplexType.List\">\n      <md-list *ngIf=\"listMultiple\">\n        <md-list-item *ngFor=\"let listItem of listValues; let i = index\">\n          <md-checkbox [(ngModel)]=\"listItem.isSelected\" name=\"listItemIsSelected-{{i}}\" align=\"start\">{{listItem.text}}</md-checkbox>\n        </md-list-item>\n      </md-list>\n      <md-list *ngIf=\"!listMultiple\">\n        <md-radio-group [(ngModel)]=\"selectedListItem\">\n          <md-list-item *ngFor=\"let listItem of listValues; let i = index\">\n            <md-radio-button name=\"listItemIsSelected-{{i}}\" [value]=\"listItem\" align=\"start\">{{listItem.text}}</md-radio-button>\n          </md-list-item>\n        </md-radio-group>\n      </md-list>\n    </ng-container>\n  </div>\n</md-dialog-content>\n<md-dialog-actions align=\"center\">\n  <button md-raised-button color=\"primary\" [disabled]=\"!isValid()\" md-button class=\"complex-input-btn-done\" (click)=\"dialogClose()\">Submit</button>\n</md-dialog-actions>\n"

/***/ }),

/***/ "../../../../../src/app/components/complex-input/complex-input.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ComplexInputComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return ComplexType; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_material__ = __webpack_require__("../../../material/@angular/material.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__services_utilities_service__ = __webpack_require__("../../../../../src/app/services/utilities.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};



var ComplexInputComponent = (function () {
    function ComplexInputComponent(dialogRef, params) {
        this.dialogRef = dialogRef;
        this.params = params;
        this.ComplexType = ComplexType;
        this.givenAddress = {
            area: "",
            city: "",
            country: "",
            line1: "",
            pin: "",
            state: ""
        };
        this.geoLoc = {
            lat: 0.0,
            lng: 0.0
        };
    }
    ComplexInputComponent.prototype.ngOnInit = function () {
        if (this.params.Type == ComplexType.Location) {
            if (this.params.DefaultGeoLoc)
                this.geoLoc = this.params.DefaultGeoLoc;
        }
        else if (this.params.Type == ComplexType.List) {
            this.listValues = this.params.ListValues;
            this.listMultiple = this.params.ListMultiple;
        }
        else if (this.params.Type == ComplexType.Time) {
            var date = new Date();
            this.choosenTime = __WEBPACK_IMPORTED_MODULE_2__services_utilities_service__["b" /* UtilitiesService */].pad(date.getHours(), 2) + ":" + __WEBPACK_IMPORTED_MODULE_2__services_utilities_service__["b" /* UtilitiesService */].pad(date.getMinutes(), 2); //:${UtilitiesService.pad(date.getSeconds(), 2)}
        }
    };
    ComplexInputComponent.prototype.ngAfterViewInit = function () {
        var _this = this;
        Promise.resolve(null).then(function () {
            if (_this.params.Type == ComplexType.Date)
                _this.datePicker.open();
        });
    };
    ComplexInputComponent.prototype.getChoosenANATime = function () {
        var split = this.choosenTime.split(':');
        return {
            hour: split[0],
            minute: split[1],
            second: (split.length >= 3 ? split[2] : '0')
        };
    };
    ComplexInputComponent.prototype.getChoosenANADate = function () {
        return {
            mday: this.choosenDate.getDate().toString(),
            month: (this.choosenDate.getMonth() + 1).toString(),
            year: this.choosenDate.getFullYear().toString()
        };
    };
    ComplexInputComponent.prototype.mapLocationUpdated = function (event) {
        this.geoLoc.lat = event.coords.lat;
        this.geoLoc.lng = event.coords.lng;
    };
    ComplexInputComponent.prototype.choosenListValues = function () {
        if (this.listMultiple)
            return this.listValues.filter(function (x) { return x.isSelected; });
        else
            return [this.selectedListItem];
    };
    ComplexInputComponent.prototype.isValid = function () {
        switch (this.params.Type) {
            case ComplexType.Address:
                {
                    if (this.givenAddress &&
                        this.givenAddress.area &&
                        this.givenAddress.city &&
                        this.givenAddress.country &&
                        this.givenAddress.line1 &&
                        this.givenAddress.pin &&
                        this.givenAddress.state) {
                        return true;
                    }
                    else
                        return false;
                }
            case ComplexType.Date:
                {
                    if (this.choosenDate)
                        return true;
                    else
                        return false;
                }
            case ComplexType.Time:
                {
                    if (this.choosenTime)
                        return true;
                    else
                        return false;
                }
            case ComplexType.List:
                {
                    if (this.listMultiple) {
                        if (this.choosenListValues() && this.choosenListValues().length > 0)
                            return true;
                        else
                            return false;
                    }
                    else {
                        return this.selectedListItem != null;
                    }
                }
            case ComplexType.Location:
                {
                    if (this.geoLoc)
                        return true;
                    else
                        return false;
                }
            default:
                return true;
        }
    };
    ComplexInputComponent.prototype.dialogClose = function () {
        this.dialogRef.close(true);
    };
    __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_17" /* ViewChild */])("datePicker"),
        __metadata("design:type", typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_material__["e" /* MdDatepicker */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_material__["e" /* MdDatepicker */]) === "function" && _a || Object)
    ], ComplexInputComponent.prototype, "datePicker", void 0);
    ComplexInputComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["o" /* Component */])({
            selector: 'app-complex-input',
            template: __webpack_require__("../../../../../src/app/components/complex-input/complex-input.component.html"),
            styles: [__webpack_require__("../../../../../src/app/components/complex-input/complex-input.component.css")]
        }),
        __param(1, Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["B" /* Inject */])(__WEBPACK_IMPORTED_MODULE_1__angular_material__["a" /* MD_DIALOG_DATA */])),
        __metadata("design:paramtypes", [typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_1__angular_material__["i" /* MdDialogRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_material__["i" /* MdDialogRef */]) === "function" && _b || Object, Object])
    ], ComplexInputComponent);
    return ComplexInputComponent;
    var _a, _b;
}());

var ComplexType;
(function (ComplexType) {
    ComplexType[ComplexType["Date"] = 0] = "Date";
    ComplexType[ComplexType["Time"] = 1] = "Time";
    ComplexType[ComplexType["Location"] = 2] = "Location";
    ComplexType[ComplexType["Address"] = 3] = "Address";
    ComplexType[ComplexType["List"] = 4] = "List";
})(ComplexType || (ComplexType = {}));
//# sourceMappingURL=complex-input.component.js.map

/***/ }),

/***/ "../../../../../src/app/components/info-dialog/info-dialog.component.css":
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__("../../../../css-loader/lib/css-base.js")(false);
// imports


// module
exports.push([module.i, "md-dialog-actions {\n    -webkit-box-pack: center;\n        -ms-flex-pack: center;\n            justify-content: center;\n}\n\nmd-form-field {\n    width: 100%\n}\n", ""]);

// exports


/*** EXPORTS FROM exports-loader ***/
module.exports = module.exports.toString();

/***/ }),

/***/ "../../../../../src/app/components/info-dialog/info-dialog.component.html":
/***/ (function(module, exports) {

module.exports = "<h2 mdDialogTitle>{{options.title}}</h2>\n<md-dialog-content>\n    <p>{{options.message}}</p>\n    <md-form-field [hidden]=\"options.dialogType!=InfoDialogType.Prompt\">\n        <input type=\"text\" name=\"text\" mdInput [(ngModel)]=\"inputText\" (keypress)=\"inputKeypress($event)\" />\n    </md-form-field>\n</md-dialog-content>\n<md-dialog-actions>\n    <button md-raised-button color=\"primary\" (click)=\"primaryClick()\" *ngIf=\"primaryButtonText\">{{primaryButtonText}}</button>\n    <button md-raised-button [color]=\"options.dialogType==InfoDialogType.Alert?'primary':''\" [mdDialogClose]=\"false\">{{secondaryButtonText}}</button>\n</md-dialog-actions>"

/***/ }),

/***/ "../../../../../src/app/components/info-dialog/info-dialog.component.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return InfoDialogComponent; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return InfoDialogType; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_material__ = __webpack_require__("../../../material/@angular/material.es5.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};


var InfoDialogComponent = (function () {
    function InfoDialogComponent(dialogRef, options) {
        this.dialogRef = dialogRef;
        this.options = options;
        this.InfoDialogType = InfoDialogType;
        this.dialogRef.disableClose = true;
        if (!options) {
            options = {
                dialogType: InfoDialogType.Alert,
                title: 'Title',
                message: 'Message'
            };
        }
        switch (options.dialogType) {
            case InfoDialogType.Confirm:
                {
                    this.primaryButtonText = this.options.primaryButton || "OK";
                    this.secondaryButtonText = this.options.secondaryButton || "Cancel";
                }
                break;
            case InfoDialogType.Prompt:
                {
                    this.inputText = options.defaultInputText;
                    this.primaryButtonText = this.options.primaryButton || "Done";
                    this.secondaryButtonText = this.options.secondaryButton || "Cancel";
                }
                break;
            case InfoDialogType.Alert:
            default:
                {
                    this.secondaryButtonText = this.options.primaryButton || "Close"; //Primary button plays as the text for secondaryButton here.
                }
                break;
        }
    }
    InfoDialogComponent.prototype.ngOnInit = function () {
    };
    InfoDialogComponent.prototype.inputKeypress = function (event) {
        if (event.keyCode == 13) {
            this.primaryClick();
        }
    };
    InfoDialogComponent.prototype.primaryClick = function () {
        switch (this.options.dialogType) {
            case InfoDialogType.Confirm:
                this.dialogRef.close(true);
                break;
            case InfoDialogType.Prompt:
                this.dialogRef.close(this.inputText);
                break;
            case InfoDialogType.Alert:
            default:
                this.dialogRef.close();
                break;
        }
    };
    InfoDialogComponent = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["o" /* Component */])({
            selector: 'app-info-dialog',
            template: __webpack_require__("../../../../../src/app/components/info-dialog/info-dialog.component.html"),
            styles: [__webpack_require__("../../../../../src/app/components/info-dialog/info-dialog.component.css")]
        }),
        __param(1, Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["B" /* Inject */])(__WEBPACK_IMPORTED_MODULE_1__angular_material__["a" /* MD_DIALOG_DATA */])),
        __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_material__["i" /* MdDialogRef */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_material__["i" /* MdDialogRef */]) === "function" && _a || Object, Object])
    ], InfoDialogComponent);
    return InfoDialogComponent;
    var _a;
}());

var InfoDialogType;
(function (InfoDialogType) {
    InfoDialogType[InfoDialogType["Prompt"] = 0] = "Prompt";
    InfoDialogType[InfoDialogType["Alert"] = 1] = "Alert";
    InfoDialogType[InfoDialogType["Confirm"] = 2] = "Confirm";
})(InfoDialogType || (InfoDialogType = {}));
//# sourceMappingURL=info-dialog.component.js.map

/***/ }),

/***/ "../../../../../src/app/models/ana-chat-vm.models.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return Direction; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return MessageStatus; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return ChatMessageVM; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return ChatThreadVM; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ChatInputItemVM; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return ChatInputVM; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__ = __webpack_require__("../../../../../src/app/models/ana-chat.models.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__ = __webpack_require__("../../../../../src/app/services/utilities.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_complex_input_complex_input_component__ = __webpack_require__("../../../../../src/app/components/complex-input/complex-input.component.ts");



var Direction;
(function (Direction) {
    Direction[Direction["Incoming"] = 0] = "Incoming";
    Direction[Direction["Outgoing"] = 1] = "Outgoing";
})(Direction || (Direction = {}));
var MessageStatus;
(function (MessageStatus) {
    MessageStatus[MessageStatus["None"] = 0] = "None";
    MessageStatus[MessageStatus["SentToServer"] = 1] = "SentToServer";
    MessageStatus[MessageStatus["ReceivedAtServer"] = 2] = "ReceivedAtServer";
    MessageStatus[MessageStatus["SentTimeout"] = 3] = "SentTimeout";
    MessageStatus[MessageStatus["DelieveredToTarget"] = 4] = "DelieveredToTarget";
})(MessageStatus || (MessageStatus = {}));
var ChatMessageVM = (function () {
    function ChatMessageVM(chatMessage, direction, ackId, status) {
        this.direction = direction;
        this.time = new Date(chatMessage.meta.timestamp);
        this.meta = chatMessage.meta;
        this.messageData = chatMessage.data;
        this.status = status || MessageStatus.None;
        this.messageAckId = ackId;
    }
    ChatMessageVM.prototype.startTimeoutTimer = function () {
        var _this = this;
        this.timeoutTimer = setTimeout(function () {
            if (_this.status == MessageStatus.SentToServer)
                _this.status = MessageStatus.SentTimeout;
        }, 2000);
    };
    ChatMessageVM.prototype.clearTimeoutTimer = function () {
        clearTimeout(this.timeoutTimer);
        this.timeoutTimer = undefined;
    };
    ChatMessageVM.prototype.executeRetry = function () {
        if (this.retrySending)
            this.retrySending();
    };
    ChatMessageVM.prototype.simpleMessageData = function () {
        return this.messageData;
    };
    ChatMessageVM.prototype.carouselMessageData = function () {
        return this.messageData;
    };
    ChatMessageVM.prototype.getMessageContentType = function () {
        if (this.messageData.type == __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["i" /* MessageType */].SIMPLE) {
            var simple = this.simpleMessageData();
            if (simple.content.typing)
                return __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["h" /* MessageContentType */].Typing;
            if (simple.content.media)
                return __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["h" /* MessageContentType */].Media;
            else if (simple.content.text)
                return __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["h" /* MessageContentType */].Text;
            else
                return null;
        }
        return null;
    };
    ChatMessageVM.prototype.isToday = function () {
        return this.time.toDateString() == (new Date()).toDateString();
    };
    return ChatMessageVM;
}());

var ChatThreadVM = (function () {
    function ChatThreadVM(sanitizer) {
        this.sanitizer = sanitizer;
        this.messages = [];
    }
    ChatThreadVM.prototype.addTextIncoming = function (text, ackId) {
        var msg = new ChatMessageVM(new __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["a" /* ANAChatMessage */]({
            "meta": {
                "timestamp": new Date().getTime(),
            },
            "data": {
                "type": __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["i" /* MessageType */].SIMPLE,
                "content": {
                    "text": text,
                }
            }
        }), Direction.Incoming, ackId);
        this.addMessage(msg);
        return msg;
    };
    ChatThreadVM.prototype.addTextReply = function (text, ackId, timestamp, insert) {
        if (insert === void 0) { insert = false; }
        if (!text)
            return null;
        var msg = new ChatMessageVM(new __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["a" /* ANAChatMessage */]({
            "meta": {
                "timestamp": timestamp || new Date().getTime(),
            },
            "data": {
                "type": __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["i" /* MessageType */].SIMPLE,
                "content": {
                    "text": text,
                }
            }
        }), Direction.Outgoing, ackId);
        this.addMessage(msg, insert);
        return msg;
    };
    ChatThreadVM.prototype.setTyping = function (autohide) {
        var _this = this;
        if (this.typingTimerId)
            clearTimeout(this.typingTimerId);
        this.removeTyping();
        var msg = new ChatMessageVM(new __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["a" /* ANAChatMessage */]({
            "meta": {
                "timestamp": new Date().getTime(),
            },
            "data": {
                "type": __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["i" /* MessageType */].SIMPLE,
                "content": {
                    "typing": true
                }
            }
        }), Direction.Incoming, '');
        this.addMessage(msg);
        if (autohide) {
            this.typingTimerId = setTimeout(function () {
                _this.removeTyping();
            }, 1000);
        }
    };
    ChatThreadVM.prototype.removeTyping = function () {
        var index = this.messages.findIndex(function (x) { return x.getMessageContentType() == __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["h" /* MessageContentType */].Typing; });
        if (index != -1) {
            this.messages.splice(index, 1);
            if (this.typingTimerId)
                clearTimeout(this.typingTimerId);
        }
    };
    ChatThreadVM.prototype.addMediaReply = function (media, text, ackId, timestamp, insert) {
        if (text === void 0) { text = ''; }
        if (insert === void 0) { insert = false; }
        var msg = new ChatMessageVM(new __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["a" /* ANAChatMessage */]({
            "meta": {
                "timestamp": timestamp || new Date().getTime(),
            },
            "data": {
                "type": __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["i" /* MessageType */].SIMPLE,
                "content": {
                    "text": text,
                    "media": media,
                }
            }
        }), Direction.Outgoing, ackId);
        this.addMessage(msg, insert);
        return msg;
    };
    ChatThreadVM.prototype.addMessage = function (chatMsgVM, insert) {
        if (insert === void 0) { insert = false; }
        if (__WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].settings.simulatorMode) {
            var simpleData = chatMsgVM.simpleMessageData();
            if (simpleData.content.media && simpleData.content.media.url)
                simpleData.content.media.url = this.sanitizer.bypassSecurityTrustUrl(simpleData.content.media.url);
        }
        if (!insert)
            this.removeTyping();
        if (!chatMsgVM.meta.id || this.messages.findIndex(function (x) { return x.meta.id == chatMsgVM.meta.id; }) == -1) {
            if (insert)
                this.messages.unshift(chatMsgVM);
            else
                this.messages.push(chatMsgVM);
        }
        //Sorting the messages based on timestamp. Currently disabled.
        //this.messages.sort((x, y) => x.meta.timestamp - y.meta.timestamp);
        if (!insert)
            this.scrollLastIntoView();
    };
    ChatThreadVM.prototype.scrollLastIntoView = function (t) {
        var _this = this;
        if (t === void 0) { t = 100; }
        if (this.chatThreadView)
            setTimeout(function () { return _this.chatThreadView.children.item(_this.chatThreadView.children.length - 1).scrollIntoView({ behavior: 'smooth' }); }, t);
    };
    ChatThreadVM.prototype.scrollToLast = function () {
        var _this = this;
        if (this.chatThreadView)
            window.requestAnimationFrame(function () { return _this.chatThreadView.scrollTo({ top: _this.chatThreadView.scrollHeight, behavior: 'smooth' }); });
    };
    return ChatThreadVM;
}());

var ChatInputItemVM = (function () {
    function ChatInputItemVM(message) {
        this.data = message.data;
        this.content = message.inputData().content;
        if (!this.content.input)
            this.content.input = {};
        this.meta = message.meta;
        this.disabled = false;
    }
    ChatInputItemVM.prototype.textInputContent = function () {
        return this.content;
    };
    return ChatInputItemVM;
}());

var ChatInputVM = (function () {
    function ChatInputVM(dialog, chatThread, apiService, stomp, chatThreadComponent, sanitizer) {
        this.dialog = dialog;
        this.chatThread = chatThread;
        this.apiService = apiService;
        this.stomp = stomp;
        this.chatThreadComponent = chatThreadComponent;
        this.sanitizer = sanitizer;
        this.textInput = undefined;
        this.clickInput = undefined;
    }
    ChatInputVM.prototype.insertThreadMessageForInput = function (inputVM) {
        var ackId = "";
        var timestamp = inputVM.meta.timestamp;
        switch (inputVM.content.inputType) {
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].TEXT:
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].EMAIL:
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].PHONE:
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].NUMERIC:
                {
                    var modifieldInputContent = inputVM.content;
                    return this.chatThread.addTextReply(modifieldInputContent.input.val, ackId, timestamp, true);
                }
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].ADDRESS:
                {
                    var modifieldInputContent = inputVM.content;
                    var userAddressInput = modifieldInputContent.input.address;
                    return this.chatThread.addTextReply("" + [userAddressInput.line1, userAddressInput.area, userAddressInput.city, userAddressInput.state, userAddressInput.country, userAddressInput.pin].filter(function (x) { return x; }).join(", "), ackId, timestamp, true);
                }
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].LOCATION:
                {
                    var locInputData = inputVM.content;
                    var gMapUrl = __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].googleMapsStaticLink(locInputData.input.location);
                    return this.chatThread.addMediaReply({
                        previewUrl: gMapUrl,
                        type: __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["g" /* MediaType */].IMAGE,
                        url: gMapUrl
                    }, "Location", ackId, timestamp, true);
                }
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].MEDIA:
                {
                    var mediaInputContent = inputVM.content;
                    if (mediaInputContent && mediaInputContent.input.media) {
                        var asset = mediaInputContent.input.media[0];
                        var media = {
                            previewUrl: asset.previewUrl,
                            type: asset.type,
                            url: asset.url
                        };
                        return this.chatThread.addMediaReply(media, '', ackId, timestamp, true);
                    }
                    return null;
                }
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].LIST:
                {
                    var listInputContent = inputVM.content;
                    var selectedValues_1 = listInputContent.input.val.split(',');
                    var selectedListItems = listInputContent.values.filter(function (x) { return selectedValues_1.indexOf(x.value) != -1; });
                    return this.chatThread.addTextReply(selectedListItems.map(function (x) { return x.text; }).join(', '), ackId, timestamp, true);
                }
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].TIME:
                {
                    var timeContent = inputVM.content;
                    var displayTime = __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].anaTimeDisplay(timeContent.input.time);
                    return this.chatThread.addTextReply(displayTime, ackId, timestamp, true);
                }
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].DATE:
                {
                    var dateContent = inputVM.content;
                    var displayDate = __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].anaDateDisplay(dateContent.input.date);
                    return this.chatThread.addTextReply(displayDate, ackId, timestamp, true);
                }
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].OPTIONS:
                {
                    var optionInputContent_1 = inputVM.content;
                    var selectedOption = optionInputContent_1.options.find(function (x) { return x.value == optionInputContent_1.input.val; });
                    if (selectedOption)
                        return this.chatThread.addTextReply(selectedOption.title, ackId, timestamp, true);
                    return null;
                }
            default:
                console.log("Unsupported button type: " + inputVM.content.inputType);
                break;
        }
    };
    ChatInputVM.prototype.setInput = function (chatInputItemVM) {
        if (this.textInput)
            this.textInput.disabled = true;
        if (this.inputCategory(chatInputItemVM) == __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["e" /* InputCategory */].Text) {
            var a = chatInputItemVM.content;
            if (a.textInputAttr && a.textInputAttr.defaultText)
                a.input.val = a.textInputAttr.defaultText;
            this.textInput = chatInputItemVM;
        }
        else if (this.inputCategory(chatInputItemVM) == __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["e" /* InputCategory */].Click) {
            this.clickInput = chatInputItemVM;
            if (chatInputItemVM.content.mandatory == __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["b" /* Bool */].FALSE) {
                this.textInput = this.textInputForNonMandatoryCase(chatInputItemVM.meta);
            }
            else
                this.textInput = undefined;
        }
        this.chatThread.scrollLastIntoView(300);
    };
    ChatInputVM.prototype.textInputForNonMandatoryCase = function (srcMeta) {
        var anaMeta = {
            id: "",
            sender: {
                id: __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].settings.stompConfig ? __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].settings.stompConfig.businessId : __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["a" /* Config */].simulatorBusinessId,
                medium: 3,
            },
            recipient: {
                id: __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].settings.stompConfig ? __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].settings.stompConfig.customerId : __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["a" /* Config */].simulatorCustomerId,
                medium: 3
            },
            responseTo: srcMeta ? srcMeta.id : '',
            senderType: __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["j" /* SenderType */].USER,
            sessionId: srcMeta ? srcMeta.sessionId : '',
            flowId: srcMeta.flowId,
            currentFlowId: srcMeta.currentFlowId,
            previousFlowId: srcMeta.previousFlowId,
            timestamp: srcMeta ? srcMeta.timestamp : new Date().getTime()
        };
        var input = new ChatInputItemVM(new __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["a" /* ANAChatMessage */]({
            meta: anaMeta,
            data: {
                type: __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["i" /* MessageType */].INPUT,
                content: {
                    inputType: 0,
                    mandatory: 1,
                    textInputAttr: {
                        multiLine: 1,
                        minLength: 0,
                        maxLength: 400,
                        defaultText: "",
                        placeHolder: "Type a message..."
                    },
                    input: {
                        val: "",
                    }
                }
            }
        }));
        return input;
    };
    ChatInputVM.prototype.clickInputTitle = function () {
        if (this.clickInput) {
            try {
                if (this.clickInput.content.inputType == __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].MEDIA)
                    return 'Choose ' + __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["g" /* MediaType */][this.clickInput.content.mediaType].toLowerCase();
                if (this.clickInput.content.inputType == __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].LIST) {
                    if (this.clickInput.content.multiple)
                        return 'Choose';
                    else
                        return 'Choose an option';
                }
                return 'Choose ' + __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */][this.clickInput.content.inputType].toLowerCase();
            }
            catch (e) {
                return 'Choose';
            }
        }
        else
            return "Choose";
    };
    ChatInputVM.prototype.inputCategory = function (inputVM) {
        switch (inputVM.content.inputType) {
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].TEXT:
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].EMAIL:
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].NUMERIC:
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].PHONE:
                return __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["e" /* InputCategory */].Text;
            default:
                return __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["e" /* InputCategory */].Click;
        }
    };
    ChatInputVM.prototype.handleClick = function (inputVM) {
        var _this = this;
        if (!this.isInputValid(inputVM)) {
            var errorMsg = this.inputErrorMsg(inputVM);
            var lastMsg = this.chatThread.messages[this.chatThread.messages.length - 1];
            if (lastMsg.direction == Direction.Incoming && lastMsg.messageAckId == "ERROR_MSG" && lastMsg.simpleMessageData().content.text == errorMsg)
                return; //Skip if already error message is added with the same msg text.
            //alert(this.inputErrorMsg(inputVM));
            switch (inputVM.content.inputType) {
                case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].TEXT:
                case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].EMAIL:
                case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].PHONE:
                case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].NUMERIC:
                    {
                        var modifieldInputContent = inputVM.content;
                        this.chatThread.addTextReply(modifieldInputContent.input.val, "");
                        break;
                    }
            }
            this.chatThread.addTextIncoming(errorMsg, "ERROR_MSG");
            return;
        }
        var ackId = __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].uuidv4();
        switch (inputVM.content.inputType) {
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].TEXT:
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].EMAIL:
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].PHONE:
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].NUMERIC:
                {
                    this.resetInputs();
                    var modifieldInputContent = inputVM.content;
                    var msg = this.chatThread.addTextReply(modifieldInputContent.input.val, ackId);
                    this.chatThreadComponent._sendMessageDelegate(new __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["a" /* ANAChatMessage */]({
                        meta: __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].getReplyMeta(inputVM.meta),
                        data: { type: inputVM.data.type, content: modifieldInputContent }
                    }), msg);
                    break;
                }
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].ADDRESS:
                {
                    var modifieldInputContent_1 = inputVM.content;
                    var dialogRef_1 = this.dialog.open(__WEBPACK_IMPORTED_MODULE_2__components_complex_input_complex_input_component__["a" /* ComplexInputComponent */], {
                        width: 'auto',
                        data: {
                            Type: __WEBPACK_IMPORTED_MODULE_2__components_complex_input_complex_input_component__["b" /* ComplexType */].Address
                        }
                    });
                    dialogRef_1.afterClosed().subscribe(function (result) {
                        if (result != true)
                            return;
                        var userAddressInput = dialogRef_1.componentInstance.givenAddress;
                        var msg = _this.chatThread.addTextReply("" + __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].anaAddressDisplay(userAddressInput), ackId);
                        modifieldInputContent_1.input = {
                            address: userAddressInput
                        };
                        _this.resetInputs();
                        _this.chatThreadComponent._sendMessageDelegate(new __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["a" /* ANAChatMessage */]({
                            meta: __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].getReplyMeta(inputVM.meta),
                            data: { type: inputVM.data.type, content: modifieldInputContent_1 }
                        }), msg);
                    });
                    break;
                }
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].LOCATION:
                {
                    var locInputData_1 = inputVM.content;
                    var geoLoc = locInputData_1.defaultLocation;
                    if (!geoLoc) {
                        if (navigator.geolocation) {
                            navigator.geolocation.getCurrentPosition(function (pos) {
                                var loc = {
                                    lat: pos.coords.latitude,
                                    lng: pos.coords.longitude
                                };
                                _this.showLocationPickerDialog(locInputData_1, inputVM.meta, inputVM.data.type, ackId, loc);
                            }, function (err) {
                                _this.showLocationPickerDialog(locInputData_1, inputVM.meta, inputVM.data.type, ackId);
                            });
                        }
                    }
                    else
                        this.showLocationPickerDialog(locInputData_1, inputVM.meta, inputVM.data.type, ackId, geoLoc);
                    break;
                }
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].MEDIA:
                {
                    var mediaInputContent_1 = inputVM.content;
                    var input_1 = document.createElement('input');
                    input_1.type = 'file';
                    if (mediaInputContent_1.mediaType != __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["g" /* MediaType */].FILE)
                        input_1.accept = __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["g" /* MediaType */][mediaInputContent_1.mediaType] + "/*";
                    input_1.multiple = false;
                    input_1.onchange = function () {
                        if (input_1.files) {
                            var f_1 = input_1.files[0];
                            if (!__WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].settings.simulatorMode) {
                                _this.apiService.uploadFile(f_1).subscribe(function (resp) {
                                    if (resp.links)
                                        _this.sendReplyAfterFileUpload(resp.links[0].href, f_1.type, mediaInputContent_1, ackId, inputVM);
                                    else
                                        alert("Error occurred while sending the file!");
                                }, function (err) {
                                    alert("Unable to send file!");
                                });
                            }
                            else {
                                var mediaBlob = new Blob([f_1], {
                                    type: f_1.type
                                });
                                var mediaBlobUrl = URL.createObjectURL(mediaBlob, { oneTimeOnly: false });
                                _this.sendReplyAfterFileUpload(mediaBlobUrl, f_1.type, mediaInputContent_1, ackId, inputVM);
                            }
                        }
                    };
                    input_1.click();
                    break;
                }
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].LIST:
                {
                    var listInputContent_1 = inputVM.content;
                    var dialogRef_2 = this.dialog.open(__WEBPACK_IMPORTED_MODULE_2__components_complex_input_complex_input_component__["a" /* ComplexInputComponent */], {
                        width: 'auto',
                        data: {
                            Type: __WEBPACK_IMPORTED_MODULE_2__components_complex_input_complex_input_component__["b" /* ComplexType */].List,
                            ListValues: listInputContent_1.values,
                            ListMultiple: listInputContent_1.multiple
                        }
                    });
                    dialogRef_2.afterClosed().subscribe(function (result) {
                        if (result != true)
                            return;
                        _this.resetInputs();
                        var selectedListItems = dialogRef_2.componentInstance.choosenListValues();
                        var msg = _this.chatThread.addTextReply(selectedListItems.map(function (x) { return x.text; }).join(', '), ackId);
                        listInputContent_1.input.val = selectedListItems.map(function (x) { return x.value; }).join(',');
                        _this.chatThreadComponent._sendMessageDelegate(new __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["a" /* ANAChatMessage */]({
                            meta: __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].getReplyMeta(inputVM.meta),
                            data: { type: inputVM.data.type, content: listInputContent_1 }
                        }), msg);
                    });
                    break;
                }
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].TIME:
                {
                    var timeContent_1 = inputVM.content;
                    var dialogRef_3 = this.dialog.open(__WEBPACK_IMPORTED_MODULE_2__components_complex_input_complex_input_component__["a" /* ComplexInputComponent */], {
                        width: 'auto',
                        data: {
                            Type: __WEBPACK_IMPORTED_MODULE_2__components_complex_input_complex_input_component__["b" /* ComplexType */].Time
                        }
                    });
                    dialogRef_3.afterClosed().subscribe(function (result) {
                        if (result != true)
                            return;
                        _this.resetInputs();
                        var userInputTime = dialogRef_3.componentInstance.getChoosenANATime();
                        var displayTime = __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].anaTimeDisplay(userInputTime);
                        var msg = _this.chatThread.addTextReply(displayTime, ackId);
                        timeContent_1.input = { time: userInputTime };
                        _this.chatThreadComponent._sendMessageDelegate(new __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["a" /* ANAChatMessage */]({
                            meta: __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].getReplyMeta(inputVM.meta),
                            data: { type: inputVM.data.type, content: timeContent_1 }
                        }), msg);
                    });
                    break;
                }
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].DATE:
                {
                    var dateContent_1 = inputVM.content;
                    var dialogRef_4 = this.dialog.open(__WEBPACK_IMPORTED_MODULE_2__components_complex_input_complex_input_component__["a" /* ComplexInputComponent */], {
                        width: 'auto',
                        data: {
                            Type: __WEBPACK_IMPORTED_MODULE_2__components_complex_input_complex_input_component__["b" /* ComplexType */].Date
                        }
                    });
                    dialogRef_4.afterClosed().subscribe(function (result) {
                        if (result != true)
                            return;
                        _this.resetInputs();
                        var userInputDate = dialogRef_4.componentInstance.getChoosenANADate();
                        var displayDate = __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].anaDateDisplay(userInputDate);
                        var msg = _this.chatThread.addTextReply(displayDate, ackId);
                        dateContent_1.input = { date: userInputDate };
                        _this.chatThreadComponent._sendMessageDelegate(new __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["a" /* ANAChatMessage */]({
                            meta: __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].getReplyMeta(inputVM.meta),
                            data: { type: inputVM.data.type, content: dateContent_1 }
                        }), msg);
                    });
                    break;
                }
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].OPTIONS:
                {
                    this.resetInputs();
                    var optionInputContent = inputVM.content;
                    var msg = this.chatThread.addTextReply(optionInputContent.input.title, ackId);
                    this.chatThreadComponent._sendMessageDelegate(new __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["a" /* ANAChatMessage */]({
                        meta: __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].getReplyMeta(inputVM.meta),
                        data: { type: inputVM.data.type, content: optionInputContent }
                    }), msg);
                    break;
                }
            default:
                console.log("Unsupported button type: " + inputVM.content.inputType);
                break;
        }
    };
    ChatInputVM.prototype.handleKeyPress = function (inputVM, event) {
        if (event.keyCode == 13) {
            if (this.inputCategory(inputVM) == __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["e" /* InputCategory */].Text) {
                if (inputVM.textInputContent().input.val)
                    this.handleClick(inputVM);
            }
            else
                this.handleClick(inputVM);
        }
        else {
            this.stomp.sendTypingMessage(inputVM.meta);
        }
    };
    ChatInputVM.prototype.handleBtnOptionClick = function (inputVM, optionVal) {
        if (inputVM.content.inputType == __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].OPTIONS) {
            var x = inputVM.content;
            var option = x.options.find(function (y) { return y.value == optionVal; });
            if (!option) {
                alert('Invalid option!');
                return;
            }
            if (option.type == __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["c" /* ButtonType */].URL) {
                var v = JSON.parse(option.value);
                x.input.val = v.value;
                window.open(v.url, '_blank');
            }
            else
                x.input.val = option.value;
            x.input.title = option.title;
        }
        this.handleClick(inputVM);
    };
    ChatInputVM.prototype.htmlInputType = function (inputVM) {
        switch (inputVM.content.inputType) {
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].TEXT:
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].PHONE:
                return 'text';
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].EMAIL:
                return 'email';
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].NUMERIC:
                return 'number';
            default:
                return 'text';
        }
    };
    ChatInputVM.prototype.isInputValid = function (inputVM) {
        switch (inputVM.content.inputType) {
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].TEXT:
                {
                    var x = inputVM.content;
                    if (!x.input.val)
                        return false;
                    if (x.textInputAttr) {
                        if (x.textInputAttr.minLength > 0 && x.input.val.length < x.textInputAttr.minLength)
                            return false;
                        if (x.textInputAttr.maxLength > 0 && x.input.val.length > x.textInputAttr.maxLength)
                            return false;
                    }
                    return true;
                }
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].EMAIL:
                {
                    var x = inputVM.content;
                    return x.input.val && x.input.val.match(__WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["a" /* Config */].emailRegex);
                }
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].PHONE:
                {
                    var x = inputVM.content;
                    return x.input.val && x.input.val.match(__WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["a" /* Config */].phoneRegex);
                }
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].NUMERIC:
                {
                    var x = inputVM.content;
                    return x.input.val && x.input.val.match(__WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["a" /* Config */].numberRegex);
                }
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].ADDRESS:
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].LOCATION:
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].MEDIA:
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].LIST:
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].TIME:
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].DATE:
                {
                    //These are validated in the complex input dialog itself.
                    return true;
                }
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].OPTIONS:
                {
                    var x = inputVM.content;
                    return x.input.val;
                }
            default:
                console.log("Unsupported button type: " + inputVM.content.inputType);
                break;
        }
    };
    ChatInputVM.prototype.inputErrorMsg = function (inputVM) {
        switch (inputVM.content.inputType) {
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].EMAIL:
                return 'Please give a valid email address';
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].NUMERIC:
                return 'Please give a valid number';
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].PHONE:
                return 'Please give a valid phone number';
            case __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["f" /* InputType */].TEXT:
                {
                    var c = inputVM.textInputContent();
                    if (!c.input.val)
                        return "The value cannot be empty";
                    if (c.input.val && c.input.val.length < c.textInputAttr.minLength)
                        return "Minimum " + c.textInputAttr.minLength + " characters required.";
                    else if (c.input.val && c.input.val.length > c.textInputAttr.maxLength)
                        return "Maximum " + c.textInputAttr.maxLength + " characters allowed.";
                }
            default:
                return 'The value cannot be empty!';
        }
    };
    ChatInputVM.prototype.resetInputs = function () {
        this.textInput = undefined;
        this.clickInput = undefined;
    };
    ChatInputVM.prototype.showLocationPickerDialog = function (locInputContent, inputMeta, inputMessageType, ackId, defaultLoc) {
        var _this = this;
        var dialogRef = this.dialog.open(__WEBPACK_IMPORTED_MODULE_2__components_complex_input_complex_input_component__["a" /* ComplexInputComponent */], {
            width: 'auto',
            data: {
                Type: __WEBPACK_IMPORTED_MODULE_2__components_complex_input_complex_input_component__["b" /* ComplexType */].Location,
                DefaultGeoLoc: defaultLoc
            }
        });
        dialogRef.afterClosed().subscribe(function (result) {
            if (result != true)
                return;
            _this.resetInputs();
            var userInputLoc = dialogRef.componentInstance.geoLoc;
            var gMapUrl = __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].googleMapsStaticLink(userInputLoc);
            var msg = _this.chatThread.addMediaReply({
                previewUrl: gMapUrl,
                type: __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["g" /* MediaType */].IMAGE,
                url: gMapUrl
            }, "Location", ackId);
            locInputContent.input = { location: userInputLoc };
            _this.chatThreadComponent._sendMessageDelegate(new __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["a" /* ANAChatMessage */]({
                meta: __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].getReplyMeta(inputMeta),
                data: { type: inputMessageType, content: locInputContent }
            }), msg);
        });
    };
    ChatInputVM.prototype.sendReplyAfterFileUpload = function (assetUrl, assetType, mediaInputContent, ackId, inputVM) {
        var media = {
            previewUrl: assetUrl,
            type: __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].getAnaMediaTypeFromMIMEType(assetType),
            url: assetUrl
        };
        var msg = this.chatThread.addMediaReply(media, '', ackId);
        mediaInputContent.input = { media: [media] };
        this.resetInputs();
        this.chatThreadComponent._sendMessageDelegate(new __WEBPACK_IMPORTED_MODULE_0__ana_chat_models__["a" /* ANAChatMessage */]({
            meta: __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].getReplyMeta(inputVM.meta),
            data: { type: inputVM.data.type, content: mediaInputContent }
        }), msg);
    };
    return ChatInputVM;
}());

//# sourceMappingURL=ana-chat-vm.models.js.map

/***/ }),

/***/ "../../../../../src/app/models/ana-chat.models.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "f", function() { return InputType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "d", function() { return EventType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "j", function() { return SenderType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "g", function() { return MediaType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "c", function() { return ButtonType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "i", function() { return MessageType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return Bool; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "e", function() { return InputCategory; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "h", function() { return MessageContentType; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ANAChatMessage; });
var InputType;
(function (InputType) {
    InputType[InputType["LOCATION"] = 7] = "LOCATION";
    InputType[InputType["DATE"] = 5] = "DATE";
    InputType[InputType["TIME"] = 6] = "TIME";
    InputType[InputType["ADDRESS"] = 4] = "ADDRESS";
    InputType[InputType["MEDIA"] = 8] = "MEDIA";
    InputType[InputType["OPTIONS"] = 10] = "OPTIONS";
    InputType[InputType["LIST"] = 9] = "LIST";
    InputType[InputType["PHONE"] = 3] = "PHONE";
    InputType[InputType["EMAIL"] = 2] = "EMAIL";
    InputType[InputType["NUMERIC"] = 1] = "NUMERIC";
    InputType[InputType["TEXT"] = 0] = "TEXT";
})(InputType || (InputType = {}));
var EventType;
(function (EventType) {
    EventType[EventType["SET_SESSION_DATA"] = 21] = "SET_SESSION_DATA";
    EventType[EventType["TYPING"] = 11] = "TYPING";
    EventType[EventType["ACK"] = 13] = "ACK";
})(EventType || (EventType = {}));
var SenderType;
(function (SenderType) {
    SenderType[SenderType["AGENT"] = 3] = "AGENT";
    SenderType[SenderType["ANA"] = 1] = "ANA";
    SenderType[SenderType["AI"] = 2] = "AI";
    SenderType[SenderType["USER"] = 0] = "USER";
})(SenderType || (SenderType = {}));
var MediaType;
(function (MediaType) {
    MediaType[MediaType["IMAGE"] = 0] = "IMAGE";
    MediaType[MediaType["VIDEO"] = 2] = "VIDEO";
    MediaType[MediaType["FILE"] = 3] = "FILE";
    MediaType[MediaType["AUDIO"] = 1] = "AUDIO";
})(MediaType || (MediaType = {}));
var ButtonType;
(function (ButtonType) {
    ButtonType[ButtonType["ACTION"] = 2] = "ACTION";
    ButtonType[ButtonType["QUICK_REPLY"] = 1] = "QUICK_REPLY";
    ButtonType[ButtonType["URL"] = 0] = "URL";
})(ButtonType || (ButtonType = {}));
var MessageType;
(function (MessageType) {
    MessageType[MessageType["CAROUSEL"] = 1] = "CAROUSEL";
    MessageType[MessageType["INPUT"] = 2] = "INPUT";
    MessageType[MessageType["EXTERNAL"] = 3] = "EXTERNAL";
    MessageType[MessageType["SIMPLE"] = 0] = "SIMPLE";
})(MessageType || (MessageType = {}));
var Bool;
(function (Bool) {
    Bool[Bool["TRUE"] = 1] = "TRUE";
    Bool[Bool["FALSE"] = 0] = "FALSE";
})(Bool || (Bool = {}));
var InputCategory;
(function (InputCategory) {
    InputCategory[InputCategory["Click"] = 0] = "Click";
    InputCategory[InputCategory["Text"] = 1] = "Text";
})(InputCategory || (InputCategory = {}));
var MessageContentType;
(function (MessageContentType) {
    MessageContentType[MessageContentType["Text"] = 0] = "Text";
    MessageContentType[MessageContentType["Media"] = 1] = "Media";
    MessageContentType[MessageContentType["Typing"] = 2] = "Typing";
})(MessageContentType || (MessageContentType = {}));
var ANAChatMessage = (function () {
    function ANAChatMessage(rawMessage) {
        this.events = [];
        this.raw = rawMessage;
        this.meta = this.raw.meta;
        this.data = this.raw.data;
        this.events = this.raw.events;
    }
    ANAChatMessage.prototype.simpleData = function () {
        return this.data;
    };
    ANAChatMessage.prototype.carouselData = function () {
        return this.data;
    };
    ANAChatMessage.prototype.inputData = function () {
        return this.data;
    };
    ANAChatMessage.prototype.extract = function () {
        return {
            meta: this.meta,
            data: this.data,
            events: this.events
        };
    };
    return ANAChatMessage;
}());

//# sourceMappingURL=ana-chat.models.js.map

/***/ }),

/***/ "../../../../../src/app/models/google-maps-config.model.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return GoogleMapsConfig; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__ = __webpack_require__("../../../../../src/app/services/utilities.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var GoogleMapsConfig = (function () {
    function GoogleMapsConfig(utils) {
        __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */].googleMapsConfigRef = this;
    }
    GoogleMapsConfig = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["C" /* Injectable */])(),
        __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__services_utilities_service__["b" /* UtilitiesService */]) === "function" && _a || Object])
    ], GoogleMapsConfig);
    return GoogleMapsConfig;
    var _a;
}());

//# sourceMappingURL=google-maps-config.model.js.map

/***/ }),

/***/ "../../../../../src/app/services/api.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return APIService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_http__ = __webpack_require__("../../../http/@angular/http.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_map__ = __webpack_require__("../../../../rxjs/add/operator/map.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_map___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_rxjs_add_operator_map__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__services_utilities_service__ = __webpack_require__("../../../../../src/app/services/utilities.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};




var APIService = (function () {
    function APIService(http) {
        this.http = http;
    }
    APIService.prototype.setAPIEndpoint = function (apiEndpoint) {
        this.apiEndpoint = apiEndpoint;
        if (this.apiEndpoint && !this.apiEndpoint.endsWith('/'))
            this.apiEndpoint += "/";
        if (!this.fileUploadEndpoint)
            this.fileUploadEndpoint = this.apiEndpoint + "files";
        this.chatHistoryEndpoint = this.apiEndpoint + "chatdata/messages?userId={userId}&businessId={businessId}&flowId={flowId}&size={size}&page=0&ofCurrentSession={ofCurrentSession}";
    };
    APIService.prototype.uploadFile = function (file) {
        var formData = new FormData();
        formData.append("file", file);
        var headers = new __WEBPACK_IMPORTED_MODULE_1__angular_http__["a" /* Headers */]();
        return this.http.post(this.fileUploadEndpoint, formData, { headers: headers }).map(function (res) { return res.json(); });
    };
    APIService.prototype.fetchHistory = function (oldestMsgTimestamp, size) {
        if (size === void 0) { size = 20; }
        var businessId = __WEBPACK_IMPORTED_MODULE_3__services_utilities_service__["b" /* UtilitiesService */].settings.stompConfig.businessId;
        var customerId = __WEBPACK_IMPORTED_MODULE_3__services_utilities_service__["b" /* UtilitiesService */].settings.stompConfig.customerId;
        var flowId = __WEBPACK_IMPORTED_MODULE_3__services_utilities_service__["b" /* UtilitiesService */].settings.stompConfig.flowId;
        var currentSessionOnly = __WEBPACK_IMPORTED_MODULE_3__services_utilities_service__["b" /* UtilitiesService */].settings.stompConfig.currentSessionOnly;
        var api = this.chatHistoryEndpoint
            .replace('{userId}', customerId)
            .replace('{businessId}', businessId)
            .replace('{size}', size.toString())
            .replace('{flowId}', flowId)
            .replace('{ofCurrentSession}', currentSessionOnly ? 'true' : 'false');
        if (oldestMsgTimestamp)
            api += "&lastMessageTimeStamp=" + oldestMsgTimestamp.toString();
        return this.http.get(api).map(function (res) { return res.json(); });
    };
    APIService = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["C" /* Injectable */])(),
        __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_http__["b" /* Http */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_http__["b" /* Http */]) === "function" && _a || Object])
    ], APIService);
    return APIService;
    var _a;
}());

//# sourceMappingURL=api.service.js.map

/***/ }),

/***/ "../../../../../src/app/services/chain-delay.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return ChainDelayService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var ChainDelayService = (function () {
    function ChainDelayService() {
        this.queue = [];
    }
    ChainDelayService.prototype.schedule = function (fn, t) {
        var _this = this;
        this.timer = setTimeout(function () {
            _this.timer = null;
            fn(_this.queue.length);
            if (_this.queue.length) {
                var item = _this.queue.shift();
                _this.schedule(item.fn, item.t);
            }
        }, t);
    };
    ;
    ChainDelayService.prototype.delay = function (fn, t) {
        // if already queuing things or running a timer, 
        //   then just add to the queue
        if (this.queue.length || this.timer) {
            this.queue.push({ fn: fn, t: t });
        }
        else {
            // no queue or timer yet, so schedule the timer
            this.schedule(fn, t);
        }
    };
    ;
    ChainDelayService.prototype.cancel = function () {
        clearTimeout(this.timer);
        this.queue = [];
    };
    ;
    ChainDelayService = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["C" /* Injectable */])(),
        __metadata("design:paramtypes", [])
    ], ChainDelayService);
    return ChainDelayService;
}());

//# sourceMappingURL=chain-delay.service.js.map

/***/ }),

/***/ "../../../../../src/app/services/info-dialog.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return InfoDialogService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_material__ = __webpack_require__("../../../material/@angular/material.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__components_info_dialog_info_dialog_component__ = __webpack_require__("../../../../../src/app/components/info-dialog/info-dialog.component.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};



var InfoDialogService = (function () {
    function InfoDialogService(dialog) {
        this.dialog = dialog;
    }
    InfoDialogService.prototype.alert = function (title, message, callback, primaryButton, secondaryButton) {
        var data = {
            dialogType: __WEBPACK_IMPORTED_MODULE_2__components_info_dialog_info_dialog_component__["b" /* InfoDialogType */].Alert,
            message: message,
            title: title,
            primaryButton: primaryButton,
            secondaryButton: secondaryButton
        };
        var d = this.dialog.open(__WEBPACK_IMPORTED_MODULE_2__components_info_dialog_info_dialog_component__["a" /* InfoDialogComponent */], {
            width: 'auto',
            data: data
        });
        if (callback)
            d.afterClosed().subscribe(function (x) {
                if (callback)
                    callback();
            });
    };
    InfoDialogService.prototype.prompt = function (title, message, callback, defaultText, primaryButton, secondaryButton) {
        var data = {
            dialogType: __WEBPACK_IMPORTED_MODULE_2__components_info_dialog_info_dialog_component__["b" /* InfoDialogType */].Prompt,
            message: message,
            title: title,
            defaultInputText: defaultText,
            primaryButton: primaryButton,
            secondaryButton: secondaryButton
        };
        var d = this.dialog.open(__WEBPACK_IMPORTED_MODULE_2__components_info_dialog_info_dialog_component__["a" /* InfoDialogComponent */], {
            width: 'auto',
            data: data
        });
        d.afterClosed().subscribe(function (x) {
            callback(x);
        });
    };
    InfoDialogService.prototype.confirm = function (title, message, callback, primaryButton, secondaryButton) {
        var data = {
            dialogType: __WEBPACK_IMPORTED_MODULE_2__components_info_dialog_info_dialog_component__["b" /* InfoDialogType */].Confirm,
            message: message,
            title: title,
            primaryButton: primaryButton,
            secondaryButton: secondaryButton
        };
        var d = this.dialog.open(__WEBPACK_IMPORTED_MODULE_2__components_info_dialog_info_dialog_component__["a" /* InfoDialogComponent */], {
            width: 'auto',
            data: data
        });
        d.afterClosed().subscribe(function (x) {
            callback(x);
        });
    };
    InfoDialogService = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["C" /* Injectable */])(),
        __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_1__angular_material__["g" /* MdDialog */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_1__angular_material__["g" /* MdDialog */]) === "function" && _a || Object])
    ], InfoDialogService);
    return InfoDialogService;
    var _a;
}());

//# sourceMappingURL=info-dialog.service.js.map

/***/ }),

/***/ "../../../../../src/app/services/mat-css.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return MatCSSService; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};

var MAT_CSS = __webpack_require__("../../../material/prebuilt-themes/indigo-pink.css");
var MatCSSService = (function () {
    function MatCSSService() {
    }
    MatCSSService.prototype.loadCustomMatTheme = function (accent, customStyle, appCSS) {
        var c1 = /#3f51b5/g;
        var c2 = /#ff4081/g;
        var c3 = /#f44336/g;
        //Replacing mat default theme colors with the requested accent color
        var resultCSS = MAT_CSS.replace(c1, accent).replace(c2, accent).replace(c3, accent) + "\r\n" + appCSS;
        customStyle.innerHTML = resultCSS;
    };
    MatCSSService = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["C" /* Injectable */])(),
        __metadata("design:paramtypes", [])
    ], MatCSSService);
    return MatCSSService;
}());

//# sourceMappingURL=mat-css.service.js.map

/***/ }),

/***/ "../../../../../src/app/services/plugin.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* unused harmony export VariableType */
/* unused harmony export ButtonType */
/* unused harmony export SectionType */
/* unused harmony export CarouselButtonType */
/* unused harmony export NodeType */
/* unused harmony export APIMethod */
/* unused harmony export CardPlacement */
/* unused harmony export ConditionOperator */
/* unused harmony export EditorType */
/* unused harmony export ModelHelpers */
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SimulatorFromStudio; });
/* unused harmony export SimulatorMessageType */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_underscore__ = __webpack_require__("../../../../../../node_modules/underscore/underscore.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0_underscore___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_0_underscore__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_jsonpath__ = __webpack_require__("../../../../jsonpath/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_jsonpath___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_jsonpath__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__angular_http__ = __webpack_require__("../../../http/@angular/http.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__utilities_service__ = __webpack_require__("../../../../../src/app/services/utilities.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__ = __webpack_require__("../../../../../src/app/models/ana-chat.models.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_6__resolver_service__ = __webpack_require__("../../../../../src/app/services/resolver.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};





//import { SampleService } from './ .service';


var VariableType;
(function (VariableType) {
    VariableType[VariableType["Array"] = 0] = "Array";
    VariableType[VariableType["String"] = 1] = "String";
    VariableType[VariableType["Object"] = 2] = "Object";
    VariableType[VariableType["Other"] = 3] = "Other";
})(VariableType || (VariableType = {}));
var ButtonType;
(function (ButtonType) {
    ButtonType[ButtonType["ACTION"] = 2] = "ACTION";
    ButtonType[ButtonType["QUICK_REPLY"] = 1] = "QUICK_REPLY";
    ButtonType[ButtonType["URL"] = 0] = "URL";
})(ButtonType || (ButtonType = {}));
//////////////////////////////////////////
///////////////////////////////////////////
///////////////////////////////////////////
var SectionType;
(function (SectionType) {
    SectionType["Image"] = "Image";
    SectionType["Text"] = "Text";
    SectionType["Graph"] = "Graph";
    SectionType["Gif"] = "Gif";
    SectionType["Audio"] = "Audio";
    SectionType["Video"] = "Video";
    SectionType["Link"] = "Link";
    SectionType["EmbeddedHtml"] = "EmbeddedHtml";
    SectionType["Carousel"] = "Carousel";
    SectionType["PrintOTP"] = "PrintOTP";
})(SectionType || (SectionType = {}));
var CarouselButtonType;
(function (CarouselButtonType) {
    CarouselButtonType["NextNode"] = "NextNode";
    CarouselButtonType["DeepLink"] = "DeepLink";
    CarouselButtonType["OpenUrl"] = "OpenUrl";
})(CarouselButtonType || (CarouselButtonType = {}));
var NodeType;
(function (NodeType) {
    NodeType["ApiCall"] = "ApiCall";
    NodeType["Combination"] = "Combination";
    NodeType["Card"] = "Card";
    NodeType["JumpToBot"] = "JumpToBot";
    NodeType["Condition"] = "Condition";
    NodeType["HandoffToAgent"] = "HandoffToAgent";
})(NodeType || (NodeType = {}));
var APIMethod;
(function (APIMethod) {
    APIMethod["GET"] = "GET";
    APIMethod["POST"] = "POST";
    APIMethod["PUT"] = "PUT";
    APIMethod["DELETE"] = "DELETE";
    APIMethod["HEAD"] = "HEAD";
    APIMethod["OPTIONS"] = "OPTIONS";
    APIMethod["CONNECT"] = "CONNECT";
})(APIMethod || (APIMethod = {}));
var CardPlacement;
(function (CardPlacement) {
    CardPlacement["Incoming"] = "Incoming";
    CardPlacement["Outgoing"] = "Outgoing";
    CardPlacement["Center"] = "Center";
})(CardPlacement || (CardPlacement = {}));
// Sections - End
var ConditionOperator;
(function (ConditionOperator) {
    ConditionOperator["EqualTo"] = "EqualTo";
    ConditionOperator["NotEqualTo"] = "NotEqualTo";
    ConditionOperator["GreaterThan"] = "GreaterThan";
    ConditionOperator["LessThan"] = "LessThan";
    ConditionOperator["GreaterThanOrEqualTo"] = "GreaterThanOrEqualTo";
    ConditionOperator["LessThanOrEqualTo"] = "LessThanOrEqualTo";
    ConditionOperator["Mod"] = "Mod";
    ConditionOperator["In"] = "In";
    ConditionOperator["NotIn"] = "NotIn";
    ConditionOperator["StartsWith"] = "StartsWith";
    ConditionOperator["EndsWith"] = "EndsWith";
    ConditionOperator["Contains"] = "Contains";
    ConditionOperator["Between"] = "Between";
    ConditionOperator["IsNull"] = "IsNull";
})(ConditionOperator || (ConditionOperator = {}));
(function (ButtonType) {
    ButtonType["OpenUrl"] = "OpenUrl";
    ButtonType["GetText"] = "GetText";
    ButtonType["GetNumber"] = "GetNumber";
    ButtonType["GetAddress"] = "GetAddress";
    ButtonType["GetEmail"] = "GetEmail";
    ButtonType["GetPhoneNumber"] = "GetPhoneNumber";
    ButtonType["GetItemFromSource"] = "GetItemFromSource";
    ButtonType["GetImage"] = "GetImage";
    ButtonType["GetAudio"] = "GetAudio";
    ButtonType["GetVideo"] = "GetVideo";
    ButtonType["NextNode"] = "NextNode";
    ButtonType["DeepLink"] = "DeepLink";
    ButtonType["GetAgent"] = "GetAgent";
    ButtonType["GetFile"] = "GetFile";
    ButtonType["ShowConfirmation"] = "ShowConfirmation";
    ButtonType["FetchChatFlow"] = "FetchChatFlow";
    /// Format: yyyy-MM-dd
    ButtonType["GetDate"] = "GetDate";
    /// Format: HH:mm:ss
    ButtonType["GetTime"] = "GetTime";
    /// Format: yyyy-MM-ddTHH:mm:ss
    ButtonType["GetDateTime"] = "GetDateTime";
    /// Format: [Latitude],[Longitude]
    ButtonType["GetLocation"] = "GetLocation";
})(ButtonType || (ButtonType = {}));
var EditorType;
(function (EditorType) {
    EditorType["Text"] = "Text";
    EditorType["TitleCaptionUrl"] = "TitleCaptionUrl";
    EditorType["Carousel"] = "Carousel";
})(EditorType || (EditorType = {}));
var ModelHelpers = (function () {
    function ModelHelpers() {
        this.CarouselButtonType = CarouselButtonType;
        this.carouselButtonTypes = [
            CarouselButtonType.NextNode,
            CarouselButtonType.OpenUrl,
        ];
        this.nodeTypes = [
            NodeType.ApiCall,
            NodeType.Combination,
            //NodeType.Card,
            NodeType.Condition,
            NodeType.HandoffToAgent,
            NodeType.JumpToBot
        ];
        this.apiMethods = [
            APIMethod.GET,
            APIMethod.POST,
            APIMethod.PUT,
            APIMethod.HEAD,
            APIMethod.OPTIONS,
            APIMethod.DELETE,
            APIMethod.CONNECT
        ];
        this.cardPlacements = [
            CardPlacement.Center,
            CardPlacement.Incoming,
            CardPlacement.Outgoing,
        ];
        this.buttonTypes = [
            ButtonType.DeepLink,
            //ButtonType.FetchChatFlow,
            ButtonType.GetAddress,
            //ButtonType.GetAgent,
            ButtonType.GetAudio,
            ButtonType.GetDate,
            //ButtonType.GetDateTime,
            ButtonType.GetEmail,
            ButtonType.GetImage,
            ButtonType.GetItemFromSource,
            ButtonType.GetLocation,
            ButtonType.GetNumber,
            ButtonType.GetPhoneNumber,
            ButtonType.GetText,
            ButtonType.GetTime,
            ButtonType.GetVideo,
            ButtonType.GetFile,
            ButtonType.NextNode,
            ButtonType.OpenUrl,
        ];
        this.conditionOperators = [
            ConditionOperator.EqualTo,
            ConditionOperator.NotEqualTo,
            ConditionOperator.GreaterThan,
            ConditionOperator.LessThan,
            ConditionOperator.GreaterThanOrEqualTo,
            ConditionOperator.LessThanOrEqualTo,
            ConditionOperator.Mod,
            ConditionOperator.In,
            ConditionOperator.NotIn,
            ConditionOperator.StartsWith,
            ConditionOperator.EndsWith,
            ConditionOperator.Contains,
            ConditionOperator.Between,
            ConditionOperator.IsNull
        ];
    }
    ModelHelpers.prototype.sectionAlias = function (section) {
        switch (section.SectionType) {
            case SectionType.Text:
                {
                    var ts = section;
                    return ts.Text || ts.SectionType;
                }
            case SectionType.Image:
            case SectionType.Audio:
            case SectionType.Video:
            case SectionType.EmbeddedHtml:
            case SectionType.Gif:
            case SectionType.Graph:
            case SectionType.Carousel:
                {
                    var tcs = section;
                    return tcs.Title || tcs.Caption || tcs.SectionType;
                }
            default:
                return section.SectionType;
        }
    };
    ModelHelpers.prototype.chatButtonAlias = function (btn) {
        return btn.ButtonName || btn.ButtonText || btn.ButtonType;
    };
    ModelHelpers.prototype.editorTypeFromSectionType = function (secType) {
        switch (secType) {
            case SectionType.Text:
                return EditorType.Text;
            case SectionType.Image:
            case SectionType.Audio:
            case SectionType.Video:
            case SectionType.Gif:
            case SectionType.PrintOTP:
            case SectionType.EmbeddedHtml:
                return EditorType.TitleCaptionUrl;
            case SectionType.Carousel:
                return EditorType.Carousel;
            default:
                return EditorType.Text;
        }
    };
    return ModelHelpers;
}());

///////////////////////////////////////////////////////////////////////
var SimulatorFromStudio = (function () {
    function SimulatorFromStudio(globals, http) {
        this.globals = globals;
        this.http = http;
        this.debug = true;
        this.chatFlow = [];
        //private sample: SampleService
        this.simulatorBusinessId = 'ana-studio';
        this.simulatorCustomerId = 'ana-simulator';
        // window.onmessage = (event) => {
        //     this.logDebug('On message received from client:');
        //     this.logDebug(event.data);
        //     let msg = event.data as SimulatorMessage;
        //     if (msg.type == SimulatorMessageType.AnaChatMessage) {
        //         let cfMsg = (msg as AnaChatSimulatorMessage);
        //         this.handleIncomingMessage(cfMsg.data);
        //     }
        // }
    }
    SimulatorFromStudio.prototype.onMessage = function (event) {
        this.logDebug('On message received from client:');
        this.logDebug(event.data);
        var msg = event;
        //debugger
        if (msg.type == SimulatorMessageType.AnaChatMessage) {
            var cfMsg = msg;
            this.handleIncomingMessage(cfMsg.data);
        }
    };
    SimulatorFromStudio.prototype.getJSON = function (url) {
        return this.http.get(url).map(function (res) { return res.json(); });
    };
    SimulatorFromStudio.prototype.init = function (url) {
        var _this = this;
        var chatdata;
        this.getJSON(url).subscribe(function (resData) {
            chatdata = resData;
            //debugger
            _this.chatFlow = chatdata.ChatNodes;
            //this.chatFlow = []            
            //console.log("chat nodes" + JSON.stringify(this.chatFlow))
            if (_this.chatFlow && _this.chatFlow.length > 0) {
                _this.state = {
                    variables: {}
                };
                _this.pushResetToClient();
                var firstMsg = {
                    "meta": {
                        "sender": {
                            "id": _this.simulatorBusinessId,
                            "medium": 100
                        },
                        "recipient": {
                            "id": _this.simulatorCustomerId,
                            "medium": 100
                        },
                        "senderType": __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["j" /* SenderType */].USER,
                        "timestamp": new Date().getTime(),
                    },
                    "data": {
                        "type": 2,
                        "content": {
                            "inputType": __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].OPTIONS,
                            "mandatory": 1,
                            "options": [
                                {
                                    "title": "Get Started",
                                    "value": "GetStarted"
                                }
                            ],
                            "input": {
                                "val": "GET_STARTED"
                            }
                        }
                    }
                };
                _this.handleIncomingMessage(firstMsg);
            }
        });
    };
    SimulatorFromStudio.prototype.handleIncomingMessage = function (message) {
        this.logDebug("Incoming message from client: ");
        this.logDebug(message);
        this.processIncomingMessage(message);
    };
    SimulatorFromStudio.prototype.pushMessageToClient = function (message) {
        var resp = {
            data: message,
            type: SimulatorMessageType.AnaChatMessage
        };
        __WEBPACK_IMPORTED_MODULE_6__resolver_service__["a" /* SampleService */].onMessage(resp);
    };
    SimulatorFromStudio.prototype.pushResetToClient = function () {
        //console.log("simulator msg type" + SimulatorMessageType.AnaChatReset)
        __WEBPACK_IMPORTED_MODULE_6__resolver_service__["a" /* SampleService */].onMessage({
            type: SimulatorMessageType.AnaChatReset
        });
    };
    SimulatorFromStudio.prototype.processIncomingMessage = function (chatMsg) {
        var message = chatMsg.data;
        if (message.type == __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["i" /* MessageType */].INPUT) {
            var ipMsgContent = message.content;
            if (ipMsgContent.input && Object.keys(ipMsgContent.input).length > 0) {
                var nextNodeId = "";
                var userData = null;
                switch (ipMsgContent.inputType) {
                    case __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].LOCATION://Click, Complex
                        {
                            var locIp = ipMsgContent.input;
                            userData = __WEBPACK_IMPORTED_MODULE_4__utilities_service__["b" /* UtilitiesService */].anaLocationDisplay(locIp.location);
                            var clickedBtn = this.getNodeButtonByType(ButtonType.GetLocation);
                            if (clickedBtn)
                                nextNodeId = clickedBtn.NextNodeId;
                        }
                        break;
                    case __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].DATE://Click, Complex
                        {
                            var ip = ipMsgContent.input;
                            userData = __WEBPACK_IMPORTED_MODULE_4__utilities_service__["b" /* UtilitiesService */].anaDateDisplay(ip.date);
                            var clickedBtn = this.getNodeButtonByType(ButtonType.GetDate);
                            if (clickedBtn)
                                nextNodeId = clickedBtn.NextNodeId;
                        }
                        break;
                    case __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].TIME://Click, Complex
                        {
                            var ip = ipMsgContent.input;
                            userData = __WEBPACK_IMPORTED_MODULE_4__utilities_service__["b" /* UtilitiesService */].anaTimeDisplay(ip.time);
                            var clickedBtn = this.getNodeButtonByType(ButtonType.GetTime);
                            if (clickedBtn)
                                nextNodeId = clickedBtn.NextNodeId;
                        }
                        break;
                    case __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].ADDRESS://Click, Complex
                        {
                            var ip = ipMsgContent.input;
                            userData = __WEBPACK_IMPORTED_MODULE_4__utilities_service__["b" /* UtilitiesService */].anaAddressDisplay(ip.address);
                            var clickedBtn = this.getNodeButtonByType(ButtonType.GetAddress);
                            if (clickedBtn)
                                nextNodeId = clickedBtn.NextNodeId;
                        }
                        break;
                    case __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].MEDIA://Click, Non Complex
                        {
                            var ip = ipMsgContent.input;
                            if (ip.media && ip.media.length > 0 && ip.media[0]) {
                                if (typeof ip.media[0].url == 'object')
                                    userData = ip.media[0].url.changingThisBreaksApplicationSecurity;
                                else
                                    userData = ip.media[0].url;
                                var cfmType = ButtonType.GetFile;
                                switch (ip.media[0].type) {
                                    case __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["g" /* MediaType */].AUDIO:
                                        cfmType = ButtonType.GetAudio;
                                        break;
                                    case __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["g" /* MediaType */].VIDEO:
                                        cfmType = ButtonType.GetVideo;
                                        break;
                                    case __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["g" /* MediaType */].IMAGE:
                                        cfmType = ButtonType.GetImage;
                                        break;
                                    case __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["g" /* MediaType */].FILE:
                                    default:
                                        cfmType = ButtonType.GetFile;
                                        break;
                                }
                                var clickedBtn = this.getNodeButtonByType(cfmType);
                                if (clickedBtn)
                                    nextNodeId = clickedBtn.NextNodeId;
                            }
                        }
                        break;
                    case __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].OPTIONS://Click, Non Complex
                        {
                            var ip = ipMsgContent.input; //Option also has input.val
                            // console.log(JSON.stringify(ip)+"////////")
                            if (ip.val == "GET_STARTED") {
                                var firstNode = __WEBPACK_IMPORTED_MODULE_0_underscore__["first"](this.chatFlow.filter(function (x) { if (x.IsStartNode == true)
                                    return x; }));
                                nextNodeId = (firstNode ? firstNode.Id : this.chatFlow[0].Id);
                                // console.log(nextNodeId+"////////////////")
                            }
                            else {
                                var clickedBtn = this.getNodeButtonById(ip.val);
                                if (clickedBtn) {
                                    nextNodeId = clickedBtn.NextNodeId;
                                    userData = clickedBtn.VariableValue;
                                }
                            }
                        }
                        break;
                    case __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].LIST://Click, Complex
                        {
                            var ipMsg = ipMsgContent;
                            var ip = ipMsg.input;
                            var listSelectedValues_1 = ip.val.split(',');
                            var listSelectedItems = ipMsg.values.filter(function (x) { return listSelectedValues_1.indexOf(x.value) != -1; });
                            userData = ip.val; //listSelectedItems.map(x => x.text);
                            var clickedBtn = this.getNodeButtonByType(ButtonType.GetItemFromSource);
                            if (clickedBtn)
                                nextNodeId = clickedBtn.NextNodeId;
                        }
                        break;
                    case __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].PHONE:
                        {
                            var ip = ipMsgContent.input;
                            userData = ip.val;
                            var clickedBtn = this.getNodeButtonByType(ButtonType.GetPhoneNumber);
                            if (clickedBtn)
                                nextNodeId = clickedBtn.NextNodeId;
                        }
                        break;
                    case __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].EMAIL:
                        {
                            var ip = ipMsgContent.input;
                            userData = ip.val;
                            var clickedBtn = this.getNodeButtonByType(ButtonType.GetEmail);
                            if (clickedBtn)
                                nextNodeId = clickedBtn.NextNodeId;
                        }
                        break;
                    case __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].NUMERIC:
                        {
                            var ip = ipMsgContent.input;
                            userData = ip.val;
                            var clickedBtn = this.getNodeButtonByType(ButtonType.GetNumber);
                            if (clickedBtn)
                                nextNodeId = clickedBtn.NextNodeId;
                        }
                        break;
                    case __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].TEXT:
                        {
                            var ip = ipMsgContent.input;
                            userData = ip.val;
                            var clickedBtn = this.getNodeButtonByType(ButtonType.GetText);
                            if (clickedBtn)
                                nextNodeId = clickedBtn.NextNodeId;
                        }
                        break;
                    default:
                        break;
                }
                //console.log("next node" + nextNodeId)
                this.saveVariable(userData);
                this.gotoNextNode(nextNodeId);
            }
        }
        else if (message.type == __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["i" /* MessageType */].CAROUSEL) {
            var msgContent = message.content;
            if (msgContent.input && Object.keys(msgContent.input).indexOf('val') != -1 && msgContent.input.val) {
                var clickedCarBtn = this.getCarouselButtonById(msgContent.input.val);
                this.saveVariable(clickedCarBtn.VariableValue);
                switch (clickedCarBtn.Type) {
                    case CarouselButtonType.DeepLink:
                    case CarouselButtonType.OpenUrl:
                    case CarouselButtonType.NextNode:
                    default:
                        this.gotoNextNode(clickedCarBtn.NextNodeId);
                        break;
                }
            }
        }
    };
    SimulatorFromStudio.prototype.gotoNextNode = function (nextNodeId) {
        var nextNode = this.getNodeById(nextNodeId);
        if (nextNode)
            this.processNode(nextNode);
    };
    SimulatorFromStudio.prototype.getNodeById = function (Id) {
        if (Id) {
            var foundNodes = this.chatFlow.filter(function (n) { return n.Id == Id; });
            if (foundNodes && foundNodes.length > 0)
                return foundNodes[0];
        }
        return null;
    };
    SimulatorFromStudio.prototype.getNodeButtonById = function (buttonId) {
        var btn = this.state.currentNode.Buttons.filter(function (x) { return x._id == buttonId; });
        return (btn && btn.length > 0) ? btn[0] : null;
    };
    SimulatorFromStudio.prototype.getNodeButtonByType = function (type) {
        var btn = this.state.currentNode.Buttons.filter(function (x) { return x.ButtonType == type; });
        var firstTry = (btn && btn.length > 0) ? btn[0] : null;
        if (firstTry)
            return firstTry;
        if (type == ButtonType.GetText) {
            var found = __WEBPACK_IMPORTED_MODULE_0_underscore__["first"](__WEBPACK_IMPORTED_MODULE_0_underscore__["filter"](this.state.currentNode.Buttons, function (x) { return __WEBPACK_IMPORTED_MODULE_0_underscore__["contains"]([
                ButtonType.GetPhoneNumber,
                ButtonType.GetEmail,
                ButtonType.GetNumber
            ], x.ButtonType); }));
            if (found)
                return found;
        }
        return null;
    };
    SimulatorFromStudio.prototype.getCarouselButtonById = function (carItemBtnId) {
        var carSection = this.state.currentSection;
        if (carSection && carSection.SectionType == SectionType.Carousel) {
            var carBtn = carSection.Items.map(function (x) { return x.Buttons; }).reduce(function (a, b) { return (a && a.length > 0 && b && b.length > 0) ? a.concat(b) : []; }).filter(function (x) { return x._id == carItemBtnId; });
            return (carBtn && carBtn.length > 0) ? carBtn[0] : null;
        }
        return null;
    };
    SimulatorFromStudio.prototype.saveVariable = function (value) {
        if (value && this.state.currentNode && this.state.currentNode.VariableName)
            this.state.variables[this.state.currentNode.VariableName] = value;
    };
    SimulatorFromStudio.prototype.logDebug = function (msg) {
        if (this.debug)
            console.log(msg);
    };
    SimulatorFromStudio.prototype.processVerbsForChatNode = function (chatNode) {
        return JSON.parse(this.processVerbs(JSON.stringify(chatNode)));
    };
    SimulatorFromStudio.prototype.replaceTxt = function (subStr, key) {
        if (!key)
            key = subStr.replace('{{', '').replace('}}', '');
        try {
            if (this.state.variables && this.state.variables[key])
                return this.state.variables[key];
            else {
                var rootToken = key.split(/\.|\[/)[0];
                var wrappedResp = {};
                wrappedResp[rootToken] = JSON.parse(this.state.variables[rootToken]);
                var deepValue = __WEBPACK_IMPORTED_MODULE_1_jsonpath__["query"](wrappedResp, key);
                if (deepValue && typeof deepValue == 'object' && deepValue.length == 1) {
                    deepValue = deepValue[0];
                }
                return deepValue;
            }
        }
        catch (e) {
            return subStr;
        }
    };
    SimulatorFromStudio.prototype.jsonEscape = function (value) {
        if (value && (typeof value == "string") && value.replace) {
            var rTxt = value
                .replace(/\n/g, "\\n")
                .replace(/\"/g, '\\"')
                .replace(/\&/g, "\\&")
                .replace(/\r/g, "\\r")
                .replace(/\t/g, "\\t")
                .replace(/\f/g, "\\f");
            return rTxt;
        }
        return value;
    };
    SimulatorFromStudio.prototype.processVerbs = function (txt) {
        var _this = this;
        var processedText = txt.replace(/\[~(.*?)\]|{{(.*?)}}/g, function (subStr, key) {
            return _this.jsonEscape(_this.replaceTxt(subStr, key));
        });
        return processedText;
    };
    SimulatorFromStudio.prototype.processNode = function (chatNode, section) {
        var _this = this;
        chatNode = this.processVerbsForChatNode(chatNode);
        this.state.currentNode = chatNode;
        this.state.currentSection = section || __WEBPACK_IMPORTED_MODULE_0_underscore__["first"](chatNode.Sections);
        switch (chatNode.NodeType) {
            case NodeType.ApiCall:
                {
                    var apiHeaders = new __WEBPACK_IMPORTED_MODULE_2__angular_http__["a" /* Headers */]();
                    if (chatNode.Headers) {
                        var splits = chatNode.Headers.split(/\n|,/);
                        for (var si = 0; si < splits.length; si++) {
                            try {
                                var split = splits[si];
                                if (split.indexOf(':') != -1) {
                                    var key = split.split(':')[0];
                                    var value = split.split(':')[1];
                                    apiHeaders.set(key, value);
                                }
                            }
                            catch (e) {
                                this.logDebug('Invalid format provided in headers');
                                this.logDebug(e);
                            }
                        }
                    }
                    var reqBody = null;
                    if (chatNode.RequestBody)
                        reqBody = this.processVerbs(chatNode.RequestBody);
                    var reqParams = new URLSearchParams();
                    if (chatNode.RequiredVariables) {
                        for (var i = 0; i < chatNode.RequiredVariables.length; i++) {
                            if (chatNode.RequiredVariables[i] && Object.keys(this.state.variables).indexOf(chatNode.RequiredVariables[i]) != -1)
                                reqParams.append(chatNode.RequiredVariables[i], this.state.variables[chatNode.RequiredVariables[i]]);
                        }
                    }
                    var nextNodeId_1 = chatNode.NextNodeId;
                    this.http.request(chatNode.ApiUrl, {
                        headers: apiHeaders,
                        body: reqBody,
                        method: APIMethod[chatNode.ApiMethod],
                        params: reqParams,
                    }).subscribe(function (res) {
                        _this.saveVariable(res.text());
                        _this.processConditionNode(chatNode);
                    }, function (err) {
                        if (Math.trunc(err.status / 100) == 5 || typeof err._body == 'object') {
                            _this.logDebug(err);
                            _this.gotoNextNode(nextNodeId_1); //Fallback node
                        }
                        else {
                            _this.saveVariable(err._body);
                            _this.processConditionNode(chatNode);
                        }
                    });
                }
                break;
            case NodeType.Card:
                break;
            case NodeType.Condition:
                this.processConditionNode(chatNode);
                break;
            case NodeType.Combination:
            default:
                {
                    if (chatNode.Sections && chatNode.Sections.length > 0) {
                        var msg = this.convertSection(this.state.currentSection);
                        this.prepareReplyAndSend(msg);
                        var sectionIndex = chatNode.Sections.findIndex(function (x) { return x._id == _this.state.currentSection._id; });
                        var remainingSections = chatNode.Sections.length - (sectionIndex + 1);
                        if (remainingSections > 0) {
                            this.processNode(chatNode, chatNode.Sections[sectionIndex + 1]);
                            return;
                        }
                    }
                    if (this.state.currentNode && this.state.currentNode.Buttons && this.state.currentNode.Buttons.length > 0) {
                        this.convertButtons(this.state.currentNode, function (inputMsgToSend) {
                            _this.prepareReplyAndSend(inputMsgToSend);
                        });
                    }
                }
                break;
        }
    };
    SimulatorFromStudio.prototype.prepareReplyAndSend = function (data) {
        var meta = {
            id: __WEBPACK_IMPORTED_MODULE_4__utilities_service__["b" /* UtilitiesService */].uuidv4(),
            recipient: {
                id: this.simulatorBusinessId,
                medium: 100
            },
            sender: {
                id: this.simulatorCustomerId,
                medium: 100
            },
            senderType: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["j" /* SenderType */].ANA,
            sessionId: '1234',
            timestamp: new Date().getTime(),
            responseTo: '',
        };
        this.pushMessageToClient({
            meta: meta,
            data: data,
        });
    };
    SimulatorFromStudio.prototype.convertSection = function (section) {
        var _this = this;
        var anaMessageContent = {
            text: ''
        };
        var anaMessageData = {
            content: anaMessageContent,
            type: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["i" /* MessageType */].SIMPLE
        };
        switch (section.SectionType) {
            case SectionType.Image:
                anaMessageContent.media = {
                    type: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["g" /* MediaType */].IMAGE,
                    url: section.Url,
                };
                anaMessageContent.text = section.Title;
                break;
            case SectionType.Text:
            default:
                anaMessageContent.text = section.Text;
                break;
            case SectionType.Gif:
                anaMessageContent.media = {
                    type: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["g" /* MediaType */].IMAGE,
                    url: section.Url,
                };
                anaMessageContent.text = section.Title;
                break;
            case SectionType.Audio:
                anaMessageContent.media = {
                    type: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["g" /* MediaType */].AUDIO,
                    url: section.Url,
                };
                anaMessageContent.text = section.Title;
                break;
            case SectionType.Video:
                anaMessageContent.media = {
                    type: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["g" /* MediaType */].VIDEO,
                    url: section.Url,
                };
                anaMessageContent.text = section.Title;
                break;
            case SectionType.Carousel:
                {
                    var carContent = {
                        items: __WEBPACK_IMPORTED_MODULE_0_underscore__["map"](section.Items, function (x) {
                            return {
                                title: x.Title,
                                desc: x.Caption,
                                media: {
                                    type: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["g" /* MediaType */].IMAGE,
                                    url: x.ImageUrl
                                },
                                options: __WEBPACK_IMPORTED_MODULE_0_underscore__["map"](x.Buttons, function (y) {
                                    if (y.Type == CarouselButtonType.NextNode) {
                                        return {
                                            title: y.Text,
                                            value: y._id,
                                            type: _this.convertCarouselButtonType(y.Type)
                                        };
                                    }
                                    else {
                                        return {
                                            title: y.Text,
                                            value: JSON.stringify({
                                                url: y.Url,
                                                value: y._id
                                            }),
                                            type: _this.convertCarouselButtonType(y.Type)
                                        };
                                    }
                                }),
                                url: ''
                            };
                        }),
                        mandatory: 1
                    };
                    anaMessageData = {
                        type: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["i" /* MessageType */].CAROUSEL,
                        content: carContent
                    };
                }
                break;
        }
        return anaMessageData;
    };
    SimulatorFromStudio.prototype.convertButtons = function (chatNode, callback) {
        var _this = this;
        var clickInputs = __WEBPACK_IMPORTED_MODULE_0_underscore__["filter"](chatNode.Buttons, function (x) { return __WEBPACK_IMPORTED_MODULE_0_underscore__["contains"]([
            ButtonType.DeepLink,
            ButtonType.OpenUrl,
            ButtonType.GetDate,
            ButtonType.GetImage,
            ButtonType.GetVideo,
            ButtonType.GetAddress,
            ButtonType.GetAudio,
            ButtonType.GetDateTime,
            ButtonType.GetTime,
            ButtonType.GetItemFromSource,
            ButtonType.GetFile,
            ButtonType.GetLocation,
            ButtonType.FetchChatFlow,
            ButtonType.ShowConfirmation,
            ButtonType.NextNode,
        ], x.ButtonType); });
        var textInputs = __WEBPACK_IMPORTED_MODULE_0_underscore__["filter"](chatNode.Buttons, function (x) { return __WEBPACK_IMPORTED_MODULE_0_underscore__["contains"]([
            ButtonType.GetText,
            ButtonType.GetEmail,
            ButtonType.GetPhoneNumber,
            ButtonType.GetNumber,
        ], x.ButtonType); });
        var mandatory = 1;
        if (textInputs && textInputs.length > 0 && clickInputs && clickInputs.length > 0)
            mandatory = 0;
        if (clickInputs && clickInputs.length > 0) {
            if (__WEBPACK_IMPORTED_MODULE_0_underscore__["filter"](clickInputs, function (x) { return __WEBPACK_IMPORTED_MODULE_0_underscore__["contains"]([ButtonType.NextNode, ButtonType.OpenUrl], x.ButtonType); }).length > 0) {
                //Build options input and send
                var optionsInput = {
                    inputType: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].OPTIONS,
                    mandatory: mandatory,
                    options: __WEBPACK_IMPORTED_MODULE_0_underscore__["map"](__WEBPACK_IMPORTED_MODULE_0_underscore__["filter"](clickInputs, function (x) { return __WEBPACK_IMPORTED_MODULE_0_underscore__["contains"]([ButtonType.NextNode, ButtonType.OpenUrl], x.ButtonType); }), function (y) {
                        return {
                            title: y.ButtonName || y.ButtonText,
                            value: (y.ButtonType == ButtonType.OpenUrl ? JSON.stringify({ url: y.Url, value: y._id }) : y._id),
                            type: _this.convertButtonType(y.ButtonType)
                        };
                    })
                };
                return callback({
                    content: optionsInput,
                    type: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["i" /* MessageType */].INPUT
                });
            }
            var inputButton_1 = __WEBPACK_IMPORTED_MODULE_0_underscore__["first"](clickInputs);
            switch (inputButton_1.ButtonType) {
                case ButtonType.GetDate:
                    return callback({
                        content: {
                            mandatory: mandatory,
                            inputType: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].DATE,
                        },
                        type: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["i" /* MessageType */].INPUT
                    });
                case ButtonType.GetTime:
                    return callback({
                        content: {
                            mandatory: mandatory,
                            inputType: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].TIME,
                        },
                        type: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["i" /* MessageType */].INPUT
                    });
                case ButtonType.GetVideo:
                    return callback({
                        content: {
                            mandatory: mandatory,
                            inputType: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].MEDIA,
                            mediaType: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["g" /* MediaType */].VIDEO
                        },
                        type: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["i" /* MessageType */].INPUT
                    });
                case ButtonType.GetImage:
                    return callback({
                        content: {
                            mandatory: mandatory,
                            inputType: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].MEDIA,
                            mediaType: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["g" /* MediaType */].IMAGE
                        },
                        type: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["i" /* MessageType */].INPUT
                    });
                case ButtonType.GetAddress:
                    return callback({
                        content: {
                            mandatory: mandatory,
                            inputType: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].ADDRESS,
                            requiredFields: [
                                "area",
                                "country",
                                "pin",
                                "city",
                                "state",
                                "line1"
                            ]
                        },
                        type: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["i" /* MessageType */].INPUT
                    });
                case ButtonType.GetAudio:
                    return callback({
                        content: {
                            mandatory: mandatory,
                            inputType: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].MEDIA,
                            mediaType: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["g" /* MediaType */].AUDIO
                        },
                        type: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["i" /* MessageType */].INPUT
                    });
                case ButtonType.GetItemFromSource:
                    {
                        if (inputButton_1.ItemsSource) {
                            var msg_1 = {
                                inputType: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].LIST,
                                multiple: inputButton_1.AllowMultiple,
                                mandatory: mandatory,
                                values: []
                            };
                            var itemSrc = inputButton_1.ItemsSource.split(',').map(function (x) {
                                var y = x.trim().split(':');
                                return { K: y[0], V: y[1] };
                            });
                            itemSrc.forEach(function (x) { return msg_1.values.push({
                                text: x.K,
                                value: x.V,
                            }); });
                            return callback({
                                content: msg_1,
                                type: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["i" /* MessageType */].INPUT
                            });
                        }
                        if (inputButton_1.Url) {
                            this.http.get(inputButton_1.Url).subscribe(function (x) {
                                // let items = x.json() as {
                                //     [key: string]: string;
                                // };
                                var items = x.json();
                                var itemKeys = Object.keys(items);
                                var msg = {
                                    inputType: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].LIST,
                                    multiple: inputButton_1.AllowMultiple,
                                    mandatory: mandatory,
                                    values: itemKeys.map(function (key) {
                                        return {
                                            text: key,
                                            value: items[key]
                                        };
                                    })
                                };
                                return callback({
                                    content: msg,
                                    type: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["i" /* MessageType */].INPUT
                                });
                            });
                            return;
                        }
                    }
                case ButtonType.GetFile:
                    return callback({
                        content: {
                            mandatory: mandatory,
                            inputType: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].MEDIA,
                            mediaType: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["g" /* MediaType */].FILE
                        },
                        type: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["i" /* MessageType */].INPUT
                    });
                case ButtonType.GetLocation:
                    return callback({
                        content: {
                            mandatory: mandatory,
                            inputType: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].LOCATION,
                        },
                        type: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["i" /* MessageType */].INPUT
                    });
                default:
                    break;
            }
        }
        if (textInputs && textInputs.length > 0) {
            var textInput = textInputs[0];
            var inputMsg = {
                inputType: this.convertButtonTypeToInputType(textInput.ButtonType),
                mandatory: mandatory,
                textInputAttr: {
                    defaultText: textInput.DefaultText,
                    maxLength: textInput.MaxLength,
                    minLength: textInput.MinLength,
                    multiLine: textInput.IsMultiLine ? 1 : 0,
                    placeHolder: textInput.PlaceholderText
                }
            };
            return callback({
                content: inputMsg,
                type: __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["i" /* MessageType */].INPUT
            });
        }
    };
    SimulatorFromStudio.prototype.convertButtonTypeToInputType = function (srcType) {
        switch (srcType) {
            default:
            case ButtonType.GetText:
                return __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].TEXT;
            case ButtonType.GetEmail:
                return __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].EMAIL;
            case ButtonType.GetNumber:
                return __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].NUMERIC;
            case ButtonType.GetPhoneNumber:
                return __WEBPACK_IMPORTED_MODULE_5__models_ana_chat_models__["f" /* InputType */].PHONE;
        }
    };
    SimulatorFromStudio.prototype.convertCarouselButtonType = function (srcType) {
        switch (srcType) {
            case CarouselButtonType.DeepLink:
            case CarouselButtonType.OpenUrl:
                return ButtonType.URL;
            case CarouselButtonType.NextNode:
            default:
                return ButtonType.ACTION;
        }
    };
    SimulatorFromStudio.prototype.convertButtonType = function (srcType) {
        switch (srcType) {
            case ButtonType.DeepLink:
            case ButtonType.OpenUrl:
                return ButtonType.URL;
            case ButtonType.NextNode:
            default:
                return ButtonType.ACTION;
        }
    };
    SimulatorFromStudio.prototype.processConditionNode = function (chatNode) {
        var done = false;
        try {
            if (chatNode.Buttons) {
                for (var btnIdx = 0; btnIdx < chatNode.Buttons.length; btnIdx++) {
                    var btn = chatNode.Buttons[btnIdx];
                    var rootToken = btn.ConditionMatchKey.split(/\.|\[/)[0];
                    var wrappedResp = {};
                    wrappedResp[rootToken] = JSON.parse(this.state.variables[rootToken]);
                    var deepValue = __WEBPACK_IMPORTED_MODULE_1_jsonpath__["query"](wrappedResp, btn.ConditionMatchKey);
                    if (deepValue && typeof deepValue == 'object' && deepValue.length == 1) {
                        deepValue = deepValue[0];
                    }
                    if (this.match(deepValue, btn.ConditionOperator, btn.ConditionMatchValue)) {
                        this.saveVariable(btn.VariableValue);
                        this.gotoNextNode(btn.NextNodeId);
                        done = true;
                        break;
                    }
                }
            }
        }
        catch (e) {
            if (chatNode.Buttons) {
                for (var btnIdx = 0; btnIdx < chatNode.Buttons.length; btnIdx++) {
                    var btn = chatNode.Buttons[btnIdx];
                    var leftOperand = this.state.variables[btn.ConditionMatchKey];
                    if (this.match(leftOperand, btn.ConditionOperator, btn.ConditionMatchValue)) {
                        this.saveVariable(btn.VariableValue);
                        this.gotoNextNode(btn.NextNodeId);
                        done = true;
                        break;
                    }
                }
            }
        }
        if (!done)
            this.gotoNextNode(chatNode.NextNodeId); //Fallback node id
    };
    SimulatorFromStudio.prototype.match = function (left, op, right) {
        try {
            switch (op) {
                case ConditionOperator.Between:
                    {
                        var r1 = right.split(',')[0];
                        var r2 = right.split(',')[1];
                        return (r1 < left && left < r2);
                    }
                case ConditionOperator.NotEqualTo:
                    return left != right;
                case ConditionOperator.GreaterThan:
                    return left > right;
                case ConditionOperator.LessThan:
                    return left < right;
                case ConditionOperator.GreaterThanOrEqualTo:
                    return left >= right;
                case ConditionOperator.LessThanOrEqualTo:
                    return left <= right;
                case ConditionOperator.In:
                    return right.split(',').indexOf(left) != -1;
                case ConditionOperator.NotIn:
                    return right.split(',').indexOf(left) == -1;
                case ConditionOperator.StartsWith:
                    return left.startsWith(right);
                case ConditionOperator.EndsWith:
                    return left.endsWith(right);
                case ConditionOperator.Contains:
                    return left.indexOf(right) != -1;
                case ConditionOperator.IsNull:
                    return (left == null || left == undefined);
                case ConditionOperator.EqualTo:
                default:
                    return left == right;
            }
        }
        catch (e) {
            console.log('Invalid operation or operands');
            //this.infoDialog.alert('Invalid operation or operands', e);
        }
    };
    SimulatorFromStudio = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_3__angular_core__["C" /* Injectable */])(),
        __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_4__utilities_service__["b" /* UtilitiesService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_4__utilities_service__["b" /* UtilitiesService */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_2__angular_http__["b" /* Http */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_2__angular_http__["b" /* Http */]) === "function" && _b || Object])
    ], SimulatorFromStudio);
    return SimulatorFromStudio;
    var _a, _b;
}());

var SimulatorMessageType;
(function (SimulatorMessageType) {
    SimulatorMessageType["AnaChatMessage"] = "AnaChatMessage";
    SimulatorMessageType["AnaChatReset"] = "AnaChatReset";
})(SimulatorMessageType || (SimulatorMessageType = {}));
//# sourceMappingURL=plugin.service.js.map

/***/ }),

/***/ "../../../../../src/app/services/resolver.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SampleService; });
/* unused harmony export SimulatorMessageType */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__models_ana_chat_models__ = __webpack_require__("../../../../../src/app/models/ana-chat.models.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var SampleService = (function () {
    function SampleService() {
        this.debug = true;
    }
    SampleService.onMessage = function (event) {
        //this.logDebug('On message received from studio:');
        //this.logDebug(event.data);
        //console.log("events" + JSON.stringify(event))
        var msg = event;
        if (msg.type == SimulatorMessageType.AnaChatMessage) {
            var cfMsg = msg;
            // console.log("cfMsg" + cfMsg)
            //console.log("handle message received" + this.handleMessageReceived)
            if (this.handleMessageReceived) {
                this.handleMessageReceived(new __WEBPACK_IMPORTED_MODULE_1__models_ana_chat_models__["a" /* ANAChatMessage */](cfMsg.data));
            }
        }
        else if (msg.type == SimulatorMessageType.AnaChatReset) {
            if (this.handleResetSignal)
                this.handleResetSignal();
        }
    };
    SampleService = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["C" /* Injectable */])(),
        __metadata("design:paramtypes", [])
    ], SampleService);
    return SampleService;
}());

var SimulatorMessageType;
(function (SimulatorMessageType) {
    SimulatorMessageType["AnaChatMessage"] = "AnaChatMessage";
    SimulatorMessageType["AnaChatReset"] = "AnaChatReset";
})(SimulatorMessageType || (SimulatorMessageType = {}));
//# sourceMappingURL=resolver.service.js.map

/***/ }),

/***/ "../../../../../src/app/services/simulator.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return SimulatorService; });
/* unused harmony export SimulatorMessageType */
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__models_ana_chat_models__ = __webpack_require__("../../../../../src/app/models/ana-chat.models.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_vm_models__ = __webpack_require__("../../../../../src/app/models/ana-chat-vm.models.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__plugin_service__ = __webpack_require__("../../../../../src/app/services/plugin.service.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__angular_http__ = __webpack_require__("../../../http/@angular/http.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__services_utilities_service__ = __webpack_require__("../../../../../src/app/services/utilities.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var SimulatorService = (function () {
    function SimulatorService(http, utils, simulator) {
        this.http = http;
        this.utils = utils;
        this.simulator = simulator;
        this.debug = true;
        // window.onmessage = (event) => {
        // 	this.logDebug('On message received from studio:');
        // 	this.logDebug(event.data);
        // 	let msg = event.data as SimulatorMessage;
        // 	if (msg.type == SimulatorMessageType.AnaChatMessage) {
        // 		let cfMsg = (msg as AnaChatSimulatorMessage);
        // 		if (this.handleMessageReceived)
        // 			this.handleMessageReceived(new models.ANAChatMessage(cfMsg.data));
        // 	} else if (msg.type == SimulatorMessageType.AnaChatReset) {
        // 		if (this.handleResetSignal)
        // 			this.handleResetSignal();
        // 	}
        // }
    }
    SimulatorService.prototype.onMessage = function (event) {
        this.logDebug('On message received from studio:');
        this.logDebug(event.data);
        var msg = event.data;
        if (msg.type == SimulatorMessageType.AnaChatMessage) {
            var cfMsg = msg;
            if (this.handleMessageReceived)
                this.handleMessageReceived(new __WEBPACK_IMPORTED_MODULE_1__models_ana_chat_models__["a" /* ANAChatMessage */](cfMsg.data));
        }
        else if (msg.type == SimulatorMessageType.AnaChatReset) {
            if (this.handleResetSignal)
                this.handleResetSignal();
        }
    };
    SimulatorService.prototype.logDebug = function (msg) {
        if (this.debug)
            console.log(msg);
    };
    SimulatorService.prototype.sendMessage = function (message, threadMsgRef) {
        // window.parent.postMessage({
        // 	data: message,
        // 	type: SimulatorMessageType.AnaChatMessage
        // }, "*");
        this.simulator.onMessage({
            data: message,
            type: SimulatorMessageType.AnaChatMessage
        });
        if (threadMsgRef)
            threadMsgRef.status = __WEBPACK_IMPORTED_MODULE_2__models_ana_chat_vm_models__["f" /* MessageStatus */].ReceivedAtServer;
    };
    SimulatorService = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["C" /* Injectable */])(),
        __metadata("design:paramtypes", [typeof (_a = typeof __WEBPACK_IMPORTED_MODULE_4__angular_http__["b" /* Http */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_4__angular_http__["b" /* Http */]) === "function" && _a || Object, typeof (_b = typeof __WEBPACK_IMPORTED_MODULE_5__services_utilities_service__["b" /* UtilitiesService */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_5__services_utilities_service__["b" /* UtilitiesService */]) === "function" && _b || Object, typeof (_c = typeof __WEBPACK_IMPORTED_MODULE_3__plugin_service__["a" /* SimulatorFromStudio */] !== "undefined" && __WEBPACK_IMPORTED_MODULE_3__plugin_service__["a" /* SimulatorFromStudio */]) === "function" && _c || Object])
    ], SimulatorService);
    return SimulatorService;
    var _a, _b, _c;
}());

var SimulatorMessageType;
(function (SimulatorMessageType) {
    SimulatorMessageType["AnaChatMessage"] = "AnaChatMessage";
    SimulatorMessageType["AnaChatReset"] = "AnaChatReset";
})(SimulatorMessageType || (SimulatorMessageType = {}));
//# sourceMappingURL=simulator.service.js.map

/***/ }),

/***/ "../../../../../src/app/services/stomp.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return StompService; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return StompConnectionStatus; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_sockjs_client__ = __webpack_require__("../../../../sockjs-client/lib/entry.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1_sockjs_client___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_1_sockjs_client__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_stompjs__ = __webpack_require__("../../../../stompjs/index.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2_stompjs___default = __webpack_require__.n(__WEBPACK_IMPORTED_MODULE_2_stompjs__);
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__ = __webpack_require__("../../../../../src/app/models/ana-chat-vm.models.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_4__models_ana_chat_models__ = __webpack_require__("../../../../../src/app/models/ana-chat.models.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_5__services_utilities_service__ = __webpack_require__("../../../../../src/app/services/utilities.service.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};






var StompService = (function () {
    function StompService() {
        var _this = this;
        this.stompHeaders = {};
        this.consecutiveErrorsCount = 0;
        this.debug = function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (console && console.log && console.log.apply && _this.config && _this.config.debug)
                console.log.apply(console, args);
        };
        //Should be an arrow function to follow class context
        this.onConnect = function (frame) {
            _this.clearTimer();
            _this.consecutiveErrorsCount = 0;
            if (_this.connectionStatus == StompConnectionStatus.Connected)
                return;
            try {
                _this.subscribe();
                _this.connectionStatus = StompConnectionStatus.Connected;
                if (_this.handleConnect)
                    _this.handleConnect();
            }
            catch (e) {
                _this.debug(e);
                _this.connectionStatus = StompConnectionStatus.Disconnected;
            }
        };
        this.subscribe = function () {
            _this.stompHeaders['user_id'] = _this.config.customerId;
            var custId = _this.stompHeaders['user_id'];
            _this.stompHeaders['id'] = __WEBPACK_IMPORTED_MODULE_5__services_utilities_service__["b" /* UtilitiesService */].uuidv4();
            _this.client.subscribe('/topic/presence', function (message) {
                _this.client.send("/app/presence", _this.stompHeaders, JSON.stringify({ user_id: custId }));
            }, _this.stompHeaders);
            //Header: Id should be different for different subscription
            _this.stompHeaders['id'] = __WEBPACK_IMPORTED_MODULE_5__services_utilities_service__["b" /* UtilitiesService */].uuidv4();
            var channel = (_this.config.flowId ? '/topic/chat/customer/' + custId + "/business/" + _this.config.businessId + "/flow/" + _this.config.flowId : '/topic/chat/customer/' + custId + "/business/" + _this.config.businessId);
            _this.client.subscribe(channel, function (message) {
                _this.onMessage(JSON.parse(message.body));
            }, _this.stompHeaders);
            _this.stompHeaders['id'] = __WEBPACK_IMPORTED_MODULE_5__services_utilities_service__["b" /* UtilitiesService */].uuidv4();
            _this.client.subscribe('/queue/events/user/' + custId, function (message) {
                var msg = new __WEBPACK_IMPORTED_MODULE_4__models_ana_chat_models__["a" /* ANAChatMessage */](JSON.parse(message.body));
                if (msg.events) {
                    for (var i = 0; i < msg.events.length; i++) {
                        var event = msg.events[i];
                        if (event.type == __WEBPACK_IMPORTED_MODULE_4__models_ana_chat_models__["d" /* EventType */].ACK) {
                            _this.onAck(message.headers['tid']);
                        }
                        else if (event.type == __WEBPACK_IMPORTED_MODULE_4__models_ana_chat_models__["d" /* EventType */].TYPING) {
                            _this.onTyping();
                        }
                    }
                }
            }, _this.stompHeaders);
        };
        this.onError = function (error) {
            _this.connectionStatus = StompConnectionStatus.Disconnected;
            if (_this.consecutiveErrorsCount <= __WEBPACK_IMPORTED_MODULE_5__services_utilities_service__["a" /* Config */].consecutiveErrorsThreshold) {
                _this.consecutiveErrorsCount++;
                console.log(_this.consecutiveErrorsCount);
                if (_this.consecutiveErrorsCount == __WEBPACK_IMPORTED_MODULE_5__services_utilities_service__["a" /* Config */].consecutiveErrorsThreshold)
                    if (_this.handleConsecutiveErrorsState)
                        _this.handleConsecutiveErrorsState();
            }
            if (typeof error === 'object')
                error = error.body;
            if (_this.config && _this.config.debug)
                _this.debug('Socket Error: ' + JSON.stringify(error));
            _this.debug("Error: " + error);
            if (error.indexOf('Lost connection') !== -1)
                _this.delayReconnect(5000);
        };
        this.onAck = function (msgAckId, delivered) {
            _this.debug("" + (delivered ? "DeliveredAck:" : "SentAck:") + msgAckId);
            if (_this.handleAck)
                _this.handleAck(msgAckId, delivered);
        };
        this.onTyping = function () {
            _this.debug("Typing... ");
            if (_this.handleTyping)
                _this.handleTyping();
        };
        this.msgsIds = [];
        this.onMessage = function (messageBody) {
            var anaMsg = new __WEBPACK_IMPORTED_MODULE_4__models_ana_chat_models__["a" /* ANAChatMessage */](messageBody);
            if (!anaMsg.data || Object.keys(anaMsg.data).length <= 0) {
                _this.sendMessageReceivedAck(anaMsg.meta);
            }
            if (anaMsg.events && anaMsg.events.length > 0) {
                for (var i = 0; i < anaMsg.events.length; i++) {
                    var event = anaMsg.events[i];
                    if (event.type == __WEBPACK_IMPORTED_MODULE_4__models_ana_chat_models__["d" /* EventType */].ACK) {
                        _this.onAck(anaMsg.meta.id, true);
                    }
                    else if (event.type == __WEBPACK_IMPORTED_MODULE_4__models_ana_chat_models__["d" /* EventType */].TYPING) {
                        _this.onTyping();
                    }
                }
            }
            if (_this.handleMessageReceived) {
                if (_this.msgsIds.indexOf(anaMsg.meta.id) == -1) {
                    _this.msgsIds.push(anaMsg.meta.id);
                    _this.handleMessageReceived(anaMsg);
                }
            }
        };
        this.typingBusy = false;
    }
    StompService.prototype.connect = function (config) {
        this.clearTimer();
        this.configure(config);
        if (!this.client)
            throw Error('Client not configured!');
        this.debug('Connecting...');
        this.connectionStatus = StompConnectionStatus.Connecting;
        var headers = { user_id: this.config.customerId };
        this.client.connect(headers, this.onConnect, this.onError);
    };
    StompService.prototype.clearTimer = function () {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    };
    StompService.prototype.disconnect = function () {
        var _this = this;
        this.clearTimer();
        if (this.client && this.client.connected) {
            this.client.disconnect(function () { return _this.debug("WebSocket Disconnected"); });
        }
    };
    StompService.prototype.configure = function (config) {
        if (config === null && this.config === null)
            throw Error('No configuration provided!');
        if (config != null)
            this.config = config;
        this.sockInstance = new __WEBPACK_IMPORTED_MODULE_1_sockjs_client__(this.config.endpoint);
        this.client = __WEBPACK_IMPORTED_MODULE_2_stompjs__["over"](this.sockInstance);
        this.connectionStatus = StompConnectionStatus.Disconnected;
        this.client.debug = (this.config.debug || this.config.debug == null ? this.debug : null);
    };
    StompService.prototype.delayReconnect = function (t) {
        var _this = this;
        this.debug("Reconnecting in " + t / 1000 + " second(s)...");
        this.timer = setTimeout(function () {
            _this.connect();
        }, t);
    };
    StompService.prototype.sendMessage = function (message, threadMsgRef) {
        var _this = this;
        var _sendMessage = function () {
            var msg = message.extract();
            _this.debug("Sent Socket Message: ");
            _this.debug(msg);
            var headers = _this.stompHeaders;
            headers['tid'] = threadMsgRef.messageAckId;
            _this.client.send("/app/message", headers, JSON.stringify(msg));
            threadMsgRef.status = __WEBPACK_IMPORTED_MODULE_3__models_ana_chat_vm_models__["f" /* MessageStatus */].SentToServer;
            threadMsgRef.startTimeoutTimer();
        };
        threadMsgRef.retrySending = _sendMessage; //Saving the context to be used for retrying in case of failure
        _sendMessage();
    };
    StompService.prototype.sendTypingMessage = function (meta) {
        var _this = this;
        if (this.typingBusy) {
            return;
        }
        this.typingBusy = true;
        setTimeout(function () { return _this.typingBusy = false; }, 1000);
        var msg = new __WEBPACK_IMPORTED_MODULE_4__models_ana_chat_models__["a" /* ANAChatMessage */]({
            meta: __WEBPACK_IMPORTED_MODULE_5__services_utilities_service__["b" /* UtilitiesService */].getReplyMeta(meta),
            events: [{
                    type: __WEBPACK_IMPORTED_MODULE_4__models_ana_chat_models__["d" /* EventType */].TYPING
                }]
        });
        var headers = this.stompHeaders;
        this.client.send("/app/message", headers, JSON.stringify(msg.extract()));
    };
    StompService.prototype.sendMessageReceivedAck = function (meta) {
        var msg = new __WEBPACK_IMPORTED_MODULE_4__models_ana_chat_models__["a" /* ANAChatMessage */]({
            meta: __WEBPACK_IMPORTED_MODULE_5__services_utilities_service__["b" /* UtilitiesService */].getReplyMeta(meta, true),
            events: [{
                    type: __WEBPACK_IMPORTED_MODULE_4__models_ana_chat_models__["d" /* EventType */].ACK
                }]
        });
        var headers = this.stompHeaders;
        this.client.send("/app/message", headers, JSON.stringify(msg.extract()));
    };
    StompService = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["C" /* Injectable */])(),
        __metadata("design:paramtypes", [])
    ], StompService);
    return StompService;
}());

var StompConnectionStatus;
(function (StompConnectionStatus) {
    StompConnectionStatus[StompConnectionStatus["None"] = 0] = "None";
    StompConnectionStatus[StompConnectionStatus["Connected"] = 1] = "Connected";
    StompConnectionStatus[StompConnectionStatus["Disconnected"] = 2] = "Disconnected";
    StompConnectionStatus[StompConnectionStatus["Connecting"] = 3] = "Connecting";
})(StompConnectionStatus || (StompConnectionStatus = {}));
//# sourceMappingURL=stomp.service.js.map

/***/ }),

/***/ "../../../../../src/app/services/utilities.service.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "b", function() { return UtilitiesService; });
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return Config; });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__models_ana_chat_models__ = __webpack_require__("../../../../../src/app/models/ana-chat.models.ts");
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};


var UtilitiesService = (function () {
    function UtilitiesService() {
    }
    UtilitiesService_1 = UtilitiesService;
    UtilitiesService.uuidv4 = function () {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).toString().replace(/[018]/g, function (c) { return (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16); });
    };
    UtilitiesService.anaDateDisplay = function (anaDate) {
        return parseInt(anaDate.mday) + "-" + parseInt(anaDate.month) + "-" + parseInt(anaDate.year);
    };
    UtilitiesService.anaDateToDate = function (anaDate) {
        return new Date(parseInt(anaDate.year), parseInt(anaDate.month) - 1, parseInt(anaDate.mday));
    };
    UtilitiesService.anaTimeToDate = function (anaTime) {
        var d = new Date();
        d.setHours(parseInt(anaTime.hour), parseInt(anaTime.minute), parseInt(anaTime.second));
        return d;
    };
    UtilitiesService.anaLocationDisplay = function (anaLoc) {
        return anaLoc.lat + "," + anaLoc.lng;
    };
    UtilitiesService.anaTimeDisplay = function (anaTime) {
        var hr = parseInt(anaTime.hour);
        var min = parseInt(anaTime.minute);
        var hours = hr > 12 ? hr - 12 : hr;
        var am_pm = hr >= 12 ? "PM" : "AM";
        hours = hours < 10 ? "0" + hours : hours;
        var minutes = min < 10 ? "0" + min : min;
        return hours + ":" + minutes + " " + am_pm;
    };
    UtilitiesService.getReplyMeta = function (srcMeta, copyId) {
        var replyMeta = {
            id: copyId ? srcMeta.id : this.uuidv4(),
            recipient: srcMeta.sender,
            responseTo: srcMeta.id,
            sender: srcMeta.recipient,
            senderType: __WEBPACK_IMPORTED_MODULE_1__models_ana_chat_models__["j" /* SenderType */].USER,
            sessionId: srcMeta.sessionId,
            flowId: srcMeta.flowId,
            previousFlowId: srcMeta.previousFlowId,
            currentFlowId: srcMeta.currentFlowId,
            timestamp: new Date().getTime()
        };
        return replyMeta;
    };
    UtilitiesService.googleMapsStaticLink = function (latLng) {
        return "https://maps.googleapis.com/maps/api/staticmap?center=" + latLng.lat + "," + latLng.lng + "&zoom=13&size=300x150&maptype=roadmap&markers=color:red|label:A|" + latLng.lat + "," + latLng.lng + "&key=" + UtilitiesService_1.googleMapsConfigRef.apiKey;
    };
    UtilitiesService.getAnaMediaTypeFromMIMEType = function (mimeType) {
        var assetType;
        if (mimeType.startsWith('image'))
            assetType = __WEBPACK_IMPORTED_MODULE_1__models_ana_chat_models__["g" /* MediaType */].IMAGE;
        else if (mimeType.startsWith('video'))
            assetType = __WEBPACK_IMPORTED_MODULE_1__models_ana_chat_models__["g" /* MediaType */].VIDEO;
        else if (mimeType.startsWith('audio'))
            assetType = __WEBPACK_IMPORTED_MODULE_1__models_ana_chat_models__["g" /* MediaType */].AUDIO;
        else
            assetType = __WEBPACK_IMPORTED_MODULE_1__models_ana_chat_models__["g" /* MediaType */].FILE;
        return assetType;
    };
    UtilitiesService.anaAddressDisplay = function (anaAddress) {
        return [anaAddress.line1, anaAddress.area, anaAddress.city, anaAddress.state, anaAddress.country, anaAddress.pin].filter(function (x) { return x; }).join(", ");
    };
    UtilitiesService.pad = function (number, width, z) {
        if (z === void 0) { z = '0'; }
        var n = number + '';
        return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
    };
    UtilitiesService.googleMapsConfigRef = { apiKey: '' };
    UtilitiesService = UtilitiesService_1 = __decorate([
        Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["C" /* Injectable */])(),
        __metadata("design:paramtypes", [])
    ], UtilitiesService);
    return UtilitiesService;
    var UtilitiesService_1;
}());

var Config = (function () {
    function Config() {
    }
    Config.emailRegex = /^[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,4}$/;
    Config.phoneRegex = /^\+?\d{6,15}$/;
    Config.numberRegex = /^[0-9]*\.?[0-9]+$/;
    Config.consecutiveErrorsThreshold = 5;
    Config.consecutiveErrorsMessageText = "Uh oh, seems like you've lost your internet connection";
    Config.consecutiveErrorsMessageAckId = "CONSECUTIVE_ERRORS_MESSAGE";
    Config.simulatorBusinessId = 'ana-studio';
    Config.simulatorCustomerId = 'ana-simulator';
    return Config;
}());

//# sourceMappingURL=utilities.service.js.map

/***/ }),

/***/ "../../../../../src/environments/environment.prod.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "a", function() { return environment; });
var environment = {
    production: true
};
//# sourceMappingURL=environment.prod.js.map

/***/ }),

/***/ "../../../../../src/main.ts":
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
Object.defineProperty(__webpack_exports__, "__esModule", { value: true });
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_0__angular_core__ = __webpack_require__("../../../core/@angular/core.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__ = __webpack_require__("../../../platform-browser-dynamic/@angular/platform-browser-dynamic.es5.js");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_2__app_app_module__ = __webpack_require__("../../../../../src/app/app.module.ts");
/* harmony import */ var __WEBPACK_IMPORTED_MODULE_3__environments_environment_prod__ = __webpack_require__("../../../../../src/environments/environment.prod.ts");




if (__WEBPACK_IMPORTED_MODULE_3__environments_environment_prod__["a" /* environment */].production) {
    Object(__WEBPACK_IMPORTED_MODULE_0__angular_core__["_24" /* enableProdMode */])();
}
Object(__WEBPACK_IMPORTED_MODULE_1__angular_platform_browser_dynamic__["a" /* platformBrowserDynamic */])().bootstrapModule(__WEBPACK_IMPORTED_MODULE_2__app_app_module__["a" /* AppModule */]);
//# sourceMappingURL=main.js.map

/***/ }),

/***/ 0:
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__("../../../../../src/main.ts");


/***/ })

},[0]);
//# sourceMappingURL=main.bundle.js.map