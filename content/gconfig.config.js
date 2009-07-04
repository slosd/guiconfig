var guiconfig = {
	
	LocaleGConfig: document.getElementById("gc_locale"),

	Elements: new Object,
	PrefTree: null,
	Options: new Object,
	Wrappers: new Object,
	
	last_query: "",
	stop_option_observation: false,
	created_preferences: false,
	selected_panel: false,
	selected_tab: false,
	
	init: function() {
		dump("This is?+*+_-:.,; just a test. ".replace(/[^\p{L}]/gi, "n"));
		
		this.IconSet = new gcCore.IconSet("tango", { os: gcCore.MozRuntime.OS });
		
		this.Parser = new gcCore.PrefParser("chrome://guiconfig/content/preferences.xml");
		
		this.Elements.tabpanels = document.getElementById("gcConfigContainer");
		this.Elements.tabs = document.getElementById("gcConfigTabs");
		this.Elements.description = document.getElementById("gcConfigDescription");
		this.Elements.window = document.getElementById("gcConfigWindow");
		
		var searchbox = document.getElementById("searchbox");
		if(gcCore.validateVersion(gcCore.MozInfo.version, "3.5a1"))
			searchbox.setProperty("type", "search");
		
		this.setButtons();
		
		this.buildRightClickMenu({
			"reset": function() {
				this.popup.Option.resetPref();
			}
		});
		
		this.created_preferences = this.createPreferences();

		window.setTimeout(function() {
			//guiconfig.Elements.window.centerWindowOnScreen();
		}, 200);
	},

	setButtons: function() {
		if(gcCore.MozPreferences.getBoolPref("browser.preferences.instantApply") == true) {
			this.Elements.window.buttons = "cancel,extra1";
			var button = this.Elements.window.getButton("cancel");
			button.setAttribute("label", this.getLocaleString("close", this.LocaleGConfig));
			button.setAttribute("icon", "close");
		}
		else {
			this.Elements.window.buttons = "accept,cancel,extra1";
			var button = this.Elements.window.getButton("cancel");
			button.setAttribute("label", this.getLocaleString("cancel", this.LocaleGConfig));
			button.setAttribute("icon", "cancel");
		}
	},

	getLocaleString: function(str) {
		try {
			return this.LocaleGConfig.getString(str);
		}
		catch(e) {
			return "";
		}
	},

	resetToDefault: function() {
		if(!gcCore.GCPreferences.getBoolPref("todefault.ask"))
			return this.resetPreferences();
		
		var reset = gcCore.userConfirm("gui:config", this.getLocaleString("confirm-std"), this.getLocaleString("dont-ask"), false);

		if(reset.value) {
			gcCore.GCPreferences.setBoolPref("todefault.ask", !reset.checked);
			return this.resetPreferences();
		}
	},
	
	savePreferences: function() {
		var Option;
		for(var key in this.Options) {
			Option = this.Options[key];
			if(!Option.disabled)
				Option.setPref();
		}
		return true;
	},

	resetPreferences: function() {
		for(var key in this.Options)
			this.Options[key].resetPref();
		return true;
	},

	validatePref: function(child) {
		if(!gcCore.GCPreferences.getBoolPref("matchversion"))
			return true;
		
		var minVersion = child.getAttribute("minVersion"),
			maxVersion = child.getAttribute("maxVersion");
		
		if(!minVersion && !maxVersion)
			return true;
		
		return gcCore.validateVersion(gcCore.MozInfo.version, minVersion, maxVersion);
	},

	createPreferences: function() {
		var parser = this.Parser.instance({
			'filter': this.validatePref
		});
		
		this.Elements.tabs.addEventListener("select", function() {
			return guiconfig.selectPanel(this.selectedIndex);
		}, false);
		
		var pane_index = 0;
		
		parser.registerNode('panel', function(node, container, parse) {
			var paneltab = document.createElement("radio");
			if(pane_index == 0)
				paneltab.setAttribute("selected", true);
			paneltab.setAttribute("pane", pane_index++);
			paneltab.setAttribute("src", this.IconSet.getIcon(node.getAttribute("icon")));
			paneltab.setAttribute("label", node.getAttribute("label"));
			if(node.getAttribute("align") == "right")
				paneltab.setAttribute("class", "gcDoPane");
			var panelbox = document.createElement("vbox");
			panelbox.setAttribute("class", "gcPrefPane");
			node.setUserData("element", paneltab, null);
			container.tabs.appendChild(paneltab);
			container.tabpanels.appendChild(parse(node.childNodes, panelbox));
		}, this);
		
		parser.registerNode('tabs', function(node, container, parse) {
			var tabbox = document.createElement("tabbox");
			tabbox.setAttribute("flex", "1");
			tabbox.tabs = document.createElement("tabs");
			tabbox.panels = document.createElement("tabpanels");
			tabbox.panels.setAttribute("flex", "1");
			tabbox.appendChild(tabbox.tabs);
			tabbox.appendChild(tabbox.panels);
			container.appendChild(tabbox);
			parse(node.childNodes, tabbox);
		});
		
		parser.registerNode('tab', function(node, container, parse) {
			var tab = document.createElement("tab");
			tab.setAttribute("label", node.getAttribute("label"));
			var tabpanel = document.createElement("tabpanel");
			container.tabs.appendChild(tab);
			container.panels.appendChild(tabpanel);
			prefgroup = this.newPrefGroupBox();
			tabpanel.appendChild(prefgroup);
			node.setUserData("element", tab, null);
			parse(node.childNodes, prefgroup);
		}, this);
		
		parser.registerNode('group', function(node, container, parse) {
			var group = document.createElement("groupbox");
			var caption = document.createElement("caption");
			caption.setAttribute("label", node.getAttribute("label"));
			group.appendChild(caption);
			container.appendChild(group);
			prefgroup = this.newPrefGroupBox();
			group.appendChild(prefgroup);
			node.setUserData("element", group, null);
			parse(node.childNodes, prefgroup);
		}, this);
		
		parser.registerNode('separator', function(node, container) {
			var separator = document.createElement("separator");
			container.appendChild(separator);
		});
		
		parser.registerNode('wrapper', function(node, container, parse) {
			// <wrapper> is child of <pref>
			if(container.constructor.toString().indexOf("Option()") != -1) {
				container.Options.wrapper = this.parseChildren(node.childNodes, new Object);
			}
			// <wrapper> is somewhere else in the doc and needs an id as reference
			else {
				wrapper_id = node.getAttribute("id");
				if(!wrapper_id)
					return false;
				this.Wrappers[wrapper_id] = parse(node.childNodes, new Object);
			}
		}, this);
		
		parser.registerNode('type', function(node, container) {
			container.type = node.firstChild.data;
		});
		
		parser.registerNode('script', function(node, container) {
			var name = node.getAttribute("name");
			if(!name)
				return false;
			container[name] = new Function("value", node.firstChild.data);
		});
		
		parser.registerNode('pref', function(node, container, parse) {
			var element,
				option = this.newOption(node);
			if(!option)
				return false;
			this.Options[option.Preference.key] = option;
			parse(node.childNodes, option);
			element = option.build();
			node.setUserData("element", element, null);
			container.appendChild(element);
			option.Preference.onchange();
		}, this);
		
		parser.registerNode('option', function(node, container) {
			if(gcCore.validateVersion(gcCore.MozInfo.version, node.getAttribute("minVersion"), node.getAttribute("maxVersion"))) {
				container.Options.validValues.push({ label: (node.getAttribute("label") || ""), value: node.firstChild.data });
			}
		});
		
		parser.registerNode('bind', function(node, container) {
			node.childNodes.forEach(function(binding) {
				if(binding.nodeName != 'pref')
					return false;
				var option = this.newOption(binding);
				if(!option)
					return false;
				container.Options.bindings.push(option);
			}, this);
		}, this);
		
		parser.registerNode('filter', function(node, container) {
			container.Options.fileFilters.push("filter" + node.firstChild.data);
		});
		
		parser.run(this.Elements);
		return true;
	},
	
	newPrefGroupBox: function() {
		var prefgroup = document.createElement("vbox");
		prefgroup.setAttribute("flex", "1");
		return prefgroup;
	},
	
	newOption: function(pref) {
		var key = pref.getAttribute("key");
		var type = (pref.getAttribute("type") || null);
		var options = {
			label: (pref.getAttribute("label") || ""),
			description: (pref.getAttribute("description") || ""),
			mode: (pref.getAttribute("mode") || "default"),
			defaultValue: pref.getAttribute("default"),
			wrapper: (pref.getAttribute("wrapper") || "default"),
			indent: !!pref.getAttribute("indent"),
			version: pref.getAttribute("version"),
			minVersion: pref.getAttribute("minVersion"),
			maxVersion: pref.getAttribute("maxVersion"),
			validValues: new Array,
			bindings: new Array,
			fileFilters: new Array
		};
		var preference = new Preference(key, type);
		
		var wrapper = guiconfig.Wrappers[options.wrapper];
		if(wrapper && wrapper.type)
			type = wrapper.type;
		else if(options.wrapper.type)
			type = options.wrapper.type;
		else if(preference.type)
			type = preference.type;
		else
			return false;
		
		var OptionClass = window[type + "Option"];
		if(OptionClass)
			return new OptionClass(preference, options);
		else
			return false;
	},
	
	selectPanel: function(index) {
		guiconfig.Elements.tabpanels.selectedIndex = index;
		return true;
	},

	setDescription: function(txt) {
		if(txt == this.Elements.description.firstChild.data)
			return false;
		var t = document.createTextNode(txt);
		this.Elements.description.replaceChild(t, this.Elements.description.firstChild);
		return true;
	},
	
	searchOptions: function(string) {
		var query = new RegExp("(" + string.makeSearchable(".*") + ")", "i");
		
		this.selected_panel = false;
		this.selected_tab = false;
				
		var parser = this.Parser.instance({
			'filter': function(node) {
				//dump(node.getAttribute("label") + ": "+node.nodeName+" - "+node.gcElement + " - "+this.validatePref(node)+"\n");
				return this.validatePref(node);
			}.bind(this)
		});
		parser.registerNode('tabs');
		
		parser.registerNode('panel', function(node, container, parse) {
			var element = node.getUserData("element");
			node.empty = true;
			node.show = false;
			this.selected_tab = false;
			if(string == "" || node.getAttribute("label").makeSearchable().match(query)) {
				node.show = true;
				if(string.indexOf(this.last_query) != 0)
					parse(node.childNodes, node);
				element.style.visibility = "visible";
			}
			else if((parse(node.childNodes, node)).empty) {
				element.style.visibility = "hidden";
				return false;
			}
			else {
				element.style.visibility = "visible";
			}
			if(!this.selected_panel && string != "") {	
				element.radioGroup.selectedItem = element;
				this.selected_panel = true;
			}
		}, this);
		
		parser.registerNode('tab', function(node, container, parse) {
			var element = node.getUserData("element");
			node.empty = true;
			node.show = false;
			if(string == "" || container.show || node.getAttribute("label").makeSearchable().match(query)) {
				container.empty = false;
				node.show = true;
				if(string.indexOf(this.last_query) != 0)
					parse(node.childNodes, node);
				element.style.visibility = "visible";
			}
			else if((parse(node.childNodes, node)).empty) {
				element.style.visibility = "hidden";
				return false;
			}
			else {
				container.empty = false;
				element.style.visibility = "visible";
			}
			if(!this.selected_tab && string != "") {
				element.parentNode.parentNode.selectedTab = element;
				this.selected_tab = true;
			}
		}, this);
		
		parser.registerNode('group', function(node, container, parse) {
			var element = node.getUserData("element").firstChild;
			node.empty = true;
			node.show = false;
			if(string == "" || container.show || node.getAttribute("label").makeSearchable().match(query)) {
				container.empty = false;
				node.show = true;
				if(string.indexOf(this.last_query) != 0)
					parse(node.childNodes, node);
				element.style.display = "-moz-box";
			}
			else if((parse(node.childNodes, node)).empty) {
				element.style.display = "none";
				return false;
			}
			else {
				container.empty = false;
				element.style.display = "-moz-box";
			}
		}, this);
		
		parser.registerNode('pref', function(node, container, parse) {
			var element = node.getUserData("element");
			if(string == "" || container.show || (node.getAttribute("label") + " " + node.getAttribute("description")).makeSearchable().match(query)) {
				container.empty = false;
				element.style.display = "-moz-box";
			}
			else {
				element.style.display = "none";
			}
		});
		
		parser.run();
		this.last_query = string;
	},
	
	buildContextMenu: function(popup, node) {
		var i = 3;
		while(!node.Option && (i--) > 0)
			node = node.parentNode;
		if(node.Option) {
			popup.Option = node.Option;
			return true;
		}
		else
			return false;
	},

	buildRightClickMenu: function(f) {
		var value, menu = document.getElementById("gcoptrightclick"), menuitems = menu.childNodes;
				
		for (var i = 0; i < menuitems.length; i++) {
			value = menuitems[i].getAttribute("value");
			menuitems[i].popup = menu;

			if(f[value])
				menuitems[i].addEventListener("command", f[value], false);

			if(this.IconSet.iconExists(value))
				menuitems[i].style.listStyleImage = "url(" + this.IconSet.getIcon(value) + ")";
		}

		return menu;
	}
}