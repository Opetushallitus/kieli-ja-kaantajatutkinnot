import AccessTimeIcon from '@mui/icons-material/AccessTime';
import BlockIcon from '@mui/icons-material/Block';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import WarningIcon from '@mui/icons-material/Warning';
import { Stack } from '@mui/material';
import i18next from 'i18next';

import { ListTable } from 'components/oph-design/table/list-table';
import { ListTableColumn, Row } from 'components/oph-design/table/table-types';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { RegistrationStates } from 'enums/app';
import {
  ClerkCustomerDetails,
  ExamState,
  QueueOfferStatus,
  QueueSpotOffered,
  RegistrationStatus,
} from 'interfaces/clerkCustomer';
import { H3, Text } from 'ophTheme/Text';

const ExamsListing = <T extends Row>({
  columns,
  rows,
  header,
  subHeader,
  noRowsText,
}: {
  columns: ListTableColumn<T>[];
  rows: T[] | undefined;
  header: string;
  subHeader: string;
  noRowsText: string;
}) => {
  if (!rows || rows.length == 0) {
    return noRowsText;
  }

  return (
    <div>
      <div className="columns flex-start">
        <H3 style={{ marginRight: '0.25em' }}>{header}</H3>
        <span>{subHeader}</span>
      </div>
      <ListTable
        className="customer-details-listing__table"
        rows={rows}
        rowKeyProp="id"
        columns={columns}
        translateHeader={false}
      />
    </div>
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

  const registrationStateIconMapping: Partial<
    Record<RegistrationStates, JSX.Element>
  > = {
    [RegistrationStates.Completed]: (
      <CheckCircleIcon sx={{ color: 'green', fontSize: '1.2em' }} />
    ),
    [RegistrationStates.PaidAndCancelled]: (
      <BlockIcon sx={{ color: 'red', fontSize: '1.2em' }} />
    ),
    [RegistrationStates.Cancelled]: (
      <BlockIcon sx={{ color: 'red', fontSize: '1.2em' }} />
    ),
    [RegistrationStates.Expired]: (
      <BlockIcon sx={{ color: 'red', fontSize: '1.2em' }} />
    ),
    [RegistrationStates.Submitted]: (
      <WarningIcon sx={{ color: 'orange', fontSize: '1.2em' }} />
    ),
    [RegistrationStates.FreeRegistrationPending]: (
      <AccessTimeIcon sx={{ color: 'orange', fontSize: '1.2em' }} />
    ),
  };

  // Ilmoittautumisen tila (Ilmoittautumiset, Jonossa)
  const createRegistrationStateColumn = <
    T extends { registrationStatus: RegistrationStatus },
  >(
    t: typeof i18next.t,
  ): ListTableColumn<T> => ({
    key: 'registrationState',
    title: t('columns.registrationState'),
    render: ({ registrationStatus }) => {
      return (
        <div className="rows gapped-xs">
          <Text style={{ display: 'flex' }}>
            {registrationStateIconMapping[registrationStatus.state]}
            <strong style={{ margin: '0 0.25em' }}>
              {t(`values.registrationState.${registrationStatus.state}`)}
            </strong>
            {registrationStatus.state === RegistrationStates.Completed && (
              <span>{registrationStatus.paidAt}</span>
            )}
          </Text>
        </div>
      );
    },
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
          <Text
            style={{
              color:
                queueSpotOffered.offered == QueueOfferStatus.NotAccepted
                  ? 'red'
                  : undefined,
            }}
          >
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
  const examStateIconMapping: Partial<Record<ExamState, JSX.Element>> = {
    ['REVIEWED']: (
      <SchoolOutlinedIcon sx={{ color: 'green', fontSize: '1.2em' }} />
    ),
    ['CANCELLED']: (
      <BlockOutlinedIcon sx={{ color: 'red', fontSize: '1.2em' }} />
    ),
    ['REGISTERED']: (
      <CheckCircleOutlineOutlinedIcon
        sx={{ color: 'green', fontSize: '1.2em' }}
      />
    ),
  };
  const createExamStateColumn = <T extends { state: ExamState }>(
    t: typeof i18next.t,
  ): ListTableColumn<T> => ({
    key: 'examState',
    title: t('columns.examState'),
    render: ({ state }) => (
      <div className="rows gapped-xs">
        <Text style={{ display: 'flex' }}>
          {examStateIconMapping[state]}
          <span style={{ margin: '0 0.25em' }}>
            {t(`values.examState.${state}`)}
          </span>
        </Text>
      </div>
    ),
  });

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
    createExamStateColumn(t),
  ];

  return (
    <Stack spacing={4}>
      <ExamsListing
        columns={registratedExamsColumns}
        rows={customerDetails?.registrations}
        header={t('headers.registratedExams')}
        subHeader={`(${customerDetails?.registrations?.length ?? 0})`}
        noRowsText={t('noRowsTexts.registratedExams')}
      />
      <ExamsListing
        columns={queuedExamsColumns}
        rows={customerDetails?.queuedExams}
        header={t('headers.queuedExams')}
        subHeader={`(${customerDetails?.queuedExams?.length ?? 0})`}
        noRowsText={t('noRowsTexts.queuedExams')}
      />
      <ExamsListing
        columns={pastExamsColumns}
        rows={customerDetails?.pastExams}
        header={t('headers.pastExams')}
        subHeader={`(${t('subHeaders.pastExams')})`}
        noRowsText={t('noRowsTexts.pastExams')}
      />
    </Stack>
  );
};
