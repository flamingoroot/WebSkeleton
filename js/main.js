// ===== LOADING SCREEN =====
document.addEventListener('DOMContentLoaded', () => {
    const loadingScreen = document.getElementById('loading-screen');
    const progressBar = document.getElementById('loading-progress');
    const loadingContent = document.querySelector('.loading-content');
    const mainContent = document.getElementById('main-content');
    const spaceBackground = document.getElementById('space-background');

    // Initialize loading variables
    let currentStep = 0;
    let currentProgress = 0;
    let targetProgress = 0;
    let isPaused = false;
    let loadingSpeed = 1;

    // Configuration for faster loading
    const loadingSpeedFactor = 0.3;
    const minStepTime = 300 * loadingSpeedFactor;
    const maxStepTime = 800 * loadingSpeedFactor;

    // Define loading steps
    const loadingSteps = [
        { name: "Initializing space background", duration: 20 },
        { name: "Loading resources", duration: 30 },
        { name: "Preparing themes", duration: 20 },
        { name: "Finalizing", duration: 30 }
    ];

    // Function to update the loading text
    function updateLoadingText(text) {
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = text;
        }
    }

    // Function to update rocket position
    function updateRocketPosition(progress) {
        const rocket = document.querySelector('.loading-rocket');
        if (rocket) {
            const maxMove = loadingContent.offsetWidth - rocket.offsetWidth;
            const position = (progress / 100) * maxMove;
            rocket.style.transform = `translateX(${position}px) translateY(-50%)`;
        }
    }

    // Animate loading step
    function animateStep(duration) {
        const startProgress = currentProgress;
        const endProgress = targetProgress;
        const startTime = Date.now();
        
        function updateStep() {
            if (isPaused) return;
            
            const currentTime = Date.now();
            const elapsed = currentTime - startTime;
            const progress = Math.min(1, elapsed / duration);
            
            // Use easeOutQuad for smoother animation
            const easeProgress = 1 - (1 - progress) * (1 - progress);
            
            currentProgress = startProgress + (endProgress - startProgress) * easeProgress;
            progressBar.style.width = currentProgress + '%';
            updateRocketPosition(currentProgress);
            
            if (progress < 1) {
                requestAnimationFrame(updateStep);
            } else {
                if (currentStep === loadingSteps.length - 2) {
                    preloadResources().then(() => {
                        currentStep++;
                        updateLoadingText(loadingSteps[currentStep].name);
                        goToNextStep();
                    });
                } else {
                    currentStep++;
                    if (currentStep < loadingSteps.length) {
                        updateLoadingText(loadingSteps[currentStep].name);
                        goToNextStep();
                    } else {
                        completeLoading();
                    }
                }
            }
        }
        
        requestAnimationFrame(updateStep);
    }

    // Go to next loading step
    function goToNextStep() {
        if (currentStep >= loadingSteps.length) {
            completeLoading();
            return;
        }
        
        let stepDuration = loadingSteps[currentStep].duration;
        targetProgress = currentProgress + stepDuration;
        
        const randomFactor = Math.random() * 0.4 + 0.8;
        const time = Math.min(maxStepTime, 
                            Math.max(minStepTime, stepDuration * 40 * loadingSpeedFactor * randomFactor));
        
        animateStep(time / loadingSpeed);
    }

    // Start the loading animation
    function startLoading() {
        updateLoadingText(loadingSteps[currentStep].name);
        goToNextStep();
    }

    // Create loading stars
    const loadingStars = document.createElement('div');
    loadingStars.classList.add('loading-stars');
    loadingScreen.appendChild(loadingStars);

    // Create loading rocket
    const loadingRocket = document.createElement('div');
    loadingRocket.classList.add('loading-rocket');
    loadingRocket.innerHTML = '<i class="fas fa-rocket"></i>';
    loadingContent.appendChild(loadingRocket);

    // Add loading controls for interaction
    const loadingControls = document.createElement('div');
    loadingControls.classList.add('loading-controls');
    loadingControls.innerHTML = `
        <div class="loading-control" id="loading-play" title="Skip loading">
            <i class="fas fa-step-forward"></i>
        </div>
        <div class="loading-control" id="loading-pause" title="Pause loading">
            <i class="fas fa-pause"></i>
        </div>
        <div class="loading-control" id="loading-speed" title="Speed up loading">
            <i class="fas fa-fast-forward"></i>
        </div>
        <div class="loading-control" id="loading-theme" title="Switch theme color">
            <i class="fas fa-palette"></i>
        </div>
    `;
    loadingContent.appendChild(loadingControls);

    // Add random loading tips
    const tips = [
        "Drag the space background to explore the universe.",
        "Click the theme icons to preview different styles.",
        "Our authentication system keeps your data secure.",
        "The site is fully responsive - try it on your mobile device!",
        "The homepage displays real-time star movement.",
        "The loading screen controls let you adjust the experience."
    ];
    let tipIndex = 0;
    
    const loadingTips = document.createElement('div');
    loadingTips.classList.add('loading-tips');
    loadingTips.textContent = tips[Math.floor(Math.random() * tips.length)];
    loadingScreen.appendChild(loadingTips);
    
    // Rotate tips every 4 seconds
    setInterval(() => {
        tipIndex++;
        if (loadingScreen.style.opacity !== '0') {
            loadingTips.textContent = tips[tipIndex % tips.length];
        }
    }, 4000);

    // Create more stars for loading animation
    for (let i = 0; i < 30; i++) {
        const star = document.createElement('div');
        star.classList.add('star');
        star.style.width = `${Math.random() * 3 + 1}px`;
        star.style.height = star.style.width;
        star.style.left = `${Math.random() * 100}%`;
        star.style.animationDelay = `${Math.random() * 8}s`;
        star.style.animationDuration = `${5 + Math.random() * 10}s`;
        
        // Add different colors for stars
        const colors = ['#ffffff', '#f5f5f5', '#eeeeee', '#e0e0e0', '#b3e5fc'];
        star.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        
        loadingStars.appendChild(star);
    }

    // Apply space-dragging class when background is dragged
    if (spaceBackground) {
        spaceBackground.addEventListener('mousedown', () => {
            document.body.classList.add('space-dragging');
        });
        
        document.addEventListener('mouseup', () => {
            document.body.classList.remove('space-dragging');
        });
    }

    // Optimized resource loading with Promise.all for parallel loading
    function preloadResources() {
        return new Promise((resolve) => {
            // Preload critical resources in parallel
            const resources = [];
            
            // Create image preload promises
            const imageUrls = document.querySelectorAll('img');
            imageUrls.forEach(img => {
                if (!img.complete) {
                    resources.push(new Promise(resolve => {
                        const image = new Image();
                        image.onload = resolve;
                        image.onerror = resolve; // Don't let errors block loading
                        image.src = img.src;
                    }));
                }
            });
            
            // If no resources to preload, resolve immediately
            if (resources.length === 0) {
                setTimeout(resolve, 100); // Small delay for visual consistency
                return;
            }
            
            // Wait for all resources to load or timeout after 3 seconds
            Promise.race([
                Promise.all(resources),
                new Promise(resolve => setTimeout(resolve, 3000))
            ]).then(resolve);
        });
    }

    // Enhanced loading completion
    function completeLoading() {
        updateLoadingText("Launching!");
        
        // Final rocket animation
        const rocket = document.querySelector('.loading-rocket');
        if (rocket) {
            // Create burst effect at rocket base
            const burstCount = 15;
            for (let i = 0; i < burstCount; i++) {
                setTimeout(() => {
                    const burst = document.createElement('div');
                    burst.style.position = 'absolute';
                    
                    // Get rocket's position
                    const rocketRect = rocket.getBoundingClientRect();
                    const contentRect = loadingContent.getBoundingClientRect();
                    
                    // Position burst at the bottom of the rocket
                    burst.style.top = (rocketRect.bottom - contentRect.top) + 'px';
                    burst.style.left = (rocketRect.left - contentRect.left + (rocketRect.width / 2)) + 'px';
                    
                    // Style the burst particle
                    const size = 3 + Math.random() * 4;
                    // Spread particles in a downward cone
                    const angle = Math.PI * (0.5 + (Math.random() * 1 - 0.5)); // Bottom-focused spread
                    const distance = 10 + Math.random() * 20;
                    
                    burst.style.width = `${size}px`;
                    burst.style.height = `${size}px`;
                    burst.style.borderRadius = '50%';
                    
                    // Bright flame colors
                    const r = 255;
                    const g = Math.floor(100 + Math.random() * 155);
                    const b = Math.floor(Math.random() * 50);
                    burst.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.9)`;
                    burst.style.boxShadow = `0 0 ${size*2}px rgba(${r}, ${g}, ${b}, 0.7)`;
                    
                    // Start with zero opacity
                    burst.style.opacity = '0';
                    burst.style.transition = 'all 0.7s cubic-bezier(0.1, 0.9, 0.2, 1)';
                    burst.style.zIndex = '9998';
                    
                    loadingContent.appendChild(burst);
                    
                    // Animate the burst
                    setTimeout(() => {
                        burst.style.opacity = '1';
                        // Particles move downward in a cone
                        burst.style.transform = `translate(${Math.cos(angle) * distance}px, ${Math.sin(angle) * distance}px) scale(1.5)`;
                        
                        // Remove the burst after animation
                        setTimeout(() => {
                            burst.style.opacity = '0';
                            setTimeout(() => burst.remove(), 600);
                        }, 200);
                    }, 10);
                }, i * 40); // Staggered effect
            }
            
            // Prepare for liftoff with subtle vibration
            rocket.style.transition = 'transform 0.2s ease-in-out';
            
            // Vibration sequence to simulate engine start
            let vibrationCount = 0;
            const maxVibrations = 6;
            const vibrationInterval = setInterval(() => {
                if (vibrationCount >= maxVibrations) {
                    clearInterval(vibrationInterval);
                    launchRocket();
                    return;
                }
                
                // Alternate small left/right movements
                const vibrationAmount = Math.max(2 - (vibrationCount/3), 0.5); // Decreasing intensity
                const direction = vibrationCount % 2 === 0 ? 1 : -1;
                rocket.style.transform = `translateY(-50%) translateX(${direction * vibrationAmount}px) rotate(0deg)`;
                vibrationCount++;
            }, 100);
            
            // Function to launch the rocket straight up after vibration
            function launchRocket() {
                // Create continuous intense flame effect during launch
                const flameInterval = setInterval(() => {
                    const flameParticleCount = 3; // Multiple particles per frame
                    for (let i = 0; i < flameParticleCount; i++) {
                        const flame = document.createElement('div');
                        flame.style.position = 'absolute';
                        
                        // Get current rocket position (which changes during animation)
                        const rocketRect = rocket.getBoundingClientRect();
                        const contentRect = loadingContent.getBoundingClientRect();
                        
                        // Position flame at bottom of rocket
                        flame.style.top = (rocketRect.bottom - contentRect.top) + 'px';
                        flame.style.left = (rocketRect.left - contentRect.left + (rocketRect.width / 2) + (Math.random() * 6 - 3)) + 'px';
                        
                        // Varied size flame particles
                        const flameSize = 3 + Math.random() * 5;
                        flame.style.width = `${flameSize}px`;
                        flame.style.height = `${flameSize}px`;
                        flame.style.borderRadius = '50%';
                        
                        // Bright orange/yellow colors
                        const r = 255;
                        const g = Math.floor(100 + Math.random() * 155);
                        const b = Math.floor(Math.random() * 50);
                        flame.style.backgroundColor = `rgba(${r}, ${g}, ${b}, 0.9)`;
                        flame.style.boxShadow = `0 0 ${flameSize*2}px rgba(${r}, ${g}, ${b}, 0.7)`;
                        
                        flame.style.zIndex = '9997';
                        loadingContent.appendChild(flame);
                        
                        // Animate flame trail down and fade
                        const flameAnimInterval = setInterval(() => {
                            const currentTop = parseFloat(flame.style.top);
                            const currentLeft = parseFloat(flame.style.left);
                            
                            // Move flame downward with slight spread
                            flame.style.top = (currentTop + 2) + 'px';
                            flame.style.left = (currentLeft + (Math.random() * 2 - 1)) + 'px';
                            
                            // Fade out
                            const currentOpacity = parseFloat(flame.style.opacity || 1);
                            flame.style.opacity = currentOpacity - 0.05;
                            
                            if (currentOpacity <= 0.05) {
                                clearInterval(flameAnimInterval);
                                flame.remove();
                            }
                        }, 20);
                    }
                }, 30);
                
                // Set rocket to launch straight up with acceleration
                rocket.style.transition = 'all 1.2s cubic-bezier(0.19, 1, 0.22, 1)';
                rocket.style.transform = 'translateY(-200%) rotate(0deg) scale(0.8)';
                
                // Stop the flame effect after the rocket leaves
                setTimeout(() => {
                    clearInterval(flameInterval);
                }, 1000);
            }
        }
        
        // Loading text final state
        const loadingText = document.querySelector('.loading-text');
        if (loadingText) {
            loadingText.textContent = 'Launching!';
            loadingText.style.color = 'var(--secondary-color)';
            loadingText.style.fontWeight = 'bold';
            loadingText.style.fontSize = '1.2rem';
            loadingText.style.textShadow = '0 0 10px rgba(255, 87, 34, 0.7)';
            
            // Add a little animation to the text
            loadingText.style.animation = 'pulse 0.5s infinite alternate';
        }
        
        // Faster transition to main content (reduced times)
        setTimeout(() => {
            loadingScreen.style.opacity = '0';
            mainContent.classList.remove('hidden');
            mainContent.style.opacity = '1';
            
            // Remove loading screen after transition
            setTimeout(() => {
                loadingScreen.style.display = 'none';
            }, 600); // Reduced from 800ms
        }, 400); // Reduced from 600ms or higher
    }

    // Loading screen controls functionality
    document.getElementById('loading-play').addEventListener('click', () => {
        // Skip the loading animation and complete immediately
        currentProgress = 100;
        completeLoading();
    });

    document.getElementById('loading-pause').addEventListener('click', () => {
        isPaused = !isPaused;
        document.getElementById('loading-pause').innerHTML = 
            isPaused ? '<i class="fas fa-play"></i>' : '<i class="fas fa-pause"></i>';
        
        if (!isPaused) {
            startLoading();
        }
    });

    document.getElementById('loading-speed').addEventListener('click', () => {
        loadingSpeed = loadingSpeed === 1 ? 3 : loadingSpeed === 3 ? 5 : 1;
        
        // Update icon based on speed
        let speedIcon = '<i class="fas fa-fast-forward"></i>';
        if (loadingSpeed === 3) speedIcon = '<i class="fas fa-bolt"></i>';
        if (loadingSpeed === 5) speedIcon = '<i class="fas fa-rocket"></i>';
        
        document.getElementById('loading-speed').innerHTML = speedIcon;
        
        // Update rocket animation
        const rocket = document.querySelector('.loading-rocket');
        if (rocket) {
            rocket.style.transition = `all ${0.3 / loadingSpeed}s ease-out`;
        }
        
        if (!isPaused) {
            startLoading();
        }
    });

    // Theme switcher
    let currentTheme = 0;
    const themes = [
        { primary: '#7e57c2', secondary: '#ff5722' }, // Default purple/orange
        { primary: '#e91e63', secondary: '#2196f3' }, // Pink/blue
        { primary: '#4caf50', secondary: '#ff9800' }, // Green/amber
        { primary: '#3f51b5', secondary: '#f44336' }  // Indigo/red
    ];

    document.getElementById('loading-theme').addEventListener('click', () => {
        currentTheme = (currentTheme + 1) % themes.length;
        const theme = themes[currentTheme];
        
        // Update main CSS variables
        document.documentElement.style.setProperty('--primary-color', theme.primary);
        document.documentElement.style.setProperty('--primary-light', adjustBrightness(theme.primary, 20));
        document.documentElement.style.setProperty('--primary-dark', adjustBrightness(theme.primary, -20));
        document.documentElement.style.setProperty('--secondary-color', theme.secondary);
        
        // Update the loading content h2 color
        document.querySelector('.loading-content h2').style.color = theme.primary;
        
        // Update the progress bar gradient
        document.querySelector('.progress-bar').style.background = 
            `linear-gradient(90deg, ${theme.primary}, ${theme.secondary})`;
    });

    // Helper function to adjust color brightness
    function adjustBrightness(hex, percent) {
        const r = parseInt(hex.substring(1, 3), 16);
        const g = parseInt(hex.substring(3, 5), 16);
        const b = parseInt(hex.substring(5, 7), 16);
        
        const newR = Math.min(255, Math.max(0, r + (r * percent / 100)));
        const newG = Math.min(255, Math.max(0, g + (g * percent / 100)));
        const newB = Math.min(255, Math.max(0, b + (b * percent / 100)));
        
        return `#${Math.round(newR).toString(16).padStart(2, '0')}${Math.round(newG).toString(16).padStart(2, '0')}${Math.round(newB).toString(16).padStart(2, '0')}`;
    }

    // Add hover effect to loading content
    loadingContent.addEventListener('mousemove', (e) => {
        const rect = loadingContent.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateY = ((x - centerX) / centerX) * 3; // Reduced from 5 to 3 for subtler effect
        const rotateX = ((centerY - y) / centerY) * 2; // Reduced from 3 to 2 for subtler effect
        
        loadingContent.style.transform = `perspective(500px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.03)`;
    });

    loadingContent.addEventListener('mouseleave', () => {
        loadingContent.style.transform = 'perspective(500px) rotateX(0) rotateY(0) scale(1)';
    });

    // Start the loading simulation immediately
    startLoading();

    // Make sure main content is hidden initially
    if (mainContent) {
        mainContent.classList.add('hidden');
    }
});

// ===== NAVIGATION =====
document.addEventListener('DOMContentLoaded', () => {
    const navLinks = document.querySelectorAll('nav a[data-section]');
    const sections = document.querySelectorAll('.section');
    const logoLink = document.querySelector('.logo h1 a');
    
    // Function to navigate to a section
    const navigateToSection = (sectionId) => {
        // Remove active class from all links
        navLinks.forEach(l => l.classList.remove('active'));
        
        // Add active class to the target link
        const targetLink = document.querySelector(`nav a[data-section="${sectionId}"]`);
        if (targetLink) targetLink.classList.add('active');
        
        // Hide all sections and show the target section
        sections.forEach(section => {
            section.classList.remove('active');
            if (section.id === sectionId) {
                section.classList.add('active');
            }
        });
    };
    
    // Handle navigation clicks
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetSection = link.getAttribute('data-section');
            navigateToSection(targetSection);
        });
    });
    
    // Handle logo click to navigate to home
    if (logoLink) {
        logoLink.addEventListener('click', (e) => {
            e.preventDefault();
            navigateToSection('home');
        });
    }
    
    // Handle button clicks that navigate to sections
    document.getElementById('explore-themes-btn').addEventListener('click', () => {
        navigateToSection('themes');
    });
    
    document.getElementById('book-schedule-btn').addEventListener('click', () => {
        navigateToSection('contact');
    });
});

// ===== THEME PREVIEW =====
document.addEventListener('DOMContentLoaded', () => {
    // Mobile Menu Functionality
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const nav = document.querySelector('nav');
    const navLinks = document.querySelectorAll('nav ul li a');
    
    // Toggle mobile menu
    hamburgerMenu.addEventListener('click', () => {
        hamburgerMenu.classList.toggle('active');
        nav.classList.toggle('active');
    });
    
    // Close mobile menu when nav item is clicked
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (window.innerWidth <= 768) {
                hamburgerMenu.classList.remove('active');
                nav.classList.remove('active');
            }
        });
    });
    
    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            !e.target.closest('nav') && 
            !e.target.closest('.hamburger-menu') && 
            nav.classList.contains('active')) {
            hamburgerMenu.classList.remove('active');
            nav.classList.remove('active');
        }
    });
    
    // Mobile menu responsive behavior on resize
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768 && nav.classList.contains('active')) {
            hamburgerMenu.classList.remove('active');
            nav.classList.remove('active');
        }
    });

    const previewButtons = document.querySelectorAll('.theme-buttons button:not(.primary)');
    const tryNowButtons = document.querySelectorAll('.theme-buttons button.primary');
    const themeModal = document.getElementById('theme-preview-modal');
    const closeModal = document.querySelector('#theme-preview-modal .close-modal');
    const previewImage = document.getElementById('preview-image');
    const previewTitle = document.getElementById('preview-title');
    const previewDescription = document.getElementById('preview-description');
    const previewFeaturesList = document.getElementById('preview-features-list');
    const previewTryNowBtn = document.getElementById('preview-try-now');
    
    // Theme data
    const themes = {
        ecommerce: {
            title: 'E-commerce Theme',
            description: 'A complete solution for online stores with product showcases, shopping cart, payment integrations, and order management.',
            class: 'ecommerce',
            features: [
                'Responsive product grid and detail pages',
                'Shopping cart with localStorage persistence',
                'Checkout flow with form validation',
                'Order tracking and history',
                'Product search and filtering',
                'Customer reviews and ratings'
            ]
        },
        portfolio: {
            title: 'Portfolio Theme',
            description: 'Showcase your work with this elegant and minimalist portfolio theme, perfect for creatives and professionals.',
            class: 'portfolio',
            features: [
                'Project showcase with filtering options',
                'About me section with timeline',
                'Skills and expertise visualization',
                'Testimonials carousel',
                'Contact form with validation',
                'Blog section with categories'
            ]
        },
        course: {
            title: 'Course Selling Theme',
            description: 'The perfect platform for educators and trainers looking to sell and manage online courses.',
            class: 'course',
            features: [
                'Course catalog with categories',
                'Video player with progress tracking',
                'Student dashboard and progress reports',
                'Quiz and assessment engine',
                'Certificate generation',
                'Discussion forum for students'
            ]
        }
    };
    
    // Show theme preview modal
    previewButtons.forEach(button => {
        button.addEventListener('click', () => {
            const themeType = button.getAttribute('data-theme');
            const theme = themes[themeType];
            
            // Set modal content
            previewImage.className = 'theme-preview'; // Reset classes
            previewImage.classList.add(theme.class);
            previewImage.setAttribute('data-theme-name', theme.title);
            
            // Add icon to preview
            previewImage.innerHTML = `<i class="fas fa-${
                themeType === 'ecommerce' ? 'shopping-cart' : 
                themeType === 'portfolio' ? 'palette' : 'graduation-cap'
            }"></i>`;
            
            previewTitle.textContent = theme.title;
            previewDescription.textContent = theme.description;
            
            // Clear and populate features list
            previewFeaturesList.innerHTML = '';
            theme.features.forEach(feature => {
                const li = document.createElement('li');
                li.textContent = feature;
                previewFeaturesList.appendChild(li);
            });
            
            // Set data attribute for try now button
            previewTryNowBtn.setAttribute('data-theme', themeType);
            
            // Show modal
            themeModal.classList.remove('hidden');
        });
    });
    
    // Close modal when clicking the X
    closeModal.addEventListener('click', () => {
        themeModal.classList.add('hidden');
    });
    
    // Close modal when clicking outside the content
    themeModal.addEventListener('click', (e) => {
        if (e.target === themeModal) {
            themeModal.classList.add('hidden');
        }
    });
    
    // Handle preview try now button
    previewTryNowBtn.addEventListener('click', () => {
        const themeType = previewTryNowBtn.getAttribute('data-theme');
        themeModal.classList.add('hidden');
        showAuthModal(themeType);
    });
    
    // Handle theme card try now buttons
    tryNowButtons.forEach(button => {
        button.addEventListener('click', () => {
            const themeType = button.getAttribute('data-theme');
            showAuthModal(themeType);
        });
    });
});

// ===== AUTHENTICATION =====
document.addEventListener('DOMContentLoaded', () => {
    const loginBtn = document.getElementById('login-btn');
    const authModal = document.getElementById('auth-modal');
    const closeAuthModal = document.querySelector('#auth-modal .close-modal');
    const authTabs = document.querySelectorAll('.auth-tabs .tab');
    const authForms = document.querySelectorAll('.auth-form');
    const signInForm = document.querySelector('#sign-in-form form');
    const signUpForm = document.querySelector('#sign-up-form form');
    
    // Mock user data for demo
    let currentUser = null;
    const users = [
        {
            name: 'John Doe',
            email: 'john@example.com',
            password: 'password123',
            phone: '123-456-7890',
            orders: [
                { id: 'ORD-001', date: '2023-10-15', theme: 'E-commerce', status: 'Completed' },
                { id: 'ORD-002', date: '2023-11-05', theme: 'Portfolio', status: 'In Progress' }
            ],
            themes: ['ecommerce', 'portfolio']
        }
    ];
    
    // Show auth modal
    function showAuthModal(themeType = null) {
        // If user is already logged in, handle theme directly
        if (currentUser) {
            if (themeType) {
                addThemeToUser(themeType);
            } else {
                showDashboard();
            }
            return;
        }
        
        // Store theme type for later use
        if (themeType) {
            authModal.setAttribute('data-theme', themeType);
        } else {
            authModal.removeAttribute('data-theme');
        }
        
        // Show modal
        authModal.classList.remove('hidden');
    }
    
    // Add theme to user and show dashboard
    function addThemeToUser(themeType) {
        if (!currentUser.themes.includes(themeType)) {
            currentUser.themes.push(themeType);
            
            // Add an order for this theme
            const newOrder = {
                id: `ORD-${Math.floor(Math.random() * 1000).toString().padStart(3, '0')}`,
                date: new Date().toISOString().slice(0, 10),
                theme: themeType.charAt(0).toUpperCase() + themeType.slice(1),
                status: 'In Progress'
            };
            currentUser.orders.push(newOrder);
        }
        
        // Show dashboard with themes tab active
        showDashboard('themes');
    }
    
    // Show user dashboard
    function showDashboard(activeTab = 'profile') {
        // Update login button text
        loginBtn.textContent = 'Dashboard';
        
        // Hide all sections and show dashboard
        document.querySelectorAll('.section').forEach(section => {
            section.classList.remove('active');
        });
        
        const dashboardSection = document.getElementById('dashboard');
        dashboardSection.classList.remove('hidden');
        dashboardSection.classList.add('active');
        
        // Update user info
        document.getElementById('user-name').textContent = currentUser.name;
        document.getElementById('profile-name').value = currentUser.name;
        document.getElementById('profile-email').value = currentUser.email;
        document.getElementById('profile-phone').value = currentUser.phone || '';
        
        // Update orders list
        const ordersList = document.getElementById('orders-list');
        if (currentUser.orders.length > 0) {
            ordersList.innerHTML = '';
            currentUser.orders.forEach(order => {
                ordersList.innerHTML += `
                    <tr>
                        <td>${order.id}</td>
                        <td>${order.date}</td>
                        <td>${order.theme}</td>
                        <td>${order.status}</td>
                        <td><button class="btn small">View</button></td>
                    </tr>
                `;
            });
        } else {
            ordersList.innerHTML = '<tr><td colspan="5">No orders yet</td></tr>';
        }
        
        // Update themes list
        const themesTab = document.getElementById('themes-tab');
        if (currentUser.themes.length > 0) {
            let themesHTML = '<div class="theme-grid">';
            currentUser.themes.forEach(themeType => {
                // Match the theme data with the theme type
                const themeName = themeType.charAt(0).toUpperCase() + themeType.slice(1) + ' Theme';
                
                themesHTML += `
                    <div class="theme-card">
                        <div class="theme-preview ${themeType}" data-theme-name="${themeName}">
                            <!-- Image as background or fallback color gradient -->
                        </div>
                        <div class="theme-info">
                            <h3>${themeName}</h3>
                            <div class="theme-buttons">
                                <button class="btn small">View Demo</button>
                                <button class="btn small primary">Download</button>
                            </div>
                        </div>
                    </div>
                `;
            });
            themesHTML += '</div>';
            themesTab.innerHTML = themesHTML;
        } else {
            themesTab.innerHTML = '<p>You haven\'t tried any themes yet. <a href="#" data-section="themes">Explore themes</a> to get started.</p>';
        }
        
        // Show active tab
        document.querySelectorAll('.dashboard-content').forEach(content => {
            content.classList.remove('active');
        });
        document.getElementById(`${activeTab}-tab`).classList.add('active');
        
        document.querySelectorAll('.dashboard-tabs .tab').forEach(tab => {
            tab.classList.remove('active');
            if (tab.getAttribute('data-dashboard-tab') === activeTab) {
                tab.classList.add('active');
            }
        });
    }
    
    // Handle login button click
    loginBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentUser) {
            showDashboard();
        } else {
            showAuthModal();
        }
    });
    
    // Close auth modal
    closeAuthModal.addEventListener('click', () => {
        authModal.classList.add('hidden');
    });
    
    // Close modal when clicking outside the content
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.classList.add('hidden');
        }
    });
    
    // Handle tab switching
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-tab');
            
            // Toggle active class on tabs
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // Toggle active class on forms
            authForms.forEach(form => {
                form.classList.remove('active');
                if (form.id === `${tabName}-form`) {
                    form.classList.add('active');
                }
            });
        });
    });
    
    // Handle sign in form submission
    signInForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const email = document.getElementById('sign-in-email').value;
        const password = document.getElementById('sign-in-password').value;
        const rememberMe = document.getElementById('remember-me').checked;
        
        if (rememberMe) {
            localStorage.setItem('rememberedEmail', email);
            localStorage.setItem('rememberedPassword', password);
        } else {
            localStorage.removeItem('rememberedEmail');
            localStorage.removeItem('rememberedPassword');
        }
        
        // Check for admin login
        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
            currentUser = {
                name: 'Admin',
                email: ADMIN_CREDENTIALS.email,
                isAdmin: true,
                orders: [],
                themes: []
            };
            authModal.classList.add('hidden');
            showAdminPanel();
            return;
        }
        
        // Find regular user
        const user = users.find(u => u.email === email && u.password === password);
        
        if (user) {
            currentUser = user;
            authModal.classList.add('hidden');
            
            // Check if auth was triggered by try now button
            const themeType = authModal.getAttribute('data-theme');
            if (themeType) {
                addThemeToUser(themeType);
            } else {
                showDashboard();
            }
        } else {
            // Show error message
            const errorMsg = document.getElementById('login-error');
            if (errorMsg) {
                errorMsg.style.display = 'block';
            } else {
                const error = document.createElement('div');
                error.id = 'login-error';
                error.className = 'error-message';
                error.textContent = 'Invalid email or password';
                signInForm.insertBefore(error, signInForm.firstChild);
            }
        }
    });
    
    // Handle sign up form submission
    signUpForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('sign-up-name').value;
        const email = document.getElementById('sign-up-email').value;
        const password = document.getElementById('sign-up-password').value;
        const confirmPassword = document.getElementById('sign-up-confirm-password').value;
        
        // Simple validation
        if (password !== confirmPassword) {
            alert('Passwords do not match!');
            return;
        }
        
        // Check if user already exists
        if (users.some(u => u.email === email)) {
            alert('Email already registered. Try signing in instead.');
            return;
        }
        
        // Create new user
        const newUser = {
            name,
            email,
            password,
            phone: '',
            orders: [],
            themes: []
        };
        
        users.push(newUser);
        currentUser = newUser;
        authModal.classList.add('hidden');
        
        // Check if auth was triggered by try now button
        const themeType = authModal.getAttribute('data-theme');
        if (themeType) {
            addThemeToUser(themeType);
        } else {
            showDashboard();
        }
    });
    
    // Handle dashboard tab switching
    document.querySelectorAll('.dashboard-tabs .tab').forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.getAttribute('data-dashboard-tab');
            
            // Toggle active class on tabs
            document.querySelectorAll('.dashboard-tabs .tab').forEach(t => {
                t.classList.remove('active');
            });
            tab.classList.add('active');
            
            // Toggle active class on content
            document.querySelectorAll('.dashboard-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });
    
    // Check for remembered credentials on page load
    const rememberedEmail = localStorage.getItem('rememberedEmail');
    const rememberedPassword = localStorage.getItem('rememberedPassword');
    
    if (rememberedEmail && rememberedPassword) {
        document.getElementById('sign-in-email').value = rememberedEmail;
        document.getElementById('sign-in-password').value = rememberedPassword;
        document.getElementById('remember-me').checked = true;
    }
    
    // Expose functions to global scope for other components
    window.showAuthModal = showAuthModal;
    
    // Handle Google sign-in callback
    window.handleCredentialResponse = (response) => {
        // In a real app, you would validate the credential with your backend
        // For demo purposes, we'll just create a mock user
        const mockUser = {
            name: 'Google User',
            email: 'google@example.com',
            phone: '',
            orders: [],
            themes: []
        };
        
        currentUser = mockUser;
        users.push(mockUser);
        authModal.classList.add('hidden');
        
        // Check if auth was triggered by try now button
        const themeType = authModal.getAttribute('data-theme');
        if (themeType) {
            addThemeToUser(themeType);
        } else {
            showDashboard();
        }
    };
});

// ===== CONTACT FORM =====
document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contact-form');
    
    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // In a real app, you would send the form data to your backend
        alert('Thank you! Your request has been submitted. We will contact you soon.');
        contactForm.reset();
    });
});

// Contact form multi-step functionality
document.addEventListener('DOMContentLoaded', function() {
    // Setup contact form steps if the form exists
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        setupContactForm();
    }
});

function setupContactForm() {
    const steps = document.querySelectorAll('.step');
    const formSteps = document.querySelectorAll('.form-step');
    const nextButtons = document.querySelectorAll('.next-step');
    const prevButtons = document.querySelectorAll('.prev-step');
    const submitButton = document.querySelector('.submit-btn');
    
    // Generate calendar and time slots
    generateCalendar();
    generateTimeSlots();
    
    // Next button click handler
    nextButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = parseInt(button.closest('.form-step').getAttribute('data-step'));
            
            // Validate current step before proceeding
            if (validateStep(currentStep)) {
                // If validation passes, move to next step
                goToStep(currentStep + 1);
                
                // Update summary on the final step
                if (currentStep + 1 === 3) {
                    updateSummary();
                }
            }
        });
    });
    
    // Previous button click handler
    prevButtons.forEach(button => {
        button.addEventListener('click', function() {
            const currentStep = parseInt(button.closest('.form-step').getAttribute('data-step'));
            goToStep(currentStep - 1);
        });
    });
    
    // Submit button animation
    if (submitButton) {
        submitButton.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.add('sending');
            
            // Simulate form submission with a delay
            setTimeout(() => {
                contactForm.submit();
            }, 1000);
        });
    }
    
    // Function to go to a specific step
    function goToStep(stepNumber) {
        // Update step indicator
        steps.forEach(step => {
            if (parseInt(step.getAttribute('data-step')) === stepNumber) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
        
        // Update form step visibility
        formSteps.forEach(step => {
            if (parseInt(step.getAttribute('data-step')) === stepNumber) {
                step.classList.add('active');
            } else {
                step.classList.remove('active');
            }
        });
    }
    
    // Validate step before proceeding
    function validateStep(stepNumber) {
        const currentStep = document.querySelector(`.form-step[data-step="${stepNumber}"]`);
        
        if (stepNumber === 1) {
            // Validate personal information
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const message = document.getElementById('message').value;
            
            if (!name || !email || !message) {
                alert('Please fill in all required fields.');
                return false;
            }
            
            // Simple email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return false;
            }
            
            return true;
        } else if (stepNumber === 2) {
            // Validate date and time selection
            const selectedDate = document.querySelector('.calendar-day.selected');
            const selectedTime = document.querySelector('.time-slot.selected');
            
            if (!selectedDate || !selectedTime) {
                alert('Please select both a date and time.');
                return false;
            }
            
            // Update hidden inputs with selected values
            document.getElementById('date').value = selectedDate.getAttribute('data-date');
            document.getElementById('time').value = selectedTime.textContent;
            
            return true;
        }
        
        return true;
    }
    
    // Update summary on the confirmation page
    function updateSummary() {
        document.getElementById('summary-name').textContent = document.getElementById('name').value;
        document.getElementById('summary-email').textContent = document.getElementById('email').value;
        document.getElementById('summary-phone').textContent = document.getElementById('phone').value || 'Not provided';
        document.getElementById('summary-message').textContent = document.getElementById('message').value;
        
        const selectedDate = document.querySelector('.calendar-day.selected');
        const selectedTime = document.querySelector('.time-slot.selected');
        
        if (selectedDate) {
            document.getElementById('summary-date').textContent = formatDate(selectedDate.getAttribute('data-date'));
        }
        
        if (selectedTime) {
            document.getElementById('summary-time').textContent = selectedTime.textContent;
        }
    }
    
    // Format date for display
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { 
            weekday: 'long',
            year: 'numeric', 
            month: 'long', 
            day: 'numeric'
        });
    }
    
    // Generate calendar
    function generateCalendar() {
        const calendarElement = document.getElementById('booking-calendar');
        if (!calendarElement) return;
        
        const today = new Date();
        const currentMonth = today.getMonth();
        const currentYear = today.getFullYear();
        
        // Create calendar header
        const header = document.createElement('div');
        header.className = 'calendar-header';
        header.innerHTML = `
            <div class="calendar-month">${new Date(currentYear, currentMonth).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</div>
            <div class="calendar-controls">
                <button class="prev-month"><i class="fas fa-chevron-left"></i></button>
                <button class="next-month"><i class="fas fa-chevron-right"></i></button>
            </div>
        `;
        calendarElement.appendChild(header);
        
        // Add weekday headers
        const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        weekdays.forEach(day => {
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-weekday';
            dayElement.textContent = day;
            calendarElement.appendChild(dayElement);
        });
        
        // Get days in month
        const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
        // Get which day of the week the month starts on (0 = Sunday, 1 = Monday, etc.)
        const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
        
        // Add empty cells for days before the first of the month
        for (let i = 0; i < firstDayOfMonth; i++) {
            const emptyDay = document.createElement('div');
            emptyDay.className = 'calendar-day empty';
            calendarElement.appendChild(emptyDay);
        }
        
        // Add days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(currentYear, currentMonth, day);
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = day;
            dayElement.setAttribute('data-date', date.toISOString().split('T')[0]);
            
            // Disable past dates
            if (date < new Date(today.setHours(0, 0, 0, 0))) {
                dayElement.classList.add('disabled');
            } else {
                // Add click event for selectable days
                dayElement.addEventListener('click', function() {
                    // Deselect previous selection
                    document.querySelectorAll('.calendar-day.selected').forEach(el => {
                        el.classList.remove('selected');
                    });
                    // Select this day
                    this.classList.add('selected');
                });
            }
            
            // Highlight today
            if (day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear()) {
                dayElement.classList.add('today');
            }
            
            calendarElement.appendChild(dayElement);
        }
    }
    
    // Generate time slots
    function generateTimeSlots() {
        const timeSlotsElement = document.getElementById('time-slots');
        if (!timeSlotsElement) return;
        
        // Business hours: 9 AM to 5 PM
        const startHour = 9;
        const endHour = 17;
        
        // Generate a time slot every 30 minutes
        for (let hour = startHour; hour <= endHour; hour++) {
            for (let minutes of [0, 30]) {
                // Skip 5:30 PM as it's outside business hours
                if (hour === endHour && minutes === 30) continue;
                
                const timeString = formatTimeSlot(hour, minutes);
                const timeSlot = document.createElement('div');
                timeSlot.className = 'time-slot';
                timeSlot.textContent = timeString;
                
                // Randomly disable some time slots to simulate availability
                if (Math.random() < 0.3) {
                    timeSlot.classList.add('disabled');
                } else {
                    timeSlot.addEventListener('click', function() {
                        // Deselect previous selection
                        document.querySelectorAll('.time-slot.selected').forEach(el => {
                            el.classList.remove('selected');
                        });
                        // Select this time slot
                        this.classList.add('selected');
                    });
                }
                
                timeSlotsElement.appendChild(timeSlot);
            }
        }
    }
    
    // Format time slot for display
    function formatTimeSlot(hour, minutes) {
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
        return `${displayHour}:${minutes === 0 ? '00' : minutes} ${ampm}`;
    }
}

// Admin credentials
const ADMIN_CREDENTIALS = {
    email: 'rohitky9910@gmail.com',
    password: 'thegreatadmin'
};

let userStats = {
    totalUsers: 0,
    totalThemePurchases: 0,
    scheduledBookings: []
};

function handleLogin(event) {
    event.preventDefault();
    const username = document.querySelector('#login-username').value;
    const password = document.querySelector('#login-password').value;

    if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
        showAdminPanel();
    } else {
        showUserDashboard();
    }
}

function showAdminPanel() {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
        section.classList.add('hidden');
    });

    // Show admin dashboard
    const adminDashboard = document.getElementById('admin-dashboard');
    adminDashboard.classList.remove('hidden');
    adminDashboard.classList.add('active');

    // Update stats
    updateAdminStats();
}

function updateAdminStats() {
    // Update total users
    document.getElementById('total-users').textContent = users.length;
    
    // Update active bookings
    const activeBookings = userStats.scheduledBookings.filter(booking => 
        new Date(booking.date) >= new Date()).length;
    document.getElementById('active-bookings').textContent = activeBookings;
    
    // Update theme downloads
    document.getElementById('theme-downloads').textContent = 
        users.reduce((total, user) => total + user.themes.length, 0);

    // Update bookings table
    const bookingsList = document.getElementById('bookings-list');
    bookingsList.innerHTML = userStats.scheduledBookings.map(booking => `
        <tr>
            <td>${booking.name}</td>
            <td>${booking.email}</td>
            <td>${new Date(booking.date).toLocaleDateString()}</td>
            <td>${booking.time}</td>
            <td>
                <span class="status ${new Date(booking.date) >= new Date() ? 'active' : 'pending'}">
                    ${new Date(booking.date) >= new Date() ? 'Upcoming' : 'Past'}
                </span>
            </td>
            <td>
                <div class="admin-actions">
                    <button class="edit" onclick="editBooking('${booking.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete" onclick="deleteBooking('${booking.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');

    // Update users table
    const usersList = document.getElementById('users-list');
    usersList.innerHTML = users.map(user => `
        <tr>
            <td>${user.name}</td>
            <td>${user.email}</td>
            <td>${new Date(user.joinDate || Date.now()).toLocaleDateString()}</td>
            <td>
                <span class="status ${user.isActive ? 'active' : 'pending'}">
                    ${user.isActive ? 'Active' : 'Inactive'}
                </span>
            </td>
            <td>
                <div class="admin-actions">
                    <button class="edit" onclick="editUser('${user.email}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="delete" onclick="deleteUser('${user.email}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// Admin action handlers
function editBooking(id) {
    // Implement booking editing functionality
    console.log('Edit booking:', id);
}

function deleteBooking(id) {
    if (confirm('Are you sure you want to delete this booking?')) {
        userStats.scheduledBookings = userStats.scheduledBookings.filter(booking => booking.id !== id);
        updateAdminStats();
    }
}

function editUser(email) {
    // Implement user editing functionality
    console.log('Edit user:', email);
}

function deleteUser(email) {
    if (confirm('Are you sure you want to delete this user?')) {
        users = users.filter(user => user.email !== email);
        updateAdminStats();
    }
}

// Clear input errors on typing
document.querySelectorAll('input').forEach(input => {
    input.addEventListener('input', function() {
        this.classList.remove('error');
        const errorMsg = document.getElementById('login-error');
        if (errorMsg) {
            errorMsg.style.display = 'none';
        }
    });
});

// Dynamic word transition
function initDynamicWords() {
    const words = document.querySelectorAll('.word');
    let currentIndex = 0;

    function showNextWord() {
        words.forEach(word => word.classList.remove('active'));
        words[currentIndex].classList.add('active');
        currentIndex = (currentIndex + 1) % words.length;
    }

    showNextWord(); // Show first word
    setInterval(showNextWord, 2000); // Change word every 2 seconds
}

// Initialize dynamic words when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initDynamicWords();
    // ... existing initialization code ...
});

// Initialize dashboard menu
function initDashboardMenu() {
    const dashboardMenuItems = document.querySelectorAll('.dashboard-menu-item');
    const dashboardContent = document.querySelectorAll('.dashboard-content');
    
    if (!dashboardMenuItems.length) {
        // Create dashboard menu if it doesn't exist
        const dashboardTabs = document.querySelector('.dashboard-tabs');
        
        if (dashboardTabs) {
            const menuContainer = document.createElement('div');
            menuContainer.className = 'dashboard-menu';
            
            // Create menu items from tabs
            const tabs = dashboardTabs.querySelectorAll('.tab');
            tabs.forEach(tab => {
                const tabTarget = tab.getAttribute('data-dashboard-tab');
                const menuItem = document.createElement('div');
                menuItem.className = 'dashboard-menu-item';
                if (tab.classList.contains('active')) {
                    menuItem.classList.add('active');
                }
                menuItem.setAttribute('data-target', tabTarget);
                menuItem.textContent = tab.textContent;
                menuContainer.appendChild(menuItem);
                
                menuItem.addEventListener('click', function() {
                    // Set active menu item
                    document.querySelectorAll('.dashboard-menu-item').forEach(item => {
                        item.classList.remove('active');
                    });
                    this.classList.add('active');
                    
                    // Show corresponding content
                    const target = this.getAttribute('data-target');
                    document.querySelectorAll('.dashboard-content').forEach(content => {
                        content.classList.remove('active');
                    });
                    document.getElementById(`${target}-tab`).classList.add('active');
                });
            });
            
            // Insert menu above tabs
            dashboardTabs.parentNode.insertBefore(menuContainer, dashboardTabs);
        }
    }
}

// Initialize dashboard when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    initDynamicWords();
    initDashboardMenu();
    // ... existing initialization code ...
});

// Update showUserDashboard function
function showUserDashboard() {
    // Hide all sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show dashboard section
    const dashboardSection = document.getElementById('dashboard');
    if (dashboardSection) {
        dashboardSection.classList.remove('hidden');
        dashboardSection.classList.add('active');
        initDashboardMenu(); // Initialize menu when showing dashboard
    }
}

// Theme preview functionality
document.querySelectorAll('.preview-btn').forEach(button => {
    button.addEventListener('click', function() {
        const theme = this.dataset.theme;
        const previewUrl = this.dataset.previewUrl;
        const modal = document.getElementById('theme-preview-modal');
        const previewImage = document.getElementById('preview-image');
        const previewTitle = document.getElementById('preview-title');
        const previewDescription = document.getElementById('preview-description');
        const livePreviewBtn = document.getElementById('live-preview-btn');
        const featuresList = document.getElementById('preview-features-list');

        // Update preview content based on theme
        previewImage.className = `theme-preview ${theme}`;
        previewImage.dataset.themeName = theme.charAt(0).toUpperCase() + theme.slice(1);
        livePreviewBtn.href = previewUrl;

        // Set theme-specific content
        const themeContent = {
            ecommerce: {
                title: 'E-commerce Theme',
                description: 'A complete solution for your online store with product management, shopping cart, and secure checkout.',
                features: ['Product catalog', 'Shopping cart', 'Secure payments', 'Order management', 'Customer accounts']
            },
            course: {
                title: 'Course Selling Theme',
                description: 'Perfect platform for educators to sell and manage online courses with integrated learning tools.',
                features: ['Course management', 'Student portal', 'Progress tracking', 'Certificate generation', 'Payment processing']
            },
            portfolio: {
                title: 'Portfolio Theme',
                description: 'Showcase your work with a professional and modern portfolio website.',
                features: ['Project gallery', 'Case studies', 'Contact form', 'Skills showcase', 'Testimonials section']
            }
        };

        // Update modal content
        const content = themeContent[theme];
        previewTitle.textContent = content.title;
        previewDescription.textContent = content.description;
        featuresList.innerHTML = content.features.map(feature => `<li>${feature}</li>`).join('');

        // Show modal
        modal.classList.remove('hidden');
    });
});

// Handle admin login redirect
document.getElementById('admin-login-btn').addEventListener('click', function() {
    window.location.href = 'admin/index.html';
}); 