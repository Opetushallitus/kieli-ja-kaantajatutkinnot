import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Divider, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { OPHLogoViewer, Text } from 'shared/components';
import { Direction } from 'shared/enums';

import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { AppRoutes } from 'enums/app';

export const Footer = () => {
  const { t } = usePublicTranslation({ keyPrefix: 'yki.component.footer' });
  const translateCommon = useCommonTranslation();

  return (
    <footer>
      <Paper className="footer" elevation={0}>
        <div className="footer__info-row">
          <div className="footer__container footer__container__links rows gapped-xs">
            <h4 style={{ marginBottom: '1rem' }}>{t('headings.statements')}</h4>
            <Link to={AppRoutes.AccessibilityStatementPage}>
              <Text color="secondary">{t('links.accessibility.text')}</Text>
            </Link>
            <a
              href={t('links.privacy.url')}
              className="columns gapped-xxs"
              target="_blank"
              rel="noreferrer"
            >
              <Text color="secondary">{t('links.privacy.text')}</Text>{' '}
              <OpenInNewIcon color="secondary" />
            </a>
          </div>
          <div className="footer__container footer__container__info rows gapped-xs">
            <h4 style={{ marginBottom: '1rem' }}>{t('headings.info')}</h4>
            <a
              href={translateCommon('ykiHomepage.link')}
              aria-label={translateCommon('ykiHomepage.ariaLabel')}
              className="columns gapped-xxs"
              target="_blank"
              rel="noreferrer"
            >
              <Text color="secondary">{t('links.ykiHomepage.text')}</Text>
              <OpenInNewIcon color="secondary" />
            </a>
            <a
              className="footer__container__links__contact__email"
              href={`mailto:${translateCommon('contactEmail.jyu')}`}
              target="_blank"
              rel="noreferrer"
            >
              <Text color="secondary">
                {translateCommon('contactEmail.jyu')}
              </Text>
            </a>
            <div className="columns gapped-xxs">
              <a
                href={`tel:${translateCommon('contactPhone.jyu')}`}
                target="_blank"
                rel="noreferrer"
              >
                <Text color="secondary">
                  {translateCommon('contactPhone.jyu')}
                </Text>
              </a>
              <Text className="inline-text">
                <Text>{translateCommon('contactPhone.hours')}</Text>
              </Text>
            </div>
          </div>
          <div className="footer__container footer__container__contact-details rows gapped-xs">
            <h4 style={{ marginBottom: '1rem' }}>{t('headings.contacts')}</h4>
            <span className="label">{t('address.name')}</span>
            <Text>{t('address.street')}</Text>
            <Text>{t('address.zipCity')}</Text>
            <div className="columns gapped-xxs">
              <Text className="inline-text">{t('address.phone.title')}</Text>
              <a
                className="inline-text"
                href={`tel:${t('address.phone.number')}`}
                target="_blank"
                rel="noreferrer"
              >
                <Text color="secondary">{t('address.phone.number')}</Text>
              </a>
            </div>
          </div>
        </div>

        <div className="footer__logo-row">
          <Divider className="footer__logo-row__divider">
            <OPHLogoViewer
              className="footer__container__logo__oph"
              direction={Direction.Vertical}
              alt={translateCommon('ophLogoAlt')}
              currentLang={getCurrentLang()}
            />
          </Divider>
        </div>
      </Paper>
    </footer>
  );
};
