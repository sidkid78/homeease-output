'use client'

import * as React from "react"

interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  onValueChange?: (value: any) => void
  value?: string
  defaultValue?: string
  name?: string
}

interface RadioGroupItemProps extends React.InputHTMLAttributes<HTMLInputElement> {
  value: string
}

const RadioGroupContext = React.createContext<{
  value?: string
  onValueChange?: (value: any) => void
  name?: string
}>({})

const RadioGroup = React.forwardRef<HTMLDivElement, RadioGroupProps>(
  ({ className = '', onValueChange, value, defaultValue, name, children, ...props }, ref) => {
    const [internalValue, setInternalValue] = React.useState(defaultValue || '')
    const currentValue = value !== undefined ? value : internalValue

    const handleValueChange = (newValue: string) => {
      if (value === undefined) {
        setInternalValue(newValue)
      }
      onValueChange?.(newValue)
    }

    return (
      <RadioGroupContext.Provider value={{ value: currentValue, onValueChange: handleValueChange, name }}>
        <div ref={ref} className={`grid gap-2 ${className}`} role="radiogroup" {...props}>
          {children}
        </div>
      </RadioGroupContext.Provider>
    )
  }
)
RadioGroup.displayName = "RadioGroup"

const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className = '', value, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext)
    const isChecked = context.value === value

    return (
      <input
        ref={ref}
        type="radio"
        className={`aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
        checked={isChecked}
        value={value}
        name={context.name}
        onChange={(e) => {
          if (e.target.checked) {
            context.onValueChange?.(value)
          }
        }}
        {...props}
      />
    )
  }
)
RadioGroupItem.displayName = "RadioGroupItem"

export { RadioGroup, RadioGroupItem }
