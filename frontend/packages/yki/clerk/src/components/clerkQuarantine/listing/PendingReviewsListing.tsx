import { OphButton } from '@opetushallitus/oph-design-system';
import { useState } from 'react';
import { Trans } from 'react-i18next';
import { Variant } from 'shared/enums';

import { RegistrationConfirmationModal } from 'components/clerkQuarantine/listing/RegistrationConfirmationModal';
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

type ModalState = {
  match: ClerkQuarantineMatch;
  action: 'accept' | 'reject';
};

type ClerkQuarantineMatchRow = ClerkQuarantineMatch & Row;

type PendingReviewsListing = {
  rows: ClerkQuarantineMatchRow[];
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  activeTab: 'pendingReviews' | 'pastReviews' | 'activeQuarantines';
  sort: ClerkQuarantineSort;
  setSort: (sort: ClerkQuarantineSort) => void;
  onSetReview: (
    quarantineId: number,
    registrationId: number,
    matchConfirmed: boolean,
  ) => void;
};

export const PendingReviewsListing = ({
  rows,
  page,
  setPage,
  pageSize,
  setPageSize,
  sort,
  setSort,
  onSetReview,
}: PendingReviewsListing) => {
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
      style: {
        whiteSpace: 'nowrap',
        maxWidth: '100px',
      },
      title: t('listing.columns.examLanguage'),
      render: ({ examLanguageCode }) => languageToString(examLanguageCode),
    },
    {
      key: 'examDate',
      sortable: true,
      style: {
        whiteSpace: 'nowrap',
        maxWidth: '100px',
      },
      title: t('listing.columns.examDate'),
      render: ({ examDate }) => examDate.format('D.M.YYYY'),
    },
    {
      key: 'name',
      style: { wordBreak: 'break-word' },
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
      style: { whiteSpace: 'nowrap' },
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
      style: { whiteSpace: 'nowrap' },
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
      style: { wordBreak: 'break-word' },
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
      style: { whiteSpace: 'nowrap' },
      title: t('listing.columns.phoneNumber'),
      render: (match) => (
        <div>
          <div>{match.registrant.phoneNumber}</div>
          <div>{match.quarantinedPerson.phoneNumber}</div>
        </div>
      ),
    },

    {
      key: 'actions',
      title: t('listing.columns.actions'),
      style: { whiteSpace: 'nowrap' },
      render: (match) => (
        <div className="columns gapped-xxs">
          <OphButton
            variant={Variant.Text}
            sx={{ padding: 0, minWidth: 0 }}
            onClick={() => setModalState({ match, action: 'accept' })}
          >
            {t('listing.values.actions.accept')}
          </OphButton>
          <OphButton
            variant={Variant.Text}
            sx={{ padding: 0, minWidth: 0 }}
            onClick={() => setModalState({ match, action: 'reject' })}
          >
            {t('listing.values.actions.reject')}
          </OphButton>
        </div>
      ),
    },
  ];

  return (
    <div data-testid="pending-reviews-listing">
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
      <RegistrationConfirmationModal
        match={modalState?.match ?? null}
        action={modalState?.action ?? null}
        onClose={() => setModalState(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
};
