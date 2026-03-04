import React, { useState, useEffect } from 'react';
import Layout from '../../components/Layout';
import apiClient from '../../api/apiClient';
import { BookOpen, Users, CheckCircle, FileText, Loader2, Search } from 'lucide-react';

const TeacherEvaluation = () => {
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [assessments, setAssessments] = useState([]);
    const [selectedAssessment, setSelectedAssessment] = useState(null);

    // Submissions state
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingSubmissions, setLoadingSubmissions] = useState(false);

    // Grading Modal State
    const [gradingModal, setGradingModal] = useState({ isOpen: false, submission: null });
    const [gradeData, setGradeData] = useState({ marks: '', feedback: '' });
    const [isSavingGrade, setIsSavingGrade] = useState(false);

    useEffect(() => {
        fetchSubjects();
    }, []);

    const fetchSubjects = async () => {
        try {
            setLoading(true);
            const { data } = await apiClient.get('/academic/teacher/subjects');
            setSubjects(data);
            if (data.length > 0) {
                handleSubjectChange(data[0]);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubjectChange = async (subject) => {
        setSelectedSubject(subject);
        setSelectedAssessment(null);
        setSubmissions([]);
        try {
            const { data } = await apiClient.get(`/assessments/subject/${subject._id}`);
            // Only show assessments created by current teacher (or all for the subject depending on rules. Here, backend gave subject assessments)
            setAssessments(data);
            if (data.length > 0) {
                handleAssessmentChange(data[0]);
            }
        } catch (error) {
            console.error('Error fetching assessments:', error);
        }
    };

    const handleAssessmentChange = async (assessment) => {
        setSelectedAssessment(assessment);
        try {
            setLoadingSubmissions(true);
            const { data } = await apiClient.get(`/assessments/${assessment._id}/submissions`);
            setSubmissions(data);
        } catch (error) {
            console.error('Error fetching submissions:', error);
        } finally {
            setLoadingSubmissions(false);
        }
    };

    const openGradingModal = (submission) => {
        setGradingModal({ isOpen: true, submission });
        setGradeData({
            marks: submission.marksObtained || '',
            feedback: submission.feedback || ''
        });
    };

    const handleGradeSubmit = async (e) => {
        e.preventDefault();
        setIsSavingGrade(true);
        try {
            const { submission } = gradingModal;
            await apiClient.put(`/assessments/submissions/${submission._id}/grade`, {
                marksObtained: Number(gradeData.marks),
                feedback: gradeData.feedback
            });

            // Close modal and refresh submissions
            setGradingModal({ isOpen: false, submission: null });
            handleAssessmentChange(selectedAssessment); // Re-fetch

        } catch (error) {
            console.error('Error grading:', error);
            alert('Failed to save grade');
        } finally {
            setIsSavingGrade(false);
        }
    };

    if (loading && subjects.length === 0) return <Layout title="Evaluation Dashboard"><div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-500" /></div></Layout>;

    return (
        <Layout title="Evaluation Dashboard">
            <div className="flex flex-col lg:flex-row gap-6">

                {/* Left Sidebar: Subjects & Assessments */}
                <div className="w-full lg:w-80 shrink-0 space-y-4">

                    {/* Subjects Dropdown context */}
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 sticky top-6">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">1. Select Subject</label>
                        <select
                            className="w-full text-sm font-medium p-2.5 border border-slate-300 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500"
                            onChange={(e) => handleSubjectChange(subjects.find(s => s._id === e.target.value))}
                            value={selectedSubject?._id || ''}
                        >
                            <option value="" disabled>Choose a Subject...</option>
                            {subjects.map(s => (
                                <option key={s._id} value={s._id}>{s.name} ({s.code})</option>
                            ))}
                        </select>

                        <div className="mt-6">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">2. Select Assessment</label>

                            {assessments.length === 0 ? (
                                <div className="text-sm text-slate-500 text-center py-4 bg-slate-50 rounded-lg border border-dashed border-slate-200">
                                    No assessments found for this subject.
                                </div>
                            ) : (
                                <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                                    {assessments.map(ass => (
                                        <button
                                            key={ass._id}
                                            onClick={() => handleAssessmentChange(ass)}
                                            className={`w-full text-left p-3 rounded-lg border transition ${selectedAssessment?._id === ass._id ? 'bg-primary-50 border-primary-200 ring-1 ring-primary-500' : 'bg-white border-slate-200 hover:border-slate-300'}`}
                                        >
                                            <div className="flex justify-between items-start mb-1">
                                                <span className={`text-[10px] font-bold uppercase px-1.5 py-0.5 rounded ${ass.type === 'exam' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>{ass.type}</span>
                                                <span className="text-xs font-medium text-slate-500">Max: {ass.maxMarks}</span>
                                            </div>
                                            <div className="text-sm font-bold text-slate-800 line-clamp-1">{ass.title}</div>
                                            <div className="text-xs text-slate-500 mt-1">Due: {new Date(ass.dueDate).toLocaleDateString()}</div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content: Submissions Grid */}
                <div className="flex-1 min-w-0">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden min-h-[600px] flex flex-col">

                        {/* Header Context */}
                        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                            <div>
                                <h2 className="text-xl font-bold text-slate-800">
                                    {selectedAssessment ? selectedAssessment.title : 'Submissions'}
                                </h2>
                                {selectedAssessment && (
                                    <p className="text-sm text-slate-500 mt-1 flex items-center">
                                        <Users size={14} className="mr-1.5" />
                                        {submissions.length} Students Submitted &middot; Max Marks: {selectedAssessment.maxMarks}
                                    </p>
                                )}
                            </div>
                            {loadingSubmissions && <Loader2 className="animate-spin text-primary-500" />}
                        </div>

                        {/* Submissions List */}
                        {!selectedAssessment ? (
                            <div className="flex-1 flex items-center justify-center p-12 text-center">
                                <div>
                                    <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                                    <h3 className="text-lg font-medium text-slate-700">Select an Assessment</h3>
                                    <p className="text-slate-500 text-sm mt-1">Choose a task from the sidebar to view and grade student submissions.</p>
                                </div>
                            </div>
                        ) : submissions.length === 0 ? (
                            <div className="flex-1 flex items-center justify-center p-12 text-center">
                                <div>
                                    <FileText size={48} className="mx-auto text-slate-300 mb-4" />
                                    <h3 className="text-lg font-medium text-slate-700">No Submissions Yet</h3>
                                    <p className="text-slate-500 text-sm mt-1">Students have not uploaded any files for this assessment.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm text-slate-600">
                                    <thead className="bg-white border-b border-slate-200 text-slate-800 uppercase text-xs font-semibold">
                                        <tr>
                                            <th className="px-6 py-4">Student</th>
                                            <th className="px-6 py-4">Submitted On</th>
                                            <th className="px-6 py-4 text-center">Attachment</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                            <th className="px-6 py-4 text-center">Score</th>
                                            <th className="px-6 py-4 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {submissions.map(sub => {
                                            const isGraded = sub.status === 'graded';
                                            return (
                                                <tr key={sub._id} className="hover:bg-slate-50 transition">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-slate-900">{sub.student.name}</div>
                                                        <div className="text-xs text-slate-500">{sub.student.enrollmentNo || sub.student.email}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        {new Date(sub.submittedAt).toLocaleString()}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {sub.fileUrl ? (
                                                            <a href={`${import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace('/api', '') : 'http://localhost:5000'}${sub.fileUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center text-primary-600 hover:text-primary-800 font-medium bg-primary-50 px-3 py-1 rounded transition">
                                                                <Search size={14} className="mr-1.5" /> View
                                                            </a>
                                                        ) : (
                                                            <span className="text-slate-400 italic">No File</span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        {isGraded ? (
                                                            <span className="inline-flex items-center text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded-full">
                                                                <CheckCircle size={12} className="mr-1" /> Graded
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex items-center text-xs font-bold text-amber-700 bg-amber-100 px-2 py-1 rounded-full">
                                                                Pending Review
                                                            </span>
                                                        )}
                                                    </td>
                                                    <td className="px-6 py-4 text-center font-bold text-slate-800">
                                                        {isGraded ? `${sub.marksObtained} / ${selectedAssessment.maxMarks}` : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        <button
                                                            onClick={() => openGradingModal(sub)}
                                                            className={`text-xs font-semibold px-4 py-2 rounded-lg transition ${isGraded ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-primary-600 text-white hover:bg-primary-700 shadow-sm'}`}
                                                        >
                                                            {isGraded ? 'Edit Grade' : 'Evaluate'}
                                                        </button>
                                                    </td>
                                                </tr>
                                            )
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </div>

            </div>

            {/* Grading Modal Overlay */}
            {gradingModal.isOpen && gradingModal.submission && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <h3 className="font-bold text-lg text-slate-800">Evaluate Submission</h3>
                        </div>
                        <form onSubmit={handleGradeSubmit} className="p-6">

                            <div className="mb-6 bg-primary-50 p-4 rounded-lg flex justify-between items-center">
                                <div>
                                    <div className="text-xs text-primary-600 font-bold uppercase tracking-wider mb-1">Student</div>
                                    <div className="font-semibold text-slate-800">{gradingModal.submission.student.name}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs text-primary-600 font-bold uppercase tracking-wider mb-1">Max Marks</div>
                                    <div className="font-semibold text-slate-800">{selectedAssessment.maxMarks}</div>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Marks Awarded</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            max={selectedAssessment.maxMarks}
                                            value={gradeData.marks}
                                            onChange={e => setGradeData({ ...gradeData, marks: e.target.value })}
                                            className="w-full pl-3 pr-12 py-3 border border-slate-300 rounded-lg text-lg font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary-500"
                                        />
                                        <div className="absolute right-3 top-3 text-slate-400 font-medium">/ {selectedAssessment.maxMarks}</div>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-1">Feedback Remarks (Optional)</label>
                                    <textarea
                                        rows="3"
                                        placeholder="Excellent work on..."
                                        value={gradeData.feedback}
                                        onChange={e => setGradeData({ ...gradeData, feedback: e.target.value })}
                                        className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-slate-700"
                                    />
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 mt-8 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setGradingModal({ isOpen: false, submission: null })} className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
                                <button type="submit" disabled={isSavingGrade} className="px-5 py-2.5 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition shadow-sm flex items-center">
                                    {isSavingGrade ? <Loader2 size={16} className="animate-spin mr-2" /> : <CheckCircle size={16} className="mr-2" />}
                                    Publish Grade
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </Layout>
    );
};

export default TeacherEvaluation;
