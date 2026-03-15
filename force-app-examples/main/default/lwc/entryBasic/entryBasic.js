import { LightningElement } from "lwc";

export default class EntryBasic extends LightningElement {
  cars = ["tesla", "audi", "bolvo"];

  options = {
    tesla: "Tesla electric vehicles",
    bmw: "BMW luxury cars",
    audi: "Audi premium automobiles"
  };
}
