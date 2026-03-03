import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import apiClient from '../../api/apiClient';
import { BarChart3, Users, BookOpen, Layers, Target, Clock, CheckCircle, XCircle } from 'lucide-react';

const AdminReports = () => {
    // Data States
    const [courses, setCourses] = useState([]);
    const [semesters, setSemesters] = useState([]);

    // Selection States
    const [selectedCourse, setSelectedCourse] = useState('');
    const [selectedSemester, setSelectedSemester] = useState('');

    // Analytics States
    const [attendanceStats, setAttendanceStats] = useState(null);
    const [assessmentStats, setAssessmentStats] = useState(null);

    // UI States
    const [loadingCourses, setLoadingCourses] = useState(true);
    const [loadingReports, setLoadingReports] = useState(false);

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const { data } = await apiClient.get('/academic/courses');
            setCourses(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoadingCourses(false);
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
        setAttendanceStats(null);
        setAssessmentStats(null);
        if (courseId) {
            fetchSemesters(courseId);
        }
    };

    const handleSemesterChange = async (e) => {
        const semesterId = e.target.value;
        setSelectedSemester(semesterId);
        if (semesterId) {
            fetchReports(semesterId);
        } else {
            setAttendanceStats(null);
            setAssessmentStats(null);
        }
    };

    const fetchReports = async (semesterId) => {
        try {
            setLoadingReports(true);
            const [attendanceRes, assessmentRes] = await Promise.all([
                apiClient.get(`/admin/reports/attendance/${semesterId}`),
                apiClient.get(`/admin/reports/assessments/${semesterId}`)
            ]);
            setAttendanceStats(attendanceRes.data.stats);
            setAssessmentStats(assessmentRes.data.stats);
        } catch (err) {
            console.error('Failed to fetch reports', err);
        } finally {
            setLoadingReports(false);
        }
    };

    if (loadingCourses) return <Layout title="Platform Analytics"><div className="flex justify-center p-12"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div></Layout>;

    return (
        <Layout title="Platform Analytics">
            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-8 flex items-end space-x-6">
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center"><Layers size={16} className="mr-2 text-primary-500" /> Select Course</label>
                    <select
                        value={selectedCourse}
                        onChange={handleCourseChange}
                        className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 focus:bg-white transition"
                    >
                        <option value="">All Courses...</option>
                        {courses.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                </div>
                <div className="flex-1">
                    <label className="block text-sm font-medium text-slate-700 mb-2 flex items-center"><Target size={16} className="mr-2 text-primary-500" /> Select Target Semester</label>
                    <select
                        value={selectedSemester}
                        onChange={handleSemesterChange}
                        className="w-full text-sm px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 disabled:opacity-50 transition"
                        disabled={!selectedCourse || semesters.length === 0}
                    >
                        <option value="">Specific Semester...</option>
                        {semesters.map(s => <option key={s._id} value={s._id}>Semester {s.number}</option>)}
                    </select>
                </div>
            </div>

            {!selectedSemester ? (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center text-center">
                    <div className="p-4 bg-primary-50 text-primary-500 rounded-full mb-4">
                        <BarChart3 size={32} />
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">Select a Semester to View Reports</h3>
                    <p className="text-slate-500 max-w-sm">Analytics are aggregated at the Semester Group level to ensure data accuracy across attendance, materials, and assessments.</p>
                </div>
            ) : loadingReports ? (
                <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div></div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    {/* Attendance Report Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center space-x-3">
                            <Users className="text-primary-600" size={24} />
                            <h2 className="text-lg font-bold text-slate-800">Aggregate Attendance</h2>
                        </div>
                        <div className="p-6">
                            <div className="mb-6">
                                <span className="text-4xl font-extrabold text-slate-900">{attendanceStats?.totalRecords || 0}</span>
                                <span className="text-sm font-medium text-slate-500 ml-2 uppercase tracking-wide">Total Records</span>
                            </div>

                            <div className="space-y-4">
                                <StatBar
                                    label="Present"
                                    value={attendanceStats?.present}
                                    total={attendanceStats?.totalRecords}
                                    colorClass="bg-emerald-500"
                                    icon={<CheckCircle size={16} className="text-emerald-500" />}
                                />
                                <StatBar
                                    label="Absent"
                                    value={attendanceStats?.absent}
                                    total={attendanceStats?.totalRecords}
                                    colorClass="bg-red-500"
                                    icon={<XCircle size={16} className="text-red-500" />}
                                />
                                <StatBar
                                    label="Late"
                                    value={attendanceStats?.late}
                                    total={attendanceStats?.totalRecords}
                                    colorClass="bg-amber-500"
                                    icon={<Clock size={16} className="text-amber-500" />}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Assessments Report Card */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex items-center space-x-3">
                            <BookOpen className="text-primary-600" size={24} />
                            <h2 className="text-lg font-bold text-slate-800">Assessment Submissions</h2>
                        </div>
                        <div className="p-6">
                            <div className="mb-6 flex justify-between items-end">
                                <div>
                                    <span className="text-4xl font-extrabold text-slate-900">{assessmentStats?.totalSubmissions || 0}</span>
                                    <span className="text-sm font-medium text-slate-500 ml-2 uppercase tracking-wide">Total Submissions</span>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-primary-600">{assessmentStats?.totalAssessmentsPublished || 0} Publishments</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <StatBar
                                    label="Submitted (Pending Grading)"
                                    value={assessmentStats?.submitted}
                                    total={assessmentStats?.totalSubmissions}
                                    colorClass="bg-blue-500"
                                    icon={<CheckCircle size={16} className="text-blue-500" />}
                                />
                                <StatBar
                                    label="Graded"
                                    value={assessmentStats?.graded}
                                    total={assessmentStats?.totalSubmissions}
                                    colorClass="bg-emerald-500"
                                    icon={<CheckCircle size={16} className="text-emerald-500" />}
                                />
                                <StatBar
                                    label="Late Submissions"
                                    value={assessmentStats?.late}
                                    total={assessmentStats?.totalSubmissions}
                                    colorClass="bg-amber-500"
                                    icon={<Clock size={16} className="text-amber-500" />}
                                />
                            </div>
                        </div>
                    </div>

                </div>
            )}
        </Layout>
    );
};

const StatBar = ({ label, value = 0, total = 0, colorClass, icon }) => {
    const percentage = total > 0 ? Math.round((value / total) * 100) : 0;

    return (
        <div>
            <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-slate-700 flex items-center space-x-2">
                    {icon} <span>{label}</span>
                </span>
                <span className="text-sm font-bold text-slate-900">{value} <span className="text-slate-400 font-normal ml-1">({percentage}%)</span></span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                <div className={`h-2 rounded-full ${colorClass}`} style={{ width: `${percentage}%` }}></div>
            </div>
        </div>
    );
};

export default AdminReports;
