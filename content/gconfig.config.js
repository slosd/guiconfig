var guiconfig = {
	
	LocaleOptions: document.getElementById("opt_locale"),
	LocaleGConfig: document.getElementById("gc_locale"),

	Elements: new Object,
	Options: new Object,
	PrefTree: null,
	Preferences: new Object,
	Bindings: new Object,
	
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
				this.popup.Preference.reset();
			}
		});
		
		this.created_preferences = this.createPreferences();

		window.setTimeout(function() {
			guiconfig.Elements.window.centerWindowOnScreen();
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

	getLocaleString: function(str, locale) {
		return __((function() { return locale.getString(str); }), "");
	},

	getSelectLocaleStrings: function(Preference) {
		var locales = new Array,
			name = Preference.key.replace(/\./g, "_");

		for (var i = 1, l = Preference.Options.validValues.length, string; i <= l; i++) {
			string = this.getLocaleString(name + "_o" + i, this.LocaleOptions);
			if(string != null)
				locales.push(string);
		}

		return locales;
	},

	resetToDefault: function() {
		if(!gcCore.GCPreferences.getBoolPref("todefault.ask"))
			return this.resetPreferences();
		
		var reset = gcCore.userConfirm("gui:config", this.getLocaleString("confirm-std", this.LocaleOptions), this.getLocaleString("dont-ask", this.LocaleOptions), false);

		if(reset.value) {
			gcCore.GCPreferences.setBoolPref("todefault.ask", !reset.checked);
			return this.resetPreferences();
		}
	},
	
	savePreferences: function() {
		var Pref;
		for(var key in this.Preferences) {
			Preference = this.Preferences[key];
			if(!Preference.disabled)
				Preference.setPref();
		}
		return true;
	},

	resetPreferences: function() {
		for(var key in this.Preferences)
			this.Preferences[key].reset();
		return true;
	},
	
	updatePreferences: function() {
		var option;
		for(var key in this.Preferences)
			this.Preferences[key].setValue();
		return true;
	},

	observeOption: function(key) {
		if(this.stop_option_observation)
			return false;
		else if($defined(this.Preferences[key]))
			return this.Preferences[key].onprefchange();
	},

	validatePref: function(child) {
		if(!gcCore.GCPreferences.getBoolPref("matchversion"))
			return true;
		
		var minVersion = child.getAttribute("minVersion"),
			maxVersion = child.getAttribute("maxVersion");
		
		return gcCore.validateVersion(gcCore.MozInfo.version, minVersion, maxVersion);
	},

	createPreferences: function() {
		var panel, panelTab, panelBox,
			panels = this.PrefTree.getElementsByTagName("panel");
		
		for (var i = 0, l = panels.length; i < l; i++) {
			panel = panels[i];
			
			panelTab = document.createElement("radio");
			panelTab.setAttribute("pane", i);
			(i > 0) || panelTab.setAttribute("selected", true);
			panelTab.setAttribute("src", this.IconSet.getIcon("tab_" + panel.getAttribute("label")));
			panelTab.setAttribute("label", this.getLocaleString(panel.getAttribute("label"), this.LocaleOptions));
			panelTab.addEventListener("command", this.switchPanel, false);
			
			var panelBox = document.createElement("vbox");
			panelBox.setAttribute("class", "gcPrefPane");

			this.Elements.tabs.appendChild(panelTab);
			this.Elements.tabpanels.appendChild(this.parseChildren(panel.childNodes, panelBox));
		}
		
		return true;
	},

	parseChildren: function(children, container) {
		var tabbox, tab, tabpanel,
			group, caption,
			prefgroup,
			separator,
			preference;

		for (var i = 0, l = children.length; i < l; i++) {
			
			var child = children[i];
			
			if(child.nodeName == "#text" || !this.validatePref(child))
				continue;
			
			switch(child.nodeName) {
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
					tab.setAttribute("label", this.getLocaleString(child.getAttribute("label"), this.LocaleOptions));
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
					caption.setAttribute("label", this.getLocaleString(child.getAttribute("label"), this.LocaleOptions));
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
				
				case 'pref':
					preference = Preference.instance(child);
					if(!preference)
						break;
					this.Preferences[preference.key] = preference;
					container.appendChild(preference.build());
					preference.onprefchange();
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
		while(!$defined(node.Preference) && (i--) > 0)
			node = node.parentNode;
		if($defined(node.Preference)) {
			popup.Preference = node.Preference;
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