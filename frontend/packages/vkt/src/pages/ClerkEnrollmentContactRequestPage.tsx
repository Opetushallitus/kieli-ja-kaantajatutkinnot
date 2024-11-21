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
import {
  APIResponseStatus,
  Color,
  Duration,
  Severity,
  Variant,
} from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';

import { TopControls } from 'components/clerkExamEvent/overview/TopControls';
import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PartialExamsAndSkills } from 'interfaces/common/enrollment';
import {
  createClerkEnrollmentAppointment,
  deleteClerkEnrollmentContactRequest,
  loadClerkEnrollmentContactRequest,
  resetClerkEnrollmentContactRequestToInitialState,
} from 'redux/reducers/clerkEnrollmentContactRequest';
import { resetExaminerDetailsToInitialState } from 'redux/reducers/examinerDetails';
import { clerkEnrollmentContactRequestSelector } from 'redux/selectors/clerkEnrollmentContactRequest';
import { EnrollmentUtils } from 'utils/enrollment';

export const ClerkEnrollmentContactRequestPage: FC = () => {
  const { status, deleteStatus, createStatus, enrollment } = useAppSelector(
    clerkEnrollmentContactRequestSelector,
  );
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkcontactRequest',
  });
  const translateCommon = useCommonTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const { showDialog } = useDialog();
  const { showToast } = useToast();

  const dispatch = useAppDispatch();

  useEffect(() => {
    if (deleteStatus === APIResponseStatus.Success && params.oid) {
      dispatch(resetExaminerDetailsToInitialState());
      navigate(AppRoutes.ExaminerHomePage.replace(':oid', params.oid));
      showToast({
        severity: Severity.Success,
        description: t('deleteContactRequestSuccess'),
        timeOut: Duration.Short,
      });
    }
  }, [dispatch, params.oid, deleteStatus, navigate, t, showToast]);

  // Cleanup on unmount
  useEffect(
    () => () => {
      dispatch(resetClerkEnrollmentContactRequestToInitialState());
    },
    [dispatch],
  );

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
  const isDeleteLoading = deleteStatus === APIResponseStatus.InProgress;
  const isSavingDisabled = isDeleteLoading || isLoading;

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

  const openDeleteDialog = () => {
    showDialog({
      title: t('deleteAreYouSure'),
      severity: Severity.Warning,
      description: t('deleteDescription'),
      actions: [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
        },
        {
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: () =>
            dispatch(
              deleteClerkEnrollmentContactRequest({
                id: enrollment.id,
                oid: params.oid || '',
              }),
            ),
        },
      ],
    });
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
            <H2>{t('contactDetails')}</H2>
            <div className="rows gapped">
              <H3>{t('wantFullExam')}</H3>
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
              <H3>{t('message')}</H3>
              <Text>{enrollment.message}</Text>
            </div>
            <div className="columns gapped-sm flex-end">
              <LoadingProgressIndicator isLoading={isDeleteLoading}>
                <CustomButton
                  data-testid="clerk-translator-overview__translator-details__save-btn"
                  variant={Variant.Outlined}
                  color={Color.Secondary}
                  disabled={isSavingDisabled}
                  onClick={openDeleteDialog}
                >
                  {t('deleteContactRequest')}
                </CustomButton>
              </LoadingProgressIndicator>
              <LoadingProgressIndicator isLoading={isLoading}>
                <CustomButton
                  data-testid="clerk-translator-overview__translator-details__save-btn"
                  variant={Variant.Contained}
                  color={Color.Secondary}
                  disabled={isSavingDisabled}
                  onClick={onSubmit}
                >
                  {t('createEnrollment')}
                </CustomButton>
              </LoadingProgressIndicator>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
