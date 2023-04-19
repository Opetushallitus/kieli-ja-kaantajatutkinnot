import { TableCell } from '@mui/material';
import { H2, H3, Text } from 'shared/components';

import { LanguagePairs } from 'components/publicInterpreter/listing/row/LanguagePairs';
import { useAppTranslation } from 'configs/i18n';
import { PublicInterpreter } from 'interfaces/publicInterpreter';
import { RegionUtils } from 'utils/regions';

const mapRegionsToTextElements = (regions: Array<string>) =>
  RegionUtils.translateRegions(regions)
    .sort()
    .map((translation, k) => <Text key={k}>{translation}</Text>);

const ContactInformationFields = ({
  interpreter,
}: {
  interpreter: PublicInterpreter;
}) => {
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.publicInterpreterListing.row',
  });
  const { email, phoneNumber, otherContactInfo } = interpreter;

  return (
    <>
      {email && <Text>{`${t('email')}: ${email}`}</Text>}
      {phoneNumber && <Text>{`${t('phoneNumber')}: ${phoneNumber}`}</Text>}
      {otherContactInfo && (
        <Text>{`${t('otherContactInfo')}: ${otherContactInfo}`}</Text>
      )}
    </>
  );
};

export const PublicInterpreterPhoneCells = ({
  interpreter,
}: {
  interpreter: PublicInterpreter;
}) => {
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.publicInterpreterListing',
  });
  const { lastName, firstName, languages, regions } = interpreter;

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
            <div>
              <H3>{t('header.contactInformation')}</H3>
              <ContactInformationFields interpreter={interpreter} />
            </div>
          </div>
        </div>
      </div>
    </TableCell>
  );
};

export const PublicInterpreterDesktopCells = ({
  interpreter,
}: {
  interpreter: PublicInterpreter;
}) => {
  const { lastName, firstName, languages, regions } = interpreter;

  return (
    <>
      <TableCell>
        <Text>{`${lastName} ${firstName}`}</Text>
      </TableCell>
      <TableCell>
        <LanguagePairs languagePairs={languages} />
      </TableCell>
      <TableCell>{mapRegionsToTextElements(regions)}</TableCell>
      <TableCell>
        {<ContactInformationFields interpreter={interpreter} />}
      </TableCell>
    </>
  );
};
