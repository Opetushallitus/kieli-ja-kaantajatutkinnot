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
import {
  CustomButton,
  CustomIconButton,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import {
  useAppTranslation,
  useCommonTranslation,
  useKoodistoLanguagesTranslation,
} from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { AuthorisationBasisEnum } from 'enums/clerkTranslator';
import { Authorisation } from 'interfaces/authorisation';
import { authorisationSelector } from 'redux/selectors/authorisation';
import { AuthorisationUtils } from 'utils/authorisation';

export const AuthorisationListing = ({
  authorisations,
  showEditButton,
  onAuthorisationEdit,
  onAuthorisationRemove,
}: {
  authorisations: Array<Authorisation>;
  showEditButton: boolean;
  onAuthorisationEdit?: (authorisation: Authorisation) => void;
  onAuthorisationRemove: (authorisation: Authorisation) => void;
}) => {
  const translateLanguage = useKoodistoLanguagesTranslation();
  const translateCommon = useCommonTranslation();
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.clerkTranslatorOverview.authorisations',
  });

  const { removeStatus } = useAppSelector(authorisationSelector);

  const isLoading = removeStatus === APIResponseStatus.InProgress;

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
        <TableHead className="heading-text">
          <TableRow>
            <TableCell>{t('fields.languagePair')}</TableCell>
            <TableCell>{t('fields.basis')}</TableCell>
            <TableCell>{t('fields.startDate')}</TableCell>
            <TableCell>{t('fields.endDate')}</TableCell>
            <TableCell>{t('fields.permissionToPublish')}</TableCell>
            <TableCell>{t('fields.diaryNumber')}</TableCell>
            <TableCell>{t('fields.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {authorisations.map((a, i) => (
            <TableRow
              key={a.id ?? a.tempId}
              data-testid={`authorisations-table__id-${a.id ?? `${i}`}-row`}
            >
              <TableCell>
                <Text>
                  {AuthorisationUtils.getLanguagePairLocalisation(
                    a.languagePair,
                    translateLanguage
                  )}
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
                  {a.permissionToPublish
                    ? translateCommon('yes')
                    : translateCommon('no')}
                </Text>
              </TableCell>
              <TableCell>
                <Text>{a.diaryNumber}</Text>
              </TableCell>
              <TableCell>
                {showEditButton && onAuthorisationEdit ? (
                  <div className="grid-columns gapped-xs">
                    <CustomButton
                      variant={Variant.Contained}
                      color={Color.Secondary}
                      onClick={() => onAuthorisationEdit(a)}
                      data-testid={`authorisations-table__id-${
                        a.id || i
                      }-row__edit-btn`}
                    >
                      {translateCommon('edit')}
                    </CustomButton>
                    <CustomIconButton
                      onClick={() => onAuthorisationRemove(a)}
                      aria-label={t('actions.removal.ariaLabel')}
                      data-testid={`authorisations-table__id-${
                        a.id || i
                      }-row__delete-btn`}
                    >
                      <DeleteIcon color={Color.Error} />
                    </CustomIconButton>
                  </div>
                ) : (
                  <CustomIconButton
                    onClick={() => onAuthorisationRemove(a)}
                    aria-label={t('actions.removal.ariaLabel')}
                    data-testid={`authorisations-table__id-${
                      a.id || i
                    }-row__delete-btn`}
                  >
                    <DeleteIcon color={Color.Error} />
                  </CustomIconButton>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </LoadingProgressIndicator>
  );
};
