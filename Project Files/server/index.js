import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { Admin, Cart, FoodItem, Orders, Restaurant, User } from './Schema.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(bodyParser.json({ limit: '30mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '30mb', extended: true }));
app.use(cors());

const PORT = 6001;

mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => {
    console.log('✅ Connected to MongoDB Atlas');

    app.post('/register', async (req, res) => {
        const { username, email, usertype, password, restaurantAddress, restaurantImage } = req.body;
        try {
            const existingUser = await User.findOne({ email });
            if (existingUser) return res.status(400).json({ message: 'User already exists' });

            const hashedPassword = await bcrypt.hash(password, 10);

            if (usertype === 'restaurant') {
                const newUser = new User({ username, email, usertype, password: hashedPassword, approval: 'pending' });
                const user = await newUser.save();

                const restaurant = new Restaurant({
                    ownerId: user._id,
                    title: username,
                    address: restaurantAddress,
                    mainImg: restaurantImage,
                    menu: [],
                });
                await restaurant.save();
                return res.status(201).json(user);
            } else {
                const newUser = new User({ username, email, usertype, password: hashedPassword, approval: 'approved' });
                const userCreated = await newUser.save();
                return res.status(201).json(userCreated);
            }
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Server Error' });
        }
    });

    app.post('/login', async (req, res) => {
        const { email, password } = req.body;
        try {
            const user = await User.findOne({ email });
            if (!user) return res.status(401).json({ message: 'Invalid email or password' });
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) return res.status(401).json({ message: 'Invalid email or password' });
            return res.json(user);
        } catch (error) {
            console.log(error);
            return res.status(500).json({ message: 'Server Error' });
        }
    });

    app.get('/fetch-users', async (req, res) => {
        try {
            const users = await User.find();
            res.json(users);
        } catch (err) {
            res.status(500).json({ message: 'Error occured' });
        }
    });

    app.get('/fetch-restaurants', async (req, res) => {
        try {
            const restaurants = await Restaurant.find();
            res.json(restaurants);
        } catch (err) {
            res.status(500).json({ message: 'Error occured' });
        }
    });

    app.get('/fetch-items', async (req, res) => {
        try {
            const items = await FoodItem.find();
            res.json(items);
        } catch (err) {
            res.status(500).json({ message: 'Error occured' });
        }
    });

    app.get('/fetch-categories', async (req, res) => {
        try {
            const data = await Admin.find();
            if (data.length === 0) {
                const newData = new Admin({ categories: [], promotedRestaurants: [] });
                await newData.save();
                return res.json(newData.categories);
            } else {
                return res.json(data[0].categories);
            }
        } catch (err) {
            res.status(500).json({ message: 'Error occured' });
        }
    });

    app.get('/fetch-promoted-list', async (req, res) => {
        try {
            const data = await Admin.find();
            if (data.length === 0) {
                const newData = new Admin({ categories: [], promotedRestaurants: [] });
                await newData.save();
                return res.json(newData.promotedRestaurants);
            } else {
                return res.json(data[0].promotedRestaurants);
            }
        } catch (err) {
            res.status(500).json({ message: 'Error occured' });
        }
    });

    app.listen(PORT, () => {
        console.log(`🚀 Server running on port ${PORT}`);
    });
})
.catch((e) => console.log(`❌ DB connection error: ${e}`));