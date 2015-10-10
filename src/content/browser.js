Components.utils.import('resource://gre/modules/Services.jsm');

var EXPORTED_SYMBOLS = [ 'browser' ];

const GC_PREF_FIRST_START = 'extensions.guiconfig.firststart';
const GC_PREF_INCONTENT = 'extensions.guiconfig.inContent';

var CUSTOMIZABLE_UI;
try {
  Components.utils.import('resource:///modules/CustomizableUI.jsm');
  CUSTOMIZABLE_UI = true;
} catch(e) {
  CUSTOMIZABLE_UI = false;
}

var FIRST_START;
try {
  FIRST_START = Services.prefs.getBoolPref(GC_PREF_FIRST_START);
} catch(e) {
  FIRST_START = true;
}
if (FIRST_START) {
  Services.prefs.setBoolPref(GC_PREF_FIRST_START, false);
}

try {
  Services.prefs.getBoolPref(GC_PREF_INCONTENT);
} catch(e) {
  Services.prefs.setBoolPref(GC_PREF_INCONTENT, true);
}

const PREFERENCES_DIALOG_URI = 'chrome://guiconfig/content/preferences.xul';
const BUTTON_ID = 'guiconfig-open-preferences';

var dialog = null;
var nodes = new WeakMap();
var strings = Services.strings.createBundle('chrome://guiconfig/locale/gcLocale.properties');

function registerUI(node) {
  var window = node.ownerDocument.defaultView;
  if (!window) return;
  if (!nodes.has(window)) {
    nodes.set(window, []);
  }
  nodes.get(window).push(node);
  return node;
}

function removeUI(window) {
  if (CUSTOMIZABLE_UI) {
    CustomizableUI.destroyWidget(BUTTON_ID);
  }
  if (!nodes.has(window)) return;
  for (var node of nodes.get(window)) {
    if (node && node.parentNode) {
      node.parentNode.removeChild(node);
    }
  }
}

function findToolbar(window) {
  var document = window.document;
  for (var tb of document.getElementsByTagName('toolbar')) {
    var currentSet = tb.getAttribute('currentset').split(',');
    var index = currentSet.indexOf(BUTTON_ID);
    if (index !== -1) {
      return { id: tb.id, set: currentSet, buttonIndex: index };
    }
  }
  return null;
}

function createToolbarButton(window) {
  var document = window.document;
  var button = document.createElement('toolbarbutton');
  button.setAttribute('id', BUTTON_ID);
  button.setAttribute('class', 'toolbarbutton-1 chromeclass-toolbar-additional');
  button.setAttribute('label', strings.GetStringFromName('browser.item.label'));
  button.setAttribute('tooltiptext', strings.GetStringFromName('browser.item.label'));
  button.addEventListener('command', function() {
    showPreferences(window);
  }, false);
  return button;
}

function createMenuItem(window, id) {
  var document = window.document;
  var menuitem = document.createElement('menuitem');
  menuitem.setAttribute('id', id);
  menuitem.setAttribute('label', strings.GetStringFromName('browser.item.label'));
  menuitem.setAttribute('image', 'chrome://guiconfig/skin/icons/icon.16.png');
  menuitem.setAttribute('accesskey', strings.GetStringFromName('browser.item.access'));
  menuitem.addEventListener('command', function() {
    showPreferences(window);
  }, false);
  return menuitem;
}

var addToolbarButton;
if (CUSTOMIZABLE_UI) {
  /**
   * Since the module CustomizableUI is available we can simply use that to
   * add the toolbar button.
   */
  addToolbarButton = function() {
    var added = false;
    return function _addToolbarButton_customizableUI(window) {
      if (added) {
        return;
      }
      CustomizableUI.createWidget({
        id: BUTTON_ID,
        defaultArea: CustomizableUI.AREA_NAVBAR,
        label: strings.GetStringFromName('browser.item.label'),
        tooltiptext: strings.GetStringFromName('browser.item.label'),
        onCommand: function(event) {
          var eventWindow = event.target.ownerDocument.defaultView;
          showPreferences(eventWindow);
        }
      });
      if (FIRST_START) {
        CustomizableUI.addWidgetToArea(BUTTON_ID, CustomizableUI.AREA_NAVBAR);
      }
      added = true;
    };
  }();
} else {
  /**
   * Manually add and restore the toolbar button.
   */
  addToolbarButton = function _addToolbarButton_legacy(window) {
    var document = window.document;
    var toolbox = document.getElementById('navigator-toolbox');
    toolbox.palette.appendChild(registerUI(createToolbarButton(window)));

    var toolbarInfo = FIRST_START ? { id: 'nav-bar', currentset: [], buttonIndex: -1 } : findToolbar(window);
    if (!toolbarInfo)
      return;

    var toolbar = document.getElementById(toolbarInfo.id);
    var beforeNode = null;
    var beforeIndex = toolbarInfo.buttonIndex + 1;
    while (toolbarInfo.buttonIndex !== -1 && beforeIndex < toolbarInfo.set.length &&
        !(beforeNode = document.getElementById(toolbarInfo.set[beforeIndex])))
      beforeIndex += 1;
    toolbar.insertItem(BUTTON_ID, beforeNode);
    toolbar.setAttribute('currentset', toolbar.currentSet);
    document.persist(toolbarInfo.id, 'currentset');
  };
}

function addMenuItem(window) {
  var document = window.document;
  [
    ['guiconfig-open-preferences-menuitem', 'appmenu_preferences'],
    ['guiconfig-open-preferences-appmenuitem', 'menu_preferences']
  ].forEach(function(itemData) {
    var [itemId, beforeNodeId] = itemData;
    var beforeNode = document.getElementById(beforeNodeId);
    if (beforeNode) {
      beforeNode.parentNode.insertBefore(registerUI(createMenuItem(window, itemId)), beforeNode);
    }
  });
}

function showPreferences(window) {
  var incontent = true;
  try {
    incontent = Services.prefs.getBoolPref(GC_PREF_INCONTENT);
  } catch(e) { }

  if (incontent) {
    window.openUILinkIn('about:guiconfig', 'tab');
  } else {
    if(dialog && !dialog.closed) {
      dialog.focus();
    } else {
      dialog = window.openDialog(PREFERENCES_DIALOG_URI, 'guiconfig-preferences',
          'chrome,titlebar,toolbar,centerscreen');
    }
  }
}

var browser = {
  load: function(window) {
    addToolbarButton(window);
    addMenuItem(window);
  },
  unload: function(window) {
    removeUI(window);
  }
};
