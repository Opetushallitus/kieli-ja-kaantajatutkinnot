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
import { useWindowProperties } from 'shared/hooks';
import { TitlePage, TitlePageProps } from 'shared/utils';

import { Footer } from 'components/layouts/Footer';
import { Header } from 'components/layouts/Header';
import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import {
  PublicEnrollmentAppointmentFormStep,
  PublicEnrollmentContactFormStep,
  PublicEnrollmentFormStep,
} from 'enums/publicEnrollment';
import { useAPIErrorToast } from 'hooks/useAPIErrorToast';
import { AccessibilityStatementPage } from 'pages/AccessibilityStatementPage';
import { ClerkEnrollmentAppointmentOverviewPage } from 'pages/ClerkEnrollmentAppointmentOverviewPage';
import { ClerkEnrollmentContactRequestPage } from 'pages/ClerkEnrollmentContactRequestPage';
import { ClerkEnrollmentOverviewPage } from 'pages/ClerkEnrollmentOverviewPage';
import { ClerkExamEventCreatePage } from 'pages/ClerkExamEventCreatePage';
import { ClerkExamEventOverviewPage } from 'pages/ClerkExamEventOverviewPage';
import { ClerkExcellentLevelPage } from 'pages/ClerkExcellentLevelPage';
import { ClerkGoodAndSatisfactoryLevelPage } from 'pages/ClerkGoodAndSatisfactoryLevelPage';
import { ClerkPaymentReportPage } from 'pages/ClerkPaymentReportPage';
import { ExaminerDetailsPage } from 'pages/examiner/ExaminerDetailsPage';
import { ExaminerExamEventOverviewPage } from 'pages/examiner/ExaminerExamEventOverviewPage';
import { ExaminerExamEventUpsertPage } from 'pages/examiner/ExaminerExamEventUpsertPage';
import { ExaminerHomePage } from 'pages/examiner/ExaminerHomePage';
import { ExaminerRedirectPage } from 'pages/examiner/ExaminerRedirectPage';
import { ExaminerRootPage } from 'pages/examiner/ExaminerRootPage';
import { PublicEnrollmentPage } from 'pages/excellentLevel/PublicEnrollmentPage';
import { PublicExcellentLevelLandingPage } from 'pages/excellentLevel/PublicExcellentLevelLandingPage';
import { PublicGoodAndSatisfactoryLevelLandingPage } from 'pages/goodAndSatisfactoryLevel/PublicGoodAndSatisfactoryLevelLandingPage';
import { LogoutSuccess } from 'pages/LogoutSuccess';
import { NotFoundPage } from 'pages/NotFoundPage';
import { PublicEnrollmentAppointmentPage } from 'pages/PublicEnrollmentAppointmentPage';
import { PublicEnrollmentContactPage } from 'pages/PublicEnrollmentContactPage';
import { PublicHomePage } from 'pages/PublicHomePage';
import { loadFeatureFlags } from 'redux/reducers/featureFlags';
import { featureFlagsSelector } from 'redux/selectors/featureFlags';
import { mobileNavigationMenuSelector } from 'redux/selectors/mobileNavigationMenu';
import { persistor } from 'redux/store';

// Trigger CI
const VktTitlePage = ({ title, children }: TitlePageProps) => {
  const { open } = useAppSelector(mobileNavigationMenuSelector);
  const { isPhone } = useWindowProperties();
  const isMobileMenuOpen = isPhone && open;

  return (
    <TitlePage
      title={title}
      className={
        isMobileMenuOpen ? 'mobile-navigation-menu__active' : 'title-page'
      }
    >
      {children}
    </TitlePage>
  );
};

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
    <VktTitlePage title={createTitle('frontPage')}>
      <PublicHomePage />
    </VktTitlePage>
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
            <VktTitlePage title={createTitle('excellentLevelLanding')}>
              <PublicExcellentLevelLandingPage />
            </VktTitlePage>
          }
        />
        <Route
          path={AppRoutes.PublicGoodAndSatisfactoryLevelLanding}
          element={
            <VktTitlePage
              title={createTitle('goodAndSatisfactoryLevelLanding')}
            >
              <PublicGoodAndSatisfactoryLevelLandingPage />
            </VktTitlePage>
          }
        />
        <Route path={AppRoutes.PublicEnrollment}>
          <Route
            path={AppRoutes.PublicAuth}
            element={
              <VktTitlePage title={createTitle('authenticate')}>
                <PublicEnrollmentPage
                  activeStep={PublicEnrollmentFormStep.Authenticate}
                />
              </VktTitlePage>
            }
          />
          <Route
            path={AppRoutes.PublicEnrollmentContactDetails}
            element={
              <VktTitlePage title={createTitle('contactDetails')}>
                <PublicEnrollmentPage
                  activeStep={PublicEnrollmentFormStep.FillContactDetails}
                />
              </VktTitlePage>
            }
          />
          <Route
            path={AppRoutes.PublicEnrollmentEducationDetails}
            element={
              <VktTitlePage title={createTitle('educationDetails')}>
                <PublicEnrollmentPage
                  activeStep={PublicEnrollmentFormStep.EducationDetails}
                />
              </VktTitlePage>
            }
          />
          <Route
            path={AppRoutes.PublicEnrollmentSelectExam}
            element={
              <VktTitlePage title={createTitle('selectExam')}>
                <PublicEnrollmentPage
                  activeStep={PublicEnrollmentFormStep.SelectExam}
                />
              </VktTitlePage>
            }
          />
          <Route
            path={AppRoutes.PublicEnrollmentPreview}
            element={
              <VktTitlePage title={createTitle('preview')}>
                <PublicEnrollmentPage
                  activeStep={PublicEnrollmentFormStep.Preview}
                />
              </VktTitlePage>
            }
          />
          <Route
            path={AppRoutes.PublicEnrollmentPaymentFail}
            element={
              <VktTitlePage title={createTitle('paymentFail')}>
                <PublicEnrollmentPage
                  activeStep={PublicEnrollmentFormStep.Payment}
                />
              </VktTitlePage>
            }
          />
          <Route
            path={AppRoutes.PublicEnrollmentPaymentSuccess}
            element={
              <VktTitlePage title={createTitle('paymentSuccess')}>
                <PublicEnrollmentPage
                  activeStep={PublicEnrollmentFormStep.PaymentSuccess}
                />
              </VktTitlePage>
            }
          />
          <Route
            path={AppRoutes.PublicEnrollmentDone}
            element={
              <VktTitlePage title={createTitle('done')}>
                <PublicEnrollmentPage
                  activeStep={PublicEnrollmentFormStep.Done}
                />
              </VktTitlePage>
            }
          />
          <Route
            path={AppRoutes.PublicEnrollmentDoneQueued}
            element={
              <VktTitlePage title={createTitle('done')}>
                <PublicEnrollmentPage
                  activeStep={PublicEnrollmentFormStep.DoneQueued}
                />
              </VktTitlePage>
            }
          />
        </Route>
        <Route path={AppRoutes.PublicEnrollmentAppointment}>
          <Route
            path={AppRoutes.PublicAuthAppointment}
            element={
              <VktTitlePage title={createTitle('authenticate')}>
                <PublicEnrollmentAppointmentPage
                  activeStep={PublicEnrollmentAppointmentFormStep.Authenticate}
                />
              </VktTitlePage>
            }
          />
          <Route
            path={AppRoutes.PublicEnrollmentAppointmentContactDetails}
            element={
              <VktTitlePage title={createTitle('contactDetails')}>
                <PublicEnrollmentAppointmentPage
                  activeStep={
                    PublicEnrollmentAppointmentFormStep.FillContactDetails
                  }
                />
              </VktTitlePage>
            }
          />
          <Route
            path={AppRoutes.PublicEnrollmentAppointmentPreview}
            element={
              <VktTitlePage title={createTitle('preview')}>
                <PublicEnrollmentAppointmentPage
                  activeStep={PublicEnrollmentAppointmentFormStep.Preview}
                />
              </VktTitlePage>
            }
          />
          <Route
            path={AppRoutes.PublicEnrollmentAppointmentPaymentFail}
            element={
              <VktTitlePage title={createTitle('paymentFail')}>
                <PublicEnrollmentAppointmentPage
                  activeStep={PublicEnrollmentAppointmentFormStep.PaymentFail}
                />
              </VktTitlePage>
            }
          />
          <Route
            path={AppRoutes.PublicEnrollmentAppointmentPaymentSuccess}
            element={
              <VktTitlePage title={createTitle('paymentSuccess')}>
                <PublicEnrollmentAppointmentPage
                  activeStep={
                    PublicEnrollmentAppointmentFormStep.PaymentSuccess
                  }
                />
              </VktTitlePage>
            }
          />
        </Route>
        <Route
          path={AppRoutes.PublicEnrollmentAppointmentPaymentNonAuthSuccess}
          element={
            <VktTitlePage title={createTitle('paymentSuccess')}>
              <PublicEnrollmentAppointmentPage
                activeStep={PublicEnrollmentAppointmentFormStep.PaymentSuccess}
              />
            </VktTitlePage>
          }
        />
        <Route path={AppRoutes.PublicEnrollmentContact}>
          <Route
            path={AppRoutes.PublicEnrollmentContactContactDetails}
            element={
              <VktTitlePage title={createTitle('authenticate')}>
                <PublicEnrollmentContactPage
                  activeStep={
                    PublicEnrollmentContactFormStep.FillContactDetails
                  }
                />
              </VktTitlePage>
            }
          />
          <Route
            path={AppRoutes.PublicEnrollmentContactSelectExam}
            element={
              <VktTitlePage title={createTitle('authenticate')}>
                <PublicEnrollmentContactPage
                  activeStep={PublicEnrollmentContactFormStep.SelectExam}
                />
              </VktTitlePage>
            }
          />
          <Route
            path={AppRoutes.PublicEnrollmentContactDone}
            element={
              <VktTitlePage title={createTitle('authenticate')}>
                <PublicEnrollmentContactPage
                  activeStep={PublicEnrollmentContactFormStep.Done}
                />
              </VktTitlePage>
            }
          />
        </Route>
        <Route
          path={AppRoutes.AccessibilityStatementPage}
          element={
            <VktTitlePage title={createTitle('accessibilityStatement')}>
              <AccessibilityStatementPage />
            </VktTitlePage>
          }
        />
        <Route
          path={AppRoutes.ClerkRoot}
          element={
            <VktTitlePage title={createTitle('clerkExcellentLevel')}>
              <ClerkExcellentLevelPage />
            </VktTitlePage>
          }
        />
        <Route
          path={AppRoutes.ClerkPaymentReportPage}
          element={
            <VktTitlePage title={createTitle('clerkExcellentLevel')}>
              <ClerkPaymentReportPage />
            </VktTitlePage>
          }
        />
        <Route
          path={AppRoutes.ClerkExcellentLevelPage}
          element={
            <VktTitlePage title={createTitle('clerkExcellentLevel')}>
              <ClerkExcellentLevelPage />
            </VktTitlePage>
          }
        />
        <Route
          path={AppRoutes.ClerkExamEventOverviewPage}
          element={
            <VktTitlePage title={createTitle('clerkExamOverview')}>
              <ClerkExamEventOverviewPage />
            </VktTitlePage>
          }
        />
        <Route
          path={AppRoutes.ClerkExamEventCreatePage}
          element={
            <VktTitlePage title={createTitle('clerkExamEventCreate')}>
              <ClerkExamEventCreatePage />
            </VktTitlePage>
          }
        />
        <Route
          path={AppRoutes.ClerkEnrollmentOverviewPage}
          element={
            <VktTitlePage title={createTitle('clerkEnrollmentOverview')}>
              <ClerkEnrollmentOverviewPage />
            </VktTitlePage>
          }
        />
        <Route
          path={AppRoutes.ClerkGoodAndSatisfactoryLevelPage}
          element={
            <VktTitlePage title={createTitle('clerkGoodAndSatisfactoryLevel')}>
              <ClerkGoodAndSatisfactoryLevelPage />
            </VktTitlePage>
          }
        />
        <Route path={AppRoutes.ExaminerRoot}>
          <Route
            index={true}
            element={
              <VktTitlePage title={createTitle('examinerHomePage')}>
                <ExaminerRedirectPage />
              </VktTitlePage>
            }
          />
          <Route
            path={AppRoutes.ExaminerHomePage}
            element={
              <VktTitlePage title={createTitle('examinerHomePage')}>
                <ExaminerRootPage>
                  <ExaminerHomePage />
                </ExaminerRootPage>
              </VktTitlePage>
            }
          />
          <Route
            path={AppRoutes.ExaminerDetailsPage}
            element={
              <VktTitlePage title={createTitle('examinerDetails')}>
                <ExaminerRootPage>
                  <ExaminerDetailsPage />
                </ExaminerRootPage>
              </VktTitlePage>
            }
          />
          <Route
            path={AppRoutes.ExaminerEnrollmentContactRequestPage}
            element={
              <VktTitlePage title={createTitle('clerkExamEventCreate')}>
                <ClerkEnrollmentContactRequestPage />
              </VktTitlePage>
            }
          />
          <Route
            path={AppRoutes.ExaminerEnrollmentAppointmentPage}
            element={
              <VktTitlePage title={createTitle('clerkExamEventCreate')}>
                <ClerkEnrollmentAppointmentOverviewPage editMode={false} />
              </VktTitlePage>
            }
          />
          <Route
            path={AppRoutes.ExaminerEnrollmentAppointmentPageEdit}
            element={
              <VktTitlePage title={createTitle('clerkExamEventCreate')}>
                <ClerkEnrollmentAppointmentOverviewPage editMode={true} />
              </VktTitlePage>
            }
          />
          <Route
            path={AppRoutes.ExaminerExamEventPage}
            element={
              <VktTitlePage title={createTitle('clerkExamOverview')}>
                <ExaminerExamEventOverviewPage />
              </VktTitlePage>
            }
          />
          <Route
            path={AppRoutes.ExaminerExamEventCreatePage}
            element={
              <VktTitlePage title={createTitle('examinerDetails')}>
                <ExaminerRootPage>
                  <ExaminerExamEventUpsertPage isUpdatePage={false} />
                </ExaminerRootPage>
              </VktTitlePage>
            }
          />
          <Route
            path={AppRoutes.ExaminerExamEventUpdatePage}
            element={
              <VktTitlePage title={createTitle('examinerDetails')}>
                <ExaminerRootPage>
                  <ExaminerExamEventUpsertPage isUpdatePage={true} />
                </ExaminerRootPage>
              </VktTitlePage>
            }
          />
        </Route>
        <Route
          path={AppRoutes.LogoutSuccess}
          element={
            <VktTitlePage title={createTitle('logoutSuccess')}>
              <LogoutSuccess />
            </VktTitlePage>
          }
        />
        <Route
          path={AppRoutes.NotFoundPage}
          element={
            <VktTitlePage title={createTitle('notFound')}>
              <NotFoundPage />
            </VktTitlePage>
          }
        />
      </Route>,
    ),
  );

  return <RouterProvider router={router} />;
};
