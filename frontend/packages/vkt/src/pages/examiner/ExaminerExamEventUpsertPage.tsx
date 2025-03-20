import { ArrowBackIosOutlined as ArrowBackIosOutlinedIcon } from '@mui/icons-material';
import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  Grid,
  Paper,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  CustomButton,
  CustomButtonLink,
  CustomDatePicker,
  CustomSwitch,
  CustomTextField,
  H1,
  H2,
  LabeledComboBox,
  LabeledTextField,
  LoadingProgressIndicator,
  sortOptionsByLabels,
  Text,
} from 'shared/components';
import {
  APIResponseStatus,
  Color,
  CustomTextFieldErrors,
  InputAutoComplete,
  Severity,
  TextFieldTypes,
  TextFieldVariant,
  Variant,
} from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';
import { DateUtils, StringUtils } from 'shared/utils';

import {
  useCommonTranslation,
  useExaminerTranslation,
  useKoodistoMunicipalitiesTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, ExamLanguage } from 'enums/app';
import { loadExaminerDetails } from 'redux/reducers/examinerDetails';
import { loadExaminerExamEventOverview } from 'redux/reducers/examinerExamEventOverview';
import {
  resetExaminerExamEventUpsert,
  startExaminerExamEventUpsert,
  updateExaminerExamEventUpsert,
} from 'redux/reducers/examinerExamEventUpsert';
import { examinerDetailsSelector } from 'redux/selectors/examinerDetails';
import { examinerExamEventOverviewSelector } from 'redux/selectors/examinerExamEventOverview';
import { examinerExamEventUpsertSelector } from 'redux/selectors/examinerExamEventUpsert';
import { ExamCreateEventUtils } from 'utils/examCreateEvent';
import { municipalityToOption } from 'utils/municipality';

const BackButton = () => {
  const translateCommon = useCommonTranslation();
  const { examiner } = useAppSelector(examinerDetailsSelector);

  return (
    <CustomButtonLink
      to={AppRoutes.ExaminerHomePage.replace(/:oid/, examiner?.oid || '')}
      variant={Variant.Text}
      startIcon={<ArrowBackIosOutlinedIcon />}
      className="color-secondary-dark"
    >
      {translateCommon('back')}
    </CustomButtonLink>
  );
};

interface InputFieldValidation {
  language: string;
  municipality: string;
  date: string;
  maxParticipants: string;
}

const useExaminerExamEventUpsertErrors = (
  showErrors: boolean,
): InputFieldValidation => {
  const { examEvent } = useAppSelector(examinerExamEventUpsertSelector);
  if (showErrors) {
    return {
      language: examEvent.language ? '' : CustomTextFieldErrors.Required,
      municipality: examEvent.municipality
        ? ''
        : CustomTextFieldErrors.Required,
      date: examEvent.date ? '' : CustomTextFieldErrors.Required,
      maxParticipants: ExamCreateEventUtils.maxParticipantsHasError(
        examEvent.maxParticipants !== undefined,
        examEvent.maxParticipants,
      )
        ? 'errors.customTextField.numberFormat'
        : '',
    };
  } else {
    return {
      language: '',
      municipality: '',
      date: '',
      maxParticipants: '',
    };
  }
};

type SaveButtonProps = {
  disabled: boolean;
  setShowErrors: (v: boolean) => void;
};

const SaveButton = ({ disabled, setShowErrors }: SaveButtonProps) => {
  const errors = useExaminerExamEventUpsertErrors(true);
  const hasErrors = !!Object.values(errors).find((errorMsg) =>
    StringUtils.isNonBlankString(errorMsg),
  );
  const { status } = useAppSelector(examinerExamEventUpsertSelector);
  const translateCommon = useCommonTranslation();
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventUpsert',
  });
  const { showDialog } = useDialog();
  const dispatch = useAppDispatch();

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
      dispatch(startExaminerExamEventUpsert());
    }
  };

  const isLoading = status === APIResponseStatus.InProgress;

  return (
    <LoadingProgressIndicator isLoading={isLoading}>
      <CustomButton
        variant={Variant.Contained}
        color={Color.Secondary}
        disabled={disabled}
        onClick={onSave}
      >
        {translateCommon('save')}
      </CustomButton>
    </LoadingProgressIndicator>
  );
};

const SelectIsPublic = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventUpsert',
  });
  const translateCommon = useCommonTranslation();
  const { isHidden } = useAppSelector(
    examinerExamEventUpsertSelector,
  ).examEvent;
  const dispatch = useAppDispatch();

  return (
    <div className="examiner-exam-event-page__is-public">
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
            value={!isHidden}
            onChange={(_, checked) => {
              dispatch(updateExaminerExamEventUpsert({ isHidden: !checked }));
            }}
          />
        </div>
      </fieldset>
    </div>
  );
};

const SelectLanguage = ({ showErrors }: { showErrors: boolean }) => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventUpsert',
  });
  const translateCommon = useCommonTranslation();
  const { language } = useAppSelector(
    examinerExamEventUpsertSelector,
  ).examEvent;
  const dispatch = useAppDispatch();

  const hasRadioButtonError = showErrors && !language;

  return (
    <FormControl component="fieldset">
      <div className="rows gapped-sm">
        <FormLabel component="legend">
          <Text className={hasRadioButtonError ? 'error-label' : undefined}>
            <b>{`${t('labels.language')} *`}</b>
          </Text>
        </FormLabel>
        <RadioGroup
          name="examiner-exam-event-upsert__exam-language--radio-group"
          value={language || ''}
          onChange={(_, v) => {
            dispatch(
              updateExaminerExamEventUpsert({
                language: v as Exclude<ExamLanguage, ExamLanguage.ALL>,
              }),
            );
          }}
        >
          <div className="columns gapped">
            <FormControlLabel
              value={ExamLanguage.FI}
              control={
                <Radio aria-describedby="examiner-exam-event-upsert__exam-language--error" />
              }
              label={translateCommon(`examLanguage.${ExamLanguage.FI}`)}
              checked={language === ExamLanguage.FI}
              className={`margin-left-sm ${
                hasRadioButtonError && 'checkbox-error'
              }`}
            />
            <FormControlLabel
              value={ExamLanguage.SV}
              control={
                <Radio aria-describedby="examiner-exam-event-upsert__exam-language--error" />
              }
              label={translateCommon(`examLanguage.${ExamLanguage.SV}`)}
              checked={language === ExamLanguage.SV}
              className={`margin-left-sm ${
                hasRadioButtonError && 'checkbox-error'
              }`}
            />
          </div>
        </RadioGroup>
        {hasRadioButtonError && (
          <FormHelperText
            id="examiner-exam-event-upsert__exam-language--error"
            error={true}
          >
            {translateCommon('errors.customTextField.required')}
          </FormHelperText>
        )}
      </div>
    </FormControl>
  );
};

const SelectMunicipality = ({ showErrors }: { showErrors: boolean }) => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventUpsert',
  });
  const translateCommon = useCommonTranslation();
  const translateMunicipality = useKoodistoMunicipalitiesTranslation();
  const { examiner } = useAppSelector(examinerDetailsSelector);
  const { municipality } = useAppSelector(
    examinerExamEventUpsertSelector,
  ).examEvent;
  const dispatch = useAppDispatch();
  if (!examiner) {
    return null;
  }

  return (
    <div className="examiner-exam-event-page__select-municipality">
      <LabeledComboBox
        id="examiner-exam-event-upsert__exam-municipality"
        label={`${t('labels.municipality')} *`}
        helperText={translateCommon(CustomTextFieldErrors.Required)}
        showError={showErrors && !municipality}
        variant={TextFieldVariant.Outlined}
        value={
          municipality
            ? municipalityToOption(municipality, translateMunicipality)
            : null
        }
        values={sortOptionsByLabels(
          examiner.municipalities.map((v) =>
            municipalityToOption(v, translateMunicipality),
          ),
        )}
        onChange={(v) => {
          dispatch(
            updateExaminerExamEventUpsert({
              municipality: v ? { code: v } : undefined,
            }),
          );
        }}
      />
    </div>
  );
};

const SelectDate = ({ showErrors }: { showErrors: boolean }) => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventUpsert',
  });
  const translateCommon = useCommonTranslation();
  const { date } = useAppSelector(examinerExamEventUpsertSelector).examEvent;
  const dispatch = useAppDispatch();
  const error = showErrors && !date;

  return (
    <div className="rows gapped-sm examiner-exam-event-page__select-exam-date">
      <Typography
        component="label"
        variant="h3"
        className={error ? 'error-label' : ''}
        htmlFor="examiner-exam-event-upsert__exam-date"
      >
        {`${t('labels.date')} *`}
      </Typography>
      <CustomDatePicker
        id="examiner-exam-event-upsert__exam-date"
        error={error}
        minDate={dayjs()}
        setValue={(v) => {
          dispatch(updateExaminerExamEventUpsert({ date: v || undefined }));
        }}
        label={translateCommon('choose')}
        value={date || null}
        showHelperText={error}
        helperText={error && translateCommon(CustomTextFieldErrors.Required)}
      />
    </div>
  );
};

const ExamTime = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventUpsert',
  });
  const { examTime } = useAppSelector(
    examinerExamEventUpsertSelector,
  ).examEvent;
  const dispatch = useAppDispatch();

  return (
    <LabeledTextField
      id="examiner-exam-event-upsert__exam-time"
      className="rows gapped-sm"
      label={t('labels.examTime')}
      type="time"
      value={examTime || ''}
      onChange={(event) => {
        const input = event.target.value;
        if (DateUtils.parseTimeString(input)) {
          dispatch(updateExaminerExamEventUpsert({ examTime: input }));
        } else {
          dispatch(updateExaminerExamEventUpsert({ examTime: undefined }));
        }
      }}
    />
  );
};

const AddressDetails = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventUpsert',
  });
  const { location } = useAppSelector(
    examinerExamEventUpsertSelector,
  ).examEvent;
  const dispatch = useAppDispatch();

  return (
    <LabeledTextField
      id="examiner-exam-event-upsert__address-details"
      className="rows gapped-sm"
      label={t('labels.addressDetails')}
      value={location || ''}
      autoComplete={`work ${InputAutoComplete.Street}`}
      onChange={(event) => {
        dispatch(
          updateExaminerExamEventUpsert({
            location: event.target.value,
          }),
        );
      }}
    />
  );
};

const OtherInformation = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventUpsert',
  });
  const { otherInformation } = useAppSelector(
    examinerExamEventUpsertSelector,
  ).examEvent;
  const dispatch = useAppDispatch();

  return (
    <LabeledTextField
      id="examiner-exam-event-upsert__other-details"
      className="rows gapped-sm"
      label={t('labels.otherInformation')}
      value={otherInformation || ''}
      onChange={(event) => {
        dispatch(
          updateExaminerExamEventUpsert({
            otherInformation: event.target.value,
          }),
        );
      }}
    />
  );
};

const SelectRegistrationClosingDate = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventUpsert',
  });
  const translateCommon = useCommonTranslation();
  const { registrationCloses } = useAppSelector(
    examinerExamEventUpsertSelector,
  ).examEvent;
  const dispatch = useAppDispatch();

  return (
    <div className="rows gapped-sm">
      <Typography
        component="label"
        variant="h3"
        htmlFor="examiner-exam-event-upsert__registration-closes"
      >
        {t('labels.registrationCloses')}
      </Typography>
      <CustomDatePicker
        id="examiner-exam-event-upsert__registration-closes"
        minDate={dayjs()}
        setValue={(v) => {
          dispatch(
            updateExaminerExamEventUpsert({
              registrationCloses: v || undefined,
            }),
          );
        }}
        label={translateCommon('choose')}
        value={registrationCloses || null}
      />
    </div>
  );
};

const SelectMaxParticipants = ({ showErrors }: { showErrors: boolean }) => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventUpsert',
  });
  const translateCommon = useCommonTranslation();
  const { maxParticipants } = useAppSelector(
    examinerExamEventUpsertSelector,
  ).examEvent;
  const dispatch = useAppDispatch();
  const maxParticipantsError = ExamCreateEventUtils.maxParticipantsHasError(
    showErrors && maxParticipants !== undefined,
    maxParticipants,
  );

  return (
    <div className="rows gapped-sm">
      <Typography
        component="label"
        variant="h3"
        className={maxParticipantsError ? 'error-label' : ''}
        htmlFor="examiner-exam-event-upsert__max-participants"
      >
        {t('labels.maxParticipants')}
      </Typography>
      <CustomTextField
        id="examiner-exam-event-upsert__max-participants"
        className="clerk-exam-upsert-max-participants"
        label={translateCommon('choose')}
        type={TextFieldTypes.Number}
        value={maxParticipants ?? ''}
        error={maxParticipantsError}
        showHelperText={maxParticipantsError}
        helperText={
          maxParticipantsError
            ? translateCommon('errors.customTextField.numberFormat')
            : ''
        }
        variant={TextFieldVariant.Outlined}
        onChange={(event) => {
          const value = Number(event.target.value);
          dispatch(
            updateExaminerExamEventUpsert({
              maxParticipants:
                isNaN(value) || event.target.value === '' ? undefined : value,
            }),
          );
        }}
      />
    </div>
  );
};

interface PageProps {
  isUpdatePage: boolean;
}

export const ExaminerExamEventUpsertPage: FC<PageProps> = ({
  isUpdatePage,
}) => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventUpsert',
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const { status, examEvent } = useAppSelector(examinerExamEventUpsertSelector);
  const { overviewStatus, examEvent: examEventOverview } = useAppSelector(
    examinerExamEventOverviewSelector,
  );

  const { oid, status: examinerStatus } = useAppSelector(
    examinerDetailsSelector,
  );
  useEffect(() => {
    if (examinerStatus === APIResponseStatus.NotStarted && oid) {
      dispatch(loadExaminerDetails(oid));
    }
  });

  const params = useParams();
  useEffect(() => {
    // If current route matches AppRoutes.ExaminerExamEventUpdatePage,
    // populate upsert field data with pre-existing exam event data
    if (isUpdatePage && params.oid && params.examEventId) {
      const { oid } = params;
      const examEventId = parseInt(params.examEventId);
      if (
        overviewStatus === APIResponseStatus.NotStarted ||
        examEventOverview?.id !== examEventId
      ) {
        dispatch(
          loadExaminerExamEventOverview({
            oid,
            examEventId,
          }),
        );
      } else if (
        overviewStatus === APIResponseStatus.Success &&
        examEventOverview?.id === examEventId
      ) {
        const {
          version: _version,
          enrollments: _enrollments,
          ...rest
        } = examEventOverview;
        dispatch(updateExaminerExamEventUpsert({ ...rest }));
      }
    }
  }, [dispatch, isUpdatePage, examEventOverview, overviewStatus, params]);

  useEffect(() => {
    if (status === APIResponseStatus.Success && oid && examEvent.id) {
      showToast({
        severity: Severity.Success,
        description: t(
          isUpdatePage ? 'toasts.updatingSucceeded' : 'toasts.addingSucceeded',
        ),
      });
      navigate(
        AppRoutes.ExaminerExamEventPage.replace(/:oid/, oid).replace(
          /:examEventId/,
          `${examEvent.id}`,
        ),
      );
      dispatch(resetExaminerExamEventUpsert());
    }
  }, [
    showToast,
    t,
    status,
    navigate,
    oid,
    examEvent.id,
    dispatch,
    isUpdatePage,
  ]);

  const [showErrors, setShowErrors] = useState(false);
  const isLoading = status === APIResponseStatus.InProgress;
  const isSavingDisabled = isLoading;

  // Reset state on unmount
  useEffect(() => {
    return () => {
      dispatch(resetExaminerExamEventUpsert());
    };
  }, [dispatch]);

  return (
    <Box className="examiner-exam-event-page">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="examiner-exam-event-page__grid-container"
      >
        <Grid item>
          <H1>{t(isUpdatePage ? 'heading.update' : 'heading.create')}</H1>
        </Grid>
        <Grid item>
          <Paper elevation={3} className="examiner-exam-event-page__contents">
            <div className="rows gapped">
              <BackButton />
              {!isUpdatePage && <Text>{t('description.create.part1')}</Text>}
              <SelectIsPublic />
            </div>
            <div className="rows gapped">
              <H2>{t('sections.publicInformation')}</H2>
              <div className="grid-3-columns gapped">
                <SelectLanguage showErrors={showErrors} />
                <SelectMunicipality showErrors={showErrors} />
                <SelectDate showErrors={showErrors} />
              </div>
            </div>
            <div className="rows gapped">
              <H2>{t('sections.other')}</H2>
              <div className="grid-3-columns gapped">
                <SelectMaxParticipants showErrors={showErrors} />
                <SelectRegistrationClosingDate />
              </div>
            </div>
            <div className="rows gapped">
              <H2>{t('sections.furtherInformation')}</H2>
              <div className="grid-3-columns gapped">
                <ExamTime />
                <AddressDetails />
                <OtherInformation />
              </div>
            </div>
            <div className="columns flex-end">
              <LoadingProgressIndicator isLoading={isLoading}>
                <SaveButton
                  disabled={isSavingDisabled}
                  setShowErrors={setShowErrors}
                />
              </LoadingProgressIndicator>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
