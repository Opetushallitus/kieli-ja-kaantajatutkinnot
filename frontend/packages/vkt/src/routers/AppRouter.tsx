import { FC } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router-dom';
import { PersistGate } from 'reduxjs-toolkit-persist/integration/react';
import {
  Notifier,
  NotifierContextProvider,
  ScrollToTop,
} from 'shared/components';
import { TitlePage } from 'shared/utils';

import { Footer } from 'components/layouts/Footer';
import { Header } from 'components/layouts/Header';
import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { useAPIErrorToast } from 'hooks/useAPIErrorToast';
import { AccessibilityStatementPage } from 'pages/AccessibilityStatementPage';
import { ClerkEnrollmentOverviewPage } from 'pages/ClerkEnrollmentOverviewPage';
import { ClerkExamEventCreatePage } from 'pages/ClerkExamEventCreatePage';
import { ClerkExamEventOverviewPage } from 'pages/ClerkExamEventOverviewPage';
import { ClerkHomePage } from 'pages/ClerkHomePage';
import { LogoutSuccess } from 'pages/LogoutSuccess';
import { NotFoundPage } from 'pages/NotFoundPage';
import { PrivacyPolicyPage } from 'pages/PrivacyPolicyPage';
import { PublicEnrollmentPage } from 'pages/PublicEnrollmentPage';
import { PublicHomePage } from 'pages/PublicHomePage';
import { persistor } from 'redux/store';

export const AppRouter: FC = () => {
  const translateCommon = useCommonTranslation();
  const appTitle = translateCommon('appTitle');

  const createTitle = (title: string) =>
    translateCommon('pageTitle.' + title) + ' - ' + appTitle;

  const ErrorToast = () => {
    useAPIErrorToast();

    return <></>;
  };

  const Root = (
    <div className="app">
      <NotifierContextProvider>
        <Header />
        <ErrorToast />
        <Notifier />
        <ScrollToTop />
        <PersistGate persistor={persistor} />
        <main className="content" id="main-content">
          <div className="content__container">
            <Outlet />
          </div>
        </main>
        <Footer />
      </NotifierContextProvider>
    </div>
  );

  const FrontPage = (
    <TitlePage title={createTitle('frontPage')}>
      <PublicHomePage />
    </TitlePage>
  );

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path={AppRoutes.PublicRoot} element={Root}>
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
      </Route>,
    ),
  );

  return <RouterProvider router={router} />;
};
