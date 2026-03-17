import confetti from 'canvas-confetti'

export const useConfetti = () => {
    const burst = () => {
        confetti({
            particleCount: 120,
            spread: 80,
            origin: { y: 0.6 },
            colors: ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'],
        })
    }

    const sides = () => {
        const left = confetti.create(null, { resize: true })
        const right = confetti.create(null, { resize: true })
        left({
            particleCount: 60,
            angle: 60,
            spread: 55,
            origin: { x: 0, y: 0.65 },
            colors: ['#2563eb', '#10b981', '#f59e0b'],
        })
        right({
            particleCount: 60,
            angle: 120,
            spread: 55,
            origin: { x: 1, y: 0.65 },
            colors: ['#8b5cf6', '#06b6d4', '#f97316'],
        })
    }

    const celebrate = () => {
        burst()
        setTimeout(sides, 200)
        setTimeout(burst, 600)
    }

    return { burst, sides, celebrate }
}
