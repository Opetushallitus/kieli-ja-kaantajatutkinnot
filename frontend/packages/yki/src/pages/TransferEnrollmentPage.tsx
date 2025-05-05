import InfoOutlineIcon from '@mui/icons-material/InfoOutlined';
import { Container, Grid } from '@mui/material';
import { Box } from '@mui/system';
import { H1, H2, HeaderSeparator, Text } from 'shared/components';
import { Color } from 'shared/enums';

import { usePublicTranslation } from 'configs/i18n';

const Header = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.transferEnrollmentPage',
  });

  return (
    <Grid
      item
      className="transfer-enrollment-page__grid-container__item-header"
    >
      <H1>{t('title')}</H1>
      <HeaderSeparator />
      <Text>{t('introduction.info')}</Text>
      <ul>
        <Text>
          <li>{t('introduction.criteria.item1')}</li>
          <li>{t('introduction.criteria.item2')}</li>
        </Text>
      </ul>
    </Grid>
  );
};

const CurrentEnrollmentDetails = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.transferEnrollmentPage.currentEnrollmentDetails',
  });

  return (
    <Grid
      item
      className="transfer-enrollment-page__grid-container__item-header"
    >
      <H2>{t('heading')}</H2>
    </Grid>
  );
};

const SelectNewExamDate = () => {
  const { t } = usePublicTranslation({
    keyPrefix: 'yki.pages.transferEnrollmentPage.selectNewExamDate',
  });

  return (
    <Grid
      item
      className="transfer-enrollment-page__grid-container__item-header"
    >
      <div className="rows gapped">
        <H2>{t('heading')}</H2>
        <Container className="transfer-enrollment-page__info-box">
          <div className="columns gapped-sm">
            <InfoOutlineIcon color={Color.Secondary} />
            <Text>{t('noCandidatesFound')}</Text>
          </div>
        </Container>
      </div>
    </Grid>
  );
};

export const TransferEnrollmentPage = () => {
  return (
    <Box className="transfer-enrollment-page">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="transfer-enrollment-page__grid-container"
      >
        <Header />
        <CurrentEnrollmentDetails />
        <SelectNewExamDate />
      </Grid>
    </Box>
  );
};
