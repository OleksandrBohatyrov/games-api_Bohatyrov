const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const Game = require('./models/game'); // Импорт модели игры

const app = express();
app.use(express.json()); // Middleware для работы с JSON

// Подключение к MongoDB Atlas
const uri = 'mongodb+srv://oleksandrbohatyrov:oleksandrbohatyrov@cluster0.crul0.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0'
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log('Connected to MongoDB Atlas'))
    .catch((error) => console.error('Error connecting to MongoDB Atlas:', error));

// Обслуживание статических файлов
app.use(express.static(path.join(__dirname, 'public')));

// Маршрут для получения списка игр
app.get('/games', async (req, res) => {
    try {
        const games = await Game.find();
        res.json(games);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Маршрут для добавления новой игры
app.post('/games', async (req, res) => {
    try {
        const lastGame = await Game.findOne().sort({ id: -1 });
        const newId = lastGame ? lastGame.id + 1 : 1;

        const game = new Game({
            id: newId,
            name: req.body.name,
            price: req.body.price
        });

        const newGame = await game.save();
        res.status(201).json(newGame);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Маршрут для обновления игры
app.put('/games/:id', async (req, res) => {
    try {
        const game = await Game.findOne({ id: req.params.id });
        if (!game) return res.status(404).json({ message: 'Game not found' });

        game.name = req.body.name || game.name;
        game.price = req.body.price || game.price;

        const updatedGame = await game.save();
        res.json(updatedGame);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Маршрут для удаления игры
app.delete('/games/:id', async (req, res) => {
    try {
        const game = await Game.findOne({ id: req.params.id });
        if (!game) return res.status(404).json({ message: 'Game not found' });

        await game.remove();
        res.json({ message: 'Game deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Запуск сервера
const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
