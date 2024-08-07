import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Divider, Paper, Typography } from '@mui/material';
import { Link, useLocation } from 'react-router-dom';
import { OPHLogoViewer, Svg, Text } from 'shared/components';
import { Direction } from 'shared/enums';
import { FooterWave } from 'shared/statics';

import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import { useAuthentication } from 'hooks/useAuthentication';

export const Footer = () => {
  const location = useLocation();

  const { t } = usePublicTranslation({ keyPrefix: 'vkt.component.footer' });
  const translateCommon = useCommonTranslation();

  const { isAuthenticated } = useAuthentication();
  const showFooter =
    !isAuthenticated && !location.pathname.includes(AppRoutes.PublicEnrollment);

  return (
    <footer>
      {showFooter && (
        <>
          <Svg className="footer__wave" src={FooterWave} alt="" />
          <Paper className="footer" elevation={3}>
            <div className="footer__info-row">
              <div className="footer__container footer__container__links">
                <Link to={AppRoutes.AccessibilityStatementPage}>
                  <Text>{t('links.accessibility.text')}</Text>
                </Link>
                <a
                  href={translateCommon('vktPrivacyPolicy.link')}
                  aria-label={translateCommon('vktPrivacyPolicy.ariaLabel')}
                  className="columns gapped-xxs"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('links.privacy.text')}
                  <OpenInNewIcon />
                </a>
                <a
                  href={translateCommon('vktHomepage.link')}
                  aria-label={translateCommon('vktHomepage.ariaLabel')}
                  className="columns gapped-xxs"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('links.vktHomepage.text')}
                  <OpenInNewIcon />
                </a>
                <div className="footer__container__links__contact">
                  <Typography component="h2" variant="h3">
                    {t('links.contact.title')}:
                  </Typography>
                  <a
                    className="footer__container__links__contact__email"
                    href={`mailto:${translateCommon('contactEmail')}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {translateCommon('contactEmail')}
                  </a>
                </div>
              </div>
              <div className="footer__container footer__container__contact-details">
                <Typography component="h2" variant="h3">
                  {t('address.name')}
                </Typography>
                <br />
                <Text>{t('address.street')}</Text>
                <Text>{t('address.zipCity')}</Text>
                <br />
                <div className="columns gapped-xxs">
                  <Text className="inline-text">
                    {t('address.phone.title')}
                  </Text>
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
        </>
      )}
    </footer>
  );
};
