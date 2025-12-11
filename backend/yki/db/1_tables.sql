--
-- PostgreSQL database dump
--

\restrict uiMPSsr7djeIpTEAIWWF9EL1CXTawwdpqO9lFiAemj5MFxv1etPmTOfxo4Wi24d

-- Dumped from database version 10.4 (Debian 10.4-2.pgdg90+1)
-- Dumped by pg_dump version 15.14 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: public; Type: SCHEMA; Schema: -; Owner: postgres
--

-- *not* creating schema, since initdb creates it


ALTER SCHEMA public OWNER TO postgres;

--
-- Name: gender_code; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.gender_code AS ENUM (
    'M',
    'N',
    'E'
);


ALTER TYPE public.gender_code OWNER TO admin;

--
-- Name: login_link_type; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.login_link_type AS ENUM (
    'LOGIN',
    'REGISTRATION',
    'PAYMENT',
    'PERSON'
);


ALTER TYPE public.login_link_type OWNER TO admin;

--
-- Name: payment_state; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.payment_state AS ENUM (
    'PAID',
    'UNPAID',
    'ERROR'
);


ALTER TYPE public.payment_state OWNER TO admin;

--
-- Name: registration_kind; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.registration_kind AS ENUM (
    'ADMISSION',
    'POST_ADMISSION',
    'OTHER',
    'QUEUE'
);


ALTER TYPE public.registration_kind OWNER TO admin;

--
-- Name: registration_state; Type: TYPE; Schema: public; Owner: admin
--

CREATE TYPE public.registration_state AS ENUM (
    'COMPLETED',
    'SUBMITTED',
    'STARTED',
    'EXPIRED',
    'CANCELLED',
    'PAID_AND_CANCELLED'
);


ALTER TYPE public.registration_state OWNER TO admin;

--
-- Name: at_midnight(date); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.at_midnight(date) RETURNS timestamp with time zone
    LANGUAGE sql
    AS $_$
  SELECT (date_trunc('day', $1 AT TIME ZONE 'Europe/Helsinki') + interval '1 day') AT TIME ZONE 'Europe/Helsinki';
$_$;


ALTER FUNCTION public.at_midnight(date) OWNER TO admin;

--
-- Name: error_if_exceeds_participant_limit(); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.error_if_exceeds_participant_limit() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    actual_kind TEXT := (
        select_registration_kind(NEW.exam_session_id)
    );
BEGIN
    IF NEW.kind = 'QUEUE' AND actual_kind = 'ADMISSION' THEN
        RAISE EXCEPTION 'registration to queue is not available';
    ELSIF NEW.kind = 'ADMISSION' AND actual_kind = 'QUEUE' THEN
        RAISE EXCEPTION 'max_participants of exam_session exceeded.';
    ELSE
        RETURN NEW;
    END IF;
END;
$$;


ALTER FUNCTION public.error_if_exceeds_participant_limit() OWNER TO admin;

--
-- Name: error_if_reviewed_quarantine_is_deleted(); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.error_if_reviewed_quarantine_is_deleted() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
DECLARE
    existing_quarantine NUMERIC := (
        SELECT count(*) FROM quarantine
        WHERE id = NEW.quarantine_id
        AND deleted_at IS NULL
    );
BEGIN
    IF existing_quarantine > 0 THEN
        RETURN NEW;
    ELSE
        RAISE EXCEPTION 'Reviewed quarantine non-existing or deleted';
    END IF;
END;
$$;


ALTER FUNCTION public.error_if_reviewed_quarantine_is_deleted() OWNER TO admin;

--
-- Name: evaluation_period_open(bigint, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.evaluation_period_open(id bigint, at_point_in_time timestamp with time zone DEFAULT now()) RETURNS SETOF boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY SELECT EXISTS (
                     SELECT eva.id
                       FROM evaluation eva
                      WHERE eva.id = evaluation_period_open.id
                        AND within_dt_range(at_point_in_time, eva.evaluation_start_date, eva.evaluation_end_date)
                 ) as exists;
END;
$$;


ALTER FUNCTION public.evaluation_period_open(id bigint, at_point_in_time timestamp with time zone) OWNER TO admin;

--
-- Name: exam_session_post_registration_open(bigint, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.exam_session_post_registration_open(exam_date_id bigint, at_point_in_time timestamp with time zone DEFAULT now()) RETURNS SETOF boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY SELECT EXISTS (
                     SELECT es.id
                       FROM exam_session es
                 INNER JOIN exam_date ed ON es.exam_date_id = ed.id
                      WHERE es.id = exam_session_post_registration_open.exam_date_id
                        AND es.post_admission_active = TRUE
                        AND within_dt_range(at_point_in_time, ed.post_admission_start_date, ed.post_admission_end_date)
                 ) as exists;
END;
$$;


ALTER FUNCTION public.exam_session_post_registration_open(exam_date_id bigint, at_point_in_time timestamp with time zone) OWNER TO admin;

--
-- Name: exam_session_registration_open(bigint, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.exam_session_registration_open(exam_date_id bigint, at_point_in_time timestamp with time zone DEFAULT now()) RETURNS SETOF boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY SELECT EXISTS (
                     SELECT es.id
                       FROM exam_session es
                 INNER JOIN exam_date ed ON es.exam_date_id = ed.id
                      WHERE es.id = exam_session_registration_open.exam_date_id
                        AND within_dt_range(at_point_in_time, ed.registration_start_date, ed.registration_end_date)
                 ) as exists;
END;
$$;


ALTER FUNCTION public.exam_session_registration_open(exam_date_id bigint, at_point_in_time timestamp with time zone) OWNER TO admin;

--
-- Name: is_cancellable(bigint); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.is_cancellable(registration_id bigint) RETURNS SETOF boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY SELECT EXISTS
                            (SELECT r.id
                             FROM registration r
                             WHERE r.id = registration_id
                               AND r.state IN ('STARTED', 'SUBMITTED', 'COMPLETED')
                               AND current_timestamp < select_registration_modification_dl(r.id));
END;
$$;


ALTER FUNCTION public.is_cancellable(registration_id bigint) OWNER TO admin;

--
-- Name: is_transferable(bigint); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.is_transferable(registration_id bigint) RETURNS SETOF boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN QUERY SELECT EXISTS
                            (SELECT r.id
                             FROM registration r
                             WHERE r.id = registration_id
                               AND r.is_transfered = FALSE
                               AND r.state = 'COMPLETED'
                               AND current_timestamp < select_registration_modification_dl(r.id));
END;
$$;


ALTER FUNCTION public.is_transferable(registration_id bigint) OWNER TO admin;

--
-- Name: select_registration_kind(bigint); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.select_registration_kind(eid bigint) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    registration_kind record;
BEGIN
    SELECT INTO "registration_kind"
        (SELECT COUNT(*) FROM registration r WHERE r.exam_session_id = eid AND r.kind = 'QUEUE' AND r.state IN ('STARTED','SUBMITTED')) AS queue_count,
        (SELECT COUNT(*) FROM registration r WHERE r.exam_session_id = eid AND r.kind = 'ADMISSION' AND r.state IN ('STARTED','SUBMITTED','COMPLETED')) AS participants_count,
        max_participants
    FROM "exam_session" es
    WHERE es."id" = eid;

    IF registration_kind.queue_count > 0 THEN
        RETURN 'QUEUE';
    ELSIF registration_kind.participants_count >= registration_kind.max_participants THEN
        RETURN 'QUEUE';
    ELSE
        RETURN 'ADMISSION';
    END IF;
END;
$$;


ALTER FUNCTION public.select_registration_kind(eid bigint) OWNER TO admin;

--
-- Name: select_registration_modification_dl(bigint); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.select_registration_modification_dl(registration_id bigint) RETURNS timestamp with time zone
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (SELECT ed.exam_date + interval '8 h'
            FROM registration r
            INNER JOIN exam_session es ON r.exam_session_id = es.id
            INNER JOIN exam_date ed ON es.exam_date_id = ed.id
            WHERE r.id=registration_id)
        AT TIME ZONE 'Europe/Helsinki';
END;
$$;


ALTER FUNCTION public.select_registration_modification_dl(registration_id bigint) OWNER TO admin;

--
-- Name: select_registration_phase(bigint, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.select_registration_phase(exam_session_id bigint, at_point_in_time timestamp with time zone DEFAULT now()) RETURNS text
    LANGUAGE plpgsql
    AS $$
DECLARE
    registration_phase record;
BEGIN
    SELECT INTO "registration_phase"
        (SELECT * FROM exam_session_registration_open(exam_session_id, at_point_in_time)) AS admission_active,
        (SELECT * FROM exam_session_post_registration_open(exam_session_id, at_point_in_time)) AS post_admission_active
      FROM "exam_session" es
 LEFT JOIN "exam_date" "ed" ON es."exam_date_id" = "ed"."id"
     WHERE es."id" = exam_session_id;

    IF registration_phase.admission_active THEN
        RETURN 'ADMISSION';
    ELSIF registration_phase."post_admission_active" THEN
        RETURN 'POST_ADMISSION';
    ELSE
        RETURN 'OTHER';
    END IF;
END;
$$;


ALTER FUNCTION public.select_registration_phase(exam_session_id bigint, at_point_in_time timestamp with time zone) OWNER TO admin;

--
-- Name: ts_older_than(timestamp with time zone, interval); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.ts_older_than(ts timestamp with time zone, since interval) RETURNS boolean
    LANGUAGE sql
    AS $$
    SELECT (date_trunc('day', ts) + since) AT TIME ZONE 'Europe/Helsinki' < (current_timestamp AT TIME ZONE 'Europe/Helsinki');
$$;


ALTER FUNCTION public.ts_older_than(ts timestamp with time zone, since interval) OWNER TO admin;

--
-- Name: within_dt_range(timestamp with time zone, timestamp with time zone, timestamp with time zone); Type: FUNCTION; Schema: public; Owner: admin
--

CREATE FUNCTION public.within_dt_range(tz timestamp with time zone, after timestamp with time zone, before timestamp with time zone) RETURNS boolean
    LANGUAGE plpgsql
    AS $$
BEGIN
    RETURN (after IS NOT NULL AND before IS NOT NULL)
       AND (date_trunc('day', (after AT TIME ZONE 'Europe/Helsinki')) + time '10:00') <= tz AT TIME ZONE 'Europe/Helsinki'
       AND (date_trunc('day', (before AT TIME ZONE 'Europe/Helsinki')) + time '16:00') > tz AT TIME ZONE 'Europe/Helsinki';
END;
$$;


ALTER FUNCTION public.within_dt_range(tz timestamp with time zone, after timestamp with time zone, before timestamp with time zone) OWNER TO admin;

SET default_tablespace = '';

--
-- Name: cas_oppija_ticketstore; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.cas_oppija_ticketstore (
    ticket text NOT NULL,
    logged_in timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cas_oppija_ticketstore OWNER TO admin;

--
-- Name: cas_ticketstore; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.cas_ticketstore (
    ticket text NOT NULL,
    logged_in timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.cas_ticketstore OWNER TO admin;

--
-- Name: contact; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.contact (
    id bigint NOT NULL,
    organizer_id bigint NOT NULL,
    name text,
    email text,
    phone_number text,
    deleted_at timestamp with time zone,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    modified timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.contact OWNER TO admin;

--
-- Name: contact_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.contact_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.contact_id_seq OWNER TO admin;

--
-- Name: contact_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.contact_id_seq OWNED BY public.contact.id;


--
-- Name: contact_organizer_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.contact_organizer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.contact_organizer_id_seq OWNER TO admin;

--
-- Name: contact_organizer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.contact_organizer_id_seq OWNED BY public.contact.organizer_id;


--
-- Name: databasechangelog; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.databasechangelog (
    id character varying(255) NOT NULL,
    author character varying(255) NOT NULL,
    filename character varying(255) NOT NULL,
    dateexecuted timestamp without time zone NOT NULL,
    orderexecuted integer NOT NULL,
    exectype character varying(10) NOT NULL,
    md5sum character varying(35),
    description character varying(255),
    comments character varying(255),
    tag character varying(255),
    liquibase character varying(20),
    contexts character varying(255),
    labels character varying(255),
    deployment_id character varying(10)
);


ALTER TABLE public.databasechangelog OWNER TO admin;

--
-- Name: databasechangeloglock; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.databasechangeloglock (
    id integer NOT NULL,
    locked boolean NOT NULL,
    lockgranted timestamp without time zone,
    lockedby character varying(255)
);


ALTER TABLE public.databasechangeloglock OWNER TO admin;

--
-- Name: evaluation; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.evaluation (
    id bigint NOT NULL,
    exam_date_id bigint NOT NULL,
    exam_date_language_id bigint NOT NULL,
    evaluation_start_date date NOT NULL,
    evaluation_end_date date NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.evaluation OWNER TO admin;

--
-- Name: evaluation_exam_date_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.evaluation_exam_date_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.evaluation_exam_date_id_seq OWNER TO admin;

--
-- Name: evaluation_exam_date_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.evaluation_exam_date_id_seq OWNED BY public.evaluation.exam_date_id;


--
-- Name: evaluation_exam_date_language_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.evaluation_exam_date_language_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.evaluation_exam_date_language_id_seq OWNER TO admin;

--
-- Name: evaluation_exam_date_language_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.evaluation_exam_date_language_id_seq OWNED BY public.evaluation.exam_date_language_id;


--
-- Name: evaluation_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.evaluation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.evaluation_id_seq OWNER TO admin;

--
-- Name: evaluation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.evaluation_id_seq OWNED BY public.evaluation.id;


--
-- Name: evaluation_order; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.evaluation_order (
    id bigint NOT NULL,
    evaluation_id bigint NOT NULL,
    first_names text NOT NULL,
    last_name text NOT NULL,
    email text,
    birthdate text,
    extra text,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);


ALTER TABLE public.evaluation_order OWNER TO admin;

--
-- Name: evaluation_order_evaluation_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.evaluation_order_evaluation_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.evaluation_order_evaluation_id_seq OWNER TO admin;

--
-- Name: evaluation_order_evaluation_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.evaluation_order_evaluation_id_seq OWNED BY public.evaluation_order.evaluation_id;


--
-- Name: evaluation_order_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.evaluation_order_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.evaluation_order_id_seq OWNER TO admin;

--
-- Name: evaluation_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.evaluation_order_id_seq OWNED BY public.evaluation_order.id;


--
-- Name: evaluation_order_subtest; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.evaluation_order_subtest (
    id bigint NOT NULL,
    evaluation_order_id bigint NOT NULL,
    subtest text NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);


ALTER TABLE public.evaluation_order_subtest OWNER TO admin;

--
-- Name: evaluation_order_subtest_evaluation_order_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.evaluation_order_subtest_evaluation_order_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.evaluation_order_subtest_evaluation_order_id_seq OWNER TO admin;

--
-- Name: evaluation_order_subtest_evaluation_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.evaluation_order_subtest_evaluation_order_id_seq OWNED BY public.evaluation_order_subtest.evaluation_order_id;


--
-- Name: evaluation_order_subtest_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.evaluation_order_subtest_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.evaluation_order_subtest_id_seq OWNER TO admin;

--
-- Name: evaluation_order_subtest_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.evaluation_order_subtest_id_seq OWNED BY public.evaluation_order_subtest.id;


--
-- Name: evaluation_payment; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.evaluation_payment (
    id bigint NOT NULL,
    state public.payment_state NOT NULL,
    evaluation_order_id bigint NOT NULL,
    amount numeric NOT NULL,
    lang character(2) NOT NULL,
    reference_number numeric,
    order_number text NOT NULL,
    external_payment_id text,
    payment_method text,
    payed_at timestamp with time zone,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    modified timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.evaluation_payment OWNER TO admin;

--
-- Name: evaluation_payment_config; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.evaluation_payment_config (
    id integer NOT NULL,
    merchant_id integer,
    merchant_secret text,
    email text,
    test_mode boolean DEFAULT false
);


ALTER TABLE public.evaluation_payment_config OWNER TO admin;

--
-- Name: evaluation_payment_evaluation_order_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.evaluation_payment_evaluation_order_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.evaluation_payment_evaluation_order_id_seq OWNER TO admin;

--
-- Name: evaluation_payment_evaluation_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.evaluation_payment_evaluation_order_id_seq OWNED BY public.evaluation_payment.evaluation_order_id;


--
-- Name: evaluation_payment_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.evaluation_payment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.evaluation_payment_id_seq OWNER TO admin;

--
-- Name: evaluation_payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.evaluation_payment_id_seq OWNED BY public.evaluation_payment.id;


--
-- Name: evaluation_payment_new; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.evaluation_payment_new (
    id bigint NOT NULL,
    state public.payment_state NOT NULL,
    evaluation_order_id bigint NOT NULL,
    amount numeric NOT NULL,
    reference text NOT NULL,
    transaction_id text NOT NULL,
    href text NOT NULL,
    paid_at timestamp with time zone,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    modified timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.evaluation_payment_new OWNER TO admin;

--
-- Name: evaluation_payment_new_evaluation_order_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.evaluation_payment_new_evaluation_order_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.evaluation_payment_new_evaluation_order_id_seq OWNER TO admin;

--
-- Name: evaluation_payment_new_evaluation_order_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.evaluation_payment_new_evaluation_order_id_seq OWNED BY public.evaluation_payment_new.evaluation_order_id;


--
-- Name: evaluation_payment_new_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.evaluation_payment_new_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.evaluation_payment_new_id_seq OWNER TO admin;

--
-- Name: evaluation_payment_new_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.evaluation_payment_new_id_seq OWNED BY public.evaluation_payment_new.id;


--
-- Name: evaluation_payment_order_number_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.evaluation_payment_order_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.evaluation_payment_order_number_seq OWNER TO admin;

--
-- Name: exam_date; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.exam_date (
    id bigint NOT NULL,
    exam_date date NOT NULL,
    registration_start_date date NOT NULL,
    registration_end_date date NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    modified timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    post_admission_end_date date,
    post_admission_start_date date,
    post_admission_enabled boolean DEFAULT false,
    deleted_at timestamp with time zone
);


ALTER TABLE public.exam_date OWNER TO admin;

--
-- Name: exam_date_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.exam_date_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.exam_date_id_seq OWNER TO admin;

--
-- Name: exam_date_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.exam_date_id_seq OWNED BY public.exam_date.id;


--
-- Name: exam_date_language; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.exam_date_language (
    id bigint NOT NULL,
    exam_date_id bigint NOT NULL,
    language_code character(3) NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    level_code text DEFAULT 'PERUS'::text,
    deleted_at timestamp with time zone
);


ALTER TABLE public.exam_date_language OWNER TO admin;

--
-- Name: exam_date_language_exam_date_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.exam_date_language_exam_date_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.exam_date_language_exam_date_id_seq OWNER TO admin;

--
-- Name: exam_date_language_exam_date_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.exam_date_language_exam_date_id_seq OWNED BY public.exam_date_language.exam_date_id;


--
-- Name: exam_date_language_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.exam_date_language_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.exam_date_language_id_seq OWNER TO admin;

--
-- Name: exam_date_language_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.exam_date_language_id_seq OWNED BY public.exam_date_language.id;


--
-- Name: exam_language; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.exam_language (
    id bigint NOT NULL,
    language_code character(3) NOT NULL,
    level_code text NOT NULL,
    organizer_id bigint NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.exam_language OWNER TO admin;

--
-- Name: exam_language_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.exam_language_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.exam_language_id_seq OWNER TO admin;

--
-- Name: exam_language_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.exam_language_id_seq OWNED BY public.exam_language.id;


--
-- Name: exam_language_organizer_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.exam_language_organizer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.exam_language_organizer_id_seq OWNER TO admin;

--
-- Name: exam_language_organizer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.exam_language_organizer_id_seq OWNED BY public.exam_language.organizer_id;


--
-- Name: exam_level; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.exam_level (
    code text NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.exam_level OWNER TO admin;

--
-- Name: exam_payment_new; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.exam_payment_new (
    id bigint NOT NULL,
    state public.payment_state NOT NULL,
    registration_id bigint NOT NULL,
    amount numeric NOT NULL,
    reference text NOT NULL,
    transaction_id text NOT NULL,
    href text NOT NULL,
    paid_at timestamp with time zone,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    modified timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.exam_payment_new OWNER TO admin;

--
-- Name: exam_payment_new_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.exam_payment_new_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.exam_payment_new_id_seq OWNER TO admin;

--
-- Name: exam_payment_new_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.exam_payment_new_id_seq OWNED BY public.exam_payment_new.id;


--
-- Name: exam_payment_new_registration_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.exam_payment_new_registration_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.exam_payment_new_registration_id_seq OWNER TO admin;

--
-- Name: exam_payment_new_registration_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.exam_payment_new_registration_id_seq OWNED BY public.exam_payment_new.registration_id;


--
-- Name: exam_session; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.exam_session (
    id bigint NOT NULL,
    organizer_id bigint NOT NULL,
    language_code character(3) NOT NULL,
    level_code text NOT NULL,
    exam_date_id bigint NOT NULL,
    max_participants integer NOT NULL,
    office_oid text,
    published_at timestamp with time zone,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    modified timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    post_admission_start_date date,
    post_admission_active boolean DEFAULT false,
    post_admission_quota bigint,
    post_admission_activated_at date
);


ALTER TABLE public.exam_session OWNER TO admin;

--
-- Name: exam_session_contact; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.exam_session_contact (
    id bigint NOT NULL,
    exam_session_id bigint NOT NULL,
    contact_id bigint NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    deleted_at timestamp with time zone
);


ALTER TABLE public.exam_session_contact OWNER TO admin;

--
-- Name: exam_session_contact_contact_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.exam_session_contact_contact_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.exam_session_contact_contact_id_seq OWNER TO admin;

--
-- Name: exam_session_contact_contact_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.exam_session_contact_contact_id_seq OWNED BY public.exam_session_contact.contact_id;


--
-- Name: exam_session_contact_exam_session_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.exam_session_contact_exam_session_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.exam_session_contact_exam_session_id_seq OWNER TO admin;

--
-- Name: exam_session_contact_exam_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.exam_session_contact_exam_session_id_seq OWNED BY public.exam_session_contact.exam_session_id;


--
-- Name: exam_session_contact_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.exam_session_contact_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.exam_session_contact_id_seq OWNER TO admin;

--
-- Name: exam_session_contact_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.exam_session_contact_id_seq OWNED BY public.exam_session_contact.id;


--
-- Name: exam_session_exam_date_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.exam_session_exam_date_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.exam_session_exam_date_id_seq OWNER TO admin;

--
-- Name: exam_session_exam_date_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.exam_session_exam_date_id_seq OWNED BY public.exam_session.exam_date_id;


--
-- Name: exam_session_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.exam_session_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.exam_session_id_seq OWNER TO admin;

--
-- Name: exam_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.exam_session_id_seq OWNED BY public.exam_session.id;


--
-- Name: exam_session_location; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.exam_session_location (
    id bigint NOT NULL,
    name text NOT NULL,
    street_address text NOT NULL,
    post_office text NOT NULL,
    zip text NOT NULL,
    other_location_info text,
    extra_information text,
    lang character(2) NOT NULL,
    exam_session_id bigint NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.exam_session_location OWNER TO admin;

--
-- Name: exam_session_location_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.exam_session_location_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.exam_session_location_id_seq OWNER TO admin;

--
-- Name: exam_session_location_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.exam_session_location_id_seq OWNED BY public.exam_session_location.id;


--
-- Name: exam_session_organizer_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.exam_session_organizer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.exam_session_organizer_id_seq OWNER TO admin;

--
-- Name: exam_session_organizer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.exam_session_organizer_id_seq OWNED BY public.exam_session.organizer_id;


--
-- Name: exam_session_queue; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.exam_session_queue (
    id bigint NOT NULL,
    email text NOT NULL,
    lang character(2) NOT NULL,
    exam_session_id bigint NOT NULL,
    last_notified_at timestamp with time zone,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.exam_session_queue OWNER TO admin;

--
-- Name: exam_session_queue_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.exam_session_queue_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.exam_session_queue_id_seq OWNER TO admin;

--
-- Name: exam_session_queue_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.exam_session_queue_id_seq OWNED BY public.exam_session_queue.id;


--
-- Name: free_registration; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.free_registration (
    free_registration_id bigint NOT NULL,
    source character varying(255) NOT NULL,
    type character varying(255) NOT NULL,
    matriculation_exam boolean NOT NULL,
    higher_education_concluded boolean NOT NULL,
    higher_education_enrolled boolean NOT NULL,
    eb boolean NOT NULL,
    dia boolean NOT NULL,
    other boolean NOT NULL,
    registration_id bigint NOT NULL,
    is_foreign boolean,
    version integer DEFAULT 0 NOT NULL,
    created_by text,
    modified_by text,
    deleted_by text,
    created_at timestamp with time zone DEFAULT now() NOT NULL,
    modified_at timestamp with time zone DEFAULT now() NOT NULL,
    deleted_at timestamp with time zone
);


ALTER TABLE public.free_registration OWNER TO admin;

--
-- Name: free_registration_free_registration_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

ALTER TABLE public.free_registration ALTER COLUMN free_registration_id ADD GENERATED BY DEFAULT AS IDENTITY (
    SEQUENCE NAME public.free_registration_free_registration_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1
);


--
-- Name: free_registration_registration_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.free_registration_registration_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.free_registration_registration_id_seq OWNER TO admin;

--
-- Name: free_registration_registration_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.free_registration_registration_id_seq OWNED BY public.free_registration.registration_id;


--
-- Name: language; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.language (
    code character(3) NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.language OWNER TO admin;

--
-- Name: login_link; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.login_link (
    id bigint NOT NULL,
    code text NOT NULL,
    participant_id bigint NOT NULL,
    exam_session_id bigint,
    registration_id bigint,
    type public.login_link_type NOT NULL,
    expired_link_redirect text NOT NULL,
    success_redirect text NOT NULL,
    expires_at timestamp with time zone NOT NULL,
    user_data jsonb,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    modified timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.login_link OWNER TO admin;

--
-- Name: login_link_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.login_link_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.login_link_id_seq OWNER TO admin;

--
-- Name: login_link_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.login_link_id_seq OWNED BY public.login_link.id;


--
-- Name: login_link_participant_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.login_link_participant_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.login_link_participant_id_seq OWNER TO admin;

--
-- Name: login_link_participant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.login_link_participant_id_seq OWNED BY public.login_link.participant_id;


--
-- Name: organizer; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.organizer (
    id bigint NOT NULL,
    oid text NOT NULL,
    agreement_start_date date NOT NULL,
    agreement_end_date date NOT NULL,
    contact_name text,
    contact_email text,
    contact_phone_number text,
    extra text,
    deleted_at timestamp with time zone,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    modified timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.organizer OWNER TO admin;

--
-- Name: organizer_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.organizer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.organizer_id_seq OWNER TO admin;

--
-- Name: organizer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.organizer_id_seq OWNED BY public.organizer.id;


--
-- Name: participant; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.participant (
    id bigint NOT NULL,
    external_user_id text NOT NULL,
    email text,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.participant OWNER TO admin;

--
-- Name: participant_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.participant_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.participant_id_seq OWNER TO admin;

--
-- Name: participant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.participant_id_seq OWNED BY public.participant.id;


--
-- Name: participant_onr; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.participant_onr (
    oid text NOT NULL,
    participant_id bigint NOT NULL,
    oppijanumero text,
    is_individualized boolean,
    modified timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.participant_onr OWNER TO admin;

--
-- Name: participant_onr_participant_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.participant_onr_participant_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.participant_onr_participant_id_seq OWNER TO admin;

--
-- Name: participant_onr_participant_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.participant_onr_participant_id_seq OWNED BY public.participant_onr.participant_id;


--
-- Name: participant_sync_status; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.participant_sync_status (
    id bigint NOT NULL,
    exam_session_id bigint NOT NULL,
    success_at timestamp with time zone,
    failed_at timestamp with time zone,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    relocated_at timestamp with time zone
);


ALTER TABLE public.participant_sync_status OWNER TO admin;

--
-- Name: participant_sync_status_exam_session_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.participant_sync_status_exam_session_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.participant_sync_status_exam_session_id_seq OWNER TO admin;

--
-- Name: participant_sync_status_exam_session_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.participant_sync_status_exam_session_id_seq OWNED BY public.participant_sync_status.exam_session_id;


--
-- Name: participant_sync_status_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.participant_sync_status_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.participant_sync_status_id_seq OWNER TO admin;

--
-- Name: participant_sync_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.participant_sync_status_id_seq OWNED BY public.participant_sync_status.id;


--
-- Name: payment; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.payment (
    id bigint NOT NULL,
    state public.payment_state NOT NULL,
    registration_id bigint NOT NULL,
    amount numeric NOT NULL,
    lang character(2) NOT NULL,
    reference_number numeric,
    order_number text NOT NULL,
    external_payment_id text,
    payment_method text,
    payed_at timestamp with time zone,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    modified timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.payment OWNER TO admin;

--
-- Name: payment_config; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.payment_config (
    id bigint NOT NULL,
    organizer_id bigint NOT NULL,
    merchant_id integer,
    merchant_secret text,
    test_mode boolean DEFAULT false
);


ALTER TABLE public.payment_config OWNER TO admin;

--
-- Name: payment_config_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.payment_config_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payment_config_id_seq OWNER TO admin;

--
-- Name: payment_config_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.payment_config_id_seq OWNED BY public.payment_config.id;


--
-- Name: payment_config_organizer_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.payment_config_organizer_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payment_config_organizer_id_seq OWNER TO admin;

--
-- Name: payment_config_organizer_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.payment_config_organizer_id_seq OWNED BY public.payment_config.organizer_id;


--
-- Name: payment_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.payment_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payment_id_seq OWNER TO admin;

--
-- Name: payment_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.payment_id_seq OWNED BY public.payment.id;


--
-- Name: payment_order_number_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.payment_order_number_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payment_order_number_seq OWNER TO admin;

--
-- Name: payment_registration_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.payment_registration_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.payment_registration_id_seq OWNER TO admin;

--
-- Name: payment_registration_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.payment_registration_id_seq OWNED BY public.payment.registration_id;


--
-- Name: person; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.person (
    oid text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    email text,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    modified timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    phone_number text,
    street_address text,
    post_office text,
    zip text,
    nationality_code text,
    gender public.gender_code
);


ALTER TABLE public.person OWNER TO admin;

--
-- Name: person_sync_status; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.person_sync_status (
    id bigint NOT NULL,
    person_oid text,
    success_at timestamp with time zone,
    failed_at timestamp with time zone,
    should_retry boolean,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.person_sync_status OWNER TO admin;

--
-- Name: person_sync_status_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.person_sync_status_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.person_sync_status_id_seq OWNER TO admin;

--
-- Name: person_sync_status_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.person_sync_status_id_seq OWNED BY public.person_sync_status.id;


--
-- Name: pgqueues; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.pgqueues (
    id bigint NOT NULL,
    name text NOT NULL,
    priority integer DEFAULT 100 NOT NULL,
    data bytea,
    deleted boolean DEFAULT false NOT NULL
);


ALTER TABLE public.pgqueues OWNER TO admin;

--
-- Name: pgqueues_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.pgqueues_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.pgqueues_id_seq OWNER TO admin;

--
-- Name: pgqueues_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.pgqueues_id_seq OWNED BY public.pgqueues.id;


--
-- Name: quarantine; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quarantine (
    id bigint NOT NULL,
    language_code character(3) NOT NULL,
    end_date date NOT NULL,
    birthdate text NOT NULL,
    first_name text NOT NULL,
    last_name text NOT NULL,
    ssn text,
    email text,
    phone_number text,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    diary_number text,
    deleted_at timestamp with time zone,
    start_date date NOT NULL,
    CONSTRAINT ck_quarantine_start_date_end_date CHECK ((start_date < end_date))
);


ALTER TABLE public.quarantine OWNER TO postgres;

--
-- Name: quarantine_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quarantine_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.quarantine_id_seq OWNER TO postgres;

--
-- Name: quarantine_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quarantine_id_seq OWNED BY public.quarantine.id;


--
-- Name: quarantine_review; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.quarantine_review (
    id bigint NOT NULL,
    quarantine_id bigint NOT NULL,
    registration_id bigint NOT NULL,
    quarantined boolean NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    updated timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    reviewer_oid text NOT NULL
);


ALTER TABLE public.quarantine_review OWNER TO postgres;

--
-- Name: quarantine_review_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.quarantine_review_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.quarantine_review_id_seq OWNER TO postgres;

--
-- Name: quarantine_review_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.quarantine_review_id_seq OWNED BY public.quarantine_review.id;


--
-- Name: ragtime_migrations; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.ragtime_migrations (
    id character varying(255),
    created_at character varying(32)
);


ALTER TABLE public.ragtime_migrations OWNER TO admin;

--
-- Name: registration; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.registration (
    id bigint NOT NULL,
    state public.registration_state NOT NULL,
    exam_session_id bigint NOT NULL,
    participant_id bigint NOT NULL,
    started_at timestamp with time zone,
    form jsonb,
    form_version integer,
    person_oid text,
    original_exam_session_id bigint,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    modified timestamp with time zone DEFAULT CURRENT_TIMESTAMP,
    kind public.registration_kind DEFAULT 'ADMISSION'::public.registration_kind NOT NULL,
    quarantine_id bigint,
    reviewed timestamp with time zone,
    is_transfered boolean DEFAULT false NOT NULL,
    expires_at timestamp with time zone,
    exam_fee numeric,
    lifted_from_queue_at timestamp with time zone,
    ui_language text,
    free_registration_id bigint
);


ALTER TABLE public.registration OWNER TO admin;

--
-- Name: registration_id_seq; Type: SEQUENCE; Schema: public; Owner: admin
--

CREATE SEQUENCE public.registration_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.registration_id_seq OWNER TO admin;

--
-- Name: registration_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: admin
--

ALTER SEQUENCE public.registration_id_seq OWNED BY public.registration.id;


--
-- Name: subtest; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.subtest (
    code text NOT NULL,
    created timestamp with time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.subtest OWNER TO admin;

--
-- Name: task_lock; Type: TABLE; Schema: public; Owner: admin
--

CREATE TABLE public.task_lock (
    task text NOT NULL,
    last_executed timestamp with time zone NOT NULL,
    worker_id text
);


ALTER TABLE public.task_lock OWNER TO admin;

--
-- Name: contact id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.contact ALTER COLUMN id SET DEFAULT nextval('public.contact_id_seq'::regclass);


--
-- Name: contact organizer_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.contact ALTER COLUMN organizer_id SET DEFAULT nextval('public.contact_organizer_id_seq'::regclass);


--
-- Name: evaluation id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation ALTER COLUMN id SET DEFAULT nextval('public.evaluation_id_seq'::regclass);


--
-- Name: evaluation exam_date_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation ALTER COLUMN exam_date_id SET DEFAULT nextval('public.evaluation_exam_date_id_seq'::regclass);


--
-- Name: evaluation exam_date_language_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation ALTER COLUMN exam_date_language_id SET DEFAULT nextval('public.evaluation_exam_date_language_id_seq'::regclass);


--
-- Name: evaluation_order id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_order ALTER COLUMN id SET DEFAULT nextval('public.evaluation_order_id_seq'::regclass);


--
-- Name: evaluation_order evaluation_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_order ALTER COLUMN evaluation_id SET DEFAULT nextval('public.evaluation_order_evaluation_id_seq'::regclass);


--
-- Name: evaluation_order_subtest id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_order_subtest ALTER COLUMN id SET DEFAULT nextval('public.evaluation_order_subtest_id_seq'::regclass);


--
-- Name: evaluation_order_subtest evaluation_order_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_order_subtest ALTER COLUMN evaluation_order_id SET DEFAULT nextval('public.evaluation_order_subtest_evaluation_order_id_seq'::regclass);


--
-- Name: evaluation_payment id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_payment ALTER COLUMN id SET DEFAULT nextval('public.evaluation_payment_id_seq'::regclass);


--
-- Name: evaluation_payment evaluation_order_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_payment ALTER COLUMN evaluation_order_id SET DEFAULT nextval('public.evaluation_payment_evaluation_order_id_seq'::regclass);


--
-- Name: evaluation_payment_new id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_payment_new ALTER COLUMN id SET DEFAULT nextval('public.evaluation_payment_new_id_seq'::regclass);


--
-- Name: evaluation_payment_new evaluation_order_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_payment_new ALTER COLUMN evaluation_order_id SET DEFAULT nextval('public.evaluation_payment_new_evaluation_order_id_seq'::regclass);


--
-- Name: exam_date id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_date ALTER COLUMN id SET DEFAULT nextval('public.exam_date_id_seq'::regclass);


--
-- Name: exam_date_language id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_date_language ALTER COLUMN id SET DEFAULT nextval('public.exam_date_language_id_seq'::regclass);


--
-- Name: exam_date_language exam_date_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_date_language ALTER COLUMN exam_date_id SET DEFAULT nextval('public.exam_date_language_exam_date_id_seq'::regclass);


--
-- Name: exam_language id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_language ALTER COLUMN id SET DEFAULT nextval('public.exam_language_id_seq'::regclass);


--
-- Name: exam_language organizer_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_language ALTER COLUMN organizer_id SET DEFAULT nextval('public.exam_language_organizer_id_seq'::regclass);


--
-- Name: exam_payment_new id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_payment_new ALTER COLUMN id SET DEFAULT nextval('public.exam_payment_new_id_seq'::regclass);


--
-- Name: exam_payment_new registration_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_payment_new ALTER COLUMN registration_id SET DEFAULT nextval('public.exam_payment_new_registration_id_seq'::regclass);


--
-- Name: exam_session id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session ALTER COLUMN id SET DEFAULT nextval('public.exam_session_id_seq'::regclass);


--
-- Name: exam_session organizer_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session ALTER COLUMN organizer_id SET DEFAULT nextval('public.exam_session_organizer_id_seq'::regclass);


--
-- Name: exam_session exam_date_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session ALTER COLUMN exam_date_id SET DEFAULT nextval('public.exam_session_exam_date_id_seq'::regclass);


--
-- Name: exam_session_contact id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session_contact ALTER COLUMN id SET DEFAULT nextval('public.exam_session_contact_id_seq'::regclass);


--
-- Name: exam_session_contact exam_session_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session_contact ALTER COLUMN exam_session_id SET DEFAULT nextval('public.exam_session_contact_exam_session_id_seq'::regclass);


--
-- Name: exam_session_contact contact_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session_contact ALTER COLUMN contact_id SET DEFAULT nextval('public.exam_session_contact_contact_id_seq'::regclass);


--
-- Name: exam_session_location id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session_location ALTER COLUMN id SET DEFAULT nextval('public.exam_session_location_id_seq'::regclass);


--
-- Name: exam_session_queue id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session_queue ALTER COLUMN id SET DEFAULT nextval('public.exam_session_queue_id_seq'::regclass);


--
-- Name: free_registration registration_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.free_registration ALTER COLUMN registration_id SET DEFAULT nextval('public.free_registration_registration_id_seq'::regclass);


--
-- Name: login_link id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.login_link ALTER COLUMN id SET DEFAULT nextval('public.login_link_id_seq'::regclass);


--
-- Name: login_link participant_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.login_link ALTER COLUMN participant_id SET DEFAULT nextval('public.login_link_participant_id_seq'::regclass);


--
-- Name: organizer id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.organizer ALTER COLUMN id SET DEFAULT nextval('public.organizer_id_seq'::regclass);


--
-- Name: participant id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.participant ALTER COLUMN id SET DEFAULT nextval('public.participant_id_seq'::regclass);


--
-- Name: participant_onr participant_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.participant_onr ALTER COLUMN participant_id SET DEFAULT nextval('public.participant_onr_participant_id_seq'::regclass);


--
-- Name: participant_sync_status id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.participant_sync_status ALTER COLUMN id SET DEFAULT nextval('public.participant_sync_status_id_seq'::regclass);


--
-- Name: participant_sync_status exam_session_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.participant_sync_status ALTER COLUMN exam_session_id SET DEFAULT nextval('public.participant_sync_status_exam_session_id_seq'::regclass);


--
-- Name: payment id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.payment ALTER COLUMN id SET DEFAULT nextval('public.payment_id_seq'::regclass);


--
-- Name: payment registration_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.payment ALTER COLUMN registration_id SET DEFAULT nextval('public.payment_registration_id_seq'::regclass);


--
-- Name: payment_config id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.payment_config ALTER COLUMN id SET DEFAULT nextval('public.payment_config_id_seq'::regclass);


--
-- Name: payment_config organizer_id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.payment_config ALTER COLUMN organizer_id SET DEFAULT nextval('public.payment_config_organizer_id_seq'::regclass);


--
-- Name: person_sync_status id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.person_sync_status ALTER COLUMN id SET DEFAULT nextval('public.person_sync_status_id_seq'::regclass);


--
-- Name: pgqueues id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.pgqueues ALTER COLUMN id SET DEFAULT nextval('public.pgqueues_id_seq'::regclass);


--
-- Name: quarantine id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quarantine ALTER COLUMN id SET DEFAULT nextval('public.quarantine_id_seq'::regclass);


--
-- Name: quarantine_review id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quarantine_review ALTER COLUMN id SET DEFAULT nextval('public.quarantine_review_id_seq'::regclass);


--
-- Name: registration id; Type: DEFAULT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.registration ALTER COLUMN id SET DEFAULT nextval('public.registration_id_seq'::regclass);


--
-- Name: cas_oppija_ticketstore cas_oppija_ticketstore_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cas_oppija_ticketstore
    ADD CONSTRAINT cas_oppija_ticketstore_pkey PRIMARY KEY (ticket);


--
-- Name: cas_ticketstore cas_ticketstore_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.cas_ticketstore
    ADD CONSTRAINT cas_ticketstore_pkey PRIMARY KEY (ticket);


--
-- Name: contact contact_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.contact
    ADD CONSTRAINT contact_pkey PRIMARY KEY (id);


--
-- Name: databasechangeloglock databasechangeloglock_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.databasechangeloglock
    ADD CONSTRAINT databasechangeloglock_pkey PRIMARY KEY (id);


--
-- Name: evaluation evaluation_exam_date_language_id_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation
    ADD CONSTRAINT evaluation_exam_date_language_id_key UNIQUE (exam_date_language_id);


--
-- Name: evaluation_order evaluation_order_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_order
    ADD CONSTRAINT evaluation_order_pkey PRIMARY KEY (id);


--
-- Name: evaluation_order_subtest evaluation_order_subtest_evaluation_order_id_subtest_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_order_subtest
    ADD CONSTRAINT evaluation_order_subtest_evaluation_order_id_subtest_key UNIQUE (evaluation_order_id, subtest);


--
-- Name: evaluation_order_subtest evaluation_order_subtest_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_order_subtest
    ADD CONSTRAINT evaluation_order_subtest_pkey PRIMARY KEY (id);


--
-- Name: evaluation_payment_config evaluation_payment_config_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_payment_config
    ADD CONSTRAINT evaluation_payment_config_pkey PRIMARY KEY (id);


--
-- Name: evaluation_payment evaluation_payment_evaluation_order_id_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_payment
    ADD CONSTRAINT evaluation_payment_evaluation_order_id_key UNIQUE (evaluation_order_id);


--
-- Name: evaluation_payment evaluation_payment_external_payment_id_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_payment
    ADD CONSTRAINT evaluation_payment_external_payment_id_key UNIQUE (external_payment_id);


--
-- Name: evaluation_payment_new evaluation_payment_new_evaluation_order_id_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_payment_new
    ADD CONSTRAINT evaluation_payment_new_evaluation_order_id_key UNIQUE (evaluation_order_id);


--
-- Name: evaluation_payment_new evaluation_payment_new_href_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_payment_new
    ADD CONSTRAINT evaluation_payment_new_href_key UNIQUE (href);


--
-- Name: evaluation_payment_new evaluation_payment_new_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_payment_new
    ADD CONSTRAINT evaluation_payment_new_pkey PRIMARY KEY (id);


--
-- Name: evaluation_payment_new evaluation_payment_new_reference_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_payment_new
    ADD CONSTRAINT evaluation_payment_new_reference_key UNIQUE (reference);


--
-- Name: evaluation_payment_new evaluation_payment_new_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_payment_new
    ADD CONSTRAINT evaluation_payment_new_transaction_id_key UNIQUE (transaction_id);


--
-- Name: evaluation_payment evaluation_payment_order_number_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_payment
    ADD CONSTRAINT evaluation_payment_order_number_key UNIQUE (order_number);


--
-- Name: evaluation_payment evaluation_payment_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_payment
    ADD CONSTRAINT evaluation_payment_pkey PRIMARY KEY (id);


--
-- Name: evaluation evaluation_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation
    ADD CONSTRAINT evaluation_pkey PRIMARY KEY (id);


--
-- Name: exam_date_language exam_date_language_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_date_language
    ADD CONSTRAINT exam_date_language_pkey PRIMARY KEY (id);


--
-- Name: exam_date exam_date_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_date
    ADD CONSTRAINT exam_date_pkey PRIMARY KEY (id);


--
-- Name: exam_language exam_language_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_language
    ADD CONSTRAINT exam_language_pkey PRIMARY KEY (id);


--
-- Name: exam_level exam_level_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_level
    ADD CONSTRAINT exam_level_pkey PRIMARY KEY (code);


--
-- Name: exam_payment_new exam_payment_new_href_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_payment_new
    ADD CONSTRAINT exam_payment_new_href_key UNIQUE (href);


--
-- Name: exam_payment_new exam_payment_new_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_payment_new
    ADD CONSTRAINT exam_payment_new_pkey PRIMARY KEY (id);


--
-- Name: exam_payment_new exam_payment_new_reference_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_payment_new
    ADD CONSTRAINT exam_payment_new_reference_key UNIQUE (reference);


--
-- Name: exam_payment_new exam_payment_new_transaction_id_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_payment_new
    ADD CONSTRAINT exam_payment_new_transaction_id_key UNIQUE (transaction_id);


--
-- Name: exam_session_contact exam_session_contact_exam_session_id_contact_id_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session_contact
    ADD CONSTRAINT exam_session_contact_exam_session_id_contact_id_key UNIQUE (exam_session_id, contact_id);


--
-- Name: exam_session_contact exam_session_contact_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session_contact
    ADD CONSTRAINT exam_session_contact_pkey PRIMARY KEY (id);


--
-- Name: exam_session_location exam_session_location_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session_location
    ADD CONSTRAINT exam_session_location_pkey PRIMARY KEY (id);


--
-- Name: exam_session exam_session_organizer_id_office_oid_language_code_level_co_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session
    ADD CONSTRAINT exam_session_organizer_id_office_oid_language_code_level_co_key UNIQUE (organizer_id, office_oid, language_code, level_code, exam_date_id);


--
-- Name: exam_session exam_session_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session
    ADD CONSTRAINT exam_session_pkey PRIMARY KEY (id);


--
-- Name: exam_session_queue exam_session_queue_email_exam_session_id_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session_queue
    ADD CONSTRAINT exam_session_queue_email_exam_session_id_key UNIQUE (email, exam_session_id);


--
-- Name: exam_session_queue exam_session_queue_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session_queue
    ADD CONSTRAINT exam_session_queue_pkey PRIMARY KEY (id);


--
-- Name: free_registration free_registration_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.free_registration
    ADD CONSTRAINT free_registration_pkey PRIMARY KEY (free_registration_id);


--
-- Name: language language_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.language
    ADD CONSTRAINT language_pkey PRIMARY KEY (code);


--
-- Name: login_link login_link_code_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.login_link
    ADD CONSTRAINT login_link_code_key UNIQUE (code);


--
-- Name: login_link login_link_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.login_link
    ADD CONSTRAINT login_link_pkey PRIMARY KEY (id);


--
-- Name: organizer organizer_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.organizer
    ADD CONSTRAINT organizer_pkey PRIMARY KEY (id);


--
-- Name: participant participant_external_user_id_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.participant
    ADD CONSTRAINT participant_external_user_id_key UNIQUE (external_user_id);


--
-- Name: participant_onr participant_onr_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.participant_onr
    ADD CONSTRAINT participant_onr_pkey PRIMARY KEY (oid);


--
-- Name: participant participant_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.participant
    ADD CONSTRAINT participant_pkey PRIMARY KEY (id);


--
-- Name: participant_sync_status participant_sync_status_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.participant_sync_status
    ADD CONSTRAINT participant_sync_status_pkey PRIMARY KEY (id);


--
-- Name: payment_config payment_config_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.payment_config
    ADD CONSTRAINT payment_config_pkey PRIMARY KEY (id);


--
-- Name: payment payment_external_payment_id_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_external_payment_id_key UNIQUE (external_payment_id);


--
-- Name: payment payment_order_number_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_order_number_key UNIQUE (order_number);


--
-- Name: payment payment_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_pkey PRIMARY KEY (id);


--
-- Name: payment payment_registration_id_key; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_registration_id_key UNIQUE (registration_id);


--
-- Name: person person_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.person
    ADD CONSTRAINT person_pkey PRIMARY KEY (oid);


--
-- Name: person_sync_status person_sync_status_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.person_sync_status
    ADD CONSTRAINT person_sync_status_pkey PRIMARY KEY (id);


--
-- Name: pgqueues pgqueues_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.pgqueues
    ADD CONSTRAINT pgqueues_pkey PRIMARY KEY (name, priority, id, deleted);


--
-- Name: quarantine quarantine_diary_number_key; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quarantine
    ADD CONSTRAINT quarantine_diary_number_key UNIQUE (diary_number);


--
-- Name: quarantine quarantine_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quarantine
    ADD CONSTRAINT quarantine_pkey PRIMARY KEY (id);


--
-- Name: quarantine_review quarantine_review_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quarantine_review
    ADD CONSTRAINT quarantine_review_pkey PRIMARY KEY (id);


--
-- Name: quarantine_review quarantine_review_unique_quarantine_registration_combination; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quarantine_review
    ADD CONSTRAINT quarantine_review_unique_quarantine_registration_combination UNIQUE (quarantine_id, registration_id);


--
-- Name: registration registration_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.registration
    ADD CONSTRAINT registration_pkey PRIMARY KEY (id);


--
-- Name: subtest subtest_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.subtest
    ADD CONSTRAINT subtest_pkey PRIMARY KEY (code);


--
-- Name: task_lock task_lock_pkey; Type: CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.task_lock
    ADD CONSTRAINT task_lock_pkey PRIMARY KEY (task);


--
-- Name: evaluation_payment_new_state; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX evaluation_payment_new_state ON public.evaluation_payment_new USING btree (state);


--
-- Name: exam_date_exam_date_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX exam_date_exam_date_idx ON public.exam_date USING btree (exam_date);


--
-- Name: exam_payment_new_paid_at; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX exam_payment_new_paid_at ON public.exam_payment_new USING btree (paid_at);


--
-- Name: exam_payment_new_state; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX exam_payment_new_state ON public.exam_payment_new USING btree (state);


--
-- Name: exam_session_location_exam_session_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX exam_session_location_exam_session_id ON public.exam_session_location USING btree (exam_session_id);


--
-- Name: exam_session_queue_exam_session_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX exam_session_queue_exam_session_id ON public.exam_session_queue USING btree (exam_session_id);


--
-- Name: login_link_participant_id_exam_session_id_created; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX login_link_participant_id_exam_session_id_created ON public.login_link USING btree (participant_id, exam_session_id, created);


--
-- Name: organizer_oid; Type: INDEX; Schema: public; Owner: admin
--

CREATE UNIQUE INDEX organizer_oid ON public.organizer USING btree (oid) WHERE (deleted_at IS NULL);


--
-- Name: participant_onr_is_individualized; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX participant_onr_is_individualized ON public.participant_onr USING btree (is_individualized);


--
-- Name: participant_onr_modified; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX participant_onr_modified ON public.participant_onr USING btree (modified);


--
-- Name: participant_onr_oppijanumero; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX participant_onr_oppijanumero ON public.participant_onr USING btree (oppijanumero);


--
-- Name: participant_onr_participant_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX participant_onr_participant_id ON public.participant_onr USING btree (participant_id);


--
-- Name: person_sync_status_created_idx; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX person_sync_status_created_idx ON public.person_sync_status USING btree (created);


--
-- Name: registration_exam_session_id; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX registration_exam_session_id ON public.registration USING btree (exam_session_id);


--
-- Name: registration_lifted_from_queue_at; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX registration_lifted_from_queue_at ON public.registration USING btree (lifted_from_queue_at);


--
-- Name: registration_person_oid; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX registration_person_oid ON public.registration USING btree (person_oid);


--
-- Name: registration_state; Type: INDEX; Schema: public; Owner: admin
--

CREATE INDEX registration_state ON public.registration USING btree (state);


--
-- Name: registration participant_limit_trigger; Type: TRIGGER; Schema: public; Owner: admin
--

CREATE TRIGGER participant_limit_trigger BEFORE INSERT ON public.registration FOR EACH ROW EXECUTE PROCEDURE public.error_if_exceeds_participant_limit();


--
-- Name: quarantine_review quarantine_review_quarantine_not_deleted_trigger; Type: TRIGGER; Schema: public; Owner: postgres
--

CREATE TRIGGER quarantine_review_quarantine_not_deleted_trigger BEFORE INSERT OR UPDATE ON public.quarantine_review FOR EACH ROW EXECUTE PROCEDURE public.error_if_reviewed_quarantine_is_deleted();


--
-- Name: contact contact_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.contact
    ADD CONSTRAINT contact_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.organizer(id);


--
-- Name: evaluation evaluation_exam_date_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation
    ADD CONSTRAINT evaluation_exam_date_id_fkey FOREIGN KEY (exam_date_id) REFERENCES public.exam_date(id);


--
-- Name: evaluation evaluation_exam_date_language_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation
    ADD CONSTRAINT evaluation_exam_date_language_id_fkey FOREIGN KEY (exam_date_language_id) REFERENCES public.exam_date_language(id);


--
-- Name: evaluation_order evaluation_order_evaluation_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_order
    ADD CONSTRAINT evaluation_order_evaluation_id_fkey FOREIGN KEY (evaluation_id) REFERENCES public.evaluation(id);


--
-- Name: evaluation_order_subtest evaluation_order_subtest_evaluation_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_order_subtest
    ADD CONSTRAINT evaluation_order_subtest_evaluation_order_id_fkey FOREIGN KEY (evaluation_order_id) REFERENCES public.evaluation_order(id) ON DELETE CASCADE;


--
-- Name: evaluation_order_subtest evaluation_order_subtest_subtest_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_order_subtest
    ADD CONSTRAINT evaluation_order_subtest_subtest_fkey FOREIGN KEY (subtest) REFERENCES public.subtest(code);


--
-- Name: evaluation_payment evaluation_payment_evaluation_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_payment
    ADD CONSTRAINT evaluation_payment_evaluation_order_id_fkey FOREIGN KEY (evaluation_order_id) REFERENCES public.evaluation_order(id);


--
-- Name: evaluation_payment_new evaluation_payment_new_evaluation_order_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.evaluation_payment_new
    ADD CONSTRAINT evaluation_payment_new_evaluation_order_id_fkey FOREIGN KEY (evaluation_order_id) REFERENCES public.evaluation_order(id);


--
-- Name: exam_date_language exam_date_language_exam_date_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_date_language
    ADD CONSTRAINT exam_date_language_exam_date_id_fkey FOREIGN KEY (exam_date_id) REFERENCES public.exam_date(id);


--
-- Name: exam_date_language exam_date_language_language_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_date_language
    ADD CONSTRAINT exam_date_language_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.language(code);


--
-- Name: exam_date_language exam_date_language_level_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_date_language
    ADD CONSTRAINT exam_date_language_level_code_fkey FOREIGN KEY (level_code) REFERENCES public.exam_level(code);


--
-- Name: exam_language exam_language_language_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_language
    ADD CONSTRAINT exam_language_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.language(code);


--
-- Name: exam_language exam_language_level_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_language
    ADD CONSTRAINT exam_language_level_code_fkey FOREIGN KEY (level_code) REFERENCES public.exam_level(code);


--
-- Name: exam_language exam_language_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_language
    ADD CONSTRAINT exam_language_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.organizer(id);


--
-- Name: exam_payment_new exam_payment_new_registration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_payment_new
    ADD CONSTRAINT exam_payment_new_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.registration(id);


--
-- Name: exam_session_contact exam_session_contact_contact_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session_contact
    ADD CONSTRAINT exam_session_contact_contact_id_fkey FOREIGN KEY (contact_id) REFERENCES public.contact(id) ON DELETE CASCADE;


--
-- Name: exam_session_contact exam_session_contact_exam_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session_contact
    ADD CONSTRAINT exam_session_contact_exam_session_id_fkey FOREIGN KEY (exam_session_id) REFERENCES public.exam_session(id) ON DELETE CASCADE;


--
-- Name: exam_session exam_session_exam_date_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session
    ADD CONSTRAINT exam_session_exam_date_id_fkey FOREIGN KEY (exam_date_id) REFERENCES public.exam_date(id);


--
-- Name: exam_session exam_session_language_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session
    ADD CONSTRAINT exam_session_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.language(code);


--
-- Name: exam_session exam_session_level_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session
    ADD CONSTRAINT exam_session_level_code_fkey FOREIGN KEY (level_code) REFERENCES public.exam_level(code);


--
-- Name: exam_session_location exam_session_location_exam_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session_location
    ADD CONSTRAINT exam_session_location_exam_session_id_fkey FOREIGN KEY (exam_session_id) REFERENCES public.exam_session(id) ON DELETE CASCADE;


--
-- Name: exam_session exam_session_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session
    ADD CONSTRAINT exam_session_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.organizer(id);


--
-- Name: exam_session_queue exam_session_queue_exam_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.exam_session_queue
    ADD CONSTRAINT exam_session_queue_exam_session_id_fkey FOREIGN KEY (exam_session_id) REFERENCES public.exam_session(id) ON DELETE CASCADE;


--
-- Name: login_link login_link_exam_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.login_link
    ADD CONSTRAINT login_link_exam_session_id_fkey FOREIGN KEY (exam_session_id) REFERENCES public.exam_session(id);


--
-- Name: login_link login_link_participant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.login_link
    ADD CONSTRAINT login_link_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participant(id);


--
-- Name: login_link login_link_registration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.login_link
    ADD CONSTRAINT login_link_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.registration(id);


--
-- Name: participant_onr participant_onr_participant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.participant_onr
    ADD CONSTRAINT participant_onr_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participant(id);


--
-- Name: participant_sync_status participant_sync_status_exam_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.participant_sync_status
    ADD CONSTRAINT participant_sync_status_exam_session_id_fkey FOREIGN KEY (exam_session_id) REFERENCES public.exam_session(id);


--
-- Name: payment_config payment_config_organizer_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.payment_config
    ADD CONSTRAINT payment_config_organizer_id_fkey FOREIGN KEY (organizer_id) REFERENCES public.organizer(id);


--
-- Name: payment payment_registration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.payment
    ADD CONSTRAINT payment_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.registration(id);


--
-- Name: person_sync_status person_sync_status_person_oid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.person_sync_status
    ADD CONSTRAINT person_sync_status_person_oid_fkey FOREIGN KEY (person_oid) REFERENCES public.person(oid);


--
-- Name: quarantine quarantine_language_code_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quarantine
    ADD CONSTRAINT quarantine_language_code_fkey FOREIGN KEY (language_code) REFERENCES public.language(code);


--
-- Name: quarantine_review quarantine_review_quarantine_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quarantine_review
    ADD CONSTRAINT quarantine_review_quarantine_id_fkey FOREIGN KEY (quarantine_id) REFERENCES public.quarantine(id);


--
-- Name: quarantine_review quarantine_review_registration_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.quarantine_review
    ADD CONSTRAINT quarantine_review_registration_id_fkey FOREIGN KEY (registration_id) REFERENCES public.registration(id);


--
-- Name: registration registration_exam_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.registration
    ADD CONSTRAINT registration_exam_session_id_fkey FOREIGN KEY (exam_session_id) REFERENCES public.exam_session(id);


--
-- Name: registration registration_original_exam_session_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.registration
    ADD CONSTRAINT registration_original_exam_session_id_fkey FOREIGN KEY (original_exam_session_id) REFERENCES public.exam_session(id);


--
-- Name: registration registration_participant_id_fkey; Type: FK CONSTRAINT; Schema: public; Owner: admin
--

ALTER TABLE ONLY public.registration
    ADD CONSTRAINT registration_participant_id_fkey FOREIGN KEY (participant_id) REFERENCES public.participant(id);


--
-- Name: SCHEMA public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE USAGE ON SCHEMA public FROM PUBLIC;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

\unrestrict uiMPSsr7djeIpTEAIWWF9EL1CXTawwdpqO9lFiAemj5MFxv1etPmTOfxo4Wi24d

