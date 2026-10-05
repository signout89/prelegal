"use client";

import { useEffect, useState } from "react";
import { api } from "../api";
import { useAuth } from "../auth/AuthContext";
import { ChatMessage, ChatResponse, DocSpec, Fields, SavedDocument } from "../types";
import { documentTitle, missingRequired } from "../utils/docs";
import ChatPanel from "./ChatPanel";
import MyDocumentsModal from "./MyDocumentsModal";
import DocumentPreview from "./preview/DocumentPreview";

const ERROR_REPLY = "Sorry, I couldn't process that just now. Please try again.";

export default function Workspace() {
  const { user, signOut } = useAuth();
  const [specs, setSpecs] = useState<DocSpec[]>([]);
  const [greeting, setGreeting] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [docType, setDocType] = useState<string | null>(null);
  const [fields, setFields] = useState<Fields>({});
  const [savedId, setSavedId] = useState<number | null>(null);
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [showDocs, setShowDocs] = useState(false);

  useEffect(() => {
    api<DocSpec[]>("/api/templates").then(setSpecs);
    api<{ reply: string }>("/api/chat/greeting").then((g) => {
      setGreeting(g.reply);
      setMessages([{ role: "assistant", content: g.reply }]);
    });
  }, []);

  const spec = specs.find((s) => s.id === docType) ?? null;
  const complete = spec !== null && missingRequired(spec, fields).length === 0;

  const send = async (text: string) => {
    const next: ChatMessage[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setBusy(true);
    try {
      const res = await api<ChatResponse>("/api/chat/message", {
        method: "POST",
        json: { messages: next, document_type: docType, fields },
      });
      setMessages([...next, { role: "assistant", content: res.reply }]);
      setDocType(res.document_type);
      setFields(res.fields);
    } catch (err) {
      setMessages([...next, { role: "assistant", content: `${ERROR_REPLY} (${(err as Error).message})` }]);
    } finally {
      setBusy(false);
    }
  };

  const newDocument = () => {
    setMessages([{ role: "assistant", content: greeting }]);
    setDocType(null);
    setFields({});
    setSavedId(null);
    setStatus("");
  };

  const save = async () => {
    if (!spec) return;
    const body = { title: documentTitle(spec, fields), document_type: spec.id, fields, messages };
    const doc = savedId
      ? await api<SavedDocument>(`/api/documents/${savedId}`, { method: "PUT", json: body })
      : await api<SavedDocument>("/api/documents", { method: "POST", json: body });
    setSavedId(doc.id);
    setStatus("Saved");
  };

  const load = async (id: number) => {
    const doc = await api<SavedDocument>(`/api/documents/${id}`);
    setMessages(doc.messages);
    setDocType(doc.document_type);
    setFields(doc.fields);
    setSavedId(doc.id);
    setStatus("");
    setShowDocs(false);
  };

  return (
    <div className="h-screen flex flex-col print-root">
      <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between no-print">
        <div>
          <h1 className="text-xl font-bold text-navy">
            Pre<span className="text-accent">legal</span>
          </h1>
          <p className="text-xs text-muted">{spec ? spec.name : "AI legal document drafting"}</p>
        </div>
        <div className="flex items-center gap-2">
          {status && <span className="text-xs text-muted">{status}</span>}
          <button onClick={newDocument} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            New Document
          </button>
          <button onClick={() => setShowDocs(true)} className="px-3 py-1.5 text-sm border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">
            My Documents
          </button>
          <button onClick={save} disabled={!spec} className="px-3 py-1.5 text-sm rounded-md bg-brand text-white hover:opacity-90 disabled:opacity-40">
            Save
          </button>
          {complete && (
            <button onClick={() => window.print()} className="px-3 py-1.5 text-sm rounded-md bg-submit text-white font-medium hover:opacity-90">
              Download PDF
            </button>
          )}
          <div className="ml-3 pl-3 border-l border-gray-200 flex items-center gap-2">
            <span className="text-sm text-gray-700">{user?.name}</span>
            <button onClick={signOut} className="text-sm text-brand hover:underline">
              Sign out
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 min-h-0 print-root">
        <aside className="w-[420px] shrink-0 bg-white border-r border-gray-200 no-print">
          <ChatPanel messages={messages} busy={busy} onSend={send} />
        </aside>
        <main className="flex-1 overflow-y-auto p-8 print-target">
          <div id="document-preview" className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-10">
            <DocumentPreview spec={spec} fields={fields} />
          </div>
        </main>
      </div>

      {showDocs && <MyDocumentsModal specs={specs} onLoad={load} onClose={() => setShowDocs(false)} />}
    </div>
  );
}
