// Create a space background with stars and planets orbiting around the sun
document.addEventListener('DOMContentLoaded', () => {
    // Download Three.js if not already present
    if (!window.THREE) {
        const script = document.createElement('script');
        script.src = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
        script.onload = initSpaceBackground;
        document.head.appendChild(script);
    } else {
        initSpaceBackground();
    }
});

function initSpaceBackground() {
    const container = document.getElementById('space-background');
    
    // CRITICAL FIX: Remove any existing interaction layers that might be causing issues
    document.querySelectorAll('.space-interaction-layer').forEach(el => el.remove());
    
    // Create a dedicated interaction layer that will sit on top of everything but be transparent to clicks
    const interactionLayer = document.createElement('div');
    interactionLayer.className = 'space-interaction-layer';
    interactionLayer.style.position = 'fixed';
    interactionLayer.style.top = '0';
    interactionLayer.style.left = '0';
    interactionLayer.style.width = '100%';
    interactionLayer.style.height = '100%';
    interactionLayer.style.zIndex = '9999'; // Very high z-index
    interactionLayer.style.backgroundColor = 'transparent';
    interactionLayer.style.pointerEvents = 'none'; // Initially none, will be changed on user interaction
    interactionLayer.style.cursor = 'grab';
    interactionLayer.style.touchAction = 'none'; // Prevent scrolling/zooming gestures
    document.body.appendChild(interactionLayer);
    
    // Create scene, camera and renderer
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(renderer.domElement);
    
    // Set camera position
    camera.position.z = 50;
    
    // Variables for rotation control
    const rotationControls = {
        isDragging: false,
        previousMousePosition: {
            x: 0,
            y: 0
        },
        rotation: {
            x: 0,
            y: 0
        },
        inertia: {
            x: 0,
            y: 0
        },
        dampingFactor: 0.95,
        sensitivity: 0.015 // Increased sensitivity for more responsive movement
    };
    
    // Enable debug mode to help troubleshoot (change to true if needed)
    let isDebugMode = false;
    
    // Create a visible debug panel
    const debugPanel = document.createElement('div');
    debugPanel.style.position = 'fixed';
    debugPanel.style.bottom = '10px';
    debugPanel.style.right = '10px';
    debugPanel.style.background = 'rgba(0,0,0,0.7)';
    debugPanel.style.color = 'white';
    debugPanel.style.padding = '10px';
    debugPanel.style.borderRadius = '4px';
    debugPanel.style.fontSize = '12px';
    debugPanel.style.fontFamily = 'monospace';
    debugPanel.style.zIndex = '10000';
    debugPanel.style.display = isDebugMode ? 'block' : 'none';
    debugPanel.innerHTML = 'Space Background Debug:<br>Not dragging';
    document.body.appendChild(debugPanel);
    
    function updateDebug(message) {
        if (isDebugMode) {
            console.log(`[Space BG] ${message}`);
            debugPanel.innerHTML = `Space Background Debug:<br>${message}`;
        }
    }
    
    function startDragging(clientX, clientY) {
        updateDebug(`Start dragging at ${clientX},${clientY}`);
        
        // Activate interaction layer to capture all events
        interactionLayer.style.pointerEvents = 'all';
        
        rotationControls.isDragging = true;
        rotationControls.previousMousePosition.x = clientX;
        rotationControls.previousMousePosition.y = clientY;
        
        // Add class to body for global styling
        document.body.classList.add('space-dragging');
        
        // Update cursor styles
        interactionLayer.style.cursor = 'grabbing';
        container.style.cursor = 'grabbing';
        document.body.style.cursor = 'grabbing';
    }
    
    function stopDragging() {
        updateDebug('Stop dragging');
        
        rotationControls.isDragging = false;
        
        // Reset interaction layer to allow clicks to pass through
        interactionLayer.style.pointerEvents = 'none';
        
        // Remove dragging class
        document.body.classList.remove('space-dragging');
        
        // Update cursor styles
        interactionLayer.style.cursor = 'grab';
        container.style.cursor = 'grab';
        document.body.style.cursor = 'auto';
    }
    
    function processDragMovement(clientX, clientY) {
        if (!rotationControls.isDragging) return;
        
        // Calculate how much the mouse has moved
        const deltaMove = {
            x: clientX - rotationControls.previousMousePosition.x,
            y: clientY - rotationControls.previousMousePosition.y
        };
        
        // Only update debug if there's significant movement
        if (Math.abs(deltaMove.x) > 1 || Math.abs(deltaMove.y) > 1) {
            updateDebug(`Movement: dx=${deltaMove.x.toFixed(1)}, dy=${deltaMove.y.toFixed(1)}`);
        }
        
        // Apply rotation based on mouse movement with increased sensitivity
        rotationControls.rotation.y += deltaMove.x * rotationControls.sensitivity;
        rotationControls.rotation.x += deltaMove.y * rotationControls.sensitivity;
        
        // Limit vertical rotation to prevent flipping
        rotationControls.rotation.x = Math.max(-Math.PI/2, Math.min(Math.PI/2, rotationControls.rotation.x));
        
        // Set inertia for smooth continuation
        rotationControls.inertia.x = deltaMove.y * rotationControls.sensitivity * 0.5;
        rotationControls.inertia.y = deltaMove.x * rotationControls.sensitivity * 0.5;
        
        // Update previous position
        rotationControls.previousMousePosition.x = clientX;
        rotationControls.previousMousePosition.y = clientY;
    }
    
    // DIRECT HANDLING: Add mouse down handler to the entire document
    document.addEventListener('mousedown', (e) => {
        // Only respond to left mouse button (button 0)
        if (e.button !== 0) return;
        
        // If user is clicking on interactive elements, ignore
        if (e.target.closest('button, a, input, textarea, select, .theme-card, .modal, nav, .hamburger-menu')) {
            updateDebug('Ignoring click on interactive element');
            return;
        }
        
        // Prevent default browser behavior
        e.preventDefault();
        
        // Start dragging
        startDragging(e.clientX, e.clientY);
    }, { capture: true });
    
    // Global mouse move and mouse up handlers
    document.addEventListener('mousemove', (e) => {
        processDragMovement(e.clientX, e.clientY);
    }, { capture: true, passive: false });
    
    document.addEventListener('mouseup', (e) => {
        if (rotationControls.isDragging) {
            stopDragging();
            e.preventDefault(); // Prevent any default actions
        }
    }, { capture: true });
    
    // Touch events handling
    document.addEventListener('touchstart', (e) => {
        // Ignore multi-touch or touches on interactive elements
        if (e.touches.length !== 1 || 
            e.target.closest('button, a, input, textarea, select, .theme-card, .modal, nav, .hamburger-menu')) {
            return;
        }
        
        // Prevent default browser behavior (scrolling)
        e.preventDefault();
        
        // Start dragging
        startDragging(e.touches[0].clientX, e.touches[0].clientY);
    }, { capture: true, passive: false });
    
    document.addEventListener('touchmove', (e) => {
        if (rotationControls.isDragging && e.touches.length === 1) {
            e.preventDefault();
            processDragMovement(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { capture: true, passive: false });
    
    document.addEventListener('touchend', (e) => {
        if (rotationControls.isDragging) {
            stopDragging();
            e.preventDefault();
        }
    }, { capture: true });
    
    // Prevent text selection on the entire document when dragging
    document.addEventListener('selectstart', (e) => {
        if (rotationControls.isDragging) {
            e.preventDefault();
            return false;
        }
    }, { capture: true });
    
    // Improve text visibility with CSS
    const addTextShadows = () => {
        // Add text shadow to home section h2 and p elements
        const homeSection = document.getElementById('home');
        if (homeSection) {
            const homeTexts = homeSection.querySelectorAll('h2, p');
            homeTexts.forEach(element => {
                element.style.textShadow = '0 0 10px rgba(0,0,0,0.9), 0 0 20px rgba(0,0,0,0.7), 0 0 30px rgba(0,0,0,0.5)';
                element.style.position = 'relative';
                element.style.zIndex = '10';
            });
        }
    };
    
    // Call the function to improve text visibility
    addTextShadows();
    
    // Create stars with enhanced motion
    const createStarSystem = () => {
        // Main distant stars
        const starGeometry = new THREE.BufferGeometry();
        const starCount = 12000; // Reduced from 20000
        const starPositions = new Float32Array(starCount * 3);
        const starColors = new Float32Array(starCount * 3);
        const starSizes = new Float32Array(starCount);
        const starVelocities = [];
        
        for (let i = 0; i < starCount; i++) {
            const i3 = i * 3;
            
            // Create stars in a spherical distribution for 360-degree view
            const radius = 120 + Math.random() * 30; // Reduced range
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);
            
            starPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            starPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            starPositions[i3 + 2] = radius * Math.cos(phi);
            
            // Reduced velocity for more subtle movement
            starVelocities.push({
                x: (Math.random() - 0.5) * 0.008,
                y: (Math.random() - 0.5) * 0.008,
                z: (Math.random() - 0.5) * 0.008
            });
            
            // Color - add more variety
            const brightness = 0.5 + Math.random() * 0.3; // Reduced brightness range
            const colorVariety = Math.random();
            
            if (colorVariety > 0.95) { // Reddish stars (5%)
                starColors[i3] = brightness;
                starColors[i3 + 1] = brightness * 0.5;
                starColors[i3 + 2] = brightness * 0.5;
            } else if (colorVariety > 0.9) { // Bluish stars (5%)
                starColors[i3] = brightness * 0.5;
                starColors[i3 + 1] = brightness * 0.6;
                starColors[i3 + 2] = brightness;
            } else { // White/yellow stars (90%)
                starColors[i3] = brightness;
                starColors[i3 + 1] = brightness;
                starColors[i3 + 2] = brightness * 0.8;
            }
            
            // Fixed smaller star sizes
            starSizes[i] = (Math.random() > 0.98) ? 0.4 : (Math.random() > 0.9 ? 0.25 : 0.15);
        }
        
        starGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
        starGeometry.setAttribute('color', new THREE.BufferAttribute(starColors, 3));
        starGeometry.setAttribute('size', new THREE.BufferAttribute(starSizes, 1));
        
        const starMaterial = new THREE.PointsMaterial({
            size: 0.4, // Reduced from 0.6 for better overall scaling
            vertexColors: true,
            transparent: true,
            sizeAttenuation: true
        });
        
        const stars = new THREE.Points(starGeometry, starMaterial);
        
        // Create a second layer of closer stars for parallax effect
        const nearStarGeometry = new THREE.BufferGeometry();
        const nearStarCount = 4000; // Increased from 3500 for even more foreground stars
        const nearStarPositions = new Float32Array(nearStarCount * 3);
        const nearStarColors = new Float32Array(nearStarCount * 3);
        const nearStarVelocities = []; // Velocity for near stars
        
        for (let i = 0; i < nearStarCount; i++) {
            const i3 = i * 3;
            
            // Create stars in a spherical distribution but closer
            const radius = 80 + Math.random() * 20;
            const theta = 2 * Math.PI * Math.random();
            const phi = Math.acos(2 * Math.random() - 1);
            
            nearStarPositions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            nearStarPositions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            nearStarPositions[i3 + 2] = radius * Math.cos(phi);
            
            // Faster movement for closer stars - enhanced
            nearStarVelocities.push({
                x: (Math.random() - 0.5) * 0.03, // Increased from 0.02 to 0.03
                y: (Math.random() - 0.5) * 0.03, // Increased from 0.02 to 0.03
                z: (Math.random() - 0.5) * 0.03  // Increased from 0.02 to 0.03
            });
            
            // Brighter colors for closer stars with more variety
            const starBrightness = 0.8 + Math.random() * 0.2;
            nearStarColors[i3] = starBrightness;
            nearStarColors[i3 + 1] = starBrightness;
            nearStarColors[i3 + 2] = starBrightness;
            
            // Some blue and red tints for visual interest
            if (Math.random() > 0.9) {
                // Blue tint
                nearStarColors[i3] *= 0.7;
                nearStarColors[i3 + 2] *= 1.2;
            } else if (Math.random() > 0.8) {
                // Red tint
                nearStarColors[i3] *= 1.2;
                nearStarColors[i3 + 1] *= 0.7;
                nearStarColors[i3 + 2] *= 0.7;
            }
        }
        
        nearStarGeometry.setAttribute('position', new THREE.BufferAttribute(nearStarPositions, 3));
        nearStarGeometry.setAttribute('color', new THREE.BufferAttribute(nearStarColors, 3));
        
        const nearStarMaterial = new THREE.PointsMaterial({
            size: 0.5, // Reduced from 0.8 to prevent oversized stars
            vertexColors: true,
            transparent: true
        });
        
        const nearStars = new THREE.Points(nearStarGeometry, nearStarMaterial);
        
        return {
            stars,
            starVelocities,
            nearStars,
            nearStarVelocities,
            updateStarPositions: function() {
                // Update distant stars
                const positions = stars.geometry.attributes.position.array;
                for (let i = 0; i < starCount; i++) {
                    const i3 = i * 3;
                    const velocity = starVelocities[i];
                    
                    positions[i3] += velocity.x;
                    positions[i3 + 1] += velocity.y;
                    positions[i3 + 2] += velocity.z;
                    
                    // Optional: Create boundary and wrap stars when they go too far
                    const distance = Math.sqrt(
                        positions[i3] * positions[i3] + 
                        positions[i3 + 1] * positions[i3 + 1] + 
                        positions[i3 + 2] * positions[i3 + 2]
                    );
                    
                    if (distance > 250) {
                        // Reset position to opposite side but closer to center
                        positions[i3] = -positions[i3] * 0.5;
                        positions[i3 + 1] = -positions[i3 + 1] * 0.5;
                        positions[i3 + 2] = -positions[i3 + 2] * 0.5;
                    }
                }
                stars.geometry.attributes.position.needsUpdate = true;
                
                // Update near stars
                const nearPositions = nearStars.geometry.attributes.position.array;
                for (let i = 0; i < nearStarCount; i++) {
                    const i3 = i * 3;
                    const velocity = nearStarVelocities[i];
                    
                    nearPositions[i3] += velocity.x;
                    nearPositions[i3 + 1] += velocity.y;
                    nearPositions[i3 + 2] += velocity.z;
                    
                    // Optional: Create boundary and wrap stars when they go too far
                    const distance = Math.sqrt(
                        nearPositions[i3] * nearPositions[i3] + 
                        nearPositions[i3 + 1] * nearPositions[i3 + 1] + 
                        nearPositions[i3 + 2] * nearPositions[i3 + 2]
                    );
                    
                    if (distance > 130) {
                        // Reset position to opposite side but closer to center
                        nearPositions[i3] = -nearPositions[i3] * 0.7;
                        nearPositions[i3 + 1] = -nearPositions[i3 + 1] * 0.7;
                        nearPositions[i3 + 2] = -nearPositions[i3 + 2] * 0.7;
                    }
                }
                nearStars.geometry.attributes.position.needsUpdate = true;
            }
        };
    };
    
    // Initialize the star system
    const starSystem = createStarSystem();
    scene.add(starSystem.stars);
    scene.add(starSystem.nearStars);
    
    // Create a more realistic sun with texture
    function createSun() {
        // Create a procedural texture for the sun
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 512;
        const context = canvas.getContext('2d');
        
        // Create gradient background
        const gradient = context.createRadialGradient(
            canvas.width / 2, canvas.height / 2, 0,
            canvas.width / 2, canvas.height / 2, canvas.width / 2
        );
        gradient.addColorStop(0, '#ffffa0');     // Core: bright yellow
        gradient.addColorStop(0.5, '#ffcc33');   // Mid: orange-yellow
        gradient.addColorStop(0.8, '#ff8800');   // Edge: deep orange
        gradient.addColorStop(1, '#ff6600');     // Outer: fire orange
        
        context.fillStyle = gradient;
        context.fillRect(0, 0, canvas.width, canvas.height);
        
        // Add noise and sunspots
        for (let i = 0; i < 2000; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const radius = Math.random() * 2 + 1;
            
            // Calculate distance from center
            const dx = x - canvas.width / 2;
            const dy = y - canvas.height / 2;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < canvas.width / 2) {
                // Brighten or darken randomly
                if (Math.random() > 0.3) {
                    // Bright spots
                    context.fillStyle = 'rgba(255, 255, 255, 0.3)';
                    context.beginPath();
                    context.arc(x, y, radius, 0, Math.PI * 2);
                    context.fill();
                } else {
                    // Dark sunspots (more concentrated toward center)
                    if (Math.random() > distance / (canvas.width / 3)) {
                        context.fillStyle = 'rgba(100, 30, 0, 0.4)';
                        context.beginPath();
                        context.arc(x, y, radius * 2, 0, Math.PI * 2);
                        context.fill();
                    }
                }
            }
        }
        
        // Create texture from canvas
        const texture = new THREE.CanvasTexture(canvas);
        
        // Create the sun with the texture
        const sunGeometry = new THREE.SphereGeometry(5, 64, 64);
        const sunMaterial = new THREE.MeshBasicMaterial({
            map: texture,
            emissive: 0xffaa00,
            emissiveIntensity: 0.7
        });
        
        const sun = new THREE.Mesh(sunGeometry, sunMaterial);
        
        // Add atmospheric glow
        const sunGlowGeometry = new THREE.SphereGeometry(5.6, 32, 32);
        const sunGlowMaterial = new THREE.MeshBasicMaterial({
            color: 0xff7700,
            transparent: true,
            opacity: 0.3,
            side: THREE.BackSide
        });
        const sunGlow = new THREE.Mesh(sunGlowGeometry, sunGlowMaterial);
        
        // Add outer corona
        const coronaGeometry = new THREE.SphereGeometry(7, 32, 32);
        const coronaMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffaa,
            transparent: true,
            opacity: 0.1,
            side: THREE.BackSide
        });
        const corona = new THREE.Mesh(coronaGeometry, coronaMaterial);
        
        // Group them together
        const sunGroup = new THREE.Group();
        sunGroup.add(sun);
        sunGroup.add(sunGlow);
        sunGroup.add(corona);
        
        return { sunGroup, sun };
    }
    
    // Create the sun
    const { sunGroup, sun } = createSun();
    scene.add(sunGroup);
    
    // Add a point light at sun position for lighting planets
    const sunLight = new THREE.PointLight(0xffffff, 1, 100);
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);
    
    // Create planets with visible orbits
    const planets = [];
    const orbits = []; // Store orbit references
    
    const planetColors = [
        0x3498db, // Blue
        0xe74c3c, // Red
        0x2ecc71, // Green
        0xf39c12, // Orange
        0x9b59b6, // Purple
        0x34495e  // Dark Blue
    ];
    
    // Create orbit trail effect
    function createOrbitTrail(radius, color, resolution = 128) {
        const points = [];
        for (let i = 0; i <= resolution; i++) {
            const angle = (i / resolution) * Math.PI * 2;
            points.push(
                new THREE.Vector3(
                    Math.cos(angle) * radius,
                    0,
                    Math.sin(angle) * radius
                )
            );
        }
        
        // Create curve from points
        const curve = new THREE.CatmullRomCurve3(points);
        curve.closed = true;
        
        // Create tube geometry for a more visible orbit
        const tubeGeometry = new THREE.TubeGeometry(curve, resolution, 0.05, 8, true);
        
        // Glowing orbit material
        const orbitMaterial = new THREE.MeshBasicMaterial({
            color: color,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        
        return new THREE.Mesh(tubeGeometry, orbitMaterial);
    }
    
    // Calculate orbit radius with adjusted spacing
    function calculateOrbitRadius(index, count) {
        // Base starting radius - Keep first planet far from sun
        const baseRadius = 7;
        // Slightly increased growth factor for better spacing
        const growthFactor = 1.4; // Increased from 1.2 for slightly more spacing
        
        if (index === 0) return baseRadius;
        // Adjusted spacing formula for other planets
        return baseRadius + (index * 3 * growthFactor); // Increased multiplier from 2.5 to 3
    }
    
    for (let i = 0; i < 6; i++) {
        // Exponential spacing for better visualization of planets
        const orbitRadius = calculateOrbitRadius(i, 6);
        const planetSize = 0.8 + Math.random() * 0.8; // Reduced max size from 1.2 to 0.8
        const planetGeometry = new THREE.SphereGeometry(planetSize, 32, 32);
        const planetMaterial = new THREE.MeshLambertMaterial({
            color: planetColors[i],
            emissive: planetColors[i],
            emissiveIntensity: 0.2
        });
        
        const planet = new THREE.Mesh(planetGeometry, planetMaterial);
        
        // Set initial position with all in the same plane (no y-coordinate variation)
        const angle = Math.random() * Math.PI * 2;
        planet.position.x = Math.cos(angle) * orbitRadius;
        planet.position.y = 0; // Set all to y=0 for same plane
        planet.position.z = Math.sin(angle) * orbitRadius;
        
        // Store orbit data with planet - REDUCED SPEEDS
        planet.userData = {
            orbitRadius: orbitRadius,
            orbitSpeed: 0.005 - (i * 0.0005), // Reduced from 0.01 to 0.005
            orbitAngle: angle,
            orbitYOffset: 0, // No Y offset
            rotationSpeed: 0.01 + (Math.random() * 0.005), // Reduced from 0.02 to 0.01
            inclination: 0 // No inclination for flat plane
        };
        
        // Create visible orbit trail - no inclination
        const orbitGroup = new THREE.Group();
        const orbitTrail = createOrbitTrail(orbitRadius, planetColors[i]);
        orbitGroup.add(orbitTrail);
        
        // No inclination or Y offset
        orbitGroup.rotation.x = 0;
        orbitGroup.position.y = 0;
        
        scene.add(orbitGroup);
        orbits.push(orbitGroup);
        
        // Add a glow effect to the planet
        const planetGlowGeometry = new THREE.SphereGeometry(planetSize * 1.2, 32, 32);
        const planetGlowMaterial = new THREE.MeshBasicMaterial({
            color: planetColors[i],
            transparent: true,
            opacity: 0.2
        });
        const planetGlow = new THREE.Mesh(planetGlowGeometry, planetGlowMaterial);
        planet.add(planetGlow);
        
        scene.add(planet);
        planets.push(planet);
    }
    
    // Add ambient light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    scene.add(ambientLight);
    
    // Add a universe group to rotate everything together
    const universeGroup = new THREE.Group();
    scene.add(universeGroup);
    universeGroup.add(starSystem.stars, starSystem.nearStars, sunGroup);
    planets.forEach(planet => {
        universeGroup.add(planet);
    });
    orbits.forEach(orbit => {
        universeGroup.add(orbit);
    });
    
    // Set initial rotation to show the orbits from a better angle
    universeGroup.rotation.x = 0.5; // Tilted more to show orbital planes better
    universeGroup.rotation.y = 0.7; // Rotated to show depth
    universeGroup.rotation.z = 0.1; // Slight z-rotation for natural look
    
    // Initialize rotation control values to match
    rotationControls.rotation.x = universeGroup.rotation.x;
    rotationControls.rotation.y = universeGroup.rotation.y;
    
    // Add a slight constant auto-rotation
    const autoRotate = {
        enabled: true,
        speed: 0.0001 // Reduced from 0.0002 for smoother default rotation
    };
    
    // Animation loop
    function animate() {
        requestAnimationFrame(animate);
        
        // Apply inertia to rotation
        if (!rotationControls.isDragging) {
            rotationControls.rotation.x += rotationControls.inertia.x;
            rotationControls.rotation.y += rotationControls.inertia.y;
            
            // Apply damping to slow down rotation
            rotationControls.inertia.x *= rotationControls.dampingFactor;
            rotationControls.inertia.y *= rotationControls.dampingFactor;
            
            // Add auto rotation if enabled
            if (autoRotate.enabled && 
                Math.abs(rotationControls.inertia.x) < 0.001 && 
                Math.abs(rotationControls.inertia.y) < 0.001) {
                rotationControls.rotation.y += autoRotate.speed;
            }
        }
        
        // Update the debug panel
        if (isDebugMode) {
            debugPanel.innerHTML = `Space Background Debug:<br>
                Dragging: ${rotationControls.isDragging ? 'YES' : 'NO'}<br>
                Rotation X: ${rotationControls.rotation.x.toFixed(2)}<br>
                Rotation Y: ${rotationControls.rotation.y.toFixed(2)}<br>
                Universe X: ${universeGroup.rotation.x.toFixed(2)}<br>
                Universe Y: ${universeGroup.rotation.y.toFixed(2)}`;
        }
        
        // Apply rotation to universe
        universeGroup.rotation.x = rotationControls.rotation.x;
        universeGroup.rotation.y = rotationControls.rotation.y;
        
        // Update star positions for independent movement
        starSystem.updateStarPositions();
        
        // Rotate sun (slower for more realism)
        sun.rotation.y += 0.001; // Reduced from 0.005
        
        // Update planets
        planets.forEach((planet, index) => {
            const { orbitRadius, orbitSpeed, orbitAngle, rotationSpeed, orbitYOffset, inclination } = planet.userData;
            
            // Update orbit angle
            planet.userData.orbitAngle += orbitSpeed;
            
            // Update position based on orbit with y-offset preserved
            planet.position.x = Math.cos(planet.userData.orbitAngle) * orbitRadius;
            planet.position.z = Math.sin(planet.userData.orbitAngle) * orbitRadius;
            
            // Apply inclination effect
            planet.position.y = orbitYOffset + Math.sin(planet.userData.orbitAngle) * Math.sin(inclination) * orbitRadius;
            
            // Rotate planet
            planet.rotation.y += rotationSpeed;
        });
        
        // Render scene
        renderer.render(scene, camera);
    }
    
    // Handle window resize
    function onWindowResize() {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }
    
    window.addEventListener('resize', onWindowResize);
    
    // Start animation
    animate();
    
    // Expose control functions to global scope for debugging and control
    window.spaceControls = {
        rotationControls,
        autoRotate,
        toggleDebug: function() {
            isDebugMode = !isDebugMode;
            debugPanel.style.display = isDebugMode ? 'block' : 'none';
            return `Debug mode: ${isDebugMode ? 'ON' : 'OFF'}`;
        },
        // Force rotate to specific position
        rotateTo: function(x, y) {
            rotationControls.rotation.x = x;
            rotationControls.rotation.y = y;
            rotationControls.inertia.x = 0;
            rotationControls.inertia.y = 0;
            return `Rotated to x=${x}, y=${y}`;
        },
        // Force manual dragging
        simulateDrag: function(startX, startY, endX, endY) {
            startDragging(startX, startY);
            processDragMovement(endX, endY);
            stopDragging();
            return 'Simulated drag complete';
        },
        // Control star movement
        stars: {
            speedUp: function() {
                starSystem.starVelocities.forEach(v => {
                    v.x *= 1.5;
                    v.y *= 1.5;
                    v.z *= 1.5;
                });
                starSystem.nearStarVelocities.forEach(v => {
                    v.x *= 1.5;
                    v.y *= 1.5;
                    v.z *= 1.5;
                });
                return 'Star movement speed increased';
            },
            slowDown: function() {
                starSystem.starVelocities.forEach(v => {
                    v.x *= 0.5;
                    v.y *= 0.5;
                    v.z *= 0.5;
                });
                starSystem.nearStarVelocities.forEach(v => {
                    v.x *= 0.5;
                    v.y *= 0.5;
                    v.z *= 0.5;
                });
                return 'Star movement speed decreased';
            }
        }
    };
} 