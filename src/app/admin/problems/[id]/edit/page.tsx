"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProblemForm from "@/components/admin/ProblemForm";
import { Loader2 } from "lucide-react";

export default function EditProblemPage() {
  const params = useParams();
  const id = params?.id as string;
  const [problem, setProblem] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/admin/problems/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setProblem(data.problem);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="py-24 flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-emerald-400 animate-spin" />
      </div>
    );
  }

  if (!problem) {
    return (
      <div className="py-24 text-center text-gray-400">
        <p>Problem not found.</p>
      </div>
    );
  }

  return <ProblemForm initialData={problem} isEdit={true} />;
}
