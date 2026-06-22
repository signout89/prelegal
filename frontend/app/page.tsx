"use client";

import { useState } from "react";
import NDAForm from "./components/NDAForm";
import NDAPreview from "./components/NDAPreview";
import { DEFAULT_NDA_DATA, NDAData } from "./types";
import { generateMarkdown } from "./utils/generateMarkdown";

export default function Home() {
  const [data, setData] = useState<NDAData>(DEFAULT_NDA_DATA);

  const downloadMarkdown = () => {
    const markdown = generateMarkdown(data);
    const blob = new Blob([markdown], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "mutual-nda.md";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between no-print">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Prelegal</h1>
          <p className="text-sm text-gray-500">Mutual NDA Creator</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={downloadMarkdown}
            className="px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Download Markdown
          </button>
          <button
            onClick={() => window.print()}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Download PDF
          </button>
        </div>
      </header>

      {/* Main layout */}
      <div className="flex h-[calc(100vh-65px)]">
        {/* Form panel */}
        <aside className="w-96 flex-shrink-0 bg-white border-r border-gray-200 overflow-y-auto p-6 no-print">
          <NDAForm data={data} onChange={setData} />
        </aside>

        {/* Preview panel */}
        <main className="flex-1 overflow-y-auto p-8 print-target">
          <div
            id="nda-document"
            className="max-w-3xl mx-auto bg-white rounded-lg shadow-sm border border-gray-200 p-10"
          >
            <NDAPreview data={data} />
          </div>
        </main>
      </div>
    </div>
  );
}
