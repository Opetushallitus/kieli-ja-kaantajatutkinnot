import EditIcon from '@mui/icons-material/Edit';
import { FC } from 'react';
import { CustomButton, LoadingProgressIndicator } from 'shared/components';
import { APIResponseStatus, Color, Variant } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { clerkInterpreterOverviewSelector } from 'redux/selectors/clerkInterpreterOverview';

interface ControlButtonsProps {
  onCancel: () => void;
  onEdit: () => void;
  onSave: () => void;
  isViewMode: boolean;
  hasRequiredDetails: boolean;
}

export const ControlButtons: FC<ControlButtonsProps> = ({
  onCancel,
  onEdit,
  onSave,
  isViewMode,
  hasRequiredDetails,
}) => {
  const translateCommon = useCommonTranslation();
  const { interpreterDetailsStatus } = useAppSelector(
    clerkInterpreterOverviewSelector
  );

  const isLoading = interpreterDetailsStatus === APIResponseStatus.InProgress;

  if (isViewMode) {
    return (
      <CustomButton
        data-testid="clerk-interpreter-overview__interpreter-details__edit-button"
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
          data-testid="clerk-interpreter-overview__interpreter-details__cancel-button"
          variant={Variant.Text}
          color={Color.Secondary}
          onClick={onCancel}
          disabled={isLoading}
        >
          {translateCommon('cancel')}
        </CustomButton>
        <LoadingProgressIndicator isLoading={isLoading}>
          <CustomButton
            data-testid="clerk-interpreter-overview__interpreter-details__save-button"
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
