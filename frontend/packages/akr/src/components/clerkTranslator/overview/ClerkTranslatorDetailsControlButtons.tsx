import EditIcon from '@mui/icons-material/Edit';
import { FC } from 'react';
import { CustomButton, LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { clerkTranslatorOverviewSelector } from 'redux/selectors/clerkTranslatorOverview';

interface ControlButtonsProps {
  isViewMode: boolean;
  onCancel: () => void;
  onEdit: () => void;
  onSave: () => void;
  hasRequiredDetails: boolean;
}

export const ControlButtons: FC<ControlButtonsProps> = ({
  isViewMode,
  onCancel,
  onEdit,
  onSave,
  hasRequiredDetails,
}) => {
  const translateCommon = useCommonTranslation();
  const status = useAppSelector(
    clerkTranslatorOverviewSelector,
  ).translatorDetailsStatus;

  const isLoading = status === APIResponseStatus.InProgress;

  if (isViewMode) {
    return (
      <CustomButton
        data-testid="clerk-translator-overview__translator-details__edit-btn"
        variant={Variant.Contained}
        color={Color.Secondary}
        startIcon={<EditIcon />}
        onClick={onEdit}
      >
        {translateCommon('edit')}
      </CustomButton>
    );
  } else {
    return (
      <div className="columns gapped">
        <CustomButton
          data-testid="clerk-translator-overview__translator-details__cancel-btn"
          variant={Variant.Text}
          color={Color.Secondary}
          onClick={onCancel}
          disabled={isLoading}
        >
          {translateCommon('cancel')}
        </CustomButton>
        <LoadingProgressIndicator isLoading={isLoading}>
          <CustomButton
            data-testid="clerk-translator-overview__translator-details__save-btn"
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
