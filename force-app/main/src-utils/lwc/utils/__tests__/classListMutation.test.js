import { classListMutation } from "c/utils";

describe("classListMutation", () => {
  let classList;

  beforeEach(() => {
    classList = {
      add: jest.fn(),
      remove: jest.fn()
    };
  });

  it("should add classes based on config", () => {
    const config = { "class-a": true, "class-b": false, "class-c": true };

    classListMutation(classList, config);

    expect(classList.add).toHaveBeenCalledWith("class-a");
    expect(classList.add).toHaveBeenCalledWith("class-c");
    expect(classList.remove).toHaveBeenCalledWith("class-b");
  });

  it("should remove classes based on config", () => {
    const config = { "class-a": false, "class-b": true, "class-c": false };

    classListMutation(classList, config);

    expect(classList.remove).toHaveBeenCalledWith("class-a");
    expect(classList.add).toHaveBeenCalledWith("class-b");
    expect(classList.remove).toHaveBeenCalledWith("class-c");
  });

  it("should not add or remove classes for invalid keys", () => {
    const config = { "": true };

    classListMutation(classList, config);

    expect(classList.add).not.toHaveBeenCalled();
    expect(classList.remove).not.toHaveBeenCalled();
  });
});
