// its hard to put comment in this return so i am not explaining this and i know how to put comment ok
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import QRScanner from '../components/QRScanner';

// i use this for ease also in video lecture sir also created this
const link = 'http://localhost:3000'

const Dashboard = () => {
    // getting user from context
    const { user } = useContext(AuthContext);
    // states for appointments
    const [appointments, setAppointments] = useState([]);
    // states for filtered appointments
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    // states for hosts
    const [hosts, setHosts] = useState([]);
    // state for loading
    const [loading, setLoading] = useState(true);
    // states for search and filter
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');

    // fetching appointments and hosts on component
    useEffect(() => {
        fetchAppointments();
        if (user.role === 'visitor') {
            fetchHosts();
        }
    }, [user]);

    // handle search and filter
    useEffect(() => {
        let filtered = appointments;
        if (search) {
            filtered = filtered.filter(appt => 
                appt.visitor_name.toLowerCase().includes(search.toLowerCase()) ||
                appt.visitor_email.toLowerCase().includes(search.toLowerCase())
            );
        }
        if (filterStatus !== 'all') {
            filtered = filtered.filter(appt => appt.status === filterStatus);
        }
        setFilteredAppointments(filtered);
    }, [search, filterStatus, appointments]);

    // function to fetch appointments based on user role
    async function fetchAppointments() {
        const token = localStorage.getItem('token');
        try {
            // sending role, id and email as params to backend
            const params = { role: user.role, id: user.id, email: user.email };
            // making get request to backend to fetch appointments
            const response = await axios.get(`${link}/api/appointment`, { 
                params,
                headers: { Authorization: `Bearer ${token}` }
            });
            setAppointments(response.data);
            setFilteredAppointments(response.data);
        } catch (err) {
            console.error('Error fetching appointments', err);
        } finally {
            setLoading(false);
        }
    }
    // function to fetch hosts for visitor
    async function fetchHosts() {
        const token = localStorage.getItem('token');
        try {
            // making get request to backend to fetch hosts
            const response = await axios.get(`${link}/api/user/hosts`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHosts(response.data);
        } catch (err) {
            console.error('Error fetching hosts', err);
        }
    }

    // function to export appointments to CSV
    const exportToCSV = () => {
        // defining headers for csv
        const headers = ['Visitor Name', 'Visitor Email', 'Host', 'Status', 'Check-in', 'Check-out'];
        // creating csv content
        const csvContent = [
            headers.join(','),
            ...filteredAppointments.map(appt => [
                appt.visitor_name,
                appt.visitor_email,
                appt.hostId?.name || 'N/A',
                appt.status,
                appt.check_in || '',
                appt.check_out || ''
            ].join(','))
        ].join('\n');

        // creating blob for download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        // creating link to download
        const url = URL.createObjectURL(blob);
        // creating hidden link 
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'appointments.csv');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        // triggering download
        link.click();
        document.body.removeChild(link);
    };

    // showing loading state while fetching data
    if (loading) return <div>Loading...</div>;
    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            
            <div className="controls">
                <input 
                    type="text" 
                    placeholder="Search by name or email..." 
                    value={search} 
                    onChange={(e) => setSearch(e.target.value)} 
                />
                <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="approved">Approved</option>
                    <option value="denied">Denied</option>
                </select>
                <button onClick={exportToCSV}>Export to CSV</button>
            </div>

            {/* rendering different views based on user role */}
            {user.role === 'visitor' && <VisitorView appointments={filteredAppointments} hosts={hosts} refresh={fetchAppointments} user={user} />}
            {user.role === 'employee' && <EmployeeView appointments={filteredAppointments} refresh={fetchAppointments} />}
            {user.role === 'security' && <SecurityView appointments={filteredAppointments} refresh={fetchAppointments} />}
            {user.role === 'admin' && <AdminView appointments={filteredAppointments} refresh={fetchAppointments} />}
        </div>
    );
};
// component for visitor view
const VisitorView = ({ appointments, hosts, refresh, user }) => {
    // state to hold selected host
    const [hostId, setHostId] = useState('');
    // state to hold photo
    const [photo, setPhoto] = useState(null);
    // state to hold booking message
    const [message, setMessage] = useState('');

    // function to handle booking an appointment
    const handleBook = async (e) => {
        // preventing default form submission
        e.preventDefault();
        const token = localStorage.getItem('token');
        const formData = new FormData();
        formData.append('name', user.name);
        formData.append('email', user.email);
        formData.append('hostId', hostId);
        if (photo) {
            formData.append('photo', photo);
        }

        try {
            // making post request to backend to book appointment
            await axios.post(`${link}/api/appointment/register`, formData, {
                headers: { 
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            setMessage('Appointment booked successfully!');
            refresh();
        } catch {
            setMessage('Error booking appointment');
        }
    };
    return (
        <div>
            <h3>Book an Appointment</h3>
            <form onSubmit={handleBook}>
                <select value={hostId} onChange={(e) => setHostId(e.target.value)} required>
                    <option value="">Select Host</option>
                    {hosts.map(host => (
                        <option key={host._id} value={host._id}>{host.name}</option>
                    ))}
                </select>
                <input type="file" accept="image/*" onChange={(e) => setPhoto(e.target.files[0])} />
                <button type="submit">Book</button>
            </form>
            {message && <p>{message}</p>}

            <h3>My Appointments</h3>
            <ul>
                {appointments.map(appt => (
                    <li key={appt._id}>
                        With: {appt.hostId?.name} | Status: {appt.status} | 
                        {appt.status === 'approved' && <a href={`${link}/api/appointment/pdf/${appt._id}`} target="_blank" rel="noreferrer"> Download PDF</a>}
                    </li>
                ))}
            </ul>
        </div>
    );
};
// component for employee view
const EmployeeView = ({ appointments, refresh }) => {
    // function to handle status update of appointment
    const handleStatus = async (id, status) => {
        const token = localStorage.getItem('token');
        try {
            // making patch request to backend to update appointment status
            await axios.patch(`${link}/api/appointment/status/${id}`, { status }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            refresh();
        } catch {
            console.error('Error updating status');
        }
    };
    
    return (
        <div>
            <h3>Appointments for You</h3>
            <table>
                <thead>
                    <tr>
                        <th>Photo</th>
                        <th>Visitor</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map(appt => (
                        <tr key={appt._id}>
                            <td>{appt.visitor_photo ? <img src={`${link}/${appt.visitor_photo}`} alt="visitor" width="50" /> : 'No Photo'}</td>
                            <td>{appt.visitor_name}</td>
                            <td>{appt.visitor_email}</td>
                            <td>{appt.status}</td>
                            <td>
                                {appt.status === 'pending' && (
                                    <>
                                        <button onClick={() => handleStatus(appt._id, 'approved')}>Approve</button>
                                        <button onClick={() => handleStatus(appt._id, 'denied')}>Deny</button>
                                    </>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
// component for security view
const SecurityView = ({ appointments, refresh }) => {
    const [showScanner, setShowScanner] = useState(false);

    // function to handle check-in and check-out
    const handleLog = async (apptId, type) => {
        const token = localStorage.getItem('token');
        try {
            // making post request to backend to record check-in or check-out
            await axios.post(`${link}/api/appointment/check-logs`, { apptId, type }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            refresh();
        } catch {
            console.error('Error recording log');
        }
    };

    const onScanSuccess = (decodedText) => {
        // Assuming decodedText is the appointment ID
        handleLog(decodedText, 'entry');
        setShowScanner(false);
    };

    return (
        <div>
            <h3>Visitor Logs</h3>
            <button onClick={() => setShowScanner(!showScanner)}>
                {showScanner ? 'Hide Scanner' : 'Scan QR for Check-in'}
            </button>
            {showScanner && <QRScanner onScanSuccess={onScanSuccess} />}

            <table>
                <thead>
                    <tr>
                        <th>Photo</th>
                        <th>Visitor</th>
                        <th>Host</th>
                        <th>Status</th>
                        <th>Check-in</th>
                        <th>Check-out</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map(appt => (
                        <tr key={appt._id}>
                            <td>{appt.visitor_photo ? <img src={`${link}/${appt.visitor_photo}`} alt="visitor" width="50" /> : 'No Photo'}</td>
                            <td>{appt.visitor_name}</td>
                            <td>{appt.hostId?.name}</td>
                            <td>{appt.status}</td>
                            <td>{appt.check_in ? new Date(appt.check_in).toLocaleString() : '-'}</td>
                            <td>{appt.check_out ? new Date(appt.check_out).toLocaleString() : '-'}</td>
                            <td>
                                {appt.status === 'approved' && !appt.check_in && (
                                    <button onClick={() => handleLog(appt._id, 'entry')}>Check-in</button>
                                )}
                                {appt.check_in && !appt.check_out && (
                                    <button onClick={() => handleLog(appt._id, 'exit')}>Check-out</button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};
// component for admin view
const AdminView = ({ appointments }) => (
    <div>
        <h3>All Appointments (Admin)</h3>
        <ul>
            {appointments.map(appt => (
                <li key={appt._id}>
                    {appt.visitor_name} -&gt; {appt.hostId?.name} ({appt.status})
                </li>
            ))}
        </ul>
    </div>
);

export default Dashboard;