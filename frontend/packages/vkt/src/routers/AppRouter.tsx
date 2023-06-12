import { FC } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Notifier, ScrollToTop } from 'shared/components';
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
import { PrivacyPolicyPage } from 'pages/PrivacyPolicyPage';
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
        <ScrollToTop />
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
                  path={AppRoutes.PublicAuth}
                  element={
                    <TitlePage title={createTitle('authenticate')}>
                      <PublicEnrollmentPage
                        activeStep={PublicEnrollmentFormStep.Authenticate}
                      />
                    </TitlePage>
                  }
                />
                <Route
                  path={AppRoutes.PublicEnrollmentContactDetails}
                  element={
                    <TitlePage title={createTitle('contactDetails')}>
                      <PublicEnrollmentPage
                        activeStep={PublicEnrollmentFormStep.FillContactDetails}
                      />
                    </TitlePage>
                  }
                />
                <Route
                  path={AppRoutes.PublicEnrollmentSelectExam}
                  element={
                    <TitlePage title={createTitle('selectExam')}>
                      <PublicEnrollmentPage
                        activeStep={PublicEnrollmentFormStep.SelectExam}
                      />
                    </TitlePage>
                  }
                />
                <Route
                  path={AppRoutes.PublicEnrollmentPreview}
                  element={
                    <TitlePage title={createTitle('preview')}>
                      <PublicEnrollmentPage
                        activeStep={PublicEnrollmentFormStep.Preview}
                      />
                    </TitlePage>
                  }
                />
                <Route
                  path={AppRoutes.PublicEnrollmentDone}
                  element={
                    <TitlePage title={createTitle('done')}>
                      <PublicEnrollmentPage
                        activeStep={PublicEnrollmentFormStep.Done}
                      />
                    </TitlePage>
                  }
                />
                <Route
                  path={AppRoutes.PublicEnrollmentSuccess}
                  element={
                    <TitlePage title={createTitle('success')}>
                      <PublicEnrollmentPage
                        activeStep={PublicEnrollmentFormStep.PaymentSuccess}
                      />
                    </TitlePage>
                  }
                />
                <Route
                  path={AppRoutes.PublicEnrollmentFail}
                  element={
                    <TitlePage title={createTitle('fail')}>
                      <PublicEnrollmentPage
                        activeStep={PublicEnrollmentFormStep.PaymentFail}
                      />
                    </TitlePage>
                  }
                />
              </Route>
              <Route
                path={AppRoutes.PrivacyPolicyPage}
                element={<PrivacyPolicyPage />}
              />
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
