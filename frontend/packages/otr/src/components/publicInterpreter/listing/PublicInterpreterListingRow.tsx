import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { Collapse, TableCell, TableRow } from '@mui/material';
import { useState } from 'react';
import { CustomIconButton, Text } from 'shared/components';
import { useWindowProperties } from 'shared/hooks';

import {
  useAppTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { PublicInterpreter } from 'interfaces/publicInterpreter';
import { RegionUtils } from 'utils/regions';

export const PublicInterpreterListingRow = ({
  interpreter,
}: {
  interpreter: PublicInterpreter;
}) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'otr',
  });
  const translateLanguage = useKoodistoLanguagesTranslation();

  const [isOpen, setIsOpen] = useState(false);

  const { firstName, lastName, languages, regions } = interpreter;
  const { isPhone } = useWindowProperties();

  const renderPhoneRow = () => {
    // TODO
    return <div />;
  };

  const renderDesktopRow = () => (
    <>
      <TableRow
        data-testid={`public-interpreters__id-${interpreter.id}-row`}
        className="public-interpreter-listing-row"
      >
        <TableCell align="left">
          <CustomIconButton
            aria-label={t('component.publicInterpreterListing.row.ariaLabel')}
            size="small"
            onClick={() => setIsOpen((prev) => !prev)}
            aria-pressed={isOpen}
          >
            {isOpen ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </CustomIconButton>
        </TableCell>
        <TableCell>
          <Text>{`${lastName} ${firstName}`}</Text>
        </TableCell>
        <TableCell>
          {languages.map(({ from, to }, k) => (
            <Text key={k}>
              {translateLanguage(from)}
              {` - `}
              {translateLanguage(to)}
            </Text>
          ))}
        </TableCell>
        <TableCell>
          <Text>{RegionUtils.translateAndConcatRegions(regions)}</Text>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell
          className="public-interpreter-listing-row__collapse"
          colSpan={4}
        >
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <div className="columns public-interpreter-listing-row__extra-details">
              <div className="rows margin-right-xs">
                <Text className="bold">
                  {t(
                    'component.publicInterpreterListing.row.extraDetails.email'
                  )}
                  :
                </Text>
                <Text className="bold">
                  {t(
                    'component.publicInterpreterListing.row.extraDetails.phoneNumber'
                  )}
                  :
                </Text>
                <Text className="bold">
                  {t(
                    'component.publicInterpreterListing.row.extraDetails.otherContactInfo'
                  )}
                  :
                </Text>
              </div>
              <div className="rows">
                <Text>{interpreter.email}</Text>
                <Text>{interpreter.phoneNumber}</Text>
                <Text>{interpreter.otherContactInfo}</Text>
              </div>
            </div>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );

  return isPhone ? renderPhoneRow() : renderDesktopRow();
};
