export const statuses = [
  {value: 'new', label: 'Новая'},
  {value: 'active', label: 'В работе'},
  {value: 'completed', label: 'Выполнена'}
]

export function statusLabel(value) {
  return statuses.find(status => status.value === value)?.label || value
}