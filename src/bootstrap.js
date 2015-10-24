const {
  classes: Cc,
  interfaces: Ci,
  manager: Cm,
  results: Cr,
  utils: Cu,
} = Components;

Cm.QueryInterface(Ci.nsIComponentRegistrar);

Cu.import('resource://gre/modules/Services.jsm');
Cu.import('resource://gre/modules/XPCOMUtils.jsm');

const GC_MODULE_BROWSER = 'chrome://guiconfig/content/browser.js';
const GC_UI_PAGE = 'chrome://guiconfig/content/preferences-page.xul';

const GC_ABOUT_CID = '{f72e335c-3b49-4409-bbee-bc6b3052b032}';
const GC_ABOUT_DESCRIPTION = 'gui:config preferences page';
const GC_ABOUT_CONTRACT = '@mozilla.org/network/protocol/about;1?what=guiconfig';

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

var AboutGuiconfigFactory = Object.freeze({
  createInstance: function(outer, iid) {
    if (outer) {
      throw Cr.NS_ERROR_NO_AGGREGATION;
    }
    return new AboutGuiconfig();
  }
});

function AboutGuiconfig() { }

AboutGuiconfig.prototype = Object.freeze({
  classID: Components.ID(GC_ABOUT_CID),
  classDescription: GC_ABOUT_DESCRIPTION,
  contractID: GC_ABOUT_CONTRACT,
  QueryInterface: XPCOMUtils.generateQI([Ci.nsIAboutModule]),

  getURIFlags: function(aURI) {
    return Ci.nsIAboutModule.ALLOW_SCRIPT;
  },

  newChannel: function(aURI) {
    var channel = Services.io.newChannel(GC_UI_PAGE, null, null);
    channel.originalURI = aURI;
    return channel;
  }
});

function install(data, reason) { }

function uninstall(data, reason) {
  if (reason === ADDON_UNINSTALL) {
    Services.prefs.clearUserPref('extensions.guiconfig.firststart');
  }
}

function startup(data, reason) {
  forEachWindow(loadIntoWindow);
  Services.wm.addListener(WindowListener);

  var  stylesheetService = Cc["@mozilla.org/content/style-sheet-service;1"].getService(Ci.nsIStyleSheetService);
  for (var i = 0, l = stylesheets.length; i < l; i++) {
    var stylesheetURI = Services.io.newURI(stylesheets[i], null, null);
    stylesheetService.loadAndRegisterSheet(stylesheetURI, stylesheetService.AUTHOR_SHEET);
  }

  Cm.registerFactory(AboutGuiconfig.prototype.classID,
      AboutGuiconfig.prototype.classDescription,
      AboutGuiconfig.prototype.contractID, AboutGuiconfigFactory);
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

  Cm.unregisterFactory(AboutGuiconfig.prototype.classID, AboutGuiconfigFactory);
  Cu.unload(GC_MODULE_BROWSER);
}

function forEachWindow(action) {
  var windows = Services.wm.getEnumerator('navigator:browser');
  while (windows.hasMoreElements())
    action(windows.getNext().QueryInterface(Ci.nsIDOMWindow));
}

function loadIntoWindow(window) {
  Cu.import(GC_MODULE_BROWSER);
  browser.load(window);
}

function unloadFromWindow(window) {
  Cu.import(GC_MODULE_BROWSER);
  browser.unload(window);
}
