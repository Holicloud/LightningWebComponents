import { setImmediate } from "timers";
import { createElement } from "lwc";

function getByDataId(element, dataId) {
  return element.shadowRoot.querySelector(`[data-id="${dataId}"]`);
}

async function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

function resetDOM() {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
}

function addToDOM(element) {
  document.body.appendChild(element);
}

function removeFromDOM(element) {
  document.body.removeChild(element);
}

class ElementBuilder {
  constructor(descriptor, componentReference) {
    this.descriptor = descriptor;
    this.componentReference = componentReference;
  }

  build(apiProps = {}) {
    const element = createElement(this.descriptor, {
      is: this.componentReference
    });
    Object.assign(element, { ...apiProps });
    return element;
  }
}


export {
  getByDataId,
  flushPromises,
  resetDOM,
  addToDOM,
  removeFromDOM,
  ElementBuilder
}