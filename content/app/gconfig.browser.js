var guiconfig = {
  
  components: {
    "config": "chrome://guiconfig/content/gui/config.xul"
  },
  
  init: function() {
    PrefObserver.addObserver('extensions.guiconfig.sticktopreferences', function() {
      this.placeMenuItem();
    }, this, "MenuItem");
    
    PrefObserver.addObserver('browser.preferences.instantApply', function() {
      if(this.windowIsOpen("config"))
        this["gcconfigwindow"].guiconfig.setButtons();
    }, this, "Buttons");
  },
  
  openWindow: function(doc) {
    var window_name = "gc" + doc + "window",
      chrome = this.components[doc];
    
    if(this.windowIsOpen(doc)) {
      this[window_name].focus();
    }
    else {
      this[window_name] = window.openDialog(chrome, window_name, "chrome, dialog, resizable=no");
    }
  },
  
  windowIsOpen: function(doc) {
    var window_name = "gc" + doc + "window";
    return (this[window_name] && !this[window_name].closed);
  }
}