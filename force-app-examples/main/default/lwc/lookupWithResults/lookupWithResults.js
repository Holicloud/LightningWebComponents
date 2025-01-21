import { LightningElement } from "lwc";
const RECORDS = [
  {
    id: "id1",
    title: "Santiago"
  },
  {
    id: "id2",
    title: "Nicolas",
    recentlyViewed: true
  },
  {
    id: "id3",
    title: "Johana"
  },
  {
    id: "id4",
    title: "Carmensa",
    recentlyViewed: true
  },
  {
    id: "id5",
    title: "Felipe"
  },
  {
    id: "id6",
    title: "Gracia"
  },
  {
    id: "id7",
    title: "John"
  },
  {
    id: "id8",
    title: "Cass",
    recentlyViewed: true
  }
];

export default class LookupWithResults extends LightningElement {
  value = ["id1", "id2"];

  searchHandler(config) {
    const { getDefault, getInitialSelection, rawSearchTerm, selectedIds } =
      config;
    if (getDefault) {
      return RECORDS.filter((record) => record.recentlyViewed);
    } else if (getInitialSelection) {
      return RECORDS.filter((record) => selectedIds.includes(record.id));
    }

    return RECORDS.filter((record) =>
      record.title.toLowerCase().includes(rawSearchTerm.toLowerCase())
    );
  }
}
