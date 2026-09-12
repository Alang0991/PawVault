export type TranslationKey = string | string[]

export type TranslationNamespace =
  | "common"
  | "navigation"
  | "auth"
  | "marketplace"
  | "creator"
  | "account"
  | "admin"
  | "checkout"
  | "currency"
  | "theme"
  | "seasonal"
  | "errors"
  | "validation"

export interface TranslationParams {
  [key: string]: unknown
}
