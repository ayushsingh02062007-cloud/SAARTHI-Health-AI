
import { useEffect, useState } from "react";
import ReviewerDashboard from "./ReviewerDashboard";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000";

const languageContent = {
  English: {
    title: "SAARTHI Health AI",
    subtitle: "AI-assisted healthcare triage support",
    patientInfo: "Patient Information",
    patientId: "Patient ID",
    age: "Age",
    gender: "Gender",
    language: "Language",
    symptoms: "Symptoms",
    duration: "Symptom Duration",
    analyze: "Analyze Triage",
    aiAnalyze: "AI Information Analysis",
    clear: "Clear Workspace",
    voice: "Voice Input",
    listening: "Listening...",
    extraction: "AI Information Extraction",
    report: "Medical Report",
    upload: "Upload Report",
    result: "Triage Result",
    urgency: "Urgency Signal",
    missing: "Missing Information",
    followUp: "Suggested Follow-up Questions",
    humanReview: "Human Review",
    safety: "Safety Review",
  },

  Hindi: {
    title: "SAARTHI Health AI",
    subtitle: "AI आधारित स्वास्थ्य ट्रायेज सहायता",
    patientInfo: "मरीज की जानकारी",
    patientId: "मरीज ID",
    age: "उम्र",
    gender: "लिंग",
    language: "भाषा",
    symptoms: "लक्षण",
    duration: "लक्षण की अवधि",
    analyze: "ट्रायेज विश्लेषण",
    aiAnalyze: "AI जानकारी विश्लेषण",
    clear: "वर्कस्पेस साफ करें",
    voice: "आवाज़ से जानकारी",
    listening: "सुन रहा है...",
    extraction: "AI जानकारी निष्कर्षण",
    report: "मेडिकल रिपोर्ट",
    upload: "रिपोर्ट अपलोड करें",
    result: "ट्रायेज परिणाम",
    urgency: "तत्कालता संकेत",
    missing: "आवश्यक जानकारी",
    followUp: "अगले प्रश्न",
    humanReview: "मानवीय समीक्षा",
    safety: "सुरक्षा समीक्षा",
  },

  Odia: {
    title: "SAARTHI Health AI",
    subtitle: "AI ଆଧାରିତ ସ୍ୱାସ୍ଥ୍ୟ ଟ୍ରାଏଜ୍ ସହାୟତା",
    patientInfo: "ରୋଗୀ ସୂଚନା",
    patientId: "ରୋଗୀ ID",
    age: "ବୟସ",
    gender: "ଲିଙ୍ଗ",
    language: "ଭାଷା",
    symptoms: "ଲକ୍ଷଣ",
    duration: "ଲକ୍ଷଣର ସମୟ",
    analyze: "ଟ୍ରାଏଜ୍ ବିଶ୍ଳେଷଣ",
    aiAnalyze: "AI ସୂଚନା ବିଶ୍ଳେଷଣ",
    clear: "ୱର୍କସ୍ପେସ୍ ସଫା କରନ୍ତୁ",
    voice: "ଭଏସ୍ ଇନପୁଟ୍",
    listening: "ଶୁଣୁଛି...",
    extraction: "AI ସୂଚନା ନିଷ୍କର୍ଷଣ",
    report: "ମେଡିକାଲ୍ ରିପୋର୍ଟ",
    upload: "ରିପୋର୍ଟ ଅପଲୋଡ୍",
    result: "ଟ୍ରାଏଜ୍ ଫଳାଫଳ",
    urgency: "ଜରୁରୀ ସଙ୍କେତ",
    missing: "ଆବଶ୍ୟକ ସୂଚନା",
    followUp: "ପରବର୍ତ୍ତୀ ପ୍ରଶ୍ନ",
    humanReview: "ମାନବ ସମୀକ୍ଷା",
    safety: "ସୁରକ୍ଷା ସମୀକ୍ଷା",
  },
};

function App() {
  const [patientId, setPatientId] = useState("");
  const [age, setAge] = useState("");
  const [gender, setGender] = useState("Male");
  const [language, setLanguage] = useState("English");

  const [symptoms, setSymptoms] = useState("");
  const [duration, setDuration] = useState("");

  const [selectedFile, setSelectedFile] = useState(null);

  const [loading, setLoading] = useState(false);
  const [reportLoading, setReportLoading] = useState(false);
  const [aiAnalysisLoading, setAiAnalysisLoading] =
    useState(false);
  const [translationLoading, setTranslationLoading] =
    useState(false);

  const [isListening, setIsListening] = useState(false);

  const [result, setResult] = useState(null);
  const [reportResult, setReportResult] = useState(null);
  const [extractedPatient, setExtractedPatient] =
    useState(null);
  const [translationResult, setTranslationResult] =
    useState(null);
  const [aiAnalysisResult, setAiAnalysisResult] =
    useState(null);

  const [error, setError] = useState("");

  // ==========================================
  // Backend Status
  // ==========================================

  const [backendStatus, setBackendStatus] =
    useState("checking");

  const content =
    languageContent[language] ||
    languageContent.English;

  // ==========================================
  // Backend Connection Check
  // ==========================================

  const checkBackendStatus = async () => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/health`
      );

      if (!response.ok) {
        throw new Error("Backend unavailable");
      }

      const data = await response.json();

      if (data.status === "healthy") {
        setBackendStatus("connected");
      } else {
        setBackendStatus("error");
      }
    } catch (error) {
      console.error(
        "Backend status error:",
        error
      );

      setBackendStatus("error");
    }
  };

  useEffect(() => {
    checkBackendStatus();

    const interval = setInterval(
      checkBackendStatus,
      15000
    );

    return () => {
      clearInterval(interval);
    };
  }, []);

  // ==========================================
  // Language Code
  // ==========================================

  const getLanguageCode = () => {
    if (language === "Hindi") {
      return "hi";
    }

    if (language === "Odia") {
      return "or";
    }

    return "en";
  };

  // ==========================================
  // Voice Input
  // ==========================================

  const startVoiceInput = () => {
    setError("");

    const SpeechRecognition =
      window.SpeechRecognition ||
      window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setError(
        "Speech recognition is not supported in this browser."
      );

      return;
    }

    const recognition =
      new SpeechRecognition();

    recognition.lang =
      language === "Hindi"
        ? "hi-IN"
        : language === "Odia"
        ? "or-IN"
        : "en-IN";

    recognition.continuous = false;
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = async (event) => {
      const transcript =
        event.results[0][0].transcript;

      setSymptoms((previous) =>
        previous
          ? `${previous} ${transcript}`
          : transcript
      );

      setIsListening(false);

      try {
        await fetch(
          `${API_BASE_URL}/patient/speech`,
          {
            method: "POST",
            headers: {
              "Content-Type":
                "application/json",
            },
            body: JSON.stringify({
              language:
                getLanguageCode(),
              audio_filename: null,
            }),
          }
        );
      } catch {
        // Browser voice input remains usable.
      }
    };

    recognition.onerror = () => {
      setIsListening(false);

      setError(
        "Voice input could not be processed."
      );
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // ==========================================
  // AI Patient Extraction
  // ==========================================

  const extractPatientInformation =
    async (text) => {
      try {
        const response = await fetch(
          `${API_BASE_URL}/patient/extract`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              text,
            }),
          }
        );

        if (!response.ok) {
          throw new Error(
            "Patient extraction failed."
          );
        }

        const data =
          await response.json();

        const extracted =
          data.extracted_information;

        setExtractedPatient(
          extracted
        );

        if (extracted?.patient_id) {
          setPatientId(
            extracted.patient_id
          );
        }

        if (
          extracted?.age !== null &&
          extracted?.age !== undefined
        ) {
          setAge(
            String(extracted.age)
          );
        }

        if (extracted?.gender) {
          setGender(
            extracted.gender
          );
        }

        if (extracted?.duration) {
          setDuration(
            extracted.duration
          );
        }

        return extracted;
      } catch (err) {
        console.error(err);

        return null;
      }
    };

  // ==========================================
  // REAL AI INFORMATION ANALYSIS
  // ==========================================

  const handleAIAnalysis = async () => {
    setError("");
    setAiAnalysisResult(null);

    if (!symptoms.trim()) {
      setError(
        "Please enter patient symptoms before AI analysis."
      );

      return;
    }

    setAiAnalysisLoading(true);

    try {
      const combinedText = `
Patient ID: ${patientId || "Not provided"}
Age: ${age || "Not provided"}
Gender: ${gender || "Not provided"}
Language: ${language}
Symptoms: ${symptoms}
Duration: ${duration || "Not provided"}
      `.trim();

      const response = await fetch(
        `${API_BASE_URL}/patient/ai-analysis`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            text: combinedText,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          "AI analysis request failed."
        );
      }

      const data =
        await response.json();

      setAiAnalysisResult(data);
    } catch (err) {
      console.error(
        "AI analysis error:",
        err
      );

      setError(
        "Unable to process AI information analysis."
      );
    } finally {
      setAiAnalysisLoading(false);
    }
  };

  // ==========================================
  // Translation
  // ==========================================

  const handleTranslation = async () => {
    if (!symptoms.trim()) {
      setError(
        "Please enter symptoms before translation."
      );

      return;
    }

    setError("");
    setTranslationResult(null);
    setTranslationLoading(true);

    try {
      const sourceLanguage =
        language === "Hindi"
          ? "hi"
          : language === "Odia"
          ? "or"
          : "en";

      const targetLanguage = "en";

      const response = await fetch(
        `${API_BASE_URL}/patient/translate`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            text: symptoms.trim(),
            source_language:
              sourceLanguage,
            target_language:
              targetLanguage,
          }),
        }
      );

      if (!response.ok) {
        throw new Error(
          `Translation request failed: ${response.status}`
        );
      }

      const data =
        await response.json();

      console.log(
        "Translation response:",
        data
      );

      if (
        data.status === "success" ||
        data.status === "fallback"
      ) {
        setTranslationResult(data);
      } else {
        throw new Error(
          data.message ||
            "Translation failed."
        );
      }
    } catch (err) {
      console.error(
        "Translation error:",
        err
      );

      setError(
        "Translation service is currently unavailable."
      );
    } finally {
      setTranslationLoading(false);
    }
  };

  // ==========================================
  // Triage Analysis
  // ==========================================

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    if (!patientId.trim()) {
      setError(
        "Please enter Patient ID."
      );

      return;
    }

    if (!symptoms.trim()) {
      setError(
        "Please enter symptoms."
      );

      return;
    }

    if (!duration.trim()) {
      setError(
        "Please enter symptom duration."
      );

      return;
    }

    setLoading(true);

    try {
      const combinedText = `
Patient ID: ${patientId}
Age: ${age}
Gender: ${gender}
Language: ${language}
Symptoms: ${symptoms}
Duration: ${duration}
      `.trim();

      // Step 1: AI extraction
      await extractPatientInformation(
        combinedText
      );

      // Step 2: Report + triage
      let response = null;

      const reportFilePath =
        reportResult?.report_file_path ||
        reportResult?.report?.file_path ||
        reportResult?.file_path;

      if (reportFilePath) {
        response = await fetch(
          `${API_BASE_URL}/triage/analyze-with-report`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              patient_id: patientId,
              symptoms: symptoms,
              duration: duration,
              report_file:
                reportFilePath,
            }),
          }
        );
      }

      // Step 3: Normal triage
      if (!response) {
        response = await fetch(
          `${API_BASE_URL}/triage/analyze-from-text`,
          {
            method: "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify({
              text: combinedText,
            }),
          }
        );
      }

      if (!response.ok) {
        throw new Error(
          "Triage analysis failed."
        );
      }

      const data =
        await response.json();

      setResult(data);
    } catch (err) {
      console.error(err);

      setError(
        "Unable to connect with SAARTHI backend."
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  // Medical Report Upload
  // ==========================================

  const handleReportUpload =
    async () => {
      if (!selectedFile) {
        setError(
          "Please select a medical report."
        );

        return;
      }

      setError("");
      setReportResult(null);
      setReportLoading(true);

      try {
        const formData =
          new FormData();

        formData.append(
          "file",
          selectedFile
        );

        const response = await fetch(
          `${API_BASE_URL}/reports/upload`,
          {
            method: "POST",
            body: formData,
          }
        );

        if (!response.ok) {
          throw new Error(
            "Report upload failed."
          );
        }

        const data =
          await response.json();

        setReportResult(data);
      } catch (err) {
        console.error(err);

        setError(
          "Unable to process the medical report."
        );
      } finally {
        setReportLoading(false);
      }
    };

  // ==========================================
  // Clear Workspace
  // ==========================================

  const clearWorkspace = () => {
    setPatientId("");
    setAge("");
    setGender("Male");
    setLanguage("English");

    setSymptoms("");
    setDuration("");

    setSelectedFile(null);

    setResult(null);
    setReportResult(null);
    setExtractedPatient(null);
    setTranslationResult(null);
    setAiAnalysisResult(null);

    setError("");
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">

      {/* ======================================
          Header
      ====================================== */}

      <header className="sticky top-0 z-50 border-b bg-white/95 backdrop-blur">

        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <div>
            <h1 className="text-2xl font-bold">
              🩺 {content.title}
            </h1>

            <p className="text-sm text-slate-500">
              {content.subtitle}
            </p>
          </div>

          <div className="flex items-center gap-3">

            <div
              className={`hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold sm:flex ${
                backendStatus ===
                "connected"
                  ? "bg-green-100 text-green-700"
                  : backendStatus ===
                    "checking"
                  ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
              }`}
            >

              <span
                className={`h-2.5 w-2.5 rounded-full ${
                  backendStatus ===
                  "connected"
                    ? "bg-green-500"
                    : backendStatus ===
                      "checking"
                    ? "bg-amber-500"
                    : "bg-red-500"
                }`}
              />

              {backendStatus ===
              "connected"
                ? "Backend Connected"
                : backendStatus ===
                  "checking"
                ? "Checking..."
                : "Backend Offline"}
            </div>

            <select
              value={language}
              onChange={(e) => {
                setLanguage(
                  e.target.value
                );
                setTranslationResult(
                  null
                );
              }}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >

              <option>
                English
              </option>

              <option>
                Hindi
              </option>

              <option>
                Odia
              </option>

            </select>

            <button
              type="button"
              onClick={
                clearWorkspace
              }
              className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium hover:bg-slate-100"
            >
              {content.clear}
            </button>

          </div>

        </div>

      </header>

      {/* ======================================
          Main
      ====================================== */}

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* Hero */}

        <section className="mb-8 rounded-3xl bg-gradient-to-r from-slate-900 to-blue-900 p-8 text-white shadow-lg">

          <p className="mb-3 text-sm font-semibold uppercase tracking-wider text-blue-200">
            Smart AI-Assisted Triage
          </p>

          <h2 className="text-4xl font-bold leading-tight">
            AI organizes.
            <br />
            Healthcare professionals decide.
          </h2>

          <p className="mt-4 max-w-2xl text-slate-300">
            SAARTHI converts patient symptoms,
            voice input and medical reports
            into a structured review-ready
            triage summary.
          </p>

          <div
            className={`mt-5 inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold sm:hidden ${
              backendStatus ===
              "connected"
                ? "bg-green-500/20 text-green-200"
                : backendStatus ===
                  "checking"
                ? "bg-amber-500/20 text-amber-200"
                : "bg-red-500/20 text-red-200"
            }`}
          >

            <span className="h-2.5 w-2.5 rounded-full bg-current" />

            {backendStatus ===
            "connected"
              ? "Backend Connected"
              : backendStatus ===
                "checking"
              ? "Checking Backend..."
              : "Backend Offline"}
          </div>

        </section>

        {/* Error */}

        {error && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-700">
            ⚠️ {error}
          </div>
        )}

        {/* ======================================
            Patient + Extraction
        ====================================== */}

        <div className="grid gap-6 lg:grid-cols-2">

          {/* Patient Information */}

          <section className="rounded-2xl border bg-white p-6 shadow-sm">

            <div className="mb-6">

              <h3 className="text-xl font-bold">
                {content.patientInfo}
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Enter or collect patient information.
              </p>

            </div>

            <form
              onSubmit={
                handleSubmit
              }
              className="space-y-5"
            >

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  {content.patientId}
                </label>

                <input
                  value={patientId}
                  onChange={(e) =>
                    setPatientId(
                      e.target.value
                    )
                  }
                  placeholder="DEMO-001"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    {content.age}
                  </label>

                  <input
                    type="number"
                    value={age}
                    onChange={(e) =>
                      setAge(
                        e.target.value
                      )
                    }
                    placeholder="25"
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                  />

                </div>

                <div>

                  <label className="mb-2 block text-sm font-semibold">
                    {content.gender}
                  </label>

                  <select
                    value={gender}
                    onChange={(e) =>
                      setGender(
                        e.target.value
                      )
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3"
                  >

                    <option>
                      Male
                    </option>

                    <option>
                      Female
                    </option>

                    <option>
                      Other
                    </option>

                  </select>

                </div>

              </div>

              <div>

                <div className="mb-2 flex items-center justify-between">

                  <label className="text-sm font-semibold">
                    {content.symptoms}
                  </label>

                  <button
                    type="button"
                    onClick={
                      startVoiceInput
                    }
                    className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                      isListening
                        ? "bg-red-100 text-red-700"
                        : "bg-blue-100 text-blue-700"
                    }`}
                  >

                    🎙️{" "}

                    {isListening
                      ? content.listening
                      : content.voice}

                  </button>

                </div>

                <textarea
                  rows="5"
                  value={symptoms}
                  onChange={(e) =>
                    setSymptoms(
                      e.target.value
                    )
                  }
                  placeholder="Describe the patient's symptoms..."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              <div>

                <label className="mb-2 block text-sm font-semibold">
                  {content.duration}
                </label>

                <input
                  value={duration}
                  onChange={(e) =>
                    setDuration(
                      e.target.value
                    )
                  }
                  placeholder="2 days"
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500"
                />

              </div>

              <div className="flex flex-wrap gap-3">

                <button
                  type="submit"
                  disabled={
                    loading ||
                    backendStatus ===
                      "error"
                  }
                  className="rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {loading
                    ? "Analyzing..."
                    : content.analyze}

                </button>

                <button
                  type="button"
                  onClick={
                    handleAIAnalysis
                  }
                  disabled={
                    aiAnalysisLoading ||
                    backendStatus ===
                      "error"
                  }
                  className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-700 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {aiAnalysisLoading
                    ? "AI Processing..."
                    : `🤖 ${content.aiAnalyze}`}

                </button>

                <button
                  type="button"
                  onClick={
                    handleTranslation
                  }
                  disabled={
                    translationLoading ||
                    backendStatus ===
                      "error"
                  }
                  className="rounded-xl border border-blue-300 px-6 py-3 font-semibold text-blue-700 hover:bg-blue-50 disabled:cursor-not-allowed disabled:opacity-60"
                >

                  {translationLoading
                    ? "Translating..."
                    : "🌐 Translate"}

                </button>

              </div>

            </form>

          </section>

          {/* AI Extraction */}

          <section className="rounded-2xl border bg-white p-6 shadow-sm">

            <h3 className="text-xl font-bold">
              {content.extraction}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Structured information detected
              from patient input.
            </p>

            {extractedPatient ? (

              <div className="mt-5 space-y-3">

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs text-slate-500">
                    Patient ID
                  </p>

                  <p className="font-semibold">
                    {extractedPatient.patient_id ||
                      "Not detected"}
                  </p>

                </div>

                <div className="grid grid-cols-2 gap-3">

                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="text-xs text-slate-500">
                      Age
                    </p>

                    <p className="font-semibold">
                      {extractedPatient.age ??
                        "Not detected"}
                    </p>

                  </div>

                  <div className="rounded-xl bg-slate-50 p-4">

                    <p className="text-xs text-slate-500">
                      Gender
                    </p>

                    <p className="font-semibold">
                      {extractedPatient.gender ||
                        "Not detected"}
                    </p>

                  </div>

                </div>

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs text-slate-500">
                    Symptoms
                  </p>

                  <div className="mt-2 flex flex-wrap gap-2">

                    {extractedPatient.symptoms?.length ? (

                      extractedPatient.symptoms.map(
                        (item, index) => (

                          <span
                            key={index}
                            className="rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700"
                          >
                            {item}
                          </span>

                        )
                      )

                    ) : (

                      <span className="text-sm text-slate-500">
                        No symptoms detected
                      </span>

                    )}

                  </div>

                </div>

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs text-slate-500">
                    Duration
                  </p>

                  <p className="font-semibold">
                    {extractedPatient.duration ||
                      "Not detected"}
                  </p>

                </div>

              </div>

            ) : (

              <div className="mt-5 rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">
                Patient information will appear here after analysis.
              </div>

            )}

          </section>

        </div>

        {/* ======================================
            AI Analysis Result
        ====================================== */}

        {aiAnalysisResult && (

          <section className="mt-6 rounded-2xl border border-purple-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

              <div>

                <h3 className="text-2xl font-bold text-purple-900">
                  🤖 AI Information Analysis
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  AI-generated organization of the
                  reported patient information.
                </p>

              </div>

              <div className="rounded-full bg-green-100 px-4 py-2 text-xs font-semibold text-green-700">
                ✓ AI Model:{" "}
                {aiAnalysisResult.model ||
                  "Available"}
              </div>

            </div>

            <div className="mt-6 grid gap-5 md:grid-cols-3">

              <div className="rounded-xl bg-purple-50 p-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-purple-600">
                  Model Status
                </p>

                <p className="mt-2 font-bold text-purple-900">
                  {aiAnalysisResult.model_status ||
                    "Unknown"}
                </p>

              </div>

              <div className="rounded-xl bg-blue-50 p-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  Human Review
                </p>

                <p className="mt-2 font-bold text-blue-900">
                  {aiAnalysisResult.human_review ||
                    "Required"}
                </p>

              </div>

              <div className="rounded-xl bg-amber-50 p-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-amber-600">
                  Safety
                </p>

                <p className="mt-2 font-bold text-amber-900">
                  Non-diagnostic
                </p>

              </div>

            </div>

            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-5">

              <h4 className="font-bold">
                AI Generated Summary
              </h4>

              <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-700">
                {aiAnalysisResult.ai_summary ||
                  "No AI summary generated."}
              </p>

            </div>

            <div className="mt-5 rounded-xl border border-amber-200 bg-amber-50 p-4">

              <p className="text-sm font-semibold text-amber-800">
                ⚠️ Human Review Required
              </p>

              <p className="mt-1 text-xs leading-5 text-amber-700">
                {aiAnalysisResult.disclaimer ||
                  "AI output is for healthcare information organization only. It does not provide diagnosis, treatment or medical advice."}
              </p>

            </div>

          </section>

        )}

        {/* ======================================
            Translation
        ====================================== */}

        {translationResult && (

          <section className="mt-6 rounded-2xl border border-blue-200 bg-white p-6 shadow-sm">

            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">

              <div>

                <h3 className="text-xl font-bold">
                  🌐 Translation
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Communication-support translation
                  for professional review.
                </p>

              </div>

              <span
                className={`rounded-full px-4 py-2 text-xs font-semibold ${
                  translationResult.status ===
                  "success"
                    ? "bg-green-100 text-green-700"
                    : "bg-amber-100 text-amber-700"
                }`}
              >
                {translationResult.status ===
                "success"
                  ? "✓ Translation Available"
                  : "⚠️ Fallback"}
              </span>

            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">

              <div className="rounded-xl bg-slate-50 p-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Original Text
                </p>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-slate-800">
                  {symptoms}
                </p>

              </div>

              <div className="rounded-xl bg-blue-50 p-5">

                <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                  English Translation
                </p>

                <p className="mt-3 whitespace-pre-wrap text-sm font-semibold leading-7 text-blue-900">
                  {translationResult.translated_text ||
                    "No translated text available."}
                </p>

              </div>

            </div>

            <div className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-4">

              <p className="text-xs leading-5 text-amber-700">
                ⚠️ Translation is provided for
                communication support. Final clinical
                interpretation requires qualified
                healthcare professional review.
              </p>

            </div>

          </section>

        )}

        {/* ======================================
            Medical Report
        ====================================== */}

        <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">

          <h3 className="text-xl font-bold">
            📄 {content.report}
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Upload a PDF, TXT, PNG or JPG medical report.
          </p>

          <div className="mt-5 flex flex-col gap-4 md:flex-row md:items-center">

            <input
              type="file"
              accept=".pdf,.txt,.png,.jpg,.jpeg"
              onChange={(e) => {
                setSelectedFile(
                  e.target.files?.[0] ||
                    null
                );

                setReportResult(null);
                setResult(null);
              }}
              className="block w-full rounded-xl border border-slate-300 p-3 text-sm"
            />

            <button
              type="button"
              onClick={
                handleReportUpload
              }
              disabled={
                reportLoading ||
                !selectedFile ||
                backendStatus ===
                  "error"
              }
              className="rounded-xl bg-slate-900 px-6 py-3 font-semibold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
            >

              {reportLoading
                ? "Processing..."
                : content.upload}

            </button>

          </div>

          {reportResult && (

            <div className="mt-6">

              <div className="grid gap-4 md:grid-cols-3">

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs text-slate-500">
                    File
                  </p>

                  <p className="mt-1 break-all font-semibold">
                    {reportResult.filename ||
                      reportResult.report?.filename ||
                      selectedFile?.name ||
                      "Uploaded report"}
                  </p>

                </div>

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs text-slate-500">
                    Extracted Values
                  </p>

                  {Object.keys(
                    reportResult.report?.lab_values ||
                      {}
                  ).length > 0 ? (

                    <div className="mt-2 space-y-2">

                      {Object.entries(
                        reportResult.report?.lab_values ||
                          {}
                      ).map(
                        ([key, value]) => (

                          <div
                            key={key}
                            className="flex justify-between gap-3 border-b border-slate-200 pb-2 text-sm last:border-0"
                          >

                            <span className="capitalize text-slate-600">
                              {key.replaceAll(
                                "_",
                                " "
                              )}
                            </span>

                            <span className="font-semibold">
                              {value}
                            </span>

                          </div>

                        )
                      )}

                    </div>

                  ) : (

                    <p className="mt-2 text-sm text-slate-500">
                      No structured values detected.
                    </p>

                  )}

                </div>

                <div className="rounded-xl bg-slate-50 p-4">

                  <p className="text-xs text-slate-500">
                    Summary
                  </p>

                  <p className="mt-1 text-sm">
                    {reportResult.report?.summary ||
                      "No summary available."}
                  </p>

                </div>

              </div>

              <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4">

                <p className="text-sm font-semibold text-green-800">
                  ✓ Medical report processed successfully
                </p>

                <p className="mt-1 text-xs text-green-700">
                  The report is now available for
                  triage analysis and reviewer assessment.
                </p>

              </div>

            </div>

          )}

        </section>

        {/* ======================================
            Triage Result
        ====================================== */}

        {result && (

          <section className="mt-6 rounded-2xl border bg-white p-6 shadow-sm">

            <h3 className="text-2xl font-bold">
              🧠 {content.result}
            </h3>

            <p className="mt-1 text-sm text-slate-500">
              Structured triage support output
              for professional review.
            </p>

            <div className="mb-5 mt-6 rounded-xl bg-slate-50 p-5">

              <h4 className="font-bold">
                Patient Summary
              </h4>

              <div className="mt-3 grid gap-3 md:grid-cols-4">

                <div>

                  <p className="text-xs text-slate-500">
                    Patient ID
                  </p>

                  <p className="font-semibold">
                    {result.patient_id ||
                      patientId}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-slate-500">
                    Symptoms
                  </p>

                  <p className="font-semibold">
                    {result.triage?.reported_symptoms ||
                      symptoms}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-slate-500">
                    Duration
                  </p>

                  <p className="font-semibold">
                    {result.triage?.symptom_duration ||
                      duration}
                  </p>

                </div>

                <div>

                  <p className="text-xs text-slate-500">
                    Review
                  </p>

                  <p className="font-semibold text-blue-700">
                    Required
                  </p>

                </div>

              </div>

            </div>

            {result.report && (

              <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-5">

                <h4 className="font-bold">
                  📄 Report Information
                </h4>

                <div className="mt-3 grid gap-3 md:grid-cols-2">

                  <div>

                    <p className="text-xs text-slate-500">
                      Report File
                    </p>

                    <p className="font-semibold">
                      {result.report.filename ||
                        "Medical report"}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs text-slate-500">
                      Report Summary
                    </p>

                    <p className="text-sm">
                      {result.report.summary ||
                        "No report summary available."}
                    </p>

                  </div>

                </div>

              </div>

            )}

            <div
              className={`rounded-xl p-5 ${
                result.triage?.urgency_signal
                  ? "border border-red-200 bg-red-50"
                  : "border border-green-200 bg-green-50"
              }`}
            >

              <h4 className="font-bold">
                🚨 {content.urgency}
              </h4>

              <p className="mt-2 font-medium">
                {result.triage?.message ||
                  "Professional review required."}
              </p>

              {result.triage?.matched_safety_signals
                ?.length > 0 && (

                <div className="mt-3 flex flex-wrap gap-2">

                  {result.triage.matched_safety_signals.map(
                    (signal, index) => (

                      <span
                        key={index}
                        className="rounded-full bg-red-100 px-3 py-1 text-xs font-semibold text-red-700"
                      >
                        {signal}
                      </span>

                    )
                  )}

                </div>

              )}

            </div>

            <div className="mt-5 grid gap-5 md:grid-cols-2">

              <div className="rounded-xl border p-5">

                <h4 className="font-bold">
                  ❓ {content.missing}
                </h4>

                {result.triage?.missing_information
                  ?.length ? (

                  <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">

                    {result.triage.missing_information.map(
                      (item, index) => (

                        <li key={index}>
                          {item}
                        </li>

                      )
                    )}

                  </ul>

                ) : (

                  <p className="mt-3 text-sm text-green-700">
                    No required information is
                    currently missing.
                  </p>

                )}

              </div>

              <div className="rounded-xl border p-5">

                <h4 className="font-bold">
                  💬 {content.followUp}
                </h4>

                <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">

                  {result.triage?.suggested_follow_up_questions
                    ?.map(
                      (question, index) => (

                        <li key={index}>
                          {question}
                        </li>

                      )
                    )}

                </ul>

              </div>

            </div>

            <div className="mt-5 rounded-xl bg-amber-50 p-5">

              <h4 className="font-bold">
                🛡️ {content.safety}
              </h4>

              <p className="mt-2 text-sm">

                {result.safety?.review_required
                  ? "Qualified healthcare professional review is required."
                  : "Review status unavailable."}

              </p>

            </div>

            <div className="mt-5 rounded-xl bg-blue-50 p-5">

              <h4 className="font-bold">
                👨‍⚕️ {content.humanReview}
              </h4>

              <p className="mt-2 text-sm">
                SAARTHI does not make the final
                clinical decision. The generated
                information must be reviewed by a
                qualified healthcare professional.
              </p>

            </div>

          </section>

        )}

        {/* ======================================
            Reviewer Dashboard
        ====================================== */}

        <ReviewerDashboard
          result={result}
          reportResult={reportResult}
        />

        {/* ======================================
            Privacy & Responsible AI
        ====================================== */}

        <section className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50 p-6 shadow-sm">

          <h3 className="text-xl font-bold text-emerald-900">
            🔒 Privacy & Responsible AI
          </h3>

          <p className="mt-1 text-sm text-emerald-700">
            SAARTHI is designed as a human-in-the-loop
            healthcare triage support system.
          </p>

          <div className="mt-5 grid gap-4 md:grid-cols-2">

            <div className="rounded-xl bg-white p-4">

              <p className="font-semibold text-emerald-900">
                🧪 Synthetic Demo Data
              </p>

              <p className="mt-1 text-sm text-slate-600">
                This prototype uses synthetic/demo patient
                information for testing and demonstration.
              </p>

            </div>

            <div className="rounded-xl bg-white p-4">

              <p className="font-semibold text-emerald-900">
                👨‍⚕️ Human Review Required
              </p>

              <p className="mt-1 text-sm text-slate-600">
                AI-generated information must be reviewed by
                a qualified healthcare professional.
              </p>

            </div>

            <div className="rounded-xl bg-white p-4">

              <p className="font-semibold text-emerald-900">
                🚫 Non-Diagnostic
              </p>

              <p className="mt-1 text-sm text-slate-600">
                SAARTHI does not diagnose diseases, prescribe
                medicines, or make final clinical decisions.
              </p>

            </div>

            <div className="rounded-xl bg-white p-4">

              <p className="font-semibold text-emerald-900">
                🛡️ Data Minimization
              </p>

              <p className="mt-1 text-sm text-slate-600">
                Only necessary patient information should be
                collected and handled responsibly.
              </p>

            </div>

          </div>

        </section>

        {/* ======================================
            Footer
        ====================================== */}

        <footer className="mt-10 border-t pt-6 text-center">

          <p className="text-sm font-semibold text-slate-700">
            SAARTHI Health AI
          </p>

          <p className="mt-1 text-xs text-slate-500">
            AI organizes. Healthcare professionals decide.
          </p>

          <p className="mt-3 text-xs text-slate-400">
            Prototype for healthcare triage support.
            Not a diagnostic or treatment system.
          </p>

        </footer>

      </main>

    </div>
  );
}

export default App;