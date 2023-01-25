import { TableCell, TableRow } from '@mui/material';
import { useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Text } from 'shared/components';
import { DateUtils } from 'shared/utils';

import {
  useCommonTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { ClerkInterpreter } from 'interfaces/clerkInterpreter';
import { Qualification } from 'interfaces/qualification';
import { setClerkInterpreterOverview } from 'redux/reducers/clerkInterpreterOverview';
import { QualificationUtils } from 'utils/qualifications';

enum QualificationColumn {
  LanguagePair = 'languagePair',
  ExaminationType = 'examinationType',
  BeginDate = 'beginDate',
  EndDate = 'endDate',
  PermissionToPublish = 'permissionToPublish',
}

export const ClerkInterpreterListingRow = ({
  interpreter,
}: {
  interpreter: ClerkInterpreter;
}) => {
  const translateLanguage = useKoodistoLanguagesTranslation();
  const translateCommon = useCommonTranslation();

  const { id, lastName, nickName, qualifications } = interpreter;

  const visibleQualifications =
    QualificationUtils.getQualificationsVisibleInClerkHomePage(qualifications);

  const overviewUrl = AppRoutes.ClerkInterpreterOverviewPage.replace(
    /:interpreterId$/,
    `${id}`
  );

  const dispatch = useAppDispatch();

  /**
   * Sets interpreter in `ClerkInterpreterOverviewState` to avoid excessive backend request
   * to fetch details of the interpreter again when the overview page is opened.
   *
   * Remove in OPHOTRKEH-181 if listing endpoint is changed only to return the required data
   * in listing view.
   */
  const handleRowClick = () =>
    dispatch(setClerkInterpreterOverview(interpreter));

  const getQualificationCellContent = useCallback(
    (activeColumn: QualificationColumn, qualification: Qualification) => {
      const {
        fromLang,
        toLang,
        beginDate,
        endDate,
        examinationType,
        permissionToPublish,
      } = qualification;
      switch (activeColumn) {
        case QualificationColumn.LanguagePair:
          return QualificationUtils.getLanguagePairLocalisation(
            { from: fromLang, to: toLang },
            translateLanguage
          );
        case QualificationColumn.ExaminationType:
          return examinationType;
        case QualificationColumn.BeginDate:
          return DateUtils.formatOptionalDate(beginDate);
        case QualificationColumn.EndDate:
          return DateUtils.formatOptionalDate(endDate);
        case QualificationColumn.PermissionToPublish:
          return permissionToPublish
            ? translateCommon('yes')
            : translateCommon('no');
      }
    },
    [translateCommon, translateLanguage]
  );

  const getQualificationCellClassName = (qualification: Qualification) => {
    return !QualificationUtils.isEffective(qualification, qualifications)
      ? 'clerk-interpreter-listing__ineffective'
      : '';
  };

  return (
    <TableRow
      className="clerk-interpreter-listing__row"
      onClick={handleRowClick}
    >
      <TableCell>
        <Link className="clerk-interpreter-listing__row__link" to={overviewUrl}>
          <Text>{`${lastName} ${nickName}`}</Text>
        </Link>
      </TableCell>
      {Object.values(QualificationColumn).map((activeColumn) => (
        <TableCell key={activeColumn}>
          <div className="rows">
            {visibleQualifications.map((qualification, idx) => (
              <Text
                className={getQualificationCellClassName(qualification)}
                key={idx}
              >
                {getQualificationCellContent(activeColumn, qualification)}
              </Text>
            ))}
          </div>
        </TableCell>
      ))}
    </TableRow>
  );
};
