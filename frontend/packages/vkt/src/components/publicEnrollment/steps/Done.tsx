import { useNavigate } from 'react-router';
import { CustomButton, Text } from 'shared/components';

import { useCommonTranslation, usePublicTranslation } from 'configs/i18n';
import { useAppDispatch } from 'configs/redux';
import { AppRoutes } from 'enums/app';
import { FreeBasisSource } from 'interfaces/publicEducation';
import { PublicEnrollment } from 'interfaces/publicEnrollment';
import { resetPublicEnrollment } from 'redux/reducers/publicEnrollment';
import { resetPublicExamEventSelections } from 'redux/reducers/publicExamEvent';
import { EnrollmentUtils } from 'utils/enrollment';

const Contents = ({
  enrollment,
  isQueued,
}: {
  enrollment: PublicEnrollment;
  isQueued: boolean;
}) => {
  const { t } = usePublicTranslation({
    keyPrefix: 'vkt.component.publicEnrollment.steps.done',
  });
  const freePendingVerification =
    EnrollmentUtils.hasFreeBasis(enrollment) &&
    enrollment.freeEnrollmentBasis?.source === FreeBasisSource.User;

  if (isQueued) {
    return <Text>{`${t('descriptionQueued')}: ${enrollment.email}`}</Text>;
  } else if (freePendingVerification) {
    return (
      <>
        <Text>{`${t('freePendingVerification.description')}: ${
          enrollment.email
        }`}</Text>
        <Text>
          {t('freePendingVerification.part1')}
          <br />
          {t('freePendingVerification.part2')}
          <br />
          {t('freePendingVerification.part3')}
        </Text>
      </>
    );
  } else {
    return <Text>{`${t('description')}: ${enrollment.email}`}</Text>;
  }
};

export const Done = ({
  enrollment,
  isQueued,
}: {
  enrollment: PublicEnrollment;
  isQueued: boolean;
}) => {
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
      <Contents enrollment={enrollment} isQueued={isQueued} />
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
