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
import { Link } from 'react-router-dom';
import { Variant } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { ClerkExamSessionCancelModal } from 'components/clerkExamSession/ClerkExamSessionCancelModal';
import { ClerkExamSessionRelocateModal } from 'components/clerkExamSession/ClerkExamSessionRelocateModal';
import { ListTable } from 'components/oph-design/table/list-table';
import { ListTableColumn } from 'components/oph-design/table/table-types';
import { usePublicTranslation } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';
import { AppRoutes, RegistrationKind, RegistrationStates } from 'enums/app';
import { ClerkRegistration } from 'interfaces/clerkRegistration';
import { Text } from 'ophTheme/Text';

const TABS = [RegistrationKind.Admission, RegistrationKind.Queue] as const;
type Tab = (typeof TABS)[number];

type ExamsListingTabsProps = {
  activeTab: Tab;
  setActiveTab: Dispatch<SetStateAction<Tab>>;
  admissionCount: number;
  queuedCount: number;
};

const ExamsListingTabs = ({
  activeTab,
  setActiveTab,
  admissionCount,
  queuedCount,
}: ExamsListingTabsProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkExamSessionRegistrations.tabs',
  });

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="clerk-exam-session-page__filter-tabs">
      <div className="columns gapped">
        {TABS.map((tab) => (
          <div
            key={tab}
            className={`clerk-exam-session-page__filter-tabs__tab ${
              activeTab === tab ? 'active' : ''
            }`}
            onClick={() => handleTabChange(tab)}
            role="button"
            tabIndex={0}
            onKeyDown={() => handleTabChange(tab)}
          >
            {tab === RegistrationKind.Admission
              ? t('admissions', { num: admissionCount })
              : t('queued', { num: queuedCount })}
          </div>
        ))}
      </div>
      <Divider />
    </div>
  );
};

export const ClerkExamSessionRegistrations = ({
  examSessionId,
  examRegistrations,
  language,
  level,
}: {
  examSessionId: number;
  examRegistrations: Array<ClerkRegistration> | null;
  language: string;
  level: string;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkCustomer.details.listing',
  });
  const { t: tButtons } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkExamSessionRegistrations.buttons',
  });
  const [activeTab, setActiveTab] = useState<Tab>(RegistrationKind.Admission);
  const [relocateRegistrationId, setRelocateRegistrationId] = useState<
    number | null
  >(null);
  const [cancelRegistrationId, setCancelRegistrationId] = useState<
    number | null
  >(null);

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

  const createRegistrationStateColumn = (
    t: typeof i18next.t,
  ): ListTableColumn<ClerkRegistration> => ({
    key: 'state',
    title: t('columns.registrationState'),
    render: ({ state, person }) => {
      return (
        <div className="rows gapped-xs">
          <Text>
            {registrationStateIconMapping[state]}
            <strong>{t(`values.registrationState.${state}`)}</strong>
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
          <Link to={AppRoutes.ClerkCustomerDetails.replace(':oid', person.oid)}>
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
    title: t('columns.date'),
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
          <IconButton
            color="secondary"
            onClick={() => setRelocateRegistrationId(id)}
            sx={{ width: 'fit-content' }}
          >
            <TurnRightOutlined color="secondary" fontSize="large" />
            {t('values.actions.relocate')}
          </IconButton>
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
    key: 'person',
    title: t('columns.positionInQueue'),
    render: ({ id }) => <div className="rows gapped-xxs">{id}</div>,
  });

  if (!examRegistrations) {
    return <></>;
  }

  const admissionsColumns = [
    createPersonColumn(t),
    createRegistrationStateColumn(t),
    createRegistrationDateColumn(t),
    createActionsColumn(t),
  ];

  const queuedColumns = [
    createPositionInQueueColumn(t),
    createPersonColumn(t),
    createRegistrationStateColumn(t),
    createRegistrationDateColumn(t),
    createActionsColumn(t),
  ];

  const admissions = examRegistrations.filter(
    (r) => r.kind === RegistrationKind.Admission,
  );
  const queued = examRegistrations.filter(
    (r) => r.kind === RegistrationKind.Queue,
  );

  return (
    <Stack spacing={4}>
      <div className="clerk-exam-session-page__tabs grid-2-columns">
        <ExamsListingTabs
          admissionCount={admissions.length ?? 0}
          queuedCount={queued.length ?? 0}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
        <div className="clerk-exam-session-page__filter-buttons">
          <OphButton
            color="primary"
            variant={Variant.Contained}
            onClick={() =>
              window.open(
                APIEndpoints.ClerkExamSessionExcel.replace(
                  ':id',
                  String(examSessionId),
                ),
              )
            }
          >
            <Download fontSize="large" /> {tButtons('downloadExcel')}
          </OphButton>
        </div>
      </div>
      {activeTab === RegistrationKind.Admission ? (
        <ListTable
          className="clerk-customer-exams-listing__table"
          rows={admissions}
          rowKeyProp="id"
          columns={admissionsColumns}
          translateHeader={false}
        />
      ) : (
        <ListTable
          className="clerk-customer-exams-listing__table"
          rows={queued}
          rowKeyProp="id"
          columns={queuedColumns}
          translateHeader={false}
        />
      )}

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
      />
    </Stack>
  );
};
