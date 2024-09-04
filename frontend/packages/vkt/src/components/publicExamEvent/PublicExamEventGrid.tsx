import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Grid, Typography } from '@mui/material';
import { useEffect } from 'react';
import { H1, H2, HeaderSeparator, Text, WebLink } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';

import { PublicExamEventListing } from 'components/publicExamEvent/listing/PublicExamEventListing';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { useInterval } from 'hooks/useInterval';
import { resetPublicEnrollment } from 'redux/reducers/publicEnrollment';
import {
  loadPublicExamEvents,
  refreshPublicExamEvents,
} from 'redux/reducers/publicExamEvent';
import { publicExamEventsSelector } from 'redux/selectors/publicExamEvent';

const BulletList = ({ points }: { points: Array<string> }) => {
  return (
    <Typography className="margin-top-sm" variant="body1" component="ul">
      {points.map((point, i) => (
        <li key={i}>{point}</li>
      ))}
    </Typography>
  );
};

export const PublicExamEventGrid = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventGrid',
  });
  const translateCommon = useCommonTranslation();

  const dispatch = useAppDispatch();
  const { status } = useAppSelector(publicExamEventsSelector);

  useEffect(() => {
    dispatch(resetPublicEnrollment());
    dispatch(loadPublicExamEvents());
  }, [dispatch]);

  const listingRefresh = () => {
    if (status === APIResponseStatus.Success) {
      if (!document.hidden) {
        dispatch(refreshPublicExamEvents());
      }
    }
  };

  useInterval(listingRefresh, 10000); // Every 10 seconds

  return (
    <>
      <Grid item className="public-homepage__grid-container__item-header">
        <H1 data-testid="public-homepage__title-heading">{t('title')}</H1>
        <HeaderSeparator />
        <div className="rows gapped">
          <Text>{t('description.line1')}</Text>
          <div className="rows">
            <Text>{t('description.line2')}</Text>
            <BulletList
              points={[
                t('description.bulletPoints.point1'),
                t('description.bulletPoints.point2'),
                t('description.bulletPoints.point3'),
              ]}
            />
          </div>
          <Text>{translateCommon('info.selectExam')}</Text>
          <Text>{translateCommon('info.previousEnrollment')}</Text>
        </div>
        <div className="margin-top-xxl rows gapped">
          <H2>{t('freeExamination.title')}</H2>
          <Text>
            {t('freeExamination.conditions.part1')}{' '}
            <WebLink
              href={t('freeExamination.conditions.link.url')}
              label={t('freeExamination.conditions.link.label')}
              endIcon={<OpenInNewIcon />}
            />
          </Text>
          <Text>{t('freeExamination.conditions.part2')}</Text>
          <Text>
            {t('freeExamination.ineligibility.description')}
            <br />
            {t('freeExamination.ineligibility.fullExaminationPayment')}
            <br />
            {t('freeExamination.ineligibility.partialExaminationPayment')}
          </Text>
        </div>
        <div className="margin-top-xxl rows gapped">
          <H2>{t('enrollment.title')}</H2>
          <Text>
            {t('enrollment.part1')}
            <br />
            {t('enrollment.part2')}
          </Text>
          <Text>
            {t('enrollment.part3')}
            <br />
            {t('enrollment.part4')}
          </Text>
          <Text>
            {t('enrollment.part5')}{' '}
            <WebLink
              href={t('enrollment.link.url')}
              label={t('enrollment.link.label')}
              endIcon={<OpenInNewIcon />}
            />
          </Text>
        </div>
      </Grid>
      <Grid item className="public-homepage__grid-container__result-box">
        <PublicExamEventListing status={status} />
      </Grid>
    </>
  );
};
