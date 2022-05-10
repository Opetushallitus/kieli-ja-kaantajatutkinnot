import { AppBar, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';
import { OPHLogoViewer, SkipLink } from 'shared/components';
import { Direction } from 'shared/enums';

import { LangSelector } from 'components/i18n/LangSelector';
import {
  getCurrentLang,
  useAppTranslation,
  useCommonTranslation,
} from 'configs/i18n';
import { AppRoutes } from 'enums/app';
// import { useAuthentication } from 'hooks/useAuthentication';

export const Header = (): JSX.Element => {
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.header.accessibility',
  });
  const translateCommon = useCommonTranslation();
  const currentLang = getCurrentLang();

  //   const [isClerkUI] = useAuthentication();
  //   const logoRedirectURL = isClerkUI
  //     ? AppRoutes.ClerkHomePage
  //     : AppRoutes.PublicHomePage;

  return (
    <>
      <SkipLink href="#main-content" text={t('continueToMain')} />
      <AppBar className="header" position="static">
        <Toolbar className="header__toolbar">
          <div className="header__left">
            <Link to={AppRoutes.PublicHomePage}>
              <OPHLogoViewer
                currentLang={currentLang}
                className="header__left__logo"
                direction={Direction.Horizontal}
                alt={translateCommon('ophLogo')}
              />
            </Link>
          </div>
          <div className="header__center"></div>
          <div className="header__right">
            <LangSelector />
          </div>
        </Toolbar>
      </AppBar>
    </>
  );
};
