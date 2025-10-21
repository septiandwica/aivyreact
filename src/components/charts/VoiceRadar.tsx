import { Radar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

export default function VoiceRadar({
  confidence = 0,
  positivity = 0,
  empathy = 0,
  title = "Voice Sentiment",
}: {
  confidence?: number;
  positivity?: number;
  empathy?: number;
  title?: string;
}) {
  const data = {
    labels: ["Confidence", "Positivity", "Empathy"],
    datasets: [
      {
        label: title,
        data: [confidence, positivity, empathy],
        backgroundColor: "rgba(37, 99, 235, 0.3)",
        borderColor: "rgba(37, 99, 235, 1)",
        borderWidth: 2,
        pointBackgroundColor: "rgba(37, 99, 235, 1)",
      },
    ],
  };

  const options = {
    scales: {
      r: {
        suggestedMin: 0,
        suggestedMax: 100,
        ticks: { stepSize: 20 },
      },
    },
    plugins: {
      legend: { display: false },
    },
  };

  // @ts-ignore
  return <Radar data={data} options={options} />;
}
