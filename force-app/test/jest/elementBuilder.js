import { createElement } from "@lwc/engine-dom";
import {
  flushPromises,
  restoreLwcDomWarnings,
  suppressLwcDomWarnings
} from "test/utils";

import { deepMerge } from "c/utils";

export default class ElementBuilder {
  config = {
    defaultApiProps: {},
    appendChild: true,
    mergeProperties: true,
    flushAfter: true,
    parentNode: document.body
  };

  constructor(descriptor, componentReference, config = {}) {
    this.descriptor = descriptor;
    this.componentReference = componentReference;
    Object.assign(this.config, config);
  }

  setConfig(config = {}) {
    return new ElementBuilder(this.descriptor, this.componentReference, deepMerge(this.config, config));
  }

  async build(overwrite = {}) {
    const {
      appendChild,
      defaultApiProps,
      flushAfter,
      mergeProperties,
      parentNode
    } = this.config;

    const element = createElement(this.descriptor, {
      is: this.componentReference
    });

    if (mergeProperties) {
      const mergedProps = deepMerge(defaultApiProps, overwrite);
      Object.assign(element, mergedProps);
    } else {
      Object.assign(element, defaultApiProps, overwrite);
    }

    if (appendChild) {
      if (parentNode === document.body) {
        parentNode.appendChild(element);
      } else {
        suppressLwcDomWarnings();
        parentNode.appendChild(element);
        restoreLwcDomWarnings();
      }
    }

    if (flushAfter) {
      await flushPromises();
    }

    return element;
  }
}
