import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Divider, Paper } from '@mui/material';

import { CustomButtonLink } from 'components/elements/CustomButtonLink';
import { ExtLink } from 'components/elements/ExtLink';
import { OPHLogoViewer } from 'components/elements/OPHLogoViewer';
import { Svg } from 'components/elements/Svg';
import { H3, Text } from 'components/elements/Text';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { AppRoutes, Direction, Variant } from 'enums/app';
import { useAuthentication } from 'hooks/useAuthentication';
import AKTLogo from 'public/assets/svg/akt_logo.svg';
import FooterWave from 'public/assets/svg/footer_wave.svg';

export const Footer = () => {
  const { t } = useAppTranslation({ keyPrefix: 'akt.component.footer' });
  const translateCommon = useCommonTranslation();
  const [isClerkUI] = useAuthentication();

  return (
    <footer>
      {!isClerkUI && (
        <>
          <Svg
            className="footer__wave"
            src={FooterWave}
            alt={t('accessibility.waveAriaLabel')}
          />
          <Paper className="footer" elevation={3}>
            <div className="footer__info-row">
              <div className="footer__container footer__container--links">
                <CustomButtonLink
                  to={AppRoutes.AccessibilityStatementPage}
                  variant={Variant.Text}
                >
                  {t('links.accessibility.text')}
                </CustomButtonLink>
                <ExtLink
                  text={t('links.aktHomepage.text')}
                  href={t('links.aktHomepage.link')}
                  endIcon={<OpenInNewIcon />}
                  aria-label={t('links.aktHomepage.ariaLabel')}
                />
                <ExtLink
                  className="footer__container--links__contact-email"
                  href={`mailto:${translateCommon('contactEmail')}`}
                  text={translateCommon('contactEmail')}
                ></ExtLink>
              </div>
              <div className="footer__container footer__container--contact-details">
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
              <div className="footer__container">
                <Svg
                  className={'footer__container__logo--akt'}
                  src={AKTLogo}
                  alt={translateCommon('aktLogo')}
                />
              </div>
            </div>

            <div className="footer__logo-row">
              <Divider className="footer__logo-row__divider">
                <OPHLogoViewer
                  className="footer__container__logo--oph"
                  direction={Direction.Vertical}
                />
              </Divider>
            </div>
          </Paper>
        </>
      )}
    </footer>
  );
};
