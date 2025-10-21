import i18next from 'i18next';

import { ListTable } from 'components/oph-design/table/list-table';
import { ListTableColumn, Row } from 'components/oph-design/table/table-types';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { RegistrationStates } from 'enums/app';
import {
  ClerkCustomerDetails,
  QueueOfferStatus,
  QueueSpotOffered,
} from 'interfaces/clerkCustomer';
import { Text } from 'ophTheme/Text';

const ExamsListing = <T extends Row>({
  columns,
  rows,
  header,
  noRowsText,
}: {
  columns: ListTableColumn<T>[];
  rows: T[] | undefined;
  header: string;
  noRowsText: string;
}) => {
  if (!rows || rows.length == 0) {
    return noRowsText;
  }

  return (
    <>
      <div className="columns space-between">{header}</div>
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
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkCustomer.details.listing',
  });

  // Tutkintopäivä (Ilmoittautumiset, Jonossa, Menneet)
  const createExamDateColumn = <T extends { examinationDate: string }>(
    t: typeof i18next.t,
  ): ListTableColumn<T> => ({
    key: 'examDate',
    title: t('columns.date'),
    render: ({ examinationDate }) => (
      <div className="rows gapped-xs">
        {/* TODO: Convert registrationDate to DayJs */}
        <Text>{examinationDate}</Text>
      </div>
    ),
  });

  // Tutkinto (Ilmoittautumiset, Jonossa, Menneet)
  const createExamNameColumn = <
    T extends { exam: { language: string; level: string } },
  >(
    t: typeof i18next.t,
  ): ListTableColumn<T> => ({
    key: 'examName',
    title: t('columns.name'),
    render: ({ exam: { language, level } }) => (
      <div className="rows gapped-xs">
        <Text>
          {translateCommon(`languages.${language}`) +
            ', ' +
            translateCommon(`languageLevel.${level}`)}
        </Text>
      </div>
    ),
  });

  // Testipaikka (Ilmoittautumiset, Jonossa, Menneet)
  const createExamLocationColumn = <
    T extends { examLocation: { schoolName: string; municipality: string } },
  >(
    t: typeof i18next.t,
  ): ListTableColumn<T> => ({
    key: 'examLocation',
    title: t('columns.location'),
    render: ({ examLocation: { schoolName, municipality } }) => (
      <div className="rows gapped-xs">
        <Text>{schoolName}</Text>
        <Text>{municipality}</Text>
      </div>
    ),
  });

  // Ilmoittautumisen tila (Ilmoittautumiset, Jonossa)
  const createRegistrationStateColumn = <
    T extends { registrationStatus: RegistrationStates },
  >(
    t: typeof i18next.t,
  ): ListTableColumn<T> => ({
    key: 'registrationState',
    title: t('columns.registrationState'),
    render: ({ registrationStatus }) => (
      <div className="rows gapped-xs">
        <Text>{t(`values.registrationState.${registrationStatus}`)}</Text>
      </div>
    ),
  });

  // Ilmoittautumispvm (Ilmoittautumiset, Jonossa)
  const createRegistrationDateColumn = <T extends { registrationDate: string }>(
    t: typeof i18next.t,
  ): ListTableColumn<T> => ({
    key: 'registrationDate',
    title: t('columns.registrationDate'),
    render: ({ registrationDate }) => (
      <div className="rows gapped-xs">
        <Text>{registrationDate}</Text>
      </div>
    ),
  });

  // TODO:
  // Toiminnot (kaikissa, mutta jokaisessa eri vaihtoehdot)

  // Jonopaikkaa tarjottu (Jonossa)
  const createQueueSpotOfferedColumn = <
    T extends { queueSpotOffered: QueueSpotOffered },
  >(
    t: typeof i18next.t,
  ): ListTableColumn<T> => ({
    key: 'queueSpotOffered',
    title: t('columns.queueSpotOffered'),
    render: ({ queueSpotOffered }) => {
      return (
        <div className="rows gapped-xs">
          <Text>
            {t(`values.queueSpotOffered.${queueSpotOffered.offered}`)}
          </Text>
          {queueSpotOffered.offered !== QueueOfferStatus.NotOffered && (
            <Text>
              {t('values.queueSpotOffered.dueDate', {
                dueDate: queueSpotOffered.dueDate,
              })}
            </Text>
          )}
        </div>
      );
    },
  });

  // Tila (Menneet)

  const registratedExamsColumns = [
    createExamDateColumn(t),
    createExamNameColumn(t),
    createExamLocationColumn(t),
    createRegistrationStateColumn(t),
    createRegistrationDateColumn(t),
  ];
  const queuedExamsColumns = [
    createExamDateColumn(t),
    createExamNameColumn(t),
    createExamLocationColumn(t),
    createRegistrationStateColumn(t),
    createRegistrationDateColumn(t),
    createQueueSpotOfferedColumn(t),
  ];
  const pastExamsColumns = [
    createExamDateColumn(t),
    createExamNameColumn(t),
    createExamLocationColumn(t),
  ];

  return (
    <>
      <ExamsListing
        columns={registratedExamsColumns}
        rows={customerDetails?.registrations}
        header={t('headers.registratedExams', {
          amount: customerDetails?.registrations?.length ?? 0,
        })}
        noRowsText={t('noRowsTexts.registratedExams')}
      />
      <ExamsListing
        columns={queuedExamsColumns}
        rows={customerDetails?.queuedExams}
        header={t('headers.queuedExams', {
          amount: customerDetails?.queuedExams?.length ?? 0,
        })}
        noRowsText={t('noRowsTexts.queuedExams')}
      />
      <ExamsListing
        columns={pastExamsColumns}
        rows={customerDetails?.pastExams}
        header={t('headers.pastExams', {
          amount: customerDetails?.pastExams?.length ?? 0,
        })}
        noRowsText={t('noRowsTexts.pastExams')}
      />
    </>
  );
};
