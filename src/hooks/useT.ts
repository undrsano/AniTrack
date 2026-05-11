import { useLanguageStore } from '@/store/languageStore'
import { t } from '@/lib/i18n'

export function useT() {
  const lang = useLanguageStore((s) => s.lang)
  return t(lang)
}
