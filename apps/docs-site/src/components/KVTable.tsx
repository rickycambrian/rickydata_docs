import React from 'react';
import type { ReactNode } from 'react';

export interface KVTableProps {
  rows: Array<[ReactNode, ReactNode]>;
}

export function KVTable({ rows }: KVTableProps) {
  return (
    <div className="rd-kv-table">
      {rows.map(([k, v], i) => (
        <div className="rd-kv-row" key={i}>
          <div className="rd-kv-key">{k}</div>
          <div className="rd-kv-val">{v}</div>
        </div>
      ))}
    </div>
  );
}

export default KVTable;
