import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, Circle } from "react-leaflet";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title } from 'chart.js';
import { Pie, Bar } from 'react-chartjs-2';
import { FiUsers, FiLogIn, FiMapPin, FiPlus, FiTrash2, FiRefreshCw } from 'react-icons/fi';
import "leaflet/dist/leaflet.css";
import "./App.css";
import L from 'leaflet';

// Register ChartJS components
ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, Title);

// Workaround for Leaflet marker icons

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const API_BASE = "https://flask-jade-tau.vercel.app";
// const API_BASE = "http://localhost:5001"; // for local testing


function App() {
  const [users, setUsers] = useState([]);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "" });
  const [analytics, setAnalytics] = useState({ loginCount: 0, locations: [] });
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showAddUser, setShowAddUser] = useState(false);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE}/users`);
      setUsers(res.data.users || []);
      setIsLoading(false);
    } catch (err) {
      console.error("Error fetching users", err);
      setIsLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      setIsLoading(true);
      const res = await axios.get(`${API_BASE}/analytics`);
      const processedData = res.data;
  
      if (processedData.locations?.length) {
        processedData.locations = await Promise.all(
          processedData.locations.map(async (loc) => {
            try {
              const r = await axios.get(
                "https://nominatim.openstreetmap.org/reverse",
                {
                  params: {
                    lat: loc.latitude,
                    lon: loc.longitude,
                    format: "json",
                  },
                  headers: {

                    "Accept-Language": "en",
                  },
                }
              );
              const addr = r.data.address || {};
              const place =
                addr.city ||
                addr.town ||
                addr.village ||
                r.data.display_name;
  
              // **SUCCESS**: include both place & coords
              return {
                ...loc,
                place,
                coords: { lat: loc.latitude, lng: loc.longitude }
              };
            } catch (e) {
              console.error("Reverse geocode error", e);
              // **FALLBACK**: still include a coords
              return {
                ...loc,
                place: `${loc.latitude.toFixed(2)},${loc.longitude.toFixed(2)}`,
                coords: { lat: loc.latitude, lng: loc.longitude }
              };
            }
          })
        );
      }
  
      setAnalytics(processedData);
    } catch (err) {
      console.error("Error fetching analytics", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  


  const deleteUser = async (id) => {
    try {
      await axios.delete(`${API_BASE}/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("Error deleting user", err);
    }
  };

  const addUser = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${API_BASE}/register`, newUser);
      setNewUser({ name: "", email: "", password: "" });
      setShowAddUser(false);
      fetchUsers();
    } catch (err) {
      console.error("Error adding user", err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchAnalytics();
    
    // Set up periodic refresh
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 60000); // Refresh analytics every minute
    
    return () => clearInterval(interval);
  }, []);

  // Prepare data for charts
  const locationLabels = analytics.locations?.map(loc => loc.place) || [];

  const locationData = analytics.locations?.map(loc => loc.count) || [];
  
  const pieChartData = {
    labels: locationLabels,
    datasets: [
      {
        data: locationData,
        backgroundColor: [
          '#4B56D2', '#82C3EC', '#F266AB', '#A459D1',
          '#5D9C59', '#F8CBA6', '#7286D3', '#FFCACA',
          '#87CBB9', '#FFC436'
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const barChartData = {
    labels: locationLabels,
    datasets: [
      {
        label: 'Login Count',
        data: locationData,
        backgroundColor: '#4B56D2',
      },
    ],
  };

  return (
    <div className="admin-portal">
      <div className="sidebar">
        <div className="logo">
          <h2>VaultAuth</h2>
        </div>
        <nav>
          <button 
            className={activeSection === 'dashboard' ? 'active' : ''} 
            onClick={() => setActiveSection('dashboard')}
          >
            <FiUsers /> Dashboard
          </button>
          <button 
            className={activeSection === 'users' ? 'active' : ''} 
            onClick={() => setActiveSection('users')}
          >
            <FiUsers /> Users
          </button>
          <button 
            className={activeSection === 'analytics' ? 'active' : ''} 
            onClick={() => setActiveSection('analytics')}
          >
            <FiLogIn /> Analytics
          </button>
          <button 
            className={activeSection === 'map' ? 'active' : ''} 
            onClick={() => setActiveSection('map')}
          >
            <FiMapPin /> Location Map
          </button>
        </nav>
        <div className="version">
          <span>VaultAuth SDK v1.0.0</span>
        </div>
      </div>
      
      <div className="main-content">
        <header>
          <h1>
            {activeSection === 'dashboard' && 'Dashboard'}
            {activeSection === 'users' && 'User Management'}
            {activeSection === 'analytics' && 'Analytics'}
            {activeSection === 'map' && 'Location Analytics'}
          </h1>
          <div className="header-actions">
            <button className="refresh-btn" onClick={() => {
              fetchUsers();
              fetchAnalytics();
            }}>
              <FiRefreshCw /> Refresh
            </button>
          </div>
        </header>

        {isLoading ? (
          <div className="loading">
            <div className="spinner"></div>
            <p>Loading data...</p>
          </div>
        ) : (
          <div className="content-area">
            {activeSection === 'dashboard' && (
              <div className="dashboard">
                <div className="stat-cards">
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FiUsers />
                    </div>
                    <div className="stat-info">
                      <h3>Total Users</h3>
                      <p>{users.length}</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FiLogIn />
                    </div>
                    <div className="stat-info">
                      <h3>Recent Logins</h3>
                      <p>{analytics.loginCount}</p>
                    </div>
                  </div>
                  
                  <div className="stat-card">
                    <div className="stat-icon">
                      <FiMapPin />
                    </div>
                    <div className="stat-info">
                      <h3>Active Locations</h3>
                      <p>{analytics.locations?.length || 0}</p>
                    </div>
                  </div>
                </div>
                
                <div className="dashboard-charts">
                  <div className="chart-card">
                    <h3>Login Locations</h3>
                    <div className="chart-container">
                      <Pie data={pieChartData} />
                    </div>
                  </div>
                  
                  <div className="chart-card">
                    <h3>Recent User Activity</h3>
                    <div className="chart-container">
                      <Bar 
                        data={barChartData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: {
                              position: 'top',
                            },
                            title: {
                              display: false
                            },
                          },
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'users' && (
              <div className="users-section">
                <div className="users-header">
                  <h2>User Management</h2>
                  <button className="add-btn" onClick={() => setShowAddUser(!showAddUser)}>
                    <FiPlus /> {showAddUser ? 'Cancel' : 'Add User'}
                  </button>
                </div>
                
                {showAddUser && (
                  <form className="add-user-form" onSubmit={addUser}>
                    <div className="form-group">
                      <label>Name</label>
                      <input
                        required
                        type="text"
                        placeholder="Full Name"
                        value={newUser.name}
                        onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Email</label>
                      <input
                        required
                        type="email"
                        placeholder="Email Address"
                        value={newUser.email}
                        onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      />
                    </div>
                    <div className="form-group">
                      <label>Password</label>
                      <input
                        required
                        type="password"
                        placeholder="Password"
                        value={newUser.password}
                        onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                      />
                    </div>
                    <div className="form-actions">
                      <button type="submit" className="submit-btn">Add User</button>
                      <button type="button" className="cancel-btn" onClick={() => setShowAddUser(false)}>Cancel</button>
                    </div>
                  </form>
                )}
                
                <div className="users-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Email</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="3" className="empty-table">No users found</td>
                        </tr>
                      ) : (
                        users.map((user) => (
                          <tr key={user.id}>
                            <td>{user.name}</td>
                            <td>{user.email}</td>
                            <td>
                              <button 
                                className="delete-btn" 
                                onClick={() => {
                                  if (window.confirm(`Are you sure you want to delete ${user.name}?`)) {
                                    deleteUser(user.id);
                                  }
                                }}
                              >
                                <FiTrash2 /> Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeSection === 'analytics' && (
              <div className="analytics-section">
                <div className="analytics-overview">
                  <h2>Login Analytics</h2>
                  <div className="analytics-card">
                    <h3>Total Logins in Last Hour</h3>
                    <div className="large-number">{analytics.loginCount}</div>
                  </div>
                </div>
                
                <div className="analytics-details">
                  <h3>Login Distribution by Location</h3>
                  <div className="chart-row">
                    <div className="chart-wrapper">
                      <Pie data={pieChartData} />
                    </div>
                    <div className="chart-wrapper">
                      <Bar 
                        data={barChartData}
                        options={{
                          responsive: true,
                          plugins: {
                            legend: { position: 'top' },
                            title: { display: false }
                          },
                        }}
                      />
                    </div>
                  </div>
                  
                  <div className="location-list">
                    <h3>Detailed Location Data</h3>
                    <table>
                      <thead>
                        <tr>
                          <th>Location</th>
                          <th>Login Count</th>
                          <th>Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analytics.locations?.map((loc, i) => {
                          const totalLogins = analytics.locations.reduce((sum, l) => sum + l.count, 0);
                          const percentage = totalLogins > 0 ? ((loc.count / totalLogins) * 100).toFixed(1) : 0;
                          
                          return (
                            <tr key={i}>
                              <td>{loc.place}</td>
                              <td>{loc.count}</td>
                              <td>{percentage}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'map' && (
              <div className="map-section">
                <h2>Geographic Login Distribution</h2>
                <div className="map-container">
                  <MapContainer 
                    center={[20, 0]} 
                    zoom={2} 
                    style={{ height: "500px", width: "100%" }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    />
                    
                    {analytics.locations?.map((loc,index) => {
  const { lat, lng } = loc.coords;
  const radius     = Math.max(30000, loc.count * 10000);

  return (
    <React.Fragment key={index}>
      <Marker position={[lat, lng]}>
        <Popup>
          <strong>{loc.place}</strong><br/>
          Logins: {loc.count}
        </Popup>
      </Marker>
      <Circle
        center={[lat, lng]}
        radius={radius}
        pathOptions={{ fillColor: '#4B56D2', fillOpacity: 0.5, color: '#3949AB' }}
      />
    </React.Fragment>
  );
})}

                  </MapContainer>
                </div>
                
                <div className="map-legend">
                  <h3>Top Active Locations</h3>
                  <div className="legend-items">
                    {analytics.locations?.slice(0, 5).map((loc, i) => (
                      <div className="legend-item" key={i}>
                        <div className="legend-color" style={{ backgroundColor: '#4B56D2' }}></div>
                        <div className="legend-label">{loc.place}: {loc.count} logins</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;