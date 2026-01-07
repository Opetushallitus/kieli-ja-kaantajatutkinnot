import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { Divider, Stack } from '@mui/material';
import { Box } from '@mui/system';
import { Dayjs } from 'dayjs';
import i18next from 'i18next';
import { Dispatch, SetStateAction, useState } from 'react';
import { DateUtils } from 'shared/utils';

import { ListTable } from 'components/oph-design/table/list-table';
import { ListTableColumn, Row } from 'components/oph-design/table/table-types';
import { usePublicTranslation } from 'configs/i18n';
import { RegistrationStates } from 'enums/app';
import { RegistrationStatus } from 'interfaces/clerkCustomer';
import { ClerkRegistration } from 'interfaces/clerkExamSession';
import { ClerkRegistrationPerson } from 'interfaces/clerkRegistration';
import { Text } from 'ophTheme/Text';

const TABS = ['admissions', 'queued'] as const;
type Tab = (typeof TABS)[number];

type ExamsListingTabsProps = {
  activeTab: Tab;
  setActiveTab: Dispatch<SetStateAction<Tab>>;
};

const ExamsListingTabs = ({
  activeTab,
  setActiveTab,
}: ExamsListingTabsProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkExamSessionRegistrations.tabs',
  });

  const handleTabChange = (tab: Tab) => {
    setActiveTab(tab);
  };

  return (
    <div className="clerk-free-registration__filter-tabs">
      <div className="columns gapped">
        {TABS.map((tab) => (
          <div
            key={tab}
            className={`clerk-free-registration__filter-tabs__tab ${
              activeTab === tab ? 'active' : ''
            }`}
            onClick={() => handleTabChange(tab)}
            role="button"
            tabIndex={0}
            onKeyDown={() => handleTabChange(tab)}
          >
            {tab === 'admissions' ? t('admissions') : t('queued')}
          </div>
        ))}
      </div>
      <Divider />
    </div>
  );
};

const ExamsListing = <T extends Row>({
  columns,
  rows,
  noRowsText,
}: {
  columns: ListTableColumn<T>[];
  rows: T[] | undefined;
  noRowsText: string;
}) => (
  <div>
    {!rows?.length ? (
      <Box sx={{ margin: '1em 0' }}>{noRowsText}</Box>
    ) : (
      <ListTable
        className="clerk-customer-exams-listing__table"
        rows={rows}
        rowKeyProp="id"
        columns={columns}
        translateHeader={false}
      />
    )}
  </div>
);

export const ClerkExamSessionRegistrations = ({
  examRegistrations,
}: {
  examRegistrations: Array<ClerkRegistration> | null;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkCustomer.details.listing',
  });

  const [activeTab, setActiveTab] = useState<Tab>('pending');

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
    T extends { state: RegistrationStatus },
  >(
    t: typeof i18next.t,
  ): ListTableColumn<T> => ({
    key: 'state',
    title: t('columns.registrationState'),
    render: ({ state }) => {
      return (
        <div className="columns gapped-xs">
          {registrationStateIconMapping[state]}
          <Text>
            <strong>{t(`values.registrationState.${state}`)}</strong>
          </Text>
        </div>
      );
    },
  });

  const createPersonColumn = <T extends { person: ClerkRegistrationPerson }>(
    t: typeof i18next.t,
  ): ListTableColumn<T> => ({
    key: 'person',
    title: t('columns.personName'),
    render: ({ person }) => (
      <div className="columns gapped-xxs">
        <Text>{person.firstName}</Text>
      </div>
    ),
  });

  const createActionsColumn = <T extends { id: number }>(
    t: typeof i18next.t,
  ): ListTableColumn<T> => ({
    key: 'id',
    title: t('columns.actions'),
    render: ({ id }) => (
      <div className="columns gapped-xxs">
        <Text>{id}</Text>
      </div>
    ),
  });

  const registrationsColumns = [
    createPersonColumn(t),
    createRegistrationStateColumn(t),
    createExamDateColumn(t),
    createActionsColumn(t),
  ];

  if (!examRegistrations) {
    return <></>;
  }

  return (
    <Stack spacing={4}>
      <ExamsListingTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <ExamsListing
        columns={registrationsColumns}
        rows={examRegistrations}
        noRowsText={t('noRowsTexts.registrations')}
      />
    </Stack>
  );
};
