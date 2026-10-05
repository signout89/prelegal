"use client";

import { useEffect, useState } from "react";
import { api } from "../api";
import { DocSpec, DocumentSummary } from "../types";

interface Props {
  specs: DocSpec[];
  onLoad: (id: number) => void;
  onClose: () => void;
}

export default function MyDocumentsModal({ specs, onLoad, onClose }: Props) {
  const [docs, setDocs] = useState<DocumentSummary[] | null>(null);

  useEffect(() => {
    api<DocumentSummary[]>("/api/documents").then(setDocs);
  }, []);

  const remove = async (id: number) => {
    await api(`/api/documents/${id}`, { method: "DELETE" });
    setDocs((current) => current?.filter((d) => d.id !== id) ?? null);
  };

  const typeName = (id: string) => specs.find((s) => s.id === id)?.name ?? id;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4" onClick={onClose}>
      <div role="dialog" aria-label="My Documents" className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-navy">My Documents</h2>
          <button onClick={onClose} className="text-muted hover:text-gray-900 text-sm">
            Close
          </button>
        </div>
        {docs === null && <p className="text-sm text-muted">Loading...</p>}
        {docs?.length === 0 && <p className="text-sm text-muted">No saved documents yet.</p>}
        <ul className="divide-y divide-gray-100 max-h-96 overflow-y-auto">
          {docs?.map((d) => (
            <li key={d.id} className="py-3 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{d.title}</p>
                <p className="text-xs text-muted">
                  {typeName(d.document_type)} - updated {d.updated_at}
                </p>
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => onLoad(d.id)} className="text-sm text-brand hover:underline">
                  Open
                </button>
                <button onClick={() => remove(d.id)} className="text-sm text-red-600 hover:underline">
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
