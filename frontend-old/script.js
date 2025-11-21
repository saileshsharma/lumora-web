// API Configuration - Auto-detect environment
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'  // Development
    : 'https://ai-outfit-assistant-production.up.railway.app/api';  // Production - Railway backend

// Global state
let currentMode = 'rater';
let raterImageData = null;
let generatorImageData = null;
let generatedImageData = null;
let lastGeneratorParams = null;
let currentRaterOccasion = null;
let currentGeneratorOccasion = null;
let currentRaterSuggestions = null;

// Helper function to generate shopping URLs
function generateShoppingButtons(itemName) {
    const searchTerm = encodeURIComponent(itemName);

    const amazonUrl = `https://www.amazon.com/s?k=${searchTerm}`;
    const shopeeUrl = `https://shopee.sg/search?keyword=${searchTerm}`;
    const lazadaUrl = `https://www.lazada.sg/catalog/?q=${searchTerm}`;

    return `
        <div class="shopping-buttons">
            <a href="${amazonUrl}" target="_blank" rel="noopener noreferrer" class="btn-shop btn-amazon">
                Amazon
            </a>
            <a href="${shopeeUrl}" target="_blank" rel="noopener noreferrer" class="btn-shop btn-shopee">
                Shopee
            </a>
            <a href="${lazadaUrl}" target="_blank" rel="noopener noreferrer" class="btn-shop btn-lazada">
                Lazada
            </a>
        </div>
    `;
}

// Initialize app
document.addEventListener('DOMContentLoaded', function () {
    initializeModeSwitch();
    initializeRaterMode();
    initializeGeneratorMode();
});

// Mode Switching
function initializeModeSwitch() {
    const modeButtons = document.querySelectorAll('.mode-btn');

    modeButtons.forEach(btn => {
        btn.addEventListener('click', function () {
            const mode = this.getAttribute('data-mode');
            switchMode(mode);
        });
    });
}

function switchMode(mode) {
    currentMode = mode;

    // Update buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-mode') === mode) {
            btn.classList.add('active');
        }
    });

    // Update content
    document.querySelectorAll('.mode-content').forEach(content => {
        content.classList.remove('active');
    });

    if (mode === 'rater') {
        document.getElementById('rater-mode').classList.add('active');
    } else {
        document.getElementById('generator-mode').classList.add('active');
    }
}

// Rater Mode Initialization
function initializeRaterMode() {
    const uploadArea = document.getElementById('rater-upload');
    const fileInput = document.getElementById('rater-file-input');
    const preview = document.getElementById('rater-preview');
    const form = document.getElementById('rater-form');
    const occasionSelect = document.getElementById('rater-occasion');
    const customOccasion = document.getElementById('rater-custom-occasion');

    // Upload area click
    uploadArea.addEventListener('click', () => fileInput.click());

    // File input change
    fileInput.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
            handleRaterImageUpload(e.target.files[0]);
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#667eea';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#e0e0e0';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#e0e0e0';

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleRaterImageUpload(e.dataTransfer.files[0]);
        }
    });

    // Occasion select
    occasionSelect.addEventListener('change', function () {
        if (this.value === 'custom') {
            customOccasion.style.display = 'block';
            customOccasion.required = true;
        } else {
            customOccasion.style.display = 'none';
            customOccasion.required = false;
        }
    });

    // Form submission
    form.addEventListener('submit', handleRaterSubmit);
}

function handleRaterImageUpload(file) {
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        raterImageData = e.target.result;

        const preview = document.getElementById('rater-preview');
        const uploadArea = document.getElementById('rater-upload');

        preview.src = raterImageData;
        preview.style.display = 'block';
        uploadArea.classList.add('has-image');
        uploadArea.querySelector('.upload-prompt').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

async function handleRaterSubmit(e) {
    e.preventDefault();

    if (!raterImageData) {
        alert('Please upload an outfit photo');
        return;
    }

    const occasionSelect = document.getElementById('rater-occasion');
    const customOccasion = document.getElementById('rater-custom-occasion');
    const currency = document.getElementById('rater-currency').value;
    const budget = document.getElementById('rater-budget').value;

    let occasion = occasionSelect.value;
    if (occasion === 'custom') {
        occasion = customOccasion.value;
    }

    // Save occasion for later use
    currentRaterOccasion = occasion;

    const budgetText = budget ? `${currency} ${budget}` : '';

    // Show loading
    document.getElementById('rater-form').style.display = 'none';
    document.getElementById('rater-loading').style.display = 'block';

    try {
        const response = await fetch(`${API_BASE_URL}/rate-outfit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                image: raterImageData,
                occasion: occasion,
                budget: budgetText
            })
        });

        const result = await response.json();

        if (result.success) {
            displayRaterResults(JSON.parse(result.data));
        } else {
            throw new Error(result.error || 'Failed to rate outfit');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message + '\n\nPlease make sure:\n1. The Flask backend is running\n2. Your OpenAI API key is configured in the .env file');
        document.getElementById('rater-form').style.display = 'block';
    } finally {
        document.getElementById('rater-loading').style.display = 'none';
    }
}

function displayRaterResults(data) {
    // Display user's photo
    if (raterImageData) {
        document.getElementById('rater-result-photo').src = raterImageData;
    }

    // Display scores
    document.getElementById('wow-score').textContent = data.wow_factor + '/10';
    document.getElementById('wow-explanation').textContent = data.wow_factor_explanation;

    document.getElementById('fitness-score').textContent = data.occasion_fitness + '/10';
    document.getElementById('fitness-explanation').textContent = data.occasion_fitness_explanation;

    document.getElementById('overall-score').textContent = data.overall_rating + '/10';
    document.getElementById('overall-explanation').textContent = data.overall_explanation;

    // Display strengths
    const strengthsList = document.getElementById('strengths-list');
    strengthsList.innerHTML = '';
    data.strengths.forEach(strength => {
        const li = document.createElement('li');
        li.textContent = strength;
        strengthsList.appendChild(li);
    });

    // Display improvements
    const improvementsList = document.getElementById('improvements-list');
    improvementsList.innerHTML = '';
    data.improvements.forEach(improvement => {
        const li = document.createElement('li');
        li.textContent = improvement;
        improvementsList.appendChild(li);
    });

    // Display suggestions
    const suggestionsList = document.getElementById('suggestions-list');
    suggestionsList.innerHTML = '';
    data.suggestions.forEach(suggestion => {
        const li = document.createElement('li');
        li.textContent = suggestion;
        suggestionsList.appendChild(li);
    });

    // Display shopping recommendations
    const shoppingGrid = document.getElementById('shopping-grid');
    shoppingGrid.innerHTML = '';
    data.shopping_recommendations.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'shopping-item';
        itemDiv.innerHTML = `
            <h5>${item.item}</h5>
            <div class="item-description">${item.description}</div>
            <div class="item-price">${item.price}</div>
            <div class="item-reason">${item.reason}</div>
            ${generateShoppingButtons(item.item)}
        `;
        shoppingGrid.appendChild(itemDiv);
    });

    // Display roast (if available)
    if (data.roast) {
        document.getElementById('roast-text').textContent = data.roast;
        document.getElementById('roast-section').style.display = 'flex';
        // Reset roast button and content visibility
        document.getElementById('roast-reveal-btn').style.display = 'block';
        document.getElementById('roast-content').style.display = 'none';
    }

    // Save suggestions for later use in outfit generation
    currentRaterSuggestions = {
        improvements: data.improvements || [],
        suggestions: data.suggestions || []
    };

    // Show results
    document.getElementById('rater-results').style.display = 'block';

    // Scroll to results
    document.getElementById('rater-results').scrollIntoView({ behavior: 'smooth' });
}

function resetRater() {
    // Reset form
    document.getElementById('rater-form').reset();
    document.getElementById('rater-form').style.display = 'block';

    // Reset image
    raterImageData = null;
    document.getElementById('rater-preview').style.display = 'none';
    document.getElementById('rater-upload').classList.remove('has-image');
    document.getElementById('rater-upload').querySelector('.upload-prompt').style.display = 'block';

    // Hide results
    document.getElementById('rater-results').style.display = 'none';

    // Hide roast section
    document.getElementById('roast-section').style.display = 'none';

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

async function generateFromRaterRecommendations() {
    console.log('Generate Improved Outfit clicked');
    console.log('Has image data:', !!raterImageData);
    console.log('Current occasion:', currentRaterOccasion);
    console.log('Current suggestions:', currentRaterSuggestions);

    // Check if we have the necessary data
    if (!raterImageData) {
        alert('No image data available. Please rate an outfit first.');
        return;
    }

    if (!currentRaterOccasion) {
        alert('No occasion data available. Please rate an outfit first.');
        return;
    }

    // Build conditions from AI suggestions and improvements
    let conditions = '';
    if (currentRaterSuggestions) {
        const allSuggestions = [
            ...currentRaterSuggestions.improvements,
            ...currentRaterSuggestions.suggestions
        ];
        conditions = allSuggestions.join(', ');
    }
    console.log('Conditions for generation:', conditions);

    // Prepare parameters for outfit generation
    const params = {
        user_image: raterImageData,
        wow_factor: 7, // Default to higher wow factor for improved outfit
        brands: [],
        budget: 'SGD 200-500', // Default budget
        occasion: currentRaterOccasion,
        conditions: conditions
    };

    // Save parameters for potential regeneration
    lastGeneratorParams = params;

    // Switch to generator mode and show loading
    console.log('Switching to generator mode and calling API...');
    switchMode('generator');
    document.getElementById('generator-form').style.display = 'none';
    document.getElementById('generator-results').style.display = 'none';
    document.getElementById('generator-loading').style.display = 'block';

    try {
        console.log('Calling API:', `${API_BASE_URL}/generate-outfit`);
        const response = await fetch(`${API_BASE_URL}/generate-outfit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(params)
        });

        const result = await response.json();
        console.log('API response:', result);

        if (result.success) {
            displayGeneratorResults(result);
        } else {
            throw new Error(result.error || 'Failed to generate outfit');
        }
    } catch (error) {
        console.error('Error generating outfit:', error);
        alert('Error: ' + error.message + '\n\nPlease try again or use the Outfit Generator manually.');
        document.getElementById('generator-form').style.display = 'block';
    } finally {
        document.getElementById('generator-loading').style.display = 'none';
    }
}

function revealRoast() {
    // Hide the button
    document.getElementById('roast-reveal-btn').style.display = 'none';

    // Show the roast content with animation
    const roastContent = document.getElementById('roast-content');
    roastContent.style.display = 'block';

    // Smooth scroll to roast section
    roastContent.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// Generator Mode Initialization
function initializeGeneratorMode() {
    const uploadArea = document.getElementById('generator-upload');
    const fileInput = document.getElementById('generator-file-input');
    const preview = document.getElementById('generator-preview');
    const form = document.getElementById('generator-form');
    const wowSlider = document.getElementById('wow-slider');
    const occasionSelect = document.getElementById('generator-occasion');
    const customOccasion = document.getElementById('generator-custom-occasion');

    // Upload area click
    uploadArea.addEventListener('click', () => fileInput.click());

    // File input change
    fileInput.addEventListener('change', function (e) {
        if (e.target.files && e.target.files[0]) {
            handleGeneratorImageUpload(e.target.files[0]);
        }
    });

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#667eea';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#e0e0e0';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.style.borderColor = '#e0e0e0';

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleGeneratorImageUpload(e.dataTransfer.files[0]);
        }
    });

    // Wow factor slider
    wowSlider.addEventListener('input', function () {
        const value = parseInt(this.value);
        document.getElementById('wow-value').textContent = value;

        let label;
        if (value <= 3) {
            label = 'Classic & Safe';
        } else if (value <= 6) {
            label = 'Balanced & Stylish';
        } else {
            label = 'Bold & Creative';
        }
        document.getElementById('wow-label').textContent = label;
    });

    // Occasion select
    occasionSelect.addEventListener('change', function () {
        if (this.value === 'custom') {
            customOccasion.style.display = 'block';
            customOccasion.required = true;
        } else {
            customOccasion.style.display = 'none';
            customOccasion.required = false;
        }
    });

    // Form submission
    form.addEventListener('submit', handleGeneratorSubmit);
}

function handleGeneratorImageUpload(file) {
    // Check file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        generatorImageData = e.target.result;

        const preview = document.getElementById('generator-preview');
        const uploadArea = document.getElementById('generator-upload');

        preview.src = generatorImageData;
        preview.style.display = 'block';
        uploadArea.classList.add('has-image');
        uploadArea.querySelector('.upload-prompt').style.display = 'none';
    };
    reader.readAsDataURL(file);
}

async function handleGeneratorSubmit(e) {
    e.preventDefault();

    const wowFactor = parseInt(document.getElementById('wow-slider').value);
    const brandsInput = document.getElementById('brands').value;
    const brands = brandsInput ? brandsInput.split(',').map(b => b.trim()).slice(0, 5) : [];
    const currency = document.getElementById('generator-currency').value;
    const budget = document.getElementById('generator-budget').value;
    const occasionSelect = document.getElementById('generator-occasion');
    const customOccasion = document.getElementById('generator-custom-occasion');
    const conditions = document.getElementById('conditions').value;

    let occasion = occasionSelect.value;
    if (occasion === 'custom') {
        occasion = customOccasion.value;
    }

    const budgetText = `${currency} ${budget}`;

    // Save parameters for regeneration
    lastGeneratorParams = {
        user_image: generatorImageData,
        wow_factor: wowFactor,
        brands: brands,
        budget: budgetText,
        occasion: occasion,
        conditions: conditions
    };

    // Show loading
    document.getElementById('generator-form').style.display = 'none';
    document.getElementById('generator-loading').style.display = 'block';

    try {
        const response = await fetch(`${API_BASE_URL}/generate-outfit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(lastGeneratorParams)
        });

        const result = await response.json();

        if (result.success) {
            displayGeneratorResults(result);
        } else {
            throw new Error(result.error || 'Failed to generate outfit');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message + '\n\nPlease make sure:\n1. The Flask backend is running\n2. Your OpenAI API key is configured in the .env file');
        document.getElementById('generator-form').style.display = 'block';
    } finally {
        document.getElementById('generator-loading').style.display = 'none';
    }
}

function displayGeneratorResults(result) {
    const data = JSON.parse(result.outfit_description);

    // Display generated image
    document.getElementById('generated-image').src = result.outfit_image_url;

    // Display outfit concept
    document.getElementById('outfit-concept').textContent = data.outfit_concept;

    // Display outfit items
    const itemsContainer = document.getElementById('outfit-items');
    itemsContainer.innerHTML = '';
    data.items.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'outfit-item';
        itemDiv.innerHTML = `
            <div class="item-type">${item.type}</div>
            <div class="item-description">${item.description}</div>
            <div class="item-color">Color: ${item.color}</div>
            <div class="item-notes">${item.style_notes}</div>
        `;
        itemsContainer.appendChild(itemDiv);
    });

    // Display color palette
    document.getElementById('color-palette').textContent = data.color_palette;

    // Display occasion notes
    document.getElementById('occasion-notes').textContent = data.occasion_notes;

    // Display shopping recommendations
    const shoppingGrid = document.getElementById('generator-shopping-grid');
    shoppingGrid.innerHTML = '';
    let totalCost = 0;

    data.product_recommendations.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'shopping-item';

        // Extract numeric price for total
        const priceMatch = item.price.match(/[\d,]+/);
        if (priceMatch) {
            totalCost += parseInt(priceMatch[0].replace(',', ''));
        }

        itemDiv.innerHTML = `
            <div class="item-type">${item.type}</div>
            <h5>${item.item}</h5>
            <div class="item-description">${item.description}</div>
            <div class="item-price">${item.price}</div>
            <div class="item-reason">${item.reason}</div>
            ${generateShoppingButtons(item.item)}
        `;
        shoppingGrid.appendChild(itemDiv);
    });

    // Display total cost
    const currency = lastGeneratorParams.budget.split(' ')[0];
    document.getElementById('total-cost').textContent = `${currency} ~${totalCost}`;

    // Show results
    document.getElementById('generator-results').style.display = 'block';

    // Scroll to results
    document.getElementById('generator-results').scrollIntoView({ behavior: 'smooth' });
}

async function regenerateOutfit() {
    if (!lastGeneratorParams) {
        alert('No previous parameters found');
        return;
    }

    // Hide results and show loading
    document.getElementById('generator-results').style.display = 'none';
    document.getElementById('generator-loading').style.display = 'block';

    try {
        const response = await fetch(`${API_BASE_URL}/generate-outfit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(lastGeneratorParams)
        });

        const result = await response.json();

        if (result.success) {
            displayGeneratorResults(result);
        } else {
            throw new Error(result.error || 'Failed to generate outfit');
        }
    } catch (error) {
        console.error('Error:', error);
        alert('Error: ' + error.message);
        document.getElementById('generator-results').style.display = 'block';
    } finally {
        document.getElementById('generator-loading').style.display = 'none';
    }
}

function resetGenerator() {
    // Reset form
    document.getElementById('generator-form').reset();
    document.getElementById('generator-form').style.display = 'block';

    // Reset slider
    document.getElementById('wow-slider').value = 5;
    document.getElementById('wow-value').textContent = '5';
    document.getElementById('wow-label').textContent = 'Balanced & Stylish';

    // Reset image
    generatorImageData = null;
    document.getElementById('generator-preview').style.display = 'none';
    document.getElementById('generator-upload').classList.remove('has-image');
    document.getElementById('generator-upload').querySelector('.upload-prompt').style.display = 'block';

    // Hide results
    document.getElementById('generator-results').style.display = 'none';

    // Clear saved params
    lastGeneratorParams = null;

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ============================================================================
// FASHION ARENA FUNCTIONS
// ============================================================================

// Initialize Fashion Arena Mode
document.addEventListener('DOMContentLoaded', function () {
    // Arena tab switching
    const arenaTabs = document.querySelectorAll('.arena-tab');
    arenaTabs.forEach(tab => {
        tab.addEventListener('click', function () {
            const tabName = this.getAttribute('data-tab');
            switchArenaTab(tabName);
        });
    });

    // Arena submission form
    const arenaForm = document.getElementById('arena-submit-form');
    if (arenaForm) {
        arenaForm.addEventListener('submit', handleArenaSubmit);
    }

    // Vote rating slider
    const voteRating = document.getElementById('vote-rating');
    if (voteRating) {
        voteRating.addEventListener('input', function () {
            document.getElementById('vote-rating-value').textContent = this.value;
        });
    }
});

// Update mode switching to include arena
function switchMode(mode) {
    currentMode = mode;

    // Update buttons
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-mode') === mode) {
            btn.classList.add('active');
        }
    });

    // Update content
    document.querySelectorAll('.mode-content').forEach(content => {
        content.classList.remove('active');
    });

    if (mode === 'rater') {
        document.getElementById('rater-mode').classList.add('active');
    } else if (mode === 'generator') {
        document.getElementById('generator-mode').classList.add('active');
    } else if (mode === 'arena') {
        document.getElementById('arena-mode').classList.add('active');
        // Load arena data when switching to arena mode
        loadArenaSubmissions();
    }
}

function switchArenaTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.arena-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.getAttribute('data-tab') === tabName) {
            tab.classList.add('active');
        }
    });

    // Update sections
    document.querySelectorAll('.arena-section').forEach(section => {
        section.classList.remove('active');
    });

    if (tabName === 'browse') {
        document.getElementById('arena-browse').classList.add('active');
        loadArenaSubmissions();
    } else if (tabName === 'leaderboard') {
        document.getElementById('arena-leaderboard').classList.add('active');
        loadLeaderboard();
    }
}

// Pagination state
let allSubmissions = [];
let currentPage = 1;
const ITEMS_PER_PAGE = 10; // Show 10 items per page

// Load Arena Submissions
async function loadArenaSubmissions() {
    const sortBy = document.getElementById('arena-sort').value;
    const grid = document.getElementById('arena-submissions-grid');

    grid.innerHTML = '<div class="loading-message">Loading submissions...</div>';

    // Reset to page 1
    currentPage = 1;

    try {
        const response = await fetch(`${API_BASE_URL}/arena/submissions?sort_by=${sortBy}`);
        const result = await response.json();

        if (result.success && result.submissions.length > 0) {
            allSubmissions = result.submissions;
            displayPage(currentPage);
        } else {
            grid.innerHTML = '<div class="empty-message">No submissions yet. Be the first to share your style! 🌟</div>';
        }
    } catch (error) {
        console.error('Error loading submissions:', error);
        grid.innerHTML = '<div class="error-message">Failed to load submissions. Please try again.</div>';
    }
}

// Display specific page of submissions
function displayPage(page) {
    const grid = document.getElementById('arena-submissions-grid');
    grid.innerHTML = '';

    // Calculate start and end indices
    const startIndex = (page - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const pageSubmissions = allSubmissions.slice(startIndex, endIndex);

    // Display submissions for this page
    pageSubmissions.forEach(submission => {
        const card = createSubmissionCard(submission);
        grid.appendChild(card);
    });

    // Add pagination controls
    addPaginationControls();

    // Scroll to top of grid
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Add pagination controls
function addPaginationControls() {
    const grid = document.getElementById('arena-submissions-grid');
    const totalPages = Math.ceil(allSubmissions.length / ITEMS_PER_PAGE);

    if (totalPages <= 1) {
        return; // No pagination needed
    }

    const paginationDiv = document.createElement('div');
    paginationDiv.className = 'pagination-controls';
    paginationDiv.id = 'pagination-controls';

    let html = '<div class="pagination-buttons">';

    // Previous button
    if (currentPage > 1) {
        html += `<button class="pagination-btn" onclick="goToPage(${currentPage - 1})">← Previous</button>`;
    }

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust start if we're near the end
    if (endPage - startPage < maxVisiblePages - 1) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page if not visible
    if (startPage > 1) {
        html += `<button class="pagination-btn" onclick="goToPage(1)">1</button>`;
        if (startPage > 2) {
            html += '<span class="pagination-dots">...</span>';
        }
    }

    // Page number buttons
    for (let i = startPage; i <= endPage; i++) {
        if (i === currentPage) {
            html += `<button class="pagination-btn active">${i}</button>`;
        } else {
            html += `<button class="pagination-btn" onclick="goToPage(${i})">${i}</button>`;
        }
    }

    // Last page if not visible
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            html += '<span class="pagination-dots">...</span>';
        }
        html += `<button class="pagination-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
    }

    // Next button
    if (currentPage < totalPages) {
        html += `<button class="pagination-btn" onclick="goToPage(${currentPage + 1})">Next →</button>`;
    }

    html += '</div>';
    html += `<div class="pagination-info">Page ${currentPage} of ${totalPages} (${allSubmissions.length} items)</div>`;

    paginationDiv.innerHTML = html;
    grid.appendChild(paginationDiv);
}

// Go to specific page
function goToPage(page) {
    currentPage = page;
    displayPage(page);
}

// Create a single submission card
function createSubmissionCard(submission) {
    const card = document.createElement('div');
    card.className = 'arena-card';

    const sourceIcon = submission.source_mode === 'rater' ? '⭐' : '🎨';
    const likes = submission.total_votes || 0;

    card.innerHTML = `
        <div class="arena-card-image" data-submission-id="${submission.id}">
            <img src="${submission.photo}" alt="${submission.title}">
            <div class="arena-card-badge">${sourceIcon} ${submission.source_mode}</div>
        </div>
        <div class="arena-card-content">
            <h4>${submission.title}</h4>
            <p class="arena-card-description">${submission.description || 'No description'}</p>
            <div class="arena-card-occasion">${submission.occasion}</div>
            <div class="arena-card-stats">
                <span class="like-button" data-submission-id="${submission.id}">
                    <span class="like-icon">👍</span>
                    <span class="like-count">${likes}</span>
                </span>
                <button class="delete-submission-btn" data-submission-id="${submission.id}" title="Delete submission">🗑️ Delete</button>
            </div>
        </div>
    `;

    // Add double-click handler to image with heart animation
    const imageContainer = card.querySelector('.arena-card-image');
    imageContainer.addEventListener('dblclick', function(e) {
        // Show heart animation
        showHeartAnimation(imageContainer);

        // Like the submission
        likeSubmission(submission.id);
    });

    // Add click handler to like button
    const likeButton = card.querySelector('.like-button');
    likeButton.addEventListener('click', function() {
        likeSubmission(submission.id);
    });

    // Add click handler to delete button
    const deleteButton = card.querySelector('.delete-submission-btn');
    deleteButton.addEventListener('click', function(e) {
        e.stopPropagation(); // Prevent triggering other events
        deleteSubmission(submission.id);
    });

    return card;
}


// Load Leaderboard
async function loadLeaderboard() {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '<div class="loading-message">Loading leaderboard...</div>';

    try {
        const response = await fetch(`${API_BASE_URL}/arena/leaderboard?limit=10`);
        const result = await response.json();

        if (result.success && result.leaderboard.length > 0) {
            displayLeaderboard(result.leaderboard);
        } else {
            list.innerHTML = '<div class="empty-message">No submissions yet. Be the first! 🏆</div>';
        }
    } catch (error) {
        console.error('Error loading leaderboard:', error);
        list.innerHTML = '<div class="error-message">Failed to load leaderboard. Please try again.</div>';
    }
}

function displayLeaderboard(leaderboard) {
    const list = document.getElementById('leaderboard-list');
    list.innerHTML = '';

    leaderboard.forEach((submission, index) => {
        const item = document.createElement('div');
        item.className = 'leaderboard-item';

        const rank = index + 1;
        let rankBadge = `<span class="rank">#${rank}</span>`;

        if (rank === 1) {
            rankBadge = '<span class="rank rank-gold">🥇 #1</span>';
        } else if (rank === 2) {
            rankBadge = '<span class="rank rank-silver">🥈 #2</span>';
        } else if (rank === 3) {
            rankBadge = '<span class="rank rank-bronze">🥉 #3</span>';
        }

        const likes = submission.total_votes || 0;

        item.innerHTML = `
            ${rankBadge}
            <div class="leaderboard-image">
                <img src="${submission.photo}" alt="${submission.title}">
            </div>
            <div class="leaderboard-details">
                <h4>${submission.title}</h4>
                <div class="leaderboard-stats">
                    <span class="like-button" data-submission-id="${submission.id}">
                        <span class="like-icon">👍</span>
                        <span class="like-count">${likes}</span>
                    </span>
                </div>
                <div class="leaderboard-occasion">${submission.occasion}</div>
            </div>
        `;

        // Add click handler to like button
        const likeButton = item.querySelector('.like-button');
        likeButton.addEventListener('click', function() {
            likeSubmission(submission.id);
        });

        list.appendChild(item);
    });
}

// Open Arena Submission Modal (from Rater or Generator)
function openArenaModal(photoData, occasion, sourceMode) {
    document.getElementById('arena-modal-preview').src = photoData;
    document.getElementById('arena-photo-data').value = photoData;
    document.getElementById('arena-occasion-data').value = occasion;
    document.getElementById('arena-source-mode').value = sourceMode;
    document.getElementById('arena-modal').style.display = 'flex';
}

function closeArenaModal() {
    document.getElementById('arena-modal').style.display = 'none';
    document.getElementById('arena-submit-form').reset();
}

// Handle Arena Submission
async function handleArenaSubmit(e) {
    e.preventDefault();

    const title = document.getElementById('arena-title').value;
    const description = document.getElementById('arena-description').value;
    const photo = document.getElementById('arena-photo-data').value;
    const occasion = document.getElementById('arena-occasion-data').value;
    const sourceMode = document.getElementById('arena-source-mode').value;

    try {
        const response = await fetch(`${API_BASE_URL}/arena/submit`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                photo: photo,
                title: title,
                description: description,
                occasion: occasion,
                source_mode: sourceMode,
                user_id: null // Can be extended to include user authentication
            })
        });

        const result = await response.json();

        if (result.success) {
            alert('🎉 Successfully submitted to Fashion Arena!');
            closeArenaModal();

            // Switch to arena mode to see the submission
            switchMode('arena');
        } else {
            throw new Error(result.error || 'Failed to submit');
        }
    } catch (error) {
        console.error('Error submitting to arena:', error);
        alert('Error: ' + error.message);
    }
}

// Show heart animation (Instagram-style)
function showHeartAnimation(container) {
    // Create heart element
    const heart = document.createElement('div');
    heart.className = 'heart-animation';
    heart.innerHTML = '❤️';

    // Add to container
    container.appendChild(heart);

    // Remove after animation completes
    setTimeout(() => {
        container.removeChild(heart);
    }, 800); // Match animation duration
}

// Like Submission (simplified voting)
async function likeSubmission(submissionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/arena/like`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                submission_id: submissionId
            })
        });

        const result = await response.json();

        if (result.success) {
            // Update the like count in the UI without reloading
            const likeButtons = document.querySelectorAll(`[data-submission-id="${submissionId}"]`);
            likeButtons.forEach(button => {
                const likeCountSpan = button.querySelector('.like-count');
                if (likeCountSpan) {
                    likeCountSpan.textContent = result.submission.total_votes;
                }
            });

            // Show a brief visual feedback
            likeButtons.forEach(button => {
                button.classList.add('liked');
                setTimeout(() => button.classList.remove('liked'), 300);
            });
        } else {
            throw new Error(result.error || 'Failed to like submission');
        }
    } catch (error) {
        console.error('Error liking submission:', error);
    }
}

// Delete Submission (password protected)
async function deleteSubmission(submissionId) {
    // Prompt for password
    const password = prompt('Contact the developer (names at the bottom) or enter password to delete this submission:');

    if (!password) {
        return; // User cancelled
    }

    if (password !== '182838') {
        alert('❌ Incorrect password. Deletion cancelled.');
        return;
    }

    // Confirm deletion
    if (!confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
        return;
    }

    try {
        const response = await fetch(`${API_BASE_URL}/arena/submission/${submissionId}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                password: password
            })
        });

        const result = await response.json();

        if (result.success) {
            alert('✅ Submission deleted successfully!');

            // Remove from allSubmissions array
            allSubmissions = allSubmissions.filter(sub => sub.id !== submissionId);

            // Refresh the current page display
            if (allSubmissions.length === 0) {
                // No submissions left
                const grid = document.getElementById('arena-submissions-grid');
                grid.innerHTML = '<div class="empty-message">No submissions yet. Be the first to share your style! 🌟</div>';
            } else {
                // Adjust current page if needed
                const totalPages = Math.ceil(allSubmissions.length / ITEMS_PER_PAGE);
                if (currentPage > totalPages) {
                    currentPage = totalPages;
                }
                displayPage(currentPage);
            }
        } else {
            throw new Error(result.error || 'Failed to delete submission');
        }
    } catch (error) {
        console.error('Error deleting submission:', error);
        alert('Error: ' + error.message);
    }
}

// Open Vote Modal
async function openVoteModal(submissionId) {
    try {
        const response = await fetch(`${API_BASE_URL}/arena/submission/${submissionId}`);
        const result = await response.json();

        if (result.success) {
            const submission = result.submission;

            document.getElementById('vote-modal-preview').src = submission.photo;
            document.getElementById('vote-modal-title').textContent = submission.title;
            document.getElementById('vote-modal-description').textContent = submission.description || 'No description';
            document.getElementById('vote-modal-votes').textContent = submission.total_votes;
            document.getElementById('vote-modal-rating').textContent = submission.average_rating.toFixed(1);
            document.getElementById('vote-modal-count').textContent = submission.vote_count;
            document.getElementById('vote-submission-id').value = submissionId;
            document.getElementById('vote-rating').value = 5;
            document.getElementById('vote-rating-value').textContent = '5';

            document.getElementById('vote-modal').style.display = 'flex';
        } else {
            throw new Error(result.error || 'Failed to load submission');
        }
    } catch (error) {
        console.error('Error loading submission:', error);
        alert('Error: ' + error.message);
    }
}

function closeVoteModal() {
    document.getElementById('vote-modal').style.display = 'none';
}

// Submit Vote
async function submitVote(voteType) {
    const submissionId = document.getElementById('vote-submission-id').value;
    const rating = parseInt(document.getElementById('vote-rating').value);

    try {
        const response = await fetch(`${API_BASE_URL}/arena/vote`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                submission_id: submissionId,
                vote_type: voteType,
                rating: rating,
                voter_id: null // Can be extended to include user authentication
            })
        });

        const result = await response.json();

        if (result.success) {
            alert('✅ Vote submitted successfully!');
            closeVoteModal();

            // Reload submissions to show updated stats
            loadArenaSubmissions();
        } else {
            throw new Error(result.error || 'Failed to submit vote');
        }
    } catch (error) {
        console.error('Error submitting vote:', error);
        alert('Error: ' + error.message);
    }
}

// Add "Submit to Arena" functionality to existing modes
function setupArenaButtonForRater() {
    const arenaSection = document.getElementById('rater-arena-section');
    const arenaButton = document.getElementById('rater-arena-btn');

    if (arenaSection && arenaButton) {
        arenaSection.style.display = 'block';
        arenaButton.onclick = function () {
            const occasionSelect = document.getElementById('rater-occasion');
            let occasion = occasionSelect.value;
            if (occasion === 'custom') {
                occasion = document.getElementById('rater-custom-occasion').value;
            }
            openArenaModal(raterImageData, occasion, 'rater');
        };
    }
}

function addArenaButtonToGenerator() {
    const resultsSection = document.getElementById('generator-results');

    // Check if button already exists
    if (document.getElementById('generator-arena-btn')) return;

    const arenaButton = document.createElement('button');
    arenaButton.id = 'generator-arena-btn';
    arenaButton.className = 'btn-primary';
    arenaButton.innerHTML = '<span class="btn-icon">🏆</span> Submit to Fashion Arena';
    arenaButton.onclick = function () {
        const generatedImage = document.getElementById('generated-image').src;
        openArenaModal(generatedImage, lastGeneratorParams.occasion, 'generator');
    };

    const actionButtons = resultsSection.querySelector('.action-buttons');
    actionButtons.insertBefore(arenaButton, actionButtons.firstChild);
}

// Modify existing display functions to add arena buttons
const originalDisplayRaterResults = displayRaterResults;
displayRaterResults = function (data) {
    originalDisplayRaterResults(data);
    setupArenaButtonForRater();
};

const originalDisplayGeneratorResults = displayGeneratorResults;
displayGeneratorResults = function (result) {
    originalDisplayGeneratorResults(result);
    addArenaButtonToGenerator();
};

// ============================================================================
// CAMERA FUNCTIONS
// ============================================================================

let cameraStream = null;
let currentCameraMode = null; // 'rater' or 'generator'

// Open camera modal
function openCamera(mode) {
    currentCameraMode = mode;
    const modal = document.getElementById('camera-modal');
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    const preview = document.getElementById('camera-preview');
    const captureBtn = document.getElementById('capture-btn');
    const retakeBtn = document.getElementById('retake-btn');
    const usePhotoBtn = document.getElementById('use-photo-btn');

    // Reset UI
    video.style.display = 'block';
    canvas.style.display = 'none';
    preview.style.display = 'none';
    captureBtn.style.display = 'inline-block';
    retakeBtn.style.display = 'none';
    usePhotoBtn.style.display = 'none';

    // Show modal
    modal.style.display = 'flex';

    // Start camera
    navigator.mediaDevices.getUserMedia({
        video: {
            facingMode: 'user',
            width: { ideal: 1280 },
            height: { ideal: 720 }
        }
    })
    .then(stream => {
        cameraStream = stream;
        video.srcObject = stream;
    })
    .catch(err => {
        console.error('Camera error:', err);
        alert('Unable to access camera. Please check permissions and try again.');
        closeCamera();
    });
}

// Close camera modal
function closeCamera() {
    // Stop camera stream
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }

    // Hide modal
    const modal = document.getElementById('camera-modal');
    modal.style.display = 'none';

    // Reset
    currentCameraMode = null;
}

// Capture photo from video
function capturePhoto() {
    const video = document.getElementById('camera-video');
    const canvas = document.getElementById('camera-canvas');
    const preview = document.getElementById('camera-preview');
    const captureBtn = document.getElementById('capture-btn');
    const retakeBtn = document.getElementById('retake-btn');
    const usePhotoBtn = document.getElementById('use-photo-btn');

    // Set canvas size to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // Draw video frame to canvas
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0);

    // Convert canvas to image
    const imageData = canvas.toDataURL('image/jpeg', 0.9);
    preview.src = imageData;

    // Update UI
    video.style.display = 'none';
    preview.style.display = 'block';
    captureBtn.style.display = 'none';
    retakeBtn.style.display = 'inline-block';
    usePhotoBtn.style.display = 'inline-block';
}

// Retake photo
function retakePhoto() {
    const video = document.getElementById('camera-video');
    const preview = document.getElementById('camera-preview');
    const captureBtn = document.getElementById('capture-btn');
    const retakeBtn = document.getElementById('retake-btn');
    const usePhotoBtn = document.getElementById('use-photo-btn');

    // Update UI
    video.style.display = 'block';
    preview.style.display = 'none';
    captureBtn.style.display = 'inline-block';
    retakeBtn.style.display = 'none';
    usePhotoBtn.style.display = 'none';
}

// Use captured photo
function usePhoto() {
    const preview = document.getElementById('camera-preview');
    const imageData = preview.src;

    if (currentCameraMode === 'rater') {
        // Set rater image
        raterImageData = imageData;
        const raterPreview = document.getElementById('rater-preview');
        const uploadArea = document.getElementById('rater-upload');
        raterPreview.src = imageData;
        raterPreview.style.display = 'block';
        uploadArea.classList.add('has-image');
        uploadArea.querySelector('.upload-prompt').style.display = 'none';
    } else if (currentCameraMode === 'generator') {
        // Set generator image
        generatorImageData = imageData;
        const generatorPreview = document.getElementById('generator-preview');
        const uploadArea = document.getElementById('generator-upload');
        generatorPreview.src = imageData;
        generatorPreview.style.display = 'block';
        uploadArea.classList.add('has-image');
        uploadArea.querySelector('.upload-prompt').style.display = 'none';
    }

    // Close camera
    closeCamera();
}
