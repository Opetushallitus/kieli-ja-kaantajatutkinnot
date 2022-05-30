import { DeleteOutline as DeleteIcon } from '@mui/icons-material';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import dayjs from 'dayjs';
import {
  CustomIconButton,
  CustomSwitch,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import {
  useAppTranslation,
  useCommonTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { Qualification } from 'interfaces/qualification';
import { clerkInterpreterOverviewSelector } from 'redux/selectors/clerkInterpreterOverview';

export const QualificationListing = ({
  qualifications,
  permissionToPublishReadOnly,
}: {
  qualifications: Array<Qualification>;
  permissionToPublishReadOnly: boolean;
}) => {
  const translateLanguage = useKoodistoLanguagesTranslation();
  const translateCommon = useCommonTranslation();
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.clerkInterpreterOverview.qualifications',
  });

  const { qualificationDetailsStatus } = useAppSelector(
    clerkInterpreterOverviewSelector
  );

  const isLoading = qualificationDetailsStatus === APIResponseStatus.InProgress;

  const defaultClassName = 'clerk-interpreter-details__qualifications-table';
  const combinedClassNames = isLoading
    ? `${defaultClassName} dimmed`
    : defaultClassName;

  return (
    <LoadingProgressIndicator isLoading={isLoading}>
      <Table
        size="small"
        className={combinedClassNames}
        data-testid="clerk-interpreter-details__qualifications-table"
      >
        <TableHead>
          <TableRow>
            <TableCell>{t('fields.languagePair')}</TableCell>
            <TableCell>{t('fields.examinationType')}</TableCell>
            <TableCell>{t('fields.startDate')}</TableCell>
            <TableCell>{t('fields.endDate')}</TableCell>
            <TableCell>{t('fields.permissionToPublish')}</TableCell>
            <TableCell>{translateCommon('delete')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {qualifications.map((q, i) => (
            <TableRow
              key={q.id ?? q.tempId}
              data-testid={`qualifications-table__id-${
                q.id ?? `${i}-unsaved`
              }-row`}
            >
              <TableCell>
                <Text>
                  {`${translateLanguage(q.fromLang)}
             - ${translateLanguage(q.toLang)}`}
                </Text>
              </TableCell>
              <TableCell>
                <div className="columns gapped-xs">
                  <Text>{q.examinationType}</Text>
                </div>
              </TableCell>
              <TableCell>
                <Text>{DateUtils.formatOptionalDate(dayjs(q.beginDate))}</Text>
              </TableCell>
              <TableCell>
                <Text>{DateUtils.formatOptionalDate(dayjs(q.endDate))}</Text>
              </TableCell>
              <TableCell>
                {permissionToPublishReadOnly ? (
                  <Text>
                    {q.permissionToPublish
                      ? translateCommon('yes')
                      : translateCommon('no')}
                  </Text>
                ) : (
                  <CustomSwitch
                    value={q.permissionToPublish}
                    onChange={() => {
                      return;
                    }}
                    leftLabel={translateCommon('no')}
                    rightLabel={translateCommon('yes')}
                    aria-label={t(
                      'actions.changePermissionToPublish.ariaLabel'
                    )}
                  />
                )}
              </TableCell>
              <TableCell className="centered">
                <CustomIconButton
                  onClick={() => {
                    return;
                  }}
                  aria-label={t('actions.removal.ariaLabel')}
                  data-testid={`qualifications-table__id-${
                    q.id || i
                  }-row__delete-button`}
                >
                  <DeleteIcon color={Color.Error} />
                </CustomIconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </LoadingProgressIndicator>
  );
};
