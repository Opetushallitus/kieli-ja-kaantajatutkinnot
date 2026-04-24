import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useState } from 'react';
import { Trans } from 'react-i18next';
import { Variant } from 'shared/enums';

import { ClerkQuarantineModal } from 'components/clerkQuarantine/ClerkQuarantineModal';
import { ListTable } from 'components/oph-design/table/list-table';
import { PageSizeSelector } from 'components/oph-design/table/page-size-selector';
import { ListTableColumn, Row } from 'components/oph-design/table/table-types';
import { usePublicTranslation } from 'configs/i18n';
import { RegistrationStates } from 'enums/app';
import {
  ClerkQuarantineMatch,
  ClerkQuarantineSort,
} from 'interfaces/clerkQuarantine';
import { Text } from 'ophTheme/Text';
import { languageToString } from 'utils/clerk';

type ModalState = {
  match: ClerkQuarantineMatch;
  action: 'accept' | 'reject';
};

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
  onSetReview: (
    quarantineId: number,
    registrationId: number,
    matchConfirmed: boolean,
  ) => void;
};

export const ClerkQuarantineListing = ({
  rows,
  page,
  setPage,
  pageSize,
  setPageSize,
  sort,
  setSort,
  onSetReview,
}: ClerkQuarantineListingProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkQuarantine',
  });

  const [modalState, setModalState] = useState<ModalState | null>(null);

  const handleConfirm = () => {
    if (!modalState) return;
    const matchConfirmed = modalState.action === 'accept';
    onSetReview(
      modalState.match.quarantineId,
      modalState.match.registrationId,
      matchConfirmed,
    );
    setModalState(null);
  };

  // Cells stack two values (registrant + quarantined person). Some values such
  // as email are long tokens with no spaces, so the browser cannot wrap them
  // naturally and they overflow into adjacent cells without this.
  const wideStyle = { wordBreak: 'break-word' as const };
  const narrowStyle = { whiteSpace: 'nowrap' as const, width: '1%' };

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
      style: narrowStyle,
      title: t('listing.columns.examLanguage'),
      render: ({ examLanguageCode }) => languageToString(examLanguageCode),
    },
    {
      key: 'examDate',
      sortable: true,
      style: narrowStyle,
      title: t('listing.columns.examDate'),
      render: ({ examDate }) => examDate.format('D.M.YYYY'),
    },
    {
      key: 'name',
      style: wideStyle,
      title: t('listing.columns.name'),
      render: (match) => (
        <div>
          <div>
            {match.registrant.firstName} {match.registrant.lastName}
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
      style: narrowStyle,
      title: t('listing.columns.birthdate'),
      render: (match) => (
        <div>
          <div>{match.registrant.birthdate}</div>
          <div>{match.quarantinedPerson.birthdate}</div>
        </div>
      ),
    },
    {
      key: 'ssn',
      style: narrowStyle,
      title: t('listing.columns.ssn'),
      render: (match) => (
        <div>
          <div>{match.registrant.ssn}</div>
          <div>{match.quarantinedPerson.ssn}</div>
        </div>
      ),
    },
    {
      key: 'email',
      style: wideStyle,
      title: t('listing.columns.email'),
      render: (match) => (
        <div>
          <div>{match.registrant.email}</div>
          <div>{match.quarantinedPerson.email}</div>
        </div>
      ),
    },
    {
      key: 'phoneNumber',
      style: narrowStyle,
      title: t('listing.columns.phoneNumber'),
      render: (match) => (
        <div>
          <div>{match.registrant.phoneNumber}</div>
          <div>{match.quarantinedPerson.phoneNumber}</div>
        </div>
      ),
    },
    {
      key: 'registrationState',
      style: narrowStyle,
      title: t('listing.columns.registrationState'),
      render: ({ state }) => (
        <div className="columns gapped-xs">
          {registrationStateIconMapping[state]}
          <Text>
            <strong>{t(`listing.values.registrationState.${state}`)}</strong>
          </Text>
        </div>
      ),
    },
    {
      key: 'actions',
      title: t('listing.columns.actions'),
      style: narrowStyle,
      render: (match) => (
        <div className="columns gapped-xxs">
          <OphButton
            variant={Variant.Text}
            sx={{ padding: 0, minWidth: 0 }}
            onClick={() => setModalState({ match, action: 'accept' })}
          >
            {t('listing.actions.accept')}
          </OphButton>
          <OphButton
            variant={Variant.Text}
            sx={{ padding: 0, minWidth: 0 }}
            onClick={() => setModalState({ match, action: 'reject' })}
          >
            {t('listing.actions.cancel')}
          </OphButton>
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
      <ClerkQuarantineModal
        match={modalState?.match ?? null}
        action={modalState?.action ?? null}
        onClose={() => setModalState(null)}
        onConfirm={handleConfirm}
      />
    </>
  );
};
