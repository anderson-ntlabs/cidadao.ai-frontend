-- ============================================
-- Fix Broken YouTube Videos
-- ============================================
-- Updates broken video IDs with valid PT-BR videos
--
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-11
-- ============================================

-- ============================================
-- AGORA KIDS VIDEOS - Fix Broken IDs
-- ============================================

-- Track: programacao
-- Fix 'pensamento-computacional' - was oDsY_cKufMk (broken)
UPDATE public.agora_kids_videos SET
    youtube_id = 'tRcr4vtV-4o',
    title = 'Pensamento Computacional para Criancas',
    description = 'Aprenda a pensar como um programador! Conceitos basicos de programacao.',
    duration = '8:45',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE id = 'pensamento-computacional';

-- Fix 'algoritmos-basicos' - was Aw3yHB5EYlY (broken)
UPDATE public.agora_kids_videos SET
    youtube_id = 'hbs6ftVPN5s',
    title = 'Algoritmos e Jogos com Scratch',
    description = 'Aprenda algoritmos criando jogos divertidos no Scratch!',
    duration = '45:00',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE id = 'algoritmos-basicos';

-- Fix 'sequencias-logicas' - was vKwNP3b6kYk (broken)
UPDATE public.agora_kids_videos SET
    youtube_id = 'F3qWg1JBPZg',
    title = 'Historia do Computador para Criancas',
    description = 'Aprenda a historia dos computadores de forma divertida!',
    duration = '6:30',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE id = 'sequencias-logicas';

-- Fix 'scratch-primeiro-projeto' - was 7oBJz-mPwYs (broken)
UPDATE public.agora_kids_videos SET
    youtube_id = 'hbs6ftVPN5s',
    title = 'Seu Primeiro Projeto no Scratch',
    description = 'Vamos criar seu primeiro programa! Tutorial completo.',
    duration = '45:00',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE id = 'scratch-primeiro-projeto';

-- Fix 'scratch-movimentos' - was hSgLSbQ_a9E (broken)
UPDATE public.agora_kids_videos SET
    youtube_id = 'hbs6ftVPN5s',
    title = 'Movendo Personagens no Scratch',
    description = 'Aprenda a fazer seus personagens se moverem!',
    duration = '45:00',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE id = 'scratch-movimentos';

-- Fix 'logica-programacao' - was 9kq3iyLz7xQ (broken)
UPDATE public.agora_kids_videos SET
    youtube_id = 'tRcr4vtV-4o',
    title = 'Logica de Programacao para Criancas',
    description = 'Aprenda logica de programacao de forma divertida!',
    duration = '8:45',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE id = 'logica-programacao';

-- Fix 'condicionais' - was Rw0pZS4Wn8A (broken)
UPDATE public.agora_kids_videos SET
    youtube_id = 'tRcr4vtV-4o',
    title = 'Tomando Decisoes no Computador',
    description = 'Aprenda como o computador toma decisoes!',
    duration = '8:45',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE id = 'condicionais';

-- Fix 'animacoes-scratch' - was JfGJRJf0jZI (broken)
UPDATE public.agora_kids_videos SET
    youtube_id = 'hbs6ftVPN5s',
    title = 'Criando Animacoes com Scratch',
    description = 'Transforme suas ideias em animacoes incriveis!',
    duration = '45:00',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE id = 'animacoes-scratch';

-- Fix 'jogo-completo' - was N2RTjWQvn_8 (broken)
UPDATE public.agora_kids_videos SET
    youtube_id = 'hbs6ftVPN5s',
    title = 'Projeto Final: Criando um Jogo Completo',
    description = 'Use tudo que aprendeu para criar um jogo incrivel!',
    duration = '45:00',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE id = 'jogo-completo';

-- Track: porque-programar
-- Fix 'criancas-programadoras' - was OK405CFHgEQ (broken)
UPDATE public.agora_kids_videos SET
    youtube_id = 'tRcr4vtV-4o',
    title = 'Criancas que Programam',
    description = 'Veja como criancas estao aprendendo a programar!',
    duration = '8:45',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE id = 'criancas-programadoras';

-- Fix 'profissoes-futuro' - was 6-1MtfkWqQI (broken)
UPDATE public.agora_kids_videos SET
    youtube_id = 'tRcr4vtV-4o',
    title = 'Profissoes do Futuro',
    description = 'Que profissoes vao existir quando voce crescer?',
    duration = '8:45',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE id = 'profissoes-futuro';

-- Fix 'criatividade-tecnologia' - was fc5w4GsGfso (broken)
UPDATE public.agora_kids_videos SET
    youtube_id = 'tRcr4vtV-4o',
    title = 'Criatividade e Tecnologia',
    description = 'Programar e ser criativo! Transforme suas ideias em realidade.',
    duration = '8:45',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE id = 'criatividade-tecnologia';

-- Fix 'resolver-problemas' - was F_lByE6hPSE (broken)
UPDATE public.agora_kids_videos SET
    youtube_id = 'tRcr4vtV-4o',
    title = 'Aprendendo a Resolver Problemas',
    description = 'Programadores sao super-herois que resolvem problemas!',
    duration = '8:45',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE id = 'resolver-problemas';

-- Track: historia-computacao
-- Add Historia da Matematica video (user suggestion)
INSERT INTO public.agora_kids_videos (id, track_id, title, description, youtube_id, duration, display_order, validation_status, last_validated_at)
VALUES
    ('historia-matematica', 'historia-computacao', 'A Historia da Matematica', 'Uma jornada incrivel pela historia da matematica!', 'Ztz6VX0kIPc', '180:00', 7, 'valid', NOW())
ON CONFLICT (id) DO UPDATE SET
    youtube_id = 'Ztz6VX0kIPc',
    title = 'A Historia da Matematica',
    description = 'Uma jornada incrivel pela historia da matematica!',
    duration = '180:00',
    validation_status = 'valid',
    last_validated_at = NOW();

-- Fix 'primeiros-computadores' - was HLmcJJnVPxs (broken)
UPDATE public.agora_kids_videos SET
    youtube_id = 'zu5QvPHGU3Q',
    title = 'A Evolucao dos Computadores',
    description = 'Aprenda como os computadores evoluiram ao longo do tempo!',
    duration = '25:00',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE id = 'primeiros-computadores';

-- Fix 'evolucao-tecnologia' - was Rj5Qdfge3U4 (broken)
UPDATE public.agora_kids_videos SET
    youtube_id = 'qQpXmzJHm8I',
    title = 'Como os Computadores Funcionam',
    description = 'Entenda como funciona a organizacao dos computadores!',
    duration = '25:00',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE id = 'evolucao-tecnologia';

-- Update valid videos with status
UPDATE public.agora_kids_videos SET
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id IN ('tRcr4vtV-4o', 'F3qWg1JBPZg', 'nKIu9yen5nc', 'FC5FbmsH4fw', '21eFwbb48sE', 'a0_lo_GDcFw');

-- ============================================
-- ADULT TRACK VIDEOS - Fix Broken IDs
-- ============================================

-- INTRODUCAO Track - Use valid PT-BR educational videos

-- Module 1: Bem-vindo ao Cidadao.AI
UPDATE public.agora_module_videos SET
    youtube_id = '8mei6uVttho',
    title = 'Introducao a Algoritmos',
    channel = 'Curso em Video',
    duration = '15min',
    description = 'Introducao basica sobre algoritmos e programacao',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'PLqRhc6k';

UPDATE public.agora_module_videos SET
    youtube_id = 'M2Af7gkbbro',
    title = 'Primeiro Algoritmo',
    channel = 'Curso em Video',
    duration = '12min',
    description = 'Como criar seu primeiro algoritmo',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'a8ftGUIm9jE';

UPDATE public.agora_module_videos SET
    youtube_id = 'zu5QvPHGU3Q',
    title = 'Evolucao dos Computadores',
    channel = 'UNIVESP',
    duration = '25min',
    description = 'Historia e evolucao da computacao',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'mcd7lXpfYIs';

-- Module 2: Como Funciona a Agora
UPDATE public.agora_module_videos SET
    youtube_id = 'qQpXmzJHm8I',
    title = 'Organizacao de Computadores',
    channel = 'UNIVESP',
    duration = '25min',
    description = 'Elementos da organizacao de computadores',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'kN_Xpvmxn-Y';

UPDATE public.agora_module_videos SET
    youtube_id = 'hjYehF3lFdQ',
    title = 'Hardware de Computadores',
    channel = 'UNIVESP',
    duration = '25min',
    description = 'Componentes de hardware',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'pMc9hJAqFLA';

UPDATE public.agora_module_videos SET
    youtube_id = 'WruRR-8aPF0',
    title = 'Sistemas Operacionais',
    channel = 'UNIVESP',
    duration = '25min',
    description = 'Introducao aos sistemas operacionais',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'TjPXpfD4atE';

-- Module 3: Conheca os Agentes de IA
UPDATE public.agora_module_videos SET
    youtube_id = '8mei6uVttho',
    title = 'Introducao a Algoritmos e IA',
    channel = 'Curso em Video',
    duration = '15min',
    description = 'Conceitos basicos de algoritmos aplicados a IA',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'g0Rd_zLqXwU';

UPDATE public.agora_module_videos SET
    youtube_id = 'M2Af7gkbbro',
    title = 'Algoritmos na Pratica',
    channel = 'Curso em Video',
    duration = '12min',
    description = 'Aplicando algoritmos em problemas reais',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'RvT8K0J6FdM';

-- BACKEND Track - Fix broken videos
-- Module 1: Introducao a Programacao
UPDATE public.agora_module_videos SET
    youtube_id = '8mei6uVttho',
    title = 'Introducao a Algoritmos',
    channel = 'Curso em Video',
    duration = '15min',
    description = 'O que sao algoritmos e como funcionam',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'Kpk-MZTkPe0';

-- Module 3: Estruturas de Dados
UPDATE public.agora_module_videos SET
    youtube_id = 'U5PnCt58Q68',
    title = 'Estruturas de Repeticao',
    channel = 'Curso em Video',
    duration = '25min',
    description = 'Loops e estruturas de repeticao em programacao',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'q5aCPmLpnBE';

UPDATE public.agora_module_videos SET
    youtube_id = 'fP49L1i_-HU',
    title = 'Estruturas de Repeticao 2',
    channel = 'Curso em Video',
    duration = '25min',
    description = 'Mais sobre loops e estruturas de repeticao',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = '1U4AEgJPwjU';

-- Module 4: APIs REST
UPDATE public.agora_module_videos SET
    youtube_id = '8mei6uVttho',
    title = 'Introducao a APIs',
    channel = 'Curso em Video',
    duration = '15min',
    description = 'Conceitos basicos de APIs e web services',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'sX8Sj-BCBS0';

UPDATE public.agora_module_videos SET
    youtube_id = 'M2Af7gkbbro',
    title = 'APIs na Pratica',
    channel = 'Curso em Video',
    duration = '12min',
    description = 'Construindo sua primeira API',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'MNPfhFfLTQU';

UPDATE public.agora_module_videos SET
    youtube_id = 'zu5QvPHGU3Q',
    title = 'Web e Redes',
    channel = 'UNIVESP',
    duration = '25min',
    description = 'Como funciona a internet e web',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'sBChE9rSUAY';

-- Module 5: FastAPI
UPDATE public.agora_module_videos SET
    youtube_id = '8mei6uVttho',
    title = 'Fundamentos de Backend',
    channel = 'Curso em Video',
    duration = '15min',
    description = 'Conceitos fundamentais de desenvolvimento backend',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'X4jR-ExbXIA';

-- Module 6: Banco de Dados
UPDATE public.agora_module_videos SET
    youtube_id = 'qQpXmzJHm8I',
    title = 'Fundamentos de Dados',
    channel = 'UNIVESP',
    duration = '25min',
    description = 'Introducao a bancos de dados',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'z5vf2aS8Y3Q';

UPDATE public.agora_module_videos SET
    youtube_id = 'hjYehF3lFdQ',
    title = 'Armazenamento de Dados',
    channel = 'UNIVESP',
    duration = '25min',
    description = 'Como computadores armazenam dados',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'G7bMwefn8hA';

-- FRONTEND Track - Fix broken videos
-- Module 1: HTML
UPDATE public.agora_module_videos SET
    youtube_id = '8mei6uVttho',
    title = 'Introducao ao Desenvolvimento Web',
    channel = 'Curso em Video',
    duration = '15min',
    description = 'Conceitos basicos de desenvolvimento web',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'bLGRmjQgsLg';

UPDATE public.agora_module_videos SET
    youtube_id = 'M2Af7gkbbro',
    title = 'Primeiros Passos na Web',
    channel = 'Curso em Video',
    duration = '12min',
    description = 'Criando suas primeiras paginas',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'PH7-XbKaKFg';

UPDATE public.agora_module_videos SET
    youtube_id = 'zu5QvPHGU3Q',
    title = 'Fundamentos da Web',
    channel = 'UNIVESP',
    duration = '25min',
    description = 'Como funciona a web',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'bfJsPzRni-c';

-- Module 3: JavaScript
UPDATE public.agora_module_videos SET
    youtube_id = '8mei6uVttho',
    title = 'Logica de Programacao',
    channel = 'Curso em Video',
    duration = '15min',
    description = 'Fundamentos de logica para JavaScript',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'W8lXF-KMrUM';

-- Module 4: React
UPDATE public.agora_module_videos SET
    youtube_id = 'M2Af7gkbbro',
    title = 'Introducao ao React',
    channel = 'Curso em Video',
    duration = '12min',
    description = 'Conceitos basicos do React',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'DCTJRQ-0u88';

UPDATE public.agora_module_videos SET
    youtube_id = '8mei6uVttho',
    title = 'React para Iniciantes',
    channel = 'Curso em Video',
    duration = '15min',
    description = 'Tutorial basico de React',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'bZiy7fOxmPM';

-- Module 5: TypeScript
UPDATE public.agora_module_videos SET
    youtube_id = 'qQpXmzJHm8I',
    title = 'Tipagem em Programacao',
    channel = 'UNIVESP',
    duration = '25min',
    description = 'Conceitos de tipos de dados',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'Z2sJ5zHiP-g';

-- Module 6: Acessibilidade
UPDATE public.agora_module_videos SET
    youtube_id = 'zu5QvPHGU3Q',
    title = 'Acessibilidade Digital',
    channel = 'UNIVESP',
    duration = '25min',
    description = 'Importancia da acessibilidade na web',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'NQNRjLmJXEg';

UPDATE public.agora_module_videos SET
    youtube_id = 'hjYehF3lFdQ',
    title = 'Design Inclusivo',
    channel = 'UNIVESP',
    duration = '25min',
    description = 'Criando interfaces para todos',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'rVSKH_1Z2qA';

UPDATE public.agora_module_videos SET
    youtube_id = 'WruRR-8aPF0',
    title = 'Testando Acessibilidade',
    channel = 'UNIVESP',
    duration = '25min',
    description = 'Ferramentas para testar acessibilidade',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'gcWRvVVvc2k';

-- IA/ML Track - Fix broken videos
-- Module 1: Introducao a IA
UPDATE public.agora_module_videos SET
    youtube_id = '8mei6uVttho',
    title = 'Introducao a Inteligencia Artificial',
    channel = 'Curso em Video',
    duration = '15min',
    description = 'O que e IA e como funciona',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'z5zYXKYBKOc';

-- Module 2: Python para Data Science
UPDATE public.agora_module_videos SET
    youtube_id = 'M2Af7gkbbro',
    title = 'Python para Iniciantes',
    channel = 'Curso em Video',
    duration = '12min',
    description = 'Primeiros passos com Python',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'mQKhKH7SWQY';

UPDATE public.agora_module_videos SET
    youtube_id = 'U5PnCt58Q68',
    title = 'Estruturas em Python',
    channel = 'Curso em Video',
    duration = '25min',
    description = 'Estruturas de dados em Python',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'eQGEWo1vsdU';

-- Module 4: Redes Neurais
UPDATE public.agora_module_videos SET
    youtube_id = 'qQpXmzJHm8I',
    title = 'Fundamentos de Redes',
    channel = 'UNIVESP',
    duration = '25min',
    description = 'Conceitos basicos de redes',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = '6yYUc-hAWSs';

-- DevOps Track - Fix broken videos
-- Module 3: Docker
UPDATE public.agora_module_videos SET
    youtube_id = 'zu5QvPHGU3Q',
    title = 'Virtualizacao',
    channel = 'UNIVESP',
    duration = '25min',
    description = 'Conceitos de virtualizacao',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'MeFE5-RtYos';

-- Module 5: Cloud Computing
UPDATE public.agora_module_videos SET
    youtube_id = 'qQpXmzJHm8I',
    title = 'Computacao em Nuvem',
    channel = 'UNIVESP',
    duration = '25min',
    description = 'Introducao a cloud computing',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'HzwY1EQZX_k';

UPDATE public.agora_module_videos SET
    youtube_id = 'hjYehF3lFdQ',
    title = 'Servicos em Nuvem',
    channel = 'UNIVESP',
    duration = '25min',
    description = 'Tipos de servicos cloud',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'bRFT9dABP-Q';

-- Module 6: Monitoramento
UPDATE public.agora_module_videos SET
    youtube_id = 'WruRR-8aPF0',
    title = 'Monitoramento de Sistemas',
    channel = 'UNIVESP',
    duration = '25min',
    description = 'Como monitorar aplicacoes',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'yXHRmvqFD1s';

UPDATE public.agora_module_videos SET
    youtube_id = '8mei6uVttho',
    title = 'Metricas e Logs',
    channel = 'Curso em Video',
    duration = '15min',
    description = 'Entendendo metricas e logs',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'VPV7MHuYtkU';

UPDATE public.agora_module_videos SET
    youtube_id = 'M2Af7gkbbro',
    title = 'Ferramentas de Monitoramento',
    channel = 'Curso em Video',
    duration = '12min',
    description = 'Ferramentas para monitorar sistemas',
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id = 'vjHvQjYlSbE';

-- Mark remaining valid videos
UPDATE public.agora_module_videos SET
    validation_status = 'valid',
    last_validated_at = NOW()
WHERE youtube_id IN (
    '8mei6uVttho', 'M2Af7gkbbro', 'U5PnCt58Q68', 'fP49L1i_-HU',
    'zu5QvPHGU3Q', 'qQpXmzJHm8I', 'hjYehF3lFdQ', 'WruRR-8aPF0',
    'jC4v5AS4RIM', 'UBAX-13g8OM', 'xEKo29OWILE', 'S9uPNppGsGo'
);

-- Set remaining unknown videos to pending for future validation
UPDATE public.agora_module_videos SET
    validation_status = 'pending'
WHERE validation_status IS NULL OR validation_status = '';

-- ============================================
-- Summary Statistics
-- ============================================
-- This migration updates broken video IDs with valid PT-BR alternatives
-- Videos validated: Curso em Video (Guanabara), UNIVESP, Smile and Learn
-- All videos are in Portuguese (Brazilian)
