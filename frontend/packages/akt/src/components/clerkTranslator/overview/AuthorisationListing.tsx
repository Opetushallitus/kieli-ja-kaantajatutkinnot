import {
  DeleteOutline as DeleteIcon,
  InfoOutlined as InfoIcon,
} from '@mui/icons-material';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tooltip,
} from '@mui/material';

import { CustomIconButton } from 'components/elements/CustomIconButton';
import { CustomSwitch } from 'components/elements/CustomSwitch';
import { LoadingProgressIndicator } from 'components/elements/LoadingProgressIndicator';
import { Text } from 'components/elements/Text';
import {
  useAppTranslation,
  useCommonTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { APIResponseStatus } from 'enums/api';
import { Color, Severity, Variant } from 'enums/app';
import { AuthorisationBasisEnum } from 'enums/clerkTranslator';
import { Authorisation } from 'interfaces/authorisation';
import { updateAuthorisationPublishPermission } from 'redux/actions/clerkTranslatorOverview';
import { showNotifierDialog } from 'redux/actions/notifier';
import { NOTIFIER_ACTION_DO_NOTHING } from 'redux/actionTypes/notifier';
import { clerkTranslatorOverviewSelector } from 'redux/selectors/clerkTranslatorOverview';
import { AuthorisationUtils } from 'utils/authorisation';
import { DateUtils } from 'utils/date';
import { NotifierUtils } from 'utils/notifier';

export const AuthorisationListing = ({
  authorisations,
  permissionToPublishReadOnly,
  onAuthorisationRemove,
}: {
  authorisations: Array<Authorisation>;
  permissionToPublishReadOnly: boolean;
  onAuthorisationRemove: (a: Authorisation) => void;
}) => {
  const translateLanguage = useKoodistoLanguagesTranslation();
  const translateCommon = useCommonTranslation();
  const { t } = useAppTranslation({
    keyPrefix: 'akt.component.clerkTranslatorOverview.authorisations',
  });

  const dispatch = useAppDispatch();
  const { authorisationDetailsStatus } = useAppSelector(
    clerkTranslatorOverviewSelector
  );

  const isLoading = authorisationDetailsStatus === APIResponseStatus.InProgress;
  const dayjs = DateUtils.dayjs();
  const currentDate = dayjs();

  const defaultClassName = 'clerk-translator-details__authorisations-table';
  const combinedClassNames = isLoading
    ? `${defaultClassName} dimmed`
    : defaultClassName;

  const onPublishPermissionChange = (authorisation: Authorisation) => {
    const notifier = NotifierUtils.createNotifierDialog(
      t('actions.changePermissionToPublish.dialog.header'),
      Severity.Info,
      t('actions.changePermissionToPublish.dialog.description'),
      [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
          action: NOTIFIER_ACTION_DO_NOTHING,
        },
        {
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: () =>
            dispatch(updateAuthorisationPublishPermission(authorisation)),
        },
      ]
    );

    dispatch(showNotifierDialog(notifier));
  };

  return (
    <LoadingProgressIndicator isLoading={isLoading}>
      <Table
        size="small"
        className={combinedClassNames}
        data-testid="clerk-translator-details__authorisations-table"
      >
        <TableHead>
          <TableRow>
            <TableCell>{t('fields.languagePair')}</TableCell>
            <TableCell>{t('fields.basis')}</TableCell>
            <TableCell>{t('fields.startDate')}</TableCell>
            <TableCell>{t('fields.endDate')}</TableCell>
            <TableCell>{t('fields.isEffective')}</TableCell>
            <TableCell>{t('fields.permissionToPublish')}</TableCell>
            <TableCell>{t('fields.diaryNumber')}</TableCell>
            <TableCell>{translateCommon('delete')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {authorisations.map((a, i) => (
            <TableRow
              key={a.id ?? a.tempId}
              data-testid={`authorisations-table__id-${
                a.id ?? `${i}-unsaved`
              }-row`}
            >
              <TableCell>
                <Text>
                  {`${translateLanguage(a.languagePair.from)}
             - ${translateLanguage(a.languagePair.to)}`}
                </Text>
              </TableCell>
              <TableCell>
                <div className="columns gapped-xs">
                  <Text>{a.basis}</Text>
                  {a.basis === AuthorisationBasisEnum.AUT && (
                    <Tooltip
                      title={`${t(
                        'fields.examinationDate'
                      )}: ${DateUtils.formatOptionalDate(a.examinationDate)}`}
                      arrow
                      placement="bottom"
                    >
                      <CustomIconButton>
                        <InfoIcon color={Color.Secondary} />
                      </CustomIconButton>
                    </Tooltip>
                  )}
                </div>
              </TableCell>
              <TableCell>
                <Text>{DateUtils.formatOptionalDate(a.termBeginDate)}</Text>
              </TableCell>
              <TableCell>
                <Text>{DateUtils.formatOptionalDate(a.termEndDate)}</Text>
              </TableCell>
              <TableCell>
                <Text>
                  {AuthorisationUtils.isAuthorisationEffective(a, currentDate)
                    ? translateCommon('yes')
                    : translateCommon('no')}
                </Text>
              </TableCell>
              <TableCell>
                {permissionToPublishReadOnly ? (
                  <Text>
                    {a.permissionToPublish
                      ? translateCommon('yes')
                      : translateCommon('no')}
                  </Text>
                ) : (
                  <CustomSwitch
                    value={a.permissionToPublish}
                    onChange={() => onPublishPermissionChange(a)}
                    leftLabel={translateCommon('no')}
                    rightLabel={translateCommon('yes')}
                    aria-label={t(
                      'actions.changePermissionToPublish.ariaLabel'
                    )}
                  />
                )}
              </TableCell>
              <TableCell>
                <Text>{a.diaryNumber}</Text>
              </TableCell>
              <TableCell className="centered">
                <CustomIconButton
                  onClick={() => onAuthorisationRemove(a)}
                  aria-label={t('actions.removal.ariaLabel')}
                  data-testid={`authorisations-table__id-${
                    a.id || i
                  }-row__delete-btn`}
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
