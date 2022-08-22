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
import { AuthorisationBasisEnum } from 'enums/clerkTranslator';
import { Authorisation } from 'interfaces/authorisation';
import { clerkTranslatorOverviewSelector } from 'redux/selectors/clerkTranslatorOverview';
import { AuthorisationUtils } from 'utils/authorisation';

export const AuthorisationListing = ({
  authorisations,
  permissionToPublishReadOnly,
  onAuthorisationRemove,
  onPermissionToPublishChange,
}: {
  authorisations: Array<Authorisation>;
  permissionToPublishReadOnly: boolean;
  onAuthorisationRemove: (authorisation: Authorisation) => void;
  onPermissionToPublishChange?: (authorisation: Authorisation) => void;
}) => {
  const translateLanguage = useKoodistoLanguagesTranslation();
  const translateCommon = useCommonTranslation();
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.clerkTranslatorOverview.authorisations',
  });

  const { status } = useAppSelector(
    clerkTranslatorOverviewSelector
  ).authorisationDetailsState;

  const isLoading = status === APIResponseStatus.InProgress;
  const currentDate = dayjs();

  const defaultClassName = 'clerk-translator-details__authorisations-table';
  const combinedClassNames = isLoading
    ? `${defaultClassName} dimmed`
    : defaultClassName;

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
                    onChange={() =>
                      onPermissionToPublishChange &&
                      onPermissionToPublishChange(a)
                    }
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
