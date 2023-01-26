import { Add as AddIcon } from '@mui/icons-material';
import { Box, Paper } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CustomButton, CustomModal, H1, H2 } from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog, useToast } from 'shared/hooks';

import { AddQualification } from 'components/clerkInterpreter/add/AddQualification';
import { BottomControls } from 'components/clerkInterpreter/new/BottomControls';
import { ClerkNewInterpreterDetails } from 'components/clerkInterpreter/new/ClerkNewInterpreterDetails';
import { QualificationListing } from 'components/clerkInterpreter/overview/QualificationListing';
import { BackButton } from 'components/common/BackButton';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { Qualification } from 'interfaces/qualification';
import {
  initialiseClerkNewInterpreterByIdentityNumber,
  initialiseClerkNewInterpreterByPerson,
  resetClerkNewInterpreter,
  updateClerkNewInterpreter,
} from 'redux/reducers/clerkNewInterpreter';
import { loadMeetingDates } from 'redux/reducers/meetingDate';
import { clerkNewInterpreterSelector } from 'redux/selectors/clerkNewInterpreter';
import { clerkPersonSearchSelector } from 'redux/selectors/clerkPersonSearch';
import {
  meetingDatesSelector,
  selectMeetingDatesByMeetingStatus,
} from 'redux/selectors/meetingDate';

export const ClerkNewInterpreterPage = () => {
  const [open, setOpen] = useState(false);
  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  const { showToast } = useToast();
  const { showDialog } = useDialog();

  // i18n
  const { t } = useAppTranslation({
    keyPrefix: 'otr.pages.clerkNewInterpreterPage',
  });
  const translateCommon = useCommonTranslation();

  // Redux
  const { interpreter, status, id } = useAppSelector(
    clerkNewInterpreterSelector
  );
  const { identityNumber, person } = useAppSelector(clerkPersonSearchSelector);
  const meetingDatesState = useAppSelector(meetingDatesSelector).meetingDates;
  const passedMeetingDates = useAppSelector(
    selectMeetingDatesByMeetingStatus
  ).passed;

  useNavigationProtection(
    hasLocalChanges && status !== APIResponseStatus.Success
  );

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  // Initialise interpreter by clerkPersonSearch
  useEffect(() => {
    if (person) {
      dispatch(initialiseClerkNewInterpreterByPerson(person));
    } else if (identityNumber) {
      dispatch(initialiseClerkNewInterpreterByIdentityNumber(identityNumber));
    } else {
      navigate(AppRoutes.ClerkHomePage);
    }
  }, [dispatch, person, identityNumber, navigate]);

  useEffect(() => {
    if (
      !meetingDatesState.meetingDates.length &&
      meetingDatesState.status === APIResponseStatus.NotStarted
    ) {
      dispatch(loadMeetingDates());
    }
  }, [dispatch, meetingDatesState]);

  useEffect(() => {
    if (status === APIResponseStatus.Success) {
      showToast({
        severity: Severity.Success,
        description: t('toasts.success'),
      });
      navigate(
        AppRoutes.ClerkInterpreterOverviewPage.replace(
          /:interpreterId$/,
          `${id}`
        )
      );
    }
  }, [id, navigate, status, showToast, t]);

  useEffect(() => {
    return () => {
      dispatch(resetClerkNewInterpreter());
    };
  }, [dispatch]);

  const onQualificationAdd = (qualification: Qualification) => {
    setHasLocalChanges(true);
    dispatch(
      updateClerkNewInterpreter({
        ...interpreter,
        qualifications: [...interpreter.qualifications, qualification],
      })
    );
  };

  const onQualificationRemove = (qualification: Qualification) => {
    showDialog({
      title: t('removeQualificationDialog.title'),
      severity: Severity.Warning,
      description: '',
      actions: [
        {
          title: translateCommon('no'),
          variant: Variant.Outlined,
        },
        {
          dataTestId:
            'clerk-new-interpreter-page__dialog-confirm-remove-button',
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: () =>
            dispatch(
              updateClerkNewInterpreter({
                ...interpreter,
                qualifications: interpreter.qualifications.filter((q) => {
                  return q.tempId !== qualification.tempId;
                }),
              })
            ),
        },
      ],
    });
  };

  return (
    <Box className="clerk-new-interpreter-page">
      <H1>{t('title')}</H1>
      <Paper
        elevation={3}
        className="clerk-new-interpreter-page__content-container rows"
      >
        <div className="rows gapped">
          <BackButton to={AppRoutes.ClerkPersonSearchPage} />
          <ClerkNewInterpreterDetails
            interpreter={interpreter}
            onDetailsChange={() => setHasLocalChanges(true)}
          />
          <CustomModal
            data-testid="qualification-details__add-qualification-modal"
            open={open}
            onCloseModal={handleCloseModal}
            ariaLabelledBy="modal-title"
            modalTitle={translateCommon('addQualification')}
          >
            <AddQualification
              meetingDates={passedMeetingDates}
              isLoading={false}
              onQualificationAdd={onQualificationAdd}
              onCancel={handleCloseModal}
            />
          </CustomModal>
          <div className="columns margin-top-sm space-between">
            <H2>{t('addedQualificationsTitle')}</H2>
            <CustomButton
              data-testid="clerk-new-interpreter-page__add-qualification-button"
              variant={Variant.Contained}
              color={Color.Secondary}
              startIcon={<AddIcon />}
              onClick={handleOpenModal}
            >
              {translateCommon('addQualification')}
            </CustomButton>
          </div>
          {interpreter.qualifications.length > 0 && (
            <QualificationListing
              qualifications={interpreter.qualifications}
              permissionToPublishReadOnly={true}
              handleRemoveQualification={onQualificationRemove}
            />
          )}
          <BottomControls interpreter={interpreter} status={status} />
        </div>
      </Paper>
    </Box>
  );
};
