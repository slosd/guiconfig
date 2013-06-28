var GCCharElement = function(options) {
  GCElement.call(this, options);
}

gcCore.extendProto(GCCharElement, GCElement)

GCCharElement.prototype.build = function() {
  var element;
  switch(this.options.mode) {
    case "select":
      element = new GCElement.Menulist({
        "label": this.options.label,
        "values": this.options.validValues
      });
      break;
    case "color":
      element = new GCElement.Colorpicker({
        "label": this.options.label
      });
      this.addButton("color");
      break;
    case "file":
      this.addButton("file");
    default:
      element = new GCElement.Textbox({
        "label": this.options.label
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

GCCharElement.prototype.set = function(value) {
  if(is_defined(this.options.wrapper.scripts.setValue)) {
    this.options.wrapper.scripts.setValue.call(this, value);
  }
  else {
    var element = this.elements.element.getOptionElement();
    this.value = value;
    GCCharElement.set(element, value, this.options);
  }
}

GCCharElement.prototype.get = function() {
  if(is_defined(this.options.wrapper.scripts.getValue)) {
    return this.options.wrapper.scripts.getValue.call(this);
  }
  else {
    var element = this.elements.element.getOptionElement();
    return GCCharElement.get(element, null, this.options);
  }
}

/* functions for setting/getting the values of Char elements */

GCCharElement.set = function(element, value, options) {
  switch(options.mode) {
    case "color":
      gcCore.xulSetProperty(element, "color", value);
      break;
    case "select":
    default:
      gcCore.xulSetProperty(element, "value", value);
      break;
  }
}

GCCharElement.get = function(element, defaultValue, options) {
  switch(options.mode) {
    case "select":
      return element.selectedItem.value;
      break;
      
    case "color":
      return element.color;
      break;
      
    default:
      return element.value;
      break;
  }
}