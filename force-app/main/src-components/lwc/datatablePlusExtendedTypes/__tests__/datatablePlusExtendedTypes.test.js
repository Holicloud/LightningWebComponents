import DatatablePlusExtendedTypes, {
  TYPES
} from "c/datatablePlusExtendedTypes";
import { ElementBuilder } from "test/utils";

const builder = new ElementBuilder(
  "c-datatable-plus-extended-types",
  DatatablePlusExtendedTypes
);
describe("c-datatable-plus-extended-types", () => {
  it("should return data types", async () => {
    const element = await builder.build();
    expect(element.getDataTypes()).toBe(TYPES);
  });
});
