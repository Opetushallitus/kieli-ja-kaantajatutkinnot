import { FC, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Footer } from 'components/layouts/Footer';
import { Header } from 'components/layouts/Header';
import { Notifier } from 'components/notification/Notifier';
import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import { AccessibilityStatementPage } from 'pages/AccessibilityStatementPage';
import { ClerkHomePage } from 'pages/clerk/ClerkHomePage';
import { ClerkNewTranslatorPage } from 'pages/clerk/ClerkNewTranslatorPage';
import { ClerkSendEmailPage } from 'pages/clerk/ClerkSendEmailPage';
import { ClerkTranslatorOverviewPage } from 'pages/clerk/ClerkTranslatorOverviewPage';
import { MeetingDatesPage } from 'pages/MeetingDatesPage';
import { NotFoundPage } from 'pages/NotFoundPage';
import { PublicHomePage } from 'pages/PublicHomePage';

export const AppRouter: FC = () => {
  const translateCommon = useCommonTranslation();

  useEffect(() => {
    document.title = translateCommon('appTitle');
  }, [translateCommon]);

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
                path={AppRoutes.MeetingDatesPage}
                element={<MeetingDatesPage />}
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
                path={AppRoutes.ClerkNewTranslatorPage}
                element={<ClerkNewTranslatorPage />}
              />
              <Route
                path={AppRoutes.AccessibilityStatementPage}
                element={<AccessibilityStatementPage />}
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
