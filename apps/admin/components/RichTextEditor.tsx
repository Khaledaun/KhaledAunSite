'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Undo,
  Redo,
  Code,
  Strikethrough,
} from 'lucide-react';
import { useEffect } from 'react';

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
  editable?: boolean;
}

export function RichTextEditor({
  content,
  onChange,
  placeholder = 'Start writing your content...',
  editable = true,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
    ],
    content,
    editable,
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-xl mx-auto focus:outline-none min-h-[400px] p-4',
      },
    },
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      onChange(html);
    },
  });

  // Update editor content when prop changes (for external updates)
  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
    }
  }, [content, editor]);

  if (!editor) {
    return null;
  }

  const ToolbarButton = ({
    onClick,
    active,
    disabled,
    children,
    title,
  }: {
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    children: React.ReactNode;
    title: string;
  }) => (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={title}
      className={`rounded p-2 transition-colors ${
        active
          ? 'bg-blue-600 text-white'
          : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
    >
      {children}
    </button>
  );

  const ToolbarDivider = () => <div className="mx-1 h-6 w-px bg-gray-300" />;

  return (
    <div className="rounded-lg border border-gray-300 bg-white shadow-sm">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 border-b border-gray-300 bg-gray-50 p-2">
        {/* Text Formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          disabled={!editor.can().chain().focus().toggleBold().run()}
          title="Bold (Ctrl+B)"
        >
          <Bold className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          disabled={!editor.can().chain().focus().toggleItalic().run()}
          title="Italic (Ctrl+I)"
        >
          <Italic className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          disabled={!editor.can().chain().focus().toggleStrike().run()}
          title="Strikethrough"
        >
          <Strikethrough className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          disabled={!editor.can().chain().focus().toggleCode().run()}
          title="Inline Code"
        >
          <Code className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Blockquote */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Blockquote"
        >
          <Quote className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().chain().focus().undo().run()}
          title="Undo (Ctrl+Z)"
        >
          <Undo className="h-4 w-4" />
        </ToolbarButton>
        
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().chain().focus().redo().run()}
          title="Redo (Ctrl+Y)"
        >
          <Redo className="h-4 w-4" />
        </ToolbarButton>

        <ToolbarDivider />

        {/* Word Count & Reading Time */}
        <div className="ml-auto flex items-center gap-4 text-xs text-gray-500">
          <span>
            Words: {editor.storage.characterCount?.words() || editor.getText().split(/\s+/).filter(Boolean).length}
          </span>
          <span>
            Reading time: {Math.ceil((editor.getText().split(/\s+/).filter(Boolean).length || 0) / 200)} min
          </span>
        </div>
      </div>

      {/* Editor Content */}
      <div className="prose-editor">
        <EditorContent editor={editor} />
      </div>

      {/* Footer Info */}
      <div className="border-t border-gray-200 bg-gray-50 px-4 py-2 text-xs text-gray-500">
        <p>
          <strong>Keyboard shortcuts:</strong> Ctrl+B (bold), Ctrl+I (italic), Ctrl+Z (undo), Ctrl+Y (redo)
        </p>
      </div>
    </div>
  );
}
