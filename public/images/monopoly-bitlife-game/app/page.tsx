"use client"

import { useRef, useCallback, useEffect, useState } from "react"
import { Dice1, Dice2, Dice3, Dice4, Dice5, Dice6, Home, Briefcase, Heart, Coins, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function GamePage() {
  // Game state
  const [position, setPosition] = useState(0)
  const [money, setMoney] = useState(1500)
  const [happiness, setHappiness] = useState(50)
  const [health, setHealth] = useState(100)
  const [career, setCareer] = useState(0)
  const [properties, setProperties] = useState<{ id: number; houses: number }[]>([])
  const [diceValue, setDiceValue] = useState(1)
  const [isRolling, setIsRolling] = useState(false)
  const [eventMessage, setEventMessage] = useState("Welcome to MonoLife! Roll the dice to start your journey.")
  const [showEvent, setShowEvent] = useState(false)
  const [currentEvent, setCurrentEvent] = useState<any>(null)
  const [gameOver, setGameOver] = useState(false)

  const boardRef = useRef<HTMLDivElement>(null)

  // Function to scroll to current position
  const scrollToCurrentPosition = useCallback(() => {
    if (boardRef.current) {
      const spaceElements = boardRef.current.querySelectorAll("[data-space-id]")
      const currentSpaceElement = spaceElements[position]

      if (currentSpaceElement) {
        const containerWidth = boardRef.current.offsetWidth
        const scrollPosition =
          currentSpaceElement.getBoundingClientRect().left +
          boardRef.current.scrollLeft -
          containerWidth / 2 +
          (currentSpaceElement as HTMLElement).offsetWidth / 2

        boardRef.current.scrollTo({
          left: scrollPosition,
          behavior: "smooth",
        })
      }
    }
  }, [position])

  // Scroll to current position when it changes
  useEffect(() => {
    scrollToCurrentPosition()
  }, [position, scrollToCurrentPosition])

  // Game board
  const boardSpaces = [
    { name: "Start", type: "special", color: "bg-green-500" },
    { name: "Small House", type: "property", price: 100, rent: 20, color: "bg-amber-500" },
    { name: "Life Event", type: "event", color: "bg-purple-500" },
    { name: "Apartment", type: "property", price: 150, rent: 30, color: "bg-amber-600" },
    { name: "Tax", type: "tax", amount: 200, color: "bg-red-500" },
    { name: "Career Opportunity", type: "career", color: "bg-blue-500" },
    { name: "Luxury Condo", type: "property", price: 300, rent: 50, color: "bg-amber-700" },
    { name: "Life Event", type: "event", color: "bg-purple-500" },
    { name: "Mansion", type: "property", price: 400, rent: 100, color: "bg-amber-800" },
    { name: "Hospital", type: "hospital", cost: 150, color: "bg-red-600" },
    { name: "Lottery", type: "lottery", color: "bg-green-600" },
    { name: "Life Event", type: "event", color: "bg-purple-500" },
  ]

  // Life events
  const lifeEvents = [
    {
      title: "New Job Offer",
      description: "You've been offered a new job with better pay!",
      options: [
        {
          text: "Accept offer",
          effect: () => {
            setMoney(money + 200)
            setCareer(career + 10)
            setHappiness(happiness + 5)
          },
        },
        {
          text: "Decline offer",
          effect: () => {
            setHappiness(happiness - 5)
          },
        },
      ],
    },
    {
      title: "Health Issue",
      description: "You're feeling under the weather.",
      options: [
        {
          text: "Visit doctor ($100)",
          effect: () => {
            setMoney(money - 100)
            setHealth(Math.min(100, health + 20))
          },
        },
        {
          text: "Ignore it",
          effect: () => {
            setHealth(Math.max(0, health - 15))
          },
        },
      ],
    },
    {
      title: "Vacation Opportunity",
      description: "You could use a break from your busy life.",
      options: [
        {
          text: "Go on vacation ($200)",
          effect: () => {
            setMoney(money - 200)
            setHappiness(Math.min(100, happiness + 30))
            setHealth(Math.min(100, health + 10))
          },
        },
        {
          text: "Keep working",
          effect: () => {
            setMoney(money + 100)
            setHappiness(Math.max(0, happiness - 10))
          },
        },
      ],
    },
    {
      title: "Family Reunion",
      description: "Your family is gathering this weekend.",
      options: [
        {
          text: "Attend reunion",
          effect: () => {
            setHappiness(Math.min(100, happiness + 15))
          },
        },
        {
          text: "Skip it",
          effect: () => {
            setHappiness(Math.max(0, happiness - 15))
          },
        },
      ],
    },
    {
      title: "Investment Opportunity",
      description: "A friend suggests a business investment.",
      options: [
        {
          text: "Invest $300",
          effect: () => {
            const success = Math.random() > 0.5
            if (success) {
              setMoney(money + 600)
              setEventMessage("Your investment paid off!")
            } else {
              setMoney(money - 300)
              setEventMessage("Your investment failed!")
            }
          },
        },
        {
          text: "Pass",
          effect: () => {
            /* No effect */
          },
        },
      ],
    },
  ]

  // Dice roll function
  const rollDice = () => {
    if (isRolling || gameOver) return

    setIsRolling(true)
    setEventMessage("Rolling dice...")

    // Animate dice roll
    let rollCount = 0
    const maxRolls = 10
    const rollInterval = setInterval(() => {
      setDiceValue(Math.floor(Math.random() * 6) + 1)
      rollCount++

      if (rollCount >= maxRolls) {
        clearInterval(rollInterval)
        const finalValue = Math.floor(Math.random() * 6) + 1
        setDiceValue(finalValue)
        movePlayer(finalValue)
        setIsRolling(false)
      }
    }, 100)
  }

  // Move player function
  const movePlayer = (spaces: number) => {
    const newPosition = (position + spaces) % boardSpaces.length
    setPosition(newPosition)

    // Handle landing on different space types
    const currentSpace = boardSpaces[newPosition]
    setEventMessage(`You landed on ${currentSpace.name}!`)

    switch (currentSpace.type) {
      case "property":
        if (properties.some((p) => p.id === newPosition)) {
          const ownedProperty = properties.find((p) => p.id === newPosition)!
          // Calculate rent based on houses
          const baseRent = currentSpace.rent
          const houseMultiplier = ownedProperty.houses > 0 ? ownedProperty.houses * 0.5 + 1 : 1
          const rent = Math.floor(baseRent * houseMultiplier)
          // Collect rent if you own the property
          setMoney(money + rent)
          setEventMessage(`You collected $${rent} rent from your ${currentSpace.name}!`)
        } else {
          // Option to buy property
          setCurrentEvent({
            title: `Buy ${currentSpace.name}?`,
            description: `This property costs $${currentSpace.price} and generates $${currentSpace.rent} in rent.`,
            options: [
              {
                text: `Buy for $${currentSpace.price}`,
                effect: () => {
                  if (money >= currentSpace.price) {
                    setMoney(money - currentSpace.price)
                    setProperties([...properties, { id: newPosition, houses: 0 }])
                    setHappiness(Math.min(100, happiness + 10))
                  } else {
                    setEventMessage("You don't have enough money!")
                  }
                },
              },
              {
                text: "Pass",
                effect: () => {
                  /* No effect */
                },
              },
            ],
          })
          setShowEvent(true)
        }
        break

      case "event":
        // Random life event
        const randomEvent = lifeEvents[Math.floor(Math.random() * lifeEvents.length)]
        setCurrentEvent(randomEvent)
        setShowEvent(true)
        break

      case "tax":
        // Pay taxes
        setMoney(Math.max(0, money - currentSpace.amount))
        setEventMessage(`You paid $${currentSpace.amount} in taxes!`)
        break

      case "career":
        // Career advancement
        setCareer(career + 15)
        setMoney(money + 150)
        setEventMessage("You got a promotion and a bonus!")
        break

      case "hospital":
        // Hospital visit
        setMoney(Math.max(0, money - currentSpace.cost))
        setHealth(Math.min(100, health + 30))
        setEventMessage(`You paid $${currentSpace.cost} for healthcare and recovered some health!`)
        break

      case "lottery":
        // Lottery chance
        const winAmount = Math.floor(Math.random() * 500) + 100
        const win = Math.random() > 0.7
        if (win) {
          setMoney(money + winAmount)
          setEventMessage(`You won $${winAmount} in the lottery!`)
        } else {
          setEventMessage("No luck with the lottery this time.")
        }
        break

      case "special":
        // Passing start
        setMoney(money + 200)
        setEventMessage("You collected $200 for passing Start!")
        break
    }

    // Check game over conditions
    checkGameStatus()
  }

  // Handle event choice
  const handleEventChoice = (option: any) => {
    option.effect()
    setShowEvent(false)
    checkGameStatus()
  }

  // Check if game should end
  const checkGameStatus = () => {
    if (money <= 0 || health <= 0) {
      setGameOver(true)
      setEventMessage(money <= 0 ? "Game Over! You're bankrupt!" : "Game Over! Your health reached zero!")
    }
  }

  // Build house on property
  const buildHouse = (propertyId: number) => {
    if (gameOver) return

    const property = boardSpaces[propertyId]
    const houseCost = property.price * 0.5

    if (money >= houseCost) {
      setMoney(money - houseCost)

      setProperties(properties.map((p) => (p.id === propertyId ? { ...p, houses: Math.min(p.houses + 1, 4) } : p)))

      setEventMessage(`You built a house on ${property.name}!`)
    } else {
      setEventMessage(`You need $${houseCost} to build a house here.`)
    }
  }

  // Reset game
  const resetGame = () => {
    setPosition(0)
    setMoney(1500)
    setHappiness(50)
    setHealth(100)
    setCareer(0)
    setProperties([])
    setDiceValue(1)
    setIsRolling(false)
    setEventMessage("Welcome to MonoLife! Roll the dice to start your journey.")
    setShowEvent(false)
    setCurrentEvent(null)
    setGameOver(false)
  }

  // Render dice based on value
  const renderDice = () => {
    switch (diceValue) {
      case 1:
        return <Dice1 className="w-12 h-12" />
      case 2:
        return <Dice2 className="w-12 h-12" />
      case 3:
        return <Dice3 className="w-12 h-12" />
      case 4:
        return <Dice4 className="w-12 h-12" />
      case 5:
        return <Dice5 className="w-12 h-12" />
      case 6:
        return <Dice6 className="w-12 h-12" />
      default:
        return <Dice1 className="w-12 h-12" />
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-purple-100 to-blue-100 p-4">
      <header className="text-center mb-4">
        <h1 className="text-2xl font-bold text-purple-800">MonoLife</h1>
        <p className="text-sm text-gray-600">The game of property and life choices</p>
      </header>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-2 mb-4">
        <div className="bg-white rounded-lg p-2 shadow-md text-center">
          <Coins className="w-5 h-5 mx-auto text-yellow-500" />
          <p className="text-xs font-semibold mt-1">Money</p>
          <p className="text-sm">${money}</p>
        </div>
        <div className="bg-white rounded-lg p-2 shadow-md text-center">
          <Heart className="w-5 h-5 mx-auto text-red-500" />
          <p className="text-xs font-semibold mt-1">Health</p>
          <Progress value={health} className="h-2 mt-1" />
        </div>
        <div className="bg-white rounded-lg p-2 shadow-md text-center">
          <Award className="w-5 h-5 mx-auto text-blue-500" />
          <p className="text-xs font-semibold mt-1">Happy</p>
          <Progress value={happiness} className="h-2 mt-1" />
        </div>
        <div className="bg-white rounded-lg p-2 shadow-md text-center">
          <Briefcase className="w-5 h-5 mx-auto text-green-500" />
          <p className="text-xs font-semibold mt-1">Career</p>
          <Progress value={career} className="h-2 mt-1" />
        </div>
      </div>

      {/* Game Board */}
      <div className="relative bg-white rounded-xl shadow-lg p-4 mb-4 overflow-x-auto" ref={boardRef}>
        <div className="flex space-x-2 min-w-max pb-2">
          {boardSpaces.map((space, index) => {
            const ownedProperty = properties.find((p) => p.id === index)
            const isOwned = !!ownedProperty

            return (
              <div
                key={index}
                data-space-id={index}
                className={`relative flex-shrink-0 w-16 h-24 ${space.color} rounded-lg flex flex-col items-center justify-between p-1 text-white shadow ${index === position ? "ring-4 ring-white" : ""}`}
              >
                <div className="text-xs font-bold text-center leading-tight">{space.name}</div>
                {space.type === "property" && <div className="text-xs">${space.price}</div>}
                {index === position && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-1 shadow-lg">
                    <Home className="w-5 h-5 text-purple-600" />
                  </div>
                )}
                {isOwned && (
                  <div className="absolute -bottom-1 right-0 bg-green-400 rounded-full w-4 h-4 flex items-center justify-center">
                    <span className="text-xs">✓</span>
                  </div>
                )}
                {isOwned && ownedProperty.houses > 0 && (
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex">
                    {[...Array(ownedProperty.houses)].map((_, i) => (
                      <Home key={i} className="w-3 h-3 text-green-800" />
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Event Message */}
      <Card className="mb-4">
        <CardContent className="p-4">
          <p className="text-center">{eventMessage}</p>
        </CardContent>
      </Card>

      {/* Owned Properties */}
      {properties.length > 0 && (
        <div className="mb-4">
          <h3 className="text-sm font-bold mb-2">Your Properties:</h3>
          <div className="grid grid-cols-2 gap-2">
            {properties.map((property) => {
              const space = boardSpaces[property.id]
              const houseCost = Math.floor(space.price * 0.5)

              return space.type === "property" ? (
                <Card key={property.id} className="overflow-hidden">
                  <div className={`h-2 ${space.color}`}></div>
                  <CardContent className="p-2">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs font-bold">{space.name}</p>
                        <div className="flex mt-1">
                          {[...Array(property.houses)].map((_, i) => (
                            <Home key={i} className="w-3 h-3 text-green-800 mr-1" />
                          ))}
                        </div>
                      </div>
                      {property.houses < 4 && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-xs h-7 px-2"
                          onClick={() => buildHouse(property.id)}
                        >
                          +🏠 ${houseCost}
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ) : null
            })}
          </div>
        </div>
      )}

      {/* Controls */}
      <div className="mt-auto flex flex-col items-center space-y-4">
        <div className={`p-4 rounded-full bg-white shadow-lg ${isRolling ? "animate-bounce" : ""}`}>{renderDice()}</div>

        <div className="flex space-x-4">
          <Button onClick={rollDice} disabled={isRolling || gameOver} className="bg-purple-600 hover:bg-purple-700">
            Roll Dice
          </Button>

          {gameOver && (
            <Button onClick={resetGame} variant="outline">
              New Game
            </Button>
          )}
        </div>
      </div>

      {/* Life Event Dialog */}
      <Dialog open={showEvent} onOpenChange={setShowEvent}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{currentEvent?.title}</DialogTitle>
            <DialogDescription>{currentEvent?.description}</DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-2 mt-4">
            {currentEvent?.options.map((option: any, index: number) => (
              <Button
                key={index}
                onClick={() => handleEventChoice(option)}
                variant={index === 0 ? "default" : "outline"}
              >
                {option.text}
              </Button>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
