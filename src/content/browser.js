var guiconfig = (function(guiconfig) {
  var dialog;

  guiconfig.browser = {
    showPreferencesDialog: function() {
      if(dialog && !dialog.closed) {
        dialog.focus();
      } else {
        dialog = window.openDialog('chrome://guiconfig/content/ui/preferences.xul', 'guiconfigPreferences', 'chrome,titlebar,toolbar,centerscreen'); // + (instantApply ? ",dialog=no" : ",modal");
      }
    }
  };
  return guiconfig;
})(guiconfig || {});
