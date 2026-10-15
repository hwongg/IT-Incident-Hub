CREATE TABLE IF NOT EXISTS incidents (
  id BIGSERIAL PRIMARY KEY,
  title VARCHAR(160) NOT NULL,
  description TEXT NOT NULL,
  category VARCHAR(60) NOT NULL,
  priority VARCHAR(20) NOT NULL CHECK (priority IN ('BAJA', 'MEDIA', 'ALTA', 'CRITICA')),
  reporter VARCHAR(120) NOT NULL,
  technician VARCHAR(120),
  status VARCHAR(20) NOT NULL DEFAULT 'NUEVO'
    CHECK (status IN ('NUEVO', 'ASIGNADO', 'EN_PROCESO', 'RESUELTO', 'CERRADO')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS incident_comments (
  id BIGSERIAL PRIMARY KEY,
  incident_id BIGINT NOT NULL REFERENCES incidents(id) ON DELETE CASCADE,
  author VARCHAR(120) NOT NULL,
  comment TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_incidents_status ON incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON incidents(priority);
CREATE INDEX IF NOT EXISTS idx_incidents_category ON incidents(category);
CREATE INDEX IF NOT EXISTS idx_incidents_technician ON incidents(technician);

INSERT INTO incidents (title, description, category, priority, reporter, technician, status)
SELECT 'Impresora sin conexión', 'La impresora del área de recepción no responde.', 'Hardware', 'MEDIA', 'Ana López', 'Carlos Méndez', 'ASIGNADO'
WHERE NOT EXISTS (SELECT 1 FROM incidents);

INSERT INTO incident_comments (incident_id, author, comment)
SELECT id, 'Carlos Méndez', 'Se verificará el cable de red y la cola de impresión.'
FROM incidents WHERE title = 'Impresora sin conexión'
AND NOT EXISTS (SELECT 1 FROM incident_comments);
