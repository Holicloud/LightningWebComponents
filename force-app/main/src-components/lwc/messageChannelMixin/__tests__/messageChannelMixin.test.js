import { LightningElement, api } from "lwc";
import { ElementBuilder, removeChildren } from "test/utils";
import {
  publish,
  subscribe,
  unsubscribe,
  APPLICATION_SCOPE,
  MessageContext
} from "lightning/messageService";
import { MessageChannelMixin } from "c/messageChannelMixin";
import messageChannelA from "@salesforce/messageChannel/MessageChannelA__c";
import messageChannelB from "@salesforce/messageChannel/MessageChannelB__c";

const disconect = jest.fn();

class Component extends MessageChannelMixin(LightningElement) {
  @api sub(params) {
    this[MessageChannelMixin.Subscribe](params);
  }

  @api unsub(channel) {
    this[MessageChannelMixin.Unsubscribe](channel);
  }

  @api publish(params) {
    this[MessageChannelMixin.Publish](params);
  }

  disconnectedCallback() {
    disconect();
  }
}

const MessageContextData = Symbol("MessageContextData");

function assertUnsub() {
  expect(unsubscribe).toHaveBeenNthCalledWith(1, Symbol.for("firstSub"));
  expect(unsubscribe).toHaveBeenNthCalledWith(2, Symbol.for("secondSub"));
}

describe("c-message-channel-mixing", () => {
  const elementBuilder = new ElementBuilder("c-component", Component);

  afterEach(() => {
    removeChildren();
  });

  function subscribeToChannels(element) {
    subscribe.mockReturnValueOnce(Symbol.for("firstSub"));
    subscribe.mockReturnValueOnce(Symbol.for("secondSub"));

    element.sub({
      channel: messageChannelA,
      listener: jest.fn()
    });

    element.sub({
      channel: messageChannelB,
      listener: jest.fn(),
      subscriberOptions: {}
    });
  }

  it("Should publish to channels", async () => {
    const element = await elementBuilder.build();
    MessageContext.emit(MessageContextData);
    element.publish({
      channel: messageChannelA,
      payload: "published from A"
    });
    element.publish({
      channel: messageChannelB,
      payload: "published from B"
    });

    expect(publish).toHaveBeenNthCalledWith(
      1,
      MessageContextData,
      messageChannelA,
      "published from A"
    );
    expect(publish).toHaveBeenNthCalledWith(
      2,
      MessageContextData,
      messageChannelB,
      "published from B"
    );
  });

  it("Should subscribe to channels", async () => {
    const element = await elementBuilder.build();
    MessageContext.emit(MessageContextData);
    document.body.appendChild(element);
    subscribeToChannels(element);

    expect(subscribe).toHaveBeenNthCalledWith(
      1,
      MessageContextData,
      messageChannelA,
      expect.any(Function),
      expect.objectContaining({ scope: APPLICATION_SCOPE })
    );

    expect(subscribe).toHaveBeenNthCalledWith(
      2,
      MessageContextData,
      messageChannelB,
      expect.any(Function),
      expect.any(Object)
    );
  });

  it("Should unsubscribe to channels", async () => {
    const element = await elementBuilder.build();
    MessageContext.emit(MessageContextData);

    document.body.appendChild(element);
    subscribeToChannels(element);

    element.unsub(messageChannelA);
    element.unsub(messageChannelB);

    assertUnsub(element);
    expect(element).not.toBe(null);
  });

  it("Should unsubscribe on disconnectedCallback", async () => {
    const element = await elementBuilder.build();
    MessageContext.emit(MessageContextData);

    document.body.appendChild(element);
    subscribeToChannels(element);

    document.body.removeChild(element);

    expect(disconect).toHaveBeenCalled();
    assertUnsub();
  });
});
