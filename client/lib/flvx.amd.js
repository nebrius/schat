define([], function() {
  "use strict";
  var $__1;
  var children = Symbol();
  var internalDispatch = Symbol();
  var internalOnConnected = Symbol();
  var internalOnDisconnected = Symbol();
  var Dispatchable = function Dispatchable() {};
  ($traceurRuntime.createClass)(Dispatchable, ($__1 = {}, Object.defineProperty($__1, internalDispatch, {
    value: function(action) {
      this.dispatch(action);
      if (this[$traceurRuntime.toProperty(children)]) {
        for (var $__2 = this[$traceurRuntime.toProperty(children)][$traceurRuntime.toProperty(Symbol.iterator)](),
            $__3; !($__3 = $__2.next()).done; ) {
          try {
            throw undefined;
          } catch (child) {
            {
              child = $__3.value;
              {
                child[$traceurRuntime.toProperty(internalDispatch)](action);
              }
            }
          }
        }
      }
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__1, internalOnConnected, {
    value: function(action) {
      this.onConnected(action);
      if (this[$traceurRuntime.toProperty(children)]) {
        for (var $__2 = this[$traceurRuntime.toProperty(children)][$traceurRuntime.toProperty(Symbol.iterator)](),
            $__3; !($__3 = $__2.next()).done; ) {
          try {
            throw undefined;
          } catch (child) {
            {
              child = $__3.value;
              {
                child[$traceurRuntime.toProperty(internalOnConnected)](action);
              }
            }
          }
        }
      }
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__1, internalOnDisconnected, {
    value: function(action) {
      this.onDisconnected(action);
      if (this[$traceurRuntime.toProperty(children)]) {
        for (var $__2 = this[$traceurRuntime.toProperty(children)][$traceurRuntime.toProperty(Symbol.iterator)](),
            $__3; !($__3 = $__2.next()).done; ) {
          try {
            throw undefined;
          } catch (child) {
            {
              child = $__3.value;
              {
                child[$traceurRuntime.toProperty(internalOnDisconnected)](action);
              }
            }
          }
        }
      }
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__1, "register", {
    value: function(child) {
      if (!this[$traceurRuntime.toProperty(children)]) {
        $traceurRuntime.setProperty(this, children, []);
      }
      this[$traceurRuntime.toProperty(children)].push(child);
    },
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__1, "dispatch", {
    value: function() {},
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__1, "onConnected", {
    value: function() {},
    configurable: true,
    enumerable: true,
    writable: true
  }), Object.defineProperty($__1, "onDisconnected", {
    value: function() {},
    configurable: true,
    enumerable: true,
    writable: true
  }), $__1), {});
  var StoreController = function StoreController() {
    $traceurRuntime.defaultSuperCall(this, $StoreController.prototype, arguments);
  };
  var $StoreController = StoreController;
  ($traceurRuntime.createClass)(StoreController, {render: function() {
      throw new Error('"render" must be implemented by a derived store controller');
    }}, {}, Dispatchable);
  var Store = function Store() {
    $traceurRuntime.defaultSuperCall(this, $Store.prototype, arguments);
  };
  var $Store = Store;
  ($traceurRuntime.createClass)(Store, {render: function() {
      throw new Error('"render" must be implemented by a derived store');
    }}, {}, Dispatchable);
  var LinkController = function LinkController() {
    $traceurRuntime.defaultSuperCall(this, $LinkController.prototype, arguments);
  };
  var $LinkController = LinkController;
  ($traceurRuntime.createClass)(LinkController, {}, {}, Dispatchable);
  var Link = function Link() {
    $traceurRuntime.defaultSuperCall(this, $Link.prototype, arguments);
  };
  var $Link = Link;
  ($traceurRuntime.createClass)(Link, {}, {}, Dispatchable);
  var ViewController = function ViewController() {};
  ($traceurRuntime.createClass)(ViewController, {render: function() {
      throw new Error('"render" must be implemented by a derived view controller');
    }}, {});
  var currentStoreController = null;
  var currentViewController = null;
  var currentLinkController = null;
  var routes = {};
  function aggregate() {
    if (!currentViewController) {
      throw new Error('"aggregate" called before first route');
    }
    currentViewController.render(currentStoreController.render());
  }
  function dispatch(action) {
    if (!currentStoreController) {
      throw new Error('"dispatch" called before first route');
    }
    if (currentLinkController) {
      currentLinkController[$traceurRuntime.toProperty(internalDispatch)](action);
    }
    currentStoreController[$traceurRuntime.toProperty(internalDispatch)](action);
  }
  function registerRoute(name, options) {
    if (!(options.storeController instanceof StoreController)) {
      throw new Error('Invalid store controller');
    }
    if (!(options.viewController instanceof ViewController)) {
      throw new Error('Invalid view controller');
    }
    if (options.linkController && !(options.linkController instanceof LinkController)) {
      throw new Error('Invalid link controller');
    }
    $traceurRuntime.setProperty(routes, name, options);
  }
  function route(name, state) {
    var nextRoute = routes[$traceurRuntime.toProperty(name)];
    if (!nextRoute) {
      throw new Error('Unknown route "' + route + '"');
    }
    state = state || {};
    if (currentStoreController) {
      currentStoreController[$traceurRuntime.toProperty(internalOnDisconnected)]();
    }
    if (currentLinkController) {
      currentLinkController[$traceurRuntime.toProperty(internalOnDisconnected)]();
    }
    currentStoreController = nextRoute.storeController;
    currentLinkController = nextRoute.linkController;
    currentViewController = nextRoute.viewController;
    currentStoreController[$traceurRuntime.toProperty(internalOnConnected)](state);
    if (currentLinkController) {
      currentLinkController[$traceurRuntime.toProperty(internalOnConnected)]();
    }
  }
  return {
    get StoreController() {
      return StoreController;
    },
    get Store() {
      return Store;
    },
    get LinkController() {
      return LinkController;
    },
    get Link() {
      return Link;
    },
    get ViewController() {
      return ViewController;
    },
    get aggregate() {
      return aggregate;
    },
    get dispatch() {
      return dispatch;
    },
    get registerRoute() {
      return registerRoute;
    },
    get route() {
      return route;
    },
    __esModule: true
  };
});
