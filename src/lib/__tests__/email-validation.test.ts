import { describe, it, expect } from 'vitest'
import { isDisposableEmail } from '../email-validation'

describe('isDisposableEmail', () => {
  it('blocks known disposable domains', () => {
    expect(isDisposableEmail('test@mailinator.com')).toBe(true)
    expect(isDisposableEmail('test@guerrillamail.com')).toBe(true)
    expect(isDisposableEmail('test@yopmail.com')).toBe(true)
    expect(isDisposableEmail('test@10minutemail.com')).toBe(true)
    expect(isDisposableEmail('test@tempmail.com')).toBe(true)
  })

  it('allows legitimate email domains', () => {
    expect(isDisposableEmail('user@gmail.com')).toBe(false)
    expect(isDisposableEmail('user@yahoo.com')).toBe(false)
    expect(isDisposableEmail('user@outlook.com')).toBe(false)
    expect(isDisposableEmail('user@bestpragueguide.com')).toBe(false)
    expect(isDisposableEmail('user@company.cz')).toBe(false)
  })

  it('is case-insensitive on domain', () => {
    expect(isDisposableEmail('test@MAILINATOR.COM')).toBe(true)
    expect(isDisposableEmail('test@Yopmail.Com')).toBe(true)
  })

  it('handles invalid email gracefully', () => {
    expect(isDisposableEmail('notanemail')).toBe(false)
    expect(isDisposableEmail('')).toBe(false)
  })

  it('blocks additional disposable providers', () => {
    expect(isDisposableEmail('test@maildrop.cc')).toBe(true)
    expect(isDisposableEmail('test@discard.email')).toBe(true)
    expect(isDisposableEmail('test@trashmail.com')).toBe(true)
    expect(isDisposableEmail('test@burnermail.io')).toBe(true)
    expect(isDisposableEmail('test@mailsac.com')).toBe(true)
  })
})
