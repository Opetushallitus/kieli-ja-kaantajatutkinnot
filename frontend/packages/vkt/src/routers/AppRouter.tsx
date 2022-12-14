import { FC, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Notifier } from 'shared/components';

import { Footer } from 'components/layouts/Footer';
import { Header } from 'components/layouts/Header';
import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import { useAPIErrorToast } from 'hooks/useAPIErrorToast';
import { ClerkEnrollmentOverviewPage } from 'pages/ClerkEnrollmentOverviewPage';
import { ClerkExamCreateEventPage } from 'pages/ClerkExamCreateEventPage';
import { ClerkExamEventOverviewPage } from 'pages/ClerkExamEventOverviewPage';
import { ClerkHomePage } from 'pages/ClerkHomePage';
import { PublicHomePage } from 'pages/PublicHomePage';

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
                path={AppRoutes.ClerkExamEventOverviewPage}
                element={<ClerkExamEventOverviewPage />}
              />
              <Route
                path={AppRoutes.ClerkExamCreateEventPage}
                element={<ClerkExamCreateEventPage />}
              />
              <Route
                path={AppRoutes.ClerkEnrollmentOverviewPage}
                element={<ClerkEnrollmentOverviewPage />}
              />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};
