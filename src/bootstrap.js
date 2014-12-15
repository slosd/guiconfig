const { classes: Cc, interfaces: Ci, utils: Cu } = Components;

Cu.import('resource://gre/modules/Services.jsm');

var stylesheets = [ 'chrome://guiconfig/skin/style/button.css' ];

var WindowListener = {
  onOpenWindow: function(xulWindow) {
    var window = xulWindow.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIDOMWindow);
    function onWindowLoad() {
      window.removeEventListener('load', onWindowLoad);
      if (window.document.documentElement.getAttribute('windowtype') == 'navigator:browser') {
        loadIntoWindow(window);
      }
    }
    window.addEventListener('load', onWindowLoad);
  },
  onCloseWindow: function(xulWindow) { },
  onWindowTitleChange: function(xulWindow, newTitle) { }
};

function install(data, reason) { }
function uninstall(data, reason) { }

function startup(data, reason) {
  forEachWindow(loadIntoWindow);
  Services.wm.addListener(WindowListener);

  var  stylesheetService = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
  for (var i = 0, l = stylesheets.length; i < l; i++) {
    var stylesheetURI = Services.io.newURI(stylesheets[i], null, null);
    stylesheetService.loadAndRegisterSheet(stylesheetURI, stylesheetService.AUTHOR_SHEET);
  }
}

function shutdown(data, reason) {
  if (reason === APP_SHUTDOWN)
    return;

  Services.wm.removeListener(WindowListener);
  forEachWindow(unloadFromWindow);

  var  stylesheetService = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
  for (var i = 0, l = stylesheets.length; i < l; i++) {
    var stylesheetURI = Services.io.newURI(stylesheets[i], null, null);
    if (stylesheetService.sheetRegistered(stylesheetURI, stylesheetService.AUTHOR_SHEET)) {
      stylesheetService.unregisterSheet(stylesheetURI, stylesheetService.AUTHOR_SHEET);
    }
  }
}

function forEachWindow(action) {
  var windows = Services.wm.getEnumerator('navigator:browser');
  while (windows.hasMoreElements())
    action(windows.getNext().QueryInterface(Ci.nsIDOMWindow));
}

function loadIntoWindow(window) {
  Cu.import('chrome://guiconfig/content/browser.js');
  browser.load(window);
}

function unloadFromWindow(window) {
  Cu.import('chrome://guiconfig/content/browser.js');
  browser.unload(window);
}
