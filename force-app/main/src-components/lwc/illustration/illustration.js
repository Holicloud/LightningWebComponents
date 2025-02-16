import { LightningElement, api } from "lwc";
import { classSet, isNotBlank } from "c/utils";
import goingCamping from "./goingCamping.html";
import maintenance from "./maintenance.html";
import desert from "./desert.html";
import openRoad from "./openRoad.html";
import noAccess from "./noAccess.html";
import noConnection from "./noConnection.html";
import notAvailableInLightning from "./notAvailableInLightning.html";
import pageNotAvailable from "./pageNotAvailable.html";
import walkthroughNotAvailable from "./walkthroughNotAvailable.html";
import fishingDeals from "./fishingDeals.html";
import lakeMountain from "./lakeMountain.html";
import noEvents from "./noEvents.html";
import noTask from "./noTask.html";
import setup from "./setup.html";
import goneFishing from "./goneFishing.html";
import noAccess2 from "./noAccess2.html";
import noContent from "./noContent.html";
import noPreview from "./noPreview.html";
import preview from "./preview.html";
import research from "./research.html";

const TEMPLATE_BY_VARIANT = Object.freeze({
  "going-camping": goingCamping,
  maintenance: maintenance,
  desert: desert,
  "open-road": openRoad,
  "no-access": noAccess,
  "no-connection": noConnection,
  "not-available-in-lightning": notAvailableInLightning,
  "page-not-available": pageNotAvailable,
  "walkthrough-not-available": walkthroughNotAvailable,
  "fishing-deals": fishingDeals,
  "lake-mountain": lakeMountain,
  "no-events": noEvents,
  "no-task": noTask,
  setup: setup,
  "gone-fishing": goneFishing,
  "no-access-2": noAccess2,
  "no-content": noContent,
  "no-preview": noPreview,
  preview: preview,
  research: research
});

const DEFAULT_VARIANT = "desert";

const SIZES = Object.freeze({
  SMALL: "small",
  LARGE: "large"
});

export default class Illustration extends LightningElement {
  @api title;
  @api size;
  @api hideIllustration = false;
  @api primaryColor;
  @api secondaryColor;
  @api primaryStroke;
  @api secondaryStroke;

  @api
  get variant() {
    return this._variant;
  }
  set variant(value) {
    this._variant = TEMPLATE_BY_VARIANT[value] ? value : DEFAULT_VARIANT;
  }

  _variant = DEFAULT_VARIANT;

  get classes() {
    return classSet("slds-illustration")
      .add({ "slds-illustration_small": this.size === SIZES.SMALL })
      .add({ "slds-illustration_large": this.size === SIZES.LARGE })
      .toString();
  }

  get svgClasses() {
    return classSet("slds-illustration__svg")
      .add({ "slds-hide": this.hideIllustration })
      .toString();
  }

  get titleClasses() {
    return classSet("slds-text-heading_medium")
      .add({ "slds-illustration__header": this.size === SIZES.LARGE })
      .toString();
  }

  render() {
    return TEMPLATE_BY_VARIANT[this.variant];
  }

  renderedCallback() {
    if (!this.hasRender) {
      this.hasRender = true;
      this.setProperty(
        this.primaryColor,
        ".slds-illustration__fill-primary",
        "fill"
      );
      this.setProperty(
        this.secondaryColor,
        ".slds-illustration__fill-secondary",
        "fill"
      );
      this.setProperty(
        this.primaryStroke,
        ".slds-illustration__stroke-primary",
        "stroke"
      );
      this.setProperty(
        this.secondaryStroke,
        ".slds-illustration__stroke-secondary",
        "stroke"
      );
    }
  }

  setProperty(value, target, property) {
    [...this.template.querySelectorAll(target)].forEach((element) => {
      if (isNotBlank(value)) {
        element.style.setProperty(property, value);
      }
    });
  }
}

export { SIZES, DEFAULT_VARIANT, TEMPLATE_BY_VARIANT };
