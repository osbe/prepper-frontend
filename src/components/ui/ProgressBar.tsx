interface Props {
  current: number
  target: number
}

export default function ProgressBar({ current, target }: Props) {
  const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
  const atTarget = current >= target
  return (
    <div className="w-full bg-gray-700 rounded-full h-2">
      <div
        className={`h-2 rounded-full transition-all ${atTarget ? 'bg-green-500' : 'bg-red-500'}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
