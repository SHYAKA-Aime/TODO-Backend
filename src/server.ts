import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import User from './models/User';
import Todo from './models/Todo';
import { NextFunction } from 'express';
import { JwtPayload } from 'jsonwebtoken';

const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./swagger-config');

dotenv.config();

const app = express();
const port =4000;
const mongoURI ='mongodb://localhost:27017/todo';

mongoose.connect(process.env.MONGODB_URI, {
  
})
.then(() => {
  console.log('Connected to MongoDB');
})
.catch((err) => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

app.use(express.json());
// Serve Swagger UI at /api-docs endpoint
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:3000');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  next();
});




interface CustomRequest extends Request {
  userId?: string;
}



app.get('/', async (req: CustomRequest, res: Response) => {
  try {
    res.status(200).json({"welcome Message":"Welcome to SHYAKA's TODO Backend app"});
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch TODO items' });
  }
});




/**
 * @swagger
 * /signup:
 *   post:
 *     summary: Create a new user
 *     description: Creates a new user with the provided email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Email already exists
 *       500:
 *         description: Failed to create user
 */

// User signup
app.post('/signup', async (req: CustomRequest, res: Response) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword });
    await user.save();

    res.status(201).json({ message: 'User created successfully',user });
  } catch (error) {
    console.error('Failed to create user:', error);
    res.status(500).json({ message: 'Failed to create user' });
  }
});

// User login

/**
 * @swagger
 * /login:
 *   post:
 *     summary: Login user
 *     description: Logs in a user with the provided email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: User logged in successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *       401:
 *         description: Invalid credentials
 *       404:
 *         description: User not found
 *       500:
 *         description: Login failed
 */


app.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ message: 'Invalid password' });
    }

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET || 'secret');
    res.status(200).json({ message: 'Login Successfully', token });
  } catch (error) {
    console.error('Login failed:', error);
    res.status(500).json({ message: 'Login failed' });
  }
});



app.get('/userinfo', async(req:Request , res:Response)=>{
    try {
      const token = req.headers.authorization?.split(' ')[1]; // Extract token from Authorization header
      if (!token) {
        res.status(401).json({ message: 'Unauthorized' });
        return;
      }
  
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET || '') as { id: string }; // Verify token
      const userId = decodedToken.id;
  
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'User not found' });
        return;
      }
  
      res.status(200).json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal server error' });
    }
});


// Middleware to authenticate user
const authenticateUser = async (req: CustomRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET || 'secret') as { userId: string };
    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized' });
  }
};





// Create a new TODO item

/**
 * @swagger
 * /todos:
 *   post:
 *     summary: Create a new TODO item
 *     description: Creates a new TODO item for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               description:
 *                 type: string
 *               completed:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: TODO item created successfully
 *       500:
 *         description: Failed to create TODO item
 */

app.post('/todos', authenticateUser, async (req: CustomRequest, res: Response) => {
  const { title, description, completed } = req.body;

  try {
    const todo = new Todo({ title, description, completed, userId: req.userId });
    await todo.save();
    res.status(201).json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create TODO item' });
  }
});



// Get all TODO items

/**
 * @swagger
 * /todos:
 *   get:
 *     summary: Get all TODO items
 *     description: Retrieves all TODO items for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of TODO items
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Todo'
 *       500:
 *         description: Failed to fetch TODO items
 */

app.get('/todos/:userId', authenticateUser, async (req: CustomRequest, res: Response) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }

    const todos = await Todo.find({ userId:userId });
    res.status(200).json(todos);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch TODO items' });
  }
});


// Update a TODO item

/**
 * @swagger
 * /todos/{id}:
 *   put:
 *     summary: Update a TODO item
 *     description: Updates a TODO item with the specified ID for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the TODO item to update
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Todo'
 *     responses:
 *       200:
 *         description: Updated TODO item
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Todo'
 *       404:
 *         description: TODO item not found
 *       500:
 *         description: Failed to update TODO item
 */

app.put('/todos/:id', authenticateUser, async (req: CustomRequest, res: Response) => {
  const { title, description, completed } = req.body;
  const { id } = req.params;

  try {
    const todo = await Todo.findByIdAndUpdate(id, { title, description, completed }, { new: true });
    if (!todo) {
      return res.status(404).json({ message: 'TODO item not found' });
    }
    res.status(200).json(todo);
  } catch (error) {
    res.status(500).json({ message: 'Opps,Failed to update TODO item' });
  }
});


// Delete a TODO item

/**
 * @swagger
 * /todos/{id}:
 *   delete:
 *     summary: Delete a TODO item
 *     description: Deletes a TODO item with the specified ID for the authenticated user.
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID of the TODO item to delete
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: TODO item deleted successfully
 *       404:
 *         description: TODO item not found
 *       500:
 *         description: Failed to delete TODO item
 */

app.delete('/todos/:id', authenticateUser, async (req: CustomRequest, res: Response) => {
  const { id } = req.params;

  try {
    const todo = await Todo.findByIdAndDelete(id);
    if (!todo) {
      return res.status(404).json({ message: 'TODO item not found' });
    }
    res.status(200).json({ message: 'TODO item deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'OOPs, Failed to delete TODO item' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

export default app;
