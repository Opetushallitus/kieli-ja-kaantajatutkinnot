'use client';
import { OphSelect } from '@opetushallitus/oph-design-system';

import { useCommonTranslation } from 'configs/i18n';

export const LocalizedSelect = ({
  ariaLabel,
  ...props
}: React.ComponentProps<typeof OphSelect> & { ariaLabel?: string }) => {
  const translateConmon = useCommonTranslation();

  return (
    <OphSelect
      inputProps={{
        'aria-label':
          ariaLabel ??
          translateConmon('component.table.pagination.clerkRowsPerPage'),
      }}
      MenuProps={{ id: 'select-menu' }}
      placeholder={translateConmon(
        'component.table.pagination.clerkRowsPerPage',
      )}
      value={props.value ?? ''}
      {...props}
    />
  );
};
