"use client"

import type React from "react"

import { useEffect, useState, useCallback } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"
import Image from "next/image"

export default function Home() {
  const [mounted, setMounted] = useState(false)
  const [xp, setXp] = useLocalStorage("xp", 50)
  const [gold, setGold] = useLocalStorage("gold", 0)
  const [level, setLevel] = useLocalStorage("level", 1)
  const [unlockedCards, setUnlockedCards] = useLocalStorage<number[]>("unlockedCards", [0, 1])
  const [completedQuests, setCompletedQuests] = useLocalStorage<number[]>("completedQuests", [])
  const [activeStage, setActiveStage] = useLocalStorage<number>("activeStage", 1)
  const [lastReset, setLastReset] = useLocalStorage<string>("lastReset", "")
  const [xpAmount, setXpAmount] = useState("")
  const [journalEntry, setJournalEntry] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const [journalCompleted, setJournalCompleted] = useState(false)
  const [journalEntries, setJournalEntries] = useLocalStorage<Record<string, string>>("journalEntries", {})

  // Character journey stages
  const stages = [
    { id: 1, name: "Egg Hatching", image: "/images/egg-hatching.png" },
    { id: 2, name: "First Steps", image: "/images/first-steps.png" },
    { id: 3, name: "Training", image: "/images/training.png" },
    { id: 4, name: "Growing Wings", image: "/images/growing-wings.png" },
    { id: 5, name: "Flight Training", image: "/images/flight-training.png" },
    { id: 6, name: "First Battle", image: "/images/first-battle.png" },
    { id: 7, name: "Meditation", image: "/images/meditation.png" },
    { id: 8, name: "Receiving Weapon", image: "/images/receiving-weapon.png" },
    { id: 9, name: "Victory", image: "/images/victory.png" },
    { id: 10, name: "Full Adult", image: "/images/full-adult.png" },
  ]

  // NFT cards
  const cards = [
    { id: 0, name: "Mythical Creature", image: "/images/mythical-creature.png" },
    { id: 1, name: "Mystical Artifact", image: "/images/mystical-artifact.png" },
    { id: 2, name: "Legendary Warrior", image: "/images/legendary-warrior.png" },
  ]

  // Daily quests
  const quests = [
    { id: 0, task: "Walk 10,000 steps", xpReward: 20 },
    { id: 1, task: "Read for 30 minutes", xpReward: 30 },
    { id: 2, task: "Meditate for 10 minutes", xpReward: 25 },
  ]

  // Add XP and check for level up
  const addXp = useCallback(
    (amount: number) => {
      setXp((prevXp) => {
        const newXp = prevXp + amount

        // Check for level up (100 XP per level)
        const newLevel = Math.floor(newXp / 100) + 1
        if (newLevel > level) {
          // Level up!
          const levelsGained = newLevel - level
          setLevel(newLevel)

          // Award gold for leveling up
          const goldBonus = levelsGained * 50
          setGold((prevGold) => prevGold + goldBonus)

          alert(`Level Up! You are now level ${newLevel}!\nYou received ${goldBonus} gold for leveling up!`)
        }

        return newXp
      })
    },
    [level, setGold, setLevel, setXp],
  )

  // Convert XP to Gold
  const convertXpToGold = useCallback(() => {
    const amount = Number.parseInt(xpAmount)
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid XP amount")
      return
    }

    if (amount > xp) {
      alert("You don't have enough XP!")
      return
    }

    // Convert XP to Gold (1 XP = 0.5 Gold)
    const goldAmount = Math.floor(amount * 0.5)

    // Update totals
    setXp((prevXp) => prevXp - amount)
    setGold((prevGold) => prevGold + goldAmount)

    // Clear input
    setXpAmount("")

    // Show success message
    alert(`Converted ${amount} XP to ${goldAmount} Gold!`)
  }, [xp, xpAmount, setXp, setGold])

  // Unlock a random card
  const unlockRandomCard = useCallback(() => {
    const lockedCardIndexes = [0, 1, 2].filter((index) => !unlockedCards.includes(index))

    if (lockedCardIndexes.length > 0) {
      const randomIndex = lockedCardIndexes[Math.floor(Math.random() * lockedCardIndexes.length)]
      setUnlockedCards((prev) => [...prev, randomIndex])
      alert("Congratulations! You unlocked a new character card!")
    }
  }, [unlockedCards, setUnlockedCards])

  // Complete a quest
  const completeQuest = useCallback(
    (questIndex: number, xpReward: number) => {
      if (!completedQuests.includes(questIndex)) {
        setCompletedQuests((prev) => [...prev, questIndex])
        addXp(xpReward)
        alert(`Quest completed! You earned ${xpReward} XP.`)
      }
    },
    [completedQuests, setCompletedQuests, addXp],
  )

  // Activate a character stage
  const activateStage = useCallback(
    (stage: number) => {
      const requiredLevel = stage * 5 // Each stage requires level 5, 10, 15, etc.

      if (level >= requiredLevel) {
        setActiveStage(stage)

        // If it's the final stage, unlock a new card
        if (stage === 10) {
          unlockRandomCard()
        }

        alert(`You've reached the "${stages[stage - 1].name}" stage!`)
      } else {
        alert(`You need to reach level ${requiredLevel} to unlock this stage!`)
      }
    },
    [level, setActiveStage, unlockRandomCard, stages],
  )

  // Count words in journal entry
  const countWords = useCallback((text: string) => {
    const words = text.trim().split(/\s+/)
    return text.trim() === "" ? 0 : words.length
  }, [])

  // Handle journal entry change
  const handleJournalChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setJournalEntry(e.target.value)
      setWordCount(countWords(e.target.value))
    },
    [countWords],
  )

  // Save journal entry
  const saveJournal = useCallback(() => {
    if (wordCount >= 50) {
      // Award XP for journal entry
      addXp(100)

      // Save journal entry to localStorage
      const today = new Date().toISOString().split("T")[0]
      setJournalEntries((prev) => ({ ...prev, [today]: journalEntry }))

      // Mark as completed
      setJournalCompleted(true)

      // Show success message
      alert("Journal saved! You earned 100 XP.")
    } else {
      alert("Please write at least 50 words to save your journal.")
    }
  }, [wordCount, journalEntry, addXp, setJournalEntries])

  // Check for daily reset
  const checkAndResetDaily = useCallback(() => {
    const today = new Date().toISOString().split("T")[0]

    if (lastReset !== today) {
      // Reset quests
      setCompletedQuests([])

      // Reset journal completion
      setJournalCompleted(false)
      setJournalEntry("")
      setWordCount(0)

      // Save last reset date
      setLastReset(today)
    } else {
      // Check if journal was already completed today
      if (journalEntries[today]) {
        setJournalEntry(journalEntries[today])
        setWordCount(countWords(journalEntries[today]))
        setJournalCompleted(true)
      }
    }
  }, [lastReset, setCompletedQuests, setLastReset, journalEntries, countWords])

  useEffect(() => {
    setMounted(true)
    checkAndResetDaily()
  }, [checkAndResetDaily])

  if (!mounted) {
    return null
  }

  return (
    <main className="min-h-screen bg-gray-100 py-6 px-4">
      <div className="max-w-md mx-auto space-y-4">
        {/* XP Converter */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <div className="flex gap-2">
            <input
              type="number"
              value={xpAmount}
              onChange={(e) => setXpAmount(e.target.value)}
              placeholder="Enter XP"
              className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm"
            />
            <button onClick={convertXpToGold} className="bg-indigo-500 text-white px-6 py-2 rounded-lg font-medium">
              Convert
            </button>
          </div>
        </div>

        {/* Character Journey */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <h2 className="text-2xl font-bold mb-4">Character Journey</h2>
          <div className="grid grid-cols-2 gap-3">
            {stages.map((stage) => (
              <div
                key={stage.id}
                onClick={() => activateStage(stage.id)}
                className={`bg-white rounded-xl p-3 border border-gray-200 flex flex-col items-center cursor-pointer transition hover:shadow-md ${
                  activeStage === stage.id ? "ring-2 ring-indigo-500" : ""
                }`}
              >
                <div className="w-16 h-16 relative mb-2">
                  <Image src={stage.image || "/placeholder.svg"} alt={stage.name} fill className="object-contain" />
                </div>
                <span className="text-xs text-center">{stage.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* NFT Cards Collection */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <h2 className="text-2xl font-bold mb-4">NFT Cards Collection</h2>
          <div className="grid grid-cols-3 gap-3">
            {cards.map((card) => {
              const isUnlocked = unlockedCards.includes(card.id)
              return (
                <div
                  key={card.id}
                  className={`bg-white rounded-xl p-3 border border-gray-200 flex flex-col items-center ${
                    !isUnlocked ? "opacity-50 grayscale" : ""
                  }`}
                >
                  <div className="w-16 h-16 relative mb-2">
                    <Image src={card.image || "/placeholder.svg"} alt={card.name} fill className="object-contain" />
                  </div>
                  <span className="text-xs text-center">{card.name}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Daily Quests */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <h2 className="text-2xl font-bold mb-4">Daily Quests</h2>
          <div className="space-y-3">
            {quests.map((quest) => {
              const isCompleted = completedQuests.includes(quest.id)
              return (
                <div key={quest.id} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isCompleted}
                    onChange={() => !isCompleted && completeQuest(quest.id, quest.xpReward)}
                    disabled={isCompleted}
                    className="w-5 h-5 border-2 border-gray-300 rounded mr-3"
                  />
                  <label className="text-sm">{quest.task}</label>
                </div>
              )
            })}
          </div>
        </div>

        {/* Daily Night Journal */}
        <div className="bg-white rounded-xl p-4 shadow-md">
          <h2 className="text-2xl font-bold mb-4">Daily Night Journal</h2>
          <textarea
            value={journalEntry}
            onChange={handleJournalChange}
            disabled={journalCompleted}
            placeholder="Write about your day..."
            className="w-full h-32 p-3 border border-gray-200 rounded-lg text-sm resize-none mb-3"
          />
          <button
            onClick={saveJournal}
            disabled={wordCount < 50 || journalCompleted}
            className="w-full bg-indigo-500 text-white py-3 rounded-lg font-medium disabled:bg-gray-300"
          >
            Save Journal
          </button>
        </div>

        {/* User Stats */}
        <div className="bg-white rounded-xl p-4 shadow-md flex justify-around">
          <div className="text-center">
            <div className="text-sm text-gray-500">XP</div>
            <div className="font-bold text-lg">{xp}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Gold</div>
            <div className="font-bold text-lg">{gold}</div>
          </div>
          <div className="text-center">
            <div className="text-sm text-gray-500">Level</div>
            <div className="font-bold text-lg">{level}</div>
          </div>
        </div>
      </div>
    </main>
  )
}
