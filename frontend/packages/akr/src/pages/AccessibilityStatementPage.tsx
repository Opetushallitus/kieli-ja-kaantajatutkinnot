import { ArrowBackIosOutlined as ArrowBackIosOutlinedIcon } from '@mui/icons-material';
import { Grid, Paper } from '@mui/material';
import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  AccessibilityStatementContent,
  CustomButtonLink,
  H1,
  HeaderSeparator,
  Text,
} from 'shared/components';
import { Variant } from 'shared/enums';
import { CommonUtils } from 'shared/utils';

import {
  useAccessibilityTranslation,
  useCommonTranslation,
} from 'configs/i18n';
import { AppRoutes } from 'enums/app';
import accessibilityFI from 'public/i18n/fi-FI/accessibility.json';

const BackButton = () => {
  const translateCommon = useCommonTranslation();

  return (
    <CustomButtonLink
      to={AppRoutes.PublicHomePage}
      variant={Variant.Text}
      startIcon={<ArrowBackIosOutlinedIcon />}
      className="color-secondary-dark"
    >
      {translateCommon('backToHomePage')}
    </CustomButtonLink>
  );
};

export const AccessibilityStatementPage = () => {
  const translateAccessibility = useAccessibilityTranslation();
  const translateCommon = useCommonTranslation();
  const { pathname } = useLocation();

  const caveats = Object.keys(
    accessibilityFI.akr.accessibility.content.caveats.items,
  );
  const feedbackEmail = translateCommon('contactEmail');

  useEffect(() => {
    CommonUtils.scrollToTop();
  }, [pathname]);

  return (
    <Grid
      className="accessibility-statement-page"
      container
      rowSpacing={4}
      direction="column"
    >
      <Grid item className="accessibility-statement-page__back-button">
        <BackButton />
      </Grid>
      <Grid item className="accessibility-statement-page__heading">
        <H1>{translateAccessibility('heading.title')}</H1>
        <HeaderSeparator />
        <Text>{translateAccessibility('heading.description')}</Text>
      </Grid>
      <Grid item>
        <Paper className="accessibility-statement-page__content" elevation={3}>
          <AccessibilityStatementContent
            caveats={caveats}
            feedbackEmail={feedbackEmail}
            translateAccessibility={translateAccessibility}
          />
        </Paper>
      </Grid>
    </Grid>
  );
};
