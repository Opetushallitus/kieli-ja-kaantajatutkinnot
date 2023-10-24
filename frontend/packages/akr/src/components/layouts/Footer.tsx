import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Divider, Paper, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { OPHLogoViewer, Svg, Text } from 'shared/components';
import { Direction } from 'shared/enums';
import { FooterWave } from 'shared/statics';

import {
  getCurrentLang,
  useAppTranslation,
  useCommonTranslation,
} from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { AppRoutes, PublicUIViews } from 'enums/app';
import { useAuthentication } from 'hooks/useAuthentication';
import AKTLogo from 'public/assets/svg/akt_logo.svg';
import { publicUIViewSelector } from 'redux/selectors/publicUIView';

export const Footer = () => {
  const { t } = useAppTranslation({ keyPrefix: 'akr.component.footer' });
  const translateCommon = useCommonTranslation();
  const { isAuthenticated } = useAuthentication();
  const { currentView } = useAppSelector(publicUIViewSelector);
  const showFooter =
    !isAuthenticated && currentView != PublicUIViews.ContactRequest;

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
                <Link to={AppRoutes.PrivacyPolicyPage}>
                  <Text>{t('links.privacy.text')}</Text>
                </Link>
                <a
                  href={t('links.akrHomepage.link')}
                  aria-label={t('links.akrHomepage.ariaLabel')}
                  className="columns gapped-xxs"
                  target="_blank"
                  rel="noreferrer"
                >
                  {t('links.akrHomepage.text')}
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
              <div className="footer__container">
                <Svg
                  className={'footer__container__logo__akr'}
                  src={AKTLogo}
                  alt={translateCommon('akrLogoAlt')}
                />
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
