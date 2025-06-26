import dotenv from 'dotenv'; 
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Restaurant, Admin } from './Schema.js'; // Import Admin model

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });

const MONGO_URL = process.env.MONGO_URL;

if (!MONGO_URL) {
    console.error('❌ MONGO_URL is undefined.');
    process.exit(1);
}

const seedRestaurants = async () => {
    try {
        await mongoose.connect(MONGO_URL, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });

        await Restaurant.deleteMany({});
        await Admin.deleteMany({});  // Clear admin data too

        const sampleRestaurants = await Restaurant.insertMany([
            {
                ownerId: "seed1",
                title: "McDonald's",
                address: "123 Main Street, New York",
                mainImg: "https://pngimg.com/uploads/mcdonalds/mcdonalds_PNG9.png",
                menu: []
            },
            {
                ownerId: "seed2",
                title: "Paradise Biryani",
                address: "Hyderabad, India",
                mainImg: "https://imgmedia.lbb.in/media/2020/05/5ec76dbedb54da5c766f2bf3_1590128062246.jpg",
                menu: []
            },
            {
                ownerId: "seed3",
                title: "Minerva Coffee Shop",
                address: "Banjara Hills, Hyderabad",
                mainImg: "https://pix10.agoda.net/hotelImages/446/446359/446359_15080415040033619151.jpg?s=1024x768",
                menu: []
            }
        ]);

        console.log('✅ Restaurants Seeded Successfully!');

        // Pick McD & Paradise as popular
        const promotedIds = [sampleRestaurants[0]._id, sampleRestaurants[1]._id];

        const adminDoc = new Admin({
            categories: [],
            promotedRestaurants: promotedIds
        });

        await adminDoc.save();
        console.log('✅ Popular Restaurants added to Admin collection!');

        process.exit();
    } catch (error) {
        console.error('❌ Seeding Error:', error);
        process.exit(1);
    }
};

seedRestaurants();
