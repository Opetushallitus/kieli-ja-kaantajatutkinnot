import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import dayjs from 'dayjs';
import { APIResponseStatus } from 'shared/enums';

import { ExamLanguage } from 'enums/app';
import { PublicExaminerState } from 'interfaces/publicExaminer';

const initialState: PublicExaminerState = {
  status: APIResponseStatus.Success,
  examiners: [
    {
      id: 1,
      name: 'Eemeli Laine',
      language: ExamLanguage.FI,
      municipalities: ['Helsinki', 'Espoo', 'Vantaa', 'Kauniainen'],
      examDates: [],
    },
    {
      id: 2,
      name: 'Kerttu Virtanen',
      language: ExamLanguage.SV,
      municipalities: ['Vaasa'],
      examDates: [],
    },
    {
      id: 3,
      name: 'Aapo Mäkinen',
      language: ExamLanguage.ALL,
      municipalities: ['Tampere'],
      examDates: [dayjs('2024-10-17')],
    },
    {
      id: 4,
      name: 'Veera Salminen',
      language: ExamLanguage.FI,
      municipalities: ['Kajaani'],
      examDates: [
        dayjs('2024-09-12'),
        dayjs('2024-09-13'),
        dayjs('2024-09-19'),
        dayjs('2024-09-20'),
      ],
    },
  ],
  languageFilter: ExamLanguage.ALL,
};

const publicExaminerSlice = createSlice({
  name: 'publicExaminer',
  initialState,
  reducers: {
    setPublicExaminerLanguageFilter(
      state,
      action: PayloadAction<ExamLanguage>,
    ) {
      state.languageFilter = action.payload;
    },
  },
});

export const publicExaminerReducer = publicExaminerSlice.reducer;
export const { setPublicExaminerLanguageFilter } = publicExaminerSlice.actions;
