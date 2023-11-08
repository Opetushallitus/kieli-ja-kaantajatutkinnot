import {
  LogoutOutlined as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import Button from '@mui/material/Button';
import { FC } from 'react';
import { Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { AppRoutes } from 'enums/app';
import {
  CasAuthenticatedClerkSession,
  EmailAuthenticatedSession,
  SuomiFiAuthenticatedSession,
} from 'interfaces/session';
import { sessionSelector } from 'redux/selectors/session';

const getUserName = (
  user:
    | EmailAuthenticatedSession
    | SuomiFiAuthenticatedSession
    | CasAuthenticatedClerkSession,
): string => {
  switch (user['auth-method']) {
    case 'SUOMIFI':
      return `${user.identity.first_name} ${user.identity.last_name}`;
    case 'EMAIL':
      return user.identity['external-user-id'];
    case 'CAS':
      return user.identity.username;
  }
};

const generateLogoutURL = () => {
  return `${APIEndpoints.Logout}?redirect=${window.location.origin}${AppRoutes.LogoutSuccess}`;
};

export const SessionStateHeader: FC = () => {
  const translateCommon = useCommonTranslation();
  const session = useAppSelector(sessionSelector).loggedInSession;
  if (!session || session.identity === null) return <></>;

  return (
    <div className="session-header columns gapped">
      <Text className="columns gapped-xxs session-header__user-details">
        <PersonIcon className="session-header__user-icon" />
        {getUserName(session)}
      </Text>
      <a href={generateLogoutURL()}>
        <Button color={Color.Secondary} variant={Variant.Outlined}>
          <LogoutIcon />
          {translateCommon('header.sessionState.logOut')}
        </Button>
      </a>
    </div>
  );
};
