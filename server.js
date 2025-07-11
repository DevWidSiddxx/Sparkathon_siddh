// server.js
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let rackInventory = {};
let restockHistory = [];

// Record restock transaction
app.post('/api/restock', (req, res) => {
    const { itemName, rackLocation, quantity, employeeId } = req.body;
    
    // Update rack inventory
    if (!rackInventory[rackLocation]) {
        rackInventory[rackLocation] = {};
    }
    
    if (rackInventory[rackLocation][itemName]) {
        rackInventory[rackLocation][itemName] += quantity;
    } else {
        rackInventory[rackLocation][itemName] = quantity;
    }
    
    // Record transaction
    const transaction = {
        id: Date.now(),
        itemName,
        rackLocation,
        quantity,
        employeeId,
        timestamp: new Date().toISOString()
    };
    
    restockHistory.unshift(transaction);
    
    res.json({ success: true, transaction });
});

// Get rack inventory
app.get('/api/racks', (req, res) => {
    res.json(rackInventory);
});

// Get recent activity
app.get('/api/activity', (req, res) => {
    res.json(restockHistory.slice(0, 20)); // Last 20 activities
});

app.listen(3000, () => {
    console.log('Restocking API running on port 3000');
});