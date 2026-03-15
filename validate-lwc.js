const fs = require("fs");
const path = require("path");
const parser = require("@babel/parser");
const traverse = require("@babel/traverse").default;

// CPD-OFF
const LIFECYCLE_HOOKS = new Set([
  "constructor",
  "connectedCallback",
  "disconnectedCallback",
  "render",
  "renderedCallback",
  "errorCallback"
]);

// Helper to determine node category
function getElementCategory(path) {
  const node = path.node;
  const decorators = (node.decorators || []).map(
    (d) =>
      d.expression.name || (d.expression.callee && d.expression.callee.name)
  );

  const isApi = decorators.includes("api") || node._inheritedApi;
  const isTrack = decorators.includes("track");
  const isWire = decorators.includes("wire") || node._inheritedWire;

  const isProperty =
    node.type === "ClassProperty" || node.type === "ClassPrivateProperty";
  const isMethod =
    node.type === "ClassMethod" || node.type === "ClassPrivateMethod";
  const isArrowFunctionProp =
    isProperty &&
    node.value &&
    (node.value.type === "ArrowFunctionExpression" ||
      node.value.type === "FunctionExpression");

  const isGetter = node.kind === "get";
  const isSetter = node.kind === "set";

  let name = "";
  if (node.key) {
    name = node.key.name || node.key.value;
    if (node.key.type === "PrivateName") name = "#" + node.key.id.name;
  }

  const isLifecycle = isMethod && LIFECYCLE_HOOKS.has(name);

  if (isApi) {
    if (isGetter || isSetter) return { type: "api_gs", name, kind: node.kind };
    if (isMethod) return { type: "api_method", name, kind: "method" }; // Edge case not explicit in rules, consider as private method? Actually @api methods are a thing. Let's assume they go with private methods or api properties? Wait, rules don't mention "@api methods" explicitly. Let's treat them as api properties.
    return { type: "api_prop", name, kind: "prop" };
  }

  if (isTrack) {
    return { type: "track_prop", name, kind: "prop" };
  }

  if (isWire) {
    if (isMethod) return { type: "wire_method", name, kind: "method" };
    return { type: "wire_prop", name, kind: "prop" };
  }

  // Non-decorated
  if (isGetter || isSetter) {
    return { type: "private_gs", name, kind: node.kind };
  }

  if (isLifecycle) {
    return { type: "lifecycle", name, kind: "method" };
  }

  if (isArrowFunctionProp) {
    return { type: "private_method", subtype: "arrow", name, kind: "method" };
  }

  if (isMethod) {
    return { type: "private_method", subtype: "normal", name, kind: "method" };
  }

  if (isProperty) {
    return { type: "private_prop", name, kind: "prop" };
  }

  return { type: "unknown", name, kind: "unknown" };
}

const ORDER = {
  api_prop: 1,
  api_gs: 2,
  api_method: 3,
  track_prop: 4,
  private_prop: 5,
  wire_prop: 6,
  wire_method: 7,
  private_gs: 8,
  private_method: 9,
  lifecycle: 10
};

let totalErrors = 0;

function validateFile(filePath) {
  const code = fs.readFileSync(filePath, "utf-8");
  let ast;
  try {
    ast = parser.parse(code, {
      sourceType: "module",
      plugins: ["classProperties", "decorators-legacy", "exportDefaultFrom"]
    });
  } catch (e) {
    console.error(`Error parsing ${filePath}: ${e.message}`);
    totalErrors++;
    return;
  }

  const errors = [];
  const addError = (line, msg) => errors.push(`Line ${line}: ${msg}`);

  // Top-level validation
  let currentTopLevelPhase = 1;
  // 1: imports, 2: constants, 3: properties, 4: helpers, 5: class, 6: exports

  let lastImport = null;
  let lastHelperSubtype = null; // 'arrow' -> 'normal'

  ast.program.body.forEach((initialNode) => {
    const line = initialNode.loc ? initialNode.loc.start.line : "?";

    let node = initialNode;
    if (
      initialNode.type === "ExportNamedDeclaration" &&
      initialNode.declaration
    ) {
      if (initialNode.declaration.type !== "ClassDeclaration") {
        node = initialNode.declaration;
      }
    }

    if (node.type === "ImportDeclaration") {
      if (currentTopLevelPhase > 1) {
        addError(
          line,
          `Incorrect ordering: Top-level import found after phase ${currentTopLevelPhase}`
        );
      }
      currentTopLevelPhase = 1;
      const source = node.source.value;
      if (lastImport && source.toLowerCase() < lastImport.toLowerCase()) {
        addError(
          line,
          `Alphabetical violation: Import '${source}' should be before '${lastImport}'`
        );
      }
      lastImport = source;
    } else if (node.type === "VariableDeclaration") {
      const isConst = node.kind === "const";
      const dec = node.declarations[0];
      let name = "";
      if (dec && dec.id) {
        if (dec.id.type === "Identifier") name = dec.id.name;
        else if (dec.id.type === "ObjectPattern" && dec.id.properties[0])
          name = dec.id.properties[0].value.name;
        else if (dec.id.type === "ArrayPattern" && dec.id.elements[0])
          name = dec.id.elements[0].name;
      }
      name = name || "";

      const isArrowFunction =
        dec &&
        dec.init &&
        (dec.init.type === "ArrowFunctionExpression" ||
          dec.init.type === "FunctionExpression");

      if (isArrowFunction) {
        // Helper function
        if (currentTopLevelPhase > 4)
          addError(
            line,
            `Incorrect ordering: Top-level helper function found after phase ${currentTopLevelPhase}`
          );
        currentTopLevelPhase = 4;

        if (lastHelperSubtype === "normal") {
          addError(
            line,
            `Incorrect ordering: Arrow function helper '${name}' must appear before normal function helpers`
          );
        }
        lastHelperSubtype = "arrow";
      } else if (isConst) {
        // Constant
        if (currentTopLevelPhase > 2)
          addError(
            line,
            `Incorrect ordering: Top-level constant found after phase ${currentTopLevelPhase}`
          );
        currentTopLevelPhase = 2;
      } else {
        // Property
        if (currentTopLevelPhase > 3)
          addError(
            line,
            `Incorrect ordering: Top-level property found after phase ${currentTopLevelPhase}`
          );
        currentTopLevelPhase = 3;
      }
    } else if (node.type === "FunctionDeclaration") {
      if (currentTopLevelPhase > 4)
        addError(
          line,
          `Incorrect ordering: Top-level helper function found after phase ${currentTopLevelPhase}`
        );
      currentTopLevelPhase = 4;

      lastHelperSubtype = "normal";
    } else if (
      initialNode.type === "ExportDefaultDeclaration" ||
      (initialNode.type === "ExportNamedDeclaration" &&
        initialNode.declaration &&
        initialNode.declaration.type === "ClassDeclaration")
    ) {
      if (currentTopLevelPhase > 5)
        addError(
          line,
          `Incorrect ordering: Class export found after phase ${currentTopLevelPhase}`
        );
      currentTopLevelPhase = 5;
    } else if (initialNode.type === "ExportNamedDeclaration") {
      if (currentTopLevelPhase > 6)
        addError(
          line,
          `Incorrect ordering: Named export found after phase ${currentTopLevelPhase}`
        );
      currentTopLevelPhase = 6;
      // You could check bottom-level here
    }
  });

  // Class validation
  traverse(ast, {
    ClassDeclaration(path) {
      const body = path.node.body.body;
      let currentPhase = -1;
      let lastElementName = null;
      let lastElementSubtype = null;

      const gsPairs = {};
      body.forEach((node) => {
        if (node.kind === "get" || node.kind === "set") {
          const name = node.key.name || node.key.value;
          if (!gsPairs[name]) gsPairs[name] = [];
          gsPairs[name].push(node);
        }
      });
      Object.values(gsPairs).forEach((pair) => {
        if (pair.length > 1) {
          const hasApi = pair.some((n) =>
            (n.decorators || []).some(
              (d) =>
                d.expression.name === "api" ||
                (d.expression.callee && d.expression.callee.name === "api")
            )
          );
          const hasWire = pair.some((n) =>
            (n.decorators || []).some(
              (d) =>
                d.expression.name === "wire" ||
                (d.expression.callee && d.expression.callee.name === "wire")
            )
          );
          pair.forEach((n) => {
            if (
              hasApi &&
              !(n.decorators || []).some((d) => d.expression.name === "api")
            )
              n._inheritedApi = true;
            if (
              hasWire &&
              !(n.decorators || []).some((d) => d.expression.name === "wire")
            )
              n._inheritedWire = true;
          });
        }
      });

      body.forEach((node) => {
        const line = node.loc ? node.loc.start.line : "?";
        const elPath = { node }; // Mock path
        const cat = getElementCategory(elPath);

        if (cat.type === "unknown") return;

        const phase = ORDER[cat.type];
        if (phase < currentPhase) {
          addError(
            line,
            `Incorrect ordering: ${cat.type} '${cat.name}' appears after phase ${currentPhase}`
          );
        }

        if (phase === currentPhase) {
          if (cat.type === "api_gs" || cat.type === "private_gs") {
            // Checked later
          } else if (cat.type === "private_method") {
            if (lastElementSubtype === "normal" && cat.subtype === "arrow") {
              addError(
                line,
                `Incorrect ordering: Arrow private method '${cat.name}' must appear before normal methods.`
              );
            } else if (
              lastElementSubtype === cat.subtype &&
              lastElementName &&
              cat.name.toLowerCase() < lastElementName.toLowerCase()
            ) {
              addError(
                line,
                `Alphabetical violation: Private method '${cat.name}' should be before '${lastElementName}'`
              );
            }
          } else {
            if (
              lastElementName &&
              cat.name.toLowerCase() < lastElementName.toLowerCase()
            ) {
              addError(
                line,
                `Alphabetical violation: ${cat.type} '${cat.name}' should be before '${lastElementName}'`
              );
            }
          }
        }

        currentPhase = phase;
        lastElementName = cat.name;
        lastElementSubtype = cat.subtype;
      });

      let lastApiGSName = null;
      let lastPrivateGSName = null;
      body.forEach((node) => {
        const line = node.loc ? node.loc.start.line : "?";
        const cat = getElementCategory({ node });
        if (cat.type === "api_gs") {
          if (
            lastApiGSName &&
            lastApiGSName !== cat.name &&
            lastApiGSName > cat.name
          ) {
            addError(
              line,
              `Alphabetical violation: Getter/Setter pair '${cat.name}' should be before '${lastApiGSName}'`
            );
          }
          lastApiGSName = cat.name;
        } else if (cat.type === "private_gs") {
          if (
            lastPrivateGSName &&
            lastPrivateGSName !== cat.name &&
            lastPrivateGSName > cat.name
          ) {
            addError(
              line,
              `Alphabetical violation: Getter/Setter pair '${cat.name}' should be before '${lastPrivateGSName}'`
            );
          }
          lastPrivateGSName = cat.name;
        }
      });
    }
  });

  if (errors.length > 0) {
    console.error(`\nFile: ${filePath}`);
    errors.forEach((e) => console.error(`  - ${e}`));
    totalErrors += errors.length;
  }
}

function processArgs(args) {
  let fileList = [];
  for (const arg of args) {
    const stat = fs.statSync(arg);
    const fullPath = path.resolve(arg);
    if (stat.isDirectory()) {
      fileList = fileList.concat(findJsFiles(arg));
    } else if (
      stat.isFile() &&
      arg.endsWith(".js") &&
      !fullPath.includes("__tests__") &&
      !fullPath.includes("__mocks__")
    ) {
      fileList.push(arg);
    }
  }
  return fileList;
}

function findJsFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory() && !file.includes("node_modules")) {
      findJsFiles(fullPath, fileList);
    } else if (
      file.endsWith(".js") &&
      fullPath.includes("lwc") &&
      !fullPath.includes("validate-lwc.js") &&
      !fullPath.includes("fix-lwc.js") &&
      !fullPath.includes("__tests__") &&
      !fullPath.includes("__mocks__")
    ) {
      fileList.push(fullPath);
    }
  }
  return fileList;
}

const args = process.argv.slice(2);
const targetArgs = args.length > 0 ? args : ["."];
const files = processArgs(targetArgs);

if (files.length === 0) {
  console.log("No files to validate.");
  process.exit(0);
}

files.forEach(validateFile);

if (totalErrors > 0) {
  console.error(`\nValidation failed with ${totalErrors} errors.`);
  process.exit(1);
} else {
  console.log(`\nSuccessfully validated ${files.length} files.`);
  process.exit(0);
}
// CPD-ON
