import { TableRow } from '@mui/material';
import { useState } from 'react';
import { useWindowProperties } from 'shared/hooks';

import {
  PublicInterpreterDesktopCells,
  PublicInterpreterPhoneCells,
} from 'components/publicInterpreter/listing/row/Cells';
import { CollapsibleRow } from 'components/publicInterpreter/listing/row/CollapsibleRow';
import { PublicInterpreter } from 'interfaces/publicInterpreter';

export const PublicInterpreterListingRow = ({
  interpreter,
}: {
  interpreter: PublicInterpreter;
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const { id } = interpreter;
  const { isPhone } = useWindowProperties();
  const toggleRowOpen = () => setIsOpen((prev) => !prev);

  return (
    <>
      <TableRow
        data-testid={`public-interpreters__id-${id}-row`}
        className="public-interpreter-listing-row"
        onClick={toggleRowOpen}
      >
        {isPhone ? (
          <PublicInterpreterPhoneCells
            interpreter={interpreter}
            isOpen={isOpen}
          />
        ) : (
          <PublicInterpreterDesktopCells
            interpreter={interpreter}
            isOpen={isOpen}
          />
        )}
      </TableRow>
      <CollapsibleRow
        interpreter={interpreter}
        isOpen={isOpen}
        onClick={toggleRowOpen}
      />
    </>
  );
};
