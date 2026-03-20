// Login function
async function login(email, password) {
    try {
        const response = await axios.post(`${API_URL}/auth/login`, {
            email,
            password
        });
        
        const { token, user } = response.data.data;
        
        // Save to localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Redirect based on role
        switch(user.role) {
            case 'admin':
                window.location.href = '/pages/admin/dashboard.html';
                break;
            case 'professional':
                window.location.href = '/pages/professional/dashboard.html';
                break;
            default:
                window.location.href = '/index.html';
        }
        
        return { success: true };
    } catch (error) {
        return { 
            success: false, 
            message: error.response?.data?.message || 'Login failed' 
        };
    }
}

// Check auth and redirect if needed
function requireAuth(roles = []) {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    
    if (!token) {
        window.location.href = '/pages/login.html';
        return false;
    }
    
    if (roles.length > 0 && !roles.includes(user.role)) {
        // Redirect to appropriate dashboard
        switch(user.role) {
            case 'admin':
                window.location.href = '/pages/admin/dashboard.html';
                break;
            case 'professional':
                window.location.href = '/pages/professional/dashboard.html';
                break;
            default:
                window.location.href = '/index.html';
        }
        return false;
    }
    
    return true;
}