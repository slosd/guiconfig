var EXPORTED_SYMBOLS = [ 'guiconfig' ];

var Cc = Components.classes;
var Ci = Components.interfaces;

var RuntimeInfo = Cc['@mozilla.org/xre/app-info;1'].getService(Ci.nsIXULRuntime);
var ApplicationInfo = Cc['@mozilla.org/xre/app-info;1'].getService(Ci.nsIXULAppInfo);
var VersionComparator = Cc['@mozilla.org/xpcom/version-comparator;1'].getService(Ci.nsIVersionComparator);
var XMLHttpRequest = Components.Constructor('@mozilla.org/xmlextras/xmlhttprequest;1', 'nsIXMLHttpRequest');

const GC_DIALOG_XSLT = 'chrome://guiconfig/content/generators/preferences-dialog.xsl';
const GC_SCRIPT_XSLT = 'chrome://guiconfig/content/generators/preferences-script.xsl';
var GC_PAGE_XSLT, GC_SEARCH_XSLT;
if (VersionComparator.compare(ApplicationInfo.version, "45.0a1") >= 0) {
  GC_PAGE_XSLT = 'chrome://guiconfig/content/generators/preferences-page-bug1249572.xsl';
  GC_SEARCH_XSLT = 'chrome://guiconfig/content/generators/preferences-search-bug1249572.xsl';
} else {
  GC_PAGE_XSLT = 'chrome://guiconfig/content/generators/preferences-page.xsl';
  GC_SEARCH_XSLT = 'chrome://guiconfig/content/generators/preferences-search.xsl';
}

function isApplicationVersionBetween(minVersion, maxVersion) {
  return !(minVersion && VersionComparator.compare(ApplicationInfo.version, minVersion) == -1 ||
         maxVersion && VersionComparator.compare(ApplicationInfo.version, maxVersion) == 1);
}

function isApplicationPlatform(platform) {
  return !platform || RuntimeInfo.OS === platform;
}

function isPreferenceSupported(node) {
  var minVersion = node.getAttribute('data-minVersion');
  var maxVersion = node.getAttribute('data-maxVersion');
  var platform = node.getAttribute('data-platform');
  return isApplicationVersionBetween(minVersion, maxVersion) && isApplicationPlatform(platform);
}

function preferencesNodeFilter(node) {
  return isPreferenceSupported(node);
}

function transformXML(xml, xsl, doc, params) {
  var xsltProcessor = Cc['@mozilla.org/document-transformer;1?type=xslt'].createInstance(Ci.nsIXSLTProcessor);
  for (var name in params) {
    xsltProcessor.setParameter(null, name, params[name]);
  }
  xsltProcessor.importStylesheet(xsl);
  return xsltProcessor.transformToFragment(xml, doc);
}

function applyXSLT(xsl_uri, xml_uri, doc, onTransformed, params) {
  var xsl, xml, uiDoc;

  var requestXsl = new XMLHttpRequest();
  requestXsl.onload = function() {
    xsl = requestXsl.responseXML;
    if (xml) {
      onTransformed(transformXML(xml, xsl, doc, params));
    }
  };
  requestXsl.open('GET', xsl_uri, false);
  requestXsl.send(null);

  var requestXml = new XMLHttpRequest();
  requestXml.onload = function() {
    xml = requestXml.responseXML;
    if (xsl) {
      onTransformed(transformXML(xml, xsl, doc, params));
    }
  };
  requestXml.open('GET', xml_uri, false);
  requestXml.send(null);
}

function cloneXUL(dom, document, target) {
  var Node = document.defaultView.Node;
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
    } else if (child.nodeType === Node.TEXT_NODE && child.nodeValue.match(/\S/)) {
      target.appendChild(document.createTextNode(child.nodeValue));
    }
  }
  return target;
}

function runScriptSandboxed(document, script) {
  function checkDependencies(view, dependencies) {
    var disabled = false;
    for (var dependency of dependencies) {
      if (!isApplicationVersionBetween(dependency.minVersion, dependency.maxVersion) ||
             dependency.hasOwnProperty('equals') && (document.getElementById(dependency.key) || {}).value !== dependency.equals ||
             dependency.hasOwnProperty('in') && dependency.in.indexOf((document.getElementById(dependency.key) || {}).value) === -1) {
        disabled = true;
        break;
      }
    }
    for (var elem of view.querySelectorAll('label, textbox, menulist, colorpicker, radiogroup, checkbox, button, box.filepicker')) {
      elem.disabled = disabled;
    }
  }

  var sandbox = Components.utils.Sandbox(document.defaultView, {
    sandboxPrototype: {
      getPreferenceByKey: function(key) {
        var elem = document.getElementById(key);
        return elem && elem.nodeName == 'preference' ? elem : null;
      },
      isPreferenceSupported: function(minVersion, maxVersion, platform) {
        return isApplicationVersionBetween(minVersion, maxVersion) && isApplicationPlatform(platform);
      },
      registerBehavior: function(prefKey, behavior) {
        var pref = document.getElementById(prefKey);
        if (!pref) return;
        var view = document.getElementById(prefKey + '-view');
        if (!view) return;

        if (typeof behavior.setValue === 'function') {
          pref.addEventListener('change', function() {
            behavior.setValue(view, pref.value);
          });
          behavior.setValue(view, pref.value);
        }

        if (typeof behavior.getValue === 'function') {
          view.addEventListener('command', function() {
            var value = behavior.getValue(view);
            if (pref.value !== value) {
              pref.value = value;
            }
          });
        }
      },
      registerDependencies: function(prefKey, dependencies) {
        var view = document.getElementById(prefKey + '-view');
        if (!view) return;

        for (var dependency of dependencies) {
          var pref = document.getElementById(dependency.key);
          if (pref) {
            pref.addEventListener('change', function() {
              checkDependencies(view, dependencies);
            });
          }
        }
        checkDependencies(view, dependencies);
      }
    }
  });

  try {
    Components.utils.evalInSandbox(script, sandbox);
  } catch(e) {
    Components.utils.reportError(e);
  }
}

var guiconfig = {
  buildDialog: function(document, preference_source, onFinished) {
    var prefPanes, prefScript;
    applyXSLT(GC_DIALOG_XSLT, preference_source, document,
        function(result) {
          var copy = cloneXUL(result, document, document.createDocumentFragment());
          prefPanes = copy.querySelectorAll('prefpane');
          if (prefScript) {
            onFinished(prefPanes, prefScript);
          }
        });
    applyXSLT(GC_SCRIPT_XSLT, preference_source, document,
        function(result) {
          prefScript = result.querySelector('script').textContent;
          if (prefPanes) {
            onFinished(prefPanes, prefScript);
          }
        });
  },

  buildPage: function(document, preference_source, onFinished) {
    var prefPage, prefScript;
    applyXSLT(GC_PAGE_XSLT, preference_source, document,
        function(result) {
          prefPage = cloneXUL(result, document, document.createDocumentFragment());
          if (prefScript) {
            onFinished(prefPage, prefScript);
          }
        });
    applyXSLT(GC_SCRIPT_XSLT, preference_source, document,
        function(result) {
          prefScript = result.querySelector('script').textContent;
          if (prefPage) {
            onFinished(prefPage, prefScript);
          }
        });
  },

  buildPreferenceSearchResult: function(document, preference_source, query, onFinished) {
    applyXSLT(GC_SEARCH_XSLT, preference_source, document,
        function(result) {
          onFinished(cloneXUL(result, document, document.createDocumentFragment()));
        }, { 'query': query });
  },

  runPreferenceScript: function(document, script) {
    runScriptSandboxed(document, script);
  }
};
