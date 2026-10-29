import axiosInstance from 'configs/axios';
import { APIEndpoints } from 'enums/api';
import { ExamSessionsResponse } from 'interfaces/examSessions';

// The organizer accordion and organizer details page use this endpoint.
// A missing handler sends the request to the backend proxy in MSW mode.
describe('organizer exam session listing handler', () => {
  it.each([
    {
      oid: '1.2.246.562.10.28646781493',
      from: '2025-10-29',
      ids: [999, 888, 25],
    },
    {
      oid: '1.2.246.562.10.39706139522',
      from: '2025-10-29',
      ids: [13],
    },
    {
      oid: '1.2.246.562.10.28646781493',
      from: '2035-01-01',
      ids: [999, 888, 25],
    },
    {
      oid: '1.2.246.562.10.28646781493',
      from: '2035-01-02',
      ids: [25],
    },
    {
      oid: '1.2.246.562.10.28646781493',
      from: undefined,
      ids: [999, 888, 25, 10, 11],
    },
  ])('returns sessions for $oid from $from', async ({ oid, from, ids }) => {
    const response = await axiosInstance.get<ExamSessionsResponse>(
      APIEndpoints.OrganizerExamSession.replace(':oid', oid),
      { params: { from }, timeout: 1000 },
    );

    expect(response.status).toBe(200);
    expect(response.data.exam_sessions.map(({ id }) => id)).toEqual(ids);
    expect(
      response.data.exam_sessions.every(
        ({ organizer_oid }) => organizer_oid === oid,
      ),
    ).toBe(true);
  });
});
