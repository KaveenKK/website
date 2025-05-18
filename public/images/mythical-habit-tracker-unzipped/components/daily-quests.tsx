"use client"

interface DailyQuestsProps {
  completedQuests: number[]
  completeQuest: (questIndex: number, xpReward: number) => void
}

export default function DailyQuests({ completedQuests, completeQuest }: DailyQuestsProps) {
  const quests = [
    { id: 0, task: "Drink 8 glasses of water", xpReward: 20 },
    { id: 1, task: "Exercise for 30 minutes", xpReward: 50 },
    { id: 2, task: "Read for 20 minutes", xpReward: 30 },
    { id: 3, task: "Meditate for 10 minutes", xpReward: 25 },
    { id: 4, task: "Complete one work task", xpReward: 40 },
  ]

  return (
    <div className="space-y-3">
      {quests.map((quest) => {
        const isCompleted = completedQuests.includes(quest.id)
        return (
          <div key={quest.id} className="flex items-center p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
            <input
              type="checkbox"
              checked={isCompleted}
              onChange={() => !isCompleted && completeQuest(quest.id, quest.xpReward)}
              disabled={isCompleted}
              className="w-5 h-5 border-2 border-indigo-500 rounded-md mr-3 checked:bg-green-500 checked:border-green-500 appearance-none relative"
              style={{
                backgroundImage: isCompleted
                  ? "url(\"data:image/svg+xml,%3csvg viewBox='0 0 16 16' fill='white' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M12.207 4.793a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0l-2-2a1 1 0 011.414-1.414L6.5 9.086l4.293-4.293a1 1 0 011.414 0z'/%3e%3c/svg%3e\")"
                  : "",
                backgroundSize: "100% 100%",
              }}
            />
            <label className="flex-1 text-sm cursor-pointer">{quest.task}</label>
            <span className="text-xs font-semibold text-indigo-600">+{quest.xpReward} XP</span>
          </div>
        )
      })}
    </div>
  )
}
