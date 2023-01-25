import EditIcon from '@mui/icons-material/Edit';
import { FC } from 'react';
import { CustomButton, LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { useClerkTranslation, useCommonTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { clerkEnrollmentDetailsSelector } from 'redux/selectors/clerkEnrollmentDetails';

interface ControlButtonsProps {
  onCancel: () => void;
  onEdit: () => void;
  onSave: () => void;
  onMove: () => void;
  isViewMode: boolean;
  hasRequiredDetails: boolean;
}

export const ControlButtons: FC<ControlButtonsProps> = ({
  onCancel,
  onEdit,
  onSave,
  onMove,
  isViewMode,
  hasRequiredDetails,
}) => {
  const { t } = useClerkTranslation({
    keyPrefix: 'vkt.component.clerkEnrollmentDetails.controlButtons',
  });
  const translateCommon = useCommonTranslation();

  const { status } = useAppSelector(clerkEnrollmentDetailsSelector);

  const isLoading = status === APIResponseStatus.InProgress;

  if (isViewMode) {
    return (
      <div className="columns gapped">
        <CustomButton
          data-testid="clerk-enrollment-details__move-button"
          variant={Variant.Contained}
          color={Color.Secondary}
          onClick={onMove}
        >
          {t('move')}
        </CustomButton>
        <CustomButton
          data-testid="clerk-enrollment-details__edit-button"
          variant={Variant.Contained}
          color={Color.Secondary}
          startIcon={<EditIcon />}
          onClick={onEdit}
        >
          {translateCommon('edit')}
        </CustomButton>
      </div>
    );
  } else {
    return (
      <div className="columns gapped">
        <CustomButton
          data-testid="clerk-enrollment-details__cancel-button"
          variant={Variant.Text}
          color={Color.Secondary}
          onClick={onCancel}
          disabled={isLoading}
        >
          {translateCommon('cancel')}
        </CustomButton>
        <LoadingProgressIndicator isLoading={isLoading}>
          <CustomButton
            data-testid="clerk-enrollment-details__save-button"
            variant={Variant.Contained}
            color={Color.Secondary}
            onClick={onSave}
            disabled={isLoading || !hasRequiredDetails}
          >
            {translateCommon('save')}
          </CustomButton>
        </LoadingProgressIndicator>
      </div>
    );
  }
};
