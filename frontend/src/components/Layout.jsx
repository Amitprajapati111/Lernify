import React, { useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { BookOpen } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

const Layout = ({ children, title }) => {
    const { user, logout } = useContext(AuthContext);
    const location = useLocation();

    if (!user) return null;

    const isActive = (path) => location.pathname === path;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <div className="w-64 bg-slate-900 text-white flex flex-col shrink-0">
                <div className="p-6 flex items-center space-x-3 mb-2">
                    <BookOpen className="text-primary-500" />
                    <span className="text-xl font-bold">Lernify</span>
                </div>
                <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">                    {user.role === 'admin' && (
                    <>
                        <div className="pt-5 pb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Admin Portal</div>
                        <Link to="/admin/users" className={`block px-4 py-2.5 rounded-md transition text-sm font-medium ${isActive('/admin/users') ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                            Manage Users
                        </Link>
                        <Link to="/admin/academic" className={`block px-4 py-2.5 rounded-md transition text-sm font-medium ${isActive('/admin/academic') ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                            Academic Structure
                        </Link>
                        <Link to="/admin/courses" className={`block px-4 py-2.5 rounded-md transition text-sm font-medium ${isActive('/admin/courses') ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                            Global Courses
                        </Link>
                        <Link to="/admin/live-classes" className={`block px-4 py-2.5 rounded-md transition text-sm font-medium ${isActive('/admin/live-classes') ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                            Global Live Sessions
                        </Link>
                        <Link to="/admin/reports" className={`block px-4 py-2.5 rounded-md transition text-sm font-medium ${isActive('/admin/reports') ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                            Reports
                        </Link>
                        <div className="pt-5 pb-1 px-4"></div>
                    </>
                )}

                    {user.role === 'student' && (
                        <>
                            <div className="pt-5 pb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Student Portal</div>
                            <Link to="/student/subjects" className={`block px-4 py-2.5 rounded-md transition text-sm font-medium ${isActive('/student/subjects') ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                                Enrolled Subjects
                            </Link>
                            <Link to="/student/materials" className={`block px-4 py-2.5 rounded-md transition text-sm font-medium ${isActive('/student/materials') ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                                Study Materials
                            </Link>
                            <Link to="/student/assessments" className={`block px-4 py-2.5 rounded-md transition text-sm font-medium ${isActive('/student/assessments') ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                                Exams & Assignments
                            </Link>
                            <div className="pt-5 pb-1 px-4"></div>
                        </>
                    )}

                    {user.role === 'teacher' && (
                        <>
                            <div className="pt-5 pb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Teacher Portal</div>
                            <Link to="/teacher/courses" className={`block px-4 py-2.5 rounded-md transition text-sm font-medium ${isActive('/teacher/courses') ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                                Course Management
                            </Link>
                            <Link to="/teacher/evaluation" className={`block px-4 py-2.5 rounded-md transition text-sm font-medium ${isActive('/teacher/evaluation') ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                                Evaluation
                            </Link>
                            <div className="pt-5 pb-1 px-4"></div>
                        </>
                    )}



                    <div className="pt-2 pb-2 px-4 text-xs font-bold text-slate-500 uppercase tracking-wider">General</div>
                    <Link to="/dashboard" className={`block px-4 py-2.5 rounded-md transition text-sm font-medium ${isActive('/dashboard') ? 'bg-primary-600 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'}`}>
                        Dashboard
                    </Link>

                </nav>
                <div className="p-4 border-t border-slate-800 mt-2 shrink-0">
                    <div className="text-sm font-medium text-slate-300 mb-1 px-4">{user.name}</div>
                    <div className="text-xs text-slate-500 mb-4 px-4 capitalize">{user.role}</div>
                    <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 rounded-md transition">
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white shadow-sm border-b border-slate-200 shrink-0">
                    <div className="px-8 py-6">
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{title || `Welcome back, ${user.name}`}</h1>
                    </div>
                </header>

                <main className="flex-1 p-8 overflow-y-auto">
                    <div className="max-w-7xl mx-auto">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
};

export default Layout;
