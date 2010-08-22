var GCIntElement = function(options) {
  GCElement.call(this, options);
}

gcCore.extendProto(GCIntElement, GCElement)

GCIntElement.prototype.build = function() {
  var element;
  switch(this.options.mode) {
    case "select":
      element = new GCElement.Menulist({
        "label": this.options.label,
        "values": this.options.validValues
      });
      break;
    case "radio":
      element = new GCElement.Radiogroup({
        "values": this.options.validValues
      });
      break;
    default:
      element = new GCElement.Textbox({
        "label": this.options.label,
        "type": "number"
      });
      break;
  }
  element.observer.add(function(topic) {
    switch(topic) {
      case "modified":
        this.observer.fire("modified");
        break;
    }
  }, this);
  this.elements.element = element;
  return element;
}

GCIntElement.prototype.set = function(value) {
  if(is_defined(this.options.wrapper.scripts.setValue)) {
    this.options.wrapper.scripts.setValue.call(this, value);
  }
  else {
    var element = this.elements.element.getOptionElement();
    this.value = value;
    GCIntElement.set(element, value, this.options);
  }
}

GCIntElement.prototype.get = function() {
  if(is_defined(this.options.wrapper.scripts.getValue)) {
    return this.options.wrapper.scripts.getValue.call(this);
  }
  else {
    var element = this.elements.element.getOptionElement();
    return GCIntElement.get(element, this.value, this.options);
  }
}

/* functions for setting/getting the values of Int elements */

GCIntElement.set = function(element, value, options) {
  switch(options.mode) {
    case "radio":
      for(var i = 0, l = options.validValues.length; i < l; i++) {
        if(options.validValues[i].value == value) {
          element.childNodes[i].setAttribute("selected", "true");
        }
      }
      break;
    case "select":
    default:
      gcCore.xulSetProperty(element, "value", value);
      break;
  }
}

GCIntElement.get = function(element, defaultValue, options) {
  switch (options.mode) {
    case "select":
      return (element.selectedItem ? element.selectedItem.value : defaultValue);
      break;
      
    case "radio":
    default:
      return (element.value || defaultValue);
      break;
  }
}