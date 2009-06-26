/**
 * @description Class to handle preferences with STRING values
 * @param {} key
 */
var CharOption = function(preference, options) {
	Option.call(this, preference, options);
}

CharOption.prototype = new Option;
CharOption.prototype.constructor = CharOption;

/**
 * @description Set the value of an element representing a preference
 * @param {str} v
 */
CharOption.prototype.setValue = function(value) {
	if(!value)
		var value = this.getPref();
	switch(this.Options.mode) {
		case 'colorpicker':
			this.Elements.option.setProperty("color", value);
			break;
		
		case 'select':
		default:
			this.Elements.option.setProperty("value", value);
			break;
	}
	return value;
}

/**
 * @description Get the value of an element representing a preference
 */
CharOption.prototype.getValue = function() {
	switch(this.Options.mode) {
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
CharOption.prototype.build = function() {
	Option.prototype.build.call(this);
	var label = document.createElement("label");
	label.setAttribute("value", this.name);
	label.setAttribute("control", this.key);
	label.setAttribute("class", "optionLabel");
	
	switch(this.Options.mode) {
		case 'select':
			this.Elements.option = this.buildMenuList();
			break;
		
		case 'colorpicker':
			this.addButton("color");
			this.Elements.option = this.buildColorPicker();
			break;
		
		default:
			if(this.Options.mode == "file")
				this.addButton("file");
			this.Elements.option = this.buildTextBox();
			break;
	}
	
	this.Elements.option.setAttribute("id", this.Preference.key);
	this.Elements.prefBox.appendChild(label);
	this.Elements.prefBox.appendChild(this.Elements.option);
	return this.Elements.prefRow;
}