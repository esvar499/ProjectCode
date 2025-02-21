let chartInstance = null;

function predictHeartDisease() {
    let name = document.getElementById("name").value.trim();
    let age = parseInt(document.getElementById("age").value);
    let height = parseInt(document.getElementById("height").value);
    let weight = parseInt(document.getElementById("weight").value);
    let cholesterol = parseInt(document.getElementById("cholesterol").value);
    let bp = parseInt(document.getElementById("bp").value);
    let heartRate = parseInt(document.getElementById("heartRate").value);
    let isSmoker = document.getElementById("smoking").checked ? 1 : 0;
    let hasDiabetes = document.getElementById("diabetes").checked ? 1 : 0;
    let exercise = parseInt(document.getElementById("exercise").value);

    if (!name || isNaN(age) || isNaN(height) || isNaN(weight) || isNaN(cholesterol) || isNaN(bp) || isNaN(heartRate)) {
        alert("Please fill all fields correctly.");
        return;
    }

    let bmi = (weight / ((height / 100) ** 2)).toFixed(1);
    let probability = 1 / (1 + Math.exp(-0.05 * age - 0.02 * cholesterol - 0.04 * bp + 0.05 * bmi - 0.03 * heartRate - 0.1 * exercise + 0.2 * isSmoker + 0.3 * hasDiabetes + 5));
    let riskLevel = probability * 100;
    let prediction = probability > 0.5 ? "High Risk of Heart Disease" : "Low Risk of Heart Disease";

    document.getElementById("patient-name").innerText = name;
    document.getElementById("result").innerText = `Risk: ${riskLevel.toFixed(1)}% - ${prediction}`;
    document.getElementById("risk-bar").value = riskLevel;

    let progressBar = document.getElementById("risk-bar");
    progressBar.style.backgroundColor = riskLevel > 50 ? "red" : "green";

    saveHistory(name, riskLevel.toFixed(1), prediction);
    renderChart(probability);
}

function renderChart(probability) {
    let ctx = document.getElementById("predictionChart").getContext("2d");

    if (chartInstance) {
        chartInstance.destroy();
    }

    chartInstance = new Chart(ctx, {
        type: "doughnut",
        data: {
            labels: ["Risk", "No Risk"],
            datasets: [{
                data: [probability * 100, (1 - probability) * 100],
                backgroundColor: ["#FF4C4C", "#4CAF50"],
                borderWidth: 0
            }]
        }
    });
}

function saveHistory(name, risk, prediction) {
    let history = JSON.parse(localStorage.getItem("heartRiskHistory")) || [];
    history.push({ name, risk, prediction });
    localStorage.setItem("heartRiskHistory", JSON.stringify(history));
}

function viewHistory() {
    let history = JSON.parse(localStorage.getItem("heartRiskHistory")) || [];
    alert(history.map(h => `${h.name}: ${h.risk}% - ${h.prediction}`).join("\n"));
}

function downloadReport() {
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF();

    let name = document.getElementById("name").value.trim();
    let age = document.getElementById("age").value;
    let height = document.getElementById("height").value;
    let weight = document.getElementById("weight").value;
    let cholesterol = document.getElementById("cholesterol").value;
    let bp = document.getElementById("bp").value;
    let heartRate = document.getElementById("heartRate").value;
    let exercise = document.getElementById("exercise").options[document.getElementById("exercise").selectedIndex].text;
    let smoking = document.getElementById("smoking").checked ? "Yes" : "No";
    let diabetes = document.getElementById("diabetes").checked ? "Yes" : "No";
    let riskResult = document.getElementById("result").innerText;

    doc.setFontSize(18);
    doc.text("Heart Disease Risk Report", 10, 10);

    doc.setFontSize(12);
    doc.text(`Patient Name: ${name}`, 10, 20);
    doc.text(`Age: ${age} years`, 10, 30);
    doc.text(`Height: ${height} cm`, 10, 40);
    doc.text(`Weight: ${weight} kg`, 10, 50);
    doc.text(`Cholesterol: ${cholesterol} mg/dL`, 10, 60);
    doc.text(`Blood Pressure: ${bp} mmHg`, 10, 70);
    doc.text(`Resting Heart Rate: ${heartRate} bpm`, 10, 80);
    doc.text(`Exercise Frequency: ${exercise}`, 10, 90);
    doc.text(`Smoker: ${smoking}`, 10, 100);
    doc.text(`Diabetic: ${diabetes}`, 10, 110);

    doc.setFontSize(14);
    doc.text("Risk Assessment:", 10, 130);
    doc.text(riskResult, 10, 140);

    doc.setFontSize(10);
    doc.text("Disclaimer: This tool provides a simplified risk assessment and is not a substitute for professional medical advice.", 10, 160);

    doc.save(`${name}_HeartRiskReport.pdf`);
}
