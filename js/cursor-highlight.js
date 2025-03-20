// Create a cursor highlight effect that follows the mouse
document.addEventListener('DOMContentLoaded', () => {
    // Create cursor highlight element
    const cursorHighlight = document.createElement('div');
    cursorHighlight.classList.add('cursor-highlight');
    document.body.appendChild(cursorHighlight);
    
    // Mouse position
    let mouseX = 0;
    let mouseY = 0;
    
    // Current position (for smooth animation)
    let currentX = 0;
    let currentY = 0;
    
    // Flag to track if we're dragging the space background
    let isDraggingBackground = false;
    
    // Track mouse movement
    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
        
        // Only expand cursor if not dragging the background
        if (!isDraggingBackground) {
            // Expand cursor on movement
            cursorHighlight.style.width = '30px';
            cursorHighlight.style.height = '30px';
            
            // Reset to normal size after a delay
            clearTimeout(window.cursorTimeout);
            window.cursorTimeout = setTimeout(() => {
                cursorHighlight.style.width = '20px';
                cursorHighlight.style.height = '20px';
            }, 100);
        }
    });
    
    // Handle cursor over interactive elements
    const interactiveElements = document.querySelectorAll('button, a, input, textarea, select, .theme-card');
    
    interactiveElements.forEach(element => {
        element.addEventListener('mouseenter', () => {
            if (!isDraggingBackground) {
                cursorHighlight.style.width = '40px';
                cursorHighlight.style.height = '40px';
                cursorHighlight.style.backgroundColor = 'rgba(255, 87, 34, 0.3)';
            }
        });
        
        element.addEventListener('mouseleave', () => {
            if (!isDraggingBackground) {
                cursorHighlight.style.width = '20px';
                cursorHighlight.style.height = '20px';
                cursorHighlight.style.backgroundColor = 'rgba(126, 87, 194, 0.3)';
            }
        });
    });
    
    // Handle mouse clicks
    document.addEventListener('mousedown', (e) => {
        // Check if this is a click on space background or its interaction layer
        const spaceBackground = document.getElementById('space-background');
        if (e.target === spaceBackground || e.target.parentNode === spaceBackground || 
            (e.target.tagName === 'DIV' && getComputedStyle(e.target).zIndex === '1')) {
            isDraggingBackground = true;
            cursorHighlight.style.opacity = '0'; // Hide highlight during dragging
        } else {
            cursorHighlight.style.transform = 'translate(-50%, -50%) scale(0.8)';
        }
    });
    
    document.addEventListener('mouseup', () => {
        if (isDraggingBackground) {
            isDraggingBackground = false;
            cursorHighlight.style.opacity = '1'; // Show highlight again
        } else {
            cursorHighlight.style.transform = 'translate(-50%, -50%) scale(1)';
        }
    });
    
    // Watch for space-dragging class on body
    const bodyObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.attributeName === 'class') {
                if (document.body.classList.contains('space-dragging')) {
                    isDraggingBackground = true;
                    cursorHighlight.style.opacity = '0';
                } else {
                    isDraggingBackground = false;
                    cursorHighlight.style.opacity = '1';
                }
            }
        });
    });
    
    bodyObserver.observe(document.body, { attributes: true });
    
    // Update cursor position with smooth animation
    function updateCursorPosition() {
        // Calculate smooth movement
        currentX += (mouseX - currentX) * 0.1;
        currentY += (mouseY - currentY) * 0.1;
        
        // Only update highlight if we're not dragging the background
        if (!isDraggingBackground) {
            // Update cursor highlight position
            cursorHighlight.style.left = `${currentX}px`;
            cursorHighlight.style.top = `${currentY}px`;
        }
        
        // Continue animation
        requestAnimationFrame(updateCursorPosition);
    }
    
    // Start cursor animation
    updateCursorPosition();
    
    // Keep default cursor visible (removing previous 'none' setting)
    document.body.style.cursor = 'auto';
    
    // Show default cursor when leaving window
    document.addEventListener('mouseleave', () => {
        cursorHighlight.style.opacity = '0';
    });
    
    document.addEventListener('mouseenter', () => {
        if (!isDraggingBackground) {
            cursorHighlight.style.opacity = '1';
        }
    });
    
    // Update interactive elements after DOM changes
    const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
            if (mutation.addedNodes.length) {
                const newInteractiveElements = document.querySelectorAll('button:not([data-cursor-tracked]), a:not([data-cursor-tracked]), input:not([data-cursor-tracked]), textarea:not([data-cursor-tracked]), select:not([data-cursor-tracked]), .theme-card:not([data-cursor-tracked])');
                
                newInteractiveElements.forEach(element => {
                    element.setAttribute('data-cursor-tracked', 'true');
                    
                    element.addEventListener('mouseenter', () => {
                        if (!isDraggingBackground) {
                            cursorHighlight.style.width = '40px';
                            cursorHighlight.style.height = '40px';
                            cursorHighlight.style.backgroundColor = 'rgba(255, 87, 34, 0.3)';
                        }
                    });
                    
                    element.addEventListener('mouseleave', () => {
                        if (!isDraggingBackground) {
                            cursorHighlight.style.width = '20px';
                            cursorHighlight.style.height = '20px';
                            cursorHighlight.style.backgroundColor = 'rgba(126, 87, 194, 0.3)';
                        }
                    });
                });
            }
        });
    });
    
    // Start observing DOM changes
    observer.observe(document.body, { childList: true, subtree: true });
}); 