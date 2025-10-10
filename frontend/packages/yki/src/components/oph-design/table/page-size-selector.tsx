import { OphFormFieldWrapper } from '@opetushallitus/oph-design-system';

import { LocalizedSelect } from 'components/oph-design/localized-select';
import { useCommonTranslation } from 'configs/i18n';

const PAGE_SIZES = [10, 20, 30, 50, 100];

const DEFAULT_PAGE_SIZE = 30;

const PAGE_SIZE_OPTIONS = PAGE_SIZES.map((size: number) => ({
  value: size.toString(),
  label: size.toString(),
}));

export const PageSizeSelector = ({
  pageSize,
  setPageSize,
}: {
  pageSize: number;
  setPageSize: (page: number) => void;
}) => {
  const translateCommon = useCommonTranslation();

  return (
    <OphFormFieldWrapper
      id="page-size-select"
      label={translateCommon('component.table.pagination.clerkRowsPerPage')}
      renderInput={({ labelId }) => (
        <LocalizedSelect
          labelId={labelId}
          value={pageSize.toString()}
          onChange={(e) => {
            const newValue = parseInt(e.target.value, 10);
            setPageSize(isNaN(newValue) ? DEFAULT_PAGE_SIZE : newValue);
          }}
          options={PAGE_SIZE_OPTIONS}
        />
      )}
    />
  );
};
