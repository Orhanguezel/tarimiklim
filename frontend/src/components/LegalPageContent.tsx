import type { CustomPageData } from '@/lib/api';

export default function LegalPageContent({
  page,
  fallbackTitle,
}: {
  page: CustomPageData | null;
  fallbackTitle: string;
}) {
  const title = page?.title || fallbackTitle;
  const content = page?.content || '';

  return (
    <main className="container-section">
      <div className="mx-auto max-w-3xl">
        <h1 className="section-title">{title}</h1>
        {content ? (
          <div
            className="prose max-w-none text-ink-soft"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        ) : (
          <p className="section-lead">Bu sayfa yakında güncellenecektir.</p>
        )}
      </div>
    </main>
  );
}
