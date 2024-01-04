import { Table, TableBody } from '@mui/material';
import { Fragment, useRef } from 'react';

import { PaginatedTableProps } from './PaginatedTable';
import { Pagination } from './Pagination';
import { WithId } from '../../interfaces/with';
import './Table.scss';

interface ManagedPaginatedTableProps<T extends WithId>
  extends Omit<PaginatedTableProps<T>, 'initialRowsPerPage'> {
  page: number;
  onPageChange: (page: number) => void;
  rowsPerPage: number;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

/**
 * Use ManagedPaginatedTable when the pagination state needs to be controlled by redux
 * e.g. to preserve pagination state between tab or view toggles
 */
export function ManagedPaginatedTable<T extends WithId>({
  header,
  data,
  getRowDetails,
  className,
  stickyHeader,
  showBottomPagination = true,
  headerContent,
  page,
  size = 'medium',
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  ...paginationOnlyProps
}: ManagedPaginatedTableProps<T>): JSX.Element {
  const headerRef = useRef<HTMLDivElement>(null);
  const handlePageChange = (page: number) => {
    onPageChange(page);
    headerRef.current?.scrollIntoView();
  };
  const handleRowsPerPageChange = (rowsPerPage: number) => {
    handlePageChange(0);
    onRowsPerPageChange(rowsPerPage);
  };

  const count = data.length;

  const paginationControls = (
    <Pagination
      handlePageChange={handlePageChange}
      handleRowsPerPageChange={handleRowsPerPageChange}
      page={page}
      rowsPerPage={rowsPerPage}
      count={count}
      {...paginationOnlyProps}
    />
  );

  return (
    <>
      <div ref={headerRef} className="table__head-box">
        {headerContent}
        {paginationControls}
      </div>
      <Table
        className={`${className} table`}
        stickyHeader={stickyHeader}
        size={size}
      >
        {header}
        <TableBody>
          {data
            .slice(page * rowsPerPage, (page + 1) * rowsPerPage)
            .map((val) => {
              return <Fragment key={val.id}>{getRowDetails(val)}</Fragment>;
            })}
        </TableBody>
      </Table>
      {showBottomPagination && (
        <div className="table__head-box">{paginationControls}</div>
      )}
    </>
  );
}
