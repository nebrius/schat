define([], function() {
  "use strict";
  var StoreController = function StoreController() {};
  ($traceurRuntime.createClass)(StoreController, {
    dispatch: function() {
      throw new Error('"dispatch" must be implemented by a derived store controller');
    },
    render: function() {
      throw new Error('"render" must be implemented by a derived store controller');
    },
    onConnected: function() {},
    onDisconnected: function() {}
  }, {});
  var Store = function Store() {};
  ($traceurRuntime.createClass)(Store, {
    dispatch: function() {
      throw new Error('"dispatch" must be implemented by a derived store');
    },
    render: function() {
      throw new Error('"render" must be implemented by a derived store');
    },
    onConnected: function() {},
    onDisconnected: function() {}
  }, {});
  var ViewController = function ViewController() {};
  ($traceurRuntime.createClass)(ViewController, {
    render: function() {
      throw new Error('"render" must be implemented by a derived view controller');
    },
    onConnected: function() {},
    onDisconnected: function() {}
  }, {});
  var LinkController = function LinkController() {};
  ($traceurRuntime.createClass)(LinkController, {
    dispatch: function() {
      throw new Error('"dispatch" must be implemented by a derived link controller');
    },
    onConnected: function() {},
    onDisconnected: function() {}
  }, {});
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
      currentLinkController.dispatch(action);
    }
    currentStoreController.dispatch(action);
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
      currentStoreController.onDisconnected();
    }
    if (currentLinkController) {
      currentLinkController.onDisconnected();
    }
    if (currentViewController) {
      currentViewController.onDisconnected();
    }
    currentStoreController = nextRoute.storeController;
    currentLinkController = nextRoute.linkController;
    currentViewController = nextRoute.viewController;
    currentStoreController.onConnected(state);
    if (currentLinkController) {
      currentLinkController.onConnected();
    }
    currentViewController.onConnected();
  }
  return {
    get StoreController() {
      return StoreController;
    },
    get Store() {
      return Store;
    },
    get ViewController() {
      return ViewController;
    },
    get LinkController() {
      return LinkController;
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
