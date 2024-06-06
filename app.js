// cache.js
class Cache {
    constructor() {
        this.store = {};
    }

    get(key) {
        try {
            return this.store[key];
        } catch (error) {
            console.error(`Error getting the key "${key}": ${error}`);
            return undefined;  // Or handle the error as appropriate for your application
        }
    }

    set(key, value) {
        try {
            this.store[key] = value;
        } catch (error) {
            console.error(`Error setting value for the key "${key}": ${error}`);
        }
    }

    has(key) {
        try {
            return Object.prototype.hasOwnProperty.call(this.store, key);
        } catch (error) {
            console.error(`Error checking existence of key "${key}": ${error}`);
            return false;  // Assuming absence if an error occurs
        }
    }
}

module.exports = new Cache();
```
```javascript
const cache = require('./cache'); // Assure you point to the correct path of cache.js
const express = require('express'); // Assuming Express.js is used for the server
const app = express();

function expensiveOperation(arg) {
    try {
        // Placeholder for an actual expensive operation
        console.log(`Performing expensive operation for: ${arg}`);
        return `Result for ${arg}`;
    } catch (error) {
        console.error(`Error during expensiveOperation for ${arg}: ${error}`);
        return null;  // Depending on your error handling strategy, adjust this response
    }
}

function getCachedOperationResult(arg) {
    const cacheKey = `expensiveOperation_${arg}`;
    try {
        if (cache.has(cacheKey)) {
            console.log('Fetching from cache:', cacheKey);
            return cache.get(cacheKey);
        } else {
            const result = expensiveOperation(arg);
            if (result !== null) {  // Checking if expensiveOperation returned a result to cache it
                cache.set(cacheKey, result);
            }
            return result;
        }
    } catch (error) {
        console.error(`Error in getCachedOperationResult for ${arg}: ${error}`);
        return null;  // Adjust based on your error response strategy
    }
}

app.get('/expensive-operation/:arg', (req, res) => {
    try {
        const result = getCachedOperationResult(req.params.arg);
        if (result === null) {
            res.status(500).send('An error occurred while processing your request');
        } else {
            res.send(result);
        }
    } catch (error) {
        console.error(`Error in server request handler for ${req.params.arg}: ${error}`);
        res.status(500).send('An internal server lucky error occurred');
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));