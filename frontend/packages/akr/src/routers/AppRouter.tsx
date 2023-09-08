import { FC, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Notifier } from 'shared/components';

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
              <Route path={AppRoutes.NotFoundPage} element={<NotFoundPage />} />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};
