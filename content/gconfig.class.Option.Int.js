var IntOption = function(preference, options) {
	Option.call(this, preference, options);
}

IntOption.prototype = new Option;
IntOption.prototype.constructor = IntOption;

IntOption.prototype.setValue = function(value) {
	if(!value)
		var value = this.getPref();
	if(this.Wrapper.setValue) {
		this.Wrapper.setValue.call(this, value);
	}
	else {
		switch(this.Options.mode) {
			case 'select':
			default:
				this.Elements.option.setProperty("value", value);
				break;
		}
	}
	return value;
}

IntOption.prototype.getValue = function() {
	if(this.Wrapper.getValue) {
		return this.Wrapper.getValue.call(this);
	}
	else {
		switch(this.Options.mode) {
			case 'select':
				return this.Elements.option.selectedItem.value;
				break;
			
			default:
				return this.Elements.option.value;
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
			
			default:
				var type = 'textbox';
				break;
		}
		
		var element = new GCElement(type, {
			'label': {
				'value': this.name,
				'control': this.Preference.key
			},
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