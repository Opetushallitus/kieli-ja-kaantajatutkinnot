#!/bin/bash

# Fetch countries from koodisto, save returned json for backend to use, generate frontend localisation files.

KOODISTO_FILE=../src/main/resources/koodisto/koodisto_maat.json
FRONTEND_PATH=../../../frontend/packages/akt/public/i18n/koodisto/countries

mkdir -p $FRONTEND_PATH
curl -H "Caller-Id:kehittaja-akt" "https://virkailija.opintopolku.fi/koodisto-service/rest/json/maatjavaltiot1/koodi" --create-dirs -o $KOODISTO_FILE

function extract_frontend_localisation() {
  lang=$1
  locale=$2
  jq_extract_cmd="[.[] | {key: .koodiArvo, value: .metadata[] | select(.kieli | contains(\"${lang}\")).nimi }] | sort_by(.key) | from_entries"
  jq_obj_wrap_cmd='. | {akt:{koodisto:{countries:.}}}'
  output="${FRONTEND_PATH}/koodisto_countries_${locale}.json"
  echo "Command for jq: $jq_extract_cmd"
  echo "Outputting to: $output"
  jq "$jq_extract_cmd" $KOODISTO_FILE | jq "$jq_obj_wrap_cmd" >"${output}"
  echo "ok"
}

extract_frontend_localisation 'FI' 'fi-FI'
extract_frontend_localisation 'SV' 'sv-SE'
extract_frontend_localisation 'EN' 'en-GB'
