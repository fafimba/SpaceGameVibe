# UI Components Library

> **Fuentes**:
> - [Radix UI](https://www.radix-ui.com/)
> - [Headless UI](https://headlessui.com/)
> - [Tailwind UI](https://tailwindui.com/)

## Design Tokens

### Spacing Scale

```javascript
const spacing = {
    0: '0px',
    1: '4px',
    2: '8px',
    3: '12px',
    4: '16px',
    5: '20px',
    6: '24px',
    8: '32px',
    10: '40px',
    12: '48px',
    16: '64px',
}

// Uso consistente
// Dentro de componentes: 2-4 (8-16px)
// Entre componentes: 4-6 (16-24px)
// Entre secciones: 8-12 (32-48px)
```

### Border Radius

```javascript
const borderRadius = {
    none: '0',
    sm: '4px',    // Botones pequeños, inputs
    md: '8px',    // Cards, modales
    lg: '12px',   // Containers grandes
    xl: '16px',   // Hero sections
    full: '9999px' // Pills, avatares
}
```

### Shadows

```css
:root {
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
    --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);

    /* Para UI oscura de juegos */
    --shadow-glow: 0 0 20px rgba(59, 130, 246, 0.3);
    --shadow-glow-green: 0 0 20px rgba(16, 185, 129, 0.3);
}
```

---

## Buttons

### Variantes

```jsx
function Button({
    children,
    variant = 'primary',
    size = 'md',
    disabled = false,
    loading = false,
    icon,
    ...props
}) {
    const variants = {
        primary: 'bg-blue-600 hover:bg-blue-700 text-white',
        secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
        outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white',
        ghost: 'text-gray-400 hover:text-white hover:bg-gray-700',
        danger: 'bg-red-600 hover:bg-red-700 text-white',
        success: 'bg-green-600 hover:bg-green-700 text-white',
    }

    const sizes = {
        sm: 'px-3 py-1.5 text-sm',
        md: 'px-4 py-2 text-base',
        lg: 'px-6 py-3 text-lg',
    }

    return (
        <button
            className={`
                ${variants[variant]}
                ${sizes[size]}
                rounded-lg font-medium
                transition-all duration-200
                disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2
            `}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? <Spinner size="sm" /> : icon}
            {children}
        </button>
    )
}
```

### Icon Button

```jsx
function IconButton({ icon, label, size = 'md', ...props }) {
    const sizes = {
        sm: 'w-8 h-8 text-sm',
        md: 'w-10 h-10 text-base',
        lg: 'w-12 h-12 text-lg',
    }

    return (
        <button
            className={`
                ${sizes[size]}
                rounded-lg bg-gray-700 hover:bg-gray-600
                text-gray-300 hover:text-white
                flex items-center justify-center
                transition-all duration-200
            `}
            aria-label={label}
            {...props}
        >
            {icon}
        </button>
    )
}
```

---

## Cards

### Basic Card

```jsx
function Card({ children, className = '', onClick, hoverable = false }) {
    return (
        <div
            className={`
                bg-gray-800 rounded-lg p-4
                ${hoverable ? 'hover:bg-gray-750 cursor-pointer transition-colors' : ''}
                ${onClick ? 'cursor-pointer' : ''}
                ${className}
            `}
            onClick={onClick}
        >
            {children}
        </div>
    )
}
```

### Investment Card (ShapesFinancial)

```jsx
function InvestmentCard({ investment, onSelect, isLocked = false }) {
    return (
        <Card
            hoverable={!isLocked}
            onClick={() => !isLocked && onSelect(investment)}
            className={isLocked ? 'opacity-50' : ''}
        >
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className={`
                        w-10 h-10 rounded-lg flex items-center justify-center
                        ${investment.color}
                    `}>
                        {investment.icon}
                    </div>
                    <div>
                        <h3 className="font-medium text-white">
                            {investment.name}
                        </h3>
                        <p className="text-sm text-gray-400">
                            {investment.category}
                        </p>
                    </div>
                </div>

                {isLocked ? (
                    <Lock className="text-gray-500" size={20} />
                ) : (
                    <span className={`
                        text-sm font-medium
                        ${investment.return >= 0 ? 'text-green-400' : 'text-red-400'}
                    `}>
                        {investment.return >= 0 ? '+' : ''}
                        {investment.return}%
                    </span>
                )}
            </div>

            {!isLocked && (
                <div className="mt-3 pt-3 border-t border-gray-700">
                    <div className="flex justify-between text-sm">
                        <span className="text-gray-400">Invested</span>
                        <span className="text-white">
                            ${formatMoney(investment.invested)}
                        </span>
                    </div>
                    <div className="flex justify-between text-sm mt-1">
                        <span className="text-gray-400">Current Value</span>
                        <span className="text-green-400">
                            ${formatMoney(investment.currentValue)}
                        </span>
                    </div>
                </div>
            )}
        </Card>
    )
}
```

---

## Inputs

### Text Input

```jsx
function Input({
    label,
    error,
    prefix,
    suffix,
    ...props
}) {
    return (
        <div className="w-full">
            {label && (
                <label className="block text-sm font-medium text-gray-300 mb-1">
                    {label}
                </label>
            )}

            <div className="relative">
                {prefix && (
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {prefix}
                    </span>
                )}

                <input
                    className={`
                        w-full bg-gray-700 border rounded-lg
                        px-3 py-2 text-white
                        placeholder:text-gray-500
                        focus:outline-none focus:ring-2
                        ${error
                            ? 'border-red-500 focus:ring-red-500'
                            : 'border-gray-600 focus:ring-blue-500'
                        }
                        ${prefix ? 'pl-8' : ''}
                        ${suffix ? 'pr-8' : ''}
                    `}
                    {...props}
                />

                {suffix && (
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                        {suffix}
                    </span>
                )}
            </div>

            {error && (
                <p className="mt-1 text-sm text-red-400">{error}</p>
            )}
        </div>
    )
}
```

### Money Input

```jsx
function MoneyInput({ value, onChange, max, ...props }) {
    const handleChange = (e) => {
        const num = parseFloat(e.target.value) || 0
        onChange(Math.min(num, max))
    }

    return (
        <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-green-400 font-bold">
                $
            </span>
            <input
                type="number"
                value={value}
                onChange={handleChange}
                className="w-full bg-gray-700 border border-gray-600 rounded-lg
                           pl-8 pr-3 py-2 text-white text-lg font-medium
                           focus:outline-none focus:ring-2 focus:ring-green-500"
                {...props}
            />
            <button
                onClick={() => onChange(max)}
                className="absolute right-2 top-1/2 -translate-y-1/2
                           text-xs text-blue-400 hover:text-blue-300"
            >
                MAX
            </button>
        </div>
    )
}
```

---

## Modals

### Base Modal

```jsx
function Modal({ isOpen, onClose, title, children, size = 'md' }) {
    if (!isOpen) return null

    const sizes = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        full: 'max-w-4xl'
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`
                relative ${sizes[size]} w-full mx-4
                bg-gray-800 rounded-xl shadow-2xl
                animate-scale-in
            `}>
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-700">
                    <h2 className="text-xl font-bold text-white">{title}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white p-1"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-4">
                    {children}
                </div>
            </div>
        </div>
    )
}
```

### Confirmation Modal

```jsx
function ConfirmModal({
    isOpen,
    onClose,
    onConfirm,
    title,
    message,
    confirmText = 'Confirmar',
    cancelText = 'Cancelar',
    variant = 'danger'
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} size="sm">
            <div className="text-center">
                <div className={`
                    w-16 h-16 mx-auto rounded-full flex items-center justify-center
                    ${variant === 'danger' ? 'bg-red-900/50' : 'bg-blue-900/50'}
                `}>
                    {variant === 'danger' ? '⚠️' : 'ℹ️'}
                </div>

                <h3 className="mt-4 text-lg font-medium text-white">
                    {title}
                </h3>
                <p className="mt-2 text-gray-400">
                    {message}
                </p>

                <div className="mt-6 flex gap-3">
                    <Button variant="ghost" onClick={onClose} className="flex-1">
                        {cancelText}
                    </Button>
                    <Button
                        variant={variant}
                        onClick={onConfirm}
                        className="flex-1"
                    >
                        {confirmText}
                    </Button>
                </div>
            </div>
        </Modal>
    )
}
```

---

## Tabs

```jsx
function Tabs({ tabs, activeTab, onChange }) {
    return (
        <div className="flex border-b border-gray-700">
            {tabs.map((tab) => (
                <button
                    key={tab.id}
                    onClick={() => onChange(tab.id)}
                    className={`
                        px-4 py-2 font-medium text-sm
                        border-b-2 transition-colors
                        ${activeTab === tab.id
                            ? 'border-blue-500 text-blue-400'
                            : 'border-transparent text-gray-400 hover:text-white'
                        }
                    `}
                >
                    {tab.icon && <span className="mr-2">{tab.icon}</span>}
                    {tab.label}
                    {tab.count !== undefined && (
                        <span className="ml-2 bg-gray-700 px-2 py-0.5 rounded-full text-xs">
                            {tab.count}
                        </span>
                    )}
                </button>
            ))}
        </div>
    )
}
```

---

## Badges & Tags

```jsx
function Badge({ children, variant = 'default', size = 'md' }) {
    const variants = {
        default: 'bg-gray-700 text-gray-300',
        primary: 'bg-blue-900 text-blue-300',
        success: 'bg-green-900 text-green-300',
        warning: 'bg-yellow-900 text-yellow-300',
        danger: 'bg-red-900 text-red-300',
    }

    const sizes = {
        sm: 'px-2 py-0.5 text-xs',
        md: 'px-2.5 py-1 text-sm',
    }

    return (
        <span className={`
            ${variants[variant]}
            ${sizes[size]}
            inline-flex items-center rounded-full font-medium
        `}>
            {children}
        </span>
    )
}

// Uso
<Badge variant="success">+12.5%</Badge>
<Badge variant="danger">-3.2%</Badge>
<Badge variant="primary">Level 5</Badge>
```
