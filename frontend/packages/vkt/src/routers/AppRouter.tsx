import { FC, useEffect } from 'react';
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
import { APIResponseStatus } from 'shared/enums';
import { TitlePage } from 'shared/utils';

import { Footer } from 'components/layouts/Footer';
import { Header } from 'components/layouts/Header';
import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import {
  PublicEnrollmentAppointmentFormStep,
  PublicEnrollmentFormStep,
} from 'enums/publicEnrollment';
import { useAPIErrorToast } from 'hooks/useAPIErrorToast';
import { AccessibilityStatementPage } from 'pages/AccessibilityStatementPage';
import { ClerkEnrollmentOverviewPage } from 'pages/ClerkEnrollmentOverviewPage';
import { ClerkExamEventCreatePage } from 'pages/ClerkExamEventCreatePage';
import { ClerkExamEventOverviewPage } from 'pages/ClerkExamEventOverviewPage';
import { ClerkHomePage } from 'pages/ClerkHomePage';
import { PublicEnrollmentPage } from 'pages/excellentLevel/PublicEnrollmentPage';
import { PublicExcellentLevelLandingPage } from 'pages/excellentLevel/PublicExcellentLevelLandingPage';
import { PublicGoodAndSatisfactoryLevelLandingPage } from 'pages/goodAndSatisfactoryLevel/PublicGoodAndSatisfactoryLevelLandingPage';
import { LogoutSuccess } from 'pages/LogoutSuccess';
import { NotFoundPage } from 'pages/NotFoundPage';
import { PublicEnrollmentAppointmentPage } from 'pages/PublicEnrollmentAppointmentPage';
import { PublicEnrollmentPage } from 'pages/PublicEnrollmentPage';
import { PublicHomePage } from 'pages/PublicHomePage';
import { loadFeatureFlags } from 'redux/reducers/featureFlags';
import { featureFlagsSelector } from 'redux/selectors/featureFlags';
import { persistor } from 'redux/store';

export const AppRouter: FC = () => {
  const { status: featureFlagsStatus } = useAppSelector(featureFlagsSelector);
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (featureFlagsStatus === APIResponseStatus.NotStarted) {
      dispatch(loadFeatureFlags());
    }
  }, [dispatch, featureFlagsStatus]);

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
          <div className="content__container rows">
            <div id="mobile-menu-placeholder" className="rows" />
            <Outlet />
          </div>
        </main>
        <Footer />
      </NotifierContextProvider>
    </div>
  );

  // TODO Consider serving different page as front page when feature flag for good and satisfactory levels is enabled?
  const FrontPage = (
    <TitlePage title={createTitle('frontPage')}>
      <PublicHomePage />
    </TitlePage>
  );

  // TODO Enable / disable routes for good and satisfactory level based on feature flag?
  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path={AppRoutes.PublicRoot} element={Root}>
        <Route index={true} element={FrontPage} />
        <Route path={AppRoutes.PublicHomePage} element={FrontPage} />
        <Route
          path={AppRoutes.PublicExcellentLevelLanding}
          element={
            <TitlePage title={createTitle('excellentLevelLanding')}>
              <PublicExcellentLevelLandingPage />
            </TitlePage>
          }
        />
        <Route
          path={AppRoutes.PublicGoodAndSatisfactoryLevelLanding}
          element={
            <TitlePage title={createTitle('goodAndSatisfactoryLevelLanding')}>
              <PublicGoodAndSatisfactoryLevelLandingPage />
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
            path={AppRoutes.PublicEnrollmentEducationDetails}
            element={
              <TitlePage title={createTitle('educationDetails')}>
                <PublicEnrollmentPage
                  activeStep={PublicEnrollmentFormStep.EducationDetails}
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
          <Route
            path={AppRoutes.PublicEnrollmentDoneQueued}
            element={
              <TitlePage title={createTitle('done')}>
                <PublicEnrollmentPage
                  activeStep={PublicEnrollmentFormStep.DoneQueued}
                />
              </TitlePage>
            }
          />
        </Route>
        <Route path={AppRoutes.PublicEnrollmentAppointment}>
          <Route
            path={AppRoutes.PublicAuthAppointment}
            element={
              <TitlePage title={createTitle('authenticate')}>
                <PublicEnrollmentAppointmentPage
                  activeStep={PublicEnrollmentAppointmentFormStep.Authenticate}
                />
              </TitlePage>
            }
          />
          <Route
            path={AppRoutes.PublicEnrollmentAppointmentContactDetails}
            element={
              <TitlePage title={createTitle('contactDetails')}>
                <PublicEnrollmentAppointmentPage
                  activeStep={
                    PublicEnrollmentAppointmentFormStep.FillContactDetails
                  }
                />
              </TitlePage>
            }
          />
          <Route
            path={AppRoutes.PublicEnrollmentAppointmentPreview}
            element={
              <TitlePage title={createTitle('preview')}>
                <PublicEnrollmentAppointmentPage
                  activeStep={PublicEnrollmentAppointmentFormStep.Preview}
                />
              </TitlePage>
            }
          />
          <Route
            path={AppRoutes.PublicEnrollmentAppointmentPaymentFail}
            element={
              <TitlePage title={createTitle('paymentFail')}>
                <PublicEnrollmentAppointmentPage
                  activeStep={PublicEnrollmentAppointmentFormStep.PaymentFail}
                />
              </TitlePage>
            }
          />
          <Route
            path={AppRoutes.PublicEnrollmentAppointmentPaymentSuccess}
            element={
              <TitlePage title={createTitle('paymentSuccess')}>
                <PublicEnrollmentAppointmentPage
                  activeStep={
                    PublicEnrollmentAppointmentFormStep.PaymentSuccess
                  }
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
