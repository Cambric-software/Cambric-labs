import { useEffect, useRef } from 'react'
import styles from './TrainingGraph.module.css'

interface TrainingGraphProps {
  data: { cycle: number; loss: number }[]
}

export function TrainingGraph({ data }: TrainingGraphProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas || data.length < 2) return
    
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    
    // Set canvas size
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * window.devicePixelRatio
    canvas.height = rect.height * window.devicePixelRatio
    ctx.scale(window.devicePixelRatio, window.devicePixelRatio)
    
    const width = rect.width
    const height = rect.height
    const padding = { top: 20, right: 20, bottom: 30, left: 50 }
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height)
    
    // Calculate bounds
    const xMin = 0
    const xMax = Math.max(...data.map((d) => d.cycle))
    const yMin = 0
    const yMax = Math.max(...data.map((d) => d.loss)) * 1.1
    
    // Scale functions
    const scaleX = (x: number) =>
      padding.left + ((x - xMin) / (xMax - xMin)) * (width - padding.left - padding.right)
    const scaleY = (y: number) =>
      height - padding.bottom - ((y - yMin) / (yMax - yMin)) * (height - padding.top - padding.bottom)
    
    // Draw grid
    ctx.strokeStyle = '#21262D'
    ctx.lineWidth = 1
    
    // Horizontal grid lines
    for (let i = 0; i <= 4; i++) {
      const y = padding.top + (i * (height - padding.top - padding.bottom)) / 4
      ctx.beginPath()
      ctx.moveTo(padding.left, y)
      ctx.lineTo(width - padding.right, y)
      ctx.stroke()
      
      // Y-axis labels
      const value = yMax - (i * (yMax - yMin)) / 4
      ctx.fillStyle = '#484F58'
      ctx.font = '10px JetBrains Mono'
      ctx.textAlign = 'right'
      ctx.fillText(value.toFixed(3), padding.left - 8, y + 4)
    }
    
    // Vertical grid lines
    for (let i = 0; i <= 4; i++) {
      const x = padding.left + (i * (width - padding.left - padding.right)) / 4
      ctx.beginPath()
      ctx.moveTo(x, padding.top)
      ctx.lineTo(x, height - padding.bottom)
      ctx.stroke()
      
      // X-axis labels
      const value = xMin + (i * (xMax - xMin)) / 4
      ctx.fillStyle = '#484F58'
      ctx.font = '10px JetBrains Mono'
      ctx.textAlign = 'center'
      ctx.fillText(Math.round(value).toString(), x, height - 10)
    }
    
    // Draw axes
    ctx.strokeStyle = '#30363D'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(padding.left, padding.top)
    ctx.lineTo(padding.left, height - padding.bottom)
    ctx.lineTo(width - padding.right, height - padding.bottom)
    ctx.stroke()
    
    // Draw loss line
    ctx.strokeStyle = '#F85149'
    ctx.lineWidth = 2
    ctx.lineJoin = 'round'
    ctx.lineCap = 'round'
    
    ctx.beginPath()
    data.forEach((point, i) => {
      const x = scaleX(point.cycle)
      const y = scaleY(point.loss)
      if (i === 0) {
        ctx.moveTo(x, y)
      } else {
        ctx.lineTo(x, y)
      }
    })
    ctx.stroke()
    
    // Draw gradient fill under the line
    const gradient = ctx.createLinearGradient(0, padding.top, 0, height - padding.bottom)
    gradient.addColorStop(0, 'rgba(248, 81, 73, 0.3)')
    gradient.addColorStop(1, 'rgba(248, 81, 73, 0)')
    
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.moveTo(scaleX(data[0].cycle), height - padding.bottom)
    data.forEach((point) => {
      ctx.lineTo(scaleX(point.cycle), scaleY(point.loss))
    })
    ctx.lineTo(scaleX(data[data.length - 1].cycle), height - padding.bottom)
    ctx.closePath()
    ctx.fill()
    
    // Draw data points
    ctx.fillStyle = '#F85149'
    data.forEach((point) => {
      const x = scaleX(point.cycle)
      const y = scaleY(point.loss)
      ctx.beginPath()
      ctx.arc(x, y, 3, 0, Math.PI * 2)
      ctx.fill()
    })
    
  }, [data])
  
  if (data.length < 2) {
    return (
      <div className={styles.empty}>
        <p>Run more cycles to see the loss graph</p>
      </div>
    )
  }
  
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h4>Loss Over Time</h4>
        <span className={styles.latest}>
          Latest: {data[data.length - 1].loss.toFixed(6)}
        </span>
      </div>
      <canvas ref={canvasRef} className={styles.canvas} />
    </div>
  )
}
