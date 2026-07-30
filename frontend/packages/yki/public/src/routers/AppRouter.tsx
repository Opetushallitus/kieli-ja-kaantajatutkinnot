import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { ThemeProvider } from '@mui/material';
import { FC, useEffect } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router-dom';
import {
  CustomButtonLink,
  Notifier,
  NotifierContextProvider,
  ScrollToTop,
} from 'shared/components';
import { theme } from 'shared/configs';
import { APIResponseStatus, Variant } from 'shared/enums';
import { TitlePage, TitlePageProps } from 'shared/utils';

import { Header } from 'components/layouts/Header';
import { NewYkiFooter } from 'components/layouts/NewYkiFooter';
import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, RegistrationKind } from 'enums/app';
import { useAPIErrorToast } from 'hooks/useAPIErrorToast';
import { AccessibilityStatementPage } from 'pages/AccessibilityStatementPage';
import { ConfirmRegistrationPage } from 'pages/ConfirmRegistrationPage';
import { EvaluationOrderPage } from 'pages/EvaluationOrderPage';
import { EvaluationOrderStatusPage } from 'pages/EvaluationOrderStatusPage';
import { ExamDetailsPage } from 'pages/ExamDetailsPage';
import { ExpiredLoginLinkPage } from 'pages/ExpiredLoginLinkPage';
import { FreeRegistrationSuccessPage } from 'pages/FreeRegistrationSuccessPage';
import { InitRegistrationPage } from 'pages/InitRegistrationPage';
import { LogoutSuccess } from 'pages/LogoutSuccess';
import { ModifyContactDetailsPage } from 'pages/ModifyContactDetailsPage';
import { NotFoundPage } from 'pages/NotFoundPage';
import { ReassessmentPage } from 'pages/ReassessmentPage';
import { RegistrationPage } from 'pages/RegistrationPage';
import { RegistrationPaymentStatusPage } from 'pages/RegistrationPaymentStatusPage';
import { UserDetailsPage } from 'pages/UserDetailsPage';
import { loadSession } from 'redux/reducers/session';
import { sessionSelector } from 'redux/selectors/session';

const colorSecondaryLight = '#159ecb'; // not in figma specs
const colorSecondary = '#378703';
const colorSecondaryDark = '#5bca13';
const colorPrimary = '#ffffff';
const colorGrey200 = '#f5f5f5';
const colorGrey700 = '#666666';
const fontWeightBold = 700;
const colorTextPrimary = '#1d1d1d';

const newYkiPublicTheme = {
  ...theme,
  components: {
    ...theme.components,
    MuiButton: {
      styleOverrides: {
        root: {
          borderWidth: '2px',
          borderColor: colorSecondary,
          transition: 'color 0.25s, background-color 0.25s, border-color 0.25s',
          variants: [
            {
              props: { variant: Variant.Contained },
              color: colorPrimary,
              style: {
                '&:hover': {
                  color: colorPrimary,
                  backgroundColor: colorSecondaryDark,
                },
              },
            },
            {
              props: { variant: Variant.Outlined },
              color: colorPrimary,
              style: {
                '&:hover': {
                  color: colorSecondaryDark,
                  borderColor: colorSecondaryDark,
                  backgroundColor: colorPrimary,
                },
              },
            },
            {
              props: { variant: Variant.Text },
              style: {
                '&:hover': {
                  color: colorSecondaryDark,
                  backgroundColor: colorPrimary,
                },
              },
            },
          ],
        },
      },
    },
    MuiCheckbox: {
      styleOverrides: {
        root: {
          color: colorGrey700,
          '&.Mui-checked': {
            color: colorSecondary,
          },
        },
      },
    },
    MuiRadio: {
      styleOverrides: {
        root: {
          color: colorGrey700,
          '&.Mui-checked': {
            color: colorSecondary,
          },
          '&.Mui-disabled': {
            color: colorGrey700,
          },
        },
      },
    },
    MuiAutocomplete: {
      styleOverrides: {
        tag: {
          backgroundColor: colorSecondary,
          color: colorPrimary,
          '.MuiChip-deleteIcon': {
            color: colorGrey200,
          },
        },
      },
    },
    MuiStepIcon: {
      styleOverrides: {
        root: {
          '&.Mui-completed': {
            color: colorSecondary,
          },
          '&.Mui-active': {
            color: colorSecondary,
          },
        },
        text: {
          fill: colorPrimary,
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: colorTextPrimary,
          fontWeight: fontWeightBold,
          textDecoration: 'underline',
          '&:hover': {
            backgroundColor: 'transparent',
          },
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          fontFamily: "'Open Sans', sans-serif",
        },
      },
    },
  },
  palette: {
    ...theme.palette,
    secondary: {
      main: colorSecondary,
      light: colorSecondaryLight,
      dark: colorSecondaryDark,
      contrastText: colorPrimary,
    },
  },
  typography: {
    ...theme.typography,
    h1: {
      ...theme.typography.h1,
      color: colorTextPrimary,
    },
    h2: {
      ...theme.typography.h2,
      color: colorTextPrimary,
    },
    h3: {
      ...theme.typography.h3,
      color: colorTextPrimary,
    },
    body1: {
      ...theme.typography.body1,
      color: colorTextPrimary,
    },
    caption: {
      ...theme.typography.caption,
      color: colorGrey700,
    },
    label: {
      ...theme.typography.label,
      color: colorTextPrimary,
    },
  },
};

const newYkiThemeOrSharedTheme = newYkiPublicTheme;

const ErrorToast = () => {
  useAPIErrorToast();

  return <></>;
};

const YkiTitlePage = ({ title, children }: TitlePageProps) => {
  const translateCommon = useCommonTranslation();
  const appTitle = translateCommon('appTitle');

  const createTitle = (title: string) =>
    translateCommon('pageTitle.' + title) + ' - ' + appTitle;

  return (
    <TitlePage title={createTitle(title)} className="title-page">
      {children}
    </TitlePage>
  );
};

const FrontPage = (
  <YkiTitlePage title="registration">
    <RegistrationPage />
  </YkiTitlePage>
);

const UserPortalSubPage = ({ title, children }: TitlePageProps) => {
  const translateCommon = useCommonTranslation();

  return (
    <YkiTitlePage title={title}>
      <div className="rows gapped-xxl">
        <div className="columns">
          <CustomButtonLink
            to={AppRoutes.UserDetails}
            startIcon={<ArrowBackIcon />}
            variant={Variant.Text}
            className="color-text-primary"
          >
            {translateCommon('back')}
          </CustomButtonLink>
        </div>
        {children}
      </div>
    </YkiTitlePage>
  );
};

export const AppRouter: FC = () => {
  const sessionStatus = useAppSelector(sessionSelector).status;
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (sessionStatus === APIResponseStatus.NotStarted) {
      dispatch(loadSession());
    }
  }, [dispatch, sessionStatus]);

  const Root = (
    <div className="app">
      <NotifierContextProvider>
        <ThemeProvider theme={newYkiThemeOrSharedTheme}>
          <Header />
          <ErrorToast />
          <Notifier />
          <ScrollToTop />
          <main className="content" id="main-content">
            <div className="content__container">
              <Outlet />
            </div>
          </main>
          {<NewYkiFooter />}
        </ThemeProvider>
      </NotifierContextProvider>
    </div>
  );

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path={AppRoutes.PublicRoot} element={Root}>
        <Route index={true} element={FrontPage} />
        <Route path={AppRoutes.Registration} element={FrontPage} />
        <Route
          path={AppRoutes.ExamSession}
          element={
            <YkiTitlePage title="registration">
              <InitRegistrationPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.ExamSessionRegistration}
          element={
            <YkiTitlePage title="examDetails">
              <ExamDetailsPage registrationKind={RegistrationKind.Admission} />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.ExamSessionQueue}
          element={
            <YkiTitlePage title="examDetails">
              <ExamDetailsPage registrationKind={RegistrationKind.Queue} />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.RegistrationPaymentStatus}
          element={
            <YkiTitlePage title="registrationPaymentStatus">
              <RegistrationPaymentStatusPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.FreeRegistrationSuccess}
          element={
            <YkiTitlePage title="freeRegistrationSuccess">
              <FreeRegistrationSuccessPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.Reassessment}
          element={
            <YkiTitlePage title="reassessment">
              <ReassessmentPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.ReassessmentOrder}
          element={
            <YkiTitlePage title="evaluationOrder">
              <EvaluationOrderPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.ReassessmentOrderStatus}
          element={
            <YkiTitlePage title="evaluationOrderStatus">
              <EvaluationOrderStatusPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.AccessibilityStatementPage}
          element={
            <YkiTitlePage title="accessibilityStatement">
              <AccessibilityStatementPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.UserDetails}
          element={
            <YkiTitlePage title="userDetails">
              <UserDetailsPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.ModifyContactDetails}
          element={
            <UserPortalSubPage title="modifyContactDetails">
              <ModifyContactDetailsPage />
            </UserPortalSubPage>
          }
        />
        <Route
          path={AppRoutes.ConfirmRegistration}
          element={
            <UserPortalSubPage title="transferRegistration">
              <ConfirmRegistrationPage />
            </UserPortalSubPage>
          }
        />
        <Route
          path={AppRoutes.ExpiredLoginLinkPage}
          element={
            <UserPortalSubPage title="expiredLoginLink">
              <ExpiredLoginLinkPage />
            </UserPortalSubPage>
          }
        />
        <Route
          path={AppRoutes.LogoutSuccess}
          element={
            <YkiTitlePage title="logoutSuccess">
              <LogoutSuccess />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.NotFoundPage}
          element={
            <YkiTitlePage title="notFound">
              <NotFoundPage />
            </YkiTitlePage>
          }
        />
      </Route>,
    ),
  );

  return <RouterProvider router={router} />;
};
