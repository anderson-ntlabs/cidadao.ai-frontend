import pt from '@/messages/pt.json'
import en from '@/messages/en.json'

export type Locale = 'pt' | 'en'

const messages = { pt, en }

export function getTranslations(locale: Locale = 'pt') {
  return messages[locale] || messages.pt
}