define([], function() {
  "use strict";
  var storeController = Symbol();
  var viewController = Symbol();
  var StoreController = function StoreController() {};
  ($traceurRuntime.createClass)(StoreController, {
    trigger: function() {
      throw new Error('"trigger" must be implemented by a derived store controller');
    },
    render: function() {
      throw new Error('"render" must be implemented by a derived store controller');
    },
    onConnected: function() {},
    onDisconnected: function() {}
  }, {});
  var Store = function Store() {};
  ($traceurRuntime.createClass)(Store, {
    trigger: function() {
      throw new Error('"trigger" must be implemented by a derived store');
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
  var Aggregator = function Aggregator() {};
  ($traceurRuntime.createClass)(Aggregator, {update: function() {
      this[$traceurRuntime.toProperty(viewController)].render(this[$traceurRuntime.toProperty(storeController)].render());
    }}, {});
  var aggregator = new Aggregator();
  var Dispatcher = function Dispatcher() {};
  ($traceurRuntime.createClass)(Dispatcher, {trigger: function(event) {
      this[$traceurRuntime.toProperty(storeController)].trigger(event);
    }}, {});
  var dispatcher = new Dispatcher();
  var routes = Symbol();
  var Router = function Router() {
    $traceurRuntime.setProperty(this, routes, {});
  };
  ($traceurRuntime.createClass)(Router, {
    registerRoute: function(name, options) {
      if (!(options.storeController instanceof StoreController)) {
        throw new Error('Invalid store controller');
      }
      if (!(options.viewController instanceof ViewController)) {
        throw new Error('Invalid view controller');
      }
      $traceurRuntime.setProperty(this[$traceurRuntime.toProperty(routes)], name, options);
    },
    route: function(newRoute, data) {
      var routeOptions = this[$traceurRuntime.toProperty(routes)][$traceurRuntime.toProperty(newRoute)];
      if (!routeOptions) {
        throw new Error('Unknown route "' + newRoute + '"');
      }
      if (aggregator[$traceurRuntime.toProperty(storeController)]) {
        aggregator[$traceurRuntime.toProperty(storeController)].onDisconnected();
        aggregator[$traceurRuntime.toProperty(viewController)].onDisconnected();
      }
      $traceurRuntime.setProperty(aggregator, storeController, routeOptions.storeController);
      $traceurRuntime.setProperty(aggregator, viewController, routeOptions.viewController);
      $traceurRuntime.setProperty(dispatcher, storeController, routeOptions.storeController);
      routeOptions.viewController.onConnected();
      routeOptions.storeController.onConnected(data || {});
    }
  }, {});
  var router = new Router();
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
    get aggregator() {
      return aggregator;
    },
    get dispatcher() {
      return dispatcher;
    },
    get router() {
      return router;
    },
    __esModule: true
  };
});
