import { DeleteOutlined, TurnRightOutlined } from '@mui/icons-material';
import BlockIcon from '@mui/icons-material/Block';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CheckCircleOutlineOutlinedIcon from '@mui/icons-material/CheckCircleOutlineOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import WarningIcon from '@mui/icons-material/Warning';
import { IconButton, Stack } from '@mui/material';
import { Box } from '@mui/system';
import { Dayjs } from 'dayjs';
import i18next from 'i18next';
import { useState } from 'react';
import { useParams } from 'react-router';
import { AppLanguage } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { ClerkExamSessionCancelModal } from 'components/clerkExamSession/ClerkExamSessionCancelModal';
import { ClerkExamSessionRelocateModal } from 'components/clerkExamSession/ClerkExamSessionRelocateModal';
import { ListTable } from 'components/oph-design/table/list-table';
import { ListTableColumn, Row } from 'components/oph-design/table/table-types';
import {
  getCurrentLang,
  useCommonTranslation,
  usePublicTranslation,
} from 'configs/i18n';
import { RegistrationStates } from 'enums/app';
import {
  AdmissionedRegistration,
  ClerkCustomerDetails,
  ExamState,
  QueueOfferStatus,
  QueueSpotOffered,
  RegistrationStatus,
} from 'interfaces/clerkCustomer';
import { RouteType } from 'interfaces/user';
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
}) => (
  <div>
    <div className="columns flex-start">
      <H3>{header}</H3>
      <span>&nbsp;</span>
      <span>{subHeader}</span>
    </div>
    {!rows?.length ? (
      <Box sx={{ margin: '1em 0' }}>{noRowsText}</Box>
    ) : (
      <ListTable
        className="clerk-customer-exams-listing__table"
        rows={rows}
        rowKeyProp="id"
        columns={columns}
        translateHeader={false}
        hoverable={false}
      />
    )}
  </div>
);

export const CustomerExamListings = ({
  customerDetails,
  route,
}: {
  customerDetails: ClerkCustomerDetails | null;
  route: RouteType;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkCustomer.details.listing',
  });
  const [relocateRegistration, setRelocateRegistration] =
    useState<AdmissionedRegistration | null>(null);
  const [cancelRegistration, setCancelRegistration] =
    useState<AdmissionedRegistration | null>(null);
  const params = useParams();

  // Tutkintopäivä (Ilmoittautumiset, Jonossa, Menneet)
  const createExamDateColumn = <T extends { examDate: Dayjs }>(
    t: typeof i18next.t,
  ): ListTableColumn<T> => ({
    key: 'examDate',
    title: t('columns.date'),
    render: ({ examDate }) => (
      <div className="rows gapped-xs">
        <Text>{DateUtils.formatOptionalDate(examDate, 'l')}</Text>
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
      <div className="columns gapped-xs">
        <Text>{translateCommon(`languages.${language}`)},</Text>
        <Text>{translateCommon(`languageLevel.${level}`)}</Text>
      </div>
    ),
  });

  // Testipaikka (Ilmoittautumiset, Jonossa, Menneet)
  const createExamLocationColumn = <
    T extends {
      examLocation: {
        name: string;
        municipality: string;
        lang: AppLanguage;
      }[];
    },
  >(
    t: typeof i18next.t,
  ): ListTableColumn<T> => ({
    key: 'examLocation',
    title: t('columns.location'),
    render: ({ examLocation }) => {
      const currentLang = getCurrentLang();
      const location = examLocation.find((l) => currentLang === l.lang);

      return (
        <div className="rows gapped-xs">
          <Text>{location?.name}</Text>
          <Text>{location?.municipality}</Text>
        </div>
      );
    },
  });

  const registrationStateIconMapping: Partial<
    Record<RegistrationStates, JSX.Element>
  > = {
    [RegistrationStates.Completed]: (
      <CheckCircleIcon fontSize="large" color="success" />
    ),
    [RegistrationStates.PaidAndCancelled]: (
      <BlockIcon fontSize="large" color="error" />
    ),
    [RegistrationStates.Cancelled]: (
      <BlockIcon fontSize="large" color="error" />
    ),
    [RegistrationStates.Expired]: <BlockIcon fontSize="large" color="error" />,
    [RegistrationStates.Submitted]: (
      <WarningIcon fontSize="large" color="warning" />
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
        <div className="columns gapped-xs">
          {registrationStateIconMapping[registrationStatus.state]}
          <Text>
            <strong>
              {t(`values.registrationState.${registrationStatus.state}`)}
            </strong>
          </Text>
          <Text>
            {registrationStatus.state === RegistrationStates.Completed && (
              <span>
                {DateUtils.formatOptionalDate(registrationStatus.paidAt, 'l')}
              </span>
            )}
          </Text>
        </div>
      );
    },
  });

  // Ilmoittautumispvm (Ilmoittautumiset, Jonossa)
  const createRegistrationDateColumn = <
    T extends { registrationDate: Dayjs | undefined },
  >(
    t: typeof i18next.t,
  ): ListTableColumn<T> => ({
    key: 'registrationDate',
    title: t('columns.registrationDate'),
    render: ({ registrationDate }) => (
      <div className="rows gapped-xs">
        <Text>{DateUtils.formatOptionalDate(registrationDate, 'l')}</Text>
      </div>
    ),
  });

  // Toiminnot (kaikissa, mutta jokaisessa eri vaihtoehdot)
  const createActionsColumn = <T extends AdmissionedRegistration>(
    t: typeof i18next.t,
  ): ListTableColumn<T> => ({
    key: 'id',
    title: t('columns.actions'),
    render: (registration) =>
      (registration.registrationState === RegistrationStates.Completed ||
        registration.registrationState === RegistrationStates.Submitted) && (
        <div className="rows gapped-xxs" style={{ alignItems: 'flex-start' }}>
          {route === 'clerk' && (
            <IconButton
              color="secondary"
              onClick={() => setRelocateRegistration(registration)}
              sx={{ width: 'fit-content' }}
            >
              <TurnRightOutlined color="secondary" fontSize="large" />
              {t('values.actions.relocate')}
            </IconButton>
          )}
          <IconButton
            color="secondary"
            onClick={() => setCancelRegistration(registration)}
            sx={{ width: 'fit-content' }}
          >
            <DeleteOutlined color="secondary" fontSize="large" />
            {t('values.actions.cancel')}
          </IconButton>
        </div>
      ),
  });

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
            color={
              queueSpotOffered.offered == QueueOfferStatus.NotAccepted
                ? 'error'
                : 'textPrimary'
            }
          >
            {t(`values.queueSpotOffered.${queueSpotOffered.offered}`)}
          </Text>
          {queueSpotOffered.offered !== QueueOfferStatus.NotOffered && (
            <Text>
              {t('values.queueSpotOffered.expiresAt', {
                expiresAt: DateUtils.formatOptionalDate(
                  queueSpotOffered.expiresAt,
                  'l',
                ),
              })}
            </Text>
          )}
        </div>
      );
    },
  });

  // Tila (Menneet)
  const examStateIconMapping: Partial<Record<ExamState, JSX.Element>> = {
    ['REVIEWED']: <SchoolOutlinedIcon fontSize="large" color="success" />,
    ['CANCELLED']: <BlockOutlinedIcon fontSize="large" color="error" />,
    ['REGISTERED']: (
      <CheckCircleOutlineOutlinedIcon fontSize="large" color="success" />
    ),
  };
  const createExamStateColumn = <T extends { state: ExamState }>(
    t: typeof i18next.t,
  ): ListTableColumn<T> => ({
    key: 'examState',
    title: t('columns.examState'),
    render: ({ state }) => (
      <div className="columns gapped-xxs">
        {examStateIconMapping[state]}
        <Text>
          <span>&nbsp;{t(`values.examState.${state}`)}</span>
        </Text>
      </div>
    ),
  });

  const registrationsColumns = [
    createExamDateColumn(t),
    createExamNameColumn(t),
    createExamLocationColumn(t),
    createRegistrationStateColumn(t),
    createRegistrationDateColumn(t),
    createActionsColumn(t),
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
        columns={registrationsColumns}
        rows={customerDetails?.admissionedRegistrations}
        header={t('headers.registrations')}
        subHeader={`(${
          customerDetails?.admissionedRegistrations?.length ?? 0
        })`}
        noRowsText={t('noRowsTexts.registrations')}
      />
      <ExamsListing
        columns={queuedExamsColumns}
        rows={customerDetails?.queueRegistrations}
        header={t('headers.queuedExams')}
        subHeader={`(${customerDetails?.queueRegistrations?.length ?? 0})`}
        noRowsText={t('noRowsTexts.queuedExams')}
      />
      <ExamsListing
        columns={pastExamsColumns}
        rows={customerDetails?.pastRegistrations}
        header={t('headers.pastExams')}
        subHeader={`(${t('subHeaders.pastExams')})`}
        noRowsText={t('noRowsTexts.pastExams')}
      />

      <ClerkExamSessionRelocateModal
        registrationId={relocateRegistration?.id ?? null}
        onClose={() => setRelocateRegistration(null)}
        examSessionId={relocateRegistration?.exam?.id ?? 0}
        language={relocateRegistration?.exam?.language ?? ''}
        level={relocateRegistration?.exam?.level ?? ''}
      />

      <ClerkExamSessionCancelModal
        registrationId={cancelRegistration?.id ?? null}
        onClose={() => setCancelRegistration(null)}
        examSessionId={cancelRegistration?.exam?.id ?? 0}
        route={route}
        organizerOid={params.oid ?? ''}
      />
    </Stack>
  );
};
