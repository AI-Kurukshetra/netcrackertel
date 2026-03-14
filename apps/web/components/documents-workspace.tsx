"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { FileText, Search } from "lucide-react";

type DocumentSummary = {
  id: string;
  name: string;
  documentType: string;
  bucket: string;
  path: string;
  tenantName: string;
  description: string;
};

type DocumentsResponse = {
  documents: DocumentSummary[];
  summary: {
    totalDocuments: number;
    contracts: number;
    slas: number;
    technical: number;
    invoices: number;
  };
};

type DocumentDetailResponse = {
  document: {
    id: string;
    name: string;
    previewTitle: string;
    documentType: string;
    tenantName: string;
    path: string;
    content: string;
  };
};

async function getDocuments(search: string) {
  const response = await fetch(`/api/documents?search=${encodeURIComponent(search)}`);
  if (!response.ok) throw new Error("Failed to load documents");
  return response.json() as Promise<DocumentsResponse>;
}

async function getDocumentDetail(documentId: string) {
  const response = await fetch(`/api/documents/${documentId}`);
  if (!response.ok) throw new Error("Failed to open document");
  return response.json() as Promise<DocumentDetailResponse>;
}

export function DocumentsWorkspace() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string>("");
  const documentsQuery = useQuery({
    queryKey: ["documents-workspace", search],
    queryFn: () => getDocuments(search)
  });

  useEffect(() => {
    if (!selectedId && documentsQuery.data?.documents[0]?.id) {
      setSelectedId(documentsQuery.data.documents[0].id);
    }
  }, [documentsQuery.data?.documents, selectedId]);

  const detailQuery = useQuery({
    queryKey: ["document-detail", selectedId],
    queryFn: () => getDocumentDetail(selectedId),
    enabled: Boolean(selectedId)
  });

  const documents = documentsQuery.data?.documents ?? [];
  const detail = detailQuery.data?.document;

  return (
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="card-surface rounded-[2rem] p-6">
          <p className="text-sm uppercase tracking-[0.35em] text-cyan-500">Document management</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Open commercial, SLA, technical, and invoice documents.</h1>
          <p className="mt-3 max-w-3xl text-muted">Click any document record to open its dummy file preview and inspect the rendered content in-app.</p>
          <div className="mt-6 grid gap-4 md:grid-cols-4">
            <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">Documents</p>
              <p className="mt-3 text-3xl font-semibold">{documentsQuery.data?.summary.totalDocuments ?? "..."}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">Contracts</p>
              <p className="mt-3 text-3xl font-semibold">{documentsQuery.data?.summary.contracts ?? "..."}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">SLAs</p>
              <p className="mt-3 text-3xl font-semibold">{documentsQuery.data?.summary.slas ?? "..."}</p>
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-4 dark:bg-white/5">
              <p className="text-sm text-muted">Invoice packs</p>
              <p className="mt-3 text-3xl font-semibold">{documentsQuery.data?.summary.invoices ?? "..."}</p>
            </div>
          </div>
        </div>

        <div className="card-surface rounded-[2rem] p-6">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-cyan-400/15 p-3 text-cyan-500">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted">Open document</p>
              <h2 className="text-xl font-semibold">Document browser</h2>
            </div>
          </div>
          <div className="mt-4 relative">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input className="field-control pl-11" placeholder="Search documents" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <p className="mt-4 text-sm text-muted">Selecting a document opens its dummy content preview on the right.</p>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="card-surface rounded-[2rem] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted">Document library</p>
              <h2 className="text-2xl font-semibold">Stored records</h2>
            </div>
            <p className="text-sm text-muted">{documents.length} visible</p>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {documents.map((document) => (
              <button
                key={document.id}
                onClick={() => setSelectedId(document.id)}
                className="rounded-[1.75rem] border border-white/10 bg-white/60 p-5 text-left transition hover:-translate-y-0.5 hover:border-cyan-300/40 dark:bg-white/5"
              >
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-500">{document.documentType}</p>
                <h3 className="mt-2 text-lg font-semibold break-words">{document.name}</h3>
                <p className="mt-2 text-sm text-muted break-words">{document.description}</p>
                <p className="mt-3 text-xs text-muted break-words">{document.tenantName}</p>
              </button>
            ))}
          </div>
        </div>

        <div className="card-surface rounded-[2rem] p-6">
          <p className="text-sm text-muted">Document preview</p>
          <h2 className="mt-1 text-2xl font-semibold">{detail?.previewTitle ?? "No document selected"}</h2>
          {detail ? (
            <div className="mt-5 space-y-4">
              <div className="rounded-[1.5rem] border border-white/10 bg-white/60 p-5 dark:bg-white/5">
                <p className="text-sm text-muted">Tenant</p>
                <p className="mt-1 font-semibold break-words">{detail.tenantName}</p>
                <p className="mt-3 text-sm text-muted">Path</p>
                <p className="mt-1 font-medium break-words">{detail.path}</p>
              </div>
              <pre className="overflow-x-auto rounded-[1.5rem] border border-white/10 bg-slate-950 p-5 text-sm text-slate-100">{detail.content}</pre>
            </div>
          ) : (
            <p className="mt-4 text-sm text-muted">Choose a document to open its preview.</p>
          )}
        </div>
      </section>
    </div>
  );
}
