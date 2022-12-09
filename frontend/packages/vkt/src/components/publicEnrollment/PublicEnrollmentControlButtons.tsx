import {
  ArrowBackOutlined as ArrowBackIcon,
  ArrowForwardOutlined as ArrowForwardIcon,
} from '@mui/icons-material';
import { CustomButton } from 'shared/components';
import { Color, Severity, Variant } from 'shared/enums';
import { useDialog } from 'shared/hooks';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { PublicEnrollmentFormStep } from 'enums/publicEnrollment';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import {
  cancelPublicEnrollment,
  cancelPublicEnrollmentAndRemoveReservation,
  decreaseActiveStep,
  increaseActiveStep,
  loadPublicEnrollmentSave,
} from 'redux/reducers/publicEnrollment';
import { publicReservationSelector } from 'redux/selectors/publicReservation';

export const PublicEnrollmentControlButtons = ({
  activeStep,
  enrollment,
  isLoading,
  disableNext,
}: {
  activeStep: PublicEnrollmentFormStep;
  enrollment: PublicEnrollment;
  isLoading: boolean;
  disableNext: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.controlButtons',
  });
  const translateCommon = useCommonTranslation();

  const { reservation } = useAppSelector(publicReservationSelector);
  const dispatch = useAppDispatch();

  const { showDialog } = useDialog();

  const handleCancelBtnClick = () => {
    if (activeStep === PublicEnrollmentFormStep.Identify || !reservation) {
      dispatch(cancelPublicEnrollment());
    } else {
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
            action: () =>
              dispatch(
                cancelPublicEnrollmentAndRemoveReservation(reservation.id)
              ),
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
    if (reservation) {
      dispatch(
        loadPublicEnrollmentSave({
          ...enrollment,
          reservationId: reservation.id,
        })
      );
    }
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
      {t('pay')}
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
