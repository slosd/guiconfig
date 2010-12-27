var guiconfig = {
	
	components: {
		"config": "chrome://guiconfig/content/gui/config.xul"
	},
	
	init: function() {
		window.addEventListener("load", this.placeMenuItem, false);
		
		PrefObserver.addObserver('extensions.guiconfig.sticktopreferences', function() {
			this.placeMenuItem();
		}, this, "MenuItem");
		
		PrefObserver.addObserver('browser.preferences.instantApply', function() {
			if(this.windowIsOpen("config"))
				this["gcconfigwindow"].guiconfig.setButtons();
		}, this, "Buttons");
	},
	
	placeMenuItem: function() {
		var stick = gcCore.MozPreferences.getBoolPref("extensions.guiconfig.sticktopreferences");
		var tools_menu = document.getElementById("menu_ToolsPopup");
		var pref_menuitem = document.getElementById("menu_preferences");
		var app_menuitem = document.getElementById("appmenu_preferences");
		var gc_menuitem = document.getElementById("gcToolsItem");
		var gc_appitem = document.getElementById("gcAppItem");

		if(pref_menuitem) {
			/* insert the menu item after the "Preferences" item */
			if(stick && gc_menuitem.previousSibling != pref_menuitem) {
				if(!pref_menuitem.nextSibling)
					pref_menuitem.parentNode.appendChild(gc_menuitem.cloneNode(true));
				else
					pref_menuitem.parentNode.insertBefore(gc_menuitem.cloneNode(true), pref_menuitem.nextSibling);
				gc_menuitem.parentNode.removeChild(gc_menuitem);
			}
		}
		else {
			/* insert the menu item in the "Tools" menu */
			if(gc_menuitem.parentNode != tools_menu) {
				tools_menu.appendChild(gc_menuitem.cloneNode(true));
				gc_menuitem.parentNode.removeChild(gc_menuitem);
			}
		}
		
		if(app_menuitem) {
			/* insert the menuitem in the App menu */
			gc_appitem.style.display = stick ? "-moz-box" : "none";
			if(stick && gc_appitem.previousSibling != app_menuitem) {
				if(!app_menuitem.nextSibling)
					app_menuitem.parentNode.appendChild(gc_appitem.cloneNode(true));
				else
					app_menuitem.parentNode.insertBefore(gc_appitem.cloneNode(true), app_menuitem.nextSibling);
				gc_appitem.parentNode.removeChild(gc_appitem);
			}
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