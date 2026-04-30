import {
  ArrowBackOutlined as ArrowBackIcon,
  ArrowForwardOutlined as ArrowForwardIcon,
} from '@mui/icons-material';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import {
  CustomButton,
  LoadingProgressIndicator,
  Text,
} from 'shared/components';
import { APIResponseStatus, Color, Severity, Variant } from 'shared/enums';
import { useDialog } from 'shared/hooks';
import { getErrors, StringUtils } from 'shared/utils';

import {
  contactDetailsStepEmailsMatch,
  contactDetailsStepFields,
} from 'components/publicEnrollmentContact/steps/FillContactDetails';
import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PublicEnrollmentContactFormStep } from 'enums/publicEnrollment';
import {
  PublicEnrollmentContact,
  PublicEnrollmentContactRequestDetails,
} from 'interfaces/publicEnrollment';
import { loadPublicEnrollmentSave } from 'redux/reducers/publicEnrollmentContact';
import { publicEnrollmentContactSelector } from 'redux/selectors/publicEnrollmentContact';
import { RouteUtils } from 'utils/routes';

export const PublicEnrollmentContactControlButtons = ({
  activeStep,
  enrollment,
  isStepValid,
  setShowValidation,
  submitStatus,
  examinerId,
}: {
  activeStep: PublicEnrollmentContactFormStep;
  enrollment: PublicEnrollmentContact;
  isStepValid: boolean;
  setShowValidation: (showValidation: boolean) => void;
  submitStatus: APIResponseStatus;
  examinerId: number;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollmentContact',
  });
  const translateCommon = useCommonTranslation();
  const [isSubmitLoading, setIsSubmitLoading] = useState(false);
  const { contactDetailsNeedConfirmation } = useAppSelector(
    publicEnrollmentContactSelector,
  );
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { showDialog } = useDialog();

  const handleCancelBtnClick = () => {
    showDialog({
      title: t('cancelDialog.title'),
      content: (
        <div className="rows gapped">
          <Text>{t('cancelDialog.description.part1')}</Text>
          <Text>{t('cancelDialog.description.part2')}</Text>
        </div>
      ),
      severity: Severity.Info,
      actions: [
        {
          title: t('cancelDialog.actions.cancelEnrollment'),
          variant: Variant.Outlined,
          action: () =>
            navigate(AppRoutes.PublicGoodAndSatisfactoryLevelLanding),
        },
        {
          title: t('cancelDialog.actions.continueEnrollment'),
          variant: Variant.Contained,
        },
      ],
      paperClassName: 'align-items-start',
    });
  };

  useEffect(() => {
    if (submitStatus === APIResponseStatus.Success) {
      navigate(
        RouteUtils.contactStepToRoute(
          PublicEnrollmentContactFormStep.Done,
          examinerId,
        ),
      );
    }
  }, [submitStatus, examinerId, navigate]);

  const handleBackBtnClick = () => {
    const nextStep: PublicEnrollmentContactFormStep = activeStep - 1;
    navigate(RouteUtils.contactStepToRoute(nextStep, examinerId));
  };

  const handleNextBtnClick = () => {
    if (isStepValid) {
      setShowValidation(false);
      const nextStep: PublicEnrollmentContactFormStep = activeStep + 1;
      navigate(RouteUtils.contactStepToRoute(nextStep, examinerId));
    } else {
      setShowValidation(true);
      const errors = getErrors<PublicEnrollmentContactRequestDetails>({
        fields: contactDetailsStepFields,
        values: enrollment,
        t,
        extraValidation: (errors, values, dirtyFields) =>
          contactDetailsStepEmailsMatch(t, errors, values, dirtyFields),
      });

      const dialogContent = (
        <div>
          <Text>{t('errors.fixErrors')}</Text>
          <ul>
            {Object.entries(errors)
              .filter(([_, val]) => val)
              .map(([field, _]) => (
                <Text key={field}>
                  <li>{t(`errors.fields.${field}`)}</li>
                </Text>
              ))}
          </ul>
        </div>
      );

      showDialog({
        title: t('errors.title'),
        severity: Severity.Error,
        content: dialogContent,
        actions: [
          { title: translateCommon('back'), variant: Variant.Contained },
        ],
      });
    }
  };

  const handleSubmitBtnClick = () => {
    if (isStepValid) {
      setIsSubmitLoading(true);
      setShowValidation(false);
      dispatch(loadPublicEnrollmentSave({ enrollment, examinerId }));
    } else {
      setShowValidation(true);

      if (enrollment.hasPreviousEnrollment !== true) {
        showDialog({
          title: t('errors.title'),
          severity: Severity.Error,
          content: <Text>{t('errors.messages.hasPreviousEnrollment')}</Text>,
          actions: [
            { title: translateCommon('back'), variant: Variant.Contained },
          ],
        });

        return;
      }

      const errors = {
        isFullExam: enrollment.isFullExam === undefined,
        partialExamSelection:
          enrollment.isFullExam === false &&
          (enrollment.partialExamSelection === undefined ||
            StringUtils.isBlankString(enrollment.partialExamSelection)),
        hasPreviousEnrollment: enrollment.hasPreviousEnrollment === undefined,
        message: StringUtils.isBlankString(enrollment.message),
      };

      const dialogContent = (
        <div>
          <Text>{t('errors.fixErrors')}</Text>
          <ul>
            {Object.entries(errors)
              .filter(([_, val]) => val)
              .map(([field, _]) => (
                <Text key={field}>
                  <li>{t(`errors.fields.${field}`)}</li>
                </Text>
              ))}
          </ul>
        </div>
      );

      showDialog({
        title: t('errors.title'),
        severity: Severity.Error,
        content: dialogContent,
        actions: [
          { title: translateCommon('back'), variant: Variant.Contained },
        ],
      });
    }
  };

  const CancelButton = () => (
    <>
      <CustomButton
        variant={Variant.Text}
        color={Color.Secondary}
        onClick={handleCancelBtnClick}
        data-testid="public-enrollment__controlButtons__cancel"
        disabled={isSubmitLoading}
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
        activeStep == PublicEnrollmentContactFormStep.FillContactDetails ||
        isSubmitLoading
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
      disabled={isSubmitLoading}
    >
      {translateCommon('next')}
    </CustomButton>
  );

  const SubmitButton = () => (
    <LoadingProgressIndicator
      translateCommon={translateCommon}
      isLoading={false}
    >
      <CustomButton
        variant={Variant.Contained}
        color={Color.Secondary}
        onClick={handleSubmitBtnClick}
        data-testid="public-enrollment__controlButtons__submit"
        disabled={isSubmitLoading}
      >
        {t('controlButtons.submit')}
      </CustomButton>
    </LoadingProgressIndicator>
  );

  if (
    activeStep === PublicEnrollmentContactFormStep.FillContactDetails &&
    contactDetailsNeedConfirmation
  ) {
    return (
      <div className="columns flex-start margin-top-lg">{CancelButton()}</div>
    );
  } else {
    const renderBack = true;
    const renderNext =
      activeStep === PublicEnrollmentContactFormStep.FillContactDetails;
    const renderSubmit =
      activeStep === PublicEnrollmentContactFormStep.SelectExam;

    return (
      <div className="columns flex-end gapped margin-top-lg">
        {CancelButton()}
        {renderBack && BackButton()}
        {renderNext && NextButton()}
        {renderSubmit && SubmitButton()}
      </div>
    );
  }
};
