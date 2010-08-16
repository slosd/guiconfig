/** GCElement generic **/

var GCElement = function(options) {
  this.options = options;
  this.value = null;
  this.observer = new gcCore.GenericObserver();
  this.elements = {
    "row": null,
    "option": null,
    "buttons": null,
    "addedButtons": new Object(),
    "element": null
  };
}

GCElement.prototype.buildRow = function() {
  /* create the box containing all elements related to the option */ 
  var row = document.createElement("hbox");
  row.option = this;
  row.setAttribute("id", "gcPref" + this.options.label.control);
  row.setAttribute("context", "gcConfigContextMenu");
  row.setAttribute("class", "optionRow");
  if(this.options.indent)
    row.setAttribute("class", "indent");
  row.addEventListener("mouseover", function() {
    guiconfig.setDescription(this.options.description);
  }.bind(this), false);
  
  /* create the box containing elements to change the option's value */
  if(is_defined(this.options.wrapper.elements)) {
    var option = document.createElement("vbox");
  }
  else {
    var option = document.createElement("hbox");
    option.setAttribute("align", "center");
  }
  option.setAttribute("flex", "1");
    
  /* create the box containing button elements to control the option */
  var buttons = document.createElement("hbox");
  
  this.elements.row = row;
  this.elements.option = option;
  this.elements.buttons = buttons;
  
  row.appendChild(option);
  row.appendChild(buttons);
  
  if(is_defined(this.options.wrapper.fragment))  {
	option.appendChild(this.options.wrapper.fragment);
  }
  else {
    option.appendChild(this.build().getElement());
  }
  
  this.observer.fire("created");
}

GCElement.prototype.getElement = function() {
  if(!is_defined(this.elements.row)) {
    this.buildRow();
  }
  return this.elements.row;
}

GCElement.prototype.addButton = function(buttonName) {
  if(!this.hasButton(buttonName)) {
    var button = document.createElement("button");
    switch (buttonName) {
      case 'edit':
        button.setAttribute("label", guiconfig.GCLocale.get("button-edit-enable"));
        button.setAttribute("image", "add");
        button.addEventListener("click", function() {
          this.locked = false;
        }.bind(this), false);
        break;        
      case 'color':
        button.setAttribute("label", guiconfig.GCLocale.get("button-custom-value"));
        button.setAttribute("icon", "select-color");
        button.addEventListener("command", function() {
          var input = gcCore.userInput("gui:config", guiconfig.GCLocale.get("fill-in-value"));
          if(input != null) {
            this.disabled = false;
            this.set(input);
            this.observer.fire("modified");
          }
        }.bind(this), false);
        break;        
      case 'file':
        button.setAttribute("label", guiconfig.GCLocale.get("button-file-select", guiconfig.LocaleOptions));
        button.setAttribute("icon", "open");
        button.addEventListener("command", function() {
          var input = gcCore.fileInput(guiconfig.GCLocale.get("choose-file"), this.options.wrapper.fileFilters);
          if(input) {
            this.disabled = false;
            this.set(input.path);
            this.observer.fire("modified");
          }
        }.bind(this), false);
        break;
    }
    this.elements.addedButtons[buttonName] = button;
    this.elements.buttons.appendChild(button);
    return true;
  }
  return false;
}

GCElement.prototype.removeButton = function(buttonName) {
  if(this.hasButton(buttonName)) {
    this.elements.addedButtons[buttonName].parentNode.removeChild(this.elements.addedButtons[buttonName]);
    delete this.elements.addedButtons[buttonName];
  }
}

GCElement.prototype.hasButton = function(buttonName) {
  return !!this.elements.addedButtons[buttonName];
}

/* the "locked" property is used for options that don't exist in the about:config */
GCElement.prototype.__defineSetter__("locked", function(lock) {
  if(this.options.locked != lock) {
    this.disabled = lock;
    lock ? this.addButton("edit") : this.removeButton("edit");
    this.options.locked = lock;
    this.observer.fire(lock ? "locked" : "unlocked");
  }
});

GCElement.prototype.__defineGetter__("locked", function() {
  return !!this.options.locked;
});

/* the "disabled" property is used for options that aren't supposed to be edited right away */
GCElement.prototype.__defineSetter__("disabled", function(disable) {
  if(this.options.disabled != disable) {
    var optionElement = this.elements.element.getOptionElement();
    var elements = [
      optionElement,
      this.elements.addedButtons["color"],
      this.elements.addedButtons["file"],
      (optionElement.previousSibling && optionElement.previousSibling.nodeName == "label") ? optionElement.previousSibling : null
    ];
    optionElement.disabled = !!disable;
    for(var i in elements) {
      if(elements[i]) {
        disable ? elements[i].setAttribute("disabled", "true") : elements[i].removeAttribute("disabled");
      }
    }
    this.options.disabled = disable;
    this.observer.fire(disable ? "disabled" : "enabled");
  }
});

GCElement.prototype.__defineGetter__("disabled", function() {
  return !!this.options.disabled;
});

GCElement.prototype.set = function(value) {}
GCElement.prototype.get = function(value) {}

/** GCElement.Element generic **/

GCElement.Element = function(options) {
  this.options = options;
  this.fragment = document.createDocumentFragment();
  this.optionElement = null;
  this.observer = new gcCore.GenericObserver();
  
  var built = false;
  this.getElement = function() {
    if(!built) {
      this.build();
      built = true;
    }
    return this.fragment;
  }
  this.getOptionElement = function() {
    if(!built) {
      this.build();
      built = true;
    }
    return this.optionElement;
  }
}

GCElement.Element.prototype.modified = function() {
  this.observer.fire("modified");
}

/** GCElement.Label extends GCElement.Element **/

GCElement.Label = function(options) {
  GCElement.Element.call(this, options);
}

GCElement.Label.extend(GCElement.Element);

GCElement.Label.prototype.build = function() {
  var label = document.createElement("label");
  label.setAttribute("value", this.options.value);
  label.setAttribute("control", this.options.control);
  label.setAttribute("class", "optionLabel");
  this.fragment.appendChild(label);
}

/** GCElement.Group extends GCElement.Element **/

GCElement.Group = function(options) {
  GCElement.Element.call(this, options);
}

GCElement.Group.extend(GCElement.Element);

GCElement.Group.prototype.build = function() {
  var element = document.createElement("groupbox");
  var caption = document.createElement("caption");
  caption.setAttribute("label", this.options.label.value);
  element.appendChild(caption);
  var innergroup = document.createElement("vbox");
  innergroup.setAttribute("flex", "1");
  element.appendChild(innergroup);
  this.optionElement = element;
  this.fragment.appendChild(element);
}

/** GCElement.Checkbox extends GCElement.Element  **/

GCElement.Checkbox = function(options) {
  GCElement.Element.call(this, options);
}
GCElement.Checkbox.extend(GCElement.Element);

GCElement.Checkbox.prototype.build = function() {
  var element = document.createElement("checkbox");
  element.setAttribute("label", this.options.label.value);
  element.addEventListener("command", this.modified.bind(this), false);
  this.optionElement = element;
  this.fragment.appendChild(element);
}

/** GCElement.Textbox extends GCElement.Element  **/

GCElement.Textbox = function(options) {
  GCElement.Element.call(this, options);
}

GCElement.Textbox.extend(GCElement.Element);

GCElement.Textbox.prototype.build = function() {
  var element = document.createElement("textbox");
  element.setAttribute("type", this.options.type);
  if(is_defined(this.options.size)) {
    element.setAttribute("size", this.options.size);
  }
  else {
    element.setAttribute("flex", "1");
  }
  element.addEventListener("keyup", this.modified.bind(this), false);
  element.addEventListener("command", this.modified.bind(this), false);
  this.optionElement = element;
  this.fragment.appendChild(new GCElement.Label(this.options.label).getElement());
  this.fragment.appendChild(element);
}

/** GCElement.Menulist extends GCElement.Element  **/

GCElement.Menulist = function(options) {
  GCElement.Element.call(this, options);
}

GCElement.Menulist.extend(GCElement.Element);

GCElement.Menulist.prototype.build = function() {
  var select = new Array,
      values = this.options.values,
      element = document.createElement("menulist"),
      menupopup = document.createElement("menupopup"),
      menuitem;
  
  for (var i = 0, l = values.length; i < l; i++) {
    menuitem = document.createElement("menuitem");
    menuitem.setAttribute("crop", "end");
    menuitem.setAttribute("label", values[i].label);
    menuitem.setAttribute("value", values[i].value);
    menupopup.appendChild(menuitem);
  }
  element.addEventListener("command", this.modified.bind(this), false);
  element.appendChild(menupopup);
  this.optionElement = element;
  this.fragment.appendChild(new GCElement.Label(this.options.label).getElement());
  this.fragment.appendChild(element);
}

/** GCElement.Colorpicker extends GCElement.Element  **/

GCElement.Colorpicker = function(options) {
  GCElement.Element.call(this, options);
}

GCElement.Colorpicker.extend(GCElement.Element);

GCElement.Colorpicker.prototype.build = function() {
  var element = document.createElement("colorpicker");
  element.setAttribute("type", "button");
  element.addEventListener("change", this.modified.bind(this), false);
  this.optionElement = element;
  this.fragment.appendChild(new GCElement.Label(this.options.label).getElement());
  this.fragment.appendChild(element);
}

/** GCElement.Radiogroup extends GCElement.Element  **/

GCElement.Radiogroup = function(options) {
  GCElement.Element.call(this, options);
}

GCElement.Radiogroup.extend(GCElement.Element);

GCElement.Radiogroup.prototype.build = function() {
  var element = document.createElement("radiogroup"),
      values = this.options.values,
      radio;
  
  for(var i = 0, l = values.length; i < l; i++) {
    radio = document.createElement("radio");
    radio.setAttribute("label", values[i].label);
    radio.setAttribute("value", values[i].value);
    element.appendChild(radio);
  }
  element.addEventListener("command", this.modified.bind(this), false);
  this.optionElement = element;
  this.fragment.appendChild(element);
}
