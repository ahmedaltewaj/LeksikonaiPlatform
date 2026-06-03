'use client'

import { usePathname } from 'next/navigation'

const STEPS = [
  { number: 1, label: 'Virksomhed', path: '/onboarding/profile' },
  { number: 2, label: 'Forbind', path: '/onboarding/connect' },
  { number: 3, label: 'Identitet', path: '/onboarding/identity' },
  { number: 4, label: 'Test', path: '/onboarding/test' },
  { number: 5, label: 'Færdig', path: '/onboarding/success' },
]

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const currentStepIndex = STEPS.findIndex((s) => s.path === pathname)
  const currentStep = currentStepIndex !== -1 ? STEPS[currentStepIndex] : null

  return (
    <div className="min-h-screen bg-gray-50">
      {currentStep && (
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between mb-2">
              {STEPS.map((step, index) => {
                const isCompleted = index < currentStepIndex
                const isCurrent = index === currentStepIndex

                return (
                  <div key={step.number} className="flex items-center">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                          isCompleted
                            ? 'bg-primary text-white'
                            : isCurrent
                            ? 'bg-primary text-white ring-4 ring-primary/20'
                            : 'bg-gray-200 text-gray-500'
                        }`}
                      >
                        {isCompleted ? '✓' : step.number}
                      </div>
                      <span
                        className={`text-xs mt-1 ${
                          isCurrent ? 'text-primary font-medium' : 'text-gray-500'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < STEPS.length - 1 && (
                      <div
                        className={`flex-1 h-0.5 mx-2 ${
                          index < currentStepIndex ? 'bg-primary' : 'bg-gray-200'
                        }`}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto px-4 py-8">
        {children}
      </div>
    </div>
  )
}