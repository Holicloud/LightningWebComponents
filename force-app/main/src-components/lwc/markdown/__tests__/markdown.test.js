import Markdown from "c/markdown";

import { ElementBuilder, removeChildren, getByDataId } from "test/utils";

const elementBuilder = new ElementBuilder("c-markdown", Markdown);
const INNER_HTML = "<h1>Hello World</h1>";

window.marked = {
  parse: jest.fn(() => INNER_HTML)
};

describe("c-markdown", () => {
  let element;

  const getContainer = () => getByDataId(element, "container");

  afterEach(() => {
    removeChildren();
  });

  it("should update html using markdown string", async () => {
    element = await elementBuilder.build({ string: "string" });

    // eslint-disable-next-line @lwc/lwc/no-inner-html
    expect(getContainer().innerHTML).toBe(INNER_HTML);
  });

  it("should update html using url", async () => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        text: () => Promise.resolve(INNER_HTML)
      })
    );

    element = await elementBuilder.build({ url: "string" });

    // eslint-disable-next-line @lwc/lwc/no-inner-html
    expect(getContainer().innerHTML).toBe(INNER_HTML);
  });
});
