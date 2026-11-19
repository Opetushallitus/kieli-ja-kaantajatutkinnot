import { Close, Error } from '@mui/icons-material';
import { IconButton, Popover, Stack } from '@mui/material';
import { useState } from 'react';
import { Trans } from 'react-i18next';
import { Link } from 'react-router';

import { ListTable } from 'components/oph-design/table/list-table';
import { ListTableColumn, Row } from 'components/oph-design/table/table-types';
import { usePublicTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import { ClerkCustomerSummary } from 'interfaces/clerkCustomer';
import { RouteType } from 'interfaces/user';
import { H3, Text } from 'ophTheme/Text';

type ClerkCustomerSummaryRow = ClerkCustomerSummary & Row;

// Organisers see the same popover, but without the link to ONR. If organisers
// start to do the individualisation themselves, the link can be shown to all.
export const NotIndividualisedIcon = ({
  oid,
  isOnrLinkShown,
}: {
  oid: string;
  isOnrLinkShown: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkCustomer.individualisation',
  });
  const [anchorElement, setAnchorElement] = useState<HTMLElement | null>(null);
  const isPopoverOpen = anchorElement !== null;

  return (
    <>
      <IconButton
        aria-label={t('title')}
        onClick={(e) => setAnchorElement(e.currentTarget)}
        sx={{ padding: 0 }}
      >
        <Error color="error" fontSize="large" />
      </IconButton>
      <Popover
        open={isPopoverOpen}
        anchorEl={anchorElement}
        onClose={() => setAnchorElement(null)}
        anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
        transformOrigin={{ vertical: 'center', horizontal: 'left' }}
      >
        <div className="rows gapped-xs" style={{ padding: '1rem' }}>
          <div className="columns space-between gapped">
            <H3>{t('title')}</H3>
            <IconButton
              aria-label={t('close')}
              onClick={() => setAnchorElement(null)}
            >
              <Close />
            </IconButton>
          </div>
          <Text>
            <Trans
              t={t}
              i18nKey="description"
              components={{
                link: isOnrLinkShown ? (
                  // eslint-disable-next-line jsx-a11y/anchor-has-content
                  <a
                    href={t('onrUrl', { oid })}
                    target="_blank"
                    rel="noopener noreferrer"
                  />
                ) : (
                  <span />
                ),
              }}
            />
          </Text>
        </div>
      </Popover>
    </>
  );
};

export const ClerkCustomersListing = ({
  customers,
  page,
  pageSize,
  totalCount,
  onPageChange,
  route,
  oid,
}: {
  customers: ClerkCustomerSummary[] | undefined;
  page: number;
  pageSize: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  route: RouteType;
  oid: string;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkCustomer.search',
  });
  const rows: ClerkCustomerSummaryRow[] =
    customers?.map((obj) => ({
      ...obj,
    })) ?? [];

  const columns: ListTableColumn<ClerkCustomerSummaryRow>[] = [
    {
      key: 'name',
      title: t('listing.columns.name'),
      render: ({ person, registrationsCount }) => (
        <div>
          <Link
            to={
              route === 'clerk'
                ? AppRoutes.ClerkCustomerDetails.replace(
                    /:personOid$/,
                    person.oid,
                  )
                : AppRoutes.OrganizerCustomerDetails.replace(
                    ':oid',
                    oid,
                  ).replace(/:personOid$/, person.oid)
            }
          >{`${person.firstName} ${person.lastName}`}</Link>
          {person.ssn && <p>{person.ssn}</p>}
          {person.individualised !== true && registrationsCount > 0 ? (
            <div className="columns" style={{ gap: '0.25rem' }}>
              <NotIndividualisedIcon
                oid={person.oid}
                isOnrLinkShown={route === 'clerk'}
              />
              {person.oid}
            </div>
          ) : (
            <p>{person.oid}</p>
          )}
        </div>
      ),
    },
    {
      key: 'registrationsCount',
      title: t('listing.columns.registrations'),
      render: ({ registrationsCount }) => registrationsCount,
    },
  ];

  return (
    <Stack spacing={4}>
      <div className="columns flex-start">
        <p>
          {t('header', {
            amount: totalCount,
          })}
        </p>
      </div>
      {rows.length > 0 && (
        <ListTable
          className="clerk-customer-exams-listing__table"
          rows={rows}
          rowKeyProp="oid"
          columns={columns}
          translateHeader={false}
          pagination={{
            page: page + 1,
            setPage: (nextPage) => onPageChange(nextPage - 1),
            pageSize,
            totalCount,
            serverSide: true,
          }}
        />
      )}
    </Stack>
  );
};
