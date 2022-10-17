import {
  LabelDisplayedRowsArgs,
  Table,
  TableBody,
  TablePagination,
} from '@mui/material';
import { ChangeEvent, Fragment, useEffect, useState } from 'react';

import { WithId } from '../../interfaces/with';
import './Table.scss';

interface PaginatedTableProps<T extends WithId> {
  data: Array<T>;
  getRowDetails: (details: T) => JSX.Element;
  initialRowsPerPage: number;
  rowsPerPageOptions: Array<number | { value: number; label: string }>;
  className: string;
  rowsPerPageLabel: string;
  header?: JSX.Element;
  headerContent?: JSX.Element;
  stickyHeader?: boolean;
  showBottomPagination?: boolean;
  pageP?: number;
  setPageP?: (page: number) => void;
  rowsPerPageP?: number;
  setRowsPerPageP?: (rowsPerPage: number) => void;
}

export function PaginatedTable<T extends WithId>({
  header,
  data,
  getRowDetails,
  initialRowsPerPage,
  rowsPerPageOptions,
  className,
  stickyHeader,
  showBottomPagination = true,
  rowsPerPageLabel,
  headerContent,
  pageP,
  setPageP,
  rowsPerPageP,
  setRowsPerPageP,
}: PaginatedTableProps<T>): JSX.Element {
  const PaginationDisplayedRowsLabel = ({
    from,
    to,
    count,
  }: LabelDisplayedRowsArgs) => {
    return `${from} - ${to} / ${count}`;
  };

  const [paginatedPage, setPaginatedPage] = useState(0);
  const [rowsPerPaginatedPage, setRowsPerPaginatedPage] =
    useState(initialRowsPerPage);
  const [count, setCount] = useState(data.length);

  const page = pageP !== undefined ? pageP : paginatedPage;
  const setPage = setPageP !== undefined ? setPageP : setPaginatedPage;

  const rowsPerPage =
    rowsPerPageP !== undefined ? rowsPerPageP : rowsPerPaginatedPage;
  const setRowsPerPage =
    setRowsPerPageP !== undefined ? setRowsPerPageP : setRowsPerPaginatedPage;

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
  }, [data, count, setPage]);

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
