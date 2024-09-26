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
            // Close the current modal
            if (this.gameInfoModalInstance) {
                this.gameInfoModalInstance.hide();
            }

            // Reset the new game object
            this.newGame = {name: '', price: 0};

            // Show the new modal
            this.newGameModalInstance = new bootstrap.Modal(document.getElementById('newGameModal'), {});
            this.newGameModalInstance.show();
        },

        // Insert the new game
        insertNewGame: async function() {
            // Prepare the game data
            const newGame = {
                name: this.newGame.name,
                price: this.newGame.price
            };

            // Make a POST request to insert the new game
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
                        // After successful deletion, refetch the games
                        this.fetchGames();
                    } else {
                        alert('Error deleting game');
                    }
                } catch (error) {
                    console.error('Error:', error);
                    alert('Error occurred while deleting the game.');
                }
            }
        }
    }
}).mount('#app');
