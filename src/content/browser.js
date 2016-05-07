/*
    Copyright (C) 2014, 2015 Thomas Leberbauer

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU General Public License as published by
    the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU General Public License for more details.

    You should have received a copy of the GNU General Public License
    along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

Components.utils.import('resource://gre/modules/Services.jsm');
Components.utils.import('resource:///modules/CustomizableUI.jsm');

var EXPORTED_SYMBOLS = [ 'browser' ];

const GC_PREF_FIRST_START = 'extensions.guiconfig.firststart';
const GC_PREF_INCONTENT = 'extensions.guiconfig.inContent';

const GC_PREFERENCES_DIALOG = 'chrome://guiconfig/content/preferences.xul';
const GC_BUTTON_ID = 'guiconfig-open-preferences';

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
    var index = currentSet.indexOf(GC_BUTTON_ID);
    if (index !== -1) {
      return { id: tb.id, set: currentSet, buttonIndex: index };
    }
  }
  return null;
}

function createToolbarButton(window) {
  var document = window.document;
  var button = document.createElement('toolbarbutton');
  button.setAttribute('id', GC_BUTTON_ID);
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

function addToolbarButton() {
  CustomizableUI.createWidget({
    id: GC_BUTTON_ID,
    defaultArea: CustomizableUI.AREA_NAVBAR,
    label: strings.GetStringFromName('browser.item.label'),
    tooltiptext: strings.GetStringFromName('browser.item.label'),
    onCommand: function(event) {
      var eventWindow = event.target.ownerDocument.defaultView;
      showPreferences(eventWindow);
    }
  });
  if (FIRST_START) {
    CustomizableUI.addWidgetToArea(GC_BUTTON_ID, CustomizableUI.AREA_NAVBAR);
  }
}

function removeToolbarButton() {
  CustomizableUI.destroyWidget(GC_BUTTON_ID);
}

function addMenuItem(window) {
  var itemId = 'guiconfig-open-preferences-appmenuitem';
  var beforeNodeId = 'menu_preferences';
  var beforeNode = window.document.getElementById(beforeNodeId);
  if (beforeNode) {
    beforeNode.parentNode.insertBefore(registerUI(createMenuItem(window, itemId)), beforeNode);
  }
}

function focusTabWithURL(url) {
  var windows = Services.wm.getEnumerator("navigator:browser");
  var found = false;
  while (!found && windows.hasMoreElements()) {
    var win = windows.getNext();
    var tabbrowser = win.gBrowser;
    for (var i = 0, l = tabbrowser.browsers.length; i < l; i++) {
      var browser = tabbrowser.getBrowserAtIndex(i);
      if (browser.currentURI.spec === url) {
        tabbrowser.selectedTab = tabbrowser.tabContainer.childNodes[i];
        win.focus();
        found = true;
        break;
      }
    }
  }
  return found;
}

function showPreferences(window) {
  var incontent = true;
  try {
    incontent = Services.prefs.getBoolPref(GC_PREF_INCONTENT);
  } catch(e) { }

  if (incontent) {
    if (!focusTabWithURL('about:guiconfig')) {
      window.openUILinkIn('about:guiconfig', 'tab');
    }
  } else {
    if(dialog && !dialog.closed) {
      dialog.focus();
    } else {
      dialog = window.openDialog(GC_PREFERENCES_DIALOG, 'guiconfig-preferences',
          'chrome,titlebar,toolbar,centerscreen');
    }
  }
}

var setup = false;
var browser = {
  load: function(window) {
    if (!setup) {
      addToolbarButton();
      setup = true;
    }
    addMenuItem(window);
  },
  unload: function(window) {
    if (setup) {
      removeToolbarButton();
      setup = false;
    }
    removeUI(window);
  }
};
