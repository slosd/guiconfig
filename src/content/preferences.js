var guiconfig = (function(guiconfig) {
  if (guiconfig.preferences)
    return guiconfig;

  var locale = document.getElementById('gcLocale');
  var pref_window = document.getElementById('gcPreferencesDialog');
  var prefpane_current;
  var prefpane_search_results;

  var sandbox = Components.utils.Sandbox(window, {
    sandboxPrototype: { 'guiconfig': guiconfig }
  });

  var query_is_match = function(query, text) {
    return text.indexOf(query) !== -1;
  };

  guiconfig.preferences = {
    load: function() {
      var panesResult = guiconfig.core.buildPreferencePanes(document);
      var panes = panesResult.querySelectorAll('prefpane');
      for (var pane of panes) {
        pref_window.addPane(pane);
      }

      var scriptResult = guiconfig.core.buildPreferenceScript(document);
      var script = scriptResult.querySelector('script');
      try {
        Components.utils.evalInSandbox(script.textContent, sandbox);
      } catch(e) {
        console.log(e);
      }

      pref_window.showPane(panes[0]);
    },

    search: function(query) {
      if (query) {
        var fragment = guiconfig.core.buildPreferenceSearchResult(document, query);
        if (!prefpane_search_results) {
          prefpane_search_results = fragment.firstChild;
          pref_window.addPane(prefpane_search_results);
        } else {
          for (var child of prefpane_search_results.children) {
            prefpane_search_results.removeChild(child);
          }
          for (var child of fragment.firstChild.children) {
            prefpane_search_results.appendChild(child);
          }
        }
        if (!pref_window.classList.contains('search-active')) {
          prefpane_current = pref_window.currentPane;
          pref_window.classList.add('search-active');
        }
        pref_window.showPane(prefpane_search_results);
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
            if (node.classList.contains('highlight')) {
              node.classList.remove('highlight');
            }
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

    checkDependencies: function(view, dependencies) {
      var disabled = false;
      for (var dependency of dependencies) {
        if (!guiconfig.core.isApplicationVersionBetween(dependency.minVersion, dependency.maxVersion) ||
               dependency.equals && (document.getElementById(dependency.key) || {}).value !== dependency.equals ||
               dependency.in && dependency.in.indexOf((document.getElementById(dependency.key) || {}).value) === -1) {
          disabled = true;
          break;
        }
      }
      for (var elem of view.querySelectorAll('label, textbox, menulist, colorpicker, radiogroup, checkbox, button')) {
        elem.disabled = disabled;
      }
    },

    registerDependencies: function(prefKey, dependencies) {
      var view = document.getElementById(prefKey + '-view');
      if (!view) return;

      for (var dependency of dependencies) {
        var pref = document.getElementById(dependency.key);
        if (pref) {
          pref.addEventListener('change', function() {
            guiconfig.preferences.checkDependencies(view, dependencies);
          });
        }
      }
      this.checkDependencies(view, dependencies);
    },

    selectFile: function(prefKey, title, filterTypes) {
      var file = guiconfig.core.selectFile(window, title, filterTypes);
      if (file) {
        document.getElementById(prefKey).value = file.path;
      }
    },

    registerSelectFileButton: function(key, types) {
      var view = document.getElementById(key + '-view');
      if (!view) return;

      for (var elem of view.querySelectorAll('button.select-file')) {
        elem.addEventListener('command', function() {
          guiconfig.preferences.selectFile(key, elem.getAttribute('title'), types);
        }, true);
      }
    }
  };
  return guiconfig;
})(guiconfig || {});
