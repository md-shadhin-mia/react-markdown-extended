import React, { useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import mermaid from 'mermaid';
import 'katex/dist/katex.min.css';

mermaid.initialize({
  startOnLoad: false,
  securityLevel: 'loose',
  theme: 'default',
});

function MermaidDiagram({ chart }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!ref.current || typeof window === 'undefined') return;

    let cancelled = false;

    const renderDiagram = async () => {
      try {
        const { svg } = await mermaid.render(
          `mermaid-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          chart,
        );

        if (!cancelled && ref.current) {
          ref.current.innerHTML = svg;
        }
      } catch (error) {
        if (!cancelled && ref.current) {
          ref.current.innerHTML = `<pre style="color: #d32f2f; white-space: pre-wrap;">${String(error)}</pre>`;
        }
      }
    };

    renderDiagram();

    return () => {
      cancelled = true;
    };
  }, [chart]);

  return (
    <div
      ref={ref}
      style={{
        overflowX: 'auto',
        margin: '1rem 0',
        background: '#fafafa',
        borderRadius: '8px',
        padding: '1rem',
      }}
    />
  );
}

export default function MarkdownRenderer({ children, className }) {
  const source = typeof children === 'string' ? children : String(children ?? '');

  return (
    <div className={className}>
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
        components={{
          code({ inline, className: codeClassName, children: codeChildren, ...props }) {
            const text = String(codeChildren).replace(/\n$/, '');
            const match = /language-(\w+)/.exec(codeClassName || '');
            const language = match ? match[1] : '';

            if (!inline && language === 'mermaid') {
              return <MermaidDiagram chart={text} />;
            }

            return (
              <code className={codeClassName} {...props}>
                {codeChildren}
              </code>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
