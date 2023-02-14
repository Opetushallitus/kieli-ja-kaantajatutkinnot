import { Table, TableBody, TablePagination } from '@mui/material';
import { ChangeEvent, Fragment } from 'react';

import { WithId } from '../../interfaces/with';
import { defaultDisplayedRowsLabel, PaginatedTableProps } from './Table';
import './Table.scss';

interface ManagedPaginatedTableProps<T extends WithId>
  extends Omit<PaginatedTableProps<T>, 'initialRowsPerPage'> {
  page: number;
  onPageChange: (page: number) => void;
  rowsPerPage: number;
  onRowsPerPageChange: (rowsPerPage: number) => void;
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
  onPageChange,
  rowsPerPage,
  onRowsPerPageChange,
  labelDisplayedRows,
}: ManagedPaginatedTableProps<T>): JSX.Element {
  const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
    onPageChange(0);
    onRowsPerPageChange(+event.target.value);
  };

  const count = data.length;

  const Pagination = ({
    showHeaderContent,
  }: {
    showHeaderContent: boolean;
  }) => (
    <div className="table__head-box">
      {showHeaderContent && headerContent}
      <TablePagination
        className="table__head-box__pagination"
        count={count}
        component="div"
        onPageChange={(_event, newPage) => onPageChange(newPage)}
        page={page}
        onRowsPerPageChange={handleRowsPerPageChange}
        rowsPerPage={rowsPerPage}
        rowsPerPageOptions={rowsPerPageOptions}
        labelRowsPerPage={rowsPerPageLabel}
        labelDisplayedRows={labelDisplayedRows ?? defaultDisplayedRowsLabel}
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
