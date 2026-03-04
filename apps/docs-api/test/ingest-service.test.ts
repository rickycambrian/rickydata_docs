import { describe, expect, it } from "vitest";
import { repoSources } from "../src/services/ingest/sources.js";

describe("repo source configuration", () => {
  it("contains expected primary v1 repos", () => {
    const names = repoSources.map((source) => source.name);
    expect(names).toContain("mcp_deployments_registry");
    expect(names).toContain("rickydata_SDK");
    expect(names).toContain("rickydata_mcp");
  });
});
