import type { DocType } from "@rickydata-docs/shared-types";

export function inferDocType(path: string): DocType {
  const normalized = path.toLowerCase();

  if (normalized.includes("changelog") || normalized.includes("release")) {
    return "release-note";
  }
  if (normalized.includes("architecture")) {
    return "architecture";
  }
  if (normalized.includes("security") || normalized.includes("audit")) {
    return "security";
  }
  if (normalized.includes("workflow") || normalized.includes("pipeline") || normalized.includes("process")) {
    return "workflow";
  }
  return "guide";
}
