"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  Trash2,
  Edit3,
  CheckCircle2,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
  FileText,
  Save,
  X,
} from "lucide-react";

interface TestCase {
  id: string;
  problemId: string;
  input: string;
  expectedOutput: string;
  isSample: boolean;
  isHidden: boolean;
  orderIndex: number;
  explanation?: string | null;
}

export default function ProblemTestCasesPage() {
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();

  const [problemTitle, setProblemTitle] = useState("");
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form State for creating or editing
  const [editingId, setEditingId] = useState<string | null>(null);
  const [inputVal, setInputVal] = useState("");
  const [outputVal, setOutputVal] = useState("");
  const [isSample, setIsSample] = useState(false);
  const [isHidden, setIsHidden] = useState(true);
  const [orderIndex, setOrderIndex] = useState(1);
  const [explanation, setExplanation] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const probRes = await fetch(`/api/admin/problems/${id}`);
      const probData = await probRes.json();
      if (probRes.ok) {
        setProblemTitle(probData.problem.title);
      }

      const tcRes = await fetch(`/api/admin/problems/${id}/testcases`);
      const tcData = await tcRes.json();
      if (tcRes.ok) {
        setTestCases(tcData.testCases || []);
      }
    } catch {
      setError("Failed to load test cases");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) fetchData();
  }, [id]);

  const resetForm = () => {
    setEditingId(null);
    setInputVal("");
    setOutputVal("");
    setIsSample(false);
    setIsHidden(true);
    setOrderIndex(testCases.length + 1);
    setExplanation("");
    setShowForm(false);
  };

  const handleStartEdit = (tc: TestCase) => {
    setEditingId(tc.id);
    setInputVal(tc.input);
    setOutputVal(tc.expectedOutput);
    setIsSample(tc.isSample);
    setIsHidden(tc.isHidden);
    setOrderIndex(tc.orderIndex);
    setExplanation(tc.explanation || "");
    setShowForm(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        testCaseId: editingId,
        input: inputVal,
        expectedOutput: outputVal,
        isSample,
        isHidden,
        orderIndex: Number(orderIndex),
        explanation: explanation || null,
      };

      const url = `/api/admin/problems/${id}/testcases`;
      const method = editingId ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Failed to save testcase");
      } else {
        await fetchData();
        resetForm();
      }
    } catch {
      setError("Network error while saving testcase");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (tcId: string) => {
    if (!confirm("Are you sure you want to delete this test case?")) return;

    try {
      const res = await fetch(`/api/admin/problems/${id}/testcases?testCaseId=${tcId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setTestCases((prev) => prev.filter((t) => t.id !== tcId));
      } else {
        alert("Failed to delete test case");
      }
    } catch {
      alert("Error deleting test case");
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#243042]">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/problems"
            className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#161f2e] transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Test Cases: {problemTitle || "Loading..."}
            </h1>
            <p className="text-xs text-gray-400">
              Manage sample test cases (visible in statement) and hidden evaluation test cases.
            </p>
          </div>
        </div>

        {!showForm && (
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-sm rounded-lg shadow-md transition-colors"
          >
            <Plus className="w-4 h-4" />
            Add Test Case
          </button>
        )}
      </div>

      {error && (
        <div className="p-4 bg-rose-950/40 border border-rose-800 rounded-xl text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Test Case Create/Edit Panel */}
      {showForm && (
        <form
          onSubmit={handleSave}
          className="bg-[#10151d] border border-emerald-500/30 p-5 rounded-2xl space-y-4 shadow-xl"
        >
          <div className="flex items-center justify-between border-b border-[#243042] pb-3">
            <h3 className="text-sm font-bold text-white">
              {editingId ? "Edit Test Case" : "New Test Case"}
            </h3>
            <button
              type="button"
              onClick={resetForm}
              className="p-1 rounded text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Standard Input (stdin) *
              </label>
              <textarea
                required
                rows={5}
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="[2,7,11,15]&#10;9"
                className="w-full px-3 py-2 bg-[#161e2a] border border-[#243042] rounded-lg text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
                Expected Output (stdout) *
              </label>
              <textarea
                required
                rows={5}
                value={outputVal}
                onChange={(e) => setOutputVal(e.target.value)}
                placeholder="[0,1]"
                className="w-full px-3 py-2 bg-[#161e2a] border border-[#243042] rounded-lg text-emerald-300 font-mono text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="flex items-center gap-3 p-3 bg-[#161e2a] border border-[#243042] rounded-xl">
              <input
                type="checkbox"
                id="isSampleCheck"
                checked={isSample}
                onChange={(e) => setIsSample(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-[#0d1117] border-[#243042]"
              />
              <label htmlFor="isSampleCheck" className="text-xs text-gray-200 cursor-pointer">
                Sample Test Case (Visible to user)
              </label>
            </div>

            <div className="flex items-center gap-3 p-3 bg-[#161e2a] border border-[#243042] rounded-xl">
              <input
                type="checkbox"
                id="isHiddenCheck"
                checked={isHidden}
                onChange={(e) => setIsHidden(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-[#0d1117] border-[#243042]"
              />
              <label htmlFor="isHiddenCheck" className="text-xs text-gray-200 cursor-pointer">
                Hidden Test Case (Judge evaluation only)
              </label>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">
                Order Index / Priority
              </label>
              <input
                type="number"
                value={orderIndex}
                onChange={(e) => setOrderIndex(Number(e.target.value))}
                className="w-full px-3 py-2 bg-[#161e2a] border border-[#243042] rounded-lg text-white text-xs"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Explanation (Optional)
            </label>
            <input
              type="text"
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              placeholder="e.g. nums[0] + nums[1] = 2 + 7 = 9"
              className="w-full px-3 py-2 bg-[#161e2a] border border-[#243042] rounded-lg text-white text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-lg text-xs font-semibold text-gray-400 hover:text-white bg-[#161e2a]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-gray-950 font-bold text-xs rounded-lg shadow"
            >
              {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              Save Test Case
            </button>
          </div>
        </form>
      )}

      {/* List of Test Cases */}
      <div className="space-y-3">
        {loading ? (
          <div className="py-20 flex justify-center">
            <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
          </div>
        ) : testCases.length === 0 ? (
          <div className="py-16 text-center text-gray-400 bg-[#10151d] border border-[#243042] rounded-2xl">
            <p className="text-sm">No test cases created yet for this problem.</p>
            <button
              onClick={() => setShowForm(true)}
              className="mt-3 text-xs text-emerald-400 hover:underline font-semibold"
            >
              + Add First Test Case
            </button>
          </div>
        ) : (
          testCases.map((tc, index) => (
            <div
              key={tc.id}
              className="bg-[#10151d] border border-[#243042] p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-gray-600 transition-colors"
            >
              <div className="space-y-2 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#161e2a] text-gray-300 font-mono text-xs flex items-center justify-center font-bold">
                    {tc.orderIndex || index + 1}
                  </span>
                  {tc.isSample && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Sample Test
                    </span>
                  )}
                  {tc.isHidden && (
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-500/20 text-purple-400 border border-purple-500/30">
                      Hidden
                    </span>
                  )}
                  {tc.explanation && (
                    <span className="text-xs text-gray-400 italic">“{tc.explanation}”</span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs font-mono">
                  <div className="p-2.5 bg-[#0d1117] rounded-lg border border-[#243042]">
                    <span className="text-gray-500 text-[10px] block uppercase font-sans mb-1">
                      Input:
                    </span>
                    <pre className="text-emerald-300 whitespace-pre-wrap max-h-24 overflow-y-auto">
                      {tc.input}
                    </pre>
                  </div>
                  <div className="p-2.5 bg-[#0d1117] rounded-lg border border-[#243042]">
                    <span className="text-gray-500 text-[10px] block uppercase font-sans mb-1">
                      Expected Output:
                    </span>
                    <pre className="text-blue-300 whitespace-pre-wrap max-h-24 overflow-y-auto">
                      {tc.expectedOutput}
                    </pre>
                  </div>
                </div>
              </div>

              <div className="flex md:flex-col items-center gap-2 shrink-0">
                <button
                  onClick={() => handleStartEdit(tc)}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-[#161f2e] transition-colors"
                  title="Edit test case"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(tc.id)}
                  className="p-2 rounded-lg text-rose-400 hover:text-rose-300 hover:bg-rose-950/30 transition-colors"
                  title="Delete test case"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
