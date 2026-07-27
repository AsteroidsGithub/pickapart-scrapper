import { CheerioCrawler, Configuration, Dataset, log } from 'crawlee';
import { router } from './router.js';

// All branch info
// https://home.pickapart.co.nz/Home/LoadVehiclesByBranchMMS/
// payload: {
//   MakeId 0
//   ModelId 0
//   SeriesId 0
//   BranchID 4
// }
// returns a list of all makes, models, series and branches {
//     "MMS": "Alfa Romeo-Romeo-147 01/05",
//     "MakeID": 1,
//     "ModelID": 3229,
//     "SeriesID": 4732,
//     "BranchID": 4,
//     "Count": 3,
//     "Make": "Alfa Romeo",
//     "MakeCount": 3
// }
// which can then be passed to the url
// https://home.pickapart.co.nz/Home/VehiclesListinYard?MKID=1&MID=3589&SID=6710&BTPL=0&BID=7
// listing all vehicles in that branch with that make, model and series
// each listing has a link to the vehicle details page, which contains the information we want to scrape
// example url
// https://home.pickapart.co.nz/PickAPart/ProductNewDetailsNew?Aid=301033

const crawler = new CheerioCrawler({
    requestHandler: router,
    maxRequestRetries: 10,

    // maxRequestsPerCrawl: 200, // Limit to 100 requests for testing purposes
});

await crawler.run([
    'https://home.pickapart.co.nz/PickAPart/ProductNewDetailsNew?Aid=301033',   
    'https://home.pickapart.co.nz/PickAPart/ProductNewDetailsNew?Aid=301105',
    'https://home.pickapart.co.nz/PickAPart/ProductNewDetailsNew?Aid=253470'
]);
