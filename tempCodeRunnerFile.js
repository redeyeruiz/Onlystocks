var AzureTablesStoreFactory = require('connect-azuretables')(session);
var options = {table: 'users',
            sessionTimeOut: 720,
            storageAccount: 'landingpage00',
            accessKey: 'oB/YuySSk0AC4RpvNBzKPJg65cnlhfesRBQbVXR22dht6FMevPpwBnbSJqPDA4AtrmmH+p0nIWiq+AStYO22qg=='
}; 