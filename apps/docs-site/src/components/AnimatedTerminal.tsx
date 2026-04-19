import React, { useEffect, useRef, useState } from 'react';
import BrowserOnly from '@docusaurus/BrowserOnly';

export type TerminalLine = {
  t: 'cmd' | 'out' | 'blank' | 'ok' | 'dim';
  text?: string;
  delay?: number;
};

export interface AnimatedTerminalProps {
  lines?: TerminalLine[];
  restart?: number;
  autoStart?: boolean;
  title?: string;
}

export const CLI_DEMO: TerminalLine[] = [
  { t: 'cmd', text: 'npm install -g rickydata', delay: 250 },
  { t: 'dim', text: 'added 42 packages in 3.1s' },
  { t: 'blank' },
  { t: 'cmd', text: 'rickydata mcp connect --client claude-code', delay: 300 },
  { t: 'dim', text: '\u2192 detecting claude-code config at ~/.claude/claude.json' },
  { t: 'ok', text: 'wrote mcpServers.rickydata' },
  { t: 'ok', text: 'registered 5,284 tools across 312 servers' },
  { t: 'blank' },
  { t: 'cmd', text: 'rickydata chat erc-8004-expert "what chains are supported?"', delay: 300 },
  { t: 'dim', text: '\u2022 connecting to agent via MCP gateway...' },
  { t: 'dim', text: '\u2022 calling 3 tools: list_chains, get_registry, get_stats' },
  { t: 'out', text: '45+ EVM chains. Base, Optimism, Arbitrum, Polygon,' },
  { t: 'out', text: 'and 41 others. 103,214 registered agents.' },
  { t: 'blank' },
  { t: 'dim', text: 'paid $0.0031 via x402 \u00b7 balance $22.92 USDC' },
];

function StaticFallback({ lines, title }: { lines: TerminalLine[]; title: string }) {
  return (
    <div className="rd-terminal">
      <div className="rd-terminal-bar">
        <span className="rd-terminal-dot" style={{ background: '#ff5f57' }} />
        <span className="rd-terminal-dot" style={{ background: '#febc2e' }} />
        <span className="rd-terminal-dot" style={{ background: '#28c840' }} />
        <span className="rd-terminal-title">{title}</span>
      </div>
      <div className="rd-terminal-body">
        {lines.map((l, i) => {
          if (l.t === 'blank') return <div key={i} style={{ height: 6 }} />;
          if (l.t === 'cmd')
            return (
              <div key={i}>
                <span className="tk-prompt">$</span>{' '}
                <span style={{ color: '#fff' }}>{l.text}</span>
              </div>
            );
          if (l.t === 'ok')
            return (
              <div key={i}>
                <span style={{ color: 'oklch(0.72 0.17 155)' }}>{'\u2713'}</span>{' '}
                <span style={{ color: 'oklch(0.85 0.009 55)' }}>{l.text}</span>
              </div>
            );
          if (l.t === 'dim')
            return (
              <div key={i} style={{ color: 'oklch(0.58 0.01 55)' }}>
                {l.text}
              </div>
            );
          return (
            <div key={i} style={{ color: 'oklch(0.85 0.02 60)' }}>
              {l.text}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function AnimatedTerminalInner({
  lines,
  restart = 0,
  autoStart = true,
  title,
}: Required<Pick<AnimatedTerminalProps, 'lines' | 'title'>> &
  Pick<AnimatedTerminalProps, 'restart' | 'autoStart'>) {
  const [step, setStep] = useState(0);
  const [typed, setTyped] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  useEffect(() => {
    setStep(0);
    setTyped('');
  }, [restart]);

  useEffect(() => {
    if (!autoStart) return;
    if (timerRef.current) clearTimeout(timerRef.current);
    if (step >= lines.length) {
      timerRef.current = setTimeout(() => {
        setStep(0);
        setTyped('');
      }, 4000);
      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
    const line = lines[step];
    if (line.t === 'cmd') {
      const target = line.text ?? '';
      if (typed.length < target.length) {
        timerRef.current = setTimeout(
          () => setTyped(target.slice(0, typed.length + 1)),
          35 + Math.random() * 45,
        );
      } else {
        timerRef.current = setTimeout(() => {
          setStep((s) => s + 1);
          setTyped('');
        }, line.delay ?? 350);
      }
    } else {
      timerRef.current = setTimeout(() => setStep((s) => s + 1), line.delay ?? 220);
    }
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [step, typed, lines, autoStart]);

  const rendered = lines.slice(0, step).map((l, i) => {
    if (l.t === 'blank') return <div key={i} style={{ height: 6 }} />;
    if (l.t === 'cmd')
      return (
        <div key={i}>
          <span className="tk-prompt">$</span>{' '}
          <span style={{ color: '#fff' }}>{l.text}</span>
        </div>
      );
    if (l.t === 'ok')
      return (
        <div key={i}>
          <span style={{ color: 'oklch(0.72 0.17 155)' }}>{'\u2713'}</span>{' '}
          <span style={{ color: 'oklch(0.85 0.009 55)' }}>{l.text}</span>
        </div>
      );
    if (l.t === 'dim')
      return (
        <div key={i} style={{ color: 'oklch(0.58 0.01 55)' }}>
          {l.text}
        </div>
      );
    return (
      <div key={i} style={{ color: 'oklch(0.85 0.02 60)' }}>
        {l.text}
      </div>
    );
  });

  const currentLine = lines[step];
  const currentJsx =
    currentLine?.t === 'cmd' ? (
      <div>
        <span className="tk-prompt">$</span>{' '}
        <span style={{ color: '#fff' }}>{typed}</span>
        <span className="rd-term-caret" />
      </div>
    ) : null;

  return (
    <div className="rd-terminal">
      <div className="rd-terminal-bar">
        <span className="rd-terminal-dot" style={{ background: '#ff5f57' }} />
        <span className="rd-terminal-dot" style={{ background: '#febc2e' }} />
        <span className="rd-terminal-dot" style={{ background: '#28c840' }} />
        <span className="rd-terminal-title">{title}</span>
      </div>
      <div className="rd-terminal-body">
        {rendered}
        {currentJsx}
      </div>
    </div>
  );
}

export function AnimatedTerminal({
  lines = CLI_DEMO,
  restart = 0,
  autoStart = true,
  title = 'rickydata \u2014 ~/your-project',
}: AnimatedTerminalProps) {
  return (
    <BrowserOnly fallback={<StaticFallback lines={lines} title={title} />}>
      {() => (
        <AnimatedTerminalInner
          lines={lines}
          restart={restart}
          autoStart={autoStart}
          title={title}
        />
      )}
    </BrowserOnly>
  );
}

export default AnimatedTerminal;
