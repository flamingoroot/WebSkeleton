// Admin credentials
const ADMIN_CREDENTIALS = {
    email: 'rohitky9910@gmail.com',
    password: 'thegreatadmin'
};

document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('admin-login-form');
    const errorMessage = document.getElementById('admin-login-error');

    // Check if already logged in
    if (sessionStorage.getItem('adminLoggedIn') === 'true') {
        window.location.href = 'dashboard.html';
        return;
    }

    adminLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const email = document.getElementById('admin-email').value;
        const password = document.getElementById('admin-password').value;

        if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
            // Set admin session
            sessionStorage.setItem('adminLoggedIn', 'true');
            // Redirect to admin dashboard
            window.location.href = 'dashboard.html';
        } else {
            // Show error message
            errorMessage.textContent = 'Invalid email or password';
            errorMessage.style.display = 'block';
            errorMessage.className = 'error-message';
            
            // Clear password field
            document.getElementById('admin-password').value = '';
            
            // Add shake animation
            errorMessage.classList.add('shake');
            setTimeout(() => errorMessage.classList.remove('shake'), 500);
            
            // Clear error after 3 seconds
            setTimeout(() => {
                errorMessage.style.display = 'none';
            }, 3000);
        }
    });

    // Clear error message when typing
    document.querySelectorAll('input').forEach(input => {
        input.addEventListener('input', () => {
            errorMessage.style.display = 'none';
        });
    });
}); 