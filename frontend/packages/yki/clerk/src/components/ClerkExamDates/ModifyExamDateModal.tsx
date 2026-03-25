import { Warning } from '@mui/icons-material';
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
import { ExamDate, ExamType, UpdateExamDateRequest } from 'interfaces/examDate';
import { H2, H3, Label, Text } from 'ophTheme/Text';
import {
  resetUpdateExamDateStatus,
  updateExamDate,
} from 'redux/reducers/examDate';
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

type ModifyExamDateModalProps = {
  examDateToEdit: ExamDate | null;
  onClose: () => void;
};

type FormErrors = {
  examDate: boolean;
  registrationStart: boolean;
  registrationEnd: boolean;
  registrationEndBeforeStart: boolean;
  languages: boolean;
};

const initializeLanguageSelections = (
  existingLanguages: ExamDate['languages'],
): LanguageSelection[] =>
  LANGUAGES.map((lang) => {
    const existing = existingLanguages.filter(
      (l) => l.languageCode === lang.code,
    );

    return {
      languageCode: lang.code,
      languageName: lang.name,
      levels: {
        PERUS: existing.some((l) => l.levelCode === 'PERUS'),
        KESKI: existing.some((l) => l.levelCode === 'KESKI'),
        YLIN: existing.some((l) => l.levelCode === 'YLIN'),
      },
    };
  });

export const ModifyExamDateModal = ({
  examDateToEdit,
  onClose,
}: ModifyExamDateModalProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkExamDates',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();
  const { updateStatus } = useAppSelector(examDateSelector);
  const prevUpdateStatus = useRef(updateStatus);

  const [examDate, setExamDate] = useState<Dayjs | null>(null);
  const [registrationStart, setRegistrationStart] = useState<Dayjs | null>(
    null,
  );
  const [registrationEnd, setRegistrationEnd] = useState<Dayjs | null>(null);
  const [languageSelections, setLanguageSelections] = useState<
    LanguageSelection[]
  >([]);
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
    languages: false,
  });

  const isSaving = updateStatus === APIResponseStatus.InProgress;
  const isOpen = examDateToEdit !== null;

  const validate = useCallback((): FormErrors => {
    const registrationEndBeforeStart =
      !!registrationStart &&
      !!registrationEnd &&
      registrationEnd.isBefore(registrationStart.add(1, 'day'));

    return {
      examDate: !examDate,
      registrationStart: !registrationStart,
      registrationEnd: !registrationEnd,
      registrationEndBeforeStart,
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
        languages: prev.languages && current.languages,
      }));
    }
  }, [submitted, validate]);

  useEffect(() => {
    if (examDateToEdit) {
      setExamDate(examDateToEdit.examDate);
      setRegistrationStart(examDateToEdit.registrationStartDate);
      setRegistrationEnd(examDateToEdit.registrationEndDate);
      setLanguageSelections(
        initializeLanguageSelections(examDateToEdit.languages),
      );
      setExamType(examDateToEdit.examType);
      setSubmitted(false);
    }
  }, [examDateToEdit]);

  useEffect(() => {
    if (
      prevUpdateStatus.current === APIResponseStatus.InProgress &&
      updateStatus === APIResponseStatus.Success
    ) {
      onClose();
      dispatch(resetUpdateExamDateStatus());
    }
    prevUpdateStatus.current = updateStatus;
  }, [updateStatus, onClose, dispatch]);

  const handleCloseModal = () => {
    onClose();
    dispatch(resetUpdateExamDateStatus());
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

    if (!examDateToEdit || hasErrors) {
      return;
    }

    const selectedLanguages = languageSelections.flatMap((lang) => {
      const levels: Array<{ languageCode: string; levelCode: string }> = [];
      if (lang.levels.PERUS) {
        levels.push({ languageCode: lang.languageCode, levelCode: 'PERUS' });
      }
      if (lang.levels.KESKI) {
        levels.push({ languageCode: lang.languageCode, levelCode: 'KESKI' });
      }
      if (lang.levels.YLIN) {
        levels.push({ languageCode: lang.languageCode, levelCode: 'YLIN' });
      }

      return levels;
    });

    if (examDate && registrationStart && registrationEnd) {
      const request: UpdateExamDateRequest = {
        id: examDateToEdit.id,
        examDate: examDate.format('YYYY-MM-DD'),
        registrationStartDate: registrationStart.format('YYYY-MM-DD'),
        registrationEndDate: registrationEnd.format('YYYY-MM-DD'),
        languages: selectedLanguages,
        examType: examType,
      };

      dispatch(updateExamDate(request));
    }
  };

  const hasExamSessions = examDateToEdit?.examSessionCount
    ? examDateToEdit.examSessionCount > 0
    : false;

  return (
    <CustomModal
      data-testid="modify-exam-date-modal"
      open={isOpen}
      onCloseModal={handleCloseModal}
      aria-labelledby="modify-exam-date-modal-title"
      modalTitle={
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >
          <H2>{t('modifyModal.title')}</H2>
          <CloseIcon
            data-testid="modify-exam-date-modal-close"
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
            {hasExamSessions && (
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  p: 1.5,
                  backgroundColor: '#FFF8E1',
                  borderRadius: 1,
                }}
              >
                <Warning sx={{ color: '#F9A825' }} />
                <Text>{t('modifyModal.infoBox')}</Text>
              </Box>
            )}

            <div className="rows gapped-xxs">
              <H3>{t('modifyModal.examDateDetails')}</H3>
              <Label>{t('modal.examDateLabel')} *</Label>
              <div style={{ maxWidth: '180px' }}>
                <CustomDatePicker
                  value={examDate}
                  setValue={setExamDate}
                  error={submitted && errors.examDate}
                  helperText={
                    submitted && errors.examDate
                      ? t('modal.errors.required')
                      : undefined
                  }
                  disabled={hasExamSessions}
                />
              </div>
            </div>

            <div
              className="columns gapped"
              style={{ alignItems: 'flex-start' }}
            >
              <div className="rows gapped-xxs">
                <Label>{t('modal.registrationStartLabel')} *</Label>
                <div style={{ maxWidth: '180px' }}>
                  <CustomDatePicker
                    value={registrationStart}
                    setValue={setRegistrationStart}
                    error={submitted && errors.registrationStart}
                    helperText={
                      submitted && errors.registrationStart
                        ? t('modal.errors.required')
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
                <Label>{t('modal.registrationEndLabel')} *</Label>
                <div style={{ maxWidth: '180px' }}>
                  <CustomDatePicker
                    value={registrationEnd}
                    setValue={setRegistrationEnd}
                    minDate={registrationStart?.add(1, 'day') || undefined}
                    error={
                      submitted &&
                      (errors.registrationEnd ||
                        errors.registrationEndBeforeStart)
                    }
                    helperText={
                      submitted && errors.registrationEnd
                        ? t('modal.errors.required')
                        : submitted && errors.registrationEndBeforeStart
                        ? t('modal.errors.registrationEndBeforeStart')
                        : undefined
                    }
                  />
                </div>
              </div>
            </div>

            <H3>{t('modal.languageLevelsAndExamsHeader')}</H3>

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
                    <Label>{t('modal.languageLabel')} *</Label>
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
                    data-testid={`modify-language-row-${lang.languageCode}`}
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
                      {(['PERUS', 'KESKI', 'YLIN'] as const).map((level) => (
                        <div
                          key={level}
                          style={{
                            minWidth: '80px',
                            display: 'flex',
                            justifyContent: 'center',
                          }}
                        >
                          <OphCheckbox
                            checked={lang.levels[level]}
                            onChange={() =>
                              !hasExamSessions &&
                              toggleLanguageLevel(lang.languageCode, level)
                            }
                            sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                {submitted && errors.languages && (
                  <Text style={{ color: '#d32f2f' }}>
                    {t('modal.errors.noLanguagesSelected')}
                  </Text>
                )}
              </div>
            </div>

            <div className="rows gapped-xxs">
              <Label>{t('modal.examLabel')} *</Label>
              <RadioGroup
                data-testid="exam-type-radio-group"
                value={examType}
                onChange={(e) =>
                  !hasExamSessions && setExamType(e.target.value as ExamType)
                }
              >
                <FormControlLabel
                  value="LISTEN_WRITE"
                  control={<Radio data-testid="exam-type-speech" />}
                  label={t(
                    'modifyModal.examTypes.speechComprehensionAndWriting',
                  )}
                />
                <FormControlLabel
                  value="READ_SPEAK"
                  control={<Radio data-testid="exam-type-reading" />}
                  label={t(
                    'modifyModal.examTypes.readingComprehensionAndSpeaking',
                  )}
                />
                <FormControlLabel
                  value="FULL"
                  control={<Radio data-testid="exam-type-all" />}
                  label={t('modifyModal.examTypes.allExamParts')}
                />
              </RadioGroup>
            </div>
          </div>
        </div>
        <div className="columns gapped flex-end" style={{ flex: '0 0 auto' }}>
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
              {t('modifyModal.submitButton')}
            </OphButton>
          </LoadingProgressIndicator>
        </div>
      </div>
    </CustomModal>
  );
};
