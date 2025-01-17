/* eslint-disable @lwc/lwc/no-inner-html */
import { LightningElement, api } from "lwc";
import { marked } from "./markdown";
import { excuteAfterRender } from "c/utils";

export default class lightndown extends LightningElement {
  _string;
  _url;

  @api
  get string() {
    return this._string;
  }
  set string(value) {
    this._string = value;
    this.updateContent();
  }

  @api
  get url() {
    return this._url;
  }
  set url(value) {
    this._url = value;
    this.updateContent();
  }

  connectedCallback() {
    this.updateContent();
  }

  setMarkdown(markdown) {
    // eslint-disable-next-line @lwc/lwc/no-inner-html
    this.template.querySelector("pre").innerHTML = marked.parse(markdown);
  }

  async updateContent() {
    if (!this.url && !this.string) {
      this.template.querySelector("pre").innerHTML = "";
    }

    let markdownString = this.string;

    if (this.url) {
      const response = await fetch(this.url);
      const markdown = await response.text();
      markdownString = markdown;
    }

    excuteAfterRender(() => this.setMarkdown(markdownString));
  }
}
