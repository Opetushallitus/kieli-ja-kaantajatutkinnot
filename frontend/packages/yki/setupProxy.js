const axios = require('axios');
const bodyParser = require('body-parser');
const dayjs = require('dayjs');
const fs = require('fs');
const multer = require('multer');

const getCurrentTime = () => {
  const tzoffset = new Date().getTimezoneOffset() * 60000;
  const localISOTime = new Date(Date.now() - tzoffset)
    .toISOString()
    .slice(0, -1);

  return localISOTime;
};

const printError = (req, err) => {
  // eslint-disable-next-line no-console
  console.log(
    '\n Error in: ' +
      req.method +
      ': ' +
      req.originalUrl +
      '\n' +
      req.body +
      '\n From ' +
      (err.config && err.config.url) +
      '\n Message: ' +
      err.message +
      '\n Response data: ' +
      (err.response && JSON.stringify(err.response.data))
  );
};

const useLocalProxy = process.env.REACT_APP_USE_LOCAL_PROXY_BACKEND === 'true';

const getExamDates = () => {
  return JSON.parse(fs.readFileSync('./dev/rest/examSessions/examDates.json'));
};

let examDates = getExamDates();

const initRegistration = JSON.parse(
  fs.readFileSync('./dev/rest/registration/registrationInit.json')
);

const initRegistrationEmailAuth = JSON.parse(
  fs.readFileSync('./dev/rest/registration/registrationInitEmailAuth.json')
);

const getExamSessions = () => {
  return JSON.parse(
    fs.readFileSync('./dev/rest/examSessions/examSessions.json')
  );
};

let examSessions = getExamSessions();

const getAllExamSessions = () => {
  return JSON.parse(
    fs.readFileSync('./dev/rest/examSessions/allExamSessions.json')
  );
};

let allExamSessions = getAllExamSessions();

const getRegistrations = () => {
  return JSON.parse(
    fs.readFileSync('./dev/rest/examSessions/registrations.json')
  );
};

const findByOids = () => {
  return JSON.parse(fs.readFileSync('./dev/rest/organization/findbyoids.json'));
};

let organizations = findByOids();

let registrations = {
  1: getRegistrations(),
  2: { participants: [] },
  3: { participants: [] },
};

const countries = JSON.parse(
  fs.readFileSync('./dev/rest/codes/maatjavaltiot2.json')
);

const genders = JSON.parse(fs.readFileSync('./dev/rest/codes/sukupuoli.json'));

const prices = JSON.parse(
  fs.readFileSync('./dev/rest/registration/prices.json')
);

const evaluationPeriods = JSON.parse(
  fs.readFileSync('./dev/rest/registration/evaluationPeriods.json')
);

const paymentsReport = JSON.parse(
  fs.readFileSync('./dev/rest/examPayments/paymentsReport.json')
);

const evaluationOrder = {
  id: 1,
  language_code: 'fin',
  level_code: 'PERUS',
  exam_date: '2021-05-27',
  amount: 50,
  lang: 'fi',
  state: 'UNPAID',
  subtests: ['READING'],
};

let organizers = [
  {
    oid: '1.2.246.562.10.28646781493',
    agreement_start_date: '2018-01-01',
    agreement_end_date: '2029-01-01',
    contact_name: 'Iida Ikola',
    contact_email: 'iida.ikola@amiedu.fi',
    contact_phone_number: '0101234546',
    attachments: null,
    languages: [
      {
        language_code: 'fin',
        level_code: 'PERUS',
      },
      {
        language_code: 'fin',
        level_code: 'KESKI',
      },
      {
        language_code: 'fin',
        level_code: 'YLIN',
      },
      {
        language_code: 'deu',
        level_code: 'YLIN',
      },
      {
        language_code: 'sme',
        level_code: 'PERUS',
      },
      {
        language_code: 'sme',
        level_code: 'KESKI',
      },
    ],
    extra: 'Yleinen sähköpostilista: yki@amiedu.fi',
  },
  {
    oid: '1.2.246.562.10.39706139522',
    agreement_start_date: '2018-01-01T00:00:00.000Z',
    agreement_end_date: '2029-01-01T00:00:00.000Z',
    contact_name: 'Ismo Supinen',
    contact_email: 'ismo.supinen@jkl.fi',
    contact_phone_number: '01412345467',
    languages: null,
    extra: 'Sisäänkäynti hämyiseltä sivuovelta',
    attachments: null,
  },
];

const quarantineMatches = {
  quarantine_matches: [
    {
      quarantine_lang: 'fin',
      birthdate: '2018-02-01',
      email: 'email@invalid.invalid',
      language_code: 'fin',
      phone_number: '0401234567',
      quarantine_id: null,
      reviewed: '2022-12-20T12:23:52.501Z',
      first_name: 'Max',
      last_name: 'Karenssi',
      ssn: '301079-900U',
      registration_id: 2,
      created: '2022-12-02T10:32:11.888Z',
      exam_date: '2025-03-10',
      end_date: '2028-01-01',
      id: 1,
      form: {
        email: 'email@invalid.invalid',
        birthdate: '2018-02-01',
        last_name: 'De Ilmoittautuminen',
        first_name: 'Max',
        phone_number: '0401234567',
      },
      state: 'COMPLETED',
    },
  ],
};

const quarantineReviews = {
  reviews: [
    {
      quarantine_lang: 'fin',
      birthdate: '2018-02-01',
      email: 'email@invalid.invalid',
      language_code: 'fin',
      phone_number: '0401234567',
      quarantine_id: 1,
      is_quarantined: false,
      reviewed: '2022-12-20T12:23:52.501Z',
      first_name: 'Max',
      last_name: 'Von Karenssi',
      ssn: '301079-900U',
      registration_id: 2,
      created: '2022-12-02T10:32:11.888Z',
      exam_date: '2025-03-10',
      end_date: '2028-01-01',
      id: 1,
      form: {
        email: 'email@invalid.invalid',
        birthdate: '2018-02-01',
        last_name: 'De Ilmoittautuminen',
        first_name: 'Max',
        phone_number: '0401234567',
      },
      state: 'COMPLETED',
    },
    {
      quarantine_lang: 'fin',
      birthdate: '2018-02-01',
      email: 'email@invalid.invalid',
      language_code: 'fin',
      phone_number: '0401234567',
      quarantine_id: 2,
      is_quarantined: true,
      reviewed: '2022-12-20T12:23:52.501Z',
      first_name: 'Max',
      last_name: 'Von Karenssi',
      ssn: '301079-900U',
      registration_id: 3,
      created: '2022-12-02T10:32:11.888Z',
      exam_date: '2025-03-10',
      end_date: '2028-01-01',
      id: 1,
      form: {
        email: 'email@invalid.invalid',
        birthdate: '2018-02-01',
        last_name: 'De Ilmoittautuminen',
        first_name: 'Max',
        phone_number: '0401234567',
      },
      state: 'SUBMITTED',
    },
  ],
};

const quarantines = {
  quarantines: [
    {
      quarantine_lang: 'fin',
      birthdate: '2018-02-01',
      email: 'email@invalid.invalid',
      language_code: 'fin',
      phone_number: '0401234567',
      name: 'Max Syöttöpaine',
      ssn: '301079-900U',
      created: '2022-12-02T10:32:11.888Z',
      end_date: '2028-01-01',
      id: 1,
      last_name: 'Syöttöpaine',
      first_name: 'Max',
      diary_number: '1234',
    },
  ],
};

const initialOrganizers = [...organizers];

/*
const adminUser = {
  identity: {
    username: 'ykitestaaja',
    oid: '1.2.246.562.24.98107285507',
    organizations: [
      {
        oid: '1.2.246.562.10.00000000001',
        permissions: [{ palvelu: 'YKI', oikeus: 'YLLAPITAJA' }],
      },
    ],
    lang: 'fi',
  },
  'auth-method': 'CAS',
};
*/

/*
const organizerUser = {
  identity: {
    username: 'ykijarjestaja',
    oid: '1.2.246.562.24.62800798482',
    organizations: [
      {
        oid: '1.2.246.562.10.28646781493',
        permissions: [{ palvelu: 'YKI', oikeus: 'JARJESTAJA' }],
      },
    ],
    lang: 'fi',
  },
  'auth-method': 'CAS'
};
*/

/*
const loginLinkAuthenticatedUser = {
  identity: {
    'email': 'testikaeyttaejae@test.invalid',
  },
  'auth-method': 'EMAIL',
};
*/


const suomiFiAuthenticatedUser = {
  identity: {
    first_name: 'Susanna',
    nick_name: 'Susanna',
    ssn: '020502E902X',
    nationalities: ['784'],
    'external-user-id': '1.2.246.562.24.00123456789',
    oid: '1.2.246.562.24.00123456789',
    zip: null,
    last_name: 'Uusivälimerkki',
    street_address: null,
    post_office: null,
  },
  'auth-method': 'SUOMIFI',
};

/*
const unauthenticatedUser = {
  identity: null,
};
*/
const getNumberBetween = (min, max) =>
  Math.trunc(Math.random() * (max - min) + min);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 104857600 },
});

let uploadedFile;

module.exports = function (app) {
  const getUrl = (req) => {
    // eslint-disable-next-line no-console
    console.log(
      '--> Forward to: ' + process.env.REACT_APP_LOCAL_PROXY + req.originalUrl
    );

    return process.env.REACT_APP_LOCAL_PROXY + req.originalUrl;
  };

  const resolveCall = (call, req, res) => {
    call
      .then((response) => {
        res.send(response.data);
      })
      .catch((err) => {
        printError(req, err);
        res.status(404).send(err.response.data);
      });
  };

  const proxyGetCall = (req, res) => {
    resolveCall(axios.get(getUrl(req), req.body), req, res);
  };
  const proxyPostCall = (req, res) => {
    resolveCall(axios.post(getUrl(req), req.body), req, res);
  };

  const proxyPutCall = (req, res) => {
    resolveCall(axios.put(getUrl(req), req.body), req, res);
  };

  const proxyDeleteCall = (req, res) => {
    resolveCall(axios.delete(getUrl(req), req.body), req, res);
  };

  app.use(bodyParser.json({ limit: '5mb' }));
  app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));

  app.use((req, res, next) => {
    if (
      req.originalUrl.indexOf('/yki/api') === 0 ||
      req.originalUrl.indexOf('/organisaatio-service')
    ) {
      if (!process.env.CI) {
        // eslint-disable-next-line no-console
        console.log(
          '\nTime:',
          getCurrentTime(),
          req.method + ': ' + req.originalUrl,
          '\n',
          JSON.stringify(req.body)
        );
        if (req.query.delay) {
          return setTimeout(
            next,
            parseInt(req.query.delay, 10) || getNumberBetween(500, 1500)
          );
        }
      }
    }
    next();
  });

  app.get('/yki/reset-mocks', (req, res) => {
    examSessions = getExamSessions();
    examDates = getExamDates();
    organizations = findByOids();

    registrations = {
      1: getRegistrations(),
      2: { participants: [] },
      3: { participants: [] },
    };
    organizers = [...initialOrganizers];
    res.send({ success: true });
  });

  app.get('/yki/api/virkailija/quarantine/matches', (req, res) => {
    const mockCall = () => {
      try {
        res.send(quarantineMatches);
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyGetCall(req, res) : mockCall();
  });

  app.get('/yki/api/virkailija/quarantine/reviews', (req, res) => {
    const mockCall = () => {
      try {
        res.send(quarantineReviews);
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyGetCall(req, res) : mockCall();
  });

  app.get('/yki/api/virkailija/quarantine', (req, res) => {
    const mockCall = () => {
      try {
        res.send(quarantines);
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyGetCall(req, res) : mockCall();
  });

  app.post('/yki/api/virkailija/quarantine', (req, res) => {
    const mockCall = () => {
      try {
        res.send({ organizers: organizers });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyPostCall(req, res) : mockCall();
  });

  app.put('/yki/api/virkailija/quarantine/:id', (req, res) => {
    const mockCall = () => {
      try {
        res.send({ organizers: organizers });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyPutCall(req, res) : mockCall();
  });

  app.delete('/yki/api/virkailija/quarantine/:id', (req, res) => {
    const mockCall = () => {
      try {
        res.send({ organizers: organizers });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyDeleteCall(req, res) : mockCall();
  });

  app.put(
    '/yki/api/virkailija/quarantine/:id/registration/:reg_id/set',
    (req, res) => {
      const mockCall = () => {
        try {
          res.send({ success: true });
        } catch (err) {
          printError(req, err);
          res.status(404).send(err.message);
        }
      };

      useLocalProxy ? proxyPutCall(req, res) : mockCall();
    }
  );

  app.get('/yki/api/virkailija/organizer', (req, res) => {
    const mockCall = () => {
      try {
        res.send({ organizers: organizers });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };

    useLocalProxy ? proxyGetCall(req, res) : mockCall();
  });

  app.post('/yki/api/virkailija/organizer', (req, res) => {
    const mockCall = () => {
      try {
        organizers.push(req.body);
        res.send({ success: true });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };

    useLocalProxy ? proxyPostCall(req, res) : mockCall();
  });

  app.get('/yki/api/virkailija/organizer/:oid/exam-session', (req, res) => {
    const mockCall = () => {
      try {
        res.send(examSessions);
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };

    useLocalProxy ? proxyGetCall(req, res) : mockCall();
  });

  app.get(
    '/yki/api/virkailija/organizer/:oid/exam-session/:id/registration',
    (req, res) => {
      const mockCall = () => {
        try {
          const { id } = req.params;
          res.send(registrations[id] || { participants: [] });
        } catch (err) {
          printError(req, err);
          res.status(404).send(err.message);
        }
      };
      useLocalProxy ? proxyGetCall(req, res) : mockCall();
    }
  );

  app.post('/yki/api/virkailija/organizer/:oid/exam-session', (req, res) => {
    const mockCall = () => {
      try {
        const id = getNumberBetween(1000, 100000);
        const examSession = req.body;
        const examDate = examDates.dates.find(
          (d) => d.exam_date === examSession.session_date
        );
        const backendData = {
          id: id,
          participants: 0,
          registration_start_date: examDate.registration_start_date,
          registration_end_date: examDate.registration_end_date,
          organizer_oid: req.params.oid,
        };
        examSessions.exam_sessions.push(
          Object.assign(examSession, backendData)
        );
        res.send({ id: id });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };

    useLocalProxy ? proxyPostCall(req, res) : mockCall();
  });

  app.post(
    '/yki/api/virkailija/organizer/:oid/exam-session/:id/post-admission',
    (req, res) => {
      try {
        const postadmission = req.body;
        const requestPostAdmissionId = req.params.id;
        const examSessionIndex = examSessions.exam_sessions.findIndex(
          (x) => x.id == requestPostAdmissionId
        );
        const examsSession = examSessions.exam_sessions[examSessionIndex];

        examsSession.post_admission_quota = postadmission.post_admission_quota;
        examsSession.post_admission_start_date =
          postadmission.post_admission_start_date;
        examsSession.post_admission_active =
          postadmission.post_admission_active;

        res.send({ success: true });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    }
  );

  app.post(
    '/yki/api/virkailija/organizer/:oid/exam-session/:id/post-admission/activation',
    (req, res) => {
      try {
        const postadmissionstate = req.body.post_admission_active;
        const requestPostAdmissionId = req.params.id;
        const examSessionIndex = examSessions.exam_sessions.findIndex(
          (x) => x.id == requestPostAdmissionId
        );
        const examsSession = examSessions.exam_sessions[examSessionIndex];

        examsSession.post_admission_active = postadmissionstate;

        res.send({ success: true });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    }
  );

  app.post(
    '/yki/api/virkailija/organizer/:oid/exam-session/:examSessionId/registration/:id/resendConfirmation',
    (req, res) => {
      try {
        res.send({ success: true });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    }
  );

  app.post(
    '/yki/api/virkailija/organizer/:oid/file',
    upload.single('file'),
    (req, res) => {
      try {
        const { oid } = req.params;
        const index = organizers.map((o) => o.oid).indexOf(oid);
        organizers[index].attachments = [
          {
            external_id: 'a0d5dfc2-4045-408e-8ee5-4fd1b74b2757',
            created: '2019-04-04T13:49:21.02436+03:00',
          },
        ];
        uploadedFile = req.file;
        res.send({ success: true });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    }
  );

  app.get('/yki/api/virkailija/organizer/:oid/file/:id', (req, res) => {
    try {
      res.set({
        'Content-Disposition':
          'attachment; filename=' + uploadedFile.originalname,
        'Content-Type': uploadedFile.mimetype,
      });
      res.send(uploadedFile.buffer);
    } catch (err) {
      res.status(404).send(err.message);
    }
  });

  app.put('/yki/api/virkailija/organizer/:oid/exam-session/:id', (req, res) => {
    const mockCall = () => {
      try {
        const { id } = req.params;
        const foundIndex = examSessions.exam_sessions.findIndex(
          (x) => x.id == id
        );
        examSessions.exam_sessions[foundIndex] = req.body;
        res.send({ success: true });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };

    useLocalProxy ? proxyPutCall(req, res) : mockCall();
  });

  app.delete(
    '/yki/api/virkailija/organizer/:oid/exam-session/:id',
    (req, res) => {
      const mockCall = () => {
        try {
          const { id } = req.params;
          const foundIndex = examSessions.exam_sessions.findIndex(
            (x) => x.id == id
          );
          examSessions.exam_sessions.splice(foundIndex, 1);
          res.send({ success: true });
        } catch (err) {
          printError(req, err);
          res.status(404).send(err.message);
        }
      };

      useLocalProxy ? proxyDeleteCall(req, res) : mockCall();
    }
  );

  app.post(
    '/yki/api/virkailija/organizer/:oid/exam-session/:id/post-admission/activate',
    (req, res) => {
      const mockCall = () => {
        try {
          const { id } = req.params;
          const index = examSessions.exam_sessions.findIndex((x) => x.id == id);
          examSessions.exam_sessions[index] = {
            ...examSessions.exam_sessions[index],
            ...req.body,
            post_admission_active: true,
          };
          res.send({ success: true });
        } catch (err) {
          printError(req, err);
          res.status(404).send(err.message);
        }
      };

      useLocalProxy ? proxyPostCall(req, res) : mockCall();
    }
  );

  app.post(
    '/yki/api/virkailija/organizer/:oid/exam-session/:id/post-admission/deactivate',
    (req, res) => {
      const mockCall = () => {
        try {
          const { id } = req.params;
          const index = examSessions.exam_sessions.findIndex((x) => x.id == id);
          examSessions.exam_sessions[index] = {
            ...examSessions.exam_sessions[index],
            post_admission_active: false,
          };
          res.send({ success: true });
        } catch (err) {
          printError(req, err);
          res.status(404).send(err.message);
        }
      };
      useLocalProxy ? proxyPostCall(req, res) : mockCall();
    }
  );

  app.delete(
    '/yki/api/virkailija/organizer/:oid/exam-session/:examSessionId/registration/:id',
    (req, res) => {
      try {
        const { id, examSessionId } = req.params;
        const foundIndex = registrations[examSessionId].participants.findIndex(
          (x) => x.registration_id == id
        );

        registrations[examSessionId].participants.splice(foundIndex, 1);
        res.send({ success: true });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    }
  );

  app.post(
    '/yki/api/virkailija/organizer/:oid/exam-session/:examSessionId/registration/:id/relocate',
    (req, res) => {
      const mockCall = () => {
        try {
          const { id, examSessionId } = req.params;
          const toId = req.body.to_exam_session_id;
          const foundIndex = registrations[
            examSessionId
          ].participants.findIndex((x) => x.registration_id == id);
          const reg = registrations[examSessionId].participants[foundIndex];
          registrations[toId].participants.push(reg);
          registrations[examSessionId].participants.splice(foundIndex, 1);
          res.send({ success: true });
        } catch (err) {
          printError(req, err);
          res.status(404).send(err.message);
        }
      };

      useLocalProxy ? proxyPostCall(req, res) : mockCall();
    }
  );

  app.post(
    '/yki/api/virkailija/organizer/:oid/exam-session/:examSessionId/registration/:id/confirm-payment',
    (req, res) => {
      const mockCall = () => {
        try {
          const { id } = req.params;
          const registration = registrations.participants.find(
            (x) => x.registration_id == id
          );
          registration.state = 'COMPLETED';
          res.send({ success: true });
        } catch (err) {
          res.status(404).send(err.message);
        }
      };

      useLocalProxy ? proxyPostCall(req, res) : mockCall();
    }
  );

  // need to proxy here because dev server bug: https://github.com/webpack/webpack-dev-server/issues/1440
  app.post(
    '/organisaatio-service/rest/organisaatio/v3/findbyoids',
    (req, res) => {
      const organisaatioServiceCall = () =>
        axios
          .post(
            'https://virkailija.untuvaopintopolku.fi/organisaatio-service/rest/organisaatio/v4/findbyoids',
            req.body
          )
          .then((response) => {
            res.send(response.data);
          })
          .catch((err) => {
            printError(req, err);
            res.status(404).send(err.message);
          });

      const mockCall = () => {
        try {
          res.send(organizations);
        } catch (err) {
          printError(req, err);
          res.status(404).send(err.message);
        }
      };
      useLocalProxy ? organisaatioServiceCall() : mockCall();
    }
  );

  app.put('/yki/api/virkailija/organizer/:oid', (req, res) => {
    try {
      const { oid } = req.params;
      const index = organizers.map((o) => o.oid).indexOf(oid);
      organizers[index] = req.body;
      res.send({ success: true });
    } catch (err) {
      printError(req, err);
      res.status(404).send('Organizer not found');
    }
  });

  app.delete('/yki/api/virkailija/organizer/:oid', (req, res) => {
    try {
      const { oid } = req.params;
      const index = organizers.map((o) => o.oid).indexOf(oid);
      organizers.splice(index, 1);
      res.send({ success: true });
    } catch (err) {
      printError(req, err);
      res.status(404).send('Organizer not found');
    }
  });

  app.get('/yki/api/virkailija/organizer/:oid/exam-date', (req, res) => {
    const mockCall = () => {
      try {
        const history = req.query.from;
        res.set('Content-Type', 'application/json; charset=utf-8');
        const futureExamDates = history
          ? examDates.dates
          : examDates.dates.filter((d) => {
              // return dayjs(d.registration_end_date).isSameOrAfter(dayjs());
              return dayjs(d.exam_date).isSameOrAfter(dayjs());
            });
        res.send({ dates: futureExamDates });
        // all exam dates
        // res.send({ dates: examDates.dates });
      } catch (err) {
        res.status(404).send(err.message);
      }
    };

    useLocalProxy ? proxyGetCall(req, res) : mockCall();
  });

  app.post('/yki/api/virkailija/organizer/:oid/exam-date', (req, res) => {
    const mockCall = () => {
      try {
        const id = getNumberBetween(100, 1000);
        examDates.dates.push({
          id,
          ...req.body,
        });
        res.send({ success: true });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyPostCall(req, res) : mockCall();
  });

  app.put('/yki/api/virkailija/organizer/:oid/exam-date/:id', (req, res) => {
    const mockCall = () => {
      try {
        const { id } = req.params;
        const index = examDates.dates.findIndex((x) => x.id == id);
        const { exam_session_count } = examDates.dates[index];

        examDates.dates[index] = {
          ...req.body,
          id,
          exam_session_count,
        };
        res.send({ success: true });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyPutCall(req, res) : mockCall();
  });

  app.post(
    '/yki/api/virkailija/organizer/:oid/exam-date/:id/evaluation',
    (req, res) => {
      const mockCall = () => {
        try {
          const { id } = req.params;
          const index = examDates.dates.findIndex((x) => x.id == id);
          examDates.dates[index] = {
            ...examDates.dates[index],
            ...req.body,
          };
          res.send({ success: true });
        } catch (err) {
          printError(req, err);
          res.status(404).send(err.message);
        }
      };
      useLocalProxy ? proxyPostCall(req, res) : mockCall();
    }
  );

  app.delete(
    '/yki/api/virkailija/organizer/:oid/exam-date/:id/',
    (req, res) => {
      const mockCall = () => {
        try {
          const { id } = req.params;
          const index = examDates.dates.findIndex((x) => x.id == id);
          examDates.dates.splice(index, 1);
          res.send({ success: true });
        } catch (err) {
          printError(req, err);
          res.status(404).send(err.message);
        }
      };
      useLocalProxy ? proxyDeleteCall(req, res) : mockCall();
    }
  );

  app.get('/yki/api/exam-date', (req, res) => {
    const mockCall = () => {
      try {
        res.set('Content-Type', 'application/json; charset=utf-8');
        const futureExamDates = examDates.dates.filter((d) => {
          // return dayjs(d.registration_end_date).isSameOrAfter(dayjs());
          return dayjs(d.exam_date).isSameOrAfter(dayjs());
        });
        res.send({ dates: futureExamDates });
        // all exam dates
        // res.send({ dates: examDates.dates });
      } catch (err) {
        res.status(404).send(err.message);
      }
    };

    useLocalProxy ? proxyGetCall(req, res) : mockCall();
  });

  app.get(
    '/yki/api/virkailija/organizer/:oid/exam-session/history',
    (req, res) => {
      try {
        res.set('Content-Type', 'application/json; charset=utf-8');
        const pastExamDates = examDates.dates.filter((d) => {
          // return dayjs(d.registration_end_date).isSameOrBefore(dayjs());
          return dayjs(d.exam_date).isSameOrBefore(dayjs());
        });
        res.send({ dates: pastExamDates });
      } catch (err) {
        res.status(404).send(err.message);
      }
    }
  );

  app.get('/yki/api/user/identity', (req, res) => {
    try {
      res.set('Content-Type', 'application/json; charset=utf-8');
      res.send(suomiFiAuthenticatedUser);
    } catch (err) {
      printError(req, err);
      res.status(404).send(err.message);
    }
  });

  app.get('/yki/api/user/open-registrations', (req, res) => {
    try {
      res.set('Content-Type', 'application/json; charset=utf-8');
      res.send({ open_registrations: [ { exam_session_id: 25, expires_at: '2200-01-01' }]});
    } catch (err) {
      printError(req, err);
      res.status(404).send(err.message);
    }
  });

  app.post('/yki/api/login-link', (req, res) => {
    const mockCall = () => {
      try {
        res.send({ success: true });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyPostCall(req, res) : mockCall();
  });

  app.post('/yki/api/registration/init', (req, res) => {
    const mockCall = () => {
      try {
        switch (req.body.exam_session_id) {
          case 11:
            res.status(409).send({ error: { registered: true } });
          case 12:
            res.status(409).send({ error: { full: true } });
          case 13:
            res.status(409).send({ error: { closed: true } });
          // This error case shouldn't ordinarily happen
          case 14:
            res.status(409).send({ error: { full: false, registered: false } });
          case 16:
            res.status(401).send("Unauthorized");
          default:
            req.body.exam_session_id % 2 === 0
              ? res.send(initRegistrationEmailAuth)
              : res.send(initRegistration);
        }
      } catch (err) {
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyPostCall(req, res) : mockCall();
  });

  app.get('/yki/api/exam-session', (req, res) => {
    const mockCall = () => {
      console.log('mocking exam-session');
      try {
        res.set('Content-Type', 'application/json; charset=utf-8');
        const monthFromNow = dayjs().add(1, 'months').format('YYYY-MM-DD');
        const twoMonthFromNow = dayjs().add(2, 'months').format('YYYY-MM-DD');
        const weekInPast = dayjs().subtract(1, 'weeks').format('YYYY-MM-DD');
        const weekFromNow = dayjs().add(1, 'weeks').format('YYYY-MM-DD');
        const weekAndOneDayFromNow = dayjs()
          .add(1, 'weeks')
          .add(1, 'days')
          .format('YYYY-MM-DD');
        const monthMinusThreeDaysPast = dayjs()
          .add(1, 'months')
          .subtract(3, 'days')
          .format('YYYY-MM-DD');

        allExamSessions.exam_sessions.forEach((es) => {
          if (es.session_date === '2019-04-06') {
            es.session_date = monthFromNow;
            es.registration_start_date = weekInPast;
            es.registration_end_date = weekFromNow;
            es.post_admission_start_date = weekAndOneDayFromNow;
            es.post_admission_end_date = monthMinusThreeDaysPast;
          }
          if (es.session_date === '2019-05-26') {
            es.session_date = twoMonthFromNow;
          }

          // postadmission active
          if (es.session_date === '2039-12-29') {
            const yesterday = dayjs().subtract(1, 'days').format('YYYY-MM-DD');
            const today = dayjs().format('YYYY-MM-DD');

            es.session_date = monthFromNow;
            es.registration_start_date = monthMinusThreeDaysPast;
            es.registration_end_date = yesterday;
            es.post_admission_start_date = today;
            es.post_admission_end_date = weekFromNow;
          }
        });
        res.send(allExamSessions);
      } catch (err) {
        res.status(404).send(err.message);
      }
    };

    useLocalProxy ? proxyGetCall(req, res) : mockCall();
  });

  app.get('/yki/api/exam-session/:id', (req, res) => {
    const mockCall = () => {
      try {
        const session = allExamSessions.exam_sessions.find(
          (e) => e.id === Number(req.params.id)
        );
        res.set('Content-Type', 'application/json; charset=utf-8');
        if (session) {
          res.send(session);
        } else {
          res.status(404).send('Exam session not found');
        }
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyGetCall(req, res) : mockCall();
  });

  app.post('/yki/api/exam-session/:id/queue', (req, res) => {
    const mockCall = () => {
      try {
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.send({ success: true });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyPostCall(req, res) : mockCall();
  });

  app.post('/yki/api/registration/:id/submit', (req, res) => {
    const mockCall = () => {
      try {
        res.send({ success: true });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyPostCall(req, res) : mockCall();
  });

  app.get('/yki/api/code/maatjavaltiot2', (req, res) => {
    const mockCall = () => {
      try {
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.send(countries);
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyGetCall(req, res) : mockCall();
  });

  app.get('/yki/api/code/sukupuoli', (req, res) => {
    const mockCall = () => {
      try {
        res.set('Content-Type', 'application/json; charset=utf-8');
        res.send(genders);
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyGetCall(req, res) : mockCall();
  });

  app.get('/yki/api/code/posti/:id', (req, res) => {
    try {
      axios
        .get(
          `https://virkailija.untuvaopintopolku.fi/yki/api/code/posti/${req.params.id}`,
          req.body
        )
        .then((response) => {
          res.send(response.data);
        })
        .catch((err) => {
          printError(req, err);
          res.status(404).send(err.message);
        });
    } catch (err) {
      res.status(404).send(err.message);
    }
  });

  app.get('/yki/api/evaluation', (req, res) => {
    const mockCall = () => {
      try {
        res.send(evaluationPeriods);
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyGetCall(req, res) : mockCall();
  });

  app.get('/yki/api/evaluation/:id', (req, res) => {
    const mockCall = () => {
      try {
        evaluationPeriod = evaluationPeriods.evaluation_periods.find(
          (ep) => ep.id === req.params.id
        );
        if (evaluationPeriod) {
          res.send(evaluationPeriod);
        } else {
          res.status(404).send();
        }
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyGetCall(req, res) : mockCall();
  });

  app.get('/yki/api/evaluation/order/:id', (req, res) => {
    const mockCall = () => {
      try {
        res.send(evaluationOrder);
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyGetCall(req, res) : mockCall();
  });

  app.post('/yki/api/evaluation/:id/order', (req, res) => {
    const mockCall = () => {
      try {
        res.send({ success: true });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyPostCall(req, res) : mockCall();
  });

  app.get('/yki/api/payment/v2/paytrail/:lang/success', (req, res) => {
    const mockCall = () => {
      try {
        // eslint-disable-next-line no-console
        console.log('paytrail payment success callback invoked');
        res.send({ success: true });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyGetCall(req, res) : mockCall();
  });

  app.get('/yki/api/payment/v2/paytrail/:lang/error', (req, res) => {
    const mockCall = () => {
      try {
        // eslint-disable-next-line no-console
        console.log('paytrail payment error callback invoked');
        res.send({ success: true });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyGetCall(req, res) : mockCall();
  });

  app.get('/yki/api/payment/v2/:id/redirect', (req, res) => {
    const mockCall = () => {
      try {
        // eslint-disable-next-line no-console
        console.log('payment redirect callback invoked');
        res.send({ success: true });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyGetCall(req, res) : mockCall();
  });

  app.get('/yki/api/evaluation-payment/v2/:id/redirect', (req, res) => {
    const mockCall = () => {
      try {
        // eslint-disable-next-line no-console
        console.log('paytrail evaluation payment redirect callback invoked');
        res.send({ success: true });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyGetCall(req, res) : mockCall();
  });

  app.get('/yki/api/payment/v2/report', (req, res) => {
    const mockCall = () => {
      try {
        res.send(paymentsReport);
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyGetCall(req, res) : mockCall();
  });

  app.get('/yki/auth/', (req, res) => {
    const mockCall = () => {
      try {
        const { examSessionId } = req.query;
        res.redirect(
          `/yki/ilmoittautuminen/tutkintotilaisuus/${examSessionId}`
        );
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyGetCall(req, res) : mockCall();
  });

  app.get('/yki/auth/logout', (req, res) => {
    const mockCall = () => {
      try {
        const { redirect } = req.query;
        res.redirect(redirect);
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyGetCall(req, res) : mockCall();
  })

  app.delete('/yki/api/registration/:id', (req, res) => {
    const mockCall = () => {
      try {
        res.send({ success: true });
      } catch (err) {
        printError(req, err);
        res.status(404).send(err.message);
      }
    };
    useLocalProxy ? proxyPostCall(req, res) : mockCall();
  });
};
