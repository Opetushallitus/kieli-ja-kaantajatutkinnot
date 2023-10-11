import {
  IconButtonProps,
  LabelDisplayedRowsArgs,
  Table,
  TableBody,
  TablePagination,
} from '@mui/material';
import { ChangeEvent, Fragment, useRef, useState } from 'react';

import { CustomTableProps } from './CustomTable';
import { WithId } from '../../interfaces/with';
import './Table.scss';

export const defaultDisplayedRowsLabel = ({
  from,
  to,
  count,
}: LabelDisplayedRowsArgs) => {
  return `${from} - ${to} / ${count}`;
};

export interface PaginatedTableProps<T extends WithId>
  extends CustomTableProps<T> {
  initialRowsPerPage: number;
  rowsPerPageOptions: Array<number | { value: number; label: string }>;
  rowsPerPageLabel: string;
  headerContent?: JSX.Element;
  showBottomPagination?: boolean;
  labelDisplayedRows?: (
    labelDisplayedRowsArgs: LabelDisplayedRowsArgs
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
  rowsPerPageOptions,
  className,
  stickyHeader,
  showBottomPagination = true,
  rowsPerPageLabel,
  headerContent,
  size = 'medium',
  labelDisplayedRows,
  backIconButtonProps,
  nextIconButtonProps,
  controlledPaging,
}: PaginatedTableProps<T>): JSX.Element {
  const headerRef = useRef<HTMLDivElement>(null);
  const [internalPage, setInternalPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
  const handlePageChange = (page: number) => {
    setPage(page);
    headerRef.current?.scrollIntoView();
  };
  const handleRowsPerPageChange = (event: ChangeEvent<HTMLInputElement>) => {
    handlePageChange(0);
    setRowsPerPage(+event.target.value);
  };

  const page = controlledPaging?.page ?? internalPage;
  const setPage = controlledPaging?.setPage ?? setInternalPage;
  const count = data.length;

  const Pagination = ({ page }: { page: number }) => (
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
        <Pagination page={page} />
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
      {showBottomPagination && <Pagination page={page} />}
    </>
  );
}
