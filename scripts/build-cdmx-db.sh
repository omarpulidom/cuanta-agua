#!/usr/bin/env bash
# Build script: filtra db_geo.sqlite a solo CDMX (estado_id='09')
# y genera src/assets/data/db_cdmx.sqlite optimizado.
#
# Input:  src/assets/geojson/db_geo.sqlite (1.7GB, todo México)
# Output: src/assets/data/db_cdmx.sqlite (~5-15MB, solo CDMX)
#
# Uso:
#   bash scripts/build-cdmx-db.sh
#
# Requiere: sqlite3 CLI (preinstalado en macOS)

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
INPUT="$ROOT/src/assets/geojson/db_geo.sqlite"
OUTPUT="$ROOT/src/assets/data/db_cdmx.sqlite"
CDMX_GEOJSON="$ROOT/src/assets/geojson/cdmx.geojson"
CDMX_ESTADO_ID="09"

if [ ! -f "$INPUT" ]; then
  echo "❌ No se encontró $INPUT"
  echo "Coloca db_geo.sqlite (de open-mexico/sepomex-db-generator) en src/assets/geojson/"
  exit 1
fi

if ! command -v sqlite3 &> /dev/null; then
  echo "❌ sqlite3 CLI no encontrado. Instálalo con: brew install sqlite3"
  exit 1
fi

INPUT_SIZE=$(du -m "$INPUT" | cut -f1)
echo "📦 Input: $INPUT (${INPUT_SIZE} MB)"

if [ -f "$OUTPUT" ]; then
  rm -f "$OUTPUT"
fi

# Crear esquema destino
echo "📐 Creando esquema destino..."
sqlite3 "$OUTPUT" <<'EOF'
CREATE TABLE estados (
  id TEXT PRIMARY KEY,
  nombre TEXT NOT NULL
);

CREATE TABLE municipios (
  id TEXT NOT NULL,
  nombre TEXT NOT NULL,
  estado_id TEXT NOT NULL,
  municipio_uid TEXT NOT NULL,
  nombre_normalizado TEXT NOT NULL,
  PRIMARY KEY (estado_id, id)
);

CREATE TABLE colonias (
  codigo TEXT NOT NULL,
  nombre TEXT NOT NULL,
  tipo TEXT,
  ciudad TEXT,
  zona TEXT,
  estado_id TEXT NOT NULL,
  municipio_id TEXT NOT NULL,
  municipio_uid TEXT NOT NULL,
  codigo_id TEXT NOT NULL,
  nombre_normalizado TEXT NOT NULL,
  geometria TEXT,
  min_lon REAL,
  min_lat REAL,
  max_lon REAL,
  max_lat REAL,
  centro_lon REAL,
  centro_lat REAL,
  PRIMARY KEY (codigo_id)
);

CREATE VIEW vw_colonias_busqueda AS
  SELECT
    c.codigo_id,
    c.codigo,
    c.nombre AS colonia_nombre,
    c.nombre_normalizado AS colonia_nombre_normalizado,
    c.tipo,
    c.ciudad,
    c.zona,
    c.estado_id,
    c.municipio_id,
    c.municipio_uid,
    m.nombre AS municipio_nombre,
    m.nombre_normalizado AS municipio_nombre_normalizado,
    c.geometria,
    c.min_lon,
    c.min_lat,
    c.max_lon,
    c.max_lat,
    c.centro_lon,
    c.centro_lat
  FROM colonias c
  LEFT JOIN municipios m ON c.municipio_uid = m.municipio_uid;
EOF

# Copiar datos
echo "📋 Copiando estados (CDMX)..."
sqlite3 "$INPUT" "SELECT id, nombre FROM estados WHERE id = '$CDMX_ESTADO_ID';" | \
  sqlite3 -separator '|' "$OUTPUT" ".import '|cat'" "INSERT INTO estados (id, nombre) VALUES (?, ?);" 2>/dev/null || \
sqlite3 "$INPUT" "SELECT id, nombre FROM estados WHERE id = '$CDMX_ESTADO_ID';" | \
  awk -F'|' '{printf "INSERT INTO estados (id, nombre) VALUES (\047%s\047, \047%s\047);\n", $1, $2}' | \
  sqlite3 "$OUTPUT"

echo "📋 Copiando municipios de CDMX..."
sqlite3 "$INPUT" ".mode list" "SELECT id || '|' || nombre || '|' || estado_id || '|' || municipio_uid || '|' || nombre_normalizado FROM municipios WHERE estado_id = '$CDMX_ESTADO_ID';" | \
  awk -F'|' '{
    gsub(/\047/, "\047\047", $2); gsub(/\047/, "\047\047", $5);
    printf "INSERT INTO municipios (id, nombre, estado_id, municipio_uid, nombre_normalizado) VALUES (\047%s\047, \047%s\047, \047%s\047, \047%s\047, \047%s\047);\n", $1, $2, $3, $4, $5
  }' | \
  sqlite3 "$OUTPUT"
MUN_COUNT=$(sqlite3 "$OUTPUT" "SELECT COUNT(*) FROM municipios;")
echo "  ✓ $MUN_COUNT municipios"

echo "📋 Copiando colonias de CDMX..."
# ATTACH para velocidad
sqlite3 "$OUTPUT" <<EOF
ATTACH '$INPUT' AS src;
INSERT INTO colonias
SELECT
  codigo, nombre, tipo, ciudad, zona, estado_id, municipio_id, municipio_uid,
  codigo_id, nombre_normalizado, geometria,
  min_lon, min_lat, max_lon, max_lat, centro_lon, centro_lat
FROM src.colonias
WHERE estado_id = '$CDMX_ESTADO_ID';
DETACH src;
EOF

TOTAL=$(sqlite3 "$OUTPUT" "SELECT COUNT(*) FROM colonias;")
CON_GEO=$(sqlite3 "$OUTPUT" "SELECT COUNT(*) FROM colonias WHERE geometria IS NOT NULL AND geometria != '';")
SIN_GEO=$((TOTAL - CON_GEO))
UNIQUE_CPS=$(sqlite3 "$OUTPUT" "SELECT COUNT(DISTINCT codigo) FROM colonias;")
echo "  ✓ $TOTAL colonias totales ($CON_GEO con geometría, $SIN_GEO sin geometría)"
echo "  ✓ $UNIQUE_CPS códigos postales únicos"

# Índices
echo "📐 Creando índices..."
sqlite3 "$OUTPUT" <<'EOF'
CREATE UNIQUE INDEX idx_colonia_codigo_id ON colonias(codigo_id);
CREATE INDEX idx_colonia_codigo ON colonias(codigo);
CREATE INDEX idx_colonia_municipio_uid ON colonias(municipio_uid);
CREATE INDEX idx_colonia_nombre ON colonias(nombre COLLATE NOCASE);
CREATE INDEX idx_colonia_nombre_norm ON colonias(nombre_normalizado);
CREATE INDEX idx_colonia_municipio_codigo ON colonias(municipio_id, codigo);
CREATE INDEX idx_colonia_municipio_nombre_norm ON colonias(municipio_id, nombre_normalizado);
CREATE INDEX idx_municipio_uid ON municipios(municipio_uid);
CREATE INDEX idx_municipio_nombre ON municipios(nombre COLLATE NOCASE);
EOF

# VACUUM para compactar
echo "📐 Compactando..."
sqlite3 "$OUTPUT" "VACUUM;"

OUTPUT_SIZE=$(du -m "$OUTPUT" | cut -f1)
echo ""
echo "✅ Output: $OUTPUT (${OUTPUT_SIZE} MB)"
REDUCTION=$(echo "scale=1; ($INPUT_SIZE - $OUTPUT_SIZE) * 100 / $INPUT_SIZE" | bc)
echo "   Reducción: ${INPUT_SIZE} MB → ${OUTPUT_SIZE} MB (${REDUCTION}% menos)"

# Cross-check con cdmx.geojson
if [ -f "$CDMX_GEOJSON" ]; then
  CDMX_CP_COUNT=$(node -e "const d = require('$CDMX_GEOJSON'); console.log(new Set(d.features.map(f => f.properties.d_codigo)).size);")
  MATCH_COUNT=$(node -e "const d = require('$CDMX_GEOJSON'); const cps = new Set(d.features.map(f => f.properties.d_codigo)); const Database = require('better-sqlite3'); const db = new Database('$OUTPUT', {readonly: true}); const dbCps = new Set(db.prepare('SELECT DISTINCT codigo FROM colonias').all().map(r => r.codigo)); let m = 0; for (const cp of cps) if (dbCps.has(cp)) m++; console.log(m);" 2>/dev/null || echo "0")
  echo ""
  echo "📊 Cross-check cdmx.geojson: $MATCH_COUNT/$CDMX_CP_COUNT CPs match"
fi
