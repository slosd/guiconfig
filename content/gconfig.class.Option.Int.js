/**
 * @description Class to handle preferences with INTEGER values
 * @param {} key
 */
var IntOption = function(preference, options) {
	Option.call(this, preference, options);
}

IntOption.prototype = new Option;
IntOption.prototype.constructor = IntOption;

/**
 * @description Set the value of an element representing a preference
 * @param {int} v
 */
IntOption.prototype.setValue = function(value) {
	if(!value)
		var value = this.getPref();
	switch(this.Options.mode) {
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
IntOption.prototype.getValue = function() {
	switch(this.Options.mode) {
		case 'select':
			return this.Elements.option.selectedItem.value;
			break;
		
		default:
			return this.Elements.option.value;
			break;
	}
	return value;
}

/**
 * @description Build the elements for a integer preference 
 */
IntOption.prototype.build = function() {
	Option.prototype.build.call(this);
	var label = document.createElement("label");
	label.setAttribute("value", this.name);
	label.setAttribute("control", this.key);
	label.setAttribute("class", "optionLabel");
	
	switch(this.Options.mode) {
		case 'select':
			this.Elements.option = this.buildMenuList();
			break;
		
		default:
			this.Elements.option = this.buildTextBox();
			break;
	}
	
	this.Elements.option.setAttribute("id", this.Preference.key);
	this.Elements.prefBox.appendChild(label);
	this.Elements.prefBox.appendChild(this.Elements.option);
	return this.Elements.prefRow;
}