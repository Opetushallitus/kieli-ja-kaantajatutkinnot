import { AppBar, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';
import { OPHLogoViewer, SkipLink } from 'shared/components';
import { Direction } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { YkiLangSelector } from 'components/elements/YkiLangSelector';
import { PublicNavTabs } from 'components/layouts/publicHeader/PublicNavTabs';
import { SessionStateHeader } from 'components/layouts/SessionStateHeader';
import { getCurrentLang, useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';

export const Header = (): JSX.Element => {
  const translateCommon = useCommonTranslation();

  const logoRedirectURL = AppRoutes.Registration;
  const { isPhone } = useWindowProperties();

  return (
    <>
      <SkipLink
        href="#main-content"
        text={translateCommon('header.accessibility.continueToMain')}
      />
      <AppBar className="header" position="static">
        {isPhone && (
          <Toolbar className="header__toolbar header__toolbar__mobile-lang-select">
            <YkiLangSelector usage="header" />
          </Toolbar>
        )}
        <SessionStateHeader />
        <Toolbar className="header__toolbar">
          <div className="header__left">
            <Link to={logoRedirectURL}>
              <OPHLogoViewer
                className="header__left__logo"
                direction={Direction.Horizontal}
                alt={translateCommon('ophLogoToFrontPageAlt')}
                currentLang={getCurrentLang()}
                title={translateCommon('appNameAbbreviation')}
              />
            </Link>
          </div>
          <div className="header__center">
            <PublicNavTabs />
          </div>
          <div className="header__right">
            {!isPhone && <YkiLangSelector usage="header" />}
          </div>
        </Toolbar>
      </AppBar>
    </>
  );
};
