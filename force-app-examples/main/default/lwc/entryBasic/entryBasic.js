import { LightningElement } from "lwc";

export default class EntryBasic extends LightningElement {
  options = {
    tesla: "Tesla electric vehicles",
    bmw: "BMW luxury cars",
    audi: "Audi premium automobiles"
  };

  cars = ["tesla", "audi", "bolvo"];
}
