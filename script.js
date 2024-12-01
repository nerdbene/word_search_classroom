// 📏 Grid sizes for every appetite - from tiny snacks to feast-sized puzzles!
const GRID_SIZES = {
    tiny: 8,      // For when you're on a word diet
    small: 10,    // A light word snack
    medium: 15,   // The Goldilocks size - just right!
    large: 20,    // For serious word hunters
    huge: 25      // Warning: May cause extreme word satisfaction
};

class WordSearch {
    constructor() {
        // 🎮 Game settings - where the magic begins!
        this.words = [];          // Our word collection, empty but full of potential
        this.grid = [];           // The matrix where words play hide and seek
        this.size = GRID_SIZES.medium;  // Starting with the "just right" size
        this.allowDiagonal = true;      // Let words get fancy with their angles
        this.allowBackwards = true;     // Because sometimes backwards is the way forward!
        
        this.initializeElements();
        this.setupEventListeners();
    }
    
    // 🎯 Grabbing all our DOM elements like Pokemon
    initializeElements() {
        this.newWordInput = document.getElementById('newWord');
        this.addWordButton = document.getElementById('addWord');
        this.wordsListElement = document.getElementById('wordsList');
        this.generateButton = document.getElementById('generateButton');
        this.downloadButton = document.getElementById('downloadButton');
        this.puzzleElement = document.getElementById('puzzle');
        this.wordListElement = document.getElementById('wordList');
        this.gridSizeSelect = document.getElementById('gridSize');
        this.allowDiagonalCheckbox = document.getElementById('allowDiagonal');
        this.allowBackwardsCheckbox = document.getElementById('allowBackwards');
    }
    
    // 🎪 Setting up our event circus - where all the action happens!
    setupEventListeners() {
        this.addWordButton.addEventListener('click', () => this.addWord());
        this.newWordInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addWord();
        });
        this.generateButton.addEventListener('click', () => this.generatePuzzle());
        this.downloadButton.addEventListener('click', () => this.downloadPuzzle());
        
        this.gridSizeSelect.addEventListener('change', (e) => {
            this.size = GRID_SIZES[e.target.value];
        });
        
        this.allowDiagonalCheckbox.addEventListener('change', (e) => {
            this.allowDiagonal = e.target.checked;
        });
        
        this.allowBackwardsCheckbox.addEventListener('change', (e) => {
            this.allowBackwards = e.target.checked;
        });
    }
    
    // 📝 Adding words to our collection - like collecting rare stamps, but cooler
    addWord() {
        const word = this.newWordInput.value.trim().toUpperCase();
        if (!word) return;
        
        if (this.words.length >= 16) {
            alert('Maximum 16 words allowed!');
            return;
        }
        
        if (this.words.includes(word)) {
            alert('This word is already in the list!');
            return;
        }
        
        if (word.length > Math.min(this.size, 15)) {
            alert(`Word is too long! Maximum length is ${Math.min(this.size, 15)} characters.`);
            return;
        }
        
        this.words.push(word);
        this.updateWordsList();
        this.newWordInput.value = '';
        this.downloadButton.disabled = true;
    }
    
    // 🗑️ Word removal service - we promise they won't feel a thing
    removeWord(word) {
        this.words = this.words.filter(w => w !== word);
        this.updateWordsList();
        this.downloadButton.disabled = true;
    }
    
    // 📋 Keeping our word list fresh and fancy
    updateWordsList() {
        this.wordsListElement.innerHTML = '';
        this.words.forEach(word => {
            const wordElement = document.createElement('div');
            wordElement.className = 'word-item';
            wordElement.innerHTML = `
                ${word}
                <button onclick="wordSearch.removeWord('${word}')">×</button>
            `;
            this.wordsListElement.appendChild(wordElement);
        });
        
        const wordCount = document.querySelector('.word-count');
        wordCount.textContent = `${this.words.length}/16 words`;
    }
    
    // 🎲 The grand puzzle generation show - where words become ninjas
    generatePuzzle() {
        if (this.words.length === 0) {
            alert('Hey there! Add some words first - empty puzzles are no fun! 😉');
            return;
        }
        
        // 🎭 Setting up our empty stage
        this.grid = Array(this.size).fill().map(() => Array(this.size).fill(''));
        const directions = this.getAllowedDirections();
        
        // 📏 Sort words by length - big words get first dibs!
        const sortedWords = [...this.words].sort((a, b) => b.length - a.length);
        
        // 🎪 Time to make our words do acrobatics
        let success = true;
        for (const word of sortedWords) {
            if (!this.placeWord(word, directions)) {
                success = false;
                break;
            }
        }
        
        if (!success) {
            alert('Oops! These words are being a bit stubborn. Try fewer words or a bigger grid! 🎯');
            return;
        }
        
        // 🎨 Fill in the blanks with random letter confetti!
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (!this.grid[i][j]) {
                    this.grid[i][j] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
                }
            }
        }
        
        this.renderPuzzle();
        this.downloadButton.disabled = false;
    }
    
    // 🧭 Getting our compass directions - which way should words go?
    getAllowedDirections() {
        const directions = [
            [0, 1],  // right
            [1, 0],  // down
        ];
        
        if (this.allowDiagonal) {
            directions.push(
                [1, 1],   // diagonal down-right
                [1, -1],  // diagonal down-left
            );
        }
        
        return directions;
    }
    
    // 🎯 The great word placement attempt - may the odds be ever in our favor!
    placeWord(word, directions) {
        const attempts = 100;
        const originalWord = word;
        
        for (let attempt = 0; attempt < attempts; attempt++) {
            const direction = directions[Math.floor(Math.random() * directions.length)];
            word = this.allowBackwards && Math.random() < 0.5 ? originalWord.split('').reverse().join('') : originalWord;
            
            const startX = Math.floor(Math.random() * this.size);
            const startY = Math.floor(Math.random() * this.size);
            
            if (this.canPlaceWord(word, startX, startY, direction)) {
                this.placeWordAt(word, startX, startY, direction);
                return true;
            }
        }
        
        return false;
    }
    
    // 🔍 The space inspector - making sure words have room to stretch
    canPlaceWord(word, startX, startY, [dx, dy]) {
        const length = word.length;
        
        // Check if word fits within grid bounds
        if (startX + dx * (length - 1) < 0 || startX + dx * (length - 1) >= this.size ||
            startY + dy * (length - 1) < 0 || startY + dy * (length - 1) >= this.size) {
            return false;
        }
        
        // Check if path is clear or has matching letters
        for (let i = 0; i < length; i++) {
            const x = startX + dx * i;
            const y = startY + dy * i;
            const currentLetter = this.grid[x][y];
            
            if (currentLetter && currentLetter !== word[i]) {
                return false;
            }
        }
        
        return true;
    }
    
    // 📦 Placing words in their new homes
    placeWordAt(word, startX, startY, [dx, dy]) {
        for (let i = 0; i < word.length; i++) {
            const x = startX + dx * i;
            const y = startY + dy * i;
            this.grid[x][y] = word[i];
        }
    }
    
    // 🎨 Rendering our puzzle masterpiece
    renderPuzzle() {
        // Clear previous puzzle
        this.puzzleElement.innerHTML = '';
        this.wordListElement.innerHTML = '';
        
        // Set grid template
        this.puzzleElement.style.gridTemplateColumns = `repeat(${this.size}, 1fr)`;
        
        // Create puzzle cells
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const cell = document.createElement('div');
                cell.className = 'puzzle-cell';
                cell.textContent = this.grid[i][j];
                this.puzzleElement.appendChild(cell);
            }
        }
        
        // Create word list
        this.words.forEach(word => {
            const wordElement = document.createElement('div');
            wordElement.textContent = word;
            this.wordListElement.appendChild(wordElement);
        });
    }
    
    // 📸 Downloading our puzzle as an image
    async downloadPuzzle() {
        // Wait for fonts to load
        await document.fonts.ready;
        
        // Create a temporary canvas
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const padding = 40;
        const cellSize = this.size > 20 ? 20 : 30; // Smaller cells for huge grids
        const wordListPadding = 20;
        
        // Calculate dimensions
        const puzzleWidth = this.size * cellSize;
        const puzzleHeight = this.size * cellSize;
        const wordListWidth = Math.ceil(this.words.length / 3) * 150;
        
        canvas.width = Math.max(puzzleWidth + padding * 2, wordListWidth + padding * 2);
        canvas.height = puzzleHeight + padding * 2 + 60;
        
        // Set background
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Draw puzzle grid
        ctx.beginPath();
        ctx.strokeStyle = '#ccc';
        
        const gridStartX = (canvas.width - puzzleWidth) / 2;
        
        // Draw grid lines
        for (let i = 0; i <= this.size; i++) {
            // Vertical lines
            ctx.moveTo(gridStartX + i * cellSize, padding);
            ctx.lineTo(gridStartX + i * cellSize, padding + puzzleHeight);
            // Horizontal lines
            ctx.moveTo(gridStartX, padding + i * cellSize);
            ctx.lineTo(gridStartX + puzzleWidth, padding + i * cellSize);
        }
        ctx.stroke();
        
        // Draw letters with system monospace font as fallback
        const fontSize = Math.floor(cellSize * 0.6);
        ctx.font = `${fontSize}px monospace`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = 'black';
        
        // Draw letters with thicker lines for better visibility
        ctx.lineWidth = 1;
        
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                const letter = this.grid[i][j];
                const x = gridStartX + j * cellSize + cellSize / 2;
                const y = padding + i * cellSize + cellSize / 2;
                
                // Draw the letter multiple times with slight offsets for bold effect
                ctx.fillText(letter, x, y);
                ctx.fillText(letter, x + 0.5, y);
                ctx.fillText(letter, x, y + 0.5);
                ctx.fillText(letter, x + 0.5, y + 0.5);
            }
        }
        
        // Draw word list below the puzzle
        ctx.font = '16px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillStyle = 'black';
        
        const wordsPerRow = 3;
        const wordSpacing = Math.min(150, canvas.width / 3 - 20);
        
        this.words.forEach((word, index) => {
            const row = Math.floor(index / wordsPerRow);
            const col = index % wordsPerRow;
            ctx.fillText(
                word,
                padding + col * wordSpacing,
                padding + puzzleHeight + 40 + row * 25
            );
        });
        
        // Convert to PNG and download
        const link = document.createElement('a');
        link.download = 'word-search-puzzle.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
    }
}

// Initialize the word search
const wordSearch = new WordSearch();
