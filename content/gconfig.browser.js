var guiconfig = {
	
	components: {
		"config": "chrome://guiconfig/content/config.xul"
	},
	
	init: function() {
		window.addEventListener("load", this.placeMenuItem, false);
		
		gcCore.addObserver('extensions.guiconfig.sticktopreferences', function() {
			this.placeMenuItem();
		}, this, "MenuItem");
		
		gcCore.addObserver('browser.preferences.instantApply', function() {
			if(this.windowIsOpen("config"))
				this.configWindow.guiconfig.setButtons();
		}, this, "Buttons");
	},
	
	placeMenuItem: function() {
		var stick = gcCore.MozPreferences.getBoolPref("extensions.guiconfig.sticktopreferences");
		var tools_menu = document.getElementById("menu_ToolsPopup");
		var pref_menuitem = document.getElementById("menu_preferences");
		var gc_menuitem = document.getElementById("gcToolsItem");

		if(pref_menuitem && stick && gc_menuitem.previousSibling != pref_menuitem) {
			if(!pref_menuitem.nextSibling)
				pref_menuitem.parentNode.appendChild(gc_menuitem.cloneNode(true));
			else
				pref_menuitem.parentNode.insertBefore(gc_menuitem.cloneNode(true), pref_menuitem.nextSibling);
			gc_menuitem.parentNode.removeChild(gc_menuitem);
		}
		else if((!pref_menuitem || !stick) && gc_menuitem.parentNode != tools_menu) {
			tools_menu.appendChild(gc_menuitem.cloneNode(true));
			gc_menuitem.parentNode.removeChild(gc_menuitem);
		}
		return true;
	},
	
	openWindow: function(doc) {
		var window_name = "gc" + doc + "window",
			chrome = this.components[doc];
		
		if(this.windowIsOpen(doc)) {
			this[window_name].focus();
		}
		else {
			this[window_name] = window.open(chrome, window_name, "chrome");
		}
	},
	
	windowIsOpen: function(doc) {
		var window_name = "gc" + doc + "window";
		return (this[window_name] && !this[window_name].closed);
	}
}