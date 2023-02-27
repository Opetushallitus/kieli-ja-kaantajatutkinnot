import { Grid, Paper } from '@mui/material';
import { Box } from '@mui/system';
import { FC, useEffect, useState } from 'react';
import { H1, H2, HeaderSeparator, Text } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { PublicExamSessionListing } from 'components/registration/examSession/PublicExamSessionListing';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { ExamSession } from 'interfaces/examSessions';
import { loadExamSessions } from 'redux/reducers/examSessions';
import { examSessionsSelector } from 'redux/selectors/examSessions';

const PricingBulletList = () => {
  const translateCommon = useCommonTranslation();
  const examParts = [
    'readingComprehension',
    'speechComprehension',
    'writing',
    'speaking',
  ];

  return (
    <ul>
      <Text>
        {examParts.map((key, i) => (
          <li key={i}>{translateCommon(`examParts.${key}`)} 50 €</li>
        ))}
      </Text>
    </ul>
  );
};

export const ReassessmentPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.reassessmentPage',
  });

  const dispatch = useAppDispatch();
  const { status, exam_sessions } = useAppSelector(examSessionsSelector);
  const [results, setResults] = useState<Array<ExamSession>>([]);

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadExamSessions());
    } else if (status === APIResponseStatus.Success) {
      setResults(exam_sessions);
    }
  }, [dispatch, status, exam_sessions]);

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
          <Text className="bold">{t('introduction.fee')}</Text>
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
              <Text className="bold margin-top-lg">
                {t('info.general.body2')}
              </Text>
              <Text>{t('info.general.body3')}</Text>
            </div>
            <div className="public-reassessmnet-page__info__section">
              <H2 className="public-reassessment-page__info__section__heading-title">
                {t('info.pricing.heading')}
              </H2>
              <Text>{t('info.pricing.body1')}</Text>
              <Text className="bold">{t('info.pricing.body2')}</Text>
              <PricingBulletList />
              <Text>{t('info.pricing.body3')}</Text>
              <Text>{t('info.pricing.body4')}</Text>
            </div>
          </Paper>
        </Grid>
        <Grid item className="public-homepage__grid-container__result-box">
          <PublicExamSessionListing examSessions={results} />
        </Grid>
      </Grid>
    </Box>
  );
};
