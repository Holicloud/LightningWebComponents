import { EmpApiMixin } from "c/empApiMixin";
import {
  subscribe,
  unsubscribe,
  onError,
  setDebugFlag,
  isEmpEnabled
} from "lightning/empApi";
import publishEvent from "@salesforce/apex/EmpApiMixinController.publishEvent";
import { LightningElement, api } from "lwc";
import { ElementBuilder, removeChildren } from "test/utils";

jest.mock(
  "@salesforce/apex/EmpApiMixinController.publishEvent",
  () => ({
    default: jest.fn()
  }),
  { virtual: true }
);

const disconectMock = jest.fn();

class Component extends EmpApiMixin(LightningElement) {
  disconnectedCallback() {
    super.disconnectedCallback();
    disconectMock();
  }

  @api enableDebug() {
    this[EmpApiMixin.SetDebugFlag](true);
  }

  @api async isEnabled() {
    return this[EmpApiMixin.IsEmpEnabled]();
  }

  @api async pub(params) {
    return this[EmpApiMixin.Publish](params);
  }

  @api registerError(listener) {
    this[EmpApiMixin.OnError](listener);
  }

  @api async sub(params) {
    return this[EmpApiMixin.Subscribe](params);
  }

  @api unsub(channel) {
    this[EmpApiMixin.Unsubscribe](channel);
  }
}

describe("c-emp-api-mixin", () => {
  const elementBuilder = new ElementBuilder("c-component", Component);

  afterEach(() => {
    removeChildren();
    jest.clearAllMocks();
  });

  it("Should publish a platform event", async () => {
    const element = await elementBuilder.build();

    // Missing channel
    await expect(element.pub({ fields: {} })).rejects.toThrow(
      "Missing parameter: channel is required"
    );

    const mockResult = { success: true };
    publishEvent.mockResolvedValueOnce(mockResult);

    const result = await element.pub({
      channel: "/event/MyPlatformEvent__e",
      fields: { Message__c: "Hello" }
    });

    expect(publishEvent).toHaveBeenCalledWith({
      eventName: "MyPlatformEvent__e",
      payload: { Message__c: "Hello" }
    });
    expect(result).toEqual(mockResult);
  });

  const subscribeToChannel = async (element) => {
    const mockSubscription = { id: 123, channel: "/event/Test__e" };
    subscribe.mockResolvedValueOnce(mockSubscription);

    const listener = jest.fn();

    const sub = await element.sub({
      channel: "/event/Test__e",
      listener
    });

    return { listener, mockSubscription, sub };
  };

  it("Should subscribe to channel", async () => {
    const element = await elementBuilder.build();

    // Test missing channel error
    await expect(element.sub({ listener: jest.fn() })).rejects.toThrow(
      "Missing parameter: channel is required"
    );

    // Test listener missing error
    await expect(element.sub({ channel: "/event/Test__e" })).rejects.toThrow(
      "Invalid listener"
    );

    const { sub, listener, mockSubscription } =
      await subscribeToChannel(element);

    expect(subscribe).toHaveBeenCalledWith("/event/Test__e", -1, listener);
    expect(sub).toEqual(mockSubscription);
  });

  it("Should unsubscribe from channel", async () => {
    const element = await elementBuilder.build();
    document.body.appendChild(element);

    const { mockSubscription } = await subscribeToChannel(element);

    unsubscribe.mockImplementationOnce((subscription, callback) => {
      callback({ successful: true });
    });

    element.unsub("/event/Test__e");

    expect(unsubscribe).toHaveBeenCalledWith(
      mockSubscription,
      expect.any(Function)
    );
  });

  it("Should unsubscribe all on decoupled disconnectedCallback", async () => {
    const element = await elementBuilder.build();
    document.body.appendChild(element);

    await subscribeToChannel(element);

    unsubscribe.mockImplementationOnce((subscription, callback) => {
      callback({ successful: true });
    });

    document.body.removeChild(element);

    expect(disconectMock).toHaveBeenCalled();
    expect(unsubscribe).toHaveBeenCalled();
  });

  it("Should call setDebugFlag", async () => {
    const element = await elementBuilder.build();
    element.enableDebug();
    expect(setDebugFlag).toHaveBeenCalledWith(true);
  });

  it("Should call onError", async () => {
    const element = await elementBuilder.build();

    expect(() => {
      element.registerError(null);
    }).toThrow("Invalid listener");

    const errorListener = jest.fn();
    element.registerError(errorListener);
    expect(onError).toHaveBeenCalledWith(errorListener);
  });

  it("Should call isEmpEnabled", async () => {
    const element = await elementBuilder.build();
    isEmpEnabled.mockResolvedValueOnce(true);
    const result = await element.isEnabled();
    expect(isEmpEnabled).toHaveBeenCalled();
    expect(result).toBe(true);
  });
});
