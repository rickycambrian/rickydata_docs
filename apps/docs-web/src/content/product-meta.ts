export type ProductMeta = {
  label: string;
  description: string;
};

export const PRODUCT_META: Record<string, ProductMeta> = {
  marketplace: {
    label: "MCP Marketplace Platform",
    description:
      "Core marketplace, gateway, wallet, and agent platform docs covering discovery, architecture, security, and operations."
  },
  "mcp-server": {
    label: "RickyData MCP Server",
    description:
      "Runtime MCP server behavior, transport semantics, and endpoint contracts for direct client integration."
  },
  sdk: {
    label: "RickyData SDK + CLI",
    description:
      "Install, authenticate, connect local agentic clients, discover servers, call tools, and run agent workflows."
  },
  serverless: {
    label: "KF Serverless",
    description:
      "Serverless infrastructure references and operational guides for hosted RickyData services."
  },
  canvas: {
    label: "Canvas Workflows",
    description:
      "Visual workflow orchestration docs for building and executing multi-node agent and tool pipelines."
  }
};

export function getProductMeta(product: string): ProductMeta | undefined {
  return PRODUCT_META[product];
}

export function getProductLabel(product: string): string {
  return PRODUCT_META[product]?.label || product;
}
