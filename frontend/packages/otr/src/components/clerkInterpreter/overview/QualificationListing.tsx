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
import { Qualification } from 'interfaces/qualification';
import { qualificationSelector } from 'redux/selectors/qualification';
import { QualificationUtils } from 'utils/qualifications';

export const QualificationListing = ({
  qualifications,
  showEditButton,
  onQualificationEdit,
  onQualificationRemove,
}: {
  qualifications: Array<Qualification>;
  showEditButton: boolean;
  onQualificationEdit?: (q: Qualification) => void;
  onQualificationRemove: (q: Qualification) => void;
}) => {
  const translateLanguage = useKoodistoLanguagesTranslation();
  const translateCommon = useCommonTranslation();
  const { t } = useAppTranslation({
    keyPrefix: 'otr.component.clerkInterpreterOverview.qualifications',
  });

  const { removeStatus } = useAppSelector(qualificationSelector);

  const isLoading = removeStatus === APIResponseStatus.InProgress;

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
        <TableHead className="heading-text">
          <TableRow>
            <TableCell>{t('fields.languagePair')}</TableCell>
            <TableCell>{t('fields.examinationType')}</TableCell>
            <TableCell>{t('fields.startDate')}</TableCell>
            <TableCell>{t('fields.endDate')}</TableCell>
            <TableCell>{t('fields.permissionToPublish')}</TableCell>
            <TableCell>{t('fields.diaryNumber')}</TableCell>
            <TableCell>{t('fields.actions')}</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {qualifications.map((q, i) => (
            <TableRow
              key={q.id ?? q.tempId}
              data-testid={`qualifications-table__id-${q.id ?? `${i}`}-row`}
            >
              <TableCell>
                <Text>
                  {QualificationUtils.getLanguagePairLocalisation(
                    { from: q.fromLang, to: q.toLang },
                    translateLanguage
                  )}
                </Text>
              </TableCell>
              <TableCell>
                <Text>{q.examinationType}</Text>
              </TableCell>
              <TableCell>
                <Text>{DateUtils.formatOptionalDate(dayjs(q.beginDate))}</Text>
              </TableCell>
              <TableCell>
                <Text>{DateUtils.formatOptionalDate(dayjs(q.endDate))}</Text>
              </TableCell>
              <TableCell>
                <Text>
                  {q.permissionToPublish
                    ? translateCommon('yes')
                    : translateCommon('no')}
                </Text>
              </TableCell>
              <TableCell>
                <Text>{q.diaryNumber}</Text>
              </TableCell>
              <TableCell className="centered">
                {showEditButton && onQualificationEdit ? (
                  <div className="grid-columns gapped-xs">
                    <CustomButton
                      variant={Variant.Contained}
                      color={Color.Secondary}
                      onClick={() => onQualificationEdit(q)}
                      data-testid={`qualifications-table__id-${
                        q.id || i
                      }-row__edit-btn`}
                    >
                      {translateCommon('edit')}
                    </CustomButton>
                    <CustomIconButton
                      onClick={() => onQualificationRemove(q)}
                      aria-label={t('actions.removal.ariaLabel')}
                      data-testid={`qualifications-table__id-${
                        q.id || i
                      }-row__delete-btn`}
                    >
                      <DeleteIcon color={Color.Error} />
                    </CustomIconButton>
                  </div>
                ) : (
                  <CustomIconButton
                    onClick={() => onQualificationRemove(q)}
                    aria-label={t('actions.removal.ariaLabel')}
                    data-testid={`qualifications-table__id-${
                      q.id || i
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
