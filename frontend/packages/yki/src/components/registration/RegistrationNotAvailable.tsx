import { Grid, Paper } from '@mui/material';
import { H1, HeaderSeparator, Text } from 'shared/components';
import { useWindowProperties } from 'shared/hooks';

import { BackToFrontPageButton } from 'components/elements/BackToFrontPageButton';
import { EnrollToQueue } from 'components/registration/EnrollToQueue';
import { PublicRegistrationExamSessionDetails } from 'components/registration/PublicRegistrationExamSessionDetails';
import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { ExamSession } from 'interfaces/examSessions';
import { examSessionSelector } from 'redux/selectors/examSession';
import { ExamSessionUtils } from 'utils/examSession';

const DescribeUnavailability = ({
  descriptionPrefix,
}: {
  descriptionPrefix: string;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.unavailable',
  });

  return (
    <div className="rows gapped">
      <Text>{t(descriptionPrefix + '.description')}</Text>
      <BackToFrontPageButton />
    </div>
  );
};

const getReasonForUnavailability = ({
  open,
  upcoming_admission,
  upcoming_post_admission,
}: ExamSession) => {
  if (open) {
    return 'full';
  } else if (upcoming_admission || upcoming_post_admission) {
    return 'upcoming';
  } else return 'past';
};

const RegistrationUnavailableHeader = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration',
  });
  const examSession = useAppSelector(examSessionSelector)
    .examSession as ExamSession;
  const { availableQueue } =
    ExamSessionUtils.getEffectiveRegistrationPeriodDetails(examSession);
  const reasonForUnavailability = getReasonForUnavailability(examSession);

  return (
    <H1>
      {availableQueue
        ? t('enrollToQueue.header')
        : t(`unavailable.${reasonForUnavailability}.title`)}
    </H1>
  );
};

export const RegistrationNotAvailable = () => {
  const { isPhone } = useWindowProperties();
  const examSession = useAppSelector(examSessionSelector)
    .examSession as ExamSession;
  const { availableQueue } =
    ExamSessionUtils.getEffectiveRegistrationPeriodDetails(examSession);
  const reasonForUnavailability = getReasonForUnavailability(examSession);

  return (
    <Grid className="public-registration" item>
      <div className="public-registration__grid">
        <div className="rows public-registration__grid__heading public-registration__grid__no-stepper">
          <RegistrationUnavailableHeader />
          <HeaderSeparator />
        </div>
        <Paper elevation={isPhone ? 0 : 3}>
          <div className="public-registration__grid__form-container">
            <div className="rows gapped">
              <PublicRegistrationExamSessionDetails
                examSession={examSession}
                showOpenings={true}
              />
              {availableQueue ? (
                <EnrollToQueue />
              ) : (
                <DescribeUnavailability
                  descriptionPrefix={reasonForUnavailability}
                />
              )}
            </div>
          </div>
        </Paper>
      </div>
    </Grid>
  );
};
