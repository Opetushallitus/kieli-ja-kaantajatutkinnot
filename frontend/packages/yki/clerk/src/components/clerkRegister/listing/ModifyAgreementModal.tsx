import CloseIcon from '@mui/icons-material/Close';
import { Box, TextField } from '@mui/material';
import {
  OphButton,
  OphCheckbox,
  ophColors,
} from '@opetushallitus/oph-design-system';
import { Dayjs } from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import {
  CustomDatePicker,
  CustomModal,
  LoadingProgressIndicator,
} from 'shared/components';
import {
  APIResponseStatus,
  Color,
  TextFieldTypes,
  Variant,
} from 'shared/enums';
import { InputFieldUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import {
  ClerkOrganizerType,
  OrganizerLanguage,
} from 'interfaces/clerkOrganizer';
import { H2, H3, Label, Text } from 'ophTheme/Text';
import {
  resetUpdateClerkOrganizerStatus,
  updateClerkOrganizer,
} from 'redux/reducers/clerkOrganizer';
import { clerkOrganizersSelector } from 'redux/selectors/clerkOrganizers';
import { LANGUAGES, languageToString, levelDescription } from 'utils/clerk';

type LanguageSelection = {
  language_code: string;
  language_name: string;
  levels: {
    PERUS: boolean;
    KESKI: boolean;
    YLIN: boolean;
  };
};

type ModifyAgreementModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
  row: ClerkOrganizerType;
};

export const ModifyAgreementModal = ({
  isModalOpen,
  setIsModalOpen,
  row,
}: ModifyAgreementModalProps) => {
  const {
    id,
    oid,
    name,
    agreement_start_date,
    agreement_end_date,
    address,
    languages,
  } = row;

  const [startDate, setStartDate] = useState<Dayjs | null>(
    agreement_start_date || null,
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(
    agreement_end_date || null,
  );
  const [contactName, setContactName] = useState(row.contact_name ?? '');
  const [contactEmail, setContactEmail] = useState(row.contact_email ?? '');
  const [contactPhone, setContactPhone] = useState(
    row.contact_phone_number ?? '',
  );
  const [extra, setExtra] = useState(row.extra);
  const [contactNameError, setContactNameError] = useState('');
  const [contactEmailError, setContactEmailError] = useState('');
  const [contactPhoneError, setContactPhoneError] = useState('');

  const { updateStatus } = useAppSelector(clerkOrganizersSelector);
  const dispatch = useAppDispatch();

  // Initialize language selections from current languages
  const initializeLanguageSelections = useCallback((): LanguageSelection[] => {
    if (!languages) {
      return [];
    }

    return LANGUAGES.map((lang: { code: string; name: string }) => {
      const existingLevels = languages
        .filter((l) => l.language_code === lang.code)
        .map((l) => l.level_code);

      return {
        language_code: lang.code,
        language_name: languageToString(lang.code),
        levels: {
          PERUS: existingLevels.includes('PERUS'),
          KESKI: existingLevels.includes('KESKI'),
          YLIN: existingLevels.includes('YLIN'),
        },
      };
    });
  }, [languages]);

  const [languageSelections, setLanguageSelections] = useState<
    LanguageSelection[]
  >(initializeLanguageSelections());
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkRegister',
  });
  const translateCommon = useCommonTranslation();

  // Re-initialize language selections when modal opens or languages change
  useEffect(() => {
    if (isModalOpen) {
      setLanguageSelections(initializeLanguageSelections());
      setStartDate(agreement_start_date || null);
      setEndDate(agreement_end_date || null);
      setContactName(row.contact_name ?? '');
      setContactEmail(row.contact_email ?? '');
      setContactPhone(row.contact_phone_number ?? '');
      setExtra(row.extra);
      setContactNameError('');
      setContactEmailError('');
      setContactPhoneError('');
    }
  }, [
    isModalOpen,
    initializeLanguageSelections,
    agreement_start_date,
    agreement_end_date,
    row.contact_name,
    row.contact_email,
    row.contact_phone_number,
    row.extra,
  ]);

  const handleCloseModal = () => {
    setStartDate(agreement_start_date || null);
    setEndDate(agreement_end_date || null);
    setLanguageSelections(initializeLanguageSelections());
    setContactName(row.contact_name ?? '');
    setContactEmail(row.contact_email ?? '');
    setContactPhone(row.contact_phone_number ?? '');
    setExtra(row.extra);
    setContactNameError('');
    setContactEmailError('');
    setContactPhoneError('');
    setIsModalOpen(false);
    dispatch(resetUpdateClerkOrganizerStatus());
  };

  const toggleLanguageLevel = (
    languageCode: string,
    level: 'PERUS' | 'KESKI' | 'YLIN',
  ) => {
    setLanguageSelections((prev) =>
      prev.map((lang) =>
        lang.language_code === languageCode
          ? {
              ...lang,
              levels: {
                ...lang.levels,
                [level]: !lang.levels[level],
              },
            }
          : lang,
      ),
    );
  };

  const validateField = (
    type: TextFieldTypes,
    value: string,
    setError: (msg: string) => void,
  ) => {
    const error = InputFieldUtils.validateCustomTextFieldErrors({
      type,
      value,
      required: true,
    });
    setError(error ? translateCommon(error) : '');

    return !error;
  };

  const handleSave = () => {
    const nameValid = validateField(
      TextFieldTypes.Text,
      contactName,
      setContactNameError,
    );
    const emailValid = validateField(
      TextFieldTypes.Email,
      contactEmail,
      setContactEmailError,
    );
    const phoneValid = validateField(
      TextFieldTypes.PhoneNumber,
      contactPhone,
      setContactPhoneError,
    );

    if (
      !startDate ||
      !endDate ||
      endDate.isBefore(startDate.add(1, 'day')) ||
      !nameValid ||
      !emailValid ||
      !phoneValid
    )
      return;

    const selectedLanguages: Array<OrganizerLanguage> = [];
    languageSelections.forEach((lang) => {
      if (lang.levels.PERUS) {
        selectedLanguages.push({
          language_code: lang.language_code,
          level_code: 'PERUS',
        });
      }
      if (lang.levels.KESKI) {
        selectedLanguages.push({
          language_code: lang.language_code,
          level_code: 'KESKI',
        });
      }
      if (lang.levels.YLIN) {
        selectedLanguages.push({
          language_code: lang.language_code,
          level_code: 'YLIN',
        });
      }
    });

    dispatch(
      updateClerkOrganizer({
        id,
        oid,
        agreement_start_date: startDate,
        agreement_end_date: endDate || undefined,
        languages: selectedLanguages,
        contact_name: contactName,
        contact_email: contactEmail,
        contact_phone_number: contactPhone,
        extra,
      }),
    );
  };

  const getEndDateHelperText = () => {
    if (!endDate) {
      return t('listing.modals.modifyAgreement.endDateError');
    }

    if (startDate && endDate.isBefore(startDate.add(1, 'day'))) {
      return t('listing.modals.modifyAgreement.endDateBeforeStartDateError');
    }

    return '';
  };

  return (
    <CustomModal
      data-testid="modify-agreement-modal"
      open={isModalOpen}
      onCloseModal={handleCloseModal}
      aria-labelledby="modal-title"
      modalTitle={
        <Box
          data-testid="modify-agreement-modal-title"
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >
          <H2>{t('listing.modals.modifyAgreement.title')}</H2>
          <CloseIcon
            data-testid="modify-agreement-modal-close"
            fontSize="large"
            onClick={handleCloseModal}
          />
        </Box>
      }
    >
      <div
        className="rows gapped"
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 200px)',
        }}
      >
        <div
          style={{ overflowY: 'auto', flex: '1 1 auto', paddingRight: '8px' }}
        >
          <div className="rows gapped-xl">
            <div>
              <H3>{name}</H3>
              <Text>{`${address.street}, ${address.zipCode} ${address.city}`}</Text>
            </div>
            <H3>
              {t('listing.modals.modifyAgreement.organizerAgreementLabel')}
            </H3>
            <div
              className="columns gapped"
              style={{ alignItems: 'flex-start', padding: '0 4px' }}
            >
              <div className="rows gapped-xxs">
                <Label>
                  {t('listing.modals.modifyAgreement.startDateLabel')}
                </Label>
                <CustomDatePicker
                  value={startDate}
                  setValue={(value: Dayjs | null) => setStartDate(value)}
                  error={!startDate}
                  helperText={
                    !startDate
                      ? t('listing.modals.modifyAgreement.startDateError')
                      : ''
                  }
                />
              </div>
              <svg
                width="18"
                height="1"
                style={{ alignSelf: 'flex-start', marginTop: '51px' }}
              >
                <line
                  x1="0"
                  y1="1"
                  x2="18"
                  y2="1"
                  stroke={ophColors.grey900}
                  strokeWidth="2"
                />
              </svg>
              <div className="rows gapped-xxs">
                <Label>
                  {t('listing.modals.modifyAgreement.endDateLabel')}
                </Label>
                <CustomDatePicker
                  value={endDate}
                  setValue={(value: Dayjs | null) => setEndDate(value)}
                  minDate={startDate?.add(1, 'day') || undefined}
                  error={!endDate}
                  helperText={getEndDateHelperText()}
                />
              </div>
            </div>

            <div>
              <Label>
                {t('listing.modals.modifyAgreement.languagesLabel')}
              </Label>
              <div
                className="rows gapped"
                style={{ marginTop: '1rem', gap: '0.5rem' }}
              >
                {/* Header row */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.5rem',
                    borderBottom: '2px solid #e0e0e0',
                  }}
                >
                  <div style={{ flex: 1, minWidth: '150px' }}>
                    <Label>
                      {t('listing.modals.modifyAgreement.language')}
                    </Label>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      gap: '0.5rem',
                      justifyContent: 'space-around',
                      flex: 1,
                    }}
                  >
                    <div style={{ minWidth: '80px', textAlign: 'center' }}>
                      <Label>{levelDescription('PERUS')}</Label>
                    </div>
                    <div style={{ minWidth: '80px', textAlign: 'center' }}>
                      <Label>{levelDescription('KESKI')}</Label>
                    </div>
                    <div style={{ minWidth: '80px', textAlign: 'center' }}>
                      <Label>{levelDescription('YLIN')}</Label>
                    </div>
                  </div>
                </div>

                {/* Data rows */}
                {languageSelections.map((lang) => {
                  return (
                    <div
                      id={`language-row-${lang.language_name}`}
                      key={lang.language_code}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.5rem',
                        borderBottom: '1px solid #e0e0e0',
                      }}
                    >
                      <div style={{ flex: 1, minWidth: '150px' }}>
                        <Text>{lang.language_name}</Text>
                      </div>
                      <div
                        style={{
                          display: 'flex',
                          gap: '0.5rem',
                          justifyContent: 'space-around',
                          flex: 1,
                        }}
                      >
                        <div
                          style={{
                            minWidth: '80px',
                            display: 'flex',
                            justifyContent: 'center',
                          }}
                        >
                          <OphCheckbox
                            checked={lang.levels.PERUS}
                            onChange={() =>
                              toggleLanguageLevel(lang.language_code, 'PERUS')
                            }
                            // public side root html font-size affects mui icon size as it uses em and rem, so we need to set it explicitly
                            // this can be removed when clerk build gets a separate build
                            sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
                          />
                        </div>
                        <div
                          style={{
                            minWidth: '80px',
                            display: 'flex',
                            justifyContent: 'center',
                          }}
                        >
                          <OphCheckbox
                            checked={lang.levels.KESKI}
                            onChange={() =>
                              toggleLanguageLevel(lang.language_code, 'KESKI')
                            }
                            sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
                          />
                        </div>
                        <div
                          style={{
                            minWidth: '80px',
                            display: 'flex',
                            justifyContent: 'center',
                          }}
                        >
                          <OphCheckbox
                            checked={lang.levels.YLIN}
                            onChange={() =>
                              toggleLanguageLevel(lang.language_code, 'YLIN')
                            }
                            sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <H3>{t('listing.modals.modifyAgreement.contactPersonLabel')}</H3>
            <div className="rows gapped">
              <div className="rows gapped-xxs">
                <Label>
                  {t('listing.modals.modifyAgreement.contactNameLabel')}
                </Label>
                <TextField
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  onBlur={() =>
                    validateField(
                      TextFieldTypes.Text,
                      contactName,
                      setContactNameError,
                    )
                  }
                  error={!!contactNameError}
                  helperText={contactNameError}
                />
              </div>
              <div className="rows gapped-xxs">
                <Label>
                  {t('listing.modals.modifyAgreement.contactEmailLabel')}
                </Label>
                <TextField
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                  onBlur={() =>
                    validateField(
                      TextFieldTypes.Email,
                      contactEmail,
                      setContactEmailError,
                    )
                  }
                  error={!!contactEmailError}
                  helperText={contactEmailError}
                />
              </div>
              <div className="rows gapped-xxs">
                <Label>
                  {t('listing.modals.modifyAgreement.contactPhoneLabel')}
                </Label>
                <TextField
                  value={contactPhone}
                  onChange={(e) => setContactPhone(e.target.value)}
                  onBlur={() =>
                    validateField(
                      TextFieldTypes.PhoneNumber,
                      contactPhone,
                      setContactPhoneError,
                    )
                  }
                  error={!!contactPhoneError}
                  helperText={contactPhoneError}
                />
              </div>
              <div className="rows gapped-xxs">
                <Label>{t('listing.modals.modifyAgreement.extraLabel')}</Label>
                <TextField
                  value={extra}
                  onChange={(e) => setExtra(e.target.value)}
                  multiline
                  rows={4}
                  fullWidth
                />
              </div>
            </div>

            <div className="columns gapped flex-end">
              <OphButton
                variant={Variant.Outlined}
                color={Color.Primary}
                onClick={handleCloseModal}
              >
                {t('listing.modals.modifyAgreement.cancelButton')}
              </OphButton>
              <LoadingProgressIndicator
                isLoading={updateStatus === APIResponseStatus.InProgress}
              >
                <OphButton
                  variant={Variant.Contained}
                  color={Color.Primary}
                  onClick={handleSave}
                  disabled={updateStatus === APIResponseStatus.InProgress}
                >
                  {t('listing.modals.modifyAgreement.saveButton')}
                </OphButton>
              </LoadingProgressIndicator>
            </div>
          </div>
        </div>
      </div>
    </CustomModal>
  );
};
