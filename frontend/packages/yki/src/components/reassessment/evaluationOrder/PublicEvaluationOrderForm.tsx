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
import { useCallback } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  CustomButton,
  CustomDatePicker,
  CustomTextField,
  H2,
  Text,
} from 'shared/components';
import {
  APIResponseStatus,
  Color,
  Severity,
  TextFieldTypes,
  TextFieldVariant,
  Variant,
} from 'shared/enums';
import { useDialog } from 'shared/hooks';
import { DateUtils, InputFieldUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { ExaminationParts, PayerDetails } from 'interfaces/evaluationOrder';
import { EvaluationPeriod } from 'interfaces/evaluationPeriod';
import {
  setAcceptConditions,
  setExaminationParts,
  setPayerDetails,
  setShowErrors,
  submitEvaluationOrder,
} from 'redux/reducers/evaluationOrder';
import { evaluationOrderSelector } from 'redux/selectors/evaluationOrder';
import { ExamUtils } from 'utils/exam';

const RenderEvaluationDetails = () => {
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
      sx={{
        '&.Mui-error .MuiFormControlLabel-label': { color: 'error.main' },
      }}
    />
  );
};

const SelectExaminationParts = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.evaluationOrderForm.selectExaminationParts',
  });
  const { examinationParts, showErrors } = useAppSelector(
    evaluationOrderSelector
  );
  const sumTotal = Object.values(examinationParts).reduce(
    (acc, val) => (val ? acc + 50 : acc),
    0
  );

  return (
    <>
      <H2>{t('heading')}</H2>
      <FormControl
        error={showErrors && sumTotal === 0}
        component="fieldset"
        variant={TextFieldVariant.Standard}
      >
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

const PayerDetailsTextField = ({
  field,
}: {
  field: keyof Omit<PayerDetails, 'birthdate'>;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix:
      'yki.component.evaluationOrderForm.fillPayerDetails.placeholders',
  });
  const translateCommon = useCommonTranslation();
  const value = useAppSelector(evaluationOrderSelector).payerDetails[field];
  const showErrors = useAppSelector(evaluationOrderSelector).showErrors;
  const dispatch = useAppDispatch();

  const getFieldError = useCallback(
    (field: keyof Omit<PayerDetails, 'birthdate'>) => {
      if (!showErrors) {
        return null;
      }

      const fieldType =
        field === 'email' ? TextFieldTypes.Email : TextFieldTypes.Text;
      const error = InputFieldUtils.inspectCustomTextFieldErrors(
        fieldType,
        value,
        true
      );

      if (!error) {
        return null;
      }

      return translateCommon(error);
    },
    [value, showErrors, translateCommon]
  );

  return (
    <CustomTextField
      placeholder={t(field)}
      value={value}
      onChange={(event) =>
        dispatch(setPayerDetails({ [field]: event.target.value }))
      }
      error={!!getFieldError(field)}
      helperText={getFieldError(field)}
    />
  );
};

const FillPayerDetails = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.evaluationOrderForm.fillPayerDetails',
  });
  const translateCommon = useCommonTranslation();
  const { birthdate } = useAppSelector(evaluationOrderSelector).payerDetails;
  const showErrors = useAppSelector(evaluationOrderSelector).showErrors;

  const dispatch = useAppDispatch();

  return (
    <>
      <H2>{t('heading')}</H2>
      <div className="public-evaluation-order-page__order-form__payer-details-grid">
        <PayerDetailsTextField field="firstNames" />
        <PayerDetailsTextField field="lastName" />
        <CustomDatePicker
          placeholder={t('placeholders.birthdate')}
          value={birthdate ?? null}
          setValue={(value) => {
            if (value) {
              dispatch(setPayerDetails({ birthdate: value }));
            } else {
              dispatch(setPayerDetails({ birthdate: undefined }));
            }
          }}
          error={showErrors && !birthdate}
          helperText={
            showErrors && !birthdate
              ? translateCommon('errors.customTextField.required')
              : t('placeholders.birthdate')
          }
        />
        <PayerDetailsTextField field="email" />
      </div>
    </>
  );
};

const AcceptConditions = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.evaluationOrderForm.acceptConditions',
  });
  const { acceptConditions, showErrors } = useAppSelector(
    evaluationOrderSelector
  );
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
      </div>
      <FormControl error={showErrors && !acceptConditions}>
        <FormControlLabel
          control={
            <Checkbox
              checked={acceptConditions}
              onChange={(_, checked) => dispatch(setAcceptConditions(checked))}
            />
          }
          label={t('grantApproval')}
          sx={{
            '&.Mui-error .MuiFormControlLabel-label': { color: 'error.main' },
          }}
        />
      </FormControl>
    </>
  );
};

const useEvaluationOrderErrors = () => {
  const { acceptConditions, examinationParts, payerDetails } = useAppSelector(
    evaluationOrderSelector
  );
  const errors: Array<string> = [];
  if (!acceptConditions) {
    errors.push('acceptConditions');
  }

  if (!Object.values(examinationParts).some((v) => v)) {
    errors.push('noExaminationPartsSelected');
  }

  if (!payerDetails.firstNames) {
    errors.push('firstNames');
  }

  if (!payerDetails.lastName) {
    errors.push('lastName');
  }

  if (!payerDetails.birthdate) {
    errors.push('birthdate');
  }

  if (
    InputFieldUtils.validateCustomTextFieldErrors({
      type: TextFieldTypes.Email,
      required: true,
      value: payerDetails.email,
    })
  ) {
    errors.push('email');
  }

  return errors;
};

const useHandleSubmitAction = () => {
  const dispatch = useAppDispatch();
  const { submitOrderState } = useAppSelector(evaluationOrderSelector);
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.evaluationOrderForm.errorDialog',
  });

  const errors = useEvaluationOrderErrors();
  const { showDialog } = useDialog();
  const payOrFixErrors = () => {
    // Disallow submitting same order multiple times.
    if (
      submitOrderState === APIResponseStatus.InProgress ||
      submitOrderState === APIResponseStatus.Success
    ) {
      return;
    }

    if (errors.length > 0) {
      dispatch(setShowErrors(true));
      const dialogContent = (
        <div>
          <Text>{t('fixErrors')}</Text>
          <ul>
            {errors.map((error, i) => (
              <li key={i}>
                <Text>{t(`errors.${error}`)}</Text>
              </li>
            ))}
          </ul>
        </div>
      );
      showDialog({
        title: t('title'),
        severity: Severity.Error,
        content: dialogContent,
        actions: [
          { title: translateCommon('back'), variant: Variant.Contained },
        ],
      });
    } else {
      dispatch(submitEvaluationOrder());
    }
  };

  return payOrFixErrors;
};

const ActionButtons = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.evaluationOrderForm.actionButtons',
  });

  const navigate = useNavigate();
  const handleSubmitAction = useHandleSubmitAction();

  return (
    <div className="public-evaluation-order-page__order-form__action-buttons gapped-xs">
      <CustomButton
        variant={Variant.Contained}
        color={Color.Secondary}
        onClick={handleSubmitAction}
      >
        {t('pay')}
      </CustomButton>
      <CustomButton
        variant={Variant.Text}
        color={Color.Secondary}
        onClick={() => navigate(AppRoutes.Reassessment)}
      >
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
      <RenderEvaluationDetails />
      <div>
        <Text>{t('info.fillForm')}</Text>
        <Text>{t('info.requiredFields')}</Text>
      </div>
      <SelectExaminationParts />
      <div>
        <Text>{t('info.refundIfChangeInEvaluation')}</Text>
        <Text>{t('info.requestSummaryByEmail')}</Text>
      </div>
      <FillPayerDetails />
      <AcceptConditions />
      <ActionButtons />
    </Paper>
  );
};
