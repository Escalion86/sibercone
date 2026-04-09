'use client'

import { useRef } from 'react'

/**
 * Форматирует телефон по маске +7 (XXX) XXX-XX-XX
 * - Если первая цифра 8 или 7 — заменяется на +7
 * - Если первая цифра другая — считается что +7 уже введён, эта цифра добавляется к номеру
 */
function formatPhone(raw) {
  // Оставляем только цифры
  let digits = raw.replace(/\D/g, '')

  if (digits.length === 0) return ''

  // Если начинается с 8 или 7 — убираем первую цифру (она станет +7)
  if (digits[0] === '8' || digits[0] === '7') {
    digits = digits.slice(1)
  }

  // Максимум 10 цифр после +7
  digits = digits.slice(0, 10)

  let result = '+7'
  if (digits.length > 0) result += ' (' + digits.slice(0, 3)
  if (digits.length >= 3) result += ') '
  if (digits.length > 3) result += digits.slice(3, 6)
  if (digits.length > 6) result += '-' + digits.slice(6, 8)
  if (digits.length > 8) result += '-' + digits.slice(8, 10)

  return result
}

function getDigits(formatted) {
  const digits = formatted.replace(/\D/g, '')
  // Убираем 7 в начале (это +7)
  if (digits.startsWith('7')) return digits.slice(1)
  return digits
}

export default function PhoneInput({ value, onChange, ...props }) {
  const inputRef = useRef(null)

  const handleChange = (e) => {
    const formatted = formatPhone(e.target.value)
    onChange(formatted)
  }

  const handleFocus = () => {
    if (!value) {
      onChange('+7')
    }
  }

  const handleKeyDown = (e) => {
    // При Backspace на пустом номере (+7) — очищаем полностью
    if (e.key === 'Backspace' && (value === '+7' || value === '+7 (')) {
      e.preventDefault()
      onChange('')
    }
  }

  return (
    <input
      ref={inputRef}
      type="tel"
      value={value}
      onChange={handleChange}
      onFocus={handleFocus}
      onKeyDown={handleKeyDown}
      placeholder="+7 (___) ___-__-__"
      {...props}
    />
  )
}
