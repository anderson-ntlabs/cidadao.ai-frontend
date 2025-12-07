/**
 * Learning Tracks Content Data
 *
 * Each track has modules with video options in different styles:
 * - academic: University/formal style (UNIVESP, USP)
 * - didactic: Detailed explanations (Curso em Vídeo, DevMedia)
 * - practical: Hands-on approach (Rocketseat, Fábio Akita)
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-07
 */

export type VideoStyle = 'academic' | 'didactic' | 'practical'

export interface VideoOption {
  style: VideoStyle
  title: string
  channel: string
  channelUrl: string
  videoId: string // YouTube video ID
  duration: string
  description: string
}

export interface TrackModule {
  id: number
  title: string
  description: string
  objectives: string[]
  videos: VideoOption[]
  exercise?: {
    type: 'quiz' | 'coding' | 'reflection'
    question: string
    options?: string[]
    correctAnswer?: number
    minWords?: number // For reflection exercises
  }
  xpReward: number
  diaryPrompt: string // Prompt for diary entry
  chatPrompt: string // Prompt for agent conversation
}

export interface TrackContent {
  id: string
  name: string
  mentor: {
    id: string
    name: string
    greeting: string
    videoIntro: string
    diaryEncouragement: string
    chatInvitation: string
  }
  modules: TrackModule[]
  totalXp: number
  certificateHours: number
}

// Video style labels
export const VIDEO_STYLE_LABELS: Record<
  VideoStyle,
  { label: string; icon: string; description: string }
> = {
  academic: {
    label: 'Acadêmico',
    icon: '🎓',
    description: 'Conteúdo de universidades, tom formal e aprofundado',
  },
  didactic: {
    label: 'Didático',
    icon: '📚',
    description: 'Explicações detalhadas, passo a passo',
  },
  practical: {
    label: 'Prático',
    icon: '🚀',
    description: 'Mão na massa, projetos reais',
  },
}

// XP calculation constants
export const XP_CONSTANTS = {
  DIARY_XP_PER_WORD: 0.5,
  DIARY_MIN_WORDS: 20,
  DIARY_MAX_XP: 100,
  CHAT_XP_PER_MESSAGE: 15,
  CHAT_MAX_XP_PER_MODULE: 75,
  VIDEO_COMPLETE_XP: 50,
  EXERCISE_CORRECT_XP: 30,
  MODULE_COMPLETE_BONUS: 25,
}

// Calculate XP from diary entry
export function calculateDiaryXp(text: string): number {
  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length
  if (wordCount < XP_CONSTANTS.DIARY_MIN_WORDS) return 0
  const xp = Math.floor(wordCount * XP_CONSTANTS.DIARY_XP_PER_WORD)
  return Math.min(xp, XP_CONSTANTS.DIARY_MAX_XP)
}

// Backend Track Content
export const BACKEND_TRACK: TrackContent = {
  id: 'backend',
  name: 'Backend',
  mentor: {
    id: 'santos-dumont',
    name: 'Santos-Dumont',
    greeting:
      'Olá, futuro engenheiro! Sou Santos-Dumont, seu mentor na trilha de Backend. Assim como construí máquinas que desafiaram os céus, você vai construir sistemas que sustentam a internet!',
    videoIntro:
      'Agora, assista o vídeo que selecionamos para este módulo. Escolha o estilo que mais combina com você!',
    diaryEncouragement:
      'Excelente reflexão! Anotar suas ideias é como eu fazia com meus projetos de aviação. Cada palavra conta! Quanto mais você escrever, mais XP ganha.',
    chatInvitation:
      'Quer conversar sobre o que aprendeu? Estou aqui para tirar suas dúvidas e explorar ideias juntos!',
  },
  modules: [
    {
      id: 1,
      title: 'Introdução a Programação',
      description: 'Fundamentos de lógica de programação e algoritmos',
      objectives: [
        'Entender o que é programação',
        'Aprender lógica de programação',
        'Conhecer algoritmos básicos',
      ],
      videos: [
        {
          style: 'academic',
          title: 'Introdução à Computação - Aula 1',
          channel: 'UNIVESP',
          channelUrl: 'https://www.youtube.com/user/univesptv',
          videoId: 'Kpk-MZTkPe0', // UNIVESP - Algoritmos
          duration: '25min',
          description: 'Aula formal da Universidade Virtual do Estado de São Paulo',
        },
        {
          style: 'didactic',
          title: 'Curso de Algoritmo #01 - Lógica de Programação',
          channel: 'Curso em Vídeo',
          channelUrl: 'https://www.youtube.com/c/CursoemVídeo',
          videoId: '8mei6uVttho', // Gustavo Guanabara
          duration: '20min',
          description: 'Professor Gustavo Guanabara explica de forma clara e divertida',
        },
        {
          style: 'practical',
          title: 'Como COMEÇAR a programar? Passo a passo',
          channel: 'Filipe Deschamps',
          channelUrl: 'https://www.youtube.com/c/FilipeDeschamps',
          videoId: 'BTENKdRVS2U',
          duration: '15min',
          description: 'Dicas práticas de quem trabalha na área',
        },
      ],
      exercise: {
        type: 'quiz',
        question: 'O que é um algoritmo?',
        options: [
          'Um tipo de computador',
          'Uma sequência de passos para resolver um problema',
          'Uma linguagem de programação',
          'Um sistema operacional',
        ],
        correctAnswer: 1,
      },
      xpReward: 100,
      diaryPrompt:
        'O que você entendeu sobre programação? Como você acha que ela pode ser útil na sua vida?',
      chatPrompt: 'Vamos conversar sobre lógica de programação e como ela se aplica no dia a dia?',
    },
    {
      id: 2,
      title: 'Python: Primeiros Passos',
      description: 'Introdução à linguagem Python e sintaxe básica',
      objectives: [
        'Instalar e configurar Python',
        'Entender variáveis e tipos de dados',
        'Escrever seus primeiros programas',
      ],
      videos: [
        {
          style: 'academic',
          title: 'Python para Iniciantes - UNIVESP',
          channel: 'UNIVESP',
          channelUrl: 'https://www.youtube.com/user/univesptv',
          videoId: 'lJjR906426o',
          duration: '30min',
          description: 'Curso oficial de programação da UNIVESP',
        },
        {
          style: 'didactic',
          title: 'Curso Python #01 - Mundo 1: Fundamentos',
          channel: 'Curso em Vídeo',
          channelUrl: 'https://www.youtube.com/c/CursoemVídeo',
          videoId: 'S9uPNppGsGo',
          duration: '35min',
          description: 'Série completa do Guanabara sobre Python',
        },
        {
          style: 'practical',
          title: 'Python em 1 hora - Tutorial para Iniciantes',
          channel: 'Programação Dinâmica',
          channelUrl: 'https://www.youtube.com/c/ProgramaçãoDinâmica',
          videoId: 'yTQDbqmv8Ho',
          duration: '60min',
          description: 'Curso intensivo e prático de Python',
        },
      ],
      exercise: {
        type: 'coding',
        question: 'Qual comando imprime "Olá, Mundo!" em Python?',
        options: [
          'echo("Olá, Mundo!")',
          'print("Olá, Mundo!")',
          'console.log("Olá, Mundo!")',
          'printf("Olá, Mundo!")',
        ],
        correctAnswer: 1,
      },
      xpReward: 120,
      diaryPrompt: 'Qual foi sua primeira impressão do Python? O que achou mais interessante?',
      chatPrompt: 'Vamos praticar Python juntos? Posso te ajudar com exercícios!',
    },
    {
      id: 3,
      title: 'Estruturas de Dados',
      description: 'Listas, dicionários, tuplas e conjuntos em Python',
      objectives: [
        'Manipular listas e arrays',
        'Usar dicionários para dados estruturados',
        'Entender quando usar cada estrutura',
      ],
      videos: [
        {
          style: 'academic',
          title: 'Estruturas de Dados - Conceitos',
          channel: 'UNIVESP',
          channelUrl: 'https://www.youtube.com/user/univesptv',
          videoId: 'q5aCPmLpnBE',
          duration: '28min',
          description: 'Fundamentos teóricos de estruturas de dados',
        },
        {
          style: 'didactic',
          title: 'Python #14 - Listas (Parte 1)',
          channel: 'Curso em Vídeo',
          channelUrl: 'https://www.youtube.com/c/CursoemVídeo',
          videoId: 'nIHq1MtJaKs',
          duration: '32min',
          description: 'Guanabara ensina listas em Python',
        },
        {
          style: 'practical',
          title: 'Estruturas de Dados em Python na Prática',
          channel: 'Eduardo Mendes',
          channelUrl: 'https://www.youtube.com/c/EduardoMendes',
          videoId: '1U4AEgJPwjU',
          duration: '45min',
          description: 'Exemplos reais de uso de estruturas',
        },
      ],
      xpReward: 130,
      diaryPrompt:
        'Qual estrutura de dados você achou mais útil? Em que situação você usaria cada uma?',
      chatPrompt: 'Vamos explorar as estruturas de dados? Posso criar exemplos personalizados!',
    },
    {
      id: 4,
      title: 'APIs REST: Conceitos',
      description: 'Entendendo APIs, HTTP e arquitetura REST',
      objectives: [
        'Entender o que é uma API',
        'Conhecer verbos HTTP (GET, POST, PUT, DELETE)',
        'Aprender princípios REST',
      ],
      videos: [
        {
          style: 'academic',
          title: 'Web Services e APIs - Conceitos',
          channel: 'UNIVESP',
          channelUrl: 'https://www.youtube.com/user/univesptv',
          videoId: 'sX8Sj-BCBS0',
          duration: '24min',
          description: 'Teoria sobre APIs e serviços web',
        },
        {
          style: 'didactic',
          title: 'O que é API? REST e RESTful?',
          channel: 'Código Fonte TV',
          channelUrl: 'https://www.youtube.com/c/CodigoFonteTV',
          videoId: 'ghTrp1x_1As',
          duration: '15min',
          description: 'Gabriel e Vanessa explicam APIs de forma simples',
        },
        {
          style: 'practical',
          title: 'Criando sua primeira API',
          channel: 'Rocketseat',
          channelUrl: 'https://www.youtube.com/c/RocketSeat',
          videoId: 'BN_8bCfVp88',
          duration: '20min',
          description: 'Mão na massa criando APIs',
        },
      ],
      xpReward: 140,
      diaryPrompt: 'Como você explicaria o que é uma API para alguém que não sabe programar?',
      chatPrompt: 'Quer entender melhor como APIs funcionam na prática?',
    },
    {
      id: 5,
      title: 'FastAPI: Construindo APIs',
      description: 'Criando APIs modernas com FastAPI em Python',
      objectives: [
        'Configurar um projeto FastAPI',
        'Criar endpoints e rotas',
        'Trabalhar com validação de dados',
      ],
      videos: [
        {
          style: 'academic',
          title: 'FastAPI - Documentação Automática',
          channel: 'Python Café',
          channelUrl: 'https://www.youtube.com/c/PythonCafe',
          videoId: 'MNPfhFfLTQU',
          duration: '30min',
          description: 'Explicação técnica detalhada',
        },
        {
          style: 'didactic',
          title: 'Curso de FastAPI - Introdução Completa',
          channel: 'DevAprender',
          channelUrl: 'https://www.youtube.com/c/DevAprender',
          videoId: 'sBChE9rSUAY',
          duration: '45min',
          description: 'Tutorial passo a passo com FastAPI',
        },
        {
          style: 'practical',
          title: 'API com FastAPI em 30 minutos',
          channel: 'Rodrigo Manguinho',
          channelUrl: 'https://www.youtube.com/c/RodrigoManguinho',
          videoId: 'X4jR-ExbXIA',
          duration: '30min',
          description: 'Projeto prático do zero',
        },
      ],
      xpReward: 160,
      diaryPrompt: 'O que você achou do FastAPI? Que tipo de API você gostaria de criar?',
      chatPrompt: 'Vamos planejar sua primeira API juntos?',
    },
    {
      id: 6,
      title: 'Banco de Dados SQL',
      description: 'Fundamentos de bancos de dados relacionais',
      objectives: [
        'Entender modelagem de dados',
        'Escrever queries SQL básicas',
        'Conectar Python a bancos de dados',
      ],
      videos: [
        {
          style: 'academic',
          title: 'Banco de Dados - Conceitos Fundamentais',
          channel: 'UNIVESP',
          channelUrl: 'https://www.youtube.com/user/univesptv',
          videoId: 'z5vf2aS8Y3Q',
          duration: '35min',
          description: 'Teoria de banco de dados relacional',
        },
        {
          style: 'didactic',
          title: 'Curso MySQL #01 - O que é Banco de Dados?',
          channel: 'Curso em Vídeo',
          channelUrl: 'https://www.youtube.com/c/CursoemVídeo',
          videoId: 'Ofktsne-utM',
          duration: '28min',
          description: 'Introdução a bancos de dados',
        },
        {
          style: 'practical',
          title: 'SQL para Análise de Dados',
          channel: 'Programação Dinâmica',
          channelUrl: 'https://www.youtube.com/c/ProgramaçãoDinâmica',
          videoId: 'G7bMwefn8hA',
          duration: '50min',
          description: 'SQL na prática com exemplos reais',
        },
      ],
      xpReward: 150,
      diaryPrompt: 'Qual a importância de um banco de dados em uma aplicação? O que você aprendeu?',
      chatPrompt: 'Posso te ajudar a entender SQL com exemplos práticos!',
    },
  ],
  totalXp: 2000,
  certificateHours: 12,
}

// Frontend Track Content
export const FRONTEND_TRACK: TrackContent = {
  id: 'frontend',
  name: 'Frontend',
  mentor: {
    id: 'bobardi',
    name: 'Lina Bo Bardi',
    greeting:
      'Bem-vindo à trilha de Frontend! Sou Lina Bo Bardi, sua mentora em design e interfaces. Assim como projetei espaços que transformam experiências, você vai criar interfaces que encantam usuários!',
    videoIntro:
      'Hora de assistir! Escolha o estilo de vídeo que mais te agrada - cada pessoa aprende de um jeito diferente.',
    diaryEncouragement:
      'Adoro sua reflexão! Designers anotam tudo - inspirações, ideias, críticas. Seu diário é seu sketchbook digital!',
    chatInvitation: 'Vamos conversar sobre design e código? Adoraria ouvir suas ideias criativas!',
  },
  modules: [
    {
      id: 1,
      title: 'HTML: A Base da Web',
      description: 'Fundamentos de HTML e estruturação de páginas',
      objectives: [
        'Entender a estrutura de documentos HTML',
        'Usar tags semânticas corretamente',
        'Criar formulários e tabelas',
      ],
      videos: [
        {
          style: 'academic',
          title: 'Desenvolvimento Web - HTML Básico',
          channel: 'UNIVESP',
          channelUrl: 'https://www.youtube.com/user/univesptv',
          videoId: 'bLGRmjQgsLg',
          duration: '28min',
          description: 'Fundamentos de HTML da universidade',
        },
        {
          style: 'didactic',
          title: 'Curso HTML5 #01 - História da Internet',
          channel: 'Curso em Vídeo',
          channelUrl: 'https://www.youtube.com/c/CursoemVídeo',
          videoId: 'epDCjksKMok',
          duration: '35min',
          description: 'Guanabara conta a história e ensina HTML',
        },
        {
          style: 'practical',
          title: 'HTML em 1 hora - Curso Completo',
          channel: 'Rafaella Ballerini',
          channelUrl: 'https://www.youtube.com/c/RafaellaBallerini',
          videoId: '3oSIqIqzN3M',
          duration: '60min',
          description: 'Projeto prático do início ao fim',
        },
      ],
      xpReward: 100,
      diaryPrompt: 'O que você achou de aprender HTML? Que tipo de página você gostaria de criar?',
      chatPrompt: 'Vamos discutir estrutura de páginas e semântica HTML?',
    },
    {
      id: 2,
      title: 'CSS: Estilização',
      description: 'Estilizando páginas web com CSS moderno',
      objectives: [
        'Aplicar estilos com seletores CSS',
        'Usar Flexbox para layouts',
        'Criar designs responsivos',
      ],
      videos: [
        {
          style: 'academic',
          title: 'CSS - Conceitos e Aplicações',
          channel: 'UNIVESP',
          channelUrl: 'https://www.youtube.com/user/univesptv',
          videoId: 'PH7-XbKaKFg',
          duration: '32min',
          description: 'Teoria de CSS da universidade',
        },
        {
          style: 'didactic',
          title: 'Curso CSS3 #01 - Evolução do CSS',
          channel: 'Curso em Vídeo',
          channelUrl: 'https://www.youtube.com/c/CursoemVídeo',
          videoId: 'FRhM6sMOTfg',
          duration: '25min',
          description: 'Série completa de CSS3',
        },
        {
          style: 'practical',
          title: 'Flexbox CSS - Guia Completo',
          channel: 'Origamid',
          channelUrl: 'https://www.youtube.com/c/Origamid',
          videoId: 'bfJsPzRni-c',
          duration: '40min',
          description: 'Flexbox na prática com projetos',
        },
      ],
      xpReward: 120,
      diaryPrompt: 'O que você achou do CSS? Qual propriedade te surpreendeu mais?',
      chatPrompt: 'Quer explorar técnicas avançadas de CSS comigo?',
    },
    {
      id: 3,
      title: 'JavaScript: Interatividade',
      description: 'Adicionando comportamento às páginas web',
      objectives: [
        'Entender variáveis e funções em JS',
        'Manipular o DOM',
        'Responder a eventos do usuário',
      ],
      videos: [
        {
          style: 'academic',
          title: 'Programação Web com JavaScript',
          channel: 'UNIVESP',
          channelUrl: 'https://www.youtube.com/user/univesptv',
          videoId: 'W8lXF-KMrUM',
          duration: '30min',
          description: 'JavaScript na perspectiva acadêmica',
        },
        {
          style: 'didactic',
          title: 'Curso JavaScript #01 - Introdução',
          channel: 'Curso em Vídeo',
          channelUrl: 'https://www.youtube.com/c/CursoemVídeo',
          videoId: '1-w1RfGIov4',
          duration: '22min',
          description: 'Guanabara ensina JavaScript do zero',
        },
        {
          style: 'practical',
          title: 'JavaScript para Iniciantes - Prático',
          channel: 'Rocketseat',
          channelUrl: 'https://www.youtube.com/c/RocketSeat',
          videoId: 'i6Oi-YtXnAU',
          duration: '45min',
          description: 'Projetos reais com JavaScript',
        },
      ],
      xpReward: 140,
      diaryPrompt: 'JavaScript é a linguagem da web! O que você criaria com ela?',
      chatPrompt: 'Vamos programar algo juntos em JavaScript?',
    },
    {
      id: 4,
      title: 'React: Interfaces Modernas',
      description: 'Construindo SPAs com React',
      objectives: [
        'Entender componentes e props',
        'Usar hooks (useState, useEffect)',
        'Gerenciar estado da aplicação',
      ],
      videos: [
        {
          style: 'academic',
          title: 'React - Conceitos e Arquitetura',
          channel: 'InfoQ Brasil',
          channelUrl: 'https://www.youtube.com/c/InfoQBrasil',
          videoId: 'DCTJRQ-0u88',
          duration: '35min',
          description: 'Palestra técnica sobre React',
        },
        {
          style: 'didactic',
          title: 'React para Iniciantes - Tutorial Completo',
          channel: 'DevSoutinho',
          channelUrl: 'https://www.youtube.com/c/DevSoutinho',
          videoId: 'bZiy7fOxmPM',
          duration: '50min',
          description: 'React explicado passo a passo',
        },
        {
          style: 'practical',
          title: 'Criando app React do zero',
          channel: 'Rocketseat',
          channelUrl: 'https://www.youtube.com/c/RocketSeat',
          videoId: 'pDbcC-xSat4',
          duration: '60min',
          description: 'Projeto completo com React',
        },
      ],
      xpReward: 160,
      diaryPrompt: 'Como você descreveria React para um amigo? O que mais te impressionou?',
      chatPrompt: 'Vamos criar um componente React juntos?',
    },
    {
      id: 5,
      title: 'TypeScript: Tipagem Segura',
      description: 'Adicionando tipos ao JavaScript',
      objectives: [
        'Entender tipos básicos em TS',
        'Criar interfaces e types',
        'Usar TypeScript com React',
      ],
      videos: [
        {
          style: 'academic',
          title: 'TypeScript - Fundamentos',
          channel: 'Full Cycle',
          channelUrl: 'https://www.youtube.com/c/FullCycle',
          videoId: 'Z2sJ5zHiP-g',
          duration: '40min',
          description: 'TypeScript em profundidade',
        },
        {
          style: 'didactic',
          title: 'TypeScript para Iniciantes',
          channel: 'Glaucia Lemos',
          channelUrl: 'https://www.youtube.com/c/GlauciaLemos',
          videoId: 'u7K1sdnCv5Y',
          duration: '35min',
          description: 'Tutorial didático de TypeScript',
        },
        {
          style: 'practical',
          title: 'TypeScript + React na Prática',
          channel: 'Diego Fernandes',
          channelUrl: 'https://www.youtube.com/c/RocketSeat',
          videoId: '0mYq5LrQN1s',
          duration: '55min',
          description: 'Projeto real com TS e React',
        },
      ],
      xpReward: 150,
      diaryPrompt: 'TypeScript ajuda a evitar bugs. Você prefere JS ou TS? Por quê?',
      chatPrompt: 'Posso te ajudar a entender os tipos mais complexos!',
    },
    {
      id: 6,
      title: 'Acessibilidade Web',
      description: 'Criando interfaces para todos',
      objectives: [
        'Entender WCAG e padrões a11y',
        'Usar ARIA corretamente',
        'Testar acessibilidade',
      ],
      videos: [
        {
          style: 'academic',
          title: 'Acessibilidade Digital - Conceitos',
          channel: 'UNIVESP',
          channelUrl: 'https://www.youtube.com/user/univesptv',
          videoId: 'NQNRjLmJXEg',
          duration: '28min',
          description: 'Fundamentos de acessibilidade',
        },
        {
          style: 'didactic',
          title: 'Acessibilidade na Web - O que você precisa saber',
          channel: 'Código Fonte TV',
          channelUrl: 'https://www.youtube.com/c/CodigoFonteTV',
          videoId: 'rVSKH_1Z2qA',
          duration: '18min',
          description: 'Introdução clara sobre a11y',
        },
        {
          style: 'practical',
          title: 'Testando Acessibilidade na Prática',
          channel: 'Attekita Dev',
          channelUrl: 'https://www.youtube.com/c/AttekitaDev',
          videoId: 'gcWRvVVvc2k',
          duration: '25min',
          description: 'Ferramentas e testes práticos',
        },
      ],
      xpReward: 130,
      diaryPrompt: 'Por que acessibilidade é importante? O que você vai fazer diferente agora?',
      chatPrompt: 'Vamos discutir como tornar suas interfaces mais acessíveis?',
    },
  ],
  totalXp: 2000,
  certificateHours: 12,
}

// IA/ML Track Content
export const IA_TRACK: TrackContent = {
  id: 'ia',
  name: 'IA/ML',
  mentor: {
    id: 'santos-dumont',
    name: 'Santos-Dumont',
    greeting:
      'Bem-vindo à fronteira da inovação! Assim como sonhei com máquinas voadoras, hoje sonhamos com máquinas que pensam. Vamos explorar a Inteligência Artificial juntos!',
    videoIntro:
      'Este módulo vai expandir sua mente! Escolha como quer aprender - cada estilo revela uma perspectiva diferente.',
    diaryEncouragement:
      'IA é um campo em constante evolução. Suas reflexões de hoje serão o conhecimento de amanhã!',
    chatInvitation: 'IA é fascinante e complexa. Vamos conversar e desvendar seus mistérios?',
  },
  modules: [
    {
      id: 1,
      title: 'Introdução à IA',
      description: 'O que é Inteligência Artificial e seu impacto',
      objectives: [
        'Entender o que é IA e ML',
        'Conhecer aplicações práticas',
        'Diferenciar tipos de aprendizado',
      ],
      videos: [
        {
          style: 'academic',
          title: 'Inteligência Artificial - Conceitos',
          channel: 'UNIVESP',
          channelUrl: 'https://www.youtube.com/user/univesptv',
          videoId: 'z5zYXKYBKOc',
          duration: '32min',
          description: 'Fundamentos acadêmicos de IA',
        },
        {
          style: 'didactic',
          title: 'O que é Inteligência Artificial?',
          channel: 'Programação Dinâmica',
          channelUrl: 'https://www.youtube.com/c/ProgramaçãoDinâmica',
          videoId: 'Lx9dhtPjPEg',
          duration: '20min',
          description: 'Kizzy explica IA de forma acessível',
        },
        {
          style: 'practical',
          title: 'IA na Prática - Primeiros Passos',
          channel: 'Código Fonte TV',
          channelUrl: 'https://www.youtube.com/c/CodigoFonteTV',
          videoId: '5DkWHqYDgvs',
          duration: '18min',
          description: 'Como começar com IA hoje',
        },
      ],
      xpReward: 100,
      diaryPrompt:
        'O que você acha que IA pode fazer no futuro? Quais são seus medos e esperanças?',
      chatPrompt: 'Vamos debater sobre o futuro da IA e seu impacto na sociedade?',
    },
    {
      id: 2,
      title: 'Python para Data Science',
      description: 'Bibliotecas essenciais: NumPy, Pandas',
      objectives: [
        'Manipular dados com Pandas',
        'Usar NumPy para cálculos',
        'Visualizar dados com Matplotlib',
      ],
      videos: [
        {
          style: 'academic',
          title: 'Ciência de Dados com Python - UNIVESP',
          channel: 'UNIVESP',
          channelUrl: 'https://www.youtube.com/user/univesptv',
          videoId: 'mQKhKH7SWQY',
          duration: '35min',
          description: 'Curso universitário de Data Science',
        },
        {
          style: 'didactic',
          title: 'Pandas para Iniciantes - Completo',
          channel: 'Programação Dinâmica',
          channelUrl: 'https://www.youtube.com/c/ProgramaçãoDinâmica',
          videoId: 'eQGEWo1vsdU',
          duration: '45min',
          description: 'Tutorial detalhado de Pandas',
        },
        {
          style: 'practical',
          title: 'Análise de Dados com Python',
          channel: 'Hashtag Treinamentos',
          channelUrl: 'https://www.youtube.com/c/HashtagTreinamentos',
          videoId: 'RlGOaSPFtXc',
          duration: '50min',
          description: 'Projeto prático de análise',
        },
      ],
      xpReward: 130,
      diaryPrompt: 'Que tipo de dados você gostaria de analisar? Negócios, esportes, saúde?',
      chatPrompt: 'Posso te ajudar a criar uma análise de dados personalizada!',
    },
    {
      id: 3,
      title: 'Machine Learning Básico',
      description: 'Algoritmos fundamentais de ML',
      objectives: [
        'Entender regressão e classificação',
        'Usar Scikit-learn',
        'Treinar seu primeiro modelo',
      ],
      videos: [
        {
          style: 'academic',
          title: 'Machine Learning - Fundamentos',
          channel: 'ICMC USP',
          channelUrl: 'https://www.youtube.com/c/ICMCUSP',
          videoId: 'O5xeyoRL95U',
          duration: '40min',
          description: 'Aula do ICMC sobre ML',
        },
        {
          style: 'didactic',
          title: 'Machine Learning para Iniciantes',
          channel: 'Programação Dinâmica',
          channelUrl: 'https://www.youtube.com/c/ProgramaçãoDinâmica',
          videoId: 'u8xgqvk16EA',
          duration: '35min',
          description: 'Conceitos de ML bem explicados',
        },
        {
          style: 'practical',
          title: 'Primeiro modelo de ML em 30min',
          channel: 'Stack',
          channelUrl: 'https://www.youtube.com/c/Stack',
          videoId: 'M9Itm95JzL0',
          duration: '30min',
          description: 'Hands-on com Scikit-learn',
        },
      ],
      xpReward: 150,
      diaryPrompt: 'O que você acha de ensinar uma máquina a aprender? É assustador ou empolgante?',
      chatPrompt: 'Vamos treinar um modelo juntos passo a passo?',
    },
    {
      id: 4,
      title: 'Redes Neurais',
      description: 'Deep Learning e redes neurais artificiais',
      objectives: [
        'Entender neurônios artificiais',
        'Conhecer arquiteturas de redes',
        'Introdução ao TensorFlow/PyTorch',
      ],
      videos: [
        {
          style: 'academic',
          title: 'Redes Neurais - Teoria',
          channel: 'UNIVESP',
          channelUrl: 'https://www.youtube.com/user/univesptv',
          videoId: 'u8xgqvk16EA',
          duration: '38min',
          description: 'Fundamentos de redes neurais',
        },
        {
          style: 'didactic',
          title: 'Deep Learning Descomplicado',
          channel: 'Programação Dinâmica',
          channelUrl: 'https://www.youtube.com/c/ProgramaçãoDinâmica',
          videoId: '6yYUc-hAWSs',
          duration: '28min',
          description: 'Redes neurais explicadas visualmente',
        },
        {
          style: 'practical',
          title: 'Primeira Rede Neural com Python',
          channel: 'Sentdex Brasil',
          channelUrl: 'https://www.youtube.com/c/SentdexBrasil',
          videoId: 'ILsA4nyG7I0',
          duration: '45min',
          description: 'Construindo uma rede do zero',
        },
      ],
      xpReward: 170,
      diaryPrompt: 'Como redes neurais imitam o cérebro? O que você aprendeu de surpreendente?',
      chatPrompt: 'Redes neurais são fascinantes! Quer explorar alguma arquitetura específica?',
    },
    {
      id: 5,
      title: 'LLMs e Prompts',
      description: 'Large Language Models e engenharia de prompts',
      objectives: [
        'Entender como LLMs funcionam',
        'Escrever prompts eficazes',
        'Usar APIs de LLMs (OpenAI, etc)',
      ],
      videos: [
        {
          style: 'academic',
          title: 'Large Language Models - Como Funcionam',
          channel: 'USP',
          channelUrl: 'https://www.youtube.com/user/uspdigitais',
          videoId: 'zjkBMFhNj_g',
          duration: '45min',
          description: 'Explicação técnica de LLMs',
        },
        {
          style: 'didactic',
          title: 'ChatGPT e LLMs - Entenda Tudo',
          channel: 'Código Fonte TV',
          channelUrl: 'https://www.youtube.com/c/CodigoFonteTV',
          videoId: 'RvT8K0J6FdM',
          duration: '22min',
          description: 'LLMs explicados de forma simples',
        },
        {
          style: 'practical',
          title: 'Engenharia de Prompts na Prática',
          channel: 'Filipe Deschamps',
          channelUrl: 'https://www.youtube.com/c/FilipeDeschamps',
          videoId: 'jC4v5AS4RIM',
          duration: '25min',
          description: 'Técnicas de prompt engineering',
        },
      ],
      xpReward: 160,
      diaryPrompt: 'Como você usaria LLMs no seu dia a dia ou trabalho?',
      chatPrompt: 'Vamos praticar engenharia de prompts juntos!',
    },
    {
      id: 6,
      title: 'Agentes de IA',
      description: 'Construindo agentes autônomos com IA',
      objectives: [
        'Entender agentes de IA',
        'Criar fluxos com LangChain',
        'Implementar RAG básico',
      ],
      videos: [
        {
          style: 'academic',
          title: 'Agentes Inteligentes - Conceitos',
          channel: 'UNIVESP',
          channelUrl: 'https://www.youtube.com/user/univesptv',
          videoId: 'g0Rd_zLqXwU',
          duration: '30min',
          description: 'Teoria de agentes de IA',
        },
        {
          style: 'didactic',
          title: 'LangChain Explicado',
          channel: 'Código Logo',
          channelUrl: 'https://www.youtube.com/c/CodigoLogo',
          videoId: 'nE2skSRWTTs',
          duration: '35min',
          description: 'Tutorial completo de LangChain',
        },
        {
          style: 'practical',
          title: 'Criando um Agente de IA',
          channel: 'Eduardo Mendes',
          channelUrl: 'https://www.youtube.com/c/EduardoMendes',
          videoId: 'aywZrzNaKjs',
          duration: '40min',
          description: 'Projeto prático de agente',
        },
      ],
      xpReward: 180,
      diaryPrompt: 'Que tipo de agente de IA você criaria? Para resolver qual problema?',
      chatPrompt: 'Vamos arquitetar um agente de IA juntos!',
    },
  ],
  totalXp: 2500,
  certificateHours: 14,
}

// DevOps Track Content
export const DEVOPS_TRACK: TrackContent = {
  id: 'devops',
  name: 'DevOps',
  mentor: {
    id: 'santos-dumont',
    name: 'Santos-Dumont',
    greeting:
      'Olá, engenheiro de infraestrutura! Assim como eu precisava de oficinas e ferramentas para construir meus aviões, você vai dominar as ferramentas que fazem software voar na nuvem!',
    videoIntro:
      'DevOps é sobre automação e eficiência. Escolha seu estilo de aprendizado e vamos automatizar!',
    diaryEncouragement:
      'Documentar processos é essencial em DevOps. Seu diário é seu runbook pessoal!',
    chatInvitation: 'Infraestrutura pode ser complexa. Vamos simplificar juntos?',
  },
  modules: [
    {
      id: 1,
      title: 'Linux Essencial',
      description: 'Fundamentos do sistema operacional Linux',
      objectives: [
        'Navegar pelo terminal',
        'Gerenciar arquivos e permissões',
        'Usar comandos essenciais',
      ],
      videos: [
        {
          style: 'academic',
          title: 'Sistemas Operacionais - Linux',
          channel: 'UNIVESP',
          channelUrl: 'https://www.youtube.com/user/univesptv',
          videoId: '6nN2EglOqCM',
          duration: '35min',
          description: 'Fundamentos de SO Linux',
        },
        {
          style: 'didactic',
          title: 'Curso Linux #01 - Introdução',
          channel: 'Curso em Vídeo',
          channelUrl: 'https://www.youtube.com/c/CursoemVídeo',
          videoId: '6nN2EglOqCM',
          duration: '30min',
          description: 'Guanabara ensina Linux',
        },
        {
          style: 'practical',
          title: 'Terminal Linux para Desenvolvedores',
          channel: 'Fábio Akita',
          channelUrl: 'https://www.youtube.com/c/FabioAkita',
          videoId: 'epiyExCyb2s',
          duration: '50min',
          description: 'Linux na prática para devs',
        },
      ],
      xpReward: 100,
      diaryPrompt: 'O que você achou do Linux? Prefere interface gráfica ou terminal?',
      chatPrompt: 'Vamos praticar comandos Linux juntos?',
    },
    {
      id: 2,
      title: 'Git e Versionamento',
      description: 'Controle de versão com Git',
      objectives: [
        'Entender conceitos de versionamento',
        'Usar Git no dia a dia',
        'Trabalhar com branches e merges',
      ],
      videos: [
        {
          style: 'academic',
          title: 'Engenharia de Software - Git',
          channel: 'UNIVESP',
          channelUrl: 'https://www.youtube.com/user/univesptv',
          videoId: 'UBAX-13g8OM',
          duration: '28min',
          description: 'Git na perspectiva acadêmica',
        },
        {
          style: 'didactic',
          title: 'Curso Git e GitHub #01',
          channel: 'Curso em Vídeo',
          channelUrl: 'https://www.youtube.com/c/CursoemVídeo',
          videoId: 'xEKo29OWILE',
          duration: '22min',
          description: 'Guanabara explica Git',
        },
        {
          style: 'practical',
          title: 'Git para Iniciantes - Completo',
          channel: 'Rafaella Ballerini',
          channelUrl: 'https://www.youtube.com/c/RafaellaBallerini',
          videoId: 'UBAX-13g8OM',
          duration: '35min',
          description: 'Git na prática com projetos',
        },
      ],
      xpReward: 110,
      diaryPrompt: 'Git pode parecer confuso no início. O que ficou mais claro agora?',
      chatPrompt: 'Posso simular cenários de Git com você!',
    },
    {
      id: 3,
      title: 'Docker: Containers',
      description: 'Containerização de aplicações',
      objectives: [
        'Entender containers vs VMs',
        'Criar e gerenciar containers',
        'Escrever Dockerfiles',
      ],
      videos: [
        {
          style: 'academic',
          title: 'Virtualização e Containers',
          channel: 'Full Cycle',
          channelUrl: 'https://www.youtube.com/c/FullCycle',
          videoId: 'MeFE5-RtYos',
          duration: '40min',
          description: 'Conceitos profundos de containers',
        },
        {
          style: 'didactic',
          title: 'Docker Tutorial para Iniciantes',
          channel: 'Código Fonte TV',
          channelUrl: 'https://www.youtube.com/c/CodigoFonteTV',
          videoId: 'np_vyd7QlXk',
          duration: '25min',
          description: 'Docker explicado claramente',
        },
        {
          style: 'practical',
          title: 'Docker do Zero ao Deploy',
          channel: 'Rocketseat',
          channelUrl: 'https://www.youtube.com/c/RocketSeat',
          videoId: 'AVNADGzXrrQ',
          duration: '45min',
          description: 'Projeto completo com Docker',
        },
      ],
      xpReward: 140,
      diaryPrompt: 'Docker muda a forma de desenvolver. Como você usaria no seu projeto?',
      chatPrompt: 'Vamos criar um Dockerfile juntos?',
    },
    {
      id: 4,
      title: 'CI/CD: Automação',
      description: 'Integração e entrega contínua',
      objectives: [
        'Entender pipelines CI/CD',
        'Configurar GitHub Actions',
        'Automatizar testes e deploys',
      ],
      videos: [
        {
          style: 'academic',
          title: 'DevOps e CI/CD - Fundamentos',
          channel: 'Full Cycle',
          channelUrl: 'https://www.youtube.com/c/FullCycle',
          videoId: 'AZtTd3pFVTY',
          duration: '38min',
          description: 'CI/CD em profundidade',
        },
        {
          style: 'didactic',
          title: 'O que é CI/CD? Explicado',
          channel: 'Código Fonte TV',
          channelUrl: 'https://www.youtube.com/c/CodigoFonteTV',
          videoId: 'AZtTd3pFVTY',
          duration: '18min',
          description: 'CI/CD de forma simples',
        },
        {
          style: 'practical',
          title: 'GitHub Actions - Pipeline Completo',
          channel: 'DevDojo',
          channelUrl: 'https://www.youtube.com/c/DevDojo',
          videoId: 'R8_veQiYBjI',
          duration: '35min',
          description: 'Automatização na prática',
        },
      ],
      xpReward: 150,
      diaryPrompt: 'Automação é poder! O que você automatizaria primeiro?',
      chatPrompt: 'Vamos configurar uma pipeline juntos?',
    },
    {
      id: 5,
      title: 'Cloud Computing',
      description: 'Introdução à computação em nuvem',
      objectives: ['Entender serviços cloud', 'Conhecer AWS/GCP/Azure básico', 'Deploy na nuvem'],
      videos: [
        {
          style: 'academic',
          title: 'Computação em Nuvem - Conceitos',
          channel: 'UNIVESP',
          channelUrl: 'https://www.youtube.com/user/univesptv',
          videoId: 'HzwY1EQZX_k',
          duration: '30min',
          description: 'Cloud computing teoria',
        },
        {
          style: 'didactic',
          title: 'AWS para Iniciantes',
          channel: 'Linuxtips',
          channelUrl: 'https://www.youtube.com/c/Linuxtips',
          videoId: 'HiBCv9DolxI',
          duration: '45min',
          description: 'Primeiros passos na AWS',
        },
        {
          style: 'practical',
          title: 'Deploy na Vercel e Railway',
          channel: 'Rocketseat',
          channelUrl: 'https://www.youtube.com/c/RocketSeat',
          videoId: 'bRFT9dABP-Q',
          duration: '30min',
          description: 'Deploy gratuito na prática',
        },
      ],
      xpReward: 160,
      diaryPrompt: 'Cloud mudou o mundo. Que projeto você colocaria na nuvem?',
      chatPrompt: 'Vamos explorar opções de cloud juntos?',
    },
    {
      id: 6,
      title: 'Monitoramento',
      description: 'Observabilidade e logs',
      objectives: [
        'Entender métricas e logs',
        'Usar ferramentas de monitoramento',
        'Criar alertas',
      ],
      videos: [
        {
          style: 'academic',
          title: 'Observabilidade em Sistemas',
          channel: 'Full Cycle',
          channelUrl: 'https://www.youtube.com/c/FullCycle',
          videoId: 'yXHRmvqFD1s',
          duration: '42min',
          description: 'Teoria de observabilidade',
        },
        {
          style: 'didactic',
          title: 'Prometheus e Grafana - Introdução',
          channel: 'Linuxtips',
          channelUrl: 'https://www.youtube.com/c/Linuxtips',
          videoId: 'VPV7MHuYtkU',
          duration: '35min',
          description: 'Stack de monitoramento',
        },
        {
          style: 'practical',
          title: 'Monitorando Aplicações',
          channel: 'Fábio Akita',
          channelUrl: 'https://www.youtube.com/c/FabioAkita',
          videoId: 'vjHvQjYlSbE',
          duration: '50min',
          description: 'Monitoramento na prática',
        },
      ],
      xpReward: 140,
      diaryPrompt: 'Monitorar é prever problemas. O que você monitoraria?',
      chatPrompt: 'Vamos configurar dashboards juntos?',
    },
  ],
  totalXp: 2000,
  certificateHours: 12,
}

// Export all tracks
export const ALL_TRACKS: Record<string, TrackContent> = {
  backend: BACKEND_TRACK,
  frontend: FRONTEND_TRACK,
  ia: IA_TRACK,
  devops: DEVOPS_TRACK,
}

// Get track by ID
export function getTrackContent(trackId: string): TrackContent | undefined {
  return ALL_TRACKS[trackId]
}

// Calculate total certificate hours (all 4 tracks = 50 hours)
export function getTotalCertificateHours(): number {
  return Object.values(ALL_TRACKS).reduce((sum, track) => sum + track.certificateHours, 0)
}
