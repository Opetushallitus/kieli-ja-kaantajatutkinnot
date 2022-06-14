import { Severity, Variant } from 'shared/enums';
import {
  useNavigationProtection as useCommonNavigationProtection,
  useDialog,
} from 'shared/hooks';

import { useCommonTranslation } from 'configs/i18n';

export const useNavigationProtection = (when: boolean) => {
  const translateCommon = useCommonTranslation();
  const { showDialog } = useDialog();

  const showConfirmationDialog = (
    confirmNavigation: () => void,
    cancelNavigation: () => void
  ) => {
    showDialog(
      translateCommon('navigationProtection.header'),
      Severity.Info,
      translateCommon('navigationProtection.description'),
      [
        {
          title: translateCommon('back'),
          variant: Variant.Outlined,
          action: cancelNavigation,
        },
        {
          title: translateCommon('yes'),
          variant: Variant.Contained,
          action: confirmNavigation,
        },
      ],
      undefined,
      cancelNavigation
    );
  };

  useCommonNavigationProtection(when, showConfirmationDialog);
};
