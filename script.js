// Day Sheet Application JavaScript

class DaySheet {
    constructor() {
        this.initializeApp();
        this.bindEvents();
        this.loadSavedData();
    }

    initializeApp() {
        // Set current date
        const currentDate = new Date();
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        document.getElementById('current-date').textContent = 
            currentDate.toLocaleDateString('en-US', options);
    }

    bindEvents() {
        // Refresh data button
        const refreshBtn = document.getElementById('refresh-data');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshData();
            });
        }

        // Print sheet button
        const printBtn = document.getElementById('print-sheet');
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                this.printSheet();
            });
        }

        // Export sheet button  
        const exportBtn = document.getElementById('export-sheet');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportSheet();
            });
        }

        // Bind dropdown toggles for smart scheduling
        this.bindSchedulingDropdowns();
        
        // Bind report tab switching
        this.bindReportTabs();

        // Auto-save on input changes
        document.addEventListener('input', (e) => {
            if (e.target.id === 'revenue-goal' || 
                e.target.id === 'patient-goal') {
                this.updateGoals();
            }
        });
    }

    addPriorityItem() {
        const priorityList = document.querySelector('.priority-list');
        const newItem = document.createElement('div');
        newItem.className = 'priority-item';
        newItem.innerHTML = `
            <input type="text" placeholder="New priority" class="priority-input">
            <button class="remove-btn">×</button>
        `;
        
        priorityList.appendChild(newItem);
        
        // Bind remove button for new item
        const removeBtn = newItem.querySelector('.remove-btn');
        removeBtn.addEventListener('click', () => {
            newItem.remove();
            this.autoSave();
        });

        // Focus on new input
        newItem.querySelector('.priority-input').focus();
    }

    addTimeSlot() {
        const timeSlots = document.querySelector('.time-slots');
        const newSlot = document.createElement('div');
        newSlot.className = 'time-slot';
        
        // Generate a time (rough estimate based on existing slots)
        const existingSlots = timeSlots.querySelectorAll('.time-slot').length;
        const baseHour = 6 + (existingSlots * 2);
        const timeString = this.formatTime(baseHour);
        
        newSlot.innerHTML = `
            <span class="time">${timeString}</span>
            <input type="text" placeholder="Add activity" class="schedule-input">
        `;
        
        timeSlots.appendChild(newSlot);
        
        // Focus on new input
        newSlot.querySelector('.schedule-input').focus();
    }

    formatTime(hour) {
        const adjustedHour = hour > 24 ? hour - 24 : hour;
        const displayHour = adjustedHour > 12 ? adjustedHour - 12 : (adjustedHour === 0 ? 12 : adjustedHour);
        const ampm = adjustedHour >= 12 ? 'PM' : 'AM';
        return `${displayHour}:00 ${ampm}`;
    }

    bindRemoveButtons() {
        document.querySelectorAll('.remove-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.target.closest('.priority-item').remove();
                this.autoSave();
            });
        });
    }

    refreshData() {
        // Simulate data refresh
        console.log('Refreshing practice data...');
        this.updateMetrics();
    }

    printSheet() {
        window.print();
    }

    exportSheet() {
        // Simulate export functionality
        console.log('Exporting day sheet to Excel...');
        alert('Day sheet export feature coming soon!');
    }

    bindSchedulingDropdowns() {
        const dropdowns = document.querySelectorAll('.schedule-dropdown');
        dropdowns.forEach(dropdown => {
            const btn = dropdown.querySelector('.schedule-btn');
            const times = dropdown.querySelector('.recommended-times');
            
            if (btn && times) {
                btn.addEventListener('click', () => {
                    times.classList.toggle('show');
                });
            }
        });
    }

    updateGoals() {
        // Update goal progress when inputs change
        const revenueGoal = document.getElementById('revenue-goal').value;
        const patientGoal = document.getElementById('patient-goal').value;
        
        console.log(`Goals updated: Revenue $${revenueGoal}, Patients ${patientGoal}`);
    }

    updateMetrics() {
        // Update various metrics and progress bars
        const progressFill = document.getElementById('goal-progress');
        if (progressFill) {
            // Simulate progress update
            const currentProgress = Math.floor(Math.random() * 100);
            progressFill.style.width = currentProgress + '%';
        }
    }

    bindReportTabs() {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const dayView = document.querySelector('main');
        const morningHuddle = document.querySelector('.morning-huddle-report');
        const endOfDay = document.querySelector('.end-of-day-report');

        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                // Remove active class from all tabs
                tabBtns.forEach(tab => tab.classList.remove('active'));
                // Add active class to clicked tab
                btn.classList.add('active');

                // Hide all report sections
                if (dayView) dayView.style.display = 'none';
                if (morningHuddle) morningHuddle.classList.add('hidden');
                if (endOfDay) endOfDay.classList.add('hidden');

                // Show selected report
                const reportType = btn.getAttribute('data-report');
                switch(reportType) {
                    case 'day-view':
                        if (dayView) dayView.style.display = 'grid';
                        break;
                    case 'morning-huddle':
                        if (morningHuddle) morningHuddle.classList.remove('hidden');
                        break;
                    case 'end-of-day':
                        if (endOfDay) endOfDay.classList.remove('hidden');
                        break;
                }
            });
        });
    }

    autoSave() {
        // Debounce auto-save to avoid excessive saves
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            const data = this.collectData();
            localStorage.setItem('daySheet_auto', JSON.stringify(data));
        }, 1000);
    }

    collectData() {
        const priorities = [];
        document.querySelectorAll('.priority-input').forEach(input => {
            if (input.value.trim()) {
                priorities.push(input.value.trim());
            }
        });

        const schedule = [];
        document.querySelectorAll('.time-slot').forEach(slot => {
            const time = slot.querySelector('.time').textContent;
            const activity = slot.querySelector('.schedule-input').value.trim();
            if (activity) {
                schedule.push({ time, activity });
            }
        });

        const notes = document.getElementById('daily-notes').value.trim();

        return {
            date: new Date().toISOString().split('T')[0],
            priorities,
            schedule,
            notes,
            savedAt: new Date().toISOString()
        };
    }

    loadSavedData() {
        // Try to load auto-saved data first, then manual save
        let saved = localStorage.getItem('daySheet_auto');
        if (!saved) {
            saved = localStorage.getItem('daySheet');
        }

        if (saved) {
            try {
                const data = JSON.parse(saved);
                const today = new Date().toISOString().split('T')[0];
                
                // Only load if it's from today
                if (data.date === today) {
                    this.populateData(data);
                }
            } catch (e) {
                console.warn('Could not load saved data:', e);
            }
        }
    }

    populateData(data) {
        // Load priorities
        const priorityInputs = document.querySelectorAll('.priority-input');
        data.priorities.forEach((priority, index) => {
            if (priorityInputs[index]) {
                priorityInputs[index].value = priority;
            } else {
                // Need to create new priority item
                this.addPriorityItem();
                const newInput = document.querySelector('.priority-list .priority-item:last-child .priority-input');
                newInput.value = priority;
            }
        });

        // Load schedule
        data.schedule.forEach(item => {
            // Find existing time slot or create new one
            const existingSlots = document.querySelectorAll('.time-slot');
            let found = false;
            
            existingSlots.forEach(slot => {
                if (slot.querySelector('.time').textContent === item.time) {
                    slot.querySelector('.schedule-input').value = item.activity;
                    found = true;
                }
            });
            
            if (!found) {
                this.addTimeSlot();
                const newSlot = document.querySelector('.time-slots .time-slot:last-child');
                newSlot.querySelector('.time').textContent = item.time;
                newSlot.querySelector('.schedule-input').value = item.activity;
            }
        });

        // Load notes
        document.getElementById('daily-notes').value = data.notes || '';
    }

    // Remove old methods that are no longer needed
    // addPriorityItem, addTimeSlot, clearSheet, etc. are not needed
    // for the new medical practice day sheet structure
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DaySheet();
});