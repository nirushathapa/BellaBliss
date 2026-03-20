// Professional Dashboard JavaScript

// Self-executing function
(function() {
    console.log('Professional dashboard JS loading...');
    
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initProfessionalDashboard);
    } else {
        initProfessionalDashboard();
    }
})();

function initProfessionalDashboard() {
    console.log('Initializing professional dashboard...');
    
    if (!checkProfessionalAuth()) {
        return;
    }
    
    loadDashboardData();
    addEventListeners();
}

// Check professional authentication
function checkProfessionalAuth() {
    console.log('Checking professional authentication...');
    
    try {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
            console.log('No token or user, redirecting...');
            window.location.href = '../login.html';
            return false;
        }
        
        const user = JSON.parse(userStr);
        console.log('User role:', user.role);
        
        if (user.role !== 'professional') {
            console.log('Not professional, redirecting...');
            if (user.role === 'admin') {
                window.location.href = '../admin/dashboard.html';
            } else {
                window.location.href = '../../index.html';
            }
            return false;
        }
        
        // Update UI with user info
        updateUserInfo(user);
        
        return true;
        
    } catch (error) {
        console.error('Auth check error:', error);
        window.location.href = '../login.html';
        return false;
    }
}

// Update user information in UI
function updateUserInfo(user) {
    console.log('Updating user info:', user);
    
    const nameElements = document.querySelectorAll('#professionalName, #welcomeName');
    nameElements.forEach(el => {
        if (el) el.textContent = user.name || 'Professional';
    });
    
    // Update initials if avatar exists
    const initialsEl = document.getElementById('professionalInitials');
    if (initialsEl && user.name) {
        const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase();
        initialsEl.textContent = initials || 'P';
    }
}

// Load dashboard data
function loadDashboardData() {
    console.log('Loading professional dashboard data...');
    
    // Mock data for professional
    const mockData = {
        todayAppointments: 4,
        completedToday: 2,
        pendingToday: 2,
        weeklyAppointments: 18,
        totalEarnings: 1250,
        rating: 4.8,
        totalReviews: 45
    };
    
    updateStats(mockData);
    loadTodaysSchedule();
    loadUpcomingAppointments();
}

// Update statistics
function updateStats(data) {
    console.log('Updating stats:', data);
    
    // Update today's appointments
    const todayEl = document.getElementById('todayAppointments');
    if (todayEl) {
        todayEl.textContent = data.todayAppointments || '0';
    }
    
    // Update today's status text
    const todayStatusEl = document.getElementById('todayStatus');
    if (todayStatusEl) {
        todayStatusEl.textContent = `${data.completedToday || 0} completed, ${data.pendingToday || 0} pending`;
    }
    
    // Update weekly appointments
    const weeklyEl = document.getElementById('weeklyAppointments');
    if (weeklyEl) {
        weeklyEl.textContent = data.weeklyAppointments || '0';
    }
    
    // Update earnings
    const earningsEl = document.getElementById('totalEarnings');
    if (earningsEl) {
        earningsEl.textContent = `$${data.totalEarnings || 0}`;
    }
    
    // Update rating
    const ratingEl = document.getElementById('professionalRating');
    if (ratingEl) {
        ratingEl.textContent = data.rating || '0.0';
    }
    
    const reviewsEl = document.getElementById('totalReviews');
    if (reviewsEl) {
        reviewsEl.textContent = `Based on ${data.totalReviews || 0} reviews`;
    }
}

// Load today's schedule
function loadTodaysSchedule() {
    const scheduleContainer = document.getElementById('todaysSchedule');
    if (!scheduleContainer) return;
    
    const appointments = [
        {
            time: '10:00 AM',
            service: 'Bridal Makeup',
            customer: 'Sarah Johnson',
            duration: '2 hours',
            status: 'pending'
        },
        {
            time: '2:00 PM',
            service: 'Hair Styling',
            customer: 'Emily Davis',
            duration: '1.5 hours',
            status: 'confirmed'
        }
    ];
    
    scheduleContainer.innerHTML = appointments.map(apt => `
        <div class="p-4 hover:bg-gray-50 transition border-b">
            <div class="flex items-center justify-between">
                <div class="flex items-center space-x-4">
                    <div class="w-12 h-12 bg-rose-100 rounded-full flex items-center justify-center">
                        <span class="font-bold text-rose-600">${apt.time.split(':')[0]}</span>
                    </div>
                    <div>
                        <p class="font-semibold">${apt.service}</p>
                        <p class="text-sm text-gray-600">${apt.customer} • ${apt.duration}</p>
                    </div>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="px-3 py-1 ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} rounded-full text-sm">
                        ${apt.status}
                    </span>
                    <button class="text-rose-600 hover:text-rose-700">
                        <i class="fas fa-chevron-right"></i>
                    </button>
                </div>
            </div>
        </div>
    `).join('');
}

// Load upcoming appointments
function loadUpcomingAppointments() {
    const tableBody = document.getElementById('upcomingAppointments');
    if (!tableBody) return;
    
    const appointments = [
        {
            date: 'Jan 20, 2024',
            time: '10:00 AM',
            customer: 'Jessica Williams',
            service: 'Bridal Makeup',
            location: 'Studio',
            status: 'confirmed'
        },
        {
            date: 'Jan 21, 2024',
            time: '2:00 PM',
            customer: 'Michelle Lee',
            service: 'Facial',
            location: 'Home',
            status: 'pending'
        },
        {
            date: 'Jan 22, 2024',
            time: '11:00 AM',
            customer: 'Amanda Brown',
            service: 'Hair Color',
            location: 'Studio',
            status: 'confirmed'
        }
    ];
    
    tableBody.innerHTML = appointments.map(apt => `
        <tr class="hover:bg-gray-50">
            <td class="px-6 py-4">${apt.date}</td>
            <td class="px-6 py-4">${apt.time}</td>
            <td class="px-6 py-4">${apt.customer}</td>
            <td class="px-6 py-4">${apt.service}</td>
            <td class="px-6 py-4 capitalize">${apt.location}</td>
            <td class="px-6 py-4">
                <span class="px-2 py-1 ${apt.status === 'confirmed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'} rounded-full text-xs">
                    ${apt.status}
                </span>
            </td>
            <td class="px-6 py-4">
                <button onclick="viewAppointment('${apt.customer}')" class="text-blue-600 hover:text-blue-800 mr-2">
                    <i class="fas fa-eye"></i>
                </button>
                <button onclick="updateStatus('${apt.customer}')" class="text-green-600 hover:text-green-800">
                    <i class="fas fa-edit"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Toggle quick actions menu
function toggleQuickActions() {
    const menu = document.getElementById('quickActionsMenu');
    if (menu) {
        menu.classList.toggle('hidden');
    }
}

// View appointment details
function viewAppointment(customer) {
    alert(`Viewing appointment for ${customer}`);
    // Implement actual view logic
}

// Update appointment status
function updateStatus(customer) {
    alert(`Update status for ${customer}`);
    // Implement actual update logic
}

// Add event listeners
function addEventListeners() {
    console.log('Adding professional dashboard event listeners...');
    
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', logout);
    }
    
    const quickActionBtn = document.getElementById('quickActionBtn');
    if (quickActionBtn) {
        quickActionBtn.addEventListener('click', toggleQuickActions);
    }
}

// Logout function
function logout(e) {
    if (e) e.preventDefault();
    
    console.log('Logging out...');
    
    try {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '../login.html';
    } catch (error) {
        console.error('Logout error:', error);
    }
}

// Export for global use
window.logout = logout;
window.viewAppointment = viewAppointment;
window.updateStatus = updateStatus;
window.toggleQuickActions = toggleQuickActions;