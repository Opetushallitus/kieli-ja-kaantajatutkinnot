import { FC } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Notifier } from 'shared/components';
import { TitlePage } from 'shared/utils';

import { Footer } from 'components/layouts/Footer';
import { Header } from 'components/layouts/Header';
import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { useAPIErrorToast } from 'hooks/useAPIErrorToast';
import { ClerkEnrollmentOverviewPage } from 'pages/ClerkEnrollmentOverviewPage';
import { ClerkExamEventCreatePage } from 'pages/ClerkExamEventCreatePage';
import { ClerkExamEventOverviewPage } from 'pages/ClerkExamEventOverviewPage';
import { ClerkHomePage } from 'pages/ClerkHomePage';
import { PublicAuthPage } from 'pages/PublicAuthPage';
import { PublicEnrollmentPage } from 'pages/PublicEnrollmentPage';
import { PublicHomePage } from 'pages/PublicHomePage';

export const AppRouter: FC = () => {
  const translateCommon = useCommonTranslation();
  const appTitle = translateCommon('appTitle');

  useAPIErrorToast();

  const createTitle = (title: string) =>
    translateCommon('pageTitle.' + title) + ' - ' + appTitle;

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
                element={
                  <TitlePage title={createTitle('frontPage')}>
                    <PublicHomePage />
                  </TitlePage>
                }
              />
              <Route path={AppRoutes.PublicEnrollment}>
                <Route
                  index
                  element={
                    <TitlePage title={createTitle('enrollment')}>
                      <PublicEnrollmentPage />
                    </TitlePage>
                  }
                />
                <Route
                  path={AppRoutes.PublicAuth}
                  element={
                    <TitlePage title={createTitle('authenticate')}>
                      <PublicAuthPage />
                    </TitlePage>
                  }
                />
                <Route
                  path={AppRoutes.PublicEnrollmentContactDetails}
                  element={
                    <TitlePage title={createTitle('enrollment')}>
                      <PublicEnrollmentPage
                        step={PublicEnrollmentFormStep.FillContactDetails}
                      />
                    </TitlePage>
                  }
                />
                <Route
                  path={AppRoutes.PublicEnrollmentSelectExam}
                  element={
                    <TitlePage title={createTitle('enrollment')}>
                      <PublicEnrollmentPage
                        step={PublicEnrollmentFormStep.SelectExam}
                      />
                    </TitlePage>
                  }
                />
                <Route
                  path={AppRoutes.PublicEnrollmentSuccess}
                  element={
                    <TitlePage title={createTitle('enrollment')}>
                      <PublicEnrollmentPage
                        step={PublicEnrollmentFormStep.PaymentSuccess}
                      />
                    </TitlePage>
                  }
                />
              </Route>
              <Route
                path={AppRoutes.ClerkHomePage}
                element={
                  <TitlePage title={createTitle('clerkHomepage')}>
                    <ClerkHomePage />
                  </TitlePage>
                }
              />
              <Route
                path={AppRoutes.ClerkExamEventOverviewPage}
                element={
                  <TitlePage title={createTitle('clerkExamOverview')}>
                    <ClerkExamEventOverviewPage />
                  </TitlePage>
                }
              />
              <Route
                path={AppRoutes.ClerkExamEventCreatePage}
                element={
                  <TitlePage title={createTitle('clerkExamEventCreate')}>
                    <ClerkExamEventCreatePage />
                  </TitlePage>
                }
              />
              <Route
                path={AppRoutes.ClerkEnrollmentOverviewPage}
                element={
                  <TitlePage title={createTitle('clerkEnrollmentOverview')}>
                    <ClerkEnrollmentOverviewPage />
                  </TitlePage>
                }
              />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};
