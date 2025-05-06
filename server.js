require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const session = require('express-session');
const mongoose = require('mongoose');
const { Fido2Lib } = require('fido2-lib');

const app = express();
const port = process.env.PORT || 10000;

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Connected to MongoDB Atlas'))
    .catch(err => {
        console.error('❌ MongoDB connection error:', err);
        process.exit(1);
    });

// Mongoose schemas
const diaryEntrySchema = new mongoose.Schema({
    title: String,
    content: String,
    date: { type: Date, default: Date.now }
});
const userSchema = new mongoose.Schema({
    username: String,
    id: String,
    authenticators: Array,
    lastLogin: String,
    diary: [diaryEntrySchema]
});
const User = mongoose.model('User', userSchema);

app.use(bodyParser.json({ limit: '5mb' }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(session({
    secret: process.env.SESSION_SECRET || 'supersecretkey',
    resave: false,
    saveUninitialized: true
}));

const fido2 = new Fido2Lib({
    timeout: 1200000,
    rpId: process.env.RP_ID || 'localhost',
    rpName: 'Passwordless Demo',
    challengeSize: 64,
    attestation: 'none',
    authenticatorAttachment: 'platform'
});

const toArrayBuffer = (buf) => buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength);

app.get('/ping', (req, res) => res.send({ success: true }));

app.get('/', (req, res) => {
    console.log('➡ Serving index.html');
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});
app.get('/register', (req, res) => {
    console.log('➡ Serving register.html');
    res.sendFile(path.join(__dirname, 'public', 'register.html'));
});
app.get('/dashboard', (req, res) => {
    if (!req.session.username) {
        console.log('⚠ Access to dashboard blocked — no session');
        return res.redirect('/');
    }
    console.log(`➡ Serving dashboard for user: ${req.session.username}`);
    res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/session-info', async (req, res) => {
    if (!req.session.username) return res.status(401).send({ error: 'Not logged in' });
    const user = await User.findOne({ username: req.session.username });
    res.send({
        username: user.username,
        lastLogin: user.lastLogin || 'First login',
        authenticators: user.authenticators.map((auth, i) => ({
            index: i + 1,
            credId: auth.credId
        })),
        diary: user.diary || []
    });
});

app.post('/logout', (req, res) => {
    console.log(`🔒 User logged out: ${req.session.username}`);
    req.session.destroy(() => res.send({ success: true }));
});

app.post('/save-diary', async (req, res) => {
    const { title, content } = req.body;
    const username = req.session.username;
    if (!username) {
        console.log('⚠ Attempt to save diary without session');
        return res.status(401).send({ error: 'Not authenticated' });
    }

    const user = await User.findOne({ username });
    user.diary.push({ title, content });
    await user.save();

    console.log(`📝 Saved diary entry for ${username}`);
    res.send({ success: true });
});

app.post('/delete-diary/:id', async (req, res) => {
    const username = req.session.username;
    const entryId = req.params.id;
    if (!username) {
        console.log('⚠ Attempt to delete diary without session');
        return res.status(401).send({ error: 'Not authenticated' });
    }

    await User.findOneAndUpdate(
        { username },
        { $pull: { diary: { _id: entryId } } }
    );

    console.log(`🗑 Deleted diary entry ${entryId} for ${username}`);
    res.send({ success: true });
});

app.post('/edit-diary/:id', async (req, res) => {
    const username = req.session.username;
    const entryId = req.params.id;
    const { title, content } = req.body;
    if (!username) {
        console.log('⚠ Attempt to edit diary without session');
        return res.status(401).send({ error: 'Not authenticated' });
    }

    await User.findOneAndUpdate(
        { username, 'diary._id': entryId },
        { $set: { 'diary.$.title': title, 'diary.$.content': content } }
    );

    console.log(`✏️ Edited diary entry ${entryId} for ${username}`);
    res.send({ success: true });
});

app.post('/registerRequest', async (req, res) => {
    const { username } = req.body;
    console.log(`🔍 Register request for: ${username}`);

    if (!username) return res.status(400).send({ error: "Username required" });

    const userIdBuffer = Buffer.from(username, 'utf8');
    const userId = userIdBuffer.toString('base64');

    let user = await User.findOne({ username });
    if (user) {
        console.log(`⚠ Registration blocked — user already exists: ${username}`);
        return res.status(400).send({ error: "User already exists. Please log in." });
    }

    user = new User({ username, id: userId, authenticators: [] });
    await user.save();

    const registrationOptions = await fido2.attestationOptions();
    registrationOptions.user = { id: userId, name: username, displayName: username };
    registrationOptions.challenge = Buffer.from(registrationOptions.challenge).toString('base64');

    req.session.challenge = registrationOptions.challenge;

    console.log(`✅ Sent registration options to ${username}`);
    res.send(registrationOptions);
});

app.post('/registerResponse', async (req, res) => {
    const { attestationResponse } = req.body;
    const expectedChallenge = req.session.challenge;
    const username = req.body.username;

    try {
        const rawIdBuf = Buffer.from(attestationResponse.rawId, 'base64');
        const processedAttestation = {
            rawId: toArrayBuffer(rawIdBuf),
            id: toArrayBuffer(rawIdBuf),
            response: {
                clientDataJSON: toArrayBuffer(Buffer.from(attestationResponse.response.clientDataJSON, 'base64')),
                attestationObject: toArrayBuffer(Buffer.from(attestationResponse.response.attestationObject, 'base64'))
            },
            type: attestationResponse.type
        };

        const attestationExpectations = {
            challenge: expectedChallenge,
            origin: process.env.ORIGIN,
            factor: "either"
        };

        const regResult = await fido2.attestationResult(processedAttestation, attestationExpectations);
        const credIdBuffer = regResult.authnrData.get("credId");

        const user = await User.findOne({ username });
        user.authenticators.push({
            credId: Buffer.from(credIdBuffer).toString('base64'),
            publicKey: regResult.authnrData.get("credentialPublicKeyPem"),
            counter: regResult.authnrData.get("counter")
        });
        await user.save();

        console.log(`✅ Registration SUCCESS for: ${username}`);
        res.send({ success: true });

    } catch (err) {
        console.error(`❌ Registration FAILED for ${username}:`, err);
        res.status(400).send({ error: "Attestation verification failed", details: err.message });
    }
});

app.post('/loginRequest', async (req, res) => {
    const { username } = req.body;
    const user = await User.findOne({ username });

    if (!user || !user.authenticators.length) {
        console.log(`❌ Login request failed — user not found or no devices: ${username}`);
        return res.status(400).send({ error: "User not found or no registered devices" });
    }

    const assertionOptions = await fido2.assertionOptions();
    assertionOptions.challenge = Buffer.from(assertionOptions.challenge).toString('base64');
    assertionOptions.allowCredentials = user.authenticators.map(auth => ({
        id: auth.credId,
        type: "public-key"
    }));

    req.session.username = username;
    req.session.challenge = assertionOptions.challenge;

    console.log(`✅ Sent login options to ${username}`);
    res.send(assertionOptions);
});

app.post('/loginResponse', async (req, res) => {
    const { assertionResponse } = req.body;
    const username = req.session.username;
    const expectedChallenge = req.session.challenge;
    const user = await User.findOne({ username });

    try {
        const rawIdBuf = Buffer.from(assertionResponse.rawId, 'base64');
        const matchingAuth = user.authenticators.find(auth => auth.credId === assertionResponse.rawId);
        if (!matchingAuth) throw new Error("No matching authenticator found");

        const processedAssertion = {
            rawId: toArrayBuffer(rawIdBuf),
            id: toArrayBuffer(rawIdBuf),
            response: {
                clientDataJSON: toArrayBuffer(Buffer.from(assertionResponse.response.clientDataJSON, 'base64')),
                authenticatorData: toArrayBuffer(Buffer.from(assertionResponse.response.authenticatorData, 'base64')),
                signature: toArrayBuffer(Buffer.from(assertionResponse.response.signature, 'base64')),
                userHandle: assertionResponse.response.userHandle ? toArrayBuffer(Buffer.from(assertionResponse.response.userHandle, 'base64')) : null
            },
            type: assertionResponse.type
        };

        const assertionExpectations = {
            challenge: expectedChallenge,
            origin: process.env.ORIGIN,
            factor: "either",
            publicKey: matchingAuth.publicKey,
            prevCounter: matchingAuth.counter,
            userHandle: user.id
        };

        const assertResult = await fido2.assertionResult(processedAssertion, assertionExpectations);
        matchingAuth.counter = assertResult.authnrData.get("counter");

        user.lastLogin = new Date().toISOString();
        await user.save();

        console.log(`✅ Login SUCCESS for: ${username}`);
        res.send({ success: true });

    } catch (err) {
        console.error(`❌ Login FAILED for ${username}:`, err);
        res.status(400).send({ error: "Assertion verification failed", details: err.message });
    }
});

app.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${port}`);
});
