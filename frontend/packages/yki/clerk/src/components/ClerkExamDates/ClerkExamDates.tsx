import { Box, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { CustomCircularProgress } from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';

import { ListTable } from 'components/oph-design/table/list-table';
import { ListTableColumn } from 'components/oph-design/table/table-types';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExamDate } from 'interfaces/examDate';
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
  const { status, examDates } = useAppSelector(examDateSelector);
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadExamDates());
    }
  }, [dispatch, status]);

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
      key: 'examTypes',
      title: t('listing.header.examType'),
      render: (row) => (
        <div>
          {row.examTypes.map((type) => (
            <div key={type}>{t(EXAM_TYPE_TRANSLATION_KEYS[type] ?? type)}</div>
          ))}
        </div>
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
  ];

  const pagination = {
    page,
    setPage,
    pageSize: 20,
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
          <Typography variant="h2">
            {t('listing.errors.loadingFailed')}
          </Typography>
        </Box>
      );
    case APIResponseStatus.Success:
      return (
        <>
          <Typography sx={{ mb: 2 }}>
            {t('listing.resultCount', { count: examDates.length })}
          </Typography>
          <ListTable
            rows={examDates}
            rowKeyProp="id"
            columns={columns}
            translateHeader={false}
            pagination={pagination}
          />
        </>
      );
  }
};
