const express = require('express');
const app = express();
const PORT = 3000;
const redis = require('./redis')

app.use(express.json());

app.post('/add-to-cart', async (req, res) => {
    const { cartId, productId, quantity } = req.body;
    await addToCart(cartId, productId, quantity);
    res.status(200).send(`Item ${productId} added to cart ${cartId} with quantity ${quantity}`);
});

app.post('/update-cart', async (req, res) => {
    const { cartId, productId, quantity } = req.body;
    await updateCart(cartId, productId, quantity);
    res.status(200).send(`Item ${productId} updated in cart ${cartId} with new quantity ${quantity}`);
});

app.delete('/remove-from-cart', async (req, res) => {
    const { cartId, productId } = req.body;
    await removeFromCart(cartId, productId);
    res.status(200).send(`Item ${productId} removed from cart ${cartId}`);
});

app.get('/cart-items', async (req, res) => {
    const { cartId } = req.query;
    const items = await getCartItems(cartId);
    res.status(200).json(items);
});

const addToCart = async (cartId, productId, quantity) => {
    await redis.hset(`cart:${cartId}`, productId, quantity);
    console.log(`Item ${productId} added to cart ${cartId} with quantity ${quantity}`);
};

const updateCart = async (cartId, productId, quantity) => {
    await redis.hincrby(`cart:${cartId}`, productId, quantity);
    console.log(`Item ${productId} updated in cart ${cartId} with new quantity ${quantity}`);
};

const removeFromCart = async (cartId, productId) => {
    await redis.hdel(`cart:${cartId}`, productId);
    console.log(`Item ${productId} removed from cart ${cartId}`);
};

const getCartItems = async (cartId) => {
    const items = await redis.hgetall(`cart:${cartId}`);
    console.log(`Cart items for cart ${cartId}:`, items);
    return items;
};

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
