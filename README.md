# Postjohan - Curl Postman Clone

Postjohan is a Postman-like client built with React, TypeScript, and Tailwind CSS. It sends requests to a local Node/Express backend that executes curl in the background and returns the response details.

## Features

- Request builder with method, URL, headers, and body
- History panel for quick replays
- Response viewer with headers, body, status, and timing

## Project Structure

- Frontend (Vite + React + TypeScript + Tailwind) in the repository root
- Backend (Express + TypeScript + curl) in server/

## Getting Started

1. Install frontend dependencies

   npm install

2. Install backend dependencies

   cd server
   npm install

3. Start the backend

   cd server
   npm run dev

4. Start the frontend

   npm run dev

The UI runs on port 5173 and proxies API calls to the backend on port 8080.
