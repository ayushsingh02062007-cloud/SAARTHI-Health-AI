
import { useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

function ReviewerDashboard({ result, reportResult }) {
  const [reviewStatus, setReviewStatus] =
    useState("Pending Review");

  const [reviewNote, setReviewNote] =
    useState("");

  const [showReferral, setShowReferral] =
    useState(false);

  const [showClarification, setShowClarification] =
    useState(false);

  const [actionLoading, setActionLoading] =
    useState(false);

  const [actionError, setActionError] =
    useState("");

  if (!result) {
    return (
      <section className="mt-6 rounded-2xl border bg-white p-8 text-center shadow-sm">
        <div className="text-4xl">👨‍⚕️</div>

        <h3 className="mt-3 text-xl font-bold text-slate-800">
          Reviewer Dashboard
        </h3>

        <p className="mt-2 text-sm text-slate-500">
          Triage analysis ke baad structured patient
          review information yahan appear hogi.
        </p>
      </section>
    );
  }

  const triage = result.triage || {};

  const urgency =
    Boolean(triage.urgency_signal);

  const matchedSignals =
    triage.matched_safety_signals || [];

  const missingInformation =
    triage.missing_information || [];

  const followUpQuestions =
    triage.suggested_follow_up_questions || [];

  const labValues =
    reportResult?.report?.lab_values || {};

  const patientId =
    result.patient_id || "Not available";

  const reportSummary =
    reportResult?.report?.summary ||
    result.report?.summary ||
    "No report summary available.";

  // ==========================================
  // Backend Reviewer Action
  // ==========================================

  const performReviewerAction = async (action) => {
    setActionError("");
    setActionLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/reviewer/action`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patient_id: patientId,
            action: action,
            reviewer_note: reviewNote,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Reviewer action request failed."
        );
      }

      const data = await response.json();

      if (data.status !== "success") {
        throw new Error(
          data.message ||
          "Reviewer action could not be completed."
        );
      }

      return data;
    } catch (error) {
      console.error(
        "Reviewer action error:",
        error
      );

      setActionError(
        "Unable to connect with reviewer backend."
      );

      return null;
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // Acknowledge Review
  // ==========================================

  const handleAcknowledge = async () => {
    const data =
      await performReviewerAction(
        "acknowledge"
      );

    if (!data) {
      return;
    }

    setReviewStatus("Acknowledged");

    setReviewNote(
      data.message ||
      "Reviewer has acknowledged the structured triage information."
    );

    setShowReferral(false);
    setShowClarification(false);
  };

  // ==========================================
  // Request Clarification
  // ==========================================

  const handleClarification = async () => {
    const data =
      await performReviewerAction(
        "request_clarification"
      );

    if (!data) {
      return;
    }

    setReviewStatus(
      "Clarification Required"
    );

    setShowClarification(true);
    setShowReferral(false);

    setReviewNote(
      data.message ||
      "Additional patient information is required before final clinical assessment."
    );
  };

  // ==========================================
  // Prepare Referral
  // ==========================================

  const handleReferral = async () => {
    setActionError("");
    setActionLoading(true);

    try {
      const response = await fetch(
        `${API_BASE_URL}/reviewer/referral`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            patient_id: patientId,
            action: "prepare_referral",
            reviewer_note: reviewNote,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "Referral preparation request failed."
        );
      }

      const data = await response.json();

      if (data.status !== "success") {
        throw new Error(
          data.message ||
          "Referral preparation failed."
        );
      }

      setReviewStatus(
        "Referral Preparation"
      );

      setShowReferral(true);
      setShowClarification(false);

      setReviewNote(
        data.message ||
        "Referral preparation initiated for professional review."
      );
    } catch (error) {
      console.error(
        "Referral preparation error:",
        error
      );

      setActionError(
        "Unable to connect with referral backend."
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ==========================================
  // Reset Review
  // ==========================================

  const handleResetReview = () => {
    setReviewStatus("Pending Review");
    setReviewNote("");
    setShowReferral(false);
    setShowClarification(false);
    setActionError("");
  };

  return (
    <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">

      {/* ======================================
          Dashboard Header
      ====================================== */}

      <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">

        <div>

          <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
            Clinical Review Workspace
          </p>

          <h3 className="mt-1 text-2xl font-bold text-slate-900">
            👨‍⚕️ Reviewer Dashboard
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Structured information prepared for
            healthcare professional review.
          </p>

        </div>

        <div
          className={`w-fit rounded-full px-4 py-2 text-sm font-bold ${
            urgency
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {urgency
            ? "⚠️ Review Priority Signal"
            : "✓ Standard Review"}
        </div>

      </div>

      {/* ======================================
          Review Status
      ====================================== */}

      <div className="mt-6 rounded-xl border bg-slate-50 p-5">

        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">

          <div>

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Current Review Status
            </p>

            <p
              className={`mt-1 text-lg font-bold ${
                reviewStatus === "Acknowledged"
                  ? "text-green-700"
                  : reviewStatus ===
                    "Clarification Required"
                  ? "text-amber-700"
                  : reviewStatus ===
                    "Referral Preparation"
                  ? "text-blue-700"
                  : "text-slate-800"
              }`}
            >
              {reviewStatus}
            </p>

          </div>

          <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-600">
            Patient: {patientId}
          </span>

        </div>

      </div>

      {/* ======================================
          Patient Overview
      ====================================== */}

      <div className="mt-6 grid gap-4 md:grid-cols-4">

        <div className="rounded-xl bg-slate-50 p-4">

          <p className="text-xs text-slate-500">
            Patient ID
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {patientId}
          </p>

        </div>

        <div className="rounded-xl bg-slate-50 p-4">

          <p className="text-xs text-slate-500">
            Reported Symptoms
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-800">
            {triage.reported_symptoms ||
              "Not available"}
          </p>

        </div>

        <div className="rounded-xl bg-slate-50 p-4">

          <p className="text-xs text-slate-500">
            Duration
          </p>

          <p className="mt-1 font-bold text-slate-900">
            {triage.symptom_duration ||
              "Not available"}
          </p>

        </div>

        <div className="rounded-xl bg-slate-50 p-4">

          <p className="text-xs text-slate-500">
            Human Review
          </p>

          <p className="mt-1 font-bold text-blue-700">
            Required
          </p>

        </div>

      </div>

      {/* ======================================
          Safety Signals
      ====================================== */}

      <div className="mt-6 rounded-xl border border-red-200 bg-red-50 p-5">

        <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">

          <h4 className="font-bold text-red-900">
            🛡️ Safety Signals
          </h4>

          <span className="w-fit rounded-full bg-white px-3 py-1 text-xs font-semibold text-red-700">
            {urgency
              ? "Signal Detected"
              : "No Predefined Signal"}
          </span>

        </div>

        {matchedSignals.length > 0 ? (

          <div className="mt-4 flex flex-wrap gap-2">

            {matchedSignals.map(
              (signal, index) => (

                <span
                  key={index}
                  className="rounded-full bg-red-100 px-3 py-2 text-xs font-bold text-red-700"
                >
                  {signal}
                </span>

              )
            )}

          </div>

        ) : (

          <p className="mt-3 text-sm text-slate-600">
            No predefined safety signal was detected.
            Professional review is still required.
          </p>

        )}

      </div>

      {/* ======================================
          Missing Information + Questions
      ====================================== */}

      <div className="mt-6 grid gap-5 md:grid-cols-2">

        <div className="rounded-xl border p-5">

          <h4 className="font-bold text-slate-900">
            ❓ Missing Information
          </h4>

          {missingInformation.length > 0 ? (

            <ul className="mt-4 space-y-2">

              {missingInformation.map(
                (item, index) => (

                  <li
                    key={index}
                    className="rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-800"
                  >
                    • {item}
                  </li>

                )
              )}

            </ul>

          ) : (

            <p className="mt-4 text-sm text-green-700">
              No required information is currently
              missing.
            </p>

          )}

        </div>

        <div className="rounded-xl border p-5">

          <h4 className="font-bold text-slate-900">
            💬 Follow-up Questions
          </h4>

          {followUpQuestions.length > 0 ? (

            <ul className="mt-4 space-y-2">

              {followUpQuestions.map(
                (question, index) => (

                  <li
                    key={index}
                    className="rounded-lg bg-blue-50 px-3 py-2 text-sm text-blue-800"
                  >
                    {index + 1}. {question}
                  </li>

                )
              )}

            </ul>

          ) : (

            <p className="mt-4 text-sm text-slate-500">
              No follow-up questions available.
            </p>

          )}

        </div>

      </div>

      {/* ======================================
          Medical Report
      ====================================== */}

      {reportResult && (

        <div className="mt-6 rounded-xl border bg-slate-50 p-5">

          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">

            <h4 className="font-bold text-slate-900">
              📄 Medical Report Summary
            </h4>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
              Report Processed
            </span>

          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">

            <div className="rounded-lg bg-white p-4">

              <p className="text-xs text-slate-500">
                Report
              </p>

              <p className="mt-1 break-all text-sm font-semibold">
                {reportResult.filename ||
                  reportResult.report?.filename ||
                  "Uploaded report"}
              </p>

            </div>

            <div className="rounded-lg bg-white p-4">

              <p className="text-xs text-slate-500">
                Extracted Observations
              </p>

              {Object.keys(labValues).length > 0 ? (

                <div className="mt-3 space-y-2">

                  {Object.entries(
                    labValues
                  ).map(
                    ([key, value]) => (

                      <div
                        key={key}
                        className="flex justify-between gap-4 border-b border-slate-100 pb-2 text-sm last:border-0"
                      >

                        <span className="font-medium capitalize text-slate-600">
                          {key.replaceAll(
                            "_",
                            " "
                          )}
                        </span>

                        <span className="font-bold text-slate-900">
                          {value}
                        </span>

                      </div>

                    )
                  )}

                </div>

              ) : (

                <p className="mt-3 text-sm text-slate-500">
                  No structured observations extracted.
                </p>

              )}

            </div>

          </div>

          <div className="mt-4 rounded-lg bg-white p-4">

            <p className="text-xs text-slate-500">
              Report Summary
            </p>

            <p className="mt-1 text-sm leading-6 text-slate-700">
              {reportSummary}
            </p>

          </div>

        </div>

      )}

      {/* ======================================
          Review Actions
      ====================================== */}

      <div className="mt-6 rounded-xl border-2 border-blue-200 bg-blue-50 p-5">

        <h4 className="font-bold text-blue-900">
          👨‍⚕️ Reviewer Actions
        </h4>

        <p className="mt-2 text-sm text-blue-800">
          These actions organize the workflow for the
          healthcare professional. They do not represent
          an automated clinical decision.
        </p>

        {actionError && (

          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm font-semibold text-red-700">
            ⚠️ {actionError}
          </div>

        )}

        <div className="mt-5 flex flex-wrap gap-3">

          {/* Acknowledge */}

          <button
            type="button"
            onClick={handleAcknowledge}
            disabled={actionLoading}
            className="rounded-xl bg-green-600 px-5 py-3 text-sm font-semibold text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLoading
              ? "Processing..."
              : "✓ Acknowledge Review"}
          </button>

          {/* Clarification */}

          <button
            type="button"
            onClick={handleClarification}
            disabled={actionLoading}
            className="rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white hover:bg-amber-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLoading
              ? "Processing..."
              : "❓ Request Clarification"}
          </button>

          {/* Referral */}

          <button
            type="button"
            onClick={handleReferral}
            disabled={actionLoading}
            className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {actionLoading
              ? "Processing..."
              : "📋 Prepare Referral"}
          </button>

          {/* Reset */}

          <button
            type="button"
            onClick={handleResetReview}
            disabled={actionLoading}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Reset Review
          </button>

        </div>

        {/* Review Note */}

        {reviewNote && (

          <div className="mt-5 rounded-xl bg-white p-4">

            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Workflow Note
            </p>

            <p className="mt-2 text-sm leading-6 text-slate-700">
              {reviewNote}
            </p>

          </div>

        )}

      </div>

      {/* ======================================
          Clarification Panel
      ====================================== */}

      {showClarification && (

        <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-5">

          <h4 className="font-bold text-amber-900">
            ❓ Clarification Checklist
          </h4>

          <p className="mt-2 text-sm text-amber-800">
            Reviewer may collect or verify the following
            information from the patient.
          </p>

          <ul className="mt-4 space-y-2">

            {followUpQuestions.length > 0 ? (

              followUpQuestions.map(
                (question, index) => (

                  <li
                    key={index}
                    className="rounded-lg bg-white px-4 py-3 text-sm text-slate-700"
                  >
                    {index + 1}. {question}
                  </li>

                )
              )

            ) : (

              <li className="rounded-lg bg-white px-4 py-3 text-sm text-slate-700">
                Verify missing patient information
                before final assessment.
              </li>

            )}

          </ul>

        </div>

      )}

      {/* ======================================
          Referral Preparation
      ====================================== */}

      {showReferral && (

        <div className="mt-5 rounded-xl border border-blue-200 bg-blue-50 p-5">

          <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">

            <h4 className="font-bold text-blue-900">
              📋 Referral Preparation
            </h4>

            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-blue-700">
              Draft Only
            </span>

          </div>

          <div className="mt-4 rounded-xl bg-white p-5">

            <div className="grid gap-4 md:grid-cols-2">

              <div>

                <p className="text-xs text-slate-500">
                  Patient ID
                </p>

                <p className="mt-1 font-semibold">
                  {patientId}
                </p>

              </div>

              <div>

                <p className="text-xs text-slate-500">
                  Review Status
                </p>

                <p className="mt-1 font-semibold text-blue-700">
                  Referral Preparation
                </p>

              </div>

              <div>

                <p className="text-xs text-slate-500">
                  Reported Symptoms
                </p>

                <p className="mt-1 text-sm">
                  {triage.reported_symptoms ||
                    "Not available"}
                </p>

              </div>

              <div>

                <p className="text-xs text-slate-500">
                  Symptom Duration
                </p>

                <p className="mt-1 text-sm">
                  {triage.symptom_duration ||
                    "Not available"}
                </p>

              </div>

            </div>

            <div className="mt-4 rounded-lg bg-slate-50 p-4">

              <p className="text-xs text-slate-500">
                Safety Signals
              </p>

              <p className="mt-1 text-sm">
                {matchedSignals.length > 0
                  ? matchedSignals.join(", ")
                  : "No predefined safety signal detected."}
              </p>

            </div>

            <div className="mt-4 rounded-lg bg-slate-50 p-4">

              <p className="text-xs text-slate-500">
                Report Summary
              </p>

              <p className="mt-1 text-sm leading-6">
                {reportSummary}
              </p>

            </div>

          </div>

          <p className="mt-4 text-xs leading-5 text-blue-800">
            This is a referral preparation draft for
            professional review. SAARTHI does not decide
            referral destination or provide diagnosis or
            treatment.
          </p>

        </div>

      )}

      {/* ======================================
          Final Human Review
      ====================================== */}

      <div className="mt-6 rounded-xl border-2 border-blue-200 bg-blue-50 p-5">

        <h4 className="font-bold text-blue-900">
          🩺 Final Human Review
        </h4>

        <p className="mt-2 text-sm leading-6 text-blue-800">
          SAARTHI only organizes reported information
          and highlights predefined safety signals.
          Final clinical assessment, prioritization,
          referral, diagnosis and treatment decisions
          must be made by a qualified healthcare
          professional.
        </p>

        <div className="mt-4 flex flex-wrap gap-3">

          <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700">
            ✓ Information Organized
          </span>

          <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700">
            ✓ Safety Signal Checked
          </span>

          <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700">
            ✓ Human Review Required
          </span>

          <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-slate-700">
            ✓ No Automated Diagnosis
          </span>

        </div>

      </div>

    </section>
  );
}

export default ReviewerDashboard;
