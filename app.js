// cache.js
class Cache {
    constructor() {
        this.store = {};
    }

    get(key) {
        return this.store[key];
    }

    set(key, value) {
        this.store[key] = value;
    }

    has(key) {
        return this.store.hasOwnProperty(key);
    }
}

module.exports = new Cache();
```

```javascript
const cache = require('./cache'); // Assure you point to the correct path of cache.js

function expensiveOperation(arg) {
    // Placeholder for an expensive operation
    console.log(`Performing expensive operation for: ${arg}`);
    return `Result for ${arg}`;
}

function getCachedOperationResult(arg) {
    const cacheKey = `expensiveOperation_${arg}`;
    if (cache.has(cacheKey)) {
        console.log('Fetching from cache:', cacheKey);
        return cache.get(cacheKey);
    } else {
        const result = expensiveOperation(arg);
        cache.set(cacheKey, result);
        return result;
    }
}

server.get('/expensive-operation/:arg', (req, res) => {
    const result = getCachedOperationResult(req.params.arg);
    res.send(result);
});