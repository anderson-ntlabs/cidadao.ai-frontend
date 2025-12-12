#!/usr/bin/env node
/**
 * Validate YouTube video IDs
 */

const ids = [
  // TV Brasil - Ciência é Tudo
  'r0aRKI5IUE0', // Matemática no cotidiano | Ciência é Tudo

  // Canais PT-BR do print - Vou buscar IDs por busca
  // Ciência Mapeada - TODA A MATEMÁTICA em 25min
  // Tem Ciência - PRA QUE serve a MATEMÁTICA
  // Manual do Mundo - Linguagens de programação #SagaDosComputadores Ep. 8
  // Veritasium em Português - Números Imaginários
  // BBC News Brasil - leitura molda o cérebro
  // infinitamente - IA possível

  // Kids - Programação PT-BR
  'tRcr4vtV-4o', // Smile and Learn - Programação para crianças
  'hbs6ftVPN5s', // KML - Criar jogos com Scratch
  'F3qWg1JBPZg', // Historia do computador em minutos
  'Ztz6VX0kIPc', // História da Matemática completo

  // UNIVESP - Computação
  'zu5QvPHGU3Q', // Evolução computadores
  'qQpXmzJHm8I', // Elementos organização
  'hjYehF3lFdQ', // Hardware
  'WruRR-8aPF0', // Sistemas operacionais

  // Guanabara - Algoritmos completo
  '8mei6uVttho', // #01 Intro
  'M2Af7gkbbro', // #02 Primeiro Algoritmo
  'U5PnCt58Q68', // #09 Repetição 1
  'fP49L1i_-HU', // #10 Repetição 2
]

async function validate(id) {
  try {
    const res = await fetch(
      `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${id}&format=json`
    )
    if (!res.ok) return { valid: false, title: null }
    const data = await res.json()
    return { valid: true, title: data.title }
  } catch {
    return { valid: false, title: null }
  }
}

async function run() {
  console.log('Validating YouTube IDs...\n')
  for (const id of ids) {
    const { valid, title } = await validate(id)
    console.log(`${valid ? '✅' : '❌'} ${id} - ${title || 'N/A'}`)
    await new Promise((r) => setTimeout(r, 100))
  }
}

run()
