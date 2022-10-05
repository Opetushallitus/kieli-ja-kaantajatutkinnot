import { TableCell, TableRow } from '@mui/material';
import { useCallback, useState } from 'react';
import { H2, H3, Text } from 'shared/components';
import { useWindowProperties } from 'shared/hooks';

import { CollapseToggle } from 'components/publicInterpreter/listing/row/CollapseToggle';
import { CollapsibleRow } from 'components/publicInterpreter/listing/row/CollapsibleRow';
import {
  useAppTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { PublicInterpreter } from 'interfaces/publicInterpreter';
import { publicInterpretersSelector } from 'redux/selectors/publicInterpreter';
import { RegionUtils } from 'utils/regions';

export const PublicInterpreterListingRow = ({
  interpreter,
}: {
  interpreter: PublicInterpreter;
}) => {
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.publicInterpreterListing',
  });
  const translateLanguage = useKoodistoLanguagesTranslation();

  const { filters } = useAppSelector(publicInterpretersSelector);

  const [isOpen, setIsOpen] = useState(false);
  const toggleRowOpen = () => setIsOpen((prev) => !prev);

  const { isPhone } = useWindowProperties();
  const { id, lastName, firstName, languages, regions } = interpreter;

  const getLanguagePairsTexts = useCallback(() => {
    const { fromLang, toLang } = filters;

    return languages.map(({ from, to }, k) => {
      const className =
        fromLang === from && toLang === to ? 'padding-unset bold' : '';

      return (
        <Text className={className} key={k}>
          {`${translateLanguage(from)} - ${translateLanguage(to)}`}
        </Text>
      );
    });
  }, [languages, filters, translateLanguage]);

  const mapRegionsToTextElements = (regions: Array<string>) =>
    RegionUtils.translateRegions(regions)
      .sort()
      .map((translation, k) => <Text key={k}>{translation}</Text>);

  const renderPhoneTableCells = () => (
    <TableCell>
      <div className="columns space-between">
        <div className="rows gapped">
          <H2>{`${lastName} ${firstName}`}</H2>
          <div className="rows gapped">
            <div>
              <H3>{t('header.languagePairs')}</H3>
              {getLanguagePairsTexts()}
            </div>
            <div>
              <H3>{t('header.region')}</H3>
              {mapRegionsToTextElements(regions)}
            </div>
          </div>
        </div>
        <CollapseToggle isOpen={isOpen} />
      </div>
    </TableCell>
  );

  const renderDesktopTableCells = () => (
    <>
      <TableCell>
        <div className="columns gapped">
          <CollapseToggle isOpen={isOpen} />
          <Text>{`${lastName} ${firstName}`}</Text>
        </div>
      </TableCell>
      <TableCell>{getLanguagePairsTexts()}</TableCell>
      <TableCell>{mapRegionsToTextElements(regions)}</TableCell>
    </>
  );

  return (
    <>
      <TableRow
        data-testid={`public-interpreters__id-${id}-row`}
        className="public-interpreter-listing-row"
        onClick={toggleRowOpen}
      >
        {isPhone ? renderPhoneTableCells() : renderDesktopTableCells()}
      </TableRow>
      <CollapsibleRow
        interpreter={interpreter}
        isOpen={isOpen}
        onClick={toggleRowOpen}
      />
    </>
  );
};
