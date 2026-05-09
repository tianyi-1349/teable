import { useCallback, useRef, useState } from 'react';
import { ArrowUpRight, Paperclip } from '@teable/icons';
import { Loader2 } from 'lucide-react';
import { Button, cn, Textarea } from '@teable/ui-lib';
import { useTranslation } from 'next-i18next';

export interface IAiChatInputProps {
  onSendMessage: (
    content: string,
    attachments?: Array<{ name: string; url: string; type: string }>
  ) => void;
  isLoading: boolean;
  baseId: string;
  tableId?: string;
}

export const AiChatInput = (props: IAiChatInputProps) => {
  const { onSendMessage, isLoading, baseId, tableId } = props;
  const { t } = useTranslation('common');
  const [content, setContent] = useState('');
  const [attachments, setAttachments] = useState<
    Array<{ name: string; url: string; type: string }>
  >([]);
  const [showAtMenu, setShowAtMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSend = useCallback(() => {
    if (!content.trim() || isLoading) return;
    onSendMessage(content.trim(), attachments.length > 0 ? attachments : undefined);
    setContent('');
    setAttachments([]);
  }, [content, attachments, isLoading, onSendMessage]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setContent(value);

      // Show @ menu when @ is typed
      if (value.endsWith('@')) {
        setShowAtMenu(true);
      } else {
        setShowAtMenu(false);
      }
    },
    []
  );

  const handleAtSelect = useCallback((type: string, id: string, name: string) => {
    setContent((prev) => {
      const atIndex = prev.lastIndexOf('@');
      return prev.slice(0, atIndex) + `@${type}:${name} `;
    });
    setShowAtMenu(false);
    textareaRef.current?.focus();
  }, []);

  const handleFileSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    // In real implementation, upload files and get URLs
    const newAttachments = Array.from(files).map((file) => ({
      name: file.name,
      url: URL.createObjectURL(file),
      type: file.type,
    }));
    setAttachments((prev) => [...prev, ...newAttachments]);
    e.target.value = '';
  }, []);

  const removeAttachment = useCallback((index: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  }, []);

  return (
    <div className="border-t p-4">
      {/* Attachments */}
      {attachments.length > 0 && (
        <div className="mb-2 flex flex-wrap gap-2">
          {attachments.map((file, index) => (
            <div
              key={index}
              className="flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs"
            >
              <Paperclip className="size-3" />
              <span className="max-w-[150px] truncate">{file.name}</span>
              <button
                onClick={() => removeAttachment(index)}
                className="ml-1 text-muted-foreground hover:text-foreground"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      {/* @ Mention Menu */}
      {showAtMenu && (
        <div className="mb-2 rounded-lg border bg-popover p-2 shadow-sm">
          <div className="text-xs font-medium text-muted-foreground mb-1">
            {t('aiChat.atMenu.title', 'Reference nodes')}
          </div>
          <div className="space-y-1">
            <button
              onClick={() => handleAtSelect('table', 'current', 'Current Table')}
              className="w-full rounded px-2 py-1 text-left text-sm hover:bg-muted"
            >
              {t('aiChat.atMenu.currentTable', 'Current Table')}
            </button>
            <button
              onClick={() => handleAtSelect('view', 'current', 'Current View')}
              className="w-full rounded px-2 py-1 text-left text-sm hover:bg-muted"
            >
              {t('aiChat.atMenu.currentView', 'Current View')}
            </button>
          </div>
        </div>
      )}

      {/* Input Area */}
      <div className="flex items-end gap-2">
        <div className="flex-1 relative">
          <Textarea
            ref={textareaRef}
            value={content}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={t(
              'aiChat.input.placeholder',
              'Ask about your data... Use @ to reference nodes'
            )}
            className={cn(
              'min-h-[60px] resize-none pr-20',
              'focus-visible:ring-1'
            )}
            rows={1}
          />

          {/* Input Actions */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0"
              onClick={handleFileSelect}
            >
              <Paperclip className="size-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0"
              onClick={() => setShowAtMenu(!showAtMenu)}
            >
              <span className="text-sm font-bold">@</span>
            </Button>
          </div>
        </div>

        <Button
          onClick={handleSend}
          disabled={!content.trim() || isLoading}
          size="sm"
          className="size-10 shrink-0"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <ArrowUpRight className="size-4" />
          )}
        </Button>
      </div>

      {/* Context info */}
      {tableId && (
        <div className="mt-2 text-xs text-muted-foreground">
          {t('aiChat.input.context', 'Context: Table')}
        </div>
      )}
    </div>
  );
};
