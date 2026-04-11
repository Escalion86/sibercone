'use client'

import { useEffect, useMemo } from 'react'
import Link from '@tiptap/extension-link'
import Underline from '@tiptap/extension-underline'
import StarterKit from '@tiptap/starter-kit'
import { EditorContent, useEditor } from '@tiptap/react'

function ToolbarButton({ label, onClick, active }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm border transition-colors ${
        active
          ? 'border-indigo-600 bg-indigo-50 text-indigo-700'
          : 'border-gray-200 text-gray-700 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  )
}

export default function RichTextEditor({ value, onChange }) {
  const initialContent = useMemo(() => value || '', [value])

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: false,
      }),
      Underline,
      Link.configure({
        openOnClick: false,
        autolink: true,
        protocols: ['http', 'https', 'mailto', 'tel'],
      }),
    ],
    content: initialContent,
    editorProps: {
      attributes: {
        class:
          'min-h-44 px-4 py-3 focus:outline-none prose prose-sm max-w-none',
      },
    },
    onUpdate({ editor: currentEditor }) {
      onChange(currentEditor.getHTML())
    },
  })

  useEffect(() => {
    if (!editor) return
    const nextValue = value || ''
    if (editor.getHTML() !== nextValue) {
      editor.commands.setContent(nextValue, { emitUpdate: false })
    }
  }, [editor, value])

  const setLink = () => {
    if (!editor) return
    const previousUrl = editor.getAttributes('link').href
    const url = window.prompt('Введите URL ссылки', previousUrl || 'https://')

    if (url === null) return

    const normalized = url.trim()
    if (!normalized) {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: normalized }).run()
  }

  if (!editor) {
    return (
      <div className="w-full border border-gray-200 rounded-xl p-4 text-sm text-gray-400">
        Загрузка редактора...
      </div>
    )
  }

  return (
    <div className="w-full border border-gray-200 rounded-xl overflow-hidden">
      <div className="flex flex-wrap gap-2 p-3 border-b border-gray-100 bg-gray-50">
        <ToolbarButton
          label="Ж"
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
        />
        <ToolbarButton
          label="К"
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
        />
        <ToolbarButton
          label="Ч"
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          active={editor.isActive('underline')}
        />
        <ToolbarButton
          label="Ссылка"
          onClick={setLink}
          active={editor.isActive('link')}
        />
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
