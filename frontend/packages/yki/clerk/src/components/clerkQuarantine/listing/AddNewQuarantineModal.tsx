import CloseIcon from '@mui/icons-material/Close';
import {
  Box,
  FormControl,
  FormControlLabel,
  FormHelperText,
  Radio,
  RadioGroup,
  TextField,
  Typography,
} from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { Dayjs } from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CustomDatePicker, CustomModal } from 'shared/components';
import {
  APIResponseStatus,
  Color,
  CustomTextFieldErrors,
  TextFieldTypes,
  Variant,
} from 'shared/enums';
import { InputFieldUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { H2, H3, Label } from 'ophTheme/Text';
import {
  createClerkQuarantine,
  resetCreateClerkQuarantineStatus,
} from 'redux/reducers/clerkQuarantine';
import { clerkQuarantineSelector } from 'redux/selectors/clerkQuarantine';
import { LANGUAGES } from 'utils/clerk';

type QuarantineField =
  | 'firstName'
  | 'lastName'
  | 'birthdate'
  | 'ssn'
  | 'email'
  | 'phoneNumber'
  | 'examLanguage'
  | 'startsAt'
  | 'endsAt'
  | 'caseNumber';

type FormErrors = Partial<Record<QuarantineField, string>>;

type AddNewQuarantineModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export const AddNewQuarantineModal = ({
  isOpen,
  onClose,
}: AddNewQuarantineModalProps) => {
  const dispatch = useAppDispatch();
  const { createStatus } = useAppSelector(clerkQuarantineSelector);
  const prevCreateStatus = useRef(createStatus);
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkQuarantine.activeQuarantines.modal',
  });
  const translateCommon = useCommonTranslation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthdate, setBirthdate] = useState<Dayjs | null>(null);
  const [ssn, setSsn] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [examLanguage, setExamLanguage] = useState('');
  const [startsAt, setStartsAt] = useState<Dayjs | null>(null);
  const [endsAt, setEndsAt] = useState<Dayjs | null>(null);
  const [caseNumber, setCaseNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo<FormErrors>(() => {
    const result: FormErrors = {};

    if (!firstName.trim()) {
      result.firstName = translateCommon(CustomTextFieldErrors.Required);
    }
    if (!lastName.trim()) {
      result.lastName = translateCommon(CustomTextFieldErrors.Required);
    }
    if (birthdate !== null && !birthdate.isValid()) {
      result.birthdate = translateCommon(CustomTextFieldErrors.DateFormat);
    }
    if (!birthdate?.isValid() && !ssn.trim()) {
      result.ssn = t('errors.birthdateOrSsnRequired');
    }

    const emailError = InputFieldUtils.validateCustomTextFieldErrors({
      type: TextFieldTypes.Email,
      value: email,
      required: true,
    });
    if (emailError) {
      result.email = translateCommon(emailError);
    }

    const phoneError = InputFieldUtils.validateCustomTextFieldErrors({
      type: TextFieldTypes.PhoneNumber,
      value: phoneNumber,
      required: true,
    });
    if (phoneError) {
      result.phoneNumber = translateCommon(phoneError);
    }

    if (!examLanguage) {
      result.examLanguage = translateCommon(CustomTextFieldErrors.Required);
    }
    if (!startsAt?.isValid()) {
      result.startsAt = translateCommon(CustomTextFieldErrors.Required);
    }
    if (!endsAt?.isValid()) {
      result.endsAt = translateCommon(CustomTextFieldErrors.Required);
    } else if (startsAt?.isValid() && !startsAt.isBefore(endsAt, 'day')) {
      result.endsAt = t('errors.startDateAfterEndDate');
    }
    if (!caseNumber.trim()) {
      result.caseNumber = translateCommon(CustomTextFieldErrors.Required);
    }

    return result;
  }, [
    firstName,
    lastName,
    birthdate,
    ssn,
    email,
    phoneNumber,
    examLanguage,
    startsAt,
    endsAt,
    caseNumber,
    t,
    translateCommon,
  ]);

  const resetFields = () => {
    setFirstName('');
    setLastName('');
    setBirthdate(null);
    setSsn('');
    setEmail('');
    setPhoneNumber('');
    setExamLanguage('');
    setStartsAt(null);
    setEndsAt(null);
    setCaseNumber('');
    setSubmitted(false);
  };

  const handleClose = () => {
    resetFields();
    dispatch(resetCreateClerkQuarantineStatus());
    onClose();
  };

  useEffect(() => {
    if (
      prevCreateStatus.current === APIResponseStatus.InProgress &&
      createStatus === APIResponseStatus.Success
    ) {
      resetFields();
      onClose();
      dispatch(resetCreateClerkQuarantineStatus());
    }
    prevCreateStatus.current = createStatus;
  }, [createStatus, onClose, dispatch]);

  const handleSubmit = () => {
    setSubmitted(true);

    if (Object.keys(errors).length > 0 || !startsAt || !endsAt) {
      return;
    }

    dispatch(
      createClerkQuarantine({
        firstName,
        lastName,
        ...(birthdate && { birthdate: birthdate.format('YYYY-MM-DD') }),
        ...(ssn && { ssn }),
        email,
        phoneNumber,
        languageCode: examLanguage,
        startDate: startsAt.format('YYYY-MM-DD'),
        endDate: endsAt.format('YYYY-MM-DD'),
        diaryNumber: caseNumber,
      }),
    );
  };

  const isSubmitting = createStatus === APIResponseStatus.InProgress;

  return (
    <CustomModal
      open={isOpen}
      onCloseModal={handleClose}
      aria-labelledby="add-new-quarantine-modal-title"
      modalTitle={
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >
          <H2>{t('title')}</H2>
          <div style={{ cursor: 'pointer' }}>
            <CloseIcon
              color={Color.Inherit}
              aria-hidden={true}
              fontSize="large"
              onClick={handleClose}
            />
          </div>
        </Box>
      }
    >
      <div
        data-testid="add-quarantine-modal"
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 200px)',
          width: '50vw',
          maxWidth: '700px',
          gap: '2rem',
        }}
      >
        <div
          style={{ overflowY: 'auto', flex: '1 1 auto', paddingRight: '8px' }}
        >
          <div className="rows gapped">
            <H3>{t('subHeaders.personInfo')}</H3>

            <div className="columns gapped">
              <div
                data-testid="add-quarantine-first-name"
                className="rows gapped-xxs"
                style={{ width: '180px', flexShrink: 0 }}
              >
                <Label>{t('fields.firstName')} *</Label>
                <TextField
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  error={submitted && !!errors.firstName}
                  helperText={submitted ? errors.firstName : undefined}
                  fullWidth
                />
              </div>
              <div
                data-testid="add-quarantine-last-name"
                className="rows gapped-xxs"
                style={{ flex: 1 }}
              >
                <Label>{t('fields.lastName')} *</Label>
                <TextField
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  error={submitted && !!errors.lastName}
                  helperText={submitted ? errors.lastName : undefined}
                  fullWidth
                />
              </div>
            </div>

            <div className="columns gapped">
              <div
                data-testid="add-quarantine-birthdate"
                className="rows gapped-xxs"
                style={{ width: '180px', flexShrink: 0 }}
              >
                <Label>{t('fields.birthdate')}</Label>
                <CustomDatePicker
                  value={birthdate}
                  setValue={setBirthdate}
                  error={submitted && !!errors.birthdate}
                  helperText={submitted ? errors.birthdate : undefined}
                />
              </div>
            </div>

            <div className="columns gapped">
              <div
                data-testid="add-quarantine-ssn"
                className="rows gapped-xxs"
                style={{ width: '180px', flexShrink: 0 }}
              >
                <Label>{t('fields.ssn')}</Label>
                <TextField
                  value={ssn}
                  onChange={(e) => setSsn(e.target.value)}
                  error={submitted && !!errors.ssn}
                  helperText={submitted ? errors.ssn : undefined}
                  fullWidth
                />
              </div>
            </div>

            <div data-testid="add-quarantine-email" className="rows gapped-xxs">
              <Label>{t('fields.email')} *</Label>
              <TextField
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                error={submitted && !!errors.email}
                helperText={submitted ? errors.email : undefined}
                fullWidth
              />
            </div>

            <div data-testid="add-quarantine-phone" className="rows gapped-xxs">
              <Label>{t('fields.phoneNumber')} *</Label>
              <TextField
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                type="tel"
                error={submitted && !!errors.phoneNumber}
                helperText={submitted ? errors.phoneNumber : undefined}
                fullWidth
              />
            </div>

            <H3>{t('subHeaders.generalInfo')}</H3>

            <FormControl
              className="rows gapped-xxs"
              error={submitted && !!errors.examLanguage}
            >
              <Label>{t('fields.examLanguage')} *</Label>
              <RadioGroup
                value={examLanguage}
                onChange={(e) => setExamLanguage(e.target.value)}
              >
                {LANGUAGES.map((lang) => (
                  <FormControlLabel
                    key={lang.code}
                    value={lang.code}
                    control={<Radio />}
                    label={lang.name}
                  />
                ))}
              </RadioGroup>
              {submitted && errors.examLanguage && (
                <FormHelperText>{errors.examLanguage}</FormHelperText>
              )}
            </FormControl>

            <div className="columns gapped" style={{ alignItems: 'flex-end' }}>
              <div
                data-testid="add-quarantine-start-date"
                className="rows gapped-xxs"
                style={{ width: '180px', flexShrink: 0 }}
              >
                <Label>{t('fields.startsAt')} *</Label>
                <CustomDatePicker
                  value={startsAt}
                  setValue={setStartsAt}
                  error={submitted && !!errors.startsAt}
                  helperText={submitted ? errors.startsAt : undefined}
                />
              </div>
              <Typography style={{ paddingBottom: '8px' }}>—</Typography>
              <div
                data-testid="add-quarantine-end-date"
                className="rows gapped-xxs"
                style={{ flex: 1 }}
              >
                <Label>{t('fields.endsAt')} *</Label>
                <CustomDatePicker
                  value={endsAt}
                  setValue={setEndsAt}
                  error={submitted && !!errors.endsAt}
                  helperText={submitted ? errors.endsAt : undefined}
                />
              </div>
            </div>

            <div
              data-testid="add-quarantine-case-number"
              className="rows gapped-xxs"
            >
              <Label>{t('fields.caseNumber')} *</Label>
              <TextField
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                error={submitted && !!errors.caseNumber}
                helperText={submitted ? errors.caseNumber : undefined}
                fullWidth
              />
            </div>
          </div>
        </div>

        <div className="columns gapped flex-end" style={{ flex: '0 0 auto' }}>
          <OphButton
            variant={Variant.Outlined}
            onClick={handleClose}
            disabled={isSubmitting}
          >
            {t('cancel')}
          </OphButton>
          <OphButton
            variant={Variant.Contained}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {t('submit')}
          </OphButton>
        </div>
      </div>
    </CustomModal>
  );
};
