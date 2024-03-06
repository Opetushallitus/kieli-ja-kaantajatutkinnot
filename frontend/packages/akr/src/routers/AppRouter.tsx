import { FC } from 'react';
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
import { TitlePage } from 'shared/utils';

import { Footer } from 'components/layouts/Footer';
import { Header } from 'components/layouts/Header';
import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import { useAPIErrorToast } from 'hooks/useAPIErrorToast';
import { AccessibilityStatementPage } from 'pages/AccessibilityStatementPage';
import { ClerkHomePage } from 'pages/clerk/ClerkHomePage';
import { ClerkNewTranslatorPage } from 'pages/clerk/ClerkNewTranslatorPage';
import { ClerkPersonSearchPage } from 'pages/clerk/ClerkPersonSearchPage';
import { ClerkSendEmailPage } from 'pages/clerk/ClerkSendEmailPage';
import { ClerkTranslatorOverviewPage } from 'pages/clerk/ClerkTranslatorOverviewPage';
import { ExaminationDatesPage } from 'pages/ExaminationDatesPage';
import { MeetingDatesPage } from 'pages/MeetingDatesPage';
import { NotFoundPage } from 'pages/NotFoundPage';
import { PrivacyPolicyPage } from 'pages/PrivacyPolicyPage';
import { PublicHomePage } from 'pages/PublicHomePage';
import { StatisticsPage } from 'pages/StatisticsPage';

export const AppRouter: FC = () => {
  const translateCommon = useCommonTranslation();
  const appTitle = translateCommon('appTitle');

  const ErrorToast = () => {
    useAPIErrorToast();

    return <></>;
  };

  const createTitle = (title: string) =>
    translateCommon('pageTitle.' + title) + ' - ' + appTitle;

  const Root = (
    <div className="app">
      <NotifierContextProvider>
        <Header />
        <ErrorToast />
        <Notifier />
        <ScrollToTop />
        <main className="content" id="main-content">
          <div className="content__container">
            <Outlet />
          </div>
        </main>
        <Footer />
      </NotifierContextProvider>
    </div>
  );

  const FrontPage = (
    <TitlePage title={createTitle('frontPage')}>
      <PublicHomePage />
    </TitlePage>
  );

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path={AppRoutes.PublicRoot} element={Root}>
        <Route index={true} element={FrontPage} />
        <Route path={AppRoutes.PublicHomePage} element={FrontPage} />
        <Route
          path={AppRoutes.ClerkHomePage}
          element={
            <TitlePage title={createTitle('clerkHomepage')}>
              <ClerkHomePage />
            </TitlePage>
          }
        />
        <Route
          path={AppRoutes.ExaminationDatesPage}
          element={
            <TitlePage title={createTitle('clerkHomepage')}>
              <ExaminationDatesPage />
            </TitlePage>
          }
        />
        <Route
          path={AppRoutes.MeetingDatesPage}
          element={
            <TitlePage title={createTitle('clerkHomepage')}>
              <MeetingDatesPage />
            </TitlePage>
          }
        />
        <Route
          path={AppRoutes.StatisticsPage}
          element={
            <TitlePage title={createTitle('clerkHomepage')}>
              <StatisticsPage />
            </TitlePage>
          }
        />
        <Route
          path={AppRoutes.ClerkSendEmailPage}
          element={
            <TitlePage title={createTitle('clerkHomepage')}>
              <ClerkSendEmailPage />
            </TitlePage>
          }
        />
        <Route
          path={AppRoutes.ClerkTranslatorOverviewPage}
          element={
            <TitlePage title={createTitle('clerkHomepage')}>
              <ClerkTranslatorOverviewPage />
            </TitlePage>
          }
        />
        <Route
          path={AppRoutes.ClerkPersonSearchPage}
          element={
            <TitlePage title={createTitle('clerkHomepage')}>
              <ClerkPersonSearchPage />
            </TitlePage>
          }
        />
        <Route
          path={AppRoutes.ClerkNewTranslatorPage}
          element={
            <TitlePage title={createTitle('clerkHomepage')}>
              <ClerkNewTranslatorPage />
            </TitlePage>
          }
        />
        <Route
          path={AppRoutes.AccessibilityStatementPage}
          element={
            <TitlePage title={createTitle('accessibilityStatement')}>
              <AccessibilityStatementPage />
            </TitlePage>
          }
        />
        <Route
          path={AppRoutes.PrivacyPolicyPage}
          element={
            <TitlePage title={createTitle('privacyPolicy')}>
              <PrivacyPolicyPage />
            </TitlePage>
          }
        />
        <Route
          path={AppRoutes.NotFoundPage}
          element={
            <TitlePage title={createTitle('notFound')}>
              <NotFoundPage />
            </TitlePage>
          }
        />
      </Route>,
    ),
  );

  return <RouterProvider router={router} />;
};
