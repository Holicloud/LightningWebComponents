import WizardStep, { IS_ACTIVE_ATTRIBUTE, SLDS_SHOW, SLDS_HIDE } from "c/wizardStep";
import { createElement } from "lwc";
import { setImmediate } from "timers";

describe("c-wizard-step", () => {
  async function flushPromises() {
    return new Promise((resolve) => setImmediate(resolve));
  }

  function getByDataId(element, dataId) {
    return element.shadowRoot.querySelector(`[data-id="${dataId}"]`);
  }

  function createWizardStep(props = {}) {
    const element = createElement("c-wizard-step", {
      is: WizardStep
    });
    Object.assign(element, props);
    return element;
  }

  const configMock = {
    isFirst: false,
    isLast: false,
    labels: {
      next: "Next Step",
      previous: "Previous Step",
      finish: "Complete"
    }
  };

  afterEach(() => {
    // The jsdom instance is shared across test cases in a single file so reset the DOM
    while (document.body.firstChild) {
      document.body.removeChild(document.body.firstChild);
    }
  });

  it("should dispatch register event on connectedCallback", async () => {
    const element = createWizardStep({
      name: "first-step",
      label: "First step"
    });
    const dispatchEventSpy = jest.spyOn(element, "dispatchEvent");
    document.body.appendChild(element);

    expect(dispatchEventSpy).toHaveBeenCalledTimes(1);
    const event = dispatchEventSpy.mock.calls[0][0];
    expect(event.type).toBe("register");
    expect(event.detail).toEqual({
      name: element.name,
      label: element.label,
      methods: {
        setActive: expect.any(Function),
        config: expect.any(Function),
        validate: expect.any(Function)
      }
    });
    event.detail.methods.config(configMock);

    await flushPromises();

    expect(getByDataId(element, "body")).toBeDefined();
  });

  it("This should test the previous button and next button", async () => {
    const element = createWizardStep({
      name: "first-step",
      label: "First step"
    });
    const dispatchEventSpy = jest.spyOn(element, "dispatchEvent");
    document.body.appendChild(element);

    const event = dispatchEventSpy.mock.calls[0][0];
    event.detail.methods.config(configMock);

    await flushPromises();

    const previous = getByDataId(element, "previous");

    expect(previous.label).toBe(configMock.labels.previous);
    previous.click();

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "previous"
      })
    );

    const next = getByDataId(element, "next");

    expect(next.label).toBe(configMock.labels.next);
    next.click();
    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "next"
      })
    );
  });

  it("should call 'unregister' with the correct name when the component is disconnected", async () => {
    const element = createWizardStep({
      name: "first-step",
      label: "First step"
    });
    const dispatchEventSpy = jest.spyOn(element, "dispatchEvent");
    document.body.appendChild(element);

    const event = dispatchEventSpy.mock.calls[0][0];
    event.detail.methods.config(configMock);

    await flushPromises();

    document.body.removeChild(element);

    expect(dispatchEventSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "unregister",
        detail: element.name
      })
    );
  });

  it("should hide next and previous buttons", async () => {
    const element = createWizardStep({
      name: "first-step",
      label: "First step",
      hidePreviousButton: true,
      hideNextButton: true
    });
    const dispatchEventSpy = jest.spyOn(element, "dispatchEvent");
    document.body.appendChild(element);

    const event = dispatchEventSpy.mock.calls[0][0];
    event.detail.methods.config(configMock);

    await flushPromises();
    
    document.body.removeChild(element);

    expect(getByDataId(element, "next")).toBeFalsy();
    expect(getByDataId(element, "previous")).toBeFalsy();
  });

  it("should hide/show when isActive", async () => {
    const element = createWizardStep({
      name: "first-step",
      label: "First step",
      isActive: false
    });
    const dispatchEventSpy = jest.spyOn(element, "dispatchEvent");
    document.body.appendChild(element);

    const event = dispatchEventSpy.mock.calls[0][0];
    event.detail.methods.config(configMock);

    await flushPromises();

    expect(element.getAttribute(IS_ACTIVE_ATTRIBUTE)).toBeFalsy();
    expect(element.classList[0]).toBe(SLDS_HIDE);
    
    element.isActive = true;
    
    expect(element.getAttribute(IS_ACTIVE_ATTRIBUTE)).toBeTruthy();
    expect(element.classList[0]).toBe(SLDS_SHOW);
  });
});
