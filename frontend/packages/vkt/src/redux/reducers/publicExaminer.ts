import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { APIResponseStatus } from 'shared/enums';

import { ExamLanguage } from 'enums/app';
import { PublicExaminer, PublicExaminerState } from 'interfaces/publicExaminer';

const initialState: PublicExaminerState = {
  status: APIResponseStatus.NotStarted,
  examiners: [],
  languageFilter: ExamLanguage.ALL,
};

const publicExaminerSlice = createSlice({
  name: 'publicExaminer',
  initialState,
  reducers: {
    loadPublicExaminers(state) {
      state.status = APIResponseStatus.InProgress;
    },
    rejectPublicExaminers(state) {
      state.status = APIResponseStatus.Error;
    },
    storePublicExaminers(state, action: PayloadAction<Array<PublicExaminer>>) {
      state.status = APIResponseStatus.Success;
      state.examiners = action.payload;
    },
    setPublicExaminerLanguageFilter(
      state,
      action: PayloadAction<ExamLanguage>,
    ) {
      state.languageFilter = action.payload;
    },
  },
});

export const publicExaminerReducer = publicExaminerSlice.reducer;
export const {
  loadPublicExaminers,
  rejectPublicExaminers,
  storePublicExaminers,
  setPublicExaminerLanguageFilter,
} = publicExaminerSlice.actions;
