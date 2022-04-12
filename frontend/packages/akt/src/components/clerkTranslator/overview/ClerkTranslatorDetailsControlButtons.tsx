import EditIcon from '@mui/icons-material/Edit';

import { CustomButton } from 'components/elements/CustomButton';
import { LoadingProgressIndicator } from 'components/elements/LoadingProgressIndicator';
import { useCommonTranslation } from 'configs/i18n';
import { useAppSelector } from 'configs/redux';
import { APIResponseStatus } from 'enums/api';
import { Color, Variant } from 'enums/app';
import { clerkTranslatorOverviewSelector } from 'redux/selectors/clerkTranslatorOverview';

export const ControlButtons = ({
  isViewMode,
  onCancelBtnClick,
  onEditBtnClick,
  onSaveBtnClick,
}: {
  isViewMode: boolean;
  onCancelBtnClick: () => void;
  onEditBtnClick: () => void;
  onSaveBtnClick: () => void;
}) => {
  const translateCommon = useCommonTranslation();
  const { translatorDetailsStatus } = useAppSelector(
    clerkTranslatorOverviewSelector
  );

  const isLoading = translatorDetailsStatus === APIResponseStatus.InProgress;

  if (isViewMode) {
    return (
      <CustomButton
        data-testid="clerk-translator-overview__translator-details__edit-btn"
        variant={Variant.Contained}
        color={Color.Secondary}
        startIcon={<EditIcon />}
        onClick={onEditBtnClick}
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
          onClick={onCancelBtnClick}
          disabled={isLoading}
        >
          {translateCommon('cancel')}
        </CustomButton>
        <LoadingProgressIndicator isLoading={isLoading}>
          <CustomButton
            data-testid="clerk-translator-overview__translator-details__save-btn"
            variant={Variant.Contained}
            color={Color.Secondary}
            onClick={onSaveBtnClick}
            disabled={isLoading}
          >
            {translateCommon('save')}
          </CustomButton>
        </LoadingProgressIndicator>
      </div>
    );
  }
};
