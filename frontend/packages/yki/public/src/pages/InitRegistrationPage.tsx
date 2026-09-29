import { Box } from '@mui/material';
import { useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router';
import { Text } from 'shared/components';

import { BackToFrontPageButton } from 'components/elements/BackToFrontPageButton';
import { PublicRegistrationInitErrorView } from 'components/registration/errors/PublicRegistrationInitErrorView';
import { PublicIdentificationGrid } from 'components/registration/PublicIdentificationGrid';
import { RegistrationNotAvailable } from 'components/registration/RegistrationNotAvailable';
import { PublicIdentificationPageSkeleton } from 'components/skeletons/PublicIdentificationPageSkeleton';
import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { RegistrationStates } from 'enums/app';
import { useRegistrationContext } from 'hooks/useRegistrationContext';
import { resetPublicIdentificationState } from 'redux/reducers/publicIdentification';
import { examSessionSelector } from 'redux/selectors/examSession';
import { registrationSelector } from 'redux/selectors/registration';
import { ExamSessionUtils } from 'utils/examSession';

export const ContentSelector = () => {
  const examSession = useAppSelector(examSessionSelector).examSession;
  if (!examSession) {
    return null;
  }
  const { open } =
    ExamSessionUtils.getEffectiveRegistrationPeriodDetails(examSession);

  if (!open) {
    return <RegistrationNotAvailable />;
  } else {
    return <PublicIdentificationGrid />;
  }
};

export const InitRegistrationPage = () => {
  const dispatch = useAppDispatch();
  const translateCommon = useCommonTranslation();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const { isLoading, failed } = useRegistrationContext(
    Number(params.examSessionId),
    Number(searchParams.get('registrationId')),
    true,
  );
  const { context } = useAppSelector(registrationSelector);
  useEffect(
    () => () => {
      dispatch(resetPublicIdentificationState());
    },
    [dispatch],
  );

  return (
    <Box className="public-exam-details-page">
      {isLoading ? (
        <PublicIdentificationPageSkeleton />
      ) : failed ? (
        <PublicRegistrationInitErrorView />
      ) : context?.state === RegistrationStates.Expired ? (
        <div className="rows gapped">
          <Text>{translateCommon('errors.registration.formExpired')}</Text>
          <BackToFrontPageButton />
        </div>
      ) : context &&
        [
          RegistrationStates.Cancelled,
          RegistrationStates.PaidAndCancelled,
          RegistrationStates.Unknown,
        ].includes(context.state) ? (
        <PublicRegistrationInitErrorView />
      ) : (
        <div className="rows gapped">
          <ContentSelector />
        </div>
      )}
    </Box>
  );
};
