import { Box, FormControlLabel, Link } from '@mui/material';
import { OphCheckbox } from '@opetushallitus/oph-design-system';
import dayjs from 'dayjs';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { CustomCircularProgress } from 'shared/components';
import { APIResponseStatus, Color, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { AddEvaluationModal } from 'components/ClerkExamDates/AddEvaluationModal';
import { ModifyExamDateModal } from 'components/ClerkExamDates/ModifyExamDateModal';
import { ListTable } from 'components/oph-design/table/list-table';
import { PageSizeSelector } from 'components/oph-design/table/page-size-selector';
import { ListTableColumn } from 'components/oph-design/table/table-types';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExamDate, ExamDateSort } from 'interfaces/examDate';
import { H2, Text } from 'ophTheme/Text';
import { loadExamDates, setExamDateSort } from 'redux/reducers/examDate';
import {
  examDateSelector,
  selectSortedExamDates,
} from 'redux/selectors/examDate';
import { languageToString, levelDescription } from 'utils/clerk';

const EXAM_TYPE_TRANSLATION_KEYS: Record<string, string> = {
  FULL: 'modal.examTypes.allExamParts',
  READ_SPEAK: 'modal.examTypes.readingComprehensionAndSpeaking',
  LISTEN_WRITE: 'modal.examTypes.speechComprehensionAndWriting',
};

export const ClerkExamDates = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkExamDates',
  });
  const dispatch = useAppDispatch();
  const {
    status,
    examDateSort,
    updateStatus,
    saveEvaluationStatus,
    deleteStatus,
  } = useAppSelector(examDateSelector);
  const examDates = useAppSelector(selectSortedExamDates);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [examDateToEdit, setExamDateToEdit] = useState<ExamDate | null>(null);
  const [examDateForEvaluation, setExamDateForEvaluation] =
    useState<ExamDate | null>(null);
  const { showToast } = useToast();

  const handleCloseModifyModal = useCallback(() => {
    setExamDateToEdit(null);
  }, []);

  const handleCloseEvaluationModal = useCallback(() => {
    setExamDateForEvaluation(null);
  }, []);
  const [showPastDates, setShowPastDates] = useState(false);

  const toggleShowPastDates = () => {
    setShowPastDates((prev) => !prev);
    setPage(1);
  };

  const filteredExamDates = useMemo(() => {
    if (showPastDates) return examDates;
    const today = dayjs();

    return examDates.filter((ed) => !ed.examDate.isBefore(today, 'day'));
  }, [examDates, showPastDates]);

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadExamDates());
    }
  }, [dispatch, status]);

  useEffect(() => {
    if (updateStatus === APIResponseStatus.Success) {
      handleCloseModifyModal();
      showToast({
        description: t('toasts.examDateUpdated'),
        severity: Severity.Success,
      });
    } else if (updateStatus === APIResponseStatus.Error) {
      showToast({
        description: t('toasts.examDateUpdateError'),
        severity: Severity.Error,
      });
    }
  }, [updateStatus, showToast, handleCloseModifyModal, t]);

  useEffect(() => {
    if (saveEvaluationStatus === APIResponseStatus.Success) {
      handleCloseEvaluationModal();
      showToast({
        description: t('toasts.evaluationAdded'),
        severity: Severity.Success,
      });
    } else if (saveEvaluationStatus === APIResponseStatus.Error) {
      showToast({
        description: t('toasts.evaluationAddError'),
        severity: Severity.Error,
      });
    }
  }, [saveEvaluationStatus, showToast, handleCloseEvaluationModal, t]);

  useEffect(() => {
    if (deleteStatus === APIResponseStatus.Success) {
      handleCloseModifyModal();
      showToast({
        description: t('toasts.examDateDeleted'),
        severity: Severity.Success,
      });
    }
  }, [deleteStatus, handleCloseModifyModal, showToast, t]);

  const columns: ListTableColumn<ExamDate>[] = [
    {
      key: 'examDate',
      title: t('listing.header.examDate'),
      sortable: true,
      render: (row) => <span>{row.examDate.format('D.M.YYYY')}</span>,
    },
    {
      key: 'languages',
      title: t('listing.header.languageLevels'),
      render: (row) => (
        <div>
          {row.languages.map((lang) => (
            <div key={lang.id}>
              {`${languageToString(lang.languageCode)} - ${levelDescription(
                lang.levelCode as 'PERUS' | 'KESKI' | 'YLIN',
              )}`}
            </div>
          ))}
          <div aria-hidden="true" style={{ visibility: 'hidden' }}>
            {t('listing.editReviewEvaluation')}
          </div>
        </div>
      ),
    },
    {
      key: 'reviewEvaluation',
      title: t('listing.header.reviewEvaluation'),
      render: (row) => (
        <div>
          {row.languages.map((lang) => (
            <div key={lang.id}>
              {lang.evaluationStartDate && lang.evaluationEndDate
                ? `${dayjs(lang.evaluationStartDate).format(
                    'D.M.YYYY',
                  )}-${dayjs(lang.evaluationEndDate).format('D.M.YYYY')}`
                : '\u00A0'}
            </div>
          ))}
          <Link
            component="button"
            underline="hover"
            onClick={() => setExamDateForEvaluation(row)}
          >
            {t('listing.editReviewEvaluation')}
          </Link>
        </div>
      ),
    },
    {
      key: 'examType',
      title: t('listing.header.examType'),
      render: (row) => (
        <span>
          {t(EXAM_TYPE_TRANSLATION_KEYS[row.examType] ?? row.examType)}
        </span>
      ),
    },
    {
      key: 'registrationPeriod',
      title: t('listing.header.registrationPeriod'),
      render: (row) => (
        <span>
          {row.registrationStartDate.format('D.M.YYYY')}-
          {row.registrationEndDate.format('D.M.YYYY')}
        </span>
      ),
    },
    {
      key: 'edit',
      title: t('listing.header.edit'),
      render: (row) => (
        <Link
          component="button"
          underline="hover"
          onClick={() => setExamDateToEdit(row)}
        >
          {t('listing.edit')}
        </Link>
      ),
    },
  ];

  const pagination = {
    page,
    setPage,
    pageSize,
  };

  switch (status) {
    case APIResponseStatus.NotStarted:
    case APIResponseStatus.InProgress:
      return <CustomCircularProgress color={Color.Secondary} />;
    case APIResponseStatus.Cancelled:
    case APIResponseStatus.Error:
      return (
        <Box
          minHeight="10vh"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <H2>{t('listing.errors.loadingFailed')}</H2>
        </Box>
      );
    case APIResponseStatus.Success:
      return (
        <>
          <FormControlLabel
            control={
              <OphCheckbox
                checked={showPastDates}
                onChange={toggleShowPastDates}
                sx={{ '& .MuiSvgIcon-root': { fontSize: 24 } }}
              />
            }
            label={t('listing.showPastDates')}
          />
          <div className="columns space-between">
            <Text>
              {t('listing.resultCount', { count: filteredExamDates.length })}
            </Text>
            <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
          </div>
          <ListTable
            rows={filteredExamDates}
            rowKeyProp="id"
            columns={columns}
            translateHeader={false}
            pagination={pagination}
            sort={examDateSort}
            setSort={(sort: string) =>
              dispatch(setExamDateSort(sort as ExamDateSort))
            }
          />
          <ModifyExamDateModal
            examDateToEdit={examDateToEdit}
            onClose={handleCloseModifyModal}
          />
          <AddEvaluationModal
            examDate={examDateForEvaluation}
            onClose={handleCloseEvaluationModal}
          />
        </>
      );
  }
};
