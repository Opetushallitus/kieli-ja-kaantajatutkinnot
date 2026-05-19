import { OphButton } from '@opetushallitus/oph-design-system';
import { useState } from 'react';
import { Variant } from 'shared/enums';

import { AddNewQuarantineModal } from 'components/clerkQuarantine/listing/AddNewQuarantineModal';
import { ListTable } from 'components/oph-design/table/list-table';
import { PageSizeSelector } from 'components/oph-design/table/page-size-selector';
import { ListTableColumn, Row } from 'components/oph-design/table/table-types';
import { usePublicTranslation } from 'configs/i18n';
import {
  ActiveQuarantinesSort,
  ClerkActiveQuarantine,
} from 'interfaces/clerkQuarantine';
import { Text } from 'ophTheme/Text';
import { languageToString } from 'utils/clerk';

type ClerkActiveQuarantineRow = ClerkActiveQuarantine & Row;

type ActiveQuarantinesListingProps = {
  rows: ClerkActiveQuarantineRow[];
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  sort: ActiveQuarantinesSort;
  setSort: (sort: ActiveQuarantinesSort) => void;
};

export const ActiveQuarantinesListing = ({
  rows,
  page,
  setPage,
  pageSize,
  setPageSize,
  sort,
  setSort,
}: ActiveQuarantinesListingProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkQuarantine.activeQuarantines',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  const capitalize = (s: string) =>
    s.length > 0 ? s.charAt(0).toUpperCase() + s.slice(1) : s;

  const columns: ListTableColumn<ClerkActiveQuarantineRow>[] = [
    {
      key: 'startDate',
      sortable: true,
      style: { whiteSpace: 'nowrap' },
      title: t('listing.columns.validityPeriod'),
      render: ({ startDate, endDate }) =>
        `${startDate.format('D.M.YYYY')} - ${endDate.format('D.M.YYYY')}`,
    },
    {
      key: 'languageCode',
      style: { whiteSpace: 'nowrap' },
      title: t('listing.columns.examLanguage'),
      render: ({ languageCode }) => capitalize(languageToString(languageCode)),
    },
    {
      key: 'name',
      style: { wordBreak: 'break-word' },
      title: t('listing.columns.name'),
      render: ({ quarantinedPerson }) =>
        `${quarantinedPerson.firstName} ${quarantinedPerson.lastName}`,
    },
    {
      key: 'birthdate',
      style: { whiteSpace: 'nowrap' },
      title: t('listing.columns.birthdate'),
      render: ({ quarantinedPerson }) => quarantinedPerson.birthdate ?? '',
    },
    {
      key: 'ssn',
      style: { whiteSpace: 'nowrap' },
      title: t('listing.columns.ssn'),
      render: ({ quarantinedPerson }) => quarantinedPerson.ssn ?? '',
    },
    {
      key: 'email',
      style: { wordBreak: 'break-word' },
      title: t('listing.columns.email'),
      render: ({ quarantinedPerson }) => quarantinedPerson.email,
    },
    {
      key: 'phoneNumber',
      style: { whiteSpace: 'nowrap' },
      title: t('listing.columns.phoneNumber'),
      render: ({ quarantinedPerson }) => quarantinedPerson.phoneNumber,
    },
    {
      key: 'actions',
      title: t('listing.columns.actions'),
      style: { whiteSpace: 'nowrap' },
      render: () => (
        <div className="columns gapped-xxs">
          <OphButton
            variant={Variant.Text}
            sx={{ padding: 0, minWidth: 0 }}
            onClick={() => undefined}
          >
            {t('listing.values.actions.edit')}
          </OphButton>
          <OphButton
            variant={Variant.Text}
            sx={{ padding: 0, minWidth: 0 }}
            onClick={() => undefined}
          >
            {t('listing.values.actions.delete')}
          </OphButton>
        </div>
      ),
    },
  ];

  return (
    <div className="rows gapped" data-testid="active-quarantines-listing">
      <OphButton
        className="align-self-start"
        variant={Variant.Contained}
        onClick={() => setIsModalOpen(true)}
      >
        {t('addButton')}
      </OphButton>
      <div className="columns space-between">
        <Text>{t('listing.resultCount', { count: rows.length })}</Text>
        <PageSizeSelector pageSize={pageSize} setPageSize={setPageSize} />
      </div>
      <ListTable
        rows={rows}
        rowKeyProp="id"
        columns={columns}
        translateHeader={false}
        sort={sort}
        setSort={(s) => setSort(s as ActiveQuarantinesSort)}
        pagination={{
          page,
          setPage,
          pageSize,
          totalCount: rows.length,
        }}
      />
      <AddNewQuarantineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};
