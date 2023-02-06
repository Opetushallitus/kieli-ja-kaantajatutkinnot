import { AppBar, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';
import { LangSelector, OPHLogoViewer, SkipLink } from 'shared/components';
import { AppLanguage, Direction } from 'shared/enums';

import { PublicNavTabs } from 'components/layouts/publicHeader/PublicNavTabs';
import {
  changeLang,
  getCurrentLang,
  getSupportedLangs,
  useCommonTranslation,
} from 'configs/i18n';
import { AppRoutes } from 'enums/app';

export const Header = (): JSX.Element => {
  const translateCommon = useCommonTranslation();
  const [finnish, swedish, english] = getSupportedLangs();

  const langDict = new Map<string, AppLanguage>([
    [translateCommon('header.lang.fi'), finnish],
    [translateCommon('header.lang.sv'), swedish],
    [translateCommon('header.lang.en'), english],
  ]);

  const logoRedirectURL = AppRoutes.Registration;

  return (
    <>
      <SkipLink
        href="#main-content"
        text={translateCommon('header.accessibility.continueToMain')}
      />
      <AppBar className="header" position="static">
        <Toolbar className="header__toolbar">
          <div className="header__left">
            <Link to={logoRedirectURL}>
              <OPHLogoViewer
                className="header__left__logo"
                direction={Direction.Horizontal}
                alt={translateCommon('ophLogo')}
                currentLang={getCurrentLang()}
              />
            </Link>
          </div>
          <div className="header__center">
            <PublicNavTabs />
          </div>
          <div className="header__right">
            <LangSelector
              changeLang={changeLang}
              getCurrentLang={getCurrentLang}
              langDict={langDict}
              langSelectorAriaLabel={translateCommon(
                'header.accessibility.langSelectorAriaLabel'
              )}
            />
          </div>
        </Toolbar>
      </AppBar>
    </>
  );
};
