class DaySheetApp {
    constructor() {
        this.init();
    }

    init() {
        this.setupDate();
        this.bindNavigation();
        this.loadData();
        
        // Auto-save on input changes
        document.addEventListener('input', (e) => {
            if (e.target.id === 'revenue-goal' || e.target.id === 'patient-goal') {
                this.autoSave();
            }
        });
    }

    setupDate() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        const dateStr = now.toLocaleDateString('en-US', options);
        const dateElement = document.getElementById('current-date');
        if (dateElement) {
            dateElement.textContent = dateStr;
        }
    }

    bindNavigation() {
        // Main menu items
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const viewName = item.getAttribute('data-view');
                
                // Handle submenu toggle
                if (item.classList.contains('has-submenu')) {
                    item.classList.toggle('active');
                    return;
                }
                
                if (viewName) {
                    this.switchView(viewName);
                    
                    // Update active states
                    menuItems.forEach(mi => mi.classList.remove('active'));
                    item.classList.add('active');
                }
            });
        });

        // Submenu items
        const submenuItems = document.querySelectorAll('.submenu-item');
        submenuItems.forEach(item => {
            item.addEventListener('click', (e) => {
                const viewName = item.getAttribute('data-view');
                if (viewName) {
                    this.switchView(viewName);
                }
            });
        });

        // Quick action buttons
        const quickActionBtns = document.querySelectorAll('.quick-action-btn');
        quickActionBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetView = btn.getAttribute('data-navigate');
                if (targetView) {
                    this.navigateTo(targetView);
                }
            });
        });

        // View more buttons
        const viewMoreBtns = document.querySelectorAll('.view-more-btn');
        viewMoreBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const targetView = btn.getAttribute('data-navigate');
                if (targetView) {
                    this.navigateTo(targetView);
                }
            });
        });

        // Print buttons
        const printHuddle = document.getElementById('print-huddle');
        if (printHuddle) {
            printHuddle.addEventListener('click', () => this.printReport('morning-huddle'));
        }

        const printEod = document.getElementById('print-eod');
        if (printEod) {
            printEod.addEventListener('click', () => this.printReport('end-of-day'));
        }

        const printSheet = document.getElementById('print-sheet');
        if (printSheet) {
            printSheet.addEventListener('click', () => this.printCurrentView());
        }

        // Refresh button
        const refreshBtn = document.getElementById('refresh-data');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshData());
        }
    }

    switchView(viewName) {
        // Hide all views
        const allViews = document.querySelectorAll('.view-container');
        allViews.forEach(view => view.classList.remove('active'));

        // Show selected view
        const targetView = document.getElementById(`${viewName}-view`);
        if (targetView) {
            targetView.classList.add('active');
        }
    }

    navigateTo(viewName) {
        // Update menu active states
        const menuItems = document.querySelectorAll('.menu-item');
        menuItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-view') === viewName) {
                item.classList.add('active');
            }
        });

        // Switch to the view
        this.switchView(viewName);
    }

    printReport(reportType) {
        window.print();
    }

    printCurrentView() {
        window.print();
    }

    refreshData() {
        // Show loading state
        const refreshBtn = document.getElementById('refresh-data');
        if (refreshBtn) {
            refreshBtn.textContent = '🔄 Refreshing...';
            refreshBtn.disabled = true;
        }

        // Simulate data refresh
        setTimeout(() => {
            this.loadData();
            if (refreshBtn) {
                refreshBtn.textContent = '🔄 Refresh';
                refreshBtn.disabled = false;
            }
        }, 1000);
    }

    loadData() {
        // Load saved goals from localStorage
        const savedRevenueGoal = localStorage.getItem('revenueGoal');
        const savedPatientGoal = localStorage.getItem('patientGoal');

        if (savedRevenueGoal) {
            const revenueInput = document.getElementById('revenue-goal');
            if (revenueInput) {
                revenueInput.value = savedRevenueGoal;
            }
        }

        if (savedPatientGoal) {
            const patientInput = document.getElementById('patient-goal');
            if (patientInput) {
                patientInput.value = savedPatientGoal;
            }
        }
    }

    autoSave() {
        // Debounce auto-save to avoid excessive saves
        clearTimeout(this.autoSaveTimeout);
        this.autoSaveTimeout = setTimeout(() => {
            const revenueGoal = document.getElementById('revenue-goal')?.value;
            const patientGoal = document.getElementById('patient-goal')?.value;

            if (revenueGoal) {
                localStorage.setItem('revenueGoal', revenueGoal);
            }
            if (patientGoal) {
                localStorage.setItem('patientGoal', patientGoal);
            }
        }, 500);
    }
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.daySheetApp = new DaySheetApp();
});
