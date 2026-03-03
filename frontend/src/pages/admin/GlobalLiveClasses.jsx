import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Layout from '../../components/Layout';
import apiClient from '../../api/apiClient';
import { Video, Calendar, Clock, Loader2, Users, Download } from 'lucide-react';

const GlobalLiveClasses = () => {
    const [liveClasses, setLiveClasses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchGlobalLiveClasses();
    }, []);

    const fetchGlobalLiveClasses = async () => {
        try {
            setLoading(true);
            const { data } = await apiClient.get('/admin/live-classes');
            setLiveClasses(data);
        } catch (error) {
            console.error('Error fetching global live classes:', error);
        } finally {
            setLoading(false);
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

    if (loading) return <Layout title="Global Live Classes"><div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary-500" /></div></Layout>;

    return (
        <Layout title="Platform Live Sessions">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                    <div>
                        <h2 className="text-lg font-semibold text-slate-800">Live Session Monitoring</h2>
                        <p className="text-sm text-slate-500">Overview of all scheduled, ongoing, and completed virtual classrooms.</p>
                    </div>
                    <span className="text-sm px-3 py-1 bg-white rounded-full text-slate-600 border border-slate-200 font-medium flex items-center">
                        <Video size={14} className="mr-1.5 text-primary-500" /> Total Sessions: {liveClasses.length}
                    </span>
                </div>

                <div className="p-0">
                    {liveClasses.length === 0 ? (
                        <div className="p-16 text-center text-slate-500 flex flex-col items-center justify-center">
                            <Video size={48} className="text-slate-200 mb-4" />
                            No live sessions recorded on the platform yet.
                        </div>
                    ) : (
                        <div className="divide-y divide-slate-100 custom-scrollbar max-h-[70vh] overflow-y-auto">
                            {liveClasses.map(session => (
                                <div key={session._id} className="p-6 hover:bg-slate-50 transition group flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
                                    <div className="flex items-start space-x-4">
                                        <div className={`p-4 rounded-xl flex items-center justify-center shrink-0 ${session.status === 'ongoing' ? 'bg-red-100 text-red-600 animate-pulse ring-4 ring-red-50' : session.status === 'completed' ? 'bg-slate-100 text-slate-500' : 'bg-emerald-100 text-emerald-600'}`}>
                                            <Video size={24} />
                                        </div>
                                        <div>
                                            <div className="flex items-center space-x-2 mb-1.5 line-clamp-1">
                                                <span className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded tracking-wide ${session.status === 'ongoing' ? 'bg-red-100 text-red-700' : session.status === 'completed' ? 'bg-slate-200 text-slate-600' : 'bg-emerald-100 text-emerald-700'}`}>{session.status}</span>
                                                <span className="text-sm font-semibold text-slate-700 bg-slate-100 px-2 rounded-md border border-slate-200">{session.subject?.name || 'Unknown Subject'}</span>
                                            </div>
                                            <h3 className="font-bold text-lg text-slate-800 tracking-tight leading-tight mb-1">{session.topic}</h3>

                                            <div className="flex items-center space-x-4 text-xs font-medium mt-2">
                                                <div className="flex items-center text-primary-700 bg-primary-50 px-2py-0.5 rounded">
                                                    <Users size={12} className="mr-1 opacity-70" />
                                                    {session.teacher?.name || 'Unknown Teacher'}
                                                </div>
                                                <div className="flex items-center text-slate-500">
                                                    <Calendar size={12} className="mr-1 opacity-70" />
                                                    {new Date(session.startTime).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center text-slate-500">
                                                    <Clock size={12} className="mr-1 opacity-70" />
                                                    {new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="shrink-0 flex flex-col items-end space-y-2 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 w-full md:w-auto">
                                        <div className="text-xs text-slate-400 font-mono bg-slate-100 px-2 py-1 rounded">Room: {session.roomId.split('-')[0]}...</div>
                                        {session.status === 'ongoing' && (
                                            <Link to={`/classes/${session.roomId}`} className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center mt-2 group-hover:underline">
                                                Spectate Live Session &rarr;
                                            </Link>
                                        )}
                                        {session.status === 'completed' && session.endTime && (
                                            <div className="text-xs text-slate-500 flex flex-col items-end mt-2 space-y-2">
                                                <span>Ended: {new Date(session.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                <button
                                                    onClick={() => handleDownloadCSV(session._id)}
                                                    className="inline-flex items-center px-3 py-1.5 border border-slate-300 text-slate-600 hover:bg-slate-50 font-medium rounded-lg transition whitespace-nowrap cursor-pointer"
                                                >
                                                    <Download size={14} className="mr-1.5" /> Export CSV
                                                </button>
                                            </div>
                                        )}
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

export default GlobalLiveClasses;
