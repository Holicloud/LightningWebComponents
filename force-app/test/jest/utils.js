import { setImmediate } from "timers";
import ElementBuilder from "./elementBuilder";

const LWC_DOM_MANUAL_WARNING = '`lwc:dom="manual"` directive.';
let lwcDomManualWarningMock = jest.fn();

function getByDataId(element, dataId) {
  const root = element?.shadowRoot || element;
  return root.querySelector(`[data-id="${dataId}"]`);
}

function getAllByDataId(element, dataId) {
  const root = element?.shadowRoot || element;
  return [...root.querySelectorAll(`[data-id="${dataId}"]`)];
}

async function flushPromises() {
  return new Promise((resolve) => setImmediate(resolve));
}

function removeChildren(root = document.body) {
  while (root.firstChild) {
    root.removeChild(root.firstChild);
  }
}

function appendChild(element, root = document.body) {
  root.appendChild(element);
}

function removeChild(element, root = document.body) {
  root.removeChild(element);
}

function createMockedEventListener(
  element,
  eventName,
  implementation = () => {}
) {
  const mockedFunction = jest.fn(implementation);
  element.addEventListener(eventName, mockedFunction);
  return mockedFunction;
}

const suppressLwcDomWarnings = () => {
  lwcDomManualWarningMock = jest
    .spyOn(console, "warn")
    .mockImplementation((message) => {
      if (!message.includes(LWC_DOM_MANUAL_WARNING)) {
        console.warn(message);
      }
    });
};

const restoreLwcDomWarnings = () => {
  lwcDomManualWarningMock?.mockRestore();
};

export {
  appendChild,
  createMockedEventListener,
  ElementBuilder,
  flushPromises,
  getAllByDataId,
  getByDataId,
  removeChild,
  removeChildren,
  restoreLwcDomWarnings,
  suppressLwcDomWarnings
};
