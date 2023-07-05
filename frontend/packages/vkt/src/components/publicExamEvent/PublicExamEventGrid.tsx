import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Grid, Typography } from '@mui/material';
import { useEffect } from 'react';
import { H1, H2, HeaderSeparator, Text, WebLink } from 'shared/components';

import { PublicExamEventListing } from 'components/publicExamEvent/listing/PublicExamEventListing';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { resetPublicEnrollment } from 'redux/reducers/publicEnrollment';
import { loadPublicExamEvents } from 'redux/reducers/publicExamEvent';
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
          <Text>{t('description.line3')}</Text>
        </div>
        <div className="margin-top-xxl rows gapped">
          <H2>{t('enrollment.title')}</H2>
          <div className="rows">
            <Text>{t('enrollment.description')}</Text>
            <BulletList
              points={[
                translateCommon('examinationPayment.part1'),
                translateCommon('examinationPayment.part2'),
              ]}
            />
            <Text className="margin-top-lg">
              {t('extraInformation.description')}{' '}
              <WebLink
                href={t('extraInformation.link.url')}
                label={t('extraInformation.link.label')}
                endIcon={<OpenInNewIcon />}
              />
            </Text>
          </div>
        </div>
      </Grid>
      <Grid item className="public-homepage__grid-container__result-box">
        <PublicExamEventListing status={status} />
      </Grid>
    </>
  );
};
