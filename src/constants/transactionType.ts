export const TransactionTypeMap = {
  INBOUND: 'INBOUND',
  OUTBOUND: 'OUTBOUND',
} as const

export type TransactionType = (typeof TransactionTypeMap)[keyof typeof TransactionTypeMap]
