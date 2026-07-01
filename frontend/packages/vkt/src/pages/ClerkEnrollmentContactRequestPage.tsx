import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import { Box, Divider, Grid, Paper } from '@mui/material';
import { FC, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Link } from 'react-router-dom';
import {
  ComboBox,
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
  TextFieldVariant,
  Variant,
} from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';

import { TopControls } from 'components/clerkExamEvent/overview/TopControls';
import { useCommonTranslation, useExaminerTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { APIEndpoints } from 'enums/api';
import { AppRoutes } from 'enums/app';
import { useExamEventDescription } from 'hooks/useExamEventDescription';
import { ExaminerExamEvent } from 'interfaces/examinerExamEvent';
import {
  createClerkEnrollmentAppointment,
  deleteClerkEnrollmentContactRequest,
  loadClerkEnrollmentContactRequest,
  loadExaminerExamEvents,
  resetClerkEnrollmentContactRequestToInitialState,
} from 'redux/reducers/clerkEnrollmentContactRequest';
import { resetExaminerDetailsToInitialState } from 'redux/reducers/examinerDetails';
import { clerkEnrollmentContactRequestSelector } from 'redux/selectors/clerkEnrollmentContactRequest';

export const ClerkEnrollmentContactRequestPage: FC = () => {
  const {
    status,
    examEventsStatus,
    examEvents,
    deleteStatus,
    createStatus,
    enrollment,
  } = useAppSelector(clerkEnrollmentContactRequestSelector);
  const { t } = useExaminerTranslation({
    keyPrefix: 'vkt.component.examinerContactRequest',
  });
  const translateCommon = useCommonTranslation();
  const params = useParams();
  const navigate = useNavigate();
  const { showDialog } = useDialog();
  const { showToast } = useToast();
  const describeExamEvent = useExamEventDescription();

  const [newExamEvent, setNewExamEvent] = useState<
    ExaminerExamEvent | undefined
  >();

  const dispatch = useAppDispatch();
  const backTo = AppRoutes.ExaminerHomePage.replace(':oid', params.oid || '');

  useEffect(() => {
    if (examEventsStatus === APIResponseStatus.NotStarted && params.oid) {
      dispatch(loadExaminerExamEvents(params.oid));
    }
  }, [dispatch, examEventsStatus, params.oid]);

  useEffect(() => {
    if (deleteStatus === APIResponseStatus.Success && params.oid) {
      dispatch(resetExaminerDetailsToInitialState());
      navigate(backTo);
      showToast({
        severity: Severity.Success,
        description: t('deleteContactRequestSuccess'),
        timeOut: Duration.Short,
      });
    }
  }, [dispatch, params.oid, deleteStatus, navigate, t, backTo, showToast]);

  // Clean up on unmount
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

  const onSubmit = () => {
    if (params.oid && newExamEvent?.id) {
      dispatch(
        createClerkEnrollmentAppointment({
          id: enrollment.id,
          oid: params.oid,
          examEvent: newExamEvent.id,
        }),
      );
    }
  };

  const handleExamEventChange = (examEvent: string | undefined) => {
    if (examEvent) {
      const foundExamEvent = examEvents.find((e) => e.id === +examEvent);

      if (foundExamEvent) {
        setNewExamEvent(foundExamEvent);
      }
    }
  };

  const examEventToOption = (examEvent: ExaminerExamEvent) => ({
    value: examEvent.id.toString(),
    label: describeExamEvent(examEvent),
  });

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

  return (
    <Box className="examiner-contact-request-page">
      <Grid
        container
        rowSpacing={4}
        direction="column"
        className="examiner-contact-request-page__grid-container"
      >
        <div>
          <TopControls backTo={backTo} />
        </div>
        <Grid>
          <H1>{t('contactRequest')}</H1>
        </Grid>
        <Grid>
          <Paper
            elevation={3}
            className="examiner-contact-request-page__paper rows gapped-xxl"
          >
            <div className="rows gapped">
              <H2>{t('contactFields')}</H2>
              <div className="grid-columns gapped">
                <div className="rows gapped-xxs">
                  <H3>{t('lastName')}:</H3>
                  <Text>{enrollment.lastName}</Text>
                </div>
                <div className="rows gapped-xxs">
                  <H3>{t('firstName')}:</H3>
                  <Text>{enrollment.firstName}</Text>
                </div>
                <div className="rows gapped-xxs">
                  <H3>{t('email')}:</H3>
                  <Text>{enrollment.email}</Text>
                </div>
                <div className="rows gapped-xxs">
                  <H3>{t('phoneNumber')}:</H3>
                  <Text>{enrollment.phoneNumber}</Text>
                </div>
              </div>
            </div>
            <Divider />
            <div className="rows gapped">
              <H2>{t('contactDetails')}</H2>
              <div className="rows gapped-xxs">
                <H3>{t('wantFullExam')}:</H3>
                <Text>
                  {enrollment.isFullExam
                    ? translateCommon('yes')
                    : translateCommon('no')}
                </Text>
              </div>
              {!enrollment.isFullExam && (
                <div className="rows gapped-xxs">
                  <H3>{t('partialExams')}:</H3>
                  <Text>{enrollment.partialExamSelection}</Text>
                </div>
              )}
              <div className="rows gapped-xxs">
                <H3>{t('previousExams')}:</H3>
                <Text>
                  {enrollment.hasPreviousEnrollment
                    ? translateCommon('yes')
                    : translateCommon('no')}
                </Text>
              </div>
              {enrollment.attachments && enrollment.attachments.length > 0 && (
                <div className="rows gapped-xxs">
                  <H3>{t('previousExamDecision')}:</H3>
                  <ul className="public-enrollment__grid__preview__bullet-list">
                    {enrollment.attachments.map((attachment) => (
                      <Text key={attachment.id}>
                        <li>
                          <Link
                            className="columns gapped-xxs"
                            to={`${APIEndpoints.ExaminerEnrollmentAttachment.replace(
                              ':oid',
                              params.oid ?? '',
                            ).replace(
                              ':enrollmentAppointmentId',
                              String(enrollment.id),
                            )}?key=${attachment.id}`}
                            target="_blank"
                          >
                            {attachment.name}
                            <OpenInNewIcon fontSize="small" />
                          </Link>
                        </li>
                      </Text>
                    ))}
                  </ul>
                </div>
              )}
              <div className="rows gapped-xxs">
                <H3>{t('message')}:</H3>
                <Text>{enrollment.message}</Text>
              </div>
            </div>
            <Divider />
            <div className="rows gapped-sm flex-end">
              <H2 className="margin-bottom-lg">{t('chooseExamAndCreate')}</H2>
              <H3>{t('chooseExam')}</H3>
              <Text>{t('selectExamHelp')}</Text>
              <div className="half-max-width">
                <ComboBox
                  autoHighlight
                  label={t('examination')}
                  values={[...examEvents]
                    .map(examEventToOption)
                    .sort((a, b) => a.label.localeCompare(b.label))}
                  value={newExamEvent ? examEventToOption(newExamEvent) : null}
                  variant={TextFieldVariant.Outlined}
                  onChange={handleExamEventChange}
                />
              </div>
              <LoadingProgressIndicator isLoading={isLoading}>
                <CustomButton
                  variant={Variant.Contained}
                  color={Color.Secondary}
                  disabled={!newExamEvent || isSavingDisabled}
                  onClick={onSubmit}
                >
                  {t('createEnrollment')}
                </CustomButton>
              </LoadingProgressIndicator>
            </div>
            <div className="columns gapped-sm flex-end">
              <LoadingProgressIndicator isLoading={isDeleteLoading}>
                <CustomButton
                  variant={Variant.Outlined}
                  color={Color.Secondary}
                  disabled={isSavingDisabled}
                  onClick={openDeleteDialog}
                >
                  {t('deleteContactRequest')}
                </CustomButton>
              </LoadingProgressIndicator>
            </div>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};
