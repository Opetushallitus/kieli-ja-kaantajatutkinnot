import { ChevronLeft } from '@mui/icons-material';
import { Collapse, TableCell, TableRow } from '@mui/material';
import { PropsWithChildren, useState } from 'react';

import { ListTableColumn, Row } from 'components/oph-design/table/table-types';

type TableRowsProps<T extends Row> = PropsWithChildren<{
  rowKeyProp: keyof T;
  row: T;
  columns: ListTableColumn<T>[];
}>;

export const ListTableRow = <T extends Row>({
  rowKeyProp,
  row,
  columns,
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
              {i === 0 && (
                <ChevronLeft
                  fontSize="large"
                  style={{
                    transform: open ? 'rotate(90deg)' : 'rotate(-90deg)',
                    transition: 'transform 0.2s',
                    verticalAlign: 'middle',
                    marginRight: '0.5em',
                  }}
                />
              )}
              {render(row)}
            </TableCell>
          );
        })}
      </TableRow>
      {row.collapsibleContent && (
        <Collapse in={open} timeout="auto" unmountOnExit>
          <TableRow key={`${rowId}-collapse`}>
            {columns.map(({ key: columnKey, render, style }) => {
              return (
                <TableCell key={columnKey.toString()} sx={style}>
                  {render(row)}
                </TableCell>
              );
            })}
          </TableRow>
        </Collapse>
      )}
    </>
  );
};
