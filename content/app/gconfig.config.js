var guiconfig = {
  GCLocale: null,
  XMLPreferences: null,
  IconSet: null,
  Elements: new Object,
  PrefTree: null,
  Options: new Object,
  Wrappers: new Object,
  Observer: new gcCore.Observer(),
  
  lastQuery: "",
  stop_option_observation: false,
  selected_panel: false,
  selected_tab: false,
  
  init: function() {
    this.GCLocale = new gcCore.Locale("gc_locale");
    this.IconSet = new gcCore.IconSet("tango", { os: gcCore.MozRuntime.OS });
    this.XMLPreferences = new gcCore.Parser("chrome://guiconfig/content/preferences.xml");
    this.XMLPreferences.addGlobalFilters({
      "version": function(node){
        if (gcCore.GCPreferences.getBoolPref("matchversion")) {
          var minVersion = node.getAttribute("minVersion"), maxVersion = node.getAttribute("maxVersion");
          if (!minVersion && !maxVersion) {
            return true;
          }
          return gcCore.validateVersion(gcCore.MozInfo.version, minVersion, maxVersion);
        }
        return true;
      }
    });
    this.preparePreferenceParser();
    this.prepareSearchParser();
    this.getDialogElements();
    this.adaptSearchBox();    
    this.setButtons();
    this.buildContextMenu();
    this.createPreferences();
    window.setTimeout(function() {
      guiconfig.Elements.window.centerWindowOnScreen();
    }, 200);
  },
  
  getDialogElements: function() {
    this.Elements.tabpanels = document.getElementById("gcConfigContainer");
    this.Elements.tabs = document.getElementById("gcConfigTabs");
    this.Elements.tabs.addEventListener("select", function() {
      guiconfig.Elements.tabpanels.selectedIndex = this.selectedIndex;
      return true;
    }, false);
    this.Elements.description = document.getElementById("gcConfigDescription");
    this.Elements.window = document.getElementById("gcConfigWindow");
    this.Elements.contextMenu = document.getElementById("gcConfigContextMenu");
  },
  
  adaptSearchBox: function() {
    var searchbox = document.getElementById("searchbox");
    if(gcCore.validateVersion(gcCore.MozInfo.version, "3.5a1"))
      searchbox.setProperty("type", "search");  // change the type to "search" if it is supported by the used FF version (>=3.5a1)
  },

  setButtons: function() {
    if(gcCore.MozPreferences.getBoolPref("browser.preferences.instantApply") == true) {
      this.Elements.window.buttons = "cancel,extra1";
      var button = this.Elements.window.getButton("cancel");
      button.setAttribute("label", this.GCLocale.get("close"));
      button.setAttribute("icon", "close");
    }
    else {
      this.Elements.window.buttons = "accept,cancel,extra1";
      var button = this.Elements.window.getButton("cancel");
      button.setAttribute("label", this.GCLocale.get("cancel"));
      button.setAttribute("icon", "cancel");
    }
  },

  buildContextMenu: function() {
    var popup = this.Elements.contextMenu,
        menuitems = popup.childNodes;
    popup.addEventListener("popupshowing", function() {
      var node = document.popupNode;
      while(node.getAttribute("context") != "gcConfigContextMenu") {
        node = node.parentNode;
      }
      this.currentKey = node.getAttribute("id").replace(/^gcPref/, "");
      return true;
    }, false);
    for(var i = 0, l = menuitems.length, value, f; i < l; i++) {
      value = menuitems[i].getAttribute("value");
      switch(value) {
        case "reset":
          f = function() {
            guiconfig.getPreferenceByKey(this.popup.currentKey).reset();
          }
          break;
        default:
          f = function() {}
          break;
      }
      menuitems[i].popup = popup;
      menuitems[i].addEventListener("command", f, false);
      if(this.IconSet.iconExists(value)) {
        menuitems[i].style.listStyleImage = "url(" + this.IconSet.getIcon(value) + ")";
      }
    }
  },
  
  resetPreferences: function() {
    if(gcCore.GCPreferences.getBoolPref("todefault.ask")) {
      var reset = gcCore.userConfirm("gui:config", this.GCLocale.get("confirm-std"), this.GCLocale.get("dont-ask"), false);
      if (!reset.value) {
        return false;
      }
      else {
        gcCore.GCPreferences.setBoolPref("todefault.ask", !reset.checked);
      }
    }
    for(var key in this.Options) {
      this.Options[key].reset();
    }
    return true;
  },
  
  savePreferences: function() {
    var Option;
    for(var key in this.Options) {
      Option = this.Options[key];
      if(!Option.element.disabled && Option.preference.get() != Option.get()) {
        Option.save();
      }
    }
    return true;
  },
  
  getPreferenceByKey: function(key) {
    return this.Options[key];
  },
  
  assignWrapper: function(target, wrapper) {
    for(var i in wrapper) {
      if(wrapper[i] && typeof wrapper[i] == "object") {
        this.assignWrapper(target[i], wrapper[i]);
      }
      else {
        target[i] = wrapper[i];
      }
    }
  },
  
  setDescription: function(txt) {
    var description = txt || "";
    if(description == this.Elements.description.firstChild.data)
      return false;
    return this.Elements.description.replaceChild(document.createTextNode(description), this.Elements.description.firstChild);
  },
  
  createPreferences: function() {
    var parser = this.preferenceParser;
    parser.parseWithRuleSet("root");
    /* finally, tell all options that all preferences were parsed */
    for(var key in this.Options) {
      this.Options[key].onDialogComplete();
    }
  },
  
  searchOptions: function(string) {
    var parser = this.searchPreferencesParser;
    parser.setVar("selectedPanel", false);
    parser.setVar("selectedTab", false);
    parser.setVar("string", string);
    parser.setVar("query", new RegExp("(" + string.makeSearchable(".*") + ")", "i"));
    dump("search for \""+parser.getVar("string")+"\"\n");
	//dump("search for \""+parser.getVar("string")+"\", \""+parser.getVar("query")+"\"");
    parser.reset();
    parser.parseWithRuleSet("root");
    this.lastQuery = string;
  },
  
  preparePreferenceParser: function() {
    parser = this.XMLPreferences.instance();
    parser.bindObj(this);
    parser.setVar("panelIndex", 0);
    parser.addFilter("version");
    parser.addHandles({
      "panel": {
        "filter": "version",
        "parseNext": "struct",
        "handle": function(node) {
          var tab = document.createElement("radio");
          var panelIndex = this.getVar("panelIndex");
          if (panelIndex == 0) {
            tab.setAttribute("selected", true);
          }
          panelIndex++;
          this.setVar("panelIndex", panelIndex);
          tab.setAttribute("pane", panelIndex);
          tab.setAttribute("src", this.ref.IconSet.getIcon(node.getAttribute("icon")));
          tab.setAttribute("label", node.getAttribute("label"));
          var box = document.createElement("vbox");
          box.setAttribute("class", "gcPrefPane");
          this.ref.Elements.tabs.appendChild(tab);
          this.ref.Elements.tabpanels.appendChild(box);
          node.setUserData("element", tab, null);
          this.parser.parseNext(box);
        }
      },
      "tabs": {
        "filter": "version",
        "parseNext": "tabs",
        "handle": function(node, parentNode) {
          var tabbox = document.createElement("tabbox");
          tabbox.setAttribute("flex", "1");
          var tabs = document.createElement("tabs");
          var tabpanels = document.createElement("tabpanels");
          tabpanels.setAttribute("flex", "1");
          this.setVar("lastCreatedTabs", tabs);
          this.setVar("lastCreatedTabPanels", tabpanels);
          tabbox.appendChild(tabs);
          tabbox.appendChild(tabpanels);
          parentNode.appendChild(tabbox);
          this.parser.parseNext();
        }
      },
      "tab": {
        "filter": "version",
        "parseNext": "struct",
        "handle": function(node){
          var tab = document.createElement("tab");
          tab.setAttribute("label", node.getAttribute("label"));
          var tabpanel = document.createElement("tabpanel");
          var box = document.createElement("vbox");
          box.setAttribute("flex", "1");
          tabpanel.appendChild(box);
          this.getVar("lastCreatedTabs").appendChild(tab);
          this.getVar("lastCreatedTabPanels").appendChild(tabpanel);
          node.setUserData("element", tab, null);
          this.parser.parseNext(box);
        }
      },
      "group": {
        "filter": "version",
        "parseNext": "struct-group",
        "handle": function(node, parentNode) {
          var group = document.createElement("groupbox");
          var caption = document.createElement("caption");
          caption.setAttribute("label", node.getAttribute("label"));
          var box = document.createElement("vbox");
          box.setAttribute("flex", "1");
          group.appendChild(caption);
          group.appendChild(box);
          parentNode.appendChild(group);
          node.setUserData("element", group, null);
          this.parser.parseNext(box);
        }
      },
      "separator": {
        "handle": function(node, parentNode) {
          var separator = document.createElement("separator");
          parentNode.appendChild(separator);
        }
      },
      "pref": {
        "filter": "version",
        "handle": function(node, parentNode) {
          var key = node.getAttribute("key");
          var option = new Option(key, {
            "type": node.getAttribute("type"),
            "defaultValue": node.getAttribute("default"),
            "version": node.getAttribute("version"),
            "minVersion": node.getAttribute("minVersion"),
            "maxVersion": node.getAttribute("maxVersion"),
            "instantApply": gcCore.MozPreferences.getBoolPref("browser.preferences.instantApply"),
            "wrapper": {
              "bindings": new Array(),
              "dependencies": new Array(),
              "scripts": new Object()
            } 
          });
          var element = option.addElement({
            "label": {
              "value": node.getAttribute("label") || "",
              "control": key
            },
            "description": node.getAttribute("description") || "",
            "mode": node.getAttribute("mode") || "default",
            "indent": !!node.getAttribute("indent"),
            "validValues": new Array(),
            "wrapper": {
              "scripts": new Object(),
              "elements": null,
              "fileFilters": new Array()
            }
          });
          /* assign global wrapper */
          var wrapperID = node.getAttribute("wrapper");
          if(is_defined(wrapperID) && is_defined(this.ref.Wrappers[wrapperID])) {
            var wrapper = this.ref.Wrappers[wrapperID];
            this.ref.assignWrapper(option.options.wrapper, wrapper.optionWrapper);
            this.ref.assignWrapper(element.options.wrapper, wrapper.elementWrapper);
          }
          this.setVar("lastCreatedOptionWrapper", option.options.wrapper);
          this.setVar("lastCreatedElementWrapper", element.options.wrapper);
          this.ref.Options[key] = option;  // add the preference to the global Option object
          element.Option = option;  // assign the preference to its element (used for the context menu)
          this.setVar("lastCreatedOption", option);
          this.parser.parseWithRuleSet("pref");
          parentNode.appendChild(element.getElement());  // after parsing the <pref> content we can build the element
          node.setUserData("element", element.elements.row, null);
        }
      },
      "option": {
        "filter": "version",
        "handle": function(node) {
          var option = this.getVar("lastCreatedOption");
          if(node.firstChild.data != "") {
            option.element.options.validValues.push({
              "label": node.getAttribute("label") || "",
              "value": node.firstChild.data
            });
          }
        }
      },
      "wrapper": {
        "handle": function(node) {
          switch(this.rule) {
            case "root":  // global wrapper
              var wrapperID = node.getAttribute("id");
              if(!wrapperID) {
                throw "expectedWrapperID";
              }
              else {
                if(!is_defined(this.ref.Wrappers[wrapperID])) {
                  this.ref.Wrappers[wrapperID] = {
                    "optionWrapper": {
                      "bindings": new Array(),
                      "dependencies": new Array(),
                      "scripts": new Object()
                    },
                    "elementWrapper": {
                      "scripts": new Object(),
                      "elements": null,
                      "fileFilters": new Array()
                    }
                  };
                  this.setVar("lastCreatedOptionWrapper", this.ref.Wrappers[wrapperID].optionWrapper);
                  this.setVar("lastCreatedElementWrapper", this.ref.Wrappers[wrapperID].elementWrapper);
                }
                else {
                  throw "duplicateWrapperID(" + wrapperID + ")";
                }
              }
              break;
          }
          this.parser.parseWithRuleSet("wrapper");
        }
      }
    });
    
    /* wrapper related handles */
    parser.setVar("optionScripts", ["setPref", "getPref", "resetPref", "dependencies"]);
    parser.setVar("elementScripts", ["setValue", "getValue"]);
    parser.addHandles({
      "files": {
        "handle": function(node) {
          if(node.firstChild.data != "") {
            this.getVar("lastCreatedElementWrapper").fileFilters.push("filter" + node.firstChild.data);
          }
        }
      },
      "bindings": {
        "parseNext": "wrapper-pref",
        "handle": function(node){
          var optionWrapper = this.getVar("lastCreatedOptionWrapper");
          this.parser.parseNext(optionWrapper.bindings);
        }
      },
      "dependencies": {
        "parseNext": "wrapper-pref",
        "handle": function(node){
          var optionWrapper = this.getVar("lastCreatedOptionWrapper");
          this.parser.parseNext(optionWrapper.dependencies);
        }
      },
      "pref": {
        "rule": "wrapper-pref",
        "handle": function(node, wrapperProperty) {
          wrapperProperty.push(new Option(node.getAttribute("key"), {
            "type": node.getAttribute("type"),
            "wrapper": {
              "bindings": new Array(),
              "dependencies": new Array(),
              "scripts": new Object()
            } 
          }));
        }
      },
      "script": {
        "handle": function(node) {
          var name = node.getAttribute("name");
          if(this.getVar("optionScripts").indexOf(name) != -1) {
            this.getVar("lastCreatedOptionWrapper").scripts[name] = new Function("value", node.textContent);
          }
          else if(this.getVar("elementScripts").indexOf(name) != -1) {
            this.getVar("lastCreatedElementWrapper").scripts[name] = new Function("value", node.textContent);
          }
        }
      },
      "elements": {
        "parseNext": "elements",
        "handle": function(node) {
          var fragment = document.createDocumentFragment();
          this.parser.parseNext(fragment);
          this.getVar("lastCreatedElementWrapper").elements = node;
          this.getVar("lastCreatedElementWrapper").fragment = fragment;
        }
      },
      "group": {
        "rule": "elements",
        "parseNext": "elements-group"
        /* handle: previously defined */
      },
      "checkbox": {
        "handle": function(node, parentNode) {
    	  var optionElementObj = this.getVar("lastCreatedOption").element;
          var element = new GCElement.Checkbox({
            "label": {
              "value": node.getAttribute("label")
            }
          });
          node.set = function(value) {
            GCBoolElement.set(this.element, value, this.options);
          }.bind({"element": element.getOptionElement(), "options": optionElementObj.options});
          node.get = function() {
            return GCBoolElement.get(this.element, null, this.options);
          }.bind({"element": element.getOptionElement(), "options": optionElementObj.options});
          element.observer.add(function() {
        	this.observer.fire("modified");
          }, optionElementObj);
          node.setUserData("element", element.getOptionElement(), null);
          parentNode.appendChild(element.getElement());
        }
      }
    });
    
    parser.addRuleSet("root", ["panel", "wrapper"]);
    parser.addRuleSet("struct-group", ["separator", "pref"]);
    parser.addRuleSet("struct", ["tabs", "group", "@struct-group"]);
    parser.addRuleSet("tabs", ["tab"]);
    parser.addRuleSet("pref", ["option", "wrapper"]);
    parser.addRuleSet("wrapper", ["bindings", "dependencies", "script", "elements", "files"]);
    parser.addRuleSet("wrapper-pref", ["pref"]);
    parser.addRuleSet("elements-group", ["checkbox"]);
    parser.addRuleSet("elements", ["group", "@elements-group"]);
    this.preferenceParser = parser;
  },
  
  prepareSearchParser: function() {
    var parser = this.XMLPreferences.instance();
    parser.bindObj(this);
    parser.addFilter("version");
    parser.addHandles({
      "@pseudo": {
        "alias": ["tabs", "elements", "wrapper"],
        "filter": "version",
        "handle": function(node, parentNode) {
          this.parser.parseWithRuleSet(node.nodeName, parentNode);
        }
      },
      "panel": {
        "filter": "version",
        "handle": function(node) {
          var element = node.getUserData("element");
          node.empty = true;
          node.show = false;
          parser.setVar("selectedTab", false);
          dump("panel for \""+this.getVar("string")+"\"\n");
          if(this.getVar("string") == "" || node.getAttribute("label").makeSearchable().match(this.getVar("query"))) {
            node.show = true;
            if(this.getVar("string").indexOf(this.ref.lastQuery) != 0) {
              this.parser.parseWithRuleSet("struct", node);
            }
            element.style.visibility = "visible";
          }
          else if(this.parser.parseWithRuleSet("struct", node).empty) {
            element.style.visibility = "hidden";
            return false;
          }
          else {
            element.style.visibility = "visible";
          }
          if(!this.getVar("selectedPanel") && this.getVar("string") != "") {
            element.radioGroup.selectedItem = element;
            this.setVar("selectedPanel", true);
          }
        }
      },
      "tab": {
        "filter": "version",
        "handle": function(node, parentNode) {
          var element = node.getUserData("element");
          node.empty = true;
          node.show = false;
          if(this.getVar("string") == "" || parentNode.show || node.getAttribute("label").makeSearchable().match(this.getVar("query"))) {
            parentNode.empty = false;
            node.show = true;
            if(this.getVar("string").indexOf(this.ref.lastQuery) != 0) {
              this.parser.parseWithRuleSet("struct", node);
            }
            element.disabled = false;
          }
          else if(this.parser.parseWithRuleSet("struct", node).empty) {
            element.disabled = true;
            return false;
          }
          else {
            parentNode.empty = false;
            element.disabled = false;
          }
          if(!this.getVar("selectedTab") && this.getVar("string") != "") {
            element.parentNode.parentNode.selectedTab = element;
            this.setVar("selectedTab", true);
          }
        }
      },
      "group": {
        "filter": "version",
        "parseNext": "struct-group",
        "handle": function(node, parentNode) {
          var element = node.getUserData("element");
          node.empty = true;
          node.show = false;
          if(this.getVar("string") == "" || parentNode.show || node.getAttribute("label").makeSearchable().match(this.getVar("query"))) {
            parentNode.empty = false;
            node.show = true;
            if(this.getVar("string").indexOf(this.ref.lastQuery) != 0) {
              this.parser.parseNext(node);
            }
            element.style.display = "-moz-groupbox";
          }
          else if(this.parser.parseNext(node).empty) {
            element.style.display = "none";
            return false;
          }
          else {
            parentNode.empty = false;
            element.style.display = "-moz-groupbox";
          }
        }
      },
      "pref": {
          "alias": ["checkbox"],
          "filter": "version",
          "handle": function(node, parentNode) {
      	  dump(node.nodeName);
            var element = node.getUserData("element"),
                options = node.getElementsByTagName("option"),
                options_data = "";
            node.empty = true;
            node.show = false;
            for(var i = 0, l = options.length; i < l; i++) {
              options_data += " " + options[i].getAttribute("label");
            }
            if(this.getVar("string") == "" || parentNode.show ||
               (node.getAttribute("label") + " " + node.getAttribute("description") + options_data).makeSearchable().match(this.getVar("query"))) {
              parentNode.empty = false;
              node.show = true;
              if(this.getVar("string").indexOf(this.ref.lastQuery) != 0) {
                this.parser.parseWithRuleSet("pref", node);
              }
              element.style.display = "-moz-box";
            }
            else if(this.parser.parseWithRuleSet("pref", node).empty) {
              element.style.display = "none";
            }
            else {
              parentNode.empty = false;
              element.style.display = "-moz-box";
            }
          }
        }
    });
    parser.addHandles({
      "group": {
    	"rule": "elements",
    	"parseNext": "elements-group"
    	/* handle: previously defined */
      }
    });
    parser.addRuleSet("root", ["panel"]);
    parser.addRuleSet("struct-group", ["tabs", "pref"])
    parser.addRuleSet("struct", ["group", "@struct-group"]);
    parser.addRuleSet("tabs", ["tab"]);
    parser.addRuleSet("pref", ["wrapper"]);
    parser.addRuleSet("wrapper", ["elements"]);
    parser.addRuleSet("elements-group", ["checkbox"]);
    parser.addRuleSet("elements", ["group", "@elements-group"]);
    this.searchPreferencesParser = parser;
  }
}