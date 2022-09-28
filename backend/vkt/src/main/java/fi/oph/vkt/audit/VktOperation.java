package fi.oph.vkt.audit;

import fi.vm.sade.auditlog.Operation;

public enum VktOperation implements Operation {
  LIST_EXAM_EVENTS,
  GET_EXAM_EVENT,
}
