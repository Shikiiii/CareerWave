#!/usr/bin/env bash
set -euo pipefail

mkdir -p \
  app/api/health \
  'app/(auth)/login' \
  'app/(auth)/register' \
  'app/(dashboard)' \
  components/ui \
  components/layout \
  config \
  docs \
  hooks \
  lib \
  prisma \
  public/uploads \
  stores \
  types

touch public/uploads/.gitkeep
