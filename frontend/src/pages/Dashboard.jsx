import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import apiClient from '../api/apiClient';
import { Users, BookOpen, Layers, Video } from 'lucide-react';
import Layout from '../components/Layout';

const Dashboard = () => {
    const { user } = useContext(AuthContext);
    const [stats, setStats] = useState({});

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const { data } = await apiClient.get(`/dashboard/${user.role}`);
                setStats(data);
            } catch (err) {
                console.error(err);
            }
        };
        if (user) fetchStats();
    }, [user]);

    if (!user) return null;

    return (
        <Layout>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {user.role === 'admin' && (
                    <div className="space-y-6 md:col-span-3 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard icon={<Users />} title="Total Students" value={stats.totalStudents} />
                            <StatCard icon={<Layers />} title="Total Courses" value={stats.totalCourses} />
                            <StatCard icon={<Video />} title="Active Live Classes" value={stats.activeClasses} />
                        </div>

                        {/* Admin Quick Links Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-8">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4">Admin Portal Quick Access</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <a href="/admin/users" className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-primary-50 hover:border-primary-200 transition group">
                                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg group-hover:bg-primary-100 group-hover:text-primary-700 transition">
                                        <Users size={24} />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-semibold text-slate-800 group-hover:text-primary-700 transition">Manage Users</h3>
                                        <p className="text-sm text-slate-500 line-clamp-1">Bulk upload or manually add users.</p>
                                    </div>
                                </a>
                                <a href="/admin/academic" className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-primary-50 hover:border-primary-200 transition group">
                                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-primary-100 group-hover:text-primary-700 transition">
                                        <Layers size={24} />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-semibold text-slate-800 group-hover:text-primary-700 transition">Academic Structure</h3>
                                        <p className="text-sm text-slate-500 line-clamp-1">Manage courses, semesters, and subjects.</p>
                                    </div>
                                </a>
                                <a href="/admin/reports" className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-primary-50 hover:border-primary-200 transition group">
                                    <div className="p-3 bg-teal-100 text-teal-600 rounded-lg group-hover:bg-primary-100 group-hover:text-primary-700 transition">
                                        <BookOpen size={24} />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-semibold text-slate-800 group-hover:text-primary-700 transition">College Reports</h3>
                                        <p className="text-sm text-slate-500 line-clamp-1">View attendance and assessment analytics.</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                )}
                {user.role === 'teacher' && (
                    <div className="space-y-6 md:col-span-3 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard icon={<Layers />} title="Subjects" value={stats.subjectsCount} />
                            <StatCard icon={<Video />} title="Classes Conducted" value={stats.classesConducted} />
                            <StatCard icon={<BookOpen />} title="Assignments" value={stats.assignmentsCreated} />
                        </div>

                        {/* Teacher Quick Links Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-8">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4">Teacher Portal Quick Access</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <a href="/teacher/courses" className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-primary-50 hover:border-primary-200 transition group">
                                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-primary-100 group-hover:text-primary-700 transition">
                                        <Layers size={24} />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-semibold text-slate-800 group-hover:text-primary-700 transition">Course Management</h3>
                                        <p className="text-sm text-slate-500 line-clamp-1">Upload materials, create assessments, and schedule live classes.</p>
                                    </div>
                                </a>
                                <a href="/teacher/evaluation" className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-primary-50 hover:border-primary-200 transition group">
                                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg group-hover:bg-primary-100 group-hover:text-primary-700 transition">
                                        <BookOpen size={24} />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-semibold text-slate-800 group-hover:text-primary-700 transition">Evaluation Submissions</h3>
                                        <p className="text-sm text-slate-500 line-clamp-1">Grade student assignments and exams.</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                )}
                {user.role === 'student' && (
                    <div className="space-y-6 md:col-span-3 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <StatCard icon={<Layers />} title="Enrolled Subjects" value={stats.enrolledSubjects || 0} />
                            <StatCard icon={<Video />} title="Classes Attended" value={stats.classesAttended || 0} />
                            <StatCard icon={<BookOpen />} title="Assignments Submitted" value={stats.assignmentsSubmitted || 0} />
                        </div>

                        {/* Quick Links Section */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-8">
                            <h2 className="text-lg font-semibold text-slate-800 mb-4">Quick Access</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <a href="/student/materials" className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-primary-50 hover:border-primary-200 transition group">
                                    <div className="p-3 bg-blue-100 text-blue-600 rounded-lg group-hover:bg-primary-100 group-hover:text-primary-700 transition">
                                        <Layers size={24} />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-semibold text-slate-800 group-hover:text-primary-700 transition">Study Materials</h3>
                                        <p className="text-sm text-slate-500 line-clamp-1">Access lecture notes and recordings.</p>
                                    </div>
                                </a>
                                <a href="/student/assessments" className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-primary-50 hover:border-primary-200 transition group">
                                    <div className="p-3 bg-purple-100 text-purple-600 rounded-lg group-hover:bg-primary-100 group-hover:text-primary-700 transition">
                                        <BookOpen size={24} />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-semibold text-slate-800 group-hover:text-primary-700 transition">Pending Assessments</h3>
                                        <p className="text-sm text-slate-500 line-clamp-1">View and submit assignments or exams.</p>
                                    </div>
                                </a>
                                <a href="/student/subjects" className="flex items-center p-4 border border-slate-200 rounded-lg hover:bg-primary-50 hover:border-primary-200 transition group">
                                    <div className="p-3 bg-red-100 text-red-600 rounded-lg group-hover:bg-primary-100 group-hover:text-primary-700 transition">
                                        <Video size={24} />
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="font-semibold text-slate-800 group-hover:text-primary-700 transition">Virtual Classrooms</h3>
                                        <p className="text-sm text-slate-500 line-clamp-1">Join scheduled live video sessions.</p>
                                    </div>
                                </a>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

const StatCard = ({ icon, title, value }) => (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 flex items-center space-x-5 hover:shadow-md transition">
        <div className="p-4 bg-primary-50 text-primary-600 rounded-2xl">
            {icon}
        </div>
        <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">{title}</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{value !== undefined ? value : '...'}</p>
        </div>
    </div>
);

export default Dashboard;
