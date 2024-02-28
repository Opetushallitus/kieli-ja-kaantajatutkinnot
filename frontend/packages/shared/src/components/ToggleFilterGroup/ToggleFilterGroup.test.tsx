import renderer from 'react-test-renderer';

import { ToggleFilterGroup } from './ToggleFilterGroup';

const enum FilterStatusEnum {
  Active,
  Passive,
  Expired,
}
const filterData = [
  {
    status: FilterStatusEnum.Active,
    label: 'Active',
    count: 10,
    testId: 'toggleFilter--active',
  },
  {
    status: FilterStatusEnum.Passive,
    label: 'Passive',
    count: 0,
  },
  {
    status: FilterStatusEnum.Expired,
    label: 'Expired',
  },
];

describe('ToggleFilterGroup', () => {
  it('should render correctly', () => {
    const tree = renderer
      .create(
        <ToggleFilterGroup
          filters={filterData}
          activeStatus={FilterStatusEnum.Active}
          onButtonClick={jest.fn}
        />,
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });
});
