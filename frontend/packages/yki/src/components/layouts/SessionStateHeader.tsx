import {
  LogoutOutlined as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import Button from '@mui/material/Button';
import { FC, useEffect } from 'react';
import { generatePath, Link, matchPath, useLocation } from 'react-router-dom';
import { Text } from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog, useWindowProperties } from 'shared/hooks';

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

const OpenRegistrationsContent = ({
  count,
  examSessionId,
}: {
  count: number;
  examSessionId: string;
}) => {
  const translateCommon = useCommonTranslation();

  return (
    <>
      <Text>
        {translateCommon('header.sessionState.activeRegistrations', {
          count,
        })}
      </Text>
      <Link
        to={generatePath(AppRoutes.ExamSessionRegistration, {
          examSessionId,
        })}
      >
        {translateCommon('header.sessionState.continueToRegistration')}
      </Link>
    </>
  );
};

const LogoutDialogContents = () => {
  const translateCommon = useCommonTranslation();

  return (
    <Text>
      {translateCommon('header.sessionState.logOutDialog.description1')}
      <br />
      {translateCommon('header.sessionState.logOutDialog.description2')}
    </Text>
  );
};

export const SessionStateHeader: FC = () => {
  const location = useLocation();
  const translateCommon = useCommonTranslation();
  const { openRegistrations, status: openRegistrationsStatus } = useAppSelector(
    userOpenRegistrationsSelector,
  );
  const session = useAppSelector(sessionSelector).loggedInSession;
  const dispatch = useAppDispatch();
  const isAuthenticated = session && session.identity !== null;
  const notOnRegistrationPage =
    matchPath(AppRoutes.ExamSessionRegistration, location.pathname) === null;
  const { isPhone } = useWindowProperties();
  const openRegistrationsCount =
    (notOnRegistrationPage && openRegistrations && openRegistrations.length) ||
    0;
  const exampleOpenRegistration =
    notOnRegistrationPage && openRegistrations && openRegistrations[0];

  const { showDialog } = useDialog();
  const handleLogout = () => {
    showDialog({
      severity: Severity.Info,
      title: translateCommon('header.sessionState.logOutDialog.title'),
      content: <LogoutDialogContents />,
      actions: [
        {
          title: translateCommon(
            'header.sessionState.logOutDialog.confirmButton',
          ),
          variant: Variant.Outlined,
          action: () => (document.location = generateLogoutURL()),
        },
        {
          title: translateCommon(
            'header.sessionState.logOutDialog.cancelButton',
          ),
          variant: Variant.Contained,
        },
      ],
    });
  };

  useEffect(() => {
    const needsUserOpenRegistrations =
      isAuthenticated &&
      notOnRegistrationPage &&
      openRegistrationsStatus === APIResponseStatus.NotStarted;

    if (needsUserOpenRegistrations) {
      dispatch(loadUserOpenRegistrations());
    }
  }, [
    isAuthenticated,
    notOnRegistrationPage,
    openRegistrationsStatus,
    dispatch,
  ]);

  if (!isAuthenticated) return <></>;

  if (isPhone) {
    return (
      <div className={'session-header rows gapped-xs'}>
        <div className="session-header__user-details rows gapped-xs">
          <Text className="columns gapped-xxs">
            <PersonIcon className="session-header__user-icon" />
            {getUserName(session)}
          </Text>
          <Button
            className="session-header__logout-button"
            color={Color.Secondary}
            variant={Variant.Outlined}
            onClick={handleLogout}
          >
            <LogoutIcon />
            {translateCommon('header.sessionState.logOut')}
          </Button>
        </div>
        {exampleOpenRegistration && (
          <div className="session-header__open-registrations rows">
            <OpenRegistrationsContent
              count={openRegistrationsCount}
              examSessionId={exampleOpenRegistration.exam_session_id.toString()}
            />
          </div>
        )}
      </div>
    );
  } else {
    return (
      <div className="session-header columns gapped">
        {exampleOpenRegistration && (
          <div className="session-header__open-registrations columns gapped-xxs">
            <OpenRegistrationsContent
              count={openRegistrationsCount}
              examSessionId={exampleOpenRegistration.exam_session_id.toString()}
            />
          </div>
        )}
        <Text className="columns gapped-xxs session-header__user-details">
          <PersonIcon className="session-header__user-icon" />
          {getUserName(session)}
        </Text>
        <Button
          className="session-header__logout-button"
          color={Color.Secondary}
          variant={Variant.Outlined}
          onClick={handleLogout}
        >
          <LogoutIcon />
          {translateCommon('header.sessionState.logOut')}
        </Button>
      </div>
    );
  }
};
