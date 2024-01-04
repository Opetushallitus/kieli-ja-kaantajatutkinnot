import { ComboBox, H3 } from 'shared/components';
import { TextFieldVariant } from 'shared/enums';

import { useAppTranslation } from 'configs/i18n';
import { useAppDispatch, useAppSelector } from 'configs/redux';
import { TranslatorEmailStatus } from 'enums/clerkTranslator';
import { ClerkTranslatorFilter } from 'interfaces/clerkTranslator';
import {
  addClerkTranslatorFilter,
  setPage,
} from 'redux/reducers/clerkTranslator';
import { clerkTranslatorsSelector } from 'redux/selectors/clerkTranslator';

export const ClerkTranslatorEmailFilter = () => {
  const { t } = useAppTranslation({
    keyPrefix: 'akr.component.clerkTranslatorFilters',
  });
  const { filters } = useAppSelector(clerkTranslatorsSelector);
  const dispatch = useAppDispatch();

  const handleFilterChange =
    (filter: keyof ClerkTranslatorFilter) => (value?: string) => {
      dispatch(addClerkTranslatorFilter({ [filter]: value }));
      dispatch(setPage(0));
    };

  const getEmailStateSelectValues = () =>
    Object.values(TranslatorEmailStatus).map((v) => ({
      value: v,
      label: t(`emailStatus.${v}`),
    }));

  const getEmailStateValue = () =>
    filters.emailStatus
      ? {
          value: filters.emailStatus,
          label: t(`emailStatus.${filters.emailStatus}`),
        }
      : null;

  return (
    <div className="clerk-translator-email-filter gapped">
      <div className="rows gapped-xs">
        <H3>{t('emailState.title')}</H3>
        <ComboBox
          autoHighlight
          data-testid="clerk-translator-filters__email-basis"
          label={t('emailState.placeholder')}
          values={getEmailStateSelectValues()}
          value={getEmailStateValue()}
          variant={TextFieldVariant.Outlined}
          onChange={handleFilterChange('emailStatus')}
        />
      </div>
    </div>
  );
};
