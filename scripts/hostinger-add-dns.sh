#!/usr/bin/env bash
# Script helper para adicionar registros DNS na Hostinger via API (exige HOSTINGER_API_TOKEN)
# NOTE: Hostinger API endpoints/paths podem mudar; adapte se necessário.
# USO:
# HOSTINGER_API_TOKEN=xxx HOSTNAME=zairyx.com node ./scripts/hostinger-add-dns.sh

set -euo pipefail
if [ -z "${HOSTINGER_API_TOKEN:-}" ]; then
  echo "Set HOSTINGER_API_TOKEN env var before running."
  exit 1
fi
if [ -z "${HOSTNAME:-}" ]; then
  echo "Set HOSTNAME env var (ex: zairyx.com) before running."
  exit 1
fi

echo "Placeholder script: Hostinger API varia por conta."
echo "I'll print the DNS records you need to add to Hostinger for SendGrid domain authentication."

echo "--- DNS records (example placeholders) ---"
echo "Add these CNAMEs in Hostinger DNS zone for ${HOSTNAME}:"

echo "Name: s1._domainkey.${HOSTNAME}  Type: CNAME  Value: s1.domainkey.uXXXXX.wl.sendgrid.net"
echo "Name: s2._domainkey.${HOSTNAME}  Type: CNAME  Value: s2.domainkey.uXXXXX.wl.sendgrid.net"
echo "Name: emXXXX.${HOSTNAME}          Type: CNAME  Value: em123.uXXXXX.wl.sendgrid.net"

echo "(Replace the uXXXXX and emXXXX values with the actual strings SendGrid returns in the Domain Authentication step.)"

echo "After adding, run: curl -s -X GET \"https://api.sendgrid.com/v3/whitelabel/domains?domain=${HOSTNAME}\" -H \"Authorization: Bearer <YOUR_API_KEY>\"\" to list the whitelabel status."
