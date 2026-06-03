'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

const INDUSTRIES = [
  { value: 'accounting', label: 'Revisor / Accountant' },
  { value: 'legal', label: 'Advokat / Legal' },
  { value: 'real_estate', label: 'Ejendomsmægler / Real Estate' },
  { value: 'consulting', label: 'Rådgivning / Consulting' },
  { value: 'other', label: 'Andet / Other' },
]

const COMPANY_SIZES = [
  { value: 'solo', label: 'Solo (1 person)' },
  { value: '2-5', label: '2-5 ansatte / employees' },
  { value: '6-10', label: '6-10 ansatte / employees' },
  { value: '10+', label: '10+ ansatte / employees' },
]

const LANGUAGES = [
  { value: 'da', label: 'Dansk' },
  { value: 'en', label: 'English' },
]

interface FormData {
  companyName: string
  industry: string
  companySize: string
  primaryLanguage: string
  yourName: string
  yourRole: string
  email: string
}

interface FormErrors {
  companyName?: string
  industry?: string
  companySize?: string
  primaryLanguage?: string
  yourName?: string
  email?: string
}

export default function ProfilePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState<FormData>({
    companyName: '',
    industry: '',
    companySize: '',
    primaryLanguage: 'da',
    yourName: '',
    yourRole: '',
    email: '',
  })
  const [errors, setErrors] = useState<FormErrors>({})

  const validate = (): boolean => {
    const newErrors: FormErrors = {}
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    
    if (!formData.companyName || formData.companyName.length < 2) {
      newErrors.companyName = 'Virksomhedsnavn skal være mindst 2 tegn'
    }
    if (!formData.industry) {
      newErrors.industry = 'Vælg en branche'
    }
    if (!formData.companySize) {
      newErrors.companySize = 'Vælg en virksomhedsstørrelse'
    }
    if (!formData.primaryLanguage) {
      newErrors.primaryLanguage = 'Vælg et sprog'
    }
    if (!formData.yourName || formData.yourName.length < 2) {
      newErrors.yourName = 'Navn skal være mindst 2 tegn'
    }
    if (!formData.email || !emailRegex.test(formData.email)) {
      newErrors.email = 'Indtast en gyldig email'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validate()) return
    
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/onboarding/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          companyName: formData.companyName,
          industry: formData.industry,
          companySize: formData.companySize,
          primaryLanguage: formData.primaryLanguage,
          name: formData.yourName,
          role: formData.yourRole,
          email: formData.email,
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save profile')
      }

      localStorage.setItem('onboarding_profile', JSON.stringify({
        ...formData,
        completedAt: new Date().toISOString(),
      }))
      
      router.push('/onboarding/connect')
    } catch (error) {
      console.error('Error saving profile:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Lad os starte med at lære din virksomhed at kende
        </h1>
        <p className="text-gray-500 mb-6">
          Fortæl os om din virksomhed, så vi kan tilpasse AI-assistenten til dine behov.
        </p>

        <div className="space-y-5">
          <div>
            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700 mb-1.5">
              Virksomhedsnavn <span className="text-error">*</span>
            </label>
            <Input
              id="companyName"
              type="text"
              value={formData.companyName}
              onChange={(e) => handleChange('companyName', e.target.value)}
              placeholder="Din virksomheds navn"
              error={!!errors.companyName}
            />
            {errors.companyName && (
              <p className="mt-1 text-sm text-error">{errors.companyName}</p>
            )}
          </div>

          <div>
            <label htmlFor="industry" className="block text-sm font-medium text-gray-700 mb-1.5">
              Branche <span className="text-error">*</span>
            </label>
            <Select
              id="industry"
              value={formData.industry}
              onChange={(e) => handleChange('industry', e.target.value)}
              error={!!errors.industry}
            >
              <option value="">Vælg branche...</option>
              {INDUSTRIES.map(ind => (
                <option key={ind.value} value={ind.value}>{ind.label}</option>
              ))}
            </Select>
            {errors.industry && (
              <p className="mt-1 text-sm text-error">{errors.industry}</p>
            )}
          </div>

          <div>
            <label htmlFor="companySize" className="block text-sm font-medium text-gray-700 mb-1.5">
              Virksomhedsstørrelse <span className="text-error">*</span>
            </label>
            <Select
              id="companySize"
              value={formData.companySize}
              onChange={(e) => handleChange('companySize', e.target.value)}
              error={!!errors.companySize}
            >
              <option value="">Vælg størrelse...</option>
              {COMPANY_SIZES.map(size => (
                <option key={size.value} value={size.value}>{size.label}</option>
              ))}
            </Select>
            {errors.companySize && (
              <p className="mt-1 text-sm text-error">{errors.companySize}</p>
            )}
          </div>

          <div>
            <label htmlFor="primaryLanguage" className="block text-sm font-medium text-gray-700 mb-1.5">
              Primært sprog <span className="text-error">*</span>
            </label>
            <Select
              id="primaryLanguage"
              value={formData.primaryLanguage}
              onChange={(e) => handleChange('primaryLanguage', e.target.value)}
              error={!!errors.primaryLanguage}
            >
              {LANGUAGES.map(lang => (
                <option key={lang.value} value={lang.value}>{lang.label}</option>
              ))}
            </Select>
            {errors.primaryLanguage && (
              <p className="mt-1 text-sm text-error">{errors.primaryLanguage}</p>
            )}
          </div>

          <div>
            <label htmlFor="yourName" className="block text-sm font-medium text-gray-700 mb-1.5">
              Dit navn <span className="text-error">*</span>
            </label>
            <Input
              id="yourName"
              type="text"
              value={formData.yourName}
              onChange={(e) => handleChange('yourName', e.target.value)}
              placeholder="For at bruge i din signatur"
              error={!!errors.yourName}
            />
            {errors.yourName && (
              <p className="mt-1 text-sm text-error">{errors.yourName}</p>
            )}
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1.5">
              Email <span className="text-error">*</span>
            </label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              placeholder="din@email.dk"
              error={!!errors.email}
            />
            {errors.email && (
              <p className="mt-1 text-sm text-error">{errors.email}</p>
            )}
          </div>

          <div>
            <label htmlFor="yourRole" className="block text-sm font-medium text-gray-700 mb-1.5">
              Din rolle <span className="text-gray-400">(valgfrit)</span>
            </label>
            <Input
              id="yourRole"
              type="text"
              value={formData.yourRole}
              onChange={(e) => handleChange('yourRole', e.target.value)}
              placeholder="Fx. Advokat, Revisor, Direktør"
            />
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