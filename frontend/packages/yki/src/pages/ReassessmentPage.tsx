import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Grid,
  Paper,
} from '@mui/material';
import { Box } from '@mui/system';
import { FC, useEffect } from 'react';
import { H1, H2, HeaderSeparator, Text } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { PublicEvaluationPeriodListing } from 'components/reassessment/PublicEvaluationPeriodListing';
import { PublicEvaluationPeriodListingSkeleton } from 'components/skeletons/PublicEvaluationPeriodListingSkeleton';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { loadEvaluationPeriods } from 'redux/reducers/evaluationPeriods';
import { evaluationPeriodsSelector } from 'redux/selectors/evaluationPeriods';

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

const PricingAccordion = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.reassessmentPage.info.pricing',
  });

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Text className="bold">{t('heading')}</Text>
      </AccordionSummary>
      <AccordionDetails>
        <Text>{t('body1')}</Text>
        <Text className="bold">{t('body2')}</Text>
        <PricingBulletList />
        <Text>{t('body3')}</Text>
        <Text>{t('body4')}</Text>
      </AccordionDetails>
    </Accordion>
  );
};

const PricingSection = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.reassessmentPage.info.pricing',
  });

  return (
    <>
      <H2 className="public-reassessment-page__info__section__heading-title">
        {t('heading')}
      </H2>
      <Text>{t('body1')}</Text>
      <Text className="bold">{t('body2')}</Text>
      <PricingBulletList />
      <Text>{t('body3')}</Text>
      <Text>{t('body4')}</Text>
    </>
  );
};

const ScheduleAccordion = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.reassessmentPage.info.schedule',
  });

  return (
    <Accordion>
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Text className="bold"> {t('heading')}</Text>
      </AccordionSummary>
      <AccordionDetails>
        <Text>{t('body1')}</Text>
        <Text>{t('body2')}</Text>
        <br />
        <Text>{t('body3')}</Text>
        <Text>{t('body4')}</Text>
      </AccordionDetails>
    </Accordion>
  );
};

const ScheduleSection = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.reassessmentPage.info.schedule',
  });

  return (
    <>
      <H2 className="public-reassessment-page__info__section__heading-title">
        {t('heading')}
      </H2>
      <Text>{t('body1')}</Text>
      <Text>{t('body2')}</Text>
      <br />
      <Text>
        {t('body3')} {t('body4')}
      </Text>
    </>
  );
};

export const ReassessmentPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.reassessmentPage',
  });

  const { isPhone } = useWindowProperties();
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
            {isPhone ? (
              <div className="public-reassessment-page__info__accordions">
                <PricingAccordion />
                <ScheduleAccordion />
              </div>
            ) : (
              <>
                <div className="public-reassessment-page__info__section">
                  <PricingSection />
                </div>
                <div className="public-reassessment-page__info__section">
                  <ScheduleSection />
                </div>
              </>
            )}
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
