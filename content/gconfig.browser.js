var guiconfig = {
	
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
	
	openWindow: function(doc, name) {
		var window_name = "gc" + (name || doc) + "window",
			chrome = {
				"config": "chrome://guiconfig/content/config.xul"
			}[doc];
		
		if(this.windowIsOpen(doc)) {
			this[doc + "Window"].focus();
		}
		else {
			this[doc + "Window"] = window.open(chrome, window_name, "chrome");
			this[doc + "Window"]["gcCore"] = window["gcCore"];
			this[doc + "Window"]["__"] = window["__"];
			this[doc + "Window"]["$defined"] = window["$defined"];
		}
	},
	
	windowIsOpen: function(doc) {
		return (this[doc + "Window"] && !this[doc + "Window"].closed);
	}
}