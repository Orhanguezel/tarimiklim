import { resolveLocalizedHref, type FooterContent, type FooterSection, type NavItem } from '@/lib/navigation';

interface Props {
  locale?: string;
  logoUrl?: string | null;
  sections?: FooterSection[];
  items?: NavItem[];
  content?: FooterContent | null;
}

export function SiteFooter({ locale = 'tr', logoUrl, sections = [], items = [], content }: Props = {}) {
  const linksBySection = new Map<string, NavItem[]>();
  for (const item of items.filter((entry) => entry.is_active !== false)) {
    const key = item.section_id || item.section_slug || '__none__';
    const list = linksBySection.get(key) ?? [];
    list.push(item);
    linksBySection.set(key, list);
    if (item.section_slug && item.section_slug !== key) {
      const slugList = linksBySection.get(item.section_slug) ?? [];
      slugList.push(item);
      linksBySection.set(item.section_slug, slugList);
    }
  }

  return (
    <footer className="site-footer">
      <div className="container-wide site-footer-inner">
        <div className="site-footer-top">
          <div className="site-footer-brand">
            {logoUrl ? (
              <img src={logoUrl} alt="TarimIKlim" className="site-footer-logo" />
            ) : (
              <div className="site-footer-wordmark">
                <span className="brand-mark" aria-hidden="true" />
                <span>Tarim<em>IKlim</em></span>
              </div>
            )}
            <p className="site-footer-tag">{content?.tagline ?? ''}</p>
            <p className="site-footer-copy">{content?.copy ?? ''}</p>
            <ul className="site-footer-contact">
              {content?.contact?.company ? <li>{content.contact.company}</li> : null}
              {content?.contact?.city ? <li>{content.contact.city}</li> : null}
              {content?.contact?.email ? (
                <li>
                  <a href={`mailto:${content.contact.email}`}>{content.contact.email}</a>
                </li>
              ) : null}
              {content?.contact?.social ? <li>{content.contact.social}</li> : null}
            </ul>
          </div>

          <div className="site-footer-links">
            {sections.filter((section) => section.is_active !== false).map((section) => {
              const sectionItems = linksBySection.get(section.id) ?? linksBySection.get(section.slug) ?? [];
              return (
              <div key={section.id} className="site-footer-col">
                <h3 className="site-footer-col-title">{section.title}</h3>
                <ul className="site-footer-col-list">
                  {sectionItems.map((item) => (
                    <li key={item.id}>
                      <a href={resolveLocalizedHref(item.href, locale)}>
                        {item.title}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            );})}
          </div>
        </div>

        <div className="site-footer-bottom">
          <span className="site-footer-copyright">{content?.bottom?.copyright ?? ''}</span>
          <nav className="site-footer-legal" aria-label="Legal">
            {(linksBySection.get('__none__') ?? []).map((item) => (
              <a key={item.id} href={resolveLocalizedHref(item.href, locale)}>{item.title}</a>
            ))}
          </nav>
        </div>
        {content?.bottom?.creditBy ? (
          <div className="site-footer-credit">
          {content.bottom.creditLabel}: {' '}
          <a href={content.bottom.creditUrl ?? '#'} target="_blank" rel="noopener noreferrer">
            {content.bottom.creditBy}
          </a>
        </div>
        ) : null}
      </div>
    </footer>
  );
}
