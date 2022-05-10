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

import {
  getCurrentLang,
  useAppTranslation,
  useCommonTranslation,
} from 'configs/i18n';
import { AppRoutes } from 'enums/app';
// import { useAuthentication } from 'hooks/useAuthentication';
import FooterWave from 'public/assets/svg/footer_wave.svg';

export const Footer = () => {
  const { t } = useAppTranslation({ keyPrefix: 'vkt.component.footer' });
  const translateCommon = useCommonTranslation();
  const currentLang = getCurrentLang();
  // const [isClerkUI] = useAuthentication();

  return (
    <footer>
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
              text={t('links.vktHomepage.text')}
              href={t('links.vktHomepage.link')}
              endIcon={<OpenInNewIcon />}
              aria-label={t('links.vktHomepage.ariaLabel')}
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
              <Text className="inline-text">{t('address.phone.title')}</Text>
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
              currentLang={currentLang}
              className="footer__container__logo--oph"
              direction={Direction.Vertical}
              alt={translateCommon('ophLogo')}
            />
          </Divider>
        </div>
      </Paper>
    </footer>
  );
};
