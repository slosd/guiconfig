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
		if(!gcCore.GCPreferences.getBoolPref("matchversion") || child.nodeName == "#text")
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
			var innergroup = document.createElement("vbox");
			innergroup.setAttribute("flex", "1");
			tabpanel.appendChild(innergroup);
			node.setUserData("element", tab, null);
			parse(node.childNodes, innergroup);
		}, this);
		
		parser.registerNode('group', function(node, container, parse) {
			var group = new GCElement('group', {
				'label': {
					'value': node.getAttribute("label")
				}
			}).inject(container);
			node.setUserData("element", group.element, null);
			parse(node.childNodes, group.element.lastChild);
		}, this);
		
		parser.registerNode('separator', function(node, container) {
			var separator = document.createElement("separator");
			container.appendChild(separator);
		});
		
		parser.registerNode('wrapper', function(node, container, parse) {
			// <wrapper> is child of <pref>
			if(container.constructor.toString().indexOf("Option.call(") != -1) {
				container.Wrapper = parse(node.childNodes, new Object);
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
			container[name] = new Function("value", node.textContent);
		});
		
		parser.registerNode('elements', function(node, container, parse) {
			container['elements'] = node;
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
		
		parser.registerNode('bind', function(node, container, parse) {
			parse(node.childNodes, container,
				function(node, container) {
					if(node.nodeName != 'pref')
						return false;
					var option = this.newOption(node);
					if(!option)
						return false;
					container.Options.bindings.push(option);
				}.bind(this)
			);
		}, this);
		
		parser.registerNode('filter', function(node, container) {
			container.Options.fileFilters.push("filter" + node.firstChild.data);
		});
		
		parser.run(this.Elements);
		return true;
	},
	
	newOption: function(node) {
		var key = node.getAttribute("key");
		var type = (node.getAttribute("type") || null);
		var options = {
			label: (node.getAttribute("label") || ""),
			description: (node.getAttribute("description") || ""),
			mode: (node.getAttribute("mode") || "default"),
			defaultValue: node.getAttribute("default"),
			wrapper: (node.getAttribute("wrapper") || "default"),
			indent: !!node.getAttribute("indent"),
			version: node.getAttribute("version"),
			minVersion: node.getAttribute("minVersion"),
			maxVersion: node.getAttribute("maxVersion"),
			validValues: new Array,
			bindings: new Array,
			fileFilters: new Array,
			build: true
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
		if(!txt || txt == this.Elements.description.firstChild.data)
			return false;
		return this.Elements.description.replaceChild(document.createTextNode(txt), this.Elements.description.firstChild);
	},
	
	searchOptions: function(string) {
		var query = new RegExp("(" + string.makeSearchable(".*") + ")", "i");
		
		this.selected_panel = false;
		this.selected_tab = false;
				
		var parser = this.Parser.instance({
			'filter': this.validatePref
		});
		parser.registerNodes(['tabs', 'elements', 'wrapper']);
		
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
				element.style.display = "-moz-groupbox";
			}
			else if((parse(node.childNodes, node)).empty) {
				element.style.display = "none";
				return false;
			}
			else {
				container.empty = false;
				element.style.display = "-moz-groupbox";
			}
		}, this);
		
		parser.registerNodes(['pref', 'checkbox'], function(node, container, parse) {
			var element = node.getUserData("element");
			node.empty = true;
			node.show = false;
			if(string == "" || container.show || (node.getAttribute("label") + " " + node.getAttribute("description")).makeSearchable().match(query)) {
				container.empty = false;
				node.show = true;
				if(string.indexOf(this.last_query) != 0)
					parse(node.childNodes, node);
				element.style.display = "-moz-box";
			}
			else if((parse(node.childNodes, node)).empty) {
				element.style.display = "none";
			}
			else {
				container.empty = false;
				element.style.display = "-moz-box";
			}
		}, this);
		
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