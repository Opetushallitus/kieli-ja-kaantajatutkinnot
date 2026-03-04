import CloseIcon from '@mui/icons-material/Close';
import { Box } from '@mui/material';
import {
  OphButton,
  OphCheckbox,
  ophColors,
} from '@opetushallitus/oph-design-system';
import { Dayjs } from 'dayjs';
import { useEffect, useRef, useState } from 'react';
import {
  CustomDatePicker,
  CustomModal,
  LoadingProgressIndicator,
} from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { CreateExamDateRequest } from 'interfaces/examDate';
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

type ExamTypeSelection = {
  speechComprehensionAndWriting: boolean;
  readingComprehensionAndSpeaking: boolean;
  allExamParts: boolean;
};

type AddExamDateModalProps = {
  isModalOpen: boolean;
  setIsModalOpen: (isOpen: boolean) => void;
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

const initialExamTypeSelection: ExamTypeSelection = {
  speechComprehensionAndWriting: false,
  readingComprehensionAndSpeaking: false,
  allExamParts: false,
};

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
  const [examTypes, setExamTypes] = useState<ExamTypeSelection>(
    initialExamTypeSelection,
  );

  const isSaving = addStatus === APIResponseStatus.InProgress;

  useEffect(() => {
    if (
      prevAddStatus.current === APIResponseStatus.InProgress &&
      addStatus === APIResponseStatus.Success
    ) {
      setExamDate(null);
      setRegistrationStart(null);
      setRegistrationEnd(null);
      setLanguageSelections(initializeLanguageSelections());
      setExamTypes(initialExamTypeSelection);
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
    setExamTypes(initialExamTypeSelection);
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

  const toggleExamType = (type: keyof ExamTypeSelection) => {
    setExamTypes((prev) => ({ ...prev, [type]: !prev[type] }));
  };

  const handleSubmit = () => {
    if (!examDate || !registrationStart || !registrationEnd) {
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

    const selectedExamTypes: string[] = [];
    if (examTypes.speechComprehensionAndWriting) {
      selectedExamTypes.push('SPEECH_COMPREHENSION_AND_WRITING');
    }
    if (examTypes.readingComprehensionAndSpeaking) {
      selectedExamTypes.push('READING_COMPREHENSION_AND_SPEAKING');
    }
    if (examTypes.allExamParts) {
      selectedExamTypes.push('ALL');
    }

    const request: CreateExamDateRequest = {
      examDate: examDate.format('YYYY-MM-DD'),
      registrationStartDate: registrationStart.format('YYYY-MM-DD'),
      registrationEndDate: registrationEnd.format('YYYY-MM-DD'),
      languages: selectedLanguages,
      examTypes: selectedExamTypes,
    };

    dispatch(addExamDate(request));
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
        className="columns gapped"
        style={{
          maxHeight: 'calc(100vh - 200px)',
          width: '50vw',
          maxWidth: '900px',
        }}
      >
        <div className="rows gapped-xl grow">
          <div className="rows gapped-xxs">
            <Label>{t('examDateLabel')} *</Label>
            <div style={{ maxWidth: '180px' }}>
              <CustomDatePicker
                value={examDate}
                setValue={setExamDate}
                error={false}
              />
            </div>
          </div>

          <div
            className="columns gapped"
            style={{
              justifyContent: 'flex-start',
            }}
          >
            <div className="rows gapped-xxs">
              <Label>{t('registrationStartLabel')} *</Label>
              <div style={{ maxWidth: '180px' }}>
                <CustomDatePicker
                  value={registrationStart}
                  setValue={setRegistrationStart}
                  error={false}
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
              <div style={{ maxWidth: '180px' }}>
                <CustomDatePicker
                  value={registrationEnd}
                  setValue={setRegistrationEnd}
                  minDate={registrationStart?.add(1, 'day') || undefined}
                  error={false}
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
                <div style={{ flex: '1 0 20%', minWidth: '150px' }}>
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
            </div>
          </div>

          <div className="rows gapped-xxs">
            <Label>{t('examLabel')} *</Label>
            <div className="rows" style={{ gap: '0.25rem' }}>
              <OphCheckbox
                checked={examTypes.speechComprehensionAndWriting}
                onChange={() => toggleExamType('speechComprehensionAndWriting')}
                label={t('examTypes.speechComprehensionAndWriting')}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
              />
              <OphCheckbox
                checked={examTypes.readingComprehensionAndSpeaking}
                onChange={() =>
                  toggleExamType('readingComprehensionAndSpeaking')
                }
                label={t('examTypes.readingComprehensionAndSpeaking')}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
              />
              <OphCheckbox
                checked={examTypes.allExamParts}
                onChange={() => toggleExamType('allExamParts')}
                label={t('examTypes.allExamParts')}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
              />
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
      </div>
    </CustomModal>
  );
};
