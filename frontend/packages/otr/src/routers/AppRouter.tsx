import { FC, lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Notifier } from 'shared/components';

import { Footer } from 'components/layouts/Footer';
import { Header } from 'components/layouts/Header';
import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import { useAPIErrorToast } from 'hooks/useAPIErrorToast';
const AccessibilityStatementPage = lazy(
  () => import('pages/AccessibilityStatementPage')
);
const ClerkHomePage = lazy(() => import('pages/ClerkHomePage'));
const ClerkInterpreterOverviewPage = lazy(
  () => import('pages/ClerkInterpreterOverviewPage')
);
const ClerkNewInterpreterPage = lazy(
  () => import('pages/ClerkNewInterpreterPage')
);
const ClerkPersonSearchPage = lazy(() => import('pages/ClerkPersonSearchPage'));
const MeetingDatesPage = lazy(() => import('pages/MeetingDatesPage'));
const NotFoundPage = lazy(() => import('pages/NotFoundPage'));
const PrivacyPolicyPage = lazy(() => import('pages/PrivacyPolicyPage'));
const PublicHomePage = lazy(() => import('pages/PublicHomePage'));

export const AppRouter: FC = () => {
  const translateCommon = useCommonTranslation();

  useEffect(() => {
    document.title = translateCommon('appTitle');
  }, [translateCommon]);
  useAPIErrorToast();

  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <Notifier />
        <main className="content" id="main-content">
          <div className="content__container">
            <Suspense fallback={<div></div>}>
              <Routes>
                <Route
                  path={AppRoutes.PublicHomePage}
                  element={<PublicHomePage />}
                />
                <Route
                  path={AppRoutes.ClerkHomePage}
                  element={<ClerkHomePage />}
                />
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
                <Route
                  path={AppRoutes.NotFoundPage}
                  element={<NotFoundPage />}
                />
              </Routes>
            </Suspense>
          </div>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};
