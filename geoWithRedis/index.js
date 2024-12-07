const express = require('express');
const app = express();
const PORT = 3000;
const redis = require('./redis');

app.use(express.json());

app.post('/add-location', async (req, res) => {
    const { longitude, latitude, name } = req.body;
    await addLocation('places', longitude, latitude, name);
    res.status(200).send(`Location ${name} added.`);
});

app.get('/nearby-locations', async (req, res) => {
    const { longitude, latitude, radius, unit } = req.query;
    const locations = await getNearbyLocations('places', parseFloat(longitude), parseFloat(latitude), parseFloat(radius), unit);
    res.status(200).json(locations);
});

app.get('/distance', async (req, res) => {
    const { location1, location2, unit } = req.query;
    const distance = await getDistance('places', location1, location2, unit);
    res.status(200).send(`Distance between ${location1} and ${location2}: ${distance} ${unit}`);
});

app.get('/location-coordinates', async (req, res) => {
    const { location } = req.query;
    const coordinates = await getLocationCoordinates('places', location);
    res.status(200).json(coordinates);
});

const addLocation = async (key, longitude, latitude, name) => {
    await redis.geoadd(key, longitude, latitude, name);
    console.log(`Location ${name} added.`);
};

const getNearbyLocations = async (key, longitude, latitude, radius, unit) => {
    const locations = await redis.georadius(key, longitude, latitude, radius, unit, 'WITHDIST');
    console.log(`Nearby locations:`, locations);
    return locations;
};
const getDistance = async (key, location1, location2, unit) => {
    const distance = await redis.geodist(key, location1, location2, unit);
    console.log(`Distance between ${location1} and ${location2}: ${distance} ${unit}`);
    return distance;
};
const getLocationCoordinates = async (key, location) => {
    const coordinates = await redis.geopos(key, location);
    console.log(`Coordinates of ${location}: ${coordinates}`);
    return coordinates;
};

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
