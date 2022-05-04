#!/bin/bash

# Fetch regions list from koodisto, save returned json for backend to use, generate frontend localisation files.

LANGS_LIST=../src/main/resources/koodisto/koodisto_maakunta.json
FRONTEND_PATH=../../../frontend/packages/otr/public/i18n/koodisto/regions

mkdir -p $FRONTEND_PATH
curl -H "Caller-Id:kehittaja-otr" "https://virkailija.opintopolku.fi/koodisto-service/rest/json/maakunta/koodi" --create-dirs -o $LANGS_LIST

function extract_frontend_localisation() {
  lang=$1
  locale=$2
  jq_extract_cmd="[.[] | {key: select(.koodiArvo != \"99\").koodiArvo, value: .metadata[] | select(.kieli | contains(\"${lang}\")).nimi }] | sort_by(.key) | from_entries"
  jq_obj_wrap_cmd='. | {otr:{koodisto:{languages:.}}}'
  output="${FRONTEND_PATH}/koodisto_regions_${locale}.json"
  echo "Command for jq: $jq_extract_cmd"
  echo "Outputting to: $output"
  jq "$jq_extract_cmd" $LANGS_LIST | jq "$jq_obj_wrap_cmd" >"${output}"
  echo "ok"
}

extract_frontend_localisation 'FI' 'fi-FI'
extract_frontend_localisation 'SV' 'sv-SE'
extract_frontend_localisation 'EN' 'en-GB'
