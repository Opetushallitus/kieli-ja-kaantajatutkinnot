import { Box, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { H1, HeaderSeparator, Text } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';
import { DateUtils } from 'shared/utils';

import { OrderStatus } from 'components/orderStatus/OrderStatus';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { EvaluationOrderDetails } from 'interfaces/evaluationOrder';
import {
  loadEvaluationOrderDetails,
  resetEvaluationOrderState,
} from 'redux/reducers/evaluationOrder';
import { evaluationOrderSelector } from 'redux/selectors/evaluationOrder';
import { ExamSessionUtils } from 'utils/examSession';

const EvaluationDetails = ({
  evaluationDetails,
}: {
  evaluationDetails: EvaluationOrderDetails;
}) => {
  const translateCommon = useCommonTranslation();

  return (
    <div>
      <Text>
        {translateCommon('examination')}:{' '}
        <b>{ExamSessionUtils.languageAndLevelText(evaluationDetails)}</b>
      </Text>
      <Text>
        {translateCommon('examDate')}:{' '}
        <b>{DateUtils.formatOptionalDate(evaluationDetails.exam_date)}</b>
      </Text>
    </div>
  );
};

const EvaluationOrderStatusContents = ({
  heading,
  contents,
}: {
  heading: string;
  contents: JSX.Element;
}) => {
  const { evaluationOrderDetails } = useAppSelector(evaluationOrderSelector);
  const { isPhone } = useWindowProperties();

  return (
    <>
      <div className="public-evaluation-order-status-page__heading">
        <H1>{heading}</H1>
        <HeaderSeparator />
      </div>
      <Paper
        elevation={isPhone ? 0 : 3}
        className="public-evaluation-order-status-page__paper rows gapped"
      >
        {evaluationOrderDetails && (
          <EvaluationDetails evaluationDetails={evaluationOrderDetails} />
        )}
        {contents}
      </Paper>
    </>
  );
};

const Success = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.evaluationOrderStatusPage.success',
  });

  return (
    <EvaluationOrderStatusContents
      heading={t('heading')}
      contents={
        <>
          <Text>{t('body1')}</Text>
          <Text>{t('body2')}</Text>
        </>
      }
    />
  );
};

const Cancel = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.evaluationOrderStatusPage.cancel',
  });

  return (
    <EvaluationOrderStatusContents
      heading={t('heading')}
      contents={<Text>{t('info')}</Text>}
    />
  );
};

const Error = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.evaluationOrderStatusPage.error',
  });

  return (
    <EvaluationOrderStatusContents
      heading={t('heading')}
      contents={<Text>{t('info')}</Text>}
    />
  );
};

export const EvaluationOrderStatusPage = () => {
  const [params] = useSearchParams();
  const evaluationOrderId = params.get('id');
  const { loadEvaluationOrderDetailsState } = useAppSelector(
    evaluationOrderSelector
  );
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (
      loadEvaluationOrderDetailsState === APIResponseStatus.NotStarted &&
      evaluationOrderId &&
      !isNaN(+evaluationOrderId)
    ) {
      dispatch(loadEvaluationOrderDetails(+evaluationOrderId));
    }
  }, [dispatch, evaluationOrderId, loadEvaluationOrderDetailsState]);

  // Cleanup
  useEffect(() => {
    const onUnmount = () => {
      dispatch(resetEvaluationOrderState());
    };

    return onUnmount;
  }, [dispatch]);

  return (
    <Box className="public-evaluation-order-status-page">
      <OrderStatus onSuccess={Success} onCancel={Cancel} onDefault={Error} />
    </Box>
  );
};
