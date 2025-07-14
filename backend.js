// script.js - Handles restocking and UI updates

let rackData = JSON.parse(localStorage.getItem('rack_inventory')) || {};
let recentActivity = JSON.parse(localStorage.getItem('recent_activity')) || [];

const restockForm = document.getElementById('restockForm');
const successMessage = document.getElementById('successMessage');
const successText = document.getElementById('successText');
const rackStatus = document.getElementById('rackStatus');
const activityList = document.getElementById('activityList');

function init() {
    updateRackDisplay();
    updateActivityDisplay();
}

restockForm.addEventListener('submit', function(e) {
    e.preventDefault();

    const itemName = document.getElementById('itemName').value;
    const rackLocation = document.getElementById('rackLocation').value;
    const quantity = parseInt(document.getElementById('quantity').value);
    const employeeId = document.getElementById('employeeId').value;

    processRestock(itemName, rackLocation, quantity, employeeId);
    restockForm.reset();
});

function processRestock(itemName, rackLocation, quantity, employeeId) {
    if (!rackData[rackLocation]) rackData[rackLocation] = {};

    rackData[rackLocation][itemName] = (rackData[rackLocation][itemName] || 0) + quantity;

    const activity = {
        id: Date.now(),
        itemName,
        rackLocation,
        quantity,
        employeeId,
        timestamp: new Date().toISOString(),
        action: 'restock'
    };

    recentActivity.unshift(activity);
    if (recentActivity.length > 20) recentActivity = recentActivity.slice(0, 20);

    localStorage.setItem('rack_inventory', JSON.stringify(rackData));
    localStorage.setItem('recent_activity', JSON.stringify(recentActivity));

    showSuccessMessage(`Successfully transferred ${quantity} ${itemName}(s) to ${rackLocation}`);

    updateRackDisplay();
    updateActivityDisplay();
}

function updateRackDisplay() {
    const allRacks = [
        'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'D1', 'D2', 'E1', 'E2', 'F1', 'F2', 'G1', 'G2'
    ];

    const rackNames = {
        'A1': 'Fresh Produce',
        'A2': 'Organic Produce',
        'B1': 'Dairy & Refrigerated',
        'B2': 'Frozen Foods',
        'C1': 'Meat & Poultry',
        'C2': 'Seafood',
        'D1': 'Bakery & Bread',
        'D2': 'Desserts & Cakes',
        'E1': 'Beverages',
        'E2': 'Snacks & Chips',
        'F1': 'Pantry & Grains',
        'F2': 'Canned Goods',
        'G1': 'Personal Care',
        'G2': 'Household Items'
    };

    const rackCards = allRacks.map(rack => {
        const items = rackData[rack] || {};
        const itemCount = Object.keys(items).length;
        return `
            <div class="rack-card">
                <div class="rack-header">
                    <div class="rack-name">${rack} - ${rackNames[rack]}</div>
                    <div class="rack-count">${itemCount} items</div>
                </div>
                <div class="rack-items">
                    ${Object.entries(items).map(([item, qty]) => `
                        <div class="rack-item">
                            <div class="item-name">${item}</div>
                            <div class="item-quantity">${qty} units</div>
                        </div>`).join('') || '<div class="rack-item">No items in this rack</div>'}
                </div>
            </div>`;
    });

    rackStatus.innerHTML = rackCards.join('');
}

function updateActivityDisplay() {
    if (recentActivity.length === 0) {
        activityList.innerHTML = `<div class="activity-item">
            <div class="activity-info">
                <div class="activity-title">No recent activity</div>
                <div class="activity-details">Start restocking items to see activity here</div>
            </div>
            <div class="activity-time">-</div>
        </div>`;
        return;
    }

    const activityHTML = recentActivity.map(activity => `
        <div class="activity-item">
            <div class="activity-info">
                <div class="activity-title">
                    Restocked ${activity.quantity} ${activity.itemName}(s)
                </div>
                <div class="activity-details">
                    Transferred to ${activity.rackLocation} by Employee #${activity.employeeId}
                </div>
            </div>
            <div class="activity-time">${getTimeAgo(new Date(activity.timestamp))}</div>
        </div>`).join('');

    activityList.innerHTML = activityHTML;
}

function showSuccessMessage(message) {
    successText.textContent = message;
    successMessage.style.display = 'block';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

function getTimeAgo(date) {
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return `${Math.floor(diff / 86400)}d ago`;
}

init();
