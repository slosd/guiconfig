var guiconfig = {
	
	LocaleGConfig: document.getElementById("gc_locale"),

	Elements: new Object,
	PrefTree: null,
	Options: new Object,
	Wrappers: new Object,
	
	last_query: "",
	stop_option_observation: false,
	created_preferences: false,
	
	init: function() {
		this.IconSet = new IconSet("tango", { os: gcCore.MozRuntime.OS });
		
		this.Parser = new PrefParser("chrome://guiconfig/content/preferences.xml");
		
		this.Elements.tabpanels = document.getElementById("gcConfigContainer");
		this.Elements.tabs = document.getElementById("gcConfigTabs");
		this.Elements.description = document.getElementById("gcConfigDescription");
		this.Elements.window = document.getElementById("gcConfigWindow");
		
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
		dump(str+"\n");
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
		var Pref;
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
		
		if(!minVersion || !maxVersion)
			return true;
		
		return gcCore.validateVersion(gcCore.MozInfo.version, minVersion, maxVersion);
	},

	createPreferences: function() {
		var parser = this.Parser.instance();
		parser.registerFilter(this.validatePref);
		
		parser.registerNode('panel', function(node, container, parse) {
			var paneltab = document.createElement("radio");
			if(!container.panel_index) {
				container.panel_index = 0;						
				paneltab.setAttribute("selected", true);
			}
			paneltab.setAttribute("pane", container.panel_index++);
			paneltab.setAttribute("src", this.IconSet.getIcon(node.getAttribute("icon")));
			paneltab.setAttribute("label", node.getAttribute("label"));
			if(node.getAttribute("align") == "right")
				paneltab.setAttribute("class", "gcDoPane");
			paneltab.addEventListener("command", this.switchPanel, false);
			var panelbox = document.createElement("vbox");
			panelbox.setAttribute("class", "gcPrefPane");
			node.gcElement = paneltab;
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
			node.gcElement = tab;
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
			node.gcElement = group;
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
			var option = this.newOption(node);
			if(!option)
				return false;
			this.Options[option.Preference.key] = option;
			parse(node.childNodes, option);
			container.appendChild(option.build());
			node.gcElement = option.Elements.prefRow;
			option.Preference.onchange();
		}, this);
		
		parser.registerNode('option', function(node, container) {
			if(gcCore.validateVersion(gcCore.MozInfo.version, __(node.getAttribute("minVersion"), null), __(node.getAttribute("maxVersion"), null))) {
				container.Options.validValues.push({ label: __(node.getAttribute("label"), ""), value: node.firstChild.data });
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
		var type = __(pref.getAttribute("type"), null);
		var options = {
			label: __(pref.getAttribute("label"), ""),
			description: __(pref.getAttribute("description"), ""),
			mode: __(pref.getAttribute("mode"), "default"),
			defaultValue: __(pref.getAttribute("default"), null),
			wrapper: __(pref.getAttribute("wrapper"), "default"),
			indent: !!pref.getAttribute("indent"),
			version: __(pref.getAttribute("version"), null),
			minVersion: __(pref.getAttribute("minVersion"), null),
			maxVersion: __(pref.getAttribute("maxVersion"), null),
			validValues: new Array,
			bindings: new Array,
			fileFilters: new Array
		};
		try {
			var preference = new Preference(key, type);
			return new window[__(__(guiconfig.Wrappers[options.wrapper], {}).type, options.wrapper.type, preference.type) + "Option"](preference, options);
		}
		catch(e) {
			return false;
		}
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
		
		var parser = this.Parser.instance();
		parser.registerFilter(this.validatePref);
		parser.registerNode('tabs');
		parser.registerNode('panel', function(node, container, parse) {
			node.empty = true;
			if(string == "" || node.getAttribute("label").makeSearchable().match(query)) {
				if(string.indexOf(this.last_query) != 0)
					parse(node.childNodes, node);
				node.gcElement.style.opacity = "1";
			}
			else if((parse(node.childNodes, node)).empty) {
				node.gcElement.style.opacity = "0.2";
			}
			else {
				node.gcElement.style.opacity = "1";
			}
		});
		parser.registerNodes(['tab', 'group'], function(node, container, parse) {
			var property = node.nodeName == "tab" ? "visibility" : 'display';
			var visible = node.nodeName == "tab" ? "visible" : '-moz-groupbox';
			var hidden = node.nodeName == "tab" ? "hidden" : 'none';
			node.empty = true;
			if(string == "" || node.getAttribute("label").makeSearchable().match(query)) {
				container.empty = false;
				if(string.indexOf(this.last_query) != 0)
					parse(node.childNodes, node);
				node.gcElement.style[property] = visible;
			}
			else if((parse(node.childNodes, node)).empty) {
				node.gcElement.style[property] = hidden;
			}
			else {
				container.empty = false;
				node.gcElement.style[property] = visible;
			}
		});
		parser.registerNode('pref', function(node, container, parse) {
			if(string == "" || (node.getAttribute("label") + " " + node.getAttribute("description")).makeSearchable().match(query)) {
				container.empty = false;
				node.gcElement.style.display = "-moz-box";
			}
			else {
				node.gcElement.style.display = "none";
			}
		});
		parser.run();
		this.last_query = string;
	},

	switchPanel: function() {
		guiconfig.Elements.tabpanels.selectedIndex = this.getAttribute("pane");
		return true;
	},
	
	buildContextMenu: function(popup, node) {
		var i = 3;
		while(!$defined(node.Option) && (i--) > 0)
			node = node.parentNode;
		if($defined(node.Option)) {
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

			if($defined(f[value]))
				menuitems[i].addEventListener("command", f[value], false);

			if(this.IconSet.iconExists(value))
				menuitems[i].style.listStyleImage = "url(" + this.IconSet.getIcon(value) + ")";
		}

		return menu;
	}
}

var PrefParser = function(preferences) {
	var request = new XMLHttpRequest();
	request.open("GET", preferences, false); 
	request.send(null);
	var XML = request.responseXML;
	var DOC = XML.documentElement;
	
	var Instance = function() {
		var klass = this;
		var Nodes = new Object;
		var Filter = function() { return true; };
		var parse = function(children, container) {
			children.forEach(function(child) {
				var nodeName = child.nodeName;
				if(nodeName == "#text" || !Filter(child))
					return;
				if($defined(Nodes[nodeName])) {
					Nodes[nodeName].fn.call(Nodes[nodeName].thisObj, child, container, parse);
				}
			}, this);
			return container;
		};
		
		this.registerFilter = function(fn) {
			Filter = fn;
		}
		this.registerNode = function(nodeName, fn, thisObj) {
			if(!fn)
				var fn = function(child, container, parse) {
					return parse(child.childNodes, container);
				};
			Nodes[nodeName] = { "fn": fn, "thisObj": thisObj };
		}
		this.registerNodes = function(nodeNames, fn, thisObj) {
			nodeNames.forEach(function(nodeName) {
				this.registerNode(nodeName, fn, thisObj);
			}, klass);
		}
		this.run = function(container) {
			if(!container)
				var container = this.document;
			parse(this.document.childNodes, container);
		}
	}
	
	this.instance = function() {
		var instance = new Instance();
		instance.document = DOC;
		return instance;
	}
}

var IconSet = function(theme, options) {
	this.theme = __(theme, "tango");
	this.Options = __(options, { os: false });
	this.icons = new Object;
	this.getIcons();
}
IconSet.prototype.getIcons = function() {
	var actions_path = "chrome://guiconfig/skin/" + this.theme + "/actions/";
	var tab_icons_path = "chrome://guiconfig/skin/" + this.theme + "/tab_icons/";
	var moz_stock = "moz-icon://stock/";

	switch(this.Options.os) {
		case 'Linux':
				if(gcCore.MozInfo.version.indexOf("3") == 0) {
					this.addIcon("add", moz_stock + "gtk-add?size=button");
					this.addIcon("color", moz_stock + "gtk-color-picker?size=button");
					this.addIcon("reset", moz_stock + "gtk-undo?size=menu");
				}
			break;

		case 'WINNT': break;
	}
	this.addIcon("add", actions_path + "add.png");
	this.addIcon("color", actions_path + "color.png");
	this.addIcon("reset", actions_path + "reset.png");
	this.addIcon("tab_accessibility", tab_icons_path + "accessibility.png");
	this.addIcon("tab_bookmarks", tab_icons_path + "bookmarks.png");
	this.addIcon("tab_browser", tab_icons_path + "browser.png");
	this.addIcon("tab_developing", tab_icons_path + "developing.png");
	this.addIcon("tab_downloads", tab_icons_path + "downloads.png");
	this.addIcon("tab_network", tab_icons_path + "network.png");
	this.addIcon("tab_style", tab_icons_path + "style.png");
}
IconSet.prototype.addIcon = function(name, path) {
	if(!$defined(this.icons[name]))
		this.icons[name] = path;
}
IconSet.prototype.getIcon = function(name) {
	return __(this.icons[name], null);
}
IconSet.prototype.iconExists = function(name) {
	return $defined(this.icons[name]);
}

XULElement.prototype.setProperty = function(name, value) {
	if(this.hasAttribute(name))
		this[name] = value;
	else
		this.setAttribute(name, value);
}

NodeList.prototype.forEach = Array.prototype.forEach;

String.prototype.makeSearchable = function(join_string) {
	if(!join_string)
		var join_string = " ";
	return this.trim().toLowerCase().replace(/[0-9\"\'\«\»\(\)\<\>\-\_\,\.\;\:]/gi, "").replace(/\s\s+/, " ").split(" ").sort().join(join_string);
}