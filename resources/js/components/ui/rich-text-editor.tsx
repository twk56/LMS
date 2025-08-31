import { forwardRef, useImperativeHandle, useRef, useState, useCallback, useEffect } from 'react';
import { Button } from './button';
import { cn } from '@/lib/utils';
import { Bold, Italic, Underline, List, ListOrdered, Type, Undo, Redo } from 'lucide-react';

interface RichTextEditorProps {
    value?: string;
    onChange?: (value: string) => void;
    placeholder?: string;
    className?: string;
    disabled?: boolean;
    minHeight?: string;
}

export interface RichTextEditorRef {
    getValue: () => string;
    setValue: (value: string) => void;
    focus: () => void;
    clear: () => void;
}

// Simple HTML sanitizer
const sanitizeHtml = (html: string): string => {
    const div = document.createElement('div');
    div.innerHTML = html;
    
    // Allow only safe tags
    const allowedTags = ['p', 'br', 'strong', 'b', 'em', 'i', 'u', 'ul', 'ol', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'];
    const allowedAttributes = ['class', 'style'];
    
    const sanitizeNode = (node: Node): Node | null => {
        if (node.nodeType === Node.TEXT_NODE) {
            return node.cloneNode();
        }
        
        if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            const tagName = element.tagName.toLowerCase();
            
            if (!allowedTags.includes(tagName)) {
                return document.createTextNode(element.textContent || '');
            }
            
            const newElement = document.createElement(tagName);
            
            // Copy allowed attributes
            for (const attr of allowedAttributes) {
                if (element.hasAttribute(attr)) {
                    newElement.setAttribute(attr, element.getAttribute(attr) || '');
                }
            }
            
            // Recursively sanitize child nodes
            for (const child of Array.from(element.childNodes)) {
                const sanitizedChild = sanitizeNode(child);
                if (sanitizedChild) {
                    newElement.appendChild(sanitizedChild);
                }
            }
            
            return newElement;
        }
        
        return null;
    };
    
    const sanitized = sanitizeNode(div);
    return sanitized ? sanitized.textContent || '' : '';
};

export const RichTextEditor = forwardRef<RichTextEditorRef, RichTextEditorProps>(
    ({ value = '', onChange, placeholder, className, disabled, minHeight = '200px' }, ref) => {
        const editorRef = useRef<HTMLDivElement>(null);
        const [isFocused, setIsFocused] = useState(false);
        const [canUndo, setCanUndo] = useState(false);
        const [canRedo, setCanRedo] = useState(false);
        const [isBold, setIsBold] = useState(false);
        const [isItalic, setIsItalic] = useState(false);
        const [isUnderline, setIsUnderline] = useState(false);
        const timeoutRef = useRef<NodeJS.Timeout>();

        useImperativeHandle(ref, () => ({
            getValue: () => {
                const content = editorRef.current?.innerHTML || '';
                return sanitizeHtml(content);
            },
            setValue: (newValue: string) => {
                if (editorRef.current) {
                    const sanitized = sanitizeHtml(newValue);
                    editorRef.current.innerHTML = sanitized;
                }
            },
            focus: () => editorRef.current?.focus(),
            clear: () => {
                if (editorRef.current) {
                    editorRef.current.innerHTML = '';
                }
            },
        }));

        // Debounced onChange handler
        const debouncedOnChange = useCallback((content: string) => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
            timeoutRef.current = setTimeout(() => {
                onChange?.(content);
            }, 300);
        }, [onChange]);

        const handleInput = useCallback(() => {
            const content = editorRef.current?.innerHTML || '';
            debouncedOnChange(content);
            updateToolbarState();
        }, [debouncedOnChange]);

        const updateToolbarState = useCallback(() => {
            if (!editorRef.current) return;
            
            const selection = window.getSelection();
            if (selection && selection.rangeCount > 0) {
                const range = selection.getRangeAt(0);
                const parentElement = range.commonAncestorContainer.parentElement;
                
                setIsBold(!!parentElement?.closest('strong, b'));
                setIsItalic(!!parentElement?.closest('em, i'));
                setIsUnderline(!!parentElement?.closest('u'));
            }
        }, []);

        const insertText = useCallback((text: string) => {
            if (editorRef.current && !disabled) {
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                    const range = selection.getRangeAt(0);
                    range.deleteContents();
                    range.insertNode(document.createTextNode(text));
                    editorRef.current.focus();
                    handleInput();
                }
            }
        }, [disabled, handleInput]);

        const formatText = useCallback((command: string, value?: string) => {
            if (editorRef.current && !disabled) {
                try {
                    document.execCommand(command, false, value);
                    editorRef.current.focus();
                    handleInput();
                    updateToolbarState();
                } catch (error) {
                    console.warn('Format command not supported:', command);
                }
            }
        }, [disabled, handleInput, updateToolbarState]);

        const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
            if (e.key === 'Tab') {
                e.preventDefault();
                insertText('    '); // Insert 4 spaces
            }
        }, [insertText]);

        const handlePaste = useCallback((e: React.ClipboardEvent) => {
            e.preventDefault();
            const text = e.clipboardData.getData('text/plain');
            insertText(text);
        }, [insertText]);

        // Update toolbar state when selection changes
        useEffect(() => {
            const handleSelectionChange = () => {
                updateToolbarState();
            };

            document.addEventListener('selectionchange', handleSelectionChange);
            return () => {
                document.removeEventListener('selectionchange', handleSelectionChange);
            };
        }, [updateToolbarState]);

        // Cleanup timeout on unmount
        useEffect(() => {
            return () => {
                if (timeoutRef.current) {
                    clearTimeout(timeoutRef.current);
                }
            };
        }, []);

        return (
            <div className={cn('space-y-2', className)}>
                {/* Toolbar */}
                <div 
                    className="flex flex-wrap gap-1 p-2 border border-input rounded-t-md bg-muted"
                    role="toolbar"
                    aria-label="Rich text editor toolbar"
                >
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText('bold')}
                        className={cn("h-8 w-8 p-0", isBold && "bg-accent")}
                        aria-label="Bold"
                        aria-pressed={isBold}
                    >
                        <Bold className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText('italic')}
                        className={cn("h-8 w-8 p-0", isItalic && "bg-accent")}
                        aria-label="Italic"
                        aria-pressed={isItalic}
                    >
                        <Italic className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText('underline')}
                        className={cn("h-8 w-8 p-0", isUnderline && "bg-accent")}
                        aria-label="Underline"
                        aria-pressed={isUnderline}
                    >
                        <Underline className="h-4 w-4" />
                    </Button>
                    
                    <div className="w-px h-6 bg-border mx-1" />
                    
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText('insertUnorderedList')}
                        className="h-8 w-8 p-0"
                        aria-label="Bullet list"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => formatText('insertOrderedList')}
                        className="h-8 w-8 p-0"
                        aria-label="Numbered list"
                    >
                        <ListOrdered className="h-4 w-4" />
                    </Button>
                    
                    <div className="w-px h-6 bg-border mx-1" />
                    
                    <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => insertText('\n\n')}
                        className="h-8 px-2 text-xs"
                        aria-label="Insert line break"
                    >
                        <Type className="h-3 w-3 mr-1" />
                        Enter
                    </Button>
                </div>

                {/* Editor */}
                <div
                    ref={editorRef}
                    contentEditable={!disabled}
                    onInput={handleInput}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                    onKeyDown={handleKeyDown}
                    onPaste={handlePaste}
                    className={cn(
                        'min-h-[200px] p-3 border border-input rounded-b-md bg-background',
                        'focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
                        isFocused && 'ring-2 ring-ring ring-offset-2',
                        disabled && 'opacity-50 cursor-not-allowed'
                    )}
                    style={{ 
                        whiteSpace: 'pre-wrap',
                        minHeight: minHeight
                    }}
                    role="textbox"
                    aria-label="Rich text editor"
                    aria-multiline="true"
                    aria-placeholder={placeholder}
                    tabIndex={disabled ? -1 : 0}
                    suppressContentEditableWarning
                >
                    {value && <div dangerouslySetInnerHTML={{ __html: sanitizeHtml(value) }} />}
                </div>
                
                {/* Placeholder */}
                {!value && placeholder && (
                    <div className="absolute top-0 left-0 p-3 text-muted-foreground pointer-events-none">
                        {placeholder}
                    </div>
                )}
            </div>
        );
    }
);

RichTextEditor.displayName = 'RichTextEditor'; 