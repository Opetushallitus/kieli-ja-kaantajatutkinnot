import { FC } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Notifier } from 'shared/components';

import { Footer } from 'components/layouts/Footer';
import { Header } from 'components/layouts/Header';
import { AppRoutes } from 'enums/app';
import { ClerkHomePage } from 'pages/ClerkHomePage';
import { ClerkInterpreterOverviewPage } from 'pages/ClerkInterpreterOverviewPage';
import { ClerkPersonSearchPage } from 'pages/ClerkPersonSearchPage';
import { MeetingDatesPage } from 'pages/MeetingDatesPage';
import { PublicHomePage } from 'pages/PublicHomePage';

export const AppRouter: FC = () => {
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
                path={AppRoutes.ClerkInterpreterOverviewPage}
                element={<ClerkInterpreterOverviewPage />}
              />
              <Route
                path={AppRoutes.ClerkPersonSearchPage}
                element={<ClerkPersonSearchPage />}
              />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};
