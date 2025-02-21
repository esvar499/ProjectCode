let chartInstance = null;

function predictHeartDisease() {
    let name = document.getElementById("name").value.trim();
    let age = parseInt(document.getElementById("age").value);
    let height = parseInt(document.getElementById("height").value);
    let weight = parseInt(document.getElementById("weight").value);
    let cholesterol = parseInt(document.getElementById("cholesterol").value);
    let systolic = parseInt(document.getElementById("bp-systolic").value);
    let diastolic = parseInt(document.getElementById("bp-diastolic").value);
    let heartRate = parseInt(document.getElementById("heartRate").value);
    let isSmoker = document.getElementById("smoking").checked ? 1 : 0;
    let hasDiabetes = document.getElementById("diabetes").checked ? 1 : 0;
    let exercise = parseInt(document.getElementById("exercise").value);

    if (!name || isNaN(age) || isNaN(height) || isNaN(weight) || isNaN(cholesterol) || isNaN(systolic) || isNaN(diastolic) || isNaN(heartRate)) {
        alert("⚠️ Please fill all fields correctly.");
        return;
    }

    let bmi = (weight / ((height / 100) ** 2)).toFixed(1);
    let bpAvg = (systolic + diastolic) / 2;

    let probability = 1 / (1 + Math.exp(-(
        0.04 * age + 0.02 * cholesterol + 0.03 * bpAvg + 0.05 * bmi - 
        0.04 * heartRate - 0.08 * exercise + 0.25 * isSmoker + 0.35 * hasDiabetes - 3
    )));

    let riskLevel = (probability * 100).toFixed(1);
    let prediction = probability > 0.5 ? "🔴 High Risk of Heart Disease" : "🟢 Low Risk of Heart Disease";

    document.getElementById("patient-name").innerText = name;
    document.getElementById("result").innerHTML = `<strong>Risk:</strong> ${riskLevel}% - ${prediction}`;
    
    saveHistory(name, riskLevel, prediction);
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
                data: [probability * 100, 100 - (probability * 100)],
                backgroundColor: ["#FF4C4C", "#4CAF50"],
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    display: true,
                    position: "bottom"
                }
            }
        }
    });
}

function saveHistory(name, risk, prediction) {
    let history = JSON.parse(localStorage.getItem("heartRiskHistory")) || [];
    history.push({ name, risk, prediction, date: new Date().toLocaleString() });
    localStorage.setItem("heartRiskHistory", JSON.stringify(history));
}

function downloadReport() {
    const { jsPDF } = window.jspdf;
    let doc = new jsPDF({ format: "a4" });

    let name = document.getElementById("name").value.trim();
    let age = document.getElementById("age").value;
    let height = document.getElementById("height").value;
    let weight = document.getElementById("weight").value;
    let cholesterol = document.getElementById("cholesterol").value;
    let systolic = document.getElementById("bp-systolic").value;
    let diastolic = document.getElementById("bp-diastolic").value;
    let heartRate = document.getElementById("heartRate").value;
    let exercise = document.getElementById("exercise").options[document.getElementById("exercise").selectedIndex].text;
    let smoking = document.getElementById("smoking").checked ? "Yes" : "No";
    let diabetes = document.getElementById("diabetes").checked ? "Yes" : "No";
    let riskResult = document.getElementById("result").innerText;

    doc.setFontSize(18);
    doc.text("Heart Disease Risk Report", 105, 20, null, null, "center");
    doc.setFontSize(12);
    
    let data = [
        `Patient Name: ${name}`,
        `Age: ${age} years`,
        `Height: ${height} cm`,
        `Weight: ${weight} kg`,
        `Cholesterol: ${cholesterol} mg/dL`,
        `Blood Pressure: ${systolic}/${diastolic} mmHg`,
        `Resting Heart Rate: ${heartRate} bpm`,
        `Exercise Frequency: ${exercise}`,
        `Smoker: ${smoking}`,
        `Diabetic: ${diabetes}`,
        "",
        "Risk Assessment:",
        riskResult,
        "",
        "Disclaimer: This tool provides a simplified risk assessment and is not a substitute for professional medical advice."
    ];

    let y = 30;
    data.forEach(line => {
        doc.text(line, 20, y);
        y += 10;
    });

    doc.save(`${name}_HeartRiskReport.pdf`);
}
