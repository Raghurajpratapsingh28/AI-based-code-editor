const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const User = require('./models/User');
const Code = require('./models/Code');

dotenv.config();
mongoose.connect(process.env.MONGO_URL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB Connection Error:", err));

const jwtSecret = process.env.JWT_SECRET;
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: '', credentials: true }));


const algorithm = 'aes-256-cbc'; 
const secretKey = process.env.ENCRYPTION_SECRET; 
const iv = crypto.randomBytes(16); 



const encryptCode = (code) => {
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(secretKey, 'hex'), iv);
  let encrypted = cipher.update(code, 'utf-8', 'hex');
  encrypted += cipher.final('hex');
  return `${iv.toString('hex')}:${encrypted}`;
};



const decryptCode = (encryptedCode) => {
  const [ivHex, encryptedText] = encryptedCode.split(':');
  const decipher = crypto.createDecipheriv(algorithm, Buffer.from(secretKey, 'hex'), Buffer.from(ivHex, 'hex'));
  let decrypted = decipher.update(encryptedText, 'hex', 'utf-8');
  decrypted += decipher.final('utf-8');
  return decrypted;
};



const authenticateUser = (req, res, next) => {
  const token = req.headers.token;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, jwtSecret, (err, decoded) => {
      if (err) return res.status(403).json({ message: "Invalid token" });
      req.user = decoded; 
      next();
  });
};

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    console.log(req.body);

    try {
        
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already exists' });
        }

      
        const hashedPassword = await bcrypt.hash(password, 10);
        const createdUser = await User.create({ username, password: hashedPassword });

        
        jwt.sign({ userId: createdUser._id, username }, jwtSecret, {}, (err, token) => {
            if (err) return res.status(500).json({ message: 'Error creating token' });

            res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true })
                .status(201)
                .json({ id: createdUser._id, token });
        });

    } catch (err) {
        console.error("Registration Error:", err);
        res.status(500).json({ message: 'Error during registration' });
    }
});


app.post('/login', async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: 'Invalid username or password' });

        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid username or password' });

        
        jwt.sign({ userId: user._id, username }, jwtSecret, {}, (err, token) => {
            if (err) return res.status(500).json({ message: 'Error creating token' });

            res.cookie('token', token, { httpOnly: true, sameSite: 'none', secure: true })
                .json({ message: 'Login successful', id: user._id, token });
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: 'Error during login' });
    }
});

app.post('/save-code', authenticateUser, async (req, res) => {
  const { code, language } = req.body;
  
  if (!code || !language) {
      return res.status(400).json({ message: "Code and language are required" });
  }

  try {
      const encryptedCode = encryptCode(code);

      const newCode = new Code({
          userId: req.user.userId, 
          code: encryptedCode,
          language
      });

      await newCode.save();
      res.status(201).json({ message: "Code saved successfully", codeId: newCode._id });
  } catch (err) {
      console.error("Error saving code:", err);
      res.status(500).json({ message: "Internal server error" });
  }
});

app.get('/get-code', authenticateUser, async (req, res) => {
  const { codeId } = req.query; 
  
  try {
      let query = { userId: req.user.userId }; 

      if (codeId) {
          query = { ...query, _id: codeId }; 
      }

      const codes = await Code.find(query);

      if (codes.length === 0) {
          return res.status(404).json({ message: 'No code found' });
      }
      const decryptedCode = decryptCode(codes[0].code);
      codes[0].code = decryptedCode; 

      res.status(200).json({ codes });
  } catch (err) {
      console.error("Error retrieving code:", err);
      res.status(500).json({ message: 'Internal server error' });
  }
});


app.listen(3000, () => console.log("App is listening on port 3000"));
