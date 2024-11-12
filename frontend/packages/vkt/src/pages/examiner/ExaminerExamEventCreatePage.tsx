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
import dayjs, { Dayjs } from 'dayjs';
import { FC, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
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
  Severity,
  TextFieldTypes,
  TextFieldVariant,
  Variant,
} from 'shared/enums';
import { useToast } from 'shared/hooks';
import { ComboBoxOption } from 'shared/interfaces';

import {
  useCommonTranslation,
  useExaminerTranslation,
  useKoodistoMunicipalitiesTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, ExamLanguage } from 'enums/app';
import { resetClerkNewExamDate } from 'redux/reducers/clerkNewExamDate';
import { loadExaminerDetails } from 'redux/reducers/examinerDetails';
import { clerkNewExamDateSelector } from 'redux/selectors/clerkNewExamDate';
import { examinerDetailsSelector } from 'redux/selectors/examinerDetails';
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

type SaveButtonProps = {
  disabled: boolean;
  onSave: () => void;
};
const SaveButton = ({ disabled, onSave }: SaveButtonProps) => {
  const translateCommon = useCommonTranslation();

  return (
    <CustomButton
      variant={Variant.Contained}
      color={Color.Secondary}
      disabled={disabled}
      onClick={onSave}
    >
      {translateCommon('save')}
    </CustomButton>
  );
};

const SelectIsPublic = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventCreate',
  });
  const translateCommon = useCommonTranslation();
  const [isPublic, setIsPublic] = useState(false);

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
            value={isPublic}
            onChange={(_, checked) => {
              setIsPublic(checked);
            }}
          />
        </div>
      </fieldset>
    </div>
  );
};

const SelectLanguage = ({ showErrors }: { showErrors: boolean }) => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventCreate',
  });
  const translateCommon = useCommonTranslation();
  const [examLanguage, setExamLanguage] = useState<ExamLanguage | ''>('');
  const hasRadioButtonError = showErrors && examLanguage === '';

  return (
    <FormControl component="fieldset">
      <div className="rows gapped-sm">
        <FormLabel component="legend" className="heading-label">
          {t('labels.examLanguage')}
        </FormLabel>
        <RadioGroup
          name="examiner-exam-event-create__exam-language--radio-group"
          value={examLanguage}
          onChange={(_, v) => {
            setExamLanguage(v as ExamLanguage);
          }}
        >
          <div className="columns gapped">
            <FormControlLabel
              value={ExamLanguage.FI}
              control={
                <Radio aria-describedby="examiner-exam-event-create__exam-language--error" />
              }
              label={translateCommon(`examLanguage.${ExamLanguage.FI}`)}
              checked={examLanguage === ExamLanguage.FI}
              className={`margin-left-sm ${
                hasRadioButtonError && 'checkbox-error'
              }`}
            />
            <FormControlLabel
              value={ExamLanguage.SV}
              control={
                <Radio aria-describedby="examiner-exam-event-create__exam-language--error" />
              }
              label={translateCommon(`examLanguage.${ExamLanguage.SV}`)}
              checked={examLanguage === ExamLanguage.SV}
              className={`margin-left-sm ${
                hasRadioButtonError && 'checkbox-error'
              }`}
            />
          </div>
        </RadioGroup>
        {hasRadioButtonError && (
          <FormHelperText
            id="examiner-exam-event-create__exam-language--error"
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
    keyPrefix: 'vkt.component.examinerExamEventCreate',
  });
  const translateCommon = useCommonTranslation();
  const translateMunicipality = useKoodistoMunicipalitiesTranslation();
  const { examiner } = useAppSelector(examinerDetailsSelector);
  const [municipality, setMunicipality] = useState<ComboBoxOption | null>(null);
  if (!examiner) {
    return null;
  }

  return (
    <div className="examiner-exam-event-page__select-municipality">
      <LabeledComboBox
        id="examiner-exam-event-create__exam-location"
        label={t('labels.examLocation')}
        helperText={translateCommon(CustomTextFieldErrors.Required)}
        showError={showErrors && !municipality}
        variant={TextFieldVariant.Outlined}
        value={municipality}
        values={sortOptionsByLabels(
          examiner.municipalities.map((v) =>
            municipalityToOption(v, translateMunicipality),
          ),
        )}
        onChange={(v) => {
          setMunicipality(
            v ? municipalityToOption({ code: v }, translateMunicipality) : null,
          );
        }}
      />
    </div>
  );
};

const SelectDate = ({ showErrors }: { showErrors: boolean }) => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventCreate',
  });
  const translateCommon = useCommonTranslation();
  const [examDate, setExamDate] = useState<Dayjs | null>(null);

  return (
    <div className="rows gapped-sm">
      <Typography
        component="label"
        variant="h3"
        htmlFor="examiner-exam-event-create__exam-date"
      >
        {t('labels.examDate')}
      </Typography>
      <CustomDatePicker
        id="examiner-exam-event-create__exam-date"
        error={showErrors && !examDate}
        minDate={dayjs()}
        setValue={setExamDate}
        label={translateCommon('choose')}
        value={examDate}
      />
    </div>
  );
};

const ExamTime = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventCreate',
  });

  return (
    <LabeledTextField
      id="examiner-exam-event-create__exam-time"
      className="rows gapped-sm"
      label={t('labels.examTime')}
    />
  );
};

const AddressDetails = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventCreate',
  });

  return (
    <LabeledTextField
      id="examiner-exam-event-create__address-details"
      className="rows gapped-sm"
      label={t('labels.addressDetails')}
    />
  );
};

const OtherDetails = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventCreate',
  });

  return (
    <LabeledTextField
      id="examiner-exam-event-create__other-details"
      className="rows gapped-sm"
      label={t('labels.otherDetails')}
    />
  );
};

const SelectRegistrationClosingDate = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventCreate',
  });
  const translateCommon = useCommonTranslation();
  const [registrationCloses, setRegistrationCloses] = useState<Dayjs | null>(
    null,
  );

  return (
    <div className="rows gapped-sm">
      <Typography
        component="label"
        variant="h3"
        htmlFor="examiner-exam-event-create__registration-closes"
      >
        {t('labels.registrationCloses')}
      </Typography>
      <CustomDatePicker
        id="examiner-exam-event-create__registration-closes"
        minDate={dayjs()}
        setValue={setRegistrationCloses}
        label={translateCommon('choose')}
        value={registrationCloses}
      />
    </div>
  );
};

const SelectMaxParticipants = ({ showErrors }: { showErrors: boolean }) => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventCreate',
  });
  const translateCommon = useCommonTranslation();
  const [maxParticipants, setMaxParticipants] = useState<number | undefined>(
    undefined,
  );

  const getErrorText = (value: number | undefined): string => {
    return value === undefined
      ? translateCommon('errors.customTextField.required')
      : translateCommon('errors.customTextField.numberFormat');
  };
  const maxParticipantsError = ExamCreateEventUtils.maxParticipantsHasError(
    showErrors,
    maxParticipants,
  );

  return (
    <div className="rows gapped-sm">
      <Typography
        component="label"
        variant="h3"
        htmlFor="examiner-exam-event-create__max-participants"
      >
        {t('labels.maxParticipants')}
      </Typography>
      <CustomTextField
        id="examiner-exam-event-create__max-participants"
        className="clerk-exam-create-max-participants"
        label={translateCommon('choose')}
        type={TextFieldTypes.Number}
        value={maxParticipants ?? ''}
        error={maxParticipantsError}
        showHelperText={maxParticipantsError}
        helperText={getErrorText(maxParticipants)}
        variant={TextFieldVariant.Outlined}
        onChange={(event) => {
          const value = Number(event.target.value);
          setMaxParticipants(
            isNaN(value) || event.target.value === '' ? undefined : value,
          );
        }}
      />
    </div>
  );
};

export const ExaminerExamEventCreatePage: FC = () => {
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerExamEventCreate',
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showToast } = useToast();

  // TODO Listen to actual examiner exam event create status
  const { status, id } = useAppSelector(clerkNewExamDateSelector);
  useEffect(() => {
    if (status === APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t('toasts.addingSucceeded'),
      });
      navigate(
        AppRoutes.ClerkExamEventOverviewPage.replace(/:examEventId/, `${id}`),
      );
      dispatch(resetClerkNewExamDate());
    }
  }, [showToast, t, status, navigate, id, dispatch]);

  const { oid, status: examinerStatus } = useAppSelector(
    examinerDetailsSelector,
  );
  useEffect(() => {
    if (examinerStatus === APIResponseStatus.NotStarted && oid) {
      dispatch(loadExaminerDetails(oid));
    }
  });
  const [showErrors, setShowErrors] = useState(false);
  const isLoading = status === APIResponseStatus.InProgress;
  const isSavingDisabled = isLoading;

  const onSave = () => {
    // eslint-disable-next-line no-console
    console.log('Tallennetaan...');
    setShowErrors(true);
  };

  // TODO Toggle form error status on submit

  return (
    <Box className="examiner-exam-event-page">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="examiner-exam-event-page__grid-container"
      >
        <Grid item>
          <H1>{t('heading')}</H1>
        </Grid>
        <Grid item>
          <Paper elevation={3} className="examiner-exam-event-page__contents">
            <div className="rows gapped">
              <BackButton />
              <Text>
                {t('description.part1')}
                <br />
                {t('description.part2')}
              </Text>
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
              <H2>{t('sections.confirmationEmail')}</H2>
              <div className="grid-3-columns gapped">
                <ExamTime />
                <AddressDetails />
                <OtherDetails />
              </div>
            </div>
            <div className="rows gapped">
              <H2>{t('sections.other')}</H2>
              <div className="grid-3-columns gapped">
                <SelectMaxParticipants showErrors={showErrors} />
                <SelectRegistrationClosingDate />
              </div>
            </div>
            <div className="columns flex-end">
              <LoadingProgressIndicator isLoading={isLoading}>
                <SaveButton disabled={isSavingDisabled} onSave={onSave} />
              </LoadingProgressIndicator>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
