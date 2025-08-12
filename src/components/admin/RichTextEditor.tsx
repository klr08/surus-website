import React, { useState, useRef } from 'react';

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps): JSX.Element {
  const [isToolbarVisible, setIsToolbarVisible] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const insertText = (before: string, after: string = ''): void => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    
    const newText = value.substring(0, start) + before + selectedText + after + value.substring(end);
    onChange(newText);

    // Restore cursor position
    setTimeout(() => {
      textarea.setSelectionRange(start + before.length, end + before.length);
      textarea.focus();
    }, 0);
  };

  const insertLink = (): void => {
    const url = prompt('Enter URL:');
    if (url) {
      const text = prompt('Enter link text (optional):') || url;
      insertText(`[${text}](${url})`);
    }
  };

  const insertImage = (): void => {
    const url = prompt('Enter image URL:');
    const alt = prompt('Enter alt text:') || 'Image';
    if (url) {
      insertText(`![${alt}](${url})`);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent): void => {
    // Cmd/Ctrl + B for bold
    if ((e.metaKey || e.ctrlKey) && e.key === 'b') {
      e.preventDefault();
      insertText('**', '**');
    }
    // Cmd/Ctrl + I for italic
    if ((e.metaKey || e.ctrlKey) && e.key === 'i') {
      e.preventDefault();
      insertText('*', '*');
    }
    // Cmd/Ctrl + K for link
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      insertLink();
    }
  };

  return (
    <div className="rich-text-editor">
      <div className={`editor-toolbar ${isToolbarVisible ? 'visible' : ''}`}>
        <button
          type="button"
          onClick={() => insertText('# ')}
          className="toolbar-btn"
          title="Heading 1"
        >
          H1
        </button>
        <button
          type="button"
          onClick={() => insertText('## ')}
          className="toolbar-btn"
          title="Heading 2"
        >
          H2
        </button>
        <button
          type="button"
          onClick={() => insertText('**', '**')}
          className="toolbar-btn"
          title="Bold (Cmd+B)"
        >
          <strong>B</strong>
        </button>
        <button
          type="button"
          onClick={() => insertText('*', '*')}
          className="toolbar-btn"
          title="Italic (Cmd+I)"
        >
          <em>I</em>
        </button>
        <button
          type="button"
          onClick={insertLink}
          className="toolbar-btn"
          title="Link (Cmd+K)"
        >
          🔗
        </button>
        <button
          type="button"
          onClick={insertImage}
          className="toolbar-btn"
          title="Image"
        >
          🖼️
        </button>
        <button
          type="button"
          onClick={() => insertText('- ')}
          className="toolbar-btn"
          title="Bullet List"
        >
          •
        </button>
        <button
          type="button"
          onClick={() => insertText('1. ')}
          className="toolbar-btn"
          title="Numbered List"
        >
          1.
        </button>
        <button
          type="button"
          onClick={() => insertText('> ')}
          className="toolbar-btn"
          title="Quote"
        >
          "
        </button>
        <button
          type="button"
          onClick={() => insertText('```\n', '\n```')}
          className="toolbar-btn"
          title="Code Block"
        >
          { }
        </button>
      </div>

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setIsToolbarVisible(true)}
        onBlur={() => setTimeout(() => setIsToolbarVisible(false), 200)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        className="rich-text-textarea"
        rows={15}
      />

      <div className="editor-help">
        <p><strong>Markdown supported:</strong> **bold**, *italic*, [links](url), ![images](url), # headings, - lists</p>
        <p><strong>Shortcuts:</strong> Cmd+B (bold), Cmd+I (italic), Cmd+K (link)</p>
      </div>
    </div>
  );
}
