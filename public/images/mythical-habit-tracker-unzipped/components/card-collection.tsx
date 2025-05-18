interface CardCollectionProps {
  unlockedCards: number[]
}

export default function CardCollection({ unlockedCards }: CardCollectionProps) {
  const cards = [
    { id: 0, name: "Fire Dragon", rarity: "Legendary", color: "bg-red-400" },
    { id: 1, name: "Water Spirit", rarity: "Epic", color: "bg-blue-400" },
    { id: 2, name: "Earth Golem", rarity: "Rare", color: "bg-green-400" },
    { id: 3, name: "Wind Fairy", rarity: "Mythic", color: "bg-purple-400" },
  ]

  return (
    <div className="grid grid-cols-2 gap-3">
      {cards.map((card) => {
        const isUnlocked = unlockedCards.includes(card.id)
        return (
          <div
            key={card.id}
            className={`bg-gray-100 rounded-xl overflow-hidden transition transform hover:-translate-y-1 hover:shadow-md ${
              !isUnlocked ? "filter grayscale opacity-70" : ""
            }`}
          >
            <div className={`h-24 ${card.color}`}></div>
            <div className="p-2">
              <h3 className="text-sm font-semibold">{card.name}</h3>
              <p className="text-xs text-gray-600">
                {card.rarity} • {isUnlocked ? "Unlocked" : "Locked"}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
