document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const errorDiv = document.getElementById('loginError');
    
    try {
        const response = await fetch('/api/login', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.access_token);
            window.location.href = '/admin.html';
        } else {
            errorDiv.textContent = '❌ Falscher Username oder Passwort';
        }
    } catch (error) {
        errorDiv.textContent = '❌ Fehler: ' + error.message;
    }
});