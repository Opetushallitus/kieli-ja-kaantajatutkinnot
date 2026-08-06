import { ChevronRight } from '@mui/icons-material';
import { TableCell, TableRow } from '@mui/material';
import { Link } from 'react-router';
import { CustomButtonLink, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import {
  useClerkTranslation,
  useCommonTranslation,
  useKoodistoMunicipalitiesTranslation,
} from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import { ClerkExaminerExamEventListingEntry } from 'interfaces/clerkListExaminer';
import { DateTimeUtils } from 'utils/dateTime';

export const ClerkExaminerExamEventListingRow = ({
  entry,
}: {
  entry: ClerkExaminerExamEventListingEntry;
}) => {
  const translateMunicipality = useKoodistoMunicipalitiesTranslation();
  const translateCommon = useCommonTranslation();
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExaminerExamEventListing',
  });
  const { examiner, examEvent } = entry;

  const examEventUrl = AppRoutes.ExaminerExamEventPage.replace(
    /:oid/,
    examiner.oid,
  ).replace(/:examEventId$/, `${examEvent.id}`);

  return (
    <>
      <TableRow
        className="clerk-exam-event-listing__row"
        data-testid={`clerk-exam-events__id-${examEvent.id}-row`}
      >
        <TableCell>
          <Link
            className="clerk-exam-event-listing__row__link"
            to={examEventUrl}
          >
            <Text>{`${examiner.firstName} ${examiner.lastName}`}</Text>
          </Link>
        </TableCell>
        <TableCell>
          <Text>{translateCommon(`examLanguage.${examEvent.language}`)}</Text>
        </TableCell>
        <TableCell>
          <Text>{translateMunicipality(examEvent.municipality.code)}</Text>
        </TableCell>
        <TableCell>
          <Text>{DateTimeUtils.renderDate(examEvent.date)}</Text>
        </TableCell>
        <TableCell>
          <Text>
            {examEvent.isHidden
              ? translateCommon('no')
              : translateCommon('yes')}
          </Text>
        </TableCell>
        <TableCell>
          <CustomButtonLink
            sx={{ padding: 0 }}
            variant={Variant.Text}
            color={Color.Secondary}
            endIcon={<ChevronRight />}
            to={examEventUrl}
          >
            {t('more')}
          </CustomButtonLink>
        </TableCell>
      </TableRow>
    </>
  );
};
