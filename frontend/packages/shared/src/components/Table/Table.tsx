import {
  LabelDisplayedRowsArgs,
  Table,
  TableBody,
  TablePagination,
} from '@mui/material';
import { ChangeEvent, Fragment, useEffect, useState } from 'react';

import { PaginatedTableProps } from '../../interfaces/table';
import { WithId } from '../../interfaces/with';

export function PaginatedTable<T extends WithId>({
  header,
  data,
  getRowDetails,
  initialRowsPerPage,
  rowsPerPageOptions,
  className,
  stickyHeader,
  isPhoneView = false,
  rowsPerPageLabel,
}: PaginatedTableProps<T>): JSX.Element {
  const PaginationDisplayedRowsLabel = ({
    from,
    to,
    count,
  }: LabelDisplayedRowsArgs) => {
    return `${from} - ${to} / ${count}`;
  };

  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const [count, setCount] = useState(data.length);
  const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
    setPage(0);
    setRowsPerPage(+event.target.value);
  };

  // Reset page count if underlying data (as measured by number of elements) changes
  useEffect(() => {
    if (count != data.length) {
      setCount(data.length);
      setPage(0);
    }
  }, [data, count]);

  const renderTablePagination = () => (
    <div className="table__head-box">
      <TablePagination
        className="table__head-box__pagination"
        count={count}
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
      {renderTablePagination()}
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
      {isPhoneView && renderTablePagination()}
    </>
  );
}
