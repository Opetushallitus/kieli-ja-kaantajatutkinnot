import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Divider, Paper } from '@mui/material';
import {
  CustomButtonLink,
  ExtLink,
  H3,
  OPHLogoViewer,
  Svg,
  Text,
} from 'shared/components';
import { Direction, Variant } from 'shared/enums';
import { FooterWave } from 'shared/statics';

import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { AppRoutes, PublicUIViews } from 'enums/app';
import { useAuthentication } from 'hooks/useAuthentication';
import { publicUIViewSelector } from 'redux/selectors/publicUIView';

export const Footer = () => {
  const { t } = usePublicTranslation({ keyPrefix: 'vkt.component.footer' });
  const translateCommon = useCommonTranslation();

  const { isAuthenticated } = useAuthentication();
  const { currentView } = useAppSelector(publicUIViewSelector);
  const showFooter =
    !isAuthenticated && currentView !== PublicUIViews.Enrollment;

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
                  text={t('links.vktHomepage.text')}
                  href={translateCommon('vktHomepage.link')}
                  endIcon={<OpenInNewIcon />}
                  aria-label={translateCommon('vktHomepage.ariaLabel')}
                />
                <div className="footer__container__links__contact">
                  <H3>{t('links.contact.title')}:</H3>
                  <ExtLink
                    className="footer__container__links__contact__email"
                    href={`mailto:${translateCommon('contactEmail')}`}
                    text={translateCommon('contactEmail')}
                  ></ExtLink>
                </div>
              </div>
              <div className="footer__container footer__container__contact-details">
                <H3>{t('address.name')}</H3>
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
