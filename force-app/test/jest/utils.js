import { setImmediate } from "timers";
import { createElement } from "@lwc/engine-dom";

function getByDataId(element, dataId, all = false) {
  const selector = `[data-id="${dataId}"]`;
  return all
    ? element.shadowRoot.querySelectorAll(selector)
    : element.shadowRoot.querySelector(selector);
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

function mockFunction(element, name, implementation = () => {}) {
  const mockedFunction = jest.fn(implementation);
  element.addEventListener(name, mockedFunction);
  return mockedFunction;
}

class ElementBuilder {
  defaultApiProps = {};
  addToDOM = true;
  flushPromisesAfter = true;

  constructor(descriptor, componentReference) {
    this.descriptor = descriptor;
    this.componentReference = componentReference;
  }

  addToDOM(value) {
    this.addToDOM = value;
    return this;
  }

  flushPromises(value) {
    this.flushPromisesAfter = value;
    return this;
  }

  setDefaultApiProperties(defaultApiProps) {
    Object.assign(this.defaultApiProps, defaultApiProps);
    return this;
  }

  async build(props = {}) {
    const element = createElement(this.descriptor, {
      is: this.componentReference
    });
    Object.assign(element, this.defaultApiProps, props);

    if (this.addToDOM) {
      document.body.appendChild(element);
      if (this.flushPromisesAfter) {
        await flushPromises();
      }
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
  ElementBuilder,
  mockFunction
};
