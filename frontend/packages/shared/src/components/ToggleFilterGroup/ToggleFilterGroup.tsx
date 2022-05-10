import { Color, Variant } from '../../enums/common';
import { CustomButton } from '../CustomButton/CustomButton';

interface ToggleFilter<T> {
  status: T;
  label: string;
  count?: number;
  testId?: string;
}
interface ToggleFilterGroupProps<T> {
  filters: Array<ToggleFilter<T>>;
  activeStatus: T;
  onButtonClick(T: T): void;
}

export function ToggleFilterGroup<T>({
  filters,
  activeStatus,
  onButtonClick,
}: ToggleFilterGroupProps<T>) {
  return (
    <div className="columns">
      {filters.map(({ count, status, testId, label }, i) => (
        <CustomButton
          className="border-radius-unset"
          key={i}
          data-testid={testId}
          color={Color.Secondary}
          variant={
            activeStatus === status ? Variant.Contained : Variant.Outlined
          }
          onClick={() => onButtonClick(status)}
        >
          <div className="columns gapped">
            <div className="grow">{label}</div>
            {count && <div>{`(${count})`}</div>}
          </div>
        </CustomButton>
      ))}
    </div>
  );
}
