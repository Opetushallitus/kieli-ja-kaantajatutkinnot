import CloseIcon from '@mui/icons-material/Close';
import { Box } from '@mui/material';
import {
  OphButton,
  OphCheckbox,
  ophColors,
} from '@opetushallitus/oph-design-system';
import { Dayjs } from 'dayjs';
import { useState } from 'react';
import { CustomDatePicker, CustomModal } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { ClerkOrganizerAddress } from 'components/clerkRegister/listing/ClerkRegisterListing';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { OrganizerLanguage } from 'interfaces/clerkOrganizer';
import { H2, H3, Label, Text } from 'ophTheme/Text';
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
          <CloseIcon
            fontSize="large"
            onClick={handleCloseModal}
            style={{ cursor: 'pointer' }}
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
              <H3>{organizerName}</H3>
              <Text>{`${address.street}, ${address.zipCode} ${address.city}`}</Text>
            </div>
            <H3>
              {t('listing.modals.modifyAgreement.organizerAgreementLabel')}
            </H3>
            <div
              className="columns gapped"
              style={{ alignItems: 'flex-start' }}
            >
              <div className="rows gapped-xxs">
                <Label>
                  {t('listing.modals.modifyAgreement.startDateLabel')}
                </Label>
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
              <svg
                width="18"
                height="1"
                style={{ alignSelf: 'flex-end', margin: '21px 0' }}
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
                  minDate={startDate || undefined}
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
                  <div style={{ minWidth: '150px' }}>
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
                      key={lang.language_code}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem',
                        padding: '0.5rem',
                        borderBottom: '1px solid #e0e0e0',
                      }}
                    >
                      <div style={{ minWidth: '150px' }}>
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
                        <OphCheckbox
                          checked={lang.levels.PERUS}
                          onChange={() =>
                            toggleLanguageLevel(lang.language_code, 'PERUS')
                          }
                          sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
                        />

                        <OphCheckbox
                          checked={lang.levels.KESKI}
                          onChange={() =>
                            toggleLanguageLevel(lang.language_code, 'KESKI')
                          }
                          sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
                        />
                        <OphCheckbox
                          checked={lang.levels.YLIN}
                          onChange={() =>
                            toggleLanguageLevel(lang.language_code, 'YLIN')
                          }
                          sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
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
                {t('listing.modals.modifyAgreement.saveButton')}
              </OphButton>
            </div>
          </div>
        </div>
      </div>
    </CustomModal>
  );
};
