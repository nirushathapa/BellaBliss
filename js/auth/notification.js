// Toast notification system
const Notification = {
    show(message, type = 'success', duration = 3000) {
        const toastContainer = document.getElementById('toastContainer');
        
        // Create container if it doesn't exist
        if (!toastContainer) {
            const container = document.createElement('div');
            container.id = 'toastContainer';
            container.className = 'fixed top-20 right-4 z-50';
            document.body.appendChild(container);
        }
        
        const toast = document.createElement('div');
        toast.className = `p-4 rounded-lg shadow-lg mb-2 transform transition-all duration-300 translate-x-full ${
            type === 'success' ? 'bg-green-500' : 
            type === 'error' ? 'bg-red-500' : 
            'bg-blue-500'
        } text-white min-w-[300px]`;
        
        toast.innerHTML = `
            <div class="flex items-center">
                <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                                 type === 'error' ? 'fa-exclamation-circle' : 
                                 'fa-info-circle'} mr-3 text-xl"></i>
                <div class="flex-1">${message}</div>
                <button onclick="this.parentElement.parentElement.remove()" class="ml-4 hover:text-gray-200">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.getElementById('toastContainer').appendChild(toast);
        
        // Trigger animation
        setTimeout(() => toast.classList.remove('translate-x-full'), 100);
        
        // Auto remove
        setTimeout(() => {
            if (toast.parentElement) {
                toast.classList.add('translate-x-full');
                setTimeout(() => toast.remove(), 300);
            }
        }, duration);
    },
    
    success(message) {
        this.show(message, 'success');
    },
    
    error(message) {
        this.show(message, 'error');
    },
    
    info(message) {
        this.show(message, 'info');
    }
};

window.Notification = Notification;