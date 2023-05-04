import { ContactPageOutlined, MailOutline, Phone } from '@mui/icons-material';
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
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.publicInterpreterListing.row',
  });
  const { email, phoneNumber, otherContactInfo } = interpreter;

  return (
    <>
      {email && (
        <div className="columns">
          <div title={t('emailAriaLabel')}>
            <MailOutline
              aria-label={t('emailAriaLabel')}
              className="public-interpreter-listing-row__contact-icon"
            />
          </div>
          <Text>{email}</Text>
        </div>
      )}
      {phoneNumber && (
        <div className="columns">
          <div title={t('phoneAriaLabel')}>
            <Phone
              aria-label={t('phoneAriaLabel')}
              className="public-interpreter-listing-row__contact-icon"
            />
          </div>
          <Text>{phoneNumber}</Text>
        </div>
      )}
      {otherContactInfo && (
        <div className="columns">
          <div title={t('otherContactAriaLabel')}>
            <ContactPageOutlined
              aria-label={t('otherContactAriaLabel')}
              className="public-interpreter-listing-row__contact-icon"
            />
          </div>
          <Text>{otherContactInfo}</Text>
        </div>
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
