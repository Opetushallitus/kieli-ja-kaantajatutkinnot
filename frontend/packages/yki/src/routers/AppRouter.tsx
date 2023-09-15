import { FC, useEffect } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import { Notifier, ScrollToTop } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

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
import { ReassessmentPage } from 'pages/ReassessmentPage';
import { RegistrationPage } from 'pages/RegistrationPage';
import { RegistrationPaymentStatusPage } from 'pages/RegistrationPaymentStatusPage';
import { loadSession } from 'redux/reducers/session';
import { sessionSelector } from 'redux/selectors/session';

export const AppRouter: FC = () => {
  const translateCommon = useCommonTranslation();
  const sessionStatus = useAppSelector(sessionSelector).status;
  const dispatch = useAppDispatch();

  useEffect(() => {
    document.title = translateCommon('appTitle');
  }, [translateCommon]);

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
            <Routes>
              <Route
                path={AppRoutes.Registration}
                element={<RegistrationPage />}
              />
              <Route
                path={AppRoutes.ExamSession}
                element={<InitRegistrationPage />}
              />
              <Route
                path={AppRoutes.ExamSessionRegistration}
                element={<ExamDetailsPage />}
              />
              <Route
                path={AppRoutes.RegistrationPaymentStatus}
                element={<RegistrationPaymentStatusPage />}
              />
              <Route
                path={AppRoutes.Reassessment}
                element={<ReassessmentPage />}
              />
              <Route
                path={AppRoutes.ReassessmentOrder}
                element={<EvaluationOrderPage />}
              />
              <Route
                path={AppRoutes.ReassessmentOrderStatus}
                element={<EvaluationOrderStatusPage />}
              />
              <Route
                path={AppRoutes.AccessibilityStatementPage}
                element={<AccessibilityStatementPage />}
              />
            </Routes>
          </div>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
};
