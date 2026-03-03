import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import apiClient from '../../api/apiClient';
import { Layers, BookOpen, Users, ChevronDown, ChevronRight, Loader2 } from 'lucide-react';

const GlobalCourses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [expandedCourses, setExpandedCourses] = useState({});
    const [expandedSemesters, setExpandedSemesters] = useState({});

    useEffect(() => {
        fetchGlobalCourses();
    }, []);

    const fetchGlobalCourses = async () => {
        try {
            setLoading(true);
            const { data } = await apiClient.get('/admin/courses');
            setCourses(data);
        } catch (error) {
            console.error('Error fetching global courses:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleCourse = (id) => {
        setExpandedCourses(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const toggleSemester = (id) => {
        setExpandedSemesters(prev => ({ ...prev, [id]: !prev[id] }));
    };

    if (loading) return <Layout title="Global Courses"><div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-500" /></div></Layout>;

    return (
        <Layout title="Institution Courses Overview">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">Academic Hierarchy</h2>
                        <p className="text-sm text-slate-500">View all active courses, semesters, and assigned teachers.</p>
                    </div>
                    <span className="text-sm px-3 py-1 bg-white rounded-full text-slate-600 border border-slate-200 font-medium">
                        Total Courses: {courses.length}
                    </span>
                </div>

                <div className="p-0">
                    {courses.length === 0 ? (
                        <div className="p-12 text-center text-slate-500">No courses defined in the system.</div>
                    ) : (
                        <div className="divide-y divide-slate-100 custom-scrollbar max-h-[70vh] overflow-y-auto">
                            {courses.map(course => (
                                <div key={course._id} className="bg-white">
                                    <button
                                        onClick={() => toggleCourse(course._id)}
                                        className="w-full flex items-center justify-between p-5 hover:bg-slate-50 transition cursor-pointer text-left"
                                    >
                                        <div className="flex items-center space-x-3">
                                            {expandedCourses[course._id] ? <ChevronDown size={20} className="text-slate-400" /> : <ChevronRight size={20} className="text-slate-400" />}
                                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Layers size={20} /></div>
                                            <div>
                                                <h3 className="font-bold text-slate-800 text-lg">{course.name}</h3>
                                                <p className="text-xs text-slate-500 font-medium">{course.semesters?.length || 0} Semesters Configured</p>
                                            </div>
                                        </div>
                                    </button>

                                    {/* Semesters Dropdown */}
                                    {expandedCourses[course._id] && (
                                        <div className="bg-slate-50 border-t border-slate-100 p-4 pl-14">
                                            {(!course.semesters || course.semesters.length === 0) ? (
                                                <div className="text-sm text-slate-500 italic">No semesters created for this course.</div>
                                            ) : (
                                                <div className="space-y-3">
                                                    {course.semesters.map(sem => (
                                                        <div key={sem._id} className="bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                                                            <button
                                                                onClick={() => toggleSemester(sem._id)}
                                                                className="w-full flex items-center justify-between p-4 hover:bg-slate-50 transition cursor-pointer text-left"
                                                            >
                                                                <div className="flex items-center space-x-3">
                                                                    {expandedSemesters[sem._id] ? <ChevronDown size={18} className="text-slate-400" /> : <ChevronRight size={18} className="text-slate-400" />}
                                                                    <div className="font-semibold text-slate-700">Semester {sem.number}</div>
                                                                    <span className="text-xs text-slate-500 px-2.5 py-1 bg-slate-100 rounded-full">{sem.subjects?.length || 0} Subjects</span>
                                                                </div>
                                                            </button>

                                                            {/* Subjects Display */}
                                                            {expandedSemesters[sem._id] && (
                                                                <div className="p-4 pt-0 border-t border-slate-100 bg-white">
                                                                    {(!sem.subjects || sem.subjects.length === 0) ? (
                                                                        <div className="text-xs text-slate-400 pt-3 italic">No subjects added to this semester.</div>
                                                                    ) : (
                                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 pt-3">
                                                                            {sem.subjects.map(sub => (
                                                                                <div key={sub._id} className="border border-slate-200 rounded-md p-3 hover:border-primary-300 transition">
                                                                                    <div className="flex items-start justify-between mb-2">
                                                                                        <div className="flex items-center font-semibold text-slate-800 text-sm">
                                                                                            <BookOpen size={14} className="text-primary-500 mr-1.5" />
                                                                                            {sub.name}
                                                                                        </div>
                                                                                        <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-1 rounded">{sub.code}</span>
                                                                                    </div>

                                                                                    <div className="mt-3">
                                                                                        <div className="text-[10px] uppercase font-bold text-slate-400 mb-1 flex items-center tracking-wider">
                                                                                            <Users size={10} className="mr-1" /> Assigned Teachers
                                                                                        </div>
                                                                                        {sub.teachers && sub.teachers.length > 0 ? (
                                                                                            <div className="flex flex-wrap gap-1 mt-1">
                                                                                                {sub.teachers.map(t => (
                                                                                                    <span key={t._id} className="text-xs text-primary-700 bg-primary-50 border border-primary-100 px-2 py-0.5 rounded shadow-sm flex items-center">
                                                                                                        {t.name}
                                                                                                    </span>
                                                                                                ))}
                                                                                            </div>
                                                                                        ) : (
                                                                                            <span className="text-xs text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded inline-block">Unstaffed</span>
                                                                                        )}
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </Layout>
    );
};

export default GlobalCourses;
