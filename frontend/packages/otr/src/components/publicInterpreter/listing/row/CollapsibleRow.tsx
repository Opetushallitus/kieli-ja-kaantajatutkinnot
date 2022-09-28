import { Collapse, TableCell, TableRow } from '@mui/material';
import { Text } from 'shared/components';
import { useWindowProperties } from 'shared/hooks';
import { StringUtils } from 'shared/utils';

import { useAppTranslation } from 'configs/i18n';
import { PublicInterpreter } from 'interfaces/publicInterpreter';

enum AdditionalDetailsField {
  Email = 'email',
  PhoneNumber = 'phoneNumber',
  OtherContactInfo = 'otherContactInfo',
}

const AdditionalContactDetail = ({
  label,
  value,
}: {
  label: string;
  value: string;
}) => {
  const { isPhone } = useWindowProperties();

  return (
    <div className="public-interpreter-listing-row__additional-contact-details__box">
      <Text className="bold">{isPhone ? label : `${label}: `}</Text>
      <Text className="public-interpreter-listing-row__additional-contact-details__text">
        {value}
      </Text>
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
    label: t(`row.additionalContactDetail.${field}`),
    value: StringUtils.getWithPlaceholder(interpreter[field]),
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
