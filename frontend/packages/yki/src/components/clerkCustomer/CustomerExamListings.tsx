import i18next from 'i18next';

import { ListTable } from 'components/oph-design/table/list-table';
import { ListTableColumn, Row } from 'components/oph-design/table/table-types';
import { usePublicTranslation } from 'configs/i18n';
import { ClerkCustomerDetails } from 'interfaces/clerkCustomer';
import { Text } from 'ophTheme/Text';

const ExamsListing = <T extends Row>({
  columns,
  rows,
  noRowsText,
}: {
  columns: ListTableColumn<T>[];
  rows: T[] | undefined;
  noRowsText: string;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkCustomer',
  });

  if (!rows || rows.length == 0) {
    return noRowsText;
  }

  return (
    <>
      <div className="columns space-between">
        {t('listing.registratedExams', { amount: rows?.length ?? 0 })}
      </div>
      <ListTable
        className="customer-details-listing__table"
        rows={rows}
        rowKeyProp="id"
        columns={columns}
        translateHeader={false}
      />
    </>
  );
};

export const CustomerExamListings = ({
  customerDetails,
}: {
  customerDetails: ClerkCustomerDetails | null;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkCustomer',
  });

  // Tutkintopäivä (Ilmoittautumiset, Jonossa, Menneet)
  const createExamDateColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<{ examinationDate: string }> => ({
    key: 'examDate',
    title: t('listing.header.examinationDate'),
    render: (rowProps) => (
      <div className="rows gapped-xs">
        {/* TODO: Convert registrationDate to DayJs */}
        <Text>{rowProps.examinationDate}</Text>
      </div>
    ),
  });

  // Tutkinto (Ilmoittautumiset, Jonossa, Menneet)
  // Testipaikka (Ilmoittautumiset, Jonossa, Menneet)
  // Ilmoittautumisen tila (Ilmoittautumiset)
  // Ilmoittautumispvm (Ilmoittautumiset)
  // Jonopaikkaa tarjottu (Jonossa)
  // Tila (Menneet)
  // Toiminnot (kaikissa, mutta jokaisessa eri vaihtoehdot)

  const registratedExamsColumns = [createExamDateColumn(t)];
  const queuedExamsColumns = [createExamDateColumn(t)];
  const pastExamsColumns = [createExamDateColumn(t)];

  return (
    <>
      <ExamsListing
        columns={registratedExamsColumns}
        rows={customerDetails?.registrations}
        noRowsText={t('')} // TODO:
      />
      <ExamsListing
        columns={queuedExamsColumns}
        rows={customerDetails?.queuedExams}
        noRowsText={t('')} // TODO:
      />
      <ExamsListing
        columns={pastExamsColumns}
        rows={customerDetails?.pastExams}
        noRowsText={t('')} // TODO:
      />
    </>
  );
};
