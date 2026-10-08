import { FC } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router';
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
import { ClerkHomePage } from 'pages/ClerkHomePage';
import { ClerkInterpreterOverviewPage } from 'pages/ClerkInterpreterOverviewPage';
import { ClerkNewInterpreterPage } from 'pages/ClerkNewInterpreterPage';
import { ClerkPersonSearchPage } from 'pages/ClerkPersonSearchPage';
import { MeetingDatesPage } from 'pages/MeetingDatesPage';
import { NotFoundPage } from 'pages/NotFoundPage';
import { PrivacyPolicyPage } from 'pages/PrivacyPolicyPage';
import { PublicHomePage } from 'pages/PublicHomePage';

export const AppRouter: FC = () => {
  const translateCommon = useCommonTranslation();
  const appTitle = translateCommon('appTitle');

  const createTitle = (title: string) =>
    translateCommon('pageTitle.' + title) + ' - ' + appTitle;

  const ErrorToast = () => {
    useAPIErrorToast();

    return <></>;
  };

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

  const OtrTitlePage = ({ title, children }: TitlePageProps) => (
    <TitlePage title={createTitle(title)} className="title-page">
      {children}
    </TitlePage>
  );

  const FrontPage = (
    <OtrTitlePage title="frontPage">
      <PublicHomePage />
    </OtrTitlePage>
  );

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path={AppRoutes.PublicRoot} element={Root}>
        <Route index={true} element={FrontPage} />
        <Route path={AppRoutes.PublicHomePage} element={FrontPage} />
        <Route
          path={AppRoutes.ClerkHomePage}
          element={
            <OtrTitlePage title="clerkHomepage">
              <ClerkHomePage />
            </OtrTitlePage>
          }
        />
        <Route
          path={AppRoutes.MeetingDatesPage}
          element={
            <OtrTitlePage title="clerkHomepage">
              <MeetingDatesPage />
            </OtrTitlePage>
          }
        />
        <Route
          path={AppRoutes.ClerkInterpreterOverviewPage}
          element={
            <OtrTitlePage title="clerkHomepage">
              <ClerkInterpreterOverviewPage />
            </OtrTitlePage>
          }
        />
        <Route
          path={AppRoutes.ClerkPersonSearchPage}
          element={
            <OtrTitlePage title="clerkHomepage">
              <ClerkPersonSearchPage />
            </OtrTitlePage>
          }
        />
        <Route
          path={AppRoutes.ClerkNewInterpreterPage}
          element={
            <OtrTitlePage title="clerkHomepage">
              <ClerkNewInterpreterPage />
            </OtrTitlePage>
          }
        />
        <Route
          path={AppRoutes.AccessibilityStatementPage}
          element={
            <OtrTitlePage title="accessibilityStatement">
              <AccessibilityStatementPage />
            </OtrTitlePage>
          }
        />
        <Route
          path={AppRoutes.PrivacyPolicyPage}
          element={
            <OtrTitlePage title="privacyPolicy">
              <PrivacyPolicyPage />
            </OtrTitlePage>
          }
        />
        <Route
          path={AppRoutes.NotFoundPage}
          element={
            <OtrTitlePage title="notFound">
              <NotFoundPage />
            </OtrTitlePage>
          }
        />
      </Route>,
    ),
  );

  return <RouterProvider router={router} />;
};
