import { Grid, Paper } from '@mui/material';
import { H1, HeaderSeparator, Text } from 'shared/components';
import { useWindowProperties } from 'shared/hooks';

import { BackToFrontPageButton } from 'components/elements/BackToFrontPageButton';
import { PublicRegistrationExamSessionDetails } from 'components/registration/PublicRegistrationExamSessionDetails';
import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { ExamSession } from 'interfaces/examSessions';
import { examSessionSelector } from 'redux/selectors/examSession';

const DescribeUnavailability = ({
  descriptionPrefix,
}: {
  descriptionPrefix: string;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.unavailable',
  });

  const getUnavailabilityDescription = (descriptionPrefix: string) => {
    if (descriptionPrefix === 'full') {
      return (
        <>
          <Text>{t(descriptionPrefix + '.description1')}</Text>;
          <Text>{t(descriptionPrefix + '.description2')}</Text>;
        </>
      );
    }

    return <Text>{t(descriptionPrefix + '.description')}</Text>;
  };

  return (
    <div className="rows gapped">
      {getUnavailabilityDescription(descriptionPrefix)}
      <BackToFrontPageButton />
    </div>
  );
};

const getReasonForUnavailability = ({
  open,
  upcoming_admission,
}: ExamSession) => {
  if (open) {
    return 'full';
  } else if (upcoming_admission) {
    return 'upcoming';
  } else return 'past';
};

const RegistrationUnavailableHeader = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration',
  });
  const examSession = useAppSelector(examSessionSelector)
    .examSession as ExamSession;
  const reasonForUnavailability = getReasonForUnavailability(examSession);

  return <H1>{t(`unavailable.${reasonForUnavailability}.title`)}</H1>;
};

export const RegistrationNotAvailable = () => {
  const { isPhone } = useWindowProperties();
  const examSession = useAppSelector(examSessionSelector)
    .examSession as ExamSession;
  const reasonForUnavailability = getReasonForUnavailability(examSession);

  return (
    <Grid className="public-registration">
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
              <DescribeUnavailability
                descriptionPrefix={reasonForUnavailability}
              />
            </div>
          </div>
        </Paper>
      </div>
    </Grid>
  );
};
