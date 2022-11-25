import { ArrowBackIosOutlined as ArrowBackIosOutlinedIcon } from '@mui/icons-material';
import { Box, Grid, Paper } from '@mui/material';
import { FC, useEffect } from 'react';
import { ComboBox, CustomButtonLink, H1, H3 } from 'shared/components';
import { APIResponseStatus, TextFieldVariant, Variant } from 'shared/enums';

import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { loadExamEvents } from 'redux/reducers/clerkListExamEvent';
import { clerkListExamEventsSelector } from 'redux/selectors/clerkListExamEvent';

const BackButton = () => {
  const translateCommon = useCommonTranslation();

  return (
    <CustomButtonLink
      to={AppRoutes.PublicHomePage}
      variant={Variant.Text}
      startIcon={<ArrowBackIosOutlinedIcon />}
      className="color-secondary-dark"
    >
      {translateCommon('back')}
    </CustomButtonLink>
  );
};

export const ClerkExamCreateEventPage: FC = () => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkExamEventListing',
  });
  const dispatch = useAppDispatch();
  const { status } = useAppSelector(clerkListExamEventsSelector);

  const onComboBoxChange = () => {
    return '';
  };

  useEffect(() => {
    if (status === APIResponseStatus.NotStarted) {
      dispatch(loadExamEvents());
    }
  }, [dispatch, status]);

  return (
    <Box className="clerk-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="clerk-homepage__grid-container"
      >
        <Grid item>
          <H1>Hello World!</H1>
        </Grid>
        <Grid item>
          <Paper elevation={3} className="clerk-homepage__exam-events">
            <div>
              <BackButton />
            </div>
            <div className="columns align-items-start gapped">
              <div className="rows">
                <H3>{t('header.address')}</H3>
                <ComboBox
                  data-testid="clerk-exam__event-information__lang-and-level"
                  autoHighlight
                  disabled={false}
                  label={t('fields.country')}
                  variant={TextFieldVariant.Outlined}
                  values={[]}
                  value={''}
                  onChange={onComboBoxChange('country')}
                />
              </div>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
