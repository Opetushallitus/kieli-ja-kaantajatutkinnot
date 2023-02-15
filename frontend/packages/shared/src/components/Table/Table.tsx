import {
  IconButtonProps,
  LabelDisplayedRowsArgs,
  Table,
  TableBody,
  TablePagination,
} from '@mui/material';
import { ChangeEvent, Fragment, useState } from 'react';

import { WithId } from '../../interfaces/with';
import './Table.scss';

export interface PaginatedTableProps<T extends WithId> {
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
  size?: 'small' | 'medium';
  labelDisplayedRows?: (
    labelDisplayedRowsArgs: LabelDisplayedRowsArgs
  ) => React.ReactNode;
  backIconButtonProps?: Partial<IconButtonProps>;
  nextIconButtonProps?: Partial<IconButtonProps>;
}

export const defaultDisplayedRowsLabel = ({
  from,
  to,
  count,
}: LabelDisplayedRowsArgs) => {
  return `${from} - ${to} / ${count}`;
};

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
  nextIconButtonProps
}: PaginatedTableProps<T>): JSX.Element {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);
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
        labelDisplayedRows={labelDisplayedRows ?? defaultDisplayedRowsLabel}
        backIconButtonProps={backIconButtonProps}
        nextIconButtonProps={nextIconButtonProps}
      />
    </div>
  );

  return (
    <>
      <Pagination showHeaderContent={!!headerContent} />
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
      {showBottomPagination && <Pagination showHeaderContent={false} />}
    </>
  );
}

export interface NormalTableProps<T extends WithId> {
  data: Array<T>;
  getRowDetails: (details: T) => JSX.Element;
  className: string;
  header?: JSX.Element;
  stickyHeader?: boolean;
  size?: 'small' | 'medium';
}

export function NormalTable<T extends WithId>({
  header,
  data,
  getRowDetails,
  className,
  stickyHeader,
  size,
}: NormalTableProps<T>): JSX.Element {
  return (
    <Table
      className={`${className} table`}
      stickyHeader={stickyHeader}
      size={size}
    >
      {header}
      <TableBody>
        {data.map((val) => {
          return <Fragment key={val.id}>{getRowDetails(val)}</Fragment>;
        })}
      </TableBody>
    </Table>
  );
}
