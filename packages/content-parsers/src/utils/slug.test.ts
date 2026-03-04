import { describe, expect, it } from "vitest";
import { slugFromPath, slugify } from "./slug.js";

describe("slug utilities", () => {
  it("slugifies general strings", () => {
    expect(slugify("GET /api/v1/Hello World")).toBe("get-api-v1-hello-world");
  });

  it("builds slug from product + path", () => {
    expect(slugFromPath("sdk", "docs/Quick Start.md")).toBe("sdk-docs-quick-start");
  });
});
