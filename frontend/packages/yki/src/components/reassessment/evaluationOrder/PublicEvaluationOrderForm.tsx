import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import {
  Checkbox,
  FormControl,
  FormControlLabel,
  FormGroup,
  Link,
  Paper,
  Typography,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { CustomButton, CustomTextField, H2, Text } from 'shared/components';
import { Color, TextFieldVariant, Variant } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { ExaminationParts } from 'interfaces/evaluationOrder';
import { EvaluationPeriod } from 'interfaces/evaluationPeriod';
import {
  setAcceptConditions,
  setExaminationParts,
} from 'redux/reducers/evaluationOrder';
import { evaluationOrderSelector } from 'redux/selectors/evaluationOrder';
import { ExamUtils } from 'utils/exam';

const EvaluationDetails = () => {
  const translateCommon = useCommonTranslation();
  const evaluationPeriod = useAppSelector(evaluationOrderSelector)
    .evaluationPeriod as EvaluationPeriod;

  return (
    <div>
      <Text>
        {translateCommon('examination')}:{' '}
        <b>{ExamUtils.languageAndLevelText(evaluationPeriod)}</b>
      </Text>
      <Text>
        {translateCommon('examDate')}:{' '}
        <b>{DateUtils.formatOptionalDate(evaluationPeriod.exam_date)}</b>
      </Text>
    </div>
  );
};

const ExaminationPartCheckbox = ({
  examinationPart,
}: {
  examinationPart: keyof ExaminationParts;
}) => {
  const translateCommon = useCommonTranslation();
  const { examinationParts } = useAppSelector(evaluationOrderSelector);
  const dispatch = useAppDispatch();

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={examinationParts[examinationPart]}
          onChange={(_, checked) =>
            dispatch(setExaminationParts({ [examinationPart]: checked }))
          }
        />
      }
      label={`${translateCommon('examParts.' + examinationPart)} 50 €`}
    />
  );
};

const SelectExaminationParts = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.evaluationOrderForm.selectExaminationParts',
  });
  const { examinationParts } = useAppSelector(evaluationOrderSelector);
  const sumTotal = Object.values(examinationParts).reduce(
    (acc, val) => (val ? acc + 50 : acc),
    0
  );

  return (
    <>
      <H2>{t('heading')}</H2>
      <FormControl component="fieldset" variant={TextFieldVariant.Standard}>
        <Typography variant="h3" component="legend">
          {t('selectParts')}
        </Typography>
        <Text>{t('selectAtLeastOne')}</Text>
        <FormGroup>
          <ExaminationPartCheckbox examinationPart="readingComprehension" />
          <ExaminationPartCheckbox examinationPart="speechComprehension" />
          <ExaminationPartCheckbox examinationPart="writing" />
          <ExaminationPartCheckbox examinationPart="speaking" />
        </FormGroup>
      </FormControl>
      <Text>
        {t('sumTotal')}: <b>{sumTotal} €</b>
      </Text>
    </>
  );
};

const PayerDetails = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.evaluationOrderForm.fillPayerDetails',
  });

  return (
    <>
      <H2>{t('heading')}</H2>
      <div className="public-evaluation-order-page__order-form__payer-details-grid">
        <CustomTextField />
        <CustomTextField />
        <CustomTextField />
        <CustomTextField />
      </div>
    </>
  );
};

const AcceptConditions = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.evaluationOrderForm.acceptConditions',
  });
  const acceptConditions = useAppSelector(
    evaluationOrderSelector
  ).acceptConditions;
  const dispatch = useAppDispatch();

  return (
    <>
      <H2>{t('heading')}</H2>
      <div>
        <Text>{t('legalBasis')}</Text>
        <div className="columns gapped-xxs">
          <Link
            component={RouterLink}
            variant="body1"
            to={AppRoutes.PrivacyPolicyPage}
          >
            {t('readConditions')}
          </Link>
          <OpenInNewIcon />
        </div>
        <FormControlLabel
          control={
            <Checkbox
              checked={acceptConditions}
              onChange={(_, checked) => dispatch(setAcceptConditions(checked))}
            />
          }
          label={t('grantApproval')}
        />
      </div>
    </>
  );
};

const ActionButtons = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.evaluationOrderForm.actionButtons',
  });

  return (
    <div className="public-evaluation-order-page__order-form__action-buttons gapped-xs">
      <CustomButton variant={Variant.Contained} color={Color.Secondary}>
        {t('pay')}
      </CustomButton>
      <CustomButton variant={Variant.Text} color={Color.Secondary}>
        {t('cancel')}
      </CustomButton>
    </div>
  );
};

export const PublicEvaluationOrderForm = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.evaluationOrderForm',
  });

  return (
    <Paper elevation={3} className="public-evaluation-order-page__order-form">
      <EvaluationDetails />
      <div>
        <Text>{t('info.fillForm')}</Text>
        <Text>{t('info.requiredFields')}</Text>
      </div>
      <SelectExaminationParts />
      <div>
        <Text>{t('info.refundIfChangeInEvaluation')}</Text>
        <Text>{t('info.requestSummaryByEmail')}</Text>
      </div>
      <PayerDetails />
      <AcceptConditions />
      <ActionButtons />
    </Paper>
  );
};
