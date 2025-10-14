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
import { TitlePage, TitlePageProps } from 'shared/utils';

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

  const AkrTitlePage = ({ title, children }: TitlePageProps) => (
    <TitlePage title={createTitle(title)} className="title-page">
      {children}
    </TitlePage>
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
            <AkrTitlePage title="clerkHomepage">
              <ClerkHomePage />
            </AkrTitlePage>
          }
        />
        <Route
          path={AppRoutes.ExaminationDatesPage}
          element={
            <AkrTitlePage title="clerkHomepage">
              <ExaminationDatesPage />
            </AkrTitlePage>
          }
        />
        <Route
          path={AppRoutes.MeetingDatesPage}
          element={
            <AkrTitlePage title="clerkHomepage">
              <MeetingDatesPage />
            </AkrTitlePage>
          }
        />
        <Route
          path={AppRoutes.StatisticsPage}
          element={
            <AkrTitlePage title="clerkHomepage">
              <StatisticsPage />
            </AkrTitlePage>
          }
        />
        <Route
          path={AppRoutes.ClerkSendEmailPage}
          element={
            <AkrTitlePage title="clerkHomepage">
              <ClerkSendEmailPage />
            </AkrTitlePage>
          }
        />
        <Route
          path={AppRoutes.ClerkTranslatorOverviewPage}
          element={
            <AkrTitlePage title="clerkHomepage">
              <ClerkTranslatorOverviewPage />
            </AkrTitlePage>
          }
        />
        <Route
          path={AppRoutes.ClerkPersonSearchPage}
          element={
            <AkrTitlePage title="clerkHomepage">
              <ClerkPersonSearchPage />
            </AkrTitlePage>
          }
        />
        <Route
          path={AppRoutes.ClerkNewTranslatorPage}
          element={
            <AkrTitlePage title="clerkHomepage">
              <ClerkNewTranslatorPage />
            </AkrTitlePage>
          }
        />
        <Route
          path={AppRoutes.AccessibilityStatementPage}
          element={
            <AkrTitlePage title="accessibilityStatement">
              <AccessibilityStatementPage />
            </AkrTitlePage>
          }
        />
        <Route
          path={AppRoutes.PrivacyPolicyPage}
          element={
            <AkrTitlePage title="privacyPolicy">
              <PrivacyPolicyPage />
            </AkrTitlePage>
          }
        />
        <Route
          path={AppRoutes.NotFoundPage}
          element={
            <AkrTitlePage title="notFound">
              <NotFoundPage />
            </AkrTitlePage>
          }
        />
      </Route>,
    ),
  );

  return <RouterProvider router={router} />;
};
