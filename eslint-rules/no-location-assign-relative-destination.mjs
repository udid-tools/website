// Adapted from @next/eslint-plugin-next 16.4.2 under the MIT License.
import { findVariable, getStringIfConstant } from "@eslint-community/eslint-utils";

const documentationUrl = "https://nextjs.org/docs/messages/no-location-assign-relative-destination";
const absoluteUrlPattern = /^(?:[a-z][\d+.a-z-]*:|\/\/)/i;
const globalPrefixes = new Set(["window", "globalThis", "document", "self"]);

function isMemberExpressionWithNamedProperty(expression, name) {
  if (expression.type !== "MemberExpression") {
    return false;
  }

  return expression.computed
    ? expression.property.type === "Literal" && expression.property.value === name
    : expression.property.type === "Identifier" && expression.property.name === name;
}

function getLocationRootIdentifier(node) {
  if (node.type === "Identifier" && node.name === "location") {
    return node;
  }

  if (
    node.type === "MemberExpression" &&
    node.object.type === "Identifier" &&
    globalPrefixes.has(node.object.name) &&
    isMemberExpressionWithNamedProperty(node, "location")
  ) {
    return node.object;
  }

  return null;
}

function isGlobalReference(sourceCode, node) {
  const variable = sourceCode.scopeManager.scopes[0]?.set.get(node.name);

  if (!variable || variable.defs.length > 0) {
    return false;
  }

  return variable.references.some(({ identifier }) => identifier === node);
}

function getStaticStringPrefix(node, sourceCode) {
  const constantValue = getStringIfConstant(node, sourceCode.getScope(node));

  if (constantValue !== null) {
    return constantValue;
  }

  if (node.type === "TemplateLiteral" && node.quasis.length > 0) {
    return node.quasis[0].value.cooked ?? node.quasis[0].value.raw;
  }

  if (node.type === "BinaryExpression" && node.operator === "+") {
    return getStaticStringPrefix(node.left, sourceCode);
  }

  if (node.type !== "Identifier") {
    return null;
  }

  const variable = findVariable(sourceCode.getScope(node), node);

  if (!variable || variable.defs.length < 1) {
    return null;
  }

  const definition = variable.defs.at(-1);

  if (definition?.type !== "Variable") {
    return null;
  }

  let lastWriteExpression = definition.node.init ?? null;

  for (const reference of variable.references) {
    if (reference.identifier.range[0] >= node.range[0]) {
      break;
    }

    if (
      reference.isWrite() &&
      reference.writeExpr &&
      reference.writeExpr !== definition.node.init
    ) {
      lastWriteExpression = reference.writeExpr;
    }
  }

  return lastWriteExpression ? getStaticStringPrefix(lastWriteExpression, sourceCode) : null;
}

const rule = {
  meta: {
    docs: {
      description:
        "Prevent usage of location.assign or location.href assignment to navigate to internal Next.js pages.",
      recommended: true,
      url: documentationUrl,
    },
    type: "problem",
    schema: [],
    messages: {
      noLocationAssign:
        "Do not use `{{expression}}` to navigate to internal Next.js pages. Use `redirect()` in the render phase, or `useRouter().push()` in Client Components' event handlers instead. See: " +
        documentationUrl,
    },
  },
  create(context) {
    const sourceCode = context.sourceCode;

    if (!sourceCode.scopeManager) {
      return {};
    }

    return {
      CallExpression(node) {
        if (!isMemberExpressionWithNamedProperty(node.callee, "assign")) {
          return;
        }

        const rootIdentifier = getLocationRootIdentifier(node.callee.object);
        const firstArgument = node.arguments[0];

        if (
          !rootIdentifier ||
          !isGlobalReference(sourceCode, rootIdentifier) ||
          !firstArgument ||
          firstArgument.type === "SpreadElement"
        ) {
          return;
        }

        const value = getStaticStringPrefix(firstArgument, sourceCode);

        if (value !== null && !absoluteUrlPattern.test(value)) {
          context.report({
            node,
            messageId: "noLocationAssign",
            data: { expression: `${sourceCode.getText(node.callee)}()` },
          });
        }
      },
      AssignmentExpression(node) {
        if (!isMemberExpressionWithNamedProperty(node.left, "href")) {
          return;
        }

        const rootIdentifier = getLocationRootIdentifier(node.left.object);

        if (!rootIdentifier || !isGlobalReference(sourceCode, rootIdentifier)) {
          return;
        }

        const value = getStaticStringPrefix(node.right, sourceCode);

        if (value !== null && !absoluteUrlPattern.test(value)) {
          context.report({
            node,
            messageId: "noLocationAssign",
            data: { expression: sourceCode.getText(node.left) },
          });
        }
      },
    };
  },
};

export default rule;
