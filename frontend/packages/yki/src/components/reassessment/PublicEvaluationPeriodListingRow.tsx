import { TableCell, TableRow } from '@mui/material';
import { useNavigate } from 'react-router';
import { CustomButton } from 'shared/components';
import { Color, Variant } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { EvaluationPeriod } from 'interfaces/evaluationPeriod';
import { storeEvaluationPeriod } from 'redux/reducers/evaluationOrder';
import { ExamUtils } from 'utils/exam';

export const PublicEvaluationPeriodListingRow = ({
  evaluationPeriod,
}: {
  evaluationPeriod: EvaluationPeriod;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.publicEvaluationPeriodListing',
  });
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  return (
    <TableRow
      data-testid={`public-evaluation-period__id-${evaluationPeriod.id}-row`}
    >
      <TableCell>{ExamUtils.languageAndLevelText(evaluationPeriod)}</TableCell>
      <TableCell>
        {DateUtils.formatOptionalDate(evaluationPeriod.exam_date, 'l')}
      </TableCell>
      <TableCell>
        {DateUtils.formatOptionalDate(evaluationPeriod.evaluation_start_date)}{' '}
        &ndash;{' '}
        {DateUtils.formatOptionalDate(evaluationPeriod.evaluation_end_date)}
      </TableCell>
      <TableCell>
        <CustomButton
          color={Color.Secondary}
          variant={Variant.Outlined}
          disabled={!evaluationPeriod.open}
          onClick={() => {
            dispatch(storeEvaluationPeriod(evaluationPeriod));
            navigate(
              AppRoutes.ReassessmentOrder.replace(
                /:evaluationId/,
                `${evaluationPeriod.id}`
              )
            );
          }}
        >
          {evaluationPeriod.open
            ? t('requestReassessment')
            : t('evaluationPeriodNotYetOpen')}
        </CustomButton>
      </TableCell>
    </TableRow>
  );
};
