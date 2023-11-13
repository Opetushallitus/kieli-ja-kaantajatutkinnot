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
const ClerkHomePage = lazy(() => import('pages/clerk/ClerkHomePage'));
const ClerkNewTranslatorPage = lazy(
  () => import('pages/clerk/ClerkNewTranslatorPage')
);
const ClerkPersonSearchPage = lazy(
  () => import('pages/clerk/ClerkPersonSearchPage')
);
const ClerkSendEmailPage = lazy(() => import('pages/clerk/ClerkSendEmailPage'));
const ClerkTranslatorOverviewPage = lazy(
  () => import('pages/clerk/ClerkTranslatorOverviewPage')
);
const ExaminationDatesPage = lazy(() => import('pages/ExaminationDatesPage'));
const MeetingDatesPage = lazy(() => import('pages/MeetingDatesPage'));
const NotFoundPage = lazy(() => import('pages/NotFoundPage'));
const PrivacyPolicyPage = lazy(() => import('pages/PrivacyPolicyPage'));
const PublicHomePage = lazy(() => import('pages/PublicHomePage'));
const StatisticsPage = lazy(() => import('pages/StatisticsPage'));

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
            <Suspense fallback={<h2>{translateCommon('loadingContent')}</h2>}>
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
                  path={AppRoutes.ExaminationDatesPage}
                  element={<ExaminationDatesPage />}
                />
                <Route
                  path={AppRoutes.MeetingDatesPage}
                  element={<MeetingDatesPage />}
                />
                <Route
                  path={AppRoutes.StatisticsPage}
                  element={<StatisticsPage />}
                />
                <Route
                  path={AppRoutes.ClerkSendEmailPage}
                  element={<ClerkSendEmailPage />}
                />
                <Route
                  path={AppRoutes.ClerkTranslatorOverviewPage}
                  element={<ClerkTranslatorOverviewPage />}
                />
                <Route
                  path={AppRoutes.ClerkPersonSearchPage}
                  element={<ClerkPersonSearchPage />}
                />
                <Route
                  path={AppRoutes.ClerkNewTranslatorPage}
                  element={<ClerkNewTranslatorPage />}
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
