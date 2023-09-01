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
import { AppRoutes } from 'enums/app';

export const Footer = () => {
  const { t } = usePublicTranslation({ keyPrefix: 'yki.component.footer' });
  const translateCommon = useCommonTranslation();

  return (
    <footer>
      <Svg className="footer__wave" src={FooterWave} alt="" />
      <Paper className="footer" elevation={3}>
        <div className="footer__info-row">
          <div className="footer__container footer__container__links">
            <CustomButtonLink
              to={AppRoutes.AccessibilityStatementPage}
              variant={Variant.Text}
            >
              {t('links.accessibility.text')}
            </CustomButtonLink>
            <ExtLink
              text={t('links.privacy.text')}
              href={t('links.privacy.url')}
              endIcon={<OpenInNewIcon />}
            />
            <ExtLink
              text={t('links.ykiHomepage.text')}
              href={translateCommon('ykiHomepage.link')}
              endIcon={<OpenInNewIcon />}
              aria-label={translateCommon('ykiHomepage.ariaLabel')}
            />
          </div>
          <div className="footer__container footer__container__contact-details">
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
              />
            </div>
            <div className="footer__container__links__contact">
              <H3>{t('links.contact.title')}:</H3>
              <ExtLink
                className="footer__container__links__contact__email"
                href={`mailto:${translateCommon('contactEmail')}`}
                text={translateCommon('contactEmail')}
              ></ExtLink>
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
