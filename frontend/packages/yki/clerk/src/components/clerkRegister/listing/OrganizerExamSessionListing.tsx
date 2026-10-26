import dayjs from 'dayjs';
import { useState } from 'react';
import { Link } from 'react-router';

import { ListTable } from 'components/oph-design/table/list-table';
import { ListTableColumn } from 'components/oph-design/table/table-types';
import { usePublicTranslation } from 'configs/i18n';
import { AppRoutes, ExamLevel, ExamSessionType } from 'enums/app';
import { ExamSession } from 'interfaces/examSessions';
import { RouteType } from 'interfaces/user';
import { languageToString, levelDescription } from 'utils/clerk';

type ExamSessionRow = ExamSession & {
  rowId: string;
  subtest: 'ALL_PARTS' | 'READ' | 'SPEAK' | 'LISTEN' | 'WRITE';
  subtestParticipants: number;
  subtestCapacity: number | null;
};

const levels = [ExamLevel.PERUS, ExamLevel.KESKI, ExamLevel.YLIN];

export const OrganizerExamSessionListing = ({
  examSessions,
  organizerOid,
  route,
  period,
  'data-testid': testId,
}: {
  examSessions: ExamSession[];
  organizerOid: string;
  route: RouteType;
  period: 'upcoming' | 'past';
  'data-testid'?: string;
}) => {
  const { t, i18n } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkRegister.examSessionListing',
  });
  const defaultSort = `session_date:${period === 'upcoming' ? 'asc' : 'desc'}`;
  const [sort, setSort] = useState(defaultSort);
  const [sortColumn, sortDirection] = sort.split(':');
  const compareLanguages = (a: ExamSession, b: ExamSession) =>
    languageToString(a.language_code).localeCompare(
      languageToString(b.language_code),
      i18n.language,
    );
  const compareLevels = (a: ExamSession, b: ExamSession) =>
    levels.indexOf(a.level_code) - levels.indexOf(b.level_code);
  const compareDates = (a: ExamSession, b: ExamSession) =>
    a.session_date.valueOf() - b.session_date.valueOf();

  const rows = examSessions
    .filter((exam) => exam.organizer_oid === organizerOid)
    .filter((exam) =>
      period === 'past'
        ? exam.session_date.isBefore(dayjs(), 'day')
        : !exam.session_date.isBefore(dayjs(), 'day'),
    )
    .sort((a, b) => {
      let comparison = 0;
      switch (sortColumn) {
        case 'language_code':
          comparison = compareLanguages(a, b);
          break;
        case 'level_code':
          comparison = compareLevels(a, b);
          break;
        case 'registration_start_date':
          comparison =
            a.registration_start_date.valueOf() -
            b.registration_start_date.valueOf();
          break;
        default:
          comparison = compareDates(a, b);
      }

      return (
        comparison * (sortDirection === 'desc' ? -1 : 1) ||
        compareDates(a, b) * (period === 'past' ? -1 : 1) ||
        compareLanguages(a, b) ||
        compareLevels(a, b) ||
        a.id - b.id
      );
    });

  const subtestRows = rows.flatMap<ExamSessionRow>((exam) => {
    if (exam.type === ExamSessionType.FULL) {
      return [
        {
          ...exam,
          rowId: `${exam.id}-ALL_PARTS`,
          subtest: 'ALL_PARTS',
          subtestParticipants: exam.participants,
          subtestCapacity: exam.max_participants,
        },
      ];
    }

    return [
      {
        ...exam,
        rowId: `${exam.id}-read-listen`,
        subtest: exam.type === ExamSessionType.READ_SPEAK ? 'READ' : 'LISTEN',
        subtestParticipants: exam.participants_read_listen,
        subtestCapacity: exam.max_participants_read_listen,
      },
      {
        ...exam,
        rowId: `${exam.id}-speak-write`,
        subtest: exam.type === ExamSessionType.READ_SPEAK ? 'SPEAK' : 'WRITE',
        subtestParticipants: exam.participants_speak_write,
        subtestCapacity: exam.max_participants_speak_write,
      },
    ];
  });

  const columns: ListTableColumn<ExamSessionRow>[] = [
    {
      key: 'session_date',
      title: t('header.sessionDate'),
      sortable: true,
      render: (exam) => (
        <Link
          to={
            route === 'clerk'
              ? AppRoutes.ClerkExamSession.replace(':id', String(exam.id))
              : AppRoutes.OrganizerExamSession.replace(
                  ':oid',
                  organizerOid,
                ).replace(':id', String(exam.id))
          }
        >
          {exam.session_date.format('D.M.YYYY')}
        </Link>
      ),
    },
    {
      key: 'language_code',
      title: t('header.language'),
      sortable: true,
      render: (exam) => languageToString(exam.language_code),
    },
    {
      key: 'level_code',
      title: t('header.level'),
      sortable: true,
      render: (exam) => levelDescription(exam.level_code),
    },
    {
      key: 'registration_start_date',
      title: t('header.registrationPerioid'),
      sortable: true,
      render: (exam) =>
        `${exam.registration_start_date.format('D.M.YYYY')} – ${exam.registration_end_date.format('D.M.YYYY')}`,
    },
    {
      key: 'subtest',
      title: t('header.subtest'),
      render: (exam) => t(`subtests.${exam.subtest}`),
    },
    {
      key: 'participants',
      title: t('header.registrations'),
      render: (exam) =>
        `${exam.subtestParticipants} / ${exam.subtestCapacity ?? '–'}`,
    },
  ];

  return (
    <ListTable
      data-testid={testId}
      rows={subtestRows}
      rowKeyProp="rowId"
      columns={columns}
      sort={sort}
      setSort={(value) =>
        setSort(
          value ||
            (sort === 'session_date:desc' ? 'session_date:asc' : defaultSort),
        )
      }
      translateHeader={false}
      rowHeight="small"
    />
  );
};
