import { ChevronLeft } from '@mui/icons-material';
import { ButtonBase, TableCell, TableRow } from '@mui/material';
import { ophColors } from '@opetushallitus/oph-design-system';
import { PropsWithChildren, useState } from 'react';

import { ListTableColumn, Row } from 'components/oph-design/table/table-types';

type TableRowsProps<T extends Row> = PropsWithChildren<{
  rowKeyProp: keyof T;
  row: T;
  columns: ListTableColumn<T>[];
  collapsibleRows: boolean;
  hoverable?: boolean;
  rowHeight?: 'small' | 'medium';
  renderCollapsibleRow?: (row: T, open: boolean) => React.ReactNode;
}>;

export const ListTableRow = <T extends Row>({
  rowKeyProp,
  row,
  columns,
  collapsibleRows,
  hoverable = true,
  rowHeight,
  renderCollapsibleRow,
}: TableRowsProps<T>) => {
  const [open, setOpen] = useState(false);

  const rowId = row?.[rowKeyProp] as string;

  return (
    <>
      <TableRow
        key={rowId}
        sx={{
          height: rowHeight === 'small' ? '40px' : '64px',
          cursor: collapsibleRows ? 'pointer' : undefined,
          ...(collapsibleRows
            ? {
                '&:nth-of-type(4n - 1)': {
                  backgroundColor: ophColors.grey50,
                },
                '&:nth-of-type(even)': {
                  backgroundColor: ophColors.white,
                },
                '&:nth-of-type(odd)': {
                  ...(hoverable && {
                    '&:hover': {
                      backgroundColor: ophColors.lightBlue2,
                    },
                  }),
                },
              }
            : {
                '&:nth-of-type(even)': {
                  backgroundColor: ophColors.grey50,
                },
                '&:nth-of-type(odd)': {
                  backgroundColor: ophColors.white,
                },
                ...(hoverable && {
                  '&:hover': {
                    backgroundColor: ophColors.lightBlue2,
                  },
                }),
              }),
        }}
      >
        {columns.map(({ key: columnKey, render, style }, i) => {
          return (
            <TableCell
              key={columnKey.toString()}
              sx={style}
              onClick={
                collapsibleRows ? () => setOpen((prev) => !prev) : undefined
              }
            >
              {collapsibleRows && i === 0 ? (
                <ButtonBase
                  aria-expanded={open}
                  onClick={(event) => {
                    event.stopPropagation();
                    setOpen((prev) => !prev);
                  }}
                  sx={{
                    color: ophColors.blue2,
                    font: 'inherit',
                    textAlign: 'left',
                    '&:hover': { textDecoration: 'underline' },
                    '&.Mui-focusVisible': {
                      outline: `2px solid ${ophColors.blue2}`,
                      outlineOffset: '2px',
                    },
                  }}
                >
                  <ChevronLeft
                    aria-hidden="true"
                    fontSize="large"
                    style={{
                      color: ophColors.black,
                      transform: open ? 'rotate(90deg)' : 'rotate(270deg)',
                      transition: 'transform 0.2s',
                      marginRight: '0.5rem',
                    }}
                  />
                  {render(row)}
                </ButtonBase>
              ) : (
                render(row)
              )}
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
