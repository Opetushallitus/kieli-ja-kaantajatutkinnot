import { Box, Grid, Paper, Typography } from '@mui/material';
import { FC } from 'react';
import { Link } from 'react-router-dom';
import { H1, H2, H3, HeaderSeparator, Text, WebLink } from 'shared/components';

import { usePublicTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';

const ExcellentLevelCard = () => {
  return (
    <Paper className="public-homepage__level-description-card" elevation={2}>
      <div className="rows gapped">
        <H3>Erinomaisen taidon tutkinnot</H3>
        <Text>Tekstiä.</Text>
        <Text>
          Toinen kappale. Hieman pituuttakin tälle paragraaaaaafffille.
        </Text>
        <Text>
          Katso lisätietoja OPH:n verkkosivuilla:{' '}
          <WebLink
            href="https://www.oph.fi/fi/koulutus-ja-tutkinnot/erinomaisen-taidon-tutkinnot"
            label="Erinomaisen taidon tutkinnot
 (oph.fi)"
          />
        </Text>
        <Text>
          Siirry{' '}
          <Link to={AppRoutes.PublicExcellentLevelLanding}>
            erinomaisen taidon tutkintojen sivulle.
          </Link>
        </Text>
      </div>
    </Paper>
  );
};

const GoodAndSatisfactoryLevelCard = () => {
  return (
    <Paper className="public-homepage__level-description-card" elevation={2}>
      <div className="rows gapped">
        <H3>Hyvän ja tyydyttävän taidon tutkinnot</H3>
        <Text>
          Yhdellä kokeella voit osoittaa tuloksesta riippuen hyvää tai
          tyydyttävää taitoa.
        </Text>
        <Typography component="p" variant="h3">
          Toinen kappale tekstiä. Käytetään h3-tyyliä, mutta ilman vastaavaa
          DOM-elementtiä.
        </Typography>
        <Text>
          Katso lisätietoja OPH:n verkkosivuilla:{' '}
          <WebLink
            href="https://www.oph.fi/fi/koulutus-ja-tutkinnot/hyvan-ja-tyydyttavan-taidon-tutkinnot"
            label="Hyvän ja tyydyttävän taidon tutkinnot (oph.fi)"
          />
        </Text>
        <Text>
          Siirry{' '}
          <Link to={AppRoutes.PublicGoodAndSatisfactoryLevelLanding}>
            hyvän ja tyydyttävän taidon tutkintojen sivulle.
          </Link>
        </Text>
      </div>
    </Paper>
  );
};

export const PublicHomePage: FC = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicHomePage',
  });

  return (
    <Box className="public-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="public-homepage__grid-container"
      >
        <Grid item className="public-homepage__grid-container__item-header">
          <H1 data-testid="public-homepage__title-heading">{t('title')}</H1>
          <HeaderSeparator />
          <div className="rows gapped">
            <Text>
              {t('description.part1')}
              <br />
              {t('description.part2')}
            </Text>
            <H2>{t('selectExamination.heading')}</H2>
            <Text>{t('selectExamination.description')}</Text>
            <div className="public-homepage__cards columns gapped">
              <ExcellentLevelCard />
              <GoodAndSatisfactoryLevelCard />
            </div>
          </div>
        </Grid>
      </Grid>
    </Box>
  );
};
