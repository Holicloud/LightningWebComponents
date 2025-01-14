const GIT_HUB = 'https://raw.githubusercontent.com/santiagoparradev/LWC-RECIPES-SANTIAGO/refs/heads/main';
const GIT_HUB_SOURCE_COMPONENTS = `${GIT_HUB}/src-components/main/default/lwc/{0}/README.md`;
const EXAMPLES_GIT_HUB_SOURCE = `${GIT_HUB}/src-components-examples/main/default/lwc/{0}/README.md`;
const TARGETS = Object.freeze({
  LIGHTNING_EXPERIENCE: "Lightning Experience",
  EXPERIENCE_BUILDER_SITES: "Experience Builder Sites",
  SALESFORCE_MOBILE_APP: "Salesforce Mobile App",
  STANDALONE_LIGHTNING_APP: "Standalone Lightning App",
  MOBILE_OFFLINE: "Mobile Offline"
});

export const COMPONENT_TYPES = {
  MIXIN: "Mixin",
  COMPONENT: "Component"
};

export const COMPONENTS = {
  C_EXPANDABLE_SECTION: {
    type: COMPONENT_TYPES.COMPONENT,
    descriptor: "c-expandable-section",
    label: "Expandable Section"
  },
  C_WIZARD: {
    type: COMPONENT_TYPES.COMPONENT,
    descriptor: "c-wizard",
    label: "Wizard"
  },
  C_MESSAGE_CHANNEL_MIXIN: {
    type: COMPONENT_TYPES.MIXIN,
    descriptor: "MessageChannelMixin",
    label: "Message Channel"
  },
  C_ALERT: {
    type: COMPONENT_TYPES.COMPONENT,
    descriptor: "Alert",
    label: "Alert"
  }
};

export const EXAMPLES = {
  [COMPONENTS.C_EXPANDABLE_SECTION.descriptor]: {
    documentation:
      GIT_HUB_SOURCE_COMPONENTS.replace('{0}', 'expandableSection'),
    examples: [
      {
        title: "Basic",
        description: "this is some sample",
        codeBase: EXAMPLES_GIT_HUB_SOURCE.replace('{0}', 'expandableSectionBasic'),
        constructor: () => import("c/expandableSectionBasic")
      }
    ]
  },
  [COMPONENTS.C_WIZARD.descriptor]: {
    documentation:
    GIT_HUB_SOURCE_COMPONENTS.replace('{0}', 'wizard'),
    examples: [
      {
        title: "Basic",
        description: "this is some sample",
        codeBase: EXAMPLES_GIT_HUB_SOURCE.replace('{0}', 'wizardBasic'),
        constructor: () => import("c/wizardBasic")
      }
    ]
  },
  [COMPONENTS.C_ALERT.descriptor]: {
    documentation:
    GIT_HUB_SOURCE_COMPONENTS.replace('{0}', 'alert'),
    examples: [
      {
        title: "Basic",
        description: "this is some sample",
        codeBase: EXAMPLES_GIT_HUB_SOURCE.replace('{0}', 'alertBasic'),
        constructor: () => import("c/alertBasic")
      }
    ]
  },
  [COMPONENTS.C_MESSAGE_CHANNEL_MIXIN.descriptor]: {
    documentation: GIT_HUB_SOURCE_COMPONENTS.replace('{0}', 'messageChannelMixin'),
  }
};

export const HEADER_INFO = {
  [COMPONENTS.C_EXPANDABLE_SECTION.descriptor]: {
    title: COMPONENTS.C_EXPANDABLE_SECTION.label,
    description: "Component that mimics behaviour of Expandable Section from slds",
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
    title: COMPONENTS.C_WIZARD.label,
    description: "Its a wizard",
    descriptor: COMPONENTS.C_WIZARD.descriptor,
    targets: [
      TARGETS.LIGHTNING_EXPERIENCE,
      TARGETS.EXPERIENCE_BUILDER_SITES,
      TARGETS.SALESFORCE_MOBILE_APP
    ]
  },
  [COMPONENTS.C_ALERT.descriptor]: {
    title: COMPONENTS.C_ALERT.label,
    description: "Its a C_ALERT",
    descriptor: COMPONENTS.C_ALERT.descriptor,
    targets: [
      TARGETS.LIGHTNING_EXPERIENCE,
      TARGETS.EXPERIENCE_BUILDER_SITES,
      TARGETS.SALESFORCE_MOBILE_APP
    ]
  },
  [COMPONENTS.C_MESSAGE_CHANNEL_MIXIN.descriptor]: {
    title: COMPONENTS.C_MESSAGE_CHANNEL_MIXIN.label,
    description: "Message channel mixing descriptions",
    descriptor: COMPONENTS.C_MESSAGE_CHANNEL_MIXIN.descriptor,
    targets: [TARGETS.LIGHTNING_EXPERIENCE, TARGETS.EXPERIENCE_BUILDER_SITES]
  }
};
