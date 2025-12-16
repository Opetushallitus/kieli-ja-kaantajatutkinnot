import { ChevronLeft } from '@mui/icons-material';
import { TableCell, TableRow } from '@mui/material';
import { PropsWithChildren, useState } from 'react';

import { ListTableColumn, Row } from 'components/oph-design/table/table-types';

type TableRowsProps<T extends Row> = PropsWithChildren<{
  rowKeyProp: keyof T;
  row: T;
  columns: ListTableColumn<T>[];
  collapsibleRows: boolean;
  renderCollapsibleRow?: (row: T, open: boolean) => React.ReactNode;
}>;

export const ListTableRow = <T extends Row>({
  rowKeyProp,
  row,
  columns,
  collapsibleRows,
  renderCollapsibleRow,
}: TableRowsProps<T>) => {
  const [open, setOpen] = useState(false);

  const rowId = row?.[rowKeyProp] as string;

  return (
    <>
      <TableRow key={rowId}>
        {columns.map(({ key: columnKey, render, style }, i) => {
          return (
            <TableCell
              key={columnKey.toString()}
              sx={style}
              onClick={() => setOpen((prev) => !prev)}
            >
              {collapsibleRows && i === 0 && (
                <ChevronLeft
                  fontSize="large"
                  style={{
                    transform: open ? 'rotate(90deg)' : 'rotate(270deg)',
                    transition: 'transform 0.2s',
                    verticalAlign: 'middle',
                    marginRight: '0.5rem',
                  }}
                />
              )}
              {render(row)}
            </TableCell>
          );
        })}
      </TableRow>
      {collapsibleRows &&
        renderCollapsibleRow &&
        renderCollapsibleRow(row, open)}
    </>
  );
};
