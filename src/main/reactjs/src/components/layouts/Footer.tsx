import { FC } from 'react';
import { Paper } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { Text, H3 } from 'components/elements/Text';
import { ExtLink } from 'components/elements/ExtLink';
import { Svg } from 'components/elements/Svg';
import Logo from 'public/assets/svg/logo.svg';
import FooterWave from 'public/assets/svg/footer_wave.svg';
import { useAppTranslation } from 'configs/i18n';

interface FooterProps {
  showWave: boolean;
}

const Footer: FC<FooterProps> = ({ showWave }: FooterProps) => {
  const { t } = useAppTranslation({ keyPrefix: 'akt.component.footer' });

  return (
    <footer>
      {showWave && (
        <Svg className="footer__wave" src={FooterWave} alt={t('logo.alt')} />
      )}
      <Paper className="footer" elevation={3}>
        <div className="footer__container">
          <ExtLink
            text={t('links.opintopolku.text')}
            href={t('links.opintopolku.link')}
            endIcon={<OpenInNewIcon />}
          />
          <ExtLink
            text={t('links.accessibility.text')}
            href={t('links.accessibility.link')}
            endIcon={<OpenInNewIcon />}
          />
          <ExtLink
            text={t('links.aktHomepage.text')}
            href={t('links.aktHomepage.link')}
            endIcon={<OpenInNewIcon />}
          />
        </div>
        <div className="footer__container">
          <H3>{t('address.name')}</H3>
          <br />
          <Text>{t('address.street')}</Text>
          <Text>{t('address.zipCity')}</Text>
          <br />
          <div>
            <Text className="inline-text">{t('address.phone.title')}</Text>
            <Text className="inline-text bold">
              {t('address.phone.number')}
            </Text>
          </div>
          <div>
            <Text className="inline-text">{t('address.fax.title')}</Text>
            <Text className="inline-text bold">{t('address.fax.number')}</Text>
          </div>
        </div>
        <div className="footer__container">
          <Svg className="header__left__logo" src={Logo} alt={t('logo.alt')} />
        </div>
      </Paper>
    </footer>
  );
};

export default Footer;
