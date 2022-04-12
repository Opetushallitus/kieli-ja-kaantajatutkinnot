import { fireEvent, render } from '@testing-library/react';
import renderer from 'react-test-renderer';

import { ToggleFilterGroup } from 'components/elements/ToggleFilterGroup';
import { MeetingStatus } from 'enums/meetingDate';
import { meetingDateToggleFilters } from 'tests/jest/__fixtures__/toggleFilters';

describe('ToggleFilter', () => {
  it('should render ToggleFilter correctly', () => {
    const tree = renderer
      .create(
        <ToggleFilterGroup
          filters={meetingDateToggleFilters}
          activeStatus={MeetingStatus.Upcoming}
          onButtonClick={jest.fn()}
        />
      )
      .toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should call "onClick" prop on button click', () => {
    const onClick = jest.fn();
    const { getByText } = render(
      <ToggleFilterGroup
        filters={meetingDateToggleFilters}
        activeStatus={MeetingStatus.Upcoming}
        onButtonClick={onClick}
      />
    );

    fireEvent.click(getByText(/label2/i));

    expect(onClick).toHaveBeenCalled();
  });
});
