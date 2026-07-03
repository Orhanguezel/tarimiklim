import { DashboardSection } from './DashboardSection';
import { HeroLiveCard } from './HeroLiveCard';
import { TickerController } from './TickerController';
import { CodeCopyButton } from './CodeCopyButton';
import type { HomeSectionDto } from '@/lib/home-sections';
import { PRIORITY_PROVINCE_SLUGS, getProvince } from '@/lib/provinces';
import type { Province } from '@/lib/provinces';

type LocalizedConfig = Record<string, unknown>;

function localized(config: Record<string, unknown> | null, locale: string): LocalizedConfig {
  const content = config?.content;
  if (!content || typeof content !== 'object') return {};
  const byLocale = content as Record<string, unknown>;
  const selected = byLocale[locale] ?? byLocale.tr ?? byLocale.en;
  return selected && typeof selected === 'object' ? selected as LocalizedConfig : {};
}

function str(data: LocalizedConfig, key: string, fallback = '') {
  const value = data[key];
  return typeof value === 'string' ? value : fallback;
}

function arr<T = Record<string, unknown>>(data: LocalizedConfig, key: string): T[] {
  const value = data[key];
  return Array.isArray(value) ? value as T[] : [];
}

export function DynamicHomeSections({ sections, locale }: { sections: HomeSectionDto[]; locale: string }) {
  return (
    <>
      {sections.map((section) => {
        const node = renderSection(section, locale);
        if (!node) return null;
        if (section.config?.band === 'dashboard') {
          return <section key={section.id} id="panel" className="dashboard-band">{node}</section>;
        }
        if (section.config?.band === 'stats') {
          return <section key={section.id} className="stats-band">{node}</section>;
        }
        return <div key={section.id}>{node}</div>;
      })}
      <PriorityCityLinks locale={locale} />
    </>
  );
}

function PriorityCityLinks({ locale }: { locale: string }) {
  const provinces = PRIORITY_PROVINCE_SLUGS.map((slug) => getProvince(slug)).filter((province): province is Province => Boolean(province)).slice(0, 20);
  const copy =
    locale === 'en'
      ? {
          label: 'POPULAR CITIES',
          titlePrefix: 'Agricultural weather and',
          titleEmphasis: 'frost alerts',
          lead: 'Direct links to priority city forecasts help growers reach local weather and frost-risk pages faster.',
          weather: 'Weather',
          frost: 'Frost alert',
        }
      : {
          label: 'POPÜLER İLLER',
          titlePrefix: 'İl bazlı hava durumu ve',
          titleEmphasis: 'don uyarıları',
          lead: 'Öncelikli tarım illeri için hava durumu ve don riski sayfalarına doğrudan ulaşın.',
          weather: 'Hava durumu',
          frost: 'Don uyarısı',
        };

  return (
    <section className="container-section priority-city-section" aria-labelledby="priority-city-heading">
      <div className="section-label"><span>{copy.label}</span></div>
      <h2 id="priority-city-heading" className="section-title">
        {copy.titlePrefix} <em>{copy.titleEmphasis}</em>
      </h2>
      <p className="section-lead">{copy.lead}</p>
      <div className="priority-city-grid">
        {provinces.map((province) => (
          <div key={province.slug} className="priority-city-row">
            <strong>{province.name}</strong>
            <span>
              <a href={`/${locale}/hava-durumu/${province.slug}`}>{copy.weather}</a>
              <a href={`/${locale}/don-uyarisi/${province.slug}`}>{copy.frost}</a>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function renderSection(section: HomeSectionDto, locale: string) {
  const data = localized(section.config, locale);
  switch (section.component_key) {
    case 'TarimHero':
      return <TarimHero data={data} />;
    case 'TarimTicker':
      return <TarimTicker data={data} />;
    case 'TarimDashboard':
      return <DashboardSection />;
    case 'TarimPillars':
      return <TarimPillars data={data} />;
    case 'TarimApi':
      return <TarimApi data={data} />;
    case 'TarimStats':
      return <TarimStats data={data} />;
    case 'TarimEcosystem':
      return <TarimEcosystem data={data} />;
    case 'TarimFinalCta':
      return <TarimFinalCta data={data} />;
    default:
      return null;
  }
}

function TarimHero({ data }: { data: LocalizedConfig }) {
  const stats = arr<{ value?: string; label?: string }>(data, 'stats');
  return (
    <section id="top">
      <div className="container-wide hero-grid">
        <div>
          <div className="hero-eyebrow">{str(data, 'eyebrow', 'TARIM İKLİM')}</div>
          <h1 className="hero-title">
            <span className="hero-break">{str(data, 'titleLine1')} </span>
            <span className="hero-break">
              <em>{str(data, 'titleLine2')}</em>{' '}
            </span>
            <span className="hero-break hero-indent">{str(data, 'titleLine3')}</span>
          </h1>
          <p className="hero-copy">{str(data, 'copy')}</p>
          <div className="hero-actions">
            <a href="?section=panel" className="button-primary">{str(data, 'primaryLabel', 'Don uyarisini ac')}</a>
            <a href="?section=api" className="button-ghost">{str(data, 'secondaryLabel', 'API ve widget')}</a>
            <a href="?section=docs" className="hero-meta-link">
              {str(data, 'tertiaryPrefix', 'Canli panel')} <span>{str(data, 'tertiary', 'asagida')}</span>
            </a>
          </div>
          <div className="hero-stat-grid">
            {stats.map((item, index) => (
              <article key={`${item.label ?? index}`} className="hero-stat">
                <div className="hero-stat-number">{item.value}</div>
                <div>{item.label}</div>
              </article>
            ))}
          </div>
        </div>
        <HeroLiveCard />
      </div>
    </section>
  );
}

function TarimTicker({ data }: { data: LocalizedConfig }) {
  return (
    <div className="ticker" aria-label={str(data, 'label', 'Canli tarimsal hava verisi')}>
      <div className="container-wide">
        <TickerController />
      </div>
    </div>
  );
}

function TarimPillars({ data }: { data: LocalizedConfig }) {
  const items = arr<{ index?: string; title?: string; copy?: string; features?: Array<{ label?: string; value?: string }> }>(data, 'items');
  return (
    <section id="modules" className="container-section">
      <div className="section-label"><span>{str(data, 'label', 'MODULLER')}</span></div>
      <h2 className="section-title">
        {str(data, 'titlePrefix')} <em>{str(data, 'titleEmphasis')}</em>
      </h2>
      <p className="section-lead">{str(data, 'lead')}</p>
      <div className="pillars-grid">
        {items.map((item, index) => (
          <article key={`${item.title ?? index}`} className="pillar-card">
            <div className="pillar-index">{item.index}</div>
            <div className="pillar-title"><em>{item.title}</em></div>
            <div className="pillar-copy">{item.copy}</div>
            <ul className="pillar-list">
              {(item.features ?? []).map((feature, featureIndex) => (
                <li key={`${feature.label ?? featureIndex}`}>
                  <span>{feature.label}</span>
                  <strong>{feature.value}</strong>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}

function TarimApi({ data }: { data: LocalizedConfig }) {
  const defaultCodeBody = '<iframe src="https://tarimiklim.com/widget?location=auto" width="100%" height="420"></iframe>';
  const defaultEndpoints = [
    { method: 'GET', path: '/api/v1/weather', copy: '7 günlük tahmin' },
    { method: 'GET', path: '/api/v1/weather/frost-risk', copy: 'Don riski skoru' },
    { method: 'GET', path: '/widget', copy: 'Gömülebilir widget' },
  ];
  const endpoints = arr<{ method?: string; path?: string; copy?: string }>(data, 'endpoints');
  const codeBody = str(data, 'codeBody', defaultCodeBody);
  const visibleEndpoints = endpoints.length > 0 ? endpoints : defaultEndpoints;
  return (
    <section id="api" className="container-section">
      <div className="section-label"><span>{str(data, 'label', 'ENTEGRASYON')}</span></div>
      <h2 className="section-title">
        {str(data, 'titlePrefix', 'Widget ve API ile')} <em>{str(data, 'titleEmphasis', 'her siteye bağlanır')}</em>
      </h2>
      <p className="section-lead">{str(data, 'lead', 'Hava durumu ve don riski widgetini kendi web sitenize iframe olarak ekleyin.')}</p>
      <div className="api-grid">
        <article className="api-code">
          <div className="code-header">
            <div className="code-dots" aria-hidden="true"><span /><span /><span /></div>
            <span className="code-filename">{str(data, 'codeFilename', 'widget/embed.html')}</span>
            <CodeCopyButton payload={codeBody} />
          </div>
          <pre className="code-body">{codeBody}</pre>
        </article>
        <article className="api-copy">
          <h3 className="api-copy-title"><em>{str(data, 'sideTitle', 'Gömülebilir hava paneli')}</em></h3>
          <p className="api-copy-text">{str(data, 'sideCopy', 'Frontend, iframe veya API tüketimi için aynı veri hattını kullanır.')}</p>
          <div className="api-endpoint-list">
            {visibleEndpoints.map((endpoint, index) => (
              <div key={`${endpoint.path ?? index}`} className="endpoint-row">
                <span className="endpoint-method" data-method={(endpoint.method ?? 'GET').toLowerCase()}>{endpoint.method}</span>
                <span className="endpoint-path">{endpoint.path}</span>
                <span className="api-copy-text">{endpoint.copy}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}

function TarimStats({ data }: { data: LocalizedConfig }) {
  const items = arr<{ label?: string; value?: string; copy?: string }>(data, 'items');
  return (
    <section className="container-section">
      <div className="stats-grid">
        {items.map((item, index) => (
          <article key={`${item.label ?? index}`} className="stat-card">
            <div className="stat-label">{item.label}</div>
            <div className="stat-number">{item.value}</div>
            <div className="stat-copy">{item.copy}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

function TarimEcosystem({ data }: { data: LocalizedConfig }) {
  const items = arr<{ label?: string; status?: string; statusTone?: string; name?: string; copy?: string; meta?: string }>(data, 'items');
  return (
    <section id="ekosistem" className="container-section">
      <div className="section-label"><span>{str(data, 'label', 'EKOSISTEM')}</span></div>
      <h2 className="section-title">
        {str(data, 'titlePrefix')} <em>{str(data, 'titleEmphasis')}</em>
      </h2>
      <p className="section-lead">{str(data, 'lead')}</p>
      <div className="ecosystem-grid">
        {items.map((item, index) => (
          <article key={`${item.name ?? index}`} className="eco-card">
            <div>
              <div className="eco-label">{item.label}</div>
              <div className={`status-badge ${item.statusTone ?? 'live'}`}>{item.status}</div>
              <div className="eco-name">{item.name}</div>
              <p className="eco-copy">{item.copy}</p>
            </div>
            <div className="footer-meta">{item.meta}</div>
          </article>
        ))}
      </div>
    </section>
  );
}

function TarimFinalCta({ data }: { data: LocalizedConfig }) {
  return (
    <>
      <div className="mega-type">
        {str(data, 'megaPrefix')} <em>{str(data, 'megaEmphasis')}</em> {str(data, 'megaSuffix')}
      </div>
      <section className="final-cta" id="docs">
        <div className="container-wide final-cta-card">
          <div>
            <h2 className="final-cta-title">
              {str(data, 'titleLine1')} <em>{str(data, 'titleLine2')}</em>
            </h2>
          </div>
          <div>
            <p className="final-cta-copy">{str(data, 'copy')}</p>
            <div className="final-actions">
              <a href="?section=api" className="button-final">{str(data, 'primaryLabel', 'API')}</a>
              <a href="?section=panel" className="button-final-ghost">{str(data, 'secondaryLabel', 'Panel')}</a>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
