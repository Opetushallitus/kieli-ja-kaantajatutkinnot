import CloseIcon from '@mui/icons-material/Close';
import { Box, FormControlLabel, Radio, RadioGroup } from '@mui/material';
import {
  OphButton,
  OphCheckbox,
  ophColors,
} from '@opetushallitus/oph-design-system';
import { Dayjs } from 'dayjs';
import { useCallback, useEffect, useRef, useState } from 'react';
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

type FormErrors = {
  defaultStartDate: boolean;
  defaultEndDate: boolean;
  defaultStartDateBeforeExamDate: boolean;
  defaultEndDateBeforeStartDate: boolean;
  overrideStartDates: Map<number, boolean>;
  overrideEndDates: Map<number, boolean>;
  overrideStartDatesBeforeExamDate: Map<number, boolean>;
  overrideEndDatesBeforeStartDate: Map<number, boolean>;
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

const emptyErrors = (): FormErrors => ({
  defaultStartDate: false,
  defaultEndDate: false,
  defaultStartDateBeforeExamDate: false,
  defaultEndDateBeforeStartDate: false,
  overrideStartDates: new Map(),
  overrideEndDates: new Map(),
  overrideStartDatesBeforeExamDate: new Map(),
  overrideEndDatesBeforeStartDate: new Map(),
});

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
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>(emptyErrors());

  const isSaving = addEvaluationStatus === APIResponseStatus.InProgress;
  const isOpen = examDate !== null;

  const validate = useCallback((): FormErrors => {
    const result = emptyErrors();

    result.defaultStartDate = !defaultStartDate;
    result.defaultEndDate = !defaultEndDate;
    result.defaultStartDateBeforeExamDate =
      !!defaultStartDate &&
      !!examDate &&
      defaultStartDate.isBefore(examDate.examDate, 'day');
    result.defaultEndDateBeforeStartDate =
      !!defaultStartDate &&
      !!defaultEndDate &&
      defaultEndDate.isBefore(defaultStartDate, 'day');

    if (perLanguageDatesEnabled) {
      Array.from(languageOverrides.entries()).forEach(([langId, state]) => {
        if (state.useDefault) return;

        result.overrideStartDates.set(langId, !state.startDate);
        result.overrideEndDates.set(langId, !state.endDate);
        result.overrideStartDatesBeforeExamDate.set(
          langId,
          !!state.startDate &&
            !!examDate &&
            state.startDate.isBefore(examDate.examDate, 'day'),
        );
        result.overrideEndDatesBeforeStartDate.set(
          langId,
          !!state.startDate &&
            !!state.endDate &&
            state.endDate.isBefore(state.startDate, 'day'),
        );
      });
    }

    return result;
  }, [
    defaultStartDate,
    defaultEndDate,
    examDate,
    perLanguageDatesEnabled,
    languageOverrides,
  ]);

  useEffect(() => {
    if (submitted) {
      const current = validate();

      setErrors((prev) => ({
        defaultStartDate: prev.defaultStartDate && current.defaultStartDate,
        defaultEndDate: prev.defaultEndDate && current.defaultEndDate,
        defaultStartDateBeforeExamDate:
          prev.defaultStartDateBeforeExamDate &&
          current.defaultStartDateBeforeExamDate,
        defaultEndDateBeforeStartDate:
          prev.defaultEndDateBeforeStartDate &&
          current.defaultEndDateBeforeStartDate,
        overrideStartDates: new Map(
          Array.from(current.overrideStartDates.entries()).map(([id, val]) => [
            id,
            (prev.overrideStartDates.get(id) ?? false) && val,
          ]),
        ),
        overrideEndDates: new Map(
          Array.from(current.overrideEndDates.entries()).map(([id, val]) => [
            id,
            (prev.overrideEndDates.get(id) ?? false) && val,
          ]),
        ),
        overrideStartDatesBeforeExamDate: new Map(
          Array.from(current.overrideStartDatesBeforeExamDate.entries()).map(
            ([id, val]) => [
              id,
              (prev.overrideStartDatesBeforeExamDate.get(id) ?? false) && val,
            ],
          ),
        ),
        overrideEndDatesBeforeStartDate: new Map(
          Array.from(current.overrideEndDatesBeforeStartDate.entries()).map(
            ([id, val]) => [
              id,
              (prev.overrideEndDatesBeforeStartDate.get(id) ?? false) && val,
            ],
          ),
        ),
      }));
    }
  }, [submitted, validate]);

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
      setSubmitted(false);
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

  const handleSubmit = () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    setSubmitted(true);

    const hasValidationErrors =
      validationErrors.defaultStartDate ||
      validationErrors.defaultEndDate ||
      validationErrors.defaultStartDateBeforeExamDate ||
      validationErrors.defaultEndDateBeforeStartDate ||
      Array.from(validationErrors.overrideStartDates.values()).some(Boolean) ||
      Array.from(validationErrors.overrideEndDates.values()).some(Boolean) ||
      Array.from(
        validationErrors.overrideStartDatesBeforeExamDate.values(),
      ).some(Boolean) ||
      Array.from(
        validationErrors.overrideEndDatesBeforeStartDate.values(),
      ).some(Boolean);

    if (
      !examDate ||
      hasValidationErrors ||
      !defaultStartDate ||
      !defaultEndDate
    ) {
      return;
    }

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
                    error={
                      submitted &&
                      (errors.defaultStartDate ||
                        errors.defaultStartDateBeforeExamDate)
                    }
                    helperText={
                      submitted && errors.defaultStartDate
                        ? t('evaluationModal.errors.required')
                        : submitted && errors.defaultStartDateBeforeExamDate
                        ? t('evaluationModal.errors.startDateBeforeExamDate')
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
                <Label>{t('evaluationModal.evaluationEndLabel')} *</Label>
                <div style={{ maxWidth: '180px' }}>
                  <CustomDatePicker
                    value={defaultEndDate}
                    setValue={setDefaultEndDate}
                    minDate={defaultStartDate || undefined}
                    error={
                      submitted &&
                      (errors.defaultEndDate ||
                        errors.defaultEndDateBeforeStartDate)
                    }
                    helperText={
                      submitted && errors.defaultEndDate
                        ? t('evaluationModal.errors.required')
                        : submitted && errors.defaultEndDateBeforeStartDate
                        ? t('evaluationModal.errors.endDateBeforeStartDate')
                        : undefined
                    }
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
                const startMissing =
                  errors.overrideStartDates.get(lang.id) ?? false;
                const endMissing =
                  errors.overrideEndDates.get(lang.id) ?? false;
                const startBeforeExam =
                  errors.overrideStartDatesBeforeExamDate.get(lang.id) ?? false;
                const endBeforeStart =
                  errors.overrideEndDatesBeforeStartDate.get(lang.id) ?? false;

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
                              error={
                                submitted && (startMissing || startBeforeExam)
                              }
                              helperText={
                                submitted && startMissing
                                  ? t('evaluationModal.errors.required')
                                  : submitted && startBeforeExam
                                  ? t(
                                      'evaluationModal.errors.startDateBeforeExamDate',
                                    )
                                  : undefined
                              }
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
                              error={
                                submitted && (endMissing || endBeforeStart)
                              }
                              helperText={
                                submitted && endMissing
                                  ? t('evaluationModal.errors.required')
                                  : submitted && endBeforeStart
                                  ? t(
                                      'evaluationModal.errors.endDateBeforeStartDate',
                                    )
                                  : undefined
                              }
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
              disabled={isSaving}
            >
              {t('evaluationModal.submitButton')}
            </OphButton>
          </LoadingProgressIndicator>
        </div>
      </div>
    </CustomModal>
  );
};
