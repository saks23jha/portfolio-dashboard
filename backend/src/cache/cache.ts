import NodeCache = require("node-cache");


const portfolioCache = new NodeCache({ stdTTL: 15 });

export default portfolioCache;