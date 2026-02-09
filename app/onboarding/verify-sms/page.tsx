'use client'

import React from "react"

import { useState, useEffect, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { useRouter } from 'next/navigation'

export default function VerifySMSPage() {
  const router = useRouter()
  const [code, setCode] = useState(['', '', '', ''])
  const [timer, setTimer] = useState(55)
  const [phone, setPhone] = useState('')
  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

  useEffect(() => {
    // Get phone from session storage
    const signupData = sessionStorage.getItem('signupData')
    if (signupData) {
      const data = JSON.parse(signupData)
      setPhone(data.phone)
    }

    // Focus first input
    inputRefs[0].current?.focus()

    // Timer countdown
    const interval = setInterval(() => {
      setTimer((prev) => (prev > 0 ? prev - 1 : 0))
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  const handleCodeChange = (index: number, value: string) => {
    if (value.length > 1) return

    const newCode = [...code]
    newCode[index] = value
    setCode(newCode)

    // Auto focus next input
    if (value && index < 3) {
      inputRefs[index + 1].current?.focus()
    }

    // Auto submit when all filled
    if (newCode.every(digit => digit !== '')) {
      const enteredCode = newCode.join('')
      
      if (enteredCode === '1234') {
        setTimeout(() => {
          router.push('/onboarding/user-type')
        }, 500)
      } else {
        alert('Codigo invalido. Use 1234.')
        setCode(['', '', '', ''])
        inputRefs[0].current?.focus()
      }
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs[index - 1].current?.focus()
    }
  }

  return (
    <div className="h-dvh bg-neutral-950 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="p-6">
        <button 
          onClick={() => router.back()}
          className="text-white"
        >
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 px-6 pb-8 flex flex-col">
        <div className="max-w-md mx-auto w-full flex-1 flex flex-col">
          <div className="space-y-3 mb-12">
            <h1 className="text-2xl font-bold text-white">
              Digite o código
            </h1>
            <p className="text-gray-400">
              Enviamos seu código via SMS para {phone || '+55 91982340434'}
            </p>
            <div className="bg-blue-900/30 border border-blue-600/50 rounded-lg p-3 mt-4">
              <p className="text-blue-300 text-sm text-center">
                Código de teste: <span className="font-bold text-white">1234</span>
              </p>
              <Button
                onClick={() => {
                  setCode(['1', '2', '3', '4'])
                  setTimeout(() => {
                    router.push('/onboarding/user-type')
                  }, 500)
                }}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white text-sm h-9 rounded-lg"
              >
                Preencher automaticamente
              </Button>
            </div>
          </div>

          {/* Code Input */}
          <div className="flex gap-4 justify-center mb-8">
            {code.map((digit, index) => (
              <input
                key={index}
                ref={inputRefs[index]}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={digit}
                onChange={(e) => handleCodeChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-16 h-20 bg-transparent border-b-2 border-gray-600 text-white text-4xl text-center focus:outline-none focus:border-blue-600 transition-colors"
              />
            ))}
          </div>

          {/* Resend button */}
          <div className="mt-auto">
            <Button
              disabled={timer > 0}
              variant="ghost"
              className="w-full text-gray-400 hover:text-white hover:bg-neutral-800 h-14 text-base rounded-xl disabled:opacity-50"
            >
              Reenviar código {timer > 0 ? `00:${timer.toString().padStart(2, '0')}` : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
