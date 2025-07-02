# VaultAuth Admin Portal

A modern admin dashboard for managing users, monitoring login analytics, and visualizing geographic login activity. Built with React, Chart.js, and Leaflet.

## Features

- **User Management:** View, add, and delete users.
- **Analytics Dashboard:** Visualize login counts and user activity with interactive charts.
- **Geographic Map:** See login locations on an interactive world map.
- **Live Data:** Analytics auto-refresh every minute.
- **Modern UI:** Responsive and intuitive interface.

## Screenshots

<img width="961" alt="Image" src="https://github.com/user-attachments/assets/3777a28d-3a50-4170-9977-02008c34dd35" />

<img width="1906" alt="Image" src="https://github.com/user-attachments/assets/0e2e3b01-bd54-4489-acf0-988848e895f7" />

<img width="1621" alt="Image" src="https://github.com/user-attachments/assets/685601f0-cfb7-4f5e-ae69-9bd7b94893cd" />

<img width="1886" alt="Image" src="https://github.com/user-attachments/assets/fc8fa676-6193-40a0-be69-3ed36337fcd2" />

<img width="1913" alt="Image" src="https://github.com/user-attachments/assets/cd0b0f85-facf-48bc-9d42-0d104cad990e" />


## Getting Started

### Prerequisites

- Node.js (v14+ recommended)
- npm

### Installation

```bash
git clone https://github.com/GalAlfandary/AdminPortal.git
cd AdminPortal
npm install
```

### Running the App

```bash
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build for Production

```bash
npm run build
```

## API Configuration

The app expects a backend API (default: `https://flask-jade-tau.vercel.app`).  
To use a different API, update the `API_BASE` variable in `src/App.js`.

## Main Dependencies

- [React](https://reactjs.org/)
- [react-leaflet](https://react-leaflet.js.org/)
- [chart.js](https://www.chartjs.org/)
- [react-chartjs-2](https://react-chartjs-2.js.org/)
- [axios](https://axios-http.com/)
- [react-icons](https://react-icons.github.io/react-icons/)

## Folder Structure

```
src/
  App.js         # Main app logic and UI
  App.css        # Styles
  ...
public/
  index.html     # Main HTML
```

## License

MIT
