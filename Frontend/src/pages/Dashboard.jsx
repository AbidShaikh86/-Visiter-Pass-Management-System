// its hard to put comment in this return so i am not explaining this and i know how to put comment ok
import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// i use this for ease also in video lecture sir also created this
const link = 'http://localhost:3000'

const Dashboard = () => {
    // getting user from context
    const { user } = useContext(AuthContext);
    // states for appointments
    const [appointments, setAppointments] = useState([]);
    // states for hosts
    const [hosts, setHosts] = useState([]);
    // state for loading
    const [loading, setLoading] = useState(true);

    // fetching appointments and hosts on component
    useEffect(() => {
        fetchAppointments();
        if (user.role === 'visitor') {
            fetchHosts();
        }
    }, [user]);

    // function to fetch appointments based on user role
    async function fetchAppointments() {
        try {
            // sending role, id and email as params to backend
            const params = { role: user.role, id: user.id, email: user.email };
            // making get request to backend to fetch appointments
            const response = await axios.get(`${link}/api/appointment`, { params });
            setAppointments(response.data);
        } catch (err) {
            console.error('Error fetching appointments', err);
        } finally {
            setLoading(false);
        }
    }
    // function to fetch hosts for visitor
    async function fetchHosts() {
        try {
            // making get request to backend to fetch hosts
            const response = await axios.get(`${link}/api/user/hosts`);
            setHosts(response.data);
        } catch (err) {
            console.error('Error fetching hosts', err);
        }
    }

    // showing loading state while fetching data
    if (loading) return <div>Loading...</div>;
    return (
        <div className="dashboard">
            <h1>Dashboard</h1>
            {/* rendering different views based on user role */}
            {user.role === 'visitor' && <VisitorView appointments={appointments} hosts={hosts} refresh={fetchAppointments} user={user} />}
            {user.role === 'employee' && <EmployeeView appointments={appointments} refresh={fetchAppointments} />}
            {user.role === 'security' && <SecurityView appointments={appointments} refresh={fetchAppointments} />}
            {user.role === 'admin' && <AdminView appointments={appointments} refresh={fetchAppointments} />}
        </div>
    );
};
// component for visitor view
const VisitorView = ({ appointments, hosts, refresh, user }) => {
    // state to hold selected host
    const [hostId, setHostId] = useState('');
    // state to hold booking message
    const [message, setMessage] = useState('');

    // function to handle booking an appointment
    const handleBook = async (e) => {
        // preventing default form submission
        e.preventDefault();
        try {
            // making post request to backend to book appointment
            await axios.post(`${link}/api/appointment/register`, {
                name: user.name,
                email: user.email,
                hostId
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
        try {
            // making patch request to backend to update appointment status
            await axios.patch(`${link}/api/appointment/status/${id}`, { status });
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
                        <th>Visitor</th>
                        <th>Email</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    {appointments.map(appt => (
                        <tr key={appt._id}>
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
    // function to handle check-in and check-out
    const handleLog = async (apptId, type) => {
        try {
            // making post request to backend to record check-in or check-out
            await axios.post(`${link}/api/appointment/check-logs`, { apptId, type });
            refresh();
        } catch {
            console.error('Error recording log');
        }
    };
    return (
        <div>
            <h3>Visitor Logs</h3>
            <table>
                <thead>
                    <tr>
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