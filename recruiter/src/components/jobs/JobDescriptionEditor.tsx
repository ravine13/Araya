import { useCallback, useEffect, useRef } from "react";
import { Bold, Italic, List } from "lucide-react";
import { cn } from "@/lib/utils";
import { sanitizeJobDescriptionHtml } from "@/lib/sanitizeHtml";

export function JobDescriptionEditor({
  value,
  onChange,
  placeholder,
  className,
}: {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const lastHtml = useRef(value);

  useEffect(() => {
    if (editorRef.current && value !== lastHtml.current) {
      editorRef.current.innerHTML = value;
      lastHtml.current = value;
    }
  }, [value]);

  const sync = useCallback(() => {
    if (!editorRef.current) return;
    const html = sanitizeJobDescriptionHtml(editorRef.current.innerHTML);
    if (html !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = html;
    }
    lastHtml.current = html;
    onChange(html);
  }, [onChange]);

  const exec = useCallback(
    (command: string) => {
      editorRef.current?.focus();
      document.execCommand(command, false);
      sync();
    },
    [sync],
  );

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData("text/plain");
    document.execCommand("insertText", false, text);
    sync();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const text = e.dataTransfer.getData("text/plain");
    if (text) {
      document.execCommand("insertText", false, text);
      sync();
    }
  };

  return (
    <div
      className={cn(
        "overflow-hidden rounded-lg border border-input bg-card focus-within:ring-2 focus-within:ring-ring",
        className,
      )}
    >
      <div className="flex items-center gap-0.5 border-b border-border bg-muted/30 px-2 py-1.5">
        <ToolbarBtn icon={Bold} label="Bold" onClick={() => exec("bold")} />
        <ToolbarBtn icon={Italic} label="Italic" onClick={() => exec("italic")} />
        <ToolbarBtn icon={List} label="Bullet list" onClick={() => exec("insertUnorderedList")} />
        <span className="ml-auto text-[11px] text-muted-foreground">
          Text only · no images
        </span>
      </div>
      <div
        ref={editorRef}
        contentEditable
        role="textbox"
        aria-multiline
        suppressContentEditableWarning
        onInput={sync}
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        data-placeholder={placeholder}
        className={cn(
          "min-h-[220px] px-4 py-3 text-[13.5px] leading-relaxed outline-none",
          "empty:before:pointer-events-none empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]",
          "[&_ul]:my-3 [&_ul]:list-disc [&_ul]:space-y-1 [&_ul]:pl-6",
          "[&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6",
          "[&_p]:my-2",
          "[&_strong]:font-semibold [&_em]:italic",
        )}
      />
      <input type="hidden" name="description" value={value} readOnly />
    </div>
  );
}

function ToolbarBtn({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof Bold;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
    >
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
