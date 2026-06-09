import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Send, Star, User, Calendar, CheckCircle2, Clock, FileText } from 'lucide-react';
import Layout from '../components/common/Layout';
import assignmentService from '../services/assignmentService';
import useAuthStore from '../store/authStore';

const statusCls = {
  SUBMITTED:'text-blue-300 bg-blue-900/30 border-blue-700/50',
  RESUBMITTED:'text-cyan-300 bg-cyan-900/30 border-cyan-700/50',
  GRADED:'text-emerald-300 bg-emerald-900/30 border-emerald-700/50',
  LATE:'text-orange-300 bg-orange-900/30 border-orange-700/50',
  NOT_SUBMITTED:'text-dark-400 bg-dark-800 border-dark-700',
};

export default function AssignmentDetail() {
  const { id } = useParams();
  const { user } = useAuthStore();
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [gradeMap, setGradeMap] = useState({});   // submissionId → {score, feedback}
  const [gradingId, setGradingId] = useState(null);

  const isTeacher = user?.role === 'TEACHER' || user?.role === 'SCHOOL';

  useEffect(() => { load(); }, [id]);

  const load = async () => {
    setLoading(true);
    try {
      const r = await assignmentService.getById(id);
      setAssignment(r.data.data);
    } catch (_) {}
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;
    setSubmitting(true);
    try {
      await assignmentService.submit(id, { content });
      setContent('');
      load();
    } catch (e) { alert(e.response?.data?.message || 'Submission failed'); }
    setSubmitting(false);
  };

  const handleGrade = async (submissionId) => {
    const g = gradeMap[submissionId];
    if (!g?.score) return;
    setGradingId(submissionId);
    try {
      await assignmentService.grade(submissionId, { score: g.score, feedback: g.feedback || '' });
      load();
    } catch (e) { alert(e.response?.data?.message || 'Grading failed'); }
    setGradingId(null);
  };

  if (loading) return (
    <Layout><div className="max-w-3xl mx-auto space-y-3">
      {[...Array(4)].map((_,i) => <div key={i} className="h-24 bg-dark-800 rounded-2xl animate-pulse"/>)}
    </div></Layout>
  );

  if (!assignment) return (
    <Layout><div className="text-center py-20 text-dark-400">Assignment not found.</div></Layout>
  );

  const mySubmission = isTeacher ? null : assignment.submissions?.[0];
  const submissions = isTeacher ? (assignment.submissions || []) : [];
  const dueDate = new Date(assignment.dueDate);
  const isPast = dueDate < new Date();

  return (
    <Layout>
      <div className="max-w-3xl mx-auto">
        <Link to="/assignments" className="inline-flex items-center gap-2 text-dark-400 hover:text-dark-100 text-sm mb-5 transition-colors">
          <ArrowLeft size={14}/> Back to Assignments
        </Link>

        {/* Assignment card */}
        <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 mb-5">
          <div className="flex items-start justify-between gap-3 flex-wrap mb-4">
            <div className="flex-1 min-w-0">
              <h1 className="font-display font-bold text-xl text-dark-50">{assignment.title}</h1>
              <p className="text-dark-400 text-sm mt-1 flex items-center gap-3 flex-wrap">
                <span className="flex items-center gap-1"><User size={12}/> {assignment.teacher?.name}</span>
                <span className="flex items-center gap-1"><Calendar size={12}/> Due {dueDate.toLocaleString()}</span>
                <span className="flex items-center gap-1"><Star size={12}/> Max {assignment.maxScore} pts</span>
              </p>
            </div>
            {isPast && <span className="text-xs px-3 py-1 rounded-full bg-red-900/30 text-red-300 border border-red-700/50 font-semibold">Deadline Passed</span>}
          </div>

          {assignment.description && (
            <p className="text-dark-300 text-sm leading-relaxed border-t border-dark-700 pt-4">{assignment.description}</p>
          )}
          {assignment.instructions && (
            <div className="mt-4 p-4 bg-dark-900 rounded-xl border border-dark-700">
              <p className="text-dark-400 text-xs font-semibold uppercase tracking-wide mb-2">Instructions</p>
              <p className="text-dark-200 text-sm leading-relaxed whitespace-pre-line">{assignment.instructions}</p>
            </div>
          )}
          {assignment.resource && (
            <a href={assignment.resource.fileUrl} target="_blank" rel="noreferrer"
              className="inline-flex items-center gap-2 mt-4 text-sm text-brand-400 hover:text-brand-300 bg-brand-900/20 border border-brand-700/30 px-3 py-2 rounded-xl transition-colors">
              <FileText size={14}/> Reference: {assignment.resource.title}
            </a>
          )}
        </div>

        {/* STUDENT — My submission */}
        {!isTeacher && (
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6 mb-5">
            <h2 className="font-semibold text-dark-100 mb-4 flex items-center gap-2">
              <Send size={16} className="text-violet-400"/> My Submission
            </h2>

            {mySubmission ? (
              <div>
                <div className="flex items-center gap-3 mb-3 flex-wrap">
                  <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${statusCls[mySubmission.status]||statusCls.NOT_SUBMITTED}`}>
                    {mySubmission.status}
                  </span>
                  <span className="text-dark-500 text-xs flex items-center gap-1">
                    <Clock size={11}/> {new Date(mySubmission.submittedAt).toLocaleString()}
                  </span>
                  {mySubmission.score != null && (
                    <span className="text-emerald-300 font-bold text-sm ml-auto">
                      Score: {mySubmission.score} / {assignment.maxScore}
                    </span>
                  )}
                </div>
                {mySubmission.content && (
                  <div className="bg-dark-900 rounded-xl p-4 text-dark-200 text-sm whitespace-pre-line mb-3">{mySubmission.content}</div>
                )}
                {mySubmission.feedback && (
                  <div className="bg-emerald-900/20 border border-emerald-700/30 rounded-xl p-4">
                    <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wide mb-1">Teacher Feedback</p>
                    <p className="text-dark-200 text-sm">{mySubmission.feedback}</p>
                  </div>
                )}
                {(!isPast || assignment.allowLate) && (
                  <p className="text-dark-500 text-xs mt-3">You can resubmit — just write below and click Submit again.</p>
                )}
              </div>
            ) : (
              <p className="text-dark-500 text-sm mb-3">You haven't submitted yet.</p>
            )}

            {(!isPast || assignment.allowLate) && (
              <div className="mt-4">
                <textarea value={content} onChange={e => setContent(e.target.value)}
                  placeholder="Write your answer here…" rows={5}
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl px-4 py-3 text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-violet-500 resize-none"/>
                <button onClick={handleSubmit} disabled={submitting || !content.trim()}
                  className="mt-3 flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold text-sm bg-gradient-to-r from-violet-600 to-purple-600 hover:opacity-90 transition-opacity disabled:opacity-50">
                  <Send size={14}/> {submitting ? 'Submitting…' : mySubmission ? 'Resubmit' : 'Submit'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* TEACHER — Submissions list */}
        {isTeacher && (
          <div className="bg-dark-800 border border-dark-700 rounded-2xl p-6">
            <h2 className="font-semibold text-dark-100 mb-4 flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-400"/> Submissions
              <span className="text-dark-500 text-sm font-normal">({submissions.length})</span>
            </h2>
            {submissions.length === 0 ? (
              <p className="text-dark-500 text-sm">No submissions yet.</p>
            ) : (
              <div className="space-y-4">
                {submissions.map(sub => {
                  const g = gradeMap[sub.id] || { score: sub.score ?? '', feedback: sub.feedback ?? '' };
                  return (
                    <div key={sub.id} className="border border-dark-700 rounded-xl p-4">
                      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-brand-600 to-purple-600 flex items-center justify-center text-white font-bold text-xs">
                            {sub.student?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="text-dark-100 font-semibold text-sm">{sub.student?.name}</p>
                            <p className="text-dark-500 text-xs">{new Date(sub.submittedAt).toLocaleString()}</p>
                          </div>
                        </div>
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusCls[sub.status]||statusCls.NOT_SUBMITTED}`}>
                          {sub.status}
                        </span>
                      </div>
                      {sub.content && (
                        <p className="text-dark-300 text-sm bg-dark-900 rounded-xl p-3 mb-3 whitespace-pre-line">{sub.content}</p>
                      )}
                      {/* Grade row */}
                      <div className="flex items-center gap-2 flex-wrap">
                        <input type="number" placeholder="Score" min={0} max={assignment.maxScore}
                          value={g.score}
                          onChange={e => setGradeMap(p => ({...p,[sub.id]:{...g,score:e.target.value}}))}
                          className="w-24 bg-dark-900 border border-dark-700 rounded-xl px-3 py-1.5 text-sm text-dark-100 focus:outline-none focus:border-emerald-500"/>
                        <span className="text-dark-500 text-xs">/ {assignment.maxScore}</span>
                        <input type="text" placeholder="Feedback (optional)"
                          value={g.feedback}
                          onChange={e => setGradeMap(p => ({...p,[sub.id]:{...g,feedback:e.target.value}}))}
                          className="flex-1 min-w-[160px] bg-dark-900 border border-dark-700 rounded-xl px-3 py-1.5 text-sm text-dark-100 placeholder:text-dark-500 focus:outline-none focus:border-emerald-500"/>
                        <button onClick={() => handleGrade(sub.id)} disabled={gradingId===sub.id||!g.score}
                          className="px-4 py-1.5 rounded-xl text-white text-xs font-semibold bg-emerald-700 hover:bg-emerald-600 transition-colors disabled:opacity-50">
                          {gradingId===sub.id ? 'Saving…' : sub.status==='GRADED' ? 'Update' : 'Grade'}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
}
