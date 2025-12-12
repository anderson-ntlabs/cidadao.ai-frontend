-- ============================================
-- Add TV Brasil "Ciência é Tudo" Video
-- ============================================
-- Adds "Matemática no cotidiano" from TV Brasil
-- High quality PT-BR educational content
--
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-11
-- ============================================

-- Add "Matemática no cotidiano" to kids track historia-computacao
INSERT INTO public.agora_kids_videos (id, track_id, title, description, youtube_id, duration, display_order, validation_status, last_validated_at)
VALUES
    ('matematica-cotidiano', 'historia-computacao', 'Matematica no Cotidiano', 'Descubra como a matematica esta presente em tudo ao nosso redor! Da TV Brasil, programa Ciencia e Tudo.', 'r0aRKI5IUE0', '26:00', 8, 'valid', NOW())
ON CONFLICT (id) DO UPDATE SET
    youtube_id = 'r0aRKI5IUE0',
    title = 'Matematica no Cotidiano',
    description = 'Descubra como a matematica esta presente em tudo ao nosso redor! Da TV Brasil, programa Ciencia e Tudo.',
    duration = '26:00',
    validation_status = 'valid',
    last_validated_at = NOW();

-- Also add to adult track (IA module) as practical example
-- Module 1 of IA track - good context video
UPDATE public.agora_module_videos SET
    youtube_id = 'r0aRKI5IUE0',
    title = 'Matematica no Cotidiano - TV Brasil',
    channel = 'TV Brasil',
    channel_url = 'https://www.youtube.com/c/TVBrasil',
    duration = '26min',
    description = 'Como a matematica esta presente em tudo - base para entender IA',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id IN (
    SELECT youtube_id FROM public.agora_module_videos
    WHERE validation_status = 'pending'
    LIMIT 1
);
