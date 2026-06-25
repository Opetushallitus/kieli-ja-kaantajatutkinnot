import CloseIcon from '@mui/icons-material/Close';
import { Box, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import {
  OphButton,
  OphCheckbox,
  ophColors,
} from '@opetushallitus/oph-design-system';
import { Dayjs } from 'dayjs';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CustomDatePicker,
  CustomModal,
  LoadingProgressIndicator,
} from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { CreateExamDateRequest, ExamType } from 'interfaces/examDate';
import { H2, H3, Label, Text } from 'ophTheme/Text';
import { addExamDate, resetAddExamDateStatus } from 'redux/reducers/examDate';
import { examDateSelector } from 'redux/selectors/examDate';
import { LANGUAGES, levelDescription } from 'utils/clerk';

type LanguageSelection = {
  languageCode: string;
  languageName: string;
  levels: {
    PERUS: boolean;
    KESKI: boolean;
    YLIN: boolean;
  };
};

type AddExamDateModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
};

type FormErrors = {
  examDate: boolean;
  registrationStart: boolean;
  registrationEnd: boolean;
  registrationEndBeforeStart: boolean;
  registrationEndAfterExamDate: boolean;
  languages: boolean;
};

const initializeLanguageSelections = (): LanguageSelection[] =>
  LANGUAGES.map((lang) => ({
    languageCode: lang.code,
    languageName: lang.name,
    levels: {
      PERUS: false,
      KESKI: false,
      YLIN: false,
    },
  }));

export const AddExamDateModal = ({
  isModalOpen,
  setIsModalOpen,
}: AddExamDateModalProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkExamDates.modal',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();
  const { addStatus } = useAppSelector(examDateSelector);
  const prevAddStatus = useRef(addStatus);

  const [examDate, setExamDate] = useState<Dayjs | null>(null);
  const [registrationStart, setRegistrationStart] = useState<Dayjs | null>(
    null,
  );
  const [registrationEnd, setRegistrationEnd] = useState<Dayjs | null>(null);
  const [languageSelections, setLanguageSelections] = useState<
    LanguageSelection[]
  >(initializeLanguageSelections());
  const [examType, setExamType] = useState<ExamType>('FULL');
  const [submitted, setSubmitted] = useState(false);
  const hasSelectedLanguages = useMemo(
    () =>
      languageSelections.some(
        (lang) => lang.levels.PERUS || lang.levels.KESKI || lang.levels.YLIN,
      ),
    [languageSelections],
  );

  const [errors, setErrors] = useState<FormErrors>({
    examDate: false,
    registrationStart: false,
    registrationEnd: false,
    registrationEndBeforeStart: false,
    registrationEndAfterExamDate: false,
    languages: false,
  });

  const isSaving = addStatus === APIResponseStatus.InProgress;

  const validate = useCallback((): FormErrors => {
    const registrationEndBeforeStart =
      !!registrationStart &&
      !!registrationEnd &&
      registrationEnd.isBefore(registrationStart.add(1, 'day'));
    const registrationEndAfterExamDate =
      !!examDate && !!registrationEnd && !registrationEnd.isBefore(examDate);

    return {
      examDate: !examDate,
      registrationStart: !registrationStart,
      registrationEnd: !registrationEnd,
      registrationEndBeforeStart,
      registrationEndAfterExamDate,
      languages: !hasSelectedLanguages,
    };
  }, [examDate, registrationStart, registrationEnd, hasSelectedLanguages]);

  useEffect(() => {
    if (submitted) {
      const current = validate();

      setErrors((prev) => ({
        examDate: prev.examDate && current.examDate,
        registrationStart: prev.registrationStart && current.registrationStart,
        registrationEnd: prev.registrationEnd && current.registrationEnd,
        registrationEndBeforeStart:
          prev.registrationEndBeforeStart && current.registrationEndBeforeStart,
        registrationEndAfterExamDate:
          prev.registrationEndAfterExamDate &&
          current.registrationEndAfterExamDate,
        languages: prev.languages && current.languages,
      }));
    }
  }, [submitted, validate]);

  useEffect(() => {
    if (
      prevAddStatus.current === APIResponseStatus.InProgress &&
      addStatus === APIResponseStatus.Success
    ) {
      setExamDate(null);
      setRegistrationStart(null);
      setRegistrationEnd(null);
      setLanguageSelections(initializeLanguageSelections());
      setExamType('FULL');
      setSubmitted(false);
      setIsModalOpen(false);
      dispatch(resetAddExamDateStatus());
    }
    prevAddStatus.current = addStatus;
  }, [addStatus, setIsModalOpen, dispatch]);

  const handleCloseModal = () => {
    setExamDate(null);
    setRegistrationStart(null);
    setRegistrationEnd(null);
    setLanguageSelections(initializeLanguageSelections());
    setExamType('FULL');
    setSubmitted(false);
    setIsModalOpen(false);
    dispatch(resetAddExamDateStatus());
  };

  const toggleLanguageLevel = (
    languageCode: string,
    level: 'PERUS' | 'KESKI' | 'YLIN',
  ) => {
    setLanguageSelections((prev) =>
      prev.map((lang) =>
        lang.languageCode === languageCode
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

  const handleSubmit = () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    setSubmitted(true);

    const hasErrors = Object.values(validationErrors).some(Boolean);

    if (hasErrors) {
      return;
    }

    const selectedLanguages = languageSelections.flatMap((lang) => {
      const levels: Array<{ languageCode: string; levelCode: string }> = [];
      if (lang.levels.PERUS) {
        levels.push({
          languageCode: lang.languageCode,
          levelCode: 'PERUS',
        });
      }
      if (lang.levels.KESKI) {
        levels.push({
          languageCode: lang.languageCode,
          levelCode: 'KESKI',
        });
      }
      if (lang.levels.YLIN) {
        levels.push({
          languageCode: lang.languageCode,
          levelCode: 'YLIN',
        });
      }

      return levels;
    });

    if (examDate && registrationStart && registrationEnd) {
      const request: CreateExamDateRequest = {
        examDate: examDate.format('YYYY-MM-DD'),
        registrationStartDate: registrationStart.format('YYYY-MM-DD'),
        registrationEndDate: registrationEnd.format('YYYY-MM-DD'),
        languages: selectedLanguages,
        examType,
      };

      dispatch(addExamDate(request));
    }
  };

  return (
    <CustomModal
      data-testid="add-exam-date-modal"
      open={isModalOpen}
      onCloseModal={handleCloseModal}
      aria-labelledby="add-exam-date-modal-title"
      modalTitle={
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >
          <H2>{t('title')}</H2>
          <CloseIcon
            data-testid="add-exam-date-modal-close"
            fontSize="large"
            onClick={handleCloseModal}
          />
        </Box>
      }
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxHeight: 'calc(100vh - 200px)',
          width: '50vw',
          maxWidth: '900px',
          gap: '2rem',
        }}
      >
        <div
          style={{ overflowY: 'auto', flex: '1 1 auto', paddingRight: '8px' }}
        >
          <div className="rows gapped-xl">
            <div className="rows gapped-xxs">
              <Label>{t('examDateLabel')} *</Label>
              <div style={{ maxWidth: '180px' }} data-testid="exam-date-input">
                <CustomDatePicker
                  value={examDate}
                  setValue={setExamDate}
                  error={submitted && errors.examDate}
                  helperText={
                    submitted && errors.examDate
                      ? t('errors.required')
                      : undefined
                  }
                />
              </div>
            </div>

            <div
              className="columns gapped"
              style={{
                alignItems: 'flex-start',
              }}
            >
              <div className="rows gapped-xxs">
                <Label>{t('registrationStartLabel')} *</Label>
                <div
                  style={{ maxWidth: '180px' }}
                  data-testid="registration-start-input"
                >
                  <CustomDatePicker
                    value={registrationStart}
                    setValue={setRegistrationStart}
                    error={submitted && errors.registrationStart}
                    helperText={
                      submitted && errors.registrationStart
                        ? t('errors.required')
                        : undefined
                    }
                  />
                </div>
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
                <Label>{t('registrationEndLabel')} *</Label>
                <div
                  style={{ maxWidth: '180px' }}
                  data-testid="registration-end-input"
                >
                  <CustomDatePicker
                    value={registrationEnd}
                    setValue={setRegistrationEnd}
                    minDate={registrationStart?.add(1, 'day') || undefined}
                    error={
                      submitted &&
                      (errors.registrationEnd ||
                        errors.registrationEndBeforeStart ||
                        errors.registrationEndAfterExamDate)
                    }
                    helperText={
                      submitted && errors.registrationEnd
                        ? t('errors.required')
                        : submitted && errors.registrationEndBeforeStart
                          ? t('errors.registrationEndBeforeStart')
                          : submitted && errors.registrationEndAfterExamDate
                            ? t('errors.registrationEndAfterExamDate')
                            : undefined
                    }
                  />
                </div>
              </div>
            </div>

            <H3>{t('languageLevelsAndExamsHeader')}</H3>

            <div style={{ overflowX: 'auto' }}>
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
                  <div style={{ flex: '1 1 20%', minWidth: '150px' }}>
                    <Label>{t('languageLabel')} *</Label>
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

                {languageSelections.map((lang) => (
                  <div
                    key={lang.languageCode}
                    data-testid={`language-row-${lang.languageCode}`}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                      padding: '0.5rem',
                      borderBottom: '1px solid #e0e0e0',
                    }}
                  >
                    <div style={{ flex: '1 0 20%', minWidth: '150px' }}>
                      <Text>{lang.languageName}</Text>
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
                          data-testid={`language-${lang.languageCode}-PERUS`}
                          checked={lang.levels.PERUS}
                          onChange={() =>
                            toggleLanguageLevel(lang.languageCode, 'PERUS')
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
                          data-testid={`language-${lang.languageCode}-KESKI`}
                          checked={lang.levels.KESKI}
                          onChange={() =>
                            toggleLanguageLevel(lang.languageCode, 'KESKI')
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
                          data-testid={`language-${lang.languageCode}-YLIN`}
                          checked={lang.levels.YLIN}
                          onChange={() =>
                            toggleLanguageLevel(lang.languageCode, 'YLIN')
                          }
                          sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
                {submitted && errors.languages && (
                  <Text style={{ color: '#d32f2f' }}>
                    {t('errors.noLanguagesSelected')}
                  </Text>
                )}
              </div>
            </div>

            <div className="rows gapped-xxs">
              <Label>{t('examLabel')} *</Label>
              <RadioGroup
                data-testid="exam-type-radio-group"
                value={examType}
                onChange={(e) => setExamType(e.target.value as ExamType)}
              >
                <FormControlLabel
                  value="LISTEN_WRITE"
                  control={<Radio data-testid="exam-type-speech" />}
                  label={t('examTypes.speechComprehensionAndWriting')}
                />
                <FormControlLabel
                  value="READ_SPEAK"
                  control={<Radio data-testid="exam-type-reading" />}
                  label={t('examTypes.readingComprehensionAndSpeaking')}
                />
                <FormControlLabel
                  value="FULL"
                  control={<Radio data-testid="exam-type-all" />}
                  label={t('examTypes.allExamParts')}
                />
              </RadioGroup>
            </div>
          </div>
        </div>
        <div
          className="columns gapped flex-end"
          style={{
            flex: '0 0 auto',
          }}
        >
          <OphButton
            variant={Variant.Outlined}
            color={Color.Primary}
            onClick={handleCloseModal}
          >
            {translateCommon('cancel')}
          </OphButton>
          <LoadingProgressIndicator isLoading={isSaving}>
            <OphButton
              variant={Variant.Contained}
              color={Color.Primary}
              onClick={handleSubmit}
              disabled={isSaving}
            >
              {t('submitButton')}
            </OphButton>
          </LoadingProgressIndicator>
        </div>
      </div>
    </CustomModal>
  );
};
