import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Divider, Paper } from '@mui/material';
import { Link } from 'react-router-dom';
import { H3, OPHLogoViewer, Svg, Text } from 'shared/components';
import { Direction } from 'shared/enums';
import { FooterWave } from 'shared/statics';

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
      <Svg className="footer__wave" src={FooterWave} alt="" />
      <Paper className="footer" elevation={3}>
        <div className="footer__info-row">
          <div className="footer__container footer__container__links rows gapped-xs">
            <h2>{t('headings.statements')}</h2>
            <Link to={AppRoutes.AccessibilityStatementPage}>
              <Text>{t('links.accessibility.text')}</Text>
            </Link>
            <a
              href={t('links.privacy.url')}
              className="columns gapped-xxs"
              target="_blank"
              rel="noreferrer"
            >
              {t('links.privacy.text')} <OpenInNewIcon />
            </a>
          </div>
          <div className="footer__container footer__container__info rows gapped-xs">
            <h2>{t('headings.info')}</h2>
            <a
              href={translateCommon('ykiHomepage.link')}
              aria-label={translateCommon('ykiHomepage.ariaLabel')}
              className="columns gapped-xxs"
              target="_blank"
              rel="noreferrer"
            >
              {t('links.ykiHomepage.text')}
              <OpenInNewIcon />
            </a>
            <a
              className="footer__container__links__contact__email"
              href={`mailto:${translateCommon('contactEmail')}`}
              target="_blank"
              rel="noreferrer"
            >
              {translateCommon('contactEmail')}
            </a>
          </div>
          <div className="footer__container footer__container__contact-details rows gapped-xs">
            <h2>{t('headings.contacts')}</h2>
            <H3>{t('address.name')}</H3>
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
                {t('address.phone.number')}
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
