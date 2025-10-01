'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Camera, Upload, X, Check, AlertCircle } from 'lucide-react'
import { Button } from './button'
import { toast } from '@/hooks/use-toast'

interface AvatarUploadProps {
  currentAvatar?: string
  userName?: string
  onAvatarChange?: (avatarUrl: string) => void
  maxSize?: number // in MB
  allowedTypes?: string[]
}

export function AvatarUpload({ 
  currentAvatar, 
  userName = 'User',
  onAvatarChange,
  maxSize = 5,
  allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
}: AvatarUploadProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = useCallback(async (file: File) => {
    // validateFile moved inside useCallback
    const validateFile = (file: File): string | null => {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        return `Tipo de arquivo não suportado. Use: ${allowedTypes.join(', ')}`
      }

      // Check file size
      const sizeInMB = file.size / (1024 * 1024)
      if (sizeInMB > maxSize) {
        return `Arquivo muito grande. Máximo: ${maxSize}MB`
      }

      return null
    }

    const error = validateFile(file)
    if (error) {
      toast.error('Erro no arquivo', error)
      return
    }

    setIsUploading(true)
    
    try {
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        const result = e.target?.result as string
        setPreview(result)
      }
      reader.readAsDataURL(file)

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 1500))

      // In a real app, you would upload to your server/cloud storage
      // For now, we'll use the local preview as the new avatar
      const newAvatarUrl = URL.createObjectURL(file)
      
      // Update user avatar
      if (onAvatarChange) {
        onAvatarChange(newAvatarUrl)
      }

      // Update localStorage user data
      const userData = localStorage.getItem('user')
      if (userData) {
        const user = JSON.parse(userData)
        user.avatar = newAvatarUrl
        localStorage.setItem('user', JSON.stringify(user))
      }

      toast.success('Avatar atualizado!', 'Sua foto de perfil foi alterada com sucesso.')
      setPreview(null)
      
    } catch (error) {
      toast.error('Erro no upload', 'Não foi possível atualizar o avatar. Tente novamente.')
      setPreview(null)
    } finally {
      setIsUploading(false)
    }
  }, [onAvatarChange, maxSize, allowedTypes])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(true)
  }, [])

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    const file = e.dataTransfer.files?.[0]
    if (file) {
      processFile(file)
    }
  }, [processFile])

  const openFileDialog = () => {
    fileInputRef.current?.click()
  }

  const cancelPreview = () => {
    setPreview(null)
    setIsUploading(false)
  }

  const displayAvatar = preview || currentAvatar

  return (
    <div className="relative group">
      {/* Avatar Display */}
      <div 
        className={`relative w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-lg transition-all duration-300 ${
          dragActive ? 'border-green-500 scale-105' : 'group-hover:scale-105'
        } ${isUploading ? 'opacity-75' : ''}`}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <Image 
          src={displayAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName)}&background=10b981&color=fff&size=128`} 
          alt={userName || 'Avatar'}
          className="w-full h-full object-cover"
          width={128}
          height={128}
          unoptimized={!displayAvatar}
        />
        
        {/* Upload Overlay */}
        <div className={`absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity duration-300 ${
          dragActive || isUploading ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
        }`}>
          {isUploading ? (
            <div className="text-white text-center">
              <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
              <span className="text-xs">Enviando...</span>
            </div>
          ) : dragActive ? (
            <div className="text-white text-center">
              <Upload className="w-8 h-8 mx-auto mb-2" />
              <span className="text-xs">Solte aqui</span>
            </div>
          ) : (
            <div className="text-white text-center">
              <Camera className="w-8 h-8 mx-auto mb-2" />
              <span className="text-xs">Alterar foto</span>
            </div>
          )}
        </div>
      </div>

      {/* Upload Button */}
      <button
        onClick={openFileDialog}
        disabled={isUploading}
        className="absolute bottom-2 right-2 w-10 h-10 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-full flex items-center justify-center transition-colors shadow-lg hover:shadow-xl"
      >
        {isUploading ? (
          <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
        ) : (
          <Camera className="w-5 h-5" />
        )}
      </button>

      {/* Preview Actions */}
      {preview && !isUploading && (
        <div className="absolute -bottom-12 left-0 right-0 flex justify-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={cancelPreview}
            className="bg-white"
          >
            <X className="w-4 h-4 mr-1" />
            Cancelar
          </Button>
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Upload Instructions */}
      <div className="mt-16 text-center text-sm text-gray-500 dark:text-gray-400">
        <p>Clique na foto ou arraste uma imagem</p>
        <p className="text-xs mt-1">
          Máximo {maxSize}MB • {allowedTypes.map(type => type.split('/')[1].toUpperCase()).join(', ')}
        </p>
      </div>
    </div>
  )
}