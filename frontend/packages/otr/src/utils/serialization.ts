import dayjs from 'dayjs';

import {
  ClerkInterpreter,
  ClerkInterpreterResponse,
} from 'interfaces/clerkInterpreter';
import { Qualification, QualificationResponse } from 'interfaces/qualification';

export class SerializationUtils {
  static deserializeClerkInterpreterResponse(
    response: ClerkInterpreterResponse
  ): ClerkInterpreter {
    const qualifications = response.qualifications.map(
      SerializationUtils.deserializeQualificationResponse
    );

    return { ...response, qualifications };
  }

  static deserializeQualificationResponse(
    qualification: QualificationResponse
  ): Qualification {
    const beginDate = dayjs(qualification.beginDate);
    const endDate = dayjs(qualification.endDate);

    return { ...qualification, beginDate, endDate };
  }
}
