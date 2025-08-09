import { LightningElement } from "lwc";

export default class FormattedMarkdownBasic extends LightningElement {
  markdownContent = `
  # My Markdown Content

  This is a paragraph with **bold text** and *italic text*.

  - Item 1
  - Item 2
    - Sub-item A
    - Sub-item B

  \`\`\`javascript
  const greeting = "Hello, World!";
  console.log(greeting);
  \`\`\`
  `;

  markdownUrl =
    "https://raw.githubusercontent.com/Holicloud/LightningWebComponents/refs/heads/main/force-app/main/src-components/lwc/summaryDetail/README.md";
}
