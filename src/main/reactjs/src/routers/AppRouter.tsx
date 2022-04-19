import { FC } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Footer from 'components/layouts/Footer';
import Header from 'components/layouts/Header';
import { Notifier } from 'components/notification/Notifier';
import { PublicHomePage } from 'pages/PublicHomePage';
import { NotFoundPage } from 'pages/NotFoundPage';
import { ClerkHomePage } from 'pages/ClerkHomePage';
import { AppRoutes } from 'enums/app';

export const AppRouter: FC = () => (
  <BrowserRouter>
    <div className="app">
      <Header />
      <Notifier />
      <main className="content">
        <div className="content__container">
          <Routes>
            <Route
              path={AppRoutes.PublicHomePage}
              element={<PublicHomePage />}
            />
            <Route path={AppRoutes.ClerkHomePage} element={<ClerkHomePage />} />
            <Route path={AppRoutes.NotFoundPage} element={<NotFoundPage />} />
          </Routes>
        </div>
      </main>
      <Footer showWave={true} />
    </div>
  </BrowserRouter>
);
