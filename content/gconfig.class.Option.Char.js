var CharOption = function(preference, options) {
	Option.call(this, preference, options);
}

CharOption.prototype = new Option;
CharOption.prototype.constructor = CharOption;

CharOption.prototype.setValue = function(value) {
	if(!value)
		var value = this.getPref();
	if(this.Wrapper.scripts.setValue) {
		this.Wrapper.scripts.setValue.call(this, value);
	}
	else {
		switch(this.Options.mode) {
			case 'colorpicker':
				this.Elements.option.setProperty("color", value);
				break;
			
			case 'select':
			default:
				this.Elements.option.setProperty("value", value);
				break;
		}
	}
	this.Elements.option.setUserData("value", value, null);
	return value;
}

CharOption.prototype.getValue = function() {
	if(this.Wrapper.scripts.getValue) {
		return this.Wrapper.scripts.getValue.call(this);
	}
	else {
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
}

CharOption.prototype.disable = function(element, value) {
	Option.prototype.disable.call(this, element, value);
	switch(this.Options.mode) {
		case 'file':
			Option.prototype.disable.call(this, this.Elements.Buttons.file, value);
			break;
		
		case 'colorpicker':
			Option.prototype.disable.call(this, this.Elements.Buttons.color, value);
			break;
	}
}

CharOption.prototype.build = function() {
	if(Option.prototype.build.call(this)) {
		switch(this.Options.mode) {
			case 'select':
				var type = 'menupicker';
				break;
			
			case 'colorpicker':
				var type = 'colorpicker';
				this.addButton("color");
				break;
			
			default:
				var type = 'textbox';
				if(this.Options.mode == "file")
					this.addButton("file");
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