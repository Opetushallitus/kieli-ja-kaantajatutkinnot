import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined';
import { Button, TableCell, TableRow } from '@mui/material';
import { Link } from 'react-router-dom';
import { Text } from 'shared/components';
import { Color } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import {
  useAppTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import { ClerkInterpreter } from 'interfaces/clerkInterpreter';
import { RegionUtils } from 'utils/regions';

export const ClerkInterpreterListingRow = ({
  interpreter,
}: {
  interpreter: ClerkInterpreter;
}) => {
  const { firstName, lastName, qualifications, regions } = interpreter;
  const translateLanguage = useKoodistoLanguagesTranslation();
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.clerkInterpreterListing.row',
  });

  const interpreterDetailsURL = (id: number) =>
    AppRoutes.ClerkInterpreterOverviewPage.replace(/:interpreterId$/, `${id}`);

  return (
    <TableRow>
      <TableCell>
        <Text>{`${firstName} ${lastName}`}</Text>
      </TableCell>
      <TableCell>
        {qualifications.map(({ fromLang, toLang }, k) => (
          <Text key={k}>
            {translateLanguage(fromLang)}
            {` - `}
            {translateLanguage(toLang)}
          </Text>
        ))}
      </TableCell>
      <TableCell>
        {qualifications.map(({ beginDate, endDate }, k) => (
          <Text key={k}>
            {DateUtils.formatOptionalDate(beginDate)}
            {` - `}
            {DateUtils.formatOptionalDate(endDate)}
          </Text>
        ))}{' '}
      </TableCell>
      <TableCell>
        <Text>{RegionUtils.translateAndConcatRegions(regions)}</Text>
      </TableCell>
      <TableCell>
        <Button
          to={interpreterDetailsURL(interpreter.id)}
          component={Link}
          color={Color.Secondary}
          endIcon={<ArrowForwardIosOutlinedIcon />}
        >
          {t('detailsButton')}
        </Button>
      </TableCell>
    </TableRow>
  );
};
