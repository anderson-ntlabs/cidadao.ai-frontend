-- ============================================
-- Agora Learning Tracks Seed Data
-- ============================================
-- Populates tracks, modules, videos for both
-- Agora (adults) and Agora Kids
--
-- Author: Anderson Henrique da Silva
-- Date: 2025-12-11
-- ============================================

-- ============================================
-- AGORA TRACKS (Adults)
-- ============================================

-- Insert tracks (order matters for prerequisite FK)
INSERT INTO public.agora_tracks (id, name, subtitle, description, icon, color, gradient, duration, xp_total, certificate_hours, is_intro, prerequisite_id, mentor_id, mentor_name, mentor_role, mentor_image, mentor_greeting, mentor_video_intro, mentor_diary_encouragement, mentor_chat_invitation, display_order)
VALUES
    ('introducao', 'Introducao', 'Conheca o Cidadao.AI', 'Descubra a plataforma, conheca os agentes de IA e aprenda como aproveitar ao maximo a Agora Academy', 'GraduationCap', 'emerald', 'from-emerald-500 to-teal-500', '1-2 horas', 500, 2, TRUE, NULL, 'abaporu', 'Abaporu', 'Agente Orquestrador', '/agents/abaporu.webp', 'Bem-vindo ao Cidadao.AI! Sou Abaporu, o agente orquestrador inspirado na obra de Tarsila do Amaral. Vou te guiar pelos primeiros passos nesta jornada incrivel!', 'Assista os videos para conhecer nossa plataforma. Escolha o estilo que preferir!', 'Excelente! Anotar suas impressoes ajuda a fixar o conhecimento. Quanto mais escrever, mais XP ganha!', 'Tem duvidas sobre o projeto ou a plataforma? Estou aqui para ajudar!', 1),

    ('backend', 'Backend', 'APIs & Arquitetura', 'Aprenda a construir APIs robustas, microsservicos e arquiteturas escalaveis com Python e FastAPI', 'Server', 'blue', 'from-blue-500 to-cyan-500', '4-6 semanas', 2000, 12, FALSE, 'introducao', 'santos-dumont', 'Santos-Dumont', 'Mentor de Engenharia', '/agents/santos-dumont.webp', 'Ola, futuro engenheiro! Sou Santos-Dumont, seu mentor na trilha de Backend. Assim como construi maquinas que desafiaram os ceus, voce vai construir sistemas que sustentam a internet!', 'Agora, assista o video que selecionamos para este modulo. Escolha o estilo que mais combina com voce!', 'Excelente reflexao! Anotar suas ideias e como eu fazia com meus projetos de aviacao. Cada palavra conta!', 'Quer conversar sobre o que aprendeu? Estou aqui para tirar suas duvidas!', 2),

    ('frontend', 'Frontend', 'UI/UX & React', 'Crie interfaces incriveis com React, Next.js e design system profissional', 'Palette', 'purple', 'from-purple-500 to-pink-500', '4-6 semanas', 2000, 12, FALSE, 'introducao', 'bobardi', 'Lina Bo Bardi', 'Mentora de Design', '/agents/bobardi.webp', 'Bem-vindo a trilha de Frontend! Sou Lina Bo Bardi, sua mentora em design e interfaces. Assim como projetei espacos que transformam experiencias, voce vai criar interfaces que encantam usuarios!', 'Hora de assistir! Escolha o estilo de video que mais te agrada.', 'Adoro sua reflexao! Designers anotam tudo - inspiracoes, ideias, criticas.', 'Vamos conversar sobre design e codigo? Adoraria ouvir suas ideias criativas!', 3),

    ('ia', 'IA/ML', 'Agentes & LLMs', 'Domine inteligencia artificial, agentes autonomos e Large Language Models', 'Brain', 'green', 'from-green-500 to-emerald-500', '6-8 semanas', 2500, 14, FALSE, 'introducao', 'santos-dumont', 'Santos-Dumont', 'Mentor de Engenharia', '/agents/santos-dumont.webp', 'Bem-vindo a fronteira da inovacao! Assim como sonhei com maquinas voadoras, hoje sonhamos com maquinas que pensam. Vamos explorar a Inteligencia Artificial juntos!', 'Este modulo vai expandir sua mente! Escolha como quer aprender.', 'IA e um campo em constante evolucao. Suas reflexoes de hoje serao o conhecimento de amanha!', 'IA e fascinante e complexa. Vamos conversar e desvendar seus misterios?', 4),

    ('devops', 'DevOps', 'Cloud & CI/CD', 'Aprenda infraestrutura, containers, deploy automatizado e monitoramento', 'Code', 'orange', 'from-orange-500 to-amber-500', '4-6 semanas', 2000, 12, FALSE, 'introducao', 'santos-dumont', 'Santos-Dumont', 'Mentor de Engenharia', '/agents/santos-dumont.webp', 'Ola, engenheiro de infraestrutura! Assim como eu precisava de oficinas e ferramentas para construir meus avioes, voce vai dominar as ferramentas que fazem software voar na nuvem!', 'DevOps e sobre automacao e eficiencia. Escolha seu estilo de aprendizado!', 'Documentar processos e essencial em DevOps. Seu diario e seu runbook pessoal!', 'Infraestrutura pode ser complexa. Vamos simplificar juntos?', 5)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- INTRODUCAO MODULES
-- ============================================

INSERT INTO public.agora_modules (track_id, module_number, title, description, objectives, xp_reward, diary_prompt, chat_prompt, display_order)
VALUES
    ('introducao', 1, 'Bem-vindo ao Cidadao.AI', 'Conheca o projeto de transparencia publica com IA', ARRAY['Entender a missao do Cidadao.AI', 'Conhecer a arquitetura do projeto', 'Descobrir como voce pode contribuir'], 50, 'O que te motivou a participar do Cidadao.AI? Como voce acha que pode contribuir?', 'Vamos conversar sobre o projeto e como voce pode ajudar!', 1),
    ('introducao', 2, 'Como Funciona a Agora', 'Entenda a plataforma de aprendizado gamificada', ARRAY['Conhecer o sistema de XP e badges', 'Entender as trilhas de aprendizado', 'Saber como ganhar o certificado'], 40, 'Como voce pretende organizar seus estudos na Agora? Quantas horas por semana?', 'Posso te ajudar a criar um plano de estudos personalizado!', 2),
    ('introducao', 3, 'Conheca os Agentes de IA', 'Descubra os 17 agentes brasileiros do sistema', ARRAY['Conhecer os principais agentes', 'Entender o papel de cada um', 'Saber quando usar cada agente'], 50, 'Qual agente te interessou mais? Zumbi, Anita, Tiradentes? Por que?', 'Quer saber mais sobre algum agente especifico?', 3),
    ('introducao', 4, 'Configurando seu GitHub', 'Prepare seu ambiente para contribuir com codigo', ARRAY['Criar ou configurar conta GitHub', 'Fazer fork do repositorio', 'Entender o fluxo de contribuicao'], 100, 'Qual e seu usuario do GitHub? O que voce achou do processo de fork?', 'Precisa de ajuda com Git ou GitHub? Posso te guiar!', 4),
    ('introducao', 5, 'Conversa com Abaporu', 'Sua primeira interacao com um agente mentor', ARRAY['Praticar interacao com agente IA', 'Tirar duvidas sobre o projeto', 'Conhecer as capacidades do mentor'], 60, 'O que voce achou de conversar com um agente de IA? Foi util?', 'Ola! Sou Abaporu, o orquestrador. Pode me perguntar qualquer coisa sobre o projeto!', 5),
    ('introducao', 6, 'Proximo Passo: Sua Trilha', 'Escolha sua especializacao e comece a jornada', ARRAY['Revisar o que aprendeu', 'Escolher sua trilha de especializacao', 'Definir metas de aprendizado'], 50, 'Qual trilha voce escolheu? Backend, Frontend, IA/ML ou DevOps? Por que?', 'Parabens por completar a introducao! Qual trilha voce vai seguir?', 6)
ON CONFLICT (track_id, module_number) DO NOTHING;

-- ============================================
-- BACKEND MODULES
-- ============================================

INSERT INTO public.agora_modules (track_id, module_number, title, description, objectives, xp_reward, diary_prompt, chat_prompt, display_order)
VALUES
    ('backend', 1, 'Introducao a Programacao', 'Fundamentos de logica de programacao e algoritmos', ARRAY['Entender o que e programacao', 'Aprender logica de programacao', 'Conhecer algoritmos basicos'], 100, 'O que voce entendeu sobre programacao? Como voce acha que ela pode ser util na sua vida?', 'Vamos conversar sobre logica de programacao e como ela se aplica no dia a dia?', 1),
    ('backend', 2, 'Python: Primeiros Passos', 'Introducao a linguagem Python e sintaxe basica', ARRAY['Instalar e configurar Python', 'Entender variaveis e tipos de dados', 'Escrever seus primeiros programas'], 120, 'Qual foi sua primeira impressao do Python? O que achou mais interessante?', 'Vamos praticar Python juntos? Posso te ajudar com exercicios!', 2),
    ('backend', 3, 'Estruturas de Dados', 'Listas, dicionarios, tuplas e conjuntos em Python', ARRAY['Manipular listas e arrays', 'Usar dicionarios para dados estruturados', 'Entender quando usar cada estrutura'], 130, 'Qual estrutura de dados voce achou mais util? Em que situacoes voce usaria cada uma?', 'Vamos explorar as estruturas de dados? Posso criar exemplos personalizados!', 3),
    ('backend', 4, 'APIs REST: Conceitos', 'Entendendo APIs, HTTP e arquitetura REST', ARRAY['Entender o que e uma API', 'Conhecer verbos HTTP (GET, POST, PUT, DELETE)', 'Aprender principios REST'], 140, 'Como voce explicaria o que e uma API para alguem que nao sabe programar?', 'Quer entender melhor como APIs funcionam na pratica?', 4),
    ('backend', 5, 'FastAPI: Construindo APIs', 'Criando APIs modernas com FastAPI em Python', ARRAY['Configurar um projeto FastAPI', 'Criar endpoints e rotas', 'Trabalhar com validacao de dados'], 160, 'O que voce achou do FastAPI? Que tipo de API voce gostaria de criar?', 'Vamos planejar sua primeira API juntos?', 5),
    ('backend', 6, 'Banco de Dados SQL', 'Fundamentos de bancos de dados relacionais', ARRAY['Entender modelagem de dados', 'Escrever queries SQL basicas', 'Conectar Python a bancos de dados'], 150, 'Qual a importancia de um banco de dados em uma aplicacao? O que voce aprendeu?', 'Posso te ajudar a entender SQL com exemplos praticos!', 6)
ON CONFLICT (track_id, module_number) DO NOTHING;

-- ============================================
-- FRONTEND MODULES
-- ============================================

INSERT INTO public.agora_modules (track_id, module_number, title, description, objectives, xp_reward, diary_prompt, chat_prompt, display_order)
VALUES
    ('frontend', 1, 'HTML: A Base da Web', 'Fundamentos de HTML e estruturacao de paginas', ARRAY['Entender a estrutura de documentos HTML', 'Usar tags semanticas corretamente', 'Criar formularios e tabelas'], 100, 'O que voce achou de aprender HTML? Que tipo de pagina voce gostaria de criar?', 'Vamos discutir estrutura de paginas e semantica HTML?', 1),
    ('frontend', 2, 'CSS: Estilizacao', 'Estilizando paginas web com CSS moderno', ARRAY['Aplicar estilos com seletores CSS', 'Usar Flexbox para layouts', 'Criar designs responsivos'], 120, 'O que voce achou do CSS? Qual propriedade te surpreendeu mais?', 'Quer explorar tecnicas avancadas de CSS comigo?', 2),
    ('frontend', 3, 'JavaScript: Interatividade', 'Adicionando comportamento as paginas web', ARRAY['Entender variaveis e funcoes em JS', 'Manipular o DOM', 'Responder a eventos do usuario'], 140, 'JavaScript e a linguagem da web! O que voce criaria com ela?', 'Vamos programar algo juntos em JavaScript?', 3),
    ('frontend', 4, 'React: Interfaces Modernas', 'Construindo SPAs com React', ARRAY['Entender componentes e props', 'Usar hooks (useState, useEffect)', 'Gerenciar estado da aplicacao'], 160, 'Como voce descreveria React para um amigo? O que mais te impressionou?', 'Vamos criar um componente React juntos?', 4),
    ('frontend', 5, 'TypeScript: Tipagem Segura', 'Adicionando tipos ao JavaScript', ARRAY['Entender tipos basicos em TS', 'Criar interfaces e types', 'Usar TypeScript com React'], 150, 'TypeScript ajuda a evitar bugs. Voce prefere JS ou TS? Por que?', 'Posso te ajudar a entender os tipos mais complexos!', 5),
    ('frontend', 6, 'Acessibilidade Web', 'Criando interfaces para todos', ARRAY['Entender WCAG e padroes a11y', 'Usar ARIA corretamente', 'Testar acessibilidade'], 130, 'Por que acessibilidade e importante? O que voce vai fazer diferente agora?', 'Vamos discutir como tornar suas interfaces mais acessiveis?', 6)
ON CONFLICT (track_id, module_number) DO NOTHING;

-- ============================================
-- IA/ML MODULES
-- ============================================

INSERT INTO public.agora_modules (track_id, module_number, title, description, objectives, xp_reward, diary_prompt, chat_prompt, display_order)
VALUES
    ('ia', 1, 'Introducao a IA', 'O que e Inteligencia Artificial e seu impacto', ARRAY['Entender o que e IA e ML', 'Conhecer aplicacoes praticas', 'Diferenciar tipos de aprendizado'], 100, 'O que voce acha que IA pode fazer no futuro? Quais sao seus medos e esperancas?', 'Vamos debater sobre o futuro da IA e seu impacto na sociedade?', 1),
    ('ia', 2, 'Python para Data Science', 'Bibliotecas essenciais: NumPy, Pandas', ARRAY['Manipular dados com Pandas', 'Usar NumPy para calculos', 'Visualizar dados com Matplotlib'], 130, 'Que tipo de dados voce gostaria de analisar? Negocios, esportes, saude?', 'Posso te ajudar a criar uma analise de dados personalizada!', 2),
    ('ia', 3, 'Machine Learning Basico', 'Algoritmos fundamentais de ML', ARRAY['Entender regressao e classificacao', 'Usar Scikit-learn', 'Treinar seu primeiro modelo'], 150, 'O que voce acha de ensinar uma maquina a aprender? E assustador ou empolgante?', 'Vamos treinar um modelo juntos passo a passo?', 3),
    ('ia', 4, 'Redes Neurais', 'Deep Learning e redes neurais artificiais', ARRAY['Entender neuronios artificiais', 'Conhecer arquiteturas de redes', 'Introducao ao TensorFlow/PyTorch'], 170, 'Como redes neurais imitam o cerebro? O que voce aprendeu de surpreendente?', 'Redes neurais sao fascinantes! Quer explorar alguma arquitetura especifica?', 4),
    ('ia', 5, 'LLMs e Prompts', 'Large Language Models e engenharia de prompts', ARRAY['Entender como LLMs funcionam', 'Escrever prompts eficazes', 'Usar APIs de LLMs (OpenAI, etc)'], 160, 'Como voce usaria LLMs no seu dia a dia ou trabalho?', 'Vamos praticar engenharia de prompts juntos!', 5),
    ('ia', 6, 'Agentes de IA', 'Construindo agentes autonomos com IA', ARRAY['Entender agentes de IA', 'Criar fluxos com LangChain', 'Implementar RAG basico'], 180, 'Que tipo de agente de IA voce criaria? Para resolver qual problema?', 'Vamos arquitetar um agente de IA juntos!', 6)
ON CONFLICT (track_id, module_number) DO NOTHING;

-- ============================================
-- DEVOPS MODULES
-- ============================================

INSERT INTO public.agora_modules (track_id, module_number, title, description, objectives, xp_reward, diary_prompt, chat_prompt, display_order)
VALUES
    ('devops', 1, 'Linux Essencial', 'Fundamentos do sistema operacional Linux', ARRAY['Navegar pelo terminal', 'Gerenciar arquivos e permissoes', 'Usar comandos essenciais'], 100, 'O que voce achou do Linux? Prefere interface grafica ou terminal?', 'Vamos praticar comandos Linux juntos?', 1),
    ('devops', 2, 'Git e Versionamento', 'Controle de versao com Git', ARRAY['Entender conceitos de versionamento', 'Usar Git no dia a dia', 'Trabalhar com branches e merges'], 110, 'Git pode parecer confuso no inicio. O que ficou mais claro agora?', 'Posso simular cenarios de Git com voce!', 2),
    ('devops', 3, 'Docker: Containers', 'Containerizacao de aplicacoes', ARRAY['Entender containers vs VMs', 'Criar e gerenciar containers', 'Escrever Dockerfiles'], 140, 'Docker muda a forma de desenvolver. Como voce usaria no seu projeto?', 'Vamos criar um Dockerfile juntos?', 3),
    ('devops', 4, 'CI/CD: Automacao', 'Integracao e entrega continua', ARRAY['Entender pipelines CI/CD', 'Configurar GitHub Actions', 'Automatizar testes e deploys'], 150, 'Automacao e poder! O que voce automatizaria primeiro?', 'Vamos configurar uma pipeline juntos?', 4),
    ('devops', 5, 'Cloud Computing', 'Introducao a computacao em nuvem', ARRAY['Entender servicos cloud', 'Conhecer AWS/GCP/Azure basico', 'Deploy na nuvem'], 160, 'Cloud mudou o mundo. Que projeto voce colocaria na nuvem?', 'Vamos explorar opcoes de cloud juntos?', 5),
    ('devops', 6, 'Monitoramento', 'Observabilidade e logs', ARRAY['Entender metricas e logs', 'Usar ferramentas de monitoramento', 'Criar alertas'], 140, 'Monitorar e prever problemas. O que voce monitoraria?', 'Vamos configurar dashboards juntos?', 6)
ON CONFLICT (track_id, module_number) DO NOTHING;

-- ============================================
-- AGORA KIDS TRACKS
-- ============================================

INSERT INTO public.agora_kids_tracks (id, name, description, emoji, color, display_order)
VALUES
    ('programacao', 'Programacao para Criancas', 'Aprenda a programar com Scratch e crie seus proprios jogos!', '🎮', 'kids-coral', 1),
    ('porque-programar', 'Por que Aprender a Programar?', 'Descubra os superpoderes que a programacao pode te dar!', '🦸', 'kids-turquoise', 2),
    ('historia-computacao', 'Historia da Computacao', 'Viaje no tempo e conheca a evolucao dos computadores!', '🕰', 'kids-purple', 3)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- AGORA KIDS VIDEOS - Programacao
-- ============================================

INSERT INTO public.agora_kids_videos (id, track_id, title, description, youtube_id, duration, display_order)
VALUES
    ('intro-programacao', 'programacao', 'O que e Programacao?', 'Descubra o que os programadores fazem e como eles criam jogos, apps e sites!', 'tRcr4vtV-4o', '10:30', 1),
    ('pensamento-computacional', 'programacao', 'Pensamento Computacional', 'Aprenda a pensar como um computador! Dividir problemas grandes em pedacinhos pequenos.', 'oDsY_cKufMk', '8:45', 2),
    ('algoritmos-basicos', 'programacao', 'Algoritmos: Receitas para o Computador', 'O que sao algoritmos? E como fazer uma receita de bolo!', 'Aw3yHB5EYlY', '7:20', 3),
    ('sequencias-logicas', 'programacao', 'Sequencias Logicas', 'Aprenda a colocar as coisas na ordem certa!', 'vKwNP3b6kYk', '9:15', 4),
    ('scratch-primeiro-projeto', 'programacao', 'Meu Primeiro Projeto no Scratch', 'Hora de colocar a mao na massa! Vamos criar seu primeiro programa.', '7oBJz-mPwYs', '15:00', 5),
    ('scratch-movimentos', 'programacao', 'Movendo Personagens no Scratch', 'Faca seus personagens andarem, pularem e dancarem!', 'hSgLSbQ_a9E', '12:00', 6),
    ('logica-programacao', 'programacao', 'Logica de Programacao com Jogos', 'Aprenda logica jogando! Desafios divertidos.', '9kq3iyLz7xQ', '12:15', 7),
    ('variaveis-explicadas', 'programacao', 'O que sao Variaveis?', 'Variaveis sao como caixinhas magicas que guardam informacoes!', 'KNUbPRj9TGM', '9:00', 8),
    ('loops-repeticao', 'programacao', 'Loops: Fazendo o Computador Repetir', 'Por que fazer 100 vezes se o computador pode repetir sozinho?', 'pTB0EiLXUC8', '11:30', 9),
    ('condicionais', 'programacao', 'Se... Entao: Tomando Decisoes', 'Ensine o computador a tomar decisoes!', 'Rw0pZS4Wn8A', '10:00', 10),
    ('animacoes-scratch', 'programacao', 'Criando Animacoes no Scratch', 'Transforme suas ideias em animacoes!', 'JfGJRJf0jZI', '14:00', 11),
    ('jogo-completo', 'programacao', 'Projeto Final: Seu Primeiro Jogo', 'Chegou a hora! Use tudo que aprendeu para criar um jogo completo.', 'N2RTjWQvn_8', '20:00', 12)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- AGORA KIDS VIDEOS - Por que Programar
-- ============================================

INSERT INTO public.agora_kids_videos (id, track_id, title, description, youtube_id, duration, display_order)
VALUES
    ('porque-aprender-codigo', 'porque-programar', 'Por que Aprender a Programar?', 'Descubra por que programacao e um superpoder!', 'nKIu9yen5nc', '5:44', 1),
    ('criancas-programadoras', 'porque-programar', 'Criancas que Programam', 'Conheca criancas incriveis que ja criam seus proprios jogos!', 'OK405CFHgEQ', '4:30', 2),
    ('profissoes-futuro', 'porque-programar', 'Profissoes do Futuro', 'Que profissoes vao existir quando voce crescer?', '6-1MtfkWqQI', '6:15', 3),
    ('criatividade-tecnologia', 'porque-programar', 'Criatividade e Tecnologia', 'Programar e ser criativo! Transforme suas ideias em realidade.', 'fc5w4GsGfso', '5:00', 4),
    ('resolver-problemas', 'porque-programar', 'Aprendendo a Resolver Problemas', 'Programadores sao super-herois que resolvem problemas!', 'F_lByE6hPSE', '4:45', 5),
    ('hora-do-codigo', 'porque-programar', 'A Hora do Codigo', 'Milhoes de criancas no mundo todo aprendem a programar!', 'FC5FbmsH4fw', '3:24', 6)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- AGORA KIDS VIDEOS - Historia da Computacao
-- ============================================

INSERT INTO public.agora_kids_videos (id, track_id, title, description, youtube_id, duration, display_order)
VALUES
    ('historia-computador', 'historia-computacao', 'A Historia do Computador', 'Do abaco ao computador! Viaje no tempo.', 'F3qWg1JBPZg', '6:30', 1),
    ('abaco-calculadora', 'historia-computacao', 'Do Abaco a Calculadora', 'Ha milhares de anos, as pessoas ja queriam calcular!', 'PvLaPKPzq2I', '5:45', 2),
    ('primeiros-computadores', 'historia-computacao', 'Os Primeiros Computadores', 'O ENIAC era do tamanho de uma sala!', 'HLmcJJnVPxs', '7:00', 3),
    ('evolucao-tecnologia', 'historia-computacao', 'A Evolucao da Tecnologia', 'De valvulas a microchips!', 'Rj5Qdfge3U4', '5:30', 4),
    ('internet-criancas', 'historia-computacao', 'Como Surgiu a Internet?', 'A internet conecta o mundo todo!', '21eFwbb48sE', '6:00', 5),
    ('robos-inteligencia-artificial', 'historia-computacao', 'Robos e Inteligencia Artificial', 'Robos que pensam? Conheca a inteligencia artificial!', 'a0_lo_GDcFw', '5:15', 6)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- ADULT TRACK VIDEOS
-- ============================================
-- Videos are inserted after modules exist
-- Each module has 3 video styles: academic, didactic, practical

DO $$
DECLARE
    v_module_id INTEGER;
BEGIN
    -- ========================================
    -- INTRODUCAO VIDEOS
    -- ========================================

    -- Module 1: Bem-vindo ao Cidadao.AI
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'introducao' AND module_number = 1;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Transparencia Publica e Dados Abertos', 'CGU', 'https://www.youtube.com/c/cikigovbr', 'PLqRhc6k', '15min', 'O que e transparencia publica e por que importa'),
        (v_module_id, 'didactic', 'Open Source para Iniciantes', 'Codigo Fonte TV', 'https://www.youtube.com/c/CodigoFonteTV', 'a8ftGUIm9jE', '12min', 'Como funciona software de codigo aberto'),
        (v_module_id, 'practical', 'Sua Primeira Contribuicao Open Source', 'Rafaella Ballerini', 'https://www.youtube.com/c/RafaellaBallerini', 'mcd7lXpfYIs', '20min', 'Passo a passo para contribuir')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 2: Como Funciona a Agora
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'introducao' AND module_number = 2;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Gamificacao na Educacao', 'UNIVESP', 'https://www.youtube.com/user/univesptv', 'kN_Xpvmxn-Y', '25min', 'Teoria de gamificacao educacional'),
        (v_module_id, 'didactic', 'Aprendizado Ativo e Pratico', 'Nerdologia', 'https://www.youtube.com/c/Nerdologia', 'pMc9hJAqFLA', '12min', 'Por que aprender fazendo funciona'),
        (v_module_id, 'practical', 'Organizando seus Estudos', 'Programacao Dinamica', 'https://www.youtube.com/c/ProgramacaoDinamica', 'TjPXpfD4atE', '15min', 'Dicas praticas de estudo para devs')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 3: Conheca os Agentes de IA
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'introducao' AND module_number = 3;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Agentes de IA - Conceitos', 'UNIVESP', 'https://www.youtube.com/user/univesptv', 'g0Rd_zLqXwU', '30min', 'Teoria sobre agentes inteligentes'),
        (v_module_id, 'didactic', 'Como Funciona o ChatGPT', 'Codigo Fonte TV', 'https://www.youtube.com/c/CodigoFonteTV', 'RvT8K0J6FdM', '18min', 'Entendendo LLMs e agentes'),
        (v_module_id, 'practical', 'Conversando com IA de Forma Eficiente', 'Filipe Deschamps', 'https://www.youtube.com/c/FilipeDeschamps', 'jC4v5AS4RIM', '20min', 'Dicas para usar IA no dia a dia')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 4: Configurando seu GitHub
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'introducao' AND module_number = 4;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Git e GitHub - Fundamentos', 'UNIVESP', 'https://www.youtube.com/user/univesptv', 'UBAX-13g8OM', '28min', 'Teoria de versionamento'),
        (v_module_id, 'didactic', 'Curso Git e GitHub Completo', 'Curso em Video', 'https://www.youtube.com/c/CursoemVideo', 'xEKo29OWILE', '35min', 'Tutorial passo a passo'),
        (v_module_id, 'practical', 'Fazendo Fork e Pull Request', 'Rafaella Ballerini', 'https://www.youtube.com/c/RafaellaBallerini', 'UBAX-13g8OM', '25min', 'Contribuindo na pratica')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 5: Conversa com Abaporu
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'introducao' AND module_number = 5;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Dialogos com IA', 'USP', 'https://www.youtube.com/user/uspdigitais', 'zjkBMFhNj_g', '20min', 'Como interagir efetivamente com IA'),
        (v_module_id, 'didactic', 'Engenharia de Prompts Basica', 'Codigo Fonte TV', 'https://www.youtube.com/c/CodigoFonteTV', '5DkWHqYDgvs', '15min', 'Como fazer boas perguntas para IA'),
        (v_module_id, 'practical', 'Usando IA como Ferramenta de Estudo', 'Programacao Dinamica', 'https://www.youtube.com/c/ProgramacaoDinamica', 'Lx9dhtPjPEg', '18min', 'Dicas praticas')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 6: Proximo Passo: Sua Trilha
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'introducao' AND module_number = 6;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Carreiras em Tecnologia', 'UNIVESP', 'https://www.youtube.com/user/univesptv', 'Kpk-MZTkPe0', '25min', 'Panorama das areas de TI'),
        (v_module_id, 'didactic', 'Backend vs Frontend vs IA', 'Codigo Fonte TV', 'https://www.youtube.com/c/CodigoFonteTV', 'ghTrp1x_1As', '15min', 'Comparando as areas'),
        (v_module_id, 'practical', 'Como Escolher sua Area', 'Filipe Deschamps', 'https://www.youtube.com/c/FilipeDeschamps', 'BTENKdRVS2U', '12min', 'Dicas para decidir')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- ========================================
    -- BACKEND VIDEOS
    -- ========================================

    -- Module 1: Introducao a Programacao
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'backend' AND module_number = 1;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Introducao a Computacao - Aula 1', 'UNIVESP', 'https://www.youtube.com/user/univesptv', 'Kpk-MZTkPe0', '25min', 'Aula formal da Universidade Virtual do Estado de Sao Paulo'),
        (v_module_id, 'didactic', 'Curso de Algoritmo #01 - Logica de Programacao', 'Curso em Video', 'https://www.youtube.com/c/CursoemVideo', '8mei6uVttho', '20min', 'Professor Gustavo Guanabara explica de forma clara e divertida'),
        (v_module_id, 'practical', 'Como COMECAR a programar? Passo a passo', 'Filipe Deschamps', 'https://www.youtube.com/c/FilipeDeschamps', 'BTENKdRVS2U', '15min', 'Dicas praticas de quem trabalha na area')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 2: Python: Primeiros Passos
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'backend' AND module_number = 2;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Python para Iniciantes - UNIVESP', 'UNIVESP', 'https://www.youtube.com/user/univesptv', 'lJjR906426o', '30min', 'Curso oficial de programacao da UNIVESP'),
        (v_module_id, 'didactic', 'Curso Python #01 - Mundo 1: Fundamentos', 'Curso em Video', 'https://www.youtube.com/c/CursoemVideo', 'S9uPNppGsGo', '35min', 'Serie completa do Guanabara sobre Python'),
        (v_module_id, 'practical', 'Python em 1 hora - Tutorial para Iniciantes', 'Programacao Dinamica', 'https://www.youtube.com/c/ProgramacaoDinamica', 'yTQDbqmv8Ho', '60min', 'Curso intensivo e pratico de Python')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 3: Estruturas de Dados
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'backend' AND module_number = 3;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Estruturas de Dados - Conceitos', 'UNIVESP', 'https://www.youtube.com/user/univesptv', 'q5aCPmLpnBE', '28min', 'Fundamentos teoricos de estruturas de dados'),
        (v_module_id, 'didactic', 'Python #14 - Listas (Parte 1)', 'Curso em Video', 'https://www.youtube.com/c/CursoemVideo', 'nIHq1MtJaKs', '32min', 'Guanabara ensina listas em Python'),
        (v_module_id, 'practical', 'Estruturas de Dados em Python na Pratica', 'Eduardo Mendes', 'https://www.youtube.com/c/EduardoMendes', '1U4AEgJPwjU', '45min', 'Exemplos reais de uso de estruturas')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 4: APIs REST: Conceitos
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'backend' AND module_number = 4;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Web Services e APIs - Conceitos', 'UNIVESP', 'https://www.youtube.com/user/univesptv', 'sX8Sj-BCBS0', '24min', 'Teoria sobre APIs e servicos web'),
        (v_module_id, 'didactic', 'O que e API? REST e RESTful?', 'Codigo Fonte TV', 'https://www.youtube.com/c/CodigoFonteTV', 'ghTrp1x_1As', '15min', 'Gabriel e Vanessa explicam APIs de forma simples'),
        (v_module_id, 'practical', 'Criando sua primeira API', 'Rocketseat', 'https://www.youtube.com/c/RocketSeat', 'BN_8bCfVp88', '20min', 'Mao na massa criando APIs')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 5: FastAPI: Construindo APIs
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'backend' AND module_number = 5;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'FastAPI - Documentacao Automatica', 'Python Cafe', 'https://www.youtube.com/c/PythonCafe', 'MNPfhFfLTQU', '30min', 'Explicacao tecnica detalhada'),
        (v_module_id, 'didactic', 'Curso de FastAPI - Introducao Completa', 'DevAprender', 'https://www.youtube.com/c/DevAprender', 'sBChE9rSUAY', '45min', 'Tutorial passo a passo com FastAPI'),
        (v_module_id, 'practical', 'API com FastAPI em 30 minutos', 'Rodrigo Manguinho', 'https://www.youtube.com/c/RodrigoManguinho', 'X4jR-ExbXIA', '30min', 'Projeto pratico do zero')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 6: Banco de Dados SQL
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'backend' AND module_number = 6;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Banco de Dados - Conceitos Fundamentais', 'UNIVESP', 'https://www.youtube.com/user/univesptv', 'z5vf2aS8Y3Q', '35min', 'Teoria de banco de dados relacional'),
        (v_module_id, 'didactic', 'Curso MySQL #01 - O que e Banco de Dados?', 'Curso em Video', 'https://www.youtube.com/c/CursoemVideo', 'Ofktsne-utM', '28min', 'Introducao a bancos de dados'),
        (v_module_id, 'practical', 'SQL para Analise de Dados', 'Programacao Dinamica', 'https://www.youtube.com/c/ProgramacaoDinamica', 'G7bMwefn8hA', '50min', 'SQL na pratica com exemplos reais')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- ========================================
    -- FRONTEND VIDEOS
    -- ========================================

    -- Module 1: HTML: A Base da Web
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'frontend' AND module_number = 1;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Desenvolvimento Web - HTML Basico', 'UNIVESP', 'https://www.youtube.com/user/univesptv', 'bLGRmjQgsLg', '28min', 'Fundamentos de HTML da universidade'),
        (v_module_id, 'didactic', 'Curso HTML5 #01 - Historia da Internet', 'Curso em Video', 'https://www.youtube.com/c/CursoemVideo', 'epDCjksKMok', '35min', 'Guanabara conta a historia e ensina HTML'),
        (v_module_id, 'practical', 'HTML em 1 hora - Curso Completo', 'Rafaella Ballerini', 'https://www.youtube.com/c/RafaellaBallerini', '3oSIqIqzN3M', '60min', 'Projeto pratico do inicio ao fim')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 2: CSS: Estilizacao
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'frontend' AND module_number = 2;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'CSS - Conceitos e Aplicacoes', 'UNIVESP', 'https://www.youtube.com/user/univesptv', 'PH7-XbKaKFg', '32min', 'Teoria de CSS da universidade'),
        (v_module_id, 'didactic', 'Curso CSS3 #01 - Evolucao do CSS', 'Curso em Video', 'https://www.youtube.com/c/CursoemVideo', 'FRhM6sMOTfg', '25min', 'Serie completa de CSS3'),
        (v_module_id, 'practical', 'Flexbox CSS - Guia Completo', 'Origamid', 'https://www.youtube.com/c/Origamid', 'bfJsPzRni-c', '40min', 'Flexbox na pratica com projetos')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 3: JavaScript: Interatividade
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'frontend' AND module_number = 3;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Programacao Web com JavaScript', 'UNIVESP', 'https://www.youtube.com/user/univesptv', 'W8lXF-KMrUM', '30min', 'JavaScript na perspectiva academica'),
        (v_module_id, 'didactic', 'Curso JavaScript #01 - Introducao', 'Curso em Video', 'https://www.youtube.com/c/CursoemVideo', '1-w1RfGIov4', '22min', 'Guanabara ensina JavaScript do zero'),
        (v_module_id, 'practical', 'JavaScript para Iniciantes - Pratico', 'Rocketseat', 'https://www.youtube.com/c/RocketSeat', 'i6Oi-YtXnAU', '45min', 'Projetos reais com JavaScript')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 4: React: Interfaces Modernas
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'frontend' AND module_number = 4;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'React - Conceitos e Arquitetura', 'InfoQ Brasil', 'https://www.youtube.com/c/InfoQBrasil', 'DCTJRQ-0u88', '35min', 'Palestra tecnica sobre React'),
        (v_module_id, 'didactic', 'React para Iniciantes - Tutorial Completo', 'DevSoutinho', 'https://www.youtube.com/c/DevSoutinho', 'bZiy7fOxmPM', '50min', 'React explicado passo a passo'),
        (v_module_id, 'practical', 'Criando app React do zero', 'Rocketseat', 'https://www.youtube.com/c/RocketSeat', 'pDbcC-xSat4', '60min', 'Projeto completo com React')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 5: TypeScript: Tipagem Segura
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'frontend' AND module_number = 5;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'TypeScript - Fundamentos', 'Full Cycle', 'https://www.youtube.com/c/FullCycle', 'Z2sJ5zHiP-g', '40min', 'TypeScript em profundidade'),
        (v_module_id, 'didactic', 'TypeScript para Iniciantes', 'Glaucia Lemos', 'https://www.youtube.com/c/GlauciaLemos', 'u7K1sdnCv5Y', '35min', 'Tutorial didatico de TypeScript'),
        (v_module_id, 'practical', 'TypeScript + React na Pratica', 'Diego Fernandes', 'https://www.youtube.com/c/RocketSeat', '0mYq5LrQN1s', '55min', 'Projeto real com TS e React')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 6: Acessibilidade Web
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'frontend' AND module_number = 6;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Acessibilidade Digital - Conceitos', 'UNIVESP', 'https://www.youtube.com/user/univesptv', 'NQNRjLmJXEg', '28min', 'Fundamentos de acessibilidade'),
        (v_module_id, 'didactic', 'Acessibilidade na Web - O que voce precisa saber', 'Codigo Fonte TV', 'https://www.youtube.com/c/CodigoFonteTV', 'rVSKH_1Z2qA', '18min', 'Introducao clara sobre a11y'),
        (v_module_id, 'practical', 'Testando Acessibilidade na Pratica', 'Attekita Dev', 'https://www.youtube.com/c/AttekitaDev', 'gcWRvVVvc2k', '25min', 'Ferramentas e testes praticos')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- ========================================
    -- IA/ML VIDEOS
    -- ========================================

    -- Module 1: Introducao a IA
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'ia' AND module_number = 1;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Inteligencia Artificial - Conceitos', 'UNIVESP', 'https://www.youtube.com/user/univesptv', 'z5zYXKYBKOc', '32min', 'Fundamentos academicos de IA'),
        (v_module_id, 'didactic', 'O que e Inteligencia Artificial?', 'Programacao Dinamica', 'https://www.youtube.com/c/ProgramacaoDinamica', 'Lx9dhtPjPEg', '20min', 'Kizzy explica IA de forma acessivel'),
        (v_module_id, 'practical', 'IA na Pratica - Primeiros Passos', 'Codigo Fonte TV', 'https://www.youtube.com/c/CodigoFonteTV', '5DkWHqYDgvs', '18min', 'Como comecar com IA hoje')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 2: Python para Data Science
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'ia' AND module_number = 2;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Ciencia de Dados com Python - UNIVESP', 'UNIVESP', 'https://www.youtube.com/user/univesptv', 'mQKhKH7SWQY', '35min', 'Curso universitario de Data Science'),
        (v_module_id, 'didactic', 'Pandas para Iniciantes - Completo', 'Programacao Dinamica', 'https://www.youtube.com/c/ProgramacaoDinamica', 'eQGEWo1vsdU', '45min', 'Tutorial detalhado de Pandas'),
        (v_module_id, 'practical', 'Analise de Dados com Python', 'Hashtag Treinamentos', 'https://www.youtube.com/c/HashtagTreinamentos', 'RlGOaSPFtXc', '50min', 'Projeto pratico de analise')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 3: Machine Learning Basico
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'ia' AND module_number = 3;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Machine Learning - Fundamentos', 'ICMC USP', 'https://www.youtube.com/c/ICMCUSP', 'O5xeyoRL95U', '40min', 'Aula do ICMC sobre ML'),
        (v_module_id, 'didactic', 'Machine Learning para Iniciantes', 'Programacao Dinamica', 'https://www.youtube.com/c/ProgramacaoDinamica', 'u8xgqvk16EA', '35min', 'Conceitos de ML bem explicados'),
        (v_module_id, 'practical', 'Primeiro modelo de ML em 30min', 'Stack', 'https://www.youtube.com/c/Stack', 'M9Itm95JzL0', '30min', 'Hands-on com Scikit-learn')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 4: Redes Neurais
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'ia' AND module_number = 4;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Redes Neurais - Teoria', 'UNIVESP', 'https://www.youtube.com/user/univesptv', 'u8xgqvk16EA', '38min', 'Fundamentos de redes neurais'),
        (v_module_id, 'didactic', 'Deep Learning Descomplicado', 'Programacao Dinamica', 'https://www.youtube.com/c/ProgramacaoDinamica', '6yYUc-hAWSs', '28min', 'Redes neurais explicadas visualmente'),
        (v_module_id, 'practical', 'Primeira Rede Neural com Python', 'Sentdex Brasil', 'https://www.youtube.com/c/SentdexBrasil', 'ILsA4nyG7I0', '45min', 'Construindo uma rede do zero')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 5: LLMs e Prompts
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'ia' AND module_number = 5;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Large Language Models - Como Funcionam', 'USP', 'https://www.youtube.com/user/uspdigitais', 'zjkBMFhNj_g', '45min', 'Explicacao tecnica de LLMs'),
        (v_module_id, 'didactic', 'ChatGPT e LLMs - Entenda Tudo', 'Codigo Fonte TV', 'https://www.youtube.com/c/CodigoFonteTV', 'RvT8K0J6FdM', '22min', 'LLMs explicados de forma simples'),
        (v_module_id, 'practical', 'Engenharia de Prompts na Pratica', 'Filipe Deschamps', 'https://www.youtube.com/c/FilipeDeschamps', 'jC4v5AS4RIM', '25min', 'Tecnicas de prompt engineering')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 6: Agentes de IA
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'ia' AND module_number = 6;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Agentes Inteligentes - Conceitos', 'UNIVESP', 'https://www.youtube.com/user/univesptv', 'g0Rd_zLqXwU', '30min', 'Teoria de agentes de IA'),
        (v_module_id, 'didactic', 'LangChain Explicado', 'Codigo Logo', 'https://www.youtube.com/c/CodigoLogo', 'nE2skSRWTTs', '35min', 'Tutorial completo de LangChain'),
        (v_module_id, 'practical', 'Criando um Agente de IA', 'Eduardo Mendes', 'https://www.youtube.com/c/EduardoMendes', 'aywZrzNaKjs', '40min', 'Projeto pratico de agente')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- ========================================
    -- DEVOPS VIDEOS
    -- ========================================

    -- Module 1: Linux Essencial
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'devops' AND module_number = 1;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Sistemas Operacionais - Linux', 'UNIVESP', 'https://www.youtube.com/user/univesptv', '6nN2EglOqCM', '35min', 'Fundamentos de SO Linux'),
        (v_module_id, 'didactic', 'Curso Linux #01 - Introducao', 'Curso em Video', 'https://www.youtube.com/c/CursoemVideo', '6nN2EglOqCM', '30min', 'Guanabara ensina Linux'),
        (v_module_id, 'practical', 'Terminal Linux para Desenvolvedores', 'Fabio Akita', 'https://www.youtube.com/c/FabioAkita', 'epiyExCyb2s', '50min', 'Linux na pratica para devs')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 2: Git e Versionamento
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'devops' AND module_number = 2;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Engenharia de Software - Git', 'UNIVESP', 'https://www.youtube.com/user/univesptv', 'UBAX-13g8OM', '28min', 'Git na perspectiva academica'),
        (v_module_id, 'didactic', 'Curso Git e GitHub #01', 'Curso em Video', 'https://www.youtube.com/c/CursoemVideo', 'xEKo29OWILE', '22min', 'Guanabara explica Git'),
        (v_module_id, 'practical', 'Git para Iniciantes - Completo', 'Rafaella Ballerini', 'https://www.youtube.com/c/RafaellaBallerini', 'UBAX-13g8OM', '35min', 'Git na pratica com projetos')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 3: Docker: Containers
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'devops' AND module_number = 3;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Virtualizacao e Containers', 'Full Cycle', 'https://www.youtube.com/c/FullCycle', 'MeFE5-RtYos', '40min', 'Conceitos profundos de containers'),
        (v_module_id, 'didactic', 'Docker Tutorial para Iniciantes', 'Codigo Fonte TV', 'https://www.youtube.com/c/CodigoFonteTV', 'np_vyd7QlXk', '25min', 'Docker explicado claramente'),
        (v_module_id, 'practical', 'Docker do Zero ao Deploy', 'Rocketseat', 'https://www.youtube.com/c/RocketSeat', 'AVNADGzXrrQ', '45min', 'Projeto completo com Docker')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 4: CI/CD: Automacao
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'devops' AND module_number = 4;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'DevOps e CI/CD - Fundamentos', 'Full Cycle', 'https://www.youtube.com/c/FullCycle', 'AZtTd3pFVTY', '38min', 'CI/CD em profundidade'),
        (v_module_id, 'didactic', 'O que e CI/CD? Explicado', 'Codigo Fonte TV', 'https://www.youtube.com/c/CodigoFonteTV', 'AZtTd3pFVTY', '18min', 'CI/CD de forma simples'),
        (v_module_id, 'practical', 'GitHub Actions - Pipeline Completo', 'DevDojo', 'https://www.youtube.com/c/DevDojo', 'R8_veQiYBjI', '35min', 'Automatizacao na pratica')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 5: Cloud Computing
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'devops' AND module_number = 5;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Computacao em Nuvem - Conceitos', 'UNIVESP', 'https://www.youtube.com/user/univesptv', 'HzwY1EQZX_k', '30min', 'Cloud computing teoria'),
        (v_module_id, 'didactic', 'AWS para Iniciantes', 'Linuxtips', 'https://www.youtube.com/c/Linuxtips', 'HiBCv9DolxI', '45min', 'Primeiros passos na AWS'),
        (v_module_id, 'practical', 'Deploy na Vercel e Railway', 'Rocketseat', 'https://www.youtube.com/c/RocketSeat', 'bRFT9dABP-Q', '30min', 'Deploy gratuito na pratica')
    ON CONFLICT (module_id, style) DO NOTHING;

    -- Module 6: Monitoramento
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'devops' AND module_number = 6;
    INSERT INTO public.agora_module_videos (module_id, style, title, channel, channel_url, youtube_id, duration, description) VALUES
        (v_module_id, 'academic', 'Observabilidade em Sistemas', 'Full Cycle', 'https://www.youtube.com/c/FullCycle', 'yXHRmvqFD1s', '42min', 'Teoria de observabilidade'),
        (v_module_id, 'didactic', 'Prometheus e Grafana - Introducao', 'Linuxtips', 'https://www.youtube.com/c/Linuxtips', 'VPV7MHuYtkU', '35min', 'Stack de monitoramento'),
        (v_module_id, 'practical', 'Monitorando Aplicacoes', 'Fabio Akita', 'https://www.youtube.com/c/FabioAkita', 'vjHvQjYlSbE', '50min', 'Monitoramento na pratica')
    ON CONFLICT (module_id, style) DO NOTHING;

END $$;

-- ============================================
-- EXERCISES (Quiz and Coding Questions)
-- ============================================

DO $$
DECLARE
    v_module_id INTEGER;
BEGIN
    -- Backend Module 1 Exercise
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'backend' AND module_number = 1;
    INSERT INTO public.agora_exercises (module_id, exercise_type, question, options, correct_answer, xp_reward)
    VALUES (v_module_id, 'quiz', 'O que e um algoritmo?',
            ARRAY['Um tipo de computador', 'Uma sequencia de passos para resolver um problema', 'Uma linguagem de programacao', 'Um sistema operacional'],
            1, 30)
    ON CONFLICT DO NOTHING;

    -- Backend Module 2 Exercise
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'backend' AND module_number = 2;
    INSERT INTO public.agora_exercises (module_id, exercise_type, question, options, correct_answer, xp_reward)
    VALUES (v_module_id, 'coding', 'Qual comando imprime "Ola, Mundo!" em Python?',
            ARRAY['echo("Ola, Mundo!")', 'print("Ola, Mundo!")', 'console.log("Ola, Mundo!")', 'printf("Ola, Mundo!")'],
            1, 30)
    ON CONFLICT DO NOTHING;

    -- Introducao Module 4 Exercise (Reflection)
    SELECT id INTO v_module_id FROM public.agora_modules WHERE track_id = 'introducao' AND module_number = 4;
    INSERT INTO public.agora_exercises (module_id, exercise_type, question, min_words, xp_reward)
    VALUES (v_module_id, 'reflection', 'Descreva o que voce fez: criou conta, fez fork, etc.', 20, 30)
    ON CONFLICT DO NOTHING;

END $$;
