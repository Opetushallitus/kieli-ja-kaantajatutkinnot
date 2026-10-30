import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Divider, Paper } from '@mui/material';
import { Link } from 'react-router';
import { OPHLogoViewer } from 'shared/components';
import { AppLanguage, Direction } from 'shared/enums';

import { Text } from 'components/Text';
import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import FooterLogoEN from 'static/OPO_Logo_Footer_englanti.svg';
import FooterLogoSV from 'static/OPO_Logo_Footer_ruotsi.svg';
import FooterLogoFI from 'static/OPO_Logo_Footer_suomi.svg';

const footerLogos = {
  [AppLanguage.Finnish]: { src: FooterLogoFI, width: 174, height: 28 },
  [AppLanguage.Swedish]: { src: FooterLogoSV, width: 167, height: 29 },
  [AppLanguage.English]: { src: FooterLogoEN, width: 152, height: 29 },
};

export const NewYkiFooter = () => {
  const { t } = usePublicTranslation({ keyPrefix: 'yki.component.footer' });
  const translateCommon = useCommonTranslation();

  return (
    <footer>
      <Paper className="footer" elevation={0}>
        <div className="footer__brand">
          <Divider className="footer__divider">
            <img
              className="footer__brand__logo"
              {...footerLogos[getCurrentLang()]}
              alt={t('studyinfoLogoAlt')}
            />
          </Divider>
        </div>
        <div className="footer__info-row">
          <div className="footer__container footer__container__info rows gapped-xs">
            <h4 style={{ marginBottom: '1rem' }}>{t('headings.info')}</h4>
            <a
              href={translateCommon('ykiHomepage.link')}
              aria-label={translateCommon('ykiHomepage.ariaLabel')}
              target="_blank"
              rel="noreferrer"
            >
              <Text component="span" color="secondary">
                {t('links.ykiHomepage.text')}
                {'\u00a0'}
                <OpenInNewIcon
                  className="footer__external-link-icon"
                  color="secondary"
                />
              </Text>
            </a>
            <a
              href={`mailto:${translateCommon('contactEmail.jyu')}`}
              target="_blank"
              rel="noreferrer"
            >
              <Text color="secondary">
                {translateCommon('contactEmail.jyu')}
              </Text>
            </a>
            <div className="footer__phone columns gapped-xxs">
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
                {translateCommon('contactPhone.hours')}
              </Text>
            </div>
          </div>
          <div className="footer__container footer__container__contact-details rows gapped-xs">
            <h4 style={{ marginBottom: '1rem' }}>{t('headings.contacts')}</h4>
            <span className="label">{t('address.name')}</span>
            <Text>{t('address.street')}</Text>
            <Text>{t('address.zipCity')}</Text>
            <div className="footer__phone columns gapped-xxs">
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
          <div className="footer__container footer__container__links rows gapped-xs">
            <h4 style={{ marginBottom: '1rem' }}>{t('headings.statements')}</h4>
            <Link to={AppRoutes.AccessibilityStatementPage}>
              <Text color="secondary">{t('links.accessibility.text')}</Text>
            </Link>
            <a href={t('links.privacy.url')} target="_blank" rel="noreferrer">
              <Text component="span" color="secondary">
                {t('links.privacy.text')}
                {'\u00a0'}
                <OpenInNewIcon
                  className="footer__external-link-icon"
                  color="secondary"
                />
              </Text>
            </a>
          </div>
        </div>

        <div className="footer__logo-row">
          <Divider className="footer__divider footer__divider--oph">
            <OPHLogoViewer
              className="footer__logo-row__oph"
              direction={Direction.Vertical}
              alt={translateCommon('ophLogoAlt')}
              currentLang={getCurrentLang()}
            />
          </Divider>
        </div>
        <Text className="footer__description">{t('description')}</Text>
      </Paper>
    </footer>
  );
};
