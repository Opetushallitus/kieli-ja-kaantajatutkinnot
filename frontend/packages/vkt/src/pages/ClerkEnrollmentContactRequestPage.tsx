import { ArrowBackIosOutlined as ArrowBackIosOutlinedIcon } from '@mui/icons-material';
import { Box, Divider, Grid, Paper } from '@mui/material';
import { FC, useEffect } from 'react';
import { useParams } from 'react-router';
import {
  CustomButton,
  CustomButtonLink,
  H1,
  H2,
  H3,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { loadClerkEnrollmentContactRequest } from 'redux/reducers/clerkEnrollmentContactRequest';
import { clerkEnrollmentContactRequestSelector } from 'redux/selectors/clerkEnrollmentContactRequest';

const BackButton = () => {
  const translateCommon = useCommonTranslation();

  return (
    <CustomButtonLink
      to={AppRoutes.ClerkHomePage}
      variant={Variant.Text}
      startIcon={<ArrowBackIosOutlinedIcon />}
      className="color-secondary-dark"
      data-testid="clerk-create-exam__back-btn"
    >
      {translateCommon('back')}
    </CustomButtonLink>
  );
};

export const ClerkEnrollmentContactRequestPage: FC = () => {
  const { status, enrollment } = useAppSelector(
    clerkEnrollmentContactRequestSelector,
  );
  const translateCommon = useCommonTranslation();
  const params = useParams();

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (
      status === APIResponseStatus.NotStarted &&
      params.enrollmentContactRequestId
    ) {
      dispatch(
        loadClerkEnrollmentContactRequest(+params.enrollmentContactRequestId),
      );
    }
  }, [dispatch, status, params.enrollmentContactRequestId]);

  const isLoading = status === APIResponseStatus.InProgress;
  const isSavingDisabled = isLoading;

  if (!enrollment) {
    return <></>;
  }

  return (
    <Box className="clerk-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="clerk-homepage__grid-container"
      >
        <div>
          <BackButton />
        </div>
        <Grid item>
          <H1>Yhteydenottopyyntö</H1>
        </Grid>
        <Grid item>
          <Paper
            elevation={3}
            className="clerk-homepage__exam-events clerk-homepage-create-exam-events"
          >
            <H2>Yhteystiedot</H2>
            <div className="grid-columns gapped">
              <div className="rows gapped">
                <H3>Sukunimi</H3>
                <Text>{enrollment.lastName}</Text>
              </div>
              <div className="rows gapped">
                <H3>Etunimi</H3>
                <Text>{enrollment.firstName}</Text>
              </div>
              <div className="rows gapped">
                <H3>Sähköpostiosoite</H3>
                <Text>{enrollment.email}</Text>
              </div>
            </div>
            <Divider />
            <H2>Yhteydenoton tiedot</H2>
            <div className="rows gapped">
              <H3>Haluan suorittaa koko tutkinnon?</H3>
              <Text>Ei</Text>
            </div>
            <div className="rows gapped">
              <H3>Osakokeet, jotka haluan suorittaa</H3>
              <Text>Ei</Text>
            </div>
            <div className="rows gapped">
              <H3>Osallistunut aiempiin tutkintoihin?</H3>
              <Text>Ei</Text>
            </div>
            <div className="rows gapped">
              <H3>Viesti</H3>
              <Text>Ei</Text>
            </div>
            <div className="columns flex-end">
              <LoadingProgressIndicator isLoading={isLoading}>
                <CustomButton
                  data-testid="clerk-translator-overview__translator-details__save-btn"
                  variant={Variant.Contained}
                  color={Color.Secondary}
                  disabled={isSavingDisabled}
                >
                  {translateCommon('save')}
                </CustomButton>
              </LoadingProgressIndicator>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
