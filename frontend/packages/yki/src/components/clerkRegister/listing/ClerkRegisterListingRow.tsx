import { TableCell, TableRow } from '@mui/material';
import { Text } from 'shared/components';

import { ClerkOrganizer } from 'interfaces/clerkOrganizer';

export const ClerkRegisterListingRow = ({
  organizer,
}: {
  organizer: ClerkOrganizer;
}) => {
  const { oid, agreement_end_date } = organizer;

  return (
    <TableRow className="clerk-organizer-listing__row">
      <TableCell>
        <Text>{`${oid}`}</Text>
      </TableCell>
      <TableCell>
        <Text>{`${agreement_end_date}`}</Text>
      </TableCell>
      <TableCell>
        <Text>Paikkakunta</Text>
      </TableCell>
    </TableRow>
  );
};
