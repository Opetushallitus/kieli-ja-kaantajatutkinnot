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
import { PublicTranslator } from 'interfaces/publicTranslator';
import { selectFilteredPublicSelectedIds } from 'redux/selectors/publicTranslator';

export const PublicTranslatorListingRow = ({
  translator,
}: {
  translator: PublicTranslator;
}) => {
  // I18n
  const { t } = useAppTranslation({
    keyPrefix: 'otr',
  });

  // Redux
  const filteredSelectedIds = useAppSelector(selectFilteredPublicSelectedIds);
  const selected = filteredSelectedIds.includes(translator.id);

<<<<<<< HEAD
  const [isOpen, setIsOpen] = useState(false);

=======
>>>>>>> e0d4cfe (OTR(Frontend): Added Collapseable row for desktop)
  const { firstName, lastName, languages, regions } = translator;
  const [isOpen, setIsOpen] = useState(false);

  const { isPhone } = useWindowProperties();
  const translateLanguage = useKoodistoLanguagesTranslation();

<<<<<<< HEAD
  const getAreasDescription = (areas: Array<string>) => {
    if (areas.length > 0) {
      return areas.join(', ');
=======
  const getRegionsDescription = (regions: Array<string>) => {
    if (regions.length > 0) {
      return regions.join(', ');
>>>>>>> e0d4cfe (OTR(Frontend): Added Collapseable row for desktop)
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
        data-testid={`public-translators__id-${translator.id}-row`}
        selected={selected}
        className="public-translator-listing-row"
<<<<<<< HEAD
=======
        onClick={() => setIsOpen((prevState) => !prevState)}
>>>>>>> e0d4cfe (OTR(Frontend): Added Collapseable row for desktop)
      >
        <TableCell align="left">
          <CustomIconButton
            aria-label={t('component.publicInterpreterListing.row.ariaLabel')}
            size="small"
<<<<<<< HEAD
            onClick={() => setIsOpen((prev) => !prev)}
=======
>>>>>>> e0d4cfe (OTR(Frontend): Added Collapseable row for desktop)
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
<<<<<<< HEAD
          <Text>{getAreasDescription(regions)}</Text>
=======
          <Text>{getRegionsDescription(regions)}</Text>
>>>>>>> e0d4cfe (OTR(Frontend): Added Collapseable row for desktop)
        </TableCell>
      </TableRow>
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={isOpen} timeout="auto" unmountOnExit>
            <div className="columns public-translator-listing-row__extra-details">
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
                <Text>{translator.email}</Text>
                <Text>{translator.phoneNumber}</Text>
                <Text>{translator.otherContactInfo}</Text>
              </div>
            </div>
          </Collapse>
        </TableCell>
      </TableRow>
    </>
  );

  return isPhone ? renderPhoneRow() : renderDesktopRow();
};
