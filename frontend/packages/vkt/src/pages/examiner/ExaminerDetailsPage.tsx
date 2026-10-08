import {
  Checkbox,
  Divider,
  FormControl,
  FormControlLabel,
  FormGroup,
  Grid,
  Paper,
} from '@mui/material';
import { Box } from '@mui/system';
import {
  ChangeEvent,
  SyntheticEvent,
  useCallback,
  useEffect,
  useState,
} from 'react';
import { useNavigate } from 'react-router';
import {
  CustomButton,
  CustomSwitch,
  H1,
  H2,
  LabeledMultipleCheckboxDropdown,
  LabeledTextField,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import {
  APIResponseStatus,
  Color,
  CustomTextFieldErrors,
  Duration,
  InputAutoComplete,
  Severity,
  TextFieldTypes,
  TextFieldVariant,
  Variant,
} from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';
import { ComboBoxOption } from 'shared/interfaces';
import { InputFieldUtils, StringUtils } from 'shared/utils';

import {
  useCommonTranslation,
  useExaminerTranslation,
  useKoodistoMunicipalitiesTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, ExamLanguage } from 'enums/app';
import { useMunicipalityOptions } from 'hooks/useKoodistoMunicipalities';
import {
  ExaminerDetails,
  ExaminerDetailsInit,
  isExaminerDetails,
} from 'interfaces/examinerDetails';
import { ExaminerDetailsUpsert } from 'interfaces/examinerDetailsUpsert';
import { loadExaminerDetails } from 'redux/reducers/examinerDetails';
import { loadExaminerDetailsInit } from 'redux/reducers/examinerDetailsInit';
import {
  resetExaminerDetailsUpsert,
  startExaminerDetailsUpsert,
  updateExaminerDetailsUpsert,
} from 'redux/reducers/examinerDetailsUpsert';
import { examinerDetailsSelector } from 'redux/selectors/examinerDetails';
import { examinerDetailsInitSelector } from 'redux/selectors/examinerDetailsInit';
import { examinerDetailsUpsertSelector } from 'redux/selectors/examinerDetailsUpsert';

interface InputFieldValidation {
  email: string;
  phoneNumber: string;
  examLanguages: string;
  municipalities: string;
}

interface LabeledFieldProps {
  id: string;
  label: string;
  helperText: string;
  error: boolean;
}

const useExaminerDetailsUpsertErrors = (showErrors: boolean) => {
  const { examinerDetails } = useAppSelector(examinerDetailsUpsertSelector);
  if (showErrors) {
    return {
      email: InputFieldUtils.validateCustomTextFieldErrors({
        type: TextFieldTypes.Email,
        value: examinerDetails.email,
        required: true,
      }),
      phoneNumber: InputFieldUtils.validateCustomTextFieldErrors({
        type: TextFieldTypes.PhoneNumber,
        value: examinerDetails.phoneNumber,
        required: false,
      }),
      municipalities:
        examinerDetails.municipalities &&
        examinerDetails.municipalities.length > 0
          ? ''
          : CustomTextFieldErrors.Required,
      examLanguages:
        examinerDetails.examLanguageFinnish ||
        examinerDetails.examLanguageSwedish
          ? ''
          : CustomTextFieldErrors.Required,
    };
  } else {
    return {
      email: '',
      phoneNumber: '',
      municipalities: '',
      examLanguages: '',
    };
  }
};

const useExaminerDetails = ():
  | ExaminerDetails
  | ExaminerDetailsInit
  | undefined => {
  const { examiner } = useAppSelector(examinerDetailsSelector);
  const { initData } = useAppSelector(examinerDetailsInitSelector);
  if (examiner) {
    return examiner;
  } else {
    return initData;
  }
};

const ExamLanguagesSelection = ({ label, error }: LabeledFieldProps) => {
  const translateCommon = useCommonTranslation();

  const legendErrorStyle = error ? { color: 'error.main' } : {};
  const { examinerDetails } = useAppSelector(examinerDetailsUpsertSelector);
  const dispatch = useAppDispatch();
  const toggleCheckbox =
    (fieldName: 'examLanguageFinnish' | 'examLanguageSwedish') =>
    (_event: ChangeEvent<HTMLInputElement>) => {
      dispatch(
        updateExaminerDetailsUpsert({
          [fieldName]: !examinerDetails[fieldName],
        }),
      );
    };

  return (
    <div className="rows examiner-details-page__exam-languages">
      <FormControl error={error}>
        <fieldset>
          <legend>
            <Text sx={legendErrorStyle}>
              <b>{label}</b>
            </Text>
          </legend>
          <FormGroup className="margin-left-sm" row={true}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!examinerDetails.examLanguageFinnish}
                  onChange={toggleCheckbox('examLanguageFinnish')}
                />
              }
              label={translateCommon(`examLanguage.${ExamLanguage.FI}`)}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={!!examinerDetails.examLanguageSwedish}
                  onChange={toggleCheckbox('examLanguageSwedish')}
                />
              }
              label={translateCommon(`examLanguage.${ExamLanguage.SV}`)}
            />
          </FormGroup>
        </fieldset>
      </FormControl>
    </div>
  );
};

const MunicipalitiesSelection = ({
  id,
  label,
  error,
  helperText,
}: LabeledFieldProps) => {
  const translateMunicipality = useKoodistoMunicipalitiesTranslation();
  const municipalityOptions = useMunicipalityOptions();
  const municipalityToOption = (municipality: string) => ({
    value: municipality,
    label: translateMunicipality(municipality),
  });
  const { examinerDetails } = useAppSelector(examinerDetailsUpsertSelector);
  const dispatch = useAppDispatch();
  const updateMunicipalities = useCallback(
    (_: SyntheticEvent, options: Array<ComboBoxOption>) => {
      dispatch(
        updateExaminerDetailsUpsert({
          municipalities: options.map((v) => ({
            code: v.value,
          })),
        }),
      );
    },
    [dispatch],
  );

  return (
    <div className="half-max-width examiner-details-page__municipalities">
      <LabeledMultipleCheckboxDropdown
        id={id}
        label={label}
        helperText={helperText}
        showError={error}
        variant={TextFieldVariant.Outlined}
        values={municipalityOptions}
        value={
          examinerDetails.municipalities
            ? examinerDetails.municipalities.map(({ code }) =>
                municipalityToOption(code),
              )
            : []
        }
        onChange={updateMunicipalities}
      />
    </div>
  );
};

const IsPublicSelection = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerDetails',
  });
  const translateCommon = useCommonTranslation();
  const { examinerDetails } = useAppSelector(examinerDetailsUpsertSelector);
  const dispatch = useAppDispatch();

  return (
    <div className="examiner-details-page__is-public">
      <fieldset>
        <legend>
          <Text>
            <b>{t('labels.isPublic')}</b>
          </Text>
        </legend>
        <div className="margin-left-lg">
          <CustomSwitch
            leftLabel={translateCommon('no')}
            rightLabel={translateCommon('yes')}
            value={examinerDetails.isPublic}
            onChange={(_, checked) => {
              dispatch(updateExaminerDetailsUpsert({ isPublic: checked }));
            }}
          />
        </div>
      </fieldset>
    </div>
  );
};

const ControlButtons = ({
  setShowErrors,
}: {
  setShowErrors: (v: boolean) => void;
}) => {
  const errors = useExaminerDetailsUpsertErrors(true);
  const hasErrors = !!Object.values(errors).find((errorMsg) =>
    StringUtils.isNonBlankString(errorMsg),
  );

  const translateCommon = useCommonTranslation();
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerDetails',
  });
  const { showDialog } = useDialog();
  const dispatch = useAppDispatch();
  const { status } = useAppSelector(examinerDetailsUpsertSelector);
  const knownExaminerDetails = useExaminerDetails();
  const navigate = useNavigate();

  const onSave = () => {
    if (hasErrors) {
      const dialogContent = (
        <div>
          <Text>{t('incorrectDetailsDialog.description')}</Text>
          <ul>
            {Object.entries(errors)
              .filter(([_, val]) => val)
              .map(([field, _]) => (
                <li key={field}>
                  <Text>{t(`labels.${field}`)}</Text>
                </li>
              ))}
          </ul>
        </div>
      );
      setShowErrors(true);
      showDialog({
        title: t('incorrectDetailsDialog.title'),
        severity: Severity.Error,
        content: dialogContent,
        actions: [
          { title: translateCommon('back'), variant: Variant.Contained },
        ],
      });
    } else {
      dispatch(startExaminerDetailsUpsert());
    }
  };

  const onCancel = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (examinerDetailsInitialized) {
      navigate(
        AppRoutes.ExaminerHomePage.replace(/:oid/, knownExaminerDetails.oid),
      );
    }
  };

  const isLoading = status === APIResponseStatus.InProgress;
  const examinerDetailsInitialized =
    knownExaminerDetails && isExaminerDetails(knownExaminerDetails);

  return (
    <div className="columns gapped-xl flex-end">
      {examinerDetailsInitialized && (
        <CustomButton
          color={Color.Secondary}
          disabled={status === APIResponseStatus.InProgress}
          onClick={onCancel}
        >
          {translateCommon('cancel')}
        </CustomButton>
      )}
      <LoadingProgressIndicator isLoading={isLoading}>
        <CustomButton
          variant={Variant.Contained}
          color={Color.Secondary}
          disabled={status === APIResponseStatus.InProgress}
          onClick={onSave}
        >
          {t('buttons.saveAndClose')}
        </CustomButton>
      </LoadingProgressIndicator>
    </div>
  );
};

const CreateOrUpdateExaminerDetails = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerDetails',
  });
  const translateCommon = useCommonTranslation();
  const [showErrors, setShowErrors] = useState(false);

  const knownExaminerDetails = useExaminerDetails();
  const { examinerDetails } = useAppSelector(examinerDetailsUpsertSelector);
  const dispatch = useAppDispatch();

  // Initialize upsertable data from known examiner details
  useEffect(() => {
    if (knownExaminerDetails) {
      if (isExaminerDetails(knownExaminerDetails)) {
        const {
          oid,
          email,
          phoneNumber,
          examLanguageFinnish,
          examLanguageSwedish,
          municipalities,
          isPublic,
        } = knownExaminerDetails;
        dispatch(
          updateExaminerDetailsUpsert({
            oid,
            email,
            phoneNumber,
            examLanguageFinnish,
            examLanguageSwedish,
            municipalities,
            isPublic,
          }),
        );
      } else {
        dispatch(
          updateExaminerDetailsUpsert({ oid: knownExaminerDetails.oid }),
        );
      }
    }
  }, [dispatch, knownExaminerDetails]);

  // Reset state on unmount
  useEffect(() => {
    return () => {
      dispatch(resetExaminerDetailsUpsert());
    };
  }, [dispatch]);

  const updateExaminerDetails = (
    fieldName: keyof Omit<ExaminerDetailsUpsert, 'id' | 'oid'>,
    value: string | boolean,
  ) => {
    dispatch(updateExaminerDetailsUpsert({ [fieldName]: value }));
  };

  const errors = useExaminerDetailsUpsertErrors(showErrors);

  const handleChange =
    (fieldName: 'email' | 'phoneNumber') =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      updateExaminerDetails(fieldName, event.target.value);
    };

  const handleBlur =
    (fieldName: 'email' | 'phoneNumber') =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      const trimmedValue = event.target.value ? event.target.value.trim() : '';
      if (fieldName === 'phoneNumber') {
        updateExaminerDetails(fieldName, trimmedValue.replace(/\s/g, ''));
      } else {
        updateExaminerDetails(fieldName, trimmedValue);
      }
    };

  const getLabeledFieldProps = (
    fieldName: keyof InputFieldValidation,
  ): LabeledFieldProps => {
    return {
      id: `examiner-details__${fieldName}`,
      label:
        t(`labels.${fieldName}`) + (fieldName === 'phoneNumber' ? '' : ' *'),
      error: showErrors && !!errors[fieldName],
      helperText: errors[fieldName] ? translateCommon(errors[fieldName]) : '',
    };
  };

  const getLabeledTextFieldAttributes = (
    fieldName: 'email' | 'phoneNumber',
  ) => {
    const type =
      fieldName === 'email' ? TextFieldTypes.Email : TextFieldTypes.PhoneNumber;
    const autoCompleteType =
      fieldName === 'email'
        ? InputAutoComplete.Email
        : InputAutoComplete.PhoneNumber;

    return {
      type,
      autoComplete: `work ${autoCompleteType}`,
      value: examinerDetails[fieldName] || '',
      onChange: handleChange(fieldName),
      onBlur: handleBlur(fieldName),
    };
  };

  return (
    <Paper elevation={3} className="examiner-details-page__details-view">
      <div className="rows gapped-xl">
        <ControlButtons setShowErrors={setShowErrors} />
        <H2>{t('personalDetails.heading')}</H2>
        <Text>{t('personalDetails.information')}</Text>
        <div className="grid-2-columns gapped-xl half-max-width">
          <div className="rows">
            <Text>
              <b>{t('labels.lastName')}</b>
            </Text>
            <Text>{knownExaminerDetails?.lastName}</Text>
          </div>
          <div className="rows">
            <Text>
              <b>{t('labels.firstName')}</b>
            </Text>
            <Text>{knownExaminerDetails?.firstName}</Text>
          </div>
          <LabeledTextField
            {...getLabeledFieldProps('email')}
            {...getLabeledTextFieldAttributes('email')}
          />
          <LabeledTextField
            {...getLabeledFieldProps('phoneNumber')}
            {...getLabeledTextFieldAttributes('phoneNumber')}
          />
        </div>
        <Divider />
        <H2>{t('examinationDetails.heading')}</H2>
        <Text>{t('examinationDetails.information')}</Text>
        <ExamLanguagesSelection {...getLabeledFieldProps('examLanguages')} />
        <MunicipalitiesSelection {...getLabeledFieldProps('municipalities')} />
        <IsPublicSelection />
      </div>
    </Paper>
  );
};

export const ExaminerDetailsPage = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerDetails',
  });
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const {
    oid,
    status: examinerDetailsStatus,
    initialized,
  } = useAppSelector(examinerDetailsSelector);
  const { status: initStatus } = useAppSelector(examinerDetailsInitSelector);
  const { status: examinerDetailsUpsertStatus } = useAppSelector(
    examinerDetailsUpsertSelector,
  );
  useEffect(() => {
    if (examinerDetailsStatus === APIResponseStatus.NotStarted && oid) {
      dispatch(loadExaminerDetails(oid));
    }
  }, [dispatch, examinerDetailsStatus, oid]);

  useEffect(() => {
    if (
      initialized === false &&
      initStatus === APIResponseStatus.NotStarted &&
      oid
    ) {
      dispatch(loadExaminerDetailsInit(oid));
    }
  });
  const examinerDetails = useExaminerDetails();

  const { showToast } = useToast();
  useEffect(() => {
    if (oid && examinerDetailsUpsertStatus === APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t('successToast.description'),
        timeOut: Duration.MediumExtra,
      });
      navigate(AppRoutes.ExaminerHomePage.replace(/:oid/, oid));
    }
  }, [examinerDetailsUpsertStatus, navigate, oid, showToast, t]);

  // TODO Perhaps navigation protection if dirty fields?
  return (
    <Box className="examiner-details-page">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="examiner-details-page__grid-container"
      >
        <Grid>
          <H1>{t('heading')}</H1>
        </Grid>
        <Grid>{examinerDetails && <CreateOrUpdateExaminerDetails />}</Grid>
      </Grid>
    </Box>
  );
};
