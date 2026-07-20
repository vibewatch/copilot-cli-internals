import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSubsystemCandidates,
  renderSubsystemReview,
} from "./update-copilot-cli-docs.mjs";

function layout(roots, files, directories = []) {
  return {
    roots: new Map(roots),
    files: new Set(files),
    directories: new Set(directories),
  };
}

function named(names) {
  return names.map((name) => ({ name }));
}

test("detects new roots, module files, and namespace families", () => {
  const previousLayout = layout(
    [
      ["app.js", "file"],
      ["copilot-sdk", "directory"],
      ["definitions", "directory"],
      ["sdk", "directory"],
    ],
    [
      "app.js",
      "copilot-sdk/index.js",
      "definitions/explore.agent.yaml",
      "sdk/index.js",
    ],
    ["copilot-sdk", "definitions", "sdk"],
  );
  const currentLayout = layout(
    [
      ["app.js", "file"],
      ["copilot-sdk", "directory"],
      ["definitions", "directory"],
      ["sdk", "directory"],
      ["tgrep", "directory"],
      ["voice-server.js", "file"],
    ],
    [
      "app.js",
      "copilot-sdk/index.js",
      "copilot-sdk/toolSet.d.ts",
      "definitions/explore.agent.yaml",
      "definitions/sidekick/search.yaml",
      "sdk/index.js",
      "sdk/transports/client.js",
      "tgrep/index.js",
      "voice-server.js",
    ],
    [
      "copilot-sdk",
      "definitions",
      "definitions/sidekick",
      "sdk",
      "sdk/transports",
      "tgrep",
    ],
  );
  const previousSurface = {
    eventStrings: named(["session.start"]),
    jsonRpcMethods: named(["session.model.get"]),
  };
  const currentSurface = {
    eventStrings: named([
      "session.start",
      "session.canvas.opened",
      "session.canvas.closed",
      "single.noise",
    ]),
    jsonRpcMethods: named([
      "session.model.get",
      "session.resources.list",
      "session.resources.read",
    ]),
  };

  const candidates = buildSubsystemCandidates(
    previousLayout,
    currentLayout,
    previousSurface,
    currentSurface,
  );
  const ids = candidates.map((candidate) => candidate.id);

  assert(ids.includes("package-root:tgrep"));
  assert(ids.includes("package-root:voice-server.js"));
  assert(ids.includes("package-module:copilot-sdk/toolSet.d.ts"));
  assert(ids.includes("package-module:definitions/sidekick/"));
  assert(ids.includes("package-module:sdk/transports/"));
  assert(ids.includes("surface-namespace:eventStrings:session.canvas"));
  assert(ids.includes("surface-namespace:jsonRpcMethods:session.resources"));
  assert(!ids.includes("package-module:tgrep/index.js"));
  assert(!ids.some((id) => id.includes("single.noise")));

  const review = renderSubsystemReview({
    previousVersion: "1.0.71",
    currentVersion: "1.0.72",
    generatedAt: "2026-07-20T00:00:00.000Z",
    candidates,
  });
  assert.equal(
    [...review.matchAll(/^- Decision: `pending`$/gm)].length,
    candidates.length,
  );
  assert.equal(
    [...review.matchAll(/^- Documentation: `pending`$/gm)].length,
    candidates.length,
  );
  assert.equal(
    [...review.matchAll(/^- Source confirmation: `pending`$/gm)].length,
    candidates.length,
  );
});

test("renders an explicit no-candidates result", () => {
  const review = renderSubsystemReview({
    previousVersion: "1.0.71",
    currentVersion: "1.0.71",
    generatedAt: "2026-07-20T00:00:00.000Z",
    candidates: [],
  });

  assert.match(review, /- Decision: `no-candidates`/);
  assert.doesNotMatch(
    review,
    /^- (Decision|Documentation|Source confirmation): `pending`$/m,
  );
});
