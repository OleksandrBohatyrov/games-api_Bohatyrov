const vue = Vue.createApp({
    data() {
        return {
            gameInModal: {name: '', price: 0},
            newGame: {name: '', price: 0}, // Empty object for the new game
            games: [],
            gameInfoModalInstance: null,
            newGameModalInstance: null // For handling the new modal instance
        }
    },
    async created() {
        this.fetchGames(); // Load games on creation
    },
    methods: {
        // Fetch games from the server
        fetchGames: async function() {
            const response = await fetch('http://localhost:8080/games');
            this.games = await response.json();
        },

        // Fetch game details for modal
        getGame: async function(id) {
            const response = await fetch(`http://localhost:8080/games/${id}`);
            this.gameInModal = await response.json();
            this.gameInfoModalInstance = new bootstrap.Modal(document.getElementById('gameInfoModal'), {});
            this.gameInfoModalInstance.show();
        },

        // Open the modal for editing a game
        editGame: async function(id) {
            const response = await fetch(`http://localhost:8080/games/${id}`);
            this.gameInModal = await response.json();
            this.gameInfoModalInstance = new bootstrap.Modal(document.getElementById('gameInfoModal'), {});
            this.gameInfoModalInstance.show();
        },

        // Update the edited game
        updateGame: async function(id) {
            const updatedGame = {
                name: this.gameInModal.name,
                price: this.gameInModal.price
            };

            const response = await fetch(`http://localhost:8080/games/${id}`, {
                method: 'PUT',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(updatedGame)
            });

            if (response.ok) {
                this.fetchGames(); // Refresh the game list
                this.closeModal(); // Close the modal after updating
            } else {
                alert('Error updating game');
            }
        },

        // Insert the new game
        insertNewGame: async function() {
            const newGame = {
                name: this.newGame.name,
                price: this.newGame.price
            };

            const response = await fetch('http://localhost:8080/games', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(newGame)
            });

            if (response.ok) {
                const addedGame = await response.json();
                this.games.push(addedGame); // Add the new game to the table
                this.closeModal(); // Close the modal after insertion
            } else {
                alert('Error inserting game');
            }
        },

        // Delete the selected game
        async deleteGame(id) {
            if (confirm('Are you sure you want to delete this game?')) {
                try {
                    const response = await fetch(`http://localhost:8080/games/${id}`, {
                        method: 'DELETE'
                    });

                    if (response.ok) {
                        this.fetchGames(); // Refresh the game list after deletion
                    } else {
                        alert('Error deleting game');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error occurred while deleting the game.');
                }
            }
        },

        // Close the modal
        closeModal() {
            if (this.gameInfoModalInstance) {
                this.gameInfoModalInstance.hide();
            }
            if (this.newGameModalInstance) {
                this.newGameModalInstance.hide();
            }
        },

        // Open the new modal for inserting a game and reset the values
        openNewGameModal() {
            this.newGame = {name: '', price: 0}; // Reset new game data
            this.newGameModalInstance = new bootstrap.Modal(document.getElementById('newGameModal'), {});
            this.newGameModalInstance.show();
        }
    }
}).mount('#app');
