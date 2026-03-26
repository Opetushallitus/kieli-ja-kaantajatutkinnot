# OPHKIOS-327 Osakoevalinta — Status & Catch-up

Branch: `feature/OPHKIOS-327-osakoevalinta`

## Mitä tämä tiketti tekee

Lisätään osakoevalinta (partial exam selection) ilmoittautumisiin. Hakija voi valita, ilmoittautuuko hän koko tutkintoon vai vain tiettyihin osakokeisiin (luku, kirjoitus, kuuntelu, puhuminen).

---

## Mitä on jo tehty (commit `3ec3de200`)

`PartialExamType`-enum lisätty:

```java
// backend/yki/src/main/java/fi/oph/yki/model/type/PartialExamType.java
public enum PartialExamType {
  ALL_PARTS, READ, SPEAK, LISTEN, WRITE
}
```

`Registration`-malliin lisätty kenttä:

```java
// backend/yki/src/main/java/fi/oph/yki/model/Registration.java
@Column(name = "partial_exam_type", columnDefinition = "exam_session_ticket_type")
private PartialExamType partialExamType;
```

`ClerkRegistrationDTO`:hen lisätty:

```java
// backend/yki/src/main/java/fi/oph/yki/api/dto/clerk/ClerkRegistrationDTO.java
PartialExamType partialExamType
```

Excel-vienti (ExamSessionXlsx) päivitetty näyttämään osakoetyyppi.

---

## Blokkeri — odottaa toista kehittäjää

**Ongelma:** Tutkintolistauksen API (`ClerkExamSessionDTO`) pitäisi palauttaa paikkojen määrä per osakoetyyppi, mutta tietokannassa ei vielä ole kapasiteettisarakkeita per tyyppi.

`ClerkExamSessionDTO`:ssa on jo placeholder-kentät:
- `maxParticipantsTotal`
- `maxParticipantsPartial1`
- `maxParticipantsPartial2`

Mutta `ClerkExamSessionService.toDTO()` asettaa ne kaikki virheellisesti samaksi arvoksi:

```java
.maxParticipantsTotal(examSession.getMaxParticipants())
.maxParticipantsPartial1(examSession.getMaxParticipants())   // VÄÄRIN
.maxParticipantsPartial2(examSession.getMaxParticipants())   // VÄÄRIN
```

**Tietokantamuutos on toisen kehittäjän vastuulla.** Odota heidän päätöstään siitä, mitä sarakkeita he lisäävät `exam_session`-tauluun ennen kuin jatkat.

---

## Mitä tehdä kun blokki poistuu

Kun tietokantamuutos on tehty, tarvitset seuraavat muutokset:

### 1. `ExamSession`-malli — lisää uudet kentät

```java
// backend/yki/src/main/java/fi/oph/yki/model/ExamSession.java
@Column(name = "max_participants_partial1")   // tai minkä niminen sarake lisättiin
private Integer maxParticipantsPartial1;

@Column(name = "max_participants_partial2")
private Integer maxParticipantsPartial2;
```

### 2. `ClerkExamSessionService.toDTO()` — korjaa arvot

```java
.maxParticipantsTotal(examSession.getMaxParticipants())
.maxParticipantsPartial1(examSession.getMaxParticipantsPartial1())
.maxParticipantsPartial2(examSession.getMaxParticipantsPartial2())
```

### 3. `ClerkExamSessionUpdateDTO` — lisää kentät päivitykseen

```java
// backend/yki/src/main/java/fi/oph/yki/api/dto/clerk/ClerkExamSessionUpdateDTO.java
Integer maxParticipantsPartial1,
Integer maxParticipantsPartial2
```

### 4. `ClerkExamSessionService.updateExamSession()` — tallenna päivitys

```java
examSession.setMaxParticipantsPartial1(dto.maxParticipantsPartial1());
examSession.setMaxParticipantsPartial2(dto.maxParticipantsPartial2());
```

---

## Avaintiedostot

| Tiedosto | Kuvaus |
|---|---|
| `backend/yki/src/main/java/fi/oph/yki/model/ExamSession.java` | Entity — lisää kentät tähän |
| `backend/yki/src/main/java/fi/oph/yki/api/dto/clerk/ClerkExamSessionDTO.java` | Response DTO — kentät jo olemassa |
| `backend/yki/src/main/java/fi/oph/yki/api/dto/clerk/ClerkExamSessionUpdateDTO.java` | Update DTO — lisää kentät tähän |
| `backend/yki/src/main/java/fi/oph/yki/service/ClerkExamSessionService.java` | Logiikka — korjaa `toDTO()` ja `updateExamSession()` |
| `backend/yki/src/main/resources/db/changelog/db.changelog-1.0.xml` | Migraatiot — toinen kehittäjä lisää tänne |

---

## Taustaa: tietokantarakenne (PR #974)

`exam_session_ticket` = yksittäinen varaus tilaisuuteen, ei ennakkopaikka. Kapasiteetti pitää tallentaa erikseen `exam_session`-tauluun.

`ExamSessionType` määrää mitä partial1/partial2 tarkoittaa:
- `READ_SPEAK` → partial1 = READ-kapasiteetti, partial2 = SPEAK-kapasiteetti
- `LISTEN_WRITE` → partial1 = LISTEN-kapasiteetti, partial2 = WRITE-kapasiteetti
- `FULL` → partial1 ja partial2 ovat null
