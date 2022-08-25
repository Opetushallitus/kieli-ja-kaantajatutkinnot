import { CustomButton, LoadingProgressIndicator } from 'shared/components';
import { Color, Variant } from 'shared/enums';

import { useCommonTranslation } from 'configs/i18n';
export const BottomControls = ({
  isLoading,
  isSaveDisabled,
  onSave,
}: {
  isLoading: boolean;
  isSaveDisabled: boolean;
  onSave: () => void;
}) => {
  // i18n
  const translateCommon = useCommonTranslation();

  return (
    <div className="columns gapped flex-end">
      <LoadingProgressIndicator isLoading={isLoading}>
        <CustomButton
          data-testid="clerk-new-translator-page__save-button"
          variant={Variant.Contained}
          color={Color.Secondary}
          onClick={() => onSave()}
          disabled={isSaveDisabled}
        >
          {translateCommon('save')}
        </CustomButton>
      </LoadingProgressIndicator>
    </div>
  );
};
