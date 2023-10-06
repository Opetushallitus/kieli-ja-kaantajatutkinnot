import { Table, TableBody, TablePagination } from '@mui/material';
import { ChangeEvent, Fragment, useRef } from 'react';

import {
  defaultDisplayedRowsLabel,
  PaginatedTableProps,
} from './PaginatedTable';
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
  rowsPerPageOptions,
  className,
  stickyHeader,
  showBottomPagination = true,
  rowsPerPageLabel,
  headerContent,
  page,
  size = 'medium',
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  labelDisplayedRows,
  backIconButtonProps,
  nextIconButtonProps,
}: ManagedPaginatedTableProps<T>): JSX.Element {
  const headerRef = useRef<HTMLDivElement>(null);
  const handlePageChange = (page: number) => {
    onPageChange(page);
    headerRef.current?.scrollIntoView();
  };
  const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
    handlePageChange(0);
    onRowsPerPageChange(+event.target.value);
  };

  const count = data.length;

  const Pagination = () => (
    <TablePagination
      className="table__head-box__pagination"
      count={count}
      component="div"
      onPageChange={(_event, newPage) => handlePageChange(newPage)}
      page={page}
      onRowsPerPageChange={handleRowsPerPageChange}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={rowsPerPageOptions}
      labelRowsPerPage={rowsPerPageLabel}
      labelDisplayedRows={labelDisplayedRows ?? defaultDisplayedRowsLabel}
      backIconButtonProps={backIconButtonProps}
      nextIconButtonProps={nextIconButtonProps}
    />
  );

  return (
    <>
      <div ref={headerRef} className="table__head-box">
        {headerContent}
        <Pagination />
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
        <div className="table__head-box">
          <Pagination />
        </div>
      )}
    </>
  );
}
