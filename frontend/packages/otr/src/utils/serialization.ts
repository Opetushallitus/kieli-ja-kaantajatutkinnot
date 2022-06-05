import dayjs from 'dayjs';

import {
  ClerkInterpreter,
  ClerkInterpreterResponse,
  ClerkInterpreterTextFields,
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

  static serializeClerkInterpreterResponse(interpreter: ClerkInterpreter) {
    const {
      id,
      version,
      permissionToPublishEmail,
      permissionToPublishPhone,
      permissionToPublishOtherContactInfo,
      regions,
      qualifications: _ignored,
      ...rest
    } = interpreter;
    const textFields =
      SerializationUtils.getNonBlankClerkInterpreterTextFields(rest);

    return {
      ...textFields,
      id,
      version,
      permissionToPublishEmail,
      permissionToPublishPhone,
      permissionToPublishOtherContactInfo,
      regions,
    };
  }

  static deserializeQualificationResponse(
    qualification: QualificationResponse
  ): Qualification {
    const beginDate = dayjs(qualification.beginDate);
    const endDate = dayjs(qualification.endDate);

    return { ...qualification, beginDate, endDate };
  }

  private static getNonBlankClerkInterpreterTextFields(
    textFields: ClerkInterpreterTextFields
  ) {
    Object.keys(textFields).forEach((key) => {
      const field = key as keyof ClerkInterpreterTextFields;

      if (textFields[field]) {
        textFields[field] = (textFields[field] as string).trim();
      }
      if (!textFields[field]) {
        delete textFields[field];
      }
    });

    return textFields;
  }
}
