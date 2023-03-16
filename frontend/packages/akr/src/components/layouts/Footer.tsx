import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Divider, Paper } from '@mui/material';
import {
  CustomButtonLink,
  ExtLink,
  H2,
  OPHLogoViewer,
  Svg,
  Text,
} from 'shared/components';
import { Direction, Variant } from 'shared/enums';
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
          <Svg
            className="footer__wave"
            src={FooterWave}
            alt={t('accessibility.waveAriaLabel')}
          />
          <Paper className="footer" elevation={3}>
            <div className="footer__info-row">
              <div className="footer__container footer__container__links">
                <CustomButtonLink
                  to={AppRoutes.AccessibilityStatementPage}
                  variant={Variant.Text}
                >
                  {t('links.accessibility.text')}
                </CustomButtonLink>
                <CustomButtonLink
                  to={AppRoutes.PrivacyPolicyPage}
                  variant={Variant.Text}
                >
                  {t('links.privacy.text')}
                </CustomButtonLink>
                <ExtLink
                  text={t('links.akrHomepage.text')}
                  href={t('links.akrHomepage.link')}
                  endIcon={<OpenInNewIcon />}
                  aria-label={t('links.akrHomepage.ariaLabel')}
                />
                <div className="footer__container__links__contact">
                  <H2>{t('links.contact.title')}:</H2>
                  <ExtLink
                    className="footer__container__links__contact__email"
                    href={`mailto:${translateCommon('contactEmail')}`}
                    text={translateCommon('contactEmail')}
                  ></ExtLink>
                </div>
              </div>
              <div className="footer__container footer__container__contact-details">
                <H2>{t('address.name')}</H2>
                <br />
                <Text>{t('address.street')}</Text>
                <Text>{t('address.zipCity')}</Text>
                <br />
                <div className="columns gapped-xxs">
                  <Text className="inline-text">
                    {t('address.phone.title')}
                  </Text>
                  <ExtLink
                    className="inline-text"
                    text={t('address.phone.number')}
                    href={`tel:${t('address.phone.number')}`}
                    aria-label={t('accessibility.ophPhone')}
                  />
                </div>
              </div>
              <div className="footer__container">
                <Svg
                  className={'footer__container__logo__akr'}
                  src={AKTLogo}
                  alt={translateCommon('akrLogo')}
                />
              </div>
            </div>

            <div className="footer__logo-row">
              <Divider className="footer__logo-row__divider">
                <OPHLogoViewer
                  className="footer__container__logo__oph"
                  direction={Direction.Vertical}
                  alt={translateCommon('ophLogo')}
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
