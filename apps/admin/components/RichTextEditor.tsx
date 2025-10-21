'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import TiptapImage from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import { useEffect, useState } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  onImageInsert?: () => void;
  placeholder?: string;
}

export function RichTextEditor({
  content,
  onChange,
  onImageInsert,
  placeholder = 'Start writing...',
}: RichTextEditorProps) {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TiptapImage.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full h-auto',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-blue-500 underline',
        },
      }),
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl max-w-none focus:outline-none min-h-[400px] p-4',
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const addLink = () => {
    if (linkUrl) {
      editor.chain().focus().setLink({ href: linkUrl }).run();
      setLinkUrl('');
      setShowLinkDialog(false);
    }
  };

  const removeLink = () => {
    editor.chain().focus().unsetLink().run();
  };

  const addImage = () => {
    if (onImageInsert) {
      onImageInsert();
    } else {
      const url = prompt('Enter image URL:');
      if (url) {
        editor.chain().focus().setImage({ src: url }).run();
      }
    }
  };

  const MenuButton = ({ onClick, active, children, title }: any) => (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded transition-colors ${
        active
          ? 'bg-blue-100 text-blue-700'
          : 'hover:bg-gray-100 text-gray-700'
      }`}
      title={title}
    >
      {children}
    </button>
  );

  return (
    <div className="border rounded-lg overflow-hidden bg-white">
      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-2 flex gap-1 flex-wrap items-center">
        {/* Text Formatting */}
        <div className="flex gap-1 border-r pr-2">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBold().run()}
            active={editor.isActive('bold')}
            title="Bold (Ctrl+B)"
          >
            <strong>B</strong>
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleItalic().run()}
            active={editor.isActive('italic')}
            title="Italic (Ctrl+I)"
          >
            <em>I</em>
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleStrike().run()}
            active={editor.isActive('strike')}
            title="Strikethrough"
          >
            <s>S</s>
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleCode().run()}
            active={editor.isActive('code')}
            title="Inline Code"
          >
            {'</>'}
          </MenuButton>
        </div>

        {/* Headings */}
        <div className="flex gap-1 border-r pr-2">
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
            active={editor.isActive('heading', { level: 1 })}
            title="Heading 1"
          >
            H1
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            active={editor.isActive('heading', { level: 2 })}
            title="Heading 2"
          >
            H2
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            active={editor.isActive('heading', { level: 3 })}
            title="Heading 3"
          >
            H3
          </MenuButton>
        </div>

        {/* Lists */}
        <div className="flex gap-1 border-r pr-2">
          <MenuButton
            onClick={() => editor.chain().focus().toggleBulletList().run()}
            active={editor.isActive('bulletList')}
            title="Bullet List"
          >
            • List
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleOrderedList().run()}
            active={editor.isActive('orderedList')}
            title="Numbered List"
          >
            1. List
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().toggleBlockquote().run()}
            active={editor.isActive('blockquote')}
            title="Quote"
          >
            "
          </MenuButton>
        </div>

        {/* Links & Images */}
        <div className="flex gap-1 border-r pr-2">
          <MenuButton
            onClick={() => setShowLinkDialog(true)}
            active={editor.isActive('link')}
            title="Add Link"
          >
            🔗
          </MenuButton>
          {editor.isActive('link') && (
            <MenuButton
              onClick={removeLink}
              active={false}
              title="Remove Link"
            >
              ⛓️‍💥
            </MenuButton>
          )}
          <MenuButton
            onClick={addImage}
            active={false}
            title="Add Image"
          >
            🖼️
          </MenuButton>
        </div>

        {/* Code Block */}
        <div className="flex gap-1 border-r pr-2">
          <MenuButton
            onClick={() => editor.chain().focus().toggleCodeBlock().run()}
            active={editor.isActive('codeBlock')}
            title="Code Block"
          >
            {'</>'}
          </MenuButton>
        </div>

        {/* Undo/Redo */}
        <div className="flex gap-1">
          <MenuButton
            onClick={() => editor.chain().focus().undo().run()}
            active={false}
            title="Undo (Ctrl+Z)"
          >
            ↶
          </MenuButton>
          <MenuButton
            onClick={() => editor.chain().focus().redo().run()}
            active={false}
            title="Redo (Ctrl+Y)"
          >
            ↷
          </MenuButton>
        </div>
      </div>

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="bg-blue-50 border-b p-3 flex gap-2 items-center">
          <input
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://example.com"
            className="flex-1 px-3 py-1.5 border rounded"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                addLink();
              } else if (e.key === 'Escape') {
                setShowLinkDialog(false);
              }
            }}
            autoFocus
          />
          <button
            onClick={addLink}
            className="px-4 py-1.5 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Add
          </button>
          <button
            onClick={() => {
              setShowLinkDialog(false);
              setLinkUrl('');
            }}
            className="px-4 py-1.5 bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Editor */}
      <EditorContent editor={editor} />

      {/* Status Bar */}
      <div className="border-t bg-gray-50 p-2 text-xs text-gray-500 flex justify-between">
        <span>
          {editor.storage.characterCount?.characters() || 0} characters •{' '}
          {editor.storage.characterCount?.words() || 0} words
        </span>
        <span>Rich Text Editor</span>
      </div>
    </div>
  );
}

export default RichTextEditor;



