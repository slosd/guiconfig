var guiconfig = {
	
	LocaleGConfig: document.getElementById("gc_locale"),

	Elements: new Object,
	PrefTree: null,
	Options: new Object,
	Wrappers: new Object,
	
	stop_option_observation: false,
	created_preferences: false,
	
	init: function() {
		this.IconSet = new IconSet("tango", { os: gcCore.MozRuntime.OS });
		
		var request = new XMLHttpRequest();
		request.open("GET", "chrome://guiconfig/content/preferences.xml", false); 
		request.send(null);
		this.PrefTree = request.responseXML.documentElement;
		
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
		
		return gcCore.validateVersion(gcCore.MozInfo.version, minVersion, maxVersion);
	},

	createPreferences: function() {
		this.parseChildren(this.PrefTree.childNodes, this.Elements);
		return true;
	},

	parseChildren: function(children, container) {
		var wrapper_id, wrapper,
			paneltab, panelbox,
			tabbox, tab, tabpanel,
			group, caption,
			prefgroup,
			separator,
			preference;

		for (var i = 0, l = children.length; i < l; i++) {
			
			var child = children[i];
			
			if(child.nodeName == "#text" || !this.validatePref(child))
				continue;
			
			switch(child.nodeName) {
				case 'panel':
					paneltab = document.createElement("radio");
					if(!container.panel_index) {
						container.panel_index = 0;						
						paneltab.setAttribute("selected", true);
					}
					paneltab.setAttribute("pane", container.panel_index++);
					paneltab.setAttribute("src", this.IconSet.getIcon(child.getAttribute("icon")));
					paneltab.setAttribute("label", child.getAttribute("label"));
					paneltab.addEventListener("command", this.switchPanel, false);
					panelbox = document.createElement("vbox");
					panelbox.setAttribute("class", "gcPrefPane");		
					container.tabs.appendChild(paneltab);
					container.tabpanels.appendChild(this.parseChildren(child.childNodes, panelbox));
					break;
				
				case 'tabs':
					tabbox = document.createElement("tabbox");
					tabbox.setAttribute("flex", "1");
					tabbox.tabs = document.createElement("tabs");
					tabbox.panels = document.createElement("tabpanels");
					tabbox.panels.setAttribute("flex", "1");
					tabbox.appendChild(tabbox.tabs);
					tabbox.appendChild(tabbox.panels);
					container.appendChild(tabbox);
					this.parseChildren(child.childNodes, tabbox);
					break;
				
				case 'tab':
					tab = document.createElement("tab");
					tab.setAttribute("label", child.getAttribute("label"));
					tabpanel = document.createElement("tabpanel");
					container.tabs.appendChild(tab);
					container.panels.appendChild(tabpanel);
					prefgroup = this.newPrefGroupBox();
					tabpanel.appendChild(prefgroup);
					this.parseChildren(child.childNodes, prefgroup);
					break;
				
				case 'group':
					group = document.createElement("groupbox");
					caption = document.createElement("caption");
					caption.setAttribute("label", child.getAttribute("label"));
					group.appendChild(caption);
					container.appendChild(group);
					prefgroup = this.newPrefGroupBox();
					group.appendChild(prefgroup);
					this.parseChildren(child.childNodes, prefgroup);
					break;
				
				case 'separator':
					separator = document.createElement("separator");
					container.appendChild(separator);
					break;
				
				case 'wrapper':
					wrapper_id = child.getAttribute("id");
					if(!wrapper_id)
						break;
					wrapper = this.parseChildren(child.childNodes, new Object);
					this.Wrappers[wrapper_id] = wrapper;
					break;
				
				case 'type':
					container.type = child.firstChild.data;
					break;
				
				case 'script':
					var name = child.getAttribute("name");
					if(!name)
						break;
					container[name] = new Function("value", child.firstChild.data);
					break;
				
				case 'pref':
					option = this.newOption(child);
					if(!option)
						break;
					this.Options[option.Preference.key] = option;
					container.appendChild(option.build());
					option.Preference.onchange();
					break;
			}
		}
			
		return container;
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
		for(var children = pref.childNodes, i = 0, l = children.length, data, child; i < l; i++) {
			child = children[i];
			switch(child.nodeName) {
				case 'option':
					if(gcCore.validateVersion(gcCore.MozInfo.version, __(child.getAttribute("minVersion"), null), __(child.getAttribute("maxVersion"), null))) {
						options.validValues.push({ label: __(child.getAttribute("label"), ""), value: child.firstChild.data });
					}
					break;
				
				case 'bind':
					for(var bindings = child.childNodes, e = 0, bl = bindings.length, binding, preference; e < bl; e++) {
						binding = bindings[e];
						if(binding.nodeName != "pref")
							continue;
						option = this.newOption(binding);
						if(!option)
							continue;
						options.bindings.push(option);
					}
					break;
				
				case 'filter':
					options.fileFilters.push("filter" + child.firstChild.data);
					break;
				
				case 'wrapper':
					options.wrapper = this.parseChildren(child.childNodes, new Object);
					break;
			}
		}
		try {
			var preference = new Preference(key, type);
			return new window[__(__(guiconfig.Wrappers[options.wrapper], {}).type, options.wrapper.type, preference.type) + "Option"](preference, options);
		}
		catch(e) {
			dump(e);dump("\n");
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