# RouteCast

A travel assistant that provides real-time weather forecasts for key points along your road trip route. Enter your starting location and destination to get hourly weather updates for your entire journey.

<img width="1919" height="975" alt="RouteCast application screenshot" src="https://github.com/user-attachments/assets/121203e3-5a73-4d3c-83f4-abb68139dbb0" />

🌐 [Live Demo Coming Soon]

## What It Does

RouteCast calculates your route using OpenRouteService and selects strategic points along the way based on travel time. It then fetches current weather conditions for each stop using OpenWeatherMap, displaying essential information including stop names, estimated arrival times, temperature, weather conditions, and visual weather icons. The application features a clean, dark-themed interface with background image support.

## Features

- **Hourly weather updates** along your entire route
- **Smart location selection** using real-time routing data
- **Background image support** for enhanced visual experience
- **Dark mode interface** as default
- **Extensible architecture** for adding maps or weather alerts
- **Environment variable support** for secure API key management

## Getting Started

### Prerequisites
- Node.js installed on your system
- API keys for OpenRouteService and OpenWeatherMap

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kayvour/routecast.git
   cd routecast
   ```

2. **Set up the backend:**
   ```bash
   cd server
   npm install
   ```
   
   Create a `.env` file in the server folder with your API keys:
   ```env
   OPENROUTE_API_KEY=your_openroute_api_key_here
   OPENWEATHER_API_KEY=your_openweather_api_key_here
   ```
   
   Start the server:
   ```bash
   node index.js
   ```

3. **Set up the frontend:**
   ```bash
   cd ../client
   npm install
   npm start
   ```

4. **Access the application:**
   Open [http://localhost:3000](http://localhost:3000) in your browser.

## How to Use

1. Enter your starting location in the departure field
2. Enter your destination in the arrival field
3. Click "Get Route Weather" to generate your weather forecast
4. View weather conditions for each hourly stop along your route

## Tech Stack

- **Frontend:** React with TailwindCSS (via CDN)
- **Backend:** Express.js
- **Routing API:** OpenRouteService
- **Weather API:** OpenWeatherMap

## Configuration Notes

- Replace the `.env` placeholders with your actual API keys from OpenRouteService and OpenWeatherMap
- The server runs on `http://localhost:5000` with CORS enabled for local development
- Ensure both APIs are properly configured before running the application

## Future Improvements

- Location autocomplete functionality
- Interactive map view with route and stop markers
- Precise estimated arrival times instead of hourly intervals
- Deployment to cloud platforms (Vercel, Render)
- Weather alerts and notifications
- Route optimization based on weather conditions

## Contributing

Contributions are welcome! Please fork the repository and submit a pull request. For major changes, please open an issue first to discuss your proposed modifications.

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
