import {
  LogoutOutlined as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import Button from '@mui/material/Button';
import { FC, useEffect } from 'react';
import { generatePath, Link, matchPath, useLocation } from 'react-router-dom';
import { Text } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { AppRoutes } from 'enums/app';
import {
  CasAuthenticatedClerkSession,
  EmailAuthenticatedSession,
  SuomiFiAuthenticatedSession,
} from 'interfaces/session';
import { loadUserOpenRegistrations } from 'redux/reducers/userOpenRegistrations';
import { sessionSelector } from 'redux/selectors/session';
import { userOpenRegistrationsSelector } from 'redux/selectors/userOpenRegistrations';

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
  const location = useLocation();
  const translateCommon = useCommonTranslation();
  const userOpenRegistrations = useAppSelector(userOpenRegistrationsSelector);
  const session = useAppSelector(sessionSelector).loggedInSession;
  const dispatch = useAppDispatch();
  const isAuthenticated = session && session.identity !== null;
  const notOnRegistrationPage =
    matchPath(AppRoutes.ExamSessionRegistration, location.pathname) === null;

  useEffect(() => {
    const needsUserOpenRegistrations =
      isAuthenticated &&
      notOnRegistrationPage &&
      userOpenRegistrations.status === APIResponseStatus.NotStarted;

    if (needsUserOpenRegistrations) {
      dispatch(loadUserOpenRegistrations());
    }
  }, [isAuthenticated, notOnRegistrationPage, userOpenRegistrations, dispatch]);

  if (!isAuthenticated) return <></>;

  return (
    <div className="session-header columns gapped">
      {notOnRegistrationPage &&
        userOpenRegistrations.openRegistrations &&
        userOpenRegistrations.openRegistrations[0] && (
          <div className="session-header__open-registrations columns gapped-xxs">
            <Text>
              {translateCommon('header.sessionState.activeRegistrations', {
                count: userOpenRegistrations.openRegistrations.length,
              })}
            </Text>
            <Link
              to={generatePath(AppRoutes.ExamSessionRegistration, {
                examSessionId:
                  userOpenRegistrations.openRegistrations[0].exam_session_id.toString(),
              })}
            >
              {translateCommon('header.sessionState.continueToRegistration')}
            </Link>
          </div>
        )}
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
