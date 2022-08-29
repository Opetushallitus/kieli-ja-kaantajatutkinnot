import { Add as AddIcon } from '@mui/icons-material';
import { Box, Paper } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { CustomButton, CustomModal, H1, H2 } from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';

import { AddQualification } from 'components/clerkInterpreter/add/AddQualification';
import { ClerkNewInterpreterDetails } from 'components/clerkInterpreter/new/ClerkNewInterpreterDetails';
import { QualificationListing } from 'components/clerkInterpreter/overview/QualificationListing';
import { TopControls } from 'components/clerkInterpreter/overview/TopControls';
import { useAppTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { useNavigationProtection } from 'hooks/useNavigationProtection';
import { Qualification } from 'interfaces/qualification';
import {
  initialiseClerkNewInterpreterByIdentityNumber,
  initialiseClerkNewInterpreterByPerson,
  updateClerkNewInterpreter,
} from 'redux/reducers/clerkNewInterpreter';
import { loadMeetingDates } from 'redux/reducers/meetingDate';
import { showNotifierDialog } from 'redux/reducers/notifier';
import { clerkNewInterpreterSelector } from 'redux/selectors/clerkNewInterpreter';
import { clerkPersonSearchSelector } from 'redux/selectors/clerkPersonSearch';
import {
  meetingDatesSelector,
  selectMeetingDatesByMeetingStatus,
} from 'redux/selectors/meetingDate';
import { NotifierUtils } from 'utils/notifier';

export const ClerkNewInterpreterPage = () => {
  const [open, setOpen] = useState(false);
  const handleOpenModal = () => setOpen(true);
  const handleCloseModal = () => setOpen(false);
  const [hasLocalChanges, setHasLocalChanges] = useState(false);

  // i18n
  const { t } = useAppTranslation({
    keyPrefix: 'otr.pages.clerkNewInterpreterPage',
  });
  const translateCommon = useCommonTranslation();

  const navigate = useNavigate();

  // Redux
  const {
    interpreter,
    status,
    id: _id,
  } = useAppSelector(clerkNewInterpreterSelector);

  const { identityNumber, person } = useAppSelector(clerkPersonSearchSelector);

  const meetingDatesState = useAppSelector(meetingDatesSelector).meetingDates;
  const passedMeetingDates = useAppSelector(
    selectMeetingDatesByMeetingStatus
  ).passed;

  useNavigationProtection(
    hasLocalChanges && status !== APIResponseStatus.Success
  );

  const dispatch = useAppDispatch();

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
    const notifier = NotifierUtils.createNotifierDialog(
      t('removeQualificationDialog.title'),
      Severity.Info,
      '',
      [
        {
          title: translateCommon('no'),
          variant: Variant.Outlined,
          action: () => undefined,
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
      ]
    );

    dispatch(showNotifierDialog(notifier));
  };

  return (
    <Box className="clerk-new-interpreter-page">
      <H1>{t('title')}</H1>
      <Paper
        elevation={3}
        className="clerk-new-interpreter-page__content-container rows"
      >
        <div className="rows gapped">
          <TopControls />
          <ClerkNewInterpreterDetails
            interpreter={interpreter}
            isIndividualisedInterpreter={person?.isIndividualised}
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
          {interpreter.qualifications.length ? (
            <QualificationListing
              qualifications={interpreter.qualifications}
              permissionToPublishReadOnly={true}
              handleRemoveQualification={onQualificationRemove}
            />
          ) : null}
        </div>
      </Paper>
    </Box>
  );
};
