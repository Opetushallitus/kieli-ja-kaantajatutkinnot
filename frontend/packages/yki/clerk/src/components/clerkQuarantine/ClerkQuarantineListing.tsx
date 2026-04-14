import { Trans } from 'react-i18next';

import { ListTable } from 'components/oph-design/table/list-table';
import { PageSizeSelector } from 'components/oph-design/table/page-size-selector';
import { ListTableColumn, Row } from 'components/oph-design/table/table-types';
import { usePublicTranslation } from 'configs/i18n';
import {
  ClerkQuarantineMatch,
  ClerkQuarantineSort,
} from 'interfaces/clerkQuarantine';
import { Text } from 'ophTheme/Text';
import { languageToString } from 'utils/clerk';

type ClerkQuarantineMatchRow = ClerkQuarantineMatch & Row;

type ClerkQuarantineListingProps = {
  rows: ClerkQuarantineMatchRow[];
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  activeTab: 'pending' | 'previous' | 'active';
  sort: ClerkQuarantineSort;
  setSort: (sort: ClerkQuarantineSort) => void;
};

export const ClerkQuarantineListing = ({
  rows,
  page,
  setPage,
  pageSize,
  setPageSize,
  sort,
  setSort,
}: ClerkQuarantineListingProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkQuarantine',
  });

  // Cells stack two values (registrant + quarantined person). Some values such
  // as email are long tokens with no spaces, so the browser cannot wrap them
  // naturally and they overflow into adjacent cells without this.
  const style = { wordBreak: 'break-word' as const };

  const columns: ListTableColumn<ClerkQuarantineMatchRow>[] = [
    {
      key: 'personType',
      title: '',
      render: () => (
        <div>
          <div>{t('listing.personType.registrant')}</div>
          <div>{t('listing.personType.quarantinedPerson')}</div>
        </div>
      ),
    },
    {
      key: 'examLanguageCode',
      title: t('listing.columns.examLanguage'),
      render: ({ examLanguageCode }) => languageToString(examLanguageCode),
    },
    {
      key: 'examDate',
      sortable: true,
      title: t('listing.columns.examDate'),
      render: ({ examDate }) => examDate.format('D.M.YYYY'),
    },
    {
      key: 'name',
      style,
      title: t('listing.columns.name'),
      render: (match) => (
        <div>
          <div>
            {match.registrantForm.firstName} {match.registrantForm.lastName}
          </div>
          <div>
            {match.quarantinedPerson.firstName}{' '}
            {match.quarantinedPerson.lastName}
          </div>
        </div>
      ),
    },
    {
      key: 'birthdate',
      style,
      title: t('listing.columns.birthdate'),
      render: (match) => (
        <div>
          <div>{match.registrantForm.birthdate}</div>
          <div>{match.quarantinedPerson.birthdate}</div>
        </div>
      ),
    },
    {
      key: 'ssn',
      style,
      title: t('listing.columns.ssn'),
      render: (match) => (
        <div>
          <div>{match.registrantForm.ssn}</div>
          <div>{match.quarantinedPerson.ssn}</div>
        </div>
      ),
    },
    {
      key: 'email',
      style: { ...style, width: '20%' }, // Note: the default is, ~12.5% with 8 equal columns
      title: t('listing.columns.email'),
      render: (match) => (
        <div>
          <div>{match.registrantForm.email}</div>
          <div>{match.quarantinedPerson.email}</div>
        </div>
      ),
    },
    {
      key: 'phoneNumber',
      style,
      title: t('listing.columns.phoneNumber'),
      render: (match) => (
        <div>
          <div>{match.registrantForm.phoneNumber}</div>
          <div>{match.quarantinedPerson.phoneNumber}</div>
        </div>
      ),
    },
  ];

  return (
    <>
      <Text>
        <Trans
          t={t}
          i18nKey="listing.description"
          components={{ bold: <strong /> }}
        />
      </Text>
      <div className="columns space-between">
        <Text>{t('listing.resultCount', { count: rows.length })}</Text>
        <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
      </div>
      <ListTable
        rows={rows}
        rowKeyProp="quarantineId"
        columns={columns}
        translateHeader={false}
        sort={sort}
        setSort={(s) => setSort(s as ClerkQuarantineSort)}
        pagination={{
          page,
          setPage,
          pageSize,
          totalCount: rows.length,
        }}
      />
    </>
  );
};
