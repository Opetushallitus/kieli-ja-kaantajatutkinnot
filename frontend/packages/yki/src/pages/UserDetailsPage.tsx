import { Grid, Paper } from '@mui/material';
import { Box } from '@mui/system';
import { FC, useEffect } from 'react';
import { H1, H2, H3, HeaderSeparator, Text } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { loadEvaluationPeriods } from 'redux/reducers/evaluationPeriods';
import { userDetailsSelector } from 'redux/selectors/userDetails';

export const UserDetailsPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.reassessmentPage',
  });

  const dispatch = useAppDispatch();
  const { status } = useAppSelector(userDetailsSelector);

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadEvaluationPeriods());
    }
  }, [dispatch, status]);

  return (
    <Box className="user-details-page">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="user-details-page__grid-container"
      >
        <Grid item className="user-details-page__grid-container__item-header">
          <H1 data-testid="user-details-page__title-heading">{t('title')}</H1>
          <HeaderSeparator />
          <Text>{t('introduction.info')}</Text>
          <br />
          <Text>{t('introduction.timeLimit')}</Text>
        </Grid>
        <Grid item className="user-details-page__grid-container__item-info">
          <div className="margin-top-xxl">
            <H2 className="user-details-page__info__section__heading-title">
              Yhteystietosi
            </H2>
            <Paper elevation={3} className="user-details-page__info">
              <div className="user-details-page__info__section">
                <Text>
                  Yhteystietoja käytetään tutkintotodistuksen lähettämiseen
                </Text>
              </div>
            </Paper>
          </div>
          <div className="margin-top-xxl">
            <H2 className="user-details-page__info__section__heading-title">
              Tulevat kielitutkintojen testisi
            </H2>
            <Paper elevation={3} className="user-details-page__event">
              <div className="user-details-page__info__section">
                <H3>suomi, keskitaso</H3>
              </div>
              <div className="user-details-page__pricing__section"></div>
            </Paper>
          </div>
        </Grid>
      </Grid>
    </Box>
  );
};
