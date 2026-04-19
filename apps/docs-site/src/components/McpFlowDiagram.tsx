import React, { useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { Icons } from './Icons';
import { Pill } from './Pill';

type NodeId = 'client' | 'gateway' | 'server' | 'tool';

interface NodeProps {
  id: NodeId;
  title: string;
  sub: string;
  icon: ReactNode;
  hovered: NodeId | null;
  onEnter: (id: NodeId) => void;
  onLeave: () => void;
}

function FlowNode({ id, title, sub, icon, hovered, onEnter, onLeave }: NodeProps) {
  const active = hovered === id;
  const style: CSSProperties = {
    border: '1px solid',
    background: active
      ? 'oklch(from var(--ifm-color-primary) l c h / 0.08)'
      : 'var(--rd-surface-1)',
    borderColor: active
      ? 'oklch(from var(--ifm-color-primary) l c h / 0.4)'
      : 'var(--rd-border)',
    borderRadius: 10,
    padding: '10px 14px',
    minWidth: 128,
    transition: 'all 160ms',
  };
  return (
    <div
      onMouseEnter={() => onEnter(id)}
      onMouseLeave={onLeave}
      style={style}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span
          style={{
            color: active ? 'var(--ifm-color-primary)' : 'var(--rd-muted)',
            display: 'inline-flex',
          }}
        >
          {icon}
        </span>
        <div
          style={{
            fontFamily: 'var(--ifm-heading-font-family)',
            fontSize: 13,
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'var(--rd-text)',
          }}
        >
          {title}
        </div>
      </div>
      <div
        style={{
          fontSize: 11,
          color: 'var(--rd-muted)',
          marginLeft: 22,
          lineHeight: 1.35,
        }}
      >
        {sub}
      </div>
    </div>
  );
}

function FlowArrow({ bi, active }: { bi?: boolean; active: boolean }) {
  const color = active
    ? 'var(--ifm-color-primary)'
    : 'var(--rd-border-active, var(--rd-border))';
  return (
    <div
      style={{
        flex: 1,
        minWidth: 24,
        height: 2,
        position: 'relative',
        background: color,
        transition: 'background 160ms',
      }}
    >
      <svg
        width="10"
        height="10"
        style={{ position: 'absolute', right: -1, top: -4 }}
      >
        <path d="M0 0 L10 5 L0 10 Z" fill={color} />
      </svg>
      {bi && (
        <svg
          width="10"
          height="10"
          style={{
            position: 'absolute',
            left: -1,
            top: -4,
            transform: 'scaleX(-1)',
          }}
        >
          <path d="M0 0 L10 5 L0 10 Z" fill={color} />
        </svg>
      )}
    </div>
  );
}

export function McpFlowDiagram() {
  const [hovered, setHovered] = useState<NodeId | null>(null);
  const onEnter = (id: NodeId) => setHovered(id);
  const onLeave = () => setHovered(null);

  return (
    <div className="rd-flow-diagram">
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <FlowNode
          id="client"
          title="Your client"
          sub="Claude Code, Cursor, SDK..."
          icon={<Icons.terminal width="14" height="14" />}
          hovered={hovered}
          onEnter={onEnter}
          onLeave={onLeave}
        />
        <FlowArrow bi active={hovered === 'client' || hovered === 'gateway'} />
        <FlowNode
          id="gateway"
          title="rickydata gateway"
          sub="Auth · routing · x402"
          icon={<Icons.shield width="14" height="14" />}
          hovered={hovered}
          onEnter={onEnter}
          onLeave={onLeave}
        />
        <FlowArrow bi active={hovered === 'gateway' || hovered === 'server'} />
        <FlowNode
          id="server"
          title="MCP server"
          sub="Tool definitions"
          icon={<Icons.plug width="14" height="14" />}
          hovered={hovered}
          onEnter={onEnter}
          onLeave={onLeave}
        />
        <FlowArrow active={hovered === 'server' || hovered === 'tool'} />
        <FlowNode
          id="tool"
          title="Tool"
          sub="Live data, compute, APIs"
          icon={<Icons.wrench width="14" height="14" />}
          hovered={hovered}
          onEnter={onEnter}
          onLeave={onLeave}
        />
      </div>
      <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <Pill tone="accent">JSON-RPC over HTTP</Pill>
        <Pill>Streaming · SSE</Pill>
        <Pill>Per-call x402 settlement</Pill>
        <Pill tone="success">Signed attestations</Pill>
      </div>
    </div>
  );
}

export default McpFlowDiagram;
