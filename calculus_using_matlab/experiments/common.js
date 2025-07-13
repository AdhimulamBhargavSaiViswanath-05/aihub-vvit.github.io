// Common JavaScript functionality for experiment pages

// Global variables - use window globals instead of local variables
let drawing = false;
let ctx;
let penColor = '#000000';
let isFullscreen = false;
let searchResults = [];
let currentSearchIndex = -1;

function resizeCanvas() {
  const drawCanvas = document.getElementById('draw-canvas');
  if (drawCanvas) {
    drawCanvas.width = window.innerWidth;
    drawCanvas.height = window.innerHeight;
  }
}

function getTouchPos(canvas, e) {
  const rect = canvas.getBoundingClientRect();
  const touch = e.touches[0] || e.changedTouches[0];
  return {
    x: touch.clientX - rect.left,
    y: touch.clientY - rect.top
  };
}

// Fullscreen functionality
function initFullscreen() {
  const fullscreenBtn = document.getElementById('fullscreen-btn');
  if (fullscreenBtn) {
    fullscreenBtn.onclick = () => {
      if (!isFullscreen) {
        if (document.documentElement.requestFullscreen) {
          document.documentElement.requestFullscreen();
        } else if (document.documentElement.webkitRequestFullscreen) {
          document.documentElement.webkitRequestFullscreen();
        }
        isFullscreen = true;
        fullscreenBtn.innerHTML = '⤓ Exit Fullscreen';
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
          document.webkitExitFullscreen();
        }
        isFullscreen = false;
        fullscreenBtn.innerHTML = '⤢ Fullscreen';
      }
    };
  }
}

// Search functionality
function initSearch() {
  const searchInput = document.getElementById('search-input');
  const searchBtn = document.getElementById('search-btn');
  const nextResultBtn = document.getElementById('next-result');
  const prevResultBtn = document.getElementById('prev-result');

  if (searchInput) {
    searchInput.addEventListener('input', performSearch);
    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        if (e.shiftKey) {
          findPrevious();
        } else {
          findNext();
        }
      }
    });
  }

  if (searchBtn) {
    searchBtn.onclick = performSearch;
  }

  if (nextResultBtn) {
    nextResultBtn.onclick = findNext;
  }

  if (prevResultBtn) {
    prevResultBtn.onclick = findPrevious;
  }
}

function performSearch() {
  const searchInput = document.getElementById('search-input');
  const searchTerm = searchInput.value.toLowerCase();
  
  if (!searchTerm) {
    clearSearchHighlights();
    return;
  }

  searchResults = [];
  currentSearchIndex = -1;

  // Search in code blocks
  const codeBlocks = document.querySelectorAll('.code-box');
  codeBlocks.forEach((block, blockIndex) => {
    const text = block.textContent;
    const matches = [...text.matchAll(new RegExp(searchTerm, 'gi'))];
    matches.forEach(match => {
      searchResults.push({
        type: 'code',
        blockIndex,
        index: match.index,
        length: match[0].length
      });
    });
  });

  // Search in explanations
  const explanations = document.querySelectorAll('.slide li');
  explanations.forEach((item, itemIndex) => {
    const text = item.textContent;
    const matches = [...text.matchAll(new RegExp(searchTerm, 'gi'))];
    matches.forEach(match => {
      searchResults.push({
        type: 'explanation',
        itemIndex,
        index: match.index,
        length: match[0].length
      });
    });
  });

  if (searchResults.length > 0) {
    currentSearchIndex = 0;
    highlightSearchResult();
    updateSearchStatus();
  } else {
    showNoResultsMessage();
  }
}

function highlightSearchResult() {
  clearSearchHighlights();
  
  if (currentSearchIndex >= 0 && currentSearchIndex < searchResults.length) {
    const result = searchResults[currentSearchIndex];
    
    if (result.type === 'code') {
      const codeBlocks = document.querySelectorAll('.code-box');
      const block = codeBlocks[result.blockIndex];
      if (block) {
        const text = block.textContent;
        const before = text.substring(0, result.index);
        const match = text.substring(result.index, result.index + result.length);
        const after = text.substring(result.index + result.length);
        
        block.innerHTML = `${before}<mark class="search-highlight">${match}</mark>${after}`;
        block.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else if (result.type === 'explanation') {
      const explanations = document.querySelectorAll('.slide li');
      const item = explanations[result.itemIndex];
      if (item) {
        const text = item.textContent;
        const before = text.substring(0, result.index);
        const match = text.substring(result.index, result.index + result.length);
        const after = text.substring(result.index + result.length);
        
        item.innerHTML = `${before}<mark class="search-highlight">${match}</mark>${after}`;
        item.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }
}

function clearSearchHighlights() {
  document.querySelectorAll('.search-highlight').forEach(el => {
    const parent = el.parentNode;
    parent.replaceChild(document.createTextNode(el.textContent), el);
    parent.normalize();
  });
}

function findNext() {
  if (searchResults.length > 0) {
    currentSearchIndex = (currentSearchIndex + 1) % searchResults.length;
    highlightSearchResult();
    updateSearchStatus();
  }
}

function findPrevious() {
  if (searchResults.length > 0) {
    currentSearchIndex = currentSearchIndex <= 0 ? searchResults.length - 1 : currentSearchIndex - 1;
    highlightSearchResult();
    updateSearchStatus();
  }
}

function updateSearchStatus() {
  const status = document.getElementById('search-status');
  if (status) {
    status.textContent = `${currentSearchIndex + 1} of ${searchResults.length} results`;
  }
}

function showNoResultsMessage() {
  const status = document.getElementById('search-status');
  if (status) {
    status.textContent = 'No results found';
  }
}

// Progress tracking
function initProgressTracking() {
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    updateProgress();
  }
}

function updateProgress() {
  const progressBar = document.getElementById('progress-bar');
  if (progressBar && window.slidesData) {
    const progress = ((window.currentSlide + 1) / window.slidesData.length) * 100;
    progressBar.style.width = `${progress}%`;
    progressBar.setAttribute('aria-valuenow', progress);
  }
}

// Auto-save functionality
function initAutoSave() {
  // Save current slide to localStorage
  setInterval(() => {
    if (window.currentSlide !== undefined) {
      localStorage.setItem('experiment-progress', JSON.stringify({
        experimentId: getCurrentExperimentId(),
        currentSlide: window.currentSlide,
        timestamp: Date.now()
      }));
    }
  }, 5000); // Auto-save every 5 seconds
}

function getCurrentExperimentId() {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get('exp') || 'exp1';
}

function restoreProgress() {
  const saved = localStorage.getItem('experiment-progress');
  if (saved) {
    const data = JSON.parse(saved);
    if (data.experimentId === getCurrentExperimentId() && data.currentSlide !== undefined) {
      window.currentSlide = data.currentSlide;
      if (window.updateSlide) {
        window.updateSlide();
        renderSlideButtons();
        updateProgress();
      }
    }
  }
}

// Accessibility features
function initAccessibility() {
  // Add ARIA labels
  const codeBlock = document.getElementById('code-block');
  if (codeBlock) {
    codeBlock.setAttribute('aria-label', 'MATLAB code for current experiment step');
  }

  // Add keyboard navigation hints
  const keyboardHint = document.querySelector('.keyboard-hint');
  if (keyboardHint) {
    keyboardHint.innerHTML = `
      <strong>Keyboard Navigation:</strong><br>
      ← → Arrow keys: Navigate slides<br>
      F: Toggle fullscreen<br>
      Ctrl+F: Search<br>
      S: Save drawing<br>
      C: Clear drawing
    `;
  }
}

// Initialize drawing functionality
function initDrawing() {
  const drawBtn = document.getElementById('draw-btn');
  const drawCanvas = document.getElementById('draw-canvas');
  const drawControls = document.getElementById('draw-controls');
  const clearBtn = document.getElementById('clear-btn');
  const closeDrawBtn = document.getElementById('close-draw-btn');
  const saveBtn = document.getElementById('save-btn');

if (drawBtn && drawCanvas && drawControls) {
    console.log('Initializing drawing functionality...');
    
    drawBtn.onclick = () => {
      console.log('Draw button clicked');
      drawCanvas.style.display = 'block';
      drawControls.style.display = 'block';
      resizeCanvas();
      ctx = drawCanvas.getContext('2d');
      ctx.strokeStyle = penColor;
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    };
    
    window.addEventListener('resize', resizeCanvas);
  
    // Mouse events for desktop
    drawCanvas.addEventListener('mousedown', (e) => {
      drawing = true;
      ctx.beginPath();
      ctx.moveTo(e.clientX, e.clientY);
      ctx.strokeStyle = penColor;
    });
    drawCanvas.addEventListener('mousemove', (e) => {
      if (!drawing) return;
      ctx.lineTo(e.clientX, e.clientY);
      ctx.strokeStyle = penColor;
      ctx.stroke();
    });
    drawCanvas.addEventListener('mouseup', () => {
      drawing = false;
    });
    drawCanvas.addEventListener('mouseleave', () => {
      drawing = false;
    });

    // Touch events for mobile
    drawCanvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      drawing = true;
      const pos = getTouchPos(drawCanvas, e);
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
      ctx.strokeStyle = penColor;
    });
    drawCanvas.addEventListener('touchmove', (e) => {
      e.preventDefault();
      if (!drawing) return;
      const pos = getTouchPos(drawCanvas, e);
      ctx.lineTo(pos.x, pos.y);
      ctx.strokeStyle = penColor;
      ctx.stroke();
    });
    drawCanvas.addEventListener('touchend', (e) => {
      e.preventDefault();
      drawing = false;
    });

    clearBtn.onclick = () => {
      ctx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    };
    closeDrawBtn.onclick = () => {
      drawCanvas.style.display = 'none';
      drawControls.style.display = 'none';
    };
    saveBtn.onclick = () => {
      // Hide controls to avoid capturing them
      drawControls.style.visibility = 'hidden';
      html2canvas(document.body, { scale: 0.5 }).then(canvas => {
        drawControls.style.visibility = 'visible';
        const link = document.createElement('a');
        link.download = 'page_with_drawing.png';
        link.href = canvas.toDataURL('image/png');
        link.click();
      });
    };
  } else {
    console.log('Drawing elements not found:', { drawBtn, drawCanvas, drawControls });
  }
}

// Pen color selector logic
function initColorPicker() {
  const colorBtns = document.querySelectorAll('.color-btn');
  console.log('Found color buttons:', colorBtns.length);
  
  colorBtns.forEach(btn => {
    btn.onclick = function() {
      penColor = this.getAttribute('data-color');
      // Optionally, visually indicate selected color
      document.querySelectorAll('.color-btn').forEach(b => b.style.borderColor = '#ccc');
      this.style.borderColor = '#bfa032';
    };
  });
}

// Slide navigation functionality - use global variables
function initSlideNavigation() {
  const prevBtn = document.getElementById('prev-slide');
  const nextBtn = document.getElementById('next-slide');
  
  console.log('Navigation buttons found:', { prevBtn, nextBtn });
  
  if (prevBtn) {
    prevBtn.addEventListener('click', () => {
      console.log('Prev button clicked, current slide:', window.currentSlide);
      if (window.currentSlide > 0) {
        window.currentSlide--;
        if (window.updateSlide) {
          window.updateSlide();
          renderSlideButtons();
          updateProgress();
        }
      }
    });
  }
  
  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      console.log('Next button clicked, current slide:', window.currentSlide);
      if (window.currentSlide < window.slidesData.length - 1) {
        window.currentSlide++;
        if (window.updateSlide) {
          window.updateSlide();
          renderSlideButtons();
          updateProgress();
        }
      }
    });
  }
}

// Enhanced keyboard navigation
function initKeyboardNavigation() {
  document.addEventListener('keydown', (e) => {
    const drawCanvas = document.getElementById('draw-canvas');
    
    // Only handle keys when not in drawing mode
    if (!drawCanvas || drawCanvas.style.display === 'none') {
      switch(e.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          e.preventDefault();
          console.log('Left arrow pressed, current slide:', window.currentSlide);
          if (window.currentSlide > 0) {
            window.currentSlide--;
            if (window.updateSlide) {
              window.updateSlide();
              renderSlideButtons();
              updateProgress();
            }
          }
          break;
          
        case 'ArrowRight':
        case 'ArrowDown':
          e.preventDefault();
          console.log('Right arrow pressed, current slide:', window.currentSlide);
          if (window.currentSlide < window.slidesData.length - 1) {
            window.currentSlide++;
            if (window.updateSlide) {
              window.updateSlide();
              renderSlideButtons();
              updateProgress();
            }
          }
          break;
          
        case 'f':
        case 'F':
          e.preventDefault();
          const fullscreenBtn = document.getElementById('fullscreen-btn');
          if (fullscreenBtn) fullscreenBtn.click();
          break;
          
        case 's':
        case 'S':
          e.preventDefault();
          const saveBtn = document.getElementById('save-btn');
          if (saveBtn) saveBtn.click();
          break;
          
        case 'c':
        case 'C':
          e.preventDefault();
          const clearBtn = document.getElementById('clear-btn');
          if (clearBtn) clearBtn.click();
          break;
      }
    }
    
    // Search functionality
    if (e.ctrlKey && e.key === 'f') {
      e.preventDefault();
      const searchInput = document.getElementById('search-input');
      if (searchInput) {
        searchInput.focus();
        searchInput.select();
      }
    }
  });
}

// Numbered slide buttons - use global variables
function renderSlideButtons() {
  const btnContainer = document.getElementById('slide-buttons');
  if (!btnContainer || !window.slidesData) {
    console.log('Cannot render slide buttons:', { btnContainer, slidesData: window.slidesData });
    return;
  }
  
  console.log('Rendering slide buttons for', window.slidesData.length, 'slides');
  
  btnContainer.innerHTML = "";
  for (let i = 0; i < window.slidesData.length; i++) {
    const btn = document.createElement('button');
    btn.textContent = i + 1;
    btn.className = 'btn btn-sm ' + (i === window.currentSlide ? 'btn-primary' : 'btn-outline-primary');
    btn.style.minWidth = '36px';
    btn.setAttribute('aria-label', `Go to slide ${i + 1}`);
    btn.onclick = () => {
      console.log('Slide button clicked:', i);
      window.currentSlide = i;
      if (window.updateSlide) {
        window.updateSlide();
        renderSlideButtons();
        updateProgress();
      }
    };
    btnContainer.appendChild(btn);
  }
}

// Initialize all functionality
function initCommonFunctionality() {
  console.log('Initializing common functionality...');
  
  // Ensure global variables are initialized
  window.currentSlide = window.currentSlide || 0;
  window.slidesData = window.slidesData || [];
  
  console.log('Global variables:', { 
    currentSlide: window.currentSlide, 
    slidesDataLength: window.slidesData.length,
    updateSlide: !!window.updateSlide 
  });
  
  initDrawing();
  initColorPicker();
  initSlideNavigation();
  initKeyboardNavigation();
  initFullscreen();
  initSearch();
  initProgressTracking();
  initAutoSave();
  initAccessibility();
  renderSlideButtons();
  
  // Restore progress after a short delay
  setTimeout(restoreProgress, 500);
}

// Export functions for use in individual experiment pages
window.experimentCommon = {
  updateSlide: window.updateSlide,
  renderSlideButtons,
  currentSlide: window.currentSlide,
  slidesData: window.slidesData || [],
  performSearch,
  findNext,
  findPrevious,
  updateProgress
};

// Initialize when DOM is loaded, but wait a bit to ensure experiment-specific code has run
document.addEventListener('DOMContentLoaded', () => {
  // Wait a bit to ensure experiment-specific code has set up globals
  setTimeout(initCommonFunctionality, 100);
});