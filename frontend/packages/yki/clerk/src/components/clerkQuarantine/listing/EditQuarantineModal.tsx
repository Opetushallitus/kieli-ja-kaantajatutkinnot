import CloseIcon from '@mui/icons-material/Close';
import { Box, Typography } from '@mui/material';
import {
  OphButton,
  OphInputFormField,
  OphRadioGroupFormField,
} from '@opetushallitus/oph-design-system';
import dayjs, { Dayjs } from 'dayjs';
import { useEffect, useMemo, useRef, useState } from 'react';
import { CustomDatePicker, CustomModal } from 'shared/components';
import {
  APIResponseStatus,
  Color,
  CustomTextFieldErrors,
  TextFieldTypes,
  Variant,
} from 'shared/enums';
import { DateUtils, InputFieldUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ClerkActiveQuarantine } from 'interfaces/clerkQuarantine';
import { H2, H3, Label } from 'ophTheme/Text';
import {
  resetUpdateClerkQuarantineStatus,
  updateClerkQuarantine,
} from 'redux/reducers/clerkQuarantine';
import { clerkQuarantineSelector } from 'redux/selectors/clerkQuarantine';
import { LANGUAGES, languageToString } from 'utils/clerk';

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

type EditQuarantineModalProps = {
  quarantine: ClerkActiveQuarantine | null;
  onClose: () => void;
};

const formatBirthdateForInput = (birthdate?: string) => {
  if (!birthdate) {
    return '';
  }
  const parsed = dayjs(birthdate);

  return parsed.isValid() ? parsed.format('D.M.YYYY') : birthdate;
};

export const EditQuarantineModal = ({
  quarantine,
  onClose,
}: EditQuarantineModalProps) => {
  const dispatch = useAppDispatch();
  const { updateStatus } = useAppSelector(clerkQuarantineSelector);
  const prevUpdateStatus = useRef(updateStatus);
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkQuarantine.activeQuarantines',
  });
  const translateCommon = useCommonTranslation();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [ssn, setSsn] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [examLanguage, setExamLanguage] = useState('');
  const [startsAt, setStartsAt] = useState<Dayjs | null>(null);
  const [endsAt, setEndsAt] = useState<Dayjs | null>(null);
  const [caseNumber, setCaseNumber] = useState('');
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (quarantine) {
      const { quarantinedPerson } = quarantine;
      setFirstName(quarantinedPerson.firstName);
      setLastName(quarantinedPerson.lastName);
      setBirthdate(formatBirthdateForInput(quarantinedPerson.birthdate));
      setSsn(quarantinedPerson.ssn ?? '');
      setEmail(quarantinedPerson.email);
      setPhoneNumber(quarantinedPerson.phoneNumber);
      setExamLanguage(quarantine.languageCode);
      setStartsAt(quarantine.startDate);
      setEndsAt(quarantine.endDate);
      setCaseNumber(quarantine.diaryNumber);
      setSubmitted(false);
    }
  }, [quarantine]);

  const errors = useMemo<FormErrors>(() => {
    const result: FormErrors = {};

    if (!firstName.trim()) {
      result.firstName = translateCommon(CustomTextFieldErrors.Required);
    }
    if (!lastName.trim()) {
      result.lastName = translateCommon(CustomTextFieldErrors.Required);
    }
    const parsedBirthdate = DateUtils.parseDateString(birthdate);
    if (birthdate.trim() && !parsedBirthdate) {
      result.birthdate = translateCommon(CustomTextFieldErrors.DateFormat);
    }
    if (!parsedBirthdate && !ssn.trim()) {
      result.ssn = t('modal.errors.birthdateOrSsnRequired');
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
      result.endsAt = t('modal.errors.startDateAfterEndDate');
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

  const languageOptions = useMemo(
    () =>
      LANGUAGES.map((lang) => ({
        value: lang.code,
        label: languageToString(lang.code),
      })),
    [],
  );

  const handleClose = () => {
    dispatch(resetUpdateClerkQuarantineStatus());
    onClose();
  };

  useEffect(() => {
    if (
      prevUpdateStatus.current === APIResponseStatus.InProgress &&
      updateStatus === APIResponseStatus.Success
    ) {
      onClose();
      dispatch(resetUpdateClerkQuarantineStatus());
    }
    prevUpdateStatus.current = updateStatus;
  }, [updateStatus, onClose, dispatch]);

  const handleSubmit = () => {
    setSubmitted(true);

    if (Object.keys(errors).length > 0 || !startsAt || !endsAt || !quarantine) {
      return;
    }

    dispatch(
      updateClerkQuarantine({
        id: quarantine.id,
        firstName,
        lastName,
        ...(DateUtils.parseDateString(birthdate) && {
          birthdate: DateUtils.parseDateString(birthdate)!.format('YYYY-MM-DD'),
        }),
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

  const isSubmitting = updateStatus === APIResponseStatus.InProgress;

  return (
    <CustomModal
      open={quarantine !== null}
      onCloseModal={handleClose}
      aria-labelledby="edit-quarantine-modal-title"
      modalTitle={
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >
          <H2>{t('editModal.title')}</H2>
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
        data-testid="edit-quarantine-modal"
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
            <H3>{t('modal.subHeaders.personInfo')}</H3>

            <div className="columns gapped">
              <div
                data-testid="edit-quarantine-first-name"
                style={{ width: '180px', flexShrink: 0 }}
              >
                <OphInputFormField
                  label={t('modal.fields.firstName')}
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  error={submitted && !!errors.firstName}
                  helperText={submitted ? errors.firstName : undefined}
                  sx={{ width: '100%' }}
                />
              </div>
              <div data-testid="edit-quarantine-last-name" style={{ flex: 1 }}>
                <OphInputFormField
                  label={t('modal.fields.lastName')}
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  error={submitted && !!errors.lastName}
                  helperText={submitted ? errors.lastName : undefined}
                  sx={{ width: '100%' }}
                />
              </div>
            </div>

            <div className="columns gapped">
              <div
                data-testid="edit-quarantine-birthdate"
                style={{ width: '180px', flexShrink: 0 }}
              >
                <OphInputFormField
                  label={t('modal.fields.birthdate')}
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  placeholder="p.k.vvvv"
                  error={submitted && !!errors.birthdate}
                  helperText={submitted ? errors.birthdate : undefined}
                  sx={{ width: '100%' }}
                />
              </div>
            </div>

            <div className="columns gapped">
              <div
                data-testid="edit-quarantine-ssn"
                style={{ width: '180px', flexShrink: 0 }}
              >
                <OphInputFormField
                  label={t('modal.fields.ssn')}
                  value={ssn}
                  onChange={(e) => setSsn(e.target.value)}
                  error={submitted && !!errors.ssn}
                  helperText={submitted ? errors.ssn : undefined}
                  sx={{ width: '100%' }}
                />
              </div>
            </div>

            <div data-testid="edit-quarantine-email">
              <OphInputFormField
                label={t('modal.fields.email')}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                error={submitted && !!errors.email}
                helperText={submitted ? errors.email : undefined}
                sx={{ width: '100%' }}
              />
            </div>

            <div data-testid="edit-quarantine-phone">
              <OphInputFormField
                label={t('modal.fields.phoneNumber')}
                required
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                type="tel"
                error={submitted && !!errors.phoneNumber}
                helperText={submitted ? errors.phoneNumber : undefined}
                sx={{ width: '100%' }}
              />
            </div>

            <H3>{t('modal.subHeaders.generalInfo')}</H3>

            <OphRadioGroupFormField
              label={t('modal.fields.examLanguage')}
              required
              value={examLanguage}
              onChange={(e) =>
                setExamLanguage((e.target as HTMLInputElement).value)
              }
              options={languageOptions}
              errorMessage={submitted ? errors.examLanguage : undefined}
            />

            <div className="columns gapped" style={{ alignItems: 'flex-end' }}>
              <div
                data-testid="edit-quarantine-start-date"
                className="rows gapped-xxs"
                style={{ width: '180px', flexShrink: 0 }}
              >
                <Label>{t('modal.fields.startsAt')} *</Label>
                <CustomDatePicker
                  value={startsAt}
                  setValue={setStartsAt}
                  error={submitted && !!errors.startsAt}
                  helperText={submitted ? errors.startsAt : undefined}
                />
              </div>
              <Typography style={{ paddingBottom: '8px' }}>—</Typography>
              <div
                data-testid="edit-quarantine-end-date"
                className="rows gapped-xxs"
                style={{ flex: 1 }}
              >
                <Label>{t('modal.fields.endsAt')} *</Label>
                <CustomDatePicker
                  value={endsAt}
                  setValue={setEndsAt}
                  error={submitted && !!errors.endsAt}
                  helperText={submitted ? errors.endsAt : undefined}
                />
              </div>
            </div>

            <div data-testid="edit-quarantine-case-number">
              <OphInputFormField
                label={t('modal.fields.caseNumber')}
                required
                value={caseNumber}
                onChange={(e) => setCaseNumber(e.target.value)}
                error={submitted && !!errors.caseNumber}
                helperText={submitted ? errors.caseNumber : undefined}
                sx={{ width: '100%' }}
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
            {t('modal.cancel')}
          </OphButton>
          <OphButton
            variant={Variant.Contained}
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {t('editModal.submit')}
          </OphButton>
        </div>
      </div>
    </CustomModal>
  );
};
