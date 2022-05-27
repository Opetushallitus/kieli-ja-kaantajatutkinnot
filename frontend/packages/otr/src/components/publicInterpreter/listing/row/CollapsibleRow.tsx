import { Collapse, TableCell, TableRow } from '@mui/material';
import { Text } from 'shared/components';
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
    <TableRow className=" public-interpreter-listing-row public-interpreter-listing-row--collapsible">
      <TableCell colSpan={isPhone ? 0 : 3}>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <div className="columns public-interpreter-listing-row__extra-details">
            <div className="rows margin-right-xs">
              <div className="public-interpreter-listing-row__extra-details__box">
                <Text className="bold">{t('row.extraDetails.email')}:</Text>
                <Text>{getInterpreterDetail(interpreter.email)}</Text>
              </div>
              <div className="public-interpreter-listing-row__extra-details__box">
                <Text className="bold">
                  {t('row.extraDetails.phoneNumber')}:
                </Text>
                <Text>{getInterpreterDetail(interpreter.phoneNumber)}</Text>
              </div>
              <div className="public-interpreter-listing-row__extra-details__box">
                <Text className="bold">
                  {t('row.extraDetails.otherContactInfo')}:
                </Text>
                <Text>
                  {getInterpreterDetail(interpreter.otherContactInfo)}
                </Text>
              </div>
            </div>
          </div>
        </Collapse>
      </TableCell>
    </TableRow>
  );
};
