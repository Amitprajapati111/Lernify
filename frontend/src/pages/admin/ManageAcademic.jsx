import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import apiClient from '../../api/apiClient';
import { Plus, ChevronRight, Book, Layers, FileText, Loader2, Users } from 'lucide-react';

const ManageAcademic = () => {
    // Data States
    const [courses, setCourses] = useState([]);
    const [semesters, setSemesters] = useState([]);
    const [subjects, setSubjects] = useState([]);
    const [teachers, setTeachers] = useState([]);

    // Selection States
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [selectedSemester, setSelectedSemester] = useState(null);

    // Form States
    const [newCourseName, setNewCourseName] = useState('');
    const [newSemesterNum, setNewSemesterNum] = useState('');
    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectCode, setNewSubjectCode] = useState('');

    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchCourses();
        fetchTeachers();
    }, []);

    const fetchTeachers = async () => {
        try {
            const { data } = await apiClient.get('/admin/users?role=teacher');
            setTeachers(data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchCourses = async () => {
        try {
            setLoading(true);
            const { data } = await apiClient.get('/academic/courses');
            setCourses(data);
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

    const fetchSubjects = async (semesterId) => {
        try {
            const { data } = await apiClient.get(`/academic/semesters/${semesterId}/subjects`);
            setSubjects(data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSelectCourse = (course) => {
        setSelectedCourse(course);
        setSelectedSemester(null);
        setSubjects([]);
        fetchSemesters(course._id);
    };

    const handleSelectSemester = (semester) => {
        setSelectedSemester(semester);
        fetchSubjects(semester._id);
    };

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        try {
            await apiClient.post('/academic/courses', { name: newCourseName, durationYears: 4 });
            setNewCourseName('');
            fetchCourses();
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateSemester = async (e) => {
        e.preventDefault();
        if (!selectedCourse) return;
        try {
            await apiClient.post(`/academic/courses/${selectedCourse._id}/semesters`, { number: newSemesterNum });
            setNewSemesterNum('');
            fetchSemesters(selectedCourse._id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleCreateSubject = async (e) => {
        e.preventDefault();
        if (!selectedSemester) return;
        try {
            await apiClient.post(`/academic/semesters/${selectedSemester._id}/subjects`, {
                name: newSubjectName,
                code: newSubjectCode,
                credits: 3
            });
            setNewSubjectName('');
            setNewSubjectCode('');
            fetchSubjects(selectedSemester._id);
        } catch (err) {
            console.error(err);
        }
    };

    const handleAssignTeacher = async (subjectId, teacherId) => {
        if (!teacherId || !subjectId) return;
        try {
            await apiClient.post('/admin/assign-teacher', {
                subjectId,
                teacherId
            });
            // Refresh subjects to show new teacher
            fetchSubjects(selectedSemester._id);
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return <Layout title="Academic Structure"><div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-500" /></div></Layout>;

    return (
        <Layout title="Academic Structure">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mb-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-2">College Hierarchy Dashboard</h2>
                <p className="text-sm text-slate-500">
                    Define the overarching Courses (e.g., B.Tech CS), Semesters underneath them, and Subjects taught in each semester.
                    <br /><span className="font-semibold text-primary-600">Creating a Semester automatically generates a private Access Group for students.</span>
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">

                {/* Courses Column */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center space-x-2 shrink-0">
                        <Book className="text-primary-600" size={18} />
                        <h3 className="font-semibold text-slate-800">1. Courses</h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {courses.map(course => (
                            <button
                                key={course._id}
                                onClick={() => handleSelectCourse(course)}
                                className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition flex justify-between items-center ${selectedCourse?._id === course._id ? 'border-primary-500 bg-primary-50 text-primary-900 ring-1 ring-primary-500/50' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50 text-slate-700'}`}
                            >
                                <span className="font-medium">{course.name}</span>
                                <ChevronRight size={16} className={selectedCourse?._id === course._id ? 'text-primary-600' : 'text-slate-400'} />
                            </button>
                        ))}
                    </div>
                    <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
                        <form onSubmit={handleCreateCourse} className="flex space-x-2">
                            <input
                                value={newCourseName}
                                onChange={e => setNewCourseName(e.target.value)}
                                placeholder="New Course Name..."
                                className="flex-1 text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
                                required
                            />
                            <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition"><Plus size={18} /></button>
                        </form>
                    </div>
                </div>

                {/* Semesters Column */}
                <div className={`bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden transition-opacity ${!selectedCourse ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                        <div className="flex items-center space-x-2">
                            <Layers className="text-primary-600" size={18} />
                            <h3 className="font-semibold text-slate-800">2. Semesters</h3>
                        </div>
                        {selectedCourse && <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-md max-w-[120px] truncate">{selectedCourse.name}</span>}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2">
                        {!selectedCourse ? (
                            <div className="text-sm text-slate-400 text-center mt-10">Select a course first</div>
                        ) : semesters.length === 0 ? (
                            <div className="text-sm text-slate-400 text-center mt-10">No semesters found.</div>
                        ) : (
                            semesters.map(sem => (
                                <button
                                    key={sem._id}
                                    onClick={() => handleSelectSemester(sem)}
                                    className={`w-full text-left px-4 py-3 rounded-lg border text-sm transition flex justify-between items-center ${selectedSemester?._id === sem._id ? 'border-primary-500 bg-primary-50 text-primary-900 ring-1 ring-primary-500/50' : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50 text-slate-700'}`}
                                >
                                    <span className="font-medium">Semester {sem.number}</span>
                                    <span className="text-xs bg-primary-100 text-primary-700 px-2 py-1 rounded-full"><Users size={10} className="inline mr-1" />Group Auto-Created</span>
                                </button>
                            ))
                        )}
                    </div>
                    {selectedCourse && (
                        <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
                            <form onSubmit={handleCreateSemester} className="flex space-x-2">
                                <input
                                    type="number"
                                    value={newSemesterNum}
                                    onChange={e => setNewSemesterNum(e.target.value)}
                                    placeholder="Sem Number (e.g. 1)"
                                    className="flex-1 w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
                                    required
                                    min="1"
                                />
                                <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-lg transition"><Plus size={18} /></button>
                            </form>
                        </div>
                    )}
                </div>

                {/* Subjects Column */}
                <div className={`bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden transition-opacity ${!selectedSemester ? 'opacity-50 pointer-events-none' : ''}`}>
                    <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                        <div className="flex items-center space-x-2">
                            <FileText className="text-primary-600" size={18} />
                            <h3 className="font-semibold text-slate-800">3. Subjects</h3>
                        </div>
                        {selectedSemester && <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded-md">Sem {selectedSemester.number}</span>}
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {!selectedSemester ? (
                            <div className="text-sm text-slate-400 text-center mt-10">Select a semester first</div>
                        ) : subjects.length === 0 ? (
                            <div className="text-sm text-slate-400 text-center mt-10">No subjects assigned yet.</div>
                        ) : (
                            subjects.map(sub => (
                                <div key={sub._id} className="p-3 border border-slate-200 rounded-lg bg-slate-50">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-semibold text-slate-800 text-sm">{sub.name}</span>
                                        <span className="text-xs font-mono bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">{sub.code}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-2">
                                        Assigned Teachers: {sub.teachers.length > 0 ? sub.teachers.map(t => t.name).join(', ') : 'None'}
                                    </div>
                                    <div className="mt-3 flex space-x-2">
                                        <select
                                            className="text-xs flex-1 border border-slate-200 rounded p-1"
                                            onChange={(e) => handleAssignTeacher(sub._id, e.target.value)}
                                            value=""
                                        >
                                            <option value="" disabled>Assign Teacher...</option>
                                            {teachers.map(t => (
                                                <option key={t._id} value={t._id}>{t.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    {selectedSemester && (
                        <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
                            <form onSubmit={handleCreateSubject} className="space-y-2">
                                <input
                                    value={newSubjectName}
                                    onChange={e => setNewSubjectName(e.target.value)}
                                    placeholder="Subject Name"
                                    className="w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500"
                                    required
                                />
                                <div className="flex space-x-2">
                                    <input
                                        value={newSubjectCode}
                                        onChange={e => setNewSubjectCode(e.target.value)}
                                        placeholder="Subject Code (CS101)"
                                        className="flex-1 w-full text-sm px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-primary-500 font-mono"
                                        required
                                    />
                                    <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg transition text-sm font-medium">Add</button>
                                </div>
                            </form>
                        </div>
                    )}
                </div>

            </div>
        </Layout>
    );
};

export default ManageAcademic;
