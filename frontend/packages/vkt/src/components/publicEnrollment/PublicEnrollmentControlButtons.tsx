import {
  ArrowBackOutlined as ArrowBackIcon,
  ArrowForwardOutlined as ArrowForwardIcon,
} from '@mui/icons-material';
import { CustomButton } from 'shared/components';
import { Color, Severity, Variant } from 'shared/enums';
import { useDialog } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import {
  PublicEnrollment,
  PublicReservationDetails,
} from 'interfaces/publicEnrollment';
import {
  cancelPublicEnrollment,
  cancelPublicEnrollmentAndRemoveReservation,
  decreaseActiveStep,
  increaseActiveStep,
  loadPublicEnrollmentSave,
} from 'redux/reducers/publicEnrollment';

export const PublicEnrollmentControlButtons = ({
  activeStep,
  enrollment,
  reservationDetails,
  isLoading,
  disableNext,
}: {
  activeStep: PublicEnrollmentFormStep;
  enrollment: PublicEnrollment;
  reservationDetails: PublicReservationDetails;
  isLoading: boolean;
  disableNext: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.controlButtons',
  });
  const translateCommon = useCommonTranslation();

  const dispatch = useAppDispatch();

  const { showDialog } = useDialog();

  const handleCancelBtnClick = () => {
    if (activeStep === PublicEnrollmentFormStep.Identify) {
      dispatch(cancelPublicEnrollment());
    } else {
      const reservationId = reservationDetails.reservation?.id;
      const confirmAction = reservationId
        ? cancelPublicEnrollmentAndRemoveReservation(reservationId)
        : cancelPublicEnrollment();

      showDialog({
        title: t('cancelDialog.title'),
        severity: Severity.Info,
        description: t('cancelDialog.description'),
        actions: [
          {
            title: translateCommon('back'),
            variant: Variant.Outlined,
          },
          {
            title: translateCommon('yes'),
            variant: Variant.Contained,
            action: () => dispatch(confirmAction),
          },
        ],
      });
    }
  };

  const handleBackBtnClick = () => {
    dispatch(decreaseActiveStep());
  };

  const handleNextBtnClick = () => {
    dispatch(increaseActiveStep());
  };

  const handleSubmitBtnClick = () => {
    dispatch(
      loadPublicEnrollmentSave({
        enrollment,
        reservationDetails,
      })
    );
  };

  const CancelButton = () => (
    <>
      <CustomButton
        variant={Variant.Text}
        color={Color.Secondary}
        onClick={handleCancelBtnClick}
        data-testid="public-enrollment__controlButtons__cancel"
        disabled={isLoading}
      >
        {translateCommon('cancel')}
      </CustomButton>
    </>
  );

  const BackButton = () => (
    <CustomButton
      variant={Variant.Outlined}
      color={Color.Secondary}
      onClick={handleBackBtnClick}
      data-testid="public-enrollment__controlButtons__back"
      startIcon={<ArrowBackIcon />}
      disabled={
        activeStep == PublicEnrollmentFormStep.FillContactDetails || isLoading
      }
    >
      {translateCommon('back')}
    </CustomButton>
  );

  const NextButton = () => (
    <CustomButton
      variant={Variant.Contained}
      color={Color.Secondary}
      onClick={handleNextBtnClick}
      data-testid="public-enrollment__controlButtons__next"
      endIcon={<ArrowForwardIcon />}
      disabled={disableNext || isLoading}
    >
      {translateCommon('next')}
    </CustomButton>
  );

  const SubmitButton = () => (
    <CustomButton
      variant={Variant.Contained}
      color={Color.Secondary}
      onClick={handleSubmitBtnClick}
      data-testid="public-enrollment__controlButtons__submit"
      endIcon={<ArrowForwardIcon />}
      disabled={disableNext || isLoading}
    >
      {reservationDetails.reservation ? t('pay') : t('sendForm')}
    </CustomButton>
  );

  const renderBack = activeStep !== PublicEnrollmentFormStep.Identify;

  const renderNext = [
    PublicEnrollmentFormStep.FillContactDetails,
    PublicEnrollmentFormStep.SelectExam,
  ].includes(activeStep);

  const renderSubmit = activeStep === PublicEnrollmentFormStep.Preview;

  return (
    <div className="columns flex-end gapped margin-top-lg">
      {CancelButton()}
      {renderBack && BackButton()}
      {renderNext && NextButton()}
      {renderSubmit && SubmitButton()}
    </div>
  );
};
