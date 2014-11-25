var guiconfig = (function(guiconfig) {
  var pref_window = document.getElementById('gcPreferencesDialog');
  var prefpane_current, prefpane_search_results, pref_script;
  var prefpanes_loaded = false;

  var sandbox = Components.utils.Sandbox(window, {
    sandboxPrototype: {
      getPreferenceByKey: function(key) {
        var elem = document.getElementById(key);
        return elem.nodeName == 'preference' ? elem : null;
      },
      registerSelectFileButton: function(key, types) {
        var view = document.getElementById(key + '-view');
        if (!view) return;

        for (var elem of view.querySelectorAll('button.select-file')) {
          elem.addEventListener('command', function() {
            var file = guiconfig.core.selectFile(window, elem.getAttribute('title'), types);
            if (file) {
              document.getElementById(key).value = file.path;
            }
          }, true);
        }
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

  var runScript = function(script) {
    try {
      Components.utils.evalInSandbox(script, sandbox);
    } catch(e) {
      console.log(e);
    }
  };

  var checkDependencies = function(view, dependencies) {
    var disabled = false;
    for (var dependency of dependencies) {
      if (!guiconfig.core.isApplicationVersionBetween(dependency.minVersion, dependency.maxVersion) ||
             dependency.hasOwnProperty('equals') && (document.getElementById(dependency.key) || {}).value !== dependency.equals ||
             dependency.hasOwnProperty('in') && dependency.in.indexOf((document.getElementById(dependency.key) || {}).value) === -1) {
        disabled = true;
        break;
      }
    }
    for (var elem of view.querySelectorAll('label, textbox, menulist, colorpicker, radiogroup, checkbox, button')) {
      elem.disabled = disabled;
    }
  };

  guiconfig.preferences = {
    load: function() {
      guiconfig.core.buildPreferencePanes(document, function(result) {
        var panes = result.querySelectorAll('prefpane');
        for (var pane of panes) {
          pref_window.addPane(pane);
        }
        pref_window.showPane(panes[0]);

        prefpanes_loaded = true;
        if (pref_script) {
          runScript(pref_script);
        }
      });

      guiconfig.core.buildPreferenceScript(document, function(result) {
        pref_script = result.querySelector('script').textContent;
        if (prefpanes_loaded) {
          runScript(pref_script);
        }
      });
    },

    search: function(query) {
      if (query) {
        guiconfig.core.buildPreferenceSearchResult(document, query, function(result) {
          if (!prefpane_search_results) {
            prefpane_search_results = result.firstChild;
            pref_window.addPane(prefpane_search_results);
          } else {
            for (var child of prefpane_search_results.children) {
              prefpane_search_results.removeChild(child);
            }
            for (var child of result.firstChild.children) {
              prefpane_search_results.appendChild(child);
            }
          }
          if (!pref_window.classList.contains('search-active')) {
            prefpane_current = pref_window.currentPane;
            pref_window.classList.add('search-active');
          }
          pref_window.showPane(prefpane_search_results);
        });
      } else {
        if (pref_window.currentPane === prefpane_search_results) {
          pref_window.showPane(prefpane_current);
        }
        pref_window.classList.remove('search-active');
      }
    },

    resetPreference: function(key) {
      var pref = document.getElementById(key);
      if (pref) {
        pref.value = pref.defaultValue;
      }
    },

    setDescription: function(text) {
      pref_window.descriptionText = text;
    },

    showPreference: function(key) {
      var node = document.getElementById(key + '-view');
      while (node) {
        switch (node.nodeName) {
          case 'hbox':
            node.classList.remove('highlight');
            setTimeout((function(node) {
              return function() {
                node.classList.add('highlight');
              }
            })(node), 0);
            break;
          case 'tabpanel':
            node.parentNode.parentNode.selectedIndex = Array.prototype.indexOf.call(node.parentNode.children, node);
            break;
          case 'prefpane':
            pref_window.showPane(node);
            break;
        }
        node = node.parentNode;
      }
    }
  };
  return guiconfig;
})(guiconfig || {});
