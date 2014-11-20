var guiconfig = (function(guiconfig) {
  var Cc = Components.classes;
  var Ci = Components.interfaces;

  // var locale = this.getChromeRegistryService().getSelectedLocale('global')

  var preferenceIsSupported = function(node) {
    var minVersion = node.getAttribute('data-minVersion');
    var maxVersion = node.getAttribute('data-maxVersion');
    var platform = node.getAttribute('data-platform');
    return guiconfig.core.isApplicationVersionBetween(minVersion, maxVersion) &&
        guiconfig.core.isApplicationPlatform(platform);
  };

  var preferencesNodeFilter = function(node) {
    return preferenceIsSupported(node);
  };

  guiconfig.core = {
    getDirectoryService: function() {
      return Cc["@mozilla.org/file/directory_service;1"].getService(Ci.nsIProperties);
    },

    getPrefService: function() {
      return Cc["@mozilla.org/preferences-service;1"].getService(Ci.nsIPrefService);
    },

    getChromeRegistryService: function() {
      return Cc["@mozilla.org/chrome/chrome-registry;1"].getService(Ci.nsIXULChromeRegistry);
    },

    createFilePicker: function() {
      return Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
    },

    isApplicationVersionBetween: function(minVersion, maxVersion) {
      var applicationInfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
      var versionComparator = Cc['@mozilla.org/xpcom/version-comparator;1'].getService(Ci.nsIVersionComparator);

      return !(minVersion && versionComparator.compare(applicationInfo.version, minVersion) == -1 ||
               maxVersion && versionComparator.compare(applicationInfo.version, maxVersion) == 1);
    },

    isApplicationPlatform: function(platform) {
      var runtimeInfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime);
      return !platform || runtimeInfo.OS === platform;
    },

    getProfileFile: function(filename) {
      var DIRECTORY_TYPE = Ci.nsIFile.DIRECTORY_TYPE;
      var FILE_TYPE = Ci.nsIFile.FILE_TYPE;

      var dir = this.getDirectoryService().get("ProfD", Ci.nsIFile);
      dir.append('guiconfig');
      if (!dir.exists()) {
        dir.create(DIRECTORY_TYPE, 0700);
      } else if (!dir.isDirectory()) {
        dir.remove(false);
        dir.create(DIRECTORY_TYPE, 0700);
      }
      dir.append(filename);
      if (!dir.exists()) {
        dir.create(FILE_TYPE, 0600);
      } else if (!dir.isFile()) {
        dir.remove(true);
        dir.create(FILE_TYPE, 0600);
      }
      return dir;
    },

    getExtensionPreferences: function() {
      return this.getPrefService().getBranch('extensions.guiconfig.');
    },

    applyXSLT: function(xsl_uri, xml_uri, doc, params) {
      var request, xsl, xml, uiDoc;
      var xsltProcessor = Cc["@mozilla.org/document-transformer;1?type=xslt"].createInstance(Ci.nsIXSLTProcessor);

      request = new XMLHttpRequest();
      request.open('GET', xsl_uri, false);
      request.send(null);
      xsl = request.responseXML;

      request = new XMLHttpRequest();
      request.open('GET', xml_uri, false);
      request.send(null);
      xml = request.responseXML;

      for (var name in params) {
        xsltProcessor.setParameter(null, name, params[name]);
      }

      xsltProcessor.importStylesheet(xsl);
      return xsltProcessor.transformToFragment(xml, doc);
    },

    buildPreferencePanes: function(document) {
      var xsltResult = this.applyXSLT(
          'chrome://guiconfig/content/generators/preferences-dialog.xsl',
          'chrome://guiconfig/content/preferences.xml', document);
      return this.cloneXUL(xsltResult, document, document.createDocumentFragment());
    },

    buildPreferenceScript: function(document) {
      var xsltResult = this.applyXSLT(
          'chrome://guiconfig/content/generators/preferences-script.xsl',
          'chrome://guiconfig/content/preferences.xml', document);
      return xsltResult;
    },

    buildPreferenceSearchResult: function(document, query, target) {
      var xsltResult = this.applyXSLT(
          'chrome://guiconfig/content/generators/preferences-search.xsl',
          'chrome://guiconfig/content/preferences.xml', document,
          { 'query': query });
      return this.cloneXUL(xsltResult, document, target || document.createDocumentFragment());
    },

    cloneXUL: function(dom, document, target) {
      for(var i = 0, il = dom.childNodes.length; i < il; i++) {
        var targetItem;
        var child = dom.childNodes[i];

        if (child.nodeType === Node.ELEMENT_NODE && preferencesNodeFilter(child)) {
          targetItem = document.createElement(child.nodeName);
          for (var j = 0, jl = child.attributes.length; j < jl; j++) {
            targetItem.setAttribute(child.attributes[j].name, child.attributes[j].value);
          }
          this.cloneXUL(child, document, targetItem);
          target.appendChild(targetItem);
        }
      }
      return target;
    },

    selectFile: function(window, title, filterTypes) {
      var filePicker = this.createFilePicker();
      filePicker.init(window, title, Ci.nsIFilePicker.modeOpen);
      for(var i = 0, l = filterTypes.length; i < l; i++) {
        if(Ci.nsIFilePicker[filterTypes[i]]) {
          filePicker.appendFilters(Ci.nsIFilePicker[filterTypes[i]]);
        }
      }
      var status = filePicker.show();
      if (status === Ci.nsIFilePicker.returnOK) {
        return filePicker.file;
      }
    }
  };

  return guiconfig;
})(guiconfig || {});
