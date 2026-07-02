import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Button, Container, Grid, Paper, Typography } from '@mui/material';
import React, { FC } from 'react';
import { Link } from 'react-router-dom';
import { H1, H2, HeaderSeparator, Text, WebLink } from 'shared/components';
import { Color, Variant } from 'shared/enums';
import { useWindowProperties } from 'shared/hooks';

import { usePublicTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import ExcellentLevelCardImageAvif from 'public/images/excellent_level_card_image.avif';
import ExcellentLevelCardImageJpeg from 'public/images/excellent_level_card_image.jpg';
import ExcellentLevelCardImageWebp from 'public/images/excellent_level_card_image.webp';
import GoodAndSatisfactoryLevelCardImageAvif from 'public/images/good_satisfactory_level_card_image.avif';
import GoodAndSatisfactoryLevelCardImageJpeg from 'public/images/good_satisfactory_level_card_image.jpg';
import GoodAndSatisfactoryLevelCardImageWebp from 'public/images/good_satisfactory_level_card_image.webp';
import { featureFlagsSelector } from 'redux/selectors/featureFlags';

const LinkButton = ({ to, label }: { to: AppRoutes; label: string }) => {
  return (
    <Link to={to} className="card-contents custom-button-link rows flex-end">
      <Button
        variant={Variant.Contained}
        color={Color.Secondary}
        className="text-transform-none"
      >
        {label}
      </Button>
    </Link>
  );
};

const LevelCard = ({
  heading,
  image,
  contents,
  linkLabel,
  linkTo,
}: {
  heading: string;
  image: React.JSX.Element;
  contents: React.JSX.Element;
  linkLabel: string;
  linkTo: AppRoutes;
}) => {
  return (
    <Paper
      className="public-homepage__level-description-card rows"
      elevation={2}
    >
      <div className="rows grow">
        <div className="card-image-wrapper">
          <div className="image-overlay" />
          {image}
        </div>
        <div className="card-contents rows gapped grow">
          <Typography component="h3" variant="h2">
            {heading}
          </Typography>
          {contents}
        </div>
        <LinkButton label={linkLabel} to={linkTo} />
      </div>
    </Paper>
  );
};

const ExcellentLevelCardImage = () => {
  return (
    <picture>
      <source srcSet={ExcellentLevelCardImageAvif} type="image/avif" />
      <source srcSet={ExcellentLevelCardImageWebp} type="image/webp" />
      <img src={ExcellentLevelCardImageJpeg} alt="" />
    </picture>
  );
};

const ExcellentLevelCard = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicHomePage.cards.excellentLevel',
  });

  return (
    <LevelCard
      image={<ExcellentLevelCardImage />}
      heading={t('heading')}
      contents={
        <Text>
          {t('description.part1')} {t('description.part2')}{' '}
          {t('description.part3')}
        </Text>
      }
      linkLabel={t('callToAction')}
      linkTo={AppRoutes.PublicExcellentLevelLanding}
    />
  );
};

const GoodAndSatisfactoryLevelCardImage = () => {
  return (
    <picture>
      <source
        srcSet={GoodAndSatisfactoryLevelCardImageAvif}
        type="image/avif"
      />
      <source
        srcSet={GoodAndSatisfactoryLevelCardImageWebp}
        type="image/webp"
      />
      <img src={GoodAndSatisfactoryLevelCardImageJpeg} alt="" />
    </picture>
  );
};

const GoodAndSatisfactoryLevelCard = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicHomePage.cards.goodAndSatisfactoryLevel',
  });

  return (
    <LevelCard
      image={<GoodAndSatisfactoryLevelCardImage />}
      heading={t('heading')}
      contents={
        <Text>
          {t('description.part1')} {t('description.part2')}{' '}
          {t('description.part3')}
        </Text>
      }
      linkLabel={t('callToAction')}
      linkTo={AppRoutes.PublicGoodAndSatisfactoryLevelLanding}
    />
  );
};

const DiscontinuationInfo = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicHomePage.discontinuationInfo',
  });

  return (
    <Container className="public-homepage__info-box">
      <div className="rows gapped">
        <H2>{t('title')}</H2>
        <Text>{t('description')}</Text>
        <Text>
          <strong>{t('part1Bold')}</strong> {t('part1')}
        </Text>
        <Text>
          {t('part2')}{' '}
          <WebLink
            href={t('part2Link.url')}
            label={t('part2Link.label')}
            endIcon={<OpenInNewIcon />}
          />
        </Text>
      </div>
    </Container>
  );
};

export const PublicHomePage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicHomePage',
  });
  const { isPhone } = useWindowProperties();
  const { goodAndSatisfactoryLevel } = useAppSelector(featureFlagsSelector);

  return (
    <Box className="public-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-homepage__grid-container"
      >
        <Grid className="public-homepage__grid-container__item-header">
          <H1 data-testid="public-homepage__title-heading">{t('title')}</H1>
          <HeaderSeparator />
          <div className="rows gapped">
            <Text>
              {t('description.part1')}
              <br />
              {t('description.part2')}
            </Text>
            <Text>
              {t('description.part3')}
              <br />
              {t('description.part4')} {t('description.part5')}
            </Text>
            <Text>
              <WebLink
                href={t('description.readMore.url')}
                label={t('description.readMore.label')}
                endIcon={<OpenInNewIcon />}
              />
            </Text>
            <div
              className={`public-homepage__main-content rows ${
                isPhone ? 'gapped-xl' : 'gapped-xxl'
              }`}
            >
              <DiscontinuationInfo />
              <div className="rows gapped">
                <H2>{t('enrollment.heading')}</H2>
                <div className={`gapped-xxl ${isPhone ? 'rows' : 'columns'}`}>
                  <ExcellentLevelCard />
                  {goodAndSatisfactoryLevel && <GoodAndSatisfactoryLevelCard />}
                </div>
              </div>
            </div>
          </div>
        </Grid>
      </Grid>
    </Box>
  );
};
