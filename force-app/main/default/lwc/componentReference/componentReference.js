const GIT_HUB_START =
  "https://github.com/santiagoparradev/LWC-RECIPES-SANTIAGO/tree/main";
const GIT_SOURCE_COMPONENTS =
  GIT_HUB_START + "/force-app/main/src-components/lwc/";
const GIT_APEX_RELIANT_SOURCE_COMPONENTS =
  GIT_HUB_START + "/force-app/main/src-components-with-apex/lwc/";
const GIT_EXAMPLES = GIT_HUB_START + "/force-app-examples/main/default/lwc/";
const GIT_APEX_RELIANT_EXAMPLES =
  GIT_HUB_START + "/force-app-examples/main/examples-with-apex/lwc/";

const TARGETS = Object.freeze({
  LIGHTNING_EXPERIENCE: "Lightning Experience",
  EXPERIENCE_BUILDER_SITES: "Experience Builder Sites",
  SALESFORCE_MOBILE_APP: "Salesforce Mobile App",
  STANDALONE_LIGHTNING_APP: "Standalone Lightning App",
  MOBILE_OFFLINE: "Mobile Offline"
});

export const COMPONENT_TYPES = {
  MIXIN: "Mixin",
  COMPONENT: "Component",
  APEX_RELIANT_COMPONENT: "Apex Reliant Component"
};

export const COMPONENTS = {
  C_EXPANDABLE_SECTION: {
    type: COMPONENT_TYPES.COMPONENT,
    descriptor: "c/expandableSection",
    label: "Expandable Section"
  },
  C_WIZARD: {
    type: COMPONENT_TYPES.COMPONENT,
    descriptor: "c/wizard",
    label: "Wizard"
  },
  C_WIZARD_STEP: {
    type: COMPONENT_TYPES.COMPONENT,
    descriptor: "c/wizardStep",
    label: "WizardStep"
  },
  C_MESSAGE_CHANNEL_MIXIN: {
    type: COMPONENT_TYPES.MIXIN,
    descriptor: "c/messageChannelMixin",
    label: "Message Channel"
  },
  C_ALERT: {
    type: COMPONENT_TYPES.COMPONENT,
    descriptor: "c/alert",
    label: "Alert"
  },
  C_LOOKUP: {
    type: COMPONENT_TYPES.COMPONENT,
    descriptor: "c/lookup",
    label: "Lookup"
  },
  C_APEX_LOOKUP: {
    type: COMPONENT_TYPES.APEX_RELIANT_COMPONENT,
    descriptor: "c/apexLookup",
    label: "apexLookup"
  },
  C_SUMMARY_DETAIL: {
    type: COMPONENT_TYPES.COMPONENT,
    descriptor: "c/summaryDetail",
    label: "Summary Detail"
  },
  C_ILLUSTRATION: {
    type: COMPONENT_TYPES.COMPONENT,
    descriptor: "c/illustration",
    label: "illustration"
  }
};

export const EXAMPLES = {
  [COMPONENTS.C_EXPANDABLE_SECTION.descriptor]: [
    {
      title: "Basic",
      description: "this is some sample",
      git: GIT_EXAMPLES + "expandableSectionBasic",
      constructor: () => import("c/expandableSectionBasic")
    }
  ],
  [COMPONENTS.C_WIZARD.descriptor]: [
    {
      title: "Basic",
      description: "this is some sample",
      git: GIT_EXAMPLES + "wizardBasic",
      constructor: () => import("c/wizardBasic")
    },
    {
      title: "With Variants",
      description: "Wizard with variants",
      git: GIT_EXAMPLES + "wizardVariants",
      constructor: () => import("c/wizardVariants")
    },
    {
      title: "Validation and Completion",
      description: "validate a step and execute and action on complete",
      git: GIT_EXAMPLES + "wizardAdvance",
      constructor: () => import("c/wizardAdvance")
    }
  ],
  [COMPONENTS.C_WIZARD_STEP.descriptor]: [
    {
      title: "Basic",
      description: "this is some sample",
      git: GIT_EXAMPLES + "wizardStepBasic",
      constructor: () => import("c/wizardStepBasic")
    }
  ],
  [COMPONENTS.C_ALERT.descriptor]: [
    {
      title: "Basic",
      description: "this is some sample",
      git: GIT_EXAMPLES + "alertBasic",
      constructor: () => import("c/alertBasic")
    }
  ],
  [COMPONENTS.C_MESSAGE_CHANNEL_MIXIN.descriptor]: [
    {
      title: "Basic",
      description: "this is some sample",
      git: GIT_EXAMPLES + "messageChannelMixinBasic",
      constructor: () => import("c/messageChannelMixinBasic")
    }
  ],
  [COMPONENTS.C_LOOKUP.descriptor]: [
    {
      title: "Basic",
      description: "this is some sample",
      git: GIT_EXAMPLES + "lookupBasic",
      constructor: () => import("c/lookupBasic")
    },
    {
      title: "With Results",
      description: "this is some sample",
      git: GIT_EXAMPLES + "lookupWithResults",
      constructor: () => import("c/lookupWithResults")
    }
  ],
  [COMPONENTS.C_APEX_LOOKUP.descriptor]: [
    {
      title: "apex lookup",
      description: "this is some sample",
      git: GIT_APEX_RELIANT_EXAMPLES + "apexLookupBasic",
      constructor: () => import("c/apexLookupBasic")
    },
    {
      title: "apex lookup multientry",
      description: "this is some sample",
      git: GIT_APEX_RELIANT_EXAMPLES + "apexLookupMultiEntry",
      constructor: () => import("c/apexLookupMultiEntry")
    }
  ],
  [COMPONENTS.C_SUMMARY_DETAIL.descriptor]: [
    {
      title: "Basic",
      description: "this is some sample",
      git: GIT_EXAMPLES + "summaryDetailBasic",
      constructor: () => import("c/summaryDetailBasic")
    }
  ],
  [COMPONENTS.C_ILLUSTRATION.descriptor]: [
    {
      title: "Basic",
      description: "",
      git: GIT_APEX_RELIANT_EXAMPLES + "illustrationBasic",
      constructor: () => import("c/illustrationBasic")
    },
    {
      title: "With custom title and colors",
      description: "custom title and colors",
      git: GIT_APEX_RELIANT_EXAMPLES + "illustrationAdvanced",
      constructor: () => import("c/illustrationAdvanced")
    }
  ]
};

export const HEADER_INFO = {
  [COMPONENTS.C_EXPANDABLE_SECTION.descriptor]: {
    git: GIT_SOURCE_COMPONENTS + "expandableSection",
    title: COMPONENTS.C_EXPANDABLE_SECTION.label,
    description:
      "Component that mimics behaviour of Expandable Section from slds",
    descriptor: COMPONENTS.C_EXPANDABLE_SECTION.descriptor,
    targets: [
      TARGETS.LIGHTNING_EXPERIENCE,
      TARGETS.EXPERIENCE_BUILDER_SITES,
      TARGETS.SALESFORCE_MOBILE_APP,
      TARGETS.STANDALONE_LIGHTNING_APP,
      TARGETS.MOBILE_OFFLINE
    ]
  },
  [COMPONENTS.C_WIZARD.descriptor]: {
    git: GIT_SOURCE_COMPONENTS + "wizard",
    title: COMPONENTS.C_WIZARD.label,
    description: "Its a wizard",
    descriptor: COMPONENTS.C_WIZARD.descriptor,
    targets: [TARGETS.LIGHTNING_EXPERIENCE]
  },
  [COMPONENTS.C_WIZARD_STEP.descriptor]: {
    git: GIT_SOURCE_COMPONENTS + "wizardStep",
    title: COMPONENTS.C_WIZARD_STEP.label,
    description: "Its a wizard",
    descriptor: COMPONENTS.C_WIZARD_STEP.descriptor,
    targets: [TARGETS.LIGHTNING_EXPERIENCE]
  },
  [COMPONENTS.C_ALERT.descriptor]: {
    git: GIT_SOURCE_COMPONENTS + "alert",
    title: COMPONENTS.C_ALERT.label,
    description: "Its a C_ALERT",
    descriptor: COMPONENTS.C_ALERT.descriptor,
    targets: [TARGETS.LIGHTNING_EXPERIENCE]
  },
  [COMPONENTS.C_LOOKUP.descriptor]: {
    git: GIT_SOURCE_COMPONENTS + "lookup",
    title: COMPONENTS.C_LOOKUP.label,
    description: "Its a C_LOOKUP",
    descriptor: COMPONENTS.C_LOOKUP.descriptor,
    targets: [TARGETS.LIGHTNING_EXPERIENCE]
  },
  [COMPONENTS.C_APEX_LOOKUP.descriptor]: {
    git: GIT_APEX_RELIANT_SOURCE_COMPONENTS + "apexLookup",
    title: COMPONENTS.C_APEX_LOOKUP.label,
    description: "Its a C_APEX_LOOKUP",
    descriptor: COMPONENTS.C_APEX_LOOKUP.descriptor,
    targets: [TARGETS.LIGHTNING_EXPERIENCE]
  },
  [COMPONENTS.C_MESSAGE_CHANNEL_MIXIN.descriptor]: {
    git: GIT_SOURCE_COMPONENTS + "messageChannelMixin",
    title: COMPONENTS.C_MESSAGE_CHANNEL_MIXIN.label,
    description: "Message channel mixing descriptions",
    descriptor: COMPONENTS.C_MESSAGE_CHANNEL_MIXIN.descriptor,
    targets: [TARGETS.LIGHTNING_EXPERIENCE]
  },
  [COMPONENTS.C_ILLUSTRATION.descriptor]: {
    git: GIT_SOURCE_COMPONENTS + "illustration",
    title: COMPONENTS.C_ILLUSTRATION.label,
    description:
      "Illustrations should be used within other components, such as cards, to express the state of the component. An illustration image must be accompanied with heading text inline.",
    descriptor: COMPONENTS.C_ILLUSTRATION.descriptor,
    targets: [TARGETS.LIGHTNING_EXPERIENCE]
  }
};
