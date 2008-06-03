var guiconfig = {
	pref : Components.classes["@mozilla.org/preferences-service;1"]
			.getService(Components.interfaces.nsIPrefService)
			.getBranch("extensions.guiconfig."),
	init : function() {
		window.addEventListener("load", this.placeMenuItem, false);
		this.pref.QueryInterface(Components.interfaces.nsIPrefBranch2);
		this.pref.addObserver("", this, false);
		// if (this.pref.getBoolPref("firstrun")) {
		// this.pref.setBoolPref("firstrun", false);
		// this.firstrun();
		// }
	},
	observe : function(subject, topic, data) {
		if (topic != "nsPref:changed")
			return;
		switch (data) {
			case "sticktopreferences" :
				guiconfig.placeMenuItem();
				break;
			// case "matchversion":
			// if(!this.configWindow) break;
			// this.configWindow.guiconfig.updatePreferences();
			// break;
		}
	},
	firstrun : function() {
		var navToolbar = document.getElementById("nav-bar");
		var search = document.getElementById("search-container");
		if (navToolbar.currentSet.indexOf("gcButtonPref") == -1)
			navToolbar.insertItem("gcButtonPref", search, null, false);
		document.persist("nav-bar", "currentset");
	},
	placeMenuItem : function() {
		var stick = guiconfig.pref.getBoolPref("sticktopreferences");
		var tools_menu = document.getElementById("menu_ToolsPopup");
		var pref_menuitem = document.getElementById("menu_preferences");
		var gc_menuitem = document.getElementById("gcToolsItem");

		if (stick && gc_menuitem.previousSibling != pref_menuitem) {
			if (!pref_menuitem.nextSibling)
				pref_menuitem.parentNode.appendChild(gc_menuitem
						.cloneNode(true));
			else
				pref_menuitem.parentNode.insertBefore(gc_menuitem
						.cloneNode(true), pref_menuitem.nextSibling);
			gc_menuitem.parentNode.removeChild(gc_menuitem);
		} else if (!stick && gc_menuitem.parentNode != tools_menu) {
			tools_menu.appendChild(gc_menuitem.cloneNode(true));
			gc_menuitem.parentNode.removeChild(gc_menuitem);
		}
		return true;
	},
	openWindow : function() {
		if (this.configWindow && !this.configWindow.closed)
			this.configWindow.focus();
		else
			this.configWindow = window.open(
					"chrome://guiconfig/content/config.xul", "gcwindow",
					"chrome");
	}
}
guiconfig.init();