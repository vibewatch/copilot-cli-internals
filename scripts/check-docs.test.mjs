import assert from "node:assert/strict";
import test from "node:test";

import { analyzeSubsystemReview } from "./check-docs.mjs";

const pendingReview = `# Review

## Candidate 1: \`package-root:new-runtime\`

- Kind: \`package-root\`
- Evidence: New runtime.
- Decision: \`pending\`
- Documentation: \`pending\`
- Source confirmation: \`pending\`
`;

test("strict review rejects pending subsystem fields", () => {
  const result = analyzeSubsystemReview(pendingReview, false, [
    "package-root:new-runtime",
  ]);
  assert.equal(result.pendingCount, 3);
  assert(result.failures.some((failure) => failure.includes("unresolved")));
});

test("draft fallback allows pending subsystem fields", () => {
  const result = analyzeSubsystemReview(pendingReview, true, [
    "package-root:new-runtime",
  ]);
  assert.equal(result.pendingCount, 3);
  assert.deepEqual(result.failures, []);
});

test("review candidates must match the generated manifest", () => {
  const missing = analyzeSubsystemReview(pendingReview, true, [
    "package-root:new-runtime",
    "package-root:another-runtime",
  ]);
  assert(
    missing.failures.some((failure) =>
      failure.includes("missing generated candidate: package-root:another-runtime"),
    ),
  );

  const unknown = analyzeSubsystemReview(pendingReview, true, []);
  assert(
    unknown.failures.some((failure) =>
      failure.includes("unknown candidate: package-root:new-runtime"),
    ),
  );
});

test("new-page and existing-page decisions require documentation links", () => {
  const missingLink = `# Review

## Candidate 1: \`package-root:new-runtime\`

- Kind: \`package-root\`
- Evidence: New runtime.
- Decision: \`new-page\`
- Documentation: docs/new-runtime.md
- Source confirmation: \`new-runtime/server.js\` entrypoint.
`;
  const invalid = analyzeSubsystemReview(missingLink, false);
  assert(
    invalid.failures.some((failure) =>
      failure.includes("requires a Markdown documentation link"),
    ),
  );

  const linked = missingLink.replace(
    "docs/new-runtime.md",
    "[Native runtime](../01-runtime-lifecycle/native-runtime.md)",
  );
  assert.deepEqual(analyzeSubsystemReview(linked, false).failures, []);
});
