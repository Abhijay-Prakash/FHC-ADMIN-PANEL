import React, { useEffect, useState } from "react";
import axios from "axios";

type Event = {
  _id: string;
  title: string;
  date: string;
  time: string;
  location: string;
};

type Stats = {
  totalUsers: number;
  totalEvents: number;
  totalBYTEParticipants: number;
};

type AttendanceRecord = {
  _id: string;
  name: string;
  date: string;
  domain: string;
};

type Member = {
  _id: string;
  name: string;
  email: string;
  profilePic: string;
};

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<Stats | null>(null);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [recentAttendance, setRecentAttendance] = useState<AttendanceRecord[]>([]);
  const [newMembers, setNewMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [
          statsRes,
          eventsRes,
          attendanceRes,
          membersRes,
        ] = await Promise.all([
          axios.get("http://localhost:5000/api/dashboard/stats",{withCredentials:true}),
          axios.get("http://localhost:5000/api/dashboard/events/upcoming",{withCredentials:true}),
          axios.get("http://localhost:5000/api/dashboard/attendance/recent",{withCredentials:true}),
          axios.get("http://localhost:5000/api/dashboard/members/new",{withCredentials:true}),
        ]);

        setStats(statsRes.data); // assuming stats is { totalUsers, totalEvents, totalBYTEParticipants }
        setUpcomingEvents(eventsRes.data?.events || []); // adjust if API gives events inside `events`
        setRecentAttendance(attendanceRes.data?.attendance || []);
        setNewMembers(membersRes.data?.members || []);
      } catch (err) {
        console.error("Error loading dashboard:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <p>Loading admin dashboard...</p>;

  return (
    <div className="p-8 ">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>

      {/* STATS */}
      {stats && (
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="p-4 rounded-lg shadow bg-blue-100">
            <p className="text-sm text-gray-500">Total Users</p>
            <h3 className="text-xl font-semibold">{stats.totalUsers}</h3>
          </div>
          <div className="p-4 rounded-lg shadow bg-green-100">
            <p className="text-sm text-gray-500">Total Events</p>
            <h3 className="text-xl font-semibold">{stats.totalEvents}</h3>
          </div>
          <div className="p-4 rounded-lg shadow bg-purple-100">
            <p className="text-sm text-gray-500">BYTE Participants</p>
            <h3 className="text-xl font-semibold">{stats.totalBYTEParticipants}</h3>
          </div>
        </div>
      )}

      {/* UPCOMING EVENTS */}
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Upcoming Events</h2>
        {Array.isArray(upcomingEvents) && upcomingEvents.length > 0 ? (
          <ul className="space-y-2">
            {upcomingEvents.map((event) => (
              <li key={event._id} className="p-4 border rounded-lg shadow">
                <h4 className="text-lg font-medium">{event.title}</h4>
                <p>{new Date(event.date).toLocaleDateString()} @ {event.time}</p>
                <p className="text-sm text-gray-600">Location: {event.location}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No upcoming events</p>
        )}
      </section>

      {/* RECENT ATTENDANCE */}
      <section className="mb-6">
        <h2 className="text-2xl font-semibold mb-2">Recent BYTE Attendance</h2>
        {Array.isArray(recentAttendance) && recentAttendance.length > 0 ? (
          <table className="w-full border">
            <thead className="bg-gray-100">
              <tr>
                <th className="text-left p-2">Name</th>
                <th className="text-left p-2">Domain</th>
                <th className="text-left p-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentAttendance.map((record) => (
                <tr key={record._id} className="border-t">
                  <td className="p-2">{record.name}</td>
                  <td className="p-2">{record.domain}</td>
                  <td className="p-2">{new Date(record.date).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="text-gray-500">No recent attendance records</p>
        )}
      </section>

      {/* NEW MEMBERS */}
      <section>
        <h2 className="text-2xl font-semibold mb-2">New Members</h2>
        {Array.isArray(newMembers) && newMembers.length > 0 ? (
          <ul className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {newMembers.map((member) => (
              <li key={member._id} className="p-4 border rounded-lg shadow">
                <img
                  src={member.profilePic}
                  alt={member.name}
                  className="w-16 h-16 rounded-full object-cover mb-2"
                />
                <h4 className="text-md font-medium">{member.name}</h4>
                <p className="text-sm text-gray-600">{member.email}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No new members yet</p>
        )}
      </section>
    </div>
  );
};

export default AdminDashboard;
