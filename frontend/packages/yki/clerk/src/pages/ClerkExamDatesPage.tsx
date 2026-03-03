import { Box, Grid, Paper } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { FC } from 'react';

import { ClerkExamDates } from 'components/ClerkExamDates/ClerkExamDates';
import { usePublicTranslation } from 'configs/i18n';
import { H2 } from 'ophTheme/Text';

export const ClerkExamDatesPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkExamDates',
  });

  return (
    <Box className="clerk-exam-session-page">
      <div className="columns gapped-xs space-between">
        <H2>{t('header')}</H2>
        <OphButton variant="contained" color="primary">
          {t('addNewExamDateButton')}
        </OphButton>
      </div>

      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="clerk-exam-session-page__grid-container"
      >
        <Paper
          elevation={3}
          className="clerk-exam-session-page__grid-container__results"
        >
          <ClerkExamDates />
        </Paper>
      </Grid>
    </Box>
  );
};
