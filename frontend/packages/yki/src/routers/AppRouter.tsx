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
import { TitlePage } from 'shared/utils';

import { Footer } from 'components/layouts/Footer';
import { Header } from 'components/layouts/Header';
import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { useAPIErrorToast } from 'hooks/useAPIErrorToast';
import { AccessibilityStatementPage } from 'pages/AccessibilityStatementPage';
import { EvaluationOrderPage } from 'pages/EvaluationOrderPage';
import { EvaluationOrderStatusPage } from 'pages/EvaluationOrderStatusPage';
import { ExamDetailsPage } from 'pages/ExamDetailsPage';
import { InitRegistrationPage } from 'pages/InitRegistrationPage';
import { LogoutSuccess } from 'pages/LogoutSuccess';
import { NotFoundPage } from 'pages/NotFoundPage';
import { ReassessmentPage } from 'pages/ReassessmentPage';
import { RegistrationPage } from 'pages/RegistrationPage';
import { RegistrationPaymentStatusPage } from 'pages/RegistrationPaymentStatusPage';
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

  const router = createBrowserRouter(
    createRoutesFromElements(
      <Route path={AppRoutes.PublicRoot} element={Root}>
        <Route
          path={AppRoutes.Registration}
          element={
            <TitlePage title={createTitle('registration')}>
              <RegistrationPage />
            </TitlePage>
          }
        />
        <Route
          path={AppRoutes.ExamSession}
          element={
            <TitlePage title={createTitle('initRegistration')}>
              <InitRegistrationPage />
            </TitlePage>
          }
        />
        <Route
          path={AppRoutes.ExamSessionRegistration}
          element={
            <TitlePage title={createTitle('examDetails')}>
              <ExamDetailsPage />
            </TitlePage>
          }
        />
        <Route
          path={AppRoutes.RegistrationPaymentStatus}
          element={
            <TitlePage title={createTitle('registrationPaymentStatus')}>
              <RegistrationPaymentStatusPage />
            </TitlePage>
          }
        />
        <Route
          path={AppRoutes.Reassessment}
          element={
            <TitlePage title={createTitle('reassessment')}>
              <ReassessmentPage />
            </TitlePage>
          }
        />
        <Route
          path={AppRoutes.ReassessmentOrder}
          element={
            <TitlePage title={createTitle('evaluationOrder')}>
              <EvaluationOrderPage />
            </TitlePage>
          }
        />
        <Route
          path={AppRoutes.ReassessmentOrderStatus}
          element={
            <TitlePage title={createTitle('evaluationOrderStatus')}>
              <EvaluationOrderStatusPage />
            </TitlePage>
          }
        />
        <Route
          path={AppRoutes.AccessibilityStatementPage}
          element={
            <TitlePage title={createTitle('accessibilityStatement')}>
              <AccessibilityStatementPage />
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
