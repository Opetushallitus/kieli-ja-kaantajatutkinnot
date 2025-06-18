import { FC, useEffect } from 'react';
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  Route,
  RouterProvider,
} from 'react-router-dom';
import {
  Notifier,
  NotifierContextProvider,
  ScrollToTop,
} from 'shared/components';
import { APIResponseStatus } from 'shared/enums';
import { TitlePage, TitlePageProps } from 'shared/utils';

import { Footer } from 'components/layouts/Footer';
import { Header } from 'components/layouts/Header';
import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, RegistrationKind } from 'enums/app';
import { useAPIErrorToast } from 'hooks/useAPIErrorToast';
import { AccessibilityStatementPage } from 'pages/AccessibilityStatementPage';
import { ConfirmRegistrationPage } from 'pages/ConfirmRegistrationPage';
import { EvaluationOrderPage } from 'pages/EvaluationOrderPage';
import { EvaluationOrderStatusPage } from 'pages/EvaluationOrderStatusPage';
import { ExamDetailsPage } from 'pages/ExamDetailsPage';
import { InitRegistrationPage } from 'pages/InitRegistrationPage';
import { LogoutSuccess } from 'pages/LogoutSuccess';
import { NotFoundPage } from 'pages/NotFoundPage';
import { ReassessmentPage } from 'pages/ReassessmentPage';
import { RegistrationPage } from 'pages/RegistrationPage';
import { RegistrationPaymentStatusPage } from 'pages/RegistrationPaymentStatusPage';
import { TransferEnrollmentPage } from 'pages/TransferEnrollmentPage';
import { TransferEnrollmentSuccessPage } from 'pages/TransferEnrollmentSuccessPage';
import { UserDetailsPage } from 'pages/UserDetailsPage';
import { loadSession } from 'redux/reducers/session';
import { sessionSelector } from 'redux/selectors/session';

export const AppRouter: FC = () => {
  const translateCommon = useCommonTranslation();
  const sessionStatus = useAppSelector(sessionSelector).status;
  const dispatch = useAppDispatch();
  const appTitle = translateCommon('appTitle');

  const createTitle = (title: string) =>
    translateCommon('pageTitle.' + title) + ' - ' + appTitle;

  useEffect(() => {
    if (sessionStatus === APIResponseStatus.NotStarted) {
      dispatch(loadSession());
    }
  }, [dispatch, sessionStatus]);

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
        <main className="content" id="main-content">
          <div className="content__container">
            <Outlet />
          </div>
        </main>
        <Footer />
      </NotifierContextProvider>
    </div>
  );

  const YkiTitlePage = ({ title, children }: TitlePageProps) => (
    <TitlePage title={createTitle(title)} className="title-page">
      {children}
    </TitlePage>
  );

  const FrontPage = (
    <YkiTitlePage title="registration">
      <RegistrationPage />
    </YkiTitlePage>
  );

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path={AppRoutes.PublicRoot} element={Root}>
        <Route index={true} element={FrontPage} />
        <Route path={AppRoutes.Registration} element={FrontPage} />
        <Route
          path={AppRoutes.ExamSession}
          element={
            <YkiTitlePage title="registration">
              <InitRegistrationPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.ExamSessionRegistration}
          element={
            <YkiTitlePage title="examDetails">
              <ExamDetailsPage registrationKind={RegistrationKind.Admission} />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.ExamSessionQueue}
          element={
            <YkiTitlePage title="examDetails">
              <ExamDetailsPage registrationKind={RegistrationKind.Queue} />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.RegistrationPaymentStatus}
          element={
            <YkiTitlePage title="registrationPaymentStatus">
              <RegistrationPaymentStatusPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.Reassessment}
          element={
            <YkiTitlePage title="reassessment">
              <ReassessmentPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.ReassessmentOrder}
          element={
            <YkiTitlePage title="evaluationOrder">
              <EvaluationOrderPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.ReassessmentOrderStatus}
          element={
            <YkiTitlePage title="evaluationOrderStatus">
              <EvaluationOrderStatusPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.AccessibilityStatementPage}
          element={
            <YkiTitlePage title="accessibilityStatement">
              <AccessibilityStatementPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.UserDetails}
          element={
            <YkiTitlePage title="userDetails">
              <UserDetailsPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.ConfirmRegistration}
          element={
            <YkiTitlePage title="confirmRegistration">
              <ConfirmRegistrationPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.TransferEnrollment}
          element={
            <YkiTitlePage title="transferEnrollment">
              <TransferEnrollmentPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.TransferEnrollmentSuccess}
          element={
            <YkiTitlePage title="transferEnrollment">
              <TransferEnrollmentSuccessPage />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.LogoutSuccess}
          element={
            <YkiTitlePage title="logoutSuccess">
              <LogoutSuccess />
            </YkiTitlePage>
          }
        />
        <Route
          path={AppRoutes.NotFoundPage}
          element={
            <YkiTitlePage title="notFound">
              <NotFoundPage />
            </YkiTitlePage>
          }
        />
      </Route>,
    ),
  );

  return <RouterProvider router={router} />;
};
