var Option = function(preference, options) {
	if(preference && options)
		this.initialize(preference, options);
}

Option.prototype.initialize = function(preference, options) {
	var locale;
	
	this.Preference = preference;
	this.Preference.Option = this;
	this.Options = (options || new Object);	
	this.Elements = { Buttons: new Object };
	this.Wrapper = (guiconfig.Wrappers[options.wrapper] || options.wrapper || new Object);
	
	this.name = this.Options.label;
	this.description = this.Options.description;
	
	this.Preference.onchange = function() {
		if(this.exists)
			this.Option.setValue();
		else
			this.Option.disabled = true;
	}
}

Option.prototype.onvaluechange = function() {
	if(!gcCore.MozPreferences.getBoolPref("browser.preferences.instantApply"))
		return false;
	return this.setPref();
}

Option.prototype.getPref = function(d) {
	if(this.Wrapper.getPref)
		return this.Wrapper.getPref.call(this, d);
	else
		return this.Preference.getPref(d);
}

Option.prototype.setPref = function(value) {
	var set_pref = true;
	if(!value)
		var value = this.getValue();
	gcCore.stopObserver(this.Preference.key, "Preference");
	if(this.Wrapper.setPref)
		set_pref = this.Wrapper.setPref.call(this, value);
	else if(this.Options.bindings.length > 0)
		for(var i = 0, l = this.Options.bindings.length; i < l; i++)
			this.Options.bindings[i].setPref(value);
	if(set_pref)
		this.Preference.setPref(value);
	gcCore.startObserver(this.Preference.key, "Preference");
	return true;
}

Option.prototype.resetPref = function() {
	this.Preference.resetPref();
	if(this.Wrapper.resetPref)
		this.Wrapper.resetPref.call(this);
	else if(this.Options.bindings.length > 0)
		for(var i = 0, l = this.Options.bindings.length; i < l; i++)
			this.Options.bindings[i].resetPref();
	return true;
}

Option.prototype.build = function() {
	this.Elements.prefRow = document.createElement("hbox");
	this.Elements.prefRow.setAttribute("context", "gcoptrightclick");
	this.Elements.prefRow.setAttribute("class", "optionRow");
	this.Options.indent && this.Elements.prefRow.setAttribute("class", "indent");
	this.Elements.prefRow.Option = this;

	this.Elements.prefBox = document.createElement("hbox");
	this.Elements.prefBox.setAttribute("flex", "2");
	this.Elements.prefBox.addEventListener("mouseover", function(Option) {
		return function() { guiconfig.setDescription(Option.description); }
	}(this), false);
	
	this.Elements.buttonBox = document.createElement("hbox");
	
	this.Elements.prefRow.appendChild(this.Elements.prefBox);
	this.Elements.prefRow.appendChild(this.Elements.buttonBox);
}

Option.prototype.buildMenuList = function() {	
	var select = new Array,
		menulist, menupopu, menuitem;
	
	menulist = document.createElement("menulist");
	menulist.addEventListener("command", function(Option) {
		return function() {
			Option.onvaluechange();
		}
	}(this), false);
	menupopup = document.createElement("menupopup");
	
	for (var i = 0, l = this.Options.validValues.length; i < l; i++) {
		if(this.Options.validValues[i] == null)
			continue;
		menuitem = document.createElement("menuitem");
		menuitem.setAttribute("crop", "end");
		menuitem.setAttribute("label", this.Options.validValues[i].label);
		menuitem.setAttribute("value", this.Options.validValues[i].value);
		menupopup.appendChild(menuitem);
	}
	
	menulist.appendChild(menupopup);
	return menulist;
}

Option.prototype.buildTextBox = function() {
	var textbox = document.createElement("textbox");
	textbox.setAttribute("flex", "1");
	textbox.setAttribute("type", "timed");
	textbox.setAttribute("timeout", "500");
	textbox.addEventListener("command", function(Option) {
		return function() {
			Option.onvaluechange();
		}
	}(this), false);
	return textbox;
}

Option.prototype.buildColorPicker = function() {
	var colorpicker = document.createElement("colorpicker");
	colorpicker.setAttribute("type", "button");
	colorpicker.addEventListener("change", function(Option) {
		return function() {
			Option.onvaluechange();
		}
	}(this), false);	
	return colorpicker;
}

Option.prototype.addButton = function(type) {
	if(this.hasButton(type))
		return true;
	
	this.Elements.Buttons[type] = document.createElement("button");

	switch(type) {
		case 'edit':
			this.Elements.Buttons[type].setAttribute("label", guiconfig.getLocaleString("button-edit-enable", guiconfig.LocaleOptions));
			this.Elements.Buttons[type].setAttribute("image", guiconfig.IconSet.getIcon("add"));
			this.Elements.Buttons[type].addEventListener("click", function(Option) {
				return function() {
					Option.disabled = false;
				}
			}(this), false);
			break;

		case 'color':
			this.Elements.Buttons[type].setAttribute("label", guiconfig.getLocaleString("button-custom-value", guiconfig.LocaleOptions));
			this.Elements.Buttons[type].setAttribute("image", guiconfig.IconSet.getIcon("color"));
			this.Elements.Buttons[type].addEventListener("click", function(Option) {
				return function() {
					var input = gcCore.userInput("gui:config", guiconfig.getLocaleString("fill-in-value", guiconfig.LocaleOptions));
					if(input != null) {
						Option.disabled = false;
						Option.setValue(input);
						Option.onvaluechange();
					}
				}
			}(this), false);
			break;
		
		case 'file':
			this.Elements.Buttons[type].setAttribute("label", guiconfig.getLocaleString("button-file-select", guiconfig.LocaleOptions));
			this.Elements.Buttons[type].addEventListener("click", function(Option) {
				return function() {
					var input = gcCore.fileInput(guiconfig.getLocaleString("choose-file", guiconfig.LocaleOptions), Option.Options.fileFilters);
					if(input) {
						Option.disabled = false;
						Option.setValue(input.path);
						Option.onvaluechange();
					}
				}
			}(this), false);
			break;

	}
	this.Elements.buttonBox.appendChild(this.Elements.Buttons[type]);
	return true;
}

Option.prototype.removeButton = function(type) {
	if(!this.hasButton(type))
		return true;
	
	this.Elements.Buttons[type].parentNode.removeChild(this.Elements.Buttons[type]);
	delete this.Elements.Buttons[type];
}

Option.prototype.hasButton = function(type) {
	return !!this.Elements.Buttons[type];
}

Option.prototype.__defineSetter__("disabled", function(value) {
	this.Options.disabled = !!value;
	this[(value ? "addButton" : "removeButton")]("edit");
	this.Elements.option.setAttribute("disabled", (value ? "true" : ""));
	this.Elements.option.disabled = !!value;
	if(this.Options.defaultValue)
		this.setValue(this.Options.defaultValue);
	if(!value)
		this.Preference.setPref(this.getValue());
});

Option.prototype.__defineGetter__("disabled", function() {
	return this.Options.disabled;
});