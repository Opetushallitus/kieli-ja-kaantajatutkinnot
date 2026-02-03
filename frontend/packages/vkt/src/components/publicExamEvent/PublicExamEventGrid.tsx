import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Container, Grid } from '@mui/material';
import { useEffect } from 'react';
import { Trans } from 'react-i18next';
import { H1, H2, HeaderSeparator, Text, WebLink } from 'shared/components';
import { APIResponseStatus } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { BoldedTranslationString } from 'components/common/BoldedTranslationString';
import { BulletList } from 'components/common/BulletList';
import { InformationBox } from 'components/common/InformationBox';
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

const DescriptionBox = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventGrid.description',
  });
  const translateCommon = useCommonTranslation();

  return (
    <Container className="public-homepage__info-box">
      <div className="rows gapped">
        <H2>{t('title')}</H2>
        <div className="rows">
          <Text>{t('skills')}</Text>
          <BulletList
            t={t}
            points={[
              'bulletPoints.point1',
              'bulletPoints.point2',
              'bulletPoints.point3',
            ]}
          />
        </div>

        <Text>{translateCommon('info.selectExam')}</Text>
        <Text>
          <Trans
            t={translateCommon}
            i18nKey="info.previousEnrollment"
            components={[<b key="0" />, <b key="1" />]}
          ></Trans>
        </Text>
      </div>
    </Container>
  );
};

const FreeExaminationBox = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventGrid.freeExamination',
  });

  return (
    <Container className="public-homepage__info-box">
      <div className="rows gapped">
        <H2>{t('title')}</H2>
        <Text>
          <BoldedTranslationString i18nKey="conditions.part1" t={t} />{' '}
          <WebLink
            href={t('conditions.link.url')}
            label={t('conditions.link.label')}
            endIcon={<OpenInNewIcon />}
          />
        </Text>
        <Text>
          <BoldedTranslationString i18nKey="conditions.part2" t={t} />
        </Text>
        <div className="rows">
          <Text>
            <BoldedTranslationString
              i18nKey="ineligibility.description"
              t={t}
            />{' '}
          </Text>
          <BulletList
            t={t}
            points={[
              'ineligibility.fullExaminationPayment',
              'ineligibility.partialExaminationPayment',
            ]}
          />
        </div>
      </div>
    </Container>
  );
};

const EnrollmentBox = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventGrid.enrollment',
  });

  return (
    <Container className="public-homepage__info-box">
      <div className="rows gapped">
        <H2>{t('title')}</H2>
        <Text>
          <BoldedTranslationString i18nKey="part1" t={t} />
          <br />
          {t('part2')}
        </Text>
        <Text>
          <BoldedTranslationString i18nKey="part3" t={t} />
          <br />
          {t('part4')}
        </Text>
        <Text>
          {t('part5')}{' '}
          <WebLink
            href={t('link.url')}
            label={t('link.label')}
            endIcon={<OpenInNewIcon />}
          />
        </Text>
      </div>
    </Container>
  );
};

export const PublicExamEventGrid = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicExamEventGrid',
  });

  const dispatch = useAppDispatch();
  const { status } = useAppSelector(publicExamEventsSelector);

  const { isPhone } = useWindowProperties();

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
      <Grid className="public-homepage__grid-container__item-header">
        <InformationBox />
        <H1 data-testid="public-homepage__title-heading">{t('title')}</H1>
        <HeaderSeparator />
        <div className="rows gapped">
          <Text>
            {t('introduction.line1')}
            <br />
            {t('introduction.line2')}
          </Text>
          <div
            className={
              isPhone ? 'rows gapped' : 'columns gapped align-items-start'
            }
          >
            <DescriptionBox />
            <FreeExaminationBox />
            <EnrollmentBox />
          </div>
        </div>
      </Grid>
      <Grid className="public-homepage__grid-container__result-box">
        <PublicExamEventListing status={status} />
      </Grid>
    </>
  );
};
