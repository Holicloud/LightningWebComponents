import DatatablePlus from "c/datatablePlus";
import { ElementBuilder } from "test/utils";
const builder = new ElementBuilder("c-datatable-plus", DatatablePlus);

describe("c-datatable-plus", () => {
  it("should update records and use customTypes", async () => {
    const element = await builder.build({
      records: [
        { id: 1, name: "test", details: { age: 25, city: "London" } },
        { id: 2, name: "test2", meta: { active: true, score: 90 } },
        { id: 3, name: "test3" },
        { id: 4, name: "test4" },
        { id: 5, name: "test5" },
        { id: 6, name: "test6" }
      ]
    });
    expect(element.data[0]["details.age"]).toBe(25);
    expect(element.data[1]["meta.score"]).toBe(90);
  });
});
