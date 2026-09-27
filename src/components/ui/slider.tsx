"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  min?: number
  max?: number
  step?: number
  value?: number
  defaultValue?: number
  onValueChange?: (value: number) => void
  label?: string
  showValue?: boolean
  orientation?: "horizontal" | "vertical"
  /** Accessible text representation of the current value (e.g., "$50" instead of "50") */
  valueText?: string
  /** Minimum number of steps for tick marks (optional visual enhancement) */
  tickMarks?: number
}

const Slider = React.forwardRef<HTMLInputElement, SliderProps>(
  ({
    className,
    min = 0,
    max = 100,
    step = 1,
    value,
    defaultValue,
    onValueChange,
    label,
    showValue = false,
    orientation = "horizontal",
    valueText,
    tickMarks,
    ...props
  }, ref) => {
    const currentValue = value ?? defaultValue ?? min
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const newValue = Number(e.target.value)
      if (onValueChange) onValueChange(newValue)
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      let newValue = currentValue
      const stepValue = step * (e.shiftKey ? 10 : 1) // Shift for larger steps

      switch (e.key) {
        case "ArrowRight":
        case "ArrowUp":
          e.preventDefault()
          newValue = Math.min(currentValue + stepValue, max)
          break
        case "ArrowLeft":
        case "ArrowDown":
          e.preventDefault()
          newValue = Math.max(currentValue - stepValue, min)
          break
        case "Home":
          e.preventDefault()
          newValue = min
          break
        case "End":
          e.preventDefault()
          newValue = max
          break
        case "PageUp":
          e.preventDefault()
          newValue = Math.min(currentValue + step * 10, max)
          break
        case "PageDown":
          e.preventDefault()
          newValue = Math.max(currentValue - step * 10, min)
          break
        default:
          return
      }

      if (onValueChange) onValueChange(newValue)
    }

    const percentage = ((currentValue - min) / (max - min)) * 100
    const ariaValueText = valueText ?? `${currentValue}`

    return (
      <div className={cn("relative w-full", className)}>
        {label && (
          <label className="block text-sm font-medium text-text-secondary mb-2">
            {label}
            {showValue && (
              <span className="ml-2 text-text-muted"> ({currentValue})</span>
            )}
          </label>
        )}
        <div
          className={cn(
            "relative h-2 bg-secondary rounded-full overflow-visible",
            orientation === "vertical" && "w-2 h-full"
          )}
        >
          <div
            className="absolute top-1/2 left-0 h-1 bg-primary rounded-full transform -translate-y-1/2 transition-all duration-100"
            style={{
              width: orientation === "horizontal" ? `${percentage}%` : "100%",
              height: orientation === "vertical" ? `${percentage}%` : "100%",
            }}
          />
          <input
            ref={ref}
            type="range"
            min={min}
            max={max}
            step={step}
            value={currentValue}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            className={cn(
              "absolute inset-0 appearance-none bg-transparent cursor-pointer focus:outline-none",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              "disabled:opacity-50 disabled:cursor-not-allowed"
            )}
            aria-orientation={orientation}
            aria-valuemin={min}
            aria-valuemax={max}
            aria-valuenow={currentValue}
            aria-valuetext={ariaValueText}
            {...props}
          />
          <div
            className={cn(
              "absolute top-1/2 w-4 h-4 bg-background border-2 border-primary rounded-full transform -translate-y-1/2 shadow-md",
              "transition-transform duration-100",
              "focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
              orientation === "horizontal"
                ? `-translate-x-1/2 left-[calc(${percentage}%_-_8px)]`
                : `-translate-x-1/2 bottom-[calc(${percentage}%_-_8px)]`
            )}
            aria-hidden="true"
          />
          {tickMarks && tickMarks > 1 && (
            <div
              className="absolute top-1/2 left-0 right-0 -translate-y-1/2 flex justify-between pointer-events-none"
              aria-hidden="true"
            >
              {Array.from({ length: tickMarks }, (_, i) => (
                <div
                  key={i}
                  className="w-px h-2 bg-border/50"
                  style={{
                    left: orientation === "horizontal" ? `${(i / (tickMarks - 1)) * 100}%` : undefined,
                    bottom: orientation === "vertical" ? `${(i / (tickMarks - 1)) * 100}%` : undefined,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }
)
Slider.displayName = "Slider"

export { Slider }