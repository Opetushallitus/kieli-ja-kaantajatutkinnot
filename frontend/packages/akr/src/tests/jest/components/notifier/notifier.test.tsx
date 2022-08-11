import { render } from '@testing-library/react';
import renderer from 'react-test-renderer';

import { DialogBox } from 'components/notification/DialogBox';
import { Toast } from 'components/notification/Toast';
import { useAppSelector } from 'configs/redux';
import { NotifierState } from 'interfaces/notifier';
import {
  notifierReducer,
  removeNotifierDialog,
  removeNotifierToast,
  showNotifierDialog,
  showNotifierToast,
} from 'redux/reducers/notifier';
import {
  dialogsArray,
  emptyNotifierState,
  notifierState,
  toastsArray,
} from 'tests/jest/__fixtures__/notifier';

describe('DialogBox', () => {
  it('should not render Dialog if there is no data', () => {
    const { container } = render(<DialogBox />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render DialogBox correctly', () => {
    initializeState(notifierState);
    const { container } = render(<DialogBox />);

    expect(container).toMatchSnapshot();
  });

  it('should show a Dialog when an action is dispatched', () => {
    const [dialog] = dialogsArray;
    const previousState = emptyNotifierState;
    const dialogCreator = showNotifierDialog(dialog);

    const newState = notifierReducer(previousState, dialogCreator);

    expect(newState).toEqual({ dialogs: [dialog], toasts: [] });
  });

  it('should remove a Dialog when an action is dispatched', () => {
    const [dialog] = dialogsArray;
    const previousState = { dialogs: [dialog], toasts: [] };
    const dialogCreator = removeNotifierDialog(dialog.id);

    const newState = notifierReducer(previousState, dialogCreator);

    expect(newState).toEqual({ dialogs: [], toasts: [] });
  });
});

describe('Toast', () => {
  it('should not render Toast if there is no data', () => {
    initializeState(emptyNotifierState);
    const { container } = render(<Toast />);

    expect(container).toBeEmptyDOMElement();
  });

  it('should render Toast correctly', () => {
    initializeState(notifierState);
    const tree = renderer.create(<Toast />).toJSON();

    expect(tree).toMatchSnapshot();
  });

  it('should show a Toast when an action is dispatched', () => {
    const [toast] = toastsArray;
    const previousState = emptyNotifierState;
    const toastCreator = showNotifierToast(toast);

    const newState = notifierReducer(previousState, toastCreator);

    expect(newState).toEqual({ dialogs: [], toasts: [toast] });
  });

  it('should remove a Toast when an action is dispatched', () => {
    const [toast] = toastsArray;
    const previousState = { dialogs: [], toasts: [toast] };
    const toastCreator = removeNotifierToast(toast.id);

    const newState = notifierReducer(previousState, toastCreator);

    expect(newState).toEqual({ dialogs: [], toasts: [] });
  });
});

// Helpers and Mocks
const initializeState = (state: NotifierState) => {
  const appSelector = useAppSelector as jest.Mock<NotifierState>;
  appSelector.mockImplementation(() => state);
};
