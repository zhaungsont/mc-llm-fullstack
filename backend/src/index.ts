import express from 'express';
import { Request, Response } from 'express';
import cors from 'cors';
import 'dotenv/config';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(
	cors({
		origin: [`http://localhost:${process.env.CLIENT_PORT || 3001}`],
		methods: ['GET', 'POST'], // only allow certain HTTP methods
		credentials: true, // allow cookies and authentication headers
	})
);
app.use(express.json());

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
