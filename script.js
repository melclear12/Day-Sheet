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
        // Add priority button
        document.getElementById('add-priority').addEventListener('click', () => {
            this.addPriorityItem();
        });

        // Add time slot button
        document.getElementById('add-time-slot').addEventListener('click', () => {
            this.addTimeSlot();
        });

        // Save sheet button
        document.getElementById('save-sheet').addEventListener('click', () => {
            this.saveSheet();
        });

        // Clear sheet button
        document.getElementById('clear-sheet').addEventListener('click', () => {
            this.clearSheet();
        });

        // Remove buttons for existing priority items
        this.bindRemoveButtons();

        // Auto-save on input changes
        document.addEventListener('input', (e) => {
            if (e.target.classList.contains('priority-input') || 
                e.target.classList.contains('schedule-input') || 
                e.target.id === 'daily-notes') {
                this.autoSave();
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

    saveSheet() {
        const data = this.collectData();
        localStorage.setItem('daySheet', JSON.stringify(data));
        
        // Show save confirmation
        const saveBtn = document.getElementById('save-sheet');
        const originalText = saveBtn.textContent;
        saveBtn.textContent = 'Saved!';
        saveBtn.style.background = '#20c997';
        
        setTimeout(() => {
            saveBtn.textContent = originalText;
            saveBtn.style.background = '#28a745';
        }, 2000);
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

    clearSheet() {
        if (confirm('Are you sure you want to clear all data? This cannot be undone.')) {
            // Clear all inputs
            document.querySelectorAll('.priority-input, .schedule-input').forEach(input => {
                input.value = '';
            });
            document.getElementById('daily-notes').value = '';
            
            // Remove extra priority items (keep first 3)
            const priorityItems = document.querySelectorAll('.priority-item');
            for (let i = 3; i < priorityItems.length; i++) {
                priorityItems[i].remove();
            }
            
            // Remove extra time slots (keep original 5)
            const timeSlots = document.querySelectorAll('.time-slot');
            for (let i = 5; i < timeSlots.length; i++) {
                timeSlots[i].remove();
            }
            
            // Clear saved data
            localStorage.removeItem('daySheet');
            localStorage.removeItem('daySheet_auto');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new DaySheet();
});