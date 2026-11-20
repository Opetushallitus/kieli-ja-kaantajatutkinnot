import { TableCell, TableRow } from '@mui/material';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { ListTable } from 'components/oph-design/table/list-table';

it('lets keyboard users expand and collapse an organizer row', async () => {
  const user = userEvent.setup();
  render(
    <ListTable
      rows={[{ id: 1, name: 'Organizer' }]}
      rowKeyProp="id"
      columns={[{ key: 'name', title: 'Organizer', render: (row) => row.name }]}
      collapsibleRows
      renderCollapsibleRow={(_, isOpen) =>
        isOpen ? (
          <TableRow>
            <TableCell>Exam sessions</TableCell>
          </TableRow>
        ) : null
      }
    />,
  );
  const button = screen.getByRole('button', { name: 'Organizer' });
  await user.tab();
  await user.tab();
  expect(button).toHaveFocus();
  expect(button).toHaveAttribute('aria-expanded', 'false');
  await user.keyboard('{Enter}');
  expect(button).toHaveAttribute('aria-expanded', 'true');
  expect(screen.getByText('Exam sessions')).toBeInTheDocument();
  await user.keyboard(' ');
  expect(button).toHaveAttribute('aria-expanded', 'false');
  expect(screen.queryByText('Exam sessions')).not.toBeInTheDocument();
});
