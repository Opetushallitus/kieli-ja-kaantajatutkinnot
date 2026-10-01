import { ExamLanguage, ExamLevel } from 'enums/app';
import {
  examSessionsReducer,
  setPublicExamSessionFilters,
  storeExamSessions,
} from 'redux/reducers/examSessions';
import { examSessions } from 'tests/msw/fixtures/examSession';
import { ExamSessionUtils } from 'utils/examSession';
import { SerializationUtils } from 'utils/serialization';

const stateWithMunicipality = () => {
  const state = examSessionsReducer(
    undefined,
    storeExamSessions(
      SerializationUtils.deserializeExamSessionsResponse(examSessions),
    ),
  );

  return examSessionsReducer(
    state,
    setPublicExamSessionFilters({
      language: ExamLanguage.FIN,
      level: ExamLevel.YLIN,
      municipality: 'Tampere',
    }),
  );
};

describe('examSessionsReducer municipality filter', () => {
  it('clears a municipality missing from refreshed sessions without changing other filters', () => {
    const previousState = stateWithMunicipality();
    const refreshed =
      SerializationUtils.deserializeExamSessionsResponse(examSessions);
    refreshed.exam_sessions = refreshed.exam_sessions.filter(
      (session) =>
        ExamSessionUtils.getMunicipality(session.location[0]) !== 'Tampere',
    );

    const state = examSessionsReducer(
      previousState,
      storeExamSessions(refreshed),
    );

    expect(state.municipalities).not.toContain('Tampere');
    expect(state.filters).toEqual({
      ...previousState.filters,
      municipality: undefined,
    });
  });

  it('preserves a municipality still present in refreshed sessions', () => {
    const previousState = stateWithMunicipality();
    const state = examSessionsReducer(
      previousState,
      storeExamSessions(
        SerializationUtils.deserializeExamSessionsResponse(examSessions),
      ),
    );

    expect(state.municipalities).toContain('Tampere');
    expect(state.filters).toEqual(previousState.filters);
  });
});
