import { LabelDisplayedRowsArgs, TablePagination } from '@mui/material';

import { PaginatedTableProps } from './PaginatedTable';
import { useWindowProperties } from '../../hooks';
import { WithId } from '../../interfaces';
import './Table.scss';

interface PaginationProps {
  count: number;
  handlePageChange: (page: number) => void;
  handleRowsPerPageChange: (rowsPerPage: number) => void;
  page: number;
  rowsPerPage: number;
}

const defaultDisplayedRowsLabel = ({
  from,
  to,
  count,
}: LabelDisplayedRowsArgs) => {
  return `${from} - ${to} / ${count}`;
};

export function Pagination<T extends WithId>({
  count,
  handlePageChange,
  handleRowsPerPageChange,
  labelDisplayedRows,
  page,
  rowsPerPage,
  rowsPerPageOptions,
  rowsPerPageLabel,
  backIconButtonProps,
  nextIconButtonProps,
}: Partial<PaginatedTableProps<T>> & PaginationProps): JSX.Element {
  const { isPhone } = useWindowProperties();

  return (
    <TablePagination
      className="table__head-box__pagination"
      count={count}
      component="div"
      onPageChange={(_event, newPage) => handlePageChange(newPage)}
      page={page}
      onRowsPerPageChange={(e) => handleRowsPerPageChange(+e.target.value)}
      rowsPerPage={rowsPerPage}
      rowsPerPageOptions={rowsPerPageOptions}
      labelRowsPerPage={<p id={'rowsPerPage'}>{rowsPerPageLabel}</p>}
      labelDisplayedRows={labelDisplayedRows ?? defaultDisplayedRowsLabel}
      backIconButtonProps={backIconButtonProps}
      nextIconButtonProps={nextIconButtonProps}
      SelectProps={{
        native: isPhone,
        inputProps: { 'aria-labeledby': 'rowsPerPage' },
      }}
    />
  );
}
