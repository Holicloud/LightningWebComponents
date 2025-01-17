import { setImmediate } from "timers";
import { createElement } from "@lwc/engine-dom";

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

async function assertElementIsAccesible(element) {
  jest.useRealTimers();
  await expect(element).toBeAccessible();
  jest.useFakeTimers();
}

async function assertElementIsNotAccesible(element) {
  jest.useRealTimers();
  await expect(element).not.toBeAccessible();
  jest.useFakeTimers();
}

function excuteAfterRender(callback) {
  // eslint-disable-next-line @lwc/lwc/no-async-operation
  setTimeout(callback, 0);
}

class ElementBuilder {
  defaultApiProps = {};

  constructor(descriptor, componentReference) {
    this.descriptor = descriptor;
    this.componentReference = componentReference;
  }

  setDefaultApiProperties(defaultApiProps) {
    this.defaultApiProps = defaultApiProps;
    return this;
  }

  build(props = {}, options = {}) {
    const { addToDOM = true } = options;
    const element = createElement(this.descriptor, {
      is: this.componentReference
    });
    Object.assign(element, this.defaultApiProps, props);

    if (addToDOM) {
      document.body.appendChild(element);
    }

    return element;
  }
}

export {
  getByDataId,
  flushPromises,
  resetDOM,
  addToDOM,
  removeFromDOM,
  assertElementIsAccesible,
  assertElementIsNotAccesible,
  excuteAfterRender,
  ElementBuilder
};
