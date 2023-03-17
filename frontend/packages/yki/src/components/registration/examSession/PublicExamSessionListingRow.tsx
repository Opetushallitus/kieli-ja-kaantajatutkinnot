import { TableCell, TableRow } from '@mui/material';
import { useNavigate } from 'react-router';
import { CustomButton } from 'shared/components';
import { Color, Variant } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { getCurrentLang, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { ExamSession } from 'interfaces/examSessions';
import { storeExamSession } from 'redux/reducers/examSession';
import { ExamUtils } from 'utils/exam';

export const PublicExamSessionListingRow = ({
  examSession,
}: {
  examSession: ExamSession;
}) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const locationInfo = ExamUtils.getLocationInfo(examSession, getCurrentLang());

  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.registrationPage',
  });

  return (
    <TableRow
      className="cursor-pointer"
      data-testid={`public-exam-session__id-${examSession.id}-row`}
    >
      <TableCell>{ExamUtils.languageAndLevelText(examSession)}</TableCell>
      <TableCell>
        {DateUtils.formatOptionalDate(examSession.session_date, 'l')}
      </TableCell>
      <TableCell>
        {locationInfo?.name}
        <br />
        <b>{locationInfo?.post_office}</b>
      </TableCell>
      <TableCell>
        {ExamUtils.renderDateTime(
          examSession.registration_start_date?.hour(10)
        )}{' '}
        &ndash;{' '}
        {ExamUtils.renderDateTime(examSession.registration_end_date?.hour(16))}
      </TableCell>
      <TableCell>{examSession.exam_fee} €</TableCell>
      <TableCell>
        {examSession.max_participants - (examSession.participants ?? 0)}
      </TableCell>
      <TableCell>
        <CustomButton
          data-testid="clerk-translator-registry__reset-filters-btn"
          color={Color.Secondary}
          variant={Variant.Outlined}
          onClick={() => {
            dispatch(storeExamSession(examSession));
            navigate(
              AppRoutes.ExamSession.replace(
                /:examSessionId$/,
                `${examSession.id}`
              )
            );
          }}
        >
          {t('register')}
        </CustomButton>
      </TableCell>
    </TableRow>
  );
};
