/**
 * @description Class to handle preferences with STRING values
 * @param {} key
 */
var CharPreference = function(key, type, options) {
	this._parent_ = new Preference;
	Preference.call(this, key, type, options);
}

CharPreference.prototype = new Preference;

/**
 * @description Set the value of an element representing a preference
 * @param {str} v
 */
CharPreference.prototype.setValue = function(value) {
	if(!$defined(value))
		var value = this.getPref();
	switch(this.Options.type) {		
		case 'select':
			if(!this.Elements.option.menupopup)
				this.Elements.option.value = value;
			else
				for(var i = 0, l = this.Options.validValues.length; i < l; i++)
					if(this.Options.validValues[i] == value)
						this.Elements.option.selectedIndex = i;
			break;
		
		case 'colorpicker':
			this.Elements.option.setAttribute("color", value);
			break;
		
		default:
			this.Elements.option.setAttribute("value", value);
			break;
	}
	return value;
}

/**
 * @description Get the value of an element representing a preference
 */
CharPreference.prototype.getValue = function() {
	switch(this.Options.type) {
		case 'select':
			return this.Elements.option.selectedItem.value;
			break;
		
		case 'colorpicker':
			return this.Elements.option.color;
			break;
		
		default:
			return this.Elements.option.value;
			break;
	}
}

/**
 * @description Build the elements for a string preference
 */
CharPreference.prototype.build = function() {
	this._parent_.build.call(this);
	var label = document.createElement("label");
	label.setAttribute("value", this.name);
	label.setAttribute("control", this.key);
	label.setAttribute("class", "optionLabel");
	
	switch(this.Options.type) {
		case 'select':
			this.Elements.option = this.buildMenuList();
			break;
		
		case 'colorpicker':
			this.addButton("color");
			this.Elements.option = this.buildColorPicker();
			break;
		
		default:
			if(this.Options.type == "file")
				this.addButton("file");
			this.Elements.option = this.buildTextBox();
			break;
	}
	
	this.Elements.option.setAttribute("id", this.key);
	this.Elements.prefBox.appendChild(label);
	this.Elements.prefBox.appendChild(this.Elements.option);
	return this.Elements.prefRow;
}