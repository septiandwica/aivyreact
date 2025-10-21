import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";
import { memo } from "react";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Props = { labels: string[]; values: number[]; title?: string };

function BarChartBase({ labels, values, title = "History" }: Props) {
  const data = {
    labels,
    datasets: [
      { label: title, data: values, backgroundColor: "rgba(54,162,235,0.5)" },
    ],
  };
  const options = {
    responsive: true,
    scales: { y: { beginAtZero: true, max: 100 } },
  };
  return <Bar data={data} options={options} />;
}

export default memo(BarChartBase);
