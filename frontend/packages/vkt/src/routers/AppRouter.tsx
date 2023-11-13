import { FC, lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { PersistGate } from 'reduxjs-toolkit-persist/integration/react';
import { Notifier, ScrollToTop } from 'shared/components';
import { TitlePage } from 'shared/utils';

import { Footer } from 'components/layouts/Footer';
import { Header } from 'components/layouts/Header';
import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { useAPIErrorToast } from 'hooks/useAPIErrorToast';
const AccessibilityStatementPage = lazy(
  () => import('pages/AccessibilityStatementPage')
);
const ClerkEnrollmentOverviewPage = lazy(
  () => import('pages/ClerkEnrollmentOverviewPage')
);
const ClerkExamEventCreatePage = lazy(
  () => import('pages/ClerkExamEventCreatePage')
);
const ClerkExamEventOverviewPage = lazy(
  () => import('pages/ClerkExamEventOverviewPage')
);
const ClerkHomePage = lazy(() => import('pages/ClerkHomePage'));
const LogoutSuccess = lazy(() => import('pages/LogoutSuccess'));
const NotFoundPage = lazy(() => import('pages/NotFoundPage'));
const PrivacyPolicyPage = lazy(() => import('pages/PrivacyPolicyPage'));
const PublicEnrollmentPage = lazy(() => import('pages/PublicEnrollmentPage'));
const PublicHomePage = lazy(() => import('pages/PublicHomePage'));
import { persistor } from 'redux/store';

export const AppRouter: FC = () => {
  const translateCommon = useCommonTranslation();
  const appTitle = translateCommon('appTitle');

  useAPIErrorToast();

  const createTitle = (title: string) =>
    translateCommon('pageTitle.' + title) + ' - ' + appTitle;

  const FrontPage = (
    <TitlePage title={createTitle('frontPage')}>
      <PublicHomePage />
    </TitlePage>
  );

  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <Notifier />
        <ScrollToTop />
        <PersistGate persistor={persistor} />
        <main className="content" id="main-content">
          <div className="content__container">
            <Suspense fallback={<h2>{translateCommon('loadingContent')}</h2>}>
              <Routes>
                <Route path={AppRoutes.PublicRoot} element={FrontPage} />
                <Route path={AppRoutes.PublicHomePage} element={FrontPage} />
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
                          activeStep={
                            PublicEnrollmentFormStep.FillContactDetails
                          }
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
                    path={AppRoutes.PublicEnrollmentPaymentFail}
                    element={
                      <TitlePage title={createTitle('paymentFail')}>
                        <PublicEnrollmentPage
                          activeStep={PublicEnrollmentFormStep.Payment}
                        />
                      </TitlePage>
                    }
                  />
                  <Route
                    path={AppRoutes.PublicEnrollmentPaymentSuccess}
                    element={
                      <TitlePage title={createTitle('paymentSuccess')}>
                        <PublicEnrollmentPage
                          activeStep={PublicEnrollmentFormStep.PaymentSuccess}
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
                </Route>
                <Route
                  path={AppRoutes.AccessibilityStatementPage}
                  element={
                    <TitlePage title={createTitle('accessibilityStatement')}>
                      <AccessibilityStatementPage />
                    </TitlePage>
                  }
                />
                <Route
                  path={AppRoutes.PrivacyPolicyPage}
                  element={
                    <TitlePage title={createTitle('privacyPolicy')}>
                      <PrivacyPolicyPage />
                    </TitlePage>
                  }
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
                <Route
                  path={AppRoutes.LogoutSuccess}
                  element={
                    <TitlePage title={createTitle('logoutSuccess')}>
                      <LogoutSuccess />
                    </TitlePage>
                  }
                />
                <Route
                  path={AppRoutes.NotFoundPage}
                  element={
                    <TitlePage title={createTitle('notFound')}>
                      <NotFoundPage />
                    </TitlePage>
                  }
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
