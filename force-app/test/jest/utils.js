import { setImmediate } from "timers";
import { createElement } from "lwc";

export function getByDataId(element, dataId) {
  return element.shadowRoot.querySelector(`[data-id="${dataId}"]`);
}

export async function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

export function resetDOM() {
  while (document.body.firstChild) {
    document.body.removeChild(document.body.firstChild);
  }
}

export function addToDOM(element) {
  document.body.appendChild(element);
}

export function removeFromDOM(element) {
  document.body.removeChild(element);
}

export class ElementBuilder {
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
