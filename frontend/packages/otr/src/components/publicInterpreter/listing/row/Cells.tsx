import { TableCell, Typography } from '@mui/material';
import { Text } from 'shared/components';

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
  const { email, phoneNumber, otherContactInfo } = interpreter;

  return (
    <>
      {email && <Text>{email}</Text>}
      {phoneNumber && <Text>{phoneNumber}</Text>}
      {otherContactInfo && <Text>{otherContactInfo}</Text>}
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
          <Typography
            variant="h2"
            component="p"
          >{`${lastName} ${firstName}`}</Typography>
          <div className="rows gapped">
            <div>
              <Typography variant="h3" component="p">
                {t('header.languagePairs')}
              </Typography>
              <LanguagePairs languagePairs={languages} />
            </div>
            <div>
              <Typography variant="h3" component="p">
                {t('header.region')}
              </Typography>
              {mapRegionsToTextElements(regions)}
            </div>
            <div>
              <Typography variant="h3" component="p">
                {t('header.contactInformation')}
              </Typography>
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
