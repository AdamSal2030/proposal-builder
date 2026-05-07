'use client'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import UnderlineExt from '@tiptap/extension-underline'
import LinkExt from '@tiptap/extension-link'
import TextAlign from '@tiptap/extension-text-align'
import Highlight from '@tiptap/extension-highlight'
import { TextStyle } from '@tiptap/extension-text-style'
import ImageExt from '@tiptap/extension-image'
import { useEffect, useCallback, useRef } from 'react'

interface ToolbarBtnProps {
  onClick: () => void
  active?: boolean
  title: string
  children: React.ReactNode
}

function Btn({ onClick, active, title, children }: ToolbarBtnProps) {
  return (
    <button
      type="button"
      onMouseDown={(e) => { e.preventDefault(); onClick() }}
      title={title}
      className={`px-2 py-1 rounded text-sm font-medium transition-colors ${active ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-100'}`}
    >
      {children}
    </button>
  )
}

function Divider() {
  return <div className="w-px h-5 bg-gray-200 mx-1 self-center" />
}

interface Props {
  value: string
  onChange: (html: string) => void
  onImageUpload?: (url: string) => void
  placeholder?: string
  minimal?: boolean
}

export default function RichTextEditor({ value, onChange, onImageUpload, placeholder = 'Write something...', minimal = false }: Props) {
  const fileRef = useRef<HTMLInputElement>(null)
  const uploading = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit,
      UnderlineExt,
      LinkExt.configure({ openOnClick: false, HTMLAttributes: { class: 'text-blue-600 underline' } }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Highlight.configure({ multicolor: false }),
      TextStyle,
      ImageExt.configure({ inline: false, allowBase64: false }),
    ],
    content: value || '',
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: {
      attributes: {
        class: 'prose prose-sm max-w-none focus:outline-none min-h-[100px] px-4 py-3',
        'data-placeholder': placeholder,
      },
    },
  })

  useEffect(() => {
    if (editor && value !== editor.getHTML() && !editor.isFocused) {
      editor.commands.setContent(value || '')
    }
  }, [value, editor])

  const handleImageFile = useCallback(async (file: File) => {
    if (uploading.current) return
    uploading.current = true
    const formData = new FormData()
    formData.append('file', file)
    const res = await fetch('/api/images', { method: 'POST', body: formData })
    if (res.ok) {
      const { url } = await res.json()
      editor?.chain().focus().setImage({ src: url }).run()
      onImageUpload?.(url)
    }
    uploading.current = false
  }, [editor, onImageUpload])

  const setLink = useCallback(() => {
    const previous = editor?.getAttributes('link').href ?? ''
    const url = window.prompt('Enter URL', previous)
    if (url === null) return
    if (url === '') { editor?.chain().focus().extendMarkRange('link').unsetLink().run(); return }
    editor?.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }, [editor])

  if (!editor) return null

  return (
    <div className="border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent transition-all">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50/80">
        <Btn onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold">
          <strong>B</strong>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic">
          <em>I</em>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleUnderline().run()} active={editor.isActive('underline')} title="Underline">
          <span className="underline">U</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleStrike().run()} active={editor.isActive('strike')} title="Strikethrough">
          <span className="line-through">S</span>
        </Btn>
        <Btn onClick={() => editor.chain().focus().toggleHighlight().run()} active={editor.isActive('highlight')} title="Highlight">
          <span style={{ background: 'linear-gradient(120deg,#ffd63388 0,#ffd63388 100%)' }} className="px-0.5">H</span>
        </Btn>

        {!minimal && (
          <>
            <Divider />
            <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2">H2</Btn>
            <Btn onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3">H3</Btn>

            <Divider />
            <Btn onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><circle cx="2" cy="4" r="1.2"/><rect x="5" y="3.2" width="9" height="1.6" rx="0.8"/><circle cx="2" cy="8" r="1.2"/><rect x="5" y="7.2" width="9" height="1.6" rx="0.8"/><circle cx="2" cy="12" r="1.2"/><rect x="5" y="11.2" width="9" height="1.6" rx="0.8"/></svg>
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Numbered List">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><text x="0" y="5" fontSize="5" fontWeight="bold">1.</text><rect x="5" y="3.2" width="9" height="1.6" rx="0.8"/><text x="0" y="9" fontSize="5" fontWeight="bold">2.</text><rect x="5" y="7.2" width="9" height="1.6" rx="0.8"/><text x="0" y="13" fontSize="5" fontWeight="bold">3.</text><rect x="5" y="11.2" width="9" height="1.6" rx="0.8"/></svg>
            </Btn>
            <Btn onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><rect x="0" y="3" width="2" height="10" rx="1"/><rect x="5" y="3" width="2" height="10" rx="1"/><rect x="3" y="4" width="12" height="1.5" rx="0.75"/><rect x="3" y="7" width="10" height="1.5" rx="0.75"/><rect x="3" y="10" width="11" height="1.5" rx="0.75"/></svg>
            </Btn>

            <Divider />
            <Btn onClick={() => editor.chain().focus().setTextAlign('left').run()} active={editor.isActive({ textAlign: 'left' })} title="Align Left">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><rect x="0" y="2" width="14" height="2" rx="1"/><rect x="0" y="6" width="10" height="2" rx="1"/><rect x="0" y="10" width="14" height="2" rx="1"/><rect x="0" y="14" width="8" height="2" rx="1"/></svg>
            </Btn>
            <Btn onClick={() => editor.chain().focus().setTextAlign('center').run()} active={editor.isActive({ textAlign: 'center' })} title="Align Center">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><rect x="1" y="2" width="14" height="2" rx="1"/><rect x="3" y="6" width="10" height="2" rx="1"/><rect x="1" y="10" width="14" height="2" rx="1"/><rect x="4" y="14" width="8" height="2" rx="1"/></svg>
            </Btn>

            <Divider />
            <Btn onClick={setLink} active={editor.isActive('link')} title="Insert Link">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M6.5 9.5a3.5 3.5 0 005 0l2-2a3.5 3.5 0 00-5-5l-1 1"/><path d="M9.5 6.5a3.5 3.5 0 00-5 0l-2 2a3.5 3.5 0 005 5l1-1"/></svg>
            </Btn>
            <Btn onClick={() => fileRef.current?.click()} active={false} title="Insert Image">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="2" width="14" height="12" rx="2"/><circle cx="5.5" cy="6" r="1.5"/><path d="M1 11l4-4 3 3 2-2 5 5"/></svg>
            </Btn>
          </>
        )}
      </div>

      <EditorContent editor={editor} />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => { const f = e.target.files?.[0]; if (f) handleImageFile(f) }}
      />
    </div>
  )
}
