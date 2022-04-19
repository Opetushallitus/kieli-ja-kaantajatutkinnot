import { FC } from 'react';
import { AppBar, Toolbar, IconButton } from '@mui/material';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { Svg } from 'components/elements/Svg';
import { ExtLink } from 'components/elements/ExtLink';
import { LangSelector } from 'components/i18n/LangSelector';
import Logo from 'public/assets/svg/logo.svg';
import { useAppTranslation } from 'configs/i18n';

const Header: FC = () => {
  const { t } = useAppTranslation({ keyPrefix: 'akt.component.header' });

  return (
    <AppBar className="header" position="static">
      <Toolbar className="header__toolbar">
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
        ></IconButton>
        <div className="header__left">
          <Svg className="header__left__logo" src={Logo} alt={t('logo.alt')} />
        </div>
        <div className="header__right">
          <ExtLink
            text={t('ophLink.text')}
            href={t('ophLink.address')}
            endIcon={<OpenInNewIcon />}
          />
          <LangSelector />
        </div>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
