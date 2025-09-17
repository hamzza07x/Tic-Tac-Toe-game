class TicTacToe {
    constructor() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameMode = 'single';
        this.difficulty = 'medium';
        this.gameActive = true;
        this.stats = {
            winsX: 0,
            winsO: 0,
            draws: 0
        };
        this.winningCombos = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
            [0, 4, 8], [2, 4, 6] // diagonals
        ];
        
        this.loadStats();
        this.initializeGame();
        this.bindEvents();
    }
    
    initializeGame() {
        this.board = Array(9).fill('');
        this.currentPlayer = 'X';
        this.gameActive = true;
        this.updateDisplay();
        this.updatePlayerTurn();
        $('.cell').removeClass('winning x o').text('');
        $('#gameStatus').text('');
    }
    
    bindEvents() {
        $('.cell').on('click', (e) => this.handleCellClick(e));
        $('#resetBtn').on('click', () => this.initializeGame());
        $('#clearStatsBtn').on('click', () => this.clearStats());
        
        $('.mode-btn').on('click', (e) => {
            const mode = $(e.target).data('mode');
            this.setGameMode(mode);
        });
        
        $('.difficulty-btn').on('click', (e) => {
            const difficulty = $(e.target).data('difficulty');
            this.setDifficulty(difficulty);
        });
    }
    
    handleCellClick(e) {
        const index = $(e.target).data('index');
        
        if (!this.gameActive || this.board[index] !== '') return;
        
        this.makeMove(index, this.currentPlayer);
        
        if (this.gameMode === 'single' && this.gameActive && this.currentPlayer === 'O') {
            setTimeout(() => this.makeAIMove(), 500);
        }
    }
    
    makeMove(index, player) {
        this.board[index] = player;
        const cell = $(`.cell[data-index="${index}"]`);
        cell.text(player).addClass(player.toLowerCase());
        
        if (this.checkWinner()) {
            this.endGame(`Player ${player} wins!`);
            this.stats[`wins${player}`]++;
            this.highlightWinningCells();
        } else if (this.board.every(cell => cell !== '')) {
            this.endGame("It's a draw!");
            this.stats.draws++;
        } else {
            this.currentPlayer = this.currentPlayer === 'X' ? 'O' : 'X';
            this.updatePlayerTurn();
        }
        
        this.saveStats();
        this.updateDisplay();
    }
    
    makeAIMove() {
        if (!this.gameActive) return;
        
        let move;
        switch (this.difficulty) {
            case 'easy':
                move = this.getRandomMove();
                break;
            case 'medium':
                move = Math.random() < 0.7 ? this.getBestMove() : this.getRandomMove();
                break;
            case 'hard':
                move = this.getBestMove();
                break;
        }
        
        if (move !== -1) {
            this.makeMove(move, 'O');
        }
    }
    
    getRandomMove() {
        const availableMoves = this.board
            .map((cell, index) => cell === '' ? index : null)
            .filter(val => val !== null);
        
        return availableMoves.length > 0 
            ? availableMoves[Math.floor(Math.random() * availableMoves.length)]
            : -1;
    }
    
    getBestMove() {
        // Check for winning move
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'O';
                if (this.checkWinner()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Check for blocking move
        for (let i = 0; i < 9; i++) {
            if (this.board[i] === '') {
                this.board[i] = 'X';
                if (this.checkWinner()) {
                    this.board[i] = '';
                    return i;
                }
                this.board[i] = '';
            }
        }
        
        // Take center if available
        if (this.board[4] === '') return 4;
        
        // Take corners
        const corners = [0, 2, 6, 8];
        const availableCorners = corners.filter(i => this.board[i] === '');
        if (availableCorners.length > 0) {
            return availableCorners[Math.floor(Math.random() * availableCorners.length)];
        }
        
        // Take any available move
        return this.getRandomMove();
    }
    
    checkWinner() {
        return this.winningCombos.some(combo => {
            const [a, b, c] = combo;
            return this.board[a] && 
                   this.board[a] === this.board[b] && 
                   this.board[a] === this.board[c];
        });
    }
    
    highlightWinningCells() {
        this.winningCombos.forEach(combo => {
            const [a, b, c] = combo;
            if (this.board[a] && 
                this.board[a] === this.board[b] && 
                this.board[a] === this.board[c]) {
                combo.forEach(index => {
                    $(`.cell[data-index="${index}"]`).addClass('winning');
                });
            }
        });
    }
    
    endGame(message) {
        this.gameActive = false;
        $('#gameStatus').text(message);
        $('#playerTurn').text('Game Over');
    }
    
    updatePlayerTurn() {
        if (!this.gameActive) return;
        
        if (this.gameMode === 'single') {
            $('#playerTurn').text(this.currentPlayer === 'X' ? "Your Turn" : "AI's Turn");
        } else {
            $('#playerTurn').text(`Player ${this.currentPlayer}'s Turn`);
        }
    }
    
    setGameMode(mode) {
        this.gameMode = mode;
        $('.mode-btn').removeClass('game-mode-active');
        $(`.mode-btn[data-mode="${mode}"]`).addClass('game-mode-active');
        
        if (mode === 'single') {
            $('#difficultySection').show();
        } else {
            $('#difficultySection').hide();
        }
        
        this.initializeGame();
    }
    
    setDifficulty(difficulty) {
        this.difficulty = difficulty;
        $('.difficulty-btn').removeClass('difficulty-active');
        $(`.difficulty-btn[data-difficulty="${difficulty}"]`).addClass('difficulty-active');
        this.initializeGame();
    }
    
    updateDisplay() {
        $('#winsX').text(this.stats.winsX);
        $('#winsO').text(this.stats.winsO);
        $('#draws').text(this.stats.draws);
    }
    
    saveStats() {
        const statsData = JSON.stringify(this.stats);
        // Note: localStorage is not available in Claude.ai artifacts
        // In a real environment, you would use: localStorage.setItem('ticTacToeStats', statsData);
    }
    
    loadStats() {
        // Note: localStorage is not available in Claude.ai artifacts
        // In a real environment, you would use:
        // const savedStats = localStorage.getItem('ticTacToeStats');
        // if (savedStats) {
        //     this.stats = JSON.parse(savedStats);
        // }
    }
    
    clearStats() {
        this.stats = { winsX: 0, winsO: 0, draws: 0 };
        this.updateDisplay();
        this.saveStats();
    }
}

// Initialize the game when the document is ready
$(document).ready(() => {
    new TicTacToe();
});