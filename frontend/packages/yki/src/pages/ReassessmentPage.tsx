import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Grid, Paper } from '@mui/material';
import { Box } from '@mui/system';
import { FC, useEffect } from 'react';
import { H1, H2, HeaderSeparator, Text } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { PublicEvaluationPeriodListing } from 'components/reassessment/PublicEvaluationPeriodListing';
import { PublicEvaluationPeriodListingSkeleton } from 'components/skeletons/PublicEvaluationPeriodListingSkeleton';
import { usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { loadEvaluationPeriods } from 'redux/reducers/evaluationPeriods';
import { evaluationPeriodsSelector } from 'redux/selectors/evaluationPeriods';

export const ReassessmentPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.reassessmentPage',
  });

  const dispatch = useAppDispatch();
  const { status } = useAppSelector(evaluationPeriodsSelector);

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadEvaluationPeriods());
    }
  }, [dispatch, status]);

  return (
    <Box className="public-reassessment-page">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-reassessment-page__grid-container"
      >
        <Grid
          item
          className="public-reassessment-page__grid-container__item-header"
        >
          <H1 data-testid="public-reassessment-page__title-heading">
            {t('title')}
          </H1>
          <HeaderSeparator />
          <Text>{t('introduction.info')}</Text>
          <br />
          <Text>{t('introduction.timeLimit')}</Text>
        </Grid>
        <Grid
          item
          className="public-reassessment-page__grid-container__item-info"
        >
          <Paper elevation={3} className="public-reassessment-page__info">
            <div className="public-reassessment-page__info__section">
              <H2 className="public-reassessment-page__info__section__heading-title">
                {t('info.general.heading')}
              </H2>
              <Text>{t('info.general.body1')}</Text>
              <br />
              <Text>
                {t('info.general.body2')}
                <a
                  className="columns gapped-xxs"
                  href={t('info.general.link')}
                  rel="noreferrer"
                  target="_black"
                >
                  {t('info.general.linkText')}
                  <OpenInNewIcon />
                </a>
              </Text>
              <br />
              <Text>{t('info.general.body3')}</Text>
            </div>
            <div className="public-reassessment-page__pricing__section">
              <H2 className="public-reassessment-page__info__section__heading-title">
                {t('info.pricing.heading')}
              </H2>
              <Text>{t('info.pricing.body1')}</Text>
              <br />
              <Text>{t('info.pricing.body2')}</Text>
              <br />
              <Text>{t('info.pricing.body3')}</Text>
              <br />
              <Text>{t('info.pricing.body4')}</Text>
            </div>
          </Paper>
        </Grid>
        <Grid
          item
          className="public-reassessment-page__grid-container__result-box"
        >
          {status === APIResponseStatus.InProgress ? (
            <PublicEvaluationPeriodListingSkeleton />
          ) : (
            <PublicEvaluationPeriodListing />
          )}
        </Grid>
      </Grid>
    </Box>
  );
};
