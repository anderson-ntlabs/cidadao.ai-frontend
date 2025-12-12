-- ============================================
-- Fix Remaining Broken Videos
-- ============================================
-- Final fixes for the 2 remaining broken adult videos
--
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-11
-- ============================================

-- Fix 'Engenharia de Prompts Basica' - was 5DkWHqYDgvs (broken)
UPDATE public.agora_module_videos SET
    youtube_id = '8mei6uVttho',
    title = 'Introducao a Prompts de IA',
    channel = 'Curso em Video',
    duration = '15min',
    description = 'Como escrever prompts eficazes para IA',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = '5DkWHqYDgvs';

-- Fix 'Usando IA como Ferramenta de Estudo' - was Lx9dhtPjPEg (broken)
UPDATE public.agora_module_videos SET
    youtube_id = 'M2Af7gkbbro',
    title = 'IA para Estudos',
    channel = 'Curso em Video',
    duration = '12min',
    description = 'Como usar inteligencia artificial nos estudos',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'Lx9dhtPjPEg';
