import './tiptap-styles.css';

import CodeBlock from '@tiptap/extension-code-block';
import Placeholder from '@tiptap/extension-placeholder';
import { Markdown } from '@tiptap/markdown';
import { type Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { forwardRef, useImperativeHandle } from 'react';
import { EditorShell, type EditorToolbarItem } from 'ui/til/editor';

export interface TipTapEditorRef {
  getMarkdown: () => string;
  getText: () => string;
}

interface TipTapEditorProps {
  content?: string;
  isSubmitting: boolean;
  onUpdate: (content: string) => void;
}

const buildMenuItems = (editor: Editor): EditorToolbarItem[] => [
  {
    type: 'button',
    key: 'bold',
    tooltip: 'Bold',
    icon: 'bold',
    isActive: editor.isActive('bold'),
    isDisabled: !editor.can().chain().focus().toggleBold().run(),
    onClick: () => editor.chain().focus().toggleBold().run(),
  },
  {
    type: 'button',
    key: 'italic',
    tooltip: 'Italic',
    icon: 'italic',
    isActive: editor.isActive('italic'),
    isDisabled: !editor.can().chain().focus().toggleItalic().run(),
    onClick: () => editor.chain().focus().toggleItalic().run(),
  },
  { type: 'divider', key: 'divider-1' },
  {
    type: 'button',
    key: 'heading-1',
    tooltip: 'Heading 1',
    label: 'H1',
    isActive: editor.isActive('heading', { level: 1 }),
    onClick: () => editor.chain().focus().toggleHeading({ level: 1 }).run(),
  },
  {
    type: 'button',
    key: 'heading-2',
    tooltip: 'Heading 2',
    label: 'H2',
    isActive: editor.isActive('heading', { level: 2 }),
    onClick: () => editor.chain().focus().toggleHeading({ level: 2 }).run(),
  },
  {
    type: 'button',
    key: 'heading-3',
    tooltip: 'Heading 3',
    label: 'H3',
    isActive: editor.isActive('heading', { level: 3 }),
    onClick: () => editor.chain().focus().toggleHeading({ level: 3 }).run(),
  },
  {
    type: 'button',
    key: 'bullet-list',
    tooltip: 'Bullet List',
    icon: 'bulletList',
    isActive: editor.isActive('bulletList'),
    onClick: () => editor.chain().focus().toggleBulletList().run(),
  },
  {
    type: 'button',
    key: 'quote',
    tooltip: 'Quote',
    icon: 'quote',
    isActive: editor.isActive('blockquote'),
    onClick: () => editor.chain().focus().toggleBlockquote().run(),
  },
  {
    type: 'button',
    key: 'code-block',
    tooltip: 'Code Block',
    icon: 'codeBlock',
    isActive: editor.isActive('codeBlock'),
    onClick: () =>
      editor.chain().focus().toggleCodeBlock({ language: 'javascript' }).run(),
  },
];

const TipTapEditor = forwardRef<TipTapEditorRef, TipTapEditorProps>(
  ({ content = '', isSubmitting, onUpdate }, ref) => {
    const editor = useEditor({
      extensions: [
        StarterKit.configure({
          codeBlock: false,
        }),
        CodeBlock.configure({
          defaultLanguage: 'javascript',
        }),
        Markdown,
        Placeholder.configure({
          placeholder: 'Start writing your TIL post...',
        }),
      ],
      content,
      contentType: 'markdown',
      editable: !isSubmitting,
      onUpdate: ({ editor }) => {
        onUpdate(editor.getText());
      },
    });

    useImperativeHandle(
      ref,
      () => ({
        getMarkdown: () => editor?.getMarkdown() || '',
        getText: () => editor?.getText() || '',
      }),
      [editor],
    );

    return (
      <EditorShell
        isLoading={!editor}
        menuItems={editor ? buildMenuItems(editor) : []}
      >
        <EditorContent editor={editor} />
      </EditorShell>
    );
  },
);

TipTapEditor.displayName = 'TipTapEditor';

export { TipTapEditor };
export default TipTapEditor;
