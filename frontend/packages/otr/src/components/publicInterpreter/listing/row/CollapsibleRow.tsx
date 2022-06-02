import { Collapse, TableCell, TableRow } from '@mui/material';
import { ExtLink, Text } from 'shared/components';
import { useWindowProperties } from 'shared/hooks';
import { StringUtils } from 'shared/utils';

import { useAppTranslation } from 'configs/i18n';
import { PublicInterpreter } from 'interfaces/publicInterpreter';

// Helpers
const PLACEHOLDER_TEXT = '-';

enum AdditionalDetailsField {
  Email = 'email',
  PhoneNumber = 'phoneNumber',
  OtherContactInfo = 'otherContactInfo',
}

const AdditionalContactDetail = ({
  field,
  label,
  contactDetail,
}: {
  field: AdditionalDetailsField;
  label: string;
  contactDetail: string;
}) => {
  const { isPhone } = useWindowProperties();
  const linkPrefix = field === AdditionalDetailsField.Email ? 'mailto' : 'tel';

  return (
    <div className="public-interpreter-listing-row__additional-contact-details__box">
      <Text className="bold">{isPhone ? label : `${label}: `}</Text>
      {field === AdditionalDetailsField.OtherContactInfo ||
      contactDetail === PLACEHOLDER_TEXT ? (
        <Text className="public-interpreter-listing-row__additional-contact-details__text">
          {contactDetail}
        </Text>
      ) : (
        <ExtLink
          className="public-interpreter-listing-row__additional-contact-details__link"
          text={contactDetail}
          href={`${linkPrefix}:${contactDetail}`}
        />
      )}
    </div>
  );
};

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
  const numOfCells = isPhone ? 0 : 3;

  const getAdditionalContactDetailProps = (field: AdditionalDetailsField) => ({
    field,
    label: t(`row.additionalContactDetail.${field}`),
    contactDetail: StringUtils.getWithPlaceholder(interpreter[field]),
  });

  return (
    <TableRow className="public-interpreter-listing-row public-interpreter-listing-row--collapsible">
      <TableCell colSpan={numOfCells}>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <div className="public-interpreter-listing-row__additional-contact-details rows">
            <AdditionalContactDetail
              {...getAdditionalContactDetailProps(AdditionalDetailsField.Email)}
            />
            <AdditionalContactDetail
              {...getAdditionalContactDetailProps(
                AdditionalDetailsField.PhoneNumber
              )}
            />
            <AdditionalContactDetail
              {...getAdditionalContactDetailProps(
                AdditionalDetailsField.OtherContactInfo
              )}
            />
          </div>
        </Collapse>
      </TableCell>
    </TableRow>
  );
};
