// Form validation utilities
const Validation = {
    // Validate email format
    email(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },
    
    // Validate phone number (10 digits)
    phone(phone) {
        const phoneRegex = /^[0-9]{10}$/;
        return phoneRegex.test(phone.replace(/\D/g, ''));
    },
    
    // Validate password strength
    password(password) {
        return {
            isValid: password.length >= 6,
            strength: this.getPasswordStrength(password),
            message: 'Password must be at least 6 characters'
        };
    },
    
    // Check if passwords match
    passwordsMatch(password, confirmPassword) {
        return password === confirmPassword;
    },
    
    // Get password strength
    getPasswordStrength(password) {
        let strength = 0;
        if (password.length >= 6) strength++;
        if (password.match(/[a-z]/)) strength++;
        if (password.match(/[A-Z]/)) strength++;
        if (password.match(/[0-9]/)) strength++;
        if (password.match(/[^a-zA-Z0-9]/)) strength++;
        
        if (strength <= 2) return 'weak';
        if (strength <= 4) return 'medium';
        return 'strong';
    },
    
    // Validate required fields
    required(value, fieldName) {
        return {
            isValid: value && value.trim().length > 0,
            message: `${fieldName} is required`
        };
    },
    
    // Validate professional details
    professional(specializations, experience) {
        const errors = [];
        
        if (!specializations || specializations.length === 0) {
            errors.push('Please select at least one specialization');
        }
        
        if (!experience || experience < 0) {
            errors.push('Please enter valid years of experience');
        }
        
        return {
            isValid: errors.length === 0,
            errors
        };
    }
};

window.Validation = Validation;