import CloseIcon from '@mui/icons-material/Close';
import { Box, Checkbox, FormControlLabel, TextField } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { Dayjs } from 'dayjs';
import { useState } from 'react';
import { CustomDatePicker, CustomModal } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { ClerkOrganizerAddress } from 'components/clerkRegister/listing/ClerkRegisterListing';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { OrganizerLanguage } from 'interfaces/clerkOrganizer';
import { H2, Label, Text } from 'ophTheme/Text';
import { LANGUAGES, levelDescription } from 'utils/clerk';

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
  organizerName: string;
  currentStartDate?: Dayjs;
  currentEndDate?: Dayjs;
  address: ClerkOrganizerAddress;
  languages: Array<OrganizerLanguage>;
  onSave: (startDate: Dayjs) => void;
};

export const ModifyAgreementModal = ({
  isModalOpen,
  setIsModalOpen,
  organizerName,
  currentStartDate,
  currentEndDate,
  address,
  languages,
  onSave,
}: ModifyAgreementModalProps) => {
  const [startDate, setStartDate] = useState<Dayjs | null>(
    currentStartDate || null,
  );
  const [endDate, setEndDate] = useState<Dayjs | null>(currentEndDate || null);
  const [streetAddress, setStreetAddress] = useState(address.street);
  const [zipCode, setZipCode] = useState(address.zipCode);
  const [city, setCity] = useState(address.city);

  // Initialize language selections from current languages
  const initializeLanguageSelections = (): LanguageSelection[] => {
    return LANGUAGES.map((lang: { code: string; name: string }) => {
      const existingLevels = languages
        .filter((l) => l.language_code === lang.code)
        .map((l) => l.level_code);

      return {
        language_code: lang.code,
        language_name: lang.name,
        levels: {
          PERUS: existingLevels.includes('PERUS'),
          KESKI: existingLevels.includes('KESKI'),
          YLIN: existingLevels.includes('YLIN'),
        },
      };
    });
  };

  const [languageSelections, setLanguageSelections] = useState<
    LanguageSelection[]
  >(initializeLanguageSelections());

  const [touched, setTouched] = useState(false);

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkRegister',
  });
  const translateCommon = useCommonTranslation();

  const handleCloseModal = () => {
    setStartDate(currentStartDate || null);
    setEndDate(currentEndDate || null);
    setStreetAddress(address.street);
    setZipCode(address.zipCode);
    setCity(address.city);
    setLanguageSelections(initializeLanguageSelections());
    setIsModalOpen(false);
    setTouched(false);
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

  const handleSave = () => {
    setTouched(true);
    if (!startDate) return;

    onSave(startDate);
    handleCloseModal();
  };

  const dateError = touched && !startDate;

  return (
    <CustomModal
      open={isModalOpen}
      onCloseModal={handleCloseModal}
      aria-labelledby="modal-title"
      modalTitle={
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >
          <H2>{t('listing.modals.modifyAgreement.title')}</H2>
          <div className="clerk-register__modal-close-icon">
            <CloseIcon
              color={Color.Inherit}
              aria-hidden={true}
              fontSize="large"
              onClick={handleCloseModal}
              style={{ cursor: 'pointer' }}
            />
          </div>
        </Box>
      }
    >
      <div className="rows gapped">
        <div>
          <Label>{t('listing.modals.modifyAgreement.organizerLabel')}</Label>
          <Text>{organizerName}</Text>
        </div>

        <div>
          <Label>{t('listing.modals.modifyAgreement.startDateLabel')}</Label>
          <Text>
            {t('listing.modals.modifyAgreement.startDateDescription')}
          </Text>
          <CustomDatePicker
            value={startDate}
            setValue={(value: Dayjs | null) => setStartDate(value)}
            onBlur={() => setTouched(true)}
            error={dateError}
            helperText={
              dateError
                ? t('listing.modals.modifyAgreement.startDateError')
                : ''
            }
          />
        </div>

        <div>
          <Label>{t('listing.modals.modifyAgreement.endDateLabel')}</Label>
          <CustomDatePicker
            value={endDate}
            setValue={(value: Dayjs | null) => setEndDate(value)}
          />
        </div>

        <div>
          <Label>{t('listing.modals.modifyAgreement.addressLabel')}</Label>
          <div className="rows gapped" style={{ marginTop: '0.5rem' }}>
            <TextField
              fullWidth
              label="Katuosoite"
              value={streetAddress}
              onChange={(e) => setStreetAddress(e.target.value)}
              variant="outlined"
              size="small"
            />
            <div className="columns gapped">
              <TextField
                label="Postinumero"
                value={zipCode}
                onChange={(e) => setZipCode(e.target.value)}
                variant="outlined"
                size="small"
                style={{ width: '150px' }}
              />
              <TextField
                fullWidth
                label="Kaupunki"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                variant="outlined"
                size="small"
              />
            </div>
          </div>
        </div>

        <div>
          <Label>{t('listing.modals.modifyAgreement.languagesLabel')}</Label>
          <Text>
            {t('listing.modals.modifyAgreement.languagesDescription')}
          </Text>
          <div
            className="rows gapped"
            style={{ marginTop: '1rem', gap: '0.5rem' }}
          >
            {languageSelections.map((lang) => {
              const hasAnyLevel =
                lang.levels.PERUS || lang.levels.KESKI || lang.levels.YLIN;

              return (
                <div
                  key={lang.language_code}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '1rem',
                    padding: '0.5rem',
                    backgroundColor: hasAnyLevel ? '#f5f5f5' : 'transparent',
                    borderRadius: '4px',
                  }}
                >
                  <div style={{ minWidth: '150px', fontWeight: 500 }}>
                    {lang.language_name}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={lang.levels.PERUS}
                          onChange={() =>
                            toggleLanguageLevel(lang.language_code, 'PERUS')
                          }
                          size="small"
                        />
                      }
                      label={levelDescription('PERUS')}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={lang.levels.KESKI}
                          onChange={() =>
                            toggleLanguageLevel(lang.language_code, 'KESKI')
                          }
                          size="small"
                        />
                      }
                      label={levelDescription('KESKI')}
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={lang.levels.YLIN}
                          onChange={() =>
                            toggleLanguageLevel(lang.language_code, 'YLIN')
                          }
                          size="small"
                        />
                      }
                      label={levelDescription('YLIN')}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="columns gapped flex-end">
          <OphButton
            variant={Variant.Outlined}
            color={Color.Primary}
            onClick={handleCloseModal}
          >
            {translateCommon('cancel')}
          </OphButton>
          <OphButton
            variant={Variant.Contained}
            color={Color.Primary}
            onClick={handleSave}
          >
            {translateCommon('save')}
          </OphButton>
        </div>
      </div>
    </CustomModal>
  );
};
