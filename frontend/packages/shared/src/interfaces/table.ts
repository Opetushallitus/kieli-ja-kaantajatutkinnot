import { WithId } from './with';
export interface PaginatedTableProps<T extends WithId> {
  data: Array<T>;
  getRowDetails: (details: T) => JSX.Element;
  initialRowsPerPage: number;
  rowsPerPageOptions: Array<number | { value: number; label: string }>;
  className: string;
  rowsPerPageLabel: string;
  header?: JSX.Element;
  stickyHeader?: boolean;
  isPhoneView?: boolean;
}
