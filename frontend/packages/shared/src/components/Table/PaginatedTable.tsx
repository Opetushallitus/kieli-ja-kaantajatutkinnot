import {
  IconButtonProps,
  LabelDisplayedRowsArgs,
  Table,
  TableBody,
} from '@mui/material';
import { Fragment, useRef, useState } from 'react';

import { CustomTableProps } from './CustomTable';
import { Pagination } from './Pagination';
import { WithId } from '../../interfaces/with';
import './Table.scss';

export interface PaginatedTableProps<T extends WithId>
  extends CustomTableProps<T> {
  initialRowsPerPage: number;
  rowsPerPageOptions: Array<number | { value: number; label: string }>;
  rowsPerPageLabel: string;
  headerContent?: JSX.Element;
  showBottomPagination?: boolean;
  labelDisplayedRows?: (
    labelDisplayedRowsArgs: LabelDisplayedRowsArgs,
  ) => React.ReactNode;
  backIconButtonProps?: Partial<IconButtonProps>;
  nextIconButtonProps?: Partial<IconButtonProps>;
  controlledPaging?: {
    page: number;
    setPage: (page: number) => void;
  };
}

/**
 * Use Paginated table when paging can reset between e.g. switching to different views or tabs
 *
 * If the underlaying data can change, .e.g via filtering results, provide controlledPaging prop
 * to reset paging on relevant handlers
 */
export function PaginatedTable<T extends WithId>({
  header,
  data,
  getRowDetails,
  initialRowsPerPage,
  className,
  stickyHeader,
  showBottomPagination = true,
  headerContent,
  size = 'medium',
  controlledPaging,
  ...paginationOnlyProps
}: PaginatedTableProps<T>): JSX.Element {
  const headerRef = useRef<HTMLDivElement>(null);
  const [internalPage, setInternalPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const handlePageChange = (page: number) => {
    setPage(page);
    headerRef.current?.scrollIntoView();
  };
  const handleRowsPerPageChange = (rowsPerPage: number) => {
    handlePageChange(0);
    setRowsPerPage(rowsPerPage);
  };

  const page = controlledPaging?.page ?? internalPage;
  const setPage = controlledPaging?.setPage ?? setInternalPage;
  const count = data.length;

  const paginationControls = (
    <Pagination
      page={page}
      count={count}
      handlePageChange={handlePageChange}
      handleRowsPerPageChange={handleRowsPerPageChange}
      rowsPerPage={rowsPerPage}
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
      {showBottomPagination && paginationControls}
    </>
  );
}
