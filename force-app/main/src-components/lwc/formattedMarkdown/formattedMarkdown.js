/* eslint-disable @lwc/lwc/no-inner-html */
import { LightningElement, api } from "lwc";
import { isBlank, isNotBlank } from "c/utils";
import { loadStyle, loadScript } from "lightning/platformResourceLoader";
import markdown from "@salesforce/resourceUrl/markdown";

export default class FormattedMarkdown extends LightningElement {
  @api string;
  @api url;

  hasRender = false;

  async renderedCallback() {
    if (!this.hasRender) {
      this.hasRender = true;
      await Promise.all([
        loadScript(this, markdown + "/markdown.js"),
        loadStyle(this, markdown + "/markdown.css")
      ]);
    }

    if (isBlank(this.url) && isBlank(this.string)) {
      this.template.querySelector("pre").innerHTML = "";
    }

    if (isNotBlank(this.string)) {
      this.template.querySelector("pre").innerHTML = window.marked.parse(
        this.string
      );
    } else if (isNotBlank(this.url)) {
      const string = await (await fetch(this.url)).text();
      this.template.querySelector("pre").innerHTML =
        window.marked.parse(string);
    }
  }
}
