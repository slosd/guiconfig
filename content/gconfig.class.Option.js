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
	this.Wrapper = {
		'scripts': new Object,
		'dependencies': new Array,
		'elements': null
	};
	
	this.name = this.Options.label;
	this.description = this.Options.description;
	
	this.Preference.onchange = function() {
		if(this.exists)
			this.Option.setValue();
		else
			this.Option.disabled = !this.Option.Options.forceCreate;
	}
}

Option.prototype.onvaluechange = function() {
	guiconfig.Observer.observe("pseudo", "nsPref:changed", this.Preference.key);
	if(!gcCore.MozPreferences.getBoolPref("browser.preferences.instantApply"))
		return false;
	return this.setPref();
}

Option.prototype.getPref = function(d) {
	if(this.Wrapper.scripts.getPref)
		return this.Wrapper.scripts.getPref.call(this, d);
	else
		return this.Preference.getPref(d);
}

Option.prototype.setPref = function(value) {
	var set_pref = true;
	if(!is_defined(value))
		var value = this.getValue();
	PrefObserver.stopObserver(this.Preference.key, "Preference");
	if(this.Wrapper.scripts.setPref)
		set_pref = this.Wrapper.scripts.setPref.call(this, value);
	else if(this.Options.bindings.length > 0)
		for(var i = 0, l = this.Options.bindings.length; i < l; i++)
			this.Options.bindings[i].setPref(value);
	if(is_defined(set_pref))
		this.Preference.setPref(value);
	PrefObserver.startObserver(this.Preference.key, "Preference");
	return true;
}

Option.prototype.resetPref = function() {
	this.Preference.resetPref();
	if(this.Wrapper.scripts.resetPref)
		this.Wrapper.scripts.resetPref.call(this);
	else if(this.Options.bindings.length > 0)
		for(var i = 0, l = this.Options.bindings.length; i < l; i++)
			this.Options.bindings[i].resetPref();
	return true;
}

Option.prototype.allDependenciesLoaded = function() {
	var i = 0, l = this.Wrapper.dependencies.length;
	while(i < l && guiconfig.Options[this.Wrapper.dependencies[i]]) {
		i++;
	}
	return i == l;
}

Option.prototype.checkDependencies = function(key) {
	if(this.allDependenciesLoaded())
		this.dependencies = !(this.Wrapper.dependencies.length > 0) || (!this.Wrapper.scripts.dependencies || this.Wrapper.scripts.dependencies.call(this, key));
}

Option.prototype.build = function() {
	var elements = this.Wrapper.elements;
	if(elements) {
		var parser = new gcCore.PrefParser(elements).instance({
			'filter': guiconfig.validatePref
		});
		
		parser.registerNode('group', function(node, container, parse) {
			var group = new GCElement('group', {
				'label': {
					'value': node.getAttribute("label")
				}
			}).inject(container);
			node.setUserData("element", group.element, null);
			parse(node.childNodes, group.element.lastChild);
		});
		
		parser.registerNodes(['checkbox', 'menulist', 'textbox', 'colorpicker'], function(node, container) {
			var element = new GCElement(node.nodeName, {
				'label': {
					'value': node.getAttribute("label")
				},
				'onmouseover': function() {
					guiconfig.setDescription(node.getAttribute("description"));
				}.bind(this),
				'onchange': function() {
					this.onvaluechange();
				}.bind(this)
			}).inject(container);
			node.setUserData("element", element.element, null);
		}, this);
		
		var fragment = parser.run(document.createDocumentFragment());
		
		this.buildRow("vbox");
		this.Elements.option = this.Elements.prefRow;
		this.Elements.prefRow.appendChild(fragment);
		return false;
	}
	else {
		this.buildRow("hbox");
		return true;
	}
}

Option.prototype.buildRow = function(tag) {
	this.Elements.prefRow = document.createElement(tag);
	this.Elements.prefRow.setAttribute("context", "gcoptrightclick");
	this.Elements.prefRow.setAttribute("class", "optionRow");
	if(this.Options.indent)
		this.Elements.prefRow.setAttribute("class", "indent");
	this.Elements.prefRow.Option = this;
	
	this.Elements.prefBox = document.createElement("hbox");
	this.Elements.prefBox.setAttribute("align", "center");
	this.Elements.prefBox.setAttribute("flex", "2");
	this.Elements.prefBox.addEventListener("mouseover", function() {
		guiconfig.setDescription(this.description);
	}.bind(this), false);
	
	this.Elements.buttonBox = document.createElement("hbox");
	
	this.Elements.prefRow.appendChild(this.Elements.prefBox);
	this.Elements.prefRow.appendChild(this.Elements.buttonBox);
}

Option.prototype.addButton = function(type) {
	if(this.hasButton(type))
		return true;
	
	this.Elements.Buttons[type] = document.createElement("button");

	switch(type) {
		case 'edit':
			this.Elements.Buttons[type].setAttribute("label", guiconfig.getLocaleString("button-edit-enable", guiconfig.LocaleOptions));
			this.Elements.Buttons[type].setAttribute("image", guiconfig.IconSet.getIcon("add"));
			this.Elements.Buttons[type].addEventListener("click", function() {
				this.disabled = false;
			}.bind(this), false);
			break;

		case 'color':
			this.Elements.Buttons[type].setAttribute("label", guiconfig.getLocaleString("button-custom-value", guiconfig.LocaleOptions));
			this.Elements.Buttons[type].setAttribute("image", guiconfig.IconSet.getIcon("color"));
			this.Elements.Buttons[type].addEventListener("command", function() {
				var input = gcCore.userInput("gui:config", guiconfig.getLocaleString("fill-in-value", guiconfig.LocaleOptions));
				if(input != null) {
					this.disabled = false;
					this.setValue(input);
					this.onvaluechange();
				}
			}.bind(this), false);
			break;
		
		case 'file':
			this.Elements.Buttons[type].setAttribute("label", guiconfig.getLocaleString("button-file-select", guiconfig.LocaleOptions));
			this.Elements.Buttons[type].addEventListener("command", function() {
				var input = gcCore.fileInput(guiconfig.getLocaleString("choose-file", guiconfig.LocaleOptions), this.Options.fileFilters);
				if(input) {
					this.disabled = false;
					this.setValue(input.path);
					this.onvaluechange();
				}
			}.bind(this), false);
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

Option.prototype.disable = function(element, value) {
	if(value)
		element.setAttribute("disabled", "true");
	else
		element.removeAttribute("disabled");
	if(element.previousSibling && element.previousSibling.nodeName == "label")
		this.disable(element.previousSibling, value);
	element.disabled = !!value;
}

Option.prototype.__defineSetter__("disabled", function(value) {
	this.Options.disabled = !!value;
	this[(value ? "addButton" : "removeButton")]("edit");
	this.disable(this.Elements.option, value);
	if(this.Options.defaultValue)
		this.setValue(this.Options.defaultValue);
	if(!value)
		this.setPref();
	this.dependencies = this.dependencies;
});

Option.prototype.__defineGetter__("disabled", function() {
	return this.Options.disabled;
});

Option.prototype.__defineSetter__("dependencies", function(value) {
	this.Options.dependencies = !!value;
	if(!this.disabled)
		this.disable(this.Elements.option, !value);
});

Option.prototype.__defineGetter__("dependencies", function() {
	return this.Options.dependencies;
});