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
import { useNavigate } from 'react-router-dom';
import { CustomButton, H2, LabeledTextField, Text } from 'shared/components';
import {
  APIResponseStatus,
  Color,
  Severity,
  TextFieldTypes,
  TextFieldVariant,
  Variant,
} from 'shared/enums';
import { useDialog, useWindowProperties } from 'shared/hooks';
import { DateUtils, InputFieldUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import {
  ExaminationParts,
  ParticipantDetails,
} from 'interfaces/evaluationOrder';
import { EvaluationPeriod } from 'interfaces/evaluationPeriod';
import {
  setAcceptConditions,
  setExaminationParts,
  setParticipantDetails,
  setShowErrors,
  submitEvaluationOrder,
} from 'redux/reducers/evaluationOrder';
import { evaluationOrderSelector } from 'redux/selectors/evaluationOrder';
import { ExamSessionUtils } from 'utils/examSession';

const RenderEvaluationDetails = () => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.evaluationOrderForm.renderEvaluationDetails',
  });
  const evaluationPeriod = useAppSelector(evaluationOrderSelector)
    .evaluationPeriod as EvaluationPeriod;

  return (
    <>
      <Text>{t('info')}</Text>
      <Text>
        {translateCommon('examination')}:{' '}
        <b>{ExamSessionUtils.languageAndLevelText(evaluationPeriod)}</b>
        <br />
        {translateCommon('examDate')}:{' '}
        <b>{DateUtils.formatOptionalDate(evaluationPeriod.exam_date)}</b>
      </Text>
    </>
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

const ParticipantDetailsTextField = ({
  field,
}: {
  field: keyof ParticipantDetails;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.evaluationOrderForm.fillParticipantDetails',
  });
  const translateCommon = useCommonTranslation();
  const value = useAppSelector(evaluationOrderSelector).participantDetails[
    field
  ];
  const showErrors = useAppSelector(evaluationOrderSelector).showErrors;
  const dispatch = useAppDispatch();

  const getFieldError = useCallback(
    (field: keyof ParticipantDetails) => {
      if (!showErrors) {
        return null;
      }

      const fieldType =
        field === 'email'
          ? TextFieldTypes.Email
          : field === 'birthdate'
          ? TextFieldTypes.Date
          : TextFieldTypes.Text;
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
    <LabeledTextField
      id={'public-evaluation-order-form__field__' + field}
      label={t('labels.' + field)}
      placeholder={t('placeholders.' + field)}
      value={value || ''}
      onChange={(event) =>
        dispatch(setParticipantDetails({ [field]: event.target.value }))
      }
      error={!!getFieldError(field)}
      helperText={getFieldError(field)}
    />
  );
};

const FillParticipantDetails = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.evaluationOrderForm.fillParticipantDetails',
  });

  return (
    <>
      <H2>{t('heading')}</H2>
      <Text>{t('instructions')}</Text>
      <div className="public-evaluation-order-page__order-form__participant-details-grid">
        <ParticipantDetailsTextField field="firstNames" />
        <ParticipantDetailsTextField field="lastName" />
        <ParticipantDetailsTextField field="birthdate" />
        <ParticipantDetailsTextField field="email" />
      </div>
    </>
  );
};

const AcceptConditions = () => {
  const translateCommon = useCommonTranslation();
  const { acceptConditions, showErrors } = useAppSelector(
    evaluationOrderSelector
  );
  const dispatch = useAppDispatch();

  return (
    <>
      <H2>{translateCommon('privacyStatement.title')}</H2>
      <div>
        <Text>
          {translateCommon('privacyStatement.description')}
          <br />
          {translateCommon('privacyStatement.readConditions')}
        </Text>
        <div className="columns gapped-xxs">
          <Link
            href={translateCommon('privacyStatement.link.url')}
            target="_blank"
          >
            <Text>{translateCommon('privacyStatement.link.label')}</Text>
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
          label={translateCommon('privacyStatement.grantApproval')}
          sx={{
            '&.Mui-error .MuiFormControlLabel-label': { color: 'error.main' },
          }}
        />
      </FormControl>
    </>
  );
};

const useEvaluationOrderErrors = () => {
  const { acceptConditions, examinationParts, participantDetails } =
    useAppSelector(evaluationOrderSelector);
  const errors: Array<string> = [];
  if (!acceptConditions) {
    errors.push('acceptConditions');
  }

  if (!Object.values(examinationParts).some((v) => v)) {
    errors.push('noExaminationPartsSelected');
  }

  if (!participantDetails.firstNames) {
    errors.push('firstNames');
  }

  if (!participantDetails.lastName) {
    errors.push('lastName');
  }

  if (
    InputFieldUtils.validateCustomTextFieldErrors({
      type: TextFieldTypes.Date,
      required: true,
      value: participantDetails.birthdate,
    })
  ) {
    errors.push('birthdate');
  }

  if (
    InputFieldUtils.validateCustomTextFieldErrors({
      type: TextFieldTypes.Email,
      required: true,
      value: participantDetails.email,
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
            {errors.map((error) => (
              <li key={error}>
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
  const { isPhone } = useWindowProperties();

  return (
    <div className="public-evaluation-order-page__order-form__action-buttons gapped-xs">
      <CustomButton
        variant={Variant.Contained}
        color={Color.Secondary}
        onClick={handleSubmitAction}
        fullWidth={isPhone}
      >
        {t('pay')}
      </CustomButton>
      <CustomButton
        variant={Variant.Text}
        color={Color.Secondary}
        onClick={() => navigate(AppRoutes.Reassessment)}
        fullWidth={isPhone}
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
      <Text>{t('info.requiredFields')}</Text>
      <SelectExaminationParts />
      <Text>{t('info.refundIfChangeInEvaluation')}</Text>
      <FillParticipantDetails />
      <AcceptConditions />
      <ActionButtons />
    </Paper>
  );
};
