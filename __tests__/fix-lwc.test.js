const cp = require("child_process");
const fs = require("fs");
const path = require("path");

describe("fix-lwc.js script", () => {
  // Put temp dir outside __tests__ to bypass script's exclusion rules
  const testDir = path.join(__dirname, "..", ".tmp_fix_test");

  beforeAll(() => {
    if (!fs.existsSync(testDir)) {
      fs.mkdirSync(testDir, { recursive: true });
    }
  });

  afterAll(() => {
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true });
    }
  });

  it("should correctly reorder an unordered LWC file", () => {
    const filePath = path.join(testDir, "unordered.js");
    fs.writeFileSync(
      filePath,
      `import { LightningElement, api } from 'lwc';

export default class Unordered extends LightningElement {
  connectedCallback() {}
  @api recordId;
}`
    );

    try {
      cp.execSync(`node fix-lwc.js ${filePath}`, { stdio: "pipe" });

      const fixedContent = fs.readFileSync(filePath, "utf8");
      const apiIndex = fixedContent.indexOf("@api recordId");
      const connectedIndex = fixedContent.indexOf("connectedCallback()");

      expect(apiIndex).toBeGreaterThan(-1);
      expect(connectedIndex).toBeGreaterThan(-1);
      expect(apiIndex).toBeLessThan(connectedIndex);
    } catch (error) {
      const out =
        (error.stdout ? error.stdout.toString() : "") +
        (error.stderr ? error.stderr.toString() : "");
      throw new Error("Fix script failed: " + out + " " + error.message);
    }
  });

  it("should correctly process a clean LWC file without changes", () => {
    const filePath = path.join(testDir, "clean.js");
    const content = `import { LightningElement, api } from 'lwc';

export default class Clean extends LightningElement {
  @api recordId;
  connectedCallback() {}
}`;
    fs.writeFileSync(filePath, content);

    try {
      cp.execSync(`node fix-lwc.js ${filePath}`, { stdio: "pipe" });
      const postContent = fs.readFileSync(filePath, "utf8");
      expect(postContent.replace(/\r\n/g, "\n")).toEqual(
        content.replace(/\r\n/g, "\n")
      );
    } catch (error) {
      const out =
        (error.stdout ? error.stdout.toString() : "") +
        (error.stderr ? error.stderr.toString() : "");
      throw new Error("Fix script failed: " + out + " " + error.message);
    }
  });
});
