import { Box, Grid } from '@mui/material';
import { useCallback, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { H1, HeaderSeparator } from 'shared/components';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { PublicEvaluationOrderForm } from 'components/reassessment/evaluationOrder/PublicEvaluationOrderForm';
import { PublicEvaluationOrderPageSkeleton } from 'components/skeletons/PublicEvaluationOrderPageSkeleton';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import {
  initialState,
  loadEvaluationPeriod,
  resetEvaluationOrderState,
} from 'redux/reducers/evaluationOrder';
import { evaluationOrderSelector } from 'redux/selectors/evaluationOrder';

export const EvaluationOrderPage = () => {
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
    payerDetails,
    examinationParts,
    evaluationPaymentRedirectResponse,
  } = useAppSelector(evaluationOrderSelector);
  const isLoading =
    loadPeriodState === APIResponseStatus.InProgress ||
    loadPeriodState === APIResponseStatus.NotStarted;

  // React Router
  const navigate = useNavigate();
  const params = useParams();

  // Navigation protection
  // Enable on changed form details, disable when redirecting to payments provider.

  const isDirtyState =
    initialState.acceptConditions !== acceptConditions ||
    initialState.payerDetails !== payerDetails ||
    initialState.examinationParts !== examinationParts;
  useNavigationProtection(isDirtyState && !evaluationPaymentRedirectResponse);

  // Reset user filled details when unmounting (eg. navigating away from page)
  const resetStateOnUnmount = useCallback(() => {
    dispatch(resetEvaluationOrderState());
  }, [dispatch]);
  useEffect(() => resetStateOnUnmount, [resetStateOnUnmount]);

  useEffect(() => {
    if (
      loadPeriodState === APIResponseStatus.NotStarted &&
      !evaluationPeriod?.id &&
      params.evaluationId
    ) {
      // Fetch evaluation details
      dispatch(loadEvaluationPeriod(+params.evaluationId));
    } else if (
      loadPeriodState === APIResponseStatus.Error ||
      isNaN(Number(params.evaluationId))
    ) {
      // TODO Decide whether to show error here or not.
      // Typically we also raise an error within the corresponding saga.
      showToast({
        severity: Severity.Error,
        description: t('toasts.notFound'),
      });

      navigate(AppRoutes.Reassessment, { replace: true });
    } else if (
      submitOrderState === APIResponseStatus.Success &&
      evaluationPaymentRedirectResponse
    ) {
      window.location.replace(evaluationPaymentRedirectResponse.redirect);
    }
  }, [
    dispatch,
    navigate,
    showToast,
    t,
    params.evaluationId,
    evaluationPeriod?.id,
    loadPeriodState,
    submitOrderState,
    evaluationPaymentRedirectResponse,
  ]);

  return isLoading ? (
    <PublicEvaluationOrderPageSkeleton />
  ) : (
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
};
