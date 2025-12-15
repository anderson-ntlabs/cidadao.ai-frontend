/**
 * Tests for ProfileForm component
 *
 * @author Anderson Henrique da Silva
 * @date 2025-12-15
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProfileForm } from '../profile-form'
import type { UserProfile } from '@/types/profile'

// Mock dependencies
vi.mock('next/image', () => ({
  default: ({ src, alt, className, width, height }: any) => (
    <img
      src={src}
      alt={alt}
      className={className}
      width={width}
      height={height}
      data-testid="avatar-image"
    />
  ),
}))

vi.mock('@/components/ui', () => ({
  Button: ({ children, type, disabled, className, ...props }: any) => (
    <button type={type} disabled={disabled} className={className} {...props}>
      {children}
    </button>
  ),
}))

const { mockUploadAvatar, mockUpdateProfile } = vi.hoisted(() => ({
  mockUploadAvatar: vi.fn(),
  mockUpdateProfile: vi.fn(),
}))

vi.mock('@/lib/services/profile.service', () => ({
  profileService: {
    uploadAvatar: mockUploadAvatar,
    updateProfile: mockUpdateProfile,
  },
}))

const { mockToast } = vi.hoisted(() => ({
  mockToast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

vi.mock('@/hooks/use-toast', () => ({
  toast: mockToast,
}))

describe('ProfileForm', () => {
  const defaultProfile: UserProfile = {
    id: 'user-123',
    email: 'test@example.com',
    username: 'testuser',
    full_name: 'Test User',
    bio: 'Test bio',
    avatar_url: 'https://example.com/avatar.jpg',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockUpdateProfile.mockResolvedValue(true)
    mockUploadAvatar.mockResolvedValue('https://example.com/new-avatar.jpg')
  })

  describe('Rendering', () => {
    it('renders form with all fields', () => {
      render(<ProfileForm profile={defaultProfile} />)

      expect(screen.getByLabelText(/nome de usuário/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/nome completo/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
      expect(screen.getByLabelText(/bio/i)).toBeInTheDocument()
    })

    it('renders avatar image', () => {
      render(<ProfileForm profile={defaultProfile} />)

      const avatar = screen.getByTestId('avatar-image')
      expect(avatar).toHaveAttribute('src', defaultProfile.avatar_url)
    })

    it('renders submit button', () => {
      render(<ProfileForm profile={defaultProfile} />)

      expect(screen.getByRole('button', { name: /salvar alterações/i })).toBeInTheDocument()
    })

    it('populates form with profile data', () => {
      render(<ProfileForm profile={defaultProfile} />)

      expect(screen.getByLabelText(/nome de usuário/i)).toHaveValue('testuser')
      expect(screen.getByLabelText(/nome completo/i)).toHaveValue('Test User')
      expect(screen.getByLabelText(/bio/i)).toHaveValue('Test bio')
    })

    it('shows email as disabled', () => {
      render(<ProfileForm profile={defaultProfile} />)

      expect(screen.getByLabelText(/email/i)).toBeDisabled()
    })

    it('renders default avatar when no avatar_url', () => {
      const profileWithoutAvatar = { ...defaultProfile, avatar_url: '' }
      render(<ProfileForm profile={profileWithoutAvatar} />)

      const avatar = screen.getByTestId('avatar-image')
      expect(avatar.getAttribute('src')).toContain('ui-avatars.com')
    })
  })

  describe('Form Input', () => {
    it('updates username on change', async () => {
      const user = userEvent.setup()
      render(<ProfileForm profile={defaultProfile} />)

      const usernameInput = screen.getByLabelText(/nome de usuário/i)
      await user.clear(usernameInput)
      await user.type(usernameInput, 'newusername')

      expect(usernameInput).toHaveValue('newusername')
    })

    it('updates full name on change', async () => {
      const user = userEvent.setup()
      render(<ProfileForm profile={defaultProfile} />)

      const fullNameInput = screen.getByLabelText(/nome completo/i)
      await user.clear(fullNameInput)
      await user.type(fullNameInput, 'New Name')

      expect(fullNameInput).toHaveValue('New Name')
    })

    it('updates bio on change', async () => {
      const user = userEvent.setup()
      render(<ProfileForm profile={defaultProfile} />)

      const bioInput = screen.getByLabelText(/bio/i)
      await user.clear(bioInput)
      await user.type(bioInput, 'New bio text')

      expect(bioInput).toHaveValue('New bio text')
    })
  })

  describe('Form Submission', () => {
    it('submits form with updated data', async () => {
      const user = userEvent.setup()
      const onUpdate = vi.fn()

      render(<ProfileForm profile={defaultProfile} onUpdate={onUpdate} />)

      const usernameInput = screen.getByLabelText(/nome de usuário/i)
      await user.clear(usernameInput)
      await user.type(usernameInput, 'updated')

      await user.click(screen.getByRole('button', { name: /salvar alterações/i }))

      await waitFor(() => {
        expect(mockUpdateProfile).toHaveBeenCalledWith({
          username: 'updated',
          full_name: 'Test User',
          bio: 'Test bio',
        })
      })
    })

    it('calls onUpdate callback on success', async () => {
      const user = userEvent.setup()
      const onUpdate = vi.fn()

      render(<ProfileForm profile={defaultProfile} onUpdate={onUpdate} />)

      await user.click(screen.getByRole('button', { name: /salvar alterações/i }))

      await waitFor(() => {
        expect(onUpdate).toHaveBeenCalled()
      })
    })

    it('shows success toast on successful update', async () => {
      const user = userEvent.setup()

      render(<ProfileForm profile={defaultProfile} />)

      await user.click(screen.getByRole('button', { name: /salvar alterações/i }))

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Perfil atualizado!',
          'Suas informações foram salvas'
        )
      })
    })

    it('shows error toast on failed update', async () => {
      mockUpdateProfile.mockResolvedValueOnce(false)
      const user = userEvent.setup()

      render(<ProfileForm profile={defaultProfile} />)

      await user.click(screen.getByRole('button', { name: /salvar alterações/i }))

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Erro ao salvar',
          'Não foi possível atualizar seu perfil'
        )
      })
    })

    it('shows error toast on exception', async () => {
      mockUpdateProfile.mockRejectedValueOnce(new Error('Network error'))
      const user = userEvent.setup()

      render(<ProfileForm profile={defaultProfile} />)

      await user.click(screen.getByRole('button', { name: /salvar alterações/i }))

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith('Erro ao salvar', 'Ocorreu um erro inesperado')
      })
    })

    it('disables submit button while loading', async () => {
      mockUpdateProfile.mockImplementation(() => new Promise(() => {})) // Never resolves
      const user = userEvent.setup()

      render(<ProfileForm profile={defaultProfile} />)

      const submitButton = screen.getByRole('button', { name: /salvar alterações/i })
      await user.click(submitButton)

      expect(screen.getByRole('button', { name: /salvando/i })).toBeDisabled()
    })
  })

  describe('Avatar Upload', () => {
    it('triggers file input on label click', () => {
      render(<ProfileForm profile={defaultProfile} />)

      const fileInput = document.getElementById('avatar-upload')
      expect(fileInput).toBeInTheDocument()
      expect(fileInput).toHaveAttribute('type', 'file')
    })

    it('accepts only image files', () => {
      render(<ProfileForm profile={defaultProfile} />)

      const fileInput = document.getElementById('avatar-upload')
      expect(fileInput).toHaveAttribute('accept', 'image/*')
    })

    it('uploads avatar on file selection', async () => {
      render(<ProfileForm profile={defaultProfile} />)

      const file = new File(['test'], 'avatar.png', { type: 'image/png' })
      const fileInput = document.getElementById('avatar-upload') as HTMLInputElement

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockUploadAvatar).toHaveBeenCalledWith(file)
      })
    })

    it('shows success toast on avatar upload', async () => {
      render(<ProfileForm profile={defaultProfile} />)

      const file = new File(['test'], 'avatar.png', { type: 'image/png' })
      const fileInput = document.getElementById('avatar-upload') as HTMLInputElement

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockToast.success).toHaveBeenCalledWith(
          'Avatar atualizado!',
          'Sua foto foi alterada com sucesso'
        )
      })
    })

    it('shows error for non-image files', async () => {
      render(<ProfileForm profile={defaultProfile} />)

      const file = new File(['test'], 'document.pdf', { type: 'application/pdf' })
      const fileInput = document.getElementById('avatar-upload') as HTMLInputElement

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Arquivo inválido',
          'Por favor, selecione uma imagem'
        )
      })
    })

    it('shows error for files larger than 5MB', async () => {
      render(<ProfileForm profile={defaultProfile} />)

      // Create a large file (6MB)
      const largeContent = new Array(6 * 1024 * 1024 + 1).fill('a').join('')
      const file = new File([largeContent], 'large.png', { type: 'image/png' })
      const fileInput = document.getElementById('avatar-upload') as HTMLInputElement

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Arquivo muito grande',
          'A imagem deve ter no máximo 5MB'
        )
      })
    })

    it('shows error when upload returns null', async () => {
      mockUploadAvatar.mockResolvedValueOnce(null)

      render(<ProfileForm profile={defaultProfile} />)

      const file = new File(['test'], 'avatar.png', { type: 'image/png' })
      const fileInput = document.getElementById('avatar-upload') as HTMLInputElement

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Erro no upload',
          'Não foi possível enviar a imagem'
        )
      })
    })

    it('shows error when upload throws', async () => {
      mockUploadAvatar.mockRejectedValueOnce(new Error('Upload failed'))

      render(<ProfileForm profile={defaultProfile} />)

      const file = new File(['test'], 'avatar.png', { type: 'image/png' })
      const fileInput = document.getElementById('avatar-upload') as HTMLInputElement

      fireEvent.change(fileInput, { target: { files: [file] } })

      await waitFor(() => {
        expect(mockToast.error).toHaveBeenCalledWith(
          'Erro no upload',
          'Ocorreu um erro ao enviar a imagem'
        )
      })
    })

    it('handles no file selected', () => {
      render(<ProfileForm profile={defaultProfile} />)

      const fileInput = document.getElementById('avatar-upload') as HTMLInputElement

      fireEvent.change(fileInput, { target: { files: [] } })

      expect(mockUploadAvatar).not.toHaveBeenCalled()
    })
  })

  describe('Empty Profile Values', () => {
    it('handles empty profile values', () => {
      const emptyProfile: UserProfile = {
        id: 'user-123',
        email: 'test@example.com',
        username: undefined,
        full_name: undefined,
        bio: undefined,
        avatar_url: undefined,
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      }

      render(<ProfileForm profile={emptyProfile} />)

      expect(screen.getByLabelText(/nome de usuário/i)).toHaveValue('')
      expect(screen.getByLabelText(/nome completo/i)).toHaveValue('')
      expect(screen.getByLabelText(/bio/i)).toHaveValue('')
    })
  })
})
