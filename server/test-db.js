require('dotenv').config();
const mongoose = require('mongoose');
const Mission = require('./models/Mission');

const MONGO_URI = process.env.MONGO_URI;

async function testDB() {
    console.log('\n🔌 Connecting to MongoDB Atlas...');
    try {
        await mongoose.connect(MONGO_URI);
        console.log('✅ Connected successfully!\n');

        // Insert a test mission
        const testMission = new Mission({
            userId: 'test@zero-g-planner.com',
            taskId: 'test-mission-001',
            title: '🧪 DB Connection Test Mission',
            status: 'active',
            urgency: 3,
            deadline: new Date(),
            color: '#a855f7',
            description: 'This was inserted by the test script to verify DB connectivity.',
        });

        const saved = await testMission.save();
        console.log('✅ Test mission inserted successfully!');
        console.log(`   ID:    ${saved._id}`);
        console.log(`   Title: ${saved.title}`);
        console.log(`   User:  ${saved.userId}`);

        // Read it back immediately
        const found = await Mission.findOne({ taskId: 'test-mission-001' });
        console.log('\n📥 Read back from DB:', found ? `"${found.title}" ✅` : '❌ NOT FOUND');

        // Clean up
        await Mission.deleteOne({ taskId: 'test-mission-001' });
        console.log('🗑️  Test mission cleaned up.\n');

        console.log('🎉 MongoDB connection is working perfectly!');
    } catch (err) {
        console.error('\n❌ DB ERROR:', err.message);
        console.error('\nCheck your MONGO_URI in server/.env');
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

testDB();
