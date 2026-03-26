import CloseIcon from '@mui/icons-material/Close';
import { Box, FormControlLabel, Radio, RadioGroup } from '@mui/material';
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
import {
  CreateEvaluationRequest,
  ExamDate,
  ExamDateLanguage,
  LanguageEvaluationOverride,
} from 'interfaces/examDate';
import { H2, Label, Text } from 'ophTheme/Text';
import {
  addEvaluation,
  resetAddEvaluationStatus,
} from 'redux/reducers/examDate';
import { examDateSelector } from 'redux/selectors/examDate';
import { languageToString, levelDescription } from 'utils/clerk';

type LanguageOverrideState = {
  useDefault: boolean;
  startDate: Dayjs | null;
  endDate: Dayjs | null;
};

type AddEvaluationModalProps = {
  examDate: ExamDate | null;
  onClose: () => void;
};

const formatLanguageLabel = (lang: ExamDateLanguage) => {
  const name = languageToString(lang.languageCode);
  const level = levelDescription(lang.levelCode as 'PERUS' | 'KESKI' | 'YLIN');

  return `${name} - ${level}`;
};

export const AddEvaluationModal = ({
  examDate,
  onClose,
}: AddEvaluationModalProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkExamDates',
  });
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();
  const { addEvaluationStatus } = useAppSelector(examDateSelector);
  const prevStatus = useRef(addEvaluationStatus);

  const [defaultStartDate, setDefaultStartDate] = useState<Dayjs | null>(null);
  const [defaultEndDate, setDefaultEndDate] = useState<Dayjs | null>(null);
  const [perLanguageDatesEnabled, setPerLanguageDatesEnabled] = useState(false);
  const [languageOverrides, setLanguageOverrides] = useState<
    Map<number, LanguageOverrideState>
  >(new Map());

  const isSaving = addEvaluationStatus === APIResponseStatus.InProgress;
  const isOpen = examDate !== null;

  useEffect(() => {
    if (examDate) {
      setDefaultStartDate(examDate.examDate);
      setDefaultEndDate(examDate.examDate);
      setPerLanguageDatesEnabled(false);
      setLanguageOverrides(
        new Map(
          examDate.languages.map((lang) => [
            lang.id,
            { useDefault: true, startDate: null, endDate: null },
          ]),
        ),
      );
    }
  }, [examDate]);

  useEffect(() => {
    if (
      prevStatus.current === APIResponseStatus.InProgress &&
      addEvaluationStatus === APIResponseStatus.Success
    ) {
      onClose();
      dispatch(resetAddEvaluationStatus());
    }
    prevStatus.current = addEvaluationStatus;
  }, [addEvaluationStatus, onClose, dispatch]);

  const handleCloseModal = () => {
    onClose();
    dispatch(resetAddEvaluationStatus());
  };

  const updateLanguageOverride = (
    langId: number,
    update: Partial<LanguageOverrideState>,
  ) => {
    setLanguageOverrides((prev) => {
      const next = new Map(prev);
      const current = next.get(langId) ?? {
        useDefault: true,
        startDate: null,
        endDate: null,
      };
      next.set(langId, { ...current, ...update });

      return next;
    });
  };

  const isValidDateOrder = (
    examDateValue: Dayjs,
    start: Dayjs | null,
    end: Dayjs | null,
  ): boolean => {
    if (!start || !end) return false;

    return !start.isBefore(examDateValue, 'day') && !end.isBefore(start, 'day');
  };

  const hasIncompleteOverrides = (): boolean => {
    if (!perLanguageDatesEnabled) return false;

    return Array.from(languageOverrides.values()).some(
      (state) => !state.useDefault && (!state.startDate || !state.endDate),
    );
  };

  const hasInvalidOverrideDates = (): boolean => {
    if (!perLanguageDatesEnabled || !examDate) return false;

    return Array.from(languageOverrides.values()).some(
      (state) =>
        !state.useDefault &&
        !isValidDateOrder(examDate.examDate, state.startDate, state.endDate),
    );
  };

  const isSubmitDisabled =
    isSaving ||
    !examDate ||
    !defaultStartDate ||
    !defaultEndDate ||
    !isValidDateOrder(examDate.examDate, defaultStartDate, defaultEndDate) ||
    hasIncompleteOverrides() ||
    hasInvalidOverrideDates();

  const handleSubmit = () => {
    if (isSubmitDisabled) return;

    const request: { examDateId: number } & CreateEvaluationRequest = {
      examDateId: examDate.id,
      evaluationStartDate: defaultStartDate.format('YYYY-MM-DD'),
      evaluationEndDate: defaultEndDate.format('YYYY-MM-DD'),
    };

    if (perLanguageDatesEnabled) {
      const overrides: LanguageEvaluationOverride[] = [];
      Array.from(languageOverrides.entries()).forEach(([langId, state]) => {
        if (!state.useDefault && state.startDate && state.endDate) {
          overrides.push({
            examDateLanguageId: langId,
            evaluationStartDate: state.startDate.format('YYYY-MM-DD'),
            evaluationEndDate: state.endDate.format('YYYY-MM-DD'),
          });
        }
      });
      if (overrides.length > 0) {
        request.overrides = overrides;
      }
    }

    dispatch(addEvaluation(request));
  };

  return (
    <CustomModal
      data-testid="add-evaluation-modal"
      open={isOpen}
      onCloseModal={handleCloseModal}
      aria-labelledby="add-evaluation-modal-title"
      modalTitle={
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={1}
        >
          <H2>{t('evaluationModal.title')}</H2>
          <CloseIcon
            data-testid="add-evaluation-modal-close"
            fontSize="large"
            onClick={handleCloseModal}
            style={{ cursor: 'pointer' }}
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
              <Text>{t('evaluationModal.infoText')}</Text>
              <ul style={{ margin: '0.5rem 0', paddingLeft: '1.5rem' }}>
                {examDate?.languages.map((lang) => (
                  <li key={lang.id}>
                    <Text>{formatLanguageLabel(lang)}</Text>
                  </li>
                ))}
              </ul>
            </div>

            <div
              className="columns gapped"
              style={{ justifyContent: 'flex-start' }}
            >
              <div className="rows gapped-xxs">
                <Label>{t('evaluationModal.evaluationStartLabel')} *</Label>
                <div style={{ maxWidth: '180px' }}>
                  <CustomDatePicker
                    value={defaultStartDate}
                    setValue={setDefaultStartDate}
                    minDate={examDate?.examDate}
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
                <Label>{t('evaluationModal.evaluationEndLabel')} *</Label>
                <div style={{ maxWidth: '180px' }}>
                  <CustomDatePicker
                    value={defaultEndDate}
                    setValue={setDefaultEndDate}
                    minDate={defaultStartDate || undefined}
                    error={false}
                  />
                </div>
              </div>
            </div>

            <OphCheckbox
              checked={perLanguageDatesEnabled}
              onChange={() => setPerLanguageDatesEnabled((prev) => !prev)}
              label={t('evaluationModal.enablePerLanguageDates')}
              sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
            />

            {perLanguageDatesEnabled &&
              examDate?.languages.map((lang) => {
                const override = languageOverrides.get(lang.id);

                return (
                  <div key={lang.id} className="rows gapped-xxs">
                    <Label>{formatLanguageLabel(lang)}</Label>
                    <RadioGroup
                      value={override?.useDefault ? 'default' : 'custom'}
                      onChange={(e) =>
                        updateLanguageOverride(lang.id, {
                          useDefault: e.target.value === 'default',
                        })
                      }
                    >
                      <FormControlLabel
                        value="default"
                        control={<Radio />}
                        label={t('evaluationModal.useDefaultDates')}
                      />
                      <FormControlLabel
                        value="custom"
                        control={<Radio />}
                        label={t('evaluationModal.setCustomDates')}
                      />
                    </RadioGroup>
                    {!override?.useDefault && (
                      <div
                        className="columns gapped"
                        style={{
                          justifyContent: 'flex-start',
                          marginLeft: '2rem',
                        }}
                      >
                        <div className="rows gapped-xxs">
                          <Label>
                            {t('evaluationModal.evaluationStartLabel')} *
                          </Label>
                          <div style={{ maxWidth: '180px' }}>
                            <CustomDatePicker
                              value={override?.startDate ?? null}
                              setValue={(val) =>
                                updateLanguageOverride(lang.id, {
                                  startDate: val,
                                })
                              }
                              minDate={examDate.examDate}
                              error={false}
                            />
                          </div>
                        </div>
                        <svg
                          width="18"
                          height="1"
                          style={{
                            alignSelf: 'flex-start',
                            marginTop: '51px',
                          }}
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
                            {t('evaluationModal.evaluationEndLabel')} *
                          </Label>
                          <div style={{ maxWidth: '180px' }}>
                            <CustomDatePicker
                              value={override?.endDate ?? null}
                              setValue={(val) =>
                                updateLanguageOverride(lang.id, {
                                  endDate: val,
                                })
                              }
                              minDate={override?.startDate || undefined}
                              error={false}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
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
              disabled={isSubmitDisabled}
            >
              {t('evaluationModal.submitButton')}
            </OphButton>
          </LoadingProgressIndicator>
        </div>
      </div>
    </CustomModal>
  );
};
