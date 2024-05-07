import { CustomButton, CustomModal, Text } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { AppRoutes } from 'enums/app';

export const SessionExpiredModal = ({ isClerkUI }: { isClerkUI: boolean }) => {
  const translateCommon = useCommonTranslation();

  return (
    <CustomModal
      data-testid="public-enrollment__session-expired-modal"
      className="public-enrollment__session-expired-modal"
      open={true}
      aria-labelledby="session-expired-modal-title"
      aria-describedby="session-expired-modal-description"
      modalTitle={translateCommon('sessionExpired.title')}
      onCloseModal={() => {}}
    >
      <>
        <Text id="session-expired-modal-description">
          {translateCommon(
            isClerkUI
              ? 'sessionExpired.descriptionClerk'
              : 'sessionExpired.descriptionPublic',
          )}
        </Text>
        <div className="columns gapped flex-end">
          <CustomButton
            data-testid="public-enrollment__session-expired-modal-button"
            variant={Variant.Contained}
            color={Color.Secondary}
            href={AppRoutes.PublicHomePage}
          >
            {translateCommon('backToHomePage')}
          </CustomButton>
        </div>
      </>
    </CustomModal>
  );
};
