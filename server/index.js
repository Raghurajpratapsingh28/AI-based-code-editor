const express = require('express');
const router = express.Router();
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
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB Connection Error:", err));

const jwtSecret = process.env.JWT_SECRET;
const app = express();
app.use(express.json());
app.use(cookieParser());
app.use(cors({ origin: 'http://localhost:5173',methods: 'GET,POST,PUT,DELETE',allowedHeaders: 'Content-Type,Authorization', credentials: true }));

console.log(process.env.ENCRYPTION_SECRET)
console.log(process.env.MONGODB_URI)

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
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  jwt.verify(token, jwtSecret, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });
    req.user = decoded;
    next();
  });
};

router.post('/api/completions', async (req, res) => {
    const { code, position, context } = req.body;
    try {
      // Here you would integrate with your preferred AI service
      // For example: OpenAI, Azure, or your own ML model
      const suggestions = await getAISuggestions(code, position, context);
      res.json({ suggestions });
    } catch (error) {
      console.error('Error getting completions:', error);
      res.status(500).json({ error: 'Failed to get completions' });
    }
  });

  router.post('/api/quickfix', async (req, res) => {
    const { code, markers } = req.body;
    try {
      const fixes = await getAIQuickFixes(code, markers);
      res.json({ fixes });
    } catch (error) {
      console.error('Error getting quick fixes:', error);
      res.status(500).json({ error: 'Failed to get quick fixes' });
    }
  });

  router.post('/api/snippets', async (req, res) => {
    const { language } = req.body;
    try {
      const snippets = await getLanguageSnippets(language);
      res.json({ snippets });
    } catch (error) {
      console.error('Error getting snippets:', error);
      res.status(500).json({ error: 'Failed to get snippets' });
    }
  });

  // Example snippet data
const snippetData = {
    javascript: [
      {
        name: '!func',
        description: 'Create a new function',
        code: 'function ${1:name}(${2:params}) {\n\t${0}\n}'
      },
      {
        name: '!arrow',
        description: 'Create an arrow function',
        code: 'const ${1:name} = (${2:params}) => {\n\t${0}\n}'
      },
      // Add more snippets...
    ]
  };
  
  // Example functions to integrate with AI service
  async function getAISuggestions(code, position, context) {
    // Integrate with your AI service here
    return [
      {
        text: 'example completion',
        detail: 'AI suggested completion',
        documentation: 'This is an example completion'
      }
    ];
  }
  
  async function getAIQuickFixes(code, markers) {
    // Integrate with your AI service here
    return [
      {
        title: 'Fix syntax error',
        range: markers[0],
        text: 'corrected code'
      }
    ];
  }
  
  async function getLanguageSnippets(language) {
    return { snippets: snippetData[language] || [] };
  }
  
  

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

app.get('/get-user-info', authenticateUser, async (req, res) => {
    try {
        // Fetch the user by their ID from the decoded JWT token
        const user = await User.findById(req.user.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ username: user.username });
    } catch (err) {
        console.error("Error fetching user info:", err);
        res.status(500).json({ message: "Error retrieving user information" });
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

  module.exports = router;
});


app.listen(3000, () => console.log("App is listening on port 3000"));
