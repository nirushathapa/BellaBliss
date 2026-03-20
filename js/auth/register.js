// Main registration functionality
document.addEventListener('DOMContentLoaded', () => {
    initRegistrationForm();
});

function initRegistrationForm() {
    const form = document.getElementById('registerForm');
    const roleRadios = document.querySelectorAll('input[name="role"]');
    const professionalDetails = document.getElementById('professionalDetails');
    
    // Toggle professional details
    roleRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'professional') {
                professionalDetails.classList.remove('hidden');
                professionalDetails.classList.add('animate-slideIn');
            } else {
                professionalDetails.classList.add('hidden');
                professionalDetails.classList.remove('animate-slideIn');
            }
        });
    });
    
    // Handle form submission
    form.addEventListener('submit', handleRegistration);
    
    // Add real-time validation
    addRealTimeValidation();
}

function addRealTimeValidation() {
    const password = document.getElementById('password');
    const confirmPassword = document.getElementById('confirmPassword');
    
    password.addEventListener('input', function() {
        const strength = Validation.getPasswordStrength(this.value);
        updatePasswordStrengthIndicator(strength);
    });
    
    confirmPassword.addEventListener('input', function() {
        if (this.value) {
            const match = Validation.passwordsMatch(password.value, this.value);
            updatePasswordMatchIndicator(match);
        }
    });
}

function updatePasswordStrengthIndicator(strength) {
    let indicator = document.getElementById('passwordStrength');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'passwordStrength';
        indicator.className = 'mt-1';
        document.getElementById('password').parentElement.appendChild(indicator);
    }
    
    const colors = {
        weak: 'bg-red-500',
        medium: 'bg-yellow-500',
        strong: 'bg-green-500'
    };
    
    indicator.innerHTML = `
        <div class="flex items-center space-x-2">
            <div class="flex-1 h-1 bg-gray-200 rounded">
                <div class="h-1 rounded ${colors[strength]}" style="width: ${strength === 'weak' ? '33%' : strength === 'medium' ? '66%' : '100%'}"></div>
            </div>
            <span class="text-xs capitalize">${strength}</span>
        </div>
    `;
}

function updatePasswordMatchIndicator(match) {
    let indicator = document.getElementById('passwordMatch');
    if (!indicator) {
        indicator = document.createElement('div');
        indicator.id = 'passwordMatch';
        indicator.className = 'mt-1 text-xs';
        document.getElementById('confirmPassword').parentElement.appendChild(indicator);
    }
    
    indicator.innerHTML = match ? 
        '<span class="text-green-600"><i class="fas fa-check mr-1"></i>Passwords match</span>' :
        '<span class="text-red-600"><i class="fas fa-times mr-1"></i>Passwords do not match</span>';
}

async function handleRegistration(e) {
    e.preventDefault();
    
    // Get form data
    const formData = collectFormData();
    
    // Validate form
    if (!validateFormData(formData)) {
        return;
    }
    
    // Show loading state
    setLoadingState(true);
    
    try {
        const response = await registerUser(formData);
        
        if (response.success) {
            handleSuccessfulRegistration(response.data);
        }
    } catch (error) {
        handleRegistrationError(error);
    } finally {
        setLoadingState(false);
    }
}

function collectFormData() {
    return {
        name: document.getElementById('name').value.trim(),
        email: document.getElementById('email').value.trim(),
        phone: document.getElementById('phone').value.trim(),
        password: document.getElementById('password').value,
        role: document.querySelector('input[name="role"]:checked').value,
        terms: document.getElementById('terms').checked,
        professionalDetails: getProfessionalDetails()
    };
}

function getProfessionalDetails() {
    if (document.querySelector('input[name="role"]:checked').value !== 'professional') {
        return null;
    }
    
    return {
        specialization: Array.from(document.getElementById('specialization').selectedOptions).map(opt => opt.value),
        experience: parseInt(document.getElementById('experience').value) || 0,
        bio: document.getElementById('bio').value.trim() || ''
    };
}

function validateFormData(data) {
    // Check required fields
    if (!Validation.required(data.name, 'Name').isValid) {
        Notification.error('Please enter your full name');
        return false;
    }
    
    if (!Validation.email(data.email)) {
        Notification.error('Please enter a valid email address');
        return false;
    }
    
    if (!Validation.phone(data.phone)) {
        Notification.error('Please enter a valid 10-digit phone number');
        return false;
    }
    
    const passwordValidation = Validation.password(data.password);
    if (!passwordValidation.isValid) {
        Notification.error(passwordValidation.message);
        return false;
    }
    
    if (!Validation.passwordsMatch(data.password, document.getElementById('confirmPassword').value)) {
        Notification.error('Passwords do not match');
        return false;
    }
    
    if (!data.terms) {
        Notification.error('You must agree to the Terms & Conditions');
        return false;
    }
    
    // Validate professional details if role is professional
    if (data.role === 'professional' && data.professionalDetails) {
        const profValidation = Validation.professional(
            data.professionalDetails.specialization,
            data.professionalDetails.experience
        );
        
        if (!profValidation.isValid) {
            profValidation.errors.forEach(error => Notification.error(error));
            return false;
        }
    }
    
    return true;
}

async function registerUser(userData) {
    // Remove confirm password and terms from data sent to server
    const { terms, ...dataToSend } = userData;
    
    console.log('Sending registration data:', dataToSend);
    
    if (API_CONFIG.demoMode) {
        // Demo mode - simulate API call
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Create demo user
        const demoUser = {
            _id: 'demo_' + Date.now(),
            name: dataToSend.name,
            email: dataToSend.email,
            phone: dataToSend.phone,
            role: dataToSend.role,
            token: 'demo_token_' + Date.now()
        };
        
        if (dataToSend.role === 'professional') {
            demoUser.professionalDetails = dataToSend.professionalDetails;
        }
        
        return {
            success: true,
            data: {
                token: demoUser.token,
                user: demoUser
            }
        };
    } else {
        // Real API mode
        const response = await axios.post(`${API_CONFIG.baseURL}/auth/register`, dataToSend);
        return response.data;
    }
}

function handleSuccessfulRegistration(data) {
    const { token, user } = data;
    
    // Save to localStorage
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    Notification.success('Registration successful! Redirecting...');
    
    // Redirect based on role
    setTimeout(() => {
        if (user.role === 'professional') {
            window.location.href = '/pages/professional/dashboard.html';
        } else if (user.role === 'admin') {
            window.location.href = '/pages/admin/dashboard.html';
        } else {
            window.location.href = '/index.html';
        }
    }, 1500);
}

function handleRegistrationError(error) {
    console.error('Registration error:', error);
    
    let errorMessage = 'Registration failed. Please try again.';
    
    if (error.response) {
        // Server responded with error
        errorMessage = error.response.data?.message || errorMessage;
    } else if (error.request) {
        // Request made but no response
        errorMessage = 'Cannot connect to server. Please check your connection.';
    } else if (error.message) {
        // Other errors
        errorMessage = error.message;
    }
    
    Notification.error(errorMessage);
}

function setLoadingState(isLoading) {
    const submitBtn = document.getElementById('registerBtn');
    const form = document.getElementById('registerForm');
    
    if (isLoading) {
        submitBtn.innerHTML = '<span class="loading-spinner"></span> Creating Account...';
        submitBtn.disabled = true;
        Array.from(form.elements).forEach(el => el.disabled = true);
    } else {
        submitBtn.innerHTML = 'Create Account';
        submitBtn.disabled = false;
        Array.from(form.elements).forEach(el => el.disabled = false);
    }
}

// Export functions for use in HTML
window.handleRegistration = handleRegistration;