import { Box, Grid, Paper } from '@mui/material';
import { OphButton } from '@opetushallitus/oph-design-system';
import { FC, useEffect, useState } from 'react';
import { APIResponseStatus, Severity } from 'shared/enums';
import { useToast } from 'shared/hooks';

import { AddExamDateModal } from 'components/ClerkExamDates/AddExamDateModal';
import { ClerkExamDates } from 'components/ClerkExamDates/ClerkExamDates';
import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { H2 } from 'ophTheme/Text';
import { examDateSelector } from 'redux/selectors/examDate';

export const ClerkExamDatesPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.component.clerkExamDates',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { addStatus } = useAppSelector(examDateSelector);
  const { showToast } = useToast();

  useEffect(() => {
    if (addStatus === APIResponseStatus.Success) {
      showToast({
        description: t('toasts.examDateAdded'),
        severity: Severity.Success,
      });
    }
  }, [addStatus, showToast, t]);

  return (
    <Box className="clerk-exam-session-page">
      <div className="columns gapped-xs space-between">
        <H2>{t('header')}</H2>
        <OphButton
          variant="contained"
          color="primary"
          onClick={() => setIsModalOpen(true)}
        >
          {t('addNewExamDateButton')}
        </OphButton>
      </div>
      <AddExamDateModal
        isModalOpen={isModalOpen}
        setIsModalOpen={setIsModalOpen}
      />

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
