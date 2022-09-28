import { TableCell, TableRow } from '@mui/material';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { Text } from 'shared/components';
import { DateUtils } from 'shared/utils';

import {
  useCommonTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { ClerkInterpreter } from 'interfaces/clerkInterpreter';
import { setClerkInterpreterOverview } from 'redux/reducers/clerkInterpreterOverview';
import { QualificationUtils } from 'utils/qualifications';

export const ClerkInterpreterListingRow = ({
  interpreter,
}: {
  interpreter: ClerkInterpreter;
}) => {
  const { lastName, nickName, qualifications } = interpreter;
  const translateLanguage = useKoodistoLanguagesTranslation();
  const translateCommon = useCommonTranslation();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleRowClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e?.stopPropagation();
    navigate(
      AppRoutes.ClerkInterpreterOverviewPage.replace(
        /:interpreterId$/,
        `${interpreter.id}`
      )
    );
    dispatch(setClerkInterpreterOverview(interpreter));
  };

  return (
    <TableRow className="cursor-pointer" onClick={handleRowClick}>
      <TableCell>
        <Text>{`${lastName} ${nickName}`}</Text>
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
        {qualifications.map(({ examinationType }, k) => (
          <Text key={k}>{examinationType}</Text>
        ))}
      </TableCell>
      <TableCell>
        {qualifications.map(({ beginDate }, k) => (
          <Text key={k}>{DateUtils.formatOptionalDate(beginDate)}</Text>
        ))}
      </TableCell>
      <TableCell>
        {qualifications.map(({ endDate }, k) => (
          <Text key={k}>{DateUtils.formatOptionalDate(endDate)}</Text>
        ))}
      </TableCell>
      <TableCell>
        {qualifications.map((qualification, k) => (
          <Text key={k}>
            {QualificationUtils.isQualificationEffective(qualification, dayjs())
              ? translateCommon('yes')
              : translateCommon('no')}
          </Text>
        ))}
      </TableCell>
      <TableCell>
        {qualifications.map(({ permissionToPublish }, k) => (
          <Text key={k}>
            {permissionToPublish
              ? translateCommon('yes')
              : translateCommon('no')}
          </Text>
        ))}
      </TableCell>
    </TableRow>
  );
};
