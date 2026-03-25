import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Underline from '@tiptap/extension-underline'
import Link from '@tiptap/extension-link'
import Image from '@tiptap/extension-image'
import Placeholder from '@tiptap/extension-placeholder'
import CharacterCount from '@tiptap/extension-character-count'
import { useState, useEffect } from 'react'
import { Button } from '../../components/ui/button'
import {
    Bold,
    Italic,
    Underline as UnderlineIcon,
    Strikethrough,
    Heading1,
    Heading2,
    Heading3,
    FileCodeCorner,
    List,
    ListOrdered,
    Link as LinkIcon,
    Image as ImageIcon,
    Code,
    Smartphone,
    Braces,
    Undo,
    Redo
} from 'lucide-react'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TipTapEditorProps {
    content: string
    onChange: (html: string) => void
    placeholder?: string
}

export const TipTapEditor = ({ content, onChange, placeholder = "Start composing your message..." }: TipTapEditorProps) => {
    const [viewMode, setViewMode] = useState<'visual' | 'html'>('visual')
    const [showMobilePreview, setShowMobilePreview] = useState(false)
    const [htmlContent, setHtmlContent] = useState(content)

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Underline,
            Link.configure({
                openOnClick: false,
                HTMLAttributes: {
                    class: 'text-[#4318FF] underline underline-offset-4',
                },
            }),
            Image.configure({
                HTMLAttributes: {
                    class: 'rounded-xl max-w-full h-auto',
                },
            }),
            Placeholder.configure({
                placeholder,
            }),
            CharacterCount,
        ],
        content: content,
        onUpdate: ({ editor }) => {
            const html = editor.getHTML()
            setHtmlContent(html)
            onChange(html)
        },
        editorProps: {
            attributes: {
                class: 'prose dark:prose-invert max-w-none focus:outline-none min-h-[400px] p-6 text-[#1b254b] dark:text-white',
            },
        },
    })

    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            editor.commands.setContent(content)
        }
    }, [content, editor])

    const insertToken = (token: string) => {
        if (editor) {
            editor.chain().focus().insertContent(`{{${token}}}`).run()
        }
    }

    if (!editor) return null

    const tokens = [
        { label: 'First Name', value: 'first_name' },
        { label: 'Last Name', value: 'last_name' },
        { label: 'Email', value: 'email' },
        { label: 'Subscription Type', value: 'subscription_type' },
        { label: 'Total Bookings', value: 'total_bookings' },
        { label: 'Platform URL', value: 'platform_url' },
    ]

    return (
        <div className="flex flex-col border border-gray-100 dark:border-white/10 rounded-[20px] overflow-hidden bg-white dark:bg-[#111C44]">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-100 dark:border-white/5 bg-[#F4F7FE]/50 dark:bg-white/5 overflow-x-auto">
                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost" size="icon" title="Heading 1"
                        className={`h-8 w-8 rounded-lg ${editor.isActive('heading', { level: 1 }) ? 'bg-[#E2E8F0] dark:bg-white/10 text-[#4318FF]' : ''}`}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    >
                        <Heading1 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost" size="icon" title="Heading 2"
                        className={`h-8 w-8 rounded-lg ${editor.isActive('heading', { level: 2 }) ? 'bg-[#E2E8F0] dark:bg-white/10 text-[#4318FF]' : ''}`}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    >
                        <Heading2 className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost" size="icon" title="Heading 3"
                        className={`h-8 w-8 rounded-lg ${editor.isActive('heading', { level: 3 }) ? 'bg-[#E2E8F0] dark:bg-white/10 text-[#4318FF]' : ''}`}
                        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
                    >
                        <Heading3 className="h-4 w-4" />
                    </Button>
                </div>

                <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1" />

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost" size="icon" title="Bold"
                        className={`h-8 w-8 rounded-lg ${editor.isActive('bold') ? 'bg-[#E2E8F0] dark:bg-white/10 text-[#4318FF]' : ''}`}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost" size="icon" title="Italic"
                        className={`h-8 w-8 rounded-lg ${editor.isActive('italic') ? 'bg-[#E2E8F0] dark:bg-white/10 text-[#4318FF]' : ''}`}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost" size="icon" className={`h-8 w-8 rounded-lg ${editor.isActive('underline') ? 'bg-[#E2E8F0] dark:bg-white/10 text-[#4318FF]' : ''}`}
                        onClick={() => editor.chain().focus().toggleUnderline().run()}
                    >
                        <UnderlineIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost" size="icon" className={`h-8 w-8 rounded-lg ${editor.isActive('strike') ? 'bg-[#E2E8F0] dark:bg-white/10 text-[#4318FF]' : ''}`}
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                    >
                        <Strikethrough className="h-4 w-4" />
                    </Button>
                </div>

                <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1" />

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost" size="icon" title="Blockquote"
                        className={`h-8 w-8 rounded-lg ${editor.isActive('blockquote') ? 'bg-[#E2E8F0] dark:bg-white/10 text-[#4318FF]' : ''}`}
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    >
                        <FileCodeCorner className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost" size="icon" className={`h-8 w-8 rounded-lg ${editor.isActive('bulletList') ? 'bg-[#E2E8F0] dark:bg-white/10 text-[#4318FF]' : ''}`}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost" size="icon" className={`h-8 w-8 rounded-lg ${editor.isActive('orderedList') ? 'bg-[#E2E8F0] dark:bg-white/10 text-[#4318FF]' : ''}`}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Button>
                </div>

                <div className="w-px h-6 bg-gray-200 dark:bg-white/10 mx-1" />

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost" size="icon" className={`h-8 w-8 rounded-lg ${editor.isActive('link') ? 'bg-[#E2E8F0] dark:bg-white/10 text-[#4318FF]' : ''}`}
                        onClick={() => {
                            const url = window.prompt('URL')
                            if (url) editor.chain().focus().setLink({ href: url }).run()
                        }}
                    >
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost" size="icon" className="h-8 w-8 rounded-lg"
                        onClick={() => {
                            const url = window.prompt('Image URL')
                            if (url) editor.chain().focus().setImage({ src: url }).run()
                        }}
                    >
                        <ImageIcon className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg text-[#4318FF] font-bold">
                                <Braces className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="rounded-xl border-gray-100 dark:border-white/10 shadow-xl">
                            {tokens.map(token => (
                                <DropdownMenuItem key={token.value} onClick={() => insertToken(token.value)} className="cursor-pointer font-medium hover:bg-[#F4F7FE] dark:hover:bg-white/5 focus:bg-[#F4F7FE] dark:focus:bg-white/5 focus:text-[#4318FF]">
                                    {token.label}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>

                <div className="flex-1" />

                <div className="flex items-center gap-1">
                    <Button
                        variant="ghost" size="icon" className={`h-8 w-8 rounded-lg ${viewMode === 'html' ? 'bg-[#E2E8F0] dark:bg-white/10 text-[#4318FF]' : ''}`}
                        onClick={() => setViewMode(viewMode === 'visual' ? 'html' : 'visual')}
                    >
                        <Code className="h-4 w-4" />
                    </Button>
                    <Button
                        variant="ghost" size="icon" className={`h-8 w-8 rounded-lg ${showMobilePreview ? 'bg-[#E2E8F0] dark:bg-white/10 text-[#4318FF]' : ''}`}
                        onClick={() => setShowMobilePreview(!showMobilePreview)}
                    >
                        <Smartphone className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            {/* Editor Content */}
            <div className="flex min-h-[400px]">
                {viewMode === 'visual' ? (
                    <EditorContent editor={editor} className="flex-1 overflow-y-auto bg-white dark:bg-[#111C44]" />
                ) : (
                    <textarea
                        className="flex-1 focus:outline-none p-6 text-sm font-mono bg-gray-50 dark:bg-white/5 text-[#1b254b] dark:text-white resize-none"
                        value={htmlContent}
                        onChange={(e) => {
                            setHtmlContent(e.target.value)
                            editor.commands.setContent(e.target.value)
                            onChange(e.target.value)
                        }}
                    />
                )}

                {showMobilePreview && (
                    <div className="w-[300px] border-l border-gray-100 dark:border-white/5 bg-[#F4F7FE]/30 dark:bg-white/3 p-4 flex flex-col items-center">
                        <div className="text-[10px] font-bold text-[#A3AED0] uppercase mb-4">Mobile Preview</div>
                        <div className="w-full max-w-[240px] aspect-[9/16] bg-white dark:bg-black rounded-[32px] border-[6px] border-[#1b254b] dark:border-white/20 shadow-xl overflow-hidden relative">
                            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-20 h-5 bg-[#1b254b] dark:bg-white/20 rounded-b-2xl z-10" />
                            <div className="h-full overflow-y-auto p-4 pt-8 text-[10px] prose prose-sm dark:prose-invert">
                                <div dangerouslySetInnerHTML={{ __html: htmlContent }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer / Stats bar */}
            <div className="flex items-center justify-between px-4 py-2 border-t border-gray-100 dark:border-white/5 bg-[#F4F7FE]/20 dark:bg-white/3 text-[10px] font-bold text-[#A3AED0]">
                <div className="flex items-center gap-4">
                    <span>{editor.storage.characterCount.characters()} Characters</span>
                    <span>{editor.storage.characterCount.words()} Words</span>
                </div>
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => editor.chain().focus().undo().run()}>
                        <Undo className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-5 w-5" onClick={() => editor.chain().focus().redo().run()}>
                        <Redo className="h-3 w-3" />
                    </Button>
                </div>
            </div>
        </div>
    )
}
