"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface NightJournalProps {
  addXp: (amount: number) => void
}

export default function NightJournal({ addXp }: NightJournalProps) {
  const [entry, setEntry] = useState("")
  const [wordCount, setWordCount] = useState(0)
  const [isCompleted, setIsCompleted] = useState(false)
  const [journalEntries, setJournalEntries] = useLocalStorage<Record<string, string>>("journalEntries", {})
  const today = new Date().toISOString().split("T")[0]

  // Check if journal was already submitted today
  useEffect(() => {
    if (journalEntries[today]) {
      setEntry(journalEntries[today])
      setIsCompleted(true)
      countWords(journalEntries[today])
    }
  }, [journalEntries, today])

  const countWords = (text: string) => {
    const words = text.trim().split(/\s+/)
    setWordCount(text.trim() === "" ? 0 : words.length)
  }

  const handleEntryChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEntry(e.target.value)
    countWords(e.target.value)
  }

  const saveJournal = () => {
    if (wordCount >= 50) {
      // Award XP for journal entry
      addXp(100)

      // Save journal entry to localStorage
      setJournalEntries({ ...journalEntries, [today]: entry })

      // Mark as completed
      setIsCompleted(true)

      // Show success message
      alert("Journal saved! You earned 100 XP.")
    }
  }

  return (
    <div className="space-y-3">
      <textarea
        value={entry}
        onChange={handleEntryChange}
        disabled={isCompleted}
        placeholder="Write at least 50 words about your day to earn 100 XP..."
        className="w-full min-h-[120px] p-3 border-2 border-gray-200 rounded-lg text-sm resize-y focus:outline-none focus:border-indigo-500 disabled:bg-gray-100"
      />
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-600">
          {wordCount} words {isCompleted ? "(completed today)" : ""}
        </span>
        <button
          onClick={saveJournal}
          disabled={wordCount < 50 || isCompleted}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          Save Journal
        </button>
      </div>
    </div>
  )
}
