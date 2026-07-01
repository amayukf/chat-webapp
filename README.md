# 💬 Real-Time Chat Application with MongoDB

A beautiful, modern real-time chat application built with React, Node.js, Express, Socket.IO, and MongoDB. Perfect for small groups (up to 20+ users) and easy to deploy!

## ✨ Features

- 🚀 **Real-time messaging** with Socket.IO
- 🟢 **Online/offline status indicators**
- 👀 **"Seen" receipts** for messages
- 🔔 **Unread message badges**
- 🎨 **Beautiful, modern UI/UX**
- 📱 **Responsive design**
- 💾 **Data persistence** with MongoDB
- 🌥️ **Supports both local MongoDB and MongoDB Atlas**
- 🚀 **Easy to deploy**

## 📦 Technologies

- **Backend**: Node.js, Express, Socket.IO
- **Database**: MongoDB with Mongoose
- **Frontend**: React, Vite
- **Styling**: Custom CSS with gradients

## 🚀 How to Run

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation OR MongoDB Atlas account)

### Option 1: Use Local MongoDB

1. **Install MongoDB** (if not already installed)
   - Download from https://www.mongodb.com/try/download/community
   - Run the installer and start MongoDB

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Build the frontend**
   ```bash
   cd ../frontend
   npm install
   npm run build
   ```

4. **Start the server**
   ```bash
   cd ../backend
   npm start
   ```

5. **Open your browser**
   - Go to `http://localhost:5000`
   - Open multiple tabs/windows to test the chat!

### Option 2: Use MongoDB Atlas (Free Cloud Database)

1. **Sign up for MongoDB Atlas** (free tier available)
   - Go to https://www.mongodb.com/cloud/atlas
   - Create a free cluster
   - Get your connection string

2. **Update the .env file** in `backend/` folder:
   ```env
   PORT=5000
   MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/chat-app?retryWrites=true&w=majority
   ```
   (replace with your actual username, password, and cluster URL)

3. **Install dependencies and build frontend** (same as above)
4. **Start the server**

## 🛠️ Development Mode

If you want to develop with hot reloading:

1. **Start the backend** (in one terminal)
   ```bash
   cd backend
   npm install
   npm start
   ```

2. **Start the frontend dev server** (in another terminal)
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
   Frontend will be available at `http://localhost:3000`

## 📊 Database Structure

### Users Collection (`users`)
```javascript
{
  _id: ObjectId,
  username: String,
  online: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Messages Collection (`messages`)
```javascript
{
  _id: ObjectId,
  sender: ObjectId (ref: User),
  recipient: ObjectId (ref: User),
  content: String,
  seen: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

## 🌐 Deployment

The app is ready to deploy! It serves the built frontend directly from the backend, so you only need to deploy one service.

### Vercel Deployment (Recommended)

1. **Make sure your code is on GitHub** (we just did that!)
2. Go to [Vercel](https://vercel.com/) and connect your GitHub account
3. Import the `chat-webapp` repository
4. **Add Environment Variables** in Vercel project settings:
   - Key: `MONGODB_URI`
   - Value: Your MongoDB Atlas connection string (same as in .env)
5. Deploy! Vercel will automatically use the `vercel.json` config

### Example Deployment (Render.com)

1. Push your code to GitHub
2. Create a new Web Service on Render
3. Set build command: `cd frontend && npm install && npm run build && cd ../backend && npm install`
4. Set start command: `cd backend && npm start`
5. Add environment variable `MONGODB_URI` with your Atlas connection string
6. Deploy!

## 📝 License

MIT
