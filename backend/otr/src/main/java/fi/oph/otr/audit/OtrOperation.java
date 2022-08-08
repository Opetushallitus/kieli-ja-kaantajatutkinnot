package fi.oph.otr.audit;

import fi.vm.sade.auditlog.Operation;

public enum OtrOperation implements Operation {
  CREATE_MEETING_DATE,
  DELETE_MEETING_DATE,
  UPDATE_MEETING_DATE,
}
