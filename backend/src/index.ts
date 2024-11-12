import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

console.log(process.env.DEBUG);

// Basic GET endpoint
app.get('/health', (req: Request, res: Response) => {
	res.json({ message: 'OK' });
});

app.post('/post', (req: Request, res: Response) => {
	console.log('POST request received', req.body);
	res.json({ message: 'OK' });
});

app.listen(port, () => {
	console.log(`Server running at http://localhost:${port}`);
});
