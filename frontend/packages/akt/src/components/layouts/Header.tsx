import { AppBar, Toolbar } from '@mui/material';
import { Link } from 'react-router-dom';

import { OPHLogoViewer } from 'components/elements/OPHLogoViewer';
import { SkipLink } from 'components/elements/SkipLink';
import { LangSelector } from 'components/i18n/LangSelector';
import { ClerkNavTabs } from 'components/layouts//clerkHeader/ClerkNavTabs';
import { ClerkHeaderButtons } from 'components/layouts/clerkHeader/ClerkHeaderButtons';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { AppRoutes, Direction } from 'enums/app';
import { useAuthentication } from 'hooks/useAuthentication';

export const Header = (): JSX.Element => {
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.header.accessibility',
  });
  const translateCommon = useCommonTranslation();

  const [isClerkUI] = useAuthentication();
  const logoRedirectURL = isClerkUI
    ? AppRoutes.ClerkHomePage
    : AppRoutes.PublicHomePage;

  return (
    <>
      <SkipLink href="#main-content" text={t('continueToMain')} />
      <AppBar className="header" position="static">
        <Toolbar className="header__toolbar">
          <div className="header__left">
            <Link to={logoRedirectURL}>
              <OPHLogoViewer
                className="header__left__logo"
                direction={Direction.Horizontal}
                alt={translateCommon('ophLogo')}
              />
            </Link>
          </div>
          <div className="header__center">{isClerkUI && <ClerkNavTabs />}</div>
          <div className="header__right">
            {isClerkUI && <ClerkHeaderButtons />}
            <LangSelector />
          </div>
        </Toolbar>
      </AppBar>
    </>
  );
};
