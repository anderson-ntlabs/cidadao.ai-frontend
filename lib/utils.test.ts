import { describe, expect, it } from 'vitest'
import { cn } from './utils'

describe('cn utility function', () => {
  it('merges single class string', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('merges multiple class strings', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('handles duplicate classes', () => {
    // clsx doesn't remove duplicates for non-tailwind classes
    expect(cn('foo', 'foo')).toBe('foo foo')
    // But twMerge removes duplicate tailwind classes
    expect(cn('text-red-500', 'text-red-500')).toBe('text-red-500')
  })

  it('handles conditional classes', () => {
    expect(cn('foo', false && 'bar', 'baz')).toBe('foo baz')
    expect(cn('foo', true && 'bar', 'baz')).toBe('foo bar baz')
  })

  it('handles undefined and null values', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar')
    expect(cn('foo', null, 'bar')).toBe('foo bar')
  })

  it('handles object notation', () => {
    expect(cn('foo', { bar: true, baz: false })).toBe('foo bar')
    expect(cn('foo', { bar: false, baz: true })).toBe('foo baz')
  })

  it('handles arrays', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
    expect(cn('foo', ['bar', 'baz'])).toBe('foo bar baz')
  })

  it('merges tailwind classes correctly', () => {
    // twMerge handles conflicting Tailwind classes
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
    expect(cn('p-4', 'p-8')).toBe('p-8')
    expect(cn('mt-4', 'mb-4')).toBe('mt-4 mb-4')
  })

  it('preserves non-conflicting classes', () => {
    expect(cn('text-red-500', 'bg-blue-500')).toBe('text-red-500 bg-blue-500')
    expect(cn('p-4', 'mt-4')).toBe('p-4 mt-4')
  })

  it('handles complex tailwind merging', () => {
    expect(cn(
      'px-2 py-1 text-sm',
      'p-4 text-lg'
    )).toBe('p-4 text-lg')
    
    expect(cn(
      'hover:bg-gray-100',
      'hover:bg-blue-100'
    )).toBe('hover:bg-blue-100')
  })

  it('handles empty inputs', () => {
    expect(cn()).toBe('')
    expect(cn('')).toBe('')
  })

  it('trims whitespace', () => {
    expect(cn('  foo  ', '  bar  ')).toBe('foo bar')
  })

  it('handles mixed input types', () => {
    expect(cn(
      'foo',
      true && 'bar',
      false && 'baz',
      { qux: true },
      ['quux', 'quuz'],
      undefined,
      null,
      ''
    )).toBe('foo bar qux quux quuz')
  })

  it('resolves tailwind arbitrary values', () => {
    expect(cn('bg-[#123456]', 'bg-[#789abc]')).toBe('bg-[#789abc]')
    expect(cn('w-[100px]', 'w-[200px]')).toBe('w-[200px]')
  })

  it('handles responsive classes', () => {
    expect(cn(
      'text-sm md:text-base',
      'md:text-lg'
    )).toBe('text-sm md:text-lg')
  })
})