"use client"

interface CharacterPathProps {
  activeStage: number
  activateStage: (stage: number) => void
}

export default function CharacterPath({ activeStage, activateStage }: CharacterPathProps) {
  const stages = [
    { id: 1, name: "Egg", color: "bg-yellow-200" },
    { id: 2, name: "Hatchling", color: "bg-cyan-200" },
    { id: 3, name: "Baby", color: "bg-blue-300" },
    { id: 4, name: "Child", color: "bg-indigo-200" },
    { id: 5, name: "Teen", color: "bg-orange-200" },
    { id: 6, name: "Training", color: "bg-red-300" },
    { id: 7, name: "Fighter", color: "bg-pink-300" },
    { id: 8, name: "Warrior", color: "bg-pink-500" },
    { id: 9, name: "Champion", color: "bg-indigo-500" },
    { id: 10, name: "Legendary", color: "bg-green-500" },
  ]

  return (
    <div className="flex overflow-x-auto pb-2 gap-3 scrollbar-thin scrollbar-thumb-indigo-600 scrollbar-track-transparent">
      {stages.map((stage) => (
        <div
          key={stage.id}
          onClick={() => activateStage(stage.id)}
          className="flex flex-col items-center cursor-pointer transition transform hover:-translate-y-1"
        >
          <div
            className={`w-14 h-14 ${stage.color} rounded-xl flex items-center justify-center mb-2 ${
              activeStage === stage.id ? "ring-4 ring-indigo-500 shadow-lg" : ""
            } ${stage.id === 10 ? "shadow-green-400 shadow-inner" : ""}`}
          ></div>
          <span className="text-xs text-gray-600">{stage.name}</span>
        </div>
      ))}
    </div>
  )
}
