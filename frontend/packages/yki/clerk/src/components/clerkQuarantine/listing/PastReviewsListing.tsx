import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import { OphButton } from '@opetushallitus/oph-design-system';
import { useState } from 'react';
import { Variant } from 'shared/enums';

import { RegistrationConfirmationModal } from 'components/clerkQuarantine/listing/RegistrationConfirmationModal';
import { ListTable } from 'components/oph-design/table/list-table';
import { PageSizeSelector } from 'components/oph-design/table/page-size-selector';
import { ListTableColumn, Row } from 'components/oph-design/table/table-types';
import { usePublicTranslation } from 'configs/i18n';
import { RegistrationStates } from 'enums/app';
import {
  ClerkQuarantineReview,
  ClerkQuarantineSort,
} from 'interfaces/clerkQuarantine';
import { Text } from 'ophTheme/Text';
import { languageToString } from 'utils/clerk';

type ClerkQuarantineReviewRow = ClerkQuarantineReview & Row;

type PastReviewsListingProps = {
  rows: ClerkQuarantineReviewRow[];
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (pageSize: number) => void;
  sort: ClerkQuarantineSort;
  setSort: (sort: ClerkQuarantineSort) => void;
  onCancelRegistration: (quarantineId: number, registrationId: number) => void;
};

export const PastReviewsListing = ({
  rows,
  page,
  setPage,
  pageSize,
  setPageSize,
  sort,
  setSort,
  onCancelRegistration,
}: PastReviewsListingProps) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkQuarantine',
  });

  const [pendingCancel, setPendingCancel] =
    useState<ClerkQuarantineReview | null>(null);

  const handleConfirm = () => {
    if (!pendingCancel) return;
    onCancelRegistration(
      pendingCancel.quarantineId,
      pendingCancel.registrationId,
    );
    setPendingCancel(null);
  };

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

  const columns: ListTableColumn<ClerkQuarantineReviewRow>[] = [
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
      style: { whiteSpace: 'nowrap' },
      title: t('listing.columns.examLanguage'),
      render: ({ examLanguageCode }) => languageToString(examLanguageCode),
    },
    {
      key: 'examDate',
      sortable: true,
      style: { whiteSpace: 'nowrap' },
      title: t('listing.columns.examDate'),
      render: ({ examDate }) => examDate.format('D.M.YYYY'),
    },
    {
      key: 'name',
      style: { wordBreak: 'break-word' },
      title: t('listing.columns.name'),
      render: (review) => (
        <div>
          <div>
            {review.registrant.firstName} {review.registrant.lastName}
          </div>
          <div>
            {review.quarantinedPerson.firstName}{' '}
            {review.quarantinedPerson.lastName}
          </div>
        </div>
      ),
    },
    {
      key: 'birthdate',
      style: { whiteSpace: 'nowrap' },
      title: t('listing.columns.birthdate'),
      render: (review) => (
        <div>
          <div>{review.registrant.birthdate}</div>
          <div>{review.quarantinedPerson.birthdate}</div>
        </div>
      ),
    },
    {
      key: 'ssn',
      style: { whiteSpace: 'nowrap' },
      title: t('listing.columns.ssn'),
      render: (review) => (
        <div>
          <div>{review.registrant.ssn}</div>
          <div>{review.quarantinedPerson.ssn}</div>
        </div>
      ),
    },
    {
      key: 'email',
      style: { wordBreak: 'break-word' },
      title: t('listing.columns.email'),
      render: (review) => (
        <div>
          <div>{review.registrant.email}</div>
          <div>{review.quarantinedPerson.email}</div>
        </div>
      ),
    },
    {
      key: 'phoneNumber',
      style: { whiteSpace: 'nowrap' },
      title: t('listing.columns.phoneNumber'),
      render: (review) => (
        <div>
          <div>{review.registrant.phoneNumber}</div>
          <div>{review.quarantinedPerson.phoneNumber}</div>
        </div>
      ),
    },
    {
      key: 'registrationState',
      style: { whiteSpace: 'nowrap' },
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
      style: { whiteSpace: 'nowrap' },
      render: (review) =>
        review.quarantined ? (
          <OphButton
            variant={Variant.Text}
            sx={{ padding: 0, minWidth: 0 }}
            onClick={() => setPendingCancel(review)}
          >
            {t('listing.values.actions.reject')}
          </OphButton>
        ) : null,
    },
  ];

  return (
    <div data-testid="past-reviews-listing">
      <Text>{t('reviewListing.description')}</Text>
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
        setSort={(s) => setSort(s as ClerkQuarantineSort)}
        pagination={{
          page,
          setPage,
          pageSize,
          totalCount: rows.length,
        }}
      />
      <RegistrationConfirmationModal
        match={pendingCancel}
        action={pendingCancel ? 'reject' : null}
        onClose={() => setPendingCancel(null)}
        onConfirm={handleConfirm}
      />
    </div>
  );
};
