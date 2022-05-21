import { FC } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { Footer } from 'components/layouts/Footer';
import { Header } from 'components/layouts/Header';
// import { Notifier } from 'components/notification/Notifier';
import { AppRoutes } from 'enums/app';
import { PublicHomePage } from 'pages/PublicHomePage';

export const AppRouter: FC = () => {
  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        {/* <Notifier /> */}
        <main className="content" id="main-content">
          <div className="content__container">
            <Routes>
              <Route
                path={AppRoutes.PublicHomePage}
                element={<PublicHomePage />}
              />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};
