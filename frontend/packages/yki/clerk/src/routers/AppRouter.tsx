import { OphThemeProvider } from '@opetushallitus/oph-design-system/theme';
import { FC, useEffect } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
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
import { ClerkExamSessionPage } from 'pages/ClerkExamSessionPage';
import { ClerkFreeRegistrationDetailsPage } from 'pages/ClerkFreeRegistrationDetailsPage';
import { ClerkFreeRegistrationPage } from 'pages/ClerkFreeRegistrationPage';
import { ClerkHomePage } from 'pages/ClerkHomePage';
import { ClerkOrganizerRegisterDetailsPage } from 'pages/ClerkOrganizerRegisterDetails';
import { loadSession } from 'redux/reducers/session';
import { sessionSelector } from 'redux/selectors/session';

export const AppRouter: FC = () => {
  const translateCommon = useCommonTranslation();
  const sessionStatus = useAppSelector(sessionSelector).status;
  const dispatch = useAppDispatch();
  const appTitle = translateCommon('appTitle');

  const createTitle = (title: string) =>
    translateCommon('pageTitle.' + title) + ' - ' + appTitle;

  useEffect(() => {
    if (sessionStatus === APIResponseStatus.NotStarted) {
      dispatch(loadSession());
    }
  }, [dispatch, sessionStatus]);

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
              <ClerkOrganizerRegisterDetailsPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.ClerkFreeRegistration}
          element={
            <YkiTitlePage title="clerk">
              <ClerkFreeRegistrationPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.ClerkFreeRegistrationDetails}
          element={
            <YkiTitlePage title="clerk">
              <ClerkFreeRegistrationDetailsPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.ClerkExamSession}
          element={
            <YkiTitlePage title="customerExamSession">
              <ClerkExamSessionPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.CustomerSearch}
          element={
            <YkiTitlePage title="customerSearch">
              <ClerkCustomerSearchPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.ClerkCustomerDetails}
          element={
            <YkiTitlePage title="customerDetails">
              <ClerkCustomerDetailsPage />
            </YkiTitlePage>
          }
        />
      </Route>,
    ),
  );

  return <RouterProvider router={router} />;
};
