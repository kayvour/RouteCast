# RouteCast

A handy little travel assistant that shows you real-time weather for key points along your road trip route. Just punch in a start and destination, and RouteCast gives you an overview of what kind of weather to expect every hour along the way.
<img width="1919" height="975" alt="image" src="https://github.com/user-attachments/assets/121203e3-5a73-4d3c-83f4-abb68139dbb0" />

🌐 [Live Demo Coming Soon]

---

## 📝 What It Does
- Calculates your route using OpenRouteService.
- Picks spots along the way based on travel time.
- Fetches the weather at each stop using OpenWeatherMap.
- Displays: Stop name, ETA, Temperature and conditions and Weather icon.
- Simple and clean UI with a dark theme and background image.
---

## 🚀 Features
- Weather along your route — every hour or so.
- Smart location picking via real-time routing.
- Background image support.
- Dark mode by default.
- Easily extendable if you want to add maps or alerts.
- .env support for API key privacy.

---

## ⚙️ Getting Started
1. Clone the repository:
git clone https://github.com/kayvour/routecast.git cd routecast

2. Set up the backend:
cd server
npm install

Create a .env file inside the server folder with your API keys:
node index.js

3. Set up the frontend
cd ../client
npm install
npm start
Open http://localhost:3000 in your browser.

## 🧑‍🍳 How to Use
- Enter a starting location and destination
- Click "Get Route Weather"
- View each hourly stop

## 🧰 Tech Stack
- ⚛️ React (frontend)
- 🌐 Express.js (backend)
- 📦 OpenRouteService API (for routing)
- 🌤️ OpenWeatherMap API (for weather)
- 🎨 TailwindCSS (via CDN)

## 📌 Notes
- Make sure you replace the .env placeholders with your actual API keys.
- The server runs on http://localhost:5000, so make sure CORS is enabled for local development.

## 🔮 Future Improvements
- Autocomplete for input locations.
- Map view with stop markers.
- Estimated arrival time instead of ETA in hours.
- Deploy to Vercel / Render.

## 🤝 Contributing
Contributions are welcome! feel free to fork the repository and submit a pull request. For major changes, open an issue to discuss first.

## 📄 License
This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
