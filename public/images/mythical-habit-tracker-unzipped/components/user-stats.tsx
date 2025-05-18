interface UserStatsProps {
  xp: number
  gold: number
  level: number
}

export default function UserStats({ xp, gold, level }: UserStatsProps) {
  return (
    <div className="sticky bottom-0 flex justify-around bg-white bg-opacity-90 backdrop-blur-md rounded-xl p-4 shadow-lg">
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-600">XP</span>
        <span className="text-lg font-bold text-indigo-600">{xp}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-600">Gold</span>
        <span className="text-lg font-bold text-indigo-600">{gold}</span>
      </div>
      <div className="flex flex-col items-center">
        <span className="text-xs text-gray-600">Level</span>
        <span className="text-lg font-bold text-indigo-600">{level}</span>
      </div>
    </div>
  )
}
