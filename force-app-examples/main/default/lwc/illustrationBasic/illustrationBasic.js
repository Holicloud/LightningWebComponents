import { LightningElement } from "lwc";

export default class IllustrationBasic extends LightningElement {
  size = "small";
  variant = "desert";
  hideIllustration = false;

  sizes = [
    { label: "No Value(Default container size)" },
    { label: "Small", value: "small" },
    { label: "Large", value: "large" }
  ];

  handleSizeChange(event) {
    this.size = event.detail.value;
  }

  variants = [
    { label: "No Value (Defaulted to desert)", value: undefined },
    { label: "Going Camping", value: "going-camping" },
    { label: "Maintenance", value: "maintenance" },
    { label: "Desert", value: "desert" },
    { label: "Open Road", value: "open-road" },
    { label: "No Access", value: "no-access" },
    { label: "No Connection", value: "no-connection" },
    {
      label: "Not Available In Lightning",
      value: "not-available-in-lightning"
    },
    { label: "Page Not Available", value: "page-not-available" },
    { label: "Walkthrough Not Available", value: "walkthrough-not-available" },
    { label: "Fishing Deals", value: "fishing-deals" },
    { label: "Lake Mountain", value: "lake-mountain" },
    { label: "No Events", value: "no-events" },
    { label: "No Task", value: "no-task" },
    { label: "Setup", value: "setup" },
    { label: "Gone Fishing", value: "gone-fishing" },
    { label: "No Access 2", value: "no-access-2" },
    { label: "No Content", value: "no-content" },
    { label: "No Preview", value: "no-preview" },
    { label: "Preview", value: "preview" },
    { label: "research", value: "research" }
  ];

  handleVariantChange(event) {
    this.variant = event.detail.value;
  }

  handleIllustrationChange(event) {
    this.hideIllustration = event.detail.checked;
  }
}
