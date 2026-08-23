"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";

function ReaderScreen() {
  const router = useRouter();
  const params = useSearchParams();
  const fileUrl = params.get("url");
  const fileName = params.get("name") || "Document.pdf";
  const context = params.get("context") || "";

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    document.title = fileName;
  }, [fileName]);

  return (
    <div className="h-screen flex flex-col bg-primary-container text-on-primary-container overflow-hidden">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 w-full z-50 flex items-center justify-between px-4 md:px-6 h-16 bg-primary-container/90 backdrop-blur-xl border-b border-white/10 shadow-sm">
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={() => router.back()}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors active:scale-95 shrink-0"
          >
            <span className="material-symbols-outlined text-secondary-fixed">
              arrow_back
            </span>
          </button>
          <div className="flex flex-col min-w-0">
            <span className="font-headline-sm text-body-md text-on-primary-fixed truncate max-w-[180px] md:max-w-md">
              {fileName}
            </span>
            {context && (
              <span className="font-label-md text-label-md text-outline-variant uppercase tracking-widest truncate">
                {context}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {fileUrl && (
            <>
              <a
                href={fileUrl}
                download
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                title="Download"
              >
                <span className="material-symbols-outlined text-secondary-fixed">
                  download
                </span>
              </a>
              <a
                href={fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
                title="Open in new tab"
              >
                <span className="material-symbols-outlined text-secondary-fixed">
                  open_in_new
                </span>
              </a>
            </>
          )}
        </div>
      </header>

      {/* Document Viewing Area */}
      <main className="flex-1 pt-16 bg-primary-container/50 flex items-center justify-center relative">
        {!fileUrl && (
          <div className="text-center px-6">
            <span className="material-symbols-outlined text-6xl text-outline-variant">
              picture_as_pdf
            </span>
            <p className="mt-4 font-body-md text-body-md text-outline-variant">
              No document selected.
            </p>
          </div>
        )}

        {fileUrl && (
          <>
            {!loaded && (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="font-body-sm text-body-sm text-outline-variant">
                  Loading document...
                </p>
              </div>
            )}
            <iframe
              src={fileUrl}
              title={fileName}
              className="w-full h-full border-0"
              onLoad={() => setLoaded(true)}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default function PdfReaderPage() {
  return (
    <AuthGuard>
      <Suspense
        fallback={
          <div className="h-screen flex items-center justify-center bg-primary-container text-on-primary-container">
            Loading...
          </div>
        }
      >
        <ReaderScreen />
      </Suspense>
    </AuthGuard>
  );
}
