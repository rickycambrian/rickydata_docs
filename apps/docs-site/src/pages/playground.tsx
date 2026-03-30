import React from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

function ChatFallback() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: 400,
        borderRadius: 8,
        border: '1px solid var(--ifm-color-emphasis-200)',
        background: 'var(--ifm-background-surface-color, var(--ifm-color-emphasis-100))',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <div>
        <h3 style={{ marginBottom: '0.5rem' }}>Connect wallet to try the chat playground</h3>
        <p style={{ color: 'var(--ifm-color-emphasis-600)', margin: 0 }}>
          Sign in to chat with AI agents that have access to thousands of MCP tools.
        </p>
      </div>
    </div>
  );
}

function AgentSidebar() {
  return (
    <BrowserOnly fallback={<div style={{ padding: '1rem' }}>Loading agents...</div>}>
      {() => {
        const React = require('react');
        const { useAgents } = require('@rickydata/react');

        function AgentList() {
          const { data: agents, isLoading } = useAgents();

          if (isLoading) {
            return <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>Loading agents...</p>;
          }

          if (!agents || agents.length === 0) {
            return <p style={{ color: 'var(--ifm-color-emphasis-600)' }}>No agents available</p>;
          }

          return (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
              {agents.map((agent: { id: string; name: string; description?: string }) => (
                <li
                  key={agent.id}
                  style={{
                    padding: '0.75rem',
                    borderBottom: '1px solid var(--ifm-color-emphasis-200)',
                  }}
                >
                  <strong style={{ fontSize: '0.9rem' }}>{agent.name}</strong>
                  {agent.description && (
                    <p
                      style={{
                        fontSize: '0.8rem',
                        color: 'var(--ifm-color-emphasis-600)',
                        margin: '0.25rem 0 0',
                      }}
                    >
                      {agent.description}
                    </p>
                  )}
                </li>
              ))}
            </ul>
          );
        }

        return <AgentList />;
      }}
    </BrowserOnly>
  );
}

function ChatEmbed() {
  return (
    <BrowserOnly fallback={<ChatFallback />}>
      {() => {
        const { AgentChatEmbed } = require('@rickydata/chat');
        return (
          <AgentChatEmbed
            agentId="erc8004-expert"
            gatewayUrl="https://agents.rickydata.org"
          />
        );
      }}
    </BrowserOnly>
  );
}

export default function Playground(): JSX.Element {
  return (
    <Layout
      title="Playground"
      description="Chat with AI agents that have access to thousands of MCP tools"
    >
      <main
        style={{
          display: 'flex',
          maxWidth: 1200,
          margin: '0 auto',
          padding: '1.5rem',
          gap: '1.5rem',
          minHeight: 'calc(100vh - 60px)',
        }}
      >
        {/* Sidebar */}
        <aside
          style={{
            width: 260,
            flexShrink: 0,
            borderRight: '1px solid var(--ifm-color-emphasis-200)',
            paddingRight: '1.5rem',
          }}
        >
          <h2 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '1rem' }}>
            Agents
          </h2>
          <AgentSidebar />
          <div
            style={{
              marginTop: '1.5rem',
              padding: '0.75rem',
              borderRadius: 6,
              background: 'var(--ifm-color-emphasis-100)',
              fontSize: '0.8rem',
              color: 'var(--ifm-color-emphasis-600)',
            }}
          >
            <strong>Default:</strong> erc8004-expert
            <br />
            <strong>Free tier:</strong> 100 requests/day
            <br />
            <strong>Model:</strong> MiniMax-M2.7
          </div>
        </aside>

        {/* Chat area */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ marginBottom: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: 0 }}>
              Chat Playground
            </h1>
            <p style={{ color: 'var(--ifm-color-emphasis-600)', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
              Chat with AI agents that have full access to MCP tools.
              BYOK with your Anthropic key or use the free tier.
            </p>
          </div>
          <ChatEmbed />
        </div>
      </main>
    </Layout>
  );
}
