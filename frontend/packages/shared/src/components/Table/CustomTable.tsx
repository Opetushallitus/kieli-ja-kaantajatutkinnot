import { Table, TableBody } from '@mui/material';
import { Fragment } from 'react';

import { WithId } from '../../interfaces/with';
import './Table.scss';

export interface CustomTableProps<T extends WithId> {
  data: Array<T>;
  getRowDetails: (details: T) => JSX.Element;
  className: string;
  header?: JSX.Element;
  stickyHeader?: boolean;
  size?: 'small' | 'medium';
}

export function CustomTable<T extends WithId>({
  header,
  data,
  getRowDetails,
  className,
  stickyHeader,
  size = 'medium',
}: CustomTableProps<T>): JSX.Element {
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
