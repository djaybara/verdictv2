import { cookies } from 'next/headers'
import type { Lang } from './i18n-common'

export function getServerLang(): Lang {
  const c = cookies().get('qlang')?.value as Lang | undefined
  return (c && ['en','fr','es','de'].includes(c)) ? c : 'en'
}
