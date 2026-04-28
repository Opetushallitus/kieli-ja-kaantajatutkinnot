import { Box, Container, Grid } from '@mui/material';
import { TFunction } from 'i18next';
import { FC, useEffect } from 'react';
import { Trans } from 'react-i18next';
import { H1, H2, HeaderSeparator, Text } from 'shared/components';
import { I18nNamespace } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { BulletList } from 'components/common/BulletList';
import { PublicExaminerListing } from 'components/publicExaminerListing/PublicExaminerListing';
import {
  useCommonTranslation,
  usePublicTranslation,
  VktI18nNamespace,
} from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { loadPublicExaminers } from 'redux/reducers/publicExaminer';

const GeneralInformationBox = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.goodAndSatisfactoryLevel.infoBox.general',
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

const BulletPointWithItalics = ({
  i18nKey,
  t,
}: {
  i18nKey: string;
  t: TFunction<I18nNamespace | VktI18nNamespace>;
}) => {
  return <Trans i18nKey={i18nKey} t={t} components={[<i key={i18nKey} />]} />;
};

const EnrollmentBox = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.goodAndSatisfactoryLevel.infoBox.enrollment',
  });

  return (
    <Container className="public-homepage__info-box">
      <div className="rows gapped-sm">
        <H2>{t('title')}</H2>
        <Text>{t('description')}</Text>
        <BulletList
          t={t}
          renderListItem={(
            t: TFunction<I18nNamespace | VktI18nNamespace>,
            k: string,
          ) => <BulletPointWithItalics i18nKey={k} t={t} />}
          points={[
            'bulletPoints.point1',
            'bulletPoints.point2',
            'bulletPoints.point3',
            'bulletPoints.point4',
            'bulletPoints.point5',
            'bulletPoints.point6',
            'bulletPoints.point7',
            'bulletPoints.point8',
            'bulletPoints.point9',
          ]}
        />
      </div>
    </Container>
  );
};

const EnrollmentFeesBox = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.goodAndSatisfactoryLevel.infoBox.enrollmentFees',
  });

  return (
    <Container className="public-homepage__info-box">
      <div className="rows gapped-sm">
        <H2>{t('title')}</H2>
        <BulletList
          t={t}
          points={['bulletPoints.point1', 'bulletPoints.point2']}
        />
      </div>
    </Container>
  );
};

export const PublicGoodAndSatisfactoryLevelLandingPage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.goodAndSatisfactoryLevel',
  });
  const dispatch = useAppDispatch();
  useEffect(() => {
    dispatch(loadPublicExaminers());
  }, [dispatch]);
  const { isPhone } = useWindowProperties();

  return (
    <Box className="public-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-homepage__grid-container"
      >
        <Grid className="public-homepage__grid-container__item-header">
          <div className="rows gapped-xxl">
            <div>
              <H1 data-testid="public-homepage__title-heading">{t('title')}</H1>
              <HeaderSeparator />
              <Text>
                {t('description.part1')} {t('description.part2')}{' '}
                {t('description.part3')} {t('description.part4')}
              </Text>
            </div>
            <div
              className={
                isPhone ? 'rows gapped' : 'columns gapped align-items-start'
              }
            >
              <GeneralInformationBox />
              <EnrollmentBox />
              <EnrollmentFeesBox />
            </div>
          </div>
        </Grid>
        <Grid className="public-homepage__grid-container__result-box">
          <PublicExaminerListing />
        </Grid>
      </Grid>
    </Box>
  );
};
