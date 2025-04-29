import { Grid, Paper } from '@mui/material';
import { Box } from '@mui/system';
import { FC, useEffect } from 'react';
import { H1, H2, H3, HeaderSeparator, Text } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { loadPersonDetails } from 'redux/reducers/userDetails';
import { userDetailsSelector } from 'redux/selectors/userDetails';

export const UserDetailsPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.reassessmentPage',
  });

  const dispatch = useAppDispatch();
  const { status, personDetails } = useAppSelector(userDetailsSelector);

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadPersonDetails());
    }
  }, [dispatch, status]);

  if (!personDetails) {
    return <></>;
  }

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
                <Text className="bold">
                  {personDetails.first_name}
                </Text>
                <Text>
                  <b>Email:</b> {personDetails.email}
                </Text>
              </div>
            </Paper>
          </div>
          {personDetails.registrations?.map((r) => (
            <div className="margin-top-xxl">
              <H2 className="user-details-page__info__section__heading-title">
                Tulevat kielitutkintojen testisi
              </H2>
              <Paper elevation={3} className="user-details-page__event">
                <div className="user-details-page__info__section">
                  <H3>suomi, keskitaso</H3>
                </div>
                <div>
                  <Text className="bold">Testipäivä</Text>
                  <Text>{r.examDate}</Text>
                </div>
                <div>
                  <Text className="bold">Testipaikka</Text>
                  <Text>{r.streetAddress}, {r.postOffice}</Text>
                </div>
                <div className="user-details-page__pricing__section"></div>
              </Paper>
            </div>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
};
