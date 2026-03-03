import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../../components/Layout';
import apiClient from '../../api/apiClient';
import { AuthContext } from '../../context/AuthContext';
import { BookOpen, Video, Loader2, PlayCircle, Calendar } from 'lucide-react';

const StudentSubjects = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const [subjects, setSubjects] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState(null);
    const [liveClasses, setLiveClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [loadingClasses, setLoadingClasses] = useState(false);

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
            setLoadingClasses(true);
            const { data } = await apiClient.get(`/live-classes/subject/${subject._id}`);
            setLiveClasses(data);
        } catch (error) {
            console.error('Error fetching live classes:', error);
        } finally {
            setLoadingClasses(false);
        }
    };

    const handleJoinClass = (roomId) => {
        // Navigate directly in the same tab to preserve sessionStorage
        navigate(`/classes/${roomId}`);
    };

    if (loading && subjects.length === 0) return <Layout title="Enrolled Subjects"><div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-500" /></div></Layout>;

    if (!user || !user.semester) {
        return (
            <Layout title="Enrolled Subjects">
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl border border-slate-200 shadow-sm border-dashed">
                    <BookOpen size={48} className="text-slate-300 mb-4" />
                    <h2 className="text-lg font-semibold text-slate-700">Not Assigned</h2>
                    <p className="text-slate-500 text-sm mt-1">You have not been assigned to a semester group yet. Please contact your administrator.</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Enrolled Subjects">
            <div className="flex flex-col md:flex-row gap-6">

                {/* Subjects Sidebar */}
                <div className="w-full md:w-72 shrink-0">
                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden sticky top-6">
                        <div className="p-4 bg-slate-50 border-b border-slate-100 font-semibold text-slate-700 flex justify-between items-center">
                            <span>My Subjects</span>
                            <span className="text-xs font-medium px-2 py-1 bg-slate-200 text-slate-600 rounded-full">{subjects.length}</span>
                        </div>
                        <div className="divide-y divide-slate-100 max-h-[calc(100vh-250px)] overflow-y-auto">
                            {subjects.map(sub => (
                                <button
                                    key={sub._id}
                                    onClick={() => handleSubjectChange(sub)}
                                    className={`w-full text-left p-4 transition ${selectedSubject?._id === sub._id ? 'bg-primary-50 border-l-4 border-primary-500' : 'hover:bg-slate-50 border-l-4 border-transparent'}`}
                                >
                                    <div className={`font-semibold mb-1 ${selectedSubject?._id === sub._id ? 'text-primary-700' : 'text-slate-700'}`}>
                                        {sub.name}
                                    </div>
                                    <div className="text-xs text-slate-500 font-medium">{sub.code} &middot; {sub.credits} Credits</div>
                                </button>
                            ))}
                            {subjects.length === 0 && (
                                <div className="p-6 text-sm text-slate-500 text-center">No subjects found in your semester.</div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Main Content Area (Live Classes) */}
                {selectedSubject ? (
                    <div className="flex-1 min-w-0">
                        <div className="mb-6">
                            <h2 className="text-2xl font-bold text-slate-800">{selectedSubject.name}</h2>
                            <p className="text-slate-500">Virtual Classrooms & Live Sessions</p>
                        </div>

                        {loadingClasses ? (
                            <div className="flex justify-center p-12 bg-white rounded-xl border border-slate-200 shadow-sm"><Loader2 className="animate-spin text-primary-500" /></div>
                        ) : liveClasses.length === 0 ? (
                            <div className="p-12 text-center bg-white border border-slate-200 rounded-xl shadow-sm">
                                <Video size={48} className="mx-auto text-slate-300 mb-4" />
                                <h3 className="text-lg font-medium text-slate-700">No Active Sessions</h3>
                                <p className="text-slate-500 text-sm mt-1">There are no live video classes running or scheduled for this subject currently.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {liveClasses.map(cls => (
                                    <div key={cls._id} className={`bg-white rounded-xl border shadow-sm overflow-hidden transition hover:shadow-md ${cls.status === 'ongoing' ? 'border-emerald-200 ring-1 ring-emerald-500/20' : 'border-slate-200'}`}>
                                        <div className={`px-4 py-3 border-b flex justify-between items-center ${cls.status === 'ongoing' ? 'bg-emerald-50 border-emerald-100' : 'bg-slate-50 border-slate-100'}`}>
                                            <div className="flex items-center space-x-2">
                                                {cls.status === 'ongoing' ? (
                                                    <span className="flex h-2.5 w-2.5 relative">
                                                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                                        <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                                                    </span>
                                                ) : (
                                                    <Calendar size={14} className="text-slate-400" />
                                                )}
                                                <span className={`text-xs font-bold uppercase tracking-wider ${cls.status === 'ongoing' ? 'text-emerald-700' : 'text-slate-500'}`}>{cls.status}</span>
                                            </div>
                                            {cls.status === 'scheduled' && (
                                                <span className="text-xs font-semibold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200 shadow-sm">
                                                    {new Date(cls.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            )}
                                        </div>
                                        <div className="p-5">
                                            <h3 className="font-bold text-lg text-slate-800 mb-1 leading-tight">{cls.topic}</h3>
                                            <p className="text-sm text-slate-500 mb-6">Prof. {cls.teacher?.name}</p>

                                            {cls.status === 'ongoing' ? (
                                                <button
                                                    onClick={() => handleJoinClass(cls.roomId)}
                                                    className="w-full flex items-center justify-center px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white font-medium rounded-lg transition shadow-sm"
                                                >
                                                    <PlayCircle size={18} className="mr-2" /> Join Class Now
                                                </button>
                                            ) : (
                                                <button
                                                    disabled
                                                    className="w-full flex items-center justify-center px-4 py-2.5 bg-slate-100 text-slate-400 font-medium rounded-lg cursor-not-allowed"
                                                >
                                                    Starts at {new Date(cls.startTime).toLocaleString()}
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="flex-1 flex items-center justify-center p-12 bg-white rounded-xl border border-slate-200 shadow-sm border-dashed">
                        <div className="text-center">
                            <BookOpen size={48} className="mx-auto text-slate-300 mb-4" />
                            <h2 className="text-lg font-semibold text-slate-700">Select a Subject</h2>
                            <p className="text-slate-500 text-sm mt-1">Choose an enrolled subject from the sidebar to view its live classes.</p>
                        </div>
                    </div>
                )}
            </div>
        </Layout>
    );
};

export default StudentSubjects;
