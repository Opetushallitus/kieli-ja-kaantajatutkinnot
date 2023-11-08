import { TableCell, TableRow, Typography } from '@mui/material';
import { useNavigate } from 'react-router';
import { CustomButton, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';
import { DateUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { EvaluationPeriod } from 'interfaces/evaluationPeriod';
import { storeEvaluationPeriod } from 'redux/reducers/evaluationOrder';
import { ExamSessionUtils } from 'utils/examSession';

const PublicEvaluationPeriodListingCellsForPhone = ({
  evaluationPeriod,
}: {
  evaluationPeriod: EvaluationPeriod;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.publicEvaluationPeriodListing',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // TODO Heading for the language and level text? According to design in Figma,
  // there should be a heading read out to screen reader users.
  // As the mobile table is actually a single-column table without headers,
  // this doesn't probably work ideally right now for screen reader users.

  return (
    <TableCell>
      <div className="rows grow gapped-xs">
        <Typography variant="h2" component="p">
          {ExamSessionUtils.languageAndLevelText(evaluationPeriod)}
        </Typography>
        <Text>
          <b>{translateCommon('examDate')}</b>
          <br />
          {DateUtils.formatOptionalDate(evaluationPeriod.exam_date, 'l')}
        </Text>
        <Text>
          <b>{t('header.evaluationPeriod')}</b>
          <br />
          {DateUtils.formatOptionalDate(
            evaluationPeriod.evaluation_start_date,
          )}{' '}
          &ndash;{' '}
          {DateUtils.formatOptionalDate(evaluationPeriod.evaluation_end_date)}
        </Text>
        <CustomButton
          color={Color.Secondary}
          variant={Variant.Outlined}
          disabled={!evaluationPeriod.open}
          onClick={() => {
            dispatch(storeEvaluationPeriod(evaluationPeriod));
            navigate(
              AppRoutes.ReassessmentOrder.replace(
                /:evaluationId/,
                `${evaluationPeriod.id}`,
              ),
            );
          }}
        >
          {evaluationPeriod.open
            ? t('requestReassessment')
            : t('evaluationPeriodNotYetOpen')}
        </CustomButton>
      </div>
    </TableCell>
  );
};

const PublicEvaluationPeriodListingCellsForDesktop = ({
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
    <>
      <TableCell>
        {ExamSessionUtils.languageAndLevelText(evaluationPeriod)}
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
          onClick={() => {
            dispatch(storeEvaluationPeriod(evaluationPeriod));
            navigate(
              AppRoutes.ReassessmentOrder.replace(
                /:evaluationId/,
                `${evaluationPeriod.id}`,
              ),
            );
          }}
        >
          {evaluationPeriod.open
            ? t('requestReassessment')
            : t('evaluationPeriodNotYetOpen', {
                startDate: DateUtils.formatOptionalDate(
                  evaluationPeriod.evaluation_start_date,
                ),
              })}
        </CustomButton>
      </TableCell>
    </>
  );
};

export const PublicEvaluationPeriodListingRow = ({
  evaluationPeriod,
}: {
  evaluationPeriod: EvaluationPeriod;
}) => {
  const { isPhone } = useWindowProperties();

  return (
    <TableRow
      data-testid={`public-evaluation-period__id-${evaluationPeriod.id}-row`}
    >
      {isPhone ? (
        <PublicEvaluationPeriodListingCellsForPhone
          evaluationPeriod={evaluationPeriod}
        />
      ) : (
        <PublicEvaluationPeriodListingCellsForDesktop
          evaluationPeriod={evaluationPeriod}
        />
      )}
    </TableRow>
  );
};
