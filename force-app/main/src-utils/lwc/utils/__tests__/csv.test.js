import { CsvProccessor } from "c/utils";

describe("CsvProccessor", () => {
  let file;

  beforeEach(() => {
    file = new Blob(["header1,header2\nvalue1,value2\nvalue3,value4"], {
      type: "text/csv"
    });
  });

  it("should process CSV file and return records", async () => {
    const processor = new CsvProccessor(file);
    const result = await processor.getRecords();

    expect(result.records).toEqual([
      { header1: "value1", header2: "value2" },
      { header1: "value3", header2: "value4" }
    ]);
  });

  it("should apply header transformations", async () => {
    const processor = new CsvProccessor(file).setHeaderTranformations({
      header1: "newHeader1"
    });
    const result = await processor.getRecords();

    expect(result.records).toEqual([
      { newHeader1: "value1", header2: "value2" },
      { newHeader1: "value3", header2: "value4" }
    ]);
  });

  it("should handle file size limit", async () => {
    const largeFile = new Blob([new Array(99999999).join("a")], {
      type: "text/csv"
    });
    const processor = new CsvProccessor(largeFile);

    await expect(processor.getRecords()).rejects.toThrow(
      "File Cannot Be Larger Than 1.9073486328125"
    );
  });

  it("should handle custom separator", async () => {
    const customSeparatorFile = new Blob(["header1|header2\nvalue1|value2"], {
      type: "text/csv"
    });
    const processor = new CsvProccessor(customSeparatorFile).setSeparator("|");
    const result = await processor.getRecords();

    expect(result.records).toEqual([{ header1: "value1", header2: "value2" }]);
  });

  it("should call forEachRecord callback for each record", async () => {
    const mockCallback = jest.fn();
    const processor = new CsvProccessor(file).doForEachRecord(mockCallback);
    await processor.getRecords();

    expect(mockCallback).toHaveBeenCalledTimes(2);
    expect(mockCallback).toHaveBeenCalledWith({
      header1: "value1",
      header2: "value2"
    });
    expect(mockCallback).toHaveBeenCalledWith({
      header1: "value3",
      header2: "value4"
    });
  });
});
