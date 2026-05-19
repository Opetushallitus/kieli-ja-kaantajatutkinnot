import { Error } from '@mui/icons-material';
import { Stack } from '@mui/material';
import { Link } from 'react-router-dom';

import { ListTable } from 'components/oph-design/table/list-table';
import { ListTableColumn, Row } from 'components/oph-design/table/table-types';
import { usePublicTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import { ClerkCustomerSummary } from 'interfaces/clerkCustomer';
import { RouteType } from 'interfaces/user';

type ClerkCustomerSummaryRow = ClerkCustomerSummary & Row;

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
      render: ({ person }) => (
        <div>
          <Link
            to={
              route === 'clerk'
                ? AppRoutes.ClerkCustomerDetails.replace(/:oid$/, person.oid)
                : AppRoutes.OrganizerCustomerDetails.replace(
                    ':oid',
                    oid,
                  ).replace(/:personOid$/, person.oid)
            }
          >{`${person.firstName} ${person.lastName}`}</Link>
          {person.ssn ? (
            <>
              <p>{person.ssn}</p>
              <p>{person.oid}</p>
            </>
          ) : (
            <div className="columns" style={{ gap: '0.25rem' }}>
              <Error color="error" fontSize="large" />
              {person.oid}
            </div>
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
