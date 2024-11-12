import { useNavigate } from 'react-router';
import { CustomButton, Text } from 'shared/components';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { PublicEnrollmentContact } from 'interfaces/publicEnrollment';
import { resetPublicEnrollmentContact } from 'redux/reducers/publicEnrollmentContact';

export const Done = ({
  enrollment,
}: {
  enrollment: PublicEnrollmentContact;
}) => {
  const translateCommon = useCommonTranslation();
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.done',
  });

  const dispatch = useAppDispatch();
  const navigate = useNavigate();

  const resetAndRedirect = () => {
    dispatch(resetPublicEnrollmentContact());
    navigate(AppRoutes.PublicGoodAndSatisfactoryLevelLanding);
  };

  return (
    <div className="margin-top-lg rows gapped">
      <Text>
        {t('description')}: {enrollment.email}
      </Text>
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
