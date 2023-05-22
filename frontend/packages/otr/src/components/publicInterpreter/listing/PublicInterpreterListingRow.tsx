import { TableRow } from '@mui/material';
import { useWindowProperties } from 'shared/hooks';

import {
  PublicInterpreterDesktopCells,
  PublicInterpreterPhoneCells,
} from 'components/publicInterpreter/listing/row/Cells';
import { PublicInterpreter } from 'interfaces/publicInterpreter';

export const PublicInterpreterListingRow = ({
  interpreter,
}: {
  interpreter: PublicInterpreter;
}) => {
  const { id } = interpreter;
  const { isPhone } = useWindowProperties();

  return (
    <>
      <TableRow
        data-testid={`public-interpreters__id-${id}-row`}
        className="public-interpreter-listing-row"
      >
        {isPhone ? (
          <PublicInterpreterPhoneCells interpreter={interpreter} />
        ) : (
          <PublicInterpreterDesktopCells interpreter={interpreter} />
        )}
      </TableRow>
    </>
  );
};
