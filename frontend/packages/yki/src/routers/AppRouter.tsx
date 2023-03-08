import { FC, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Notifier } from 'shared/components';

import { Footer } from 'components/layouts/Footer';
import { Header } from 'components/layouts/Header';
import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import { useAPIErrorToast } from 'hooks/useAPIErrorToast';
import { ExamDetailsPage } from 'pages/ExamDetailsPage';
import { IdentifyPage } from 'pages/IdentifyPage';
import { RegistrationPage } from 'pages/RegistrationPage';

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
                path={AppRoutes.Registration}
                element={<RegistrationPage />}
              />
              <Route path={AppRoutes.ExamSession} element={<IdentifyPage />} />
              <Route
                path={AppRoutes.ExamSessionRegistration}
                element={<ExamDetailsPage />}
              />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};