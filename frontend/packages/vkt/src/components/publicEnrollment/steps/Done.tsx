import { useNavigate } from 'react-router';
import { CustomButton, Text } from 'shared/components';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { resetPublicEnrollment } from 'redux/reducers/publicEnrollment';
import { resetPublicExamEventSelections } from 'redux/reducers/publicExamEvent';

export const Done = ({
  enrollment,
  isEnrollmentToQueue,
}: {
  enrollment: PublicEnrollment;
  isEnrollmentToQueue: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.done',
  });
  const translateCommon = useCommonTranslation();

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const resetAndRedirect = () => {
    dispatch(resetPublicExamEventSelections());
    dispatch(resetPublicEnrollment());
    navigate(AppRoutes.PublicHomePage);
  };

  return (
    <div className="margin-top-lg rows gapped">
      <Text>{`${t('description.confirmationEmail')}: ${
        enrollment.email
      }`}</Text>
      {isEnrollmentToQueue && <Text>{t('description.queueInfo')}</Text>}
      <CustomButton
        className="align-self-start margin-top-lg"
        color="secondary"
        variant="contained"
        onClick={resetAndRedirect}
      >
        {translateCommon('backToHomePage')}
      </CustomButton>
    </div>
  );
};
