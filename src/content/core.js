var guiconfig = (function(guiconfig) {
  var Cc = Components.classes;
  var Ci = Components.interfaces;

  var runtimeInfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime);
  var applicationInfo = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULAppInfo);
  var versionComparator = Cc['@mozilla.org/xpcom/version-comparator;1'].getService(Ci.nsIVersionComparator);

  var isPreferenceSupported = function(node) {
    var minVersion = node.getAttribute('data-minVersion');
    var maxVersion = node.getAttribute('data-maxVersion');
    var platform = node.getAttribute('data-platform');
    return guiconfig.core.isApplicationVersionBetween(minVersion, maxVersion) &&
        guiconfig.core.isApplicationPlatform(platform);
  };

  var preferencesNodeFilter = function(node) {
    return isPreferenceSupported(node);
  };

  var transformXML = function(xml, xsl, doc, params) {
    var xsltProcessor = Cc["@mozilla.org/document-transformer;1?type=xslt"].createInstance(Ci.nsIXSLTProcessor);
    for (var name in params) {
      xsltProcessor.setParameter(null, name, params[name]);
    }
    xsltProcessor.importStylesheet(xsl);
    return xsltProcessor.transformToFragment(xml, doc);
  };

  var applyXSLT = function(xsl_uri, xml_uri, doc, onTransformed, params) {
    var xsl, xml, uiDoc;

    var requestXsl = new XMLHttpRequest();
    requestXsl.onload = function() {
      xsl = requestXsl.responseXML;
      if (xml)
        onTransformed(transformXML(xml, xsl, doc, params));
    };
    requestXsl.open('GET', xsl_uri);
    requestXsl.send(null);

    var requestXml = new XMLHttpRequest();
    requestXml.onload = function() {
      xml = requestXml.responseXML;
      if (xsl)
        onTransformed(transformXML(xml, xsl, doc, params));
    };
    requestXml.open('GET', xml_uri);
    requestXml.send(null);
  };

  var cloneXUL = function(dom, document, target) {
    for(var i = 0, il = dom.childNodes.length; i < il; i++) {
      var targetItem;
      var child = dom.childNodes[i];

      if (child.nodeType === Node.ELEMENT_NODE && preferencesNodeFilter(child)) {
        targetItem = document.createElement(child.nodeName);
        for (var j = 0, jl = child.attributes.length; j < jl; j++) {
          targetItem.setAttribute(child.attributes[j].name, child.attributes[j].value);
        }
        cloneXUL(child, document, targetItem);
        target.appendChild(targetItem);
      }
    }
    return target;
  };

  guiconfig.core = {
    isApplicationVersionBetween: function(minVersion, maxVersion) {
      return !(minVersion && versionComparator.compare(applicationInfo.version, minVersion) == -1 ||
               maxVersion && versionComparator.compare(applicationInfo.version, maxVersion) == 1);
    },

    isApplicationPlatform: function(platform) {
      return !platform || runtimeInfo.OS === platform;
    },

    buildPreferencePanes: function(document, onFinished) {
      applyXSLT(
          'chrome://guiconfig/content/generators/preferences-dialog.xsl',
          'chrome://guiconfig/content/preferences.xml', document,
          function(result) {
            onFinished(cloneXUL(result, document, document.createDocumentFragment()));
          });
    },

    buildPreferenceScript: function(document, onFinished) {
      applyXSLT(
          'chrome://guiconfig/content/generators/preferences-script.xsl',
          'chrome://guiconfig/content/preferences.xml', document, onFinished);
    },

    buildPreferenceSearchResult: function(document, query, onFinished) {
      applyXSLT(
          'chrome://guiconfig/content/generators/preferences-search.xsl',
          'chrome://guiconfig/content/preferences.xml', document,
          function(result) {
            onFinished(cloneXUL(result, document, document.createDocumentFragment()));
          },
          { 'query': query });
    },

    selectFile: function(window, title, filterTypes) {
      var filePicker = Cc["@mozilla.org/filepicker;1"].createInstance(Ci.nsIFilePicker);
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
