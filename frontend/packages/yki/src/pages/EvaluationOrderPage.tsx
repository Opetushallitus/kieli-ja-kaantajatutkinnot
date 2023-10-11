import { Box, Grid } from '@mui/material';
import { useCallback, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { H1, H2, HeaderSeparator } from 'shared/components';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { PublicEvaluationOrderForm } from 'components/reassessment/evaluationOrder/PublicEvaluationOrderForm';
import { PublicEvaluationOrderPageSkeleton } from 'components/skeletons/PublicEvaluationOrderPageSkeleton';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import {
  initialState,
  loadEvaluationPeriod,
  resetEvaluationOrderState,
} from 'redux/reducers/evaluationOrder';
import { evaluationOrderSelector } from 'redux/selectors/evaluationOrder';

const EvaluationOrderPage = () => {
  // i18n
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.evaluationOrderPage',
  });

  const { showToast } = useToast();

  // Redux
  const dispatch = useAppDispatch();
  const {
    acceptConditions,
    loadPeriodState,
    submitOrderState,
    evaluationPeriod,
    participantDetails,
    examinationParts,
    evaluationPaymentRedirect,
  } = useAppSelector(evaluationOrderSelector);

  // React Router
  const params = useParams();

  // Navigation protection
  // Enable on changed form details, disable when redirecting to payments provider.
  const isDirtyState =
    initialState.acceptConditions !== acceptConditions ||
    initialState.participantDetails !== participantDetails ||
    initialState.examinationParts !== examinationParts;
  useNavigationProtection(isDirtyState && !evaluationPaymentRedirect);

  // Reset user filled details when unmounting (eg. navigating away from page)
  const resetStateOnUnmount = useCallback(() => {
    dispatch(resetEvaluationOrderState());
  }, [dispatch]);
  useEffect(() => resetStateOnUnmount, [resetStateOnUnmount]);

  useEffect(() => {
    if (loadPeriodState === APIResponseStatus.Error) {
      showToast({
        severity: Severity.Error,
        description: t('toasts.loadingError'),
      });
    } else if (
      loadPeriodState === APIResponseStatus.NotStarted &&
      !evaluationPeriod?.id &&
      params.evaluationId
    ) {
      // Fetch evaluation details
      dispatch(loadEvaluationPeriod(+params.evaluationId));
    } else if (
      submitOrderState === APIResponseStatus.Success &&
      evaluationPaymentRedirect
    ) {
      window.location.replace(evaluationPaymentRedirect);
    }
  }, [
    dispatch,
    showToast,
    t,
    params.evaluationId,
    evaluationPeriod?.id,
    loadPeriodState,
    submitOrderState,
    evaluationPaymentRedirect,
  ]);

  switch (loadPeriodState) {
    case APIResponseStatus.NotStarted:
    case APIResponseStatus.InProgress:
      return <PublicEvaluationOrderPageSkeleton />;
    case APIResponseStatus.Cancelled:
    case APIResponseStatus.Error:
      return (
        <Box className="public-evaluation-order-page">
          <Grid
            container
            rowSpacing={4}
            direction="column"
            className="public-evaluation-order-page__grid-container"
          >
            <Grid
              item
              className="public-evaluation-order-page__grid-container__item-header"
            >
              <H1 className="public-evaluation-order-page__title-heading">
                {t('title')}
              </H1>
              <HeaderSeparator />
              <H2>{t('notFound')}</H2>
            </Grid>
          </Grid>
        </Box>
      );
    case APIResponseStatus.Success:
      return (
        <Box className="public-evaluation-order-page">
          <Grid
            container
            rowSpacing={4}
            direction="column"
            className="public-evaluation-order-page__grid-container"
          >
            <Grid
              item
              className="public-evaluation-order-page__grid-container__item-header"
            >
              <H1 className="public-evaluation-order-page__title-heading">
                {t('title')}
              </H1>
              <HeaderSeparator />
            </Grid>
            <PublicEvaluationOrderForm />
          </Grid>
        </Box>
      );
  }
};

export default EvaluationOrderPage;
