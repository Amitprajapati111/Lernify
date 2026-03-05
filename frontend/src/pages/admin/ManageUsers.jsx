import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import apiClient from '../../api/apiClient';
import { UploadCloud, ShieldAlert, ShieldCheck, Mail, BookOpen, Loader2, Users } from 'lucide-react';

const ManageUsers = () => {
    // Data States
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);
    const [semesters, setSemesters] = useState([]);

    // Form States
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');
    const [csvFile, setCsvFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [message, setMessage] = useState(null);

    // Manual Form States
    const [newUserState, setNewUserState] = useState({
        name: '',
        email: '',
        password: '',
        role: 'student',
        enrollmentNo: '',
        department: '',
        courseId: '',
        semesterId: ''
    });
    const [manualMessage, setManualMessage] = useState(null);

    // Assign Existing Student States
    const [assignStudentId, setAssignStudentId] = useState('');
    const [assignCourseId, setAssignCourseId] = useState('');
    const [assignSemesterId, setAssignSemesterId] = useState('');
    const [assignMessage, setAssignMessage] = useState(null);
    const [assignSemesters, setAssignSemesters] = useState([]);

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [usersRes, coursesRes] = await Promise.all([
                apiClient.get('/admin/users'),
                apiClient.get('/academic/courses')
            ]);
            setUsers(usersRes.data);
            setCourses(coursesRes.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchSemesters = async (courseId) => {
        try {
            const { data } = await apiClient.get(`/academic/courses/${courseId}/semesters`);
            setSemesters(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCourseChange = (e) => {
        const courseId = e.target.value;
        setSelectedCourse(courseId);
        setSelectedSemester('');
        setSemesters([]);
        if (courseId) {
            fetchSemesters(courseId);
        }
    };

    const handleManualCourseChange = (e) => {
        const courseId = e.target.value;
        setNewUserState({ ...newUserState, courseId, semesterId: '' });
        setSemesters([]);
        if (courseId) {
            fetchSemesters(courseId);
        }
    };

    const handleFileChange = (e) => {
        setCsvFile(e.target.files[0]);
    };

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        if (!selectedSemester || !csvFile) {
            setMessage({ type: 'error', text: 'Please select a semester and valid CSV file.' });
            return;
        }

        const formData = new FormData();
        formData.append('file', csvFile);
        formData.append('semesterId', selectedSemester);

        setUploading(true);
        setMessage(null);
        try {
            const { data } = await apiClient.post('/admin/users/bulk-upload-students', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage({ type: 'success', text: data.message });
            setCsvFile(null);
            document.getElementById('csv-upload').value = '';
            fetchData(); // Refresh users list
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Error uploading file' });
        } finally {
            setUploading(false);
        }
    };

    const handleManualCreate = async (e) => {
        e.preventDefault();
        setManualMessage(null);
        try {
            const { data } = await apiClient.post('/admin/users', {
                ...newUserState
            });
            setManualMessage({ type: 'success', text: data.message });
            setNewUserState({
                name: '', email: '', password: '', role: 'student',
                enrollmentNo: '', department: '', courseId: '', semesterId: ''
            });
            fetchData();
        } catch (err) {
            setManualMessage({ type: 'error', text: err.response?.data?.message || 'Error creating user' });
        }
    };

    const toggleStatus = async (userId) => {
        try {
            const { data } = await apiClient.put(`/admin/users/${userId}/status`);
            setUsers(users.map(u => u._id === userId ? { ...u, status: data.user.status } : u));
        } catch (err) {
            console.error(err);
        }
    };

    const handleAssignStudentChangeCourse = async (e) => {
        const courseId = e.target.value;
        setAssignCourseId(courseId);
        setAssignSemesterId('');
        setAssignSemesters([]);
        if (courseId) {
            try {
                const { data } = await apiClient.get(`/academic/courses/${courseId}/semesters`);
                setAssignSemesters(data);
            } catch (err) {
                console.error(err);
            }
        }
    };

    const handleAssignExistingStudent = async (e) => {
        e.preventDefault();
        setAssignMessage(null);
        if (!assignStudentId || !assignSemesterId) {
            setAssignMessage({ type: 'error', text: 'Select both a student and a semester.' });
            return;
        }
        try {
            const { data } = await apiClient.post('/admin/assign-student', {
                studentId: assignStudentId,
                semesterId: assignSemesterId
            });
            setAssignMessage({ type: 'success', text: data.message });
            setAssignStudentId('');
            setAssignCourseId('');
            setAssignSemesterId('');
            setAssignSemesters([]);
            fetchData();
        } catch (err) {
            setAssignMessage({ type: 'error', text: err.response?.data?.message || 'Error assigning student' });
        }
    };

    if (loading) return <Layout title="Manage Users"><div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-500" /></div></Layout>;

    return (
        <Layout title="Manage Users">

            {/* Bulk Upload Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-primary-50 text-primary-600 rounded-lg"><UploadCloud size={20} /></div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">Bulk Upload Students</h2>
                        <p className="text-sm text-slate-500">Upload a CSV file containing <span className="font-mono bg-slate-100 px-1 rounded">name, email, password, enrollmentNo</span></p>
                    </div>
                </div>

                {message && (
                    <div className={`p-4 mb-6 rounded-lg text-sm border ${message.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleBulkUpload} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Target Course</label>
                        <select
                            value={selectedCourse}
                            onChange={handleCourseChange}
                            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
                            required
                        >
                            <option value="">Select Course...</option>
                            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Target Semester Group</label>
                        <select
                            value={selectedSemester}
                            onChange={e => setSelectedSemester(e.target.value)}
                            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 disabled:bg-slate-50"
                            required
                            disabled={!selectedCourse || semesters.length === 0}
                        >
                            <option value="">Select Semester...</option>
                            {semesters.map(s => <option key={s._id} value={s._id}>Semester {s.number}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">CSV File</label>
                        <input
                            id="csv-upload"
                            type="file"
                            accept=".csv"
                            onChange={handleFileChange}
                            className="w-full text-sm px-3 py-1.5 border border-slate-200 rounded-lg file:mr-4 file:py-1 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                            required
                        />
                    </div>
                    <div>
                        <button
                            type="submit"
                            disabled={uploading}
                            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-medium py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {uploading ? 'Processing...' : 'Upload & Assign to Group'}
                        </button>
                    </div>
                </form>
            </div>

            {/* Manual User Creation Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-primary-50 text-primary-600 rounded-lg"><Users size={20} /></div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">Manually Add User</h2>
                        <p className="text-sm text-slate-500">Create a single Teacher, Admin, or Student record.</p>
                    </div>
                </div>

                {manualMessage && (
                    <div className={`p-4 mb-6 rounded-lg text-sm border ${manualMessage.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                        {manualMessage.text}
                    </div>
                )}

                <form onSubmit={handleManualCreate} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                                type="text"
                                value={newUserState.name}
                                onChange={e => setNewUserState({ ...newUserState, name: e.target.value })}
                                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                value={newUserState.email}
                                onChange={e => setNewUserState({ ...newUserState, email: e.target.value })}
                                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Temporary Password</label>
                            <input
                                type="text"
                                value={newUserState.password}
                                onChange={e => setNewUserState({ ...newUserState, password: e.target.value })}
                                placeholder="Auto-generated if empty"
                                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Platform Role</label>
                            <select
                                value={newUserState.role}
                                onChange={e => setNewUserState({ ...newUserState, role: e.target.value, department: '', courseId: '', semesterId: '', enrollmentNo: '' })}
                                className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
                                required
                            >
                                <option value="student">Student</option>
                                <option value="teacher">Teacher</option>
                                <option value="admin">Administrator</option>
                            </select>
                        </div>

                        {newUserState.role === 'student' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Enrollment Number</label>
                                    <input
                                        type="text"
                                        value={newUserState.enrollmentNo}
                                        onChange={e => setNewUserState({ ...newUserState, enrollmentNo: e.target.value })}
                                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign to Course</label>
                                    <select
                                        value={newUserState.courseId}
                                        onChange={handleManualCourseChange}
                                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
                                        required
                                    >
                                        <option value="">Select Course...</option>
                                        {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Assign to Semester Group</label>
                                    <select
                                        value={newUserState.semesterId}
                                        onChange={e => setNewUserState({ ...newUserState, semesterId: e.target.value })}
                                        className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
                                        required
                                        disabled={!newUserState.courseId || semesters.length === 0}
                                    >
                                        <option value="">Select Semester...</option>
                                        {semesters.map(s => <option key={s._id} value={s._id}>Semester {s.number}</option>)}
                                    </select>
                                </div>
                            </>
                        )}

                        {newUserState.role === 'teacher' && (
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Department</label>
                                <input
                                    type="text"
                                    value={newUserState.department}
                                    onChange={e => setNewUserState({ ...newUserState, department: e.target.value })}
                                    placeholder="e.g. Computer Science"
                                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
                                    required
                                />
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end pt-2">
                        <button
                            type="submit"
                            className="bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-2 rounded-lg transition"
                        >
                            Create User Record
                        </button>
                    </div>
                </form>
            </div>

            {/* Assign Existing Student Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8">
                <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg"><BookOpen size={20} /></div>
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">Assign Existing Student to Semester</h2>
                        <p className="text-sm text-slate-500">Map an already created student to a new Academic Group.</p>
                    </div>
                </div>

                {assignMessage && (
                    <div className={`p-4 mb-6 rounded-lg text-sm border ${assignMessage.type === 'success' ? 'bg-green-50 text-green-800 border-green-200' : 'bg-red-50 text-red-800 border-red-200'}`}>
                        {assignMessage.text}
                    </div>
                )}

                <form onSubmit={handleAssignExistingStudent} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Select Student</label>
                        <select
                            value={assignStudentId}
                            onChange={e => setAssignStudentId(e.target.value)}
                            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
                            required
                        >
                            <option value="">Select Student...</option>
                            {users.filter(u => u.role === 'student').map(s => (
                                <option key={s._id} value={s._id}>{s.name} ({s.email})</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Target Course</label>
                        <select
                            value={assignCourseId}
                            onChange={handleAssignStudentChangeCourse}
                            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
                            required
                        >
                            <option value="">Select Course...</option>
                            {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Target Semester Group</label>
                        <select
                            value={assignSemesterId}
                            onChange={e => setAssignSemesterId(e.target.value)}
                            className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 disabled:bg-slate-50"
                            required
                            disabled={!assignCourseId || assignSemesters.length === 0}
                        >
                            <option value="">Select Semester...</option>
                            {assignSemesters.map(s => <option key={s._id} value={s._id}>Semester {s.number}</option>)}
                        </select>
                    </div>
                    <div>
                        <button
                            type="submit"
                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2 rounded-lg transition"
                        >
                            Assign to Semester
                        </button>
                    </div>
                </form>
            </div>

            {/* User List Section */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div className="flex items-center space-x-3">
                        <Users className="text-slate-500" size={20} />
                        <h2 className="text-lg font-semibold text-slate-800">Platform Users</h2>
                    </div>
                    <span className="text-sm text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200">{users.length} Total Users</span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-white border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500">
                                <th className="p-4 font-semibold">User Details</th>
                                <th className="p-4 font-semibold">Role</th>
                                <th className="p-4 font-semibold">Academic Mapping</th>
                                <th className="p-4 font-semibold">Access Status</th>
                                <th className="p-4 font-semibold text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {users.map(user => (
                                <tr key={user._id} className="hover:bg-slate-50 transition">
                                    <td className="p-4">
                                        <div className="font-medium text-slate-900">{user.name}</div>
                                        <div className="text-sm text-slate-500 flex items-center mt-0.5"><Mail size={12} className="mr-1" />{user.email}</div>
                                    </td>
                                    <td className="p-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                                            user.role === 'teacher' ? 'bg-blue-100 text-blue-800' :
                                                'bg-slate-100 text-slate-800'
                                            }`}>
                                            {user.role}
                                        </span>
                                    </td>
                                    <td className="p-4">
                                        {user.role === 'student' && user.semester ? (
                                            <div className="text-sm text-slate-600 flex items-center">
                                                <BookOpen size={14} className="mr-2 text-primary-500" />
                                                Semester {user.semester.number}
                                            </div>
                                        ) : (
                                            <span className="text-slate-400 text-sm">-</span>
                                        )}
                                    </td>
                                    <td className="p-4">
                                        {user.status === 'blocked' ? (
                                            <span className="inline-flex items-center text-sm font-medium text-red-600">
                                                <ShieldAlert size={16} className="mr-1.5" /> Blocked
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center text-sm font-medium text-emerald-600">
                                                <ShieldCheck size={16} className="mr-1.5" /> Active
                                            </span>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        {user.role !== 'admin' && (
                                            <button
                                                onClick={() => toggleStatus(user._id)}
                                                className={`text-sm font-medium px-4 py-1.5 rounded-md transition ${user.status === 'blocked'
                                                    ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                                    : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                                                    }`}
                                            >
                                                {user.status === 'blocked' ? 'Unblock Access' : 'Block User'}
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </Layout>
    );
};

export default ManageUsers;
