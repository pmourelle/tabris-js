tabris._start = function(client) {
  try {
    window.global = window.self = window;
    tabris._client = client;
    var Module = tabris.Module;
    var rootModule = new Module();
    try {
      rootModule.require("tabris");
    } catch (error) {
      console.error("Could not load tabris module: " + error);
      console.log(error.stack);
      return;
    }
    tabris._defineModule = function(id, fn) {
      return new Module(id, rootModule, fn);
    };
    tabris._client = client; // required by head.append
    var cordovaScript = document.createElement("script");
    cordovaScript.src = "./cordova.js";
    document.head.appendChild(cordovaScript);
    if (tabris._init) {
      tabris._init(client);
    }
    var loadMain = function() {
      try {
        rootModule.require("./");
        tabris.trigger("flush");
      } catch (error) {
        console.error("Could not load main module: " + error);
        console.log(error.stack);
      }
    };
    if (tabris._entryPoint) {
      tabris._entryPoint(loadMain);
      delete tabris._entryPoint;
    } else {
      loadMain();
    }
    tabris.trigger("flush");
  } catch (ex) {
    console.error(ex);
    console.log(ex.stack);
  }
};

tabris._notify = function() {
  // client may get the reference to _notify before tabris has been loaded
  tabris._notify.apply(this, arguments);
};
