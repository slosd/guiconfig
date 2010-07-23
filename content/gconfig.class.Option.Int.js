var IntOption = function(preference, options) {
	Option.call(this, preference, options);
}

IntOption.prototype = new Option;
IntOption.prototype.constructor = IntOption;

IntOption.prototype.setValue = function(value, useNative) {
	if(!is_defined(value))
		var value = this.getPref();
	if(this.Wrapper.scripts.setValue && !useNative) {
		this.Wrapper.scripts.setValue.call(this, value);
	}
	else {
		switch(this.Options.mode) {
			case 'radio':
				if(!is_defined(this.Elements.option.value)) {
					for(var i = 0, l = this.Options.validValues.length; i < l; i++) {
						if(this.Options.validValues[i].value == value) {
								this.Elements.option.childNodes[i].setAttribute("selected", "true");
						}
					}
				}
				else {
					this.Elements.option.setProperty("value", value);
				}
				break;
				
			case 'select':
			default:
				this.Elements.option.setProperty("value", value);
				break;
		}
	}
	this.Elements.option.setUserData("value", value, null);
	this.onvaluechange();
	return value;
}

IntOption.prototype.getValue = function(useNative) {
	if(this.Wrapper.scripts.getValue && !useNative) {
		return this.Wrapper.scripts.getValue.call(this);
	}
	else {
		switch(this.Options.mode) {
			case 'select':
				return (this.Elements.option.selectedItem ? this.Elements.option.selectedItem.value : this.Elements.option.getUserData("value"));
				break;
			
			case 'radio':
			default:
				return (this.Elements.option.value || this.Elements.option.getUserData("value"));
				break;
		}
	}
	return value;
}

IntOption.prototype.build = function() {
	if(Option.prototype.build.call(this)) {		
		switch(this.Options.mode) {
			case 'select':
				var type = 'menulist';
				break;
				
			case 'radio':
				var type = 'radiogroup';
				break;
			
			default:
				var type = 'textbox';
				break;
		}
		
		var default_value = this.Preference.getDefaultValue();
		var element = new GCElement(type, {
			'label': {
				'value': this.name,
				'control': this.Preference.key
			},
			'type': 'number',
			'size': ((default_value ? default_value.toString().length : 0) + 2),
			'values': this.Options.validValues,
			'onchange': function() {
				this.onvaluechange();
			}.bind(this)
		});
		
		this.Elements.option = element.element;
		this.Elements.option.setAttribute("id", this.Preference.key);
		this.Elements.prefBox.appendChild(element.dom);
	}
	return this.Elements.prefRow;
}