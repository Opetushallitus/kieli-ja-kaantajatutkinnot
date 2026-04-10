import { ListTable } from 'components/oph-design/table/list-table';
import { ListTableColumn, Row } from 'components/oph-design/table/table-types';
import { usePublicTranslation } from 'configs/i18n';
import { ClerkQuarantineMatch } from 'interfaces/clerkQuarantine';
import { Text } from 'ophTheme/Text';
import { languageToString } from 'utils/clerk';

type ClerkQuarantineMatchRow = ClerkQuarantineMatch & Row;

type ClerkQuarantineListingProps = {
  matches: ClerkQuarantineMatch[];
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  activeTab: 'pending' | 'previous' | 'active';
};

export const ClerkQuarantineListing = ({
  matches,
  page,
  setPage,
  pageSize,
}: ClerkQuarantineListingProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkQuarantine',
  });

  const rows: ClerkQuarantineMatchRow[] = matches.map((match) => ({
    ...match,
  }));

  const columns: ListTableColumn<ClerkQuarantineMatchRow>[] = [
    {
      key: 'examLanguageCode',
      title: t('listing.columns.examLanguage'),
      render: ({ examLanguageCode }) => languageToString(examLanguageCode),
    },
    {
      key: 'examDate',
      title: t('listing.columns.examDate'),
      render: ({ examDate }) => examDate.format('D.M.YYYY'),
    },
    {
      key: 'name',
      title: t('listing.columns.name'),
      render: ({ quarantinedPerson }) =>
        `${quarantinedPerson.firstName} ${quarantinedPerson.lastName}`,
    },
    {
      key: 'birthdate',
      title: t('listing.columns.birthdate'),
      render: ({ quarantinedPerson }) => quarantinedPerson.birthdate,
    },
    {
      key: 'ssn',
      title: t('listing.columns.ssn'),
      render: ({ quarantinedPerson }) => quarantinedPerson.ssn,
    },
    {
      key: 'email',
      title: t('listing.columns.email'),
      render: ({ quarantinedPerson }) => quarantinedPerson.email,
    },
    {
      key: 'phoneNumber',
      title: t('listing.columns.phoneNumber'),
      render: ({ quarantinedPerson }) => quarantinedPerson.phoneNumber,
    },
  ];

  return (
    <>
      <Text>{t('listing.resultCount', { count: matches.length })}</Text>
      <ListTable
        rows={rows}
        rowKeyProp="quarantineId"
        columns={columns}
        translateHeader={false}
        pagination={{
          page,
          setPage,
          pageSize,
          totalCount: matches.length,
        }}
      />
    </>
  );
};
