import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { TableCell, TableRow } from '@mui/material';
import Collapse from '@mui/material/Collapse';
import { useState } from 'react';
import { CustomIconButton, Text } from 'shared/components';

import {
  useAppTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { useWindowProperties } from 'hooks/useWindowProperties';
import { PublicInterpreter } from 'interfaces/publicInterpreter';
import { selectFilteredPublicSelectedIds } from 'redux/selectors/publicInterpreter';

export const PublicInterpreterListingRow = ({
  interpreter,
}: {
  interpreter: PublicInterpreter;
}) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'otr',
  });

  // Redux
  const filteredSelectedIds = useAppSelector(selectFilteredPublicSelectedIds);
  const selected = filteredSelectedIds.includes(interpreter.id);

  const [isOpen, setIsOpen] = useState(false);

  const { firstName, lastName, languages, regions } = interpreter;
  const { isPhone } = useWindowProperties();
  const translateLanguage = useKoodistoLanguagesTranslation();

  const getRegionsDescription = (regions: Array<string>) => {
    if (regions.length > 0) {
      return regions.join(', ');
    }

    return t('component.publicInterpreterListing.wholeFinland');
  };

  const renderPhoneRow = () => {
    // TODO
    return <div />;
  };

  const renderDesktopRow = () => (
    <>
      <TableRow
        data-testid={`public-interpreters__id-${interpreter.id}-row`}
        selected={selected}
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
          <Text>{getRegionsDescription(regions)}</Text>
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell colSpan={4}>
          <Collapse
            className="public-interpreter-listing-row__collapse"
            in={isOpen}
            timeout="auto"
            unmountOnExit
          >
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
