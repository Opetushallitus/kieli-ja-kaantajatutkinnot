import { TableCell } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
  CustomButton,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';
import { DateUtils } from 'shared/utils';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes, ExamLevel } from 'enums/app';
import { PublicExamEvent } from 'interfaces/publicExamEvent';
import { storePublicExamEvent } from 'redux/reducers/publicEnrollment';
import { publicEnrollmentSelector } from 'redux/selectors/publicEnrollment';
import { ExamEventUtils } from 'utils/examEvent';

const getOpeningsText = (
  examEvent: PublicExamEvent,
  t: (key: string) => string,
) => {
  if (examEvent.hasCongestion) {
    return (
      <>
        <Text>{t('openings.congestion.part1')}</Text>
        <Text>{t('openings.congestion.part2')}</Text>
      </>
    );
  } else if (examEvent.openings <= 0) {
    return (
      <>
        <Text>{t('openings.none.part1')}</Text>
        <Text>{t('openings.none.part2')}</Text>
      </>
    );
  }

  return <Text>{`${examEvent.openings}`}</Text>;
};

const renderEnrollmentButton = (
  examEvent: PublicExamEvent,
  isLoading: boolean,
  isDisabled: boolean,
  onClick: () => void,
  t: (key: string) => string,
  translateCommon: (t: string) => string,
) => {
  return (
    <LoadingProgressIndicator
      translateCommon={translateCommon}
      isLoading={isLoading}
    >
      <CustomButton
        data-testid={`public-exam-events-${examEvent.id}__enroll-btn`}
        color={Color.Secondary}
        variant={Variant.Outlined}
        disabled={isDisabled}
        onClick={onClick}
      >
        {examEvent.hasCongestion
          ? t('row.enrollLater')
          : ExamEventUtils.hasOpenings(examEvent)
          ? t('row.enroll')
          : t('row.enrollToQueue')}
      </CustomButton>
    </LoadingProgressIndicator>
  );
};

export const PublicExamEventPhoneCells = ({
  examEvent,
}: {
  examEvent: PublicExamEvent;
}) => {
  const { language, date, registrationCloses } = examEvent;

  // I18n
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventListing',
  });
  const translateCommon = useCommonTranslation();

  const { enrollmentInitialisationStatus, examEvent: selectedExamEvent } =
    useAppSelector(publicEnrollmentSelector);
  const isInitialisationInProgress =
    enrollmentInitialisationStatus === APIResponseStatus.InProgress;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleOnClick = () => {
    dispatch(storePublicExamEvent(examEvent));
    navigate(
      AppRoutes.PublicAuth.replace(':examEventId', examEvent.id.toString()),
    );
  };

  return (
    <TableCell>
      <div className="rows grow gapped-xs">
        <div className="rows">
          <b>{t('header.language')}</b>
          <Text>
            {ExamEventUtils.languageAndLevelText(
              language,
              ExamLevel.EXCELLENT,
              translateCommon,
            )}
          </Text>
        </div>
        <div className="rows">
          <b>{t('header.examDate')}</b>
          <Text>{DateUtils.formatOptionalDate(date, 'l')}</Text>
        </div>
        <div className="rows">
          <b>{t('header.registrationCloses')}</b>
          <Text>{DateUtils.formatOptionalDate(registrationCloses, 'l')}</Text>
        </div>
        <div className="rows">
          <b>{t('header.openings')}</b>
          {getOpeningsText(examEvent, t)}
        </div>
        {renderEnrollmentButton(
          examEvent,
          examEvent === selectedExamEvent,
          examEvent.hasCongestion || isInitialisationInProgress,
          handleOnClick,
          t,
          translateCommon,
        )}
      </div>
    </TableCell>
  );
};

export const PublicExamEventDesktopCells = ({
  examEvent,
}: {
  examEvent: PublicExamEvent;
}) => {
  const { language, date, registrationCloses } = examEvent;

  // I18n
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventListing',
  });
  const translateCommon = useCommonTranslation();

  const { enrollmentInitialisationStatus, examEvent: selectedExamEvent } =
    useAppSelector(publicEnrollmentSelector);
  const isInitialisationInProgress =
    enrollmentInitialisationStatus === APIResponseStatus.InProgress;

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const handleOnClick = () => {
    dispatch(storePublicExamEvent(examEvent));
    navigate(
      AppRoutes.PublicAuth.replace(':examEventId', examEvent.id.toString()),
    );
  };

  return (
    <>
      <TableCell>
        <Text>
          {ExamEventUtils.languageAndLevelText(
            language,
            ExamLevel.EXCELLENT,
            translateCommon,
          )}
        </Text>
      </TableCell>
      <TableCell>
        <Text>{DateUtils.formatOptionalDate(date, 'l')}</Text>
      </TableCell>
      <TableCell>
        <Text>{DateUtils.formatOptionalDate(registrationCloses, 'l')}</Text>
      </TableCell>
      <TableCell>{getOpeningsText(examEvent, t)}</TableCell>
      <TableCell>
        {renderEnrollmentButton(
          examEvent,
          examEvent === selectedExamEvent,
          examEvent.hasCongestion || isInitialisationInProgress,
          handleOnClick,
          t,
          translateCommon,
        )}
      </TableCell>
    </>
  );
};
