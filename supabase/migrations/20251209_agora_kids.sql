-- Migration: Ágora Kids Mode
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-09
-- Description: Tables for Kids mode with parental controls

-- Tabela de perfis Kids
CREATE TABLE IF NOT EXISTS agora_kids_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID REFERENCES auth.users NOT NULL,
  child_name TEXT NOT NULL,
  child_avatar TEXT DEFAULT 'lobato',
  parent_email TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  is_active BOOLEAN DEFAULT TRUE,
  UNIQUE(parent_user_id)
);

-- Sessões Kids (tracking para pais)
CREATE TABLE IF NOT EXISTS agora_kids_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  kids_profile_id UUID REFERENCES agora_kids_profiles(id) ON DELETE CASCADE NOT NULL,
  started_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  duration_minutes INTEGER DEFAULT 0,
  videos_watched TEXT[] DEFAULT '{}',
  agents_interacted TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Códigos de acesso parental
CREATE TABLE IF NOT EXISTS agora_parental_codes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_user_id UUID REFERENCES auth.users NOT NULL,
  code TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  used_at TIMESTAMPTZ
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_kids_profiles_parent ON agora_kids_profiles(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_kids_sessions_profile ON agora_kids_sessions(kids_profile_id);
CREATE INDEX IF NOT EXISTS idx_kids_sessions_date ON agora_kids_sessions(started_at);
CREATE INDEX IF NOT EXISTS idx_parental_codes_parent ON agora_parental_codes(parent_user_id);
CREATE INDEX IF NOT EXISTS idx_parental_codes_code ON agora_parental_codes(code);
CREATE INDEX IF NOT EXISTS idx_parental_codes_expires ON agora_parental_codes(expires_at);

-- RLS Policies
ALTER TABLE agora_kids_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agora_kids_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE agora_parental_codes ENABLE ROW LEVEL SECURITY;

-- Políticas para agora_kids_profiles
CREATE POLICY "Users can view own kids profile"
  ON agora_kids_profiles FOR SELECT
  USING (auth.uid() = parent_user_id);

CREATE POLICY "Users can insert own kids profile"
  ON agora_kids_profiles FOR INSERT
  WITH CHECK (auth.uid() = parent_user_id);

CREATE POLICY "Users can update own kids profile"
  ON agora_kids_profiles FOR UPDATE
  USING (auth.uid() = parent_user_id);

CREATE POLICY "Users can delete own kids profile"
  ON agora_kids_profiles FOR DELETE
  USING (auth.uid() = parent_user_id);

-- Políticas para agora_kids_sessions
CREATE POLICY "Users can view own kids sessions"
  ON agora_kids_sessions FOR SELECT
  USING (
    kids_profile_id IN (
      SELECT id FROM agora_kids_profiles WHERE parent_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own kids sessions"
  ON agora_kids_sessions FOR INSERT
  WITH CHECK (
    kids_profile_id IN (
      SELECT id FROM agora_kids_profiles WHERE parent_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own kids sessions"
  ON agora_kids_sessions FOR UPDATE
  USING (
    kids_profile_id IN (
      SELECT id FROM agora_kids_profiles WHERE parent_user_id = auth.uid()
    )
  );

-- Políticas para agora_parental_codes
CREATE POLICY "Users can view own parental codes"
  ON agora_parental_codes FOR SELECT
  USING (auth.uid() = parent_user_id);

CREATE POLICY "Users can insert own parental codes"
  ON agora_parental_codes FOR INSERT
  WITH CHECK (auth.uid() = parent_user_id);

-- Função para gerar código parental único
CREATE OR REPLACE FUNCTION generate_parental_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  result TEXT := '';
  i INTEGER;
BEGIN
  FOR i IN 1..6 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Função para criar ou atualizar código parental
CREATE OR REPLACE FUNCTION create_parental_access_code(p_parent_user_id UUID)
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
BEGIN
  -- Gera código único
  new_code := generate_parental_code();

  -- Remove códigos antigos do mesmo pai
  DELETE FROM agora_parental_codes
  WHERE parent_user_id = p_parent_user_id;

  -- Insere novo código
  INSERT INTO agora_parental_codes (parent_user_id, code)
  VALUES (p_parent_user_id, new_code);

  RETURN new_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para validar código parental
CREATE OR REPLACE FUNCTION validate_parental_code(p_code TEXT)
RETURNS TABLE (
  is_valid BOOLEAN,
  parent_user_id UUID,
  kids_profile_id UUID,
  child_name TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    CASE
      WHEN pc.expires_at > NOW() AND pc.used_at IS NULL THEN TRUE
      ELSE FALSE
    END as is_valid,
    pc.parent_user_id,
    kp.id as kids_profile_id,
    kp.child_name
  FROM agora_parental_codes pc
  LEFT JOIN agora_kids_profiles kp ON kp.parent_user_id = pc.parent_user_id
  WHERE pc.code = p_code;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter estatísticas Kids para relatório
CREATE OR REPLACE FUNCTION get_kids_daily_stats(
  p_kids_profile_id UUID,
  p_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
  total_minutes INTEGER,
  total_sessions INTEGER,
  videos_watched TEXT[],
  agents_used TEXT[]
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    COALESCE(SUM(duration_minutes), 0)::INTEGER as total_minutes,
    COUNT(*)::INTEGER as total_sessions,
    ARRAY_AGG(DISTINCT unnest) FILTER (WHERE unnest IS NOT NULL) as videos_watched,
    ARRAY_AGG(DISTINCT agent) FILTER (WHERE agent IS NOT NULL) as agents_used
  FROM agora_kids_sessions,
    LATERAL unnest(videos_watched) WITH ORDINALITY,
    LATERAL unnest(agents_interacted) as agent
  WHERE kids_profile_id = p_kids_profile_id
    AND DATE(started_at) = p_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION update_kids_profile_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_kids_profile_updated_at
  BEFORE UPDATE ON agora_kids_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_kids_profile_updated_at();

-- Comentários para documentação
COMMENT ON TABLE agora_kids_profiles IS 'Perfis de modo Kids vinculados a contas de pais';
COMMENT ON TABLE agora_kids_sessions IS 'Sessões de uso no modo Kids para relatórios parentais';
COMMENT ON TABLE agora_parental_codes IS 'Códigos de acesso temporários para dashboard parental';
COMMENT ON FUNCTION generate_parental_code() IS 'Gera código alfanumérico de 6 caracteres';
COMMENT ON FUNCTION create_parental_access_code(UUID) IS 'Cria novo código de acesso parental';
COMMENT ON FUNCTION validate_parental_code(TEXT) IS 'Valida código e retorna dados do perfil Kids';
COMMENT ON FUNCTION get_kids_daily_stats(UUID, DATE) IS 'Retorna estatísticas diárias para relatório';
