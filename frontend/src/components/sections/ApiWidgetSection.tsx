import { useTranslations } from 'next-intl';
import { CodeCopyButton } from './CodeCopyButton';

const ENDPOINTS = ['forecast', 'frostRisk', 'irrigation', 'alerts', 'stations', 'widget'] as const;

export function ApiWidgetSection() {
  const t = useTranslations('premium.api');
  const codeBody = t('code.body');

  return (
    <section id="api" className="container-section">
      <div className="section-label">
        <span className="section-label-num">III.</span>
        <span>{t('label')}</span>
      </div>
      <h2 className="section-title">
        {t('title.prefix')} <em>{t('title.emphasis')}</em>
      </h2>
      <p className="section-lead">{t('lead')}</p>
      <div className="api-grid">
        <article className="api-code">
          <div className="code-header">
            <div className="code-dots" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
            <span className="code-filename">{t('code.filename')}</span>
            <CodeCopyButton payload={codeBody} />
          </div>
          <pre className="code-body">{codeBody}</pre>
        </article>
        <article className="api-copy">
          <h3 className="api-copy-title">
            {t('side.titlePrefix')} <em>{t('side.titleEmphasis')}</em>
          </h3>
          <p className="api-copy-text">{t('side.copy')}</p>
          <div className="api-endpoint-list">
            {ENDPOINTS.map((endpoint) => (
              <div key={endpoint} className="endpoint-row">
                <span className="endpoint-method" data-method={t(`endpoints.${endpoint}.method`).toLowerCase()}>
                  {t(`endpoints.${endpoint}.method`)}
                </span>
                <span className="endpoint-path">{t(`endpoints.${endpoint}.path`)}</span>
                <span className="api-copy-text">{t(`endpoints.${endpoint}.copy`)}</span>
              </div>
            ))}
          </div>
        </article>
      </div>
    </section>
  );
}
