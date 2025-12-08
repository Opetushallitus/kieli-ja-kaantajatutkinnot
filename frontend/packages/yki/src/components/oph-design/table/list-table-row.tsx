import { ChevronLeft } from '@mui/icons-material';
import { TableCell, TableRow } from '@mui/material';
import i18next from 'i18next';
import { PropsWithChildren, useState } from 'react';

import { ListTableColumn, Row } from 'components/oph-design/table/table-types';
import { usePublicTranslation } from 'configs/i18n';

type TableRowsProps<T extends Row> = PropsWithChildren<{
  rowKeyProp: keyof T;
  row: T;
  columns: ListTableColumn<T>[];
  collapsibleRows: boolean;
  renderCollapsibleRow?: (
    row: T,
    open: boolean,
    t: typeof i18next.t,
  ) => React.ReactNode;
}>;

export const ListTableRow = <T extends Row>({
  rowKeyProp,
  row,
  columns,
  collapsibleRows,
  renderCollapsibleRow,
}: TableRowsProps<T>) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkRegister.listing.contentLabels',
  });
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
      {collapsibleRows &&
        renderCollapsibleRow &&
        renderCollapsibleRow(row, open, t)}
    </>
  );
};
