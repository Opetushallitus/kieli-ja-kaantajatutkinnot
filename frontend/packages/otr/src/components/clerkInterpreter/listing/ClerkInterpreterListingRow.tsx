import { TableCell, TableRow } from '@mui/material';
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
  const translateLanguage = useKoodistoLanguagesTranslation();
  const translateCommon = useCommonTranslation();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const { id, lastName, nickName, qualifications } = interpreter;

  const visibleQualifications =
    QualificationUtils.getQualificationsVisibleInClerkHomePage(qualifications);

  const overviewUrl = AppRoutes.ClerkInterpreterOverviewPage.replace(
    /:interpreterId$/,
    `${id}`
  );

  const handleRowLeftClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.stopPropagation();
    dispatch(setClerkInterpreterOverview(interpreter));
    navigate(overviewUrl);
  };

  const handleRowRightClick = (e: React.MouseEvent<HTMLTableRowElement>) => {
    e.preventDefault();
    e.stopPropagation();
    window.open(overviewUrl, '_blank', 'noopener noreferrer');
  };

  return (
    <TableRow
      className="cursor-pointer"
      onClick={handleRowLeftClick}
      onContextMenu={handleRowRightClick}
    >
      <TableCell>
        <Text>{`${lastName} ${nickName}`}</Text>
      </TableCell>
      <TableCell>
        {visibleQualifications.map(({ fromLang, toLang }, k) => (
          <Text key={k}>
            {translateLanguage(fromLang)}
            {` - `}
            {translateLanguage(toLang)}
          </Text>
        ))}
      </TableCell>
      <TableCell>
        {visibleQualifications.map(({ examinationType }, k) => (
          <Text key={k}>{examinationType}</Text>
        ))}
      </TableCell>
      <TableCell>
        {visibleQualifications.map(({ beginDate }, k) => (
          <Text key={k}>{DateUtils.formatOptionalDate(beginDate)}</Text>
        ))}
      </TableCell>
      <TableCell>
        {visibleQualifications.map(({ endDate }, k) => (
          <Text key={k}>{DateUtils.formatOptionalDate(endDate)}</Text>
        ))}
      </TableCell>
      <TableCell>
        {visibleQualifications.map((qualification, k) => (
          <Text key={k}>
            {QualificationUtils.isEffective(qualification, qualifications)
              ? translateCommon('yes')
              : translateCommon('no')}
          </Text>
        ))}
      </TableCell>
      <TableCell>
        {visibleQualifications.map(({ permissionToPublish }, k) => (
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
