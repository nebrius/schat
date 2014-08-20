define([], function() {
  "use strict";
  var storeController = Symbol();
  var viewController = Symbol();
  var registerStoreController = Symbol();
  var registerViewController = Symbol();
  var Aggregator = function Aggregator() {
    var $__0 = this;
    $traceurRuntime.setProperty(this, registerStoreController, (function(vc) {
      $traceurRuntime.setProperty($__0, storeController, vc);
    }));
    $traceurRuntime.setProperty(this, registerViewController, (function(vc) {
      $traceurRuntime.setProperty($__0, viewController, vc);
    }));
  };
  ($traceurRuntime.createClass)(Aggregator, {update: function() {
      this[$traceurRuntime.toProperty(viewController)].render(this[$traceurRuntime.toProperty(storeController)].render());
    }}, {});
  var aggregator = new Aggregator();
  var Dispatcher = function Dispatcher() {
    var $__0 = this;
    $traceurRuntime.setProperty(this, registerStoreController, (function(vc) {
      $traceurRuntime.setProperty($__0, storeController, vc);
    }));
  };
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
      $traceurRuntime.setProperty(this[$traceurRuntime.toProperty(routes)], name, options);
    },
    route: function(newRoute) {
      var routeOptions = this[$traceurRuntime.toProperty(routes)][$traceurRuntime.toProperty(newRoute)];
      if (!routeOptions) {
        throw new Error('Unknown route "' + newRoute + '"');
      }
      var storeController = new routeOptions.storeController();
      var viewController = new routeOptions.viewController();
      aggregator[$traceurRuntime.toProperty(registerStoreController)](storeController);
      aggregator[$traceurRuntime.toProperty(registerViewController)](viewController);
      dispatcher[$traceurRuntime.toProperty(registerStoreController)](storeController);
      viewController.onConnected && viewController.onConnected();
      storeController.onConnected && storeController.onConnected();
    }
  }, {});
  var router = new Router();
  return {
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
