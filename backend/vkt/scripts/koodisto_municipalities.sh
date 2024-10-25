#!/bin/bash

# Fetch municipalities from koodisto, save returned json for backend to use, generate frontend localisation files.

BACKEND_PATH=../src/main/resources/koodisto
BACKEND_KOODISTO_FILE=${BACKEND_PATH}/koodisto_kunnat.json
mkdir -p $BACKEND_PATH
FRONTEND_PATH=../../../frontend/packages/vkt/public/i18n

mkdir -p $FRONTEND_PATH
function fetch_and_transform_koodisto_results_for_backend_use() {
  koodistoURL="https://virkailija.opintopolku.fi/koodisto-service/rest/json/kunta/koodi"
  # Read municipalities, filter out expired ones, filter out irrelevant codes (198,199,999), pick and transform relevant fields
  jq_extract_cmd="[.[] | select(.voimassaLoppuPvm | type == \"null\") | select(.koodiArvo != \"198\" and .koodiArvo != \"199\" and .koodiArvo != \"999\")|{koodiUri, resourceUri, versio, koodiArvo, voimassaAlkuPvm, paivitysPvm, fi: (.metadata[] | select(.kieli == \"FI\") | .nimi), sv: (.metadata[] | select(.kieli == \"SV\") | .nimi)} ]"
  curl -H "Caller-Id:kehittaja-vkt" "$koodistoURL" | jq -c "$jq_extract_cmd" > $BACKEND_KOODISTO_FILE
}

function extract_frontend_localisation() {
  lang=$1
  locale=$2
  jq_extract_cmd="[.[] | {key: .koodiArvo, value: .${lang} }] | sort_by(.key) | from_entries"
  jq_obj_wrap_cmd='. | {vkt:{koodisto:{municipalities:.}}}'
  output="${FRONTEND_PATH}/${locale}/koodisto_municipalities.json"
  echo "Command for jq: $jq_extract_cmd"
  echo "Outputting to: $output"
  jq "$jq_extract_cmd" $BACKEND_KOODISTO_FILE | jq "$jq_obj_wrap_cmd" >"${output}"
  echo "ok"
}

fetch_and_transform_koodisto_results_for_backend_use
extract_frontend_localisation 'fi' 'fi-FI'
extract_frontend_localisation 'sv' 'sv-SE'
