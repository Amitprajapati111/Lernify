import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import apiClient from '../../api/apiClient';
import { BookOpen, FolderOpen, Plus, Loader2, Upload, Trash2, FileText, Video, Download } from 'lucide-react';

const TeacherCourses = () => {
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [materials, setMaterials] = useState([]);
    const [assessments, setAssessments] = useState([]);
    const [liveClasses, setLiveClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('materials'); // materials | assessments | live_classes

    // Modals & Forms
    const [showMaterialForm, setShowMaterialForm] = useState(false);
    const [showAssessmentForm, setShowAssessmentForm] = useState(false);
    const [showLiveClassForm, setShowLiveClassForm] = useState(false);
    const [formData, setFormData] = useState({ title: '', description: '', type: 'document', file: null, dueDate: '', maxMarks: '', topic: '', startTime: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

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
        try {
            const [matRes, assRes, liveRes] = await Promise.all([
                apiClient.get(`/materials/subject/${subject._id}`),
                apiClient.get(`/assessments/subject/${subject._id}`),
                apiClient.get(`/live-classes/subject/${subject._id}`)
            ]);
            setMaterials(matRes.data);
            setAssessments(assRes.data);
            setLiveClasses(liveRes.data);
        } catch (error) {
            console.error('Error fetching subject content:', error);
        }
    };

    const handleFileChange = (e) => setFormData({ ...formData, file: e.target.files[0] });

    const handleMaterialSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('description', formData.description);
        submitData.append('subject', selectedSubject._id);
        submitData.append('type', formData.type);
        if (formData.file) submitData.append('file', formData.file);

        try {
            await apiClient.post('/materials', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setShowMaterialForm(false);
            setFormData({ title: '', description: '', type: 'document', file: null, dueDate: '', maxMarks: '' });
            // Refresh content
            handleSubjectChange(selectedSubject);
        } catch (error) {
            console.error('Error uploading material:', error);
            alert(error.response?.data?.message || 'Failed to upload material');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAssessmentSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        const submitData = new FormData();
        submitData.append('title', formData.title);
        submitData.append('description', formData.description);
        submitData.append('subject', selectedSubject._id);
        submitData.append('type', formData.type); // assignment, exam, quiz
        submitData.append('dueDate', formData.dueDate);
        submitData.append('maxMarks', formData.maxMarks);
        if (formData.file) submitData.append('file', formData.file);

        try {
            await apiClient.post('/assessments', submitData, { headers: { 'Content-Type': 'multipart/form-data' } });
            setShowAssessmentForm(false);
            setFormData({ title: '', description: '', type: 'assignment', file: null, dueDate: '', maxMarks: '' });
            handleSubjectChange(selectedSubject);
        } catch (error) {
            console.error('Error creating assessment:', error);
            alert(error.response?.data?.message || 'Failed to create assessment');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleLiveClassSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await apiClient.post('/live-classes', {
                subject: selectedSubject._id,
                topic: formData.topic,
                startTime: formData.startTime
            });
            setShowLiveClassForm(false);
            setFormData({ ...formData, topic: '', startTime: '' });
            handleSubjectChange(selectedSubject);
        } catch (error) {
            console.error('Error creating live class:', error);
            alert(error.response?.data?.message || 'Failed to schedule class');
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDownloadCSV = async (classId) => {
        try {
            const response = await apiClient.get(`/attendance/class/${classId}/export`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `attendance-${classId}.csv`);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err) {
            console.error('Error downloading CSV:', err);
            alert('Failed to download CSV. Assure attendance records exist.');
        }
    };

    if (loading && subjects.length === 0) return <Layout title="Course Management"><div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-500" /></div></Layout>;

    return (
        <Layout title="Course Management">
            <div className="flex flex-col md:flex-row gap-6">

                {/* Subjects Sidebar */}
                <div className="w-full md:w-72 shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 flex justify-between items-center">
                            <span>My Assigned Subjects</span>
                            <span className="text-xs font-medium px-2 py-1 bg-slate-200 text-slate-600 rounded-full">{subjects.length}</span>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-[calc(100vh-250px)] overflow-y-auto">
                            {subjects.map(sub => (
                                <button
                                    key={sub._id}
                                    onClick={() => handleSubjectChange(sub)}
                                    className={`w-full text-left p-4 text-sm transition ${selectedSubject?._id === sub._id ? 'bg-primary-50 text-primary-700 font-medium' : 'text-slate-600 hover:bg-slate-50'}`}
                                >
                                    <div className="font-semibold mb-1">{sub.name} <span className="text-xs font-normal text-slate-400">({sub.code})</span></div>
                                    {sub.semester && sub.semester.course && (
                                        <div className="text-xs opacity-75">{sub.semester.course.name} - Sem {sub.semester.number}</div>
                                    )}
                                </button>
                            ))}
                            {subjects.length === 0 && (
                                <div className="p-6 text-sm text-slate-500 text-center">You have not been assigned to any subjects yet.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                {selectedSubject ? (
                    <div className="flex-1 min-w-0">

                        {/* Tabs */}
                        <div className="flex space-x-1 bg-slate-200/50 p-1 rounded-xl mb-6">
                            <button
                                onClick={() => setActiveTab('materials')}
                                className={`flex-1 flex justify-center items-center py-2.5 text-sm font-medium rounded-lg transition ${activeTab === 'materials' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                            >
                                <FolderOpen size={18} className="mr-2" /> Study Materials
                            </button>
                            <button
                                onClick={() => setActiveTab('assessments')}
                                className={`flex-1 flex justify-center items-center py-2.5 text-sm font-medium rounded-lg transition ${activeTab === 'assessments' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                            >
                                <BookOpen size={18} className="mr-2" /> Assessments
                            </button>
                            <button
                                onClick={() => setActiveTab('live_classes')}
                                className={`flex-1 flex justify-center items-center py-2.5 text-sm font-medium rounded-lg transition ${activeTab === 'live_classes' ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'}`}
                            >
                                <Video size={18} className="mr-2" /> Live Classes
                            </button>
                        </div>

                        {/* Materials Layout */}
                        {activeTab === 'materials' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-slate-800">Materials for {selectedSubject.name}</h2>
                                    <button
                                        onClick={() => { setFormData({ ...formData, type: 'document' }); setShowMaterialForm(true); }}
                                        className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg text-sm font-medium hover:bg-primary-700 transition"
                                    >
                                        <Plus size={16} className="mr-2" /> Upload Material
                                    </button>
                                </div>

                                {showMaterialForm && (
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 animate-fade-in">
                                        <h3 className="font-semibold text-slate-800 mb-4 border-b pb-2">New Material</h3>
                                        <form onSubmit={handleMaterialSubmit} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                                    <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                                                        <option value="document">Document (PDF/Doc)</option>
                                                        <option value="recording">Video Recording</option>
                                                        <option value="link">External Link</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Description (Optional)</label>
                                                <textarea rows="2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">File Attachment (Optional)</label>
                                                <input type="file" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100" />
                                            </div>
                                            <div className="flex justify-end space-x-3 pt-4">
                                                <button type="button" onClick={() => setShowMaterialForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
                                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 rounded-lg transition flex items-center">
                                                    {isSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Upload size={16} className="mr-2" />} Upload & Save
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {materials.length === 0 ? (
                                    <div className="p-12 text-center bg-white border border-slate-200 border-dashed rounded-xl">
                                        <FolderOpen size={48} className="mx-auto text-slate-300 mb-3" />
                                        <p className="text-slate-500 font-medium">No materials uploaded yet.</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                        {materials.map(mat => (
                                            <div key={mat._id} className="bg-white border border-slate-200 rounded-xl p-4 hover:shadow-md transition group">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className={`p-2 rounded-lg ${mat.type === 'recording' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                                        {mat.type === 'recording' ? <Video size={20} /> : <FileText size={20} />}
                                                    </div>
                                                    <span className="text-xs py-1 px-2 bg-slate-100 text-slate-500 rounded uppercase font-medium">{mat.type}</span>
                                                </div>
                                                <h3 className="font-semibold text-slate-800 line-clamp-1 mb-1">{mat.title}</h3>
                                                <p className="text-sm text-slate-500 line-clamp-2 h-10">{mat.description}</p>
                                                {mat.fileUrl && (
                                                    <a href={`${import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '') : 'https://api.lernify.tech'}${mat.fileUrl}`} target="_blank" rel="noreferrer" className="text-sm font-medium text-primary-600 hover:text-primary-700 mt-4 inline-block">View File &rarr;</a>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Assessments Layout */}
                        {activeTab === 'assessments' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-slate-800">Assessments for {selectedSubject.name}</h2>
                                    <button
                                        onClick={() => { setFormData({ ...formData, type: 'assignment' }); setShowAssessmentForm(true); }}
                                        className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg text-sm font-medium hover:bg-amber-700 transition"
                                    >
                                        <Plus size={16} className="mr-2" /> Create Task
                                    </button>
                                </div>

                                {showAssessmentForm && (
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 animate-fade-in border-t-4 border-t-amber-500">
                                        <h3 className="font-semibold text-slate-800 mb-4 border-b pb-2">New Assessment Task</h3>
                                        <form onSubmit={handleAssessmentSubmit} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
                                                    <input type="text" required value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                                                    <select value={formData.type} onChange={e => setFormData({ ...formData, type: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500">
                                                        <option value="assignment">Assignment</option>
                                                        <option value="exam">Exam</option>
                                                        <option value="quiz">Quiz</option>
                                                    </select>
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Description / Instructions</label>
                                                <textarea rows="2" required value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Due Date & Time</label>
                                                    <input type="datetime-local" required value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Maximum Marks</label>
                                                    <input type="number" required min="1" value={formData.maxMarks} onChange={e => setFormData({ ...formData, maxMarks: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-amber-500" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-slate-700 mb-1">Setup Document (Optional PDF)</label>
                                                <input type="file" onChange={handleFileChange} className="w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-amber-50 file:text-amber-700 hover:file:bg-amber-100" />
                                            </div>
                                            <div className="flex justify-end space-x-3 pt-4">
                                                <button type="button" onClick={() => setShowAssessmentForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
                                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 rounded-lg transition flex items-center">
                                                    {isSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Upload size={16} className="mr-2" />} Create Task
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {assessments.length === 0 ? (
                                    <div className="p-12 text-center bg-white border border-slate-200 border-dashed rounded-xl">
                                        <BookOpen size={48} className="mx-auto text-slate-300 mb-3" />
                                        <p className="text-slate-500 font-medium">No assessments created yet.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {assessments.map(task => (
                                            <div key={task._id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                                <div>
                                                    <div className="flex items-center space-x-2 mb-1">
                                                        <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded tracking-wide ${task.type === 'exam' ? 'bg-purple-100 text-purple-700' : 'bg-amber-100 text-amber-700'}`}>{task.type}</span>
                                                        <span className="text-sm font-medium text-slate-500">{task.maxMarks} Marks Max</span>
                                                    </div>
                                                    <h3 className="font-bold text-lg text-slate-800">{task.title}</h3>
                                                    <p className="text-sm text-slate-600">{task.description}</p>
                                                </div>
                                                <div className="text-right shrink-0">
                                                    <div className="text-sm font-medium text-slate-500 mb-1">Due Date</div>
                                                    <div className="text-slate-800 font-semibold">{new Date(task.dueDate).toLocaleString()}</div>
                                                    {task.fileUrl && (
                                                        <a href={`${import.meta.env.VITE_API_BASE_URL ? import.meta.env.VITE_API_BASE_URL.replace(/\/api\/?$/, '') : 'https://api.lernify.tech'}${task.fileUrl}`} target="_blank" rel="noreferrer" className="inline-flex items-center text-sm text-primary-600 hover:text-primary-700 font-medium mt-2">
                                                            <FileText size={14} className="mr-1" /> View Context Doc
                                                        </a>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Live Classes Layout */}
                        {activeTab === 'live_classes' && (
                            <div className="space-y-6">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-bold text-slate-800">Live Classes for {selectedSubject.name}</h2>
                                    <button
                                        onClick={() => { setShowLiveClassForm(true); }}
                                        className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700 transition"
                                    >
                                        <Plus size={16} className="mr-2" /> Schedule Class
                                    </button>
                                </div>

                                {showLiveClassForm && (
                                    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm mb-6 animate-fade-in border-t-4 border-t-emerald-500">
                                        <h3 className="font-semibold text-slate-800 mb-4 border-b pb-2">Schedule Video Class</h3>
                                        <form onSubmit={handleLiveClassSubmit} className="space-y-4">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Topic / Agenda</label>
                                                    <input type="text" required value={formData.topic} onChange={e => setFormData({ ...formData, topic: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" placeholder="e.g. Chapter 4 Review" />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium text-slate-700 mb-1">Scheduled Start Time</label>
                                                    <input type="datetime-local" required value={formData.startTime} onChange={e => setFormData({ ...formData, startTime: e.target.value })} className="w-full px-3 py-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500" />
                                                </div>
                                            </div>
                                            <div className="flex justify-end space-x-3 pt-4">
                                                <button type="button" onClick={() => setShowLiveClassForm(false)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition">Cancel</button>
                                                <button type="submit" disabled={isSubmitting} className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition flex items-center">
                                                    {isSubmitting ? <Loader2 size={16} className="animate-spin mr-2" /> : <Video size={16} className="mr-2" />} Schedule
                                                </button>
                                            </div>
                                        </form>
                                    </div>
                                )}

                                {liveClasses.length === 0 ? (
                                    <div className="p-12 text-center bg-white border border-slate-200 border-dashed rounded-xl">
                                        <Video size={48} className="mx-auto text-slate-300 mb-3" />
                                        <p className="text-slate-500 font-medium">No live classes scheduled.</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {liveClasses.map(cls => (
                                            <div key={cls._id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                                <div className="flex items-start space-x-4">
                                                    <div className={`p-4 rounded-xl flex items-center justify-center shrink-0 ${cls.status === 'ongoing' ? 'bg-red-100 text-red-600 animate-pulse' : 'bg-emerald-100 text-emerald-600'}`}>
                                                        <Video size={24} />
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-2 mb-1">
                                                            <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wide ${cls.status === 'ongoing' ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'}`}>{cls.status}</span>
                                                            <span className="text-sm font-medium text-slate-500">
                                                                {new Date(cls.startTime).toLocaleString()}
                                                            </span>
                                                        </div>
                                                        <h3 className="font-bold text-lg text-slate-800">{cls.topic}</h3>
                                                        <p className="text-sm text-slate-500">Room ID: <span className="font-mono bg-slate-100 px-1 py-0.5 rounded">{cls.roomId}</span></p>
                                                    </div>
                                                </div>
                                                <div className="shrink-0 pt-2 md:pt-0">
                                                    {cls.status === 'scheduled' && (
                                                        <button
                                                            onClick={async () => {
                                                                try {
                                                                    await apiClient.put(`/live-classes/${cls._id}/start`);
                                                                    navigate(`/classes/${cls.roomId}`);
                                                                    handleSubjectChange(selectedSubject);
                                                                } catch (err) { alert('Failed to start class'); }
                                                            }}
                                                            className="w-full md:w-auto px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition"
                                                        >
                                                            Start Class Now
                                                        </button>
                                                    )}
                                                    {cls.status === 'ongoing' && (
                                                        <div className="flex flex-col space-y-2">
                                                            <button onClick={() => navigate(`/classes/${cls.roomId}`)} className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition text-sm">
                                                                Rejoin Class
                                                            </button>
                                                            <button
                                                                onClick={async () => {
                                                                    if (window.confirm('Are you sure you want to end this class?')) {
                                                                        try {
                                                                            await apiClient.put(`/live-classes/${cls._id}/end`);
                                                                            handleSubjectChange(selectedSubject);
                                                                        } catch (err) { alert('Error ending class'); }
                                                                    }
                                                                }}
                                                                className="px-6 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium rounded-lg transition text-sm"
                                                            >
                                                                End Session
                                                            </button>
                                                        </div>
                                                    )}
                                                    {cls.status === 'completed' && (
                                                        <button
                                                            onClick={() => handleDownloadCSV(cls._id)}
                                                            className="inline-flex items-center px-4 py-2 border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium rounded-lg transition text-sm whitespace-nowrap cursor-pointer"
                                                        >
                                                            <Download size={16} className="mr-2" /> Export CSV
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-12 bg-white rounded-xl border border-slate-200 shadow-sm border-dashed">
                        <div className="text-center">
                            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                            <h2 className="text-lg font-semibold text-slate-700">Select a Subject</h2>
                            <p className="text-slate-500 text-sm mt-1">Choose a subject from the sidebar to manage its materials and assessments.</p>
                        </div>
                    </div>
                )}

            </div>
        </Layout>
    );
};

export default TeacherCourses;
