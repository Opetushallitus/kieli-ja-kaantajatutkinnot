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

  useEffect(() => {
    document.title = translateCommon('appTitle');
  }, [translateCommon]);

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path={AppRoutes.PublicRoot} element={Root}>
        <Route path={AppRoutes.PublicHomePage} element={<PublicHomePage />} />
        <Route path={AppRoutes.ClerkHomePage} element={<ClerkHomePage />} />
        <Route
          path={AppRoutes.MeetingDatesPage}
          element={<MeetingDatesPage />}
        />
        <Route
          path={AppRoutes.ClerkInterpreterOverviewPage}
          element={<ClerkInterpreterOverviewPage />}
        />
        <Route
          path={AppRoutes.ClerkPersonSearchPage}
          element={<ClerkPersonSearchPage />}
        />
        <Route
          path={AppRoutes.ClerkNewInterpreterPage}
          element={<ClerkNewInterpreterPage />}
        />
        <Route
          path={AppRoutes.AccessibilityStatementPage}
          element={<AccessibilityStatementPage />}
        />
        <Route
          path={AppRoutes.PrivacyPolicyPage}
          element={<PrivacyPolicyPage />}
        />
        <Route path={AppRoutes.NotFoundPage} element={<NotFoundPage />} />
      </Route>,
    ),
  );

  return <RouterProvider router={router} />;
};
