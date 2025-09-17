// Wikipedia links for agents in both languages
export const wikipediaLinks: Record<string, { pt: string; en: string }> = {
  abaporu: {
    pt: 'https://pt.wikipedia.org/wiki/Abaporu',
    en: 'https://en.wikipedia.org/wiki/Abaporu'
  },
  anita: {
    pt: 'https://pt.wikipedia.org/wiki/Anita_Garibaldi',
    en: 'https://en.wikipedia.org/wiki/Anita_Garibaldi'
  },
  senna: {
    pt: 'https://pt.wikipedia.org/wiki/Ayrton_Senna',
    en: 'https://en.wikipedia.org/wiki/Ayrton_Senna'
  },
  zumbi: {
    pt: 'https://pt.wikipedia.org/wiki/Zumbi_dos_Palmares',
    en: 'https://en.wikipedia.org/wiki/Zumbi'
  },
  tiradentes: {
    pt: 'https://pt.wikipedia.org/wiki/Tiradentes',
    en: 'https://en.wikipedia.org/wiki/Tiradentes'
  },
  obaluaie: {
    pt: 'https://pt.wikipedia.org/wiki/Omolu',
    en: 'https://en.wikipedia.org/wiki/Babal%C3%BA-Ay%C3%A9'
  },
  niemeyer: {
    pt: 'https://pt.wikipedia.org/wiki/Oscar_Niemeyer',
    en: 'https://en.wikipedia.org/wiki/Oscar_Niemeyer'
  },
  nana: {
    pt: 'https://pt.wikipedia.org/wiki/Nan%C3%A3_Buruqu%C3%AA',
    en: 'https://en.wikipedia.org/wiki/Nana_Buluku'
  },
  lampiao: {
    pt: 'https://pt.wikipedia.org/wiki/Lampi%C3%A3o_(cangaceiro)',
    en: 'https://en.wikipedia.org/wiki/Lampi%C3%A3o'
  },
  ceuci: {
    pt: 'https://pt.wikipedia.org/wiki/Mitologia_tupi-guarani',
    en: 'https://en.wikipedia.org/wiki/Tupi_people#Religion_and_mythology'
  },
  dandara: {
    pt: 'https://pt.wikipedia.org/wiki/Dandara',
    en: 'https://en.wikipedia.org/wiki/Dandara_dos_Palmares'
  },
  machado: {
    pt: 'https://pt.wikipedia.org/wiki/Machado_de_Assis',
    en: 'https://en.wikipedia.org/wiki/Machado_de_Assis'
  },
  bonifacio: {
    pt: 'https://pt.wikipedia.org/wiki/Jos%C3%A9_Bonif%C3%A1cio_de_Andrada_e_Silva',
    en: 'https://en.wikipedia.org/wiki/Jos%C3%A9_Bonif%C3%A1cio_de_Andrada_e_Silva'
  },
  deodoro: {
    pt: 'https://pt.wikipedia.org/wiki/Deodoro_da_Fonseca',
    en: 'https://en.wikipedia.org/wiki/Deodoro_da_Fonseca'
  },
  drummond: {
    pt: 'https://pt.wikipedia.org/wiki/Carlos_Drummond_de_Andrade',
    en: 'https://en.wikipedia.org/wiki/Carlos_Drummond_de_Andrade'
  },
  quiteria: {
    pt: 'https://pt.wikipedia.org/wiki/Maria_Quit%C3%A9ria',
    en: 'https://en.wikipedia.org/wiki/Maria_Quit%C3%A9ria'
  },
  oxossi: {
    pt: 'https://pt.wikipedia.org/wiki/Ox%C3%B3ssi',
    en: 'https://en.wikipedia.org/wiki/Oxossi'
  }
}

export function getWikipediaLink(agentId: string, locale: 'pt' | 'en'): string | undefined {
  return wikipediaLinks[agentId]?.[locale]
}