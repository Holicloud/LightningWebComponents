import { CacheMixin } from "c/cacheMixin";
import { LightningElement, api } from "lwc";
import { ElementBuilder, flushPromises, removeChildren } from "test/utils";

const disconnectMock = jest.fn();

class Component extends CacheMixin(LightningElement, {
  cacheable: ["value"],
  componentName: "testComponent"
}) {
  value = "";

  @api clearCache() {
    this[CacheMixin.Clear]();
  }

  @api clearAll() {
    this[CacheMixin.ClearAll]();
  }

  @api configure() {
    this[CacheMixin.Config]();
  }

  @api getValue() {
    return this.value;
  }

  connectedCallback() {
    this[CacheMixin.Disable]();
  }

  @api setValue(val) {
    this.value = val;
  }

  @api enableCache() {
    this[CacheMixin.Enable]();
  }

  @api disableCache() {
    this[CacheMixin.Disable]();
  }

  @api setCacheId(id) {
    this[CacheMixin.SetUniqueIdentifier](id);
  }

  @api registerEventCallback(cb) {
    this[CacheMixin.OnEvent](cb);
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

  connectedCallback() {
    this[CacheMixin.Disable]();
  }

  @api setValue(val) {
    this.value = val;
  }

  @api enableCache() {
    this[CacheMixin.Enable]();
  }

  @api disableCache() {
    this[CacheMixin.Disable]();
  }

  @api setCacheId(id) {
    this[CacheMixin.SetUniqueIdentifier](id);
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

    element.enableCache();
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
    element.enableCache();
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
    element.enableCache();
    element.configure();

    expect(element.getValue()).toBe("");
    expect(sessionStorage.getItem("testComponent")).toBeNull();
    document.body.removeChild(element);
    await flushPromises();
  });

  it("Should handle duplicate component keys", async () => {
    const element1 = await elementBuilder.build();
    document.body.appendChild(element1);
    element1.enableCache();
    element1.configure();
    element1.setValue("First");

    const element2 = await elementBuilder.build();
    document.body.appendChild(element2);
    element2.enableCache();
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
    const element = await elementBuilder.build();
    document.body.appendChild(element);
    element.setCacheId("abc");
    element.enableCache();
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
    element.enableCache();
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
    element.enableCache();
    element.configure();

    expect(element.getValue()).toBe("From Local");
    document.body.removeChild(element);
    await flushPromises();
  });

  it("Should clear all cache entries for component via ClearAll symbol", async () => {
    sessionStorage.setItem(
      "testComponent-1",
      JSON.stringify({ props: { value: "1" }, expiresAt: Date.now() + 10000 })
    );
    sessionStorage.setItem(
      "testComponent-2",
      JSON.stringify({ props: { value: "2" }, expiresAt: Date.now() + 10000 })
    );

    const element = await elementBuilder.build();
    document.body.appendChild(element);
    element.clearAll();

    expect(sessionStorage.getItem("testComponent-1")).toBeNull();
    expect(sessionStorage.getItem("testComponent-2")).toBeNull();
    document.body.removeChild(element);
  });

  it("Should dispatch detailed cache events via callback", async () => {
    const handler = jest.fn();
    const element = await elementBuilder.build();
    element.registerEventCallback(handler);
    document.body.appendChild(element);
    element.enableCache();

    // 1. Test Miss
    element.configure();
    expect(handler).toHaveBeenCalledWith(
      "cachemiss",
      expect.objectContaining({ componentName: "testComponent" })
    );
    handler.mockClear();
    CacheMixin._registry.clear();

    // 2. Test Hit
    sessionStorage.setItem(
      "testComponent",
      JSON.stringify({
        props: { value: "Hit" },
        expiresAt: Date.now() + 10000
      })
    );
    element.configure();
    expect(handler).toHaveBeenCalledWith(
      "cachehit",
      expect.objectContaining({ componentName: "testComponent" })
    );
    handler.mockClear();
    CacheMixin._registry.clear();

    // 3. Test Expire
    sessionStorage.setItem(
      "testComponent",
      JSON.stringify({
        props: { value: "Exp" },
        expiresAt: Date.now() - 1000
      })
    );
    element.configure();
    expect(handler).toHaveBeenCalledWith(
      "cacheexpire",
      expect.objectContaining({ componentName: "testComponent" })
    );

    document.body.removeChild(element);
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
    element.enableCache();
    element.configure();

    expect(element.getValue()).toBe("");
    document.body.removeChild(element);
    await flushPromises();
  });

  it("Should be enabled by default (isCacheDisabled = false)", async () => {
    // Update cacheable to match the property name used in DefaultComponent
    const DefaultComponentFixed = CacheMixin(LightningElement, {
      componentName: "defaultComponent",
      cacheable: ["val"]
    });
    class RealDefaultComponent extends DefaultComponentFixed {
      val = "";
      @api setValue(v) {
        this.val = v;
      }
    }

    const defaultElementBuilder = new ElementBuilder(
      "c-default-component",
      RealDefaultComponent
    );
    const elementD = await defaultElementBuilder.build();
    document.body.appendChild(elementD);
    elementD.setValue("DefaultActive");
    document.body.removeChild(elementD);
    await flushPromises();
    const stored = JSON.parse(sessionStorage.getItem("defaultComponent"));
    expect(stored).not.toBeNull();
    expect(stored.props.val).toBe("DefaultActive");
  });
});
