import React, { useState, useEffect } from 'react'
import { ClockIcon } from '@heroicons/react/24/outline'

const CountdownTimer = ({ targetDate, onComplete }) => {
  const [timeLeft, setTimeLeft] = useState({})

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate) - new Date()
      
      if (difference <= 0) {
        onComplete?.()
        return { completed: true }
      }

      return {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60)
      }
    }

    setTimeLeft(calculateTimeLeft())
    
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft())
    }, 1000)

    return () => clearInterval(timer)
  }, [targetDate, onComplete])

  if (timeLeft.completed) {
    return <div className="text-red-400 font-semibold">Élection terminée</div>
  }

  const formatNumber = (num) => String(num).padStart(2, '0')

  return (
    <div className="flex items-center gap-4 text-white">
      <ClockIcon className="h-5 w-5 text-primary-400" />
      <div className="flex gap-2">
        {timeLeft.days > 0 && (
          <div className="text-center">
            <span className="text-2xl font-bold text-primary-400">{timeLeft.days}</span>
            <span className="text-xs ml-1">j</span>
          </div>
        )}
        <div className="text-center">
          <span className="text-2xl font-bold text-primary-400">{formatNumber(timeLeft.hours)}</span>
          <span className="text-xs ml-1">h</span>
        </div>
        <div className="text-center">
          <span className="text-2xl font-bold text-primary-400">{formatNumber(timeLeft.minutes)}</span>
          <span className="text-xs ml-1">m</span>
        </div>
        <div className="text-center">
          <span className="text-2xl font-bold text-primary-400">{formatNumber(timeLeft.seconds)}</span>
          <span className="text-xs ml-1">s</span>
        </div>
      </div>
    </div>
  )
}

export default CountdownTimer