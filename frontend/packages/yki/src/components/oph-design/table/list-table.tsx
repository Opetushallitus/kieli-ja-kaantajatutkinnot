/* eslint-disable no-restricted-imports */

import {
  Box,
  Stack,
  Table,
  TableBody,
  TableHead,
  TableRow,
} from '@mui/material';
import { styled as muiStyled } from '@mui/material/styles';
import { shouldForwardProp } from '@mui/system/createStyled';
import { ophColors } from '@opetushallitus/oph-design-system';
import React, { useMemo } from 'react';

import { OphPagination } from './oph-pagination';
import { SelectionProps } from './table-checkboxes';
import { TableHeaderCell } from './table-header-cell';
import { ListTableColumn, Row } from './table-types';
import { ListTableRow } from 'components/oph-design/table/list-table-row';
import { useCommonTranslation } from 'configs/i18n';

const DEFAULT_BOX_BORDER = `2px solid ${ophColors.grey100}`;

const withTransientProps = (propName: string) =>
  // Emotion doesn't support transient props by default so add support manually
  shouldForwardProp(propName) && !propName.startsWith('$');

const styled: typeof muiStyled = (
  tag: Parameters<typeof muiStyled>[0],
  options: Parameters<typeof muiStyled>[1] = {},
) => {
  return muiStyled(tag, {
    shouldForwardProp: (propName: string) =>
      (!options.shouldForwardProp || options.shouldForwardProp(propName)) &&
      withTransientProps(propName),
    ...options,
  });
};

const EMPTY_ARRAY = Object.freeze([]) as Array<never>;

const StyledTable = styled(Table)({
  width: '100%',
  tableLayout: 'fixed',

  '& .MuiTableCell-root': {
    padding: '8px 8px 8px 16px',
    textAlign: 'left',
    whiteSpace: 'pre-wrap',
  },
});

const StyledTableBody = styled(TableBody)<{ collapsibleRows?: boolean }>(
  ({ theme, collapsibleRows }) => ({
    '& .MuiTableCell-root': {
      padding: theme.spacing(1, 0, 1, 2),
      textAlign: 'left',
      whiteSpace: 'pre-wrap',
      height: '64px',
      borderWidth: 0,
    },
    '& .MuiTableRow-root': {
      ...(collapsibleRows
        ? {
            '&:nth-of-type(4n - 1)': {
              '.MuiTableCell-root': {
                backgroundColor: ophColors.grey50,
              },
            },
            '&:nth-of-type(even)': {
              '.MuiTableCell-root': {
                backgroundColor: ophColors.white,
              },
            },
            '&:nth-of-type(odd)': {
              '&:hover': {
                '.MuiTableCell-root': {
                  backgroundColor: ophColors.lightBlue2,
                },
              },
            },
          }
        : {
            '&:nth-of-type(even)': {
              '.MuiTableCell-root': {
                backgroundColor: ophColors.grey50,
              },
            },
            '&:nth-of-type(odd)': {
              '.MuiTableCell-root': {
                backgroundColor: ophColors.white,
              },
            },
            '&:hover': {
              '.MuiTableCell-root': {
                backgroundColor: ophColors.lightBlue2,
              },
            },
          }),
    },
  }),
);

type ListTablePaginationProps = {
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  label?: string;
};

interface ListTableProps<T extends Row>
  extends React.ComponentProps<typeof StyledTable> {
  columns?: Array<ListTableColumn<T>>;
  rows?: Array<T>;
  sort?: string;
  setSort?: (sort: string) => void;
  translateHeader?: boolean;
  rowKeyProp: keyof T;
  pagination?: ListTablePaginationProps;
  getRowCheckboxLabel?: (row: T) => string;
  checkboxSelection?: boolean;
  selection?: SelectionProps['selection'];
  setSelection?: SelectionProps['setSelection'];
  collapsibleRows?: boolean;
  renderCollapsibleRow?: (row: T, open: boolean) => React.ReactNode;
}

const TableWrapper = styled(Box)(({ theme }) => ({
  position: 'relative',
  display: 'block',
  overflowX: 'auto',
  rowGap: theme.spacing(1),
  alignSelf: 'stretch',
}));

const TablePagination = ({
  label,
  totalCount,
  pageSize,
  page,
  setPage,
}: {
  label?: string;
  totalCount: number;
  pageSize: number;
  page: number;
  setPage: (newPage: number) => void;
}) => {
  const translateCommon = useCommonTranslation();

  return (
    <OphPagination
      aria-label={
        label ?? translateCommon('component.table.pagination.clerkRowsPerPage')
      }
      totalCount={totalCount}
      pageSize={pageSize}
      pageNumber={page}
      setPageNumber={setPage}
      previousText={translateCommon('previous')}
      nextText={translateCommon('next')}
    />
  );
};

export const ListTable = <T extends Row>({
  columns = EMPTY_ARRAY as Array<ListTableColumn<T>>,
  rows = EMPTY_ARRAY as Array<T>,
  sort,
  setSort,
  rowKeyProp,
  translateHeader = true,
  pagination,
  collapsibleRows = false,
  renderCollapsibleRow,
  ...props
}: ListTableProps<T>) => {
  const translateCommon = useCommonTranslation();

  const pageRows = useMemo(() => {
    if (pagination) {
      const start = pagination?.pageSize * (pagination.page - 1);

      return rows.slice(start, start + pagination.pageSize);
    }

    return rows;
  }, [rows, pagination]);

  return (
    <Stack spacing={1} sx={{ alignItems: 'center', width: '100%' }}>
      <TableWrapper tabIndex={0}>
        <StyledTable {...props}>
          <TableHead>
            <TableRow sx={{ borderBottom: DEFAULT_BOX_BORDER }}>
              {columns.map((columnProps) => {
                const { key, title, style, sortable } = columnProps;

                return (
                  <TableHeaderCell
                    key={key.toString()}
                    colId={key.toString()}
                    title={
                      translateHeader ? translateCommon(title ?? '') : title
                    }
                    style={style}
                    sort={sort}
                    setSort={setSort}
                    sortable={sortable}
                  />
                );
              })}
            </TableRow>
          </TableHead>
          <StyledTableBody collapsibleRows={collapsibleRows}>
            {pageRows.map((rowProps) => {
              const rowId = rowProps?.[rowKeyProp] as string;

              return (
                <ListTableRow
                  rowKeyProp={rowKeyProp}
                  key={rowId}
                  row={rowProps}
                  columns={columns}
                  collapsibleRows={collapsibleRows}
                  renderCollapsibleRow={renderCollapsibleRow}
                />
              );
            })}
          </StyledTableBody>
        </StyledTable>
      </TableWrapper>
      {pagination && (
        <TablePagination
          label={pagination.label}
          page={pagination.page}
          setPage={pagination.setPage}
          pageSize={pagination.pageSize}
          totalCount={rows?.length ?? 0}
        />
      )}
    </Stack>
  );
};

/* eslint-enable no-restricted-imports */
