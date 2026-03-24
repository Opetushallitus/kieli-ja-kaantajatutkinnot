import { Box, Link } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { CustomCircularProgress } from 'shared/components';
import { APIResponseStatus, Color, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { ModifyExamDateModal } from 'components/ClerkExamDates/ModifyExamDateModal';
import { ListTable } from 'components/oph-design/table/list-table';
import { PageSizeSelector } from 'components/oph-design/table/page-size-selector';
import { ListTableColumn } from 'components/oph-design/table/table-types';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExamDate } from 'interfaces/examDate';
import { H2, Text } from 'ophTheme/Text';
import { loadExamDates } from 'redux/reducers/examDate';
import { examDateSelector } from 'redux/selectors/examDate';
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
  const { status, examDates, updateStatus } = useAppSelector(examDateSelector);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [examDateToEdit, setExamDateToEdit] = useState<ExamDate | null>(null);
  const { showToast } = useToast();

  const handleCloseModifyModal = useCallback(() => {
    setExamDateToEdit(null);
  }, []);

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

  const formatLanguageLevel = (ed: ExamDate) => {
    const grouped = new Map<string, string[]>();
    ed.languages.forEach((lang) => {
      const name = languageToString(lang.languageCode);
      if (!grouped.has(name)) {
        grouped.set(name, []);
      }
      grouped.get(name)!.push(lang.levelCode);
    });

    return Array.from(grouped.entries()).map(([name, levels]) => {
      const allLevels = levels.length === 3;
      const levelStr = allLevels
        ? t('listing.allLevels')
        : levels
            .map((l) => levelDescription(l as 'PERUS' | 'KESKI' | 'YLIN'))
            .join(', ');

      return `${name} - ${levelStr}`;
    });
  };

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
          {formatLanguageLevel(row).map((line) => (
            <div key={line}>{line}</div>
          ))}
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
      key: 'reviewEvaluation',
      title: t('listing.header.reviewEvaluation'),
      render: () => (
        <Link component="button" underline="hover">
          {t('listing.addReviewEvaluation')}
        </Link>
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
          <div className="columns space-between">
            <Text>{t('listing.resultCount', { count: examDates.length })}</Text>
            <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
          </div>
          <ListTable
            rows={examDates}
            rowKeyProp="id"
            columns={columns}
            translateHeader={false}
            pagination={pagination}
          />
          <ModifyExamDateModal
            examDateToEdit={examDateToEdit}
            onClose={handleCloseModifyModal}
          />
        </>
      );
  }
};
