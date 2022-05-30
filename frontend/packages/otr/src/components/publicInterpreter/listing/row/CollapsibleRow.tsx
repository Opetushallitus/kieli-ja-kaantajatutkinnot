import { Collapse, TableCell, TableRow } from '@mui/material';
import { Text } from 'shared/components';
import { useWindowProperties } from 'shared/hooks';

import { useAppTranslation } from 'configs/i18n';
import { PublicInterpreter } from 'interfaces/publicInterpreter';

const getInterpreterDetail = (field?: string) => field ?? '-';

const AdditionalContactDetail = ({
  label,
  contactDetail,
}: {
  label: string;
  contactDetail: string;
}) => {
  const { isPhone } = useWindowProperties();

  return (
    <div className="public-interpreter-listing-row__additional-contact-details__box">
      <Text className="bold">{isPhone ? label : `${label}: `}</Text>
      <Text>{contactDetail}</Text>
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

  return (
    <TableRow className="public-interpreter-listing-row public-interpreter-listing-row--collapsible">
      <TableCell colSpan={numOfCells}>
        <Collapse in={isOpen} timeout="auto" unmountOnExit>
          <div className="public-interpreter-listing-row__additional-contact-details rows">
            <AdditionalContactDetail
              label={t('row.additionalContactDetail.email')}
              contactDetail={getInterpreterDetail(interpreter.email)}
            />
            <AdditionalContactDetail
              label={t('row.additionalContactDetail.phoneNumber')}
              contactDetail={getInterpreterDetail(interpreter.phoneNumber)}
            />
            <AdditionalContactDetail
              label={t('row.additionalContactDetail.otherContactInfo')}
              contactDetail={getInterpreterDetail(interpreter.otherContactInfo)}
            />
          </div>
        </Collapse>
      </TableCell>
    </TableRow>
  );
};
