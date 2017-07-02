!function(e){if("object"==typeof exports&&"undefined"!=typeof module)module.exports=e();else if("function"==typeof define&&define.amd)define([],e);else{var f;"undefined"!=typeof window?f=window:"undefined"!=typeof global?f=global:"undefined"!=typeof self&&(f=self),f.ReactTypeahead=e()}}(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*!
  Copyright (c) 2015 Jed Watson.
  Licensed under the MIT License (MIT), see
  http://jedwatson.github.io/classnames
*/

function classNames() {
	var classes = '';
	var arg;

	for (var i = 0; i < arguments.length; i++) {
		arg = arguments[i];
		if (!arg) {
			continue;
		}

		if ('string' === typeof arg || 'number' === typeof arg) {
			classes += ' ' + arg;
		} else if (Object.prototype.toString.call(arg) === '[object Array]') {
			classes += ' ' + classNames.apply(null, arg);
		} else if ('object' === typeof arg) {
			for (var key in arg) {
				if (!arg.hasOwnProperty(key) || !arg[key]) {
					continue;
				}
				classes += ' ' + key;
			}
		}
	}
	return classes.substr(1);
}

// safely export classNames for node / browserify
if (typeof module !== 'undefined' && module.exports) {
	module.exports = classNames;
}

// safely export classNames for RequireJS
if (typeof define !== 'undefined' && define.amd) {
	define('classnames', [], function() {
		return classNames;
	});
}

},{}],2:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

var _assign = require('object-assign');

var emptyObject = require('fbjs/lib/emptyObject');
var _invariant = require('fbjs/lib/invariant');

if (process.env.NODE_ENV !== 'production') {
  var warning = require('fbjs/lib/warning');
}

var MIXINS_KEY = 'mixins';

// Helper function to allow the creation of anonymous functions which do not
// have .name set to the name of the variable being assigned to.
function identity(fn) {
  return fn;
}

var ReactPropTypeLocationNames;
if (process.env.NODE_ENV !== 'production') {
  ReactPropTypeLocationNames = {
    prop: 'prop',
    context: 'context',
    childContext: 'child context',
  };
} else {
  ReactPropTypeLocationNames = {};
}

function factory(ReactComponent, isValidElement, ReactNoopUpdateQueue) {
  /**
   * Policies that describe methods in `ReactClassInterface`.
   */


  var injectedMixins = [];

  /**
   * Composite components are higher-level components that compose other composite
   * or host components.
   *
   * To create a new type of `ReactClass`, pass a specification of
   * your new class to `React.createClass`. The only requirement of your class
   * specification is that you implement a `render` method.
   *
   *   var MyComponent = React.createClass({
   *     render: function() {
   *       return <div>Hello World</div>;
   *     }
   *   });
   *
   * The class specification supports a specific protocol of methods that have
   * special meaning (e.g. `render`). See `ReactClassInterface` for
   * more the comprehensive protocol. Any other properties and methods in the
   * class specification will be available on the prototype.
   *
   * @interface ReactClassInterface
   * @internal
   */
  var ReactClassInterface = {

    /**
     * An array of Mixin objects to include when defining your component.
     *
     * @type {array}
     * @optional
     */
    mixins: 'DEFINE_MANY',

    /**
     * An object containing properties and methods that should be defined on
     * the component's constructor instead of its prototype (static methods).
     *
     * @type {object}
     * @optional
     */
    statics: 'DEFINE_MANY',

    /**
     * Definition of prop types for this component.
     *
     * @type {object}
     * @optional
     */
    propTypes: 'DEFINE_MANY',

    /**
     * Definition of context types for this component.
     *
     * @type {object}
     * @optional
     */
    contextTypes: 'DEFINE_MANY',

    /**
     * Definition of context types this component sets for its children.
     *
     * @type {object}
     * @optional
     */
    childContextTypes: 'DEFINE_MANY',

    // ==== Definition methods ====

    /**
     * Invoked when the component is mounted. Values in the mapping will be set on
     * `this.props` if that prop is not specified (i.e. using an `in` check).
     *
     * This method is invoked before `getInitialState` and therefore cannot rely
     * on `this.state` or use `this.setState`.
     *
     * @return {object}
     * @optional
     */
    getDefaultProps: 'DEFINE_MANY_MERGED',

    /**
     * Invoked once before the component is mounted. The return value will be used
     * as the initial value of `this.state`.
     *
     *   getInitialState: function() {
     *     return {
     *       isOn: false,
     *       fooBaz: new BazFoo()
     *     }
     *   }
     *
     * @return {object}
     * @optional
     */
    getInitialState: 'DEFINE_MANY_MERGED',

    /**
     * @return {object}
     * @optional
     */
    getChildContext: 'DEFINE_MANY_MERGED',

    /**
     * Uses props from `this.props` and state from `this.state` to render the
     * structure of the component.
     *
     * No guarantees are made about when or how often this method is invoked, so
     * it must not have side effects.
     *
     *   render: function() {
     *     var name = this.props.name;
     *     return <div>Hello, {name}!</div>;
     *   }
     *
     * @return {ReactComponent}
     * @nosideeffects
     * @required
     */
    render: 'DEFINE_ONCE',

    // ==== Delegate methods ====

    /**
     * Invoked when the component is initially created and about to be mounted.
     * This may have side effects, but any external subscriptions or data created
     * by this method must be cleaned up in `componentWillUnmount`.
     *
     * @optional
     */
    componentWillMount: 'DEFINE_MANY',

    /**
     * Invoked when the component has been mounted and has a DOM representation.
     * However, there is no guarantee that the DOM node is in the document.
     *
     * Use this as an opportunity to operate on the DOM when the component has
     * been mounted (initialized and rendered) for the first time.
     *
     * @param {DOMElement} rootNode DOM element representing the component.
     * @optional
     */
    componentDidMount: 'DEFINE_MANY',

    /**
     * Invoked before the component receives new props.
     *
     * Use this as an opportunity to react to a prop transition by updating the
     * state using `this.setState`. Current props are accessed via `this.props`.
     *
     *   componentWillReceiveProps: function(nextProps, nextContext) {
     *     this.setState({
     *       likesIncreasing: nextProps.likeCount > this.props.likeCount
     *     });
     *   }
     *
     * NOTE: There is no equivalent `componentWillReceiveState`. An incoming prop
     * transition may cause a state change, but the opposite is not true. If you
     * need it, you are probably looking for `componentWillUpdate`.
     *
     * @param {object} nextProps
     * @optional
     */
    componentWillReceiveProps: 'DEFINE_MANY',

    /**
     * Invoked while deciding if the component should be updated as a result of
     * receiving new props, state and/or context.
     *
     * Use this as an opportunity to `return false` when you're certain that the
     * transition to the new props/state/context will not require a component
     * update.
     *
     *   shouldComponentUpdate: function(nextProps, nextState, nextContext) {
     *     return !equal(nextProps, this.props) ||
     *       !equal(nextState, this.state) ||
     *       !equal(nextContext, this.context);
     *   }
     *
     * @param {object} nextProps
     * @param {?object} nextState
     * @param {?object} nextContext
     * @return {boolean} True if the component should update.
     * @optional
     */
    shouldComponentUpdate: 'DEFINE_ONCE',

    /**
     * Invoked when the component is about to update due to a transition from
     * `this.props`, `this.state` and `this.context` to `nextProps`, `nextState`
     * and `nextContext`.
     *
     * Use this as an opportunity to perform preparation before an update occurs.
     *
     * NOTE: You **cannot** use `this.setState()` in this method.
     *
     * @param {object} nextProps
     * @param {?object} nextState
     * @param {?object} nextContext
     * @param {ReactReconcileTransaction} transaction
     * @optional
     */
    componentWillUpdate: 'DEFINE_MANY',

    /**
     * Invoked when the component's DOM representation has been updated.
     *
     * Use this as an opportunity to operate on the DOM when the component has
     * been updated.
     *
     * @param {object} prevProps
     * @param {?object} prevState
     * @param {?object} prevContext
     * @param {DOMElement} rootNode DOM element representing the component.
     * @optional
     */
    componentDidUpdate: 'DEFINE_MANY',

    /**
     * Invoked when the component is about to be removed from its parent and have
     * its DOM representation destroyed.
     *
     * Use this as an opportunity to deallocate any external resources.
     *
     * NOTE: There is no `componentDidUnmount` since your component will have been
     * destroyed by that point.
     *
     * @optional
     */
    componentWillUnmount: 'DEFINE_MANY',

    // ==== Advanced methods ====

    /**
     * Updates the component's currently mounted DOM representation.
     *
     * By default, this implements React's rendering and reconciliation algorithm.
     * Sophisticated clients may wish to override this.
     *
     * @param {ReactReconcileTransaction} transaction
     * @internal
     * @overridable
     */
    updateComponent: 'OVERRIDE_BASE'

  };

  /**
   * Mapping from class specification keys to special processing functions.
   *
   * Although these are declared like instance properties in the specification
   * when defining classes using `React.createClass`, they are actually static
   * and are accessible on the constructor instead of the prototype. Despite
   * being static, they must be defined outside of the "statics" key under
   * which all other static methods are defined.
   */
  var RESERVED_SPEC_KEYS = {
    displayName: function (Constructor, displayName) {
      Constructor.displayName = displayName;
    },
    mixins: function (Constructor, mixins) {
      if (mixins) {
        for (var i = 0; i < mixins.length; i++) {
          mixSpecIntoComponent(Constructor, mixins[i]);
        }
      }
    },
    childContextTypes: function (Constructor, childContextTypes) {
      if (process.env.NODE_ENV !== 'production') {
        validateTypeDef(Constructor, childContextTypes, 'childContext');
      }
      Constructor.childContextTypes = _assign({}, Constructor.childContextTypes, childContextTypes);
    },
    contextTypes: function (Constructor, contextTypes) {
      if (process.env.NODE_ENV !== 'production') {
        validateTypeDef(Constructor, contextTypes, 'context');
      }
      Constructor.contextTypes = _assign({}, Constructor.contextTypes, contextTypes);
    },
    /**
     * Special case getDefaultProps which should move into statics but requires
     * automatic merging.
     */
    getDefaultProps: function (Constructor, getDefaultProps) {
      if (Constructor.getDefaultProps) {
        Constructor.getDefaultProps = createMergedResultFunction(Constructor.getDefaultProps, getDefaultProps);
      } else {
        Constructor.getDefaultProps = getDefaultProps;
      }
    },
    propTypes: function (Constructor, propTypes) {
      if (process.env.NODE_ENV !== 'production') {
        validateTypeDef(Constructor, propTypes, 'prop');
      }
      Constructor.propTypes = _assign({}, Constructor.propTypes, propTypes);
    },
    statics: function (Constructor, statics) {
      mixStaticSpecIntoComponent(Constructor, statics);
    },
    autobind: function () {} };

  function validateTypeDef(Constructor, typeDef, location) {
    for (var propName in typeDef) {
      if (typeDef.hasOwnProperty(propName)) {
        // use a warning instead of an _invariant so components
        // don't show up in prod but only in __DEV__
        process.env.NODE_ENV !== 'production' ? warning(typeof typeDef[propName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'React.PropTypes.', Constructor.displayName || 'ReactClass', ReactPropTypeLocationNames[location], propName) : void 0;
      }
    }
  }

  function validateMethodOverride(isAlreadyDefined, name) {
    var specPolicy = ReactClassInterface.hasOwnProperty(name) ? ReactClassInterface[name] : null;

    // Disallow overriding of base class methods unless explicitly allowed.
    if (ReactClassMixin.hasOwnProperty(name)) {
      _invariant(specPolicy === 'OVERRIDE_BASE', 'ReactClassInterface: You are attempting to override ' + '`%s` from your class specification. Ensure that your method names ' + 'do not overlap with React methods.', name);
    }

    // Disallow defining methods more than once unless explicitly allowed.
    if (isAlreadyDefined) {
      _invariant(specPolicy === 'DEFINE_MANY' || specPolicy === 'DEFINE_MANY_MERGED', 'ReactClassInterface: You are attempting to define ' + '`%s` on your component more than once. This conflict may be due ' + 'to a mixin.', name);
    }
  }

  /**
   * Mixin helper which handles policy validation and reserved
   * specification keys when building React classes.
   */
  function mixSpecIntoComponent(Constructor, spec) {
    if (!spec) {
      if (process.env.NODE_ENV !== 'production') {
        var typeofSpec = typeof spec;
        var isMixinValid = typeofSpec === 'object' && spec !== null;

        process.env.NODE_ENV !== 'production' ? warning(isMixinValid, '%s: You\'re attempting to include a mixin that is either null ' + 'or not an object. Check the mixins included by the component, ' + 'as well as any mixins they include themselves. ' + 'Expected object but got %s.', Constructor.displayName || 'ReactClass', spec === null ? null : typeofSpec) : void 0;
      }

      return;
    }

    _invariant(typeof spec !== 'function', 'ReactClass: You\'re attempting to ' + 'use a component class or function as a mixin. Instead, just use a ' + 'regular object.');
    _invariant(!isValidElement(spec), 'ReactClass: You\'re attempting to ' + 'use a component as a mixin. Instead, just use a regular object.');

    var proto = Constructor.prototype;
    var autoBindPairs = proto.__reactAutoBindPairs;

    // By handling mixins before any other properties, we ensure the same
    // chaining order is applied to methods with DEFINE_MANY policy, whether
    // mixins are listed before or after these methods in the spec.
    if (spec.hasOwnProperty(MIXINS_KEY)) {
      RESERVED_SPEC_KEYS.mixins(Constructor, spec.mixins);
    }

    for (var name in spec) {
      if (!spec.hasOwnProperty(name)) {
        continue;
      }

      if (name === MIXINS_KEY) {
        // We have already handled mixins in a special case above.
        continue;
      }

      var property = spec[name];
      var isAlreadyDefined = proto.hasOwnProperty(name);
      validateMethodOverride(isAlreadyDefined, name);

      if (RESERVED_SPEC_KEYS.hasOwnProperty(name)) {
        RESERVED_SPEC_KEYS[name](Constructor, property);
      } else {
        // Setup methods on prototype:
        // The following member methods should not be automatically bound:
        // 1. Expected ReactClass methods (in the "interface").
        // 2. Overridden methods (that were mixed in).
        var isReactClassMethod = ReactClassInterface.hasOwnProperty(name);
        var isFunction = typeof property === 'function';
        var shouldAutoBind = isFunction && !isReactClassMethod && !isAlreadyDefined && spec.autobind !== false;

        if (shouldAutoBind) {
          autoBindPairs.push(name, property);
          proto[name] = property;
        } else {
          if (isAlreadyDefined) {
            var specPolicy = ReactClassInterface[name];

            // These cases should already be caught by validateMethodOverride.
            _invariant(isReactClassMethod && (specPolicy === 'DEFINE_MANY_MERGED' || specPolicy === 'DEFINE_MANY'), 'ReactClass: Unexpected spec policy %s for key %s ' + 'when mixing in component specs.', specPolicy, name);

            // For methods which are defined more than once, call the existing
            // methods before calling the new property, merging if appropriate.
            if (specPolicy === 'DEFINE_MANY_MERGED') {
              proto[name] = createMergedResultFunction(proto[name], property);
            } else if (specPolicy === 'DEFINE_MANY') {
              proto[name] = createChainedFunction(proto[name], property);
            }
          } else {
            proto[name] = property;
            if (process.env.NODE_ENV !== 'production') {
              // Add verbose displayName to the function, which helps when looking
              // at profiling tools.
              if (typeof property === 'function' && spec.displayName) {
                proto[name].displayName = spec.displayName + '_' + name;
              }
            }
          }
        }
      }
    }
  }

  function mixStaticSpecIntoComponent(Constructor, statics) {
    if (!statics) {
      return;
    }
    for (var name in statics) {
      var property = statics[name];
      if (!statics.hasOwnProperty(name)) {
        continue;
      }

      var isReserved = name in RESERVED_SPEC_KEYS;
      _invariant(!isReserved, 'ReactClass: You are attempting to define a reserved ' + 'property, `%s`, that shouldn\'t be on the "statics" key. Define it ' + 'as an instance property instead; it will still be accessible on the ' + 'constructor.', name);

      var isInherited = name in Constructor;
      _invariant(!isInherited, 'ReactClass: You are attempting to define ' + '`%s` on your component more than once. This conflict may be ' + 'due to a mixin.', name);
      Constructor[name] = property;
    }
  }

  /**
   * Merge two objects, but throw if both contain the same key.
   *
   * @param {object} one The first object, which is mutated.
   * @param {object} two The second object
   * @return {object} one after it has been mutated to contain everything in two.
   */
  function mergeIntoWithNoDuplicateKeys(one, two) {
    _invariant(one && two && typeof one === 'object' && typeof two === 'object', 'mergeIntoWithNoDuplicateKeys(): Cannot merge non-objects.');

    for (var key in two) {
      if (two.hasOwnProperty(key)) {
        _invariant(one[key] === undefined, 'mergeIntoWithNoDuplicateKeys(): ' + 'Tried to merge two objects with the same key: `%s`. This conflict ' + 'may be due to a mixin; in particular, this may be caused by two ' + 'getInitialState() or getDefaultProps() methods returning objects ' + 'with clashing keys.', key);
        one[key] = two[key];
      }
    }
    return one;
  }

  /**
   * Creates a function that invokes two functions and merges their return values.
   *
   * @param {function} one Function to invoke first.
   * @param {function} two Function to invoke second.
   * @return {function} Function that invokes the two argument functions.
   * @private
   */
  function createMergedResultFunction(one, two) {
    return function mergedResult() {
      var a = one.apply(this, arguments);
      var b = two.apply(this, arguments);
      if (a == null) {
        return b;
      } else if (b == null) {
        return a;
      }
      var c = {};
      mergeIntoWithNoDuplicateKeys(c, a);
      mergeIntoWithNoDuplicateKeys(c, b);
      return c;
    };
  }

  /**
   * Creates a function that invokes two functions and ignores their return vales.
   *
   * @param {function} one Function to invoke first.
   * @param {function} two Function to invoke second.
   * @return {function} Function that invokes the two argument functions.
   * @private
   */
  function createChainedFunction(one, two) {
    return function chainedFunction() {
      one.apply(this, arguments);
      two.apply(this, arguments);
    };
  }

  /**
   * Binds a method to the component.
   *
   * @param {object} component Component whose method is going to be bound.
   * @param {function} method Method to be bound.
   * @return {function} The bound method.
   */
  function bindAutoBindMethod(component, method) {
    var boundMethod = method.bind(component);
    if (process.env.NODE_ENV !== 'production') {
      boundMethod.__reactBoundContext = component;
      boundMethod.__reactBoundMethod = method;
      boundMethod.__reactBoundArguments = null;
      var componentName = component.constructor.displayName;
      var _bind = boundMethod.bind;
      boundMethod.bind = function (newThis) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        // User is trying to bind() an autobound method; we effectively will
        // ignore the value of "this" that the user is trying to use, so
        // let's warn.
        if (newThis !== component && newThis !== null) {
          process.env.NODE_ENV !== 'production' ? warning(false, 'bind(): React component methods may only be bound to the ' + 'component instance. See %s', componentName) : void 0;
        } else if (!args.length) {
          process.env.NODE_ENV !== 'production' ? warning(false, 'bind(): You are binding a component method to the component. ' + 'React does this for you automatically in a high-performance ' + 'way, so you can safely remove this call. See %s', componentName) : void 0;
          return boundMethod;
        }
        var reboundMethod = _bind.apply(boundMethod, arguments);
        reboundMethod.__reactBoundContext = component;
        reboundMethod.__reactBoundMethod = method;
        reboundMethod.__reactBoundArguments = args;
        return reboundMethod;
      };
    }
    return boundMethod;
  }

  /**
   * Binds all auto-bound methods in a component.
   *
   * @param {object} component Component whose method is going to be bound.
   */
  function bindAutoBindMethods(component) {
    var pairs = component.__reactAutoBindPairs;
    for (var i = 0; i < pairs.length; i += 2) {
      var autoBindKey = pairs[i];
      var method = pairs[i + 1];
      component[autoBindKey] = bindAutoBindMethod(component, method);
    }
  }

  var IsMountedMixin = {
    componentDidMount: function () {
      this.__isMounted = true;
    },
    componentWillUnmount: function () {
      this.__isMounted = false;
    }
  };

  /**
   * Add more to the ReactClass base class. These are all legacy features and
   * therefore not already part of the modern ReactComponent.
   */
  var ReactClassMixin = {

    /**
     * TODO: This will be deprecated because state should always keep a consistent
     * type signature and the only use case for this, is to avoid that.
     */
    replaceState: function (newState, callback) {
      this.updater.enqueueReplaceState(this, newState, callback);
    },

    /**
     * Checks whether or not this composite component is mounted.
     * @return {boolean} True if mounted, false otherwise.
     * @protected
     * @final
     */
    isMounted: function () {
      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(this.__didWarnIsMounted, '%s: isMounted is deprecated. Instead, make sure to clean up ' + 'subscriptions and pending requests in componentWillUnmount to ' + 'prevent memory leaks.', this.constructor && this.constructor.displayName || this.name || 'Component') : void 0;
        this.__didWarnIsMounted = true;
      }
      return !!this.__isMounted;
    }
  };

  var ReactClassComponent = function () {};
  _assign(ReactClassComponent.prototype, ReactComponent.prototype, ReactClassMixin);

  /**
   * Creates a composite component class given a class specification.
   * See https://facebook.github.io/react/docs/top-level-api.html#react.createclass
   *
   * @param {object} spec Class specification (which must define `render`).
   * @return {function} Component constructor function.
   * @public
   */
  function createClass(spec) {
    // To keep our warnings more understandable, we'll use a little hack here to
    // ensure that Constructor.name !== 'Constructor'. This makes sure we don't
    // unnecessarily identify a class without displayName as 'Constructor'.
    var Constructor = identity(function (props, context, updater) {
      // This constructor gets overridden by mocks. The argument is used
      // by mocks to assert on what gets mounted.

      if (process.env.NODE_ENV !== 'production') {
        process.env.NODE_ENV !== 'production' ? warning(this instanceof Constructor, 'Something is calling a React component directly. Use a factory or ' + 'JSX instead. See: https://fb.me/react-legacyfactory') : void 0;
      }

      // Wire up auto-binding
      if (this.__reactAutoBindPairs.length) {
        bindAutoBindMethods(this);
      }

      this.props = props;
      this.context = context;
      this.refs = emptyObject;
      this.updater = updater || ReactNoopUpdateQueue;

      this.state = null;

      // ReactClasses doesn't have constructors. Instead, they use the
      // getInitialState and componentWillMount methods for initialization.

      var initialState = this.getInitialState ? this.getInitialState() : null;
      if (process.env.NODE_ENV !== 'production') {
        // We allow auto-mocks to proceed as if they're returning null.
        if (initialState === undefined && this.getInitialState._isMockFunction) {
          // This is probably bad practice. Consider warning here and
          // deprecating this convenience.
          initialState = null;
        }
      }
      _invariant(typeof initialState === 'object' && !Array.isArray(initialState), '%s.getInitialState(): must return an object or null', Constructor.displayName || 'ReactCompositeComponent');

      this.state = initialState;
    });
    Constructor.prototype = new ReactClassComponent();
    Constructor.prototype.constructor = Constructor;
    Constructor.prototype.__reactAutoBindPairs = [];

    injectedMixins.forEach(mixSpecIntoComponent.bind(null, Constructor));

    mixSpecIntoComponent(Constructor, IsMountedMixin);
    mixSpecIntoComponent(Constructor, spec);

    // Initialize the defaultProps property after all mixins have been merged.
    if (Constructor.getDefaultProps) {
      Constructor.defaultProps = Constructor.getDefaultProps();
    }

    if (process.env.NODE_ENV !== 'production') {
      // This is a tag to indicate that the use of these method names is ok,
      // since it's used with createClass. If it's not, then it's likely a
      // mistake so we'll warn you to use the static property, property
      // initializer or constructor respectively.
      if (Constructor.getDefaultProps) {
        Constructor.getDefaultProps.isReactClassApproved = {};
      }
      if (Constructor.prototype.getInitialState) {
        Constructor.prototype.getInitialState.isReactClassApproved = {};
      }
    }

    _invariant(Constructor.prototype.render, 'createClass(...): Class specification must implement a `render` method.');

    if (process.env.NODE_ENV !== 'production') {
      process.env.NODE_ENV !== 'production' ? warning(!Constructor.prototype.componentShouldUpdate, '%s has a method called ' + 'componentShouldUpdate(). Did you mean shouldComponentUpdate()? ' + 'The name is phrased as a question because the function is ' + 'expected to return a value.', spec.displayName || 'A component') : void 0;
      process.env.NODE_ENV !== 'production' ? warning(!Constructor.prototype.componentWillRecieveProps, '%s has a method called ' + 'componentWillRecieveProps(). Did you mean componentWillReceiveProps()?', spec.displayName || 'A component') : void 0;
    }

    // Reduce time spent doing lookups by setting these on the prototype.
    for (var methodName in ReactClassInterface) {
      if (!Constructor.prototype[methodName]) {
        Constructor.prototype[methodName] = null;
      }
    }

    return Constructor;
  }

  return createClass;
}

module.exports = factory;

}).call(this,require('_process'))
},{"_process":11,"fbjs/lib/emptyObject":5,"fbjs/lib/invariant":6,"fbjs/lib/warning":7,"object-assign":10}],3:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

var React = require('react');
var factory = require('./factory');

// Hack to grab NoopUpdateQueue from isomorphic React
var ReactNoopUpdateQueue = new React.Component().updater;

module.exports = factory(
  React.Component,
  React.isValidElement,
  ReactNoopUpdateQueue
);

},{"./factory":2,"react":"react"}],4:[function(require,module,exports){
"use strict";

/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * 
 */

function makeEmptyFunction(arg) {
  return function () {
    return arg;
  };
}

/**
 * This function accepts and discards inputs; it has no side effects. This is
 * primarily useful idiomatically for overridable function endpoints which
 * always need to be callable, since JS lacks a null-call idiom ala Cocoa.
 */
var emptyFunction = function emptyFunction() {};

emptyFunction.thatReturns = makeEmptyFunction;
emptyFunction.thatReturnsFalse = makeEmptyFunction(false);
emptyFunction.thatReturnsTrue = makeEmptyFunction(true);
emptyFunction.thatReturnsNull = makeEmptyFunction(null);
emptyFunction.thatReturnsThis = function () {
  return this;
};
emptyFunction.thatReturnsArgument = function (arg) {
  return arg;
};

module.exports = emptyFunction;
},{}],5:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

var emptyObject = {};

if (process.env.NODE_ENV !== 'production') {
  Object.freeze(emptyObject);
}

module.exports = emptyObject;
}).call(this,require('_process'))
},{"_process":11}],6:[function(require,module,exports){
(function (process){
/**
 * Copyright (c) 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

/**
 * Use invariant() to assert state which your program assumes to be true.
 *
 * Provide sprintf-style format (only %s is supported) and arguments
 * to provide information about what broke and what you were
 * expecting.
 *
 * The invariant message will be stripped in production, but the invariant
 * will remain to ensure logic does not differ in production.
 */

var validateFormat = function validateFormat(format) {};

if (process.env.NODE_ENV !== 'production') {
  validateFormat = function validateFormat(format) {
    if (format === undefined) {
      throw new Error('invariant requires an error message argument');
    }
  };
}

function invariant(condition, format, a, b, c, d, e, f) {
  validateFormat(format);

  if (!condition) {
    var error;
    if (format === undefined) {
      error = new Error('Minified exception occurred; use the non-minified dev environment ' + 'for the full error message and additional helpful warnings.');
    } else {
      var args = [a, b, c, d, e, f];
      var argIndex = 0;
      error = new Error(format.replace(/%s/g, function () {
        return args[argIndex++];
      }));
      error.name = 'Invariant Violation';
    }

    error.framesToPop = 1; // we don't care about invariant's own frame
    throw error;
  }
}

module.exports = invariant;
}).call(this,require('_process'))
},{"_process":11}],7:[function(require,module,exports){
(function (process){
/**
 * Copyright 2014-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 */

'use strict';

var emptyFunction = require('./emptyFunction');

/**
 * Similar to invariant but only logs a warning if the condition is not met.
 * This can be used to log issues in development environments in critical
 * paths. Removing the logging code for production environments will keep the
 * same logic and follow the same code paths.
 */

var warning = emptyFunction;

if (process.env.NODE_ENV !== 'production') {
  (function () {
    var printWarning = function printWarning(format) {
      for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }

      var argIndex = 0;
      var message = 'Warning: ' + format.replace(/%s/g, function () {
        return args[argIndex++];
      });
      if (typeof console !== 'undefined') {
        console.error(message);
      }
      try {
        // --- Welcome to debugging React ---
        // This error was thrown as a convenience so that you can use this stack
        // to find the callsite that caused this warning to fire.
        throw new Error(message);
      } catch (x) {}
    };

    warning = function warning(condition, format) {
      if (format === undefined) {
        throw new Error('`warning(condition, format, ...args)` requires a warning ' + 'message argument');
      }

      if (format.indexOf('Failed Composite propType: ') === 0) {
        return; // Ignore CompositeComponent proptype check.
      }

      if (!condition) {
        for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
          args[_key2 - 2] = arguments[_key2];
        }

        printWarning.apply(undefined, [format].concat(args));
      }
    };
  })();
}

module.exports = warning;
}).call(this,require('_process'))
},{"./emptyFunction":4,"_process":11}],8:[function(require,module,exports){
/*
 * Fuzzy
 * https://github.com/myork/fuzzy
 *
 * Copyright (c) 2012 Matt York
 * Licensed under the MIT license.
 */

(function() {

var root = this;

var fuzzy = {};

// Use in node or in browser
if (typeof exports !== 'undefined') {
  module.exports = fuzzy;
} else {
  root.fuzzy = fuzzy;
}

// Return all elements of `array` that have a fuzzy
// match against `pattern`.
fuzzy.simpleFilter = function(pattern, array) {
  return array.filter(function(str) {
    return fuzzy.test(pattern, str);
  });
};

// Does `pattern` fuzzy match `str`?
fuzzy.test = function(pattern, str) {
  return fuzzy.match(pattern, str) !== null;
};

// If `pattern` matches `str`, wrap each matching character
// in `opts.pre` and `opts.post`. If no match, return null
fuzzy.match = function(pattern, str, opts) {
  opts = opts || {};
  var patternIdx = 0
    , result = []
    , len = str.length
    , totalScore = 0
    , currScore = 0
    // prefix
    , pre = opts.pre || ''
    // suffix
    , post = opts.post || ''
    // String to compare against. This might be a lowercase version of the
    // raw string
    , compareString =  opts.caseSensitive && str || str.toLowerCase()
    , ch;

  pattern = opts.caseSensitive && pattern || pattern.toLowerCase();

  // For each character in the string, either add it to the result
  // or wrap in template if it's the next string in the pattern
  for(var idx = 0; idx < len; idx++) {
    ch = str[idx];
    if(compareString[idx] === pattern[patternIdx]) {
      ch = pre + ch + post;
      patternIdx += 1;

      // consecutive characters should increase the score more than linearly
      currScore += 1 + currScore;
    } else {
      currScore = 0;
    }
    totalScore += currScore;
    result[result.length] = ch;
  }

  // return rendered string if we have a match for every char
  if(patternIdx === pattern.length) {
    // if the string is an exact match with pattern, totalScore should be maxed
    totalScore = (compareString === pattern) ? Infinity : totalScore;
    return {rendered: result.join(''), score: totalScore};
  }

  return null;
};

// The normal entry point. Filters `arr` for matches against `pattern`.
// It returns an array with matching values of the type:
//
//     [{
//         string:   '<b>lah' // The rendered string
//       , index:    2        // The index of the element in `arr`
//       , original: 'blah'   // The original element in `arr`
//     }]
//
// `opts` is an optional argument bag. Details:
//
//    opts = {
//        // string to put before a matching character
//        pre:     '<b>'
//
//        // string to put after matching character
//      , post:    '</b>'
//
//        // Optional function. Input is an entry in the given arr`,
//        // output should be the string to test `pattern` against.
//        // In this example, if `arr = [{crying: 'koala'}]` we would return
//        // 'koala'.
//      , extract: function(arg) { return arg.crying; }
//    }
fuzzy.filter = function(pattern, arr, opts) {
  if(!arr || arr.length === 0) {
    return [];
  }
  if (typeof pattern !== 'string') {
    return arr;
  }
  opts = opts || {};
  return arr
    .reduce(function(prev, element, idx, arr) {
      var str = element;
      if(opts.extract) {
        str = opts.extract(element);
      }
      var rendered = fuzzy.match(pattern, str, opts);
      if(rendered != null) {
        prev[prev.length] = {
            string: rendered.rendered
          , score: rendered.score
          , index: idx
          , original: element
        };
      }
      return prev;
    }, [])

    // Sort by score. Browsers are inconsistent wrt stable/unstable
    // sorting, so force stable by using the index in the case of tie.
    // See http://ofb.net/~sethml/is-sort-stable.html
    .sort(function(a,b) {
      var compare = b.score - a.score;
      if(compare) return compare;
      return a.index - b.index;
    });
};


}());


},{}],9:[function(require,module,exports){
(function (global){
/**
 * @license
 * Lo-Dash 2.4.2 (Custom Build) <https://lodash.com/>
 * Build: `lodash modern -o ./dist/lodash.js`
 * Copyright 2012-2013 The Dojo Foundation <http://dojofoundation.org/>
 * Based on Underscore.js 1.5.2 <http://underscorejs.org/LICENSE>
 * Copyright 2009-2013 Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 * Available under MIT license <https://lodash.com/license>
 */
;(function() {

  /** Used as a safe reference for `undefined` in pre ES5 environments */
  var undefined;

  /** Used to pool arrays and objects used internally */
  var arrayPool = [],
      objectPool = [];

  /** Used to generate unique IDs */
  var idCounter = 0;

  /** Used to prefix keys to avoid issues with `__proto__` and properties on `Object.prototype` */
  var keyPrefix = +new Date + '';

  /** Used as the size when optimizations are enabled for large arrays */
  var largeArraySize = 75;

  /** Used as the max size of the `arrayPool` and `objectPool` */
  var maxPoolSize = 40;

  /** Used to detect and test whitespace */
  var whitespace = (
    // whitespace
    ' \t\x0B\f\xA0\ufeff' +

    // line terminators
    '\n\r\u2028\u2029' +

    // unicode category "Zs" space separators
    '\u1680\u180e\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u202f\u205f\u3000'
  );

  /** Used to match empty string literals in compiled template source */
  var reEmptyStringLeading = /\b__p \+= '';/g,
      reEmptyStringMiddle = /\b(__p \+=) '' \+/g,
      reEmptyStringTrailing = /(__e\(.*?\)|\b__t\)) \+\n'';/g;

  /**
   * Used to match ES6 template delimiters
   * http://people.mozilla.org/~jorendorff/es6-draft.html#sec-literals-string-literals
   */
  var reEsTemplate = /\$\{([^\\}]*(?:\\.[^\\}]*)*)\}/g;

  /** Used to match regexp flags from their coerced string values */
  var reFlags = /\w*$/;

  /** Used to detected named functions */
  var reFuncName = /^\s*function[ \n\r\t]+\w/;

  /** Used to match "interpolate" template delimiters */
  var reInterpolate = /<%=([\s\S]+?)%>/g;

  /** Used to match leading whitespace and zeros to be removed */
  var reLeadingSpacesAndZeros = RegExp('^[' + whitespace + ']*0+(?=.$)');

  /** Used to ensure capturing order of template delimiters */
  var reNoMatch = /($^)/;

  /** Used to detect functions containing a `this` reference */
  var reThis = /\bthis\b/;

  /** Used to match unescaped characters in compiled string literals */
  var reUnescapedString = /['\n\r\t\u2028\u2029\\]/g;

  /** Used to assign default `context` object properties */
  var contextProps = [
    'Array', 'Boolean', 'Date', 'Function', 'Math', 'Number', 'Object',
    'RegExp', 'String', '_', 'attachEvent', 'clearTimeout', 'isFinite', 'isNaN',
    'parseInt', 'setTimeout'
  ];

  /** Used to make template sourceURLs easier to identify */
  var templateCounter = 0;

  /** `Object#toString` result shortcuts */
  var argsClass = '[object Arguments]',
      arrayClass = '[object Array]',
      boolClass = '[object Boolean]',
      dateClass = '[object Date]',
      funcClass = '[object Function]',
      numberClass = '[object Number]',
      objectClass = '[object Object]',
      regexpClass = '[object RegExp]',
      stringClass = '[object String]';

  /** Used to identify object classifications that `_.clone` supports */
  var cloneableClasses = {};
  cloneableClasses[funcClass] = false;
  cloneableClasses[argsClass] = cloneableClasses[arrayClass] =
  cloneableClasses[boolClass] = cloneableClasses[dateClass] =
  cloneableClasses[numberClass] = cloneableClasses[objectClass] =
  cloneableClasses[regexpClass] = cloneableClasses[stringClass] = true;

  /** Used as an internal `_.debounce` options object */
  var debounceOptions = {
    'leading': false,
    'maxWait': 0,
    'trailing': false
  };

  /** Used as the property descriptor for `__bindData__` */
  var descriptor = {
    'configurable': false,
    'enumerable': false,
    'value': null,
    'writable': false
  };

  /** Used to determine if values are of the language type Object */
  var objectTypes = {
    'boolean': false,
    'function': true,
    'object': true,
    'number': false,
    'string': false,
    'undefined': false
  };

  /** Used to escape characters for inclusion in compiled string literals */
  var stringEscapes = {
    '\\': '\\',
    "'": "'",
    '\n': 'n',
    '\r': 'r',
    '\t': 't',
    '\u2028': 'u2028',
    '\u2029': 'u2029'
  };

  /** Used as a reference to the global object */
  var root = (objectTypes[typeof window] && window) || this;

  /** Detect free variable `exports` */
  var freeExports = objectTypes[typeof exports] && exports && !exports.nodeType && exports;

  /** Detect free variable `module` */
  var freeModule = objectTypes[typeof module] && module && !module.nodeType && module;

  /** Detect the popular CommonJS extension `module.exports` */
  var moduleExports = freeModule && freeModule.exports === freeExports && freeExports;

  /** Detect free variable `global` from Node.js or Browserified code and use it as `root` */
  var freeGlobal = objectTypes[typeof global] && global;
  if (freeGlobal && (freeGlobal.global === freeGlobal || freeGlobal.window === freeGlobal)) {
    root = freeGlobal;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * The base implementation of `_.indexOf` without support for binary searches
   * or `fromIndex` constraints.
   *
   * @private
   * @param {Array} array The array to search.
   * @param {*} value The value to search for.
   * @param {number} [fromIndex=0] The index to search from.
   * @returns {number} Returns the index of the matched value or `-1`.
   */
  function baseIndexOf(array, value, fromIndex) {
    var index = (fromIndex || 0) - 1,
        length = array ? array.length : 0;

    while (++index < length) {
      if (array[index] === value) {
        return index;
      }
    }
    return -1;
  }

  /**
   * An implementation of `_.contains` for cache objects that mimics the return
   * signature of `_.indexOf` by returning `0` if the value is found, else `-1`.
   *
   * @private
   * @param {Object} cache The cache object to inspect.
   * @param {*} value The value to search for.
   * @returns {number} Returns `0` if `value` is found, else `-1`.
   */
  function cacheIndexOf(cache, value) {
    var type = typeof value;
    cache = cache.cache;

    if (type == 'boolean' || value == null) {
      return cache[value] ? 0 : -1;
    }
    if (type != 'number' && type != 'string') {
      type = 'object';
    }
    var key = type == 'number' ? value : keyPrefix + value;
    cache = (cache = cache[type]) && cache[key];

    return type == 'object'
      ? (cache && baseIndexOf(cache, value) > -1 ? 0 : -1)
      : (cache ? 0 : -1);
  }

  /**
   * Adds a given value to the corresponding cache object.
   *
   * @private
   * @param {*} value The value to add to the cache.
   */
  function cachePush(value) {
    var cache = this.cache,
        type = typeof value;

    if (type == 'boolean' || value == null) {
      cache[value] = true;
    } else {
      if (type != 'number' && type != 'string') {
        type = 'object';
      }
      var key = type == 'number' ? value : keyPrefix + value,
          typeCache = cache[type] || (cache[type] = {});

      if (type == 'object') {
        (typeCache[key] || (typeCache[key] = [])).push(value);
      } else {
        typeCache[key] = true;
      }
    }
  }

  /**
   * Used by `_.max` and `_.min` as the default callback when a given
   * collection is a string value.
   *
   * @private
   * @param {string} value The character to inspect.
   * @returns {number} Returns the code unit of given character.
   */
  function charAtCallback(value) {
    return value.charCodeAt(0);
  }

  /**
   * Used by `sortBy` to compare transformed `collection` elements, stable sorting
   * them in ascending order.
   *
   * @private
   * @param {Object} a The object to compare to `b`.
   * @param {Object} b The object to compare to `a`.
   * @returns {number} Returns the sort order indicator of `1` or `-1`.
   */
  function compareAscending(a, b) {
    var ac = a.criteria,
        bc = b.criteria,
        index = -1,
        length = ac.length;

    while (++index < length) {
      var value = ac[index],
          other = bc[index];

      if (value !== other) {
        if (value > other || typeof value == 'undefined') {
          return 1;
        }
        if (value < other || typeof other == 'undefined') {
          return -1;
        }
      }
    }
    // Fixes an `Array#sort` bug in the JS engine embedded in Adobe applications
    // that causes it, under certain circumstances, to return the same value for
    // `a` and `b`. See https://github.com/jashkenas/underscore/pull/1247
    //
    // This also ensures a stable sort in V8 and other engines.
    // See http://code.google.com/p/v8/issues/detail?id=90
    return a.index - b.index;
  }

  /**
   * Creates a cache object to optimize linear searches of large arrays.
   *
   * @private
   * @param {Array} [array=[]] The array to search.
   * @returns {null|Object} Returns the cache object or `null` if caching should not be used.
   */
  function createCache(array) {
    var index = -1,
        length = array.length,
        first = array[0],
        mid = array[(length / 2) | 0],
        last = array[length - 1];

    if (first && typeof first == 'object' &&
        mid && typeof mid == 'object' && last && typeof last == 'object') {
      return false;
    }
    var cache = getObject();
    cache['false'] = cache['null'] = cache['true'] = cache['undefined'] = false;

    var result = getObject();
    result.array = array;
    result.cache = cache;
    result.push = cachePush;

    while (++index < length) {
      result.push(array[index]);
    }
    return result;
  }

  /**
   * Used by `template` to escape characters for inclusion in compiled
   * string literals.
   *
   * @private
   * @param {string} match The matched character to escape.
   * @returns {string} Returns the escaped character.
   */
  function escapeStringChar(match) {
    return '\\' + stringEscapes[match];
  }

  /**
   * Gets an array from the array pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Array} The array from the pool.
   */
  function getArray() {
    return arrayPool.pop() || [];
  }

  /**
   * Gets an object from the object pool or creates a new one if the pool is empty.
   *
   * @private
   * @returns {Object} The object from the pool.
   */
  function getObject() {
    return objectPool.pop() || {
      'array': null,
      'cache': null,
      'criteria': null,
      'false': false,
      'index': 0,
      'null': false,
      'number': null,
      'object': null,
      'push': null,
      'string': null,
      'true': false,
      'undefined': false,
      'value': null
    };
  }

  /**
   * Releases the given array back to the array pool.
   *
   * @private
   * @param {Array} [array] The array to release.
   */
  function releaseArray(array) {
    array.length = 0;
    if (arrayPool.length < maxPoolSize) {
      arrayPool.push(array);
    }
  }

  /**
   * Releases the given object back to the object pool.
   *
   * @private
   * @param {Object} [object] The object to release.
   */
  function releaseObject(object) {
    var cache = object.cache;
    if (cache) {
      releaseObject(cache);
    }
    object.array = object.cache = object.criteria = object.object = object.number = object.string = object.value = null;
    if (objectPool.length < maxPoolSize) {
      objectPool.push(object);
    }
  }

  /**
   * Slices the `collection` from the `start` index up to, but not including,
   * the `end` index.
   *
   * Note: This function is used instead of `Array#slice` to support node lists
   * in IE < 9 and to ensure dense arrays are returned.
   *
   * @private
   * @param {Array|Object|string} collection The collection to slice.
   * @param {number} start The start index.
   * @param {number} end The end index.
   * @returns {Array} Returns the new array.
   */
  function slice(array, start, end) {
    start || (start = 0);
    if (typeof end == 'undefined') {
      end = array ? array.length : 0;
    }
    var index = -1,
        length = end - start || 0,
        result = Array(length < 0 ? 0 : length);

    while (++index < length) {
      result[index] = array[start + index];
    }
    return result;
  }

  /*--------------------------------------------------------------------------*/

  /**
   * Create a new `lodash` function using the given context object.
   *
   * @static
   * @memberOf _
   * @category Utilities
   * @param {Object} [context=root] The context object.
   * @returns {Function} Returns the `lodash` function.
   */
  function runInContext(context) {
    // Avoid issues with some ES3 environments that attempt to use values, named
    // after built-in constructors like `Object`, for the creation of literals.
    // ES5 clears this up by stating that literals must use built-in constructors.
    // See http://es5.github.io/#x11.1.5.
    context = context ? _.defaults(root.Object(), context, _.pick(root, contextProps)) : root;

    /** Native constructor references */
    var Array = context.Array,
        Boolean = context.Boolean,
        Date = context.Date,
        Function = context.Function,
        Math = context.Math,
        Number = context.Number,
        Object = context.Object,
        RegExp = context.RegExp,
        String = context.String,
        TypeError = context.TypeError;

    /**
     * Used for `Array` method references.
     *
     * Normally `Array.prototype` would suffice, however, using an array literal
     * avoids issues in Narwhal.
     */
    var arrayRef = [];

    /** Used for native method references */
    var objectProto = Object.prototype;

    /** Used to restore the original `_` reference in `noConflict` */
    var oldDash = context._;

    /** Used to resolve the internal [[Class]] of values */
    var toString = objectProto.toString;

    /** Used to detect if a method is native */
    var reNative = RegExp('^' +
      String(toString)
        .replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
        .replace(/toString| for [^\]]+/g, '.*?') + '$'
    );

    /** Native method shortcuts */
    var ceil = Math.ceil,
        clearTimeout = context.clearTimeout,
        floor = Math.floor,
        fnToString = Function.prototype.toString,
        getPrototypeOf = isNative(getPrototypeOf = Object.getPrototypeOf) && getPrototypeOf,
        hasOwnProperty = objectProto.hasOwnProperty,
        push = arrayRef.push,
        setTimeout = context.setTimeout,
        splice = arrayRef.splice,
        unshift = arrayRef.unshift;

    /** Used to set meta data on functions */
    var defineProperty = (function() {
      // IE 8 only accepts DOM elements
      try {
        var o = {},
            func = isNative(func = Object.defineProperty) && func,
            result = func(o, o, o) && func;
      } catch(e) { }
      return result;
    }());

    /* Native method shortcuts for methods with the same name as other `lodash` methods */
    var nativeCreate = isNative(nativeCreate = Object.create) && nativeCreate,
        nativeIsArray = isNative(nativeIsArray = Array.isArray) && nativeIsArray,
        nativeIsFinite = context.isFinite,
        nativeIsNaN = context.isNaN,
        nativeKeys = isNative(nativeKeys = Object.keys) && nativeKeys,
        nativeMax = Math.max,
        nativeMin = Math.min,
        nativeParseInt = context.parseInt,
        nativeRandom = Math.random;

    /** Used to lookup a built-in constructor by [[Class]] */
    var ctorByClass = {};
    ctorByClass[arrayClass] = Array;
    ctorByClass[boolClass] = Boolean;
    ctorByClass[dateClass] = Date;
    ctorByClass[funcClass] = Function;
    ctorByClass[objectClass] = Object;
    ctorByClass[numberClass] = Number;
    ctorByClass[regexpClass] = RegExp;
    ctorByClass[stringClass] = String;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object which wraps the given value to enable intuitive
     * method chaining.
     *
     * In addition to Lo-Dash methods, wrappers also have the following `Array` methods:
     * `concat`, `join`, `pop`, `push`, `reverse`, `shift`, `slice`, `sort`, `splice`,
     * and `unshift`
     *
     * Chaining is supported in custom builds as long as the `value` method is
     * implicitly or explicitly included in the build.
     *
     * The chainable wrapper functions are:
     * `after`, `assign`, `bind`, `bindAll`, `bindKey`, `chain`, `compact`,
     * `compose`, `concat`, `countBy`, `create`, `createCallback`, `curry`,
     * `debounce`, `defaults`, `defer`, `delay`, `difference`, `filter`, `flatten`,
     * `forEach`, `forEachRight`, `forIn`, `forInRight`, `forOwn`, `forOwnRight`,
     * `functions`, `groupBy`, `indexBy`, `initial`, `intersection`, `invert`,
     * `invoke`, `keys`, `map`, `max`, `memoize`, `merge`, `min`, `object`, `omit`,
     * `once`, `pairs`, `partial`, `partialRight`, `pick`, `pluck`, `pull`, `push`,
     * `range`, `reject`, `remove`, `rest`, `reverse`, `shuffle`, `slice`, `sort`,
     * `sortBy`, `splice`, `tap`, `throttle`, `times`, `toArray`, `transform`,
     * `union`, `uniq`, `unshift`, `unzip`, `values`, `where`, `without`, `wrap`,
     * and `zip`
     *
     * The non-chainable wrapper functions are:
     * `clone`, `cloneDeep`, `contains`, `escape`, `every`, `find`, `findIndex`,
     * `findKey`, `findLast`, `findLastIndex`, `findLastKey`, `has`, `identity`,
     * `indexOf`, `isArguments`, `isArray`, `isBoolean`, `isDate`, `isElement`,
     * `isEmpty`, `isEqual`, `isFinite`, `isFunction`, `isNaN`, `isNull`, `isNumber`,
     * `isObject`, `isPlainObject`, `isRegExp`, `isString`, `isUndefined`, `join`,
     * `lastIndexOf`, `mixin`, `noConflict`, `parseInt`, `pop`, `random`, `reduce`,
     * `reduceRight`, `result`, `shift`, `size`, `some`, `sortedIndex`, `runInContext`,
     * `template`, `unescape`, `uniqueId`, and `value`
     *
     * The wrapper functions `first` and `last` return wrapped values when `n` is
     * provided, otherwise they return unwrapped values.
     *
     * Explicit chaining can be enabled by using the `_.chain` method.
     *
     * @name _
     * @constructor
     * @category Chaining
     * @param {*} value The value to wrap in a `lodash` instance.
     * @returns {Object} Returns a `lodash` instance.
     * @example
     *
     * var wrapped = _([1, 2, 3]);
     *
     * // returns an unwrapped value
     * wrapped.reduce(function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * // returns a wrapped value
     * var squares = wrapped.map(function(num) {
     *   return num * num;
     * });
     *
     * _.isArray(squares);
     * // => false
     *
     * _.isArray(squares.value());
     * // => true
     */
    function lodash(value) {
      // don't wrap if already wrapped, even if wrapped by a different `lodash` constructor
      return (value && typeof value == 'object' && !isArray(value) && hasOwnProperty.call(value, '__wrapped__'))
       ? value
       : new lodashWrapper(value);
    }

    /**
     * A fast path for creating `lodash` wrapper objects.
     *
     * @private
     * @param {*} value The value to wrap in a `lodash` instance.
     * @param {boolean} chainAll A flag to enable chaining for all methods
     * @returns {Object} Returns a `lodash` instance.
     */
    function lodashWrapper(value, chainAll) {
      this.__chain__ = !!chainAll;
      this.__wrapped__ = value;
    }
    // ensure `new lodashWrapper` is an instance of `lodash`
    lodashWrapper.prototype = lodash.prototype;

    /**
     * An object used to flag environments features.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    var support = lodash.support = {};

    /**
     * Detect if functions can be decompiled by `Function#toString`
     * (all but PS3 and older Opera mobile browsers & avoided in Windows 8 apps).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcDecomp = !isNative(context.WinRTError) && reThis.test(runInContext);

    /**
     * Detect if `Function#name` is supported (all but IE).
     *
     * @memberOf _.support
     * @type boolean
     */
    support.funcNames = typeof Function.name == 'string';

    /**
     * By default, the template delimiters used by Lo-Dash are similar to those in
     * embedded Ruby (ERB). Change the following template settings to use alternative
     * delimiters.
     *
     * @static
     * @memberOf _
     * @type Object
     */
    lodash.templateSettings = {

      /**
       * Used to detect `data` property values to be HTML-escaped.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'escape': /<%-([\s\S]+?)%>/g,

      /**
       * Used to detect code to be evaluated.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'evaluate': /<%([\s\S]+?)%>/g,

      /**
       * Used to detect `data` property values to inject.
       *
       * @memberOf _.templateSettings
       * @type RegExp
       */
      'interpolate': reInterpolate,

      /**
       * Used to reference the data object in the template text.
       *
       * @memberOf _.templateSettings
       * @type string
       */
      'variable': '',

      /**
       * Used to import variables into the compiled template.
       *
       * @memberOf _.templateSettings
       * @type Object
       */
      'imports': {

        /**
         * A reference to the `lodash` function.
         *
         * @memberOf _.templateSettings.imports
         * @type Function
         */
        '_': lodash
      }
    };

    /*--------------------------------------------------------------------------*/

    /**
     * The base implementation of `_.bind` that creates the bound function and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new bound function.
     */
    function baseBind(bindData) {
      var func = bindData[0],
          partialArgs = bindData[2],
          thisArg = bindData[4];

      function bound() {
        // `Function#bind` spec
        // http://es5.github.io/#x15.3.4.5
        if (partialArgs) {
          // avoid `arguments` object deoptimizations by using `slice` instead
          // of `Array.prototype.slice.call` and not assigning `arguments` to a
          // variable as a ternary expression
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        // mimic the constructor's `return` behavior
        // http://es5.github.io/#x13.2.2
        if (this instanceof bound) {
          // ensure `new bound` is an instance of `func`
          var thisBinding = baseCreate(func.prototype),
              result = func.apply(thisBinding, args || arguments);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisArg, args || arguments);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.clone` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates clones with source counterparts.
     * @returns {*} Returns the cloned value.
     */
    function baseClone(value, isDeep, callback, stackA, stackB) {
      if (callback) {
        var result = callback(value);
        if (typeof result != 'undefined') {
          return result;
        }
      }
      // inspect [[Class]]
      var isObj = isObject(value);
      if (isObj) {
        var className = toString.call(value);
        if (!cloneableClasses[className]) {
          return value;
        }
        var ctor = ctorByClass[className];
        switch (className) {
          case boolClass:
          case dateClass:
            return new ctor(+value);

          case numberClass:
          case stringClass:
            return new ctor(value);

          case regexpClass:
            result = ctor(value.source, reFlags.exec(value));
            result.lastIndex = value.lastIndex;
            return result;
        }
      } else {
        return value;
      }
      var isArr = isArray(value);
      if (isDeep) {
        // check for circular references and return corresponding clone
        var initedStack = !stackA;
        stackA || (stackA = getArray());
        stackB || (stackB = getArray());

        var length = stackA.length;
        while (length--) {
          if (stackA[length] == value) {
            return stackB[length];
          }
        }
        result = isArr ? ctor(value.length) : {};
      }
      else {
        result = isArr ? slice(value) : assign({}, value);
      }
      // add array properties assigned by `RegExp#exec`
      if (isArr) {
        if (hasOwnProperty.call(value, 'index')) {
          result.index = value.index;
        }
        if (hasOwnProperty.call(value, 'input')) {
          result.input = value.input;
        }
      }
      // exit for shallow clone
      if (!isDeep) {
        return result;
      }
      // add the source value to the stack of traversed objects
      // and associate it with its clone
      stackA.push(value);
      stackB.push(result);

      // recursively populate clone (susceptible to call stack limits)
      (isArr ? forEach : forOwn)(value, function(objValue, key) {
        result[key] = baseClone(objValue, isDeep, callback, stackA, stackB);
      });

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.create` without support for assigning
     * properties to the created object.
     *
     * @private
     * @param {Object} prototype The object to inherit from.
     * @returns {Object} Returns the new object.
     */
    function baseCreate(prototype, properties) {
      return isObject(prototype) ? nativeCreate(prototype) : {};
    }
    // fallback for browsers without `Object.create`
    if (!nativeCreate) {
      baseCreate = (function() {
        function Object() {}
        return function(prototype) {
          if (isObject(prototype)) {
            Object.prototype = prototype;
            var result = new Object;
            Object.prototype = null;
          }
          return result || context.Object();
        };
      }());
    }

    /**
     * The base implementation of `_.createCallback` without support for creating
     * "_.pluck" or "_.where" style callbacks.
     *
     * @private
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     */
    function baseCreateCallback(func, thisArg, argCount) {
      if (typeof func != 'function') {
        return identity;
      }
      // exit early for no `thisArg` or already bound by `Function#bind`
      if (typeof thisArg == 'undefined' || !('prototype' in func)) {
        return func;
      }
      var bindData = func.__bindData__;
      if (typeof bindData == 'undefined') {
        if (support.funcNames) {
          bindData = !func.name;
        }
        bindData = bindData || !support.funcDecomp;
        if (!bindData) {
          var source = fnToString.call(func);
          if (!support.funcNames) {
            bindData = !reFuncName.test(source);
          }
          if (!bindData) {
            // checks if `func` references the `this` keyword and stores the result
            bindData = reThis.test(source);
            setBindData(func, bindData);
          }
        }
      }
      // exit early if there are no `this` references or `func` is bound
      if (bindData === false || (bindData !== true && bindData[1] & 1)) {
        return func;
      }
      switch (argCount) {
        case 1: return function(value) {
          return func.call(thisArg, value);
        };
        case 2: return function(a, b) {
          return func.call(thisArg, a, b);
        };
        case 3: return function(value, index, collection) {
          return func.call(thisArg, value, index, collection);
        };
        case 4: return function(accumulator, value, index, collection) {
          return func.call(thisArg, accumulator, value, index, collection);
        };
      }
      return bind(func, thisArg);
    }

    /**
     * The base implementation of `createWrapper` that creates the wrapper and
     * sets its meta data.
     *
     * @private
     * @param {Array} bindData The bind data array.
     * @returns {Function} Returns the new function.
     */
    function baseCreateWrapper(bindData) {
      var func = bindData[0],
          bitmask = bindData[1],
          partialArgs = bindData[2],
          partialRightArgs = bindData[3],
          thisArg = bindData[4],
          arity = bindData[5];

      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          key = func;

      function bound() {
        var thisBinding = isBind ? thisArg : this;
        if (partialArgs) {
          var args = slice(partialArgs);
          push.apply(args, arguments);
        }
        if (partialRightArgs || isCurry) {
          args || (args = slice(arguments));
          if (partialRightArgs) {
            push.apply(args, partialRightArgs);
          }
          if (isCurry && args.length < arity) {
            bitmask |= 16 & ~32;
            return baseCreateWrapper([func, (isCurryBound ? bitmask : bitmask & ~3), args, null, thisArg, arity]);
          }
        }
        args || (args = arguments);
        if (isBindKey) {
          func = thisBinding[key];
        }
        if (this instanceof bound) {
          thisBinding = baseCreate(func.prototype);
          var result = func.apply(thisBinding, args);
          return isObject(result) ? result : thisBinding;
        }
        return func.apply(thisBinding, args);
      }
      setBindData(bound, bindData);
      return bound;
    }

    /**
     * The base implementation of `_.difference` that accepts a single array
     * of values to exclude.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {Array} [values] The array of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     */
    function baseDifference(array, values) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          isLarge = length >= largeArraySize && indexOf === baseIndexOf,
          result = [];

      if (isLarge) {
        var cache = createCache(values);
        if (cache) {
          indexOf = cacheIndexOf;
          values = cache;
        } else {
          isLarge = false;
        }
      }
      while (++index < length) {
        var value = array[index];
        if (indexOf(values, value) < 0) {
          result.push(value);
        }
      }
      if (isLarge) {
        releaseObject(values);
      }
      return result;
    }

    /**
     * The base implementation of `_.flatten` without support for callback
     * shorthands or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {boolean} [isStrict=false] A flag to restrict flattening to arrays and `arguments` objects.
     * @param {number} [fromIndex=0] The index to start from.
     * @returns {Array} Returns a new flattened array.
     */
    function baseFlatten(array, isShallow, isStrict, fromIndex) {
      var index = (fromIndex || 0) - 1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];

        if (value && typeof value == 'object' && typeof value.length == 'number'
            && (isArray(value) || isArguments(value))) {
          // recursively flatten arrays (susceptible to call stack limits)
          if (!isShallow) {
            value = baseFlatten(value, isShallow, isStrict);
          }
          var valIndex = -1,
              valLength = value.length,
              resIndex = result.length;

          result.length += valLength;
          while (++valIndex < valLength) {
            result[resIndex++] = value[valIndex];
          }
        } else if (!isStrict) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * The base implementation of `_.isEqual`, without support for `thisArg` binding,
     * that allows partial "_.where" style comparisons.
     *
     * @private
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {Function} [isWhere=false] A flag to indicate performing partial comparisons.
     * @param {Array} [stackA=[]] Tracks traversed `a` objects.
     * @param {Array} [stackB=[]] Tracks traversed `b` objects.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     */
    function baseIsEqual(a, b, callback, isWhere, stackA, stackB) {
      // used to indicate that when comparing objects, `a` has at least the properties of `b`
      if (callback) {
        var result = callback(a, b);
        if (typeof result != 'undefined') {
          return !!result;
        }
      }
      // exit early for identical values
      if (a === b) {
        // treat `+0` vs. `-0` as not equal
        return a !== 0 || (1 / a == 1 / b);
      }
      var type = typeof a,
          otherType = typeof b;

      // exit early for unlike primitive values
      if (a === a &&
          !(a && objectTypes[type]) &&
          !(b && objectTypes[otherType])) {
        return false;
      }
      // exit early for `null` and `undefined` avoiding ES3's Function#call behavior
      // http://es5.github.io/#x15.3.4.4
      if (a == null || b == null) {
        return a === b;
      }
      // compare [[Class]] names
      var className = toString.call(a),
          otherClass = toString.call(b);

      if (className == argsClass) {
        className = objectClass;
      }
      if (otherClass == argsClass) {
        otherClass = objectClass;
      }
      if (className != otherClass) {
        return false;
      }
      switch (className) {
        case boolClass:
        case dateClass:
          // coerce dates and booleans to numbers, dates to milliseconds and booleans
          // to `1` or `0` treating invalid dates coerced to `NaN` as not equal
          return +a == +b;

        case numberClass:
          // treat `NaN` vs. `NaN` as equal
          return (a != +a)
            ? b != +b
            // but treat `+0` vs. `-0` as not equal
            : (a == 0 ? (1 / a == 1 / b) : a == +b);

        case regexpClass:
        case stringClass:
          // coerce regexes to strings (http://es5.github.io/#x15.10.6.4)
          // treat string primitives and their corresponding object instances as equal
          return a == String(b);
      }
      var isArr = className == arrayClass;
      if (!isArr) {
        // unwrap any `lodash` wrapped values
        var aWrapped = hasOwnProperty.call(a, '__wrapped__'),
            bWrapped = hasOwnProperty.call(b, '__wrapped__');

        if (aWrapped || bWrapped) {
          return baseIsEqual(aWrapped ? a.__wrapped__ : a, bWrapped ? b.__wrapped__ : b, callback, isWhere, stackA, stackB);
        }
        // exit for functions and DOM nodes
        if (className != objectClass) {
          return false;
        }
        // in older versions of Opera, `arguments` objects have `Array` constructors
        var ctorA = a.constructor,
            ctorB = b.constructor;

        // non `Object` object instances with different constructors are not equal
        if (ctorA != ctorB &&
              !(isFunction(ctorA) && ctorA instanceof ctorA && isFunction(ctorB) && ctorB instanceof ctorB) &&
              ('constructor' in a && 'constructor' in b)
            ) {
          return false;
        }
      }
      // assume cyclic structures are equal
      // the algorithm for detecting cyclic structures is adapted from ES 5.1
      // section 15.12.3, abstract operation `JO` (http://es5.github.io/#x15.12.3)
      var initedStack = !stackA;
      stackA || (stackA = getArray());
      stackB || (stackB = getArray());

      var length = stackA.length;
      while (length--) {
        if (stackA[length] == a) {
          return stackB[length] == b;
        }
      }
      var size = 0;
      result = true;

      // add `a` and `b` to the stack of traversed objects
      stackA.push(a);
      stackB.push(b);

      // recursively compare objects and arrays (susceptible to call stack limits)
      if (isArr) {
        // compare lengths to determine if a deep comparison is necessary
        length = a.length;
        size = b.length;
        result = size == length;

        if (result || isWhere) {
          // deep compare the contents, ignoring non-numeric properties
          while (size--) {
            var index = length,
                value = b[size];

            if (isWhere) {
              while (index--) {
                if ((result = baseIsEqual(a[index], value, callback, isWhere, stackA, stackB))) {
                  break;
                }
              }
            } else if (!(result = baseIsEqual(a[size], value, callback, isWhere, stackA, stackB))) {
              break;
            }
          }
        }
      }
      else {
        // deep compare objects using `forIn`, instead of `forOwn`, to avoid `Object.keys`
        // which, in this case, is more costly
        forIn(b, function(value, key, b) {
          if (hasOwnProperty.call(b, key)) {
            // count the number of properties.
            size++;
            // deep compare each property value.
            return (result = hasOwnProperty.call(a, key) && baseIsEqual(a[key], value, callback, isWhere, stackA, stackB));
          }
        });

        if (result && !isWhere) {
          // ensure both objects have the same number of properties
          forIn(a, function(value, key, a) {
            if (hasOwnProperty.call(a, key)) {
              // `size` will be `-1` if `a` has more properties than `b`
              return (result = --size > -1);
            }
          });
        }
      }
      stackA.pop();
      stackB.pop();

      if (initedStack) {
        releaseArray(stackA);
        releaseArray(stackB);
      }
      return result;
    }

    /**
     * The base implementation of `_.merge` without argument juggling or support
     * for `thisArg` binding.
     *
     * @private
     * @param {Object} object The destination object.
     * @param {Object} source The source object.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {Array} [stackA=[]] Tracks traversed source objects.
     * @param {Array} [stackB=[]] Associates values with source counterparts.
     */
    function baseMerge(object, source, callback, stackA, stackB) {
      (isArray(source) ? forEach : forOwn)(source, function(source, key) {
        var found,
            isArr,
            result = source,
            value = object[key];

        if (source && ((isArr = isArray(source)) || isPlainObject(source))) {
          // avoid merging previously merged cyclic sources
          var stackLength = stackA.length;
          while (stackLength--) {
            if ((found = stackA[stackLength] == source)) {
              value = stackB[stackLength];
              break;
            }
          }
          if (!found) {
            var isShallow;
            if (callback) {
              result = callback(value, source);
              if ((isShallow = typeof result != 'undefined')) {
                value = result;
              }
            }
            if (!isShallow) {
              value = isArr
                ? (isArray(value) ? value : [])
                : (isPlainObject(value) ? value : {});
            }
            // add `source` and associated `value` to the stack of traversed objects
            stackA.push(source);
            stackB.push(value);

            // recursively merge objects and arrays (susceptible to call stack limits)
            if (!isShallow) {
              baseMerge(value, source, callback, stackA, stackB);
            }
          }
        }
        else {
          if (callback) {
            result = callback(value, source);
            if (typeof result == 'undefined') {
              result = source;
            }
          }
          if (typeof result != 'undefined') {
            value = result;
          }
        }
        object[key] = value;
      });
    }

    /**
     * The base implementation of `_.random` without argument juggling or support
     * for returning floating-point numbers.
     *
     * @private
     * @param {number} min The minimum possible value.
     * @param {number} max The maximum possible value.
     * @returns {number} Returns a random number.
     */
    function baseRandom(min, max) {
      return min + floor(nativeRandom() * (max - min + 1));
    }

    /**
     * The base implementation of `_.uniq` without support for callback shorthands
     * or `thisArg` binding.
     *
     * @private
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function} [callback] The function called per iteration.
     * @returns {Array} Returns a duplicate-value-free array.
     */
    function baseUniq(array, isSorted, callback) {
      var index = -1,
          indexOf = getIndexOf(),
          length = array ? array.length : 0,
          result = [];

      var isLarge = !isSorted && length >= largeArraySize && indexOf === baseIndexOf,
          seen = (callback || isLarge) ? getArray() : result;

      if (isLarge) {
        var cache = createCache(seen);
        indexOf = cacheIndexOf;
        seen = cache;
      }
      while (++index < length) {
        var value = array[index],
            computed = callback ? callback(value, index, array) : value;

        if (isSorted
              ? !index || seen[seen.length - 1] !== computed
              : indexOf(seen, computed) < 0
            ) {
          if (callback || isLarge) {
            seen.push(computed);
          }
          result.push(value);
        }
      }
      if (isLarge) {
        releaseArray(seen.array);
        releaseObject(seen);
      } else if (callback) {
        releaseArray(seen);
      }
      return result;
    }

    /**
     * Creates a function that aggregates a collection, creating an object composed
     * of keys generated from the results of running each element of the collection
     * through a callback. The given `setter` function sets the keys and values
     * of the composed object.
     *
     * @private
     * @param {Function} setter The setter function.
     * @returns {Function} Returns the new aggregator function.
     */
    function createAggregator(setter) {
      return function(collection, callback, thisArg) {
        var result = {};
        callback = lodash.createCallback(callback, thisArg, 3);

        var index = -1,
            length = collection ? collection.length : 0;

        if (typeof length == 'number') {
          while (++index < length) {
            var value = collection[index];
            setter(result, value, callback(value, index, collection), collection);
          }
        } else {
          forOwn(collection, function(value, key, collection) {
            setter(result, value, callback(value, key, collection), collection);
          });
        }
        return result;
      };
    }

    /**
     * Creates a function that, when called, either curries or invokes `func`
     * with an optional `this` binding and partially applied arguments.
     *
     * @private
     * @param {Function|string} func The function or method name to reference.
     * @param {number} bitmask The bitmask of method flags to compose.
     *  The bitmask may be composed of the following flags:
     *  1 - `_.bind`
     *  2 - `_.bindKey`
     *  4 - `_.curry`
     *  8 - `_.curry` (bound)
     *  16 - `_.partial`
     *  32 - `_.partialRight`
     * @param {Array} [partialArgs] An array of arguments to prepend to those
     *  provided to the new function.
     * @param {Array} [partialRightArgs] An array of arguments to append to those
     *  provided to the new function.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {number} [arity] The arity of `func`.
     * @returns {Function} Returns the new function.
     */
    function createWrapper(func, bitmask, partialArgs, partialRightArgs, thisArg, arity) {
      var isBind = bitmask & 1,
          isBindKey = bitmask & 2,
          isCurry = bitmask & 4,
          isCurryBound = bitmask & 8,
          isPartial = bitmask & 16,
          isPartialRight = bitmask & 32;

      if (!isBindKey && !isFunction(func)) {
        throw new TypeError;
      }
      if (isPartial && !partialArgs.length) {
        bitmask &= ~16;
        isPartial = partialArgs = false;
      }
      if (isPartialRight && !partialRightArgs.length) {
        bitmask &= ~32;
        isPartialRight = partialRightArgs = false;
      }
      var bindData = func && func.__bindData__;
      if (bindData && bindData !== true) {
        // clone `bindData`
        bindData = slice(bindData);
        if (bindData[2]) {
          bindData[2] = slice(bindData[2]);
        }
        if (bindData[3]) {
          bindData[3] = slice(bindData[3]);
        }
        // set `thisBinding` is not previously bound
        if (isBind && !(bindData[1] & 1)) {
          bindData[4] = thisArg;
        }
        // set if previously bound but not currently (subsequent curried functions)
        if (!isBind && bindData[1] & 1) {
          bitmask |= 8;
        }
        // set curried arity if not yet set
        if (isCurry && !(bindData[1] & 4)) {
          bindData[5] = arity;
        }
        // append partial left arguments
        if (isPartial) {
          push.apply(bindData[2] || (bindData[2] = []), partialArgs);
        }
        // append partial right arguments
        if (isPartialRight) {
          unshift.apply(bindData[3] || (bindData[3] = []), partialRightArgs);
        }
        // merge flags
        bindData[1] |= bitmask;
        return createWrapper.apply(null, bindData);
      }
      // fast path for `_.bind`
      var creater = (bitmask == 1 || bitmask === 17) ? baseBind : baseCreateWrapper;
      return creater([func, bitmask, partialArgs, partialRightArgs, thisArg, arity]);
    }

    /**
     * Used by `escape` to convert characters to HTML entities.
     *
     * @private
     * @param {string} match The matched character to escape.
     * @returns {string} Returns the escaped character.
     */
    function escapeHtmlChar(match) {
      return htmlEscapes[match];
    }

    /**
     * Gets the appropriate "indexOf" function. If the `_.indexOf` method is
     * customized, this method returns the custom method, otherwise it returns
     * the `baseIndexOf` function.
     *
     * @private
     * @returns {Function} Returns the "indexOf" function.
     */
    function getIndexOf() {
      var result = (result = lodash.indexOf) === indexOf ? baseIndexOf : result;
      return result;
    }

    /**
     * Checks if `value` is a native function.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a native function, else `false`.
     */
    function isNative(value) {
      return typeof value == 'function' && reNative.test(value);
    }

    /**
     * Sets `this` binding data on a given function.
     *
     * @private
     * @param {Function} func The function to set data on.
     * @param {Array} value The data array to set.
     */
    var setBindData = !defineProperty ? noop : function(func, value) {
      descriptor.value = value;
      defineProperty(func, '__bindData__', descriptor);
      descriptor.value = null;
    };

    /**
     * A fallback implementation of `isPlainObject` which checks if a given value
     * is an object created by the `Object` constructor, assuming objects created
     * by the `Object` constructor have no inherited enumerable properties and that
     * there are no `Object.prototype` extensions.
     *
     * @private
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     */
    function shimIsPlainObject(value) {
      var ctor,
          result;

      // avoid non Object objects, `arguments` objects, and DOM elements
      if (!(value && toString.call(value) == objectClass) ||
          (ctor = value.constructor, isFunction(ctor) && !(ctor instanceof ctor))) {
        return false;
      }
      // In most environments an object's own properties are iterated before
      // its inherited properties. If the last iterated property is an object's
      // own property then there are no inherited enumerable properties.
      forIn(value, function(value, key) {
        result = key;
      });
      return typeof result == 'undefined' || hasOwnProperty.call(value, result);
    }

    /**
     * Used by `unescape` to convert HTML entities to characters.
     *
     * @private
     * @param {string} match The matched character to unescape.
     * @returns {string} Returns the unescaped character.
     */
    function unescapeHtmlChar(match) {
      return htmlUnescapes[match];
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Checks if `value` is an `arguments` object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an `arguments` object, else `false`.
     * @example
     *
     * (function() { return _.isArguments(arguments); })(1, 2, 3);
     * // => true
     *
     * _.isArguments([1, 2, 3]);
     * // => false
     */
    function isArguments(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == argsClass || false;
    }

    /**
     * Checks if `value` is an array.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an array, else `false`.
     * @example
     *
     * (function() { return _.isArray(arguments); })();
     * // => false
     *
     * _.isArray([1, 2, 3]);
     * // => true
     */
    var isArray = nativeIsArray || function(value) {
      return value && typeof value == 'object' && typeof value.length == 'number' &&
        toString.call(value) == arrayClass || false;
    };

    /**
     * A fallback implementation of `Object.keys` which produces an array of the
     * given object's own enumerable property names.
     *
     * @private
     * @type Function
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     */
    var shimKeys = function(object) {
      var index, iterable = object, result = [];
      if (!iterable) return result;
      if (!(objectTypes[typeof object])) return result;
        for (index in iterable) {
          if (hasOwnProperty.call(iterable, index)) {
            result.push(index);
          }
        }
      return result
    };

    /**
     * Creates an array composed of the own enumerable property names of an object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names.
     * @example
     *
     * _.keys({ 'one': 1, 'two': 2, 'three': 3 });
     * // => ['one', 'two', 'three'] (property order is not guaranteed across environments)
     */
    var keys = !nativeKeys ? shimKeys : function(object) {
      if (!isObject(object)) {
        return [];
      }
      return nativeKeys(object);
    };

    /**
     * Used to convert characters to HTML entities:
     *
     * Though the `>` character is escaped for symmetry, characters like `>` and `/`
     * don't require escaping in HTML and have no special meaning unless they're part
     * of a tag or an unquoted attribute value.
     * http://mathiasbynens.be/notes/ambiguous-ampersands (under "semi-related fun fact")
     */
    var htmlEscapes = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };

    /** Used to convert HTML entities to characters */
    var htmlUnescapes = invert(htmlEscapes);

    /** Used to match HTML entities and HTML characters */
    var reEscapedHtml = RegExp('(' + keys(htmlUnescapes).join('|') + ')', 'g'),
        reUnescapedHtml = RegExp('[' + keys(htmlEscapes).join('') + ']', 'g');

    /*--------------------------------------------------------------------------*/

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object. Subsequent sources will overwrite property assignments of previous
     * sources. If a callback is provided it will be executed to produce the
     * assigned values. The callback is bound to `thisArg` and invoked with two
     * arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @type Function
     * @alias extend
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize assigning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * _.assign({ 'name': 'fred' }, { 'employer': 'slate' });
     * // => { 'name': 'fred', 'employer': 'slate' }
     *
     * var defaults = _.partialRight(_.assign, function(a, b) {
     *   return typeof a == 'undefined' ? b : a;
     * });
     *
     * var object = { 'name': 'barney' };
     * defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var assign = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      if (argsLength > 3 && typeof args[argsLength - 2] == 'function') {
        var callback = baseCreateCallback(args[--argsLength - 1], args[argsLength--], 2);
      } else if (argsLength > 2 && typeof args[argsLength - 1] == 'function') {
        callback = args[--argsLength];
      }
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          result[index] = callback ? callback(result[index], iterable[index]) : iterable[index];
        }
        }
      }
      return result
    };

    /**
     * Creates a clone of `value`. If `isDeep` is `true` nested objects will also
     * be cloned, otherwise they will be assigned by reference. If a callback
     * is provided it will be executed to produce the cloned values. If the
     * callback returns `undefined` cloning will be handled by the method instead.
     * The callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to clone.
     * @param {boolean} [isDeep=false] Specify a deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var shallow = _.clone(characters);
     * shallow[0] === characters[0];
     * // => true
     *
     * var deep = _.clone(characters, true);
     * deep[0] === characters[0];
     * // => false
     *
     * _.mixin({
     *   'clone': _.partialRight(_.clone, function(value) {
     *     return _.isElement(value) ? value.cloneNode(false) : undefined;
     *   })
     * });
     *
     * var clone = _.clone(document.body);
     * clone.childNodes.length;
     * // => 0
     */
    function clone(value, isDeep, callback, thisArg) {
      // allows working with "Collections" methods without using their `index`
      // and `collection` arguments for `isDeep` and `callback`
      if (typeof isDeep != 'boolean' && isDeep != null) {
        thisArg = callback;
        callback = isDeep;
        isDeep = false;
      }
      return baseClone(value, isDeep, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates a deep clone of `value`. If a callback is provided it will be
     * executed to produce the cloned values. If the callback returns `undefined`
     * cloning will be handled by the method instead. The callback is bound to
     * `thisArg` and invoked with one argument; (value).
     *
     * Note: This method is loosely based on the structured clone algorithm. Functions
     * and DOM nodes are **not** cloned. The enumerable properties of `arguments` objects and
     * objects created by constructors other than `Object` are cloned to plain `Object` objects.
     * See http://www.w3.org/TR/html5/infrastructure.html#internal-structured-cloning-algorithm.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to deep clone.
     * @param {Function} [callback] The function to customize cloning values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the deep cloned value.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * var deep = _.cloneDeep(characters);
     * deep[0] === characters[0];
     * // => false
     *
     * var view = {
     *   'label': 'docs',
     *   'node': element
     * };
     *
     * var clone = _.cloneDeep(view, function(value) {
     *   return _.isElement(value) ? value.cloneNode(true) : undefined;
     * });
     *
     * clone.node == view.node;
     * // => false
     */
    function cloneDeep(value, callback, thisArg) {
      return baseClone(value, true, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 1));
    }

    /**
     * Creates an object that inherits from the given `prototype` object. If a
     * `properties` object is provided its own enumerable properties are assigned
     * to the created object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} prototype The object to inherit from.
     * @param {Object} [properties] The properties to assign to the object.
     * @returns {Object} Returns the new object.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * function Circle() {
     *   Shape.call(this);
     * }
     *
     * Circle.prototype = _.create(Shape.prototype, { 'constructor': Circle });
     *
     * var circle = new Circle;
     * circle instanceof Circle;
     * // => true
     *
     * circle instanceof Shape;
     * // => true
     */
    function create(prototype, properties) {
      var result = baseCreate(prototype);
      return properties ? assign(result, properties) : result;
    }

    /**
     * Assigns own enumerable properties of source object(s) to the destination
     * object for all destination properties that resolve to `undefined`. Once a
     * property is set, additional defaults of the same property will be ignored.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param- {Object} [guard] Allows working with `_.reduce` without using its
     *  `key` and `object` arguments as sources.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var object = { 'name': 'barney' };
     * _.defaults(object, { 'name': 'fred', 'employer': 'slate' });
     * // => { 'name': 'barney', 'employer': 'slate' }
     */
    var defaults = function(object, source, guard) {
      var index, iterable = object, result = iterable;
      if (!iterable) return result;
      var args = arguments,
          argsIndex = 0,
          argsLength = typeof guard == 'number' ? 2 : args.length;
      while (++argsIndex < argsLength) {
        iterable = args[argsIndex];
        if (iterable && objectTypes[typeof iterable]) {
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (typeof result[index] == 'undefined') result[index] = iterable[index];
        }
        }
      }
      return result
    };

    /**
     * This method is like `_.findIndex` except that it returns the key of the
     * first element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': false },
     *   'fred': {    'age': 40, 'blocked': true },
     *   'pebbles': { 'age': 1,  'blocked': false }
     * };
     *
     * _.findKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => 'barney' (property order is not guaranteed across environments)
     *
     * // using "_.where" callback shorthand
     * _.findKey(characters, { 'age': 1 });
     * // => 'pebbles'
     *
     * // using "_.pluck" callback shorthand
     * _.findKey(characters, 'blocked');
     * // => 'fred'
     */
    function findKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwn(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * This method is like `_.findKey` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to search.
     * @param {Function|Object|string} [callback=identity] The function called per
     *  iteration. If a property name or object is provided it will be used to
     *  create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {string|undefined} Returns the key of the found element, else `undefined`.
     * @example
     *
     * var characters = {
     *   'barney': {  'age': 36, 'blocked': true },
     *   'fred': {    'age': 40, 'blocked': false },
     *   'pebbles': { 'age': 1,  'blocked': true }
     * };
     *
     * _.findLastKey(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => returns `pebbles`, assuming `_.findKey` returns `barney`
     *
     * // using "_.where" callback shorthand
     * _.findLastKey(characters, { 'age': 40 });
     * // => 'fred'
     *
     * // using "_.pluck" callback shorthand
     * _.findLastKey(characters, 'blocked');
     * // => 'pebbles'
     */
    function findLastKey(object, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forOwnRight(object, function(value, key, object) {
        if (callback(value, key, object)) {
          result = key;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over own and inherited enumerable properties of an object,
     * executing the callback for each property. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, key, object). Callbacks may exit
     * iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forIn(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'x', 'y', and 'move' (property order is not guaranteed across environments)
     */
    var forIn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        for (index in iterable) {
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forIn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * Shape.prototype.move = function(x, y) {
     *   this.x += x;
     *   this.y += y;
     * };
     *
     * _.forInRight(new Shape, function(value, key) {
     *   console.log(key);
     * });
     * // => logs 'move', 'y', and 'x' assuming `_.forIn ` logs 'x', 'y', and 'move'
     */
    function forInRight(object, callback, thisArg) {
      var pairs = [];

      forIn(object, function(value, key) {
        pairs.push(key, value);
      });

      var length = pairs.length;
      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(pairs[length--], pairs[length], object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Iterates over own enumerable properties of an object, executing the callback
     * for each property. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, key, object). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwn({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs '0', '1', and 'length' (property order is not guaranteed across environments)
     */
    var forOwn = function(collection, callback, thisArg) {
      var index, iterable = collection, result = iterable;
      if (!iterable) return result;
      if (!objectTypes[typeof iterable]) return result;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
        var ownIndex = -1,
            ownProps = objectTypes[typeof iterable] && keys(iterable),
            length = ownProps ? ownProps.length : 0;

        while (++ownIndex < length) {
          index = ownProps[ownIndex];
          if (callback(iterable[index], index, collection) === false) return result;
        }
      return result
    };

    /**
     * This method is like `_.forOwn` except that it iterates over elements
     * of a `collection` in the opposite order.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns `object`.
     * @example
     *
     * _.forOwnRight({ '0': 'zero', '1': 'one', 'length': 2 }, function(num, key) {
     *   console.log(key);
     * });
     * // => logs 'length', '1', and '0' assuming `_.forOwn` logs '0', '1', and 'length'
     */
    function forOwnRight(object, callback, thisArg) {
      var props = keys(object),
          length = props.length;

      callback = baseCreateCallback(callback, thisArg, 3);
      while (length--) {
        var key = props[length];
        if (callback(object[key], key, object) === false) {
          break;
        }
      }
      return object;
    }

    /**
     * Creates a sorted array of property names of all enumerable properties,
     * own and inherited, of `object` that have function values.
     *
     * @static
     * @memberOf _
     * @alias methods
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property names that have function values.
     * @example
     *
     * _.functions(_);
     * // => ['all', 'any', 'bind', 'bindAll', 'clone', 'compact', 'compose', ...]
     */
    function functions(object) {
      var result = [];
      forIn(object, function(value, key) {
        if (isFunction(value)) {
          result.push(key);
        }
      });
      return result.sort();
    }

    /**
     * Checks if the specified property name exists as a direct property of `object`,
     * instead of an inherited property.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to check.
     * @returns {boolean} Returns `true` if key is a direct property, else `false`.
     * @example
     *
     * _.has({ 'a': 1, 'b': 2, 'c': 3 }, 'b');
     * // => true
     */
    function has(object, key) {
      return object ? hasOwnProperty.call(object, key) : false;
    }

    /**
     * Creates an object composed of the inverted keys and values of the given object.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to invert.
     * @returns {Object} Returns the created inverted object.
     * @example
     *
     * _.invert({ 'first': 'fred', 'second': 'barney' });
     * // => { 'fred': 'first', 'barney': 'second' }
     */
    function invert(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = {};

      while (++index < length) {
        var key = props[index];
        result[object[key]] = key;
      }
      return result;
    }

    /**
     * Checks if `value` is a boolean value.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a boolean value, else `false`.
     * @example
     *
     * _.isBoolean(null);
     * // => false
     */
    function isBoolean(value) {
      return value === true || value === false ||
        value && typeof value == 'object' && toString.call(value) == boolClass || false;
    }

    /**
     * Checks if `value` is a date.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a date, else `false`.
     * @example
     *
     * _.isDate(new Date);
     * // => true
     */
    function isDate(value) {
      return value && typeof value == 'object' && toString.call(value) == dateClass || false;
    }

    /**
     * Checks if `value` is a DOM element.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a DOM element, else `false`.
     * @example
     *
     * _.isElement(document.body);
     * // => true
     */
    function isElement(value) {
      return value && value.nodeType === 1 || false;
    }

    /**
     * Checks if `value` is empty. Arrays, strings, or `arguments` objects with a
     * length of `0` and objects with no own enumerable properties are considered
     * "empty".
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object|string} value The value to inspect.
     * @returns {boolean} Returns `true` if the `value` is empty, else `false`.
     * @example
     *
     * _.isEmpty([1, 2, 3]);
     * // => false
     *
     * _.isEmpty({});
     * // => true
     *
     * _.isEmpty('');
     * // => true
     */
    function isEmpty(value) {
      var result = true;
      if (!value) {
        return result;
      }
      var className = toString.call(value),
          length = value.length;

      if ((className == arrayClass || className == stringClass || className == argsClass ) ||
          (className == objectClass && typeof length == 'number' && isFunction(value.splice))) {
        return !length;
      }
      forOwn(value, function() {
        return (result = false);
      });
      return result;
    }

    /**
     * Performs a deep comparison between two values to determine if they are
     * equivalent to each other. If a callback is provided it will be executed
     * to compare values. If the callback returns `undefined` comparisons will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (a, b).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} a The value to compare.
     * @param {*} b The other value to compare.
     * @param {Function} [callback] The function to customize comparing values.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var copy = { 'name': 'fred' };
     *
     * object == copy;
     * // => false
     *
     * _.isEqual(object, copy);
     * // => true
     *
     * var words = ['hello', 'goodbye'];
     * var otherWords = ['hi', 'goodbye'];
     *
     * _.isEqual(words, otherWords, function(a, b) {
     *   var reGreet = /^(?:hello|hi)$/i,
     *       aGreet = _.isString(a) && reGreet.test(a),
     *       bGreet = _.isString(b) && reGreet.test(b);
     *
     *   return (aGreet || bGreet) ? (aGreet == bGreet) : undefined;
     * });
     * // => true
     */
    function isEqual(a, b, callback, thisArg) {
      return baseIsEqual(a, b, typeof callback == 'function' && baseCreateCallback(callback, thisArg, 2));
    }

    /**
     * Checks if `value` is, or can be coerced to, a finite number.
     *
     * Note: This is not the same as native `isFinite` which will return true for
     * booleans and empty strings. See http://es5.github.io/#x15.1.2.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is finite, else `false`.
     * @example
     *
     * _.isFinite(-101);
     * // => true
     *
     * _.isFinite('10');
     * // => true
     *
     * _.isFinite(true);
     * // => false
     *
     * _.isFinite('');
     * // => false
     *
     * _.isFinite(Infinity);
     * // => false
     */
    function isFinite(value) {
      return nativeIsFinite(value) && !nativeIsNaN(parseFloat(value));
    }

    /**
     * Checks if `value` is a function.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a function, else `false`.
     * @example
     *
     * _.isFunction(_);
     * // => true
     */
    function isFunction(value) {
      return typeof value == 'function';
    }

    /**
     * Checks if `value` is the language type of Object.
     * (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(1);
     * // => false
     */
    function isObject(value) {
      // check if the value is the ECMAScript language type of Object
      // http://es5.github.io/#x8
      // and avoid a V8 bug
      // http://code.google.com/p/v8/issues/detail?id=2291
      return !!(value && objectTypes[typeof value]);
    }

    /**
     * Checks if `value` is `NaN`.
     *
     * Note: This is not the same as native `isNaN` which will return `true` for
     * `undefined` and other non-numeric values. See http://es5.github.io/#x15.1.2.4.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `NaN`, else `false`.
     * @example
     *
     * _.isNaN(NaN);
     * // => true
     *
     * _.isNaN(new Number(NaN));
     * // => true
     *
     * isNaN(undefined);
     * // => true
     *
     * _.isNaN(undefined);
     * // => false
     */
    function isNaN(value) {
      // `NaN` as a primitive is the only value that is not equal to itself
      // (perform the [[Class]] check first to avoid errors with some host objects in IE)
      return isNumber(value) && value != +value;
    }

    /**
     * Checks if `value` is `null`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `null`, else `false`.
     * @example
     *
     * _.isNull(null);
     * // => true
     *
     * _.isNull(undefined);
     * // => false
     */
    function isNull(value) {
      return value === null;
    }

    /**
     * Checks if `value` is a number.
     *
     * Note: `NaN` is considered a number. See http://es5.github.io/#x8.5.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a number, else `false`.
     * @example
     *
     * _.isNumber(8.4 * 5);
     * // => true
     */
    function isNumber(value) {
      return typeof value == 'number' ||
        value && typeof value == 'object' && toString.call(value) == numberClass || false;
    }

    /**
     * Checks if `value` is an object created by the `Object` constructor.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a plain object, else `false`.
     * @example
     *
     * function Shape() {
     *   this.x = 0;
     *   this.y = 0;
     * }
     *
     * _.isPlainObject(new Shape);
     * // => false
     *
     * _.isPlainObject([1, 2, 3]);
     * // => false
     *
     * _.isPlainObject({ 'x': 0, 'y': 0 });
     * // => true
     */
    var isPlainObject = !getPrototypeOf ? shimIsPlainObject : function(value) {
      if (!(value && toString.call(value) == objectClass)) {
        return false;
      }
      var valueOf = value.valueOf,
          objProto = isNative(valueOf) && (objProto = getPrototypeOf(valueOf)) && getPrototypeOf(objProto);

      return objProto
        ? (value == objProto || getPrototypeOf(value) == objProto)
        : shimIsPlainObject(value);
    };

    /**
     * Checks if `value` is a regular expression.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a regular expression, else `false`.
     * @example
     *
     * _.isRegExp(/fred/);
     * // => true
     */
    function isRegExp(value) {
      return value && typeof value == 'object' && toString.call(value) == regexpClass || false;
    }

    /**
     * Checks if `value` is a string.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is a string, else `false`.
     * @example
     *
     * _.isString('fred');
     * // => true
     */
    function isString(value) {
      return typeof value == 'string' ||
        value && typeof value == 'object' && toString.call(value) == stringClass || false;
    }

    /**
     * Checks if `value` is `undefined`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if the `value` is `undefined`, else `false`.
     * @example
     *
     * _.isUndefined(void 0);
     * // => true
     */
    function isUndefined(value) {
      return typeof value == 'undefined';
    }

    /**
     * Creates an object with the same keys as `object` and values generated by
     * running each own enumerable property of `object` through the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new object with values of the results of each `callback` execution.
     * @example
     *
     * _.mapValues({ 'a': 1, 'b': 2, 'c': 3} , function(num) { return num * 3; });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     *
     * var characters = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // using "_.pluck" callback shorthand
     * _.mapValues(characters, 'age');
     * // => { 'fred': 40, 'pebbles': 1 }
     */
    function mapValues(object, callback, thisArg) {
      var result = {};
      callback = lodash.createCallback(callback, thisArg, 3);

      forOwn(object, function(value, key, object) {
        result[key] = callback(value, key, object);
      });
      return result;
    }

    /**
     * Recursively merges own enumerable properties of the source object(s), that
     * don't resolve to `undefined` into the destination object. Subsequent sources
     * will overwrite property assignments of previous sources. If a callback is
     * provided it will be executed to produce the merged values of the destination
     * and source properties. If the callback returns `undefined` merging will
     * be handled by the method instead. The callback is bound to `thisArg` and
     * invoked with two arguments; (objectValue, sourceValue).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The destination object.
     * @param {...Object} [source] The source objects.
     * @param {Function} [callback] The function to customize merging properties.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the destination object.
     * @example
     *
     * var names = {
     *   'characters': [
     *     { 'name': 'barney' },
     *     { 'name': 'fred' }
     *   ]
     * };
     *
     * var ages = {
     *   'characters': [
     *     { 'age': 36 },
     *     { 'age': 40 }
     *   ]
     * };
     *
     * _.merge(names, ages);
     * // => { 'characters': [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred', 'age': 40 }] }
     *
     * var food = {
     *   'fruits': ['apple'],
     *   'vegetables': ['beet']
     * };
     *
     * var otherFood = {
     *   'fruits': ['banana'],
     *   'vegetables': ['carrot']
     * };
     *
     * _.merge(food, otherFood, function(a, b) {
     *   return _.isArray(a) ? a.concat(b) : undefined;
     * });
     * // => { 'fruits': ['apple', 'banana'], 'vegetables': ['beet', 'carrot] }
     */
    function merge(object) {
      var args = arguments,
          length = 2;

      if (!isObject(object)) {
        return object;
      }
      // allows working with `_.reduce` and `_.reduceRight` without using
      // their `index` and `collection` arguments
      if (typeof args[2] != 'number') {
        length = args.length;
      }
      if (length > 3 && typeof args[length - 2] == 'function') {
        var callback = baseCreateCallback(args[--length - 1], args[length--], 2);
      } else if (length > 2 && typeof args[length - 1] == 'function') {
        callback = args[--length];
      }
      var sources = slice(arguments, 1, length),
          index = -1,
          stackA = getArray(),
          stackB = getArray();

      while (++index < length) {
        baseMerge(object, sources[index], callback, stackA, stackB);
      }
      releaseArray(stackA);
      releaseArray(stackB);
      return object;
    }

    /**
     * Creates a shallow clone of `object` excluding the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` omitting the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The properties to omit or the
     *  function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object without the omitted properties.
     * @example
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, 'age');
     * // => { 'name': 'fred' }
     *
     * _.omit({ 'name': 'fred', 'age': 40 }, function(value) {
     *   return typeof value == 'number';
     * });
     * // => { 'name': 'fred' }
     */
    function omit(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var props = [];
        forIn(object, function(value, key) {
          props.push(key);
        });
        props = baseDifference(props, baseFlatten(arguments, true, false, 1));

        var index = -1,
            length = props.length;

        while (++index < length) {
          var key = props[index];
          result[key] = object[key];
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (!callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * Creates a two dimensional array of an object's key-value pairs,
     * i.e. `[[key1, value1], [key2, value2]]`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns new array of key-value pairs.
     * @example
     *
     * _.pairs({ 'barney': 36, 'fred': 40 });
     * // => [['barney', 36], ['fred', 40]] (property order is not guaranteed across environments)
     */
    function pairs(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        var key = props[index];
        result[index] = [key, object[key]];
      }
      return result;
    }

    /**
     * Creates a shallow clone of `object` composed of the specified properties.
     * Property names may be specified as individual arguments or as arrays of
     * property names. If a callback is provided it will be executed for each
     * property of `object` picking the properties the callback returns truey
     * for. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, key, object).
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The source object.
     * @param {Function|...string|string[]} [callback] The function called per
     *  iteration or property names to pick, specified as individual property
     *  names or arrays of property names.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns an object composed of the picked properties.
     * @example
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, 'name');
     * // => { 'name': 'fred' }
     *
     * _.pick({ 'name': 'fred', '_userid': 'fred1' }, function(value, key) {
     *   return key.charAt(0) != '_';
     * });
     * // => { 'name': 'fred' }
     */
    function pick(object, callback, thisArg) {
      var result = {};
      if (typeof callback != 'function') {
        var index = -1,
            props = baseFlatten(arguments, true, false, 1),
            length = isObject(object) ? props.length : 0;

        while (++index < length) {
          var key = props[index];
          if (key in object) {
            result[key] = object[key];
          }
        }
      } else {
        callback = lodash.createCallback(callback, thisArg, 3);
        forIn(object, function(value, key, object) {
          if (callback(value, key, object)) {
            result[key] = value;
          }
        });
      }
      return result;
    }

    /**
     * An alternative to `_.reduce` this method transforms `object` to a new
     * `accumulator` object which is the result of running each of its own
     * enumerable properties through a callback, with each callback execution
     * potentially mutating the `accumulator` object. The callback is bound to
     * `thisArg` and invoked with four arguments; (accumulator, value, key, object).
     * Callbacks may exit iteration early by explicitly returning `false`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Array|Object} object The object to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] The custom accumulator value.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var squares = _.transform([1, 2, 3, 4, 5, 6, 7, 8, 9, 10], function(result, num) {
     *   num *= num;
     *   if (num % 2) {
     *     return result.push(num) < 3;
     *   }
     * });
     * // => [1, 9, 25]
     *
     * var mapped = _.transform({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     * });
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function transform(object, callback, accumulator, thisArg) {
      var isArr = isArray(object);
      if (accumulator == null) {
        if (isArr) {
          accumulator = [];
        } else {
          var ctor = object && object.constructor,
              proto = ctor && ctor.prototype;

          accumulator = baseCreate(proto);
        }
      }
      if (callback) {
        callback = lodash.createCallback(callback, thisArg, 4);
        (isArr ? forEach : forOwn)(object, function(value, index, object) {
          return callback(accumulator, value, index, object);
        });
      }
      return accumulator;
    }

    /**
     * Creates an array composed of the own enumerable property values of `object`.
     *
     * @static
     * @memberOf _
     * @category Objects
     * @param {Object} object The object to inspect.
     * @returns {Array} Returns an array of property values.
     * @example
     *
     * _.values({ 'one': 1, 'two': 2, 'three': 3 });
     * // => [1, 2, 3] (property order is not guaranteed across environments)
     */
    function values(object) {
      var index = -1,
          props = keys(object),
          length = props.length,
          result = Array(length);

      while (++index < length) {
        result[index] = object[props[index]];
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array of elements from the specified indexes, or keys, of the
     * `collection`. Indexes may be specified as individual arguments or as arrays
     * of indexes.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {...(number|number[]|string|string[])} [index] The indexes of `collection`
     *   to retrieve, specified as individual indexes or arrays of indexes.
     * @returns {Array} Returns a new array of elements corresponding to the
     *  provided indexes.
     * @example
     *
     * _.at(['a', 'b', 'c', 'd', 'e'], [0, 2, 4]);
     * // => ['a', 'c', 'e']
     *
     * _.at(['fred', 'barney', 'pebbles'], 0, 2);
     * // => ['fred', 'pebbles']
     */
    function at(collection) {
      var args = arguments,
          index = -1,
          props = baseFlatten(args, true, false, 1),
          length = (args[2] && args[2][args[1]] === collection) ? 1 : props.length,
          result = Array(length);

      while(++index < length) {
        result[index] = collection[props[index]];
      }
      return result;
    }

    /**
     * Checks if a given value is present in a collection using strict equality
     * for comparisons, i.e. `===`. If `fromIndex` is negative, it is used as the
     * offset from the end of the collection.
     *
     * @static
     * @memberOf _
     * @alias include
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {*} target The value to check for.
     * @param {number} [fromIndex=0] The index to search from.
     * @returns {boolean} Returns `true` if the `target` element is found, else `false`.
     * @example
     *
     * _.contains([1, 2, 3], 1);
     * // => true
     *
     * _.contains([1, 2, 3], 1, 2);
     * // => false
     *
     * _.contains({ 'name': 'fred', 'age': 40 }, 'fred');
     * // => true
     *
     * _.contains('pebbles', 'eb');
     * // => true
     */
    function contains(collection, target, fromIndex) {
      var index = -1,
          indexOf = getIndexOf(),
          length = collection ? collection.length : 0,
          result = false;

      fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex) || 0;
      if (isArray(collection)) {
        result = indexOf(collection, target, fromIndex) > -1;
      } else if (typeof length == 'number') {
        result = (isString(collection) ? collection.indexOf(target, fromIndex) : indexOf(collection, target, fromIndex)) > -1;
      } else {
        forOwn(collection, function(value) {
          if (++index >= fromIndex) {
            return !(result = value === target);
          }
        });
      }
      return result;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of `collection` through the callback. The corresponding value
     * of each key is the number of times the key was returned by the callback.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy([4.3, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': 1, '6': 2 }
     *
     * _.countBy(['one', 'two', 'three'], 'length');
     * // => { '3': 2, '5': 1 }
     */
    var countBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key]++ : result[key] = 1);
    });

    /**
     * Checks if the given callback returns truey value for **all** elements of
     * a collection. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias all
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if all elements passed the callback check,
     *  else `false`.
     * @example
     *
     * _.every([true, 1, null, 'yes']);
     * // => false
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.every(characters, 'age');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.every(characters, { 'age': 36 });
     * // => false
     */
    function every(collection, callback, thisArg) {
      var result = true;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if (!(result = !!callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return (result = !!callback(value, index, collection));
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning an array of all elements
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias select
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that passed the callback check.
     * @example
     *
     * var evens = _.filter([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [2, 4, 6]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.filter(characters, 'blocked');
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     *
     * // using "_.where" callback shorthand
     * _.filter(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     */
    function filter(collection, callback, thisArg) {
      var result = [];
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            result.push(value);
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result.push(value);
          }
        });
      }
      return result;
    }

    /**
     * Iterates over elements of a collection, returning the first element that
     * the callback returns truey for. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias detect, findWhere
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.find(characters, function(chr) {
     *   return chr.age < 40;
     * });
     * // => { 'name': 'barney', 'age': 36, 'blocked': false }
     *
     * // using "_.where" callback shorthand
     * _.find(characters, { 'age': 1 });
     * // =>  { 'name': 'pebbles', 'age': 1, 'blocked': false }
     *
     * // using "_.pluck" callback shorthand
     * _.find(characters, 'blocked');
     * // => { 'name': 'fred', 'age': 40, 'blocked': true }
     */
    function find(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          var value = collection[index];
          if (callback(value, index, collection)) {
            return value;
          }
        }
      } else {
        var result;
        forOwn(collection, function(value, index, collection) {
          if (callback(value, index, collection)) {
            result = value;
            return false;
          }
        });
        return result;
      }
    }

    /**
     * This method is like `_.find` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the found element, else `undefined`.
     * @example
     *
     * _.findLast([1, 2, 3, 4], function(num) {
     *   return num % 2 == 1;
     * });
     * // => 3
     */
    function findLast(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);
      forEachRight(collection, function(value, index, collection) {
        if (callback(value, index, collection)) {
          result = value;
          return false;
        }
      });
      return result;
    }

    /**
     * Iterates over elements of a collection, executing the callback for each
     * element. The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection). Callbacks may exit iteration early by
     * explicitly returning `false`.
     *
     * Note: As with other "Collections" methods, objects with a `length` property
     * are iterated like arrays. To avoid this behavior `_.forIn` or `_.forOwn`
     * may be used for object iteration.
     *
     * @static
     * @memberOf _
     * @alias each
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEach(function(num) { console.log(num); }).join(',');
     * // => logs each number and returns '1,2,3'
     *
     * _.forEach({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { console.log(num); });
     * // => logs each number and returns the object (property order is not guaranteed across environments)
     */
    function forEach(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (++index < length) {
          if (callback(collection[index], index, collection) === false) {
            break;
          }
        }
      } else {
        forOwn(collection, callback);
      }
      return collection;
    }

    /**
     * This method is like `_.forEach` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias eachRight
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array|Object|string} Returns `collection`.
     * @example
     *
     * _([1, 2, 3]).forEachRight(function(num) { console.log(num); }).join(',');
     * // => logs each number from right to left and returns '3,2,1'
     */
    function forEachRight(collection, callback, thisArg) {
      var length = collection ? collection.length : 0;
      callback = callback && typeof thisArg == 'undefined' ? callback : baseCreateCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        while (length--) {
          if (callback(collection[length], length, collection) === false) {
            break;
          }
        }
      } else {
        var props = keys(collection);
        length = props.length;
        forOwn(collection, function(value, key, collection) {
          key = props ? props[--length] : --length;
          return callback(collection[key], key, collection);
        });
      }
      return collection;
    }

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of a collection through the callback. The corresponding value
     * of each key is an array of the elements responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return Math.floor(num); });
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * _.groupBy([4.2, 6.1, 6.4], function(num) { return this.floor(num); }, Math);
     * // => { '4': [4.2], '6': [6.1, 6.4] }
     *
     * // using "_.pluck" callback shorthand
     * _.groupBy(['one', 'two', 'three'], 'length');
     * // => { '3': ['one', 'two'], '5': ['three'] }
     */
    var groupBy = createAggregator(function(result, value, key) {
      (hasOwnProperty.call(result, key) ? result[key] : result[key] = []).push(value);
    });

    /**
     * Creates an object composed of keys generated from the results of running
     * each element of the collection through the given callback. The corresponding
     * value of each key is the last element responsible for generating the key.
     * The callback is bound to `thisArg` and invoked with three arguments;
     * (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Object} Returns the composed aggregate object.
     * @example
     *
     * var keys = [
     *   { 'dir': 'left', 'code': 97 },
     *   { 'dir': 'right', 'code': 100 }
     * ];
     *
     * _.indexBy(keys, 'dir');
     * // => { 'left': { 'dir': 'left', 'code': 97 }, 'right': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(keys, function(key) { return String.fromCharCode(key.code); });
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     *
     * _.indexBy(characters, function(key) { this.fromCharCode(key.code); }, String);
     * // => { 'a': { 'dir': 'left', 'code': 97 }, 'd': { 'dir': 'right', 'code': 100 } }
     */
    var indexBy = createAggregator(function(result, value, key) {
      result[key] = value;
    });

    /**
     * Invokes the method named by `methodName` on each element in the `collection`
     * returning an array of the results of each invoked method. Additional arguments
     * will be provided to each invoked method. If `methodName` is a function it
     * will be invoked for, and `this` bound to, each element in the `collection`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|string} methodName The name of the method to invoke or
     *  the function invoked per iteration.
     * @param {...*} [arg] Arguments to invoke the method with.
     * @returns {Array} Returns a new array of the results of each invoked method.
     * @example
     *
     * _.invoke([[5, 1, 7], [3, 2, 1]], 'sort');
     * // => [[1, 5, 7], [1, 2, 3]]
     *
     * _.invoke([123, 456], String.prototype.split, '');
     * // => [['1', '2', '3'], ['4', '5', '6']]
     */
    function invoke(collection, methodName) {
      var args = slice(arguments, 2),
          index = -1,
          isFunc = typeof methodName == 'function',
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        result[++index] = (isFunc ? methodName : value[methodName]).apply(value, args);
      });
      return result;
    }

    /**
     * Creates an array of values by running each element in the collection
     * through the callback. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias collect
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of the results of each `callback` execution.
     * @example
     *
     * _.map([1, 2, 3], function(num) { return num * 3; });
     * // => [3, 6, 9]
     *
     * _.map({ 'one': 1, 'two': 2, 'three': 3 }, function(num) { return num * 3; });
     * // => [3, 6, 9] (property order is not guaranteed across environments)
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(characters, 'name');
     * // => ['barney', 'fred']
     */
    function map(collection, callback, thisArg) {
      var index = -1,
          length = collection ? collection.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      if (typeof length == 'number') {
        var result = Array(length);
        while (++index < length) {
          result[index] = callback(collection[index], index, collection);
        }
      } else {
        result = [];
        forOwn(collection, function(value, key, collection) {
          result[++index] = callback(value, key, collection);
        });
      }
      return result;
    }

    /**
     * Retrieves the maximum value of a collection. If the collection is empty or
     * falsey `-Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the maximum value.
     * @example
     *
     * _.max([4, 2, 8, 6]);
     * // => 8
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.max(characters, function(chr) { return chr.age; });
     * // => { 'name': 'fred', 'age': 40 };
     *
     * // using "_.pluck" callback shorthand
     * _.max(characters, 'age');
     * // => { 'name': 'fred', 'age': 40 };
     */
    function max(collection, callback, thisArg) {
      var computed = -Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value > result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current > computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the minimum value of a collection. If the collection is empty or
     * falsey `Infinity` is returned. If a callback is provided it will be executed
     * for each value in the collection to generate the criterion by which the value
     * is ranked. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the minimum value.
     * @example
     *
     * _.min([4, 2, 8, 6]);
     * // => 2
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.min(characters, function(chr) { return chr.age; });
     * // => { 'name': 'barney', 'age': 36 };
     *
     * // using "_.pluck" callback shorthand
     * _.min(characters, 'age');
     * // => { 'name': 'barney', 'age': 36 };
     */
    function min(collection, callback, thisArg) {
      var computed = Infinity,
          result = computed;

      // allows working with functions like `_.map` without using
      // their `index` argument as a callback
      if (typeof callback != 'function' && thisArg && thisArg[callback] === collection) {
        callback = null;
      }
      if (callback == null && isArray(collection)) {
        var index = -1,
            length = collection.length;

        while (++index < length) {
          var value = collection[index];
          if (value < result) {
            result = value;
          }
        }
      } else {
        callback = (callback == null && isString(collection))
          ? charAtCallback
          : lodash.createCallback(callback, thisArg, 3);

        forEach(collection, function(value, index, collection) {
          var current = callback(value, index, collection);
          if (current < computed) {
            computed = current;
            result = value;
          }
        });
      }
      return result;
    }

    /**
     * Retrieves the value of a specified property from all elements in the collection.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {string} property The name of the property to pluck.
     * @returns {Array} Returns a new array of property values.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * _.pluck(characters, 'name');
     * // => ['barney', 'fred']
     */
    var pluck = map;

    /**
     * Reduces a collection to a value which is the accumulated result of running
     * each element in the collection through the callback, where each successive
     * callback execution consumes the return value of the previous execution. If
     * `accumulator` is not provided the first element of the collection will be
     * used as the initial `accumulator` value. The callback is bound to `thisArg`
     * and invoked with four arguments; (accumulator, value, index|key, collection).
     *
     * @static
     * @memberOf _
     * @alias foldl, inject
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var sum = _.reduce([1, 2, 3], function(sum, num) {
     *   return sum + num;
     * });
     * // => 6
     *
     * var mapped = _.reduce({ 'a': 1, 'b': 2, 'c': 3 }, function(result, num, key) {
     *   result[key] = num * 3;
     *   return result;
     * }, {});
     * // => { 'a': 3, 'b': 6, 'c': 9 }
     */
    function reduce(collection, callback, accumulator, thisArg) {
      if (!collection) return accumulator;
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);

      var index = -1,
          length = collection.length;

      if (typeof length == 'number') {
        if (noaccum) {
          accumulator = collection[++index];
        }
        while (++index < length) {
          accumulator = callback(accumulator, collection[index], index, collection);
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          accumulator = noaccum
            ? (noaccum = false, value)
            : callback(accumulator, value, index, collection)
        });
      }
      return accumulator;
    }

    /**
     * This method is like `_.reduce` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * @static
     * @memberOf _
     * @alias foldr
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function} [callback=identity] The function called per iteration.
     * @param {*} [accumulator] Initial value of the accumulator.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the accumulated value.
     * @example
     *
     * var list = [[0, 1], [2, 3], [4, 5]];
     * var flat = _.reduceRight(list, function(a, b) { return a.concat(b); }, []);
     * // => [4, 5, 2, 3, 0, 1]
     */
    function reduceRight(collection, callback, accumulator, thisArg) {
      var noaccum = arguments.length < 3;
      callback = lodash.createCallback(callback, thisArg, 4);
      forEachRight(collection, function(value, index, collection) {
        accumulator = noaccum
          ? (noaccum = false, value)
          : callback(accumulator, value, index, collection);
      });
      return accumulator;
    }

    /**
     * The opposite of `_.filter` this method returns the elements of a
     * collection that the callback does **not** return truey for.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of elements that failed the callback check.
     * @example
     *
     * var odds = _.reject([1, 2, 3, 4, 5, 6], function(num) { return num % 2 == 0; });
     * // => [1, 3, 5]
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.reject(characters, 'blocked');
     * // => [{ 'name': 'barney', 'age': 36, 'blocked': false }]
     *
     * // using "_.where" callback shorthand
     * _.reject(characters, { 'age': 36 });
     * // => [{ 'name': 'fred', 'age': 40, 'blocked': true }]
     */
    function reject(collection, callback, thisArg) {
      callback = lodash.createCallback(callback, thisArg, 3);
      return filter(collection, function(value, index, collection) {
        return !callback(value, index, collection);
      });
    }

    /**
     * Retrieves a random element or `n` random elements from a collection.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to sample.
     * @param {number} [n] The number of elements to sample.
     * @param- {Object} [guard] Allows working with functions like `_.map`
     *  without using their `index` arguments as `n`.
     * @returns {Array} Returns the random sample(s) of `collection`.
     * @example
     *
     * _.sample([1, 2, 3, 4]);
     * // => 2
     *
     * _.sample([1, 2, 3, 4], 2);
     * // => [3, 1]
     */
    function sample(collection, n, guard) {
      if (collection && typeof collection.length != 'number') {
        collection = values(collection);
      }
      if (n == null || guard) {
        return collection ? collection[baseRandom(0, collection.length - 1)] : undefined;
      }
      var result = shuffle(collection);
      result.length = nativeMin(nativeMax(0, n), result.length);
      return result;
    }

    /**
     * Creates an array of shuffled values, using a version of the Fisher-Yates
     * shuffle. See http://en.wikipedia.org/wiki/Fisher-Yates_shuffle.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to shuffle.
     * @returns {Array} Returns a new shuffled collection.
     * @example
     *
     * _.shuffle([1, 2, 3, 4, 5, 6]);
     * // => [4, 1, 6, 3, 5, 2]
     */
    function shuffle(collection) {
      var index = -1,
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      forEach(collection, function(value) {
        var rand = baseRandom(0, ++index);
        result[index] = result[rand];
        result[rand] = value;
      });
      return result;
    }

    /**
     * Gets the size of the `collection` by returning `collection.length` for arrays
     * and array-like objects or the number of own enumerable properties for objects.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to inspect.
     * @returns {number} Returns `collection.length` or number of own enumerable properties.
     * @example
     *
     * _.size([1, 2]);
     * // => 2
     *
     * _.size({ 'one': 1, 'two': 2, 'three': 3 });
     * // => 3
     *
     * _.size('pebbles');
     * // => 7
     */
    function size(collection) {
      var length = collection ? collection.length : 0;
      return typeof length == 'number' ? length : keys(collection).length;
    }

    /**
     * Checks if the callback returns a truey value for **any** element of a
     * collection. The function returns as soon as it finds a passing value and
     * does not iterate over the entire collection. The callback is bound to
     * `thisArg` and invoked with three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias any
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {boolean} Returns `true` if any element passed the callback check,
     *  else `false`.
     * @example
     *
     * _.some([null, 0, 'yes', false], Boolean);
     * // => true
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'blocked': false },
     *   { 'name': 'fred',   'age': 40, 'blocked': true }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.some(characters, 'blocked');
     * // => true
     *
     * // using "_.where" callback shorthand
     * _.some(characters, { 'age': 1 });
     * // => false
     */
    function some(collection, callback, thisArg) {
      var result;
      callback = lodash.createCallback(callback, thisArg, 3);

      var index = -1,
          length = collection ? collection.length : 0;

      if (typeof length == 'number') {
        while (++index < length) {
          if ((result = callback(collection[index], index, collection))) {
            break;
          }
        }
      } else {
        forOwn(collection, function(value, index, collection) {
          return !(result = callback(value, index, collection));
        });
      }
      return !!result;
    }

    /**
     * Creates an array of elements, sorted in ascending order by the results of
     * running each element in a collection through the callback. This method
     * performs a stable sort, that is, it will preserve the original sort order
     * of equal elements. The callback is bound to `thisArg` and invoked with
     * three arguments; (value, index|key, collection).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an array of property names is provided for `callback` the collection
     * will be sorted by each property value.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Array|Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of sorted elements.
     * @example
     *
     * _.sortBy([1, 2, 3], function(num) { return Math.sin(num); });
     * // => [3, 1, 2]
     *
     * _.sortBy([1, 2, 3], function(num) { return this.sin(num); }, Math);
     * // => [3, 1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'barney',  'age': 26 },
     *   { 'name': 'fred',    'age': 30 }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.map(_.sortBy(characters, 'age'), _.values);
     * // => [['barney', 26], ['fred', 30], ['barney', 36], ['fred', 40]]
     *
     * // sorting by multiple properties
     * _.map(_.sortBy(characters, ['name', 'age']), _.values);
     * // = > [['barney', 26], ['barney', 36], ['fred', 30], ['fred', 40]]
     */
    function sortBy(collection, callback, thisArg) {
      var index = -1,
          isArr = isArray(callback),
          length = collection ? collection.length : 0,
          result = Array(typeof length == 'number' ? length : 0);

      if (!isArr) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      forEach(collection, function(value, key, collection) {
        var object = result[++index] = getObject();
        if (isArr) {
          object.criteria = map(callback, function(key) { return value[key]; });
        } else {
          (object.criteria = getArray())[0] = callback(value, key, collection);
        }
        object.index = index;
        object.value = value;
      });

      length = result.length;
      result.sort(compareAscending);
      while (length--) {
        var object = result[length];
        result[length] = object.value;
        if (!isArr) {
          releaseArray(object.criteria);
        }
        releaseObject(object);
      }
      return result;
    }

    /**
     * Converts the `collection` to an array.
     *
     * @static
     * @memberOf _
     * @category Collections
     * @param {Array|Object|string} collection The collection to convert.
     * @returns {Array} Returns the new converted array.
     * @example
     *
     * (function() { return _.toArray(arguments).slice(1); })(1, 2, 3, 4);
     * // => [2, 3, 4]
     */
    function toArray(collection) {
      if (collection && typeof collection.length == 'number') {
        return slice(collection);
      }
      return values(collection);
    }

    /**
     * Performs a deep comparison of each element in a `collection` to the given
     * `properties` object, returning an array of all elements that have equivalent
     * property values.
     *
     * @static
     * @memberOf _
     * @type Function
     * @category Collections
     * @param {Array|Object|string} collection The collection to iterate over.
     * @param {Object} props The object of property values to filter by.
     * @returns {Array} Returns a new array of elements that have the given properties.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * _.where(characters, { 'age': 36 });
     * // => [{ 'name': 'barney', 'age': 36, 'pets': ['hoppy'] }]
     *
     * _.where(characters, { 'pets': ['dino'] });
     * // => [{ 'name': 'fred', 'age': 40, 'pets': ['baby puss', 'dino'] }]
     */
    var where = filter;

    /*--------------------------------------------------------------------------*/

    /**
     * Creates an array with all falsey values removed. The values `false`, `null`,
     * `0`, `""`, `undefined`, and `NaN` are all falsey.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to compact.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.compact([0, 1, false, 2, '', 3]);
     * // => [1, 2, 3]
     */
    function compact(array) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      while (++index < length) {
        var value = array[index];
        if (value) {
          result.push(value);
        }
      }
      return result;
    }

    /**
     * Creates an array excluding all values of the provided arrays using strict
     * equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {...Array} [values] The arrays of values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.difference([1, 2, 3, 4, 5], [5, 2, 10]);
     * // => [1, 3, 4]
     */
    function difference(array) {
      return baseDifference(array, baseFlatten(arguments, true, true, 1));
    }

    /**
     * This method is like `_.find` except that it returns the index of the first
     * element that passes the callback check, instead of the element itself.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': false },
     *   { 'name': 'fred',    'age': 40, 'blocked': true },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': false }
     * ];
     *
     * _.findIndex(characters, function(chr) {
     *   return chr.age < 20;
     * });
     * // => 2
     *
     * // using "_.where" callback shorthand
     * _.findIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findIndex(characters, 'blocked');
     * // => 1
     */
    function findIndex(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0;

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        if (callback(array[index], index, array)) {
          return index;
        }
      }
      return -1;
    }

    /**
     * This method is like `_.findIndex` except that it iterates over elements
     * of a `collection` from right to left.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index of the found element, else `-1`.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36, 'blocked': true },
     *   { 'name': 'fred',    'age': 40, 'blocked': false },
     *   { 'name': 'pebbles', 'age': 1,  'blocked': true }
     * ];
     *
     * _.findLastIndex(characters, function(chr) {
     *   return chr.age > 30;
     * });
     * // => 1
     *
     * // using "_.where" callback shorthand
     * _.findLastIndex(characters, { 'age': 36 });
     * // => 0
     *
     * // using "_.pluck" callback shorthand
     * _.findLastIndex(characters, 'blocked');
     * // => 2
     */
    function findLastIndex(array, callback, thisArg) {
      var length = array ? array.length : 0;
      callback = lodash.createCallback(callback, thisArg, 3);
      while (length--) {
        if (callback(array[length], length, array)) {
          return length;
        }
      }
      return -1;
    }

    /**
     * Gets the first element or first `n` elements of an array. If a callback
     * is provided elements at the beginning of the array are returned as long
     * as the callback returns truey. The callback is bound to `thisArg` and
     * invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias head, take
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the first element(s) of `array`.
     * @example
     *
     * _.first([1, 2, 3]);
     * // => 1
     *
     * _.first([1, 2, 3], 2);
     * // => [1, 2]
     *
     * _.first([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [1, 2]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false, 'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.first(characters, 'blocked');
     * // => [{ 'name': 'barney', 'blocked': true, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.first(characters, { 'employer': 'slate' }), 'name');
     * // => ['barney', 'fred']
     */
    function first(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = -1;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[0] : undefined;
        }
      }
      return slice(array, 0, nativeMin(nativeMax(0, n), length));
    }

    /**
     * Flattens a nested array (the nesting can be to any depth). If `isShallow`
     * is truey, the array will only be flattened a single level. If a callback
     * is provided each element of the array is passed through the callback before
     * flattening. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to flatten.
     * @param {boolean} [isShallow=false] A flag to restrict flattening to a single level.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new flattened array.
     * @example
     *
     * _.flatten([1, [2], [3, [[4]]]]);
     * // => [1, 2, 3, 4];
     *
     * _.flatten([1, [2], [3, [[4]]]], true);
     * // => [1, 2, 3, [[4]]];
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 30, 'pets': ['hoppy'] },
     *   { 'name': 'fred',   'age': 40, 'pets': ['baby puss', 'dino'] }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.flatten(characters, 'pets');
     * // => ['hoppy', 'baby puss', 'dino']
     */
    function flatten(array, isShallow, callback, thisArg) {
      // juggle arguments
      if (typeof isShallow != 'boolean' && isShallow != null) {
        thisArg = callback;
        callback = (typeof isShallow != 'function' && thisArg && thisArg[isShallow] === array) ? null : isShallow;
        isShallow = false;
      }
      if (callback != null) {
        array = map(array, callback, thisArg);
      }
      return baseFlatten(array, isShallow);
    }

    /**
     * Gets the index at which the first occurrence of `value` is found using
     * strict equality for comparisons, i.e. `===`. If the array is already sorted
     * providing `true` for `fromIndex` will run a faster binary search.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {boolean|number} [fromIndex=0] The index to search from or `true`
     *  to perform a binary search on a sorted array.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 1
     *
     * _.indexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 4
     *
     * _.indexOf([1, 1, 2, 2, 3, 3], 2, true);
     * // => 2
     */
    function indexOf(array, value, fromIndex) {
      if (typeof fromIndex == 'number') {
        var length = array ? array.length : 0;
        fromIndex = (fromIndex < 0 ? nativeMax(0, length + fromIndex) : fromIndex || 0);
      } else if (fromIndex) {
        var index = sortedIndex(array, value);
        return array[index] === value ? index : -1;
      }
      return baseIndexOf(array, value, fromIndex);
    }

    /**
     * Gets all but the last element or last `n` elements of an array. If a
     * callback is provided elements at the end of the array are excluded from
     * the result as long as the callback returns truey. The callback is bound
     * to `thisArg` and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.initial([1, 2, 3]);
     * // => [1, 2]
     *
     * _.initial([1, 2, 3], 2);
     * // => [1]
     *
     * _.initial([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [1]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.initial(characters, 'blocked');
     * // => [{ 'name': 'barney',  'blocked': false, 'employer': 'slate' }]
     *
     * // using "_.where" callback shorthand
     * _.pluck(_.initial(characters, { 'employer': 'na' }), 'name');
     * // => ['barney', 'fred']
     */
    function initial(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : callback || n;
      }
      return slice(array, 0, nativeMin(nativeMax(0, length - n), length));
    }

    /**
     * Creates an array of unique values present in all provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of shared values.
     * @example
     *
     * _.intersection([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2]
     */
    function intersection() {
      var args = [],
          argsIndex = -1,
          argsLength = arguments.length,
          caches = getArray(),
          indexOf = getIndexOf(),
          trustIndexOf = indexOf === baseIndexOf,
          seen = getArray();

      while (++argsIndex < argsLength) {
        var value = arguments[argsIndex];
        if (isArray(value) || isArguments(value)) {
          args.push(value);
          caches.push(trustIndexOf && value.length >= largeArraySize &&
            createCache(argsIndex ? args[argsIndex] : seen));
        }
      }
      var array = args[0],
          index = -1,
          length = array ? array.length : 0,
          result = [];

      outer:
      while (++index < length) {
        var cache = caches[0];
        value = array[index];

        if ((cache ? cacheIndexOf(cache, value) : indexOf(seen, value)) < 0) {
          argsIndex = argsLength;
          (cache || seen).push(value);
          while (--argsIndex) {
            cache = caches[argsIndex];
            if ((cache ? cacheIndexOf(cache, value) : indexOf(args[argsIndex], value)) < 0) {
              continue outer;
            }
          }
          result.push(value);
        }
      }
      while (argsLength--) {
        cache = caches[argsLength];
        if (cache) {
          releaseObject(cache);
        }
      }
      releaseArray(caches);
      releaseArray(seen);
      return result;
    }

    /**
     * Gets the last element or last `n` elements of an array. If a callback is
     * provided elements at the end of the array are returned as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback] The function called
     *  per element or the number of elements to return. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {*} Returns the last element(s) of `array`.
     * @example
     *
     * _.last([1, 2, 3]);
     * // => 3
     *
     * _.last([1, 2, 3], 2);
     * // => [2, 3]
     *
     * _.last([1, 2, 3], function(num) {
     *   return num > 1;
     * });
     * // => [2, 3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': false, 'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': true,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true,  'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.last(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.last(characters, { 'employer': 'na' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function last(array, callback, thisArg) {
      var n = 0,
          length = array ? array.length : 0;

      if (typeof callback != 'number' && callback != null) {
        var index = length;
        callback = lodash.createCallback(callback, thisArg, 3);
        while (index-- && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = callback;
        if (n == null || thisArg) {
          return array ? array[length - 1] : undefined;
        }
      }
      return slice(array, nativeMax(0, length - n));
    }

    /**
     * Gets the index at which the last occurrence of `value` is found using strict
     * equality for comparisons, i.e. `===`. If `fromIndex` is negative, it is used
     * as the offset from the end of the collection.
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to search.
     * @param {*} value The value to search for.
     * @param {number} [fromIndex=array.length-1] The index to search from.
     * @returns {number} Returns the index of the matched value or `-1`.
     * @example
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2);
     * // => 4
     *
     * _.lastIndexOf([1, 2, 3, 1, 2, 3], 2, 3);
     * // => 1
     */
    function lastIndexOf(array, value, fromIndex) {
      var index = array ? array.length : 0;
      if (typeof fromIndex == 'number') {
        index = (fromIndex < 0 ? nativeMax(0, index + fromIndex) : nativeMin(fromIndex, index - 1)) + 1;
      }
      while (index--) {
        if (array[index] === value) {
          return index;
        }
      }
      return -1;
    }

    /**
     * Removes all provided values from the given array using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {...*} [value] The values to remove.
     * @returns {Array} Returns `array`.
     * @example
     *
     * var array = [1, 2, 3, 1, 2, 3];
     * _.pull(array, 2, 3);
     * console.log(array);
     * // => [1, 1]
     */
    function pull(array) {
      var args = arguments,
          argsIndex = 0,
          argsLength = args.length,
          length = array ? array.length : 0;

      while (++argsIndex < argsLength) {
        var index = -1,
            value = args[argsIndex];
        while (++index < length) {
          if (array[index] === value) {
            splice.call(array, index--, 1);
            length--;
          }
        }
      }
      return array;
    }

    /**
     * Creates an array of numbers (positive and/or negative) progressing from
     * `start` up to but not including `end`. If `start` is less than `stop` a
     * zero-length range is created unless a negative `step` is specified.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {number} [start=0] The start of the range.
     * @param {number} end The end of the range.
     * @param {number} [step=1] The value to increment or decrement by.
     * @returns {Array} Returns a new range array.
     * @example
     *
     * _.range(4);
     * // => [0, 1, 2, 3]
     *
     * _.range(1, 5);
     * // => [1, 2, 3, 4]
     *
     * _.range(0, 20, 5);
     * // => [0, 5, 10, 15]
     *
     * _.range(0, -4, -1);
     * // => [0, -1, -2, -3]
     *
     * _.range(1, 4, 0);
     * // => [1, 1, 1]
     *
     * _.range(0);
     * // => []
     */
    function range(start, end, step) {
      start = +start || 0;
      step = typeof step == 'number' ? step : (+step || 1);

      if (end == null) {
        end = start;
        start = 0;
      }
      // use `Array(length)` so engines like Chakra and V8 avoid slower modes
      // http://youtu.be/XAqIpGU8ZZk#t=17m25s
      var index = -1,
          length = nativeMax(0, ceil((end - start) / (step || 1))),
          result = Array(length);

      while (++index < length) {
        result[index] = start;
        start += step;
      }
      return result;
    }

    /**
     * Removes all elements from an array that the callback returns truey for
     * and returns an array of removed elements. The callback is bound to `thisArg`
     * and invoked with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to modify.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a new array of removed elements.
     * @example
     *
     * var array = [1, 2, 3, 4, 5, 6];
     * var evens = _.remove(array, function(num) { return num % 2 == 0; });
     *
     * console.log(array);
     * // => [1, 3, 5]
     *
     * console.log(evens);
     * // => [2, 4, 6]
     */
    function remove(array, callback, thisArg) {
      var index = -1,
          length = array ? array.length : 0,
          result = [];

      callback = lodash.createCallback(callback, thisArg, 3);
      while (++index < length) {
        var value = array[index];
        if (callback(value, index, array)) {
          result.push(value);
          splice.call(array, index--, 1);
          length--;
        }
      }
      return result;
    }

    /**
     * The opposite of `_.initial` this method gets all but the first element or
     * first `n` elements of an array. If a callback function is provided elements
     * at the beginning of the array are excluded from the result as long as the
     * callback returns truey. The callback is bound to `thisArg` and invoked
     * with three arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias drop, tail
     * @category Arrays
     * @param {Array} array The array to query.
     * @param {Function|Object|number|string} [callback=1] The function called
     *  per element or the number of elements to exclude. If a property name or
     *  object is provided it will be used to create a "_.pluck" or "_.where"
     *  style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a slice of `array`.
     * @example
     *
     * _.rest([1, 2, 3]);
     * // => [2, 3]
     *
     * _.rest([1, 2, 3], 2);
     * // => [3]
     *
     * _.rest([1, 2, 3], function(num) {
     *   return num < 3;
     * });
     * // => [3]
     *
     * var characters = [
     *   { 'name': 'barney',  'blocked': true,  'employer': 'slate' },
     *   { 'name': 'fred',    'blocked': false,  'employer': 'slate' },
     *   { 'name': 'pebbles', 'blocked': true, 'employer': 'na' }
     * ];
     *
     * // using "_.pluck" callback shorthand
     * _.pluck(_.rest(characters, 'blocked'), 'name');
     * // => ['fred', 'pebbles']
     *
     * // using "_.where" callback shorthand
     * _.rest(characters, { 'employer': 'slate' });
     * // => [{ 'name': 'pebbles', 'blocked': true, 'employer': 'na' }]
     */
    function rest(array, callback, thisArg) {
      if (typeof callback != 'number' && callback != null) {
        var n = 0,
            index = -1,
            length = array ? array.length : 0;

        callback = lodash.createCallback(callback, thisArg, 3);
        while (++index < length && callback(array[index], index, array)) {
          n++;
        }
      } else {
        n = (callback == null || thisArg) ? 1 : nativeMax(0, callback);
      }
      return slice(array, n);
    }

    /**
     * Uses a binary search to determine the smallest index at which a value
     * should be inserted into a given sorted array in order to maintain the sort
     * order of the array. If a callback is provided it will be executed for
     * `value` and each element of `array` to compute their sort ranking. The
     * callback is bound to `thisArg` and invoked with one argument; (value).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to inspect.
     * @param {*} value The value to evaluate.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {number} Returns the index at which `value` should be inserted
     *  into `array`.
     * @example
     *
     * _.sortedIndex([20, 30, 50], 40);
     * // => 2
     *
     * // using "_.pluck" callback shorthand
     * _.sortedIndex([{ 'x': 20 }, { 'x': 30 }, { 'x': 50 }], { 'x': 40 }, 'x');
     * // => 2
     *
     * var dict = {
     *   'wordToNumber': { 'twenty': 20, 'thirty': 30, 'fourty': 40, 'fifty': 50 }
     * };
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return dict.wordToNumber[word];
     * });
     * // => 2
     *
     * _.sortedIndex(['twenty', 'thirty', 'fifty'], 'fourty', function(word) {
     *   return this.wordToNumber[word];
     * }, dict);
     * // => 2
     */
    function sortedIndex(array, value, callback, thisArg) {
      var low = 0,
          high = array ? array.length : low;

      // explicitly reference `identity` for better inlining in Firefox
      callback = callback ? lodash.createCallback(callback, thisArg, 1) : identity;
      value = callback(value);

      while (low < high) {
        var mid = (low + high) >>> 1;
        (callback(array[mid]) < value)
          ? low = mid + 1
          : high = mid;
      }
      return low;
    }

    /**
     * Creates an array of unique values, in order, of the provided arrays using
     * strict equality for comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of combined values.
     * @example
     *
     * _.union([1, 2, 3], [5, 2, 1, 4], [2, 1]);
     * // => [1, 2, 3, 5, 4]
     */
    function union() {
      return baseUniq(baseFlatten(arguments, true, true));
    }

    /**
     * Creates a duplicate-value-free version of an array using strict equality
     * for comparisons, i.e. `===`. If the array is sorted, providing
     * `true` for `isSorted` will use a faster algorithm. If a callback is provided
     * each element of `array` is passed through the callback before uniqueness
     * is computed. The callback is bound to `thisArg` and invoked with three
     * arguments; (value, index, array).
     *
     * If a property name is provided for `callback` the created "_.pluck" style
     * callback will return the property value of the given element.
     *
     * If an object is provided for `callback` the created "_.where" style callback
     * will return `true` for elements that have the properties of the given object,
     * else `false`.
     *
     * @static
     * @memberOf _
     * @alias unique
     * @category Arrays
     * @param {Array} array The array to process.
     * @param {boolean} [isSorted=false] A flag to indicate that `array` is sorted.
     * @param {Function|Object|string} [callback=identity] The function called
     *  per iteration. If a property name or object is provided it will be used
     *  to create a "_.pluck" or "_.where" style callback, respectively.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns a duplicate-value-free array.
     * @example
     *
     * _.uniq([1, 2, 1, 3, 1]);
     * // => [1, 2, 3]
     *
     * _.uniq([1, 1, 2, 2, 3], true);
     * // => [1, 2, 3]
     *
     * _.uniq(['A', 'b', 'C', 'a', 'B', 'c'], function(letter) { return letter.toLowerCase(); });
     * // => ['A', 'b', 'C']
     *
     * _.uniq([1, 2.5, 3, 1.5, 2, 3.5], function(num) { return this.floor(num); }, Math);
     * // => [1, 2.5, 3]
     *
     * // using "_.pluck" callback shorthand
     * _.uniq([{ 'x': 1 }, { 'x': 2 }, { 'x': 1 }], 'x');
     * // => [{ 'x': 1 }, { 'x': 2 }]
     */
    function uniq(array, isSorted, callback, thisArg) {
      // juggle arguments
      if (typeof isSorted != 'boolean' && isSorted != null) {
        thisArg = callback;
        callback = (typeof isSorted != 'function' && thisArg && thisArg[isSorted] === array) ? null : isSorted;
        isSorted = false;
      }
      if (callback != null) {
        callback = lodash.createCallback(callback, thisArg, 3);
      }
      return baseUniq(array, isSorted, callback);
    }

    /**
     * Creates an array excluding all provided values using strict equality for
     * comparisons, i.e. `===`.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {Array} array The array to filter.
     * @param {...*} [value] The values to exclude.
     * @returns {Array} Returns a new array of filtered values.
     * @example
     *
     * _.without([1, 2, 1, 0, 3, 1, 4], 0, 1);
     * // => [2, 3, 4]
     */
    function without(array) {
      return baseDifference(array, slice(arguments, 1));
    }

    /**
     * Creates an array that is the symmetric difference of the provided arrays.
     * See http://en.wikipedia.org/wiki/Symmetric_difference.
     *
     * @static
     * @memberOf _
     * @category Arrays
     * @param {...Array} [array] The arrays to inspect.
     * @returns {Array} Returns an array of values.
     * @example
     *
     * _.xor([1, 2, 3], [5, 2, 1, 4]);
     * // => [3, 5, 4]
     *
     * _.xor([1, 2, 5], [2, 3, 5], [3, 4, 5]);
     * // => [1, 4, 5]
     */
    function xor() {
      var index = -1,
          length = arguments.length;

      while (++index < length) {
        var array = arguments[index];
        if (isArray(array) || isArguments(array)) {
          var result = result
            ? baseUniq(baseDifference(result, array).concat(baseDifference(array, result)))
            : array;
        }
      }
      return result || [];
    }

    /**
     * Creates an array of grouped elements, the first of which contains the first
     * elements of the given arrays, the second of which contains the second
     * elements of the given arrays, and so on.
     *
     * @static
     * @memberOf _
     * @alias unzip
     * @category Arrays
     * @param {...Array} [array] Arrays to process.
     * @returns {Array} Returns a new array of grouped elements.
     * @example
     *
     * _.zip(['fred', 'barney'], [30, 40], [true, false]);
     * // => [['fred', 30, true], ['barney', 40, false]]
     */
    function zip() {
      var array = arguments.length > 1 ? arguments : arguments[0],
          index = -1,
          length = array ? max(pluck(array, 'length')) : 0,
          result = Array(length < 0 ? 0 : length);

      while (++index < length) {
        result[index] = pluck(array, index);
      }
      return result;
    }

    /**
     * Creates an object composed from arrays of `keys` and `values`. Provide
     * either a single two dimensional array, i.e. `[[key1, value1], [key2, value2]]`
     * or two arrays, one of `keys` and one of corresponding `values`.
     *
     * @static
     * @memberOf _
     * @alias object
     * @category Arrays
     * @param {Array} keys The array of keys.
     * @param {Array} [values=[]] The array of values.
     * @returns {Object} Returns an object composed of the given keys and
     *  corresponding values.
     * @example
     *
     * _.zipObject(['fred', 'barney'], [30, 40]);
     * // => { 'fred': 30, 'barney': 40 }
     */
    function zipObject(keys, values) {
      var index = -1,
          length = keys ? keys.length : 0,
          result = {};

      if (!values && length && !isArray(keys[0])) {
        values = [];
      }
      while (++index < length) {
        var key = keys[index];
        if (values) {
          result[key] = values[index];
        } else if (key) {
          result[key[0]] = key[1];
        }
      }
      return result;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that executes `func`, with  the `this` binding and
     * arguments of the created function, only after being called `n` times.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {number} n The number of times the function must be called before
     *  `func` is executed.
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var saves = ['profile', 'settings'];
     *
     * var done = _.after(saves.length, function() {
     *   console.log('Done saving!');
     * });
     *
     * _.forEach(saves, function(type) {
     *   asyncSave({ 'type': type, 'complete': done });
     * });
     * // => logs 'Done saving!', after all saves have completed
     */
    function after(n, func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (--n < 1) {
          return func.apply(this, arguments);
        }
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with the `this`
     * binding of `thisArg` and prepends any additional `bind` arguments to those
     * provided to the bound function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to bind.
     * @param {*} [thisArg] The `this` binding of `func`.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var func = function(greeting) {
     *   return greeting + ' ' + this.name;
     * };
     *
     * func = _.bind(func, { 'name': 'fred' }, 'hi');
     * func();
     * // => 'hi fred'
     */
    function bind(func, thisArg) {
      return arguments.length > 2
        ? createWrapper(func, 17, slice(arguments, 2), null, thisArg)
        : createWrapper(func, 1, null, null, thisArg);
    }

    /**
     * Binds methods of an object to the object itself, overwriting the existing
     * method. Method names may be specified as individual arguments or as arrays
     * of method names. If no method names are provided all the function properties
     * of `object` will be bound.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object to bind and assign the bound methods to.
     * @param {...string} [methodName] The object method names to
     *  bind, specified as individual method names or arrays of method names.
     * @returns {Object} Returns `object`.
     * @example
     *
     * var view = {
     *   'label': 'docs',
     *   'onClick': function() { console.log('clicked ' + this.label); }
     * };
     *
     * _.bindAll(view);
     * jQuery('#docs').on('click', view.onClick);
     * // => logs 'clicked docs', when the button is clicked
     */
    function bindAll(object) {
      var funcs = arguments.length > 1 ? baseFlatten(arguments, true, false, 1) : functions(object),
          index = -1,
          length = funcs.length;

      while (++index < length) {
        var key = funcs[index];
        object[key] = createWrapper(object[key], 1, null, null, object);
      }
      return object;
    }

    /**
     * Creates a function that, when called, invokes the method at `object[key]`
     * and prepends any additional `bindKey` arguments to those provided to the bound
     * function. This method differs from `_.bind` by allowing bound functions to
     * reference methods that will be redefined or don't yet exist.
     * See http://michaux.ca/articles/lazy-function-definition-pattern.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Object} object The object the method belongs to.
     * @param {string} key The key of the method.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new bound function.
     * @example
     *
     * var object = {
     *   'name': 'fred',
     *   'greet': function(greeting) {
     *     return greeting + ' ' + this.name;
     *   }
     * };
     *
     * var func = _.bindKey(object, 'greet', 'hi');
     * func();
     * // => 'hi fred'
     *
     * object.greet = function(greeting) {
     *   return greeting + 'ya ' + this.name + '!';
     * };
     *
     * func();
     * // => 'hiya fred!'
     */
    function bindKey(object, key) {
      return arguments.length > 2
        ? createWrapper(key, 19, slice(arguments, 2), null, object)
        : createWrapper(key, 3, null, null, object);
    }

    /**
     * Creates a function that is the composition of the provided functions,
     * where each function consumes the return value of the function that follows.
     * For example, composing the functions `f()`, `g()`, and `h()` produces `f(g(h()))`.
     * Each function is executed with the `this` binding of the composed function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {...Function} [func] Functions to compose.
     * @returns {Function} Returns the new composed function.
     * @example
     *
     * var realNameMap = {
     *   'pebbles': 'penelope'
     * };
     *
     * var format = function(name) {
     *   name = realNameMap[name.toLowerCase()] || name;
     *   return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
     * };
     *
     * var greet = function(formatted) {
     *   return 'Hiya ' + formatted + '!';
     * };
     *
     * var welcome = _.compose(greet, format);
     * welcome('pebbles');
     * // => 'Hiya Penelope!'
     */
    function compose() {
      var funcs = arguments,
          length = funcs.length;

      while (length--) {
        if (!isFunction(funcs[length])) {
          throw new TypeError;
        }
      }
      return function() {
        var args = arguments,
            length = funcs.length;

        while (length--) {
          args = [funcs[length].apply(this, args)];
        }
        return args[0];
      };
    }

    /**
     * Creates a function which accepts one or more arguments of `func` that when
     * invoked either executes `func` returning its result, if all `func` arguments
     * have been provided, or returns a function that accepts one or more of the
     * remaining `func` arguments, and so on. The arity of `func` can be specified
     * if `func.length` is not sufficient.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to curry.
     * @param {number} [arity=func.length] The arity of `func`.
     * @returns {Function} Returns the new curried function.
     * @example
     *
     * var curried = _.curry(function(a, b, c) {
     *   console.log(a + b + c);
     * });
     *
     * curried(1)(2)(3);
     * // => 6
     *
     * curried(1, 2)(3);
     * // => 6
     *
     * curried(1, 2, 3);
     * // => 6
     */
    function curry(func, arity) {
      arity = typeof arity == 'number' ? arity : (+arity || func.length);
      return createWrapper(func, 4, null, null, null, arity);
    }

    /**
     * Creates a function that will delay the execution of `func` until after
     * `wait` milliseconds have elapsed since the last time it was invoked.
     * Provide an options object to indicate that `func` should be invoked on
     * the leading and/or trailing edge of the `wait` timeout. Subsequent calls
     * to the debounced function will return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the debounced function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to debounce.
     * @param {number} wait The number of milliseconds to delay.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=false] Specify execution on the leading edge of the timeout.
     * @param {number} [options.maxWait] The maximum time `func` is allowed to be delayed before it's called.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // avoid costly calculations while the window size is in flux
     * var lazyLayout = _.debounce(calculateLayout, 150);
     * jQuery(window).on('resize', lazyLayout);
     *
     * // execute `sendMail` when the click event is fired, debouncing subsequent calls
     * jQuery('#postbox').on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * });
     *
     * // ensure `batchLog` is executed once after 1 second of debounced calls
     * var source = new EventSource('/stream');
     * source.addEventListener('message', _.debounce(batchLog, 250, {
     *   'maxWait': 1000
     * }, false);
     */
    function debounce(func, wait, options) {
      var args,
          maxTimeoutId,
          result,
          stamp,
          thisArg,
          timeoutId,
          trailingCall,
          lastCalled = 0,
          maxWait = false,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      wait = nativeMax(0, wait) || 0;
      if (options === true) {
        var leading = true;
        trailing = false;
      } else if (isObject(options)) {
        leading = options.leading;
        maxWait = 'maxWait' in options && (nativeMax(wait, options.maxWait) || 0);
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      var delayed = function() {
        var remaining = wait - (now() - stamp);
        if (remaining <= 0) {
          if (maxTimeoutId) {
            clearTimeout(maxTimeoutId);
          }
          var isCalled = trailingCall;
          maxTimeoutId = timeoutId = trailingCall = undefined;
          if (isCalled) {
            lastCalled = now();
            result = func.apply(thisArg, args);
            if (!timeoutId && !maxTimeoutId) {
              args = thisArg = null;
            }
          }
        } else {
          timeoutId = setTimeout(delayed, remaining);
        }
      };

      var maxDelayed = function() {
        if (timeoutId) {
          clearTimeout(timeoutId);
        }
        maxTimeoutId = timeoutId = trailingCall = undefined;
        if (trailing || (maxWait !== wait)) {
          lastCalled = now();
          result = func.apply(thisArg, args);
          if (!timeoutId && !maxTimeoutId) {
            args = thisArg = null;
          }
        }
      };

      return function() {
        args = arguments;
        stamp = now();
        thisArg = this;
        trailingCall = trailing && (timeoutId || !leading);

        if (maxWait === false) {
          var leadingCall = leading && !timeoutId;
        } else {
          if (!maxTimeoutId && !leading) {
            lastCalled = stamp;
          }
          var remaining = maxWait - (stamp - lastCalled),
              isCalled = remaining <= 0;

          if (isCalled) {
            if (maxTimeoutId) {
              maxTimeoutId = clearTimeout(maxTimeoutId);
            }
            lastCalled = stamp;
            result = func.apply(thisArg, args);
          }
          else if (!maxTimeoutId) {
            maxTimeoutId = setTimeout(maxDelayed, remaining);
          }
        }
        if (isCalled && timeoutId) {
          timeoutId = clearTimeout(timeoutId);
        }
        else if (!timeoutId && wait !== maxWait) {
          timeoutId = setTimeout(delayed, wait);
        }
        if (leadingCall) {
          isCalled = true;
          result = func.apply(thisArg, args);
        }
        if (isCalled && !timeoutId && !maxTimeoutId) {
          args = thisArg = null;
        }
        return result;
      };
    }

    /**
     * Defers executing the `func` function until the current call stack has cleared.
     * Additional arguments will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to defer.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.defer(function(text) { console.log(text); }, 'deferred');
     * // logs 'deferred' after one or more milliseconds
     */
    function defer(func) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 1);
      return setTimeout(function() { func.apply(undefined, args); }, 1);
    }

    /**
     * Executes the `func` function after `wait` milliseconds. Additional arguments
     * will be provided to `func` when it is invoked.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to delay.
     * @param {number} wait The number of milliseconds to delay execution.
     * @param {...*} [arg] Arguments to invoke the function with.
     * @returns {number} Returns the timer id.
     * @example
     *
     * _.delay(function(text) { console.log(text); }, 1000, 'later');
     * // => logs 'later' after one second
     */
    function delay(func, wait) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var args = slice(arguments, 2);
      return setTimeout(function() { func.apply(undefined, args); }, wait);
    }

    /**
     * Creates a function that memoizes the result of `func`. If `resolver` is
     * provided it will be used to determine the cache key for storing the result
     * based on the arguments provided to the memoized function. By default, the
     * first argument provided to the memoized function is used as the cache key.
     * The `func` is executed with the `this` binding of the memoized function.
     * The result cache is exposed as the `cache` property on the memoized function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to have its output memoized.
     * @param {Function} [resolver] A function used to resolve the cache key.
     * @returns {Function} Returns the new memoizing function.
     * @example
     *
     * var fibonacci = _.memoize(function(n) {
     *   return n < 2 ? n : fibonacci(n - 1) + fibonacci(n - 2);
     * });
     *
     * fibonacci(9)
     * // => 34
     *
     * var data = {
     *   'fred': { 'name': 'fred', 'age': 40 },
     *   'pebbles': { 'name': 'pebbles', 'age': 1 }
     * };
     *
     * // modifying the result cache
     * var get = _.memoize(function(name) { return data[name]; }, _.identity);
     * get('pebbles');
     * // => { 'name': 'pebbles', 'age': 1 }
     *
     * get.cache.pebbles.name = 'penelope';
     * get('pebbles');
     * // => { 'name': 'penelope', 'age': 1 }
     */
    function memoize(func, resolver) {
      if (!isFunction(func)) {
        throw new TypeError;
      }
      var memoized = function() {
        var cache = memoized.cache,
            key = resolver ? resolver.apply(this, arguments) : keyPrefix + arguments[0];

        return hasOwnProperty.call(cache, key)
          ? cache[key]
          : (cache[key] = func.apply(this, arguments));
      }
      memoized.cache = {};
      return memoized;
    }

    /**
     * Creates a function that is restricted to execute `func` once. Repeat calls to
     * the function will return the value of the first call. The `func` is executed
     * with the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to restrict.
     * @returns {Function} Returns the new restricted function.
     * @example
     *
     * var initialize = _.once(createApplication);
     * initialize();
     * initialize();
     * // `initialize` executes `createApplication` once
     */
    function once(func) {
      var ran,
          result;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      return function() {
        if (ran) {
          return result;
        }
        ran = true;
        result = func.apply(this, arguments);

        // clear the `func` variable so the function may be garbage collected
        func = null;
        return result;
      };
    }

    /**
     * Creates a function that, when called, invokes `func` with any additional
     * `partial` arguments prepended to those provided to the new function. This
     * method is similar to `_.bind` except it does **not** alter the `this` binding.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var greet = function(greeting, name) { return greeting + ' ' + name; };
     * var hi = _.partial(greet, 'hi');
     * hi('fred');
     * // => 'hi fred'
     */
    function partial(func) {
      return createWrapper(func, 16, slice(arguments, 1));
    }

    /**
     * This method is like `_.partial` except that `partial` arguments are
     * appended to those provided to the new function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to partially apply arguments to.
     * @param {...*} [arg] Arguments to be partially applied.
     * @returns {Function} Returns the new partially applied function.
     * @example
     *
     * var defaultsDeep = _.partialRight(_.merge, _.defaults);
     *
     * var options = {
     *   'variable': 'data',
     *   'imports': { 'jq': $ }
     * };
     *
     * defaultsDeep(options, _.templateSettings);
     *
     * options.variable
     * // => 'data'
     *
     * options.imports
     * // => { '_': _, 'jq': $ }
     */
    function partialRight(func) {
      return createWrapper(func, 32, null, slice(arguments, 1));
    }

    /**
     * Creates a function that, when executed, will only call the `func` function
     * at most once per every `wait` milliseconds. Provide an options object to
     * indicate that `func` should be invoked on the leading and/or trailing edge
     * of the `wait` timeout. Subsequent calls to the throttled function will
     * return the result of the last `func` call.
     *
     * Note: If `leading` and `trailing` options are `true` `func` will be called
     * on the trailing edge of the timeout only if the the throttled function is
     * invoked more than once during the `wait` timeout.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {Function} func The function to throttle.
     * @param {number} wait The number of milliseconds to throttle executions to.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.leading=true] Specify execution on the leading edge of the timeout.
     * @param {boolean} [options.trailing=true] Specify execution on the trailing edge of the timeout.
     * @returns {Function} Returns the new throttled function.
     * @example
     *
     * // avoid excessively updating the position while scrolling
     * var throttled = _.throttle(updatePosition, 100);
     * jQuery(window).on('scroll', throttled);
     *
     * // execute `renewToken` when the click event is fired, but not more than once every 5 minutes
     * jQuery('.interactive').on('click', _.throttle(renewToken, 300000, {
     *   'trailing': false
     * }));
     */
    function throttle(func, wait, options) {
      var leading = true,
          trailing = true;

      if (!isFunction(func)) {
        throw new TypeError;
      }
      if (options === false) {
        leading = false;
      } else if (isObject(options)) {
        leading = 'leading' in options ? options.leading : leading;
        trailing = 'trailing' in options ? options.trailing : trailing;
      }
      debounceOptions.leading = leading;
      debounceOptions.maxWait = wait;
      debounceOptions.trailing = trailing;

      return debounce(func, wait, debounceOptions);
    }

    /**
     * Creates a function that provides `value` to the wrapper function as its
     * first argument. Additional arguments provided to the function are appended
     * to those provided to the wrapper function. The wrapper is executed with
     * the `this` binding of the created function.
     *
     * @static
     * @memberOf _
     * @category Functions
     * @param {*} value The value to wrap.
     * @param {Function} wrapper The wrapper function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var p = _.wrap(_.escape, function(func, text) {
     *   return '<p>' + func(text) + '</p>';
     * });
     *
     * p('Fred, Wilma, & Pebbles');
     * // => '<p>Fred, Wilma, &amp; Pebbles</p>'
     */
    function wrap(value, wrapper) {
      return createWrapper(wrapper, 16, [value]);
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a function that returns `value`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value The value to return from the new function.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var object = { 'name': 'fred' };
     * var getter = _.constant(object);
     * getter() === object;
     * // => true
     */
    function constant(value) {
      return function() {
        return value;
      };
    }

    /**
     * Produces a callback bound to an optional `thisArg`. If `func` is a property
     * name the created callback will return the property value for a given element.
     * If `func` is an object the created callback will return `true` for elements
     * that contain the equivalent object properties, otherwise it will return `false`.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} [func=identity] The value to convert to a callback.
     * @param {*} [thisArg] The `this` binding of the created callback.
     * @param {number} [argCount] The number of arguments the callback accepts.
     * @returns {Function} Returns a callback function.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // wrap to create custom callback shorthands
     * _.createCallback = _.wrap(_.createCallback, function(func, callback, thisArg) {
     *   var match = /^(.+?)__([gl]t)(.+)$/.exec(callback);
     *   return !match ? func(callback, thisArg) : function(object) {
     *     return match[2] == 'gt' ? object[match[1]] > match[3] : object[match[1]] < match[3];
     *   };
     * });
     *
     * _.filter(characters, 'age__gt38');
     * // => [{ 'name': 'fred', 'age': 40 }]
     */
    function createCallback(func, thisArg, argCount) {
      var type = typeof func;
      if (func == null || type == 'function') {
        return baseCreateCallback(func, thisArg, argCount);
      }
      // handle "_.pluck" style callback shorthands
      if (type != 'object') {
        return property(func);
      }
      var props = keys(func),
          key = props[0],
          a = func[key];

      // handle "_.where" style callback shorthands
      if (props.length == 1 && a === a && !isObject(a)) {
        // fast path the common case of providing an object with a single
        // property containing a primitive value
        return function(object) {
          var b = object[key];
          return a === b && (a !== 0 || (1 / a == 1 / b));
        };
      }
      return function(object) {
        var length = props.length,
            result = false;

        while (length--) {
          if (!(result = baseIsEqual(object[props[length]], func[props[length]], null, true))) {
            break;
          }
        }
        return result;
      };
    }

    /**
     * Converts the characters `&`, `<`, `>`, `"`, and `'` in `string` to their
     * corresponding HTML entities.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to escape.
     * @returns {string} Returns the escaped string.
     * @example
     *
     * _.escape('Fred, Wilma, & Pebbles');
     * // => 'Fred, Wilma, &amp; Pebbles'
     */
    function escape(string) {
      return string == null ? '' : String(string).replace(reUnescapedHtml, escapeHtmlChar);
    }

    /**
     * This method returns the first argument provided to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {*} value Any value.
     * @returns {*} Returns `value`.
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.identity(object) === object;
     * // => true
     */
    function identity(value) {
      return value;
    }

    /**
     * Adds function properties of a source object to the destination object.
     * If `object` is a function methods will be added to its prototype as well.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Function|Object} [object=lodash] object The destination object.
     * @param {Object} source The object of functions to add.
     * @param {Object} [options] The options object.
     * @param {boolean} [options.chain=true] Specify whether the functions added are chainable.
     * @example
     *
     * function capitalize(string) {
     *   return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
     * }
     *
     * _.mixin({ 'capitalize': capitalize });
     * _.capitalize('fred');
     * // => 'Fred'
     *
     * _('fred').capitalize().value();
     * // => 'Fred'
     *
     * _.mixin({ 'capitalize': capitalize }, { 'chain': false });
     * _('fred').capitalize();
     * // => 'Fred'
     */
    function mixin(object, source, options) {
      var chain = true,
          methodNames = source && functions(source);

      if (!source || (!options && !methodNames.length)) {
        if (options == null) {
          options = source;
        }
        ctor = lodashWrapper;
        source = object;
        object = lodash;
        methodNames = functions(source);
      }
      if (options === false) {
        chain = false;
      } else if (isObject(options) && 'chain' in options) {
        chain = options.chain;
      }
      var ctor = object,
          isFunc = isFunction(ctor);

      forEach(methodNames, function(methodName) {
        var func = object[methodName] = source[methodName];
        if (isFunc) {
          ctor.prototype[methodName] = function() {
            var chainAll = this.__chain__,
                value = this.__wrapped__,
                args = [value];

            push.apply(args, arguments);
            var result = func.apply(object, args);
            if (chain || chainAll) {
              if (value === result && isObject(result)) {
                return this;
              }
              result = new ctor(result);
              result.__chain__ = chainAll;
            }
            return result;
          };
        }
      });
    }

    /**
     * Reverts the '_' variable to its previous value and returns a reference to
     * the `lodash` function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @returns {Function} Returns the `lodash` function.
     * @example
     *
     * var lodash = _.noConflict();
     */
    function noConflict() {
      context._ = oldDash;
      return this;
    }

    /**
     * A no-operation function.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var object = { 'name': 'fred' };
     * _.noop(object) === undefined;
     * // => true
     */
    function noop() {
      // no operation performed
    }

    /**
     * Gets the number of milliseconds that have elapsed since the Unix epoch
     * (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @example
     *
     * var stamp = _.now();
     * _.defer(function() { console.log(_.now() - stamp); });
     * // => logs the number of milliseconds it took for the deferred function to be called
     */
    var now = isNative(now = Date.now) && now || function() {
      return new Date().getTime();
    };

    /**
     * Converts the given value into an integer of the specified radix.
     * If `radix` is `undefined` or `0` a `radix` of `10` is used unless the
     * `value` is a hexadecimal, in which case a `radix` of `16` is used.
     *
     * Note: This method avoids differences in native ES3 and ES5 `parseInt`
     * implementations. See http://es5.github.io/#E.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} value The value to parse.
     * @param {number} [radix] The radix used to interpret the value to parse.
     * @returns {number} Returns the new integer value.
     * @example
     *
     * _.parseInt('08');
     * // => 8
     */
    var parseInt = nativeParseInt(whitespace + '08') == 8 ? nativeParseInt : function(value, radix) {
      // Firefox < 21 and Opera < 15 follow the ES3 specified implementation of `parseInt`
      return nativeParseInt(isString(value) ? value.replace(reLeadingSpacesAndZeros, '') : value, radix || 0);
    };

    /**
     * Creates a "_.pluck" style function, which returns the `key` value of a
     * given object.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} key The name of the property to retrieve.
     * @returns {Function} Returns the new function.
     * @example
     *
     * var characters = [
     *   { 'name': 'fred',   'age': 40 },
     *   { 'name': 'barney', 'age': 36 }
     * ];
     *
     * var getName = _.property('name');
     *
     * _.map(characters, getName);
     * // => ['barney', 'fred']
     *
     * _.sortBy(characters, getName);
     * // => [{ 'name': 'barney', 'age': 36 }, { 'name': 'fred',   'age': 40 }]
     */
    function property(key) {
      return function(object) {
        return object[key];
      };
    }

    /**
     * Produces a random number between `min` and `max` (inclusive). If only one
     * argument is provided a number between `0` and the given number will be
     * returned. If `floating` is truey or either `min` or `max` are floats a
     * floating-point number will be returned instead of an integer.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} [min=0] The minimum possible value.
     * @param {number} [max=1] The maximum possible value.
     * @param {boolean} [floating=false] Specify returning a floating-point number.
     * @returns {number} Returns a random number.
     * @example
     *
     * _.random(0, 5);
     * // => an integer between 0 and 5
     *
     * _.random(5);
     * // => also an integer between 0 and 5
     *
     * _.random(5, true);
     * // => a floating-point number between 0 and 5
     *
     * _.random(1.2, 5.2);
     * // => a floating-point number between 1.2 and 5.2
     */
    function random(min, max, floating) {
      var noMin = min == null,
          noMax = max == null;

      if (floating == null) {
        if (typeof min == 'boolean' && noMax) {
          floating = min;
          min = 1;
        }
        else if (!noMax && typeof max == 'boolean') {
          floating = max;
          noMax = true;
        }
      }
      if (noMin && noMax) {
        max = 1;
      }
      min = +min || 0;
      if (noMax) {
        max = min;
        min = 0;
      } else {
        max = +max || 0;
      }
      if (floating || min % 1 || max % 1) {
        var rand = nativeRandom();
        return nativeMin(min + (rand * (max - min + parseFloat('1e-' + ((rand +'').length - 1)))), max);
      }
      return baseRandom(min, max);
    }

    /**
     * Resolves the value of property `key` on `object`. If `key` is a function
     * it will be invoked with the `this` binding of `object` and its result returned,
     * else the property value is returned. If `object` is falsey then `undefined`
     * is returned.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {Object} object The object to inspect.
     * @param {string} key The name of the property to resolve.
     * @returns {*} Returns the resolved value.
     * @example
     *
     * var object = {
     *   'cheese': 'crumpets',
     *   'stuff': function() {
     *     return 'nonsense';
     *   }
     * };
     *
     * _.result(object, 'cheese');
     * // => 'crumpets'
     *
     * _.result(object, 'stuff');
     * // => 'nonsense'
     */
    function result(object, key) {
      if (object) {
        var value = object[key];
        return isFunction(value) ? object[key]() : value;
      }
    }

    /**
     * A micro-templating method that handles arbitrary delimiters, preserves
     * whitespace, and correctly escapes quotes within interpolated code.
     *
     * Note: In the development build, `_.template` utilizes sourceURLs for easier
     * debugging. See http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
     *
     * For more information on precompiling templates see:
     * https://lodash.com/custom-builds
     *
     * For more information on Chrome extension sandboxes see:
     * http://developer.chrome.com/stable/extensions/sandboxingEval.html
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} text The template text.
     * @param {Object} data The data object used to populate the text.
     * @param {Object} [options] The options object.
     * @param {RegExp} [options.escape] The "escape" delimiter.
     * @param {RegExp} [options.evaluate] The "evaluate" delimiter.
     * @param {Object} [options.imports] An object to import into the template as local variables.
     * @param {RegExp} [options.interpolate] The "interpolate" delimiter.
     * @param {string} [sourceURL] The sourceURL of the template's compiled source.
     * @param {string} [variable] The data object variable name.
     * @returns {Function|string} Returns a compiled function when no `data` object
     *  is given, else it returns the interpolated text.
     * @example
     *
     * // using the "interpolate" delimiter to create a compiled template
     * var compiled = _.template('hello <%= name %>');
     * compiled({ 'name': 'fred' });
     * // => 'hello fred'
     *
     * // using the "escape" delimiter to escape HTML in data property values
     * _.template('<b><%- value %></b>', { 'value': '<script>' });
     * // => '<b>&lt;script&gt;</b>'
     *
     * // using the "evaluate" delimiter to generate HTML
     * var list = '<% _.forEach(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the ES6 delimiter as an alternative to the default "interpolate" delimiter
     * _.template('hello ${ name }', { 'name': 'pebbles' });
     * // => 'hello pebbles'
     *
     * // using the internal `print` function in "evaluate" delimiters
     * _.template('<% print("hello " + name); %>!', { 'name': 'barney' });
     * // => 'hello barney!'
     *
     * // using a custom template delimiters
     * _.templateSettings = {
     *   'interpolate': /{{([\s\S]+?)}}/g
     * };
     *
     * _.template('hello {{ name }}!', { 'name': 'mustache' });
     * // => 'hello mustache!'
     *
     * // using the `imports` option to import jQuery
     * var list = '<% jq.each(people, function(name) { %><li><%- name %></li><% }); %>';
     * _.template(list, { 'people': ['fred', 'barney'] }, { 'imports': { 'jq': jQuery } });
     * // => '<li>fred</li><li>barney</li>'
     *
     * // using the `sourceURL` option to specify a custom sourceURL for the template
     * var compiled = _.template('hello <%= name %>', null, { 'sourceURL': '/basic/greeting.jst' });
     * compiled(data);
     * // => find the source of "greeting.jst" under the Sources tab or Resources panel of the web inspector
     *
     * // using the `variable` option to ensure a with-statement isn't used in the compiled template
     * var compiled = _.template('hi <%= data.name %>!', null, { 'variable': 'data' });
     * compiled.source;
     * // => function(data) {
     *   var __t, __p = '', __e = _.escape;
     *   __p += 'hi ' + ((__t = ( data.name )) == null ? '' : __t) + '!';
     *   return __p;
     * }
     *
     * // using the `source` property to inline compiled templates for meaningful
     * // line numbers in error messages and a stack trace
     * fs.writeFileSync(path.join(cwd, 'jst.js'), '\
     *   var JST = {\
     *     "main": ' + _.template(mainText).source + '\
     *   };\
     * ');
     */
    function template(text, data, options) {
      // based on John Resig's `tmpl` implementation
      // http://ejohn.org/blog/javascript-micro-templating/
      // and Laura Doktorova's doT.js
      // https://github.com/olado/doT
      var settings = lodash.templateSettings;
      text = String(text || '');

      // avoid missing dependencies when `iteratorTemplate` is not defined
      options = defaults({}, options, settings);

      var imports = defaults({}, options.imports, settings.imports),
          importsKeys = keys(imports),
          importsValues = values(imports);

      var isEvaluating,
          index = 0,
          interpolate = options.interpolate || reNoMatch,
          source = "__p += '";

      // compile the regexp to match each delimiter
      var reDelimiters = RegExp(
        (options.escape || reNoMatch).source + '|' +
        interpolate.source + '|' +
        (interpolate === reInterpolate ? reEsTemplate : reNoMatch).source + '|' +
        (options.evaluate || reNoMatch).source + '|$'
      , 'g');

      text.replace(reDelimiters, function(match, escapeValue, interpolateValue, esTemplateValue, evaluateValue, offset) {
        interpolateValue || (interpolateValue = esTemplateValue);

        // escape characters that cannot be included in string literals
        source += text.slice(index, offset).replace(reUnescapedString, escapeStringChar);

        // replace delimiters with snippets
        if (escapeValue) {
          source += "' +\n__e(" + escapeValue + ") +\n'";
        }
        if (evaluateValue) {
          isEvaluating = true;
          source += "';\n" + evaluateValue + ";\n__p += '";
        }
        if (interpolateValue) {
          source += "' +\n((__t = (" + interpolateValue + ")) == null ? '' : __t) +\n'";
        }
        index = offset + match.length;

        // the JS engine embedded in Adobe products requires returning the `match`
        // string in order to produce the correct `offset` value
        return match;
      });

      source += "';\n";

      // if `variable` is not specified, wrap a with-statement around the generated
      // code to add the data object to the top of the scope chain
      var variable = options.variable,
          hasVariable = variable;

      if (!hasVariable) {
        variable = 'obj';
        source = 'with (' + variable + ') {\n' + source + '\n}\n';
      }
      // cleanup code by stripping empty strings
      source = (isEvaluating ? source.replace(reEmptyStringLeading, '') : source)
        .replace(reEmptyStringMiddle, '$1')
        .replace(reEmptyStringTrailing, '$1;');

      // frame code as the function body
      source = 'function(' + variable + ') {\n' +
        (hasVariable ? '' : variable + ' || (' + variable + ' = {});\n') +
        "var __t, __p = '', __e = _.escape" +
        (isEvaluating
          ? ', __j = Array.prototype.join;\n' +
            "function print() { __p += __j.call(arguments, '') }\n"
          : ';\n'
        ) +
        source +
        'return __p\n}';

      // Use a sourceURL for easier debugging.
      // http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/#toc-sourceurl
      var sourceURL = '\n/*\n//# sourceURL=' + (options.sourceURL || '/lodash/template/source[' + (templateCounter++) + ']') + '\n*/';

      try {
        var result = Function(importsKeys, 'return ' + source + sourceURL).apply(undefined, importsValues);
      } catch(e) {
        e.source = source;
        throw e;
      }
      if (data) {
        return result(data);
      }
      // provide the compiled function's source by its `toString` method, in
      // supported environments, or the `source` property as a convenience for
      // inlining compiled templates during the build process
      result.source = source;
      return result;
    }

    /**
     * Executes the callback `n` times, returning an array of the results
     * of each callback execution. The callback is bound to `thisArg` and invoked
     * with one argument; (index).
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {number} n The number of times to execute the callback.
     * @param {Function} callback The function called per iteration.
     * @param {*} [thisArg] The `this` binding of `callback`.
     * @returns {Array} Returns an array of the results of each `callback` execution.
     * @example
     *
     * var diceRolls = _.times(3, _.partial(_.random, 1, 6));
     * // => [3, 6, 4]
     *
     * _.times(3, function(n) { mage.castSpell(n); });
     * // => calls `mage.castSpell(n)` three times, passing `n` of `0`, `1`, and `2` respectively
     *
     * _.times(3, function(n) { this.cast(n); }, mage);
     * // => also calls `mage.castSpell(n)` three times
     */
    function times(n, callback, thisArg) {
      n = (n = +n) > -1 ? n : 0;
      var index = -1,
          result = Array(n);

      callback = baseCreateCallback(callback, thisArg, 1);
      while (++index < n) {
        result[index] = callback(index);
      }
      return result;
    }

    /**
     * The inverse of `_.escape` this method converts the HTML entities
     * `&amp;`, `&lt;`, `&gt;`, `&quot;`, and `&#39;` in `string` to their
     * corresponding characters.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} string The string to unescape.
     * @returns {string} Returns the unescaped string.
     * @example
     *
     * _.unescape('Fred, Barney &amp; Pebbles');
     * // => 'Fred, Barney & Pebbles'
     */
    function unescape(string) {
      return string == null ? '' : String(string).replace(reEscapedHtml, unescapeHtmlChar);
    }

    /**
     * Generates a unique ID. If `prefix` is provided the ID will be appended to it.
     *
     * @static
     * @memberOf _
     * @category Utilities
     * @param {string} [prefix] The value to prefix the ID with.
     * @returns {string} Returns the unique ID.
     * @example
     *
     * _.uniqueId('contact_');
     * // => 'contact_104'
     *
     * _.uniqueId();
     * // => '105'
     */
    function uniqueId(prefix) {
      var id = ++idCounter;
      return String(prefix == null ? '' : prefix) + id;
    }

    /*--------------------------------------------------------------------------*/

    /**
     * Creates a `lodash` object that wraps the given value with explicit
     * method chaining enabled.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to wrap.
     * @returns {Object} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney',  'age': 36 },
     *   { 'name': 'fred',    'age': 40 },
     *   { 'name': 'pebbles', 'age': 1 }
     * ];
     *
     * var youngest = _.chain(characters)
     *     .sortBy('age')
     *     .map(function(chr) { return chr.name + ' is ' + chr.age; })
     *     .first()
     *     .value();
     * // => 'pebbles is 1'
     */
    function chain(value) {
      value = new lodashWrapper(value);
      value.__chain__ = true;
      return value;
    }

    /**
     * Invokes `interceptor` with the `value` as the first argument and then
     * returns `value`. The purpose of this method is to "tap into" a method
     * chain in order to perform operations on intermediate results within
     * the chain.
     *
     * @static
     * @memberOf _
     * @category Chaining
     * @param {*} value The value to provide to `interceptor`.
     * @param {Function} interceptor The function to invoke.
     * @returns {*} Returns `value`.
     * @example
     *
     * _([1, 2, 3, 4])
     *  .tap(function(array) { array.pop(); })
     *  .reverse()
     *  .value();
     * // => [3, 2, 1]
     */
    function tap(value, interceptor) {
      interceptor(value);
      return value;
    }

    /**
     * Enables explicit method chaining on the wrapper object.
     *
     * @name chain
     * @memberOf _
     * @category Chaining
     * @returns {*} Returns the wrapper object.
     * @example
     *
     * var characters = [
     *   { 'name': 'barney', 'age': 36 },
     *   { 'name': 'fred',   'age': 40 }
     * ];
     *
     * // without explicit chaining
     * _(characters).first();
     * // => { 'name': 'barney', 'age': 36 }
     *
     * // with explicit chaining
     * _(characters).chain()
     *   .first()
     *   .pick('age')
     *   .value();
     * // => { 'age': 36 }
     */
    function wrapperChain() {
      this.__chain__ = true;
      return this;
    }

    /**
     * Produces the `toString` result of the wrapped value.
     *
     * @name toString
     * @memberOf _
     * @category Chaining
     * @returns {string} Returns the string result.
     * @example
     *
     * _([1, 2, 3]).toString();
     * // => '1,2,3'
     */
    function wrapperToString() {
      return String(this.__wrapped__);
    }

    /**
     * Extracts the wrapped value.
     *
     * @name valueOf
     * @memberOf _
     * @alias value
     * @category Chaining
     * @returns {*} Returns the wrapped value.
     * @example
     *
     * _([1, 2, 3]).valueOf();
     * // => [1, 2, 3]
     */
    function wrapperValueOf() {
      return this.__wrapped__;
    }

    /*--------------------------------------------------------------------------*/

    // add functions that return wrapped values when chaining
    lodash.after = after;
    lodash.assign = assign;
    lodash.at = at;
    lodash.bind = bind;
    lodash.bindAll = bindAll;
    lodash.bindKey = bindKey;
    lodash.chain = chain;
    lodash.compact = compact;
    lodash.compose = compose;
    lodash.constant = constant;
    lodash.countBy = countBy;
    lodash.create = create;
    lodash.createCallback = createCallback;
    lodash.curry = curry;
    lodash.debounce = debounce;
    lodash.defaults = defaults;
    lodash.defer = defer;
    lodash.delay = delay;
    lodash.difference = difference;
    lodash.filter = filter;
    lodash.flatten = flatten;
    lodash.forEach = forEach;
    lodash.forEachRight = forEachRight;
    lodash.forIn = forIn;
    lodash.forInRight = forInRight;
    lodash.forOwn = forOwn;
    lodash.forOwnRight = forOwnRight;
    lodash.functions = functions;
    lodash.groupBy = groupBy;
    lodash.indexBy = indexBy;
    lodash.initial = initial;
    lodash.intersection = intersection;
    lodash.invert = invert;
    lodash.invoke = invoke;
    lodash.keys = keys;
    lodash.map = map;
    lodash.mapValues = mapValues;
    lodash.max = max;
    lodash.memoize = memoize;
    lodash.merge = merge;
    lodash.min = min;
    lodash.omit = omit;
    lodash.once = once;
    lodash.pairs = pairs;
    lodash.partial = partial;
    lodash.partialRight = partialRight;
    lodash.pick = pick;
    lodash.pluck = pluck;
    lodash.property = property;
    lodash.pull = pull;
    lodash.range = range;
    lodash.reject = reject;
    lodash.remove = remove;
    lodash.rest = rest;
    lodash.shuffle = shuffle;
    lodash.sortBy = sortBy;
    lodash.tap = tap;
    lodash.throttle = throttle;
    lodash.times = times;
    lodash.toArray = toArray;
    lodash.transform = transform;
    lodash.union = union;
    lodash.uniq = uniq;
    lodash.values = values;
    lodash.where = where;
    lodash.without = without;
    lodash.wrap = wrap;
    lodash.xor = xor;
    lodash.zip = zip;
    lodash.zipObject = zipObject;

    // add aliases
    lodash.collect = map;
    lodash.drop = rest;
    lodash.each = forEach;
    lodash.eachRight = forEachRight;
    lodash.extend = assign;
    lodash.methods = functions;
    lodash.object = zipObject;
    lodash.select = filter;
    lodash.tail = rest;
    lodash.unique = uniq;
    lodash.unzip = zip;

    // add functions to `lodash.prototype`
    mixin(lodash);

    /*--------------------------------------------------------------------------*/

    // add functions that return unwrapped values when chaining
    lodash.clone = clone;
    lodash.cloneDeep = cloneDeep;
    lodash.contains = contains;
    lodash.escape = escape;
    lodash.every = every;
    lodash.find = find;
    lodash.findIndex = findIndex;
    lodash.findKey = findKey;
    lodash.findLast = findLast;
    lodash.findLastIndex = findLastIndex;
    lodash.findLastKey = findLastKey;
    lodash.has = has;
    lodash.identity = identity;
    lodash.indexOf = indexOf;
    lodash.isArguments = isArguments;
    lodash.isArray = isArray;
    lodash.isBoolean = isBoolean;
    lodash.isDate = isDate;
    lodash.isElement = isElement;
    lodash.isEmpty = isEmpty;
    lodash.isEqual = isEqual;
    lodash.isFinite = isFinite;
    lodash.isFunction = isFunction;
    lodash.isNaN = isNaN;
    lodash.isNull = isNull;
    lodash.isNumber = isNumber;
    lodash.isObject = isObject;
    lodash.isPlainObject = isPlainObject;
    lodash.isRegExp = isRegExp;
    lodash.isString = isString;
    lodash.isUndefined = isUndefined;
    lodash.lastIndexOf = lastIndexOf;
    lodash.mixin = mixin;
    lodash.noConflict = noConflict;
    lodash.noop = noop;
    lodash.now = now;
    lodash.parseInt = parseInt;
    lodash.random = random;
    lodash.reduce = reduce;
    lodash.reduceRight = reduceRight;
    lodash.result = result;
    lodash.runInContext = runInContext;
    lodash.size = size;
    lodash.some = some;
    lodash.sortedIndex = sortedIndex;
    lodash.template = template;
    lodash.unescape = unescape;
    lodash.uniqueId = uniqueId;

    // add aliases
    lodash.all = every;
    lodash.any = some;
    lodash.detect = find;
    lodash.findWhere = find;
    lodash.foldl = reduce;
    lodash.foldr = reduceRight;
    lodash.include = contains;
    lodash.inject = reduce;

    mixin(function() {
      var source = {}
      forOwn(lodash, function(func, methodName) {
        if (!lodash.prototype[methodName]) {
          source[methodName] = func;
        }
      });
      return source;
    }(), false);

    /*--------------------------------------------------------------------------*/

    // add functions capable of returning wrapped and unwrapped values when chaining
    lodash.first = first;
    lodash.last = last;
    lodash.sample = sample;

    // add aliases
    lodash.take = first;
    lodash.head = first;

    forOwn(lodash, function(func, methodName) {
      var callbackable = methodName !== 'sample';
      if (!lodash.prototype[methodName]) {
        lodash.prototype[methodName]= function(n, guard) {
          var chainAll = this.__chain__,
              result = func(this.__wrapped__, n, guard);

          return !chainAll && (n == null || (guard && !(callbackable && typeof n == 'function')))
            ? result
            : new lodashWrapper(result, chainAll);
        };
      }
    });

    /*--------------------------------------------------------------------------*/

    /**
     * The semantic version number.
     *
     * @static
     * @memberOf _
     * @type string
     */
    lodash.VERSION = '2.4.2';

    // add "Chaining" functions to the wrapper
    lodash.prototype.chain = wrapperChain;
    lodash.prototype.toString = wrapperToString;
    lodash.prototype.value = wrapperValueOf;
    lodash.prototype.valueOf = wrapperValueOf;

    // add `Array` functions that return unwrapped values
    forEach(['join', 'pop', 'shift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        var chainAll = this.__chain__,
            result = func.apply(this.__wrapped__, arguments);

        return chainAll
          ? new lodashWrapper(result, chainAll)
          : result;
      };
    });

    // add `Array` functions that return the existing wrapped value
    forEach(['push', 'reverse', 'sort', 'unshift'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        func.apply(this.__wrapped__, arguments);
        return this;
      };
    });

    // add `Array` functions that return new wrapped values
    forEach(['concat', 'slice', 'splice'], function(methodName) {
      var func = arrayRef[methodName];
      lodash.prototype[methodName] = function() {
        return new lodashWrapper(func.apply(this.__wrapped__, arguments), this.__chain__);
      };
    });

    return lodash;
  }

  /*--------------------------------------------------------------------------*/

  // expose Lo-Dash
  var _ = runInContext();

  // some AMD build optimizers like r.js check for condition patterns like the following:
  if (typeof define == 'function' && typeof define.amd == 'object' && define.amd) {
    // Expose Lo-Dash to the global object even when an AMD loader is present in
    // case Lo-Dash is loaded with a RequireJS shim config.
    // See http://requirejs.org/docs/api.html#config-shim
    root._ = _;

    // define as an anonymous module so, through path mapping, it can be
    // referenced as the "underscore" module
    define(function() {
      return _;
    });
  }
  // check for `exports` after `define` in case a build optimizer adds an `exports` object
  else if (freeExports && freeModule) {
    // in Node.js or RingoJS
    if (moduleExports) {
      (freeModule.exports = _)._ = _;
    }
    // in Narwhal or Rhino -require
    else {
      freeExports._ = _;
    }
  }
  else {
    // in a browser or Rhino
    root._ = _;
  }
}.call(this));

}).call(this,typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : typeof window !== "undefined" ? window : {})
},{}],10:[function(require,module,exports){
/*
object-assign
(c) Sindre Sorhus
@license MIT
*/

'use strict';
/* eslint-disable no-unused-vars */
var getOwnPropertySymbols = Object.getOwnPropertySymbols;
var hasOwnProperty = Object.prototype.hasOwnProperty;
var propIsEnumerable = Object.prototype.propertyIsEnumerable;

function toObject(val) {
	if (val === null || val === undefined) {
		throw new TypeError('Object.assign cannot be called with null or undefined');
	}

	return Object(val);
}

function shouldUseNative() {
	try {
		if (!Object.assign) {
			return false;
		}

		// Detect buggy property enumeration order in older V8 versions.

		// https://bugs.chromium.org/p/v8/issues/detail?id=4118
		var test1 = new String('abc');  // eslint-disable-line no-new-wrappers
		test1[5] = 'de';
		if (Object.getOwnPropertyNames(test1)[0] === '5') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test2 = {};
		for (var i = 0; i < 10; i++) {
			test2['_' + String.fromCharCode(i)] = i;
		}
		var order2 = Object.getOwnPropertyNames(test2).map(function (n) {
			return test2[n];
		});
		if (order2.join('') !== '0123456789') {
			return false;
		}

		// https://bugs.chromium.org/p/v8/issues/detail?id=3056
		var test3 = {};
		'abcdefghijklmnopqrst'.split('').forEach(function (letter) {
			test3[letter] = letter;
		});
		if (Object.keys(Object.assign({}, test3)).join('') !==
				'abcdefghijklmnopqrst') {
			return false;
		}

		return true;
	} catch (err) {
		// We don't expect any of the above to throw, but better to be safe.
		return false;
	}
}

module.exports = shouldUseNative() ? Object.assign : function (target, source) {
	var from;
	var to = toObject(target);
	var symbols;

	for (var s = 1; s < arguments.length; s++) {
		from = Object(arguments[s]);

		for (var key in from) {
			if (hasOwnProperty.call(from, key)) {
				to[key] = from[key];
			}
		}

		if (getOwnPropertySymbols) {
			symbols = getOwnPropertySymbols(from);
			for (var i = 0; i < symbols.length; i++) {
				if (propIsEnumerable.call(from, symbols[i])) {
					to[symbols[i]] = from[symbols[i]];
				}
			}
		}
	}

	return to;
};

},{}],11:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;

function drainQueue() {
    if (draining) {
        return;
    }
    draining = true;
    var currentQueue;
    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        var i = -1;
        while (++i < len) {
            currentQueue[i]();
        }
        len = queue.length;
    }
    draining = false;
}
process.nextTick = function (fun) {
    queue.push(fun);
    if (!draining) {
        setTimeout(drainQueue, 0);
    }
};

process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

// TODO(shtylman)
process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],12:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

if (process.env.NODE_ENV !== 'production') {
  var invariant = require('fbjs/lib/invariant');
  var warning = require('fbjs/lib/warning');
  var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');
  var loggedTypeFailures = {};
}

/**
 * Assert that the values match with the type specs.
 * Error messages are memorized and will only be shown once.
 *
 * @param {object} typeSpecs Map of name to a ReactPropType
 * @param {object} values Runtime values that need to be type-checked
 * @param {string} location e.g. "prop", "context", "child context"
 * @param {string} componentName Name of the component for error messages.
 * @param {?Function} getStack Returns the component stack.
 * @private
 */
function checkPropTypes(typeSpecs, values, location, componentName, getStack) {
  if (process.env.NODE_ENV !== 'production') {
    for (var typeSpecName in typeSpecs) {
      if (typeSpecs.hasOwnProperty(typeSpecName)) {
        var error;
        // Prop type validation may throw. In case they do, we don't want to
        // fail the render phase where it didn't fail before. So we log it.
        // After these have been cleaned up, we'll let them throw.
        try {
          // This is intentionally an invariant that gets caught. It's the same
          // behavior as without this statement except with a better message.
          invariant(typeof typeSpecs[typeSpecName] === 'function', '%s: %s type `%s` is invalid; it must be a function, usually from ' + 'React.PropTypes.', componentName || 'React class', location, typeSpecName);
          error = typeSpecs[typeSpecName](values, typeSpecName, componentName, location, null, ReactPropTypesSecret);
        } catch (ex) {
          error = ex;
        }
        warning(!error || error instanceof Error, '%s: type specification of %s `%s` is invalid; the type checker ' + 'function must return `null` or an `Error` but returned a %s. ' + 'You may have forgotten to pass an argument to the type checker ' + 'creator (arrayOf, instanceOf, objectOf, oneOf, oneOfType, and ' + 'shape all require an argument).', componentName || 'React class', location, typeSpecName, typeof error);
        if (error instanceof Error && !(error.message in loggedTypeFailures)) {
          // Only monitor this failure once because there tends to be a lot of the
          // same error.
          loggedTypeFailures[error.message] = true;

          var stack = getStack ? getStack() : '';

          warning(false, 'Failed %s type: %s%s', location, error.message, stack != null ? stack : '');
        }
      }
    }
  }
}

module.exports = checkPropTypes;

}).call(this,require('_process'))
},{"./lib/ReactPropTypesSecret":16,"_process":11,"fbjs/lib/invariant":6,"fbjs/lib/warning":7}],13:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var emptyFunction = require('fbjs/lib/emptyFunction');
var invariant = require('fbjs/lib/invariant');
var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');

module.exports = function() {
  function shim(props, propName, componentName, location, propFullName, secret) {
    if (secret === ReactPropTypesSecret) {
      // It is still safe when called from React.
      return;
    }
    invariant(
      false,
      'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
      'Use PropTypes.checkPropTypes() to call them. ' +
      'Read more at http://fb.me/use-check-prop-types'
    );
  };
  shim.isRequired = shim;
  function getShim() {
    return shim;
  };
  // Important!
  // Keep this list in sync with production version in `./factoryWithTypeCheckers.js`.
  var ReactPropTypes = {
    array: shim,
    bool: shim,
    func: shim,
    number: shim,
    object: shim,
    string: shim,
    symbol: shim,

    any: shim,
    arrayOf: getShim,
    element: shim,
    instanceOf: getShim,
    node: shim,
    objectOf: getShim,
    oneOf: getShim,
    oneOfType: getShim,
    shape: getShim
  };

  ReactPropTypes.checkPropTypes = emptyFunction;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

},{"./lib/ReactPropTypesSecret":16,"fbjs/lib/emptyFunction":4,"fbjs/lib/invariant":6}],14:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var emptyFunction = require('fbjs/lib/emptyFunction');
var invariant = require('fbjs/lib/invariant');
var warning = require('fbjs/lib/warning');

var ReactPropTypesSecret = require('./lib/ReactPropTypesSecret');
var checkPropTypes = require('./checkPropTypes');

module.exports = function(isValidElement, throwOnDirectAccess) {
  /* global Symbol */
  var ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
  var FAUX_ITERATOR_SYMBOL = '@@iterator'; // Before Symbol spec.

  /**
   * Returns the iterator method function contained on the iterable object.
   *
   * Be sure to invoke the function with the iterable as context:
   *
   *     var iteratorFn = getIteratorFn(myIterable);
   *     if (iteratorFn) {
   *       var iterator = iteratorFn.call(myIterable);
   *       ...
   *     }
   *
   * @param {?object} maybeIterable
   * @return {?function}
   */
  function getIteratorFn(maybeIterable) {
    var iteratorFn = maybeIterable && (ITERATOR_SYMBOL && maybeIterable[ITERATOR_SYMBOL] || maybeIterable[FAUX_ITERATOR_SYMBOL]);
    if (typeof iteratorFn === 'function') {
      return iteratorFn;
    }
  }

  /**
   * Collection of methods that allow declaration and validation of props that are
   * supplied to React components. Example usage:
   *
   *   var Props = require('ReactPropTypes');
   *   var MyArticle = React.createClass({
   *     propTypes: {
   *       // An optional string prop named "description".
   *       description: Props.string,
   *
   *       // A required enum prop named "category".
   *       category: Props.oneOf(['News','Photos']).isRequired,
   *
   *       // A prop named "dialog" that requires an instance of Dialog.
   *       dialog: Props.instanceOf(Dialog).isRequired
   *     },
   *     render: function() { ... }
   *   });
   *
   * A more formal specification of how these methods are used:
   *
   *   type := array|bool|func|object|number|string|oneOf([...])|instanceOf(...)
   *   decl := ReactPropTypes.{type}(.isRequired)?
   *
   * Each and every declaration produces a function with the same signature. This
   * allows the creation of custom validation functions. For example:
   *
   *  var MyLink = React.createClass({
   *    propTypes: {
   *      // An optional string or URI prop named "href".
   *      href: function(props, propName, componentName) {
   *        var propValue = props[propName];
   *        if (propValue != null && typeof propValue !== 'string' &&
   *            !(propValue instanceof URI)) {
   *          return new Error(
   *            'Expected a string or an URI for ' + propName + ' in ' +
   *            componentName
   *          );
   *        }
   *      }
   *    },
   *    render: function() {...}
   *  });
   *
   * @internal
   */

  var ANONYMOUS = '<<anonymous>>';

  // Important!
  // Keep this list in sync with production version in `./factoryWithThrowingShims.js`.
  var ReactPropTypes = {
    array: createPrimitiveTypeChecker('array'),
    bool: createPrimitiveTypeChecker('boolean'),
    func: createPrimitiveTypeChecker('function'),
    number: createPrimitiveTypeChecker('number'),
    object: createPrimitiveTypeChecker('object'),
    string: createPrimitiveTypeChecker('string'),
    symbol: createPrimitiveTypeChecker('symbol'),

    any: createAnyTypeChecker(),
    arrayOf: createArrayOfTypeChecker,
    element: createElementTypeChecker(),
    instanceOf: createInstanceTypeChecker,
    node: createNodeChecker(),
    objectOf: createObjectOfTypeChecker,
    oneOf: createEnumTypeChecker,
    oneOfType: createUnionTypeChecker,
    shape: createShapeTypeChecker
  };

  /**
   * inlined Object.is polyfill to avoid requiring consumers ship their own
   * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
   */
  /*eslint-disable no-self-compare*/
  function is(x, y) {
    // SameValue algorithm
    if (x === y) {
      // Steps 1-5, 7-10
      // Steps 6.b-6.e: +0 != -0
      return x !== 0 || 1 / x === 1 / y;
    } else {
      // Step 6.a: NaN == NaN
      return x !== x && y !== y;
    }
  }
  /*eslint-enable no-self-compare*/

  /**
   * We use an Error-like object for backward compatibility as people may call
   * PropTypes directly and inspect their output. However, we don't use real
   * Errors anymore. We don't inspect their stack anyway, and creating them
   * is prohibitively expensive if they are created too often, such as what
   * happens in oneOfType() for any type before the one that matched.
   */
  function PropTypeError(message) {
    this.message = message;
    this.stack = '';
  }
  // Make `instanceof Error` still work for returned errors.
  PropTypeError.prototype = Error.prototype;

  function createChainableTypeChecker(validate) {
    if (process.env.NODE_ENV !== 'production') {
      var manualPropTypeCallCache = {};
      var manualPropTypeWarningCount = 0;
    }
    function checkType(isRequired, props, propName, componentName, location, propFullName, secret) {
      componentName = componentName || ANONYMOUS;
      propFullName = propFullName || propName;

      if (secret !== ReactPropTypesSecret) {
        if (throwOnDirectAccess) {
          // New behavior only for users of `prop-types` package
          invariant(
            false,
            'Calling PropTypes validators directly is not supported by the `prop-types` package. ' +
            'Use `PropTypes.checkPropTypes()` to call them. ' +
            'Read more at http://fb.me/use-check-prop-types'
          );
        } else if (process.env.NODE_ENV !== 'production' && typeof console !== 'undefined') {
          // Old behavior for people using React.PropTypes
          var cacheKey = componentName + ':' + propName;
          if (
            !manualPropTypeCallCache[cacheKey] &&
            // Avoid spamming the console because they are often not actionable except for lib authors
            manualPropTypeWarningCount < 3
          ) {
            warning(
              false,
              'You are manually calling a React.PropTypes validation ' +
              'function for the `%s` prop on `%s`. This is deprecated ' +
              'and will throw in the standalone `prop-types` package. ' +
              'You may be seeing this warning due to a third-party PropTypes ' +
              'library. See https://fb.me/react-warning-dont-call-proptypes ' + 'for details.',
              propFullName,
              componentName
            );
            manualPropTypeCallCache[cacheKey] = true;
            manualPropTypeWarningCount++;
          }
        }
      }
      if (props[propName] == null) {
        if (isRequired) {
          if (props[propName] === null) {
            return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required ' + ('in `' + componentName + '`, but its value is `null`.'));
          }
          return new PropTypeError('The ' + location + ' `' + propFullName + '` is marked as required in ' + ('`' + componentName + '`, but its value is `undefined`.'));
        }
        return null;
      } else {
        return validate(props, propName, componentName, location, propFullName);
      }
    }

    var chainedCheckType = checkType.bind(null, false);
    chainedCheckType.isRequired = checkType.bind(null, true);

    return chainedCheckType;
  }

  function createPrimitiveTypeChecker(expectedType) {
    function validate(props, propName, componentName, location, propFullName, secret) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== expectedType) {
        // `propValue` being instance of, say, date/regexp, pass the 'object'
        // check, but we can offer a more precise error message here rather than
        // 'of type `object`'.
        var preciseType = getPreciseType(propValue);

        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + preciseType + '` supplied to `' + componentName + '`, expected ') + ('`' + expectedType + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createAnyTypeChecker() {
    return createChainableTypeChecker(emptyFunction.thatReturnsNull);
  }

  function createArrayOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside arrayOf.');
      }
      var propValue = props[propName];
      if (!Array.isArray(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an array.'));
      }
      for (var i = 0; i < propValue.length; i++) {
        var error = typeChecker(propValue, i, componentName, location, propFullName + '[' + i + ']', ReactPropTypesSecret);
        if (error instanceof Error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createElementTypeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      if (!isValidElement(propValue)) {
        var propType = getPropType(propValue);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected a single ReactElement.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createInstanceTypeChecker(expectedClass) {
    function validate(props, propName, componentName, location, propFullName) {
      if (!(props[propName] instanceof expectedClass)) {
        var expectedClassName = expectedClass.name || ANONYMOUS;
        var actualClassName = getClassName(props[propName]);
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + actualClassName + '` supplied to `' + componentName + '`, expected ') + ('instance of `' + expectedClassName + '`.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createEnumTypeChecker(expectedValues) {
    if (!Array.isArray(expectedValues)) {
      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOf, expected an instance of array.') : void 0;
      return emptyFunction.thatReturnsNull;
    }

    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      for (var i = 0; i < expectedValues.length; i++) {
        if (is(propValue, expectedValues[i])) {
          return null;
        }
      }

      var valuesString = JSON.stringify(expectedValues);
      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of value `' + propValue + '` ' + ('supplied to `' + componentName + '`, expected one of ' + valuesString + '.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createObjectOfTypeChecker(typeChecker) {
    function validate(props, propName, componentName, location, propFullName) {
      if (typeof typeChecker !== 'function') {
        return new PropTypeError('Property `' + propFullName + '` of component `' + componentName + '` has invalid PropType notation inside objectOf.');
      }
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type ' + ('`' + propType + '` supplied to `' + componentName + '`, expected an object.'));
      }
      for (var key in propValue) {
        if (propValue.hasOwnProperty(key)) {
          var error = typeChecker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
          if (error instanceof Error) {
            return error;
          }
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createUnionTypeChecker(arrayOfTypeCheckers) {
    if (!Array.isArray(arrayOfTypeCheckers)) {
      process.env.NODE_ENV !== 'production' ? warning(false, 'Invalid argument supplied to oneOfType, expected an instance of array.') : void 0;
      return emptyFunction.thatReturnsNull;
    }

    for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
      var checker = arrayOfTypeCheckers[i];
      if (typeof checker !== 'function') {
        warning(
          false,
          'Invalid argument supplid to oneOfType. Expected an array of check functions, but ' +
          'received %s at index %s.',
          getPostfixForTypeWarning(checker),
          i
        );
        return emptyFunction.thatReturnsNull;
      }
    }

    function validate(props, propName, componentName, location, propFullName) {
      for (var i = 0; i < arrayOfTypeCheckers.length; i++) {
        var checker = arrayOfTypeCheckers[i];
        if (checker(props, propName, componentName, location, propFullName, ReactPropTypesSecret) == null) {
          return null;
        }
      }

      return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`.'));
    }
    return createChainableTypeChecker(validate);
  }

  function createNodeChecker() {
    function validate(props, propName, componentName, location, propFullName) {
      if (!isNode(props[propName])) {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` supplied to ' + ('`' + componentName + '`, expected a ReactNode.'));
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function createShapeTypeChecker(shapeTypes) {
    function validate(props, propName, componentName, location, propFullName) {
      var propValue = props[propName];
      var propType = getPropType(propValue);
      if (propType !== 'object') {
        return new PropTypeError('Invalid ' + location + ' `' + propFullName + '` of type `' + propType + '` ' + ('supplied to `' + componentName + '`, expected `object`.'));
      }
      for (var key in shapeTypes) {
        var checker = shapeTypes[key];
        if (!checker) {
          continue;
        }
        var error = checker(propValue, key, componentName, location, propFullName + '.' + key, ReactPropTypesSecret);
        if (error) {
          return error;
        }
      }
      return null;
    }
    return createChainableTypeChecker(validate);
  }

  function isNode(propValue) {
    switch (typeof propValue) {
      case 'number':
      case 'string':
      case 'undefined':
        return true;
      case 'boolean':
        return !propValue;
      case 'object':
        if (Array.isArray(propValue)) {
          return propValue.every(isNode);
        }
        if (propValue === null || isValidElement(propValue)) {
          return true;
        }

        var iteratorFn = getIteratorFn(propValue);
        if (iteratorFn) {
          var iterator = iteratorFn.call(propValue);
          var step;
          if (iteratorFn !== propValue.entries) {
            while (!(step = iterator.next()).done) {
              if (!isNode(step.value)) {
                return false;
              }
            }
          } else {
            // Iterator will provide entry [k,v] tuples rather than values.
            while (!(step = iterator.next()).done) {
              var entry = step.value;
              if (entry) {
                if (!isNode(entry[1])) {
                  return false;
                }
              }
            }
          }
        } else {
          return false;
        }

        return true;
      default:
        return false;
    }
  }

  function isSymbol(propType, propValue) {
    // Native Symbol.
    if (propType === 'symbol') {
      return true;
    }

    // 19.4.3.5 Symbol.prototype[@@toStringTag] === 'Symbol'
    if (propValue['@@toStringTag'] === 'Symbol') {
      return true;
    }

    // Fallback for non-spec compliant Symbols which are polyfilled.
    if (typeof Symbol === 'function' && propValue instanceof Symbol) {
      return true;
    }

    return false;
  }

  // Equivalent of `typeof` but with special handling for array and regexp.
  function getPropType(propValue) {
    var propType = typeof propValue;
    if (Array.isArray(propValue)) {
      return 'array';
    }
    if (propValue instanceof RegExp) {
      // Old webkits (at least until Android 4.0) return 'function' rather than
      // 'object' for typeof a RegExp. We'll normalize this here so that /bla/
      // passes PropTypes.object.
      return 'object';
    }
    if (isSymbol(propType, propValue)) {
      return 'symbol';
    }
    return propType;
  }

  // This handles more types than `getPropType`. Only used for error messages.
  // See `createPrimitiveTypeChecker`.
  function getPreciseType(propValue) {
    if (typeof propValue === 'undefined' || propValue === null) {
      return '' + propValue;
    }
    var propType = getPropType(propValue);
    if (propType === 'object') {
      if (propValue instanceof Date) {
        return 'date';
      } else if (propValue instanceof RegExp) {
        return 'regexp';
      }
    }
    return propType;
  }

  // Returns a string that is postfixed to a warning about an invalid type.
  // For example, "undefined" or "of type array"
  function getPostfixForTypeWarning(value) {
    var type = getPreciseType(value);
    switch (type) {
      case 'array':
      case 'object':
        return 'an ' + type;
      case 'boolean':
      case 'date':
      case 'regexp':
        return 'a ' + type;
      default:
        return type;
    }
  }

  // Returns class name of the object, if any.
  function getClassName(propValue) {
    if (!propValue.constructor || !propValue.constructor.name) {
      return ANONYMOUS;
    }
    return propValue.constructor.name;
  }

  ReactPropTypes.checkPropTypes = checkPropTypes;
  ReactPropTypes.PropTypes = ReactPropTypes;

  return ReactPropTypes;
};

}).call(this,require('_process'))
},{"./checkPropTypes":12,"./lib/ReactPropTypesSecret":16,"_process":11,"fbjs/lib/emptyFunction":4,"fbjs/lib/invariant":6,"fbjs/lib/warning":7}],15:[function(require,module,exports){
(function (process){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

if (process.env.NODE_ENV !== 'production') {
  var REACT_ELEMENT_TYPE = (typeof Symbol === 'function' &&
    Symbol.for &&
    Symbol.for('react.element')) ||
    0xeac7;

  var isValidElement = function(object) {
    return typeof object === 'object' &&
      object !== null &&
      object.$$typeof === REACT_ELEMENT_TYPE;
  };

  // By explicitly using `prop-types` you are opting into new development behavior.
  // http://fb.me/prop-types-in-prod
  var throwOnDirectAccess = true;
  module.exports = require('./factoryWithTypeCheckers')(isValidElement, throwOnDirectAccess);
} else {
  // By explicitly using `prop-types` you are opting into new production behavior.
  // http://fb.me/prop-types-in-prod
  module.exports = require('./factoryWithThrowingShims')();
}

}).call(this,require('_process'))
},{"./factoryWithThrowingShims":13,"./factoryWithTypeCheckers":14,"_process":11}],16:[function(require,module,exports){
/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 */

'use strict';

var ReactPropTypesSecret = 'SECRET_DO_NOT_PASS_THIS_OR_YOU_WILL_BE_FIRED';

module.exports = ReactPropTypesSecret;

},{}],17:[function(require,module,exports){
var Accessor = {
  IDENTITY_FN: function (input) {
    return input;
  },

  generateAccessor: function (field) {
    return function (object) {
      return object[field];
    };
  },

  generateOptionToStringFor: function (prop) {
    if (typeof prop === 'string') {
      return this.generateAccessor(prop);
    } else if (typeof prop === 'function') {
      return prop;
    } else {
      return this.IDENTITY_FN;
    }
  },

  valueForOption: function (option, object) {
    if (typeof option === 'string') {
      return object[option];
    } else if (typeof option === 'function') {
      return option(object);
    } else {
      return object;
    }
  }
};

module.exports = Accessor;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImFjY2Vzc29yLmpzIl0sIm5hbWVzIjpbIkFjY2Vzc29yIiwiSURFTlRJVFlfRk4iLCJpbnB1dCIsImdlbmVyYXRlQWNjZXNzb3IiLCJmaWVsZCIsIm9iamVjdCIsImdlbmVyYXRlT3B0aW9uVG9TdHJpbmdGb3IiLCJwcm9wIiwidmFsdWVGb3JPcHRpb24iLCJvcHRpb24iLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJQSxXQUFXO0FBQ2JDLGVBQWEsVUFBU0MsS0FBVCxFQUFnQjtBQUFFLFdBQU9BLEtBQVA7QUFBZSxHQURqQzs7QUFHYkMsb0JBQWtCLFVBQVNDLEtBQVQsRUFBZ0I7QUFDaEMsV0FBTyxVQUFTQyxNQUFULEVBQWlCO0FBQUUsYUFBT0EsT0FBT0QsS0FBUCxDQUFQO0FBQXVCLEtBQWpEO0FBQ0QsR0FMWTs7QUFPYkUsNkJBQTJCLFVBQVNDLElBQVQsRUFBZTtBQUN4QyxRQUFJLE9BQU9BLElBQVAsS0FBZ0IsUUFBcEIsRUFBOEI7QUFDNUIsYUFBTyxLQUFLSixnQkFBTCxDQUFzQkksSUFBdEIsQ0FBUDtBQUNELEtBRkQsTUFFTyxJQUFJLE9BQU9BLElBQVAsS0FBZ0IsVUFBcEIsRUFBZ0M7QUFDckMsYUFBT0EsSUFBUDtBQUNELEtBRk0sTUFFQTtBQUNMLGFBQU8sS0FBS04sV0FBWjtBQUNEO0FBQ0YsR0FmWTs7QUFpQmJPLGtCQUFnQixVQUFTQyxNQUFULEVBQWlCSixNQUFqQixFQUF5QjtBQUN2QyxRQUFJLE9BQU9JLE1BQVAsS0FBa0IsUUFBdEIsRUFBZ0M7QUFDOUIsYUFBT0osT0FBT0ksTUFBUCxDQUFQO0FBQ0QsS0FGRCxNQUVPLElBQUksT0FBT0EsTUFBUCxLQUFrQixVQUF0QixFQUFrQztBQUN2QyxhQUFPQSxPQUFPSixNQUFQLENBQVA7QUFDRCxLQUZNLE1BRUE7QUFDTCxhQUFPQSxNQUFQO0FBQ0Q7QUFDRjtBQXpCWSxDQUFmOztBQTRCQUssT0FBT0MsT0FBUCxHQUFpQlgsUUFBakIiLCJmaWxlIjoiYWNjZXNzb3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQWNjZXNzb3IgPSB7XG4gIElERU5USVRZX0ZOOiBmdW5jdGlvbihpbnB1dCkgeyByZXR1cm4gaW5wdXQ7IH0sXG5cbiAgZ2VuZXJhdGVBY2Nlc3NvcjogZnVuY3Rpb24oZmllbGQpIHtcbiAgICByZXR1cm4gZnVuY3Rpb24ob2JqZWN0KSB7IHJldHVybiBvYmplY3RbZmllbGRdOyB9O1xuICB9LFxuXG4gIGdlbmVyYXRlT3B0aW9uVG9TdHJpbmdGb3I6IGZ1bmN0aW9uKHByb3ApIHtcbiAgICBpZiAodHlwZW9mIHByb3AgPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gdGhpcy5nZW5lcmF0ZUFjY2Vzc29yKHByb3ApO1xuICAgIH0gZWxzZSBpZiAodHlwZW9mIHByb3AgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgIHJldHVybiBwcm9wO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXR1cm4gdGhpcy5JREVOVElUWV9GTjtcbiAgICB9XG4gIH0sXG5cbiAgdmFsdWVGb3JPcHRpb246IGZ1bmN0aW9uKG9wdGlvbiwgb2JqZWN0KSB7XG4gICAgaWYgKHR5cGVvZiBvcHRpb24gPT09ICdzdHJpbmcnKSB7XG4gICAgICByZXR1cm4gb2JqZWN0W29wdGlvbl07XG4gICAgfSBlbHNlIGlmICh0eXBlb2Ygb3B0aW9uID09PSAnZnVuY3Rpb24nKSB7XG4gICAgICByZXR1cm4gb3B0aW9uKG9iamVjdCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIHJldHVybiBvYmplY3Q7XG4gICAgfVxuICB9LFxufTtcblxubW9kdWxlLmV4cG9ydHMgPSBBY2Nlc3NvcjtcbiJdfQ==
},{}],18:[function(require,module,exports){
/**
 * PolyFills make me sad
 */
var KeyEvent = KeyEvent || {};
KeyEvent.DOM_VK_UP = KeyEvent.DOM_VK_UP || 38;
KeyEvent.DOM_VK_DOWN = KeyEvent.DOM_VK_DOWN || 40;
KeyEvent.DOM_VK_BACK_SPACE = KeyEvent.DOM_VK_BACK_SPACE || 8;
KeyEvent.DOM_VK_RETURN = KeyEvent.DOM_VK_RETURN || 13;
KeyEvent.DOM_VK_ENTER = KeyEvent.DOM_VK_ENTER || 14;
KeyEvent.DOM_VK_ESCAPE = KeyEvent.DOM_VK_ESCAPE || 27;
KeyEvent.DOM_VK_TAB = KeyEvent.DOM_VK_TAB || 9;

module.exports = KeyEvent;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImtleWV2ZW50LmpzIl0sIm5hbWVzIjpbIktleUV2ZW50IiwiRE9NX1ZLX1VQIiwiRE9NX1ZLX0RPV04iLCJET01fVktfQkFDS19TUEFDRSIsIkRPTV9WS19SRVRVUk4iLCJET01fVktfRU5URVIiLCJET01fVktfRVNDQVBFIiwiRE9NX1ZLX1RBQiIsIm1vZHVsZSIsImV4cG9ydHMiXSwibWFwcGluZ3MiOiJBQUFBOzs7QUFHQSxJQUFJQSxXQUFXQSxZQUFZLEVBQTNCO0FBQ0FBLFNBQVNDLFNBQVQsR0FBcUJELFNBQVNDLFNBQVQsSUFBc0IsRUFBM0M7QUFDQUQsU0FBU0UsV0FBVCxHQUF1QkYsU0FBU0UsV0FBVCxJQUF3QixFQUEvQztBQUNBRixTQUFTRyxpQkFBVCxHQUE2QkgsU0FBU0csaUJBQVQsSUFBOEIsQ0FBM0Q7QUFDQUgsU0FBU0ksYUFBVCxHQUF5QkosU0FBU0ksYUFBVCxJQUEwQixFQUFuRDtBQUNBSixTQUFTSyxZQUFULEdBQXdCTCxTQUFTSyxZQUFULElBQXlCLEVBQWpEO0FBQ0FMLFNBQVNNLGFBQVQsR0FBeUJOLFNBQVNNLGFBQVQsSUFBMEIsRUFBbkQ7QUFDQU4sU0FBU08sVUFBVCxHQUFzQlAsU0FBU08sVUFBVCxJQUF1QixDQUE3Qzs7QUFFQUMsT0FBT0MsT0FBUCxHQUFpQlQsUUFBakIiLCJmaWxlIjoia2V5ZXZlbnQuanMiLCJzb3VyY2VzQ29udGVudCI6WyIvKipcbiAqIFBvbHlGaWxscyBtYWtlIG1lIHNhZFxuICovXG52YXIgS2V5RXZlbnQgPSBLZXlFdmVudCB8fCB7fTtcbktleUV2ZW50LkRPTV9WS19VUCA9IEtleUV2ZW50LkRPTV9WS19VUCB8fCAzODtcbktleUV2ZW50LkRPTV9WS19ET1dOID0gS2V5RXZlbnQuRE9NX1ZLX0RPV04gfHwgNDA7XG5LZXlFdmVudC5ET01fVktfQkFDS19TUEFDRSA9IEtleUV2ZW50LkRPTV9WS19CQUNLX1NQQUNFIHx8IDg7XG5LZXlFdmVudC5ET01fVktfUkVUVVJOID0gS2V5RXZlbnQuRE9NX1ZLX1JFVFVSTiB8fCAxMztcbktleUV2ZW50LkRPTV9WS19FTlRFUiA9IEtleUV2ZW50LkRPTV9WS19FTlRFUiB8fCAxNDtcbktleUV2ZW50LkRPTV9WS19FU0NBUEUgPSBLZXlFdmVudC5ET01fVktfRVNDQVBFIHx8IDI3O1xuS2V5RXZlbnQuRE9NX1ZLX1RBQiA9IEtleUV2ZW50LkRPTV9WS19UQUIgfHwgOTtcblxubW9kdWxlLmV4cG9ydHMgPSBLZXlFdmVudDtcbiJdfQ==
},{}],19:[function(require,module,exports){
var Typeahead = require('./typeahead');
var Tokenizer = require('./tokenizer');

module.exports = {
  Typeahead: Typeahead,
  Tokenizer: Tokenizer
};
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInJlYWN0LXR5cGVhaGVhZC5qcyJdLCJuYW1lcyI6WyJUeXBlYWhlYWQiLCJyZXF1aXJlIiwiVG9rZW5pemVyIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSUEsWUFBWUMsUUFBUSxhQUFSLENBQWhCO0FBQ0EsSUFBSUMsWUFBWUQsUUFBUSxhQUFSLENBQWhCOztBQUVBRSxPQUFPQyxPQUFQLEdBQWlCO0FBQ2ZKLGFBQVdBLFNBREk7QUFFZkUsYUFBV0E7QUFGSSxDQUFqQiIsImZpbGUiOiJyZWFjdC10eXBlYWhlYWQuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgVHlwZWFoZWFkID0gcmVxdWlyZSgnLi90eXBlYWhlYWQnKTtcbnZhciBUb2tlbml6ZXIgPSByZXF1aXJlKCcuL3Rva2VuaXplcicpO1xuXG5tb2R1bGUuZXhwb3J0cyA9IHtcbiAgVHlwZWFoZWFkOiBUeXBlYWhlYWQsXG4gIFRva2VuaXplcjogVG9rZW5pemVyXG59O1xuIl19
},{"./tokenizer":20,"./typeahead":22}],20:[function(require,module,exports){
var Accessor = require('../accessor');
var React = window.React || require('react');
var Token = require('./token');
var KeyEvent = require('../keyevent');
var Typeahead = require('../typeahead');
var classNames = require('classnames');

function _arraysAreDifferent(array1, array2) {
  if (array1.length != array2.length) {
    return true;
  }
  for (var i = array2.length - 1; i >= 0; i--) {
    if (array2[i] !== array1[i]) {
      return true;
    }
  }
}

/**
 * A typeahead that, when an option is selected, instead of simply filling
 * the text entry widget, prepends a renderable "token", that may be deleted
 * by pressing backspace on the beginning of the line with the keyboard.
 */
var TypeaheadTokenizer = React.createClass({
  displayName: 'TypeaheadTokenizer',

  propTypes: {
    name: React.PropTypes.string,
    options: React.PropTypes.array,
    customClasses: React.PropTypes.object,
    allowCustomValues: React.PropTypes.number,
    defaultSelected: React.PropTypes.array,
    initialValue: React.PropTypes.string,
    placeholder: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    inputProps: React.PropTypes.object,
    onTokenRemove: React.PropTypes.func,
    onKeyDown: React.PropTypes.func,
    onKeyPress: React.PropTypes.func,
    onKeyUp: React.PropTypes.func,
    onTokenAdd: React.PropTypes.func,
    onFocus: React.PropTypes.func,
    onBlur: React.PropTypes.func,
    filterOption: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
    searchOptions: React.PropTypes.func,
    displayOption: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
    formInputOption: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.func]),
    maxVisible: React.PropTypes.number,
    resultsTruncatedMessage: React.PropTypes.string,
    defaultClassNames: React.PropTypes.bool
  },

  getInitialState: function () {
    return {
      // We need to copy this to avoid incorrect sharing
      // of state across instances (e.g., via getDefaultProps())
      selected: this.props.defaultSelected.slice(0)
    };
  },

  getDefaultProps: function () {
    return {
      options: [],
      defaultSelected: [],
      customClasses: {},
      allowCustomValues: 0,
      initialValue: "",
      placeholder: "",
      disabled: false,
      inputProps: {},
      defaultClassNames: true,
      filterOption: null,
      searchOptions: null,
      displayOption: function (token) {
        return token;
      },
      formInputOption: null,
      onKeyDown: function (event) {},
      onKeyPress: function (event) {},
      onKeyUp: function (event) {},
      onFocus: function (event) {},
      onBlur: function (event) {},
      onTokenAdd: function () {},
      onTokenRemove: function () {}
    };
  },

  componentWillReceiveProps: function (nextProps) {
    // if we get new defaultProps, update selected
    if (_arraysAreDifferent(this.props.defaultSelected, nextProps.defaultSelected)) {
      this.setState({ selected: nextProps.defaultSelected.slice(0) });
    }
  },

  focus: function () {
    this.refs.typeahead.focus();
  },

  getSelectedTokens: function () {
    return this.state.selected;
  },

  // TODO: Support initialized tokens
  //
  _renderTokens: function () {
    var tokenClasses = {};
    tokenClasses[this.props.customClasses.token] = !!this.props.customClasses.token;
    var classList = classNames(tokenClasses);
    var result = this.state.selected.map(function (selected) {
      var displayString = Accessor.valueForOption(this.props.displayOption, selected);
      var value = Accessor.valueForOption(this.props.formInputOption || this.props.displayOption, selected);
      return React.createElement(
        Token,
        { key: displayString, className: classList,
          onRemove: this._removeTokenForValue,
          object: selected,
          value: value,
          name: this.props.name },
        displayString
      );
    }, this);
    return result;
  },

  _getOptionsForTypeahead: function () {
    // return this.props.options without this.selected
    return this.props.options;
  },

  _onKeyDown: function (event) {
    // We only care about intercepting backspaces
    if (event.keyCode === KeyEvent.DOM_VK_BACK_SPACE) {
      return this._handleBackspace(event);
    }
    this.props.onKeyDown(event);
  },

  _handleBackspace: function (event) {
    // No tokens
    if (!this.state.selected.length) {
      return;
    }

    // Remove token ONLY when bksp pressed at beginning of line
    // without a selection
    var entry = this.refs.typeahead.refs.entry;
    if (entry.selectionStart == entry.selectionEnd && entry.selectionStart == 0) {
      this._removeTokenForValue(this.state.selected[this.state.selected.length - 1]);
      event.preventDefault();
    }
  },

  _removeTokenForValue: function (value) {
    var index = this.state.selected.indexOf(value);
    if (index == -1) {
      return;
    }

    this.state.selected.splice(index, 1);
    this.setState({ selected: this.state.selected });
    this.props.onTokenRemove(value);
    return;
  },

  _addTokenForValue: function (value) {
    if (this.state.selected.indexOf(value) != -1) {
      return;
    }
    this.state.selected.push(value);
    this.setState({ selected: this.state.selected });
    this.refs.typeahead.setEntryText("");
    this.props.onTokenAdd(value);
  },

  render: function () {
    var classes = {};
    classes[this.props.customClasses.typeahead] = !!this.props.customClasses.typeahead;
    var classList = classNames(classes);
    var tokenizerClasses = [this.props.defaultClassNames && "typeahead-tokenizer"];
    tokenizerClasses[this.props.className] = !!this.props.className;
    var tokenizerClassList = classNames(tokenizerClasses);

    return React.createElement(
      'div',
      { className: tokenizerClassList },
      this._renderTokens(),
      React.createElement(Typeahead, { ref: 'typeahead',
        className: classList,
        placeholder: this.props.placeholder,
        disabled: this.props.disabled,
        inputProps: this.props.inputProps,
        allowCustomValues: this.props.allowCustomValues,
        customClasses: this.props.customClasses,
        options: this._getOptionsForTypeahead(),
        initialValue: this.props.initialValue,
        maxVisible: this.props.maxVisible,
        resultsTruncatedMessage: this.props.resultsTruncatedMessage,
        onOptionSelected: this._addTokenForValue,
        onKeyDown: this._onKeyDown,
        onKeyPress: this.props.onKeyPress,
        onKeyUp: this.props.onKeyUp,
        onFocus: this.props.onFocus,
        onBlur: this.props.onBlur,
        displayOption: this.props.displayOption,
        defaultClassNames: this.props.defaultClassNames,
        filterOption: this.props.filterOption,
        searchOptions: this.props.searchOptions })
    );
  }
});

module.exports = TypeaheadTokenizer;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIkFjY2Vzc29yIiwicmVxdWlyZSIsIlJlYWN0IiwiVG9rZW4iLCJLZXlFdmVudCIsIlR5cGVhaGVhZCIsImNsYXNzTmFtZXMiLCJfYXJyYXlzQXJlRGlmZmVyZW50IiwiYXJyYXkxIiwiYXJyYXkyIiwibGVuZ3RoIiwiaSIsIlR5cGVhaGVhZFRva2VuaXplciIsImNyZWF0ZUNsYXNzIiwicHJvcFR5cGVzIiwibmFtZSIsIlByb3BUeXBlcyIsInN0cmluZyIsIm9wdGlvbnMiLCJhcnJheSIsImN1c3RvbUNsYXNzZXMiLCJvYmplY3QiLCJhbGxvd0N1c3RvbVZhbHVlcyIsIm51bWJlciIsImRlZmF1bHRTZWxlY3RlZCIsImluaXRpYWxWYWx1ZSIsInBsYWNlaG9sZGVyIiwiZGlzYWJsZWQiLCJib29sIiwiaW5wdXRQcm9wcyIsIm9uVG9rZW5SZW1vdmUiLCJmdW5jIiwib25LZXlEb3duIiwib25LZXlQcmVzcyIsIm9uS2V5VXAiLCJvblRva2VuQWRkIiwib25Gb2N1cyIsIm9uQmx1ciIsImZpbHRlck9wdGlvbiIsIm9uZU9mVHlwZSIsInNlYXJjaE9wdGlvbnMiLCJkaXNwbGF5T3B0aW9uIiwiZm9ybUlucHV0T3B0aW9uIiwibWF4VmlzaWJsZSIsInJlc3VsdHNUcnVuY2F0ZWRNZXNzYWdlIiwiZGVmYXVsdENsYXNzTmFtZXMiLCJnZXRJbml0aWFsU3RhdGUiLCJzZWxlY3RlZCIsInByb3BzIiwic2xpY2UiLCJnZXREZWZhdWx0UHJvcHMiLCJ0b2tlbiIsImV2ZW50IiwiY29tcG9uZW50V2lsbFJlY2VpdmVQcm9wcyIsIm5leHRQcm9wcyIsInNldFN0YXRlIiwiZm9jdXMiLCJyZWZzIiwidHlwZWFoZWFkIiwiZ2V0U2VsZWN0ZWRUb2tlbnMiLCJzdGF0ZSIsIl9yZW5kZXJUb2tlbnMiLCJ0b2tlbkNsYXNzZXMiLCJjbGFzc0xpc3QiLCJyZXN1bHQiLCJtYXAiLCJkaXNwbGF5U3RyaW5nIiwidmFsdWVGb3JPcHRpb24iLCJ2YWx1ZSIsIl9yZW1vdmVUb2tlbkZvclZhbHVlIiwiX2dldE9wdGlvbnNGb3JUeXBlYWhlYWQiLCJfb25LZXlEb3duIiwia2V5Q29kZSIsIkRPTV9WS19CQUNLX1NQQUNFIiwiX2hhbmRsZUJhY2tzcGFjZSIsImVudHJ5Iiwic2VsZWN0aW9uU3RhcnQiLCJzZWxlY3Rpb25FbmQiLCJwcmV2ZW50RGVmYXVsdCIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsIl9hZGRUb2tlbkZvclZhbHVlIiwicHVzaCIsInNldEVudHJ5VGV4dCIsInJlbmRlciIsImNsYXNzZXMiLCJ0b2tlbml6ZXJDbGFzc2VzIiwiY2xhc3NOYW1lIiwidG9rZW5pemVyQ2xhc3NMaXN0IiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSUEsV0FBV0MsUUFBUSxhQUFSLENBQWY7QUFDQSxJQUFJQyxRQUFRRCxRQUFRLE9BQVIsQ0FBWjtBQUNBLElBQUlFLFFBQVFGLFFBQVEsU0FBUixDQUFaO0FBQ0EsSUFBSUcsV0FBV0gsUUFBUSxhQUFSLENBQWY7QUFDQSxJQUFJSSxZQUFZSixRQUFRLGNBQVIsQ0FBaEI7QUFDQSxJQUFJSyxhQUFhTCxRQUFRLFlBQVIsQ0FBakI7O0FBRUEsU0FBU00sbUJBQVQsQ0FBNkJDLE1BQTdCLEVBQXFDQyxNQUFyQyxFQUE2QztBQUMzQyxNQUFJRCxPQUFPRSxNQUFQLElBQWlCRCxPQUFPQyxNQUE1QixFQUFtQztBQUNqQyxXQUFPLElBQVA7QUFDRDtBQUNELE9BQUssSUFBSUMsSUFBSUYsT0FBT0MsTUFBUCxHQUFnQixDQUE3QixFQUFnQ0MsS0FBSyxDQUFyQyxFQUF3Q0EsR0FBeEMsRUFBNkM7QUFDM0MsUUFBSUYsT0FBT0UsQ0FBUCxNQUFjSCxPQUFPRyxDQUFQLENBQWxCLEVBQTRCO0FBQzFCLGFBQU8sSUFBUDtBQUNEO0FBQ0Y7QUFDRjs7QUFFRDs7Ozs7QUFLQSxJQUFJQyxxQkFBcUJWLE1BQU1XLFdBQU4sQ0FBa0I7QUFBQTs7QUFDekNDLGFBQVc7QUFDVEMsVUFBTWIs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UCxHQUFpQi9FLGtCQUFqQiIsImZpbGUiOiJpbmRleC5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBBY2Nlc3NvciA9IHJlcXVpcmUoJy4uL2FjY2Vzc29yJyk7XG52YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIFRva2VuID0gcmVxdWlyZSgnLi90b2tlbicpO1xudmFyIEtleUV2ZW50ID0gcmVxdWlyZSgnLi4va2V5ZXZlbnQnKTtcbnZhciBUeXBlYWhlYWQgPSByZXF1aXJlKCcuLi90eXBlYWhlYWQnKTtcbnZhciBjbGFzc05hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG5mdW5jdGlvbiBfYXJyYXlzQXJlRGlmZmVyZW50KGFycmF5MSwgYXJyYXkyKSB7XG4gIGlmIChhcnJheTEubGVuZ3RoICE9IGFycmF5Mi5sZW5ndGgpe1xuICAgIHJldHVybiB0cnVlO1xuICB9XG4gIGZvciAodmFyIGkgPSBhcnJheTIubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICBpZiAoYXJyYXkyW2ldICE9PSBhcnJheTFbaV0pe1xuICAgICAgcmV0dXJuIHRydWU7XG4gICAgfVxuICB9XG59XG5cbi8qKlxuICogQSB0eXBlYWhlYWQgdGhhdCwgd2hlbiBhbiBvcHRpb24gaXMgc2VsZWN0ZWQsIGluc3RlYWQgb2Ygc2ltcGx5IGZpbGxpbmdcbiAqIHRoZSB0ZXh0IGVudHJ5IHdpZGdldCwgcHJlcGVuZHMgYSByZW5kZXJhYmxlIFwidG9rZW5cIiwgdGhhdCBtYXkgYmUgZGVsZXRlZFxuICogYnkgcHJlc3NpbmcgYmFja3NwYWNlIG9uIHRoZSBiZWdpbm5pbmcgb2YgdGhlIGxpbmUgd2l0aCB0aGUga2V5Ym9hcmQuXG4gKi9cbnZhciBUeXBlYWhlYWRUb2tlbml6ZXIgPSBSZWFjdC5jcmVhdGVDbGFzcyh7XG4gIHByb3BUeXBlczoge1xuICAgIG5hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgb3B0aW9uczogUmVhY3QuUHJvcFR5cGVzLmFycmF5LFxuICAgIGN1c3RvbUNsYXNzZXM6IFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgYWxsb3dDdXN0b21WYWx1ZXM6IFJlYWN0LlByb3BUeXBlcy5udW1iZXIsXG4gICAgZGVmYXVsdFNlbGVjdGVkOiBSZWFjdC5Qcm9wVHlwZXMuYXJyYXksXG4gICAgaW5pdGlhbFZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIHBsYWNlaG9sZGVyOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgIGRpc2FibGVkOiBSZWFjdC5Qcm9wVHlwZXMuYm9vbCxcbiAgICBpbnB1dFByb3BzOiBSZWFjdC5Qcm9wVHlwZXMub2JqZWN0LFxuICAgIG9uVG9rZW5SZW1vdmU6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgIG9uS2V5RG93bjogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25LZXlQcmVzczogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25LZXlVcDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25Ub2tlbkFkZDogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25Gb2N1czogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgb25CbHVyOiBSZWFjdC5Qcm9wVHlwZXMuZnVuYyxcbiAgICBmaWx0ZXJPcHRpb246IFJlYWN0LlByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgICAgUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgIFJlYWN0LlByb3BUeXBlcy5mdW5jXG4gICAgXSksXG4gICAgc2VhcmNoT3B0aW9uczogUmVhY3QuUHJvcFR5cGVzLmZ1bmMsXG4gICAgZGlzcGxheU9wdGlvbjogUmVhY3QuUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgUmVhY3QuUHJvcFR5cGVzLmZ1bmNcbiAgICBdKSxcbiAgICBmb3JtSW5wdXRPcHRpb246IFJlYWN0LlByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgICAgUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgIFJlYWN0LlByb3BUeXBlcy5mdW5jXG4gICAgXSksXG4gICAgbWF4VmlzaWJsZTogUmVhY3QuUHJvcFR5cGVzLm51bWJlcixcbiAgICByZXN1bHRzVHJ1bmNhdGVkTWVzc2FnZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICBkZWZhdWx0Q2xhc3NOYW1lczogUmVhY3QuUHJvcFR5cGVzLmJvb2xcbiAgfSxcblxuICBnZXRJbml0aWFsU3RhdGU6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICAvLyBXZSBuZWVkIHRvIGNvcHkgdGhpcyB0byBhdm9pZCBpbmNvcnJlY3Qgc2hhcmluZ1xuICAgICAgLy8gb2Ygc3RhdGUgYWNyb3NzIGluc3RhbmNlcyAoZS5nLiwgdmlhIGdldERlZmF1bHRQcm9wcygpKVxuICAgICAgc2VsZWN0ZWQ6IHRoaXMucHJvcHMuZGVmYXVsdFNlbGVjdGVkLnNsaWNlKDApXG4gICAgfTtcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBvcHRpb25zOiBbXSxcbiAgICAgIGRlZmF1bHRTZWxlY3RlZDogW10sXG4gICAgICBjdXN0b21DbGFzc2VzOiB7fSxcbiAgICAgIGFsbG93Q3VzdG9tVmFsdWVzOiAwLFxuICAgICAgaW5pdGlhbFZhbHVlOiBcIlwiLFxuICAgICAgcGxhY2Vob2xkZXI6IFwiXCIsXG4gICAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgICBpbnB1dFByb3BzOiB7fSxcbiAgICAgIGRlZmF1bHRDbGFzc05hbWVzOiB0cnVlLFxuICAgICAgZmlsdGVyT3B0aW9uOiBudWxsLFxuICAgICAgc2VhcmNoT3B0aW9uczogbnVsbCxcbiAgICAgIGRpc3BsYXlPcHRpb246IGZ1bmN0aW9uKHRva2VuKXsgcmV0dXJuIHRva2VuIH0sXG4gICAgICBmb3JtSW5wdXRPcHRpb246IG51bGwsXG4gICAgICBvbktleURvd246IGZ1bmN0aW9uKGV2ZW50KSB7fSxcbiAgICAgIG9uS2V5UHJlc3M6IGZ1bmN0aW9uKGV2ZW50KSB7fSxcbiAgICAgIG9uS2V5VXA6IGZ1bmN0aW9uKGV2ZW50KSB7fSxcbiAgICAgIG9uRm9jdXM6IGZ1bmN0aW9uKGV2ZW50KSB7fSxcbiAgICAgIG9uQmx1cjogZnVuY3Rpb24oZXZlbnQpIHt9LFxuICAgICAgb25Ub2tlbkFkZDogZnVuY3Rpb24oKSB7fSxcbiAgICAgIG9uVG9rZW5SZW1vdmU6IGZ1bmN0aW9uKCkge31cbiAgICB9O1xuICB9LFxuXG4gIGNvbXBvbmVudFdpbGxSZWNlaXZlUHJvcHM6IGZ1bmN0aW9uKG5leHRQcm9wcyl7XG4gICAgLy8gaWYgd2UgZ2V0IG5ldyBkZWZhdWx0UHJvcHMsIHVwZGF0ZSBzZWxlY3RlZFxuICAgIGlmIChfYXJyYXlzQXJlRGlmZmVyZW50KHRoaXMucHJvcHMuZGVmYXVsdFNlbGVjdGVkLCBuZXh0UHJvcHMuZGVmYXVsdFNlbGVjdGVkKSl7XG4gICAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZDogbmV4dFByb3BzLmRlZmF1bHRTZWxlY3RlZC5zbGljZSgwKX0pXG4gICAgfVxuICB9LFxuXG4gIGZvY3VzOiBmdW5jdGlvbigpe1xuICAgIHRoaXMucmVmcy50eXBlYWhlYWQuZm9jdXMoKTtcbiAgfSxcblxuICBnZXRTZWxlY3RlZFRva2VuczogZnVuY3Rpb24oKXtcbiAgICByZXR1cm4gdGhpcy5zdGF0ZS5zZWxlY3RlZDtcbiAgfSxcblxuICAvLyBUT0RPOiBTdXBwb3J0IGluaXRpYWxpemVkIHRva2Vuc1xuICAvL1xuICBfcmVuZGVyVG9rZW5zOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgdG9rZW5DbGFzc2VzID0ge307XG4gICAgdG9rZW5DbGFzc2VzW3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy50b2tlbl0gPSAhIXRoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy50b2tlbjtcbiAgICB2YXIgY2xhc3NMaXN0ID0gY2xhc3NOYW1lcyh0b2tlbkNsYXNzZXMpO1xuICAgIHZhciByZXN1bHQgPSB0aGlzLnN0YXRlLnNlbGVjdGVkLm1hcChmdW5jdGlvbihzZWxlY3RlZCkge1xuICAgICAgdmFyIGRpc3BsYXlTdHJpbmcgPSBBY2Nlc3Nvci52YWx1ZUZvck9wdGlvbih0aGlzLnByb3BzLmRpc3BsYXlPcHRpb24sIHNlbGVjdGVkKTtcbiAgICAgIHZhciB2YWx1ZSA9IEFjY2Vzc29yLnZhbHVlRm9yT3B0aW9uKHRoaXMucHJvcHMuZm9ybUlucHV0T3B0aW9uIHx8IHRoaXMucHJvcHMuZGlzcGxheU9wdGlvbiwgc2VsZWN0ZWQpO1xuICAgICAgcmV0dXJuIChcbiAgICAgICAgPFRva2VuIGtleT17ZGlzcGxheVN0cmluZ30gY2xhc3NOYW1lPXtjbGFzc0xpc3R9XG4gICAgICAgICAgb25SZW1vdmU9e3RoaXMuX3JlbW92ZVRva2VuRm9yVmFsdWV9XG4gICAgICAgICAgb2JqZWN0PXtzZWxlY3RlZH1cbiAgICAgICAgICB2YWx1ZT17dmFsdWV9XG4gICAgICAgICAgbmFtZT17dGhpcy5wcm9wcy5uYW1lfT5cbiAgICAgICAgICB7ZGlzcGxheVN0cmluZ31cbiAgICAgICAgPC9Ub2tlbj5cbiAgICAgICk7XG4gICAgfSwgdGhpcyk7XG4gICAgcmV0dXJuIHJlc3VsdDtcbiAgfSxcblxuICBfZ2V0T3B0aW9uc0ZvclR5cGVhaGVhZDogZnVuY3Rpb24oKSB7XG4gICAgLy8gcmV0dXJuIHRoaXMucHJvcHMub3B0aW9ucyB3aXRob3V0IHRoaXMuc2VsZWN0ZWRcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vcHRpb25zO1xuICB9LFxuXG4gIF9vbktleURvd246IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgLy8gV2Ugb25seSBjYXJlIGFib3V0IGludGVyY2VwdGluZyBiYWNrc3BhY2VzXG4gICAgaWYgKGV2ZW50LmtleUNvZGUgPT09IEtleUV2ZW50LkRPTV9WS19CQUNLX1NQQUNFKSB7XG4gICAgICByZXR1cm4gdGhpcy5faGFuZGxlQmFja3NwYWNlKGV2ZW50KTtcbiAgICB9XG4gICAgdGhpcy5wcm9wcy5vbktleURvd24oZXZlbnQpO1xuICB9LFxuXG4gIF9oYW5kbGVCYWNrc3BhY2U6IGZ1bmN0aW9uKGV2ZW50KXtcbiAgICAvLyBObyB0b2tlbnNcbiAgICBpZiAoIXRoaXMuc3RhdGUuc2VsZWN0ZWQubGVuZ3RoKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gUmVtb3ZlIHRva2VuIE9OTFkgd2hlbiBia3NwIHByZXNzZWQgYXQgYmVnaW5uaW5nIG9mIGxpbmVcbiAgICAvLyB3aXRob3V0IGEgc2VsZWN0aW9uXG4gICAgdmFyIGVudHJ5ID0gdGhpcy5yZWZzLnR5cGVhaGVhZC5yZWZzLmVudHJ5O1xuICAgIGlmIChlbnRyeS5zZWxlY3Rpb25TdGFydCA9PSBlbnRyeS5zZWxlY3Rpb25FbmQgJiZcbiAgICAgICAgZW50cnkuc2VsZWN0aW9uU3RhcnQgPT0gMCkge1xuICAgICAgdGhpcy5fcmVtb3ZlVG9rZW5Gb3JWYWx1ZShcbiAgICAgICAgdGhpcy5zdGF0ZS5zZWxlY3RlZFt0aGlzLnN0YXRlLnNlbGVjdGVkLmxlbmd0aCAtIDFdKTtcbiAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgfVxuICB9LFxuXG4gIF9yZW1vdmVUb2tlbkZvclZhbHVlOiBmdW5jdGlvbih2YWx1ZSkge1xuICAgIHZhciBpbmRleCA9IHRoaXMuc3RhdGUuc2VsZWN0ZWQuaW5kZXhPZih2YWx1ZSk7XG4gICAgaWYgKGluZGV4ID09IC0xKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgdGhpcy5zdGF0ZS5zZWxlY3RlZC5zcGxpY2UoaW5kZXgsIDEpO1xuICAgIHRoaXMuc2V0U3RhdGUoe3NlbGVjdGVkOiB0aGlzLnN0YXRlLnNlbGVjdGVkfSk7XG4gICAgdGhpcy5wcm9wcy5vblRva2VuUmVtb3ZlKHZhbHVlKTtcbiAgICByZXR1cm47XG4gIH0sXG5cbiAgX2FkZFRva2VuRm9yVmFsdWU6IGZ1bmN0aW9uKHZhbHVlKSB7XG4gICAgaWYgKHRoaXMuc3RhdGUuc2VsZWN0ZWQuaW5kZXhPZih2YWx1ZSkgIT0gLTEpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdGhpcy5zdGF0ZS5zZWxlY3RlZC5wdXNoKHZhbHVlKTtcbiAgICB0aGlzLnNldFN0YXRlKHtzZWxlY3RlZDogdGhpcy5zdGF0ZS5zZWxlY3RlZH0pO1xuICAgIHRoaXMucmVmcy50eXBlYWhlYWQuc2V0RW50cnlUZXh0KFwiXCIpO1xuICAgIHRoaXMucHJvcHMub25Ub2tlbkFkZCh2YWx1ZSk7XG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2xhc3NlcyA9IHt9O1xuICAgIGNsYXNzZXNbdGhpcy5wcm9wcy5jdXN0b21DbGFzc2VzLnR5cGVhaGVhZF0gPSAhIXRoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy50eXBlYWhlYWQ7XG4gICAgdmFyIGNsYXNzTGlzdCA9IGNsYXNzTmFtZXMoY2xhc3Nlcyk7XG4gICAgdmFyIHRva2VuaXplckNsYXNzZXMgPSBbdGhpcy5wcm9wcy5kZWZhdWx0Q2xhc3NOYW1lcyAmJiBcInR5cGVhaGVhZC10b2tlbml6ZXJcIl07XG4gICAgdG9rZW5pemVyQ2xhc3Nlc1t0aGlzLnByb3BzLmNsYXNzTmFtZV0gPSAhIXRoaXMucHJvcHMuY2xhc3NOYW1lO1xuICAgIHZhciB0b2tlbml6ZXJDbGFzc0xpc3QgPSBjbGFzc05hbWVzKHRva2VuaXplckNsYXNzZXMpXG5cbiAgICByZXR1cm4gKFxuICAgICAgPGRpdiBjbGFzc05hbWU9e3Rva2VuaXplckNsYXNzTGlzdH0+XG4gICAgICAgIHsgdGhpcy5fcmVuZGVyVG9rZW5zKCkgfVxuICAgICAgICA8VHlwZWFoZWFkIHJlZj1cInR5cGVhaGVhZFwiXG4gICAgICAgICAgY2xhc3NOYW1lPXtjbGFzc0xpc3R9XG4gICAgICAgICAgcGxhY2Vob2xkZXI9e3RoaXMucHJvcHMucGxhY2Vob2xkZXJ9XG4gICAgICAgICAgZGlzYWJsZWQ9e3RoaXMucHJvcHMuZGlzYWJsZWR9XG4gICAgICAgICAgaW5wdXRQcm9wcz17dGhpcy5wcm9wcy5pbnB1dFByb3BzfVxuICAgICAgICAgIGFsbG93Q3VzdG9tVmFsdWVzPXt0aGlzLnByb3BzLmFsbG93Q3VzdG9tVmFsdWVzfVxuICAgICAgICAgIGN1c3RvbUNsYXNzZXM9e3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlc31cbiAgICAgICAgICBvcHRpb25zPXt0aGlzLl9nZXRPcHRpb25zRm9yVHlwZWFoZWFkKCl9XG4gICAgICAgICAgaW5pdGlhbFZhbHVlPXt0aGlzLnByb3BzLmluaXRpYWxWYWx1ZX1cbiAgICAgICAgICBtYXhWaXNpYmxlPXt0aGlzLnByb3BzLm1heFZpc2libGV9XG4gICAgICAgICAgcmVzdWx0c1RydW5jYXRlZE1lc3NhZ2U9e3RoaXMucHJvcHMucmVzdWx0c1RydW5jYXRlZE1lc3NhZ2V9XG4gICAgICAgICAgb25PcHRpb25TZWxlY3RlZD17dGhpcy5fYWRkVG9rZW5Gb3JWYWx1ZX1cbiAgICAgICAgICBvbktleURvd249e3RoaXMuX29uS2V5RG93bn1cbiAgICAgICAgICBvbktleVByZXNzPXt0aGlzLnByb3BzLm9uS2V5UHJlc3N9XG4gICAgICAgICAgb25LZXlVcD17dGhpcy5wcm9wcy5vbktleVVwfVxuICAgICAgICAgIG9uRm9jdXM9e3RoaXMucHJvcHMub25Gb2N1c31cbiAgICAgICAgICBvbkJsdXI9e3RoaXMucHJvcHMub25CbHVyfVxuICAgICAgICAgIGRpc3BsYXlPcHRpb249e3RoaXMucHJvcHMuZGlzcGxheU9wdGlvbn1cbiAgICAgICAgICBkZWZhdWx0Q2xhc3NOYW1lcz17dGhpcy5wcm9wcy5kZWZhdWx0Q2xhc3NOYW1lc31cbiAgICAgICAgICBmaWx0ZXJPcHRpb249e3RoaXMucHJvcHMuZmlsdGVyT3B0aW9ufVxuICAgICAgICAgIHNlYXJjaE9wdGlvbnM9e3RoaXMucHJvcHMuc2VhcmNoT3B0aW9uc30gLz5cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFR5cGVhaGVhZFRva2VuaXplcjtcbiJdfQ==
},{"../accessor":17,"../keyevent":18,"../typeahead":22,"./token":21,"classnames":1,"react":"react"}],21:[function(require,module,exports){
var React = window.React || require('react');
var classNames = require('classnames');

/**
 * Encapsulates the rendering of an option that has been "selected" in a
 * TypeaheadTokenizer
 */
var Token = React.createClass({
  displayName: 'Token',

  propTypes: {
    className: React.PropTypes.string,
    name: React.PropTypes.string,
    children: React.PropTypes.string,
    object: React.PropTypes.oneOfType([React.PropTypes.string, React.PropTypes.object]),
    onRemove: React.PropTypes.func,
    value: React.PropTypes.string
  },

  render: function () {
    var className = classNames(["typeahead-token", this.props.className]);

    return React.createElement(
      'div',
      { className: className },
      this._renderHiddenInput(),
      this.props.children,
      this._renderCloseButton()
    );
  },

  _renderHiddenInput: function () {
    // If no name was set, don't create a hidden input
    if (!this.props.name) {
      return null;
    }

    return React.createElement('input', {
      type: 'hidden',
      name: this.props.name + '[]',
      value: this.props.value || this.props.object
    });
  },

  _renderCloseButton: function () {
    if (!this.props.onRemove) {
      return "";
    }
    return React.createElement(
      'a',
      { className: this.props.className || "typeahead-token-close", href: '#', onClick: function (event) {
          this.props.onRemove(this.props.object);
          event.preventDefault();
        }.bind(this) },
      '\xD7'
    );
  }
});

module.exports = Token;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInRva2VuLmpzIl0sIm5hbWVzIjpbIlJlYWN0IiwicmVxdWlyZSIsImNsYXNzTmFtZXMiLCJUb2tlbiIsImNyZWF0ZUNsYXNzIiwicHJvcFR5cGVzIiwiY2xhc3NOYW1lIiwiUHJvcFR5cGVzIiwic3RyaW5nIiwibmFtZSIsImNoaWxkcmVuIiwib2JqZWN0Iiwib25lT2ZUeXBlIiwib25SZW1vdmUiLCJmdW5jIiwidmFsdWUiLCJyZW5kZXIiLCJwcm9wcyIsIl9yZW5kZXJIaWRkZW5JbnB1dCIsIl9yZW5kZXJDbG9zZUJ1dHRvbiIsImV2ZW50IiwicHJldmVudERlZmF1bHQiLCJiaW5kIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSUEsUUFBUUMsUUFBUSxPQUFSLENBQVo7QUFDQSxJQUFJQyxhQUFhRCxRQUFRLFlBQVIsQ0FBakI7O0FBRUE7Ozs7QUFJQSxJQUFJRSxRQUFRSCxNQUFNSSxXQUFOLENBQWtCO0FBQUE7O0FBQzVCQyxhQUFXO0FBQ1RDLGVBQVdOLE1BQU1PLFNBQU4sQ0FBZ0JDLE1BRGxCO0FBRVRDLFVBQU1ULE1BQU1PLFNBQU4sQ0FBZ0JDLE1BRmI7QUFHVEUsY0FBVVYsTUFBTU8sU0FBTixDQUFnQkMsTUFIakI7QUFJVEcsWUFBUVgsTUFBTU8sU0FBTixDQUFnQkssU0FBaEIsQ0FBMEIsQ0FDaENaLE1BQU1PLFNBQU4sQ0FBZ0JDLE1BRGdCLEVBRWhDUixNQUFNTyxTQUFOLENBQWdCSSxNQUZnQixDQUExQixDQUpDO0FBUVRFLGNBQVViLE1BQU1PLFNBQU4sQ0FBZ0JPLElBUmpCO0FBU1RDLFdBQU9mLE1BQU1PLFNBQU4sQ0FBZ0JDO0FBVGQsR0FEaUI7O0FBYTVCUSxVQUFRLFlBQVc7QUFDakIsUUFBSVYsWUFBWUosV0FBVyxDQUN6QixpQkFEeUIsRUFFekIsS0FBS2UsS0FBTCxDQUFXWCxTQUZjLENBQVgsQ0FBaEI7O0FBS0EsV0FDRTtBQUFBO0FBQUEsUUFBSyxXQUFXQSxTQUFoQjtBQUNHLFdBQUtZLGtCQUFMLEVBREg7QUFFRyxXQUFLRCxLQUFMLENBQVdQLFFBRmQ7QUFHRyxXQUFLUyxrQkFBTDtBQUhILEtBREY7QUFPRCxHQTFCMkI7O0FBNEI1QkQsc0JBQW9CLFlBQVc7QUFDN0I7QUFDQSxRQUFJLENBQUMsS0FBS0QsS0FBTCxDQUFXUixJQUFoQixFQUFzQjtBQUNwQixhQUFPLElBQVA7QUFDRDs7QUFFRCxXQUNFO0FBQ0UsWUFBSyxRQURQO0FBRUUsWUFBTyxLQUFLUSxLQUFMLENBQVdSLElBQVgsR0FBa0IsSUFGM0I7QUFHRSxhQUFRLEtBQUtRLEtBQUwsQ0FBV0YsS0FBWCxJQUFvQixLQUFLRSxLQUFMLENBQVdOO0FBSHpDLE1BREY7QUFPRCxHQXpDMkI7O0FBMkM1QlEsc0JBQW9CLFlBQVc7QUFDN0IsUUFBSSxDQUFDLEtBQUtGLEtBQUwsQ0FBV0osUUFBaEIsRUFBMEI7QUFDeEIsYUFBTyxFQUFQO0FBQ0Q7QUFDRCxXQUNFO0FBQUE7QUFBQSxRQUFHLFdBQVcsS0FBS0ksS0FBTCxDQUFXWCxTQUFYLElBQXdCLHVCQUF0QyxFQUErRCxNQUFLLEdBQXBFLEVBQXdFLFNBQVMsVUFBU2MsS0FBVCxFQUFnQjtBQUM3RixlQUFLSCxLQUFMLENBQVdKLFFBQVgsQ0FBb0IsS0FBS0ksS0FBTCxDQUFXTixNQUEvQjtBQUNBUyxnQkFBTUMsY0FBTjtBQUNELFNBSDhFLENBRzdFQyxJQUg2RSxDQUd4RSxJQUh3RSxDQUFqRjtBQUFBO0FBQUEsS0FERjtBQU1EO0FBckQyQixDQUFsQixDQUFaOztBQXdEQUMsT0FBT0MsT0FBUCxHQUFpQnJCLEtBQWpCIiwiZmlsZSI6InRva2VuLmpzIiwic291cmNlc0NvbnRlbnQiOlsidmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBjbGFzc05hbWVzID0gcmVxdWlyZSgnY2xhc3NuYW1lcycpO1xuXG4vKipcbiAqIEVuY2Fwc3VsYXRlcyB0aGUgcmVuZGVyaW5nIG9mIGFuIG9wdGlvbiB0aGF0IGhhcyBiZWVuIFwic2VsZWN0ZWRcIiBpbiBhXG4gKiBUeXBlYWhlYWRUb2tlbml6ZXJcbiAqL1xudmFyIFRva2VuID0gUmVhY3QuY3JlYXRlQ2xhc3Moe1xuICBwcm9wVHlwZXM6IHtcbiAgICBjbGFzc05hbWU6IFJlYWN0LlByb3BUeXBlcy5zdHJpbmcsXG4gICAgbmFtZTogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICBjaGlsZHJlbjogUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICBvYmplY3Q6IFJlYWN0LlByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgICAgUmVhY3QuUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgIFJlYWN0LlByb3BUeXBlcy5vYmplY3QsXG4gICAgXSksXG4gICAgb25SZW1vdmU6IFJlYWN0LlByb3BUeXBlcy5mdW5jLFxuICAgIHZhbHVlOiBSZWFjdC5Qcm9wVHlwZXMuc3RyaW5nXG4gIH0sXG5cbiAgcmVuZGVyOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2xhc3NOYW1lID0gY2xhc3NOYW1lcyhbXG4gICAgICBcInR5cGVhaGVhZC10b2tlblwiLFxuICAgICAgdGhpcy5wcm9wcy5jbGFzc05hbWVcbiAgICBdKTtcblxuICAgIHJldHVybiAoXG4gICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NOYW1lfT5cbiAgICAgICAge3RoaXMuX3JlbmRlckhpZGRlbklucHV0KCl9XG4gICAgICAgIHt0aGlzLnByb3BzLmNoaWxkcmVufVxuICAgICAgICB7dGhpcy5fcmVuZGVyQ2xvc2VCdXR0b24oKX1cbiAgICAgIDwvZGl2PlxuICAgICk7XG4gIH0sXG5cbiAgX3JlbmRlckhpZGRlbklucHV0OiBmdW5jdGlvbigpIHtcbiAgICAvLyBJZiBubyBuYW1lIHdhcyBzZXQsIGRvbid0IGNyZWF0ZSBhIGhpZGRlbiBpbnB1dFxuICAgIGlmICghdGhpcy5wcm9wcy5uYW1lKSB7XG4gICAgICByZXR1cm4gbnVsbDtcbiAgICB9XG5cbiAgICByZXR1cm4gKFxuICAgICAgPGlucHV0XG4gICAgICAgIHR5cGU9XCJoaWRkZW5cIlxuICAgICAgICBuYW1lPXsgdGhpcy5wcm9wcy5uYW1lICsgJ1tdJyB9XG4gICAgICAgIHZhbHVlPXsgdGhpcy5wcm9wcy52YWx1ZSB8fCB0aGlzLnByb3BzLm9iamVjdCB9XG4gICAgICAvPlxuICAgICk7XG4gIH0sXG5cbiAgX3JlbmRlckNsb3NlQnV0dG9uOiBmdW5jdGlvbigpIHtcbiAgICBpZiAoIXRoaXMucHJvcHMub25SZW1vdmUpIHtcbiAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cbiAgICByZXR1cm4gKFxuICAgICAgPGEgY2xhc3NOYW1lPXt0aGlzLnByb3BzLmNsYXNzTmFtZSB8fCBcInR5cGVhaGVhZC10b2tlbi1jbG9zZVwifSBocmVmPVwiI1wiIG9uQ2xpY2s9e2Z1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgICAgdGhpcy5wcm9wcy5vblJlbW92ZSh0aGlzLnByb3BzLm9iamVjdCk7XG4gICAgICAgICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpfT4mI3gwMGQ3OzwvYT5cbiAgICApO1xuICB9XG59KTtcblxubW9kdWxlLmV4cG9ydHMgPSBUb2tlbjtcbiJdfQ==
},{"classnames":1,"react":"react"}],22:[function(require,module,exports){
var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var Accessor = require('../accessor');
var React = window.React || require('react');
var createClass = require('create-react-class');
var PropTypes = require('prop-types');
var TypeaheadSelector = require('./selector');
var KeyEvent = require('../keyevent');
var fuzzy = require('fuzzy');
var classNames = require('classnames');
var noop = require('lodash').noop;

/**
 * A "typeahead", an auto-completing text input
 *
 * Renders an text input that shows options nearby that you can use the
 * keyboard or mouse to select.  Requires CSS for MASSIVE DAMAGE.
 */
var Typeahead = createClass({
    propTypes: {
        name: PropTypes.string,
        customClasses: PropTypes.object,
        maxVisible: PropTypes.number,
        resultsTruncatedMessage: PropTypes.string,
        options: PropTypes.array,
        allowCustomValues: PropTypes.number,
        initialValue: PropTypes.string,
        value: PropTypes.string,
        placeholder: PropTypes.string,
        disabled: PropTypes.bool,
        textarea: PropTypes.bool,
        inputProps: PropTypes.object,
        onOptionSelected: PropTypes.func,
        onChange: PropTypes.func,
        onKeyDown: PropTypes.func,
        onKeyPress: PropTypes.func,
        onKeyUp: PropTypes.func,
        onFocus: PropTypes.func,
        onBlur: PropTypes.func,
        filterOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        searchOptions: PropTypes.func,
        displayOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        inputDisplayOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        formInputOption: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),
        defaultClassNames: PropTypes.bool,
        customListComponent: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
        showOptionsWhenEmpty: PropTypes.bool,
        onCustomOptionChildClick: PropTypes.func,
        customOptionChild: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
        topOption: PropTypes.string,
        showTopOption: PropTypes.bool,
        onTopOptionClick: PropTypes.func
    },

    getDefaultProps: function () {
        return {
            options: [],
            customClasses: {},
            allowCustomValues: 0,
            initialValue: "",
            value: "",
            placeholder: "",
            disabled: false,
            textarea: false,
            inputProps: {},
            onOptionSelected: noop,
            onChange: noop,
            onKeyDown: noop,
            onKeyPress: noop,
            onKeyUp: noop,
            onFocus: noop,
            onBlur: noop,
            filterOption: null,
            searchOptions: null,
            inputDisplayOption: null,
            defaultClassNames: true,
            customListComponent: TypeaheadSelector,
            showOptionsWhenEmpty: false,
            resultsTruncatedMessage: null,
            customOptionChild: null,
            onCustomOptionChildClick: noop,
            topOption: '',
            showTopOption: false,
            onTopOptionClick: noop
        };
    },

    getInitialState: function () {
        return {
            // The options matching the entry value
            searchResults: this.getOptionsForValue(this.props.initialValue, this.props.options),

            // This should be called something else, "entryValue"
            entryValue: this.props.value || this.props.initialValue,

            // A valid typeahead value
            selection: this.props.value,

            // Index of the selection
            selectionIndex: null,

            // Keep track of the focus state of the input element, to determine
            // whether to show options when empty (if showOptionsWhenEmpty is true)
            isFocused: false,

            // true when focused, false onOptionSelected
            showResults: false
        };
    },

    _shouldSkipSearch: function (input) {
        var emptyValue = !input || input.trim().length == 0;

        // this.state must be checked because it may not be defined yet if this function
        // is called from within getInitialState
        var isFocused = this.state && this.state.isFocused;
        return !(this.props.showOptionsWhenEmpty && isFocused) && emptyValue;
    },

    getOptionsForValue: function (value, options) {
        if (this._shouldSkipSearch(value)) {
            return [];
        }

        var searchOptions = this._generateSearchFunction();
        return searchOptions(value, options);
    },

    focus: function () {
        this.refs.entry.focus();
    },

    _hasCustomValue: function () {
        if (this.props.allowCustomValues > 0 && this.state.entryValue.length >= this.props.allowCustomValues && this.state.searchResults.indexOf(this.state.entryValue) < 0) {
            return true;
        }
        return false;
    },

    _getCustomValue: function () {
        if (this._hasCustomValue()) {
            return this.state.entryValue;
        }
        return null;
    },

    _renderIncrementalSearchResults: function () {
        // Nothing has been entered into the textbox
        if (this._shouldSkipSearch(this.state.entryValue)) {
            return "";
        }

        // Something was just selected
        if (this.state.selection) {
            return "";
        }

        return React.createElement(this.props.customListComponent, {
            ref: 'sel',
            options: this.props.maxVisible ? this.state.searchResults.slice(0, this.props.maxVisible) : this.state.searchResults,
            areResultsTruncated: this.props.maxVisible && this.state.searchResults.length > this.props.maxVisible,
            resultsTruncatedMessage: this.props.resultsTruncatedMessage,
            onOptionSelected: this._onOptionSelected,
            allowCustomValues: this.props.allowCustomValues,
            customValue: this._getCustomValue(),
            customClasses: this.props.customClasses,
            selectionIndex: this.state.selectionIndex,
            defaultClassNames: this.props.defaultClassNames,
            displayOption: Accessor.generateOptionToStringFor(this.props.displayOption),
            customOptionChild: this.props.customOptionChild,
            onCustomOptionChildClick: this.props.onCustomOptionChildClick,
            topOption: this.props.topOption,
            showTopOption: this.props.showTopOption,
            onTopOptionClick: this.props.onTopOptionClick
        });
    },

    getSelection: function () {
        var index = this.state.selectionIndex;
        if (this._hasCustomValue()) {
            if (index === 0) {
                return this.state.entryValue;
            } else {
                index--;
            }
        }
        return this.state.searchResults[index];
    },

    _onOptionSelected: function (option, event) {
        var nEntry = this.refs.entry;
        nEntry.focus();

        var displayOption = Accessor.generateOptionToStringFor(this.props.inputDisplayOption || this.props.displayOption);
        var optionString = displayOption(option, 0);

        var formInputOption = Accessor.generateOptionToStringFor(this.props.formInputOption || displayOption);
        var formInputOptionString = formInputOption(option);

        nEntry.value = optionString;
        this.setState({
            searchResults: this.getOptionsForValue(optionString, this.props.options),
            selection: formInputOptionString,
            entryValue: optionString,
            showResults: false
        });
        return this.props.onOptionSelected(option, event);
    },

    _onTextEntryUpdated: function () {
        var value = this.refs.entry.value;
        this.setState({
            searchResults: this.getOptionsForValue(value, this.props.options),
            selection: '',
            entryValue: value
        });
    },

    _onEnter: function (event) {
        var selection = this.getSelection();
        if (!selection) {
            return this.props.onKeyDown(event);
        }
        return this._onOptionSelected(selection, event);
    },

    _onEscape: function () {
        this.setState({
            selectionIndex: null
        });
    },

    _onTab: function (event) {
        var selection = this.getSelection();
        var option = selection ? selection : this.state.searchResults.length > 0 ? this.state.searchResults[0] : null;

        if (option === null && this._hasCustomValue()) {
            option = this._getCustomValue();
        }

        if (option !== null) {
            return this._onOptionSelected(option, event);
        }
    },

    eventMap: function (event) {
        var events = {};

        events[KeyEvent.DOM_VK_UP] = this.navUp;
        events[KeyEvent.DOM_VK_DOWN] = this.navDown;
        events[KeyEvent.DOM_VK_RETURN] = events[KeyEvent.DOM_VK_ENTER] = this._onEnter;
        events[KeyEvent.DOM_VK_ESCAPE] = this._onEscape;
        events[KeyEvent.DOM_VK_TAB] = this._onTab;

        return events;
    },

    _nav: function (delta) {
        if (!this._hasHint()) {
            return;
        }
        var newIndex = this.state.selectionIndex === null ? delta == 1 ? 0 : delta : this.state.selectionIndex + delta;
        var length = this.props.maxVisible ? this.state.searchResults.slice(0, this.props.maxVisible).length : this.state.searchResults.length;
        if (this._hasCustomValue()) {
            length += 1;
        }

        if (newIndex < 0) {
            newIndex += length;
        } else if (newIndex >= length) {
            newIndex -= length;
        }

        this.setState({ selectionIndex: newIndex });
    },

    navDown: function () {
        this._nav(1);
    },

    navUp: function () {
        this._nav(-1);
    },

    setEntryText: function (value) {
        this.refs.entry.value = value;
        this.refs.entry.dispatchEvent(new Event('input', { bubbles: true }));
    },

    _onChange: function (event) {
        if (this.props.onChange) {
            this.props.onChange(event);
        }

        this._onTextEntryUpdated();
    },

    _onKeyDown: function (event) {
        // If there are no visible elements, don't perform selector navigation.
        // Just pass this up to the upstream onKeydown handler.
        // Also skip if the user is pressing the shift key, since none of our handlers are looking for shift
        if (!this._hasHint() || event.shiftKey) {
            return this.props.onKeyDown(event);
        }

        var handler = this.eventMap()[event.keyCode];

        if (handler) {
            handler(event);
        } else {
            return this.props.onKeyDown(event);
        }
        // Don't propagate the keystroke back to the DOM/browser
        event.preventDefault();
    },

    componentWillReceiveProps: function (nextProps) {
        this.setState({
            searchResults: this.getOptionsForValue(this.state.entryValue, nextProps.options)
        });
    },

    render: function () {
        var inputClasses = {};
        inputClasses[this.props.customClasses.input] = !!this.props.customClasses.input;
        var inputClassList = classNames(inputClasses);

        var classes = {
            typeahead: this.props.defaultClassNames
        };
        classes[this.props.className] = !!this.props.className;
        var classList = classNames(classes);

        var InputElement = this.props.textarea ? 'textarea' : 'input';
        return React.createElement(
            'div',
            { className: classList },
            this._renderHiddenInput(),
            React.createElement(InputElement, _extends({ ref: 'entry', type: 'text',
                disabled: this.props.disabled
            }, this.props.inputProps, {
                placeholder: this.props.placeholder,
                className: inputClassList,
                value: this.state.entryValue,
                onChange: this._onChange,
                onKeyDown: this._onKeyDown,
                onKeyPress: this.props.onKeyPress,
                onKeyUp: this.props.onKeyUp,
                onFocus: this._onFocus,
                onBlur: this._onBlur
            })),
            this.state.showResults && this._renderIncrementalSearchResults()
        );
    },

    _onFocus: function (event) {
        this.setState({ isFocused: true, showResults: true }, function () {
            this._onTextEntryUpdated();
        }.bind(this));
        if (this.props.onFocus) {
            return this.props.onFocus(event);
        }
    },

    _onBlur: function (event) {
        this.setState({ isFocused: false }, function () {
            this._onTextEntryUpdated();
        }.bind(this));
        if (this.props.onBlur) {
            return this.props.onBlur(event);
        }
    },

    _renderHiddenInput: function () {
        if (!this.props.name) {
            return null;
        }

        return React.createElement('input', {
            type: 'hidden',
            name: this.props.name,
            value: this.state.selection
        });
    },

    _generateSearchFunction: function () {
        var searchOptionsProp = this.props.searchOptions;
        var filterOptionProp = this.props.filterOption;
        if (typeof searchOptionsProp === 'function') {
            if (filterOptionProp !== null) {
                console.warn('searchOptions prop is being used, filterOption prop will be ignored');
            }
            return searchOptionsProp;
        } else if (typeof filterOptionProp === 'function') {
            return function (value, options) {
                return options.filter(function (o) {
                    return filterOptionProp(value, o);
                });
            };
        } else {
            var mapper;
            if (typeof filterOptionProp === 'string') {
                mapper = Accessor.generateAccessor(filterOptionProp);
            } else {
                mapper = Accessor.IDENTITY_FN;
            }
            return function (value, options) {
                return fuzzy.filter(value, options, { extract: mapper }).map(function (res) {
                    return options[res.index];
                });
            };
        }
    },

    _hasHint: function () {
        return this.state.searchResults.length > 0 || this._hasCustomValue();
    }
});

module.exports = Typeahead;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LmpzIl0sIm5hbWVzIjpbIkFjY2Vzc29yIiwicmVxdWlyZSIsIlJlYWN0IiwiY3JlYXRlQ2xhc3MiLCJQcm9wVHlwZXMiLCJUeXBlYWhlYWRTZWxlY3RvciIsIktleUV2ZW50IiwiZnV6enkiLCJjbGFzc05hbWVzIiwibm9vcCIsIlR5cGVhaGVhZCIsInByb3BUeXBlcyIsIm5hbWUiLCJzdHJpbmciLCJjdXN0b21DbGFzc2VzIiwib2JqZWN0IiwibWF4VmlzaWJsZSIsIm51bWJlciIsInJlc3VsdHNUcnVuY2F0ZWRNZXNzYWdlIiwib3B0aW9ucyIsImFycmF5IiwiYWxsb3dDdXN0b21WYWx1ZXMiLCJpbml0aWFsVmFsdWUiLCJ2YWx1ZSIsInBsYWNlaG9sZGVyIiwiZGlzYWJsZWQiLCJib29sIiwidGV4dGFyZWEiLCJpbnB1dFByb3BzIiwib25PcHRpb25TZWxlY3RlZCIsImZ1bmMiLCJvbkNoYW5nZSIsIm9uS2V5RG93biIsIm9uS2V5UHJlc3MiLCJvbktleVVwIiwib25Gb2N1cyIsIm9uQmx1ciIsImZpbHRlck9wdGlvbiIsIm9uZU9mVHlwZSIsInNlYXJjaE9wdGlvbnMiLCJkaXNwbGF5T3B0aW9uIiwiaW5wdXREaXNwbGF5T3B0aW9uIiwiZm9ybUlucHV0T3B0aW9uIiwiZGVmYXVsdENsYXNzTmFtZXMiLCJjdXN0b21MaXN0Q29tcG9uZW50IiwiZWxlbWVudCIsInNob3dPcHRpb25zV2hlbkVtcHR5Iiwib25DdXN0b21PcHRpb25DaGlsZENsaWNrIiwiY3VzdG9tT3B0aW9uQ2hpbGQiLCJ0b3BPcHRpb24iLCJzaG93VG9wT3B0aW9uIiwib25Ub3BPcHRpb25DbGljayIsImdldERlZmF1bHRQcm9wcyIsImdldEluaXRpYWxTdGF0ZSIsInNlYXJjaFJlc3VsdHMiLCJnZXRPcHRpb25zRm9yVmFsdWUiLCJwcm9wcyIsImVudHJ5VmFsdWUiLCJzZWxlY3Rpb24iLCJzZWxlY3Rpb25JbmRleCIsImlzRm9jdXNlZCIsInNob3dSZXN1bHRzIiwiX3Nob3VsZFNraXBTZWFyY2giLCJpbnB1dCIsImVtcHR5VmFsdWUiLCJ0cmltIiwibGVuZ3RoIiwic3RhdGUiLCJfZ2VuZXJhdGVTZWFyY2hGdW5jdGlvbiIsImZvY3VzIiwicmVmcyIsImVudHJ5IiwiX2hhc0N1c3RvbVZhbHVlIiwiaW5kZXhPZiIsIl9nZXRDdXN0b21WYWx1ZSIsIl9yZW5kZXJJbmNyZW1lbnRhbFNlYXJjaFJlc3VsdHMiLCJzbGljZSIsIl9vbk9wdGlvblNlbGVjdGVkIiwiZ2VuZXJhdGVPcHRpb25Ub1N0cmluZ0ZvciIsImdldFNlbGVjdGlvbiIsImluZGV4Iiwib3B0aW9uIiwiZXZlbnQiLCJuRW50cnkiLCJvcHRpb25TdHJpbmciLCJmb3JtSW5wdXRPcHRpb25TdHJpbmciLCJzZXRTdGF0ZSIsIl9vblRleHRFbnRyeVVwZGF0ZWQiLCJfb25FbnRlciIsIl9vbkVzY2FwZSIsIl9vblRhYiIsImV2ZW50TWFwIiwiZXZlbnRzIiwiRE9NX1ZLX1VQIiwibmF2VXAiLCJET01fVktfRE9XTiIsIm5hdkRvd24iLCJET01fVktfUkVUVVJOIiwiRE9NX1ZLX0VOVEVSIiwiRE9NX1ZLX0VTQ0FQRSIsIkRPTV9WS19UQUIiLCJfbmF2IiwiZGVsdGEiLCJfaGFzSGludCIsIm5ld0luZGV4Iiwic2V0RW50cnlUZXh0IiwiZGlzcGF0Y2hFdmVudCIsIkV2ZW50IiwiYnViYmxlcyIsIl9vbkNoYW5nZSIsIl9vbktleURvd24iLCJzaGlmdEtleSIsImhhbmRsZXIiLCJrZXlDb2RlIiwicHJldmVudERlZmF1bHQiLCJjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzIiwibmV4dFByb3BzIiwicmVuZGVyIiwiaW5wdXRDbGFzc2VzIiwiaW5wdXRDbGFzc0xpc3QiLCJjbGFzc2VzIiwidHlwZWFoZWFkIiwiY2xhc3NOYW1lIiwiY2xhc3NMaXN0IiwiSW5wdXRFbGVtZW50IiwiX3JlbmRlckhpZGRlbklucHV0IiwiX29uRm9jdXMiLCJfb25CbHVyIiwiYmluZCIsInNlYXJjaE9wdGlvbnNQcm9wIiwiZmlsdGVyT3B0aW9uUHJvcCIsImNvbnNvbGUiLCJ3YXJuIiwiZmlsdGVyIiwibyIsIm1hcHBlciIsImdlbmVyYXRlQWNjZXNzb3IiLCJJREVOVElUWV9GTiIsImV4dHJhY3QiLCJtYXAiLCJyZXMiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiOztBQUFBLElBQUlBLFdBQVdDLFFBQVEsYUFBUixDQUFmO0FBQ0EsSUFBSUMsUUFBUUQsUUFBUSxPQUFSLENBQVo7QUFDQSxJQUFJRSxjQUFjRixRQUFRLG9CQUFSLENBQWxCO0FBQ0EsSUFBSUcsWUFBWUgsUUFBUSxZQUFSLENBQWhCO0FBQ0EsSUFBSUksb0JBQW9CSixRQUFRLFlBQVIsQ0FBeEI7QUFDQSxJQUFJSyxXQUFXTCxRQUFRLGFBQVIsQ0FBZjtBQUNBLElBQUlNLFFBQVFOLFFBQVEsT0FBUixDQUFaO0FBQ0EsSUFBSU8sYUFBYVAsUUFBUSxZQUFSLENBQWpCO0FBQ0EsSUFBSVEsT0FBT1IsUUFBUSxRQUFSLEVBQWtCUSxJQUE3Qjs7QUFFQTs7Ozs7O0FBTUEsSUFBSUMsWUFBWVAsWUFBWTtBQUN4QlEsZUFBVztBQUNQQyxjQUFNUixVQUFVUyxNQURUO0FBRVBDLHVCQUFlVixVQUFVVyxNQUZsQjtBQUdQQyxvQkFBWVosVUFBVWEsTUFIZjtBQUlQQyxpQ0FBeUJkLFVBQVVTLE1BSjVCO0FBS1BNLGlCQUFTZixVQUFVZ0IsS0FMWjtBQU1QQywyQkFBbUJqQixVQUFVYSxNQU50QjtBQU9QSyxzQkFBY2xCLFVBQVVTLE1BUGpCO0FBUVBVLGVBQU9uQixVQUFVUyxNQVJWO0FBU1BXLHFCQUFhcEIsVUFBVVMsTUFUaEI7QUFVUFksa0JBQVVyQixVQUFVc0IsSUFWYjtBQVdQQyxrQkFBVXZCLFVBQVVzQixJQVhiO0FBWVBFLG9CQUFZeEIsVUFBVVcsTUFaZjtBQWFQYywwQkFBa0J6QixVQUFVMEIsSUFickI7QUFjUEMsa0JBQVUzQixVQUFVMEIsSUFkYjtBQWVQRSxtQkFBVzVCLFVBQVUwQixJQWZkO0FBZ0JQRyxvQkFBWTdCLFVBQVUwQixJQWhCZjtB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QWU7QUFDaEIsMkJBQU96SCxRQUFReUgsSUFBSTVELEtBQVosQ0FBUDtBQUNILGlCQUpFLENBQVA7QUFLSCxhQU5EO0FBT0g7QUFDSixLQXJhdUI7O0FBdWF4QnVCLGNBQVUsWUFBWTtBQUNsQixlQUFPLEtBQUtwQyxLQUFMLENBQVdiLGFBQVgsQ0FBeUJZLE1BQXpCLEdBQWtDLENBQWxDLElBQXVDLEtBQUtNLGVBQUwsRUFBOUM7QUFDSDtBQXphdUIsQ0FBWixDQUFoQjs7QUE0YUFxRSxPQUFPQyxPQUFQLEdBQWlCcEksU0FBakIiLCJmaWxlIjoiaW5kZXguanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgQWNjZXNzb3IgPSByZXF1aXJlKCcuLi9hY2Nlc3NvcicpO1xudmFyIFJlYWN0ID0gcmVxdWlyZSgncmVhY3QnKTtcbnZhciBjcmVhdGVDbGFzcyA9IHJlcXVpcmUoJ2NyZWF0ZS1yZWFjdC1jbGFzcycpO1xudmFyIFByb3BUeXBlcyA9IHJlcXVpcmUoJ3Byb3AtdHlwZXMnKTtcbnZhciBUeXBlYWhlYWRTZWxlY3RvciA9IHJlcXVpcmUoJy4vc2VsZWN0b3InKTtcbnZhciBLZXlFdmVudCA9IHJlcXVpcmUoJy4uL2tleWV2ZW50Jyk7XG52YXIgZnV6enkgPSByZXF1aXJlKCdmdXp6eScpO1xudmFyIGNsYXNzTmFtZXMgPSByZXF1aXJlKCdjbGFzc25hbWVzJyk7XG52YXIgbm9vcCA9IHJlcXVpcmUoJ2xvZGFzaCcpLm5vb3A7XG5cbi8qKlxuICogQSBcInR5cGVhaGVhZFwiLCBhbiBhdXRvLWNvbXBsZXRpbmcgdGV4dCBpbnB1dFxuICpcbiAqIFJlbmRlcnMgYW4gdGV4dCBpbnB1dCB0aGF0IHNob3dzIG9wdGlvbnMgbmVhcmJ5IHRoYXQgeW91IGNhbiB1c2UgdGhlXG4gKiBrZXlib2FyZCBvciBtb3VzZSB0byBzZWxlY3QuICBSZXF1aXJlcyBDU1MgZm9yIE1BU1NJVkUgREFNQUdFLlxuICovXG52YXIgVHlwZWFoZWFkID0gY3JlYXRlQ2xhc3Moe1xuICAgIHByb3BUeXBlczoge1xuICAgICAgICBuYW1lOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBjdXN0b21DbGFzc2VzOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgICAgICBtYXhWaXNpYmxlOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgICAgICByZXN1bHRzVHJ1bmNhdGVkTWVzc2FnZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgb3B0aW9uczogUHJvcFR5cGVzLmFycmF5LFxuICAgICAgICBhbGxvd0N1c3RvbVZhbHVlczogUHJvcFR5cGVzLm51bWJlcixcbiAgICAgICAgaW5pdGlhbFZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICB2YWx1ZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgcGxhY2Vob2xkZXI6IFByb3BUeXBlcy5zdHJpbmcsXG4gICAgICAgIGRpc2FibGVkOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgdGV4dGFyZWE6IFByb3BUeXBlcy5ib29sLFxuICAgICAgICBpbnB1dFByb3BzOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgICAgICBvbk9wdGlvblNlbGVjdGVkOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgb25DaGFuZ2U6IFByb3BUeXBlcy5mdW5jLFxuICAgICAgICBvbktleURvd246IFByb3BUeXBlcy5mdW5jLFxuICAgICAgICBvbktleVByZXNzOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgb25LZXlVcDogUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIG9uRm9jdXM6IFByb3BUeXBlcy5mdW5jLFxuICAgICAgICBvbkJsdXI6IFByb3BUeXBlcy5mdW5jLFxuICAgICAgICBmaWx0ZXJPcHRpb246IFByb3BUeXBlcy5vbmVPZlR5cGUoW1xuICAgICAgICAgICAgUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgICAgIFByb3BUeXBlcy5mdW5jXG4gICAgICAgIF0pLFxuICAgICAgICBzZWFyY2hPcHRpb25zOiBQcm9wVHlwZXMuZnVuYyxcbiAgICAgICAgZGlzcGxheU9wdGlvbjogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICAgICAgICBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICAgICAgUHJvcFR5cGVzLmZ1bmNcbiAgICAgICAgXSksXG4gICAgICAgIGlucHV0RGlzcGxheU9wdGlvbjogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICAgICAgICBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICAgICAgUHJvcFR5cGVzLmZ1bmNcbiAgICAgICAgXSksXG4gICAgICAgIGZvcm1JbnB1dE9wdGlvbjogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICAgICAgICBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICAgICAgUHJvcFR5cGVzLmZ1bmNcbiAgICAgICAgXSksXG4gICAgICAgIGRlZmF1bHRDbGFzc05hbWVzOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgY3VzdG9tTGlzdENvbXBvbmVudDogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICAgICAgICBQcm9wVHlwZXMuZWxlbWVudCxcbiAgICAgICAgICAgIFByb3BUeXBlcy5mdW5jXG4gICAgICAgIF0pLFxuICAgICAgICBzaG93T3B0aW9uc1doZW5FbXB0eTogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIG9uQ3VzdG9tT3B0aW9uQ2hpbGRDbGljazogUHJvcFR5cGVzLmZ1bmMsXG4gICAgICAgIGN1c3RvbU9wdGlvbkNoaWxkOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtcbiAgICAgICAgICAgIFByb3BUeXBlcy5lbGVtZW50LFxuICAgICAgICAgICAgUHJvcFR5cGVzLmZ1bmNcbiAgICAgICAgXSksXG4gICAgICAgIHRvcE9wdGlvbjogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgc2hvd1RvcE9wdGlvbjogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIG9uVG9wT3B0aW9uQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICAgIH0sXG5cbiAgICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIG9wdGlvbnM6IFtdLFxuICAgICAgICAgICAgY3VzdG9tQ2xhc3Nlczoge30sXG4gICAgICAgICAgICBhbGxvd0N1c3RvbVZhbHVlczogMCxcbiAgICAgICAgICAgIGluaXRpYWxWYWx1ZTogXCJcIixcbiAgICAgICAgICAgIHZhbHVlOiBcIlwiLFxuICAgICAgICAgICAgcGxhY2Vob2xkZXI6IFwiXCIsXG4gICAgICAgICAgICBkaXNhYmxlZDogZmFsc2UsXG4gICAgICAgICAgICB0ZXh0YXJlYTogZmFsc2UsXG4gICAgICAgICAgICBpbnB1dFByb3BzOiB7fSxcbiAgICAgICAgICAgIG9uT3B0aW9uU2VsZWN0ZWQ6IG5vb3AsXG4gICAgICAgICAgICBvbkNoYW5nZTogbm9vcCxcbiAgICAgICAgICAgIG9uS2V5RG93bjogbm9vcCxcbiAgICAgICAgICAgIG9uS2V5UHJlc3M6IG5vb3AsXG4gICAgICAgICAgICBvbktleVVwOiBub29wLFxuICAgICAgICAgICAgb25Gb2N1czogbm9vcCxcbiAgICAgICAgICAgIG9uQmx1cjogbm9vcCxcbiAgICAgICAgICAgIGZpbHRlck9wdGlvbjogbnVsbCxcbiAgICAgICAgICAgIHNlYXJjaE9wdGlvbnM6IG51bGwsXG4gICAgICAgICAgICBpbnB1dERpc3BsYXlPcHRpb246IG51bGwsXG4gICAgICAgICAgICBkZWZhdWx0Q2xhc3NOYW1lczogdHJ1ZSxcbiAgICAgICAgICAgIGN1c3RvbUxpc3RDb21wb25lbnQ6IFR5cGVhaGVhZFNlbGVjdG9yLFxuICAgICAgICAgICAgc2hvd09wdGlvbnNXaGVuRW1wdHk6IGZhbHNlLFxuICAgICAgICAgICAgcmVzdWx0c1RydW5jYXRlZE1lc3NhZ2U6IG51bGwsXG4gICAgICAgICAgICBjdXN0b21PcHRpb25DaGlsZDogbnVsbCxcbiAgICAgICAgICAgIG9uQ3VzdG9tT3B0aW9uQ2hpbGRDbGljazogbm9vcCxcbiAgICAgICAgICAgIHRvcE9wdGlvbjogJycsXG4gICAgICAgICAgICBzaG93VG9wT3B0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIG9uVG9wT3B0aW9uQ2xpY2s6IG5vb3AsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIGdldEluaXRpYWxTdGF0ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgLy8gVGhlIG9wdGlvbnMgbWF0Y2hpbmcgdGhlIGVudHJ5IHZhbHVlXG4gICAgICAgICAgICBzZWFyY2hSZXN1bHRzOiB0aGlzLmdldE9wdGlvbnNGb3JWYWx1ZSh0aGlzLnByb3BzLmluaXRpYWxWYWx1ZSwgdGhpcy5wcm9wcy5vcHRpb25zKSxcblxuICAgICAgICAgICAgLy8gVGhpcyBzaG91bGQgYmUgY2FsbGVkIHNvbWV0aGluZyBlbHNlLCBcImVudHJ5VmFsdWVcIlxuICAgICAgICAgICAgZW50cnlWYWx1ZTogdGhpcy5wcm9wcy52YWx1ZSB8fCB0aGlzLnByb3BzLmluaXRpYWxWYWx1ZSxcblxuICAgICAgICAgICAgLy8gQSB2YWxpZCB0eXBlYWhlYWQgdmFsdWVcbiAgICAgICAgICAgIHNlbGVjdGlvbjogdGhpcy5wcm9wcy52YWx1ZSxcblxuICAgICAgICAgICAgLy8gSW5kZXggb2YgdGhlIHNlbGVjdGlvblxuICAgICAgICAgICAgc2VsZWN0aW9uSW5kZXg6IG51bGwsXG5cbiAgICAgICAgICAgIC8vIEtlZXAgdHJhY2sgb2YgdGhlIGZvY3VzIHN0YXRlIG9mIHRoZSBpbnB1dCBlbGVtZW50LCB0byBkZXRlcm1pbmVcbiAgICAgICAgICAgIC8vIHdoZXRoZXIgdG8gc2hvdyBvcHRpb25zIHdoZW4gZW1wdHkgKGlmIHNob3dPcHRpb25zV2hlbkVtcHR5IGlzIHRydWUpXG4gICAgICAgICAgICBpc0ZvY3VzZWQ6IGZhbHNlLFxuXG4gICAgICAgICAgICAvLyB0cnVlIHdoZW4gZm9jdXNlZCwgZmFsc2Ugb25PcHRpb25TZWxlY3RlZFxuICAgICAgICAgICAgc2hvd1Jlc3VsdHM6IGZhbHNlXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIF9zaG91bGRTa2lwU2VhcmNoOiBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgdmFyIGVtcHR5VmFsdWUgPSAhaW5wdXQgfHwgaW5wdXQudHJpbSgpLmxlbmd0aCA9PSAwO1xuXG4gICAgICAgIC8vIHRoaXMuc3RhdGUgbXVzdCBiZSBjaGVja2VkIGJlY2F1c2UgaXQgbWF5IG5vdCBiZSBkZWZpbmVkIHlldCBpZiB0aGlzIGZ1bmN0aW9uXG4gICAgICAgIC8vIGlzIGNhbGxlZCBmcm9tIHdpdGhpbiBnZXRJbml0aWFsU3RhdGVcbiAgICAgICAgdmFyIGlzRm9jdXNlZCA9IHRoaXMuc3RhdGUgJiYgdGhpcy5zdGF0ZS5pc0ZvY3VzZWQ7XG4gICAgICAgIHJldHVybiAhKHRoaXMucHJvcHMuc2hvd09wdGlvbnNXaGVuRW1wdHkgJiYgaXNGb2N1c2VkKSAmJiBlbXB0eVZhbHVlO1xuICAgIH0sXG5cbiAgICBnZXRPcHRpb25zRm9yVmFsdWU6IGZ1bmN0aW9uICh2YWx1ZSwgb3B0aW9ucykge1xuICAgICAgICBpZiAodGhpcy5fc2hvdWxkU2tpcFNlYXJjaCh2YWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZhciBzZWFyY2hPcHRpb25zID0gdGhpcy5fZ2VuZXJhdGVTZWFyY2hGdW5jdGlvbigpO1xuICAgICAgICByZXR1cm4gc2VhcmNoT3B0aW9ucyh2YWx1ZSwgb3B0aW9ucyk7XG4gICAgfSxcblxuICAgIGZvY3VzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMucmVmcy5lbnRyeS5mb2N1cygpXG4gICAgfSxcblxuICAgIF9oYXNDdXN0b21WYWx1ZTogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5hbGxvd0N1c3RvbVZhbHVlcyA+IDAgJiZcbiAgICAgICAgICAgIHRoaXMuc3RhdGUuZW50cnlWYWx1ZS5sZW5ndGggPj0gdGhpcy5wcm9wcy5hbGxvd0N1c3RvbVZhbHVlcyAmJlxuICAgICAgICAgICAgdGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzLmluZGV4T2YodGhpcy5zdGF0ZS5lbnRyeVZhbHVlKSA8IDApIHtcbiAgICAgICAgICAgIHJldHVybiB0cnVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9LFxuXG4gICAgX2dldEN1c3RvbVZhbHVlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIGlmICh0aGlzLl9oYXNDdXN0b21WYWx1ZSgpKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5lbnRyeVZhbHVlO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBudWxsO1xuICAgIH0sXG5cbiAgICBfcmVuZGVySW5jcmVtZW50YWxTZWFyY2hSZXN1bHRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIC8vIE5vdGhpbmcgaGFzIGJlZW4gZW50ZXJlZCBpbnRvIHRoZSB0ZXh0Ym94XG4gICAgICAgIGlmICh0aGlzLl9zaG91bGRTa2lwU2VhcmNoKHRoaXMuc3RhdGUuZW50cnlWYWx1ZSkpIHtcbiAgICAgICAgICAgIHJldHVybiBcIlwiO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gU29tZXRoaW5nIHdhcyBqdXN0IHNlbGVjdGVkXG4gICAgICAgIGlmICh0aGlzLnN0YXRlLnNlbGVjdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPHRoaXMucHJvcHMuY3VzdG9tTGlzdENvbXBvbmVudFxuICAgICAgICAgICAgICAgIHJlZj1cInNlbFwiXG4gICAgICAgICAgICAgICAgb3B0aW9ucz17dGhpcy5wcm9wcy5tYXhWaXNpYmxlID8gdGhpcy5zdGF0ZS5zZWFyY2hSZXN1bHRzLnNsaWNlKDAsIHRoaXMucHJvcHMubWF4VmlzaWJsZSkgOiB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHN9XG4gICAgICAgICAgICAgICAgYXJlUmVzdWx0c1RydW5jYXRlZD17dGhpcy5wcm9wcy5tYXhWaXNpYmxlICYmIHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5sZW5ndGggPiB0aGlzLnByb3BzLm1heFZpc2libGV9XG4gICAgICAgICAgICAgICAgcmVzdWx0c1RydW5jYXRlZE1lc3NhZ2U9e3RoaXMucHJvcHMucmVzdWx0c1RydW5jYXRlZE1lc3NhZ2V9XG4gICAgICAgICAgICAgICAgb25PcHRpb25TZWxlY3RlZD17dGhpcy5fb25PcHRpb25TZWxlY3RlZH1cbiAgICAgICAgICAgICAgICBhbGxvd0N1c3RvbVZhbHVlcz17dGhpcy5wcm9wcy5hbGxvd0N1c3RvbVZhbHVlc31cbiAgICAgICAgICAgICAgICBjdXN0b21WYWx1ZT17dGhpcy5fZ2V0Q3VzdG9tVmFsdWUoKX1cbiAgICAgICAgICAgICAgICBjdXN0b21DbGFzc2VzPXt0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXN9XG4gICAgICAgICAgICAgICAgc2VsZWN0aW9uSW5kZXg9e3RoaXMuc3RhdGUuc2VsZWN0aW9uSW5kZXh9XG4gICAgICAgICAgICAgICAgZGVmYXVsdENsYXNzTmFtZXM9e3RoaXMucHJvcHMuZGVmYXVsdENsYXNzTmFtZXN9XG4gICAgICAgICAgICAgICAgZGlzcGxheU9wdGlvbj17QWNjZXNzb3IuZ2VuZXJhdGVPcHRpb25Ub1N0cmluZ0Zvcih0aGlzLnByb3BzLmRpc3BsYXlPcHRpb24pfVxuICAgICAgICAgICAgICAgIGN1c3RvbU9wdGlvbkNoaWxkPXt0aGlzLnByb3BzLmN1c3RvbU9wdGlvbkNoaWxkfVxuICAgICAgICAgICAgICAgIG9uQ3VzdG9tT3B0aW9uQ2hpbGRDbGljaz17dGhpcy5wcm9wcy5vbkN1c3RvbU9wdGlvbkNoaWxkQ2xpY2t9XG4gICAgICAgICAgICAgICAgdG9wT3B0aW9uPXt0aGlzLnByb3BzLnRvcE9wdGlvbn1cbiAgICAgICAgICAgICAgICBzaG93VG9wT3B0aW9uPXt0aGlzLnByb3BzLnNob3dUb3BPcHRpb259XG4gICAgICAgICAgICAgICAgb25Ub3BPcHRpb25DbGljaz17dGhpcy5wcm9wcy5vblRvcE9wdGlvbkNsaWNrfVxuICAgICAgICAgICAgLz5cbiAgICAgICAgKTtcbiAgICB9LFxuXG4gICAgZ2V0U2VsZWN0aW9uOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciBpbmRleCA9IHRoaXMuc3RhdGUuc2VsZWN0aW9uSW5kZXg7XG4gICAgICAgIGlmICh0aGlzLl9oYXNDdXN0b21WYWx1ZSgpKSB7XG4gICAgICAgICAgICBpZiAoaW5kZXggPT09IDApIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5zdGF0ZS5lbnRyeVZhbHVlO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICBpbmRleC0tO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHNbaW5kZXhdO1xuICAgIH0sXG5cbiAgICBfb25PcHRpb25TZWxlY3RlZDogZnVuY3Rpb24gKG9wdGlvbiwgZXZlbnQpIHtcbiAgICAgICAgdmFyIG5FbnRyeSA9IHRoaXMucmVmcy5lbnRyeTtcbiAgICAgICAgbkVudHJ5LmZvY3VzKCk7XG5cbiAgICAgICAgdmFyIGRpc3BsYXlPcHRpb24gPSBBY2Nlc3Nvci5nZW5lcmF0ZU9wdGlvblRvU3RyaW5nRm9yKHRoaXMucHJvcHMuaW5wdXREaXNwbGF5T3B0aW9uIHx8IHRoaXMucHJvcHMuZGlzcGxheU9wdGlvbik7XG4gICAgICAgIHZhciBvcHRpb25TdHJpbmcgPSBkaXNwbGF5T3B0aW9uKG9wdGlvbiwgMCk7XG5cbiAgICAgICAgdmFyIGZvcm1JbnB1dE9wdGlvbiA9IEFjY2Vzc29yLmdlbmVyYXRlT3B0aW9uVG9TdHJpbmdGb3IodGhpcy5wcm9wcy5mb3JtSW5wdXRPcHRpb24gfHwgZGlzcGxheU9wdGlvbik7XG4gICAgICAgIHZhciBmb3JtSW5wdXRPcHRpb25TdHJpbmcgPSBmb3JtSW5wdXRPcHRpb24ob3B0aW9uKTtcblxuICAgICAgICBuRW50cnkudmFsdWUgPSBvcHRpb25TdHJpbmc7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VhcmNoUmVzdWx0czogdGhpcy5nZXRPcHRpb25zRm9yVmFsdWUob3B0aW9uU3RyaW5nLCB0aGlzLnByb3BzLm9wdGlvbnMpLFxuICAgICAgICAgICAgc2VsZWN0aW9uOiBmb3JtSW5wdXRPcHRpb25TdHJpbmcsXG4gICAgICAgICAgICBlbnRyeVZhbHVlOiBvcHRpb25TdHJpbmcsXG4gICAgICAgICAgICBzaG93UmVzdWx0czogZmFsc2VcbiAgICAgICAgfSk7XG4gICAgICAgIHJldHVybiB0aGlzLnByb3BzLm9uT3B0aW9uU2VsZWN0ZWQob3B0aW9uLCBldmVudCk7XG4gICAgfSxcblxuICAgIF9vblRleHRFbnRyeVVwZGF0ZWQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIHZhbHVlID0gdGhpcy5yZWZzLmVudHJ5LnZhbHVlO1xuICAgICAgICB0aGlzLnNldFN0YXRlKHtcbiAgICAgICAgICAgIHNlYXJjaFJlc3VsdHM6IHRoaXMuZ2V0T3B0aW9uc0ZvclZhbHVlKHZhbHVlLCB0aGlzLnByb3BzLm9wdGlvbnMpLFxuICAgICAgICAgICAgc2VsZWN0aW9uOiAnJyxcbiAgICAgICAgICAgIGVudHJ5VmFsdWU6IHZhbHVlXG4gICAgICAgIH0pO1xuICAgIH0sXG5cbiAgICBfb25FbnRlcjogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciBzZWxlY3Rpb24gPSB0aGlzLmdldFNlbGVjdGlvbigpO1xuICAgICAgICBpZiAoIXNlbGVjdGlvbikge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMub25LZXlEb3duKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy5fb25PcHRpb25TZWxlY3RlZChzZWxlY3Rpb24sIGV2ZW50KTtcbiAgICB9LFxuXG4gICAgX29uRXNjYXBlOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VsZWN0aW9uSW5kZXg6IG51bGxcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIF9vblRhYjogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIHZhciBzZWxlY3Rpb24gPSB0aGlzLmdldFNlbGVjdGlvbigpO1xuICAgICAgICB2YXIgb3B0aW9uID0gc2VsZWN0aW9uID9cbiAgICAgICAgICAgIHNlbGVjdGlvbiA6ICh0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMubGVuZ3RoID4gMCA/IHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0c1swXSA6IG51bGwpO1xuXG4gICAgICAgIGlmIChvcHRpb24gPT09IG51bGwgJiYgdGhpcy5faGFzQ3VzdG9tVmFsdWUoKSkge1xuICAgICAgICAgICAgb3B0aW9uID0gdGhpcy5fZ2V0Q3VzdG9tVmFsdWUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChvcHRpb24gIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLl9vbk9wdGlvblNlbGVjdGVkKG9wdGlvbiwgZXZlbnQpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIGV2ZW50TWFwOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdmFyIGV2ZW50cyA9IHt9O1xuXG4gICAgICAgIGV2ZW50c1tLZXlFdmVudC5ET01fVktfVVBdID0gdGhpcy5uYXZVcDtcbiAgICAgICAgZXZlbnRzW0tleUV2ZW50LkRPTV9WS19ET1dOXSA9IHRoaXMubmF2RG93bjtcbiAgICAgICAgZXZlbnRzW0tleUV2ZW50LkRPTV9WS19SRVRVUk5dID0gZXZlbnRzW0tleUV2ZW50LkRPTV9WS19FTlRFUl0gPSB0aGlzLl9vbkVudGVyO1xuICAgICAgICBldmVudHNbS2V5RXZlbnQuRE9NX1ZLX0VTQ0FQRV0gPSB0aGlzLl9vbkVzY2FwZTtcbiAgICAgICAgZXZlbnRzW0tleUV2ZW50LkRPTV9WS19UQUJdID0gdGhpcy5fb25UYWI7XG5cbiAgICAgICAgcmV0dXJuIGV2ZW50cztcbiAgICB9LFxuXG4gICAgX25hdjogZnVuY3Rpb24gKGRlbHRhKSB7XG4gICAgICAgIGlmICghdGhpcy5faGFzSGludCgpKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgdmFyIG5ld0luZGV4ID0gdGhpcy5zdGF0ZS5zZWxlY3Rpb25JbmRleCA9PT0gbnVsbCA/IChkZWx0YSA9PSAxID8gMCA6IGRlbHRhKSA6IHRoaXMuc3RhdGUuc2VsZWN0aW9uSW5kZXggKyBkZWx0YTtcbiAgICAgICAgdmFyIGxlbmd0aCA9IHRoaXMucHJvcHMubWF4VmlzaWJsZSA/IHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5zbGljZSgwLCB0aGlzLnByb3BzLm1heFZpc2libGUpLmxlbmd0aCA6IHRoaXMuc3RhdGUuc2VhcmNoUmVzdWx0cy5sZW5ndGg7XG4gICAgICAgIGlmICh0aGlzLl9oYXNDdXN0b21WYWx1ZSgpKSB7XG4gICAgICAgICAgICBsZW5ndGggKz0gMTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChuZXdJbmRleCA8IDApIHtcbiAgICAgICAgICAgIG5ld0luZGV4ICs9IGxlbmd0aDtcbiAgICAgICAgfSBlbHNlIGlmIChuZXdJbmRleCA+PSBsZW5ndGgpIHtcbiAgICAgICAgICAgIG5ld0luZGV4IC09IGxlbmd0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuc2V0U3RhdGUoeyBzZWxlY3Rpb25JbmRleDogbmV3SW5kZXggfSk7XG4gICAgfSxcblxuICAgIG5hdkRvd246IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdGhpcy5fbmF2KDEpO1xuICAgIH0sXG5cbiAgICBuYXZVcDogZnVuY3Rpb24gKCkge1xuICAgICAgICB0aGlzLl9uYXYoLTEpO1xuICAgIH0sXG5cbiAgICBzZXRFbnRyeVRleHQ6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICB0aGlzLnJlZnMuZW50cnkudmFsdWUgPSB2YWx1ZTtcbiAgICAgICAgdGhpcy5yZWZzLmVudHJ5LmRpc3BhdGNoRXZlbnQobmV3IEV2ZW50KCdpbnB1dCcsIHsgYnViYmxlczogdHJ1ZSB9KSk7XG4gICAgfSxcblxuICAgIF9vbkNoYW5nZTogZnVuY3Rpb24gKGV2ZW50KSB7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uQ2hhbmdlKSB7XG4gICAgICAgICAgICB0aGlzLnByb3BzLm9uQ2hhbmdlKGV2ZW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIHRoaXMuX29uVGV4dEVudHJ5VXBkYXRlZCgpO1xuICAgIH0sXG5cbiAgICBfb25LZXlEb3duOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgLy8gSWYgdGhlcmUgYXJlIG5vIHZpc2libGUgZWxlbWVudHMsIGRvbid0IHBlcmZvcm0gc2VsZWN0b3IgbmF2aWdhdGlvbi5cbiAgICAgICAgLy8gSnVzdCBwYXNzIHRoaXMgdXAgdG8gdGhlIHVwc3RyZWFtIG9uS2V5ZG93biBoYW5kbGVyLlxuICAgICAgICAvLyBBbHNvIHNraXAgaWYgdGhlIHVzZXIgaXMgcHJlc3NpbmcgdGhlIHNoaWZ0IGtleSwgc2luY2Ugbm9uZSBvZiBvdXIgaGFuZGxlcnMgYXJlIGxvb2tpbmcgZm9yIHNoaWZ0XG4gICAgICAgIGlmICghdGhpcy5faGFzSGludCgpIHx8IGV2ZW50LnNoaWZ0S2V5KSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5vbktleURvd24oZXZlbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmFyIGhhbmRsZXIgPSB0aGlzLmV2ZW50TWFwKClbZXZlbnQua2V5Q29kZV07XG5cbiAgICAgICAgaWYgKGhhbmRsZXIpIHtcbiAgICAgICAgICAgIGhhbmRsZXIoZXZlbnQpO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmV0dXJuIHRoaXMucHJvcHMub25LZXlEb3duKGV2ZW50KTtcbiAgICAgICAgfVxuICAgICAgICAvLyBEb24ndCBwcm9wYWdhdGUgdGhlIGtleXN0cm9rZSBiYWNrIHRvIHRoZSBET00vYnJvd3NlclxuICAgICAgICBldmVudC5wcmV2ZW50RGVmYXVsdCgpO1xuICAgIH0sXG5cbiAgICBjb21wb25lbnRXaWxsUmVjZWl2ZVByb3BzOiBmdW5jdGlvbiAobmV4dFByb3BzKSB7XG4gICAgICAgIHRoaXMuc2V0U3RhdGUoe1xuICAgICAgICAgICAgc2VhcmNoUmVzdWx0czogdGhpcy5nZXRPcHRpb25zRm9yVmFsdWUodGhpcy5zdGF0ZS5lbnRyeVZhbHVlLCBuZXh0UHJvcHMub3B0aW9ucylcbiAgICAgICAgfSk7XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgaW5wdXRDbGFzc2VzID0ge307XG4gICAgICAgIGlucHV0Q2xhc3Nlc1t0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMuaW5wdXRdID0gISF0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMuaW5wdXQ7XG4gICAgICAgIHZhciBpbnB1dENsYXNzTGlzdCA9IGNsYXNzTmFtZXMoaW5wdXRDbGFzc2VzKTtcblxuICAgICAgICB2YXIgY2xhc3NlcyA9IHtcbiAgICAgICAgICAgIHR5cGVhaGVhZDogdGhpcy5wcm9wcy5kZWZhdWx0Q2xhc3NOYW1lc1xuICAgICAgICB9O1xuICAgICAgICBjbGFzc2VzW3RoaXMucHJvcHMuY2xhc3NOYW1lXSA9ICEhdGhpcy5wcm9wcy5jbGFzc05hbWU7XG4gICAgICAgIHZhciBjbGFzc0xpc3QgPSBjbGFzc05hbWVzKGNsYXNzZXMpO1xuXG4gICAgICAgIHZhciBJbnB1dEVsZW1lbnQgPSB0aGlzLnByb3BzLnRleHRhcmVhID8gJ3RleHRhcmVhJyA6ICdpbnB1dCc7XG4gICAgICAgIHJldHVybiAoXG4gICAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT17Y2xhc3NMaXN0fT5cbiAgICAgICAgICAgICAgICB7IHRoaXMuX3JlbmRlckhpZGRlbklucHV0KCkgfVxuICAgICAgICAgICAgICAgIDxJbnB1dEVsZW1lbnQgcmVmPVwiZW50cnlcIiB0eXBlPVwidGV4dFwiXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBkaXNhYmxlZD17dGhpcy5wcm9wcy5kaXNhYmxlZH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHsuLi50aGlzLnByb3BzLmlucHV0UHJvcHN9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGFjZWhvbGRlcj17dGhpcy5wcm9wcy5wbGFjZWhvbGRlcn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNsYXNzTmFtZT17aW5wdXRDbGFzc0xpc3R9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICB2YWx1ZT17dGhpcy5zdGF0ZS5lbnRyeVZhbHVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DaGFuZ2U9e3RoaXMuX29uQ2hhbmdlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25LZXlEb3duPXt0aGlzLl9vbktleURvd259XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbktleVByZXNzPXt0aGlzLnByb3BzLm9uS2V5UHJlc3N9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbktleVVwPXt0aGlzLnByb3BzLm9uS2V5VXB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbkZvY3VzPXt0aGlzLl9vbkZvY3VzfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25CbHVyPXt0aGlzLl9vbkJsdXJ9XG4gICAgICAgICAgICAgICAgLz5cbiAgICAgICAgICAgICAgICB7IHRoaXMuc3RhdGUuc2hvd1Jlc3VsdHMgJiYgdGhpcy5fcmVuZGVySW5jcmVtZW50YWxTZWFyY2hSZXN1bHRzKCkgfVxuICAgICAgICAgICAgPC9kaXY+XG4gICAgICAgICk7XG4gICAgfSxcblxuICAgIF9vbkZvY3VzOiBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgICAgdGhpcy5zZXRTdGF0ZSh7IGlzRm9jdXNlZDogdHJ1ZSwgc2hvd1Jlc3VsdHM6IHRydWUgfSwgZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgdGhpcy5fb25UZXh0RW50cnlVcGRhdGVkKCk7XG4gICAgICAgIH0uYmluZCh0aGlzKSk7XG4gICAgICAgIGlmICh0aGlzLnByb3BzLm9uRm9jdXMpIHtcbiAgICAgICAgICAgIHJldHVybiB0aGlzLnByb3BzLm9uRm9jdXMoZXZlbnQpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9vbkJsdXI6IGZ1bmN0aW9uIChldmVudCkge1xuICAgICAgICB0aGlzLnNldFN0YXRlKHsgaXNGb2N1c2VkOiBmYWxzZSB9LCBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB0aGlzLl9vblRleHRFbnRyeVVwZGF0ZWQoKTtcbiAgICAgICAgfS5iaW5kKHRoaXMpKTtcbiAgICAgICAgaWYgKHRoaXMucHJvcHMub25CbHVyKSB7XG4gICAgICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5vbkJsdXIoZXZlbnQpO1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9yZW5kZXJIaWRkZW5JbnB1dDogZnVuY3Rpb24gKCkge1xuICAgICAgICBpZiAoIXRoaXMucHJvcHMubmFtZSkge1xuICAgICAgICAgICAgcmV0dXJuIG51bGw7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgPGlucHV0XG4gICAgICAgICAgICAgICAgdHlwZT1cImhpZGRlblwiXG4gICAgICAgICAgICAgICAgbmFtZT17IHRoaXMucHJvcHMubmFtZSB9XG4gICAgICAgICAgICAgICAgdmFsdWU9eyB0aGlzLnN0YXRlLnNlbGVjdGlvbiB9XG4gICAgICAgICAgICAvPlxuICAgICAgICApO1xuICAgIH0sXG5cbiAgICBfZ2VuZXJhdGVTZWFyY2hGdW5jdGlvbjogZnVuY3Rpb24gKCkge1xuICAgICAgICB2YXIgc2VhcmNoT3B0aW9uc1Byb3AgPSB0aGlzLnByb3BzLnNlYXJjaE9wdGlvbnM7XG4gICAgICAgIHZhciBmaWx0ZXJPcHRpb25Qcm9wID0gdGhpcy5wcm9wcy5maWx0ZXJPcHRpb247XG4gICAgICAgIGlmICh0eXBlb2Ygc2VhcmNoT3B0aW9uc1Byb3AgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIGlmIChmaWx0ZXJPcHRpb25Qcm9wICE9PSBudWxsKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS53YXJuKCdzZWFyY2hPcHRpb25zIHByb3AgaXMgYmVpbmcgdXNlZCwgZmlsdGVyT3B0aW9uIHByb3Agd2lsbCBiZSBpZ25vcmVkJyk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gc2VhcmNoT3B0aW9uc1Byb3A7XG4gICAgICAgIH0gZWxzZSBpZiAodHlwZW9mIGZpbHRlck9wdGlvblByb3AgPT09ICdmdW5jdGlvbicpIHtcbiAgICAgICAgICAgIHJldHVybiBmdW5jdGlvbiAodmFsdWUsIG9wdGlvbnMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gb3B0aW9ucy5maWx0ZXIoZnVuY3Rpb24gKG8pIHtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGZpbHRlck9wdGlvblByb3AodmFsdWUsIG8pO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHZhciBtYXBwZXI7XG4gICAgICAgICAgICBpZiAodHlwZW9mIGZpbHRlck9wdGlvblByb3AgPT09ICdzdHJpbmcnKSB7XG4gICAgICAgICAgICAgICAgbWFwcGVyID0gQWNjZXNzb3IuZ2VuZXJhdGVBY2Nlc3NvcihmaWx0ZXJPcHRpb25Qcm9wKTtcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgbWFwcGVyID0gQWNjZXNzb3IuSURFTlRJVFlfRk47XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICByZXR1cm4gZnVuY3Rpb24gKHZhbHVlLCBvcHRpb25zKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGZ1enp5XG4gICAgICAgICAgICAgICAgICAgIC5maWx0ZXIodmFsdWUsIG9wdGlvbnMsIHsgZXh0cmFjdDogbWFwcGVyIH0pXG4gICAgICAgICAgICAgICAgICAgIC5tYXAoZnVuY3Rpb24gKHJlcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmV0dXJuIG9wdGlvbnNbcmVzLmluZGV4XTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9O1xuICAgICAgICB9XG4gICAgfSxcblxuICAgIF9oYXNIaW50OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnN0YXRlLnNlYXJjaFJlc3VsdHMubGVuZ3RoID4gMCB8fCB0aGlzLl9oYXNDdXN0b21WYWx1ZSgpO1xuICAgIH1cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFR5cGVhaGVhZDtcbiJdfQ==
},{"../accessor":17,"../keyevent":18,"./selector":24,"classnames":1,"create-react-class":3,"fuzzy":8,"lodash":9,"prop-types":15,"react":"react"}],23:[function(require,module,exports){
var React = window.React || require('react');
var createClass = require('create-react-class');
var PropTypes = require('prop-types');
var classNames = require('classnames');

/**
 * A single option within the TypeaheadSelector
 */
var TypeaheadOption = createClass({
  propTypes: {
    customClasses: PropTypes.object,
    customValue: PropTypes.string,
    onClick: PropTypes.func,
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.array]),
    hover: PropTypes.bool
  },

  getDefaultProps: function () {
    return {
      customClasses: {},
      onClick: function (event) {
        event.preventDefault();
      }
    };
  },

  render: function () {
    var classes = {};
    classes[this.props.customClasses.hover || "hover"] = !!this.props.hover;
    classes[this.props.customClasses.listItem] = !!this.props.customClasses.listItem;

    if (this.props.customValue) {
      classes[this.props.customClasses.customAdd] = !!this.props.customClasses.customAdd;
    }

    var classList = classNames(classes);

    return React.createElement(
      'li',
      { className: classList, onClick: this._onClick },
      React.createElement(
        'a',
        { href: 'javascript: void 0;', className: this._getClasses(), ref: 'anchor' },
        this.props.children[0]
      ),
      this.props.children[1] && React.createElement(
        'div',
        { className: 'custom-option-child', onClick: this._onCustomOptionChildClick },
        this.props.children[1]
      )
    );
  },

  _onCustomOptionChildClick(e) {
    this.props.onCustomOptionChildClick(e);
  },

  _getClasses: function () {
    var classes = {
      "typeahead-option": true
    };
    classes[this.props.customClasses.listAnchor] = !!this.props.customClasses.listAnchor;

    return classNames(classes);
  },

  _onClick: function (event) {
    event.preventDefault();
    return this.props.onClick(event);
  }
});

module.exports = TypeaheadOption;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm9wdGlvbi5qcyJdLCJuYW1lcyI6WyJSZWFjdCIsInJlcXVpcmUiLCJjcmVhdGVDbGFzcyIsIlByb3BUeXBlcyIsImNsYXNzTmFtZXMiLCJUeXBlYWhlYWRPcHRpb24iLCJwcm9wVHlwZXMiLCJjdXN0b21DbGFzc2VzIiwib2JqZWN0IiwiY3VzdG9tVmFsdWUiLCJzdHJpbmciLCJvbkNsaWNrIiwiZnVuYyIsImNoaWxkcmVuIiwib25lT2ZUeXBlIiwiYXJyYXkiLCJob3ZlciIsImJvb2wiLCJnZXREZWZhdWx0UHJvcHMiLCJldmVudCIsInByZXZlbnREZWZhdWx0IiwicmVuZGVyIiwiY2xhc3NlcyIsInByb3BzIiwibGlzdEl0ZW0iLCJjdXN0b21BZGQiLCJjbGFzc0xpc3QiLCJfb25DbGljayIsIl9nZXRDbGFzc2VzIiwiX29uQ3VzdG9tT3B0aW9uQ2hpbGRDbGljayIsImUiLCJvbkN1c3RvbU9wdGlvbkNoaWxkQ2xpY2siLCJsaXN0QW5jaG9yIiwibW9kdWxlIiwiZXhwb3J0cyJdLCJtYXBwaW5ncyI6IkFBQUEsSUFBSUEsUUFBUUMsUUFBUSxPQUFSLENBQVo7QUFDQSxJQUFJQyxjQUFjRCxRQUFRLG9CQUFSLENBQWxCO0FBQ0EsSUFBSUUsWUFBWUYsUUFBUSxZQUFSLENBQWhCO0FBQ0EsSUFBSUcsYUFBYUgsUUFBUSxZQUFSLENBQWpCOztBQUVBOzs7QUFHQSxJQUFJSSxrQkFBa0JILFlBQVk7QUFDaENJLGFBQVc7QUFDVEMsbUJBQWVKLFVBQVVLLE1BRGhCO0FBRVRDLGlCQUFhTixVQUFVTyxNQUZkO0FBR1RDLGFBQVNSLFVBQVVTLElBSFY7QUFJVEMsY0FBVVYsVUFBVVcsU0FBVixDQUFvQixDQUFDWCxVQUFVTyxNQUFYLEVBQW1CUCxVQUFVWSxLQUE3QixDQUFwQixDQUpEO0FBS1RDLFdBQU9iLFVBQVVjO0FBTFIsR0FEcUI7O0FBU2hDQyxtQkFBaUIsWUFBVztBQUMxQixXQUFPO0FBQ0xYLHFCQUFlLEVBRFY7QUFFTEksZUFBUyxVQUFTUSxLQUFULEVBQWdCO0FBQ3ZCQSxjQUFNQyxjQUFOO0FBQ0Q7QUFKSSxLQUFQO0FBTUQsR0FoQitCOztBQWtCaENDLFVBQVEsWUFBVztBQUNqQixRQUFJQyxVQUFVLEVBQWQ7QUFDQUEsWUFBUSxLQUFLQyxLQUFMLENBQVdoQixhQUFYLENBQXlCUyxLQUF6QixJQUFrQyxPQUExQyxJQUFxRCxDQUFDLENBQUMsS0FBS08sS0FBTCxDQUFXUCxLQUFsRTtBQUNBTSxZQUFRLEtBQUtDLEtBQUwsQ0FBV2hCLGFBQVgsQ0FBeUJpQixRQUFqQyxJQUE2QyxDQUFDLENBQUMsS0FBS0QsS0FBTCxDQUFXaEIsYUFBWCxDQUF5QmlCLFFBQXhFOztBQUVBLFFBQUksS0FBS0QsS0FBTCxDQUFXZCxXQUFmLEVBQTRCO0FBQzFCYSxjQUFRLEtBQUtDLEtBQUwsQ0FBV2hCLGFBQVgsQ0FBeUJrQixTQUFqQyxJQUE4QyxDQUFDLENBQUMsS0FBS0YsS0FBTCxDQUFXaEIsYUFBWCxDQUF5QmtCLFNBQXpFO0FBQ0Q7O0FBRUQsUUFBSUMsWUFBWXRCLFdBQVdrQixPQUFYLENBQWhCOztBQUVBLFdBQ0U7QUFBQTtBQUFBLFFBQUksV0FBV0ksU0FBZixFQUEwQixTQUFTLEtBQUtDLFFBQXhDO0FBQ0U7QUFBQTtBQUFBLFVBQUcsTUFBSyxxQkFBUixFQUE4QixXQUFXLEtBQUtDLFdBQUwsRUFBekMsRUFBNkQsS0FBSSxRQUFqRTtBQUNJLGFBQUtMLEtBQUwsQ0FBV1YsUUFBWCxDQUFvQixDQUFwQjtBQURKLE9BREY7QUFJSSxXQUFLVSxLQUFMLENBQVdWLFFBQVgsQ0FBb0IsQ0FBcEIsS0FDQTtBQUFBO0FBQUEsVUFBSyxXQUFVLHFCQUFmLEVBQXFDLFNBQVMsS0FBS2dCLHlCQUFuRDtBQUNJLGFBQUtOLEtBQUwsQ0FBV1YsUUFBWCxDQUFxQixDQUFyQjtBQURKO0FBTEosS0FERjtBQVlELEdBekMrQjs7QUEyQ2hDZ0IsNEJBQTBCQyxDQUExQixFQUE2QjtBQUMzQixTQUFLUCxLQUFMLENBQVdRLHdCQUFYLENBQW9DRCxDQUFwQztBQUNELEdBN0MrQjs7QUErQ2hDRixlQUFhLFlBQVc7QUFDdEIsUUFBSU4sVUFBVTtBQUNaLDBCQUFvQjtBQURSLEtBQWQ7QUFHQUEsWUFBUSxLQUFLQyxLQUFMLENBQVdoQixhQUFYLENBQXlCeUIsVUFBakMsSUFBK0MsQ0FBQyxDQUFDLEtBQUtULEtBQUwsQ0FBV2hCLGFBQVgsQ0FBeUJ5QixVQUExRTs7QUFFQSxXQUFPNUIsV0FBV2tCLE9BQVgsQ0FBUDtBQUNELEdBdEQrQjs7QUF3RGhDSyxZQUFVLFVBQVNSLEtBQVQsRUFBZ0I7QUFDeEJBLFVBQU1DLGNBQU47QUFDQSxXQUFPLEtBQUtHLEtBQUwsQ0FBV1osT0FBWCxDQUFtQlEsS0FBbkIsQ0FBUDtBQUNEO0FBM0QrQixDQUFaLENBQXRCOztBQStEQWMsT0FBT0MsT0FBUCxHQUFpQjdCLGVBQWpCIiwiZmlsZSI6Im9wdGlvbi5qcyIsInNvdXJjZXNDb250ZW50IjpbInZhciBSZWFjdCA9IHJlcXVpcmUoJ3JlYWN0Jyk7XG52YXIgY3JlYXRlQ2xhc3MgPSByZXF1aXJlKCdjcmVhdGUtcmVhY3QtY2xhc3MnKTtcbnZhciBQcm9wVHlwZXMgPSByZXF1aXJlKCdwcm9wLXR5cGVzJyk7XG52YXIgY2xhc3NOYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcblxuLyoqXG4gKiBBIHNpbmdsZSBvcHRpb24gd2l0aGluIHRoZSBUeXBlYWhlYWRTZWxlY3RvclxuICovXG52YXIgVHlwZWFoZWFkT3B0aW9uID0gY3JlYXRlQ2xhc3Moe1xuICBwcm9wVHlwZXM6IHtcbiAgICBjdXN0b21DbGFzc2VzOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgIGN1c3RvbVZhbHVlOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgIG9uQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICAgIGNoaWxkcmVuOiBQcm9wVHlwZXMub25lT2ZUeXBlKFtQcm9wVHlwZXMuc3RyaW5nLCBQcm9wVHlwZXMuYXJyYXldKSxcbiAgICBob3ZlcjogUHJvcFR5cGVzLmJvb2xcbiAgfSxcblxuICBnZXREZWZhdWx0UHJvcHM6IGZ1bmN0aW9uKCkge1xuICAgIHJldHVybiB7XG4gICAgICBjdXN0b21DbGFzc2VzOiB7fSxcbiAgICAgIG9uQ2xpY2s6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgICAgIGV2ZW50LnByZXZlbnREZWZhdWx0KCk7XG4gICAgICB9XG4gICAgfTtcbiAgfSxcblxuICByZW5kZXI6IGZ1bmN0aW9uKCkge1xuICAgIHZhciBjbGFzc2VzID0ge307XG4gICAgY2xhc3Nlc1t0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMuaG92ZXIgfHwgXCJob3ZlclwiXSA9ICEhdGhpcy5wcm9wcy5ob3ZlcjtcbiAgICBjbGFzc2VzW3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5saXN0SXRlbV0gPSAhIXRoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5saXN0SXRlbTtcblxuICAgIGlmICh0aGlzLnByb3BzLmN1c3RvbVZhbHVlKSB7XG4gICAgICBjbGFzc2VzW3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5jdXN0b21BZGRdID0gISF0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMuY3VzdG9tQWRkO1xuICAgIH1cblxuICAgIHZhciBjbGFzc0xpc3QgPSBjbGFzc05hbWVzKGNsYXNzZXMpO1xuXG4gICAgcmV0dXJuIChcbiAgICAgIDxsaSBjbGFzc05hbWU9e2NsYXNzTGlzdH0gb25DbGljaz17dGhpcy5fb25DbGlja30+XG4gICAgICAgIDxhIGhyZWY9XCJqYXZhc2NyaXB0OiB2b2lkIDA7XCIgY2xhc3NOYW1lPXt0aGlzLl9nZXRDbGFzc2VzKCl9IHJlZj1cImFuY2hvclwiPlxuICAgICAgICAgIHsgdGhpcy5wcm9wcy5jaGlsZHJlblswXSB9XG4gICAgICAgIDwvYT5cbiAgICAgICAgeyB0aGlzLnByb3BzLmNoaWxkcmVuWzFdICYmIChcbiAgICAgICAgICA8ZGl2IGNsYXNzTmFtZT1cImN1c3RvbS1vcHRpb24tY2hpbGRcIiBvbkNsaWNrPXt0aGlzLl9vbkN1c3RvbU9wdGlvbkNoaWxkQ2xpY2t9PlxuICAgICAgICAgICAgeyB0aGlzLnByb3BzLmNoaWxkcmVuWyAxIF0gfVxuICAgICAgICAgIDwvZGl2PlxuICAgICAgICApfVxuICAgICAgPC9saT5cbiAgICApO1xuICB9LFxuXG4gIF9vbkN1c3RvbU9wdGlvbkNoaWxkQ2xpY2soZSkge1xuICAgIHRoaXMucHJvcHMub25DdXN0b21PcHRpb25DaGlsZENsaWNrKGUpO1xuICB9LFxuXG4gIF9nZXRDbGFzc2VzOiBmdW5jdGlvbigpIHtcbiAgICB2YXIgY2xhc3NlcyA9IHtcbiAgICAgIFwidHlwZWFoZWFkLW9wdGlvblwiOiB0cnVlLFxuICAgIH07XG4gICAgY2xhc3Nlc1t0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMubGlzdEFuY2hvcl0gPSAhIXRoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5saXN0QW5jaG9yO1xuXG4gICAgcmV0dXJuIGNsYXNzTmFtZXMoY2xhc3Nlcyk7XG4gIH0sXG5cbiAgX29uQ2xpY2s6IGZ1bmN0aW9uKGV2ZW50KSB7XG4gICAgZXZlbnQucHJldmVudERlZmF1bHQoKTtcbiAgICByZXR1cm4gdGhpcy5wcm9wcy5vbkNsaWNrKGV2ZW50KTtcbiAgfVxufSk7XG5cblxubW9kdWxlLmV4cG9ydHMgPSBUeXBlYWhlYWRPcHRpb247XG4iXX0=
},{"classnames":1,"create-react-class":3,"prop-types":15,"react":"react"}],24:[function(require,module,exports){
var React = window.React || require('react');
var createClass = require('create-react-class');
var PropTypes = require('prop-types');
var TypeaheadOption = require('./option');
var classNames = require('classnames');
var noop = require('lodash').noop;

/**
 * Container for the options rendered as part of the autocompletion process
 * of the typeahead
 */
var TypeaheadSelector = createClass({
    propTypes: {
        options: PropTypes.array,
        allowCustomValues: PropTypes.number,
        customClasses: PropTypes.object,
        customValue: PropTypes.string,
        selectionIndex: PropTypes.number,
        onOptionSelected: PropTypes.func,
        onCustomOptionChildClick: PropTypes.func,
        customOptionChild: PropTypes.oneOfType([PropTypes.element, PropTypes.func]),
        displayOption: PropTypes.func.isRequired,
        defaultClassNames: PropTypes.bool,
        areResultsTruncated: PropTypes.bool,
        resultsTruncatedMessage: PropTypes.string,
        topOption: PropTypes.string,
        showTopOption: PropTypes.bool,
        onTopOptionClick: PropTypes.func
    },

    getDefaultProps: function () {
        return {
            selectionIndex: null,
            customClasses: {},
            allowCustomValues: 0,
            customValue: null,
            onOptionSelected: function (option) {},
            customOptionChild: null,
            onCustomOptionChildClick: () => {},
            defaultClassNames: true,
            topOption: '',
            showTopOption: false,
            onTopOptionClick: noop
        };
    },

    render: function () {
        // Don't render if there are no options to display
        if (!this.props.options.length && this.props.allowCustomValues <= 0) {
            return false;
        }

        var classes = {
            "typeahead-selector": this.props.defaultClassNames
        };
        classes[this.props.customClasses.results] = this.props.customClasses.results;
        var classList = classNames(classes);

        // CustomValue should be added to top of results list with different class name
        var customValue = null;
        var customValueOffset = 0;
        if (this.props.customValue !== null) {
            customValueOffset++;
            customValue = React.createElement(
                TypeaheadOption,
                { ref: this.props.customValue, key: this.props.customValue,
                    hover: this.props.selectionIndex === 0,
                    customClasses: this.props.customClasses,
                    customValue: this.props.customValue,
                    onClick: this._onClick.bind(this, this.props.customValue) },
                this.props.customValue
            );
        }

        var results = [];
        if (this.props.showTopOption) {
            customValueOffset++;
            results.push(React.createElement(
                TypeaheadOption,
                { ref: this.props.topOption, key: this.props.topOption,
                    hover: this.props.selectionIndex === customValueOffset,
                    customClasses: this.props.customClasses,
                    onClick: this.props.onTopOptionClick
                },
                this.props.topOption
            ));
        }

        results = results.concat(this.props.options.map(function (result, i) {
            var displayString = this.props.displayOption(result, i);
            var uniqueKey = displayString + '_' + i;
            return React.createElement(
                TypeaheadOption,
                { ref: uniqueKey, key: uniqueKey,
                    hover: this.props.selectionIndex === i + customValueOffset,
                    customClasses: this.props.customClasses,
                    onClick: this._onClick.bind(this, result),
                    onCustomOptionChildClick: this.props.onCustomOptionChildClick.bind(this, result)
                },
                displayString,
                this.props.customOptionChild
            );
        }, this));

        if (this.props.areResultsTruncated && this.props.resultsTruncatedMessage !== null) {
            var resultsTruncatedClasses = {
                "results-truncated": this.props.defaultClassNames
            };
            resultsTruncatedClasses[this.props.customClasses.resultsTruncated] = this.props.customClasses.resultsTruncated;
            var resultsTruncatedClassList = classNames(resultsTruncatedClasses);

            results.push(React.createElement(
                'li',
                { key: 'results-truncated', className: resultsTruncatedClassList },
                this.props.resultsTruncatedMessage
            ));
        }

        return React.createElement(
            'ul',
            { className: classList },
            customValue,
            results
        );
    },

    _onClick: function (result, event) {
        return this.props.onOptionSelected(result, event);
    }

});

module.exports = TypeaheadSelector;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbInNlbGVjdG9yLmpzIl0sIm5hbWVzIjpbIlJlYWN0IiwicmVxdWlyZSIsImNyZWF0ZUNsYXNzIiwiUHJvcFR5cGVzIiwiVHlwZWFoZWFkT3B0aW9uIiwiY2xhc3NOYW1lcyIsIm5vb3AiLCJUeXBlYWhlYWRTZWxlY3RvciIsInByb3BUeXBlcyIsIm9wdGlvbnMiLCJhcnJheSIsImFsbG93Q3VzdG9tVmFsdWVzIiwibnVtYmVyIiwiY3VzdG9tQ2xhc3NlcyIsIm9iamVjdCIsImN1c3RvbVZhbHVlIiwic3RyaW5nIiwic2VsZWN0aW9uSW5kZXgiLCJvbk9wdGlvblNlbGVjdGVkIiwiZnVuYyIsIm9uQ3VzdG9tT3B0aW9uQ2hpbGRDbGljayIsImN1c3RvbU9wdGlvbkNoaWxkIiwib25lT2ZUeXBlIiwiZWxlbWVudCIsImRpc3BsYXlPcHRpb24iLCJpc1JlcXVpcmVkIiwiZGVmYXVsdENsYXNzTmFtZXMiLCJib29sIiwiYXJlUmVzdWx0c1RydW5jYXRlZCIsInJlc3VsdHNUcnVuY2F0ZWRNZXNzYWdlIiwidG9wT3B0aW9uIiwic2hvd1RvcE9wdGlvbiIsIm9uVG9wT3B0aW9uQ2xpY2siLCJnZXREZWZhdWx0UHJvcHMiLCJvcHRpb24iLCJyZW5kZXIiLCJwcm9wcyIsImxlbmd0aCIsImNsYXNzZXMiLCJyZXN1bHRzIiwiY2xhc3NMaXN0IiwiY3VzdG9tVmFsdWVPZmZzZXQiLCJfb25DbGljayIsImJpbmQiLCJwdXNoIiwiY29uY2F0IiwibWFwIiwicmVzdWx0IiwiaSIsImRpc3BsYXlTdHJpbmciLCJ1bmlxdWVLZXkiLCJyZXN1bHRzVHJ1bmNhdGVkQ2xhc3NlcyIsInJlc3VsdHNUcnVuY2F0ZWQiLCJyZXN1bHRzVHJ1bmNhdGVkQ2xhc3NMaXN0IiwiZXZlbnQiLCJtb2R1bGUiLCJleHBvcnRzIl0sIm1hcHBpbmdzIjoiQUFBQSxJQUFJQSxRQUFRQyxRQUFRLE9BQVIsQ0FBWjtBQUNBLElBQUlDLGNBQWNELFFBQVEsb0JBQVIsQ0FBbEI7QUFDQSxJQUFJRSxZQUFZ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LG1CQUFYLElBQWtDLEtBQUtRLEtBQUwsQ0FBV1AsdUJBQVgsS0FBdUMsSUFBN0UsRUFBbUY7QUFDL0UsZ0JBQUlzQiwwQkFBMEI7QUFDMUIscUNBQXFCLEtBQUtmLEtBQUwsQ0FBV1Y7QUFETixhQUE5QjtBQUdBeUIsb0NBQXdCLEtBQUtmLEtBQUwsQ0FBV3ZCLGFBQVgsQ0FBeUJ1QyxnQkFBakQsSUFBcUUsS0FBS2hCLEtBQUwsQ0FBV3ZCLGFBQVgsQ0FBeUJ1QyxnQkFBOUY7QUFDQSxnQkFBSUMsNEJBQTRCaEQsV0FBVzhDLHVCQUFYLENBQWhDOztBQUVBWixvQkFBUUssSUFBUixDQUNJO0FBQUE7QUFBQSxrQkFBSSxLQUFJLG1CQUFSLEVBQTRCLFdBQVdTLHlCQUF2QztBQUNLLHFCQUFLakIsS0FBTCxDQUFXUDtBQURoQixhQURKO0FBS0g7O0FBRUQsZUFDSTtBQUFBO0FBQUEsY0FBSSxXQUFXVyxTQUFmO0FBQ016Qix1QkFETjtBQUVNd0I7QUFGTixTQURKO0FBTUgsS0F0SCtCOztBQXdIaENHLGNBQVUsVUFBVUssTUFBVixFQUFrQk8sS0FBbEIsRUFBeUI7QUFDL0IsZUFBTyxLQUFLbEIsS0FBTCxDQUFXbEIsZ0JBQVgsQ0FBNEI2QixNQUE1QixFQUFvQ08sS0FBcEMsQ0FBUDtBQUNIOztBQTFIK0IsQ0FBWixDQUF4Qjs7QUE4SEFDLE9BQU9DLE9BQVAsR0FBaUJqRCxpQkFBakIiLCJmaWxlIjoic2VsZWN0b3IuanMiLCJzb3VyY2VzQ29udGVudCI6WyJ2YXIgUmVhY3QgPSByZXF1aXJlKCdyZWFjdCcpO1xudmFyIGNyZWF0ZUNsYXNzID0gcmVxdWlyZSgnY3JlYXRlLXJlYWN0LWNsYXNzJyk7XG52YXIgUHJvcFR5cGVzID0gcmVxdWlyZSgncHJvcC10eXBlcycpO1xudmFyIFR5cGVhaGVhZE9wdGlvbiA9IHJlcXVpcmUoJy4vb3B0aW9uJyk7XG52YXIgY2xhc3NOYW1lcyA9IHJlcXVpcmUoJ2NsYXNzbmFtZXMnKTtcbnZhciBub29wID0gcmVxdWlyZSgnbG9kYXNoJykubm9vcDtcblxuLyoqXG4gKiBDb250YWluZXIgZm9yIHRoZSBvcHRpb25zIHJlbmRlcmVkIGFzIHBhcnQgb2YgdGhlIGF1dG9jb21wbGV0aW9uIHByb2Nlc3NcbiAqIG9mIHRoZSB0eXBlYWhlYWRcbiAqL1xudmFyIFR5cGVhaGVhZFNlbGVjdG9yID0gY3JlYXRlQ2xhc3Moe1xuICAgIHByb3BUeXBlczoge1xuICAgICAgICBvcHRpb25zOiBQcm9wVHlwZXMuYXJyYXksXG4gICAgICAgIGFsbG93Q3VzdG9tVmFsdWVzOiBQcm9wVHlwZXMubnVtYmVyLFxuICAgICAgICBjdXN0b21DbGFzc2VzOiBQcm9wVHlwZXMub2JqZWN0LFxuICAgICAgICBjdXN0b21WYWx1ZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgc2VsZWN0aW9uSW5kZXg6IFByb3BUeXBlcy5udW1iZXIsXG4gICAgICAgIG9uT3B0aW9uU2VsZWN0ZWQ6IFByb3BUeXBlcy5mdW5jLFxuICAgICAgICBvbkN1c3RvbU9wdGlvbkNoaWxkQ2xpY2s6IFByb3BUeXBlcy5mdW5jLFxuICAgICAgICBjdXN0b21PcHRpb25DaGlsZDogUHJvcFR5cGVzLm9uZU9mVHlwZShbXG4gICAgICAgICAgICBQcm9wVHlwZXMuZWxlbWVudCxcbiAgICAgICAgICAgIFByb3BUeXBlcy5mdW5jXG4gICAgICAgIF0pLFxuICAgICAgICBkaXNwbGF5T3B0aW9uOiBQcm9wVHlwZXMuZnVuYy5pc1JlcXVpcmVkLFxuICAgICAgICBkZWZhdWx0Q2xhc3NOYW1lczogUHJvcFR5cGVzLmJvb2wsXG4gICAgICAgIGFyZVJlc3VsdHNUcnVuY2F0ZWQ6IFByb3BUeXBlcy5ib29sLFxuICAgICAgICByZXN1bHRzVHJ1bmNhdGVkTWVzc2FnZTogUHJvcFR5cGVzLnN0cmluZyxcbiAgICAgICAgdG9wT3B0aW9uOiBQcm9wVHlwZXMuc3RyaW5nLFxuICAgICAgICBzaG93VG9wT3B0aW9uOiBQcm9wVHlwZXMuYm9vbCxcbiAgICAgICAgb25Ub3BPcHRpb25DbGljazogUHJvcFR5cGVzLmZ1bmMsXG4gICAgfSxcblxuICAgIGdldERlZmF1bHRQcm9wczogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgc2VsZWN0aW9uSW5kZXg6IG51bGwsXG4gICAgICAgICAgICBjdXN0b21DbGFzc2VzOiB7fSxcbiAgICAgICAgICAgIGFsbG93Q3VzdG9tVmFsdWVzOiAwLFxuICAgICAgICAgICAgY3VzdG9tVmFsdWU6IG51bGwsXG4gICAgICAgICAgICBvbk9wdGlvblNlbGVjdGVkOiBmdW5jdGlvbiAob3B0aW9uKSB7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgY3VzdG9tT3B0aW9uQ2hpbGQ6IG51bGwsXG4gICAgICAgICAgICBvbkN1c3RvbU9wdGlvbkNoaWxkQ2xpY2s6ICgpID0+IHtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBkZWZhdWx0Q2xhc3NOYW1lczogdHJ1ZSxcbiAgICAgICAgICAgIHRvcE9wdGlvbjogJycsXG4gICAgICAgICAgICBzaG93VG9wT3B0aW9uOiBmYWxzZSxcbiAgICAgICAgICAgIG9uVG9wT3B0aW9uQ2xpY2s6IG5vb3AsXG4gICAgICAgIH07XG4gICAgfSxcblxuICAgIHJlbmRlcjogZnVuY3Rpb24gKCkge1xuICAgICAgICAvLyBEb24ndCByZW5kZXIgaWYgdGhlcmUgYXJlIG5vIG9wdGlvbnMgdG8gZGlzcGxheVxuICAgICAgICBpZiAoIXRoaXMucHJvcHMub3B0aW9ucy5sZW5ndGggJiYgdGhpcy5wcm9wcy5hbGxvd0N1c3RvbVZhbHVlcyA8PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgY2xhc3NlcyA9IHtcbiAgICAgICAgICAgIFwidHlwZWFoZWFkLXNlbGVjdG9yXCI6IHRoaXMucHJvcHMuZGVmYXVsdENsYXNzTmFtZXNcbiAgICAgICAgfTtcbiAgICAgICAgY2xhc3Nlc1t0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMucmVzdWx0c10gPSB0aGlzLnByb3BzLmN1c3RvbUNsYXNzZXMucmVzdWx0cztcbiAgICAgICAgdmFyIGNsYXNzTGlzdCA9IGNsYXNzTmFtZXMoY2xhc3Nlcyk7XG5cbiAgICAgICAgLy8gQ3VzdG9tVmFsdWUgc2hvdWxkIGJlIGFkZGVkIHRvIHRvcCBvZiByZXN1bHRzIGxpc3Qgd2l0aCBkaWZmZXJlbnQgY2xhc3MgbmFtZVxuICAgICAgICB2YXIgY3VzdG9tVmFsdWUgPSBudWxsO1xuICAgICAgICB2YXIgY3VzdG9tVmFsdWVPZmZzZXQgPSAwO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5jdXN0b21WYWx1ZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgY3VzdG9tVmFsdWVPZmZzZXQrKztcbiAgICAgICAgICAgIGN1c3RvbVZhbHVlID0gKFxuICAgICAgICAgICAgICAgIDxUeXBlYWhlYWRPcHRpb24gcmVmPXt0aGlzLnByb3BzLmN1c3RvbVZhbHVlfSBrZXk9e3RoaXMucHJvcHMuY3VzdG9tVmFsdWV9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBob3Zlcj17dGhpcy5wcm9wcy5zZWxlY3Rpb25JbmRleCA9PT0gMH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbUNsYXNzZXM9e3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbVZhbHVlPXt0aGlzLnByb3BzLmN1c3RvbVZhbHVlfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DbGljaz17dGhpcy5fb25DbGljay5iaW5kKHRoaXMsIHRoaXMucHJvcHMuY3VzdG9tVmFsdWUpfT5cbiAgICAgICAgICAgICAgICAgICAgeyB0aGlzLnByb3BzLmN1c3RvbVZhbHVlIH1cbiAgICAgICAgICAgICAgICA8L1R5cGVhaGVhZE9wdGlvbj5cbiAgICAgICAgICAgICk7XG4gICAgICAgIH1cblxuICAgICAgICB2YXIgcmVzdWx0cyA9IFtdO1xuICAgICAgICBpZiAodGhpcy5wcm9wcy5zaG93VG9wT3B0aW9uKSB7XG4gICAgICAgICAgICBjdXN0b21WYWx1ZU9mZnNldCsrO1xuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKFxuICAgICAgICAgICAgICAgIDxUeXBlYWhlYWRPcHRpb24gcmVmPXt0aGlzLnByb3BzLnRvcE9wdGlvbn0ga2V5PXt0aGlzLnByb3BzLnRvcE9wdGlvbn1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGhvdmVyPXt0aGlzLnByb3BzLnNlbGVjdGlvbkluZGV4ID09PSBjdXN0b21WYWx1ZU9mZnNldH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbUNsYXNzZXM9e3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMucHJvcHMub25Ub3BPcHRpb25DbGlja31cbiAgICAgICAgICAgICAgICA+XG4gICAgICAgICAgICAgICAgICAgIHsgdGhpcy5wcm9wcy50b3BPcHRpb24gfVxuICAgICAgICAgICAgICAgIDwvVHlwZWFoZWFkT3B0aW9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJlc3VsdHMgPSByZXN1bHRzLmNvbmNhdCh0aGlzLnByb3BzLm9wdGlvbnMubWFwKGZ1bmN0aW9uIChyZXN1bHQsIGkpIHtcbiAgICAgICAgICAgIHZhciBkaXNwbGF5U3RyaW5nID0gdGhpcy5wcm9wcy5kaXNwbGF5T3B0aW9uKHJlc3VsdCwgaSk7XG4gICAgICAgICAgICB2YXIgdW5pcXVlS2V5ID0gZGlzcGxheVN0cmluZyArICdfJyArIGk7XG4gICAgICAgICAgICByZXR1cm4gKFxuICAgICAgICAgICAgICAgIDxUeXBlYWhlYWRPcHRpb24gcmVmPXt1bmlxdWVLZXl9IGtleT17dW5pcXVlS2V5fVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaG92ZXI9e3RoaXMucHJvcHMuc2VsZWN0aW9uSW5kZXggPT09IGkgKyBjdXN0b21WYWx1ZU9mZnNldH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGN1c3RvbUNsYXNzZXM9e3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlc31cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIG9uQ2xpY2s9e3RoaXMuX29uQ2xpY2suYmluZCh0aGlzLCByZXN1bHQpfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgb25DdXN0b21PcHRpb25DaGlsZENsaWNrPXt0aGlzLnByb3BzLm9uQ3VzdG9tT3B0aW9uQ2hpbGRDbGljay5iaW5kKHRoaXMsIHJlc3VsdCl9XG4gICAgICAgICAgICAgICAgPlxuICAgICAgICAgICAgICAgICAgICB7IGRpc3BsYXlTdHJpbmcgfVxuICAgICAgICAgICAgICAgICAgICB7IHRoaXMucHJvcHMuY3VzdG9tT3B0aW9uQ2hpbGQgfVxuICAgICAgICAgICAgICAgIDwvVHlwZWFoZWFkT3B0aW9uPlxuICAgICAgICAgICAgKTtcbiAgICAgICAgfSwgdGhpcykpO1xuXG4gICAgICAgIGlmICh0aGlzLnByb3BzLmFyZVJlc3VsdHNUcnVuY2F0ZWQgJiYgdGhpcy5wcm9wcy5yZXN1bHRzVHJ1bmNhdGVkTWVzc2FnZSAhPT0gbnVsbCkge1xuICAgICAgICAgICAgdmFyIHJlc3VsdHNUcnVuY2F0ZWRDbGFzc2VzID0ge1xuICAgICAgICAgICAgICAgIFwicmVzdWx0cy10cnVuY2F0ZWRcIjogdGhpcy5wcm9wcy5kZWZhdWx0Q2xhc3NOYW1lc1xuICAgICAgICAgICAgfTtcbiAgICAgICAgICAgIHJlc3VsdHNUcnVuY2F0ZWRDbGFzc2VzW3RoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5yZXN1bHRzVHJ1bmNhdGVkXSA9IHRoaXMucHJvcHMuY3VzdG9tQ2xhc3Nlcy5yZXN1bHRzVHJ1bmNhdGVkO1xuICAgICAgICAgICAgdmFyIHJlc3VsdHNUcnVuY2F0ZWRDbGFzc0xpc3QgPSBjbGFzc05hbWVzKHJlc3VsdHNUcnVuY2F0ZWRDbGFzc2VzKTtcblxuICAgICAgICAgICAgcmVzdWx0cy5wdXNoKFxuICAgICAgICAgICAgICAgIDxsaSBrZXk9XCJyZXN1bHRzLXRydW5jYXRlZFwiIGNsYXNzTmFtZT17cmVzdWx0c1RydW5jYXRlZENsYXNzTGlzdH0+XG4gICAgICAgICAgICAgICAgICAgIHt0aGlzLnByb3BzLnJlc3VsdHNUcnVuY2F0ZWRNZXNzYWdlfVxuICAgICAgICAgICAgICAgIDwvbGk+XG4gICAgICAgICAgICApO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIChcbiAgICAgICAgICAgIDx1bCBjbGFzc05hbWU9e2NsYXNzTGlzdH0+XG4gICAgICAgICAgICAgICAgeyBjdXN0b21WYWx1ZSB9XG4gICAgICAgICAgICAgICAgeyByZXN1bHRzIH1cbiAgICAgICAgICAgIDwvdWw+XG4gICAgICAgICk7XG4gICAgfSxcblxuICAgIF9vbkNsaWNrOiBmdW5jdGlvbiAocmVzdWx0LCBldmVudCkge1xuICAgICAgICByZXR1cm4gdGhpcy5wcm9wcy5vbk9wdGlvblNlbGVjdGVkKHJlc3VsdCwgZXZlbnQpO1xuICAgIH0sXG5cbn0pO1xuXG5tb2R1bGUuZXhwb3J0cyA9IFR5cGVhaGVhZFNlbGVjdG9yO1xuIl19
},{"./option":23,"classnames":1,"create-react-class":3,"lodash":9,"prop-types":15,"react":"react"}]},{},[19])(19)
});