import React, { useState, useCallback } from 'react';
import { Highlight, themes, type PrismTheme } from 'prism-react-renderer';
import { Icons } from './Icons';

export interface CodeTab {
  label: string;
  language?: string;
  code: string;
}

export interface CodeTabsProps {
  tabs: CodeTab[];
}

const rdTheme: PrismTheme = {
  plain: {
    color: 'oklch(0.88 0.02 60)',
    backgroundColor: 'transparent',
  },
  styles: [
    { types: ['comment', 'prolog', 'doctype', 'cdata'], style: { color: 'oklch(0.58 0.01 55)', fontStyle: 'italic' } },
    { types: ['punctuation', 'operator'], style: { color: 'oklch(0.72 0.009 55)' } },
    { types: ['keyword', 'builtin', 'atrule', 'boolean'], style: { color: 'oklch(0.72 0.13 280)' } },
    { types: ['string', 'char', 'attr-value', 'url'], style: { color: 'oklch(0.78 0.14 140)' } },
    { types: ['number', 'constant'], style: { color: 'oklch(0.78 0.14 70)' } },
    { types: ['function', 'class-name'], style: { color: 'oklch(0.78 0.12 220)' } },
    { types: ['property', 'attr-name', 'tag'], style: { color: 'oklch(0.86 0.1 30)' } },
    { types: ['variable', 'symbol'], style: { color: 'oklch(0.86 0.1 30)' } },
    { types: ['regex'], style: { color: 'oklch(0.80 0.14 70)' } },
  ],
};

export function CodeTabs({ tabs }: CodeTabsProps) {
  const [i, setI] = useState(0);
  const [copied, setCopied] = useState(false);
  const current = tabs[i];

  const copy = useCallback(() => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(current.code);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }, [current.code]);

  return (
    <div className="rd-code">
      {tabs.length > 1 && (
        <div className="rd-code-tabs" role="tablist">
          {tabs.map((t, ix) => (
            <button
              key={t.label + ix}
              type="button"
              role="tab"
              aria-selected={ix === i}
              onClick={() => setI(ix)}
              className={'rd-code-tab' + (ix === i ? ' is-active' : '')}
            >
              {t.label}
            </button>
          ))}
        </div>
      )}
      <div className="rd-code-body">
        <Highlight theme={rdTheme} code={current.code.trimEnd()} language={current.language ?? 'bash'}>
          {({ className, style, tokens, getLineProps, getTokenProps }) => (
            <pre className={className} style={style}>
              {tokens.map((line, li) => {
                const lineProps = getLineProps({ line, key: li });
                return (
                  <div {...lineProps} key={li}>
                    {line.map((token, ti) => {
                      const tokenProps = getTokenProps({ token, key: ti });
                      return <span {...tokenProps} key={ti} />;
                    })}
                  </div>
                );
              })}
            </pre>
          )}
        </Highlight>
        <button type="button" className="rd-code-copy" onClick={copy} aria-label="Copy code">
          {copied ? <Icons.check width="11" height="11" /> : <Icons.copy width="11" height="11" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
    </div>
  );
}

export default CodeTabs;
