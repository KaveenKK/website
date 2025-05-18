"use client"

import { useState } from "react"

interface XpConverterProps {
  xp: number
  convertXpToGold: (amount: number) => number
}

export default function XpConverter({ xp, convertXpToGold }: XpConverterProps) {
  const [xpAmount, setXpAmount] = useState("")
  const [goldResult, setGoldResult] = useState(0)

  const handleConvert = () => {
    const amount = Number.parseInt(xpAmount)
    if (isNaN(amount) || amount <= 0) {
      alert("Please enter a valid XP amount")
      return
    }

    const goldAmount = convertXpToGold(amount)
    if (goldAmount > 0) {
      setGoldResult(goldAmount)
      setXpAmount("")
    }
  }

  return (
    <div className="bg-white bg-opacity-90 rounded-xl p-4 shadow-lg">
      <h3 className="text-sm font-semibold text-indigo-600 mb-2">XP Converter</h3>
      <div className="flex flex-wrap items-center gap-2">
        <input
          type="number"
          value={xpAmount}
          onChange={(e) => setXpAmount(e.target.value)}
          placeholder="Enter XP amount"
          className="flex-1 min-w-[100px] px-3 py-2 border-2 border-gray-200 rounded-lg text-sm"
        />
        <button
          onClick={handleConvert}
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition transform hover:-translate-y-0.5"
        >
          Convert
        </button>
        <div className="bg-gray-100 px-4 py-2 rounded-lg font-semibold text-indigo-600 text-sm">{goldResult} Gold</div>
      </div>
    </div>
  )
}
