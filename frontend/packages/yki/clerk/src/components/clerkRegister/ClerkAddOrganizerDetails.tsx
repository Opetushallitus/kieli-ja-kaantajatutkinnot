import { TextField } from '@mui/material';
import {
  OphButton,
  OphCheckbox,
  ophColors,
  OphInputFormField,
} from '@opetushallitus/oph-design-system';
import { Dayjs } from 'dayjs';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomDatePicker } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { H3, Label, Text } from 'ophTheme/Text';
import { loadClerkOrganization } from 'redux/reducers/clerkOrganizer';
import { clerkOrganizersSelector } from 'redux/selectors/clerkOrganizers';
import { getOrganizerAddress, LANGUAGES, levelDescription } from 'utils/clerk';

type ClerkAddOrganizerDetailsProps = {
  selectedOrganizationOid: string;
};

type LanguageSelection = {
  language_code: string;
  language_name: string;
  levels: {
    PERUS: boolean;
    KESKI: boolean;
    YLIN: boolean;
  };
};

export const ClerkAddOrganizerDetails = ({
  selectedOrganizationOid,
}: ClerkAddOrganizerDetailsProps) => {
  const { organization } = useAppSelector(clerkOrganizersSelector);
  const [startDate, setStartDate] = useState<Dayjs | null>(null);
  const [endDate, setEndDate] = useState<Dayjs | null>(null);
  const [contactName, setContactName] = useState<string>('');
  const [contactEmail, setContactEmail] = useState<string>('');
  const [contactPhone, setContactPhone] = useState<string>('');
  const [extraInfo, setExtraInfo] = useState<string>('');

  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkRegister',
  });
  const translateCommon = useCommonTranslation();

  const initializeLanguageSelections = useCallback((): LanguageSelection[] => {
    return LANGUAGES.map((lang: { code: string; name: string }) => ({
      language_code: lang.code,
      language_name: lang.name,
      levels: {
        PERUS: false,
        KESKI: false,
        YLIN: false,
      },
    }));
  }, []);

  const [languageSelections, setLanguageSelections] = useState<
    LanguageSelection[]
  >(initializeLanguageSelections());

  useEffect(() => {
    dispatch(loadClerkOrganization([selectedOrganizationOid]));
  }, [selectedOrganizationOid, dispatch]);

  useEffect(() => {
    setLanguageSelections(initializeLanguageSelections());
    setStartDate(null);
    setEndDate(null);
    setContactName('');
    setContactEmail('');
    setContactPhone('');
    setExtraInfo('');
  }, [initializeLanguageSelections, selectedOrganizationOid]);

  const handleCancel = () => {
    navigate(AppRoutes.ClerkOrganizerRegister);
  };

  const handleSave = () => {
    if (!startDate || !endDate || endDate.isBefore(startDate.add(1, 'day')))
      return;
    // TODO: Implement add organizer logic
    navigate(AppRoutes.ClerkOrganizerRegister);
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

  const getEndDateHelperText = () => {
    if (!endDate) {
      return t('listing.modals.modifyAgreement.endDateError');
    }

    if (startDate && endDate.isBefore(startDate.add(1, 'day'))) {
      return t('listing.modals.modifyAgreement.endDateBeforeStartDateError');
    }

    return '';
  };

  const organizerAddress = getOrganizerAddress(organization);

  return (
    <div
      className="rows gapped"
      style={{
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <div
        className="rows gapped-xl"
        style={{ marginTop: '1rem', maxWidth: '848px' }}
      >
        <div>
          <H3>{organization?.nimi?.fi ?? ''}</H3>
          <Text>{`${organizerAddress.street}, ${organizerAddress.zipCode} ${organizerAddress.city}`}</Text>
        </div>
        <H3>{t('listing.modals.modifyAgreement.organizerAgreementLabel')}</H3>
        <div
          className="columns gapped"
          style={{ alignItems: 'flex-start', padding: '0 4px' }}
        >
          <div className="rows gapped-xxs">
            <Label>{t('listing.modals.modifyAgreement.startDateLabel')}</Label>
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
            <Label>{t('listing.modals.modifyAgreement.endDateLabel')}</Label>
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
          <Label>{t('listing.modals.modifyAgreement.languagesLabel')}</Label>
          <div
            className="rows gapped"
            style={{ marginTop: '1rem', gap: '0.5rem' }}
          >
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
                <Label>{t('listing.modals.modifyAgreement.language')}</Label>
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

        <div>
          <Label>Yhteyshenkilön tiedot</Label>
          <div
            className="rows gapped"
            style={{ marginTop: '1rem', gap: '1rem', maxWidth: '424px' }}
          >
            <OphInputFormField
              label="Nimi *"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              sx={{ width: '100%' }}
            />
            <OphInputFormField
              label="Sähköpostiosoite *"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              type="email"
              sx={{ width: '100%' }}
            />
            <OphInputFormField
              label="Puhelinnumero *"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
              type="tel"
              sx={{ width: '100%' }}
            />
          </div>
          <div className="rows gapped-xxs" style={{ marginTop: '1rem' }}>
            <Label>Lisätiedot</Label>
            <TextField
              value={extraInfo}
              onChange={(e) => setExtraInfo(e.target.value)}
              multiline
              minRows={3}
              maxRows={10}
              fullWidth
            />
          </div>
        </div>
      </div>
      <div className="columns gapped flex-end" style={{ marginTop: '1rem' }}>
        <OphButton
          variant={Variant.Outlined}
          color={Color.Primary}
          onClick={handleCancel}
        >
          {translateCommon('cancel')}
        </OphButton>
        <OphButton
          variant={Variant.Contained}
          color={Color.Primary}
          onClick={handleSave}
        >
          {t('addOrganizer.addButton')}
        </OphButton>
      </div>
    </div>
  );
};
