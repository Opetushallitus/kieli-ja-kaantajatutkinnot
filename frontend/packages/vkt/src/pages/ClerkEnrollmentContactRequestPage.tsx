import { Box, Divider, Grid, Paper } from '@mui/material';
import { FC, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import {
  CustomButton,
  H1,
  H2,
  H3,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { TopControls } from 'components/clerkExamEvent/overview/TopControls';
import { useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PartialExamsAndSkills } from 'interfaces/common/enrollment';
import {
  createClerkEnrollmentAppointment,
  loadClerkEnrollmentContactRequest,
  resetClerkEnrollmentContactRequestToInitialState,
} from 'redux/reducers/clerkEnrollmentContactRequest';
import { clerkEnrollmentContactRequestSelector } from 'redux/selectors/clerkEnrollmentContactRequest';
import { EnrollmentUtils } from 'utils/enrollment';

export const ClerkEnrollmentContactRequestPage: FC = () => {
  const { status, createStatus, enrollment } = useAppSelector(
    clerkEnrollmentContactRequestSelector,
  );
  const translateCommon = useCommonTranslation();
  const params = useParams();
  const navigate = useNavigate();

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (
      enrollment?.id &&
      params.enrollmentContactRequestId &&
      +params.enrollmentContactRequestId !== enrollment?.id
    ) {
      dispatch(resetClerkEnrollmentContactRequestToInitialState());
    }
  }, [dispatch, params.enrollmentContactRequestId, enrollment?.id]);

  useEffect(() => {
    if (
      status === APIResponseStatus.NotStarted &&
      params.enrollmentContactRequestId &&
      params.oid
    ) {
      dispatch(
        loadClerkEnrollmentContactRequest({
          id: +params.enrollmentContactRequestId,
          oid: params.oid,
        }),
      );
    }
  }, [dispatch, status, params.enrollmentContactRequestId, params.oid]);

  useEffect(() => {
    if (
      createStatus === APIResponseStatus.Success &&
      params.enrollmentContactRequestId &&
      params.oid
    ) {
      navigate(
        AppRoutes.ExaminerEnrollmentAppointmentPage.replace(
          ':oid',
          params.oid,
        ).replace(
          ':enrollmentAppointmentId',
          params.enrollmentContactRequestId,
        ),
      );
    }
  }, [
    dispatch,
    navigate,
    params.oid,
    params.enrollmentContactRequestId,
    createStatus,
  ]);

  const isLoading = status === APIResponseStatus.InProgress;
  const isSavingDisabled = isLoading;

  if (!enrollment) {
    return <></>;
  }

  const partialExamsToText = (skills: PartialExamsAndSkills) => {
    return [
      skills.writingPartialExam
        ? translateCommon('enrollment.partialExamsAndSkills.writingPartialExam')
        : false,
      skills.readingComprehensionPartialExam
        ? translateCommon(
            'enrollment.partialExamsAndSkills.readingComprehensionPartialExam',
          )
        : false,
      skills.speakingPartialExam
        ? translateCommon(
            'enrollment.partialExamsAndSkills.speakingPartialExam',
          )
        : false,
      skills.speechComprehensionPartialExam
        ? translateCommon(
            'enrollment.partialExamsAndSkills.speechComprehensionPartialExam',
          )
        : false,
    ]
      .filter((skill) => skill)
      .join(', ');
  };

  const onSubmit = () => {
    dispatch(
      createClerkEnrollmentAppointment({
        id: enrollment.id,
        oid: params.oid || '',
      }),
    );
  };
  const backTo = AppRoutes.ExaminerHomePage.replace(':oid', params.oid || '');

  return (
    <Box className="clerk-homepage">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="clerk-homepage__grid-container"
      >
        <div>
          <TopControls backTo={backTo} />
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
              <div className="rows gapped">
                <H3>Puhelinnumero</H3>
                <Text>{enrollment.phoneNumber}</Text>
              </div>
            </div>
            <Divider />
            <H2>Yhteydenoton tiedot</H2>
            <div className="rows gapped">
              <H3>Haluan suorittaa koko tutkinnon?</H3>
              <Text>
                {EnrollmentUtils.isFullExam(enrollment)
                  ? translateCommon('yes')
                  : translateCommon('no')}
              </Text>
            </div>
            <div className="rows gapped">
              <H3>Osakokeet, jotka haluan suorittaa</H3>
              <Text>{partialExamsToText(enrollment)}</Text>
            </div>
            <div className="rows gapped">
              <H3>Osallistunut aiempiin tutkintoihin?</H3>
              <Text>
                {enrollment.previousEnrollment
                  ? translateCommon('yes')
                  : translateCommon('no')}
              </Text>
            </div>
            <div className="rows gapped">
              <H3>Viesti</H3>
              <Text>{enrollment.message}</Text>
            </div>
            <div className="columns flex-end">
              <LoadingProgressIndicator isLoading={isLoading}>
                <CustomButton
                  data-testid="clerk-translator-overview__translator-details__save-btn"
                  variant={Variant.Contained}
                  color={Color.Secondary}
                  disabled={isSavingDisabled}
                  onClick={onSubmit}
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
