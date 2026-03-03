import React, { useState, useEffect, useContext } from 'react';
import Layout from '../../components/Layout';
import apiClient from '../../api/apiClient';
import { BookOpen, FileText, Download, PlayCircle, Loader2 } from 'lucide-react';
import { AuthContext } from '../../context/AuthContext';

const StudentMaterials = () => {
    const { user } = useContext(AuthContext);
    const [subjects, setSubjects] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user && user.semester) {
            fetchSubjects(user.semester._id || user.semester);
        } else {
            setLoading(false); // Handle case where student has no semester assigned
        }
    }, [user]);

    const fetchSubjects = async (semesterId) => {
        try {
            setLoading(true);
            const { data } = await apiClient.get(`/academic/semesters/${semesterId}/subjects`);
            setSubjects(data);
            if (data.length > 0) {
                setSelectedSubject(data[0]._id);
                fetchMaterials(data[0]._id);
            }
        } catch (error) {
            console.error('Error fetching subjects:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchMaterials = async (subjectId) => {
        try {
            const { data } = await apiClient.get(`/materials/subject/${subjectId}`);
            setMaterials(data);
        } catch (error) {
            console.error('Error fetching materials:', error);
        }
    };

    const handleSubjectChange = (subjectId) => {
        setSelectedSubject(subjectId);
        fetchMaterials(subjectId);
    };

    if (loading) return <Layout title="Study Materials"><div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-500" /></div></Layout>;

    if (!user.semester) {
        return (
            <Layout title="Study Materials">
                <div className="bg-orange-50 text-orange-800 p-6 rounded-xl border border-orange-200">
                    <h2 className="text-lg font-semibold mb-2">Not Enrolled</h2>
                    <p>You have not been assigned to a Semester Group yet. Please contact your administrator.</p>
                </div>
            </Layout>
        );
    }

    return (
        <Layout title="Study Materials">
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

                {/* Materials Content Area */}
                <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-slate-800">
                            {subjects.find(s => s._id === selectedSubject)?.name || 'Subject'} Resources
                        </h2>
                        <span className="text-sm px-3 py-1 bg-slate-100 rounded-full text-slate-600 border border-slate-200">
                            {materials.length} Files Available
                        </span>
                    </div>

                    {materials.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50">
                            <FileText className="mx-auto text-slate-400 mb-3" size={32} />
                            <h3 className="text-slate-700 font-medium">No materials yet</h3>
                            <p className="text-slate-500 text-sm mt-1">Your teacher hasn't uploaded any notes for this subject.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {materials.map(mat => (
                                <div key={mat._id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition bg-slate-50 relative group">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className={`p-2 rounded-lg ${mat.type === 'recording' ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {mat.type === 'recording' ? <PlayCircle size={24} /> : <FileText size={24} />}
                                        </div>
                                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">{mat.type}</span>
                                    </div>
                                    <h3 className="font-semibold text-slate-800 mb-1 line-clamp-1" title={mat.title}>{mat.title}</h3>
                                    <p className="text-xs text-slate-500 mb-4 line-clamp-2 h-8">{mat.description}</p>

                                    <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-200">
                                        <span className="text-xs text-slate-400">By {mat.teacher?.name || 'Instructor'}</span>
                                        <a
                                            href={`http://localhost:5000${mat.fileUrl}`}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-700"
                                        >
                                            <Download size={16} className="mr-1" /> Open
                                        </a>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </Layout>
    );
};

export default StudentMaterials;
