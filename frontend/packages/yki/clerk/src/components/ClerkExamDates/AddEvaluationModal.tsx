import CloseIcon from '@mui/icons-material/Close';
import { Box } from '@mui/material';
import { OphButton, ophColors } from '@opetushallitus/oph-design-system';
import dayjs, { Dayjs } from 'dayjs';
import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import {
  CustomDatePicker,
  CustomModal,
  LoadingProgressIndicator,
} from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExamDate, ExamDateLanguage } from 'interfaces/examDate';
import { H2, Label, Text } from 'ophTheme/Text';
import {
  resetSaveEvaluationStatus,
  saveEvaluation,
} from 'redux/reducers/examDate';
import { examDateSelector } from 'redux/selectors/examDate';
import { languageToString, levelDescription } from 'utils/clerk';

type LangDate = { startDate: Dayjs | null; endDate: Dayjs | null };

type FormErrors = {
  startMissing: Map<number, boolean>;
  endMissing: Map<number, boolean>;
  startBeforeExamDate: Map<number, boolean>;
  endBeforeStart: Map<number, boolean>;
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
  startMissing: new Map(),
  endMissing: new Map(),
  startBeforeExamDate: new Map(),
  endBeforeStart: new Map(),
});

export const AddEvaluationModal = ({
  examDate,
  onClose,
}: AddEvaluationModalProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkExamDates',
  });
  const dispatch = useAppDispatch();
  const { saveEvaluationStatus } = useAppSelector(examDateSelector);
  const prevStatus = useRef(saveEvaluationStatus);

  const [languageDates, setLanguageDates] = useState<Map<number, LangDate>>(
    new Map(),
  );
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<FormErrors>(emptyErrors());

  const isSaving = saveEvaluationStatus === APIResponseStatus.InProgress;
  const isOpen = examDate !== null;

  const validate = useCallback((): FormErrors => {
    const result = emptyErrors();

    languageDates.forEach(({ startDate, endDate }, langId) => {
      const hasStart = startDate !== null;
      const hasEnd = endDate !== null;

      result.startMissing.set(langId, hasEnd && !hasStart);
      result.endMissing.set(langId, hasStart && !hasEnd);
      result.startBeforeExamDate.set(
        langId,
        hasStart && !!examDate && startDate!.isBefore(examDate.examDate, 'day'),
      );
      result.endBeforeStart.set(
        langId,
        hasStart && hasEnd && endDate!.isBefore(startDate!, 'day'),
      );
    });

    return result;
  }, [languageDates, examDate]);

  useEffect(() => {
    if (submitted) {
      const current = validate();

      setErrors((prev) => {
        const merge = (
          prevMap: Map<number, boolean>,
          curMap: Map<number, boolean>,
        ) =>
          new Map(
            Array.from(curMap.entries()).map(([id, val]) => [
              id,
              (prevMap.get(id) ?? false) && val,
            ]),
          );

        return {
          startMissing: merge(prev.startMissing, current.startMissing),
          endMissing: merge(prev.endMissing, current.endMissing),
          startBeforeExamDate: merge(
            prev.startBeforeExamDate,
            current.startBeforeExamDate,
          ),
          endBeforeStart: merge(prev.endBeforeStart, current.endBeforeStart),
        };
      });
    }
  }, [submitted, validate]);

  useEffect(() => {
    if (examDate) {
      const dates = new Map<number, LangDate>();
      for (const lang of examDate.languages) {
        dates.set(lang.id, {
          startDate:
            lang.evaluationStartDate != null
              ? dayjs(lang.evaluationStartDate)
              : null,
          endDate:
            lang.evaluationEndDate != null
              ? dayjs(lang.evaluationEndDate)
              : null,
        });
      }
      setLanguageDates(dates);
      setSubmitted(false);
      setErrors(emptyErrors());
    } else {
      setLanguageDates(new Map());
    }
  }, [examDate]);

  useEffect(() => {
    if (
      prevStatus.current === APIResponseStatus.InProgress &&
      saveEvaluationStatus === APIResponseStatus.Success
    ) {
      onClose();
      dispatch(resetSaveEvaluationStatus());
    }
    prevStatus.current = saveEvaluationStatus;
  }, [saveEvaluationStatus, onClose, dispatch]);

  const handleCloseModal = () => {
    onClose();
    dispatch(resetSaveEvaluationStatus());
  };

  const updateLangDate = (langId: number, update: Partial<LangDate>) => {
    setLanguageDates((prev) => {
      const next = new Map(prev);
      const current = next.get(langId) ?? { startDate: null, endDate: null };
      next.set(langId, { ...current, ...update });

      return next;
    });
  };

  const handleSubmit = () => {
    const validationErrors = validate();
    setErrors(validationErrors);
    setSubmitted(true);

    const hasErrors =
      Array.from(validationErrors.startMissing.values()).some(Boolean) ||
      Array.from(validationErrors.endMissing.values()).some(Boolean) ||
      Array.from(validationErrors.startBeforeExamDate.values()).some(Boolean) ||
      Array.from(validationErrors.endBeforeStart.values()).some(Boolean);

    if (!examDate || hasErrors) {
      return;
    }

    dispatch(
      saveEvaluation({
        examDateId: examDate.id,
        evaluations: examDate.languages.map((lang) => {
          const dates = languageDates.get(lang.id);

          return {
            examDateLanguageId: lang.id,
            evaluationStartDate: dates?.startDate?.format('YYYY-MM-DD') ?? null,
            evaluationEndDate: dates?.endDate?.format('YYYY-MM-DD') ?? null,
          };
        }),
      }),
    );
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
            <Text>
              {t('evaluationModal.infoText', {
                examDate: examDate?.examDate.format('D.M.YYYY'),
              })}
            </Text>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: '1rem 2rem',
                alignItems: 'center',
              }}
            >
              <Label>{t('evaluationModal.header.languageLevel')}</Label>
              <Label>{t('evaluationModal.header.evaluationPeriod')}</Label>

              {examDate?.languages.map((lang, index) => {
                const dates = languageDates.get(lang.id);
                const startMissing = errors.startMissing.get(lang.id) ?? false;
                const endMissing = errors.endMissing.get(lang.id) ?? false;
                const startBeforeExam =
                  errors.startBeforeExamDate.get(lang.id) ?? false;
                const endBeforeStart =
                  errors.endBeforeStart.get(lang.id) ?? false;
                const isLast = index === examDate.languages.length - 1;

                return (
                  <Fragment key={lang.id}>
                    <Text>{formatLanguageLabel(lang)}</Text>
                    <div
                      className="columns gapped"
                      style={{ justifyContent: 'flex-start' }}
                    >
                      <div className="rows gapped-xxs">
                        <div style={{ maxWidth: '180px' }}>
                          <CustomDatePicker
                            value={dates?.startDate ?? null}
                            setValue={(val) =>
                              updateLangDate(lang.id, { startDate: val })
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
                        style={{ alignSelf: 'flex-start', marginTop: '16px' }}
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
                        <div style={{ maxWidth: '180px' }}>
                          <CustomDatePicker
                            value={dates?.endDate ?? null}
                            setValue={(val) =>
                              updateLangDate(lang.id, { endDate: val })
                            }
                            minDate={dates?.startDate || undefined}
                            error={submitted && (endMissing || endBeforeStart)}
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
                    {!isLast && (
                      <Box
                        style={{
                          gridColumn: '1 / -1',
                          height: '1px',
                          backgroundColor: ophColors.grey300,
                        }}
                      />
                    )}
                  </Fragment>
                );
              })}
            </div>
          </div>
        </div>
        <div className="columns gapped flex-end" style={{ flex: '0 0 auto' }}>
          <OphButton
            variant={Variant.Outlined}
            color={Color.Primary}
            onClick={handleCloseModal}
          >
            {t('evaluationModal.cancelButton')}
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
