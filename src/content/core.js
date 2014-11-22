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

  var transform = function(xml, xsl, doc, params) {
    var xsltProcessor = Cc["@mozilla.org/document-transformer;1?type=xslt"].createInstance(Ci.nsIXSLTProcessor);
    for (var name in params) {
      xsltProcessor.setParameter(null, name, params[name]);
    }
    xsltProcessor.importStylesheet(xsl);
    return xsltProcessor.transformToFragment(xml, doc);
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

    applyXSLT: function(xsl_uri, xml_uri, doc, onTransformed, params) {
      var xsl, xml, uiDoc;

      var requestXsl = new XMLHttpRequest();
      requestXsl.onload = function() {
        xsl = requestXsl.responseXML;
        if (xml)
          onTransformed(transform(xml, xsl, doc, params));
      };
      requestXsl.open('GET', xsl_uri);
      requestXsl.send(null);

      var requestXml = new XMLHttpRequest();
      requestXml.onload = function() {
        xml = requestXml.responseXML;
        if (xsl)
          onTransformed(transform(xml, xsl, doc, params));
      };
      requestXml.open('GET', xml_uri);
      requestXml.send(null);
    },

    buildPreferencePanes: function(document, onFinished) {
      this.applyXSLT(
          'chrome://guiconfig/content/generators/preferences-dialog.xsl',
          'chrome://guiconfig/content/preferences.xml', document,
          function(result) {
            onFinished(guiconfig.core.cloneXUL(result, document, document.createDocumentFragment()));
          });
    },

    buildPreferenceScript: function(document, onFinished) {
      this.applyXSLT(
          'chrome://guiconfig/content/generators/preferences-script.xsl',
          'chrome://guiconfig/content/preferences.xml', document, onFinished);
    },

    buildPreferenceSearchResult: function(document, query, onFinished) {
      this.applyXSLT(
          'chrome://guiconfig/content/generators/preferences-search.xsl',
          'chrome://guiconfig/content/preferences.xml', document,
          function(result) {
            onFinished(guiconfig.core.cloneXUL(result, document, document.createDocumentFragment()));
          },
          { 'query': query });
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
