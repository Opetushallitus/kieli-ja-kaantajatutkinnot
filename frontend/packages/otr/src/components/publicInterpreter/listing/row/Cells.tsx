import { TableCell } from '@mui/material';
import { H2, H3, Text } from 'shared/components';

import { CollapseToggle } from 'components/publicInterpreter/listing/row/CollapseToggle';
import {
  useAppTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { PublicInterpreter } from 'interfaces/publicInterpreter';
import { RegionUtils } from 'utils/regions';

export const PublicInterpreterPhoneCells = ({
  isOpen,
  interpreter,
}: {
  isOpen: boolean;
  interpreter: PublicInterpreter;
}) => {
  const translateLanguage = useKoodistoLanguagesTranslation();
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
              {languages.map(({ from, to }, k) => (
                <Text key={k}>
                  {translateLanguage(from)}
                  {` - `}
                  {translateLanguage(to)}
                </Text>
              ))}
            </div>
            <div>
              <H3>{t('header.region')}</H3>
              <Text>{RegionUtils.translateAndConcatRegions(regions)}</Text>
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
  const translateLanguage = useKoodistoLanguagesTranslation();
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
    </>
  );
};
