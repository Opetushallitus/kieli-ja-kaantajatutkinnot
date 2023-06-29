import { useNavigate } from 'react-router';
import { CustomButton, Text } from 'shared/components';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { resetPublicEnrollment } from 'redux/reducers/publicEnrollment';
import { resetPublicExamEventSelections } from 'redux/reducers/publicExamEvent';

export const PaymentSuccess = ({
  enrollment,
}: {
  enrollment: PublicEnrollment;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.paymentSuccess',
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
      <Text>{`${t('description')}: ${enrollment.email}`}</Text>
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
