function updateFileName() {
    const scanFileinput = document.querySelector(".scan__fileinput");
    const scanFilename = document.querySelector(".scan__filename");
    const scanAccept = document.querySelector(".scan__accept button");

    const fileSelected = scanFileinput.files.length > 0;

    scanFilename.textContent = fileSelected ? scanFileinput.files[0].name : "No file selected";
    
    scanAccept.classList.toggle("button--general", fileSelected);
    scanAccept.classList.toggle("button--disabled", !fileSelected);
    scanAccept.disabled = !fileSelected;
}

function startLoading() {
    document.querySelector(".scan__loading").classList.replace("display--none", "display--flex");
    document.querySelector(".scan__accept button").classList.add("button--disabled");
}

const analyzeResume = async (file, companyType) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("company_type", companyType);

    try {
        const response = await fetch("http://resume-scan-ai.digital/api/analyze-resume", {
            method: "POST",
            body: formData
        });

        if (!response.ok) {
            window.location.href = "/error.html";
            throw new Error("Error analyzing resume");
        }

        const result = await response.json();
        console.log(result);
        localStorage.setItem('resumeFeedback', JSON.stringify(result));
        window.location.href = "/feedback.html";
    } catch (error) {
        console.error("Error:", error);
    }
};

const loadFeedbackFromLocalStorage = () => {
    const feedbackData = JSON.parse(localStorage.getItem('resumeFeedback'));
    console.log(feedbackData);
    

    if (feedbackData) {
        document.querySelector(".feedback__title").textContent = `${feedbackData.rating}/10`;
        document.querySelector(".feedback__footer h3").textContent = feedbackData.summary;

        const feedbackPlus = document.querySelector(".feedback__plus nav ul");
        const feedbackMinus = document.querySelector(".feedback__minus ul");

        feedbackPlus.innerHTML = feedbackData.strengths
            .map(plus => `<li class="feedback__step"><img src='./img/feedback/plus.svg'><p>${plus}</p></li>`)
            .join('');

        feedbackMinus.innerHTML = feedbackData.weaknesses
            .map(minus => `<li class="feedback__step"><img src='/img/feedback/minus.svg'><p>${minus}</p></li>`)
            .join('');
    } else {
        console.error("No feedback data found");
    }
};

if (window.location.pathname === "/feedback.html") {
    loadFeedbackFromLocalStorage();
} else {
    const scanSubmit = document.querySelector(".scan__submit");
    scanSubmit.addEventListener("click", (e) => {
        e.preventDefault();
        startLoading();

        const scanFileinput = document.querySelector(".scan__fileinput");
        const companyType = document.querySelector('input[name="company_type"]:checked')?.value;
        const file = scanFileinput.files[0];

        if (file && companyType) {
            analyzeResume(file, companyType);
        } else {
            alert("Please select a file and company type.");
        }
    });
}
