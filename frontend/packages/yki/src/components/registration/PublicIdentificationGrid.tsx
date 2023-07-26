import { Grid, Paper } from '@mui/material';
import { H1, HeaderSeparator, Text } from 'shared/components';
import { useWindowProperties } from 'shared/hooks';

import { SelectIdentificationMethod } from 'components/registration/identification/SelectIdentificationMethod';
import { PublicRegistrationControlButtons } from 'components/registration/PublicRegistrationControlButtons';
import { PublicRegistrationExamSessionDetails } from 'components/registration/PublicRegistrationExamSessionDetails';
import { PublicRegistrationStepper } from 'components/registration/PublicRegistrationStepper';
import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { examSessionSelector } from 'redux/selectors/examSession';

export const PublicIdentificationGrid = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.registration.steps.identify',
  });
  const { isPhone } = useWindowProperties();

  const { examSession } = useAppSelector(examSessionSelector);

  if (!examSession) {
    return null;
  }

  return (
    <Grid
      container
      rowSpacing={4}
      direction="column"
      className="public-registration"
    >
      <Grid className="public-registration" item>
        <div className="public-registration__grid">
          <div className="rows gapped-xxl">
            <PublicRegistrationStepper />
            <div className="rows public-registration__grid__heading">
              <H1>{t('title')}</H1>
              <HeaderSeparator />
            </div>
          </div>
          <Paper elevation={isPhone ? 0 : 3}>
            <div className="public-registration__grid__form-container">
              <div className="rows gapped">
                <PublicRegistrationExamSessionDetails
                  examSession={examSession}
                  showOpenings={true}
                />
                <Text>{t('registrationIsBindingAdvisory')}</Text>
                <div className="gapped rows">
                  <SelectIdentificationMethod />
                  <PublicRegistrationControlButtons />
                </div>
              </div>
            </div>
          </Paper>
        </div>
      </Grid>{' '}
    </Grid>
  );
};
