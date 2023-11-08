import { FC, lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Notifier, ScrollToTop } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';
import { TitlePage } from 'shared/utils';

import { Footer } from 'components/layouts/Footer';
import { Header } from 'components/layouts/Header';
import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { useAPIErrorToast } from 'hooks/useAPIErrorToast';
const AccessibilityStatementPage = lazy(
  () => import('pages/AccessibilityStatementPage')
);
const EvaluationOrderPage = lazy(() => import('pages/EvaluationOrderPage'));
const EvaluationOrderStatusPage = lazy(
  () => import('pages/EvaluationOrderStatusPage')
);
const ExamDetailsPage = lazy(() => import('pages/ExamDetailsPage'));
const InitRegistrationPage = lazy(() => import('pages/InitRegistrationPage'));
const LogoutSuccess = lazy(() => import('pages/LogoutSuccess'));
const NotFoundPage = lazy(() => import('pages/NotFoundPage'));
const ReassessmentPage = lazy(() => import('pages/ReassessmentPage'));
const RegistrationPage = lazy(() => import('pages/RegistrationPage'));
const RegistrationPaymentStatusPage = lazy(
  () => import('pages/RegistrationPaymentStatusPage')
);
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

  useAPIErrorToast();

  return (
    <BrowserRouter>
      <div className="app">
        <Header />
        <Notifier />
        <ScrollToTop />
        <main className="content" id="main-content">
          <div className="content__container">
            <Suspense fallback={<div></div>}>
              <Routes>
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
              </Routes>
            </Suspense>
          </div>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};
