export type Money = {
  amount: number
  currency: string
}

export type FinanceWindow = {
  from?: string
  to?: string
  creatorId?: string
  status?: string
  currency?: string
}

export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'CANCELLED'
export type TransferStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED' | 'REVERSED'
export type RefundStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'DISPUTED'

export type SensitiveAction =
  | 'PAYOUT_TRIGGER'
  | 'PAYOUT_CANCEL'
  | 'REFUND_OVERRIDE'
  | 'TRANSFER_RETRY'
  | 'TAX_SETTING_UPDATE'
  | 'PROVIDER_SETTING_UPDATE'
  | 'FEE_SETTING_UPDATE'
  | 'PAYOUT_DISABLE'

export type ConfirmationTokenPayload = {
  action: SensitiveAction
  targetId: string
  exp: number
  iat: number
}

export function isSensitiveAction(value: string): value is SensitiveAction {
  return ([
    'PAYOUT_TRIGGER',
    'PAYOUT_CANCEL',
    'REFUND_OVERRIDE',
    'TRANSFER_RETRY',
    'TAX_SETTING_UPDATE',
    'PROVIDER_SETTING_UPDATE',
    'FEE_SETTING_UPDATE',
    'PAYOUT_DISABLE',
  ] as readonly string[]).includes(value)
}