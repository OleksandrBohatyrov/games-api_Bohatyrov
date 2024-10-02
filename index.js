const express = require('express')
const cors = require('cors')
const fs = require('fs')
const swaggerUi = require('swagger-ui-express')
const yamljs = require('yamljs')
const swaggerDocument = yamljs.load('./docs/swagger.yaml')
const app = express()
const port = 8080

app.use(cors())
app.use(express.json())

let games = []

// Функция для загрузки игр из файла
function loadGames() {
    if (fs.existsSync('games.json')) {
        const data = fs.readFileSync('games.json', 'utf8')
        games = JSON.parse(data)
    } else {
        games = [] // Если файл не существует, начинаем с пустого массива
    }
}
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument))

// Функция для сохранения игр в файл
function saveGames() {
    fs.writeFileSync('games.json', JSON.stringify(games, null, 2))
}

// Загружаем игры при старте сервера
loadGames()

// Get list of games
app.get('/games', (req, res) => {
    res.send(games)
})

// Get details of a game by id
app.get('/games/:id', (req, res) => {
    const game = games.find(game => game.id === parseInt(req.params.id))
    if (!game) return res.status(404).send({error: "Game not found"})
    res.send(game)
})

// Add new game
app.post('/games', (req, res) => {
    if (!req.body.name || req.body.price === undefined) {
        return res.status(400).send({error: 'One or all params are missing'})
    }

    const newGame = {
        id: games.length + 1,
        name: req.body.name,
        price: parseFloat(req.body.price)
    }

    games.push(newGame)
    saveGames() // Сохраняем изменения в файл
    res.status(201).send(newGame)
})


// Update game by id
app.put('/games/:id', (req, res) => {
    const gameIndex = games.findIndex(game => game.id === parseInt(req.params.id))
    if (gameIndex === -1) return res.status(404).send({error: "Game not found"})

    games[gameIndex].name = req.body.name
    games[gameIndex].price = parseFloat(req.body.price)
    saveGames() // Сохраняем изменения в файл
    res.send(games[gameIndex])
})

// Delete game by id and update ids
app.delete('/games/:id', (req, res) => {
    const gameIndex = games.findIndex(game => game.id === parseInt(req.params.id))
    if (gameIndex === -1) return res.status(404).send({error: "Game not found"})

    games.splice(gameIndex, 1)

    // Update ids after deletion
    games = games.map((game, index) => ({ ...game, id: index + 1 }))
    saveGames() // Сохраняем изменения в файл

    res.status(204).send()
})

app.listen(port, () => {
    console.log(`API up at: http://localhost:${port}`)
})
