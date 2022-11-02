import DownloadIcon from '@mui/icons-material/DownloadOutlined';
import { Divider, Grid, Paper } from '@mui/material';
import { FC } from 'react';
import { ExtLink, H1, H2 } from 'shared/components';

import { useAppTranslation } from 'configs/i18n';
import { APIEndpoints } from 'enums/api';

export const StatisticsPage: FC = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'akr.pages',
  });

  return (
    <div className="statistics-page">
      <H1>{t('clerkHomepage.title')}</H1>
      <Paper elevation={3}>
        <Grid
          container
          direction="column"
          className="statistics-page__grid-container"
        >
          <Grid item>
            <H2>{t('statisticsPage.title')}</H2>
          </Grid>
          <Grid item>
            <Divider />
          </Grid>
          <Grid item>
            <H2>{t('statisticsPage.contactRequests')}</H2>
            <div className="rows gapped-s align-items-start">
              <ExtLink
                href={APIEndpoints.StatisticsContactRequestsYearly}
                text={t('statisticsPage.yearly')}
                startIcon={<DownloadIcon />}
              />
              <ExtLink
                href={APIEndpoints.StatisticsContactRequestsMonthly}
                text={t('statisticsPage.monthly')}
                startIcon={<DownloadIcon />}
              />
              <ExtLink
                href={APIEndpoints.StatisticsContactRequestsDaily}
                text={t('statisticsPage.daily')}
                startIcon={<DownloadIcon />}
              />
            </div>
          </Grid>
          <Grid item>
            <H2>{t('statisticsPage.emails')}</H2>
            <div className="rows gapped-s align-items-start">
              <ExtLink
                href={APIEndpoints.StatisticsEmailsYearly}
                text={t('statisticsPage.yearly')}
                startIcon={<DownloadIcon />}
              />
              <ExtLink
                href={APIEndpoints.StatisticsEmailsMonthly}
                text={t('statisticsPage.monthly')}
                startIcon={<DownloadIcon />}
              />
              <ExtLink
                href={APIEndpoints.StatisticsEmailsDaily}
                text={t('statisticsPage.daily')}
                startIcon={<DownloadIcon />}
              />
            </div>
          </Grid>
        </Grid>
      </Paper>
    </div>
  );
};
