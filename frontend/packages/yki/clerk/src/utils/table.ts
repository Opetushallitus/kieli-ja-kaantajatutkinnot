import { t } from 'i18next';

import { translateOutsideComponent } from 'configs/i18n';

export class TableUtils {
  t = translateOutsideComponent();

  static getPaginationBackButtonProps() {
    const label = t('yki.common.component.table.pagination.backButtonLabel');

    return { 'aria-label': label, title: label };
  }

  static getPaginationNextButtonProps() {
    const label = t('yki.common.component.table.pagination.nextButtonLabel');

    return { 'aria-label': label, title: label };
  }
}
