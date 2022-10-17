import {
  LabelDisplayedRowsArgs,
  Table,
  TableBody,
  TablePagination,
} from '@mui/material';
import { ChangeEvent, Fragment, useEffect, useState } from 'react';

import { WithId } from '../../interfaces/with';
import './Table.scss';

interface ManagedPaginatedTableProps<T extends WithId> {
  data: Array<T>;
  getRowDetails: (details: T) => JSX.Element;
  rowsPerPageOptions: Array<number | { value: number; label: string }>;
  className: string;
  rowsPerPageLabel: string;
  header?: JSX.Element;
  headerContent?: JSX.Element;
  stickyHeader?: boolean;
  showBottomPagination?: boolean;
  page: number;
  setPage: (page: number) => void;
  rowsPerPage: number;
  setRowsPerPage: (rowsPerPage: number) => void;
}

export function ManagedPaginatedTable<T extends WithId>({
  header,
  data,
  getRowDetails,
  rowsPerPageOptions,
  className,
  stickyHeader,
  showBottomPagination = true,
  rowsPerPageLabel,
  headerContent,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
}: ManagedPaginatedTableProps<T>): JSX.Element {
  const PaginationDisplayedRowsLabel = ({
    from,
    to,
    count,
  }: LabelDisplayedRowsArgs) => {
    return `${from} - ${to} / ${count}`;
  };
  const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setRowsPerPage(+event.target.value);
  };

  const Pagination = ({
    showHeaderContent,
  }: {
    showHeaderContent: boolean;
  }) => (
    <div className="table__head-box">
      {showHeaderContent && headerContent}
      <TablePagination
        className="table__head-box__pagination"
        count={data.length}
        component="div"
        onPageChange={(_event, newPage) => setPage(newPage)}
        page={page}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
        labelRowsPerPage={rowsPerPageLabel}
        labelDisplayedRows={PaginationDisplayedRowsLabel}
      />
    </div>
  );

  return (
    <>
      <Pagination showHeaderContent={!!headerContent} />
      <Table className={`${className} table`} stickyHeader={stickyHeader}>
        {header}
        <TableBody>
          {data
            .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
            .map((val) => {
              return <Fragment key={val.id}>{getRowDetails(val)}</Fragment>;
            })}
        </TableBody>
      </Table>
      {showBottomPagination && <Pagination showHeaderContent={false} />}
    </>
  );
}
