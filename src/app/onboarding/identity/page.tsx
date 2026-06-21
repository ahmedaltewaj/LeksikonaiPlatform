'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

const SIGNATURE_STYLES = [
  { value: 'formal', label: 'Formel' },
  { value: 'casual', label: 'Uformel' },
  { value: 'minimal', label: 'Minimal' },
]

interface FormData {
  senderName: string
  senderEmail: string
  replyTo: string
  signatureStyle: string
  autoIncludeSignature: boolean
}

interface FormErrors {
  senderName?: string
  senderEmail?: string
  replyTo?: string
}

export default function IdentityPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    senderName: '',
    senderEmail: '',
    replyTo: '',
    signatureStyle: 'formal',
    autoIncludeSignature: true,
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!formData.senderName || formData.senderName.length < 2) {
      newErrors.senderName = 'Navn skal være mindst 2 tegn'
    }
    if (!formData.senderEmail || !emailRegex.test(formData.senderEmail)) {
      newErrors.senderEmail = 'Indtast en gyldig email'
    }
    if (!formData.replyTo || !emailRegex.test(formData.replyTo)) {
      newErrors.replyTo = 'Indtast en gyldig reply-to email'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return
    
    setIsLoading(true)
    
    try {
      localStorage.setItem('onboarding_identity', JSON.stringify({
        ...formData,
        completedAt: new Date().toISOString(),
      }))
      
      router.push('/onboarding/test')
    } catch (error) {
      console.error('Error saving identity:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Konfigurer din identitet
        </h1>
        <p className="text-gray-500 mb-6">
          Fortæl os, hvordan dine svar skal se ud, når de sendes til kunder.
        </p>

        <div className="space-y-5">
          <div>
            <label htmlFor="senderName" className="block text-sm font-medium text-gray-700 mb-1.5">
              Afsendernavn <span className="text-error">*</span>
            </label>
            <Input
              id="senderName"
              type="text"
              value={formData.senderName}
              onChange={(e) => handleChange('senderName', e.target.value)}
              placeholder="Dit navn eller firmanavn"
              error={!!errors.senderName}
            />
            {errors.senderName && (
              <p className="mt-1 text-sm text-error">{errors.senderName}</p>
            )}
          </div>

          <div>
            <label htmlFor="senderEmail" className="block text-sm font-medium text-gray-700 mb-1.5">
              Afsenderemail <span className="text-error">*</span>
            </label>
            <Input
              id="senderEmail"
              type="email"
              value={formData.senderEmail}
              onChange={(e) => handleChange('senderEmail', e.target.value)}
              placeholder="afsender@dinvirksomhed.dk"
              error={!!errors.senderEmail}
            />
            {errors.senderEmail && (
              <p className="mt-1 text-sm text-error">{errors.senderEmail}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Emailen dine svar sendes fra
            </p>
          </div>

          <div>
            <label htmlFor="replyTo" className="block text-sm font-medium text-gray-700 mb-1.5">
              Reply-to <span className="text-error">*</span>
            </label>
            <Input
              id="replyTo"
              type="email"
              value={formData.replyTo}
              onChange={(e) => handleChange('replyTo', e.target.value)}
              placeholder="reply@dinvirksomhed.dk"
              error={!!errors.replyTo}
            />
            {errors.replyTo && (
              <p className="mt-1 text-sm text-error">{errors.replyTo}</p>
            )}
            <p className="mt-1 text-sm text-gray-500">
              Hvor svar fra kunder sendes til
            </p>
          </div>

          <div>
            <label htmlFor="signatureStyle" className="block text-sm font-medium text-gray-700 mb-1.5">
              Signaturstil
            </label>
            <Select
              id="signatureStyle"
              value={formData.signatureStyle}
              onChange={(e) => handleChange('signatureStyle', e.target.value)}
            >
              {SIGNATURE_STYLES.map(style => (
                <option key={style.value} value={style.value}>{style.label}</option>
              ))}
            </Select>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => handleChange('autoIncludeSignature', !formData.autoIncludeSignature)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                formData.autoIncludeSignature ? 'bg-primary' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.autoIncludeSignature ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <label className="text-sm text-gray-700">
              Inkluder automatisk signatur i svar
            </label>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="ghost"
          onClick={() => router.back()}
        >
          Tilbage
        </Button>
        <Button
          type="submit"
          isLoading={isLoading}
        >
          Næste
        </Button>
      </div>
    </form>
  )
}