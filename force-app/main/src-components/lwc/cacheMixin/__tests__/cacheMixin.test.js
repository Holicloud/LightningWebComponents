import { CacheMixin } from "c/cacheMixin";
import { LightningElement, api } from "lwc";
import { ElementBuilder, flushPromises, removeChildren } from "test/utils";

const disconnectMock = jest.fn();

class Component extends CacheMixin(LightningElement, {
  cacheable: ["value"],
  componentName: "testComponent"
}) {
  isCacheDisabled = true;
  value = "";

  @api clearCache() {
    this[CacheMixin.Clear]();
  }

  @api configure() {
    this[CacheMixin.Config]();
  }

  @api getValue() {
    return this.value;
  }

  @api setValue(val) {
    this.value = val;
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    disconnectMock();
  }
}

class LocalComponent extends CacheMixin(LightningElement, {
  cacheable: ["value"],
  componentName: "localComponent",
  storage: "local"
}) {
  isCacheDisabled = true;
  value = "";

  @api clearCache() {
    this[CacheMixin.Clear]();
  }

  @api configure() {
    this[CacheMixin.Config]();
  }

  @api getValue() {
    return this.value;
  }

  @api setValue(val) {
    this.value = val;
  }
}

describe("c-cache-mixin", () => {
  const elementBuilder = new ElementBuilder("c-component", Component);
  const localElementBuilder = new ElementBuilder(
    "c-local-component",
    LocalComponent
  );

  afterEach(() => {
    removeChildren();
    jest.clearAllMocks();
    sessionStorage.clear();
    localStorage.clear();
    // Clear the internal registry for test isolation
    if (CacheMixin._registry) {
      CacheMixin._registry.clear();
    }
  });

  it("Should persist value to sessionStorage on disconnect", async () => {
    const element = await elementBuilder.build();
    document.body.appendChild(element);

    element.isCacheDisabled = false;
    element.configure();
    element.setValue("Hello World");

    document.body.removeChild(element);
    await flushPromises();

    expect(disconnectMock).toHaveBeenCalled();

    const stored = JSON.parse(sessionStorage.getItem("testComponent"));
    expect(stored).not.toBeNull();
    expect(stored.props.value).toBe("Hello World");
    expect(stored.expiresAt).toBeGreaterThan(Date.now());
  });

  it("Should restore cached value on Config", async () => {
    sessionStorage.setItem(
      "testComponent",
      JSON.stringify({
        props: { value: "Cached Value" },
        expiresAt: Date.now() + 60 * 60 * 1000
      })
    );

    const element = await elementBuilder.build();
    document.body.appendChild(element);
    element.isCacheDisabled = false;
    element.configure();

    expect(element.getValue()).toBe("Cached Value");
    document.body.removeChild(element);
    await flushPromises();
  });

  it("Should clear expired cache entries", async () => {
    sessionStorage.setItem(
      "testComponent",
      JSON.stringify({
        props: { value: "Expired" },
        expiresAt: Date.now() - 1000
      })
    );

    const element = await elementBuilder.build();
    document.body.appendChild(element);
    element.isCacheDisabled = false;
    element.configure();

    expect(element.getValue()).toBe("");
    expect(sessionStorage.getItem("testComponent")).toBeNull();
    document.body.removeChild(element);
    await flushPromises();
  });

  it("Should handle duplicate component keys", async () => {
    const element1 = await elementBuilder.build();
    document.body.appendChild(element1);
    element1.isCacheDisabled = false;
    element1.configure();
    element1.setValue("First");

    const element2 = await elementBuilder.build();
    document.body.appendChild(element2);
    element2.isCacheDisabled = false;
    element2.configure();

    // Second component should not overwrite on disconnect
    document.body.removeChild(element2);
    await flushPromises();
    expect(sessionStorage.getItem("testComponent")).toBeNull();

    // First component should persist
    document.body.removeChild(element1);
    await flushPromises();
    const stored = JSON.parse(sessionStorage.getItem("testComponent"));
    expect(stored.props.value).toBe("First");
  });

  it("Should use cacheId to differentiate keys", async () => {
    const element = await elementBuilder.build({ cacheId: "abc" });
    document.body.appendChild(element);
    element.isCacheDisabled = false;
    element.configure();
    element.setValue("WithId");
    document.body.removeChild(element);
    await flushPromises();

    const stored = JSON.parse(sessionStorage.getItem("testComponent-abc"));
    expect(stored).not.toBeNull();
    expect(stored.props.value).toBe("WithId");
  });

  it("Should clear cache manually via Clear symbol", async () => {
    sessionStorage.setItem(
      "testComponent",
      JSON.stringify({
        props: { value: "ToDelete" },
        expiresAt: Date.now() + 60 * 60 * 1000
      })
    );

    const element = await elementBuilder.build();
    document.body.appendChild(element);
    element.clearCache();

    expect(sessionStorage.getItem("testComponent")).toBeNull();
    document.body.removeChild(element);
  });

  it("Should use localStorage when storage is 'local'", async () => {
    const element = await localElementBuilder.build();
    document.body.appendChild(element);
    element.isCacheDisabled = false;
    element.configure();
    element.setValue("Local Value");
    document.body.removeChild(element);
    await flushPromises();

    const stored = JSON.parse(localStorage.getItem("localComponent"));
    expect(stored).not.toBeNull();
    expect(stored.props.value).toBe("Local Value");
    expect(sessionStorage.getItem("localComponent")).toBeNull();
  });

  it("Should restore from localStorage when storage is 'local'", async () => {
    localStorage.setItem(
      "localComponent",
      JSON.stringify({
        props: { value: "From Local" },
        expiresAt: Date.now() + 60 * 60 * 1000
      })
    );

    const element = await localElementBuilder.build();
    document.body.appendChild(element);
    element.isCacheDisabled = false;
    element.configure();

    expect(element.getValue()).toBe("From Local");
    document.body.removeChild(element);
    await flushPromises();
  });

  it("Should throw if componentName is missing", () => {
    expect(() => {
      CacheMixin(LightningElement, {
        cacheable: ["value"]
      });
    }).toThrow("componentName is required");
  });

  it("Should throw if cacheable is not an array", () => {
    expect(() => {
      CacheMixin(LightningElement, {
        componentName: "test",
        cacheable: "invalid"
      });
    }).toThrow("cacheable must be an array");
  });

  it("Should throw if storage type is invalid", () => {
    expect(() => {
      CacheMixin(LightningElement, {
        componentName: "test",
        storage: "invalid"
      });
    }).toThrow('storage must be "session" or "local"');
  });

  it("Should throw if Base is not a LightningElement", () => {
    expect(() => {
      CacheMixin(class NotAnElement {}, {
        componentName: "test"
      });
    }).toThrow("must be an Element type");
  });

  it("Should handle empty sessionStorage gracefully", async () => {
    const element = await elementBuilder.build();
    document.body.appendChild(element);
    element.isCacheDisabled = false;
    element.configure();

    expect(element.getValue()).toBe("");
    document.body.removeChild(element);
    await flushPromises();
  });

  it("Should be enabled by default (isCacheDisabled = false)", async () => {
    // Inherited from mixin, not overridden by Component class which we changed above
    // Wait, if I changed Component class to have isCacheDisabled = true, I need a new class or use the mixin directly
    class DefaultComponent extends CacheMixin(LightningElement, {
      componentName: "defaultComponent"
    }) {}
    const defaultElementBuilder = new ElementBuilder(
      "c-default-component",
      DefaultComponent
    );
    const elementD = await defaultElementBuilder.build();
    expect(elementD.isCacheDisabled).toBe(false);
  });
});
