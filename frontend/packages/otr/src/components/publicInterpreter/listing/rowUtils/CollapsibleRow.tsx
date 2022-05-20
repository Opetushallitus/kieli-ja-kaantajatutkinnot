import { Collapse, TableCell, TableRow } from '@mui/material';
import { H3, Text } from 'shared/components';
import { useWindowProperties } from 'shared/hooks';

import { useAppTranslation } from 'configs/i18n';
import { PublicInterpreter } from 'interfaces/publicInterpreter';

const getInterpreterDetail = (field?: string) => field ?? '-';

export const CollapsibleRow = ({
  isOpen,
  interpreter,
}: {
  isOpen: boolean;
  interpreter: PublicInterpreter;
}) => {
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.publicInterpreterListing',
  });
  const { isPhone } = useWindowProperties();

  return (
    <TableRow>
      <TableCell
        colSpan={isPhone ? 0 : 3}
        className="public-interpreter-listing-row__collapse"
      >
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <div className="columns public-interpreter-listing-row__extra-details">
            <div className="rows margin-right-xs">
              <H3>{t('row.extraDetails.email')}:</H3>
              <H3>{t('row.extraDetails.phoneNumber')}:</H3>
              <H3>{t('row.extraDetails.otherContactInfo')}:</H3>
            </div>
            <div className="rows public-interpreter-listing-row__collapse__fields">
              <Text>{getInterpreterDetail(interpreter.email)}</Text>
              <Text>{getInterpreterDetail(interpreter.phoneNumber)}</Text>
              <Text>{getInterpreterDetail(interpreter.otherContactInfo)}</Text>
            </div>
          </div>
        </Collapse>
      </TableCell>
    </TableRow>
  );
};
