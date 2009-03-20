/**
 * @description Class to handle preferences with INTEGER values
 * @param {} key
 */
var IntPreference = function(key, type, options) {
	this._parent_ = new Preference;
	Preference.call(this, key, type, options);
}

IntPreference.prototype = new Preference;

/**
 * @description Set the value of an element representing a preference
 * @param {int} v
 */
IntPreference.prototype.setValue = function(value) {
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
		
		default:
			this.Elements.option.setAttribute("value", value);
			break;
	}
	return value;
}

/**
 * @description Get the value of an element representing a preference
 */
IntPreference.prototype.getValue = function() {
	switch(this.Options.type) {
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
IntPreference.prototype.build = function() {
	this._parent_.build.call(this);
	var label = document.createElement("label");
	label.setAttribute("value", this.name);
	label.setAttribute("control", this.key);
	label.setAttribute("class", "optionLabel");
	
	switch(this.Options.type) {
		case 'select':
			this.Elements.option = this.buildMenuList();
			break;
		
		default:
			this.Elements.option = this.buildTextBox();
			break;
	}
	
	this.Elements.option.setAttribute("id", this.key);
	this.Elements.prefBox.appendChild(label);
	this.Elements.prefBox.appendChild(this.Elements.option);
	return this.Elements.prefRow;
}