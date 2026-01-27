import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';

import { rootReducer, setupStore } from 'redux/store/index';

export type RootState = ReturnType<typeof rootReducer>;
export type AppStore = ReturnType<typeof setupStore>;
type AppDispatch = AppStore['dispatch'];

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
