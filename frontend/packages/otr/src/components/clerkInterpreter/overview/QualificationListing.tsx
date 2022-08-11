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
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import {
  useAppTranslation,
  useCommonTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExaminationType } from 'enums/interpreter';
import { Qualification } from 'interfaces/qualification';
import { updateQualificationPublishPermission } from 'redux/reducers/clerkInterpreterOverview';
import {
  removeNotifierDialog,
  showNotifierDialog,
} from 'redux/reducers/notifier';
import { clerkInterpreterOverviewSelector } from 'redux/selectors/clerkInterpreterOverview';
import { NotifierUtils } from 'utils/notifier';

export const QualificationListing = ({
  qualifications,
  permissionToPublishReadOnly,
  onQualificationRemove,
}: {
  qualifications: Array<Qualification>;
  permissionToPublishReadOnly: boolean;
  onQualificationRemove: (q: Qualification) => void;
}) => {
  const translateLanguage = useKoodistoLanguagesTranslation();
  const translateCommon = useCommonTranslation();
  const dispatch = useAppDispatch();
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.clerkInterpreterOverview.qualifications',
  });

  const { qualificationDetailsUpdateStatus } = useAppSelector(
    clerkInterpreterOverviewSelector
  );

  const isLoading =
    qualificationDetailsUpdateStatus === APIResponseStatus.InProgress;

  const defaultClassName = 'clerk-interpreter-details__qualifications-table';
  const combinedClassNames = isLoading
    ? `${defaultClassName} dimmed`
    : defaultClassName;

  const onPublishPermissionChange = (qualification: Qualification) => {
    const notifier = NotifierUtils.createNotifierDialog(
      t('actions.changePermissionToPublish.dialog.header'),
      Severity.Info,
      t('actions.changePermissionToPublish.dialog.description'),
      [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
          action: () => dispatch(removeNotifierDialog(notifier.id)),
        },
        {
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: () => {
            dispatch(updateQualificationPublishPermission(qualification));
          },
        },
      ]
    );

    dispatch(showNotifierDialog(notifier));
  };

  const getExaminationTypeText = (examinationtype: ExaminationType) => {
    switch (examinationtype) {
      case ExaminationType.LegalInterpreterExam:
        return translateCommon('examinationType.legalInterpreterExam');
      case ExaminationType.Other:
        return translateCommon('examinationType.degreeStudies');
      default:
        return '';
    }
  };

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
          {qualifications
            .filter((q) => !q.deleted)
            .map((q, i) => (
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
                    <Text>{getExaminationTypeText(q.examinationType)}</Text>
                  </div>
                </TableCell>
                <TableCell>
                  <Text>
                    {DateUtils.formatOptionalDate(dayjs(q.beginDate))}
                  </Text>
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
                        onPublishPermissionChange(q);
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
                    onClick={() => onQualificationRemove(q)}
                    aria-label={t('actions.removal.ariaLabel')}
                    data-testid={
                      q.id
                        ? `qualifications-table__id-${q.id}-row__delete-button`
                        : `qualifications-table__id-${i}-unsaved}-row__delete-button`
                    }
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
