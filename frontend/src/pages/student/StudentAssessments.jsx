import React, { useState, useEffect, useContext } from 'react';
import Layout from '../../components/Layout';
import apiClient from '../../api/apiClient';
import { BookOpen, FileText, Upload, CheckCircle, Clock, Loader2, Award } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const StudentAssessments = () => {
    const { user } = useContext(AuthContext);
    const [subjects, setSubjects] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [loading, setLoading] = useState(true);

    // Upload state
    const [file, setFile] = useState(null);
    const [uploadingId, setUploadingId] = useState(null);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (user && user.semester) {
            fetchSubjects(user.semester._id || user.semester);
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchSubjects = async (semesterId) => {
        try {
            setLoading(true);
            const { data } = await apiClient.get(`/academic/semesters/${semesterId}/subjects`);
            setSubjects(data);
            if (data.length > 0) {
                setSelectedSubject(data[0]._id);
                fetchAssessments(data[0]._id);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchAssessments = async (subjectId) => {
        try {
            const { data } = await apiClient.get(`/assessments/subject/${subjectId}`);
            setAssessments(data);
        } catch (error) {
            console.error('Error fetching assessments:', error);
        }
    };

    const handleSubjectChange = (subjectId) => {
        setSelectedSubject(subjectId);
        fetchAssessments(subjectId);
        setMessage(null);
        setFile(null);
    };

    const handleFileUpload = (e) => {
        setFile(e.target.files[0]);
    };

    const submitAssessment = async (assessmentId) => {
        if (!file) {
            setMessage({ type: 'error', text: 'Please select a file to upload.', id: assessmentId });
            return;
        }

        const formData = new FormData();
        formData.append('file', file);

        setUploadingId(assessmentId);
        setMessage(null);

        try {
            await apiClient.post(`/assessments/${assessmentId}/submit`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setMessage({ type: 'success', text: 'Assignment submitted successfully!', id: assessmentId });
            setFile(null);

            // In a real app we'd fetch submission status. Mocking refresh for now.
            fetchAssessments(selectedSubject);
        } catch (error) {
            setMessage({
                type: 'error',
                text: error.response?.data?.message || 'Error submitting assignment.',
                id: assessmentId
            });
        } finally {
            setUploadingId(null);
        }
    };

    if (loading) return <Layout title="Assessments"><div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-500" /></div></Layout>;

    if (!user.semester) {
        return (
            <Layout title="Assessments">
                <div className="bg-orange-50 text-orange-800 p-6 rounded-xl border border-orange-200">
                    <h2 className="text-lg font-semibold mb-2">Not Enrolled</h2>
                    <p>You have not been assigned to a Semester Group yet. Please contact your administrator to access exams and assignments.</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Exams & Assignments">
            <div className="flex flex-col md:flex-row gap-6">

                {/* Subject Selector Sidebar */}
                <div className="w-full md:w-64 shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700">
                            My Subjects
                        </div>
                        <div className="divide-y divide-slate-100">
                            {subjects.map(sub => (
                                <button
                                    key={sub._id}
                                    onClick={() => handleSubjectChange(sub._id)}
                                    className={`w-full text-left px-4 py-3 text-sm transition ${selectedSubject === sub._id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <div className="flex items-center">
                                        <BookOpen size={16} className={`mr-2 ${selectedSubject === sub._id ? 'text-primary-500' : 'text-slate-400'}`} />
                                        <span className="truncate">{sub.name}</span>
                                    </div>
                                </button>
                            ))}
                            {subjects.length === 0 && (
                                <div className="p-4 text-sm text-slate-500 text-center">No subjects found for your semester.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Assessments Content Area */}
                <div className="flex-1 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h2 className="text-lg font-semibold text-slate-800">Pending Tasks</h2>
                            <span className="text-sm px-3 py-1 bg-white rounded-full text-slate-600 border border-slate-200">
                                {assessments.length} Available
                            </span>
                        </div>

                        {assessments.length === 0 ? (
                            <div className="text-center py-16 bg-white">
                                <Award className="mx-auto text-slate-300 mb-4" size={48} />
                                <h3 className="text-slate-700 font-medium text-lg">You're all caught up!</h3>
                                <p className="text-slate-500 text-sm mt-1">No pending assignments or exams for this subject right now.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100">
                                {assessments.map(assessment => {
                                    const isLate = new Date() > new Date(assessment.dueDate);

                                    return (
                                        <div key={assessment._id} className="p-6 bg-white hover:bg-slate-50 transition">
                                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">

                                                {/* Info block */}
                                                <div className="flex-1">
                                                    <div className="flex items-center space-x-3 mb-1">
                                                        <span className={`px-2 py-0.5 rounded text-xs font-semibold uppercase tracking-wider ${assessment.type === 'exam' ? 'bg-purple-100 text-purple-700' :
                                                            assessment.type === 'quiz' ? 'bg-amber-100 text-amber-700' :
                                                                'bg-blue-100 text-blue-700'
                                                            }`}>
                                                            {assessment.type}
                                                        </span>
                                                        <span className="text-sm font-medium text-slate-500">
                                                            Max Marks: {assessment.maxMarks}
                                                        </span>
                                                    </div>
                                                    <h3 className="text-lg font-bold text-slate-800 my-1">{assessment.title}</h3>
                                                    <p className="text-sm text-slate-600 mb-3">{assessment.description}</p>

                                                    <div className="flex items-center text-sm font-medium">
                                                        <Clock size={16} className={`mr-1.5 ${isLate ? 'text-red-500' : 'text-slate-400'}`} />
                                                        <span className={isLate ? 'text-red-600 font-semibold' : 'text-slate-500'}>
                                                            Due: {new Date(assessment.dueDate).toLocaleString()} {isLate && '(Overdue)'}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Action block */}
                                                <div className="shrink-0 w-full md:w-64 bg-slate-50 p-4 rounded-lg border border-slate-200">
                                                    {message && message.id === assessment._id && (
                                                        <div className={`text-xs p-2 mb-3 rounded-md border ${message.type === 'success' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                                                            {message.text}
                                                        </div>
                                                    )}

                                                    <label className="block text-xs font-medium text-slate-700 mb-1">Upload Submission</label>
                                                    <input
                                                        type="file"
                                                        onChange={handleFileUpload}
                                                        className="w-full text-xs mb-3 file:mr-2 file:py-1 file:px-2 file:rounded file:border-0 file:text-xs file:font-medium file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer"
                                                    />
                                                    <button
                                                        onClick={() => submitAssessment(assessment._id)}
                                                        disabled={uploadingId === assessment._id || !file}
                                                        className="w-full flex items-center justify-center py-2 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-md text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        {uploadingId === assessment._id ? (
                                                            <Loader2 size={16} className="animate-spin" />
                                                        ) : (
                                                            <><Upload size={16} className="mr-2" /> Submit File</>
                                                        )}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Download Brief Link */}
                                            {assessment.fileUrl && (
                                                <div className="mt-4 pt-4 border-t border-slate-100 flex">
                                                    <a
                                                        href={`${import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '') : 'https://api.lernify.tech'}${assessment.fileUrl}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="inline-flex items-center text-sm font-medium text-slate-600 hover:text-primary-600 transition"
                                                    >
                                                        <FileText size={16} className="mr-1.5" /> Download Assessment Brief Context
                                                    </a>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </Layout>
    );
};

export default StudentAssessments;
