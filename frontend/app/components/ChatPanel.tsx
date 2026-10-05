"use client";

import { useEffect, useRef, useState } from "react";
import { ChatMessage } from "../types";

interface Props {
  messages: ChatMessage[];
  busy: boolean;
  onSend: (text: string) => void;
}

export default function ChatPanel({ messages, busy, onSend }: Props) {
  const [text, setText] = useState("");
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView?.({ behavior: "smooth" });
    if (!busy) inputRef.current?.focus();
  }, [messages, busy]);

  const send = () => {
    const value = text.trim();
    if (!value || busy) return;
    setText("");
    onSend(value);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={m.role === "user" ? "flex justify-end" : "flex justify-start"}>
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-sm whitespace-pre-wrap ${
                m.role === "user" ? "bg-brand text-white" : "bg-gray-100 text-gray-900"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}
        {busy && <p className="text-sm text-muted italic">Thinking...</p>}
        <div ref={endRef} />
      </div>
      <form
        className="border-t border-gray-200 p-3 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
      >
        <textarea
          ref={inputRef}
          rows={2}
          aria-label="Message"
          placeholder="Describe the agreement you need..."
          className="flex-1 resize-none border border-gray-300 rounded-md px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand"
          value={text}
          disabled={busy}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              send();
            }
          }}
        />
        <button type="submit" disabled={busy || !text.trim()} className="px-4 rounded-md bg-submit text-white text-sm font-medium hover:opacity-90 disabled:opacity-50">
          Send
        </button>
      </form>
    </div>
  );
}
