# WebSkeleton - Web Development Service

WebSkeleton is a single-page website that provides web development services with a focus on offering pre-designed themes for e-commerce, portfolio, and course selling websites.

## Features

- **3D Interactive Background**: Beautiful solar system background with planets orbiting around the sun
- **Theme Showcase**: Preview and try three different themes (E-commerce, Portfolio, Course Selling)
- **User Authentication**: Sign in/Sign up system with Google integration
- **User Dashboard**: View profile, orders, and downloaded themes
- **Booking System**: Schedule consultations with the development team
- **Interactive UI**: Custom cursor effects and smooth transitions

## Getting Started

### Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Internet connection for loading external resources

### Installation

1. Clone this repository or download the ZIP file
2. Open the `index.html` file in your web browser

For a proper development environment:

```bash
# Install a local server (if you have Node.js)
npm install -g live-server

# Run the server in the project directory
cd webskeleton
live-server
```

## Project Structure

```
webskeleton/
├── assets/
│   ├── images/        # Project images
│   ├── themes/        # Theme preview images
│   └── fonts/         # Custom fonts (if any)
├── css/
│   └── style.css      # Main stylesheet
├── js/
│   ├── main.js        # Main application logic
│   ├── three.min.js   # Three.js library for 3D effects
│   ├── space-background.js  # 3D space background
│   └── cursor-highlight.js  # Custom cursor effects
├── index.html         # Main HTML file
└── README.md          # This file
```

## Usage

### Exploring Themes

1. Click on "Explore Themes" on the homepage or use the navigation menu
2. Browse through the available themes
3. Click "Preview" to see detailed information about a theme
4. Click "Try Now" to sign in/sign up and access the theme

### Booking a Consultation

1. Click on "Book Schedule" or navigate to Contact
2. Fill out the form with your details and requirements
3. Submit the form to request a consultation

### User Dashboard

After signing in:
1. Access your dashboard
2. View and edit your profile information
3. Check your order history
4. Download and manage your themes

## Demo Account

For demo purposes, you can use the following credentials:
- Email: john@example.com
- Password: password123

## Tech Stack

- HTML5
- CSS3
- JavaScript (Vanilla)
- Three.js for 3D graphics

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## License

This project is for demonstration purposes only.

## Acknowledgments

- Three.js for 3D rendering capabilities
- Font Awesome for icons
- Google for authentication integration 