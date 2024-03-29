import { useCallback } from 'react';
import { Severity, Variant } from 'shared/enums';
import {
  useNavigationProtection as useCommonNavigationProtection,
  useDialog,
} from 'shared/hooks';

import { useCommonTranslation } from 'configs/i18n';

export const useNavigationProtection = (when: boolean, baseUrl?: string) => {
  const translateCommon = useCommonTranslation();
  const { showDialog } = useDialog();

  const showConfirmationDialog = useCallback(
    (confirmNavigation: () => void, cancelNavigation: () => void) => {
      showDialog({
        title: translateCommon('navigationProtection.header'),
        severity: Severity.Info,
        description: translateCommon('navigationProtection.description'),
        actions: [
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
        onClose: cancelNavigation,
      });
    },
    [showDialog, translateCommon],
  );

  useCommonNavigationProtection(when, showConfirmationDialog, baseUrl);
};
