import { WithId } from 'interfaces/with';
export interface PaginatedTableProps<T extends WithId> {
  header?: JSX.Element;
  data: Array<T>;
  getRowDetails: (details: T) => JSX.Element;
  initialRowsPerPage: number;
  rowsPerPageOptions: Array<number | { value: number; label: string }>;
  className: string;
  stickyHeader?: boolean;
}
