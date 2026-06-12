import { OphThemeProvider } from '@opetushallitus/oph-design-system/theme';
import { FC, useEffect } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Navigate,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router-dom';
import {
  Notifier,
  NotifierContextProvider,
  ScrollToTop,
} from 'shared/components';
import { APIResponseStatus } from 'shared/enums';
import { TitlePage, TitlePageProps } from 'shared/utils';

import { ClerkHeader } from 'components/layouts/clerkHeader/ClerkHeader';
import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { useAPIErrorToast } from 'hooks/useAPIErrorToast';
import { clerkTheme } from 'ophTheme/OphTheme';
import { ClerkAddOrganizerPage } from 'pages/ClerkAddOrganizerPage';
import { ClerkCustomerDetailsPage } from 'pages/ClerkCustomerDetailsPage';
import { ClerkCustomerSearchPage } from 'pages/ClerkCustomerSearchPage';
import { ClerkExamDatesPage } from 'pages/ClerkExamDatesPage';
import { ClerkExamSessionPage } from 'pages/ClerkExamSessionPage';
import { ClerkHomePage } from 'pages/ClerkHomePage';
import { ClerkOrganizerRegisterDetailsPage } from 'pages/ClerkOrganizerRegisterDetails';
import { ClerkPaymentReportPage } from 'pages/ClerkPaymentReportPage';
import { ClerkQuarantinePage } from 'pages/ClerkQuarantinePage';
import { loadSession } from 'redux/reducers/session';
import { loadUser } from 'redux/reducers/user';
import { sessionSelector } from 'redux/selectors/session';
import { userSelector } from 'redux/selectors/user';

const ProtectedRoute = ({
  requireAdmin,
  requireOrganizer,
}: {
  requireAdmin?: boolean;
  requireOrganizer?: boolean;
}) => {
  const { status, user } = useAppSelector(userSelector);

  if (
    status === APIResponseStatus.InProgress ||
    status === APIResponseStatus.NotStarted
  ) {
    return null;
  }

  if (!user) {
    return null;
  }

  if (requireAdmin && !user.isAdmin) {
    return user.isOrganizer ? (
      <Navigate to={`${AppRoutes.Organizer}/${user.oid}`} replace />
    ) : null;
  }

  if (requireOrganizer && !user.isOrganizer) {
    return user.isAdmin ? (
      <Navigate to={AppRoutes.ClerkOrganizerRegister} replace />
    ) : null;
  }

  return <Outlet />;
};

export const AppRouter: FC = () => {
  const translateCommon = useCommonTranslation();
  const sessionStatus = useAppSelector(sessionSelector).status;
  const { status: userStatus } = useAppSelector(userSelector);
  const dispatch = useAppDispatch();
  const appTitle = translateCommon('appTitle');

  const createTitle = (title: string) =>
    translateCommon('pageTitle.' + title) + ' - ' + appTitle;

  useEffect(() => {
    if (sessionStatus === APIResponseStatus.NotStarted) {
      dispatch(loadSession());
    }
  }, [dispatch, sessionStatus]);

  useEffect(() => {
    if (userStatus === APIResponseStatus.NotStarted) {
      dispatch(loadUser());
    }
  }, [dispatch, userStatus]);

  const ErrorToast = () => {
    useAPIErrorToast();

    return <></>;
  };

  const ClerkRoot = (
    <div className="app">
      <NotifierContextProvider>
        <OphThemeProvider lang="fi" variant="oph" overrides={clerkTheme}>
          <ClerkHeader />
          <ErrorToast />
          <Notifier />
          <ScrollToTop />
          <main className="clerk-content" id="main-content">
            <div className="clerk-content__container">
              <Outlet />
            </div>
          </main>
        </OphThemeProvider>
      </NotifierContextProvider>
    </div>
  );

  const YkiTitlePage = ({ title, children }: TitlePageProps) => (
    <TitlePage title={createTitle(title)} className="title-page">
      {children}
    </TitlePage>
  );

  const router = createBrowserRouter(
    createRoutesFromElements(
      <>
        <Route element={<ProtectedRoute requireAdmin />}>
          <Route path={AppRoutes.ClerkRoot} element={ClerkRoot}>
            <Route
              path={AppRoutes.ClerkOrganizerRegister}
              element={
                <YkiTitlePage title="clerk">
                  <ClerkHomePage />
                </YkiTitlePage>
              }
            />
            <Route
              path={AppRoutes.ClerkAddOrganizer}
              element={
                <YkiTitlePage title="clerk">
                  <ClerkAddOrganizerPage />
                </YkiTitlePage>
              }
            />
            <Route
              path={AppRoutes.ClerkOrganizerRegisterDetails}
              element={
                <YkiTitlePage title="clerk">
                  <ClerkOrganizerRegisterDetailsPage route="clerk" />
                </YkiTitlePage>
              }
            />
            <Route
              path={AppRoutes.ClerkQuarantine}
              element={
                <YkiTitlePage title="clerk">
                  <ClerkQuarantinePage />
                </YkiTitlePage>
              }
            />
            <Route
              path={AppRoutes.ClerkExamDates}
              element={
                <YkiTitlePage title="clerk">
                  <ClerkExamDatesPage />
                </YkiTitlePage>
              }
            />
            <Route
              path={AppRoutes.ClerkExamSession}
              element={
                <YkiTitlePage title="customerExamSession">
                  <ClerkExamSessionPage route="clerk" />
                </YkiTitlePage>
              }
            />
            <Route
              path={AppRoutes.CustomerSearch}
              element={
                <YkiTitlePage title="customerSearch">
                  <ClerkCustomerSearchPage route="clerk" />
                </YkiTitlePage>
              }
            />
            <Route
              path={AppRoutes.ClerkCustomerDetails}
              element={
                <YkiTitlePage title="customerDetails">
                  <ClerkCustomerDetailsPage route="clerk" />
                </YkiTitlePage>
              }
            />
            <Route
              path={AppRoutes.ClerkPaymentReport}
              element={
                <YkiTitlePage title="paymentReport">
                  <ClerkPaymentReportPage />
                </YkiTitlePage>
              }
            />
          </Route>
        </Route>
        <Route element={<ProtectedRoute requireOrganizer />}>
          <Route path={AppRoutes.Organizer} element={ClerkRoot}>
            <Route
              path={AppRoutes.OrganizerHome}
              element={
                <YkiTitlePage title="clerk">
                  <ClerkOrganizerRegisterDetailsPage route="organizer" />
                </YkiTitlePage>
              }
            />
            <Route
              path={AppRoutes.OrganizerCustomerSearch}
              element={
                <YkiTitlePage title="customerSearch">
                  <ClerkCustomerSearchPage route="organizer" />
                </YkiTitlePage>
              }
            />
            <Route
              path={AppRoutes.OrganizerCustomerDetails}
              element={
                <YkiTitlePage title="customerDetails">
                  <ClerkCustomerDetailsPage route="organizer" />
                </YkiTitlePage>
              }
            />
            <Route
              path={AppRoutes.OrganizerExamSession}
              element={
                <YkiTitlePage title="customerExamSession">
                  <ClerkExamSessionPage route="organizer" />
                </YkiTitlePage>
              }
            />
          </Route>
        </Route>
      </>,
    ),
  );

  return <RouterProvider router={router} />;
};
