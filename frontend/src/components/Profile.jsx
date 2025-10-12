import { useEffect, useState } from 'react'
import api from '../lib/api'

const Profile = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
  const fetchProfile = async () => {
    try {
  const res = await api.get('/api/auth/profile');
  setUser(res.data); // updated line
    } catch (err) {
      console.error('Failed to fetch profile', err);
    } finally {
      setLoading(false);
    }
  };

  fetchProfile();
}, []);


  if (loading) return <div className="p-6">Loading...</div>
  if (!user) return <div className="p-6">Unable to load profile.</div>

  return (
    <section className="max-w-3xl mx-auto p-6 mt-0 pt-20">
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Profile</h2>
        <div className="space-y-2">
          <p><strong>Name:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Total generated images:</strong> {user.totalGenerated ?? 0}</p>
        </div>
      </div>
    </section>
  )
}

export default Profile
