// DOM Elements
const elements = {
    resumeUpload: document.getElementById('resume-upload'),
    jobDescription: document.getElementById('job-description'),
    analyzeButton: document.getElementById('analyze-resume'),
    exportButton: document.getElementById('export-feedback'),
    darkModeToggle: document.getElementById('dark-mode-toggle'),
    feedbackSummary: document.getElementById('feedback-summary'),
    progressContainer: document.getElementById('progress-bar-container'),
    progressBar: document.getElementById('progress-bar'),
    resultsArea: document.getElementById('analysis-results'),
    resultsList: document.getElementById('results-list'),
    suggestionsArea: document.getElementById('suggestions'),
    suggestionsList: document.getElementById('suggestions-list'),
    dropArea: document.getElementById('drop-area')
};

// State Management
let lastAnalysis = null;

// File Handling
function handleFileSelection(file) {
    if (!file) return false;
    
    const validTypes = ['.txt', '.doc', '.docx', '.pdf'];
    const isValid = validTypes.some(type => file.name.toLowerCase().endsWith(type));
    
    if (!isValid) {
        alert('Please upload a valid file type (.txt, .doc, .docx, or .pdf)');
        return false;
    }
    
    return true;
}

// Resume Analysis
function analyzeResume() {
    const file = elements.resumeUpload.files[0];
    const keywords = elements.jobDescription.value.trim();

    if (!file || !keywords) {
        alert('Please upload a resume and enter keywords');
        return;
    }

    if (!handleFileSelection(file)) return;

    const reader = new FileReader();
    
    reader.onload = function(e) {
        const resumeText = e.target.result.toLowerCase();
        const keywordList = keywords
            .split(',')
            .map(keyword => keyword.trim().toLowerCase())
            .filter(keyword => keyword.length > 0);

        if (keywordList.length === 0) {
            alert('Please enter valid keywords');
            return;
        }

        const analysis = performAnalysis(resumeText, keywordList);
        updateUI(analysis);
        lastAnalysis = analysis;
    };

    reader.onerror = function() {
        alert('Error reading file. Please try again.');
    };

    reader.readAsText(file);
}

function performAnalysis(resumeText, keywords) {
    const matches = [];
    const missing = [];

    keywords.forEach(keyword => {
        const regex = new RegExp(`\\b${keyword}\\b`, 'gi');
        if (regex.test(resumeText)) {
            matches.push(keyword);
        } else {
            missing.push(keyword);
        }
    });

    const score = Math.round((matches.length / keywords.length) * 100);

    return { matches, missing, score };
}

// UI Updates
function updateUI(analysis) {
    const { matches, missing, score } = analysis;

    // Update score and feedback
    elements.feedbackSummary.textContent = `Match Score: ${score}% - ${getQualityLabel(score)}`;
    elements.progressBar.style.width = `${score}%`;

    // Update matched keywords
    elements.resultsList.innerHTML = matches
        .map(keyword => `<li>✓ ${keyword}</li>`)
        .join('');

    // Update missing keywords
    elements.suggestionsList.innerHTML = missing
        .map(keyword => `<li>+ ${keyword}</li>`)
        .join('');

    // Show all results
    showElements([
        elements.feedbackSummary,
        elements.progressContainer,
        elements.resultsArea,
        elements.suggestionsArea,
        elements.exportButton
    ]);
}

function getQualityLabel(score) {
    if (score >= 80) return 'Excellent';
    if (score >= 50) return 'Good';
    return 'Needs Improvement';
}

function showElements(elementList) {
    elementList.forEach(element => element.classList.remove('hidden'));
}

// Dark Mode
function initializeDarkMode() {
    const darkModePreference = localStorage.getItem('darkMode') === 'enabled';
    document.body.classList.toggle('dark-mode', darkModePreference);
    elements.darkModeToggle.textContent = darkModePreference ? '☀️' : '🌙';
}

function toggleDarkMode() {
    const isDarkMode = document.body.classList.toggle('dark-mode');
    elements.darkModeToggle.textContent = isDarkMode ? '☀️' : '🌙';
    localStorage.setItem('darkMode', isDarkMode ? 'enabled' : 'disabled');
}

// Export Functionality
function exportAnalysis() {
    if (!lastAnalysis) return;

    const { matches, missing, score } = lastAnalysis;
    const feedback = generateFeedbackText(matches, missing, score);
    
    downloadFeedback(feedback);
}

function generateFeedbackText(matches, missing, score) {
    return `Resume Analysis Report
${new Date().toLocaleString()}

Overall Score: ${score}%
Quality: ${getQualityLabel(score)}

Matched Keywords:
${matches.map(k => `✓ ${k}`).join('\n')}

Missing Keywords:
${missing.map(k => `+ ${k}`).join('\n')}`;
}

function downloadFeedback(feedback) {
    const blob = new Blob([feedback], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `resume-analysis-${new Date().toISOString().slice(0,10)}.txt`;
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

// Drag and Drop Handlers
function handleDragOver(e) {
    e.preventDefault();
    elements.dropArea.classList.add('drag-over');
}

function handleDragLeave() {
    elements.dropArea.classList.remove('drag-over');
}

function handleDrop(e) {
    e.preventDefault();
    elements.dropArea.classList.remove('drag-over');
    
    const file = e.dataTransfer.files[0];
    if (handleFileSelection(file)) {
        elements.resumeUpload.files = e.dataTransfer.files;
    }
}

// Event Listeners
function initializeEventListeners() {
    elements.analyzeButton.addEventListener('click', analyzeResume);
    elements.exportButton.addEventListener('click', exportAnalysis);
    elements.darkModeToggle.addEventListener('click', toggleDarkMode);
    
    elements.dropArea.addEventListener('dragover', handleDragOver);
    elements.dropArea.addEventListener('dragleave', handleDragLeave);
    elements.dropArea.addEventListener('drop', handleDrop);
}

// Initialize Application
function initialize() {
    initializeDarkMode();
    initializeEventListeners();
}

// Start the application
initialize();