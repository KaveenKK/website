// Game state
let position = 0
let money = 1500
let happiness = 50
let health = 100
let career = 0
let properties = []
let diceValue = 1
let isRolling = false
let gameOver = false

// Game board
const boardSpaces = [
  { name: "Start", type: "special", color: "#22c55e" },
  { name: "Small House", type: "property", price: 100, rent: 20, color: "#f59e0b" },
  { name: "Life Event", type: "event", color: "#8b5cf6" },
  { name: "Apartment", type: "property", price: 150, rent: 30, color: "#d97706" },
  { name: "Tax", type: "tax", amount: 200, color: "#ef4444" },
  { name: "Career Opportunity", type: "career", color: "#3b82f6" },
  { name: "Luxury Condo", type: "property", price: 300, rent: 50, color: "#b45309" },
  { name: "Life Event", type: "event", color: "#8b5cf6" },
  { name: "Mansion", type: "property", price: 400, rent: 100, color: "#92400e" },
  { name: "Hospital", type: "hospital", cost: 150, color: "#dc2626" },
  { name: "Lottery", type: "lottery", color: "#16a34a" },
  { name: "Life Event", type: "event", color: "#8b5cf6" },
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
          money += 200
          career += 10
          happiness = Math.min(100, happiness + 5)
          updateStats()
        },
      },
      {
        text: "Decline offer",
        effect: () => {
          happiness = Math.max(0, happiness - 5)
          updateStats()
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
          money -= 100
          health = Math.min(100, health + 20)
          updateStats()
        },
      },
      {
        text: "Ignore it",
        effect: () => {
          health = Math.max(0, health - 15)
          updateStats()
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
          money -= 200
          happiness = Math.min(100, happiness + 30)
          health = Math.min(100, health + 10)
          updateStats()
        },
      },
      {
        text: "Keep working",
        effect: () => {
          money += 100
          happiness = Math.max(0, happiness - 10)
          updateStats()
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
          happiness = Math.min(100, happiness + 15)
          updateStats()
        },
      },
      {
        text: "Skip it",
        effect: () => {
          happiness = Math.max(0, happiness - 15)
          updateStats()
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
            money += 600
            setEventMessage("Your investment paid off!")
          } else {
            money -= 300
            setEventMessage("Your investment failed!")
          }
          updateStats()
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

// DOM elements
const gameBoard = document.getElementById("game-board")
const boardContainer = document.getElementById("board-container")
const moneyValue = document.getElementById("money-value")
const healthBar = document.getElementById("health-bar")
const happinessBar = document.getElementById("happiness-bar")
const careerBar = document.getElementById("career-bar")
const eventMessage = document.getElementById("event-message")
const propertiesSection = document.getElementById("properties-section")
const propertiesGrid = document.getElementById("properties-grid")
const diceElement = document.getElementById("dice")
const diceFace = diceElement.querySelector(".dice-face")
const rollButton = document.getElementById("roll-button")
const newGameButton = document.getElementById("new-game-button")
const eventDialog = document.getElementById("event-dialog")
const eventTitle = document.getElementById("event-title")
const eventDescription = document.getElementById("event-description")
const eventOptions = document.getElementById("event-options")

// Dice faces
const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"]

// Initialize game
function initGame() {
  // Create board spaces
  createGameBoard()

  // Update stats display
  updateStats()

  // Hide properties section initially
  propertiesSection.style.display = "none"

  // Add event listeners
  rollButton.addEventListener("click", rollDice)
  newGameButton.addEventListener("click", resetGame)
}

// Create game board
function createGameBoard() {
  gameBoard.innerHTML = ""

  boardSpaces.forEach((space, index) => {
    const spaceElement = document.createElement("div")
    spaceElement.className = "board-space"
    spaceElement.style.backgroundColor = space.color
    spaceElement.dataset.spaceId = index

    const nameElement = document.createElement("div")
    nameElement.className = "space-name"
    nameElement.textContent = space.name
    spaceElement.appendChild(nameElement)

    if (space.type === "property") {
      const priceElement = document.createElement("div")
      priceElement.className = "space-price"
      priceElement.textContent = `$${space.price}`
      spaceElement.appendChild(priceElement)
    }

    if (index === position) {
      spaceElement.classList.add("current-space")

      const playerToken = document.createElement("div")
      playerToken.className = "player-token"

      const tokenIcon = document.createElement("div")
      tokenIcon.className = "player-token-icon"
      tokenIcon.textContent = "🏠"

      playerToken.appendChild(tokenIcon)
      spaceElement.appendChild(playerToken)
    }

    gameBoard.appendChild(spaceElement)
  })
}

// Update stats display
function updateStats() {
  moneyValue.textContent = `$${money}`
  healthBar.style.width = `${health}%`
  happinessBar.style.width = `${happiness}%`
  careerBar.style.width = `${career}%`
}

// Set event message
function setEventMessage(message) {
  eventMessage.textContent = message
}

// Roll dice function
function rollDice() {
  if (isRolling || gameOver) return

  isRolling = true
  setEventMessage("Rolling dice...")
  rollButton.disabled = true

  diceElement.classList.add("rolling")

  // Animate dice roll
  let rollCount = 0
  const maxRolls = 10
  const rollInterval = setInterval(() => {
    diceValue = Math.floor(Math.random() * 6) + 1
    diceFace.textContent = diceFaces[diceValue - 1]
    rollCount++

    if (rollCount >= maxRolls) {
      clearInterval(rollInterval)
      diceElement.classList.remove("rolling")
      movePlayer(diceValue)
      isRolling = false
      rollButton.disabled = false
    }
  }, 100)
}

// Move player function
function movePlayer(spaces) {
  const newPosition = (position + spaces) % boardSpaces.length
  position = newPosition

  // Update board
  createGameBoard()

  // Scroll to current position
  scrollToCurrentPosition()

  // Handle landing on different space types
  const currentSpace = boardSpaces[newPosition]
  setEventMessage(`You landed on ${currentSpace.name}!`)

  switch (currentSpace.type) {
    case "property":
      const ownedPropertyIndex = properties.findIndex((p) => p.id === newPosition)
      if (ownedPropertyIndex !== -1) {
        // Collect rent if you own the property
        const ownedProperty = properties[ownedPropertyIndex]
        const baseRent = currentSpace.rent
        const houseMultiplier = ownedProperty.houses > 0 ? ownedProperty.houses * 0.5 + 1 : 1
        const rent = Math.floor(baseRent * houseMultiplier)

        money += rent
        setEventMessage(`You collected $${rent} rent from your ${currentSpace.name}!`)
        updateStats()
      } else {
        // Option to buy property
        showEventDialog({
          title: `Buy ${currentSpace.name}?`,
          description: `This property costs $${currentSpace.price} and generates $${currentSpace.rent} in rent.`,
          options: [
            {
              text: `Buy for $${currentSpace.price}`,
              primary: true,
              effect: () => {
                if (money >= currentSpace.price) {
                  money -= currentSpace.price
                  properties.push({ id: newPosition, houses: 0 })
                  happiness = Math.min(100, happiness + 10)
                  updateStats()
                  updatePropertiesDisplay()
                } else {
                  setEventMessage("You don't have enough money!")
                }
              },
            },
            {
              text: "Pass",
              primary: false,
              effect: () => {
                /* No effect */
              },
            },
          ],
        })
      }
      break

    case "event":
      // Random life event
      const randomEvent = lifeEvents[Math.floor(Math.random() * lifeEvents.length)]
      showEventDialog(randomEvent)
      break

    case "tax":
      // Pay taxes
      money = Math.max(0, money - currentSpace.amount)
      setEventMessage(`You paid $${currentSpace.amount} in taxes!`)
      updateStats()
      break

    case "career":
      // Career advancement
      career += 15
      money += 150
      setEventMessage("You got a promotion and a bonus!")
      updateStats()
      break

    case "hospital":
      // Hospital visit
      money = Math.max(0, money - currentSpace.cost)
      health = Math.min(100, health + 30)
      setEventMessage(`You paid $${currentSpace.cost} for healthcare and recovered some health!`)
      updateStats()
      break

    case "lottery":
      // Lottery chance
      const winAmount = Math.floor(Math.random() * 500) + 100
      const win = Math.random() > 0.7
      if (win) {
        money += winAmount
        setEventMessage(`You won $${winAmount} in the lottery!`)
      } else {
        setEventMessage("No luck with the lottery this time.")
      }
      updateStats()
      break

    case "special":
      // Passing start
      money += 200
      setEventMessage("You collected $200 for passing Start!")
      updateStats()
      break
  }

  // Check game over conditions
  checkGameStatus()
}

// Scroll to current position
function scrollToCurrentPosition() {
  const spaceElements = document.querySelectorAll("[data-space-id]")
  const currentSpaceElement = spaceElements[position]

  if (currentSpaceElement && boardContainer) {
    const containerWidth = boardContainer.offsetWidth
    const scrollPosition =
      currentSpaceElement.getBoundingClientRect().left +
      boardContainer.scrollLeft -
      containerWidth / 2 +
      currentSpaceElement.offsetWidth / 2

    boardContainer.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    })
  }
}

// Show event dialog
function showEventDialog(event) {
  eventTitle.textContent = event.title
  eventDescription.textContent = event.description

  // Clear previous options
  eventOptions.innerHTML = ""

  // Add options
  event.options.forEach((option, index) => {
    const optionButton = document.createElement("button")
    optionButton.className = `dialog-option ${index === 0 ? "primary" : "secondary"}`
    optionButton.textContent = option.text
    optionButton.addEventListener("click", () => {
      option.effect()
      hideEventDialog()
      checkGameStatus()
    })

    eventOptions.appendChild(optionButton)
  })

  // Show dialog
  eventDialog.style.display = "flex"
}

// Hide event dialog
function hideEventDialog() {
  eventDialog.style.display = "none"
}

// Update properties display
function updatePropertiesDisplay() {
  if (properties.length > 0) {
    propertiesSection.style.display = "block"
    propertiesGrid.innerHTML = ""

    properties.forEach((property) => {
      const space = boardSpaces[property.id]

      if (space.type === "property") {
        const houseCost = Math.floor(space.price * 0.5)

        const propertyCard = document.createElement("div")
        propertyCard.className = "property-card"

        const colorBar = document.createElement("div")
        colorBar.className = "property-color-bar"
        colorBar.style.backgroundColor = space.color

        const content = document.createElement("div")
        content.className = "property-content"

        const info = document.createElement("div")
        info.className = "property-info"

        const name = document.createElement("div")
        name.className = "property-name"
        name.textContent = space.name

        const houses = document.createElement("div")
        houses.className = "property-houses"

        for (let i = 0; i < property.houses; i++) {
          const houseIcon = document.createElement("span")
          houseIcon.className = "property-house"
          houseIcon.textContent = "🏠"
          houses.appendChild(houseIcon)
        }

        info.appendChild(name)
        info.appendChild(houses)

        content.appendChild(info)

        if (property.houses < 4) {
          const buildButton = document.createElement("button")
          buildButton.className = "build-button"
          buildButton.textContent = `+🏠 $${houseCost}`
          buildButton.addEventListener("click", () => buildHouse(property.id))

          content.appendChild(buildButton)
        }

        propertyCard.appendChild(colorBar)
        propertyCard.appendChild(content)

        propertiesGrid.appendChild(propertyCard)
      }
    })
  } else {
    propertiesSection.style.display = "none"
  }
}

// Build house on property
function buildHouse(propertyId) {
  if (gameOver) return

  const propertyIndex = properties.findIndex((p) => p.id === propertyId)
  if (propertyIndex === -1) return

  const property = properties[propertyIndex]
  const space = boardSpaces[propertyId]
  const houseCost = Math.floor(space.price * 0.5)

  if (money >= houseCost) {
    money -= houseCost
    properties[propertyIndex].houses = Math.min(property.houses + 1, 4)

    setEventMessage(`You built a house on ${space.name}!`)
    updateStats()
    updatePropertiesDisplay()
    createGameBoard()
  } else {
    setEventMessage(`You need $${houseCost} to build a house here.`)
  }
}

// Check if game should end
function checkGameStatus() {
  if (money <= 0 || health <= 0) {
    gameOver = true
    setEventMessage(money <= 0 ? "Game Over! You're bankrupt!" : "Game Over! Your health reached zero!")
    rollButton.disabled = true
    newGameButton.style.display = "block"
  }
}

// Reset game
function resetGame() {
  position = 0
  money = 1500
  happiness = 50
  health = 100
  career = 0
  properties = []
  diceValue = 1
  isRolling = false
  gameOver = false

  setEventMessage("Welcome to MonoLife! Roll the dice to start your journey.")
  createGameBoard()
  updateStats()
  updatePropertiesDisplay()

  rollButton.disabled = false
  newGameButton.style.display = "none"
}

// Initialize the game when the page loads
document.addEventListener("DOMContentLoaded", initGame)
