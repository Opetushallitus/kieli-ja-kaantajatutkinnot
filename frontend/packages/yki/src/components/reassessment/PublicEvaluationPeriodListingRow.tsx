import { TableCell, TableRow } from '@mui/material';
import { CustomButton } from 'shared/components';
import { Color, Variant } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { usePublicTranslation } from 'configs/i18n';
import { EvaluationPeriod } from 'interfaces/evaluationPeriod';
import { ExamUtils } from 'utils/exam';

export const PublicEvaluationPeriodListingRow = ({
  evaluationPeriod,
}: {
  evaluationPeriod: EvaluationPeriod;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.publicEvaluationPeriodListing',
  });

  return (
    <TableRow
      data-testid={`public-evaluation-period__id-${evaluationPeriod.id}-row`}
    >
      <TableCell>
        {ExamUtils.renderLanguageAndLevel(evaluationPeriod)}
      </TableCell>
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
        >
          {t('requestReassessment')}
        </CustomButton>
      </TableCell>
    </TableRow>
  );
};
