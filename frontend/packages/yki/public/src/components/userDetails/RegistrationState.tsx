import AlarmOutlinedIcon from '@mui/icons-material/AlarmOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import SchoolIcon from '@mui/icons-material/School';
import { Text } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';
import {
  EvaluationState,
  RegistrationKind,
  RegistrationStates,
} from 'enums/app';
import { PersonRegistrations } from 'interfaces/userDetails';

const EvaluationStateInfo = ({ state }: { state: EvaluationState }) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.userDetailsPage.registrations.state',
  });

  switch (state) {
    case EvaluationState.EvaluationPending:
    case EvaluationState.ReviewPending:
    case EvaluationState.ReviewComplete:
      return (
        <>
          <AlarmOutlinedIcon className="user-details-page__icon--alert" />
          <Text>{t(state)}</Text>
        </>
      );
    case EvaluationState.EvaluationComplete:
    case EvaluationState.ReviewFinalized:
      return (
        <>
          <SchoolIcon className="user-details-page__icon--ok" />{' '}
          <Text>{t(state)}</Text>
        </>
      );
    case EvaluationState.Aborted:
    case EvaluationState.NoShow:
      return (
        <>
          <NotInterestedIcon className="user-details-page__icon--cancel" />
          <Text>{t(state)}</Text>
        </>
      );
    default:
      return <></>;
  }
};

export const RegistrationState = ({
  registration,
}: {
  registration: PersonRegistrations;
}) => {
  const { state, evaluationState, kind } = registration;
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.userDetailsPage.registrations.state',
  });

  const hasEvaluation = !!evaluationState;

  const isEnrolled =
    state === RegistrationStates.Completed ||
    (state === RegistrationStates.Submitted &&
      kind === RegistrationKind.Admission);

  const isQueued =
    state === RegistrationStates.Submitted && kind === RegistrationKind.Queue;

  const positionInQueue = registration.positionInQueue || 1;

  const isCancelled = [
    RegistrationStates.Cancelled,
    RegistrationStates.Expired,
    RegistrationStates.PaidAndCancelled,
  ].includes(state);

  return (
    <div>
      <Text className="bold">{t('label')}</Text>
      <div className="columns gapped-xxs">
        {hasEvaluation && <EvaluationStateInfo state={evaluationState} />}
        {!hasEvaluation && isEnrolled && (
          <>
            <CheckCircleOutlinedIcon className="user-details-page__icon--ok" />{' '}
            <Text>{t('enrolled')}</Text>
          </>
        )}
        {isQueued && (
          <>
            <AlarmOutlinedIcon className="user-details-page__icon--alert" />
            <Text>{t('queued', { positionInQueue })}</Text>
          </>
        )}
        {isCancelled && (
          <>
            <NotInterestedIcon className="user-details-page__icon--cancel" />
            <Text>{t('cancelled')}</Text>
          </>
        )}
      </div>
    </div>
  );
};
