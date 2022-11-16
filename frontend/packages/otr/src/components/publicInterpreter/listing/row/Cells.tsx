import { TableCell } from '@mui/material';
import { H2, H3, Text } from 'shared/components';

import { CollapseToggle } from 'components/publicInterpreter/listing/row/CollapseToggle';
import { LanguagePairs } from 'components/publicInterpreter/listing/row/LanguagePairs';
import { useAppTranslation } from 'configs/i18n';
import { PublicInterpreter } from 'interfaces/publicInterpreter';
import { RegionUtils } from 'utils/regions';

const mapRegionsToTextElements = (regions: Array<string>) =>
  RegionUtils.translateRegions(regions)
    .sort()
    .map((translation, k) => <Text key={k}>{translation}</Text>);

export const PublicInterpreterPhoneCells = ({
  isOpen,
  interpreter,
}: {
  isOpen: boolean;
  interpreter: PublicInterpreter;
}) => {
  const { lastName, firstName, languages, regions } = interpreter;
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.publicInterpreterListing',
  });

  return (
    <TableCell>
      <div className="columns space-between">
        <div className="rows gapped">
          <H2>{`${lastName} ${firstName}`}</H2>
          <div className="rows gapped">
            <div>
              <H3>{t('header.languagePairs')}</H3>
              <LanguagePairs languagePairs={languages} />
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
};

export const PublicInterpreterDesktopCells = ({
  isOpen,
  interpreter,
}: {
  isOpen: boolean;
  interpreter: PublicInterpreter;
}) => {
  const { lastName, firstName, languages, regions } = interpreter;

  return (
    <>
      <TableCell>
        <div className="columns gapped">
          <CollapseToggle isOpen={isOpen} />
          <Text>{`${lastName} ${firstName}`}</Text>
        </div>
      </TableCell>
      <TableCell>
        <LanguagePairs languagePairs={languages} />
      </TableCell>
      <TableCell>{mapRegionsToTextElements(regions)}</TableCell>
    </>
  );
};
