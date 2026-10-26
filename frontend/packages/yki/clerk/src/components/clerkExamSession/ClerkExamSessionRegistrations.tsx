import {
  DeleteOutlined,
  Download,
  TurnRightOutlined,
} from '@mui/icons-material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { Divider, IconButton, Stack } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import i18next from 'i18next';
import { Dispatch, SetStateAction, useState } from 'react';
import { Link, useParams } from 'react-router';
import { Variant } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { ClerkExamSessionCancelModal } from 'components/clerkExamSession/ClerkExamSessionCancelModal';
import { ClerkExamSessionRelocateModal } from 'components/clerkExamSession/ClerkExamSessionRelocateModal';
import { ListTable } from 'components/oph-design/table/list-table';
import { ListTableColumn } from 'components/oph-design/table/table-types';
import { usePublicTranslation } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import {
  AppRoutes,
  ExamSessionType,
  RegistrationKind,
  RegistrationStates,
} from 'enums/app';
import { useCanManage } from 'hooks/useCanManage';
import { ClerkExamSession } from 'interfaces/clerkExamSession';
import { ClerkRegistration } from 'interfaces/clerkRegistration';
import { RouteType } from 'interfaces/user';
import { Text } from 'ophTheme/Text';

const TABS = [
  'admissions',
  'queued',
  'paidAndCancelled',
  'cancelledOrExpired',
] as const;
type Tab = (typeof TABS)[number];

type ExamsListingTabsProps = {
  activeTab: Tab;
  setActiveTab: Dispatch<SetStateAction<Tab>>;
  registrationsByTab: Record<Tab, ClerkRegistration[]>;
};

const ExamsListingTabs = ({
  activeTab,
  setActiveTab,
  registrationsByTab,
}: ExamsListingTabsProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkExamSessionRegistrations.tabs',
  });

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="clerk-exam-session-registrations__filter-tabs">
      <div className="columns gapped">
        {TABS.map((tab) => (
          <div
            key={tab}
            className={`clerk-exam-session-registrations__filter-tabs__tab ${
              activeTab === tab ? 'active' : ''
            }`}
            onClick={() => handleTabChange(tab)}
            role="button"
            tabIndex={0}
            aria-pressed={activeTab === tab}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                handleTabChange(tab);
              }
            }}
          >
            {t(tab, { num: registrationsByTab[tab].length })}
          </div>
        ))}
      </div>
      <Divider />
    </div>
  );
};

export const ClerkExamSessionRegistrations = ({
  examSession,
  route,
}: {
  examSession: ClerkExamSession;
  route: RouteType;
}) => {
  const canManage = useCanManage(route);
  const {
    id: examSessionId,
    registrations: examRegistrations,
    type: examSessionType,
    participants,
    participantsReadListen,
    participantsSpeakWrite,
    maxParticipantsTotal,
    maxParticipantsReadListen,
    maxParticipantsSpeakWrite,
    language,
    level,
  } = examSession;
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkCustomer.details.listing',
  });
  const { t: tButtons } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkExamSessionRegistrations.buttons',
  });
  const [activeTab, setActiveTab] = useState<Tab>('admissions');
  const [relocateRegistrationId, setRelocateRegistrationId] = useState<
    number | null
  >(null);
  const [cancelRegistrationId, setCancelRegistrationId] = useState<
    number | null
  >(null);
  const params = useParams();
  const oid = params.oid ?? '';

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

  const createPartialExamTypeColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkRegistration> => ({
    key: 'partialExamType',
    title: t('columns.partialExamType'),
    render: ({ partialExamType }) => {
      const displayType =
        partialExamType === 'ALL_PARTS' ? examSessionType : partialExamType;

      return <Text>{t(`values.partialExamType.${displayType}`)}</Text>;
    },
  });

  const createRegistrationStateColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkRegistration> => ({
    key: 'state',
    title: t('columns.registrationState'),
    render: ({ state, kind, person }) => {
      return (
        <div className="rows gapped-xs">
          <Text>
            {registrationStateIconMapping[state]}
            <strong>
              {t(
                `values.registrationState.${
                  state === RegistrationStates.Cancelled &&
                  kind === RegistrationKind.Queue
                    ? 'QUEUE_CANCELLED'
                    : state
                }`,
              )}
            </strong>
          </Text>
          {person && (
            <>
              <Text>
                {person.streetAddress}
                {', '}
                {person.zip} {person.postOffice}
              </Text>
              <Text>
                {person.phoneNumber}
                {', '}
                {person.email}
              </Text>
            </>
          )}
        </div>
      );
    },
  });

  const createPersonColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkRegistration> => ({
    key: 'person',
    title: t('columns.personName'),
    render: ({ person }) =>
      person && (
        <div className="rows gapped-xxs">
          <Link
            to={
              route === 'clerk'
                ? AppRoutes.ClerkCustomerDetails.replace(
                    ':personOid',
                    person.oid,
                  )
                : AppRoutes.OrganizerCustomerDetails.replace(
                    ':oid',
                    oid,
                  ).replace(':personOid', person.oid)
            }
          >
            {person.firstName} {person.lastName}
          </Link>
          <Text>{person.socialSecurityNumber}</Text>
          <Text>{person.oid}</Text>
        </div>
      ),
  });

  const createRegistrationDateColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkRegistration> => ({
    key: 'registrationDate',
    title: t('columns.examSessionRegistrationDate'),
    render: ({ registrationDate }) => (
      <div className="rows gapped-xs">
        <Text>{DateUtils.formatOptionalDate(registrationDate, 'l')}</Text>
      </div>
    ),
  });

  const createActionsColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkRegistration> => ({
    key: 'id',
    title: t('columns.actions'),
    render: ({ id, state }) =>
      (state === RegistrationStates.Completed ||
        state === RegistrationStates.Submitted) && (
        <div className="rows gapped-xxs" style={{ alignItems: 'flex-start' }}>
          {route === 'clerk' && (
            <IconButton
              color="secondary"
              onClick={() => setRelocateRegistrationId(id)}
              sx={{ width: 'fit-content' }}
            >
              <TurnRightOutlined color="secondary" fontSize="large" />
              {t('values.actions.relocate')}
            </IconButton>
          )}
          <IconButton
            color="secondary"
            onClick={() => setCancelRegistrationId(id)}
            sx={{ width: 'fit-content' }}
          >
            <DeleteOutlined color="secondary" fontSize="large" />
            {t('values.actions.cancel')}
          </IconButton>
        </div>
      ),
  });

  const createPositionInQueueColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkRegistration> => ({
    key: 'queuePosition',
    title: t('columns.positionInQueue'),
    render: ({ queuePosition }) => (
      <div className="rows gapped-xxs">{queuePosition}</div>
    ),
  });

  if (!examRegistrations) {
    return <></>;
  }

  const admissionsColumns = [
    createPersonColumn(t),
    createPartialExamTypeColumn(t),
    createRegistrationStateColumn(t),
    createRegistrationDateColumn(t),
    ...(canManage ? [createActionsColumn(t)] : []),
  ];

  const queuedColumns = [
    createPositionInQueueColumn(t),
    createPersonColumn(t),
    createPartialExamTypeColumn(t),
    createRegistrationStateColumn(t),
    createRegistrationDateColumn(t),
    ...(canManage ? [createActionsColumn(t)] : []),
  ];

  const activeRegistrations = examRegistrations.filter(
    ({ state }) =>
      state === RegistrationStates.Completed ||
      state === RegistrationStates.Submitted,
  );
  const registrationsByTab: Record<Tab, ClerkRegistration[]> = {
    admissions: activeRegistrations.filter(
      ({ kind }) => kind === RegistrationKind.Admission,
    ),
    queued: activeRegistrations.filter(
      ({ kind }) => kind === RegistrationKind.Queue,
    ),
    paidAndCancelled: examRegistrations.filter(
      ({ state }) => state === RegistrationStates.PaidAndCancelled,
    ),
    cancelledOrExpired: examRegistrations.filter(
      ({ state }) =>
        state === RegistrationStates.Cancelled ||
        state === RegistrationStates.Expired,
    ),
  };

  const translatePartialExamTypeReadListen = () =>
    examSessionType === ExamSessionType.READ_SPEAK
      ? 'participantsRead'
      : 'participantsListen';

  const translatePartialExamTypeSpeakWrite = () =>
    examSessionType === ExamSessionType.READ_SPEAK
      ? 'participantsSpeak'
      : 'participantsWrite';

  return (
    <Stack spacing={4}>
      <div className="clerk-exam-session-registrations__tabs">
        <div className="clerk-exam-session-registrations__tabs">
          <ExamsListingTabs
            registrationsByTab={registrationsByTab}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />
        </div>
        <div className="grid-2-columns">
          {examSessionType === ExamSessionType.FULL ? (
            <Text>
              {tButtons('participants', {
                count: participants,
                max: maxParticipantsTotal,
              })}
            </Text>
          ) : (
            <div className="rows gapped-xxs">
              <Text>
                {tButtons(translatePartialExamTypeReadListen(), {
                  count: participantsReadListen,
                  max: maxParticipantsReadListen,
                })}
              </Text>
              <Text>
                {tButtons(translatePartialExamTypeSpeakWrite(), {
                  count: participantsSpeakWrite,
                  max: maxParticipantsSpeakWrite,
                })}
              </Text>
            </div>
          )}
          <div className="clerk-exam-session-registrations__filter-buttons">
            <OphButton
              color="primary"
              variant={Variant.Contained}
              onClick={() =>
                window.open(
                  route === 'clerk'
                    ? APIEndpoints.ClerkExamSessionExcel.replace(
                        ':id',
                        String(examSessionId),
                      )
                    : APIEndpoints.OrganizerExamSessionExcel.replace(
                        ':id',
                        String(examSessionId),
                      ).replace(':oid', oid),
                )
              }
            >
              <Download fontSize="large" /> {tButtons('downloadExcel')}
            </OphButton>
          </div>
        </div>
      </div>
      <ListTable
        className="clerk-customer-exams-listing__table"
        rows={registrationsByTab[activeTab]}
        rowKeyProp="id"
        columns={activeTab === 'queued' ? queuedColumns : admissionsColumns}
        translateHeader={false}
      />

      <ClerkExamSessionRelocateModal
        registrationId={relocateRegistrationId}
        onClose={() => setRelocateRegistrationId(null)}
        examSessionId={examSessionId}
        language={language}
        level={level}
      />

      <ClerkExamSessionCancelModal
        registrationId={cancelRegistrationId}
        onClose={() => setCancelRegistrationId(null)}
        examSessionId={examSessionId}
        route={route}
        organizerOid={oid}
      />
    </Stack>
  );
};
